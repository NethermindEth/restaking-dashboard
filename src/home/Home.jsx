import { handleServiceError, reduceState } from '../shared/helpers';
import OverviewStats from './OverviewStats';
import { useEffect } from 'react';
import { useMutativeReducer } from 'use-mutative';
import { useServices } from '../@services/ServiceContext';

export default function Home() {
  const { eigenlayerService } = useServices();
  const [state, dispatch] = useMutativeReducer(reduceState, {
    isFetchingEigenLayerTVL: false,
    eigenLayerTVL: [],
    error: null
  });

  useEffect(() => {
    async function fetchEigenlayerTVL() {
      dispatch({ isFetchingEigenLayerTVL: true });

      try {
        const results = await eigenlayerService.getEigenLayerTVLOvertime();
        dispatch({
          eigenLayerTVL: results,
          isFetchingEigenLayerTVL: false
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
        eigenLayerTVL={state.eigenLayerTVL}
        eigenLayerTVLError={state.error}
        isFetchingEigenlayerTVL={state.isFetchingEigenLayerTVL}
      />
      <div className="rd-box min-h-44 basis-full"></div>
      <div className="rd-box min-h-44 basis-full"></div>
    </div>
  );
}
