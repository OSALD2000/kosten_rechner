async function request(path, body) {
  try{

  const res = await fetch('/auth' + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail || `HTTP ${res.status}`)
  }
  return res.json()
  }
  catch (e)
  {
    console.log(e);
    
  }
}

export const login = (email, password) => request('/login', { email, password })
export const register = (name, email, password) => request('/register', { name, email, password })
