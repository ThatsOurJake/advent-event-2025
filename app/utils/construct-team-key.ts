export const constructTeamKey = (team: string, redisKey: string) =>
  `${team}:${redisKey}`;
