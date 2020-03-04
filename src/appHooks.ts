import { useState, useEffect, useRef } from "react";

import { LeaderboardEntry, DestinyCrawlApiStatus } from "./types";

export enum CacheStrategy {
  Refresh,
  UseStale
}

const API_KEY = process.env.REACT_APP_BUNGIE_API_KEY;

const rehydrate = (url: string) => {
  const preloadStore = window.__preloadData || {};
  return preloadStore[url];
};

export function useCachedApi<Data>(
  url: string,
  cacheStrategy = CacheStrategy.Refresh
): [Data, boolean] {
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

    const isBungieApi =
      url.includes("://stats.bungie.net/") ||
      url.includes("://www.bungie.net/");

    const options = isBungieApi
      ? { headers: { "x-api-key": API_KEY || "" } }
      : {};

    if (cacheStrategy === CacheStrategy.UseStale) {
      return;
    }

    fetch(url, options)
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
  }, [cacheStrategy, url]);

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
