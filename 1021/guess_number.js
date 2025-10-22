// 猜數字遊戲
var target = Math.floor(Math.random() * 100) + 1;
var count = 0;
var guess;
var messages = '';

function playGuess() {
  guess = prompt('請猜 1~100 的數字：');
  if (guess === null) {
    messages += '遊戲中止';
    return false;
  }
  guess = parseInt(guess, 10);
  if (isNaN(guess) || guess < 1 || guess > 100) {
    alert('請輸入 1~100 的有效數字');
    return true;
  }

  count++;
  if (guess < target) {
    alert('再大一點！');
    return true;
  } else if (guess > target) {
    alert('再小一點！');
    return true;
  } else {
    messages = '恭喜你猜中了！\n總共猜了 ' + count + ' 次';
    alert(messages);
    return false;
  }
}

// 主遊戲迴圈
while (playGuess()) {}

console.log(messages);
document.getElementById('result').textContent = messages;
