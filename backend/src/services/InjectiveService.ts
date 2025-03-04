import { 
ChainId, 
Network, 
getNetworkEndpoints,
PrivateKey,
MsgBroadcaster,
Wallet,
MsgExecuteContract,
TxResponse,
IndexerGrpcSpotApi,
IndexerGrpcAccountApi,
ChainGrpcWasmApi
} from '@injectivelabs/sdk-ts';
import { BigNumberInBase } from '@injectivelabs/utils';
import dotenv from 'dotenv';

dotenv.config();

/**
* Service class for interacting with the Injective Protocol
* Handles connections to the network, wallet management, and blockchain operations
*/
export class InjectiveService {
private chainId: ChainId;
private network: Network;
private endpoints: ReturnType<typeof getNetworkEndpoints>;
private privateKey: PrivateKey | undefined;
private wallet: Wallet | undefined;
private msgBroadcaster: MsgBroadcaster | undefined;
private spotApi: IndexerGrpcSpotApi | undefined;
private accountApi: IndexerGrpcAccountApi | undefined;
private wasmApi: ChainGrpcWasmApi | undefined;

constructor() {
    // Using testnet by default
    this.network = Network.Testnet;
    this.chainId = ChainId.Testnet;
    this.endpoints = getNetworkEndpoints(this.network);
    
    this.initialize();
}

/**
* Initialize the service by setting up APIs and wallet if private key is provided
*/
private async initialize() {
    try {
    // Initialize API clients
    this.spotApi = new IndexerGrpcSpotApi(this.endpoints.indexer);
    this.accountApi = new IndexerGrpcAccountApi(this.endpoints.indexer);
    this.wasmApi = new ChainGrpcWasmApi(this.endpoints.grpc);

    // Initialize wallet if private key is provided
    const privateKeyString = process.env.INJECTIVE_PRIVATE_KEY;
    if (privateKeyString) {
        this.privateKey = PrivateKey.fromHex(privateKeyString);
        this.wallet = await this.privateKey.toWallet();
        this.msgBroadcaster = new MsgBroadcaster({
        network: this.network,
        endpoints: this.endpoints,
        privateKey: this.privateKey
        });
    }
    } catch (error) {
    console.error('Failed to initialize InjectiveService:', error);
    throw new Error('Failed to initialize InjectiveService');
    }
}

/**
* Get the current wallet's address
* @returns The wallet's address or null if no wallet is initialized
*/
public getAddress(): string | null {
    return this.wallet ? this.wallet.address() : null;
}

/**
* Get the wallet's balance
* @returns The wallet's balance or null if no wallet is initialized
*/
public async getBalance(): Promise<{ denom: string; amount: string }[] | null> {
    if (!this.wallet) {
    return null;
    }

    try {
    const address = this.wallet.address();
    const bankBalance = await this.accountApi?.fetchBalance({
        accountAddress: address,
    });
    
    return bankBalance?.balances || null;
    } catch (error) {
    console.error('Failed to get balance:', error);
    throw new Error('Failed to get wallet balance');
    }
}

/**
* Get available markets from the Injective Exchange
* @returns List of available markets
*/
public async getMarkets() {
    try {
    const markets = await this.spotApi?.fetchMarkets();
    return markets?.markets || [];
    } catch (error) {
    console.error('Failed to get markets:', error);
    throw new Error('Failed to fetch markets from Injective');
    }
}

/**
* Get market price for a specific market
* @param marketId The ID of the market to query
* @returns The current market price
*/
public async getMarketPrice(marketId: string): Promise<string> {
    try {
    const trades = await this.spotApi?.fetchTrades({
        marketId,
        limit: 1,
    });
    
    if (!trades || trades.trades.length === 0) {
        throw new Error(`No trades found for market ${marketId}`);
    }
    
    return trades.trades[0].price.toString();
    } catch (error) {
    console.error(`Failed to get price for market ${marketId}:`, error);
    throw new Error(`Failed to get price for market ${marketId}`);
    }
}

/**
* Get orderbook data for a specific market
* @param marketId The ID of the market to query
* @returns The current orderbook
*/
public async getOrderbook(marketId: string): Promise<{ buys: any[]; sells: any[] }> {
try {
    const orderbook = await this.spotApi?.fetchOrderbook({
    marketId,
    });
    
    return {
    buys: orderbook?.buys || [],
    sells: orderbook?.sells || []
    };
} catch (error) {
    console.error(`Failed to get orderbook for market ${marketId}:`, error);
    throw new Error(`Failed to get orderbook for market ${marketId}`);
}
}

/**
* Get detailed market information
* @param marketId Optional market ID. If not provided, returns all markets
* @returns Market data
*/
public async getMarketInfo(marketId?: string): Promise<MarketData | MarketData[]> {
try {
    const marketsResponse = await this.spotApi?.fetchMarkets({
    marketStatus: 'active',
    marketId: marketId,
    });
    
    if (!marketsResponse || marketsResponse.markets.length === 0) {
    throw new Error(marketId ? `Market ${marketId} not found or not active` : 'No active markets found');
    }
    
    if (marketId) {
    const market = marketsResponse.markets.find(m => m.marketId === marketId);
    if (!market) {
        throw new Error(`Market ${marketId} not found`);
    }
    
    return this.formatMarketData(market);
    }
    
    return marketsResponse.markets.map(market => this.formatMarketData(market));
} catch (error) {
    console.error(`Failed to get market info${marketId ? ` for ${marketId}` : ''}:`, error);
    throw new Error(`Failed to get market info${marketId ? ` for ${marketId}` : ''}`);
}
}

/**
* Helper method to format market data
* @param market Raw market data
* @returns Formatted market data
*/
private formatMarketData(market: any): MarketData {
return {
    marketId: market.marketId,
    baseToken: market.baseToken,
    quoteToken: market.quoteToken,
    price: market.lastPrice || '0',
    volume24h: market.volume24h || '0',
    high24h: market.high24h || '0',
    low24h: market.low24h || '0',
    lastTradedAt: market.lastTradedAt ? new Date(market.lastTradedAt) : new Date(),
    isActive: market.marketStatus === 'active',
    minQuantity: market.minQuantity || '0',
    minPrice: market.minPrice || '0',
    makerFee: market.makerFeeRate || '0',
    takerFee: market.takerFeeRate || '0'
};
}

/**
* Execute a trade on the Injective Exchange
* @param params Trade parameters
* @returns Transaction response
*/
public async executeTrade(params: TradeParams): Promise<TxResponse> {
if (!this.wallet || !this.msgBroadcaster) {
    throw new Error('Wallet not initialized. Please provide a private key.');
}

try {
    const address = this.wallet.address();
    
    // Implementation will depend on the specific order type and requirements
    // This is a simplified example that would need to be expanded based on actual needs
    
    // For a real implementation, you would use the appropriate MsgCreate[Market|Limit]Order classes
    // from the Injective SDK and broadcast the transaction
    
    throw new Error('Trade execution not fully implemented. Customize based on your specific requirements.');
    
    // Example implementation for a complete solution would involve:
    // 1. Creating the appropriate order message based on params.orderType
    // 2. Broadcasting the transaction
    // 3. Handling confirmation and order status
    
} catch (error) {
    console.error('Failed to execute trade:', error);
    throw new Error('Failed to execute trade on Injective Exchange');
}
}

/**
* Run backtesting for a strategy using historical data
* @param strategyName The name of the strategy to test
* @param marketId The market to test on
* @param startTime Starting timestamp for backtest
* @param endTime Ending timestamp for backtest
* @param params Additional parameters for the strategy
* @returns Backtest results
*/
public async runBacktest(
strategyName: string,
marketId: string,
startTime: Date,
endTime: Date,
params: Record<string, any> = {}
): Promise<BacktestResult> {
try {
    // Fetch historical data for the specified timeframe
    const historicalData = await this.fetchHistoricalData(marketId, startTime, endTime);
    
    if (!historicalData || historicalData.length === 0) {
    throw new Error(`No historical data available for market ${marketId} in the specified timeframe`);
    }

    // In a real implementation, you would:
    // 1. Load the appropriate strategy based on strategyName
    // 2. Initialize the strategy with the params
    // 3. Run the strategy against the historical data
    // 4. Calculate performance metrics
    
    // This is a placeholder implementation
    console.log(`Running backtest for ${strategyName} on ${marketId} from ${startTime} to ${endTime}`);
    console.log('Strategy parameters:', params);
    console.log(`Retrieved ${historicalData.length} historical data points`);
    
    // Simulate a basic backtest result
    return {
    returns: 0.15, // 15% return
    trades: 24,
    winRate: 0.65, // 65% win rate
    sharpeRatio: 1.2,
    maxDrawdown: 0.08, // 8% max drawdown
    profitFactor: 1.8,
    averageWin: 0.04, // 4% average win
    averageLoss: 0.02, // 2% average loss
    timeframe: '1h',
    startDate: startTime,
    endDate: endTime,
    marketId: marketId,
    strategyName: strategyName,
    tradesHistory: historicalData.slice(0, 10).map((data, index) => ({
        timestamp: new Date(data.timestamp),
        marketId: marketId,
        direction: index % 2 === 0 ? 'buy' : 'sell',
        price: data.price,
        quantity: '1.0',
        fee: '0.001',
        pnl: (index % 3 === 0 ? '0.05' : index % 5 === 0 ? '-0.02' : '0.01'),
    })),
    };
} catch (error) {
    console.error(`Failed to run backtest for ${strategyName} on ${marketId}:`, error);
    throw new Error(`Failed to run backtest: ${error.message}`);
}
}

/**
* Fetch historical market data
* @param marketId The market to fetch data for
* @param startTime Start time for historical data
* @param endTime End time for historical data
* @param resolution Resolution/timeframe for the data (e.g. 1m, 5m, 1h, 1d)
* @returns Array of historical data points
*/
private async fetchHistoricalData(
marketId: string,
startTime: Date,
endTime: Date,
resolution: string = '1h'
): Promise<any[]> {
try {
    // This would call the appropriate Injective API to fetch historical candles
    // Actual implementation depends on the specific Injective API endpoints available
    
    // For now, return simulated data
    const dataPoints = [];
    let currentTime = new Date(startTime);
    
    while (currentTime <= endTime) {
    // Generate mock price data with some randomness
    const price = 100 + (Math.sin(currentTime.getTime() / 1000000) * 10) + (Math.random() * 5);
    
    dataPoints.push({
        timestamp: new Date(currentTime),
        open: price,
        high: price * (1 + Math.random() * 0.02),
        low: price * (1 - Math.random() * 0.02),
        close: price * (1 + (Math.random() * 0.04 - 0.02)),
        volume: Math.random() * 100 + 20,
        price: price.toFixed(2),
    });
    
    // Increment time based on resolution
    if (resolution === '1m') {
        currentTime = new Date(currentTime.getTime() + 60 * 1000);
    } else if (resolution === '5m') {
        currentTime = new Date(currentTime.getTime() + 5 * 60 * 1000);
    } else if (resolution === '1h') {
        currentTime = new Date(currentTime.getTime() + 60 * 60 * 1000);
    } else if (resolution === '1d') {
        currentTime = new Date(currentTime.getTime() + 24 * 60 * 60 * 1000);
    }
    }
    
    return dataPoints;
} catch (error) {
    console.error(`Failed to fetch historical data for ${marketId}:`, error);
    throw new Error(`Failed to fetch historical data for ${marketId}`);
}
}

/**
* Execute a smart contract call (i.e., execute a strategy contract)
* @param contractAddress The address of the smart contract
* @param msg The message to send to the contract (as a JSON object)
* @param funds Optional funds to send with the message
* @returns Transaction response
*/
public async executeContract(
    contractAddress: string,
    msg: Record<string, unknown>,
    funds?: { denom: string; amount: string }[]
): Promise<TxResponse> {
    if (!this.wallet || !this.msgBroadcaster) {
    throw new Error('Wallet not initialized. Please provide a private key.');
    }

    try {
    const address = this.wallet.address();
    
    const message = MsgExecuteContract.fromJSON({
        sender: address,
        contractAddress,
        msg,
        funds: funds || [],
    });

    return await this.msgBroadcaster.broadcast({
        msgs: [message],
        injectiveAddress: address,
    });
    } catch (error) {
    console.error('Failed to execute contract:', error);
    throw new Error('Failed to execute smart contract');
    }
}

/**
* Query a smart contract's state
* @param contractAddress The address of the smart contract
* @param query The query to send to the contract (as a JSON object)
* @returns Query response
*/
public async queryContract(
    contractAddress: string,
    query: Record<string, unknown>
): Promise<any> {
    try {
    const response = await this.wasmApi?.fetchSmartContractState(
        contractAddress,
        Buffer.from(JSON.stringify(query)).toString('base64')
    );
    
    return response?.data ? JSON.parse(Buffer.from(response.data, 'base64').toString()) : null;
    } catch (error) {
    console.error('Failed to query contract:', error);
    throw new Error('Failed to query smart contract');
    }
}

/**
* Estimate gas for a transaction
* @param messages Array of messages to include in the transaction
* @returns Estimated gas
*/
public async estimateGas(messages: any[]): Promise<BigNumberInBase> {
    if (!this.wallet) {
    throw new Error('Wallet not initialized');
    }

    try {
    // This is a placeholder for gas estimation
    // In a real implementation, you would use the appropriate API
    return new BigNumberInBase(500000);
    } catch (error) {
    console.error('Failed to estimate gas:', error);
    throw new Error('Failed to estimate gas');
    }
}
}

// Export singleton instance
export default new InjectiveService();

/**
* Types for Trading Strategy execution
*/
export interface TradeParams {
marketId: string;
subaccountId?: string;
injectiveAddress: string;
orderType: 'market' | 'limit';
direction: 'buy' | 'sell';
price?: string;
quantity: string;
leverage?: number;
}

export interface BacktestResult {
returns: number;
trades: number;
winRate: number;
sharpeRatio: number;
maxDrawdown: number;
profitFactor: number;
averageWin: number;
averageLoss: number;
timeframe: string;
startDate: Date;
endDate: Date;
marketId: string;
strategyName: string;
tradesHistory: {
    timestamp: Date;
    marketId: string;
    direction: 'buy' | 'sell';
    price: string;
    quantity: string;
    fee: string;
    pnl: string;
}[];
}

export interface MarketData {
marketId: string;
baseToken: string;
quoteToken: string;
price: string;
volume24h: string;
high24h: string;
low24h: string;
lastTradedAt: Date;
isActive: boolean;
minQuantity: string;
minPrice: string;
makerFee: string;
takerFee: string;
}
