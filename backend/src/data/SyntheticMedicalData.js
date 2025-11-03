const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');

class SyntheticMedicalData {
    constructor() {
        this.conditions = [
            'type-2-diabetes',
            'hypertension',
            'cardiovascular-disease',
            'depression',
            'asthma',
            'chronic-pain',
            'obesity',
            'osteoarthritis'
        ];

        this.treatments = {
            'type-2-diabetes': [
                'metformin-therapy',
                'insulin-therapy',
                'lifestyle-intervention',
                'combination-therapy'
            ],
            'hypertension': [
                'ace-inhibitor',
                'beta-blocker',
                'diuretic',
                'calcium-channel-blocker'
            ],
            'cardiovascular-disease': [
                'statin-therapy',
                'antiplatelet-therapy',
                'cardiac-rehab',
                'lifestyle-modification'
            ],
            'depression': [
                'ssri-therapy',
                'cognitive-behavioral-therapy',
                'mindfulness-intervention',
                'combination-therapy'
            ]
        };

        this.demographics = {
            ageGroups: ['18-30', '31-45', '46-60', '61-75', '75+'],
            genders: ['male', 'female', 'other'],
            ethnicities: ['caucasian', 'african-american', 'hispanic', 'asian', 'other'],
            insuranceTypes: ['private', 'medicare', 'medicaid', 'uninsured']
        };

        this.hospitals = [
            {
                id: 'hosp_001',
                name: 'Metropolitan General Hospital',
                location: 'New York, NY',
                type: 'academic',
                size: 'large',
                specialties: ['cardiology', 'endocrinology', 'psychiatry']
            },
            {
                id: 'hosp_002',
                name: 'Stanford Medical Center',
                location: 'Stanford, CA',
                type: 'academic',
                size: 'large',
                specialties: ['oncology', 'neurology', 'endocrinology']
            },
            {
                id: 'hosp_003',
                name: 'Johns Hopkins Hospital',
                location: 'Baltimore, MD',
                type: 'academic',
                size: 'large',
                specialties: ['cardiology', 'oncology', 'infectious-diseases']
            },
            {
                id: 'hosp_004',
                name: 'Community Health Center',
                location: 'Austin, TX',
                type: 'community',
                size: 'medium',
                specialties: ['family-medicine', 'internal-medicine']
            },
            {
                id: 'hosp_005',
                name: 'Regional Medical Center',
                location: 'Denver, CO',
                type: 'regional',
                size: 'medium',
                specialties: ['emergency-medicine', 'surgery']
            }
        ];
    }

    generatePatient(condition = null) {
        const patientId = uuidv4();
        const age = this.randomAge();
        const gender = this.randomChoice(this.demographics.genders);
        const ethnicity = this.randomChoice(this.demographics.ethnicities);
        const insurance = this.randomChoice(this.demographics.insuranceTypes);

        return {
            id: patientId,
            age: age,
            gender: gender,
            ethnicity: ethnicity,
            insurance: insurance,
            condition: condition || this.randomChoice(this.conditions),
            enrollmentDate: this.randomDate(new Date('2020-01-01'), new Date('2024-01-01')),
            followUpMonths: this.randomInt(6, 24)
        };
    }

    generateHospitalCohort(hospitalId, size, condition, treatmentType = null) {
        const hospital = this.hospitals.find(h => h.id === hospitalId) || this.hospitals[0];
        const treatment = treatmentType || this.randomChoice(this.treatments[condition] || ['standard-care']);
        
        const patients = [];
        for (let i = 0; i < size; i++) {
            patients.push(this.generatePatient(condition));
        }

        const cohort = {
            hospitalId: hospitalId,
            hospitalName: hospital.name,
            studyId: uuidv4(),
            condition: condition,
            treatment: treatment,
            patients: patients,
            studyStartDate: new Date('2023-01-01'),
            studyEndDate: new Date('2024-01-01'),
            metadata: {
                totalPatients: size,
                averageAge: this.calculateAverageAge(patients),
                genderDistribution: this.calculateGenderDistribution(patients),
                ethnicityDistribution: this.calculateEthnicityDistribution(patients)
            }
        };

        return cohort;
    }

