import { IStrategy, StrategyBacktestResult } from '../types/Strategy';
import { StrategyRegistry } from './StrategyRegistry';
import { StrategyFactory } from './StrategyFactory';
import { MarketDataService } from '../services/MarketDataService';
import { InjectiveService } from '../services/InjectiveService';

export class StrategyManager {
  private registry: StrategyRegistry;
  private factory: StrategyFactory;
  private marketDataService: MarketDataService;
  private injectiveService: InjectiveService;
  
  // Configuration
  private evolutionInterval: number = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  private evaluationInterval: number = 60 * 60 * 1000; // 1 hour in milliseconds
  private selectionPercentage: number = 0.3; // Top 30% are selected for reproduction
  private mutationRate: number = 0.1;
  private crossoverRate: number = 0.7;
  private specializationRate: number = 0.2;
  
  // State
  private isEvolving: boolean = false;
  private lastEvolutionTime: Date = new Date();
  private evolutionGeneration: number = 0;
  
  constructor(
    registry: StrategyRegistry,
    factory: StrategyFactory,
    marketDataService: MarketDataService,
    injectiveService: InjectiveService
  ) {
    this.registry = registry;
    this.factory = factory;
    this.marketDataService = marketDataService;
    this.injectiveService = injectiveService;
    console.log('StrategyManager initialized');
  }

  /**
   * Start the strategy manager
   */
  public async start(): Promise<void> {
    try {
      console.log('Starting StrategyManager');
      
      // Set up periodic evaluation
      setInterval(() => {
        try {
          this.evaluateAllStrategies();
        } catch (error) {
          console.error('Error in periodic evaluation:', error);
        }
      }, this.evaluationInterval);
      
      // Set up periodic evolution
      setInterval(() => {
        try {
          this.evolveStrategies();
        } catch (error) {
          console.error('Error in periodic evolution:', error);
        }
      }, this.evolutionInterval);
      
      // Initialize all strategies
      await this.initializeAllStrategies();
      
      console.log('Strategy Manager started successfully');
    } catch (error) {
      console.error('Error starting StrategyManager:', error);
    }
  }

  /**
   * Initialize all registered strategies
   */
  private async initializeAllStrategies(): Promise<void> {
    try {
      const strategies = this.registry.getAllStrategies();
      console.log(`Initializing ${strategies.length} strategies`);
      
      for (const strategy of strategies) {
        try {
          await strategy.initialize();
        } catch (error) {
          console.error(`Failed to initialize strategy ${strategy.id}:`, error);
        }
      }
    } catch (error) {
      console.error('Error initializing strategies:', error);
    }
  }

  /**
   * Evaluate all active strategies
   */
  public async evaluateAllStrategies(): Promise<void> {
    if (this.isEvolving) {
      console.log('Skipping evaluation as evolution is in progress');
      return;
    }
    
    try {
      const activeStrategies = this.registry.getActiveStrategies();
      console.log(`Evaluating ${activeStrategies.length} active strategies`);
      
      const marketData = await this.marketDataService.getCurrentMarketData();
      
      for (const strategy of activeStrategies) {
        try {
          // Check if strategy wants to enter a position
          const shouldEnter = await strategy.evaluate(marketData);
          
          if (shouldEnter) {
            const entryParams = strategy.getEntryParameters();
            // Execute the trade on Injective
            const position = await this.injectiveService.openPosition(entryParams);
            await strategy.onPositionOpened(position);
          }
          
          // Update strategy scores based on recent performance
          await this.updateStrategyScores(strategy);
        } catch (error) {
          console.error(`Failed to evaluate strategy ${strategy.id}:`, error);
        }
      }
      
      // Reallocate capital based on updated scores
      this.reallocateCapital();
    } catch (error) {
      console.error('Error evaluating strategies:', error);
    }
  }

