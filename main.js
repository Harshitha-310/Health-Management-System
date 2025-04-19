// main.js - Common functionality for all pages

document.addEventListener('DOMContentLoaded', function() {
    // Check if API connector is loaded
    if (typeof api === 'undefined') {
        console.error('API connector not loaded!');
    }
    
    // Check authentication status for protected pages
    function checkAuth() {
        const protectedPages = [
            'dashboard.html',
            'health_records.html',
            'appointment.html'
        ];
        
        const currentPage = window.location.pathname.split('/').pop();
        const isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true';
        
        // If this is a protected page and user is not logged in, redirect to login
        if (protectedPages.includes(currentPage) && !isLoggedIn) {
            window.location.href = 'login.html';
            return false;
        }
        
        return true;
    }
    
    // Update navigation based on login status
    function updateNavigation() {
        const isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true';
        const loginLink = document.querySelector('nav a[href="login.html"]');
        
        if (loginLink) {
            if (isLoggedIn) {
                // Change login link to logout
                loginLink.innerHTML = '<i class="fas fa-sign-out-alt"></i> Logout';
                loginLink.setAttribute('href', '#');
                loginLink.addEventListener('click', function(e) {
                    e.preventDefault();
                    sessionStorage.removeItem('user');
                    sessionStorage.removeItem('isLoggedIn');
                    window.location.href = 'index.html';
                });
                
                // Add username to header if user data exists
                const user = JSON.parse(sessionStorage.getItem('user') || '{}');
                if (user.name) {
                    const header = document.querySelector('header h1');
                    if (header) {
                        const welcomeSpan = document.createElement('span');
                        welcomeSpan.style.fontSize = '0.6em';
                        welcomeSpan.style.float = 'right';
                        welcomeSpan.textContent = `Welcome, ${user.name}`;
                        header.appendChild(welcomeSpan);
                    }
                }
            }
        }
    }
    
    // Format dates in a user-friendly format
    window.formatDate = function(dateString) {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };
    
    // Set minimum date for date inputs to today
    const dateInputs = document.querySelectorAll('input[type="date"]');
    dateInputs.forEach(input => {
        if (!input.min) {
            const today = new Date().toISOString().split('T')[0];
            input.min = today;
        }
    });
    
    // Run authentication check
    checkAuth();
    
    // Update navigation
    updateNavigation();
});