import connect from '../lib/mongodb.js';
import Job from '../lib/models/Job.js';

export default async function handler(req, res) {
  await connect();

  if (req.method === 'GET') {
    const { q } = req.query;
    const filter = q
      ? {
          $or: [
            { title: { $regex: q, $options: 'i' } },
            { company: { $regex: q, $options: 'i' } },
            { location: { $regex: q, $options: 'i' } },
            { description: { $regex: q, $options: 'i' } }
          ]
        }
      : {};

    const jobs = await Job.find(filter).sort({ createdAt: -1 });
    return res.status(200).json(jobs);
  }

  if (req.method === 'POST') {
    try {
      const job = new Job(req.body);
      await job.save();
      return res.status(201).json(job);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
