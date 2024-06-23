import { Card, Input } from '@nextui-org/react';
import { SearchIcon } from '@nextui-org/shared-icons';
import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useMutativeReducer } from 'use-mutative';
import { useServices } from '../@services/ServiceContext';
import { reduceState } from '../shared/helpers';
import Pagination from '../shared/Pagination';
import { useTailwindBreakpoint } from '../shared/useTailwindBreakpoint';
import { formatDate, formatNumber } from '../utils';

const mockOperators = [
  {
    operator: {
      name: 'AltLayer',
      logo: 'https://mainnet-ethereum-avs-metadata.s3.amazonaws.com/markEigenDA.png'
    },
    share: 46,
    tvl: {
      eth: 34554567,
      usd: 34554567
    },
    joined: '2024-6-1 11:34:57.000000'
  },
  {
    operator: {
      name: 'AltLayer',
      logo: 'https://mainnet-ethereum-avs-metadata.s3.amazonaws.com/markEigenDA.png'
    },
    share: 46,
    tvl: {
      eth: 34554567,
      usd: 34554567
    },
    joined: '2024-6-10 11:34:57.000000'
  },
  {
    operator: {
      name: 'AltLayer',
      logo: 'https://mainnet-ethereum-avs-metadata.s3.amazonaws.com/markEigenDA.png'
    },
    share: 46,
    tvl: {
      eth: 34554567,
      usd: 34554567
    },
    joined: '2024-6-10 11:34:57.000000'
  }
];

