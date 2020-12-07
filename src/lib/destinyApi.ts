import { ServerResponse } from "bungie-api-ts/common";
import { CoreSettingsConfiguration } from "bungie-api-ts/core/interfaces";
import {
  DestinyProfileResponse,
  DestinyActivityHistoryResults,
} from "bungie-api-ts/destiny2/interfaces";
import { UserMembershipData } from "bungie-api-ts/user";

import { DestinyComponentType } from "../additionalDestinyTypes";

const API_KEY = process.env.REACT_APP_BUNGIE_API_KEY;

export async function bungieFetch<Data>(
  url: string,
  authToken?: string
): Promise<Data> {
  const options = {
    headers: {
      authorization: authToken ? `Bearer ${authToken}` : "",
      "x-api-key": API_KEY || "",
    },
  };

  const response = await fetch(url, options);
  const jsonData = (await response.json()) as ServerResponse<Data>;

  return jsonData.Response;
}

export async function getProfile(
  membershipType: number | string,
  membershipId: number | string,
  components: DestinyComponentType[]
) {
  const componentsStr = components.join(",");

  return await bungieFetch<DestinyProfileResponse>(
    `https://www.bungie.net/Platform/Destiny2/${membershipType}/Profile/${membershipId}/?components=${componentsStr}`
  );
}

export async function getCachedSettings(
  cb: (value: CoreSettingsConfiguration) => void
) {
  const cachedStr = localStorage.getItem("bungie-settings");
  if (cachedStr) {
    cb(JSON.parse(cachedStr));
  }

  const newValue = await bungieFetch<CoreSettingsConfiguration>(
    "https://www.bungie.net/Platform/Settings/"
  );

  localStorage.setItem("bungie-settings", JSON.stringify(newValue));

  cb(newValue);
}

// Don't use this anymore
export async function getMembershipForCurrentUser() {
  const authToken = null;

  if (!authToken) {
    throw new Error("Do not have an auth token");
  }

  return await bungieFetch<UserMembershipData>(
    `https://www.bungie.net/Platform/User/GetMembershipsForCurrentUser/`,
    authToken
  );
}

export const getAuthenticatedDestinyMembership = async () => {
  const userMemberships = await getMembershipForCurrentUser();

  if (userMemberships.destinyMemberships.length === 0) {
    return;
  }

  const primaryMembershipId =
    userMemberships.primaryMembershipId ||
    userMemberships.destinyMemberships[0].membershipId;

  return userMemberships.destinyMemberships.find(
    (membership) => membership.membershipId === primaryMembershipId
  );
};

export async function getActivityHistoryForCharacter(
  membershipType: string,
  membershipId: string,
  characterId: string,
  mode: string,
  page = 0,
  count = 250
) {
  return await bungieFetch<DestinyActivityHistoryResults>(
    `https://www.bungie.net/Platform/Destiny2/${membershipType}/Account/${membershipId}/Character/${characterId}/Stats/Activities/?mode=${mode}&page=${page}&count=${count}`
  );
}
