# Week09 報名系統專案

## 1. 啟動後端

1. 進入 server 資料夾：

```bash
cd Week09/server
```

2. 安裝套件：

```bash
npm install
```

3. 啟動開發伺服器：

```bash
npm run dev
```

* 伺服器預設運行在 `http://localhost:3001`
* 自動建立 `data/signups.json`

---

## 2. 啟動前端

* 使用 **Live Server** 或 **Vite** 開啟 `client/signup_form.html`
* 填寫表單 → 送出 → 下方顯示成功或錯誤訊息
* 點擊「查看報名清單」查看所有報名資料

---

## 3. API 端點與測試

### GET /api/signup

* 取得所有報名資料

```bash
curl http://localhost:3001/api/signup
```

### POST /api/signup

* 新增報名資料

```bash
curl -X POST http://localhost:3001/api/signup -H "Content-Type: application/json" -d "{
  \"name\": \"測試用\",
  \"email\": \"test@example.com\",
  \"phone\": \"0912345678\",
  \"password\": \"demoPass88\",
  \"confirmPassword\": \"demoPass88\",
  \"interests\": [\"後端入門\"],
  \"terms\": true
}"
```

### 測試方式

* **VS Code REST Client**：使用 `tests/api.http` 內的 GET/POST 範例
* **curl**：如上命令
* **前端表單**：`signup_form.html`


