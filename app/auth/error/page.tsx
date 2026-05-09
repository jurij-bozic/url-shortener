'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';

function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const errorMessages: Record<string, string> = {
    Callback: 'The sign-in callback failed. Please try again.',
    OAuthCallback: 'There was an issue with the OAuth provider. Please try again.',
    OAuthSignin: 'There was an issue connecting to the OAuth provider.',
    OAuthCreateAccount: 'Could not create an account with the OAuth provider.',
    EmailCreateAccount: 'Could not create an account with the email provider.',
    OAuthAccountNotLinked: 'This email is already associated with another account.',
    EmailSignInError: 'Check your email address and try again.',
    CredentialsSignin: 'Sign in failed. Check the details you provided and try again.',
    SessionCallback: 'An error occurred while creating your session.',
    AccessDenied: 'Access was denied. Please try again.',
    Verification: 'The verification link has expired or is invalid.',
    Default: 'An unexpected error occurred. Please try again.',
  };

  const errorMessage = errorMessages[error as string] || errorMessages.Default;

  return (
    <Card className="w-full max-w-md p-8">
      <div className="text-center mb-8">
        <div className="inline-flex p-3 bg-red-100 rounded-full mb-4">
          <AlertCircle className="w-8 h-8 text-red-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Sign In Error</h1>
        <p className="text-gray-600">Something went wrong during sign in</p>
      </div>

      <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-sm text-red-800">{errorMessage}</p>
        {error && (
          <p className="text-xs text-red-700 mt-2 font-mono">Error code: {error}</p>
        )}
      </div>

      <div className="space-y-3">
        <Link href="/auth/signin" className="block">
          <Button className="w-full">Try Again</Button>
        </Link>
        <Link href="/" className="block">
          <Button variant="outline" className="w-full">
            Back to Home
          </Button>
        </Link>
      </div>

      <p className="text-center text-xs text-gray-500 mt-6">
        If the problem persists, please contact support.
      </p>
    </Card>
  );
}

export default function ErrorPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Suspense
        fallback={
          <Card className="w-full max-w-md p-8">
            <div className="text-center">
              <p className="text-gray-600">Loading...</p>
            </div>
          </Card>
        }
      >
        <ErrorContent />
      </Suspense>
    </div>
  );
}
