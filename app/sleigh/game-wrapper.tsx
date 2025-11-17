"use client";

import Link from "next/link";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { AppContext } from "../components/page-wrapper";
import { rngSeeded } from "../utils/random";
import {
  type BumperPattern,
  GAME_EVENTS,
  loadGame,
  validBumperPatterns,
} from "./game";

interface SleighGameResult {
  caughtGift: boolean;
}

interface SleighGameProps {
  giftsStored: number;
}

const SleighGame = ({ giftsStored }: SleighGameProps) => {
  const {
    user: {
      userId,
      game: { actionPoints },
    },
    decreaseActionPoints,
    increaseTeamScore,
  } = useContext(AppContext);

  const [loading, setLoading] = useState<boolean>(true);
  const startGameRef = useRef<() => void>(null);
  const destroyGameRef = useRef<() => void>(null);
  const setBumperPatternRef = useRef<(pattern: BumperPattern) => void>(null);
  const [result, setGameResult] = useState<SleighGameResult | null>(null);
  const [canReleaseGift, setCanReleaseGift] = useState<boolean>(true);

  useEffect(() => {
    const load = async () => {
      const { destroyGame, setBumperPattern, startGameExternal } =
        await loadGame();
      startGameRef.current = startGameExternal;
      destroyGameRef.current = destroyGame;
      setBumperPatternRef.current = setBumperPattern;

      setLoading(false);
    };

    load();

    return () => {
      if (destroyGameRef.current) {
        destroyGameRef.current();
      }
    };
  }, []);

  useEffect(() => {
    if (loading || !setBumperPatternRef.current) {
      return;
    }

    const baseSeed = `${userId}-${new Date().toDateString()}`;
    const patternIndex =
      rngSeeded(1, validBumperPatterns.length, `${baseSeed}-${actionPoints}`) -
      1;

    setBumperPatternRef.current(validBumperPatterns[patternIndex]);
  }, [loading, actionPoints, userId]);

  useEffect(() => {
    window.addEventListener(
      GAME_EVENTS.CAUGHT,
      () => {
        setGameResult({ caughtGift: true });
        increaseTeamScore();
        fetch("/api/game", {
          body: JSON.stringify({
            game: "sleigh",
            action: "end",
            passed: true,
          }),
          headers: {
            "content-type": "application/json",
          },
          method: "POST",
        });
      },
      { once: true },
    );
    window.addEventListener(
      GAME_EVENTS.MISSED,
      () => {
        setGameResult({ caughtGift: false });
        fetch("/api/game", {
          body: JSON.stringify({
            game: "sleigh",
            action: "end",
            passed: false,
          }),
          headers: {
            "content-type": "application/json",
          },
          method: "POST",
        });
      },
      { once: true },
    );
  }, [increaseTeamScore]);

  const onReleaseClick = useCallback(async () => {
    if (!startGameRef.current) {
      return;
    }

    const res = await fetch("/api/game", {
      body: JSON.stringify({
        game: "sleigh",
        action: "start",
      }),
      headers: {
        "content-type": "application/json",
      },
      method: "POST",
    });

    const data = await res.json();

    if (data.success) {
      const controlsOverlay = document.getElementById("game-controls-overlay");

      if (!controlsOverlay) {
        return;
      }

      controlsOverlay.remove();
      startGameRef.current();

      decreaseActionPoints();
      return;
    }

    setCanReleaseGift(false);
  }, [decreaseActionPoints]);

  return (
    <div>
      <div className="relative w-md md:w-lg aspect-square mx-auto my-2">
        <div id="game-wrapper" className="w-md md:w-lg aspect-square" />
        <div
          className="absolute top-0 left-0 right-0 bottom-0 bg-black/50 flex justify-center items-center"
          id="game-controls-overlay"
        >
          <div className="w-2/3 p-2 bg-white rounded border-2">
            {loading && (
              <p className="text-center">Loading Game, Please Wait...</p>
            )}
            {!loading &&
              actionPoints > 0 &&
              giftsStored > 0 &&
              canReleaseGift && (
                <button
                  className="py-2 w-full border-2 rounded bg-amber-300 cursor-pointer enabled:hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-50 font-bold"
                  type="button"
                  onClick={onReleaseClick}
                >
                  Release the gift!
                </button>
              )}
            {!loading && actionPoints === 0 && (
              <p className="text-center">
                You do not have enough action points - come back tomorrow
              </p>
            )}
            {!loading && actionPoints > 0 && giftsStored === 0 && (
              <p className="text-center font-bold">
                Wrapped Present in storage is currently at 0, therefore nothing
                can be loaded on to the sleigh right now. Visit the "Wrapping
                Station" to wrap presents to be loaded on to the sleigh
                tomorrow!
              </p>
            )}
            {!loading && !canReleaseGift && (
              <p className="text-center">
                A sneaky elf got in just before you and loaded the last stored
                present, try another action today.
              </p>
            )}
          </div>
        </div>
      </div>
      <section className="w-1/2 rounded-md bg-white border-2 mx-auto my-2 p-2 text-center">
        <p>
          Releasing a gift will consume 1 action point, catch it in the sleigh
          to gain a point for your team!
        </p>
      </section>
      {result && (
        <section className="w-1/2 rounded-md bg-white border-2 mx-auto my-2 p-2 text-center">
          {result.caughtGift && (
            <p>
              You caught a gift and gained 1 point ✨ - Your team mates will be
              pleased!
            </p>
          )}
          {!result.caughtGift && (
            <p>You dropped the gift 💥 - Better luck next time.</p>
          )}
          <div className="grid grid-cols-2 gap-2">
            <button
              className="py-2 border-2 rounded bg-blue-300 cursor-pointer hover:bg-blue-200 mt-2"
              type="button"
              onClick={() => window.dispatchEvent(new Event("reload"))}
            >
              Catch a new gift!
            </button>
            <Link href="/">
              <div className="py-2 border-2 rounded bg-blue-300 cursor-pointer hover:bg-blue-200 mt-2">
                Back to main screen
              </div>
            </Link>
          </div>
        </section>
      )}
    </div>
  );
};

export default SleighGame;
