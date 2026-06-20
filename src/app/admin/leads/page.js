'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/leads')
      .then((r) => r.json())
      .then((d) => setLeads(d.leads || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-brand-800">All Leads</h1>

      {loading ? (
        <p className="text-sm text-slate-400">Loading...</p>
      ) : leads.length === 0 ? (
        <div className="card p-8 text-center text-slate-500">No leads yet.</div>
      ) : (
        <div className="card overflow-x-auto p-2">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase text-slate-500">
                <th className="p-3">Name</th>
                <th className="p-3">Contact</th>
                <th className="p-3">Property</th>
                <th className="p-3">Message</th>
                <th className="p-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((l) => (
                <tr key={l.id} className="border-b border-slate-100">
                  <td className="p-3 font-medium text-slate-800">{l.name}</td>
                  <td className="p-3 text-slate-600">{l.phone}<br /><span className="text-xs">{l.email}</span></td>
                  <td className="p-3">
                    <Link href={`/properties/${l.property.slug}`} className="text-brand-700 hover:underline">
                      {l.property.title}
                    </Link>
                    <p className="text-xs text-slate-500">{l.property.city}</p>
                  </td>
                  <td className="max-w-xs p-3 text-xs text-slate-500">{l.message || '—'}</td>
                  <td className="p-3 text-xs text-slate-500">{new Date(l.createdAt).toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
