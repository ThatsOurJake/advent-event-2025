import { FAILURE_PERCENTAGE } from "../constants";
import { getTeam, setTeamStat, type Team } from "../data/teams";
import type { ActivityTypes, teams } from "../shared-types";
import { rng } from "../utils/random";

/**
 * Weighting to allow scoring points more likely
 * With the mine being the least likely as this can be done all the time and we want to try focus on gaining score
*/
const getValidActivities = (team: Team) => {
  const result: ActivityTypes[] = [
    'USE_MINE'
  ];

  const {
    stats: { giftMounds, ore, wrappedGifts },
  } = team;

  if (ore.stored > 0) {
    result.push("USE_FORGE", "USE_FORGE");
  }

  if (giftMounds.stored > 0) {
    result.push("USE_WRAP", "USE_WRAP");
  }

  if (wrappedGifts.stored > 0) {
    result.push("USE_SLEIGH", "USE_SLEIGH", "USE_SLEIGH");
  }

  return result;
};

export const spendPoints = async (team: teams, actionPoints: number) => {
  const teamDB = await getTeam(team);

  if (!teamDB) {
    console.error(`Team: ${team} not in the db`);
    return;
  }

  const successActions: ActivityTypes[] = [];

  for (let i = 0; i < actionPoints; i++) {
    const activities = getValidActivities(teamDB);
    const activityIndex = rng(1, activities.length) - 1;
    const activity = activities[activityIndex];
    const successful = rng(1, 10) > FAILURE_PERCENTAGE;
    console.log(`Team: ${team} - Activity: ${activity} - Was Success: ${successful}`);

    if (successful) {
      successActions.push(activity);

      switch (activity) {
        case 'USE_MINE':
          teamDB.stats.ore.mined++;
          break;
        case 'USE_FORGE':
          teamDB.stats.ore.stored--;
          teamDB.stats.giftMounds.collected++;
          break;
        case 'USE_WRAP':
          teamDB.stats.giftMounds.stored--;
          teamDB.stats.wrappedGifts.wrapped++;
          break;
        case 'USE_SLEIGH':
          teamDB.stats.wrappedGifts.stored--;
          teamDB.stats.score++;
          break;
      }
    }
  }

  await setTeamStat(team, 'stats.ore.mined', teamDB.stats.ore.mined);
  await setTeamStat(team, 'stats.ore.stored', teamDB.stats.ore.stored);

  await setTeamStat(team, 'stats.giftMounds.collected', teamDB.stats.giftMounds.collected);
  await setTeamStat(team, 'stats.giftMounds.stored', teamDB.stats.giftMounds.stored);

  await setTeamStat(team, 'stats.wrappedGifts.wrapped', teamDB.stats.wrappedGifts.wrapped);
  await setTeamStat(team, 'stats.wrappedGifts.stored', teamDB.stats.wrappedGifts.stored);

  await setTeamStat(team, 'stats.score', teamDB.stats.score);

  return successActions;
};
