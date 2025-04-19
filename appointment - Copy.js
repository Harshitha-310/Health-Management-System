// appointment.js - Handles appointment booking page functionality

document.addEventListener('DOMContentLoaded', function() {
    // Get form elements
    const appointmentForm = document.getElementById('appointmentForm');
    const doctorSelect = document.getElementById('doctor_id');
    const messageArea = document.getElementById('messageArea');
    
    // Function to display messages
    function displayMessage(message, isError = false) {
        messageArea.innerHTML = `<div class="${isError ? 'error-message' : 'success-message'}">${message}</div>`;
    }
    
    // Function to clear messages
    function clearMessages() {
        messageArea.innerHTML = '';
    }
    
    // Function to load available doctors
    async function loadDoctors() {
        try {
            // Display loading message
            displayMessage('Loading doctors...', false);
            
            // Fetch doctors from API
            const response = await api.get('doctors');
            
            // Clear loading message
            clearMessages();
            
            if (response.success) {
                // Clear existing options except the default one
                doctorSelect.innerHTML = '<option value="">Select a doctor</option>';
                
                // Add doctor options to select
                response.data.forEach(doctor => {
                    if (doctor.availability_status === 'Available') {
                        const option = document.createElement('option');
                        option.value = doctor.name; // Using name as ID for mock API
                        option.textContent = `${doctor.name} (${doctor.specialization})`;
                        doctorSelect.appendChild(option);
                    }
                });
                
                // Check if there are available doctors
                if (doctorSelect.options.length === 1) {
                    displayMessage('No doctors are currently available.', true);
                }
            } else {
                // Handle error response
                displayMessage('Failed to load doctors. ' + (response.message || ''), true);
            }
        } catch (error) {
            // Handle fetch error
            displayMessage('Error connecting to server. Please try again later.', true);
            console.error('Error loading doctors:', error);
        }
    }
    
    // Handle form submission
    if (appointmentForm) {
        // Set minimum date for appointment to today
        const appointmentDateInput = document.getElementById('appointment_date');
        if (appointmentDateInput) {
            const today = new Date().toISOString().split('T')[0];
            appointmentDateInput.min = today;
        }
        
        appointmentForm.addEventListener('submit', async function(event) {
            event.preventDefault();
            clearMessages();
            
            try {
                // Display loading message
                displayMessage('Booking appointment...', false);
                
                // Get form data
                const formData = {
                    student_id: document.getElementById('student_id').value,
                    doctor_id: document.getElementById('doctor_id').value,
                    appointment_date: document.getElementById('appointment_date').value,
                    appointment_time: document.getElementById('appointment_time').value,
                    reason: document.getElementById('reason').value
                };
                
                // Send appointment data to API
                const response = await api.post('appointment', formData);
                
                if (response.success) {
                    // Show success message
                    displayMessage('Appointment booked successfully!', false);
                    
                    // Clear form
                    appointmentForm.reset();
                } else {
                    // Show error message
                    displayMessage(`Booking failed: ${response.message || 'Unknown error'}`, true);
                }
            } catch (error) {
                // Handle any errors
                displayMessage('Error connecting to server. Please try again later.', true);
                console.error('Appointment booking error:', error);
            }
        });
    }
    
    // Load doctors when page loads
    loadDoctors();
});