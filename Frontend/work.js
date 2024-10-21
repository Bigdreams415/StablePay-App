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
  
  // Send Payment Form Submission
  document.getElementById('sendPaymentForm')?.addEventListener('submit', async function(event) {
    event.preventDefault();
    const recipient = document.getElementById('recipient').value.trim();
    const amount = document.getElementById('amount').value.trim();
    const currency = document.getElementById('currency').value.trim();
  
    // Basic Validation
    if (!ethers.utils.isAddress(recipient)) {
      alert('Invalid recipient address.');
      return;
    }
  
    if (isNaN(amount) || parseFloat(amount) <= 0) {
      alert('Amount must be a positive number.');
      return;
    }
  
    if (!currency) {
      alert('Please select a currency.');
      return;
    }
  
    // Send Payment
    await sendPayment(recipient, amount, currency);
  });
  
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
  
  // Wallet Connection Using Ethers.js
  const connectWalletButton = document.getElementById('connectWallet');
  const walletAddressDisplay = document.getElementById('walletAddressDisplay');
  const balanceDisplay = document.getElementById('balance');
  
  // ERC-20 Token Contracts (Add more as needed)
  const tokenContracts = {
    'USDC': '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC on Ethereum Mainnet
    'USDT': '0xdAC17F958D2ee523a2206206994597C13D831ec7', // USDT on Ethereum Mainnet
    // Add other tokens if needed
  };
  
  // ABI for ERC-20 Token
  const ERC20_ABI = [
    "function transfer(address to, uint amount) returns (bool)",
    "function decimals() view returns (uint8)",
  ];
  
  // Function to fetch exchange rates
  async function fetchExchangeRates() {
    try {
      const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum,bitcoin,usd-coin,tether&vs_currencies=usd');
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching exchange rates:', error);
      return null;
    }
  }
  
  // Function to update balance in USD
  async function updateBalanceInUSD(cryptoBalance, cryptoType) {
    const rates = await fetchExchangeRates();
    if (rates) {
      let usdRate = 0;
      switch (cryptoType) {
        case 'ETH':
          usdRate = rates.ethereum.usd;
          break;
        case 'BTC':
          usdRate = rates.bitcoin.usd;
          break;
        case 'USDC':
          usdRate = rates['usd-coin'].usd;
          break;
        case 'USDT':
          usdRate = rates.tether.usd;
          break;
        default:
          usdRate = 1;
      }
      const usdValue = cryptoBalance * usdRate;
      return `$${usdValue.toFixed(2)} USD`;
    } else {
      return '$0.00 USD';
    }
  }
  
  // Function to send ETH or ERC-20 tokens
  async function sendPayment(recipient, amount, currency) {
    if (typeof window.ethereum === 'undefined') {
      alert('MetaMask is not installed.');
      return;
    }
  
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
  
    try {
      if (currency === 'ETH') {
        // Sending ETH
        const tx = await signer.sendTransaction({
          to: recipient,
          value: ethers.utils.parseEther(amount),
        });
        await tx.wait();
        alert('ETH Sent Successfully!');
        // Update Transaction History
        await displayTransactionHistory(await signer.getAddress());
      } else if (currency === 'BTC') {
        alert('Bitcoin (BTC) transactions are not supported in this application.');
        return;
      } else {
        // Sending ERC-20 Tokens
        const tokenAddress = tokenContracts[currency];
        if (!tokenAddress) {
          alert('Unsupported token.');
          return;
        }
        const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, signer);
        const decimals = await tokenContract.decimals();
        const parsedAmount = ethers.utils.parseUnits(amount, decimals);
        const tx = await tokenContract.transfer(recipient, parsedAmount);
        await tx.wait();
        alert(`${currency} Sent Successfully!`);
        // Update Transaction History
        await displayTransactionHistory(await signer.getAddress());
      }
    } catch (error) {
      console.error(error);
      if (error.code === -32603) {
        // Internal JSON-RPC error
        const insufficientFundsMatch = error.message.match(/insufficient funds for.*want (\d+)/);
        if (insufficientFundsMatch) {
          const requiredAmountWei = insufficientFundsMatch[1];
          const requiredAmountEth = ethers.utils.formatEther(requiredAmountWei);
          alert(`Transaction failed: Insufficient funds. You need at least ${requiredAmountEth} ETH to complete this transaction.`);
        } else {
          alert('Transaction failed due to an internal error. Please try again.');
        }
      } else if (error.code === 4001) {
        // User rejected transaction
        alert('Transaction rejected by the user.');
      } else {
        alert('Transaction Failed! Please check the console for more details.');
      }
    }
  }
  
  // Function to fetch transaction history
  async function fetchTransactionHistory(address) {
    const ETHERSCAN_API_KEY = 'FT6K5CB51FUQ2NBSV5E6GX7XMBXDBID6XH'; // **Important:** Secure this key in a backend
    try {
      const response = await fetch(`https://api.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=desc&apikey=${ETHERSCAN_API_KEY}`);
      const data = await response.json();
      if (data.status === "1") {
        return data.result;
      } else {
        console.error('Error fetching transactions:', data.message);
        return [];
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      return [];
    }
  }
  
  // Function to display transaction history
  async function displayTransactionHistory(address) {
    const transactions = await fetchTransactionHistory(address);
    const transactionsTableBody = document.querySelector('.transactions-table tbody');
    if (!transactionsTableBody) {
      console.error('Transactions table body not found.');
      return;
    }
    transactionsTableBody.innerHTML = ''; // Clear existing rows
  
    transactions.slice(0, 10).forEach(tx => { // Limit to last 10 transactions
      const row = document.createElement('tr');
  
      // Date
      const date = new Date(tx.timeStamp * 1000).toLocaleDateString();
      const dateCell = document.createElement('td');
      dateCell.textContent = date;
      row.appendChild(dateCell);
  
      // Type
      const type = tx.from.toLowerCase() === address.toLowerCase() ? 'Sent' : 'Received';
      const typeCell = document.createElement('td');
      typeCell.textContent = type;
      row.appendChild(typeCell);
  
      // Amount
      const amount = type === 'Sent' ? `-${ethers.utils.formatEther(tx.value)}` : ethers.utils.formatEther(tx.value);
      const amountCell = document.createElement('td');
      amountCell.textContent = amount;
      row.appendChild(amountCell);
  
      // Currency
      const currency = tx.tokenSymbol ? tx.tokenSymbol : 'ETH'; // Handle ERC-20 tokens if available
      const currencyCell = document.createElement('td');
      currencyCell.textContent = currency;
      row.appendChild(currencyCell);
  
      // Status
      const status = tx.confirmations > 0 ? 'Completed' : 'Pending';
      const statusCell = document.createElement('td');
      statusCell.textContent = status;
      statusCell.classList.add(status === 'Completed' ? 'status-completed' : 'status-pending');
      row.appendChild(statusCell);
  
      transactionsTableBody.appendChild(row);
    });
  
    // Optionally, prepare and render a chart here if you have a chart element
    const chartData = prepareChartData(transactions);
    renderChart(chartData.labels, chartData.data);
  }
  
  // Function to prepare data for the chart
  function prepareChartData(transactions) {
    const monthlyData = {};
  
    transactions.forEach(tx => {
      const date = new Date(tx.timeStamp * 1000);
      const month = `${date.getMonth() + 1}/${date.getFullYear()}`;
  
      if (!monthlyData[month]) {
        monthlyData[month] = 0;
      }
  
      // Assuming all transactions are in ETH for simplicity
      const amount = ethers.utils.formatEther(tx.value);
      monthlyData[month] += parseFloat(amount);
    });
  
    // Sort months
    const sortedMonths = Object.keys(monthlyData).sort((a, b) => {
      const [monthA, yearA] = a.split('/').map(Number);
      const [monthB, yearB] = b.split('/').map(Number);
      return yearA - yearB || monthA - monthB;
    });
  
    const labels = sortedMonths;
    const data = sortedMonths.map(month => monthlyData[month].toFixed(2));
  
    return { labels, data };
  }
  
  // Function to render the chart
  function renderChart(labels, data) {
    const chartElement = document.getElementById('transactionChart');
    if (!chartElement) {
      console.error('Chart element not found.');
      return;
    }
    const ctx = chartElement.getContext('2d');
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Transaction Volume (ETH)',
          data: data,
          backgroundColor: '#007bff',
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
          }
        }
      }
    });
  }
  
  // Consolidated Wallet Connection Function
  async function connectWallet() {
    if (typeof window.ethereum !== 'undefined') {
      try {
        // Request account access if needed
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const account = accounts[0];
        walletAddressDisplay.textContent = `Wallet Address: ${account}`;
  
        // Create an Ethers provider
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
  
        // Fetch and display balance
        const balance = await provider.getBalance(account);
        const balanceInEth = ethers.utils.formatEther(balance);
        const formattedBalance = `$${parseFloat(balanceInEth).toFixed(2)}`;
        const usdBalance = await updateBalanceInUSD(parseFloat(balanceInEth), 'ETH');
        balanceDisplay.textContent = `${formattedBalance} ETH (${usdBalance})`;
  
        // Fetch and display transaction history
        await displayTransactionHistory(account);
  
        // Generate QR Code for Receiving Payments
        generateQRCode(account);
  
        // Listen for account changes
        window.ethereum.on('accountsChanged', async (accounts) => {
          if (accounts.length > 0) {
            walletAddressDisplay.textContent = `Wallet Address: ${accounts[0]}`;
            // Update balance
            const newBalance = await provider.getBalance(accounts[0]);
            const newBalanceInEth = ethers.utils.formatEther(newBalance);
            const newFormattedBalance = `$${parseFloat(newBalanceInEth).toFixed(2)}`;
            const newUsdBalance = await updateBalanceInUSD(parseFloat(newBalanceInEth), 'ETH');
            balanceDisplay.textContent = `${newFormattedBalance} ETH (${newUsdBalance})`;
  
            // Update transaction history
            await displayTransactionHistory(accounts[0]);
  
            // Regenerate QR Code
            generateQRCode(accounts[0]);
          } else {
            walletAddressDisplay.textContent = 'Wallet Address: Not Connected';
            balanceDisplay.textContent = '$0.00';
            const transactionsTableBody = document.querySelector('.transactions-table tbody');
            if (transactionsTableBody) {
              transactionsTableBody.innerHTML = '';
            }
            // Clear QR Code
            document.getElementById('qrcode').innerHTML = '';
          }
        });
  
      } catch (error) {
        console.error(error);
        if (error.code === 4001) {
          // User rejected the request
          alert('Connection request rejected.');
        } else {
          alert('An error occurred while connecting to your wallet.');
        }
      }
    } else {
      alert('MetaMask is not installed. Please install it to use this feature.');
    }
  }
  
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
  
  // Event Listener for Connect Wallet Button
  connectWalletButton?.addEventListener('click', connectWallet);
  

  // This function handles fetching the total number of transactions for a wallet
