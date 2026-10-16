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

function handleUnauthorized() {
  localStorage.removeItem('token');
  if (window.location.pathname !== '/login') window.location.assign('/login');
}

// Images behind auth can't be loaded with a plain <img src>, so fetch them
// with the token and return an object URL (caller must revoke it).
async function fetchImageUrl(path) {
  const res = await fetch(BASE + path, { headers: { Authorization: `Bearer ${getToken()}` } });
  if (res.status === 401) { handleUnauthorized(); throw new Error('Session expired. Please sign in again.'); }
  if (!res.ok) throw new Error(`Could not load image (status ${res.status})`);
  return URL.createObjectURL(await res.blob());
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

  // Expired or invalid session: drop the token and go back to the login page
  if (res.status === 401 && path !== '/auth/login') {
    handleUnauthorized();
    throw new Error('Session expired. Please sign in again.');
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
  getDeliveryImageUrl: (id)         => fetchImageUrl(`/requests/${id}/delivery-image`),
  getStats:       ()                => request('GET',  '/requests/stats'),
  getUsers:       ()                => request('GET',  '/users'),
};