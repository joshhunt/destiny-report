import React from "react";

import s from "./styles.module.scss";
import { MembershipTypeIcon } from "../Icon";

type LeaderboardEntry = {
  membershipId: string;
  membershipType: number;
  displayName: string;
  rank: number;
  triumphScore: number;
  collectionScore: number;
  applicableMembershipTypes: number[];
};

interface LeaderboardProps {
  title: React.ReactNode;
  players: LeaderboardEntry[];
  renderSub: (player: LeaderboardEntry) => React.ReactNode;
}

const Leaderboard: React.FC<LeaderboardProps> = ({
  title,
  players,
  renderSub
}) => {
  return (
    <div>
      <h2 className={s.title}>{title}</h2>
      <table className={s.table}>
        <tbody>
          {players.map(player => (
            <tr className={s.row}>
              <td className={s.rankCell}>
                <div className={s.rank}>{player.rank}</div>
              </td>
              <td className={s.main}>
                <div className={s.name}>{player.displayName}</div>
                <div className={s.platforms}>
                  <span className={s.primaryPlatformIcon}>
                    <MembershipTypeIcon type={player.membershipType} />
                  </span>

                  {player.applicableMembershipTypes
                    .filter(mType => mType !== player.membershipType)
                    .map(a => (
                      <span className={s.secondaryPlatformIcon}>
                        <MembershipTypeIcon type={a} />
                      </span>
                    ))}
                </div>
              </td>
              <td className={s.other}>
                <div className={s.sub}>{renderSub(player)}</div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Leaderboard;
