import { useContext, useEffect, useState } from "react";
import type { CoreStats } from "../data/core-stats";
import { type FetchCallback, regularlyFetch } from "../utils/regularly-fetch";
import { AppContext } from "./page-wrapper";

export const CoreStatsList = () => {
  const { user } = useContext(AppContext);
  const {
    game: { team },
  } = user;

  const [coreStats, setCoreStats] = useState<CoreStats>({
    giftMounds: {
      collected: 0,
      stored: 0,
    },
    ore: {
      mined: 0,
      stored: 0,
    },
    wrappedGifts: {
      stored: 0,
      wrapped: 0,
    },
  });

  useEffect(() => {
    const onResp: FetchCallback<CoreStats> = (errored, resp, error) => {
      if (errored || !resp) {
        console.error(error);
        return;
      }

      setCoreStats(resp);
    };

    const interval = regularlyFetch<CoreStats>(
      `/api/core-stats/${team}`,
      5000,
      onResp,
    );

    return () => {
      clearInterval(interval);
    };
  }, [team]);

  return (
    <div className="w-full flex flex-col gap-y-2">
      <div className="p-4 text-center bg-lime-100 border-2 border-black rounded flex flex-col justify-center items-center">
        <p className="font-bold">Mined Ore:</p>
        <p>Mined Today: {coreStats.ore.mined}</p>
        <p>In Storage: {coreStats.ore.stored}</p>
      </div>
      <div className="p-4 text-center bg-lime-100 border-2 border-black rounded flex flex-col justify-center items-center">
        <p className="font-bold">Gift Mounds:</p>
        <p>Collected Today: {coreStats.giftMounds.collected}</p>
        <p>In Storage: {coreStats.giftMounds.stored}</p>
      </div>
      <div className="p-4 text-center bg-lime-100 border-2 border-black rounded flex flex-col justify-center items-center">
        <p className="font-bold">Wrapped Gifts:</p>
        <p>Wrapped Today: {coreStats.wrappedGifts.wrapped}</p>
        <p>In Storage: {coreStats.wrappedGifts.stored}</p>
      </div>
    </div>
  );
};
