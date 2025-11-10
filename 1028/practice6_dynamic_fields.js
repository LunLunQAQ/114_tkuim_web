// practice6_dynamic_fields.js
// 動態新增報名欄位並整合事件委派、即時驗證與送出攔截

const form = document.getElementById('dynamic-form');
const list = document.getElementById('participant-list');
const addBtn = document.getElementById('add-participant');
const submitBtn = document.getElementById('submit-btn');
const resetBtn = document.getElementById('reset-btn');
const countLabel = document.getElementById('count');

const maxParticipants = 5;
let participantIndex = 0;

//參與者卡片
function createParticipantCard(name = '', email = '') {
  const index = participantIndex++;
  const wrapper = document.createElement('div');
  wrapper.className = 'participant card border-0 shadow-sm';
  wrapper.dataset.index = index;
  wrapper.innerHTML = `
    <div class="card-body">
      <div class="d-flex justify-content-between align-items-start mb-3">
        <h5 class="card-title mb-0">參與者 ${index + 1}</h5>
        <button type="button" class="btn btn-sm btn-outline-danger" data-action="remove">移除</button>
      </div>
      <div class="mb-3">
        <label class="form-label" for="name-${index}">姓名</label>
        <input id="name-${index}" name="name-${index}" class="form-control" type="text" required
               value="${name}" aria-describedby="name-${index}-error">
        <p id="name-${index}-error" class="text-danger small mb-0" aria-live="polite"></p>
      </div>
      <div class="mb-0">
        <label class="form-label" for="email-${index}">Email</label>
        <input id="email-${index}" name="email-${index}" class="form-control" type="email" required
               value="${email}" aria-describedby="email-${index}-error" inputmode="email">
        <p id="email-${index}-error" class="text-danger small mb-0" aria-live="polite"></p>
      </div>
    </div>
  `;
  return wrapper;
}

// 更新參與者數量
function updateCount() {
  countLabel.textContent = list.children.length;
  addBtn.disabled = list.children.length >= maxParticipants;
  saveToLocal();
}

// 錯誤訊息
function setError(input, message) {
  const error = document.getElementById(`${input.id}-error`);
  input.setCustomValidity(message);
  error.textContent = message;
  input.classList.toggle('is-invalid', !!message);
}

// 檢查欄位
function validateInput(input) {
  const value = input.value.trim();
  if (!value) {
    setError(input, '此欄位必填');
    return false;
  }
  if (input.type === 'email') {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(value)) {
      setError(input, 'Email 格式不正確');
      return false;
    }
  }
  setError(input, '');
  return true;
}

// 新增一位參與者
function handleAddParticipant(name = '', email = '') {
  if (list.children.length >= maxParticipants) return;
  const participant = createParticipantCard(name, email);
  list.appendChild(participant);
  updateCount();
  participant.querySelector('input').focus();
}

// 移除參與者
list.addEventListener('click', (event) => {
  const button = event.target.closest('[data-action="remove"]');
  if (!button) return;
  button.closest('.participant')?.remove();
  updateCount();
});

// 即時驗證
list.addEventListener('blur', (event) => {
  if (event.target.matches('input')) validateInput(event.target);
}, true);

// 輸入時移除錯誤
list.addEventListener('input', (event) => {
  if (event.target.matches('input')) validateInput(event.target);
});

// 點擊新增
addBtn.addEventListener('click', () => handleAddParticipant());

// 送出
form.addEventListener('submit', async (event) => {
  event.preventDefault();

  if (list.children.length === 0) {
    alert('請至少新增一位參與者');
    handleAddParticipant();
    return;
  }

  let firstInvalid = null;
  list.querySelectorAll('input').forEach((input) => {
    const valid = validateInput(input);
    if (!valid && !firstInvalid) firstInvalid = input;
  });
  if (firstInvalid) return firstInvalid.focus();

  submitBtn.disabled = true;
  submitBtn.textContent = '送出中...';
  await new Promise((resolve) => setTimeout(resolve, 1000));

  alert('表單已送出！');
  form.reset();
  list.innerHTML = '';
  participantIndex = 0;
  updateCount();
  localStorage.removeItem('participants');
  submitBtn.disabled = false;
  submitBtn.textContent = '送出';
});

// 重設
resetBtn.addEventListener('click', () => {
  form.reset();
  list.innerHTML = '';
  participantIndex = 0;
  updateCount();
  localStorage.removeItem('participants');
});

// 匯出目前名單（JSON）
const exportBtn = document.createElement('button');
exportBtn.type = 'button';
exportBtn.className = 'btn btn-outline-success ms-2';
exportBtn.textContent = '匯出名單';
submitBtn.insertAdjacentElement('afterend', exportBtn);

exportBtn.addEventListener('click', () => {
  const data = Array.from(list.querySelectorAll('.participant')).map((p) => ({
    name: p.querySelector('input[type="text"]').value.trim(),
    email: p.querySelector('input[type="email"]').value.trim(),
  }));
  if (!data.length) return alert('目前沒有參與者可匯出');
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'participants.json';
  a.click();
  URL.revokeObjectURL(url);
});

// localStorage 暫存
function saveToLocal() {
  const data = Array.from(list.querySelectorAll('.participant')).map((p) => ({
    name: p.querySelector('input[type="text"]').value,
    email: p.querySelector('input[type="email"]').value,
  }));
  localStorage.setItem('participants', JSON.stringify(data));
}

// 初始化時從localStorage還原
window.addEventListener('DOMContentLoaded', () => {
  const saved = JSON.parse(localStorage.getItem('participants') || '[]');
  if (saved.length) saved.forEach((p) => handleAddParticipant(p.name, p.email));
  else handleAddParticipant();
  updateCount();
});
