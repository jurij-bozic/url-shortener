import { getSession } from '@/lib/auth';
import { ShortenForm } from '@/components/ShortenForm';
import { LinkCard } from '@/components/LinkCard';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Link as LinkIcon } from 'lucide-react';
import { SignInButton } from '@/components/SignInButton';
import { prisma } from '@/lib/prisma';

async function getRecentLinks(userId: string) {
  try {
    const links = await prisma.link.findMany({
      where: { userId },
      include: {
        _count: {
          select: { clicks: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    return links.map((link) => ({
      id: link.id,
      slug: link.slug,
      originalUrl: link.originalUrl,
      createdAt: link.createdAt,
      clickCount: link._count.clicks,
    }));
  } catch (error) {
    console.error('Error fetching links:', error);
    return [];
  }
}

export default async function Home() {
  const session = await getSession();

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

  const recentLinks: any[] = await getRecentLinks((session.user as any).id);

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
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-1">
            <ShortenForm />
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
                  {recentLinks.slice(0, 5).map((link: any) => (
                    <LinkCard
                      key={link.id}
                      slug={link.slug}
                      originalUrl={link.originalUrl}
                      createdAt={link.createdAt}
                      clickCount={link.clickCount || 0}
                      onDelete={async (slug: string) => {
                        'use server';
                        await fetch(`/api/links/${slug}`, { method: 'DELETE' });
                      }}
                    />
                  ))}

                  {recentLinks.length > 5 && (
                    <a
                      href="/dashboard"
                      className="text-blue-600 hover:underline font-medium text-sm"
                    >
                      View all {recentLinks.length} links →
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
