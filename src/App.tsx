import React, { useState, useEffect, useMemo } from "react";
import TimeAgo from "react-timeago";

import s from "./App.module.scss";
import Leaderboard from "./components/Leaderboard";

const App: React.FC = () => {
  const [leaderboardData, setLeaderboardData] = useState();
  const [apiStatus, setAPIStatus] = useState();

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
      .slice(0, 20);
  }, [leaderboardData]);

  const collectionLeaderboard = useMemo(() => {
    const data = [...(leaderboardData || [])];
    return data
      .sort((a, b) => a.triumphRank - b.triumphRank)
      .sort((a, b) => a.collectionRank - b.collectionRank)
      .map(player => ({ ...player, rank: player.collectionRank }))
      .slice(0, 20);
  }, [leaderboardData]);

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
