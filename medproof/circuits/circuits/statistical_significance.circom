pragma circom 2.0.0;

// Statistical significance proof circuit
// Proves that a study has sufficient statistical power without revealing exact p-values
template StatisticalSignificance() {
    // Private inputs
    signal private input sample_size;           // Number of participants
    signal private input effect_size;           // Effect size (standardized)
    signal private input p_value_numerator;     // P-value * 10000 (to handle decimals)
    signal private input salt;                  // Random salt for privacy
    
    // Public inputs
    signal input min_sample_size;               // Minimum required sample size
    signal input significance_threshold;        // Significance threshold (e.g., 500 for p=0.05)
    signal input min_effect_size;              // Minimum clinically meaningful effect size
    signal input commitment;                    // Public commitment
    
    // Output
    signal output valid;                        // 1 if statistically significant, 0 otherwise
    
    // Components for range checks
    component sample_check = GreaterEqualThan(32);
    component p_value_check = LessThan(32);
    component effect_check = GreaterEqualThan(32);
    component hasher = Poseidon(4);
    
    // Check sample size >= minimum
    sample_check.in[0] <== sample_size;
    sample_check.in[1] <== min_sample_size;
    
    // Check p-value < significance threshold (lower p-value = more significant)
    p_value_check.in[0] <== p_value_numerator;
    p_value_check.in[1] <== significance_threshold;
    
    // Check effect size >= minimum meaningful effect
    effect_check.in[0] <== effect_size;
    effect_check.in[1] <== min_effect_size;
    
    // Verify commitment
    hasher.inputs[0] <== sample_size;
    hasher.inputs[1] <== effect_size;
    hasher.inputs[2] <== p_value_numerator;
    hasher.inputs[3] <== salt;
    hasher.out === commitment;
    
    // All conditions must be met for statistical significance
    valid <== sample_check.out * p_value_check.out * effect_check.out;
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
    
    // Simplified hash for demonstration
    var sum = 0;
    for (var i = 0; i < nInputs; i++) {
        sum += inputs[i];
    }
    out <== sum;
}

component main = StatisticalSignificance();