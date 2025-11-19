import type { teams } from "../shared-types";
import { getTeam } from "./teams";

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

export const getCoreStats = async (team: teams): Promise<CoreStats | null> => {
  const teamDB = await getTeam(team)!;

  if (!teamDB) {
    return null;
  }

  const { stats } = teamDB;
  return stats;
};
