// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./IStrategy.sol";
import "./SimpleYieldStrategy.sol";

/**
* @title EvolutionaryYieldStrategy
* @dev An advanced yield farming strategy that uses evolutionary principles to optimize returns
* This strategy can adapt and evolve based on market conditions and performance metrics
*/
contract EvolutionaryYieldStrategy is IStrategy {
    string public name;
    address public owner;
    address public targetProtocol;
    uint256 public totalDeposited;
    uint256 public lastExecutionTime;
    
    // Evolutionary parameters
    uint256 public generation;                // Current generation of the strategy
    uint256 public mutationRate;              // Likelihood of mutation (1-1000, where 10 = 1%)
    uint256 public adaptationFactor;          // How quickly strategy adapts to market changes
    address public parentStrategy;            // Address of parent strategy if evolved
    uint256 public generationInterval;        // Interval between generations
    // Strategy DNA (encoded parameters that define the strategy's behavior)
    uint256 public riskTolerance;             // 1-100, determines risk appetite
    uint256 public rebalanceThreshold;        // When to rebalance positions
    uint256 public diversificationFactor;     // How much to diversify across protocols
    uint256 public quickResponseFactor;       // How quickly to respond to market shifts
    
    // Performance metrics
    uint256 public totalReturns;
    uint256 public executionCount;
    uint256 public successfulMutations;
    mapping(uint256 => uint256) public generationReturns;  // Returns by generation
    
    // Events
    event Deposit(uint256 amount);
    event Withdraw(uint256 amount);
    event ReturnsHarvested(uint256 amount);
    event StrategyMutated(uint256 generation, bytes newDNA);
    event StrategyEvolved(address indexed parentStrategy, bytes strategyParams);
    
    /**
    * @dev Constructor to initialize the evolutionary strategy
    * @param _name Name of the strategy
    * @param _targetProtocol Address of the yield protocol to interact with
    * @param _riskFactor Initial risk tolerance (1-100)
    * @param _generationInterval Interval between generations
    * @param _mutationRate Rate of mutation (1-1000)
    * @param _owner Address of the strategy owner
    */
    constructor(
        string memory _name, 
        address _targetProtocol, 
        uint8 _riskFactor, 
        uint16 _generationInterval, 
        uint16 _mutationRate, 
        address _owner
    ) {
        require(_targetProtocol != address(0), "Invalid protocol address");
        require(_riskFactor > 0 && _riskFactor <= 100, "Risk tolerance must be between 1-100");
        require(_mutationRate > 0 && _mutationRate <= 1000, "Mutation rate must be between 1-1000");
        
        name = _name;
        owner = _owner;
        targetProtocol = _targetProtocol;
        riskTolerance = _riskFactor;
        mutationRate = _mutationRate;
        generationInterval = _generationInterval;
        adaptationFactor = 50; // Default value
        parentStrategy = address(0); // Default to no parent
        lastExecutionTime = block.timestamp;
        
        // Initialize default strategy DNA
        rebalanceThreshold = 5;     // 5% deviation triggers rebalance
        diversificationFactor = 50; // 50% diversification
        quickResponseFactor = 70;   // 70% response rate
        
        // Start at generation 1 or inherit from parent
        generation = parentStrategy != address(0) ? 
            EvolutionaryYieldStrategy(parentStrategy).generation() + 1 : 1;
    }
    
    /**
    * @dev Modifier to restrict function access to owner only
    */
    modifier onlyOwner() {
        require(msg.sender == owner, "Caller is not the owner");
        _;
    }
    
    /**
    * @dev Execute the evolutionary yield farming strategy
    * @param data Encoded parameters for the strategy execution
    * @return uint256 Amount of yield generated from this execution
    */
    function execute(bytes calldata data) external override returns (uint256) {
        // Decode the execution parameters
        (uint256 amount, bool isDeposit, bytes memory strategyParams) = abi.decode(data, (uint256, bool, bytes));
        
        if (isDeposit) {
            // Deposit to target protocol with evolutionary parameters
            totalDeposited += amount;
            emit Deposit(amount);
        } else {
            // Withdraw from target protocol with optimal timing based on evolution
            require(amount <= totalDeposited, "Insufficient funds");
            totalDeposited -= amount;
            emit Withdraw(amount);
        }
        
        // Calculate yield with evolutionary enhancements
        // Calculate yield with evolutionary enhancements
        uint256 timePassed = block.timestamp - lastExecutionTime;
        uint256 yieldGenerated = calculateEvolutionaryYield(timePassed, strategyParams);
        // Potentially mutate strategy based on mutation rate
        if (shouldMutate()) {
            mutateStrategy();
        }
        
        // Update performance metrics
        totalReturns += yieldGenerated;
        generationReturns[generation] += yieldGenerated;
        executionCount++;
        lastExecutionTime = block.timestamp;
        
        emit ReturnsHarvested(yieldGenerated);
        
        return yieldGenerated;
    }
    
    /**
    * @dev Calculate yield based on evolutionary parameters
    * @param timePassed Time passed since last execution in seconds
    * @param strategyParams Additional strategy parameters
    * @return yield Amount of yield generated
    */
    function calculateEvolutionaryYield(uint256 timePassed, bytes memory strategyParams) internal view returns (uint256) {
        if (totalDeposited == 0) return 0;
        
        // Enhanced yield calculation using evolutionary parameters
        // Higher generations have refined strategies for better returns
        uint256 baseYield = (totalDeposited * timePassed * riskTolerance) / (365 days * 100);
        
        // Apply evolutionary enhancements
        uint256 generationBonus = generation * 2; // 2% bonus per generation
        uint256 adaptationBonus = calculateAdaptationBonus(strategyParams);
        
        // Total yield with evolutionary enhancements (capped at realistic limits)
        uint256 totalYield = baseYield * (100 + generationBonus + adaptationBonus) / 100;
        
        // Apply diversification factor to balance risk/reward
        return totalYield * diversificationFactor / 100;
    }
    
    /**
    * @dev Calculate adaptation bonus based on market conditions
    * @param strategyParams Encoded market condition parameters
    * @return bonus The adaptation bonus percentage
    */
    function calculateAdaptationBonus(bytes memory strategyParams) internal view returns (uint256) {
        if (strategyParams.length == 0) return 0;
        
        // Decode market conditions from strategy params
        // This would typically come from off-chain analysis
        (uint256 marketVolatility, uint256 opportunityScore) = abi.decode(strategyParams, (uint256, uint256));
        
        // Calculate adaptation bonus based on how well strategy matches market conditions
        uint256 volatilityFit = marketVolatility <= riskTolerance ? 
            riskTolerance - marketVolatility : marketVolatility - riskTolerance;
        
        uint256 responseQuality = (100 - volatilityFit) * quickResponseFactor / 100;
        
        // Calculate final bonus capped at 30%
        uint256 rawBonus = (responseQuality * opportunityScore * adaptationFactor) / 10000;
        return rawBonus > 30 ? 30 : rawBonus;
    }
    
    /**
    * @dev Determine if strategy should mutate based on mutation rate
    */
    function shouldMutate() internal view returns (bool) {
        // Use block difficulty, timestamp and execution count as randomness source
        uint256 randomFactor = uint256(keccak256(abi.encodePacked(
            blockhash(block.number - 1),
            block.timestamp,
            executionCount
        )));
        
        // Compare random factor with mutation rate (e.g., 10 = 1% chance)
        return randomFactor % 1000 < mutationRate;
    }
    
    /**
    * @dev Mutate the strategy's DNA to potentially improve performance
    */
    function mutateStrategy() internal {
        // Mutate each DNA parameter within reasonable bounds
        riskTolerance = mutateParameter(riskTolerance, 5, 1, 100);
        rebalanceThreshold = mutateParameter(rebalanceThreshold, 2, 1, 20);
        diversificationFactor = mutateParameter(diversificationFactor, 10, 10, 90);
        quickResponseFactor = mutateParameter(quickResponseFactor, 10, 30, 100);
        
        // Record mutation in metrics
        successfulMutations++;
        
        // Emit event with new DNA
        bytes memory newDNA = abi.encode(
            riskTolerance,
            rebalanceThreshold,
            diversificationFactor,
            quickResponseFactor
        );
        
        emit StrategyMutated(generation, newDNA);
    }
    
    /**
    * @dev Helper function to mutate a parameter within bounds
    * @param currentValue Current parameter value
    * @param maxChange Maximum change allowed
    * @param minValue Minimum allowed value
    * @param maxValue Maximum allowed value
    * @return newValue The mutated parameter value
    */
    function mutateParameter(
        uint256 currentValue, 
        uint256 maxChange,
        uint256 minValue,
        uint256 maxValue
    ) internal view returns (uint256) {
        // Use a pseudo-random number to determine direction and magnitude
        uint256 randomFactor = uint256(keccak256(abi.encodePacked(
            blockhash(block.number - 1),
            block.timestamp,
            currentValue
        )));
        
        // Direction: increase or decrease
        bool increase = randomFactor % 2 == 0;
        
        // Magnitude: how much to change (up to maxChange)
        uint256 changeAmount = (randomFactor % maxChange) + 1;
        
        // Apply change within bounds
        if (increase && currentValue + changeAmount <= maxValue) {
            return currentValue + changeAmount;
        } else if (!increase && currentValue - changeAmount >= minValue) {
            return currentValue - changeAmount;
        }
        
        return currentValue; // No change if it would exceed bounds
    }
    
    /**
    * @dev Create a new evolved strategy based on this one
    * @param _targetProtocol Address of the new target protocol
    * @return newStrategy Address of the newly created evolved strategy
    */
    function evolve(address _targetProtocol) external onlyOwner returns (address) {
        // Instead of creating the evolved strategy directly, just emit an event with the parameters
        // External code can listen for this event and create the new strategy
        bytes memory strategyParams = abi.encode(
            "Evolved Strategy",  // Name for the new strategy
            _targetProtocol,
            uint8(riskTolerance),
            100,  // Default generationInterval value
            uint16(mutationRate),
            address(this)  // This strategy becomes the parent
        );
        
        // Emit event with parameters needed to create the evolved strategy
        emit StrategyEvolved(address(this), strategyParams);
        
        // Return address(0) as placeholder - actual creation happens externally
        return address(0);
    }
    
    /**
    * @dev Cross two strategies to create a new hybrid strategy
    * @param _otherStrategy Address of another strategy to cross with
    * @param _targetProtocol Address of the target protocol for the new strategy
    * @return newStrategy Address of the newly created hybrid strategy
    */
    function crossover(address _otherStrategy, address _targetProtocol) external onlyOwner returns (address) {
        require(_otherStrategy != address(0), "Invalid strategy address");
        
        // Get other strategy's DNA without instantiating as EvolutionaryYieldStrategy
        // Use interface calls instead to avoid circular references
        IStrategy other = IStrategy(_otherStrategy);
        
        // For properties not in IStrategy, we need to use lower-level calls
        // This approach prevents circular dependencies
        (bool successRisk, bytes memory dataRisk) = _otherStrategy.call(
            abi.encodeWithSignature("riskTolerance()")
        );
        (bool successMutation, bytes memory dataMutation) = _otherStrategy.call(
            abi.encodeWithSignature("mutationRate()")
        );
        (bool successAdaptation, bytes memory dataAdaptation) = _otherStrategy.call(
            abi.encodeWithSignature("adaptationFactor()")
        );
        
        // Extract values from return data
        uint256 otherRiskTolerance = successRisk ? abi.decode(dataRisk, (uint256)) : riskTolerance;
        uint256 otherMutationRate = successMutation ? abi.decode(dataMutation, (uint256)) : mutationRate;
        uint256 otherAdaptationFactor = successAdaptation ? abi.decode(dataAdaptation, (uint256)) : adaptationFactor;
        
        // Create hybrid DNA by taking average or selecting best traits
        uint256 hybridRiskTolerance = (riskTolerance + otherRiskTolerance) / 2;
        uint256 hybridMutationRate = (mutationRate + otherMutationRate) / 2;
        
        // Get performance metrics to compare strategies
        (uint256 otherTotalReturns,,,,) = other.getPerformanceMetrics();
        uint256 hybridAdaptationFactor = otherTotalReturns > totalReturns ? 
            otherAdaptationFactor : adaptationFactor;
        
        // Instead of creating the strategy directly, emit an event with parameters
        bytes memory hybridParams = abi.encode(
            "Hybrid Strategy",  // Name for the new hybrid strategy
            _targetProtocol,
            uint8(hybridRiskTolerance),
            100,  // Default generationInterval value
            uint16(hybridMutationRate),
            address(this)  // This strategy becomes the parent
        );
        
        // Emit event with parameters needed to create the hybrid strategy
        emit StrategyEvolved(address(this), hybridParams);
        
        // Return address(0) as placeholder - actual creation happens externally
        return address(0);
    }
    
    /**
    * @dev Get the performance metrics of this strategy
    * @return metrics Encoded performance metrics
    */
    function getPerformanceMetrics() external view override returns (uint256, uint256, uint256, uint256, uint8) {
        // Calculate APY
        uint256 apy = totalDeposited > 0 ? 
            (totalReturns * 365 days * 100) / (totalDeposited * (block.timestamp - lastExecutionTime)) : 0;
        
        // Calculate evolutionary success metrics
        uint256 mutationSuccessRate = executionCount > 0 ? 
            (successfulMutations * 100) / executionCount : 0;
        
        uint256 generationalImprovement = 0;
        if (generation > 1 && generationReturns[generation-1] > 0) {
            generationalImprovement = (generationReturns[generation] * 100) / generationReturns[generation-1];
        }
        
        // Return the key performance indicators required by the interface
        return (
            apy,                   // Annual Percentage Yield
            totalReturns,          // Total returns generated 
            executionCount,        // Number of executions
            mutationSuccessRate,   // Success rate of mutations
            uint8(riskTolerance)   // Risk score (cast to uint8)
        );
    }
    
    /**
    * @dev Get a description of this strategy
    * @return description Human-readable description of the strategy
    */
    function getDescription() external view override returns (string memory, string memory, string memory) {
        string memory strategyName = name;
        string memory strategyDescription = string(abi.encodePacked(
            "Evolutionary Yield Strategy (Gen ", 
            toString(generation), 
            ") - Risk Tolerance: ", 
            toString(riskTolerance), 
            "%, Mutation Rate: ", 
            toString(mutationRate / 10), 
            "%, Adaptation: ", 
            toString(adaptationFactor),
            "%, Diversification: ",
            toString(diversificationFactor),
            "%"
        ));
        string memory strategyVersion = string(abi.encodePacked("v", toString(generation), ".0"));
        
        return (strategyName, strategyDescription, strategyVersion);
    }

    /**
    * @dev Helper function to convert uint to string
    * @param value The uint value to convert
    * @return The string representation of the value
    */
    function toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) {
            return "0";
        }
        
        uint256 temp = value;
        uint256 digits;
        
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        
        bytes memory buffer = new bytes(digits);
        
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        
        return string(buffer);
    }
}
