"use client";

import Link from "next/link";
import { useCallback, useContext, useMemo, useRef, useState } from "react";
import { LocationClosed } from "../components/location-closed";
import { AppContext } from "../components/page-wrapper";
import { calculateTaskOutcome } from "../utils/calculate-task-outcome";
import { isAfterEventDate } from "../utils/event-date-helpers";
import { rngSeeded } from "../utils/random";
import { reportGameResult } from "../utils/report-game-result";

type ValidValues =
  | "blank"
  | "paper-stripe"
  | "paper-frog"
  | "paper-star"
  | "rib-red"
  | "rib-gold"
  | "rib-silver"
  | "bow-no"
  | "bow-big"
  | "bow-small";

interface Selection {
  paper: ValidValues;
  ribbon: ValidValues;
  bow: ValidValues;
}

interface WrappingGameResult {
  notEnoughMounds?: boolean;
  passedQA: boolean;
  taskOutcome: number;
}

const determineStartingGift = (actionPoints: number): Selection => {
  const bowItems: ValidValues[] = ["bow-big", "bow-small", "bow-no"];
  const ribItems: ValidValues[] = ["rib-gold", "rib-red", "rib-silver"];
  const paperItems: ValidValues[] = [
    "paper-frog",
    "paper-star",
    "paper-stripe",
  ];
  const baseSeed = new Date().toDateString();

  const bowIndex =
    rngSeeded(1, bowItems.length, `${baseSeed}-${actionPoints}-bow`) - 1;
  const ribIndex =
    rngSeeded(1, bowItems.length, `${baseSeed}-${actionPoints}-rib`) - 1;
  const paperIndex =
    rngSeeded(1, bowItems.length, `${baseSeed}-${actionPoints}-pap`) - 1;

  return {
    bow: bowItems[bowIndex],
    ribbon: ribItems[ribIndex],
    paper: paperItems[paperIndex],
  };
};

interface WrappingGameProps {
  moundsStored: number;
}

