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

const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mern-job-board';
const jwtSecret = process.env.JWT_SECRET || 'dev-secret-change-me';

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true }
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

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

// GET all jobs
app.get('/api/jobs', async (req, res) => {
  try {
    await connectDb();
    const jobs = await Job.find().sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ error: error.message });
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
    app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
  } catch (error) {
    console.error('Server startup error:', error);
    process.exit(1);
  }
})();

module.exports = app;
