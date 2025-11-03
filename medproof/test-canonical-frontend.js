const crypto = require('crypto');
const axios = require('axios');

async function testCanonicalCommitment() {
  try {
    console.log('🧪 Testing frontend commitment generation with canonical data...');

    // Fetch canonical study data
    const response = await axios.get('http://localhost:3001/api/studies/diabetes-metformin-elderly-2024/canonical');
    const study = response.data.study;

    console.log('📚 Got canonical study:', study.studyId);
    console.log('🔍 Treatment code:', study.metadata.treatment.code);
    console.log('🔍 Regulatory:', study.regulatory);

    // Generate commitment using same logic as frontend
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
    const hashHex = crypto.createHash('sha256').update(studyString).digest('hex');

    console.log('✅ Frontend with canonical data:', hashHex.slice(0, 16) + '...');
    console.log('✅ Expected backend hash: 3f7a6c6cf59ca1c8...');
    console.log('✅ Match?', hashHex.startsWith('3f7a6c6cf59ca1c8') ? 'YES! 🎉' : 'NO ❌');

    return hashHex;
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testCanonicalCommitment();