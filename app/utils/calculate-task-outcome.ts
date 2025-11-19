// This function will give the outcome of a task and the active event, usually it'll return 1

import type { validLocations } from "../api/location-stats/[team]/route";
import { getTodaysEvent } from "./get-todays-event";
import { rngSeeded } from "./random";

// We will share this function client and server side with seeded rng to get the same outcome
export const calculateTaskOutcome = (
  userId: string,
  actionPoints: number,
  game: validLocations,
) => {
  const todaysEvent = getTodaysEvent();
  const shouldAffectedOutcome =
    todaysEvent?.type === "GLOBAL_RESOURCE_INCREASE";

  if (shouldAffectedOutcome) {
    const { percentageChance, increaseTo } = todaysEvent.data;
    const seed = `${actionPoints}-${userId}-${game}`;
    const rng = rngSeeded(1, 100, seed);

    if (rng < percentageChance) {
      return increaseTo;
    }
  }

  return 1;
};
