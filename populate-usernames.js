import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DIRECT_DATABASE_URL || process.env.DATABASE_URL
    }
  }
});

async function populateUsernames() {
  try {
    console.log('Populating usernames for users without username...');
    
    // Find users without username
    const usersWithoutUsername = await prisma.user.findMany({
      where: {
        username: null
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    });
    
    console.log(`Found ${usersWithoutUsername.length} users without username`);
    
    if (usersWithoutUsername.length > 0) {
      for (const user of usersWithoutUsername) {
        // Generate a username based on name and role
        let username = '';
        
        if (user.role === 'SISWA' && user.email) {
          // For students, try to extract NIS from email
          const emailParts = user.email.split('@');
          if (emailParts[0]) {
            username = emailParts[0]; // This should be the NIS part
          } else {
            // Fallback: convert name to lowercase with dots
            username = user.name.toLowerCase().replace(/\s+/g, '.');
          }
        } else if (user.role === 'ORANG_TUA' && user.email) {
          // For parents, try to extract from email
          const emailParts = user.email.split('@');
          if (emailParts[0]) {
            username = emailParts[0];
          } else {
            username = user.name.toLowerCase().replace(/\s+/g, '.');
          }
        } else {
          // For admin/guru, use name
          username = user.name.toLowerCase().replace(/\s+/g, '.');
        }
        
        // Make sure username is unique
        let uniqueUsername = username;
        let counter = 1;
        while (true) {
          const existingUser = await prisma.user.findUnique({
            where: { username: uniqueUsername }
          });
          
          if (!existingUser) {
            break; // Username is unique
          }
          
          uniqueUsername = `${username}_${counter}`;
          counter++;
        }
        
        // Update the user with the new username
        await prisma.user.update({
          where: { id: user.id },
          data: { username: uniqueUsername }
        });
        
        console.log(`Updated user ${user.name} (${user.role}) with username: ${uniqueUsername}`);
      }
      
      console.log('Username population completed!');
    } else {
      console.log('No users without username found.');
    }
  } catch (error) {
    console.error('Error populating usernames:', error);
  } finally {
    await prisma.$disconnect();
  }
}

populateUsernames();