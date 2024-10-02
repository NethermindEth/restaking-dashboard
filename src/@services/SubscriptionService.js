import BaseService from './BaseService';

export default class SubscriptionService extends BaseService {
  constructor(context) {
    super(context);
  }

  async getPaymentLink(key) {
    const response = await this._post('/subscriptions/get-payment-link', {
      body: {
        key
      }
    });

    if (response.ok) {
      return await response.json();
    }

    throw await this._createError(response);
  }
}
