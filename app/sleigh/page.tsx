"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { rngSeeded } from "../utils/random";

interface SleighGameResult {
  caughtGift: boolean;
}

const SleighGame = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const startGameRef = useRef<() => void>(null);
  const destroyGameRef = useRef<() => void>(null);
  const [result, setGameResult] = useState<SleighGameResult | null>(null);

  useEffect(() => {
    const load = async () => {
      const {
        startGameExternal,
        setBumperPattern,
        GAME_EVENTS,
        validBumperPatterns,
        destroyGame,
      } = await import("./game");

      const baseSeed = new Date().toDateString();
      const patternIndex =
        rngSeeded(1, validBumperPatterns.length, baseSeed) - 1;

      setBumperPattern(validBumperPatterns[patternIndex]);
      startGameRef.current = startGameExternal;
      destroyGameRef.current = destroyGame;

      window.addEventListener(
        GAME_EVENTS.CAUGHT,
        () => {
          setGameResult({ caughtGift: true });
        },
        { once: true },
      );
      window.addEventListener(
        GAME_EVENTS.MISSED,
        () => {
          setGameResult({ caughtGift: false });
        },
        { once: true },
      );

      setLoading(false);
    };

    load();

    return () => {
      if (destroyGameRef.current) {
        destroyGameRef.current();
      }
    };
  }, []);

  const onReleaseClick = useCallback(() => {
    if (!startGameRef.current) {
      return;
    }

    const controlsOverlay = document.getElementById("game-controls-overlay");

    if (!controlsOverlay) {
      return;
    }

    controlsOverlay.remove();
    startGameRef.current();
  }, []);

  return (
    <div>
      <div className="relative w-md md:w-lg aspect-square mx-auto my-2">
        <div id="game-wrapper" className="w-md md:w-lg aspect-square" />
        <div
          className="absolute top-0 left-0 right-0 bottom-0 bg-black/50 flex justify-center items-center"
          id="game-controls-overlay"
        >
          <div className="w-1/2 p-2 bg-white rounded">
            {loading && (
              <p className="text-center">Loading Game, Please Wait...</p>
            )}
            {!loading && (
              <button
                className="py-2 w-full border-2 rounded bg-amber-300 cursor-pointer enabled:hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-50 font-bold"
                type="button"
                onClick={onReleaseClick}
              >
                Release the gift!
              </button>
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
              onClick={() => window.location.reload()}
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
