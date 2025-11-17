"use client";

import Link from "next/link";
import { createContext, useCallback, useState } from "react";
import Markdown from "react-markdown";
import { OPEN_TIME } from "../constants";
import type { BulletinMessage } from "../data/bulletin-board";
import type { User } from "../data/user";
import { mapTeamToName, type ThemeColours } from "../utils/map-team";
import { ActivityZone } from "./activity-zone";
import { CoreStatsList } from "./core-stats-list";

interface PageWrapperProps {
  user: User;
  theme: ThemeColours;
  teamScore: string;
  bulletinBoardMessages?: BulletinMessage[];
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
  bulletinBoardMessages = [],
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

  const dayOfWeek = new Date().getDay();
  const hourOfDay = new Date().getHours();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  const isAfterOpeningTime = hourOfDay >= OPEN_TIME;

  if (isWeekend || !isAfterOpeningTime) {
    return (
      <div className="bg-white w-1/2 mx-auto px-2 py-4 rounded border-2 space-y-2">
        <p className="text-center">The workshop is currently closed!</p>
        <img
          src="/static/workshop-closed.png"
          aria-label="A workshop with a closed sign attached to the door"
          className="w-2/3 rounded border-2 mx-auto"
        />
        <p className="text-center">
          Opening times are Mon - Fri @ {OPEN_TIME}:00am - Midnight.
        </p>
      </div>
    );
  }

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
                src={`/api/avatar/${user.userId}`}
                alt="user profile"
                className="rounded-full absolute z-1"
                style={{ top: "28%", left: "34%", width: "29%" }}
              />
            </div>
            <p className="truncate max-w-full">{user?.details.name}</p>
            <p className="text-sm text-center">
              <span className="font-bold">Elf Faction:</span>{" "}
              <Link
                href={`/teams`}
                className={`hover:underline ${theme.teamLinkColour}`}
              >
                {mapTeamToName(user.game.team)}
              </Link>
            </p>
            <p className="text-sm text-center">
              <span className="font-bold">Action points left:</span>{" "}
              {actionPoints}
            </p>
          </div>
          <ActivityZone />
        </div>
        <div className="w-3/4 px-2">
          {bulletinBoardMessages.length > 0 && (
            <div
              className="bg-orange-100 rounded border-2 p-2 mb-2"
              id="bulletin-board"
            >
              <p className="text-center font-bold mb-1">Bulletin board</p>
              <div className="space-y-2">
                {bulletinBoardMessages.map((m) => (
                  <div
                    key={m._id}
                    className="border rounded p-2 bg-white"
                    data-id="mkdown"
                  >
                    <Markdown>{m.message}</Markdown>
                  </div>
                ))}
              </div>
            </div>
          )}
          <CoreStatsList localTeamScore={localTeamScore} />
          <div>{children}</div>
        </div>
      </div>
    </AppContext>
  );
};
