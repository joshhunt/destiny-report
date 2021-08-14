import React from "react";
import DiscordNotificationSample from "../../components/DiscordNotificationSample";
import { ReactComponent as DiscordLogo } from "./discord.svg";
import archiveScreenshot from "./archive.png";

import s from "./styles.module.scss";
import Icon from "../../components/Icon";

interface DiscordLandingProps {}

const DISCORD_INVITE_LINK = "https://discord.gg/gVb8hzsspS";

const DiscordLanding: React.FC<DiscordLandingProps> = () => {
  return (
    <>
      <div className={s.root}>
        <div className={s.grid}>
          <div>
            <h1>destiny.report</h1>
            <h2>Discord notifications for Destiny 2 API database updates </h2>

            <p>
              A notifications-only Discord server for updates to the Destiny 2
              definitions. Subscribe to cross post to your own server.
            </p>

            <a className={s.discordButton} href={DISCORD_INVITE_LINK}>
              {" "}
              <DiscordLogo className={s.discordSvg} />{" "}
              <span>Join Discord server</span>
            </a>
          </div>

          <div className={s.floatRight}>
            <DiscordNotificationSample />
          </div>
        </div>
      </div>

      <div className={s.root}>
        <div className={s.archiveGrid}>
          <div>
            <h1>archive.destiny.report</h1>
            <h2>
              Detailed historical diffs for Destiny 2 API database updates
            </h2>

            <p>
              Historical archive of Destiny 2 API database updates and exactly
              what's added and changed.
            </p>

            <a
              className={s.archiveButton}
              href="https://archive.destiny.report"
            >
              <Icon name="sign-out" className={s.archiveIcon} />{" "}
              <span>Go to Archive</span>
            </a>
          </div>

          <div className={s.floatRight}>
            <img style={{ width: 638 }} alt="" src={archiveScreenshot} />
          </div>
        </div>
      </div>
    </>
  );
};

export default DiscordLanding;
