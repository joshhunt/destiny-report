import React, { useMemo, useReducer, useEffect, useState } from "react";
import { withDefinitions } from "../../lib/definitions";
import Modal from "react-modal";

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
import Icon from "../../components/Icon";
import PlayerSearch, { SearchResult } from "../../components/PlayerSearch";
import { useHistory, useLocation } from "react-router-dom";

function playerDataReducer(
  state: PlayerDataState,
  action: PlayerDataAction
): PlayerDataState {
  const index = state.findIndex(
    (p) =>
      p.profile.data?.userInfo.membershipId ===
      action.data.profile.data?.userInfo.membershipId
  );

  const working = [...state];

  if (index > -1) {
    working[index] = action.data;
  } else {
    working.push(action.data);
  }

  return working;
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
  const [modalIsOpen, setModalOpen] = React.useState(false);
  const history = useHistory();
  const rlocation = useLocation();

  const [bungieSettings, setBungieSettings] =
    useState<CoreSettingsConfiguration>();
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

  const setActiveProfiles = (pp: any[]) => {
    const newPlayersParam = pp
      .map((player) => `${player.membershipType}/${player.membershipId}`)
      .join(",");

    history.replace(`${rlocation.pathname}?players=${newPlayersParam}`);
  };

  const addNewPlayer = (player: SearchResult) => {
    setActiveProfiles([...players, player]);
  };

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
  const rootSeasonalChallengesHash =
    bungieSettings?.destiny2CoreSettings
      ?.seasonalChallengesPresentationNodeHash;

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

          <button
            className={s.addPlayerButton}
            onClick={() => setModalOpen(true)}
          >
            Add player
          </button>

          <br />
          <br />

          <div className={s.triumphs}>
            {rootTriumphsNodeHash && (
              <Node presentationNodeHash={rootTriumphsNodeHash} isRoot />
            )}
            {rootSealsNodeHash && (
              <Node presentationNodeHash={rootSealsNodeHash} isRoot />
            )}
            {rootSeasonalChallengesHash && (
              <Node presentationNodeHash={rootSeasonalChallengesHash} isRoot />
            )}
          </div>
        </div>

        <Modal
          isOpen={modalIsOpen}
          onRequestClose={() => setModalOpen(false)}
          className={s.modal}
          overlayClassName={s.modalOverlay}
          contentLabel="Search for a player"
        >
          <div className={s.modalHeader}>
            <h2 className={s.modalTitle}>Search for player</h2>
            <button
              className={s.modalClose}
              onClick={() => setModalOpen(false)}
            >
              <div className={s.modalCloseInner}>
                <Icon className={s.modalCloseIcon} name="times" />
              </div>
            </button>
          </div>

          <PlayerSearch onPlayerSelected={addNewPlayer} />
        </Modal>
      </playerDataContext.Provider>
    </settingsContext.Provider>
  );
};

export default withDefinitions(Triumphs, [
  "DestinyRecordDefinition",
  "DestinyObjectiveDefinition",
  "DestinyPresentationNodeDefinition",
]);
