import React from "react";
import { Link, useHistory } from "react-router-dom";

import SiteHeader from "../../components/SiteHeader";
import PlayerSearch, { SearchResult } from "../../components/PlayerSearch";

import s from "./styles.module.scss";

const App: React.FC = () => {
  const history = useHistory();

  const onPlayerSelected = (player: SearchResult) => {
    history.push(
      `/nightfalls?players=${player.membershipType}/${player.membershipId}`
    );
  };

  return (
    <>
      <SiteHeader />

      <section className={s.searchContainer}>
        <PlayerSearch onPlayerSelected={onPlayerSelected} />
      </section>

      <section className={s.container}>
        <p style={{ textAlign: "center" }}>
          <Link className={s.nightfalls} to={"/nightfalls"}>
            Compare Nightfalls
          </Link>
        </p>
      </section>

      <section className={s.container}>
        <p style={{ textAlign: "center", marginTop: 64 }}>RIP</p>
      </section>

      <p className={s.footer}>Made by joshhunt</p>
    </>
  );
};

export default App;
