import React, { useReducer, useEffect, useMemo } from "react";
import Modal from "react-modal";
import { useHistory, useLocation } from "react-router-dom";
import {
  DestinyProfileResponse,
  DestinyHistoricalStatsPeriodGroup,
} from "bungie-api-ts/destiny2/interfaces";

import { DestinyComponentType } from "../../additionalDestinyTypes";
import { Membership, CharacterActivity } from "../../types";
import { usePlayersParam, useLocalStorage } from "../../lib/hooks";
import { getProfile } from "../../lib/destinyApi";
import { withDefinitions, useDefinitions } from "../../lib/definitions";
import { DestinyWorldDefinitions } from "../../lib/definitions/types";

import Icon from "../../components/Icon";
import PlayerSearch, { SearchResult } from "../../components/PlayerSearch";
import SiteHeader from "../../components/SiteHeader";

import { getCompleteActivityHistoryForCharacters } from "./activityHistory";
import { NIGHTFALL_ACTIVITY_HASHES } from "./data";
import NightfallTable from "./NightfallTable";
import Explainer from "./Explainer";

import s from "./styles.module.scss";

export type ProfileState = {
  [membershipId: string]: {
    profile?: DestinyProfileResponse;
    activities?: CharacterActivity[];
    error?: string;
    times?: { [activityHash: string]: CharacterActivity };
  };
};

export type PlayerTimes = {
  [activityHash: string]: {
    [membershipId: string]: CharacterActivity;
  };
};

type ProfileAction = {
  membershipId: string;
  profile?: DestinyProfileResponse;
  activities?: CharacterActivity[];
};

const initialProfileState: ProfileState = {};

function profileReducer(
  state: ProfileState,
  action: ProfileAction
): ProfileState {
  const membershipId = action.profile?.profile.data?.userInfo.membershipId;

  if (!membershipId) {
    return {
      ...state,
      [action.membershipId]: { error: "Missing data" },
    };
  }

  return {
    ...state,
    [action.membershipId]: {
      profile: action.profile,
      activities: action.activities,
    },
  };
}

const FORSAKEN = "FORSAKEN";

