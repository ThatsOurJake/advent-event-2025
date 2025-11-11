"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { rngSeeded } from "../utils/random";

const BeatMarker = ({
  animatedDelay,
  duration,
}: {
  animatedDelay: number;
  duration: number;
}) => (
  <div
    className={`w-10 aspect-square absolute top-1/2 -translate-x-1/2 -translate-y-1/2 left-1/2 flow-down-fade flex justify-center items-center`}
    style={{
      animationDelay: `${animatedDelay}ms`,
      animationDuration: `${duration}ms`,
      animationPlayState: "inherit",
    }}
  >
    <p className="text-4xl">🪨</p>
  </div>
);

const generateBeatMap = () => {
  const patterns = [
    "x-x-x-x-x",
    "x-xx-x-xx",
    "xx-xx-xx",
    "x-x-xx-x-x",
    "xx-xx-x-x",
  ];

  const baseSeed = new Date().toDateString();
  const index = rngSeeded(1, patterns.length, baseSeed) - 1;

  return patterns[index];
};

interface ForgeGameResult {
  passed: boolean;
}

const ForgeGame = () => {
  const beatMap = useMemo(() => generateBeatMap(), []);
  const duration = 3000;
  const initialDelay = 1000;
  const dashDelay = 500;
  const accuracyWindow = 300;
  const keyFramePercentage = 0.15; // This is the keyframe percentage in CSS animation
  const minAccuracyForWinning = 60;

  const [isPlaying, setIsPlaying] = useState(false);
  const [played, setPlayed] = useState(false);
  const [result, setResult] = useState<ForgeGameResult>();

  const hitTimings = useRef<number[]>([]);

  const { markers, cumulativeDelay } = useMemo(() => {
    let cumulativeDelay = initialDelay;

    const markers = beatMap.split("").map((char, index) => {
      if (char === "x") {
        hitTimings.current.push(
          cumulativeDelay + duration * keyFramePercentage,
        );

        const marker = (
          <BeatMarker
            // biome-ignore lint/suspicious/noArrayIndexKey: acceptable here
            key={index}
            animatedDelay={cumulativeDelay}
            duration={duration}
          />
        );
        cumulativeDelay += duration;
        return marker;
      } else {
        cumulativeDelay += dashDelay;
        return null;
      }
    });

    return {
      markers,
      cumulativeDelay,
    };
  }, [beatMap]);

  const startTime = useRef<number | null>(null);
  const hitTimes = useRef<number[]>([]);

  const onStart = useCallback(() => {
    setIsPlaying(true);
    setPlayed(true);

    document.getElementById("forge-back")?.classList.add("fire-glow");

    startTime.current = performance.now();
  }, []);

  const calcAccuracy = useCallback(() => {
    const hits = hitTimes.current.map((hitTime) => {
      return hitTimings.current.some((timing) => {
        return (
          hitTime >= timing - accuracyWindow &&
          hitTime <= timing + accuracyWindow
        );
      });
    });

    const misses = hits.filter((hit) => !hit).length;

    return Math.floor((Math.max(0, hits.length - misses) / hits.length) * 100);
  }, []);

  const onZoneClick = useCallback(() => {
    if (!isPlaying || startTime.current === null) {
      return;
    }

    const currentTime = performance.now();
    const elapsedTime = Math.floor(currentTime - startTime.current);
    hitTimes.current.push(elapsedTime);

    const isHit = hitTimings.current.some((timing) => {
      return (
        elapsedTime >= timing - accuracyWindow &&
        elapsedTime <= timing + accuracyWindow
      );
    });

    const forgeZone = document.getElementById("forge-zone");
    const accuracyEle = document.getElementById("forge-accuracy");

    if (isHit) {
      forgeZone?.classList.add("border-lime-300");
      setTimeout(() => {
        forgeZone?.classList.remove("border-lime-300");
      }, 300);
    } else {
      forgeZone?.classList.add("border-red-500");
      setTimeout(() => {
        forgeZone?.classList.remove("border-red-500");
      }, 300);
    }

    const accuracy = calcAccuracy();

    if (accuracyEle) {
      accuracyEle.innerText = `${accuracy}%`;
    }
  }, [isPlaying, calcAccuracy]);

  const determineGameResult = useCallback(() => {
    setIsPlaying(false);

    document.getElementById("forge-back")?.classList.remove("fire-glow");

    const accuracy = calcAccuracy();

    setResult({
      passed: accuracy >= minAccuracyForWinning,
    });
  }, [calcAccuracy]);

  useEffect(() => {
    if (!isPlaying) {
      return;
    }

    const timeout = setTimeout(() => {
      window.dispatchEvent(new Event("forgeGameEnd"));
    }, cumulativeDelay);

    window.addEventListener(
      "forgeGameEnd",
      () => {
        determineGameResult();
      },
      { once: true },
    );

    return () => {
      clearTimeout(timeout);
    };
  }, [isPlaying, determineGameResult, cumulativeDelay]);

  return (
    <div className="flex flex-col items-center w-md md:w-lg mx-auto">
      <div className="relative rounded-md bg-white p-4 border-2 mb-2 w-full">
        <header className="mb-2">
          <p className="font-bold text-xl">The Forge</p>
        </header>
        <section aria-hidden>
          <img
            src="/static/forge.png"
            className="rounded-sm my-1 w-10/12 mx-auto"
            alt="Mining Forge"
          />
        </section>
        <div className="relative my-4">
          <div className="w-full h-12 border-2 rounded" id="forge-back" />
          <div
            className="w-16 aspect-square border-4 rounded-4xl absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-linear-to-t from-yellow-100 to-orange-400"
            id="forge-zone"
          />
          <div
            className="absolute inset-0 overflow-hidden"
            style={{ animationPlayState: isPlaying ? "running" : "paused" }}
          >
            {markers}
          </div>
          <div
            className="w-16 aspect-square absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer"
            onClick={onZoneClick}
          />
        </div>
        <button
          className="py-2 w-full border-2 rounded bg-amber-300 cursor-pointer enabled:hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-50 font-bold"
          type="button"
          onClick={onStart}
          disabled={played}
        >
          Heat the Forge!
        </button>
        <p className="my-1 text-center text-sm">
          Smelting Accuracy: <span id="forge-accuracy">0%</span>
        </p>
        <p className="text-sm italic mt-2 text-center">
          Heating the forge will consume 1 action point, you will need an
          accuracy of {`>=${minAccuracyForWinning}%`} to successfully smelt the
          ore.
        </p>
      </div>
      {result && (
        <section className="w-full rounded-md bg-white p-2 border-2 mb-2 text-center">
          {result.passed && (
            <p>
              You successfully smelted the ore and gained a gift mound, your
              fellow elves will be pleased!
            </p>
          )}
          {!result.passed && (
            <p>
              Unfortunately you were not accurate enough this time and the ore
              was not pure enough, better luck next time.
            </p>
          )}
          <div className="grid grid-cols-2 gap-2">
            <button
              className="py-2 border-2 rounded bg-blue-300 cursor-pointer hover:bg-blue-200 mt-2"
              type="button"
              onClick={() => window.location.reload()}
            >
              Forge again!
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

export default ForgeGame;
