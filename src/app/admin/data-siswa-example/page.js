'use client';

import { useState } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import {
  DataTable,
  DataTableFilters,
  DataTablePagination,
  DataPageHeader,
  StatusBadge
} from '@/components/ui-islamic';
import { UserPlus, Download } from 'lucide-react';

// Sample data
const sampleData = [
  { id: 1, nama: 'Ahmad Fadli Rahman', kelas: 'X IPA 1', hafalan: 15, target: 20, status: 'active', nilai: 85 },
  { id: 2, nama: 'Siti Nurhaliza', kelas: 'X IPA 2', hafalan: 12, target: 20, status: 'active', nilai: 92 },
  { id: 3, nama: 'Muhammad Rizki', kelas: 'XI IPA 1', hafalan: 8, target: 15, status: 'incomplete', nilai: 78 },
  { id: 4, nama: 'Fatimah Zahra', kelas: 'X IPS 1', hafalan: 18, target: 20, status: 'active', nilai: 88 },
  { id: 5, nama: 'Abdullah Hasan', kelas: 'XI IPA 2', hafalan: 10, target: 15, status: 'revision', nilai: 75 },
  { id: 6, nama: 'Khadijah Aisyah', kelas: 'X IPA 1', hafalan: 14, target: 20, status: 'active', nilai: 90 },
  { id: 7, nama: 'Umar Faruq', kelas: 'XII IPA 1', hafalan: 25, target: 30, status: 'active', nilai: 95 },
  { id: 8, nama: 'Maryam Salsabila', kelas: 'X IPS 2', hafalan: 6, target: 20, status: 'incomplete', nilai: 70 },
  { id: 9, nama: 'Ali Imran', kelas: 'XI IPS 1', hafalan: 16, target: 20, status: 'active', nilai: 87 },
  { id: 10, nama: 'Zainab Husna', kelas: 'XII IPA 2', hafalan: 28, target: 30, status: 'active', nilai: 93 },
];

export default function DataSiswaExamplePage() {
  const [searchValue, setSearchValue] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Filter data based on search
  const filteredData = sampleData.filter(item =>
    item.nama.toLowerCase().includes(searchValue.toLowerCase()) ||
    item.kelas.toLowerCase().includes(searchValue.toLowerCase())
  );

  // Paginate data
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Define table columns
  const columns = [
    {
      header: 'No',
      accessor: 'id',
      align: 'center',
      render: (row) => {
        const index = filteredData.findIndex(item => item.id === row.id);
        return (currentPage - 1) * itemsPerPage + index + 1;
      }
    },
    {
      header: 'Nama Siswa',
      accessor: 'nama',
    },
    {
      header: 'Kelas',
      accessor: 'kelas',
      align: 'center',
    },
    {
      header: 'Hafalan (Juz)',
      accessor: 'hafalan',
      align: 'center',
      highlight: true,
      render: (row) => `${row.hafalan} / ${row.target}`
    },
    {
      header: 'Nilai',
      accessor: 'nilai',
      align: 'center',
      highlight: true,
    },
    {
      header: 'Status',
      accessor: 'status',
      align: 'center',
      render: (row) => {
        const statusMap = {
          active: { label: 'Aktif', type: 'active' },
          incomplete: { label: 'Belum Lengkap', type: 'incomplete' },
          revision: { label: 'Perlu Revisi', type: 'revision' },
        };
        const status = statusMap[row.status] || { label: row.status, type: 'default' };
        return <StatusBadge status={status.label} type={status.type} />;
      }
    },
  ];

  const handleRowClick = (row) => {
    console.log('Row clicked:', row);
    // Navigate to detail page or show modal
  };

  return (
    <AdminLayout>
      <div style={{
        minHeight: '100vh',
        background: '#F8FDFB',
        padding: '2rem 2.5rem',
      }}>
        {/* Page Header */}
        <DataPageHeader
          title="Data Siswa"
          subtitle="Kelola dan pantau progres hafalan siswa"
          action={
            <button
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.5rem',
                background: '#41C99D',
                border: 'none',
                borderRadius: '0.75rem',
                fontSize: '0.875rem',
                fontWeight: 600,
                fontFamily: 'Poppins, system-ui, -apple-system, sans-serif',
                color: '#FFFFFF',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              className="header-action-btn"
            >
              <UserPlus size={18} />
              Tambah Siswa
            </button>
          }
        />

        {/* Filters */}
        <DataTableFilters
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          filterOptions={true}
          onFilterChange={() => console.log('Filter clicked')}
          actionButton={{
            icon: <Download size={18} />,
            label: 'Export',
            onClick: () => console.log('Export clicked')
          }}
        />

        {/* Data Table */}
        <DataTable
          columns={columns}
          data={paginatedData}
          onRowClick={handleRowClick}
          emptyMessage="Tidak ada data siswa yang ditemukan"
        />

        {/* Pagination */}
        <DataTablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={filteredData.length}
          itemsPerPage={itemsPerPage}
        />

        <style jsx>{`
          .header-action-btn:hover {
            background: #38B48D;
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(65, 201, 157, 0.3);
          }
        `}</style>
      </div>
    </AdminLayout>
  );
}
