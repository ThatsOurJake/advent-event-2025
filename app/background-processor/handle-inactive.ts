import { STARTING_AP } from "../constants";
import { getTeamUserCount, getUsersLeftoverAP, type UserTeamCount } from "../data/user";
import { spendPoints } from "./points-spender";

const calculateLeftoverAP = async () => {
  const result = await getTeamUserCount();

  const teamWithMostPlayers = result.reduce(
    (acc: UserTeamCount | null, current) => {
      if (acc == null) {
        return current;
      }

      if (current.count > acc.count) {
        return current;
      }

      return acc;
    },
    null,
  ) as UserTeamCount;

  const teamsLeftoverAP = await getUsersLeftoverAP();

  return result.map((x) => {
    const { _id: team, count: teamCount } = x;

    const teamLeftoverAP = teamsLeftoverAP.find(x => x._id === team)!.count;
    const playerDiff = teamWithMostPlayers.count - teamCount;

    return {
      team,
      actionPoints: (playerDiff * STARTING_AP) + teamLeftoverAP,
    }
  });
}

export const handleInactive = async () => {
  const teams = await calculateLeftoverAP();

  for (const obj of teams) {
    const { team, actionPoints } = obj;

    if (actionPoints > 0) {
      console.log(`Spending ${actionPoints} for ${team}`);
      await spendPoints(team, actionPoints);
    }
  }
};
