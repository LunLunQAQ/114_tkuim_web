## 認證系統

### 快速開始

```bash
npm install
npm run dev
```



### 測試

```bash
npm test
```

### 帳號列表

| 角色 | Email | 密碼 |
|------|-------|------|
| 學員 | student@test.com | student123 |
| 管理員 | admin@test.com | admin123 |

### 功能

- 用戶註冊/登入（JWT token）
- 學員只能查看/刪除自己的記錄
- Admin 可查看/刪除所有記錄
- 密碼已加密（bcrypt）

### 環境變數

建立 `.env` 檔案：

```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/auth-db
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

### API 端點

- POST /auth/signup - 註冊
- POST /auth/login - 登入
- GET /api/signup - 查看記錄（需要 token）
- POST /api/signup - 新增記錄（需要 token）
- DELETE /api/signup/:id - 刪除記錄（需要 token）

### 檔案結構

```
.
├── package.json
├── .env
├── .env.example
├── .gitignore
├── server.js
├── vitest.config.js
├── README.md
└── tests/
    ├── setup.js
    ├── auth.test.js
    └── api.http
```

