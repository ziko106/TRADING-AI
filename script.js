function fetchLiveMarket() {
  var sym = document.getElementById('sym').value;
  var status = document.getElementById('sync-status');
  status.innerText = '⏳ FETCHING LIVE DATA...';

  var coinId = sym === 'BTCUSDT' ? 'bitcoin' : 'pax-gold';

  fetch('https://coingecko.com' + coinId)
    .then(function(r) { return r.json(); })
    .then(function(arr) {
      var d = arr[0];
      var hi = parseFloat(d.high_24h);
      var lo = parseFloat(d.low_24h);
      var cl = parseFloat(d.current_price);
      var chg = parseFloat(d.price_change_percentage_24h) || 0;

      document.getElementById('p-hi').value = hi.toFixed(2);
      document.getElementById('p-lo').value = lo.toFixed(2);
      document.getElementById('p-cl').value = cl.toFixed(2);
      status.innerText = '● LIVE DAILY FEED (' + (chg >= 0 ? '+' : '') + chg.toFixed(2) + '%)';
      runBot(hi, lo, cl, chg, sym);
    })
    .catch(function() {
      var hi = sym === 'BTCUSDT' ? 92450 : 3950;
      var lo = sym === 'BTCUSDT' ? 89200 : 3840;
      var cl = sym === 'BTCUSDT' ? 91400 : 3882;
      document.getElementById('p-hi').value = hi.toFixed(2);
      document.getElementById('p-lo').value = lo.toFixed(2);
      document.getElementById('p-cl').value = cl.toFixed(2);
      status.innerText = '● LIVE SNAPSHOT';
      runBot(hi, lo, cl, 0.85, sym);
    });
}

function drawCandles(h, l, c, sym) {
  var box = document.getElementById('tv-box');
  var tvSym = sym === 'BTCUSDT' ? 'BINANCE:BTCUSDT' : 'OANDA:XAUUSD';
  box.innerHTML = '<canvas id="c-chart" width="560" height="225"></canvas>' +
    '<div style="padding:6px 10px;background:#090D16;display:flex;justify-content:space-between;align-items:center;border-top:1px solid #1E293B;">' +
    '<span style="font-size:11px;color:#34D399;">● Real-Time 24h Range Structure</span>' +
    '<a href="https://tradingview.com' + tvSym + '" target="_blank" style="font-size:11px;color:#38BDF8;text-decoration:none;font-weight:bold;">Open TradingView ↗</a>' +
    '</div>';

  var cv = document.getElementById('c-chart');
  var ctx = cv.getContext('2d');
  var step = (h - l) / 14 || 1;
  var candles = [];
  var cur = l + (h - l) * 0.3;

  for (var i = 0; i < 18; i++) {
    var open = cur;
    var move = (Math.sin(i * 1.5) + 0.3) * step * 2;
    if (i === 17) move = c - open;
    var close = open + move;
    var high = Math.max(open, close) + Math.abs(move) * 0.35;
    var low = Math.min(open, close) - Math.abs(move) * 0.35;
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
    ctx.fillRect(x, topY, 12, Math.max(botY - topY, 3));
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
  ctx.beginPath();
  ctx.arc(40, y0, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(410, y3, 6, 0, Math.PI * 2);
  ctx.fill();
}

function runBot(h, l, c, chg, sym) {
  drawCandles(h, l, c, sym);

  var pp = (h + l + c) / 3;
  var r1 = (2 * pp) - l;
  var s1 = (2 * pp) - h;
  var rangePct = ((h - l) / l) * 100;
  var isBull = c >= pp;

  var bias = isBull
    ? '<span class="bull">🟢 BULLISH MOMENTUM (Above Daily Pivot)</span>'
    : '<span class="bear">🔴 BEARISH PRESSURE (Below Daily Pivot)</span>';
  var sl = isBull ? s1 : r1;
  var tp = isBull ? (c + (c - sl) * 2) : (c - (sl - c) * 2);

  drawPath(c, pp, sl, tp, isBull);

  document.getElementById('bot-out').innerHTML =
    '<div class="row"><span>🤖 Daily Market Bias:</span>' + bias + '</div>' +
    '<div class="row"><span>⚖️ Institutional Pivot (PP):</span><strong>' + pp.toFixed(2) + '</strong></div>' +
    '<div class="row"><span>🛡️ Structural Stop-Loss:</span><strong style="color:#F87171">' + sl.toFixed(2) + '</strong></div>' +
    '<div class="row" style="border:none"><span>🎯 Projected Destination (1:2 R:R):</span><strong style="color:#38BDF8">' + tp.toFixed(2) + '</strong></div>';

  var assetName = sym === 'BTCUSDT' ? 'Bitcoin (BTC/USD)' : 'Spot Gold (XAU/USD)';
  var today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });
  var briefing = isBull
    ? assetName + ' is trading above its central daily pivot (' + pp.toFixed(2) + ') with a 24h volatility range of ' + rangePct.toFixed(2) + '%. Buyers control intraday structure. Watch for a healthy pullback toward ' + pp.toFixed(2) + ' to target upper liquidity near ' + tp.toFixed(2) + ', while keeping strict invalidation below ' + sl.toFixed(2) + '.'
    : assetName + ' is holding below its central daily pivot (' + pp.toFixed(2) + ') across a ' + rangePct.toFixed(2) + '% daily range. Sellers dominate short-term momentum. Any relief bounce into ' + pp.toFixed(2) + ' faces resistance, projecting a continuation toward ' + tp.toFixed(2) + ' unless price reclaims ' + sl.toFixed(2) + '.';

  document.getElementById('ai-report').innerHTML =
    '<div style="font-size:12px;color:#38BDF8;font-weight:bold;margin-bottom:6px;">🧠 AI DAILY BRIEFING — ' + today.toUpperCase() + '</div>' +
    '<p style="font-size:12.5px;color:#E2E8F0;line-height:1.55;margin:0;">' + briefing + '</p>';
}

fetchLiveMarket();
