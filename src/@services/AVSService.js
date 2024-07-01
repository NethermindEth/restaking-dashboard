import { apiGet } from './apiCall';

export default class AVSService {
  async getAll(pageNumber) {
    const pageIndex = Math.max(0, pageNumber - 1);
    const response = await apiGet('/avs', {
      query: {
        'page-index': pageIndex
      }
    });

    if (response.ok) {
      return await response.json();
    }

    // TODO: Handle error
    return await response.json();
  }

  async getAVSDetails(address) {
    const response = await apiGet(`/avs/${address}`);

    if (response.ok) {
      return await response.json();
    }

    // TODO: Handle error
    return await response.json();
  }

  async getAvsOperators(address, pageIndex) {
    const response = await apiGet(`/avs/${address}/operators`, {
      query: {
        'page-index': pageIndex
      }
    });

    if (response.ok) {
      return await response.json();
    }

    // TODO: Handle error
    return await response.json();
  }
}
