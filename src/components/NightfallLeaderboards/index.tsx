import React from "react";
import { WithDefinitions } from "../../lib/definitions";
import { useCachedApi } from "../../appHooks";
import {
  NightfallLeaderboardResponse,
  NightfallLeaderboardEntry
} from "../../types";

import s from "./styles.module.scss";
import Activity from "../../components/Activity";

const NIGHTFALL_BLACKLIST = ["1207505828"];

const NightfallLeaderboards: React.FC = () => {
  const [nightfallLeaderboardData] = useCachedApi<NightfallLeaderboardResponse>(
    "https://api.clan.report/nightfall-score-dawn.json"
  );

  const leaderboardsByNightfall =
    nightfallLeaderboardData &&
    nightfallLeaderboardData.rows.reduce<{
      [key: string]: NightfallLeaderboardEntry[];
    }>((acc, entry) => {
      const newAcc = { ...acc };
      newAcc[entry.referenceId] = newAcc[entry.referenceId] || [];
      newAcc[entry.referenceId].push(entry);

      return newAcc;
    }, {});

  return (
    <div className={s.nightfalls}>
      {leaderboardsByNightfall &&
        Object.keys(leaderboardsByNightfall).map(
          referenceId =>
            !NIGHTFALL_BLACKLIST.includes(referenceId) && (
              <Activity
                className={s.nightfallCard}
                activityHash={referenceId}
              />
            )
        )}

      <div className={s.spacerwtf} />
    </div>
  );
};

export default function NightfallLeaderboardsWithDefinitions() {
  return (
    <WithDefinitions tables={["DestinyActivityDefinition"]}>
      <NightfallLeaderboards />
    </WithDefinitions>
  );
}
