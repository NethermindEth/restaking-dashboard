import { apiGet } from './apiCall';

export default class OperatorService {
  async getAll() {
    const response = await apiGet('operators');

    if (response.ok) {
      return await response.json();
    }

    // TODO: Handle error
    return await response.json();
  }
}
