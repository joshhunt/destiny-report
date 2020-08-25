import Dexie from "dexie";
import { CharacterActivity } from "../types";

interface DefinitionKeep {
  url: string;
  definitions: Record<string, any>;
}

interface ActivityHistoryKeep {
  membershipId: string;
  characterId: string;
  activities: CharacterActivity[];
}

export class DestinyReportDatabase extends Dexie {
  definitions: Dexie.Table<DefinitionKeep, number>;
  activityHistory: Dexie.Table<ActivityHistoryKeep, string>;

  constructor() {
    super("DestinyReportDatabase");

    this.version(2).stores({
      definitions: "&url",
      activityHistory: "&[membershipId+characterId]",
    });

    this.version(1).stores({
      definitions: "&url,definitions",
    });

    this.definitions = this.table("definitions");
    this.activityHistory = this.table("activityHistory");
  }
}

export const db = new DestinyReportDatabase();
