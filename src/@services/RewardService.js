import BaseService from './BaseService';

export default class RewardService extends BaseService {
  constructor(context) {
    super(context);
  }

  async getOperatorRewards(address, pageNumber, pageSize = 10, sort, signal) {
    console.log('sort', sort);
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

  async getRewardsInfo(signal) {
    const response = await this._get(`eigenlayer/rewards/info`,
      signal
    );

    if (response.ok) {
      return await response.json();
    }
    throw await this._createError(response);
  }
}
