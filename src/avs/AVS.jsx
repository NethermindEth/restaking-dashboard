import AVSDetails from './AVSDetails';
import AVSList from './AVSList';
import { reduceState } from '../shared/helpers';
import { useCallback, useEffect } from 'react';
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
      <div className="border-b font-bold font-display pb-4 mb-12 text-2xl uppercase">
        AVS
      </div>
      <div className="flex flex-col lg:flex-row gap-6 md:gap-4">
        <AVSList onSelectionChange={handleSelectionChange} />
        {state.selectedAVS && <AVSDetails avs={state.selectedAVS} />}
      </div>
    </>
  );
}
