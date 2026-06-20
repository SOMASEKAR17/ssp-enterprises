'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminSidebar({ basePath, title, role }) {
  const pathname = usePathname();

  const links = [
    { href: `${basePath}`, label: 'Dashboard', exact: true },
    { href: `${basePath}/properties`, label: 'Properties' },
    { href: `${basePath}/properties/new`, label: '+ Add Property' },
    { href: `${basePath}/leads`, label: 'Leads' },
  ];

  if (role === 'ADMIN') {
    links.splice(3, 0, { href: `${basePath}/operators`, label: 'Operators' });
  }

  function isActive(link) {
    if (link.exact) return pathname === link.href;
    return pathname.startsWith(link.href);
  }

  return (
    <aside className="w-full flex-shrink-0 lg:w-56">
      <div className="card p-4">
        <h2 className="mb-4 px-2 text-sm font-bold uppercase tracking-wide text-brand-700">{title}</h2>
        <nav className="flex flex-row gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium ${
                isActive(link)
                  ? 'bg-brand-600 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  );
}
