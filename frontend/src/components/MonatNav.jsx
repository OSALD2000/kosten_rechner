const MONATE = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez']

export default function MonatNav({ monate, aktiv, onSelect }) {
  if (!monate?.length) return null

  return (
    <div style={styles.wrap}>
      {monate.map((m) => {
        const aktiv_ = aktiv?.jahr === m.jahr && aktiv?.monat === m.monat
        return (
          <button
            key={`${m.jahr}-${m.monat}`}
            onClick={() => onSelect(m)}
            style={{ ...styles.btn, ...(aktiv_ ? styles.aktiv : {}) }}
          >
            {MONATE[m.monat - 1]} {m.jahr}
          </button>
        )
      })}
    </div>
  )
}

const styles = {
  wrap: { display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 },
  btn: { padding: '6px 12px', borderRadius: 6, border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer', fontSize: 13 },
  aktiv: { background: '#2563eb', color: '#fff', border: '1px solid #2563eb', fontWeight: 600 },
}
