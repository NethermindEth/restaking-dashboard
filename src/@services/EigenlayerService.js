import { apiGet } from './apiCall';

export default class EigenlayerService {
  async getEigenlayerTVLOvertime() {
    const response = await apiGet(`/eigenlayer/tvl`);

    if (response.ok) {
      return await response.json();
    }

    // TODO: Handle error
    return await response.json();
  }
}
