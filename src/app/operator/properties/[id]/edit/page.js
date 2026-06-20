import prisma from '@/lib/prisma';
import { notFound, redirect } from 'next/navigation';
import PropertyForm from '@/components/PropertyForm';
import { getCurrentUser } from '@/lib/serverAuth';

export const metadata = { title: 'Edit Property' };

async function getProperty(id) {
  return prisma.property.findUnique({
    where: { id },
    include: { images: { orderBy: { order: 'asc' } } },
  });
}

export default async function OperatorEditPropertyPage({ params }) {
  const user = await getCurrentUser();
  const property = await getProperty(params.id);
  if (!property) notFound();

  if (property.listedById !== user.id && user.role !== 'ADMIN') {
    redirect('/operator/properties');
  }

  const initialData = {
    title: property.title,
    description: property.description,
    propertyType: property.propertyType,
    listingType: property.listingType,
    status: property.status,
    price: property.price,
    isNegotiable: property.isNegotiable,
    areaSqft: property.areaSqft,
    carpetAreaSqft: property.carpetAreaSqft || '',
    bedrooms: property.bedrooms || '',
    bathrooms: property.bathrooms || '',
    balconies: property.balconies || '',
    floorNumber: property.floorNumber ?? '',
    totalFloors: property.totalFloors || '',
    furnishStatus: property.furnishStatus || '',
    ageOfPropertyYears: property.ageOfPropertyYears ?? '',
    facing: property.facing || '',
    addressLine: property.addressLine,
    locality: property.locality,
    city: property.city,
    state: property.state,
    pincode: property.pincode,
    amenities: property.amenities || [],
    contactName: property.contactName,
    contactPhone: property.contactPhone,
    contactEmail: property.contactEmail || '',
    isFeatured: property.isFeatured,
    images: property.images,
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-brand-800">Edit Property</h1>
      <PropertyForm initialData={initialData} propertyId={property.id} basePath="/operator" isAdmin={user.role === 'ADMIN'} />
    </div>
  );
}
