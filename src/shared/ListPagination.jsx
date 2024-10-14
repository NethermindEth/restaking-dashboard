import { Pagination } from '@nextui-org/react';

/** @param {{ onChange: ((page: number) => void), page: number, total: number }} props */
export default function ListPagination({ onChange, page, total, showControls }) {
  return (
    <div className="flex items-center justify-center border-t border-outline p-4">
      <Pagination
        classNames={{
          cursor: 'text-foreground-1',
          item: styles,
          next: styles,
          prev: styles
        }}
        color="default"
        onChange={onChange}
        page={page}
        showControls={showControls === false ? false : total >= 8}
        total={total}
        variant="light"
      />
    </div>
  );
}

const styles =
  '[&[data-hover=true]:not([data-active=true])]:bg-default text-foreground-2';
