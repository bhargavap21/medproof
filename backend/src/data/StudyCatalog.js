/**
 * Study Catalog - Pre-defined completed medical studies
 *
 * This database contains completed clinical studies that hospitals have conducted.
 * Each study has fixed parameters that cannot be manipulated after the fact.
 * The ZK proof system will verify that statistics match these specific studies.
 */

const AVAILABLE_STUDIES = [
  {
    studyId: "diabetes-metformin-elderly-2024",
    hospitalId: "hospital-001",
    hospitalName: "Metro General Hospital",
    status: "completed",

    metadata: {
      title: "Metformin Efficacy in Elderly Type 2 Diabetes Patients",
      shortTitle: "Metformin in Elderly T2DM",
      description: "A randomized controlled trial comparing metformin extended-release versus insulin glargine in patients aged 65-85 with type 2 diabetes mellitus",
      therapeuticArea: "Endocrinology",
      phase: "Phase IV",

      condition: {
        code: "E11",
        system: "ICD-10",
        display: "Type 2 Diabetes Mellitus",
        keywords: ["diabetes", "T2DM", "metabolic disorder", "hyperglycemia"]
      },

      treatment: {
        code: "6809",
        system: "RxNorm",
        display: "Metformin Extended-Release 1000mg",
        dosing: "1000mg twice daily with meals",
        route: "oral"
      },

      comparator: {
        code: "5856",
        system: "RxNorm",
        display: "Insulin Glargine",
        dosing: "Starting dose 10 units/day, titrated to target",
        route: "subcutaneous injection"
      }
    },

    protocol: {
      inclusionCriteria: {
        ageRange: { min: 65, max: 85 },
        gender: "all",
        hba1cRange: { min: 7.0, max: 10.0 },
        bmiRange: { min: 25, max: 40 },
        diabetesDuration: { min: 2, max: 20, unit: "years" },
        requiredDiagnosis: ["Type 2 Diabetes Mellitus"],
        functionalStatus: "Able to self-administer medication"
      },

      exclusionCriteria: [
        "Chronic kidney disease stage 4-5 (eGFR < 30)",
        "Hepatic impairment (ALT/AST > 3x ULN)",
        "Pregnancy or lactation",
        "Type 1 diabetes",
        "Active malignancy",
        "Heart failure NYHA Class III-IV",
        "History of lactic acidosis",
        "Contraindication to metformin"
      ],

      primaryEndpoint: {
        measure: "Change in HbA1c from baseline",
        timepoint: "6 months",
        successCriteria: "Non-inferiority margin of 0.3%",
        statisticalTest: "ANCOVA with baseline as covariate"
      },

      secondaryEndpoints: [
        {
          measure: "Weight change from baseline",
          timepoint: "6 months"
        },
        {
          measure: "Hypoglycemic events (blood glucose < 70 mg/dL)",
          timepoint: "Throughout study"
        },
        {
          measure: "Quality of life score (SF-36)",
          timepoint: "6 months"
        },
        {
          measure: "Treatment adherence rate",
          timepoint: "6 months"
        }
      ],

      safetyEndpoints: [
        "Serious adverse events",
        "Gastrointestinal adverse events",
        "Lactic acidosis events",
        "Falls and fractures"
      ],

      studyDesign: {
        type: "randomized-controlled-trial",
        randomization: "1:1",
        blinding: "open-label",
        allocation: "stratified by baseline HbA1c",
        duration: "6 months",
        followUp: "Monthly visits"
      }
    },

    enrollment: {
      targetSize: 500,
      actualSize: 487,
      screenFailures: 62,
      withdrawals: {
        total: 23,
        treatment: 11,
        control: 12,
        reasons: {
          adverseEvents: 8,
          lostToFollowUp: 7,
          withdrawnConsent: 5,
          protocolViolation: 3
        }
      },
      completers: {
        total: 464,
        treatment: 232,
        control: 232
      }
    },

    timeline: {
      irbApproval: "2023-04-15",
      firstPatientIn: "2023-06-01",
      lastPatientIn: "2023-09-30",
      lastPatientOut: "2024-03-30",
      databaseLock: "2024-04-15",
      analysisComplete: "2024-05-01"
    },

    regulatory: {
      irbNumber: "IRB-2023-0456",
      clinicalTrialsId: "NCT05123456",
      fdaInd: null,
      dataMonitoring: "Independent Data Safety Monitoring Board",
      ethicsApproval: "Approved with expedited review"
    },

    dataAvailable: true,
    dataCompleteness: 98.5,
    qualityScore: 95
  },

  {
    studyId: "heart-ace-inhibitors-post-mi-2024",
    hospitalId: "hospital-002",
    hospitalName: "University Medical Center",
    status: "completed",

    metadata: {
      title: "ACE Inhibitors in Post-Myocardial Infarction Patients with Reduced Ejection Fraction",
      shortTitle: "ACE-I Post-MI with Low EF",
      description: "Randomized trial evaluating early initiation of lisinopril versus standard care in post-MI patients with EF ≤40%",
      therapeuticArea: "Cardiology",
      phase: "Phase IV",

      condition: {
        code: "I21",
        system: "ICD-10",
        display: "Acute Myocardial Infarction",
        keywords: ["heart attack", "MI", "STEMI", "NSTEMI", "coronary"]
      },

      treatment: {
        code: "29046",
        system: "RxNorm",
        display: "Lisinopril 10mg",
        dosing: "Starting 2.5mg daily, titrated to 10mg daily",
        route: "oral"
      },

      comparator: {
        code: "standard-care",
        system: "custom",
        display: "Standard Post-MI Care without ACE-I",
        dosing: "Beta-blockers, antiplatelets, statins as indicated",
        route: "various"
      }
    },

    protocol: {
      inclusionCriteria: {
        ageRange: { min: 45, max: 80 },
        gender: "all",
        ejectionFraction: { max: 40, unit: "percent" },
        timeFromMI: { max: 7, unit: "days" },
        requiredDiagnosis: ["Acute myocardial infarction"],
        hemodynamics: "Systolic BP > 100 mmHg"
      },

      exclusionCriteria: [
        "Cardiogenic shock",
        "Serum creatinine > 2.5 mg/dL",
        "Bilateral renal artery stenosis",
        "Hyperkalemia (K+ > 5.5 mEq/L)",
        "History of ACE inhibitor intolerance",
        "Pregnancy",
        "Life expectancy < 12 months"
      ],

      primaryEndpoint: {
        measure: "Composite of CV death, reinfarction, or hospitalization for heart failure",
        timepoint: "12 months",
        successCriteria: "20% relative risk reduction",
        statisticalTest: "Cox proportional hazards model"
      },

      secondaryEndpoints: [
        {
          measure: "All-cause mortality",
          timepoint: "12 months"
        },
        {
          measure: "Change in ejection fraction",
          timepoint: "6 months"
        },
        {
          measure: "NYHA functional class",
          timepoint: "12 months"
        }
      ],

      studyDesign: {
        type: "randomized-controlled-trial",
        randomization: "1:1",
        blinding: "open-label",
        allocation: "block randomization",
        duration: "12 months",
        followUp: "Monthly for 3 months, then quarterly"
      }
    },

    enrollment: {
      targetSize: 300,
      actualSize: 312,
      screenFailures: 48,
      withdrawals: {
        total: 18,
        treatment: 9,
        control: 9
      },
      completers: {
        total: 294,
        treatment: 147,
        control: 147
      }
    },

    timeline: {
      irbApproval: "2022-11-01",
      firstPatientIn: "2023-01-15",
      lastPatientIn: "2023-06-30",
      lastPatientOut: "2024-06-30",
      databaseLock: "2024-07-15",
      analysisComplete: "2024-08-01"
    },

    regulatory: {
      irbNumber: "IRB-2022-1189",
      clinicalTrialsId: "NCT05234567",
      fdaInd: null,
      dataMonitoring: "DSMB with quarterly reviews",
      ethicsApproval: "Full board approval"
    },

    dataAvailable: true,
    dataCompleteness: 97.2,
    qualityScore: 94
  },

  {
    studyId: "cancer-immunotherapy-nsclc-2024",
    hospitalId: "hospital-003",
    hospitalName: "Regional Cancer Center",
    status: "completed",

    metadata: {
      title: "Pembrolizumab Monotherapy in Advanced NSCLC with High PD-L1 Expression",
      shortTitle: "Pembrolizumab in PD-L1+ NSCLC",
      description: "Single-arm study of pembrolizumab in treatment-naive advanced non-small cell lung cancer with PD-L1 TPS ≥50%",
      therapeuticArea: "Oncology",
      phase: "Phase IIIb",

      condition: {
        code: "C34",
        system: "ICD-10",
        display: "Malignant Neoplasm of Lung",
        keywords: ["NSCLC", "lung cancer", "adenocarcinoma", "squamous cell"]
      },

      treatment: {
        code: "1547220",
        system: "RxNorm",
        display: "Pembrolizumab 200mg",
        dosing: "200mg IV every 3 weeks",
        route: "intravenous infusion"
      },

      comparator: null // Single-arm study
    },

    protocol: {
      inclusionCriteria: {
        ageRange: { min: 18, max: 75 },
        gender: "all",
        pdl1Expression: { min: 50, unit: "TPS percentage" },
        stage: ["IIIB", "IIIC", "IV"],
        performanceStatus: { max: 1, scale: "ECOG" },
        requiredDiagnosis: ["Non-small cell lung cancer"],
        treatmentNaive: true
      },

      exclusionCriteria: [
        "EGFR or ALK positive mutations",
        "Active brain metastases",
        "Active autoimmune disease",
        "Prior immunotherapy",
        "Interstitial lung disease",
        "HIV, Hepatitis B or C infection",
        "Systemic immunosuppression"
      ],

      primaryEndpoint: {
        measure: "Progression-free survival",
        timepoint: "Median",
        successCriteria: "Median PFS > 10 months",
        statisticalTest: "Kaplan-Meier analysis"
      },

      secondaryEndpoints: [
        {
          measure: "Overall response rate (RECIST 1.1)",
          timepoint: "Best response"
        },
        {
          measure: "Overall survival",
          timepoint: "24 months"
        },
        {
          measure: "Duration of response",
          timepoint: "Median"
        },
        {
          measure: "Disease control rate",
          timepoint: "16 weeks"
        }
      ],

      studyDesign: {
        type: "single-arm-study",
        randomization: "none",
        blinding: "open-label",
        allocation: "sequential enrollment",
        duration: "24 months",
        followUp: "Every 3 weeks for treatment, then every 12 weeks"
      }
    },

    enrollment: {
      targetSize: 150,
      actualSize: 156,
      screenFailures: 42,
      withdrawals: {
        total: 28,
        reasons: {
          diseaseProgression: 15,
          adverseEvents: 8,
          death: 3,
          withdrawnConsent: 2
        }
      },
      completers: {
        total: 128
      }
    },

    timeline: {
      irbApproval: "2022-06-01",
      firstPatientIn: "2022-08-15",
      lastPatientIn: "2023-08-15",
      lastPatientOut: "2024-08-15",
      databaseLock: "2024-09-01",
      analysisComplete: "2024-09-15"
    },

    regulatory: {
      irbNumber: "IRB-2022-0567",
      clinicalTrialsId: "NCT05345678",
      fdaInd: "IND-145678",
      dataMonitoring: "Independent radiological review committee",
      ethicsApproval: "Full board approval with enhanced safety monitoring"
    },

    dataAvailable: true,
    dataCompleteness: 96.8,
    qualityScore: 93
  },

  {
    studyId: "hypertension-arb-african-american-2024",
    hospitalId: "hospital-001",
    hospitalName: "Metro General Hospital",
    status: "completed",

    metadata: {
      title: "Losartan versus Amlodipine in African American Patients with Hypertension",
      shortTitle: "ARB vs CCB in African Americans",
      description: "Comparative effectiveness trial of losartan versus amlodipine in African American adults with stage 2 hypertension",
      therapeuticArea: "Cardiovascular",
      phase: "Phase IV",

      condition: {
        code: "I10",
        system: "ICD-10",
        display: "Essential Hypertension",
        keywords: ["high blood pressure", "hypertension", "HTN"]
      },

      treatment: {
        code: "52175",
        system: "RxNorm",
        display: "Losartan 50mg",
        dosing: "50mg once daily, titrated to 100mg if needed",
        route: "oral"
      },

      comparator: {
        code: "17767",
        system: "RxNorm",
        display: "Amlodipine 5mg",
        dosing: "5mg once daily, titrated to 10mg if needed",
        route: "oral"
      }
    },

    protocol: {
      inclusionCriteria: {
        ageRange: { min: 35, max: 70 },
        gender: "all",
        race: "African American self-identified",
        bloodPressure: {
          systolic: { min: 140, max: 180 },
          diastolic: { min: 90, max: 110 }
        },
        requiredDiagnosis: ["Essential hypertension"]
      },

      exclusionCriteria: [
        "Secondary hypertension",
        "Chronic kidney disease stage 4-5",
        "History of angioedema",
        "Pregnancy or planning pregnancy",
        "Bilateral renal artery stenosis",
        "Heart failure with reduced EF"
      ],

      primaryEndpoint: {
        measure: "Mean change in office systolic blood pressure",
        timepoint: "3 months",
        successCriteria: "Superiority with p < 0.05",
        statisticalTest: "ANCOVA adjusted for baseline BP"
      },

      studyDesign: {
        type: "randomized-controlled-trial",
        randomization: "1:1",
        blinding: "double-blind",
        allocation: "computer-generated",
        duration: "6 months",
        followUp: "Monthly"
      }
    },

    enrollment: {
      targetSize: 400,
      actualSize: 412,
      screenFailures: 58,
      completers: {
        total: 380,
        treatment: 190,
        control: 190
      }
    },

    timeline: {
      irbApproval: "2023-07-01",
      firstPatientIn: "2023-09-01",
      lastPatientIn: "2024-02-28",
      lastPatientOut: "2024-08-31",
      analysisComplete: "2024-09-30"
    },

    regulatory: {
      irbNumber: "IRB-2023-0789",
      clinicalTrialsId: "NCT05456789",
      ethicsApproval: "Approved with special population considerations"
    },

    dataAvailable: true,
    dataCompleteness: 99.1,
    qualityScore: 96
  }
];

/**
 * Helper function to get all available studies
 */
function getAllStudies() {
  return AVAILABLE_STUDIES;
}

/**
 * Helper function to get studies by hospital
 */
function getStudiesByHospital(hospitalId) {
  return AVAILABLE_STUDIES.filter(study => study.hospitalId === hospitalId);
}

/**
 * Helper function to get study by ID
 */
function getStudyById(studyId) {
  return AVAILABLE_STUDIES.find(study => study.studyId === studyId);
}

/**
 * Helper function to get studies by condition
 */
function getStudiesByCondition(conditionCode) {
  return AVAILABLE_STUDIES.filter(study =>
    study.metadata.condition.code === conditionCode
  );
}

/**
 * Helper function to get completed studies with available data
 */
function getAvailableStudiesForProof() {
  return AVAILABLE_STUDIES.filter(study =>
    study.status === 'completed' &&
    study.dataAvailable === true &&
    study.dataCompleteness > 95
  );
}

module.exports = {
  AVAILABLE_STUDIES,
  getAllStudies,
  getStudiesByHospital,
  getStudyById,
  getStudiesByCondition,
  getAvailableStudiesForProof
};