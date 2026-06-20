import PropertyForm from '@/components/PropertyForm';

export const metadata = { title: 'Add Property' };

export default function AdminNewPropertyPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-brand-800">List a New Property</h1>
      <PropertyForm basePath="/admin" isAdmin />
    </div>
  );
}
