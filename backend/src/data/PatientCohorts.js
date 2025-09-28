/**
 * Patient Cohorts - Realistic patient data for completed studies
 *
 * This database contains realistic patient outcome data for each completed study.
 * The data represents actual treatment and control group results that would be
 * used to generate ZK proofs. All patient data is de-identified and aggregated.
 */

const PATIENT_COHORTS = {
  "diabetes-metformin-elderly-2024": {
    studyId: "diabetes-metformin-elderly-2024",
    lastUpdated: "2024-05-01",

    treatmentArm: {
      armName: "Metformin Extended-Release",
      count: 243,

      demographics: {
        meanAge: 72.3,
        ageSD: 4.8,
        femalePercent: 48,
        meanBMI: 29.8,
        bmiSD: 4.2,
        meanDiabetesDuration: 8.4, // years
        ethnicDistribution: {
          white: 65,
          hispanic: 20,
          africanAmerican: 12,
          asian: 3
        }
      },

      baselineCharacteristics: {
        meanHbA1c: 8.4,
        hba1cSD: 0.8,
        meanFastingGlucose: 162, // mg/dL
        meanSystolicBP: 138,
        meanDiastolicBP: 82,
        meanCreatinine: 1.0, // mg/dL
        meanEGFR: 72 // mL/min/1.73m²
      },

      primaryOutcomes: {
        // HbA1c change from baseline at 6 months
        hba1cReduction: {
          mean: 1.8,
          standardDeviation: 0.9,
          confidenceInterval: [1.6, 2.0],
          responders: 189, // patients achieving >1% reduction
          responderRate: 77.8
        }
      },

      secondaryOutcomes: {
        weightChange: {
          mean: -2.3, // kg
          standardDeviation: 3.1,
          confidenceInterval: [-2.7, -1.9]
        },
        qualityOfLife: {
          baselineScore: 68.2,
          finalScore: 73.8,
          changeFromBaseline: 5.6
        },
        adherenceRate: 91.2 // percentage
      },

      safetyOutcomes: {
        hypoglycemicEvents: {
          total: 15,
          severe: 1,
          rate: 6.2 // per patient-year
        },
        adverseEvents: {
          total: 67,
          serious: 4,
          gastrointestinal: 23, // Most common AE for metformin
          diarrhea: 18,
          nausea: 12,
          abdominalPain: 8
        },
        discontinuations: {
          total: 11,
          dueToAE: 6,
          lossToFollowUp: 3,
          withdrawnConsent: 2
        }
      }
    },

    controlArm: {
      armName: "Insulin Glargine",
      count: 244,

      demographics: {
        meanAge: 71.8,
        ageSD: 5.1,
        femalePercent: 51,
        meanBMI: 30.1,
        bmiSD: 4.5
      },

      baselineCharacteristics: {
        meanHbA1c: 8.3,
        hba1cSD: 0.9,
        meanFastingGlucose: 158,
        meanSystolicBP: 140,
        meanDiastolicBP: 84
      },

      primaryOutcomes: {
        hba1cReduction: {
          mean: 1.2,
          standardDeviation: 1.1,
          confidenceInterval: [1.0, 1.4],
          responders: 134,
          responderRate: 54.9
        }
      },

      secondaryOutcomes: {
        weightChange: {
          mean: 0.8, // kg weight gain
          standardDeviation: 2.9,
          confidenceInterval: [0.4, 1.2]
        },
        qualityOfLife: {
          baselineScore: 67.8,
          finalScore: 69.2,
          changeFromBaseline: 1.4
        },
        adherenceRate: 86.7
      },

      safetyOutcomes: {
        hypoglycemicEvents: {
          total: 58,
          severe: 8,
          rate: 23.8 // per patient-year
        },
        adverseEvents: {
          total: 81,
          serious: 7,
          injectionSiteReaction: 15,
          weightGain: 31
        },
        discontinuations: {
          total: 12,
          dueToAE: 7,
          lossToFollowUp: 3,
          withdrawnConsent: 2
        }
      }
    },

    overallStatistics: {
      primaryAnalysis: {
        treatmentDifference: 0.6, // HbA1c reduction difference
        standardError: 0.15,
        pValue: 0.003,
        confidenceInterval: [0.3, 0.9],
        nonInferiorityMargin: 0.3,
        nonInferiorityMet: true,
        superiorityDemonstrated: true
      },
      effectSize: {
        cohensD: 0.6,
        interpretation: "Medium to large effect",
        clinicallyMeaningful: true
      },
      numberNeededToTreat: 8,
      powerAnalysis: {
        achievedPower: 0.92,
        plannedPower: 0.80
      }
    }
  },

  "heart-ace-inhibitors-post-mi-2024": {
    studyId: "heart-ace-inhibitors-post-mi-2024",
    lastUpdated: "2024-08-01",

    treatmentArm: {
      armName: "Lisinopril + Standard Care",
      count: 156,

      demographics: {
        meanAge: 64.2,
        ageSD: 8.1,
        femalePercent: 28,
        meanBMI: 28.4
      },

      baselineCharacteristics: {
        meanEjectionFraction: 32.1,
        efSD: 6.2,
        meanSystolicBP: 125,
        anteriorMI: 89, // number of patients
        inferiorMI: 67,
        diabetesComorbidity: 47 // 30%
      },

      primaryOutcomes: {
        compositeEndpoint: {
          events: 23, // CV death + reinfarction + HF hospitalization
          eventRate: 14.7, // percentage
          timeToFirstEvent: 8.2 // months (median)
        },
        breakdown: {
          cardiovascularDeath: 6,
          reinfarction: 8,
          heartFailureHospitalization: 9
        }
      },

      secondaryOutcomes: {
        allCauseMortality: {
          deaths: 9,
          mortalityRate: 5.8
        },
        ejectionFractionChange: {
          baseline: 32.1,
          sixMonths: 38.7,
          improvement: 6.6
        },
        nyhaClass: {
          improvedByOneClass: 89,
          improvedByTwoClasses: 23
        }
      },

      safetyOutcomes: {
        hyperkalemia: 12,
        hypotension: 18,
        cough: 24,
        angioedema: 0,
        discontinuations: 9
      }
    },

    controlArm: {
      armName: "Standard Post-MI Care",
      count: 156,

      demographics: {
        meanAge: 63.8,
        ageSD: 8.4,
        femalePercent: 32,
        meanBMI: 29.1
      },

      baselineCharacteristics: {
        meanEjectionFraction: 31.8,
        efSD: 6.5,
        meanSystolicBP: 128,
        anteriorMI: 92,
        inferiorMI: 64,
        diabetesComorbidity: 51
      },

      primaryOutcomes: {
        compositeEndpoint: {
          events: 39,
          eventRate: 25.0,
          timeToFirstEvent: 5.1
        },
        breakdown: {
          cardiovascularDeath: 12,
          reinfarction: 14,
          heartFailureHospitalization: 13
        }
      },

      secondaryOutcomes: {
        allCauseMortality: {
          deaths: 15,
          mortalityRate: 9.6
        },
        ejectionFractionChange: {
          baseline: 31.8,
          sixMonths: 33.2,
          improvement: 1.4
        }
      },

      safetyOutcomes: {
        discontinuations: 9
      }
    },

    overallStatistics: {
      primaryAnalysis: {
        hazardRatio: 0.59,
        confidenceInterval: [0.36, 0.97],
        pValue: 0.036,
        relativeRiskReduction: 41.0,
        absoluteRiskReduction: 10.3,
        logRankTest: "p = 0.032"
      },
      numberNeededToTreat: 10,
      kaplanMeierMedian: {
        treatment: "Not reached",
        control: 18.3 // months
      },
      powerAnalysis: {
        achievedPower: 0.85
      }
    }
  },

  "cancer-immunotherapy-nsclc-2024": {
    studyId: "cancer-immunotherapy-nsclc-2024",
    lastUpdated: "2024-09-15",

    treatmentArm: {
      armName: "Pembrolizumab Monotherapy",
      count: 156,

      demographics: {
        meanAge: 65.8,
        ageSD: 9.2,
        femalePercent: 38,
        smokingHistory: {
          current: 45,
          former: 89,
          never: 22
        }
      },

      tumorCharacteristics: {
        pdl1TPS: {
          mean: 72.3,
          range: [50, 100]
        },
        histology: {
          adenocarcinoma: 102,
          squamousCell: 41,
          other: 13
        },
        stage: {
          IIIB: 18,
          IIIC: 23,
          IV: 115
        }
      },

      primaryOutcomes: {
        progressionFreeSurvival: {
          medianPFS: 12.8, // months
          confidenceInterval: [9.2, 16.4],
          sixMonthPFS: 68.2, // percentage
          twelveMonthPFS: 52.1
        }
      },

      secondaryOutcomes: {
        overallResponseRate: {
          completeResponse: 8,
          partialResponse: 67,
          objectiveResponseRate: 48.1, // percentage
          confidenceInterval: [40.2, 56.0]
        },
        overallSurvival: {
          medianOS: 22.1, // months
          confidenceInterval: [18.3, 28.7],
          twelveMonthSurvival: 74.2,
          twentyFourMonthSurvival: 51.3
        },
        durationOfResponse: {
          median: 18.2, // months
          range: [2.1, 24.8],
          responsesOngoing: 45 // at data cutoff
        },
        diseaseControlRate: {
          rate: 72.4, // ORR + stable disease
          stableDisease: 38
        }
      },

      safetyOutcomes: {
        treatmentRelatedAEs: {
          anyGrade: 118, // 75.6%
          grade3Plus: 23, // 14.7%
          fatal: 1
        },
        immuneRelatedAEs: {
          pneumonitis: 12,
          colitis: 8,
          hepatitis: 6,
          thyroiditis: 15,
          skinReactions: 28
        },
        discontinuations: {
          total: 28,
          dueToAE: 12,
          dueToProgression: 15,
          death: 1
        }
      }
    },

    // Note: Single-arm study, no control arm
    controlArm: null,

    overallStatistics: {
      primaryAnalysis: {
        medianPFS: 12.8,
        confidenceInterval: [9.2, 16.4],
        pValue: 0.021, // vs historical control
        historicalControl: 5.5 // months from literature
      },
      efficacyBenchmarks: {
        responseRateVsHistorical: {
          observed: 48.1,
          historical: 25.0,
          pValue: 0.008
        }
      },
      biomarkerAnalysis: {
        pdl1High: {
          responseRate: 52.3,
          medianPFS: 14.2
        },
        pdl1Moderate: {
          responseRate: 38.1,
          medianPFS: 9.8
        }
      }
    }
  },

  "hypertension-arb-african-american-2024": {
    studyId: "hypertension-arb-african-american-2024",
    lastUpdated: "2024-09-30",

    treatmentArm: {
      armName: "Losartan",
      count: 206,

      demographics: {
        meanAge: 54.2,
        ageSD: 8.9,
        femalePercent: 58,
        meanBMI: 31.2,
        bmiSD: 5.1
      },

      baselineCharacteristics: {
        meanSystolicBP: 156.3,
        systolicSD: 12.1,
        meanDiastolicBP: 98.7,
        diastolicSD: 7.8,
        diabetesComorbidity: 68, // 33%
        ckdStage2: 41 // 20%
      },

      primaryOutcomes: {
        systolicBPChange: {
          baseline: 156.3,
          threeMonths: 132.1,
          reduction: 24.2,
          standardDeviation: 11.3,
          confidenceInterval: [22.6, 25.8]
        },
        diastolicBPChange: {
          baseline: 98.7,
          threeMonths: 84.3,
          reduction: 14.4,
          standardDeviation: 8.2
        }
      },

      secondaryOutcomes: {
        bpTarget: {
          achieved140_90: 158, // 76.7%
          achieved130_80: 126 // 61.2%
        },
        ambulatoryBP: {
          daytimeSystolic: 128.4,
          nighttimeSystolic: 122.1
        },
        proteinuria: {
          baselineACR: 45.2, // mg/g
          threeMonthACR: 38.7,
          reduction: 14.4
        }
      },

      safetyOutcomes: {
        hyperkalemia: 8,
        dizziness: 15,
        fatigue: 12,
        angioedema: 0,
        discontinuations: 14
      }
    },

    controlArm: {
      armName: "Amlodipine",
      count: 206,

      demographics: {
        meanAge: 53.8,
        ageSD: 9.1,
        femalePercent: 55,
        meanBMI: 30.9
      },

      baselineCharacteristics: {
        meanSystolicBP: 157.1,
        systolicSD: 11.8,
        meanDiastolicBP: 99.2,
        diastolicSD: 8.1
      },

      primaryOutcomes: {
        systolicBPChange: {
          baseline: 157.1,
          threeMonths: 135.8,
          reduction: 21.3,
          standardDeviation: 10.8,
          confidenceInterval: [19.8, 22.8]
        },
        diastolicBPChange: {
          baseline: 99.2,
          threeMonths: 85.9,
          reduction: 13.3,
          standardDeviation: 7.9
        }
      },

      secondaryOutcomes: {
        bpTarget: {
          achieved140_90: 145, // 70.4%
          achieved130_80: 108 // 52.4%
        },
        ambulatoryBP: {
          daytimeSystolic: 131.2,
          nighttimeSystolic: 125.6
        }
      },

      safetyOutcomes: {
        peripheralEdema: 23,
        dizziness: 18,
        flushing: 12,
        discontinuations: 18
      }
    },

    overallStatistics: {
      primaryAnalysis: {
        treatmentDifference: 2.9, // SBP reduction difference (favoring losartan)
        standardError: 1.1,
        pValue: 0.008,
        confidenceInterval: [0.7, 5.1],
        superiority: true
      },
      responseRates: {
        losartanResponseRate: 76.7,
        amlodipineResponseRate: 70.4,
        oddsRatio: 1.38,
        pValue: 0.032
      },
      effectSize: {
        cohensD: 0.27,
        interpretation: "Small to medium effect"
      }
    }
  }
};

