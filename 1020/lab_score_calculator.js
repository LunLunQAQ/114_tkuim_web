// lab_score_calculator.js
// 以 prompt 取得五科成績，計算平均與等第，並提示不及格科目

function toNumber(str) {
  var n = parseFloat(str);
  return isNaN(n) ? null : n;
}

function gradeFrom(avg) {
  var g = 'F';
  if (avg >= 90) g = 'A';
  else if (avg >= 80) g = 'B';
  else if (avg >= 70) g = 'C';
  else if (avg >= 60) g = 'D';
  else g = 'F';
  return g;
}

var name = prompt('請輸入姓名：');
if (!name) name = '同學';

// 讀入 5 科成績
var subjects = ['國文', '英文', '數學', '自然', '社會'];
var scores = [];
for (var i = 0; i < subjects.length; i++) {
  var score = toNumber(prompt('請輸入 ' + subjects[i] + ' 成績：'));
  scores.push(score);
}

// 驗證輸入
var text = '';
if (scores.includes(null)) {
  text = '輸入有誤，請重新整理後再試。';
} else {
  // 計算平均
  var sum = 0;
  for (var j = 0; j < scores.length; j++) {
    sum += scores[j];
  }
  var avg = sum / scores.length;

  // 判斷是否有不及格科目
  var hasFail = scores.some(function(s) { return s < 60; });

  // 輸出
  text = '姓名：' + name + '\n';
  for (var k = 0; k < subjects.length; k++) {
    text += subjects[k] + '：' + scores[k] + '\n';
  }
  text += '平均：' + avg.toFixed(2) + '\n';
  text += '等第：' + gradeFrom(avg) + '\n';
  if (hasFail) {
    text += '注意：有不及格科目！';
  }
}

console.log(text);
document.getElementById('result').textContent = text;
