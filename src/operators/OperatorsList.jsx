import { useEffect } from 'react';
import { useServices } from '../@services/ServiceContext';
import { useMutativeReducer } from 'use-mutative';
import { reduceState } from '../shared/helpers';
import { Link } from 'react-router-dom';

const OperatorsList = () => {
  const { operatorService } = useServices();
  const [state, dispatch] = useMutativeReducer(reduceState, {});

  const fetchOperators = async () => {
    try {
      const data = await operatorService.getAll();

      dispatch({ operators: data.operators });
    } catch {}
  };

  useEffect(() => {
    fetchOperators();
  }, []);

  return (
    <div>
      <div className="font-display font-medium pb-4 mb-4 text-foreground-1 text-3xl">
        Operators
      </div>
      <div className="bg-content1 border border-outline rounded-lg text-sm">
        <div className="flex flex-row gap-x-2 justify-between items-center p-4 text-foreground-1">
          <div className="min-w-5"></div>
          <div className="min-w-5"></div>
          <span className="basis-full">Operator</span>
          <span className="basis-1/4">Re-stakers</span>
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
            <div
              className="bg-center bg-contain bg-no-repeat h-5 rounded-full min-w-5"
              style={{ backgroundImage: `url('${op.metadata.logo}')` }}
            ></div>
            <span className="basis-full truncate">{op.metadata.name}</span>
            <span className="basis-1/4">{op.stakerCount}</span>
            <span className="basis-1/3 text-end">
              <div>ETH TODO</div>
              <div className="text-foreground-1 text-xs">USD TODO</div>
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default OperatorsList;
