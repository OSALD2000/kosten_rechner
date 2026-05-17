import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { login, register } from '../api/auth'

export default function Login() {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const { login: authLogin } = useAuth()
  const navigate = useNavigate()

  function set(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }))
  }

  async function submit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = mode === 'login'
        ? await login(form.email, form.password)
        : await register(form.name, form.email, form.password)
      authLogin(res.user, res.token)
      navigate('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.logo}>K</div>
        <h1 style={s.title}>Kosten Rechner</h1>

        <div style={s.tabs}>
          <button
            onClick={() => setMode('login')}
            style={{ ...s.tab, ...(mode === 'login' ? s.tabActive : {}) }}
          >
            Anmelden
          </button>
          <button
            onClick={() => setMode('register')}
            style={{ ...s.tab, ...(mode === 'register' ? s.tabActive : {}) }}
          >
            Registrieren
          </button>
        </div>

        {error && <div style={s.error}>{error}</div>}

        <form onSubmit={submit} style={s.form}>
          {mode === 'register' && (
            <label style={s.label}>
              Name
              <input
                type="text"
                value={form.name}
                onChange={set('name')}
                required
                style={s.input}
                placeholder="Dein Name"
                autoComplete="name"
              />
            </label>
          )}
          <label style={s.label}>
            Email
            <input
              type="email"
              value={form.email}
              onChange={set('email')}
              required
              style={s.input}
              placeholder="email@beispiel.de"
              autoComplete="email"
            />
          </label>
          <label style={s.label}>
            Passwort
            <input
              type="password"
              value={form.password}
              onChange={set('password')}
              required
              minLength={6}
              style={s.input}
              placeholder="Mindestens 6 Zeichen"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            />
          </label>
          <button type="submit" style={s.btn} disabled={loading}>
            {loading ? '…' : mode === 'login' ? 'Anmelden' : 'Konto erstellen'}
          </button>
        </form>
      </div>
    </div>
  )
}

const s = {
  page: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: '#eff6ff' },
  card: { background: '#fff', borderRadius: 16, padding: '36px 32px', width: '100%', maxWidth: 380, boxShadow: '0 4px 24px rgba(0,0,0,0.08)' },
  logo: { width: 56, height: 56, borderRadius: 14, background: '#2563eb', color: '#fff', fontSize: 28, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' },
  title: { textAlign: 'center', fontSize: 22, fontWeight: 700, marginBottom: 24, color: '#111' },
  tabs: { display: 'flex', border: '1px solid #e5e7eb', borderRadius: 8, marginBottom: 20, overflow: 'hidden' },
  tab: { flex: 1, padding: '9px 0', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: '#6b7280' },
  tabActive: { background: '#2563eb', color: '#fff', fontWeight: 600 },
  error: { background: '#fee2e2', color: '#b91c1c', borderRadius: 6, padding: '8px 12px', fontSize: 13, marginBottom: 14 },
  form: { display: 'flex', flexDirection: 'column', gap: 14 },
  label: { display: 'flex', flexDirection: 'column', gap: 5, fontSize: 13, fontWeight: 500, color: '#374151' },
  input: { padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14, outline: 'none', transition: 'border-color 0.15s' },
  btn: { marginTop: 6, padding: '11px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 15, cursor: 'pointer' },
}
