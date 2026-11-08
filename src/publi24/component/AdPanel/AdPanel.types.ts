export interface ImageLink {
  link: string;
  isDead?: boolean;
  isSafe?: boolean;
  isSuspicious?: boolean;
  isUnknown?: boolean;
  isListing?: boolean;
  listingLabel?: string | null;
  city?: string | null;
}

export interface ImageSearchDomain {
  domain: string;
  rawDomain?: string;
  flag?: string | null;
  links: ImageLink[];
}
