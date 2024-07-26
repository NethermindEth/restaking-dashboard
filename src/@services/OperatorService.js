import { apiGet } from './apiCall';
import BaseService from './BaseService';

export default class OperatorService extends BaseService {
  async getAll(pageIndex, search) {
    const response = await apiGet(`operators`, {
      query: {
        'page-index': pageIndex,
        search
      }
    });

    if (response.ok) {
      return await response.json();
    }

    // TODO: Handle error
    return await response.json();
  }

  async getTopOperators() {
    const response = await apiGet(`/operators/`, {
      query: {
        'page-size': 3
      }
    });

    if (response.ok) {
      return await response.json();
    }

    // TODO: Handle error
    return await response.json();
  }

  async getOperator(address) {
    const response = await BaseService._get(`operators/${address}`);

    if (response.ok) {
      return await response.json();
    }

    throw await this._createError(response);
  }

  async getOperatorTVL(address) {
    const response = await BaseService._get(`operators/${address}/tvl`);

    if (response.ok) {
      return await response.json();
    }

    throw await this._createError(response);
  }

  async getRestakerTrend(address) {
    const response = await BaseService._get(`operators/${address}/restakers`);

    if (response.ok) {
      return await response.json();
    }

    // TODO: Handle error
    throw await this._createError(response);
  }
}
