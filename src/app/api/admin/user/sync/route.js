export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import bcrypt from 'bcryptjs';

// POST - Sync current logged-in user to database
export async function POST(request) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    console.log('USER SYNC - Session user:', {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      role: session.user.role
    });

    // Check if user exists in database
    const existingUser = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    if (existingUser) {
      console.log('USER SYNC - User already exists:', {
        id: existingUser.id,
        email: existingUser.email,
        role: existingUser.role
      });

      return NextResponse.json({
        message: 'User already exists in database',
        user: {
          id: existingUser.id,
          email: existingUser.email,
          name: existingUser.name,
          role: existingUser.role
        }
      });
    }

    console.log('USER SYNC - User not found, creating new user...');

    // User doesn't exist, create it
    // This should not happen normally, but we'll handle it
    const defaultPassword = await bcrypt.hash('password123', 10);

    const newUser = await prisma.user.create({
      data: {
        id: session.user.id,
        email: session.user.email || `user-${session.user.id}@tahfidz.com`,
        name: session.user.name || 'Unknown User',
        role: session.user.role || 'ADMIN',
        password: defaultPassword
      }
    });

    console.log('USER SYNC - Created new user:', {
      id: newUser.id,
      email: newUser.email,
      role: newUser.role
    });

    return NextResponse.json({
      message: 'User created successfully',
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role
      },
      warning: 'User was missing from database and has been created with default password: password123'
    }, { status: 201 });

  } catch (error) {
    console.error('USER SYNC - Error:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      meta: error.meta
    });

    // Handle Prisma errors
    if (error.code === 'P2002') {
      return NextResponse.json({
        error: 'User dengan email tersebut sudah ada',
        details: error.message
      }, { status: 400 });
    }

    return NextResponse.json({
      error: 'Gagal sync user',
      details: error.message,
      code: error.code || 'UNKNOWN_ERROR'
    }, { status: 500 });
  }
}

// GET - Check if current user exists in database
export async function GET(request) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    console.log('USER CHECK - Session user:', {
      id: session.user.id,
      email: session.user.email,
      role: session.user.role
    });

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      console.log('USER CHECK - User NOT found in database');
      return NextResponse.json({
        exists: false,
        sessionUser: {
          id: session.user.id,
          email: session.user.email,
          name: session.user.name,
          role: session.user.role
        },
        message: 'User not found in database. Please call POST /api/admin/user/sync to create user.'
      });
    }

    console.log('USER CHECK - User found:', user);

    return NextResponse.json({
      exists: true,
      user: user
    });

  } catch (error) {
    console.error('USER CHECK - Error:', error);
    return NextResponse.json({
      error: 'Gagal check user',
      details: error.message
    }, { status: 500 });
  }
}
