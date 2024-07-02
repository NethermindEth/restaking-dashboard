import { Card, Input, Skeleton } from '@nextui-org/react';
import { SearchIcon } from '@nextui-org/shared-icons';
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useMutativeReducer } from 'use-mutative';
import { useServices } from '../@services/ServiceContext';
import { reduceState } from '../shared/helpers';
import Pagination from '../shared/Pagination';
import { useTailwindBreakpoint } from '../shared/useTailwindBreakpoint';
import { formatNumber } from '../utils';

export default function Operators({ avsAddress, totalTVL }) {
  const compact = !useTailwindBreakpoint('md');
  const { avsService } = useServices();
  const [searchParams, setSearchParams] = useSearchParams();
  const [state, dispatch] = useMutativeReducer(reduceState, {
    avsOperators: null,
    searchInput: '',
    isFetchingOperators: false
  });

  const fetchOperators = async pageIndex => {
    try {
      dispatch({ isFetchingOperators: true });
      const data = await avsService.getAvsOperators(avsAddress, pageIndex - 1);
      dispatch({
        avsOperators: data.results,
        totalPages: Math.ceil(data.totalCount / 10),
        isFetchingOperators: false
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
    <div className="w-full flex md:flex-row flex-col items-start justify-between gap-4">
      <Card
        radius="md"
        className="bg-content1 border border-outline w-full space-y-4"
      >
        <div className="flex items-center justify-between p-4 ">
          <div className="font-light text-base text-foreground-1">
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
          <div className="flex flex-row gap-x-2 justify-between items-center p-4 text-foreground-1">
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
                  <div
                    key={`operator-item-${i}`}
                    className={`border-t border-outline flex flex-row gap-x-2 justify-between items-center p-4 hover:bg-default`}
                  >
                    <div className="min-w-5">{i + 1}</div>
                    {state.isFetchingOperators ? (
                      <Skeleton className="bg-default dark:bg-default min-w-5 size-5 rounded-full" />
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
                    <span className="basis-1/3 text-end min-w-fit">
                      <div>
                        {formatNumber(operator.strategiesTotal, compact)} ETH
                      </div>
                    </span>
                  </div>
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
          className="p-4 flex justify-normal gap-4 md:gap-8 text-foreground-1 border-t border-outline w-full"
        >
          <div className="md:w-10/12 w-6/12">
            <Skeleton className="h-8 rounded-md w-4/5 md:w-2/3 dark:bg-default" />
          </div>
          <div className="pl-5 flex justify-between gap-5 w-10/12">
            <div className="w-3/12">
              <Skeleton className="h-8 rounded-md w-full bg-default dark:bg-default" />
            </div>

            <div className="w-3/12">
              <Skeleton className="h-8 rounded-md w-full bg-default dark:bg-default" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
