import React from "react";
import TimeAgo from "react-timeago";

import { useDefinitions, withDefinitions } from "../../lib/definitions";
import { useCachedApi } from "../../appHooks";
import {
  NightfallLeaderboardResponse,
  NightfallLeaderboardEntry
} from "../../types";
import Activity from "../../components/Activity";

import s from "./styles.module.scss";

const NIGHTFALL_BLACKLIST = ["1207505828"];
const NIGHFALL_LIGHT_LEVEL_WHITELIST = [980, 820];

const NightfallLeaderboards: React.FC = () => {
  const { DestinyActivityDefinition } = useDefinitions();
  const [nightfallLeaderboardData] = useCachedApi<NightfallLeaderboardResponse>(
    "https://api.clan.report/nightfall-score-dawn.json"
  );

  const byActivityHash =
    nightfallLeaderboardData &&
    nightfallLeaderboardData.rows.reduce<{
      [key: string]: NightfallLeaderboardEntry[];
    }>((acc, entry) => {
      if (NIGHTFALL_BLACKLIST.includes(entry.referenceId)) {
        return acc;
      }

      const newAcc = { ...acc };
      newAcc[entry.referenceId] = newAcc[entry.referenceId] || [];
      newAcc[entry.referenceId].push(entry);

      return newAcc;
    }, {});

  const activityLeaderboards =
    byActivityHash &&
    Object.entries(byActivityHash)
      .map(([activityHash, entries]) => {
        const activity =
          DestinyActivityDefinition && DestinyActivityDefinition[activityHash];

        const sortedEntries = entries.sort((a, b) => b.teamScore - a.teamScore);

        return {
          activityHash,
          entries: sortedEntries,
          lightLevel: activity && activity.activityLightLevel
        };
      })
      .filter(obj => {
        return (
          obj.lightLevel &&
          NIGHFALL_LIGHT_LEVEL_WHITELIST.includes(obj.lightLevel)
        );
      })
      .sort((a, b) => b.entries[0].teamScore - a.entries[0].teamScore)
      .sort((a, b) =>
        a.lightLevel && b.lightLevel ? b.lightLevel - a.lightLevel : 0
      );

  return (
    <>
      <div className={s.nightfalls}>
        {activityLeaderboards &&
          activityLeaderboards.map(obj => (
            <Activity
              className={s.nightfallCard}
              activityHash={obj.activityHash}
              leaderboardEntries={obj.entries}
            />
          ))}

        <div className={s.spacerwtf} />
      </div>

      <section className={s.container}>
        {nightfallLeaderboardData && (
          <p className={s.explainer}>
            Last updated <TimeAgo date={nightfallLeaderboardData.createdAt} />.
          </p>
        )}
      </section>
    </>
  );
};

export default withDefinitions(NightfallLeaderboards, [
  "DestinyActivityDefinition"
]);
