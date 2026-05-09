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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500 rounded-full opacity-10 blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500 rounded-full opacity-10 blur-3xl"></div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-screen relative z-10">
          <div className="text-center space-y-8">
            <div className="inline-flex p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
              <LinkIcon className="w-8 h-8 text-white" />
            </div>

            <div className="space-y-4">
              <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-400 via-indigo-400 to-blue-400 bg-clip-text text-transparent">
                Shorten Your URLs
              </h1>
              <p className="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto leading-relaxed">
                Create short, trackable links and monitor click analytics in real-time with beautiful visualizations.
              </p>
            </div>

            <div className="pt-6">
              <SignInButton />
            </div>

            <div className="pt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              <div className="p-6 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/15 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center mb-3">
                  <LinkIcon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-white mb-2">Fast & Simple</h3>
                <p className="text-sm text-blue-100">Create short links instantly with custom slugs or auto-generated ones.</p>
              </div>

              <div className="p-6 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/15 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center mb-3">
                  <LinkIcon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-white mb-2">Real-Time Analytics</h3>
                <p className="text-sm text-blue-100">Track clicks, geography, devices, and referrers with detailed charts.</p>
              </div>

              <div className="p-6 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/15 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center mb-3">
                  <LinkIcon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-white mb-2">Secure & Reliable</h3>
                <p className="text-sm text-blue-100">OAuth authentication with PostgreSQL-backed storage on Railway.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-blue-100 to-slate-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
              <LinkIcon className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Link</h1>
          </div>
          <div className="flex items-center gap-6">
            <span className="text-sm text-slate-600">Welcome, <span className="font-semibold text-slate-900">{session.user.name}</span></span>
            <a href="/dashboard" className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium hover:shadow-lg hover:shadow-blue-500/50 transition-all">Dashboard</a>
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
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-slate-900 mb-2">
                  Recent Links
                </h2>
                <p className="text-sm text-slate-600">Your last {recentLinks.length} shortened links</p>
              </div>

              {recentLinks.length === 0 ? (
                <div className="p-12 rounded-2xl bg-white border-2 border-dashed border-slate-200 text-center hover:border-slate-300 transition-colors">
                  <LinkIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-600 font-medium text-lg">No links yet</p>
                  <p className="text-sm text-slate-500 mt-2">
                    Create your first short link using the form to get started!
                  </p>
                </div>
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
