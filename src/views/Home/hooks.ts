import { useReducer, useEffect, useState } from "react";
import { DestinyCrawlProfileResponse } from "../../types";
import { getAuthenticatedDestinyMembership } from "../../lib/destinyApi";
import { useBungieAuth } from "../../lib/bungieAuth";

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
  [data.membershipId]: data
});

const getLeaderboardProfile = (
  {
    membershipId,
    membershipType
  }: {
    membershipId?: string;
    membershipType?: string;
  },
  dispatchResult: (item: DestinyRecordStateItem) => void
) => {
  if (!membershipType || !membershipId) {
    return;
  }

  dispatchResult({ membershipId, loading: true });

  fetch(`https://api.clan.report/i/user/${membershipType}/${membershipId}`)
    .then(resp => resp.json())
    .then(resp =>
      dispatchResult({
        membershipId,
        loading: false,
        error: resp.error || false,
        response: resp
      })
    )
    .catch(err => {
      console.error(
        `Error fetching ${membershipType}/${membershipId} leaderboard`,
        err
      );
      dispatchResult({ membershipId, loading: false, error: true });
    });
};

export const useProfileAPIData = ({
  membershipType,
  membershipId
}: {
  membershipId?: string;
  membershipType?: string;
}) => {
  const [profileData, dispatchProfileData] = useReducer(profileDataReducer, {});
  const authedMembership = useAuthenticatedBungieProfile();

  useEffect(() => {
    getLeaderboardProfile(
      { membershipType, membershipId },
      dispatchProfileData
    );
  }, [membershipType, membershipId]);

  useEffect(() => {
    authedMembership &&
      getLeaderboardProfile(authedMembership, dispatchProfileData);
  }, [authedMembership]);

  return Object.values(profileData);
};

export const useAuthenticatedBungieProfile = () => {
  const { isAuthenticated, authLoaded } = useBungieAuth();
  const [data, setData] = useState();

  useEffect(() => {
    if (!isAuthenticated || !authLoaded) {
      return;
    }

    getAuthenticatedDestinyMembership().then(setData);
  }, [isAuthenticated, authLoaded]);

  return data;
};
