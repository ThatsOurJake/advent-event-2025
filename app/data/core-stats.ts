import type { teams } from "../shared-types";
import { getTeam } from "./update-team";

export interface CoreStats {
  ore: {
    mined: number;
    stored: number;
  };
  giftMounds: {
    collected: number;
    stored: number;
  };
  wrappedGifts: {
    wrapped: number;
    stored: number;
  };
}

// TODO: I think I want this to be read from mongo as it'll slow down redis, we will also store it in redis
export const getCoreStats = async (team: teams): Promise<CoreStats | null> => {
  const teamDB = await getTeam(team)!;

  if (!teamDB) {
    return null;
  }

  const { stats } = teamDB;
  return stats;
};
