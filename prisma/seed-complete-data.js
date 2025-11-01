import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Clear existing data
  console.log('🗑️  Clearing existing data...');
  await prisma.penilaian.deleteMany();
  await prisma.hafalan.deleteMany();
  await prisma.presensi.deleteMany();
  await prisma.guruKelas.deleteMany();
  await prisma.siswa.deleteMany();
  await prisma.guru.deleteMany();
  await prisma.orangTua.deleteMany();
  await prisma.kelas.deleteMany();
  await prisma.tahunAjaran.deleteMany();
  await prisma.pengumuman.deleteMany();
  await prisma.logActivity.deleteMany();
  await prisma.user.deleteMany();

  // Hash password
  const hashedPassword = await bcrypt.hash('password123', 10);

  // 1. Create Tahun Ajaran
  console.log('📅 Creating Tahun Ajaran...');
  const tahunAjaran = await prisma.tahunAjaran.create({
    data: {
      nama: '2024/2025',
      tanggalMulai: new Date('2024-07-15'),
      tanggalSelesai: new Date('2025-06-30'),
      isActive: true,
    },
  });

  // 2. Create Admin
  console.log('👨‍💼 Creating Admin...');
  const adminUser = await prisma.user.create({
    data: {
      name: 'Administrator',
      email: 'admin@tahfidz.sch.id',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  // 3. Create Guru (5 guru)
  console.log('👨‍🏫 Creating Guru...');
  const guruData = [
    {
      name: 'Ustadz Ahmad Fauzi',
      email: 'ahmad.fauzi@tahfidz.sch.id',
      nip: '198501012010011001',
      jenisKelamin: 'LAKI_LAKI',
      jabatan: 'Kepala Sekolah',
      bidangKeahlian: 'Tahfidz & Manajemen',
      alamat: 'Jl. Masjid No. 1, Jakarta',
      noTelepon: '081234567801',
    },
    {
      name: 'Ustadzah Siti Aminah',
      email: 'siti.aminah@tahfidz.sch.id',
      nip: '198705152011012001',
      jenisKelamin: 'PEREMPUAN',
      jabatan: 'Guru Tahfidz',
      bidangKeahlian: 'Tahfidz Juz 30',
      alamat: 'Jl. Pondok No. 12, Jakarta',
      noTelepon: '081234567802',
    },
    {
      name: 'Ustadz Muhammad Ridwan',
      email: 'muhammad.ridwan@tahfidz.sch.id',
      nip: '199003202012011001',
      jenisKelamin: 'LAKI_LAKI',
      jabatan: 'Guru Tahfidz',
      bidangKeahlian: 'Tahfidz Juz 1-15',
      alamat: 'Jl. Pesantren No. 5, Jakarta',
      noTelepon: '081234567803',
    },
    {
      name: 'Ustadzah Fatimah Zahra',
      email: 'fatimah.zahra@tahfidz.sch.id',
      nip: '199208102013012001',
      jenisKelamin: 'PEREMPUAN',
      jabatan: 'Guru Tahfidz',
      bidangKeahlian: 'Tahfidz Juz 16-30',
      alamat: 'Jl. Madinah No. 8, Jakarta',
      noTelepon: '081234567804',
    },
    {
      name: 'Ustadz Ali Hasan',
      email: 'ali.hasan@tahfidz.sch.id',
      nip: '198812252014011001',
      jenisKelamin: 'LAKI_LAKI',
      jabatan: 'Guru Tajwid',
      bidangKeahlian: 'Tajwid & Qiraat',
      alamat: 'Jl. Quran No. 3, Jakarta',
      noTelepon: '081234567805',
    },
  ];

  const gurus = [];
  for (const data of guruData) {
    const guruUser = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: 'GURU',
      },
    });

    const guru = await prisma.guru.create({
      data: {
        userId: guruUser.id,
        nip: data.nip,
        jenisKelamin: data.jenisKelamin,
        jabatan: data.jabatan,
        bidangKeahlian: data.bidangKeahlian,
        alamat: data.alamat,
        noTelepon: data.noTelepon,
        tanggalLahir: new Date('1985-01-01'),
      },
    });

    gurus.push(guru);
  }

  // 4. Create Kelas (6 kelas)
  console.log('🏫 Creating Kelas...');
  const kelasData = [
    { nama: 'Kelas 1A - Tahfidz Pemula', targetJuz: 5, kapasitas: 20 },
    { nama: 'Kelas 1B - Tahfidz Pemula', targetJuz: 5, kapasitas: 20 },
    { nama: 'Kelas 2A - Tahfidz Lanjutan', targetJuz: 15, kapasitas: 20 },
    { nama: 'Kelas 2B - Tahfidz Lanjutan', targetJuz: 15, kapasitas: 20 },
    { nama: 'Kelas 3A - Tahfidz Intensif', targetJuz: 30, kapasitas: 15 },
    { nama: 'Kelas 3B - Tahfidz Intensif', targetJuz: 30, kapasitas: 15 },
  ];

  const kelasList = [];
  for (let i = 0; i < kelasData.length; i++) {
    const kelas = await prisma.kelas.create({
      data: {
        nama: kelasData[i].nama,
        targetJuz: kelasData[i].targetJuz,
        tahunAjaranId: tahunAjaran.id,
        kapasitas: kelasData[i].kapasitas,
        status: 'AKTIF',
      },
    });

    // Assign guru ke kelas
    await prisma.guruKelas.create({
      data: {
        guruId: gurus[i % gurus.length].id,
        kelasId: kelas.id,
      },
    });

    kelasList.push(kelas);
  }

  // 5. Create Siswa (30 siswa)
  console.log('👨‍🎓 Creating Siswa & Orang Tua...');
  const namaSiswaLaki = [
    'Abdullah', 'Ahmad', 'Ali', 'Hasan', 'Husain',
    'Ibrahim', 'Ismail', 'Khalid', 'Muhammad', 'Omar',
    'Yusuf', 'Zakariya', 'Idris', 'Musa', 'Harun'
  ];

  const namaSiswaPerempuan = [
    'Aisyah', 'Fatimah', 'Khadijah', 'Maryam', 'Zainab',
    'Aminah', 'Hafsah', 'Ruqayyah', 'Safiyyah', 'Sumayyah',
    'Asma', 'Hafshah', 'Juwairiyah', 'Maymunah', 'Saudah'
  ];

  let nisCounter = 24001;

  for (let i = 0; i < 30; i++) {
    const jenisKelamin = i % 2 === 0 ? 'LAKI_LAKI' : 'PEREMPUAN';
    const namaDepan = jenisKelamin === 'LAKI_LAKI'
      ? namaSiswaLaki[i % namaSiswaLaki.length]
      : namaSiswaPerempuan[i % namaSiswaPerempuan.length];
    const namaBelakang = ['Rahman', 'Hakim', 'Aziz', 'Karim', 'Latif'][i % 5];
    const namaSiswa = `${namaDepan} ${namaBelakang}`;
    const nis = `${nisCounter++}`;

    // Create Siswa User
    const siswaUser = await prisma.user.create({
      data: {
        name: namaSiswa,
        email: `${namaDepan.toLowerCase()}.${namaBelakang.toLowerCase()}@siswa.tahfidz.sch.id`,
        password: hashedPassword,
        role: 'SISWA',
      },
    });

    // Create Siswa
    const siswa = await prisma.siswa.create({
      data: {
        userId: siswaUser.id,
        nis: nis,
        kelasId: kelasList[Math.floor(i / 5)].id, // 5 siswa per kelas
        jenisKelamin: jenisKelamin,
        alamat: `Jl. Siswa No. ${i + 1}, Jakarta`,
        noTelepon: `08123456${7900 + i}`,
        tanggalLahir: new Date(`201${i % 4 + 2}-0${(i % 12) + 1}-15`),
        status: 'approved',
      },
    });

    // Create Orang Tua
    const namaOrangTua = `Orang Tua ${namaSiswa}`;

    const orangTuaUser = await prisma.user.create({
      data: {
        name: namaOrangTua,
        email: `ortu.${nis}@parent.tahfidz.sch.id`,
        password: hashedPassword,
        role: 'ORANG_TUA',
      },
    });

    const orangTua = await prisma.orangTua.create({
      data: {
        userId: orangTuaUser.id,
        nik: `31710${String(7800 + i).padStart(12, '0')}`,
        jenisKelamin: i % 2 === 0 ? 'LAKI_LAKI' : 'PEREMPUAN',
        pekerjaan: i % 2 === 0 ? 'Wiraswasta' : 'Ibu Rumah Tangga',
        noTelepon: `08123456${7800 + i}`,
        alamat: `Jl. Siswa No. ${i + 1}, Jakarta`,
        status: 'approved',
      },
    });

    // Create relasi OrangTua-Siswa
    await prisma.orangTuaSiswa.create({
      data: {
        orangTuaId: orangTua.id,
        siswaId: siswa.id,
        hubungan: i % 2 === 0 ? 'Ayah' : 'Ibu',
      },
    });

    // Create Hafalan for each siswa (random progress)
    const juzCount = Math.floor(Math.random() * 3) + 1; // 1-3 hafalan
    for (let j = 0; j < juzCount; j++) {
      const hafalan = await prisma.hafalan.create({
        data: {
          siswaId: siswa.id,
          guruId: gurus[Math.floor(i / 6) % gurus.length].id,
          tanggal: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
          juz: Math.floor(Math.random() * 30) + 1,
          surah: `Surah ${j + 1}`,
          ayatMulai: 1,
          ayatSelesai: 10,
          keterangan: 'Hafalan baik, terus semangat!',
        },
      });

      // Create Penilaian for this hafalan
      await prisma.penilaian.create({
        data: {
          hafalanId: hafalan.id,
          siswaId: siswa.id,
          guruId: gurus[Math.floor(i / 6) % gurus.length].id,
          tajwid: Math.floor(Math.random() * 3) + 3, // 3-5
          kelancaran: Math.floor(Math.random() * 3) + 3, // 3-5
          makhraj: Math.floor(Math.random() * 3) + 3, // 3-5
          adab: Math.floor(Math.random() * 3) + 3, // 3-5
          nilaiAkhir: (Math.floor(Math.random() * 20) + 80) * 1.0, // 80-100
          catatan: 'Baik, terus semangat!',
        },
      });
    }

    // Create Presensi (last 7 days)
    for (let day = 0; day < 7; day++) {
      const statuses = ['HADIR', 'HADIR', 'HADIR', 'HADIR', 'IZIN', 'SAKIT'];
      await prisma.presensi.create({
        data: {
          siswaId: siswa.id,
          guruId: gurus[Math.floor(i / 6) % gurus.length].id,
          tanggal: new Date(Date.now() - day * 24 * 60 * 60 * 1000),
          status: statuses[Math.floor(Math.random() * statuses.length)],
          keterangan: 'Presensi harian',
        },
      });
    }
  }

  // 6. Create Pengumuman
  console.log('📢 Creating Pengumuman...');
  const pengumumanData = [
    {
      judul: 'Selamat Datang Tahun Ajaran 2024/2025',
      isi: 'Selamat datang di tahun ajaran baru 2024/2025. Semoga Allah memberkahi perjalanan menghafal Al-Quran kita semua. Aamiin.',
      kategori: 'UMUM',
    },
    {
      judul: 'Jadwal Ujian Tahfidz Semester 1',
      isi: 'Ujian tahfidz semester 1 akan dilaksanakan pada tanggal 15-20 Desember 2024. Mohon persiapkan hafalan dengan baik.',
      kategori: 'AKADEMIK',
    },
    {
      judul: 'Kegiatan Tahsin Bersama',
      isi: 'Akan diadakan kegiatan tahsin bersama setiap hari Jumat pukul 14.00-16.00. Wajib diikuti oleh seluruh siswa.',
      kategori: 'KEGIATAN',
    },
    {
      judul: 'Libur Hari Raya Idul Fitri',
      isi: 'Sekolah akan libur mulai tanggal 10-20 April 2025 untuk libur Idul Fitri. Tetap jaga hafalan di rumah ya!',
      kategori: 'PENTING',
    },
  ];

  for (const data of pengumumanData) {
    await prisma.pengumuman.create({
      data: {
        userId: adminUser.id,
        judul: data.judul,
        isi: data.isi,
        kategori: data.kategori,
        isPinned: data.kategori === 'PENTING',
      },
    });
  }

  // 7. Create Log Activity
  console.log('📝 Creating Log Activity...');
  await prisma.logActivity.create({
    data: {
      userId: adminUser.id,
      role: 'ADMIN',
      aktivitas: 'CREATE',
      modul: 'Seeder',
      deskripsi: 'Database seeded with initial data',
    },
  });

  console.log('✅ Seed completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`- Admin: 1`);
  console.log(`- Guru: ${gurus.length}`);
  console.log(`- Kelas: ${kelasList.length}`);
  console.log(`- Siswa: 30`);
  console.log(`- Orang Tua: 30`);
  console.log(`- Pengumuman: ${pengumumanData.length}`);
  console.log('\n🔐 Login credentials:');
  console.log('Admin:');
  console.log('  Email: admin@tahfidz.sch.id');
  console.log('  Password: password123');
  console.log('\nGuru (example):');
  console.log('  Email: ahmad.fauzi@tahfidz.sch.id');
  console.log('  Password: password123');
  console.log('\nSiswa (example):');
  console.log('  Email: abdullah.rahman@siswa.tahfidz.sch.id');
  console.log('  Password: password123');
  console.log('\nOrang Tua (example):');
  console.log('  Email: ortu.24001@parent.tahfidz.sch.id');
  console.log('  Password: password123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
