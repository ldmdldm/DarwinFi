# DarwinFi Testnet Deployment Guide

This document provides instructions for judges to test our DarwinFi platform on the Injective testnet. DarwinFi is an evolutionary yield optimization platform that uses AI to create, evolve, and deploy trading strategies.

## Prerequisites

- [Keplr Wallet](https://www.keplr.app/) or [Metamask](https://metamask.io/) browser extension installed
- Some testnet INJ tokens (see "Getting Testnet Tokens" below)
- A modern web browser (Chrome, Firefox, or Edge recommended)

## Getting Testnet Tokens

1. Visit the [Injective Testnet Faucet](https://testnet.injective.exchange/faucet)
2. Connect your wallet
3. Request testnet INJ tokens
4. Wait for tokens to appear in your wallet (usually within a minute)

## Accessing the Platform

Our platform is deployed at: `https://darwinfi-testnet.example.com`

1. Visit the URL in your browser
2. Click "Connect Wallet" in the top right corner
3. Choose your wallet (Keplr or Metamask)
4. Ensure you're connected to the Injective Testnet

## Testing Guide

### 1. Browse Available Strategies

- Navigate to the "Strategies" tab
- You should see a list of pre-deployed strategies with performance metrics
- Click on any strategy to view detailed performance data and parameters

### 2. Create a New Strategy

1. Click the "Create Strategy" button
2. Select a base strategy type (e.g., Momentum, Mean Reversion, Grid)
3. Configure parameters:
- Trading pairs (e.g., INJ/USDT)
- Time frame (e.g., 5m, 15m, 1h)
- Risk level (Low, Medium, High)
- Initial capital (amount in USDT)
4. Click "Backtest" to see historical performance
5. If satisfied, click "Save Strategy"

### 3. Deploy a Strategy

1. From your saved strategies, select one to deploy
2. Click "Deploy to Testnet"
3. Approve the transaction in your wallet
4. Wait for confirmation (usually takes 15-30 seconds)
5. You'll be redirected to the strategy monitoring page

### 4. Monitor Live Performance

1. Navigate to "My Strategies"
2. Select your deployed strategy
3. View real-time performance metrics:
- Current P&L
- Trade history
- Position status
- Risk metrics

### 5. Adjust and Evolve Strategy

1. From the strategy detail page, click "Evolve"
2. The system will suggest parameter modifications based on market conditions
3. Review the suggested changes
4. Click "Apply Changes" to update your strategy
5. Approve the transaction in your wallet

### 6. Execute Manual Trades (Optional)

1. Navigate to the "Trade" tab
2. Select a trading pair
3. Enter the amount to trade
4. Click "Buy" or "Sell"
5. Approve the transaction in your wallet

## Key Features to Evaluate

- **Strategy Evolution**: How effectively the system adapts strategies to changing market conditions
- **Execution Speed**: Latency between signal generation and trade execution
- **Risk Management**: How well the system manages downside risk
- **User Experience**: Intuitiveness of the interface for non-technical users
- **Performance Metrics**: Accuracy and comprehensiveness of performance reporting

## Troubleshooting

### Connection Issues

- Ensure you're connected to the Injective Testnet in your wallet
- Try refreshing the page
- Clear browser cache and reload

### Transaction Failures

- Check that you have sufficient testnet INJ for gas fees
- Ensure transaction parameters are within valid ranges
- Check the Injective Explorer for any network issues

### Strategy Deployment Issues

- Verify all strategy parameters are within acceptable ranges
- Ensure you have sufficient testnet USDT for the strategy
- Check that the selected trading pairs are available on testnet

## Contact Support

If you encounter any issues during testing, please contact us at:
- Email: support@darwinfi.example.com
- Discord: https://discord.gg/darwinfi
- Telegram: @DarwinFiSupport

We are available 24/7 during the judging period to assist with any questions or issues.

