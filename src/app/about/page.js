export const metadata = {
  title: 'About Us',
  description:
    'Learn about SSP Enterprises, a real estate development and services company helping people find flats, villas, houses, plots, and commercial properties across India.',
};

export default function AboutPage() {
  return (
    <div className="container-page py-12">
      <h1 className="section-title mb-6">About SSP Enterprises</h1>
      <div className="max-w-3xl space-y-4 text-slate-600">
        <p>
          SSP Enterprises is a real estate development and services company committed to
          connecting buyers, tenants, and property owners across India. Our platform brings
          together verified listings for flats, villas, independent houses, plots, farm houses,
          and commercial spaces — all in one place.
        </p>
        <p>
          Whether you&apos;re looking to buy your first home, rent an apartment, lease a
          commercial space, or invest in land, our network of operators and agents work to bring
          you accurate, up-to-date listings with direct contact to property owners and managers.
        </p>
        <p>
          We believe in transparency and trust. That&apos;s why every listing on our platform
          goes through our operator network, and registered users get full access to property
          details, pricing, and direct contact information.
        </p>
      </div>
    </div>
  );
}
