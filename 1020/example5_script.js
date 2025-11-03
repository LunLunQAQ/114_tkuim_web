// example5_script.js
// 以巢狀 for 產生九九乘法表

var startInput = prompt('請輸入乘法表開始數字 (1~9)：');
var endInput = prompt('請輸入乘法表結束數字 (1~9)：');

var start = parseInt(startInput, 10);
var end = parseInt(endInput, 10);

// 驗證輸入
if (isNaN(start) || isNaN(end) || start < 1 || start > 9 || end < 1 || end > 9 || start > end) {
  alert('輸入範圍無效，將顯示完整九九乘法表');
  start = 1;
  end = 9;
}

var output = '';
for (var i = start; i <= end; i++) {
  for (var j = 1; j <= 9; j++) {
    output += i + 'x' + j + '=' + (i * j) + '\t';
  }
  output += '\n';
}

document.getElementById('result').textContent = output;
