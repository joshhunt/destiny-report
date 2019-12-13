import React from "react";

import s from "./styles.module.scss";
import { useDefinitions } from "../../lib/definitions";

const ROOT_TRIUMPH_NODE = 1024788583;

const Node: React.FC<{
  presentationNodeHash: number;
}> = ({ presentationNodeHash }) => {
  const { DestinyPresentationNodeDefinition } = useDefinitions();

  const triumphNode =
    DestinyPresentationNodeDefinition &&
    DestinyPresentationNodeDefinition[presentationNodeHash];

  return triumphNode ? (
    <div className={s.node}>
      <p className={s.nodeHeading}>{triumphNode.displayProperties.name}</p>

      <div>
        {triumphNode.children.presentationNodes.map(child => {
          return <Node presentationNodeHash={child.presentationNodeHash} />;
        })}
      </div>
    </div>
  ) : null;
};

const Triumphs = function() {
  return (
    <div className={s.root}>
      <h2>Triumphs</h2>

      <Node presentationNodeHash={ROOT_TRIUMPH_NODE} />
    </div>
  );
};

export default Triumphs;
