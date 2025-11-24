import { envStr } from "env-helpers";

export const STARTING_AP = 3;

export const KEY_ORE_STORED = 'ore_stored';
export const KEY_MOUND_STORED = 'mound_stored';
export const KEY_GIFT_STORED = 'gift_stored';

export const KEY_SEEDED = 'seeded';

export const VALID_LOCATIONS_ARR = [
  "mine",
  "forge",
  "wrap_station",
  "sleigh",
] as const;

export const TEAMS_ARR = ["red", "green", "blue"] as const;

export const USER_COLLECTION = "users";
export const TEAM_COLLECTION = "teams";
export const ACTIVITY_COLLECTION = "activity";
export const BULLETIN_COLLECTION = "bulletins";
export const MVE_COLLECTION = "most-valued-elves";
export const TEAM_SNAPSHOT_COLLECTION = "teams-snapshot";

export const FAILURE_PERCENTAGE = 2; // Below n from 1, 10

// After 5am the game can be access
export const OPEN_TIME = 5;

export const COOKIE_BULLETINS_DISMISSED = 'COOKIE_BULLETINS_DISMISSED';

export const CRON_SCHEDULE = envStr('CRON_SCHEDULE', '0 1 * * *') // 1am Everyday
