'use client';

import React from 'react';
import { Search, ChevronLeft, ChevronRight, Filter } from 'lucide-react';

// Status Badge Component
export function StatusBadge({ status, type = 'default' }) {
  const statusStyles = {
    active: {
      bg: '#D1FAE5',
      text: '#047857',
      border: '#A7F3D0'
    },
    pending: {
      bg: '#FEF3C7',
      text: '#D97706',
      border: '#FDE68A'
    },
    incomplete: {
      bg: '#D9FBEF',
      text: '#5B756C',
      border: '#B8F1DF'
    },
    revision: {
      bg: '#FBD38D',
      text: '#92400E',
      border: '#F59E0B'
    }
  };

  const style = statusStyles[type] || statusStyles.active;

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '0.25rem 0.75rem',
      borderRadius: '9999px',
      fontSize: '0.75rem',
      fontWeight: 500,
      fontFamily: 'Poppins, system-ui, -apple-system, sans-serif',
      background: style.bg,
      color: style.text,
      border: `1px solid ${style.border}`,
    }}>
      {status}
    </span>
  );
}

// Search and Filter Bar Component
export function DataTableFilters({
  searchValue,
  onSearchChange,
  filterOptions,
  onFilterChange,
  actionButton
}) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: '1rem',
      marginBottom: '1.5rem',
      flexWrap: 'wrap'
    }}>
      <div style={{ position: 'relative', flex: '1 1 300px', maxWidth: '400px' }}>
        <Search
          size={18}
          color="#5B756C"
          style={{
            position: 'absolute',
            left: '1rem',
            top: '50%',
            transform: 'translateY(-50%)',
            pointerEvents: 'none'
          }}
        />
        <input
          type="text"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Cari data..."
          style={{
            width: '100%',
            padding: '0.75rem 1rem 0.75rem 2.75rem',
            background: '#E9FCF5',
            border: '1px solid #CFFAE8',
            borderRadius: '0.75rem',
            fontSize: '0.875rem',
            fontFamily: 'Poppins, system-ui, -apple-system, sans-serif',
            color: '#133D34',
            outline: 'none',
            transition: 'all 0.2s ease',
          }}
          onFocus={(e) => {
            e.target.style.borderColor = '#35C29B';
            e.target.style.background = '#FFFFFF';
            e.target.style.boxShadow = '0 0 0 3px rgba(53, 194, 155, 0.1)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#CFFAE8';
            e.target.style.background = '#E9FCF5';
            e.target.style.boxShadow = 'none';
          }}
        />
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
        {filterOptions && (
          <button
            onClick={onFilterChange}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.25rem',
              background: '#FFFFFF',
              border: '1px solid #E0F7EF',
              borderRadius: '0.75rem',
              fontSize: '0.875rem',
              fontWeight: 500,
              fontFamily: 'Poppins, system-ui, -apple-system, sans-serif',
              color: '#133D34',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#F0FAF7';
              e.target.style.borderColor = '#35C29B';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = '#FFFFFF';
              e.target.style.borderColor = '#E0F7EF';
            }}
          >
            <Filter size={16} />
            Filter
          </button>
        )}

        {actionButton && (
          <button
            onClick={actionButton.onClick}
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
            onMouseEnter={(e) => {
              e.target.style.background = '#38B48D';
              e.target.style.transform = 'translateY(-1px)';
              e.target.style.boxShadow = '0 4px 12px rgba(65, 201, 157, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = '#41C99D';
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }}
          >
            {actionButton.icon}
            {actionButton.label}
          </button>
        )}
      </div>
    </div>
  );
}

