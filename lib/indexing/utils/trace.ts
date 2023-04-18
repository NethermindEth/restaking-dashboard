
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

export function traceCallWalk(trace: TraceResult, cb: (trace: Readonly<TraceResult>) => void) {
  cb(trace);
  (trace.calls || []).forEach(call => traceCallWalk(call, cb));
}
