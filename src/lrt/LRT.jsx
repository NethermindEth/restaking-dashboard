import LRTDistribution from './LRTDistribution';
import { reduceState } from '../shared/helpers';
import { useEffect } from 'react';
import { useMutativeReducer } from 'use-mutative';
import { useServices } from '../@services/ServiceContext';

export default function LRT() {
  const { lrtService } = useServices();
  const [state, dispatch] = useMutativeReducer(reduceState, {});

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await lrtService.getAll();
        dispatch({ lrtData: data });
      } catch {
        // TODO: handle error
      }
    }

    // TODO: loading indicators

    fetchData();
  }, [dispatch, lrtService]);

  return (
    <>
      <div className="font-bold font-display pb-12 uppercase">
        LRT Distribution
      </div>
      {state.lrtData && <LRTDistribution data={state.lrtData} height={512} />}
    </>
  );
}
