import fs from 'node:fs';
import path from 'node:path';

import { KEY_GIFT_STORED, KEY_MOUND_STORED, KEY_ORE_STORED, KEY_SCORE } from "../../constants";
import { updateTeamStats } from "../../data/update-team";
import { decrUserActionPoints } from "../../data/update-user";
import redis from "../../services/redis";
import type { PostGameForgePayload, PostGameMinePayload, PostGameWrappingPayload, teams } from "../../shared-types";
import { constructTeamKey } from "../../utils/construct-team-key";
import type { validLocations } from "../location-stats/[team]/route";

const checkResourceScript = fs.readFileSync(
  path.resolve("app", "lua", "check_resource.lua"),
);

const processMineGame = async (userId: string, team: teams, payload: PostGameMinePayload) => {
  await decrUserActionPoints(userId);

  if (payload.didMineOre) {
    await updateTeamStats(team, 'stats.ore.mined', 1);
  }

  return undefined;
};

const processForgeGame = async (userId: string, team: teams, payload: PostGameForgePayload) => {
  const { action, passed } = payload;

  if (action === 'start') {
    const res = await redis.eval(checkResourceScript, 1, constructTeamKey(team, KEY_ORE_STORED), 1);

    if (res === 1) {
      await updateTeamStats(team, 'stats.ore.stored', -1);

      return {
        success: true
      }
    }

    return {
      success: false,
    }
  }

  await decrUserActionPoints(userId);

  if (action === 'end' && passed) {
    await updateTeamStats(team, 'stats.giftMounds.collected', 1);
  }

  return undefined;
};

const processWrappingGame = async (userId: string, team: teams, payload: PostGameWrappingPayload) => {
  const { passed } = payload;

  const res = await redis.eval(checkResourceScript, 1, constructTeamKey(team, KEY_MOUND_STORED), 1);

  if (res !== 1) {
    return {
      success: false,
    }
  }

  await decrUserActionPoints(userId);
  await updateTeamStats(team, 'stats.giftMounds.stored', -1);

  if (passed) {
    await updateTeamStats(team, 'stats.wrappedGifts.wrapped', 1);
  }

  return {
    success: true,
  }
};

const processSleighGame = async (userId: string, team: teams, payload: PostGameForgePayload) => {
  const { action, passed } = payload;

  if (action === 'start') {
    const res = await redis.eval(checkResourceScript, 1, constructTeamKey(team, KEY_GIFT_STORED), 1);

    if (res === 1) {
      await updateTeamStats(team, 'stats.wrappedGifts.stored', -1);

      return {
        success: true
      }
    }

    return {
      success: false,
    }
  }

  await decrUserActionPoints(userId);

  if (action === 'end' && passed) {
    await redis.incr(constructTeamKey(team, KEY_SCORE));
    await updateTeamStats(team, 'stats.score', 1);
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

  if (game === 'wrap_station') {
    return processWrappingGame(userId, team, payload as PostGameWrappingPayload);
  }

  if (game === 'sleigh') {
    return processSleighGame(userId, team, payload as PostGameForgePayload);
  }
};
