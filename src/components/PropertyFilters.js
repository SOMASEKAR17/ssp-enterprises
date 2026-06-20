'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { PROPERTY_TYPES, LISTING_TYPES } from '@/lib/constants';

export default function PropertyFilters({ searchParams }) {
  const router = useRouter();
  const [form, setForm] = useState({
    q: searchParams.q || '',
    city: searchParams.city || '',
    propertyType: searchParams.propertyType || '',
    listingType: searchParams.listingType || '',
    bedrooms: searchParams.bedrooms || '',
    minPrice: searchParams.minPrice || '',
    maxPrice: searchParams.maxPrice || '',
  });

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function applyFilters(e) {
    e.preventDefault();
    const params = new URLSearchParams();
    Object.entries(form).forEach(([k, v]) => {
      if (v) params.set(k, v);
    });
    router.push(`/properties?${params.toString()}`);
  }

  function clearFilters() {
    router.push('/properties');
  }

  return (
    <form onSubmit={applyFilters} className="card sticky top-20 space-y-4 p-5">
      <h2 className="text-sm font-bold uppercase tracking-wide text-slate-700">Filters</h2>

      <div>
        <label className="label-text">Keyword</label>
        <input
          type="text"
          value={form.q}
          onChange={(e) => update('q', e.target.value)}
          placeholder="Title, locality..."
          className="input-field"
        />
      </div>

      <div>
        <label className="label-text">City</label>
        <input
          type="text"
          value={form.city}
          onChange={(e) => update('city', e.target.value)}
          placeholder="e.g. Pune"
          className="input-field"
        />
      </div>

      <div>
        <label className="label-text">Property Type</label>
        <select value={form.propertyType} onChange={(e) => update('propertyType', e.target.value)} className="input-field">
          <option value="">Any</option>
          {PROPERTY_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="label-text">Listing Type</label>
        <select value={form.listingType} onChange={(e) => update('listingType', e.target.value)} className="input-field">
          <option value="">Any</option>
          {LISTING_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="label-text">Bedrooms (BHK)</label>
        <select value={form.bedrooms} onChange={(e) => update('bedrooms', e.target.value)} className="input-field">
          <option value="">Any</option>
          {[1, 2, 3, 4, 5].map((n) => (
            <option key={n} value={n}>{n} BHK</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="label-text">Min Price</label>
          <input
            type="number"
            value={form.minPrice}
            onChange={(e) => update('minPrice', e.target.value)}
            placeholder="₹"
            className="input-field"
          />
        </div>
        <div>
          <label className="label-text">Max Price</label>
          <input
            type="number"
            value={form.maxPrice}
            onChange={(e) => update('maxPrice', e.target.value)}
            placeholder="₹"
            className="input-field"
          />
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <button type="submit" className="btn-primary flex-1">Apply</button>
        <button type="button" onClick={clearFilters} className="btn-outline flex-1">Clear</button>
      </div>
    </form>
  );
}
