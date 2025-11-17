import { useContext, useEffect, useState } from "react";
import type { CoreStats } from "../data/core-stats";
import { type FetchCallback, regularlyFetch } from "../utils/regularly-fetch";
import { AppContext } from "./page-wrapper";

interface CoreStatsListProps {
  localTeamScore: number;
}

export const CoreStatsList = ({ localTeamScore }: CoreStatsListProps) => {
  const {
    user,
    theme: { background },
  } = useContext(AppContext);
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
    <div className="w-full grid grid-cols-4">
      <div
        className={`p-2 mb-2 mr-2 ml-2 text-center border-2 border-black rounded flex flex-col justify-center items-center ${background}`}
      >
        <p className="font-bold">Mined Ore:</p>
        <p className="text-sm">Mined Today: {coreStats.ore.mined}</p>
        <p className="text-sm">In Storage: {coreStats.ore.stored}</p>
      </div>
      <div
        className={`p-2 mb-2 mr-2 ml-2 text-center border-2 border-black rounded flex flex-col justify-center items-center ${background}`}
      >
        <p className="font-bold">Gift Mounds:</p>
        <p className="text-sm">
          Forged Today: {coreStats.giftMounds.collected}
        </p>
        <p className="text-sm">In Storage: {coreStats.giftMounds.stored}</p>
      </div>
      <div
        className={`p-2 mb-2 mr-2 ml-2 text-center border-2 border-black rounded flex flex-col justify-center items-center ${background}`}
      >
        <p className="font-bold">Wrapped Gifts:</p>
        <p className="text-sm">
          Wrapped Today: {coreStats.wrappedGifts.wrapped}
        </p>
        <p className="text-sm">In Storage: {coreStats.wrappedGifts.stored}</p>
      </div>
      <div className="p-2 mb-2 mr-2 text-center bg-yellow-100 border-2 border-black rounded flex flex-col justify-center items-center">
        <p className="font-bold">Team Score:</p>
        <p className="text-sm">{localTeamScore} point(s)</p>
      </div>
    </div>
  );
};
