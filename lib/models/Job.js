import mongoose from 'mongoose';

const JobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  company: { type: String, required: true },
  location: { type: String, required: true },
  salary: { type: String, default: 'Competitive' },
  type: { type: String, default: 'Full-time' },
  description: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

const Job = mongoose.models.Job || mongoose.model('Job', JobSchema);
export default Job;
