import React from "react";
import { useCachedApi, CacheStrategy } from "../appHooks";
import { ServerResponse } from "bungie-api-ts/common";
import { DestinyPostGameCarnageReportData } from "bungie-api-ts/destiny2/interfaces";

const FireteamMembers: React.FC<{ pgcrId: number }> = ({ pgcrId }) => {
  const [pgcr] = useCachedApi<ServerResponse<DestinyPostGameCarnageReportData>>(
    `https://stats.bungie.net/Platform/Destiny2/Stats/PostGameCarnageReport/${pgcrId}/`,
    CacheStrategy.UseStale
  );

  return pgcr ? (
    <>
      {pgcr.Response.entries.map(entry => (
        <div key={entry.player.destinyUserInfo.membershipId}>
          {entry.player.destinyUserInfo.displayName}
        </div>
      ))}
    </>
  ) : null;
};

export default FireteamMembers;
