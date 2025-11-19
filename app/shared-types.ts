import type { validLocations } from "./api/location-stats/[team]/route";
import type { TEAMS_ARR } from "./constants";

export interface PostGameBasePayload {
  game: validLocations;
}

export interface PostGameMinePayload extends PostGameBasePayload {
  didMineOre: boolean;
}

export interface PostGameForgePayload extends PostGameBasePayload {
  action: "start" | "end";
  passed?: boolean;
}

export interface PostGameWrappingPayload extends PostGameBasePayload {
  passed?: boolean;
}

export type teams = (typeof TEAMS_ARR)[number];

export type ActivityTypes =
  | "USE_MINE"
  | "USE_FORGE"
  | "USE_WRAP"
  | "USE_SLEIGH";
