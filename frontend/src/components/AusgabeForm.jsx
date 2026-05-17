import { useState } from 'react'

const KATEGORIEN = ['Lebensmittel', 'Wohnen', 'Transport', 'Gesundheit', 'Freizeit', 'Kleidung', 'Bildung', 'Sonstiges']

export default function AusgabeForm({ onSave, initial, onCancel, defaultMonat }) {
  const today = new Date().toISOString().split('T')[0]
  const defaultDatum = defaultMonat ? `${defaultMonat}-01` : today
  const [form, setForm] = useState({
    betrag: initial?.betrag ?? '',
    kategorie: initial?.kategorie ?? KATEGORIEN[0],
    beschreibung: initial?.beschreibung ?? '',
    datum: initial?.datum ?? defaultDatum,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  function set(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }))
  }

  async function submit(e) {
    e.preventDefault()
    if (!form.betrag || isNaN(Number(form.betrag))) return
    setLoading(true)
    setError(null)
    try {
      await onSave({ ...form, betrag: Number(form.betrag) })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={submit} style={styles.form}>
      {error && <div style={styles.error}>{error}</div>}

      <label style={styles.label}>
        Betrag (€)
        <input
          type="number"
          step="0.01"
          min="0.01"
          value={form.betrag}
          onChange={set('betrag')}
          required
          style={styles.input}
          placeholder="0.00"
        />
      </label>

      <label style={styles.label}>
        Kategorie
        <select value={form.kategorie} onChange={set('kategorie')} style={styles.input}>
          {KATEGORIEN.map((k) => <option key={k}>{k}</option>)}
        </select>
      </label>

      <label style={styles.label}>
        Beschreibung
        <input
          type="text"
          value={form.beschreibung}
          onChange={set('beschreibung')}
          style={styles.input}
          placeholder="Optional"
        />
      </label>

      <label style={styles.label}>
        Datum
        <input type="date" value={form.datum} onChange={set('datum')} required style={styles.input} />
      </label>

      <div style={styles.actions}>
        {onCancel && (
          <button type="button" onClick={onCancel} style={styles.btnSecondary} disabled={loading}>
            Abbrechen
          </button>
        )}
        <button type="submit" style={styles.btnPrimary} disabled={loading}>
          {loading ? 'Speichern…' : initial ? 'Aktualisieren' : 'Hinzufügen'}
        </button>
      </div>
    </form>
  )
}

const styles = {
  form: { display: 'flex', flexDirection: 'column', gap: 12 },
  label: { display: 'flex', flexDirection: 'column', gap: 4, fontSize: 14, fontWeight: 500 },
  input: { padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 14, outline: 'none' },
  actions: { display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 },
  btnPrimary: { padding: '8px 16px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 },
  btnSecondary: { padding: '8px 16px', background: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db', borderRadius: 6, cursor: 'pointer' },
  error: { background: '#fee2e2', color: '#b91c1c', padding: '8px 12px', borderRadius: 6, fontSize: 14 },
}
