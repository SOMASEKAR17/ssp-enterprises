import crypto from 'crypto';
import prisma from '@/lib/prisma';

const SALT = process.env.IP_HASH_SALT || 'default-salt';

export function hashIp(ip) {
  if (!ip) return null;
  return crypto.createHash('sha256').update(ip + SALT).digest('hex').slice(0, 32);
}

export function getClientIp(req) {
  const fwd = req.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  return req.headers.get('x-real-ip') || null;
}

export async function recordSiteVisit(req, path) {
  try {
    const ip = getClientIp(req);
    await prisma.siteVisit.create({
      data: {
        path,
        ipHash: hashIp(ip),
        userAgent: req.headers.get('user-agent') || null,
        referrer: req.headers.get('referer') || null,
      },
    });
  } catch (e) {
    // Don't break the request if tracking fails
    console.error('recordSiteVisit failed', e);
  }
}

export async function recordPropertyView(req, propertyId) {
  try {
    const ip = getClientIp(req);
    await prisma.$transaction([
      prisma.propertyView.create({
        data: {
          propertyId,
          ipHash: hashIp(ip),
          userAgent: req.headers.get('user-agent') || null,
          referrer: req.headers.get('referer') || null,
        },
      }),
      prisma.property.update({
        where: { id: propertyId },
        data: { viewCount: { increment: 1 } },
      }),
    ]);
  } catch (e) {
    console.error('recordPropertyView failed', e);
  }
}
