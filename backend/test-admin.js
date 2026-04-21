const testAdminSystem = async () => {
  try {
    console.log('🧪 Testing Admin System...\n');

    // Test 1: Login as super admin
    console.log('1️⃣ Testing super admin login...');
    const loginResponse = await fetch('http://localhost:5000/api/v1/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@medflow.com',
        password: 'admin123'
      })
    });

    const loginData = await loginResponse.json();
    console.log('Login response:', loginData);

    if (!loginData.success) {
      throw new Error('Login failed: ' + loginData.message);
    }

    const token = loginData.token;
    if (!token) {
      throw new Error('No token received in login response');
    }

    console.log('✅ Super admin login successful');
    console.log('   Token received:', token.substring(0, 50) + '...');

    // Test 2: Get dashboard stats
    console.log('\n2️⃣ Testing dashboard stats...');
    const statsResponse = await fetch('http://localhost:5000/api/v1/admin/dashboard', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });

    const statsData = await statsResponse.json();
    if (!statsData.success) {
      throw new Error('Dashboard stats failed: ' + statsData.message);
    }

    console.log('✅ Dashboard stats retrieved successfully');
    console.log('   Stats:', statsData.data);

    // Test 3: Get users list
    console.log('\n3️⃣ Testing users list...');
    const usersResponse = await fetch('http://localhost:5000/api/v1/admin/users', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });

    const usersData = await usersResponse.json();
    if (!usersData.success) {
      throw new Error('Users list failed: ' + usersData.message);
    }

    console.log('✅ Users list retrieved successfully');
    console.log('   Total users:', usersData.data.length);

    console.log('\n🎉 All admin system tests passed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

testAdminSystem();