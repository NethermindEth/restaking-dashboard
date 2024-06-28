import { useEffect } from 'react';
import { useServices } from '../@services/ServiceContext';
import { useMutativeReducer } from 'use-mutative';
import { reduceState } from '../shared/helpers';
import { Link, useSearchParams } from 'react-router-dom';
import Pagination from '../shared/Pagination';
import { Input } from '@nextui-org/react';

const OperatorsList = () => {
  const { operatorService } = useServices();
  const [searchParams, setSearchParams] = useSearchParams();
  const [state, dispatch] = useMutativeReducer(reduceState, {});

  const getOperators = async pageIndex => {
    try {
      const data = await operatorService.getAll(pageIndex - 1);
      dispatch({
        operators: data.results,
        totalPages: Math.ceil(data.totalCount / 10)
      });
    } catch {
      // TODO: handle error
    }
  };

  const assetFormatter = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2
  });

  const handleNext = () => {
    const currentPage = parseInt(searchParams.get('page'));
    if (currentPage + 1 <= state.totalPages) {
      setSearchParams({ page: currentPage + 1 });
      getOperators(currentPage + 1);
    }
  };

  const handlePrevious = () => {
    const currentPage = parseInt(searchParams.get('page'));
    if (currentPage - 1 >= 1) {
      setSearchParams({ page: currentPage - 1 });
      getOperators(currentPage - 1);
    }
  };

  const handlePageClick = page => {
    setSearchParams({ page });
    getOperators(page);
  };

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
      <div className="flex w-full justify-between items-center mb-6">
        <span className="text-foreground-2">
          Short Operators description and provided services
        </span>
        <Input
          type="text"
          placeholder="Search by operator"
          radius="sm"
          className="lg:w-64"
          variant="bordered"
          endContent={<span className="material-symbols-outlined">search</span>}
        />
      </div>
      <div className="bg-content1 border border-outline rounded-lg text-sm">
        <div className="flex flex-row gap-x-2 justify-between items-center p-4 text-foreground-1">
          <div className="min-w-5"></div>
          <div className="min-w-5"></div>
          <span className="basis-1/2">Operators</span>
          <span className="basis-1/3">Servicing AVS</span>
          <span className="basis-1/4">Restakers</span>
          <span className="basis-1/3 text-end">TVL</span>
        </div>
        {state.operators?.map((op, i) => (
          <Link
            to={`/operators/${op.address}`}
            key={`operator-item-${i}`}
            className={`border-t border-outline flex flex-row gap-x-2 justify-between items-center p-4 cursor-pointer hover:bg-default`}
          >
            {' '}
            <div className="min-w-5"></div>
            <img className="h-5 rounded-full min-w-5" src={op.metadata?.logo} />
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
      </div>
    </div>
  );
};

export default OperatorsList;
