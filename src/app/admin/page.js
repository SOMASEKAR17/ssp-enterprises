import prisma from '@/lib/prisma';
import Link from 'next/link';
import AdminCharts from '@/components/AdminCharts';
import { formatINR, propertyTypeLabel } from '@/lib/constants';

export const dynamic = 'force-dynamic';

async function getStats() {
  const since30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [
    totalProperties,
    activeProperties,
    totalLeads,
    totalUsers,
    totalOperators,
    totalCustomers,
    siteVisits30,
    propertyViews30,
    topViewedProperties,
    recentLeads,
    propertiesByType,
  ] = await Promise.all([
    prisma.property.count(),
    prisma.property.count({ where: { status: 'ACTIVE' } }),
    prisma.lead.count(),
    prisma.user.count(),
    prisma.user.count({ where: { role: 'OPERATOR' } }),
    prisma.user.count({ where: { role: 'CUSTOMER' } }),
    prisma.siteVisit.count({ where: { createdAt: { gte: since30 } } }),
    prisma.propertyView.count({ where: { createdAt: { gte: since30 } } }),
    prisma.property.findMany({
      orderBy: { viewCount: 'desc' },
      take: 5,
      select: { id: true, title: true, slug: true, viewCount: true, city: true, _count: { select: { leads: true } } },
    }),
    prisma.lead.findMany({
      orderBy: { createdAt: 'desc' },
      take: 8,
      include: { property: { select: { title: true, slug: true } } },
    }),
    prisma.property.groupBy({ by: ['propertyType'], _count: { _all: true } }),
  ]);

  return {
    totalProperties, activeProperties, totalLeads, totalUsers, totalOperators, totalCustomers,
    siteVisits30, propertyViews30, topViewedProperties, recentLeads, propertiesByType,
  };
}

export default async function AdminDashboard() {
  const stats = await getStats();

  const chartData = stats.propertiesByType.map((p) => ({
    name: propertyTypeLabel(p.propertyType),
    count: p._count._all,
  }));

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-brand-800">Admin Dashboard</h1>

      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard label="Properties" value={stats.totalProperties} />
        <StatCard label="Active" value={stats.activeProperties} />
        <StatCard label="Leads" value={stats.totalLeads} />
        <StatCard label="Users" value={stats.totalUsers} />
        <StatCard label="Operators" value={stats.totalOperators} />
        <StatCard label="Customers" value={stats.totalCustomers} />
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="card p-5">
          <p className="text-xs text-slate-500">Site Visits (last 30 days)</p>
          <p className="text-3xl font-bold text-brand-700">{stats.siteVisits30}</p>
        </div>
        <div className="card p-5">
          <p className="text-xs text-slate-500">Property Page Views (last 30 days)</p>
          <p className="text-3xl font-bold text-brand-700">{stats.propertyViews30}</p>
        </div>
      </div>

      <div className="mb-8">
        <AdminCharts propertiesByType={chartData} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="card p-5">
          <h2 className="mb-3 font-semibold text-slate-800">Top Viewed Properties</h2>
          <ul className="divide-y divide-slate-100">
            {stats.topViewedProperties.map((p) => (
              <li key={p.id} className="flex items-center justify-between py-2 text-sm">
                <Link href={`/properties/${p.slug}`} className="font-medium text-brand-700 hover:underline">
                  {p.title}
                </Link>
                <span className="text-slate-500">{p.viewCount} views · {p._count.leads} leads</span>
              </li>
            ))}
            {stats.topViewedProperties.length === 0 && (
              <p className="py-4 text-sm text-slate-400">No data yet.</p>
            )}
          </ul>
        </div>

        <div className="card p-5">
          <h2 className="mb-3 font-semibold text-slate-800">Recent Leads</h2>
          <ul className="divide-y divide-slate-100">
            {stats.recentLeads.map((l) => (
              <li key={l.id} className="py-2 text-sm">
                <p className="font-medium text-slate-800">{l.name} — {l.phone}</p>
                <p className="text-slate-500">
                  on <Link href={`/properties/${l.property.slug}`} className="text-brand-700 hover:underline">{l.property.title}</Link>
                </p>
              </li>
            ))}
            {stats.recentLeads.length === 0 && (
              <p className="py-4 text-sm text-slate-400">No leads yet.</p>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="card p-4 text-center">
      <p className="text-2xl font-bold text-brand-700">{value}</p>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  );
}
