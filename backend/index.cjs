const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Job = require('./models/Job.cjs');
const { validateJobPayload } = require('./utils/validation.cjs');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/mern-job-board';
const jwtSecret = process.env.JWT_SECRET || 'dev-secret-change-me';

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true }
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

const ApplicationSchema = new mongoose.Schema({
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  message: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

const Application = mongoose.models.Application || mongoose.model('Application', ApplicationSchema);

async function connectDb() {
  if (mongoose.connection.readyState === 1) return;
  await mongoose.connect(mongoUri, { dbName: 'mern-job-board' });
}

async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
  if (!token) return res.status(401).json({ error: 'Authentication required' });

  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

async function ensureSeedUser() {
  await connectDb();
  const existing = await User.findOne({ email: 'demo@jobboard.dev' });
  if (!existing) {
    const passwordHash = await bcrypt.hash('demo1234', 10);
    await User.create({ email: 'demo@jobboard.dev', passwordHash });
  }
}

// Seed a handful of realistic jobs so search, filters, and stats are visible on a fresh DB.
async function ensureSeedJobs() {
  await connectDb();
  const count = await Job.estimatedDocumentCount();
  if (count > 0) return;

  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;
  const sampleJobs = [
    { title: 'Senior Frontend Engineer', company: 'Nimbus Labs', location: 'Remote', salary: '120000-150000', type: 'Remote', description: 'Own our React design system and ship delightful, accessible UIs. Work with a small, senior team that values craft, autonomy, and fast iteration.', createdAt: new Date(now - 1 * day) },
    { title: 'Backend Developer (Node.js)', company: 'Orbit Pay', location: 'Bengaluru, India', salary: '90000-120000', type: 'Full-time', description: 'Build reliable payment APIs with Node.js, Express, and MongoDB. You will design services that move real money at scale with strong testing culture.', createdAt: new Date(now - 2 * day) },
    { title: 'Full-Stack MERN Developer', company: 'BrightHire', location: 'Hyderabad, India', salary: '80000-110000', type: 'Full-time', description: 'Join a product team building a modern hiring platform end to end with MongoDB, Express, React, and Node. Ownership from idea to production.', createdAt: new Date(now - 3 * day) },
    { title: 'UI/UX Designer', company: 'Nimbus Labs', location: 'Remote', salary: '70000-95000', type: 'Contract', description: 'Design clean, usable interfaces and prototypes. Partner closely with engineers to turn research into shipped experiences.', createdAt: new Date(now - 5 * day) },
    { title: 'DevOps Engineer', company: 'Orbit Pay', location: 'Pune, India', salary: '100000-130000', type: 'Full-time', description: 'Automate CI/CD, own our AWS infrastructure, and champion observability. Kubernetes, Terraform, and a strong reliability mindset.', createdAt: new Date(now - 6 * day) },
    { title: 'Junior Data Analyst', company: 'BrightHire', location: 'Remote', salary: '45000-60000', type: 'Part-time', description: 'Turn product and hiring data into insight with SQL and dashboards. A great first role for someone curious about analytics.', createdAt: new Date(now - 8 * day) }
  ];

  await Job.insertMany(sampleJobs);
}

// Build a Mongo filter + sort from query params.
function buildJobQuery(reqQuery) {
  const { q, type, location, sort } = reqQuery || {};
  const filter = {};

  if (q && String(q).trim()) {
    const term = String(q).trim();
    const rx = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filter.$or = [{ title: rx }, { company: rx }, { location: rx }, { description: rx }];
  }
  if (type && String(type).trim() && String(type) !== 'All') {
    filter.type = String(type).trim();
  }
  if (location && String(location).trim() && String(location) !== 'All') {
    const locRx = new RegExp(String(location).trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filter.location = locRx;
  }

  const sortMap = {
    newest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    company: { company: 1 },
    title: { title: 1 }
  };
  const sortBy = sortMap[sort] || sortMap.newest;

  return { filter, sortBy };
}

// GET all jobs (with search, filter, sort)
app.get('/api/jobs', async (req, res) => {
  try {
    await connectDb();
    const { filter, sortBy } = buildJobQuery(req.query);
    const jobs = await Job.find(filter).sort(sortBy);
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET distinct filter options (used to populate the location/type dropdowns)
app.get('/api/jobs/filters', async (req, res) => {
  try {
    await connectDb();
    const [locations, types] = await Promise.all([
      Job.distinct('location'),
      Job.distinct('type')
    ]);
    res.json({
      locations: locations.filter(Boolean).sort(),
      types: types.filter(Boolean).sort()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET aggregate stats for the dashboard
app.get('/api/stats', async (req, res) => {
  try {
    await connectDb();
    const [total, byType, topCompanies] = await Promise.all([
      Job.estimatedDocumentCount(),
      Job.aggregate([{ $group: { _id: '$type', count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
      Job.aggregate([{ $group: { _id: '$company', count: { $sum: 1 } } }, { $sort: { count: -1 } }, { $limit: 3 }])
    ]);
    const remoteCount = byType
      .filter((t) => t._id === 'Remote')
      .reduce((sum, t) => sum + t.count, 0);

    res.json({
      total,
      remote: remoteCount,
      companies: topCompanies.length,
      byType: byType.map((t) => ({ type: t._id || 'Other', count: t.count })),
      topCompanies: topCompanies.map((c) => ({ company: c._id || 'Unknown', count: c.count }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET a single job
app.get('/api/jobs/:id', async (req, res) => {
  try {
    await connectDb();
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ error: 'Job not found' });
    }
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ error: 'Job not found' });
    res.json(job);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST an application for a job
app.post('/api/jobs/:id/apply', async (req, res) => {
  const { name, email, message } = req.body || {};
  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }
  try {
    await connectDb();
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ error: 'Job not found' });
    }
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ error: 'Job not found' });

    const application = await Application.create({
      jobId: job._id,
      name: String(name).trim(),
      email: String(email).trim(),
      message: String(message || '').trim()
    });
    res.status(201).json({ ok: true, applicationId: application._id });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

  try {
    await connectDb();
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ sub: user._id, email: user.email }, jwtSecret, { expiresIn: '7d' });
    res.json({ token, user: { email: user.email } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST a new job
app.post('/api/jobs', authMiddleware, async (req, res) => {
  try {
    await connectDb();
    const validation = validateJobPayload(req.body);
    if (!validation.isValid) {
      return res.status(400).json({ error: validation.errors[0] });
    }

    const jobPayload = {
      ...req.body,
      salary: String(req.body.salary || 'Competitive').trim(),
      description: req.body.description || '',
      createdAt: new Date()
    };

    const newJob = await Job.create(jobPayload);
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
    const OpenAI = require('openai');
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
(async () => {
  try {
    await connectDb();
    await ensureSeedUser();
    await ensureSeedJobs();
    app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
  } catch (error) {
    console.error('Server startup error:', error);
    process.exit(1);
  }
})();

module.exports = app;
