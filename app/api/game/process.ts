import fs from "node:fs";
import path from "node:path";

import {
  KEY_GIFT_STORED,
  KEY_MOUND_STORED,
  KEY_ORE_STORED,
} from "../../constants";
import { addActivityItem } from "../../data/activity-feed";
import { updateTeamStats } from "../../data/teams";
import { decrUserActionPoints } from "../../data/user";
import redis from "../../services/redis";
import type {
  PostGameForgePayload,
  PostGameMinePayload,
  PostGameWrappingPayload,
  teams,
} from "../../shared-types";
import { calculateTaskOutcome } from "../../utils/calculate-task-outcome";
import { constructTeamKey } from "../../utils/construct-team-key";
import type { validLocations } from "../location-stats/[team]/route";

const checkResourceScript = fs.readFileSync(
  path.resolve("app", "lua", "check_resource.lua"),
);

const processMineGame = async (
  userId: string,
  team: teams,
  actionPoints: number,
  payload: PostGameMinePayload,
) => {
  await decrUserActionPoints(userId);

  if (payload.didMineOre) {
    const taskOutcome = calculateTaskOutcome(userId, actionPoints, "mine");
    await updateTeamStats(team, "stats.ore.mined", taskOutcome);
    await addActivityItem({
      team,
      type: "USE_MINE",
      userId,
      amount: taskOutcome,
    });
    console.log(`Updated: ${team} ore mined by ${taskOutcome}`);
  }

  return undefined;
};

const processForgeGame = async (
  userId: string,
  team: teams,
  actionPoints: number,
  payload: PostGameForgePayload,
) => {
  const { action, passed } = payload;

  if (action === "start") {
    const res = await redis.eval(
      checkResourceScript,
      1,
      constructTeamKey(team, KEY_ORE_STORED),
      1,
    );

    if (res === 1) {
      await updateTeamStats(team, "stats.ore.stored", -1);

      return {
        success: true,
      };
    }

    return {
      success: false,
    };
  }

  await decrUserActionPoints(userId);

  if (action === "end" && passed) {
    const taskOutcome = calculateTaskOutcome(userId, actionPoints, "forge");
    await updateTeamStats(team, "stats.giftMounds.collected", taskOutcome);
    await addActivityItem({
      team,
      type: "USE_FORGE",
      userId,
      amount: taskOutcome,
    });
    console.log(`Updated: ${team} gift mounds by ${taskOutcome}`);
  }

  return undefined;
};

const processWrappingGame = async (
  userId: string,
  team: teams,
  actionPoints: number,
  payload: PostGameWrappingPayload,
) => {
  const { passed } = payload;

  const res = await redis.eval(
    checkResourceScript,
    1,
    constructTeamKey(team, KEY_MOUND_STORED),
    1,
  );

  if (res !== 1) {
    return {
      success: false,
    };
  }

  await decrUserActionPoints(userId);
  await updateTeamStats(team, "stats.giftMounds.stored", -1);

  if (passed) {
    const taskOutcome = calculateTaskOutcome(
      userId,
      actionPoints,
      "wrap_station",
    );
    await updateTeamStats(team, "stats.wrappedGifts.wrapped", taskOutcome);
    await addActivityItem({
      team,
      type: "USE_WRAP",
      userId,
      amount: taskOutcome,
    });
    console.log(`Updated: ${team} gifts wrapped by ${taskOutcome}`);
  }

  return {
    success: true,
  };
};

const processSleighGame = async (
  userId: string,
  team: teams,
  payload: PostGameForgePayload,
) => {
  const { action, passed } = payload;

  if (action === "start") {
    const res = await redis.eval(
      checkResourceScript,
      1,
      constructTeamKey(team, KEY_GIFT_STORED),
      1,
    );

    if (res === 1) {
      await updateTeamStats(team, "stats.wrappedGifts.stored", -1);

      return {
        success: true,
      };
    }

    return {
      success: false,
    };
  }

  await decrUserActionPoints(userId);

  if (action === "end" && passed) {
    await updateTeamStats(team, "stats.score", 1);
    await addActivityItem({
      team,
      type: "USE_SLEIGH",
      userId,
      amount: 1,
    });
  }

  return undefined;
};

export const processGame = async (
  userId: string,
  team: teams,
  actionPoints: number,
  game: validLocations,
  payload: object,
): Promise<object | undefined> => {
  console.log(`Processing game: ${game} - ${JSON.stringify(payload)}`);

  if (game === "mine") {
    return processMineGame(
      userId,
      team,
      actionPoints,
      payload as PostGameMinePayload,
    );
  }

  if (game === "forge") {
    return processForgeGame(
      userId,
      team,
      actionPoints,
      payload as PostGameForgePayload,
    );
  }

  if (game === "wrap_station") {
    return processWrappingGame(
      userId,
      team,
      actionPoints,
      payload as PostGameWrappingPayload,
    );
  }

  if (game === "sleigh") {
    return processSleighGame(userId, team, payload as PostGameForgePayload);
  }
};
