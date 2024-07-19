import React from 'react';

import { PaginationItemType, usePagination } from '@nextui-org/react';

const Pagination = ({
  totalPages,
  currentPage,
  handleNext,
  handlePrevious,
  handlePageClick
}) => {
  const { activePage, range } = usePagination({
    total: totalPages,
    showControls: true,
    page: currentPage
  });

  return (
    <div className="mt-austo flex items-center justify-between gap-x-2 border-t border-outline p-4 text-foreground-1">
      <span
        className={`material-symbols-outlined cursor-pointer ${activePage === 1 && 'text-disabled'}`}
        onClick={handlePrevious}
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
                onClick={() => handlePageClick(page)}
                key={`page-${page}`}
                aria-label={`page ${page}`}
                className={`${activePage == page ? 'text-foreground-1' : 'text-slate-500'} cursor-pointer`}
              >
                {page}
              </span>
            );
          })}
      </div>
      <div
        className={`material-symbols-outlined cursor-pointer ${activePage === totalPages && 'text-disabled'}`}
        onClick={handleNext}
      >
        arrow_forward_ios
      </div>
    </div>
  );
};

export default Pagination;
