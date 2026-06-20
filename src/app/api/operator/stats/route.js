import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireRole } from '@/lib/serverAuth';

export async function GET() {
  const { error, status, user } = await requireRole(['ADMIN', 'OPERATOR']);
  if (error) return NextResponse.json({ error }, { status });

  try {
    const since30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const ownerFilter = user.role === 'OPERATOR' ? { listedById: user.id } : {};

    const [
      totalProperties,
      activeProperties,
      totalLeads,
      propertyViews30,
      myProperties,
      recentLeads,
    ] = await Promise.all([
      prisma.property.count({ where: ownerFilter }),
      prisma.property.count({ where: { ...ownerFilter, status: 'ACTIVE' } }),
      prisma.lead.count({ where: { property: ownerFilter } }),
      prisma.propertyView.count({
        where: { createdAt: { gte: since30 }, property: ownerFilter },
      }),
      prisma.property.findMany({
        where: ownerFilter,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true, title: true, slug: true, viewCount: true, status: true,
          price: true, city: true, createdAt: true,
          images: { take: 1, orderBy: { order: 'asc' } },
          _count: { select: { leads: true } },
        },
      }),
      prisma.lead.findMany({
        where: { property: ownerFilter },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: { property: { select: { title: true, slug: true } } },
      }),
    ]);

    return NextResponse.json({
      totals: { totalProperties, activeProperties, totalLeads, propertyViews30 },
      myProperties,
      recentLeads,
    });
  } catch (err) {
    console.error('GET /api/operator/stats error', err);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
