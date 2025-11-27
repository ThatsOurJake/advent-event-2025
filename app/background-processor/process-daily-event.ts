import { createMessage } from "../data/bulletin-board";
import { getTeamScores, updateTeamStats } from "../data/teams";
import {
  type CatchUpGameEvent,
  getTodaysEvent,
} from "../utils/get-todays-event";

const processCatchUp = async (todayDate: number, data: CatchUpGameEvent) => {
  const teamScores = await getTeamScores();
  const sorted = teamScores.sort((a, b) => a.stats.score - b.stats.score);
  const lastPlace = sorted.shift();

  if (!lastPlace) {
    return;
  }

  const { name } = lastPlace;
  const {
    data: { increaseBy, location },
  } = data;

  switch (location) {
    case "mine":
      await updateTeamStats(name, "stats.ore.stored", increaseBy);
      break;
    case "forge":
      await updateTeamStats(name, "stats.giftMounds.stored", increaseBy);
      break;
    case "wrap_station":
      await updateTeamStats(name, "stats.wrappedGifts.stored", increaseBy);
      break;
    default:
      break;
  }

  await createMessage({
    dateToShow: todayDate,
    message: `**Event Day**: ${data.message}`,
    team: name,
    dismissible: false,
  });

  console.log(`CatchUp: Increased ${name} - ${location} by ${increaseBy}`);
};

export const processDailyEvent = async () => {
  const todaysEvent = getTodaysEvent();
  const todayDate = new Date().getDate();

  if (!todaysEvent) {
    return;
  }

  if (todaysEvent.type === "CATCH_UP") {
    await processCatchUp(todayDate, todaysEvent);
  } else {
    await createMessage({
      dateToShow: todayDate,
      message: `**Event Day**: ${todaysEvent.message}`,
      team: "all",
      dismissible: false,
    });
  }

  console.log(`Created bulletin for event: ${todaysEvent.type}`);
};
