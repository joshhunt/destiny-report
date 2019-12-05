import { useState, useEffect, useRef } from "react";

import { LeaderboardEntry, DestinyCrawlApiStatus } from "./types";

window.localStorage.removeItem("leaderboards");
window.localStorage.removeItem("apiStatus");

declare global {
  interface Window {
    __preloadData: Record<string, any>;
  }
}

const rehydrate = (url: string) => {
  const preloadStore = window.__preloadData || {};
  return preloadStore[url];
};

function useCachedApi<Data>(url: string): [Data, boolean] {
  const rehydratedData = rehydrate(url);
  const scriptRef = useRef<HTMLScriptElement>();
  const [data, setData] = useState<Data>(rehydratedData);
  const [isStale, setIsStale] = useState(!!rehydratedData);

  useEffect(() => {
    const rootElement = document.getElementById("root");
    scriptRef.current = document.createElement("script");
    document.body.appendChild(scriptRef.current);

    if (rootElement) {
      rootElement.parentNode &&
        rootElement.parentNode.insertBefore(
          scriptRef.current,
          rootElement.nextSibling
        );
    } else {
      document.body.appendChild(scriptRef.current);
    }
  }, []);

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
        const serialized = JSON.stringify(data);
        window.localStorage.setItem(url, serialized);

        const scriptSrc = `
          window.__preloadData = window.__preloadData || {};
          window.__preloadData["${url}"] = ${serialized}
        `;

        if (scriptRef.current) {
          scriptRef.current.innerHTML = scriptSrc;
        }
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
  return useCachedApi<DestinyCrawlApiStatus>(
    "https://api.clan.report/status.json"
  );
}
