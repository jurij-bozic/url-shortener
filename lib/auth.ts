import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';

export async function getSession() {
  return await getServerSession(authOptions);
}

export async function requireAuth() {
  const session = await getSession();
  if (!session) {
    redirect('/auth/signin');
  }
  return session;
}
