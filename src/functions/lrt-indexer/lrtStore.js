import { MongoClient } from 'mongodb';

export class LRTStore {
  #collection;

  constructor() {
    this.#collection = new MongoClient(process.env.NM_DB_CONNECTION_STRING)
      .db(process.env.NM_DB_NAME)
      .collection('lrt_distribution');
  }

  async add(timestamp, data) {
    if (typeof timestamp !== 'number') {
      throw new Error('`timestamp` must be a number');
    }

    if (!data) {
      throw new Error('`data` is required');
    }

    await this.#collection.insertMany(
      Object.entries(data).map(i => {
        return {
          id: i[0],
          timestamp,
          ...i[1]
        };
      })
    );
  }
}

export const lrtStore = new LRTStore();
