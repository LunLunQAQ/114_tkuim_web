// example2_script.js
// 驗證 Email 與手機欄位，拋出自訂訊息後再提示使用者

const form = document.getElementById('contact-form');
const email = document.getElementById('email');
const phone = document.getElementById('phone');

function validateField(input) {
  //僅限 @o365.tku.edu.tw
  if (input.id === 'email' && input.value.trim()) {
    if (!input.value.endsWith('@o365.tku.edu.tw')) {
      input.setCustomValidity('僅限使用 @o365.tku.edu.tw 信箱');
      return false;
    }
  }

  //一般驗證
  if (input.validity.valueMissing) {
    input.setCustomValidity('這個欄位必填');
    return false;
  } else if (input.validity.typeMismatch) {
    input.setCustomValidity('格式不正確，請確認輸入內容');
    return false;
  } else if (input.validity.patternMismatch) {
    input.setCustomValidity(input.title || '格式不正確');
    return false;
  } else {
    input.setCustomValidity('');
    return true;
  }
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  
  const emailOk = validateField(email);
  const phoneOk = validateField(phone);
  
  if (!emailOk) {
    email.reportValidity();
    return;
  }
  if (!phoneOk) {
    phone.reportValidity();
    return;
  }
  
  alert('表單驗證成功，準備送出資料');
  form.reset();
});