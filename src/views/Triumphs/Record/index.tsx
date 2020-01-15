import React from "react";
import cx from "classnames";
import { DestinyRecordDefinition } from "bungie-api-ts/destiny2/interfaces";

import { useDefinitions } from "../../../lib/definitions";

import s from "./styles.module.scss";
import {
  useSettings,
  scoreFromRecord,
  usePlayerData,
  triumphsFromProfile,
  recordIsCompleted
} from "../common";

const RecordBody: React.FC<{
  record: DestinyRecordDefinition;
  totalPointScore: number;
}> = ({ record, totalPointScore }) => {
  return (
    <div className={s.recordBody}>
      <div className={s.recordTitle}>
        {record.displayProperties.name}
        {" - "}
        <span className={s.recordTotalPointScore}>{totalPointScore} pts</span>
      </div>

      <div className={s.recordDescription}>
        {record.displayProperties.description}
      </div>
    </div>
  );
};

const RecordPlayerData: React.FC<{ record: DestinyRecordDefinition }> = ({
  record
}) => {
  const playerData = usePlayerData();

  return (
    <div className={s.players}>
      {Object.values(playerData).map(player => {
        if (!player) {
          return undefined;
        }

        const playerTriumphs = triumphsFromProfile(player);
        const recordInstance = playerTriumphs[record.hash];
        const isComplete =
          recordInstance && recordIsCompleted(recordInstance.state);

        return (
          <div className={cx(s.player, isComplete ? s.complete : s.incomplete)}>
            {isComplete ? "completed" : "incomplete"}
          </div>
        );
      })}
    </div>
  );
};

const Record: React.FC<{ recordHash: number }> = ({ recordHash }) => {
  const { showZeroPointTriumphs } = useSettings();
  const { DestinyRecordDefinition: recordDefs } = useDefinitions();
  const record = recordDefs && recordDefs[recordHash];
  const totalPointScore = (record && scoreFromRecord(record)) || 0;

  if (!record || (!showZeroPointTriumphs && totalPointScore === 0)) {
    return null;
  }

  return (
    <div className={s.root}>
      <RecordBody record={record} totalPointScore={totalPointScore} />

      <RecordPlayerData record={record} />
    </div>
  );
};

export default Record;
