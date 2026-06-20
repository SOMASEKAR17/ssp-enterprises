'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

export default function AdminOperatorsPage() {
  const [data, setData] = useState({ operators: [], invites: [] });
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/operators');
      const json = await res.json();
      if (res.ok) setData(json);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleInvite(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/operators', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to invite');
      toast.success(`Operator access granted to ${email}`);
      setEmail('');
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRevoke(operatorEmail) {
    if (!confirm(`Revoke operator access for ${operatorEmail}?`)) return;
    try {
      const res = await fetch(`/api/admin/operators?email=${encodeURIComponent(operatorEmail)}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to revoke access');
      toast.success('Access revoked');
      load();
    } catch (err) {
      toast.error(err.message);
    }
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-brand-800">Manage Operators</h1>

      <div className="card mb-8 p-5">
        <h2 className="mb-3 font-semibold text-slate-800">Invite a New Operator</h2>
        <p className="mb-4 text-sm text-slate-500">
          Add an email address to grant operator access. They can sign in with Google or register
          with this email to get access to <code className="rounded bg-slate-100 px-1">/operator</code>.
        </p>
        <form onSubmit={handleInvite} className="flex flex-col gap-3 sm:flex-row">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="operator@example.com"
            className="input-field flex-1"
          />
          <button type="submit" disabled={submitting} className="btn-primary">
            {submitting ? 'Adding...' : 'Grant Access'}
          </button>
        </form>
      </div>

      <div className="card p-5">
        <h2 className="mb-3 font-semibold text-slate-800">Current Operators</h2>
        {loading ? (
          <p className="text-sm text-slate-400">Loading...</p>
        ) : data.operators.length === 0 ? (
          <p className="text-sm text-slate-400">No operators yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase text-slate-500">
                  <th className="py-2">Name</th>
                  <th className="py-2">Email</th>
                  <th className="py-2">Listings</th>
                  <th className="py-2">Joined</th>
                  <th className="py-2"></th>
                </tr>
              </thead>
              <tbody>
                {data.operators.map((op) => (
                  <tr key={op.id} className="border-b border-slate-100">
                    <td className="py-2">{op.name || '—'}</td>
                    <td className="py-2">{op.email}</td>
                    <td className="py-2">{op._count.properties}</td>
                    <td className="py-2">{new Date(op.createdAt).toLocaleDateString('en-IN')}</td>
                    <td className="py-2 text-right">
                      <button
                        onClick={() => handleRevoke(op.email)}
                        className="text-xs font-medium text-red-600 hover:underline"
                      >
                        Revoke
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="card mt-8 p-5">
        <h2 className="mb-3 font-semibold text-slate-800">Pending Invites (not yet registered)</h2>
        {data.invites.filter((i) => !i.accepted).length === 0 ? (
          <p className="text-sm text-slate-400">No pending invites.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {data.invites.filter((i) => !i.accepted).map((inv) => (
              <li key={inv.id} className="flex items-center justify-between border-b border-slate-100 py-2">
                <span>{inv.email}</span>
                <button onClick={() => handleRevoke(inv.email)} className="text-xs font-medium text-red-600 hover:underline">
                  Cancel Invite
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
