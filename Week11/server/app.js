import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectDB } from './db.js';
import signupRouter from './routes/signup.js';

const app = express();
app.use(cors({ origin: process.env.ALLOWED_ORIGIN }));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

app.use('/api/signup', signupRouter);

app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Server Error' });
});

const port = process.env.PORT || 3001;

connectDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`🚀 Server running on http://localhost:${port}`);
      console.log(`📝 API endpoint: http://localhost:${port}/api/signup`);
    });
  })
  .catch((error) => {
    console.error('Failed to connect MongoDB', error);
    process.exit(1);
  });