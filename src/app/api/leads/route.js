import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser, requireRole } from '@/lib/serverAuth';

export async function POST(req) {
  try {
    const user = await getCurrentUser();
    // Leads can only be submitted by a registered/logged-in customer,
    // since full property details are gated behind login anyway.
    if (!user) {
      return NextResponse.json({ error: 'Please login to contact the lister.' }, { status: 401 });
    }

    const body = await req.json();
    const { propertyId, name, email, phone, message } = body;

    if (!propertyId || !name || !email || !phone) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const property = await prisma.property.findUnique({ where: { id: propertyId } });
    if (!property) return NextResponse.json({ error: 'Property not found' }, { status: 404 });

    const lead = await prisma.lead.create({
      data: {
        propertyId,
        userId: user.id,
        name,
        email,
        phone,
        message: message || null,
      },
    });

    return NextResponse.json({ lead }, { status: 201 });
  } catch (err) {
    console.error('POST /api/leads error', err);
    return NextResponse.json({ error: 'Failed to submit enquiry' }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const propertyId = searchParams.get('propertyId');

    const { user, error, status } = await requireRole(['ADMIN', 'OPERATOR']);
    if (error) return NextResponse.json({ error }, { status });

    const where = {};
    if (propertyId) where.propertyId = propertyId;

    // Operators only see leads for their own properties
    if (user.role === 'OPERATOR') {
      where.property = { listedById: user.id };
    }

    const leads = await prisma.lead.findMany({
      where,
      include: {
        property: { select: { id: true, title: true, slug: true, city: true, listedById: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });

    return NextResponse.json({ leads });
  } catch (err) {
    console.error('GET /api/leads error', err);
    return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 });
  }
}
