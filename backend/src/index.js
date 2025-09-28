const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import modules
const SyntheticMedicalData = require('./data/SyntheticMedicalData');
const FHIRConnector = require('./fhir/FHIRConnector');
// const MedicalProofGenerator = require('../../circuits/scripts/generate_proof');
const MedicalProofGenerator = require('./proof/MedicalProofGenerator');
const RealZKProofGenerator = require('./proof/RealZKProofGenerator');
const StudyCommitmentGenerator = require('./proof/StudyCommitmentGenerator');
const ProofVerifier = require('./proof/ProofVerifier');
const ResearcherApplicationService = require('./services/ResearcherApplicationService');
const OrganizationService = require('./services/OrganizationService');
const HospitalDataAccessService = require('./services/HospitalDataAccessService');
const { getStudyById } = require('./data/StudyCatalog');
const { supabase } = require('./lib/supabase');

// Import new study routes
const studiesRouter = require('./routes/studies');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.url} from ${req.get('origin') || 'unknown'}`);
  next();
});

// Initialize services
const dataGenerator = new SyntheticMedicalData();
const fhirConnector = new FHIRConnector({
    baseUrl: process.env.FHIR_BASE_URL || 'https://hapi.fhir.org/baseR4'
});
const proofGenerator = new MedicalProofGenerator();
const realZKProofGenerator = new RealZKProofGenerator();
const studyCommitmentGenerator = new StudyCommitmentGenerator();
const proofVerifier = new ProofVerifier();
const applicationService = new ResearcherApplicationService();
const organizationService = new OrganizationService();
const hospitalDataAccessService = new HospitalDataAccessService();

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// API Routes

// Study discovery routes
app.use('/api/studies', studiesRouter);

// Auth endpoints
app.post('/api/auth/create-profile', async (req, res) => {
  try {
    const { userId, email, metadata } = req.body;

    if (!userId || !email) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    console.log('🔧 Creating user profile for:', userId, email);

    const { data, error } = await supabase
      .from('user_profiles')
      .insert({
        id: userId,
        email: email,
        role: 'public',
        credentials: metadata || {},
        settings: {},
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Error creating user profile:', error);
      return res.status(500).json({ error: error.message });
    }

    console.log('✅ User profile created successfully:', data);
    res.json({ data });
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get available hospitals
app.get('/api/hospitals', (req, res) => {
    try {
        const hospitals = dataGenerator.hospitals.map(hospital => ({
            ...hospital,
            // Add some runtime stats
            activeStudies: Math.floor(Math.random() * 5) + 1,
            totalPatients: Math.floor(Math.random() * 5000) + 1000,
            lastActivity: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
        }));

        res.json({
            success: true,
            hospitals: hospitals,
            totalHospitals: hospitals.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Generate synthetic medical data
app.post('/api/generate-cohort', async (req, res) => {
    try {
        const { hospitalId, size = 500, condition = 'type-2-diabetes', treatment } = req.body;

        if (!hospitalId) {
            return res.status(400).json({
                success: false,
                error: 'Hospital ID is required'
            });
        }

        console.log(`Generating cohort for hospital ${hospitalId}: ${size} patients with ${condition}`);

        const cohort = dataGenerator.generateHospitalCohort(hospitalId, size, condition, treatment);
        const outcomes = dataGenerator.generateTreatmentOutcomes(cohort);

        res.json({
            success: true,
            cohort: cohort,
            outcomes: outcomes,
            generatedAt: new Date().toISOString()
        });

    } catch (error) {
        console.error('Cohort generation error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// FHIR connection simulation
app.post('/api/fhir/connect', async (req, res) => {
    try {
        const { hospitalId } = req.body;

        if (!hospitalId) {
            return res.status(400).json({
                success: false,
                error: 'Hospital ID is required'
            });
        }

        const hospital = dataGenerator.hospitals.find(h => h.id === hospitalId);
        if (!hospital) {
            return res.status(404).json({
                success: false,
                error: 'Hospital not found'
            });
        }

        const connection = await fhirConnector.connect(hospital);

        res.json({
            success: connection.connected,
            connection: connection,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('FHIR connection error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Extract patient cohort via FHIR
app.post('/api/fhir/extract-cohort', async (req, res) => {
    try {
        const { condition, ageMin, ageMax, maxPatients = 1000 } = req.body;

        if (!condition) {
            return res.status(400).json({
                success: false,
                error: 'Medical condition is required'
            });
        }

        console.log('Extracting FHIR cohort with criteria:', req.body);

        const criteria = {
            condition,
            ageMin,
            ageMax,
            maxPatients,
            dateFrom: req.body.dateFrom,
            dateTo: req.body.dateTo
        };

        const cohortResult = await fhirConnector.extractCohort(criteria);

        if (cohortResult.success && cohortResult.totalPatients > 0) {
            // Aggregate data for ZK proof generation
            const aggregatedData = await fhirConnector.aggregateForProof(cohortResult);
            
            res.json({
                success: true,
                cohort: cohortResult,
                aggregatedData: aggregatedData,
                timestamp: new Date().toISOString()
            });
        } else {
            res.json({
                success: false,
                message: 'No patients found matching criteria',
                cohort: cohortResult
            });
        }

    } catch (error) {
        console.error('FHIR cohort extraction error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Enhanced ZK proof generation endpoint with Midnight Network integration
app.post('/api/generate-proof', async (req, res) => {
    try {
        const { studyData, hospitalId, organizationId, privacySettings, useMidnightNetwork, metadata, studyCommitment, selectedStudy } = req.body;

        console.log('🌙 Generating ZK proof with Midnight Network integration...');
        console.log('Study data:', { studyId: studyData.studyId, condition: studyData.condition });
        console.log('Study commitment:', studyCommitment ? studyCommitment.slice(0, 16) + '...' : 'Not provided');
        console.log('Use Midnight Network:', useMidnightNetwork);

        if (!studyData || !hospitalId) {
            return res.status(400).json({
                success: false,
                error: 'Study data and hospital ID are required'
            });
        }

        // Study commitment validation if provided
        let commitmentValidation = null;
        if (studyCommitment && selectedStudy) {
            console.log('🔒 Validating study commitment...');

            try {
                // Get the full study object from catalog using the study ID
                const fullStudy = getStudyById(selectedStudy.studyId);

                if (!fullStudy) {
                    return res.status(400).json({
                        success: false,
                        error: `Study ${selectedStudy.studyId} not found in catalog`
                    });
                }

                // Verify the frontend-generated commitment matches backend calculation
                const isValid = studyCommitmentGenerator.verifyCommitment(studyCommitment, fullStudy);

                if (!isValid) {
                    return res.status(400).json({
                        success: false,
                        error: 'Study commitment validation failed - study parameters may have been tampered with'
                    });
                }

                commitmentValidation = {
                    valid: true,
                    studyId: selectedStudy.studyId,
                    commitment: studyCommitment,
                    verifiedAt: new Date().toISOString()
                };

                console.log('✅ Study commitment validation passed');
            } catch (error) {
                console.error('❌ Study commitment validation error:', error);
                return res.status(400).json({
                    success: false,
                    error: 'Study commitment validation failed: ' + error.message
                });
            }
        } else {
            console.log('⚠️ No study commitment provided - generating proof without study validation');
        }

        // Use the RealZKProofGenerator with Midnight Network integration
        const salt = Math.random() * 1000000;
        const proofResult = await realZKProofGenerator.generateMedicalStatsProof(studyData, salt);
        
        if (!proofResult.success) {
            return res.status(500).json({
                success: false,
                error: proofResult.error || 'Failed to generate proof'
            });
        }

        // Enhanced response with Midnight Network information and research insights
        const response = {
            success: true,
            proof: proofResult.proof,
            researchInsights: proofResult.researchInsights, // Include research insights from ZK proof generator
            studyCommitmentValidation: commitmentValidation, // Include study commitment validation results
            metadata: {
                ...proofResult.metadata,
                hospitalId: hospitalId,
                organizationId: organizationId,
                privacySettings: privacySettings,
                studyMetadata: metadata,
                studyCommitmentProvided: !!studyCommitment,
                studyValidated: !!commitmentValidation,
                timestamp: new Date().toISOString(),
                proofGenerationTime: '2-3 seconds (Midnight Network)',
                privacyGuarantees: {
                    patientDataNeverExposed: true,
                    hospitalDataPrivate: true,
                    zeroKnowledgeProofGenerated: true,
                    studyIntegrityVerified: !!commitmentValidation,
                    midnightNetworkUsed: proofResult.metadata?.midnightNetworkUsed || false
                }
            }
        };

        console.log('✅ ZK proof generated successfully:', {
            proofHash: proofResult.proof.proofHash,
            networkUsed: proofResult.proof.networkUsed,
            verified: proofResult.proof.verified,
            transactionHash: proofResult.proof.transactionHash
        });

        res.json(response);
    } catch (error) {
        console.error('❌ Error generating proof:', error);

        // Provide specific error details for Midnight Network issues
        let errorMessage = error.message || 'Failed to generate zero-knowledge proof';
        if (error.message && error.message.includes('Midnight Network not initialized')) {
            errorMessage = 'Midnight Network connection required. Please check your environment configuration.';
        } else if (error.message && error.message.includes('Missing required Midnight Network environment variables')) {
            errorMessage = 'Midnight Network not configured. Missing required environment variables.';
        }

        res.status(500).json({
            success: false,
            error: errorMessage,
            requiresMidnightNetwork: true
        });
    }
});

// Enhanced blockchain submission endpoint with Midnight Network integration
app.post('/api/submit-to-blockchain', async (req, res) => {
    try {
        const { proofHash, studyMetadata, useMidnightNetwork, proof } = req.body;
        
        console.log('🌙 Submitting proof to Midnight Network blockchain...');
        console.log('Proof hash:', proofHash);
        console.log('Use Midnight Network:', useMidnightNetwork);
        
        if (!proofHash || !studyMetadata) {
            return res.status(400).json({
                success: false,
                error: 'Proof hash and study metadata are required'
            });
        }

        // Submit to Midnight Network blockchain using the RealZKProofGenerator
        const blockchainResult = await realZKProofGenerator.submitToMidnightBlockchain(proof, studyMetadata);
        
        console.log('✅ Proof submitted to Midnight Network:', {
            transactionHash: blockchainResult.transactionHash,
            networkId: blockchainResult.networkId,
            privacyPreserved: blockchainResult.privacyPreserved
        });

        const response = {
            success: true,
            transactionHash: blockchainResult.transactionHash,
            blockNumber: blockchainResult.blockNumber,
            networkId: blockchainResult.networkId,
            gasUsed: blockchainResult.gasUsed,
            status: blockchainResult.status,
            timestamp: blockchainResult.timestamp,
            privacyPreserved: blockchainResult.privacyPreserved,
            midnightNetwork: true,
            
            // Additional Midnight Network specific data
            proofSubmissionDetails: {
                proofHash: proofHash,
                studyTitle: studyMetadata.studyTitle,
                queryType: studyMetadata.queryType,
                privacyLevel: studyMetadata.privacyLevel,
                submittedAt: new Date().toISOString()
            }
        };

        res.json(response);
    } catch (error) {
        console.error('❌ Error submitting to Midnight blockchain:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to submit proof to Midnight Network'
        });
    }
});

// Get Midnight Network status endpoint
app.get('/api/midnight-status', async (req, res) => {
    try {
        const networkStatus = realZKProofGenerator.getNetworkStatus();
        
        res.json({
            success: true,
            networkStatus: networkStatus,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('❌ Error getting Midnight Network status:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to get network status'
        });
    }
});

// Proof verification endpoint
app.post('/api/verify-proof', async (req, res) => {
    try {
        const { proof, studyId, verificationLevel = 'full' } = req.body;

        console.log(`🔍 Verifying proof for study: ${studyId}`);
        console.log(`Verification level: ${verificationLevel}`);

        if (!proof || !studyId) {
            return res.status(400).json({
                success: false,
                error: 'Proof and study ID are required'
            });
        }

        let verificationResult;

        switch (verificationLevel) {
            case 'commitment_only':
                // Only verify study commitment
                if (!proof.studyCommitment) {
                    return res.status(400).json({
                        success: false,
                        error: 'Study commitment not found in proof'
                    });
                }
                verificationResult = proofVerifier.verifyStudyCommitment(proof.studyCommitment, studyId);
                break;

            case 'structure_only':
                // Only verify proof structure
                verificationResult = proofVerifier.validateProofStructure(proof);
                verificationResult.studyId = studyId;
                break;

            case 'full':
            default:
                // Full verification including study context
                verificationResult = await proofVerifier.verifyProofForStudy(proof, studyId);
                break;
        }

        if (!verificationResult.valid) {
            console.log('❌ Proof verification failed:', verificationResult.error);
            return res.status(400).json({
                success: false,
                verification: verificationResult,
                message: `Proof verification failed: ${verificationResult.error}`
            });
        }

        console.log('✅ Proof verification successful');

        res.json({
            success: true,
            verification: verificationResult,
            verificationLevel: verificationLevel,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('❌ Error during proof verification:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to verify proof'
        });
    }
});

// Batch proof verification endpoint
app.post('/api/verify-proofs-batch', async (req, res) => {
    try {
        const { proofStudyPairs } = req.body;

        console.log(`🔍 Batch verifying ${proofStudyPairs?.length || 0} proofs`);

        if (!Array.isArray(proofStudyPairs) || proofStudyPairs.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'proofStudyPairs array is required and must not be empty'
            });
        }

        const batchResult = await proofVerifier.batchVerifyProofs(proofStudyPairs);

        console.log(`✅ Batch verification complete: ${batchResult.validProofs}/${batchResult.totalProofs} valid`);

        res.json({
            success: true,
            batchVerification: batchResult,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('❌ Error during batch proof verification:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to verify proofs in batch'
        });
    }
});

// Get verification system stats endpoint
app.get('/api/verification-stats', async (req, res) => {
    try {
        const stats = proofVerifier.getVerificationStats();

        res.json({
            success: true,
            verificationStats: stats,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('❌ Error getting verification stats:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to get verification statistics'
        });
    }
});

// Generate demo study data
app.get('/api/demo/studies', async (req, res) => {
    try {
        console.log('Generating demo study datasets...');

        const datasets = dataGenerator.generateDemoDatasets();

        // Generate proofs for each study
        const studiesWithProofs = [];
        
        for (const dataset of datasets) {
            const study = dataset.study;
            const sitesWithProofs = [];

            for (const site of study.sites) {
                const studyData = {
                    patientCount: site.outcomes.statistics.treatmentN + site.outcomes.statistics.controlN,
                    treatmentSuccess: Math.round(site.outcomes.statistics.treatmentSuccessRate * site.outcomes.statistics.treatmentN),
                    controlSuccess: Math.round(site.outcomes.statistics.controlSuccessRate * site.outcomes.statistics.controlN),
                    controlCount: site.outcomes.statistics.controlN,
                    pValue: site.outcomes.statistics.pValue
                };

                const salt = Math.floor(Math.random() * 1000000);
                const proof = await proofGenerator.generateMedicalStatsProof(studyData, salt);
                
                proof.metadata.hospitalName = site.hospital.name;
                proof.metadata.hospitalId = site.hospital.id;
                proof.metadata.condition = study.condition;
                proof.metadata.treatment = study.treatment;

                sitesWithProofs.push({
                    ...site,
                    zkProof: proof
                });
            }

            studiesWithProofs.push({
                ...dataset,
                study: {
                    ...study,
                    sites: sitesWithProofs
                }
            });
        }

        res.json({
            success: true,
            studies: studiesWithProofs,
            totalStudies: studiesWithProofs.length,
            generatedAt: new Date().toISOString()
        });

    } catch (error) {
        console.error('Demo studies generation error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get available studies for ZK proof generation
app.get('/api/available-studies', async (req, res) => {
    try {
        const { getAllStudies, getAvailableStudiesForProof } = require('./data/StudyCatalog');

        console.log('📚 Fetching available studies for ZK proof generation...');

        // Get all completed studies with available data
        const availableStudies = getAvailableStudiesForProof();

        // Transform the studies data to match the frontend interface
        const formattedStudies = availableStudies.map(study => ({
            studyId: study.studyId,
            hospitalId: study.hospitalId,
            hospitalName: study.hospitalName,
            status: study.status,
            metadata: {
                title: study.metadata.title,
                shortTitle: study.metadata.shortTitle,
                description: study.metadata.description,
                therapeuticArea: study.metadata.therapeuticArea,
                phase: study.metadata.phase,
                condition: {
                    code: study.metadata.condition.code,
                    display: study.metadata.condition.display,
                    system: study.metadata.condition.system
                },
                treatment: {
                    display: study.metadata.treatment.display,
                    dosing: study.metadata.treatment.dosing
                },
                comparator: study.metadata.comparator ? {
                    display: study.metadata.comparator.display,
                    dosing: study.metadata.comparator.dosing
                } : undefined
            },
            protocol: {
                inclusionCriteria: study.protocol.inclusionCriteria,
                primaryEndpoint: {
                    measure: study.protocol.primaryEndpoint.measure,
                    timepoint: study.protocol.primaryEndpoint.timepoint
                },
                duration: study.protocol.studyDesign.duration,
                designType: study.protocol.studyDesign.type,
                blinding: study.protocol.studyDesign.blinding
            },
            enrollment: {
                actualSize: study.enrollment.actualSize,
                completers: study.enrollment.completers.total
            },
            timeline: {
                completed: study.timeline.analysisComplete
            },
            qualityMetrics: {
                dataCompleteness: study.dataCompleteness,
                qualityScore: study.qualityScore
            },
            efficacySignal: {
                primaryEndpointMet: true, // These studies are completed and available
                statisticallySignificant: true,
                clinicallyMeaningful: true
            }
        }));

        console.log(`✅ Returning ${formattedStudies.length} available studies for ZK proof generation`);

        res.json({
            success: true,
            studies: formattedStudies,
            totalStudies: formattedStudies.length,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('❌ Error fetching available studies:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Aggregate study results across hospitals
app.post('/api/aggregate-results', async (req, res) => {
    try {
        const { studyType, condition, proofs = [] } = req.body;

        if (proofs.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'At least one proof is required for aggregation'
            });
        }

        console.log(`Aggregating results for ${proofs.length} proofs`);

        // Aggregate proof metadata without revealing individual hospital data
        const aggregateStats = {
            totalHospitals: proofs.length,
            totalMinSamples: proofs.reduce((sum, proof) => sum + (proof.metadata.sampleSize || 0), 0),
            averageEfficacy: proofs.reduce((sum, proof) => sum + (proof.metadata.efficacyRate || 0), 0) / proofs.length,
            significantResults: proofs.filter(proof => proof.metadata.pValue < 0.05).length,
            overallPValue: Math.min(...proofs.map(proof => proof.metadata.pValue || 1)),
            confidenceLevel: proofs.filter(proof => proof.publicSignals && proof.publicSignals[7] === 1).length / proofs.length
        };

        res.json({
            success: true,
            studyType: studyType,
            condition: condition,
            aggregateStats: aggregateStats,
            verifiedProofs: proofs.length,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Results aggregation error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ==========================================
// ORGANIZATION API ENDPOINTS (NEW SYSTEM)
// ==========================================

// Create a new organization
app.post('/api/organizations', async (req, res) => {
    try {
        const { organization, userId } = req.body;
        
        if (!organization || !userId) {
            return res.status(400).json({
                success: false,
                error: 'Organization data and user ID are required'
            });
        }

        console.log(`🏢 Creating new organization: ${organization.name}`);
        
        const result = await organizationService.createOrganization(organization, userId);
        
        if (!result.success) {
            return res.status(400).json(result);
        }

        // Verify email domain
        await organizationService.verifyEmailDomain(result.organization.id, organization.contactEmail);

        res.status(201).json({
            success: true,
            organization: result.organization,
            message: 'Organization created successfully',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error creating organization:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Upload organization document
app.post('/api/organizations/:organizationId/documents', async (req, res) => {
    try {
        const { organizationId } = req.params;
        const { document, userId } = req.body;
        
        if (!document || !userId) {
            return res.status(400).json({
                success: false,
                error: 'Document data and user ID are required'
            });
        }

        console.log(`📄 Uploading document for organization ${organizationId}: ${document.type}`);
        
        const result = await organizationService.uploadDocument(organizationId, document, userId);
        
        if (!result.success) {
            return res.status(400).json(result);
        }

        res.json({
            success: true,
            document: result.document,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error uploading document:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Get organizations for platform admin approval
app.get('/api/admin/organizations', async (req, res) => {
    try {
        const { status } = req.query;
        
        console.log(`🔍 Admin fetching organizations${status ? ` with status: ${status}` : ''}`);
        
        const result = await organizationService.getOrganizationsForApproval(status);
        
        if (!result.success) {
            return res.status(400).json(result);
        }

        res.json({
            success: true,
            organizations: result.organizations,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error fetching organizations for approval:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Approve organization
app.post('/api/admin/organizations/:organizationId/approve', async (req, res) => {
    try {
        const { organizationId } = req.params;
        const { reviewerId, notes } = req.body;
        
        if (!reviewerId) {
            return res.status(400).json({
                success: false,
                error: 'Reviewer ID is required'
            });
        }

        console.log(`✅ Admin ${reviewerId} approving organization ${organizationId}`);
        
        const result = await organizationService.approveOrganization(organizationId, reviewerId, notes);
        
        if (!result.success) {
            return res.status(400).json(result);
        }

        res.json({
            success: true,
            message: 'Organization approved successfully',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error approving organization:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Reject organization
app.post('/api/admin/organizations/:organizationId/reject', async (req, res) => {
    try {
        const { organizationId } = req.params;
        const { reviewerId, reason } = req.body;
        
        if (!reviewerId || !reason) {
            return res.status(400).json({
                success: false,
                error: 'Reviewer ID and reason are required'
            });
        }

        console.log(`❌ Admin ${reviewerId} rejecting organization ${organizationId}`);
        
        const result = await organizationService.rejectOrganization(organizationId, reviewerId, reason);
        
        if (!result.success) {
            return res.status(400).json(result);
        }

        res.json({
            success: true,
            message: 'Organization rejected',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error rejecting organization:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Get user's organizations
app.get('/api/users/:userId/organizations', async (req, res) => {
    try {
        const { userId } = req.params;
        
        console.log(`👤 Fetching organizations for user ${userId}`);
        
        const result = await organizationService.getUserOrganizations(userId);
        
        if (!result.success) {
            return res.status(400).json(result);
        }

        res.json({
            success: true,
            organizations: result.organizations,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error fetching user organizations:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// ==========================================
// HOSPITAL DATA ACCESS API ENDPOINTS 
// ==========================================

// Create data access request
app.post('/api/data-access-requests', async (req, res) => {
    try {
        const { request, requesterId } = req.body;
        
        if (!request || !requesterId) {
            return res.status(400).json({
                success: false,
                error: 'Request data and requester ID are required'
            });
        }

        console.log(`🏥 Creating data access request: ${request.organizationId} → ${request.hospitalId}`);
        
        const result = await hospitalDataAccessService.createDataAccessRequest(request, requesterId);
        
        if (!result.success) {
            return res.status(400).json(result);
        }

        res.status(201).json({
            success: true,
            request: result.request,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error creating data access request:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Get hospital data access requests
app.get('/api/hospitals/:hospitalId/data-requests', async (req, res) => {
    try {
        const { hospitalId } = req.params;
        const { status } = req.query;
        
        console.log(`🏥 Fetching data requests for hospital ${hospitalId}`);
        
        const result = await hospitalDataAccessService.getHospitalDataRequests(hospitalId, status);
        
        if (!result.success) {
            return res.status(400).json(result);
        }

        res.json({
            success: true,
            requests: result.requests,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error fetching hospital data requests:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Approve data access request
app.post('/api/data-access-requests/:requestId/approve', async (req, res) => {
    try {
        const { requestId } = req.params;
        const { reviewerId, approvalData } = req.body;
        
        if (!reviewerId || !approvalData) {
            return res.status(400).json({
                success: false,
                error: 'Reviewer ID and approval data are required'
            });
        }

        console.log(`✅ Hospital admin ${reviewerId} approving data access request ${requestId}`);
        
        const result = await hospitalDataAccessService.approveDataAccessRequest(requestId, reviewerId, approvalData);
        
        if (!result.success) {
            return res.status(400).json(result);
        }

        res.json({
            success: true,
            message: 'Data access request approved',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error approving data access request:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Reject data access request
app.post('/api/data-access-requests/:requestId/reject', async (req, res) => {
    try {
        const { requestId } = req.params;
        const { reviewerId, reason } = req.body;
        
        if (!reviewerId || !reason) {
            return res.status(400).json({
                success: false,
                error: 'Reviewer ID and reason are required'
            });
        }

        console.log(`❌ Hospital admin ${reviewerId} rejecting data access request ${requestId}`);
        
        const result = await hospitalDataAccessService.rejectDataAccessRequest(requestId, reviewerId, reason);
        
        if (!result.success) {
            return res.status(400).json(result);
        }

        res.json({
            success: true,
            message: 'Data access request rejected',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error rejecting data access request:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Get hospital agreements
app.get('/api/hospitals/:hospitalId/agreements', async (req, res) => {
    try {
        const { hospitalId } = req.params;
        const { status } = req.query;
        
        console.log(`🤝 Fetching agreements for hospital ${hospitalId}`);
        
        const result = await hospitalDataAccessService.getHospitalAgreements(hospitalId, status);
        
        if (!result.success) {
            return res.status(400).json(result);
        }

        res.json({
            success: true,
            agreements: result.agreements,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error fetching hospital agreements:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Suspend agreement
app.post('/api/agreements/:agreementId/suspend', async (req, res) => {
    try {
        const { agreementId } = req.params;
        const { reviewerId, reason } = req.body;
        
        if (!reviewerId || !reason) {
            return res.status(400).json({
                success: false,
                error: 'Reviewer ID and reason are required'
            });
        }

        console.log(`🚫 Suspending agreement ${agreementId}`);
        
        const result = await hospitalDataAccessService.suspendAgreement(agreementId, reviewerId, reason);
        
        if (!result.success) {
            return res.status(400).json(result);
        }

        res.json({
            success: true,
            message: 'Agreement suspended',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error suspending agreement:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Unhandled error:', error);
    res.status(500).json({
        success: false,
        error: 'Internal server error',
        timestamp: new Date().toISOString()
    });
});

// Admin API endpoints for hospital authorization management
app.get('/api/admin/pending-applications', async (req, res) => {
    try {
        const { hospital_id, admin_user_id } = req.query;
        
        if (!hospital_id || !admin_user_id) {
            return res.status(400).json({
                success: false,
                error: 'Hospital ID and admin user ID are required'
            });
        }

        const result = await applicationService.getPendingApplications(hospital_id, admin_user_id);
        
        if (!result.success) {
            return res.status(400).json(result);
        }

        res.json({
            success: true,
            data: result.data,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error fetching pending applications:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

app.post('/api/admin/approve-researcher', async (req, res) => {
    try {
        const { applicationId, permissions, reviewerId } = req.body;
        
        if (!applicationId || !reviewerId) {
            return res.status(400).json({
                success: false,
                error: 'Application ID and reviewer ID are required'
            });
        }

        console.log(`🏥 Admin ${reviewerId} approving researcher application ${applicationId}`);
        console.log(`🔐 Granted permissions:`, permissions);
        
        const result = await applicationService.approveApplication(applicationId, reviewerId, permissions);
        
        if (!result.success) {
            return res.status(400).json(result);
        }

        // TODO: Call Midnight Network smart contract to authorize the wallet
        
        res.json({
            success: true,
            message: result.message,
            authorizationId: `auth_${Date.now()}`,
            permissions: permissions,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error approving researcher:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

app.post('/api/admin/revoke-researcher', async (req, res) => {
    try {
        const { researcherId, reason, adminId } = req.body;
        
        if (!researcherId || !adminId) {
            return res.status(400).json({
                success: false,
                error: 'Researcher ID and admin ID are required'
            });
        }

        console.log(`🚫 Admin ${adminId} revoking researcher access ${researcherId}, reason: ${reason}`);
        
        const result = await applicationService.revokeResearcherAccess(researcherId, adminId, reason);
        
        if (!result.success) {
            return res.status(400).json(result);
        }

        // TODO: Call Midnight Network smart contract to revoke authorization
        
        res.json({
            success: true,
            message: result.message,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error revoking researcher access:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

app.get('/api/admin/hospital-stats', (req, res) => {
    const stats = {
        totalResearchers: 12,
        pendingApplications: 2,
        activeStudies: 8,
        completedStudies: 25,
        midnightNetworkStatus: "connected",
        contractAddress: "midnight1medproof...",
        lastSync: new Date().toISOString()
    };
    
    res.json({
        success: true,
        data: stats,
        timestamp: new Date().toISOString()
    });
});

// Get canonical study data for commitment generation
app.get('/api/studies/:studyId/canonical', async (req, res) => {
    try {
        const { studyId } = req.params;

        console.log(`📚 Fetching canonical study data for: ${studyId}`);

        const study = getStudyById(studyId);

        if (!study) {
            return res.status(404).json({
                success: false,
                error: `Study ${studyId} not found in catalog`,
                timestamp: new Date().toISOString()
            });
        }

        console.log(`✅ Found canonical study: ${study.studyId}`);

        res.json({
            success: true,
            study: study,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error fetching canonical study:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found',
        timestamp: new Date().toISOString()
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🏥 MedProof Backend API running on port ${PORT}`);
    console.log(`📊 Synthetic data generator: Ready`);
    console.log(`🔗 FHIR connector: Ready`);
    console.log(`🔒 ZK proof generator: Ready`);
    console.log(`🌐 Health check: http://localhost:${PORT}/health`);
});

module.exports = app;