import EigenLayerTVLOvertimeChart from './charts/EigenLayerTVLOvertimeChart';
import ErrorMessage from '../shared/ErrorMessage';
import { Spinner } from '@nextui-org/react';

export default function EigenLayerTVL({
  isFetchingEigenLayerTVL,
  eigenLayerTVL,
  eigenLayerTVLError
}) {
  if (isFetchingEigenLayerTVL) {
    return (
      <div className="rd-box flex h-[512px] w-full items-center justify-center p-4">
        <Spinner color="primary" size="lg" />
      </div>
    );
  }

  if (eigenLayerTVLError) {
    return (
      <div className="rd-box flex h-[512px] w-full items-center justify-center p-4">
        <ErrorMessage message="Failed loading EigenLayer TVL" />
      </div>
    );
  }
  return (
    <EigenLayerTVLOvertimeChart eigenLayerTVL={eigenLayerTVL} height={512} />
  );
}
