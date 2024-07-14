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
import { useCallback, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMutativeReducer } from 'use-mutative';
import { useServices } from '../@services/ServiceContext';
import { reduceState } from '../shared/helpers';
import Pagination from '../shared/Pagination';
import { useTailwindBreakpoint } from '../shared/useTailwindBreakpoint';
import { formatNumber } from '../utils';
import useDebounce from '../shared/hooks/useDebounce';

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
    avs: [],
    isFetchingAvsData: false,
    searchTerm: searchParams.get('search'),
    error: null,
    rate: 1,
    searchTriggered: false,
    sortDescriptor: null
  });

  const debouncedSearchTerm = useDebounce(state.searchTerm, 300);

  const fetchAVS = useCallback(
    async (pageNumber, search) => {
      try {
        dispatch({ isFetchingAvsData: true, error: null });
        const response = await avsService.getAll(pageNumber, search);

        dispatch({
          avs: response.results,
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
    }
  }, [searchParams, state.totalPages, setSearchParams, fetchAVS]);

  const handlePrevious = useCallback(() => {
    const currentPage = parseInt(searchParams.get('page') || '1');
    if (currentPage - 1 >= 1) {
      setSearchParams({ page: (currentPage - 1).toString() });
    }
  }, [searchParams, fetchAVS]);

  const handlePageClick = useCallback(
    page => {
      setSearchParams({ page: page.toString() });
    },
    [setSearchParams, fetchAVS]
  );

  const handleSearch = e => {
    dispatch({ searchTerm: e.target.value });
  };

  useEffect(() => {
    const page = searchParams.get('page');

    const params = {};
    if (page && debouncedSearchTerm) {
      params.page = state.searchTriggered ? 1 : page; // If user has searched something update the page number to 1
      params.search = debouncedSearchTerm;
    } else if (page) {
      params.page = page;
    } else if (debouncedSearchTerm) {
      params.page = 1;
      params.search = debouncedSearchTerm;
    } else {
      params.page = 1;
    }
    setSearchParams(params, { replace: true });
    fetchAVS(params.page, params.search);
    dispatch({ searchTriggered: false });
  }, [searchParams, debouncedSearchTerm]);

  useEffect(() => {
    dispatch({ searchTriggered: true });
  }, [debouncedSearchTerm]);

  useEffect(() => {
    console.log(state.sortDescriptor); // capture user's selection and recall the API with sorting params
  }, [state.sortDescriptor]);

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <div className="font-display font-medium text-foreground-1 text-3xl">
          AVS
        </div>
        <div className="flex flex-col lg:flex-row gap-4 w-full justify-between lg:items-center items-start mb-6">
          <div className="font-display font-medium text-foreground-1 text-base">
            Actively Validated Services
          </div>
          <Input
            value={state.searchTerm ?? ''}
            onChange={handleSearch}
            type="text"
            placeholder="Search by AVS"
            radius="sm"
            className="lg:w-96"
            variant="bordered"
            endContent={
              <span className="material-symbols-outlined">search</span>
            }
          />
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
        sortDescriptor={state.sortDescriptor}
        onSortChange={e => dispatch({ sortDescriptor: e })}
      >
        <TableHeader columns={columns}>
          {column => (
            <TableColumn
              allowsSorting
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
          emptyContent={
            <span className="text-foreground-active">No AVS found.</span>
          }
        >
          {state.isFetchingAvsData
            ? [...Array(10)].map((_, i) => (
                <TableRow key={i} className="border-t border-outline">
                  <TableCell className="p-4 basis-1/2">
                    <Skeleton className="h-5 rounded-md w-2/3 dark:bg-default" />
                  </TableCell>
                  <TableCell className="basis-1/3">
                    <Skeleton className="h-5 rounded-md w-2/3 bg-default dark:bg-default" />
                  </TableCell>
                  <TableCell className="basis-1/4">
                    <Skeleton className="h-5 rounded-md w-2/3 bg-default dark:bg-default" />
                  </TableCell>
                  <TableCell className="basis-1/3">
                    <Skeleton className="h-5 rounded-md w-full bg-default dark:bg-default" />
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
                  <TableCell className="p-4 flex gap-x-3">
                    <span className="size-3">
                      {(searchParams.get('page') - 1) * 10 + i + 1}
                    </span>
                    {avs.metadata?.logo ? (
                      <img
                        className="size-5 rounded-full"
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
                    <div>
                      ${formatNumber(avs.strategiesTotal * state.rate, compact)}
                    </div>
                    <div className="text-xs text-subtitle">
                      {formatNumber(avs.strategiesTotal, compact)} ETH
                    </div>
                  </TableCell>
                </TableRow>
              ))}
        </TableBody>
      </Table>
    </div>
  );
}
