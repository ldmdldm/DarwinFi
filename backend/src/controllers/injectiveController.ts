import { Request, Response } from 'express';
import { 
ChainId,
Network,
getNetworkEndpoints,
PrivateKey,
MsgBroadcaster,
TxGrpcClient,
ChainGrpcAuthApi,
ChainGrpcExchangeApi,
ChainGrpcBankApi,
IndexerGrpcSpotApi,
IndexerGrpcDerivativesApi,
IndexerGrpcAccountApi,
SpotOrderType,
SpotMarket,
SpotOrderSide
} from '@injectivelabs/sdk-ts';

// Singleton for Injective services
class InjectiveService {
private static instance: InjectiveService;
private network: Network;
private endpoints: any;
private chainId: ChainId;
private txClient: TxGrpcClient;
private authApi: ChainGrpcAuthApi;
private exchangeApi: ChainGrpcExchangeApi;
private bankApi: ChainGrpcBankApi;
private spotApi: IndexerGrpcSpotApi;
private derivativesApi: IndexerGrpcDerivativesApi;
private accountApi: IndexerGrpcAccountApi;

private constructor() {
    // Default to testnet
    this.network = Network.Testnet;
    this.endpoints = getNetworkEndpoints(this.network);
    this.chainId = ChainId.Testnet;
    
    // Initialize API clients
    this.txClient = new TxGrpcClient(this.endpoints.grpc);
    this.authApi = new ChainGrpcAuthApi(this.endpoints.grpc);
    this.exchangeApi = new ChainGrpcExchangeApi(this.endpoints.grpc);
    this.bankApi = new ChainGrpcBankApi(this.endpoints.grpc);
    this.spotApi = new IndexerGrpcSpotApi(this.endpoints.indexer);
    this.derivativesApi = new IndexerGrpcDerivativesApi(this.endpoints.indexer);
    this.accountApi = new IndexerGrpcAccountApi(this.endpoints.indexer);
}

public static getInstance(): InjectiveService {
    if (!InjectiveService.instance) {
    InjectiveService.instance = new InjectiveService();
    }
    return InjectiveService.instance;
}

public switchNetwork(network: Network): void {
    this.network = network;
    this.endpoints = getNetworkEndpoints(this.network);
    this.chainId = network === Network.Mainnet ? ChainId.Mainnet : ChainId.Testnet;
    
    // Reinitialize API clients with new endpoints
    this.txClient = new TxGrpcClient(this.endpoints.grpc);
    this.authApi = new ChainGrpcAuthApi(this.endpoints.grpc);
    this.exchangeApi = new ChainGrpcExchangeApi(this.endpoints.grpc);
    this.bankApi = new ChainGrpcBankApi(this.endpoints.grpc);
    this.spotApi = new IndexerGrpcSpotApi(this.endpoints.indexer);
    this.derivativesApi = new IndexerGrpcDerivativesApi(this.endpoints.indexer);
    this.accountApi = new IndexerGrpcAccountApi(this.endpoints.indexer);
}

// Getters for the API clients
public getTxClient(): TxGrpcClient {
    return this.txClient;
}

public getAuthApi(): ChainGrpcAuthApi {
    return this.authApi;
}

public getExchangeApi(): ChainGrpcExchangeApi {
    return this.exchangeApi;
}

public getBankApi(): ChainGrpcBankApi {
    return this.bankApi;
}

public getSpotApi(): IndexerGrpcSpotApi {
    return this.spotApi;
}

public getDerivativesApi(): IndexerGrpcDerivativesApi {
    return this.derivativesApi;
}

public getAccountApi(): IndexerGrpcAccountApi {
    return this.accountApi;
}

public getChainId(): ChainId {
    return this.chainId;
}

public getEndpoints(): any {
    return this.endpoints;
}

public getNetwork(): Network {
    return this.network;
}
}

