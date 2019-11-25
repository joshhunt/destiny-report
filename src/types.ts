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
  collectionRank: number;
  applicableMembershipTypes: MembershipType[];

  rank?: number;
};

export interface DestinyCrawlProfileResponse {
  profile: DestinyCrawlProfile;
  collectionRank: number;
  triumphRank: number;
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