async function fetchTransactionCount() {
  try {
    if (typeof window.ethereum !== 'undefined') {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      
       
      const signer = provider.getSigner();

      const walletAddress = await signer.getAddress();
      console.log("Connected wallet address:", walletAddress);

      // Fetch the total number of transactions (nonce) for the wallet address
      const transactionCount = await provider.getTransactionCount(walletAddress);

      // Display the total transaction count in the HTML element
      document.getElementById('total-transactions').textContent = transactionCount;
    } else {
      console.error('Ethereum provider not detected.');
    }
  } catch (error) {
    console.error("Error fetching transaction count:", error);
  }
}

// Call the fetchTransactionCount function after the wallet is connected
document.getElementById('connectWallet').addEventListener('click', async () => {
  try {
    // Request wallet connection
    await window.ethereum.request({ method: 'eth_requestAccounts' });

    // Fetch the total transactions once the wallet is connected
    fetchTransactionCount();
  } catch (error) {
    console.error('Error connecting wallet:', error);
  }
});



// Function to fetch the monthly volume of transactions
// async function fetchMonthlyVolume() {
//   try {
//     if (typeof window.ethereum !== 'undefined') {
//       const provider = new ethers.providers.Web3Provider(window.ethereum);
//       const signer = provider.getSigner();
//       const walletAddress = await signer.getAddress();

