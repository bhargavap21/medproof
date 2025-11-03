pragma circom 2.0.0;

// Combined medical statistics proof circuit
// Proves treatment efficacy, sample size adequacy, and statistical significance
template MedicalStatsProof() {
    // Private inputs (hospital's sensitive data)
    signal private input patient_count;         // Total patients in study
    signal private input treatment_success;     // Number of successful treatments
    signal private input control_success;       // Number of successful controls
    signal private input control_count;         // Total control group size
    signal private input p_value_scaled;        // P-value * 10000
    signal private input salt;                  // Privacy salt
    
    // Public inputs (research criteria)
    signal input min_patients;                  // Minimum required patients
    signal input min_efficacy_rate;            // Minimum efficacy rate (%)
    signal input max_p_value_scaled;           // Maximum p-value (scaled)
    signal input commitment;                    // Public commitment hash
    
    // Outputs
    signal output valid_sample_size;           // 1 if sample size adequate
    signal output valid_efficacy;              // 1 if efficacy meets threshold
    signal output valid_significance;          // 1 if statistically significant
    signal output overall_valid;               // 1 if all criteria met
    
    // Components
    component sample_check = GreaterEqualThan(32);
    component efficacy_calc = EfficacyCheck();
    component significance_check = LessThan(32);
    component hasher = Poseidon(6);
    
    // Sample size validation
    sample_check.in[0] <== patient_count;
    sample_check.in[1] <== min_patients;
    valid_sample_size <== sample_check.out;
    
    // Efficacy rate validation
    efficacy_calc.treatment_success <== treatment_success;
    efficacy_calc.total_patients <== patient_count;
    efficacy_calc.min_efficacy <== min_efficacy_rate;
    valid_efficacy <== efficacy_calc.valid;
    
    // Statistical significance validation
    significance_check.in[0] <== p_value_scaled;
    significance_check.in[1] <== max_p_value_scaled;
    valid_significance <== significance_check.out;
    
    // Commitment verification
    hasher.inputs[0] <== patient_count;
    hasher.inputs[1] <== treatment_success;
    hasher.inputs[2] <== control_success;
    hasher.inputs[3] <== control_count;
    hasher.inputs[4] <== p_value_scaled;
    hasher.inputs[5] <== salt;
    hasher.out === commitment;
    
    // Overall validity requires all conditions
    overall_valid <== valid_sample_size * valid_efficacy * valid_significance;
}

template EfficacyCheck() {
    signal input treatment_success;
    signal input total_patients;
    signal input min_efficacy;
    signal output valid;
    
    // Calculate efficacy rate: (success * 100) / total >= min_efficacy
    // Rearranged: success * 100 >= min_efficacy * total
    signal efficacy_numerator;
    signal efficacy_threshold;
    
    efficacy_numerator <== treatment_success * 100;
    efficacy_threshold <== min_efficacy * total_patients;
    
    component geq = GreaterEqualThan(32);
    geq.in[0] <== efficacy_numerator;
    geq.in[1] <== efficacy_threshold;
    valid <== geq.out;
}

template GreaterEqualThan(n) {
    assert(n <= 252);
    signal input in[2];
    signal output out;
    
    component lt = LessThan(n+1);
    lt.in[0] <== in[1] + (1<<n) - in[0];
    lt.in[1] <== 1<<n;
    out <== lt.out;
}

template LessThan(n) {
    assert(n <= 252);
    signal input in[2];
    signal output out;
    
    component n2b = Num2Bits(n);
    n2b.in <== in[0] + (1<<n) - in[1];
    out <== 1 - n2b.out[n];
}

template Num2Bits(n) {
    signal input in;
    signal output out[n];
    var lc1=0;
    
    for (var i = 0; i<n; i++) {
        out[i] <-- (in >> i) & 1;
        out[i] * (out[i] - 1) === 0;
        lc1 += out[i] * 2**i;
    }
    
    lc1 === in;
}

template Poseidon(nInputs) {
    signal input inputs[nInputs];
    signal output out;
    
    // Simplified Poseidon hash for demonstration
    var sum = 0;
    for (var i = 0; i < nInputs; i++) {
        sum += inputs[i];
    }
    out <== sum;
}

component main = MedicalStatsProof();