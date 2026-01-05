/**
 * WhatsApp Report Scheduler
 * 
 * Scheduled job untuk mengirim laporan perkembangan hafalan via WhatsApp
 * secara otomatis (mingguan/bi-mingguan)
 * 
 * Integration dengan: Twilio, MessageBird, atau WhatsApp Business API
 */

import { prisma } from '@/lib/db';
import { generateLaporanPDF } from '@/lib/utils/generateLaporanPDF';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

// ============================================
// Configuration
// ============================================

const SCHEDULE_TYPE = process.env.WHATSAPP_SCHEDULE_TYPE || 'weekly'; // 'weekly' or 'bi-weekly'
const WHATSAPP_API_KEY = process.env.WHATSAPP_API_KEY;
const WHATSAPP_PHONE_FROM = process.env.WHATSAPP_PHONE_FROM;
const WHATSAPP_PROVIDER = process.env.WHATSAPP_PROVIDER || 'twilio'; // 'twilio', 'messagebird', etc

// ============================================
// WhatsApp Message Template
// ============================================

function getWhatsAppTemplate(namaOrtu, namaAnak, periode, startDate, endDate) {
  const formattedStart = format(new Date(startDate), 'dd MMMM yyyy', { locale: idLocale });
  const formattedEnd = format(new Date(endDate), 'dd MMMM yyyy', { locale: idLocale });

  return `Assalamu'alaikum Ayah/Bunda ${namaOrtu},

Berikut kami sampaikan laporan perkembangan hafalan Ananda *${namaAnak}* periode *${periode}*.

📅 Periode: ${formattedStart} – ${formattedEnd}

Semoga menjadi motivasi dan penguat semangat dalam menjaga hafalan Al-Qur'an 🤲✨

📎 Laporan terlampir dalam bentuk PDF

Wassalamu'alaikum warahmatullahi wabarakatuh.
— Guru Pembina Tahfidz`;
}

// ============================================
// Send WhatsApp Message (Provider Agnostic)
// ============================================

async function sendWhatsAppMessage(phoneNumber, message, pdfBuffer, fileName) {
  if (!WHATSAPP_API_KEY) {
    console.warn('⚠️  WHATSAPP_API_KEY not configured. Skipping send.');
    return { success: false, error: 'API key not configured' };
  }

  if (!phoneNumber) {
    console.warn('⚠️  No phone number provided');
    return { success: false, error: 'No phone number' };
  }

  try {
    // Format phone number (ensure E.164 format)
    const formattedPhone = formatPhoneNumber(phoneNumber);

    switch (WHATSAPP_PROVIDER) {
      case 'twilio':
        return await sendViaTwilio(formattedPhone, message, pdfBuffer, fileName);
      case 'messagebird':
        return await sendViaMessageBird(formattedPhone, message, pdfBuffer, fileName);
      default:
        console.error(`❌ Unknown WhatsApp provider: ${WHATSAPP_PROVIDER}`);
        return { success: false, error: `Unknown provider: ${WHATSAPP_PROVIDER}` };
    }
  } catch (error) {
    console.error('❌ Error sending WhatsApp:', error);
    return { success: false, error: error.message };
  }
}

// ============================================
// Twilio Integration
// ============================================

