const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Job = require('./models/Job');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mern-job-board')
  .catch(err => console.error('MongoDB connection error:', err));

// GET all jobs
app.get('/api/jobs', async (req, res) => {
  const jobs = await Job.find().sort({ createdAt: -1 });
  res.json(jobs);
});

// POST a new job
app.post('/api/jobs', async (req, res) => {
  try {
    const newJob = new Job(req.body);
    await newJob.save();
    res.status(201).json(newJob);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = app;

const PORT = process.env.PORT || 5000;
if (require.main === module) {
  mongoose.connection.once('open', () => {
    app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
  });
}