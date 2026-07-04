import { useEffect, useState } from 'react'
import './App.css'
import Navbar from './components/Navbar'
import JobCard from './components/JobCard'
import JobForm from './pages/JobForm'
import FeatureBlock from './pages/FeatureBlock'

const features = [
  {
    title: 'AI-powered job descriptions',
    description: 'Generate polished, recruiter-friendly listings from a few input details.',
    icon: '🤖'
  },
  {
    title: 'Keyword search',
    description: 'Search jobs by title, company, location or description instantly.',
    icon: '🔍'
  },
  {
    title: 'Fast job posting',
    description: 'Create and publish a job in seconds with guided fields.',
    icon: '🚀'
  }
]

function App() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [sortOption, setSortOption] = useState('newest')

  const loadJobs = (search = '', sort = sortOption) => {
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.set('q', search)
    if (sort) params.set('sort', sort)

    fetch(`/api/jobs?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => setJobs(data))
      .catch(() => setJobs([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadJobs()
  }, [sortOption])

  const addJob = (job) => {
    setJobs((prev) => [job, ...prev])
  }

  const handleSearchSubmit = (event) => {
    event.preventDefault()
    loadJobs(query)
  }

  const clearSearch = () => {
    setQuery('')
    loadJobs('')
  }

  return (
    <div className="app-shell">
      <Navbar />

      <main className="page-content">
        <section className="hero-banner">
          <div className="hero-copy">
            <span className="hero-tag">AI Job Board</span>
            <h1>Build, discover, and hire talent faster.</h1>
            <p>Smart job posting, search, and listing tools for developers and hiring teams.</p>
          </div>
          <div className="hero-summary">
            <div className="summary-card">
              <h3>Instant job discovery</h3>
              <p>Search by title, company, location, or skill and get relevant roles immediately.</p>
            </div>
            <div className="summary-card">
              <h3>AI-ready workflow</h3>
              <p>Generate polished descriptions, track applications, and publish faster.</p>
            </div>
          </div>
        </section>

        <section className="feature-grid">
          {features.map((feature) => (
            <FeatureBlock key={feature.title} title={feature.title} description={feature.description} icon={feature.icon} />
          ))}
        </section>

        <section className="jobs-panel">
          <div className="jobs-header">
            <div>
              <span className="section-label">Open roles</span>
              <h2>Job board</h2>
            </div>
            <div className="job-count">{jobs.length} jobs available</div>
          </div>

          <div className="controls-row">
            <form className="search-bar" onSubmit={handleSearchSubmit}>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by title, company, location, or keywords"
                aria-label="Search jobs"
              />
              <div className="search-actions">
                <button type="submit">Search</button>
                {query && (
                  <button type="button" className="clear-button" onClick={clearSearch}>
                    Clear
                  </button>
                )}
              </div>
            </form>

            <div className="sort-box">
              <label htmlFor="sort">Sort</label>
              <select id="sort" value={sortOption} onChange={(e) => setSortOption(e.target.value)}>
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="company">Company</option>
              </select>
            </div>
          </div>

          <p className="search-hint">
            {query ? `Showing results for "${query}".` : 'Showing all jobs. Type a keyword and search to refine the list.'}
          </p>

          {loading ? (
            <div className="status-card">Loading jobs…</div>
          ) : jobs.length ? (
            <div className="job-grid">
              {jobs.map((job) => (
                <JobCard key={job._id} job={job} />
              ))}
            </div>
          ) : (
            <div className="status-card">
              {query
                ? `No jobs found for "${query}". Try another search term.`
                : 'No jobs found yet. Publish the first job below.'}
            </div>
          )}
        </section>

        <JobForm onCreate={addJob} />
      </main>
    </div>
  )
}

export default App
