export default async function apiCall(endpoint, options) {
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
      'Accept-Language': 'en-us',
      'Content-Type': `application/json; charset=utf-8`,
      ...options?.headers
    },
    method: options?.method?.toUpperCase() || 'GET'
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

export const apiDelete = (endpoint, options) =>
  apiCall(endpoint, { ...options, method: 'DELETE' });
export const apiGet = (endpoint, options) =>
  apiCall(endpoint, { ...options, method: 'GET' });
export const apiPatch = (endpoint, options) =>
  apiCall(endpoint, { ...options, method: 'PATCH' });
export const apiPost = (endpoint, options) =>
  apiCall(endpoint, { ...options, method: 'POST' });
export const apiPut = (endpoint, options) =>
  apiCall(endpoint, { ...options, method: 'PUT' });
