import { Skeleton } from '@nextui-org/react';
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
  const [state, dispatch] = useMutativeReducer(reduceState, {
    isFetchingAvsData: false
  });

  useEffect(() => {
    async function fetchAVS() {
      try {
        dispatch({ isFetchingAvsData: true });
        const response = await avsService.getAll();
        const data = response.avs;

        for (let i = 0, count = data.length; i < count; i++) {
          let item = data[i];
          item.tvl = item.strategiesTotal;
          item.address = item.address.toLowerCase();
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

        dispatch({ selectedAVS: data[0] });
        dispatch({ avs: data });
      } catch {
        // TODO: handle error
      } finally {
        dispatch({ isFetchingAvsData: false });
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
          <span className="basis-full md:pl-10">Name</span>
          <span className="basis-1/3">Stakers</span>
          <span className="basis-1/4">Operators</span>
          <span className="basis-1/3 text-end">TVL</span>
        </div>
        {state.isFetchingAvsData ? (
          <AVSListSkeleton />
        ) : (
          state.avs?.map((avs, i) => (
            <div
              key={`avs-item-${i}`}
              onClick={() => handleAVSItemClick(avs)}
              className={`border-t border-outline flex flex-row gap-x-2 justify-between items-center p-4 cursor-pointer hover:bg-default ${
                state.selectedAVS === avs ? 'bg-content1' : ''
              }`}
            >
              <div className="min-w-5">{i + 1}</div>
              <img src={avs.metadata.logo} className="size-5 rounded-full" />
              <span className="md:basis-full md:w-full w-[180px] truncate">
                {avs?.metadata?.name}
              </span>
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
          ))
        )}
      </div>
    </div>
  );
}

const AVSListSkeleton = () => {
  return (
    <div>
      {[...Array(10)].map((item, i) => (
        <div
          key={i}
          className="p-4 flex justify-normal gap-4 md:gap-8 text-foreground-1 border-t border-outline w-full"
        >
          <div className="md:w-10/12 w-6/12">
            <Skeleton
              style={{ background: '#191C2C' }}
              className="h-8 rounded-md w-4/5 md:w-2/3"
            />
          </div>
          <div className="pl-5 flex justify-between gap-5 w-10/12">
            <div className="w-3/12">
              <Skeleton
                style={{ background: '#191C2C' }}
                className="h-8 rounded-md w-full "
              />
            </div>
            <div className="w-3/12">
              <Skeleton
                style={{ background: '#191C2C' }}
                className="h-8 rounded-md w-full "
              />
            </div>
            <div className="w-3/12">
              <Skeleton
                style={{ background: '#191C2C' }}
                className="h-8 rounded-md w-full "
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
