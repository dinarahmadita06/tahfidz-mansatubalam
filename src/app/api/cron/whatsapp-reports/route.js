/**
 * Cron Job Endpoint untuk WhatsApp Report Scheduler
 * Dipanggil oleh Vercel Cron Jobs (atau external cron service)
 * 
 * Konfigurasi di vercel.json:
 * {
 *   "crons": [
 *     {
 *       "path": "/api/cron/whatsapp-reports",
 *       "schedule": "0 9 * * 1" // Setiap Senin jam 9 pagi
 *     }
 *   ]
 * }
 */

import { NextResponse } from 'next/server';
import { runWhatsAppReportScheduler } from '@/lib/utils/whatsappReportScheduler';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    // Security: Verify request is from Vercel Cron or authorized source
    const authHeader = request.headers.get('authorization');
    const expectedToken = process.env.CRON_SECRET_TOKEN;

    if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('🚀 WhatsApp Report Scheduler triggered');

    // Run scheduler
    const result = await runWhatsAppReportScheduler();

    return NextResponse.json({
      success: result.success,
      message: 'WhatsApp reports sent',
      details: {
        sent: result.sent || 0,
        failed: result.failed || 0,
        error: result.error || null
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Cron error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
