import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ApiErrorResponse } from '@/types';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getSession();

    if (!(session?.user as any)?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' } as ApiErrorResponse,
        { status: 401 }
      );
    }

    const { slug } = await params;

    const link = await prisma.link.findUnique({
      where: { slug },
    });

    if (!link) {
      return NextResponse.json(
        { error: 'Link not found' } as ApiErrorResponse,
        { status: 404 }
      );
    }

    if (!session) {
      throw new Error('Session is null');
    }

    // Verify ownership
    if (link.userId !== (session.user as any).id) {
      return NextResponse.json(
        { error: 'Unauthorized' } as ApiErrorResponse,
        { status: 403 }
      );
    }

    // Delete the link (cascade delete will handle click events)
    await prisma.link.delete({
      where: { slug },
    });

    // Revalidate the dashboard and home page
    revalidatePath('/dashboard');
    revalidatePath('/');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting link:', error);
    return NextResponse.json(
      { error: 'Internal server error' } as ApiErrorResponse,
      { status: 500 }
    );
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getSession();

    if (!(session?.user as any)?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' } as ApiErrorResponse,
        { status: 401 }
      );
    }

    const { slug } = await params;

    const link = await prisma.link.findUnique({
      where: { slug },
      include: {
        clicks: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!link) {
      return NextResponse.json(
        { error: 'Link not found' } as ApiErrorResponse,
        { status: 404 }
      );
    }

    if (!session) {
      throw new Error('Session is null');
    }

    // Verify ownership
    if (link.userId !== (session.user as any).id) {
      return NextResponse.json(
        { error: 'Unauthorized' } as ApiErrorResponse,
        { status: 403 }
      );
    }

    return NextResponse.json(link);
  } catch (error) {
    console.error('Error fetching link:', error);
    return NextResponse.json(
      { error: 'Internal server error' } as ApiErrorResponse,
      { status: 500 }
    );
  }
}
