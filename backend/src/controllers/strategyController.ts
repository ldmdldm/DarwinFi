import { Request, Response } from 'express';
import { Strategy, StrategyParams, StrategyType } from '../../src/types/Strategy';
import { StrategyManager } from '../../src/core/StrategyManager';
import { MarketDataService } from '../../src/services/MarketDataService';
import { InjectiveService } from '../../src/services/InjectiveService';

class StrategyController {
private strategyManager: StrategyManager;
private marketDataService: MarketDataService;
private injectiveService: InjectiveService;

constructor() {
    this.marketDataService = new MarketDataService();
    this.injectiveService = new InjectiveService();
    this.strategyManager = new StrategyManager(this.marketDataService, this.injectiveService);
}

/**
* Get all strategies
*/
public getAllStrategies = async (req: Request, res: Response): Promise<void> => {
    try {
    const strategies = this.strategyManager.getAllStrategies();
    res.status(200).json({ 
        success: true, 
        data: strategies 
    });
    } catch (error) {
    console.error('Error fetching strategies:', error);
    res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch strategies', 
        error: error instanceof Error ? error.message : 'Unknown error' 
    });
    }
};

/**
* Get strategy by ID
*/
public getStrategyById = async (req: Request, res: Response): Promise<void> => {
    try {
    const { id } = req.params;
    const strategy = this.strategyManager.getStrategyById(id);
    
    if (!strategy) {
        res.status(404).json({ 
        success: false, 
        message: `Strategy with ID ${id} not found` 
        });
        return;
    }
    
    res.status(200).json({ 
        success: true, 
        data: strategy 
    });
    } catch (error) {
    console.error(`Error fetching strategy ${req.params.id}:`, error);
    res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch strategy', 
        error: error instanceof Error ? error.message : 'Unknown error'
    });
    }
};

/**
* Create new strategy
*/
public createStrategy = async (req: Request, res: Response): Promise<void> => {
    try {
    const strategyData: Omit<Strategy, 'id'> = req.body;
    
    if (!strategyData.name || !strategyData.type) {
        res.status(400).json({ 
        success: false, 
        message: 'Name and type are required for creating a strategy' 
        });
        return;
    }

    const newStrategy = this.strategyManager.createStrategy(
        strategyData.name,
        strategyData.type as StrategyType,
        strategyData.params as StrategyParams
    );
    
    res.status(201).json({ 
        success: true, 
        data: newStrategy,
        message: 'Strategy created successfully' 
    });
    } catch (error) {
    console.error('Error creating strategy:', error);
    res.status(500).json({ 
        success: false, 
        message: 'Failed to create strategy', 
        error: error instanceof Error ? error.message : 'Unknown error'
    });
    }
};

/**
* Update existing strategy
*/
public updateStrategy = async (req: Request, res: Response): Promise<void> => {
    try {
    const { id } = req.params;
    const strategyData: Partial<Strategy> = req.body;
    
    const existingStrategy = this.strategyManager.getStrategyById(id);
    if (!existingStrategy) {
        res.status(404).json({ 
        success: false, 
        message: `Strategy with ID ${id} not found` 
        });
        return;
    }
    
    const updatedStrategy = this.strategyManager.updateStrategy(id, strategyData);
    
    res.status(200).json({ 
        success: true, 
        data: updatedStrategy,
        message: 'Strategy updated successfully' 
    });
    } catch (error) {
    console.error(`Error updating strategy ${req.params.id}:`, error);
    res.status(500).json({ 
        success: false, 
        message: 'Failed to update strategy', 
        error: error instanceof Error ? error.message : 'Unknown error'
    });
    }
};

/**
* Delete strategy
*/
public deleteStrategy = async (req: Request, res: Response): Promise<void> => {
    try {
    const { id } = req.params;
    
    const existingStrategy = this.strategyManager.getStrategyById(id);
    if (!existingStrategy) {
        res.status(404).json({ 
        success: false, 
        message: `Strategy with ID ${id} not found` 
        });
        return;
    }
    
    this.strategyManager.deleteStrategy(id);
    
    res.status(200).json({ 
        success: true, 
        message: 'Strategy deleted successfully' 
    });
    } catch (error) {
    console.error(`Error deleting strategy ${req.params.id}:`, error);
    res.status(500).json({ 
        success: false, 
        message: 'Failed to delete strategy', 
        error: error instanceof Error ? error.message : 'Unknown error'
    });
    }
};

