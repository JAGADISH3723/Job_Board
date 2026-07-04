export default function JobCard({ job }) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-xl font-semibold text-slate-950">{job.title}</h3>
          <p className="text-sm text-slate-500">{job.company} · {job.location}</p>
        </div>
        <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
          {job.type}
        </span>
      </div>

      <div className="mt-4 space-y-3 text-sm text-slate-600">
        <p>{job.description}</p>
        <div className="flex flex-wrap gap-3 text-slate-500">
          <span>💰 {job.salary || 'Competitive salary'}</span>
          <span>📅 Posted {new Date(job.createdAt).toLocaleDateString()}</span>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <button className="rounded-2xl bg-slate-950 px-5 py-2 text-sm font-semibold text-white transition hover:bg-slate-800">
          View Details
        </button>
        <button className="rounded-2xl border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50">
          Save Job
        </button>
      </div>
    </article>
  )
}
