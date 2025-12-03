## Week11 Lab：報名資料庫實作
環境需求

Node.js >= 18

npm

Docker & Docker Compose

MongoDB Compass（可選，用於查看資料）

啟動指令

啟動 MongoDB 容器：

cd Week11/docker
docker compose up -d
docker ps      # 驗證容器狀態


安裝 Node.js 依賴：

cd ../server
npm install


啟動後端伺服器：

npm run dev


瀏覽器或 Postman 呼叫 API：

POST /api/signup 建立報名

GET /api/signup?page=1&limit=10 取得報名清單（含分頁）

PATCH /api/signup/:id 更新 phone 或 status

DELETE /api/signup/:id 刪除報名

環境變數 (.env)
MONGO_URI=mongodb://<user>:<password>@localhost:27017/<dbName>
PORT=3001


MONGO_URI：MongoDB 連線字串

PORT：後端伺服器埠號

測試方式

使用 REST Client / Postman 匯入 tests/api.http

使用 mongosh 驗證資料：

mongosh
use <dbName>
db.participants.find().pretty()