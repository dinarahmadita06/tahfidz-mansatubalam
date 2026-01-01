const fetch = require('node-fetch');

async function testParentCreation() {
  const testData = {
    name: 'Test Parent ' + Date.now(),
    email: `testparent${Date.now()}@wali.tahfidz.sch.id`,
    password: 'TestPassword123',
    noHP: '08123456789',
    pekerjaan: 'Pengusaha',
    alamat: 'Jl. Test No. 123',
    nik: `NIK${Date.now()}${Math.random().toString().slice(2, 10)}`
  };

  console.log('Testing parent creation with data:', testData);

  try {
    const response = await fetch('http://localhost:3001/api/admin/orangtua', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': 'authjs.session-token=test' // This will fail auth, but shows the structure
      },
      body: JSON.stringify(testData)
    });

    const result = await response.json();
    
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(result, null, 2));

    if (response.ok) {
      console.log('✅ Parent creation successful');
    } else {
      console.log('❌ Parent creation failed');
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testParentCreation();
