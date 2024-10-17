import { formatETH, formatNumber, formatUSD } from '../shared/formatters';
import { handleServiceError, reduceState } from '../shared/helpers';
import {
  Input,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow
} from '@nextui-org/react';
import { useCallback, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ErrorMessage from '../shared/ErrorMessage';
import ListPagination from '../shared/ListPagination';
import SearchTooltip from '../shared/SearchTooltip';
import ThirdPartyLogo from '../shared/ThirdPartyLogo';
import useDebouncedSearch from '../shared/hooks/useDebouncedSearch';
import { useMutativeReducer } from 'use-mutative';
import { useServices } from '../@services/ServiceContext';

const columns = [
  {
    key: 'avs',
    label: 'AVS',
    className: 'w-64 md:w-2/5 ps-12'
  },
  {
    key: 'distributed_rewards',
    label: 'Distributed Rewards',
    className: 'text-end w-36 md:w-1/5'
  },
  {
    key: 'staker',
    label: 'Restakers',
    className: 'text-end w-36 md:w-1/5'
  },
  {
    key: 'operator',
    label: 'Operators',
    className: 'text-end w-36 md:w-1/5'
  },
  {
    key: 'tvl',
    label: 'TVL',
    className: 'text-end w-40 md:w-1/5'
  }
];

export default function AVSList() {
  const { avsService } = useServices();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const abortController = useRef(null);
  const [state, dispatch] = useMutativeReducer(reduceState, {
    avs: [],
    isFetchingData: false,
    searchTerm: searchParams.get('search'),
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
      : { column: 'tvl', direction: 'descending' }
  });

  const debouncedSearchTerm = useDebouncedSearch(state.searchTerm ?? '', 300);

  const fetchAVS = useCallback(
    async (pageNumber, search, sort) => {
      try {
        dispatch({ isFetchingData: true, error: null });

        if (abortController.current) {
          abortController.current.abort();
        }
        abortController.current = new AbortController();

        const response = await avsService.getAll(
          pageNumber,
          10,
          search,
          sort,
          abortController.current.signal
        );

        dispatch({
          avs: response.results,
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
    [avsService, dispatch]
  );

  const handlePageClick = useCallback(
    page => {
      setSearchParams({ page: page.toString() });
    },
    [setSearchParams]
  );

  const handleSearch = e => {
    dispatch({ searchTerm: e.target.value });
  };

  useEffect(() => {
    const page = searchParams.get('page') ?? 1;

    const params = {};
    params.page = state.searchTriggered ? 1 : page; // If user has searched something update the page number to 1
    if (debouncedSearchTerm) params.search = debouncedSearchTerm;
    if (state.sortDescriptor) {
      params.sort =
        state.sortDescriptor.direction === 'ascending'
          ? state.sortDescriptor.column
          : `-${state.sortDescriptor.column}`;
    }

    setSearchParams(params, { replace: true });
    fetchAVS(params.page, params.search, params.sort);
    dispatch({ searchTriggered: false });
  }, [
    debouncedSearchTerm,
    dispatch,
    fetchAVS,
    searchParams,
    setSearchParams,
    state.searchTriggered,
    state.sortDescriptor
  ]);

  useEffect(() => {
    if (debouncedSearchTerm) dispatch({ searchTriggered: true });
  }, [dispatch, debouncedSearchTerm]);

  return (
    <div className="flex h-full flex-col">
      <div className="font-display text-3xl font-medium text-foreground-1">
        AVS
      </div>
      <div className="mb-4 flex w-full flex-col items-start justify-between gap-4 lg:flex-row lg:items-center">
        <div className="text-sm text-foreground-1">
          Actively Validated Services
        </div>
        <Input
          className="lg:w-96"
          classNames={{
            inputWrapper:
              'border-outline data-[hover=true]:border-foreground-1',
            input: 'placeholder:text-foreground-2'
          }}
          color="primary"
          endContent={
            <span className="material-symbols-outlined text-foreground-2">
              search
            </span>
          }
          onChange={handleSearch}
          placeholder="Search by name/address"
          radius="sm"
          startContent={<SearchTooltip />}
          type="text"
          value={state.searchTerm ?? ''}
          variant="bordered"
        />
      </div>

      {!state.isFetchingData && state.error && (
        <div className="rd-box flex flex-1 flex-col items-center justify-center text-sm">
          <ErrorMessage error={state.error} />
        </div>
      )}

      {!state.error && (
        <div className="rd-box flex flex-1 flex-col text-sm">
          <Table
            aria-label="AVS list"
            classNames={{
              base: `${state.avs?.length === 0 ? 'h-full' : ''} overflow-x-auto`,
              table: state.avs?.length === 0 ? 'h-full' : null,
              thead: '[&>tr:last-child]:hidden'
            }}
            hideHeader={!state.isFetchingData && state.avs.length == 0}
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
            <TableBody
              emptyContent={
                <div className="flex flex-col items-center justify-center">
                  <span className="text-lg text-foreground-2">
                    No AVS found for &quot;
                    {debouncedSearchTerm.length > 42
                      ? `${debouncedSearchTerm.substring(0, 42)}...`
                      : debouncedSearchTerm}
                    &quot;
                  </span>
                </div>
              }
            >
              {state.isFetchingData
                ? [...Array(10)].map((_, i) => (
                  <TableRow className="border-t border-outline" key={i}>
                    <TableCell className="w-1/5 py-6 pe-8 ps-4">
                      <Skeleton className="h-4 rounded-md bg-default" />
                    </TableCell>
                    <TableCell className="w-1/5 py-6 pe-8 ps-4">
                      <Skeleton className="h-4 rounded-md bg-default" />
                    </TableCell>
                    <TableCell className="w-1/5 py-6 pe-8 ps-4">
                      <Skeleton className="h-4 rounded-md bg-default" />
                    </TableCell>
                    <TableCell className="w-1/5 py-6 pe-8 ps-4">
                      <Skeleton className="h-4 rounded-md bg-default" />
                    </TableCell>
                    <TableCell className="w-1/5 py-6 pe-8 ps-4">
                      <Skeleton className="h-4 rounded-md bg-default" />
                    </TableCell>
                  </TableRow>
                ))
                : state.avs?.map((avs, i) => (
                  <TableRow
                    className="cursor-pointer border-t border-outline transition-colors hover:bg-default"
                    key={`avs-item-${i}`}
                    onClick={() =>
                      navigate(`/avs/${avs.address}`, { state: { avs } })
                    }
                  >
                    <TableCell className="p-4">
                      <div className="flex items-center gap-x-3">
                        <span className="min-w-5 text-foreground-2">
                          {(searchParams.get('page') - 1) * 10 + i + 1}
                        </span>
                        <ThirdPartyLogo
                          className="size-8 min-w-8"
                          url={avs.metadata?.logo}
                        />
                        <span className="truncate">
                          {avs.metadata?.name || avs.address}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="pe-8 text-end">
                      <div>{formatUSD(avs.rewardsTotal * state.rate)}</div>
                      <div className="text-xs text-foreground-2">
                        {formatETH(avs.rewardsTotal)}
                      </div>
                    </TableCell>

                    <TableCell className="pe-8 text-end">
                      {formatNumber(avs.stakers)}
                    </TableCell>
                    <TableCell className="pe-8 text-end">
                      {formatNumber(avs.operators)}
                    </TableCell>
                    <TableCell className="pe-8 text-end">
                      <div>{formatUSD(avs.strategiesTotal * state.rate)}</div>
                      <div className="text-xs text-foreground-2">
                        {formatETH(avs.strategiesTotal)}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
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
