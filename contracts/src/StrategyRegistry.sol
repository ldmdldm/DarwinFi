// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./IStrategy.sol";

/**
* @title StrategyRegistry
* @dev Registry contract for tracking all created strategies
*/
contract StrategyRegistry {
    address public owner;
    address public strategyManager;
    address public strategyFactory;
    
    // Struct to store strategy information
    struct StrategyInfo {
        string name;
        address creator;
        uint256 creationTime;
        bool active;
        uint256 performanceScore;
        uint256 generationNumber;  // For evolutionary strategies
        address parentStrategy;    // For forked strategies
    }
    
    // Strategy mapping and array for tracking
    mapping(address => StrategyInfo) public strategies;
    address[] public allStrategies;
    
    // Creator to strategies mapping
    mapping(address => address[]) public creatorStrategies;
    
    // Events
    event StrategyRegistered(address strategy, string name, address creator);
    event StrategyActivated(address strategy);
    event StrategyDeactivated(address strategy);
    event PerformanceUpdated(address strategy, uint256 newScore);
    
    /**
    * @dev Constructor sets the owner
    */
    constructor() {
        owner = msg.sender;
    }
    
    /**
    * @dev Modifier to restrict certain functions to the owner
    */
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    /**
    * @dev Modifier to restrict certain functions to approved addresses
    */
    modifier onlyApproved() {
        require(
            msg.sender == owner || 
            msg.sender == strategyManager || 
            msg.sender == strategyFactory, 
            "Caller not approved"
        );
        _;
    }
    
    /**
    * @dev Sets the strategy manager address
    * @param _strategyManager Address of the strategy manager contract
    */
    function setStrategyManager(address _strategyManager) external onlyOwner {
        strategyManager = _strategyManager;
    }
    
    /**
    * @dev Sets the strategy factory address
    * @param _strategyFactory Address of the strategy factory contract
    */
    function setStrategyFactory(address _strategyFactory) external onlyOwner {
        strategyFactory = _strategyFactory;
    }
    
    /**
    * @dev Registers a new strategy in the registry
    * @param strategyAddress Address of the strategy to register
    * @param name Name of the strategy
    * @param parentStrategy Address of the parent strategy if it's a fork (0 for new strategies)
    * @param generationNumber Generation number for evolutionary strategies
    */
    function registerStrategy(
        address strategyAddress, 
        string memory name,
        address parentStrategy,
        uint256 generationNumber
    ) external onlyApproved returns (bool) {
        require(strategyAddress != address(0), "Invalid strategy address");
        require(strategies[strategyAddress].creationTime == 0, "Strategy already registered");
        
        StrategyInfo memory info = StrategyInfo({
            name: name,
            creator: tx.origin, // Use tx.origin to get the actual user, not the contract
            creationTime: block.timestamp,
            active: true,
            performanceScore: 0,
            generationNumber: generationNumber,
            parentStrategy: parentStrategy
        });
        
        strategies[strategyAddress] = info;
        allStrategies.push(strategyAddress);
        creatorStrategies[tx.origin].push(strategyAddress);
        
        emit StrategyRegistered(strategyAddress, name, tx.origin);
        
        return true;
    }
    
    /**
    * @dev Simplified version of register function with fewer parameters
    * @param strategyAddress Address of the strategy to register
    * @param name Name of the strategy
    */
    function registerSimpleStrategy(address strategyAddress, string memory name) external onlyApproved returns (bool) {
        require(strategyAddress != address(0), "Invalid strategy address");
        require(strategies[strategyAddress].creationTime == 0, "Strategy already registered");
        
        StrategyInfo memory info = StrategyInfo({
            name: name,
            creator: tx.origin, // Use tx.origin to get the actual user, not the contract
            creationTime: block.timestamp,
            active: true,
            performanceScore: 0,
            generationNumber: 0,
            parentStrategy: address(0)
        });
        
        strategies[strategyAddress] = info;
        allStrategies.push(strategyAddress);
        creatorStrategies[tx.origin].push(strategyAddress);
        
        emit StrategyRegistered(strategyAddress, name, tx.origin);
        
        return true;
    }
    
    /**
    * @dev Updates the performance score of a strategy
    * @param strategyAddress Address of the strategy
    * @param newScore New performance score
    */
    function updatePerformance(address strategyAddress, uint256 newScore) external onlyApproved {
        require(strategies[strategyAddress].creationTime != 0, "Strategy not registered");
        
        strategies[strategyAddress].performanceScore = newScore;
        
        emit PerformanceUpdated(strategyAddress, newScore);
    }
    
    /**
    * @dev Activates a strategy
    * @param strategyAddress Address of the strategy to activate
    */
    function activateStrategy(address strategyAddress) external onlyApproved {
        require(strategies[strategyAddress].creationTime != 0, "Strategy not registered");
        
        strategies[strategyAddress].active = true;
        
        emit StrategyActivated(strategyAddress);
    }
    
    /**
    * @dev Deactivates a strategy
    * @param strategyAddress Address of the strategy to deactivate
    */
    function deactivateStrategy(address strategyAddress) external onlyApproved {
        require(strategies[strategyAddress].creationTime != 0, "Strategy not registered");
        
        strategies[strategyAddress].active = false;
        
        emit StrategyDeactivated(strategyAddress);
    }
    
    /**
    * @dev Checks if a strategy is registered
    * @param strategyAddress Address to check
    * @return bool True if the strategy is registered
    */
    function isRegistered(address strategyAddress) external view returns (bool) {
        return strategies[strategyAddress].creationTime != 0;
    }
    
    /**
    * @dev Gets all registered strategies
    * @return address[] Array of strategy addresses
    */
    function getAllStrategies() external view returns (address[] memory) {
        return allStrategies;
    }
    
    /**
    * @dev Gets active strategies
    * @return address[] Array of active strategy addresses
    */
    function getActiveStrategies() external view returns (address[] memory) {
        uint256 activeCount = 0;
        
        // Count active strategies
        for (uint256 i = 0; i < allStrategies.length; i++) {
            if (strategies[allStrategies[i]].active) {
                activeCount++;
            }
        }
        
        // Create array of active strategies
        address[] memory activeStrategies = new address[](activeCount);
        uint256 index = 0;
        
        for (uint256 i = 0; i < allStrategies.length; i++) {
            if (strategies[allStrategies[i]].active) {
                activeStrategies[index] = allStrategies[i];
                index++;
            }
        }
        
        return activeStrategies;
    }
    
    /**
    * @dev Gets strategies created by a specific address
    * @param creator Address of the creator
    * @return address[] Array of strategy addresses created by the creator
    */
    function getCreatorStrategies(address creator) external view returns (address[] memory) {
        return creatorStrategies[creator];
    }
    
    /**
    * @dev Gets detailed information about a strategy
    * @param strategyAddress Address of the strategy
    * @return name Name of the strategy
    * @return creator Address of the creator
    * @return creationTime Creation timestamp
    * @return active Whether the strategy is active
    * @return performanceScore Performance score of the strategy
    * @return generationNumber Generation number for evolutionary strategies
    * @return parentStrategy Address of the parent strategy
    */
    function getStrategyInfo(address strategyAddress) external view returns (
        string memory name,
        address creator,
        uint256 creationTime,
        bool active,
        uint256 performanceScore,
        uint256 generationNumber,
        address parentStrategy
    ) {
        StrategyInfo memory info = strategies[strategyAddress];
        return (
            info.name,
            info.creator,
            info.creationTime,
            info.active,
            info.performanceScore,
            info.generationNumber,
            info.parentStrategy
        );
    }
    
    /**
    * @dev Transfers ownership of the registry
    * @param newOwner Address of the new owner
    */
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Invalid new owner address");
        owner = newOwner;
    }
}

