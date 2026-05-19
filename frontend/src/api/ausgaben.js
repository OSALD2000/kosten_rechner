function token() {
  return localStorage.getItem('kr_token')
}

async function request(path, options = {}) {
  const res = await fetch('/api/ausgaben' + path, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token()}`,
    },
    ...options,
  })
  if (res.status === 401) {
    localStorage.removeItem('kr_token')
    localStorage.removeItem('kr_user')
    window.location.href = '/login'
    return
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail || `HTTP ${res.status}`)
  }
  if (res.status === 204) return null
  return res.json()
}

export const getMonate = () => request('/monate')
export const getJahresUebersicht = (jahr) => request(`/jahres-uebersicht/${jahr}`)
export const getAusgabenNachMonat = (jahr, monat) => request(`/monat/${jahr}/${monat}`)
export const getZusammenfassung = (jahr, monat) => request(`/zusammenfassung/${jahr}/${monat}`)
export const createAusgabe = (data) => request('/', { method: 'POST', body: JSON.stringify(data) })
export const updateAusgabe = (id, data) => request(`/${id}`, { method: 'PUT', body: JSON.stringify(data) })
export const deleteAusgabe = (id) => request(`/${id}`, { method: 'DELETE' })
