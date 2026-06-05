const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5050'

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  })

  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || 'Request failed')
  }

  if (response.status === 204) {
    return null
  }

  return response.json()
}

export function login(payload) {
  return request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function fetchCustomers(matchmakerId, page = 1, limit = 10) {
  const params = new URLSearchParams()
  if (matchmakerId) params.set('matchmakerId', matchmakerId)
  params.set('page', String(page))
  params.set('limit', String(limit))
  return request(`/api/customers?${params.toString()}`)
}

export function fetchCustomerDetail(id) {
  return request(`/api/customers/${id}`)
}

export function fetchMatches(customerId) {
  return request(`/api/customers/${customerId}/matches`)
}

export function fetchNotes(customerId) {
  return request(`/api/customers/${customerId}/notes`)
}

export function addNote(customerId, text) {
  return request(`/api/customers/${customerId}/notes`, {
    method: 'POST',
    body: JSON.stringify({ text }),
  })
}

export function sendMatch(customerId, matchId) {
  return request('/api/matches/send', {
    method: 'POST',
    body: JSON.stringify({ customerId, matchId }),
  })
}
