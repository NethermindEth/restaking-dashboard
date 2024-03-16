export default async function (fastify) {
  fastify.get('/lrt', { schema: getSchema }, async function (request, reply) {
    return await this.lrtStore.getLatest();
  });

  fastify.get('/test', async function (request, reply) {
    return 'working';
  });
}

const getSchema = {
  description: 'Returns the latest LRT distribution'
  // response: {
  //   200: {
  //     description: 'Succesful response',
  //     type: 'object',
  //     properties: {
  //       timestamp: { type: 'number' },
  //       protocols: {
  //         type: 'object',
  //         properties: {
  //           '<name>': {
  //             type: 'object',
  //             description: 'LRT protocol name',
  //             properties: {
  //               '<asset>': {
  //                 type: 'string',
  //                 description: 'Asset amount'
  //               }
  //             }
  //           }
  //         }
  //       }
  //     }
  // }
  // }
};
