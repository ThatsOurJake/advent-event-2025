import seedRandom from "seed-random";

export const rng = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min) + min);
};

export const rngSeeded = (min: number, max: number, seed: string) => {
  const random = seedRandom(seed);
  return Math.floor(random() * (max - min) + min);
};

