const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5001/api';

export async function api(endpoint, options = {}) {
  const token = localStorage.getItem('meld_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  let response;
  try {
    response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });
  } catch {
    throw new Error('Cannot reach server. Check your connection.');
  }

  // B14 fix: safely parse JSON — non-JSON error bodies (e.g., HTML 502) would
  // otherwise throw an unhandled parse error.
  let data;
  try {
    data = await response.json();
  } catch {
    if (response.status === 401) {
      window.dispatchEvent(new Event('auth:logout'));
      throw new Error('Session expired');
    }
    if (!response.ok) {
      throw new Error(`Server error (${response.status})`);
    }
    return {};
  }

  if (response.status === 401) {
    window.dispatchEvent(new Event('auth:logout'));
    throw new Error('Session expired');
  }


  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }

  return data;
}
