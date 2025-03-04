import express from 'express';
import { Router } from 'express';

// Import controllers (to be implemented)
// These will be created in separate files
import * as strategyController from '../controllers/strategyController';
import * as marketDataController from '../controllers/marketDataController';
import * as injectiveController from '../controllers/injectiveController';

const router: Router = express.Router();

// ============================================================
// Strategy Routes
// ============================================================

/**
* @route   GET /api/strategies
* @desc    Get all strategies
* @access  Public
*/
router.get('/strategies', strategyController.getAllStrategies);

/**
* @route   GET /api/strategies/:id
* @desc    Get strategy by ID
* @access  Public
*/
router.get('/strategies/:id', strategyController.getStrategyById);

/**
* @route   POST /api/strategies
* @desc    Create a new strategy
* @access  Private
*/
router.post('/strategies', strategyController.createStrategy);

/**
* @route   PUT /api/strategies/:id
* @desc    Update a strategy
* @access  Private
*/
router.put('/strategies/:id', strategyController.updateStrategy);

/**
* @route   DELETE /api/strategies/:id
* @desc    Delete a strategy
* @access  Private
*/
router.delete('/strategies/:id', strategyController.deleteStrategy);

/**
* @route   POST /api/strategies/:id/backtest
* @desc    Run backtest for a strategy
* @access  Private
*/
router.post('/strategies/:id/backtest', strategyController.backtestStrategy);

/**
* @route   POST /api/strategies/:id/deploy
* @desc    Deploy a strategy to the blockchain
* @access  Private
*/
router.post('/strategies/:id/deploy', strategyController.deployStrategy);

/**
* @route   GET /api/strategies/:id/performance
* @desc    Get performance metrics for a strategy
* @access  Public
*/
router.get('/strategies/:id/performance', strategyController.getStrategyPerformance);

// ============================================================
// Market Data Routes
// ============================================================

/**
* @route   GET /api/market-data/assets
* @desc    Get all available assets
* @access  Public
*/
router.get('/market-data/assets', marketDataController.getAllAssets);

/**
* @route   GET /api/market-data/price/:symbol
* @desc    Get current price for an asset
* @access  Public
*/
router.get('/market-data/price/:symbol', marketDataController.getAssetPrice);

/**
* @route   GET /api/market-data/history/:symbol
* @desc    Get price history for an asset
* @access  Public
*/
router.get('/market-data/history/:symbol', marketDataController.getAssetPriceHistory);

/**
* @route   GET /api/market-data/pairs
* @desc    Get all available trading pairs
* @access  Public
*/
router.get('/market-data/pairs', marketDataController.getTradingPairs);

/**
* @route   GET /api/market-data/indicators/:symbol
* @desc    Get technical indicators for an asset
* @access  Public
*/
router.get('/market-data/indicators/:symbol', marketDataController.getIndicators);

// ============================================================
// Injective Integration Routes
// ============================================================

/**
* @route   GET /api/injective/account/:address
* @desc    Get account details from Injective
* @access  Public
*/
router.get('/injective/account/:address', injectiveController.getAccountDetails);

/**
* @route   GET /api/injective/markets
* @desc    Get available markets on Injective
* @access  Public
*/
router.get('/injective/markets', injectiveController.getMarkets);

/**
* @route   POST /api/injective/trade
* @desc    Execute a trade on Injective
* @access  Private
*/
router.post('/injective/trade', injectiveController.executeTrade);

/**
* @route   GET /api/injective/orders/:address
* @desc    Get orders for an address
* @access  Private
*/
router.get('/injective/orders/:address', injectiveController.getOrders);

/**
* @route   POST /api/injective/cancel-order
* @desc    Cancel an order on Injective
* @access  Private
*/
router.post('/injective/cancel-order', injectiveController.cancelOrder);

/**
* @route   GET /api/injective/positions/:address
* @desc    Get positions for an address
* @access  Private
*/
router.get('/injective/positions/:address', injectiveController.getPositions);

/**
* @route   GET /api/injective/transaction/:hash
* @desc    Get transaction details
* @access  Public
*/
router.get('/injective/transaction/:hash', injectiveController.getTransactionDetails);

export default router;

