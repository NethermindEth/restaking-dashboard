import { apiGet } from './apiCall';

export default class OperatorService {
  async getAll(pageIndex) {
    const response = await apiGet(`operators`, {
      query: {
        'page-index': pageIndex
      }
    });

    if (response.ok) {
      return await response.json();
    }

    // TODO: Handle error
    return await response.json();
  }

  async getTopOperators() {
    const response = await apiGet(`/operators/`, {
      query: {
        'page-size': 3
      }
    });

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

  async getOperatorTVL(address) {
    const response = await apiGet(`operators/${address}/tvl`);

    if (response.ok) {
      return await response.json();
    }

    // TODO: Handle error
    return await response.json();
  }

  async getRestakerTrend(address) {
    const response = await apiGet(`operators/${address}/restakers`);

    if (response.ok) {
      return await response.json();
    }

    // TODO: Handle error
    return await response.json();
  }
}
