// doctor_availability.js - Handles doctor availability page functionality

document.addEventListener('DOMContentLoaded', function() {
    const doctorTable = document.getElementById('doctorTable');
    const doctorData = document.getElementById('doctorData');
    const loadingIndicator = document.getElementById('loading');

    // Function to load doctors data
    async function loadDoctors() {
        try {
            // Show loading indicator
            loadingIndicator.style.display = 'block';
            doctorTable.style.display = 'none';
            
            // Fetch doctors data from API
            const response = await api.get('doctors');
            
            // Hide loading indicator
            loadingIndicator.style.display = 'none';
            doctorTable.style.display = 'table';
            
            if (response.success) {
                // Clear existing data
                doctorData.innerHTML = '';
                
                // Add data to table
                if (response.data.length > 0) {
                    response.data.forEach(doctor => {
                        const row = document.createElement('tr');
                        
                        // Set availability status color
                        const availabilityClass = doctor.availability_status === 'Available' ? 'text-success' : 'text-danger';
                        
                        row.innerHTML = `
                            <td style="padding: 10px;">${doctor.name}</td>
                            <td style="padding: 10px;">${doctor.specialization}</td>
                            <td style="padding: 10px; color: ${doctor.availability_status === 'Available' ? 'green' : 'red'}">
                                ${doctor.availability_status}
                            </td>
                        `;
                        
                        doctorData.appendChild(row);
                    });
                } else {
                    // Display message if no doctors
                    const noDataRow = document.createElement('tr');
                    noDataRow.innerHTML = `<td colspan="3" style="text-align: center; padding: 10px;">No doctors available.</td>`;
                    doctorData.appendChild(noDataRow);
                }
            } else {
                // Handle error response
                displayError('Failed to load doctors data.');
            }
        } catch (error) {
            // Handle fetch error
            loadingIndicator.style.display = 'none';
            displayError('Error connecting to server. Please try again later.');
            console.error('Error loading doctors:', error);
        }
    }

    // Function to display error message
    function displayError(message) {
        const errorRow = document.createElement('tr');
        errorRow.innerHTML = `<td colspan="3" style="text-align: center; padding: 10px; color: red;">${message}</td>`;
        doctorData.innerHTML = '';
        doctorData.appendChild(errorRow);
        doctorTable.style.display = 'table';
    }

    // Load doctors data when page loads
    loadDoctors();
});