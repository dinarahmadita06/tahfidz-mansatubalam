const { Client } = require('pg');

async function updateUserData() {
  const client = new Client({
    connectionString: process.env.DIRECT_DATABASE_URL || process.env.DATABASE_URL
  });

  try {
    await client.connect();
    console.log('Connected to database');
    
    // Check users without usernames
    const result = await client.query('SELECT id, name, email, role FROM "User" WHERE username IS NULL LIMIT 100;');
    console.log('Users without username:', result.rows.length);
    
    if (result.rows.length > 0) {
      for (const user of result.rows) {
        let username = user.name.toLowerCase().replace(/\s+/g, '.');
        
        if (user.role === 'SISWA' && user.email) {
          const emailParts = user.email.split('@')[0];
          if (emailParts) username = emailParts;
        } else if (user.role === 'ORANG_TUA' && user.email) {
          const emailParts = user.email.split('@')[0];
          if (emailParts) username = emailParts;
        }
        
        // Make sure it's unique by appending a number if needed
        let uniqueUsername = username;
        let counter = 1;
        while (true) {
          try {
            const checkResult = await client.query(
              'SELECT id FROM "User" WHERE username = $1 AND id != $2',
              [uniqueUsername, user.id]
            );
            
            if (checkResult.rows.length === 0) {
              break; // Username is unique
            }
            
            uniqueUsername = `${username}_${counter}`;
            counter++;
          } catch (err) {
            console.error('Error checking username uniqueness:', err);
            break;
          }
        }
        
        // Update the user
        await client.query(
          'UPDATE "User" SET username = $1 WHERE id = $2',
          [uniqueUsername, user.id]
        );
        
        console.log(`Updated user ${user.name} (${user.role}) with username: ${uniqueUsername}`);
      }
      
      console.log('Username update completed!');
    } else {
      console.log('No users without username found.');
    }
  } catch (error) {
    console.error('Error updating user data:', error);
  } finally {
    await client.end();
  }
}

updateUserData().catch(console.error);