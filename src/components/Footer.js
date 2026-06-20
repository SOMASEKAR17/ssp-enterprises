import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-brand-900 text-slate-200">
      <div className="container-page grid grid-cols-1 gap-10 py-12 md:grid-cols-4">
        <div>
          <Image
            src="/logo-white.png"
            alt="SSP Enterprises"
            width={160}
            height={56}
            className="h-12 w-auto mb-4"
          />
          <p className="text-sm text-slate-400">
            Real Estate Development &amp; Services. Helping you find the right flat, villa, house,
            plot, or commercial space across India.
          </p>
        </div>
        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-white">Explore</h3>
          <ul className="space-y-2 text-sm text-slate-400">
            <li><Link href="/properties" className="hover:text-white">All Properties</Link></li>
            <li><Link href="/properties?listingType=SALE" className="hover:text-white">Buy</Link></li>
            <li><Link href="/properties?listingType=RENT" className="hover:text-white">Rent</Link></li>
            <li><Link href="/properties?propertyType=PLOT" className="hover:text-white">Plots &amp; Land</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-white">Company</h3>
          <ul className="space-y-2 text-sm text-slate-400">
            <li><Link href="/about" className="hover:text-white">About Us</Link></li>
            <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
            <li><Link href="/register" className="hover:text-white">Create Account</Link></li>
            <li><Link href="/login" className="hover:text-white">Login</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-white">Contact</h3>
          <ul className="space-y-2 text-sm text-slate-400">
            <li>India</li>
            <li>info@sspenterprises.in</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-brand-800 py-4 text-center text-xs text-slate-500">
        © {year} SSP Enterprises. All rights reserved.
      </div>
    </footer>
  );
}
