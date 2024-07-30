import { formatETH, formatUSD } from '../shared/formatters';
import { handleServiceError, reduceState } from '../shared/helpers';
import {
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow
} from '@nextui-org/react';
import { useCallback, useEffect } from 'react';
import ErrorMessage from '../shared/ErrorMessage';
import { formatNumber } from '../utils';
import ThirdPartyLogo from '../shared/ThirdPartyLogo';
import { useMutativeReducer } from 'use-mutative';
import { useNavigate } from 'react-router-dom';
import { useServices } from '../@services/ServiceContext';
import { useTailwindBreakpoint } from '../shared/useTailwindBreakpoint';

export default function OverviewStats({
  isFetchingEigenlayerTVL,
  eigenLayerTVL,
  eigenLayerTVLError
}) {
  const { avsService, operatorService } = useServices();
  const compact = !useTailwindBreakpoint('md');
  const [state, dispatch] = useMutativeReducer(reduceState, {
    operators: [],
    avs: [],
    isFetchingOperators: false,
    isFetchingAVS: false,
    operatorError: null,
    avsError: null,
    rate: 1,
    totalOperators: 0,
    totalAVS: 0
  });

  const calculateEigenLayerTVL = () => {
    const totalEigenLayerTVL = parseFloat(
      BigInt(eigenLayerTVL[eigenLayerTVL.length - 1].ethTVL) +
        BigInt(eigenLayerTVL[eigenLayerTVL.length - 1].lstTVL)
    );
    return totalEigenLayerTVL / 1e18;
  };

  const fetchOperators = useCallback(async () => {
    try {
      dispatch({ isFetchingOperators: true, operatorError: null });

      const response = await operatorService.getAll(1, 3, null, '-tvl');

      dispatch({
        operators: response.results,
        isFetchingOperators: false,
        rate: response.rate,
        totalOperators: response.totalCount
      });
    } catch (e) {
      if (e.name !== 'AbortError') {
        dispatch({
          operatorError: handleServiceError(e),
          isFetchingOperators: false
        });
      }
    }
  }, [operatorService, dispatch]);

  const fetchAVS = useCallback(async () => {
    try {
      dispatch({ isFetchingAVS: true, avsError: null });

      const response = await avsService.getAll(1, 3, null, '-tvl');

      dispatch({
        avs: response.results,
        isFetchingAVS: false,
        rate: response.rate,
        totalAVS: response.totalCount
      });
    } catch (e) {
      if (e.name !== 'AbortError') {
        dispatch({
          avsError: handleServiceError(e),
          isFetchingAVS: false
        });
      }
    }
  }, [avsService, dispatch]);

  useEffect(() => {
    fetchOperators();
    fetchAVS();
  }, [fetchAVS, fetchOperators]);

  return (
    <>
      <div className="rd-box flex min-h-28 basis-full flex-row items-center justify-between py-4">
        <div className="flex basis-1/3 flex-col items-center gap-1">
          <span className="text-xs text-foreground-1 md:text-sm">
            EigenLayer TVL
          </span>

          {isFetchingEigenlayerTVL && (
            <Skeleton
              classNames={{ base: 'h-6 w-28 rounded-md border-none' }}
            />
          )}

          {!isFetchingEigenlayerTVL && eigenLayerTVLError && (
            <ErrorMessage message="Failed loading EigenLayer TVL" />
          )}

          {!isFetchingEigenlayerTVL && eigenLayerTVL.length > 0 && (
            <span className="text-center">
              <span className="font-display text-lg md:text-2xl">
                {formatETH(calculateEigenLayerTVL(), compact)}
              </span>
            </span>
          )}

          {!isFetchingEigenlayerTVL &&
            eigenLayerTVL.length > 0 &&
            state.rate > 1 && (
              <span className="text-center">
                <span className="text-sm text-success">
                  {formatUSD(calculateEigenLayerTVL() * state.rate, compact)}
                </span>
              </span>
            )}
        </div>
        <div className="flex min-h-10 basis-1/3 flex-col items-center gap-1 border-x border-outline px-2">
          <span className="text-center text-xs text-foreground-1 md:text-sm">
            Total AVS
          </span>
          {state.isFetchingAVS && (
            <Skeleton
              classNames={{ base: 'h-6 w-28 rounded-md border-none' }}
            />
          )}

          {!state.isFetchingAVS && state.avsError && (
            <ErrorMessage message="Failed loading Total AVS" />
          )}

          {!state.isFetchingAVS && state.avs.length > 0 && (
            <span className="font-display text-lg md:text-2xl">
              {formatNumber(state.totalAVS)}
            </span>
          )}
        </div>
        <div className="flex basis-1/3 flex-col items-center gap-1">
          <span className="text-xs text-foreground-1 md:text-sm">
            Total operators
          </span>
          {state.isFetchingOperators && (
            <Skeleton
              classNames={{ base: 'h-6 w-28 rounded-md border-none' }}
            />
          )}

          {!state.isFetchingOperators && state.operatorError && (
            <ErrorMessage message="Failed loading Total Operators" />
          )}

          {!state.isFetchingOperators && state.operators.length > 0 && (
            <span className="font-display text-lg md:text-2xl">
              {formatNumber(state.totalOperators)}
            </span>
          )}
        </div>
      </div>
      <TopAVS
        avs={state.avs}
        error={state.avsError}
        isLoading={state.isFetchingAVS}
        rate={state.rate}
      />
      <TopOperators
        error={state.operatorError}
        isLoading={state.isFetchingOperators}
        operators={state.operators}
        rate={state.rate}
      />
    </>
  );
}

