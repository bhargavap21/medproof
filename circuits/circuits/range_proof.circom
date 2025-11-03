pragma circom 2.0.0;

// Range proof circuit for medical statistics
// Proves that a value is within a specified range without revealing the exact value
template RangeProof(n) {
    // Private inputs
    signal private input value;          // The actual value (e.g., treatment effectiveness %)
    signal private input salt;           // Random salt for privacy
    
    // Public inputs
    signal input min_value;              // Minimum allowed value
    signal input max_value;              // Maximum allowed value
    signal input commitment;             // Public commitment to the value
    
    // Output
    signal output valid;                 // 1 if proof is valid, 0 otherwise
    
    // Components
    component geq_min = GreaterEqualThan(n);
    component leq_max = LessEqualThan(n);
    component hasher = Poseidon(2);
    
    // Check value >= min_value
    geq_min.in[0] <== value;
    geq_min.in[1] <== min_value;
    
    // Check value <= max_value
    leq_max.in[0] <== value;
    leq_max.in[1] <== max_value;
    
    // Verify commitment: Hash(value, salt) == commitment
    hasher.inputs[0] <== value;
    hasher.inputs[1] <== salt;
    hasher.out === commitment;
    
    // Output is valid only if both range checks pass
    valid <== geq_min.out * leq_max.out;
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

template LessEqualThan(n) {
    signal input in[2];
    signal output out;
    
    component lt = LessThan(n+1);
    lt.in[0] <== in[0] + 1;
    lt.in[1] <== in[1] + 1;
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
    // In production, use the proper Poseidon implementation
    var sum = 0;
    for (var i = 0; i < nInputs; i++) {
        sum += inputs[i];
    }
    out <== sum;
}

// Main component for range proof with 32-bit values
component main = RangeProof(32);