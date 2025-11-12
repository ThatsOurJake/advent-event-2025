import type { validLocations } from "../api/location-stats/[team]/route";
import type { PostGameMinePayload } from "../shared-types";

export async function reportGameResult(game: "mine", payload: Omit<PostGameMinePayload, 'game'>): Promise<boolean>;
export async function reportGameResult(game: validLocations, payload: object): Promise<boolean> {
  const res = await fetch("/api/game", {
    method: "POST",
    body: JSON.stringify({
      game,
      ...payload,
    }),
    headers: {
      "content-type": "application/json",
    },
  });

  return res.ok;
}
