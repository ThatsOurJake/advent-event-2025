import { KEY_GIFT_STORED, KEY_MOUND_STORED, KEY_ORE_STORED } from "../constants";
import { updateTeamsNightlyResources } from "../data/teams";
import { resetUserActionPoints } from "../data/user";
import redis from "../services/redis";
import { constructTeamKey } from "../utils/construct-team-key";
import { handleInactive } from "./handle-inactive";

export const backgroundProcessor = async () => {
  await handleInactive();

  const result = await updateTeamsNightlyResources();

  for (const item of result) {
    await redis.set(constructTeamKey(item.team, KEY_ORE_STORED), item.newOreValue);
    await redis.set(constructTeamKey(item.team, KEY_MOUND_STORED), item.newGiftMoundsValue);
    await redis.set(constructTeamKey(item.team, KEY_GIFT_STORED), item.newWrappedGiftsValue);
  }

  await resetUserActionPoints();
};
