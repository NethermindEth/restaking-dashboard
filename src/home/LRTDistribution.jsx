import { handleServiceError, reduceState } from '../shared/helpers';
import { Progress, Spinner } from '@nextui-org/react';
import ErrorMessage from '../shared/ErrorMessage';
import { formatETH } from '../shared/formatters';
import LRTDistributionPieChart from './charts/LRTDistributionPieChart';
import { ParentSize } from '@visx/responsive';
import ThirdPartyLogo from '../shared/ThirdPartyLogo';
import { useEffect } from 'react';
import { useMutativeReducer } from 'use-mutative';
import { useServices } from '../@services/ServiceContext';

export default function LRTDistribution() {
  const { lrtService } = useServices();
  const [state, dispatch] = useMutativeReducer(reduceState, {
    isFetchingData: false,
    lrtDistribution: [],
    lrtTVL: 0,
    rate: 1,
    error: null
  });

  useEffect(() => {
    const fetchLRTData = async () => {
      try {
        dispatch({ isFetchingData: true });
        const results = await lrtService.getLRTDistribution();

        const lrtDistribution = [];
        let lrtTVL = 0;

        Object.keys(results.protocols).forEach(p => {
          const lrt = {
            ...lrtMapping[p]
          };
          lrt.tvl = results.protocols[p];
          lrtTVL += results.protocols[p];
          lrtDistribution.push(lrt);
        });

        dispatch({
          lrtDistribution: lrtDistribution
            .sort((a, b) => b.tvl - a.tvl)
            .filter(lrt => (lrt.tvl / lrtTVL) * 100 > 1), // Filter and display only LRTs that have more than 1% share
          lrtTVL,
          rate: results.rate,
          isFetchingData: false
        });
      } catch (e) {
        dispatch({
          error: handleServiceError(e),
          isFetchingData: false
        });
      }
    };

    fetchLRTData();
  }, [dispatch, lrtService]);

  if (state.isFetchingData) {
    return (
      <div className="rd-box flex h-96 basis-full flex-col items-center justify-center gap-y-4 p-4">
        <Spinner color="primary" size="lg" />
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="rd-box flex h-96 basis-full flex-col items-center justify-center gap-y-4 p-4">
        <ErrorMessage message="Failed loading LRT distribution" />
      </div>
    );
  }

  return (
    <div className="rd-box flex min-h-44 basis-full flex-col gap-y-4 p-4">
      <div className="text-foreground-1">LRT Distribution</div>
      <div className="flex flex-col gap-10 lg:flex-row lg:gap-16">
        <div className="flex w-full basis-3/4 flex-col gap-y-4">
          {state.lrtDistribution.map((lrt, i) => {
            return (
              <LRTShare
                key={`lrt-distribution-item-${i}`}
                label={lrt.name}
                logo={lrt.logo}
                tvl={lrt.tvl}
                value={(lrt.tvl / state.lrtTVL) * 100}
              />
            );
          })}
        </div>
        <div className="w-full basis-1/4">
          <ParentSize>
            {parent => (
              <LRTDistributionPieChart
                ethRate={state.rate}
                lrtDistribution={state.lrtDistribution}
                lrtTVL={state.lrtTVL}
                parent={parent}
              />
            )}
          </ParentSize>
        </div>
      </div>
    </div>
  );
}

function LRTShare({ label, logo, tvl, value }) {
  return (
    <Progress
      classNames={{
        track: 'border border-default bg-outline',
        indicator: 'bg-foreground-2',
        label: 'text-sm font-normal text-foreground-1',
        value: 'text-sm font-normal text-foreground'
      }}
      formatOptions={{
        style: 'percent',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }}
      label={
        <div className="flex items-center gap-x-2">
          <ThirdPartyLogo className="size-5 min-w-5" url={logo} />
          {label}
        </div>
      }
      radius="sm"
      showValueLabel={true}
      value={value}
      valueLabel={
        <div className="flex items-center gap-x-2">
          <span>{value.toFixed(1)}%</span>
          <span className="text-foreground-1">{formatETH(tvl)}</span>
        </div>
      }
    />
  );
}

const lrtMapping = {
  bedrock: {
    name: 'Bedrock',
    logo: new URL('/bedrock.jpg', import.meta.url).href
  },
  eigenpie: {
    name: 'Eigenpie',
    logo: new URL('/eigenpie.jpg', import.meta.url).href
  },
  etherfi: {
    name: 'Ether.fi',
    logo: new URL('/etherfi.jpg', import.meta.url).href
  },
  renzo: {
    name: 'Renzo',
    logo: new URL('/renzo.svg', import.meta.url).href
  },
  euclid: {
    name: 'Euclid',
    logo: new URL('/euclid.jpg', import.meta.url).href
  },
  inception: {
    name: 'Inception',
    logo: new URL('/inception.png', import.meta.url).href
  },
  kelp: {
    name: 'Kelp',
    logo: new URL('/kelp.jpg', import.meta.url).href
  },
  prime: {
    name: 'Prime',
    logo: new URL('/prime.png', import.meta.url).href
  },
  puffer: {
    name: 'Puffer',
    logo: new URL('/puffer.jpg', import.meta.url).href
  },
  swell: {
    name: 'Swell',
    logo: new URL('/swell.jpg', import.meta.url).href
  }
};
