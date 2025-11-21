import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import signupRouter from './routes/signup.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || '*';

app.use(cors({ origin: ALLOWED_ORIGIN }));
app.use(express.json());

// API 路由
app.use('/api/signup', signupRouter);

// 測試根目錄
app.get('/', (req, res) => res.send('Server is running'));

// 全域錯誤處理
app.use((err, req, res, next) => {
  console.error('💥 全域錯誤:', err);
  res.status(500).json({ error: err.message, stack: err.stack });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
