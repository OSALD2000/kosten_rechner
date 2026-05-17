export default function Zusammenfassung({ data }) {
  if (!data) return null

  const kategorien = Object.entries(data.nach_kategorie).sort((a, b) => b[1] - a[1])

  return (
    <div style={styles.card}>
      <div style={styles.gesamt}>
        <span style={styles.label}>Gesamt</span>
        <span style={styles.betrag}>{Number(data.gesamt).toFixed(2)} €</span>
      </div>
      <div style={styles.label2}>{data.anzahl} Ausgaben</div>
      {kategorien.length > 0 && (
        <div style={styles.list}>
          {kategorien.map(([kat, val]) => (
            <div key={kat} style={styles.row}>
              <span style={styles.kat}>{kat}</span>
              <span style={styles.val}>{Number(val).toFixed(2)} €</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const styles = {
  card: { background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 16 },
  gesamt: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 2 },
  label: { fontSize: 12, color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' },
  label2: { fontSize: 12, color: '#9ca3af', marginBottom: 12 },
  betrag: { fontSize: 24, fontWeight: 700 },
  list: { display: 'flex', flexDirection: 'column', gap: 4, borderTop: '1px solid #f3f4f6', paddingTop: 10 },
  row: { display: 'flex', justifyContent: 'space-between', fontSize: 13 },
  kat: { color: '#374151' },
  val: { fontWeight: 600 },
}
