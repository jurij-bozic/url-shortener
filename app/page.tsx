'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShortenForm } from '@/components/ShortenForm';
import { LinkCard } from '@/components/LinkCard';
import { Card } from '@/components/ui/card';
import { Link as LinkIcon } from 'lucide-react';
import { SignInButton } from '@/components/SignInButton';

interface Link {
  id: string;
  slug: string;
  originalUrl: string;
  createdAt: string;
  clickCount: number;
}

export default function Home() {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [recentLinks, setRecentLinks] = useState<Link[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSession = async () => {
    const res = await fetch('/api/auth/session');
    const data = await res.json();
    setSession(data);
  };

  const fetchRecentLinks = async () => {
    try {
      const res = await fetch('/api/links?t=' + Date.now(), {
        cache: 'no-store',
      });
      if (res.ok) {
        const data = await res.json();
        setRecentLinks(data.links.slice(0, 5));
      }
    } catch (error) {
      console.error('Error fetching links:', error);
    }
  };

  useEffect(() => {
    const init = async () => {
      await fetchSession();
      setIsLoading(false);
    };
    init();
  }, []);

  useEffect(() => {
    if (session?.user) {
      fetchRecentLinks();
      // Poll for updates every 2 seconds
      const interval = setInterval(fetchRecentLinks, 2000);
      return () => clearInterval(interval);
    }
  }, [session]);

  const handleLinkCreated = () => {
    fetchRecentLinks();
  };

  const handleDelete = async (slug: string) => {
    await fetch(`/api/links/${slug}`, { method: 'DELETE' });
    fetchRecentLinks();
  };

  if (isLoading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;
  }

  if (!session?.user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-4xl mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-screen">
          <div className="text-center space-y-6">
            <div className="inline-flex p-3 bg-blue-100 rounded-full">
              <LinkIcon className="w-8 h-8 text-blue-600" />
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
              Shorten Your URLs
            </h1>

            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Create short, trackable links and monitor click analytics in real-time. Perfect for social media, marketing, and more.
            </p>

            <div className="pt-4">
              <SignInButton />
            </div>

            <div className="pt-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
              <Card className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Fast & Simple</h3>
                <p className="text-sm text-gray-600">Create short links instantly with custom slugs or auto-generated ones.</p>
              </Card>

              <Card className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Real-Time Analytics</h3>
                <p className="text-sm text-gray-600">Track clicks, geography, devices, and referrers with detailed charts.</p>
              </Card>

              <Card className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Secure & Reliable</h3>
                <p className="text-sm text-gray-600">OAuth authentication with PostgreSQL-backed storage on Railway.</p>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LinkIcon className="w-6 h-6 text-blue-600" />
            <h1 className="text-xl font-bold text-gray-900">URL Shortener</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Welcome, {session.user.name}</span>
            <a href="/dashboard" className="text-sm font-medium text-blue-600 hover:underline">Dashboard</a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-1">
            <ShortenForm onSuccess={handleLinkCreated} />
          </div>

          {/* Links List Section */}
          <div className="lg:col-span-2">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Recent Links ({recentLinks.length})
              </h2>

              {recentLinks.length === 0 ? (
                <Card className="p-8 text-center">
                  <LinkIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">No links yet</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Create your first short link using the form to get started!
                  </p>
                </Card>
              ) : (
                <div className="space-y-4">
                  {recentLinks.map((link, index) => (
                    <div
                      key={link.id}
                      style={{
                        animation: `materialize 0.5s ease-out forwards`,
                        WebkitAnimation: `materialize 0.5s ease-out forwards`,
                        animationDelay: `${index * 0.08}s`,
                        WebkitAnimationDelay: `${index * 0.08}s`,
                        animationTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
                        WebkitAnimationTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
                      } as React.CSSProperties}
                    >
                      <LinkCard
                        slug={link.slug}
                        originalUrl={link.originalUrl}
                        createdAt={link.createdAt}
                        clickCount={link.clickCount || 0}
                        onDelete={handleDelete}
                      />
                    </div>
                  ))}

                  <a
                    href="/dashboard"
                    className="block text-center text-blue-600 hover:underline font-medium text-sm mt-4"
                  >
                    View all links on Dashboard →
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
