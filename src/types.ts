import { DestinyHistoricalStatsPeriodGroup } from "bungie-api-ts/destiny2/interfaces";

declare global {
  interface Window {
    __HIDDEN_IFRAME_REFRESH_AUTH: boolean;
    __recieveNewCodeFromIframe: (v: any) => void;
    __preloadData: Record<string, any>;
  }
}

export enum MembershipType {
  Xbox = 1,
  Playstation = 2,
  Steam = 3,
  BattleNet = 4,
  Stadia = 5,
  Unknown = 777,
}

export interface LeaderboardEntry {
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
}

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
  triumphScore: number;
  collectionScore: number;
  crossSaveOverride: number;
  applicableMembershipTypes: number[];
}

export interface DestinyCrawlApiStatus {
  profileCount: number;
  latestProfileLastCrawled: string;
}

export interface NightfallLeaderboardResponse {
  createdAt: string;
  season: Season;
  rows: NightfallLeaderboardEntry[];
}

export interface NightfallLeaderboardEntry {
  pgcrId: number;
  referenceId: string;
  directorActivityHash: string;
  period: BigQueryDate;
  mode: string;
  playerCount: number;
  activityDurationSeconds: number;
  teamScore: number;
  completed: boolean;
  primaryMembershipType: string;
  versionId: number;
  createdAt: BigQueryDate;
  startingPhaseIndex: number;
  seqnum: number;
}

export interface BigQueryDate {
  value: string;
}

export interface Season {
  name: string;
  seasonHash: number;
  startDate: string;
  endDate: string;
}

export interface Membership {
  membershipType: string;
  membershipId: string;
}

export interface CharacterActivity {
  characterId: string;
  activity: DestinyHistoricalStatsPeriodGroup;
}
