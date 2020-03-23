import { useContext, useMemo, useState, createContext } from "react";
import memoize from "lodash/memoize";
import {
  DestinyRecordDefinition,
  DestinyProfileResponse,
  DestinyRecordComponent,
  DestinyPresentationNodeDefinition
} from "bungie-api-ts/destiny2/interfaces";
import { DestinyRecordState } from "../../additionalDestinyTypes";
import {
  DestinyPresentationNodeDefinitionCollection,
  DestinyRecordDefinitionCollection
} from "../../lib/definitions/types";

export interface TriumphsSettings {
  showZeroPointTriumphs?: boolean;
  showCompletedTriumphs?: boolean;
  showCompletedPoints?: boolean;
  setShowCompletedPoints: (value: boolean) => void;
}

export type PlayerDataState = DestinyProfileResponse[];
export interface PlayerDataAction {
  key: string;
  data: DestinyProfileResponse;
}

export const settingsContext = createContext<TriumphsSettings>({
  setShowCompletedPoints: () => {}
});
export const useSettings = () => useContext(settingsContext);

export const playerDataContext = createContext<PlayerDataState>([]);
export const usePlayerData = () => useContext(playerDataContext);

export const flagEnum = (state: number, value: number) => !!(state & value);

export const enumerateRecordState = (state: number) => ({
  none: flagEnum(state, DestinyRecordState.None),
  recordRedeemed: flagEnum(state, DestinyRecordState.RecordRedeemed),
  rewardUnavailable: flagEnum(state, DestinyRecordState.RewardUnavailable),
  objectiveNotCompleted: flagEnum(
    state,
    DestinyRecordState.ObjectiveNotCompleted
  ),
  obscured: flagEnum(state, DestinyRecordState.Obscured),
  invisible: flagEnum(state, DestinyRecordState.Invisible),
  entitlementUnowned: flagEnum(state, DestinyRecordState.EntitlementUnowned),
  canEquipTitle: flagEnum(state, DestinyRecordState.CanEquipTitle)
});

export const recordIsCompleted = (state: number) => {
  const enumerated = enumerateRecordState(state);
  return enumerated.recordRedeemed || !enumerated.objectiveNotCompleted;
};

const profileScoreCache: Record<string, Record<string, number>> = {};
export function calculateCompletedScoreFromNode(
  node: DestinyPresentationNodeDefinition,
  profile: DestinyProfileResponse,
  nodeDefs: DestinyPresentationNodeDefinitionCollection,
  recordDefs: DestinyRecordDefinitionCollection
) {
  const membershipId = profile.profile.data?.userInfo.membershipId || "0";
  profileScoreCache[membershipId] = profileScoreCache[membershipId] || {};

  if (profileScoreCache[membershipId].hasOwnProperty(node.hash)) {
    return profileScoreCache[membershipId][node.hash];
  }

  const triumphs = triumphsFromProfile(profile);

  let score = 0;

  node.children.presentationNodes.forEach(({ presentationNodeHash }) => {
    const childNode = nodeDefs[presentationNodeHash];
    score += childNode
      ? calculateCompletedScoreFromNode(
          childNode,
          profile,
          nodeDefs,
          recordDefs
        )
      : 0;
  });

  node.children.records.forEach(({ recordHash }) => {
    const record = recordDefs[recordHash];
    const instance = triumphs[recordHash];
    const isCompleted = instance && recordIsCompleted(instance.state);

    if (!record || !instance) {
      return;
    }

    const completedScore = record.completionInfo?.ScoreValue || 0;
    const basicScore = isCompleted ? completedScore : 0;
    const intervalScore =
      instance.intervalObjectives &&
      instance.intervalObjectives.reduce((acc, interval, index) => {
        if (isCompleted || interval.complete) {
          return (
            acc +
            record.intervalInfo.intervalObjectives[index].intervalScoreValue
          );
        }

        return acc;
      }, 0);

    score += basicScore + (intervalScore || 0);
  });

  profileScoreCache[membershipId][node.hash] = score;

  return score;
}

function _triumphsFromProfile(profile: DestinyProfileResponse) {
  const records: Record<string, DestinyRecordComponent | undefined> = {};

  Object.entries(profile.profileRecords.data?.records || {}).forEach(
    ([recordHash, recordInstance]) => {
      records[recordHash] = recordInstance;
    }
  );

  Object.values(profile.characterRecords.data || {}).forEach(
    characterRecords => {
      Object.entries(characterRecords.records).forEach(
        ([recordHash, recordInstance]) => {
          // If the record is already in the object (from profile, or another character), then
          // abort adding if the existing record is 'completed
          if (records[recordHash]) {
            const existingRecord = records[recordHash];
            const existingCompleted =
              existingRecord && recordIsCompleted(existingRecord.state);

            if (existingCompleted) {
              return;
            }
          }

          records[recordHash] = recordInstance;
        }
      );
    }
  );

  return records;
}

memoize.Cache = WeakMap;
export const triumphsFromProfile = memoize(_triumphsFromProfile);

export function useLocalStorage<Value>(
  key: string,
  initialValue: Value
): [Value, (v: Value) => void] {
  const previousInitialValue = useMemo(() => {
    const previous = window.localStorage.getItem(key);
    return previous && JSON.parse(previous);
  }, [key]);

  const [value, setValue] = useState<Value>(
    previousInitialValue || initialValue
  );

  const setter = (newValue: Value) => {
    setValue(newValue);
    window.localStorage.setItem(key, JSON.stringify(newValue));
  };

  return [value, setter];
}

// Should this be memoized?
const scoreCache: Record<string, number> = {};
export const scoreFromRecord = (record: DestinyRecordDefinition) => {
  if (scoreCache[record.hash]) {
    return scoreCache[record.hash];
  }

  const intervalScore = record.intervalInfo?.intervalObjectives.reduce(
    (acc, interval) => acc + interval.intervalScoreValue,
    0
  );

  return intervalScore || (record.completionInfo?.ScoreValue ?? 0);
};
