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
import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ErrorMessage from '../shared/ErrorMessage';
import ListPagination from '../shared/ListPagination';
import ThirdPartyLogo from '../shared/ThirdPartyLogo';
import { useMutativeReducer } from 'use-mutative';
import { useServices } from '../@services/ServiceContext';
import { formatDate } from './helpers';
import { useTailwindBreakpoint } from '../shared/hooks/useTailwindBreakpoint';
import { Accordion, AccordionItem } from "@nextui-org/react";



const columns = [
  {
    key: 'rewardsTotal',
    label: 'Rewards received',
    className: 'w-64 md:w-2/5 ps-4'
  },
  {
    key: 'timestamp',
    label: 'Snapshot date',
    className: 'w-36 md:w-1/5'
  }
];

const reward_sub_data = [
  {
    logoUrl: "/images/stakeETHLogo.png",
    name: "StakeWise Staked Ether",
    symbol: "osETH",
    totalAmount: "1,234.60",
    valueChange: "+ $ 0,45"
  },

  {
    logoUrl: "/images/stakeETHLogo.png",
    name: "StakeWise Staked Ether",
    symbol: "osETH",
    totalAmount: "1,234.60",
    valueChange: "+ $ 0,45"
  },
  {
    logoUrl: "/images/stakeETHLogo.png",
    name: "StakeWise Staked Ether",
    symbol: "osETH",
    totalAmount: "1,234.60",
    valueChange: "+ $ 0,45"
  }, {
    logoUrl: "/images/stakeETHLogo.png",
    name: "StakeWise Staked Ether",
    symbol: "osETH",
    totalAmount: "1,234.60",
    valueChange: "+ $ 0,45"
  }, {
    logoUrl: "/images/stakeETHLogo.png",
    name: "StakeWise Staked Ether",
    symbol: "osETH",
    totalAmount: "1,234.60",
    valueChange: "+ $ 0,45"
  }, {
    logoUrl: "/images/stakeETHLogo.png",
    name: "StakeWise Staked Ether",
    symbol: "osETH",
    totalAmount: "1,234.60",
    valueChange: "+ $ 0,45"
  }, {
    logoUrl: "/images/stakeETHLogo.png",
    name: "StakeWise Staked Ether",
    symbol: "osETH",
    totalAmount: "1,234.60",
    valueChange: "+ $ 0,45"
  },
]


const SeparateToken = ({ name, percentage, bgColor }) => {
  return (
    <div className='flex items-center gap-1'>
      <div className={`w-2 h-2 bg-[${bgColor}] rounded-full`}></div>
      <div>
        <p>
          {name} <span className='text-[#7A86A5]'>({percentage}%)</span>
        </p>
      </div>
    </div>

  )
}

const tooltipDateFormatter = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium'
});

