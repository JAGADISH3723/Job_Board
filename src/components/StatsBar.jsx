export default function StatsBar({ stats }) {
  if (!stats) return null

  const tiles = [
    { label: 'Open roles', value: stats.total, icon: '📋' },
    { label: 'Remote roles', value: stats.remote, icon: '🌍' },
    { label: 'Hiring companies', value: stats.companies, icon: '🏢' }
  ]

  const maxTypeCount = Math.max(1, ...(stats.byType || []).map((t) => t.count))

  return (
    <section className="stats-bar" aria-label="Job board statistics">
      <div className="stat-tiles">
        {tiles.map((tile) => (
          <div key={tile.label} className="stat-tile">
            <span className="stat-icon">{tile.icon}</span>
            <div>
              <div className="stat-value">{tile.value}</div>
              <div className="stat-label">{tile.label}</div>
            </div>
          </div>
        ))}
      </div>

      {stats.byType && stats.byType.length > 0 && (
        <div className="stat-breakdown">
          <div className="stat-breakdown-title">Roles by type</div>
          <div className="stat-bars">
            {stats.byType.map((t) => (
              <div key={t.type} className="stat-bar-row">
                <span className="stat-bar-label">{t.type}</span>
                <div className="stat-bar-track">
                  <div
                    className="stat-bar-fill"
                    style={{ width: `${(t.count / maxTypeCount) * 100}%` }}
                  />
                </div>
                <span className="stat-bar-count">{t.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
