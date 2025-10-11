'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Users, BookOpen, UserCheck, GraduationCap, TrendingUp, TrendingDown,
  Calendar, Target, Download
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const COLORS = ['#22c55e', '#eab308', '#3b82f6', '#ef4444'];

function StatCard({ icon: Icon, title, value, subtitle, color = "bg-orange-500" }) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className={`inline-flex h-12 w-12 items-center justify-center rounded-xl text-white ${color}`}>
              <Icon size={24} />
            </span>
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400">{title}</div>
              {subtitle && <div className="text-xs text-gray-400 dark:text-gray-500">{subtitle}</div>}
            </div>
          </div>
          <div className="text-3xl font-bold">{value}</div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function StatistikPage() {
  const [overviewData, setOverviewData] = useState(null);
  const [hafalanData, setHafalanData] = useState(null);
  const [kehadiranData, setKehadiranData] = useState(null);
  const [kelasList, setKelasList] = useState([]);
  const [selectedKelas, setSelectedKelas] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchKelas();
    fetchOverview();
  }, []);

  useEffect(() => {
    fetchHafalan();
    fetchKehadiran();
  }, [selectedKelas, selectedStatus]);

  const fetchKelas = async () => {
    try {
      const res = await fetch('/api/kelas');
      if (res.ok) {
        const data = await res.json();
        setKelasList(data);
      }
    } catch (error) {
      console.error('Error fetching kelas:', error);
    }
  };

  const fetchOverview = async () => {
    try {
      const res = await fetch('/api/admin/statistik/overview');
      if (res.ok) {
        const data = await res.json();
        setOverviewData(data);
      }
    } catch (error) {
      console.error('Error fetching overview:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchHafalan = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedKelas && selectedKelas !== 'all') params.append('kelasId', selectedKelas);

      const res = await fetch(`/api/admin/statistik/hafalan?${params}`);
      if (res.ok) {
        const data = await res.json();
        setHafalanData(data);
      }
    } catch (error) {
      console.error('Error fetching hafalan:', error);
    }
  };

  const fetchKehadiran = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedKelas && selectedKelas !== 'all') params.append('kelasId', selectedKelas);
      if (selectedStatus && selectedStatus !== 'all') params.append('status', selectedStatus);

      const res = await fetch(`/api/admin/statistik/kehadiran?${params}`);
      if (res.ok) {
        const data = await res.json();
        setKehadiranData(data);
      }
    } catch (error) {
      console.error('Error fetching kehadiran:', error);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-6">
          <div className="text-center">Loading...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Statistik Sekolah</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Analisis dan statistik sistem Tahfidz Al-Qur'an
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Dashboard Overview</TabsTrigger>
            <TabsTrigger value="hafalan">Statistik Hafalan</TabsTrigger>
            <TabsTrigger value="kehadiran">Statistik Kehadiran</TabsTrigger>
          </TabsList>

          {/* OVERVIEW TAB */}
          <TabsContent value="overview" className="space-y-6">
            {!overviewData ? (
              <div className="text-center py-8 text-gray-500">Memuat data...</div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard icon={Users} title="Total Siswa Aktif" value={overviewData.summary.totalSiswa} color="bg-blue-500" />
                  <StatCard icon={BookOpen} title="Rata-rata Hafalan" value={`${overviewData.summary.rataHafalan} juz`} color="bg-green-500" />
                  <StatCard icon={UserCheck} title="Rata-rata Kehadiran" value={`${overviewData.summary.rataKehadiran}%`} color="bg-orange-500" />
                  <StatCard icon={GraduationCap} title="Total Guru Tahfidz" value={overviewData.summary.totalGuru} color="bg-purple-500" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader><CardTitle>Tren Perkembangan Hafalan (6 Bulan Terakhir)</CardTitle></CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={overviewData.trendHafalan}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="bulan" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line type="monotone" dataKey="juz" stroke="#22c55e" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader><CardTitle>Distribusi Kehadiran</CardTitle></CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={overviewData.distribusiKehadiran}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {overviewData.distribusiKehadiran.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader><CardTitle>Perbandingan Hafalan Antar Kelas</CardTitle></CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={overviewData.kelasStats}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="nama" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="rataJuz" fill="#f97316" name="Rata-rata Juz" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-green-500" />
                      Pencapaian Terbaru (Bulan Ini)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {overviewData.recentAchievements.length > 0 ? (
                      <div className="space-y-3">
                        {overviewData.recentAchievements.map((siswa, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-400 font-bold">{idx + 1}</div>
                              <div>
                                <div className="font-semibold text-gray-900 dark:text-white">{siswa.nama}</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">{siswa.tanggal ? new Date(siswa.tanggal).toLocaleDateString('id-ID') : '-'}</div>
                              </div>
                            </div>
                            <div className="text-xl font-bold text-green-600 dark:text-green-400">{siswa.juz} juz</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center text-gray-500 dark:text-gray-400 py-8">Belum ada pencapaian bulan ini</div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* HAFALAN TAB */}
          <TabsContent value="hafalan" className="space-y-6">
            <div className="flex items-center justify-between">
              <Card className="flex-1">
                <CardContent className="p-4">
                  <div className="flex gap-4 items-end">
                    <div className="flex-1">
                      <Label>Filter Kelas</Label>
                      <Select value={selectedKelas} onValueChange={setSelectedKelas}>
                        <SelectTrigger><SelectValue placeholder="Semua Kelas" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Semua Kelas</SelectItem>
                          {kelasList.map((kelas) => (
                            <SelectItem key={kelas.id} value={kelas.id}>{kelas.nama}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Button variant="outline" className="ml-4"><Download className="w-4 h-4 mr-2" />Export</Button>
            </div>

            {!hafalanData ? (
              <div className="text-center py-8 text-gray-500">Memuat data...</div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard icon={Users} title="Total Siswa" value={hafalanData.summary.totalSiswa} color="bg-blue-500" />
                  <StatCard icon={BookOpen} title="Total Juz Terhafal" value={`${hafalanData.summary.totalJuz} juz`} subtitle="Akumulasi" color="bg-green-500" />
                  <StatCard icon={TrendingUp} title="Rata-rata Hafalan" value={`${hafalanData.summary.rataHafalan} juz`} subtitle="Per siswa" color="bg-orange-500" />
                  <StatCard icon={Target} title="Status Target" value={hafalanData.summary.statusTarget} subtitle={`Target: ${hafalanData.summary.targetSemester} juz`} color={hafalanData.summary.statusTarget === 'Tercapai' ? 'bg-green-500' : 'bg-red-500'} />
                </div>

                <Card>
                  <CardHeader><CardTitle>Tren Hafalan per Bulan (12 Bulan Terakhir)</CardTitle></CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={hafalanData.trendHafalan}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="bulan" angle={-45} textAnchor="end" height={80} />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="juz" stroke="#22c55e" strokeWidth={2} name="Juz" />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader><CardTitle>Top 10 Siswa dengan Hafalan Terbanyak</CardTitle></CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={hafalanData.top10Siswa} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" />
                          <YAxis dataKey="nama" type="category" width={100} />
                          <Tooltip />
                          <Bar dataKey="juz" fill="#f97316" name="Juz" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader><CardTitle>Distribusi Level Hafalan</CardTitle></CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={hafalanData.distribusiLevel}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="level" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="count" fill="#3b82f6" name="Jumlah Siswa" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader><CardTitle>Perbandingan Hafalan Antar Kelas</CardTitle></CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-orange-500 text-white">
                            <th className="border px-4 py-2">Kelas</th>
                            <th className="border px-4 py-2">Jumlah Siswa</th>
                            <th className="border px-4 py-2">Rata-rata Hafalan</th>
                            <th className="border px-4 py-2">Siswa Terbaik</th>
                          </tr>
                        </thead>
                        <tbody>
                          {hafalanData.kelasComparison.map((kelas, idx) => (
                            <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                              <td className="border px-4 py-2 font-semibold">{kelas.nama}</td>
                              <td className="border px-4 py-2 text-center">{kelas.jumlahSiswa}</td>
                              <td className="border px-4 py-2 text-center">{kelas.rataHafalan} juz</td>
                              <td className="border px-4 py-2 text-center">{kelas.siswaTerbaik} juz</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* KEHADIRAN TAB */}
          <TabsContent value="kehadiran" className="space-y-6">
            <div className="flex items-center justify-between">
              <Card className="flex-1">
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Filter Kelas</Label>
                      <Select value={selectedKelas} onValueChange={setSelectedKelas}>
                        <SelectTrigger><SelectValue placeholder="Semua Kelas" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Semua Kelas</SelectItem>
                          {kelasList.map((kelas) => (
                            <SelectItem key={kelas.id} value={kelas.id}>{kelas.nama}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Filter Status</Label>
                      <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                        <SelectTrigger><SelectValue placeholder="Semua Status" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Semua Status</SelectItem>
                          <SelectItem value="hadir">Hadir</SelectItem>
                          <SelectItem value="izin">Izin</SelectItem>
                          <SelectItem value="sakit">Sakit</SelectItem>
                          <SelectItem value="alpa">Alpa</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Button variant="outline" className="ml-4"><Download className="w-4 h-4 mr-2" />Export</Button>
            </div>

            {!kehadiranData ? (
              <div className="text-center py-8 text-gray-500">Memuat data...</div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <StatCard icon={Calendar} title="Total Pertemuan" value={kehadiranData.summary.totalPertemuan} color="bg-blue-500" />
                  <StatCard icon={UserCheck} title="Rata-rata Kehadiran" value={`${kehadiranData.summary.rataKehadiran}%`} color="bg-green-500" />
                  <StatCard icon={UserCheck} title="Total Hadir" value={kehadiranData.summary.totalHadir} subtitle={`Izin: ${kehadiranData.summary.totalIzin} | Sakit: ${kehadiranData.summary.totalSakit}`} color="bg-orange-500" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader><CardTitle>Tren Kehadiran per Bulan</CardTitle></CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={kehadiranData.trendKehadiran}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="bulan" angle={-45} textAnchor="end" height={80} />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line type="monotone" dataKey="persen" stroke="#22c55e" strokeWidth={2} name="Kehadiran (%)" />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader><CardTitle>Persentase Status Kehadiran</CardTitle></CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={kehadiranData.distribusiStatus}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            dataKey="value"
                          >
                            {kehadiranData.distribusiStatus.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="w-5 h-5 text-green-500" />Top 10 Kehadiran Terbaik</CardTitle></CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {kehadiranData.top10.map((siswa, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 font-bold flex items-center justify-center">{idx + 1}</div>
                              <div>
                                <div className="font-semibold">{siswa.nama}</div>
                                <div className="text-sm text-gray-500">{siswa.hadir}/{siswa.total}</div>
                              </div>
                            </div>
                            <div className="text-xl font-bold text-green-600">{siswa.persenKehadiran}%</div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2"><TrendingDown className="w-5 h-5 text-red-500" />Bottom 10 Kehadiran Terburuk</CardTitle></CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {kehadiranData.bottom10.map((siswa, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 font-bold flex items-center justify-center">{idx + 1}</div>
                              <div>
                                <div className="font-semibold">{siswa.nama}</div>
                                <div className="text-sm text-gray-500">{siswa.hadir}/{siswa.total}</div>
                              </div>
                            </div>
                            <div className="text-xl font-bold text-red-600">{siswa.persenKehadiran}%</div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader><CardTitle>Perbandingan Kehadiran Antar Kelas</CardTitle></CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-orange-500 text-white">
                            <th className="border px-4 py-2">Kelas</th>
                            <th className="border px-4 py-2">Total Siswa</th>
                            <th className="border px-4 py-2">Hadir (%)</th>
                            <th className="border px-4 py-2">Izin (%)</th>
                            <th className="border px-4 py-2">Sakit (%)</th>
                            <th className="border px-4 py-2">Alpa (%)</th>
                            <th className="border px-4 py-2">Avg</th>
                          </tr>
                        </thead>
                        <tbody>
                          {kehadiranData.kelasComparison.map((kelas, idx) => (
                            <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                              <td className="border px-4 py-2 font-semibold">{kelas.nama}</td>
                              <td className="border px-4 py-2 text-center">{kelas.totalSiswa}</td>
                              <td className="border px-4 py-2 text-center text-green-600">{kelas.persenHadir}%</td>
                              <td className="border px-4 py-2 text-center text-yellow-600">{kelas.persenIzin}%</td>
                              <td className="border px-4 py-2 text-center text-blue-600">{kelas.persenSakit}%</td>
                              <td className="border px-4 py-2 text-center text-red-600">{kelas.persenAlpa}%</td>
                              <td className="border px-4 py-2 text-center font-semibold">{kelas.avgKehadiran}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
