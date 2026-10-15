/* Vạn Kiếp — GIAO DIỆN. Chỉ đọc S và gọi API của Sim; logic không biết giao diện tồn tại (gắn qua hook). */
(function (G) {
  const J = window.JobLibrary;
  G.init();
  const $ = id => document.getElementById(id);
  const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  // v3: thế giới sinh từ seed (quốc gia, khu dân cư của js/realm.js); bản lưu và mộ gắn với seed thế giới.
  // v4: thế giới động (js/dynamic.js): bản lưu giữ S.world.dyn; đời mới nối tiếp thế giới của đời trước.
  const SAVE = 'vankiep.save.v4', GRAVES = 'vankiep.graves.v3', PREF = 'vankiep.pref.v1', WORLD = 'vankiep.world.v1';
  const store = {
    get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* bộ nhớ trình duyệt bị chặn: chơi tiếp, không lưu */ } }
  };
  const YEAR_SEC = 8, SPEEDS = [.5, 1, 2, 4, 8];
  const pref = Object.assign({ speed: 1, auto: true, view: 'region' }, store.get(PREF) || {});
  let sim = null, paused = false, dirty = true, selRegion = null, selNation = null, lastHeader = null, deathShown = false;
  let graves = store.get(GRAVES) || [];
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
  function start(seed) {
    const prev = sim && sim.S && sim.S.world && sim.S.worldSeed === G.realm.seed ? sim.S.world : null;
    sim = new G.Sim({ seed: seed || G.newSeed(), hook: hook() });
    sim.autoDecide = pref.auto;
    clearLog();
    deathShown = false; $('deathModal').hidden = true; $('decModal').hidden = true;
    sim.newLife(prev ? { world: prev } : {});
    sim.S.auto = pref.auto;
    selRegion = sim.S.loc;
    dirty = true; save();
  }
  function rise() {
    clearLog();
    deathShown = false; $('deathModal').hidden = true;
    sim.rise();
    sim.S.auto = pref.auto;
    selRegion = sim.S.loc;
    dirty = true; save();
  }
  function save() { if (sim && sim.S) store.set(SAVE, { seed: sim.seed, rs: sim.rs, S: sim.S, world: G.realm.seed }); }
  function load() {
    const d = store.get(SAVE);
    if (!d || !d.S || d.S.v !== 2) return false;
    try {
      if (urlWorld && d.world !== urlWorld) return false;   // ?world=… trên URL: bắt đầu đời mới ở thế giới đó
      if (d.world && d.world !== G.realm.seed) useWorld(d.world);
      sim = new G.Sim({ seed: d.seed, hook: hook() });
      sim.rs = d.rs; sim.S = d.S; sim.autoDecide = pref.auto;
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
    d.innerHTML = esc(e.text) + (e.fact ? `<span class="f">${esc(e.fact)}</span>` : '');
    box.appendChild(d);
    if (!bulk && nearBottom) box.scrollTop = box.scrollHeight;
    if (bulk) box.scrollTop = box.scrollHeight;
    dirty = true;
  }

  // ───────── Quyết định ─────────
  function showDecision(d) {
    if (sim.autoDecide && !sim.S.dead) { const D = G.DECISIONS[d.id]; sim.choose(D.auto ? D.auto(sim.S, sim, d) : d.choices[0].k); dirty = true; return; }
    $('dTitle').textContent = d.title;
    $('dBody').textContent = d.body || '';
    $('dFact').textContent = d.fact || '';
    $('dChoices').innerHTML = '';
    for (const c of d.choices) {
      const b = document.createElement('button');
      b.innerHTML = `${esc(c.label)}${c.sub ? `<small>${esc(c.sub)}</small>` : ''}`;
      b.onclick = () => { $('decModal').hidden = true; sim.choose(c.k); dirty = true; save(); };
      $('dChoices').appendChild(b);
    }
    $('decModal').hidden = false;
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
      ['Nghề', `${sim.jobName(S)} (T${sim.job(S).tier})`], ['Cấp', `${S.level} · Tier ${sim.ctier(S)}`],
      ['Kỹ năng chủ đạo', dom ? `${G.mv(dom.skill)} ${dom.value}` : '—'], ['Sinh kế', S.work ? G.WORKS[S.work].nameVi : '—'],
      ['Quái đã hạ', kills + (topKill ? ` · nhiều nhất ${G.B.byId[topKill[0]].nameVi}` : '')], ['Danh vọng', Math.round(S.fame)],
      ['Bạc để lại', S.gold], ['Con cháu', S.family.kids.length || '—'],
      ['Trận săn', `${S.hunts.won} thắng · ${S.hunts.lost} thua`], ['Kiếp', S.kiep]
    ];
    $('dSum').innerHTML = items.map(([k, v]) => `<div><span>${k}</span>${esc(v)}</div>`).join('');
    // Xúc xắc d100 hiển thị khớp với kết quả đã tung lúc chết (≤ 20 = trỗi dậy).
    const h = G.hash(S.name + S.world.year + S.cause);
    const final = S.rose ? 1 + h % 20 : 21 + h % 80;
    const die = $('die'), txt = $('rollTxt'), btns = $('deathBtns');
    die.className = 'die'; btns.innerHTML = ''; txt.textContent = 'Xương cốt có chịu nằm yên? Tung d100: từ 20 trở xuống thì trỗi dậy.';
    let n = 0;
    const iv = setInterval(() => {
      die.textContent = 1 + Math.floor(Math.random() * 100);
      if (++n > 16) {
        clearInterval(iv); die.textContent = final;
        if (S.rose) { die.classList.add('rise'); txt.innerHTML = `<b>${final} ≤ 20.</b> Đất nứt. ${esc(S.name.split(' ')[0])} sẽ trỗi dậy thành Bộ Xương, mang theo <b>${esc(G.mv(S.rose.skill))} ${S.rose.value}</b>.`; }
        else { die.classList.add('rest'); txt.textContent = `${final} > 20. Yên nghỉ.`; }
        if (S.rose) addBtn(btns, `Trỗi dậy thành Bộ Xương`, `Giữ kỹ năng ${G.mv(S.rose.skill)} ${S.rose.value}; mọi thứ khác về số 0.`, rise, true);
        addBtn(btns, 'Sang kiếp mới', 'Một đứa trẻ khác chào đời đâu đó trên đại lục.', () => start());
        addBtn(btns, 'Xem lại bản đồ', 'Đóng bảng này.', () => { $('deathModal').hidden = true; });
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
    ys.forEach((r, i) => i ? c.lineTo(x(i), y(r.level / G.MAX_LEVEL * 100)) : c.moveTo(x(i), y(r.level / G.MAX_LEVEL * 100))); c.stroke(); c.setLineDash([]);
    $('chartLegend').innerHTML = series.map(([k, n]) => `<span><i style="background:var(--${k})"></i>${n}</span>`).join('') + '<span><i style="background:#e8c26a"></i>Cấp (0–60)</span>';
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
      ['Nghề', `${X.jobName(S)} · T${j ? j.tier : 0}`],
      ['Sức mạnh', `${X.power(S).toFixed(2)} Tier · cấp Tier ${X.ctier(S)}`],
      ['Sinh kế', S.work ? G.WORKS[S.work].nameVi : (S.undead ? '—' : st === 'adult' ? 'chưa có' : '—')],
      ['Tầng lớp', S.undead ? 'ngoài vòng xã hội' : `${G.CLASSES[S.q].nameVi} · phân vị ${Math.round(S.pct * 100)}`],
      ['Bạc', S.gold], ['Trang bị', `${S.gear}/10`], ['Danh vọng', Math.round(S.fame)],
      ['Giáo phái', S.faith ? `${J.faiths[S.faith].symbol || ''} ${J.faiths[S.faith].nameVi} · ${Math.round(S.devotion)}` : 'không'],
      // Nước đang sống: thuế thật phải nộp và thái độ của nước với chủng tộc mình (js/state.js).
      ['Nước', nat ? `${nat.name} · thuế ${Math.round(G.taxRate(S) * 100)}%${{ fav: ' · được ưu ái', wary: ' · bị dè chừng' }[G.attitude(S)] || ''}` : 'đất vô chủ']
    ];
    $('cKv').innerHTML = kv.map(([k, v]) => `<span class="k">${k}</span><span class="v">${esc(v)}</span>`).join('');
    if (nat) $('cKv').lastElementChild.title = 'Luật: ' + (nat.laws.map(l => G.LAWS[l].nameVi).join(', ') || 'không có gì đặc biệt');
    const need = G.xpNeed(S.level);
    $('xpBar').style.width = (S.level >= G.MAX_LEVEL ? 100 : S.xp / need * 100) + '%';
    $('xpTxt').textContent = `Cấp ${S.level}`;
    $('cStats').innerHTML = STAT.map(([k, n]) => `<div class="stat"><span>${n}</span><div class="bar"><i style="width:${S[k]}%;background:var(--${k})"></i></div><span>${Math.round(S[k])}</span></div>`).join('');
    const chips = S.conds.map(c => `<span class="chip">${esc(G.CONDS[c.id].nameVi)}</span>`);
    if (S.flags.companion) chips.push(`<span class="chip ok">Đồng đội: ${esc(S.flags.companion.name)}</span>`);
    if (S.flags.pet) chips.push(`<span class="chip ok">Nuôi ${esc(S.flags.pet)}</span>`);
    if (S.flags.lordSlayer) chips.push(`<span class="chip ok">Kẻ hạ ${esc(S.flags.lordSlayer)}</span>`);
    // Pháp lý: truy nã, tiền án, nghĩa vụ, khổ sai.
    for (const k of Object.keys(S.flags.wanted || {})) chips.push(`<span class="chip">Bị ${esc(G.realm.nations[k] ? G.realm.nations[k].name : '?')} truy nã</span>`);
    if (S.flags.crimes) chips.push(`<span class="chip">Tiền án ${S.flags.crimes}</span>`);
    if (S.flags.soldier) chips.push(`<span class="chip ok">Đang làm lính (còn ${S.flags.soldier} năm)</span>`);
    if (S.flags.labor) chips.push(`<span class="chip">Khổ sai (còn ${S.flags.labor} năm)</span>`);
    $('cConds').innerHTML = chips.join('');
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

  function renderFocus() {
    const S = sim.S, st = sim.stage(S), box = $('focusBtns');
    box.innerHTML = '';
    for (const [k, F] of Object.entries(G.FOCUS)) {
      if (!F.stages.includes(st) && !(st === 'infant' && k === 'play')) continue;
      const b = document.createElement('button');
      b.textContent = `${F.icon} ${F.nameVi}`; b.className = S.focus === k ? 'on' : '';
      b.disabled = S.dead || st === 'infant' || ((k === 'hunt' || k === 'adventure') && !S.zoneSel);
      b.onclick = () => { S.focus = k; setAuto(false); dirty = true; };
      box.appendChild(b);
    }
    if (st === 'infant') box.insertAdjacentHTML('beforeend', '<span class="fam">Còn ẵm ngửa; chưa tự chọn được.</span>');
  }

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
      <div class="row">${n.ruler ? `<span>${esc(n.ruler.title)} ${esc(n.ruler.name)}, ${n.ruler.age} tuổi</span>` : '<span>Không có người cai trị</span>'}<span>Thăng tiến: ${esc(gov.promo)}</span></div>
      <div class="row"><span>Thuế ${Math.round(n.tax * 100)}%</span><span>Quân ${n.army}</span><span>Tuần tra ${n.patrol}</span><span>Ổn định ${Math.round(n.stability * 100)}</span><span>Tham vọng ${Math.round(n.ambition * 100)}</span></div>
      <div class="row"><span>Luật: ${n.laws.map(l => esc(G.LAWS[l].nameVi)).join(', ') || 'không có gì đặc biệt'}</span></div>
      <div class="row"><span>Ưu ái: ${n.tolerant ? 'mọi chủng tộc' : esc(n.fav.map(rname).join(', ') || 'không')}</span><span>Dè chừng: ${esc(n.wary.length > 6 ? 'mọi chủng tộc khác' : n.wary.map(rname).join(', ') || 'không')}</span></div>
      <div class="rz"><b>${esc(n.trait.nameVi)}</b>: ${esc(n.trait.desc)}</div>
      <div class="row"><span>Đặc trưng: ${esc(n.quirks.map(qname).join(', '))}</span>${n.overlord != null ? `<span>Chư hầu của ${esc(RL.nations[n.overlord].name)}</span>` : ''}</div>
      <div class="row"><span>Kinh đô: ${cap ? esc(cap.name) : '—'}</span>${n.founded ? `<span>Lập năm ${n.founded}</span>` : ''}</div>
      <div class="row"><span>Dân ${pop.toLocaleString('vi')} · đô thị ${Math.round(urban / Math.max(1, pop) * 100)}%</span><span>${cnt}</span></div>
      <div class="rz"><b>Tỉnh</b> · ${provs}</div>
      <div class="rz"><b>Khu dân cư lớn</b> · ${big}</div>
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
      <div class="act">${S.dead ? '' : R.id === S.loc ? '<span class="fam">Bạn đang ở đây.</span>' : canGo ? `<button class="btn" id="goBtn">${plan.escort ? 'Thuê hộ tống, lên đường' : 'Lên đường tới đây'}</button>` : `<span class="fam">${!able ? 'Trẻ con chưa tự đi xa được.' : moved ? 'Năm nay đã đi một chuyến.' : plan && plan.escort && !plan.fail ? 'Chưa đủ bạc thuê hộ tống.' : ''}</span>`}</div>`;
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
    $('lineageBox').hidden = !L.length;
    $('lineage').innerHTML = L.map(l => `<div class="prow"><b>Kiếp ${l.kiep}: ${esc(l.name)}</b> · ${esc(l.raceVi)}<br>${l.years} tuổi, ${esc(l.cause)} · ${esc(l.job)} cấp ${l.level}${l.dominant ? ` · chủ đạo ${esc(G.mv(l.dominant.skill))} ${l.dominant.value}` : ''}</div>`).join('');
  }

  function renderYear() {
    const S = sim.S;
    $('yBar').style.width = Math.min(100, S.t * 100) + '%';
    $('yLabel').textContent = `Năm ${S.world.year} · ${sim.years(S)} ${S.undead ? 'năm từ khi trỗi dậy' : 'tuổi'}${S.dead ? ' · đã mất' : paused ? ' · tạm dừng' : ''}`;
  }

  // ───────── Bản đồ ─────────
  let hoverCell = null, t0 = performance.now();
  function drawMap(now) {
    const S = sim.S;
    const peers = (S.peers || []).map((p, i) => ({ x: p.bornPos[0], y: p.bornPos[1], dead: !!S.peerSeen[i] })).filter(p => !p.dead);
    const ct = sim.ctier(S), cap = ct + (S.reckless ? 2 : 1);
    G.drawMap(ctx, G.map, baseFor(pref.view, ct, cap), {
      selected: selRegion, zoneSel: selRegion === S.loc && S.zoneSel ? G.ZONE[S.zoneSel].index : null,
      path: S.path2, me: S.dead ? null : S.pos, undead: S.undead, time: (now - t0) / 1000,
      graves: graves.filter(g => g.world === G.realm.seed), realm: G.realm, roads: roadsFor(), view: pref.view, peers,
      war: pref.view === 'political' && S.world.dyn ? warFor(S.world) : null, hunt: !S.dead && (S.focus === 'hunt' || S.focus === 'adventure') ? S.huntPos : null,
      seaLines: pref.view === 'sea' && !S.dead ? G.seaLinesFrom(S) : null
    });
  }
  function canvasPoint(ev) {
    const r = canvas.getBoundingClientRect();
    return [(ev.clientX - r.left) / r.width * canvas.width, (ev.clientY - r.top) / r.height * canvas.height];
  }
  canvas.addEventListener('mousemove', ev => {
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
    const nearTxt = near ? (near.tier === 'ruin' ? `<br><b>${esc(near.name)}</b> · phế tích${near.ruined != null ? ` (bỏ hoang năm ${near.ruined})` : ''}` : `<br><b>${esc(near.name)}</b> · ${G.TIER_VI[near.tier].toLowerCase()}${near.roles.length ? ', ' + near.roles.map(r => G.ROLE_VI[r]).join(', ') : ''} · ${near.urban.toLocaleString('vi')} người${near.rural ? ` · vùng quê ${near.rural.toLocaleString('vi')}` : ''}${near.dwindling ? ' · <span style="color:var(--bad)">sa sút</span>' : ''}${near.founded ? ` · lập năm ${near.founded}` : near.revived ? ` · dựng lại năm ${near.revived}` : ''}<br><span class="fam">${esc(near.buildings.join(', ') || 'chưa có công trình')}</span>`) : '';
    tip.innerHTML = `<b>${esc(c.region.nameVi)}</b> · ${esc(c.zone.nameVi)}<br><span style="color:${ZCOL[lvl]}">Tier ${c.zone.tier[0]}–${c.zone.tier[1]} · ${ZTXT[lvl]} với bạn</span>`
      + `<br>${esc(c.feature.nameVi)}${c.river ? ' · có sông' : ''}${G.realm.road[c.cell] ? ' · ' + G.ROAD_VI[G.realm.road[c.cell]] + (c.river ? ' (cầu)' : c.feature.id === 'mountain' ? ' (đèo)' : '') : ''}`
      + `<br>${nat ? `<span style="color:${nat.color}">${esc(nat.name)}</span>${prov ? ' · tỉnh ' + esc(prov.name) : ''}` : 'Đất vô chủ' + (prov ? ' · ' + esc(prov.name) : '')}`
      + nearTxt + (near && near.seaCells ? ` · bến có ${G.SHIPS[near.ship].nameVi}` : '') + (gv ? `<br>✝ ${esc(gv.name)}, ${gv.years} tuổi, ${esc(gv.cause)}${gv.rose ? ' · đã trỗi dậy' : ''}` : '');
    place(tip);
  });
  canvas.addEventListener('mouseleave', () => { $('tip').hidden = true; });
  canvas.addEventListener('click', ev => {
    const [x, y] = canvasPoint(ev), c = G.map.at(x, y);
    selRegion = c ? c.region.id : null;
    const n = c ? G.nationAtCell(c.cell) : null; selNation = n ? n.idx : null;
    dirty = true;
  });

  // ───────── Điều khiển ─────────
  function setAuto(on) {
    pref.auto = on; store.set(PREF, pref);
    $('autoLife').checked = on;
    if (sim) { sim.autoDecide = on; if (sim.S) sim.S.auto = on; if (on && sim.S && sim.S.pending) { $('decModal').hidden = true; showDecision(sim.S.pending); } }
  }
  const LEGEND = {
    danger: '<span><i style="background:rgb(84,168,96)"></i>an toàn</span><span><i style="background:rgb(214,176,64)"></i>vừa sức</span><span><i style="background:rgb(210,96,62)"></i>nguy hiểm (Liều mạng)</span><span><i style="background:rgb(66,58,64)"></i>khóa</span>',
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
  $('btnNew').onclick = () => { if (sim.S.dead || confirm('Bỏ kiếp đang sống để bắt đầu kiếp mới?')) start(); };
  $('btnWorld').onclick = () => { if (confirm('Tạo đại lục mới? Kiếp đang sống sẽ bị bỏ, mộ các kiếp trước ở lại với thế giới cũ.')) { useWorld(G.newSeed()); selNation = null; start(); } };
  $('btnPause').onclick = () => { paused = !paused; $('btnPause').textContent = paused ? '▶' : '⏸'; dirty = true; };
  document.addEventListener('keydown', e => { if (e.code === 'Space' && e.target === document.body) { e.preventDefault(); $('btnPause').click(); } });
  for (const s of SPEEDS) {
    const b = document.createElement('button'); b.textContent = (s === .5 ? '½' : s) + '×';
    b.onclick = () => { pref.speed = s; store.set(PREF, pref); [...$('speeds').children].forEach((c, i) => c.classList.toggle('on', SPEEDS[i] === s)); };
    if (s === pref.speed) b.classList.add('on');
    $('speeds').appendChild(b);
  }

  // ───────── Vòng lặp ─────────
  let last = performance.now(), lastUi = 0;
  function frame(now) {
    const dt = Math.min(.1, (now - last) / 1000); last = now;
    if (sim && sim.S) {
      if (!paused && !sim.S.dead && !sim.S.pending) sim.tick(dt * pref.speed / YEAR_SEC);
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