    generateTreatmentOutcomes(cohort, efficacyRate = 0.75, controlEfficacyRate = 0.45) {
        const treatmentGroup = cohort.patients.slice(0, Math.floor(cohort.patients.length * 0.6));
        const controlGroup = cohort.patients.slice(Math.floor(cohort.patients.length * 0.6));

        const treatmentOutcomes = treatmentGroup.map(patient => ({
            patientId: patient.id,
            group: 'treatment',
            outcome: Math.random() < efficacyRate ? 'improved' : 'no-improvement',
            baselineScore: this.randomInt(40, 80),
            followUpScore: Math.random() < efficacyRate ? 
                this.randomInt(70, 95) : this.randomInt(35, 75),
            adherence: this.randomFloat(0.6, 1.0),
            sideEffects: Math.random() < 0.1 ? ['mild-nausea'] : []
        }));

        const controlOutcomes = controlGroup.map(patient => ({
            patientId: patient.id,
            group: 'control',
            outcome: Math.random() < controlEfficacyRate ? 'improved' : 'no-improvement',
            baselineScore: this.randomInt(40, 80),
            followUpScore: Math.random() < controlEfficacyRate ? 
                this.randomInt(60, 85) : this.randomInt(35, 70),
            adherence: this.randomFloat(0.7, 1.0),
            sideEffects: []
        }));

        const treatmentSuccess = treatmentOutcomes.filter(o => o.outcome === 'improved').length;
        const controlSuccess = controlOutcomes.filter(o => o.outcome === 'improved').length;

        // Calculate statistical measures
        const actualTreatmentRate = treatmentSuccess / treatmentOutcomes.length;
        const actualControlRate = controlSuccess / controlOutcomes.length;
        const effectSize = this.calculateEffectSize(actualTreatmentRate, actualControlRate);
        const pValue = this.calculatePValue(treatmentSuccess, treatmentOutcomes.length, 
                                          controlSuccess, controlOutcomes.length);

        return {
            cohortId: cohort.studyId,
            treatmentOutcomes: treatmentOutcomes,
            controlOutcomes: controlOutcomes,
            statistics: {
                treatmentSuccessRate: actualTreatmentRate,
                controlSuccessRate: actualControlRate,
                treatmentN: treatmentOutcomes.length,
                controlN: controlOutcomes.length,
                effectSize: effectSize,
                pValue: pValue,
                confidenceInterval: this.calculateConfidenceInterval(
                    actualTreatmentRate, actualControlRate, 
                    treatmentOutcomes.length, controlOutcomes.length
                )
            }
        };
    }

    generateMultiSiteStudy(condition, treatmentType, hospitalIds = null) {
        const hospitals = hospitalIds ? 
            hospitalIds.map(id => this.hospitals.find(h => h.id === id)).filter(Boolean) :
            this.hospitals.slice(0, 3);

        const sites = hospitals.map(hospital => {
            const cohortSize = this.randomInt(200, 800);
            const cohort = this.generateHospitalCohort(hospital.id, cohortSize, condition, treatmentType);
            
            // Vary efficacy rates slightly between hospitals to simulate real-world variation
            const baseEfficacy = 0.75;
            const hospitalEfficacy = baseEfficacy + this.randomFloat(-0.1, 0.1);
            const controlEfficacy = 0.45 + this.randomFloat(-0.05, 0.05);
            
            const outcomes = this.generateTreatmentOutcomes(cohort, hospitalEfficacy, controlEfficacy);
            
            return {
                hospital: hospital,
                cohort: cohort,
                outcomes: outcomes
            };
        });

        return {
            studyId: uuidv4(),
            condition: condition,
            treatment: treatmentType,
            sites: sites,
            aggregateStats: this.aggregateSiteStatistics(sites),
            timestamp: new Date().toISOString()
        };
    }

    aggregateSiteStatistics(sites) {
        const totalTreatmentN = sites.reduce((sum, site) => sum + site.outcomes.statistics.treatmentN, 0);
        const totalControlN = sites.reduce((sum, site) => sum + site.outcomes.statistics.controlN, 0);
        const totalTreatmentSuccess = sites.reduce((sum, site) => 
            sum + (site.outcomes.statistics.treatmentSuccessRate * site.outcomes.statistics.treatmentN), 0);
        const totalControlSuccess = sites.reduce((sum, site) => 
            sum + (site.outcomes.statistics.controlSuccessRate * site.outcomes.statistics.controlN), 0);

        const aggregateTreatmentRate = totalTreatmentSuccess / totalTreatmentN;
        const aggregateControlRate = totalControlSuccess / totalControlN;
        const aggregateEffectSize = this.calculateEffectSize(aggregateTreatmentRate, aggregateControlRate);
        const aggregatePValue = this.calculatePValue(totalTreatmentSuccess, totalTreatmentN,
                                                   totalControlSuccess, totalControlN);

        return {
            totalSites: sites.length,
            totalTreatmentN: totalTreatmentN,
            totalControlN: totalControlN,
            aggregateTreatmentRate: aggregateTreatmentRate,
            aggregateControlRate: aggregateControlRate,
            effectSize: aggregateEffectSize,
            pValue: aggregatePValue,
            heterogeneity: this.calculateHeterogeneity(sites)
        };
    }

