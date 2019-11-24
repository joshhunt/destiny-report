import React from "react";
import { useHistory } from "../history";

interface LinkProps {
  to: string;
  className: string;
  onClick?: (event: React.MouseEvent) => void;
}

const Link: React.FC<LinkProps> = ({
  to,
  children,
  className,
  onClick,
  ...rest
}) => {
  const history = useHistory();

  function ourOnClick(ev: React.MouseEvent) {
    onClick && onClick(ev);

    ev.preventDefault();
    history.push(to);
  }

  return (
    <a className={className} href={to} onClick={ourOnClick} {...rest}>
      {children}
    </a>
  );
};

export default Link;