function TopAVS({ isLoading, avs, rate, error }) {
  const navigate = useNavigate();
  const columns = [
    {
      key: 'avs',
      label: 'AVS',
      className: 'w-64 md:w-2/5 ps-12'
    },
    {
      key: 'operators',
      label: 'Operators',
      className: 'text-end w-36 md:w-1/5'
    },

    {
      key: 'tvl',
      label: 'TVL',
      className: 'text-end w-40 md:w-2/5'
    }
  ];

  if (error) {
    return (
      <div className="rd-box flex min-h-44 max-w-full basis-full items-center justify-center lg:grow lg:basis-0">
        <ErrorMessage error={error} />
      </div>
    );
  }

  return (
    <div className="rd-box min-h-44 max-w-full basis-full lg:grow lg:basis-0">
      <div className="w-full p-4">
        <span className="text-foreground-1">Top AVS</span>
      </div>
      <Table
        aria-label="AVS list"
        classNames={{
          base: `overflow-x-auto`,
          thead: '[&>tr:last-child]:hidden'
        }}
        hideHeader={!isLoading && avs.length == 0}
        layout="fixed"
        removeWrapper
      >
        <TableHeader columns={columns}>
          {column => (
            <TableColumn
              className={`bg-transparent py-4 text-sm font-normal leading-5 text-foreground-1 transition-colors data-[hover=true]:text-foreground-2 ${column.className}`}
              key={column.key}
            >
              {column.label}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody>
          {isLoading
            ? [...Array(3)].map((_, i) => (
                <TableRow className="border-t border-outline" key={i}>
                  <TableCell className="w-2/5 py-6 ps-4">
                    <Skeleton className="h-4 rounded-md bg-default" />
                  </TableCell>
                  <TableCell className="w-1/5 py-6 ps-4">
                    <Skeleton className="h-4 rounded-md bg-default" />
                  </TableCell>
                  <TableCell className="w-2/5 py-6 ps-4">
                    <Skeleton className="h-4 rounded-md bg-default" />
                  </TableCell>
                </TableRow>
              ))
            : avs?.map((item, i) => (
                <TableRow
                  className="cursor-pointer border-t border-outline transition-colors hover:bg-default"
                  key={`operator-item-${i}`}
                  onClick={() =>
                    navigate(`/avs/${item.address}`, {
                      state: { item }
                    })
                  }
                >
                  <TableCell className="p-4">
                    <div className="flex items-center gap-x-3">
                      <ThirdPartyLogo
                        className="size-8 min-w-8"
                        url={item.metadata?.logo}
                      />
                      <span className="truncate">
                        {item.metadata?.name || item.address}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-end">
                    {formatNumber(item.operators)}
                  </TableCell>
                  <TableCell className="text-end">
                    <div>{formatUSD(item.strategiesTotal * rate)}</div>
                    <div className="text-xs text-subtitle">
                      {formatETH(item.strategiesTotal)}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
        </TableBody>
      </Table>
    </div>
  );
}

function TopOperators({ isLoading, operators, rate, error }) {
  const navigate = useNavigate();
  const columns = [
    {
      key: 'operator',
      label: 'Operator',
      className: 'w-64 md:w-2/5 ps-12'
    },
    {
      key: 'restaker',
      label: 'Restakers',
      className: 'text-end w-36 md:w-1/5'
    },

    {
      key: 'tvl',
      label: 'TVL',
      className: 'text-end w-40 md:w-2/5'
    }
  ];

  if (error) {
    return (
      <div className="rd-box flex min-h-44 max-w-full basis-full items-center justify-center lg:grow lg:basis-0">
        <ErrorMessage error={error} />
      </div>
    );
  }

  return (
    <div className="rd-box min-h-44 max-w-full basis-full lg:grow lg:basis-0">
      <div className="w-full p-4">
        <span className="text-foreground-1">Top Operators</span>
      </div>
      <Table
        aria-label="Operator list"
        classNames={{
          base: `overflow-x-auto`,
          thead: '[&>tr:last-child]:hidden'
        }}
        hideHeader={!isLoading && operators.length == 0}
        layout="fixed"
        removeWrapper
      >
        <TableHeader columns={columns}>
          {column => (
            <TableColumn
              className={`bg-transparent py-4 text-sm font-normal leading-5 text-foreground-1 transition-colors data-[hover=true]:text-foreground-2 ${column.className}`}
              key={column.key}
            >
              {column.label}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody>
          {isLoading
            ? [...Array(3)].map((_, i) => (
                <TableRow className="border-t border-outline" key={i}>
                  <TableCell className="w-2/5 py-6 pe-8 ps-4">
                    <Skeleton className="h-4 rounded-md bg-default" />
                  </TableCell>
                  <TableCell className="w-1/5 py-6 pe-8 ps-4">
                    <Skeleton className="h-4 rounded-md bg-default" />
                  </TableCell>
                  <TableCell className="w-2/5 py-6 pe-8 ps-4">
                    <Skeleton className="h-4 rounded-md bg-default" />
                  </TableCell>
                </TableRow>
              ))
            : operators?.map((operator, i) => (
                <TableRow
                  className="cursor-pointer border-t border-outline transition-colors hover:bg-default"
                  key={`operator-item-${i}`}
                  onClick={() =>
                    navigate(`/operators/${operator.address}`, {
                      state: { operator }
                    })
                  }
                >
                  <TableCell className="p-4">
                    <div className="flex items-center gap-x-3">
                      <ThirdPartyLogo
                        className="size-8 min-w-8"
                        url={operator.metadata?.logo}
                      />
                      <span className="truncate">
                        {operator.metadata?.name || operator.address}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-end">
                    {formatNumber(operator.stakerCount)}
                  </TableCell>
                  <TableCell className="text-end">
                    <div>{formatUSD(operator.strategiesTotal * rate)}</div>
                    <div className="text-xs text-subtitle">
                      {formatETH(operator.strategiesTotal)}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
        </TableBody>
      </Table>
    </div>
  );
}
