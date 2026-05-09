import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { slug } = await params;
    const userId = (session.user as any).id;

    // Get link and verify user owns it
    const link = await prisma.link.findUnique({
      where: { slug },
      include: {
        _count: {
          select: { clicks: true },
        },
      },
    });

    if (!link || link.userId !== userId) {
      return NextResponse.json({ error: 'Link not found' }, { status: 404 });
    }

    return NextResponse.json(
      {
        id: link.id,
        slug: link.slug,
        originalUrl: link.originalUrl,
        createdAt: link.createdAt,
        clickCount: link._count.clicks,
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching link:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
