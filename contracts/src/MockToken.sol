// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
* @title MockToken
* @dev A simple ERC20 token for testing purposes
*/
contract MockToken is ERC20 {
    /**
    * @dev Constructor that gives the msg.sender all of the initial supply.
    */
    constructor() ERC20("MockToken", "MOCK") {
        // Mint 1,000,000 tokens to the deployer
        // Note: ERC20 uses 18 decimals by default, so we multiply by 10^18
        _mint(msg.sender, 1_000_000 * 10**18);
    }
}

