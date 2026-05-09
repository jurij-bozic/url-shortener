'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LinkCard } from '@/components/LinkCard';
import { Card } from '@/components/ui/card';
import { Link as LinkIcon, Zap, BarChart3, RefreshCw } from 'lucide-react';
import SignOutButton from '@/components/SignOutButton';
import { ClicksByCountry } from '@/components/charts/ClicksByCountry';
import { ClicksByDevice } from '@/components/charts/ClicksByDevice';
import { ClicksOverTime } from '@/components/charts/ClicksOverTime';

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

interface AnalyticsData {
  byCountry: Array<{ country: string; clicks: number }>;
  byDevice: Array<{ device: string; clicks: number }>;
  overTime: Array<{ date: string; clicks: number }>;
}

export default function Dashboard() {
  console.log('=== Dashboard component rendering ===');
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    byCountry: [],
    byDevice: [],
    overTime: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [userInfo, setUserInfo] = useState<{ name?: string; email?: string } | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  console.log('=== State initialized ===');

  const fetchDashboardData = async () => {
    console.log('Fetching dashboard data...', new Date().toISOString());
    try {
      const [linksRes, countryRes, deviceRes, timeRes] = await Promise.all([
        fetch(`/api/links?t=${Date.now()}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
          },
        }),
        fetch(`/api/analytics/by-country?t=${Date.now()}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
          },
        }),
        fetch(`/api/analytics/by-device?t=${Date.now()}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
          },
        }),
        fetch(`/api/analytics/over-time?t=${Date.now()}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
          },
        }),
      ]);

      if (linksRes.status === 401) {
        router.push('/');
        return;
      }

      const linksData = await linksRes.json();
      const countryData = countryRes.ok ? await countryRes.json() : [];
      const deviceData = deviceRes.ok ? await deviceRes.json() : [];
      const timeData = timeRes.ok ? await timeRes.json() : [];

      console.log('Dashboard data received:', linksData);
      setData(linksData);
      setAnalytics({
        byCountry: countryData,
        byDevice: deviceData,
        overTime: timeData,
      });
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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-blue-100 to-slate-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
              <LinkIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Dashboard</h1>
              <p className="text-sm text-slate-500">Manage and analyze your links</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <a href="/" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
              ← Home
            </a>
            <div className="text-right">
              <p className="text-sm font-semibold text-slate-900">{userInfo?.name}</p>
              <p className="text-xs text-slate-500">{userInfo?.email}</p>
            </div>
            <SignOutButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-blue-600 mb-1 font-semibold uppercase tracking-wide">Total Links</p>
                <p className="text-4xl font-bold text-blue-900">{totalLinks}</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl">
                <LinkIcon className="w-8 h-8 text-white" />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-100 border-green-200 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-green-600 mb-1 font-semibold uppercase tracking-wide">Total Clicks</p>
                <p className="text-4xl font-bold text-green-900">{totalClicks}</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl">
                <Zap className="w-8 h-8 text-white" />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-100 border-purple-200 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-purple-600 mb-1 font-semibold uppercase tracking-wide">Avg Clicks/Link</p>
                <p className="text-4xl font-bold text-purple-900">
                  {totalLinks > 0 ? Math.round(totalClicks / totalLinks) : 0}
                </p>
              </div>
              <div className="p-4 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
            </div>
          </Card>
        </div>

        {/* Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 my-12">
          <Card className="p-6 border-slate-200 hover:shadow-lg transition-all">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Clicks by Country</h3>
            <ClicksByCountry data={analytics.byCountry} />
          </Card>

          <Card className="p-6 border-slate-200 hover:shadow-lg transition-all">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Clicks by Device</h3>
            <ClicksByDevice data={analytics.byDevice} />
          </Card>

          <Card className="p-6 lg:col-span-2 border-slate-200 hover:shadow-lg transition-all">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Clicks Over Time</h3>
            <ClicksOverTime data={analytics.overTime} />
          </Card>
        </div>

        {/* Links Section */}
        <div>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-2">Your Links</h2>
              <p className="text-sm text-slate-600">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleRefresh}
                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-900 rounded-lg font-medium transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
              <a
                href="/"
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-lg hover:shadow-blue-500/50 text-white rounded-lg font-medium transition-all"
              >
                <LinkIcon className="w-4 h-4" />
                Create New Link
              </a>
            </div>
          </div>

          {links.length === 0 ? (
            <Card className="p-16 text-center bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-dashed border-slate-200">
              <LinkIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No links yet</h3>
              <p className="text-slate-600 mb-8">
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
