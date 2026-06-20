import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/serverAuth';
import AdminSidebar from '@/components/AdminSidebar';

export const metadata = {
  title: 'Admin Panel',
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login?callbackUrl=/admin');
  }
  if (user.role !== 'ADMIN') {
    redirect('/');
  }

  return (
    <div className="container-page flex flex-col gap-6 py-8 lg:flex-row">
      <AdminSidebar basePath="/admin" title="Admin Panel" role="ADMIN" />
      <div className="flex-1">{children}</div>
    </div>
  );
}
