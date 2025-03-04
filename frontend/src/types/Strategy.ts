export interface IStrategy {
  id: string;
  name: string;
  description: string;
  version: number;
  createdAt: Date;
  updatedAt: Date;
  parentIds: string[]; // IDs of parent strategies if created through crossover
  
  // Performance metrics
  performanceScore: number;
  riskScore: number;
  capitalEfficiencyScore: number;
  adaptabilityScore: number;
  
  // Strategy configuration
  parameters: Record<string, any>;
  
  // Strategy execution methods
  initialize: () => Promise<void>;
  evaluate: (marketData: any) => Promise<boolean>; // Should we enter a position?
  getEntryParameters: () => any; // Order parameters for entry
  getExitParameters: () => any; // Order parameters for exit
  
  // Lifecycle methods
  onPositionOpened: (position: any) => Promise<void>;
  onPositionClosed: (position: any) => Promise<void>;
  
  // Simulation methods
  runBacktest: (historicalData: any) => Promise<StrategyBacktestResult>;
}

export interface StrategyBacktestResult {
  totalReturn: number;
  sharpeRatio: number;
  maxDrawdown: number;
  winRate: number;
  profitFactor: number;
  trades: number;
  averageTradeReturn: number;
}

export enum StrategyType {
  MOMENTUM = 'MOMENTUM',
  MEAN_REVERSION = 'MEAN_REVERSION',
  BREAKOUT = 'BREAKOUT',
  VOLATILITY = 'VOLATILITY',
  ARBITRAGE = 'ARBITRAGE',
  HYBRID = 'HYBRID',
  EVOLVED = 'EVOLVED'
}

export interface StrategyMetadata {
  id: string;
  name: string;
  description: string;
  type: StrategyType;
  version: number;
  createdAt: Date;
  updatedAt: Date;
  parentIds: string[];
  performanceScore: number;
  active: boolean;
  capitalAllocation: number; // Percentage of capital allocated to this strategy
}