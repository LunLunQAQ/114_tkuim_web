# 🍜 金鼎餐廳 (Gold Peak Restaurant) - 點餐與管理系統

這是一個基於 MERN Stack 開發的全端點餐系統，旨在提供直觀的菜單管理與現場點餐流程。

## 功能特點
- **菜單管理 (CRUD)**：即時新增、編輯、刪除菜色資料並同步至資料庫。
- **現場點餐**：直觀的購物車介面，支援餐點數量增減與顧客資訊填寫。
- **訂單紀錄**：完整記錄顧客姓名、電話、餐點明細與金額，支援狀態更新（待處理/已完成）。

## 技術棧
- **前端**：React, Tailwind CSS, Lucide Icons
- **後端**：Node.js, Express
- **資料庫**：MongoDB (Community Server 8.2)

## 安裝與運行
1. **啟動資料庫**：確保 MongoDB Service 已在 27017 埠運行。
2. **後端運行**：
   ```bash
   cd backend
   npm install
   npm run dev