#!/bin/bash

# DarwinFi - Injective Testnet Deployment Script
# This script automates the deployment process for the DarwinFi project to Injective testnet

set -e # Exit on error

# Color codes for prettier output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging function
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

# Check if .env file exists, create from example if not
if [ ! -f .env ]; then
  if [ -f .env.example ]; then
    log "Creating .env file from .env.example"
    cp .env.example .env
    warn "Please update the .env file with your credentials before proceeding"
    read -p "Press Enter to continue after updating .env..."
  else
    error ".env.example file not found. Please create a .env file manually."
  fi
fi

# Load environment variables - Fixed version
log "Loading environment variables..."
# Instead of exporting all variables, we'll extract just what we need
TESTNET_RPC_ENDPOINT=$(grep -E "^TESTNET_RPC_ENDPOINT=" .env | cut -d= -f2-)
WALLET_PRIVATE_KEY=$(grep -E "^WALLET_PRIVATE_KEY=" .env | cut -d= -f2-)
WALLET_ADDRESS=$(grep -E "^WALLET_ADDRESS=" .env | cut -d= -f2-)

# Check for required environment variables
log "Checking required environment variables..."
if [ -z "$TESTNET_RPC_ENDPOINT" ]; then
  error "Required environment variable TESTNET_RPC_ENDPOINT is not set. Please update your .env file."
fi

if [ -z "$WALLET_PRIVATE_KEY" ] && [ -z "$WALLET_MNEMONIC" ]; then
  error "Either WALLET_PRIVATE_KEY or WALLET_MNEMONIC must be set. Please update your .env file."
fi

if [ -z "$WALLET_ADDRESS" ]; then
  error "Required environment variable WALLET_ADDRESS is not set. Please update your .env file."
fi

# Check if Node.js and npm are installed
log "Checking dependencies..."
if ! command -v node &> /dev/null; then
  error "Node.js is not installed. Please install Node.js before continuing."
fi

if ! command -v npm &> /dev/null; then
  error "npm is not installed. Please install npm before continuing."
fi

# Verify project structure
if [ ! -d "frontend" ]; then
  error "frontend directory not found. Please make sure you are in the project root."
fi

if [ ! -d "contracts" ]; then
  error "contracts directory not found. Please make sure you are in the project root."
fi

# Install dependencies
log "Installing dependencies..."

# Install contract dependencies
log "Installing contract dependencies..."
cd contracts
npm install --legacy-peer-deps || error "Failed to install contract dependencies"

# Compile contracts
log "Compiling contracts..."
npm run compile || error "Failed to compile contracts"

# Deploy contracts to testnet
log "Deploying contracts to Injective testnet..."
npm run deploy:testnet || error "Failed to deploy contracts to testnet"

# Get deployed contract addresses and save them
log "Saving deployed contract addresses..."
deployed_addresses_file="../deployed_addresses.json"
if [ -f "$deployed_addresses_file" ]; then
  log "Contract addresses saved to $deployed_addresses_file"
else
  warn "Could not find deployed addresses file. Make sure your deployment script saves the addresses."
fi

# Return to project root
cd ..

# Update frontend with deployed contract addresses
log "Updating frontend configuration..."
if [ -f "$deployed_addresses_file" ]; then
  mkdir -p frontend/src/config
  cp "$deployed_addresses_file" frontend/src/config/addresses.json || warn "Failed to copy contract addresses to frontend"
fi

# Build frontend
log "Building frontend..."
cd frontend
npm install --legacy-peer-deps || error "Failed to install frontend dependencies"
npm run build || error "Failed to build frontend"
cd ..

# Install backend dependencies
if [ -d "backend" ]; then
  log "Installing backend dependencies..."
  cd backend
  npm install --legacy-peer-deps || error "Failed to install backend dependencies"

  # Build backend
  log "Building backend..."
  npm run build || error "Failed to build backend"

  # Start backend service
  log "Starting backend service..."
  npm run start:testnet &
  BACKEND_PID=$!
  log "Backend service started with PID: $BACKEND_PID"
  cd ..
else
  warn "Backend directory not found, skipping backend deployment"
fi

# Verify deployment
log "Verifying deployment..."
echo ""
echo "============================================================"
echo "                DEPLOYMENT SUMMARY                          "
echo "============================================================"
echo ""
echo "Injective Testnet: $TESTNET_RPC_ENDPOINT"
echo "Wallet Address: $WALLET_ADDRESS"

if [ -f "$deployed_addresses_file" ]; then
  echo ""
  echo "Deployed Contracts:"
  cat "$deployed_addresses_file"
fi

echo ""
echo "Frontend built successfully"

if [ -d "backend" ]; then
  echo "Backend service running with PID: $BACKEND_PID"
fi

echo ""
echo "============================================================"
echo ""
log "Deployment to Injective testnet completed successfully!"
echo ""
echo "Next steps:"
echo "1. To serve the frontend locally: cd frontend && npm run serve"
echo "2. To view contract details on Injective Explorer: https://testnet.explorer.injective.network/"
echo "3. To monitor backend logs: tail -f backend/logs/app.log"
echo ""
