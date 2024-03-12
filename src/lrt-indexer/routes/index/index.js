import queryEtherfi from './etherfi.js';
import queryKelp from './kelp.js';
import queryPuffer from './puffer.js';
import queryRenzo from './renzo.js';

export default async function (fastify) {
  fastify.get('/lrt', async function (request, reply) {
    const tasks = {
      renzo: queryRenzo(this),
      kelp: queryKelp(this),
      etherfi: queryEtherfi(this),
      puffer: queryPuffer(this)
    };

    const results = await Promise.allSettled(Object.values(tasks));
    const keys = Object.keys(tasks);
    const status = {};

    for (let i = 0, count = results.length; i < count; i++) {
      status[keys[i]] =
        results[i].status === 'fulfilled' ? 'succeeded' : 'failed';
    }

    return status;
  });
}
