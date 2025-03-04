import { Eliza } from '@elizaos/core';
import { InjectiveClient } from './InjectiveService';
import { Strategy, StrategyType } from '../models/Strategy';

// Strategy parameters interface
interface StrategyParameters {
type: StrategyType;
timeframe: string;
entryConditions: string[];
exitConditions: string[];
riskManagement: {
    stopLoss: number;
    takeProfit: number;
    positionSize: number;
};
assets: string[];
description: string;
}

// Eliza response interface
interface ElizaResponse {
success: boolean;
data?: any;
error?: string;
explanation?: string;
}

/**
* ElizaService provides natural language processing capabilities
* for interpreting, creating, and optimizing trading strategies on Injective.
*/
export class ElizaService {
private eliza: Eliza;
private injectiveClient?: InjectiveClient;

/**
* Initialize the Eliza service with optional Injective client
* @param injectiveClient Optional Injective client for executing strategies
*/
constructor(injectiveClient?: InjectiveClient) {
    this.eliza = new Eliza({
    system: `You are a specialized AI for analyzing and creating trading strategies on the Injective Protocol.
            Parse natural language descriptions into structured strategy parameters.
            Provide explanations of strategy mechanics and suggest optimizations based on market conditions.`,
    plugins: ['bootstrap'],
    });
    
    this.injectiveClient = injectiveClient;
}

/**
* Process a natural language description of a trading strategy
* @param description Natural language description of the strategy
* @returns Structured strategy parameters
*/
public async processStrategyDescription(description: string): Promise<ElizaResponse> {
    try {
    const response = await this.eliza.chat({
        messages: [
        {
            role: 'user',
            content: `Parse the following trading strategy description into a structured format with strategy type, timeframe, entry conditions, exit conditions, risk management parameters, and assets: ${description}`
        }
        ]
    });
    
    // Extract the structured strategy from Eliza's response
    const structuredStrategy = this.parseElizaResponse(response.content);
    
    return {
        success: true,
        data: structuredStrategy,
        explanation: `Successfully parsed strategy: ${structuredStrategy.type} on ${structuredStrategy.assets.join(', ')}`
    };
    } catch (error) {
    console.error('Error processing strategy description:', error);
    return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
    }
}

/**
* Create a strategy from a natural language description
* @param description Natural language description of the strategy
* @returns Created strategy object
*/
public async createStrategy(description: string): Promise<ElizaResponse> {
    try {
    const processResult = await this.processStrategyDescription(description);
    
    if (!processResult.success || !processResult.data) {
        return processResult;
    }
    
    const parameters = processResult.data as StrategyParameters;
    
    // Create a new Strategy object
    const strategy = new Strategy();
    strategy.type = parameters.type;
    strategy.name = `${parameters.type} Strategy on ${parameters.assets.join(', ')}`;
    strategy.description = parameters.description || description;
    strategy.parameters = JSON.stringify(parameters);
    strategy.assets = parameters.assets;
    
    return {
        success: true,
        data: strategy,
        explanation: `Created ${parameters.type} strategy for ${parameters.assets.join(', ')}`
    };
    } catch (error) {
    console.error('Error creating strategy:', error);
    return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
    }
}

/**
* Analyze and optimize an existing strategy
* @param strategy The strategy to analyze
* @returns Optimization suggestions
*/
public async optimizeStrategy(strategy: Strategy): Promise<ElizaResponse> {
    try {
    // Get market data from Injective if client is available
    let marketContext = '';
    if (this.injectiveClient) {
        const marketData = await this.injectiveClient.getMarketData(strategy.assets);
        marketContext = `Current market conditions: ${JSON.stringify(marketData)}`;
    }
    
    const response = await this.eliza.chat({
        messages: [
        {
            role: 'user',
            content: `Analyze this trading strategy and suggest optimizations:
            Strategy Type: ${strategy.type}
            Description: ${strategy.description}
            Parameters: ${strategy.parameters}
            Assets: ${strategy.assets.join(', ')}
            ${marketContext}`
        }
        ]
    });
    
    return {
        success: true,
        data: response.content,
        explanation: 'Optimization analysis completed'
    };
    } catch (error) {
    console.error('Error optimizing strategy:', error);
    return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
    }
}

/**
* Explain a strategy in natural language
* @param strategy The strategy to explain
* @returns Natural language explanation of the strategy
*/
public async explainStrategy(strategy: Strategy): Promise<ElizaResponse> {
    try {
    const response = await this.eliza.chat({
        messages: [
        {
            role: 'user',
            content: `Explain this trading strategy in simple terms:
            Strategy Type: ${strategy.type}
            Description: ${strategy.description}
            Parameters: ${strategy.parameters}
            Assets: ${strategy.assets.join(', ')}`
        }
        ]
    });
    
    return {
        success: true,
        data: response.content,
        explanation: 'Strategy explanation generated'
    };
    } catch (error) {
    console.error('Error explaining strategy:', error);
    return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
    }
}

/**
* Backtest a strategy using natural language configuration
* @param strategy The strategy to backtest
* @param backtestParams Natural language backtest parameters
* @returns Backtest results
*/
public async backtestStrategyWithNL(
    strategy: Strategy, 
    backtestParams: string
): Promise<ElizaResponse> {
    try {
    // Parse backtest parameters from natural language
    const paramResponse = await this.eliza.chat({
        messages: [
        {
            role: 'user',
            content: `Parse these backtest parameters into a structured format with timeframe, start date, end date, and initial capital: ${backtestParams}`
        }
        ]
    });
    
    const structuredParams = JSON.parse(paramResponse.content);
    
    if (!this.injectiveClient) {
        return {
        success: false,
        error: 'Injective client not available for backtesting'
        };
    }
    
    // Run backtest using Injective client
    const backtestResults = await this.injectiveClient.backtestStrategy(
        strategy,
        structuredParams.startDate,
        structuredParams.endDate,
        structuredParams.initialCapital
    );
    
    // Ask Eliza to analyze the backtest results
    const analysisResponse = await this.eliza.chat({
        messages: [
        {
            role: 'user',
            content: `Analyze these backtest results and provide insights:
            Strategy: ${strategy.type} on ${strategy.assets.join(', ')}
            Results: ${JSON.stringify(backtestResults)}`
        }
        ]
    });
    
    return {
        success: true,
        data: {
        results: backtestResults,
        analysis: analysisResponse.content
        },
        explanation: 'Backtest completed and analyzed'
    };
    } catch (error) {
    console.error('Error backtesting strategy:', error);
    return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
    }
}

/**
* Parse Eliza's response into structured strategy parameters
* @param response Eliza's text response
* @returns Structured strategy parameters
*/
private parseElizaResponse(response: string): StrategyParameters {
    try {
    // Try to parse as JSON first
    return JSON.parse(response);
    } catch (e) {
    // If not valid JSON, use regex or other parsing methods
    // This is a simplified example - actual implementation would be more robust
    
    const typeMatch = response.match(/type:\s*([a-zA-Z]+)/i);
    const timeframeMatch = response.match(/timeframe:\s*([a-zA-Z0-9]+)/i);
    const assetsMatch = response.match(/assets:\s*\[(.*?)\]/i);
    
    return {
        type: (typeMatch?.[1] as StrategyType) || StrategyType.MOMENTUM,
        timeframe: timeframeMatch?.[1] || '1h',
        entryConditions: ['price above MA(200)'],
        exitConditions: ['price below MA(50)'],
        riskManagement: {
        stopLoss: 5,
        takeProfit: 15,
        positionSize: 10
        },
        assets: assetsMatch?.[1].split(',').map(a => a.trim()) || ['INJ-USDT'],
        description: response
    };
    }
}
}

