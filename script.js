var presets = {
  "OANDA:XAUUSD": { hi: 2750, lo: 2710, cl: 2738, name: "GOLD (XAU/USD)" },
  "BINANCE:BTCUSDT": { hi: 92400, lo: 89100, cl: 91500, name: "BITCOIN (BTC/USDT)" },
  "FX:EURUSD": { hi: 1.0890, lo: 1.0810, cl: 1.0865, name: "EUR / USD" },
  "FOREXCOM:NSXUSD": { hi: 20650, lo: 20320, cl: 20540, name: "NASDAQ 100 (US100)" }
};

function loadChart() {
  var sym = document.getElementById('sym').value;
  var p = presets[sym];
  document.getElementById('p-hi').value = p.hi;
  document.getElementById('p-lo').value = p.lo;
  document.getElementById('p-cl').value = p.cl;
  runBot();
}

function drawCandles(h, l, c) {
  var box = document.getElementById('tv-box');
  var sym = document.getElementById('sym').value;
  box.innerHTML = '<canvas id="c-chart" width="560" height="225"></canvas>' +
    '<div style="padding:6px 10px;background:#090D16;display:flex;justify-content:space-between;align-items:center;border-top:1px solid #1E293B;">' +
    '<span style="font-size:11px;color:#94A3B8;">📊 Live Session Structure (15m Candles)</span>' +
    '<a href="https://tradingview.com' + encodeURIComponent(sym) + '" target="_blank" style="font-size:11px;color:#38BDF8;text-decoration:none;font-weight:bold;">Open Full TradingView ↗</a>' +
    '</div>';

  var cv = document.getElementById('c-chart');
  var ctx = cv.getContext('2d');
  var step = (h - l) / 14 || 1;
  var candles = [];
  var cur = l + (h - l) * 0.25;

  for (var i = 0; i < 18; i++) {
    var open = cur;
    var move = (Math.sin(i * 1.4) + 0.35) * step * 2.2;
    if (i === 17) move = c - open;
    var close = open + move;
    var high = Math.max(open, close) + Math.abs(move) * 0.4;
    var low = Math.min(open, close) - Math.abs(move) * 0.4;
    candles.push({ o: open, c: close, h: Math.min(high, h), l: Math.max(low, l) });
    cur = close;
  }

  var pad = (h - l) * 0.12 || 1;
  var maxV = h + pad;
  var minV = l - pad;
  function getY(v) { return 205 - ((v - minV) / (maxV - minV)) * 185; }

  for (var j = 0; j < candles.length; j++) {
    var cd = candles[j];
    var x = 22 + j * 29;
    var bull = cd.c >= cd.o;
    ctx.strokeStyle = bull ? '#10B981' : '#EF4444';
    ctx.fillStyle = bull ? '#10B981' : '#EF4444';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x + 6, getY(cd.h));
    ctx.lineTo(x + 6, getY(cd.l));
    ctx.stroke();

    var topY = getY(Math.max(cd.o, cd.c));
    var botY = getY(Math.min(cd.o, cd.c));
    var barH = Math.max(botY - topY, 3);
    ctx.fillRect(x, topY, 12, barH);
  }
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

  function getY(v) { return 170 - ((v - minV) / (maxV - minV)) * 150; }
  function hLine(val, col, lbl) {
    var y = getY(val);
    ctx.strokeStyle = col;
    ctx.setLineDash([5, 5]);
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

  var y0 = getY(c), y1 = getY(pp), y2 = getY((c + tp) / 2), y3 = getY(tp);
  ctx.strokeStyle = isBull ? '#10B981' : '#EF4444';
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.moveTo(40, y0);
  ctx.lineTo(150, y1);
  ctx.lineTo(280, y2);
  ctx.lineTo(410, y3);
  ctx.stroke();

  ctx.fillStyle = isBull ? '#34D399' : '#F87171';
  ctx.beginPath(); ctx.arc(40, y0, 5, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(410, y3, 6, 0, Math.PI * 2); ctx.fill();
}

function runBot() {
  var h = parseFloat(document.getElementById('p-hi').value) || 0;
  var l = parseFloat(document.getElementById('p-lo').value) || 0;
  var c = parseFloat(document.getElementById('p-cl').value) || 0;

  drawCandles(h, l, c);

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
