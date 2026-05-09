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

    // Verify link exists and user owns it
    const link = await prisma.link.findUnique({
      where: { slug },
    });

    if (!link || link.userId !== userId) {
      return NextResponse.json({ error: 'Link not found' }, { status: 404 });
    }

    // Get clicks grouped by referrer for this link
    const clicks = await prisma.clickEvent.groupBy({
      by: ['referrer'],
      where: {
        linkId: link.id,
      },
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
    });

    const data = clicks.map((click) => ({
      referrer: click.referrer || '(direct)',
      clicks: click._count.id,
    }));

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      },
    });
  } catch (error) {
    console.error('Error fetching link analytics by referrer:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
