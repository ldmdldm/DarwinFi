// Demo script for DarwinFi - Evolutionary Strategy Simulation
const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

// Simulation parameters
const POPULATION_SIZE = 20;
const GENERATIONS = 10;
const SELECTION_RATE = 0.3;
const MUTATION_RATE = 0.2;

// Market conditions for testing
const MARKET_CONDITIONS = [
{ name: "Bull Market", volatility: 0.1, trend: 0.02 },
{ name: "Bear Market", volatility: 0.15, trend: -0.01 },
{ name: "Sideways Market", volatility: 0.05, trend: 0.0 },
{ name: "Volatile Market", volatility: 0.25, trend: 0.0 },
{ name: "Flash Crash", volatility: 0.35, trend: -0.05 }
];

// Strategy component options
const STRATEGY_COMPONENTS = {
entryMethods: [
    { name: "Market Order", complexity: 1, gasUsage: "low" },
    { name: "Limit Order", complexity: 2, gasUsage: "medium" },
    { name: "Stop Limit", complexity: 3, gasUsage: "high" },
    { name: "Dollar Cost Average", complexity: 2, gasUsage: "medium" }
],
exitMethods: [
    { name: "Market Exit", complexity: 1, gasUsage: "low" },
    { name: "Take Profit", complexity: 2, gasUsage: "medium" },
    { name: "Stop Loss", complexity: 2, gasUsage: "medium" },
    { name: "Trailing Stop", complexity: 3, gasUsage: "high" }
],
riskManagement: [
    { name: "Fixed Position Size", complexity: 1, effectiveness: 1 },
    { name: "Percentage Risk", complexity: 2, effectiveness: 2 },
    { name: "Kelly Criterion", complexity: 3, effectiveness: 3 },
    { name: "Dynamic Position Sizing", complexity: 3, effectiveness: 3 }
],
timeframes: [
    { name: "Short-term", duration: "minutes", effectiveness: 1 },
    { name: "Medium-term", duration: "hours", effectiveness: 2 },
    { name: "Long-term", duration: "days", effectiveness: 3 }
]
};

// Create random strategy
function createRandomStrategy() {
return {
    id: Math.floor(Math.random() * 10000),
    name: `Strategy-${Math.floor(Math.random() * 10000)}`,
    entryMethod: STRATEGY_COMPONENTS.entryMethods[Math.floor(Math.random() * STRATEGY_COMPONENTS.entryMethods.length)],
    exitMethod: STRATEGY_COMPONENTS.exitMethods[Math.floor(Math.random() * STRATEGY_COMPONENTS.exitMethods.length)],
    riskManagement: STRATEGY_COMPONENTS.riskManagement[Math.floor(Math.random() * STRATEGY_COMPONENTS.riskManagement.length)],
    timeframe: STRATEGY_COMPONENTS.timeframes[Math.floor(Math.random() * STRATEGY_COMPONENTS.timeframes.length)],
    // Random strategy parameters
    entryThreshold: Math.random() * 0.1,
    exitThreshold: Math.random() * 0.1 + 0.05,
    stopLossPercentage: Math.random() * 0.1 + 0.02,
    takeProfitPercentage: Math.random() * 0.2 + 0.05,
    leverageMultiplier: Math.floor(Math.random() * 5) + 1,
    rebalanceFrequency: Math.floor(Math.random() * 24) + 1,
    // Strategy genetic history
    generation: 0,
    parents: [],
    // Performance metrics will be populated during evaluation
    performanceMetrics: {}
};
}

