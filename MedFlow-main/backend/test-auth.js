#!/usr/bin/env node
import https from 'https';
import http from 'http';

const BASE_URL = 'http://localhost:5000/api/v1/auth';

async function makeRequest(method, endpoint, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(endpoint, BASE_URL);
    const isHttps = url.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = client.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: data ? JSON.parse(data) : null,
            rawData: data,
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: null,
            rawData: data,
            parseError: e.message,
          });
        }
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function testAuthFlow() {
  console.log('🧪 Starting Auth API Tests...\n');

  try {
    // Test 1: Register Patient
    console.log('📝 Test 1: Register Patient');
    const registerRes = await makeRequest('POST', '/register', {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
    });
    console.log(`Status: ${registerRes.status}`);
    console.log(`Response:`, JSON.stringify(registerRes.body, null, 2));
    console.log('');

    // Test 2: Login with Correct Password
    console.log('🔐 Test 2: Login with Correct Password');
    const loginRes = await makeRequest('POST', '/login', {
      email: 'john@example.com',
      password: 'password123',
    });
    console.log(`Status: ${loginRes.status}`);
    console.log(`Response:`, JSON.stringify(registerRes.body, null, 2));
    if (loginRes.status === 200) {
      console.log('✅ Token:', loginRes.body.token?.substring(0, 20) + '...');
    }
    console.log('');

    // Test 3: Login with Wrong Password (Should return 401)
    console.log('🔐 Test 3: Login with Wrong Password (Should return 401)');
    const wrongPassRes = await makeRequest('POST', '/login', {
      email: 'john@example.com',
      password: 'wrongpassword',
    });
    console.log(`Status: ${wrongPassRes.status}`);
    console.log(`Response:`, JSON.stringify(wrongPassRes.body, null, 2));
    console.log('');

    // Test 4: Login with Non-existent Email (Should return 401)
    console.log('🔐 Test 4: Login with Non-existent Email (Should return 401)');
    const noUserRes = await makeRequest('POST', '/login', {
      email: 'nonexistent@example.com',
      password: 'password123',
    });
    console.log(`Status: ${noUserRes.status}`);
    console.log(`Response:`, JSON.stringify(noUserRes.body, null, 2));
    console.log('');

    // Test 5: Register Doctor
    console.log('📝 Test 5: Register Doctor');
    const doctorRes = await makeRequest('POST', '/doctor-onboard', {
      name: 'Dr. Jane Smith',
      email: 'dr.jane@example.com',
      password: 'docpass123',
      specialization: 'Cardiology',
      fee: 500,
    });
    console.log(`Status: ${doctorRes.status}`);
    console.log(`Response:`, JSON.stringify(doctorRes.body, null, 2));
    console.log('');

    // Test 6: Login as Doctor
    console.log('🔐 Test 6: Login as Doctor');
    const doctorLoginRes = await makeRequest('POST', '/login', {
      email: 'dr.jane@example.com',
      password: 'docpass123',
    });
    console.log(`Status: ${doctorLoginRes.status}`);
    console.log(`Response:`, JSON.stringify(doctorLoginRes.body, null, 2));
    console.log('');

    console.log('✅ All tests completed!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testAuthFlow();
