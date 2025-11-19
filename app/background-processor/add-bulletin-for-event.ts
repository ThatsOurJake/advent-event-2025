import { createMessage } from "../data/bulletin-board";
import { getTodaysEvent } from "../utils/get-todays-event";

export const addBulletinForEvent = async () => {
  const todaysEvent = getTodaysEvent();
  const todayDate = new Date().getDate();

  if (!todaysEvent) {
    return;
  }

  await createMessage({
    dateToShow: todayDate,
    message: `**Event Day**: ${todaysEvent.message}`,
    team: 'all',
    dismissible: false,
  });

  console.log(`Created bulletin for event: ${todaysEvent.type}`);
};
