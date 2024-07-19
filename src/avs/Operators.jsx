import { Card, Input, Skeleton } from '@nextui-org/react';
import { SearchIcon } from '@nextui-org/shared-icons';
import { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useMutativeReducer } from 'use-mutative';
import { useServices } from '../@services/ServiceContext';
import { reduceState } from '../shared/helpers';
import Pagination from '../shared/Pagination';
import { useTailwindBreakpoint } from '../shared/useTailwindBreakpoint';
import { formatNumber } from '../utils';

export default function Operators({ avsAddress, totalTVL }) {
  const compact = !useTailwindBreakpoint('sm');
  const { avsService } = useServices();
  const [searchParams, setSearchParams] = useSearchParams();
  const [state, dispatch] = useMutativeReducer(reduceState, {
    avsOperators: null,
    searchInput: '',
    isFetchingOperators: false,
    rate: 1,
    totalPages: 1
  });

  const fetchOperators = async page => {
    try {
      dispatch({ isFetchingOperators: true });
      const data = await avsService.getAvsOperators(avsAddress, page);
      dispatch({
        avsOperators: data.results,
        totalPages: Math.ceil(data.totalCount / 10),
        isFetchingOperators: false,
        rate: data.rate
      });
    } catch {
      // TODO: handle error
      dispatch({ isFetchingOperators: false });
    }
  };

  const handleNext = () => {
    const currentPage = parseInt(searchParams.get('page') || '1');
    if (currentPage + 1 <= state.totalPages) {
      setSearchParams({ page: (currentPage + 1).toString() });
      fetchOperators(currentPage + 1);
    }
  };

  const handlePrevious = () => {
    const currentPage = parseInt(searchParams.get('page') || '1');
    if (currentPage - 1 >= 1) {
      setSearchParams({ page: (currentPage - 1).toString() });
      fetchOperators(currentPage - 1);
    }
  };

  const handlePageClick = page => {
    setSearchParams({ page: page.toString() });
    fetchOperators(page);
  };

  const filteredOperators =
    (state.avsOperators &&
      state.avsOperators
        .filter(operator =>
          operator?.metadata?.name
            .toLowerCase()
            .includes(state.searchInput.toLowerCase())
        )
        .sort(
          (a, b) =>
            parseFloat(b.strategiesTotal) - parseFloat(a.strategiesTotal)
        )) ||
    [];

  useEffect(() => {
    const page = parseInt(searchParams.get('page') || '1');
    fetchOperators(page);
  }, [searchParams]);

  if (state.avsOperators === null) {
    return null;
  }

  return (
    <div className="flex w-full flex-col items-start justify-between gap-4 md:flex-row">
      <Card
        radius="md"
        className="w-full space-y-4 border border-outline bg-content1"
      >
        <div className="flex items-center justify-between p-4">
          <div className="text-base font-light text-foreground-1">
            All Operators
          </div>
          <div>
            <Input
              type="text"
              placeholder="Search by operator"
              radius="sm"
              value={state.searchInput}
              onChange={e => dispatch({ searchInput: e.target.value })}
              className="lg:w-64"
              variant="bordered"
              endContent={<SearchIcon className="size-4" />}
            />
          </div>
        </div>

        <div className="text-sm">
          <div className="flex flex-row items-center justify-between gap-x-2 p-4 text-foreground-1">
            <span className="basis-full">Operators</span>
            <span className="basis-2/3 pl-8">Share</span>
            <span className="basis-1/3 text-end">TVL</span>
          </div>
          {state.isFetchingOperators ? (
            <OperatorsListSkeleton />
          ) : filteredOperators.length ? (
            filteredOperators.map(
              (operator, i) =>
                operator.metadata && (
                  <Link
                    to={`/operators/${operator.address}`}
                    key={`operator-item-${i}`}
                    className={`flex flex-row items-center justify-between gap-x-2 border-t border-outline p-4 hover:bg-default`}
                  >
                    <div className="min-w-5">
                      {(searchParams.get('page') - 1) * 10 + i + 1}
                    </div>
                    {state.isFetchingOperators ? (
                      <Skeleton className="size-5 min-w-5 rounded-full bg-default dark:bg-default" />
                    ) : (
                      <img
                        src={operator.metadata.logo}
                        className="size-5 rounded-full"
                        alt={`${operator.metadata.name} logo`}
                      />
                    )}
                    <span className="basis-full truncate">
                      {operator.metadata.name}
                    </span>
                    <span className="basis-2/3">
                      {(
                        (parseFloat(operator.strategiesTotal) / totalTVL) *
                        100
                      ).toFixed(2)}
                      %
                    </span>
                    <div className="min-w-fit basis-1/3 text-end">
                      <div>
                        $
                        {formatNumber(
                          operator.strategiesTotal * state.rate,
                          compact
                        )}
                      </div>
                      <div className="text-xs text-subtitle">
                        {formatNumber(operator.strategiesTotal, compact)} ETH
                      </div>
                    </div>
                  </Link>
                )
            )
          ) : (
            <div className="w-full p-4 text-foreground-1">
              No Operator found...
            </div>
          )}
        </div>
        <Pagination
          totalPages={state.totalPages}
          currentPage={parseInt(searchParams.get('page'))}
          handleNext={handleNext}
          handlePrevious={handlePrevious}
          handlePageClick={handlePageClick}
        />
      </Card>
    </div>
  );
}

const OperatorsListSkeleton = () => {
  return (
    <div>
      {[...Array(10)].map((item, i) => (
        <div
          key={i}
          className="flex w-full justify-normal gap-4 border-t border-outline p-4 text-foreground-1 md:gap-8"
        >
          <div className="w-6/12 md:w-10/12">
            <Skeleton className="h-8 w-4/5 rounded-md dark:bg-default md:w-2/3" />
          </div>
          <div className="flex w-10/12 justify-between gap-5 pl-5">
            <div className="w-3/12">
              <Skeleton className="h-8 w-full rounded-md bg-default dark:bg-default" />
            </div>

            <div className="w-3/12">
              <Skeleton className="h-8 w-full rounded-md bg-default dark:bg-default" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
