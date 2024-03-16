import fp from 'fastify-plugin';
import swagger from '@fastify/swagger';

export default fp(async fastify => {
  fastify.register(swagger, {
    exposeRoute: true,
    // hideUntagged: true,
    openapi: {
      info: {
        title: 'Restaking Dashboard',
        description: 'Nethermind Restaking Dashboard API',
        version: '1.0.0-preview'
      }
    }
  });
});
