import { formatETH, formatUSD } from '../shared/formatters';
import { handleServiceError, reduceState } from '../shared/helpers';
import {
  Input,
  Skeleton,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow
} from '@nextui-org/react';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import ErrorMessage from '../shared/ErrorMessage';
import ListPagination from '../shared/ListPagination';
import OperatorsTabLineChart from './charts/OperatorsTabLineChart';
import { ParentSize } from '@visx/responsive';
import SearchTooltip from '../shared/SearchTooltip';
import ThirdPartyLogo from '../shared/ThirdPartyLogo';
import useDebouncedSearch from '../shared/hooks/useDebouncedSearch';
import { useMutativeReducer } from 'use-mutative';
import { useServices } from '../@services/ServiceContext';
import { useTailwindBreakpoint } from '../shared/hooks/useTailwindBreakpoint';

export default function AVSDetailsOperatorsTab({
  avsError,
  isAVSLoading,
  operators,
  totalTokens
}) {
  const { address } = useParams();
  const [state, dispatch] = useMutativeReducer(reduceState, {
    error: undefined,
    points: undefined,
    isChartLoading: true
  });

  const { avsService } = useServices();

  useEffect(() => {
    (async () => {
      dispatch({ isChartLoading: true, error: undefined });
      try {
        const response = await avsService.getAVSOperatorsOvertime(address);
        dispatch({ points: response, isChartLoading: false });
      } catch (e) {
        dispatch({
          error: handleServiceError(e),
          isChartLoading: false
        });
      }
    })();
  }, [address, avsService, dispatch]);

  // our endpoint only returns up to yesterdays data. We need to append today's data point
  // into the graph
  const currentPoint = useMemo(
    () => ({
      timestamp: new Date(),
      operators
    }),
    [operators]
  );

  return (
    <>
      {/*line chart*/}
      {isAVSLoading || state.isChartLoading || state.error || avsError ? (
        <div className="rd-box flex h-[390px] w-full items-center justify-center p-4">
          {avsError || state.error ? (
            <ErrorMessage error={avsError ?? state.error} />
          ) : (
            <Spinner color="primary" size="lg" />
          )}
        </div>
      ) : (
        <ParentSize>
          {parent => (
            <OperatorsTabLineChart
              height={288}
              points={state.points.concat(currentPoint)}
              width={parent.width}
            />
          )}
        </ParentSize>
      )}

      {/*layout*/}
      <div className="flex h-full w-full">
        <div className="mt-4 w-full">
          <AVSOperatorsList
            address={address}
            avsError={avsError}
            isAVSLoading={isAVSLoading}
            tvl={totalTokens.lst + totalTokens.eth}
          />
        </div>
      </div>
    </>
  );
}

