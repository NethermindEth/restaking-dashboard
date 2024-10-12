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
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ErrorMessage from '../shared/ErrorMessage';
import ListPagination from '../shared/ListPagination';
// import ThirdPartyLogo from '../shared/ThirdPartyLogo';
import { useMutativeReducer } from 'use-mutative';
import { useServices } from '../@services/ServiceContext';
import { formatDate } from './helpers';
import { useTailwindBreakpoint } from '../shared/hooks/useTailwindBreakpoint';
import { Accordion, AccordionItem } from "@nextui-org/react";



const columns = [
  {
    key: 'rewardsTotal',
    label: 'Rewards received',
    className: 'w-64 md:w-2/3 ps-4'
  },
  {
    key: 'timestamp',
    label: 'Snapshot date',
    className: 'w-36 md:w-1/3'
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
  const currentPage = parseInt(searchParams.get('page') || '1')

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
              thead: '[&>tr:last-child]:hidden',
              sortIcon: "hidden",
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
                  <span className="material-symbols-outlined ml-1 text-sm align-middle text-default-2">
                    swap_vert
                  </span>
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
                      <Accordion itemClasses={{ trigger: "py-[10px] block" }} className='data-[open=true]:bg-white px-0'>
                        <AccordionItem key="1" aria-label="Accordion 1"
                          indicator={
                            ({ isOpen }) => (
                              <span className={`material-symbols-outlined ${isOpen ? "-rotate-90" : "rotate-90"} text-default-2 absolute right-4 top-[18px] transition-transform`}>
                                play_arrow
                              </span>
                            )}

                          className='py-0 data-[open=true]:bg-[#191C2C]' title={<div className='grid grid-cols-12 items-center relative'>
                            <div className="col-span-8 ps-4 pr-3">
                              <div>{formatUSD(reward.rewardsTotal * ethRate, compact)}</div>
                              <div className="text-xs text-foreground-2">
                                {formatETH(reward.rewardsTotal, compact)}
                              </div>
                            </div>
                            <div className='text-sm col-span-4 px-3'>
                              {formatDate(reward.timestamp)}
                            </div>
                          </div>}>
                          <div>
                            <RewardVisualizer reward={reward} />

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
                                  {console.log("rewards", state.rewards)}
                                  {console.log("rewards tokens", reward.tokens)}
                                  {reward.tokens.map((token, i) => {
                                    return (
                                      <TableRow className="border-t border-outline text-foreground-2" key={`token ${i}`}>
                                        <TableCell>
                                          <div className='flex items-center gap-2 text-foreground-2'>
                                            <div className='w-4 h-4 rounded-full'>

                                              <img
                                                alt={token.symbol ? token.symbol.toLowerCase() : ""}
                                                src={`/images/${token.symbol.toLowerCase()}.png`}
                                                className='w-full h-full rounded-full object-cover'
                                              />
                                            </div>


                                            <p>
                                              <span className='mr-2'>
                                                {token.name}
                                              </span>
                                              <span className="text-foreground">
                                                {token.symbol}
                                              </span>
                                            </p>
                                          </div>
                                        </TableCell>
                                        <TableCell className='text-center'>{token.amount}</TableCell>
                                        <TableCell className='text-right'>+0.00</TableCell>
                                      </TableRow>
                                    )
                                  })
                                  }

                                  {/* <TableRow className="border-t border-outline text-foreground-2" key={`reward ${i}`}>
                                    <TableCell className='hidden'></TableCell>
                                    <TableCell className='hidden'></TableCell>
                                    <TableCell align='right' colSpan={3}>
                                      <div className="w-full flex items-center justify-end">
                                        <button>View More</button>
                                      </div>
                                    </TableCell>
                                  </TableRow> */}
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
              <button className='absolute text-[#52525B] hover:bg-default rounded-full w-8 h-8 flex items-center justify-end top-1/2 -translate-y-1/2 left-4' disabled={currentPage === 1} onClick={() => { handlePageClick(currentPage - 1) }}>
                <span className="material-symbols-outlined">
                  arrow_back_ios
                </span>
              </button>

              <ListPagination
                onChange={handlePageClick}
                page={currentPage}
                total={state.totalPages}
              />
              <button className='absolute text-[#52525B] hover:bg-default rounded-full w-8 h-8 flex items-center justify-end top-1/2 -translate-y-1/2 right-4' disabled={!(currentPage < state.totalPages)} onClick={() => { handlePageClick(currentPage + 1) }}>
                <span className="material-symbols-outlined">
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

const RewardVisualizer = ({ reward }) => {
  const colors = ['#C9A9E9', '#AE7EDE', '#7828C8', '#FFCC80', '#FB8C00', '#EF6C00'];

  const totalAmount = useMemo(() => {
    return reward.tokens.reduce((sum, token) => +sum + +token.amount, 0);
  }, [reward.tokens]);

  const TokenPercentages = () => (
    <>
      {reward.tokens.map((token, i) => {
        const percentage = ((token.amount / totalAmount) * 100).toFixed(2);
        const bgColor = colors[i % colors.length];
        return (
          <div
            key={`percentage-${i}`}
            className='h-full'
            style={{ width: `${percentage}%`, backgroundColor: bgColor }}
          ></div>
        );
      })}
    </>
  );

  return (
    <div className='mb-4 px-4'>
      <div className='mb-3'>
        <div className='h-[9px] rounded flex w-full overflow-hidden relative'>
          <TokenPercentages />
        </div>
      </div>

      <div className='text-sm flex items-center justify-between'>
        {reward.tokens.map((token, i) => {
          const percentage = ((token.amount / totalAmount) * 100).toFixed(2);
          const bgColor = colors[i % colors.length] ;
          return (

            <div className='flex items-center gap-1' key={`token-${i}`}>
              <div className={`w-2 h-2 bg-[${bgColor}] rounded-full`}></div>
              <div>
                <p>
                  {token.name} <span className='text-[#7A86A5]'>({percentage}%)</span>
                </p>
              </div>
            </div>

          );
        })}
      </div>
    </div>
  );
};