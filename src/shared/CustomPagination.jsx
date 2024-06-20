import React from 'react';

import { PaginationItemType, usePagination } from '@nextui-org/react';

const CustomPagination = ({
  totalPages,
  currentPage,
  onNext,
  onPrevious,
  onPageClick
}) => {
  const { activePage, range, setPage } = usePagination({
    total: totalPages,
    showControls: true,
    page: currentPage
  });

  return (
    <div className="flex border-t border-outline gap-x-2 justify-between items-center p-4 text-foreground-1 mt-austo">
      <span
        className={`cursor-pointer material-symbols-outlined ${activePage === 1 && 'text-disabled'}`}
        onClick={onPrevious}
      >
        arrow_back_ios
      </span>
      <div className="flex gap-x-2">
        {range
          .filter(
            r => r !== PaginationItemType.PREV && r !== PaginationItemType.NEXT
          )
          .map((page, i) => {
            if (page === PaginationItemType.DOTS) {
              return <span key={`dot-${i}`}>...</span>;
            }

            return (
              <span
                onClick={() => onPageClick(page)}
                key={`page-${page}`}
                aria-label={`page ${page}`}
                className={`${activePage == page ? 'text-foreground-2' : 'text-slate-500'} cursor-pointer`}
              >
                {page}
              </span>
            );
          })}
      </div>
      <div
        className={`cursor-pointer material-symbols-outlined ${activePage === totalPages && 'text-disabled'}`}
        onClick={onNext}
      >
        arrow_forward_ios
      </div>
    </div>
  );
};

export default CustomPagination;
