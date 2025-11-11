import { KEY_GIFT_STORED, KEY_GIFT_WRAPPED, KEY_MOUND_COLLECTED, KEY_MOUND_STORED, KEY_ORE_MINED, KEY_ORE_STORED } from "../constants";
import redis from "../services/redis";
import { constructTeamKey } from "../utils/construct-team-key";
import type { User } from "./get-user";

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

export const getCoreStats = async (team: string): Promise<CoreStats> => {
  const [
    oreMined,
    oreStored,
    moundCollected,
    moundStored,
    giftsWrapped,
    giftsStored,
  ] = await Promise.all([
    redis.get(constructTeamKey(team, KEY_ORE_MINED)),
    redis.get(constructTeamKey(team, KEY_ORE_STORED)),
    redis.get(constructTeamKey(team, KEY_MOUND_COLLECTED)),
    redis.get(constructTeamKey(team, KEY_MOUND_STORED)),
    redis.get(constructTeamKey(team, KEY_GIFT_WRAPPED)),
    redis.get(constructTeamKey(team, KEY_GIFT_STORED)),
  ]);


  return {
    ore: {
      mined: Number(oreMined) || 0,
      stored: Number(oreStored) || 0,
    },
    giftMounds: {
      collected: Number(moundCollected) || 0,
      stored: Number(moundStored) || 0,
    },
    wrappedGifts: {
      wrapped: Number(giftsWrapped) || 0,
      stored: Number(giftsStored) || 0,
    },
  };
};

