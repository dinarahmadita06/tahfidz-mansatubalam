import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Data 114 Surah Al-Quran
const surahData = [
  { nomor: 1, nama: 'الفاتحة', namaLatin: 'Al-Fatihah', jumlahAyat: 7, tempatTurun: 'Mekah', juz: [1] },
  { nomor: 2, nama: 'البقرة', namaLatin: 'Al-Baqarah', jumlahAyat: 286, tempatTurun: 'Madinah', juz: [1, 2, 3] },
  { nomor: 3, nama: 'آل عمران', namaLatin: 'Ali Imran', jumlahAyat: 200, tempatTurun: 'Madinah', juz: [3, 4] },
  { nomor: 4, nama: 'النساء', namaLatin: 'An-Nisa', jumlahAyat: 176, tempatTurun: 'Madinah', juz: [4, 5, 6] },
  { nomor: 5, nama: 'المائدة', namaLatin: 'Al-Maidah', jumlahAyat: 120, tempatTurun: 'Madinah', juz: [6, 7] },
  { nomor: 6, nama: 'الأنعام', namaLatin: 'Al-Anam', jumlahAyat: 165, tempatTurun: 'Mekah', juz: [7, 8] },
  { nomor: 7, nama: 'الأعراف', namaLatin: 'Al-Araf', jumlahAyat: 206, tempatTurun: 'Mekah', juz: [8, 9] },
  { nomor: 8, nama: 'الأنفال', namaLatin: 'Al-Anfal', jumlahAyat: 75, tempatTurun: 'Madinah', juz: [9, 10] },
  { nomor: 9, nama: 'التوبة', namaLatin: 'At-Taubah', jumlahAyat: 129, tempatTurun: 'Madinah', juz: [10, 11] },
  { nomor: 10, nama: 'يونس', namaLatin: 'Yunus', jumlahAyat: 109, tempatTurun: 'Mekah', juz: [11] },
  { nomor: 11, nama: 'هود', namaLatin: 'Hud', jumlahAyat: 123, tempatTurun: 'Mekah', juz: [11, 12] },
  { nomor: 12, nama: 'يوسف', namaLatin: 'Yusuf', jumlahAyat: 111, tempatTurun: 'Mekah', juz: [12, 13] },
  { nomor: 13, nama: 'الرعد', namaLatin: 'Ar-Rad', jumlahAyat: 43, tempatTurun: 'Madinah', juz: [13] },
  { nomor: 14, nama: 'ابراهيم', namaLatin: 'Ibrahim', jumlahAyat: 52, tempatTurun: 'Mekah', juz: [13] },
  { nomor: 15, nama: 'الحجر', namaLatin: 'Al-Hijr', jumlahAyat: 99, tempatTurun: 'Mekah', juz: [14] },
  { nomor: 16, nama: 'النحل', namaLatin: 'An-Nahl', jumlahAyat: 128, tempatTurun: 'Mekah', juz: [14] },
  { nomor: 17, nama: 'الإسراء', namaLatin: 'Al-Isra', jumlahAyat: 111, tempatTurun: 'Mekah', juz: [15] },
  { nomor: 18, nama: 'الكهف', namaLatin: 'Al-Kahf', jumlahAyat: 110, tempatTurun: 'Mekah', juz: [15, 16] },
  { nomor: 19, nama: 'مريم', namaLatin: 'Maryam', jumlahAyat: 98, tempatTurun: 'Mekah', juz: [16] },
  { nomor: 20, nama: 'طه', namaLatin: 'Taha', jumlahAyat: 135, tempatTurun: 'Mekah', juz: [16] },
  { nomor: 21, nama: 'الأنبياء', namaLatin: 'Al-Anbiya', jumlahAyat: 112, tempatTurun: 'Mekah', juz: [17] },
  { nomor: 22, nama: 'الحج', namaLatin: 'Al-Hajj', jumlahAyat: 78, tempatTurun: 'Madinah', juz: [17] },
  { nomor: 23, nama: 'المؤمنون', namaLatin: 'Al-Muminun', jumlahAyat: 118, tempatTurun: 'Mekah', juz: [18] },
  { nomor: 24, nama: 'النور', namaLatin: 'An-Nur', jumlahAyat: 64, tempatTurun: 'Madinah', juz: [18] },
  { nomor: 25, nama: 'الفرقان', namaLatin: 'Al-Furqan', jumlahAyat: 77, tempatTurun: 'Mekah', juz: [18, 19] },
  { nomor: 26, nama: 'الشعراء', namaLatin: 'Asy-Syuara', jumlahAyat: 227, tempatTurun: 'Mekah', juz: [19] },
  { nomor: 27, nama: 'النمل', namaLatin: 'An-Naml', jumlahAyat: 93, tempatTurun: 'Mekah', juz: [19, 20] },
  { nomor: 28, nama: 'القصص', namaLatin: 'Al-Qasas', jumlahAyat: 88, tempatTurun: 'Mekah', juz: [20] },
  { nomor: 29, nama: 'العنكبوت', namaLatin: 'Al-Ankabut', jumlahAyat: 69, tempatTurun: 'Mekah', juz: [20, 21] },
  { nomor: 30, nama: 'الروم', namaLatin: 'Ar-Rum', jumlahAyat: 60, tempatTurun: 'Mekah', juz: [21] },
  { nomor: 31, nama: 'لقمان', namaLatin: 'Luqman', jumlahAyat: 34, tempatTurun: 'Mekah', juz: [21] },
  { nomor: 32, nama: 'السجدة', namaLatin: 'As-Sajdah', jumlahAyat: 30, tempatTurun: 'Mekah', juz: [21] },
  { nomor: 33, nama: 'الأحزاب', namaLatin: 'Al-Ahzab', jumlahAyat: 73, tempatTurun: 'Madinah', juz: [21, 22] },
  { nomor: 34, nama: 'سبإ', namaLatin: 'Saba', jumlahAyat: 54, tempatTurun: 'Mekah', juz: [22] },
  { nomor: 35, nama: 'فاطر', namaLatin: 'Fatir', jumlahAyat: 45, tempatTurun: 'Mekah', juz: [22] },
  { nomor: 36, nama: 'يس', namaLatin: 'Yasin', jumlahAyat: 83, tempatTurun: 'Mekah', juz: [22, 23] },
  { nomor: 37, nama: 'الصافات', namaLatin: 'As-Saffat', jumlahAyat: 182, tempatTurun: 'Mekah', juz: [23] },
  { nomor: 38, nama: 'ص', namaLatin: 'Sad', jumlahAyat: 88, tempatTurun: 'Mekah', juz: [23] },
  { nomor: 39, nama: 'الزمر', namaLatin: 'Az-Zumar', jumlahAyat: 75, tempatTurun: 'Mekah', juz: [23, 24] },
  { nomor: 40, nama: 'غافر', namaLatin: 'Ghafir', jumlahAyat: 85, tempatTurun: 'Mekah', juz: [24] },
  { nomor: 41, nama: 'فصلت', namaLatin: 'Fussilat', jumlahAyat: 54, tempatTurun: 'Mekah', juz: [24, 25] },
  { nomor: 42, nama: 'الشورى', namaLatin: 'Asy-Syura', jumlahAyat: 53, tempatTurun: 'Mekah', juz: [25] },
  { nomor: 43, nama: 'الزخرف', namaLatin: 'Az-Zukhruf', jumlahAyat: 89, tempatTurun: 'Mekah', juz: [25] },
  { nomor: 44, nama: 'الدخان', namaLatin: 'Ad-Dukhan', jumlahAyat: 59, tempatTurun: 'Mekah', juz: [25] },
  { nomor: 45, nama: 'الجاثية', namaLatin: 'Al-Jasiyah', jumlahAyat: 37, tempatTurun: 'Mekah', juz: [25] },
  { nomor: 46, nama: 'الأحقاف', namaLatin: 'Al-Ahqaf', jumlahAyat: 35, tempatTurun: 'Mekah', juz: [26] },
  { nomor: 47, nama: 'محمد', namaLatin: 'Muhammad', jumlahAyat: 38, tempatTurun: 'Madinah', juz: [26] },
  { nomor: 48, nama: 'الفتح', namaLatin: 'Al-Fath', jumlahAyat: 29, tempatTurun: 'Madinah', juz: [26] },
  { nomor: 49, nama: 'الحجرات', namaLatin: 'Al-Hujurat', jumlahAyat: 18, tempatTurun: 'Madinah', juz: [26] },
  { nomor: 50, nama: 'ق', namaLatin: 'Qaf', jumlahAyat: 45, tempatTurun: 'Mekah', juz: [26] },
  { nomor: 51, nama: 'الذاريات', namaLatin: 'Az-Zariyat', jumlahAyat: 60, tempatTurun: 'Mekah', juz: [26, 27] },
  { nomor: 52, nama: 'الطور', namaLatin: 'At-Tur', jumlahAyat: 49, tempatTurun: 'Mekah', juz: [27] },
  { nomor: 53, nama: 'النجم', namaLatin: 'An-Najm', jumlahAyat: 62, tempatTurun: 'Mekah', juz: [27] },
  { nomor: 54, nama: 'القمر', namaLatin: 'Al-Qamar', jumlahAyat: 55, tempatTurun: 'Mekah', juz: [27] },
  { nomor: 55, nama: 'الرحمن', namaLatin: 'Ar-Rahman', jumlahAyat: 78, tempatTurun: 'Madinah', juz: [27] },
  { nomor: 56, nama: 'الواقعة', namaLatin: 'Al-Waqiah', jumlahAyat: 96, tempatTurun: 'Mekah', juz: [27] },
  { nomor: 57, nama: 'الحديد', namaLatin: 'Al-Hadid', jumlahAyat: 29, tempatTurun: 'Madinah', juz: [27] },
  { nomor: 58, nama: 'المجادلة', namaLatin: 'Al-Mujadilah', jumlahAyat: 22, tempatTurun: 'Madinah', juz: [28] },
  { nomor: 59, nama: 'الحشر', namaLatin: 'Al-Hasyr', jumlahAyat: 24, tempatTurun: 'Madinah', juz: [28] },
  { nomor: 60, nama: 'الممتحنة', namaLatin: 'Al-Mumtahanah', jumlahAyat: 13, tempatTurun: 'Madinah', juz: [28] },
  { nomor: 61, nama: 'الصف', namaLatin: 'As-Saff', jumlahAyat: 14, tempatTurun: 'Madinah', juz: [28] },
  { nomor: 62, nama: 'الجمعة', namaLatin: 'Al-Jumuah', jumlahAyat: 11, tempatTurun: 'Madinah', juz: [28] },
  { nomor: 63, nama: 'المنافقون', namaLatin: 'Al-Munafiqun', jumlahAyat: 11, tempatTurun: 'Madinah', juz: [28] },
  { nomor: 64, nama: 'التغابن', namaLatin: 'At-Taghabun', jumlahAyat: 18, tempatTurun: 'Madinah', juz: [28] },
  { nomor: 65, nama: 'الطلاق', namaLatin: 'At-Talaq', jumlahAyat: 12, tempatTurun: 'Madinah', juz: [28] },
  { nomor: 66, nama: 'التحريم', namaLatin: 'At-Tahrim', jumlahAyat: 12, tempatTurun: 'Madinah', juz: [28] },
  { nomor: 67, nama: 'الملك', namaLatin: 'Al-Mulk', jumlahAyat: 30, tempatTurun: 'Mekah', juz: [29] },
  { nomor: 68, nama: 'القلم', namaLatin: 'Al-Qalam', jumlahAyat: 52, tempatTurun: 'Mekah', juz: [29] },
  { nomor: 69, nama: 'الحاقة', namaLatin: 'Al-Haqqah', jumlahAyat: 52, tempatTurun: 'Mekah', juz: [29] },
  { nomor: 70, nama: 'المعارج', namaLatin: 'Al-Maarij', jumlahAyat: 44, tempatTurun: 'Mekah', juz: [29] },
  { nomor: 71, nama: 'نوح', namaLatin: 'Nuh', jumlahAyat: 28, tempatTurun: 'Mekah', juz: [29] },
  { nomor: 72, nama: 'الجن', namaLatin: 'Al-Jinn', jumlahAyat: 28, tempatTurun: 'Mekah', juz: [29] },
  { nomor: 73, nama: 'المزمل', namaLatin: 'Al-Muzzammil', jumlahAyat: 20, tempatTurun: 'Mekah', juz: [29] },
  { nomor: 74, nama: 'المدثر', namaLatin: 'Al-Muddassir', jumlahAyat: 56, tempatTurun: 'Mekah', juz: [29] },
  { nomor: 75, nama: 'القيامة', namaLatin: 'Al-Qiyamah', jumlahAyat: 40, tempatTurun: 'Mekah', juz: [29] },
  { nomor: 76, nama: 'الانسان', namaLatin: 'Al-Insan', jumlahAyat: 31, tempatTurun: 'Madinah', juz: [29] },
  { nomor: 77, nama: 'المرسلات', namaLatin: 'Al-Mursalat', jumlahAyat: 50, tempatTurun: 'Mekah', juz: [29] },
  { nomor: 78, nama: 'النبإ', namaLatin: 'An-Naba', jumlahAyat: 40, tempatTurun: 'Mekah', juz: [30] },
  { nomor: 79, nama: 'النازعات', namaLatin: 'An-Naziat', jumlahAyat: 46, tempatTurun: 'Mekah', juz: [30] },
  { nomor: 80, nama: 'عبس', namaLatin: 'Abasa', jumlahAyat: 42, tempatTurun: 'Mekah', juz: [30] },
  { nomor: 81, nama: 'التكوير', namaLatin: 'At-Takwir', jumlahAyat: 29, tempatTurun: 'Mekah', juz: [30] },
  { nomor: 82, nama: 'الإنفطار', namaLatin: 'Al-Infitar', jumlahAyat: 19, tempatTurun: 'Mekah', juz: [30] },
  { nomor: 83, nama: 'المطففين', namaLatin: 'Al-Mutaffifin', jumlahAyat: 36, tempatTurun: 'Mekah', juz: [30] },
  { nomor: 84, nama: 'الإنشقاق', namaLatin: 'Al-Insyiqaq', jumlahAyat: 25, tempatTurun: 'Mekah', juz: [30] },
  { nomor: 85, nama: 'البروج', namaLatin: 'Al-Buruj', jumlahAyat: 22, tempatTurun: 'Mekah', juz: [30] },
  { nomor: 86, nama: 'الطارق', namaLatin: 'At-Tariq', jumlahAyat: 17, tempatTurun: 'Mekah', juz: [30] },
  { nomor: 87, nama: 'الأعلى', namaLatin: 'Al-Ala', jumlahAyat: 19, tempatTurun: 'Mekah', juz: [30] },
  { nomor: 88, nama: 'الغاشية', namaLatin: 'Al-Ghasyiyah', jumlahAyat: 26, tempatTurun: 'Mekah', juz: [30] },
  { nomor: 89, nama: 'الفجر', namaLatin: 'Al-Fajr', jumlahAyat: 30, tempatTurun: 'Mekah', juz: [30] },
  { nomor: 90, nama: 'البلد', namaLatin: 'Al-Balad', jumlahAyat: 20, tempatTurun: 'Mekah', juz: [30] },
  { nomor: 91, nama: 'الشمس', namaLatin: 'Asy-Syams', jumlahAyat: 15, tempatTurun: 'Mekah', juz: [30] },
  { nomor: 92, nama: 'الليل', namaLatin: 'Al-Lail', jumlahAyat: 21, tempatTurun: 'Mekah', juz: [30] },
  { nomor: 93, nama: 'الضحى', namaLatin: 'Ad-Duha', jumlahAyat: 11, tempatTurun: 'Mekah', juz: [30] },
  { nomor: 94, nama: 'الشرح', namaLatin: 'Asy-Syarh', jumlahAyat: 8, tempatTurun: 'Mekah', juz: [30] },
  { nomor: 95, nama: 'التين', namaLatin: 'At-Tin', jumlahAyat: 8, tempatTurun: 'Mekah', juz: [30] },
  { nomor: 96, nama: 'العلق', namaLatin: 'Al-Alaq', jumlahAyat: 19, tempatTurun: 'Mekah', juz: [30] },
  { nomor: 97, nama: 'القدر', namaLatin: 'Al-Qadr', jumlahAyat: 5, tempatTurun: 'Mekah', juz: [30] },
  { nomor: 98, nama: 'البينة', namaLatin: 'Al-Bayyinah', jumlahAyat: 8, tempatTurun: 'Madinah', juz: [30] },
  { nomor: 99, nama: 'الزلزلة', namaLatin: 'Az-Zalzalah', jumlahAyat: 8, tempatTurun: 'Madinah', juz: [30] },
  { nomor: 100, nama: 'العاديات', namaLatin: 'Al-Adiyat', jumlahAyat: 11, tempatTurun: 'Mekah', juz: [30] },
  { nomor: 101, nama: 'القارعة', namaLatin: 'Al-Qariah', jumlahAyat: 11, tempatTurun: 'Mekah', juz: [30] },
  { nomor: 102, nama: 'التكاثر', namaLatin: 'At-Takasur', jumlahAyat: 8, tempatTurun: 'Mekah', juz: [30] },
  { nomor: 103, nama: 'العصر', namaLatin: 'Al-Asr', jumlahAyat: 3, tempatTurun: 'Mekah', juz: [30] },
  { nomor: 104, nama: 'الهمزة', namaLatin: 'Al-Humazah', jumlahAyat: 9, tempatTurun: 'Mekah', juz: [30] },
  { nomor: 105, nama: 'الفيل', namaLatin: 'Al-Fil', jumlahAyat: 5, tempatTurun: 'Mekah', juz: [30] },
  { nomor: 106, nama: 'قريش', namaLatin: 'Quraisy', jumlahAyat: 4, tempatTurun: 'Mekah', juz: [30] },
  { nomor: 107, nama: 'الماعون', namaLatin: 'Al-Maun', jumlahAyat: 7, tempatTurun: 'Mekah', juz: [30] },
  { nomor: 108, nama: 'الكوثر', namaLatin: 'Al-Kausar', jumlahAyat: 3, tempatTurun: 'Mekah', juz: [30] },
  { nomor: 109, nama: 'الكافرون', namaLatin: 'Al-Kafirun', jumlahAyat: 6, tempatTurun: 'Mekah', juz: [30] },
  { nomor: 110, nama: 'النصر', namaLatin: 'An-Nasr', jumlahAyat: 3, tempatTurun: 'Madinah', juz: [30] },
  { nomor: 111, nama: 'المسد', namaLatin: 'Al-Masad', jumlahAyat: 5, tempatTurun: 'Mekah', juz: [30] },
  { nomor: 112, nama: 'الإخلاص', namaLatin: 'Al-Ikhlas', jumlahAyat: 4, tempatTurun: 'Mekah', juz: [30] },
  { nomor: 113, nama: 'الفلق', namaLatin: 'Al-Falaq', jumlahAyat: 5, tempatTurun: 'Mekah', juz: [30] },
  { nomor: 114, nama: 'الناس', namaLatin: 'An-Nas', jumlahAyat: 6, tempatTurun: 'Mekah', juz: [30] },
];

