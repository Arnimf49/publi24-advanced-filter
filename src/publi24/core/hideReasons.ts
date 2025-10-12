import {AutoHideCriterias} from "./storage";

export interface ManualHideReason {
  expireDays: number | null;
  subcategories?: string[];
}

export const MANUAL_HIDE_REASONS: Record<string, ManualHideReason> = {
  alta: { 
    expireDays: null,
    subcategories: ['neprotejat', 'servicii slabe', 'sex', 'boală', 'substanțe', 'țeapă']
  },
  aspect: { 
    expireDays: null,
    subcategories: ['înălțime', 'greutate', 'vârstă', 'chip', 'etnie', 'silicoane']
  },
  comportament: { 
    expireDays: null,
    subcategories: ['nu răspunde', 'igienă', 'needucată', 'fast fuck']
  },
  'poze false': { expireDays: 90 },
  temporar: { expireDays: 15 },
};

export interface AutoHideCriteriaProps {
  condition: (criterias: AutoHideCriterias, value: any) => boolean;
  value: string;
  reason: (criterias: AutoHideCriterias) => string;
  expireDays?: number;
}

export const AUTO_HIDE_CRITERIA: { [key in keyof AutoHideCriterias]: AutoHideCriteriaProps } = {
  maxAge: {
    condition: ({maxAgeValue}: AutoHideCriterias, value: number): boolean => !!maxAgeValue && maxAgeValue < value,
    value: 'age',
    reason: ({maxAgeValue}: AutoHideCriterias): string => `peste ${maxAgeValue} de ani`,
  },
  minHeight: {
    condition: ({minHeightValue}: AutoHideCriterias, value: number): boolean => !!minHeightValue && minHeightValue > value,
    value: 'height',
    reason: ({minHeightValue}: AutoHideCriterias): string => `sub ${minHeightValue}cm`,
  },
  maxHeight: {
    condition: ({maxHeightValue}: AutoHideCriterias, value: number): boolean => !!maxHeightValue && maxHeightValue < value,
    value: 'height',
    reason: ({maxHeightValue}: AutoHideCriterias): string => `peste ${maxHeightValue}cm`,
  },
  maxWeight: {
    condition: ({maxWeightValue}: AutoHideCriterias, value: number): boolean => !!maxWeightValue && maxWeightValue < value,
    value: 'weight',
    reason: ({maxWeightValue}: AutoHideCriterias): string => `peste ${maxWeightValue}kg`,
  },
  onlyTrips: {
    condition: (_: AutoHideCriterias, value: boolean): boolean => value,
    value: 'onlyTrips',
    reason: (): string => `numai deplasări`,
    expireDays: 15,
  },
  showWeb: {
    condition: (_: AutoHideCriterias, value: boolean): boolean => value,
    value: 'showWeb',
    reason: (): string => `oferă show web`,
  },
  botox: {
    condition: (_: AutoHideCriterias, value: boolean): boolean => value,
    value: 'botox',
    reason: (): string => `siliconată`,
  },
  party: {
    condition: (_: AutoHideCriterias, value: boolean): boolean => value,
    value: 'party',
    reason: (): string => `face party`,
  },
  btsRisc: {
    condition: (_: AutoHideCriterias, value: boolean): boolean => value,
    value: 'btsRisc',
    reason: (): string => `risc bts`,
  },
  trans: {
    condition: (_: AutoHideCriterias, value: boolean): boolean => value,
    value: 'trans',
    reason: (): string => `transsexual`,
  },
  mature: {
    condition: (_: AutoHideCriterias, value: boolean): boolean => value,
    value: 'mature',
    reason: (): string => `matură`,
  },
};