async function sendViaTwilio(phoneNumber, message, pdfBuffer, fileName) {
  try {
    const FormData = require('form-data');
    const fs = require('fs');
    const path = require('path');

    const form = new FormData();
    form.append('From', `whatsapp:${WHATSAPP_PHONE_FROM}`);
    form.append('To', `whatsapp:${phoneNumber}`);
    form.append('Body', message);

    if (pdfBuffer && fileName) {
      form.append('MediaUrl', `file://${path.join(process.cwd(), 'public', 'uploads', fileName)}`);
    }

    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`, {
      method: 'POST',
      body: form,
      headers: {
        'Authorization': `Basic ${Buffer.from(`${process.env.TWILIO_ACCOUNT_SID}:${WHATSAPP_API_KEY}`).toString('base64')}`
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Twilio error');
    }

    const data = await response.json();
    console.log('✅ WhatsApp message sent via Twilio:', data.sid);
    return { success: true, messageId: data.sid };
  } catch (error) {
    console.error('❌ Twilio error:', error);
    return { success: false, error: error.message };
  }
}

// ============================================
// MessageBird Integration
// ============================================

async function sendViaMessageBird(phoneNumber, message, pdfBuffer, fileName) {
  try {
    // MessageBird implementation
    // Note: This is a placeholder - implement based on MessageBird docs
    console.log('⏳ MessageBird integration in development');
    return { success: false, error: 'MessageBird not yet implemented' };
  } catch (error) {
    console.error('❌ MessageBird error:', error);
    return { success: false, error: error.message };
  }
}

// ============================================
// Utility Functions
// ============================================

function formatPhoneNumber(phone) {
  // Remove non-digits
  let cleaned = phone.replace(/\D/g, '');

  // If starts with 0, replace with country code 62
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.slice(1);
  }

  // Ensure +62 format
  if (!cleaned.startsWith('62')) {
    cleaned = '62' + cleaned;
  }

  return `+${cleaned}`;
}

function calculateDateRange(type = 'weekly') {
  const today = new Date();
  let startDate, endDate;

  if (type === 'weekly') {
    // Get start of week (Sunday)
    startDate = new Date(today);
    startDate.setDate(today.getDate() - today.getDay());

    // Get end of week (Saturday)
    endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
  } else if (type === 'bi-weekly') {
    // Get start of 2-week period
    const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 86400000);
    const weekNumber = Math.floor(dayOfYear / 14);

    startDate = new Date(today.getFullYear(), 0, 1);
    startDate.setDate(1 + weekNumber * 14);

    endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 13);
  }

  return { startDate, endDate };
}

// ============================================
// Main Scheduler Function
// ============================================

export async function runWhatsAppReportScheduler() {
  console.log('\n🤖 Starting WhatsApp Report Scheduler...');
  console.log(`📋 Schedule type: ${SCHEDULE_TYPE}`);

  try {
    // Get date range
    const { startDate, endDate } = calculateDateRange(SCHEDULE_TYPE);
    console.log(`📅 Period: ${format(startDate, 'dd MMM yyyy')} – ${format(endDate, 'dd MMM yyyy')}`);

    // Fetch all parent-child relationships
    const relationships = await prisma.orangTuaSiswa.findMany({
      include: {
        orangTua: {
          include: {
            user: { select: { name: true, phone: true } }
          }
        },
        siswa: {
          include: {
            user: { select: { name: true } },
            kelas: { select: { nama: true } }
          }
        }
      }
    });

    console.log(`👥 Found ${relationships.length} parent-student relationships`);

    let successCount = 0;
    let failureCount = 0;

    // Send report to each parent for each of their children
    for (const rel of relationships) {
      try {
        const namaOrtu = rel.orangTua.user.name;
        const namaAnak = rel.siswa.user.name;
        const phoneNumber = rel.orangTua.user.phone;
        const periode = SCHEDULE_TYPE === 'weekly' ? 'Mingguan' : 'Dua Mingguan';

        console.log(`\n📱 Sending report for ${namaAnak} to parent ${namaOrtu} (${phoneNumber})`);

        // Generate PDF
        const penilaianList = await prisma.penilaian.findMany({
          where: {
            siswaId: rel.siswa.id,
            createdAt: {
              gte: startDate,
              lte: new Date(endDate.getTime() + 24 * 60 * 60 * 1000)
            }
          },
          include: {
            hafalan: { select: { surah: true, ayatMulai: true, ayatSelesai: true } }
          },
          orderBy: { createdAt: 'asc' }
        });

        if (penilaianList.length === 0) {
          console.log('⏭️  No assessment data for this period, skipping');
          continue;
        }

        // Prepare penilaian data
        const formattedPenilaian = penilaianList.map((p) => ({
          tanggal: p.createdAt,
          surah: p.hafalan?.surah || '-',
          ayat: `${p.hafalan?.ayatMulai || '?'}-${p.hafalan?.ayatSelesai || '?'}`,
          tajwid: p.tajwid || '-',
          kelancaran: p.kelancaran || '-',
          makhraj: p.makhraj || '-',
          implementasi: p.adab || '-',
          nilaiAkhir: p.nilaiAkhir || 0,
          catatan: p.catatan || '',
          status: p.nilaiAkhir
            ? p.nilaiAkhir >= 75
              ? 'Lulus'
              : p.nilaiAkhir >= 60
              ? 'Lanjut'
              : 'Belum Setoran'
            : 'Belum Setoran'
        }));

        // Calculate statistics
        const totalPenilaian = formattedPenilaian.length;
        const totalNilai = formattedPenilaian.reduce((sum, p) => sum + (p.nilaiAkhir || 0), 0);
        const rataRataNilai = totalPenilaian > 0 ? totalNilai / totalPenilaian : 0;

        // Get guru info
        const firstPenilaian = await prisma.penilaian.findFirst({
          where: { siswaId: rel.siswa.id },
          include: { guru: { include: { user: { select: { name: true } } } } }
        });

        // Generate PDF
        const doc = await generateLaporanPDF({
          siswa: {
            id: rel.siswa.id,
            nama: namaAnak,
            kelas: rel.siswa.kelas?.nama || 'Tidak Ada'
          },
          guru: {
            id: firstPenilaian?.guru?.id,
            nama: firstPenilaian?.guru?.user?.name || 'Guru Pembina',
            signatureUrl: firstPenilaian?.guru?.signatureUrl || null
          },
          penilaianList: formattedPenilaian,
          statistics: {
            totalPenilaian,
            rataRataNilai,
            halalanTerakhir: `${formattedPenilaian[formattedPenilaian.length - 1].surah} ${formattedPenilaian[formattedPenilaian.length - 1].ayat}`,
            konsistensi: new Set(formattedPenilaian.map((p) => format(new Date(p.tanggal), 'yyyy-MM-dd'))).size
          },
          startDate,
          endDate,
          periodType: periode
        });

        const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
        const fileName = `Laporan_Hafalan_${namaAnak}_${format(startDate, 'ddMMyyyy')}_${format(endDate, 'ddMMyyyy')}.pdf`;

        // Prepare WhatsApp message
        const message = getWhatsAppTemplate(namaOrtu, namaAnak, periode, startDate, endDate);

        // Send via WhatsApp
        const result = await sendWhatsAppMessage(phoneNumber, message, pdfBuffer, fileName);

        if (result.success) {
          console.log(`✅ Successfully sent to ${namaOrtu}`);
          successCount++;

          // Save delivery log to database (optional)
          await saveDeliveryLog({
            anakId: rel.siswa.id,
            orangtuaId: rel.orangTua.id,
            periode: periode,
            startDate,
            endDate,
            status: 'success',
            messageId: result.messageId
          });
        } else {
          console.log(`❌ Failed to send to ${namaOrtu}: ${result.error}`);
          failureCount++;

          await saveDeliveryLog({
            anakId: rel.siswa.id,
            orangtuaId: rel.orangTua.id,
            periode: periode,
            startDate,
            endDate,
            status: 'failed',
            error: result.error
          });
        }
      } catch (error) {
        console.error(`❌ Error processing relationship:`, error);
        failureCount++;
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`   ✅ Success: ${successCount}`);
    console.log(`   ❌ Failed: ${failureCount}`);
    console.log(`   📈 Total: ${successCount + failureCount}`);

    return { success: true, sent: successCount, failed: failureCount };
  } catch (error) {
    console.error('❌ Scheduler error:', error);
    return { success: false, error: error.message };
  }
}

// ============================================
// Save Delivery Log (optional database tracking)
// ============================================

async function saveDeliveryLog(data) {
  try {
    // TODO: Create WhatsAppDeliveryLog table in Prisma schema if needed
    // For now, just log to console
    console.log('📝 Delivery log:', data);
  } catch (error) {
    console.error('Error saving delivery log:', error);
  }
}

// ============================================
// Export for external schedulers (Vercel Cron, node-cron, etc)
// ============================================

export { runWhatsAppReportScheduler as whatsappReportScheduler };
