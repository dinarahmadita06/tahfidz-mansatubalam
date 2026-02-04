import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('🔍 Checking admin account...');
    
    const admin = await prisma.user.findFirst({
      where: { username: 'admin.tahfidz1' }
    });
    
    if (!admin) {
      console.log('❌ Admin not found, creating...');
      const hashedPassword = await bcrypt.hash('admin.mansatu', 10);
      const newAdmin = await prisma.user.create({
        data: {
          username: 'admin.tahfidz1',
          email: 'admin@tahfidz.com',
          password: hashedPassword,
          name: 'Administrator',
          role: 'ADMIN',
          isActive: true
        }
      });
      
      return NextResponse.json({
        success: true,
        message: 'Admin created',
        admin: {
          id: newAdmin.id,
          username: newAdmin.username,
          email: newAdmin.email,
          role: newAdmin.role,
          isActive: newAdmin.isActive
        }
      });
    }
    
    // Check password
    const passwordValid = admin.password 
      ? await bcrypt.compare('admin.mansatu', admin.password)
      : false;
    
    const result = {
      found: true,
      id: admin.id,
      username: admin.username,
      email: admin.email,
      role: admin.role,
      isActive: admin.isActive,
      hasPassword: !!admin.password,
      passwordValid
    };
    
    // Reset password if invalid
    if (!passwordValid) {
      console.log('⚠️ Password invalid, resetting...');
      const hashedPassword = await bcrypt.hash('admin.mansatu', 10);
      await prisma.user.update({
        where: { id: admin.id },
        data: { password: hashedPassword }
      });
      result.passwordReset = true;
      result.passwordValid = true;
    }
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
