import { createKeyGenerator, createRateLimiter } from "../rateLimit.js";

export const readMyOngoingRiddle = createRateLimiter(
  3 * 60 * 1000,
  40,
  createKeyGenerator('ongoingRiddle')
);

export const createRecordAndReadMyFirstRiddle = createRateLimiter(
  3 * 60 * 1000,
  40,
  createKeyGenerator('firstRiddle')
);

export const updateMyRecordAndReadMyNextRiddle = createRateLimiter(
  3 * 60 * 1000,
  40,
  createKeyGenerator('nextRiddle')
);

export const readSolverAliasStatus = createRateLimiter(
  3 * 60 * 1000,
  40,
  createKeyGenerator('solverAliasStatus')
);

export const updateSolverAlias = createRateLimiter(
  3 * 60 * 1000,
  40,
  createKeyGenerator('registerSolverAlias')
);

export const updateIsCatUncoveredAndReadCat = createRateLimiter(
  3 * 60 * 1000,
  40,
  createKeyGenerator('cat')
);
