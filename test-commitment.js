const crypto = require('crypto');

// Study data from the API
const study = {
  "studyId": "diabetes-metformin-elderly-2024",
  "hospitalId": "hospital-001",
  "hospitalName": "Metro General Hospital",
  "status": "completed",
  "metadata": {
    "title": "Metformin Efficacy in Elderly Type 2 Diabetes Patients",
    "shortTitle": "Metformin in Elderly T2DM",
    "description": "A randomized controlled trial comparing metformin extended-release versus insulin glargine in patients aged 65-85 with type 2 diabetes mellitus",
    "therapeuticArea": "Endocrinology",
    "phase": "Phase IV",
    "condition": {
      "code": "E11",
      "display": "Type 2 Diabetes Mellitus",
      "system": "ICD-10"
    },
    "treatment": {
      "display": "Metformin Extended-Release 1000mg",
      "dosing": "1000mg twice daily with meals"
    },
    "comparator": {
      "display": "Insulin Glargine",
      "dosing": "Starting dose 10 units/day, titrated to target"
    }
  },
  "protocol": {
    "inclusionCriteria": {
      "ageRange": {
        "min": 65,
        "max": 85
      },
      "gender": "all",
      "hba1cRange": {
        "min": 7,
        "max": 10
      },
      "bmiRange": {
        "min": 25,
        "max": 40
      },
      "diabetesDuration": {
        "min": 2,
        "max": 20,
        "unit": "years"
      },
      "requiredDiagnosis": [
        "Type 2 Diabetes Mellitus"
      ],
      "functionalStatus": "Able to self-administer medication"
    },
    "primaryEndpoint": {
      "measure": "Change in HbA1c from baseline",
      "timepoint": "6 months",
      "successCriteria": "Non-inferiority margin of 0.3%",
      "statisticalTest": "ANCOVA with baseline as covariate"
    },
    "duration": "6 months",
    "designType": "randomized-controlled-trial",
    "blinding": "open-label"
  },
  "enrollment": {
    "actualSize": 487,
    "completers": 464
  },
  "timeline": {
    "completed": "2024-05-01"
  },
  "qualityMetrics": {
    "dataCompleteness": 98.5,
    "qualityScore": 95
  },
  "efficacySignal": {
    "primaryEndpointMet": true,
    "statisticallySignificant": true,
    "clinicallyMeaningful": true
  }
};

// Frontend-style commitment generation (simplified - matching frontend logic)
function generateStudyCommitment(study) {
  console.log('🔒 Test Frontend: Generating study commitment for:', study.studyId);
  console.log('🔍 Test Frontend: Original study object:', study);

  // Create canonical study representation (matching backend logic)
  const canonicalStudy = {
    studyId: study.studyId,
    hospitalId: study.hospitalId,
    condition: {
      code: study.metadata.condition.code,
      system: study.metadata.condition.system || 'ICD-10',
      display: study.metadata.condition.display
    },
    treatment: {
      code: study.metadata.treatment.code || study.metadata.treatment.display,
      display: study.metadata.treatment.display,
      dosing: study.metadata.treatment.dosing || ''
    },
    comparator: study.metadata.comparator ? {
      code: study.metadata.comparator.code || study.metadata.comparator.display,
      display: study.metadata.comparator.display,
      dosing: study.metadata.comparator.dosing || ''
    } : null,
    inclusionCriteria: {
      ageMin: study.protocol.inclusionCriteria.ageRange.min,
      ageMax: study.protocol.inclusionCriteria.ageRange.max,
      gender: study.protocol.inclusionCriteria.gender,
      // Add other criteria as ordered keys (matching backend)
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
    primaryEndpoint: {
      measure: study.protocol.primaryEndpoint?.measure || '',
      timepoint: study.protocol.primaryEndpoint?.timepoint || ''
    },
    studyDesign: {
      type: study.protocol.studyDesign?.type || study.protocol.designType,
      duration: study.protocol.studyDesign?.duration || study.protocol.duration,
      blinding: study.protocol.studyDesign?.blinding || study.protocol.blinding || 'open-label',
      randomization: study.protocol.studyDesign?.randomization || 'none'
    },
    enrollment: {
      targetSize: study.enrollment?.targetSize || study.enrollment?.actualSize || 0,
      actualSize: study.enrollment?.actualSize || 0
    },
    regulatory: {
      irbNumber: study.regulatory?.irbNumber || '',
      clinicalTrialsId: study.regulatory?.clinicalTrialsId || ''
    }
  };

  console.log('📋 Test Frontend: Canonical study before sorting:', canonicalStudy);

  // Sort keys recursively for deterministic hash (matching backend logic)
  function sortObjectKeys(obj) {
    if (obj === null || typeof obj !== 'object' || obj instanceof Array) {
      return obj;
    }
    const sortedObj = {};
    const keys = Object.keys(obj).sort();
    for (const key of keys) {
      sortedObj[key] = sortObjectKeys(obj[key]);
    }
    return sortedObj;
  }

  const sortedCanonicalStudy = sortObjectKeys(canonicalStudy);
  const studyString = JSON.stringify(sortedCanonicalStudy);

  console.log('🔄 Test Frontend: Sorted canonical study:', sortedCanonicalStudy);
  console.log('📝 Test Frontend: Study string for hashing:', studyString);

  // Generate SHA-256 hash
  const hashHex = crypto.createHash('sha256').update(studyString).digest('hex');
  console.log('✅ Test Frontend: Generated commitment hash:', hashHex.slice(0, 16) + '...');
  console.log('✅ Test Frontend: Full hash:', hashHex);
  return hashHex;
}

// Generate commitment
const studyCommitment = generateStudyCommitment(study);

// Create test proof request
const testRequest = {
  agreementId: 'test-agreement-123',
  studyId: study.studyId,
  studyTitle: study.metadata.title,
  studyCommitment: studyCommitment,
  patientCriteria: {
    ageRange: { min: 65, max: 85 },
    condition: 'Type 2 Diabetes Mellitus',
    timeframe: '12_months'
  },
  privacyLevel: 'high'
};

console.log('\n📨 Test Request Payload:', JSON.stringify(testRequest, null, 2));