import { IStrategy, StrategyMetadata, StrategyType } from '../types/Strategy';

export class StrategyRegistry {
  private strategies: Map<string, StrategyMetadata> = new Map();
  private strategyImplementations: Map<string, IStrategy> = new Map();

  constructor() {
    // Initialize with empty registry
  }

  /**
   * Register a new strategy in the registry
   */
  public registerStrategy(strategy: IStrategy): void {
    const metadata: StrategyMetadata = {
      id: strategy.id,
      name: strategy.name,
      description: strategy.description,
      type: this.determineStrategyType(strategy),
      version: strategy.version,
      createdAt: strategy.createdAt,
      updatedAt: strategy.updatedAt,
      parentIds: strategy.parentIds,
      performanceScore: strategy.performanceScore,
      active: true,
      capitalAllocation: 0 // Will be set by the StrategyManager
    };

    this.strategies.set(strategy.id, metadata);
    this.strategyImplementations.set(strategy.id, strategy);
  }

  /**
   * Determine the type of strategy based on its parameters and behavior
   */
  private determineStrategyType(strategy: IStrategy): StrategyType {
    // This is a simplified implementation
    // In a real system, this would analyze the strategy's parameters and behavior
    if (strategy.parentIds.length > 0) {
      return StrategyType.EVOLVED;
    }
    
    // Default to HYBRID if we can't determine
    return StrategyType.HYBRID;
  }

  /**
   * Get a strategy by ID
   */
  public getStrategy(id: string): IStrategy | undefined {
    return this.strategyImplementations.get(id);
  }

  /**
   * Get strategy metadata by ID
   */
  public getStrategyMetadata(id: string): StrategyMetadata | undefined {
    return this.strategies.get(id);
  }

  /**
   * Get all registered strategies
   */
  public getAllStrategies(): IStrategy[] {
    return Array.from(this.strategyImplementations.values());
  }

  /**
   * Get all strategy metadata
   */
  public getAllStrategyMetadata(): StrategyMetadata[] {
    return Array.from(this.strategies.values());
  }

  /**
   * Get active strategies
   */
  public getActiveStrategies(): IStrategy[] {
    return Array.from(this.strategyImplementations.values())
      .filter(strategy => this.strategies.get(strategy.id)?.active);
  }

  /**
   * Update strategy metadata
   */
  public updateStrategyMetadata(id: string, updates: Partial<StrategyMetadata>): void {
    const existing = this.strategies.get(id);
    if (!existing) {
      throw new Error(`Strategy with ID ${id} not found`);
    }

    this.strategies.set(id, {
      ...existing,
      ...updates,
      updatedAt: new Date()
    });
  }

  /**
   * Deactivate a strategy
   */
  public deactivateStrategy(id: string): void {
    this.updateStrategyMetadata(id, { active: false, capitalAllocation: 0 });
  }

  /**
   * Get top performing strategies
   */
  public getTopPerformingStrategies(limit: number = 10): IStrategy[] {
    return Array.from(this.strategyImplementations.values())
      .filter(strategy => this.strategies.get(strategy.id)?.active)
      .sort((a, b) => b.performanceScore - a.performanceScore)
      .slice(0, limit);
  }
}