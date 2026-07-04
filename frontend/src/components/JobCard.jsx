export default function JobCard({ job }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-bold text-gray-800">{job.title}</h2>
          <p className="text-blue-600 font-medium">{job.company}</p>
        </div>
        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
          {job.type}
        </span>
      </div>
      <div className="mt-4 flex gap-4 text-sm text-gray-500">
        <span>📍 {job.location}</span>
        <span>💰 {job.salary}</span>
      </div>
      <button className="mt-6 w-full md:w-max bg-gray-900 text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition">
        View Details
      </button>
    </div>
  );
}