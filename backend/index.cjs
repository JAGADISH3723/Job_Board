const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Job = require('./models/Job.cjs');
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

// Generate AI-powered job description
app.post('/api/generate-description', async (req, res) => {
  const { title, company, location, salary, type, keyPoints } = req.body;

  if (!title || !company || !location) {
    return res.status(400).json({ error: 'title, company, and location are required' });
  }

  try {
    const OpenAI = require('@openai/openai');
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const prompt = `Write a polished job description for a ${type} role titled ${title} at ${company}, located in ${location}. The salary is ${salary || 'competitive'}. Include the following strengths: ${keyPoints || 'team culture, growth, and impact'}.`;

    const response = await client.responses.create({
      model: 'gpt-4.1-mini',
      input: prompt,
      max_output_tokens: 300
    });

    const text = response.output?.[0]?.content?.[0]?.text || '';
    return res.status(200).json({ description: text.trim() });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Unable to generate description' });
  }
});

const PORT = process.env.PORT || 5000;
mongoose.connection.once('open', () => {
  app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
});

module.exports = app;