//       // Fetch transaction history from Etherscan (or your smart contract)
//       const apiKey = 'YOUR_ETHERSCAN_API_KEY'; // Replace with your actual Etherscan API key
//       const url = `https://api.etherscan.io/api?module=account&action=txlist&address=${walletAddress}&startblock=0&endblock=99999999&sort=asc&apikey=${apiKey}`;

//       const response = await fetch(url);
//       const data = await response.json();

//       if (data.status === '1') {
//         const transactions = data.result;

//         // Get the current month
//         const currentMonth = new Date().getMonth();
//         const currentYear = new Date().getFullYear();

//         // Calculate monthly volume
//         let monthlyVolume = 0;
//         transactions.forEach(transaction => {
//           const transactionDate = new Date(transaction.timeStamp * 1000);
//           if (transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear) {
//             monthlyVolume += parseFloat(ethers.utils.formatEther(transaction.value));
//           }
//         });

//         // Display the monthly volume in the HTML element
//         document.getElementById('monthly-volume').textContent = `$${monthlyVolume.toFixed(2)}`;
//       } else {
//         console.error('Error fetching transactions:', data.message);
//       }
//     } else {
//       console.error('Ethereum provider not detected.');
//     }
//   } catch (error) {
//     console.error("Error fetching monthly volume:", error);
//   }
// }

