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
    <div className="flex border-t border-outline gap-x-2 justify-between items-center p-4 text-foreground-1 mt-austo">
      <button
        className={`material-symbols-outlined ${activePage === 1 && 'text-disabled'} disabled:cursor-not-allowed`}
        onClick={handlePrevious}
        disabled={currentPage === 1}
      >
        arrow_back_ios
      </button>
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
              <button
                onClick={() => handlePageClick(page)}
                key={`page-${page}`}
                aria-label={`page ${page}`}
                className={`${activePage == page ? 'text-foreground-1' : 'text-slate-500'}`}
              >
                {page}
              </button>
            );
          })}
      </div>
      <button
        className={`material-symbols-outlined ${activePage === totalPages && 'text-disabled'} disabled:cursor-not-allowed`}
        onClick={handleNext}
        disabled={currentPage === totalPages}
      >
        arrow_forward_ios
      </button>
    </div>
  );
};

export default Pagination;
