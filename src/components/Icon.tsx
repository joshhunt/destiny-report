import React from "react";
import { MembershipType } from "../types";

interface IconProps {
  name: string;
  solid?: boolean;
  regular?: boolean;
  light?: boolean;
  duotone?: boolean;
  brand?: boolean;
}

const Icon: React.FC<IconProps> = ({
  name,
  solid,
  regular,
  light,
  duotone,
  brand,
  ...rest
}) => {
  const prefix =
    {
      [solid ? "true" : "false"]: "fas",
      [regular ? "true" : "false"]: "far",
      [light ? "true" : "false"]: "fal",
      [duotone ? "true" : "false"]: "fad",
      [brand ? "true" : "false"]: "fab"
    }["true"] || "far";

  if (solid) {
  }

  return <span className={`${prefix} fa-${name}`} {...rest}></span>;
};

export default Icon;

export const MembershipTypeIcon: React.FC<{ type: MembershipType }> = ({
  type,
  ...rest
}) => {
  const iconMap: Record<string, string> = {
    [MembershipType.Xbox]: "xbox",
    [MembershipType.Playstation]: "playstation",
    [MembershipType.Steam]: "steam",
    [MembershipType.BattleNet]: "battle-net",
    [MembershipType.Stadia]: "google"
  };

  return <Icon brand name={iconMap[type.toString()]} {...rest} />;
};
