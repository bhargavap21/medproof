const snarkjs = require("snarkjs");
const fs = require("fs");
const path = require("path");

class MedicalProofGenerator {
    constructor() {
        this.buildDir = path.join(__dirname, "../build");
    }

    async generateRangeProof(value, minValue, maxValue, salt) {
        try {
            // Create commitment (simplified hash)
            const commitment = value + salt;

            const input = {
                value: value,
                salt: salt,
                min_value: minValue,
                max_value: maxValue,
                commitment: commitment
            };

            console.log("Generating range proof with input:", input);

            // In a real implementation, you would use compiled circom circuits
            // For now, we'll create a mock proof structure
            const proof = {
                proof: {
                    pi_a: ["0x123", "0x456", "1"],
                    pi_b: [["0x789", "0xabc"], ["0xdef", "0x012"], ["1", "0"]],
                    pi_c: ["0x345", "0x678", "1"],
                    protocol: "groth16",
                    curve: "bn128"
                },
                publicSignals: [commitment, minValue, maxValue, 1] // valid = 1
            };

            return proof;
        } catch (error) {
            console.error("Error generating range proof:", error);
            throw error;
        }
    }

    async generateStatisticalSignificanceProof(sampleSize, effectSize, pValue, salt) {
        try {
            const pValueScaled = Math.floor(pValue * 10000); // Scale for integer arithmetic
            const commitment = sampleSize + effectSize + pValueScaled + salt;

            const input = {
                sample_size: sampleSize,
                effect_size: effectSize,
                p_value_numerator: pValueScaled,
                salt: salt,
                min_sample_size: 100,
                significance_threshold: 500, // p < 0.05
                min_effect_size: 20,
                commitment: commitment
            };

            console.log("Generating statistical significance proof with input:", input);

            const proof = {
                proof: {
                    pi_a: ["0xabc", "0xdef", "1"],
                    pi_b: [["0x111", "0x222"], ["0x333", "0x444"], ["1", "0"]],
                    pi_c: ["0x555", "0x666", "1"],
                    protocol: "groth16",
                    curve: "bn128"
                },
                publicSignals: [
                    input.min_sample_size,
                    input.significance_threshold,
                    input.min_effect_size,
                    commitment,
                    1 // valid
                ]
            };

            return proof;
        } catch (error) {
            console.error("Error generating statistical significance proof:", error);
            throw error;
        }
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

            const input = {
                patient_count: patientCount,
                treatment_success: treatmentSuccess,
                control_success: controlSuccess,
                control_count: controlCount,
                p_value_scaled: pValueScaled,
                salt: salt,
                min_patients: 100,
                min_efficacy_rate: 70, // 70% minimum efficacy
                max_p_value_scaled: 500, // p < 0.05
                commitment: commitment
            };

            console.log("Generating medical stats proof with input:", input);

            // Calculate outputs
            const validSampleSize = patientCount >= input.min_patients ? 1 : 0;
            const efficacyRate = (treatmentSuccess * 100) / patientCount;
            const validEfficacy = efficacyRate >= input.min_efficacy_rate ? 1 : 0;
            const validSignificance = pValueScaled < input.max_p_value_scaled ? 1 : 0;
            const overallValid = validSampleSize && validEfficacy && validSignificance ? 1 : 0;

            const proof = {
                proof: {
                    pi_a: ["0x777", "0x888", "1"],
                    pi_b: [["0x999", "0xaaa"], ["0xbbb", "0xccc"], ["1", "0"]],
                    pi_c: ["0xddd", "0xeee", "1"],
                    protocol: "groth16",
                    curve: "bn128"
                },
                publicSignals: [
                    input.min_patients,
                    input.min_efficacy_rate,
                    input.max_p_value_scaled,
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

// Example usage
async function main() {
    const generator = new MedicalProofGenerator();
    
    console.log("Generating demo proofs for diabetes treatment study...\n");
    
    const demoProofs = await generator.generateDemoProofs();
    
    demoProofs.forEach((proof, index) => {
        console.log(`\n=== Proof ${index + 1}: ${proof.metadata.hospitalName} ===`);
        console.log(`Sample Size: ${proof.metadata.sampleSize}`);
        console.log(`Efficacy Rate: ${proof.metadata.efficacyRate}%`);
        console.log(`P-Value: ${proof.metadata.pValue}`);
        console.log(`Valid: ${proof.publicSignals[7] === 1 ? 'Yes' : 'No'}`);
        console.log(`Proof Hash: 0x${Buffer.from(JSON.stringify(proof.proof)).toString('hex').slice(0, 16)}...`);
    });
    
    // Save proofs for frontend demo
    const outputPath = path.join(__dirname, "../build/demo_proofs.json");
    fs.writeFileSync(outputPath, JSON.stringify(demoProofs, null, 2));
    console.log(`\nDemo proofs saved to: ${outputPath}`);
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = MedicalProofGenerator;