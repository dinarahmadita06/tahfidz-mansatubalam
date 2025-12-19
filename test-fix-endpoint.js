import fetch from 'node-fetch';

async function fixDemoAccounts() {
  try {
    console.log('🔄 Calling fix-demo-accounts API endpoint...\n');
    
    const response = await fetch('https://tahfidz-quran-mansatubalam.vercel.app/api/admin/fix-demo-accounts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    if (data.success) {
      console.log('✅ Demo accounts fixed successfully!\n');
      console.log('📋 Changes made:');
      console.log(`   Guru Profile Created: ${data.changes.guruProfileCreated}`);
      console.log(`   Siswa Account Created: ${data.changes.siswaAccountCreated}\n`);
      console.log('📝 Demo Credentials:');
      console.log(`   Admin: ${data.credentials.admin.email} / ${data.credentials.admin.password}`);
      console.log(`   Guru: ${data.credentials.guru.email} / ${data.credentials.guru.password}`);
      console.log(`   Siswa: ${data.credentials.siswa.email} / ${data.credentials.siswa.password}`);
      console.log(`   Orang Tua: ${data.credentials.orangTua.email} / ${data.credentials.orangTua.password}\n`);
    } else {
      console.log('❌ Error:', data.error);
    }

  } catch (error) {
    console.error('❌ Failed to call API:', error.message);
  }
}

fixDemoAccounts();
