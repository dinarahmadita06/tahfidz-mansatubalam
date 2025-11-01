import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET(request) {
  try {
    const session = await auth()

    if (!session || session.user.role !== 'ORANG_TUA') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const siswaId = searchParams.get('siswaId')
    const periode = searchParams.get('periode') || 'bulan-ini'

    // Validasi siswaId
    if (!siswaId) {
      return NextResponse.json(
        { error: 'siswaId is required' },
        { status: 400 }
      )
    }

    // Verifikasi bahwa siswa adalah anak dari orang tua ini
    const siswa = await prisma.siswa.findFirst({
      where: {
        id: siswaId,
        orangTua: {
          userId: session.user.id
        }
      },
      include: {
        user: {
          select: {
            nama: true
          }
        }
      }
    })

    if (!siswa) {
      return NextResponse.json(
        { error: 'Siswa not found or not authorized' },
        { status: 404 }
      )
    }

    // Tentukan range tanggal berdasarkan periode
    const now = new Date()
    let startDate = new Date()

    switch (periode) {
      case 'minggu-ini':
        startDate.setDate(now.getDate() - 7)
        break
      case 'bulan-ini':
        startDate.setMonth(now.getMonth() - 1)
        break
      case 'semester-ini':
        startDate.setMonth(now.getMonth() - 6)
        break
      case 'tahun-ajaran':
        // Asumsikan tahun ajaran mulai Juli
        if (now.getMonth() < 6) {
          startDate = new Date(now.getFullYear() - 1, 6, 1)
        } else {
          startDate = new Date(now.getFullYear(), 6, 1)
        }
        break
      default:
        startDate.setMonth(now.getMonth() - 1)
    }

    // Ambil data hafalan dalam periode yang dipilih
    const hafalanData = await prisma.hafalan.findMany({
      where: {
        siswaId: siswaId,
        tanggal: {
          gte: startDate,
          lte: now
        }
      },
      include: {
        surah: true,
        guru: {
          include: {
            user: {
              select: {
                nama: true
              }
            }
          }
        }
      },
      orderBy: {
        tanggal: 'desc'
      }
    })

    // Hitung statistik
    const totalHafalan = await prisma.hafalan.count({
      where: {
        siswaId: siswaId,
        status: 'SELESAI'
      }
    })

    const hafalanBaru = await prisma.hafalan.count({
      where: {
        siswaId: siswaId,
        status: 'SELESAI',
        tanggal: {
          gte: new Date(now.getFullYear(), now.getMonth(), 1),
          lte: now
        }
      }
    })

    const totalMurojaah = await prisma.muroja.count({
      where: {
        siswaId: siswaId,
        tanggal: {
          gte: startDate,
          lte: now
        }
      }
    })

    // Hitung rata-rata nilai
    let totalNilai = 0
    let jumlahPenilaian = 0

    hafalanData.forEach(hafalan => {
      if (hafalan.nilaiTajwid) {
        totalNilai += hafalan.nilaiTajwid
        jumlahPenilaian++
      }
      if (hafalan.nilaiKelancaran) {
        totalNilai += hafalan.nilaiKelancaran
        jumlahPenilaian++
      }
      if (hafalan.nilaiMakhraj) {
        totalNilai += hafalan.nilaiMakhraj
        jumlahPenilaian++
      }
    })

    const rataRataNilai = jumlahPenilaian > 0 ? Math.round(totalNilai / jumlahPenilaian) : 0

    // Format data untuk grafik progres (per minggu)
    const progressData = []
    const weeks = Math.ceil((now - startDate) / (7 * 24 * 60 * 60 * 1000))

    for (let i = weeks - 1; i >= 0; i--) {
      const weekEnd = new Date(now)
      weekEnd.setDate(now.getDate() - (i * 7))
      const weekStart = new Date(weekEnd)
      weekStart.setDate(weekEnd.getDate() - 7)

      const weekHafalan = hafalanData.filter(h =>
        new Date(h.tanggal) >= weekStart && new Date(h.tanggal) <= weekEnd
      )

      const weekMurojaah = await prisma.muroja.count({
        where: {
          siswaId: siswaId,
          tanggal: {
            gte: weekStart,
            lte: weekEnd
          }
        }
      })

      let weekTotal = 0
      let weekCount = 0
      weekHafalan.forEach(h => {
        if (h.nilaiTajwid) { weekTotal += h.nilaiTajwid; weekCount++ }
        if (h.nilaiKelancaran) { weekTotal += h.nilaiKelancaran; weekCount++ }
        if (h.nilaiMakhraj) { weekTotal += h.nilaiMakhraj; weekCount++ }
      })

      const totalHafalanUpToWeek = await prisma.hafalan.count({
        where: {
          siswaId: siswaId,
          status: 'SELESAI',
          tanggal: {
            lte: weekEnd
          }
        }
      })

      progressData.push({
        minggu: `Minggu ${weeks - i}`,
        totalHafalan: totalHafalanUpToWeek,
        nilaiRataRata: weekCount > 0 ? Math.round(weekTotal / weekCount) : 0,
        murojaah: weekMurojaah
      })
    }

    // Hitung rata-rata per kategori untuk bar chart
    let totalTajwid = 0, countTajwid = 0
    let totalKelancaran = 0, countKelancaran = 0
    let totalMakhraj = 0, countMakhraj = 0

    hafalanData.forEach(hafalan => {
      if (hafalan.nilaiTajwid) {
        totalTajwid += hafalan.nilaiTajwid
        countTajwid++
      }
      if (hafalan.nilaiKelancaran) {
        totalKelancaran += hafalan.nilaiKelancaran
        countKelancaran++
      }
      if (hafalan.nilaiMakhraj) {
        totalMakhraj += hafalan.nilaiMakhraj
        countMakhraj++
      }
    })

    const performanceData = [
      {
        kategori: 'Tajwid',
        nilai: countTajwid > 0 ? Math.round(totalTajwid / countTajwid) : 0
      },
      {
        kategori: 'Kelancaran',
        nilai: countKelancaran > 0 ? Math.round(totalKelancaran / countKelancaran) : 0
      },
      {
        kategori: 'Makhraj',
        nilai: countMakhraj > 0 ? Math.round(totalMakhraj / countMakhraj) : 0
      }
    ]

    // Format detail hafalan untuk tabel
    const detailHafalan = hafalanData.map(hafalan => ({
      id: hafalan.id,
      tanggal: new Date(hafalan.tanggal).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      }),
      surah: `${hafalan.surah.nama} ${hafalan.ayatMulai}-${hafalan.ayatSelesai}`,
      nilaiTajwid: hafalan.nilaiTajwid || 0,
      nilaiKelancaran: hafalan.nilaiKelancaran || 0,
      nilaiMakhraj: hafalan.nilaiMakhraj || 0,
      catatan: hafalan.catatan || 'Tidak ada catatan'
    }))

    // Hitung persentase peningkatan
    const previousMonthStart = new Date(startDate)
    previousMonthStart.setMonth(previousMonthStart.getMonth() - 1)

    const previousMonthCount = await prisma.hafalan.count({
      where: {
        siswaId: siswaId,
        status: 'SELESAI',
        tanggal: {
          gte: previousMonthStart,
          lt: startDate
        }
      }
    })

    const peningkatan = previousMonthCount > 0
      ? Math.round(((hafalanBaru - previousMonthCount) / previousMonthCount) * 100)
      : 100

    return NextResponse.json({
      siswa: {
        id: siswa.id,
        nama: siswa.user.nama
      },
      statistik: {
        totalHafalan,
        hafalanBaru,
        rataRataNilai,
        totalMurojaah
      },
      progressData,
      performanceData,
      detailHafalan,
      kesimpulan: {
        nama: siswa.user.nama,
        totalHafalan,
        rataRataNilai,
        peningkatan
      }
    })

  } catch (error) {
    console.error('Error fetching laporan hafalan:', error)
    return NextResponse.json(
      { error: 'Failed to fetch laporan hafalan', details: error.message },
      { status: 500 }
    )
  }
}

// Export PDF endpoint
export async function POST(request) {
  try {
    const session = await auth()

    if (!session || session.user.role !== 'ORANG_TUA') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { siswaId, periode, format } = body

    // TODO: Implementasi pembuatan PDF/Excel
    // Untuk saat ini, return success message

    return NextResponse.json({
      success: true,
      message: `Laporan dalam format ${format} akan segera diunduh`,
      downloadUrl: `/api/orangtua/laporan-hafalan/download?siswaId=${siswaId}&periode=${periode}&format=${format}`
    })

  } catch (error) {
    console.error('Error exporting laporan:', error)
    return NextResponse.json(
      { error: 'Failed to export laporan', details: error.message },
      { status: 500 }
    )
  }
}
