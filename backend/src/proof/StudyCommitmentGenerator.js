/**
 * Study Commitment Generator
 *
 * Creates cryptographic commitments to study parameters to ensure ZK proofs
 * are verifiably tied to specific study protocols and cannot be manipulated.
 */

const crypto = require('crypto');

class StudyCommitmentGenerator {

  /**
   * Generate a cryptographic commitment to study parameters
   * Creates a deterministic hash of the canonical study representation
   *
   * @param {Object} study - Complete study object from StudyCatalog
   * @returns {Object} - Commitment hash and metadata
   */
  generateCommitment(study) {
    console.log('🔒 Backend: Generating study commitment for:', study.studyId);
    console.log('🔍 Backend: Original study object:', JSON.stringify(study, null, 2));

    // Create canonical representation of study parameters
    // Order matters for deterministic hashing
    const canonicalStudy = {
      // Core study identifiers
      studyId: study.studyId,
      hospitalId: study.hospitalId,

      // Medical condition and treatment
      condition: {
        code: study.metadata.condition.code,
        system: study.metadata.condition.system || 'ICD-10',
        display: study.metadata.condition.display
      },

      // Treatment details
      treatment: {
        code: study.metadata.treatment.code || study.metadata.treatment.display,
        display: study.metadata.treatment.display,
        dosing: study.metadata.treatment.dosing || ''
      },

      // Comparator (if exists)
      comparator: study.metadata.comparator ? {
        code: study.metadata.comparator.code || study.metadata.comparator.display,
        display: study.metadata.comparator.display,
        dosing: study.metadata.comparator.dosing || ''
      } : null,

      // Inclusion criteria (critical for study validity)
      inclusionCriteria: {
        ageMin: study.protocol.inclusionCriteria.ageRange.min,
        ageMax: study.protocol.inclusionCriteria.ageRange.max,
        gender: study.protocol.inclusionCriteria.gender,
        // Add other criteria as ordered keys
        ...(study.protocol.inclusionCriteria.hba1cRange && {
          hba1cMin: study.protocol.inclusionCriteria.hba1cRange.min,
          hba1cMax: study.protocol.inclusionCriteria.hba1cRange.max
        }),
        ...(study.protocol.inclusionCriteria.bmiRange && {
          bmiMin: study.protocol.inclusionCriteria.bmiRange.min,
          bmiMax: study.protocol.inclusionCriteria.bmiRange.max
        }),
        ...(study.protocol.inclusionCriteria.ejectionFraction && {
          ejectionFractionMax: study.protocol.inclusionCriteria.ejectionFraction.max
        })
      },

      // Primary endpoint
      primaryEndpoint: {
        measure: study.protocol.primaryEndpoint?.measure || '',
        timepoint: study.protocol.primaryEndpoint?.timepoint || ''
      },

      // Study design parameters
      studyDesign: {
        type: study.protocol.studyDesign?.type || study.protocol.designType,
        duration: study.protocol.studyDesign?.duration || study.protocol.duration,
        blinding: study.protocol.studyDesign?.blinding || study.protocol.blinding || 'open-label',
        randomization: study.protocol.studyDesign?.randomization || 'none'
      },

      // Enrollment information
      enrollment: {
        targetSize: study.enrollment?.targetSize || study.enrollment?.actualSize || 0,
        actualSize: study.enrollment?.actualSize || 0
      },

      // Regulatory approvals
      regulatory: {
        irbNumber: study.regulatory?.irbNumber || '',
        clinicalTrialsId: study.regulatory?.clinicalTrialsId || ''
      }
    };

    console.log('📋 Backend: Canonical study before sorting:', JSON.stringify(canonicalStudy, null, 2));

    // Sort keys recursively for deterministic output
    const sortedCanonicalStudy = this.sortObjectKeys(canonicalStudy);

    console.log('🔄 Backend: Sorted canonical study:', JSON.stringify(sortedCanonicalStudy, null, 2));

    // Generate deterministic hash
    const studyString = JSON.stringify(sortedCanonicalStudy);
    console.log('📝 Backend: Study string for hashing:', studyString);

    const commitment = crypto
      .createHash('sha256')
      .update(studyString)
      .digest('hex');

    console.log('✅ Backend: Study commitment generated:');
    console.log(`   Study ID: ${study.studyId}`);
    console.log(`   Commitment: ${commitment.slice(0, 16)}...`);
    console.log(`   Full Commitment: ${commitment}`);
    console.log(`   Canonical params: ${Object.keys(sortedCanonicalStudy).join(', ')}`);

    return {
      commitment: commitment,
      studyId: study.studyId,
      hospitalId: study.hospitalId,
      canonicalStudy: sortedCanonicalStudy,
      timestamp: Date.now(),
      version: '1.0'
    };
  }

