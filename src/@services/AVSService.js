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
}