// Evaluate strategy performance in different market conditions
function evaluateStrategy(strategy, marketConditions) {
let totalReturns = 0;
let sharpeRatio = 0;
let maxDrawdown = 0;
let winRate = 0;
let returns = [];

// Simulate strategy performance in each market condition
marketConditions.forEach(condition => {
    // Initial capital
    let capital = 10000;
    let trades = 0;
    let winningTrades = 0;
    let peakCapital = capital;
    let dailyReturns = [];
    
    // Simulate 30 trading days
    for (let day = 0; day < 30; day++) {
    // Simulate market movement
    const dailyMove = (Math.random() * 2 - 1) * condition.volatility + condition.trend;
    
    // Apply strategy parameters and components to determine actions
    const entrySignalStrength = Math.random();
    const exitSignalStrength = Math.random();
    
    // Determine if strategy makes a trade today
    if (entrySignalStrength > strategy.entryThreshold && capital > 0) {
        // Calculate position size based on risk management
        let positionSize = 0;
        if (strategy.riskManagement.name === "Fixed Position Size") {
        positionSize = capital * 0.1;
        } else if (strategy.riskManagement.name === "Percentage Risk") {
        positionSize = capital * strategy.stopLossPercentage;
        } else if (strategy.riskManagement.name === "Kelly Criterion") {
        // Simplified Kelly calculation
        const winProbability = 0.5 + strategy.entryThreshold;
        const lossMultiplier = strategy.stopLossPercentage;
        const winMultiplier = strategy.takeProfitPercentage;
        const kellyFraction = (winProbability * winMultiplier - (1 - winProbability) * lossMultiplier) / winMultiplier;
        positionSize = capital * Math.max(0, Math.min(1, kellyFraction));
        } else {
        // Dynamic position sizing
        positionSize = capital * (0.1 + 0.2 * Math.abs(dailyMove));
        }
        
        // Apply leverage
        positionSize *= strategy.leverageMultiplier;
        
        // Calculate trade result
        let tradeReturn = positionSize * dailyMove;
        
        // Apply exit method
        if (dailyMove > strategy.takeProfitPercentage || exitSignalStrength > strategy.exitThreshold) {
        tradeReturn = positionSize * strategy.takeProfitPercentage;
        winningTrades++;
        } else if (dailyMove < -strategy.stopLossPercentage) {
        tradeReturn = -positionSize * strategy.stopLossPercentage;
        }
        
        capital += tradeReturn;
        trades++;
        
        // Track peak capital for drawdown calculation
        if (capital > peakCapital) {
        peakCapital = capital;
        }
    }
    
    // Record daily return
    const dailyReturn = (capital / 10000) - 1;
    dailyReturns.push(dailyReturn);
    }
    
    // Calculate performance metrics for this market condition
    const totalReturn = (capital / 10000) - 1;
    returns.push(totalReturn);
    totalReturns += totalReturn;
    
    // Calculate win rate
    winRate += trades > 0 ? winningTrades / trades : 0;
    
    // Calculate max drawdown
    const drawdown = peakCapital > 0 ? (peakCapital - capital) / peakCapital : 0;
    maxDrawdown = Math.max(maxDrawdown, drawdown);
    
    // Calculate Sharpe ratio
    const returnMean = dailyReturns.reduce((sum, ret) => sum + ret, 0) / dailyReturns.length;
    const returnStdDev = Math.sqrt(
    dailyReturns.reduce((sum, ret) => sum + Math.pow(ret - returnMean, 2), 0) / dailyReturns.length
    );
    const dailySharpe = returnStdDev > 0 ? (returnMean / returnStdDev) * Math.sqrt(252) : 0;
    sharpeRatio += dailySharpe;
});

// Average metrics across all market conditions
const numConditions = marketConditions.length;

return {
    totalReturn: totalReturns / numConditions,
    sharpeRatio: sharpeRatio / numConditions,
    maxDrawdown: maxDrawdown,
    winRate: winRate / numConditions,
    volatility: Math.sqrt(
    returns.reduce((sum, ret) => sum + Math.pow(ret - (totalReturns / numConditions), 2), 0) / numConditions
    ),
    fitnessScore: (totalReturns / numConditions) * 0.4 + 
                (sharpeRatio / numConditions) * 0.3 - 
                maxDrawdown * 0.2 + 
                (winRate / numConditions) * 0.1
};
}

// Select best strategies for reproduction
function selectBestStrategies(population, selectionRate) {
// Sort by fitness score
const sortedPopulation = [...population].sort((a, b) => {
    return b.performanceMetrics.fitnessScore - a.performanceMetrics.fitnessScore;
});

// Select top percentage
const numToSelect = Math.floor(population.length * selectionRate);
return sortedPopulation.slice(0, numToSelect);
}

// Create offspring from parent strategies
function createOffspring(parents) {
// Select two random parents
const parent1 = parents[Math.floor(Math.random() * parents.length)];
const parent2 = parents[Math.floor(Math.random() * parents.length)];

// Create child with crossover
const child = {
    id: Math.floor(Math.random() * 10000),
    name: `Offspring-${Math.floor(Math.random() * 10000)}`,
    // Inherit components from either parent
    entryMethod: Math.random() > 0.5 ? parent1.entryMethod : parent2.entryMethod,
    exitMethod: Math.random() > 0.5 ? parent1.exitMethod : parent2.exitMethod,
    riskManagement: Math.random() > 0.5 ? parent1.riskManagement : parent2.riskManagement,
    timeframe: Math.random() > 0.5 ? parent1.timeframe : parent2.timeframe,
    // Crossover of parameters with some averaging
    entryThreshold: (parent1.entryThreshold + parent2.entryThreshold) / 2,
    exitThreshold: (parent1.exitThreshold + parent2.exitThreshold) / 2,
    stopLossPercentage: Math.random() > 0.5 ? parent1.stopLossPercentage : parent2.stopLossPercentage,
    takeProfitPercentage: Math.random() > 0.5 ? parent1.takeProfitPercentage : parent2.takeProfitPercentage,
    leverageMultiplier: Math.random() > 0.5 ? parent1.leverageMultiplier : parent2.leverageMultiplier,
    rebalanceFrequency: Math.random() > 0.5 ? parent1.rebalanceFrequency : parent2.rebalanceFrequency,
    // Track genetic lineage
    generation: Math.max(parent1.generation, parent2.generation) + 1,
    parents: [parent1.id, parent2.id],
    performanceMetrics: {}
};

return child;
}

