export enum MembershipType {
  Xbox = 1,
  Playstation = 2,
  Steam = 3,
  BattleNet = 4,
  Stadia = 5
}

export type LeaderboardEntry = {
  membershipId: string;
  membershipType: MembershipType;
  displayName: string;
  triumphScore: number;
  collectionScore: number;
  triumphRank: number;
  lastCrawled: string;
  collectionRank: number;
  applicableMembershipTypes: MembershipType[];
  rank?: number;
};

export interface DestinyCrawlProfileResponse {
  profile: DestinyCrawlProfile;
  collectionRank: number;
  triumphRank: number;
  error?: any;
}

export interface DestinyCrawlProfile {
  membershipId: string;
  membershipType: number;
  displayName: string;
  lastCrawled: string;
  lastSeen: string;
  lastPlayed: string;
  triumphScore: number;
  collectionScore: number;
  crossSaveOverride: number;
  applicableMembershipTypes: number[];
  createdAt: string;
  updatedAt: string;
}

export interface DestinyCrawlApiStatus {
  profileCount: number;
  latestProfileLastCrawled: string;
}
