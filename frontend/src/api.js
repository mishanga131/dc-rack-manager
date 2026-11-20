const BASE_URL = import.meta.env.VITE_API_URL;

export class ApiError extends Error {
  constructor(message, status, errors) {
    super(message);
    this.status = status;
    this.errors = errors || {}; // { поле: 'помилка' } від сервера
  }
}

async function request(path, options = {}) {
  let res;
  try {
    res = await fetch(BASE_URL + path, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
  } catch {
    throw new ApiError('Немає зʼєднання із сервером. Перевірте, чи запущено backend.', 0);
  }

  if (res.status === 204) return null;
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new ApiError(data?.message || `Помилка сервера (${res.status})`, res.status, data?.errors);
  }
  return data;
}

export const api = {
  getRacks: (params) => request(`/racks?${new URLSearchParams(params)}`),
  getRack: (id) => request(`/racks/${id}`),
  createRack: (body) => request('/racks', { method: 'POST', body: JSON.stringify(body) }),
  updateRack: (id, body) => request(`/racks/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteRack: (id) => request(`/racks/${id}`, { method: 'DELETE' }),
  createDevice: (body) => request('/devices', { method: 'POST', body: JSON.stringify(body) }),
  deleteDevice: (id) => request(`/devices/${id}`, { method: 'DELETE' }),
};
