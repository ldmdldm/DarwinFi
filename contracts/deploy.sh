#!/bin/bash

# DarwinFi - Main Deployment Script for Injective Testnet
# This script serves as the entry point for deploying the entire DarwinFi application to Injective testnet

# Color codes for prettier output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging functions
log() {
echo -e "${GREEN}[$(date +"%T")] $1${NC}"
}

warn() {
echo -e "${YELLOW}[$(date +"%T")] WARNING: $1${NC}"
}

error() {
echo -e "${RED}[$(date +"%T")] ERROR: $1${NC}"
exit 1
}

# Display banner
echo -e "${GREEN}"
echo "======================================================================"
echo "                     DarwinFi Deployment Tool                         "
echo "======================================================================"
echo -e "${NC}"
echo "This script will deploy the DarwinFi platform to the Injective testnet."
echo ""

# Check if deployment script exists
if [ ! -f "./scripts/deploy-injective-testnet.sh" ]; then
error "Deployment script not found at ./scripts/deploy-injective-testnet.sh"
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
if [ -f ".env.example" ]; then
    log "Creating .env file from .env.example"
    cp .env.example .env
    warn "Please update the .env file with your credentials before proceeding"
    echo ""
    echo "Required environment variables:"
    echo "- WALLET_PRIVATE_KEY or WALLET_MNEMONIC (for transaction signing)"
    echo "- WALLET_ADDRESS (your Injective address)"
    echo "- TESTNET_RPC_ENDPOINT (Injective testnet RPC endpoint)"
    echo ""
    read -p "Press Enter to continue after updating .env or Ctrl+C to cancel..."
else
    error ".env.example file not found. Please create a .env file manually."
fi
fi

# Ensure the deployment script is executable
chmod +x ./scripts/deploy-injective-testnet.sh

log "Starting deployment to Injective testnet..."
echo ""

# Execute the deployment script
./scripts/deploy-injective-testnet.sh

# Check if deployment was successful
if [ $? -eq 0 ]; then
echo ""
log "Deployment completed successfully!"
echo ""
echo "Next steps:"
echo "1. View your contracts on Injective Explorer: https://testnet.explorer.injective.network/"
echo "2. Start the frontend: cd frontend && npm run start"
echo "3. Start the backend: cd backend && npm run start"
echo ""
else
error "Deployment failed. Please check the logs for details."
fi

