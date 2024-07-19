import { useCallback, useEffect } from 'react';
import { useServices } from '../@services/ServiceContext';
import { useMutativeReducer } from 'use-mutative';
import { reduceState } from '../shared/helpers';
import { Link, useSearchParams } from 'react-router-dom';
import Pagination from '../shared/Pagination';
import { Input, Skeleton } from '@nextui-org/react';
import { formatNumber } from '../utils';
import { useTailwindBreakpoint } from '../shared/useTailwindBreakpoint';
import useDebounce from '../shared/hooks/useDebounce';

const OperatorsList = () => {
  const { operatorService } = useServices();
  const [searchParams, setSearchParams] = useSearchParams();
  const compact = !useTailwindBreakpoint('sm');
  const [state, dispatch] = useMutativeReducer(reduceState, {
    searchTerm: searchParams.get('search'),
    searchTriggered: false,
    error: null,
    isFetchingOperatorData: true
  });
  const debouncedSearchTerm = useDebounce(state.searchTerm, 300);

  const getOperators = async (pageIndex, search) => {
    try {
      dispatch({
        isFetchingOperatorData: true
      });
      const data = await operatorService.getAll(pageIndex - 1, search);
      dispatch({
        operators: data.results,
        isFetchingOperatorData: false,
        totalPages: Math.ceil(data.totalCount / 10),
        rate: 1
      });
    } catch {
      dispatch({
        error: 'Failed to fetch Operator data',
        isFetchingOperatorData: false
      });
    }
  };

  const handleNext = useCallback(() => {
    const currentPage = parseInt(searchParams.get('page'));
    if (currentPage + 1 <= state.totalPages) {
      setSearchParams({ page: currentPage + 1 });
    }
  }, [searchParams, state.totalPages, setSearchParams, getOperators]);

  const handlePrevious = useCallback(() => {
    const currentPage = parseInt(searchParams.get('page'));
    if (currentPage - 1 >= 1) {
      setSearchParams({ page: currentPage - 1 });
    }
  }, [searchParams, setSearchParams, getOperators]);

  const handlePageClick = useCallback(
    page => {
      setSearchParams({ page });
    },
    [setSearchParams, getOperators]
  );

  const handleSearch = e => {
    dispatch({ searchTerm: e.target.value });
  };

  useEffect(() => {
    const page = searchParams.get('page');

    const params = {};
    if (page && debouncedSearchTerm) {
      params.page = state.searchTriggered ? 1 : page; // If user has searched something update the page number to 1
      params.search = debouncedSearchTerm;
    } else if (page) {
      params.page = page;
    } else if (debouncedSearchTerm) {
      params.page = 1;
      params.search = debouncedSearchTerm;
    } else {
      params.page = 1;
    }
    setSearchParams(params, { replace: true });
    getOperators(params.page, params.search);
    dispatch({ searchTriggered: false });
  }, [searchParams, debouncedSearchTerm]);

  useEffect(() => {
    dispatch({ searchTriggered: true });
  }, [debouncedSearchTerm]);

  return (
    <div>
      <div className="mb-1 font-display text-3xl font-medium text-foreground-1">
        Operators
      </div>
      <div className="mb-6 flex w-full flex-col items-center justify-between gap-4 lg:flex-row">
        <span className="text-foreground-2">
          Operators run AVS software built on top of EigenLayer. Operators
          register in EigenLayer and allow restakers to delegate to them, then
          opt in to secure various services (AVSs) built on top of EigenLayer.
          Operators may also be Stakers; these are not mutually exclusive.
        </span>
        <Input
          value={state.searchTerm}
          onChange={handleSearch}
          type="text"
          placeholder="Search by operator"
          radius="sm"
          className="lg:w-96"
          variant="bordered"
          endContent={<span className="material-symbols-outlined">search</span>}
        />
      </div>
      <div className="rounded-lg border border-outline bg-content1 text-sm">
        <div className="flex flex-row items-center justify-between gap-x-2 p-4 text-foreground-1">
          <div className="min-w-5 lg:min-w-8"></div>
          <span className="basis-1/2">Operators</span>
          <span className="basis-1/4">Restakers</span>
          <span className="basis-1/3 text-end">TVL</span>
        </div>
        {state.isFetchingOperatorData ? (
          <OperatorListSkeleton />
        ) : (
          <>
            {state.operators?.map((op, i) => (
              <Link
                to={`/operators/${op.address}`}
                key={`operator-item-${i}`}
                className={`flex cursor-pointer flex-row items-center justify-between gap-x-2 border-t border-outline px-4 py-2 hover:bg-default`}
              >
                <div className="min-w-5 text-foreground-2 lg:min-w-8">
                  {(searchParams.get('page') - 1) * 10 + i + 1}
                </div>
                {op.metadata?.logo ? (
                  <img
                    className="h-5 min-w-5 rounded-full"
                    src={op.metadata?.logo}
                  />
                ) : (
                  <span class="material-symbols-outlined flex h-5 min-w-5 items-center justify-center rounded-full text-lg text-yellow-300">
                    warning
                  </span>
                )}
                <span className="basis-1/2 truncate">
                  {op.metadata?.name ?? 'Unknown'}
                </span>
                <span className="basis-1/4">
                  {formatNumber(op.stakerCount, compact)}
                </span>
                <div className="basis-1/3 text-end">
                  <div>
                    ${formatNumber(op.strategiesTotal * state.rate, compact)}
                  </div>
                  <div className="text-xs text-subtitle">
                    {formatNumber(op.strategiesTotal, compact)} ETH
                  </div>
                </div>
              </Link>
            ))}

            <Pagination
              totalPages={state.totalPages}
              currentPage={parseInt(searchParams.get('page'))}
              handleNext={handleNext}
              handlePrevious={handlePrevious}
              handlePageClick={handlePageClick}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default OperatorsList;

const OperatorListSkeleton = () => {
  return (
    <div>
      {[...Array(10)].map((item, i) => (
        <div
          key={i}
          className="flex w-full justify-normal gap-4 border-t border-outline p-4 text-foreground-1 md:gap-8"
        >
          <div className="basis-1/2">
            <Skeleton className="h-6 w-4/5 rounded-md dark:bg-default md:w-2/3" />
          </div>
          <div className="basis-1/4">
            <Skeleton className="h-6 w-4/5 rounded-md dark:bg-default md:w-2/3" />
          </div>{' '}
          <div className="basis-1/3">
            <Skeleton className="h-6 w-full rounded-md dark:bg-default" />
          </div>
        </div>
      ))}
    </div>
  );
};
