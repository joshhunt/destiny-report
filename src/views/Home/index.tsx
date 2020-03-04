import React from "react";
import TimeAgo from "react-timeago";
import { useParams } from "react-router-dom";

import GlobalLeaderboards from "../../components/GlobalLeaderboards";
import NightfallLeaderboards from "../../components/NightfallLeaderboards";
import Search from "../../components/Search";
import { useLeaderboards, useApiStatus } from "../../appHooks";

import s from "./styles.module.scss";
import { useProfileAPIData } from "./hooks";

const isTruthy = <T,>(v: T | undefined): v is T => !!v;

interface RouteParams {
  membershipId?: string;
  membershipType?: string;
}

const App: React.FC = () => {
  const [leaderboardData] = useLeaderboards();
  const [apiStatus] = useApiStatus();

  const { membershipType, membershipId } = useParams<RouteParams>();
  const profiles = useProfileAPIData({ membershipId, membershipType });

  const loadedProfiles = profiles
    .map(v => v.response)
    .filter(v => v?.error)
    .filter(isTruthy);

  const hasErrors = profiles.some(v => v.response?.error);
  const isLoading = profiles.some(v => v.loading);

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

        {hasErrors && (
          <p className={s.explainer}>
            Unable to retrieve ranks for a player. Is the profile set to
            private?
          </p>
        )}
      </section>

      <section className={s.leaderboards}>
        <GlobalLeaderboards
          isLoading={isLoading}
          leaderboards={leaderboardData}
          extraProfiles={loadedProfiles}
        />
      </section>

      <section>
        <div className={s.container}>
          <h2>Nightfalls</h2>
        </div>

        <NightfallLeaderboards />
      </section>

      <p className={s.footer}>Made by joshhunt</p>
    </>
  );
};

export default App;
