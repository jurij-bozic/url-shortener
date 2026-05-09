'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LinkCard } from '@/components/LinkCard';
import { Card } from '@/components/ui/card';
import { Link as LinkIcon, Zap, BarChart3, RefreshCw } from 'lucide-react';
import SignOutButton from '@/components/SignOutButton';

interface Link {
  id: string;
  slug: string;
  originalUrl: string;
  createdAt: string;
  clickCount: number;
}

interface DashboardData {
  links: Link[];
  totalLinks: number;
  totalClicks: number;
}

// Disable static page generation and caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function Dashboard() {
  console.log('=== Dashboard component rendering ===');
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userInfo, setUserInfo] = useState<{ name?: string; email?: string } | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  console.log('=== State initialized ===');

  const fetchDashboardData = async () => {
    console.log('Fetching dashboard data...', new Date().toISOString());
    try {
      const response = await fetch(`/api/links?t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      });
      if (response.status === 401) {
        router.push('/');
        return;
      }
      const newData = await response.json();
      console.log('Dashboard data received:', newData);
      setData(newData);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getSession = async () => {
    try {
      const response = await fetch('/api/auth/session');
      const session = await response.json();
      if (session?.user) {
        setUserInfo(session.user);
      } else {
        router.push('/');
      }
    } catch (error) {
      console.error('Error fetching session:', error);
    }
  };

  useEffect(() => {
    console.log('useEffect mounted');
    getSession();
    fetchDashboardData();

    // Poll for updates every 1 second
    const interval = setInterval(() => {
      console.log('Interval tick');
      fetchDashboardData();
    }, 1000);
    
    return () => {
      console.log('useEffect cleanup');
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty deps - only run once on mount

  const handleDelete = async (slug: string) => {
    await fetch(`/api/links/${slug}`, { method: 'DELETE' });
    await fetchDashboardData();
  };

  const handleRefresh = () => {
    fetchDashboardData();
  };

  if (isLoading || !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin mb-4">
            <RefreshCw className="w-8 h-8 text-blue-600 mx-auto" />
          </div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const { links, totalLinks, totalClicks } = data;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LinkIcon className="w-6 h-6 text-blue-600" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-sm text-gray-500">Manage your shortened links</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-gray-600">{userInfo?.name}</p>
              <p className="text-xs text-gray-500">{userInfo?.email}</p>
            </div>
            <SignOutButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Links</p>
                <p className="text-3xl font-bold text-gray-900">{totalLinks}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <LinkIcon className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Clicks</p>
                <p className="text-3xl font-bold text-gray-900">{totalClicks}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Zap className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Avg Clicks/Link</p>
                <p className="text-3xl font-bold text-gray-900">
                  {totalLinks > 0 ? Math.round(totalClicks / totalLinks) : 0}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Links Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Your Links</h2>
              <p className="text-xs text-gray-500 mt-1">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleRefresh}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-lg font-medium transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
              <a
                href="/"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                <LinkIcon className="w-4 h-4" />
                Create New Link
              </a>
            </div>
          </div>

          {links.length === 0 ? (
            <Card className="p-12 text-center">
              <LinkIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No links yet</h3>
              <p className="text-gray-600 mb-6">
                Create your first shortened link to get started with analytics tracking.
              </p>
              <a
                href="/"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                Create First Link
              </a>
            </Card>
          ) : (
            <div className="space-y-4">
              {links.map((link) => (
                <LinkCard
                  key={link.id}
                  slug={link.slug}
                  originalUrl={link.originalUrl}
                  createdAt={link.createdAt}
                  clickCount={link.clickCount}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
