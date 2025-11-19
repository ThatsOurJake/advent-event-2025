import gameJson from "../../game.json";
import { KEY_GIFT_STORED, KEY_MOUND_STORED, KEY_ORE_STORED, KEY_SEEDED, TEAMS_ARR } from "../constants";
import redis from "../services/redis";
import { constructTeamKey } from "../utils/construct-team-key";
import { createTeam, getTeam } from "./teams";

export const seedDB = async () => {
  const { startingStats } = gameJson;
  const hasSeeded = await redis.exists(KEY_SEEDED);

  if (hasSeeded) {
    return;
  }

  for (const team of TEAMS_ARR) {
    const found = await getTeam(team);

    if (!found) {
      const result = await createTeam({
        name: team,
        stats: {
          score: 0,
          ore: {
            mined: 0,
            stored: startingStats.ore,
          },
          giftMounds: {
            collected: 0,
            stored: startingStats.giftMounds,
          },
          wrappedGifts: {
            wrapped: 0,
            stored: startingStats.wrappedGifts,
          },
        },
      });

      await redis.set(constructTeamKey(team, KEY_ORE_STORED), startingStats.ore);
      await redis.set(constructTeamKey(team, KEY_MOUND_STORED), startingStats.giftMounds);
      await redis.set(constructTeamKey(team, KEY_GIFT_STORED), startingStats.wrappedGifts);

      if (result) {
        console.log(`Created team: ${team}`);
      } else {
        console.log(`Failed to create team: ${team}`);
      }
    }
  }

  await redis.set(KEY_SEEDED, 1);
};
