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

  async getLatest() {
    const response = await BaseService._get('/lrt/latest');

    if (response.ok) {
      return await response.json();
    }

    throw await this._createError(response);
  }
}
