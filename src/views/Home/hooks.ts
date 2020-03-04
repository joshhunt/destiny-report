import { useReducer, useEffect } from "react";
import { DestinyCrawlProfileResponse } from "../../types";

type DestinyRecordStateItem = {
  membershipId: string;
  loading: boolean;
  response?: DestinyCrawlProfileResponse;
};

type DestinyCrawlState = Record<string, DestinyRecordStateItem>;

const profileDataReducer = (
  state: DestinyCrawlState,
  data: DestinyRecordStateItem
) => ({
  ...state,
  [data.membershipId]: data
});

export const useProfileAPIData = ({
  membershipType,
  membershipId
}: {
  membershipId?: string;
  membershipType?: string;
}) => {
  const [profileData, dispatchProfileData] = useReducer(profileDataReducer, {});

  useEffect(() => {
    if (!membershipType || !membershipId) {
      return;
    }

    dispatchProfileData({ membershipId, loading: true });

    fetch(`https://api.clan.report/i/user/${membershipType}/${membershipId}`)
      .then(r => r.json())
      .then(d =>
        dispatchProfileData({
          membershipId,
          loading: false,
          response: d
        })
      )
      .catch(() => dispatchProfileData({ membershipId, loading: false }));
  }, [membershipType, membershipId]);

  return Object.values(profileData);
};
