import { formatETH, formatUSD } from '../shared/formatters';
import { protocols } from './helpers';
import ThirdPartyLogo from '../shared/ThirdPartyLogo';

export default function LRTList({ data }) {
  return (
    <div className="rounded-lg border border-outline bg-content1 text-sm">
      <div className="flex flex-row items-center justify-between gap-x-2 p-4 text-foreground-1">
        <span className="basis-1/2 ps-6">Protocol</span>
        <span className="basis-1/2 text-end">Total value</span>
      </div>
      {Object.entries(data.protocols)
        .sort(sortProtocols)
        .map(([name, value], i) => (
          <div
            className="flex flex-row items-center gap-x-2 border-t border-outline px-4 py-2"
            key={name}
          >
            <span className="inline-block min-w-4 text-foreground-2">
              {i + 1}
            </span>
            <ThirdPartyLogo
              className="size-6 min-w-6"
              url={protocols[name].logo}
            />
            <span className="text-foreground-2">{protocols[name].name}</span>
            <span className="basis-full text-foreground-1">
              {protocols[name].symbol}
            </span>
            <div className="ps-6 text-end">
              <div>{formatUSD(value * data.rate)}</div>
              <div className="text-xs text-foreground-2">
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
