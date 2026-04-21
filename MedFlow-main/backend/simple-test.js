import fetch from 'node-fetch';

async function testAuth() {
  try {
    console.log('Testing auth endpoints...');

    // Test register
    console.log('1. Testing register...');
    const registerRes = await fetch('http://localhost:5000/api/v1/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      })
    });
    console.log('Register status:', registerRes.status);
    const registerData = await registerRes.text();
    console.log('Register response:', registerData);

    // Test login
    console.log('2. Testing login...');
    const loginRes = await fetch('http://localhost:5000/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123'
      })
    });
    console.log('Login status:', loginRes.status);
    const loginData = await loginRes.text();
    console.log('Login response:', loginData);

  } catch (error) {
    console.error('Error:', error.message);
  }
}

testAuth();