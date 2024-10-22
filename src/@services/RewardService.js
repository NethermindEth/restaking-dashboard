import BaseService from './BaseService';

export default class RewardService extends BaseService {
  constructor(context) {
    super(context);
  }

  async getOperatorRewards(address, pageNumber, pageSize = 10, sort, signal) {
    const pageIndex = Math.max(0, pageNumber - 1);
    const response = await this._get(`eigenlayer/rewards/earner/${address}`, {
      query: {
        'page-index': pageIndex,
        'page-size': pageSize,
        sort
      },
      signal
    });

    if (response.ok) {
      return await response.json();
    }

    throw await this._createError(response);
  }

  async getOperatorAllRewards(address, all, signal) {

    const response = await this._get(`eigenlayer/rewards/earner/${address}`, {
      query: {
        all
      },
      signal
    });
    if (response.ok) {
      return await response.json();
    }

    throw await this._createError(response);
  }

  async getRewardsInfo(signal) {
    const response = await this._get(`eigenlayer/rewards/info`,
      signal
    );

    if (response.ok) {
      return await response.json();
    }
    throw await this._createError(response);
  }
  async getAllRewards(pageNumber, pageSize = 10, search, sort, filter, signal) {
    const pageIndex = Math.max(0, pageNumber - 1);
    const response = await this._get(`eigenlayer/rewards/earners`, {
      query: {
        'page-index': pageIndex,
        'page-size': pageSize,
        search,
        sort,
        filter
      },
      signal
    });

    if (response.ok) {
      return await response.json();
    }

    throw await this._createError(response);
  }
}
