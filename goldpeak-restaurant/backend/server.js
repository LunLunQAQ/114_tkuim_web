const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB 連接
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/goldpeak-db')
  .then(() => console.log('✅ MongoDB 連接成功'))
  .catch(err => console.log('❌ 連接失敗:', err));

// ========== Schema ==========

const menuSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  description: String,
  createdAt: { type: Date, default: Date.now }
});

const orderSchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  phone: { type: String, required: true },
  items: Array,
  totalPrice: { type: Number, required: true },
  status: { type: String, default: 'pending' },
  date: { type: Date, default: Date.now }
});

const MenuItem = mongoose.model('MenuItem', menuSchema);
const Order = mongoose.model('Order', orderSchema);

// ========== 菜色 CRUD ==========

// POST - 新增菜色
app.post('/api/menu', async (req, res) => {
  try {
    const item = new MenuItem(req.body);
    await item.save();
    res.status(201).json({ success: true, message: '新增成功', data: item });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET - 取得所有菜色
app.get('/api/menu', async (req, res) => {
  try {
    const items = await MenuItem.find().sort({ createdAt: -1 });
    res.json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET - 取得單一菜色
app.get('/api/menu/:id', async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: '菜色不存在' });
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT - 更新菜色
app.put('/api/menu/:id', async (req, res) => {
  try {
    const item = await MenuItem.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!item) return res.status(404).json({ success: false, message: '菜色不存在' });
    res.json({ success: true, message: '更新成功', data: item });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE - 刪除菜色
app.delete('/api/menu/:id', async (req, res) => {
  try {
    const item = await MenuItem.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: '菜色不存在' });
    res.json({ success: true, message: '刪除成功', data: item });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========== 訂單 CRUD ==========

// POST - 新增訂單
app.post('/api/orders', async (req, res) => {
  try {
    const order = new Order(req.body);
    await order.save();
    res.status(201).json({ success: true, message: '訂單建立成功', data: order });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET - 取得所有訂單
app.get('/api/orders', async (req, res) => {
  try {
    const orders = await Order.find().sort({ date: -1 });
    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET - 取得單一訂單
app.get('/api/orders/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: '訂單不存在' });
    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT - 更新訂單
app.put('/api/orders/:id', async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!order) return res.status(404).json({ success: false, message: '訂單不存在' });
    res.json({ success: true, message: '更新成功', data: order });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE - 刪除訂單
app.delete('/api/orders/:id', async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: '訂單不存在' });
    res.json({ success: true, message: '刪除成功', data: order });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 健康檢查
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: '服務器正常運行' });
});

// 啟動伺服器
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 金鼎餐廳系統 - 服務器運行於 http://localhost:${PORT}`);
  console.log(`📅 創建日期: 2026/1/4`);
});