'use client';

import { Button } from '@/components/ui/button';
import { signIn } from 'next-auth/react';

export function SignInButton() {
  return (
    <Button
      size="lg"
      onClick={() => signIn('google', { callbackUrl: '/' })}
      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-2xl hover:shadow-blue-500/50 text-white px-8 font-semibold rounded-lg transition-all"
    >
      Sign In with Google
    </Button>
  );
}
