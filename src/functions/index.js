import fetchLRTDistribution from './lrt-indexer/index.js';

export const handler = async (event, context) => {
  await fetchLRTDistribution();
};

if (process.env.NM_APP_ENV === 'dev') {
  await handler();
  process.exit(0);
}
