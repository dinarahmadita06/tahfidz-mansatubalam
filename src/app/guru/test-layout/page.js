export const dynamic = 'force-dynamic';
export const revalidate = 0;
import GuruLayout from '@/components/layout/GuruLayout';

export default function TestPage() {
  return (
    <GuruLayout>
      <div className="p-6">
        <h1>Test Layout Guru</h1>
        <p>This is a test page to check if LayoutGuru works.</p>
      </div>
    </GuruLayout>
  );
}