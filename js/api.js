// ═══════════════════════════════════════════════════════════════════════════
//  api.js  —  Markaziy fetch wrapper (auto token refresh on 401)
//
//  Ishlatish:
//    const res = await apiFetch('/api/catalog/products/', { headers: authHeader() });
//
//  Logika:
//    1. So'rov yuboriladi
//    2. 401 qaytsa → refresh token bilan /api/token/refresh/ ga boriladi
//    3. Yangi access token olinsa → so'rov qayta yuboriladi
//    4. Refresh ham ishlamasa → localStorage tozalanadi + login ga yo'naltiriladi
// ═══════════════════════════════════════════════════════════════════════════

const BASE_URL   = 'http://localhost:8000';
const LOGIN_PAGE = '/page/login.html';

// ── Token helpers ────────────────────────────────────────────────────────────
function getAccess()  { return localStorage.getItem('access')  || ''; }
function getRefresh() { return localStorage.getItem('refresh') || ''; }

function authHeader() {
  return { 'Authorization': `Bearer ${getAccess()}` };
}

function clearTokensAndRedirect() {
  localStorage.removeItem('access');
  localStorage.removeItem('refresh');
  // Boshqa mumkin bo'lgan tokenlar ham tozalansin
  localStorage.removeItem('user');
  window.location.href = LOGIN_PAGE;
}

// ── Token yangilash ──────────────────────────────────────────────────────────
let _refreshing = null; // bir vaqtda bir nechta so'rov 401 qaytarsa, faqat bitta refresh qilish

async function refreshAccessToken() {
  if (_refreshing) return _refreshing; // avvalgi refresh kutiladi

  _refreshing = (async () => {
    const refresh = getRefresh();
    if (!refresh) {
      clearTokensAndRedirect();
      throw new Error('No refresh token');
    }

    const res = await fetch(`${BASE_URL}/api/token/refresh/`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ refresh }),
    });

    if (!res.ok) {
      // Refresh token eskirgan yoki noto'g'ri
      clearTokensAndRedirect();
      throw new Error('Refresh failed');
    }

    const data = await res.json();
    localStorage.setItem('access', data.access);
    // Agar backend yangi refresh token ham qaytarsa uni ham saqlash
    if (data.refresh) localStorage.setItem('refresh', data.refresh);

    return data.access;
  })();

  try {
    return await _refreshing;
  } finally {
    _refreshing = null;
  }
}

// ── Asosiy wrapper ───────────────────────────────────────────────────────────
/**
 * apiFetch — native fetch o'rniga ishlatiladigan wrapper.
 *
 * @param {string} url      — to'liq URL yoki path ('/api/...')
 * @param {object} options  — fetch options (method, headers, body, ...)
 * @returns {Promise<Response>}
 */
async function apiFetch(url, options = {}) {
  // Agar URL nisbiy (relative) bo'lsa BASE_URL qo'shamiz
  const fullUrl = url.startsWith('http') ? url : `${BASE_URL}${url}`;

  // Authorization header ni har doim qo'shamiz (agar mavjud bo'lsa)
  const token = getAccess();
  const headers = {
    ...(options.headers || {}),
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };

  let res = await fetch(fullUrl, { ...options, headers });

  // 401 Unauthorized → token yangilash va qayta urinish
  if (res.status === 401) {
    try {
      const newToken = await refreshAccessToken();
      const retryHeaders = {
        ...(options.headers || {}),
        'Authorization': `Bearer ${newToken}`,
      };
      res = await fetch(fullUrl, { ...options, headers: retryHeaders });
    } catch {
      // refreshAccessToken ichida redirect qilingan
      throw new Error('Session expired');
    }
  }

  return res;
}
