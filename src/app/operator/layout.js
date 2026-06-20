import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/serverAuth';
import AdminSidebar from '@/components/AdminSidebar';

export const metadata = {
  title: 'Operator Panel',
  robots: { index: false, follow: false },
};

export default async function OperatorLayout({ children }) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login?callbackUrl=/operator');
  }
  if (!['OPERATOR', 'ADMIN'].includes(user.role)) {
    redirect('/');
  }

  return (
    <div className="container-page flex flex-col gap-6 py-8 lg:flex-row">
      <AdminSidebar basePath="/operator" title="Operator Panel" role="OPERATOR" />
      <div className="flex-1">{children}</div>
    </div>
  );
}
