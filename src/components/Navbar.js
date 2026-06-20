'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';

export default function Navbar() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const user = session?.user;

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <nav className="container-page flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="SSP Enterprises Logo"
            width={140}
            height={48}
            priority
            className="h-10 w-auto"
          />
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          <Link href="/properties" className="text-sm font-medium text-slate-700 hover:text-brand-700">
            All Properties
          </Link>
          <Link href="/properties?listingType=SALE" className="text-sm font-medium text-slate-700 hover:text-brand-700">
            Buy
          </Link>
          <Link href="/properties?listingType=RENT" className="text-sm font-medium text-slate-700 hover:text-brand-700">
            Rent
          </Link>
          <Link href="/about" className="text-sm font-medium text-slate-700 hover:text-brand-700">
            About
          </Link>
          <Link href="/contact" className="text-sm font-medium text-slate-700 hover:text-brand-700">
            Contact
          </Link>

          {user?.role === 'ADMIN' && (
            <Link href="/admin" className="text-sm font-semibold text-brand-700 hover:text-brand-800">
              Admin Panel
            </Link>
          )}
          {user?.role === 'OPERATOR' && (
            <Link href="/operator" className="text-sm font-semibold text-brand-700 hover:text-brand-800">
              Operator Panel
            </Link>
          )}

          {status === 'loading' ? null : user ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-500">Hi, {user.name?.split(' ')[0] || 'there'}</span>
              <button onClick={() => signOut({ callbackUrl: '/' })} className="btn-outline !px-3 !py-1.5 text-xs">
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/login" className="btn-outline !px-4 !py-1.5 text-sm">
                Login
              </Link>
              <Link href="/register" className="btn-primary !px-4 !py-1.5 text-sm">
                Register
              </Link>
            </div>
          )}
        </div>

        <button
          className="md:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {open ? (
              <path d="M6 6l12 12M6 18L18 6" strokeLinecap="round" />
            ) : (
              <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
            )}
          </svg>
        </button>
      </nav>

      {open && (
        <div className="border-t border-slate-200 bg-white px-4 py-4 md:hidden">
          <div className="flex flex-col gap-3">
            <Link href="/properties" onClick={() => setOpen(false)} className="text-sm font-medium text-slate-700">
              All Properties
            </Link>
            <Link href="/properties?listingType=SALE" onClick={() => setOpen(false)} className="text-sm font-medium text-slate-700">
              Buy
            </Link>
            <Link href="/properties?listingType=RENT" onClick={() => setOpen(false)} className="text-sm font-medium text-slate-700">
              Rent
            </Link>
            <Link href="/about" onClick={() => setOpen(false)} className="text-sm font-medium text-slate-700">
              About
            </Link>
            <Link href="/contact" onClick={() => setOpen(false)} className="text-sm font-medium text-slate-700">
              Contact
            </Link>
            {user?.role === 'ADMIN' && (
              <Link href="/admin" onClick={() => setOpen(false)} className="text-sm font-semibold text-brand-700">
                Admin Panel
              </Link>
            )}
            {user?.role === 'OPERATOR' && (
              <Link href="/operator" onClick={() => setOpen(false)} className="text-sm font-semibold text-brand-700">
                Operator Panel
              </Link>
            )}
            {user ? (
              <button onClick={() => signOut({ callbackUrl: '/' })} className="btn-outline w-full">
                Sign Out
              </button>
            ) : (
              <div className="flex gap-3">
                <Link href="/login" onClick={() => setOpen(false)} className="btn-outline flex-1 text-center">
                  Login
                </Link>
                <Link href="/register" onClick={() => setOpen(false)} className="btn-primary flex-1 text-center">
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
