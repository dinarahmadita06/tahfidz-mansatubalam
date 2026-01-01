const testPayload = {
  nis: "890121",
  tanggalLahir: "2009-08-03",
  namaLengkap: "Budi Orang Tua Test",
  noHP: "08123456789",
  password: "Password123"
};

async function testEndpoints() {
  console.log('\n🧪 Testing Parent Registration API Endpoints\n');

  try {
    // Test 1: Verify Student
    console.log('📝 Test 1: Verify Student');
    console.log('POST /api/auth/verify-student');
    const verifyRes = await fetch('http://localhost:3000/api/auth/verify-student', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nis: testPayload.nis,
        tanggalLahir: testPayload.tanggalLahir
      })
    });

    const verifyData = await verifyRes.json();
    console.log(`Status: ${verifyRes.status}`);
    console.log(`Response:`, JSON.stringify(verifyData, null, 2));

    if (!verifyRes.ok) {
      console.log('❌ Verification failed');
      return;
    }

    console.log('✅ Verification succeeded\n');

    // Test 2: Register Parent
    console.log('📝 Test 2: Register Parent Account');
    console.log('POST /api/auth/register-orangtua');
    const registerRes = await fetch('http://localhost:3000/api/auth/register-orangtua', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testPayload)
    });

    const registerData = await registerRes.json();
    console.log(`Status: ${registerRes.status}`);
    console.log(`Response:`, JSON.stringify(registerData, null, 2));

    if (registerRes.ok) {
      console.log('\n✅ Parent registration succeeded!');
    } else {
      console.log('\n❌ Parent registration failed');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testEndpoints();
