import React, { useMemo, useState } from "react";

import Leaderboard from "../Leaderboard";
import { LeaderboardEntry, DestinyCrawlProfileResponse } from "../../types";

import s from "./styles.module.scss";

const LEADERBOARD_SIZES = [20, 100, 999];
const VIEW_MORE_LABELS: Record<string, string> = {
  20: "View more",
  100: "View a lot more",
  999: "Less!!!",
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
    .sort((a, b) => {
      const rank = a[primaryRank] - b[primaryRank];
      return rank === 0 ? a[secondaryRank] - b[secondaryRank] : rank;
    })
    .map((player) => ({ ...player, rank: player[primaryRank] }))
    .slice(0, size);
};

function leaderboardFromProfiles(
  responses: DestinyCrawlProfileResponse[],
  rankField: RankField
) {
  return responses
    .map((player) => {
      const { triumphRank, collectionRank, profile } = player;

      const payload = {
        ...profile,
        triumphRank,
        collectionRank,
        rank: player[rankField],
      };

      return payload;
    })
    .sort((a, b) => a.rank - b.rank);
}

interface GlobalLeaderboardProps {
  leaderboards: LeaderboardEntry[];
  isLoading: boolean;
  extraProfiles: DestinyCrawlProfileResponse[];
}

const GlobalLeaderboards: React.FC<GlobalLeaderboardProps> = ({
  leaderboards,
  isLoading,
  extraProfiles,
}) => {
  const [maxLeaderboardSize, setMaxLeaderboardSize] = useState(
    LEADERBOARD_SIZES[0]
  );

  const triumphLeaderboard = useMemo(() => {
    return sortLeaderboard(
      leaderboards || [],
      "triumphRank",
      "collectionRank",
      maxLeaderboardSize
    );
  }, [leaderboards, maxLeaderboardSize]);

  const collectionLeaderboard = useMemo(() => {
    return sortLeaderboard(
      leaderboards || [],
      "collectionRank",
      "triumphRank",
      maxLeaderboardSize
    );
  }, [leaderboards, maxLeaderboardSize]);

  function viewMore() {
    const currentIndex = LEADERBOARD_SIZES.indexOf(maxLeaderboardSize);
    setMaxLeaderboardSize(
      LEADERBOARD_SIZES[currentIndex + 1] || LEADERBOARD_SIZES[0]
    );
  }

  return (
    <>
      <div className={s.leaderboards}>
        <Leaderboard
          title="Collection"
          players={collectionLeaderboard}
          isLoading={isLoading}
          extraPlayers={
            extraProfiles.length > 0
              ? leaderboardFromProfiles(extraProfiles, "collectionRank")
              : undefined
          }
          renderScore={(player) =>
            `${player.collectionScore.toLocaleString()} items`
          }
        />
        <Leaderboard
          title="Triumphs"
          players={triumphLeaderboard}
          isLoading={isLoading}
          extraPlayers={
            extraProfiles.length > 0
              ? leaderboardFromProfiles(extraProfiles, "triumphRank")
              : undefined
          }
          renderScore={(player) =>
            `${player.triumphScore.toLocaleString()} points`
          }
        />
      </div>

      <section className={s.buttonSection}>
        <button className={s.moreButton} onClick={viewMore}>
          {VIEW_MORE_LABELS[maxLeaderboardSize.toString()]}
        </button>
      </section>
    </>
  );
};

export default GlobalLeaderboards;
