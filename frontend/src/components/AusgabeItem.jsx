import { useState } from 'react'
import AusgabeForm from './AusgabeForm'

const KATEGORIE_FARBEN = {
  Lebensmittel: '#16a34a',
  Wohnen: '#2563eb',
  Transport: '#d97706',
  Gesundheit: '#dc2626',
  Freizeit: '#7c3aed',
  Kleidung: '#db2777',
  Bildung: '#0891b2',
  Sonstiges: '#6b7280',
}

export default function AusgabeItem({ ausgabe, onDelete, onUpdate }) {
  const [editing, setEditing] = useState(false)

  async function handleUpdate(data) {
    await onUpdate(ausgabe.id, data)
    setEditing(false)
  }

  if (editing) {
    return (
      <div style={styles.card}>
        <AusgabeForm initial={ausgabe} onSave={handleUpdate} onCancel={() => setEditing(false)} />
      </div>
    )
  }

  const farbe = KATEGORIE_FARBEN[ausgabe.kategorie] || '#6b7280'

  return (
    <div style={styles.card}>
      <div style={styles.left}>
        <span style={{ ...styles.badge, background: farbe + '18', color: farbe }}>{ausgabe.kategorie}</span>
        <div style={styles.desc}>{ausgabe.beschreibung || '—'}</div>
        <div style={styles.datum}>{new Date(ausgabe.datum).toLocaleDateString('de-DE')}</div>
      </div>
      <div style={styles.right}>
        <div style={styles.betrag}>{Number(ausgabe.betrag).toFixed(2)} €</div>
        <div style={styles.btns}>
          <button onClick={() => setEditing(true)} style={styles.edit}>Bearbeiten</button>
          <button onClick={() => onDelete(ausgabe.id)} style={styles.del}>Löschen</button>
        </div>
      </div>
    </div>
  )
}

const styles = {
  card: { background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 },
  left: { display: 'flex', flexDirection: 'column', gap: 4 },
  badge: { display: 'inline-block', padding: '2px 8px', borderRadius: 999, fontSize: 12, fontWeight: 600, width: 'fit-content' },
  desc: { fontSize: 14, color: '#374151' },
  datum: { fontSize: 12, color: '#9ca3af' },
  right: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 },
  betrag: { fontWeight: 700, fontSize: 16 },
  btns: { display: 'flex', gap: 6 },
  edit: { padding: '3px 10px', fontSize: 12, background: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: 4, cursor: 'pointer' },
  del: { padding: '3px 10px', fontSize: 12, background: '#fee2e2', color: '#b91c1c', border: '1px solid #fca5a5', borderRadius: 4, cursor: 'pointer' },
}
