import BaseService from './BaseService';

export default class RestakingDashboardService extends BaseService {
  constructor(context) {
    super(context);
  }

  async getPromotedOperators() {
    const response = await this._get('/rd/promotion/operators');

    if (response.ok) {
      return await response.json();
    }

    throw await this._createError(response);
  }

  async getAVSPromotedOperators(address) {
    const response = await this._get(`/rd/promotion/avs/${address}/operators`);

    if (response.ok) {
      return await response.json();
    }

    throw await this._createError(response);
  }
}
