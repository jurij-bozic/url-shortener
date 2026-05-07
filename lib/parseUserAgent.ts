import { UAParser } from 'ua-parser-js';

export interface ParsedUserAgent {
  device: string;
  browser: string;
  os: string;
}

/**
 * Parse user agent string to extract device, browser, and OS information
 */
export function parseUserAgent(userAgentString: string | undefined): ParsedUserAgent {
  if (!userAgentString) {
    return {
      device: 'Unknown',
      browser: 'Unknown',
      os: 'Unknown',
    };
  }

  try {
    const parser = new UAParser(userAgentString);
    const result = parser.getResult();

    const deviceType = result.device?.type || 'desktop';
    const deviceName =
      deviceType === 'mobile' ? 'Mobile' : deviceType === 'tablet' ? 'Tablet' : 'Desktop';

    const browserName = result.browser?.name || 'Unknown';
    const osName = result.os?.name || 'Unknown';

    return {
      device: deviceName,
      browser: browserName,
      os: osName,
    };
  } catch (error) {
    console.error('Error parsing user agent:', error);
    return {
      device: 'Unknown',
      browser: 'Unknown',
      os: 'Unknown',
    };
  }
}

/**
 * Categorize device into simpler categories for analytics
 */
export function categorizeDevice(deviceType: string | null): string {
  if (!deviceType) return 'Desktop';
  const lower = deviceType.toLowerCase();
  if (lower.includes('mobile')) return 'Mobile';
  if (lower.includes('tablet')) return 'Tablet';
  return 'Desktop';
}
