import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/serverAuth';
import cloudinary from '@/lib/cloudinary';

// Returns a signature so the browser can upload directly to Cloudinary
// without exposing the API secret.
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || !['ADMIN', 'OPERATOR'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const timestamp = Math.round(Date.now() / 1000);
    const folder = 'ssp-enterprises/properties';

    const signature = cloudinary.utils.api_sign_request(
      { timestamp, folder },
      process.env.CLOUDINARY_API_SECRET
    );

    return NextResponse.json({
      timestamp,
      signature,
      apiKey: process.env.CLOUDINARY_API_KEY,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      folder,
    });
  } catch (err) {
    console.error('GET /api/upload error', err);
    return NextResponse.json({ error: 'Failed to sign upload' }, { status: 500 });
  }
}

// Server-side direct upload (alternative path): accepts a base64 data URL
export async function POST(req) {
  try {
    const user = await getCurrentUser();
    if (!user || !['ADMIN', 'OPERATOR'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    if (!body.file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

    const result = await cloudinary.uploader.upload(body.file, {
      folder: 'ssp-enterprises/properties',
      resource_type: 'image',
    });

    return NextResponse.json({
      url: result.secure_url,
      publicId: result.public_id,
    });
  } catch (err) {
    console.error('POST /api/upload error', err);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
