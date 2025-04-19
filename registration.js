// register.js - Handles registration page functionality

document.addEventListener('DOMContentLoaded', function() {
    // Import the API connector
    // Assuming api is globally available from API_connector.js
    
    const registrationForm = document.getElementById('registrationForm');
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
    if (registrationForm) {
        registrationForm.addEventListener('submit', async function(event) {
            event.preventDefault();
            clearMessages();
            
            try {
                // Display loading message
                displayMessage('Processing registration...', false);
                
                // Get form data
                const formData = {
                    name: document.getElementById('name').value,
                    roll_no: document.getElementById('roll_no').value,
                    gender: document.getElementById('gender').value,
                    age: document.getElementById('age').value,
                    department: document.getElementById('department').value,
                    contact_no: document.getElementById('contact_no').value,
                    email: document.getElementById('email').value
                };
                
                // Send registration data to API
                const response = await api.post('register', formData);
                
                if (response.success) {
                    // Show success message
                    displayMessage(`Registration successful! Your student ID is: ${response.student_id}`, false);
                    
                    // Clear form
                    registrationForm.reset();
                    
                    // Optional: Redirect after successful registration
                    setTimeout(() => {
                        window.location.href = 'login.html';
                    }, 3000);
                } else {
                    // Show error message
                    displayMessage(`Registration failed: ${response.message || 'Unknown error'}`, true);
                }
            } catch (error) {
                // Handle any errors
                displayMessage('Error connecting to server. Please try again later.', true);
                console.error('Registration error:', error);
            }
        });
    }
});