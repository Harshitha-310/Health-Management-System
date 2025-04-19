// login.js - Handles login functionality

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const messageArea = document.getElementById('messageArea');
    
    // Function to display messages
    function displayMessage(message, isError = false) {
        messageArea.innerHTML = `<div class="${isError ? 'error-message' : 'success-message'}">${message}</div>`;
    }
    
    // Function to clear messages
    function clearMessages() {
        messageArea.innerHTML = '';
    }
    
    // Handle form submission
    if (loginForm) {
        loginForm.addEventListener('submit', async function(event) {
            event.preventDefault();
            clearMessages();
            
            try {
                // Display loading message
                displayMessage('Logging in...', false);
                
                // Get form data
                const formData = {
                    roll_no: document.getElementById('roll_no').value,
                    student_id: document.getElementById('student_id').value
                };
                
                // Send login data to API
                const response = await api.post('login', formData);
                
                if (response.success) {
                    // Show success message
                    displayMessage('Login successful! Redirecting...', false);
                    
                    // Store user info in session storage
                    sessionStorage.setItem('user', JSON.stringify(response.user));
                    sessionStorage.setItem('isLoggedIn', 'true');
                    
                    // Redirect after successful login
                    setTimeout(() => {
                        window.location.href = 'dashboard.html';
                    }, 1500);
                } else {
                    // Show error message
                    displayMessage(`Login failed: ${response.message || 'Invalid credentials'}`, true);
                }
            } catch (error) {
                // Handle any errors
                displayMessage('Error connecting to server. Please try again later.', true);
                console.error('Login error:', error);
            }
        });
    }
    
    // Check if user is already logged in
    const isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true';
    if (isLoggedIn) {
        // Redirect to dashboard if already logged in
        window.location.href = 'dashboard.html';
    }
});