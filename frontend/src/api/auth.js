async function request(path, body) {
  const res = await fetch('/auth' + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  console.log(res);
  
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail || `HTTP ${res.status}`)
  }
  text = await res.text();
  console.log(text)
  return res.json()
}

export const login = (email, password) => request('/login', { email, password })
export const register = (name, email, password) => request('/register', { name, email, password })
