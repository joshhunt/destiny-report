import React from "react";
import Search from "../../components/Search";
import SiteHeader from "../../components/SiteHeader";

import s from "./styles.module.scss";

const App: React.FC = () => {
  return (
    <>
      <SiteHeader />

      <section className={s.container}>
        <Search className={s.search} />
      </section>

      <section className={s.container}>
        <p style={{ textAlign: "center" }}>RIP</p>
      </section>

      <p className={s.footer}>Made by joshhunt</p>
    </>
  );
};

export default App;
