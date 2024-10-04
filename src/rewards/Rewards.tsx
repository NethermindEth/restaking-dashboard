import React from 'react';
import {
  Input,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow
} from '@nextui-org/react';
import { useSearchParams } from 'react-router-dom';
import { useMutativeReducer } from 'use-mutative';
import { reduceState } from '../shared/helpers';

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

  return (
    <div className="flex h-full flex-col">
      <div className="font-display text-3xl font-medium text-foreground-1">
        Rewards
      </div>
      <div className="mb-4 mt-3 flex w-full flex-col items-end justify-between gap-4 lg:flex-row lg:gap-16">
        <div className="text-sm text-foreground-1 lg:w-2/3">
          Shortly rewards description
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
      </div>
    </div>
  );
}
