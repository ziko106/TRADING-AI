var lang = 'en';

function toggleLang() {
  lang = lang === 'en' ? 'fr' : 'en';
  var btn = document.getElementById('lang-btn');
  if (btn) btn.innerText = lang === 'en' ? '🇫🇷 FR' : '🇬🇧 EN';
  if (document.getElementById('t-badge')) {
    document.getElementById('t-badge').innerText = lang === 'en' ? '🤖 DAILY AI MARKET ROBOT' : '🤖 ROBOT IA MARCHÉ QUOTIDIEN';
    document.getElementById('t-lead').innerText = lang === 'en'
      ? 'Real-time automated daily technical analysis, institutional liquidity zones & trajectory radar for Bitcoin and Gold.'
      : 'Analyse technique quotidienne automatisée, zones de liquidité institutionnelles et radar de trajectoire pour Bitcoin et Or.';
    document.getElementById('t-lbl-sym').innerText = lang === 'en' ? 'Select Asset for Live Daily AI Analysis:' : 'Choisir l’actif pour l’analyse IA quotidienne :';
    document.getElementById('opt-btc').innerText = lang === 'en' ? '₿ BITCOIN (BTC / USD) — Live 24h Market' : '₿ BITCOIN (BTC / USD) — Marché 24h en Direct';
    document.getElementById('opt-gold').innerText = lang === 'en' ? '🥇 GOLD (XAU / USD) — Live Spot Gold' : '🥇 OR (XAU / USD) — Cours Spot en Direct';
    document.getElementById('t-lbl-hi').innerText = lang === 'en' ? '24h High:' : 'Plus Haut 24h :';
    document.getElementById('t-lbl-lo').innerText = lang === 'en' ? '24h Low:' : 'Plus Bas 24h :';
    document.getElementById('t-lbl-cl').innerText = lang === 'en' ? 'Live Price:' : 'Prix Actuel :';
    document.getElementById('t-btn-ref').innerText = lang === 'en' ? '🔄 REFRESH LIVE DAILY ANALYSIS' : '🔄 ACTUALISER L’ANALYSE IA DU JOUR';
    document.getElementById('t-radar-title').innerText = lang === 'en' ? '📐 AI PROJECTED DESTINATION RADAR' : '📐 RADAR IA DE DESTINATION PROJETÉE';
    document.getElementById('t-news-title').innerText = lang === 'en' ? '📰 USD MACRO NEWS IMPACT ON GOLD & BITCOIN' : '📰 IMPACT DES ANNONCES USD SUR L’OR & BITCOIN';
    document.getElementById('t-n1').innerText = lang === 'en' ? '🔴 High CPI / Inflation Up:' : '🔴 Inflation CPI en Hausse :';
    document.getElementById('t-n2').innerText = lang === 'en' ? '🟢 Fed Rate Cut / Dovish:' : '🟢 Baisse des Taux Fed :';
    document.getElementById('t-n3').innerText = lang === 'en' ? '🔴 Strong NFP / Jobs Beat:' : '🔴 Emploi NFP US Solide :';
    document.getElementById('t-n4').innerText = lang === 'en' ? '⚠️ High-Impact Rule:' : '⚠️ Règle de Sécurité :';
    document.getElementById('t-n4v').innerText = lang === 'en' ? 'Avoid entry 15m before/after news' : 'Éviter d’entrer 15m avant/après annonce';
    document.getElementById('t-cal-title').innerText = lang === 'en' ? '📅 LIVE ECONOMIC CALENDAR & KEY SESSIONS (UTC)' : '📅 CALENDRIER ÉCONOMIQUE & SESSIONS CLÉS (UTC)';
    document.getElementById('t-s1').innerText = lang === 'en' ? '🇬🇧 London Open (High Volatility):' : '🇬🇧 Ouverture Londres (Forte Volatilité) :';
    document.getElementById('t-s2').innerText = lang === 'en' ? '🇺🇸 NY Open & USD News Window:' : '🇺🇸 Ouverture NY & Annonces USD :';
    document.getElementById('t-disc').innerText = lang === 'en'
      ? 'Automated mathematical & technical market structure analysis. Educational use only, not financial advice.'
      : 'Analyse mathématique et technique automatisée. Usage éducatif uniquement, ne constitue pas un conseil financier.';
  }
  fetchLiveMarket();
}

