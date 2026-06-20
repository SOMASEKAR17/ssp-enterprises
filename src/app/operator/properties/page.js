'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { formatINR, propertyTypeLabel } from '@/lib/constants';

export default function OperatorPropertiesListPage() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch('/api/properties?limit=50&mine=true');
      const data = await res.json();
      setProperties(data.properties || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleDelete(id) {
    if (!confirm('Delete this property permanently? This cannot be undone.')) return;
    try {
      const res = await fetch(`/api/properties/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      toast.success('Property deleted');
      load();
    } catch (err) {
      toast.error(err.message);
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-brand-800">My Listings</h1>
        <Link href="/operator/properties/new" className="btn-primary">+ Add Property</Link>
      </div>

      {loading ? (
        <p className="text-sm text-slate-400">Loading...</p>
      ) : properties.length === 0 ? (
        <div className="card p-8 text-center text-slate-500">
          You haven&apos;t listed any properties yet.{' '}
          <Link href="/operator/properties/new" className="text-brand-700 hover:underline">List your first one</Link>.
        </div>
      ) : (
        <div className="space-y-3">
          {properties.map((p) => (
            <div key={p.id} className="card flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
              <div className="relative h-20 w-28 flex-shrink-0 overflow-hidden rounded-md bg-slate-100">
                <Image
                  src={p.images?.[0]?.url || '/placeholder-property.jpg'}
                  alt={p.title}
                  fill
                  sizes="120px"
                  className="object-cover"
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-slate-800">{p.title}</p>
                  <span className={`badge ${p.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                    {p.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500">{p.city}, {p.state} · {propertyTypeLabel(p.propertyType)}</p>
                <p className="text-sm font-medium text-brand-700">{formatINR(p.price)}</p>
              </div>
              <div className="flex gap-4 text-xs text-slate-500">
                <span>{p.viewCount} views</span>
                <span>{p._count?.leads ?? 0} leads</span>
              </div>
              <div className="flex gap-2">
                <Link href={`/operator/properties/${p.id}/edit`} className="btn-outline !px-3 !py-1.5 text-xs">Edit</Link>
                <button onClick={() => handleDelete(p.id)} className="btn-outline !px-3 !py-1.5 text-xs !text-red-600 !ring-red-200 hover:!bg-red-50">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
