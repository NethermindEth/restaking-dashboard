import { handleServiceError, reduceState } from '../shared/helpers';
import EigenLayerTVL from './EigenLayerTVL';
import LRTDistribution from './LRTDistribution';
import OverviewStats from './OverviewStats';
import { useEffect } from 'react';
import { useMutativeReducer } from 'use-mutative';
import { useServices } from '../@services/ServiceContext';

export default function Home() {
  const { eigenlayerService } = useServices();
  const [state, dispatch] = useMutativeReducer(reduceState, {
    isFetchingEigenLayerTVL: true,
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
      <EigenLayerTVL
        eigenLayerTVL={state.eigenLayerTVL}
        eigenLayerTVLError={state.error}
        isFetchingEigenLayerTVL={state.isFetchingEigenLayerTVL}
      />
      <LRTDistribution />
    </div>
  );
}
