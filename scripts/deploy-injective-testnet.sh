#!/bin/bash

# DarwinFi - Injective Testnet Deployment Script
# This script automates the deployment process for DarwinFi to Injective testnet

set -e # Exit on error

# Color codes for prettier output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log() {
echo -e "${GREEN}[$(date +"%T")] $1${NC}"
}

info() {
echo -e "${BLUE}[$(date +"%T")] $1${NC}"
}

warn() {
echo -e "${YELLOW}[$(date +"%T")] WARNING: $1${NC}"
}

error() {
echo -e "${RED}[$(date +"%T")] ERROR: $1${NC}"
exit 1
}

# Banner
echo -e "${GREEN}"
echo "========================================================"
echo "             DarwinFi Testnet Deployment                "
echo "========================================================"
echo -e "${NC}"

# Check prerequisites
log "Checking prerequisites..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
error "Node.js is not installed. Please install Node.js before continuing."
fi
node_version=$(node -v)
log "Node.js version: $node_version"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
error "npm is not installed. Please install npm before continuing."
fi
npm_version=$(npm -v)
log "npm version: $npm_version"

# Check if .env file exists
if [ ! -f .env ]; then
if [ -f .env.example ]; then
    warn ".env file not found. Creating from .env.example"
    cp .env.example .env
    warn "Please update the .env file with your credentials before proceeding"
    read -p "Press Enter to continue after updating .env..."
else
    error ".env file not found and no .env.example to create from. Please create a .env file manually."
fi
fi

# Load essential environment variables
log "Loading configuration from .env file..."

# Extract needed variables directly rather than sourcing the entire file
NETWORK=$(grep -E "^NETWORK=" .env | cut -d= -f2)
TESTNET_RPC_ENDPOINT=$(grep -E "^TESTNET_RPC_ENDPOINT=" .env | cut -d= -f2)
WALLET_ADDRESS=$(grep -E "^WALLET_ADDRESS=" .env | cut -d= -f2)
WALLET_PRIVATE_KEY=$(grep -E "^WALLET_PRIVATE_KEY=" .env | cut -d= -f2)
WALLET_MNEMONIC=$(grep -E "^WALLET_MNEMONIC=" .env | cut -d= -f2)

# Validate essential configuration
if [ -z "$NETWORK" ]; then
warn "NETWORK not set in .env, defaulting to testnet"
NETWORK="testnet"
fi

if [ "$NETWORK" != "testnet" ]; then
warn "NETWORK is set to '$NETWORK', but this script is for testnet deployment"
read -p "Do you want to continue with testnet deployment? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    error "Deployment aborted by user"
fi
NETWORK="testnet"
fi

if [ -z "$TESTNET_RPC_ENDPOINT" ]; then
error "TESTNET_RPC_ENDPOINT not set in .env file"
fi

if [ -z "$WALLET_ADDRESS" ]; then
error "WALLET_ADDRESS not set in .env file"
fi

if [ -z "$WALLET_PRIVATE_KEY" ] && [ -z "$WALLET_MNEMONIC" ]; then
error "Neither WALLET_PRIVATE_KEY nor WALLET_MNEMONIC set in .env file. At least one is required."
fi

# Project structure validation
log "Verifying project structure..."

if [ ! -d "contracts" ]; then
error "contracts directory not found. Please run this script from the project root."
fi

if [ ! -d "frontend" ]; then
warn "frontend directory not found."
read -p "Do you want to continue without frontend? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    error "Deployment aborted by user"
fi
fi

# Create deployment directory
DEPLOY_DIR="deployments/$NETWORK/$(date +"%Y%m%d_%H%M%S")"
mkdir -p $DEPLOY_DIR
log "Created deployment directory: $DEPLOY_DIR"

# Deploy contracts
log "Building and deploying contracts to Injective $NETWORK..."
cd contracts

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
log "Installing contract dependencies..."
npm install || error "Failed to install contract dependencies"
fi

# Compile contracts
log "Compiling contracts..."
npm run compile || error "Failed to compile contracts"

# Deploy contracts to testnet
log "Deploying contracts to Injective testnet..."
npm run deploy:testnet || error "Failed to deploy contracts to testnet"

# Save deployed contract addresses
log "Saving contract deployment details..."
DEPLOYMENT_FILE="../$DEPLOY_DIR/contract_addresses.json"
if [ -f "deployments/testnet/latest.json" ]; then
cp deployments/testnet/latest.json $DEPLOYMENT_FILE || warn "Failed to copy deployment details"
log "Contract deployment details saved to $DEPLOYMENT_FILE"
else
warn "No deployment details found at deployments/testnet/latest.json"
# Create a placeholder file
echo '{"timestamp": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'", "network": "testnet"}' > $DEPLOYMENT_FILE
fi

cd ..

