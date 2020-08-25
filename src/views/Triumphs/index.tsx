import React, { useMemo, useReducer, useEffect } from "react";
import { withDefinitions } from "../../lib/definitions";

import Node from "./Node";
import {
  settingsContext,
  PlayerDataState,
  PlayerDataAction,
  playerDataContext,
} from "./common";
import s from "./styles.module.scss";
import { getProfile } from "../../lib/destinyApi";
import { DestinyComponentType } from "../../additionalDestinyTypes";
import { usePlayersParam, useLocalStorage } from "../../lib/hooks";

// This can be gotten from the API, settings endpoint
const ROOT_TRIUMPH_NODE = 1024788583;
const ROOT_SEALS_NODE = 1652422747;

function playerDataReducer(
  state: PlayerDataState,
  action: PlayerDataAction
): PlayerDataState {
  return [...state, action.data];
}

const useSortedPlayers = (
  unsortedPlayerData: PlayerDataState,
  players: { membershipId: string }[]
) => {
  return useMemo(() => {
    return unsortedPlayerData.sort(function (a, b) {
      return (
        players.findIndex(
          (p) => p.membershipId === a.profile.data?.userInfo.membershipId
        ) -
        players.findIndex(
          (p) => p.membershipId === b.profile.data?.userInfo.membershipId
        )
      );
    });
  }, [players, unsortedPlayerData]);
};

const Triumphs = function () {
  const [unsortedPlayerData, setPlayerData] = useReducer(playerDataReducer, []);

  const [showZeroPointTriumphs, setShowZeroPointTriumphs] = useLocalStorage(
    "showZeroPointTriumphs",
    false
  );

  const [showCompletedPoints, setShowCompletedPoints] = useLocalStorage(
    "showCompletedPoints",
    false
  );

  const [showCompletedTriumphs, setShowCompletedTriumphs] = useLocalStorage(
    "showCompletedTriumphs",
    false
  );

  const players = usePlayersParam();

  useEffect(() => {
    players.forEach(({ membershipId, membershipType }) => {
      getProfile(membershipType, membershipId, [
        DestinyComponentType.Profiles,
        DestinyComponentType.PresentationNodes,
        DestinyComponentType.Records,
      ]).then((data) => {
        setPlayerData({ key: membershipId, data });
      });
    });
  }, [players]);

  const playerData = useSortedPlayers(unsortedPlayerData, players);

  const settings = useMemo(() => {
    return {
      showZeroPointTriumphs,
      showCompletedPoints,
      showCompletedTriumphs,
      setShowCompletedPoints,
    };
  }, [
    setShowCompletedPoints,
    showCompletedPoints,
    showCompletedTriumphs,
    showZeroPointTriumphs,
  ]);

  return (
    <settingsContext.Provider value={settings}>
      <playerDataContext.Provider value={playerData}>
        <div className={s.root}>
          <h2>Triumphs</h2>

          <label>
            <input
              type="checkbox"
              checked={showZeroPointTriumphs}
              onChange={(ev) => setShowZeroPointTriumphs(ev.target.checked)}
            />{" "}
            Show zero point triumphs
          </label>

          <br />

          <label>
            <input
              type="checkbox"
              checked={showCompletedTriumphs}
              onChange={(ev) => setShowCompletedTriumphs(ev.target.checked)}
            />{" "}
            Show triumphs completed by all
          </label>

          <br />
          <br />

          <div className={s.triumphs}>
            <Node presentationNodeHash={ROOT_TRIUMPH_NODE} isRoot />
            <Node presentationNodeHash={ROOT_SEALS_NODE} isRoot />
          </div>
        </div>
      </playerDataContext.Provider>
    </settingsContext.Provider>
  );
};

export default withDefinitions(Triumphs, [
  "DestinyRecordDefinition",
  "DestinyObjectiveDefinition",
  "DestinyPresentationNodeDefinition",
]);
