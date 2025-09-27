#!/bin/bash

# MedProof Demo Script
echo "🏥 Starting MedProof Demo..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 MedProof: Privacy-Preserving Medical Research Platform${NC}"
echo
echo -e "${YELLOW}This demo showcases:${NC}"
echo "• Hospital dashboards with FHIR integration"
echo "• Synthetic medical data generation"
echo "• Zero-knowledge proof creation"
echo "• Multi-hospital research aggregation"
echo "• Privacy-preserving statistical analysis"
echo

# Check if setup has been run
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚠️  Dependencies not found. Running setup first...${NC}"
    ./scripts/setup.sh
fi

# Start backend in background
echo -e "${YELLOW}🔧 Starting backend API server...${NC}"
cd backend
npm run dev &
BACKEND_PID=$!
cd ..

# Wait for backend to start
sleep 3

# Start frontend in background
echo -e "${YELLOW}🌐 Starting frontend React app...${NC}"
cd frontend
npm start &
FRONTEND_PID=$!
cd ..

# Wait for services to start
sleep 5

echo
echo -e "${GREEN}✅ MedProof demo is starting up!${NC}"
echo
echo -e "${BLUE}🌐 Access Points:${NC}"
echo "Frontend Dashboard: http://localhost:3000"
echo "Backend API:       http://localhost:3001"
echo "Health Check:      http://localhost:3001/health"
echo
echo -e "${YELLOW}📊 Demo Scenario:${NC}"
echo "1. Visit http://localhost:3000 to see the main dashboard"
echo "2. Click on any hospital to access the hospital dashboard"
echo "3. Generate synthetic cohorts and ZK proofs"
echo "4. View the Research Aggregator to see multi-hospital analysis"
echo
echo -e "${GREEN}🔒 Privacy Features:${NC}"
echo "• Zero-knowledge proofs verify results without revealing data"
echo "• FHIR integration simulates real EHR connections"
echo "• Aggregate statistics computed privately"
echo "• Cryptographic verification of study integrity"
echo
echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}"

# Function to cleanup on exit
cleanup() {
    echo
    echo -e "${YELLOW}🛑 Stopping MedProof demo...${NC}"
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo -e "${GREEN}✅ Demo stopped successfully${NC}"
    exit 0
}

# Trap Ctrl+C
trap cleanup INT

# Keep script running
wait