// Apply random mutations
function mutateStrategy(strategy, mutationRate) {
const mutated = { ...strategy };

// Potentially mutate each parameter
if (Math.random() < mutationRate) {
    mutated.entryMethod = STRATEGY_COMPONENTS.entryMethods[Math.floor(Math.random() * STRATEGY_COMPONENTS.entryMethods.length)];
}
if (Math.random() < mutationRate) {
    mutated.exitMethod = STRATEGY_COMPONENTS.exitMethods[Math.floor(Math.random() * STRATEGY_COMPONENTS.exitMethods.length)];
}
if (Math.random() < mutationRate) {
    mutated.riskManagement = STRATEGY_COMPONENTS.riskManagement[Math.floor(Math.random() * STRATEGY_COMPONENTS.riskManagement.length)];
}
if (Math.random() < mutationRate) {
    mutated.timeframe = STRATEGY_COMPONENTS.timeframes[Math.floor(Math.random() * STRATEGY_COMPONENTS.timeframes.length)];
}
if (Math.random() < mutationRate) {
    mutated.entryThreshold = Math.max(0.01, Math.min(0.2, mutated.entryThreshold + (Math.random() * 0.1 - 0.05)));
}
if (Math.random() < mutationRate) {
    mutated.exitThreshold = Math.max(0.01, Math.min(0.2, mutated.exitThreshold + (Math.random() * 0.1 - 0.05)));
}
if (Math.random() < mutationRate) {
    mutated.stopLossPercentage = Math.max(0.01, Math.min(0.2, mutated.stopLossPercentage + (Math.random() * 0.06 - 0.03)));
}
if (Math.random() < mutationRate) {
    mutated.takeProfitPercentage = Math.max(0.02, Math.min(0.4, mutated.takeProfitPercentage + (Math.random() * 0.1 - 0.05)));
}
if (Math.random() < mutationRate) {
    mutated.leverageMultiplier = Math.max(1, Math.min(10, Math.floor(mutated.leverageMultiplier + (Math.random() * 3 - 1.5))));
}
if (Math.random() < mutationRate) {
    mutated.rebalanceFrequency = Math.max(1, Math.min(48, Math.floor(mutated.rebalanceFrequency + (Math.random() * 8 - 4))));
}

return mutated;
}

