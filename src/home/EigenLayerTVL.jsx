import EigenLayerTVLOvertimeChart from './charts/EigenLayerTVLOvertimeChart';
import ErrorMessage from '../shared/ErrorMessage';
import { Spinner } from '@nextui-org/react';

export default function EigenLayerTVL({ isFetching, tvl, error }) {
  if (isFetching) {
    return (
      <div className="rd-box flex h-[512px] w-full items-center justify-center p-4">
        <Spinner color="primary" size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rd-box flex h-[512px] w-full items-center justify-center p-4">
        <ErrorMessage message="Failed loading EigenLayer TVL" />
      </div>
    );
  }
  return <EigenLayerTVLOvertimeChart eigenLayerTVL={tvl} height={512} />;
}
