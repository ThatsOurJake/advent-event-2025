import type { validLocations } from "./api/location-stats/[team]/route";

export interface PostGameBasePayload {
  game: validLocations;
}

export interface PostGameMinePayload extends PostGameBasePayload {
  didMineOre: boolean;
}

export interface PostGameForgePayload extends PostGameBasePayload {
  action: 'start' | 'end';
  passed?: boolean;
}

export interface PostGameWrappingPayload extends PostGameBasePayload {
  passed?: boolean;
}

export type teams = "red" | "green" | "blue";

export type ActivityTypes =
  | "USE_MINE"
  | "USE_FORGE"
  | "USE_WRAP"
  | "USE_SLEIGH";
