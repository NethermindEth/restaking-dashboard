import React, { useCallback } from 'react';
import {
  Input,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Tabs
} from '@nextui-org/react';
import { useSearchParams } from 'react-router-dom';
import { useMutativeReducer } from 'use-mutative';
import { reduceState } from '../shared/helpers';
import DistributedRewardPieChart from '../home/charts/DistributedRewardPieChart';
import ListPagination from '../shared/ListPagination';

const reward_leaderboard_data = [
  {
    address: "0xD4A7...286942e84b",
    totalAmount: "1,345,441 EL",
    addressType: "Operator",
    tokens: [
      {
        tokenName: "example",
        tokenImgUrl: "https://raw.githubusercontent.com/etherfi-protocol/etherfi-avs-operator/master/9_etherfi_nethermind.png",
      },
      {
        tokenName: "example",
        tokenImgUrl: "https://raw.githubusercontent.com/etherfi-protocol/etherfi-avs-operator/master/9_etherfi_nethermind.png",
      },
      {
        tokenName: "example",
        tokenImgUrl: "https://raw.githubusercontent.com/etherfi-protocol/etherfi-avs-operator/master/9_etherfi_nethermind.png",
      },
      {
        tokenName: "example",
        tokenImgUrl: "https://raw.githubusercontent.com/etherfi-protocol/etherfi-avs-operator/master/9_etherfi_nethermind.png",
      },
      {
        tokenName: "example",
        tokenImgUrl: "https://raw.githubusercontent.com/etherfi-protocol/etherfi-avs-operator/master/9_etherfi_nethermind.png",
      },
    ],
    unclaimed: 124,
  },
  {
    address: "0xD4A7...286942e84b",
    totalAmount: "1,345,441 EL",
    addressType: "Operator",
    tokens: [
      {
        tokenName: "example",
        tokenImgUrl: "https://raw.githubusercontent.com/etherfi-protocol/etherfi-avs-operator/master/9_etherfi_nethermind.png",
      },
      {
        tokenName: "example",
        tokenImgUrl: "https://raw.githubusercontent.com/etherfi-protocol/etherfi-avs-operator/master/9_etherfi_nethermind.png",
      },
      {
        tokenName: "example",
        tokenImgUrl: "https://raw.githubusercontent.com/etherfi-protocol/etherfi-avs-operator/master/9_etherfi_nethermind.png",
      },
      {
        tokenName: "example",
        tokenImgUrl: "https://raw.githubusercontent.com/etherfi-protocol/etherfi-avs-operator/master/9_etherfi_nethermind.png",
      },
      {
        tokenName: "example",
        tokenImgUrl: "https://raw.githubusercontent.com/etherfi-protocol/etherfi-avs-operator/master/9_etherfi_nethermind.png",
      },
    ],
    unclaimed: 124,
  },
  {
    address: "0xD4A7...286942e84b",
    totalAmount: "1,345,441 EL",
    addressType: "Operator",
    tokens: [
      {
        tokenName: "example",
        tokenImgUrl: "https://raw.githubusercontent.com/etherfi-protocol/etherfi-avs-operator/master/9_etherfi_nethermind.png",
      },
      {
        tokenName: "example",
        tokenImgUrl: "https://raw.githubusercontent.com/etherfi-protocol/etherfi-avs-operator/master/9_etherfi_nethermind.png",
      },
      {
        tokenName: "example",
        tokenImgUrl: "https://raw.githubusercontent.com/etherfi-protocol/etherfi-avs-operator/master/9_etherfi_nethermind.png",
      },
      {
        tokenName: "example",
        tokenImgUrl: "https://raw.githubusercontent.com/etherfi-protocol/etherfi-avs-operator/master/9_etherfi_nethermind.png",
      },
      {
        tokenName: "example",
        tokenImgUrl: "https://raw.githubusercontent.com/etherfi-protocol/etherfi-avs-operator/master/9_etherfi_nethermind.png",
      },
    ],
    unclaimed: 124,
  },
  {
    address: "0xD4A7...286942e84b",
    totalAmount: "1,345,441 EL",
    addressType: "Operator",
    tokens: [
      {
        tokenName: "example",
        tokenImgUrl: "https://raw.githubusercontent.com/etherfi-protocol/etherfi-avs-operator/master/9_etherfi_nethermind.png",
      },
      {
        tokenName: "example",
        tokenImgUrl: "https://raw.githubusercontent.com/etherfi-protocol/etherfi-avs-operator/master/9_etherfi_nethermind.png",
      },
      {
        tokenName: "example",
        tokenImgUrl: "https://raw.githubusercontent.com/etherfi-protocol/etherfi-avs-operator/master/9_etherfi_nethermind.png",
      },
      {
        tokenName: "example",
        tokenImgUrl: "https://raw.githubusercontent.com/etherfi-protocol/etherfi-avs-operator/master/9_etherfi_nethermind.png",
      },
      {
        tokenName: "example",
        tokenImgUrl: "https://raw.githubusercontent.com/etherfi-protocol/etherfi-avs-operator/master/9_etherfi_nethermind.png",
      },
    ],
    unclaimed: 124,
  },
  {
    address: "0xD4A7...286942e84b",
    totalAmount: "1,345,441 EL",
    addressType: "Operator",
    tokens: [
      {
        tokenName: "example",
        tokenImgUrl: "https://raw.githubusercontent.com/etherfi-protocol/etherfi-avs-operator/master/9_etherfi_nethermind.png",
      },
      {
        tokenName: "example",
        tokenImgUrl: "https://raw.githubusercontent.com/etherfi-protocol/etherfi-avs-operator/master/9_etherfi_nethermind.png",
      },
      {
        tokenName: "example",
        tokenImgUrl: "https://raw.githubusercontent.com/etherfi-protocol/etherfi-avs-operator/master/9_etherfi_nethermind.png",
      },
      {
        tokenName: "example",
        tokenImgUrl: "https://raw.githubusercontent.com/etherfi-protocol/etherfi-avs-operator/master/9_etherfi_nethermind.png",
      },
      {
        tokenName: "example",
        tokenImgUrl: "https://raw.githubusercontent.com/etherfi-protocol/etherfi-avs-operator/master/9_etherfi_nethermind.png",
      },
    ],
    unclaimed: 124,
  },
  {
    address: "0xD4A7...286942e84b",
    totalAmount: "1,345,441 EL",
    addressType: "Operator",
    tokens: [
      {
        tokenName: "example",
        tokenImgUrl: "https://raw.githubusercontent.com/etherfi-protocol/etherfi-avs-operator/master/9_etherfi_nethermind.png",
      },
      {
        tokenName: "example",
        tokenImgUrl: "https://raw.githubusercontent.com/etherfi-protocol/etherfi-avs-operator/master/9_etherfi_nethermind.png",
      },
      {
        tokenName: "example",
        tokenImgUrl: "https://raw.githubusercontent.com/etherfi-protocol/etherfi-avs-operator/master/9_etherfi_nethermind.png",
      },
      {
        tokenName: "example",
        tokenImgUrl: "https://raw.githubusercontent.com/etherfi-protocol/etherfi-avs-operator/master/9_etherfi_nethermind.png",
      },
      {
        tokenName: "example",
        tokenImgUrl: "https://raw.githubusercontent.com/etherfi-protocol/etherfi-avs-operator/master/9_etherfi_nethermind.png",
      },
    ],
    unclaimed: 124,
  },
  {
    address: "0xD4A7...286942e84b",
    totalAmount: "1,345,441 EL",
    addressType: "Operator",
    tokens: [
      {
        tokenName: "example",
        tokenImgUrl: "https://raw.githubusercontent.com/etherfi-protocol/etherfi-avs-operator/master/9_etherfi_nethermind.png",
      },
      {
        tokenName: "example",
        tokenImgUrl: "https://raw.githubusercontent.com/etherfi-protocol/etherfi-avs-operator/master/9_etherfi_nethermind.png",
      },
      {
        tokenName: "example",
        tokenImgUrl: "https://raw.githubusercontent.com/etherfi-protocol/etherfi-avs-operator/master/9_etherfi_nethermind.png",
      },
      {
        tokenName: "example",
        tokenImgUrl: "https://raw.githubusercontent.com/etherfi-protocol/etherfi-avs-operator/master/9_etherfi_nethermind.png",
      },
      {
        tokenName: "example",
        tokenImgUrl: "https://raw.githubusercontent.com/etherfi-protocol/etherfi-avs-operator/master/9_etherfi_nethermind.png",
      },
    ],
    unclaimed: 124,
  },
  {
    address: "0xD4A7...286942e84b",
    totalAmount: "1,345,441 EL",
    addressType: "Operator",
    tokens: [
      {
        tokenName: "example",
        tokenImgUrl: "https://raw.githubusercontent.com/etherfi-protocol/etherfi-avs-operator/master/9_etherfi_nethermind.png",
      },
      {
        tokenName: "example",
        tokenImgUrl: "https://raw.githubusercontent.com/etherfi-protocol/etherfi-avs-operator/master/9_etherfi_nethermind.png",
      },
      {
        tokenName: "example",
        tokenImgUrl: "https://raw.githubusercontent.com/etherfi-protocol/etherfi-avs-operator/master/9_etherfi_nethermind.png",
      },
      {
        tokenName: "example",
        tokenImgUrl: "https://raw.githubusercontent.com/etherfi-protocol/etherfi-avs-operator/master/9_etherfi_nethermind.png",
      },
      {
        tokenName: "example",
        tokenImgUrl: "https://raw.githubusercontent.com/etherfi-protocol/etherfi-avs-operator/master/9_etherfi_nethermind.png",
      },
    ],
    unclaimed: 124,
  },
]

