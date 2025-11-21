import { KEY_GIFT_STORED, KEY_MOUND_STORED, KEY_ORE_STORED } from "../constants";
import { createSnapshot, updateTeamsNightlyResources } from "../data/teams";
import { resetUserActionPoints } from "../data/user";
import redis from "../services/redis";
import { constructTeamKey } from "../utils/construct-team-key";
import { isWithinEventDate } from "../utils/event-date-helpers";
import { addBulletinForEvent } from "./add-bulletin-for-event";
import { calculateMVE } from "./calculate-mve";
import { handleInactive } from "./handle-inactive";

// TODO: Run on instance 0 only
// TODO: Revert isWithinEvent
export const backgroundProcessor = async () => {
  const dayOfWeek = new Date().getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  // const isWithinEvent = isWithinEventDate();
  const isWithinEvent = true;

  if (isWeekend) {
    console.log(`Is the weekend - workshop is closed`);
    return;
  }

  if (!isWithinEvent) {
    console.log(`Event is yet to start`);
    return;
  }

  await handleInactive();

  const result = await updateTeamsNightlyResources();

  for (const item of result) {
    await redis.set(constructTeamKey(item.team, KEY_ORE_STORED), item.newOreValue);
    await redis.set(constructTeamKey(item.team, KEY_MOUND_STORED), item.newGiftMoundsValue);
    await redis.set(constructTeamKey(item.team, KEY_GIFT_STORED), item.newWrappedGiftsValue);
  }

  await resetUserActionPoints();
  await calculateMVE();
  await addBulletinForEvent();
  await createSnapshot();
};
