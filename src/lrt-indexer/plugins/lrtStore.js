import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import fp from 'fastify-plugin';

export default fp(async fastify => {
  let store;

  fastify.decorate('lrtStore', () => {
    if (!store) {
      store = { client: new DynamoDBClient() };
      store.docClient = DynamoDBDocumentClient.from(store.client);
      store.put = async function (id, timestamp, data) {
        try {
          await this.docClient.send(
            new PutCommand({
              TableName: 'lrt_distribution',
              Item: {
                id,
                timestamp,
                ...data
              }
            })
          );
        } catch (e) {
          fastify.log.error(e);
        }
      };
    }

    return store;
  });
});
