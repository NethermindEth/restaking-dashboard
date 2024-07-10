import {
  Skeleton,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow
} from '@nextui-org/react';
import { useCallback, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMutativeReducer } from 'use-mutative';
import { useServices } from '../@services/ServiceContext';
import { reduceState } from '../shared/helpers';
import Pagination from '../shared/Pagination';
import { useTailwindBreakpoint } from '../shared/useTailwindBreakpoint';
import { formatNumber } from '../utils';

const columns = [
  {
    key: 'AVS',
    label: 'AVS',
    align: 'start',
    width: '40%'
  },
  {
    key: 'Restakers',
    label: 'Restakers',
    align: 'start',
    width: '25%'
  },
  {
    key: 'Operators',
    label: 'Operators',
    align: 'center',
    width: '25%'
  },
  {
    key: 'TVL',
    label: 'TVL',
    align: 'end',
    width: '10%'
  }
];

export default function AVSList() {
  const { avsService } = useServices();
  const [searchParams, setSearchParams] = useSearchParams();
  const compact = !useTailwindBreakpoint('sm');
  const navigate = useNavigate();
  const [state, dispatch] = useMutativeReducer(reduceState, {
    isFetchingAvsData: false,
    error: null,
    rate: 1
  });

  const fetchAVS = useCallback(
    async pageNumber => {
      try {
        dispatch({ isFetchingAvsData: true, error: null });
        const response = await avsService.getAll(pageNumber);
        const data = response.results;

        for (let i = 0, count = data.length; i < count; i++) {
          let item = data[i];
          item.tvl = item.strategiesTotal;
          item.address = item.address.toLowerCase();
        }

        // Sort descending by TVL
        data.sort((i1, i2) => {
          if (i1.tvl < i2.tvl) {
            return 1;
          }

          if (i1.tvl > i2.tvl) {
            return -1;
          }

          return 0;
        });

        dispatch({
          avs: data,
          isFetchingAvsData: false,
          rate: response.rate,
          totalPages: Math.ceil(response.totalCount / 10)
        });
      } catch (error) {
        dispatch({
          error: 'Failed to fetch AVS data',
          isFetchingAvsData: false
        });
      }
    },
    [avsService, dispatch]
  );

  const handleNext = useCallback(() => {
    const currentPage = parseInt(searchParams.get('page') || '1');
    if (currentPage + 1 <= state.totalPages) {
      setSearchParams({ page: (currentPage + 1).toString() });
      fetchAVS(currentPage + 1);
    }
  }, [searchParams, state.totalPages, setSearchParams, fetchAVS]);

  const handlePrevious = useCallback(() => {
    const currentPage = parseInt(searchParams.get('page') || '1');
    if (currentPage - 1 >= 1) {
      setSearchParams({ page: (currentPage - 1).toString() });
      fetchAVS(currentPage - 1);
    }
  }, [searchParams, fetchAVS]);

  const handlePageClick = useCallback(
    page => {
      setSearchParams({ page: page.toString() });
      fetchAVS(page);
    },
    [setSearchParams, fetchAVS]
  );

  useEffect(() => {
    const page = searchParams.get('page');
    if (!page) {
      setSearchParams({ page: 1 }, { replace: true });
      fetchAVS(1);
    } else fetchAVS(searchParams.get('page'));
  }, [searchParams]);

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <div className="font-display font-medium text-foreground-1 text-3xl">
          AVS
        </div>
        <div className="font-display font-medium text-foreground-1 text-base">
          Actively Validated Services
        </div>
      </div>
      <Table
        removeWrapper
        className="bg-content1 border border-outline rounded-lg text-sm"
        bottomContent={
          <Pagination
            totalPages={state.totalPages}
            currentPage={parseInt(searchParams.get('page') || '1')}
            handleNext={handleNext}
            handlePrevious={handlePrevious}
            handlePageClick={handlePageClick}
          />
        }
      >
        <TableHeader columns={columns}>
          {column => (
            <TableColumn
              width={column.width}
              align={'end'}
              className="bg-transparent py-4 text-foreground-active text-sm font-normal leading-5"
              key={column.key}
            >
              {column.label}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody
          isLoading={state.isFetchingAvsData}
          loadingContent={<Spinner />}
          emptyContent={
            <span className="text-foreground-active">No AVS found.</span>
          }
        >
          {state.avs?.map((avs, i) => (
            <TableRow
              onClick={() =>
                navigate(`/avs/${avs.address}`, { state: { avs: avs } })
              }
              key={`avs-item-${i}`}
              className="cursor-pointer border-t border-outline hover:bg-default"
            >
              <TableCell className="p-4 flex gap-x-3">
                <span className="size-3">
                  {' '}
                  {(searchParams.get('page') - 1) * 10 + i + 1}
                </span>
                {avs.metadata?.logo ? (
                  <img
                    className="size-5 rounded-full "
                    src={avs.metadata?.logo}
                  />
                ) : (
                  <span class="material-symbols-outlined h-5 rounded-full text-lg text-yellow-300 min-w-5 flex justify-center items-center">
                    warning
                  </span>
                )}
                <span>{avs.metadata?.name ?? 'N/A'}</span>
              </TableCell>
              <TableCell>{formatNumber(avs.stakers, compact)}</TableCell>
              <TableCell>{formatNumber(avs.operators, compact)}</TableCell>
              <TableCell>
                <div>${formatNumber(avs.tvl * state.rate, compact)}</div>
                <div className="text-xs text-subtitle">
                  {formatNumber(avs.tvl, compact)} ETH
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

const AVSListSkeleton = () => {
  return (
    <div>
      {[...Array(10)].map((item, i) => (
        <div
          key={i}
          className="p-4 flex justify-between gap-4 md:gap-8 text-foreground-1 border-t border-outline w-full"
        >
          <div className="basis-1/2">
            <Skeleton className="h-6 rounded-md w-2/3 dark:bg-default" />
          </div>
          <div className="basis-1/3">
            <Skeleton className="h-6 rounded-md w-2/3 bg-default dark:bg-default" />
          </div>
          <div className="basis-1/4">
            <Skeleton className="h-6 rounded-md w-2/3 bg-default dark:bg-default" />
          </div>
          <div className="basis-1/3">
            <Skeleton className="h-6 rounded-md w-full bg-default dark:bg-default" />
          </div>
        </div>
      ))}
    </div>
  );
};
