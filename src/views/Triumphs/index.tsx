import React from "react";

import s from "./styles.module.scss";
import { useDefinitions } from "../../lib/definitions";

const Triumphs = function() {
  const { DestinyPresentationNodeDefinition } = useDefinitions(
    "DestinyPresentationNodeDefinition"
  );

  console.log(
    "DestinyPresentationNodeDefinition:",
    DestinyPresentationNodeDefinition
  );

  return (
    <div className={s.root}>
      <h2>Triumphs</h2>
    </div>
  );
};

export default Triumphs;