function usePlayerData(memberships: Membership[]) {
  const [profiles, dispatchProfiles] = useReducer(
    profileReducer,
    initialProfileState
  );

  useEffect(() => {
    memberships.forEach(async ({ membershipType, membershipId }) => {
      if (profiles[membershipId]?.profile) {
        return;
      }

      dispatchProfiles({
        membershipId,
        profile: profiles[membershipId]?.profile,
      });

      const data = await getProfile(membershipType, membershipId, [
        DestinyComponentType.Profiles,
        DestinyComponentType.Characters,
      ]);

      dispatchProfiles({ membershipId, profile: data });

      await getCompleteActivityHistoryForCharacters(
        membershipType,
        membershipId,
        data.profile.data?.characterIds ?? [],
        (activities) => {
          dispatchProfiles({
            membershipId,
            profile: data,
            activities,
          });
        }
      );
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [memberships]);

  return profiles;
}

const didCompleteActivity = (activity: DestinyHistoricalStatsPeriodGroup) =>
  activity.values.completionReason.basic.value === 0 &&
  activity.values.completed.basic.value === 1;

function calculatePlayerTimes(
  playerData: ProfileState,
  selectedSeason: string | undefined,
  seasonDefs: DestinyWorldDefinitions["DestinySeasonDefinition"]
): PlayerTimes {
  const data: PlayerTimes = {};

  NIGHTFALL_ACTIVITY_HASHES.forEach((v) => (data[v] = {}));

  const season =
    selectedSeason && seasonDefs ? seasonDefs[selectedSeason] : undefined;

  const activitiesStartDate =
    selectedSeason === FORSAKEN
      ? new Date(2018, 8, 2) // Forsaken, ish
      : new Date(season?.startDate || new Date(2018, 8, 2));

  const activitiesEndDate =
    selectedSeason === FORSAKEN
      ? NOW // Forsaken, ish
      : new Date(season?.endDate || NOW);

  Object.entries(playerData).forEach(
    ([membershipId, { profile, activities }]) => {
      if (!profile || !activities) {
        return null;
      }

      activities.forEach((activity) => {
        const activityHash = activity.activity.activityDetails.referenceId.toString();

        const period = new Date(activity.activity.period);

        const useActivity =
          period > activitiesStartDate && period < activitiesEndDate;

        // TODO: check to make sure the activity was completed
        if (
          !NIGHTFALL_ACTIVITY_HASHES.includes(activityHash) ||
          !didCompleteActivity(activity.activity) ||
          !useActivity
        ) {
          return;
        }

        data[activityHash] = data[activityHash] ?? {};

        if (!data[activityHash][membershipId]) {
          data[activityHash][membershipId] = activity;
          return;
        }

        const thisTime =
          activity.activity.values.activityDurationSeconds.basic.value;
        const bestTime =
          data[activityHash][membershipId].activity.values
            .activityDurationSeconds.basic.value;

        if (thisTime < bestTime) {
          data[activityHash][membershipId] = activity;
        }
      });
    }
  );

  return data;
}

const NOW = new Date();

function Nightfalls() {
  const [modalIsOpen, setModalOpen] = React.useState(false);
  const history = useHistory();
  const rlocation = useLocation();

  const [selectedSeason, setSelectedSeason] = useLocalStorage<string>(
    "nightfallSeason",
    ""
  );
  const memberships = usePlayersParam();
  const { DestinySeasonDefinition: seasonDefs = {} } = useDefinitions();
  const playerData = usePlayerData(memberships);

  const seasons = useMemo(() => {
    return Object.values(seasonDefs)
      .filter(
        (season) =>
          season && season.startDate && NOW > new Date(season.startDate)
      )
      .sort((a, b) => {
        if (!a || !b) {
          return 0;
        }

        const aStart = new Date(a.startDate || "");
        const bStart = new Date(b.startDate || "");

        return aStart > bStart ? -1 : 1;
      });
  }, [seasonDefs]);

  useEffect(() => {
    if (!selectedSeason && seasons) {
      setSelectedSeason(seasons[0]?.hash?.toString() ?? "");
    }
  }, [seasons, selectedSeason, setSelectedSeason]);

  const setActiveProfiles = (pp: any[]) => {
    const newPlayersParam = pp
      .map((player) => `${player.membershipType}/${player.membershipId}`)
      .join(",");

    history.replace(`${rlocation.pathname}?players=${newPlayersParam}`);
  };

  const addNewPlayer = (player: SearchResult) => {
    setActiveProfiles([...memberships, player]);
  };

  const removePlayer = (player: { profile?: DestinyProfileResponse }) => {
    const membershipId = player.profile?.profile.data?.userInfo.membershipId;
    const newPlayers = membershipId
      ? memberships.filter((v) => v.membershipId !== membershipId)
      : memberships;
    setActiveProfiles(newPlayers);
  };

  const timeData = calculatePlayerTimes(playerData, selectedSeason, seasonDefs);

  return (
    <>
      <SiteHeader />

      <div className={s.root}>
        <h1>Nightfalls</h1>

        <p>
          <label htmlFor="nightfallTimePeriod">Time period: </label>

          <select
            id="nightfallTimePeriod"
            value={selectedSeason}
            onChange={(ev) => setSelectedSeason(ev.target.value)}
            className={s.seasonDropdown}
          >
            {seasons.map(
              (season) =>
                season && (
                  <option key={season.hash} value={season.hash}>
                    During {season && season.displayProperties.name}
                  </option>
                )
            )}
            <option disabled value=""></option>
            <option value={FORSAKEN}>Since beginning of Forsaken</option>
          </select>
        </p>

        <NightfallTable
          memberships={memberships}
          playerData={playerData}
          onRemovePlayer={removePlayer}
          timeData={timeData}
          requestAddPlayer={() => setModalOpen(true)}
        />

        <Explainer />

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
      </div>
    </>
  );
}

export default withDefinitions(Nightfalls, [
  "DestinyClassDefinition",
  "DestinySeasonDefinition",
  "DestinyActivityDefinition",
]);
