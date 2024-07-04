import { useCallback, useEffect } from 'react';
import { useServices } from '../@services/ServiceContext';
import { useMutativeReducer } from 'use-mutative';
import { reduceState } from '../shared/helpers';
import { Link, useSearchParams } from 'react-router-dom';
import Pagination from '../shared/Pagination';
import { Input, Skeleton } from '@nextui-org/react';

const OperatorsList = () => {
  const { operatorService } = useServices();
  const [searchParams, setSearchParams] = useSearchParams();
  const [state, dispatch] = useMutativeReducer(reduceState, {
    isFetchingOperatorData: false,
    error: null
  });

  const getOperators = async pageIndex => {
    try {
      dispatch({ isFetchingOperatorData: true });
      const data = await operatorService.getAll(pageIndex - 1);
      dispatch({
        operators: data.results,
        isFetchingOperatorData: false,
        totalPages: Math.ceil(data.totalCount / 10)
      });
    } catch {
      dispatch({
        error: 'Failed to fetch Operator data',
        isFetchingOperatorData: false
      });
    }
  };

  const assetFormatter = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2
  });

  const handleNext = useCallback(() => {
    const currentPage = parseInt(searchParams.get('page'));
    if (currentPage + 1 <= state.totalPages) {
      setSearchParams({ page: currentPage + 1 });
      getOperators(currentPage + 1);
    }
  }, [searchParams, state.totalPages, setSearchParams, getOperators]);

  const handlePrevious = useCallback(() => {
    const currentPage = parseInt(searchParams.get('page'));
    if (currentPage - 1 >= 1) {
      setSearchParams({ page: currentPage - 1 });
      getOperators(currentPage - 1);
    }
  }, [searchParams, setSearchParams, getOperators]);

  const handlePageClick = useCallback(
    page => {
      setSearchParams({ page });
      getOperators(page);
    },
    [setSearchParams, getOperators]
  );

  useEffect(() => {
    const page = searchParams.get('page');
    if (!page) {
      setSearchParams({ page: 1 }, { replace: true });
      getOperators(1);
    } else getOperators(searchParams.get('page'));
  }, [searchParams]);

  return (
    <div>
      <div className="font-display font-medium mb-1 text-foreground-1 text-3xl">
        Operators
      </div>
      <div className="flex flex-col lg:flex-row gap-4 w-full justify-between items-center mb-6">
        <span className="text-foreground-2">
          Operators run AVS software built on top of EigenLayer. Operators
          register in EigenLayer and allow restakers to delegate to them, then
          opt in to secure various services (AVSs) built on top of EigenLayer.
          Operators may also be Stakers; these are not mutually exclusive.
        </span>
        <Input
          type="text"
          placeholder="Search by operator"
          radius="sm"
          className="lg:w-96"
          variant="bordered"
          endContent={<span className="material-symbols-outlined">search</span>}
        />
      </div>
      <div className="bg-content1 border border-outline rounded-lg text-sm">
        <div className="flex flex-row gap-x-2 justify-between items-center p-4 text-foreground-1">
          <div className="min-w-8"></div>
          <span className="basis-1/2">Operators</span>
          <span className="basis-1/3">Servicing AVS</span>
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
                className={`border-t border-outline flex flex-row gap-x-2 justify-between items-center p-4 cursor-pointer hover:bg-default`}
              >
                <div className="min-w-8 text-foreground-2">
                  {(searchParams.get('page') - 1) * 10 + i + 1}
                </div>
                <img
                  className="h-5 rounded-full min-w-5"
                  src={op.metadata?.logo}
                />
                <span className="basis-1/2 truncate">{op.metadata?.name}</span>
                <span className="basis-1/3">7 AVS</span>
                <span className="basis-1/4">{op.stakerCount}</span>
                <span className="basis-1/3 text-end">
                  <div>ETH {assetFormatter.format(op.strategiesTotal)}</div>
                  <div className="text-foreground-1 text-xs">
                    USD {assetFormatter.format(op.strategiesTotal)}
                  </div>
                </span>
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
          className="p-4 flex justify-normal gap-4 md:gap-8 text-foreground-1 border-t border-outline w-full"
        >
          <div className="basis-1/2">
            <Skeleton className="h-6 rounded-md w-4/5 md:w-2/3 dark:bg-default" />
          </div>
          <div className="basis-1/3">
            <Skeleton className="h-6 rounded-md w-4/5 md:w-2/3 dark:bg-default" />
          </div>{' '}
          <div className="basis-1/4">
            <Skeleton className="h-6 rounded-md w-4/5 md:w-2/3 dark:bg-default" />
          </div>{' '}
          <div className="basis-1/3">
            <Skeleton className="h-6 rounded-md w-full dark:bg-default" />
          </div>
        </div>
      ))}
    </div>
  );
};
