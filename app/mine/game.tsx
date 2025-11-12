"use client";

import Link from "next/link";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { AppContext } from "../components/page-wrapper";
import { rngSeeded } from "../utils/random";
import { reportGameResult } from "../utils/report-game-result";

interface MiningGameResult {
  didMineOre: boolean;
}

const MiningGame = () => {
  const {
    decreaseActionPoints,
    user: {
      game: { actionPoints },
    },
  } = useContext(AppContext);
  const isPlaying = useRef<boolean>(true);
  const [result, setResult] = useState<MiningGameResult | null>(null);

  const positionMinebarZone = useCallback(() => {
    const minebarZone = document.getElementById("mine-bar-zone");
    const minebarWrapper = document.getElementById("mine-bar");

    if (!minebarWrapper || !minebarZone) {
      return;
    }

    const barRect = minebarWrapper.getBoundingClientRect();
    const zoneRect = minebarZone.getBoundingClientRect();

    const max = Math.floor(barRect.width - zoneRect.width);
    const dateStr = new Date().toDateString();

    const zoneLeft = rngSeeded(0, max, dateStr);

    minebarZone.style.left = `${zoneLeft}px`;
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    let speed = 1.5;

    const indicator = document.getElementById("mine-indicator");
    const minebarWrapper = document.getElementById("mine-bar");

    positionMinebarZone();

    if (!indicator || !minebarWrapper) {
      return;
    }

    let animationFrameId: number;
    const barRect = minebarWrapper.getBoundingClientRect();
    const indicatorRect = indicator.getBoundingClientRect();

    let left = 0;

    const animate = () => {
      if (!isPlaying.current && animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        return;
      }

      const right = Math.floor(left + indicatorRect.width);

      if (left < 0 || right >= barRect.width) {
        speed *= -1;
      }

      left += speed;

      indicator.style.left = `${left}px`;

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [positionMinebarZone]);

  const onPickSwing = useCallback(() => {
    if (!isPlaying.current) {
      return;
    }

    isPlaying.current = false;

    const indicator = document.getElementById("mine-indicator");
    const minebarZone = document.getElementById("mine-bar-zone");

    if (indicator && minebarZone) {
      const indicatorRect = indicator.getBoundingClientRect();
      const minebarZoneRect = minebarZone.getBoundingClientRect();
      const middle = indicatorRect.width / 2;

      const isInZone =
        indicatorRect.left + middle >= minebarZoneRect.left &&
        indicatorRect.right - middle <= minebarZoneRect.right;

      const result = {
        didMineOre: isInZone,
      };

      setResult(result);
      decreaseActionPoints();
      reportGameResult("mine", result);
    }
  }, [decreaseActionPoints]);

  return (
    <div className="flex flex-col items-center w-md md:w-lg mx-auto">
      <div className="relative rounded-md bg-white p-4 border-2 mb-2 w-full">
        <header className="mb-2">
          <p className="font-bold text-xl">The Mines</p>
        </header>
        <section className="sr-only">{/* TODO: Screen reader zone */}</section>
        <section aria-hidden>
          <img
            src="/static/mine-entrance.png"
            className="rounded-sm my-1 w-10/12 mx-auto"
            alt="Mining entrance"
          />
          <div className="my-2 relative">
            <div
              className="w-1/5 bg-lime-400 rounded-sm border h-10 absolute"
              id="mine-bar-zone"
            />
            <div
              className="w-full bg-gray-100 rounded-sm border h-10"
              id="mine-bar"
            />
            <div
              className="h-8 aspect-square p-1 bg-slate-400 rounded border absolute top-1/2 -translate-y-1/2"
              id="mine-indicator"
            >
              <img src="/static/pickaxe-icon.png" alt="pickaxe icon" />
            </div>
          </div>
        </section>
      </div>
      <section className="w-full rounded-md bg-white p-2 border-2 mb-2">
        {actionPoints > 0 && (
          <>
            <p className="mb-2 text-center">
              Swinging your pick will consume 1 action point so ensure you get
              it in the green zone!
            </p>
            <button
              className="py-2 w-full border-2 rounded bg-amber-300 cursor-pointer hover:bg-amber-200"
              type="button"
              onClick={onPickSwing}
            >
              Swing Pickaxe!
            </button>
          </>
        )}
        {actionPoints === 0 && (
          <p className="text-center">
            You have ran out of action points for today - please come back
            tomorrow once you've had a recovered.
          </p>
        )}
      </section>
      {result && (
        <section className="w-full rounded-md bg-white p-2 border-2 mb-2 text-center">
          {result.didMineOre && (
            <p>
              You consumed 1 action point and mined 1 ore ✨ - Your team mates
              will be pleased!
            </p>
          )}
          {!result.didMineOre && (
            <p>
              You consumed 1 action point but did not manage to mine any ore -
              Better luck next time.
            </p>
          )}
          <div className="grid grid-cols-2 gap-2">
            <button
              className="py-2 border-2 rounded bg-blue-300 cursor-pointer hover:bg-blue-200 mt-2"
              type="button"
              onClick={() => window.location.reload()}
            >
              Re-Enter the mines!
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

export default MiningGame;
