import { useEffect, useState } from 'react'

export default function JobDetailsModal({ job, onClose, onToggleSave, saved }) {
  const [showApply, setShowApply] = useState(false)
  const [applicant, setApplicant] = useState({ name: '', email: '', message: '' })
  const [status, setStatus] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [applied, setApplied] = useState(false)

  // Close on Escape
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  if (!job) return null

  const posted = job.createdAt ? new Date(job.createdAt).toLocaleDateString() : 'Recently'

  const submitApplication = async (event) => {
    event.preventDefault()
    if (!applicant.name || !applicant.email) {
      setStatus('Name and email are required.')
      return
    }
    setSubmitting(true)
    setStatus('Submitting your application…')
    try {
      const res = await fetch(`/api/jobs/${job._id}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(applicant)
      })
      const data = await res.json()
      if (res.ok) {
        setApplied(true)
        setStatus('')
      } else {
        setStatus(data.error || 'Could not submit application.')
      }
    } catch (error) {
      setStatus('Unable to reach the server. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
          ✕
        </button>

        <div className="modal-header">
          <span className={`job-tag job-tag--${(job.type || '').toLowerCase().replace(/\s+/g, '-')}`}>
            {job.type}
          </span>
          <h2>{job.title}</h2>
          <p className="modal-company">{job.company} · {job.location}</p>
        </div>

        <div className="modal-meta">
          <span>💰 {job.salary || 'Competitive salary'}</span>
          <span>📅 Posted {posted}</span>
        </div>

        <div className="modal-body">
          <h3>About this role</h3>
          <p>{job.description || 'No description provided.'}</p>
        </div>

        {!showApply && !applied && (
          <div className="modal-actions">
            <button type="button" onClick={() => setShowApply(true)}>Apply now</button>
            <button
              type="button"
              className={`secondary${saved ? ' is-saved' : ''}`}
              onClick={() => onToggleSave(job._id)}
            >
              {saved ? '★ Saved' : '☆ Save job'}
            </button>
          </div>
        )}

        {showApply && !applied && (
          <form className="apply-form" onSubmit={submitApplication}>
            <h3>Apply for this role</h3>
            <div className="grid-two">
              <input
                placeholder="Full name"
                value={applicant.name}
                onChange={(e) => setApplicant((p) => ({ ...p, name: e.target.value }))}
                required
              />
              <input
                type="email"
                placeholder="Email address"
                value={applicant.email}
                onChange={(e) => setApplicant((p) => ({ ...p, email: e.target.value }))}
                required
              />
            </div>
            <textarea
              rows="4"
              placeholder="Why are you a great fit? (optional)"
              value={applicant.message}
              onChange={(e) => setApplicant((p) => ({ ...p, message: e.target.value }))}
            />
            <div className="form-footer">
              <button type="submit" disabled={submitting}>
                {submitting ? 'Submitting…' : 'Submit application'}
              </button>
              <button type="button" className="secondary" onClick={() => setShowApply(false)}>
                Cancel
              </button>
              {status && <span className="status-text">{status}</span>}
            </div>
          </form>
        )}

        {applied && (
          <div className="apply-success">
            <div className="apply-success-icon">✅</div>
            <h3>Application submitted!</h3>
            <p>Thanks {applicant.name.split(' ')[0] || 'there'} — {job.company} has received your application for {job.title}.</p>
            <button type="button" onClick={onClose}>Done</button>
          </div>
        )}
      </div>
    </div>
  )
}
