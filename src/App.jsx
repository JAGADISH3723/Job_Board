import { useEffect, useMemo, useState } from 'react'
import './App.css'
import Navbar from './components/Navbar'
import JobCard from './components/JobCard'
import StatsBar from './components/StatsBar'
import JobDetailsModal from './components/JobDetailsModal'
import JobForm from './pages/JobForm'
import FeatureBlock from './pages/FeatureBlock'
import { apiUrl } from './api'

const features = [
  {
    title: 'AI-powered job descriptions',
    description: 'Generate polished, recruiter-friendly listings from a few input details.',
    icon: '🤖'
  },
  {
    title: 'Search & smart filters',
    description: 'Find roles instantly by keyword, job type, and location.',
    icon: '🔍'
  },
  {
    title: 'Save & apply in seconds',
    description: 'Bookmark roles you love and apply with a quick, guided form.',
    icon: '🚀'
  }
]

const getInitialTheme = () => {
  const saved = localStorage.getItem('jobboard-theme')
  if (saved) return saved
  const prefersDark =
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  return prefersDark ? 'dark' : 'light'
}

const getSavedIds = () => {
  try {
    return JSON.parse(localStorage.getItem('jobboard-saved') || '[]')
  } catch {
    return []
  }
}

function App() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [activeQuery, setActiveQuery] = useState('')
  const [sortOption, setSortOption] = useState('newest')
  const [typeFilter, setTypeFilter] = useState('All')
  const [locationFilter, setLocationFilter] = useState('All')
  const [filterOptions, setFilterOptions] = useState({ types: [], locations: [] })
  const [stats, setStats] = useState(null)
  const [theme, setTheme] = useState(getInitialTheme)
  const [savedIds, setSavedIds] = useState(getSavedIds)
  const [tab, setTab] = useState('all')
  const [selectedJob, setSelectedJob] = useState(null)

  // Persist + apply theme
  useEffect(() => {
    localStorage.setItem('jobboard-theme', theme)
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  // Persist saved jobs
  useEffect(() => {
    localStorage.setItem('jobboard-saved', JSON.stringify(savedIds))
  }, [savedIds])

  const loadJobs = (search = activeQuery, sort = sortOption, type = typeFilter, location = locationFilter) => {
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.set('q', search)
    if (sort) params.set('sort', sort)
    if (type && type !== 'All') params.set('type', type)
    if (location && location !== 'All') params.set('location', location)

    fetch(apiUrl(`/api/jobs?${params.toString()}`))
      .then((res) => res.json())
      .then((data) => setJobs(Array.isArray(data) ? data : []))
      .catch(() => setJobs([]))
      .finally(() => setLoading(false))
  }

  const loadStats = () => {
    fetch(apiUrl('/api/stats'))
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch(() => setStats(null))
  }

  const loadFilterOptions = () => {
    fetch(apiUrl('/api/jobs/filters'))
      .then((res) => res.json())
      .then((data) => setFilterOptions(data))
      .catch(() => setFilterOptions({ types: [], locations: [] }))
  }

  // Reload list when server-side controls change
  useEffect(() => {
    loadJobs(activeQuery, sortOption, typeFilter, locationFilter)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeQuery, sortOption, typeFilter, locationFilter])

  useEffect(() => {
    loadStats()
    loadFilterOptions()
  }, [])

  const refreshAfterMutation = () => {
    loadStats()
    loadFilterOptions()
  }

  const addJob = (job) => {
    setJobs((prev) => [job, ...prev])
    refreshAfterMutation()
  }

  const handleSearchSubmit = (event) => {
    event.preventDefault()
    setActiveQuery(query.trim())
  }

  const clearSearch = () => {
    setQuery('')
    setActiveQuery('')
  }

  const resetFilters = () => {
    setQuery('')
    setActiveQuery('')
    setTypeFilter('All')
    setLocationFilter('All')
    setSortOption('newest')
  }

  const toggleSave = (id) => {
    setSavedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))

  const displayedJobs = useMemo(() => {
    if (tab === 'saved') return jobs.filter((job) => savedIds.includes(job._id))
    return jobs
  }, [jobs, savedIds, tab])

  const hasActiveFilters = activeQuery || typeFilter !== 'All' || locationFilter !== 'All'

  return (
    <div className="app-shell">
      <Navbar
        theme={theme}
        onToggleTheme={toggleTheme}
        savedCount={savedIds.length}
        onShowSaved={() => {
          setTab('saved')
          document.getElementById('jobs')?.scrollIntoView({ behavior: 'smooth' })
        }}
      />

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

        <StatsBar stats={stats} />

        <section id="features" className="feature-grid">
          {features.map((feature) => (
            <FeatureBlock key={feature.title} title={feature.title} description={feature.description} icon={feature.icon} />
          ))}
        </section>

        <section id="jobs" className="jobs-panel">
          <div className="jobs-header">
            <div>
              <span className="section-label">Open roles</span>
              <h2>Job board</h2>
            </div>
            <div className="tabs">
              <button
                type="button"
                className={tab === 'all' ? 'is-active' : ''}
                onClick={() => setTab('all')}
              >
                All jobs
              </button>
              <button
                type="button"
                className={tab === 'saved' ? 'is-active' : ''}
                onClick={() => setTab('saved')}
              >
                Saved ({savedIds.length})
              </button>
            </div>
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
                {(query || activeQuery) && (
                  <button type="button" className="clear-button" onClick={clearSearch}>
                    Clear
                  </button>
                )}
              </div>
            </form>

            <div className="filter-group">
              <div className="filter-box">
                <label htmlFor="type">Type</label>
                <select id="type" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                  <option value="All">All types</option>
                  {filterOptions.types.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div className="filter-box">
                <label htmlFor="location">Location</label>
                <select id="location" value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)}>
                  <option value="All">All locations</option>
                  {filterOptions.locations.map((l) => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>

              <div className="filter-box">
                <label htmlFor="sort">Sort</label>
                <select id="sort" value={sortOption} onChange={(e) => setSortOption(e.target.value)}>
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                  <option value="company">Company</option>
                  <option value="title">Title</option>
                </select>
              </div>
            </div>
          </div>

          <div className="results-summary">
            <span>
              {tab === 'saved'
                ? `${displayedJobs.length} saved ${displayedJobs.length === 1 ? 'job' : 'jobs'}`
                : `${displayedJobs.length} ${displayedJobs.length === 1 ? 'job' : 'jobs'} found${activeQuery ? ` for "${activeQuery}"` : ''}`}
            </span>
            {tab === 'all' && hasActiveFilters && (
              <button type="button" className="reset-link" onClick={resetFilters}>
                Reset filters
              </button>
            )}
          </div>

          {loading ? (
            <div className="job-grid">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="job-card job-card--skeleton" aria-hidden="true" />
              ))}
            </div>
          ) : displayedJobs.length ? (
            <div className="job-grid">
              {displayedJobs.map((job) => (
                <JobCard
                  key={job._id}
                  job={job}
                  onView={setSelectedJob}
                  onToggleSave={toggleSave}
                  saved={savedIds.includes(job._id)}
                />
              ))}
            </div>
          ) : (
            <div className="status-card">
              {tab === 'saved'
                ? 'No saved jobs yet. Tap “Save job” on any listing to bookmark it here.'
                : hasActiveFilters
                  ? 'No jobs match your search or filters. Try adjusting them.'
                  : 'No jobs found yet. Publish the first job below.'}
            </div>
          )}
        </section>

        <JobForm onCreate={addJob} />
      </main>

      {selectedJob && (
        <JobDetailsModal
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
          onToggleSave={toggleSave}
          saved={savedIds.includes(selectedJob._id)}
        />
      )}
    </div>
  )
}

export default App
