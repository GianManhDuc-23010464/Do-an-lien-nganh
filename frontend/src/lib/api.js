// Gọi REST API của backend Spring Boot.
export const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8080').replace(/\/$/, '')

const TOKEN_KEY = 'token'
const USER_KEY = 'user'

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message)
    this.status = status
    this.data = data
  }
}

function safeGet(key) {
  try { return localStorage.getItem(key) } catch { return null }
}

export function getToken() {
  const t = safeGet(TOKEN_KEY)
  if (!t || t === 'null') return null
  if (isExpired(t)) {
    clearSession()
    return null
  }
  return t
}

export function getStoredUser() {
  try { return JSON.parse(safeGet(USER_KEY) || 'null') } catch { return null }
}

export function saveSession(token, user) {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function clearSession() {
  try {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  } catch { /* ignore */ }
}

function isExpired(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
    return payload.exp && payload.exp * 1000 < Date.now()
  } catch {
    return true
  }
}

function buildUrl(path, params) {
  const url = new URL(path.startsWith('http') ? path : API_URL + path)
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v === undefined || v === null || v === '') return
      if (Array.isArray(v)) v.forEach((x) => url.searchParams.append(k, x))
      else url.searchParams.set(k, v)
    })
  }
  return url.toString()
}

async function parse(res) {
  const text = await res.text()
  if (!text) return null
  try { return JSON.parse(text) } catch { return text }
}

function messageFrom(status, data) {
  if (data && typeof data === 'object') {
    if (data.defaultMessage) return data.defaultMessage
    if (Array.isArray(data) && data[0]?.defaultMessage) return data[0].defaultMessage
    if (data.message && status !== 500) return data.message
  }
  if (typeof data === 'string' && data.length < 200 && !data.startsWith('<')) return data
  if (status === 401 || status === 403) return 'Bạn cần đăng nhập với tài khoản có quyền để làm việc này'
  if (status === 404) return 'Không tìm thấy dữ liệu'
  if (status >= 500) return 'Máy chủ đang gặp lỗi, vui lòng thử lại sau'
  return 'Có lỗi xảy ra'
}

/**
 * request('/api/x', { method, params, body, form })
 *  - body: object -> gửi JSON
 *  - form: FormData -> gửi multipart
 */
export async function request(path, { method = 'GET', params, body, form, signal } = {}) {
  const headers = {}
  const token = getToken()
  if (token) headers.Authorization = 'Bearer ' + token
  let payload
  if (form) payload = form
  else if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
    payload = JSON.stringify(body)
  }
  let res
  try {
    res = await fetch(buildUrl(path, params), { method, headers, body: payload, signal })
  } catch (e) {
    if (e.name === 'AbortError') throw e
    throw new ApiError('Không kết nối được máy chủ. Kiểm tra backend đã chạy chưa.', 0)
  }
  const data = await parse(res)
  if (!res.ok) throw new ApiError(messageFrom(res.status, data), res.status, data)
  return data
}

export const api = {
  get: (path, params, opts) => request(path, { ...opts, params }),
  post: (path, body, params) => request(path, { method: 'POST', body, params }),
  del: (path, params) => request(path, { method: 'DELETE', params }),
  upload: (path, files) => {
    const form = new FormData()
    ;[].concat(files).forEach((f) => form.append('file', f))
    return request(path, { method: 'POST', form })
  },
}

export async function uploadImage(file) {
  return api.upload('/api/upload/file', file)
}

export async function uploadImages(files) {
  if (!files?.length) return []
  return api.upload('/api/upload/multiple-file', Array.from(files))
}
