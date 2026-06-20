import Link from 'next/link';
import Image from 'next/image';
import { formatINR, propertyTypeLabel, listingTypeLabel } from '@/lib/constants';

export default function PropertyCard({ property }) {
  const image = property.images?.[0]?.url || '/placeholder-property.jpg';
  const isGated = property.gated;

  return (
    <Link
      href={`/properties/${property.slug}`}
      className="card group block overflow-hidden transition-shadow hover:shadow-card-hover"
    >
      <div className="relative h-52 w-full overflow-hidden bg-slate-100">
        <Image
          src={image}
          alt={property.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <span className="badge absolute left-3 top-3 bg-brand-700 text-white">
          {listingTypeLabel(property.listingType)}
        </span>
        {property.isFeatured && (
          <span className="badge absolute right-3 top-3 bg-amber-500 text-white">Featured</span>
        )}
      </div>
      <div className="p-4">
        {!isGated && (
          <p className="mb-1 text-lg font-bold text-brand-700">{formatINR(property.price)}</p>
        )}
        <h3 className="mb-1 line-clamp-2 text-sm font-semibold text-slate-800">
          {isGated ? `${propertyTypeLabel(property.propertyType)} in ${property.locality || property.city}` : property.title}
        </h3>
        <p className="mb-2 text-xs text-slate-500">
          {property.locality ? `${property.locality}, ` : ''}{property.city}, {property.state}
        </p>
        <div className="flex items-center gap-3 text-xs text-slate-600">
          <span>{property.areaSqft} sqft</span>
          {!isGated && property.bedrooms ? <span>• {property.bedrooms} BHK</span> : null}
          <span className="ml-auto rounded bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600">
            {propertyTypeLabel(property.propertyType)}
          </span>
        </div>
        {isGated && (
          <p className="mt-3 text-xs font-medium text-brand-600">Login to view price &amp; full details →</p>
        )}
      </div>
    </Link>
  );
}
