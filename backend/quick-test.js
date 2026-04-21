#!/usr/bin/env node
import http from 'http';

async function testEndpoint(path, body) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(JSON.stringify(body))
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log(`\n🔹 ${path}`);
        console.log(`   Status: ${res.statusCode}`);
        try {
          console.log(`   Response: ${JSON.stringify(JSON.parse(data), null, 2)}`);
        } catch {
          console.log(`   Response: ${data}`);
        }
        resolve();
      });
    });

    req.on('error', (e) => console.error(e.message));
    req.write(JSON.stringify(body));
    req.end();
  });
}

async function runTests() {
  console.log('=== AUTH API ENDPOINT TES TS ===\n');
  
  // Test register
  await testEndpoint('/api/v1/auth/register', {
    name: 'Test Patient',
    email: 'testpat@example.com',
    password: 'pass12345'
  });

  // Test login with wrong pass
  await testEndpoint('/api/v1/auth/login', {
    email: 'testpat@example.com',
    password: 'wrongpass'
  });

  // Test login correct (after first test)
  await testEndpoint('/api/v1/auth/login', {
    email: 'testpat@example.com',
    password: 'pass12345'
  });

  // Test doctor register
  await testEndpoint('/api/v1/auth/doctor-onboard', {
    name: 'Dr. Test',
    email: 'drtest@example.com',
    password: 'docpass123',
    specialization: 'Cardiology',
    fee: 500
  });

  console.log('\n✅ All tests completed');
}

runTests();
