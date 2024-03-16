import env from '@fastify/env';
import fp from 'fastify-plugin';

export default fp(
  async fastify => {
    fastify.register(env, {
      dotenv: true,
      schema: {
        type: 'object',
        required: ['NM_PORT'],
        properties: {
          NM_PORT: {
            type: 'string',
            default: 3000
          }
        }
      }
    });
  },
  { name: 'env' }
);
