import React from "react";
import cx from "classnames";
import { DestinyActivityDefinition } from "bungie-api-ts/destiny2/interfaces";

import BungieImage from "../BungieImage";
import { useDefinitions } from "../../lib/definitions";

import s from "./styles.module.scss";
import { string } from "prop-types";

const usesNightfallCard = (activity: DestinyActivityDefinition): boolean => {
  return !!activity.modifiers.find(
    modifier => modifier.activityModifierHash === 1845517209
  );
};

const ALTERNATE_DISPLAY: Record<string, number> = {
  1358381368: 442671778, // arms dealer ordeal
  1358381370: 442671778, // arms dealer ordeal
  1358381371: 442671778, // arms dealer ordeal
  1358381373: 442671778, // arms dealer ordeal
  3108813009: 1134446996, // warden of nothing
  3280234344: 649648599, // savathuns song
  3718330161: 561345573 // tree of probabilities
};

interface ActivityProps {
  activityHash: number | string;
  className?: string;
}

const Activity: React.FC<ActivityProps> = ({ activityHash, className }) => {
  const { DestinyActivityDefinition } = useDefinitions();

  const activity =
    DestinyActivityDefinition && DestinyActivityDefinition[activityHash];

  if (!activity) {
    return null;
  }

  const displayActivityHash = ALTERNATE_DISPLAY[activityHash] || activityHash;
  const displayActivity =
    (DestinyActivityDefinition &&
      DestinyActivityDefinition[displayActivityHash]) ||
    activity;

  const isClassic = usesNightfallCard(activity);

  return (
    <div className={cx(s.root, className)}>
      <BungieImage className={s.image} src={displayActivity.pgcrImage} />

      <div className={s.content}>
        <div className={s.nameSplit}>
          <div className={s.name}>{displayActivity.displayProperties.name}</div>

          <div className={s.tag}>{isClassic ? "Classic" : "Ordeal"}</div>
        </div>

        {isClassic && (
          <>
            <br />
            <div className={s.statSplit}>
              <div>
                <strong>Top score</strong>
                <br />
                52,985
              </div>

              <div>
                <strong>Fastest time</strong>
                <br />
                13m 24s
              </div>
            </div>
          </>
        )}

        {!isClassic && (
          <div className={s.statSplit}>
            <div className={s.statGroup}>
              <div className={s.smallHeading}>950 Legend</div>

              <div className={s.statSplit}>
                <div>
                  <div className={s.statHeading}>Top score</div>
                  52,985
                </div>

                {/* <div>
                  <div className={s.statHeading}>Fastest time</div>
                  13m 24s
                </div> */}
              </div>
            </div>

            <div className={s.statGroup}>
              <div className={s.smallHeading}>980 Master</div>

              <div className={s.statSplit}>
                <div>
                  <div className={s.statHeading}>Top score</div>
                  52,985
                </div>

                {/* <div>
                  <div className={s.statHeading}>Fastest time</div>
                  13m 24s
                </div> */}
              </div>
            </div>

            {/* <td>750 Adept</td>
                <td>920 Hero</td>
                <td>950 Legend</td>
                <td>980 Master</td> */}
          </div>
        )}
      </div>
    </div>
  );
};

export default Activity;
