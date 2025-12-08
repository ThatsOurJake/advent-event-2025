import game from "../../game.json";

const { endDate, startDate, hideScoresFrom } = game;

export const isWithinEventDate = (): boolean => {
  const now = new Date();

  const [startDay, startMonth, startYear] = startDate.split("/").map(Number);
  const [endDay, endMonth, endYear] = endDate.split("/").map(Number);

  const start = new Date(startYear, startMonth - 1, startDay);
  const end = new Date(endYear, endMonth - 1, endDay);

  return now >= start && now <= end;
};

export const isBeforeEventDate = (): boolean => {
  const now = new Date();

  const [startDay, startMonth, startYear] = startDate.split("/").map(Number);

  const start = new Date(startYear, startMonth - 1, startDay);

  return now < start;
};

export const isAfterEventDate = (): boolean => {
  const now = new Date();

  const [endDay, endMonth, endYear] = endDate.split("/").map(Number);

  const end = new Date(endYear, endMonth - 1, endDay);

  return now >= end;
};

export const isStartDay = (): boolean => {
  const now = new Date();

  const [startDay, startMonth, startYear] = startDate.split("/").map(Number);
  const start = new Date(startYear, startMonth - 1, startDay);

  return now.toDateString() === start.toDateString();
};

export const shouldHideScorePanel = (): boolean => {
  const now = new Date();

  const [day, month, year] = hideScoresFrom.split("/").map(Number);
  const date = new Date(year, month - 1, day);

  return now >= date;
}
