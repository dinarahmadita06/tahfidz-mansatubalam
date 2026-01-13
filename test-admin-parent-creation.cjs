const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function testAdminParentCreation() {
  try {
    console.log('\n📝 Testing admin parent creation via API simulation...\n');

    // Simulate the API request body
    const parentPayload = {
      name: 'Bonbon Admin Test',
      noHP: '08912345678',
      email: 'bonbon.admin.test@wali.tahfidz.sch.id',
      password: 'AdminPassword123',
      nik: `NIK${Date.now()}${Math.random().toString().slice(2, 10)}`
    };

    console.log('📋 Payload being sent:', JSON.stringify(parentPayload, null, 2));
    console.log('\n🔍 Checking validation...');

    // 1. Check required fields
    const required = ['name', 'email', 'password', 'noHP', 'nik'];
    const missing = required.filter(f => !parentPayload[f]);
    if (missing.length > 0) {
      console.log('❌ Missing fields:', missing);
      return;
    }
    console.log('✅ All required fields present');

    // 2. Check password length
    if (parentPayload.password.length < 8) {
      console.log('❌ Password too short (min 8 chars)');
      return;
    }
    console.log('✅ Password length OK');

    // 3. Check phone format
    const phoneRegex = /^(\+62|62|0)[0-9]{9,12}$/;
    const normalizedPhone = parentPayload.noHP.replace(/[-\s]/g, '');
    if (!phoneRegex.test(normalizedPhone)) {
      console.log(`❌ Phone format invalid: ${normalizedPhone}`);
      console.log(`   Regex expects: /^(\+62|62|0)[0-9]{9,12}$/`);
      return;
    }
    console.log('✅ Phone number format OK');

    // 4. Try to create in database
    console.log('\n💾 Creating parent in database...');
    
    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: parentPayload.email.toLowerCase() }
    });

    if (existingUser) {
      console.log('⚠️  Email already exists:', parentPayload.email);
      return;
    }
    console.log('✅ Email is unique');

    // Hash password
    const hashedPassword = await bcrypt.hash(parentPayload.password, 10);

    // Create parent
    const orangTua = await prisma.orangTua.create({
      data: {
        nik: parentPayload.nik,
        pekerjaan: null,
        noTelepon: parentPayload.noHP,
        alamat: null,
        jenisKelamin: 'LAKI_LAKI',
        status: 'approved',
        user: {
          create: {
            email: parentPayload.email.toLowerCase(),
            password: hashedPassword,
            name: parentPayload.name,
            role: 'ORANG_TUA',
            image: null,
            isActive: true
          }
        }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            isActive: true,
            createdAt: true
          }
        }
      }
    });

    console.log('✅ Parent created successfully!');
    console.log('\n📊 Created parent:');
    console.log(`   ID: ${orangTua.id}`);
    console.log(`   Name: ${orangTua.user.name}`);
    console.log(`   Email: ${orangTua.user.email}`);
    console.log(`   Phone: ${orangTua.noTelepon}`);
    console.log(`   Status: ${orangTua.status}`);
    console.log(`   Active: ${orangTua.user.isActive}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Code:', error.code);
    if (error.meta) {
      console.error('Meta:', error.meta);
    }
  } finally {
    await prisma.$disconnect();
  }
}

testAdminParentCreation();
