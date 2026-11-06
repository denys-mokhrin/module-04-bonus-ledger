// (d) FORBIDDEN: import cycle between contexts (gamma -> delta -> gamma)
import { deltaValue } from '../../delta/public';

export const gammaValue = 3;
export const viaDelta = () => deltaValue;
