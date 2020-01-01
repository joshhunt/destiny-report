import path from "path";
import fs from "fs";
import { promisify } from "util";
import crypto from "crypto";
import axios from "axios";
import { ServerResponse } from "bungie-api-ts/common";
import tempDirectory from "temp-dir";
import { DestinyManifestUpdated } from "../lib/definitions/getDefinitions";
import { DestinyWorldDefinitions } from "../lib/definitions/types";
import { DestinyActivityDefinition } from "bungie-api-ts/destiny2/interfaces";

require("dotenv").config({ path: path.resolve("./.env.local") });

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

const usesNightfallCard = (activity: DestinyActivityDefinition): boolean => {
  return !!activity.modifiers.find(
    modifier => modifier.activityModifierHash === 1845517209
  );
};

const API_KEY = process.env.REACT_APP_API_KEY;

const STRIKE_MODE_TYPE = 2394616003;

const hashString = (string: string) =>
  crypto
    .createHash("md5")
    .update(string)
    .digest("hex");

function ordealify(activity: DestinyActivityDefinition) {
  const isOrdeal = activity.displayProperties.name.includes("The Ordeal:");

  return isOrdeal
    ? activity.displayProperties.description
    : activity.displayProperties.name;
}

export async function getDefinitions() {
  const manifestResponse = await axios.get<
    ServerResponse<DestinyManifestUpdated>
  >("https://www.bungie.net/Platform/Destiny2/Manifest/", {
    headers: { "x-api-key": API_KEY }
  });

  const definitonsPath =
    manifestResponse.data.Response.jsonWorldContentPaths.en;
  const definitionsUrl = `https://www.bungie.net${definitonsPath}`;

  const hash = hashString(definitionsUrl);

  const tempDefsPath = path.join(tempDirectory, hash);
  let tempDefs;

  try {
    const tempDefsFile = await readFile(tempDefsPath);
    console.log("have cached definitions");
    tempDefs = JSON.parse(tempDefsFile.toString());
  } catch (e) {}

  if (tempDefs) {
    const typedDefs = (tempDefs as unknown) as DestinyWorldDefinitions;
    return typedDefs;
  }

  console.log("requesting definitions from remote");

  const defsResponse = await axios.get<DestinyWorldDefinitions>(
    definitionsUrl,
    {
      headers: { "x-api-key": API_KEY }
    }
  );

  const defs = defsResponse.data;

  await writeFile(tempDefsPath, JSON.stringify(defs));

  return defs;
}

async function main() {
  const { DestinyActivityDefinition } = await getDefinitions();

  if (!DestinyActivityDefinition) {
    return null;
  }

  const mapping: Record<number, number[]> = {};

  const strikes = Object.values(DestinyActivityDefinition)
    .filter(isActivity)
    .filter(
      activity =>
        activity.activityModeHashes &&
        activity.activityModeHashes.includes(STRIKE_MODE_TYPE)
    );

  strikes.forEach(activity => {
    const foundMatches = strikes.filter(strike => {
      const isMatch =
        strike.displayProperties.name !== activity.displayProperties.name &&
        strike.displayProperties.name.includes(activity.displayProperties.name);

      return isMatch;
    });

    foundMatches.forEach(matchedActivity => {
      if (!mapping[matchedActivity.hash]) {
        mapping[matchedActivity.hash] = [];
      }

      if (!mapping[matchedActivity.hash].includes(activity.hash)) {
        mapping[matchedActivity.hash].push(activity.hash);
      }
    });
  });

  const finalMapping: Record<string, number> = {};

  Object.entries(mapping).forEach(([fromHash, toHashes]) => {
    const fromActivity = DestinyActivityDefinition[fromHash];

    if (!fromActivity) {
      return null;
    }

    const toActivities = toHashes
      .map(hash => DestinyActivityDefinition[hash])
      .filter(isActivity)
      .reduce((acc: DestinyActivityDefinition[], strike) => {
        if (acc.includes(strike)) {
          return acc;
        }

        return [...acc, strike];
      }, [])
      .sort(
        (a, b) =>
          a.displayProperties.name.length - b.displayProperties.name.length
      );

    toActivities.forEach(toActivity => {
      console.log(
        fromActivity.displayProperties.name,
        "=>",
        toActivity.displayProperties.name
      );
    });

    finalMapping[fromHash] = toActivities[0].hash;
  });

  strikes
    .filter(activity => activity.displayProperties.name.includes("The Ordeal:"))
    .forEach(ordealActivity => {
      const ordealRealName = ordealActivity.displayProperties.description;
      const mapped = strikes.find(
        strike => strike.displayProperties.name === ordealRealName
      );

      if (mapped) {
        finalMapping[ordealActivity.hash] = mapped.hash;
      }
    });

  console.log("\n\nfinal mappings:");

  Object.entries(finalMapping).forEach(([fromHash, toHash]) => {
    const fromActivity = DestinyActivityDefinition[fromHash];
    const toActivity = DestinyActivityDefinition[toHash];

    if (!fromActivity || !toActivity) {
      return null;
    }

    console.log(
      fromActivity.displayProperties.name,
      "=>",
      toActivity.displayProperties.name
    );
  });

  const dataPath = path.join(".", "src", "nightfallMapping.json");
  writeFile(path.resolve(dataPath), JSON.stringify(finalMapping, null, 2));
}

main();

const isActivity = (
  obj: DestinyActivityDefinition | undefined
): obj is DestinyActivityDefinition => !!obj;
