/* Vạn Kiếp — MẠCH TRUYỆN (docs/13; người dùng yêu cầu 16/10/2026).
 * Cây sự kiện (js/tree.js) chặn được chuyện vô lý nhưng mạch chỉ sâu hai nút, người trong truyện xuất hiện một lần rồi mất.
 * File này nạp SAU tree.js (dùng G.treeWrap để nút mới đi qua cổng chung) và thêm bốn lớp:
 *   1. Dàn nhân vật S.cast (tối đa G.STORY.castMax người): tên, loài, vai (G.ROLE_VI), độ thân −100…100, nghề, Tier, nơi ở.
 *      Mỗi lượt họ sống một đời giản lược (hệ con "cast": lớn lên, lên Tier, lập gia đình, chuyển đi, chết) và tích tin tức
 *      (p.news) để lần gặp sau có chuyện mà kể. Sự kiện cần "một người" thì lấy người trong dàn trước.
 *   2. Mạch S.arcs (G.ARCS; định nghĩa ở js/saga.js, js/arcs.js theo khuôn full()): open → knot → trial → climax → after → kết, có một người trong dàn làm nhân vật chính.
 *      Nút của mạch ghi `story: { arc, at, wait, to }`; nút đang mở được kéo trọng số × G.STORY.pull, quá wait[1] thì × 2,
 *      quá wait[1] + late mà không nút nào xảy ra thì mạch phai. Cùng lúc một mạch chính (đường đời) + tối đa G.STORY.arcMax mạch khác;
 *      mạch `passive` (lời bà đồng) không chiếm chỗ. Kết của mạch ghi ở S.arcDone.
 *   3. Mở mạch: sự kiện ngẫu nhiên có sẵn được móc thêm (patch): bị bắt nạt → Đối thủ, được cứu khỏi sông → Ơn cứu mạng,
 *      thua cướp → Mối thù, anh chị chết vì quái → Báo thù… Sự kiện vẫn bốc ngẫu nhiên như cũ; một phần gieo mạch.
 *   4. Chương đời (G.CHAPTERS): mỗi quãng đời (thiếu thời, lập thân, trung niên, xế chiều; Bộ Xương: thức giấc, giữa hai cõi,
 *      lửa hồn lụi dần) có một câu hỏi chọn theo quỹ đạo, hoàn cảnh, mạch chính. Hết quãng thì ghi đã làm được hay chưa;
 *      sự kiện hợp hướng của câu hỏi được cộng trọng số. Lúc chết có đoạn "người ta nhớ về bạn" ghép từ các mạch đã khép.
 * Nhật ký: dòng thuộc mạch mang nhãn (e.arc, life.js log đọc X._tag). Đếm cho sim.html: G.STORY_STATS khi G.STORY.stats.
 * Trạng thái: S.cast, S.castN, S.arcs, S.arcDone, S.chap, S.chapDone; S.flags.stEv, stLink (sự kiện, sự kiện thuộc mạch).
 */
