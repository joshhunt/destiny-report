import { getActivityHistoryForCharacter } from "../../lib/destinyApi";
import { db } from "../../lib/indexedDb";
import { CharacterActivity } from "../../types";

export {};

const NF_ACTIVITY_MODE = "46";

async function getCachedActivityHistory(
  membershipId: string,
  characterId: string
) {
  try {
    const data = await db.activityHistory.get({ membershipId, characterId });
    return data?.activities ?? [];
  } catch (e) {
    console.error("Error getting cached activity history:", e);
    return [];
  }
}

async function saveCachedActivityHistory(
  membershipId: string,
  characterId: string,
  activities: CharacterActivity[]
) {
  return await db.activityHistory.put({
    membershipId,
    characterId,
    activities,
  });
}

const activityKey = (activity: CharacterActivity) =>
  `${activity.activity.activityDetails.instanceId}`;

export async function getCompleteActivityHistoryForCharacter(
  membershipType: string,
  membershipId: string,
  characterId: string,
  cb: (activities: CharacterActivity[]) => void
) {
  const mode = NF_ACTIVITY_MODE;
  const modeNum = parseInt(mode);

  const cached = (
    await getCachedActivityHistory(membershipId, characterId)
  ).filter((activity) =>
    activity.activity.activityDetails.modes.includes(modeNum)
  );

  let page = 0;
  let count = 50;

  const seenActivities: { [key: string]: boolean } = {};

  cached.forEach((activity) => {
    seenActivities[activityKey(activity)] = true;
  });

  const allActivities = [...cached];
  cb(allActivities);

  let running = true;
  while (running) {
    const activityPage = await getActivityHistoryForCharacter(
      membershipType,
      membershipId,
      characterId,
      mode,
      page,
      count
    );

    page += 1;

    if (!activityPage.activities) {
      running = false;
      break;
    }

    if (activityPage.activities.length < count) {
      running = false;
    }

    let seenCounter = 0;
    activityPage.activities.forEach((_activity) => {
      const activity = {
        characterId,
        activity: _activity,
      };

      const key = activityKey(activity);

      if (seenActivities[key]) {
        seenCounter += 1;
      } else {
        seenActivities[key] = true;
        allActivities.push(activity);
      }
    });

    cb(allActivities);

    if (seenCounter > 5) {
      running = false;
    }
  }

  await saveCachedActivityHistory(membershipId, characterId, allActivities);

  return allActivities;
}

export async function getCompleteActivityHistoryForCharacters(
  membershipType: string,
  membershipId: string,
  characterIds: string[],
  cb: (activities: CharacterActivity[]) => void
) {
  let allActivities: {
    [characterId: string]: CharacterActivity[];
  } = {};

  const promises = characterIds.map((characterId) => {
    allActivities[characterId] = [];

    return getCompleteActivityHistoryForCharacter(
      membershipType,
      membershipId,
      characterId,
      (newActivities) => {
        allActivities[characterId] = newActivities;

        cb(Object.values(allActivities).flatMap((v) => v));
      }
    );
  });

  return Promise.all(promises);
}
