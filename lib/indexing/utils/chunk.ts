
/**
 * Utility to map a function over a set of range chunks. Useful for block range limits.
 * @param from Starting number.
 * @param to Ending number, inclusive.
 * @param chunkSize Maximum size of a chunk.
 * @param cb Callback to map over chunks.
 * @returns The callback executed on each of the chunks.
 */
export function chunkMap<T>(
  from: number,
  to: number,
  chunkSize: number,
  cb: (from: number, to: number) => T
): T[] {
  const resp: T[] = [];

  for (let i = from; i <= to; i += chunkSize) {
    resp.push(cb(i, Math.min(i + chunkSize - 1, to)));
  }

  return resp;
}
