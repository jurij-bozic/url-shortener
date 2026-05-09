import { redirect, notFound } from 'next/navigation';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { parseUserAgent } from '@/lib/parseUserAgent';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const link = await prisma.link.findUnique({
    where: { slug },
  });

  if (!link) {
    notFound();
  }

  // Extract request metadata
  const userAgent = req.headers.get('user-agent') || '';
  const referrer = req.headers.get('referer');
  
  // Parse user agent
  const parsedUA = parseUserAgent(userAgent);

  // Try to get country from Vercel geo header (if deployed on Vercel)
  const country = req.headers.get('x-vercel-ip-country') || null;

  try {
    // Log the click event
    await prisma.clickEvent.create({
      data: {
        linkId: link.id,
        referrer: referrer || null,
        country: country,
        device: parsedUA.device,
        browser: parsedUA.browser,
      },
    });
  } catch (error) {
    console.error('Error logging click event:', error);
    // Don't fail if analytics logging fails
  }

  // Redirect to the original URL
  redirect(link.originalUrl);
}
