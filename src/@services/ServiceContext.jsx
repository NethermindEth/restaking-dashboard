import { createContext, useContext, useEffect } from 'react';
import AVSService from './AVSService';
import EigenLayerService from './EigenLayerService';
import LRTService from './LRTService';
import OperatorService from './OperatorService';
import RestakingDashboardService from './RestakingDashboardService';
import SubscriptionService from './SubscriptionService';
import { useSession } from '@clerk/clerk-react';

export const ServiceContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useServices = () => useContext(ServiceContext);

export function ServiceProvider({ children }) {
  const { session } = useSession();

  useEffect(() => {
    context.session = session;
  }, [session]);

  return (
    <ServiceContext.Provider value={services}>
      {children}
    </ServiceContext.Provider>
  );
}

const context = {};
const services = {
  avsService: new AVSService(context),
  lrtService: new LRTService(context),
  operatorService: new OperatorService(context),
  eigenlayerService: new EigenLayerService(context),
  rdService: new RestakingDashboardService(context),
  subscriptionService: new SubscriptionService(context)
};
