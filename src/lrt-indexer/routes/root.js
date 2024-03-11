export default async fastify => {
  fastify.get('/', async (request, reply) => {
    return reply.notFound();
  });
};
