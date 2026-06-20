import prisma from '@/lib/prisma';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/serverAuth';
import { formatINR } from '@/lib/constants';

export const dynamic = 'force-dynamic';

async function getStats(userId, isAdmin) {
  const ownerFilter = isAdmin ? {} : { listedById: userId };
  const since30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [totalProperties, activeProperties, totalLeads, propertyViews30, recentLeads] = await Promise.all([
    prisma.property.count({ where: ownerFilter }),
    prisma.property.count({ where: { ...ownerFilter, status: 'ACTIVE' } }),
    prisma.lead.count({ where: { property: ownerFilter } }),
    prisma.propertyView.count({ where: { createdAt: { gte: since30 }, property: ownerFilter } }),
    prisma.lead.findMany({
      where: { property: ownerFilter },
      orderBy: { createdAt: 'desc' },
      take: 8,
      include: { property: { select: { title: true, slug: true } } },
    }),
  ]);

  return { totalProperties, activeProperties, totalLeads, propertyViews30, recentLeads };
}

export default async function OperatorDashboard() {
  const user = await getCurrentUser();
  const stats = await getStats(user.id, user.role === 'ADMIN');

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-brand-800">Operator Dashboard</h1>

      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="My Listings" value={stats.totalProperties} />
        <StatCard label="Active" value={stats.activeProperties} />
        <StatCard label="Total Leads" value={stats.totalLeads} />
        <StatCard label="Views (30d)" value={stats.propertyViews30} />
      </div>

      <div className="card p-5">
        <h2 className="mb-3 font-semibold text-slate-800">Recent Leads</h2>
        {stats.recentLeads.length === 0 ? (
          <p className="text-sm text-slate-400">No leads yet. Once buyers enquire about your listings, they&apos;ll show up here.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {stats.recentLeads.map((l) => (
              <li key={l.id} className="py-2 text-sm">
                <p className="font-medium text-slate-800">{l.name} — {l.phone}</p>
                <p className="text-slate-500">
                  on <Link href={`/properties/${l.property.slug}`} className="text-brand-700 hover:underline">{l.property.title}</Link>
                </p>
              </li>
            ))}
          </ul>
        )}
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
