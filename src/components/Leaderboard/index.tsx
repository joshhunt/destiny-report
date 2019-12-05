import React from "react";
import cx from "classnames";
import TimeAgo from "react-timeago";

import s from "./styles.module.scss";
import { MembershipTypeIcon } from "../Icon";
import { LeaderboardEntry } from "../../types";

interface LeaderboardProps {
  className?: string;
  title: React.ReactNode;
  players: LeaderboardEntry[];
  extraPlayers?: LeaderboardEntry[];
  extraPlayersLoading?: Boolean;
  renderScore: (player: LeaderboardEntry) => React.ReactNode;
}

const Leaderboard: React.FC<LeaderboardProps> = ({
  className,
  title,
  players,
  extraPlayers,
  extraPlayersLoading,
  renderScore
}) => {
  return (
    <div className={className}>
      <h2 className={s.title}>{title}</h2>

      <div className={s.header}>
        <div className={s.rankHeader}>Rank</div>
        <div className={s.mainHeader}>Player</div>
        <div className={s.otherHeader}>Score</div>
      </div>

      <div className={s.table}>
        {extraPlayersLoading && <div className={s.loading}>Loading</div>}

        {extraPlayers &&
          extraPlayers.map(player => (
            <Player
              key={player.membershipId}
              player={player}
              renderScore={renderScore}
            />
          ))}

        {((extraPlayers && extraPlayers.length) || extraPlayersLoading) && (
          <div className={s.divider} />
        )}

        {players.map(player => (
          <Player
            key={player.membershipId}
            player={player}
            renderScore={renderScore}
          />
        ))}
      </div>
    </div>
  );
};

export default Leaderboard;

const Player: React.FC<{
  player: LeaderboardEntry;
  renderScore: LeaderboardProps["renderScore"];
}> = ({ player, renderScore }) => {
  return (
    <a
      key={player.membershipId}
      className={s.row}
      href={`https://braytech.org/${player.membershipType}/${player.membershipId}`}
    >
      <div className={s.rankCell}>
        {player.rank && (
          <div
            className={cx(
              s.rank,
              player.rank > 999 && s.rankFourDigit,
              player.rank > 9999 && s.rankFiveDigit,
              player.rank > 99999 && s.rankSixDigit,
              player.rank > 999999 && s.rankSevenDigit,
              player.rank > 9999999 && s.rankEightDigit
            )}
          >
            {player.rank.toLocaleString()}
          </div>
        )}
      </div>
      <div className={s.main}>
        <div className={s.name}>{player.displayName}</div>
        <div className={s.platforms}>
          <span className={s.primaryPlatformIcon}>
            <MembershipTypeIcon type={player.membershipType} />
          </span>

          {player.applicableMembershipTypes
            .filter(mType => mType !== player.membershipType)
            .map(a => (
              <span key={a} className={s.secondaryPlatformIcon}>
                <MembershipTypeIcon type={a} />
              </span>
            ))}
        </div>
      </div>

      <div className={s.other}>
        <div className={s.sub}>{renderScore(player)}</div>

        <div className={s.timeUpdated}>
          Profile updated <TimeAgo date={player.lastCrawled} />
        </div>
      </div>
    </a>
  );
};
