
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
  calls?: TraceResult[];
}

/**
 * Walks through trace calls, iterating individually as if they were a single array.
 * @param trace Initial trace.
 * @param cb Callback to be executed on each trace.
 */
export function traceCallWalk(trace: TraceResult, cb: (trace: Readonly<TraceResult>) => void) {
  cb(trace);
  (trace.calls || []).forEach(call => traceCallWalk(call, cb));
}
