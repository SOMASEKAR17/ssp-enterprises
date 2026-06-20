/* eslint-disable no-console */
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const slugify = require('slugify');

const prisma = new PrismaClient();

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'somasekarnaidu79@gmail.com').toLowerCase();

const SAMPLE_IMAGE = '/placeholder-property.jpg';

const sampleProperties = [
  {
    title: 'Spacious 3BHK Flat in Whitefield',
    description:
      'A beautifully designed 3BHK apartment located in the heart of Whitefield, close to IT parks, schools, and hospitals. Comes with modular kitchen and ample parking.',
    propertyType: 'FLAT',
    listingType: 'SALE',
    price: 8500000,
    areaSqft: 1450,
    bedrooms: 3,
    bathrooms: 3,
    balconies: 2,
    floorNumber: 5,
    totalFloors: 12,
    furnishStatus: 'SEMI_FURNISHED',
    facing: 'East',
    addressLine: '12th Cross, ITPL Main Road',
    locality: 'Whitefield',
    city: 'Bangalore',
    state: 'Karnataka',
    pincode: '560066',
    amenities: ['Lift / Elevator', 'Power Backup', 'Car Parking', '24x7 Security', 'Swimming Pool', 'Gymnasium'],
  },
  {
    title: 'Luxury Villa with Private Garden',
    description:
      'An exquisite 4BHK villa set in a gated community, featuring a private garden, modern interiors, and premium fittings throughout.',
    propertyType: 'VILLA',
    listingType: 'SALE',
    price: 25000000,
    areaSqft: 3200,
    bedrooms: 4,
    bathrooms: 5,
    balconies: 3,
    furnishStatus: 'FURNISHED',
    facing: 'North',
    addressLine: 'Golden Enclave, Sector 49',
    locality: 'Sector 49',
    city: 'Gurgaon',
    state: 'Haryana',
    pincode: '122018',
    amenities: ['Gated Community', 'Car Parking', '24x7 Security', 'Club House', "Children's Play Area", 'Garden / Park'],
  },
  {
    title: '2BHK Independent House for Rent',
    description:
      'Well-maintained independent house with a small front yard, ideal for a small family. Close to local markets and schools.',
    propertyType: 'INDEPENDENT_HOUSE',
    listingType: 'RENT',
    price: 22000,
    areaSqft: 1100,
    bedrooms: 2,
    bathrooms: 2,
    furnishStatus: 'UNFURNISHED',
    addressLine: '45 Lake View Road',
    locality: 'Kothapet',
    city: 'Hyderabad',
    state: 'Telangana',
    pincode: '500035',
    amenities: ['Car Parking', 'Water Storage'],
  },
  {
    title: 'Residential Plot Near Outer Ring Road',
    description:
      'DTCP approved residential plot, ready for construction. Excellent connectivity to the outer ring road and upcoming metro line.',
    propertyType: 'PLOT',
    listingType: 'SALE',
    price: 4500000,
    areaSqft: 2400,
    addressLine: 'Survey No 134, Beside ORR',
    locality: 'Kompally',
    city: 'Hyderabad',
    state: 'Telangana',
    pincode: '500014',
    amenities: ['Vastu Compliant'],
  },
  {
    title: 'Commercial Shop in Prime Market Area',
    description:
      'Ground floor commercial shop space with high footfall, ideal for retail business. Located in a busy commercial complex.',
    propertyType: 'COMMERCIAL_SHOP',
    listingType: 'LEASE',
    price: 60000,
    areaSqft: 600,
    addressLine: 'MG Road Commercial Complex',
    locality: 'MG Road',
    city: 'Pune',
    state: 'Maharashtra',
    pincode: '411001',
    amenities: ['Power Backup', 'Fire Safety', 'CCTV Surveillance'],
  },
  {
    title: 'Premium 4BHK Penthouse with City View',
    description:
      'Stunning penthouse with panoramic city views, private terrace, and top-of-the-line finishes. A rare find in the city center.',
    propertyType: 'PENTHOUSE',
    listingType: 'SALE',
    price: 45000000,
    areaSqft: 4200,
    bedrooms: 4,
    bathrooms: 5,
    balconies: 2,
    furnishStatus: 'FURNISHED',
    facing: 'South',
    addressLine: 'Skyline Towers, Marine Drive',
    locality: 'Marine Lines',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400002',
    amenities: ['Lift / Elevator', 'Swimming Pool', 'Gymnasium', '24x7 Security', 'Club House'],
    isFeatured: true,
  },
  {
    title: 'Cozy Studio Apartment Near Tech Park',
    description: 'Compact and efficient studio apartment, perfect for working professionals. Walking distance to major tech parks.',
    propertyType: 'STUDIO_APARTMENT',
    listingType: 'RENT',
    price: 15000,
    areaSqft: 450,
    bedrooms: 1,
    bathrooms: 1,
    furnishStatus: 'FURNISHED',
    addressLine: 'Hitech City Road',
    locality: 'Hitech City',
    city: 'Hyderabad',
    state: 'Telangana',
    pincode: '500081',
    amenities: ['Lift / Elevator', 'Wi-Fi / Internet', 'Power Backup'],
  },
  {
    title: 'Agricultural Land for Sale - 5 Acres',
    description: 'Fertile agricultural land with bore well and electricity connection, suitable for farming or future investment.',
    propertyType: 'AGRICULTURAL_LAND',
    listingType: 'SALE',
    price: 12000000,
    areaSqft: 217800,
    addressLine: 'Village Road, Near Canal',
    locality: 'Devanahalli',
    city: 'Bangalore',
    state: 'Karnataka',
    pincode: '562110',
    amenities: ['Water Storage'],
  },
  {
    title: 'Row House in Gated Community',
    description: '3BHK row house in a peaceful gated community with clubhouse access and dedicated parking.',
    propertyType: 'ROW_HOUSE',
    listingType: 'SALE',
    price: 9800000,
    areaSqft: 1800,
    bedrooms: 3,
    bathrooms: 3,
    furnishStatus: 'SEMI_FURNISHED',
    addressLine: 'Green Valley Township',
    locality: 'Wagholi',
    city: 'Pune',
    state: 'Maharashtra',
    pincode: '412207',
    amenities: ['Gated Community', 'Club House', 'Garden / Park', 'Car Parking'],
    isFeatured: true,
  },
  {
    title: 'Warehouse Space for Lease',
    description: 'Large warehouse with high ceiling, loading dock, and easy highway access. Ideal for logistics and storage businesses.',
    propertyType: 'WAREHOUSE',
    listingType: 'LEASE',
    price: 180000,
    areaSqft: 12000,
    addressLine: 'Industrial Area Phase 2',
    locality: 'Bhiwandi',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '421302',
    amenities: ['Power Backup', 'Fire Safety', '24x7 Security'],
  },
];

