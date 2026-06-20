import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/serverAuth';
import slugify from 'slugify';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);

    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = Math.min(parseInt(searchParams.get('limit') || '12', 10), 50);
    const skip = (page - 1) * limit;

    const propertyType = searchParams.get('propertyType');
    const listingType = searchParams.get('listingType');
    const city = searchParams.get('city');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const bedrooms = searchParams.get('bedrooms');
    const q = searchParams.get('q');
    const featured = searchParams.get('featured');
    const mine = searchParams.get('mine'); // operator's own listings
    const status = searchParams.get('status');
    const adminAll = searchParams.get('adminAll'); // admin viewing all properties, any status

    const where = {};

    // Public listing endpoint only shows ACTIVE unless explicitly viewing own listings
    if (adminAll === 'true') {
      const user = await getCurrentUser();
      if (!user || user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      if (status) where.status = status;
      // no status filter = all statuses
    } else if (mine === 'true') {
      const user = await getCurrentUser();
      if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      where.listedById = user.id;
      if (status) where.status = status;
    } else {
      where.status = 'ACTIVE';
    }

    if (propertyType) where.propertyType = propertyType;
    if (listingType) where.listingType = listingType;
    if (city) where.city = { equals: city, mode: 'insensitive' };
    if (bedrooms) where.bedrooms = parseInt(bedrooms, 10);
    if (featured === 'true') where.isFeatured = true;

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    if (q) {
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { locality: { contains: q, mode: 'insensitive' } },
        { city: { contains: q, mode: 'insensitive' } },
        { addressLine: { contains: q, mode: 'insensitive' } },
      ];
    }

    const [properties, total] = await Promise.all([
      prisma.property.findMany({
        where,
        include: {
          images: { orderBy: { order: 'asc' }, take: 1 },
          _count: { select: { leads: true, propertyViews: true } },
        },
        orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
        skip,
        take: limit,
      }),
      prisma.property.count({ where }),
    ]);

    return NextResponse.json({
      properties,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error('GET /api/properties error', err);
    return NextResponse.json({ error: 'Failed to fetch properties' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const user = await getCurrentUser();
    if (!user || !['ADMIN', 'OPERATOR'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();

    const required = [
      'title', 'description', 'propertyType', 'listingType', 'price',
      'areaSqft', 'addressLine', 'locality', 'city', 'state', 'pincode',
      'contactName', 'contactPhone',
    ];
    for (const field of required) {
      if (body[field] === undefined || body[field] === null || body[field] === '') {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 });
      }
    }

    const baseSlug = slugify(`${body.title}-${body.city}-${Date.now()}`, { lower: true, strict: true });

    const property = await prisma.property.create({
      data: {
        slug: baseSlug,
        title: body.title,
        description: body.description,
        propertyType: body.propertyType,
        listingType: body.listingType,
        status: body.status || 'ACTIVE',
        price: parseFloat(body.price),
        isNegotiable: !!body.isNegotiable,
        areaSqft: parseFloat(body.areaSqft),
        carpetAreaSqft: body.carpetAreaSqft ? parseFloat(body.carpetAreaSqft) : null,
        bedrooms: body.bedrooms ? parseInt(body.bedrooms, 10) : null,
        bathrooms: body.bathrooms ? parseInt(body.bathrooms, 10) : null,
        balconies: body.balconies ? parseInt(body.balconies, 10) : null,
        floorNumber: body.floorNumber ? parseInt(body.floorNumber, 10) : null,
        totalFloors: body.totalFloors ? parseInt(body.totalFloors, 10) : null,
        furnishStatus: body.furnishStatus || null,
        ageOfPropertyYears: body.ageOfPropertyYears ? parseInt(body.ageOfPropertyYears, 10) : null,
        facing: body.facing || null,
        addressLine: body.addressLine,
        locality: body.locality,
        city: body.city,
        state: body.state,
        pincode: body.pincode,
        latitude: body.latitude ? parseFloat(body.latitude) : null,
        longitude: body.longitude ? parseFloat(body.longitude) : null,
        amenities: Array.isArray(body.amenities) ? body.amenities : [],
        contactName: body.contactName,
        contactPhone: body.contactPhone,
        contactEmail: body.contactEmail || null,
        isFeatured: !!body.isFeatured && user.role === 'ADMIN',
        listedById: user.id,
        images: {
          create: (body.images || []).map((img, idx) => ({
            url: img.url,
            publicId: img.publicId,
            order: idx,
          })),
        },
      },
      include: { images: true },
    });

    return NextResponse.json({ property }, { status: 201 });
  } catch (err) {
    console.error('POST /api/properties error', err);
    return NextResponse.json({ error: 'Failed to create property' }, { status: 500 });
  }
}
