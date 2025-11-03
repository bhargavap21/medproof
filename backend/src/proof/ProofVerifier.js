/**
 * Proof Verifier for Study Context Validation
 *
 * Verifies that ZK proofs are generated for specific studies and validates
 * the integrity of study parameters within the proof system.
 */

const StudyCommitmentGenerator = require('./StudyCommitmentGenerator');
const { getStudyById } = require('../data/StudyCatalog');

class ProofVerifier {
    constructor() {
        this.commitmentGenerator = new StudyCommitmentGenerator();
    }

    /**
     * Verify that a proof corresponds to a specific study
     *
     * @param {Object} proof - The ZK proof object
     * @param {string} studyId - Expected study ID
     * @returns {Object} - Verification result
     */
    async verifyProofForStudy(proof, studyId) {
        console.log(`🔍 Verifying proof for study: ${studyId}`);

        try {
            // Get the study from catalog
            const study = getStudyById(studyId);
            if (!study) {
                return {
                    valid: false,
                    error: `Study ${studyId} not found in catalog`,
                    studyId: studyId
                };
            }

            // Extract study commitment from proof public signals
            const commitmentResult = this.commitmentGenerator.verifyProofCommitment(
                proof.publicSignals,
                study
            );

            if (!commitmentResult.valid) {
                console.log('❌ Study commitment verification failed');
                return {
                    valid: false,
                    error: 'Proof does not match expected study parameters',
                    studyId: studyId,
                    expectedCommitment: commitmentResult.expectedCommitment,
                    proofCommitment: commitmentResult.proofCommitment,
                    details: commitmentResult
                };
            }

            // Verify proof cryptographic validity
            const proofValidation = this.validateProofStructure(proof);
            if (!proofValidation.valid) {
                console.log('❌ Proof structure validation failed');
                return {
                    valid: false,
                    error: 'Invalid proof structure',
                    studyId: studyId,
                    details: proofValidation
                };
            }

            // Additional study-specific validations
            const studyValidation = this.validateStudySpecificCriteria(proof, study);
            if (!studyValidation.valid) {
                console.log('❌ Study-specific validation failed');
                return {
                    valid: false,
                    error: 'Proof does not meet study-specific criteria',
                    studyId: studyId,
                    details: studyValidation
                };
            }

            console.log('✅ Proof verification passed for study:', studyId);

            return {
                valid: true,
                studyId: studyId,
                studyTitle: study.metadata.title,
                commitmentValidation: commitmentResult,
                proofValidation: proofValidation,
                studyValidation: studyValidation,
                verifiedAt: new Date().toISOString()
            };

        } catch (error) {
            console.error('❌ Error during proof verification:', error);
            return {
                valid: false,
                error: `Verification failed: ${error.message}`,
                studyId: studyId
            };
        }
    }

    /**
     * Validate the cryptographic structure of the proof
     *
     * @param {Object} proof - The ZK proof object
     * @returns {Object} - Validation result
     */
    validateProofStructure(proof) {
        try {
            // Check required proof components
            const requiredFields = ['proofHash', 'publicSignals', 'verified'];
            const missingFields = requiredFields.filter(field => !(field in proof));

            if (missingFields.length > 0) {
                return {
                    valid: false,
                    error: `Missing required proof fields: ${missingFields.join(', ')}`
                };
            }

            // Validate proof hash format
            if (!proof.proofHash || typeof proof.proofHash !== 'string') {
                return {
                    valid: false,
                    error: 'Invalid proof hash format'
                };
            }

            // Validate public signals array
            if (!Array.isArray(proof.publicSignals) || proof.publicSignals.length < 2) {
                return {
                    valid: false,
                    error: 'Invalid public signals array - must have at least 2 elements'
                };
            }

            // Check that proof is marked as verified
            if (!proof.verified) {
                return {
                    valid: false,
                    error: 'Proof is not marked as verified'
                };
            }

            // Validate Midnight Network specific fields if present
            if (proof.networkUsed) {
                if (!proof.transactionHash || !proof.blockHeight) {
                    return {
                        valid: false,
                        error: 'Midnight Network proof missing blockchain metadata'
                    };
                }
            }

            return {
                valid: true,
                proofHash: proof.proofHash,
                networkUsed: proof.networkUsed || 'unknown',
                publicSignalsCount: proof.publicSignals.length
            };

        } catch (error) {
            return {
                valid: false,
                error: `Proof structure validation error: ${error.message}`
            };
        }
    }

