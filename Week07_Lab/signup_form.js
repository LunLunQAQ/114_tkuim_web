const form = document.getElementById('signupForm');
const inputs = form.querySelectorAll('input');
const interestField = document.getElementById('interests');
const strengthBar = document.getElementById('strengthBar');
const strengthText = document.getElementById('strengthText');
const submitBtn = document.getElementById('submitBtn');
const resetBtn = document.getElementById('resetBtn');
const successModal = new bootstrap.Modal(document.getElementById('successModal'));

inputs.forEach(i => {
  i.addEventListener('blur', validate);
  i.addEventListener('input', validate);
});

interestField.addEventListener('change', () => {
  const checked = interestField.querySelectorAll('input:checked').length;
  const err = document.getElementById('interestError');
  err.textContent = checked === 0 ? '請至少選擇一項興趣' : '';
  saveData();
});

function validate(e) {
  const f = e.target;
  let msg = '';

  if (f.id === 'name' && !f.value.trim()) msg = '姓名為必填';
  if (f.id === 'email' && !f.validity.valid) msg = '請輸入正確的 Email';
  if (f.id === 'phone' && !/^\d{10}$/.test(f.value)) msg = '請輸入 10 碼手機號碼';
  if (f.id === 'password') {
    if (!/^(?=.*[a-zA-Z])(?=.*\d).{8,}$/.test(f.value)) msg = '密碼需 8 碼以上並含英文與數字';
    updateStrength(f.value);
  }
  if (f.id === 'confirmPassword' && f.value !== document.getElementById('password').value) msg = '兩次密碼不一致';
  if (f.id === 'terms' && !f.checked) msg = '請勾選服務條款';

  f.setCustomValidity(msg);
  const errorDiv = document.getElementById(f.id + 'Error');
  if (errorDiv) errorDiv.textContent = msg;
  saveData();
}

form.addEventListener('submit', e => {
  e.preventDefault();
  let firstInvalid = null;
  inputs.forEach(i => {
    validate({ target: i });
    if (!firstInvalid && !i.checkValidity()) firstInvalid = i;
  });
  const checked = interestField.querySelectorAll('input:checked').length;
  if (checked === 0) document.getElementById('interestError').textContent = '請至少選擇一項興趣';
  if (firstInvalid || checked === 0) {
    if (firstInvalid) firstInvalid.focus();
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = 'Loading...';
  setTimeout(() => {
    submitBtn.disabled = false;
    submitBtn.textContent = '送出';
    form.reset();
    localStorage.clear();
    strengthBar.style.width = '0%';
    strengthBar.className = 'progress-bar';
    strengthText.textContent = '強度：';
    successModal.show(); // 顯示成功 Modal
  }, 1000);
});

resetBtn.addEventListener('click', () => {
  form.reset();
  document.querySelectorAll('.text-danger').forEach(e => e.textContent = '');
  strengthBar.style.width = '0%';
  strengthBar.className = 'progress-bar';
  strengthText.textContent = '強度：';
  localStorage.clear();
});

function updateStrength(pwd) {
  let level = 0;
  if (pwd.length >= 8) level++;
  if (/[A-Z]/.test(pwd)) level++;
  if (/\d/.test(pwd)) level++;
  if (/[^A-Za-z0-9]/.test(pwd)) level++;

  const widths = ['30%', '60%', '100%'];
  const colors = ['bg-danger', 'bg-warning', 'bg-success'];
  const texts = ['弱', '中', '強'];
  const i = level > 3 ? 2 : level - 1;

  if (level) {
    strengthBar.style.width = widths[i];
    strengthBar.className = 'progress-bar ' + colors[i];
    strengthText.textContent = '強度：' + texts[i];
  } else {
    strengthBar.style.width = '0%';
    strengthBar.className = 'progress-bar';
    strengthText.textContent = '強度：';
  }
}

function saveData() {
  const data = {};
  inputs.forEach(i => {
    if (i.type === 'checkbox') data[i.id || i.value] = i.checked;
    else data[i.id] = i.value;
  });
  localStorage.setItem('formData', JSON.stringify(data));
}

window.addEventListener('load', () => {
  const data = JSON.parse(localStorage.getItem('formData') || '{}');
  inputs.forEach(i => {
    if (i.type === 'checkbox') {
      if (i.id) i.checked = !!data[i.id];
      else i.checked = !!data[i.value];
    } else {
      i.value = data[i.id] || '';
    }
  });
});
