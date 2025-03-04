// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

/**
* @title StrategyManager
* @dev Contract for managing yield farming strategies with evolutionary principles
* @notice This contract handles the registration, evaluation, evolution, and execution of yield strategies
*/
contract StrategyManager {
    // ========== STATE VARIABLES ==========

    address public owner;
    uint256 public nextStrategyId;
    uint256 public generationCount;
    uint256 public constant MAX_ACTIVE_STRATEGIES = 50;
    uint256 public constant STRATEGY_EVALUATION_PERIOD = 7 days;
    uint256 public constant EVOLUTION_THRESHOLD = 70; // Performance threshold (out of 100)

    // ========== STRUCTS ==========

    struct Strategy {
        uint256 id;
        string name;
        address creator;
        address implementation;
        uint256 generation;
        uint256 parentA; // ID of first parent (0 if genesis strategy)
        uint256 parentB; // ID of second parent (0 if genesis strategy)
        uint256 performance; // 0-100 score
        bool active;
        uint256 lastEvaluationTime;
        uint256 totalValue; // Total value generated
        uint256 executionCount;
        bytes strategyData; // Custom data for this strategy
    }

    // ========== MAPPINGS ==========

    mapping(uint256 => Strategy) public strategies;
    mapping(address => bool) public approvedCreators;
    mapping(uint256 => uint256[]) public generationStrategies; // Generation => Strategy IDs
    uint256[] public activeStrategyIds;

    // ========== EVENTS ==========

    event StrategyRegistered(uint256 indexed strategyId, string name, address creator, uint256 generation);
    event StrategyEvaluated(uint256 indexed strategyId, uint256 performance, uint256 totalValue);
    event StrategyEvolved(uint256 indexed newStrategyId, uint256 parentA, uint256 parentB, uint256 generation);
    event StrategyExecuted(uint256 indexed strategyId, uint256 value, bool success);
    event StrategyDeactivated(uint256 indexed strategyId);
    event StrategyActivated(uint256 indexed strategyId);
    event CreatorApprovalChanged(address indexed creator, bool approved);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    // ========== ERRORS ==========

    error Unauthorized();
    error StrategyNotFound();
    error StrategyAlreadyActive();
    error StrategyNotActive();
    error TooManyActiveStrategies();
    error InvalidPerformanceScore();
    error EvaluationTooEarly();
    error InvalidParentStrategy();

    // ========== CONSTRUCTOR ==========

    constructor() {
        owner = msg.sender;
        nextStrategyId = 1;
        generationCount = 0;
    }

    // ========== MODIFIERS ==========

    modifier onlyOwner() {
        if (msg.sender != owner) revert Unauthorized();
        _;
    }

    modifier onlyApprovedCreator() {
        if (!approvedCreators[msg.sender] && msg.sender != owner) revert Unauthorized();
        _;
    }

    modifier strategyExists(uint256 strategyId) {
        if (strategies[strategyId].implementation == address(0)) revert StrategyNotFound();
        _;
    }

    // ========== ADMIN FUNCTIONS ==========

    /**
    * @dev Transfers ownership of the contract to a new account
    * @param newOwner The address of the new owner
    */
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "New owner cannot be the zero address");
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }

    /**
    * @dev Approves or revokes a creator's permission to register strategies
    * @param creator The address of the creator
    * @param approved Whether the creator is approved
    */
    function setCreatorApproval(address creator, bool approved) external onlyOwner {
        approvedCreators[creator] = approved;
        emit CreatorApprovalChanged(creator, approved);
    }

    // ========== STRATEGY MANAGEMENT FUNCTIONS ==========

    /**
    * @dev Registers a new strategy in the system
    * @param name The name of the strategy
    * @param implementation The contract address that implements the strategy
    * @param strategyData Custom data for the strategy
    * @return id The ID of the newly registered strategy
    */
    function registerStrategy(
        string calldata name,
        address implementation,
        bytes calldata strategyData
    ) external onlyApprovedCreator returns (uint256 id) {
        id = nextStrategyId++;
        
        Strategy storage newStrategy = strategies[id];
        newStrategy.id = id;
        newStrategy.name = name;
        newStrategy.creator = msg.sender;
        newStrategy.implementation = implementation;
        newStrategy.generation = 0; // Genesis strategy
        newStrategy.active = false; // Inactive until approved
        newStrategy.lastEvaluationTime = block.timestamp;
        newStrategy.strategyData = strategyData;
        
        // Add to generation 0
        generationStrategies[0].push(id);
        
        emit StrategyRegistered(id, name, msg.sender, 0);
        return id;
    }

    /**
    * @dev Activates a strategy to be used in the yield farming process
    * @param strategyId The ID of the strategy to activate
    */
    function activateStrategy(uint256 strategyId) external onlyOwner strategyExists(strategyId) {
        Strategy storage strategy = strategies[strategyId];
        if (strategy.active) revert StrategyAlreadyActive();
        if (activeStrategyIds.length >= MAX_ACTIVE_STRATEGIES) revert TooManyActiveStrategies();
        
        strategy.active = true;
        activeStrategyIds.push(strategyId);
        
        emit StrategyActivated(strategyId);
    }

    /**
    * @dev Deactivates a strategy from being used in the yield farming process
    * @param strategyId The ID of the strategy to deactivate
    */
    function deactivateStrategy(uint256 strategyId) external onlyOwner strategyExists(strategyId) {
        Strategy storage strategy = strategies[strategyId];
        if (!strategy.active) revert StrategyNotActive();
        
        strategy.active = false;
        
        // Remove from active strategies array
        for (uint256 i = 0; i < activeStrategyIds.length; i++) {
            if (activeStrategyIds[i] == strategyId) {
                activeStrategyIds[i] = activeStrategyIds[activeStrategyIds.length - 1];
                activeStrategyIds.pop();
                break;
            }
        }
        
        emit StrategyDeactivated(strategyId);
    }

    // ========== EVALUATION FUNCTIONS ==========

    /**
    * @dev Evaluates the performance of a strategy
    * @param strategyId The ID of the strategy to evaluate
    * @param performanceScore The performance score (0-100)
    * @param valueGenerated The value generated by the strategy
    */
    function evaluateStrategy(
        uint256 strategyId,
        uint256 performanceScore,
        uint256 valueGenerated
    ) external onlyOwner strategyExists(strategyId) {
        if (performanceScore > 100) revert InvalidPerformanceScore();
        
        Strategy storage strategy = strategies[strategyId];
        
        // Ensure evaluation period has passed
        if (block.timestamp < strategy.lastEvaluationTime + STRATEGY_EVALUATION_PERIOD) {
            revert EvaluationTooEarly();
        }
        
        strategy.performance = performanceScore;
        strategy.totalValue += valueGenerated;
        strategy.lastEvaluationTime = block.timestamp;
        
        emit StrategyEvaluated(strategyId, performanceScore, strategy.totalValue);
    }

    /**
    * @dev Returns all strategies in a specific generation
    * @param generation The generation to query
    * @return ids Array of strategy IDs in the specified generation
    */
    function getGenerationStrategies(uint256 generation) external view returns (uint256[] memory) {
        return generationStrategies[generation];
    }

    /**
    * @dev Returns all active strategy IDs
    * @return ids Array of active strategy IDs
    */
    function getActiveStrategies() external view returns (uint256[] memory) {
        return activeStrategyIds;
    }

    // ========== EVOLUTION FUNCTIONS ==========

    /**
    * @dev Creates a new evolved strategy based on two parent strategies
    * @param name The name of the new strategy
    * @param implementation The contract address that implements the strategy
    * @param parentA The ID of the first parent strategy
    * @param parentB The ID of the second parent strategy
    * @param strategyData Custom data for the new strategy
    * @return id The ID of the newly evolved strategy
    */
    function evolveStrategy(
        string calldata name,
        address implementation,
        uint256 parentA,
        uint256 parentB,
        bytes calldata strategyData
    ) external onlyApprovedCreator strategyExists(parentA) strategyExists(parentB) returns (uint256 id) {
        // Verify parents meet evolution threshold
        if (strategies[parentA].performance < EVOLUTION_THRESHOLD || 
            strategies[parentB].performance < EVOLUTION_THRESHOLD) {
            revert InvalidParentStrategy();
        }
        
        id = nextStrategyId++;
        uint256 newGeneration = max(strategies[parentA].generation, strategies[parentB].generation) + 1;
        
        if (newGeneration > generationCount) {
            generationCount = newGeneration;
        }
        
        Strategy storage newStrategy = strategies[id];
        newStrategy.id = id;
        newStrategy.name = name;
        newStrategy.creator = msg.sender;
        newStrategy.implementation = implementation;
        newStrategy.generation = newGeneration;
        newStrategy.parentA = parentA;
        newStrategy.parentB = parentB;
        newStrategy.active = false; // Inactive until approved
        newStrategy.lastEvaluationTime = block.timestamp;
        newStrategy.strategyData = strategyData;
        
        // Add to the new generation
        generationStrategies[newGeneration].push(id);
        
        emit StrategyEvolved(id, parentA, parentB, newGeneration);
        emit StrategyRegistered(id, name, msg.sender, newGeneration);
        
        return id;
    }

    // ========== EXECUTION FUNCTIONS ==========

    /**
    * @dev Executes a specific strategy
    * @param strategyId The ID of the strategy to execute
    * @param executionData Additional data needed for execution
    * @return success Whether the execution was successful
    * @return result Data returned from the strategy execution
    */
    function executeStrategy(uint256 strategyId, bytes calldata executionData) 
        internal 
        strategyExists(strategyId) 
        returns (bool success, bytes memory result) 
    {
        Strategy storage strategy = strategies[strategyId];
        
        if (!strategy.active) revert StrategyNotActive();
        
        // Execute the strategy by calling the implementation contract
        (success, result) = strategy.implementation.call(
            abi.encodePacked(
                bytes4(keccak256("execute(bytes,bytes)")), 
                abi.encode(strategy.strategyData, executionData)
            )
        );
        
        if (success) {
            strategy.executionCount++;
            
            // Extract the value from the result (assuming the first 32 bytes represent uint256 value)
            uint256 value = 0;
            if (result.length >= 32) {
                assembly {
                    value := mload(add(result, 32))
                }
            }
            
            emit StrategyExecuted(strategyId, value, true);
        } else {
            emit StrategyExecuted(strategyId, 0, false);
        }
        
        return (success, result);
    }

    /**
    * @dev Executes the best performing strategies
    * @param count The number of top strategies to execute
    * @param executionData Additional data needed for execution
    * @return successCount The number of successfully executed strategies
    */
    function executeBestStrategies(uint256 count, bytes calldata executionData) 
        external 
        onlyOwner 
        returns (uint256 successCount) 
    {
        uint256 strategiesToExecute = min(count, activeStrategyIds.length);
        if (strategiesToExecute == 0) return 0;
        
        // Create a copy of active strategies to sort
        uint256[] memory strategiesArray = new uint256[](activeStrategyIds.length);
        for (uint256 i = 0; i < activeStrategyIds.length; i++) {
            strategiesArray[i] = activeStrategyIds[i];
        }
        
        // Sort by performance (simple bubble sort)
        for (uint256 i = 0; i < strategiesArray.length; i++) {
            for (uint256 j = i + 1; j < strategiesArray.length; j++) {
                if (strategies[strategiesArray[i]].performance < strategies[strategiesArray[j]].performance) {
                    (strategiesArray[i], strategiesArray[j]) = (strategiesArray[j], strategiesArray[i]);
                }
            }
        }
        
        // Execute top strategies
        for (uint256 i = 0; i < strategiesToExecute; i++) {
            (bool success,) = executeStrategy(strategiesArray[i], executionData);
            if (success) {
                successCount++;
            }
        }
        
        return successCount;
    }

    // ========== HELPER FUNCTIONS ==========
    /**
    * @dev Returns the minimum of two values
    */
    function min(uint256 a, uint256 b) internal pure returns (uint256) {
        return a < b ? a : b;
    }
    
    /**
    * @dev Returns the maximum of two values
    */
    function max(uint256 a, uint256 b) internal pure returns (uint256) {
        return a > b ? a : b;
    }
}

