import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { LinkCard } from '@/components/LinkCard';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link as LinkIcon, Zap, BarChart3 } from 'lucide-react';
import SignOutButton from '@/components/SignOutButton'; // This will work once file is created

export const metadata = {
  title: 'Dashboard - URL Shortener',
  description: 'Manage your shortened links and view analytics',
};

async function getDashboardStats(userId: string) {
  try {
    const links = await prisma.link.findMany({
      where: { userId },
      include: {
        _count: {
          select: { clicks: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const totalLinks = links.length;
    const totalClicks = links.reduce((sum, link) => sum + link._count.clicks, 0);

    return {
      links: links.map((link) => ({
        id: link.id,
        slug: link.slug,
        originalUrl: link.originalUrl,
        createdAt: link.createdAt.toISOString(),
        clickCount: link._count.clicks,
      })),
      totalLinks,
      totalClicks,
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return {
      links: [],
      totalLinks: 0,
      totalClicks: 0,
    };
  }
}

export default async function Dashboard() {
  const session = await getSession();

  if (!session?.user) {
    redirect('/');
  }

  const { links, totalLinks, totalClicks } = await getDashboardStats((session.user as any).id);

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
              <p className="text-sm text-gray-600">{session.user.name}</p>
              <p className="text-xs text-gray-500">{session.user.email}</p>
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
            <h2 className="text-2xl font-bold text-gray-900">Your Links</h2>
            <a
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              <LinkIcon className="w-4 h-4" />
              Create New Link
            </a>
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
                  createdAt={link.createdAt as string}
                  clickCount={link.clickCount}
                  onDelete={async (slug: string) => {
                    'use server';
                    await fetch(`/api/links/${slug}`, { method: 'DELETE' });
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
