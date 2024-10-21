// scripts.js

// Initialize AOS (Animate On Scroll)
AOS.init({
    duration: 800, // Animation duration in milliseconds
    easing: 'ease-in-out', // Animation easing
    once: true, // Whether animation should happen only once while scrolling down
  });
  
  // Testimonials Carousel Functionality
  document.addEventListener('DOMContentLoaded', () => {
    const carousel = document.querySelector('.testimonials-carousel');
    const prevBtn = document.querySelector('.carousel-prev');
    const nextBtn = document.querySelector('.carousel-next');
    let scrollAmount = 0;
    const scrollPerClick = 300; // Adjust scroll amount per click
  
    // Handle Next Button Click
    nextBtn.addEventListener('click', () => {
      carousel.scrollBy({
        top: 0,
        left: scrollPerClick,
        behavior: 'smooth',
      });
    });
  
    // Handle Previous Button Click
    prevBtn.addEventListener('click', () => {
      carousel.scrollBy({
        top: 0,
        left: -scrollPerClick,
        behavior: 'smooth',
      });
    });
  
    // Smooth Scrolling for Navigation Links
    document.querySelectorAll('.navbar-menu a').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const targetID = this.getAttribute('href').substring(1);
        const targetSection = document.getElementById(targetID);
        if (targetSection) {
          window.scrollTo({
            top: targetSection.offsetTop - 80, // Adjust for fixed navbar height
            behavior: 'smooth'
          });
        }
      });
    });
  
    // Toggle Hamburger Menu
    const hamburger = document.querySelector('.hamburger');
    const navbarMenu = document.querySelector('.navbar-menu');
  
    if (hamburger) {
      hamburger.addEventListener('click', () => {
        navbarMenu.classList.toggle('active');
      });
    }
  });
  