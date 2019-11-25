import { useState, useEffect } from "react";

import { LeaderboardEntry } from "./types";

window.localStorage.removeItem("leaderboards");
window.localStorage.removeItem("apiStatus");

function useCachedApi<Data>(url: string) {
  const [data, setData] = useState<Data>();
  const [isStale, setIsStale] = useState();

  useEffect(() => {
    const prevJson = window.localStorage.getItem(url);
    const prevData = prevJson && JSON.parse(prevJson);
    prevData && setData(prevData);
    prevData && setIsStale(true);

    fetch(url)
      .then(r => r.json())
      .then(data => {
        setData(data);
        setIsStale(false);
        window.localStorage.setItem(url, JSON.stringify(data));
      });
  }, [url]);

  return [data, isStale];
}

export function useLeaderboards() {
  return useCachedApi<LeaderboardEntry[]>(
    "https://api.clan.report/leaderboards-all.json"
  );
}

export function useApiStatus() {
  return useCachedApi<LeaderboardEntry[]>(
    "https://api.clan.report/status.json"
  );
}
