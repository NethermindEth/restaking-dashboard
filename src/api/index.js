import 'dotenv/config';
import app from './app.js';
import closeWithGrace from 'close-with-grace';
import Fastify from 'fastify';

const fastify = Fastify({
  logger: true
});

fastify.register(app);

// delay is the number of milliseconds for the graceful close to finish
const closeListeners = closeWithGrace(
  { delay: process.env.FASTIFY_CLOSE_GRACE_DELAY || 500 },
  async function ({ signal, err, manual }) {
    if (err) {
      fastify.log.error(err);
    }
    await fastify.close();
  }
);

fastify.addHook('onClose', async (instance, done) => {
  closeListeners.uninstall();
  done();
});

fastify.listen({ port: process.env.NM_PORT, host: '0.0.0.0' }, err => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
});
