export default function Navbar({ theme, onToggleTheme, savedCount, onShowSaved }) {
  return (
    <header className="site-header">
      <div className="header-inner">
        <div className="brand-group">
          <span className="brand-pill">Jobify</span>
          <h1>AI Job Board</h1>
        </div>
        <nav className="nav-links">
          <a href="#jobs">Jobs</a>
          <a href="#post">Post</a>
          <a href="#features">Features</a>
          <button type="button" className="nav-saved" onClick={onShowSaved}>
            ★ Saved
            {savedCount > 0 && <span className="nav-saved-badge">{savedCount}</span>}
          </button>
          <button
            type="button"
            className="theme-toggle"
            onClick={onToggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </nav>
      </div>
    </header>
  )
}
