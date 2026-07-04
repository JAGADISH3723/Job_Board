export default function Navbar() {
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
        </nav>
      </div>
    </header>
  )
}