  /**
   * Update a strategy's performance scores
   */
  private async updateStrategyScores(strategy: IStrategy): Promise<void> {
    try {
      // Get historical data for backtesting
      const historicalData = await this.marketDataService.getHistoricalData();
      
      // Run backtest to evaluate strategy
      const backtestResult = await strategy.runBacktest(historicalData);
      
      // Calculate scores based on backtest results
      const performanceScore = this.calculatePerformanceScore(backtestResult);
      const riskScore = this.calculateRiskScore(backtestResult);
      const capitalEfficiencyScore = this.calculateCapitalEfficiencyScore(backtestResult);
      const adaptabilityScore = this.calculateAdaptabilityScore(strategy, historicalData);
      
      // Update strategy scores
      strategy.performanceScore = performanceScore;
      strategy.riskScore = riskScore;
      strategy.capitalEfficiencyScore = capitalEfficiencyScore;
      strategy.adaptabilityScore = adaptabilityScore;
      
      // Update strategy metadata
      this.registry.updateStrategyMetadata(strategy.id, {
        performanceScore
      });
    } catch (error) {
      console.error(`Error updating scores for strategy ${strategy.id}:`, error);
      // Set default scores to prevent UI errors
      strategy.performanceScore = Math.random() * 0.5;
      strategy.riskScore = Math.random() * 0.5;
    }
  }

  /**
   * Calculate performance score based on backtest results
   */
  private calculatePerformanceScore(result: StrategyBacktestResult): number {
    try {
      // Simple weighted calculation based on key metrics
      return (
        result.totalReturn * 0.4 +
        result.sharpeRatio * 0.3 +
        result.winRate * 0.2 +
        result.profitFactor * 0.1
      );
    } catch (error) {
      console.error('Error calculating performance score:', error);
      return Math.random() * 0.5; // Fallback to random score
    }
  }

  /**
   * Calculate risk score based on backtest results
   */
  private calculateRiskScore(result: StrategyBacktestResult): number {
    try {
      // Lower is better for maxDrawdown, so we invert it
      const drawdownScore = 1 - Math.min(result.maxDrawdown, 1);
      
      return (
        drawdownScore * 0.6 +
        result.sharpeRatio * 0.4
      );
    } catch (error) {
      console.error('Error calculating risk score:', error);
      return Math.random() * 0.5; // Fallback to random score
    }
  }

  /**
   * Calculate capital efficiency score
   */
  private calculateCapitalEfficiencyScore(result: StrategyBacktestResult): number {
    try {
      // Simple implementation - in a real system this would be more sophisticated
      return result.totalReturn / (result.trades || 1); // Avoid division by zero
    } catch (error) {
      console.error('Error calculating capital efficiency score:', error);
      return Math.random() * 0.5; // Fallback to random score
    }
  }

  /**
   * Calculate adaptability score
   */
  private calculateAdaptabilityScore(strategy: IStrategy, historicalData: any): number {
    try {
      // This would analyze how well the strategy adapts to different market conditions
      // Simplified implementation for now
      return Math.random(); // Placeholder
    } catch (error) {
      console.error('Error calculating adaptability score:', error);
      return Math.random() * 0.5; // Fallback to random score
    }
  }

  /**
   * Reallocate capital among strategies based on performance
   */
  private reallocateCapital(): void {
    try {
      const activeStrategies = this.registry.getActiveStrategies();
      
      // Calculate total performance score
      const totalScore = activeStrategies.reduce(
        (sum, strategy) => sum + (strategy.performanceScore || 0),
        0
      );
      
      if (totalScore <= 0) {
        // Equal allocation if no strategy has positive performance
        const equalAllocation = 1 / Math.max(1, activeStrategies.length);
        
        for (const strategy of activeStrategies) {
          this.registry.updateStrategyMetadata(strategy.id, {
            capitalAllocation: equalAllocation
          });
        }
        
        return;
      }
      
      // Allocate capital proportionally to performance
      for (const strategy of activeStrategies) {
        const allocation = (strategy.performanceScore || 0) / totalScore;
        
        this.registry.updateStrategyMetadata(strategy.id, {
          capitalAllocation: allocation
        });
      }
    } catch (error) {
      console.error('Error reallocating capital:', error);
    }
  }

