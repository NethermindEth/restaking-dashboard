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
  const compact = !useTailwindBreakpoint('md');
  const navigate = useNavigate();
  const [state, dispatch] = useMutativeReducer(reduceState, {
    isFetchingAvsData: false,
    error: null
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
    const page = parseInt(searchParams.get('page') || '1');
    fetchAVS(page);
  }, [searchParams]);

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <div className="font-display font-medium text-foreground-1 text-3xl">
          AVS
        </div>
        <div className="font-display font-medium text-foreground-1 text-base">
          Actively Validated Services
        </div>
      </div>
      <div className="bg-content1 border border-outline rounded-lg text-sm">
        <div className="flex flex-row gap-x-2 justify-between items-center p-4 text-foreground-1">
          <span className="basis-full md:pl-8 md:pr-20">Name</span>
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
                    className={`border-t border-outline flex flex-row gap-x-2 justify-between items-center p-4 cursor-pointer hover:bg-default`}
                  >
                    <div className="min-w-5">
                      {(searchParams.get('page') - 1) * 10 + i + 1}
                    </div>
                    <img
                      src={avs.metadata.logo}
                      className="size-5 rounded-full"
                    />
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
                      <div>{formatNumber(avs.tvl, compact)} ETH</div>
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
          className="p-4 flex justify-normal gap-4 md:gap-8 text-foreground-1 border-t border-outline w-full"
        >
          <div className="md:w-10/12 w-6/12">
            <Skeleton className="h-6 rounded-md w-4/5 md:w-2/3 dark:bg-default" />
          </div>
          <div className="pl-5 flex justify-between gap-5 w-10/12">
            <div className="w-3/12">
              <Skeleton className="h-6 rounded-md w-full bg-default dark:bg-default" />
            </div>
            <div className="w-3/12">
              <Skeleton className="h-6 rounded-md w-full bg-default dark:bg-default" />
            </div>
            <div className="w-3/12">
              <Skeleton className="h-6 rounded-md w-full bg-default dark:bg-default" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
