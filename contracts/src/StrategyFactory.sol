// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./IStrategy.sol";
import "./SimpleYieldStrategy.sol";
import "./StrategyRegistry.sol";

/**
* @title IEvolutionaryStrategyCreator
* @dev Interface for creating evolutionary strategies to avoid circular dependencies
*/
interface IEvolutionaryStrategyCreator {
    function createStrategy(
        string memory name,
        address targetProtocol,
        uint8 riskFactor,
        uint16 generationInterval,
        uint16 mutationRate,
        address owner
    ) external returns (address);
    
    function getProtocol(address strategy) external view returns (address);
}

/**
* @title StrategyFactory
* @dev Factory contract for creating different types of yield strategies
*/
contract StrategyFactory {
    address public owner;
    StrategyRegistry public registry;
    IEvolutionaryStrategyCreator public evolutionaryCreator;

    // Strategy creation events
    event StrategyCreated(address strategy, string strategyType, address creator);
    
    // Strategy types
    enum StrategyType { SIMPLE, EVOLUTIONARY }
    
    /**
    * @dev Constructor sets the owner and registry address
    * @param _registry Address of the strategy registry
    */
    constructor(address _registry) {
        owner = msg.sender;
        registry = StrategyRegistry(_registry);
    }
    
    /**
    * @dev Modifier to restrict certain functions to the owner
    */
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    /**
    * @dev Sets the evolutionary strategy creator contract
    * @param _creator Address of the evolutionary strategy creator contract
    */
    function setEvolutionaryCreator(address _creator) external onlyOwner {
        evolutionaryCreator = IEvolutionaryStrategyCreator(_creator);
    }
    
    /**
    * @dev Create a new strategy based on the specified type
    * @param strategyType Type of strategy to create (0=Simple, 1=Evolutionary)
    * @param name Name of the strategy
    * @param targetProtocol Address of the target protocol to interact with
    * @param riskFactor Risk factor for the strategy (1-10)
    * @param params Additional parameters for strategy initialization (encoded bytes)
    * @return address Address of the newly created strategy
    */
    function createStrategy(
        StrategyType strategyType,
        string memory name,
        address targetProtocol,
        uint8 riskFactor,
        bytes memory params
    ) external returns (address) {
        address strategyAddress;
        
        if (strategyType == StrategyType.SIMPLE) {
            SimpleYieldStrategy strategy = new SimpleYieldStrategy(
                name,
                targetProtocol,
                riskFactor,
                msg.sender
            );
            strategyAddress = address(strategy);
            emit StrategyCreated(strategyAddress, "Simple", msg.sender);
        } else if (strategyType == StrategyType.EVOLUTIONARY) {
            // Ensure evolutionary creator is set
            require(address(evolutionaryCreator) != address(0), "Evolutionary creator not set");
            
            // Decode the additional parameters for evolutionary strategies
            (uint16 generationInterval, uint16 mutationRate) = abi.decode(params, (uint16, uint16));
            
            // Use the creator contract to create the strategy
            strategyAddress = evolutionaryCreator.createStrategy(
                name,
                targetProtocol,
                riskFactor,
                generationInterval,
                mutationRate,
                msg.sender
            );
            
            emit StrategyCreated(strategyAddress, "Evolutionary", msg.sender);
        } else {
            revert("Unknown strategy type");
        }
        
        // Register the newly created strategy
        registry.registerSimpleStrategy(strategyAddress, name);
        
        return strategyAddress;
    }
    
    /**
    * @dev Creates a fork of an existing strategy with modifications
    * @param baseStrategy Address of the strategy to fork
    * @param name Name of the new strategy
    * @param modificationParams Parameters for modifications to the strategy
    * @return address Address of the newly created strategy fork
    */
    function forkStrategy(
        address baseStrategy, 
        string memory name, 
        bytes memory modificationParams
    ) external returns (address) {
        // Verify the base strategy exists
        require(registry.isRegistered(baseStrategy), "Base strategy not registered");
        
        IStrategy strategy = IStrategy(baseStrategy);
        
        // Determine the strategy type by checking if it's an EvolutionaryYieldStrategy
        // Determine the strategy type
        bool isEvolutionary = false;

        // First check if the evolutionaryCreator is set
        if (address(evolutionaryCreator) != address(0)) {
            // Try to get the target protocol - will revert if it's not an evolutionary strategy
            try evolutionaryCreator.getProtocol(baseStrategy) returns (address) {
                isEvolutionary = true;
            } catch {
                // It's not an evolutionary strategy
            }
        }
        address strategyAddress;
        
        if (isEvolutionary) {
            // Decode modification parameters for evolutionary strategy
            (uint8 riskFactor, uint16 generationInterval, uint16 mutationRate) = 
                abi.decode(modificationParams, (uint8, uint16, uint16));
            
            // Ensure evolutionary creator is set
            require(address(evolutionaryCreator) != address(0), "Evolutionary creator not set");

            // Get the target protocol through the creator interface
            address targetProtocol = evolutionaryCreator.getProtocol(baseStrategy);

            // Create a new evolutionary strategy through the creator
            strategyAddress = evolutionaryCreator.createStrategy(
                name,
                targetProtocol,
                riskFactor,
                generationInterval,
                mutationRate,
                msg.sender
            );
            emit StrategyCreated(strategyAddress, "Evolutionary Fork", msg.sender);
        } else {
            // Decode modification parameters for simple strategy
            uint8 riskFactor = abi.decode(modificationParams, (uint8));
            
            SimpleYieldStrategy simpleStrategy = SimpleYieldStrategy(baseStrategy);
            
            SimpleYieldStrategy newStrategy = new SimpleYieldStrategy(
                name,
                simpleStrategy.targetProtocol(),
                riskFactor,
                msg.sender
            );
            
            strategyAddress = address(newStrategy);
            emit StrategyCreated(strategyAddress, "Simple Fork", msg.sender);
        }
        
        // Register the newly created strategy
        registry.registerSimpleStrategy(strategyAddress, name);
        
        return strategyAddress;
    }
    
    /**
    * @dev Updates the registry address
    * @param _registry New registry address
    */
    function setRegistry(address _registry) external onlyOwner {
        registry = StrategyRegistry(_registry);
    }
    
    /**
    * @dev Transfers ownership of the factory
    * @param newOwner Address of the new owner
    */
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Invalid new owner address");
        owner = newOwner;
    }
}

