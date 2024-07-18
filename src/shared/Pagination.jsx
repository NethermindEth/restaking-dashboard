import { Button, Pagination as NextUIPagination } from '@nextui-org/react';

const Pagination = ({
  totalPages,
  currentPage,
  handleNext,
  handlePrevious,
  handlePageClick
}) => {
  return (
    <div className="flex border-t border-outline justify-between items-center p-4">
      <Button
        className={`bg-transparent ${currentPage === 1 && 'text-disabled'}`}
        onPress={handlePrevious}
        isDisabled={currentPage === 1}
        isIconOnly
      >
        <span className="material-symbols-outlined">arrow_back_ios</span>
      </Button>

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

      <Button
        className={`bg-transparent ${currentPage === totalPages && 'text-disabled'}`}
        onPress={handleNext}
        isDisabled={currentPage === totalPages}
        isIconOnly
      >
        <span className="material-symbols-outlined">arrow_forward_ios</span>
      </Button>
    </div>
  );
};

export default Pagination;