/**
* Execute strategy
*/
public executeStrategy = async (req: Request, res: Response): Promise<void> => {
    try {
    const { id } = req.params;
    
    const strategy = this.strategyManager.getStrategyById(id);
    if (!strategy) {
        res.status(404).json({ 
        success: false, 
        message: `Strategy with ID ${id} not found` 
        });
        return;
    }
    
    const executionResult = await this.strategyManager.executeStrategy(id);
    
    res.status(200).json({ 
        success: true, 
        data: executionResult,
        message: 'Strategy executed successfully' 
    });
    } catch (error) {
    console.error(`Error executing strategy ${req.params.id}:`, error);
    res.status(500).json({ 
        success: false, 
        message: 'Failed to execute strategy', 
        error: error instanceof Error ? error.message : 'Unknown error'
    });
    }
};

/**
* Backtest strategy
*/
public backtestStrategy = async (req: Request, res: Response): Promise<void> => {
    try {
    const { id } = req.params;
    const { startDate, endDate, initialCapital } = req.body;
    
    if (!startDate || !endDate || !initialCapital) {
        res.status(400).json({ 
        success: false, 
        message: 'Start date, end date, and initial capital are required for backtesting' 
        });
        return;
    }
    
    const strategy = this.strategyManager.getStrategyById(id);
    if (!strategy) {
        res.status(404).json({ 
        success: false, 
        message: `Strategy with ID ${id} not found` 
        });
        return;
    }
    
    const backtestResult = await this.strategyManager.backtestStrategy(
        id, 
        new Date(startDate), 
        new Date(endDate),
        initialCapital
    );
    
    res.status(200).json({ 
        success: true, 
        data: backtestResult,
        message: 'Strategy backtested successfully' 
    });
    } catch (error) {
    console.error(`Error backtesting strategy ${req.params.id}:`, error);
    res.status(500).json({ 
        success: false, 
        message: 'Failed to backtest strategy', 
        error: error instanceof Error ? error.message : 'Unknown error'
    });
    }
};

/**
* Get strategy performance
*/
public getStrategyPerformance = async (req: Request, res: Response): Promise<void> => {
    try {
    const { id } = req.params;
    const { timeframe } = req.query;
    
    const strategy = this.strategyManager.getStrategyById(id);
    if (!strategy) {
        res.status(404).json({ 
        success: false, 
        message: `Strategy with ID ${id} not found` 
        });
        return;
    }
    
    const performance = await this.strategyManager.getStrategyPerformance(
        id, 
        timeframe as string
    );
    
    res.status(200).json({ 
        success: true, 
        data: performance 
    });
    } catch (error) {
    console.error(`Error fetching performance for strategy ${req.params.id}:`, error);
    res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch strategy performance', 
        error: error instanceof Error ? error.message : 'Unknown error'
    });
    }
};

/**
* Get available strategy types
*/
public getStrategyTypes = async (_req: Request, res: Response): Promise<void> => {
    try {
    const strategyTypes = this.strategyManager.getAvailableStrategyTypes();
    
    res.status(200).json({ 
        success: true, 
        data: strategyTypes 
    });
    } catch (error) {
    console.error('Error fetching strategy types:', error);
    res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch strategy types', 
        error: error instanceof Error ? error.message : 'Unknown error'
    });
    }
};

/**
* Get strategy parameter schema for a specific strategy type
*/
public getStrategyParameterSchema = async (req: Request, res: Response): Promise<void> => {
    try {
    const { type } = req.params;
    
    const parameterSchema = this.strategyManager.getStrategyParameterSchema(type as StrategyType);
    
    if (!parameterSchema) {
        res.status(404).json({ 
        success: false, 
        message: `Parameter schema for strategy type ${type} not found` 
        });
        return;
    }
    
    res.status(200).json({ 
        success: true, 
        data: parameterSchema 
    });
    } catch (error) {
    console.error(`Error fetching parameter schema for strategy type ${req.params.type}:`, error);
    res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch parameter schema', 
        error: error instanceof Error ? error.message : 'Unknown error'
    });
    }
};
}

export default new StrategyController();

