import React from "react";
import { MembershipType } from "../types";

interface IconProps extends React.HTMLAttributes<HTMLSpanElement> {
  name: string;
  solid?: boolean;
  regular?: boolean;
  light?: boolean;
  duotone?: boolean;
  brand?: boolean;
  spin?: boolean;
}

const Icon: React.FC<IconProps> = ({
  name,
  solid,
  regular,
  light,
  duotone,
  brand,
  spin,
  className,
  ...rest
}) => {
  const prefix =
    {
      [solid ? "true" : "false"]: "fas",
      [regular ? "true" : "false"]: "far",
      [light ? "true" : "false"]: "fal",
      [duotone ? "true" : "false"]: "fad",
      [brand ? "true" : "false"]: "fab",
    }["true"] || "far";

  return (
    <span>
      <span
        className={`${prefix} fa-${name} ${className || ""} ${
          spin ? "fa-spin" : ""
        }`}
        {...rest}
      ></span>
    </span>
  );
};

export default Icon;

export const MembershipTypeIcon: React.FC<{
  type: string | MembershipType;
}> = ({ type, ...rest }) => {
  const iconMap: Record<string, string> = {
    [MembershipType.Xbox]: "xbox",
    [MembershipType.Playstation]: "playstation",
    [MembershipType.Steam]: "steam",
    [MembershipType.BattleNet]: "battle-net",
    [MembershipType.Stadia]: "google",
  };

  return <Icon brand name={iconMap[type.toString()]} {...rest} />;
};
