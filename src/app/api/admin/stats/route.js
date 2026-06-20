import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireRole } from '@/lib/serverAuth';

export async function GET() {
  const { error, status } = await requireRole(['ADMIN']);
  if (error) return NextResponse.json({ error }, { status });

  try {
    const since30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const since7 = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [
      totalProperties,
      activeProperties,
      totalLeads,
      totalUsers,
      totalOperators,
      totalCustomers,
      siteVisits30,
      siteVisits7,
      propertyViews30,
      topViewedProperties,
      recentLeads,
      leadsByDay,
      propertiesByType,
    ] = await Promise.all([
      prisma.property.count(),
      prisma.property.count({ where: { status: 'ACTIVE' } }),
      prisma.lead.count(),
      prisma.user.count(),
      prisma.user.count({ where: { role: 'OPERATOR' } }),
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
      prisma.siteVisit.count({ where: { createdAt: { gte: since30 } } }),
      prisma.siteVisit.count({ where: { createdAt: { gte: since7 } } }),
      prisma.propertyView.count({ where: { createdAt: { gte: since30 } } }),
      prisma.property.findMany({
        orderBy: { viewCount: 'desc' },
        take: 5,
        select: {
          id: true, title: true, slug: true, viewCount: true, city: true,
          _count: { select: { leads: true } },
        },
      }),
      prisma.lead.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: { property: { select: { title: true, slug: true } } },
      }),
      prisma.$queryRaw`
        SELECT DATE("createdAt") as date, COUNT(*)::int as count
        FROM "Lead"
        WHERE "createdAt" >= ${since30}
        GROUP BY DATE("createdAt")
        ORDER BY date ASC
      `,
      prisma.property.groupBy({
        by: ['propertyType'],
        _count: { _all: true },
      }),
    ]);

    return NextResponse.json({
      totals: {
        totalProperties,
        activeProperties,
        totalLeads,
        totalUsers,
        totalOperators,
        totalCustomers,
      },
      traffic: {
        siteVisits30,
        siteVisits7,
        propertyViews30,
      },
      topViewedProperties,
      recentLeads,
      leadsByDay,
      propertiesByType,
    });
  } catch (err) {
    console.error('GET /api/admin/stats error', err);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
