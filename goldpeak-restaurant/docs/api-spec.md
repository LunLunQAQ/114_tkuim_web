# API 規格文件 - TaskFlow 任務管理系統

## 1. 基本資訊
- **Base URL**: `http://localhost:5000/api`
- **資料格式**: `JSON`
- **資料庫**: `MongoDB`

## 2. 任務 API (Tasks)

### A. 取得所有任務 (Read All)  
- **URL**: `/tasks`
- **Method**: `GET`
- **成功回應 (200 OK)**:
  ```json
  [
    {
      "_id": "658f1a...",
      "title": "完成網路程式設計專題",
      "description": "包含 CRUD 與文件撰寫",
      "status": "pending",
      "createdAt": "2026-01-04T..."
    }
  ]