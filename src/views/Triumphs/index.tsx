import React from "react";

import s from "./styles.module.scss";
import { useDefinitions } from "../../lib/definitions";
import { DestinyPresentationNodeDefinition as DestinyPresentationNodeDefinitionItem } from "bungie-api-ts/destiny2/interfaces";

type DestinyPresentationNodeDefinition = Record<
  number,
  DestinyPresentationNodeDefinitionItem | undefined
>;

type Defs = {
  DestinyPresentationNodeDefinition?: DestinyPresentationNodeDefinition;
};

const ROOT_TRIUMPH_NODE = 1024788583;

const Node: React.FC<{
  presentationNodeHash: number;
  presentationNodeDefinitions: DestinyPresentationNodeDefinition;
}> = ({ presentationNodeHash, presentationNodeDefinitions }) => {
  const triumphNode =
    presentationNodeDefinitions &&
    presentationNodeDefinitions[presentationNodeHash];

  return triumphNode ? (
    <div className={s.node}>
      <p className={s.nodeHeading}>{triumphNode.displayProperties.name}</p>

      <div>
        {triumphNode.children.presentationNodes.map(child => {
          return (
            <Node
              presentationNodeHash={child.presentationNodeHash}
              presentationNodeDefinitions={presentationNodeDefinitions}
            />
          );
        })}
      </div>
    </div>
  ) : null;
};

const Triumphs = function() {
  const {
    DestinyPresentationNodeDefinition: presentationNodeDefinitions
  } = useDefinitions("DestinyPresentationNodeDefinition") as Defs;

  return (
    <div className={s.root}>
      <h2>Triumphs</h2>

      {presentationNodeDefinitions && (
        <Node
          presentationNodeHash={ROOT_TRIUMPH_NODE}
          presentationNodeDefinitions={presentationNodeDefinitions}
        />
      )}
    </div>
  );
};

export default Triumphs;
