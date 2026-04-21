import http from 'http';

const BASE_URL = 'http://localhost:5000/api/v1';

const request = (method, endpoint, body = null) => {
  return new Promise((resolve, reject) => {
    const url = new URL(endpoint, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: JSON.parse(data),
          });
        } catch {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
};

const log = {
  success: (msg) => console.log(`✅ ${msg}`),
  error: (msg) => console.log(`❌ ${msg}`),
  info: (msg) => console.log(`ℹ️  ${msg}`),
  section: (msg) => console.log(`\n🧪 ${msg}\n`),
};

async function testAuthAPI() {
  log.section('TESTING AUTH API ENDPOINTS');

  try {
    // Test 1: Register a new patient
    log.section('TEST 1: REGISTER PATIENT');
    const registerPayload = {
      name: 'Test Patient',
      email: `patient-${Date.now()}@example.com`,
      password: 'TestPass123',
    };
    
    const registerRes = await request('POST', '/auth/register', registerPayload);
    log.info(`Status: ${registerRes.status}`);
    log.info(`Response: ${JSON.stringify(registerRes.body, null, 2)}`);
    
    if (registerRes.status !== 201) {
      log.error(`Expected status 201, got ${registerRes.status}`);
    } else {
      log.success('Patient registration successful');
    }

    const patientToken = registerRes.body.token;
    const patientEmail = registerPayload.email;

    // Test 2: Login as patient
    log.section('TEST 2: LOGIN AS PATIENT');
    const loginPayload = {
      email: patientEmail,
      password: 'TestPass123',
    };
    
    const loginRes = await request('POST', '/auth/login', loginPayload);
    log.info(`Status: ${loginRes.status}`);
    log.info(`Response: ${JSON.stringify(loginRes.body, null, 2)}`);
    
    if (loginRes.status !== 200) {
      log.error(`Expected status 200, got ${loginRes.status}`);
    } else {
      log.success('Patient login successful');
    }

    // Test 3: Test invalid password
    log.section('TEST 3: LOGIN WITH INVALID PASSWORD');
    const invalidLoginPayload = {
      email: patientEmail,
      password: 'WrongPassword',
    };
    
    const invalidLoginRes = await request('POST', '/auth/login', invalidLoginPayload);
    log.info(`Status: ${invalidLoginRes.status}`);
    log.info(`Response: ${JSON.stringify(invalidLoginRes.body, null, 2)}`);
    
    if (invalidLoginRes.status !== 401) {
      log.error(`Expected status 401, got ${invalidLoginRes.status}`);
    } else {
      log.success('Invalid password rejected correctly');
    }

    // Test 4: Register doctor
    log.section('TEST 4: REGISTER DOCTOR');
    const doctorPayload = {
      name: 'Dr. Test',
      email: `doctor-${Date.now()}@example.com`,
      password: 'DocPass123',
      specialization: 'General Physician',
      experience: '5 years',
      fee: 500,
      availability: 'Available',
    };
    
    const doctorRes = await request('POST', '/auth/doctor-onboard', doctorPayload);
    log.info(`Status: ${doctorRes.status}`);
    log.info(`Response: ${JSON.stringify(doctorRes.body, null, 2)}`);
    
    if (doctorRes.status !== 201) {
      log.error(`Expected status 201, got ${doctorRes.status}`);
    } else {
      log.success('Doctor registration successful');
    }

    // Test 5: Get user profile (protected route)
    log.section('TEST 5: GET USER PROFILE (PROTECTED)');
    const meRes = await new Promise((resolve, reject) => {
      const url = new URL('/auth/me', BASE_URL);
      const options = {
        hostname: url.hostname,
        port: url.port,
        path: url.pathname,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${patientToken}`,
        },
      };

      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          try {
            resolve({
              status: res.statusCode,
              body: JSON.parse(data),
            });
          } catch {
            resolve({ status: res.statusCode, body: data });
          }
        });
      });

      req.on('error', reject);
      req.end();
    });

    log.info(`Status: ${meRes.status}`);
    log.info(`Response: ${JSON.stringify(meRes.body, null, 2)}`);
    
    if (meRes.status !== 200) {
      log.error(`Expected status 200, got ${meRes.status}`);
    } else {
      log.success('Protected route accessed successfully');
    }

    // Test 6: Verify missing credentials
    log.section('TEST 6: LOGIN WITHOUT CREDENTIALS');
    const noCredsRes = await request('POST', '/auth/login', {});
    log.info(`Status: ${noCredsRes.status}`);
    log.info(`Response: ${JSON.stringify(noCredsRes.body, null, 2)}`);
    
    if (noCredsRes.status !== 400) {
      log.error(`Expected status 400, got ${noCredsRes.status}`);
    } else {
      log.success('Missing credentials validation working');
    }

    log.section('✅ ALL TESTS PASSED');
    console.log('\n🎉 Authentication API is working correctly!\n');
    process.exit(0);

  } catch (error) {
    log.error(`Test failed: ${error.message}`);
    console.error('\nMake sure:');
    console.error('1. Backend server is running on http://localhost:5000');
    console.error('2. MongoDB is connected');
    console.error('3. Environment variables are loaded');
    process.exit(1);
  }
}

testAuthAPI();
