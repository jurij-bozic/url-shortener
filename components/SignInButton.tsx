'use client';

import { Button } from '@/components/ui/button';
import { signIn } from 'next-auth/react';

export function SignInButton() {
  return (
    <Button
      size="lg"
      onClick={() => signIn('google', { callbackUrl: '/' })}
      className="relative overflow-hidden transform-gpu bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/40 text-white px-8 font-semibold rounded-lg transition-none"
    >
      {/* Opacity is GPU-composited, so it stays smooth in Safari (filter/box-shadow transitions are not) */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-white/20 opacity-0 transition-opacity duration-50 ease-linear group-hover/button:opacity-100"
      />
      <span className="relative">Sign In with Google</span>
    </Button>
  );
}
