#!/usr/bin/env node

/**
 * Test script to verify that study parameters correctly influence proof generation
 */

const axios = require('axios');

const testScenarios = [
    {
        name: "Diabetes Drug Study - Young Adults",
        studyData: {
            studyId: "diabetes_drug_young_2024",
            condition: "diabetes",
            queryType: "treatment_outcomes",
            treatment: "pharmaceutical",
            studyTitle: "Novel Diabetes Drug for Young Adults",
            ageRange: { min: 20, max: 35 },
            gender: "all",
            timeframe: "12_months",
            patientCount: 500
        }
    },
    {
        name: "Heart Disease Surgery - Elderly",
        studyData: {
            studyId: "heart_surgery_elderly_2024",
            condition: "heart_disease",
            queryType: "treatment_outcomes",
            treatment: "surgical",
            studyTitle: "Surgical Intervention for Elderly Heart Disease",
            ageRange: { min: 65, max: 85 },
            gender: "all",
            timeframe: "6_months",
            patientCount: 300
        }
    },
    {
        name: "Cancer Cohort Analysis",
        studyData: {
            studyId: "cancer_cohort_2024",
            condition: "cancer",
            queryType: "cohort_analysis",
            treatment: "therapeutic",
            studyTitle: "Cancer Treatment Cohort Analysis",
            ageRange: { min: 40, max: 70 },
            gender: "all",
            timeframe: "24_months",
            patientCount: 1000
        }
    }
];

async function testParameterAccuracy() {
    console.log('🔬 Testing Parameter Accuracy in ZK Proof Generation\n');

    const results = [];

    for (const scenario of testScenarios) {
        console.log(`\n📋 Testing: ${scenario.name}`);
        console.log('Parameters:', {
            condition: scenario.studyData.condition,
            queryType: scenario.studyData.queryType,
            ageRange: scenario.studyData.ageRange,
            studyTitle: scenario.studyData.studyTitle,
            patientCount: scenario.studyData.patientCount
        });

        try {
            const response = await axios.post('http://localhost:3001/api/generate-proof', {
                studyData: scenario.studyData,
                hospitalId: 'test-hospital-001',
                organizationId: 'test-org-001',
                privacySettings: {
                    disclosureLevel: 'medium',
                    allowRegulatorAccess: true,
                    allowResearcherAccess: true
                },
                useMidnightNetwork: true,
                metadata: {
                    testScenario: scenario.name
                }
            });

            if (response.data.success) {
                const insights = response.data.researchInsights;
                const result = {
                    scenario: scenario.name,
                    condition: scenario.studyData.condition,
                    queryType: scenario.studyData.queryType,
                    ageRange: scenario.studyData.ageRange,
                    treatmentEfficacy: insights.treatmentEfficacy.absoluteImprovement,
                    effectSize: insights.treatmentEfficacy.effectSize,
                    sampleSize: insights.studyCharacteristics.sampleSize,
                    pValue: insights.studyCharacteristics.pValue,
                    clinicalSignificance: insights.clinicalSignificance.meaningfulDifference,
                    networkUsed: response.data.proof.networkUsed,
                    verified: response.data.proof.verified
                };

                results.push(result);

                console.log('✅ Results:');
                console.log(`   Treatment Efficacy: ${result.treatmentEfficacy}`);
                console.log(`   Effect Size: ${result.effectSize}`);
                console.log(`   Sample Size: ${result.sampleSize}`);
                console.log(`   P-Value: ${result.pValue}`);
                console.log(`   Clinical Significance: ${result.clinicalSignificance}`);
                console.log(`   ZK Proof Verified: ${result.verified}`);

            } else {
                console.log('❌ Failed:', response.data.error);
            }

        } catch (error) {
            console.log('❌ Error:', error.response?.data?.error || error.message);
        }

        // Wait between requests
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log('\n\n📊 PARAMETER ACCURACY ANALYSIS');
    console.log('='.repeat(50));

    // Analyze if results vary appropriately based on parameters
    if (results.length >= 2) {
        console.log('\n🔍 Comparing Results Across Different Parameters:');

        for (let i = 0; i < results.length; i++) {
            console.log(`\n${i + 1}. ${results[i].scenario}:`);
            console.log(`   Condition: ${results[i].condition}`);
            console.log(`   Query Type: ${results[i].queryType}`);
            console.log(`   Age Range: ${results[i].ageRange.min}-${results[i].ageRange.max}`);
            console.log(`   Treatment Effect: ${results[i].treatmentEfficacy}`);
            console.log(`   Effect Size: ${results[i].effectSize}`);
        }

        // Check for parameter-specific variations
        const uniqueConditions = [...new Set(results.map(r => r.condition))];
        const uniqueQueryTypes = [...new Set(results.map(r => r.queryType))];
        const uniqueEffectSizes = [...new Set(results.map(r => r.effectSize))];

        console.log('\n✅ VERIFICATION RESULTS:');
        console.log(`• Different conditions tested: ${uniqueConditions.length} (${uniqueConditions.join(', ')})`);
        console.log(`• Different query types tested: ${uniqueQueryTypes.length} (${uniqueQueryTypes.join(', ')})`);
        console.log(`• Different effect sizes generated: ${uniqueEffectSizes.length} (${uniqueEffectSizes.join(', ')})`);

        if (uniqueConditions.length > 1 && uniqueEffectSizes.length > 1) {
            console.log('🎯 PARAMETER INTEGRATION: ✅ WORKING CORRECTLY');
            console.log('   Different study parameters are producing different outcomes');
        } else {
            console.log('⚠️  PARAMETER INTEGRATION: May need review');
            console.log('   Similar outcomes across different parameters');
        }
    }
}

// Run the test
testParameterAccuracy().catch(console.error);