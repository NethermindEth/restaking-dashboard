import React from 'react';
import Pagination from '../shared/Pagination';
import { useMutativeReducer } from 'use-mutative';
import { reduceState } from '../shared/helpers';

const data = [
  {
    address: '0xD4A7...286942e84b',
    share: '12%'
  },
  {
    address: '0xA1B2...6543210fed',
    share: '8%'
  },
  {
    address: '0xF3C4...789abc123d',
    share: '15%'
  },
  {
    address: '0xE5D6...1a2b3c4d5e',
    share: '10%'
  },
  {
    address: '0xB7C8...9e8f7g6h5i',
    share: '20%'
  },
  {
    address: '0xC9D0...4e3f2g1h0i',
    share: '5%'
  },
  {
    address: '0xF2E1...7a8b9c0d1e',
    share: '18%'
  },
  {
    address: '0xA3B4...2d3e4f5g6h',
    share: '12%'
  },
  {
    address: '0xA3B4...2d3e4f5g6h',
    share: '12%'
  },
  {
    address: '0xA3B4...2d3e4f5g6h',
    share: '12%'
  }
];
const RestakingLeaderboard = () => {
  const [state, dispatch] = useMutativeReducer(reduceState, {
    currentPage: 1,
    totalPages: 10
  });

  const onNext = () => {
    if (state.currentPage + 1 <= state.totalPages) {
      dispatch({ currentPage: state.currentPage + 1 });
    }
  };

  const onPrevious = () => {
    if (state.currentPage - 1 >= 1) {
      dispatch({ currentPage: state.currentPage - 1 });
    }
  };

  const onPageClick = page => {
    dispatch({ currentPage: page });
  };

  return (
    <div className="bg-content1 text-sm">
      <div className="flex flex-row gap-x-2 justify-between items-center p-4 text-foreground-1">
        <div className="min-w-5"></div>
        <span className="basis-full">Restakers address</span>
        <span className="basis-1/4">Share</span>
        <span className="basis-1/3 text-end">TVL</span>
      </div>

      {data.map((restaker, i) => (
        <div
          key={`operator-item-${i}`}
          className={`border-t border-outline flex flex-row gap-x-2 justify-between items-center p-4 cursor-pointer hover:bg-default`}
        >
          {' '}
          <div className="min-w-5"></div>
          <span className="basis-full truncate">{restaker.address}</span>
          <span className="basis-1/4">{restaker.share}</span>
          <span className="basis-1/3 text-end">
            <div>ETH TODO</div>
            <div className="text-foreground-1 text-xs">USD TODO</div>
          </span>
        </div>
      ))}
      <Pagination
        totalPages={state.totalPages}
        currentPage={state.currentPage}
        onNext={onNext}
        onPrevious={onPrevious}
        onPageClick={onPageClick}
      />
    </div>
  );
};

export default RestakingLeaderboard;
