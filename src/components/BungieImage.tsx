import React from "react";

interface BungieImageProps extends React.HTMLAttributes<HTMLImageElement> {
  def?: {
    displayProperties?: {
      icon?: string;
    };
  };

  src?: string;
}

const BungieImage: React.FC<BungieImageProps> = ({ def, src, ...rest }) => {
  const bungieSrc =
    (def && def.displayProperties && def.displayProperties.icon) || src;

  if (!bungieSrc) {
    return null;
  }

  return <img {...rest} src={`https://www.bungie.net${bungieSrc}`} />;
};

export default BungieImage;
