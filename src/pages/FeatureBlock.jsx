export default function FeatureBlock({ title, description, icon }) {
  return (
    <article className="feature-block">
      <div className="feature-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{description}</p>
    </article>
  )
}