export default function Operators({ avsAddress, totalTVL }) {
  const compact = !useTailwindBreakpoint('md');
  const { avsService } = useServices();
  const [searchParams, setSearchParams] = useSearchParams();
  const [state, dispatch] = useMutativeReducer(reduceState, {
    avsOperators: null,
    searchInput: ''
  });

  const fetchOperators = async pageIndex => {
    try {
      const data = await avsService.getAvsOperators(avsAddress, pageIndex - 1);
      dispatch({
        avsOperators: data.operators,
        totalPages: Math.ceil(data.totalCount / 10)
      });
    } catch {
      // TODO: handle error
    }
  };

  const onNext = () => {
    const currentPage = parseInt(searchParams.get('page'));
    if (currentPage + 1 <= state.totalPages) {
      setSearchParams({ page: currentPage + 1 });
      fetchOperators(currentPage + 1);
    }
  };

  const onPrevious = () => {
    const currentPage = parseInt(searchParams.get('page'));
    if (currentPage - 1 >= 1) {
      setSearchParams({ page: currentPage - 1 });
      fetchOperators(currentPage - 1);
    }
  };

  const onPageClick = page => {
    setSearchParams({ page });
    fetchOperators(page);
  };

  const filteredOperators =
    (state.avsOperators &&
      state.avsOperators
        .filter(operator =>
          operator.metadata.name
            .toLowerCase()
            .includes(state.searchInput.toLowerCase())
        )
        .sort(
          (a, b) =>
            parseFloat(b.strategiesTotal) - parseFloat(a.strategiesTotal)
        )) ||
    [];

  useEffect(() => {
    const page = searchParams.get('page');
    if (!page) {
      setSearchParams({ page: 1 }, { replace: true });
      fetchOperators(1);
    } else fetchOperators(searchParams.get(page));
  }, [searchParams]);

  const latestAggregatedOperators =
    (state.avsOperators &&
      [...state.avsOperators].sort(
        (a, b) => new Date(b.registeredAt) - new Date(a.registeredAt)
      )) ||
    [];

  if (state.avsOperators === null) {
    return null;
  }

  return (
    <div className="w-full flex md:flex-row flex-col items-start justify-between gap-4">
      <Card
        radius="md"
        className="bg-content1 border border-outline w-full space-y-4"
      >
        <div className="flex items-center justify-between p-4 ">
          <div className="font-light text-base text-foreground-1">
            All Operators
          </div>
          <div>
            <Input
              type="text"
              placeholder="Search by operator"
              radius="sm"
              value={state.searchInput}
              onChange={e => dispatch({ searchInput: e.target.value })}
              className="lg:w-64"
              variant="bordered"
              endContent={<SearchIcon className="size-4" />}
            />
          </div>
        </div>

        <div className="text-sm">
          <div className="flex flex-row gap-x-2 justify-between items-center p-4 text-foreground-1">
            <span className="basis-full">Operators</span>
            <span className="basis-1/4">Share</span>
            <span className="basis-1/3 text-end">TVL</span>
          </div>
          {filteredOperators &&
            filteredOperators.map((operator, i) => (
              <div
                key={`operator-item-${i}`}
                className={`border-t border-outline flex flex-row gap-x-2 justify-between items-center p-4 hover:bg-default`}
              >
                <div className="min-w-5">{i + 1}</div>
                <img
                  src={operator.metadata.logo}
                  className="size-5 rounded-full"
                />
                <span className="basis-full truncate">
                  {operator.metadata.name}
                </span>
                <span className="basis-1/3">
                  {(
                    (parseFloat(operator.strategiesTotal) / totalTVL) *
                    100
                  ).toFixed(2)}
                  %
                </span>
                <span className="basis-1/3 text-end">
                  <div>
                    {formatNumber(operator.strategiesTotal, compact)} ETH
                  </div>
                </span>
              </div>
            ))}
        </div>
        <Pagination
          totalPages={state.totalPages}
          currentPage={parseInt(searchParams.get('page'))}
          handleNext={onNext}
          handlePrevious={onPrevious}
          handlePageClick={onPageClick}
        />
      </Card>
      <div className="flex flex-col gap-4 justify-between items-end w-full">
        <Card
          radius="md"
          className="bg-content1 border border-outline w-full space-y-4"
        >
          <div className="font-light text-base text-foreground-1 p-4">
            Latest aggregated operators
          </div>
          <div className="text-sm">
            <div className="flex flex-row gap-x-2 justify-between items-center p-4 text-foreground-1">
              <span className="basis-1/2">Operators</span>
              <span className="basis-1/4">Joined time</span>
              <span className="basis-1/3 text-end">TVL</span>
            </div>
            {latestAggregatedOperators &&
              latestAggregatedOperators.slice(0, 5).map((operator, i) => (
                <div
                  key={`operator-item-${i}`}
                  className={`border-t border-outline flex flex-row gap-x-2 justify-between items-center p-4 hover:bg-default`}
                >
                  <div className="min-w-5">{i + 1}</div>
                  <img
                    src={operator.metadata.logo}
                    className="size-5 rounded-full"
                  />
                  <span className="basis-1/2 truncate">
                    {operator.metadata.name}
                  </span>
                  <span className="basis-1/3">
                    {formatDate(operator.registeredAt)}
                  </span>
                  <span className="basis-1/3 text-end">
                    <div>
                      {formatNumber(operator.strategiesTotal, compact)} ETH
                    </div>
                  </span>
                </div>
              ))}
          </div>
        </Card>
        <Card
          radius="md"
          className="bg-content1 border border-outline w-full space-y-4"
        >
          <div className="font-light text-base text-foreground-1 p-4">
            Inactive operators
          </div>
          <div className="text-sm">
            <div className="flex flex-row gap-x-2 justify-between items-center p-4 text-foreground-1">
              <span className="basis-1/2">Operators</span>
              <span className="basis-1/4">Joined time</span>
              <span className="basis-1/3 text-end">TVL</span>
            </div>
            {mockOperators.slice(0, 3).map((operator, i) => (
              <div
                key={`operator-item-${i}`}
                className={`border-t border-outline flex flex-row gap-x-2 justify-between items-center p-4 hover:bg-default`}
              >
                <div className="min-w-5">{i + 1}</div>
                <img
                  src={operator.operator.logo}
                  className="size-5 rounded-full"
                />
                <span className="basis-1/2 truncate">
                  {operator.operator.name}
                </span>
                <span className="basis-1/3">{formatDate(operator.joined)}</span>
                <span className="basis-1/3 text-end">
                  <div className="text-danger">
                    -{formatNumber(operator.tvl.eth, compact)}ETH
                  </div>
                  <div className="text-foreground-1 text-xs">
                    $ {formatNumber(operator.tvl.usd, compact)}
                  </div>
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
