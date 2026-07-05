import { useState } from 'react'

export default function JobForm({ onCreate }) {
  const [form, setForm] = useState({ title: '', company: '', location: '', salary: '', type: 'Full-time', keyPoints: '', description: '' })
  const [status, setStatus] = useState('')
  const [generating, setGenerating] = useState(false)
  const [auth, setAuth] = useState({ email: 'demo@jobboard.dev', password: 'demo1234', token: localStorage.getItem('jobboard-token') || '' })

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
      console.error(error)
      setStatus('Unable to generate description. Please try again.')
    } finally {
      setGenerating(false)
    }
  }

  const login = async () => {
    setStatus('Signing in...')
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: auth.email, password: auth.password })
      })
      const data = await response.json()

      if (!response.ok) {
        setStatus(data.error || 'Login failed')
        return
      }

      localStorage.setItem('jobboard-token', data.token)
      setAuth((prev) => ({ ...prev, token: data.token }))
      setStatus('Signed in successfully.')
    } catch (error) {
      setStatus('Unable to sign in right now.')
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!auth.token) {
      setStatus('Please sign in first.')
      return
    }

    setStatus('Saving job...')

    try {
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.token}`
        },
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
      console.error(error)
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

      <div className="demo-access">
        <div className="demo-access-head">
          <span className="demo-access-title">Demo access</span>
          {auth.token
            ? <span className="demo-badge demo-badge--on">● Signed in</span>
            : <span className="demo-badge">Sign in to post a job</span>}
        </div>
        <div className="demo-access-row">
          <input value={auth.email} onChange={(e) => setAuth((prev) => ({ ...prev, email: e.target.value }))} placeholder="Email" />
          <input type="password" value={auth.password} onChange={(e) => setAuth((prev) => ({ ...prev, password: e.target.value }))} placeholder="Password" />
          <button type="button" onClick={login}>{auth.token ? 'Re-authenticate' : 'Sign in'}</button>
        </div>
        <p className="demo-hint">Demo credentials are pre-filled — just click sign in.</p>
      </div>

      <form onSubmit={handleSubmit} className="job-form">
        <div className="grid-two">
          <input name="title" value={form.title} onChange={handleChange} placeholder="Job title" required />
          <input name="company" value={form.company} onChange={handleChange} placeholder="Company" required />
        </div>

        <div className="grid-three">
          <input name="location" value={form.location} onChange={handleChange} placeholder="Location" required />
          <input name="salary" value={form.salary} onChange={handleChange} placeholder="Salary range (e.g. 80000-120000)" pattern="\d+(?:\s*-\s*\d+)?" title="Use a number or a numeric range such as 80000-120000" />
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
