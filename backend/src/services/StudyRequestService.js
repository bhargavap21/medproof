/**
 * Study Request Service
 *
 * Manages the complete lifecycle of study requests from creation through completion.
 * Handles validation, cost estimation, hospital matching, and workflow management.
 */

const crypto = require('crypto');
const StudyCommitmentGenerator = require('../proof/StudyCommitmentGenerator');
const HospitalCapacityService = require('./HospitalCapacityService');

class StudyRequestService {
  constructor() {
    this.commitmentGenerator = new StudyCommitmentGenerator();
    this.capacityService = new HospitalCapacityService();
    // In-memory storage for demo purposes
    this.studyRequests = new Map();
  }

  /**
   * Create a new study request with validation and commitment generation
   *
   * @param {Object} studyRequestData - Complete study request data
   * @returns {Promise<Object>} Created study request with ID and status
   */
  async createStudyRequest(studyRequestData) {
    console.log('🆕 Creating new study request:', studyRequestData.title);

    try {
      // Validate the study request data
      const validation = await this.validateStudyRequest(studyRequestData);
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }

      // Generate study commitment hash for integrity verification
      const studyCommitment = await this.generateStudyCommitment(studyRequestData);

      // Prepare study request for database insertion
      const studyRequest = {
        id: crypto.randomUUID(),
        researcher_id: studyRequestData.researcherId,
        title: studyRequestData.title,
        description: studyRequestData.description || '',
        study_type: studyRequestData.studyType,
        therapeutic_area: studyRequestData.therapeuticArea,

        // JSON data fields
        condition_data: studyRequestData.conditionData,
        protocol_data: studyRequestData.protocolData,
        requirements: studyRequestData.requirements,
        researcher_info: studyRequestData.researcherInfo,

        // Generated fields
        study_commitment_hash: studyCommitment.commitment,
        status: 'draft',
        priority_level: studyRequestData.priorityLevel || 1,
        confidentiality_level: studyRequestData.confidentialityLevel || 'standard',

        // Timestamps
        created_at: new Date(),
        updated_at: new Date(),
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      };

      // Store in database (mocked for now)
      const savedRequest = await this.saveStudyRequest(studyRequest);

      console.log(`✅ Study request created: ${savedRequest.id}`);
      console.log(`🔒 Commitment hash: ${studyCommitment.commitment.slice(0, 16)}...`);

      return {
        success: true,
        studyRequest: savedRequest,
        commitment: studyCommitment
      };

    } catch (error) {
      console.error('❌ Error creating study request:', error.message);
      throw error;
    }
  }

  /**
   * Validate study request data for completeness and correctness
   *
   * @param {Object} data - Study request data to validate
   * @returns {Promise<Object>} Validation result
   */
  async validateStudyRequest(data) {
    const errors = [];

    // Basic required fields
    if (!data.title || data.title.length < 10) {
      errors.push('Title must be at least 10 characters long');
    }

    if (!data.studyType || !['observational', 'interventional', 'survey', 'registry'].includes(data.studyType)) {
      errors.push('Valid study type is required');
    }

    if (!data.therapeuticArea) {
      errors.push('Therapeutic area is required');
    }

    // Condition data validation
    if (!data.conditionData?.icd10Code) {
      errors.push('Valid ICD-10 condition code is required');
    }

    if (!data.conditionData?.description) {
      errors.push('Condition description is required');
    }

    // Protocol validation
    if (!data.protocolData?.primaryEndpoint?.metric) {
      errors.push('Primary endpoint metric is required');
    }

    if (!data.protocolData?.primaryEndpoint?.timeframe) {
      errors.push('Primary endpoint timeframe is required');
    }

    if (!data.protocolData?.inclusionCriteria || data.protocolData.inclusionCriteria.length === 0) {
      errors.push('At least one inclusion criterion is required');
    }

    // Requirements validation
    if (!data.requirements?.sampleSize?.min || data.requirements.sampleSize.min < 1) {
      errors.push('Minimum sample size must be at least 1');
    }

    if (!data.requirements?.timeline?.duration || data.requirements.timeline.duration < 1) {
      errors.push('Study duration must be at least 1 month');
    }

    if (!data.requirements?.budget?.min || data.requirements.budget.min < 1000) {
      errors.push('Minimum budget must be at least $1,000');
    }

    // Researcher info validation
    if (!data.researcherInfo?.name) {
      errors.push('Researcher name is required');
    }

    if (!data.researcherInfo?.institution) {
      errors.push('Institution is required');
    }

    if (!data.researcherInfo?.email || !this.isValidEmail(data.researcherInfo.email)) {
      errors.push('Valid email address is required');
    }

    // Advanced validation checks
    await this.performAdvancedValidation(data, errors);

    return {
      isValid: errors.length === 0,
      errors,
      warnings: await this.generateValidationWarnings(data)
    };
  }

  /**
   * Generate study commitment hash for data integrity
   *
   * @param {Object} studyRequestData - Study request data
   * @returns {Promise<Object>} Commitment data with hash
   */
  async generateStudyCommitment(studyRequestData) {
    console.log('🔒 Generating study request commitment...');

    // Create canonical study representation
    const canonicalStudyRequest = {
      title: studyRequestData.title,
      studyType: studyRequestData.studyType,
      therapeuticArea: studyRequestData.therapeuticArea,
      condition: {
        code: studyRequestData.conditionData.icd10Code,
        description: studyRequestData.conditionData.description,
        severity: studyRequestData.conditionData.severity || 'any'
      },
      protocol: {
        primaryEndpoint: studyRequestData.protocolData.primaryEndpoint,
        inclusionCriteria: studyRequestData.protocolData.inclusionCriteria.sort(),
        exclusionCriteria: (studyRequestData.protocolData.exclusionCriteria || []).sort(),
        intervention: studyRequestData.protocolData.intervention,
        studyDesign: studyRequestData.protocolData.studyDesign
      },
      requirements: {
        sampleSize: studyRequestData.requirements.sampleSize,
        timeline: studyRequestData.requirements.timeline,
        budget: studyRequestData.requirements.budget
      },
      researcher: {
        institution: studyRequestData.researcherInfo.institution,
        credentials: studyRequestData.researcherInfo.credentials
      },
      timestamp: Date.now(),
      version: '1.0'
    };

    // Generate commitment using StudyCommitmentGenerator
    const commitmentResult = this.commitmentGenerator.generateCommitment({
      studyId: 'request_' + crypto.randomUUID(),
      ...canonicalStudyRequest
    });

    console.log(`✅ Study request commitment: ${commitmentResult.commitment.slice(0, 16)}...`);

    return commitmentResult;
  }

  /**
   * Find eligible hospitals for a study request
   *
   * @param {Object} studyRequest - Study request object
   * @returns {Promise<Array>} Array of eligible hospitals with capacity proofs
   */
  async findEligibleHospitals(studyRequest) {
    console.log(`🔍 Finding eligible hospitals for study: ${studyRequest.title}`);

    // Handle multiple data structure formats
    const conditionData = studyRequest.condition || studyRequest.condition_data || studyRequest.conditionData;
    const requirements = studyRequest.requirements;

    if (!conditionData) {
      throw new Error('Study request missing condition data');
    }

    console.log(`📋 Condition: ${conditionData.description}`);
    console.log(`👥 Sample size: ${requirements.sampleSize.min}-${requirements.sampleSize.max}`);

    try {
      // Get all hospitals that treat the condition (mocked for now)
      const potentialHospitals = await this.getHospitalsByCondition(conditionData.code || conditionData.icd10Code);

      console.log(`🏥 Found ${potentialHospitals.length} potential hospitals`);

      // Generate capacity proofs for each hospital
      const hospitalMatches = [];

      for (const hospital of potentialHospitals) {
        try {
          console.log(`🔬 Evaluating hospital: ${hospital.name}`);

          // Generate capacity proof
          const capacityProof = await this.capacityService.generateCapacityProof(
            hospital.id,
            studyRequest
          );

          if (capacityProof.isValid && capacityProof.isEligible) {
            const matchScore = await this.calculateMatchScore(hospital, studyRequest, capacityProof);

            hospitalMatches.push({
              hospitalId: hospital.id,
              hospitalName: hospital.name,
              location: hospital.location,
              capacityProof,
              matchScore,
              estimatedCost: await this.estimateStudyCost(hospital, studyRequest),
              estimatedTimeline: capacityProof.estimatedRecruitmentTime,
              lastUpdated: new Date().toISOString()
            });

            console.log(`✅ ${hospital.name}: Match score ${matchScore}%, eligible`);
          } else {
            console.log(`❌ ${hospital.name}: Not eligible - ${capacityProof.error || 'insufficient capacity'}`);
          }
        } catch (error) {
          console.error(`❌ Error evaluating ${hospital.name}:`, error.message);
        }
      }

      // Sort by match score
      hospitalMatches.sort((a, b) => b.matchScore - a.matchScore);

      console.log(`🎯 Found ${hospitalMatches.length} eligible hospitals`);

      return hospitalMatches;

    } catch (error) {
      console.error('❌ Error finding eligible hospitals:', error.message);
      throw error;
    }
  }

  /**
   * Calculate match score between hospital and study request
   *
   * @param {Object} hospital - Hospital data
   * @param {Object} studyRequest - Study request
   * @param {Object} capacityProof - Hospital capacity proof
   * @returns {Promise<number>} Match score (0-100)
   */
  async calculateMatchScore(hospital, studyRequest, capacityProof) {
    let score = 0;

    // Capacity match (30% weight)
    score += capacityProof.confidence * 0.3;

    // Experience match (25% weight)
    const experienceScore = this.calculateExperienceScore(hospital, studyRequest);
    score += experienceScore * 0.25;

    // Geographic preference (15% weight)
    const locationScore = this.calculateLocationScore(hospital, studyRequest);
    score += locationScore * 0.15;

    // Cost competitiveness (20% weight)
    const costScore = await this.calculateCostScore(hospital, studyRequest);
    score += costScore * 0.2;

    // Quality metrics (10% weight)
    const qualityScore = this.calculateQualityScore(hospital);
    score += qualityScore * 0.1;

    return Math.round(Math.min(100, Math.max(0, score)));
  }

  /**
   * Estimate study cost for a hospital
   *
   * @param {Object} hospital - Hospital data
   * @param {Object} studyRequest - Study request
   * @returns {Promise<Object>} Cost estimate breakdown
   */
  async estimateStudyCost(hospital, studyRequest) {
    const sampleSize = studyRequest.requirements.sampleSize.target || studyRequest.requirements.sampleSize.min;
    const duration = studyRequest.requirements.timeline.duration;

    // Base costs
    const baseCostPerPatient = 1200; // Base cost per patient
    const setupCost = 5000; // One-time setup
    const managementCost = duration * 800; // Monthly management

    // Multipliers based on study complexity
    const complexityMultiplier = this.getComplexityMultiplier(studyRequest);
    const hospitalMultiplier = hospital.costMultiplier || 1.0;

    const patientCosts = sampleSize * baseCostPerPatient * complexityMultiplier;
    const totalCost = (patientCosts + setupCost + managementCost) * hospitalMultiplier;

    return {
      totalCost: Math.round(totalCost),
      breakdown: {
        patientCosts: Math.round(patientCosts),
        setupCost,
        managementCost,
        costPerPatient: Math.round(totalCost / sampleSize)
      },
      currency: 'USD',
      estimatedAt: new Date().toISOString()
    };
  }

  // Helper methods
  async performAdvancedValidation(data, errors) {
    // Check for realistic sample size vs condition prevalence
    if (data.requirements?.sampleSize?.min > 10000) {
      errors.push('Sample size appears unrealistically large');
    }

    // Validate timeline reasonableness
    if (data.requirements?.timeline?.duration > 60) {
      errors.push('Study duration over 5 years requires special justification');
    }

    // Budget validation
    const minBudget = data.requirements?.budget?.min;
    const sampleSize = data.requirements?.sampleSize?.min;
    if (minBudget && sampleSize && (minBudget / sampleSize) < 500) {
      errors.push('Budget per patient appears too low for quality study conduct');
    }
  }

  async generateValidationWarnings(data) {
    const warnings = [];

    // Budget warnings
    if (data.requirements?.budget?.max < 50000) {
      warnings.push('Low budget may limit hospital participation');
    }

    // Timeline warnings
    if (data.requirements?.timeline?.duration < 3) {
      warnings.push('Short timeline may be challenging for patient recruitment');
    }

    return warnings;
  }

  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  getComplexityMultiplier(studyRequest) {
    let multiplier = 1.0;

    // Study type complexity
    if (studyRequest.study_type === 'interventional') multiplier += 0.3;
    if (studyRequest.study_type === 'registry') multiplier += 0.1;

    // Therapeutic area complexity
    const complexAreas = ['oncology', 'neurology', 'cardiology'];
    if (complexAreas.includes(studyRequest.therapeutic_area)) {
      multiplier += 0.2;
    }

    // Duration complexity
    if (studyRequest.requirements.timeline.duration > 12) {
      multiplier += 0.15;
    }

    return Math.min(2.0, multiplier);
  }

  calculateExperienceScore(hospital, studyRequest) {
    // Mock experience scoring
    const hasExperience = hospital.therapeuticAreas?.includes(studyRequest.therapeutic_area);
    const hasStudyTypeExperience = hospital.studyTypes?.includes(studyRequest.study_type);

    let score = 50; // Base score
    if (hasExperience) score += 30;
    if (hasStudyTypeExperience) score += 20;

    return Math.min(100, score);
  }

  calculateLocationScore(hospital, studyRequest) {
    // Simple location scoring - in reality would use geographic data
    return 75; // Neutral score for now
  }

  async calculateCostScore(hospital, studyRequest) {
    // Cost competitiveness - lower cost = higher score
    const costEstimate = await this.estimateStudyCost(hospital, studyRequest);
    const budgetMax = studyRequest.requirements.budget.max;

    if (costEstimate.totalCost <= budgetMax * 0.7) return 100;
    if (costEstimate.totalCost <= budgetMax * 0.8) return 80;
    if (costEstimate.totalCost <= budgetMax * 0.9) return 60;
    if (costEstimate.totalCost <= budgetMax) return 40;
    return 20;
  }

  calculateQualityScore(hospital) {
    // Quality metrics scoring
    const accreditation = hospital.accreditation ? 30 : 0;
    const reputation = (hospital.reputation || 7) * 10; // Convert 1-10 to 10-100
    return Math.min(100, accreditation + reputation);
  }

  async getHospitalsByCondition(conditionCode) {
    // Mock hospital data - in production would query real hospital database
    return [
      {
        id: 'hospital-001',
        name: 'Metro General Hospital',
        location: 'New York, NY',
        therapeuticAreas: ['endocrinology', 'cardiology', 'oncology'],
        studyTypes: ['interventional', 'observational'],
        costMultiplier: 1.0,
        reputation: 8.5,
        accreditation: true
      },
      {
        id: 'hospital-002',
        name: 'University Medical Center',
        location: 'Boston, MA',
        therapeuticAreas: ['endocrinology', 'neurology'],
        studyTypes: ['interventional', 'observational', 'registry'],
        costMultiplier: 1.1,
        reputation: 9.0,
        accreditation: true
      },
      {
        id: 'hospital-003',
        name: 'Regional Health System',
        location: 'Chicago, IL',
        therapeuticAreas: ['oncology', 'pulmonology'],
        studyTypes: ['observational'],
        costMultiplier: 0.9,
        reputation: 7.5,
        accreditation: true
      }
    ];
  }

  async saveStudyRequest(studyRequest) {
    console.log('💾 Saving study request to in-memory store...');

    const savedRequest = {
      ...studyRequest,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Store in memory map
    this.studyRequests.set(studyRequest.id, savedRequest);

    console.log(`✅ Study request saved with ID: ${studyRequest.id}`);
    console.log(`📊 Total study requests: ${this.studyRequests.size}`);

    return savedRequest;
  }

  /**
   * Get all study requests
   *
   * @returns {Promise<Array>} All study requests
   */
  async getAllStudyRequests() {
    console.log(`📋 Retrieving all study requests (${this.studyRequests.size} total)`);
    return Array.from(this.studyRequests.values());
  }

  /**
   * Get study request by ID
   *
   * @param {string} requestId - Study request ID
   * @returns {Promise<Object>} Study request data
   */
  async getById(requestId) {
    console.log(`🔍 Looking up study request: ${requestId}`);
    const studyRequest = this.studyRequests.get(requestId);

    if (!studyRequest) {
      throw new Error(`Study request not found: ${requestId}`);
    }

    return studyRequest;
    console.log(`📖 Fetching study request: ${requestId}`);

    // Return mock data for testing
    return {
      id: requestId,
      researcher_id: 'researcher-001',
      title: 'Mock Study Request',
      status: 'active',
      condition_data: { icd10Code: 'E11', description: 'Type 2 Diabetes' },
      requirements: { sampleSize: { min: 100, max: 200 } }
    };
  }

  /**
   * Update study request status
   *
   * @param {string} requestId - Study request ID
   * @param {string} status - New status
   * @returns {Promise<void>}
   */
  async updateStatus(requestId, status) {
    console.log(`📝 Updating study request ${requestId} status to: ${status}`);
    // Mock implementation - in production would update database
  }
}

module.exports = StudyRequestService;