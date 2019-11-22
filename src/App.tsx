import React, { useState, useEffect, useMemo } from "react";
import TimeAgo from "react-timeago";

import s from "./App.module.scss";
import Leaderboard from "./components/Leaderboard";

const LEADERBOARD_SIZES = [20, 100, 999];
const VIEW_MORE_LABELS: Record<string, string> = {
  20: "View more",
  100: "View a lot more",
  999: "Less!!!"
};

const App: React.FC = () => {
  const [leaderboardData, setLeaderboardData] = useState();
  const [apiStatus, setAPIStatus] = useState();
  const [maxLeaderboardSize, setMaxLeaderboardSize] = useState(20);

  useEffect(() => {
    fetch("https://api.clan.report/leaderboards-all.json")
      .then(r => r.json())
      .then(d => setLeaderboardData(d));

    fetch("https://api.clan.report/status.json")
      .then(r => r.json())
      .then(d => setAPIStatus(d));
  }, []);

  const triumphLeaderboard = useMemo(() => {
    const data = [...(leaderboardData || [])];
    return data
      .sort((a, b) => a.collectionRank - b.collectionRank)
      .sort((a, b) => a.triumphRank - b.triumphRank)
      .map(player => ({ ...player, rank: player.triumphRank }))
      .slice(0, maxLeaderboardSize);
  }, [leaderboardData, maxLeaderboardSize]);

  const collectionLeaderboard = useMemo(() => {
    const data = [...(leaderboardData || [])];
    return data
      .sort((a, b) => a.triumphRank - b.triumphRank)
      .sort((a, b) => a.collectionRank - b.collectionRank)
      .map(player => ({ ...player, rank: player.collectionRank }))
      .slice(0, maxLeaderboardSize);
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

      <div className={s.leaderboards}>
        <Leaderboard
          title="Collection"
          players={collectionLeaderboard}
          renderSub={player =>
            `${player.collectionScore.toLocaleString()} items`
          }
        />
        <Leaderboard
          title="Triumphs"
          players={triumphLeaderboard}
          renderSub={player => `${player.triumphScore.toLocaleString()} points`}
        />
      </div>

      <section className={s.section}>
        <button className={s.moreButton} onClick={viewMore}>
          {VIEW_MORE_LABELS[maxLeaderboardSize.toString()]}
        </button>
      </section>

      {apiStatus && (
        <p className={s.explainer}>
          Currently tracking {apiStatus.profileCount.toLocaleString()} profiles,
          last updated <TimeAgo date={apiStatus.latestProfileLastCrawled} />.
        </p>
      )}
    </div>
  );
};

export default App;
