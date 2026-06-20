import prisma from '@/lib/prisma';
import PropertyCard from '@/components/PropertyCard';
import PropertyFilters from '@/components/PropertyFilters';
import VisitTracker from '@/components/VisitTracker';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ searchParams }) {
  const city = searchParams.city;
  const type = searchParams.propertyType;
  const title = [type, city].filter(Boolean).length
    ? `Properties ${type ? `- ${type.replace('_', ' ')}` : ''} ${city ? `in ${city}` : ''}`.trim()
    : 'All Properties';
  return {
    title,
    description: `Browse ${title.toLowerCase()} for sale and rent in India with SSP Enterprises. Verified listings, direct contact, no brokerage hassle.`,
  };
}

async function getProperties(searchParams) {
  const page = parseInt(searchParams.page || '1', 10);
  const limit = 12;
  const skip = (page - 1) * limit;

  const where = { status: 'ACTIVE' };
  if (searchParams.propertyType) where.propertyType = searchParams.propertyType;
  if (searchParams.listingType) where.listingType = searchParams.listingType;
  if (searchParams.city) where.city = { contains: searchParams.city, mode: 'insensitive' };
  if (searchParams.bedrooms) where.bedrooms = parseInt(searchParams.bedrooms, 10);
  if (searchParams.minPrice || searchParams.maxPrice) {
    where.price = {};
    if (searchParams.minPrice) where.price.gte = parseFloat(searchParams.minPrice);
    if (searchParams.maxPrice) where.price.lte = parseFloat(searchParams.maxPrice);
  }
  if (searchParams.q) {
    where.OR = [
      { title: { contains: searchParams.q, mode: 'insensitive' } },
      { locality: { contains: searchParams.q, mode: 'insensitive' } },
      { city: { contains: searchParams.q, mode: 'insensitive' } },
    ];
  }

  const [properties, total] = await Promise.all([
    prisma.property.findMany({
      where,
      include: { images: { take: 1, orderBy: { order: 'asc' } } },
      orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
      skip,
      take: limit,
    }),
    prisma.property.count({ where }),
  ]);

  return { properties, total, page, totalPages: Math.ceil(total / limit) };
}

export default async function PropertiesPage({ searchParams }) {
  const { properties, total, page, totalPages } = await getProperties(searchParams);

  function pageHref(p) {
    const params = new URLSearchParams(searchParams);
    params.set('page', String(p));
    return `/properties?${params.toString()}`;
  }

  return (
    <div className="container-page py-8">
      <VisitTracker />
      <h1 className="section-title mb-2">All Properties</h1>
      <p className="mb-6 text-sm text-slate-500">{total} properties found</p>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
        <aside className="lg:col-span-1">
          <PropertyFilters searchParams={searchParams} />
        </aside>

        <div className="lg:col-span-3">
          {properties.length === 0 ? (
            <div className="card p-10 text-center text-slate-500">
              No properties match your filters. Try broadening your search.
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {properties.map((p) => (
                  <PropertyCard key={p.id} property={p} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="mt-8 flex justify-center gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <Link
                      key={p}
                      href={pageHref(p)}
                      className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                        p === page
                          ? 'bg-brand-600 text-white'
                          : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {p}
                    </Link>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
