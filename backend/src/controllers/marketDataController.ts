import { Request, Response } from 'express';
import axios from 'axios';

// Interface for market data response
interface MarketData {
symbol: string;
price: number;
timestamp: number;
volume24h?: number;
change24h?: number;
high24h?: number;
low24h?: number;
}

// Interface for candle data
interface CandleData {
timestamp: number;
open: number;
high: number;
low: number;
close: number;
volume: number;
}

// Interface for order book data
interface OrderBookEntry {
price: number;
quantity: number;
}

interface OrderBook {
bids: OrderBookEntry[];
asks: OrderBookEntry[];
timestamp: number;
}

/**
* Controller for handling market data related API endpoints
*/
class MarketDataController {
/**
* Fetches the latest prices for all available markets or a specific market
*/
public async getLatestPrices(req: Request, res: Response): Promise<void> {
    try {
    const { symbol } = req.query;
    
    // URL would typically come from a configuration file
    const baseUrl = process.env.MARKET_DATA_API_URL || 'https://api.injective.network';
    
    let endpoint = '/api/v1/markets/prices';
    if (symbol) {
        endpoint += `?symbol=${symbol}`;
    }
    
    const response = await axios.get(`${baseUrl}${endpoint}`);
    
    res.status(200).json({
        success: true,
        data: response.data,
        timestamp: Date.now()
    });
    } catch (error) {
    console.error('Error fetching latest prices:', error);
    res.status(500).json({
        success: false,
        message: 'Failed to fetch latest market prices',
        error: error instanceof Error ? error.message : 'Unknown error'
    });
    }
}

/**
* Fetches historical market data for a given symbol and time range
*/
public async getHistoricalData(req: Request, res: Response): Promise<void> {
    try {
    const { symbol, interval, from, to } = req.query;
    
    if (!symbol) {
        res.status(400).json({
        success: false,
        message: 'Symbol parameter is required'
        });
        return;
    }
    
    // Default to 1 day interval if not specified
    const timeInterval = interval || '1d';
    // Default to last 30 days if not specified
    const fromTimestamp = from ? Number(from) : Math.floor(Date.now() / 1000) - 30 * 24 * 60 * 60;
    const toTimestamp = to ? Number(to) : Math.floor(Date.now() / 1000);
    
    const baseUrl = process.env.MARKET_DATA_API_URL || 'https://api.injective.network';
    const endpoint = `/api/v1/markets/history?symbol=${symbol}&interval=${timeInterval}&from=${fromTimestamp}&to=${toTimestamp}`;
    
    const response = await axios.get(`${baseUrl}${endpoint}`);
    
    res.status(200).json({
        success: true,
        data: response.data,
        metadata: {
        symbol,
        interval: timeInterval,
        from: new Date(fromTimestamp * 1000).toISOString(),
        to: new Date(toTimestamp * 1000).toISOString()
        }
    });
    } catch (error) {
    console.error('Error fetching historical data:', error);
    res.status(500).json({
        success: false,
        message: 'Failed to fetch historical market data',
        error: error instanceof Error ? error.message : 'Unknown error'
    });
    }
}

/**
* Fetches available trading pairs/markets
*/
public async getMarkets(req: Request, res: Response): Promise<void> {
    try {
    const { status, limit, offset } = req.query;
    
    const baseUrl = process.env.MARKET_DATA_API_URL || 'https://api.injective.network';
    let endpoint = '/api/v1/markets';
    
    // Build query parameters
    const params = new URLSearchParams();
    if (status) params.append('status', status as string);
    if (limit) params.append('limit', limit as string);
    if (offset) params.append('offset', offset as string);
    
    const queryString = params.toString();
    if (queryString) {
        endpoint += `?${queryString}`;
    }
    
    const response = await axios.get(`${baseUrl}${endpoint}`);
    
    res.status(200).json({
        success: true,
        data: response.data,
        timestamp: Date.now()
    });
    } catch (error) {
    console.error('Error fetching markets:', error);
    res.status(500).json({
        success: false,
        message: 'Failed to fetch available markets',
        error: error instanceof Error ? error.message : 'Unknown error'
    });
    }
}

/**
* Fetches candlestick data for a given symbol and time frame
*/
public async getCandlestickData(req: Request, res: Response): Promise<void> {
    try {
    const { symbol, interval, limit } = req.query;
    
    if (!symbol) {
        res.status(400).json({
        success: false,
        message: 'Symbol parameter is required'
        });
        return;
    }
    
    // Default values
    const timeInterval = interval || '1h';
    const dataLimit = limit ? parseInt(limit as string) : 100;
    
    const baseUrl = process.env.MARKET_DATA_API_URL || 'https://api.injective.network';
    const endpoint = `/api/v1/markets/candles?symbol=${symbol}&interval=${timeInterval}&limit=${dataLimit}`;
    
    const response = await axios.get(`${baseUrl}${endpoint}`);
    
    // Format the response as an array of candle data objects
    const candles: CandleData[] = response.data.map((candle: any) => ({
        timestamp: candle.timestamp,
        open: parseFloat(candle.open),
        high: parseFloat(candle.high),
        low: parseFloat(candle.low),
        close: parseFloat(candle.close),
        volume: parseFloat(candle.volume)
    }));
    
    res.status(200).json({
        success: true,
        data: candles,
        metadata: {
        symbol,
        interval: timeInterval,
        count: candles.length
        }
    });
    } catch (error) {
    console.error('Error fetching candlestick data:', error);
    res.status(500).json({
        success: false,
        message: 'Failed to fetch candlestick data',
        error: error instanceof Error ? error.message : 'Unknown error'
    });
    }
}

/**
* Fetches market depth (order book) for a specific symbol
*/
public async getOrderBook(req: Request, res: Response): Promise<void> {
    try {
    const { symbol, depth } = req.query;
    
    if (!symbol) {
        res.status(400).json({
        success: false,
        message: 'Symbol parameter is required'
        });
        return;
    }
    
    // Default to 50 levels if not specified
    const orderBookDepth = depth ? parseInt(depth as string) : 50;
    
    const baseUrl = process.env.MARKET_DATA_API_URL || 'https://api.injective.network';
    const endpoint = `/api/v1/markets/orderbook?symbol=${symbol}&depth=${orderBookDepth}`;
    
    const response = await axios.get(`${baseUrl}${endpoint}`);
    
    // Format the order book data
    const orderBook: OrderBook = {
        bids: response.data.bids.map((bid: any) => ({
        price: parseFloat(bid[0]),
        quantity: parseFloat(bid[1])
        })),
        asks: response.data.asks.map((ask: any) => ({
        price: parseFloat(ask[0]),
        quantity: parseFloat(ask[1])
        })),
        timestamp: response.data.timestamp
    };
    
    res.status(200).json({
        success: true,
        data: orderBook,
        metadata: {
        symbol,
        depth: orderBookDepth,
        timestamp: new Date(orderBook.timestamp).toISOString()
        }
    });
    } catch (error) {
    console.error('Error fetching order book:', error);
    res.status(500).json({
        success: false,
        message: 'Failed to fetch order book data',
        error: error instanceof Error ? error.message : 'Unknown error'
    });
    }
}

/**
* Fetches market statistics for a 24h period
*/
public async getMarketStats(req: Request, res: Response): Promise<void> {
    try {
    const { symbol } = req.query;
    
    if (!symbol) {
        res.status(400).json({
        success: false,
        message: 'Symbol parameter is required'
        });
        return;
    }
    
    const baseUrl = process.env.MARKET_DATA_API_URL || 'https://api.injective.network';
    const endpoint = `/api/v1/markets/stats?symbol=${symbol}`;
    
    const response = await axios.get(`${baseUrl}${endpoint}`);
    
    res.status(200).json({
        success: true,
        data: {
        symbol: symbol,
        price: parseFloat(response.data.lastPrice),
        change24h: parseFloat(response.data.priceChangePercent),
        high24h: parseFloat(response.data.highPrice),
        low24h: parseFloat(response.data.lowPrice),
        volume24h: parseFloat(response.data.volume),
        quoteVolume24h: parseFloat(response.data.quoteVolume),
        timestamp: response.data.timestamp
        }
    });
    } catch (error) {
    console.error('Error fetching market stats:', error);
    res.status(500).json({
        success: false,
        message: 'Failed to fetch market statistics',
        error: error instanceof Error ? error.message : 'Unknown error'
    });
    }
}

/**
* Fetches trading volume over time for a specific market
*/
public async getVolumeHistory(req: Request, res: Response): Promise<void> {
    try {
    const { symbol, interval, limit } = req.query;
    
    if (!symbol) {
        res.status(400).json({
        success: false,
        message: 'Symbol parameter is required'
        });
        return;
    }
    
    // Default values
    const timeInterval = interval || '1d';
    const dataLimit = limit ? parseInt(limit as string) : 30;
    
    const baseUrl = process.env.MARKET_DATA_API_URL || 'https://api.injective.network';
    const endpoint = `/api/v1/markets/volume?symbol=${symbol}&interval=${timeInterval}&limit=${dataLimit}`;
    
    const response = await axios.get(`${baseUrl}${endpoint}`);
    
    res.status(200).json({
        success: true,
        data: response.data.map((item: any) => ({
        timestamp: item.timestamp,
        volume: parseFloat(item.volume),
        quoteVolume: parseFloat(item.quoteVolume)
        })),
        metadata: {
        symbol,
        interval: timeInterval,
        dataPoints: dataLimit
        }
    });
    } catch (error) {
    console.error('Error fetching volume history:', error);
    res.status(500).json({
        success: false,
        message: 'Failed to fetch volume history data',
        error: error instanceof Error ? error.message : 'Unknown error'
    });
    }
}
}

export default new MarketDataController();

