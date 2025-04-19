// emergency_alerts.js - Handles emergency alerts page functionality

document.addEventListener('DOMContentLoaded', function() {
    const emergencyForm = document.getElementById('emergencyForm');
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
    if (emergencyForm) {
        emergencyForm.addEventListener('submit', async function(event) {
            event.preventDefault();
            clearMessages();
            
            try {
                // Display loading message
                displayMessage('Sending emergency alert...', false);
                
                // Get form data
                const formData = {
                    student_id: document.getElementById('student_id').value,
                    description: document.getElementById('description').value
                };
                
                // Send emergency alert to API
                const response = await api.post('emergency', formData);
                
                if (response.success) {
                    // Show success message
                    displayMessage('Emergency alert sent successfully! The health center has been notified.', false);
                    
                    // Clear form
                    emergencyForm.reset();
                    
                    // Add additional notification for emergency
                    const emergencyInfo = document.querySelector('.emergency-info');
                    if (emergencyInfo) {
                        const notification = document.createElement('p');
                        notification.style.color = '#e74c3c';
                        notification.style.fontWeight = 'bold';
                        notification.innerHTML = '<i class="fas fa-bell"></i> Health center staff have been alerted. Please remain calm.';
                        emergencyInfo.appendChild(notification);
                    }
                } else {
                    // Show error message
                    displayMessage(`Alert sending failed: ${response.message || 'Unknown error'}`, true);
                }
            } catch (error) {
                // Handle any errors
                displayMessage('Error connecting to server. Please try again later. If this is a real emergency, please call the emergency number.', true);
                console.error('Emergency alert error:', error);
            }
        });
    }
});