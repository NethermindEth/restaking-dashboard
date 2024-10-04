import { formatETH, formatNumber, formatUSD } from '../shared/formatters';
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
import { useCallback, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import ErrorMessage from '../shared/ErrorMessage';
import ListPagination from '../shared/ListPagination';
import ThirdPartyLogo from '../shared/ThirdPartyLogo';
import { useMutativeReducer } from 'use-mutative';
import { useServices } from '../@services/ServiceContext';
import { formatDate } from './helpers';
import { useTailwindBreakpoint } from '../shared/hooks/useTailwindBreakpoint';



const columns = [
  {
    key: 'rewardsTotal',
    label: 'Rewards received',
    className: 'w-64 md:w-2/5 ps-12'
  },
  {
    key: 'timestamp',
    label: 'Snapshot date',
    className: 'w-36 md:w-1/5'
  }
];

const tooltipDateFormatter = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium'
});

export default function OperatorRewards({ address, ethRate }) {
  const { rewardService } = useServices();
  const [searchParams, setSearchParams] = useSearchParams();
  const abortController = useRef(null);
  const [state, dispatch] = useMutativeReducer(reduceState, {
    rewards: [],
    isFetchingData: false,
    error: null,
    rate: 1,
    searchTriggered: false,
    sortDescriptor: searchParams.get('sort')
      ? {
        column: searchParams.get('sort').replace('-', ''),
        direction: searchParams.get('sort').startsWith('-')
          ? 'descending'
          : 'ascending'
      }
      : { column: 'timestamp', direction: 'descending' }
  });
  const compact = !useTailwindBreakpoint('md');

  const fetchRewards = useCallback(
    async (pageNumber, sort) => {
      try {
        dispatch({ isFetchingData: true, error: null });

        if (abortController.current) {
          abortController.current.abort();
        }
        abortController.current = new AbortController();

        const response = await rewardService.getOperatorRewards(
          address,
          pageNumber,
          10,
          sort,
          abortController.current.signal
        );
        console.log('response', response);
        dispatch({
          rewards: response.results,
          isFetchingData: false,
          rate: response.rate,
          totalPages: Math.ceil(response.totalCount / 10)
        });

        abortController.current = null;
      } catch (e) {
        if (e.name !== 'AbortError') {
          dispatch({
            error: handleServiceError(e),
            isFetchingData: false
          });
        }
      }
    },
    [rewardService, dispatch, address]
  );

  const handlePageClick = useCallback(
    page => {
      setSearchParams({ page });
    },
    [setSearchParams]
  );

  useEffect(() => {
    const page = searchParams.get('page') ?? 1;
    const params = {};

    params.page = state.searchTriggered ? 1 : page; // If user has searched something update the page number to 1

    if (state.sortDescriptor) {
      params.sort =
        state.sortDescriptor.direction === 'ascending'
          ? state.sortDescriptor.column
          : `-${state.sortDescriptor.column}`;
    }

    fetchRewards(params.page, params.sort);
    dispatch({ searchTriggered: false });
  }, [
    dispatch,
    fetchRewards,
    searchParams,
    setSearchParams,
    state.searchTriggered,
    state.sortDescriptor
  ]);

  return (
    <div className="flex h-full flex-col">
      {!state.isFetchingData && state.error && (
        <div className="rd-box flex flex-1 flex-col items-center justify-center text-sm">
          <ErrorMessage error={state.error} />
        </div>
      )}

      {!state.error && (
        <div className="rd-box flex flex-1 flex-col text-sm">
          <Table
            aria-label="Rewards list"
            classNames={{
              base: `${state.rewards?.length === 0 ? 'h-full' : ''} overflow-x-auto`,
              table: state.rewards?.length === 0 ? 'h-full' : null,
              thead: '[&>tr:last-child]:hidden'
            }}
            hideHeader={!state.isFetchingData && state.rewards.length == 0}
            layout="fixed"
            onSortChange={e => dispatch({ sortDescriptor: e })}
            removeWrapper
            sortDescriptor={state.sortDescriptor}
          >
            <TableHeader columns={columns}>
              {column => (
                <TableColumn
                  allowsSorting
                  className={`bg-transparent py-4 text-sm font-normal leading-5 text-foreground-1 transition-colors data-[hover=true]:text-foreground-2 ${column.className}`}
                  key={column.key}
                >
                  {column.label}
                </TableColumn>
              )}
            </TableHeader>
            <TableBody>
              {state.isFetchingData
                ? [...Array(10)].map((_, i) => (
                  <TableRow className="border-t border-outline" key={i}>
                    <TableCell className="w-2/5 py-6 pe-8 ps-4">
                      <Skeleton className="h-4 rounded-md bg-default" />
                    </TableCell>
                    <TableCell className="w-1/5 py-6 pe-8 ps-4">
                      <Skeleton className="h-4 rounded-md bg-default" />
                    </TableCell>
                  </TableRow>
                ))
                : state.rewards?.map((reward, i) => (
                  <TableRow
                    className="border-t border-outline transition-colors hover:bg-default"
                    key={`reward-item-${i}`}
                  >
                    <TableCell className="p-4">
                      <div className="ps-6">
                        <div>{formatUSD(reward.rewardsTotal * ethRate, compact)}</div>
                        <div className="text-xs text-foreground-2">
                          {formatETH(reward.rewardsTotal, compact)}
                        </div>
                      </div></TableCell>
                    <TableCell className="pe-8">{formatDate(reward.timestamp)}</TableCell>
                  </TableRow>
                ))}

              {!state.isFetchingData && state.rewards.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3}>
                    <div className="flex flex-col items-center justify-center">
                      <span className="text-lg text-foreground-2">
                        No rewards found
                      </span>
                    </div>
                  </TableCell>
                  <TableCell hidden />
                </TableRow>
              )}
            </TableBody>
          </Table>
          {state.totalPages > 1 && (
            <ListPagination
              onChange={handlePageClick}
              page={parseInt(searchParams.get('page') || '1')}
              total={state.totalPages}
            />
          )}
        </div>
      )}
    </div>
  );
}
