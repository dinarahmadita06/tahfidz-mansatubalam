const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedPengumuman() {
  try {
    // Ambil guru pertama untuk dijadikan pengirim
    const guru = await prisma.guru.findFirst({
      include: {
        user: true
      }
    });

    if (!guru) {
      console.log('Tidak ada guru ditemukan. Silakan buat guru terlebih dahulu.');
      return;
    }

    const pengumumanData = [
      {
        guruId: guru.id,
        judul: 'Wisuda Tahfidz Angkatan 2025',
        konten: `Assalamualaikum Warahmatullahi Wabarakatuh,

Dengan penuh rasa syukur kepada Allah SWT, kami mengumumkan bahwa Wisuda Tahfidz Angkatan 2025 akan diselenggarakan pada:

📅 Tanggal: 15 Maret 2025
🕒 Waktu: 08.00 - 12.00 WIB
📍 Lokasi: Aula Masjid Al-Hikmah

Acara ini akan dihadiri oleh para santri yang telah menyelesaikan target hafalan mereka dengan penuh dedikasi dan kesungguhan.

Kepada seluruh orang tua santri yang putra-putrinya akan mengikuti wisuda, mohon untuk hadir tepat waktu. Akan ada sesi foto bersama dan pemberian sertifikat hafalan.

Dress code: Busana Muslim/Muslimah yang sopan dan rapi.

Jazakumullahu khairan atas perhatian dan dukungannya.

Wassalamualaikum Warahmatullahi Wabarakatuh`,
        kategori: 'wisuda',
        isPenting: true,
        isPublished: true,
        targetRole: ['ORANG_TUA', 'SISWA'],
        tipePengumuman: 'WISUDA',
        createdBy: guru.user.name,
        publishedAt: new Date()
      },
      {
        guruId: guru.id,
        judul: 'Jadwal Muroja\'ah Rutin Bulan Maret',
        konten: `Bismillahirrahmanirrahim,

Demi menjaga kualitas hafalan santri, kami akan mengadakan program Muroja'ah Rutin dengan jadwal sebagai berikut:

🗓️ Setiap Hari: Senin - Jumat
⏰ Waktu: Ba'da Subuh (05.30 - 06.30 WIB)
📖 Materi: Juz yang telah dihafal

Kegiatan ini bertujuan untuk:
✅ Menjaga kekuatan hafalan
✅ Memperbaiki tajwid dan makhraj
✅ Meningkatkan kelancaran bacaan

Kepada orang tua santri, mohon untuk memastikan putra-putri Anda tiba tepat waktu dan membawa Al-Qur'an serta alat tulis.

Barakallahu fiikum.`,
        kategori: 'kegiatan',
        isPenting: false,
        isPublished: true,
        targetRole: ['ORANG_TUA', 'SISWA'],
        tipePengumuman: 'KEGIATAN',
        createdBy: guru.user.name,
        publishedAt: new Date()
      },
      {
        guruId: guru.id,
        judul: 'Ujian Tahsin Semester 2',
        konten: `Kepada Yth. Orang Tua Santri Tahfidz,

Dalam rangka evaluasi kemampuan membaca Al-Qur'an, kami akan mengadakan Ujian Tahsin Semester 2 dengan detail:

📌 Tanggal Pelaksanaan: 20-25 Maret 2025
📌 Sistem: Per kelas, sesuai jadwal yang akan diberikan
📌 Materi Ujian:
   - Tajwid
   - Makhraj huruf
   - Fashohah
   - Kelancaran bacaan

Kriteria Penilaian:
🔹 Tartil (Kelancaran): 25%
🔹 Tajwid: 30%
🔹 Makhraj: 30%
🔹 Fashohah: 15%

Hasil ujian akan dikirimkan melalui portal orang tua paling lambat 1 minggu setelah ujian selesai.

Mohon dukungan orang tua untuk memotivasi putra-putri dalam persiapan ujian ini.

Syukron jazilan.`,
        kategori: 'penilaian',
        isPenting: true,
        isPublished: true,
        targetRole: ['ORANG_TUA', 'SISWA', 'GURU'],
        tipePengumuman: 'UMUM',
        createdBy: guru.user.name,
        publishedAt: new Date()
      },
      {
        guruId: guru.id,
        judul: 'Libur Hari Raya Idul Fitri 1446 H',
        konten: `Assalamualaikum Warahmatullahi Wabarakatuh,

Selamat menunaikan ibadah puasa Ramadhan 1446 H. Kami informasikan bahwa program Tahfidz akan libur pada:

🌙 Periode Libur: 28 Maret - 5 April 2025
🕌 Kembali aktif: 6 April 2025

Selama masa libur, kami mengimbau kepada orang tua untuk:
✨ Tetap mengawasi muroja'ah anak di rumah
✨ Menjaga konsistensi tilawah harian
✨ Memanfaatkan waktu liburan untuk quality time keluarga
✨ Mengajak anak untuk tadarus bersama

Kami ucapkan:
🎊 Taqabbalallahu minna wa minkum
🎊 Minal Aidin wal Faizin
🎊 Mohon maaf lahir dan batin

Semoga kita semua menjadi hamba yang kembali fitri.

Wassalamualaikum Warahmatullahi Wabarakatuh`,
        kategori: 'informasi',
        isPenting: true,
        isPublished: true,
        targetRole: ['ORANG_TUA', 'SISWA', 'GURU', 'ADMIN'],
        tipePengumuman: 'LIBUR',
        createdBy: guru.user.name,
        publishedAt: new Date()
      },
      {
        guruId: guru.id,
        judul: 'Perubahan Jadwal Setoran Kelas 6A',
        konten: `Kepada Orang Tua Santri Kelas 6A,

Dikarenakan ada penyesuaian jadwal guru, maka jadwal setoran untuk Kelas 6A mengalami perubahan:

📋 Jadwal Lama:
- Senin & Rabu: 14.00 - 16.00 WIB

📋 Jadwal Baru:
- Selasa & Kamis: 13.30 - 15.30 WIB

Perubahan ini efektif mulai tanggal 10 Maret 2025.

Mohon untuk menyesuaikan jadwal penjemputan putra-putri Anda.

Terima kasih atas pengertiannya.

Barakallahu fiikum.`,
        kategori: 'informasi',
        isPenting: false,
        isPublished: true,
        targetRole: ['ORANG_TUA'],
        tipePengumuman: 'UMUM',
        createdBy: guru.user.name,
        publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 hari lalu
      },
      {
        guruId: guru.id,
        judul: 'Program Tahfidz Intensif Liburan',
        konten: `Bismillahirrahmanirrahim,

Alhamdulillah, kami akan mengadakan Program Tahfidz Intensif selama liburan semester dengan detail:

🎯 Tujuan Program:
- Menambah hafalan baru minimal 5 halaman
- Mengulang hafalan lama (muroja'ah)
- Memperbaiki kualitas bacaan

📅 Waktu Pelaksanaan:
- 15 Juni - 10 Juli 2025
- Senin - Jum'at
- 07.00 - 12.00 WIB

💰 Biaya:
Rp 500.000,- (sudah termasuk modul, snack, dan sertifikat)

📝 Pendaftaran:
Dibuka mulai 1 Maret 2025
Kuota terbatas: 30 peserta
Contact Person: Ustadz Ahmad (0812-xxxx-xxxx)

Kesempatan emas untuk anak-anak menambah hafalan dengan intensif!

Daftarkan segera putra-putri Anda.

Jazakumullahu khairan.`,
        kategori: 'kegiatan',
        isPenting: false,
        isPublished: true,
        targetRole: ['ORANG_TUA', 'SISWA'],
        tipePengumuman: 'KEGIATAN',
        createdBy: guru.user.name,
        publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 hari lalu
      }
    ];

    console.log('Mulai seeding pengumuman...');

    for (const data of pengumumanData) {
      const pengumuman = await prisma.pengumuman.create({
        data: data
      });
      console.log(`✅ Created pengumuman: ${pengumuman.judul}`);
    }

    console.log('✨ Seeding pengumuman selesai!');
  } catch (error) {
    console.error('Error seeding pengumuman:', error);
  }
}

module.exports = { seedPengumuman };

// Jalankan jika file ini dieksekusi langsung
if (require.main === module) {
  seedPengumuman()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
