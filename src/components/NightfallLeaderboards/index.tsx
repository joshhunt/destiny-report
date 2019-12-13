import React from "react";
import { WithDefinitions, useDefinitions } from "../../lib/definitions";
import { useCachedApi } from "../../appHooks";
import {
  NightfallLeaderboardResponse,
  NightfallLeaderboardEntry
} from "../../types";

const NightfallLeaderboards: React.FC = () => {
  const { DestinyActivityDefinition } = useDefinitions();
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
    <div>
      <h2>Nightfalls</h2>

      {DestinyActivityDefinition &&
        leaderboardsByNightfall &&
        Object.entries(leaderboardsByNightfall).map(
          ([referenceId, entries]) => {
            const activity = DestinyActivityDefinition[referenceId];

            return (
              <div key={referenceId}>
                {activity ? (
                  <>
                    <h2>{activity.displayProperties.name}</h2>
                    <p>{activity.displayProperties.description}</p>
                  </>
                ) : (
                  <h2>
                    <em>Unknown activity</em>
                  </h2>
                )}

                <ol>
                  {entries.map(entry => (
                    <li key={entry.pgcrId}>
                      {entry.pgcrId}: {entry.teamScore}
                    </li>
                  ))}
                </ol>
              </div>
            );
          }
        )}
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
