import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireRole } from '@/lib/serverAuth';
import { z } from 'zod';

const inviteSchema = z.object({
  email: z.string().email(),
});

export async function GET() {
  const { error, status, user } = await requireRole(['ADMIN']);
  if (error) return NextResponse.json({ error }, { status });

  const [operators, invites] = await Promise.all([
    prisma.user.findMany({
      where: { role: 'OPERATOR' },
      select: {
        id: true, name: true, email: true, phone: true, isActive: true, createdAt: true,
        _count: { select: { properties: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.operatorInvite.findMany({ orderBy: { createdAt: 'desc' } }),
  ]);

  return NextResponse.json({ operators, invites, currentAdmin: user.email });
}

export async function POST(req) {
  const { error, status, user } = await requireRole(['ADMIN']);
  if (error) return NextResponse.json({ error }, { status });

  try {
    const body = await req.json();
    const parsed = inviteSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }
    const email = parsed.data.email.toLowerCase().trim();

    if (email === (process.env.ADMIN_EMAIL || '').toLowerCase().trim()) {
      return NextResponse.json({ error: 'This email is already the admin.' }, { status: 400 });
    }

    // If a user already exists with this email, promote them directly to OPERATOR
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      await prisma.user.update({ where: { email }, data: { role: 'OPERATOR' } });
    }

    const invite = await prisma.operatorInvite.upsert({
      where: { email },
      update: { invitedBy: user.email },
      create: { email, invitedBy: user.email, accepted: !!existingUser },
    });

    return NextResponse.json({ invite }, { status: 201 });
  } catch (err) {
    console.error('POST /api/admin/operators error', err);
    return NextResponse.json({ error: 'Failed to invite operator' }, { status: 500 });
  }
}

export async function DELETE(req) {
  const { error, status } = await requireRole(['ADMIN']);
  if (error) return NextResponse.json({ error }, { status });

  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');
    if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 });

    await prisma.operatorInvite.deleteMany({ where: { email } });

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser && existingUser.role === 'OPERATOR') {
      await prisma.user.update({ where: { email }, data: { role: 'CUSTOMER' } });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('DELETE /api/admin/operators error', err);
    return NextResponse.json({ error: 'Failed to revoke operator access' }, { status: 500 });
  }
}
