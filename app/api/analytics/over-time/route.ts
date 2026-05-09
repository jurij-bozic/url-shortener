import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;

    // Get all clicks for user's links
    const clicks = await prisma.clickEvent.findMany({
      where: {
        link: {
          userId,
        },
      },
      select: {
        createdAt: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Group by date
    const dataMap = new Map<string, number>();

    clicks.forEach((click) => {
      const date = new Date(click.createdAt);
      const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
      dataMap.set(dateStr, (dataMap.get(dateStr) || 0) + 1);
    });

    // Convert to array and sort by date
    const data = Array.from(dataMap.entries())
      .map(([date, clicks]) => ({
        date,
        clicks,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      },
    });
  } catch (error) {
    console.error('Error fetching analytics over time:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
