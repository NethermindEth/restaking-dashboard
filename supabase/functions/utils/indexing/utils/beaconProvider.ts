
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
 * @param beaconProviderUrl URL of the Beacon API provider.
 * @param indexes Validator indexes.
 * @param state State identifier. Refer to the Beacon API documentation.
 * @returns Processed validator info for the specified validators at the
 * specified state.
 */
export async function getValidators(
  beaconProviderUrl: string,
  indexes: number[],
  state: string,
): Promise<Validator[]> {
  const req = await fetch(
    `${beaconProviderUrl}/eth/v1/beacon/states/${state}/validators?${encodeIndexes(indexes)}`
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
 * Gets validator info for validators at the specified state starting from
 * the specified index. The calls are done in batches of
 * `chunkSize * concurrentChunks` validators, `chunkSize` validators per
 * Beacon API request. When the end of the validator list is reached,
 * the search is automatically stopped and the `reachedLast` flag is set in
 * the return object.
 * @param beaconProviderUrl URL of the Beacon API provider.
 * @param startIndex Starting index of the search.
 * @param maxBatches Maximum amount of batches of concurrent chunk fetches
 * to be done.
 * @param chunkSize Amount of validators to be fetched on each request.
 * Depends on URI length limits, but considering indexes >100_000, a good
 * amount is 1200.
 * @param concurrentChunks Maximum amount of concurrent requests.
 * @param state State identifier. Refer to the Beacon API documentation.
 * @returns Validator info for all validators and a flag indicating whether
 * the current last validator was reached.
 */
export async function batchGetValidators(
  beaconProviderUrl: string,
  startIndex: number,
  maxBatches: number,
  chunkSize: number,
  concurrentChunks: number = 1,
  state: string = "finalized"
): Promise<{ reachedLast: boolean; validators: Validator[] }> {
  const chunks: Array<Validator[]> = [];
  let reachedLast = false;

  for (let i = 0; i < maxBatches; i++) {
    const batchStart = startIndex + i * chunkSize * concurrentChunks;

    const validatorChunkBatch = await Promise.all(
      Array.from({ length: concurrentChunks }).map((_, chunkId) => {
        const requestStart = batchStart + chunkSize * chunkId;

        return getValidators(
          beaconProviderUrl,
          Array.from({ length: chunkSize }).map((_, idx) => requestStart + idx),
          state,
        );
      })
    );

    chunks.push(...validatorChunkBatch);

    const responseCount = validatorChunkBatch.reduce((acc, el) => acc + el.length, 0);

    if (responseCount < chunkSize * concurrentChunks) {
      reachedLast = true;
      break;
    }
  }

  return { reachedLast, validators: chunks.flat() };
}
