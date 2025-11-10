// ========== 取得 DOM 元素 ==========
const form = document.getElementById('transactionForm');
const descInput = document.getElementById('description');
const amountInput = document.getElementById('amount');
const typeSelect = document.getElementById('type');
const listDiv = document.getElementById('transactionList');
const balanceEl = document.getElementById('balanceAmount');
const incomeEl = document.getElementById('incomeAmount');
const expenseEl = document.getElementById('expenseAmount');
const themeBtn = document.getElementById('themeToggle');

// 交易資料陣列
let transactions = [];

// ========== 初始化 ==========
function init() {
    loadData();
    loadTheme();
    render();
    updateStats();
}

// ========== LocalStorage 操作 ==========
function loadData() {
    const data = localStorage.getItem('transactions');
    if (data) transactions = JSON.parse(data);
}

function saveData() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
}

// ========== 深色模式切換 ==========
function loadTheme() {
    const theme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', theme);
    themeBtn.textContent = theme === 'dark' ? '☀️' : '🌙';
}

themeBtn.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const newTheme = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    themeBtn.textContent = newTheme === 'dark' ? '☀️' : '🌙';
});

// ========== 表單送出 ==========
form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // 先移除之前的驗證狀態
    form.classList.remove('was-validated');
    
    // 驗證表單
    if (!form.checkValidity()) {
        e.stopPropagation();
        form.classList.add('was-validated');
        
        // 顯示錯誤提示
        showError();
        return;
    }

    // 新增交易
    const transaction = {
        id: Date.now(),
        desc: descInput.value.trim(),
        amount: parseFloat(amountInput.value),
        type: typeSelect.value,
        date: new Date().toLocaleString('zh-TW')
    };

    transactions.unshift(transaction);
    saveData();
    render();
    updateStats();

    // 重置表單
    form.reset();
    form.classList.remove('was-validated');
    showMessage();
});

// ========== 顯示驗證錯誤訊息 ==========
function showError() {
    const msg = document.createElement('div');
    msg.className = 'alert alert-danger position-fixed top-0 start-50 translate-middle-x mt-3';
    msg.style.zIndex = '9999';
    msg.textContent = '❌ 請正確填寫所有欄位！';
    document.body.appendChild(msg);
    setTimeout(() => msg.remove(), 2000);
}

// ========== 顯示成功訊息 ==========
function showMessage() {
    const msg = document.createElement('div');
    msg.className = 'alert alert-success position-fixed top-0 start-50 translate-middle-x mt-3';
    msg.style.zIndex = '9999';
    msg.textContent = '✅ 新增成功！';
    document.body.appendChild(msg);
    setTimeout(() => msg.remove(), 2000);
}

// ========== 渲染交易列表 ==========
function render() {
    if (transactions.length === 0) {
        listDiv.innerHTML = `
            <div class="empty-state">
                <h4>📋 尚無記錄</h4>
                <p>開始記錄你的第一筆收入或支出吧！</p>
            </div>
        `;
        return;
    }

    listDiv.innerHTML = transactions.map(t => `
        <div class="transaction-item ${t.type} p-3 mb-3 rounded">
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    <h5 class="mb-1">${t.desc}</h5>
                    <small class="text-secondary">${t.date}</small>
                </div>
                <div class="d-flex align-items-center gap-3">
                    <h4 class="mb-0 ${t.type === 'income' ? 'text-success' : 'text-danger'}">
                        ${t.type === 'income' ? '+' : '-'} NT$ ${t.amount.toLocaleString()}
                    </h4>
                    <button class="btn btn-danger btn-sm btn-delete" onclick="deleteItem(${t.id})">
                        🗑️
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// ========== 刪除交易 ==========
function deleteItem(id) {
    if (!confirm('確定要刪除嗎？')) return;
    transactions = transactions.filter(t => t.id !== id);
    saveData();
    render();
    updateStats();
}

// ========== 更新統計 ==========
function updateStats() {
    const income = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

    const expense = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

    const balance = income - expense;

    balanceEl.textContent = `NT$ ${balance.toLocaleString()}`;
    incomeEl.textContent = `NT$ ${income.toLocaleString()}`;
    expenseEl.textContent = `NT$ ${expense.toLocaleString()}`;
}

// ========== 啟動 ==========
init();