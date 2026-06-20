import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/serverAuth';
import { formatINR, propertyTypeLabel, listingTypeLabel } from '@/lib/constants';
import PropertyGallery from '@/components/PropertyGallery';
import LeadForm from '@/components/LeadForm';
import PropertyViewTracker from '@/components/PropertyViewTracker';

export const dynamic = 'force-dynamic';

async function getProperty(slug) {
  return prisma.property.findFirst({
    where: { slug, status: { not: 'INACTIVE' } },
    include: {
      images: { orderBy: { order: 'asc' } },
      listedBy: { select: { name: true, email: true, phone: true, role: true } },
    },
  });
}

export async function generateMetadata({ params }) {
  const property = await getProperty(params.slug);
  if (!property) return { title: 'Property Not Found' };

  const desc = `${propertyTypeLabel(property.propertyType)} ${listingTypeLabel(property.listingType).toLowerCase()} in ${property.locality}, ${property.city}. ${property.areaSqft} sqft.`;

  return {
    title: `${property.title} | ${property.locality}, ${property.city}`,
    description: desc,
    alternates: { canonical: `/properties/${property.slug}` },
    openGraph: {
      title: property.title,
      description: desc,
      images: property.images[0] ? [{ url: property.images[0].url }] : [],
    },
  };
}

export default async function PropertyDetailPage({ params }) {
  const property = await getProperty(params.slug);
  if (!property) notFound();

  const user = await getCurrentUser();
  const isStaffOrOwner =
    user && (user.role === 'ADMIN' || user.role === 'OPERATOR' || user.id === property.listedById);
  const isGated = !user && !isStaffOrOwner;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Residence',
    name: property.title,
    description: property.description,
    address: {
      '@type': 'PostalAddress',
      streetAddress: property.addressLine,
      addressLocality: property.city,
      addressRegion: property.state,
      postalCode: property.pincode,
      addressCountry: 'IN',
    },
    floorSize: { '@type': 'QuantitativeValue', value: property.areaSqft, unitText: 'sqft' },
    image: property.images.map((i) => i.url),
  };

  return (
    <div className="container-page py-8">
      <PropertyViewTracker propertyId={property.id} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <nav className="mb-4 text-xs text-slate-500">
        <Link href="/" className="hover:text-brand-700">Home</Link> /{' '}
        <Link href="/properties" className="hover:text-brand-700">Properties</Link> /{' '}
        <span className="text-slate-700">{isGated ? propertyTypeLabel(property.propertyType) : property.title}</span>
      </nav>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <PropertyGallery images={property.images} gated={isGated} />

          <div className="card mt-6 p-6">
            {isGated ? (
              <>
                <h1 className="mb-2 text-xl font-bold text-slate-800">
                  {propertyTypeLabel(property.propertyType)} for {listingTypeLabel(property.listingType).replace('For ', '')} in {property.locality}, {property.city}
                </h1>
                <p className="mb-4 text-sm text-slate-500">{property.city}, {property.state}</p>
                <div className="flex items-center gap-4 text-sm text-slate-600">
                  <span className="font-semibold">{property.areaSqft} sqft</span>
                </div>

                <div className="mt-6 rounded-lg border-2 border-dashed border-brand-200 bg-brand-50 p-6 text-center">
                  <h2 className="mb-2 text-lg font-bold text-brand-800">
                    🔒 Login to View Full Details
                  </h2>
                  <p className="mb-4 text-sm text-slate-600">
                    Create a free account to see the price, exact address, bedrooms, amenities,
                    contact details, and more.
                  </p>
                  <div className="flex justify-center gap-3">
                    <Link href={`/login?callbackUrl=/properties/${property.slug}`} className="btn-primary">
                      Login
                    </Link>
                    <Link href={`/register?callbackUrl=/properties/${property.slug}`} className="btn-secondary">
                      Register Free
                    </Link>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h1 className="text-xl font-bold text-slate-800 sm:text-2xl">{property.title}</h1>
                    <p className="mt-1 text-sm text-slate-500">
                      {property.addressLine}, {property.locality}, {property.city}, {property.state} - {property.pincode}
                    </p>
                  </div>
                  <p className="text-2xl font-extrabold text-brand-700">
                    {formatINR(property.price)}
                    {property.isNegotiable && <span className="ml-1 text-xs font-normal text-slate-500">(Negotiable)</span>}
                  </p>
                </div>

                <div className="mb-6 grid grid-cols-2 gap-4 rounded-lg bg-slate-50 p-4 sm:grid-cols-4">
                  <Spec label="Area" value={`${property.areaSqft} sqft`} />
                  {property.bedrooms ? <Spec label="Bedrooms" value={`${property.bedrooms} BHK`} /> : null}
                  {property.bathrooms ? <Spec label="Bathrooms" value={property.bathrooms} /> : null}
                  {property.furnishStatus ? <Spec label="Furnishing" value={property.furnishStatus.replace('_', ' ')} /> : null}
                  {property.floorNumber != null ? <Spec label="Floor" value={`${property.floorNumber} of ${property.totalFloors ?? '-'}`} /> : null}
                  {property.facing ? <Spec label="Facing" value={property.facing} /> : null}
                  {property.ageOfPropertyYears != null ? <Spec label="Age" value={`${property.ageOfPropertyYears} yrs`} /> : null}
                  <Spec label="Type" value={propertyTypeLabel(property.propertyType)} />
                </div>

                <h2 className="mb-2 text-lg font-semibold text-slate-800">Description</h2>
                <p className="mb-6 whitespace-pre-line text-sm leading-relaxed text-slate-600">
                  {property.description}
                </p>

                {property.amenities?.length > 0 && (
                  <>
                    <h2 className="mb-2 text-lg font-semibold text-slate-800">Amenities</h2>
                    <div className="mb-6 flex flex-wrap gap-2">
                      {property.amenities.map((a) => (
                        <span key={a} className="badge bg-brand-50 text-brand-700">{a}</span>
                      ))}
                    </div>
                  </>
                )}

                <h2 className="mb-2 text-lg font-semibold text-slate-800">Contact</h2>
                <div className="rounded-lg bg-slate-50 p-4 text-sm">
                  <p><span className="font-medium">Name:</span> {property.contactName}</p>
                  <p><span className="font-medium">Phone:</span> {property.contactPhone}</p>
                  {property.contactEmail && <p><span className="font-medium">Email:</span> {property.contactEmail}</p>}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="lg:col-span-1">
          {!isGated && (
            <div className="sticky top-20">
              <LeadForm propertyId={property.id} isLoggedIn={!!user} userInfo={user} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Spec({ label, value }) {
  return (
    <div>
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-sm font-semibold text-slate-800">{value}</p>
    </div>
  );
}
