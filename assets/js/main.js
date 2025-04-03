/**
 * FlexPlek IQ - Main JavaScript File
 * Minimalist version to fix loading issues
 */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Set current year in copyright
    setCurrentYear();
    
    // Initialize mobile menu with simplified approach
    initMobileMenu();
    
    // Simple header scroll effect without complex calculations
    initBasicHeaderScroll();
});

/**
 * Set current year in copyright notices
 */
function setCurrentYear() {
    const yearElements = document.querySelectorAll('.current-year');
    const currentYear = new Date().getFullYear();
    
    yearElements.forEach(element => {
        element.textContent = currentYear;
    });
}

/**
 * Initialize mobile menu with basic functionality
 */
function initMobileMenu() {
    const menuToggle = document.querySelector('.menu-toggle');
    const mobileNav = document.getElementById('mobileNav');
    const navOverlay = document.getElementById('navOverlay');
    const navClose = document.querySelector('.nav__close');
    
    // Skip if any element is missing
    if (!menuToggle || !mobileNav || !navOverlay) {
        return;
    }
    
    // Toggle menu on burger icon click
    menuToggle.addEventListener('click', function() {
        mobileNav.classList.toggle('active');
        navOverlay.classList.toggle('active');
        this.classList.toggle('active');
    });
    
    // Close menu on overlay click
    navOverlay.addEventListener('click', function() {
        mobileNav.classList.remove('active');
        navOverlay.classList.remove('active');
        menuToggle.classList.remove('active');
    });
    
    // Close menu on close button click
    if (navClose) {
        navClose.addEventListener('click', function() {
            mobileNav.classList.remove('active');
            navOverlay.classList.remove('active');
            menuToggle.classList.remove('active');
        });
    }
    
    // Close menu when links are clicked
    const mobileNavLinks = document.querySelectorAll('.nav--mobile .nav__link');
    mobileNavLinks.forEach(link => {
        link.addEventListener('click', function() {
            mobileNav.classList.remove('active');
            navOverlay.classList.remove('active');
            menuToggle.classList.remove('active');
        });
    });
}

/**
 * Basic header scroll effect - simplified to avoid performance issues
 */
function initBasicHeaderScroll() {
    const header = document.getElementById('header');
    if (!header) return;
    
    // Use a variable to track if we're currently updating the header
    let isUpdating = false;
    
    // We'll use requestAnimationFrame for better performance
    let lastScrollPosition = window.pageYOffset;
    
    // Simple scroll handler with debounce-like functionality
    window.addEventListener('scroll', function() {
        if (isUpdating) return;
        
        isUpdating = true;
        
        // Use requestAnimationFrame to optimize performance
        window.requestAnimationFrame(function() {
            const currentScrollPosition = window.pageYOffset;
            
            if (currentScrollPosition > 150) {
                if (currentScrollPosition > lastScrollPosition) {
                    // Scrolling down - hide header
                    header.classList.add('header--hidden');
                } else {
                    // Scrolling up - show header
                    header.classList.remove('header--hidden');
                }
                header.classList.add('scrolled');
            } else if (currentScrollPosition > 50) {
                header.classList.add('scrolled');
                header.classList.remove('header--hidden');
            } else {
                header.classList.remove('scrolled');
                header.classList.remove('header--hidden');
            }
            
            lastScrollPosition = currentScrollPosition;
            isUpdating = false;
        });
    }, { passive: true });
}