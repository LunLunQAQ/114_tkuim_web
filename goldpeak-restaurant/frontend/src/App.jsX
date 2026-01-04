import React, { useState, useEffect } from 'react';
import { Trash2, Edit2, Plus, ShoppingCart, User, Phone } from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('menu');
  const [menuItems, setMenuItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [cart, setCart] = useState([]);
  const [showMenuForm, setShowMenuForm] = useState(false);
  const [editingMenu, setEditingMenu] = useState(null);
  const [menuForm, setMenuForm] = useState({ name: '', category: 'main', price: '', description: '' });
  const [orderForm, setOrderForm] = useState({ customerName: '', phone: '' });

  // 1. 初始化 - 網頁載入時從 MongoDB 抓取資料
  useEffect(() => {
    fetchMenuItems();
    fetchOrders();
  }, []);

  const fetchMenuItems = async () => {
    try {
      const res = await fetch(`${API_URL}/menu`);
      const data = await res.json();
      if (data.success) setMenuItems(data.data);
    } catch (err) { console.error('抓取菜單失敗:', err); }
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${API_URL}/orders`);
      const data = await res.json();
      if (data.success) setOrders(data.data);
    } catch (err) { console.error('抓取訂單失敗:', err); }
  };

  // 2. 菜色管理 (新增/編輯/刪除)
  const saveMenuItem = async () => {
    if (!menuForm.name || !menuForm.price) return alert('請填寫完整資訊');
    const isEditing = !!editingMenu;
    const url = isEditing ? `${API_URL}/menu/${editingMenu._id}` : `${API_URL}/menu`;
    const method = isEditing ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(menuForm)
      });
      if (res.ok) {
        setShowMenuForm(false);
        setEditingMenu(null);
        setMenuForm({ name: '', category: 'main', price: '', description: '' });
        fetchMenuItems();
        alert(isEditing ? '更新成功' : '新增成功');
      }
    } catch (err) { console.error('儲存失敗:', err); }
  };

  const deleteMenuItem = async (id) => {
    if (!window.confirm('確定從資料庫刪除此菜色？')) return;
    try {
      const res = await fetch(`${API_URL}/menu/${id}`, { method: 'DELETE' });
      if (res.ok) fetchMenuItems();
    } catch (err) { console.error('刪除失敗:', err); }
  };

  const startEditMenu = (item) => {
    setMenuForm({ name: item.name, category: item.category, price: item.price, description: item.description });
    setEditingMenu(item);
    setShowMenuForm(true);
  };

  // 3. 購物車邏輯
  const addToCart = (item) => {
    const existing = cart.find(c => c._id === item._id);
    if (existing) {
      setCart(cart.map(c => c._id === item._id ? { ...c, quantity: c.quantity + 1 } : c));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  const updateCartQuantity = (id, quantity) => {
    if (quantity <= 0) {
      setCart(cart.filter(item => item._id !== id));
    } else {
      setCart(cart.map(item => item._id === id ? { ...item, quantity } : item));
    }
  };

  // 4. 訂單管理 (核心：傳送顧客姓名與電話)
  const createOrder = async () => {
    if (!orderForm.customerName || !orderForm.phone || cart.length === 0) {
      return alert('請填寫顧客姓名、電話，並至少選擇一項餐點');
    }
    try {
      const res = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: orderForm.customerName, // 對接後端欄位
          phone: orderForm.phone,               // 對接後端欄位
          items: cart,
          totalPrice: cart.reduce((s, i) => s + (i.price * i.quantity), 0)
        })
      });
      if (res.ok) {
        setCart([]);
        setOrderForm({ customerName: '', phone: '' });
        fetchOrders();
        alert('訂單已送達後端資料庫！');
      }
    } catch (err) { console.error('訂單失敗:', err); }
  };

  // 修正：定義 updateOrderStatus 解決 Line 312 報錯
  const updateOrderStatus = async (id, status) => {
    try {
      const res = await fetch(`${API_URL}/orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) fetchOrders();
    } catch (err) { console.error('更新訂單失敗:', err); }
  };

  const deleteOrder = async (id) => {
    if (!window.confirm('確定刪除此訂單？')) return;
    try {
      const res = await fetch(`${API_URL}/orders/${id}`, { method: 'DELETE' });
      if (res.ok) fetchOrders();
    } catch (err) { console.error('刪除失敗:', err); }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Navbar */}
      <header className="bg-red-700 text-white p-5 shadow-lg flex justify-between items-center">
        <h1 className="text-2xl font-black">🍜 金鼎餐廳 GOLD PEAK</h1>
        <div className="flex gap-2">
          {['menu', 'order', 'orders'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 rounded-lg font-bold ${activeTab === tab ? 'bg-white text-red-700' : 'hover:bg-red-600'}`}>
              {tab === 'menu' ? '菜單管理' : tab === 'order' ? '現場點餐' : `訂單紀錄 (${orders.length})`}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        {/* --- 1. 菜單管理 --- */}
        {activeTab === 'menu' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">菜品清單</h2>
              <button onClick={() => { setEditingMenu(null); setMenuForm({name:'', category:'main', price:'', description:''}); setShowMenuForm(true); }} className="bg-red-600 text-white px-4 py-2 rounded flex items-center gap-2"><Plus size={18}/> 新增菜色</button>
            </div>
            {showMenuForm && (
              <div className="bg-white p-6 rounded-xl shadow-md mb-8 border-t-4 border-red-600">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <input type="text" placeholder="名稱" className="border p-2 rounded" value={menuForm.name} onChange={e => setMenuForm({...menuForm, name: e.target.value})} />
                  <select className="border p-2 rounded" value={menuForm.category} onChange={e => setMenuForm({...menuForm, category: e.target.value})}>
                    <option value="main">主菜</option><option value="soup">湯品</option><option value="appetizer">前菜</option>
                  </select>
                  <input type="number" placeholder="價格" className="border p-2 rounded" value={menuForm.price} onChange={e => setMenuForm({...menuForm, price: e.target.value})} />
                  <input type="text" placeholder="描述" className="border p-2 rounded" value={menuForm.description} onChange={e => setMenuForm({...menuForm, description: e.target.value})} />
                </div>
                <div className="mt-4 flex gap-2">
                  <button onClick={saveMenuItem} className="bg-green-600 text-white px-6 py-2 rounded font-bold">儲存到資料庫</button>
                  <button onClick={() => setShowMenuForm(false)} className="bg-gray-100 px-6 py-2 rounded">取消</button>
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {menuItems.map(item => (
                <div key={item._id} className="bg-white p-4 rounded shadow border border-slate-100">
                  <h3 className="font-bold text-lg">{item.name} <span className="text-red-600 ml-2">${item.price}</span></h3>
                  <p className="text-gray-400 text-sm mb-4">{item.description}</p>
                  <div className="flex gap-2">
                    <button onClick={() => startEditMenu(item)} className="flex-1 bg-blue-50 text-blue-600 py-2 rounded flex justify-center items-center gap-1"><Edit2 size={14}/> 編輯</button>
                    <button onClick={() => deleteMenuItem(item._id)} className="flex-1 bg-red-50 text-red-600 py-2 rounded flex justify-center items-center gap-1"><Trash2 size={14}/> 刪除</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- 2. 現場點餐 (含購物車) --- */}
        {activeTab === 'order' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <h2 className="text-xl font-bold mb-4">點擊加入購物車</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {menuItems.map(item => (
                  <button key={item._id} onClick={() => addToCart(item)} className="bg-white p-6 rounded-xl shadow hover:bg-red-50 transition text-center border-b-4 border-transparent hover:border-red-600">
                    <p className="font-bold text-lg">{item.name}</p>
                    <p className="text-red-600 font-black">${item.price}</p>
                  </button>
                ))}
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-xl border border-red-100 h-fit sticky top-24">
              <h3 className="font-bold text-xl mb-4 flex items-center gap-2"><ShoppingCart className="text-red-600"/> 結帳清單</h3>
              {cart.map(item => (
                <div key={item._id} className="flex justify-between items-center mb-3 border-b pb-2">
                  <span className="font-bold">{item.name} x{item.quantity}</span>
                  <div className="flex items-center gap-2">
                    <button onClick={() => updateCartQuantity(item._id, item.quantity-1)} className="px-2 bg-slate-100 rounded">-</button>
                    <button onClick={() => updateCartQuantity(item._id, item.quantity+1)} className="px-2 bg-slate-100 rounded">+</button>
                  </div>
                </div>
              ))}
              <div className="mt-6 pt-4 border-t">
                <p className="text-2xl font-black text-red-600 mb-4 text-right">總額: ${cart.reduce((s,i)=>s+(i.price*i.quantity),0)}</p>
                <div className="space-y-2">
                  <div className="flex items-center bg-slate-50 p-2 rounded"><User size={16} className="mr-2 text-slate-400"/><input type="text" placeholder="顧客姓名" className="bg-transparent outline-none w-full" value={orderForm.customerName} onChange={e=>setOrderForm({...orderForm, customerName:e.target.value})} /></div>
                  <div className="flex items-center bg-slate-50 p-2 rounded"><Phone size={16} className="mr-2 text-slate-400"/><input type="text" placeholder="電話號碼" className="bg-transparent outline-none w-full" value={orderForm.phone} onChange={e=>setOrderForm({...orderForm, phone:e.target.value})} /></div>
                  <button onClick={createOrder} className="w-full bg-red-600 text-white py-3 rounded-xl font-bold shadow-lg">確認送出訂單</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- 3. 訂單紀錄 (查看顧客資訊) --- */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold mb-4">所有訂單</h2>
            {orders.map(order => (
              <div key={order._id} className="bg-white p-6 rounded-xl shadow-md border-l-8 border-red-700">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold">顧客：{order.customerName}</h3>
                    <p className="text-slate-400 text-sm">電話：{order.phone}</p>
                    <p className="text-slate-300 text-xs mt-1">時間：{new Date(order.date).toLocaleString()}</p>
                  </div>
                  <p className="text-xl font-black text-red-600">${order.totalPrice}</p>
                </div>
                <div className="flex gap-2 flex-wrap mb-4">
                  {order.items.map((it, idx) => (
                    <span key={idx} className="bg-slate-100 text-xs px-2 py-1 rounded"> {it.name} x{it.quantity} </span>
                  ))}
                </div>
                <div className="flex justify-between items-center">
                  <select value={order.status} onChange={(e) => updateOrderStatus(order._id, e.target.value)} className={`p-2 rounded font-bold ${order.status==='pending'?'bg-yellow-100 text-yellow-700':'bg-green-100 text-green-700'}`}>
                    <option value="pending">待處理</option><option value="completed">已完成</option>
                  </select>
                  <button onClick={() => deleteOrder(order._id)} className="text-red-300 hover:text-red-600 transition"><Trash2 size={20}/></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}