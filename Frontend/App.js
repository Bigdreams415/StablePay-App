// Initialize AOS (Animate On Scroll)
AOS.init({
    duration: 800, // Animation duration
    easing: 'ease-in-out', // Animation easing
    once: true, // Whether animation should happen only once
  });
  
  // Toggle Mobile Navigation Menu
  const menuToggle = document.createElement('div');
  menuToggle.classList.add('menu-toggle');
  menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
  document.querySelector('.navbar .container').appendChild(menuToggle);
  
  menuToggle.addEventListener('click', () => {
    document.querySelector('.navbar-menu').classList.toggle('active');
  });
  
  // Copy Wallet Address
  function copyWalletAddress() {
    const walletAddress = document.getElementById('walletAddress');
    if (!walletAddress) {
      alert('Wallet address element not found.');
      return;
    }
  
    walletAddress.select();
    walletAddress.setSelectionRange(0, 99999); // For mobile devices
  
    document.execCommand('copy');
    alert('Wallet address copied to clipboard!');
  }
  
  // Link New Wallet (Placeholder Function)
  function linkNewWallet() {
    alert('Link New Wallet functionality is not implemented yet.');
  }
  
  // Remove Linked Wallet
  document.querySelectorAll('.btn-remove').forEach(button => {
    button.addEventListener('click', () => {
      const walletItem = button.parentElement;
      const walletName = walletItem.textContent.replace('Remove', '').trim();
      if (confirm(`Are you sure you want to remove ${walletName}?`)) {
        walletItem.remove();
      }
    });
  });
  
  // Validate Email Function
  function validateEmail(email) {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
  }
  
  // Profile Form Submission
  document.getElementById('profileForm')?.addEventListener('submit', async function(event) {
    event.preventDefault();
    const name = document.getElementById('profileName').value.trim();
    const email = document.getElementById('profileEmail').value.trim();
    const password = document.getElementById('profilePassword').value.trim();
  
    // Basic Validation
    if (name === '') {
      alert('Please enter your full name.');
      return;
    }
  
    if (!validateEmail(email)) {
      alert('Please enter a valid email address.');
      return;
    }
  
    if (password && password.length < 6) {
      alert('Password must be at least 6 characters long.');
      return;
    }
  
    // Update Profile
    await updateProfile(name, email, password);
  });
  
 
 
  // Function to generate QR Code
  function generateQRCode(address) {
    const qrCodeContainer = document.getElementById('qrcode');
    if (!qrCodeContainer) {
      console.error('QR Code container not found.');
      return;
    }
    // Clear any existing QR Code
    qrCodeContainer.innerHTML = '';
    // Generate new QR Code
    new QRCode(qrCodeContainer, {
      text: address,
      width: 128,
      height: 128,
    });
  }
  
  // Function to update profile (Simulated)
  async function updateProfile(name, email, password) {
    // Placeholder: Implement actual profile update logic with backend
    alert(`Profile updated:\nName: ${name}\nEmail: ${email}\nPassword: ${password ? 'Changed' : 'Not Changed'}`);
  }
  



// Wallet Connection Function
async function connectWallet() {
  const connectWalletButton = document.getElementById('connectWallet');

  if (typeof window.ethereum === 'undefined') {
      alert('Please install MetaMask to use this feature.');
      return;
  }

  try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      console.log('Accounts connected:', accounts);
      
      // Update UI to show connected state
      const walletAddressDisplay = document.getElementById('walletAddressDisplay');
      if (walletAddressDisplay) {
          walletAddressDisplay.textContent = `Wallet Address: ${accounts[0]}`;
      }

      // Disable the button after connecting
      connectWalletButton.disabled = true;
      connectWalletButton.textContent = 'Wallet Connected';
      
      // Store the wallet address in localStorage
      localStorage.setItem('connectedWallet', accounts[0]);
  } catch (error) {
      console.error('Error connecting to wallet:', error);
      alert('Could not connect to wallet. Please try again.');
  }
}


document.addEventListener('DOMContentLoaded', () => {
  // Check if a wallet address is saved in localStorage
  const savedWalletAddress = localStorage.getItem('connectedWallet');
  const connectWalletButton = document.getElementById('connectWallet');
  const walletAddressDisplay = document.getElementById('walletAddressDisplay');

  if (savedWalletAddress) {
      // Update the UI to show the connected wallet address
      walletAddressDisplay.textContent = `Wallet Address: ${savedWalletAddress}`;
      connectWalletButton.disabled = true;
      connectWalletButton.textContent = 'Wallet Connected';
  }

  connectWalletButton.addEventListener('click', connectWallet);
});


function disconnectWallet() {
  localStorage.removeItem('connectedWallet');
  const connectWalletButton = document.getElementById('connectWallet');
  const walletAddressDisplay = document.getElementById('walletAddressDisplay');

  // Reset UI
  walletAddressDisplay.textContent = 'Wallet Address: Not Connected';
  connectWalletButton.disabled = false;
  connectWalletButton.textContent = 'Connect Wallet';
}

// You can call disconnectWallet when needed (e.g., on a button click)

//Fetching wallet account Balance

async function fetchAccountBalance() {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();

  try {
    const address = await signer.getAddress(); // Get the connected wallet address
    console.log(`Connected address: ${address}`); // Log the address
    const balanceInWei = await provider.getBalance(address); // Fetch balance in wei
    const balanceInEth = ethers.utils.formatEther(balanceInWei); // Convert to Ether

    // Check if balance is fetched correctly
    console.log(`Balance in Wei: ${balanceInWei.toString()}`); // Log balance in Wei
    console.log(`Balance in ETH: ${balanceInEth}`); // Log balance in ETH

    // Update balance display
    document.getElementById('balance').innerText = `$${parseFloat(balanceInEth).toFixed(2)}`;
  } catch (error) {
    console.error("Error fetching balance:", error);
  }
}



