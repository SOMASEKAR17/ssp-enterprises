import { NextResponse } from 'next/server';
import { recordSiteVisit, recordPropertyView } from '@/lib/tracking';

export async function POST(req) {
  try {
    const body = await req.json();
    const { type, path, propertyId } = body;

    if (type === 'property' && propertyId) {
      await recordPropertyView(req, propertyId);
    } else if (type === 'site' && path) {
      await recordSiteVisit(req, path);
    } else {
      return NextResponse.json({ error: 'Invalid tracking payload' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('POST /api/track error', err);
    return NextResponse.json({ error: 'Tracking failed' }, { status: 500 });
  }
}
