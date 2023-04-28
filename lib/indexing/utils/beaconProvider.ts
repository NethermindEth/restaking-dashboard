
const BEACON_PROVIDER_URL = process.env.BEACON_PROVIDER_URL || "";

export interface BeaconApiResponse<T> {
  execution_optimistic: boolean;
  data: T[];
}

export type ValidatorStatus =
  | "pending_initialized"
  | "pending_queued"
  | "active_ongoing"
  | "active_exiting"
  | "active_slashed"
  | "exited_unslashed"
  | "exited_slashed"
  | "withdrawal_possible"
  | "withdrawal_done";

export interface ValidatorResponse {
  index: string;
  balance: string;
  status: ValidatorStatus;
  validator: {
    pubkey: string;
    withdrawal_credentials: string;
    effective_balance: string;
    slashed: boolean;
    activation_eligibility_epoch: string;
    activation_epoch: string;
    exit_epoch: string;
    withdrawable_epoch: string;
  };
}

export interface Validator {
  index: number;
  balance: bigint;
  status: ValidatorStatus;
  validator: {
    pubkey: string;
    withdrawalCredentials: string;
    effectiveBalance: bigint;
    slashed: boolean;
    activationEligibilityEpoch: number;
    activationEpoch: number;
    exitEpoch: number;
    withdrawableEpoch: number;
  };
}

/**
 * URI encodes indexes as expected by the Beacon API, e.g. "id=1&id=2&id=3".
 * @param indexes Indexes list.
 * @returns URI encoded indexes.
 */
function encodeIndexes(indexes: number[]): string {
  return indexes.map(id => `id=${id}`).join("&");
}

/**
 * Gets validator info for the specified validators through the Beacon API and
 * state and re-formats it.
 * @param indexes Validator indexes.
 * @param state State identifier. Refer to the Beacon API documentation.
 * @returns Processed validator info for the specified validators at the
 * specified state.
 */
export async function getValidators(indexes: number[], state: string): Promise<Validator[]> {
  if (!BEACON_PROVIDER_URL) {
    throw new Error("BEACON_PROVIDER_URL environment variable is not set");
  }

  const req = await fetch(
    `${BEACON_PROVIDER_URL}/eth/v1/beacon/states/${state}/validators?${encodeIndexes(indexes)}`
  );
  const json = (await req.json()) as BeaconApiResponse<ValidatorResponse>;

  return json.data.map(validatorResp => ({
    index: parseInt(validatorResp.index),
    balance: BigInt(validatorResp.balance),
    status: validatorResp.status,
    validator: {
      pubkey: validatorResp.validator.pubkey,
      withdrawalCredentials: validatorResp.validator.withdrawal_credentials,
      effectiveBalance: BigInt(validatorResp.validator.effective_balance),
      slashed: validatorResp.validator.slashed,
      activationEligibilityEpoch: parseInt(validatorResp.validator.activation_eligibility_epoch),
      activationEpoch: parseInt(validatorResp.validator.activation_epoch),
      exitEpoch: parseInt(validatorResp.validator.exit_epoch),
      withdrawableEpoch: parseInt(validatorResp.validator.withdrawable_epoch),
    },
  }));
}

/**
 * Gets validator info for all the validators at the specified state.
 * @param chunkSize Amount of validators to be fetched on each request.
 * Depends on URI length limits, but considering indexes >100_000, a good
 * amount is 1200.
 * @param concurrentChunks Maximum amount of concurrent requests.
 * @param state State identifier. Refer to the Beacon API documentation.
 * @returns Validator info for all validators.
 */
export async function getAllValidators(
  chunkSize: number,
  concurrentChunks: number = 1,
  state: string = "finalized"
): Promise<Validator[]> {
  const chunks: Array<Validator[]> = [];

  for (let i = 0; ; i += chunkSize * concurrentChunks) {
    const validators = await Promise.all(
      Array.from({ length: concurrentChunks }).map((_, chunkId) => {
        const start = i + chunkSize * chunkId;

        return getValidators(
          Array.from({ length: chunkSize }).map((_, idx) => start + idx),
          state,
        );
      })
    );

    const responseCount = validators.reduce((acc, el) => acc + el.length, 0);
    
    if (responseCount < chunkSize * concurrentChunks) break;

    chunks.push(...validators);
  }

  return chunks.flat();
}

