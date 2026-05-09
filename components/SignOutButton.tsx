'use client';

import { Button } from '@/components/ui/button';
import { signOut } from 'next-auth/react';
import { LogOut } from 'lucide-react';

export default function SignOutButton() {
  return (
    <Button
      onClick={() => signOut({ callbackUrl: '/' })}
      variant="outline"
      size="sm"
      className="gap-2"
    >
      <LogOut className="w-4 h-4" />
      Sign Out
    </Button>
  );
}
