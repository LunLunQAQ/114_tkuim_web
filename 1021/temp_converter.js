// 讀入溫度與單位
var input = prompt('請輸入溫度與單位（例如 25C 或 77F）：');
var resultText = '';

if (!input) {
  resultText = '未輸入資料';
} else {
  input = input.trim().toUpperCase();
  var value = parseFloat(input);
  var unit = input.slice(-1); // 取最後一個字母 C 或 F

  if (isNaN(value) || (unit !== 'C' && unit !== 'F')) {
    resultText = '輸入格式錯誤，請輸入數字加 C 或 F';
  } else {
    var converted;
    if (unit === 'C') {
      converted = value * 9 / 5 + 32;
      resultText = value + '°C = ' + converted.toFixed(2) + '°F';
    } else {
      converted = (value - 32) * 5 / 9;
      resultText = value + '°F = ' + converted.toFixed(2) + '°C';
    }
    alert(resultText);
  }
}

document.getElementById('result').textContent = resultText;