async function main() {
  console.log('Seeding database...');

  // Create admin user
  const adminPassword = await bcrypt.hash('Admin@12345', 10);
  const admin = await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: { role: 'ADMIN', isActive: true },
    create: {
      name: 'SSP Admin',
      email: ADMIN_EMAIL,
      password: adminPassword,
      role: 'ADMIN',
      phone: '9999999999',
    },
  });
  console.log(`Admin user ready: ${admin.email} (default password: Admin@12345 if newly created)`);

  // Create a demo operator
  const operatorPassword = await bcrypt.hash('Operator@123', 10);
  const operator = await prisma.user.upsert({
    where: { email: 'operator@sspenterprises.in' },
    update: {},
    create: {
      name: 'Demo Operator',
      email: 'operator@sspenterprises.in',
      password: operatorPassword,
      role: 'OPERATOR',
      phone: '9888888888',
    },
  });
  await prisma.operatorInvite.upsert({
    where: { email: operator.email },
    update: {},
    create: { email: operator.email, invitedBy: admin.email, accepted: true },
  });
  console.log(`Demo operator ready: ${operator.email} (password: Operator@123)`);

  // Seed properties
  for (const prop of sampleProperties) {
    const slug = slugify(`${prop.title}-${prop.city}-${Math.random().toString(36).slice(2, 8)}`, {
      lower: true,
      strict: true,
    });

    await prisma.property.create({
      data: {
        slug,
        title: prop.title,
        description: prop.description,
        propertyType: prop.propertyType,
        listingType: prop.listingType,
        status: 'ACTIVE',
        price: prop.price,
        areaSqft: prop.areaSqft,
        bedrooms: prop.bedrooms || null,
        bathrooms: prop.bathrooms || null,
        balconies: prop.balconies || null,
        floorNumber: prop.floorNumber ?? null,
        totalFloors: prop.totalFloors || null,
        furnishStatus: prop.furnishStatus || null,
        facing: prop.facing || null,
        addressLine: prop.addressLine,
        locality: prop.locality,
        city: prop.city,
        state: prop.state,
        pincode: prop.pincode,
        amenities: prop.amenities || [],
        contactName: 'SSP Enterprises',
        contactPhone: '9999999999',
        contactEmail: 'info@sspenterprises.in',
        isFeatured: !!prop.isFeatured,
        listedById: operator.id,
        images: {
          create: [{ url: SAMPLE_IMAGE, publicId: 'placeholder', order: 0 }],
        },
      },
    });
  }

  console.log(`Seeded ${sampleProperties.length} sample properties.`);
  console.log('Done!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
