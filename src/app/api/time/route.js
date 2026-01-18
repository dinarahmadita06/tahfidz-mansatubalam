import { NextResponse } from 'next/server';

/**
 * API endpoint untuk mendapatkan waktu server dalam format WIB (Asia/Jakarta)
 * Menghindari timezone mismatch antara server UTC dan client
 */
export async function GET() {
  try {
    const now = new Date();
    
    // Format tanggal dan waktu dalam WIB
    const dateOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'Asia/Jakarta'
    };
    
    const timeOptions = {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: 'Asia/Jakarta',
      hour12: false
    };
    
    const dateString = new Intl.DateTimeFormat('id-ID', dateOptions).format(now);
    const timeString = new Intl.DateTimeFormat('id-ID', timeOptions).format(now);
    
    // Get hour dalam WIB untuk greeting
    const hourString = new Intl.DateTimeFormat('id-ID', {
      hour: 'numeric',
      timeZone: 'Asia/Jakarta',
      hour12: false
    }).format(now);
    const hour = parseInt(hourString);
    
    let greeting = 'Selamat Malam';
    if (hour < 12) greeting = 'Selamat Pagi';
    else if (hour < 15) greeting = 'Selamat Siang';
    else if (hour < 18) greeting = 'Selamat Sore';
    
    return NextResponse.json({
      date: dateString,
      time: timeString,
      greeting,
      hour,
      timestamp: now.toISOString(),
      timezone: 'Asia/Jakarta'
    });
  } catch (error) {
    console.error('Error getting time:', error);
    return NextResponse.json(
      { error: 'Failed to get time' },
      { status: 500 }
    );
  }
}
