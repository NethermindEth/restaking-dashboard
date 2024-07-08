import { colors, fullNumFormatter, protocols } from './helpers';

export default function LRTList({ data }) {
  return (
    <div className="bg-content1 border border-outline rounded-lg text-sm">
      <div className="flex flex-row gap-x-2 justify-between items-center p-4 text-xs">
        <span className="basis-1/2 ps-6">Protocol</span>
        <span className="basis-1/2 text-end">Total value</span>
      </div>
      {Object.entries(data.protocols)
        .sort(sortProtocols)
        .map(([name, value], i) => (
          <div
            key={name}
            className="border-t border-outline flex flex-row gap-x-2 items-center px-4 py-2"
          >
            <span className="inline-block min-w-4">{i + 1}</span>
            <span
              className="min-h-3 inline-block rounded-full min-w-3"
              style={{ backgroundColor: colors[i] }}
            ></span>

            <span className="basis-full text-foreground-1">
              {protocols[name].name}
            </span>
            <div className="basis-1/3 ps-9 text-end">
              <div>${fullNumFormatter.format(value * data.rate)}</div>
              <div className="text-foreground-1 text-xs">
                ETH {fullNumFormatter.format(value)}
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
