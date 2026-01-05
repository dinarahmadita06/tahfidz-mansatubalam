import { redirect } from 'next/navigation';

/**
 * Server-side redirect dari /orangtua ke /orangtua/dashboard
 * Redirect ini terjadi di level server, sehingga layout tetap dipertahankan
 */
export default function OrangtuaIndexPage() {
  // Server-side redirect - ini akan redirect sebelum render
  redirect('/orangtua/dashboard');
}
