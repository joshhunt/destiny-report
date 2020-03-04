import React from "react";

import s from "./styles.module.scss";

const SiteHeader: React.FC = () => {
  return (
    <div className={s.root}>
      <h1 className={s.title}>destiny.report</h1>
    </div>
  );
};

export default SiteHeader;
