import React, { useMemo, useReducer, useEffect, useState } from "react";
import { withDefinitions } from "../../lib/definitions";

import Node from "./Node";
import {
  settingsContext,
  PlayerDataState,
  PlayerDataAction,
  playerDataContext,
} from "./common";
import s from "./styles.module.scss";
import { getCachedSettings, getProfile } from "../../lib/destinyApi";
import { DestinyComponentType } from "../../additionalDestinyTypes";
import { usePlayersParam, useLocalStorage } from "../../lib/hooks";
import { CoreSettingsConfiguration } from "bungie-api-ts/core/interfaces";

// This can be gotten from the API, settings endpoint
// const ROOT_TRIUMPH_NODE = 1024788583;
// const ROOT_SEALS_NODE = 1652422747;

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
  const [bungieSettings, setBungieSettings] = useState<
    CoreSettingsConfiguration
  >();
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
    getCachedSettings((settings) => setBungieSettings(settings));
  }, []);

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

  const rootTriumphsNodeHash =
    bungieSettings?.destiny2CoreSettings.activeTriumphsRootNodeHash;
  const rootSealsNodeHash = bungieSettings?.destiny2CoreSettings.medalsRootNode;

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
            {rootTriumphsNodeHash && (
              <Node presentationNodeHash={rootTriumphsNodeHash} isRoot />
            )}
            {/* {rootSealsNodeHash && (
              <Node presentationNodeHash={rootSealsNodeHash} isRoot />
            )} */}
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
