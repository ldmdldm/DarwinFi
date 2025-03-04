import { ObjectId } from 'mongodb';

/**
* Enum representing the possible statuses of a strategy
*/
export enum StrategyStatus {
ACTIVE = 'active',
PAUSED = 'paused',
BACKTEST = 'backtest',
ARCHIVED = 'archived'
}

/**
* Interface representing performance metrics for a strategy
*/
export interface PerformanceMetrics {
totalReturn: number;
sharpeRatio?: number;
maxDrawdown?: number;
winRate?: number;
averageWin?: number;
averageLoss?: number;
profitFactor?: number;
tradeCount: number;
}

/**
* Interface representing a parameter for a strategy
*/
export interface StrategyParameter {
name: string;
value: number | string | boolean;
type: 'number' | 'string' | 'boolean';
min?: number;
max?: number;
description?: string;
}

/**
* Interface representing a trading strategy
*/
export interface Strategy {
_id?: ObjectId | string;
name: string;
description: string;
type: string;
status: StrategyStatus;
createdAt: Date;
updatedAt: Date;
parameters: StrategyParameter[];
marketSymbol: string;
timeframe: string;
performance?: PerformanceMetrics;
userId: string;
testnetDeployed?: boolean;
mainnetDeployed?: boolean;
deploymentAddress?: string;
evolutionScore?: number;
}

/**
* Class implementation of a Strategy
*/
export class StrategyModel implements Strategy {
_id?: ObjectId | string;
name: string;
description: string;
type: string;
status: StrategyStatus;
createdAt: Date;
updatedAt: Date;
parameters: StrategyParameter[];
marketSymbol: string;
timeframe: string;
performance?: PerformanceMetrics;
userId: string;
testnetDeployed?: boolean;
mainnetDeployed?: boolean;
deploymentAddress?: string;
evolutionScore?: number;

constructor(strategy: Strategy) {
    this._id = strategy._id;
    this.name = strategy.name;
    this.description = strategy.description;
    this.type = strategy.type;
    this.status = strategy.status;
    this.createdAt = strategy.createdAt;
    this.updatedAt = strategy.updatedAt;
    this.parameters = strategy.parameters;
    this.marketSymbol = strategy.marketSymbol;
    this.timeframe = strategy.timeframe;
    this.performance = strategy.performance;
    this.userId = strategy.userId;
    this.testnetDeployed = strategy.testnetDeployed;
    this.mainnetDeployed = strategy.mainnetDeployed;
    this.deploymentAddress = strategy.deploymentAddress;
    this.evolutionScore = strategy.evolutionScore;
}

/**
* Update strategy parameters
* @param parameters New parameters to update
*/
updateParameters(parameters: StrategyParameter[]): void {
    this.parameters = parameters;
    this.updatedAt = new Date();
}

/**
* Update strategy status
* @param status New status
*/
updateStatus(status: StrategyStatus): void {
    this.status = status;
    this.updatedAt = new Date();
}

/**
* Update performance metrics
* @param performance New performance metrics
*/
updatePerformance(performance: PerformanceMetrics): void {
    this.performance = performance;
    this.updatedAt = new Date();
}

/**
* Mark strategy as deployed to testnet
* @param deploymentAddress Address where strategy is deployed
*/
markAsTestnetDeployed(deploymentAddress: string): void {
    this.testnetDeployed = true;
    this.deploymentAddress = deploymentAddress;
    this.updatedAt = new Date();
}

/**
* Mark strategy as deployed to mainnet
* @param deploymentAddress Address where strategy is deployed
*/
markAsMainnetDeployed(deploymentAddress: string): void {
    this.mainnetDeployed = true;
    this.deploymentAddress = deploymentAddress;
    this.updatedAt = new Date();
}
}

/**
* Enum representing the possible statuses of a strategy
*/
export enum StrategyStatus {
ACTIVE = 'active',
PAUSED = 'paused',
BACKTEST = 'backtest',
ARCHIVED = 'archived'
}

/**
* Interface representing performance metrics for a strategy
*/
export interface PerformanceMetrics {
totalReturn: number;
sharpeRatio?: number;
maxDrawdown?: number;
winRate?: number;
averageWin?: number;
averageLoss?: number;
profitFactor?: number;
tradeCount: number;
}

/**
* Interface representing a parameter for a strategy
*/
export interface StrategyParameter {
name: string;
value: number | string | boolean;
type: 'number' | 'string' | 'boolean';
min?: number;
max?: number;
description?: string;
}

/**
* Interface representing a trading strategy
*/
export interface Strategy {
_id?: ObjectId | string;
name: string;
description: string;
type: string;
status: StrategyStatus;
createdAt: Date;
updatedAt: Date;
parameters: StrategyParameter[];
marketSymbol: string;
timeframe: string;
performance?: PerformanceMetrics;
userId: string;
testnetDeployed?: boolean;
mainnetDeployed?: boolean;
deploymentAddress?: string;
evolutionScore?: number;
}

/**
* Class implementation of a Strategy
*/
export class StrategyModel implements Strategy {
_id?: ObjectId | string;
name: string;
description: string;
type: string;
status: StrategyStatus;
createdAt: Date;
updatedAt: Date;
parameters: StrategyParameter[];
marketSymbol: string;
timeframe: string;
performance?: PerformanceMetrics;
userId: string;
testnetDeployed?: boolean;
mainnetDeployed?: boolean;
deploymentAddress?: string;
evolutionScore?: number;

constructor(strategy: Strategy) {
    this._id = strategy._id;
    this.name = strategy.name;
    this.description = strategy.description;
    this.type = strategy.type;
    this.status = strategy.status;
    this.createdAt = strategy.createdAt;
    this.updatedAt = strategy.updatedAt;
    this.parameters = strategy.parameters;
    this.marketSymbol = strategy.marketSymbol;
    this.timeframe = strategy.timeframe;
    this.performance = strategy.performance;
    this.userId = strategy.userId;
    this.testnetDeployed = strategy.testnetDeployed;
    this.mainnetDeployed = strategy.mainnetDeployed;
    this.deploymentAddress = strategy.deploymentAddress;
    this.evolutionScore = strategy.evolutionScore;
}

/**
* Update strategy parameters
* @param parameters New parameters to update
*/
updateParameters(parameters: StrategyParameter[]): void {
    this.parameters = parameters;
    this.updatedAt = new Date();
}

/**
* Update strategy status
* @param status New status
*/
updateStatus(status: StrategyStatus): void {
    this.status = status;
    this.updatedAt = new Date();
}

/**
* Update performance metrics
* @param performance New performance metrics
*/
updatePerformance(performance: PerformanceMetrics): void {
    this.performance = performance;
    this.updatedAt = new Date();
}

/**
* Mark strategy as deployed to testnet
* @param deploymentAddress Address where strategy is deployed
*/
markAsTestnetDeployed(deploymentAddress: string): void {
    this.testnetDeployed = true;
    this.deploymentAddress = deploymentAddress;
    this.updatedAt = new Date();
}

/**
* Mark strategy as deployed to mainnet
* @param deploymentAddress Address where strategy is deployed
*/
markAsMainnetDeployed(deploymentAddress: string): void {
    this.mainnetDeployed = true;
    this.deploymentAddress = deploymentAddress;
    this.updatedAt = new Date();
}
}

