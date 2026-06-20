import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  return session?.user || null;
}

export async function requireRole(allowedRoles = []) {
  const user = await getCurrentUser();
  if (!user) {
    return { error: 'Unauthorized', status: 401, user: null };
  }
  if (!allowedRoles.includes(user.role)) {
    return { error: 'Forbidden', status: 403, user: null };
  }
  return { error: null, status: 200, user };
}