const WrappingGame = ({ moundsStored }: WrappingGameProps) => {
  const {
    user: {
      userId,
      game: { actionPoints },
    },
    decreaseActionPoints,
    todaysEvent,
  } = useContext(AppContext);

  const isLocationClosed =
    (todaysEvent?.type === "LOCATION_CLOSED" &&
      todaysEvent?.data.location === "wrap_station") ||
    isAfterEventDate();

  const [currentSelection, setCurrentSelection] = useState<Selection>({
    bow: "bow-no",
    paper: "blank",
    ribbon: "blank",
  });

  const [result, setResult] = useState<WrappingGameResult | null>(null);

  const isPlaying = useRef<boolean>(true);
  const targetSelection = useMemo(
    () => determineStartingGift(actionPoints),
    [actionPoints],
  );

  const onBtnClick = useCallback(
    (value: ValidValues) => {
      if (!isPlaying.current) {
        return;
      }

      const copy = { ...currentSelection };

      switch (value) {
        case "paper-frog":
        case "paper-star":
        case "paper-stripe":
          copy.paper = value;
          break;
        case "bow-big":
        case "bow-small":
        case "bow-no":
          copy.bow = value;
          break;
        case "rib-silver":
        case "rib-gold":
        case "rib-red":
          copy.ribbon = value;
          break;
        default:
          break;
      }

      setCurrentSelection(copy);
    },
    [currentSelection],
  );

  const determineImage = useCallback((selection: Selection) => {
    const { bow, paper, ribbon } = selection;

    const ariaLabelParts: string[] = [
      "The image currently shows a present with the following:",
    ];
    const imageParts: string[] = [];

    switch (paper) {
      case "paper-stripe":
        ariaLabelParts.push("Striped Wrapping Paper,");
        imageParts.push("S");
        break;
      case "paper-star":
        ariaLabelParts.push("Star Wrapping Paper,");
        imageParts.push("ST");
        break;
      case "paper-frog":
        ariaLabelParts.push("Frog Wrapping Paper,");
        imageParts.push("C");
        break;
      default:
        ariaLabelParts.push("No wrapping paper,");
        imageParts.push("B");
        break;
    }

    switch (ribbon) {
      case "rib-red":
        ariaLabelParts.push("Red Ribbon,");
        imageParts.push("R");
        break;
      case "rib-gold":
        ariaLabelParts.push("Gold Ribbon,");
        imageParts.push("G");
        break;
      case "rib-silver":
        ariaLabelParts.push("Silver Ribbon,");
        imageParts.push("S");
        break;
      default:
        ariaLabelParts.push("Blank Ribbon,");
        imageParts.push("B");
        break;
    }

    switch (bow) {
      case "bow-big":
        ariaLabelParts.push("A Big Bow.");
        imageParts.push("1");
        break;
      case "bow-small":
        ariaLabelParts.push("A Small Bow.");
        imageParts.push("2");
        break;
      default:
        ariaLabelParts.push("No Bow.");
        imageParts.push("N");
        break;
    }

    return {
      image: imageParts.join("-"),
      ariaLabel: ariaLabelParts.join(" "),
    };
  }, []);

  const onSubmit = useCallback(async () => {
    if (!isPlaying.current) {
      return;
    }

    if (
      currentSelection.paper === "blank" ||
      currentSelection.ribbon === "blank"
    ) {
      alert(
        "You have not fully wrapped the gift - check the image on the left for reference",
      );
      return;
    }

    isPlaying.current = false;

    const passedQA =
      currentSelection.bow === targetSelection.bow &&
      currentSelection.paper === targetSelection.paper &&
      currentSelection.ribbon === targetSelection.ribbon;

    const gameResult: WrappingGameResult = {
      passedQA,
      taskOutcome: calculateTaskOutcome(userId, actionPoints, "wrap_station"),
    };

    const { success } = await reportGameResult("wrap_station", {
      passed: passedQA,
    });

    if (success) {
      setResult(gameResult);
      decreaseActionPoints();
    } else {
      setResult({
        notEnoughMounds: true,
        passedQA: false,
        taskOutcome: 0,
      });
    }
  }, [
    currentSelection,
    targetSelection,
    decreaseActionPoints,
    userId,
    actionPoints,
  ]);

  const outputImage = determineImage(currentSelection);
  const inputImage = determineImage(targetSelection);

  if (isLocationClosed) {
    return <LocationClosed />;
  }

  return (
    <div className="flex flex-col items-center w-4/5 md:w-2/3 mx-auto">
      <div className="relative rounded-md bg-white p-4 border-2 mb-2 w-full">
        <header className="mb-2">
          <p className="font-bold text-xl">Wrapping Station</p>
        </header>
        <section className="flex items-center">
          <div className="flex flex-col items-center">
            <p className="text-sm font-bold">Reference Image</p>
            <img
              src={`/static/wrap/presents/${inputImage.image}.png`}
              className="w-3/5"
              aria-label={inputImage.ariaLabel}
            />
          </div>
          <p className="text-2xl">🟰</p>
          <div className="flex flex-col items-center">
            <p className="text-sm font-bold">Output Present</p>
            <img
              src={`/static/wrap/presents/${outputImage.image}.png`}
              className="w-3/5"
              aria-label={outputImage.ariaLabel}
            />
          </div>
        </section>
        <div className="bg-black h-px my-2 w-2/3 mx-auto" aria-hidden />
        <section className="flex flex-wrap flex-row justify-around">
          <div>
            <p>Wrapping Paper</p>
            <div className="gap-x-2 flex my-1">
              <button
                className="w-12 border-2 rounded cursor-pointer data-[selected='true']:border-pink-400 data-[selected='true']:border-4"
                type="button"
                aria-label="Striped Wrapping Paper"
                title="Striped Wrapping Paper"
                id="btn-stripe-paper"
                onClick={() => onBtnClick("paper-stripe")}
                data-selected={currentSelection.paper === "paper-stripe"}
              >
                <img
                  className="rounded"
                  src="/static/wrap/textures/stripes.jpg"
                  aria-labelledby="btn-stripe-paper"
                />
              </button>
              <button
                className="w-12 border-2 rounded cursor-pointer data-[selected='true']:border-pink-400 data-[selected='true']:border-4"
                type="button"
                aria-label="Frog Wrapping Paper"
                title="Frog Wrapping Paper"
                id="btn-frog-paper"
                onClick={() => onBtnClick("paper-frog")}
                data-selected={currentSelection.paper === "paper-frog"}
              >
                <img
                  className="rounded"
                  src="/static/wrap/textures/frog.jpg"
                  aria-labelledby="btn-frog-paper"
                />
              </button>
              <button
                className="w-12 border-2 rounded cursor-pointer data-[selected='true']:border-pink-400 data-[selected='true']:border-4"
                type="button"
                aria-label="Star Wrapping Paper"
                title="Star Wrapping Paper"
                id="btn-star-paper"
                onClick={() => onBtnClick("paper-star")}
                data-selected={currentSelection.paper === "paper-star"}
              >
                <img
                  className="rounded"
                  src="/static/wrap/textures/star.webp"
                  aria-labelledby="btn-star-paper"
                />
              </button>
            </div>
          </div>
          <div>
            <p>Ribbon Colour</p>
            <div className="gap-x-2 flex my-1">
              <button
                className="w-12 aspect-square border-2 rounded cursor-pointer data-[selected='true']:border-pink-400 data-[selected='true']:border-4"
                type="button"
                aria-label="Red Ribbon"
                title="Red Ribbon"
                onClick={() => onBtnClick("rib-red")}
                data-selected={currentSelection.ribbon === "rib-red"}
              >
                <div
                  className="w-full h-full"
                  style={{ backgroundColor: "#BD1900" }}
                />
              </button>
              <button
                className="w-12 aspect-square border-2 rounded cursor-pointer data-[selected='true']:border-pink-400 data-[selected='true']:border-4"
                type="button"
                aria-label="Gold Ribbon"
                title="Gold Ribbon"
                onClick={() => onBtnClick("rib-gold")}
                data-selected={currentSelection.ribbon === "rib-gold"}
              >
                <div
                  className="w-full h-full"
                  style={{ backgroundColor: "#AF7C2F" }}
                />
              </button>
              <button
                className="w-12 aspect-square border-2 rounded cursor-pointer data-[selected='true']:border-pink-400 data-[selected='true']:border-4"
                type="button"
                aria-label="Silver Ribbon"
                title="Silver Ribbon"
                onClick={() => onBtnClick("rib-silver")}
                data-selected={currentSelection.ribbon === "rib-silver"}
              >
                <div
                  className="w-full h-full"
                  style={{ backgroundColor: "#9595A3" }}
                />
              </button>
            </div>
          </div>
          <div>
            <p>Bow on top</p>
            <div className="gap-x-2 flex my-1">
              <button
                className="w-12 border-2 rounded cursor-pointer data-[selected='true']:border-pink-400 data-[selected='true']:border-4"
                type="button"
                aria-label="No Bow"
                title="No Bow"
                onClick={() => onBtnClick("bow-no")}
                data-selected={currentSelection.bow === "bow-no"}
              >
                <p>❌</p>
              </button>
              <button
                className="w-12 border-2 rounded cursor-pointer data-[selected='true']:border-pink-400 data-[selected='true']:border-4"
                type="button"
                aria-label="Big Bow"
                title="Big Bow"
                id="btn-bow-one"
                onClick={() => onBtnClick("bow-big")}
                data-selected={currentSelection.bow === "bow-big"}
              >
                <img
                  className="rounded"
                  src="/static/wrap/textures/bow-1.png"
                  aria-labelledby="btn-bow-one"
                />
              </button>
              <button
                className="w-12 border-2 rounded cursor-pointer data-[selected='true']:border-pink-400 data-[selected='true']:border-4"
                type="button"
                aria-label="Small Bow"
                title="Small Bow"
                id="btn-bow-two"
                onClick={() => onBtnClick("bow-small")}
                data-selected={currentSelection.bow === "bow-small"}
              >
                <img
                  className="rounded"
                  src="/static/wrap/textures/bow-2.png"
                  aria-labelledby="btn-bow-two"
                />
              </button>
            </div>
          </div>
        </section>
        <section className="mt-2">
          {actionPoints > 0 && moundsStored > 0 && (
            <>
              <p className="mb-2 text-center text-sm">
                Sending the gift to the QA elves consume 1 action point so
                ensure your gift matches the reference image!
              </p>
              <button
                type="button"
                className="py-2 w-full border-2 rounded bg-amber-300 cursor-pointer hover:bg-amber-200"
                onClick={onSubmit}
              >
                Send gift to the quality assurance elves.
              </button>
            </>
          )}
          {actionPoints === 0 && (
            <p className="text-center">
              You do not have enough action points to complete this task.
            </p>
          )}
          {actionPoints > 0 && moundsStored === 0 && (
            <p className="text-center font-bold">
              Gift Mound storage is currently at 0, therefore there is nothing
              to wrap. Visit "The Forge" to smelt ore into a gift mound for
              wrapping tomorrow!
            </p>
          )}
        </section>
      </div>
      {result && (
        <section className="w-full rounded-md bg-white p-2 border-2 mb-2 text-center">
          {result.passedQA && (
            <p>
              You consumed 1 action point and wrapped{" "}
              <b>{result.taskOutcome}</b> present(s) 🎁 - Your team mates will
              be pleased!
            </p>
          )}
          {result.notEnoughMounds && !result.passedQA && (
            <p>
              There are not enough gift mounds to be wrapped, a sneaky elf got
              in there before you, try another action.
            </p>
          )}
          {!result.notEnoughMounds && !result.passedQA && (
            <p>
              You consumed 1 action point but did not manage to wrap the present
              correctly - Better luck next time.
            </p>
          )}
          <div className="grid grid-cols-2 gap-2">
            <button
              className="py-2 border-2 rounded bg-blue-300 cursor-pointer hover:bg-blue-200 mt-2"
              type="button"
              onClick={() => window.dispatchEvent(new Event("reload"))}
            >
              Wrap a new gift!
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

export default WrappingGame;
