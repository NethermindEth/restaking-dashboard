import AVSDetails from './AVSDetails';
import AVSList from './AVSList';
import { reduceState } from '../shared/helpers';
import { useCallback } from 'react';
import { useMutativeReducer } from 'use-mutative';

export default function AVS() {
  const [state, dispatch] = useMutativeReducer(reduceState, {});
  const handleSelectionChange = useCallback(
    avs => {
      dispatch({ selectedAVS: avs });
    },
    [dispatch]
  );

  return (
    <>
      <div className="mb-12 border-b pb-4 font-display text-3xl font-medium uppercase text-foreground-1">
        AVS
      </div>
      <div className="flex flex-col gap-6 md:gap-4 lg:flex-row">
        <AVSList onSelectionChange={handleSelectionChange} />
        {state.selectedAVS && <AVSDetails avs={state.selectedAVS} />}
      </div>
    </>
  );
}
