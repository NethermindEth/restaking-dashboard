import { formatETH, formatNumber, formatUSD } from '../shared/formatters';
import { handleServiceError, reduceState } from '../shared/helpers';
import {
  Image,
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
      : { column: 'tvl', direction: 'descending' }
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
      } catch (e) {
        if (e.name !== 'AbortError') {
          dispatch({
            error: handleServiceError(e),
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
        <div className="text-foreground-1">Actively Validated Services</div>
        <Input
          classNames={{
            inputWrapper:
              'border-outline data-[hover=true]:border-foreground-1',
            input: 'placeholder:text-subtitle'
          }}
          value={state.searchTerm ?? ''}
          onChange={handleSearch}
          type="text"
          color="primary"
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

      {!state.isFetchingAvsData && state.error && (
        <div className="flex flex-1 flex-col items-center justify-center rounded-lg border border-outline bg-content1 text-sm">
          <ErrorMessage error={state.error} />
        </div>
      )}

      {!state.error && (
        <div className="flex flex-1 flex-col rounded-lg border border-outline bg-content1 text-sm">
          <Table
            aria-label="AVS list"
            layout="fixed"
            removeWrapper
            classNames={{
              base: 'overflow-x-auto h-full',
              table: 'h-full'
            }}
            sortDescriptor={state.sortDescriptor}
            onSortChange={e => dispatch({ sortDescriptor: e })}
          >
            <TableHeader columns={columns}>
              {column => (
                <TableColumn
                  allowsSorting
                  className={`text-foreground-active bg-transparent py-4 text-sm font-normal leading-5 data-[hover=true]:text-foreground-2 ${column.className}`}
                  key={column.key}
                >
                  {column.label}
                </TableColumn>
              )}
            </TableHeader>
            <TableBody>
              {state.isFetchingAvsData
                ? [...Array(10)].map((_, i) => (
                    <TableRow key={i} className="border-t border-outline">
                      <TableCell className="w-2/5 py-6 pe-8 ps-4">
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
                      onClick={() =>
                        navigate(`/avs/${avs.address}`, { state: { avs } })
                      }
                      key={`avs-item-${i}`}
                      className="cursor-pointer border-t border-outline transition-colors hover:bg-default"
                    >
                      <TableCell className="p-4">
                        <div className="flex items-center gap-x-3">
                          <span className="min-w-5">
                            {(searchParams.get('page') - 1) * 10 + i + 1}
                          </span>
                          {avs.metadata?.logo ? (
                            <Image
                              className="size-8 min-w-8 rounded-full border-2 border-foreground-2 bg-foreground-2"
                              src={avs.metadata?.logo}
                            />
                          ) : (
                            <span className="material-symbols-outlined flex size-8 min-w-8 items-center justify-center rounded-full bg-foreground-2">
                              question_mark
                            </span>
                          )}
                          <span className="truncate">
                            {avs.metadata?.name || avs.address}
                          </span>
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
                    <TableCell className="h-full w-2/5"></TableCell>
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
      )}
    </div>
  );
}
