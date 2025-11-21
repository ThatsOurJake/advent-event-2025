import {
  KEY_GIFT_STORED,
  KEY_MOUND_STORED,
  KEY_ORE_STORED,
} from "../constants";
import { createSnapshot, updateTeamsNightlyResources } from "../data/teams";
import { resetUserActionPoints } from "../data/user";
import redis from "../services/redis";
import { constructTeamKey } from "../utils/construct-team-key";
import { isStartDay, isWithinEventDate } from "../utils/event-date-helpers";
import { getInstanceNumber } from "../utils/get-instance-number";
import { calculateMVE } from "./calculate-mve";
import { handleInactive } from "./handle-inactive";
import { processDailyEvent } from "./process-daily-event";

export const backgroundProcessor = async () => {
  const dayOfWeek = new Date().getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  const isInstanceZero = getInstanceNumber() === 0;
  const isWithinEvent = isWithinEventDate();

  if (isWeekend) {
    console.log(`Is the weekend - workshop is closed`);
    return;
  }

  if (!isWithinEvent || isStartDay()) {
    console.log(`Event is yet to start or pass day 1`);
    return;
  }

  if (!isInstanceZero) {
    console.log(`Skipping job as service is not instance 0`);
    return;
  }

  await handleInactive();

  const result = await updateTeamsNightlyResources();

  for (const item of result) {
    await redis.set(
      constructTeamKey(item.team, KEY_ORE_STORED),
      item.newOreValue,
    );
    await redis.set(
      constructTeamKey(item.team, KEY_MOUND_STORED),
      item.newGiftMoundsValue,
    );
    await redis.set(
      constructTeamKey(item.team, KEY_GIFT_STORED),
      item.newWrappedGiftsValue,
    );
  }

  await resetUserActionPoints();
  await calculateMVE();
  await processDailyEvent();
  await createSnapshot();
};
