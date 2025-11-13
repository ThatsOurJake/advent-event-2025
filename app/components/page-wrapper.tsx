"use client";

import { createContext, useCallback, useState } from "react";
import type { User } from "../data/get-user";
import { mapTeamToName, type ThemeColours } from "../utils/map-team";
import { CoreStatsList } from "./core-stats-list";

interface PageWrapperProps {
  user: User;
  theme: ThemeColours;
  teamScore: string;
  children: React.ReactNode;
}

type AppContextProps = Omit<PageWrapperProps, "children"> & {
  decreaseActionPoints: () => void;
  increaseTeamScore: () => void;
};

export const AppContext = createContext<AppContextProps>({} as AppContextProps);

export const PageWrapper = ({
  theme,
  user,
  teamScore,
  children,
}: PageWrapperProps) => {
  const [actionPoints, setActionPoints] = useState<number>(
    user.game.actionPoints,
  );
  const [localTeamScore, setTeamScore] = useState<number>(Number(teamScore));

  const decreaseActionPoints = useCallback(() => {
    setActionPoints(actionPoints - 1);
  }, [actionPoints]);

  const increaseTeamScore = useCallback(() => {
    setTeamScore(localTeamScore + 1);
  }, [localTeamScore]);

  return (
    <AppContext
      value={{
        theme,
        user,
        teamScore,
        decreaseActionPoints,
        increaseTeamScore,
      }}
    >
      <div className="flex flex-row">
        <div className="w-1/4">
          <div
            className={`mb-2 p-4 text-center border-2 border-black rounded flex flex-col justify-center items-center gap-y-1 ${theme.background}`}
          >
            <p className="font-bold">Elf Identification Card</p>
            <div className="w-1/2 mx-auto relative" aria-hidden>
              <img
                src="/static/elf.png"
                alt="user frame"
                className="w-full relative z-10 rounded border-2"
              />
              <img
                src={`https://api.dicebear.com/9.x/lorelei-neutral/svg?seed=${user?.userId}&backgroundColor=d68851,d68851`}
                alt="user profile"
                className="rounded-full absolute z-1"
                style={{ top: "28%", left: "34%", width: "29%" }}
              />
            </div>
            <p className="truncate max-w-full">{user?.details.name}</p>
            <p className="text-sm text-center">
              <span className="font-bold">Elf Faction:</span>{" "}
              {mapTeamToName(user.game.team)}
            </p>
            <p className="text-sm text-center">
              <span className="font-bold">Action points left:</span>{" "}
              {actionPoints}
            </p>
            <p className="text-sm text-center">
              <span className="font-bold">Teams current score:</span>{" "}
              {localTeamScore}
            </p>
          </div>
          <CoreStatsList />
        </div>
        <div className="w-3/4 px-2">{children}</div>
      </div>
    </AppContext>
  );
};
