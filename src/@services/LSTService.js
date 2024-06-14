import { apiGet } from './apiCall';

export default class LSTService {
  async getDeposits() {
    const response = await apiGet(
      'distribution/lst/deposits?chain=eth&timeline=full'
    );

    return await response.json();
  }
}
