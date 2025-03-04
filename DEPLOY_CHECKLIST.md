# Injective Testnet Deployment Checklist

This document provides a comprehensive checklist for deploying your DeFi application to the Injective testnet. Follow these steps sequentially to ensure a successful deployment.

## 1. Environment Setup

### 1.1 Prerequisites
- [ ] Install Node.js (v16+) and npm
- [ ] Install Rust (for CosmWasm contract compilation)
- [ ] Install Docker and Docker Compose
- [ ] Install the Injective CLI tool: `npm install -g @injectivelabs/cli`

### 1.2 Repository Setup
- [ ] Clone the repository: `git clone <repository-url>`
- [ ] Install dependencies:
```bash
npm install
cd contracts && npm install
cd ../frontend && npm install
cd ../backend && npm install
```
- [ ] Create environment files from examples:
```bash
cp .env.example .env
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env
```
- [ ] Configure environment variables with appropriate values

## 2. Wallet Configuration

### 2.1 Create a Testnet Wallet
- [ ] Install Keplr or Metamask browser extension
- [ ] Create a new wallet or import an existing one
- [ ] Add Injective Testnet to your wallet
- Network Name: Injective Testnet
- RPC URL: https://testnet.tm.injective.network:443
- Chain ID: injective-888
- Currency Symbol: INJ
- Explorer URL: https://testnet.explorer.injective.network

### 2.2 Fund Your Testnet Wallet
- [ ] Go to the Injective Testnet Faucet: https://testnet.faucet.injective.network/
- [ ] Enter your wallet address and request test INJ tokens
- [ ] Verify receipt of tokens in your wallet

### 2.3 Configure Wallet in Application
- [ ] Add your wallet's private key or mnemonic to the backend `.env` file
- [ ] Set appropriate gas limits and gas prices in the configuration
- [ ] Test wallet connectivity using the CLI:
```bash
injectived keys show <your-key-name> --keyring-backend test
```

## 3. Smart Contract Deployment

### 3.1 Compile Contracts
- [ ] Navigate to the contracts directory: `cd contracts`
- [ ] Compile the CosmWasm contracts:
```bash
npm run compile
```
- [ ] Verify the compiled WASM files in the `artifacts` directory

### 3.2 Deploy Contracts
- [ ] Deploy the strategy contract:
```bash
injectived tx wasm store artifacts/strategy.wasm --from <your-key-name> --gas auto --gas-adjustment 1.3 -y --keyring-backend test --chain-id injective-888 --node https://testnet.tm.injective.network:443
```
- [ ] Note the code ID returned from the deployment
- [ ] Instantiate the contract:
```bash
injectived tx wasm instantiate <code-id> '{"admin":"<your-wallet-address>"}' --label "DarwinFi Strategy" --admin <your-wallet-address> --from <your-key-name> --gas auto --gas-adjustment 1.3 -y --keyring-backend test --chain-id injective-888 --node https://testnet.tm.injective.network:443
```
- [ ] Save the contract address from the instantiation output
- [ ] Update the contract address in the backend `.env` file

### 3.3 Verify Contract Deployment
- [ ] Query the contract state:
```bash
injectived query wasm contract-state smart <contract-address> '{"get_config":{}}'
```
- [ ] Check contract on the explorer: https://testnet.explorer.injective.network/contract/<contract-address>

## 4. Backend Deployment

### 4.1 Configure Backend
- [ ] Navigate to the backend directory: `cd backend`
- [ ] Update the `.env` file with:
- Contract addresses
- RPC endpoints
- API keys
- Wallet information
- [ ] Build the backend:
```bash
npm run build
```

### 4.2 Deploy Backend
- [ ] Deploy using Docker:
```bash
docker-compose up -d
```
- [ ] Alternatively, deploy to a cloud service (AWS, GCP, Azure):
- Configure the cloud service
- Set up environment variables
- Deploy using the cloud service's deployment tools

### 4.3 Verify Backend Deployment
- [ ] Test the health endpoint: `curl https://<your-backend-url>/health`
- [ ] Check logs for any errors: `docker-compose logs -f`
- [ ] Verify endpoints work with Postman or similar tool

## 5. Frontend Deployment

### 5.1 Configure Frontend
- [ ] Navigate to the frontend directory: `cd frontend`
- [ ] Update the `.env` file with:
- Backend API URL
- Contract addresses
- Injective RPC endpoints
- [ ] Build the frontend:
```bash
npm run build
```

### 5.2 Deploy Frontend
- [ ] Deploy to a static hosting service (Vercel, Netlify, GitHub Pages):
- Configure the service
- Set up environment variables
- Deploy the build folder

### 5.3 Verify Frontend Deployment
- [ ] Navigate to the deployed frontend URL
- [ ] Connect your wallet and check connectivity
- [ ] Verify all major features work correctly

## 6. Post-Deployment Verification

### 6.1 Integration Testing
- [ ] Test wallet connection and balance display
- [ ] Test strategy creation and management
- [ ] Test trading functionality with small amounts
- [ ] Verify evolution and optimization features

### 6.2 Security Checks
- [ ] Ensure private keys are secure and not exposed
- [ ] Verify API keys are properly restricted
- [ ] Check for any exposed endpoints without authentication
- [ ] Monitor resource usage to prevent DOS attacks

### 6.3 Performance Monitoring
- [ ] Set up monitoring for backend services
- [ ] Configure alerts for error conditions
- [ ] Monitor contract gas usage
- [ ] Track API usage and limits

## 7. Troubleshooting

### 7.1 Common Issues
- Contract deployment failures: Check gas settings and contract code
- RPC connection issues: Try alternative RPC endpoints
- Transaction failures: Verify sufficient balance and correct parameters
- Backend errors: Check logs and ensure all services are running

### 7.2 Support Resources
- Injective Documentation: https://docs.injective.network/
- Injective Discord: https://discord.com/invite/injective
- Injective Testnet Explorer: https://testnet.explorer.injective.network/
- CosmWasm Documentation: https://docs.cosmwasm.com/

---

Congratulations! Your application should now be fully deployed to the Injective testnet and ready for testing or demonstration.