# Deploy frontend if it exists
if [ -d "frontend" ]; then
log "Building frontend..."
cd frontend

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    log "Installing frontend dependencies..."
    npm install || error "Failed to install frontend dependencies"
fi

# Update contract addresses in frontend configuration
if [ -f "../$DEPLOYMENT_FILE" ]; then
    log "Updating frontend with contract addresses..."
    mkdir -p src/config
    cp "../$DEPLOYMENT_FILE" src/config/contracts.json || warn "Failed to copy contract addresses to frontend"
fi

# Build frontend
log "Building frontend for production..."
npm run build || error "Failed to build frontend"

# Save frontend build
if [ -d "build" ]; then
    log "Copying frontend build to deployment directory..."
    cp -r build "../$DEPLOY_DIR/frontend" || warn "Failed to copy frontend build"
elif [ -d "dist" ]; then
    log "Copying frontend build to deployment directory..."
    cp -r dist "../$DEPLOY_DIR/frontend" || warn "Failed to copy frontend build"
else
    warn "No frontend build directory found (expected 'build' or 'dist')"
fi

cd ..
fi

# Deploy backend if it exists
if [ -d "backend" ]; then
log "Building backend..."
cd backend

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    log "Installing backend dependencies..."
    npm install || error "Failed to install backend dependencies"
fi

# Update contract addresses in backend configuration
if [ -f "../$DEPLOYMENT_FILE" ]; then
    log "Updating backend with contract addresses..."
    mkdir -p src/config
    cp "../$DEPLOYMENT_FILE" src/config/contracts.json || warn "Failed to copy contract addresses to backend"
fi

# Build backend
log "Building backend..."
npm run build || error "Failed to build backend"

# Save backend build
if [ -d "dist" ]; then
    log "Copying backend build to deployment directory..."
    cp -r dist "../$DEPLOY_DIR/backend" || warn "Failed to copy backend build"
elif [ -d "build" ]; then
    log "Copying backend build to deployment directory..."
    cp -r build "../$DEPLOY_DIR/backend" || warn "Failed to copy backend build"
else
    warn "No backend build directory found (expected 'dist' or 'build')"
fi

cd ..
fi

# Create deployment summary
SUMMARY_FILE="$DEPLOY_DIR/deployment_summary.md"
log "Creating deployment summary at $SUMMARY_FILE..."

cat > $SUMMARY_FILE << EOF
# DarwinFi Deployment Summary

## Deployment Information
- **Date:** $(date +"%Y-%m-%d %H:%M:%S")
- **Network:** $NETWORK
- **Wallet Address:** $WALLET_ADDRESS
- **RPC Endpoint:** $TESTNET_RPC_ENDPOINT

## Deployed Contracts
EOF

if [ -f "$DEPLOYMENT_FILE" ]; then
echo "Contract addresses are stored in: [contract_addresses.json](./contract_addresses.json)" >> $SUMMARY_FILE
echo '```json' >> $SUMMARY_FILE
cat $DEPLOYMENT_FILE >> $SUMMARY_FILE
echo '```' >> $SUMMARY_FILE
else
echo "No contract deployment information available." >> $SUMMARY_FILE
fi

cat >> $SUMMARY_FILE << EOF

## Frontend
EOF

if [ -d "$DEPLOY_DIR/frontend" ]; then
echo "Frontend build is available in the [frontend](./frontend) directory." >> $SUMMARY_FILE
else
echo "No frontend build available in this deployment." >> $SUMMARY_FILE
fi

cat >> $SUMMARY_FILE << EOF

## Backend
EOF

if [ -d "$DEPLOY_DIR/backend" ]; then
echo "Backend build is available in the [backend](./backend) directory." >> $SUMMARY_FILE
else
echo "No backend build available in this deployment." >> $SUMMARY_FILE
fi

# Copy .env file (with sensitive data removed) for reference
grep -v "PRIVATE_KEY\|MNEMONIC\|PASSWORD\|SECRET" .env > "$DEPLOY_DIR/env_reference.txt"

# Final deployment summary
echo -e "${GREEN}"
echo "========================================================"
echo "             DEPLOYMENT COMPLETE!                       "
echo "========================================================"
echo -e "${NC}"
echo ""
echo -e "${BLUE}Deployment directory:${NC} $DEPLOY_DIR"
echo -e "${BLUE}Contract addresses:${NC} $DEPLOYMENT_FILE"
echo -e "${BLUE}Deployment summary:${NC} $SUMMARY_FILE"
echo ""

log "Testnet deployment completed successfully!"

echo ""
echo "Next steps:"
echo "1. Check your deployed contracts on Injective Explorer: https://testnet.explorer.injective.network/address/$WALLET_ADDRESS"
echo "2. To start a local development server for the frontend: cd frontend && npm run start"
echo "3. To start the backend: cd backend && npm run start"
echo ""

exit 0

