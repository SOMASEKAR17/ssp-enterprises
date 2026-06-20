'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PROPERTY_TYPES, LISTING_TYPES } from '@/lib/constants';

export default function HomeSearchBar() {
  const router = useRouter();
  const [city, setCity] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [listingType, setListingType] = useState('SALE');

  function handleSearch(e) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (city) params.set('city', city);
    if (propertyType) params.set('propertyType', propertyType);
    if (listingType) params.set('listingType', listingType);
    router.push(`/properties?${params.toString()}`);
  }

  return (
    <form
      onSubmit={handleSearch}
      className="flex flex-col gap-3 rounded-xl bg-white p-4 shadow-card-hover sm:flex-row sm:items-end"
    >
      <div className="flex-1">
        <label className="mb-1 block text-xs font-semibold text-slate-600">City / Locality</label>
        <input
          type="text"
          placeholder="e.g. Bangalore, Hyderabad..."
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="input-field"
        />
      </div>
      <div className="flex-1">
        <label className="mb-1 block text-xs font-semibold text-slate-600">Property Type</label>
        <select value={propertyType} onChange={(e) => setPropertyType(e.target.value)} className="input-field">
          <option value="">Any Type</option>
          {PROPERTY_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>
      <div className="flex-1">
        <label className="mb-1 block text-xs font-semibold text-slate-600">Looking to</label>
        <select value={listingType} onChange={(e) => setListingType(e.target.value)} className="input-field">
          {LISTING_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>
      <button type="submit" className="btn-primary h-[42px] sm:px-8">
        Search
      </button>
    </form>
  );
}
