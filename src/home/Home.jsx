import { handleServiceError, reduceState } from '../shared/helpers';
import OverviewStats from './OverviewStats';
import { useEffect } from 'react';
import { useMutativeReducer } from 'use-mutative';
import { useServices } from '../@services/ServiceContext';

export default function Home() {
  const { eigenlayerService } = useServices();
  const [state, dispatch] = useMutativeReducer(reduceState, {
    isFetchingEigenlayerTVL: false,
    eigenlayerTVL: [],
    error: null
  });

  useEffect(() => {
    async function fetchEigenlayerTVL() {
      dispatch({ isFetchingEigenlayerTVL: true });

      try {
        const results = await eigenlayerService.getEigenLayerTVLOvertime();
        dispatch({
          eigenlayerTVL: results,
          isFetchingEigenlayerTVL: false
        });
      } catch (e) {
        dispatch({
          isFetchingEigenlayerTVL: false,
          error: handleServiceError(e)
        });
      }
    }

    fetchEigenlayerTVL();
  }, [dispatch, eigenlayerService]);

  return (
    <div className="flex flex-wrap gap-4">
      <OverviewStats
        eigenlayerTVL={state.eigenlayerTVL}
        eigenlayerTVLError={state.error}
        isFetchingEigenlayerTVL={state.isFetchingEigenlayerTVL}
      />
      <div className="rd-box min-h-44 basis-full"></div>
      <div className="rd-box min-h-44 basis-full"></div>
    </div>
  );
}
