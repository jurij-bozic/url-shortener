import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateSlug, isValidSlug, isValidUrl } from '@/lib/slugify';
import { CreateLinkRequest, ApiErrorResponse } from '@/types';
import { z } from 'zod';

const CreateLinkSchema = z.object({
  originalUrl: z.string().url('Invalid URL format'),
  customSlug: z.string().regex(/^[a-zA-Z0-9]{3,30}$/, 'Slug must be 3-30 alphanumeric characters').optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();

    if (!(session?.user as any)?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' } as ApiErrorResponse,
        { status: 401 }
      );
    }

    const body = await req.json();
    const parsed = CreateLinkSchema.parse(body);

    // Determine slug to use
    let slug = parsed.customSlug || generateSlug();

    // Verify slug is unique
    const existingLink = await prisma.link.findUnique({
      where: { slug },
    });

    if (existingLink) {
      return NextResponse.json(
        { error: 'Slug already exists', details: 'Try a different custom slug or leave it empty for auto-generation' } as ApiErrorResponse,
        { status: 400 }
      );
    }

    if (!session) {
      throw new Error('Session is null');
    }

    // Create the link
    const link = await prisma.link.create({
      data: {
        slug,
        originalUrl: parsed.originalUrl,
        userId: (session.user as any).id,
      },
    });

    // Revalidate the dashboard and home page to show the new link
    revalidatePath('/dashboard');
    revalidatePath('/');

    return NextResponse.json(link, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues[0].message } as ApiErrorResponse,
        { status: 400 }
      );
    }

    console.error('Error creating link:', error);
    return NextResponse.json(
      { error: 'Internal server error' } as ApiErrorResponse,
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await getSession();

    if (!(session?.user as any)?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' } as ApiErrorResponse,
        { status: 401 }
      );
    }

    if (!session) {
      throw new Error('Session is null');
    }

    const links = await prisma.link.findMany({
      where: {
        userId: (session.user as any).id,
      },
      include: {
        _count: {
          select: { clicks: true },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const linksWithClickCount = links.map((link) => ({
      id: link.id,
      slug: link.slug,
      originalUrl: link.originalUrl,
      createdAt: link.createdAt.toISOString(),
      clickCount: link._count.clicks,
    }));

    const totalLinks = linksWithClickCount.length;
    const totalClicks = linksWithClickCount.reduce((sum, link) => sum + link.clickCount, 0);

    const response = NextResponse.json({
      links: linksWithClickCount,
      totalLinks,
      totalClicks,
    });
    
    // Disable caching for this endpoint
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    return response;
  } catch (error) {
    console.error('Error fetching links:', error);
    return NextResponse.json(
      { error: 'Internal server error' } as ApiErrorResponse,
      { status: 500 }
    );
  }
}
