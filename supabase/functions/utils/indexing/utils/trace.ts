
export interface TransactionTrace {
  jsonrpc: string;
  id: number;
  result: TraceResult;
}

export interface TraceResult {
  type: string;
  from: string;
  to: string;
  value: string;
  gas: string;
  gasUsed: string;
  input: string;
  output: string;
  error: string;
  revertReason: string;
  calls?: TraceResult[];
}

/**
 * Walks through trace calls, iterating individually as if they were a single array.
 * @param trace Initial trace.
 * @param cb Callback to be executed on each trace.
 */
export function traceCallWalk(
  trace: TraceResult,
  ignoreRevertedCalls: boolean,
  cb: (trace: Readonly<TraceResult>) => void
) {
  if (ignoreRevertedCalls && (trace.error || trace.revertReason)) return;
  
  cb(trace);
  (trace.calls || []).forEach(call => traceCallWalk(call, ignoreRevertedCalls, cb));
}
