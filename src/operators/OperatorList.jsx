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
import ThirdPartyLogo from '../shared/ThirdPartyLogo';
import useDebouncedSearch from '../shared/hooks/useDebouncedSearch';
import { useMutativeReducer } from 'use-mutative';
import { useServices } from '../@services/ServiceContext';

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

export default function OperatorList() {
  const { operatorService } = useServices();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const abortController = useRef(null);
  const [state, dispatch] = useMutativeReducer(reduceState, {
    operators: [],
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

  const fetchOperators = useCallback(
    async (pageNumber, search, sort) => {
      try {
        dispatch({ isFetchingData: true, error: null });

        if (abortController.current) {
          abortController.current.abort();
        }
        abortController.current = new AbortController();

        const response = await operatorService.getAll(
          pageNumber,
          search,
          sort,
          abortController.current.signal
        );

        dispatch({
          operators: response.results,
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
    [operatorService, dispatch]
  );

  const handlePageClick = useCallback(
    page => {
      setSearchParams({ page });
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
    if (debouncedSearchTerm) {
      params.search = debouncedSearchTerm;
    }
    if (state.sortDescriptor) {
      params.sort =
        state.sortDescriptor.direction === 'ascending'
          ? state.sortDescriptor.column
          : `-${state.sortDescriptor.column}`;
    }

    setSearchParams(params, { replace: true });
    fetchOperators(params.page, params.search, params.sort);
    dispatch({ searchTriggered: false });
  }, [
    debouncedSearchTerm,
    dispatch,
    fetchOperators,
    searchParams,
    setSearchParams,
    state.searchTriggered,
    state.sortDescriptor
  ]);

  useEffect(() => {
    if (debouncedSearchTerm) {
      dispatch({ searchTriggered: true });
    }
  }, [dispatch, debouncedSearchTerm]);

  return (
    <div className="flex h-full flex-col">
      <div className="font-display text-3xl font-medium text-foreground-1">
        Operators
      </div>
      <div className="mb-4 mt-3 flex w-full flex-col items-end justify-between gap-4 lg:flex-row lg:gap-16">
        <div className="text-sm text-foreground-1 lg:w-2/3">
          Operators run AVS software built on top of EigenLayer. Operators
          register in EigenLayer and allow restakers to delegate to them, then
          opt-in to secure various services (AVS) built on top of EigenLayer.
          Operators may also be Stakers; these are not mutually exclusive.
        </div>
        <Input
          className="lg:w-96"
          classNames={{
            inputWrapper:
              'border-outline data-[hover=true]:border-foreground-1',
            input: 'placeholder:text-subtitle'
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
          type="text"
          value={state.searchTerm ?? ''}
          variant="bordered"
        />
      </div>

      {!state.isFetchingData && state.error && (
        <div className="flex flex-1 flex-col items-center justify-center rounded-lg border border-outline bg-content1 text-sm">
          <ErrorMessage error={state.error} />
        </div>
      )}

      {!state.error && (
        <div className="flex flex-1 flex-col rounded-lg border border-outline bg-content1 text-sm">
          <Table
            aria-label="Operator list"
            classNames={{
              base: 'h-full overflow-x-auto',
              table: 'h-full',
              thead: '[&>tr:last-child]:hidden'
            }}
            hideHeader={!state.isFetchingData && state.operators.length == 0}
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
                    No operator found for &quot;
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
                : state.operators?.map((operator, i) => (
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
                          <span className="min-w-5">
                            {(searchParams.get('page') - 1) * 10 + i + 1}
                          </span>
                          <ThirdPartyLogo
                            className="size-8 min-w-8"
                            url={operator.metadata?.logo}
                          />
                          <span className="truncate">
                            {operator.metadata?.name || operator.address}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="pe-8 text-end">
                        {formatNumber(operator.stakerCount)}
                      </TableCell>
                      <TableCell className="pe-8 text-end">
                        <div>
                          {formatUSD(operator.strategiesTotal * state.rate)}
                        </div>
                        <div className="text-xs text-subtitle">
                          {formatETH(operator.strategiesTotal)}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}

              {!state.isFetchingData &&
                state.operators?.length > 0 &&
                [...Array(10 - state.operators.length)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell className="h-full w-2/5"></TableCell>
                    <TableCell className="w-1/5"></TableCell>
                    <TableCell className="w-2/5"></TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
          {state.operators && state.operators.length !== 0 && (
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
