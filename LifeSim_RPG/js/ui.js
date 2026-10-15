/* Vạn Kiếp — GIAO DIỆN. Chỉ đọc S và gọi API của Sim; logic không biết giao diện tồn tại (gắn qua hook). */
(function (G) {
  const J = window.JobLibrary;
  G.init();
  const $ = id => document.getElementById(id);
  const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  // v3: thế giới sinh từ seed (quốc gia, khu dân cư của js/realm.js); bản lưu và mộ gắn với seed thế giới.
  const SAVE = 'vankiep.save.v3', GRAVES = 'vankiep.graves.v3', PREF = 'vankiep.pref.v1', WORLD = 'vankiep.world.v1';
  const store = {
    get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* bộ nhớ trình duyệt bị chặn: chơi tiếp, không lưu */ } }
  };
  const YEAR_SEC = 8, SPEEDS = [.5, 1, 2, 4, 8];
  const pref = Object.assign({ speed: 1, auto: true, view: 'region' }, store.get(PREF) || {});
  let sim = null, paused = false, dirty = true, selRegion = null, selNation = null, lastHeader = null, deathShown = false;
  let graves = store.get(GRAVES) || [];
  // Thế giới: ?world=… trên URL, hoặc thế giới đang chơi, hoặc một thế giới mới.
  function useWorld(seed) { G.useWorld(seed); store.set(WORLD, seed); delete bases.political; }
  // Ảnh nền mỗi chế độ xem dựng lần đầu khi cần rồi giữ lại (Chính trị dựng lại khi đổi thế giới).
  const bases = {}, baseFor = v => bases[v] || (bases[v] = G.renderMapBase(G.map, v, G.realm));
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
  function start(seed) {
    sim = new G.Sim({ seed: seed || G.newSeed(), hook: hook() });
    sim.autoDecide = pref.auto;
    clearLog();
    deathShown = false; $('deathModal').hidden = true; $('decModal').hidden = true;
    sim.newLife();
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
    if (!d || !d.S || d.S.v !== 1) return false;
    try {
      if (urlWorld && d.world !== urlWorld) return false;   // ?world=… trên URL: bắt đầu đời mới ở thế giới đó
      if (d.world && d.world !== G.realm.seed) useWorld(d.world);
      sim = new G.Sim({ seed: d.seed, hook: hook() });
      sim.rs = d.rs; sim.S = d.S; sim.autoDecide = pref.auto;
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
      ['Giáo phái', S.faith ? `${J.faiths[S.faith].symbol || ''} ${J.faiths[S.faith].nameVi} · ${Math.round(S.devotion)}` : 'không']
    ];
    $('cKv').innerHTML = kv.map(([k, v]) => `<span class="k">${k}</span><span class="v">${esc(v)}</span>`).join('');
    const need = G.xpNeed(S.level);
    $('xpBar').style.width = (S.level >= G.MAX_LEVEL ? 100 : S.xp / need * 100) + '%';
    $('xpTxt').textContent = `Cấp ${S.level}`;
    $('cStats').innerHTML = STAT.map(([k, n]) => `<div class="stat"><span>${n}</span><div class="bar"><i style="width:${S[k]}%;background:var(--${k})"></i></div><span>${Math.round(S[k])}</span></div>`).join('');
    const chips = S.conds.map(c => `<span class="chip">${esc(G.CONDS[c.id].nameVi)}</span>`);
    if (S.flags.companion) chips.push(`<span class="chip ok">Đồng đội: ${esc(S.flags.companion.name)}</span>`);
    if (S.flags.pet) chips.push(`<span class="chip ok">Nuôi ${esc(S.flags.pet)}</span>`);
    if (S.flags.lordSlayer) chips.push(`<span class="chip ok">Kẻ hạ ${esc(S.flags.lordSlayer)}</span>`);
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
      const pop = S.world.zonePop[z.zone.id];
      b.innerHTML = `<b>${esc(z.zone.nameVi)}</b><span class="t">Tier ${z.zone.tier[0]}${z.zone.tier[1] > z.zone.tier[0] ? '–' + z.zone.tier[1] : ''}</span> · ${ZTXT[z.level]}<div class="pop" title="Mật độ quái ${pop.toFixed(2)}"><i style="width:${Math.min(100, pop / 2.2 * 100)}%"></i></div>`;
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
    const rel = RL.nations.filter(o => o !== n).map(o => { const v = n.relations[o.idx] || 0; return `<span style="color:${v > 0 ? 'var(--good)' : v < 0 ? 'var(--bad)' : 'var(--dim)'}">${esc(o.name)} ${v > 0 ? '+' : ''}${v}</span>`; }).join(' · ');
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
      <div class="row"><span>Dân ${pop.toLocaleString('vi')} · đô thị ${Math.round(urban / Math.max(1, pop) * 100)}%</span><span>${cnt}</span></div>
      <div class="rz"><b>Tỉnh</b> · ${provs}</div>
      <div class="rz"><b>Khu dân cư lớn</b> · ${big}</div>
      <div class="rz"><b>Quan hệ</b> · ${rel}</div>`;
    box.hidden = false;
  }

  function renderRegion() {
    const box = $('regionPanel');
    if (pref.view === 'political' && selNation != null) return renderNation(box);
    if (!selRegion) { box.hidden = true; return; }
    const S = sim.S, R = G.REGION[selRegion], rs = S.world.regions[R.id], bio = J.biomes[R.biome];
    const top = (o, f) => Object.entries(o).filter(([k]) => k !== 'none').sort((a, b) => b[1] - a[1]).slice(0, 3).map(([k]) => f(k)).join(', ');
    const adj = G.map.adj[G.map.idx[S.loc]].includes(R.id);
    const canGo = adj && !S.dead && ['teen', 'adult', 'elder'].includes(sim.stage(S)) && S.flags.movedAge !== S.age;
    const zones = R.zones.map(z => {
      const ms = Object.keys(z.spawns).map(id => G.B.byId[id]).sort((a, b) => a.tier - b.tier).map(s => `${s.nameVi} T${s.tier}`).join(', ');
      return `<div class="rz"><b>${esc(z.nameVi)}</b> · Tier ${z.tier[0]}–${z.tier[1]} · mật độ ${S.world.zonePop[z.id].toFixed(2)}<br><span class="fam">${esc(ms)}</span></div>`;
    }).join('');
    const state = [rs.plague > 0 ? 'đang có dịch' : '', rs.war > 0 ? 'đang chiến tranh' : '', rs.raid > 0 ? `thú triều ${rs.raid.toFixed(2)}` : ''].filter(Boolean).join(' · ');
    box.innerHTML = `<h4>${esc(R.nameVi)}</h4>
      <div class="row"><span>${esc(bio.nameVi)}</span><span>Giàu ${Math.round(R.wealth * 100)}</span><span>Gini ${R.gini}</span><span>Nguy hiểm ${Math.round(R.danger * 100)}</span><span>Ma lực ${Math.round(R.magic * 100)}</span>${state ? `<span style="color:var(--bad)">${state}</span>` : ''}</div>
      <div class="lore">${esc(R.lore)}</div>
      <div class="row"><span>Dân: ${esc(top(R.races, k => J.races[k].nameVi))}</span><span>Đạo: ${esc(top(R.faiths, k => J.faiths[k].nameVi) || 'không')}</span></div>
      <div class="row"><span>${G.settlementsIn(R.id).slice(0, 8).map(s => `${esc(s.name)} <span class="fam">${G.TIER_VI[s.tier].toLowerCase()}</span>`).join(' · ') || 'Không có khu dân cư'}</span></div>
      ${zones}
      ${R.lord ? `<div class="rz" style="color:var(--risky)">Chúa vùng: ${esc(G.B.byId[R.lord.species].nameVi)} (ngủ ở ${esc(G.ZONE[R.lord.zone].zone.nameVi)})</div>` : ''}
      <div class="act">${S.dead ? '' : R.id === S.loc ? '<span class="fam">Bạn đang ở đây.</span>' : canGo ? '<button class="btn" id="goBtn">Lên đường tới đây</button>' : `<span class="fam">${adj ? 'Năm nay đã đi một chuyến.' : 'Không giáp vùng bạn đang ở.'}</span>`}</div>`;
    box.hidden = false;
    const go = $('goBtn');
    if (go) go.onclick = () => { S.flags.movedAge = S.age; const t = G.moveTo(sim, R.id); if (t) sim.log(t, 'info'); dirty = true; save(); };
  }

  function renderSide() {
    const S = sim.S;
    const peers = S.peers || [];
    $('peerCount').textContent = peers.length ? `(${peers.filter((p, i) => !S.peerSeen[i]).length}/${peers.length} còn sống)` : '';
    $('peers').innerHTML = peers.map((p, i) => {
      const gone = S.peerSeen[i];
      return `<div class="prow${gone ? ' gone' : ''}"><b>${esc(p.name)}</b> · ${esc(J.races[p.race].nameVi)} · ${esc(p.settlement || p.regionName)}<br>${gone ? `mất ở tuổi ${p.years}: ${esc(p.cause)}${p.rose ? ' · đã trỗi dậy' : ''}` : 'còn sống'}</div>`;
    }).join('') || '<div class="prow">Kiếp này không có đồng niên.</div>';
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
    G.drawMap(ctx, G.map, baseFor(pref.view), {
      selected: selRegion, zoneSel: selRegion === S.loc && S.zoneSel ? G.ZONE[S.zoneSel].index : null,
      path: S.path2, me: S.dead ? null : S.pos, undead: S.undead, time: (now - t0) / 1000,
      graves: graves.filter(g => g.world === G.realm.seed), realm: G.realm, view: pref.view, peers, hunt: !S.dead && (S.focus === 'hunt' || S.focus === 'adventure') ? S.huntPos : null
    });
  }
  function canvasPoint(ev) {
    const r = canvas.getBoundingClientRect();
    return [(ev.clientX - r.left) / r.width * canvas.width, (ev.clientY - r.top) / r.height * canvas.height];
  }
  canvas.addEventListener('mousemove', ev => {
    const [x, y] = canvasPoint(ev), c = G.map.at(x, y), tip = $('tip');
    if (!c) { tip.hidden = true; return; }
    const S = sim.S, ct = sim.ctier(S), cap = ct + (S.reckless ? 2 : 1);
    const lvl = c.zone.tier[1] <= ct ? 'safe' : c.zone.tier[0] <= ct ? 'fair' : c.zone.tier[0] <= cap ? 'risky' : 'locked';
    // Khu dân cư gần con trỏ (bán kính theo cỡ ký hiệu), tỉnh và nước của ô.
    const near = G.realm.settlements.filter(s => Math.hypot(s.x - x, s.y - y) < ({ capital: 10, city: 9, town: 8 }[s.tier] || 6)).sort((a, b) => Math.hypot(a.x - x, a.y - y) - Math.hypot(b.x - x, b.y - y))[0];
    const prov = G.provinceAtCell(c.cell), nat = G.nationAtCell(c.cell);
    const gv = graves.find(g => g.world === G.realm.seed && Math.hypot(g.x - x, g.y - y) < 7);
    const nearTxt = near ? (near.tier === 'ruin' ? `<br><b>${esc(near.name)}</b> · phế tích` : `<br><b>${esc(near.name)}</b> · ${G.TIER_VI[near.tier].toLowerCase()}${near.roles.length ? ', ' + near.roles.map(r => G.ROLE_VI[r]).join(', ') : ''} · ${near.urban.toLocaleString('vi')} người${near.rural ? ` · vùng quê ${near.rural.toLocaleString('vi')}` : ''}<br><span class="fam">${esc(near.buildings.join(', ') || 'chưa có công trình')}</span>`) : '';
    tip.innerHTML = `<b>${esc(c.region.nameVi)}</b> · ${esc(c.zone.nameVi)}<br><span style="color:${ZCOL[lvl]}">Tier ${c.zone.tier[0]}–${c.zone.tier[1]} · ${ZTXT[lvl]} với bạn</span>`
      + `<br>${esc(c.feature.nameVi)}${c.river ? ' · có sông' : ''}`
      + `<br>${nat ? `<span style="color:${nat.color}">${esc(nat.name)}</span>${prov ? ' · tỉnh ' + esc(prov.name) : ''}` : 'Đất vô chủ' + (prov ? ' · ' + esc(prov.name) : '')}`
      + nearTxt + (gv ? `<br>✝ ${esc(gv.name)}, ${gv.years} tuổi, ${esc(gv.cause)}${gv.rose ? ' · đã trỗi dậy' : ''}` : '');
    const r = canvas.getBoundingClientRect();
    tip.style.left = Math.min(ev.clientX - r.left + 14, r.width - 270) + 'px'; tip.style.top = (ev.clientY - r.top + 14) + 'px';
    tip.hidden = false;
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
  function setView(v) {
    pref.view = ['terrain', 'political'].includes(v) ? v : 'region'; store.set(PREF, pref); dirty = true;
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