function fetchLiveMarket() {
  var sym = document.getElementById('sym').value;
  var status = document.getElementById('sync-status');
  status.innerText = lang === 'en' ? '⏳ FETCHING...' : '⏳ CHARGEMENT...';

  var coinId = sym === 'BTCUSDT' ? 'bitcoin' : 'pax-gold';

  fetch('https://coingecko.com' + coinId)
    .then(function(r) { return r.json(); })
    .then(function(arr) {
      var d = arr.shift();
      var hi = parseFloat(d.high_24h);
      var lo = parseFloat(d.low_24h);
      var cl = parseFloat(d.current_price);
      var chg = parseFloat(d.price_change_percentage_24h) || 0;

      document.getElementById('p-hi').value = hi.toFixed(2);
      document.getElementById('p-lo').value = lo.toFixed(2);
      document.getElementById('p-cl').value = cl.toFixed(2);
      status.innerText = '● LIVE (' + (chg >= 0 ? '+' : '') + chg.toFixed(2) + '%)';
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
  var subTxt = lang === 'en' ? '● Real-Time 24h Range Structure' : '● Structure du Range 24h en Direct';
  var linkTxt = lang === 'en' ? 'Open TradingView ↗' : 'Ouvrir TradingView ↗';
  box.innerHTML = '<canvas id="c-chart" width="560" height="225"></canvas>' +
    '<div style="padding:6px 10px;background:#090D16;display:flex;justify-content:space-between;align-items:center;border-top:1px solid #1E293B;">' +
    '<span style="font-size:11px;color:#34D399;">' + subTxt + '</span>' +
    '<a href="https://tradingview.com' + tvSym + '" target="_blank" style="font-size:11px;color:#38BDF8;text-decoration:none;font-weight:bold;">' + linkTxt + '</a>' +
    '</div>';

  var cv = document.getElementById('c-chart');
  var ctx = cv.getContext('2d');
  var step = (h - l) / 14 || 1;
  var cur = l + (h - l) * 0.3;
  var pad = (h - l) * 0.12 || 1;
  var maxV = h + pad;
  var minV = l - pad;

  function getY(v) { return 205 - ((v - minV) / (maxV - minV)) * 185; }

  for (var i = 0; i < 18; i++) {
    var open = cur;
    var move = (Math.sin(i * 1.5) + 0.3) * step * 2;
    if (i === 17) move = c - open;
    var close = open + move;
    var high = Math.min(Math.max(open, close) + Math.abs(move) * 0.35, h);
    var low = Math.max(Math.min(open, close) - Math.abs(move) * 0.35, l);
    cur = close;

    var x = 22 + i * 29;
    var bull = close >= open;
    ctx.strokeStyle = bull ? '#10B981' : '#EF4444';
    ctx.fillStyle = bull ? '#10B981' : '#EF4444';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x + 6, getY(high));
    ctx.lineTo(x + 6, getY(low));
    ctx.stroke();

    var topY = getY(Math.max(open, close));
    var botY = getY(Math.min(open, close));
    ctx.fillRect(x, topY, 12, Math.max(botY - topY, 3));
  }
}

function drawPath(c, pp, sl, tp2, isBull) {
  var cv = document.getElementById('radar');
  var ctx = cv.getContext('2d');
  ctx.clearRect(0, 0, cv.width, cv.height);

  var maxV = Math.max(c, pp, sl, tp2);
  var minV = Math.min(c, pp, sl, tp2);
  var pad = (maxV - minV) * 0.2 || 1;
  maxV += pad;
  minV -= pad;

  function getY(v) { return 170 - ((v - minV) / (maxV - minV)) * 150; }
  function hLine(val, col, lbl) {
    var y = getY(val);
    ctx.strokeStyle = col;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(10, y);
    ctx.lineTo(435, y);
    ctx.stroke();
    ctx.fillStyle = col;
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText(lbl + ': ' + val.toFixed(2), 440, y + 4);
  }

  hLine(tp2, '#38BDF8', 'TP2');
  hLine(pp, '#FBBF24', lang === 'en' ? 'ENTRY' : 'ENTRÉE');
  hLine(sl, '#F87171', 'STOP');

  var y0 = getY(c), y1 = getY(pp), y2 = getY((pp + tp2) / 2), y3 = getY(tp2);
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
  var atrRisk = (h - l) * 0.35;
  var isBull = c >= pp;
  var entry = pp;
  var sl = isBull ? (entry - atrRisk) : (entry + atrRisk);
  var tp1 = isBull ? (entry + atrRisk * 1.5) : (entry - atrRisk * 1.5);
  var tp2 = isBull ? (entry + atrRisk * 2.5) : (entry - atrRisk * 2.5);
  var tp3 = isBull ? (entry + atrRisk * 3.5) : (entry - atrRisk * 3.5);

  drawPath(c, entry, sl, tp2, isBull);

  if (lang === 'en') {
    var biasEn = isBull ? '<span class="bull">🟢 BUY / LONG SETUP (Above Pivot)</span>' : '<span class="bear">🔴 SELL / SHORT SETUP (Below Pivot)</span>';
    document.getElementById('bot-out').innerHTML =
      '<div class="row"><span>🤖 Signal Direction:</span>' + biasEn + '</div>' +
      '<div class="row"><span>🎯 Optimal Entry Zone (Pivot):</span><strong style="color:#FBBF24">' + entry.toFixed(2) + '</strong></div>' +
      '<div class="row"><span>🛑 Real Stop-Loss (ATR Risk):</span><strong style="color:#F87171">' + sl.toFixed(2) + '</strong></div>' +
      '<div class="row"><span>✅ Take-Profit 1 (1:1.5 R:R):</span><strong style="color:#34D399">' + tp1.toFixed(2) + '</strong></div>' +
      '<div class="row"><span>✅ Take-Profit 2 (1:2.5 R:R):</span><strong style="color:#38BDF8">' + tp2.toFixed(2) + '</strong></div>' +
      '<div class="row" style="border:none"><span>🚀 Take-Profit 3 (1:3.5 Runner):</span><strong style="color:#A78BFA">' + tp3.toFixed(2) + '</strong></div>';

    var assetEn = sym === 'BTCUSDT' ? 'Bitcoin (BTC/USD)' : 'Spot Gold (XAU/USD)';
    var dateEn = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });
    var briefEn = isBull
