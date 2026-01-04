# 金鼎餐廳 (Gold Peak Restaurant) - 全端點餐與後台管理系統

這是一個為餐飲業量身打造的全端解決方案，採用 **MERN Stack** (MongoDB, Express, React, Node.js) 架構開發。系統整合了直觀的「現場點餐介面」、高效的「菜單維護系統」以及即時的「訂單追蹤中心」。

---

## 核心功能說明

### 1. 菜單管理維護 (Menu Management)
- **完整 CRUD 支援**：管理員可即時進行菜色的新增、讀取、編輯與刪除。
- **資料持久化設計**：所有菜色資訊皆存儲於 MongoDB 雲端/本地資料庫，確保系統重啟後資料不遺失。
- **智慧分類系統**：預設支援主菜、湯品、前菜分類，便於快速檢索。

### 2. 智慧化現場點餐 (Ordering System)
- **響應式購物車**：支援品項累加邏輯，使用者可直觀地進行餐點數量加減或移除。
- **顧客關係預處理**：點餐流程整合顧客姓名與聯絡電話輸入，優化取餐核對流程。
- **即時金額試算**：系統會根據購物車內容自動計算總金額，減少人工核帳錯誤。

### 3. 訂單追蹤中心 (Order Tracking)
- **狀態管理流程**：提供「待處理」與「已完成」狀態切換，協助廚房控管出餐進度。
- **歷史紀錄保存**：完整記錄每一筆訂單的時間戳記、顧客資訊及餐點細節。

---

## 技術架構與棧 (Tech Stack)

| 層級 | 技術項目 | 關鍵用途描述 |
| :--- | :--- | :--- |
| **前端框架** | **React.js (v18+)** | 使用 Hooks (useState, useEffect) 處理複雜的 UI 狀態同步 |
| **視覺美化** | **Tailwind CSS** | 實現現代化、流暢的響應式設計 |
| **圖標語彙** | **Lucide-React** | 提供直觀的功能標識，提升使用者體驗 |
| **後端引擎** | **Node.js / Express** | 建立 RESTful API 路由與中間件處理 |
| **資料庫** | **MongoDB 8.2** | 使用非關聯式資料庫處理靈活的 JSON 格式訂單資料 |

---

## 專案目錄結構
```text
goldpeak-restaurant/
├── backend/            # Express Server 核心
│   ├── server.js       # 資料庫連線與 API 路由定義
│   └── package.json    # 後端套件依賴 (mongoose, cors, nodemon)
└── frontend/           # React Client 介面
    ├── src/
    │   ├── App.jsx     # 全域邏輯與單頁式 UI 元件
    │   └── index.js    # React 渲染入口
    └── package.json    # 前端套件依賴 (lucide-react, tailwindcss)

部署與啟動指南
環境配置：確保本地環境已安裝 Node.js (v16+) 與 MongoDB Community Server。

啟動資料庫：

確認 MongoDB 服務已啟動且監聽 27017 埠。

注意：若遇到 Error 48 報錯，請先清除殘留的 mongod 程序。

後端服務啟動：

Bash

cd backend && npm run dev
前端介面啟動：

Bash

cd frontend && npm start
⏱️ 開發版本紀錄 (Git Commit History)
本專案開發過程嚴格遵循版本控制規範，確保開發邏輯清晰：

Initial commit: Project skeleton setup

初始化前後端目錄結構與安裝基礎依賴套件。

feat: Add MongoDB connection and Schema architecture

完成 MongoDB 連線配置及 MenuItem/Order 之 Mongoose Schema 定義。

feat: Implement Menu CRUD with frontend-backend sync

實現菜單的新增、編輯、刪除功能，解決重新整理資料遺失問題。

fix: Resolve MongoDB port 27017 conflict and auth issues

排除 Error 48 通訊埠佔用故障，並調整設定檔優化連線權限。

feat: Integrate Shopping Cart and Order creation logic

完成購物車加減帳算法與訂單存儲至資料庫之完整流程。

style: UI/UX refinement with Tailwind CSS and responsive design

優化整體介面色彩配比，並修正訂單狀態更新之異步邏輯。

👨‍💻 作者資訊
開發者：淡江大學資管系

專案目標：網路程式設計期末

更新日期：2026-01-04