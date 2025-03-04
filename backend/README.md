# DarwinFi Backend

This is the backend server for DarwinFi, an evolutionary trading strategy platform built on the Injective Protocol. It provides APIs for strategy management, market data, and interactions with the Injective blockchain.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running Locally](#running-locally)
- [Testnet Deployment](#testnet-deployment)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v14 or higher)
- npm (v6 or higher)
- MongoDB (v4.4 or higher)
- An Injective Protocol wallet with testnet tokens

## Installation

1. Clone the repository (if not already done):

```bash
git clone https://github.com/yourusername/darwinfi.git
cd darwinfi/backend
```

2. Install dependencies:

```bash
npm install
```

## Configuration

1. Create a `.env` file based on the provided `.env.example`:

```bash
cp .env.example .env
```

2. Edit the `.env` file with your specific configuration values:
- Set your MongoDB connection string
- Configure your Injective wallet private key (for testnet)
- Set the appropriate RPC endpoints for testnet
- Configure other API keys as needed

3. Verify your configuration:
```bash
npm run check-config
```

## Running Locally

1. Start the MongoDB service (if not running):
```bash
# On Linux
sudo service mongod start

# On macOS with Homebrew
brew services start mongodb-community
```

2. Start the development server:
```bash
npm run dev
```

3. The server will be available at http://localhost:3001

## Testnet Deployment

### Option 1: Manual Deployment

1. Build the application:
```bash
npm run build
```

2. Set up your environment on the target server:
- Install Node.js and npm
- Install MongoDB
- Clone the repository or copy the built files
- Set up the `.env` file with testnet configuration

3. Start the server in production mode:
```bash
npm start
```

### Option 2: Docker Deployment

1. Build the Docker image:
```bash
docker build -t darwinfi-backend .
```

2. Run the container:
```bash
docker run -d -p 3001:3001 --env-file .env darwinfi-backend
```

### Option 3: Cloud Deployment (e.g., AWS, GCP, Azure)

1. Set up a VM instance on your cloud provider
2. Install Docker on the VM
3. Follow the Docker deployment steps above
4. Alternatively, use cloud-native services:
- AWS: Elastic Beanstalk or ECS
- GCP: Cloud Run or GKE
- Azure: App Service or AKS

### Connecting to Injective Testnet

1. Ensure your `.env` file contains the correct Injective testnet RPC endpoints
2. Make sure your wallet has sufficient testnet INJ tokens
3. Verify the connection:
```bash
npm run check-injective-connection
```

4. Deploy strategies to testnet:
```bash
npm run deploy-strategies
```

## API Documentation

The API documentation is available at `/api-docs` when the server is running. This provides a Swagger UI interface to explore and test the API endpoints.

Alternatively, you can view the API documentation in the `/docs/api.md` file.

## Testing

1. Run unit tests:
```bash
npm test
```

2. Run integration tests (requires MongoDB):
```bash
npm run test:integration
```

3. Run Injective testnet tests (requires testnet tokens):
```bash
npm run test:testnet
```

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
- Verify MongoDB is running
- Check the connection string in your `.env` file
- Ensure network settings allow the connection

2. **Injective RPC Connection Issues**
- Verify internet connectivity
- Check if the RPC endpoint is correct and operational
- Try an alternative RPC endpoint

3. **Transaction Errors**
- Ensure your wallet has sufficient testnet INJ for gas
- Check if the contract addresses are correct
- Verify your private key is correctly set in the `.env` file

### Logging

Logs are stored in the `logs` directory. For production deployments, you can configure a log aggregation service like ELK stack or use cloud logging services.

### Getting Help

If you encounter issues not covered in this documentation:
- Open an issue on GitHub
- Join our Discord community for developer support
- Check the Injective Protocol documentation for blockchain-specific issues
