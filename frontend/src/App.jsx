import React, { useEffect, useState } from 'react';
import axios from 'axios';
import JobCard from './components/JobCard';
import Navbar from './components/Navbar';

function App() {
  const [jobs, setJobs] = useState([]);
  const API_URL = import.meta.env.VITE_API_URL || '/api';

  useEffect(() => {
    axios.get(`${API_URL}/jobs`).then(res => setJobs(res.data));
  }, [API_URL]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <header className="bg-blue-600 py-16 text-center text-white">
        <h1 className="text-4xl font-bold">Find Your Dream Tech Job</h1>
        <p className="mt-2 text-blue-100">Browse the latest openings in the MERN ecosystem</p>
      </header>
      
      <main className="max-w-5xl mx-auto py-10 px-4">
        <div className="grid gap-6">
          {jobs.map(job => (
            <JobCard key={job._id} job={job} />
          ))}
        </div>
      </main>
    </div>
  );
}

export default App;