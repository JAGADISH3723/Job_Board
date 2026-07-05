export default function JobCard({ job, onView, onToggleSave, saved }) {
  const posted = job.createdAt ? new Date(job.createdAt).toLocaleDateString() : 'Recently'

  return (
    <article className="job-card">
      <div className="job-card-header">
        <div>
          <h3>{job.title}</h3>
          <p>{job.company} · {job.location}</p>
        </div>
        <span className={`job-tag job-tag--${(job.type || '').toLowerCase().replace(/\s+/g, '-')}`}>
          {job.type}
        </span>
      </div>

      <p className="job-description">{job.description}</p>

      <div className="job-meta">
        <span>💰 {job.salary || 'Competitive salary'}</span>
        <span>📅 Posted {posted}</span>
      </div>

      <div className="job-actions">
        <button type="button" onClick={() => onView(job)}>
          View details
        </button>
        <button
          type="button"
          className={`secondary${saved ? ' is-saved' : ''}`}
          onClick={() => onToggleSave(job._id)}
          aria-pressed={saved}
        >
          {saved ? '★ Saved' : '☆ Save job'}
        </button>
      </div>
    </article>
  )
}
