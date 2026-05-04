const axios = require('axios');

const API_BASE = 'http://localhost:8069/api/photocopy';

async function testAPI() {
  try {
    // First login
    console.log('Testing login...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      pin: '1234' // Try a common PIN
    });
    console.log('Login successful:', loginResponse.data);

    const token = loginResponse.data.data.token;
    console.log('Token:', token);

    // Now test products endpoint
    console.log('\nTesting products endpoint...');
    const productsResponse = await axios.get(`${API_BASE}/products`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    console.log('Products response:', productsResponse.data);

  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

testAPI();
