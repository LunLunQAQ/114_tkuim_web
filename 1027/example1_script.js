// example1_script.js
// 統一在父層監聽點擊與送出事件，處理清單項目新增/刪除/完成

const form = document.getElementById('todo-form');
const input = document.getElementById('todo-input');
const list = document.getElementById('todo-list');

//新增項目
form.addEventListener('submit', (event) => {
  event.preventDefault();
  const value = input.value.trim();
  if (!value) {
    return;
  }
  const item = document.createElement('li');
  item.className = 'list-group-item d-flex justify-content-between align-items-center';
  item.innerHTML = `${value}<div>
    <button class="btn btn-sm btn-outline-success me-1" data-action="complete">完成</button>
    <button class="btn btn-sm btn-outline-danger" data-action="remove">刪除</button>
  </div>`;
  list.appendChild(item);
  input.value = '';
  input.focus();
});

//按Enter會送出
input.addEventListener('keyup', (event) => {
  if (event.key === 'Enter') {
    form.requestSubmit();
  }
});

//完成跟刪除
list.addEventListener('click', (event) => {
  const target = event.target;
  if (target.dataset.action === 'complete') {
    target.closest('li').classList.toggle('list-group-item-success');
  }
  if (target.dataset.action === 'remove') {
    target.closest('li').remove();
  }
});