    // Statistical calculation methods
    calculateEffectSize(treatmentRate, controlRate) {
        const pooledSD = Math.sqrt(((treatmentRate * (1 - treatmentRate)) + 
                                   (controlRate * (1 - controlRate))) / 2);
        return pooledSD > 0 ? (treatmentRate - controlRate) / pooledSD : 0;
    }

    calculatePValue(treatmentSuccess, treatmentN, controlSuccess, controlN) {
        // Simplified chi-square test
        const totalSuccess = treatmentSuccess + controlSuccess;
        const totalN = treatmentN + controlN;
        const expectedTreatmentSuccess = (totalSuccess * treatmentN) / totalN;
        const expectedControlSuccess = (totalSuccess * controlN) / totalN;
        
        const chiSquare = Math.pow(treatmentSuccess - expectedTreatmentSuccess, 2) / expectedTreatmentSuccess +
                         Math.pow(controlSuccess - expectedControlSuccess, 2) / expectedControlSuccess;
        
        // Approximate p-value (simplified)
        if (chiSquare < 3.84) return this.randomFloat(0.05, 0.5);
        if (chiSquare < 6.63) return this.randomFloat(0.01, 0.05);
        if (chiSquare < 10.83) return this.randomFloat(0.001, 0.01);
        return this.randomFloat(0.0001, 0.001);
    }

    calculateConfidenceInterval(treatmentRate, controlRate, treatmentN, controlN) {
        const diff = treatmentRate - controlRate;
        const se = Math.sqrt((treatmentRate * (1 - treatmentRate)) / treatmentN + 
                           (controlRate * (1 - controlRate)) / controlN);
        const margin = 1.96 * se; // 95% CI
        
        return {
            lowerBound: diff - margin,
            upperBound: diff + margin
        };
    }

    calculateHeterogeneity(sites) {
        if (sites.length < 2) return 0;
        
        const rates = sites.map(site => site.outcomes.statistics.treatmentSuccessRate);
        const mean = rates.reduce((sum, rate) => sum + rate, 0) / rates.length;
        const variance = rates.reduce((sum, rate) => sum + Math.pow(rate - mean, 2), 0) / rates.length;
        
        return variance; // Simplified measure of between-study heterogeneity
    }

    // Utility methods
    calculateAverageAge(patients) {
        return patients.reduce((sum, p) => sum + p.age, 0) / patients.length;
    }

    calculateGenderDistribution(patients) {
        const distribution = {};
        patients.forEach(p => {
            distribution[p.gender] = (distribution[p.gender] || 0) + 1;
        });
        return distribution;
    }

    calculateEthnicityDistribution(patients) {
        const distribution = {};
        patients.forEach(p => {
            distribution[p.ethnicity] = (distribution[p.ethnicity] || 0) + 1;
        });
        return distribution;
    }

    randomAge() {
        return this.randomInt(18, 85);
    }

    randomChoice(array) {
        return array[Math.floor(Math.random() * array.length)];
    }

    randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    randomFloat(min, max) {
        return Math.random() * (max - min) + min;
    }

    randomDate(start, end) {
        return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    }

    // Generate demo datasets for hackathon
    generateDemoDatasets() {
        const datasets = [
            {
                name: "Diabetes Treatment Efficacy Study",
                study: this.generateMultiSiteStudy('type-2-diabetes', 'metformin-therapy')
            },
            {
                name: "Hypertension Management Study", 
                study: this.generateMultiSiteStudy('hypertension', 'ace-inhibitor')
            },
            {
                name: "Depression Treatment Response Study",
                study: this.generateMultiSiteStudy('depression', 'ssri-therapy')
            }
        ];

        return datasets;
    }
}

module.exports = SyntheticMedicalData;