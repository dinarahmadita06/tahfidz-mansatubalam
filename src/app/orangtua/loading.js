import LoadingIndicator from '@/components/shared/LoadingIndicator';

export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <LoadingIndicator text="Memuat halaman..." size="large" />
    </div>
  );
}
