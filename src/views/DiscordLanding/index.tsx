import React from "react";
import DiscordNotificationSample from "../../components/DiscordNotificationSample";
import { ReactComponent as DiscordLogo } from "./discord.svg";

import s from "./styles.module.scss";

interface DiscordLandingProps {}

const DISCORD_INVITE_LINK = "https://discord.gg/gVb8hzsspS";

const DiscordLanding: React.FC<DiscordLandingProps> = () => {
  return (
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

        <div>
          <DiscordNotificationSample />
        </div>
      </div>
    </div>
  );
};

export default DiscordLanding;
