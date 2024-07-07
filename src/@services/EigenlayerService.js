import { apiGet } from './apiCall';

export default class EigenlayerService {
  async getEigenLayerTVLOvertime() {
    const response = await apiGet(`/eigenlayer/tvl`);

    if (response.ok) {
      return await response.json();
    }

    // TODO: Handle error
    return await response.json();
  }

  async getEigenLayerLSTTotalValue() {
    const response = await apiGet(`/eigenlayer/tvl/lst`);

    if (response.ok) {
      return await response.json();
    }

    // TODO: Handle error
    return await response.json();
  }
}
