// SPDX-License-Identifier: MIT
const { ethers } = require("hardhat");

async function main() {
console.log("Starting deployment of DarwinFi contracts...");

// Get contract factories
const StrategyRegistry = await ethers.getContractFactory("StrategyRegistry");
const StrategyFactory = await ethers.getContractFactory("StrategyFactory");
const StrategyManager = await ethers.getContractFactory("StrategyManager");
const SimpleYieldStrategy = await ethers.getContractFactory("SimpleYieldStrategy");
const EvolutionaryYieldStrategy = await ethers.getContractFactory("EvolutionaryYieldStrategy");

// Deploy StrategyRegistry
console.log("Deploying StrategyRegistry...");
const strategyRegistry = await StrategyRegistry.deploy();
await strategyRegistry.deployed();
console.log("StrategyRegistry deployed to:", strategyRegistry.address);

// Deploy StrategyFactory
console.log("Deploying StrategyFactory...");
const strategyFactory = await StrategyFactory.deploy(strategyRegistry.address);
await strategyFactory.deployed();
console.log("StrategyFactory deployed to:", strategyFactory.address);

// Deploy StrategyManager
console.log("Deploying StrategyManager...");
const strategyManager = await StrategyManager.deploy(
    strategyRegistry.address,
    strategyFactory.address
);
await strategyManager.deployed();
console.log("StrategyManager deployed to:", strategyManager.address);

// Set the StrategyManager in the registry
console.log("Setting StrategyManager in Registry...");
await strategyRegistry.setStrategyManager(strategyManager.address);
console.log("StrategyManager set in Registry");

// Set the StrategyManager in the factory
console.log("Setting StrategyManager in Factory...");
await strategyFactory.setStrategyManager(strategyManager.address);
console.log("StrategyManager set in Factory");

// Deploy a SimpleYieldStrategy as an example
console.log("Deploying SimpleYieldStrategy...");
const mockProtocolAddress = "0x1234567890123456789012345678901234567890"; // Replace with actual address
const simpleYieldStrategy = await SimpleYieldStrategy.deploy(
    mockProtocolAddress,
    "Simple Yield Strategy",
    "This is a basic yield farming strategy"
);
await simpleYieldStrategy.deployed();
console.log("SimpleYieldStrategy deployed to:", simpleYieldStrategy.address);

// Register the SimpleYieldStrategy
console.log("Registering SimpleYieldStrategy...");
await strategyRegistry.registerStrategy(simpleYieldStrategy.address);
console.log("SimpleYieldStrategy registered");

// Deploy an EvolutionaryYieldStrategy as an example
console.log("Deploying EvolutionaryYieldStrategy...");
const evolutionaryYieldStrategy = await EvolutionaryYieldStrategy.deploy(
    mockProtocolAddress,
    "Evolutionary Yield Strategy",
    "This is an advanced evolutionary yield farming strategy",
    [80, 10, 10], // Risk allocation percentages
    5 // Generation threshold
);
await evolutionaryYieldStrategy.deployed();
console.log("EvolutionaryYieldStrategy deployed to:", evolutionaryYieldStrategy.address);

// Register the EvolutionaryYieldStrategy
console.log("Registering EvolutionaryYieldStrategy...");
await strategyRegistry.registerStrategy(evolutionaryYieldStrategy.address);
console.log("EvolutionaryYieldStrategy registered");

// Initialize some evolutionary parameters in the manager
console.log("Initializing evolutionary parameters...");
await strategyManager.setEvolutionThreshold(5);
await strategyManager.setPerformanceWeight(70);
await strategyManager.setRiskWeight(20);
await strategyManager.setDiversificationWeight(10);
console.log("Evolutionary parameters initialized");

console.log("Deployment complete!");
console.log("--------------------------------------");
console.log("Contract addresses:");
console.log("StrategyRegistry:", strategyRegistry.address);
console.log("StrategyFactory:", strategyFactory.address);
console.log("StrategyManager:", strategyManager.address);
console.log("SimpleYieldStrategy:", simpleYieldStrategy.address);
console.log("EvolutionaryYieldStrategy:", evolutionaryYieldStrategy.address);
console.log("--------------------------------------");
}

main()
.then(() => process.exit(0))
.catch((error) => {
    console.error(error);
    process.exit(1);
});

