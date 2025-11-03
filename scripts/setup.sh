#!/bin/bash

# MedProof Setup Script
echo "🏥 Setting up MedProof development environment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js 16+ and try again.${NC}"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | sed 's/v//')
REQUIRED_VERSION="16.0.0"

if [ "$(printf '%s\n' "$REQUIRED_VERSION" "$NODE_VERSION" | sort -V | head -n1)" = "$REQUIRED_VERSION" ]; then 
    echo -e "${GREEN}✅ Node.js $NODE_VERSION detected${NC}"
else
    echo -e "${RED}❌ Node.js 16+ is required. Current version: $NODE_VERSION${NC}"
    exit 1
fi

# Install root dependencies
echo -e "${YELLOW}📦 Installing root dependencies...${NC}"
npm install

# Install backend dependencies
echo -e "${YELLOW}📦 Installing backend dependencies...${NC}"
cd backend
npm install
cd ..

# Install frontend dependencies  
echo -e "${YELLOW}📦 Installing frontend dependencies...${NC}"
cd frontend
npm install
cd ..

# Install contracts dependencies
echo -e "${YELLOW}📦 Installing contracts dependencies...${NC}"
cd contracts
npm install
cd ..

# Install circuits dependencies
echo -e "${YELLOW}📦 Installing circuits dependencies...${NC}"
cd circuits
npm install
cd ..

# Setup environment files
echo -e "${YELLOW}⚙️  Setting up environment files...${NC}"
if [ ! -f backend/.env ]; then
    cp backend/.env.example backend/.env
    echo -e "${GREEN}✅ Created backend/.env from template${NC}"
fi

if [ ! -f frontend/.env ]; then
    echo "REACT_APP_API_URL=http://localhost:3001/api" > frontend/.env
    echo -e "${GREEN}✅ Created frontend/.env${NC}"
fi

# Compile smart contracts
echo -e "${YELLOW}🔗 Compiling smart contracts...${NC}"
cd contracts
npm run compile
cd ..

# Generate demo data
echo -e "${YELLOW}📊 Generating demo data and proofs...${NC}"
cd circuits/scripts
node generate_proof.js > /dev/null 2>&1
cd ../..

echo -e "${GREEN}🎉 Setup complete!${NC}"
echo
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Start the development servers:"
echo "   npm run dev"
echo
echo "2. Or start services individually:"
echo "   Backend:  cd backend && npm run dev"
echo "   Frontend: cd frontend && npm start"
echo
echo "3. Access the application:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:3001"
echo
echo -e "${GREEN}🏥 MedProof is ready for development!${NC}"