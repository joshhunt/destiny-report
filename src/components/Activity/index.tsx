import React, { useMemo } from "react";
import cx from "classnames";
import { DestinyActivityDefinition } from "bungie-api-ts/destiny2/interfaces";

import BungieImage from "../BungieImage";
import { useDefinitions } from "../../lib/definitions";
import { DestinyWorldDefinitions } from "../../lib/definitions/types";
import { NightfallLeaderboardEntry } from "../../types";

import s from "./styles.module.scss";
import Icon from "../Icon";
import FireteamMembers from "../FireteamMembers";

const usesNightfallCard = (activity: DestinyActivityDefinition): boolean => {
  return !!activity.modifiers.find(
    modifier => modifier.activityModifierHash === 1845517209
  );
};

interface ActivityProps {
  activityHash: number | string;
  className?: string;
  leaderboardEntries: NightfallLeaderboardEntry[];
}

const isActivity = (
  obj: DestinyActivityDefinition | undefined
): obj is DestinyActivityDefinition => !!obj;

function getSupplimentaryData(
  activity: DestinyActivityDefinition | undefined,
  activityDefs: DestinyWorldDefinitions["DestinyActivityDefinition"]
) {
  if (!activityDefs || !activity) {
    return {
      displayActivity: activity
    };
  }

  const isOrdeal = activity.displayProperties.name.includes("The Ordeal:");
  const activities = Object.values(activityDefs).filter(isActivity);

  const displayActivity = isOrdeal
    ? activities.find(
        candidate =>
          candidate.displayProperties.name ===
          activity.displayProperties.description
      )
    : activities
        .filter(
          candidate =>
            activity.displayProperties.name &&
            candidate.displayProperties.name &&
            candidate.displayProperties.name.length > 3 &&
            activity.displayProperties.name !==
              candidate.displayProperties.name &&
            activity.displayProperties.name.includes(
              candidate.displayProperties.name
            )
        )
        .sort(
          (a, b) =>
            a.displayProperties.name.length - b.displayProperties.name.length
        )[0];

  return {
    displayActivity: displayActivity || activity
  };
}

function formatSeconds(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const secondsRemaining = seconds - minutes * 60;

  return [
    minutes > 0 && `${minutes}m`,
    secondsRemaining > 0 && `${secondsRemaining}s`
  ]
    .filter(Boolean)
    .join(" ");
}

const Activity: React.FC<ActivityProps> = ({
  activityHash,
  className,
  leaderboardEntries
}) => {
  const { DestinyActivityDefinition } = useDefinitions();

  const activity =
    DestinyActivityDefinition && DestinyActivityDefinition[activityHash];

  const { displayActivity } = useMemo(
    () => getSupplimentaryData(activity, DestinyActivityDefinition),
    [activity, DestinyActivityDefinition]
  );

  if (!activity || !displayActivity) {
    return null;
  }

  const isClassic = usesNightfallCard(activity);
  const topEntry = leaderboardEntries[0];

  return (
    <div className={cx(s.root, className)}>
      <BungieImage className={s.image} src={displayActivity.pgcrImage} />

      <div className={s.content}>
        <div className={s.nameSplit}>
          <div className={s.name}>{displayActivity.displayProperties.name}</div>

          {isClassic ? (
            <div className={s.tagClassic}>Classic</div>
          ) : (
            <div className={s.tagOrdeal}>
              Ordeal: {activity.activityLightLevel}
            </div>
          )}
        </div>

        <br />
        <div className={s.statSplit}>
          <div>
            <strong>Top score</strong>
            <br />
            {topEntry.teamScore.toLocaleString()}

            <br />
            <br />
            <strong>Duration</strong>
            <br />
            {formatSeconds(topEntry.activityDurationSeconds)}
          </div>

          <div>
            <strong>Fireteam</strong>
            <br />
            <FireteamMembers pgcrId={topEntry.pgcrId} />
          </div>
        </div>

        <br />
        <a
          className={isClassic ? s.classicLink : s.link}
          href={`https://www.bungie.net/en/PGCR/${topEntry.pgcrId}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          View on Bungie.net{" "}
          <span className={s.linkIcon}>
            <Icon name="arrow-right" />
          </span>
        </a>
      </div>
    </div>
  );
};

export default Activity;
