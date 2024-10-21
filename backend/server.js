const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const session = require('express-session');
const bcrypt = require('bcryptjs');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const ethers = require('ethers');  // Required for web3 interactions

const app = express();

// Middleware Setup
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Session Setup
app.use(session({
  secret: 'your_secret_key', // Replace with a strong secret
  resave: false,
  saveUninitialized: true,
}));

app.use(passport.initialize());
app.use(passport.session());

// User Database (Replace with your actual database)
const users = []; // This should be replaced with a real database

// Passport Serialization
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  const user = users.find(user => user.id === id);
  done(null, user);
});

// Google OAuth Strategy
passport.use(new GoogleStrategy({
    clientID: 'YOUR_GOOGLE_CLIENT_ID', // Replace with your Google Client ID
    clientSecret: 'YOUR_GOOGLE_CLIENT_SECRET', // Replace with your Google Client Secret
    callbackURL: '/auth/google/callback',
  },
  function(accessToken, refreshToken, profile, done) {
    let user = users.find(user => user.googleId === profile.id);
    if (user) {
      return done(null, user);
    } else {
      user = {
        id: users.length + 1,
        googleId: profile.id,
        name: profile.displayName,
        email: profile.emails[0].value,
      };
      users.push(user);
      return done(null, user);
    }
  }
));

// Ethereum provider and contract setup
const provider = new ethers.JsonRpcProvider("https://sepolia.base.org"); // Base Sepolia RPC URL
const privateKey = 'YOUR_PRIVATE_KEY'; // Add your wallet's private key
const wallet = new ethers.Wallet(privateKey, provider);

// ABI and contract address of StablePay (replace with your actual ABI and address)
const stablePayABI = require('./StablePayABI.json'); // Load the ABI from your saved JSON file
const stablePayAddress = '0x0e0A40FB8b593fe0E31B99e6Dd36C028459A9d9b'; // Replace with deployed contract address

const stablePayContract = new ethers.Contract(stablePayAddress, stablePayABI, wallet);

// Routes

// Home Route
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// Login Route
app.get('/login', (req, res) => {
  res.sendFile(__dirname + '/login.html');
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find(user => user.email === email);
  if (user) {
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) throw err;
      if (isMatch) {
        req.session.userId = user.id;
        res.redirect('/dashboard');
      } else {
        res.send('Incorrect Password');
      }
    });
  } else {
    res.send('No user with that email');
  }
});

// Sign Up Route
app.get('/signup', (req, res) => {
  res.sendFile(__dirname + '/signup.html');
});

app.post('/signup', (req, res) => {
  const { name, email, password } = req.body;
  const existingUser = users.find(user => user.email === email);
  if (existingUser) {
    res.send('User already exists');
  } else {
    bcrypt.hash(password, 10, (err, hashedPassword) => {
      if (err) throw err;
      const newUser = {
        id: users.length + 1,
        name,
        email,
        password: hashedPassword,
      };
      users.push(newUser);
      req.session.userId = newUser.id;
      res.redirect('/dashboard');
    });
  }
});

// Dashboard Route (Protected)
app.get('/dashboard', (req, res) => {
  if (req.session.userId) {
    const user = users.find(user => user.id === req.session.userId);
    res.send(`<h1>Welcome, ${user.name}!</h1><p>This is your dashboard.</p>`);
  } else {
    res.redirect('/login');
  }
});

// Send Coins Route (Interacts with StablePay)
app.post('/send', async (req, res) => {
  const { recipient, amount } = req.body;

  try {
    const tx = await stablePayContract.sendCoins(recipient, ethers.parseEther(amount));  // Replace with your contract's actual method
    await tx.wait();  // Wait for transaction confirmation
    res.send(`Transaction successful. Hash: ${tx.hash}`);
  } catch (err) {
    res.status(500).send(`Transaction failed: ${err.message}`);
  }
});

// Logout Route
app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login');
});

// Google OAuth Routes
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/dashboard');
  }
);

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
