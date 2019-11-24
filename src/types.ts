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
