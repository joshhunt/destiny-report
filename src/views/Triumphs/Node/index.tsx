import React from "react";
import { useDefinitions } from "../../../lib/definitions";

import Record from "../Record";
import {
  useLocalStorage,
  scoreFromRecord,
  useSettings,
  usePlayerData,
  calculateCompletedScoreFromNode
} from "../common";
import s from "./styles.module.scss";
import cx from "classnames";
import { DestinyPresentationNodeDefinition } from "bungie-api-ts/destiny2/interfaces";
import {
  DestinyRecordDefinitionCollection,
  DestinyPresentationNodeDefinitionCollection
} from "../../../lib/definitions/types";

const scoreCache: Record<string, number> = {};
function scoreFromPresentationNode(
  node: DestinyPresentationNodeDefinition,
  nodeDefs: DestinyPresentationNodeDefinitionCollection,
  recordDefs: DestinyRecordDefinitionCollection
): number {
  if (scoreCache[node.hash]) {
    const cached = scoreCache[node.hash];
    return cached;
  }

  let score = 0;
  node.children.presentationNodes.forEach(({ presentationNodeHash }) => {
    const childNode = nodeDefs[presentationNodeHash];
    score += childNode
      ? scoreFromPresentationNode(childNode, nodeDefs, recordDefs)
      : 0;
  });

  node.children.records.forEach(({ recordHash }) => {
    const childRecord = recordDefs[recordHash];
    score += childRecord ? scoreFromRecord(childRecord) : 0;
  });

  scoreCache[node.hash] = score;

  return score;
}

const Node: React.FC<{
  presentationNodeHash: number;
}> = ({ presentationNodeHash }) => {
  const { showZeroPointTriumphs } = useSettings();
  const {
    DestinyPresentationNodeDefinition: nodeDefs,
    DestinyRecordDefinition: recordDefs
  } = useDefinitions();
  const [isCollapsed, setIsCollapsed] = useLocalStorage(
    `collapsed_${presentationNodeHash}`,
    false
  );
  const node = nodeDefs && nodeDefs[presentationNodeHash];

  const totalChildrenPointScore =
    (node &&
      nodeDefs &&
      recordDefs &&
      scoreFromPresentationNode(node, nodeDefs, recordDefs)) ||
    0;

  if (!showZeroPointTriumphs && totalChildrenPointScore === 0) {
    return null;
  }

  return node ? (
    <div className={cx(s.node, isCollapsed && s.isCollapsed)}>
      <div className={s.side}>
        <button
          className={s.collapseButton}
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? "expand" : "collapse"}
        </button>
      </div>

      <div className={s.main}>
        <div className={s.splitHeading}>
          <p
            className={s.nodeHeading}
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {node.displayProperties.name}
            {" - "}
            <span className={s.nodePointScore}>
              {totalChildrenPointScore.toLocaleString()} pts
            </span>
          </p>

          <NodePlayerData
            node={node}
            totalChildrenPointScore={totalChildrenPointScore}
          />
        </div>

        {!isCollapsed && (
          <div className={s.nodeChildren}>
            {node.children.presentationNodes.map(child => {
              return (
                <Node
                  key={child.presentationNodeHash}
                  presentationNodeHash={child.presentationNodeHash}
                />
              );
            })}

            {node.children.records.map(child => {
              return (
                <Record key={child.recordHash} recordHash={child.recordHash} />
              );
            })}
          </div>
        )}
      </div>
    </div>
  ) : null;
};

const NodePlayerData: React.FC<{
  node: DestinyPresentationNodeDefinition;
  totalChildrenPointScore: number;
}> = ({ node, totalChildrenPointScore }) => {
  const playerData = usePlayerData();

  const {
    DestinyPresentationNodeDefinition: nodeDefs,
    DestinyRecordDefinition: recordDefs
  } = useDefinitions();

  if (!nodeDefs || !recordDefs) {
    return null;
  }

  return (
    <div className={s.players}>
      {Object.values(playerData).map(player => {
        if (!player) {
          return undefined;
        }

        const completedScore = calculateCompletedScoreFromNode(
          node,
          player,
          nodeDefs,
          recordDefs
        );

        const remainingScore = totalChildrenPointScore - completedScore;

        return (
          <div className={s.player}>
            <strong>{player.profile.data?.userInfo.displayName}</strong>
            <br />
            {completedScore.toLocaleString()} pts
            <br />
            {remainingScore.toLocaleString()} pts remaining.
          </div>
        );
      })}
    </div>
  );
};

export default Node;
