const BASE = '/api';

function getToken() {
  return localStorage.getItem('token');
}

function authHeaders(extra = {}) {
  const h = { 'Content-Type': 'application/json', ...extra };
  const token = getToken();
  if (token) h['Authorization'] = `Bearer ${token}`;
  return h;
}

async function request(method, path, body, isFormData = false) {
  // Build request options
  const opts = {
    method,
    headers: isFormData
      ? { Authorization: `Bearer ${getToken()}` }
      : authHeaders(),
  };

  if (body) opts.body = isFormData ? body : JSON.stringify(body);

  let res;
  try {
    res = await fetch(BASE + path, opts);
  } catch (networkErr) {
    // Server is down or unreachable
    throw new Error('Cannot reach the server. Make sure the backend is running on port 5000.');
  }

  // Safely parse JSON — body might be empty or HTML (e.g. proxy error)
  let data = null;
  const contentType = res.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    try {
      const text = await res.text();
      data = text ? JSON.parse(text) : null;
    } catch {
      throw new Error(`Server returned invalid JSON (status ${res.status})`);
    }
  } else {
    // Got HTML or empty — probably a proxy/server error
    const text = await res.text().catch(() => '');
    if (!res.ok) {
      throw new Error(
        res.status === 404 ? 'API endpoint not found (404)' :
        res.status === 500 ? 'Internal server error (500)' :
        res.status === 503 ? 'Server unavailable — is the backend running?' :
        `Server error: ${res.status}${text ? ' — ' + text.slice(0, 120) : ''}`
      );
    }
    return null; // 2xx but no JSON body
  }

  if (!res.ok) {
    throw new Error(
      data?.error ||
      data?.message ||
      `Request failed with status ${res.status}`
    );
  }

  return data;
}

export const api = {
  login:          (email, password) => request('POST', '/auth/login', { email, password }),
  me:             ()                => request('GET',  '/auth/me'),

  getRequests:    (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request('GET', `/requests${qs ? '?' + qs : ''}`);
  },
  getRequest:     (id)              => request('GET',  `/requests/${id}`),
  createRequest:  (data)            => request('POST', '/requests', data),
  approveRequest: (id, notes)       => request('POST', `/requests/${id}/approve`, { notes }),
  rejectRequest:  (id, reason)      => request('POST', `/requests/${id}/reject`,  { reason }),
  completeRequest:(id, formData)    => request('POST', `/requests/${id}/complete`, formData, true),
  getStats:       ()                => request('GET',  '/requests/stats'),
  getUsers:       ()                => request('GET',  '/users'),
};