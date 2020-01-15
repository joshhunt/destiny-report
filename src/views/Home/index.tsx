import React, { useState, useEffect, useMemo, useReducer } from "react";
import TimeAgo from "react-timeago";

import Leaderboard from "../../components/Leaderboard";
import NightfallLeaderboards from "../../components/NightfallLeaderboards";
import Search from "../../components/Search";
import { LeaderboardEntry, DestinyCrawlProfileResponse } from "../../types";
import { useLeaderboards, useApiStatus } from "../../appHooks";

import s from "./styles.module.scss";
import { useParams } from "react-router-dom";

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

  let { membershipType, membershipId } = useParams<{
    membershipId?: string;
    membershipType?: string;
  }>();

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
    if (!(membershipType && membershipId)) {
      return;
    }

    const key = membershipId;

    setDestinyCrawlLoading(true);

    fetch(`https://api.clan.report/i/user/${membershipType}/${membershipId}`)
      .then(r => r.json())
      .then(d =>
        dispatchDestinyCrawl({
          key,
          loading: false,
          response: d
        })
      )
      .finally(() => setDestinyCrawlLoading(false));
  }, [membershipType, membershipId]);

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
    <>
      <section className={s.container}>
        <h1 className={s.title}>destiny.report</h1>

        <Search className={s.search} />

        {apiStatus && (
          <p className={s.explainer}>
            Currently tracking {apiStatus.profileCount.toLocaleString()}{" "}
            profiles, leaderboards last updated{" "}
            <TimeAgo date={apiStatus.latestProfileLastCrawled} />.
          </p>
        )}

        {playersWithErrors.length > 0 && (
          <p className={s.explainer}>
            Unable to retrieve ranks for a player. Is the profile set to
            private?
          </p>
        )}
      </section>

      <section className={s.container}>
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

        <section className={s.buttonSection}>
          <button className={s.moreButton} onClick={viewMore}>
            {VIEW_MORE_LABELS[maxLeaderboardSize.toString()]}
          </button>
        </section>
      </section>

      <br />
      <br />

      <section>
        <div className={s.container}>
          <h2>Nightfalls</h2>
        </div>

        <NightfallLeaderboards />
      </section>

      <p className={s.explainer}>
        <br />
        <br />
        <br />
        <br />
        Made by joshhunt
        <br />
      </p>
    </>
  );
};

export default App;