// Run the evolution simulation
async function runEvolutionSimulation() {
console.log("\n=== DarwinFi Evolutionary Strategy Simulation ===\n");
console.log(`Population Size: ${POPULATION_SIZE}`);
console.log(`Generations: ${GENERATIONS}`);
console.log(`Selection Rate: ${SELECTION_RATE}`);
console.log(`Mutation Rate: ${MUTATION_RATE}`);
console.log(`Market Conditions: ${MARKET_CONDITIONS.map(c => c.name).join(', ')}`);
console.log("\n");

// Initialize population with random strategies
let population = [];
for (let i = 0; i < POPULATION_SIZE; i++) {
    population.push(createRandomStrategy());
}

// Track best performing strategies across generations
let bestStrategies = [];
let generationMetrics = [];

// Run for specified number of generations
for (let gen = 0; gen < GENERATIONS; gen++) {
    console.log(`\n--- Generation ${gen + 1} ---`);
    
    // Evaluate each strategy in the population
    for (let strategy of population) {
    strategy.performanceMetrics = evaluateStrategy(strategy, MARKET_CONDITIONS);
    }
    
    // Log top performers in this generation
    const sortedPopulation = [...population].sort((a, b) => 
    b.performanceMetrics.fitnessScore - a.performanceMetrics.fitnessScore
    );
    
    const bestStrategy = sortedPopulation[0];
    bestStrategies.push(bestStrategy);
    
    console.log(`Best Strategy: ${bestStrategy.name}`);
    console.log(`Components: ${bestStrategy.entryMethod.name}, ${bestStrategy.exitMethod.name}, ${bestStrategy.riskManagement.name}`);
    console.log(`Performance: Return: ${(bestStrategy.performanceMetrics.totalReturn * 100).toFixed(2)}%, Sharpe: ${bestStrategy.performanceMetrics.sharpeRatio.toFixed(2)}, Drawdown: ${(bestStrategy.performanceMetrics.maxDrawdown * 100).toFixed(2)}%`);
    
    // Calculate and store generation metrics
    const avgFitness = population.reduce((sum, s) => sum + s.performanceMetrics.fitnessScore, 0) / population.length;
    const avgReturn = population.reduce((sum, s) => sum + s.performanceMetrics.totalReturn, 0) / population.length;
    
    generationMetrics.push({
    generation: gen + 1,
    bestFitness: bestStrategy.performanceMetrics.fitnessScore,
    avgFitness: avgFitness,
    bestReturn: bestStrategy.performanceMetrics.totalReturn,
    avgReturn: avgReturn
    });
    
    // Don't evolve after the last generation
    if (gen === GENERATIONS - 1) break;
    
    // Select best strategies for reproduction
    const parents = selectBestStrategies(population, SELECTION_RATE);
    console.log(`Selected ${parents.length} strategies for reproduction`);
    
    // Create new population through reproduction and mutation
    const newPopulation = [];
    
    // Keep top performers (elitism)
    const eliteCount = Math.max(1, Math.floor(POPULATION_SIZE * 0.1));
    for (let i = 0; i < eliteCount; i++) {
    newPopulation.push(sortedPopulation[i]);
    }
    
    // Fill the rest with new offspring
    while (newPopulation.length < POPULATION_SIZE) {
    const child = createOffspring(parents);
    const mutatedChild = mutateStrategy(child, MUTATION_RATE);
    newPopulation.push(mutatedChild);
    }
    
    population = newPopulation;
}

// Display final results
console.log("\n=== Evolution Results ===\n");

console.log("Performance Improvement Over Generations:");
generationMetrics.forEach(metric => {
    console.log(`Generation ${metric.generation}: Best Return: ${(metric.bestReturn * 100).toFixed(2)}%, Avg Return: ${(metric.avgReturn * 100).toFixed(2)}%`);
});

// Calculate improvement
const firstGenBest = generationMetrics[0].bestReturn;
const lastGenBest = generationMetrics[generationMetrics.length - 1].bestReturn;
const improvementPct = ((lastGenBest - firstGenBest) / Math.abs(firstGenBest)) * 100;

console.log(`\nTotal Return Improvement: ${improvementPct.toFixed(2)}%`);

// Analyze final best strategy
const finalBest = bestStrategies[bestStrategies.length - 1];
console.log("\nFinal Best Strategy:");
console.log(`Name: ${finalBest.name}`);
console.log(`Generation: ${finalBest.generation}`);
console.log(`Entry Method: ${finalBest.entryMethod.name}`);
console.log(`Exit Method: ${finalBest.exitMethod.name}`);
console.log(`Risk Management: ${finalBest.riskManagement.name}`);
console.log(`Timeframe: ${finalBest.timeframe.name}`);
console.log(`Leverage: ${finalBest.leverageMultiplier}x`);
console.log(`Performance Metrics:`);
console.log(`  Total Return: ${(finalBest.performanceMetrics.totalReturn * 100).toFixed(2)}%`);
console.log(`  Sharpe Ratio: ${finalBest.performanceMetrics.sharpeRatio.toFixed(2)}`);
console.log(`  Max Drawdown: ${(finalBest.performanceMetrics.maxDrawdown * 100).toFixed(2)}%`);
console.log(`  Win Rate: ${(finalBest.performanceMetrics.winRate * 100).toFixed(2)}%`);
console.log(`  Volatility: ${(finalBest.performanceMetrics.volatility * 100).toFixed(2)}%`);

// Return the results for potential further processing
return {
    bestStrategies,
    generationMetrics,
    finalBest
};
}

// Run the simulation
runEvolutionSimulation()
.then(results => {
    console.log("\nSimulation completed successfully!");
    
    // Save results to a file for later analysis
    const resultsPath = path.join(__dirname, '../results/evolution_results.json');
    fs.mkdirSync(path.dirname(resultsPath), { recursive: true });
    fs.writeFileSync(
    resultsPath, 
    JSON.stringify(results, null, 2)
    );
    console.log(`Results saved to ${resultsPath}`);
})
.catch(error => {
    console.error("Error during simulation:", error);
});
