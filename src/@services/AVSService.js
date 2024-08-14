import { apiGet } from './apiCall';
import BaseService from './BaseService';

export default class AVSService extends BaseService {
  async getAll(pageNumber, pageSize = 10, search, sort, signal) {
    const pageIndex = Math.max(0, pageNumber - 1);
    const response = await BaseService._get('/avs', {
      query: { 'page-index': pageIndex, 'page-size': pageSize, search, sort },
      signal
    });

    if (response.ok) {
      return await response.json();
    }

    throw await this._createError(response);
  }

  async getAVSDetails(address) {
    const response = await apiGet(`/avs/${address}`);

    if (response.ok) {
      return await response.json();
    }

    throw await this._createError(response);
  }

  async getAVSOperators(address, pageNumber, search, sort, signal) {
    const pageIndex = Math.max(0, pageNumber - 1);
    const response = await apiGet(`/avs/${address}/operators`, {
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

  async getAVSTotalValue(address) {
    const response = await apiGet(`/avs/${address}/tvl`);

    if (response.ok) {
      return await response.json();
    }

    throw await this._createError(response);
  }

  async getAVSOperatorsOvertime(address) {
    const response = await apiGet(`/avs/${address}/operators/over-time`);

    if (response.ok) {
      return await response.json();
    }

    throw await this._createError(response);
  }
}
