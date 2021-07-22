import { useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { Membership } from "../types";

type ExcludesFalse = <T>(x: T | null) => x is T;

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export function usePlayersParam(): Membership[] {
  const queryParams = useQuery();
  const playersParam = queryParams.get("players") || "";
  const players = useMemo(
    () =>
      playersParam
        .split(",")
        .map((str) => {
          const [type, id] = str.split("/");
          const hasData = type && id;
          return hasData ? { membershipType: type, membershipId: id } : null;
        })
        .filter(Boolean as any as ExcludesFalse),
    [playersParam]
  );

  return players;
}

export function useLocalStorage<Value>(
  key: string,
  initialValue: Value
): [Value, (v: Value) => void] {
  const previousInitialValue = useMemo(() => {
    const previous = window.localStorage.getItem(key);
    return previous && JSON.parse(previous);
  }, [key]);

  const [value, setValue] = useState<Value>(
    previousInitialValue || initialValue
  );

  const setter = (newValue: Value) => {
    setValue(newValue);
    window.localStorage.setItem(key, JSON.stringify(newValue));
  };

  return [value, setter];
}
