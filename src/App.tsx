import React, { useState, useEffect, useMemo } from "react";
import TimeAgo from "react-timeago";

import s from "./App.module.scss";
import Leaderboard from "./components/Leaderboard";
import Search from "./components/Search";
import { LeaderboardEntry } from "./types";
import { useLocation } from "./history";

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

export interface DestinyCrawlProfileResponse {
  profile: DestinyCrawlProfile;
  collectionRank: number;
  triumphRank: number;
}

export interface DestinyCrawlProfile {
  membershipId: string;
  membershipType: number;
  displayName: string;
  lastCrawled: string;
  lastSeen: string;
  lastPlayed: string;
  triumphScore: number;
  collectionScore: number;
  crossSaveOverride: number;
  applicableMembershipTypes: number[];
  createdAt: string;
  updatedAt: string;
}

const prevLeaderboardsJason = window.localStorage.getItem("leaderboards");
const prevLeaderboards =
  prevLeaderboardsJason && JSON.parse(prevLeaderboardsJason);

const prevApiStatusJason = window.localStorage.getItem("apiStatus");
const prevApiStatus = prevApiStatusJason && JSON.parse(prevApiStatusJason);

function leaderboardFromProfile(
  destinyCrawl: DestinyCrawlProfileResponse,
  rankField: RankField
) {
  const { triumphRank, collectionRank, profile } = destinyCrawl;

  return {
    ...profile,
    triumphRank,
    collectionRank,
    rank: destinyCrawl[rankField]
  };
}

const App: React.FC = () => {
  const [destinyCrawl, setDestinyCrawl] = useState<
    DestinyCrawlProfileResponse
  >();
  const [staleData, setStaleData] = useState<Boolean>(true);
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>(
    prevLeaderboards
  );
  const [apiStatus, setAPIStatus] = useState(prevApiStatus);
  const [maxLeaderboardSize, setMaxLeaderboardSize] = useState(20);
  const _location = useLocation();

  useEffect(() => {
    fetch("https://api.clan.report/leaderboards-all.json")
      .then(r => r.json())
      .then(data => {
        setLeaderboardData(data);
        setStaleData(false);
        window.localStorage.setItem("leaderboards", JSON.stringify(data));
      });

    fetch("https://api.clan.report/status.json")
      .then(r => r.json())
      .then(data => {
        setAPIStatus(data);
        window.localStorage.setItem("apiStatus", JSON.stringify(data));
      });
  }, []);

  useEffect(() => {
    const matches = _location.pathname.match(/\/(\d)\/(\d+)/);
    if (!matches) {
      return;
    }

    const [, membershipType, membershipId] = matches;
    fetch(`https://api.clan.report/i/user/${membershipType}/${membershipId}`)
      .then(r => r.json())
      .then(d => setDestinyCrawl(d));
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
    <div className={s.root}>
      <h1 className={s.title}>destiny.report</h1>

      <Search className={s.search} />

      {apiStatus && (
        <p className={s.explainer}>
          Currently tracking {apiStatus.profileCount.toLocaleString()} profiles,
          last updated <TimeAgo date={apiStatus.latestProfileLastCrawled} />.
        </p>
      )}

      <div className={s.leaderboards}>
        <Leaderboard
          className={staleData ? s.staleData : undefined}
          title="Collection"
          players={collectionLeaderboard}
          extraPlayers={
            destinyCrawl && [
              leaderboardFromProfile(destinyCrawl, "collectionRank")
            ]
          }
          renderScore={player =>
            `${player.collectionScore.toLocaleString()} items`
          }
        />
        <Leaderboard
          className={staleData ? s.staleData : undefined}
          title="Triumphs"
          players={triumphLeaderboard}
          extraPlayers={
            destinyCrawl && [
              leaderboardFromProfile(destinyCrawl, "triumphRank")
            ]
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
    </div>
  );
};

export default App;