export default function Rewards() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [state, dispatch] = useMutativeReducer(reduceState, {
    operators: [],
    promotedOperators: [],
    promotedOperatorsRate: 1,
    isFetchingData: false,
    searchTerm: searchParams.get('search'),
    error: null,
    rate: 1,
    searchTriggered: false,
    sortDescriptor: searchParams.get('sort')
      ? {
        column: searchParams.get('sort')?.replace('-', '') ?? 'tvl',
        direction: searchParams.get('sort')?.startsWith('-')
          ? 'descending'
          : 'ascending'
      }
      : { column: 'tvl', direction: 'descending' }
  });

  const handleSearch = () => {
    //TODO: Implement search
  };

  const columns = [
    {
      key: 'address',
      label: 'Address',
      className: 'w-64 md:1/5 ps-4'
    },
    {
      key: 'token_amount',
      label: 'Token amount',
      className: 'text-end w-36 md:w-1/5'
    },
    {
      key: 'address_type',
      label: 'Address type',
      className: 'text-end w-36 md:w-1/5'
    },
    {
      key: 'tokens',
      label: 'Tokens',
      className: 'text-end w-36 md:w-1/5'
    },
    {
      key: 'unclaimed',
      label: 'Unclaimed',
      className: 'text-end w-40 md:w-1/5'
    }
  ];

  const handlePageClick = useCallback(
    page => {
      setSearchParams({ page: page.toString() });
    },
    [setSearchParams]
  );

  return (
    <div className="flex h-full flex-col gap-4">

      <div div className="mt-3 mb-4 flex w-full flex-col items-end justify-between gap-4 lg:flex-row lg:gap-16" >
        <div className='flex lg:flex-col justify-between items-center lg:items-start w-full'>
          <h1 className="font-display text-3xl font-medium text-foreground-1 mb-1">
            Rewards
          </h1>

          <div className="text-sm text-foreground-1">
            Shortly rewards description
          </div>
        </div>
        <Input
          className="lg:w-96"
          classNames={{
            inputWrapper:
              'border-outline data-[hover=true]:border-foreground-1',
            input: 'placeholder:text-foreground-2'
          }}
          color="primary"
          endContent={
            <span className="material-symbols-outlined text-foreground-2">
              search
            </span>
          }
          onChange={handleSearch}
          placeholder="Search by address"
          radius="sm"
          type="text"
          value={state.searchTerm ?? ''}
          variant="bordered"
        />
      </div >

      <div className='grid grid-cols-3 border border-outline px-1 py-4 text-default-700 rounded-lg'>
        <div className='flex flex-col items-center'>
          <h3 className='text-default-2 text-sm'>
            Total rewards
          </h3>

          <p>
            34,554,567 EL
          </p>
        </div>

        <div className='flex flex-col items-center border-x border-x-outline'>
          <h3 className='text-default-2 text-sm'>
            Claimed rewards
          </h3>

          <p>
            26,554,567 EL
          </p>
        </div>


        <div className='flex flex-col items-center'>
          <h3 className='text-default-2 text-sm'>
            Nª of Rewards tokens
          </h3>

          <p>
            4
          </p>
        </div>


      </div>
      <div className='border border-outline px-4 pt-4 pb-6 text-default-700 rounded-lg'>
        <div className='flex items-center justify-between flex-wrap'>
          <div>
            <div className='flex items-center gap-1 mb-2'>
              <h2 className='text-default-700'>
                Distributed reward by token
              </h2>

              <span className="material-symbols-outlined text-xs" style={{
                fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 24",
              }}>
                info
              </span>
            </div>

            <p className='text-default-2'>
              1,479,349 ETH
            </p>

          </div>

          <div className="flex flex-col">
            <Tabs
              className="w-full"
              classNames={{
                cursor: 'rounded border border-outline shadow-none',
                panel: 'p-0',
                tab: 'h-fit px-2 py-1 text-xs min-w-[70px]',
                tabList: 'rd-box !overflow-x-scroll p-x py-1'
              }}
              radius="sm"
              size="lg"
            >
              <Tab key="1D" title="1D">
                1d content
              </Tab>
              <Tab key="7D" title="7D">
                7d content
              </Tab>
              <Tab key="1m" title="1m">
                1m content
              </Tab>

              <Tab key="3m" title="3m">
                3m content
              </Tab>

              <Tab key="All" title="All">
                all content
              </Tab>
            </Tabs>
          </div>
        </div>
        <DistributedRewardPieChart />

        <div className='text-default-700 text-xs flex items-center justify-between mt-2'>
          <div className='flex items-center gap-1 '>
            <div className='w-2 h-2 bg-[#C9A9E9] rounded-full'></div>
            <p>Native Token 24,881,994 ETH</p>
          </div>

          <div className='flex items-center gap-1 '>
            <div className='w-2 h-2 bg-[#9353D3] rounded-full'></div>
            <p>LST 10,334,122 ETH</p>
          </div>


          <div className='flex items-center gap-1 '>
            <div className='w-2 h-2 bg-[#481878] rounded-full'></div>
            <p>EIGEN Token 10,334,122 ETH</p>
          </div>


        </div>
      </div>

      <div className="rd-box flex flex-1 flex-col text-sm">
        <div className='flex items-center justify-between px-4 pt-6 pb-2'>
          <div className='flex items-center gap-1 mb-2'>
            <h2 className='text-default-700'>
              Rewards leaderboard
            </h2>

            <span className="material-symbols-outlined text-xs text-default-700" style={{
              fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 24",
            }}>
              info
            </span>
          </div>
          <div className="flex flex-col">
            <Tabs
              className="w-full"
              classNames={{
                cursor: 'rounded border border-outline shadow-none',
                panel: 'p-0',
                tab: 'h-fit px-2 py-1 text-xs min-w-[70px]',
                tabList: 'rd-box !overflow-x-scroll p-x py-1'
              }}
              radius="sm"
              size="lg"
            >
              <Tab key="Restakers" title="Restakers">

              </Tab>
              <Tab key="Operator" title="Operator">

              </Tab>
              <Tab key="ALL" title="ALL">

              </Tab>

            </Tabs>
          </div>
        </div>
        <Table
          aria-label="AVS list"
          classNames={{
            thead: '[&>tr:last-child]:hidden',
            sortIcon: "hidden"
          }}
          layout="fixed"
          onSortChange={e => dispatch({ sortDescriptor: e })}
          removeWrapper
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
          <TableBody
            emptyContent={
              <div className="flex flex-col items-center justify-center text-sm">
                <span className="text-lg text-foreground-2">
                  No AVS found for &quot;
                </span>
              </div>
            }
          >
            {
              reward_leaderboard_data.map((reward, i) => {
                return (
                  <TableRow
                    key={`reward-leaderboard ${i}`}
                    className="cursor-pointer border-t border-outline transition-colors hover:bg-default"
                  >
                    <TableCell className="p-4">
                      <div className="flex items-center gap-x-3">
                        <span className="truncate">
                          {reward.address}
                        </span>

                        <button>
                          <span class="material-symbols-outlined text-lg text-default-2" style={{
                            fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 24",
                          }}>
                            content_copy
                          </span>
                        </button>
                      </div>
                    </TableCell>

                    <TableCell className="pe-8 text-end">
                      {reward.totalAmount} EL
                    </TableCell>

                    <TableCell className="pe-8">
                      <div className='flex justify-end'>
                        <div className='bg-default-2 w-fit rounded p-1 text-content1 text-sm ms-2'>Operator</div>
                      </div>
                    </TableCell>

                    <TableCell className="pe-8 text-end">
                      <div className="flex items-center justify-end gap-6">
                        <p>
                          {reward.tokens[0].tokenName} + {reward.tokens.length}
                        </p>

                        <div className='flex items-center'>
                          {reward.tokens.map(token => {
                            return (
                              <div className='w-4 h-4 rounded-full border border-outline -ml-2'>
                                <img src={token.tokenImgUrl} alt="token" className='w-full h-full rounded-full object-cover' />
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="pe-8 text-end">
                      {reward.unclaimed}
                    </TableCell>
                  </TableRow>
                )
              })
            }



          </TableBody>
        </Table>
        {/* {state.totalPages > 1 && ( */}
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
        {/* )} */}
      </div>
    </div >
  );
}
