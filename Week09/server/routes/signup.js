import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { z } from 'zod';
import { fileURLToPath } from 'url';

const router = Router();

// 取得 __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 資料路徑
const DATA_DIR = path.join(__dirname, '..', 'data');
const DATA_FILE = path.join(DATA_DIR, 'signups.json');

// 確保資料夾存在
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

// 確保 JSON 檔存在，損壞自動修復
const ensureJsonFile = () => {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, '[]', 'utf-8');
    } else {
      // 檢查 JSON 是否可解析
      JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
    }
  } catch (err) {
    console.error('JSON 檔損壞，自動重置:', err);
    fs.writeFileSync(DATA_FILE, '[]', 'utf-8');
  }
};
ensureJsonFile();

// Zod 驗證
const signupSchema = z.object({
  name: z.string().min(2, '姓名至少 2 字元'),
  email: z.string().email('Email 格式錯誤'),
  phone: z.string().regex(/^09\d{8}$/, '手機號碼格式錯誤'),
  password: z.string().min(6, '密碼至少 6 字元'),
  confirmPassword: z.string().min(6, '確認密碼至少 6 字元'),
  interests: z.array(z.string()),
  terms: z.boolean()
});

// 讀取資料
const readData = () => {
  try {
    ensureJsonFile();
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
  } catch (err) {
    console.error('讀取資料失敗:', err);
    return [];
  }
};

// 寫入資料
const writeData = (data) => {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('寫入資料失敗:', err);
    throw err;
  }
};

// POST /api/signup
router.post('/', (req, res) => {
  try {
    console.log('收到 POST /api/signup:', req.body);
    const parsed = signupSchema.parse(req.body);

    if (parsed.password !== parsed.confirmPassword) {
      return res.status(400).json({ error: '密碼與確認密碼不符' });
    }

    const data = readData();
    const id = Date.now();
    data.push({ id, ...parsed });
    writeData(data);
    console.log('寫入資料成功:', data);

    res.json({ message: '報名成功', id });
  } catch (err) {
    console.error('POST 錯誤:', err);
    res.status(400).json({
      error: err.errors ? err.errors.map(e => e.message).join(', ') : err.message
    });
  }
});

// GET /api/signup
router.get('/', (req, res) => {
  try {
    const data = readData();
    res.json({ total: data.length, data });
  } catch (err) {
    console.error('GET 錯誤:', err);
    res.status(500).json({ error: 'Server Error' });
  }
});

export default router;
