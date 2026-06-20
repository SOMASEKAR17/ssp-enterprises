import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || '').toLowerCase().trim();

const schema = z.object({
  name: z.string().min(2, 'Name is too short').max(100),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Enter a valid phone number').max(15),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export async function POST(req) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || 'Invalid input' },
        { status: 400 }
      );
    }

    const { name, phone, password } = parsed.data;
    const email = parsed.data.email.toLowerCase().trim();

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let role = 'CUSTOMER';
    if (email === ADMIN_EMAIL) {
      role = 'ADMIN';
    } else {
      const invite = await prisma.operatorInvite.findUnique({ where: { email } });
      if (invite) role = 'OPERATOR';
    }

    const user = await prisma.user.create({
      data: { name, email, phone, password: hashedPassword, role },
    });

    return NextResponse.json(
      { success: true, user: { id: user.id, email: user.email, role: user.role } },
      { status: 201 }
    );
  } catch (err) {
    console.error('POST /api/register error', err);
    return NextResponse.json({ error: 'Registration failed. Please try again.' }, { status: 500 });
  }
}
