export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import bcrypt from 'bcryptjs';

// Simple in-memory store for rate limiting (for development)
// In production, use Redis or database-based rate limiting
const rateLimitStore = new Map();

export async function POST(request) {
  try {
    const { username, dobInput, role } = await request.json();
    
    // Rate limiting: max 5 attempts per IP per 15 minutes
    const clientIP = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const now = Date.now();
    const windowMs = 15 * 60 * 1000; // 15 minutes
    const maxAttempts = 5;
    
    const ipStore = rateLimitStore.get(clientIP) || [];
    // Remove attempts older than 15 minutes
    const recentAttempts = ipStore.filter(time => now - time < windowMs);
    
    if (recentAttempts.length >= maxAttempts) {
      return NextResponse.json(
        { error: 'Terlalu banyak permintaan. Coba lagi nanti.' },
        { status: 429 }
      );
    }
    
    // Add current attempt
    recentAttempts.push(now);
    rateLimitStore.set(clientIP, recentAttempts);
    
    // Validate input
    if (!username || !dobInput || !role) {
      return NextResponse.json(
        { error: 'Username, tanggal lahir, dan role wajib diisi' },
        { status: 400 }
      );
    }
    
    // Normalize username (trim whitespace)
    const normalizedUsername = username.trim();
    
    // Validate role
    if (!['GURU', 'SISWA', 'ORANG_TUA'].includes(role)) {
      return NextResponse.json(
        { error: 'Role tidak valid' },
        { status: 400 }
      );
    }
    
    // Normalize DOB input to YYYY-MM-DD format
    let normalizedDOB;
    try {
      const dateObj = new Date(dobInput);
      if (isNaN(dateObj.getTime())) {
        throw new Error('Invalid date');
      }
      normalizedDOB = dateObj.toISOString().split('T')[0]; // YYYY-MM-DD
    } catch (error) {
      return NextResponse.json(
        { error: 'Format tanggal lahir tidak valid' },
        { status: 400 }
      );
    }
    
    // Find user based on role and username
    let user, targetDOB;
    
    switch (role) {
      case 'GURU':
        // Check if username starts with 'G' and matches guru records
        if (!normalizedUsername.toUpperCase().startsWith('G')) {
          return NextResponse.json(
            { error: 'Data tidak sesuai. Periksa Username dan Tanggal Lahir.' },
            { status: 400 }
          );
        }
        
        const guru = await prisma.guru.findFirst({
          where: {
            user: {
              username: normalizedUsername
            }
          },
          include: {
            user: true
          }
        });
        
        if (!guru || !guru.tanggalLahir) {
          return NextResponse.json(
            { error: 'Data tidak sesuai. Periksa Username dan Tanggal Lahir.' },
            { status: 400 }
          );
        }
        
        targetDOB = new Date(guru.tanggalLahir).toISOString().split('T')[0];
        user = guru.user;
        break;
        
      case 'SISWA':
        // Check if username is numeric and matches siswa records
        if (!/^\d+$/.test(normalizedUsername)) {
          return NextResponse.json(
            { error: 'Data tidak sesuai. Periksa Username dan Tanggal Lahir.' },
            { status: 400 }
          );
        }
        
        const siswa = await prisma.siswa.findFirst({
          where: {
            user: {
              username: normalizedUsername
            }
          },
          include: {
            user: true
          }
        });
        
        if (!siswa || !siswa.tanggalLahir) {
          return NextResponse.json(
            { error: 'Data tidak sesuai. Periksa Username dan Tanggal Lahir.' },
            { status: 400 }
          );
        }
        
        targetDOB = new Date(siswa.tanggalLahir).toISOString().split('T')[0];
        user = siswa.user;
        break;
        
      case 'ORANG_TUA':
        // Check if username is numeric and matches orangtua records
        if (!/^\d+$/.test(normalizedUsername)) {
          return NextResponse.json(
            { error: 'Data tidak sesuai. Periksa Username dan Tanggal Lahir.' },
            { status: 400 }
          );
        }
        
        const orangtua = await prisma.orangTua.findFirst({
          where: {
            user: {
              username: normalizedUsername
            }
          },
          include: {
            user: true,
            orangTuaSiswa: {
              include: {
                siswa: true
              }
            }
          }
        });
        
        if (!orangtua || !orangtua.orangTuaSiswa || orangtua.orangTuaSiswa.length === 0) {
          return NextResponse.json(
            { error: 'Data tidak sesuai. Periksa Username dan Tanggal Lahir.' },
            { status: 400 }
          );
        }
        
        // Get the DOB of the first child
        const firstChild = orangtua.orangTuaSiswa[0].siswa;
        if (!firstChild || !firstChild.tanggalLahir) {
          return NextResponse.json(
            { error: 'Data tidak sesuai. Periksa Username dan Tanggal Lahir.' },
            { status: 400 }
          );
        }
        
        // For parents, the DOB to verify is the child's DOB
        targetDOB = new Date(firstChild.tanggalLahir).toISOString().split('T')[0];
        user = orangtua.user;
        break;
        
      default:
        return NextResponse.json(
          { error: 'Data tidak sesuai. Periksa Username dan Tanggal Lahir.' },
          { status: 400 }
        );
    }
    
    // Verify DOB matches
    if (normalizedDOB !== targetDOB) {
      return NextResponse.json(
        { error: 'Data tidak sesuai. Periksa Username dan Tanggal Lahir.' },
        { status: 400 }
      );
    }
    
    // Generate default password based on role
    let defaultPassword;
    switch (role) {
      case 'GURU':
      case 'SISWA':
        defaultPassword = normalizedDOB; // YYYY-MM-DD
        break;
      case 'ORANG_TUA':
        // Convert YYYY-MM-DD to DDMMYYYY
        const [year, month, day] = normalizedDOB.split('-');
        defaultPassword = `${day}${month}${year}`;
        break;
      default:
        return NextResponse.json(
          { error: 'Data tidak sesuai. Periksa Username dan Tanggal Lahir.' },
          { status: 400 }
        );
    }
    
    // Hash the new password
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);
    
    // Update user's password
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    });
    
    return NextResponse.json({
      message: 'Password berhasil direset. Silakan login dengan password default.',
      defaultPassword: role === 'ORANG_TUA' ? 
        `${targetDOB.split('-')[2]}${targetDOB.split('-')[1]}${targetDOB.split('-')[0]}` : 
        targetDOB
    });
    
  } catch (error) {
    console.error('Error in forgot-password:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mereset password' },
      { status: 500 }
    );
  }
}