import { ClickEvent, LinkStats } from '@/types';

/**
 * Aggregate click events into analytics data
 */
export function aggregateClickEvents(clickEvents: ClickEvent[]): LinkStats {
  const stats: LinkStats = {
    totalClicks: clickEvents.length,
    uniqueVisitors: new Set(clickEvents.map((e) => e.id)).size,
    clicksByDate: [],
    clicksByCountry: [],
    clicksByDevice: [],
    clicksByReferrer: [],
  };

  if (clickEvents.length === 0) {
    return stats;
  }

  // Group clicks by date
  const dateMap = new Map<string, number>();
  clickEvents.forEach((event) => {
    const date = new Date(event.createdAt).toISOString().split('T')[0];
    dateMap.set(date, (dateMap.get(date) || 0) + 1);
  });
  stats.clicksByDate = Array.from(dateMap.entries())
    .map(([date, clicks]) => ({ date, clicks }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // Group clicks by country
  const countryMap = new Map<string, number>();
  clickEvents.forEach((event) => {
    const country = event.country || 'Unknown';
    countryMap.set(country, (countryMap.get(country) || 0) + 1);
  });
  stats.clicksByCountry = Array.from(countryMap.entries())
    .map(([country, clicks]) => ({ country, clicks }))
    .sort((a, b) => b.clicks - a.clicks)
    .slice(0, 10); // Top 10 countries

  // Group clicks by device
  const deviceMap = new Map<string, number>();
  clickEvents.forEach((event) => {
    const device = event.device || 'Unknown';
    deviceMap.set(device, (deviceMap.get(device) || 0) + 1);
  });
  stats.clicksByDevice = Array.from(deviceMap.entries()).map(([device, clicks]) => ({
    device,
    clicks,
  }));

  // Group clicks by referrer
  const referrerMap = new Map<string, number>();
  clickEvents.forEach((event) => {
    const referrer = event.referrer || 'Direct';
    referrerMap.set(referrer, (referrerMap.get(referrer) || 0) + 1);
  });
  stats.clicksByReferrer = Array.from(referrerMap.entries())
    .map(([referrer, clicks]) => ({ referrer, clicks }))
    .sort((a, b) => b.clicks - a.clicks)
    .slice(0, 10); // Top 10 referrers

  return stats;
}

/**
 * Format referrer URL to display name
 */
export function formatReferrer(referrer: string | null): string {
  if (!referrer) return 'Direct';

  try {
    const url = new URL(referrer);
    return url.hostname || referrer;
  } catch {
    return referrer;
  }
}
