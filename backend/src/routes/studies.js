const express = require('express');
const router = express.Router();
const { getAvailableStudiesForProof, getStudyById } = require('../data/StudyCatalog');
const { getCohortByStudyId } = require('../data/PatientCohorts');

/**
 * GET /api/available-studies
 * Returns list of completed studies available for ZK proof generation
 */
router.get('/api/available-studies', async (req, res) => {
  try {
    console.log('📚 Fetching available studies for ZK proof generation...');

    // Get all completed studies with available data
    const availableStudies = getAvailableStudiesForProof();

    // Return study metadata without sensitive patient data
    const studySummaries = availableStudies.map(study => {
      const cohort = getCohortByStudyId(study.studyId);

      return {
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
          } : null
        },

        protocol: {
          inclusionCriteria: study.protocol.inclusionCriteria,
          primaryEndpoint: study.protocol.primaryEndpoint,
          duration: study.protocol.studyDesign.duration,
          designType: study.protocol.studyDesign.type,
          blinding: study.protocol.studyDesign.blinding
        },

        enrollment: {
          actualSize: study.enrollment.actualSize,
          completers: study.enrollment.completers?.total || study.enrollment.actualSize
        },

        timeline: {
          completed: study.timeline.analysisComplete
        },

        // Summary statistics without revealing raw data
        qualityMetrics: {
          dataCompleteness: study.dataCompleteness,
          qualityScore: study.qualityScore
        },

        // Basic efficacy signal without details
        efficacySignal: {
          primaryEndpointMet: cohort?.overallStatistics?.primaryAnalysis?.pValue < 0.05,
          statisticallySignificant: cohort?.overallStatistics?.primaryAnalysis?.pValue < 0.05,
          clinicallyMeaningful: cohort?.overallStatistics?.effectSize?.clinicallyMeaningful || true
        }
      };
    });

    console.log(`✅ Returning ${studySummaries.length} available studies`);

    res.json({
      success: true,
      studies: studySummaries,
      totalCount: studySummaries.length,
      message: `Found ${studySummaries.length} completed studies with available data`
    });

  } catch (error) {
    console.error('❌ Error fetching available studies:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to fetch available studies'
    });
  }
});

/**
 * GET /api/study/:studyId
 * Returns detailed information about a specific study
 */
router.get('/api/study/:studyId', async (req, res) => {
  try {
    const { studyId } = req.params;
    console.log(`📖 Fetching details for study: ${studyId}`);

    const study = getStudyById(studyId);
    if (!study) {
      return res.status(404).json({
        success: false,
        error: 'Study not found',
        message: `Study with ID ${studyId} does not exist`
      });
    }

    const cohort = getCohortByStudyId(studyId);

    // Return detailed study information
    const detailedStudy = {
      studyId: study.studyId,
      hospitalId: study.hospitalId,
      hospitalName: study.hospitalName,

      metadata: study.metadata,
      protocol: study.protocol,
      enrollment: study.enrollment,
      timeline: study.timeline,
      regulatory: study.regulatory,

      // Summary statistics for transparency
      studyResults: cohort ? {
        totalParticipants: cohort.treatmentArm.count + (cohort.controlArm?.count || 0),
        treatmentArms: {
          treatment: {
            name: cohort.treatmentArm.armName,
            count: cohort.treatmentArm.count
          },
          control: cohort.controlArm ? {
            name: cohort.controlArm.armName,
            count: cohort.controlArm.count
          } : null
        },
        primaryEndpointMet: cohort.overallStatistics?.primaryAnalysis?.pValue < 0.05,
        statisticalSignificance: cohort.overallStatistics?.primaryAnalysis?.pValue < 0.05 ?
          'Statistically significant' : 'Not statistically significant'
      } : null
    };

    res.json({
      success: true,
      study: detailedStudy
    });

  } catch (error) {
    console.error(`❌ Error fetching study ${req.params.studyId}:`, error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/studies/by-condition/:conditionCode
 * Returns studies for a specific medical condition
 */
router.get('/api/studies/by-condition/:conditionCode', async (req, res) => {
  try {
    const { conditionCode } = req.params;
    console.log(`🔍 Searching studies for condition: ${conditionCode}`);

    const availableStudies = getAvailableStudiesForProof();
    const matchingStudies = availableStudies.filter(study =>
      study.metadata.condition.code === conditionCode
    );

    res.json({
      success: true,
      studies: matchingStudies.map(study => ({
        studyId: study.studyId,
        title: study.metadata.title,
        hospitalName: study.hospitalName,
        enrollmentSize: study.enrollment.actualSize
      })),
      conditionCode: conditionCode,
      totalCount: matchingStudies.length
    });

  } catch (error) {
    console.error(`❌ Error searching studies for condition ${req.params.conditionCode}:`, error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;