async function main() {
  console.log('🌱 Starting seed...');

  // Seed Surah
  console.log('📖 Seeding Surah data...');
  for (const surah of surahData) {
    await prisma.surah.upsert({
      where: { nomor: surah.nomor },
      update: {},
      create: surah,
    });
  }
  console.log('✅ Surah data seeded successfully!');

  // Seed Tahun Ajaran
  console.log('📅 Seeding Tahun Ajaran...');
  const tahunAjaran = await prisma.tahunAjaran.upsert({
    where: { id: 'tahun-2024-2025' },
    update: {},
    create: {
      id: 'tahun-2024-2025',
      nama: '2024/2025',
      semester: 1,
      tanggalMulai: new Date('2024-07-15'),
      tanggalSelesai: new Date('2025-06-30'),
      isActive: true,
    },
  });
  console.log('✅ Tahun Ajaran seeded!');

  // Seed Admin User
  console.log('👤 Seeding Admin user...');
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@tahfidz.sch.id' },
    update: {},
    create: {
      email: 'admin@tahfidz.sch.id',
      password: hashedPassword,
      name: 'Administrator',
      role: 'ADMIN',
      isActive: true,
    },
  });
  console.log('✅ Admin user created! Email: admin@tahfidz.sch.id | Password: admin123');

  // Seed Guru
  console.log('👨‍🏫 Seeding Guru...');
  const guruPassword = await bcrypt.hash('guru123', 10);
  const guruUser = await prisma.user.upsert({
    where: { email: 'guru@tahfidz.sch.id' },
    update: {},
    create: {
      email: 'guru@tahfidz.sch.id',
      password: guruPassword,
      name: 'Ustadz Ahmad',
      role: 'GURU',
      isActive: true,
      guru: {
        create: {
          nip: '198501012010011001',
          jenisKelamin: 'L',
          noHP: '081234567890',
          alamat: 'Jl. Pendidikan No. 123',
        },
      },
    },
    include: { guru: true },
  });
  console.log('✅ Guru created! Email: guru@tahfidz.sch.id | Password: guru123');

  // Seed Kelas
  console.log('🏫 Seeding Kelas...');
  const kelas = await prisma.kelas.upsert({
    where: { id: 'kelas-xii-ipa-1' },
    update: {},
    create: {
      id: 'kelas-xii-ipa-1',
      nama: 'XII IPA 1',
      tingkat: 12,
      tahunAjaranId: tahunAjaran.id,
      targetJuz: 5,
    },
  });

  // Assign Guru ke Kelas
  await prisma.guruKelas.upsert({
    where: {
      guruId_kelasId: {
        guruId: guruUser.guru.id,
        kelasId: kelas.id,
      },
    },
    update: {},
    create: {
      guruId: guruUser.guru.id,
      kelasId: kelas.id,
      peran: 'utama',
      isActive: true,
    },
  });
  console.log('✅ Kelas seeded!');

  // Seed Siswa & Orang Tua
  console.log('👨‍🎓 Seeding Siswa & Orang Tua...');
  const siswaPassword = await bcrypt.hash('siswa123', 10);
  const orangTuaPassword = await bcrypt.hash('orangtua123', 10);

  // Check if orang tua exists
  let orangTuaUser = await prisma.user.findUnique({
    where: { email: 'orangtua@example.com' },
    include: { orangTua: true },
  });

  if (!orangTuaUser) {
    orangTuaUser = await prisma.user.create({
      data: {
        email: 'orangtua@example.com',
        password: orangTuaPassword,
        name: 'Bapak Ali',
        role: 'ORANG_TUA',
        isActive: true,
        orangTua: {
          create: {
            pekerjaan: 'Wiraswasta',
            noHP: '081234567891',
            alamat: 'Jl. Keluarga No. 45',
          },
        },
      },
      include: { orangTua: true },
    });
  }

  // Check if siswa exists
  let siswaUser = await prisma.user.findUnique({
    where: { email: 'siswa@example.com' },
    include: { siswa: true },
  });

  if (!siswaUser) {
    siswaUser = await prisma.user.create({
      data: {
        email: 'siswa@example.com',
        password: siswaPassword,
        name: 'Muhammad Rizki',
        role: 'SISWA',
        isActive: true,
        siswa: {
          create: {
            nisn: '0012345678',
            nis: '2021001',
            kelasId: kelas.id,
            jenisKelamin: 'Laki-laki',
            tempatLahir: 'Jakarta',
            tanggalLahir: new Date('2006-05-15'),
            alamat: 'Jl. Siswa No. 1',
            noHP: '081234567892',
            orangTuaId: orangTuaUser.orangTua.id,
            status: 'approved',
          },
        },
      },
    });
  }
  console.log('✅ Siswa & Orang Tua created!');
  console.log('   Siswa - Email: siswa@example.com | Password: siswa123');
  console.log('   Orang Tua - Email: orangtua@example.com | Password: orangtua123');

  console.log('');
  console.log('🎉 Seed completed successfully!');
  console.log('');
  console.log('📝 Default Credentials:');
  console.log('   Admin: admin@tahfidz.sch.id / admin123');
  console.log('   Guru: guru@tahfidz.sch.id / guru123');
  console.log('   Siswa: siswa@example.com / siswa123');
  console.log('   Orang Tua: orangtua@example.com / orangtua123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
