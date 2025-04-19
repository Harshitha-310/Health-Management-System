// api-connector.js - Base API connection handling

class APIConnector {
    constructor(baseUrl = 'api') {
        this.baseUrl = baseUrl;
    }

    async get(endpoint, params = {}) {
        const url = new URL(`${this.baseUrl}/${endpoint}`, window.location.origin);
        
        // Add query parameters if any
        Object.keys(params).forEach(key => {
            url.searchParams.append(key, params[key]);
        });
        
        try {
            const response = await fetch(url.toString());
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('API GET Error:', error);
            throw error;
        }
    }

    async post(endpoint, data = {}) {
        const url = `${this.baseUrl}/${endpoint}`;
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('API POST Error:', error);
            throw error;
        }
    }
}

// For simulating API responses when backend is not available
class MockAPIConnector extends APIConnector {
    constructor() {
        super();
        // Sample data for mock responses
        this.mockData = {
            doctors: [
                { name: 'Dr. Smith', specialization: 'Cardiologist', availability_status: 'Available' },
                { name: 'Dr. Adams', specialization: 'Neurologist', availability_status: 'Available' },
                { name: 'Dr. Johnson', specialization: 'Dermatologist', availability_status: 'Not Available' },
                { name: 'Dr. Wilson', specialization: 'Orthopedic', availability_status: 'Available' }
            ],
            healthRecords: {
                1: [
                    { date_of_visit: '2025-04-10', doctor_name: 'Dr. Smith', diagnosis: 'High Blood Pressure', treatment: 'Prescribed medication' },
                    { date_of_visit: '2025-03-22', doctor_name: 'Dr. Adams', diagnosis: 'Headache', treatment: 'Rest and hydration' }
                ],
                2: [
                    { date_of_visit: '2025-04-05', doctor_name: 'Dr. Adams', diagnosis: 'Migraine', treatment: 'Prescribed pain relievers' }
                ]
            }
        };
    }

    async get(endpoint, params = {}) {
        console.log(`Mock GET request to ${endpoint} with params:`, params);
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Return mock data based on endpoint
        switch (endpoint) {
            case 'doctors':
                return { success: true, data: this.mockData.doctors };
            case 'healthRecords':
                const studentId = params.student_id || 1;
                const records = this.mockData.healthRecords[studentId] || [];
                return { success: true, data: records };
            default:
                return { success: false, message: 'Endpoint not found' };
        }
    }

    async post(endpoint, data = {}) {
        console.log(`Mock POST request to ${endpoint} with data:`, data);
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 700));
        
        // Return success response for any post request
        switch (endpoint) {
            case 'register':
                return { success: true, message: 'Registration successful!', student_id: Math.floor(Math.random() * 10000) };
            case 'appointment':
                return { success: true, message: 'Appointment booked successfully!' };
            case 'emergency':
                return { success: true, message: 'Emergency alert sent successfully!' };
            case 'login':
                // Simple mock authentication
                return { success: true, message: 'Login successful!', user: { student_id: data.student_id, name: 'Mock User' } };
            default:
                return { success: false, message: 'Endpoint not found' };
        }
    }
}

// Export the mock connector for now, replace with real one when backend is ready
const api = new MockAPIConnector();