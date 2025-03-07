# DarwinFi 🧬

![GitHub stars](https://img.shields.io/github/stars/ldmdldm/DarwinFi?style=social)
![GitHub forks](https://img.shields.io/github/forks/ldmdldm/DarwinFi?style=social)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Injective](https://img.shields.io/badge/Injective-EVM-8A2BE2)](https://injective.com/)
[![Hackathon](https://img.shields.io/badge/Hackathon-Submission-00FFFF)](https://dorahacks.io/hackathon/injective-ai/detail)

<div align="center">
<h3>Evolutionary DeFi: Adaptative Yield Strategies </h3>
</div>

## 📋 TL,DR

DarwinFi introduces an evolutionary approach to yield optimization in decentralized finance by applying principles of natural selection to trading strategies. We've created a self-improving system that continuously adapts to market conditions without requiring manual intervention.

DarwinFi represents a fundamental shift with its Agent Evolution System, it is a framework where AI yield optimization strategies evolve through generations becoming more sophisticated and effective over time by using Injective's EVM capabilities, this way our intelligent agents can autonomously interact with DeFi protocols to maximize returns.

## ✨ Features

### 🧠 AI Agent Evolution System

* AI strategic agents begin with fundamental yield farming approaches
* Machine learning models analyze market conditions 
* Neural networks predict potential yield opportunities across multiple protocols
* Performance metrics determine which strategies survive and reproduce
* Successful strategies combine attributes to create improved strategies
* Failed approaches are systematically analyzed to prevent repeating ineffective methods

### 🌐 Collective Intelligence Framework

The platform creates a shared knowledge ecosystem where discoveries benefit all participants:

* Performance data from all agents feeds into a central analysis system
* Strategy components are modularized and recombined based on effectiveness
* Risk patterns are identified across multiple market conditions
* The system maintains strategic diversity to ensure resilience

### 📊 Adaptive Market Positioning

DarwinFi's agents don't just find yield - they anticipate where opportunities will emerge:

* Agents adjust risk profiles based on market volatility indicators
* Liquidity is positioned ahead of projected yield opportunities
* Multi-chain deployment enables cross-chain arbitrage when beneficial
* Strategy distribution ensures capital efficiency while managing risk exposure

## 🤖 AI Integration

<div align="center">
</div>

DarwinFi leverages cutting-edge AI technology to create intelligent agents that interact with Injective's blockchain infrastructure:

### Autonomous Learning Systems

* **Self-improving algorithms**: Agents analyze their performance and adjust parameters to optimize returns
* **Federated learning**: Knowledge sharing between agents without compromising strategy uniqueness
* **Reinforcement learning**: Reward mechanisms incentivize profitable behavior and penalize poor performance

### Market Intelligence Network

* Real-time sentiment analysis of crypto markets informs agent decision-making
* Pattern recognition identifies emerging trends before they become obvious
* Anomaly detection protects capital during unusual market conditions

### On-Chain AI Integration

* Smart contracts interface with AI agents through Injective's EVM compatibility
* Model execution happens both off-chain (for complex computations) and on-chain (for transparency)
* Agent decisions are verifiable and auditable through transaction history
## 🚀 Implementation on Injective EVM

<div align="center">
</div>

DarwinFi leverages Injective's powerful EVM infrastructure for several critical advantages, creating an ideal environment for AI-driven finance:

* High-throughput trading capabilities enable rapid AI strategy adjustment
* Cross-chain interoperability expands the opportunity landscape for intelligent agents
* Advanced order types allow for sophisticated algorithmic entry and exit mechanisms
* Composable smart contracts facilitate AI strategy implementation with minimal gas costs
* Injective's orderly EVM execution provides predictable environments for AI decision-making
* Fast finality ensures AI agents can quickly react to changing market conditions
## 📂 Project Structure

```
DarwinFi/
├── agents/             # Agent Evolution System implementation
├── contracts/          # Smart contracts for on-chain operations
│   ├── src/            # Contract source files
│   ├── scripts/        # Deployment and interaction scripts
│   └── test/           # Contract test suite
├── docs/               # Documentation and whitepapers
├── frontend/           # Web interface for monitoring and management
│   ├── public/         # Public assets
│   └── src/            # Frontend source code
├── LICENSE             # Project license
└── README.md           # This file
```
## 🛠️ Installation and Setup

### Prerequisites

* Node.js (v16+)
* Python 3.9+
* Rust (for certain components)
* Injective CLI

### Getting Started

1. Clone the repository:
```bash
git clone https://github.com/ldmdldm/DarwinFi.git
cd DarwinFi
```

2. Install dependencies:
```bash
# For smart contracts
cd contracts
npm install

# For frontend
cd ../frontend
npm install

# For agent system
cd ../agents
pip install -r requirements.txt
```

3. Configure your environment:
```bash
cp .env.example .env
# Edit .env with your specific configuration
```

4. Run tests:
```bash
npm test
```

5. Compile contracts:
```bash
npx hardhat compile
```

6. Deploy to Injective EVM Testnet:
```bash
npx hardhat run scripts/deploy-injective-evm.ts --network injectiveEvmTestnet
```
## 🏆 About the Hackathon

<div align="center">
</div>

This project is being developed as part of the [Injective AI Agent Hackathon on DoraHacks](https://dorahacks.io/hackathon/injective-ai/detail), where the convergence of AI and blockchain technologies is creating unprecedented opportunities for innovation.

* **Timeline:** 
Opens January 21, 2025

Hackathon Start Date: February 4, 2025

Online Submission Deadline: March 17, 2025

Project Evaluation Deadline: March 31st, 2025
* **Prize Pool:** $100,000
* **Track:** AI Agent Innovation
* **Team:** DarwinFi Team

The hackathon challenges participants to build AI agents that can autonomously interact with the Injective blockchain. DarwinFi shows how AI agents can improve DeFi by creating adaptive strategies that evolve over time to maximize yield in changing market conditions! 

## 📄 License

[MIT](LICENSE)

## 📧 Contact

For more information, please reach out to the team at [example@darwinfi.io](mailto:example@darwinfi.io)

## 🏗️ Technical Architecture

DarwinFi employs a modular architecture

## Development Roadmap

### Phase 1: Foundation (Current)
- Core smart contract deployment
- Basic strategy implementation
- Integration with Injective infrastructure
- Frontend dashboard for monitoring

### Phase 2: Evolution (Q2 2025)
- Advanced genetic algorithm implementation
- Expanded strategy library
- Multi-chain yield farming
- Risk management enhancements

### Phase 3: Intelligence (Q3 2025)
- AI-assisted strategy development
- Predictive market analytics
- Community governance integration
- Protocol partnerships and integrations
# DarwinFi Testnet Deployment Guide

## Prerequisites

- Node.js (v16+)
- Python 3.9+
- Rust (for certain components)
- Injective CLI (install with `npm install -g @injectivelabs/cli`)
- Docker & Docker Compose (for containerized deployment)
### Contract Deployment to Injective Testnet

1. Install dependencies:
```bash
cd contracts
npm install
```

2. Configure environment:
```bash
cp .env.example .env
```

3. Edit .env with your testnet configuration:
```
# Required for Injective Testnet
INJECTIVE_TESTNET_PRIVATE_KEY=your_private_key_here
INJECTIVE_TESTNET_RPC=https://testnet.sentry.tm.injective.network:443
INJECTIVE_TESTNET_CHAIN_ID=injective-888
```

4. Deploy contracts to Injective Testnet:
```bash
npx hardhat run scripts/deploy.js --network injectiveTestnet
```

5. Verify contracts on Injective Explorer:
```bash
npx hardhat verify --network injectiveTestnet <CONTRACT_ADDRESS> <CONSTRUCTOR_ARGS>
```

6. Save the deployed contract addresses:
```bash
# Example output after deployment
# Strategy Manager deployed to: inj1...
# Strategy Registry deployed to: inj1...
# Strategy Factory deployed to: inj1...
```
### Backend Deployment to Injective Testnet

1. Install dependencies:
```bash
cd backend
npm install
```

2. Configure environment for testnet:
```bash
cp .env.example .env
```

3. Edit .env with your testnet configuration and the contract addresses from the previous step:
```
# Node environment
NODE_ENV=production

# Server configuration
PORT=3001
API_PREFIX=/api

# Injective Testnet Configuration
INJECTIVE_NETWORK=testnet
INJECTIVE_ENDPOINT=https://testnet.sentry.tm.injective.network:443
INJECTIVE_CHAIN_ID=injective-888
INJECTIVE_PRIVATE_KEY=your_private_key_here

# Contract addresses (from previous deployment step)
STRATEGY_MANAGER_ADDRESS=inj1...
STRATEGY_REGISTRY_ADDRESS=inj1...
STRATEGY_FACTORY_ADDRESS=inj1...
```

4. Build the TypeScript code:
```bash
npm run build
```

5. Start the backend server:
```bash
npm start
```

6. For production deployment, use PM2:
```bash
npm install -g pm2
pm2 start dist/server.js --name darwinfi-backend
```

### Agent System Setup

1. Install dependencies:
```bash
cd agents
pip install -r requirements.txt
```

2. Configure the agent system:
```bash
cp config.example.json config.json
# Edit config.json with your specific settings and contract addresses
```

3. Start the agent system:
```bash
python main.py
```
### Frontend Deployment

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Configure the frontend for testnet:
```bash
cp .env.example .env
```

3. Edit .env with your backend API endpoint and testnet contract addresses:
```
REACT_APP_API_URL=https://your-backend-url.com/api
REACT_APP_INJECTIVE_NETWORK=testnet
REACT_APP_STRATEGY_MANAGER_ADDRESS=inj1...
REACT_APP_STRATEGY_REGISTRY_ADDRESS=inj1...
REACT_APP_STRATEGY_FACTORY_ADDRESS=inj1...
```

4. Build for production:
```bash
npm run build
```

5. Deploy the built frontend to a static hosting service (e.g., Netlify, Vercel, GitHub Pages):
```bash
# Example for Netlify
npx netlify-cli deploy --prod --dir build
```

### Docker Deployment (All Components)

For a complete containerized deployment:

1. Configure all .env files as described above

2. Build and start all containers:
```bash
docker-compose up -d
```

3. Access the application:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001/api
## Testnet Usage and Interaction

Once deployed, you can interact with the DarwinFi platform on Injective Testnet:

### 1. Connect Wallet

1. Visit your deployed frontend application
2. Connect your Injective wallet (Metamask with Injective configuration or Keplr)
3. Ensure you're connected to the Injective Testnet

### 2. Create a Strategy

1. Navigate to the "Create Strategy" page
2. Select a strategy type (Momentum, Mean Reversion, etc.)
3. Configure strategy parameters
4. Click "Create" to deploy the strategy to testnet

### 3. Backtest a Strategy

1. Select a strategy from your dashboard
2. Click "Backtest" and set the backtest parameters
3. Review the backtesting results and performance metrics

### 4. Deploy a Strategy

1. From the strategy details page, click "Deploy to Testnet"
2. Confirm the transaction in your wallet
3. Once confirmed, the strategy will be live on Injective Testnet

### 5. Monitor Performance

1. View your active strategies in the dashboard
2. Track performance metrics in real-time
3. Make adjustments to parameters as needed

### Getting Testnet INJ:

Visit the [Injective Testnet Faucet](https://testnet.injective.exchange/faucet) to receive test INJ tokens.

## Hackathon Submission Details

**Project Name**: DarwinFi  
**Team**: NeoLabs Team   
**Submission Date**: March 3, 2025  

### What's important about DarwinFi

DarwinFi is not like traditional yield aggregators because it has:

1. **Evolution**: Strategies improve automatically through machine learning algorithms
2. **Adaptation**: Neural networks enable quick response to changing market dynamics
3. **Learning**: AI system analyzes unsuccessful strategies to avoid similar mistakes
4. **Diversification**: Evolutionary algorithms preserve strategic diversity
5. **Operation**: Agents can operate 24/7 without human intervention
6. **Verification**: All AI decisions are transparent and verifiable on Injective's blockchain

### Technical Achievements

- Implementation of on chain genetic algorithms and machine learning models for strategy evolution
- Novel AI risk scoring system for evaluating strategy fitness across various market conditions
- Efficient capital allocation mechanism that balances exploration and exploitation using reinforcement learning
- Integration with Injective's advanced trading features to enable complex AI-driven strategies
- Development of a secure oracle system for feeding external data to on-chain AI models
- Creation of a decentralized governance mechanism for AI parameter adjustment

### Future Development

Based on hackathon feedback we plan to:

- Bring the AI models with more sophisticated deep learning techniques
- Implement transformer models for better prediction of market trends
- Expand to additional blockchains beyond Injective through cross-chain bridges
- Develop an AI agent marketplace where users can subscribe to different strategies
- Integrate federated learning to enable collaborative improvement without data sharing
- Create API endpoints for third-party developers to build on top of our AI infrastructure

## License

[MIT](LICENSE)

## Contact

For more information, please reach out to the team at [example@darwinfi.io](mailto:example@darwinfi.io)
