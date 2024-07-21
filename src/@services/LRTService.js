import { apiGet } from './apiCall';
import BaseService from './BaseService';

export default class LRTService extends BaseService {
  async getAll() {
    const response = await BaseService._get('/lrt/all');

    if (response.ok) {
      return await response.json();
    }

    throw await this._createError(response);
  }

  async getLatestDelegations() {
    const response = await BaseService._get('/lrt/delegations/latest');

    if (response.ok) {
      return await response.json();
    }

    throw await this._createError(response);
  }

  /** @todo remvoe later */
  async getLRTDistribution() {
    const response = await apiGet('/lrt');

    if (response.ok) {
      return await response.json();
    }

    // TODO: Handle error
    return await response.json();
  }
}
