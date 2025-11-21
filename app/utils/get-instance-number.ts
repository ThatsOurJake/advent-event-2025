import { envInt } from "env-helpers";

export const getInstanceNumber = (): number => envInt('CF_INSTANCE_INDEX', 0);
