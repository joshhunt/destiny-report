import { useReducer, useEffect } from "react";
import { DestinyCrawlProfileResponse } from "../../types";

type DestinyRecordStateItem = {
  membershipId: string;
  loading: boolean;
  response?: DestinyCrawlProfileResponse;
  error?: boolean;
};

type DestinyCrawlState = Record<string, DestinyRecordStateItem>;

const profileDataReducer = (
  state: DestinyCrawlState,
  data: DestinyRecordStateItem
) => ({
  ...state,
  [data.membershipId]: data,
});

const getLeaderboardProfile = (
  membershipId: string | undefined,
  membershipType: string | undefined,
  dispatchResult: (item: DestinyRecordStateItem) => void
) => {
  if (!membershipType || !membershipId) {
    return;
  }

  dispatchResult({ membershipId, loading: true });

  fetch(`https://api.clan.report/i/user/${membershipType}/${membershipId}`)
    .then((resp) => resp.json())
    .then((resp) =>
      dispatchResult({
        membershipId,
        loading: false,
        error: resp.error || false,
        response: resp,
      })
    )
    .catch((err) => {
      console.error(
        `Error fetching ${membershipType}/${membershipId} leaderboard`,
        err
      );
      dispatchResult({ membershipId, loading: false, error: true });
    });
};

interface MembershipSummary {
  membershipId?: string;
  membershipType?: string;
}

export const useAdditionalProfiles = (
  routeParams: MembershipSummary,
  authedMembership: MembershipSummary
) => {
  const [profileData, dispatchProfileData] = useReducer(profileDataReducer, {});

  useEffect(() => {
    getLeaderboardProfile(
      routeParams.membershipId,
      routeParams.membershipType,
      dispatchProfileData
    );
  }, [routeParams.membershipId, routeParams.membershipType]);

  useEffect(() => {
    authedMembership &&
      getLeaderboardProfile(
        authedMembership.membershipId,
        authedMembership.membershipType,
        dispatchProfileData
      );
  }, [authedMembership]);

  return Object.values(profileData);
};
