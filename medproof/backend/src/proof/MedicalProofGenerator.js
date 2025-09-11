const crypto = require('crypto');

class MedicalProofGenerator {
    constructor() {
        this.buildDir = "build";
    }

    async generateMedicalStatsProof(studyData, salt) {
        try {
            const {
                patientCount,
                treatmentSuccess,
                controlSuccess,
                controlCount,
                pValue
            } = studyData;

            const pValueScaled = Math.floor(pValue * 10000);
            const commitment = patientCount + treatmentSuccess + controlSuccess + controlCount + pValueScaled + salt;

            console.log("Generating medical stats proof with input:", {
                patientCount,
                treatmentSuccess,
                controlSuccess,
                controlCount,
                pValueScaled
            });

            // Calculate outputs
            const minPatients = 100;
            const minEfficacyRate = 70; // 70% minimum efficacy
            const maxPValueScaled = 500; // p < 0.05
            
            const validSampleSize = patientCount >= minPatients ? 1 : 0;
            const efficacyRate = (treatmentSuccess * 100) / patientCount;
            const validEfficacy = efficacyRate >= minEfficacyRate ? 1 : 0;
            const validSignificance = pValueScaled < maxPValueScaled ? 1 : 0;
            const overallValid = validSampleSize && validEfficacy && validSignificance ? 1 : 0;

            // Generate mock proof structure
            const proof = {
                proof: {
                    pi_a: [this.generateHex(32), this.generateHex(32), "1"],
                    pi_b: [[this.generateHex(32), this.generateHex(32)], [this.generateHex(32), this.generateHex(32)], ["1", "0"]],
                    pi_c: [this.generateHex(32), this.generateHex(32), "1"],
                    protocol: "groth16",
                    curve: "bn128"
                },
                publicSignals: [
                    minPatients,
                    minEfficacyRate,
                    maxPValueScaled,
                    commitment,
                    validSampleSize,
                    validEfficacy,
                    validSignificance,
                    overallValid
                ],
                metadata: {
                    studyType: "treatment-efficacy",
                    efficacyRate: Math.round(efficacyRate),
                    sampleSize: patientCount,
                    pValue: pValue,
                    timestamp: new Date().toISOString()
                }
            };

            return proof;
        } catch (error) {
            console.error("Error generating medical stats proof:", error);
            throw error;
        }
    }

    generateHex(length) {
        return "0x" + crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length);
    }

    // Helper method to generate proofs for demo hospitals
    async generateDemoProofs() {
        const hospitals = [
            {
                name: "Metropolitan General Hospital",
                studyData: {
                    patientCount: 1200,
                    treatmentSuccess: 950,
                    controlSuccess: 480,
                    controlCount: 600,
                    pValue: 0.02
                }
            },
            {
                name: "Stanford Medical Center",
                studyData: {
                    patientCount: 800,
                    treatmentSuccess: 640,
                    controlSuccess: 280,
                    controlCount: 400,
                    pValue: 0.01
                }
            },
            {
                name: "Johns Hopkins Hospital",
                studyData: {
                    patientCount: 1500,
                    treatmentSuccess: 1125,
                    controlSuccess: 525,
                    controlCount: 750,
                    pValue: 0.005
                }
            }
        ];

        const proofs = [];
        
        for (let i = 0; i < hospitals.length; i++) {
            const hospital = hospitals[i];
            const salt = Math.floor(Math.random() * 1000000);
            
            const proof = await this.generateMedicalStatsProof(hospital.studyData, salt);
            proof.metadata.hospitalName = hospital.name;
            proof.metadata.hospitalId = i + 1;
            
            proofs.push(proof);
        }

        return proofs;
    }
}

module.exports = MedicalProofGenerator;