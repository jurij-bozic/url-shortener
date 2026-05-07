/**
 * Generate a random slug for URL shortening
 * Uses alphanumeric characters (a-z, A-Z, 0-9)
 * Length: 6 characters (approx 2.1 trillion combinations)
 */
export function generateSlug(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let slug = '';
  for (let i = 0; i < 6; i++) {
    slug += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return slug;
}

/**
 * Validate if a slug is in valid format (alphanumeric, 3-30 chars)
 */
export function isValidSlug(slug: string): boolean {
  const slugRegex = /^[a-zA-Z0-9]{3,30}$/;
  return slugRegex.test(slug);
}

/**
 * Validate if a URL is properly formatted
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}
