export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request) {
  try {
    const session = await auth();
    
    if (!session || !session.user) {
      return Response.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { pengumumanId } = await request.json();

    if (!pengumumanId) {
      return Response.json(
        { error: 'pengumumanId is required' },
        { status: 400 }
      );
    }

    // Check if pengumuman exists
    const pengumuman = await prisma.pengumuman.findUnique({
      where: { id: pengumumanId }
    });

    if (!pengumuman) {
      return Response.json(
        { error: 'Pengumuman not found' },
        { status: 404 }
      );
    }

    // Mark as read - create/update PengumumanRead record
    const pengumumanRead = await prisma.pengumumanRead.upsert({
      where: {
        pengumumanId_userId: {
          pengumumanId: pengumumanId,
          userId: session.user.id
        }
      },
      update: {
        closedAt: new Date()
      },
      create: {
        pengumumanId: pengumumanId,
        userId: session.user.id,
        closedAt: new Date()
      }
    });

    return Response.json({
      success: true,
      message: 'Pengumuman marked as read',
      data: pengumumanRead
    });

  } catch (error) {
    console.error('Error marking pengumuman as read:', error);
    return Response.json(
      { error: 'Failed to mark pengumuman as read' },
      { status: 500 }
    );
  }
}
