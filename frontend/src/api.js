const API_BASE = import.meta.env.VITE_API_URL || '';

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  let data = null;
  const text = await response.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { error: text };
    }
  }

  if (!response.ok) {
    const message = data?.error || `Request failed (${response.status})`;
    throw new Error(message);
  }

  return data;
}

export function getCheckIns() {
  return request('/api/checkins');
}

export function createCheckIn(payload) {
  return request('/api/checkins', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function deleteCheckIn(id) {
  return request(`/api/checkins/${id}`, {
    method: 'DELETE',
  });
}
