import React from "react";

interface NumberProps {
  number: string | number;
}

const PrettyNumber: React.FC<NumberProps> = ({ number }) => {
  if (typeof number == "string") {
    const n = Number(number);
    return <>{n.toLocaleString()}</>;
  }

  return <>{number.toLocaleString()}</>;
};

export default PrettyNumber;
