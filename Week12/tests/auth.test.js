import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongoClient, ObjectId } from 'mongodb';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

dotenv.config();

let app, db, mongoServer, client;
let studentToken, adminToken, studentId, adminId;

const createApp = () => {
  const testApp = express();
  testApp.use(cors());
  testApp.use(express.json());

  const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: '未登入' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        return res.status(403).json({ error: 'Token 無效或已過期' });
      }
      req.user = user;
      next();
    });
  };

  testApp.post('/auth/signup', async (req, res) => {
    try {
      const { username, email, password } = req.body;

      if (!username || !email || !password) {
        return res.status(400).json({ error: '必須提供 username, email, password' });
      }

      const existing = await db.collection('users').findOne({ email });
      if (existing) {
        return res.status(400).json({ error: 'Email 已存在' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const result = await db.collection('users').insertOne({
        username,
        email,
        password: hashedPassword,
        role: 'student',
        createdAt: new Date()
      });

      res.status(201).json({ message: '註冊成功', userId: result.insertedId.toString() });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  testApp.post('/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: '必須提供 email 和 password' });
      }

      const user = await db.collection('users').findOne({ email });
      if (!user) {
        return res.status(401).json({ error: 'Email 或密碼錯誤' });
      }

      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return res.status(401).json({ error: 'Email 或密碼錯誤' });
      }

      const token = jwt.sign(
        { userId: user._id.toString(), email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({
        message: '登入成功',
        token,
        user: {
          id: user._id.toString(),
          username: user.username,
          email: user.email,
          role: user.role
        }
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  testApp.get('/api/signup', authenticateToken, async (req, res) => {
    try {
      let query = {};

      if (req.user.role !== 'admin') {
        query.ownerId = new ObjectId(req.user.userId);
      }

      const records = await db.collection('signups').find(query).toArray();

      const formattedRecords = records.map(record => ({
        ...record,
        _id: record._id.toString(),
        ownerId: record.ownerId.toString()
      }));

      res.json(formattedRecords);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  testApp.post('/api/signup', authenticateToken, async (req, res) => {
    try {
      const { name, email, phone } = req.body;

      if (!name || !email || !phone) {
        return res.status(400).json({ error: '必須提供 name, email, phone' });
      }

      const record = {
        name,
        email,
        phone,
        ownerId: new ObjectId(req.user.userId),
        ownerEmail: req.user.email,
        createdAt: new Date()
      };

      const result = await db.collection('signups').insertOne(record);

      res.status(201).json({
        message: '新增成功',
        recordId: result.insertedId.toString()
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  testApp.delete('/api/signup/:id', authenticateToken, async (req, res) => {
    try {
      let recordId;
      try {
        recordId = new ObjectId(req.params.id);
      } catch (e) {
        return res.status(400).json({ error: '無效的記錄 ID' });
      }

      const record = await db.collection('signups').findOne({ _id: recordId });

      if (!record) {
        return res.status(404).json({ error: '記錄不存在' });
      }

      const isOwner = record.ownerId.toString() === req.user.userId;
      const isAdmin = req.user.role === 'admin';

      if (!isOwner && !isAdmin) {
        return res.status(403).json({ error: '無權限刪除此記錄' });
      }

      await db.collection('signups').deleteOne({ _id: recordId });

      res.json({ message: '刪除成功' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return testApp;
};

beforeAll(async () => {
  if (!process.env.JWT_SECRET) {
    process.env.JWT_SECRET = 'test-secret-key-do-not-use-in-production';
  }

  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  client = new MongoClient(mongoUri);
  await client.connect();
  db = client.db('test-db');

  app = createApp();

  await db.collection('users').createIndex({ email: 1 }, { unique: true });

  const studentPassword = await bcrypt.hash('student123', 10);
  const studentResult = await db.collection('users').insertOne({
    username: 'student1',
    email: 'student@test.com',
    password: studentPassword,
    role: 'student',
    createdAt: new Date()
  });
  studentId = studentResult.insertedId.toString();

  const adminPassword = await bcrypt.hash('admin123', 10);
  const adminResult = await db.collection('users').insertOne({
    username: 'admin',
    email: 'admin@test.com',
    password: adminPassword,
    role: 'admin',
    createdAt: new Date()
  });
  adminId = adminResult.insertedId.toString();

  const studentLogin = await request(app)
    .post('/auth/login')
    .send({ email: 'student@test.com', password: 'student123' });
  studentToken = studentLogin.body.token;

  const adminLogin = await request(app)
    .post('/auth/login')
    .send({ email: 'admin@test.com', password: 'admin123' });
  adminToken = adminLogin.body.token;
});

afterAll(async () => {
  await client.close();
  await mongoServer.stop();
});

describe('認證系統測試', () => {

  describe('POST /auth/signup - 註冊', () => {
    it('應該成功註冊新用戶', async () => {
      const res = await request(app)
        .post('/auth/signup')
        .send({
          username: 'newuser',
          email: 'newuser@test.com',
          password: 'password123'
        });

      expect(res.status).toBe(201);
      expect(res.body.message).toBe('註冊成功');
      expect(res.body.userId).toBeDefined();
    });

    it('重複 email 應該註冊失敗', async () => {
      const res = await request(app)
        .post('/auth/signup')
        .send({
          username: 'duplicate',
          email: 'student@test.com',
          password: 'password123'
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Email 已存在');
    });

    it('缺少必要欄位應該失敗', async () => {
      const res = await request(app)
        .post('/auth/signup')
        .send({
          username: 'testuser'
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('必須提供');
    });
  });

  describe('POST /auth/login - 登入', () => {
    it('應該成功登入並返回 token', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({
          email: 'student@test.com',
          password: 'student123'
        });

      expect(res.status).toBe(200);
      expect(res.body.token).toBeDefined();
      expect(res.body.message).toBe('登入成功');
      expect(res.body.user.email).toBe('student@test.com');
      expect(res.body.user.role).toBe('student');
    });

    it('密碼錯誤應該登入失敗', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({
          email: 'student@test.com',
          password: 'wrongpassword'
        });

      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Email 或密碼錯誤');
    });

    it('不存在的 email 應該登入失敗', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({
          email: 'nonexistent@test.com',
          password: 'password123'
        });

      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Email 或密碼錯誤');
    });

    it('缺少欄位應該失敗', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({ email: 'student@test.com' });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/signup - 查看記錄', () => {
    it('未登入應該被拒絕', async () => {
      const res = await request(app)
        .get('/api/signup');

      expect(res.status).toBe(401);
      expect(res.body.error).toBe('未登入');
    });

    it('無效 token 應該被拒絕', async () => {
      const res = await request(app)
        .get('/api/signup')
        .set('Authorization', 'Bearer invalid.token.here');

      expect(res.status).toBe(403);
      expect(res.body.error).toContain('Token');
    });

    it('學生應該只能查看自己的記錄', async () => {
      await request(app)
        .post('/api/signup')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          name: 'Student Record',
          email: 'student.record@test.com',
          phone: '0912345678'
        });

      const res = await request(app)
        .get('/api/signup')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);

      res.body.forEach(record => {
        expect(record.ownerId).toBe(studentId);
      });
    });

    it('Admin 應該能查看所有記錄', async () => {
      const res = await request(app)
        .get('/api/signup')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('POST /api/signup - 新增記錄', () => {
    it('未登入應該被拒絕', async () => {
      const res = await request(app)
        .post('/api/signup')
        .send({
          name: 'Test',
          email: 'test@test.com',
          phone: '0912345678'
        });

      expect(res.status).toBe(401);
    });

    it('登入後應該能新增記錄', async () => {
      const res = await request(app)
        .post('/api/signup')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          name: 'John Doe',
          email: 'john@test.com',
          phone: '0912345678'
        });

      expect(res.status).toBe(201);
      expect(res.body.message).toBe('新增成功');
      expect(res.body.recordId).toBeDefined();
    });

    it('缺少欄位應該失敗', async () => {
      const res = await request(app)
        .post('/api/signup')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          name: 'John Doe'
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('必須提供');
    });

    it('新增的記錄應該記錄建立者', async () => {
      const createRes = await request(app)
        .post('/api/signup')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          name: 'Alice',
          email: 'alice@test.com',
          phone: '0987654321'
        });

      const recordId = createRes.body.recordId;

      const record = await db.collection('signups').findOne({ _id: new ObjectId(recordId) });
      expect(record.ownerId.toString()).toBe(studentId);
      expect(record.ownerEmail).toBe('student@test.com');
    });
  });

  describe('DELETE /api/signup/:id - 刪除記錄', () => {
    let recordId;

    beforeEach(async () => {
      const createRes = await request(app)
        .post('/api/signup')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          name: 'Delete Test',
          email: 'delete@test.com',
          phone: '0999999999'
        });
      recordId = createRes.body.recordId;
    });

    it('未登入應該被拒絕', async () => {
      const res = await request(app)
        .delete(`/api/signup/${recordId}`);

      expect(res.status).toBe(401);
    });

    it('記錄擁有者應該能刪除自己的記錄', async () => {
      const res = await request(app)
        .delete(`/api/signup/${recordId}`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('刪除成功');

      const deleted = await db.collection('signups').findOne({ _id: new ObjectId(recordId) });
      expect(deleted).toBeNull();
    });

    it('其他學生應該無法刪除他人的記錄', async () => {
      const anotherPassword = await bcrypt.hash('pass123', 10);
      await db.collection('users').insertOne({
        username: 'student2',
        email: 'student2@test.com',
        password: anotherPassword,
        role: 'student',
        createdAt: new Date()
      });

      const loginRes = await request(app)
        .post('/auth/login')
        .send({
          email: 'student2@test.com',
          password: 'pass123'
        });

      const otherToken = loginRes.body.token;

      const deleteRes = await request(app)
        .delete(`/api/signup/${recordId}`)
        .set('Authorization', `Bearer ${otherToken}`);

      expect(deleteRes.status).toBe(403);
      expect(deleteRes.body.error).toBe('無權限刪除此記錄');

      const record = await db.collection('signups').findOne({ _id: new ObjectId(recordId) });
      expect(record).not.toBeNull();
    });

    it('Admin 應該能刪除任何記錄', async () => {
      const deleteRes = await request(app)
        .delete(`/api/signup/${recordId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(deleteRes.status).toBe(200);
      expect(deleteRes.body.message).toBe('刪除成功');

      const deleted = await db.collection('signups').findOne({ _id: new ObjectId(recordId) });
      expect(deleted).toBeNull();
    });

    it('刪除不存在的記錄應該返回 404', async () => {
      const fakeId = new ObjectId();

      const res = await request(app)
        .delete(`/api/signup/${fakeId}`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(404);
      expect(res.body.error).toBe('記錄不存在');
    });

    it('無效的記錄 ID 應該返回 400', async () => {
      const res = await request(app)
        .delete('/api/signup/invalid-id')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(400);
    });
  });

  describe('權限控制完整測試', () => {
    it('流程測試：未登入被拒 → 登入成功 → 新增成功 → 查看成功 → 刪除成功', async () => {
      const unauthorizedRes = await request(app)
        .get('/api/signup');
      expect(unauthorizedRes.status).toBe(401);

      const loginRes = await request(app)
        .post('/auth/login')
        .send({
          email: 'student@test.com',
          password: 'student123'
        });
      expect(loginRes.status).toBe(200);
      const token = loginRes.body.token;

      const createRes = await request(app)
        .post('/api/signup')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Complete Flow Test',
          email: 'flow@test.com',
          phone: '0911111111'
        });
      expect(createRes.status).toBe(201);
      const recordId = createRes.body.recordId;

      const getRes = await request(app)
        .get('/api/signup')
        .set('Authorization', `Bearer ${token}`);
      expect(getRes.status).toBe(200);
      expect(getRes.body.length).toBeGreaterThan(0);

      const deleteRes = await request(app)
        .delete(`/api/signup/${recordId}`)
        .set('Authorization', `Bearer ${token}`);
      expect(deleteRes.status).toBe(200);
    });

    it('Admin 權限測試：可查看所有 + 可刪除任何', async () => {
      const studentRes = await request(app)
        .post('/api/signup')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          name: 'Admin Test Record',
          email: 'admintest@test.com',
          phone: '0922222222'
        });
      const recordId = studentRes.body.recordId;

      const viewRes = await request(app)
        .get('/api/signup')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(viewRes.status).toBe(200);
      expect(viewRes.body.length).toBeGreaterThan(0);

      const deleteRes = await request(app)
        .delete(`/api/signup/${recordId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(deleteRes.status).toBe(200);
    });
  });

  describe('安全性測試', () => {
    it('密碼應該被加密而不是明文存儲', async () => {
      const user = await db.collection('users').findOne({ email: 'student@test.com' });

      expect(user.password).not.toBe('student123');
      expect(user.password).toMatch(/^\$/);
    });

    it('Token 應該包含正確的資訊', async () => {
      const loginRes = await request(app)
        .post('/auth/login')
        .send({
          email: 'student@test.com',
          password: 'student123'
        });

      const token = loginRes.body.token;

      const decoded = jwt.decode(token);

      expect(decoded.email).toBe('student@test.com');
      expect(decoded.role).toBe('student');
      expect(decoded.userId).toBeDefined();
    });

    it('已過期的 token 應該被拒絕', async () => {
      const expiredToken = jwt.sign(
        { userId: studentId, email: 'student@test.com', role: 'student' },
        process.env.JWT_SECRET,
        { expiresIn: '-1s' }
      );

      const res = await request(app)
        .get('/api/signup')
        .set('Authorization', `Bearer ${expiredToken}`);

      expect(res.status).toBe(403);
      expect(res.body.error).toContain('Token');
    });
  });
});