import { formatETH, formatNumber, formatUSD } from '../shared/formatters';
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
import ListPagination from '../shared/ListPagination';
import { reduceState } from '../shared/helpers';
import useDebouncedSearch from '../shared/hooks/useDebouncedSearch';
import { useMutativeReducer } from 'use-mutative';
import { useServices } from '../@services/ServiceContext';

const columns = [
  {
    key: 'avs',
    label: 'AVS',
    className: 'w-64 md:w-2/5'
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
    isFetchingAvsData: false,
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
      : null
  });

  const debouncedSearchTerm = useDebouncedSearch(state.searchTerm ?? '', 300);

  const fetchAVS = useCallback(
    async (pageNumber, search, sort) => {
      try {
        dispatch({ isFetchingAvsData: true, error: null });

        if (abortController.current) {
          abortController.current.abort();
        }
        abortController.current = new AbortController();

        const response = await avsService.getAll(
          pageNumber,
          search,
          sort,
          abortController.current.signal
        );

        dispatch({
          avs: response.results,
          isFetchingAvsData: false,
          rate: response.rate,
          totalPages: Math.ceil(response.totalCount / 10)
        });

        abortController.current = null;
      } catch (error) {
        if (error.name !== 'AbortError') {
          dispatch({
            error: 'Failed to fetch AVS data',
            isFetchingAvsData: false
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

  const truncate = str => {
    return str.length > 42 ? str.substring(0, 42) + '...' : str;
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
    <div className="space-y-4">
      <div className="space-y-1">
        <div className="font-display text-3xl font-medium text-foreground-1">
          AVS
        </div>
        <div className="mb-6 flex w-full flex-col items-start justify-between gap-4 lg:flex-row lg:items-center">
          <div className="font-display text-base font-medium text-foreground-1">
            Actively Validated Services
          </div>
          <Input
            classNames={{
              inputWrapper:
                'border border-outline data-[hover=true]:border-foreground-1',
              input: 'placeholder:text-subtitle'
            }}
            value={state.searchTerm ?? ''}
            onChange={handleSearch}
            type="text"
            placeholder="Search by AVS"
            radius="sm"
            className="lg:w-96"
            variant="bordered"
            endContent={
              <span className="material-symbols-outlined text-foreground-2">
                search
              </span>
            }
          />
        </div>
      </div>
      <div className="rounded-lg border border-outline bg-content1 text-sm">
        <Table
          aria-label="Actively validated services list"
          layout="fixed"
          removeWrapper
          className="overflow-x-auto"
          sortDescriptor={state.sortDescriptor}
          onSortChange={e => dispatch({ sortDescriptor: e })}
        >
          <TableHeader columns={columns}>
            {column => (
              <TableColumn
                allowsSorting
                className={`bg-transparent py-4 text-sm font-normal leading-5 text-foreground-active data-[hover=true]:text-foreground-2 ${column.className}`}
                key={column.key}
              >
                {column.label}
              </TableColumn>
            )}
          </TableHeader>
          <TableBody
            emptyContent={
              <div className="flex h-[41.8rem] flex-col items-center justify-center">
                <span className="text-lg text-foreground-2">
                  No result found for {truncate(state.searchTerm ?? '')}
                </span>
              </div>
            }
          >
            {state.isFetchingAvsData
              ? [...Array(10)].map((_, i) => (
                  <TableRow key={i} className="border-t border-outline">
                    <TableCell className="h-[3.82rem] w-2/5">
                      <Skeleton className="h-5 rounded-md dark:bg-default" />
                    </TableCell>
                    <TableCell className="w-1/5">
                      <Skeleton className="h-5 rounded-md bg-default dark:bg-default" />
                    </TableCell>
                    <TableCell className="w-1/5">
                      <Skeleton className="h-5 rounded-md bg-default dark:bg-default" />
                    </TableCell>
                    <TableCell className="w-1/5">
                      <Skeleton className="h-5 rounded-md bg-default dark:bg-default" />
                    </TableCell>
                  </TableRow>
                ))
              : state.avs?.map((avs, i) => (
                  <TableRow
                    onClick={() =>
                      navigate(`/avs/${avs.address}`, { state: { avs: avs } })
                    }
                    key={`avs-item-${i}`}
                    className="cursor-pointer border-t border-outline hover:bg-default"
                  >
                    <TableCell className="p-5">
                      <div className="flex gap-x-3">
                        <span className="size-3">
                          {(searchParams.get('page') - 1) * 10 + i + 1}
                        </span>
                        {avs.metadata?.logo ? (
                          <img
                            className="size-5 rounded-full bg-foreground-2"
                            src={avs.metadata?.logo}
                          />
                        ) : (
                          <span className="material-symbols-outlined flex h-5 min-w-5 items-center justify-center rounded-full text-lg text-yellow-300">
                            warning
                          </span>
                        )}
                        <span className="truncate">
                          {avs.metadata?.name ?? 'N/A'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="pr-8 text-end">
                      {formatNumber(avs.stakers)}
                    </TableCell>
                    <TableCell className="pr-8 text-end">
                      {formatNumber(avs.operators)}
                    </TableCell>
                    <TableCell className="flex flex-col items-end justify-center pr-8">
                      <div>{formatUSD(avs.strategiesTotal * state.rate)}</div>
                      <div className="text-xs text-subtitle">
                        {formatETH(avs.strategiesTotal)}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}

            {!state.isFetchingAvsData &&
              state.avs &&
              [...Array(10 - state.avs.length)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell className="h-[3.82rem] w-2/5"></TableCell>
                  <TableCell className="w-1/5"></TableCell>
                  <TableCell className="w-1/5"></TableCell>
                  <TableCell className="w-1/5"></TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
        {state.avs && state.avs.length !== 0 && (
          <ListPagination
            onChange={handlePageClick}
            page={parseInt(searchParams.get('page') || '1')}
            total={state.totalPages}
          />
        )}
      </div>
    </div>
  );
}
