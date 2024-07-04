import { apiGet } from './apiCall';

export default class AVSService {
  async getAll() {
    const response = await apiGet('/avs');

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
