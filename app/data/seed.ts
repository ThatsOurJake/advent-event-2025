import gameJson from "../../game.json";
import { KEY_GIFT_STORED, KEY_MOUND_STORED, KEY_ORE_STORED, KEY_SEEDED } from "../constants";
import redis from "../services/redis";
import type { teams } from "../shared-types";
import { constructTeamKey } from "../utils/construct-team-key";
import { createMessage } from "./bulletin-board";
import { createTeam, getTeam } from "./teams";

export const seedDB = async () => {
  const teams: teams[] = ["red", "green", "blue"];
  const { startingStats } = gameJson;
  const hasSeeded = await redis.exists(KEY_SEEDED);

  if (hasSeeded) {
    return;
  }

  for (const team of teams) {
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

  await createMessage({
    team: 'all',
    dateToShow: 1,
    message: `The Christmas advent event 2025 is here ✨.
This years is slightly different to previous years, to help with that a [guide](https://google.co.uk) has been put together!`
  });

  await redis.set(KEY_SEEDED, 1);
};
