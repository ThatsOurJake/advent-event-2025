import type { teams } from "../shared-types";
import { createTeam, getTeam } from "./update-team";

// TODO: Seed values based on starting values
export const seedDB = async () => {
  const teams: teams[] = ["red", "green", "blue"];

  for (const team of teams) {
    const found = await getTeam(team);

    if (!found) {
      const result = await createTeam({
        name: team,
        stats: {
          giftMounds: {
            collected: 0,
            stored: 0,
          },
          ore: {
            mined: 0,
            stored: 0,
          },
          wrappedGifts: {
            stored: 0,
            wrapped: 0,
          },
        },
      });

      if (result) {
        console.log(`Created team: ${team}`);
      } else {
        console.log(`Failed to create team: ${team}`);
      }
    }
  }
};
