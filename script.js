function loadChart() {
  var s = document.getElementById('sym').value;
  var box = document.getElementById('tv-box');
  box.innerHTML = '';
  var sc = document.createElement('script');
  sc.src = 'https://tradingview.com';
  sc.type = 'text/javascript';
  sc.async = true;
  sc.innerHTML = JSON.stringify({
    "autosize": true,
    "symbol": s,
    "interval": "15",
    "timezone": "Etc/UTC",
    "theme": "dark",
    "style": "1",
    "locale": "en",
    "hide_top_toolbar": true,
    "allow_symbol_change": false,
    "support_host": "https://tradingview.com"
  });
  box.appendChild(sc);
}

function drawPath(c, pp, sl, tp, isBull) {
  var cv = document.getElementById('radar');
  var ctx = cv.getContext('2d');
  ctx.clearRect(0, 0, cv.width, cv.height);

  var all = [c, pp, sl, tp];
  var maxV = Math.max.apply(null, all);
  var minV = Math.min.apply(null, all);
  var pad = (maxV - minV) * 0.2 || 1;
  maxV += pad;
  minV -= pad;

  function getY(v) {
    return 170 - ((v - minV) / (maxV - minV)) * 150;
  }

  function hLine(val, col, lbl) {
    var y = getY(val);
    ctx.strokeStyle = col;
    ctx.setLineDash([4, 4]);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(10, y);
    ctx.lineTo(435, y);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = col;
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText(lbl + ': ' + val.toFixed(2), 440, y + 4);
  }

  hLine(tp, '#38BDF8', 'TARGET');
  hLine(pp, '#FBBF24', 'PIVOT');
  hLine(sl, '#F87171', 'STOP');

  var y0 = getY(c);
  var y1 = getY(pp);
  var y2 = getY((c + tp) / 2);
  var y3 = getY(tp);

  ctx.strokeStyle = isBull ? '#10B981' : '#EF4444';
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.moveTo(40, y0);
  ctx.lineTo(150, y1);
  ctx.lineTo(280, y2);
  ctx.lineTo(410, y3);
  ctx.stroke();

  ctx.fillStyle = isBull ? '#34D399' : '#F87171';
  ctx.beginPath();
  ctx.arc(40, y0, 5, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.arc(410, y3, 6, 0, Math.PI * 2);
  ctx.fill();
}

function runBot() {
  var h = parseFloat(document.getElementById('p-hi').value) || 0;
  var l = parseFloat(document.getElementById('p-lo').value) || 0;
  var c = parseFloat(document.getElementById('p-cl').value) || 0;

  var pp = (h + l + c) / 3;
  var r1 = (2 * pp) - l;
  var s1 = (2 * pp) - h;
  var isBull = c >= pp;

  var bias = isBull
    ? '<span class="bull">🟢 BULLISH PATH (Target Up)</span>'
    : '<span class="bear">🔴 BEARISH PATH (Target Down)</span>';
  var sl = isBull ? s1 : r1;
  var tp = isBull ? (c + (c - sl) * 2) : (c - (sl - c) * 2);

  drawPath(c, pp, sl, tp, isBull);

  document.getElementById('bot-out').innerHTML =
    '<div class="row"><span>🤖 Projected Destination:</span>' + bias + '</div>' +
    '<div class="row"><span>⚖️ Central Pivot (Pullback Zone):</span><strong>' + pp.toFixed(2) + '</strong></div>' +
    '<div class="row"><span>🛡️ Structural Stop-Loss:</span><strong style="color:#F87171">' + sl.toFixed(2) + '</strong></div>' +
    '<div class="row" style="border:none"><span>🎯 Final Destination (1:2 R:R):</span><strong style="color:#38BDF8">' + tp.toFixed(2) + '</strong></div>';
}

loadChart();
runBot();
