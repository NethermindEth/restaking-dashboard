import { apiGet } from './apiCall';

export default class OperatorService {
  async getAll(pageIndex) {
    const response = await apiGet(
      `operators?page-index=${pageIndex}&page-size=10`
    );

    if (response.ok) {
      return await response.json();
    }

    // TODO: Handle error
    return await response.json();
  }

  async getOperator(address) {
    const response = await apiGet(`operators/${address}`);

    if (response.ok) {
      return await response.json();
    }

    // TODO: Handle error
    return await response.json();
  }
}
