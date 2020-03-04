import React from "react";
import TimeAgo from "react-timeago";
import { useParams } from "react-router-dom";

import GlobalLeaderboards from "../../components/GlobalLeaderboards";
import NightfallLeaderboards from "../../components/NightfallLeaderboards";
import Search from "../../components/Search";
import SiteHeader from "../../components/SiteHeader";

import { useLeaderboards, useApiStatus } from "../../appHooks";
import { useProfileAPIData } from "./hooks";
import { useBungieAuth } from "../../lib/bungieAuth";

import s from "./styles.module.scss";

const isTruthy = <T,>(v: T | undefined): v is T => !!v;

interface RouteParams {
  membershipId?: string;
  membershipType?: string;
}

const App: React.FC = () => {
  const { isAuthenticated } = useBungieAuth();
  const [leaderboardData] = useLeaderboards();
  const [apiStatus] = useApiStatus();

  const { membershipType, membershipId } = useParams<RouteParams>();
  const profiles = useProfileAPIData({ membershipId, membershipType });

  const loadedProfiles = profiles
    .map(v => v.response)
    .filter(v => !v?.error)
    .filter(isTruthy);

  const hasErrors = profiles.some(v => v.error);
  const isLoading = profiles.some(v => v.loading);

  const clearLogout = () => {
    window.localStorage.removeItem("auth");
    window.location.reload();
  };

  return (
    <>
      <SiteHeader />

      <section className={s.container}>
        <Search className={s.search} isAuthenticated={isAuthenticated} />

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

      {isAuthenticated && (
        <p className={s.footer}>
          <button onClick={clearLogout} className={s.button}>
            Log out from Bungie.net
          </button>
        </p>
      )}

      <p className={s.footer}>Made by joshhunt</p>
    </>
  );
};

export default App;
