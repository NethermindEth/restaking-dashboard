import { reduceState } from '../shared/helpers';
import { useEffect } from 'react';
import { useMutativeReducer } from 'use-mutative';
import { useServices } from '../@services/ServiceContext';
import { formatEther } from 'ethers';

export default function AVSList({ onSelectionChange }) {
  const { avsService } = useServices();
  const [state, dispatch] = useMutativeReducer(reduceState, {});

  useEffect(() => {
    async function fetchAVS() {
      try {
        const data = await avsService.getAll();

        for (let i = 0, count = data.length; i < count; i++) {
          let item = data[i];
          item.tvl = 0n;

          for (let s in item.strategies) {
            item.strategies[s] = BigInt(item.strategies[s]);

            item.tvl += item.strategies[s];
          }
        }

        // Sort descending by TVL
        data.sort((i1, i2) => {
          if (i1.tvl < i2.tvl) {
            return 1;
          }

          if (i1.tvl > i2.tvl) {
            return -1;
          }

          return 0;
        });

        onSelectionChange(data[0]);

        dispatch({ avs: data });
      } catch {
        // TODO: handle error
      }
    }

    // TODO: loading indicators

    fetchAVS();
  }, [avsService, dispatch, onSelectionChange]);

  const handleAVSItemClick = avs => {
    onSelectionChange(avs);
  };

  return (
    <div className="basis-1/2 px-2">
      <div className="border-b flex flex-row gap-x-2 justify-between items-center py-4 text-sm">
        <div className="h-5 min-w-5"></div>
        <span className="basis-full">Name</span>
        <span className="basis-1/4">TVL</span>
        <span className="basis-1/4 text-end">Stakers</span>
      </div>
      {state.avs?.map((avs, i) => (
        <div
          key={`avs-item-${i}`}
          onClick={() => handleAVSItemClick(avs)}
          className="border-b flex flex-row gap-x-2 justify-between items-center py-4 cursor-pointer"
        >
          <div
            className="bg-contain bg-no-repeat h-5 rounded-full min-w-5"
            style={{ backgroundImage: `url('${avs.metadata.logo}')` }}
          ></div>
          <span className="basis-full font-bold truncate">
            {avs?.metadata?.name}
          </span>
          <span className="basis-1/4">
            {formatNumber(formatEther(avs.tvl))}
          </span>
          <span className="basis-1/4 text-end text-sm">
            {formatNumber(avs.stakers)}
          </span>
        </div>
      ))}
    </div>
  );
}

function formatNumber(value) {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}m`;
  }

  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1)}k`;
  }

  if (value < 1_000) {
    return value.toString();
  }
}