// Immediately Invoked Function to check wallet connection and fetch balance
(async () => {
  if (typeof window.ethereum !== 'undefined') {
    // Create a provider and check if the user is already connected
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const accounts = await provider.listAccounts();

    if (accounts.length > 0) {
      // User is already connected
      const address = accounts[0];
      console.log(`Wallet already connected: ${address}`);
      
      // Update UI
      document.getElementById('walletAddressDisplay').innerText = `Wallet Address: ${address}`;
      document.getElementById('connectWallet').innerText = 'Wallet Connected';
      document.getElementById('connectWallet').disabled = true;

      // Fetch balance automatically
      await fetchAccountBalance();
    } else {
      console.log("No wallet connected, waiting for user to connect.");
    }
  } else {
    console.log("Please install MetaMask!");
  }
})();

// Function to connect wallet and fetch balance
async function connectWallet() {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  try {
    await provider.send("eth_requestAccounts", []); // Request wallet connection
    const signer = provider.getSigner();
    const address = await signer.getAddress();
    
    // Update UI
    document.getElementById('walletAddressDisplay').innerText = `Wallet Address: ${address}`;
    document.getElementById('connectWallet').innerText = 'Wallet Connected';
    document.getElementById('connectWallet').disabled = true;

    // Fetch balance after connection
    await fetchAccountBalance();
  } catch (error) {
    console.error("Error connecting to wallet:", error);
  }
}


// Send payment functionality and interaction with smart contracts

// import { ethers } from 'ethers';  
// import stablePayABI from './abis/StablePay.json'; // ABI for your StablePay contract
// import erc20ABI from './abis/ERC20.json'; // ABI for the ERC20 token contract (this can vary based on the token)



// const sendPaymentForm = document.getElementById('sendPaymentForm');

// sendPaymentForm.addEventListener('submit', async (event) => {
//     event.preventDefault(); // Prevent the default form submission

//     const tokenAddress = document.getElementById('currency').value; // Get the token address from the selected currency
//     const recipientAddress = document.getElementById('recipient').value;
//     const amount = ethers.utils.parseUnits(document.getElementById('amount').value, 18); // Adjust decimals as necessary

//     try {
//         // Create a contract instance for the StablePay contract
//         const contract = new ethers.Contract(stablePayAddress, stablePayABI, signer);

//         // Approve the contract to spend tokens
//         const tokenContract = new ethers.Contract(tokenAddress, erc20ABI, signer);
//         const approvalTx = await tokenContract.approve(stablePayAddress, amount);
//         await approvalTx.wait();

//         // Now call the pay function
//         const paymentTx = await contract.pay(tokenAddress, recipientAddress, amount);
//         await paymentTx.wait();

//         console.log('Payment sent successfully!');
//         // Optionally update the UI or fetch new balances here
//     } catch (error) {
//         console.error('Error sending payment:', error);
//         // Handle the error, such as showing an alert or updating the UI
//     }
// });


// Fetch the StablePay ABI
// async function getStablePayABI() {
//   const response = await fetch('Frontend/src/abis/StablePay.json');
//   const stablePayABI = await response.json();
//   return stablePayABI;
// }

// Fetch the ERC20 ABI
// async function getERC20ABI() {
//   const response = await fetch('/src/abis/ERC20ABI.json');
//   const erc20ABI = await response.json();
//   return erc20ABI;
// }

const stablePayAddress = '0x0773a806033AB6e3E75Ca27A80E3340D8c131318'; // Replace with your StablePay contract address

const provider = new ethers.providers.JsonRpcProvider('https://sepolia.base.org/'); // Use the correct RPC URL for Base Sepolia
const signer = provider.getSigner(); // Get the signer from the provider
// const stablePayABI = await fetch('./abis/StablePay.json').then(response => response.json());
// const erc20ABI = await fetch('./abis/ERC20ABI.json').then(response => response.json());


async function initializePaymentForm() {
  const provider = new ethers.providers.JsonRpcProvider('https://sepolia.base.org/'); // Ensure this URL is correct
  const signer = provider.getSigner(); // Get the signer from the provider

  const stablePayABI = await fetch('./abis/StablePay.json').then(response => response.json());
  const erc20ABI = await fetch('./abis/ERC20ABI.json').then(response => response.json());

  const sendPaymentForm = document.getElementById('sendPaymentForm');

  sendPaymentForm.addEventListener('submit', async (event) => {
      event.preventDefault(); // Prevent the default form submission

      const tokenAddress = document.getElementById('currency').value; // Get the token address from the selected currency
      const recipientAddress = document.getElementById('recipient').value;
      const amount = ethers.utils.parseUnits(document.getElementById('amount').value, 18); // Adjust decimals as necessary

      try {
          // Create a contract instance for the StablePay contract
          const contract = new ethers.Contract(stablePayAddress, stablePayABI, signer);

          // Approve the contract to spend tokens
          const tokenContract = new ethers.Contract(tokenAddress, erc20ABI, signer);
          const approvalTx = await tokenContract.approve(stablePayAddress, amount);
          await approvalTx.wait();

          // Now call the pay function
          const paymentTx = await contract.pay(tokenAddress, recipientAddress, amount);
          await paymentTx.wait();

          console.log('Payment sent successfully!');
          // Optionally update the UI or fetch new balances here
      } catch (error) {
          console.error('Error sending payment:', error);
          // Handle the error, such as showing an alert or updating the UI
      }
  });
}

// Call the function to initialize the form
initializePaymentForm();
