import game from "../../game.json";
import { TEAMS_ARR } from "../constants";
import { getAchievementActivities } from "../data/get-activity-feed";
import { createMVEEntry, type MostValuedElvesAward } from "../data/mve";
import type { teams } from "../shared-types";

const { daysGenerateMVE } = game;

export const calculateMVE = async () => {
  const dayOfWeek = new Date().getDay();
  const is5Day = (dayOfWeek % daysGenerateMVE) === 0;

  if (!is5Day) {
    console.log("Not a 5th Day - Skipping calculating MVEs");
    return;
  }

  const awards: MostValuedElvesAward[] = [];

  for (const team of TEAMS_ARR) {
    const results = await getAchievementActivities(team);

    const mineResult = results.find((x) => x.type === "USE_MINE");
    const forgeResult = results.find((x) => x.type === "USE_FORGE");
    const wrapResult = results.find((x) => x.type === "USE_WRAP");
    const sleighResult = results.find((x) => x.type === "USE_SLEIGH");

    awards.push({
      team: team as teams,
      mine: {
        userId: mineResult?.userId || "",
        count: mineResult?.count || 0,
      },
      forge: {
        userId: forgeResult?.userId || "",
        count: forgeResult?.count || 0,
      },
      wrap: {
        userId: wrapResult?.userId || "",
        count: wrapResult?.count || 0,
      },
      sleigh: {
        userId: sleighResult?.userId || "",
        count: sleighResult?.count || 0,
      },
    });
  }

  await createMVEEntry({
    awards
  });

  console.log('Created MVE');
};
