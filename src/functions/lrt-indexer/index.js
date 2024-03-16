import { ethProvider } from './ethProvider.js';
import fetchEtherfi from './protocols/etherfi.js';
import fetchKelp from './protocols/kelp.js';
import fetchPuffer from './protocols/puffer.js';
import fetchRenzo from './protocols/renzo.js';
import logger from '../shared/logger.js';
import { lrtStore } from './lrtStore.js';

export default async function () {
  const context = {
    ethProvider,
    lrtStore
  };
  const timestamp = Date.now();
  const tasks = {
    renzo: fetchRenzo(context),
    kelp: fetchKelp(context),
    etherfi: fetchEtherfi(context),
    puffer: fetchPuffer(context)
  };
  const results = await Promise.allSettled(Object.values(tasks));
  const keys = Object.keys(tasks);
  const data = {};

  for (let i = 0, count = results.length; i < count; i++) {
    const key = keys[i];
    const result = results[i];

    if (result.status === 'fulfilled') {
      data[key] = result.value;
      logger.info('Fetched %s data', key);
    } else {
      logger.error('Failed to fetch % data: %', key, result.reason);
    }
  }

  try {
    await lrtStore.add(timestamp, data);

    logger.info('Stored data successfully');
  } catch (e) {
    logger.error(e, 'Failed to store data');
  }
}

// See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt#use_within_json
BigInt.prototype.toJSON = function () {
  return this.toString();
};
