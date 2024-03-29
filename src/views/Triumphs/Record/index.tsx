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
  recordIsCompleted,
} from "../common";
import Icon from "../../../components/Icon";
import BungieImage from "../../../components/BungieImage";

const RecordBody: React.FC<{
  record: DestinyRecordDefinition;
  totalPointScore: number;
}> = ({ record, totalPointScore }) => {
  const { DestinyInventoryItemDefinition: itemDefs } = useDefinitions();
  const normalRewards = record?.rewardItems ?? [];
  const intervalRewards =
    record?.intervalInfo?.intervalRewards?.flatMap(
      (v) => v.intervalRewardItems
    ) ?? [];

  const rewards = normalRewards
    .concat(intervalRewards)
    .map((v) => itemDefs?.[v.itemHash])
    .filter(Boolean);

  return (
    <div className={s.recordBody}>
      <div className={s.recordTitle}>
        {record.displayProperties.name || <em>No name</em>}
        {" - "}
        <span className={s.recordTotalPointScore}>{totalPointScore} pts</span>
      </div>

      <div className={s.recordDescription}>
        {record.displayProperties.description}
      </div>

      <div>
        {rewards.map((item) => {
          if (!item) return <div />;
          return (
            <div className={s.reward}>
              <BungieImage
                src={item.displayProperties.icon}
                className={s.rewardIcon}
              />{" "}
              {item.displayProperties.name}
            </div>
          );
        })}
      </div>

      {record.expirationInfo?.hasExpiration && (
        <div className={s.recordExpiration}>
          <Icon name="bomb" regular className={s.expiresIcon} />
          {record.expirationInfo.description}
        </div>
      )}
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

  const allCompleted = playerData.every((profile) => {
    const playerTriumphs = triumphsFromProfile(profile);
    const recordInstance = playerTriumphs[record.hash];
    return recordInstance && recordIsCompleted(recordInstance.state);
  });

  if (!showCompletedTriumphs && playerData.length > 0 && allCompleted) {
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
