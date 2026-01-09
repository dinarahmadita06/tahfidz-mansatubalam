import { signIn } from 'next-auth/react';

// This would be tested in the browser/frontend
// For now, let's just verify auth check logic works by testing the endpoint

const testLogin = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/auth/callback/credentials', {
      method: 'POST',
      body: new URLSearchParams({
        email: 'reno@test.local',
        password: 'password123',
        csrfToken: ''
      })
    });
    console.log('Response:', response.status, response.statusText);
  } catch (error) {
    console.error('Error:', error.message);
  }
};

testLogin();
