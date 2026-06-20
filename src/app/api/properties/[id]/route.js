import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/serverAuth';
import cloudinary from '@/lib/cloudinary';

async function findProperty(idOrSlug) {
  return prisma.property.findFirst({
    where: { OR: [{ id: idOrSlug }, { slug: idOrSlug }] },
    include: {
      images: { orderBy: { order: 'asc' } },
      listedBy: { select: { id: true, name: true, email: true, phone: true, role: true } },
      _count: { select: { leads: true, propertyViews: true } },
    },
  });
}

export async function GET(req, { params }) {
  try {
    const property = await findProperty(params.id);
    if (!property) return NextResponse.json({ error: 'Property not found' }, { status: 404 });

    const user = await getCurrentUser();
    const isOwnerOrStaff =
      user && (user.role === 'ADMIN' || user.role === 'OPERATOR' || user.id === property.listedById);

    // Public / unauthenticated visitors only get a teaser: images + area + basic location
    if (!user && !isOwnerOrStaff) {
      const teaser = {
        id: property.id,
        slug: property.slug,
        title: property.title,
        propertyType: property.propertyType,
        listingType: property.listingType,
        areaSqft: property.areaSqft,
        city: property.city,
        state: property.state,
        locality: property.locality,
        images: property.images,
        isFeatured: property.isFeatured,
        createdAt: property.createdAt,
        gated: true,
      };
      return NextResponse.json({ property: teaser });
    }

    return NextResponse.json({ property: { ...property, gated: false } });
  } catch (err) {
    console.error('GET /api/properties/[id] error', err);
    return NextResponse.json({ error: 'Failed to fetch property' }, { status: 500 });
  }
}

export async function PATCH(req, { params }) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const existing = await prisma.property.findUnique({ where: { id: params.id } });
    if (!existing) return NextResponse.json({ error: 'Property not found' }, { status: 404 });

    const isOwner = existing.listedById === user.id;
    if (!isOwner && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();

    const data = {};
    const allowedFields = [
      'title', 'description', 'propertyType', 'listingType', 'status', 'price',
      'isNegotiable', 'areaSqft', 'carpetAreaSqft', 'bedrooms', 'bathrooms',
      'balconies', 'floorNumber', 'totalFloors', 'furnishStatus', 'ageOfPropertyYears',
      'facing', 'addressLine', 'locality', 'city', 'state', 'pincode', 'latitude',
      'longitude', 'amenities', 'contactName', 'contactPhone', 'contactEmail',
    ];
    for (const field of allowedFields) {
      if (body[field] !== undefined) data[field] = body[field];
    }

    // Only admin can feature a listing
    if (body.isFeatured !== undefined && user.role === 'ADMIN') {
      data.isFeatured = !!body.isFeatured;
    }

    const numericFields = ['price', 'areaSqft', 'carpetAreaSqft', 'latitude', 'longitude'];
    numericFields.forEach((f) => {
      if (data[f] !== undefined && data[f] !== null) data[f] = parseFloat(data[f]);
    });
    const intFields = ['bedrooms', 'bathrooms', 'balconies', 'floorNumber', 'totalFloors', 'ageOfPropertyYears'];
    intFields.forEach((f) => {
      if (data[f] !== undefined && data[f] !== null) data[f] = parseInt(data[f], 10);
    });

    // Handle image replacement if provided
    if (Array.isArray(body.images)) {
      const oldImages = await prisma.propertyImage.findMany({ where: { propertyId: params.id } });
      const newPublicIds = new Set(body.images.map((i) => i.publicId));
      const toDelete = oldImages.filter((i) => !newPublicIds.has(i.publicId));

      await prisma.propertyImage.deleteMany({ where: { propertyId: params.id } });
      await prisma.propertyImage.createMany({
        data: body.images.map((img, idx) => ({
          propertyId: params.id,
          url: img.url,
          publicId: img.publicId,
          order: idx,
        })),
      });

      // Best-effort cleanup of removed Cloudinary assets
      for (const img of toDelete) {
        try {
          await cloudinary.uploader.destroy(img.publicId);
        } catch (e) {
          console.error('Cloudinary destroy failed', e);
        }
      }
    }

    const property = await prisma.property.update({
      where: { id: params.id },
      data,
      include: { images: { orderBy: { order: 'asc' } } },
    });

    return NextResponse.json({ property });
  } catch (err) {
    console.error('PATCH /api/properties/[id] error', err);
    return NextResponse.json({ error: 'Failed to update property' }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const existing = await prisma.property.findUnique({
      where: { id: params.id },
      include: { images: true },
    });
    if (!existing) return NextResponse.json({ error: 'Property not found' }, { status: 404 });

    const isOwner = existing.listedById === user.id;
    if (!isOwner && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    for (const img of existing.images) {
      try {
        await cloudinary.uploader.destroy(img.publicId);
      } catch (e) {
        console.error('Cloudinary destroy failed', e);
      }
    }

    await prisma.property.delete({ where: { id: params.id } });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('DELETE /api/properties/[id] error', err);
    return NextResponse.json({ error: 'Failed to delete property' }, { status: 500 });
  }
}
