export interface Link {
  id: string;
  slug: string;
  originalUrl: string;
  userId: string;
  createdAt: Date;
  clicks?: ClickEvent[];
  clickCount?: number;
}

export interface ClickEvent {
  id: string;
  linkId: string;
  referrer: string | null;
  country: string | null;
  device: string | null;
  browser: string | null;
  createdAt: Date;
}

export interface LinkStats {
  totalClicks: number;
  uniqueVisitors: number;
  clicksByDate: Array<{
    date: string;
    clicks: number;
  }>;
  clicksByCountry: Array<{
    country: string;
    clicks: number;
  }>;
  clicksByDevice: Array<{
    device: string;
    clicks: number;
  }>;
  clicksByReferrer: Array<{
    referrer: string;
    clicks: number;
  }>;
}

export interface CreateLinkRequest {
  originalUrl: string;
  customSlug?: string;
}

export interface ApiErrorResponse {
  error: string;
  details?: string;
}
