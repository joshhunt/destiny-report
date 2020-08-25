import React from "react";

import s from "./styles.module.scss";
import { CharacterActivity, Membership } from "../../types";
import { SINGLE_PLAYER_TIMES, SLOWEST_SPEEDRUN_TIMES } from "./data";
import { ProfileState, PlayerTimes } from ".";
import Icon from "../../components/Icon";
import { DestinyProfileResponse } from "bungie-api-ts/destiny2/interfaces";
import { useDefinitions } from "../../lib/definitions";

const cleanNightfallName = (s: string | undefined) =>
  s && s.replace("Nightfall: ", "");

function fmtSeconds(time: number) {
  const minutes = Math.floor(time / 60);
  const seconds = time - minutes * 60;

  return minutes.toString() + "m " + seconds.toString() + "s";
}

function getTimeIcon(activity: CharacterActivity) {
  const activityHash = activity.activity.activityDetails.referenceId;
  const activityDuration =
    activity.activity.values.activityDurationSeconds.basic.value;

  const starTime = SINGLE_PLAYER_TIMES[activityHash];
  const outlineTime = SLOWEST_SPEEDRUN_TIMES[activityHash];

  if (activityDuration <= starTime) {
    return { starSolid: true };
  } else if (activityDuration <= outlineTime) {
    return { starOutline: true };
  }

  return {};
}

interface NightfallTableProps {
  memberships: Membership[];
  playerData: ProfileState;
  timeData: PlayerTimes;
  onRemovePlayer: (player: { profile?: DestinyProfileResponse }) => void;
  requestAddPlayer: () => void;
}

export default function NightfallTable({
  memberships,
  playerData,
  timeData,
  onRemovePlayer,
  requestAddPlayer,
}: NightfallTableProps) {
  const {
    DestinyActivityDefinition: activityDefs = {},
    DestinyClassDefinition: classDefs = {},
  } = useDefinitions();

  return (
    <table className={s.table}>
      <thead>
        <tr>
          <td>Nightfall</td>
          {memberships.map((membership) => {
            const player = playerData[membership.membershipId];

            return (
              <td key={membership.membershipId}>
                {player?.profile?.profile.data?.userInfo.displayName ? (
                  <>
                    {player.profile.profile.data.userInfo.displayName}

                    <button
                      className={s.removePlayerButton}
                      onClick={() => onRemovePlayer(player)}
                    >
                      <Icon
                        className={s.removePlayerIcon}
                        name="times-circle"
                        solid
                      />
                    </button>
                  </>
                ) : (
                  <Icon name="spinner-third" spin />
                )}
              </td>
            );
          })}

          <td>
            <button className={s.addPlayerButton} onClick={requestAddPlayer}>
              Add player
            </button>
          </td>
        </tr>
      </thead>

      <tbody>
        {Object.entries(timeData).map(([activityHash, times]) => {
          const activity = activityDefs && activityDefs[activityHash];

          return (
            <tr key={activityHash}>
              <td>
                <div className={s.nightfallTitle}>
                  {activity
                    ? cleanNightfallName(activity.displayProperties.name)
                    : "Loading..."}
                </div>

                <div className={s.nightfallTimes}>
                  <Icon className={s.timeIconWhite} name="star" solid />{" "}
                  {fmtSeconds(SINGLE_PLAYER_TIMES[activityHash])},{" "}
                  <Icon className={s.timeIconWhite} name="star" />{" "}
                  {fmtSeconds(SLOWEST_SPEEDRUN_TIMES[activityHash])}
                </div>
              </td>

              {memberships.map((membership, index) => {
                const player = playerData[membership.membershipId];

                const userInfo = player?.profile?.profile.data?.userInfo;
                const fastestActivity =
                  userInfo && times[userInfo.membershipId];

                if (!userInfo || !fastestActivity) {
                  return <td key={userInfo?.membershipId || index}>-</td>;
                }

                const character =
                  player.profile?.characters.data?.[
                    fastestActivity.characterId
                  ];
                const characterClass =
                  character && classDefs[character.classHash];

                const { starSolid, starOutline } = getTimeIcon(fastestActivity);

                return (
                  <td key={membership.membershipId}>
                    {starSolid && (
                      <Icon className={s.timeIcon} name="star" solid />
                    )}
                    {starOutline && <Icon className={s.timeIcon} name="star" />}
                    {!starSolid && !starOutline && (
                      <span className={s.noTimeIcon} />
                    )}
                    {
                      fastestActivity.activity.values.activityDurationSeconds
                        .basic.displayValue
                    }
                    <div className={s.character}>
                      {characterClass && characterClass.displayProperties.name}
                    </div>
                  </td>
                );
              })}

              <td></td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
