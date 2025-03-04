import { v4 as uuidv4 } from 'uuid';
import { IStrategy, StrategyType } from '../types/Strategy';
import { StrategyRegistry } from './StrategyRegistry';

export class StrategyFactory {
  private registry: StrategyRegistry;

  constructor(registry: StrategyRegistry) {
    this.registry = registry;
  }

  /**
   * Create a new base strategy
   */
  public createBaseStrategy(
    name: string,
    description: string,
    parameters: Record<string, any>,
    implementation: Partial<IStrategy>
  ): IStrategy {
    const strategy: IStrategy = {
      id: uuidv4(),
      name,
      description,
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      parentIds: [],
      
      // Default scores - will be updated after evaluation
      performanceScore: 0,
      riskScore: 0,
      capitalEfficiencyScore: 0,
      adaptabilityScore: 0,
      
      // Strategy configuration
      parameters,
      
      // Default implementations
      initialize: async () => {},
      evaluate: async () => false,
      getEntryParameters: () => ({}),
      getExitParameters: () => ({}),
      onPositionOpened: async () => {},
      onPositionClosed: async () => {},
      runBacktest: async () => ({
        totalReturn: 0,
        sharpeRatio: 0,
        maxDrawdown: 0,
        winRate: 0,
        profitFactor: 0,
        trades: 0,
        averageTradeReturn: 0
      }),
      
      // Override with provided implementation
      ...implementation
    };
    
    this.registry.registerStrategy(strategy);
    return strategy;
  }

  /**
   * Create a new strategy through crossover (combining two parent strategies)
   */
  public createCrossoverStrategy(
    parentA: IStrategy,
    parentB: IStrategy,
    crossoverRatio: number = 0.5
  ): IStrategy {
    // Create a new parameter set by combining parameters from both parents
    const combinedParameters: Record<string, any> = {};
    
    // Combine parameters based on crossover ratio
    for (const key in parentA.parameters) {
      if (Math.random() < crossoverRatio) {
        combinedParameters[key] = parentA.parameters[key];
      } else if (parentB.parameters[key] !== undefined) {
        combinedParameters[key] = parentB.parameters[key];
      } else {
        combinedParameters[key] = parentA.parameters[key];
      }
    }
    
    // Add any parameters from parentB that aren't in parentA
    for (const key in parentB.parameters) {
      if (combinedParameters[key] === undefined) {
        combinedParameters[key] = parentB.parameters[key];
      }
    }
    
    // Create the new strategy
    const crossoverStrategy = this.createBaseStrategy(
      `Crossover of ${parentA.name} and ${parentB.name}`,
      `Strategy created by combining ${parentA.name} and ${parentB.name}`,
      combinedParameters,
      {
        parentIds: [parentA.id, parentB.id],
        // Inherit implementation methods from the higher performing parent
        ...(parentA.performanceScore > parentB.performanceScore ? parentA : parentB)
      }
    );
    
    return crossoverStrategy;
  }

  /**
   * Create a new strategy through mutation (modifying an existing strategy)
   */
  public createMutatedStrategy(
    parent: IStrategy,
    mutationRate: number = 0.1,
    mutationMagnitude: number = 0.2
  ): IStrategy {
    // Create a new parameter set by mutating the parent's parameters
    const mutatedParameters: Record<string, any> = { ...parent.parameters };
    
    // Apply mutations to numeric parameters
    for (const key in mutatedParameters) {
      if (typeof mutatedParameters[key] === 'number' && Math.random() < mutationRate) {
        // Apply a random mutation within the mutation magnitude
        const change = (Math.random() * 2 - 1) * mutationMagnitude;
        mutatedParameters[key] *= (1 + change);
      } else if (typeof mutatedParameters[key] === 'boolean' && Math.random() < mutationRate) {
        // Flip boolean parameters
        mutatedParameters[key] = !mutatedParameters[key];
      }
    }
    
    // Create the new strategy
    const mutatedStrategy = this.createBaseStrategy(
      `Mutation of ${parent.name}`,
      `Strategy created by mutating ${parent.name}`,
      mutatedParameters,
      {
        parentIds: [parent.id],
        // Inherit implementation methods from the parent
        ...parent
      }
    );
    
    return mutatedStrategy;
  }

  /**
   * Create a specialized strategy optimized for specific market conditions
   */
  public createSpecializedStrategy(
    parent: IStrategy,
    marketCondition: string,
    specializationParameters: Record<string, any>
  ): IStrategy {
    // Combine parent parameters with specialization parameters
    const specializedParameters = {
      ...parent.parameters,
      ...specializationParameters,
      marketCondition
    };
    
    // Create the new strategy
    const specializedStrategy = this.createBaseStrategy(
      `${parent.name} (${marketCondition} Specialist)`,
      `Strategy specialized for ${marketCondition} market conditions, derived from ${parent.name}`,
      specializedParameters,
      {
        parentIds: [parent.id],
        // Inherit implementation methods from the parent
        ...parent
      }
    );
    
    return specializedStrategy;
  }
}