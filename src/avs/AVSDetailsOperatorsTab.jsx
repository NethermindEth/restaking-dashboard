import { formatETH, formatUSD } from '../shared/formatters';
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
import OperatorsTabLineChart from './charts/OperatorsTabLineChart';
import Pagination from '../shared/Pagination';
import { ParentSize } from '@visx/responsive';
import { reduceState } from '../shared/helpers';
import useDebouncedSearch from '../shared/hooks/useDebouncedSearch';
import { useMutativeReducer } from 'use-mutative';
import { useServices } from '../@services/ServiceContext';
import { useTailwindBreakpoint } from '../shared/useTailwindBreakpoint';

export default function AVSDetailsOperatorsTab({ operators, totalTokens }) {
  const { address } = useParams();
  const [state, dispatch] = useMutativeReducer(reduceState, {
    points: undefined,
    isChartLoading: true
  });

  const { avsService } = useServices();

  useEffect(() => {
    (async () => {
      dispatch({ isChartLoading: true });

      const response = await avsService.getAVSOperatorsOvertime(address);
      dispatch({ points: response, isChartLoading: false });
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
      {state.isChartLoading ? (
        <div className="flex h-[390px] w-full items-center justify-center rounded-lg border border-outline bg-content1 p-4">
          <Spinner color="primary" size="lg" />
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
            tvl={totalTokens.lst + totalTokens.eth}
          />
        </div>
      </div>
    </>
  );
}

function AVSOperatorsList({ address, tvl }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [state, dispatch] = useMutativeReducer(reduceState, {
    currentRate: 1,
    operators: [],
    isError: true,
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

        const response = await avsService.getAVSOperators(
          address,
          state.page,
          debouncedSearch,
          state.sort,
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
            isError: true,
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
    setSearchParams(params);
    dispatch({ updateSeachParams: false });
  }, [
    dispatch,
    state.updateSearchParams,
    setSearchParams,
    state.page,
    state.search,
    state.sort
  ]);

  const handleSort = useCallback(
    e => {
      let sort = e.column;
      // share is basically just tvl, backend has no support for share
      if (sort === 'share') {
        sort = 'tvl';
      }

      if (e.direction === 'descending') {
        sort = '-' + sort;
      }
      dispatch({ sortDescriptor: e, sort });
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

  // increment can be both negative and positive
  const handleArrowClick = useCallback(
    (page, increment) => {
      dispatch({ page: page + increment });
    },
    [dispatch]
  );

  return (
    <div className="rounded-lg border border-outline bg-content1 text-sm">
      <div className="flex flex-col justify-between gap-y-4 p-4 lg:flex-row lg:items-center">
        <div className="text-medium text-foreground-1">All operators</div>
        <Input
          className="w-full lg:w-[40%]"
          classNames={{
            inputWrapper:
              'border border-outline data-[hover=true]:border-foreground-1',
            input: 'placeholder:text-foreground-2'
          }}
          endContent={<span className="material-symbols-outlined">search</span>}
          onChange={handleInputChange}
          placeholder="Search by address/name with 3 characters or more..."
          radius="sm"
          type="text"
          value={state.search ?? ''}
          variant="bordered"
        />
      </div>

      <Table
        aria-label="List of operators registered for AVS"
        className="overflow-x-scroll"
        classNames={{
          wrapper: 'rounded-lg border border-outline px-0',
          th: 'bg-transparent px-4 text-sm text-foreground'
        }}
        layout="fixed"
        removeWrapper
        sortDescriptor={state.sortDescriptor}
        onSortChange={handleSort}
      >
        <TableHeader>
          <TableColumn
            allowsSorting
            className="w-64 bg-transparent py-4 text-sm font-normal leading-5 text-foreground-active data-[hover=true]:text-foreground-2 md:w-1/3"
            key="operator"
          >
            Operators
          </TableColumn>
          <TableColumn
            allowsSorting
            className="w-32 bg-transparent py-4 text-center text-sm font-normal leading-5 text-foreground-active data-[hover=true]:text-foreground-2 md:w-1/3"
            key="share"
          >
            Share
          </TableColumn>
          <TableColumn
            allowsSorting
            className="w-32 bg-transparent py-4 text-end text-sm font-normal leading-5 text-foreground-active data-[hover=true]:text-foreground-2 md:w-1/3"
            key="tvl"
          >
            TVL
          </TableColumn>
        </TableHeader>
        <TableBody
          emptyContent={
            <div className="flex h-[33rem] flex-col items-center justify-center">
              <span className="text-lg text-foreground-2">
                No result found for {truncate(state.search ?? '')}
              </span>
            </div>
          }
        >
          {state.isTableLoading &&
            [...new Array(10)].map((_, i) => (
              <TableRow className="border-t border-outline" key={i}>
                <TableCell>
                  <Skeleton className="h-4 w-4/5 rounded-md" />
                </TableCell>
                <TableCell>
                  <div className="flex justify-center">
                    <Skeleton className="h-4 w-full rounded-md" />
                  </div>
                </TableCell>
                <TableCell className="flex justify-end">
                  <Skeleton className="h-9 w-4/5 rounded-md" />
                </TableCell>
              </TableRow>
            ))}

          {!state.isTableLoading &&
            state.operators.map((op, i) => (
              <TableRow
                className="cursor-pointer border-t border-outline hover:bg-default"
                key={`avs-operator-${i}`}
                onClick={() => {
                  navigate(`/operators/${op.address}`, {
                    state: { operator: op }
                  });
                }}
              >
                <TableCell className="pl-4">
                  <div className="flex gap-x-2">
                    <span>{(state.page - 1) * 10 + i + 1}</span>
                    {op.metadata?.logo ? (
                      <img
                        className="size-5 rounded-full bg-foreground-2"
                        src={op.metadata?.logo}
                      />
                    ) : (
                      <span className="material-symbols-outlined flex h-5 min-w-5 items-center justify-center rounded-full text-lg text-yellow-300">
                        warning
                      </span>
                    )}{' '}
                    <span className="truncate">
                      {op.metadata?.name ?? 'N/A'}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex justify-center">
                    {((op.strategiesTotal / tvl) * 100).toFixed(2)}%
                  </div>
                </TableCell>
                <TableCell className="flex justify-end pr-4">
                  <div className="flex flex-col text-end">
                    <span>
                      {formatUSD(
                        op.strategiesTotal * state.currentRate,
                        compact
                      )}
                    </span>
                    <span className="text-xs text-foreground-2">
                      {formatETH(op.strategiesTotal, compact)}
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            ))}

          {!state.isTableLoading &&
            state.operators.length > 0 &&
            [...Array(10 - state.operators.length)].map((_, i) => (
              <TableRow className="border-none" key={i}>
                <TableCell className="h-[3.25rem] w-1/3"></TableCell>
                <TableCell className="w-1/3"></TableCell>
                <TableCell className="w-1/3"></TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>

      {state.totalPages !== undefined && state.operators.length > 0 && (
        <Pagination
          currentPage={state.page}
          handleNext={() => handleArrowClick(state.page, 1)}
          handlePageClick={page => handlePageClick(page)}
          handlePrevious={() => handleArrowClick(state.page, -1)}
          totalPages={state.totalPages}
        />
      )}
    </div>
  );
}

const truncate = str => {
  return str.length > 42 ? str.substring(0, 42) + '...' : str;
};
