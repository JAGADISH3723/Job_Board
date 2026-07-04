import { useState } from 'react'

export default function JobForm({ onCreate }) {
  const [form, setForm] = useState({ title: '', company: '', location: '', salary: '', type: 'Full-time', keyPoints: '', description: '' })
  const [status, setStatus] = useState('')
  const [generating, setGenerating] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const generateDescription = async () => {
    if (!form.title || !form.company || !form.location) {
      setStatus('Enter title, company, and location first.')
      return
    }

    setGenerating(true)
    setStatus('Generating job description...')

    try {
      const response = await fetch('/api/generate-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          company: form.company,
          location: form.location,
          salary: form.salary,
          type: form.type,
          keyPoints: form.keyPoints
        })
      })
      const data = await response.json()

      if (response.ok) {
        setForm((prev) => ({ ...prev, description: data.description || prev.description }))
        setStatus('Description generated. You can edit it before publishing.')
      } else {
        setStatus(data.error || 'Could not generate description.')
      }
    } catch (error) {
      setStatus('Unable to generate description. Please try again.')
    } finally {
      setGenerating(false)
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setStatus('Saving job...')

    try {
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      const data = await response.json()

      if (response.ok) {
        onCreate(data)
        setForm({ title: '', company: '', location: '', salary: '', type: 'Full-time', keyPoints: '', description: '' })
        setStatus('Job posted successfully.')
      } else {
        setStatus(data.error || 'Could not save job.')
      }
    } catch (error) {
      setStatus('Unable to reach the server. Please try again.')
    }
  }

  return (
    <section id="post" className="job-form-card">
      <div className="section-heading">
        <span className="section-label">Publish a role</span>
        <h2>Create a job listing</h2>
        <p>Use the form to launch a new listing quickly. Add details and let the board do the rest.</p>
      </div>

      <form onSubmit={handleSubmit} className="job-form">
        <div className="grid-two">
          <input name="title" value={form.title} onChange={handleChange} placeholder="Job title" required />
          <input name="company" value={form.company} onChange={handleChange} placeholder="Company" required />
        </div>

        <div className="grid-three">
          <input name="location" value={form.location} onChange={handleChange} placeholder="Location" required />
          <input name="salary" value={form.salary} onChange={handleChange} placeholder="Salary range" />
          <select name="type" value={form.type} onChange={handleChange}>
            <option>Full-time</option>
            <option>Part-time</option>
            <option>Contract</option>
            <option>Remote</option>
          </select>
        </div>

        <input name="keyPoints" value={form.keyPoints} onChange={handleChange} placeholder="Key bullets (e.g. remote, growth, collaborative team)" />

        <div className="description-row">
          <textarea name="description" value={form.description} onChange={handleChange} rows="6" placeholder="Job description"></textarea>
          <button type="button" className="generate-button" onClick={generateDescription} disabled={generating}>
            {generating ? 'Generating…' : 'Generate description'}
          </button>
        </div>

        <div className="form-footer">
          <button type="submit">Publish job</button>
          {status && <span className="status-text">{status}</span>}
        </div>
      </form>
    </section>
  )
}
