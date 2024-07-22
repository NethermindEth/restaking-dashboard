import { Pagination as NextUIPagination } from '@nextui-org/react';

const Pagination = ({ totalPages, currentPage, handlePageClick }) => {
  return (
    <div className="flex items-center justify-center border-t border-outline p-4">
      <NextUIPagination
        classNames={{
          item: 'bg-transparent [&[data-hover=true]:not([data-active=true])]:bg-default',
          wrapper: 'gap-1'
        }}
        total={totalPages}
        color="default"
        page={currentPage}
        onChange={handlePageClick}
      />
    </div>
  );
};

export default Pagination;
