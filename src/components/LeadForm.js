'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';

export default function LeadForm({ propertyId, isLoggedIn, userInfo }) {
  const [form, setForm] = useState({
    name: userInfo?.name || '',
    email: userInfo?.email || '',
    phone: '',
    message: "Hi, I'm interested in this property. Please share more details.",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!isLoggedIn) {
      window.location.href = `/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`;
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyId, ...form }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send enquiry');
      setSubmitted(true);
      toast.success('Enquiry sent! The lister will contact you soon.');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="card p-6 text-center">
        <p className="text-2xl">✅</p>
        <h3 className="mt-2 font-semibold text-slate-800">Enquiry Sent!</h3>
        <p className="mt-1 text-sm text-slate-500">
          Thanks for your interest. The lister will get back to you soon.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-3 p-6">
      <h3 className="font-semibold text-slate-800">Interested in this property?</h3>
      <div>
        <label className="label-text">Name</label>
        <input
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="input-field"
        />
      </div>
      <div>
        <label className="label-text">Email</label>
        <input
          required
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="input-field"
        />
      </div>
      <div>
        <label className="label-text">Phone</label>
        <input
          required
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          placeholder="10-digit mobile number"
          className="input-field"
        />
      </div>
      <div>
        <label className="label-text">Message</label>
        <textarea
          rows={3}
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          className="input-field"
        />
      </div>
      <button type="submit" disabled={submitting} className="btn-primary w-full">
        {submitting ? 'Sending...' : isLoggedIn ? 'Send Enquiry' : 'Login to Send Enquiry'}
      </button>
    </form>
  );
}
