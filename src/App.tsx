import React, { useState, useEffect, useMemo, useReducer } from "react";
import TimeAgo from "react-timeago";

import s from "./App.module.scss";
import Leaderboard from "./components/Leaderboard";
import NightfallLeaderboards from "./components/NightfallLeaderboards";
import Search from "./components/Search";
import { LeaderboardEntry, DestinyCrawlProfileResponse } from "./types";
import { useLocation } from "./history";
import { useLeaderboards, useApiStatus } from "./appHooks";

const SEALS = false;

const LEADERBOARD_SIZES = [20, 100, 999];
const VIEW_MORE_LABELS: Record<string, string> = {
  20: "View more",
  100: "View a lot more",
  999: "Less!!!"
};

type RankField = "triumphRank" | "collectionRank";

const sortLeaderboard = (
  leaderboard: LeaderboardEntry[],
  primaryRank: RankField,
  secondaryRank: RankField,
  size: number
): LeaderboardEntry[] => {
  const data = [...(leaderboard || [])];

  return data
    .sort((a, b) => a[secondaryRank] - b[secondaryRank])
    .sort((a, b) => a[primaryRank] - b[primaryRank])
    .map(player => ({ ...player, rank: player[primaryRank] }))
    .slice(0, size);
};

function leaderboardFromProfiles(
  responses: DestinyCrawlProfileResponse[],
  rankField: RankField
) {
  return responses
    .map(player => {
      const { triumphRank, collectionRank, profile } = player;

      const payload = {
        ...profile,
        triumphRank,
        collectionRank,
        rank: player[rankField]
      };

      return payload;
    })
    .sort((a, b) => a.rank - b.rank);
}

type DestinyRecordStateItem = {
  key: string;
  loading: boolean;
  response: DestinyCrawlProfileResponse;
};

type DestinyCrawlState = Record<string, DestinyRecordStateItem>;

const destinyCrawlReducer = (
  state: DestinyCrawlState,
  data: DestinyRecordStateItem
) => ({
  ...state,
  [data.key]: data
});

const App: React.FC = () => {
  const [destinyCrawl, dispatchDestinyCrawl] = useReducer(
    destinyCrawlReducer,
    {}
  );

  const [destinyCrawlLoading, setDestinyCrawlLoading] = useState<Boolean>(
    false
  );
  const [leaderboardData, staleData] = useLeaderboards();
  const [apiStatus] = useApiStatus();
  const [maxLeaderboardSize, setMaxLeaderboardSize] = useState(
    LEADERBOARD_SIZES[0]
  );
  const _location = useLocation();

  const extraPlayers = Object.values(destinyCrawl)
    .map(v => {
      return v.response;
    })
    .filter(v => !v.error);

  const playersWithErrors = Object.values(destinyCrawl)
    .map(v => {
      return v.response;
    })
    .filter(v => v.error);

  useEffect(() => {
    const matches = _location.pathname.match(/\/(\d\/\d+)/);

    if (!matches) {
      return;
    }

    const [, key] = matches;

    setDestinyCrawlLoading(true);

    fetch(`https://api.clan.report/i/user/${key}`)
      .then(r => r.json())
      .then(d =>
        dispatchDestinyCrawl({
          key,
          loading: false,
          response: d
        })
      )
      .finally(() => setDestinyCrawlLoading(false));
  }, [_location]);

  const triumphLeaderboard = useMemo(() => {
    return sortLeaderboard(
      leaderboardData || [],
      "triumphRank",
      "collectionRank",
      maxLeaderboardSize
    );
  }, [leaderboardData, maxLeaderboardSize]);

  const collectionLeaderboard = useMemo(() => {
    return sortLeaderboard(
      leaderboardData || [],
      "collectionRank",
      "triumphRank",
      maxLeaderboardSize
    );
  }, [leaderboardData, maxLeaderboardSize]);

  function viewMore() {
    const currentIndex = LEADERBOARD_SIZES.indexOf(maxLeaderboardSize);
    setMaxLeaderboardSize(
      LEADERBOARD_SIZES[currentIndex + 1] || LEADERBOARD_SIZES[0]
    );
  }

  return (
    <div className={s.container}>
      <h1 className={s.title}>destiny.report</h1>

      <Search className={s.search} />

      {apiStatus && (
        <p className={s.explainer}>
          Currently tracking {apiStatus.profileCount.toLocaleString()} profiles,
          leaderboards last updated{" "}
          <TimeAgo date={apiStatus.latestProfileLastCrawled} />.
        </p>
      )}

      {playersWithErrors.length > 0 && (
        <p className={s.explainer}>
          Unable to retrieve ranks for a player. Is the profile set to private?
        </p>
      )}

      {SEALS && (
        <section className={s.section} style={{ textAlign: "left" }}>
          <h2>Seals</h2>

          <div className={s.seals}>
            {[
              { title: "Wayfarer", stat: 12 },
              { title: "Blacksmith", stat: 2 },
              { title: "Dredgen", stat: 31 },
              { title: "Cursebreaker", stat: 4 }
            ].map(seal => (
              <div className={s.seal} key={seal.title}>
                <div className={s.sealTitle}>{seal.title}</div>
                <div className={s.sealStat}>{seal.stat}%</div>
              </div>
            ))}
          </div>
        </section>
      )}

      <NightfallLeaderboards />

      <div className={s.leaderboards}>
        <Leaderboard
          className={staleData ? s.staleData : undefined}
          title="Collection"
          players={collectionLeaderboard}
          extraPlayersLoading={destinyCrawlLoading}
          extraPlayers={
            extraPlayers.length > 0
              ? leaderboardFromProfiles(extraPlayers, "collectionRank")
              : undefined
          }
          renderScore={player =>
            `${player.collectionScore.toLocaleString()} items`
          }
        />
        <Leaderboard
          className={staleData ? s.staleData : undefined}
          title="Triumphs"
          players={triumphLeaderboard}
          extraPlayersLoading={destinyCrawlLoading}
          extraPlayers={
            extraPlayers.length > 0
              ? leaderboardFromProfiles(extraPlayers, "triumphRank")
              : undefined
          }
          renderScore={player =>
            `${player.triumphScore.toLocaleString()} points`
          }
        />
      </div>
      <section className={s.section}>
        <button className={s.moreButton} onClick={viewMore}>
          {VIEW_MORE_LABELS[maxLeaderboardSize.toString()]}
        </button>
      </section>

      <p className={s.explainer}>Made by joshhunt</p>
    </div>
  );
};

export default App;
