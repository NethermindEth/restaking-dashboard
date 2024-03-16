import fp from 'fastify-plugin';

export default fp(
  async fastify => {
    fastify.decorate('lrtStore', new LRTStore(fastify.mongo));
  },
  { dependencies: ['env', 'mongodb'] }
);

export class LRTStore {
  #collection;

  constructor(mongodb) {
    if (!mongodb) {
      throw new Error('`mongodb` is required');
    }

    this.#collection = mongodb.client
      .db(process.env.NM_DB_NAME)
      .collection('lrt_distribution');
  }

  async getLatest() {
    // Get the latest timestamp
    let results = await this.#collection
      .find()
      .sort({ timestamp: -1 })
      .limit(1);
    const last = await results.toArray();

    if (last.length == 0) {
      return [];
    }

    // Get all LRTs by timestamp
    results = await this.#collection.find({
      timestamp: { $eq: last[0].timestamp }
    });

    results = await results.toArray();

    if (results.length > 0) {
      return results.reduce(
        (acc, item) => {
          acc.protocols[item.id] = {};

          for (let key in item) {
            if (key !== '_id' && key !== 'id' && key !== 'timestamp') {
              acc.protocols[item.id][key] = item[key];
            }
          }

          return acc;
        },
        { timestamp: last[0].timestamp, protocols: {} }
      );
    }

    return results;
  }
}

// export class LRTStore {
//   #tableName;

//   constructor(tableName) {
//     if (!tableName) {
//       throw new Error('`tableName` is required');
//     }

//     this.#tableName = tableName;
//     this.client = new DynamoDBClient();
//     this.docClient = DynamoDBDocumentClient.from(this.client);
//   }

//   async getLatest() {
//     const result = await this.docClient.send(
//       // new ExecuteStatementCommand({
//       //   Statement: `SELECT * FROM ${this.#tableName} WHERE id = ? AND "timestamp" > ? ORDER BY "timestamp" DESC`,
//       //   Parameters: ['lrt', Date.now() - 1000 * 60 * 60 * 24],
//       //   Limit: 1
//       // })
//       new QueryCommand({
//         TableName: this.#tableName,
//         KeyConditionExpression: 'id = :id and #timestamp > :timestamp',
//         ExpressionAttributeNames: { '#timestamp': 'timestamp' },
//         ExpressionAttributeValues: {
//           ':id': 'lrt',
//           ':timestamp': Date.now() - 1000 * 60 * 60 * 24 // a day before should be enough for now
//         },
//         // ConsistentRead: true,
//         ScanIndexForward: false,
//         Limit: 1
//       })
//     );

//     if (result.Count > 0) {
//       delete result.Items[0].id;
//       return result.Items;
//     }

//     return [];
//   }
// }

//export const lrtStore = new LRTStore('lrt_distribution');