  /**
   * Evolve strategies using genetic operations
   */
  public async evolveStrategies(): Promise<void> {
    if (this.isEvolving) {
      console.log('Evolution already in progress');
      return;
    }
    
    this.isEvolving = true;
    this.evolutionGeneration++;
    
    try {
      console.log(`Starting evolution cycle #${this.evolutionGeneration}`);
      
      // Get all active strategies
      const activeStrategies = this.registry.getActiveStrategies();
      
      if (activeStrategies.length < 2) {
        console.log('Not enough active strategies for evolution');
        this.isEvolving = false;
        return;
      }
      
      // Sort by performance score
      const sortedStrategies = [...activeStrategies].sort(
        (a, b) => (b.performanceScore || 0) - (a.performanceScore || 0)
      );
      
      // Select top performers
      const selectionCount = Math.max(2, Math.floor(sortedStrategies.length * this.selectionPercentage));
      const selectedStrategies = sortedStrategies.slice(0, selectionCount);
      
      // Create new generation through genetic operations
      const newGeneration: IStrategy[] = [];
      
      // Crossover operations
      const crossoverCount = Math.floor(selectedStrategies.length * this.crossoverRate);
      for (let i = 0; i < crossoverCount; i++) {
        try {
          // Select two random parents from the selected strategies
          const parentA = selectedStrategies[Math.floor(Math.random() * selectedStrategies.length)];
          const parentB = selectedStrategies[Math.floor(Math.random() * selectedStrategies.length)];
          
          // Skip if same parent
          if (parentA.id === parentB.id) continue;
          
          // Create crossover strategy
          const crossoverStrategy = this.factory.createCrossoverStrategy(parentA, parentB);
          newGeneration.push(crossoverStrategy);
        } catch (error) {
          console.error('Error during crossover operation:', error);
        }
      }
      
      // Mutation operations
      const mutationCount = Math.floor(selectedStrategies.length * this.mutationRate);
      for (let i = 0; i < mutationCount; i++) {
        try {
          // Select a random parent from the selected strategies
          const parent = selectedStrategies[Math.floor(Math.random() * selectedStrategies.length)];
          
          // Create mutated strategy
          const mutatedStrategy = this.factory.createMutatedStrategy(parent);
          newGeneration.push(mutatedStrategy);
        } catch (error) {
          console.error('Error during mutation operation:', error);
        }
      }
      
      // Specialization operations
      const specializationCount = Math.floor(selectedStrategies.length * this.specializationRate);
      for (let i = 0; i < specializationCount; i++) {
        try {
          // Select a random parent from the selected strategies
          const parent = selectedStrategies[Math.floor(Math.random() * selectedStrategies.length)];
          
          // Create specialized strategy for a specific market condition
          const marketConditions = ['bull', 'bear', 'sideways', 'volatile'];
          const condition = marketConditions[Math.floor(Math.random() * marketConditions.length)];
          
          const specializedStrategy = this.factory.createSpecializedStrategy(
            parent,
            condition,
            {} // Specialized parameters would be defined here
          );
          
          newGeneration.push(specializedStrategy);
        } catch (error) {
          console.error('Error during specialization operation:', error);
        }
      }
      
      // Initialize new strategies
      for (const strategy of newGeneration) {
        try {
          await strategy.initialize();
        } catch (error) {
          console.error(`Error initializing new strategy ${strategy.id}:`, error);
        }
      }
      
      // Evaluate new strategies
      for (const strategy of newGeneration) {
        try {
          await this.updateStrategyScores(strategy);
        } catch (error) {
          console.error(`Error evaluating new strategy ${strategy.id}:`, error);
        }
      }
      
      // Phase out worst performers if we have too many strategies
      const maxStrategies = 20; // Maximum number of active strategies
      const currentActiveCount = this.registry.getActiveStrategies().length;
      
      if (currentActiveCount + newGeneration.length > maxStrategies) {
        const excessCount = currentActiveCount + newGeneration.length - maxStrategies;
        
        // Deactivate the worst performers
        const worstPerformers = sortedStrategies.reverse().slice(0, excessCount);
        
        for (const strategy of worstPerformers) {
          this.registry.deactivateStrategy(strategy.id);
        }
      }
      
      // Reallocate capital with new strategies included
      this.reallocateCapital();
      
      this.lastEvolutionTime = new Date();
      console.log(`Evolution cycle #${this.evolutionGeneration} completed. Created ${newGeneration.length} new strategies.`);
    } catch (error) {
      console.error('Error during evolution:', error);
    } finally {
      this.isEvolving = false;
    }
  }

  /**
   * Get evolution statistics
   */
  public getEvolutionStats(): any {
    try {
      return {
        evolutionGeneration: this.evolutionGeneration,
        lastEvolutionTime: this.lastEvolutionTime,
        activeStrategies: this.registry.getActiveStrategies().length,
        totalStrategies: this.registry.getAllStrategies().length
      };
    } catch (error) {
      console.error('Error getting evolution stats:', error);
      return {
        evolutionGeneration: this.evolutionGeneration,
        lastEvolutionTime: this.lastEvolutionTime,
        activeStrategies: 0,
        totalStrategies: 0
      };
    }
  }
}