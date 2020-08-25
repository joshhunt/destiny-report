import React from "react";
import { useDefinitions } from "../../../lib/definitions";

import Record from "../Record";
import {
  scoreFromRecord,
  useSettings,
  usePlayerData,
  calculateCompletedScoreFromNode,
} from "../common";
import s from "./styles.module.scss";
import cx from "classnames";
import { DestinyPresentationNodeDefinition } from "bungie-api-ts/destiny2/interfaces";
import {
  DestinyRecordDefinitionCollection,
  DestinyPresentationNodeDefinitionCollection,
} from "../../../lib/definitions/types";
import { useLocalStorage } from "../../../lib/hooks";

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
  const { showZeroPointTriumphs, showCompletedTriumphs } = useSettings();
  const playerData = usePlayerData();

  const {
    DestinyPresentationNodeDefinition: nodeDefs,
    DestinyRecordDefinition: recordDefs,
  } = useDefinitions();

  const [isCollapsed, setIsCollapsed] = useLocalStorage(
    `collapsed_${presentationNodeHash}`,
    false
  );

  const node = nodeDefs && nodeDefs[presentationNodeHash];

  if (!(node && nodeDefs && recordDefs)) {
    return null;
  }

  const totalChildrenPointScore =
    scoreFromPresentationNode(node, nodeDefs, recordDefs) || 0;

  if (!showZeroPointTriumphs && totalChildrenPointScore === 0) {
    return null;
  }

  const allZeroPointsRemaining = playerData.every((player) => {
    const completedScore = calculateCompletedScoreFromNode(
      node,
      player,
      nodeDefs,
      recordDefs
    );
    const remaining = totalChildrenPointScore - completedScore;

    return remaining <= 0;
  });

  if (!showCompletedTriumphs && allZeroPointsRemaining) {
    return null;
  }

  return node ? (
    <div className={cx(s.node, isCollapsed && s.isCollapsed)}>
      {!isRoot && (
        <div className={s.side}>
          <button
            className={s.collapseButton}
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? "expand" : "collapse"}
          </button>
        </div>
      )}

      <div className={s.main}>
        <div className={cx(s.splitHeading, isRoot && s.sticky)}>
          <p
            className={s.nodeHeading}
            onClick={() => !isRoot && setIsCollapsed(!isCollapsed)}
          >
            {node.displayProperties.name}

            <span className={s.nodePointScore}>
              {" - "}
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
            {node.children.presentationNodes.map((child) => (
              <Node
                key={child.presentationNodeHash}
                presentationNodeHash={child.presentationNodeHash}
              />
            ))}

            {node.children.records.map((child) => (
              <Record key={child.recordHash} recordHash={child.recordHash} />
            ))}
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
    DestinyRecordDefinition: recordDefs,
  } = useDefinitions();

  if (!nodeDefs || !recordDefs) {
    return null;
  }

  return (
    <div className={s.players}>
      {playerData.map((player, index) => {
        if (!player) {
          return undefined;
        }

        const key = player.profile?.data?.userInfo.membershipId || index;

        const completedScore = calculateCompletedScoreFromNode(
          node,
          player,
          nodeDefs,
          recordDefs
        );

        const remainingScore = totalChildrenPointScore - completedScore;

        return (
          <div className={s.player} key={key}>
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
      onClick={(ev) =>
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
