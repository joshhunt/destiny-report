import React from "react";
import { DestinyRecordDefinition } from "bungie-api-ts/destiny2/interfaces";

import { useDefinitions } from "../../../lib/definitions";
import RecordPlayerData from "./RecordPlayerData";

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

const Record: React.FC<{ recordHash: number }> = ({ recordHash }) => {
  const playerData = usePlayerData();
  const { showZeroPointTriumphs, showCompletedTriumphs } = useSettings();
  const { DestinyRecordDefinition: recordDefs } = useDefinitions();
  const record = recordDefs && recordDefs[recordHash];
  const totalPointScore = (record && scoreFromRecord(record)) || 0;

  if (!record || (!showZeroPointTriumphs && totalPointScore === 0)) {
    return null;
  }

  const allCompleted = playerData.every(profile => {
    const playerTriumphs = triumphsFromProfile(profile);
    const recordInstance = playerTriumphs[record.hash];
    return recordInstance && recordIsCompleted(recordInstance.state);
  });

  if (!showCompletedTriumphs && allCompleted) {
    return null;
  }

  return (
    <div className={s.root}>
      <RecordBody record={record} totalPointScore={totalPointScore} />

      <RecordPlayerData playerData={playerData} record={record} />
    </div>
  );
};

export default Record;
