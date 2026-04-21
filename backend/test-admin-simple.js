#!/usr/bin/env node
import https from 'https';
import http from 'http';

const BASE_URL = 'http://localhost:5000';

async function makeRequest(method, endpoint, body = null, token = null) {
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

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

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

async function testAdminSystem() {
  try {
    console.log('🧪 Testing Admin System...\n');

    // Test 0: Check if server is responding
    console.log('0️⃣ Testing server health...');
    const healthResponse = await makeRequest('GET', '/');

    console.log('Health response status:', healthResponse.status);
    console.log('Health response body:', healthResponse.body);

    // Test 1: Login as super admin
    console.log('\n1️⃣ Testing super admin login...');
    const loginResponse = await makeRequest('POST', '/api/v1/auth/login', {
      email: 'admin@medflow.com',
      password: 'admin123'
    });

    console.log('Login response status:', loginResponse.status);
    console.log('Login response body:', loginResponse.body);

    if (loginResponse.status !== 200 || !loginResponse.body?.success) {
      throw new Error('Login failed: ' + (loginResponse.body?.message || 'Unknown error'));
    }

    const token = loginResponse.body.token;
    console.log('✅ Super admin login successful');

    // Test 2: Get dashboard stats
    console.log('\n2️⃣ Testing dashboard stats...');
    const statsResponse = await makeRequest('GET', '/admin/dashboard', null, token);

    console.log('Dashboard response status:', statsResponse.status);
    console.log('Dashboard raw response:', statsResponse.rawData);
    console.log('Dashboard response body:', statsResponse.body);

    if (statsResponse.status !== 200 || !statsResponse.body?.success) {
      throw new Error('Dashboard stats failed: ' + (statsResponse.body?.message || 'Unknown error'));
    }

    console.log('✅ Dashboard stats retrieved successfully');

    // Test 3: Get users list
    console.log('\n3️⃣ Testing users list...');
    const usersResponse = await makeRequest('GET', '/admin/users', null, token);

    console.log('Users response status:', usersResponse.status);
    console.log('Users response body:', usersResponse.body);

    if (usersResponse.status !== 200 || !usersResponse.body?.success) {
      throw new Error('Users list failed: ' + (usersResponse.body?.message || 'Unknown error'));
    }

    console.log('✅ Users list retrieved successfully');
    console.log('   Total users:', usersResponse.body.data?.length || 0);

    console.log('\n🎉 All admin system tests passed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAdminSystem();