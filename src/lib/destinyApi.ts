import { ServerResponse } from "bungie-api-ts/common";
import { DestinyProfileResponse } from "bungie-api-ts/destiny2/interfaces";
import { DestinyComponentType } from "../additionalDestinyTypes";

export async function bungieFetch<Data>(
  _url: string,
  options: RequestInit = { headers: {} }
): Promise<Data> {
  const apiKey = process.env.REACT_APP_API_KEY;

  if (!apiKey) {
    throw new Error("REACT_APP_API_KEY not defined");
  }

  const combinedOptions = {
    ...options,
    headers: {
      ...(options.headers || {}),
      "x-api-key": apiKey
    }
  };

  const url = _url.startsWith("https://")
    ? _url
    : `https://www.bungie.net${_url}`;

  const response = await fetch(url, combinedOptions);
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
