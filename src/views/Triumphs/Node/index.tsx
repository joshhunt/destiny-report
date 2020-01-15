import React, { useEffect, useRef, useCallback } from "react";
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
  isRoot?: boolean;
  presentationNodeHash: number;
}> = ({ isRoot, presentationNodeHash }) => {
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

  // useEffect(() => {
  //   console.log({ isRoot, refCurrent: rootRef.current });

  //   if (isRoot && rootRef.current) {

  //   }
  // }, [isRoot]);

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
        <div className={cx(s.splitHeading, isRoot && s.sticky)}>
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
            isRoot={isRoot}
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
  isRoot?: boolean;
  node: DestinyPresentationNodeDefinition;
  totalChildrenPointScore: number;
}> = ({ isRoot, node, totalChildrenPointScore }) => {
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
            {isRoot && (
              <>
                <strong>{player.profile.data?.userInfo.displayName}</strong>
                <br />
              </>
            )}

            <PointsToggle
              completed={completedScore}
              remaining={remainingScore}
            />
          </div>
        );
      })}
    </div>
  );
};

const PointsToggle: React.FC<{
  completed: number;
  remaining: number;
}> = ({ completed, remaining }) => {
  const settings = useSettings();

  return (
    <span
      onClick={ev =>
        settings.setShowCompletedPoints(!settings.showCompletedPoints)
      }
    >
      {settings.showCompletedPoints ? (
        <span>{completed.toLocaleString()} pts completed</span>
      ) : (
        <span>{remaining.toLocaleString()} pts remaining</span>
      )}
    </span>
  );
};

export default Node;