// Pagination Component
export function DataTablePagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage
}) {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: '1.5rem',
      padding: '1rem 0',
      borderTop: '1px solid #E0F7EF',
      flexWrap: 'wrap',
      gap: '1rem'
    }}>
      <p style={{
        fontSize: '0.875rem',
        color: '#5B756C',
        fontFamily: 'Poppins, system-ui, -apple-system, sans-serif',
      }}>
        Menampilkan {startItem} - {endItem} dari {totalItems} data
      </p>

      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '36px',
            height: '36px',
            background: currentPage === 1 ? '#F0FAF7' : '#CFFAE8',
            border: 'none',
            borderRadius: '9999px',
            cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
            opacity: currentPage === 1 ? 0.5 : 1,
          }}
          onMouseEnter={(e) => {
            if (currentPage !== 1) e.target.style.background = '#B8F1DF';
          }}
          onMouseLeave={(e) => {
            if (currentPage !== 1) e.target.style.background = '#CFFAE8';
          }}
        >
          <ChevronLeft size={18} color={currentPage === 1 ? '#A8BFB7' : '#133D34'} />
        </button>

        {[...Array(totalPages)].map((_, index) => {
          const pageNum = index + 1;
          const isActive = pageNum === currentPage;

          if (
            pageNum === 1 ||
            pageNum === totalPages ||
            (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
          ) {
            return (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: '36px',
                  height: '36px',
                  padding: '0 0.75rem',
                  background: isActive ? '#35C29B' : '#CFFAE8',
                  border: 'none',
                  borderRadius: '9999px',
                  fontSize: '0.875rem',
                  fontWeight: isActive ? 600 : 500,
                  fontFamily: 'Poppins, system-ui, -apple-system, sans-serif',
                  color: isActive ? '#FFFFFF' : '#133D34',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = isActive ? '#2EA888' : '#B8F1DF';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = isActive ? '#35C29B' : '#CFFAE8';
                }}
              >
                {pageNum}
              </button>
            );
          } else if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
            return <span key={pageNum} style={{ color: '#A8BFB7' }}>...</span>;
          }
          return null;
        })}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '36px',
            height: '36px',
            background: currentPage === totalPages ? '#F0FAF7' : '#CFFAE8',
            border: 'none',
            borderRadius: '9999px',
            cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
            opacity: currentPage === totalPages ? 0.5 : 1,
          }}
          onMouseEnter={(e) => {
            if (currentPage !== totalPages) e.target.style.background = '#B8F1DF';
          }}
          onMouseLeave={(e) => {
            if (currentPage !== totalPages) e.target.style.background = '#CFFAE8';
          }}
        >
          <ChevronRight size={18} color={currentPage === totalPages ? '#A8BFB7' : '#133D34'} />
        </button>
      </div>
    </div>
  );
}

// Main DataTable Component
export function DataTable({
  columns,
  data,
  onRowClick,
  emptyMessage = "Tidak ada data yang tersedia"
}) {
  return (
    <div style={{
      width: '100%',
      overflowX: 'auto',
      background: '#FFFFFF',
      borderRadius: '1rem',
      border: '1px solid #E0F7EF',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
    }}>
      <table style={{
        width: '100%',
        borderCollapse: 'collapse',
        fontFamily: 'Poppins, system-ui, -apple-system, sans-serif',
      }}>
        <thead>
          <tr style={{
            background: '#E9FCF5',
            borderBottom: '2px solid #CFFAE8',
          }}>
            {columns.map((column, index) => (
              <th
                key={index}
                style={{
                  padding: '1rem 1.25rem',
                  textAlign: column.align || 'left',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: '#133D34',
                  whiteSpace: 'nowrap',
                }}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                style={{
                  padding: '3rem',
                  textAlign: 'center',
                  color: '#7FA393',
                  fontSize: '0.875rem',
                }}
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                onClick={() => onRowClick && onRowClick(row)}
                style={{
                  background: rowIndex % 2 === 0 ? '#FFFFFF' : '#FCFFFD',
                  borderBottom: '1px solid #E0F7EF',
                  cursor: onRowClick ? 'pointer' : 'default',
                  transition: 'background 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#E7FBF4';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = rowIndex % 2 === 0 ? '#FFFFFF' : '#FCFFFD';
                }}
              >
                {columns.map((column, colIndex) => (
                  <td
                    key={colIndex}
                    style={{
                      padding: '1rem 1.25rem',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      color: column.highlight ? '#35C29B' : '#133D34',
                      textAlign: column.align || 'left',
                    }}
                  >
                    {column.render ? column.render(row) : row[column.accessor]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

// Page Header Component
export function DataPageHeader({ title, subtitle, action }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '2rem',
      gap: '1rem',
      flexWrap: 'wrap'
    }}>
      <div>
        <h1 style={{
          fontSize: '1.5rem',
          fontWeight: 600,
          color: '#133D34',
          marginBottom: '0.5rem',
          fontFamily: 'Poppins, system-ui, -apple-system, sans-serif',
          letterSpacing: '-0.02em',
        }}>
          {title}
        </h1>
        {subtitle && (
          <p style={{
            fontSize: '0.875rem',
            color: '#5B756C',
            fontFamily: 'Poppins, system-ui, -apple-system, sans-serif',
          }}>
            {subtitle}
          </p>
        )}
      </div>
      {action && action}
    </div>
  );
}
