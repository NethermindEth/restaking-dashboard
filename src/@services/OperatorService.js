import { apiGet } from './apiCall';
import BaseService from './BaseService';

export default class OperatorService extends BaseService {
  async getAll(pageNumber, search, sort, signal) {
    const pageIndex = Math.max(0, pageNumber - 1);
    const response = await BaseService._get(`operators`, {
      query: {
        'page-index': pageIndex,
        search,
        sort
      },
      signal
    });

    if (response.ok) {
      return await response.json();
    }

    throw await this._createError(response);
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
    const response = await apiGet(`operators/${address}`);

    if (response.ok) {
      return await response.json();
    }

    // TODO: Handle error
    return await response.json();
  }

  async getOperatorTVL(address) {
    const response = await apiGet(`operators/${address}/tvl`);

    if (response.ok) {
      return await response.json();
    }

    // TODO: Handle error
    return await response.json();
  }

  async getRestakerTrend(address) {
    const response = await apiGet(`operators/${address}/restakers`);

    if (response.ok) {
      return await response.json();
    }

    // TODO: Handle error
    return await response.json();
  }
}
