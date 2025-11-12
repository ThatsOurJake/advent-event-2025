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

export type teams = "red" | "green" | "blue";
