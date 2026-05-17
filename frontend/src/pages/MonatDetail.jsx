import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getAusgabenNachMonat, getZusammenfassung, createAusgabe, updateAusgabe, deleteAusgabe } from '../api/ausgaben'
import AusgabeForm from '../components/AusgabeForm'
import AusgabeItem from '../components/AusgabeItem'

const MONATE_LANG = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember']

const KAT_FARBEN = {
  Lebensmittel: '#16a34a', Wohnen: '#2563eb', Transport: '#d97706',
  Gesundheit: '#dc2626', Freizeit: '#7c3aed', Kleidung: '#db2777',
  Bildung: '#0891b2', Sonstiges: '#6b7280',
}

export default function MonatDetail() {
  const { jahr, monat } = useParams()
  const navigate = useNavigate()
  const j = Number(jahr)
  const m = Number(monat)

  const [ausgaben, setAusgaben] = useState([])
  const [zusammenfassung, setZusammenfassung] = useState(null)
  const [loading, setLoading] = useState(true)
  const [formOffen, setFormOffen] = useState(false)

  const laden = useCallback(async () => {
    setLoading(true)
    const [a, z] = await Promise.all([
      getAusgabenNachMonat(j, m),
      getZusammenfassung(j, m),
    ])
    setAusgaben(a)
    setZusammenfassung(z)
    setLoading(false)
  }, [j, m])

  useEffect(() => { laden() }, [laden])

  async function handleCreate(data) {
    await createAusgabe(data)
    setFormOffen(false)
    laden()
  }

  async function handleUpdate(id, data) {
    await updateAusgabe(id, data)
    laden()
  }

  async function handleDelete(id) {
    if (!confirm('Ausgabe löschen?')) return
    await deleteAusgabe(id)
    laden()
  }

  const kategorien = zusammenfassung
    ? Object.entries(zusammenfassung.nach_kategorie).sort((a, b) => b[1] - a[1])
    : []
  const maxKat = kategorien[0]?.[1] ?? 1

  return (
    <div style={s.root}>
      <header style={s.header}>
        <button onClick={() => navigate('/')} style={s.backBtn}>‹ Übersicht</button>
        <h1 style={s.title}>{MONATE_LANG[m - 1]} {j}</h1>
        <button onClick={() => setFormOffen(v => !v)} style={s.addBtn}>
          {formOffen ? '✕' : '+ Neu'}
        </button>
      </header>

      <main style={s.main}>
        {formOffen && (
          <div style={s.card}>
            <h2 style={s.cardTitle}>Neue Ausgabe</h2>
            <AusgabeForm
              onSave={handleCreate}
              onCancel={() => setFormOffen(false)}
              defaultMonat={`${j}-${String(m).padStart(2, '0')}`}
            />
          </div>
        )}

        {zusammenfassung && (
          <div style={s.statsRow}>
            <div style={s.statCard}>
              <div style={s.statLabel}>Gesamt</div>
              <div style={s.statVal}>{zusammenfassung.gesamt.toFixed(2)} €</div>
            </div>
            <div style={s.statCard}>
              <div style={s.statLabel}>Ausgaben</div>
              <div style={s.statVal}>{zusammenfassung.anzahl}</div>
            </div>
            <div style={s.statCard}>
              <div style={s.statLabel}>Ø pro Ausgabe</div>
              <div style={s.statVal}>
                {zusammenfassung.anzahl > 0
                  ? (zusammenfassung.gesamt / zusammenfassung.anzahl).toFixed(2)
                  : '0.00'} €
              </div>
            </div>
          </div>
        )}

        {kategorien.length > 0 && (
          <div style={s.card}>
            <h2 style={s.cardTitle}>Nach Kategorie</h2>
            <div style={s.katList}>
              {kategorien.map(([kat, val]) => {
                const farbe = KAT_FARBEN[kat] || '#6b7280'
                const pct = (val / (zusammenfassung?.gesamt || 1)) * 100
                const barPct = (val / maxKat) * 100
                return (
                  <div key={kat} style={s.katRow}>
                    <div style={s.katHeader}>
                      <span style={{ ...s.katBadge, color: farbe, background: farbe + '18' }}>{kat}</span>
                      <span style={s.katVal}>{val.toFixed(2)} €</span>
                      <span style={s.katPct}>{pct.toFixed(0)}%</span>
                    </div>
                    <div style={s.barTrack}>
                      <div style={{ ...s.bar, width: `${barPct}%`, background: farbe }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <div style={s.card}>
          <h2 style={s.cardTitle}>Alle Ausgaben</h2>
          {loading && <div style={s.loading}>Laden…</div>}
          {!loading && ausgaben.length === 0 && (
            <div style={s.empty}>
              Noch keine Ausgaben.{' '}
              <button onClick={() => setFormOffen(true)} style={s.emptyLink}>Erste Ausgabe hinzufügen</button>
            </div>
          )}
          <div style={s.list}>
            {ausgaben.map(a => (
              <AusgabeItem key={a.id} ausgabe={a} onDelete={handleDelete} onUpdate={handleUpdate} />
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}

const s = {
  root: { minHeight: '100vh', background: '#f5f5f5' },
  header: { background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '0 16px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10 },
  backBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: 15, color: '#2563eb', padding: '4px 8px', borderRadius: 6 },
  title: { fontSize: 16, fontWeight: 700 },
  addBtn: { padding: '6px 12px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 13 },
  main: { maxWidth: 680, margin: '0 auto', padding: '16px 16px 60px' },
  card: { background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: 16, marginBottom: 14 },
  cardTitle: { fontSize: 14, fontWeight: 600, marginBottom: 12, color: '#374151' },
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 14 },
  statCard: { background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '12px 14px' },
  statLabel: { fontSize: 11, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 3 },
  statVal: { fontSize: 18, fontWeight: 700 },
  katList: { display: 'flex', flexDirection: 'column', gap: 10 },
  katRow: { display: 'flex', flexDirection: 'column', gap: 4 },
  katHeader: { display: 'flex', alignItems: 'center', gap: 8 },
  katBadge: { fontSize: 12, fontWeight: 600, padding: '1px 8px', borderRadius: 999 },
  katVal: { marginLeft: 'auto', fontWeight: 600, fontSize: 13 },
  katPct: { fontSize: 12, color: '#9ca3af', minWidth: 32, textAlign: 'right' },
  barTrack: { height: 6, background: '#f3f4f6', borderRadius: 3, overflow: 'hidden' },
  bar: { height: '100%', borderRadius: 3, transition: 'width 0.4s ease' },
  list: { display: 'flex', flexDirection: 'column', gap: 8 },
  loading: { textAlign: 'center', color: '#9ca3af', padding: 20, fontSize: 14 },
  empty: { textAlign: 'center', color: '#9ca3af', padding: '20px 0', fontSize: 14 },
  emptyLink: { background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', textDecoration: 'underline', fontSize: 14 },
}
