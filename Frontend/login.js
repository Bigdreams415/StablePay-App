// // scripts.js

// // Function to handle Google Sign-In
// function handleGoogleSignIn() {
//     // Redirect to your backend's Google OAuth endpoint
//     window.location.href = '/auth/google';
//   }
  
//   // Optional: Client-side form validation
//   document.getElementById('loginForm').addEventListener('submit', function(event) {
//     const email = document.getElementById('loginEmail').value;
//     const password = document.getElementById('loginPassword').value;
  
//     // Basic validation (can be expanded)
//     if (!validateEmail(email)) {
//       alert('Please enter a valid email address.');
//       event.preventDefault();
//     }
  
//     if (password.length < 6) {
//       alert('Password must be at least 6 characters long.');
//       event.preventDefault();
//     }
//   });
  
//   function validateEmail(email) {
//     const re = /\S+@\S+\.\S+/;
//     return re.test(email);
//   }
  

// scripts.js

// Function to handle Google Sign-In
function handleGoogleSignIn() {
    // Redirect to your backend's Google OAuth endpoint
    window.location.href = '/auth/google';
  }
  
  // Optional: Client-side form validation for Sign Up
  document.getElementById('signupForm').addEventListener('submit', function(event) {
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
  
    // Basic validation (can be expanded)
    if (name.trim() === '') {
      alert('Please enter your full name.');
      event.preventDefault();
    }
  
    if (!validateEmail(email)) {
      alert('Please enter a valid email address.');
      event.preventDefault();
    }
  
    if (password.length < 6) {
      alert('Password must be at least 6 characters long.');
      event.preventDefault();
    }
  });
  
  function validateEmail(email) {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
  }
  
  // Existing Login Form Validation
  document.getElementById('loginForm')?.addEventListener('submit', function(event) {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
  
    // Basic validation (can be expanded)
    if (!validateEmail(email)) {
      alert('Please enter a valid email address.');
      event.preventDefault();
    }
  
    if (password.length < 6) {
      alert('Password must be at least 6 characters long.');
      event.preventDefault();
    }
  });
  