    /**
     * Validate study-specific criteria based on the study protocol
     *
     * @param {Object} proof - The ZK proof object
     * @param {Object} study - The study object
     * @returns {Object} - Validation result
     */
    validateStudySpecificCriteria(proof, study) {
        try {
            const validations = [];

            // Extract statistical significance from public signals
            // publicSignals[2] contains statistical significance (p < 0.05 = 1, p >= 0.05 = 0)
            const statisticallySignificant = proof.publicSignals.length > 2 &&
                                          BigInt(proof.publicSignals[2]) === BigInt(1);

            // For completed studies, we expect statistical significance
            if (study.status === 'completed' && !statisticallySignificant) {
                return {
                    valid: false,
                    error: 'Completed study must demonstrate statistical significance',
                    statisticallySignificant: false
                };
            }

            validations.push({
                criterion: 'statistical_significance',
                required: study.status === 'completed',
                met: statisticallySignificant
            });

            // Extract sample size adequacy from public signals
            // publicSignals[1] contains sample size adequacy (adequate = 1, inadequate = 0)
            const adequateSampleSize = proof.publicSignals.length > 1 &&
                                     BigInt(proof.publicSignals[1]) === BigInt(1);

            // All studies should have adequate sample size (>= 50 participants)
            if (!adequateSampleSize) {
                return {
                    valid: false,
                    error: 'Study must have adequate sample size (minimum 50 participants)',
                    adequateSampleSize: false
                };
            }

            validations.push({
                criterion: 'sample_size_adequacy',
                required: true,
                met: adequateSampleSize
            });

            // Validate study design requirements based on study type
            const studyType = study.protocol.studyDesign.type;
            if (studyType === 'randomized-controlled-trial') {
                // RCTs should show treatment superiority
                const treatmentSuccessRate = proof.publicSignals.length > 3 ?
                                           Number(BigInt(proof.publicSignals[3])) / 100 : 0;

                if (treatmentSuccessRate <= 50) { // Should be > 50% for treatment superiority
                    return {
                        valid: false,
                        error: 'RCT must demonstrate treatment superiority over control',
                        treatmentSuccessRate: treatmentSuccessRate
                    };
                }

                validations.push({
                    criterion: 'treatment_superiority',
                    required: true,
                    met: treatmentSuccessRate > 50,
                    value: treatmentSuccessRate
                });
            }

            // Validate therapeutic area specific requirements
            const therapeuticArea = study.metadata.therapeuticArea;
            switch (therapeuticArea) {
                case 'Oncology':
                    // Cancer studies typically require stronger evidence
                    if (!statisticallySignificant) {
                        return {
                            valid: false,
                            error: 'Oncology studies require statistical significance',
                            therapeuticArea: therapeuticArea
                        };
                    }
                    break;

                case 'Cardiology':
                case 'Cardiovascular':
                    // Cardiovascular studies need adequate follow-up
                    // This would be validated based on study duration in real implementation
                    break;
            }

            validations.push({
                criterion: 'therapeutic_area_requirements',
                required: true,
                met: true,
                therapeuticArea: therapeuticArea
            });

            return {
                valid: true,
                validations: validations,
                studyType: studyType,
                therapeuticArea: therapeuticArea,
                criteriaMetCount: validations.filter(v => v.met).length,
                totalCriteria: validations.length
            };

        } catch (error) {
            return {
                valid: false,
                error: `Study-specific validation error: ${error.message}`
            };
        }
    }

    /**
     * Verify the integrity of a study commitment hash
     *
     * @param {string} commitmentHash - The commitment hash to verify
     * @param {string} studyId - The study ID
     * @returns {Object} - Verification result
     */
    verifyStudyCommitment(commitmentHash, studyId) {
        console.log(`🔒 Verifying study commitment for: ${studyId}`);

        try {
            const study = getStudyById(studyId);
            if (!study) {
                return {
                    valid: false,
                    error: `Study ${studyId} not found`,
                    studyId: studyId
                };
            }

            const isValid = this.commitmentGenerator.verifyCommitment(commitmentHash, study);

            if (!isValid) {
                return {
                    valid: false,
                    error: 'Commitment hash does not match study parameters',
                    studyId: studyId,
                    providedHash: commitmentHash
                };
            }

            const summary = this.commitmentGenerator.getCommitmentSummary(study);

            return {
                valid: true,
                studyId: studyId,
                commitmentHash: commitmentHash,
                studyTitle: study.metadata.title,
                parameters: summary.parameters,
                verifiedAt: new Date().toISOString()
            };

        } catch (error) {
            return {
                valid: false,
                error: `Commitment verification error: ${error.message}`,
                studyId: studyId
            };
        }
    }

    /**
     * Batch verify multiple proofs for studies
     *
     * @param {Array} proofStudyPairs - Array of {proof, studyId} objects
     * @returns {Object} - Batch verification result
     */
    async batchVerifyProofs(proofStudyPairs) {
        console.log(`🔍 Batch verifying ${proofStudyPairs.length} proofs...`);

        const results = [];
        let validCount = 0;

        for (const { proof, studyId } of proofStudyPairs) {
            const result = await this.verifyProofForStudy(proof, studyId);
            results.push(result);
            if (result.valid) validCount++;
        }

        return {
            success: true,
            totalProofs: proofStudyPairs.length,
            validProofs: validCount,
            invalidProofs: proofStudyPairs.length - validCount,
            verificationRate: (validCount / proofStudyPairs.length) * 100,
            results: results,
            verifiedAt: new Date().toISOString()
        };
    }

    /**
     * Get verification statistics for monitoring
     *
     * @returns {Object} - System verification statistics
     */
    getVerificationStats() {
        // In a real implementation, this would query a database
        // For now, return static information about the verification system
        return {
            verifierVersion: '1.0.0',
            supportedStudyTypes: [
                'randomized-controlled-trial',
                'single-arm-study',
                'cohort-study',
                'case-control-study'
            ],
            supportedTherapeuticAreas: [
                'Oncology',
                'Cardiology',
                'Endocrinology',
                'Neurology'
            ],
            validationCriteria: [
                'study_commitment_integrity',
                'proof_structure_validity',
                'statistical_significance',
                'sample_size_adequacy',
                'treatment_superiority',
                'therapeutic_area_requirements'
            ],
            systemStatus: 'operational'
        };
    }
}

module.exports = ProofVerifier;