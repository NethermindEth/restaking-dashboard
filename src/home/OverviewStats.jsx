import { formatETH, formatUSD } from '../shared/formatters';
import { handleServiceError, reduceState, truncateAddressLg } from '../shared/helpers';
import {
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow
} from '@nextui-org/react';
import ErrorMessage from '../shared/ErrorMessage';
import { formatNumber } from '../shared/formatters';
import ThirdPartyLogo from '../shared/ThirdPartyLogo';
import { useEffect } from 'react';
import { useMutativeReducer } from 'use-mutative';
import { useNavigate } from 'react-router-dom';
import { useServices } from '../@services/ServiceContext';
import { useTailwindBreakpoint } from '../shared/hooks/useTailwindBreakpoint';
import CopyButton from '../shared/CopyButton';

export default function OverviewStats({
  isFetchingEigenLayerTVL,
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

  const calculateEigenLayerTVL = () =>
    eigenLayerTVL[eigenLayerTVL.length - 1].ethTVL +
    eigenLayerTVL[eigenLayerTVL.length - 1].lstTVL;

  useEffect(() => {
    const fetchOperators = async () => {
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
        dispatch({
          operatorError: handleServiceError(e),
          isFetchingOperators: false
        });
      }
    };

    const fetchAVS = async () => {
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
        dispatch({
          avsError: handleServiceError(e),
          isFetchingAVS: false
        });
      }
    };

    fetchOperators();
    fetchAVS();
  }, [avsService, dispatch, operatorService]);

  return (
    <>
      <div className="rd-box flex min-h-28 basis-full flex-row items-center justify-between py-4">
        <div className="flex basis-1/3 flex-col items-center gap-1 px-2">
          <span className="text-xs text-default-2 md:text-sm">
            EigenLayer TVL
          </span>

          {isFetchingEigenLayerTVL && (
            <Skeleton
              classNames={{ base: 'h-6 w-20 rounded-md border-none md:w-28' }}
            />
          )}

          {!isFetchingEigenLayerTVL && eigenLayerTVLError && (
            <ErrorMessage message="Failed loading EigenLayer TVL" />
          )}

          {!isFetchingEigenLayerTVL && eigenLayerTVL.length > 0 && (
            <span className="text-center">
              <span className="font-display text-lg md:text-2xl">
                {formatUSD(calculateEigenLayerTVL() * state.rate, compact)}
              </span>
            </span>
          )}

          {!isFetchingEigenLayerTVL &&
            eigenLayerTVL.length > 0 &&
            state.rate > 1 && (
              <span className="text-sm text-success">
                {formatETH(calculateEigenLayerTVL(), compact)}
              </span>
            )}
        </div>
        {/* //TODO: uncomment this code to see static design of total rewards supplied */}
        {/* <div className="flex min-h-10 basis-1/3 flex-col items-center gap-1 border-x border-outline px-2">
          <span className="text-xs text-default-2 md:text-sm ">
            Total Rewards Supplied
          </span>

          <span className="text-center">
            <span className="font-display text-lg md:text-2xl ">
              $ 1,479,349
            </span>
          </span>

          <span className="text-sm text-success">
            ETH 3,120,070,554
          </span>


        </div> */}
        <div className="flex min-h-10 basis-1/3 flex-col items-center gap-1 border-x border-outline px-2">
          <span className="text-xs text-foreground-1 md:text-sm">
            Total AVS
          </span>
          {state.isFetchingAVS && (
            <Skeleton
              classNames={{ base: 'h-6 w-20 rounded-md border-none md:w-28' }}
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
        <div className="flex basis-1/3 flex-col items-center gap-1 px-2">
          <span className="text-xs text-foreground-1 md:text-sm">
            Total operators
          </span>
          {state.isFetchingOperators && (
            <Skeleton
              classNames={{ base: 'h-6 w-20 rounded-md border-none md:w-28' }}
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


      {/* //TODO: uncomment this code to see static design of top rewards */}
      {/* <TopRewards
        isLoading={false}
      /> */}
    </>
  );
}

function TopAVS({ isLoading, avs, rate, error }) {
  const navigate = useNavigate();
  const compact = !useTailwindBreakpoint('sm');
  const columns = [
    {
      key: 'avs',
      label: 'AVS',
      className: 'w-44 md:w-2/5 ps-4'
    },
    {
      key: 'operators',
      label: 'Operators',
      className: 'text-end md:w-1/5'
    },

    {
      key: 'tvl',
      label: 'TVL',
      className: 'text-end md:w-2/5'
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
                  {formatNumber(item.operators, compact)}
                </TableCell>
                <TableCell className="text-end">
                  <div>{formatUSD(item.strategiesTotal * rate, compact)}</div>
                  <div className="text-xs text-foreground-2">
                    {formatETH(item.strategiesTotal, compact)}
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
  const compact = !useTailwindBreakpoint('sm');
  const columns = [
    {
      key: 'operator',
      label: 'Operator',
      className: 'w-44 md:w-2/5 ps-4'
    },
    {
      key: 'restaker',
      label: 'Restakers',
      className: 'text-end md:w-1/5'
    },

    {
      key: 'tvl',
      label: 'TVL',
      className: 'text-end md:w-2/5'
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
        <span className="text-foreground-1">Top operators</span>
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
                  {formatNumber(operator.stakerCount, compact)}
                </TableCell>
                <TableCell className="text-end">
                  <div>
                    {formatUSD(operator.strategiesTotal * rate, compact)}
                  </div>
                  <div className="text-xs text-foreground-2">
                    {formatETH(operator.strategiesTotal, compact)}
                  </div>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </div>
  );
}

function TopRewards({ isLoading = false }) {
  const columns = [
    {
      key: 'top_rewarded_earners',
      label: 'Top rewarded earners',
      className: 'w-44 md:w-1/2 ps-4'
    },

    {
      key: 'value',
      label: 'Value',
      className: 'text-end md:w-1/2'
    }
  ];

  if (false) {
    return (
      <div className="rd-box flex min-h-44 max-w-full basis-full items-center justify-center lg:grow lg:basis-0">
        <ErrorMessage error={error} />
      </div>
    );
  }

  return (
    <div className="rd-box min-h-44 max-w-full basis-full lg:grow lg:basis-0">
      <div className="w-full p-4">
        <span className="text-foreground-1">Rewards</span>
      </div>
      <Table
        aria-label="Operator list"
        classNames={{
          base: `overflow-x-auto`,
          thead: '[&>tr:last-child]:hidden'
        }}
        // hideHeader={!isLoading}
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

          <TableRow className="cursor-pointer border-t border-outline transition-colors hover:bg-default">
            <TableCell className="p-4">
              <div className="text-end w-64 md:w-auto pr-3">
                <div className="flex items-center justify-between pr-1 w-[172px]">
                  <span className="truncate text-sm">
                    {truncateAddressLg("0xbf0aaf43144eca99503860d8c5ac16e0875184f6")}
                  </span>
                  <CopyButton className="text-default-2 flex-shrink-0" value={"0xbf0aaf43144eca99503860d8c5ac16e0875184f6"} variant="outlined" />
                </div>
              </div>
            </TableCell>
            <TableCell className="text-end">
              <div>
                $4,567
              </div>
              <div className="text-xs text-foreground-2">
                1.204  ETH
              </div>
            </TableCell>
          </TableRow >

          <TableRow className="cursor-pointer border-t border-outline transition-colors hover:bg-default">
            <TableCell className="p-4">
              <div className="text-end w-64 md:w-auto pr-3">
                <div className="flex items-center justify-between pr-1 w-[172px]">
                  <span className="truncate text-sm">
                    {truncateAddressLg("0xbf0aaf43144eca99503860d8c5ac16e0875184f6")}
                  </span>
                  <CopyButton className="text-default-2 flex-shrink-0" value={"0xbf0aaf43144eca99503860d8c5ac16e0875184f6"} variant="outlined" />
                </div>
              </div>
            </TableCell>
            <TableCell className="text-end">
              <div>
                $4,567
              </div>
              <div className="text-xs text-foreground-2">
                1.204  ETH
              </div>
            </TableCell>
          </TableRow >

          <TableRow className="cursor-pointer border-t border-outline transition-colors hover:bg-default">
            <TableCell className="p-4">
              <div className="text-end w-64 md:w-auto pr-3">
                <div className="flex items-center justify-between pr-1 w-[172px]">
                  <span className="truncate text-sm">
                    {truncateAddressLg("0xbf0aaf43144eca99503860d8c5ac16e0875184f6")}
                  </span>
                  <CopyButton className="text-default-2 flex-shrink-0" value={"0xbf0aaf43144eca99503860d8c5ac16e0875184f6"} variant="outlined" />
                </div>
              </div>
            </TableCell>
            <TableCell className="text-end">
              <div>
                $4,567
              </div>
              <div className="text-xs text-foreground-2">
                1.204  ETH
              </div>
            </TableCell>
          </TableRow >
        </TableBody>
      </Table>
    </div >
  );
}