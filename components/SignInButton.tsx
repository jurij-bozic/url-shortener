'use client';

import { Button } from '@/components/ui/button';
import { signIn } from 'next-auth/react';

export function SignInButton() {
  return (
    <Button
      size="lg"
      onClick={() => signIn('google', { callbackUrl: '/' })}
      className="bg-blue-600 hover:bg-blue-700 text-white px-8"
    >
      Sign In with Google
    </Button>
  );
}
