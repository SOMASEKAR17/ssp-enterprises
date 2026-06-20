'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';
import Image from 'next/image';
import {
  PROPERTY_TYPES, LISTING_TYPES, FURNISH_STATUS, PROPERTY_STATUS,
  FACING_OPTIONS, COMMON_AMENITIES, INDIAN_STATES,
} from '@/lib/constants';

const emptyForm = {
  title: '', description: '', propertyType: 'FLAT', listingType: 'SALE', status: 'ACTIVE',
  price: '', isNegotiable: false, areaSqft: '', carpetAreaSqft: '',
  bedrooms: '', bathrooms: '', balconies: '', floorNumber: '', totalFloors: '',
  furnishStatus: '', ageOfPropertyYears: '', facing: '',
  addressLine: '', locality: '', city: '', state: '', pincode: '',
  amenities: [], contactName: '', contactPhone: '', contactEmail: '', isFeatured: false,
};

function draftKey(userId, propertyId) {
  // Scoped per logged-in user and per draft target (new listing, or a
  // specific property being edited) so drafts never leak across accounts
  // on a shared/public browser, and editing two different properties
  // doesn't collide.
  return `ssp-property-draft:${userId || 'anon'}:${propertyId || 'new'}`;
}

export default function PropertyForm({ initialData, propertyId, basePath, isAdmin }) {
  const router = useRouter();
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const storageKey = draftKey(userId, propertyId);

  const [form, setForm] = useState(initialData || emptyForm);
  const [images, setImages] = useState(
    initialData?.images?.map((i) => ({ url: i.url, publicId: i.publicId })) || []
  );
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const hydrated = useRef(false);

  // On mount, offer to restore an unsaved draft for this exact form
  // (same user + same "new" or "editing this property" target) if one
  // exists from a previous session that was never submitted or cleared.
  useEffect(() => {
    if (hydrated.current || !userId) return;
    hydrated.current = true;

    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return;
      const draft = JSON.parse(raw);
      if (!draft || !draft.form) return;

      const hasContent = Object.values(draft.form).some((v) =>
        Array.isArray(v) ? v.length > 0 : !!v
      );
      if (!hasContent && (!draft.images || draft.images.length === 0)) return;

      const restore = window.confirm(
        'You have an unsaved draft for this listing form. Restore it? (Cancel will discard the draft and start fresh.)'
      );
      if (restore) {
        setForm(draft.form);
        setImages(draft.images || []);
        toast.success('Draft restored');
      } else {
        localStorage.removeItem(storageKey);
      }
    } catch {
      localStorage.removeItem(storageKey);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, storageKey]);

  // Persist on every change (debounced) so a refresh/crash/accidental
  // navigation doesn't lose in-progress work, including already-uploaded
  // image references.
  useEffect(() => {
    if (!userId || !hydrated.current) return;
    const timeout = setTimeout(() => {
      try {
        localStorage.setItem(storageKey, JSON.stringify({ form, images, savedAt: Date.now() }));
      } catch {
        // localStorage full or unavailable — fail silently, not critical
      }
    }, 400);
    return () => clearTimeout(timeout);
  }, [form, images, userId, storageKey]);

  function clearDraft() {
    try {
      localStorage.removeItem(storageKey);
    } catch {
      // ignore
    }
  }

  function handleClearForm() {
    if (!window.confirm('Clear all entered data for this form? This cannot be undone.')) return;
    setForm(initialData || emptyForm);
    setImages(initialData?.images?.map((i) => ({ url: i.url, publicId: i.publicId })) || []);
    clearDraft();
    toast.success('Form cleared');
  }

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function toggleAmenity(amenity) {
    setForm((f) => ({
      ...f,
      amenities: f.amenities.includes(amenity)
        ? f.amenities.filter((a) => a !== amenity)
        : [...f.amenities, amenity],
    }));
  }

  async function handleImageUpload(e) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setUploading(true);
    try {
      const sigRes = await fetch('/api/upload');
      const sig = await sigRes.json();
      if (!sigRes.ok) throw new Error(sig.error || 'Failed to get upload signature');

      const uploaded = [];
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('api_key', sig.apiKey);
        formData.append('timestamp', sig.timestamp);
        formData.append('signature', sig.signature);
        formData.append('folder', sig.folder);

        const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`, {
          method: 'POST',
          body: formData,
        });
        const uploadData = await uploadRes.json();
        if (uploadData.secure_url) {
          uploaded.push({ url: uploadData.secure_url, publicId: uploadData.public_id });
        }
      }
      setImages((prev) => [...prev, ...uploaded]);
      toast.success(`${uploaded.length} image(s) uploaded`);
    } catch (err) {
      toast.error(err.message || 'Image upload failed');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  function removeImage(publicId) {
    setImages((prev) => prev.filter((i) => i.publicId !== publicId));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (images.length === 0) {
      toast.error('Please upload at least one image');
      return;
    }
    setSaving(true);
    try {
      const payload = { ...form, images };
      const url = propertyId ? `/api/properties/${propertyId}` : '/api/properties';
      const method = propertyId ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save property');

      toast.success(propertyId ? 'Property updated' : 'Property listed successfully');
      clearDraft();
      router.push(`${basePath}/properties`);
      router.refresh();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Info */}
      <div className="card space-y-4 p-5">
        <h2 className="font-semibold text-slate-800">Basic Information</h2>
        <div>
          <label className="label-text">Title</label>
          <input required value={form.title} onChange={(e) => update('title', e.target.value)} className="input-field" placeholder="e.g. Spacious 3BHK Flat in Whitefield" />
        </div>
        <div>
          <label className="label-text">Description</label>
          <textarea required rows={5} value={form.description} onChange={(e) => update('description', e.target.value)} className="input-field" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="label-text">Property Type</label>
            <select value={form.propertyType} onChange={(e) => update('propertyType', e.target.value)} className="input-field">
              {PROPERTY_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <label className="label-text">Listing Type</label>
            <select value={form.listingType} onChange={(e) => update('listingType', e.target.value)} className="input-field">
              {LISTING_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <label className="label-text">Status</label>
            <select value={form.status} onChange={(e) => update('status', e.target.value)} className="input-field">
              {PROPERTY_STATUS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Pricing & Area */}
      <div className="card space-y-4 p-5">
        <h2 className="font-semibold text-slate-800">Pricing &amp; Area</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="label-text">Price (₹)</label>
            <input required type="number" min="0" value={form.price} onChange={(e) => update('price', e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="label-text">Area (sqft)</label>
            <input required type="number" min="0" value={form.areaSqft} onChange={(e) => update('areaSqft', e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="label-text">Carpet Area (sqft)</label>
            <input type="number" min="0" value={form.carpetAreaSqft} onChange={(e) => update('carpetAreaSqft', e.target.value)} className="input-field" />
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" checked={form.isNegotiable} onChange={(e) => update('isNegotiable', e.target.checked)} />
          Price is negotiable
        </label>
        {isAdmin && (
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" checked={form.isFeatured} onChange={(e) => update('isFeatured', e.target.checked)} />
            Feature this property on homepage
          </label>
        )}
      </div>

      {/* Specs */}
      <div className="card space-y-4 p-5">
        <h2 className="font-semibold text-slate-800">Specifications</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <label className="label-text">Bedrooms</label>
            <input type="number" min="0" value={form.bedrooms} onChange={(e) => update('bedrooms', e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="label-text">Bathrooms</label>
            <input type="number" min="0" value={form.bathrooms} onChange={(e) => update('bathrooms', e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="label-text">Balconies</label>
            <input type="number" min="0" value={form.balconies} onChange={(e) => update('balconies', e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="label-text">Age (years)</label>
            <input type="number" min="0" value={form.ageOfPropertyYears} onChange={(e) => update('ageOfPropertyYears', e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="label-text">Floor No.</label>
            <input type="number" value={form.floorNumber} onChange={(e) => update('floorNumber', e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="label-text">Total Floors</label>
            <input type="number" value={form.totalFloors} onChange={(e) => update('totalFloors', e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="label-text">Furnishing</label>
            <select value={form.furnishStatus} onChange={(e) => update('furnishStatus', e.target.value)} className="input-field">
              <option value="">Select</option>
              {FURNISH_STATUS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <label className="label-text">Facing</label>
            <select value={form.facing} onChange={(e) => update('facing', e.target.value)} className="input-field">
              <option value="">Select</option>
              {FACING_OPTIONS.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Location */}
      <div className="card space-y-4 p-5">
        <h2 className="font-semibold text-slate-800">Location</h2>
        <div>
          <label className="label-text">Address Line</label>
          <input required value={form.addressLine} onChange={(e) => update('addressLine', e.target.value)} className="input-field" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="label-text">Locality / Area</label>
            <input required value={form.locality} onChange={(e) => update('locality', e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="label-text">City</label>
            <input required value={form.city} onChange={(e) => update('city', e.target.value)} className="input-field" />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="label-text">State</label>
            <select required value={form.state} onChange={(e) => update('state', e.target.value)} className="input-field">
              <option value="">Select State</option>
              {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="label-text">Pincode</label>
            <input required value={form.pincode} onChange={(e) => update('pincode', e.target.value)} className="input-field" />
          </div>
        </div>
      </div>

      {/* Amenities */}
      <div className="card space-y-3 p-5">
        <h2 className="font-semibold text-slate-800">Amenities</h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
          {COMMON_AMENITIES.map((a) => (
            <label key={a} className="flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" checked={form.amenities.includes(a)} onChange={() => toggleAmenity(a)} />
              {a}
            </label>
          ))}
        </div>
      </div>

      {/* Images */}
      <div className="card space-y-3 p-5">
        <h2 className="font-semibold text-slate-800">Photos</h2>
        <input type="file" accept="image/*" multiple onChange={handleImageUpload} disabled={uploading} className="text-sm" />
        {uploading && <p className="text-xs text-brand-600">Uploading...</p>}
        {images.length > 0 && (
          <div className="mt-2 grid grid-cols-3 gap-3 sm:grid-cols-5">
            {images.map((img) => (
              <div key={img.publicId} className="relative h-24 overflow-hidden rounded-md ring-1 ring-slate-200">
                <Image src={img.url} alt="Property" fill sizes="120px" className="object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(img.publicId)}
                  className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-xs text-white"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Contact */}
      <div className="card space-y-4 p-5">
        <h2 className="font-semibold text-slate-800">Contact Details (shown to logged-in users)</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="label-text">Contact Name</label>
            <input required value={form.contactName} onChange={(e) => update('contactName', e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="label-text">Contact Phone</label>
            <input required value={form.contactPhone} onChange={(e) => update('contactPhone', e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="label-text">Contact Email (optional)</label>
            <input type="email" value={form.contactEmail} onChange={(e) => update('contactEmail', e.target.value)} className="input-field" />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button type="button" onClick={handleClearForm} className="btn-outline !text-red-600 !ring-red-200 hover:!bg-red-50">
          Clear Form
        </button>
        <button type="button" onClick={() => router.back()} className="btn-outline">Cancel</button>
        <button type="submit" disabled={saving || uploading} className="btn-primary">
          {saving ? 'Saving...' : propertyId ? 'Update Property' : 'List Property'}
        </button>
      </div>
    </form>
  );
}