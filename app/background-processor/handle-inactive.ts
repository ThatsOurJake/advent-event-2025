import { STARTING_AP } from "../constants";
import { createMessage } from "../data/bulletin-board";
import {
  getTeamUserCount,
  getUsersLeftoverAP,
  type UserTeamCount,
} from "../data/user";
import type { ActivityTypes } from "../shared-types";
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

    const teamLeftoverAP = teamsLeftoverAP.find((x) => x._id === team)!.count;
    const playerDiff = teamWithMostPlayers.count - teamCount;

    return {
      team,
      actionPoints: playerDiff * STARTING_AP + teamLeftoverAP,
    };
  });
};

export const handleInactive = async () => {
  const teams = await calculateLeftoverAP();
  const todayDate = new Date().getDate();

  for (const obj of teams) {
    const { team, actionPoints } = obj;

    if (actionPoints > 0) {
      console.log(`Spending ${actionPoints} for ${team}`);
      const activities = await spendPoints(team, actionPoints);

      if (!activities) {
        continue;
      }

      const activityCounts = activities.reduce(
        (acc: Map<ActivityTypes, number>, current) => {
          if (acc.has(current)) {
            const val = acc.get(current)!;
            acc.set(current, val + 1);
          } else {
            acc.set(current, 1);
          }

          return acc;
        },
        new Map<ActivityTypes, number>(),
      );

      const bulletinMessageParts: string[] = [
        "🌙 The night elves have been working through the night, this resulted in the following:",
      ];

      for (const entry of activityCounts.entries()) {
        const [activity, count] = entry;

        switch (activity) {
          case "USE_MINE":
            bulletinMessageParts.push(`- Mined "${count}" ore`);
            break;
          case "USE_FORGE":
            bulletinMessageParts.push(`- Forged "${count}" gift mound(s)`);
            break;
          case "USE_WRAP":
            bulletinMessageParts.push(`- Wrapped "${count}" gift(s)`);
            break;
          case "USE_SLEIGH":
            bulletinMessageParts.push(
              `- Loaded "${count}" gift(s) on to the sleigh, resulting in +${count} score`,
            );
            break;
        }
      }

      await createMessage({
        dateToShow: todayDate,
        message: bulletinMessageParts.join("\n"),
        team,
        dismissible: true,
      });
    }
  }
};
