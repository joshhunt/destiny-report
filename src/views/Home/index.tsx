import React from "react";
import cx from "classnames";
import TimeAgo from "react-timeago";
import { useParams } from "react-router-dom";

import GlobalLeaderboards from "../../components/GlobalLeaderboards";
import NightfallLeaderboards from "../../components/NightfallLeaderboards";
import Search from "../../components/Search";
import SiteHeader from "../../components/SiteHeader";

import { useLeaderboards, useApiStatus } from "../../appHooks";
import {
  useAdditionalProfiles,
  useAuthenticatedBungieMembership
} from "./hooks";
import { useBungieAuth } from "../../lib/bungieAuth";

import s from "./styles.module.scss";

const isTruthy = <T,>(v: T | undefined): v is T => !!v;

interface RouteParams {
  membershipId?: string;
  membershipType?: string;
}

const App: React.FC = () => {
  const { isAuthenticated } = useBungieAuth();
  const [leaderboardData, isStale] = useLeaderboards();
  const [apiStatus] = useApiStatus();

  const authedMembership = useAuthenticatedBungieMembership();
  const { membershipType, membershipId } = useParams<RouteParams>();
  const profiles = useAdditionalProfiles(
    { membershipId, membershipType },
    authedMembership
  );

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

      <section className={cx(s.leaderboards, isStale ? s.stale : s.notStale)}>
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
