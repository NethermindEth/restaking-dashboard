import { createContext, useContext } from 'react';
import AVSService from './AVSService';
import LRTService from './LRTService';

export const ServiceContext = createContext();

export const useServices = () => useContext(ServiceContext);

export function ServiceProvider({ children }) {
  return (
    <ServiceContext.Provider value={services}>
      {children}
    </ServiceContext.Provider>
  );
}

const services = {
  avsService: new AVSService(),
  lrtService: new LRTService()
};