import { formatETH, formatUSD } from '../shared/formatters';
import { protocols } from './helpers';

export default function LRTList({ data }) {
  return (
    <div className="rounded-lg border border-outline bg-content1 text-sm">
      <div className="flex flex-row items-center justify-between gap-x-2 p-4 text-xs">
        <span className="basis-1/2 ps-6">Protocol</span>
        <span className="basis-1/2 text-end">Total value</span>
      </div>
      {Object.entries(data.protocols)
        .sort(sortProtocols)
        .map(([name, value], i) => (
          <div
            key={name}
            className="flex flex-row items-center gap-x-2 border-t border-outline px-4 py-2"
          >
            <span className="inline-block min-w-4">{i + 1}</span>
            <span
              className="inline-block min-h-3 min-w-3 rounded-full"
              style={{ backgroundColor: `hsl(var(--app-chart-${i + 1}))` }}
            ></span>

            <span className="basis-full text-foreground-1">
              {protocols[name].name}
            </span>
            <div className="basis-1/3 ps-9 text-end">
              <div>{formatUSD(value * data.rate)}</div>
              <div className="text-xs text-foreground-1">
                {formatETH(value)}
              </div>
            </div>
          </div>
        ))}
    </div>
  );
}

const sortProtocols = ([, p1], [, p2]) => {
  if (p1 < p2) {
    return 1;
  }

  if (p1 > p2) {
    return -1;
  }

  return 0;
};
