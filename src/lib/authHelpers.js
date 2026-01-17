/**
 * Helper functions for role-based access control
 */

import { NextResponse } from 'next/server';

/**
 * Validate if session user is ADMIN
 * @param {Object} session - NextAuth session object
 * @returns {NextResponse|null} - Returns error response if not admin, null if valid
 */
export function requireAdmin(session) {
  if (!session) {
    return NextResponse.json(
      { error: 'Unauthorized - Anda harus login' },
      { status: 401 }
    );
  }

  if (session.user?.role !== 'ADMIN') {
    return NextResponse.json(
      { error: 'Forbidden - Hanya ADMIN yang dapat mengakses' },
      { status: 403 }
    );
  }

  return null; // Valid admin
}

/**
 * Validate if session user is ADMIN or GURU
 * @param {Object} session - NextAuth session object
 * @returns {NextResponse|null} - Returns error response if not admin/guru, null if valid
 */
export function requireAdminOrGuru(session) {
  if (!session) {
    return NextResponse.json(
      { error: 'Unauthorized - Anda harus login' },
      { status: 401 }
    );
  }

  if (session.user?.role !== 'ADMIN' && session.user?.role !== 'GURU') {
    return NextResponse.json(
      { error: 'Forbidden - Akses ditolak' },
      { status: 403 }
    );
  }

  return null; // Valid admin or guru
}
