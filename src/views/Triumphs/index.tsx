import React from "react";

import s from "./styles.module.scss";
import { useDefinitions } from "../../lib/definitions";
import { DestinyPresentationNodeDefinition as IDestinyPresentationNodeDefinition } from "bungie-api-ts/destiny2/interfaces";

type Defs = {
  DestinyPresentationNodeDefinition: Record<
    string,
    IDestinyPresentationNodeDefinition
  >;
};

const Triumphs = function() {
  const { DestinyPresentationNodeDefinition } = useDefinitions(
    "DestinyPresentationNodeDefinition"
  ) as Defs;

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
