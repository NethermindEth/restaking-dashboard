import BaseService from './BaseService';

export default class EigenLayerService extends BaseService {
  async getEigenLayerTVLOvertime() {
    const response = await BaseService._get(`/eigenlayer/tvl`);

    if (response.ok) {
      return await response.json();
    }

    throw await this._createError(response);
  }

  async getEigenLayerLSTTotalValue() {
    const response = await BaseService._get(`/eigenlayer/tvl/lst`);

    if (response.ok) {
      return await response.json();
    }

    throw await this._createError(response);
  }
}