window.LifeSim = window.LifeSim || {};
(function (G) {
  const J = window.JobLibrary, DEC = G.DECISIONS;
  const cnt = (S, k, v = 1) => { S.flags[k] = (S.flags[k] || 0) + v; };

  G.STORY = { castMax: 12, arcMax: 5, pull: 4, mainK: 1.5, late: 2, chapBoost: .5, stats: false };
  G.STORY_STATS = null;
  G.storyStatsReset = () => { G.STORY_STATS = { node: {}, open: {}, end: {}, fade: {}, gone: {}, chap: {}, ev: 0, link: 0, dec: 0, dlink: 0 }; return G.STORY_STATS; };
  const stat = (k, id, n = 1) => { const Z = G.STORY.stats && G.STORY_STATS; if (Z) Z[k][id] = (Z[k][id] || 0) + n; };

  // ═════════ Tiện ích ═════════
  const first = p => String(p.name).split(' ')[0];
  const sh = (S, a) => G.trajShare(S, a);
  const med = (S, X) => G.median(X.reg(S));
  const flesh = S => !S.undead && !G.RACES[S.race].construct;
  const single = S => !(S.family.spouse && S.family.spouse.alive);
  const logit = d => 1 / (1 + Math.exp(-3 * d));
  // Sức của người trong dàn, cùng thang với X.power (sim.html: Phàm Nhân ~1,2, mỗi Tier thêm ~1,1).
  const npcPow = (p, k) => 1.1 + 1.1 * p.tier + k;
  const regName = id => (G.REGION[id] ? G.REGION[id].nameVi : 'phương xa');
  const homeName = S => { const s = S.home.settlement != null && G.SET[S.home.settlement]; return s ? s.name : G.REGION[S.loc].nameVi; };
  const capName = S => { const n = G.here && G.here(S).n; return n && G.SET[n.capital] ? G.SET[n.capital].name : 'kinh đô'; };
  const workVi = p => (p.work && G.WORKS[p.work] ? G.WORKS[p.work].nameVi.toLowerCase() : null);
  const yu = S => (S.undead ? 'năm' : 'tuổi');
  const keep = (f, o) => { if (o) f.toString = () => o.toString(); return f; };

  // ═════════ 1. Dàn nhân vật ═════════
  G.ROLE_VI = { ban: 'bạn', doi: 'đối thủ', thu: 'kẻ thù', an: 'ân nhân', on: 'người mang ơn', thay: 'thầy', tro: 'học trò', tinh: 'người thương cũ',
    phoi: 'bạn đời', no: 'chủ nợ', bimat: 'người giữ bí mật', than: 'người trong mộng ước', ho: 'ruột thịt' };
  const FIGHTER = { guard: 1, hunter: 1, adventurer: 1, bodyguard: 1, thief: 1, tamer: 1 };
  const ROLE_WORK = { doi: ['guard', 'hunter', 'adventurer', 'merchant', 'smith'], thu: ['thief', 'guard', 'merchant'], an: ['herder', 'farmer', 'woodcutter', 'healer'],
    on: ['merchant', 'scholar', 'steward'], ban: ['farmer', 'smith', 'hunter', 'guard', 'merchant', 'healer', 'sailor', 'cook'], tinh: ['farmer', 'tailor', 'healer', 'merchant', 'cook', 'scholar'] };
  G.castYrs = (S, p) => Math.max(0, Math.round((p.died ?? S.world.year) - p.by));
  G.castGet = (S, id) => (id == null ? null : (S.cast || []).find(p => p.id === id) || null);
  // Gọi tên: lâu không gặp thì nhắc người đó là ai ("Gorn, đứa cầm đầu lũ bắt nạt bạn hồi nhỏ,"); refE dùng ở cuối câu.
  const ref = (S, p) => (p.how && S.age - p.seen >= 3 ? `${first(p)}, ${p.how},` : first(p));
  const refE = (S, p) => (p.how && S.age - p.seen >= 3 ? `${first(p)} (${p.how})` : first(p));
  G.castAdd = function (S, X, o) {
    const C = S.cast || (S.cast = []);
    let race = o.race || (S.undead || G.RACES[S.race].construct ? 'human' : S.race);
    if (G.RACES[race].undead) race = 'human';
    const R = G.RACES[race], sex = o.sex || (R.sexes.length > 1 ? (X.chance(.5) ? 'm' : 'f') : R.sexes[0]);
    // Tên không trùng người đã có trong dàn (kho tên một loài có hạn); tuổi kẹp trong đời của loài người đó (trừ ruột thịt).
    let name = o.name || X.name(race, sex);
    for (let k = 0; k < 6 && !o.name && C.some(x => first(x) === name.split(' ')[0]); k++) name = X.name(race, sex);
    const yrs = o.sib != null ? o.yrs : G.clamp(o.yrs ?? X.years(S), 0, R.le * .55);
    const p = { id: S.castN = (S.castN || 0) + 1, name, race, sex, by: Math.round(S.world.year - yrs),
      role: o.role, how: o.how || '', bond: o.bond || 0, tier: o.tier || 0, tier0: o.tier || 0, work: o.work || null, loc: o.loc || S.loc,
      alive: true, met: S.age, seen: S.age, n: 1, news: [], drive: o.drive ?? X.rnd(), wed: !!o.wed };
    for (const k of ['sib', 'comp', 'disc']) if (o[k] != null) p[k] = o[k];
    C.push(p);
    while (C.length > G.STORY.castMax) {   // bỏ người ít liên quan nhất: không ở trong mạch nào, đã mất, nhạt, lâu không gặp
      const inArc = new Set((S.arcs || []).map(a => a.who));
      const cand = C.filter(x => x !== p && !inArc.has(x.id));
      if (!cand.length) break;
      const sc = x => (x.alive ? 10 : 0) + Math.abs(x.bond) / 10 - (S.age - x.seen) / 5;
      C.splice(C.indexOf(cand.reduce((a, b) => (sc(b) < sc(a) ? b : a))), 1);
    }
    return p;
  };
  const castHas = (S, role) => (S.cast || []).some(p => p.alive && p.role === role);
  // Gặp mặt: cập nhật lần gặp, độ thân; đánh dấu sự kiện này thuộc mạch.
  const touch = (S, X, p, d) => { p.seen = S.age; p.n++; if (d) p.bond = G.clamp(p.bond + d, -100, 100); X._lk = true; };
  // Lấy (và xóa) tối đa hai tin mới nhất của người quen; nwSay nối thành một vế: "đã chuyển tới X, rồi lập gia đình".
  const newsL = p => p.news.splice(0).slice(-2);
  const nwSay = L => L.map((x, i) => (i ? x.replace(/^đã /, '') : x)).join(', rồi ');
  const newsOf = p => nwSay(newsL(p));
  const tagOf = (a, p) => G.ARCS[a.k].nameVi + (p ? ' · ' + first(p) : a.d.kin ? ' · ' + a.d.kin : '');

  // Đời giản lược của người trong dàn (hệ con "cast", trước "story").
  const GRIEF = ['Tối ấy bạn thắp một nén nhang, ngồi nhìn khói bay cho tới khi nhang tàn hẳn.', 'Bạn lục ra món đồ cũ người ấy từng cho, cầm trong tay một lúc lâu rồi mới cất đi.', 'Bạn rót hai chén rượu, uống một chén, chén kia để nguyên trên bàn tới sáng.', 'Cả ngày hôm ấy bạn không nói câu nào, tới bữa chỉ ngồi nhìn bát cơm nguội dần.'];
  // Câu nhớ người quen vừa mất (thân thiết, không ở trong mạch nào), chọn theo vai.
  const LOSS = { ban: 'Bao nhiêu chuyện hai người hẹn nhau, giờ còn dở dang gần hết.', an: 'Cái ơn năm xưa, bạn chưa kịp trả cho trọn.', on: 'Người bạn từng cứu một lần, rốt cuộc vẫn không giữ lại được.',
    thay: 'Những gì thầy dạy, bạn vẫn còn giữ trong tay. Người dạy thì không còn nữa.', tro: 'Bạn nhớ ngày đầu nó tới học, lóng ngóng không biết cầm gì trước.', tinh: 'Bạn nhớ một mùa hè cũ, rồi thôi, không cho mình nhớ thêm.',
    ho: 'Bạn nhớ những bữa cơm chung mâm hồi nhỏ, tiếng giành nhau miếng cháy dưới đáy nồi.', than: 'Người bạn từng theo sau suốt ba ngày hồi nhỏ, giờ chỉ còn lại trong trí nhớ.', doi: 'Không còn ai để bạn ganh đua nữa. Tự nhiên thấy trống.' };
  function castDie(S, X, p, why) {
    p.alive = false; p.died = S.world.year; p.news = [];
    const A = (S.arcs || []).filter(a => a.who === p.id);
    for (const a of A) {
      const D = G.ARCS[a.k], t = D.gone ? D.gone(S, p, a) : null;
      if (t) { X._tag = tagOf(a, p); X.log(t, 'bad'); X._tag = null; X._lk = true; }
      // Đã qua cao trào: mạch khép bằng kết đã định (D.endOf, js/saga.js), không thành dở dang.
      if (a.at === 'after' && D.endOf && a.d.end) { G.arcEnd(S, X, a, D.endOf(S, X, a, p)); continue; }
      stat('gone', a.k); G.arcEnd(S, X, a, 'gone');
    }
    if (!A.length && Math.abs(p.bond) >= 30 && !p.missing) {
      X._tag = 'Người quen · ' + first(p);
      X.log(p.bond > 0 ? `Tin ${refE(S, p)} mất${why ? ' vì ' + why : ''} tới tai bạn vào một buổi chiều chẳng có gì khác mọi ngày. ${LOSS[p.role] || 'Bạn cố nhớ lần cuối hai người gặp nhau, đã nói với nhau những gì.'} ${X.pick(GRIEF)}`
        : `Có người kể ${refE(S, p)} đã chết${why ? ' vì ' + why : ''}. Bạn chờ mình thấy hả dạ, mà cái cảm giác ấy mãi không tới. Chuyện cũ giữa hai người giờ chẳng còn ai để tính sổ.`, p.bond > 0 ? 'bad' : 'info');
      X._tag = null; p.heard = S.age;
    } else if (!A.length) p.news.push('đã mất');
  }
  G.castYear = function (S, X) {
    const C = S.cast; if (!C || !C.length) return;
    const dy = X.R(S).ypt, per = q => 1 - Math.pow(1 - G.clamp(q, 0, 1), dy);
    for (const p of C) {
      if (!p.alive) continue;
      if (p.seen !== S.age) p.bond *= Math.pow(.97, dy);
      if (p.sib != null) { const s = S.family.sibs[p.sib]; if (s && !s.alive) { castDie(S, X, p, null); continue; } }
      if (p.missing) continue;
      const R = G.RACES[p.race], y = G.castYrs(S, p), k = 62 / R.le;
      if (y >= R.adult && !p.work) p.work = X.pick(ROLE_WORK[p.role] || ROLE_WORK.ban);
      const tmax = Math.max(p.tier0, Math.floor(Math.pow(p.drive, 3) * 4.5));
      if (y >= R.adult * .9 && p.tier < tmax && X.rnd() < per((.04 + .06 * p.drive) * k * (FIGHTER[p.work] ? 1.3 : 1))) { p.tier++; p.news.push(`đã thành ${G.tierName(p.tier)}`); }
      if (!p.wed && y >= R.adult && !R.construct && p.role !== 'phoi' && X.rnd() < per(.07 * k)) { p.wed = true; p.news.push('đã lập gia đình'); }
      if (p.role !== 'phoi' && p.role !== 'ho' && X.rnd() < per(.015 * k)) { const r = X.pick(G.REGIONS); if (r.id !== p.loc) { p.loc = r.id; p.news.push(`đã chuyển tới ${r.nameVi}`); } }
      if (p.role === 'phoi' || p.met === S.age) continue;   // bạn đời sống chết theo hệ con family; người mới gặp năm nay chưa chết vội
      // Người đang ở giữa một mạch (chưa tới hồi kết) chết ngẫu nhiên ít hơn: mạch nào cũng nên đi được tới kết (docs/16 mục 10).
      const x = y / R.le, fight = FIGHTER[p.work] ? .005 : 0, mid = (S.arcs || []).some(a => a.who === p.id && a.at !== 'after') ? .6 : 1;
      if (X.rnd() < per((.002 + fight + (x > .55 ? 2.4 * (x - .55) ** 2 : 0)) * k * mid)) castDie(S, X, p, fight && X.chance(.5) ? X.pick(['một trận săn quái', 'một vụ phục kích trên đường', 'vết thương cũ']) : null);
    }
  };

  // ═════════ 2. Mạch ═════════
  // G.ARCS[k]: nameVi, quest(p, a) (câu hỏi của chương khi mạch là mạch chính), good (kết coi như "làm được"), sum(o, p, rec)
  // (một vế trong đoạn tưởng nhớ lúc chết), marks (dấu theo kết), gone (dòng nhật ký khi người trong mạch chết trước khi mạch khép),
  // fade, passive (không chiếm chỗ). Mọi mạch đều đầy đủ 5 hồi, định nghĩa bằng khuôn full() (js/saga.js): mạch chính cả đời ở
  // js/saga.js (tier 'main'), mạch người quen và mạch đời thường ở js/arcs.js.
  G.ARCS = {};
  // Chỗ mạch (docs/16 mục 10): một mạch chính (tier 'main') + tối đa G.STORY.arcMax mạch khác đang mở; mạch passive không chiếm chỗ.
  const tierOf = a => G.ARCS[a.k].tier || 'arc';
  const isActive = a => !G.ARCS[a.k].passive && tierOf(a) !== 'main';
  const isOpen = a => !G.ARCS[a.k].passive;
  const TIER_MAX = { main: () => 1, arc: () => G.STORY.arcMax };
  G.arcOpen = function (S, X, k, p, d, at) {
    const A = S.arcs || (S.arcs = []), D = G.ARCS[k], who = p ? p.id : null;
    if (A.some(a => a.k === k && a.who === who)) return null;
    const tier = D.tier || 'arc';
    if (!D.passive && A.filter(x => isOpen(x) && tierOf(x) === tier).length >= TIER_MAX[tier]()) return null;
    const a = { k, who, at: at || 'open', t: S.age, t0: S.age, main: false, d: d || {} };
    // Mạch chính của chương: mạch chính cả đời nếu có, không thì mạch mở đầu tiên.
    if (tier === 'main') { for (const x of A) x.main = false; a.main = true; }
    else if (!D.passive && !A.some(x => x.main)) a.main = true;
    A.push(a); stat('open', k); X._lk = true; X._tag = tagOf(a, p);
    return a;
  };
  G.arcEnd = function (S, X, a, o) {
    const A = S.arcs || [], i = A.indexOf(a); if (i < 0) return;
    A.splice(i, 1);
    const p = G.castGet(S, a.who);
    (S.arcDone || (S.arcDone = [])).push({ k: a.k, who: a.who, name: p ? p.name : null, o, y: X.years(S), t0: a.t0, t: S.age, d: a.d, main: a.main });
    if (o !== 'gone' && o !== 'faded') stat('end', a.k + ':' + o);
    if (a.main) { const nx = A.find(x => tierOf(x) === 'main') || A.find(isActive); if (nx) nx.main = true; }
  };
  G.arcStep = function (S, X, a, to, o) {
    if (o != null) a.o = String(o);
    if (to === 'end') { G.arcEnd(S, X, a, a.o || 'done'); return; }
    a.at = to; a.t = S.age;
  };
  const MAXW = {};   // 'arc:at' → wait[1] lớn nhất của các nút ở bước đó (để biết lúc nào mạch phai)
  const arcFor = (S, s) => (S.arcs || []).find(a => {
    if (a.k !== s.arc || !s.at.includes(a.at)) return false;
    const dt = S.age - a.t; if (dt < s.wait[0] || dt > s.wait[1] + G.STORY.late) return false;
    if (a.who != null) { const p = G.castGet(S, a.who); if (!p || (!p.alive && !s.dead)) return false; }
    return true;
  });
  const whoOf = (S, a) => (a ? G.castGet(S, a.who) : null);
  const reg = (s) => { s.at = [].concat(s.at || 'open'); s.wait = s.wait || [0, 99]; for (const at of s.at) { const k = s.arc + ':' + at; MAXW[k] = Math.max(MAXW[k] || 0, s.wait[1]); } };
  const NEW_EV = [], NEW_DEC = [];
  // Nút sự kiện của mạch: c / w / run nhận thêm (a, p) = mạch, người trong mạch. run trả { t, k, o, to, bond }.
  function node(e) {
    const s = e.story; reg(s);
    const c0 = e.c, w0 = e.w ?? 3, r0 = e.run;
    e.rep = true; e.gap = 1; e.wSt = w0;   // wSt: trọng số gốc (trang duyệt)
    e.c = keep((S, X) => { const a = arcFor(S, s); return !!a && (!c0 || !!c0(S, X, a, whoOf(S, a))); }, c0);
    e.w = keep((S, X) => {
      const a = arcFor(S, s); if (!a) return 0;
      const b = typeof w0 === 'function' ? w0(S, X, a, whoOf(S, a)) : w0;
      return Math.max(0, b) * G.STORY.pull * (a.main ? G.STORY.mainK : 1) * (S.age - a.t > s.wait[1] ? 2 : 1);
    }, typeof w0 === 'function' ? w0 : null);
    e.run = keep(function (S, X) {
      const a = arcFor(S, s), p = whoOf(S, a); if (!a) return null;
      const r = r0.call(this, S, X, a, p);
      if (r && !S.dead) {
        X._tag = tagOf(a, p); X._lk = true; stat('node', e.id);
        if (p) touch(S, X, p, r.bond || 0);
        if (r.to !== null) G.arcStep(S, X, a, r.to || s.to || 'end', r.o);
      }
      return r;
    }, r0);
    G.EVENTS.push(e); NEW_EV.push(e);
  }
  // Nút quyết định của mạch (hồi cao trào): when / build / apply / auto nhận thêm (a, p). apply trả chuỗi hoặc { t, o, to }.
  function dnode(id, D) {
    const s = D.story; reg(s);
    const w0 = D.when, b0 = D.build, a0 = D.apply, u0 = D.auto;
    D.prio = D.prio ?? 7; D.gap = D.gap ?? 1;   // cao trào của mạch đứng trên phần lớn quyết định thường (mỗi năm chỉ mở tối đa hai)
    D.when = keep((S, X) => { if (S.dead) return false; const a = arcFor(S, s); return !!a && (!w0 || !!w0(S, X, a, whoOf(S, a))); }, w0);
    D.build = keep((S, X) => { const a = arcFor(S, s); return a ? b0(S, X, a, whoOf(S, a)) : null; }, b0);
    D.apply = keep(function (S, X, k, c) {
      const a = arcFor(S, s), p = whoOf(S, a);
      X._tag = a ? tagOf(a, p) : null; X._lk = true;
      const r = a0.call(this, S, X, k, c, a, p);
      if (a && !S.dead) {
        stat('node', id);
        if (p) touch(S, X, p, 0);
        const to = r && typeof r === 'object' && r.to !== undefined ? r.to : (s.to || 'after');
        if (to !== null) G.arcStep(S, X, a, to, (r && typeof r === 'object' && r.o) || k);
      }
      return r && typeof r === 'object' ? r.t : r;
    }, a0);
    D.auto = (S, X, d) => (u0 ? u0(S, X, d, arcFor(S, s), whoOf(S, arcFor(S, s))) : d.choices[0].k);
    DEC[id] = D; NEW_DEC.push(id);
  }
  // Móc thêm vào sự kiện / quyết định có sẵn: chạy sau hàm gốc (đã qua cổng cây), sửa câu chữ, mở mạch.
  G.STORY_HOOKS = [];   // trang duyệt: sự kiện / quyết định có sẵn được móc thêm, kèm hàm móc (trích câu chữ)
  function patch(id, post) {
    const e = G.EVENTS.find(x => x.id === id); if (!e) return;
    G.STORY_HOOKS.push({ id, dec: false, fn: post });
    const r0 = e.run;
    e.run = keep(function (S, X) { const r = r0.call(this, S, X); if (r && !S.dead) post(S, X, r); return r; }, r0);
  }
  function patchDec(id, post) {
    const D = DEC[id]; if (!D) return;
    G.STORY_HOOKS.push({ id, dec: true, fn: post });
    const a0 = D.apply;
    D.apply = keep(function (S, X, k, c) { const out = a0.call(this, S, X, k, c); return S.dead ? out : post(S, X, k, c, out) ?? out; }, a0);
  }

  // ═════════ 3. Mở mạch từ sự kiện có sẵn ═════════
  // ── Đối thủ: đứa cầm đầu lũ bắt nạt ──
  patch('ch_bully', (S, X, r) => {
    if (castHas(S, 'doi')) return;
    const p = G.castAdd(S, X, { role: 'doi', how: 'đứa cầm đầu lũ bắt nạt bạn hồi nhỏ', yrs: X.years(S) + X.int(1, 3), bond: -30, drive: .35 + .65 * X.rnd() });
    const t0 = r.t; r.t = r.t.replace('Lũ trẻ lớn hơn', `Lũ trẻ lớn hơn, cầm đầu là ${first(p)},`);
    r.t += r.t !== t0 ? ` Bao nhiêu vết bầm rồi cũng lặn, riêng cái tên ${first(p)} thì bạn nhớ mãi.` : ` Đứa cầm đầu tên là ${first(p)}. Bao nhiêu vết bầm rồi cũng lặn, riêng cái tên ấy thì bạn nhớ mãi.`;
    G.arcOpen(S, X, 'rival', p, { fought: S.traits.bold > .55 });
  });
  // ── Ơn cứu mạng: người kéo bạn khỏi sông ──
  patch('ch_river', (S, X, r) => {
    const p = G.castAdd(S, X, { role: 'an', how: 'người chăn dê kéo bạn khỏi sông năm nào', yrs: X.years(S) + X.int(14, 30), work: 'herder', bond: 45, drive: .2 * X.rnd() });
    const t0 = r.t; r.t = r.t.replace('Một người chăn dê', `Một người chăn dê tên ${first(p)}`);
    r.t += r.t !== t0 ? ` Về sau, mỗi lần đi ngang bến ấy, bạn lại nhớ đôi bàn tay chai sạn đã túm lấy cổ áo mình. Cái ơn ấy bạn chưa biết lấy gì mà trả.` : ` Người kéo bạn lên là ${first(p)}, một người chăn dê. Cái ơn ấy bạn chưa biết lấy gì mà trả.`;
    G.arcOpen(S, X, 'grace', p, { need: X.pick(['money', 'son', 'escort']) });
  });
  // ── Bạn thân: người bạn sau trận ẩu đả; ad_old_friend dùng người bạn có trong dàn ──
  patch('tn_brawl', (S, X, r) => {
    if ((S.cast || []).filter(p => p.alive && p.role === 'ban').length >= 2) return;
    const p = G.castAdd(S, X, { role: 'ban', how: 'người bạn quen sau trận ẩu đả ở quán rượu', yrs: X.years(S) + X.int(-2, 4), bond: 35, work: X.pick(['guard', 'hunter', 'adventurer', 'smith']) });
    const t0 = r.t; r.t = r.t.replace('được một người bạn', `được một người bạn: ${first(p)}`);
    r.t += r.t !== t0 ? ` Tan trận, hai người ngồi bệt ngoài cửa quán, chia nhau mảnh giẻ chặm máu, cười tới đau cả quai hàm. Lúc chia tay, ${first(p)} dặn lần sau có đánh nhau thì nhớ gọi.` : ` Người đứng cùng phía với bạn đêm ấy tên ${first(p)}. Lúc chia tay, ${first(p)} dặn lần sau có đánh nhau thì nhớ gọi.`;
    G.arcOpen(S, X, 'friend', p, {});
  });
  patch('ad_old_friend', (S, X, r) => {
    const fr = (S.cast || []).filter(p => p.alive && !p.missing && p.role === 'ban' && S.age - p.seen >= 2 && !(S.arcs || []).some(a => a.who === p.id));
    if (!fr.length) return;
    const p = fr.reduce((a, b) => (b.bond > a.bond ? b : a)), nw = newsOf(p), w = workVi(p);
    r.t = [`${S.age % 2 ? 'Giữa phiên chợ đông' : 'Ở một quán nước ven đường'}, có ai đó gọi giật tên bạn từ phía sau. Quay lại thì là ${refE(S, p)}, khác đi nhiều, mà giọng cười thì vẫn y như cũ.`,
      nw ? `${first(p)} kể mình ${nw}.` : w ? `Giờ ${first(p)} làm ${w}.` : '',
      'Hai người tìm một góc ngồi, gọi rượu, uống tới sáng. Chuyện ngày xưa, hóa ra mỗi người nhớ một kiểu, cãi nhau mãi không ai chịu ai.'].filter(Boolean).join(' ');
    touch(S, X, p, 10); X._tag = 'Người quen · ' + first(p);
  });
  // ── Tình xưa: mối tình đầu; người cầu hôn bị từ chối ──
  patch('tn_love', (S, X, r) => {
    const m = /với (\S+) kéo dài/.exec(r.t); if (!m) return;
    const p = G.castAdd(S, X, { name: m[1], role: 'tinh', how: 'mối tình đầu của bạn', yrs: X.years(S) + X.int(-1, 2), bond: 40 });
    G.arcOpen(S, X, 'love', p, {});
  });
  patchDec('marriage', (S, X, k, c, out) => {
    const s = S.flags._suitorWas; S.flags._suitorWas = null;
    if (k !== 'no' || !s) return;
    const p = G.castAdd(S, X, { name: s.name, race: s.race, yrs: s.age, role: 'tinh', how: 'người từng ngỏ lời với bạn', bond: 20 });
    G.arcOpen(S, X, 'love', p, { refused: true });
  });
  { const D = DEC.marriage, b0 = D.build; D.build = keep(function (S, X) { S.flags._suitorWas = S.flags.suitor; return b0.call(this, S, X); }, b0); }
  // ── Bạn đồng hành (events.js, nhánh ở tree.js) ──
  const compOf = S => (S.cast || []).find(p => p.comp);
  patch('ad_companion', (S, X, r) => {
    const c = S.flags.companion; if (!c) return;
    G.castAdd(S, X, { name: c.name, race: c.race, role: 'ban', how: 'bạn đồng hành cũ', bond: 30, work: 'adventurer', comp: true, drive: .3 + .7 * X.rnd() });
  });
  patch('cp_save', (S, X, r) => { const p = compOf(S); if (!p) return; touch(S, X, p, 40); p.role = 'an'; G.arcOpen(S, X, 'grace', p, { need: X.pick(['money', 'escort']) }); });
  patch('cp_betray', (S, X, r) => {
    const p = compOf(S); if (!p) return; p.comp = false; p.role = 'thu'; p.how = 'kẻ ôm túi chung bỏ đi'; p.bond = -60;
    p.loc = X.pick(G.REGIONS).id; G.arcOpen(S, X, 'feud', p, { gold: Math.round(med(S, X) * .4) });
  });
  patch('cp_wed', (S, X, r) => { const p = compOf(S); if (!p) return; p.comp = false; p.role = 'phoi'; p.how = 'bạn đời của bạn'; touch(S, X, p, 30); });
  patch('cp_part', (S, X, r) => { const p = compOf(S); if (!p) return; p.comp = false; p.loc = X.pick(G.REGIONS).id; touch(S, X, p, 10); G.arcOpen(S, X, 'friend', p, {}, 'after'); });
  patch('ad_companion_lost', (S, X, r) => { const p = compOf(S); if (!p) return; p.comp = false; p.missing = true; G.arcOpen(S, X, 'lost', p, {}); });
  // ── Thầy, đệ tử (edu.js), hắc đồ (tree.js) ──
  patchDec('mentor', (S, X, k, c) => {
    if (k === 'no' || !S.mentor || S.mentor.name !== c.name || S.mentor.y) return;
    const p = G.castAdd(S, X, { name: c.name, role: 'thay', how: 'thầy của bạn', yrs: X.years(S) + X.int(22, 40), tier: c.tier || 1, work: c.work || 'adventurer', bond: 30, drive: .8 });
    G.arcOpen(S, X, 'master', p, { kind: c.kind, school: c.school || null, work: c.work || null });
  });
  patchDec('disciple', (S, X, k, c) => {
    if (k !== 'yes') return;
    G.castAdd(S, X, { name: c.name, role: 'tro', how: 'đệ tử của bạn', yrs: X.int(14, 22), bond: 30, disc: c.name, drive: .3 + .7 * X.rnd() });
  });
  const discOf = S => { const d = (S.disciples || [])[(S.disciples || []).length - 1]; return d ? (S.cast || []).find(p => p.disc === d.name) : null; };
  patch('dt_proud', (S, X) => { const p = discOf(S); if (p) touch(S, X, p, 20); });
  patch('dt_rival', (S, X) => { const p = discOf(S); if (!p) return; p.role = 'doi'; p.how = 'đệ tử phản sư của bạn'; p.bond = -40; touch(S, X, p, 0); G.arcOpen(S, X, 'rival', p, {}, 'knot'); });
  patch('dt_fallen', (S, X) => { const p = discOf(S); if (p) { p.alive = false; p.died = S.world.year; X._lk = true; } });
  patchDec('sk_acolyte', (S, X, k, c) => { if (k === 'yes') G.castAdd(S, X, { name: c.name, race: 'human', role: 'tro', how: 'hắc đồ của bạn', yrs: X.int(18, 30), bond: 25 }); });
  // ── Mối thù: tên cầm đầu toán cướp ──
  patch('ad_bandits', (S, X, r) => {
    if (r.k !== 'bad' || !X.chance(.4) || (S.arcs || []).some(a => a.k === 'feud')) return;
    const p =G.castAdd(S, X, { role: 'thu', how: 'tên cướp chặn đường lấy tiền của bạn', yrs: X.years(S) + X.int(-3, 8), tier: Math.max(0, X.ctier(S)), work: 'thief', bond: -50, drive: .4 + .6 * X.rnd() });
    r.t += ` Tên cầm đầu đếm tiền ngay trước mặt bạn, chậm rãi từng đồng, vừa đếm vừa cười. Đồng bọn gọi kẻ ấy là ${first(p)}. Bạn nhìn thật kỹ khuôn mặt ấy, để mai sau có gặp lại thì nhận ra ngay.`;
    G.arcOpen(S, X, 'feud', p, { gold: Math.round(med(S, X) * .4) });
  });
  // ── Báo thù: anh chị chết khi quái tràn vào làng (events.js đặt S.flags.kinKilled) ──
  patch('ch_raid', (S, X, r) => {
    const k = S.flags.kinKilled; S.flags.kinKilled = null; if (!k) return;
    G.arcOpen(S, X, 'vengeance', null, k);
  });
  // ── Mộng ước: người đi đường ghé quán trọ (events.js đặt S.flags.idol) ──
  patch('ch_knight', (S, X, r) => {
    const j = S.flags.idol; S.flags.idol = null; if (!j) return;
    const p = G.castAdd(S, X, { race: X.chance(.7) ? S.race : undefined, role: 'than', how: `${j.job.toLowerCase()} bạn theo suốt ba ngày hồi nhỏ`, yrs: X.years(S) + X.int(18, 35), tier: j.tier, work: 'adventurer', bond: 15, drive: .6 + .4 * X.rnd() });
    const t0 = r.t; r.t = r.t.replace(`${j.job} ghé`, `${j.job} tên ${first(p)} ghé`);
    r.t += r.t !== t0 ? ` Mấy tháng sau, bạn vẫn còn lẩm nhẩm cái tên ${first(p)} mỗi lần ra bờ giếng.` : ` Người ấy tên ${first(p)}. Mấy tháng sau bạn vẫn còn lẩm nhẩm cái tên ấy.`;
    G.arcOpen(S, X, 'idol', p, { school: j.school });
  });
  // ── Nợ cờ bạc: thua rồi vay để gỡ ──
  patch('ad_dice', (S, X, r) => {
    if (r.k !== 'bad' || S.gold > med(S, X) || !X.chance(.5) || (S.arcs || []).some(a => a.k === 'debt')) return;
    const amt = Math.round(med(S, X) * .5);
    const p = G.castAdd(S, X, { role: 'no', how: 'tay cho vay nặng lãi', yrs: X.years(S) + X.int(5, 20), work: 'merchant', bond: -10, drive: .5 });
    r.t += ` Không cam lòng, bạn vay ${first(p)}, tay cho vay ngồi sẵn ở góc chiếu bạc, ${G.coin(amt)} để gỡ. Mấy ván sau, số tiền ấy cũng đi nốt. ${first(p)} ghi tên bạn vào cuốn sổ bìa da, nắn nót từng chữ, rồi mỉm cười.`;
    G.arcOpen(S, X, 'debt', p, { amt, loc: S.loc });
  });
  // ── Lời bà đồng ──
  patch('ad_prophet', (S, X, r) => { const m = /năm (\d+) tuổi/.exec(r.t); if (m && +m[1] > X.years(S)) G.arcOpen(S, X, 'prophecy', null, { y: +m[1] }); });
  // ── Kẻ săn: Thánh Kỵ Sĩ trẻ được tha ──
  patch('sk_paladin', (S, X, r) => {
    if (!/đánh gãy kiếm/.test(r.t) || (S.arcs || []).some(a => a.k === 'hunter')) return;
    const p = G.castAdd(S, X, { race: 'human', role: 'thu', how: 'Thánh Kỵ Sĩ trẻ bạn từng tha mạng', yrs: X.int(19, 26), tier: Math.max(1, X.ctier(S)), work: 'guard', bond: -20, drive: .8 });
    const t0 = r.t; r.t = r.t.replace('Một Thánh Kỵ Sĩ trẻ', `Một Thánh Kỵ Sĩ trẻ tên ${first(p)}`);
    r.t += r.t !== t0 ? ` Đi được một quãng, ${first(p)} còn ngoái lại một lần, tay nắm chặt nửa thanh kiếm gãy.` : ` Người ấy tên ${first(p)}. Đi được một quãng còn ngoái lại một lần, tay nắm chặt chuôi kiếm.`;
    G.arcOpen(S, X, 'hunter', p, {});
  });

  // ═════════ 4. Sự kiện mở mạch mới (vẫn bốc ngẫu nhiên) ═════════
  const opener = e => { G.EVENTS.push(e); NEW_EV.push(e); };
  const noArc = (S, k) => !(S.arcs || []).some(a => a.k === k);
  const slot = S => (S.arcs || []).filter(isActive).length < G.STORY.arcMax;
  opener({ id: 'st_friend', st: ['child'], w: S => ((S.cast || []).some(p => p.role === 'ban') ? 0 : 2.5), tree: { body: 'living' },
    run(S, X) {
      const w = X.pick(['thợ rèn', 'thợ săn', 'người chăn dê', 'bà bán bánh', 'ông lái đò', 'thầy lang']);
      const p = G.castAdd(S, X, { role: 'ban', how: 'bạn thân hồi nhỏ của bạn', yrs: X.years(S) + X.int(-1, 1), bond: 50 });
      G.arcOpen(S, X, 'friend', p, {});
      return { t: `${first(p)} là con nhà ${w} cạnh nhà, sàn sàn tuổi bạn. Hai đứa quen nhau từ hôm cùng trèo trộm một cây ổi nhà hàng xóm và cùng bị bắt quả tang. Từ đó đi đâu cũng có nhau, bị phạt cũng có nhau. Có miếng gì ngon, ${first(p)} luôn để phần bạn một nửa.`, k: 'good' };
    } });
  opener({ id: 'st_rival', st: ['teen'], w: S => (castHas(S, 'doi') ? 0 : 1.5), tree: { body: 'living' },
    c: S => slot(S),
    run(S, X) {
      const p = G.castAdd(S, X, { role: 'doi', how: 'kẻ luôn hơn bạn một bậc thời trai trẻ', yrs: X.years(S) + X.int(-1, 1), bond: -20, drive: .5 + .5 * X.rnd() });
      G.arcOpen(S, X, 'rival', p, {});
      const what = S.work ? `ở chỗ làm ${G.WORKS[S.work].nameVi.toLowerCase()}` : X.pick(['ở bãi tập của làng', 'ở lớp chữ của đền', 'trong đám thanh niên đi săn']);
      return { t: `${what[0].toUpperCase() + what.slice(1)}, có một người tên ${first(p)} việc gì cũng làm hơn bạn một chút. Bạn xong một việc thì người ta đã xong hai, bạn được khen một câu thì người ta được khen hai. Mà ${first(p)} không bao giờ để bạn quên điều đó: một cái nhếch mép, một cái liếc ngang mỗi lần đi qua. Tối về, bạn nằm nghĩ cách vượt lên tới tận khuya.`, k: 'info' };
    } });
  opener({ id: 'st_rescue', st: ['adult', 'elder'], rep: true, gap: 10, w: S => .8 + S.traits.bold, tree: { body: 'living' },
    c: (S, X) => slot(S) && noArc(S, 'favor') && X.power(S) > .6 && (S.flags.rescueN || 0) < 2,   // tối đa hai lần một đời
    run(S, X) {
      const type = X.pick(['merchant', 'merchant', 'noble', 'outlaw']), z = X.reg(S).zones[0], sp = X.monsterIn(z); cnt(S, 'rescueN');
      const p = G.castAdd(S, X, { race: X.chance(.7) ? (S.undead ? 'human' : S.race) : X.wkey(X.reg(S).races), role: 'on', how: { merchant: 'thương nhân bạn kéo khỏi xe lật', noble: 'người bạn cứu khỏi bầy quái năm nào', outlaw: 'người mang dao bạn cõng ra khỏi rừng' }[type],
        yrs: X.years(S) + X.int(-8, 12), work: { merchant: 'merchant', noble: 'steward', outlaw: 'thief' }[type], tier: type === 'outlaw' ? 1 : 0, bond: 50, drive: .6 + .4 * X.rnd() });
      G.arcOpen(S, X, 'favor', p, { type });
      return { t: { merchant: `Dưới khe núi có một chiếc xe hàng lật nghiêng, một bánh còn quay chầm chậm. Bạn trèo xuống, dỡ từng bao hàng, kéo được người bị đè bên dưới ra. Người ấy tên ${first(p)}, làm ăn ở ${capName(S)}, mặt cắt không còn giọt máu mà miệng vẫn hỏi hàng có ướt không. Lúc chia tay, ${first(p)} viết địa chỉ vào một mảnh giấy, ấn vào tay bạn, bắt hứa có dịp thì ghé.`,
        noble: `Trong ${z.nameVi}, một bầy ${sp.nameVi} đang vây một người ăn mặc sang trọng, vạt áo gấm rách toạc. Bạn xông vào đuổi chúng đi, xong việc tay vẫn còn run. Người ấy tên ${first(p)}, lạc đường từ hôm trước, giày đã mòn tới gót. ${first(p)} hỏi tên bạn tới hai lần, như sợ quên mất.`,
        outlaw: `Ven rừng có một người nằm gục bên gốc cây, máu thấm đen cả vạt áo. Bạn cõng người ấy ra tới bìa rừng, không hỏi vì sao hai bên hông lại giắt hai con dao. Lúc tỉnh, người ấy chỉ nói mình tên là ${first(p)}. Rồi nhìn bạn rất lâu, cái nhìn của người không quen mắc nợ ai.` }[type], k: 'good' };
    } });
  opener({ id: 'st_witness', st: ['adult', 'elder'], rep: true, gap: 15, w: 1, tree: { body: 'living', soc: 1 },
    c: S => slot(S) && noArc(S, 'secret') && (S.flags.secretN || 0) < 2,
    run(S, X) {
      const type = X.pick(['tax', 'dark', 'gate']); cnt(S, 'secretN');
      const p = G.castAdd(S, X, { role: 'bimat', how: { tax: 'người thu thuế bạn bắt gặp đêm ấy', dark: 'tu sĩ bạn bắt gặp đêm ấy', gate: 'đội trưởng lính tuần bạn bắt gặp đêm ấy' }[type],
        yrs: X.years(S) + X.int(0, 15), work: { tax: 'steward', dark: 'priest', gate: 'guard' }[type], tier: X.int(1, 2), bond: -5, drive: .7 });
      G.arcOpen(S, X, 'secret', p, { type });
      return { t: { tax: `Đêm ấy bạn về muộn, đi tắt qua sau dãy nhà kho. Dưới ánh đuốc leo lét, ${first(p)}, người thu thuế của vùng, đang chất từng bao tiền thuế lên chiếc xe của nhà mình. Bạn nép sau đống rơm, nín thở tới khi tiếng bánh xe xa hẳn. Sáng ra mọi thứ vẫn yên như thường, chỉ có bạn là biết.`,
        dark: `Sau buổi lễ tối, bạn quay lại đền tìm món đồ bỏ quên. Ở góc sân, ${first(p)}, tu sĩ của đền làng, đang dúi một bọc vải đen vào tay một kẻ trùm mũ kín mặt. Trên vạt áo kẻ ấy thêu dấu của Hắc Giáo. Bạn lùi ra, tim đập thình thịch, không biết ${first(p)} có kịp nhìn thấy mình hay không.`,
        gate: `Nửa đêm, bạn trở dậy vì tiếng bánh xe nghiến trên đường đá. Ngoài cổng, ${first(p)}, đội trưởng lính tuần, tự tay kéo then cho một đoàn xe không đèn lặng lẽ đi qua. Không ai hô hỏi, không ai ghi sổ. Lúc cổng khép lại, ${first(p)} đảo mắt nhìn quanh một vòng, và bạn vội rụt đầu khỏi khe cửa.` }[type], k: 'info' };
    } });
  opener({ id: 'st_kin', st: ['adult', 'elder'], rep: true, gap: 8, w: 1, tree: { body: 'living' },
    c: S => slot(S) && noArc(S, 'kin') && S.family.sibs.some((s, i) => s.alive && !(S.flags.kinAsked || []).includes(i)),
    run(S, X) {
      const i = S.family.sibs.findIndex((s, i) => s.alive && !(S.flags.kinAsked || []).includes(i)), s = S.family.sibs[i], type = X.pick(['debt', 'sick', 'levy']);
      (S.flags.kinAsked = S.flags.kinAsked || []).push(i);   // mỗi anh chị một lần gặp nạn
      let p = (S.cast || []).find(x => x.sib === i);
      if (!p) p = G.castAdd(S, X, { name: s.name, role: 'ho', how: `${s.sex === 'm' ? 'anh' : 'chị'} ruột của bạn`, sex: s.sex, yrs: s.age, bond: 30, sib: i });
      G.arcOpen(S, X, 'kin', p, { type });
      const ac = s.sex === 'm' ? 'anh' : 'chị';
      return { t: { debt: `Thư nhà tới, nét chữ run run của người viết thuê. ${s.name} nợ thuế hai năm liền, người ta đã tới đo đất, sắp xiết cả căn nhà. Cuối thư chỉ có một dòng: liệu được thì giúp ${ac} một tay. Bạn gấp lá thư làm tư, cất vào ngực áo, cả đêm trằn trọc.`,
        sick: `Thư nhà tới vào một chiều mưa. ${s.name} ốm nặng, nằm liệt đã mấy tuần, thầy lang trong làng chỉ lắc đầu. Người viết không xin gì, chỉ kể. Nhưng bạn đọc ra được chỗ ngập ngừng giữa hai dòng chữ.`,
        levy: `Thư nhà, mép giấy nhòe nước. Con trai cả của ${s.name} bị bắt đi lính, cả nhà chạy vạy khắp nơi mà không đủ tiền chuộc. Đọc tới đó bạn dừng lại, nhìn ra cửa rất lâu, nhớ cái thuở ${ac} em còn chung một mái nhà.` }[type], k: 'bad' };
    } });
  opener({ id: 'st_parent_lost', st: ['child', 'teen'], w: S => .3 + G.REGION[S.loc].danger * 1.5, tree: { body: 'flesh' },
    c: S => slot(S) && noArc(S, 'vengeance') && S.family.parents.some(p => p.alive && p.role === 'cha'),
    run(S, X) {
      const z = X.reg(S).zones[0], sp = X.monsterIn(z), f = S.family.parents.find(p => p.alive && p.role === 'cha');
      f.alive = false; X.add('h', -15);
      G.arcOpen(S, X, 'vengeance', null, { sp: sp.id, kin: 'cha', zone: z.id });
      return { t: `Một sáng sương còn dày, cha xách giáo vào ${z.nameVi} săn thú, dặn bạn ở nhà trông bếp lửa. Tối ấy cha không về, hôm sau cũng không. Người ta đi tìm, chỉ mang về được cây giáo gãy làm đôi, kể rằng quanh đó toàn dấu chân ${sp.nameVi}. Bạn giữ lại khúc cán giáo, đêm nào cũng đặt nó cạnh gối.`, k: 'bad', f: X.factOf(sp) };
    } });

  // ═════════ 5. Nút của các mạch: ở js/arcs.js (khuôn full() của js/saga.js). Ở đây chỉ còn móc cho Bộ Xương ═════════
  // ── Bộ Xương: đứa bé tặng hoa lớn lên (sk_child, events.js) ──
  patch('sk_child', (S, X, r) => {
    if ((S.arcs || []).some(a => a.k === 'flower')) return;
    const p = G.castAdd(S, X, { race: X.chance(.8) ? 'human' : X.wkey(X.reg(S).races), role: 'ban', how: 'đứa bé từng đặt hoa vào hốc mắt bạn', yrs: X.int(5, 8), bond: 30, drive: X.rnd() });
    const t0 = r.t; r.t = r.t.replace('Một đứa bé không sợ bạn.', `Một đứa bé không sợ bạn. Người ta gọi nó là ${first(p)}.`);
    r.t += r.t !== t0 ? ' Bạn đứng yên rất lâu, không dám cử động, sợ bông hoa rơi mất.' : ` Sau này bạn mới biết người ta gọi đứa bé ấy là ${first(p)}.`;
    G.arcOpen(S, X, 'flower', p, {});
  });
  // ── Bộ Xương: đoàn lữ khách hay bỏ chạy (sk_flee) dần quen mặt bạn; lần thứ ba thì thành mối buôn ──
  patch('sk_flee', (S, X, r) => {
    let p = (S.cast || []).find(x => x.caravan);
    if (!p) { if (!X.chance(.5)) return; p = G.castAdd(S, X, { race: 'human', role: 'on', how: 'chủ đoàn lữ khách hay đi qua nghĩa địa', yrs: X.int(30, 45), work: 'merchant', bond: 0, drive: .5 }); p.caravan = 1;
      r.t = `Một đoàn lữ khách vừa thấy bạn đã bỏ chạy tán loạn, để lại cả nồi cháo đang sôi bên đống lửa. Người chạy sau cùng là chủ đoàn, ${first(p)}, vừa chạy vừa ngoái lại, như còn tiếc nồi cháo. Bạn ngồi xuống bên đống lửa của họ, nhìn cháo trào qua vành nồi. Ăn thì không ăn được, mà bỏ đi cũng không nỡ.`; lk(S, X, p, 5); return; }
    p.caravan++; lk(S, X, p, 10);
    if (p.caravan === 2) { r.t = `Lại là đoàn xe của ${first(p)}. Lần này không ai bỏ chạy: họ chỉ dạt sang mép đường, đi thật chậm qua, ngựa thở phì phò. Tới khúc quanh, ${first(p)} quay đầu nhìn bạn, gật nhẹ một cái. Cái gật đầu ấy bạn nghĩ tới mấy đêm liền.`; r.k = 'info'; X.add('h', 6); return; }
    r.t = `Lần này ${first(p)} cho dừng xe ở chân đồi, tự tay đặt xuống một thùng dầu và hai tấm vải, rồi lùi lại mấy bước mà chờ. Bạn bước ra, đặt xuống mấy món đồ cổ nhặt trong mộ. Không ai nói câu nào, vậy mà cả hai đều hiểu. Từ đó mỗi mùa đoàn ${first(p)} đều ghé.`;
    r.k = 'good'; X.add('h', 10); X.money(X.int(5, 15)); if (p.caravan > 3) r.t = p.caravan % 2
      ? `Đoàn của ${first(p)} lại ghé như mọi mùa, bánh xe in vết quen trên con đường đất. Đổi hàng xong, ${first(p)} ngồi lại trên càng xe, kể chuyện dưới xuôi: giá muối, đám cưới nhà ai, trận lụt năm ngoái. Bạn không đáp được mấy, chỉ ngồi nghe.`
      : `Mùa này đoàn ${first(p)} tới muộn, xe chở nặng hơn mọi năm. Đổi hàng xong, ${first(p)} còn nán lại kể cho bạn nghe chuyện dưới xuôi, tới khi trời sập tối mới chịu lên đường.`;
  });

  // ═════════ 6. Gặp lại người quen (sự kiện ngẫu nhiên đọc dàn nhân vật) ═════════
  const knows = (S, p) => Math.abs(p.bond) >= 10 || (S.arcs || []).some(a => a.who === p.id);
  const withNews = S => (S.cast || []).filter(p => p.news.length && !p.missing && knows(S, p) && S.age - p.seen >= 1 && p.role !== 'phoi');
  const visitors = S => (S.cast || []).filter(p => p.alive && !p.missing && p.bond >= 25 && p.loc === S.loc && S.age - p.seen >= 2 && p.role !== 'phoi');
  const foes = S => (S.cast || []).filter(p => p.alive && !p.missing && p.bond <= -30 && p.loc === S.loc && S.age - p.seen >= 2);
  // Câu gợi lại chuyện cũ khi có tin về người quen: chọn theo vai, độ thân, tin mới nhất và S.age (không rút xúc xắc).
  const MEMO = {
    ban: ['Bạn nhớ những ngày hai người còn chia nhau từng miếng ăn, đi đâu cũng có nhau.', 'Đã lâu lắm rồi hai người chưa ngồi với nhau một bữa cho ra bữa.'],
    doi: ['Bạn bảo mình chẳng quan tâm, mà vẫn nghe không sót chữ nào.', 'Bạn nhận ra mình vẫn còn ngấm ngầm đếm xem ai hơn ai.'],
    thu: ['Chuyện cũ giữa hai người, bạn chưa quên ngày nào.', 'Nghe tới cái tên ấy, tay bạn vẫn bất giác siết lại.'],
    an: ['Cái ơn ngày trước bạn vẫn còn nợ, chưa biết lấy gì mà trả.', 'Bạn nghe xong, lẩm nhẩm tính xem bao giờ mới có dịp tới thăm.'],
    on: ['Chắc người ấy vẫn còn nhớ cái hôm được bạn cứu.', 'Bạn mỉm cười. Người hôm ấy suýt chết giờ đã sống thêm được ngần ấy năm.'],
    thay: ['Bạn nhớ giọng thầy lúc mắng, và cả những lần khen, hiếm hơn nhiều.', 'Những gì thầy dạy, bạn vẫn còn giữ, chỉ là chưa dùng hết.'],
    tro: ['Bạn nhớ cái dáng lóng ngóng của nó ngày đầu mới tới học.', 'Bạn nghe xong, lặng lẽ gật đầu, như thầy nghe trò trả bài.'],
    tinh: ['Bạn ngồi im một lúc lâu, nhớ về một mùa hè đã xa.', 'Bạn nghe, gật đầu, rồi kiếm việc gì đó cho tay khỏi rỗi.'],
    no: ['Bạn sờ lên túi tiền theo thói quen, dù chẳng có ai đòi.', 'Bạn chỉ mong cái tên ấy đừng tìm tới cửa nhà mình lần nữa.'],
    bimat: ['Bạn nhớ cái đêm năm ấy, và những gì mình đã thấy.', 'Có những chuyện chỉ hai người biết. Bạn vẫn chưa kể với ai.'],
    than: ['Bạn nhớ hồi nhỏ từng theo sau người ấy suốt ba ngày, mắt không rời.', 'Người bạn từng ngước nhìn ngày bé vẫn đang đi tiếp con đường của mình.'],
    ho: ['Bạn nhớ những bữa cơm chung mâm hồi nhỏ, tiếng giành nhau miếng cháy dưới đáy nồi.', 'Bạn chợt thèm một bữa cơm nhà, đủ mặt anh chị em như ngày bé.'] };
  const memo = (S, p, last) => {
    const i = S.age % 2;
    if (!p.alive) return p.bond > 0 ? ['Bạn cố nhớ lần cuối hai người gặp nhau là khi nào, mà nhớ không ra.', 'Tối ấy bạn rót thêm một chén rượu, để ở đầu bàn.'][i]
      : ['Bạn những tưởng sẽ thấy hả dạ. Hóa ra chỉ thấy một chuyện cũ vừa khép lại, không ai kịp nói câu sau cùng.', 'Bạn nghe xong, không nói gì. Chuyện cũ giữa hai người giờ chẳng còn ai để tính.'][i];
    if (last === 'đã lập gia đình' && p.role === 'tinh') return MEMO.tinh[1];
    if (last === 'đã lập gia đình' && p.role === 'ban' && p.bond > 0) return 'Bạn tiếc vì hôm ấy không có mặt để nâng một chén mừng.';
    if (/^đã thành /.test(last) && p.role === 'doi') return MEMO.doi[1];
    const m = MEMO[p.role];
    return m ? m[i] : p.bond >= 0 ? 'Bạn nghe xong, ngồi nhớ lại lần gặp trước.' : 'Bạn nghe xong, chỉ hừ một tiếng.';
  };
  opener({ id: 'cm_news', st: ['teen', 'adult', 'elder'], w: S => (withNews(S).length ? 3 : 0), rep: true, gap: 1, tree: { body: 'living' },
    run(S, X) {
      const p = X.pick(withNews(S)), dead = !p.alive, L = newsL(p), nw = nwSay(L);
      p.heard = S.age; X._lk = true; X._tag = 'Người quen · ' + first(p);
      if (dead) X.add('h', p.bond > 0 ? -4 : 1); else X.add('h', p.bond > 0 ? 2 : -1);
      const src = [`Một người buôn đi ngang qua có mang theo tin về ${refE(S, p)}.`, `Ở chợ, giữa tiếng rao, bạn nghe người ta nhắc tới ${refE(S, p)}.`, `Thư từ phương xa gửi về, trong đó có mấy dòng về ${refE(S, p)}.`][S.age % 3];
      return { t: `${src} ${dead ? `${first(p)} đã mất.` : `Nghe nói ${first(p)} ${nw}.`} ${memo(S, p, L[L.length - 1])}`, k: dead ? 'bad' : 'info' };
    } });
  // Chuyện hai người nói với nhau khi người quen ghé chơi, theo vai.
  const VISIT = { ban: () => 'Hai người nhắc lại chuyện cũ, chuyện nào cũng đã kể cả chục lần mà vẫn cười như lần đầu.', an: N => `Bạn lại nhắc tới cái ơn năm xưa, và lần nào ${N} cũng xua tay bảo thôi.`,
    on: N => `${N} lại nhắc tới cái hôm được bạn cứu, dù bạn đã bảo đừng nhắc nữa.`, thay: () => 'Thầy hỏi dạo này bạn còn tập đều không. Bạn gật đầu, mà không dám nhìn thẳng.',
    tro: N => `${N} hỏi bạn đủ thứ chuyện, y như hồi mới tới học.`, tinh: () => 'Có những chuyện cả hai đều nhớ, mà không ai nhắc tới.',
    ho: () => 'Hai người nói chuyện nhà, chuyện cha mẹ, chuyện mái bếp cũ giờ không biết đã dột chưa.', doi: () => 'Nhắc lại những lần ganh nhau ngày trước, giờ cả hai đều bật cười.',
    thu: () => 'Chuyện cũ giữa hai người, không ai nhắc lại. Thế cũng tốt.', no: () => 'Suốt buổi không ai nhắc tới chuyện tiền nong.', bimat: () => 'Cái đêm năm ấy, không ai nhắc lại một lời.',
    than: () => 'Bạn hỏi về những vùng đất người ấy đã đi qua, nghe say tới quên cả rót nước.' };
  opener({ id: 'cm_visit', st: ['adult', 'elder'], w: S => (visitors(S).length ? 2.5 : 0), rep: true, gap: 2, tree: { body: 'living' },
    run(S, X) {
      const p = X.pick(visitors(S)), nw = newsOf(p); touch(S, X, p, 5); X._tag = 'Người quen · ' + first(p); X.add('so', 4); X.add('h', 4);
      const gift = X.pick(['một vò rượu nếp', 'xâu cá vừa câu còn giãy', 'một bọc bánh gói lá', 'cả bụng chuyện dưới xuôi']), v = VISIT[p.role];
      return { t: [`${ref(S, p)} ghé chơi, mang theo ${gift}.`, nw ? `Ngồi được một lúc, ${first(p)} mới kể mình ${nw}.` : '',
        v ? v(first(p)) : 'Hai người nói đủ thứ chuyện không đầu không cuối.', S.age % 2 ? 'Hai người ngồi tới khi đèn cạn dầu mới chịu đứng dậy.' : 'Lúc tiễn ra cổng, trời đã gần sáng.'].filter(Boolean).join(' '), k: 'good' };
    } });
  opener({ id: 'cm_glare', st: ['adult', 'elder'], w: S => (foes(S).length ? 1.5 : 0), rep: true, gap: 2, tree: { body: 'living' },
    run(S, X) {
      const p = X.pick(foes(S)); touch(S, X, p, -3); X._tag = 'Người quen · ' + first(p); X.add('h', -2);
      if (p.tier >= 1 && X.chance(.5)) { const g = Math.round(Math.min(Math.max(0, S.gold) * .1, med(S, X) * .4)); X.money(-g); return { t: `${ref(S, p)} tung tin bạn ăn gian cân. Chỉ mấy hôm cả chợ đã xì xào, khách quen đi qua cửa nhà bạn mà không ngoảnh vào. Bạn biết rõ tin ấy từ đâu ra, mà chẳng có cách gì chứng minh. Cả mùa ấy bạn mất ${G.coin(g)}.`, k: 'bad' }; }
      return { t: S.age % 2 ? `Giữa chợ đông, bạn chạm mặt ${refE(S, p)}. Hai người đứng chắn lối nhau một lúc lâu, người đi chợ phải lách sang hai bên. Không ai nhường ai. Lúc quay đi, bạn còn nghe sau lưng một tiếng cười khẩy.`
        : `Ở quán nước đầu đường, ${ref(S, p)} ngồi ngay bàn bên cạnh. Suốt buổi không ai nói với ai câu nào, chỉ có tiếng chén đặt xuống mạnh hơn cần thiết. Bạn trả tiền rồi đi trước, lưng thẳng như cây sào.`, k: 'info' };
    } });
  // Người quen tốt tới giúp lúc bạn khốn khó (ốm nặng, hết tiền).
  const helpers = S => (S.cast || []).filter(p => p.alive && !p.missing && p.bond >= 30 && p.role !== 'phoi' && S.age - p.seen >= 1);
  opener({ id: 'cm_help', st: ['teen', 'adult', 'elder'], w: (S, X) => (helpers(S).length && (S.hl < 45 || S.gold < 0 || S.h < 30) ? 4 : 0), rep: true, gap: 3, tree: { body: 'living' },
    run(S, X) {
      const p = X.pick(helpers(S)); touch(S, X, p, 8); X._tag = 'Người quen · ' + first(p);
      if (S.gold < 0) { const g = Math.round(med(S, X) * .5); X.money(g); return { t: `Tin bạn túng quẫn chẳng biết đi đường nào mà tới tai ${refE(S, p)}. Mấy hôm sau có người gõ cửa, đưa tận tay bạn ${G.coin(g)}, kèm một mẩu giấy viết vội: khi nào có hẵng trả. Nét chữ nguệch ngoạc, vậy mà bạn đọc đi đọc lại tới mấy lần.`, k: 'good' }; }
      if (S.hl < 45) { X.add('hl', 8); return { t: `${ref(S, p)} nghe tin bạn ốm, vượt mấy ngày đường mang thuốc tới, giày bám đầy bụi. Người ấy sắc thuốc, ép bạn uống từng bát đắng ngắt, đêm thì ngủ gục ngay bên giường. Mấy hôm sau cơn sốt lui dần. ${first(p)} chỉ cười, bảo bạn trả ơn bằng cách sống cho lâu.`, k: 'good' }; }
      X.add('h', 8); return { t: `${ref(S, p)} tới, ở lại với bạn mấy hôm. Người ấy không hỏi han gì, chỉ lặng lẽ quét nhà, nấu cơm, tối thì ngồi cùng bạn ở bậc cửa nhìn ra ngõ. Bạn không ngờ mình cần đúng chừng ấy. Hôm ${first(p)} đi, bạn tiễn ra tận đầu đường.`, k: 'good' };
    } });

  // Sự kiện thường gặp có người quen xuất hiện (khi trong dàn có người hợp): đời liền mạch hơn, sự kiện vẫn bốc như cũ.
  const pal = (S, X, f) => { const L = (S.cast || []).filter(p => p.alive && !p.missing && p.role !== 'phoi' && f(p)); return L.length ? X.pick(L) : null; };
  const lk = (S, X, p, d) => { touch(S, X, p, d); X._tag = 'Người quen · ' + first(p); };
  patch('ch_festival', (S, X, r) => {
    const p = X.chance(.6) && pal(S, X, p => (p.role === 'ban' || p.role === 'tinh') && p.bond >= 20 && p.loc === S.loc); if (!p) return;
    const t0 = r.t; r.t = r.t.replace('Bạn nhảy tới khi', p.role === 'tinh' ? `Bạn nắm tay ${first(p)} nhảy tới khi` : `Bạn nhảy với ${first(p)} tới khi`);
    r.t += r.t === t0 ? ` ${first(p)} cũng có mặt, kéo bạn vào vòng nhảy, không cho đứng ngoài.` : p.role === 'tinh' ? ' Trên đường về, hai người đi chậm hơn hẳn mọi khi.' : ` Lúc tan hội, ${first(p)} còn đứng ở đầu ngõ vẫy tay mãi.`; lk(S, X, p, 5);
  });
  patch('ch_hunger', (S, X, r) => {
    const p = X.chance(.6) && pal(S, X, p => p.bond >= 20 && p.loc === S.loc); if (!p) return;
    r.t += ` Một tối, ${first(p)} sang gõ cửa, để lại nửa bao lúa rồi đi ngay, không đợi ai kịp cảm ơn.`; X.add('hl', 4); lk(S, X, p, 8);
  });
  patch('el_aches', (S, X, r) => {
    const p = X.chance(.5) && pal(S, X, p => p.bond >= 20); if (!p) return;
    r.t += ` ${first(p)} ghé thăm, mang theo một chai rượu thuốc ngâm đã ngả màu, tự tay xoa lên lưng cho bạn. Hai người ngồi bên hiên kể chuyện ngày xưa tới khi trời sập tối, có chuyện bạn tưởng mình đã quên từ lâu.`; X.add('h', 4); lk(S, X, p, 4);
  });
  patch('ad_restless', (S, X, r) => {
    const p = X.chance(.6) && pal(S, X, p => p.bond >= 20 && p.loc !== S.loc); if (!p) return;
    r.t += ` Trên bàn, lá thư ${first(p)} gửi từ ${regName(p.loc)} nằm đó đã mấy tháng, góc giấy quăn lại vì bị mở ra đọc quá nhiều lần. Trong thư, ${first(p)} kể về những con đường bên ấy.`; lk(S, X, p, 2);
  });
  patch('ad_bounty_post', (S, X, r) => {
    const p = X.chance(.5) && pal(S, X, p => p.bond >= 20 && FIGHTER[p.work] && p.loc === S.loc); if (!p) return;
    r.t += ` ${first(p)} đứng cạnh bạn từ lúc nào không hay, gõ gõ ngón tay lên tờ lệnh rồi quay sang nhìn bạn, nhướng mày. Câu hỏi ấy chẳng cần nói ra.`; lk(S, X, p, 3);
  });
  patch('ch_raid', (S, X, r) => {
    if (r.t.includes('không chạy kịp')) return;
    const p = X.chance(.5) && pal(S, X, p => p.bond >= 20 && p.loc === S.loc); if (!p) return;
    r.t = r.t.replace('Cả nhà trốn trong hầm rượu tới sáng.', `${first(p)} chạy sang đập cửa, kéo cả nhà bạn xuống hầm rượu nhà mình, ở tới sáng.`); lk(S, X, p, 6);
  });
  patch('ad_tax', (S, X, r) => {
    const p = pal(S, X, p => p.work === 'steward' && p.tier >= 1 && Math.abs(p.bond) >= 20 && p.loc === S.loc); if (!p) return;
    const g = Math.round(med(S, X) * .2);
    if (p.bond > 0) { X.money(g); r.t += ` Người cầm sổ năm nay là ${first(p)}. Tới tên nhà bạn, ngòi bút dừng lại một chút rồi gạch bớt một dòng. ${first(p)} không ngẩng lên, cũng không nói gì.`; }
    else { X.money(-g); r.t += ` Người cầm sổ năm nay là ${first(p)}. Phần nhà bạn, chẳng hiểu sao, nặng hơn nhà bên cạnh ${G.coin(g)}. Lúc bạn đặt tiền xuống, ${first(p)} đếm thật chậm, như muốn cả hàng người phía sau đều nhìn thấy.`; }
    lk(S, X, p, 0);
  });

  // ═════════ 7. Chương đời ═════════
  G.PHASE_VI = { teen: 'Thiếu thời', adult1: 'Lập thân', adult2: 'Trung niên', elder: 'Xế chiều', sk1: 'Thức giấc', sk2: 'Giữa hai cõi', skE: 'Lửa hồn lụi dần' };
  G.phaseOf = (S, X) => {
    const st = X.stage(S);
    if (S.undead) return st === 'elder' ? 'skE' : S.age < 3 ? 'sk1' : 'sk2';
    if (st === 'teen' || st === 'elder') return st;
    if (st !== 'adult') return null;
    const R = X.R(S), e = X.lt(S).leT * .78 * R.ypt;
    return X.years(S) < R.adult + (e - R.adult) * .4 ? 'adult1' : 'adult2';
  };
  const mainArc = S => (S.arcs || []).find(a => a.main);
  const hasRole = S => { const R = S.roles || {}; return !!(R.noble || R.office != null || R.ruler != null || R.head != null); };
  const LIVE = ['teen', 'adult1', 'adult2'];
  G.CHAPTERS = [
    { id: 'path', ph: ['teen'], q: () => 'Tìm đường cho mình', w: () => 2, ok: S => !!(S.work || S.mentor || G.eduLv(S) || (S.aim && S.aim !== 'free')) },
    { id: 'poor', ph: LIVE, q: () => 'Thoát nghèo', w: (S, X) => (S.q <= 2 ? 3 : 0) + (S.gold < med(S, X) ? 1 : 0), ok: (S, X, c) => S.q > c.q0 || S.gold >= 3 * med(S, X), dir: { thuong: 1, nghe: 1 } },
    { id: 'tier', ph: LIVE, q: (S, X) => `Bước lên ${G.tierName(X.ctier(S) + 1)}`, w: (S, X) => (X.ctier(S) < 4 ? 1 + 4 * (sh(S, 'vo') + sh(S, 'phap')) + (S.aim === 'martial' ? 2 : 0) : 0), ok: (S, X, c) => X.ctier(S) > c.tier0, dir: { vo: 1, phap: 1 } },
    { id: 'place', ph: ['adult1', 'adult2'], q: () => 'Có tiếng nói giữa người đời', w: (S, X) => (G.standing(S, X).soc <= 1 ? 1.5 : 0), ok: (S, X, c) => G.standing(S, X).soc > c.soc0, dir: { quyen: 1 } },
    { id: 'home', ph: ['adult1', 'adult2'], q: () => 'Dựng một mái nhà', w: S => (flesh(S) && single(S) ? 1.5 + 4 * sh(S, 'gia') + S.traits.social : 0), ok: S => !single(S), dir: { gia: 1 } },
    { id: 'learn', ph: LIVE, q: () => 'Học cho tới nơi', w: S => 4 * sh(S, 'tri') + S.traits.studious, ok: (S, X, c) => S.sm >= Math.min(95, c.sm0 + 15) || G.eduLv(S) > c.edu0, dir: { tri: 1 } },
    { id: 'faith', ph: [...LIVE, 'elder'], q: () => 'Tìm đạo', w: S => (S.faith ? 4 * sh(S, 'dao') + S.traits.pious : 0), ok: S => S.devotion >= 60, dir: { dao: 1 } },
    { id: 'power', ph: ['adult1', 'adult2'], q: () => 'Ngồi vào ghế quyền', w: (S, X) => (G.standing(S, X).soc >= 2 && !hasRole(S) ? 1 + 5 * sh(S, 'quyen') : 0), ok: hasRole, dir: { quyen: 1 } },
    { id: 'road', ph: LIVE, q: () => 'Đi cho biết đó biết đây', w: S => 4 * sh(S, 'du') + S.traits.bold * .8, ok: (S, X, c) => (S.flags.trips || 0) + (S.flags.voyages || 0) >= c.trips0 + 2 || S.loc !== c.loc0, dir: { du: 1 } },
    { id: 'rich', ph: ['adult1', 'adult2'], q: () => 'Làm giàu', w: S => 4 * sh(S, 'thuong'), ok: (S, X) => S.gold >= 8 * med(S, X), dir: { thuong: 1 } },
    { id: 'arc', ph: [...LIVE, 'elder', 'sk2', 'skE'], arc: true, w: S => { const a = mainArc(S); return a && G.ARCS[a.k].quest ? 5 : 0; },
      q: (S, X, c) => { const D = G.ARCS[c.arc.k]; return D.quest(G.castGet(S, c.arc.who) || { name: '?' }, c.arc); },
      ok: (S, X, c) => (S.arcDone || []).some(d => d.k === c.arc.k && d.who === c.arc.who && G.ARCS[d.k].good.includes(d.o)) },
    { id: 'legacy', ph: ['elder'], q: () => 'Để lại gì cho đời', w: () => 2, ok: S => (S.disciples || []).length > 0 || S.family.kids.some(k => k.alive) || !!(S.tree && S.tree.el_memoir), dir: { tri: .5, gia: .5 } },
    { id: 'close', ph: ['elder', 'skE'], q: () => 'Khép lại chuyện cũ', w: S => ((S.arcs || []).filter(isOpen).length ? 3 : 0), ok: (S, X, c) => !(S.arcs || []).some(a => c.open0.includes(a.k + ':' + a.who)) },
    { id: 'calm', ph: ['elder'], q: () => 'Sống cho yên những năm còn lại', w: () => 1, ok: S => S.h >= 55 },
    { id: 'sk_who', ph: ['sk1', 'sk2'], q: () => 'Nhớ lại mình là ai', w: S => (S.flags.pastName && !(S.tree && S.tree.sk_grave) ? 3 : 0), ok: S => !!(S.tree && (S.tree.sk_memory || S.tree.sk_grave)) },
    { id: 'sk_hide', ph: ['sk1'], q: () => 'Sống sót giữa người sống', w: () => 2, ok: S => !S.dead },
    { id: 'sk_place', ph: ['sk2', 'skE'], q: () => 'Có một chỗ đứng giữa người sống', w: S => 1 + (G.lawHere(S, 'undead_citizen') ? 3 : 0), ok: (S, X) => G.standing(S, X).soc >= 1 || !!(S.flags.acolyte && S.flags.acolyte.loyal) },
    { id: 'sk_fade', ph: ['skE'], q: () => 'Giữ lửa hồn', w: () => 2, ok: S => S.hl >= 40 }
  ];
  const CH = Object.fromEntries(G.CHAPTERS.map(c => [c.id, c]));
  const arcEndsIn = (S, c) => (S.arcDone || []).filter(d => d.t >= c.t0 && d.o !== 'faded');
  const sumOf = (S, d) => { const D = G.ARCS[d.k], p = G.castGet(S, d.who) || { name: d.name || '?' }; return D.sum ? D.sum(d.o, p, d) : null; };
  function chapClose(S, X, dead) {
    const c = S.chap; if (!c) return;
    S.chap = null;
    const C = CH[c.id], ok = !!C.ok(S, X, c), y1 = X.years(S);
    (S.chapDone || (S.chapDone = [])).push({ id: c.id, ph: c.ph, q: c.q, ok, y0: c.y0, y1 });
    stat('chap', c.id + (ok ? ':ok' : ':no'));
    const ends = arcEndsIn(S, c).map(d => sumOf(S, d)).filter(Boolean);
    const span = c.y0 === y1 ? `${y1} ${yu(S)}` : `${c.y0}–${y1} ${yu(S)}`;
    const res = ok ? 'đã làm được' : dead ? 'còn dang dở' : 'chưa làm được';
    const tail = ok ? ['Ngoảnh lại mới thấy quãng đường ấy dài hơn mình tưởng.', 'Có lúc tưởng không qua nổi, vậy mà rồi cũng qua.'][S.age % 2]
      : dead ? 'Việc ấy đành để lại cho người ở lại.' : ['Có những việc một quãng đời không làm cho xong. Bạn mang nó theo sang quãng sau.', 'Bạn chưa buông, chỉ là quãng đời này đã hết phần.'][S.age % 2];
    X._tag = null;
    X.log(`Khép chương ${G.PHASE_VI[c.ph].toLowerCase()} (${span}). ${c.q}: ${res}. ${tail}${ends.length ? ` Những chuyện đã khép lại trong quãng ấy: ${ends.join('; ')}.` : ''}`, 'chapter');
  }
  // Câu mở đầu mỗi quãng đời, in sau tên chương.
  const PH_OPEN = { teen: 'Tuổi thơ khép lại lúc nào không hay.', adult1: 'Tới lúc phải tự đứng bằng đôi chân của mình.', adult2: 'Những năm hăm hở đã lùi lại phía sau.',
    elder: 'Bước chân chậm lại, những buổi chiều dài ra.', sk1: 'Trong hốc mắt rỗng, một đốm lửa hồn vừa bén.', sk2: 'Không còn hẳn là người chết, cũng chẳng bao giờ là người sống nữa.', skE: 'Lửa hồn bắt đầu leo lét, mỗi mùa một yếu hơn.' };
  function chapOpen(S, X, ph) {
    const cand = G.CHAPTERS.filter(c => c.ph.includes(ph)).map(c => ({ c, w: Math.max(0, c.w(S, X)) })).filter(x => x.w > 0);
    if (!cand.length) return;
    const C = X.wpick(cand, 'w').c, a = mainArc(S);
    const c = { id: C.id, ph, t0: S.age, y0: X.years(S), q0: S.q, tier0: X.ctier(S), soc0: G.standing(S, X).soc, sm0: S.sm, edu0: G.eduLv(S),
      trips0: (S.flags.trips || 0) + (S.flags.voyages || 0), loc0: S.loc, open0: (S.arcs || []).filter(isOpen).map(a => a.k + ':' + a.who),
      arc: C.arc && a ? { k: a.k, who: a.who, d: a.d } : null };
    c.q = C.q(S, X, c);
    S.chap = c;
    X.log(`Chương ${G.PHASE_VI[ph].toLowerCase()}: ${c.q}. ${PH_OPEN[ph] || ''}`.trim(), 'chapter');
  }
  G.chapText = S => (S.chap ? `${G.PHASE_VI[S.chap.ph]} · ${S.chap.q}` : '');

  // ═════════ 8. Hệ con, bọc chung, lúc chết ═════════
  G.storyYear = function (S, X) {
    // Mạch phai: quá khoảng chờ dài nhất của bước hiện tại mà không nút nào xảy ra.
    for (const a of [...(S.arcs || [])]) {
      const mx = MAXW[a.k + ':' + a.at]; if (mx == null) continue;
      if (S.age - a.t > mx + G.STORY.late) { const D = G.ARCS[a.k]; if (D.fade) D.fade(S, X, G.castGet(S, a.who)); stat('fade', a.k + ':' + a.at); G.arcEnd(S, X, a, 'faded'); }
    }
    const ph = G.phaseOf(S, X);
    if (S.chap && S.chap.ph !== ph) chapClose(S, X, false);
    if (!S.chap && ph) chapOpen(S, X, ph);
  };
  G.SYSTEMS.push({ id: 'cast', when: S => !S.dead, run: (S, X) => G.castYear(S, X) });
  G.SYSTEMS.push({ id: 'story', when: S => !S.dead, run: (S, X) => G.storyYear(S, X) });

  // Nút mới đi qua cổng chung của cây sự kiện (thân thể, danh phận, lượt đầu của Bộ Xương…).
  for (const e of NEW_EV) G.treeWrap.event(e);
  for (const id of NEW_DEC) G.treeWrap.decision(id, DEC[id]);

  // Bọc mọi sự kiện đời người: chương đời cộng trọng số theo hướng; đếm sự kiện thuộc mạch (đã đi qua mạch, người quen, nhánh cây).
  const fitChap = (S, m) => {
    const C = S.chap && CH[S.chap.id]; if (!C || !C.dir || !m || !m.dir) return 0;
    let k = 0, f = 0; for (const [a, x] of Object.entries(m.dir)) { k += x; f += x * Math.min(1, C.dir[a] || 0); } return k ? f / k : 0;
  };
  // G.storyLinkHook (js/saga.js): sau khi sự kiện chạy, mạch chính, dấu hệ quả có thể nhận sự kiện là của mình (gắn nhãn, nối câu).
  function wrapStory(e) {
    if (e._story) return; e._story = true;
    const w0 = e.w, r0 = e.run, m = G.treeMeta(e.id), child = !!(m && m.from);
    e.w = keep((S, X) => { const w = typeof w0 === 'function' ? w0(S, X) : w0; return w * (1 + G.STORY.chapBoost * fitChap(S, m)); }, w0);
    e.run = keep(function (S, X) {
      X._tag = null; X._lk = false;
      const r = r0.call(this, S, X);
      if (r && !S.dead) {
        if (!X._lk && G.storyLinkHook && G.storyLinkHook(S, X, e, r)) X._lk = true;
        const lk = X._lk || child; cnt(S, 'stEv'); if (lk) cnt(S, 'stLink');
        const Z = G.STORY.stats && G.STORY_STATS; if (Z) { Z.ev++; if (lk) Z.link++; }
      }
      return r;
    }, r0);
  }
  for (const e of G.EVENTS) wrapStory(e);
  // Cho file nạp sau (js/saga.js): nút mạch, móc vào sự kiện có sẵn, bọc đếm cho sự kiện thêm sau story.js.
  G.storyApi = { node, dnode, patch, patchDec, wrapStory, touch, tagOf, first, ref, refE, castHas, stat, keep, MAXW,
    newNodes: () => ({ ev: NEW_EV, dec: NEW_DEC }), mainArc: S => mainArc(S) };
  { const re0 = G.runEvent; G.runEvent = function (X, ev) { re0(X, ev); X._tag = null; }; }
  { const P = G.Sim.prototype, ch0 = P.choose;
    P.choose = function (k) {
      const S = this.S, P0 = S && S.pending; this._tag = null; this._lk = false;
      const out = ch0.call(this, k);
      if (P0 && !S.dead) {
        const m = G.treeMeta(P0.id), lk = this._lk || !!(m && m.from);
        cnt(S, 'stDec'); if (lk) cnt(S, 'stDecLink');
        const Z = G.STORY.stats && G.STORY_STATS; if (Z) { Z.dec++; if (lk) Z.dlink++; }
      }
      this._tag = null;
      return out;
    };
    // Lúc chết: khép chương đang mở, rồi một đoạn "người ta nhớ về bạn" ghép từ các mạch đã khép.
    const die0 = P.die;
    P.die = function (cause) {
      const S = this.S, was = S && S.dead;
      die0.call(this, cause);
      if (!S || was || !S.dead) return;
      chapClose(S, this, true);
      const L = (S.arcDone || []).filter(d => d.o !== 'faded' && d.o !== 'gone').map(d => sumOf(S, d)).filter(Boolean);
      if (L.length) this.log(`Người ta nhớ về ${S.name.split(' ')[0]} qua mấy chuyện: ${L.slice(0, 5).join('; ')}. Mỗi người kể một kiểu, thêm bớt đôi chỗ, mà chừng ấy chuyện thì ai cũng còn nhớ.`, 'chapter');
    };
  }

  // ═════════ 9. Giao diện (ui.js đọc) ═════════
  G.castRows = function (S) {
    const C = S.cast || [], arcOf = p => (S.arcs || []).find(a => a.who === p.id);
    return C.filter(p => p.role !== 'phoi' || p.alive).map(p => {
      const a = arcOf(p), b = Math.round(p.bond);
      const sub = [G.ROLE_VI[p.role] || p.role, p.missing ? 'mất tích' : !p.alive ? 'đã mất' : null, a ? 'mạch: ' + G.ARCS[a.k].nameVi.toLowerCase() : null].filter(Boolean).join(' · ');
      const title = [p.name + (p.how ? `, ${p.how}` : ''), `${J.races[p.race].nameVi}, ${G.castYrs(S, p)} tuổi${p.alive ? '' : ' (lúc mất)'}`,
        [workVi(p), p.tier ? G.tierName(p.tier) : null].filter(Boolean).join(', '), p.alive && !p.missing ? `ở ${regName(p.loc)}` : '', `độ thân ${b > 0 ? '+' : ''}${b}`, p.news.length ? 'tin chưa nghe: ' + p.news.join(', ') : ''].filter(Boolean).join('\n');
      return { name: first(p), sub, bond: b, dead: !p.alive, arc: !!a, title, key: (a ? 2 : 0) + (p.alive ? 1 : 0) + Math.abs(b) / 200 };
    }).sort((x, y) => y.key - x.key);
  };
})(window.LifeSim);
