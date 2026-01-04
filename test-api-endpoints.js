// Test the updated API endpoint responses
async function testEndpoint() {
  console.log('🧪 Testing updated endpoints...\n');

  try {
    // Note: This test assumes you have valid auth session
    const endpoints = [
      'http://localhost:3000/api/guru/aktivitas-list?limit=8',
      'http://localhost:3000/api/siswa/aktivitas-list?limit=8',
    ];

    for (const url of endpoints) {
      console.log(`\n📍 Testing: ${url}`);
      console.log('─'.repeat(60));

      const response = await fetch(url);
      const data = await response.json();

      if (data.success && data.data && data.data.length > 0) {
        const firstActivity = data.data[0];
        console.log('✅ Response structure:');
        console.log(`   - Has "success": ${!!data.success}`);
        console.log(`   - Has "data" array: ${Array.isArray(data.data)}`);
        console.log(`   - Has "pagination": ${!!data.pagination}`);
        console.log('\n✅ Activity object fields:');
        console.log(`   - id: ${firstActivity.id ? '✓' : '✗'}`);
        console.log(`   - action: ${firstActivity.action ? '✓' : '✗'}`);
        console.log(`   - title: ${firstActivity.title ? '✓' : '✗'}`);
        console.log(`   - description: ${firstActivity.description ? '✓' : '✗'}`);
        console.log(`   - createdAt: ${firstActivity.createdAt ? '✓' : '✗'}`);
        console.log(`   - metadata: ${firstActivity.metadata !== undefined ? '✓' : '✗'}`);
        console.log(`   - timeAgo: ${firstActivity.timeAgo ? '❌ SHOULD NOT EXIST' : '✓ Removed from API'}`);
        console.log('\n📊 Pagination:');
        console.log(`   - total: ${data.pagination.total}`);
        console.log(`   - pages: ${data.pagination.pages}`);
        console.log(`   - limit: ${data.pagination.limit}`);
      } else {
        console.log(`⚠️  Response: ${JSON.stringify(data, null, 2).substring(0, 200)}`);
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// testEndpoint();
console.log('✅ Endpoint verification script ready');
console.log('Uncomment testEndpoint() to run test');
