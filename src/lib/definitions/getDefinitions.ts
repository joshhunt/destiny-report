import { DestinyManifest } from "bungie-api-ts/destiny2/interfaces";
import Dexie from "dexie";

import { bungieFetch } from "../destinyApi";
import { DefintionsDispatchData } from "./types";

const REQUESTS: Record<string, Promise<any>> = {};

interface DefinitionKeep {
  url: string;
  definitions: Record<string, any>;
}

class DestinyReportDatabase extends Dexie {
  definitions: Dexie.Table<DefinitionKeep, number>;

  constructor() {
    super("DestinyReportDatabase");

    this.version(1).stores({
      definitions: "&url,definitions"
    });

    this.definitions = this.table("definitions");
  }
}

const db = new DestinyReportDatabase();

export interface DestinyManifestUpdated extends DestinyManifest {
  readonly jsonWorldComponentContentPaths: {
    [language: string]: {
      [key: string]: string;
    };
  };
}

const LANGUAGE = "en";

async function actualFetchDefinition(url: string) {
  const possiblePrev = await db.definitions.get({ url });

  if (possiblePrev) {
    return possiblePrev.definitions;
  }

  const response = await fetch(`https://www.bungie.net${url}`);
  const data = await response.json();

  await db.definitions.put({
    url: url,
    definitions: data
  });

  return data;
}

function fetchDefinition(url: string) {
  if (REQUESTS[url]) {
    return REQUESTS[url];
  }

  const promise = actualFetchDefinition(url);
  REQUESTS[url] = promise;

  return promise;
}

function getManifest() {
  if (REQUESTS.manifest) {
    return REQUESTS.manifest;
  }

  const promise = bungieFetch<DestinyManifestUpdated>(
    "https://www.bungie.net/Platform/Destiny2/Manifest/"
  );

  REQUESTS.manifest = promise;

  return promise;
}

export async function getDefinitions(
  tables: string[],
  callback: (data: DefintionsDispatchData) => void
) {
  const manifest = await getManifest();

  const promises = tables
    .map(async tableName => {
      const bungiePath =
        manifest.jsonWorldComponentContentPaths[LANGUAGE][tableName];

      if (!bungiePath) {
        return null;
      }

      const data = await fetchDefinition(bungiePath);

      callback({
        tableName,
        definitions: data
      });

      return data;
    })
    .filter(Boolean);

  return await Promise.all(promises);
}
