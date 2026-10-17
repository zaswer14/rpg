/* Vạn Kiếp — GIAO DIỆN. Chỉ đọc S và gọi API của Sim; logic không biết giao diện tồn tại (gắn qua hook). */
(function (G) {
  const J = window.JobLibrary;
  G.init();
  const $ = id => document.getElementById(id);
  const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  // v3: thế giới sinh từ seed (quốc gia, khu dân cư của js/realm.js); bản lưu và mộ gắn với seed thế giới.
  // v4: thế giới động (js/dynamic.js): bản lưu giữ S.world.dyn; đời mới nối tiếp thế giới của đời trước.
  // pref v2: điều khiển tay là chính (mặc định không Tự sống, thời gian chỉ trôi khi bấm Sang năm hoặc bật Tự chạy).
  const SAVE = 'vankiep.save.v4', GRAVES = 'vankiep.graves.v3', PREF = 'vankiep.pref.v2', WORLD = 'vankiep.world.v1';
  const store = {
    get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* bộ nhớ trình duyệt bị chặn: chơi tiếp, không lưu */ } }
  };
  const YEAR_SEC = 8, SPEEDS = [.5, 1, 2, 4, 8];
  const pref = Object.assign({ speed: 1, auto: false, view: 'region', mapZ: 1 }, store.get(PREF) || {});
  // running: Tự chạy (thời gian trôi theo tốc độ). step: đang sống hết một lượt sau khi bấm Sang năm (quyết định chen giữa thì chờ chọn rồi đi tiếp).
  let sim = null, running = false, step = null, dirty = true, selRegion = null, selNation = null, lastHeader = null, deathShown = false, tab = 'log';
  let graves = store.get(GRAVES) || [];
  let dieIv = null;   // xúc xắc trỗi dậy đang lăn
  // Thế giới: ?world=… trên URL, hoặc thế giới đang chơi, hoặc một thế giới mới.
  function useWorld(seed) { G.useWorld(seed); store.set(WORLD, seed); for (const k of Object.keys(bases)) if (k !== 'terrain') delete bases[k]; }
  // Ảnh nền mỗi chế độ xem dựng lần đầu khi cần rồi giữ lại (Vùng, Chính trị, Nguy hiểm dựng lại khi đổi thế giới).
  // Nguy hiểm dựng lại khi Tier nhân vật hoặc Liều mạng đổi (chỉ giữ một bản).
  // Vùng, Chính trị, Nguy hiểm đổi theo thế giới động (tỉnh đổi chủ, khu sụp làm độ hoang đổi): khóa theo realm.rev, mỗi chế độ giữ một bản.
  const bases = {};
  // Lớp đường: dựng lại khi thế giới đổi (đường xuống cấp).
  let roadsLayer = null, roadsKey = null;
  const roadsFor = () => { const k = G.realm.seed + ':' + G.realm.rev; if (roadsKey !== k) { roadsKey = k; roadsLayer = G.renderRoads(G.map, G.realm); } return roadsLayer; };
  // Lớp sọc đỏ: tỉnh đang là tiền tuyến (chế độ Chính trị).
  let warLayer = null, warKey = null;
  const warFor = W => { const k = G.realm.seed + ':' + W.dyn.war.join(); if (warKey !== k) { warKey = k; warLayer = W.dyn.war.some(v => v >= 1) ? G.renderWarLayer(G.map, G.realm, W.dyn.war) : null; } return warLayer; };
  function baseFor(v, ct, cap) {
    const k = v === 'terrain' || v === 'sea' ? v : v === 'danger' ? `danger:${ct}:${cap}:${G.realm.rev}` : v + ':' + G.realm.rev;
    if (!bases[k]) { const pre = v === 'danger' ? 'danger:' : v + ':'; for (const o of Object.keys(bases)) if (o.startsWith(pre)) delete bases[o]; bases[k] = G.renderMapBase(G.map, v, G.realm, { ct, cap }); }
    return bases[k];
  }
  const urlWorld = new URLSearchParams(location.search).get('world');
  useWorld(urlWorld || store.get(WORLD) || G.newSeed());
  const canvas = $('map'), ctx = canvas.getContext('2d');

  if (G.check.errors.length) console.warn('Lỗi dữ liệu:', G.check.errors);
  if (G.realm.check.errors.length) console.warn('Lỗi thế giới:', G.realm.check.errors);

  // ───────── Vòng đời phiên chơi ─────────
  function hook() {
    return {
      log: e => appendLog(e),
      decision: d => showDecision(d),
      year: () => { dirty = true; save(); },
      death: S => onDeath(S),
      hunt: () => { dirty = true; }
    };
  }
  // Kiếp mới sinh vào thế giới của kiếp trước (cùng seed thế giới): năm, nước, khu dân cư, sử biên niên nối tiếp.
  function start(seed, origin, extra) {
    const prev = sim && sim.S && sim.S.world && sim.S.worldSeed === G.realm.seed ? sim.S.world : null;
    sim = new G.Sim({ seed: seed || G.newSeed(), hook: hook() }); instrument(sim);
    sim.autoDecide = pref.auto;
    clearInterval(dieIv);
    clearLog(); step = null;
    deathShown = false; $('deathModal').hidden = true; $('decBox').hidden = true;
    quiet = true;
    try { sim.newLife({ ...(prev ? { world: prev } : {}), ...(origin ? { origin } : {}), ...(extra || {}) }); } finally { quiet = false; }   // origin: xuất thân (js/noble.js); extra: giống loài, vùng (chế độ kiểm duyệt)
    sim.S.auto = pref.auto;
    selRegion = sim.S.loc;
    kdBirth(); dirty = true; save();
  }
  function rise() {
    clearInterval(dieIv);
    clearLog(); step = null; $('decBox').hidden = true;
    deathShown = false; $('deathModal').hidden = true;
    quiet = true; try { sim.rise(); } finally { quiet = false; }
    sim.S.auto = pref.auto;
    selRegion = sim.S.loc;
    kdBirth(); dirty = true; save();
  }
  function save() { if (sim && sim.S) store.set(SAVE, { seed: sim.seed, rs: sim.rs, S: sim.S, world: G.realm.seed }); }
  function load() {
    const d = store.get(SAVE);
    if (!d || !d.S || (d.S.v !== 2 && d.S.v !== 3)) return false;
    try {
      if (urlWorld && d.world !== urlWorld) return false;   // ?world=… trên URL: bắt đầu đời mới ở thế giới đó
      if (d.world && d.world !== G.realm.seed) useWorld(d.world);
      sim = new G.Sim({ seed: d.seed, hook: hook() }); instrument(sim);
      sim.rs = d.rs; sim.S = d.S; sim.autoDecide = pref.auto;
      { const b = store.get(KD_BIRTH); if (b && b.seed === d.seed && b.kiep === d.S.kiep) { birth = b.json; snaps = [{ label: b.label || 'Lúc sinh', kind: 'birth', json: b.json }]; } } renderSnaps();
      G.skMigrate(d.S);   // bản lưu S.v 2 (trước docs/08): quy ra kỹ năng của từng nghề, level 0–60 (js/cult.js)
      G.bindWorld(d.S.world);
      clearLog(); for (const e of d.S.log) appendLog(e, true);
      selRegion = d.S.loc;
      if (d.S.pending) showDecision(d.S.pending);
      if (d.S.dead) onDeath(d.S);
      return true;
    } catch (e) { console.warn('Không đọc được bản lưu', e); return false; }
  }

  // ───────── Nhật ký ─────────
  function clearLog() { $('log').innerHTML = ''; lastHeader = null; }
  function appendLog(e, bulk) {
    if (!sim || !sim.S) return;
    const box = $('log'), nearBottom = box.scrollHeight - box.scrollTop - box.clientHeight < 80;
    const key = e.kiep + ':' + e.age;
    if (key !== lastHeader) {
      lastHeader = key;
      const h = document.createElement('div'); h.className = 'yr';
      h.textContent = sim.S.undead ? `Năm ${e.wy} · năm thứ ${e.yrs} sau khi trỗi dậy` : `Năm ${e.wy} · ${e.yrs} tuổi`;
      box.appendChild(h);
    }
    const d = document.createElement('div'); d.className = 'e ' + e.kind;
    d.innerHTML = (e.arc ? `<span class="arc">${esc(e.arc)}</span>` : '') + esc(e.text) + (pref.kd && pref.kdIds && e.ev ? `<code class="evid">${esc(e.ev)}</code>` : '') + (e.fact ? `<span class="f">${esc(e.fact)}</span>` : '');   // e.arc: mạch truyện (js/story.js)
    box.appendChild(d);
    if (!bulk && nearBottom) box.scrollTop = box.scrollHeight;
    if (bulk) box.scrollTop = box.scrollHeight;
    dirty = true;
  }

  // ───────── Quyết định ─────────
  // Hiện ngay dưới nhật ký (không che bản đồ, nhân vật); phím 1–9 chọn nhanh.
  function showDecision(d, force) {   // force: chế độ kiểm duyệt gọi thẳng, không để Tự sống chọn thay
    if (!force && sim.autoDecide && !sim.S.dead) { const D = G.DECISIONS[d.id]; sim.choose(D.auto ? D.auto(sim.S, sim, d) : d.choices[0].k); dirty = true; return; }
    $('dTitle').textContent = d.title;
    $('dBody').textContent = d.body || '';
    $('dFact').textContent = d.fact || '';
    $('dChoices').innerHTML = '';
    d.choices.forEach((c, i) => {
      const b = document.createElement('button');
      b.innerHTML = `${i < 9 ? `<kbd>${i + 1}</kbd>` : ''}${esc(c.label)}${c.sub ? `<small>${esc(c.sub)}</small>` : ''}`;
      b.onclick = () => { $('decBox').hidden = true; sim.choose(c.k); dirty = true; save(); };
      $('dChoices').appendChild(b);
    });
    $('decBox').hidden = false;
    showTab('log'); $('log').scrollTop = $('log').scrollHeight; $('decBox').scrollIntoView({ block: 'nearest' });
    dirty = true;
  }

  // ───────── Cái chết + xúc xắc trỗi dậy ─────────
  function onDeath(S) {
    if (deathShown) return; deathShown = true;
    const g = { x: S.pos[0], y: S.pos[1], name: S.name, years: sim.years(S), cause: S.cause, rose: !!S.rose, race: S.race, world: G.realm.seed };
    if (!graves.some(o => o.name === g.name && o.years === g.years)) { graves.push(g); graves = graves.slice(-60); store.set(GRAVES, graves); }
    save(); dirty = true;
    setTimeout(() => renderDeath(S), sim.headless ? 0 : 900);
  }
  function renderDeath(S) {
    const reg = G.REGION[S.loc], dom = S.dominant;
    $('epi').innerHTML = `${esc(S.name)}<small>${esc(J.races[S.race].nameVi)} · ${sim.years(S)} ${S.undead ? 'năm sau khi trỗi dậy' : 'tuổi'} · ${esc(S.cause)} · ${esc(reg.nameVi)}, năm ${S.world.year}</small>`;
    drawChart(S);
    const kills = Object.values(S.kills).reduce((a, b) => a + b, 0);
    const topKill = Object.entries(S.kills).sort((a, b) => b[1] - a[1])[0];
    const items = [
      ['Nghề', G.jobLine(sim, S)], ['Level', `${S.level} / ${G.maxLvOf(S)} · ${G.tierName(sim.ctier(S))}`],
      ['Kỹ năng chủ đạo', dom ? `${G.mv(dom.skill)} ${dom.value}` : '—'], ['Sinh kế', S.work ? G.WORKS[S.work].nameVi : '—'],
      ['Quái đã hạ', kills + (topKill ? ` · nhiều nhất ${G.B.byId[topKill[0]].nameVi}` : '')], ['Danh vọng', Math.round(S.fame)],
      ['Tiền để lại', G.coin(S.gold)], ['Con cháu', S.family.kids.length || '—'],
      ['Căn cốt', G.rootText(S) || '—'], ['Thiên phú', S.tal && S.tal.list.length ? S.tal.list.map(id => G.TALENTS[id].nameVi).join(', ') : '—'],
      ['Chí hướng', (G.AIMS[S.aim] || G.AIMS.free).nameVi],
      ['Trận săn', `${S.hunts.won} thắng · ${S.hunts.lost} thua`], ['Kiếp', S.kiep]
    ];
    $('dSum').innerHTML = items.map(([k, v]) => `<div><span>${k}</span>${esc(v)}</div>`).join('');
    // Xúc xắc d100 hiển thị khớp với kết quả đã tung lúc chết (≤ 20 = trỗi dậy).
    const h = G.hash(S.name + S.world.year + S.cause);
    const final = S.rose ? 1 + h % 20 : 21 + h % 80;
    const die = $('die'), txt = $('rollTxt'), btns = $('deathBtns');
    die.className = 'die'; btns.innerHTML = ''; txt.textContent = 'Xương cốt có chịu nằm yên? Tung d100: từ 20 trở xuống thì trỗi dậy.';
    let n = 0;
    clearInterval(dieIv);   // cái chết trước còn đang lăn xúc xắc (tua nhanh qua hai kiếp liền nhau) thì dừng
    const iv = dieIv = setInterval(() => {
      die.textContent = 1 + Math.floor(Math.random() * 100);
      if (++n > 16) {
        clearInterval(iv); die.textContent = final;
        if (S.rose) { die.classList.add('rise'); txt.innerHTML = `<b>${final} ≤ 20.</b> Đất nứt. ${esc(S.name.split(' ')[0])} sẽ trỗi dậy thành Bộ Xương, mang theo <b>${esc(G.mv(S.rose.skill))} ${S.rose.value}</b>.`; }
        else { die.classList.add('rest'); txt.textContent = `${final} > 20. Yên nghỉ.`; }
        if (S.rose) addBtn(btns, `Trỗi dậy thành Bộ Xương`, `Giữ kỹ năng ${G.mv(S.rose.skill)} ${S.rose.value}; mọi thứ khác về số 0.`, rise, true);
        addBtn(btns, 'Sang kiếp mới', 'Một đứa trẻ khác chào đời đâu đó trên đại lục.', () => start());
        if (pref.kd && birth) addBtn(btns, 'Chơi lại kiếp này', 'Chế độ kiểm duyệt: về lúc sinh, cùng xúc xắc; chọn khác thì đời rẽ khác.', kdReplay);
        addBtn(btns, 'Xem lại cuộc đời', 'Đóng bảng này; nút cuối nhật ký mở lại.', () => { $('deathModal').hidden = true; });
      }
    }, 70);
    $('deathModal').hidden = false;
  }
  function addBtn(box, label, sub, fn, primary) {
    const b = document.createElement('button'); if (primary) b.className = 'primary';
    b.innerHTML = `${esc(label)}<small>${esc(sub)}</small>`; b.onclick = fn; box.appendChild(b);
  }
  function drawChart(S) {
    const cv = $('lifeChart'), c = cv.getContext('2d'), W = cv.width, H = cv.height, pad = 26;
    c.clearRect(0, 0, W, H);
    const ys = S.years; if (ys.length < 2) return;
    const x = i => pad + (W - pad * 2) * i / (ys.length - 1), y = v => H - pad - (H - pad * 2) * v / 100;
    c.strokeStyle = '#2a252d'; c.lineWidth = 1; c.fillStyle = '#6f675e'; c.font = '11px system-ui';
    for (const v of [0, 50, 100]) { c.beginPath(); c.moveTo(pad, y(v)); c.lineTo(W - pad, y(v)); c.stroke(); }
    const step = Math.max(1, Math.round(ys.length / 8));
    for (let i = 0; i < ys.length; i += step) c.fillText(ys[i].yrs, x(i) - 6, H - 8);
    const css = getComputedStyle(document.documentElement);
    const series = [['hl', 'Sinh lực'], ['h', 'Tâm trạng'], ['so', 'Quan hệ'], ['sm', 'Hiểu biết']];
    for (const [k] of series) {
      c.strokeStyle = css.getPropertyValue('--' + k).trim(); c.lineWidth = 2; c.beginPath();
      ys.forEach((r, i) => i ? c.lineTo(x(i), y(r[k])) : c.moveTo(x(i), y(r[k]))); c.stroke();
    }
    c.setLineDash([4, 4]); c.strokeStyle = '#e8c26a'; c.lineWidth = 1.5; c.beginPath();
    ys.forEach((r, i) => i ? c.lineTo(x(i), y(r.level / G.MAX_LV * 100)) : c.moveTo(x(i), y(r.level / G.MAX_LV * 100))); c.stroke(); c.setLineDash([]);
    $('chartLegend').innerHTML = series.map(([k, n]) => `<span><i style="background:var(--${k})"></i>${n}</span>`).join('') + '<span><i style="background:#e8c26a"></i>Level (0–60)</span>';
  }

  // ───────── Bảng nhân vật ─────────
  const STAT = [['hl', 'Sinh lực'], ['h', 'Tâm trạng'], ['so', 'Quan hệ'], ['sm', 'Hiểu biết']];
  function renderChar() {
    const S = sim.S, X = sim, reg = X.reg(S), st = X.stage(S), j = X.job(S);
    const homeS = S.home.settlement ? G.SET[S.home.settlement] : null, nat = S.nation != null ? G.realm.nations[S.nation] : null;
    $('cName').textContent = S.name; $('cName').className = 'nm' + (S.undead ? ' undead' : '');
    const sexTxt = S.sex === 'm' ? 'nam' : S.sex === 'f' ? 'nữ' : '';
    $('cMeta').textContent = `${J.races[S.race].nameVi}${sexTxt ? ', ' + sexTxt : ''} · ${X.years(S)} ${S.undead ? 'năm từ khi trỗi dậy' : 'tuổi'} · ${G.STAGES[st]}${S.kiep > 1 ? ` · kiếp ${S.kiep}` : ''}`;
    $('cPlace').textContent = homeS
      ? `${S.urban ? `${homeS.name} (${G.TIER_VI[homeS.tier].toLowerCase()}, ${homeS.urban.toLocaleString('vi')} người)` : `vùng quê quanh ${homeS.name} (${G.TIER_VI[homeS.tier].toLowerCase()})`} · ${reg.nameVi} · ${nat ? nat.name : 'đất vô chủ'}`
      : `lang thang ở ${reg.nameVi}${nat ? ' · ' + nat.name : ''}`;
    const kv = [
      ['Nghề', G.jobLine(X, S)],
      ['Level', `${S.level} / ${G.maxLvOf(S)} · ${G.tierName(X.ctier(S))} (Tier ${X.ctier(S)})` + (G.stuck(S) ? ' · kẹt' : '')],
      ['Sức mạnh', `${X.power(S).toFixed(2)} Tier`],
      ['Tu luyện', `×${G.cultRate(S).toFixed(2).replace('.', ',')}`],   // căn cốt × thiên phú (js/talent.js)
      ['Sinh kế', S.work ? G.WORKS[S.work].nameVi : (S.undead ? '—' : st === 'adult' ? 'chưa có' : '—')],
      ['Thân phận', G.statusText ? G.statusText(S) : G.tierName(X.ctier(S))],   // địa vị theo Tier (js/status.js, docs/09 mục 6.4)
      ['Danh phận', G.standingText ? G.standingText(S, X) : ''],   // xã hội nhận bạn tới đâu (js/tree.js, docs/12)
      ['Quỹ đạo', G.trajText ? G.trajText(S) : ''],   // hướng đời tích từ việc đã làm (js/tree.js)
      ['Đường đời', G.sagaText ? G.sagaText(S) : '—'],   // mạch chính cả đời (js/saga.js, docs/16)
      ['Chương', (G.chapText && G.chapText(S)) || '—'],   // câu hỏi của quãng đời này (js/story.js, docs/13)
      ['Tầng lớp', S.undead ? 'ngoài vòng xã hội' : `${G.CLASSES[S.q].nameVi} · phân vị ${Math.round(S.pct * 100)}`],
      ['Tiền', G.coin(S.gold)], ['Trang bị', `${S.gear}/10`], ['Danh vọng', Math.round(S.fame)],
      ['Giáo phái', S.faith ? `${J.faiths[S.faith].symbol || ''} ${J.faiths[S.faith].nameVi} · ${Math.round(S.devotion)}` : 'không'],
      // Nước đang sống: thuế thật phải nộp và thái độ của nước với chủng tộc mình (js/state.js).
      ['Nước', nat ? `${nat.name} · thuế ${Math.round(G.taxRate(S) * 100)}%${{ fav: ' · được ưu ái', wary: ' · bị dè chừng' }[G.attitude(S)] || ''}` : 'đất vô chủ']
    ];
    $('cKv').innerHTML = kv.map(([k, v]) => `<span class="k">${k}</span><span class="v">${esc(v)}</span>`).join('');
    if (G.statusTip) { const i = kv.findIndex(r => r[0] === 'Thân phận'); $('cKv').children[i * 2 + 1].title = G.statusTip(S); }
    for (const [k, f] of [['Danh phận', () => G.standingTip(S, X)], ['Quỹ đạo', () => G.trajTip(S)]]) { const i = kv.findIndex(r => r[0] === k); if (i >= 0 && G.trajTip) $('cKv').children[i * 2 + 1].title = f(); }
    if (G.workText && S.work) { const i = kv.findIndex(r => r[0] === 'Sinh kế'); $('cKv').children[i * 2 + 1].title = G.workText(S.work); }   // vòng nghề, cầu (js/econ.js)
    if (nat) $('cKv').lastElementChild.title = 'Luật: ' + (nat.laws.map(l => G.LAWS[l].nameVi).join(', ') || 'không có gì đặc biệt');
    // Level, kỹ năng đang rèn, chỉ số (js/cult.js, docs/08).
    const sp = G.skProgress(S), t = sp.t;
    $('xpBar').style.width = (!t ? 100 : t.pick ? 0 : sp.r / t.cap * 100) + '%'; $('xpBar').parentElement.title = G.skText(S);
    $('xpTxt').textContent = `Level ${S.level}/${G.maxLvOf(S)}` + (!t ? ' · hết kỹ năng học được' : t.pick ? ' · chờ chọn kỹ năng để nâng' : ` · ${G.skName(t.key)} bậc ${Math.floor(sp.r)}/${t.cap}`);
    // Chỉ số chạm trần của Tier thì hiện phần dư chờ lên Tier (docs/09 mục 5).
    const stv = G.statsOf(S), ov = G.statOver(S), cap = G.statCap(S), [sa, sb] = G.SCHOOL_STAT[G.schoolOf(S)] || [];
    $('cCombat').innerHTML = G.STATS.map(k => `<span class="${k === sa || k === sb ? 'main' : ''}${stv[k] >= cap ? ' capped' : ''}">${G.STAT_VI[k]} <b>${stv[k]}</b>${ov[k] ? `<i>+${ov[k]}</i>` : ''}</span>`).join('');
    $('cCombat').title = `Chỉ số chính của trường phái đang theo: ${G.STAT_VI[sa]}, ${G.STAT_VI[sb]}. Trần chỉ số của ${G.tierName(X.ctier(S))}: ${cap}; phần vượt (số nhỏ) được cộng khi lên Tier. Sức từ chỉ số ${G.statPow(S).toFixed(2)}, từ kỹ năng đang lắp và cộng hưởng ${G.skillPow(S).toFixed(2)}.`;
    renderSkills(S, X);
    // Căn cốt, thiên phú (js/talent.js): viền theo bậc màu; di chuột xem hiệu ứng.
    $('cTal').innerHTML = G.talChips(S).map((c, i) => `<span class="tchip${i ? '' : ' root'}" style="border-color:${c.col};color:${c.col}" title="${esc(c.title)}">${esc(c.text)}</span>`).join('') || '<span class="fam">Bản lưu cũ: chưa có thiên phú.</span>';
    $('cStats').innerHTML = STAT.map(([k, n]) => `<div class="stat"><span>${n}</span><div class="bar"><i style="width:${S[k]}%;background:var(--${k})"></i></div><span>${Math.round(S[k])}</span></div>`).join('');
    const chips = S.conds.map(c => `<span class="chip">${esc(G.CONDS[c.id].nameVi)}</span>`);
    if (S.flags.companion) chips.push(`<span class="chip ok">Đồng đội: ${esc(S.flags.companion.name)}</span>`);
    if (S.flags.pet) chips.push(`<span class="chip ok">Nuôi ${esc(S.flags.pet)}</span>`);
    // Dấu hệ quả (js/saga.js, docs/16): để lại từ kết của mạch và lựa chọn; di chuột xem từ đâu, còn bao lâu.
    for (const m of (G.markChips ? G.markChips(S) : [])) chips.push(`<span class="chip${m.tone === 'good' ? ' ok' : ''}" title="${esc(m.title)}">${esc(m.text)}</span>`);
    // Học vấn, sư đồ (js/edu.js).
    for (const t of [G.royalText && G.royalText(S), G.houseText && G.houseText(S)]) if (t) chips.push(`<span class="chip ok">${esc(t)}</span>`);
    { const e = G.eduText && G.eduText(S); if (e) chips.push(`<span class="chip ok">${esc(e)}</span>`); for (const t of (G.mentorText ? G.mentorText(S) : [])) chips.push(`<span class="chip ok">${esc(t)}</span>`); }
    if (S.flags.lordSlayer) chips.push(`<span class="chip ok">Kẻ hạ ${esc(S.flags.lordSlayer)}</span>`);
    // Pháp lý: truy nã, tiền án, nghĩa vụ, khổ sai.
    for (const k of Object.keys(S.flags.wanted || {})) chips.push(`<span class="chip">Bị ${esc(G.realm.nations[k] ? G.realm.nations[k].name : '?')} truy nã</span>`);
    if (S.flags.crimes) chips.push(`<span class="chip">Tiền án ${S.flags.crimes}</span>`);
    if (S.flags.soldier) chips.push(`<span class="chip ok">Đang làm lính (còn ${S.flags.soldier} năm)</span>`);
    if (S.flags.labor) chips.push(`<span class="chip">Khổ sai (còn ${S.flags.labor} năm)</span>`);
    $('cConds').innerHTML = chips.join('');
    // Vai trò (js/org.js): trưởng khu, quan, người cai trị, hội; mỗi vai có nút rời / từ chức (không hướng nào bắt buộc).
    // Người quen (js/story.js): dàn nhân vật, độ thân, mạch đang mở; di chuột xem người đó là ai, giờ ra sao.
    { const CR = G.castRows ? G.castRows(S) : [];
      $('cCastBox').hidden = !CR.length;
      $('cCast').innerHTML = CR.map(r => `<div class="cp${r.bond >= 20 ? ' pos' : r.bond <= -20 ? ' neg' : ''}${r.arc ? ' arc' : ''}${r.dead ? ' dead' : ''}" title="${esc(r.title)}"><b>${esc(r.name)}</b><span class="sub">${esc(r.sub)}</span></div>`).join(''); }
    const RLs = S.dead ? [] : G.roleList(S);
    $('cRolesBox').hidden = !RLs.length;
    $('cRoles').innerHTML = RLs.map(r => `<div class="role${r.mgr ? ' mgr' : ''}"><span>${esc(r.text)}</span><button data-what="${r.what}" data-id="${r.id || ''}">${r.what === 'org' || r.what === 'adv' ? (r.mgr && r.what === 'adv' ? 'Giao chi nhánh' : 'Rời') : r.what === 'ruler' ? 'Thoái vị' : r.what === 'noble' || r.what === 'rank' ? 'Từ bỏ' : 'Từ chức'}</button></div>`).join('');
    const ms = Object.entries(S.mastery).filter(([, v]) => v >= 1).sort((a, b) => b[1] - a[1]).slice(0, 8);
    $('cMast').innerHTML = ms.map(([m, v]) => {
      const inh = S.inherited && S.inherited.skill === m;
      return `<div class="mrow${inh ? ' inh' : ''}"><span>${G.mv(m)} <small>${J.schools[G.MASTERY[m]].nameVi}${inh ? ' · kiếp trước' : ''}</small></span><div class="bar"><i style="width:${v}%"></i></div><span>${Math.round(v)}</span></div>`;
    }).join('') || '<span class="fam">Chưa học gì.</span>';
    const F = S.family, rows = [];
    for (const p of F.parents) rows.push(`<span class="${p.alive ? '' : 'dead'}">${p.role[0].toUpperCase() + p.role.slice(1)}: ${esc(p.name)}${p.alive ? ` (${p.age})` : ''}</span>`);
    if (F.sibs.length) rows.push(`<span>Anh chị: ${F.sibs.map(s => `<span class="${s.alive ? '' : 'dead'}">${esc(s.name)}</span>`).join(', ')}</span>`);
    if (F.spouse) rows.push(`<span class="${F.spouse.alive ? '' : 'dead'}">Bạn đời: ${esc(F.spouse.name)}</span>`);
    if (F.kids.length) rows.push(`<span>Con: ${F.kids.map(k => `<span class="${k.alive ? '' : 'dead'}">${esc(k.name)} (${k.age})</span>`).join(', ')}</span>`);
    if (S.undead) rows.push(`<span>Kiếp trước: ${esc(S.flags.pastName || '?')}</span>`);
    $('cFam').innerHTML = rows.join('') || '<span>Không ai.</span>';
  }

  // Kỹ năng nghề: 12 kỹ năng của nghề đang làm (nâng / chỉ bậc 1 / chưa học, gate của nghề nào), rồi kỹ năng nghề cũ đã học.
  // Nút Lắp / Tháo: mặc định tự lắp mạnh nhất; người chơi sửa thì sang tự chọn, "Tự lắp lại" quay về (docs/08 mục 6.2).
  function renderSkills(S, X) {
    const jt = X.job(S) ? X.job(S).tier : 0, up = (S.up || {})[jt] || [], eq = G.loadout(S), n = G.slotsOf(S), list = G.mySkills(S);
    const pips = r => { const f = Math.floor(r + 1e-9); return `<span class="pips">${'●'.repeat(f)}<i>${'●'.repeat(5 - f)}</i></span>`; };
    const row = (key, nm, sub, cls) => {
      const r = G.rankOf(S, key), on = eq.includes(key), can = r >= 1 - 1e-9 && !S.dead && (on || eq.length < n);
      return `<div class="skrow ${cls}" title="${esc(sub)}"><span class="nm">${esc(nm)}</span>${pips(r)}<button data-k="${key}" class="${on ? 'on' : ''}"${can ? '' : ' disabled'}>${on ? 'Tháo' : 'Lắp'}</button></div>`;
    };
    const rows = list.map(s => {
      const isUp = up.includes(s.key), cap = !isUp && up.length >= G.SK_UP;
      const sub = `${G.skDesc(s.key) ? G.skDesc(s.key) + ' · ' : ''}${G.mv(s.m)}${s.gateFor.length ? ' · gate vào ' + s.gateFor.map(id => X.jobName(S, id)).join(', ') : ''} · ${isUp ? 'được nâng' : cap ? 'chỉ tới bậc 1' : 'chưa chọn nâng'}`;
      return row(s.key, G.skName(s.key), sub, (s.gateFor.length ? 'gate ' : '') + (cap ? 'cap' : ''));
    });
    const mine = new Set(list.map(s => s.key));
    const old = Object.keys(S.sk || {}).filter(k => !mine.has(k) && S.sk[k].r >= 1 - 1e-9).sort((a, b) => G.skEff(b, S.sk[b].r) - G.skEff(a, S.sk[a].r)).slice(0, 8);
    // Cộng hưởng chiêu thức của các kỹ năng đang lắp (js/cult.js G.resonance).
    const rs = G.resOf(S).pairs, resTxt = rs.length ? `<div class="sksub res" title="${esc(rs.map(p => `${p.r.nameVi}: ${p.r.txt}`).join('\n'))}">Cộng hưởng: ${rs.map(p => `${esc(p.r.nameVi)} (${esc(G.skName(p.a))} + ${esc(G.skName(p.b))}) +${p.v.toFixed(2).replace(".", ",")}`).join(' · ')}</div>` : '';
    $('cSk').innerHTML = `<div class="sksub">Nâng ${up.length}/${G.SK_UP} · lắp ${eq.length}/${n} · ◆ kỹ năng gate</div>` + resTxt + rows.join('')
      + (old.length ? `<div class="sksub">Kỹ năng nghề cũ</div>` + old.map(k => row(k, G.skName(k), `Tier ${k.split(':')[0]}`, '')).join('') : '');
    $('cEqMode').textContent = S.equip ? '· tự chọn' : '· tự lắp';
    $('btnAutoEq').hidden = !S.equip;
  }
  $('cSk').addEventListener('click', ev => {
    const b = ev.target.closest('button'); if (!b || !sim.S || sim.S.dead) return;
    if (G.equipToggle(sim.S, b.dataset.k)) { dirty = true; save(); }
  });
  $('btnAutoEq').onclick = () => { if (sim.S) { G.equipReset(sim.S); dirty = true; save(); } };
  $('cRoles').addEventListener('click', ev => {
    const b = ev.target.closest('button'); if (!b || !sim.S || sim.S.dead) return;
    const txt = G.leaveRole(sim.S, sim, b.dataset.what, b.dataset.id || null);
    if (txt) sim.log(txt, 'choice');
    dirty = true;
  });
  function renderFocus() {
    const S = sim.S, st = sim.stage(S), box = $('focusBtns');
    box.innerHTML = '';
    for (const [k, F] of Object.entries(G.FOCUS)) {
      if (!F.stages.includes(st) && !(st === 'infant' && k === 'play')) continue;
      if (F.need && !F.need(S)) continue;   // Quản lý: chỉ khi đang giữ chức
      const b = document.createElement('button');
      b.textContent = `${F.icon} ${F.nameVi}`; b.className = S.focus === k ? 'on' : '';
      b.disabled = S.dead || st === 'infant' || ((k === 'hunt' || k === 'adventure') && !S.zoneSel);
      b.onclick = () => { S.focus = k; setAuto(false); dirty = true; };
      box.appendChild(b);
    }
    if (st === 'infant') box.insertAdjacentHTML('beforeend', '<span class="fam">Còn ẵm ngửa; chưa tự chọn được.</span>');
    // Chí hướng (js/talent.js): đổi lúc nào cũng được, không tắt Tự sống.
    const sel = $('aimSel'), A = G.AIMS[S.aim] || G.AIMS.free;
    if (document.activeElement !== sel) sel.value = S.aim || 'free';
    sel.disabled = S.dead;
    $('aimTip').textContent = A.d;
  }
  $('aimSel').innerHTML = Object.entries(G.AIMS).map(([k, A]) => `<option value="${k}">${A.icon} ${esc(A.nameVi)}</option>`).join('');
  $('aimSel').onchange = e => {
    const S = sim && sim.S; if (!S || S.dead) return;
    G.setAim(S, e.target.value); S.flags.aimSet = true;
    sim.log(`Chí hướng: ${G.AIMS[S.aim].nameVi.toLowerCase()}.`, 'choice');
    dirty = true; save();
  };

  const ZCOL = { safe: 'var(--safe)', fair: 'var(--fair)', risky: 'var(--risky)', locked: 'var(--locked)' };
  const ZTXT = { safe: 'an toàn', fair: 'vừa sức', risky: 'nguy hiểm', locked: 'khóa' };
  function renderZones() {
    const S = sim.S, reg = sim.reg(S), zs = sim.zonesFor(S), box = $('zones');
    $('huntRegion').textContent = reg.nameVi;
    $('reckless').checked = !!S.reckless;
    box.innerHTML = '';
    for (const z of zs) {
      const b = document.createElement('button');
      b.className = 'zone' + (S.zoneSel === z.zone.id ? ' sel' : ''); b.style.setProperty('--c', ZCOL[z.level]);
      b.disabled = !z.open || S.dead;
      const pop = G.densityOf(S.world, G.zoneKey(z.zone, G.provOfS(S)));
      b.innerHTML = `<span class="band">${G.BAND_VI[z.index]}</span><b>${esc(z.zone.nameVi)}</b><span class="t">Tier ${z.zone.tier[0]}${z.zone.tier[1] > z.zone.tier[0] ? '–' + z.zone.tier[1] : ''}</span> · ${ZTXT[z.level]}<div class="pop" title="Mật độ quái ${pop.toFixed(2)}"><i style="width:${Math.min(100, pop / 2.2 * 100)}%"></i></div>`;
      b.onclick = () => { S.zoneSel = z.zone.id; S.zoneManual = true; dirty = true; };
      box.appendChild(b);
    }
    const z = S.zoneSel && G.ZONE[S.zoneSel] ? G.ZONE[S.zoneSel].zone : null;
    if (!z) { $('zoneMons').innerHTML = '<span class="mon">Không khu nào vừa sức ở vùng này.</span>'; return; }
    const ct = sim.ctier(S), cap = ct + (S.reckless ? 2 : 1);
    $('zoneMons').innerHTML = Object.keys(z.spawns).map(id => G.B.byId[id]).sort((a, b) => a.tier - b.tier)
      .map(s => `<span class="mon${s.tier > cap ? ' over' : ''}" title="${esc(G.B.families[s.family].nameVi + ': ' + s.attack)}">${esc(s.nameVi)} <span class="tt">T${s.tier}</span></span>`).join('')
      + `<span class="mon">Bạn gặp tối đa Tier ${cap}</span>`;
  }

  // Bảng quốc gia (chế độ Chính trị): mẫu, chính thể, người cai trị, chỉ số, luật, thái độ, đặc tính, đặc trưng, dân, tỉnh, quan hệ.
  function renderNation(box) {
    const RL = G.realm, n = RL.nations[selNation], gov = G.GOVS[n.gov];
    const own = RL.settlements.filter(s => s.nation === n.idx && s.tier !== 'ruin');
    const pop = RL.provinces.filter(p => p.nation === n.idx).reduce((a, p) => a + p.pop, 0), urban = own.reduce((a, s) => a + s.urban, 0);
    const cnt = ['capital', 'city', 'town', 'village', 'hamlet'].map(t => [t, own.filter(s => s.tier === t).length]).filter(([, k]) => k).map(([t, k]) => `${k} ${G.TIER_VI[t].toLowerCase()}`).join(', ');
    const rname = r => J.races[r].nameVi, qname = q => { const Q = G.QUIRKS.find(x => x.id === q.id); return Q.nameVi + (q.target != null ? ` (${RL.nations[q.target].name})` : '') + (q.race ? ` (${rname(q.race)})` : ''); };
    const D = sim.S.world.dyn, cap = G.SET[n.capital], yr = sim.S.world.year;
    // Chiến tranh đang đánh, hưu chiến còn hạn (js/dynamic.js).
    const wars = D.wars.filter(w => w.a === n.idx || w.b === n.idx).map(w => { const o = RL.nations[w.a === n.idx ? w.b : w.a], sc = w.a === n.idx ? w.score : -w.score; return `với ${esc(o.name)} (năm thứ ${w.years + 1}, ${sc > .3 ? 'đang thắng thế' : sc < -.3 ? 'đang núng thế' : 'giằng co'})`; }).join(' · ');
    const truce = Object.entries(D.truce).filter(([k, y]) => y > yr && k.split(':').map(Number).includes(n.idx)).map(([k, y]) => { const o = RL.nations[k.split(':').map(Number).find(v => v !== n.idx)]; return `${esc(o.name)} tới năm ${y}`; }).join(' · ');
    const rel = RL.nations.filter(o => o !== n && o.alive !== false).map(o => { const v = n.relations[o.idx] || 0; return `<span style="color:${v > 0 ? 'var(--good)' : v < 0 ? 'var(--bad)' : 'var(--dim)'}">${esc(o.name)} ${v > 0 ? '+' : ''}${v}</span>`; }).join(' · ');
    const provs = RL.provinces.filter(p => p.nation === n.idx).sort((a, b) => b.pop - a.pop).map(p => `${esc(p.name)} (${p.pop.toLocaleString('vi')})`).join(' · ');
    const big = own.slice().sort((a, b) => b.urban - a.urban).slice(0, 8).map(s => `${esc(s.name)} <span class="fam">${G.TIER_VI[s.tier].toLowerCase()} ${s.urban.toLocaleString('vi')}${s.roles.length ? ', ' + s.roles.map(r => G.ROLE_VI[r]).join(', ') : ''}</span>`).join(' · ');
    box.innerHTML = `<h4 style="color:${n.color}">${esc(n.name)}</h4>
      <div class="row"><span>${esc(rname(n.race))} · mẫu ${esc(n.label)}</span><span>${esc(gov.nameVi)}</span><span>Quốc giáo: ${n.faith ? esc(J.faiths[n.faith].nameVi) : 'không'}</span></div>
      <div class="row">${n.ruler ? `<span>${esc(n.ruler.title)} ${esc(n.ruler.name)}, ${n.ruler.age} tuổi${n.ruler.player ? ' (bạn)' : ''}</span>` : '<span>Không có người cai trị</span>'}<span>Thăng tiến: ${esc(gov.promo)}</span></div>
      <div class="row"><span>Thuế ${Math.round(n.tax * 100)}%</span><span>Quân ${n.army}</span><span>Tuần tra ${n.patrol}</span><span>Ổn định ${Math.round(n.stability * 100)}</span><span>Tham vọng ${Math.round(n.ambition * 100)}</span></div>
      <div class="row"><span>Luật: ${n.laws.map(l => esc(G.LAWS[l].nameVi)).join(', ') || 'không có gì đặc biệt'}</span></div>
      <div class="row"><span>Ưu ái: ${n.tolerant ? 'mọi chủng tộc' : esc(n.fav.map(rname).join(', ') || 'không')}</span><span>Dè chừng: ${esc(n.wary.length > 6 ? 'mọi chủng tộc khác' : n.wary.map(rname).join(', ') || 'không')}</span></div>
      <div class="rz"><b>${esc(n.trait.nameVi)}</b>: ${esc(n.trait.desc)}</div>
      <div class="row"><span>Đặc trưng: ${esc(n.quirks.map(qname).join(', '))}</span>${n.overlord != null ? `<span>Chư hầu của ${esc(RL.nations[n.overlord].name)}</span>` : ''}</div>
      <div class="row"><span>Kinh đô: ${cap ? esc(cap.name) : '—'}</span>${n.founded ? `<span>Lập năm ${n.founded}</span>` : ''}</div>
      <div class="row"><span>Dân ${pop.toLocaleString('vi')} · đô thị ${Math.round(urban / Math.max(1, pop) * 100)}%</span><span>${cnt}</span></div>
      <div class="rz"><b>Tỉnh</b> · ${provs}</div>
      <div class="rz"><b>Khu dân cư lớn</b> · ${big}</div>
      ${G.grantsTitles && G.grantsTitles(n.idx) ? `<div class="rz"><b>Quý tộc</b> · ${G.noblesOf(sim.S.world, n.idx).slice(0, 10).map(x => `${G.NOBLE_VI[x.rank]} ${esc(x.name)}${x.player && x.name === sim.S.name ? ' (bạn)' : ''}`).join(' · ')}</div>` : ''}
      <div class="rz"><b>Quan hệ</b> · ${rel}</div>
      ${wars ? `<div class="rz" style="color:var(--bad)"><b>Đang chiến tranh</b> · ${wars}</div>` : ''}${truce ? `<div class="rz"><b>Hưu chiến</b> · ${truce}</div>` : ''}`;
    box.hidden = false;
  }

  const tripCache = { key: null, plan: null };
  function renderRegion() {
    const box = $('regionPanel');
    if (pref.view === 'political' && selNation != null) return renderNation(box);
    if (!selRegion) { box.hidden = true; return; }
    const S = sim.S, R = G.REGION[selRegion], bio = J.biomes[R.biome], D = S.world.dyn;
    // Tình hình vùng: dịch theo vùng; chiến tranh, thú triều theo các tỉnh có thủ phủ trong vùng. Mật độ quái: tỉnh nơi mình ở, hoặc tỉnh của khu lớn nhất vùng.
    const provs = G.realm.provinces.filter(p => G.SET[p.seat].region === R.id).map(p => p.idx);
    const rs = { plague: (S.world.regions[R.id] || {}).plague || 0, war: Math.max(0, ...provs.map(p => D.war[p])), raid: Math.max(0, ...provs.map(p => D.raid[p])) };
    const main = G.mainSettlement(R.id), dp = R.id === S.loc ? G.provOfS(S) : main ? main.province : -1;
    const top = (o, f) => Object.entries(o).filter(([k]) => k !== 'none').sort((a, b) => b[1] - a[1]).slice(0, 3).map(([k]) => f(k)).join(', ');
    // Chuyến đi tới vùng này (js/travel.js): số ngày, phần trên đường, có phải thuê hộ tống không. Tính lại khi đổi vị trí / vùng / Tier.
    const able = !S.dead && ['teen', 'adult', 'elder'].includes(sim.stage(S)) && R.id !== S.loc;
    const tkey = `${S.pos}|${R.id}|${G.capOf(S)}`;
    if (able && tripCache.key !== tkey) { tripCache.key = tkey; tripCache.plan = G.planTrip(S, R.id); }
    const plan = able ? tripCache.plan : null, moved = S.flags.movedAge === S.age;
    const canGo = plan && !plan.fail && !moved && (!plan.escort || S.gold >= plan.fee);
    const tripTxt = G.tripText(plan);
    // Tỉ lệ diện tích từng tầng của vùng ở thế giới này (độ hoang theo khu dân cư).
    const bc = G.realm.bandCells[G.map.idx[R.id]], btot = bc.reduce((a, c) => a + c.length, 0) || 1;
    const zones = R.zones.map((z, i) => {
      const ms = Object.keys(z.spawns).map(id => G.B.byId[id]).sort((a, b) => a.tier - b.tier).map(s => `${s.nameVi} T${s.tier}`).join(', ');
      const share = bc[i].length ? `${Math.max(1, Math.round(bc[i].length / btot * 100))}% diện tích` : 'không có ở thế giới này';
      return `<div class="rz${bc[i].length ? '' : ' absent'}"><b>${G.BAND_VI[i]}: ${esc(z.nameVi)}</b> · Tier ${z.tier[0]}–${z.tier[1]} · ${share} · mật độ ${G.densityOf(S.world, G.zoneKey(z, dp)).toFixed(2)}<br><span class="fam">${esc(ms)}</span></div>`;
    }).join('');
    const state = [rs.plague > 0 ? 'đang có dịch' : '', rs.war > 0 ? 'đang chiến tranh' : '', rs.raid > 0 ? `thú triều ${rs.raid.toFixed(2)}` : ''].filter(Boolean).join(' · ');
    box.innerHTML = `<h4>${esc(R.nameVi)}</h4>
      <div class="row"><span>${esc(bio.nameVi)}</span><span>Giàu ${Math.round(R.wealth * 100)}</span><span>Gini ${R.gini}</span><span>Nguy hiểm ${Math.round(R.danger * 100)}</span><span>Ma lực ${Math.round(R.magic * 100)}</span>${state ? `<span style="color:var(--bad)">${state}</span>` : ''}</div>
      <div class="lore">${esc(R.lore)}</div>
      <div class="row"><span>Dân: ${esc(top(R.races, k => J.races[k].nameVi))}</span><span>Đạo: ${esc(top(R.faiths, k => J.faiths[k].nameVi) || 'không')}</span></div>
      <div class="row"><span>${G.settlementsIn(R.id).slice(0, 8).map(s => `${esc(s.name)} <span class="fam">${G.TIER_VI[s.tier].toLowerCase()}</span>`).join(' · ') || 'Không có khu dân cư'}</span></div>
      ${zones}
      ${R.lord ? `<div class="rz" style="color:var(--risky)">Chúa vùng: ${esc(G.B.byId[R.lord.species].nameVi)} (ngủ ở ${esc(G.ZONE[R.lord.zone].zone.nameVi)})</div>` : ''}
      ${tripTxt ? `<div class="row"><span>${esc(tripTxt)}</span></div>` : ''}
      <div class="act">${S.dead ? '' : R.id === S.loc ? '<span class="fam">Bạn đang ở đây.</span>' : canGo ? `<button class="btn" id="goBtn">${plan.escort ? 'Thuê hộ tống, lên đường' : 'Lên đường tới đây'}</button>` : `<span class="fam">${!able ? 'Trẻ con chưa tự đi xa được.' : moved ? 'Năm nay đã đi một chuyến.' : plan && plan.escort && !plan.fail ? 'Chưa đủ tiền thuê hộ tống.' : ''}</span>`}</div>`;
    box.hidden = false;
    const go = $('goBtn');
    if (go) go.onclick = () => { S.flags.movedAge = S.age; tripCache.key = null; const t = G.moveTo(sim, R.id, { escort: true }); if (t) sim.log(t, 'info'); dirty = true; save(); };
  }

  function renderSide() {
    const S = sim.S;
    const peers = S.peers || [];
    $('peerCount').textContent = peers.length ? `(${peers.filter((p, i) => !S.peerSeen[i]).length}/${peers.length} còn sống)` : '';
    $('peers').innerHTML = peers.map((p, i) => {
      const gone = S.peerSeen[i];
      return `<div class="prow${gone ? ' gone' : ''}"><b>${esc(p.name)}</b> · ${esc(J.races[p.race].nameVi)} · ${esc(p.settlement || p.regionName)}<br>${gone ? `mất ở tuổi ${p.years}: ${esc(p.cause)}${p.rose ? ' · đã trỗi dậy' : ''}` : 'còn sống'}</div>`;
    }).join('') || '<div class="prow">Kiếp này không có đồng niên.</div>';
    // Biên niên sử của thế giới (js/dynamic.js): 40 dòng gần nhất, mới nhất trên cùng.
    const H = (S.world.dyn && S.world.dyn.hist) || [];
    $('chronCount').textContent = H.length ? `(${H.length})` : '';
    $('chron').innerHTML = H.slice(-40).reverse().map(h => `<div class="prow"><b>Năm ${h.y}</b> · ${esc(h.t)}</div>`).join('') || '<div class="prow">Chưa có gì đáng ghi.</div>';
    const L = S.lineage || [];
    $('lineageTab').hidden = !L.length;
    if (!L.length && tab === 'lineage') showTab('log');
    $('lineage').innerHTML = L.map(l => `<div class="prow"><b>Kiếp ${l.kiep}: ${esc(l.name)}</b> · ${esc(l.raceVi)}<br>${l.years} tuổi, ${esc(l.cause)} · ${esc(l.job)} level ${l.level}${l.dominant ? ` · chủ đạo ${esc(G.mv(l.dominant.skill))} ${l.dominant.value}` : ''}</div>`).join('');
  }

  function renderYear() {
    const S = sim.S, ypt = sim.R(S).ypt;
    $('yBar').style.width = Math.min(100, S.t * 100) + '%';
    $('yLabel').textContent = `Năm ${S.world.year} · ${sim.years(S)} ${S.undead ? 'năm từ khi trỗi dậy' : 'tuổi'}${S.dead ? ' · đã mất' : S.pending && !$('decBox').hidden ? ' · chờ bạn quyết định' : running ? ' · đang tự chạy' : ''}`;
    // Nút chính: sống hết lượt này (người trường thọ một lượt nhiều năm); đã mất thì mở lại bảng tổng kết.
    const nb = $('btnNext');
    nb.textContent = S.dead ? 'Tổng kết kiếp này ▸' : ypt > 1 ? `Qua ${ypt} năm ▸` : 'Sang năm ▸';
    nb.disabled = !S.dead && (!!S.pending || !!step);
  }
  // Thẻ của cột giữa: Cuộc đời (nhật ký), Biên niên sử, Đồng niên, Các kiếp trước.
  function showTab(t) {
    tab = t;
    for (const b of $('tabs').children) { const on = b.dataset.t === t; b.classList.toggle('on', on); b.setAttribute('aria-selected', on); }
    for (const id of ['log', 'chron', 'peers', 'lineage']) $(id).hidden = id !== t;
  }
  for (const b of $('tabs').children) b.onclick = () => showTab(b.dataset.t);

  // ───────── Bản đồ ─────────
  // Khung nhìn: z (1 = cả đại lục), góc trên trái (ox, oy) theo tọa độ bản đồ; follow = bám theo nhân vật (nút ⌖, tắt khi kéo).
  const view = { z: Math.max(1, Math.min(6, +pref.mapZ || 1)), ox: 0, oy: 0, follow: (+pref.mapZ || 1) > 1 };
  function clampView() {
    const W = canvas.width, H = canvas.height;
    view.z = Math.max(1, Math.min(6, view.z));
    view.ox = Math.max(0, Math.min(W - W / view.z, view.ox)); view.oy = Math.max(0, Math.min(H - H / view.z, view.oy));
    $('zIn').disabled = view.z >= 6; $('zOut').disabled = view.z <= 1;
  }
  function centerOn(x, y) { view.ox = x - canvas.width / view.z / 2; view.oy = y - canvas.height / view.z / 2; clampView(); }
  // Phóng to / thu nhỏ quanh điểm (x, y) của bản đồ: điểm đó đứng yên trên màn hình.
  function zoomAt(f, x, y) {
    const z0 = view.z, z = Math.max(1, Math.min(6, z0 * f));
    view.ox = x - (x - view.ox) * z0 / z; view.oy = y - (y - view.oy) * z0 / z; view.z = z; clampView();
    pref.mapZ = Math.round(z * 100) / 100; store.set(PREF, pref);
  }
  const viewMid = () => [view.ox + canvas.width / view.z / 2, view.oy + canvas.height / view.z / 2];
  let hoverCell = null, t0 = performance.now();
  function drawMap(now) {
    const S = sim.S;
    const peers = (S.peers || []).map((p, i) => ({ x: p.bornPos[0], y: p.bornPos[1], dead: !!S.peerSeen[i] })).filter(p => !p.dead);
    const ct = sim.ctier(S), cap = ct + (S.reckless ? 2 : 1);
    if (view.follow && view.z > 1) centerOn(S.pos[0], S.pos[1]);
    ctx.setTransform(view.z, 0, 0, view.z, -view.ox * view.z, -view.oy * view.z);
    G.drawMap(ctx, G.map, baseFor(pref.view, ct, cap), {
      selected: selRegion, zoneSel: selRegion === S.loc && S.zoneSel ? G.ZONE[S.zoneSel].index : null,
      path: S.path2, me: S.dead ? null : S.pos, undead: S.undead, time: (now - t0) / 1000,
      graves: graves.filter(g => g.world === G.realm.seed), realm: G.realm, roads: roadsFor(), view: pref.view, peers,
      war: pref.view === 'political' && S.world.dyn ? warFor(S.world) : null, hunt: !S.dead && (S.focus === 'hunt' || S.focus === 'adventure') ? S.huntPos : null,
      seaLines: pref.view === 'sea' && !S.dead ? G.seaLinesFrom(S) : null,
      sites: pref.view === 'danger' ? sitesFor(S) : null, textScale: 1 / Math.sqrt(view.z)
    });
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }
  // Hang ổ, di tích, ổ chúa của thế giới đang sống (chế độ Nguy hiểm; js/dynamic.js, js/realm.js).
  function sitesFor(S) {
    const W = S.world;
    return {
      lairs: ((W.dyn && W.dyn.lairs) || []).map(l => ({ pos: G.lairPos(l), lv: l.lv, empty: l.empty != null })),
      dungeons: (G.realm.dungeons || []).map(d => ({ x: d.x, y: d.y, done: [0, 1, 2].every(k => G.dungeonCleared(W, d, k)) })),
      nests: G.realm.nests || []
    };
  }
  // Dòng tooltip cho hang ổ, di tích, ổ chúa gần con trỏ.
  function siteTip(S, x, y) {
    const W = S.world, out = [], near = (px, py, r) => Math.hypot(px - x, py - y) < r;
    for (const l of (W.dyn && W.dyn.lairs) || []) {
      const [lx, ly] = G.lairPos(l); if (!near(lx, ly, 7)) continue;
      const z = G.lairZone(l);
      out.push(l.empty != null ? `<b>${esc(l.name)}</b> · hang trống, quái có thể về lại từ năm ${l.empty}`
        : `<b>${esc(l.name)}</b> · ${G.LAIR_VI[l.lv]} (level ${l.lv}) ở ${esc(z.nameVi)} · ${G.tierTxt(z)} · ${G.LAIR_FIGHTS[l.lv]} trận để dọn${l.lv === 3 ? ' · <span style="color:var(--bad)">quái tràn ra tầng ven</span>' : ''}`);
    }
    for (const d of G.realm.dungeons || []) {
      if (!near(d.x, d.y, 8)) continue;
      out.push(`<b>${esc(d.name)}</b> · di tích${d.nation != null ? ' (kho báu thất lạc của ' + esc(G.realm.nations[d.nation].name) + ')' : ''}<br>` + G.dungeonFloors(d).map((z, k) => `${z.nameVi} ${G.tierTxt(z)}${G.dungeonCleared(W, d, k) ? ' (đã dọn)' : ''}`).join(' · '));
    }
    for (const n of G.realm.nests || []) if (near(n.x, n.y, 8)) out.push(`<b>Ổ chúa</b> · ${esc(G.B.byId[n.species].nameVi)} ngủ ở đây; thức giấc khi có người đủ cấp 40 trong vùng`);
    return out.length ? '<br>' + out.join('<br>') : '';
  }
  // Điểm trên bản đồ (tọa độ của G.map) dưới con trỏ, đã tính khung nhìn.
  function canvasPoint(ev) {
    const r = canvas.getBoundingClientRect();
    return [view.ox + (ev.clientX - r.left) / r.width * canvas.width / view.z, view.oy + (ev.clientY - r.top) / r.height * canvas.height / view.z];
  }
  // Kéo để dời khung nhìn (khi đã phóng to); nhấp không kéo thì chọn vùng.
  let drag = null;
  canvas.addEventListener('pointerdown', ev => {
    if (ev.button !== 0) return;
    drag = { x: ev.clientX, y: ev.clientY, ox: view.ox, oy: view.oy, moved: false };
    canvas.setPointerCapture(ev.pointerId);
  });
  canvas.addEventListener('pointermove', ev => {
    if (!drag) return;
    const dx = ev.clientX - drag.x, dy = ev.clientY - drag.y;
    if (!drag.moved && Math.hypot(dx, dy) < 5) return;
    if (view.z <= 1) return;
    drag.moved = true; view.follow = false; canvas.classList.add('drag'); $('tip').hidden = true;
    const r = canvas.getBoundingClientRect();
    view.ox = drag.ox - dx / r.width * canvas.width / view.z; view.oy = drag.oy - dy / r.height * canvas.height / view.z; clampView();
  });
  canvas.addEventListener('pointerup', ev => {
    const d = drag; drag = null; canvas.classList.remove('drag');
    if (!d || d.moved) return;
    const [x, y] = canvasPoint(ev), c = G.map.at(x, y);
    selRegion = c ? c.region.id : null;
    const n = c ? G.nationAtCell(c.cell) : null; selNation = n ? n.idx : null;
    dirty = true;
  });
  canvas.addEventListener('pointercancel', () => { drag = null; canvas.classList.remove('drag'); });
  canvas.addEventListener('wheel', ev => { ev.preventDefault(); const [x, y] = canvasPoint(ev); view.follow = false; zoomAt(ev.deltaY < 0 ? 1.25 : .8, x, y); }, { passive: false });
  $('zIn').onclick = () => zoomAt(1.5, ...(view.follow ? sim.S.pos : viewMid()));
  $('zOut').onclick = () => zoomAt(1 / 1.5, ...(view.follow ? sim.S.pos : viewMid()));
  $('zMe').onclick = () => { if (view.z < 2) zoomAt(2.5 / view.z, ...sim.S.pos); view.follow = true; centerOn(...sim.S.pos); };
  function setBig(on) { document.body.classList.toggle('mapbig', on); $('zBig').textContent = on ? '✕' : '⛶'; $('zBig').title = on ? 'Thu bản đồ về góc (M, Esc)' : 'Mở rộng bản đồ (M)'; $('tip').hidden = true; }
  $('zBig').onclick = () => setBig(!document.body.classList.contains('mapbig'));
  $('mapShade').onclick = () => setBig(false);
  clampView();
  canvas.addEventListener('mousemove', ev => {
    if (drag && drag.moved) return;
    const [x, y] = canvasPoint(ev), c = G.map.at(x, y), tip = $('tip');
    const S = sim.S, ct = sim.ctier(S), cap = ct + (S.reckless ? 2 : 1);
    const place = (t) => { const r = canvas.getBoundingClientRect(); t.style.left = Math.min(ev.clientX - r.left + 14, r.width - 270) + 'px'; t.style.top = (ev.clientY - r.top + 14) + 'px'; t.hidden = false; };
    if (!c) {
      // Ô biển: vùng biển, tầng, sức mình, thời tiết, tàu nào vào được; bến gần con trỏ.
      const sc = G.map.seaAt(x, y); if (!sc) { tip.hidden = true; return; }
      const t = sc.zone.tier, lvl = t[1] <= ct ? 'safe' : t[0] <= ct ? 'fair' : t[0] <= cap ? 'risky' : 'locked';
      const ships = G.SHIPS.filter(s => s.maxBand >= sc.zoneIndex).map(s => s.nameVi);
      const hb = (G.realm.harbors || []).find(h => Math.hypot(h.x - x, h.y - y) < 12);
      tip.innerHTML = `<b>${esc(sc.name)}</b> · ${esc(sc.sea.nameVi.toLowerCase())}<br>${G.SEA_BAND_VI[sc.zoneIndex]}: ${esc(sc.zone.nameVi)} · <span style="color:${ZCOL[lvl]}">Tier ${t[0]}${t[1] > t[0] ? '–' + t[1] : ''} · ${ZTXT[lvl]} với bạn</span>`
        + `<br>${esc(sc.sea.weather)} · mật độ quái ${(S.world.zonePop[sc.zone.id] ?? 1).toFixed(2)}<br>${ships.length ? 'Tàu vào được: ' + ships.join(', ') : 'Không tàu nào tới được tầng này'}`
        + (hb ? `<br><b>${esc(hb.name)}</b> · bến có ${G.SHIPS[hb.ship].nameVi}` : '');
      return place(tip);
    }
    const lvl = c.zone.tier[1] <= ct ? 'safe' : c.zone.tier[0] <= ct ? 'fair' : c.zone.tier[0] <= cap ? 'risky' : 'locked';
    // Khu dân cư gần con trỏ (bán kính theo cỡ ký hiệu), tỉnh và nước của ô.
    const near = G.realm.settlements.filter(s => Math.hypot(s.x - x, s.y - y) < ({ capital: 10, city: 9, town: 8 }[s.tier] || 6)).sort((a, b) => Math.hypot(a.x - x, a.y - y) - Math.hypot(b.x - x, b.y - y))[0];
    const prov = G.provinceAtCell(c.cell), nat = G.nationAtCell(c.cell);
    const gv = graves.find(g => g.world === G.realm.seed && Math.hypot(g.x - x, g.y - y) < 7);
    const nearTxt = near ? (near.tier === 'ruin' ? `<br><b>${esc(near.name)}</b> · phế tích${near.ruined != null ? ` (bỏ hoang năm ${near.ruined})` : ''}` : `<br><b>${esc(near.name)}</b> · ${G.TIER_VI[near.tier].toLowerCase()}${near.roles.length ? ', ' + near.roles.map(r => G.ROLE_VI[r]).join(', ') : ''} · ${near.urban.toLocaleString('vi')} người${near.rural ? ` · vùng quê ${near.rural.toLocaleString('vi')}` : ''}${near.dwindling ? ' · <span style="color:var(--bad)">sa sút</span>' : ''}${near.founded ? ` · lập năm ${near.founded}` : near.revived ? ` · dựng lại năm ${near.revived}` : ''}${near.head ? `<br>${G.HEAD_VI[near.tier] ? G.HEAD_VI[near.tier][0].toUpperCase() + G.HEAD_VI[near.tier].slice(1) : 'Trưởng'}: ${esc(near.head.name)}${near.head.player && near.head.name === S.name ? ' (bạn)' : ''}` : ''}${near.founder ? ` · người lập: ${esc(near.founder)}` : ''}${near.fief ? `<br>Thái ấp của ${G.NOBLE_VI[near.fief.rank]} ${esc(near.fief.name)}` : ''}${(() => { const os = G.orgsAt ? G.orgsAt(S.world, near.id) : []; return os.length ? `<br>Hội: ${os.map(o => esc(o.name) + ' (' + o.members + ')').join(', ')}` : ''; })()}<br><span class="fam">${esc(near.buildings.join(', ') || 'chưa có công trình')}</span>`) : '';
    tip.innerHTML = `<b>${esc(c.region.nameVi)}</b> · ${esc(c.zone.nameVi)}<br><span style="color:${ZCOL[lvl]}">Tier ${c.zone.tier[0]}–${c.zone.tier[1]} · ${ZTXT[lvl]} với bạn</span>`
      + `<br>${esc(c.feature.nameVi)}${c.river ? ' · có sông' : ''}${G.realm.road[c.cell] ? ' · ' + G.ROAD_VI[G.realm.road[c.cell]] + (c.river ? ' (cầu)' : c.feature.id === 'mountain' ? ' (đèo)' : '') : ''}`
      + `<br>${nat ? `<span style="color:${nat.color}">${esc(nat.name)}</span>${prov ? ' · tỉnh ' + esc(prov.name) : ''}` : 'Đất vô chủ' + (prov ? ' · ' + esc(prov.name) : '')}`
      + nearTxt + (near && near.seaCells ? ` · bến có ${G.SHIPS[near.ship].nameVi}` : '') + (gv ? `<br>✝ ${esc(gv.name)}, ${gv.years} tuổi, ${esc(gv.cause)}${gv.rose ? ' · đã trỗi dậy' : ''}` : '')
    if (pref.view === 'danger') tip.innerHTML += siteTip(S, x, y);
    place(tip);
  });
  canvas.addEventListener('mouseleave', () => { $('tip').hidden = true; });

  // ───────── Điều khiển ─────────
  function setAuto(on) {
    pref.auto = on; store.set(PREF, pref);
    $('autoLife').checked = on;
    if (sim) { sim.autoDecide = on; if (sim.S) sim.S.auto = on; if (on && sim.S && sim.S.pending) { $('decBox').hidden = true; showDecision(sim.S.pending); } }
  }
  const LEGEND = {
    danger: '<span><i style="background:rgb(84,168,96)"></i>an toàn</span><span><i style="background:rgb(214,176,64)"></i>vừa sức</span><span><i style="background:rgb(210,96,62)"></i>nguy hiểm (Liều mạng)</span><span><i style="background:rgb(66,58,64)"></i>khóa</span><span><b style="color:#ff6a50">▲</b> hang ổ (đỏ: sào huyệt)</span><span><b style="color:#c9b2ff">Π</b> di tích</span><span><b style="color:#ff3d6e">◆</b> ổ chúa</span>',
    sea: '<span>Tầng biển tối dần: ven bờ → khơi → sâu → vực biển</span><span><i style="border:2px solid #cfe2ea;border-radius:50%;background:none"></i>thuyền chài</span><span><i style="border:2px solid #7fc4ee;border-radius:50%;background:none"></i>tàu buôn</span><span><i style="border:2px solid #ffd27a;border-radius:50%;background:none"></i>tàu viễn dương</span><span>nét đứt: hải trình từ bến gần bạn</span>'
  };
  function setView(v) {
    pref.view = ['terrain', 'political', 'danger', 'sea'].includes(v) ? v : 'region'; store.set(PREF, pref); dirty = true;
    $('mapLegend').hidden = !LEGEND[pref.view];
    if (LEGEND[pref.view]) $('mapLegend').innerHTML = LEGEND[pref.view];
    for (const b of $('viewBtns').children) { const on = b.dataset.v === pref.view; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); }
  }
  for (const b of $('viewBtns').children) b.onclick = () => setView(b.dataset.v);
  setView(pref.view);
  $('autoLife').checked = pref.auto;
  $('autoLife').onchange = e => setAuto(e.target.checked);
  $('reckless').onchange = e => { sim.S.reckless = e.target.checked; sim.ensureZone(); dirty = true; };
  $('btnNew').onclick = () => { if (sim.S.dead || confirm('Bỏ kiếp đang sống để bắt đầu kiếp mới?')) start(null, $('origin').value || null); };
  $('btnWorld').onclick = () => { if (confirm('Tạo đại lục mới? Kiếp đang sống sẽ bị bỏ, mộ các kiếp trước ở lại với thế giới cũ.')) { useWorld(G.newSeed()); selNation = null; start(); } };
  // Điều khiển tay: Sang năm sống hết một lượt; Tự chạy cho thời gian trôi theo tốc độ (bấm lại để dừng).
  function setRun(on) {
    running = on; step = null;
    $('btnRun').textContent = on ? '⏸ Dừng' : '▶ Tự chạy'; $('btnRun').classList.toggle('on', on);
    $('speeds').hidden = !on; dirty = true;
  }
  function nextYear() {
    const S = sim.S; if (!S) return;
    if (S.dead) { $('deathModal').hidden = false; return; }
    if (S.pending || step) return;
    if (running) setRun(false);
    step = { S, y: S.world.year };
    showTab('log');
  }
  $('btnRun').onclick = () => setRun(!running);
  $('btnNext').onclick = nextYear;
  $('menu').addEventListener('click', ev => { if (ev.target.closest('button')) $('menu').open = false; });
  document.addEventListener('keydown', e => {
    if (e.target !== document.body && !e.target.closest('button')) return;   // đang gõ / chọn trong ô thì thôi
    if (!$('deathModal').hidden) return;
    if (!$('decBox').hidden && /^[1-9]$/.test(e.key)) { const b = $('dChoices').children[+e.key - 1]; if (b) { e.preventDefault(); b.click(); } return; }
    if (e.code === 'Space' || e.code === 'Enter') { if (e.target !== document.body) return; e.preventDefault(); if (running) setRun(false); else nextYear(); }
    else if (e.key === 'm' || e.key === 'M') setBig(!document.body.classList.contains('mapbig'));
    else if (e.key === 'Escape') setBig(false);
  });
  for (const s of SPEEDS) {
    const b = document.createElement('button'); b.textContent = (s === .5 ? '½' : s) + '×';
    b.onclick = () => { pref.speed = s; store.set(PREF, pref); [...$('speeds').children].forEach((c, i) => c.classList.toggle('on', SPEEDS[i] === s)); };
    if (s === pref.speed) b.classList.add('on');
    $('speeds').appendChild(b);
  }

  // ───────── Chế độ kiểm duyệt ─────────
  // Bảng công cụ cho người duyệt nội dung (bật trong menu hoặc ?kd=1): kiếp mới theo giống loài, vùng, xuất thân, seed; chơi lại
  // từ lúc sinh; quay về mốc đã qua (đầu mỗi năm, trước mỗi quyết định); gọi một sự kiện, quyết định theo mã; tua nhanh; hiện mã
  // sự kiện trong nhật ký (khớp mã trên trang Duyệt Nội Dung). Mốc là ảnh chụp { rs, S } dạng JSON trong bộ nhớ: cùng xúc xắc nên
  // đi lại đúng như cũ, chọn khác thì đời rẽ khác. Mốc lúc sinh lưu cả vào bộ nhớ trình duyệt để tải lại trang vẫn chơi lại được.
  const KD_BIRTH = 'vankiep.kd.birth.v1', SNAP_MAX = 200;
  let snaps = [], birth = null, quiet = false;
  const shot = () => JSON.stringify({ seed: sim.seed, rs: sim.rs, S: sim.S, world: G.realm.seed });
  const yrLabel = S => S.undead ? `Năm ${S.world.year} · năm thứ ${sim.years(S)} sau khi trỗi dậy` : `Năm ${S.world.year} · ${sim.years(S)} tuổi`;
  function pushSnap(label, kind) { snaps.push({ label, kind, json: shot() }); if (snaps.length > SNAP_MAX) snaps.splice(1, 1); renderSnaps(); }
  // Chụp mốc: sau khi xếp lịch một năm (đầu năm), và ngay trước khi chọn một quyết định (cả khi Tự sống chọn thay).
  function instrument(s) {
    const p0 = s.planYear, c0 = s.choose;
    s.planYear = function () { p0.call(this); if (this === sim && !quiet && pref.kd && this.S && !this.S.dead) pushSnap(yrLabel(this.S), 'year'); };
    s.choose = function (k) { const P = this.S && this.S.pending; if (this === sim && P && pref.kd) pushSnap(`${yrLabel(this.S)} · quyết định: ${P.title}`, 'dec'); return c0.call(this, k); };
  }
  function kdBirth() {
    const label = `Lúc ${sim.S.undead ? 'trỗi dậy' : 'sinh'} · ${yrLabel(sim.S)}`;
    birth = shot(); snaps = [{ label, kind: 'birth', json: birth }];
    store.set(KD_BIRTH, { seed: sim.seed, kiep: sim.S.kiep, label, json: birth });
    renderSnaps();
  }
  function restore(json) {
    const d = JSON.parse(json);
    if (d.world && d.world !== G.realm.seed) useWorld(d.world);
    clearInterval(dieIv);
    setRun(false); step = null;
    sim = new G.Sim({ seed: d.seed, hook: hook() }); instrument(sim);
    sim.rs = d.rs; sim.S = d.S; sim.autoDecide = pref.auto; d.S.auto = pref.auto;
    G.bindWorld(d.S.world);
    deathShown = false; $('deathModal').hidden = true; $('decBox').hidden = true;
    clearLog(); for (const e of d.S.log) appendLog(e, true);
    selRegion = d.S.loc;
    if (d.S.pending) showDecision(d.S.pending, true);   // mốc trước quyết định: người duyệt tự chọn lại
    dirty = true; save();
  }
  function renderSnaps() {
    const box = $('kdSnaps'); if (!box) return;
    box.innerHTML = snaps.map((s, i) => [i, s]).reverse().map(([i, s]) => `<option value="${i}">${s.kind === 'dec' ? '↳ ' : ''}${esc(s.label)}</option>`).join('');
    $('kdSnapNote').textContent = birth ? `${snaps.length} mốc (giữ ${SNAP_MAX} mốc gần nhất và lúc sinh). Quay về rồi chọn khác thì các mốc sau đó bị bỏ.` : 'Chưa có mốc lúc sinh của kiếp này.';
  }
  function kdReplay() { if (!birth) return; const b = snaps[0] && snaps[0].kind === 'birth' ? snaps[0] : { label: 'Lúc sinh', kind: 'birth', json: birth }; snaps = [b]; restore(birth); renderSnaps(); }
  function kdBack() {
    const i = +$('kdSnaps').value, s = snaps[i]; if (!s) return;
    snaps = snaps.slice(0, s.kind === 'dec' ? i : i + 1);   // mốc quyết định được chụp lại khi chọn
    restore(s.json); renderSnaps();
  }
  // Gọi sự kiện, quyết định theo mã. Không ép thì phải đủ điều kiện (giai đoạn, thân thể, điều kiện riêng, cổng chung của js/tree.js).
  const WHY = { fresh: 'Bộ Xương lượt đầu', body: 'thân thể', race: 'giống loài', age: 'chưa đủ lượt', soc: 'danh phận', need: 'thiếu nút trước', from: 'chưa có nút cha đang mở', theme: 'chủ đề đang lặp', dir: 'quỹ đạo không hợp' };
  const why = id => { const m = G.treeMeta && G.treeMeta(id); const w = m ? G.treeBlock(sim.S, sim, m) : null; return w ? WHY[w] || w : 'điều kiện riêng'; };
  const kdNote = (id, t, bad) => { const n = $(id); n.textContent = t; n.classList.toggle('bad', !!bad); };
  function kdFire() {
    const id = $('kdEv').value.trim().split(/\s/)[0], S = sim.S, force = $('kdForce').checked, note = (t, b) => kdNote('kdFireNote', t, b);
    if (!id) return note('Gõ mã sự kiện hoặc quyết định.', true);
    if (!S || S.dead) return note('Nhân vật đã chết.', true);
    if (S.pending) return note('Đang có quyết định chờ chọn.', true);
    G.bindWorld(S.world);
    const D = G.DECISIONS[id], E = G.EVENTS.find(e => e.id === id) || (G.NATION_EVENTS || []).find(e => e.id === id);
    if (D) {
      let ok = false; try { ok = !!D.when(S, sim); } catch (e) { ok = false; }
      if (!ok && !force) return note(`Quyết định ${id} chưa đủ điều kiện (${why(id)}). Tích "Bỏ qua điều kiện" để ép.`, true);
      let d; try { d = D.build(S, sim); } catch (e) { return note(`Không dựng được ${id} (${e.message}): quyết định này cần sự kiện mở trước. Gọi sự kiện mở rồi thử lại.`, true); }
      if (!d || !d.choices || !d.choices.length) return note(`${id} không có lựa chọn nào ở hoàn cảnh này.`, true);
      S.recentDec[id] = S.age; S.pending = { id, ...d }; showDecision(S.pending, true);
      return note(`Đã mở quyết định ${id}.`);
    }
    if (!E) return note(`Không có sự kiện hay quyết định mã "${id}".`, true);
    const st = sim.stage(S), okSt = E.st.includes(st), okU = S.undead ? !!E.undead : E.undead !== true;
    let okC = true; try { okC = !E.c || !!E.c(S, sim); } catch (e) { okC = false; }
    if (!(okSt && okU && okC) && !force) return note(`${id} chưa đủ điều kiện: ${[!okSt ? `giai đoạn hiện tại không thuộc ${E.st.join(', ')}` : '', !okU ? 'thân thể (Bộ Xương hay người sống)' : '', !okC ? why(id) : ''].filter(Boolean).join('; ')}. Tích "Bỏ qua điều kiện" để ép.`, true);
    let lines = 0; const h0 = sim.hook.log; sim.hook.log = e => { lines++; h0(e); };
    try { G.runEvent(sim, E); } catch (e) { return note(`Lỗi khi chạy ${id}: ${e.message} (thường do thiếu dữ kiện của nút trước).`, true); } finally { sim.hook.log = h0; }
    note(lines ? `Đã gọi ${id}.` : `Đã gọi ${id}, nhưng sự kiện không ra dòng nào ở hoàn cảnh này.`);
    dirty = true; save();
  }
  // Tua: sống n lượt với mọi quyết định tự chọn (theo tính cách, chí hướng), rồi trả lại chế độ cũ.
  function kdFf(n) {
    const S = sim.S; if (!S || S.dead) return;
    setRun(false); step = null;
    const ad = sim.autoDecide, au = S.auto; sim.autoDecide = true; S.auto = true;
    try {
      if (S.pending) { const D = G.DECISIONS[S.pending.id]; $('decBox').hidden = true; sim.choose(D && D.auto ? D.auto(S, sim, S.pending) : S.pending.choices[0].k); }
      const a0 = S.age;
      for (let g = 0; g < 400000 && sim.S === S && !S.dead && S.age < a0 + n; g++) sim.tick(.05);
    } finally { sim.autoDecide = ad; if (sim.S === S) S.auto = au; }
    if (S.pending && !S.dead) showDecision(S.pending, true);
    dirty = true; save();
  }
  function setKd(on) {
    pref.kd = on; store.set(PREF, pref);
    $('kdMode').checked = on; $('kdPanel').hidden = !on; if (!on) $('kdPanel').open = false;
    clearLog(); if (sim && sim.S) for (const e of sim.S.log) appendLog(e, true);
  }
  {
    $('kdRace').innerHTML = '<option value="">Giống loài: ngẫu nhiên</option>' + Object.keys(G.RACES).map(r => `<option value="${r}">${esc(J.races[r].nameVi)}${G.RACES[r].undead ? ' (trỗi dậy ngay)' : ''}</option>`).join('');
    // Vùng sinh theo thế giới đang chơi: vùng không có khu dân cư bị khóa; chọn giống loài thì ghi vùng nào không có tộc đó.
    const fillRegions = () => {
      const race = $('kdRace').value, cur = $('kdRegion').value, live = s => s.tier !== 'ruin';
      $('kdRegion').innerHTML = '<option value="">Vùng: ngẫu nhiên</option>' + G.REGIONS.map(r => { const ss = G.realm.settlements.filter(s => live(s) && s.region === r.id), has = !race || G.RACES[race].undead || ss.some(s => (s.races[race] || 0) > 0);
        return `<option value="${r.id}"${ss.length ? '' : ' disabled'}>${esc(r.nameVi)}${!ss.length ? ' (không có khu dân cư)' : has ? '' : ` (không có ${esc(J.races[race].nameVi)})`}</option>`; }).join('');
      if ([...$('kdRegion').options].some(o => o.value === cur && !o.disabled)) $('kdRegion').value = cur;
    };
    fillRegions(); $('kdRace').onchange = fillRegions; $('kdPanel').addEventListener('toggle', () => { if ($('kdPanel').open) fillRegions(); });
    const T = G.RACEV_TITLE || {};
    $('kdEvList').innerHTML = [...G.EVENTS.map(e => [e.id, 'sự kiện']), ...(G.NATION_EVENTS || []).map(e => [e.id, 'sự kiện quốc gia']), ...Object.keys(G.DECISIONS).map(id => [id, 'quyết định'])]
      .map(([id, k]) => `<option value="${esc(id)}">${esc(T[id] ? T[id][0] + ' · ' + k : k)}</option>`).join('');
    if (new URLSearchParams(location.search).get('kd') === '1') pref.kd = true;
    $('kdMode').onchange = e => setKd(e.target.checked);
    $('kdIds').checked = !!pref.kdIds;
    $('kdIds').onchange = e => { pref.kdIds = e.target.checked; store.set(PREF, pref); clearLog(); if (sim && sim.S) for (const x of sim.S.log) appendLog(x, true); };
    $('kdNew').onclick = () => {
      if (sim && sim.S && !sim.S.dead && !confirm('Bỏ kiếp đang sống để sinh kiếp theo lựa chọn?')) return;
      const race = $('kdRace').value || undefined, region = $('kdRegion').value || undefined, seed = $('kdSeed').value.trim() || null, origin = $('kdOrigin').value || null;
      if (region && !G.realm.settlements.some(s => s.tier !== 'ruin' && s.region === region)) { fillRegions(); return kdNote('kdNewNote', 'Vùng này không còn khu dân cư nào trong thế giới đang chơi.', true); }
      if (race && G.RACES[race].undead) {   // Bộ Xương: một kiếp người chết non rồi trỗi dậy ngay ở vùng đã chọn
        start(seed, origin, { region });
        const S = sim.S; S.dead = true; S.cause = 'chết non'; S.causeId = 'newborn'; S.rose = sim.dominant(S) || { skill: 'Body', value: 5 };
        rise(); return;
      }
      start(seed, origin, { race, region });
    };
    $('kdReplay').onclick = () => { if (!birth) return kdNote('kdSnapNote', 'Chưa có mốc lúc sinh của kiếp này.', true); if (confirm('Chơi lại kiếp này từ lúc sinh?')) kdReplay(); };
    $('kdBack').onclick = kdBack;
    $('kdFire').onclick = kdFire;
    $('kdEv').addEventListener('keydown', e => { if (e.key === 'Enter') kdFire(); });
    $('kdFf1').onclick = () => kdFf(1); $('kdFf10').onclick = () => kdFf(10); $('kdFfEnd').onclick = () => kdFf(1e6);
    setKd(!!pref.kd);
  }

  // ───────── Vòng lặp ─────────
  let last = performance.now(), lastUi = 0;
  function frame(now) {
    const dt = Math.min(.1, (now - last) / 1000); last = now;
    if (sim && sim.S) {
      const S = sim.S;
      if (step && (step.S !== S || S.dead || S.world.year !== step.y)) step = null;
      if (step && !S.pending) {
        // Sang năm: tua liền tới hết lượt; quyết định chen giữa thì dừng lại chờ chọn.
        for (let n = 0; n < 400 && sim.S === S && !S.dead && !S.pending && S.world.year === step.y; n++) sim.tick(.01);
        if (sim.S !== S || S.dead || S.world.year !== step.y) step = null;
        dirty = true;
      } else if (running && !S.dead && !S.pending) sim.tick(dt * pref.speed / YEAR_SEC);
      drawMap(now);
      if (now - lastUi > 120) {
        renderYear();
        if (dirty) { renderChar(); renderFocus(); renderZones(); renderRegion(); renderSide(); dirty = false; }
        $('seedLabel').textContent = `thế giới ${G.realm.seed} · đời ${sim.seed}`;
        lastUi = now;
      }
    }
    requestAnimationFrame(frame);
  }

  const urlSeed = new URLSearchParams(location.search).get('seed');
  if (urlSeed || !load()) start(urlSeed || undefined);
  requestAnimationFrame(frame);
  G.ui = { get sim() { return sim; }, start, rise };
})(window.LifeSim);
