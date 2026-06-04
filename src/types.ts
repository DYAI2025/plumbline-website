export type EvidenceStatus = 'fake' | 'insufficient' | 'boundary' | 'verified';

export interface SectionInfo {
  id: string;
  label: string;
  num: string;
}

export interface AgentFeature {
  id: string;
  title: string;
  description: string;
  cmd?: string;
}

export interface SponsorTier {
  id: string;
  name: string;
  cost: string;
  desc: string;
  badge: string;
  details: string;
}
