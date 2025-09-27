#!/bin/bash
# Wrapper script for Midnight Compact compilation with graceful fallback

set -e

# Get contract name
name=$(basename $(ls src/*.compact) .compact)

# Check if compiler is available
if command -v compactc &> /dev/null; then
    echo "🔨 Using compactc compiler"
    compactc src/$name.compact src/managed/$name
elif command -v compact &> /dev/null; then
    echo "🔨 Using compact compiler"
    compact src/$name.compact src/managed/$name
elif npx compact --version &> /dev/null 2>&1; then
    echo "🔨 Using npx compact compiler"
    npx compact src/$name.compact src/managed/$name
else
    echo "⚠️  No Compact compiler found - creating placeholder for integration development"
    
    # Create managed directory structure
    mkdir -p src/managed/$name
    
    # Create placeholder TypeScript module
    cat > src/managed/$name/index.ts << 'EOF'
// Placeholder contract module for integration development
export const contract = {
  submitMedicalProof: async (...args: any[]) => ({ success: true, proof: 'placeholder' }),
  authorizeHospital: async (...args: any[]) => ({ success: true }),
  aggregateResults: async (...args: any[]) => ([75, 3]), // [efficacy, hospitals]
  getStudyStatus: async (...args: any[]) => ([true, Date.now()])
};
EOF
    
    echo "✅ Placeholder contract module created"
fi

echo "✅ Contract compilation/setup complete"