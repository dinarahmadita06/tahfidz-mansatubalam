import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { generateNextTeacherUsername } from '@/lib/passwordUtils';

export async function GET(request) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🔍 Generating next teacher username');
    
    const nextUsername = await generateNextTeacherUsername(prisma);
    
    console.log('✅ Generated next username:', nextUsername);
    
    return NextResponse.json({ username: nextUsername });
  } catch (error) {
    console.error('Error generating next teacher username:', error);
    return NextResponse.json(
      { error: 'Failed to generate username' },
      { status: 500 }
    );
  }
}