/**
 * Helper function to get cohort data by study ID
 */
function getCohortByStudyId(studyId) {
  return PATIENT_COHORTS[studyId];
}

/**
 * Helper function to calculate basic statistics for a study
 */
function calculateBasicStatistics(studyId) {
  const cohort = PATIENT_COHORTS[studyId];
  if (!cohort) return null;

  const treatmentCount = cohort.treatmentArm.count;
  const controlCount = cohort.controlArm?.count || 0;
  const totalCount = treatmentCount + controlCount;

  // For single-arm studies, use historical control or benchmark
  let pValue, effectSize;

  if (cohort.overallStatistics?.primaryAnalysis) {
    pValue = cohort.overallStatistics.primaryAnalysis.pValue;
    effectSize = cohort.overallStatistics.effectSize?.cohensD || 0.5;
  } else {
    // Default values for demonstration
    pValue = 0.025;
    effectSize = 0.6;
  }

  return {
    totalPatients: totalCount,
    treatmentGroup: treatmentCount,
    controlGroup: controlCount,
    pValue: pValue,
    effectSize: effectSize,
    statisticallySignificant: pValue < 0.05,
    clinicallyMeaningful: effectSize > 0.3
  };
}

/**
 * Helper function to get safety summary
 */
function getSafetySummary(studyId) {
  const cohort = PATIENT_COHORTS[studyId];
  if (!cohort) return null;

  const treatment = cohort.treatmentArm.safetyOutcomes;
  const control = cohort.controlArm?.safetyOutcomes;

  return {
    treatmentDiscontinuations: treatment.discontinuations?.total || 0,
    controlDiscontinuations: control?.discontinuations?.total || 0,
    seriousAdverseEvents: treatment.adverseEvents?.serious || 0,
    overallSafetyProfile: "Acceptable safety profile consistent with known drug effects"
  };
}

module.exports = {
  PATIENT_COHORTS,
  getCohortByStudyId,
  calculateBasicStatistics,
  getSafetySummary
};