// health_records.js - Handles health records page functionality

document.addEventListener('DOMContentLoaded', function() {
    const recordsForm = document.getElementById('recordsForm');
    const messageArea = document.getElementById('messageArea');
    const recordsContainer = document.getElementById('recordsContainer');
    const recordsData = document.getElementById('recordsData');
    
    // Function to display message
    function displayMessage(message, isError = false) {
        messageArea.innerHTML = `<div class="${isError ? 'error-message' : 'success-message'}">${message}</div>`;
    }
    
    // Function to clear messages
    function clearMessages() {
        messageArea.innerHTML = '';
    }
    
    // Function to fetch and display health records
    async function fetchHealthRecords(studentId) {
        try {
            clearMessages();
            displayMessage('Loading health records...', false);
            recordsContainer.style.display = 'none';
            
            // Fetch health records from API
            const response = await api.get('healthRecords', { student_id: studentId });
            
            // Clear loading message
            clearMessages();
            
            if (response.success) {
                // Display records
                if (response.data.length > 0) {
                    recordsData.innerHTML = '';
                    
                    response.data.forEach(record => {
                        const row = document.createElement('tr');
                        row.innerHTML = `
                            <td style="padding: 10px;">${record.date_of_visit}</td>
                            <td style="padding: 10px;">${record.doctor_name}</td>
                            <td style="padding: 10px;">${record.diagnosis}</td>
                            <td style="padding: 10px;">${record.treatment}</td>
                        `;
                        recordsData.appendChild(row);
                    });
                    
                    recordsContainer.style.display = 'block';
                } else {
                    // No records found
                    displayMessage('No health records found for this student ID.', true);
                }
            } else {
                // Handle error response
                displayMessage('Failed to load health records. ' + (response.message || ''), true);
            }
        } catch (error) {
            // Handle fetch error
            displayMessage('Error connecting to server. Please try again later.', true);
            console.error('Error fetching health records:', error);
        }
    }
    
    // Handle form submission
    if (recordsForm) {
        recordsForm.addEventListener('submit', function(event) {
            event.preventDefault();
            
            const studentId = document.getElementById('student_id').value;
            if (!studentId) {
                displayMessage('Please enter a valid Student ID.', true);
                return;
            }
            
            fetchHealthRecords(studentId);
        });
    }
    
    // Check for student ID in URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const studentIdParam = urlParams.get('student_id');
    
    if (studentIdParam) {
        document.getElementById('student_id').value = studentIdParam;
        fetchHealthRecords(studentIdParam);
    }
});