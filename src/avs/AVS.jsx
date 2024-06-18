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
      <div className="border-b font-display font-medium pb-4 mb-12 text-foreground-1 text-3xl uppercase">
        AVS
      </div>
      <div className="flex flex-col lg:flex-row gap-x-4">
        <AVSList onSelectionChange={handleSelectionChange} />
        {state.selectedAVS && <AVSDetails avs={state.selectedAVS} />}
      </div>
    </>
  );
}
