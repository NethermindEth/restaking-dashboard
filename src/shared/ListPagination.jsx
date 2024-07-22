import { Pagination } from '@nextui-org/react';

/** @param {{ onChange: ((page: number) => void), page: number, total: number }} props */
export default function ListPagination({ onChange, page, total }) {
  return (
    <div className="flex items-center justify-center border-t border-outline p-4">
      <Pagination
        classNames={{ item: styles, next: styles, prev: styles }}
        color="default"
        onChange={onChange}
        page={page}
        showControls={total >= 8}
        total={total}
        variant="light"
      />
    </div>
  );
}

const styles = '[&[data-hover=true]:not([data-active=true])]:bg-default';
