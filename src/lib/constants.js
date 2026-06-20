export const PROPERTY_TYPES = [
  { value: 'FLAT', label: 'Flat / Apartment' },
  { value: 'VILLA', label: 'Villa' },
  { value: 'INDEPENDENT_HOUSE', label: 'Independent House' },
  { value: 'PLOT', label: 'Plot / Land' },
  { value: 'COMMERCIAL_SHOP', label: 'Commercial Shop' },
  { value: 'COMMERCIAL_OFFICE', label: 'Commercial Office Space' },
  { value: 'FARM_HOUSE', label: 'Farm House' },
  { value: 'PENTHOUSE', label: 'Penthouse' },
  { value: 'STUDIO_APARTMENT', label: 'Studio Apartment' },
  { value: 'AGRICULTURAL_LAND', label: 'Agricultural Land' },
  { value: 'WAREHOUSE', label: 'Warehouse / Godown' },
  { value: 'ROW_HOUSE', label: 'Row House' },
];

export const LISTING_TYPES = [
  { value: 'SALE', label: 'For Sale' },
  { value: 'RENT', label: 'For Rent' },
  { value: 'LEASE', label: 'For Lease' },
];

export const FURNISH_STATUS = [
  { value: 'FURNISHED', label: 'Furnished' },
  { value: 'SEMI_FURNISHED', label: 'Semi-Furnished' },
  { value: 'UNFURNISHED', label: 'Unfurnished' },
];

export const PROPERTY_STATUS = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'SOLD', label: 'Sold' },
  { value: 'RENTED', label: 'Rented' },
  { value: 'INACTIVE', label: 'Inactive' },
  { value: 'PENDING_APPROVAL', label: 'Pending Approval' },
];

export const FACING_OPTIONS = [
  'North', 'South', 'East', 'West',
  'North-East', 'North-West', 'South-East', 'South-West',
];

export const COMMON_AMENITIES = [
  'Lift / Elevator',
  'Power Backup',
  'Car Parking',
  '24x7 Security',
  'Swimming Pool',
  'Gymnasium',
  'Club House',
  'Children\'s Play Area',
  'Garden / Park',
  'CCTV Surveillance',
  'Rain Water Harvesting',
  'Vastu Compliant',
  'Gated Community',
  'Intercom Facility',
  'Servant Quarters',
  'Modular Kitchen',
  'Piped Gas',
  'Water Storage',
  'Fire Safety',
  'Wi-Fi / Internet',
];

export const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Puducherry', 'Chandigarh',
];

export function propertyTypeLabel(value) {
  return PROPERTY_TYPES.find((p) => p.value === value)?.label || value;
}

export function listingTypeLabel(value) {
  return LISTING_TYPES.find((p) => p.value === value)?.label || value;
}

export function formatINR(amount) {
  if (amount == null) return '';
  const num = Number(amount);
  if (num >= 10000000) return `₹${(num / 10000000).toFixed(2).replace(/\.00$/, '')} Cr`;
  if (num >= 100000) return `₹${(num / 100000).toFixed(2).replace(/\.00$/, '')} Lakh`;
  return `₹${num.toLocaleString('en-IN')}`;
}
