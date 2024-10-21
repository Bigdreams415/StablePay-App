// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract StablePay is Ownable {
    // User balances for each token
    mapping(address => mapping(address => uint256)) public userBalances; // userBalances[user][token] = amount
    
    // Transaction fee in basis points (e.g., 100 = 1%)
    uint256 public transactionFeeBasisPoints = 100; // Set a default fee of 1%

    event PaymentMade(address indexed from, address indexed to, uint256 amount, address token);
    event Withdrawal(address indexed token, uint256 amount, address indexed to);
    event FeeUpdated(uint256 newFee);

    // Constructor to set the deployer as the initial owner
    constructor() Ownable(msg.sender) {} // Pass msg.sender to Ownable constructor

    // Function to make a payment in stablecoins
    function pay(address _token, address _to, uint256 _amount) external {
        IERC20 token = IERC20(_token);

        // Check if the user has approved enough tokens
        require(token.allowance(msg.sender, address(this)) >= _amount, "Insufficient allowance. Please approve the contract.");

        // Calculate the fee
        uint256 fee = (_amount * transactionFeeBasisPoints) / 10000;
        uint256 amountAfterFee = _amount - fee;

        // Transfer the stablecoin tokens from sender to recipient
        require(token.transferFrom(msg.sender, _to, amountAfterFee), "Payment failed!");

        // Transfer the fee to the owner
        require(token.transferFrom(msg.sender, owner(), fee), "Fee transfer failed!");

        // Update user balances
        userBalances[msg.sender][_token] += amountAfterFee;
        userBalances[_to][_token] -= amountAfterFee;

        emit PaymentMade(msg.sender, _to, amountAfterFee, _token);
    }

    // Function to make a payment in Ether
    function payInEther(address _to) external payable {
        require(msg.value > 0, "Must send Ether");

        // Transfer the Ether to the recipient
        payable(_to).transfer(msg.value);

        // Emit an event for the ETH payment
        emit PaymentMade(msg.sender, _to, msg.value, address(0)); // Use address(0) to indicate ETH
    }

    // Function to withdraw funds in stablecoins (only owner)
    function withdraw(address _token, uint256 _amount) external onlyOwner {
        IERC20 token = IERC20(_token);
        require(token.transfer(msg.sender, _amount), "Withdrawal failed!");
        emit Withdrawal(_token, _amount, msg.sender);
    }

    // Function to update transaction fees
    function setTransactionFee(uint256 _newFee) external onlyOwner {
        transactionFeeBasisPoints = _newFee;
        emit FeeUpdated(_newFee);
    }

    // Function to check the contract's token balance
    function balanceOf(address _user, address _token) external view returns (uint256) {
        return userBalances[_user][_token];
    }
}
