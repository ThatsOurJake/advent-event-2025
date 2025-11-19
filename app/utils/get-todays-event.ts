import game from "../../game.json";
import type { validLocations } from "../api/location-stats/[team]/route";

interface GameEvent {
  date: string;
  type: "LOCATION_CLOSED" | "GLOBAL_RESOURCE_INCREASE";
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

export type GameEvents = LocationClosedGameEvent | GlobalResourceIncreaseGameEvent;

// TODO: Revert
// export const getTodaysEvent = (): GameEvents | undefined => {
//   const today = new Date();
//   const day = String(today.getDate()).padStart(2, "0");
//   const month = String(today.getMonth() + 1).padStart(2, "0");
//   const year = today.getFullYear();
//   const todayFormatted = `${day}/${month}/${year}`;

//   return game.events.find((event) => event.date === todayFormatted) as GameEvents | undefined;
// };

export const getTodaysEvent = (): GameEvents | undefined => {
  return {
    "date": "19/11/2025",
    "type": "GLOBAL_RESOURCE_INCREASE",
    "data": {
      increaseTo: 2,
      percentageChance: 30
    },
    "message": "There has been a collapse in the mine meaning this location will be closed today."
  };
};
