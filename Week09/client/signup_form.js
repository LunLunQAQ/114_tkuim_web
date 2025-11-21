const form = document.querySelector('#signup-form');
const resultEl = document.querySelector('#result');
const viewBtn = document.querySelector('#view-list');

const API_URL = 'http://localhost:3001/api/signup';

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(form);
  const payload = Object.fromEntries(formData.entries());
  payload.password = payload.confirmPassword = 'demoPass88';
  payload.interests = ['後端入門'];
  payload.terms = true;

  try {
    resultEl.textContent = '送出中...';
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || '送出失敗');
    resultEl.textContent = JSON.stringify(data, null, 2);
    form.reset();
  } catch (err) {
    resultEl.textContent = `錯誤：${err.message}`;
  }
});

// 查看報名清單
viewBtn.addEventListener('click', async () => {
  try {
    resultEl.textContent = '載入中...';
    const res = await fetch(API_URL);
    const data = await res.json();
    resultEl.textContent = JSON.stringify(data, null, 2);
  } catch (err) {
    resultEl.textContent = `錯誤：${err.message}`;
  }
});
