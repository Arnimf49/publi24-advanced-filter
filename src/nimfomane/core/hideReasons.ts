export interface ManualHideReason {
  subcategories?: string[];
}

export const MANUAL_HIDE_REASONS: Record<string, ManualHideReason> = {
  alta: {
    subcategories: ['neprotejat', 'servicii slabe', 'sex', 'boală', 'substanțe', 'țeapă']
  },
  aspect: {
    subcategories: ['înălțime', 'greutate', 'vârstă', 'chip', 'etnie', 'silicoane']
  },
  conduită: {
    subcategories: ['nu răspunde', 'igienă', 'needucată', 'fast fuck']
  },
};
