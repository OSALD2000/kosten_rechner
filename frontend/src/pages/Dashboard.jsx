import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getMonate, getJahresUebersicht } from '../api/ausgaben'

const MONATE_KURZ = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez']
const MONATE_LANG = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember']

export default function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const now = new Date()
  const [jahr, setJahr] = useState(now.getFullYear())
  const [monate, setMonate] = useState([])
  const [jahresDaten, setJahresDaten] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function laden() {
      setLoading(true)
      const [m, j] = await Promise.all([getMonate(), getJahresUebersicht(jahr)])
      setMonate(m)
      setJahresDaten(j)
      setLoading(false)
    }
    laden()
  }, [jahr])

  const verfuegbareJahre = [...new Set(monate.map(m => m.jahr))].sort((a, b) => b - a)
  const jahresGesamt = jahresDaten.reduce((s, m) => s + m.summe, 0)
  const monatsMitDaten = new Set(jahresDaten.map(m => m.monat))
  const maxSumme = Math.max(...jahresDaten.map(m => m.summe), 1)
  const aktiveMonate = jahresDaten.length
  const schnitt = aktiveMonate > 0 ? jahresGesamt / aktiveMonate : 0

  const bestesMonate = jahresDaten.reduce((best, m) => m.summe > (best?.summe ?? 0) ? m : best, null)

  const monateImJahr = monate.filter(m => m.jahr === jahr)

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <div style={s.root}>
      <header style={s.header}>
        <div style={s.headerLeft}>
          <div style={s.logo}>K</div>
          <span style={s.appName}>Kosten Rechner</span>
        </div>
        <div style={s.headerRight}>
          <span style={s.userName}>{user?.name || user?.email}</span>
          <button onClick={handleLogout} style={s.logoutBtn}>Abmelden</button>
        </div>
      </header>

      <main style={s.main}>
        <div style={s.jahresNav}>
          <button
            onClick={() => setJahr(j => j - 1)}
            style={s.navBtn}
          >
            ‹
          </button>
          <span style={s.jahrLabel}>{jahr}</span>
          <button
            onClick={() => setJahr(j => j + 1)}
            disabled={jahr >= now.getFullYear()}
            style={{ ...s.navBtn, opacity: jahr >= now.getFullYear() ? 0.3 : 1 }}
          >
            ›
          </button>
        </div>

        {!loading && (
          <>
            <div style={s.statsRow}>
              <div style={s.statCard}>
                <div style={s.statLabel}>Jahresgesamt</div>
                <div style={s.statValue}>{jahresGesamt.toFixed(2)} €</div>
              </div>
              <div style={s.statCard}>
                <div style={s.statLabel}>Ø pro Monat</div>
                <div style={s.statValue}>{schnitt.toFixed(2)} €</div>
              </div>
              <div style={s.statCard}>
                <div style={s.statLabel}>Aktivste Monat</div>
                <div style={s.statValue}>
                  {bestesMonate ? MONATE_KURZ[bestesMonate.monat - 1] : '—'}
                </div>
                {bestesMonate && (
                  <div style={s.statSub}>{bestesMonate.summe.toFixed(0)} €</div>
                )}
              </div>
              <div style={s.statCard}>
                <div style={s.statLabel}>Monate aktiv</div>
                <div style={s.statValue}>{aktiveMonate}</div>
              </div>
            </div>

            <div style={s.section}>
              <h2 style={s.sectionTitle}>Jahresübersicht {jahr}</h2>
              {jahresDaten.length === 0 ? (
                <div style={s.empty}>Keine Daten für {jahr}.</div>
              ) : (
                <div style={s.chart}>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(m => {
                    const data = jahresDaten.find(d => d.monat === m)
                    const summe = data?.summe ?? 0
                    const breite = summe > 0 ? Math.max((summe / maxSumme) * 100, 2) : 0
                    const istAktuellerMonat = m === now.getMonth() + 1 && jahr === now.getFullYear()
                    return (
                      <div
                        key={m}
                        style={s.chartRow}
                        onClick={() => summe > 0 && navigate(`/monat/${jahr}/${m}`)}
                      >
                        <span style={{ ...s.chartLabel, color: istAktuellerMonat ? '#2563eb' : '#6b7280' }}>
                          {MONATE_KURZ[m - 1]}
                        </span>
                        <div style={s.barTrack}>
                          <div
                            style={{
                              ...s.bar,
                              width: `${breite}%`,
                              background: istAktuellerMonat ? '#2563eb' : summe > 0 ? '#60a5fa' : 'transparent',
                            }}
                          />
                        </div>
                        <span style={s.barValue}>
                          {summe > 0 ? `${summe.toFixed(0)} €` : '—'}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            <div style={s.section}>
              <h2 style={s.sectionTitle}>Monate mit Ausgaben</h2>
              {monateImJahr.length === 0 ? (
                <div style={s.empty}>Noch keine Ausgaben in {jahr}.</div>
              ) : (
                <div style={s.monatGrid}>
                  {monateImJahr.map(m => {
                    const data = jahresDaten.find(d => d.monat === m.monat)
                    return (
                      <div
                        key={`${m.jahr}-${m.monat}`}
                        style={s.monatCard}
                        onClick={() => navigate(`/monat/${m.jahr}/${m.monat}`)}
                      >
                        <div style={s.monatName}>{MONATE_LANG[m.monat - 1]}</div>
                        <div style={s.monatSumme}>{data ? `${data.summe.toFixed(2)} €` : '…'}</div>
                        {data && <div style={s.monatAnzahl}>{data.anzahl} Ausgaben</div>}
                        <div style={s.monatArrow}>›</div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </>
        )}

        {loading && <div style={s.loading}>Laden…</div>}

        <button
          onClick={() => navigate(`/monat/${now.getFullYear()}/${now.getMonth() + 1}`)}
          style={s.fab}
          title="Aktuelle Monat"
        >
          +
        </button>
      </main>
    </div>
  )
}

const s = {
  root: { minHeight: '100vh', background: '#f5f5f5' },
  header: { background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '0 20px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10 },
  headerLeft: { display: 'flex', alignItems: 'center', gap: 10 },
  logo: { width: 32, height: 32, borderRadius: 8, background: '#2563eb', color: '#fff', fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  appName: { fontWeight: 700, fontSize: 16 },
  headerRight: { display: 'flex', alignItems: 'center', gap: 12 },
  userName: { fontSize: 13, color: '#6b7280' },
  logoutBtn: { padding: '5px 12px', background: 'none', border: '1px solid #e5e7eb', borderRadius: 6, cursor: 'pointer', fontSize: 13, color: '#374151' },
  main: { maxWidth: 720, margin: '0 auto', padding: '20px 16px 80px' },
  jahresNav: { display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20, justifyContent: 'center' },
  navBtn: { width: 36, height: 36, borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', fontSize: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  jahrLabel: { fontSize: 22, fontWeight: 700, minWidth: 60, textAlign: 'center' },
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginBottom: 20 },
  statCard: { background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '14px 16px' },
  statLabel: { fontSize: 11, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 },
  statValue: { fontSize: 20, fontWeight: 700 },
  statSub: { fontSize: 11, color: '#9ca3af', marginTop: 2 },
  section: { background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '16px', marginBottom: 16 },
  sectionTitle: { fontSize: 15, fontWeight: 600, marginBottom: 14 },
  chart: { display: 'flex', flexDirection: 'column', gap: 6 },
  chartRow: { display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', borderRadius: 4, padding: '2px 0' },
  chartLabel: { width: 34, fontSize: 12, fontWeight: 500, flexShrink: 0 },
  barTrack: { flex: 1, height: 20, background: '#f3f4f6', borderRadius: 4, overflow: 'hidden' },
  bar: { height: '100%', borderRadius: 4, transition: 'width 0.4s ease' },
  barValue: { width: 64, fontSize: 12, textAlign: 'right', color: '#374151', flexShrink: 0 },
  monatGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10 },
  monatCard: { border: '1px solid #e5e7eb', borderRadius: 8, padding: '12px 14px', cursor: 'pointer', position: 'relative', background: '#fafafa', transition: 'border-color 0.15s' },
  monatName: { fontSize: 14, fontWeight: 600, marginBottom: 4 },
  monatSumme: { fontSize: 18, fontWeight: 700, color: '#2563eb' },
  monatAnzahl: { fontSize: 11, color: '#9ca3af', marginTop: 2 },
  monatArrow: { position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 18, color: '#d1d5db' },
  loading: { textAlign: 'center', color: '#9ca3af', padding: 48 },
  empty: { textAlign: 'center', color: '#9ca3af', padding: '20px 0', fontSize: 14 },
  fab: { position: 'fixed', bottom: 24, right: 24, width: 52, height: 52, borderRadius: '50%', background: '#2563eb', color: '#fff', fontSize: 28, border: 'none', cursor: 'pointer', boxShadow: '0 4px 16px rgba(37,99,235,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
}
