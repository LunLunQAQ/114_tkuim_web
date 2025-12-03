db.createUser({
  user: 'week11-user',
  pwd: 'week11-pass',
  roles: [{ role: 'readWrite', db: 'week11' }]
});

db.createCollection('participants');

// 建立唯一索引
db.participants.createIndex({ email: 1 }, { unique: true });

// 插入測試資料
db.participants.insertOne({
  name: '示範學員',
  email: 'demo@example.com',
  phone: '0912345678',
  createdAt: new Date()
});

print('✅ Database initialized with unique email index');