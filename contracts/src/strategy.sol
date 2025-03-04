// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
* @title DarwinFi Sample Strategy
* @dev A simple strategy contract for testing deployment to Injective testnet
*/
contract Strategy {
    // Strategy owner
    address public owner;
    
    // Strategy parameters
    string public name;
    string public description;
    uint256 public riskLevel; // 1-10, where 10 is highest risk
    uint256 public targetReturn; // basis points (1/100 of a percent)
    bool public isActive;
    
    // Strategy statistics
    uint256 public executionCount;
    uint256 public lastExecutionTime;
    uint256 public profitLoss; // in smallest unit of the asset
    
    // Events
    event StrategyCreated(string name, address owner);
    event StrategyUpdated(string name, uint256 riskLevel, uint256 targetReturn);
    event StrategyExecuted(uint256 timestamp, int256 result);
    event StrategyActivated(bool isActive);
    event FundsWithdrawn(address to, uint256 amount);
    
    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Strategy: caller is not the owner");
        _;
    }
    
    /**
    * @dev Constructor to initialize the strategy
    * @param _name Name of the strategy
    * @param _description Brief description of the strategy
    * @param _riskLevel Risk level (1-10)
    * @param _targetReturn Target return in basis points
    */
    constructor(
        string memory _name,
        string memory _description,
        uint256 _riskLevel,
        uint256 _targetReturn
    ) {
        require(_riskLevel >= 1 && _riskLevel <= 10, "Risk level must be between 1 and 10");
        
        owner = msg.sender;
        name = _name;
        description = _description;
        riskLevel = _riskLevel;
        targetReturn = _targetReturn;
        isActive = false;
        executionCount = 0;
        
        emit StrategyCreated(_name, msg.sender);
    }
    
    /**
    * @dev Update strategy parameters
    */
    function updateStrategy(
        string memory _name,
        string memory _description,
        uint256 _riskLevel,
        uint256 _targetReturn
    ) external onlyOwner {
        require(_riskLevel >= 1 && _riskLevel <= 10, "Risk level must be between 1 and 10");
        
        name = _name;
        description = _description;
        riskLevel = _riskLevel;
        targetReturn = _targetReturn;
        
        emit StrategyUpdated(_name, _riskLevel, _targetReturn);
    }
    
    /**
    * @dev Activate or deactivate the strategy
    */
    function setActive(bool _isActive) external onlyOwner {
        isActive = _isActive;
        emit StrategyActivated(_isActive);
    }
    
    /**
    * @dev Execute the strategy (simplified for testing)
    * @return result The execution result (positive for profit, negative for loss)
    */
    function execute() external onlyOwner returns (int256 result) {
        require(isActive, "Strategy is not active");
        
        // In a real implementation, this would contain trading logic
        // For testing, we'll simulate a random result
        uint256 randomValue = uint256(keccak256(abi.encodePacked(block.timestamp, block.prevrandao))) % 100;
        bool isProfit = randomValue > 50;
        uint256 amount = (randomValue * 100) + 100; // Generate a value between 100 and 10000
        
        if (isProfit) {
            result = int256(amount);
            profitLoss += amount;
        } else {
            result = -int256(amount);
            // Only subtract if we have enough profit, otherwise cap at 0
            if (amount <= profitLoss) {
                profitLoss -= amount;
            } else {
                profitLoss = 0;
            }
        }
        
        executionCount++;
        lastExecutionTime = block.timestamp;
        
        emit StrategyExecuted(block.timestamp, result);
        return result;
    }
    
    /**
    * @dev Withdraw funds from the contract
    * @param _to Address to send funds to
    * @param _amount Amount to withdraw
    */
    function withdraw(address payable _to, uint256 _amount) external onlyOwner {
        require(address(this).balance >= _amount, "Insufficient balance");
        _to.transfer(_amount);
        emit FundsWithdrawn(_to, _amount);
    }
    
    /**
    * @dev Function to receive Ether
    */
    receive() external payable {}
    
    /**
    * @dev Fallback function
    */
    fallback() external payable {}
    
    /**
    * @dev Get strategy info
    */
    function getStrategyInfo() external view returns (
        string memory _name,
        string memory _description,
        uint256 _riskLevel,
        uint256 _targetReturn,
        bool _isActive,
        uint256 _executionCount,
        uint256 _lastExecutionTime,
        uint256 _profitLoss
    ) {
        return (
            name,
            description,
            riskLevel,
            targetReturn,
            isActive,
            executionCount,
            lastExecutionTime,
            profitLoss
        );
    }
}

