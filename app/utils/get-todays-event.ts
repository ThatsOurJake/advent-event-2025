import game from "../../game.json";
import type { validLocations } from "../api/location-stats/[team]/route";

interface GameEvent {
  date: string;
  type: "LOCATION_CLOSED" | "GLOBAL_RESOURCE_INCREASE" | "CATCH_UP";
  message: string;
}

interface LocationClosedGameEvent extends GameEvent {
  type: "LOCATION_CLOSED";
  data: {
    location: validLocations;
  };
}

interface GlobalResourceIncreaseGameEvent extends GameEvent {
  type: "GLOBAL_RESOURCE_INCREASE";
  data: {
    percentageChance: number;
    increaseTo: number;
  };
}

export interface CatchUpGameEvent extends GameEvent {
  type: "CATCH_UP";
  data: {
    location: validLocations;
    increaseBy: number;
  };
}

export type GameEvents =
  | LocationClosedGameEvent
  | GlobalResourceIncreaseGameEvent
  | CatchUpGameEvent;

const getEventByDate = (date: Date): GameEvents | undefined => {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const dateFormatted = `${day}/${month}/${year}`;

  return game.events.find((event) => event.date === dateFormatted) as
    | GameEvents
    | undefined;
};

export const getTodaysEvent = (): GameEvents | undefined => {
  return getEventByDate(new Date());
};

export const getYesterdaysEvent = (): GameEvents | undefined => {
  const yesterday = new Date();
  const dayOfWeek = yesterday.getDay();

  if (dayOfWeek === 1) {
    yesterday.setDate(yesterday.getDate() - 3);
  } else if (dayOfWeek === 0) {
    yesterday.setDate(yesterday.getDate() - 2);
  } else {
    yesterday.setDate(yesterday.getDate() - 1);
  }

  return getEventByDate(yesterday);
};
