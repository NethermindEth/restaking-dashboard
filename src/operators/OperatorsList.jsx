import { useEffect } from 'react';
import { useServices } from '../@services/ServiceContext';
import { useMutativeReducer } from 'use-mutative';
import { reduceState } from '../shared/helpers';
import { Link, useSearchParams } from 'react-router-dom';
import CustomPagination from '../shared/CustomPagination';

const OperatorsList = () => {
  const { operatorService } = useServices();
  const [searchParams, setSearchParams] = useSearchParams();
  const [state, dispatch] = useMutativeReducer(reduceState, {});

  const fetchOperators = async pageIndex => {
    try {
      const data = await operatorService.getAll(pageIndex - 1);
      dispatch({
        operators: data.operators,
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

  const onNext = () => {
    const currentPage = parseInt(searchParams.get('page'));
    if (currentPage + 1 <= state.totalPages) {
      setSearchParams({ page: currentPage + 1 });
      fetchOperators(currentPage + 1);
    }
  };

  const onPrevious = () => {
    const currentPage = parseInt(searchParams.get('page'));
    if (currentPage - 1 >= 1) {
      setSearchParams({ page: currentPage - 1 });
      fetchOperators(currentPage - 1);
    }
  };

  const onPageClick = page => {
    setSearchParams({ page });
    fetchOperators(page);
  };

  useEffect(() => {
    const page = searchParams.get('page');
    if (!page) {
      setSearchParams({ page: 1 }, { replace: true });
      fetchOperators(1);
    } else fetchOperators(searchParams.get('page'));
  }, [searchParams]);

  return (
    <div>
      <div className="font-display font-medium pb-4 mb-4 text-foreground-1 text-3xl">
        Operators
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

        <CustomPagination
          totalPages={state.totalPages}
          currentPage={parseInt(searchParams.get('page'))}
          onNext={onNext}
          onPrevious={onPrevious}
          onPageClick={onPageClick}
        />
      </div>
    </div>
  );
};

export default OperatorsList;
