// backend/contractInteraction.js

require('dotenv').config();
const { ethers } = require('ethers');
const StablePayABI = require('./StablePayABI.json');


// Load environment variables
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const RPC_URL = process.env.RPC_URL;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

async function sendPayment(recipient, amount) {
    try {
        // Connect to the network
        const provider = new ethers.JsonRpcProvider(RPC_URL);

        // Wallet signing (sender's private key)
        const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

        // Connect to the StablePay contract
        const contract = new ethers.Contract(CONTRACT_ADDRESS, StablePayABI, wallet);

        // Interact with the smart contract's function (example: transfer)
        const tx = await contract.transfer(recipient, ethers.parseUnits(amount, 18)); // Amount in wei (assuming 18 decimals)

        console.log(`Transaction submitted: ${tx.hash}`);
        
        // Wait for transaction confirmation
        const receipt = await tx.wait();
        console.log(`Transaction confirmed: ${receipt.transactionHash}`);

        return receipt;
    } catch (error) {
        console.error("Error sending payment:", error);
    }
}

// Export for use in your backend
module.exports = {
    sendPayment,
};
