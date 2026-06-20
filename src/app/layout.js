import { Inter } from 'next/font/google';
import './globals.css';
import Providers from '@/components/Providers';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'SSP Enterprises';

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteName} | Real Estate Development & Services in India`,
    template: `%s | ${siteName}`,
  },
  description:
    'SSP Enterprises is a trusted real estate platform in India offering flats, villas, independent houses, plots, and commercial properties for sale, rent, and lease. Find verified properties across India.',
  keywords: [
    'real estate India',
    'buy property India',
    'flats for sale',
    'villas for sale',
    'property for rent',
    'independent house',
    'plots for sale',
    'commercial property India',
    'SSP Enterprises',
    'real estate development',
  ],
  authors: [{ name: 'SSP Enterprises' }],
  creator: 'SSP Enterprises',
  publisher: 'SSP Enterprises',
  formatDetection: { email: false, address: false, telephone: false },
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: siteUrl,
    siteName,
    title: `${siteName} | Real Estate Development & Services in India`,
    description:
      'Discover verified flats, villas, houses, plots, and commercial properties for sale and rent across India.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: siteName }],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${siteName} | Real Estate Development & Services`,
    description: 'Verified residential and commercial properties for sale and rent across India.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({ children }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateAgent',
    name: siteName,
    url: siteUrl,
    description:
      'SSP Enterprises is a real estate development and services company offering residential and commercial properties across India.',
    areaServed: 'IN',
  };

  return (
    <html lang="en-IN" className={inter.variable}>
      <body className="flex min-h-screen flex-col font-sans">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Providers>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
