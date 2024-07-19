import { Skeleton } from '@nextui-org/react';
import { useCallback, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMutativeReducer } from 'use-mutative';
import { useServices } from '../@services/ServiceContext';
import { reduceState } from '../shared/helpers';
import Pagination from '../shared/Pagination';
import { useTailwindBreakpoint } from '../shared/useTailwindBreakpoint';
import { formatNumber } from '../utils';

export default function AVSList() {
  const { avsService } = useServices();
  const [searchParams, setSearchParams] = useSearchParams();
  const compact = !useTailwindBreakpoint('sm');
  const navigate = useNavigate();
  const [state, dispatch] = useMutativeReducer(reduceState, {
    isFetchingAvsData: false,
    error: null,
    rate: 1
  });

  const fetchAVS = useCallback(
    async pageNumber => {
      try {
        dispatch({ isFetchingAvsData: true, error: null });
        const response = await avsService.getAll(pageNumber);
        const data = response.results;

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

        dispatch({
          avs: data,
          isFetchingAvsData: false,
          rate: response.rate,
          totalPages: Math.ceil(response.totalCount / 10)
        });
      } catch (error) {
        dispatch({
          error: 'Failed to fetch AVS data',
          isFetchingAvsData: false
        });
      }
    },
    [avsService, dispatch]
  );

  const handleAVSItemClick = avs => {
    navigate(`/avs/${avs.address}`, { state: { avs } });
  };

  const handleNext = useCallback(() => {
    const currentPage = parseInt(searchParams.get('page') || '1');
    if (currentPage + 1 <= state.totalPages) {
      setSearchParams({ page: (currentPage + 1).toString() });
      fetchAVS(currentPage + 1);
    }
  }, [searchParams, state.totalPages, setSearchParams, fetchAVS]);

  const handlePrevious = useCallback(() => {
    const currentPage = parseInt(searchParams.get('page') || '1');
    if (currentPage - 1 >= 1) {
      setSearchParams({ page: (currentPage - 1).toString() });
      fetchAVS(currentPage - 1);
    }
  }, [searchParams, fetchAVS]);

  const handlePageClick = useCallback(
    page => {
      setSearchParams({ page: page.toString() });
      fetchAVS(page);
    },
    [setSearchParams, fetchAVS]
  );

  useEffect(() => {
    const page = searchParams.get('page');
    if (!page) {
      setSearchParams({ page: 1 }, { replace: true });
      fetchAVS(1);
    } else fetchAVS(searchParams.get('page'));
  }, [searchParams]);

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <div className="font-display text-3xl font-medium text-foreground-1">
          AVS
        </div>
        <div className="font-display text-base font-medium text-foreground-1">
          Actively Validated Services
        </div>
      </div>
      <div className="rounded-lg border border-outline bg-content1 text-sm">
        <div className="flex flex-row items-center justify-between gap-x-2 p-4 text-foreground-1">
          <div className="min-w-5"></div>
          <span className="basis-1/2">Name</span>
          <span className="basis-1/3">Stakers</span>
          <span className="basis-1/4">Operators</span>
          <span className="basis-1/3 text-end">TVL</span>
        </div>
        {state.isFetchingAvsData ? (
          <AVSListSkeleton />
        ) : (
          <div>
            {state.avs?.map(
              (avs, i) =>
                avs.metadata && (
                  <div
                    key={`avs-item-${i}`}
                    onClick={() => handleAVSItemClick(avs)}
                    className={`flex cursor-pointer flex-row items-center justify-between gap-x-2 border-t border-outline p-4 hover:bg-default`}
                  >
                    <div className="min-w-5">
                      {(searchParams.get('page') - 1) * 10 + i + 1}
                    </div>
                    <img
                      src={avs.metadata.logo}
                      className="size-5 rounded-full"
                    />
                    <span className="basis-1/2 truncate">
                      {avs?.metadata?.name}
                    </span>
                    <span className="basis-1/3">
                      {formatNumber(avs.stakers, compact)}
                    </span>
                    <span className="basis-1/4">
                      {formatNumber(avs.operators, compact)}
                    </span>
                    <span className="basis-1/3 text-end">
                      <div>${formatNumber(avs.tvl * state.rate, compact)}</div>
                      <div className="text-xs text-subtitle">
                        {formatNumber(avs.tvl, compact)} ETH
                      </div>
                    </span>
                  </div>
                )
            )}

            <Pagination
              totalPages={state.totalPages}
              currentPage={parseInt(searchParams.get('page') || '1')}
              handleNext={handleNext}
              handlePrevious={handlePrevious}
              handlePageClick={handlePageClick}
            />
          </div>
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
          className="flex w-full justify-between gap-4 border-t border-outline p-4 text-foreground-1 md:gap-8"
        >
          <div className="basis-1/2">
            <Skeleton className="h-6 w-2/3 rounded-md dark:bg-default" />
          </div>
          <div className="basis-1/3">
            <Skeleton className="h-6 w-2/3 rounded-md bg-default dark:bg-default" />
          </div>
          <div className="basis-1/4">
            <Skeleton className="h-6 w-2/3 rounded-md bg-default dark:bg-default" />
          </div>
          <div className="basis-1/3">
            <Skeleton className="h-6 w-full rounded-md bg-default dark:bg-default" />
          </div>
        </div>
      ))}
    </div>
  );
};
