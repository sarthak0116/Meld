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

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }

  return data;
}
