import Link from 'next/link';
import prisma from '@/lib/prisma';
import PropertyCard from '@/components/PropertyCard';
import VisitTracker from '@/components/VisitTracker';
import HomeSearchBar from '@/components/HomeSearchBar';
import { PROPERTY_TYPES } from '@/lib/constants';

export const metadata = {
  title: 'Home',
  description:
    'Browse verified flats, villas, independent houses, plots and commercial properties for sale and rent across India with SSP Enterprises.',
};

export const dynamic = 'force-dynamic';

async function getHomeData() {
  const [featured, recent, stats] = await Promise.all([
    prisma.property.findMany({
      where: { status: 'ACTIVE', isFeatured: true },
      include: { images: { take: 1, orderBy: { order: 'asc' } } },
      orderBy: { createdAt: 'desc' },
      take: 6,
    }),
    prisma.property.findMany({
      where: { status: 'ACTIVE' },
      include: { images: { take: 1, orderBy: { order: 'asc' } } },
      orderBy: { createdAt: 'desc' },
      take: 8,
    }),
    prisma.property.count({ where: { status: 'ACTIVE' } }),
  ]);
  return { featured, recent, stats };
}

const CATEGORY_ICONS = {
  FLAT: '🏢',
  VILLA: '🏡',
  INDEPENDENT_HOUSE: '🏠',
  PLOT: '📐',
  COMMERCIAL_SHOP: '🏬',
  COMMERCIAL_OFFICE: '🏢',
  FARM_HOUSE: '🌳',
  PENTHOUSE: '🏙️',
  STUDIO_APARTMENT: '🛏️',
  AGRICULTURAL_LAND: '🌾',
  WAREHOUSE: '🏭',
  ROW_HOUSE: '🏘️',
};

export default async function HomePage() {
  const { featured, recent, stats } = await getHomeData();
  const displayProperties = featured.length > 0 ? featured : recent.slice(0, 6);

  return (
    <>
      <VisitTracker />

      {/* Hero */}
      <section className="relative overflow-hidden bg-brand-gradient text-white">
        <div className="container-page py-16 sm:py-24">
          <div className="max-w-2xl">
            <h1 className="text-3xl font-extrabold leading-tight sm:text-5xl">
              Find Your Perfect Property Across India
            </h1>
            <p className="mt-4 text-base text-brand-100 sm:text-lg">
              SSP Enterprises connects you with verified flats, villas, houses, plots, and
              commercial spaces. {stats > 0 ? `${stats}+ active listings and counting.` : 'Your trusted real estate partner.'}
            </p>
          </div>
          <div className="mt-8">
            <HomeSearchBar />
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-12">
        <div className="container-page">
          <h2 className="section-title mb-6">Browse by Category</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
            {PROPERTY_TYPES.map((type) => (
              <Link
                key={type.value}
                href={`/properties?propertyType=${type.value}`}
                className="card flex flex-col items-center justify-center gap-2 px-3 py-6 text-center transition-colors hover:bg-brand-50"
              >
                <span className="text-3xl">{CATEGORY_ICONS[type.value] || '🏘️'}</span>
                <span className="text-xs font-medium text-slate-700">{type.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured / Recent */}
      <section className="bg-white py-12">
        <div className="container-page">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="section-title">
              {featured.length > 0 ? 'Featured Properties' : 'Recently Listed'}
            </h2>
            <Link href="/properties" className="text-sm font-semibold text-brand-700 hover:underline">
              View all →
            </Link>
          </div>
          {displayProperties.length === 0 ? (
            <p className="text-slate-500">
              No properties listed yet. Check back soon, or{' '}
              <Link href="/login" className="text-brand-700 underline">
                log in as an operator
              </Link>{' '}
              to add the first one.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {displayProperties.map((p) => (
                <PropertyCard key={p.id} property={p} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Why choose us */}
      <section className="py-16">
        <div className="container-page">
          <h2 className="section-title mb-10 text-center">Why Choose SSP Enterprises</h2>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-brand-100 text-2xl">
                ✅
              </div>
              <h3 className="mb-1 font-semibold text-slate-800">Verified Listings</h3>
              <p className="text-sm text-slate-500">
                Every property listed by our operators is reviewed for accuracy.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-brand-100 text-2xl">
                🤝
              </div>
              <h3 className="mb-1 font-semibold text-slate-800">Direct Connect</h3>
              <p className="text-sm text-slate-500">
                Register for free and connect directly with property owners and agents.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-brand-100 text-2xl">
                📍
              </div>
              <h3 className="mb-1 font-semibold text-slate-800">Pan-India Coverage</h3>
              <p className="text-sm text-slate-500">
                From metros to tier-2 cities, find properties wherever you're looking.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
