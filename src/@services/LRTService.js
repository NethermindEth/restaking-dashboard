import { apiGet } from './apiCall';

export default class LRTService {
  async getAll() {
    const response = await apiGet('distribution/lrt');

    if (response.ok) {
      return await response.json();
    }

    // TODO: Handle error
    return await response.json();
  }

  async getLRTDistribution() {
    const response = await apiGet('/lrt');

    if (response.ok) {
      return await response.json();
    }

    // TODO: Handle error
    return await response.json();
  }
}
