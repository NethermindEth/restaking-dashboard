import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutativeReducer } from 'use-mutative';
import { useServices } from '../@services/ServiceContext';
import { reduceState } from '../shared/helpers';
import { useTailwindBreakpoint } from '../shared/useTailwindBreakpoint';
import { formatNumber } from '../utils';

export default function AVSList({ onSelectionChange }) {
  const { avsService } = useServices();
  const compact = !useTailwindBreakpoint('md');
  const navigate = useNavigate();
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

          item.tvl = Number(item.tvl / BigInt(1e18));
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

        // onSelectionChange(data[0]);
        dispatch({ selectedAVS: data[0] });

        dispatch({ avs: data });
      } catch {
        // TODO: handle error
      }
    }

    // TODO: loading indicators

    fetchAVS();
  }, [avsService, dispatch, onSelectionChange]);

  const handleAVSItemClick = avs => {
    navigate(`/avs/${avs.address}`, { state: { avs } });
  };

  return (
    <div>
      <div className="font-display font-medium pb-4 mb-4 text-foreground-1 text-3xl uppercase">
        AVS
      </div>
      <div className="bg-content1 border border-outline rounded-lg text-sm">
        <div className="flex flex-row gap-x-2 justify-between items-center p-4 text-foreground-1">
          <div className="min-w-5"></div>
          <div className="min-w-5"></div>
          <span className="basis-full">Name</span>
          <span className="basis-1/3">Stakers</span>
          <span className="basis-1/4">Operators</span>
          <span className="basis-1/3 text-end">TVL</span>
        </div>
        {state.avs?.map((avs, i) => (
          <div
            key={`avs-item-${i}`}
            onClick={() => handleAVSItemClick(avs)}
            className={`border-t border-outline flex flex-row gap-x-2 justify-between items-center p-4 cursor-pointer hover:bg-default ${
              state.selectedAVS === avs ? 'bg-content1' : ''
            }`}
          >
            <div className="min-w-5">{i + 1}</div>
            <div
              className="bg-center bg-contain bg-no-repeat h-5 rounded-full min-w-5"
              style={{ backgroundImage: `url('${avs.metadata.logo}')` }}
            ></div>
            <span className="basis-full truncate">{avs?.metadata?.name}</span>
            <span className="basis-1/3">
              {formatNumber(avs.stakers, compact)}
            </span>
            <span className="basis-1/4">
              {formatNumber(avs.operators, compact)}
            </span>
            <span className="basis-1/3 text-end">
              <div>ETH {formatNumber(avs.tvl, compact)}</div>
              <div className="text-foreground-1 text-xs">
                USD {formatNumber(avs.tvl, compact)}
              </div>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
