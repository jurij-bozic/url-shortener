'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Link as LinkIcon, ArrowLeft, Zap } from 'lucide-react';
import { ClicksByCountry } from '@/components/charts/ClicksByCountry';
import { ClicksByDevice } from '@/components/charts/ClicksByDevice';
import { ClicksOverTime } from '@/components/charts/ClicksOverTime';

interface LinkData {
  id: string;
  slug: string;
  originalUrl: string;
  createdAt: string;
  clickCount: number;
}

interface Analytics {
  byCountry: Array<{ country: string; clicks: number }>;
  byDevice: Array<{ device: string; clicks: number }>;
  overTime: Array<{ date: string; clicks: number }>;
  referrers: Array<{ referrer: string; clicks: number }>;
}

export default function LinkAnalyticsPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;

  const [linkData, setLinkData] = useState<LinkData | null>(null);
  const [analytics, setAnalytics] = useState<Analytics>({
    byCountry: [],
    byDevice: [],
    overTime: [],
    referrers: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;

    const fetchData = async () => {
      try {
        const [linkRes, countryRes, deviceRes, timeRes, referrerRes] = await Promise.all([
          fetch(`/api/links/${slug}?t=${Date.now()}`, {
            cache: 'no-store',
          }),
          fetch(`/api/analytics/by-country/${slug}?t=${Date.now()}`, {
            cache: 'no-store',
          }),
          fetch(`/api/analytics/by-device/${slug}?t=${Date.now()}`, {
            cache: 'no-store',
          }),
          fetch(`/api/analytics/over-time/${slug}?t=${Date.now()}`, {
            cache: 'no-store',
          }),
          fetch(`/api/analytics/referrers/${slug}?t=${Date.now()}`, {
            cache: 'no-store',
          }),
        ]);

        if (linkRes.status === 401) {
          router.push('/');
          return;
        }

        if (!linkRes.ok) {
          router.push('/dashboard');
          return;
        }

        const link = await linkRes.json();
        const countryData = countryRes.ok ? await countryRes.json() : [];
        const deviceData = deviceRes.ok ? await deviceRes.json() : [];
        const timeData = timeRes.ok ? await timeRes.json() : [];
        const referrerData = referrerRes.ok ? await referrerRes.json() : [];

        setLinkData(link);
        setAnalytics({
          byCountry: countryData,
          byDevice: deviceData,
          overTime: timeData,
          referrers: referrerData,
        });
      } catch (error) {
        console.error('Error fetching link analytics:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // Initial fetch
    fetchData();

    // Poll every 2 seconds
    const interval = setInterval(fetchData, 2000);
    return () => clearInterval(interval);
  }, [slug, router]);

  if (isLoading || !linkData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  const shortenedUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/{linkData.slug}`;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
          <div className="flex items-center gap-3">
            <LinkIcon className="w-6 h-6 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Link Analytics</h1>
              <code className="text-sm text-blue-600 font-mono">{linkData.slug}</code>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* Link Info Card */}
        <Card className="p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-xs text-gray-600 mb-1 uppercase font-semibold">Short URL</p>
              <a
                href={`/${linkData.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-lg font-mono text-blue-600 hover:underline break-all"
              >
                {shortenedUrl}
              </a>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1 uppercase font-semibold">Original URL</p>
              <a
                href={linkData.originalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-lg text-blue-600 hover:underline break-all"
              >
                {linkData.originalUrl}
              </a>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1 uppercase font-semibold">Total Clicks</p>
              <p className="text-3xl font-bold text-gray-900">{linkData.clickCount}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1 uppercase font-semibold">Created</p>
              <p className="text-lg text-gray-900">{new Date(linkData.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </Card>

        {/* Analytics Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Clicks by Country</h3>
            <ClicksByCountry data={analytics.byCountry} />
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Clicks by Device</h3>
            <ClicksByDevice data={analytics.byDevice} />
          </Card>

          <Card className="p-6 lg:col-span-2">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Clicks Over Time</h3>
            <ClicksOverTime data={analytics.overTime} />
          </Card>
        </div>

        {/* Referrers */}
        {analytics.referrers.length > 0 && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Referrers</h3>
            <div className="space-y-3">
              {analytics.referrers.slice(0, 10).map((referrer, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b last:border-0">
                  <p className="text-sm text-gray-700 break-all flex-1">
                    {referrer.referrer || '(direct)'}
                  </p>
                  <div className="flex items-center gap-2 ml-4">
                    <Zap className="w-4 h-4 text-yellow-500" />
                    <p className="text-sm font-semibold text-gray-900">{referrer.clicks}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </main>
    </div>
  );
}
