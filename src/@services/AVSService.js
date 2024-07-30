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

    // TODO: Handle error
    return await response.json();
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
    } else {
      throw new Error(await response.json());
    }
  }

  async getAVSTotalValue(address) {
    const response = await apiGet(`/avs/${address}/tvl`);

    if (response.ok) {
      return await response.json();
    }

    // TODO: Handle error
    return await response.json();
  }

  async getAVSOperatorsOvertime(address) {
    const response = await apiGet(`/avs/${address}/operators/over-time`);

    if (response.ok) {
      return await response.json();
    }

    // TODO: Handle error
    return await response.json();
  }

  async getTopAVS() {
    const response = await apiGet(`/avs/`, {
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
}