  /**
   * Verify that a provided commitment matches the expected study
   *
   * @param {string} providedCommitment - Commitment hash to verify
   * @param {Object} study - Study object to verify against
   * @returns {boolean} - True if commitment matches study
   */
  verifyCommitment(providedCommitment, study) {
    console.log(`🔍 Verifying study commitment for: ${study.studyId}`);
    console.log(`   Provided: ${providedCommitment.slice(0, 16)}...`);

    try {
      const expectedCommitment = this.generateCommitment(study);
      const isValid = providedCommitment === expectedCommitment.commitment;

      if (isValid) {
        console.log('✅ Study commitment verification: VALID');
      } else {
        console.log('❌ Study commitment verification: FAILED');
        console.log(`   Expected: ${expectedCommitment.commitment.slice(0, 16)}...`);
        console.log(`   Provided: ${providedCommitment.slice(0, 16)}...`);
      }

      return isValid;
    } catch (error) {
      console.error('❌ Error verifying study commitment:', error.message);
      return false;
    }
  }

  /**
   * Generate commitment for frontend (without logging)
   * Used when frontend needs to generate commitment hash
   *
   * @param {Object} study - Study object
   * @returns {string} - Just the commitment hash
   */
  generateCommitmentHash(study) {
    const commitmentData = this.generateCommitment(study);
    return commitmentData.commitment;
  }

  /**
   * Extract study commitment from ZK proof public signals
   * The commitment is encoded in the first 64 bits of the public signals
   *
   * @param {Array} publicSignals - ZK proof public signals
   * @returns {string} - Partial commitment hash (first 16 hex chars)
   */
  extractCommitmentFromProof(publicSignals) {
    if (!publicSignals || publicSignals.length < 2) {
      throw new Error('Invalid public signals - missing commitment data');
    }

    // Study commitment is in publicSignals[1]
    const commitmentInt = BigInt(publicSignals[1]);
    const commitmentHex = commitmentInt.toString(16).padStart(16, '0');

    return commitmentHex;
  }

  /**
   * Verify that ZK proof contains the correct study commitment
   *
   * @param {Array} publicSignals - ZK proof public signals
   * @param {Object} study - Expected study object
   * @returns {Object} - Verification result
   */
  verifyProofCommitment(publicSignals, study) {
    try {
      const proofCommitmentHex = this.extractCommitmentFromProof(publicSignals);
      const expectedCommitment = this.generateCommitment(study);

      // Compare first 64 bits (16 hex chars) of the commitment
      const expectedCommitmentPrefix = expectedCommitment.commitment.slice(0, 16);

      const isValid = proofCommitmentHex === expectedCommitmentPrefix;

      return {
        valid: isValid,
        proofCommitment: proofCommitmentHex,
        expectedCommitment: expectedCommitmentPrefix,
        fullExpectedCommitment: expectedCommitment.commitment,
        studyId: study.studyId
      };
    } catch (error) {
      return {
        valid: false,
        error: error.message
      };
    }
  }

  /**
   * Recursively sort object keys for deterministic JSON output
   *
   * @param {*} obj - Object to sort
   * @returns {*} - Object with sorted keys
   */
  sortObjectKeys(obj) {
    if (obj === null || typeof obj !== 'object' || obj instanceof Array) {
      return obj;
    }

    const sortedObj = {};
    const keys = Object.keys(obj).sort();

    for (const key of keys) {
      sortedObj[key] = this.sortObjectKeys(obj[key]);
    }

    return sortedObj;
  }

  /**
   * Get a human-readable summary of study parameters used in commitment
   *
   * @param {Object} study - Study object
   * @returns {Object} - Summary of committed parameters
   */
  getCommitmentSummary(study) {
    const commitment = this.generateCommitment(study);

    return {
      studyId: study.studyId,
      commitmentHash: commitment.commitment,
      parameters: {
        condition: study.metadata.condition.display,
        treatment: study.metadata.treatment.display,
        comparator: study.metadata.comparator?.display || 'None',
        ageRange: `${study.protocol.inclusionCriteria.ageRange.min}-${study.protocol.inclusionCriteria.ageRange.max}`,
        sampleSize: study.enrollment.actualSize,
        studyType: study.protocol.studyDesign.type,
        duration: study.protocol.studyDesign.duration
      },
      commitment: commitment.commitment,
      generatedAt: new Date(commitment.timestamp).toISOString()
    };
  }
}

module.exports = StudyCommitmentGenerator;