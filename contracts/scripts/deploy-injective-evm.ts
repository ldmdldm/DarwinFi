import { ethers } from "hardhat";
import { formatEther } from "ethers";
import * as fs from "fs";
import { MockToken__factory } from "../typechain-types/factories/src/MockToken__factory";
import { DarwinVault__factory } from "../typechain-types/factories/src/vault.sol/DarwinVault__factory";
import { StrategyFactory__factory } from "../typechain-types/factories/src/StrategyFactory.sol/StrategyFactory__factory";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
console.log("Starting deployment to Injective EVM...");

// Get the deployer account
const [deployer] = await ethers.getSigners();
console.log(`Deployer address: ${deployer.address}`);

const balance = await ethers.provider.getBalance(deployer.address);
console.log(`Deployer balance: ${formatEther(balance)} ETH`);

// Deploy MockToken contract
console.log("Deploying MockToken...");
const mockTokenFactory = new MockToken__factory(deployer);
const mockToken = await mockTokenFactory.deploy();
await mockToken.waitForDeployment();
console.log(`MockToken deployed to: ${await mockToken.getAddress()}`);
// Deploy Vault contract
console.log("Deploying Vault...");
const vaultFactory = new DarwinVault__factory(deployer);
const vault = await vaultFactory.deploy(await mockToken.getAddress());
await vault.waitForDeployment();
console.log(`Vault deployed to: ${await vault.getAddress()}`);
// Deploy StrategyFactory contract
console.log("Deploying StrategyFactory...");
const strategyFactoryFactory = new StrategyFactory__factory(deployer);
const strategyFactory = await strategyFactoryFactory.deploy(await vault.getAddress());
await strategyFactory.waitForDeployment();
console.log(`StrategyFactory deployed to: ${await strategyFactory.getAddress()}`);

// Save deployment addresses
const deploymentData = {
    mockTokenAddress: await mockToken.getAddress(),
    vaultAddress: await vault.getAddress(),
    strategyFactoryAddress: await strategyFactory.getAddress(),
    network: (await ethers.provider.getNetwork()).name || 'injective-evm',
    chainId: Number((await ethers.provider.getNetwork()).chainId),
    deployer: deployer.address,
    timestamp: new Date().toISOString()
};

// Create deployments directory if it doesn't exist
if (!fs.existsSync("./deployments")) {
    fs.mkdirSync("./deployments");
}

// Save deployment info to file
const fileName = `./deployments/injective-evm-deployment-${deploymentData.timestamp.replace(/:/g, "-")}.json`;
fs.writeFileSync(fileName, JSON.stringify(deploymentData, null, 2));
console.log(`Deployment information saved to ${fileName}`);

console.log("Deployment complete!");

return {
    mockToken: await mockToken.getAddress(),
    vault: await vault.getAddress(),
    strategyFactory: await strategyFactory.getAddress()
};
}

main()
.then((deployedContracts) => {
    console.log("Deployed contracts:", deployedContracts);
    process.exit(0);
})
.catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
});

