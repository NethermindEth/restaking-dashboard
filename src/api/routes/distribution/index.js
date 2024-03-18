export default async function (fastify) {
  fastify.get('/lrt', { schema: getSchema }, async function (request, reply) {
    return await this.lrtStore.getLatest();
  });

  fastify.get('/test', async function (request, reply) {
    return 'working';
  });
}

const getSchema = {
  description: 'Returns the latest LRT distribution',
  response: {
    200: {
      description: 'Succesful response',
      type: 'object',
      properties: {
        timestamp: {
          type: 'number',
          description: 'The UNIX timestamp of the distribution data'
        },
        protocols: {
          type: 'object',
          additionalProperties: {
            type: 'object',
            additionalProperties: { type: 'string' }
          },
          example: {
            kelp: {
              stETH: '1234.567',
              ETH: '123'
            },
            etherfi: {
              ETH: '12345'
            }
          }
        }
      }
    }
  }
};