// const subtable_data = []

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
        <div className="rd-box flex flex-1 flex-col text-sm p-4">
          <div className="w-full py-3">
            <span className="text-foreground-1 text-base">Rewards leaderboard</span>
          </div>
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
                    <TableCell className="p-0" colSpan={2}>
                      <Accordion itemClasses={{ trigger: "py-[10px] block" }} className='px-4 data-[open=true]:bg-white'>
                        <AccordionItem key="1" aria-label="Accordion 1"
                          indicator={
                            ({ isOpen }) => (
                              <span class={`material-symbols-outlined ${isOpen ? "-rotate-90" : "rotate-90"} text-default-2 absolute right-4 top-[18px] transition-transform`}>
                                play_arrow
                              </span>
                            )}

                          className='py-0 data-[open=true]:bg-[#191C2C]' title={<div className='grid grid-cols-12 items-center relative'>
                            <div className="col-span-8">
                              <div>{formatUSD(reward.rewardsTotal * ethRate, compact)}</div>
                              <div className="text-xs text-foreground-2">
                                {formatETH(reward.rewardsTotal, compact)}
                              </div>
                            </div>
                            <div className='text-sm col-span-4'>
                              {formatDate(reward.timestamp)}
                            </div>
                          </div>}>
                          <div>
                            <div className='mb-4'>
                              <div className='mb-3'>
                                <div className='h-[9px] rounded flex w-full overflow-hidden relative'>
                                  <div className={`h-full bg-[#C9A9E9]`} style={{width: "14%"}}></div>
                                  <div className={`h-full bg-[#AE7EDE]`} style={{width: "18%"}}></div>
                                  <div className={`h-full bg-[#7828C8]`} style={{width: "7%"}}></div>
                                  <div className={`h-full bg-[#FFCC80]`} style={{width: "6%"}}></div>
                                  <div className={`h-full bg-[#FB8C00]`} style={{width: "21%"}}></div>
                                  <div className={`h-full bg-[#EF6C00]`} style={{width: "34%"}}></div>
                                </div>
                              </div>

                              <div className='text-sm flex items-center justify-between'>
                                <SeparateToken name="Token 1" bgColor="#C9A9E9" percentage="14" />
                                <SeparateToken name="Token 2" bgColor="#AE7EDE" percentage="14" />
                                <SeparateToken name="Token 3" bgColor="#7828C8" percentage="14" />
                                <SeparateToken name="Token 4" bgColor="#FFCC80" percentage="14" />
                                <SeparateToken name="Token 5" bgColor="#FB8C00" percentage="14" />
                              </div>
                            </div>

                            <div>
                              <Table
                                aria-label="Rewards sub list text-foreground-2"
                                removeWrapper
                              >

                                <TableHeader className='py-4'>
                                  <TableColumn
                                    className={`bg-transparent border-t border-outline text-sm my-2 font-normal leading-5 text-foreground-2 transition-colors data-[hover=true]:text-foreground-2`}
                                  >
                                    Asset
                                  </TableColumn>

                                  <TableColumn
                                    className={`bg-transparent text-center border-t border-outline text-sm my-2 font-normal leading-5 text-foreground-2 transition-colors data-[hover=true]:text-foreground-2`}
                                  >
                                    <div className='border-x border-x-outline w-full'>
                                      Token Amount
                                    </div>
                                  </TableColumn>

                                  <TableColumn
                                    className={`bg-transparent text-right border-t border-outline text-sm my-2 font-normal leading-5 text-foreground-2 transition-colors data-[hover=true]:text-foreground-2`}
                                  >
                                    Value
                                  </TableColumn>
                                </TableHeader>

                                <TableBody>
                                  {reward_sub_data.map((reward, i) => {
                                    return (
                                      <TableRow className="border-t border-outline text-foreground-2" key={`reward ${i}`}>
                                        <TableCell>
                                          <div className='flex items-center gap-2 text-foreground-2'>
                                            <div>
                                              <img
                                                alt="stake ETH"
                                                src={reward.logoUrl}
                                              />
                                            </div>


                                            <p>
                                              <span className='mr-2'>
                                                {reward.name}
                                              </span>
                                              <span className="text-foreground">
                                                {reward.symbol}
                                              </span>
                                            </p>
                                          </div>
                                        </TableCell>
                                        <TableCell className='text-center'>{reward.totalAmount}</TableCell>
                                        <TableCell className='text-right'>{reward.valueChange}</TableCell>
                                      </TableRow>
                                    )
                                  })
                                  }

                                  <TableRow className="border-t border-outline text-foreground-2" key={`reward ${i}`}>
                                    <TableCell className='hidden'></TableCell>
                                    <TableCell className='hidden'></TableCell>
                                    <TableCell align='right' colSpan={3}>
                                      <div className="w-full flex items-center justify-end">
                                        <button>View More</button>
                                      </div>
                                    </TableCell>
                                  </TableRow>
                                </TableBody>

                              </Table>
                            </div>

                          </div>
                        </AccordionItem>
                      </Accordion>

                    </TableCell>

                    <TableCell className='hidden' />
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
            <div className='w-full relative'>
              <button className='absolute text-[#52525B] hover:bg-default rounded-full w-8 h-8 flex items-center justify-end top-1/2 -translate-y-1/2 left-4'>
                <span class="material-symbols-outlined">
                  arrow_back_ios
                </span>
              </button>

              <ListPagination
                onChange={handlePageClick}
                page={parseInt(searchParams.get('page') || '1')}
                total={state.totalPages}
              />
              <button className='absolute text-[#52525B] hover:bg-default rounded-full w-8 h-8 flex items-center justify-end top-1/2 -translate-y-1/2 right-4'>
                <span class="material-symbols-outlined">
                  arrow_forward_ios
                </span>
              </button>

            </div>
          )}
        </div>
      )}
    </div>
  );
}
