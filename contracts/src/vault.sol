// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";

interface IStrategy {
    function invest(uint256 amount) external;
    function withdraw(uint256 amount) external returns (uint256);
    function withdrawAll() external returns (uint256);
    function harvested() external view returns (uint256);
    function estimatedTotalAssets() external view returns (uint256);
}

/**
* @title DarwinFi Vault
* @notice This contract manages deposits and interacts with evolving strategies
* @dev The vault implements a share-based accounting system
*/
contract DarwinVault is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;
    using Math for uint256;

    // State variables
    IERC20 public token;
    IStrategy public strategy;
    
    // Fee configuration
    uint256 public performanceFee = 1000; // 10% (basis points)
    uint256 public managementFee = 200;   // 2% (basis points)
    uint256 public constant MAX_FEE = 2000; // 20% max fee (basis points)
    uint256 public constant BASIS_POINTS = 10000; // 100% in basis points
    
    // Accounting variables
    uint256 public totalShares;
    mapping(address => uint256) public userShares;
    uint256 public lastHarvestTimestamp;
    uint256 public lastTotalAssets;

    // Events
    event Deposit(address indexed user, uint256 amount, uint256 shares);
    event Withdraw(address indexed user, uint256 amount, uint256 shares);
    event StrategyUpdated(address indexed oldStrategy, address indexed newStrategy);
    event Harvested(uint256 profit, uint256 performanceFeeCollected);
    event FeeUpdated(uint256 performanceFee, uint256 managementFee);
    event EmergencyWithdraw(uint256 amount);
    
    /**
    * @param _token The ERC20 token this vault will manage
    */
    constructor(address _token) Ownable() {
        require(_token != address(0), "Token cannot be zero address");
        token = IERC20(_token);
        lastHarvestTimestamp = block.timestamp;
    }
    
    /**
    * @notice Set a new strategy for the vault
    * @param _strategy The address of the new strategy
    */
    function setStrategy(address _strategy) external onlyOwner {
        require(_strategy != address(0), "Strategy cannot be zero address");
        
        // Withdraw all from old strategy if it exists
        if (address(strategy) != address(0)) {
            strategy.withdrawAll();
        }
        
        address oldStrategy = address(strategy);
        strategy = IStrategy(_strategy);
        
        // Get current vault balance
        uint256 balance = token.balanceOf(address(this));
        if (balance > 0) {
            token.safeApprove(_strategy, 0);
            token.safeApprove(_strategy, balance);
            strategy.invest(balance);
        }
        
        emit StrategyUpdated(oldStrategy, _strategy);
    }
    
    /**
    * @notice Deposit tokens to the vault
    * @param _amount Amount of tokens to deposit
    */
    function deposit(uint256 _amount) external nonReentrant {
        require(_amount > 0, "Amount must be greater than 0");
        
        // Calculate shares before collecting fees
        uint256 shares = _calculateShares(_amount);
        require(shares > 0, "Shares must be greater than 0");
        
        // Transfer tokens from user
        token.safeTransferFrom(msg.sender, address(this), _amount);
        
        // Update user and total shares
        userShares[msg.sender] += shares;
        totalShares += shares;
        
        // Invest tokens in the strategy if available
        if (address(strategy) != address(0)) {
            token.safeApprove(address(strategy), _amount);
            strategy.invest(_amount);
        }
        
        emit Deposit(msg.sender, _amount, shares);
    }
    
    /**
    * @notice Withdraw tokens from the vault
    * @param _shares Amount of shares to burn for withdrawal
    */
    function withdraw(uint256 _shares) external nonReentrant {
        require(_shares > 0, "Shares must be greater than 0");
        require(userShares[msg.sender] >= _shares, "Insufficient shares");
        
        // Calculate the amount to withdraw based on shares
        uint256 totalAssets = estimatedTotalAssets();
        uint256 amount = _shares * totalAssets / totalShares;
        
        // Update shares
        userShares[msg.sender] -= _shares;
        totalShares -= _shares;
        
        // Withdraw from strategy if needed
        uint256 vaultBalance = token.balanceOf(address(this));
        if (amount > vaultBalance && address(strategy) != address(0)) {
            strategy.withdraw(amount - vaultBalance);
        }
        
        // Transfer tokens to user
        uint256 actualAmount = Math.min(amount, token.balanceOf(address(this)));
        token.safeTransfer(msg.sender, actualAmount);
        
        emit Withdraw(msg.sender, actualAmount, _shares);
    }
    
    /**
    * @notice Harvest investment profits from the strategy
    */
    function harvest() external nonReentrant {
        require(address(strategy) != address(0), "No strategy set");
        
        uint256 previousTotal = lastTotalAssets;
        uint256 currentTotal = estimatedTotalAssets();
        
        // Check if there's any profit
        if (currentTotal > previousTotal) {
            uint256 profit = currentTotal - previousTotal;
            uint256 performanceFeeAmount = profit * performanceFee / BASIS_POINTS;
            
            // Calculate management fee based on time elapsed
            uint256 timeElapsed = block.timestamp - lastHarvestTimestamp;
            uint256 managementFeeAmount = currentTotal * managementFee * timeElapsed / (BASIS_POINTS * 365 days);
            
            uint256 totalFeeAmount = performanceFeeAmount + managementFeeAmount;
            
            // Update accounting
            lastTotalAssets = currentTotal - totalFeeAmount;
            lastHarvestTimestamp = block.timestamp;
            
            emit Harvested(profit, totalFeeAmount);
        } else {
            // Even if no profit, update timestamp
            lastHarvestTimestamp = block.timestamp;
        }
    }
    
    /**
    * @notice Update fee parameters
    * @param _performanceFee New performance fee (in basis points)
    * @param _managementFee New management fee (in basis points)
    */
    function updateFees(uint256 _performanceFee, uint256 _managementFee) external onlyOwner {
        require(_performanceFee <= MAX_FEE, "Performance fee too high");
        require(_managementFee <= MAX_FEE, "Management fee too high");
        
        performanceFee = _performanceFee;
        managementFee = _managementFee;
        
        emit FeeUpdated(_performanceFee, _managementFee);
    }
    
    /**
    * @notice Emergency withdraw all funds from the strategy
    */
    function emergencyWithdraw() external onlyOwner {
        require(address(strategy) != address(0), "No strategy set");
        
        uint256 withdrawn = strategy.withdrawAll();
        emit EmergencyWithdraw(withdrawn);
    }
    
    /**
    * @notice Returns user's token balance based on shares
    * @param _user Address of the user
    * @return User's token balance
    */
    function balanceOf(address _user) external view returns (uint256) {
        if (totalShares == 0) return 0;
        return userShares[_user] * estimatedTotalAssets() / totalShares;
    }
    
    /**
    * @notice Estimates the total assets managed by the vault
    * @return Total assets in the vault and strategy
    */
    function estimatedTotalAssets() public view returns (uint256) {
        uint256 vaultBalance = token.balanceOf(address(this));
        if (address(strategy) == address(0)) {
            return vaultBalance;
        }
        return vaultBalance + strategy.estimatedTotalAssets();
    }
    
    /**
    * @notice Calculates shares to mint for a given deposit amount
    * @param _amount Amount of tokens to deposit
    * @return Amount of shares to mint
    */
    function _calculateShares(uint256 _amount) internal view returns (uint256) {
        // If first deposit, amount = shares
        if (totalShares == 0 || estimatedTotalAssets() == 0) {
            return _amount;
        }
        
        // Calculate shares based on current ratio
        return _amount * totalShares / estimatedTotalAssets();
    }
}

