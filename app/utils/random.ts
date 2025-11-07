import seedRandom from 'seed-random';

export const rngSeeded = (min: number, max: number, seed: string) => {
  const random = seedRandom(seed);
  return Math.floor(random() * (max - min) + min);
};
