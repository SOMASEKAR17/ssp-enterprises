export const metadata = {
  title: 'Contact Us',
  description:
    'Get in touch with SSP Enterprises for real estate enquiries, property listings, or partnership opportunities across India.',
};

export default function ContactPage() {
  return (
    <div className="container-page py-12">
      <h1 className="section-title mb-6">Contact Us</h1>
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
        <div className="card p-6">
          <h2 className="mb-4 font-semibold text-slate-800">Get in Touch</h2>
          <ul className="space-y-3 text-sm text-slate-600">
            <li><span className="font-medium text-slate-800">Email:</span> info@sspenterprises.in</li>
            <li><span className="font-medium text-slate-800">Service Area:</span> Pan-India</li>
          </ul>
        </div>
        <div className="card p-6">
          <h2 className="mb-4 font-semibold text-slate-800">List Your Property</h2>
          <p className="text-sm text-slate-600">
            Are you a property owner or agent? Reach out to us to become a verified operator on
            our platform and start listing your properties to thousands of potential buyers and
            tenants across India.
          </p>
        </div>
      </div>
    </div>
  );
}
