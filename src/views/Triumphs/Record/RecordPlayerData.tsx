import React from "react";
import cx from "classnames";
import { DestinyRecordDefinition } from "bungie-api-ts/destiny2/interfaces";

import s from "./styles.module.scss";
import {
  triumphsFromProfile,
  recordIsCompleted,
  PlayerDataState,
} from "../common";
import { useDefinitions } from "../../../lib/definitions";
import PrettyNumber from "../../../components/PrettyNumber";

const RecordPlayerData: React.FC<{
  record: DestinyRecordDefinition;
  playerData: PlayerDataState;
}> = ({ record, playerData }) => {
  const { DestinyObjectiveDefinition } = useDefinitions();

  return (
    <div className={s.players}>
      {playerData.map((player) => {
        if (!player || !DestinyObjectiveDefinition) {
          return null;
        }

        const playerTriumphs = triumphsFromProfile(player);
        const recordInstance = playerTriumphs[record.hash];
        const isComplete =
          recordInstance && recordIsCompleted(recordInstance.state);

        if (!recordInstance) {
          return null;
        }

        const intervals = recordInstance.intervalObjectives;

        const objectiveInstances = intervals
          ? intervals.slice(intervals.length - 1)
          : recordInstance.objectives;

        const lastInvervalCompletionValue =
          intervals && objectiveInstances[0]?.completionValue;

        return (
          <div className={cx(s.player, isComplete ? s.complete : s.incomplete)}>
            {(objectiveInstances ?? []).map((objectiveInstance) => {
              const objectiveDef =
                DestinyObjectiveDefinition[objectiveInstance.objectiveHash];

              return (
                objectiveDef && (
                  <div className={s.objective}>
                    <div
                      className={
                        objectiveInstance.complete
                          ? s.objectiveIndicatorComplete
                          : s.objectiveIndicatorIncomplete
                      }
                    ></div>

                    <div className={s.objectiveBar}>
                      <div
                        className={s.objectiveTrack}
                        style={{
                          width: `${
                            Math.min(
                              (objectiveInstance.progress || 0) /
                                objectiveInstance.completionValue
                            ) * 100
                          }%`,
                        }}
                      />

                      {intervals &&
                        intervals
                          .slice(0, intervals.length - 1)
                          .map((interval) => {
                            const left =
                              (interval.completionValue /
                                lastInvervalCompletionValue) *
                              100;
                            return (
                              <div
                                className={s.intervalMarker}
                                style={{ left: `${left}%` }}
                              />
                            );
                          })}

                      <div className={s.objectiveName}>
                        {objectiveDef.progressDescription || "Completed"}
                      </div>

                      <div className={s.objectiveScore}>
                        <PrettyNumber
                          number={objectiveInstance.progress ?? 0}
                        />
                        {" / "}
                        <PrettyNumber
                          number={objectiveInstance.completionValue}
                        />
                      </div>
                    </div>
                  </div>
                )
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

export default RecordPlayerData;
