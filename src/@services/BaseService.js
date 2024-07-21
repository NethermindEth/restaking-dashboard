export default class BaseService {
  static async #call(endpoint, options) {
    const url = new URL(
      `${endpoint.startsWith('/') ? '' : '/'}${endpoint}`,
      import.meta.env.VITE_API_BASE_URL
    );

    for (let param in options?.query) {
      const value = options.query[param];

      if (value instanceof Array) {
        for (let i of value) {
          if (i?.toString()) {
            url.searchParams.append(param, i);
          }
        }
      } else if (value?.toString()) {
        url.searchParams.set(param, value);
      }
    }

    const request = {
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        'accept-language': 'en-us',
        'content-type': `application/json; charset=utf-8`,
        ...options?.headers
      },
      method: options?.method?.toUpperCase() || 'get'
    };

    if (options?.body != null) {
      const isFormData = options.body instanceof FormData;

      request.body =
        isFormData ||
        (options.headers &&
          Object.keys(options.headers).find(
            h => h.toLowerCase() === 'content-type'
          ))
          ? options.body
          : JSON.stringify(options.body);

      if (isFormData) {
        for (let header in request.headers) {
          if (header.toLowerCase() === 'content-type') {
            delete request.headers[header];
            break;
          }
        }
      }
    }

    return fetch(url.href, request);
  }

  /**
   * Calls an endpoint with the `DELETE` method.
   * @param {string} endpoint
   * @param {{body: object, headers: object, query: object}?} options
   * @returns {Promise<Response>}
   */
  static _delete(endpoint, options) {
    return this.#call(endpoint, { ...options, method: 'delete' });
  }

  /**
   * Calls an endpoint with the `GET` method.
   * @param {string} endpoint
   * @param {{body: object, headers: object, query: object}?} options
   * @returns {Promise<Response>}
   */
  static _get(endpoint, options) {
    return this.#call(endpoint, { ...options, method: 'get' });
  }

  /**
   * Calls an endpoint with the `PATCH` method.
   * @param {string} endpoint
   * @param {{body: object, headers: object, query: object}?} options
   * @returns {Promise<Response>}
   */
  static _patch(endpoint, options) {
    return this.#call(endpoint, { ...options, method: 'patch' });
  }

  /**
   * Calls an endpoint with the `POST` method.
   * @param {string} endpoint
   * @param {{body: object, headers: object, query: object}?} options
   * @returns {Promise<Response>}
   */
  static _post(endpoint, options) {
    return this.#call(endpoint, { ...options, method: 'post' });
  }

  /**
   * Calls an endpoint with the `PUT` method.
   * @param {string} endpoint
   * @param {{body: object, headers: object, query: object}?} options
   * @returns {Promise<Response>}
   */
  static _put(endpoint, options) {
    return this.#call(endpoint, { ...options, method: 'put' });
  }

  /**
   * Creates an error object from a response.
   * @param {Response} response
   * @returns {Promise<Error>} An error object
   */
  async _createError(response) {
    if (
      response.headers.has('content-type') &&
      response.headers.get('content-type').includes('application/json')
    ) {
      return new ServiceError(await response.json());
    }

    return new Error(UNKNOWN_ERROR);
  }
}

export class ServiceError extends Error {
  constructor(details) {
    super(details.message || UNKNOWN_ERROR);

    this.details = details;
    this.name = 'ServiceError';
  }
}

const UNKNOWN_ERROR = 'An unknown error occurred';