// Controller for handling Injective API endpoints
export class InjectiveController {
private injectiveService: InjectiveService;

constructor() {
    this.injectiveService = InjectiveService.getInstance();
}

/**
* Switch between testnet and mainnet
*/
public switchNetwork = async (req: Request, res: Response): Promise<void> => {
    try {
    const { network } = req.body;
    
    if (!network || (network !== 'mainnet' && network !== 'testnet')) {
        res.status(400).json({ error: 'Invalid network. Must be either "mainnet" or "testnet"' });
        return;
    }
    
    const networkEnum = network === 'mainnet' ? Network.Mainnet : Network.Testnet;
    this.injectiveService.switchNetwork(networkEnum);
    
    res.status(200).json({ 
        success: true, 
        message: `Switched to ${network}`,
        network: network,
        chainId: this.injectiveService.getChainId()
    });
    } catch (error) {
    console.error('Error switching network:', error);
    res.status(500).json({ error: 'Failed to switch network', details: error.message });
    }
};

/**
* Get current network configuration
*/
public getNetworkInfo = async (req: Request, res: Response): Promise<void> => {
    try {
    const network = this.injectiveService.getNetwork();
    const chainId = this.injectiveService.getChainId();
    const endpoints = this.injectiveService.getEndpoints();
    
    res.status(200).json({
        network: network === Network.Mainnet ? 'mainnet' : 'testnet',
        chainId: chainId,
        endpoints: endpoints
    });
    } catch (error) {
    console.error('Error getting network info:', error);
    res.status(500).json({ error: 'Failed to get network information', details: error.message });
    }
};

/**
* Get account balances and information
*/
public getAccountInfo = async (req: Request, res: Response): Promise<void> => {
    try {
    const { address } = req.params;
    
    if (!address) {
        res.status(400).json({ error: 'Address is required' });
        return;
    }
    
    const bankApi = this.injectiveService.getBankApi();
    const accountApi = this.injectiveService.getAccountApi();
    const authApi = this.injectiveService.getAuthApi();
    
    // Get account details
    const accountDetails = await authApi.fetchAccount(address);
    
    // Get balances
    const balances = await bankApi.fetchBalances(address);
    
    // Get portfolio
    const portfolio = await accountApi.fetchAccountPortfolio(address);
    
    res.status(200).json({
        account: accountDetails,
        balances: balances,
        portfolio: portfolio
    });
    } catch (error) {
    console.error('Error getting account info:', error);
    res.status(500).json({ error: 'Failed to get account information', details: error.message });
    }
};

/**
* Get all available spot markets
*/
public getSpotMarkets = async (req: Request, res: Response): Promise<void> => {
    try {
    const exchangeApi = this.injectiveService.getExchangeApi();
    const spotApi = this.injectiveService.getSpotApi();
    
    // Get all markets
    const markets = await exchangeApi.fetchSpotMarkets();
    
    // Get market summary data
    const marketSummaries = await spotApi.fetchSpotMarketsSummary();
    
    // Combine market data with summaries
    const marketsWithSummary = markets.markets.map(market => {
        const summary = marketSummaries.spotMarketsSummary.find(
        summary => summary.marketId === market.marketId
        );
        
        return {
        ...market,
        summary: summary || null
        };
    });
    
    res.status(200).json({
        markets: marketsWithSummary
    });
    } catch (error) {
    console.error('Error getting spot markets:', error);
    res.status(500).json({ error: 'Failed to get spot markets', details: error.message });
    }
};

/**
* Get specific spot market by marketId
*/
public getSpotMarket = async (req: Request, res: Response): Promise<void> => {
    try {
    const { marketId } = req.params;
    
    if (!marketId) {
        res.status(400).json({ error: 'Market ID is required' });
        return;
    }
    
    const exchangeApi = this.injectiveService.getExchangeApi();
    const spotApi = this.injectiveService.getSpotApi();
    
    // Get market
    const market = await exchangeApi.fetchSpotMarket(marketId);
    
    // Get orderbook
    const orderbook = await spotApi.fetchSpotOrderbook(marketId);
    
    // Get recent trades
    const trades = await spotApi.fetchSpotTrades({
        marketId: marketId
    });
    
    res.status(200).json({
        market: market,
        orderbook: orderbook,
        trades: trades
    });
    } catch (error) {
    console.error('Error getting spot market:', error);
    res.status(500).json({ error: 'Failed to get spot market', details: error.message });
    }
};

/**
* Get derivative markets
*/
public getDerivativeMarkets = async (req: Request, res: Response): Promise<void> => {
    try {
    const exchangeApi = this.injectiveService.getExchangeApi();
    const derivativesApi = this.injectiveService.getDerivativesApi();
    
    // Get all markets
    const markets = await exchangeApi.fetchDerivativeMarkets();
    
    // Get market summary data
    const marketSummaries = await derivativesApi.fetchDerivativeMarketsSummary();
    
    // Combine market data with summaries
    const marketsWithSummary = markets.markets.map(market => {
        const summary = marketSummaries.derivativeMarketsSummary.find(
        summary => summary.marketId === market.marketId
        );
        
        return {
        ...market,
        summary: summary || null
        };
    });
    
    res.status(200).json({
        markets: marketsWithSummary
    });
    } catch (error) {
    console.error('Error getting derivative markets:', error);
    res.status(500).json({ error: 'Failed to get derivative markets', details: error.message });
    }
};

/**
* Get specific derivative market by marketId
*/
public getDerivativeMarket = async (req: Request, res: Response): Promise<void> => {
    try {
    const { marketId } = req.params;
    
    if (!marketId) {
        res.status(400).json({ error: 'Market ID is required' });
        return;
    }
    
    const exchangeApi = this.injectiveService.getExchangeApi();
    const derivativesApi = this.injectiveService.getDerivativesApi();
    
    // Get market
    const market = await exchangeApi.fetchDerivativeMarket(marketId);
    
    // Get orderbook
    const orderbook = await derivativesApi.fetchDerivativeOrderbook(marketId);
    
    // Get recent trades
    const trades = await derivativesApi.fetchDerivativeTrades({
        marketId: marketId
    });
    
    res.status(200).json({
        market: market,
        orderbook: orderbook,
        trades: trades
    });
    } catch (error) {
    console.error('Error getting derivative market:', error);
    res.status(500).json({ error: 'Failed to get derivative market', details: error.message });
    }
};

/**
* Submit a spot order
* Note: This requires a signed transaction which should be handled on the client side with wallet integration
* This endpoint is just a placeholder that would process the signed transaction
*/
public submitSpotOrder = async (req: Request, res: Response): Promise<void> => {
    res.status(501).json({ 
    error: 'Not implemented', 
    message: 'Order submission requires signing with a private key which should be handled on the client side.' 
    });
};

/**
* Submit a derivative order
* Note: This requires a signed transaction which should be handled on the client side with wallet integration
* This endpoint is just a placeholder that would process the signed transaction
*/
public submitDerivativeOrder = async (req: Request, res: Response): Promise<void> => {
    res.status(501).json({ 
    error: 'Not implemented', 
    message: 'Order submission requires signing with a private key which should be handled on the client side.' 
    });
};

/**
* Get order history for an account
*/
public getOrderHistory = async (req: Request, res: Response): Promise<void> => {
    try {
    const { address } = req.params;
    const { marketId, subaccountId, orderType } = req.query;
    
    if (!address) {
        res.status(400).json({ error: 'Address is required' });
        return;
    }
    
    const spotApi = this.injectiveService.getSpotApi();
    const derivativesApi = this.injectiveService.getDerivativesApi();
    
    // Get spot orders
    const spotOrders = await spotApi.fetchOrders({
        marketId: marketId as string,
        subaccountId: subaccountId as string,
        orderSide: undefined,
    });
    
    // Get derivative orders
    const derivativeOrders = await derivativesApi.fetchOrders({
        marketId: marketId as string,
        subaccountId: subaccountId as string,
        orderSide: undefined,
    });
    
    res.status(200).json({
        spotOrders: spotOrders,
        derivativeOrders: derivativeOrders
    });
    } catch (error) {
    console.error('Error getting order history:', error);
    res.status(500).json({ error: 'Failed to get order history', details: error.message });
    }
};

/**
* Get trade history for an account
*/
public getTradeHistory = async (req: Request, res: Response): Promise<void> => {
    try {
    const { address } = req.params;
    const { marketId, subaccountId } = req.query;
    
    if (!address) {
        res.status(400).json({ error: 'Address is required' });
        return;
    }
    
    const spotApi = this.injectiveService.getSpotApi();
    const derivatives

