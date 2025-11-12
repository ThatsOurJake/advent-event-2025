import fs from 'node:fs';
import path from 'node:path';

import { KEY_MOUND_COLLECTED, KEY_ORE_MINED, KEY_ORE_STORED } from "../../constants";
import { updateTeamStats } from "../../data/update-team";
import { decrUserActionPoints } from "../../data/update-user";
import redis from "../../services/redis";
import type { PostGameForgePayload, PostGameMinePayload, teams } from "../../shared-types";
import { constructTeamKey } from "../../utils/construct-team-key";
import type { validLocations } from "../location-stats/[team]/route";

const checkResourceScript = fs.readFileSync(
  path.resolve("app", "lua", "check_resource.lua"),
);

const processMineGame = async (userId: string, team: teams, payload: PostGameMinePayload) => {
  await decrUserActionPoints(userId);

  if (payload.didMineOre) {
    await redis.incr(constructTeamKey(team, KEY_ORE_MINED));
    await updateTeamStats(team, 'stats.ore.mined', 1);
  }

  return undefined;
};

const processForgeGame = async (userId: string, team: teams, payload: PostGameForgePayload) => {
  const { action, passed } = payload;

  if (action === 'start') {
    await decrUserActionPoints(userId);
    await updateTeamStats(team, 'stats.ore.stored', -1);
    const res = await redis.eval(checkResourceScript, 1, constructTeamKey(team, KEY_ORE_STORED), 0);

    if (res === 1) {
      return {
        success: true
      }
    }

    return {
      success: false,
    }
  }

  if (action === 'end' && passed) {
    await updateTeamStats(team, 'stats.giftMounds.collected', 1);
    await redis.incr(constructTeamKey(team, KEY_MOUND_COLLECTED));
  }

  return undefined;
};

export const processGame = async (
  userId: string,
  team: teams,
  game: validLocations,
  payload: object,
): Promise<object | undefined> => {
  if (game === "mine") {
    return processMineGame(userId, team, payload as PostGameMinePayload);
  }

  if (game === "forge") {
    return processForgeGame(userId, team, payload as PostGameForgePayload);
  }
};
