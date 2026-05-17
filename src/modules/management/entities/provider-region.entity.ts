export interface ProviderRegion {
  id: string;
  name: string;
  displayName: string;
  location: string;
  available: boolean;
  flagEmoji?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
}
