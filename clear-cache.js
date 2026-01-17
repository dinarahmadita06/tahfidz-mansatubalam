/**
 * Clear Cache Script
 * Run after migration to refresh UI data
 */

import fetch from 'node-fetch';

async function clearCache() {
  console.log('🧹 Clearing cache...\n');

  try {
    // Call the clear-cache endpoint
    const response = await fetch('http://localhost:3000/api/admin/clear-cache', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ cacheKey: 'all' })
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Cache cleared successfully!');
      console.log(result);
    } else {
      console.log('⚠️  Could not clear cache via API (server might not be running)');
      console.log('   Please refresh the browser to see updated data.');
    }
  } catch (error) {
    console.log('⚠️  Could not connect to server:', error.message);
    console.log('   Please refresh the browser manually to see updated data.');
  }
}

clearCache();
