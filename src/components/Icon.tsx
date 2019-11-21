import React from "react";

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
  brand
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

  return <span className={`${prefix} fa-${name}`}></span>;
};

export default Icon;

export const MembershipTypeIcon: React.FC<{ type: number }> = ({ type }) => {
  const iconMap: Record<string, string> = {
    1: "xbox",
    2: "playstation",
    3: "steam",
    4: "battle-net",
    5: "google"
  };

  return <Icon brand name={iconMap[type.toString()]} />;
};