function AVSOperatorsList({ address, avsError, isAVSLoading, tvl }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { rdService } = useServices();

  const [state, dispatch] = useMutativeReducer(reduceState, {
    currentRate: 1,
    error: undefined,
    operators: [],
    promotedOperators: [],
    promotedOperatorsRate: 1,
    isInputTouched: false,
    isTableLoading: true,
    totalPages: undefined,
    page: Math.max(parseInt(searchParams.get('page') || '1'), 1),
    search: searchParams.get('search') || '',
    sort: searchParams.get('sort') || '-tvl',
    sortDescriptor: searchParams.get('sort')
      ? {
          column: searchParams.get('sort').replace('-', ''),
          direction: searchParams.get('sort').startsWith('-')
            ? 'descending'
            : 'ascending'
        }
      : { column: 'tvl', direction: 'descending' },
    updateSearchParams: false
  });
  const { avsService } = useServices();
  const abortController = useRef(null);
  const debouncedSearch = useDebouncedSearch(state.search, 300);
  const compact = !useTailwindBreakpoint('md');

  useEffect(() => {
    // initial page load + new search results after typing in search query
    if (!state.isInputTouched) {
      return;
    }

    dispatch({
      page: 1
    });
  }, [debouncedSearch, dispatch, state.isInputTouched]);

  useEffect(() => {
    (async () => {
      try {
        dispatch({ isTableLoading: true, isInputTouched: false });

        if (abortController.current) {
          abortController.current.abort();
        }

        abortController.current = new AbortController();

        let sort = state.sort;

        // share is basically just tvl, backend has no support for share
        if (sort.includes('share')) {
          sort = sort.replace('share', 'tvl');
        }

        const response = await avsService.getAVSOperators(
          address,
          state.page,
          debouncedSearch,
          sort,
          abortController.current.signal
        );

        dispatch({
          operators: response.results,
          isTableLoading: false,
          totalPages: Math.ceil(response.totalCount / 10),
          currentRate: response.rate,
          updateSearchParams: true
        });
      } catch (e) {
        if (e.name !== 'AbortError') {
          dispatch({
            error: handleServiceError(e),
            operators: [],
            totalPages: undefined,
            isTableLoading: false,
            updateSearchParams: true
          });
        }
      }
    })();
  }, [address, avsService, debouncedSearch, dispatch, state.page, state.sort]);

  useEffect(() => {
    if (!state.updateSearchParams) {
      return;
    }
    const params = new URLSearchParams();
    params.set('page', state.page);
    params.set('sort', state.sort);
    if (state.search) {
      params.set('search', state.search);
    }
    setSearchParams(params, { replace: true });
    dispatch({ updateSeachParams: false });
  }, [
    dispatch,
    state.updateSearchParams,
    setSearchParams,
    state.page,
    state.search,
    state.sort
  ]);

  useEffect(() => {
    (async () => {
      try {
        const response = await rdService.getAVSPromotedOperators(address);
        dispatch({
          promotedOperators: response.results,
          promotedOperatorsRate: response.rate
        });
      } catch (e) {
        // swallow error because we don't need to show error message
      }
    })();
  }, [address, dispatch, rdService]);

  const handleSort = useCallback(
    e => {
      let sort = e.column;

      if (e.direction === 'descending') {
        sort = '-' + sort;
      }
      dispatch({ sortDescriptor: e, sort, page: 1 });
    },
    [dispatch]
  );

  const handleInputChange = useCallback(
    e => {
      dispatch({ search: e.target.value, isInputTouched: true });
    },
    [dispatch]
  );

  const handlePageClick = useCallback(
    page => dispatch({ page: page }),
    [dispatch]
  );

  const renderPromotedOperators = useCallback(() => {
    return state.promotedOperators?.map((operator, i) => (
      <TableRow
        className="size-16 cursor-pointer border-t border-outline bg-black/100 transition-colors hover:bg-default"
        key={`promoted-operator-item-${i}`}
        onClick={() =>
          navigate(`/operators/${operator.operator}`, {
            state: { operator }
          })
        }
      >
        <TableCell className="p-4">
          <div className="flex items-center gap-x-3">
            <div className="flex size-5 items-center justify-center rounded-md bg-foreground-2 p-1 text-center text-xs text-content1">
              ad
            </div>
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
          {tvl === 0
            ? 'N/A'
            : `${((operator.strategiesTotal / tvl) * 100).toFixed(2)}%`}
        </TableCell>
        <TableCell className="pe-8 text-end">
          <div>
            {formatUSD(operator.strategiesTotal * state.promotedOperatorsRate)}
          </div>
          <div className="text-xs text-foreground-2">
            {formatETH(operator.strategiesTotal)}
          </div>
        </TableCell>
      </TableRow>
    ));
  }, [navigate, state.promotedOperators, state.promotedOperatorsRate, tvl]);

  return (
    <div className="rd-box text-sm">
      <div className="flex flex-col justify-between gap-y-4 p-4 lg:flex-row lg:items-center">
        <div className="text-medium text-foreground-1">All operators</div>
        <Input
          className="w-full lg:w-[40%]"
          classNames={{
            inputWrapper:
              'border-outline data-[hover=true]:border-foreground-1',
            input: 'placeholder:text-foreground-2'
          }}
          endContent={
            <span className="material-symbols-outlined text-foreground-2">
              search
            </span>
          }
          onChange={handleInputChange}
          placeholder="Search by name/address"
          radius="sm"
          startContent={<SearchTooltip />}
          type="text"
          value={state.search ?? ''}
          variant="bordered"
        />
      </div>

      {(state.error || avsError) && (
        <div className="rd-box flex h-48 flex-1 flex-col items-center justify-center text-sm">
          <ErrorMessage error={state.error ?? avsError} />
        </div>
      )}

      {!avsError && !state.error && (
        <Table
          aria-label="List of operators registered for AVS"
          classNames={{
            base: 'h-full overflow-x-auto',
            table: 'h-full'
          }}
          layout="fixed"
          onSortChange={handleSort}
          removeWrapper
          sortDescriptor={state.sortDescriptor}
        >
          <TableHeader>
            <TableColumn
              allowsSorting
              className="text-foreground-active w-64 bg-transparent py-4 text-sm font-normal leading-5 data-[hover=true]:text-foreground-2 md:w-1/3"
              key="operator"
            >
              Operators
            </TableColumn>
            <TableColumn
              allowsSorting
              className="text-foreground-active w-32 bg-transparent py-4 text-end text-sm font-normal leading-5 data-[hover=true]:text-foreground-2 md:w-1/3"
              key="share"
            >
              <span className="inline-block">Share</span>
            </TableColumn>
            <TableColumn
              allowsSorting
              className="text-foreground-active w-32 bg-transparent py-4 text-end text-sm font-normal leading-5 data-[hover=true]:text-foreground-2 md:w-1/3"
              key="tvl"
            >
              TVL
            </TableColumn>
          </TableHeader>
          <TableBody>
            {searchParams.get('page') === '1' && renderPromotedOperators()}

            {(state.isTableLoading || isAVSLoading) &&
              [...new Array(10)].map((_, i) => (
                <TableRow className="border-t border-outline" key={i}>
                  <TableCell className="w-1/3 py-4 pe-8 ps-4">
                    <Skeleton className="h-4 rounded-md" />
                  </TableCell>
                  <TableCell className="w-1/3 py-4 pe-8 ps-4 text-end">
                    <Skeleton className="h-4 rounded-md" />
                  </TableCell>
                  <TableCell className="w-1/3 py-4 pe-8 ps-4">
                    <Skeleton className="h-8 rounded-md" />
                  </TableCell>
                </TableRow>
              ))}

            {!state.isTableLoading &&
              !isAVSLoading &&
              state.operators.map((op, i) => (
                <TableRow
                  className="cursor-pointer border-t border-outline transition-colors hover:bg-default"
                  key={`avs-operator-${i}`}
                  onClick={() => {
                    navigate(`/operators/${op.address}`, {
                      state: { operator: op }
                    });
                  }}
                >
                  <TableCell className="p-4">
                    <div className="flex items-center gap-x-3">
                      <span className="min-w-5">
                        {(state.page - 1) * 10 + i + 1}
                      </span>
                      <ThirdPartyLogo
                        className="size-8 min-w-8"
                        url={op.metadata?.logo}
                      />
                      <span className="truncate">
                        {op.metadata?.name || op.address}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="pe-8 text-end">
                    <div>
                      {tvl === 0
                        ? 'N/A'
                        : `${((op.strategiesTotal / tvl) * 100).toFixed(2)}%`}
                    </div>
                  </TableCell>
                  <TableCell className="pe-8 text-end">
                    <div>
                      {formatUSD(
                        op.strategiesTotal * state.currentRate,
                        compact
                      )}
                    </div>
                    <div className="text-xs text-foreground-2">
                      {formatETH(op.strategiesTotal, compact)}
                    </div>
                  </TableCell>
                </TableRow>
              ))}

            {!state.isTableLoading &&
              !isAVSLoading &&
              state.operators.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3}>
                    <div className="flex h-[40rem] flex-col items-center justify-center">
                      <span className="text-lg text-foreground-2">
                        No result found for {truncate(state.search ?? '')}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell hidden />
                  <TableCell hidden />
                </TableRow>
              )}

            {!state.isTableLoading &&
              !isAVSLoading &&
              state.operators.length > 0 &&
              [...Array(10 - state.operators.length)].map((_, i) => (
                <TableRow className="border-none" key={i}>
                  <TableCell className="h-[4rem] w-1/3"></TableCell>
                  <TableCell className="w-1/3"></TableCell>
                  <TableCell className="w-1/3"></TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      )}

      {!avsError &&
        !state.error &&
        state.totalPages !== undefined &&
        state.operators.length > 0 && (
          <ListPagination
            onChange={handlePageClick}
            page={state.page}
            total={state.totalPages}
          />
        )}
    </div>
  );
}

const truncate = str => {
  return str.length > 42 ? str.substring(0, 42) + '...' : str;
};