// // Call the fetchMonthlyVolume function after fetching transactions
// document.getElementById('connectWallet').addEventListener('click', async () => {
//   try {
//     await window.ethereum.request({ method: 'eth_requestAccounts' });
    
//     // Fetch total transactions and monthly volume after the wallet is connected
//     fetchTransactionCount();
//     fetchMonthlyVolume();
//   } catch (error) {
//     console.error('Error connecting wallet:', error);
//   }
// });


//calling api to get monthly volume

// async function fetchMonthlyVolume(walletAddress) {
//   try {
//     const response = await fetch(`/api/monthly-volume/${walletAddress}`);
//     const data = await response.json();

//     if (response.ok) {
//       document.getElementById('monthly-volume').textContent = `$${data.monthlyVolume}`;
//     } else {
//       console.error('Error fetching monthly volume:', data.error);
//     }
//   } catch (error) {
//     console.error("Error fetching monthly volume:", error);
//   }
// }

// // Call this function after the wallet is connected


// Function to fetch monthly volume
// async function fetchMonthlyVolume(walletAddress) {
//   const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
//   const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);

//   // Fetch all transactions for the wallet address
//   const provider = new ethers.providers.JsonRpcProvider("46adee32fe4a4ce2bcac24323391f422"); // Replace with your RPC URL
//   const history = await provider.getHistory(walletAddress);

//   let monthlyVolume = 0;

//   // Calculate total volume for the current month
//   history.forEach(tx => {
//       const txDate = new Date(tx.timestamp * 1000); // Convert timestamp to Date
//       if (txDate >= startOfMonth && txDate <= endOfMonth) {
//           monthlyVolume += parseFloat(ethers.utils.formatEther(tx.value)); // Convert from Wei to Ether
//       }
//   });

//   // Update the UI with the monthly volume
//   const monthlyVolumeElement = document.getElementById('monthly-volume');
//   monthlyVolumeElement.textContent = `$${monthlyVolume.toFixed(2)}`; // Format as currency
// }


async function calculateMonthlyVolume() {
  try {
      const address = await signer.getAddress();
      const currentBlock = await provider.getBlockNumber();
      const blockLimit = 5000; // Modify this based on your network constraints
      const blocksToCheck = 72000; // Approximately one month of blocks (assuming ~13s per block)

      let fromBlock = currentBlock - blocksToCheck;
      let toBlock = currentBlock;

      // Fetch transaction history for the last month
      const history = await provider.getHistory(address, fromBlock, toBlock);

      console.log("Fetched transaction history:", history);  // Log fetched transactions

      // Filter transactions for the current month
      const now = new Date();
      const thisMonthTransactions = history.filter(tx => {
          const txDate = new Date(tx.timestamp * 1000);
          return txDate.getMonth() === now.getMonth() && txDate.getFullYear() === now.getFullYear();
      });

      console.log("Transactions for this month:", thisMonthTransactions);  // Log transactions this month

      // Calculate total volume for this month
      let totalVolume = 0;
      thisMonthTransactions.forEach(tx => {
          totalVolume += parseFloat(ethers.utils.formatEther(tx.value));
      });

      console.log("Total monthly volume:", totalVolume);  // Log the total volume

      // Update the UI
      document.getElementById('monthly-volume').innerText = `$${totalVolume.toFixed(2)}`;
  } catch (error) {
      console.error("Error calculating monthly volume:", error);
  }
}


document.getElementById('sendPaymentForm').addEventListener('submit', async (event) => {
  event.preventDefault(); // Prevent the default form submission
  
  const recipient = document.getElementById('recipient').value;
  const amount = document.getElementById('amount').value;
  const currency = document.getElementById('currency').value;

  try {
      const response = await fetch('http://localhost:3000/api/sendPayment', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({ recipient, amount, currency })
      });

      const result = await response.json();
      if (response.ok) {
          alert('Payment sent successfully!');
          // Optionally update the UI with the new balance or transaction
      } else {
          alert('Error: ' + result.message);
      }
  } catch (error) {
      console.error('Error sending payment:', error);
  }
});
