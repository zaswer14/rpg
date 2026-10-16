/* Vạn Kiếp — MẠCH TRUYỆN (docs/13; người dùng yêu cầu 16/10/2026).
 * Cây sự kiện (js/tree.js) chặn được chuyện vô lý nhưng mạch chỉ sâu hai nút, người trong truyện xuất hiện một lần rồi mất.
 * File này nạp SAU tree.js (dùng G.treeWrap để nút mới đi qua cổng chung) và thêm bốn lớp:
 *   1. Dàn nhân vật S.cast (tối đa G.STORY.castMax người): tên, loài, vai (G.ROLE_VI), độ thân −100…100, nghề, Tier, nơi ở.
 *      Mỗi lượt họ sống một đời giản lược (hệ con "cast": lớn lên, lên Tier, lập gia đình, chuyển đi, chết) và tích tin tức
 *      (p.news) để lần gặp sau có chuyện mà kể. Sự kiện cần "một người" thì lấy người trong dàn trước.
 *   2. Mạch S.arcs (G.ARCS): chuỗi hồi open → knot → climax → after → kết, có một người trong dàn làm nhân vật chính.
 *      Nút của mạch ghi `story: { arc, at, wait, to }`; nút đang mở được kéo trọng số × G.STORY.pull, quá wait[1] thì × 2,
 *      quá wait[1] + late mà không nút nào xảy ra thì mạch phai. Cùng lúc tối đa G.STORY.arcMax mạch (một mạch chính);
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

  G.STORY = { castMax: 12, arcMax: 3, pull: 4, mainK: 1.5, late: 2, chapBoost: .5, stats: false };
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
  const newsOf = p => p.news.splice(0).slice(-2).join(', ');
  const tagOf = (a, p) => G.ARCS[a.k].nameVi + (p ? ' · ' + first(p) : a.d.kin ? ' · ' + a.d.kin : '');

  // Đời giản lược của người trong dàn (hệ con "cast", trước "story").
  const GRIEF = ['Bạn thắp một nén nhang, ngồi tới khuya.', 'Bạn lấy ra món đồ cũ người đó tặng, ngắm một lúc rồi cất đi.', 'Bạn uống một chén rượu thay cho người đó.', 'Cả ngày hôm ấy bạn không nói câu nào.'];
  function castDie(S, X, p, why) {
    p.alive = false; p.died = S.world.year; p.news = [];
    const A = (S.arcs || []).filter(a => a.who === p.id);
    for (const a of A) {
      const D = G.ARCS[a.k], t = D.gone ? D.gone(S, p, a) : null;
      if (t) { X._tag = tagOf(a, p); X.log(t, 'bad'); X._tag = null; X._lk = true; }
      stat('gone', a.k); G.arcEnd(S, X, a, 'gone');
    }
    if (!A.length && Math.abs(p.bond) >= 30 && !p.missing) {
      X._tag = 'Người quen · ' + first(p);
      X.log(p.bond > 0 ? `Tin ${refE(S, p)} mất${why ? ' vì ' + why : ''} đến tai bạn. ${X.pick(GRIEF)}` : `Tin ${refE(S, p)} chết${why ? ' vì ' + why : ''}. Bạn không biết nên vui hay buồn.`, p.bond > 0 ? 'bad' : 'info');
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
      const x = y / R.le, fight = FIGHTER[p.work] ? .005 : 0;
      if (X.rnd() < per((.002 + fight + (x > .55 ? 2.4 * (x - .55) ** 2 : 0)) * k)) castDie(S, X, p, fight && X.chance(.5) ? X.pick(['một trận săn quái', 'một vụ phục kích trên đường', 'vết thương cũ']) : null);
    }
  };

  // ═════════ 2. Mạch ═════════
  // quest: câu hỏi của chương khi mạch là mạch chính; good: kết coi như "làm được"; sum: một vế trong đoạn tưởng nhớ lúc chết;
  // gone: dòng nhật ký khi người trong mạch chết trước khi mạch khép; fade: khi mạch phai.
  G.ARCS = {
    rival: { nameVi: 'Đối thủ', quest: (p) => `Vượt qua ${first(p)}`, good: ['win', 'peace'],
      sum: (o, p) => ({ win: `thắng ${first(p)} trong trận phân định`, lose: `chưa một lần thắng nổi ${first(p)}`, peace: `làm lành với ${first(p)}, đối thủ từ thuở bé`, no: `không nhận lời thách của ${first(p)}` }[o]),
      gone: (S, p) => `Tin ${refE(S, p)} chết đến tai bạn. Không còn ai để bạn phải hơn nữa.` },
    grace: { nameVi: 'Ơn cứu mạng', quest: (p) => `Trả ơn ${first(p)}`, good: ['paid'],
      sum: (o, p) => ({ paid: `trả được ơn cứu mạng của ${first(p)}`, unpaid: `từ chối ${first(p)}, người từng cứu mạng mình` }[o]),
      gone: (S, p) => `Tin ${refE(S, p)} mất. Món nợ cứu mạng, bạn chưa kịp trả.` },
    favor: { nameVi: 'Người mang ơn', good: ['repaid'], sum: (o, p) => (o === 'repaid' ? `được ${first(p)} trả ơn` : null) },
    feud: { nameVi: 'Mối thù', quest: (p) => `Đòi lại công bằng với ${first(p)}`, good: ['win', 'law', 'forgive'],
      sum: (o, p) => ({ win: `đòi lại được món nợ với ${first(p)}`, law: `đưa ${first(p)} ra trước pháp luật`, forgive: `tha cho ${first(p)}`, lose: `thua ${first(p)} cả khi đã tìm ra hắn` }[o]),
      gone: (S, p) => `Tin ${refE(S, p)} chết ở đâu đó. Món nợ giữa hai người không còn ai đòi.` },
    vengeance: { nameVi: 'Báo thù', quest: (p, a) => `Báo thù cho ${a.d.kin}`, good: ['win', 'letgo'],
      sum: (o, p, a) => ({ win: `báo được thù cho ${a.d.kin}`, letgo: `buông được mối thù cho ${a.d.kin}`, lose: `không báo được thù cho ${a.d.kin}` }[o]) },
    love: { nameVi: 'Tình xưa', quest: (p) => `Chuyện chưa xong với ${first(p)}`, good: ['wed', 'let', 'past'],
      sum: (o, p) => ({ wed: `nối lại với ${first(p)} sau ngần ấy năm`, let: `để chuyện với ${first(p)} ngủ yên`, past: null }[o]),
      gone: (S, p) => (p.bond >= 15 ? `Tin ${refE(S, p)} mất. Bạn ngồi lâu bên cửa sổ, nhớ một mùa hè.` : null) },
    master: { nameVi: 'Thầy trò', quest: (p) => `Theo ${first(p)} tới cùng`, good: ['heir'],
      sum: (o, p) => ({ heir: `nhận chân truyền của thầy ${first(p)}`, apart: `xa thầy ${first(p)} lúc thầy mất` }[o]),
      gone: (S, p) => `Thầy ${first(p)} mất khi bạn chưa học hết.` },
    debt: { nameVi: 'Nợ cờ bạc', quest: (p) => `Thoát khỏi món nợ với ${first(p)}`, good: ['paid', 'fled'],
      sum: (o, p) => ({ paid: 'trả sạch một món nợ cờ bạc', tied: `dính vào ${first(p)} vì một món nợ cờ bạc`, beaten: 'bị đánh vì một món nợ cờ bạc' }[o]),
      gone: (S, p) => `Tin ${first(p)}, chủ nợ của bạn, chết trong một vụ ẩu đả. Sổ nợ cháy theo.` },
    secret: { nameVi: 'Bí mật', quest: () => 'Giữ hay nói điều đã thấy', good: ['exposed', 'favor', 'win'],
      sum: (o, p) => ({ exposed: `vạch mặt ${first(p)}`, favor: `giữ kín chuyện của ${first(p)} và được đền đáp`, win: `sống sót sau khi tống tiền ${first(p)}`, lose: `trả giá vì tống tiền ${first(p)}`, backfire: `tố giác ${first(p)} mà không ai tin` }[o]) },
    idol: { nameVi: 'Mộng ước', quest: (p) => `Đi tới chỗ ${first(p)} từng đứng`, good: ['surpass', 'taught'],
      sum: (o, p) => ({ surpass: `đứng ngang hàng ${first(p)}, người mình theo suốt ba ngày hồi nhỏ`, taught: `được ${first(p)} chỉ cho một thế`, fallen: null }[o]),
      gone: (S, p) => `Lữ khách kể ${refE(S, p)} đã ngã xuống ở một chiến trường xa. Bạn nhớ ba ngày lẽo đẽo theo sau năm ấy.` },
    kin: { nameVi: 'Ruột thịt', quest: (p) => `Giữ tình ruột thịt với ${first(p)}`, good: ['close'],
      sum: (o, p) => ({ close: `cưu mang ${first(p)} lúc hoạn nạn`, rift: `cắt đứt với ${first(p)}` }[o]),
      gone: (S, p) => null },
    friend: { nameVi: 'Bạn thân', quest: (p) => `Gặp lại ${first(p)}`, good: ['reunion'], sum: (o, p) => (o === 'reunion' ? `gặp lại ${first(p)} sau bao năm xa cách` : null),
      gone: (S, p) => `Tin ${refE(S, p)} mất. Bạn tìm lại mấy lá thư cũ, đọc tới sáng.` },
    lost: { nameVi: 'Người mất tích', good: ['back'], sum: (o, p) => (o === 'back' ? `đón ${first(p)} trở về sau bao năm mất tích` : null),
      fade: (S, X, p) => { if (p) { p.alive = false; p.died = S.world.year; } } },
    hunter: { nameVi: 'Kẻ săn', quest: (p) => `Thoát khỏi ${first(p)}`, good: ['truce', 'slain', 'fled'],
      sum: (o, p) => ({ truce: `khiến ${first(p)}, Thánh Kỵ Sĩ săn mình, hạ kiếm`, slain: `hạ ${first(p)}, Thánh Kỵ Sĩ săn mình`, beaten: `bị ${first(p)} thanh tẩy dở dang`, fled: `trốn khỏi ${first(p)}` }[o]),
      gone: (S, p) => `Nghe lỏm lữ khách kể ${first(p)}, Thánh Kỵ Sĩ từng săn bạn, đã chết. Bạn đứng ở cửa hầm cả đêm.` },
    flower: { nameVi: 'Đứa bé tặng hoa', quest: (p) => `Đợi ${first(p)} lớn`, good: ['guard', 'kin'],
      sum: (o, p) => ({ guard: `được ${first(p)}, đứa bé tặng hoa năm nào, đứng ra che chở`, kin: `làm bạn với ${first(p)} từ khi nó còn bé tới khi nó có con` }[o]),
      gone: (S, p) => `Lâu lắm không thấy ${first(p)} lên đồi. Lữ khách kể người đó đã mất. Bạn để một bông hoa dại trước cửa hầm.` },
    prophecy: { nameVi: 'Lời bà đồng', passive: true, good: ['survived'], sum: (o, p, a) => (o === 'survived' ? `sống qua năm bà đồng nói sẽ chết` : null) }
  };
  const isActive = a => !G.ARCS[a.k].passive;
  G.arcOpen = function (S, X, k, p, d, at) {
    const A = S.arcs || (S.arcs = []), D = G.ARCS[k], who = p ? p.id : null;
    if (A.some(a => a.k === k && a.who === who)) return null;
    if (!D.passive && A.filter(isActive).length >= G.STORY.arcMax) return null;
    const a = { k, who, at: at || 'open', t: S.age, t0: S.age, main: false, d: d || {} };
    if (!D.passive && !A.some(x => x.main)) a.main = true;
    A.push(a); stat('open', k); X._lk = true; X._tag = tagOf(a, p);
    return a;
  };
  G.arcEnd = function (S, X, a, o) {
    const A = S.arcs || [], i = A.indexOf(a); if (i < 0) return;
    A.splice(i, 1);
    const p = G.castGet(S, a.who);
    (S.arcDone || (S.arcDone = [])).push({ k: a.k, who: a.who, name: p ? p.name : null, o, y: X.years(S), t0: a.t0, t: S.age, d: a.d, main: a.main });
    if (o !== 'gone' && o !== 'faded') stat('end', a.k + ':' + o);
    if (a.main) { const nx = A.find(isActive); if (nx) nx.main = true; }
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
    r.t = r.t.replace('Lũ trẻ lớn hơn', `Lũ trẻ lớn hơn, cầm đầu là ${first(p)},`);
    G.arcOpen(S, X, 'rival', p, { fought: S.traits.bold > .55 });
  });
  // ── Ơn cứu mạng: người kéo bạn khỏi sông ──
  patch('ch_river', (S, X, r) => {
    const p = G.castAdd(S, X, { role: 'an', how: 'người chăn dê kéo bạn khỏi sông năm nào', yrs: X.years(S) + X.int(14, 30), work: 'herder', bond: 45, drive: .2 * X.rnd() });
    r.t = r.t.replace('Một người chăn dê', `Một người chăn dê tên ${first(p)}`);
    G.arcOpen(S, X, 'grace', p, { need: X.pick(['money', 'son', 'escort']) });
  });
  // ── Bạn thân: người bạn sau trận ẩu đả; ad_old_friend dùng người bạn có trong dàn ──
  patch('tn_brawl', (S, X, r) => {
    if ((S.cast || []).filter(p => p.alive && p.role === 'ban').length >= 2) return;
    const p = G.castAdd(S, X, { role: 'ban', how: 'người bạn quen sau trận ẩu đả ở quán rượu', yrs: X.years(S) + X.int(-2, 4), bond: 35, work: X.pick(['guard', 'hunter', 'adventurer', 'smith']) });
    r.t = r.t.replace('được một người bạn', `được một người bạn: ${first(p)}`);
    G.arcOpen(S, X, 'friend', p, {});
  });
  patch('ad_old_friend', (S, X, r) => {
    const fr = (S.cast || []).filter(p => p.alive && !p.missing && p.role === 'ban' && S.age - p.seen >= 2 && !(S.arcs || []).some(a => a.who === p.id));
    if (!fr.length) return;
    const p = fr.reduce((a, b) => (b.bond > a.bond ? b : a)), nw = newsOf(p), w = workVi(p);
    r.t = `Bạn gặp lại ${refE(S, p)}${nw ? `, người giờ ${nw}` : w ? `, giờ làm ${w}` : ''}. Hai người uống tới sáng.`;
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
    r.t += ` Tên cầm đầu, ${first(p)}, vừa đếm tiền vừa cười.`;
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
    r.t = r.t.replace(`${j.job} ghé`, `${j.job} tên ${first(p)} ghé`);
    G.arcOpen(S, X, 'idol', p, { school: j.school });
  });
  // ── Nợ cờ bạc: thua rồi vay để gỡ ──
  patch('ad_dice', (S, X, r) => {
    if (r.k !== 'bad' || S.gold > med(S, X) || !X.chance(.5) || (S.arcs || []).some(a => a.k === 'debt')) return;
    const amt = Math.round(med(S, X) * .5);
    const p = G.castAdd(S, X, { role: 'no', how: 'tay cho vay nặng lãi', yrs: X.years(S) + X.int(5, 20), work: 'merchant', bond: -10, drive: .5 });
    r.t += ` Bạn vay ${first(p)} ${G.coin(amt)} để gỡ, rồi thua nốt.`;
    G.arcOpen(S, X, 'debt', p, { amt, loc: S.loc });
  });
  // ── Lời bà đồng ──
  patch('ad_prophet', (S, X, r) => { const m = /năm (\d+) tuổi/.exec(r.t); if (m && +m[1] > X.years(S)) G.arcOpen(S, X, 'prophecy', null, { y: +m[1] }); });
  // ── Kẻ săn: Thánh Kỵ Sĩ trẻ được tha ──
  patch('sk_paladin', (S, X, r) => {
    if (!/đánh gãy kiếm/.test(r.t) || (S.arcs || []).some(a => a.k === 'hunter')) return;
    const p = G.castAdd(S, X, { race: 'human', role: 'thu', how: 'Thánh Kỵ Sĩ trẻ bạn từng tha mạng', yrs: X.int(19, 26), tier: Math.max(1, X.ctier(S)), work: 'guard', bond: -20, drive: .8 });
    r.t = r.t.replace('Một Thánh Kỵ Sĩ trẻ', `Một Thánh Kỵ Sĩ trẻ tên ${first(p)}`);
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
      return { t: `Bạn kết thân với ${first(p)}, con nhà ${w} cạnh nhà. Hai đứa đi đâu cũng có nhau, bị phạt cũng có nhau.`, k: 'good' };
    } });
  opener({ id: 'st_rival', st: ['teen'], w: S => (castHas(S, 'doi') ? 0 : 1.5), tree: { body: 'living' },
    c: S => slot(S),
    run(S, X) {
      const p = G.castAdd(S, X, { role: 'doi', how: 'kẻ luôn hơn bạn một bậc thời trai trẻ', yrs: X.years(S) + X.int(-1, 1), bond: -20, drive: .5 + .5 * X.rnd() });
      G.arcOpen(S, X, 'rival', p, {});
      const what = S.work ? `ở chỗ làm ${G.WORKS[S.work].nameVi.toLowerCase()}` : X.pick(['ở bãi tập của làng', 'ở lớp chữ của đền', 'trong đám trai trẻ đi săn']);
      return { t: `${what[0].toUpperCase() + what.slice(1)}, ${first(p)} việc gì cũng làm hơn bạn một chút, và không bao giờ để bạn quên điều đó.`, k: 'info' };
    } });
  opener({ id: 'st_rescue', st: ['adult', 'elder'], rep: true, gap: 10, w: S => .8 + S.traits.bold, tree: { body: 'living' },
    c: (S, X) => slot(S) && noArc(S, 'favor') && X.power(S) > .6 && (S.flags.rescueN || 0) < 2,   // tối đa hai lần một đời
    run(S, X) {
      const type = X.pick(['merchant', 'merchant', 'noble', 'outlaw']), z = X.reg(S).zones[0], sp = X.monsterIn(z); cnt(S, 'rescueN');
      const p = G.castAdd(S, X, { race: X.chance(.7) ? (S.undead ? 'human' : S.race) : X.wkey(X.reg(S).races), role: 'on', how: { merchant: 'thương nhân bạn kéo khỏi xe lật', noble: 'người bạn cứu khỏi bầy quái năm nào', outlaw: 'người mang dao bạn cõng ra khỏi rừng' }[type],
        yrs: X.years(S) + X.int(-8, 12), work: { merchant: 'merchant', noble: 'steward', outlaw: 'thief' }[type], tier: type === 'outlaw' ? 1 : 0, bond: 50, drive: .6 + .4 * X.rnd() });
      G.arcOpen(S, X, 'favor', p, { type });
      return { t: { merchant: `Bạn kéo một thương nhân tên ${first(p)} ra khỏi chiếc xe lật dưới khe núi. Người đó để lại địa chỉ ở ${capName(S)}, bắt bạn hứa có dịp thì ghé.`,
        noble: `Bạn đuổi bầy ${sp.nameVi} khỏi một người ăn mặc sang trọng bị lạc trong ${z.nameVi}. ${first(p)} hỏi tên bạn hai lần, như sợ quên.`,
        outlaw: `Bạn cõng một người bị thương ra khỏi rừng, không hỏi vì sao người đó giắt dao ở cả hai bên hông. Người đó nói tên là ${first(p)}.` }[type], k: 'good' };
    } });
  opener({ id: 'st_witness', st: ['adult', 'elder'], rep: true, gap: 15, w: 1, tree: { body: 'living', soc: 1 },
    c: S => slot(S) && noArc(S, 'secret') && (S.flags.secretN || 0) < 2,
    run(S, X) {
      const type = X.pick(['tax', 'dark', 'gate']); cnt(S, 'secretN');
      const p = G.castAdd(S, X, { role: 'bimat', how: { tax: 'người thu thuế bạn bắt gặp đêm ấy', dark: 'tu sĩ bạn bắt gặp đêm ấy', gate: 'đội trưởng lính tuần bạn bắt gặp đêm ấy' }[type],
        yrs: X.years(S) + X.int(0, 15), work: { tax: 'steward', dark: 'priest', gate: 'guard' }[type], tier: X.int(1, 2), bond: -5, drive: .7 });
      G.arcOpen(S, X, 'secret', p, { type });
      return { t: { tax: `Đêm muộn, bạn thấy ${first(p)}, người thu thuế của vùng, chất mấy bao tiền thuế lên xe nhà mình.`,
        dark: `Bạn thấy ${first(p)}, tu sĩ của đền làng, lén trao một bọc vải đen cho người của Hắc Giáo.`,
        gate: `Nửa đêm, bạn thấy ${first(p)}, đội trưởng lính tuần, tự tay mở cổng cho một đoàn xe không đèn đi qua.` }[type], k: 'info' };
    } });
  opener({ id: 'st_kin', st: ['adult', 'elder'], rep: true, gap: 8, w: 1, tree: { body: 'living' },
    c: S => slot(S) && noArc(S, 'kin') && S.family.sibs.some((s, i) => s.alive && !(S.flags.kinAsked || []).includes(i)),
    run(S, X) {
      const i = S.family.sibs.findIndex((s, i) => s.alive && !(S.flags.kinAsked || []).includes(i)), s = S.family.sibs[i], type = X.pick(['debt', 'sick', 'levy']);
      (S.flags.kinAsked = S.flags.kinAsked || []).push(i);   // mỗi anh chị một lần gặp nạn
      let p = (S.cast || []).find(x => x.sib === i);
      if (!p) p = G.castAdd(S, X, { name: s.name, role: 'ho', how: `${s.sex === 'm' ? 'anh' : 'chị'} ruột của bạn`, sex: s.sex, yrs: s.age, bond: 30, sib: i });
      G.arcOpen(S, X, 'kin', p, { type });
      return { t: { debt: `Thư nhà: ${s.name} nợ thuế hai năm liền, sắp bị xiết nhà.`, sick: `Thư nhà: ${s.name} ốm nặng, thầy lang trong làng đã lắc đầu.`,
        levy: `Thư nhà: con trai cả của ${s.name} bị bắt đi lính, cả nhà chạy vạy không ra tiền chuộc.` }[type], k: 'bad' };
    } });
  opener({ id: 'st_parent_lost', st: ['child', 'teen'], w: S => .3 + G.REGION[S.loc].danger * 1.5, tree: { body: 'flesh' },
    c: S => slot(S) && noArc(S, 'vengeance') && S.family.parents.some(p => p.alive && p.role === 'cha'),
    run(S, X) {
      const z = X.reg(S).zones[0], sp = X.monsterIn(z), f = S.family.parents.find(p => p.alive && p.role === 'cha');
      f.alive = false; X.add('h', -15);
      G.arcOpen(S, X, 'vengeance', null, { sp: sp.id, kin: 'cha', zone: z.id });
      return { t: `Cha bạn vào ${z.nameVi} săn thú và không về. Người ta chỉ tìm thấy cây giáo gãy và dấu chân ${sp.nameVi}.`, k: 'bad', f: X.factOf(sp) };
    } });

  // ═════════ 5. Nút của các mạch ═════════
  // ── Đối thủ ──
  node({ id: 'rv_kid', st: ['child'], tree: { body: 'living' }, story: { arc: 'rival', at: 'open', wait: [1, 8], to: 'open' }, w: 2,   // ở lại bước Mở, tính lại khoảng chờ (thiếu niên mới sang bước kế)
    c: (S, X, a) => !a.d.kid,
    run(S, X, a, p) {
      const what = X.pick(['cuộc thi chạy của lũ trẻ trong làng', 'buổi đọc chữ ở đền', 'trò đánh trận giả bên bờ sông']); a.d.kid = true;
      if (X.rnd() < .3 + .4 * S.traits.bold) { X.add('h', 5); return { t: `Ở ${what}, lần đầu tiên bạn hơn ${first(p)}. ${first(p)} đá tung đống cát rồi bỏ về.`, k: 'good', o: 'ahead', bond: -5 }; }
      X.add('h', -4); return { t: `Ở ${what}, ${first(p)} lại hơn bạn, và cả đám trẻ cười theo.`, k: 'bad', o: 'behind', bond: -5 };
    } });
  node({ id: 'rv_school', st: ['teen', 'adult'], tree: { body: 'living' }, story: { arc: 'rival', at: 'open', wait: [1, 6], to: 'knot' }, w: 3,
    run(S, X, a, p) {
      const mine = S.sm / 100 + X.power(S) + X.rnd() * .6, his = .3 + npcPow(p, p.drive * .6) + X.rnd() * .6, ahead = mine > his;
      const what = X.stage(S) === 'teen' ? 'kỳ tuyển học trò của trường trong vùng' : X.pick(['kỳ tuyển lính tuần của phủ', 'kỳ sát hạch của Hiệp Hội Mạo Hiểm', 'cuộc thi tay nghề ở chợ phiên']);
      if (ahead) { X.add('h', 5); return { t: `${ref(S, p)} cũng dự ${what}. Lần này tên bạn đứng trên. ${first(p)} xé tờ bảng ngay trước mặt mọi người.`, k: 'good', o: 'ahead', bond: -10 }; }
      X.add('h', -5); G.trajBump(S, { vo: .15 });
      return { t: `${ref(S, p)} cũng dự ${what} và đứng đầu bảng, trên tên bạn ba bậc. Đêm đó bạn không ngủ.`, k: 'bad', o: 'behind', bond: -5 };
    } });
  node({ id: 'rv_love', st: ['teen', 'adult'], tree: { body: 'flesh' }, story: { arc: 'rival', at: 'open', wait: [1, 6], to: 'knot' }, w: 1.5,
    c: S => single(S),
    run(S, X, a, p) {
      if (X.rnd() < .35 + .4 * S.traits.social) { X.add('h', 6); return { t: `Bạn và ${ref(S, p)} cùng để ý một người. Người đó chọn bạn; ${first(p)} không nói với bạn câu nào suốt mùa hè.`, k: 'good', o: 'ahead', bond: -10 }; }
      X.add('h', -6); return { t: `Người bạn để ý suốt mùa xuân lại nhận lời đi hội với ${first(p)}.`, k: 'bad', o: 'behind', bond: -8 };
    } });
  node({ id: 'rv_rise', st: ['adult', 'elder'], tree: { body: 'living' }, story: { arc: 'rival', at: 'open', wait: [2, 8], to: 'knot' }, w: 2,
    c: (S, X, a, p) => p.tier > X.ctier(S),
    run(S, X, a, p) { X.add('h', -5); G.trajBump(S, { vo: .2 }); return { t: `${ref(S, p)} giờ đã là ${G.tierName(p.tier)}, đi ngang qua bạn ở chợ còn cố ý nói to cho cả dãy hàng nghe.`, k: 'bad', o: 'behind' }; } });
  dnode('rv_duel', { tree: { body: 'living' }, story: { arc: 'rival', at: 'knot', wait: [2, 10], to: 'after' },
    when: (S, X) => ['adult', 'elder'].includes(X.stage(S)),
    build(S, X, a, p) {
      const where = X.pick([`giữa chợ ${homeName(S)}`, 'trước sân đấu của hội võ', 'ở cổng làng, trước mặt bao nhiêu người']);
      return { title: 'Đối thủ cũ', body: `${ref(S, p)} chặn đường bạn ${where}: "Từ bé tới giờ, ta với ngươi chưa lần nào phân định cho ra lẽ."`,
        choices: [{ k: 'fight', label: 'Nhận lời đấu', sub: 'Đấu tay đôi, không tới chết. Thắng thua thì cả làng đều biết.' },
          { k: 'peace', label: 'Mời rượu, bỏ qua chuyện cũ', sub: 'Phải ăn nói khéo; người kia có thể không nhận.' }, { k: 'no', label: 'Bỏ đi', sub: 'Không mất gì ngoài thể diện.' }] };
    },
    apply(S, X, k, c, a, p) {
      if (k === 'fight') {
        const pw = G.clamp(logit(X.power(S) - npcPow(p, .4 * p.drive)), .1, .9);
        if (X.rnd() < pw) { S.fame = Math.min(100, S.fame + 3); X.add('h', 10); X.add('so', 3); p.bond += 10; cnt(S, 'rvWin'); return { t: `Bạn quật ${first(p)} ngã ở hiệp thứ ba. ${first(p)} đứng dậy, phủi đất, gật đầu một cái rồi đi.`, o: 'win' }; }
        X.add('hl', -10); X.add('h', -8); if (X.chance(.25)) X.cond('wound');
        return { t: `${first(p)} thắng. Bạn nằm trên đất nghe tiếng người ta hò reo cho kẻ khác.`, o: 'lose' };
      }
      if (k === 'peace') {
        if (X.rnd() < .35 + .5 * S.traits.social + (p.bond + 100) / 400) { p.bond = 20; p.role = 'ban'; X.add('h', 6); return { t: `${first(p)} nhìn chén rượu lâu lắm rồi mới uống cạn.`, o: 'peace' }; }
        X.add('so', -3); return { t: `${first(p)} hất chén rượu xuống đất.`, o: 'no' };
      }
      X.add('so', -4); X.add('h', -3); return { t: 'Sau lưng bạn có tiếng cười.', o: 'no' };
    },
    auto(S, X, d, a, p) { const T = S.traits; if (p && X.power(S) >= npcPow(p, .4 * p.drive)) return 'fight'; return T.bold > .6 ? 'fight' : T.social > .55 ? 'peace' : 'no'; } });
  node({ id: 'rv_end', st: ['teen', 'adult', 'elder'], tree: { body: 'living' }, story: { arc: 'rival', at: 'after', wait: [2, 12] }, w: 3,
    run(S, X, a, p) {
      if (a.o === 'win') { p.loc = X.pick(G.REGIONS).id; return { t: `Sau trận ấy ${first(p)} rời ${homeName(S)}. Nhiều năm sau bạn nghe ${first(p)} sống ở ${regName(p.loc)}, hay kể chuyện thua bạn như kể chuyện vui.`, k: 'good', o: 'win', bond: 15 }; }
      if (a.o === 'peace') {
        X.add('h', 8); X.add('so', 5);
        return p.wed ? { t: `${first(p)} dắt đứa con trai tới nhờ bạn chỉ cho nó vài đường. "Nó giống ta hồi bé," ${first(p)} nói, "cần có người trị."`, k: 'good', o: 'peace', bond: 20 }
          : { t: `Mùa gặt nào ${first(p)} cũng ghé nhà bạn. Hai người cãi nhau về chuyện hồi bé như hai ông già.`, k: 'good', o: 'peace', bond: 20 };
      }
      if (a.o === 'lose') { G.trajBump(S, { vo: .3 }); X.addXp(60); return { t: `${first(p)} kể khắp nơi chuyện thắng bạn. Mấy năm liền bạn dậy sớm hơn cả làng, tập tới khi mặt trời lên.`, k: 'info', o: 'lose' }; }
      X.add('so', -2); return { t: `Người ta vẫn nhắc lần bạn bỏ đi trước mặt ${first(p)}. Bạn để họ nhắc.`, k: 'info', o: 'no' };
    } });

  // ── Ơn cứu mạng (bạn mang ơn người khác) ──
  dnode('gr_ask', { tree: { body: 'living' }, story: { arc: 'grace', at: 'open', wait: [3, 14], to: 'after' },
    when: (S, X) => ['adult', 'elder'].includes(X.stage(S)),
    build(S, X, a, p) {
      const amt = Math.round(med(S, X) * .6), z = X.reg(S).zones[0]; a.d.amt = amt;
      const body = { money: `${ref(S, p)} tìm tới. Năm nay mất trắng, ${first(p)} cần ${G.coin(amt)} để giữ mảnh đất cuối cùng.`,
        son: `${ref(S, p)} tìm tới: con trai ${first(p)} bị bắt đi phu, cần một người có tiếng nói đứng ra bảo lãnh.`,
        escort: `${ref(S, p)} tìm tới, nhờ bạn đi cùng qua ${z.nameVi}, nơi dạo này quái hay ra chặn đường.` }[a.d.need];
      return { title: 'Món nợ cũ', body, choices: [{ k: 'help', label: 'Giúp', sub: a.d.need === 'money' ? `Mất ${G.coin(amt)}.` : a.d.need === 'son' ? 'Phải đi lên phủ, nói chuyện với người có quyền.' : 'Một chuyến đi có đánh nhau.' },
        { k: 'no', label: 'Từ chối', sub: 'Giữ được của, mất mặt với người trong vùng.' }] };
    },
    apply(S, X, k, c, a, p) {
      if (k === 'no') { X.add('so', -6); X.add('h', -4); p.bond -= 40; cnt(S, 'grNo'); return { t: `${first(p)} gật đầu, không nói gì, rồi đi.`, o: 'no' }; }
      X.add('h', 6); X.add('so', 4); p.bond += 30; cnt(S, 'grHelp');
      if (a.d.need === 'money') { X.money(-a.d.amt); return { t: 'Bạn đưa tiền, không lấy giấy nợ.', o: 'help' }; }
      if (a.d.need === 'son') return { t: G.standing(S, X).soc >= 1 || S.fame >= 10 ? 'Phủ nể mặt bạn. Con trai người đó về nhà trước mùa đông.' : 'Bạn lên phủ ba lần mới được gặp quan. Người con được tha, muộn mất một năm.', o: 'help' };
      const z = X.reg(S).zones[0], enc = X.rollEncounter(z, { grade: 'normal' }), rec = enc ? X.fight(enc, false) : { win: true };
      if (S.dead) return null;
      return { t: rec.win ? 'Bạn đi trước, mở đường. Cả đoàn qua được không mất một ai.' : 'Bạn bị thương, nhưng cả đoàn qua được.', o: 'help' };
    },
    auto: (S) => (S.traits.social > .3 || S.traits.pious > .5 ? 'help' : 'no') });
  node({ id: 'gr_end', st: ['adult', 'elder'], tree: { body: 'living' }, story: { arc: 'grace', at: 'after', wait: [2, 12], dead: true }, w: 3,
    run(S, X, a, p) {
      if (a.o === 'help') {
        X.add('h', 6);
        return G.castYrs(S, p) > G.RACES[p.race].le * .6 || !p.alive
          ? { t: `${first(p)} mất vào một mùa đông. Người nhà mang tới cho bạn cây gậy chăn dê ${first(p)} dặn phải đưa tận tay.`, k: 'info', o: 'paid' }
          : { t: `Con cháu ${first(p)} gọi bạn là ân nhân của nhà họ, dù người cứu mạng trước là ${first(p)}. Hai bên coi như sòng phẳng.`, k: 'good', o: 'paid' };
      }
      X.add('so', -4);
      return { t: `Bạn nghe tin nhà ${first(p)} phải bỏ làng đi nơi khác. Người trong vùng chào bạn nhạt đi.`, k: 'bad', o: 'unpaid' };
    } });

  // ── Người mang ơn bạn: đền đáp theo đúng cái bạn đang cần ──
  node({ id: 'fv_return', st: ['adult', 'elder'], tree: { body: 'living' }, story: { arc: 'favor', at: 'open', wait: [3, 12] }, w: 3,
    run(S, X, a, p) {
      const F = S.flags, wanted = F.wanted && S.nation != null && F.wanted[S.nation];
      if (wanted || F.crimes) {
        if (wanted) delete F.wanted[S.nation]; else F.crimes = Math.max(0, F.crimes - 1);
        return { t: `${ref(S, p)} giờ có chỗ đứng trong phủ. Một tờ giấy của ${first(p)}, và hồ sơ của bạn ở nha môn biến mất.`, k: 'big', o: 'repaid', bond: 10 };
      }
      if (a.d.type === 'outlaw') { X.add('h', 6); return { t: `Toán cướp chặn bạn ở đèo. Tên cầm đầu nhìn mặt bạn rồi phẩy tay: "${first(p)} dặn rồi. Đi đi."`, k: 'good', o: 'repaid' }; }
      if (a.d.type === 'noble' && single(S) && flesh(S) && !F.suitor) {
        const race = S.race; F.suitor = { name: X.name(race, X.chance(.5) ? 'm' : 'f'), race, work: 'người nhà ' + first(p), age: X.years(S) + X.int(-4, 3) };
        return { t: `${ref(S, p)} mời bạn dự tiệc, xếp bạn ngồi cạnh ${F.suitor.name}, người trong họ. Cả bữa, ${first(p)} cứ cười một mình.`, k: 'good', o: 'repaid', bond: 10 };
      }
      if (S.gold < med(S, X) * 2) { const g = Math.round(med(S, X) * .8); X.money(g); return { t: `${ref(S, p)} giới thiệu bạn với một chủ hàng lớn. Năm đó bạn kiếm thêm ${G.coin(g)}.`, k: 'good', o: 'repaid', bond: 10 }; }
      S.gear = Math.min(10, S.gear + 1);
      return { t: `${ref(S, p)} gửi tới một thanh kiếm rèn ở ${capName(S)}, kèm mảnh giấy: "Một mạng đổi một thanh kiếm, vẫn còn rẻ." Trang bị ${S.gear}/10.`, k: 'good', o: 'repaid', bond: 10 };
    } });

  // ── Mối thù ──
  node({ id: 'fd_news', st: ['adult', 'elder'], tree: { body: 'living' }, story: { arc: 'feud', at: 'open', wait: [1, 8], to: 'knot' }, w: 3,
    run(S, X, a, p) {
      X.add('h', -3);
      return p.drive > .55 ? { t: `Có người kể ${ref(S, p)} giờ mở quán trọ ở ${regName(p.loc)}. Vốn ở đâu ra thì ai cũng đoán được.`, k: 'bad', o: 'rich' }
        : { t: `Nghe nói ${ref(S, p)} vẫn lảng vảng ở ${regName(p.loc)}, làm ăn chẳng ra gì.`, k: 'info', o: 'poor' };
    } });
  dnode('fd_face', { tree: { body: 'living' }, story: { arc: 'feud', at: 'knot', wait: [1, 10], to: 'after' },
    build(S, X, a, p) {
      const law = G.standing(S, X).soc >= 1;
      return { title: 'Chạm mặt', body: `Bạn tìm ra ${ref(S, p)} ở ${regName(p.loc)}. ${first(p)} nhận ra bạn ngay, tay đặt lên chuôi dao.`,
        choices: [{ k: 'fight', label: 'Đòi lại bằng tay', sub: 'Đánh nhau; thắng thì lấy lại phần của mình.' },
          ...(law ? [{ k: 'law', label: 'Báo quan', sub: 'Cần người làm chứng; quan có thể chẳng làm gì.' }] : []),
          { k: 'forgive', label: 'Bỏ qua', sub: 'Không lấy lại được gì; lòng nhẹ hơn.' }] };
    },
    apply(S, X, k, c, a, p) {
      if (k === 'fight') {
        const pw = G.clamp(logit(X.power(S) - npcPow(p, .3 * p.drive)), .1, .9);
        if (X.rnd() < pw) { X.money(a.d.gold || 0); S.fame = Math.min(100, S.fame + 1); X.add('h', 8); return { t: `${first(p)} nằm dưới đất, trả lại cho bạn ${G.coin(a.d.gold || 0)} và một lời xin tha.`, o: 'win' }; }
        X.add('hl', -12); X.add('h', -6); if (X.chance(.3)) X.cond('wound');
        return { t: `${first(p)} nhanh tay hơn. Bạn ôm vết dao trên tay đi về.`, o: 'lose' };
      }
      if (k === 'law') {
        if (X.rnd() < .4 + .1 * G.standing(S, X).soc) { X.add('h', 5); return { t: 'Quan cho bắt người.', o: 'law' }; }
        const f = Math.round(med(S, X) * .2); X.money(-f); X.add('h', -4); return { t: `Quan nhận lễ của ${first(p)}, rồi phạt bạn ${G.coin(f)} tội vu cáo.`, o: 'lawfail' };
      }
      X.add('h', 4); p.bond += 20; return { t: `Bạn quay lưng đi trước. ${first(p)} đứng nhìn theo rất lâu.`, o: 'forgive' };
    },
    auto(S, X, d, a, p) { const T = S.traits; if (T.social > .65 || T.pious > .7) return 'forgive'; if (d.choices.some(c => c.k === 'law') && T.bold < .4) return 'law'; return X.power(S) >= npcPow(p, 0) || T.bold > .5 ? 'fight' : 'forgive'; } });
  node({ id: 'fd_end', st: ['adult', 'elder'], tree: { body: 'living' }, story: { arc: 'feud', at: 'after', wait: [1, 10], dead: true }, w: 3,
    run(S, X, a, p) {
      if (a.o === 'win') { p.loc = X.pick(G.REGIONS).id; X.add('h', 4); return { t: `Từ hôm đó bạn ngủ ngon. ${first(p)} rời vùng, không ai nghe tin nữa.`, k: 'good', o: 'win' }; }
      if (a.o === 'law') return { t: `${first(p)} bị xử khổ sai ở mỏ đá. Bạn đứng xem người ta xích chân ${first(p)}, không thấy vui như mình tưởng.`, k: 'info', o: 'law' };
      if (a.o === 'forgive') {
        if (X.chance(.55)) { const g = Math.round((a.d.gold || 20) * .6); X.money(g); X.add('h', 6); return { t: `Một sáng có túi tiền đặt trước cửa nhà bạn, ${G.coin(g)}, kèm mảnh giấy chỉ có một chữ: tên ${first(p)}.`, k: 'good', o: 'forgive', bond: 20 }; }
        return { t: `Bạn không nghe tin ${first(p)} nữa. Lạ là bạn cũng thôi nghĩ tới.`, k: 'info', o: 'forgive' };
      }
      return { t: `${first(p)} vẫn sống phây phây. Mỗi lần đi ngang ${regName(p.loc)}, bạn lại sờ vết sẹo cũ.`, k: 'bad', o: 'lose' };
    } });

  // ── Báo thù cho người thân (không có người trong dàn; a.d: sp, kin, zone) ──
  const spOf = a => G.B.byId[a.d.sp];
  const zoneOf = (S, X, a) => (G.ZONE[a.d.zone] ? G.ZONE[a.d.zone].zone : X.reg(S).zones[0]);
  const vgEnc = (S, X, a) => ({ s: spOf(a), grade: 'elite', affixes: [], count: 1, zone: zoneOf(S, X, a), cell: null, feat: null });
  node({ id: 'vg_oath', st: ['teen', 'adult'], tree: { body: 'living' }, story: { arc: 'vengeance', at: 'open', wait: [1, 8], to: 'knot' },
    w: S => .5 + 3 * S.traits.bold + 4 * sh(S, 'vo'),
    run(S, X, a) { G.trajBump(S, { vo: .4 }); X.addXp(40); return { t: `Bạn khắc tên ${a.d.kin === 'cha' ? 'cha' : a.d.kin} lên chuôi con dao đi rừng. Từ đó sáng nào bạn cũng tập trước khi gà gáy.`, k: 'info', o: 'oath' }; } });
  node({ id: 'vg_letgo', st: ['teen', 'adult', 'elder'], tree: { body: 'living' }, story: { arc: 'vengeance', at: ['open', 'knot'], wait: [4, 14], to: 'end' },
    w: S => .4 + 1.5 * S.traits.social + 1.5 * S.traits.pious + 3 * sh(S, 'gia'),
    run(S, X, a) { X.add('h', 6); return { t: `Mộ ${a.d.kin === 'cha' ? 'cha' : a.d.kin} cỏ đã xanh. Bạn thôi nhìn về phía ${zoneOf(S, X, a).nameVi} mỗi chiều.`, k: 'info', o: 'letgo' }; } });
  dnode('vg_hunt', { tree: { body: 'living' }, story: { arc: 'vengeance', at: 'knot', wait: [1, 14], to: 'after' },
    when(S, X, a) { const sp = spOf(a); return !!sp && ['adult', 'elder'].includes(X.stage(S)) && sp.tier <= X.ctier(S) + 1 && X.power(S) >= X.threat(vgEnc(S, X, a)) - .3; },
    build(S, X, a) {
      const sp = spOf(a), z = zoneOf(S, X, a);
      return { title: 'Món nợ máu', body: `Thợ săn báo: một con ${sp.nameVi} đầu đàn vừa về ${z.nameVi}, đúng chỗ năm ấy.`,
        choices: [{ k: 'hunt', label: 'Đi săn nó', sub: `Một trận với ${sp.nameVi} tinh anh. Thua có thể chết.` }, { k: 'no', label: 'Để nó yên', sub: `Báo thù không làm ${a.d.kin} sống lại.` }] };
    },
    apply(S, X, k, c, a) {
      if (k === 'no') { X.add('h', 3); return { t: 'Bạn treo con dao lên vách.', o: 'letgo', to: 'end' }; }
      const rec = X.fight(vgEnc(S, X, a), false); if (S.dead) return null;
      cnt(S, 'vgHunt');
      if (rec.win) { S.fame = Math.min(100, S.fame + 2); X.add('h', 12); cnt(S, 'vgWin'); return { t: `Con ${spOf(a).nameVi} gục dưới chân bạn.`, o: 'win' }; }
      a.d.tries = (a.d.tries || 0) + 1;
      return { t: 'Nó lại thoát. Bạn lết về với một vết thương mới.', o: 'lose', to: a.d.tries < 2 ? 'knot' : 'after' };
    },
    auto: (S) => (S.traits.bold > .35 || sh(S, 'vo') > .3 ? 'hunt' : 'no') });
  node({ id: 'vg_end', st: ['adult', 'elder'], tree: { body: 'living' }, story: { arc: 'vengeance', at: 'after', wait: [0, 4] }, w: 4,
    run(S, X, a) {
      const kin = a.d.kin === 'cha' ? 'cha' : a.d.kin;
      if (a.o === 'win') return { t: `Bạn mang chiếc nanh của con ${spOf(a).nameVi} ra mộ ${kin}. Đó là lần đầu bạn khóc kể từ năm ấy.`, k: 'big', o: 'win' };
      return { t: `Vết thương lành, nhưng bạn biết mình không đủ sức đi thêm lần nữa. Con dao khắc tên ${kin} nằm trên vách tới cuối đời.`, k: 'bad', o: 'lose' };
    } });

  // ── Tình xưa ──
  node({ id: 'lv_again', st: ['adult', 'elder'], tree: { body: 'flesh' }, story: { arc: 'love', at: 'open', wait: [3, 15] }, w: 3,
    run(S, X, a, p) {
      const me = single(S), them = !p.wed;
      if (me && them) return { t: `Bạn gặp lại ${ref(S, p)} ở đám cưới một người quen. ${first(p)} vẫn cười như hồi ấy.`, k: 'good', o: 'free', to: 'climax' };
      if (!me && !them) { X.add('h', 2); return { t: `${ref(S, p)} vẫn ở vậy. Hôm gặp lại ở chợ phiên, ${first(p)} hỏi thăm ${first(S.family.spouse)} trước khi hỏi thăm bạn.`, k: 'info', o: 'past', to: 'end' }; }
      if (me) { X.add('h', -3); return { t: `${ref(S, p)} giờ đã có gia đình. Đứa con út có đôi mắt giống hệt ${first(p)} năm ấy.`, k: 'info', o: 'past', to: 'end' }; }
      return { t: `Bạn gặp lại ${ref(S, p)} ở chợ phiên, mỗi người dắt theo một đứa con. Hai người chào nhau như người quen thường.`, k: 'info', o: 'past', to: 'end' };
    } });
  dnode('lv_choice', { prio: 8, tree: { body: 'flesh' }, story: { arc: 'love', at: 'climax', wait: [0, 3], to: 'end' },
    when: (S, X, a, p) => single(S) && !p.wed,
    build(S, X, a, p) {
      return { title: 'Chuyện cũ', body: `${first(p)} hỏi bạn có còn nhớ ${a.d.refused ? 'lần bạn từ chối năm ấy' : 'mùa hè năm ấy'} không.`,
        choices: [{ k: 'wed', label: 'Nối lại', sub: 'Thành vợ chồng.' }, { k: 'let', label: 'Để chuyện cũ ngủ yên', sub: '' }] };
    },
    apply(S, X, k, c, a, p) {
      if (k !== 'wed') { X.add('h', -2); return { t: 'Hai người chia tay ở đầu ngõ, lần này không ai hẹn gì.', o: 'let' }; }
      S.family.spouse = { name: p.name, race: p.race, age: G.castYrs(S, p), alive: true }; p.role = 'phoi'; p.how = 'bạn đời của bạn'; p.wed = true;
      S.flags.suitor = null; X.add('h', 12); X.add('so', 6); cnt(S, 'lvWed');
      return { t: 'Đám cưới nhỏ, chỉ mời những người biết chuyện cũ.', o: 'wed' };
    },
    auto: (S) => (S.traits.social > .35 || sh(S, 'gia') > .12 ? 'wed' : 'let') });

  // ── Thầy trò (bạn là trò) ──
  const msTask = a => (a.d.kind === 'craft' ? 'làm lại một món hàng cho tới khi không còn chỗ nào để chê' : 'đứng tấn dưới thác suốt mười ngày');
  node({ id: 'ms_trial', st: ['teen', 'adult'], tree: { body: 'living' }, story: { arc: 'master', at: 'open', wait: [1, 3], to: 'knot' }, w: 3,
    run(S, X, a, p) {
      if (X.rnd() < .4 + .4 * S.traits.studious + .2 * S.traits.bold) { X.addXp(80); return { t: `${first(p)} bắt bạn ${msTask(a)}. Tới ngày thứ chín bạn làm được; thầy không khen, chỉ gật đầu.`, k: 'good', o: 'pass', bond: 10 }; }
      X.add('h', -3); return { t: `${first(p)} bắt bạn ${msTask(a)}. Bạn bỏ cuộc giữa chừng; thầy không mắng, chỉ bắt làm lại từ đầu.`, k: 'info', o: 'fail' };
    } });
  dnode('ms_crisis', { tree: { body: 'living' }, story: { arc: 'master', at: 'knot', wait: [1, 5], to: 'after' },
    build(S, X, a, p) {
      if (a.d.kind !== 'craft' && X.chance(.6)) return { title: 'Thầy bị thách đấu', body: `Một kẻ thù cũ của ${first(p)} tới thách đấu. Thầy đã già, tay cầm kiếm run.`,
        choices: [{ k: 'stand', label: 'Thay thầy ra đấu', sub: 'Đối thủ ngang tầm thầy thời trẻ.' }, { k: 'watch', label: 'Để thầy tự đấu', sub: 'Đó là chuyện của thầy.' }] };
      return { title: 'Thầy lâm bệnh', body: `${first(p)} lâm bệnh nặng giữa mùa đông.`,
        choices: [{ k: 'stay', label: 'Ở lại chăm thầy', sub: 'Mất một năm làm ăn.' }, { k: 'left', label: 'Đi tiếp đường mình', sub: 'Thầy có người nhà.' }] };
    },
    apply(S, X, k, c, a, p) {
      if (k === 'stand') {
        if (X.rnd() < G.clamp(logit(X.power(S) - npcPow(p, -.2)), .15, .85)) { S.fame = Math.min(100, S.fame + 2); p.bond += 30; return { t: 'Bạn thắng. Kẻ kia bỏ đi, không quay lại.', o: 'stood' }; }
        X.add('hl', -10); p.bond += 25; return { t: 'Bạn thua, nhưng kẻ kia cũng không còn sức thách thầy nữa.', o: 'fell' };
      }
      if (k === 'stay') { X.money(-Math.round(med(S, X) * .3)); p.bond += 30; X.add('h', 2); return { t: 'Bạn sắc thuốc, đọc sách cho thầy nghe suốt mùa đông.', o: 'stayed' }; }
      p.bond -= 20; return { t: `Bạn đi. ${k === 'watch' ? 'Thầy thắng, nhưng không nhìn bạn khi bước ra.' : 'Thầy không giữ.'}`, o: 'apart' };
    },
    auto: (S) => (S.traits.social > .45 || S.traits.bold > .55 ? (S.traits.bold > .55 ? 'stand' : 'stay') : 'left') });
  // 'stand' không có ở ca bệnh: auto chọn 'stand' thì choose() rơi về lựa chọn đầu ('stay'), vẫn hợp.
  node({ id: 'ms_end', st: ['teen', 'adult', 'elder'], tree: { body: 'living' }, story: { arc: 'master', at: 'after', wait: [1, 12], dead: true }, w: 3,
    run(S, X, a, p) {
      if (p.alive) { p.alive = false; p.died = S.world.year; }
      if (a.o === 'apart') { X.add('h', -6); return { t: `Bạn nghe tin thầy ${first(p)} mất khi đang ở xa. Bộ bút ký của thầy về tay người khác.`, k: 'bad', o: 'apart' }; }
      const sk = a.d.school ? J.schools[a.d.school].masteries[0] : (G.WORKS[a.d.work] && Object.keys(G.WORKS[a.d.work].trains || {})[0]) || 'Body';
      X.gain(sk, 6); X.addXp(100);
      return { t: `Thầy ${first(p)} mất, để lại cho bạn bộ bút ký ghi chú tới trang cuối.${a.d.kind !== 'craft' ? ' Trang đầu chỉ có một dòng: "Cho đứa dám đứng ra thay ta."' : ''}`, k: 'big', o: 'heir' };
    } });

  // ── Nợ cờ bạc ──
  dnode('gb_collect', { prio: 8, tree: { body: 'living' }, story: { arc: 'debt', at: 'open', wait: [1, 3], to: 'after' },
    build(S, X, a, p) {
      const due = Math.round(a.d.amt * 1.5); a.d.due = due;
      return { title: 'Chủ nợ', body: `Người của ${first(p)} tới đòi ${G.coin(due)}, cả gốc lẫn lãi.`,
        choices: [...(S.gold >= due ? [{ k: 'pay', label: 'Trả', sub: `Mất ${G.coin(due)}.` }] : []),
          { k: 'job', label: `Làm một việc cho ${first(p)}`, sub: 'Chở một kiện hàng, không được hỏi bên trong là gì.' }, { k: 'flee', label: 'Trốn', sub: 'Bỏ đi nơi khác.' }] };
    },
    apply(S, X, k, c, a, p) {
      if (k === 'pay') { X.money(-a.d.due); X.add('h', -4); return { t: 'Bạn trả đủ, không thiếu một đồng.', o: 'paid' }; }
      if (k === 'job') {
        G.trajBump(S, { am: .4 });
        if (X.chance(.2)) { cnt(S, 'crimes'); X.add('so', -6); return { t: 'Lính tuần mở kiện hàng ngay cổng thành. Bạn khai không biết gì; họ ghi tên bạn vào sổ.', o: 'job' }; }
        return { t: 'Bạn chở kiện hàng qua cổng thành. Không ai mở ra xem.', o: 'job' };
      }
      S.flags.migrateQ = 'Chủ nợ đang tìm bạn.'; a.d.loc = S.loc; return { t: 'Bạn gói ghém đồ đạc trong đêm.', o: 'fled' };
    },
    auto(S, X, d) { if (d.choices.some(c => c.k === 'pay')) return 'pay'; return S.traits.bold > .6 ? 'flee' : 'job'; } });
  node({ id: 'gb_end', st: ['teen', 'adult', 'elder'], tree: { body: 'living' }, story: { arc: 'debt', at: 'after', wait: [1, 8], dead: true }, w: 3,
    run(S, X, a, p) {
      if (a.o === 'paid') return { t: 'Bạn thề không đụng tới xúc xắc nữa. Lời thề giữ được gần hết đời.', k: 'info', o: 'paid' };
      if (a.o === 'job') { G.trajBump(S, { am: .2 }); X.money(Math.round(med(S, X) * .3)); return { t: `${first(p)} lại ghé, lần này với một "việc nhỏ" khác. Bạn hiểu mình sẽ chẳng bao giờ trả xong.`, k: 'bad', o: 'tied' }; }
      if (S.loc !== a.d.loc) return { t: `Ở ${regName(S.loc)}, bạn vẫn giật mình mỗi lần có người lạ hỏi tên.`, k: 'info', o: 'fled' };
      X.add('hl', -15); X.cond('wound'); X.money(-Math.min(Math.max(0, S.gold), a.d.due || 0));
      return { t: `Người của ${first(p)} tìm được bạn trong một con hẻm.`, k: 'bad', o: 'beaten' };
    } });

  // ── Bí mật ──
  dnode('sc_choice', { prio: 8, tree: { body: 'living' }, story: { arc: 'secret', at: 'open', wait: [0, 2], to: 'after' },
    build(S, X, a, p) {
      return { title: 'Điều đã thấy', body: `Chuyện đêm ấy vẫn nằm trong bụng bạn. ${first(p)} hình như cũng biết bạn đã thấy.`,
        choices: [{ k: 'expose', label: 'Tố giác', sub: 'Người ta có thể tin, cũng có thể không.' }, { k: 'black', label: 'Đòi tiền để im lặng', sub: 'Có tiền ngay; kẻ bị tống tiền không bao giờ quên.' }, { k: 'silent', label: 'Im lặng', sub: '' }] };
    },
    apply(S, X, k, c, a, p) {
      if (k === 'expose') {
        if (X.rnd() < .3 + .15 * G.standing(S, X).soc + S.fame / 200) { S.fame = Math.min(100, S.fame + 4); X.add('so', 5); return { t: 'Phủ cho người xuống tra. Lời bạn khớp với sổ sách.', o: 'exposed' }; }
        X.add('so', -5); X.add('h', -5); return { t: 'Không ai tin bạn.', o: 'backfire' };
      }
      if (k === 'black') { const g = Math.round(med(S, X) * 1.2); X.money(g); G.trajBump(S, { am: .3 }); return { t: `${first(p)} trả ${G.coin(g)}, không nhìn vào mắt bạn.`, o: 'black' }; }
      return { t: 'Bạn không nói với ai.', o: 'silent' };
    },
    auto(S) { const T = S.traits; if (T.pious > .6 || T.bold > .7) return 'expose'; if (sh(S, 'am') + sh(S, 'thuong') > .2) return 'black'; return 'silent'; } });
  node({ id: 'sc_end', st: ['adult', 'elder'], tree: { body: 'living' }, story: { arc: 'secret', at: 'after', wait: [1, 10] }, w: 3,
    run(S, X, a, p) {
      if (a.o === 'exposed') { p.tier = 0; return { t: `${first(p)} bị cách chức. Dân làng mời bạn rượu, nhưng từ đó cũng có người đi đường vòng để khỏi phải chào bạn.`, k: 'good', o: 'exposed' }; }
      if (a.o === 'backfire') { const f = Math.round(med(S, X) * .3); X.money(-f); return { t: `${first(p)} vẫn ngồi ghế cũ. Bạn bị gọi lên phủ hỏi chuyện ba lần, lần nào cũng mất tiền trà nước, cộng lại ${G.coin(f)}.`, k: 'bad', o: 'backfire' }; }
      if (a.o === 'silent') { X.add('h', 4); X.money(Math.round(med(S, X) * .3)); return { t: `${first(p)} lên chức, gặp bạn ở đâu cũng gật đầu chào. Năm có lệnh bắt phu, tên bạn không có trong danh sách.`, k: 'good', o: 'favor', bond: 15 }; }
      const pw = G.clamp(logit(X.power(S) - npcPow(p, .2)), .2, .9);
      if (X.rnd() < pw) { X.money(Math.round(med(S, X) * .5)); return { t: `${first(p)} gửi người tới. Bạn tỉnh giấc với lưỡi dao kề cổ, vặn được tay hắn. Sáng ra ${first(p)} gửi thêm một bao tiền, không kèm lời nào.`, k: 'good', o: 'win', bond: -10 }; }
      X.add('hl', -18); X.cond('wound'); X.money(-Math.round(Math.max(0, S.gold) * .5));
      return { t: `${first(p)} gửi người tới. Bạn tỉnh giấc với lưỡi dao kề cổ; họ lấy lại số tiền cũ, cả lãi, và để lại một vết sẹo.`, k: 'bad', o: 'lose', bond: -10 };
    } });

  // ── Mộng ước ──
  node({ id: 'id_meet', st: ['adult', 'elder'], tree: { body: 'living' }, story: { arc: 'idol', at: 'open', wait: [4, 20], dead: false }, w: 3,
    run(S, X, a, p) {
      const T = X.ctier(S);
      if (T >= 1 && T >= p.tier) { S.fame = Math.min(100, S.fame + 3); X.add('h', 10); return { t: `Bạn gặp lại ${ref(S, p)} ở ${capName(S)}. Giờ bạn đã là ${G.tierName(T)}, ngang hàng với người từng là giấc mơ của mình. ${first(p)} nhận ra đứa nhóc năm xưa và bật cười.`, k: 'big', o: 'surpass', bond: 20 }; }
      if (p.drive < .7 || G.castYrs(S, p) > G.RACES[p.race].le * .7) { X.add('h', -4); return { t: `Bạn gặp lại ${refE(S, p)}, giờ ngồi một góc quán, một bên là chân gỗ. ${first(p)} không nhớ bạn. Bạn trả tiền rượu cho cả bàn.`, k: 'info', o: 'fallen' }; }
      const sk = a.d.school ? J.schools[a.d.school].masteries[0] : 'Body'; X.gain(sk, 4); X.addXp(120);
      return { t: `Bạn gặp lại ${refE(S, p)}. Nghe chuyện ba ngày lẽo đẽo năm xưa, ${first(p)} cười to rồi chỉ cho bạn một thế ${G.mv(sk).toLowerCase()}.`, k: 'good', o: 'taught', bond: 20 };
    } });

  // ── Ruột thịt ──
  dnode('kn_help', { prio: 8, tree: { body: 'living' }, story: { arc: 'kin', at: 'open', wait: [0, 2], to: 'after' },
    build(S, X, a, p) {
      const cost = Math.round(med(S, X) * .8); a.d.cost = cost;
      return { title: 'Thư nhà', body: `${first(p)} cần người giúp. Chuyện này cần chừng ${G.coin(cost)}.`,
        choices: [{ k: 'help', label: 'Gửi tiền, về tận nơi', sub: `Mất ${G.coin(cost)} và một chuyến đi.` }, { k: 'no', label: 'Chỉ gửi lời thăm', sub: 'Nhà mình cũng chẳng dư.' }] };
    },
    apply(S, X, k, c, a, p) {
      if (k === 'help') { X.money(-a.d.cost); X.add('h', 4); p.bond += 30; return { t: `Bạn về tới nơi, ${first(p)} ôm bạn khóc như hồi hai đứa còn bé.`, o: 'help' }; }
      p.bond -= 40; return { t: 'Thư trả lời của nhà ngắn hơn mọi lần.', o: 'no' };
    },
    auto: (S, X, d) => (S.traits.social > .3 || sh(S, 'gia') > .12 ? 'help' : 'no') });
  node({ id: 'kn_end', st: ['adult', 'elder'], tree: { body: 'living' }, story: { arc: 'kin', at: 'after', wait: [2, 10] }, w: 3,
    run(S, X, a, p) {
      if (a.o === 'help') { const g = Math.round((a.d.cost || 20) * .8); X.money(g); X.add('h', 5); return { t: a.d.type === 'debt' ? `${first(p)} trả lại bạn số tiền năm ấy, gói trong chiếc khăn tay của mẹ.` : `Mùa gặt nào ${first(p)} cũng gửi lên một xe lúa, không đợi bạn hỏi. Năm nay nó đáng ${G.coin(g)}.`, k: 'good', o: 'close', bond: 10 }; }
      X.add('so', -4); return { t: `Đám giỗ trong nhà, ${first(p)} không ngồi cùng mâm với bạn. Từ đó hai nhà thôi qua lại.`, k: 'bad', o: 'rift' };
    } });

  // ── Bạn thân ──
  node({ id: 'fr_part', st: ['teen', 'adult'], tree: { body: 'living' }, story: { arc: 'friend', at: 'open', wait: [3, 12], to: 'after' }, w: 2,
    run(S, X, a, p) {
      const r = X.pick(G.REGIONS.filter(r => r.id !== S.loc)); p.loc = r.id;
      return { t: `${ref(S, p)} theo một đoàn buôn đi ${r.nameVi}. Hôm tiễn, hai người hứa sẽ viết thư.`, k: 'info', o: 'part' };
    } });
  node({ id: 'fr_reunion', st: ['adult', 'elder'], tree: { body: 'living' }, story: { arc: 'friend', at: 'after', wait: [4, 20] }, w: 2.5,
    run(S, X, a, p) {
      const nw = newsOf(p), w = workVi(p);
      X.add('so', 6); X.add('h', 6);
      return { t: `Bạn gặp lại ${refE(S, p)}${w ? `, giờ làm ${w}` : ''}${p.tier ? `, đã là ${G.tierName(p.tier)}` : ''}${p.wed ? ', đã có vợ có chồng' : ''}. Hai người uống tới sáng, kể lại những trận đòn hồi bé như kể chiến công.`, k: 'good', o: 'reunion', bond: 20 };
    } });

  // ── Người mất tích (bạn đồng hành không về) ──
  node({ id: 'ls_return', st: ['adult', 'elder'], tree: { body: 'living' }, story: { arc: 'lost', at: 'open', wait: [3, 14] }, w: .5,
    run(S, X, a, p) { p.missing = false; X.add('h', 10); return { t: `${first(p)}, người bạn đồng hành ai cũng tưởng đã chết, gõ cửa nhà bạn. Một bên mắt đã mất; câu chuyện thì dài lắm.`, k: 'big', o: 'back', bond: 20 }; } });

  // ── Kẻ săn (Bộ Xương) ──
  node({ id: 'hn_return', st: ['adult', 'elder'], undead: true, tree: { body: 'undead' }, story: { arc: 'hunter', at: 'open', wait: [2, 6], to: 'knot' }, w: 3,
    run(S, X, a, p) {
      p.tier = Math.max(p.tier, X.ctier(S));
      if (X.rnd() < G.clamp(logit(X.power(S) - npcPow(p, 0)), .2, .85)) { S.fame = Math.min(100, S.fame + 2); return { t: `${ref(S, p)} quay lại, lần này mang theo ba người và một lọ nước thánh. Bạn đánh lui cả bốn; ${first(p)} là người rút cuối cùng.`, k: 'good', o: 'held' }; }
      X.cond('crack'); X.add('hl', -10);
      return { t: `${ref(S, p)} quay lại, lần này mang theo ba người và một lọ nước thánh. Bạn mất một cánh tay xương, phải lội qua đầm mới thoát.`, k: 'bad', o: 'hurt' };
    } });
  dnode('hn_end', { tree: { body: 'undead' }, story: { arc: 'hunter', at: 'knot', wait: [2, 8], to: 'after' },
    build(S, X, a, p) {
      p.tier = Math.max(p.tier, X.ctier(S));
      return { title: 'Thánh Kỵ Sĩ', body: `${first(p)} giờ là ${G.tierName(p.tier)}, đứng một mình trước cửa hầm: "Lần này không ai cản."`,
        choices: [{ k: 'fight', label: 'Đấu tới cùng', sub: 'Thua thì có thể bị thanh tẩy.' }, ...(S.sm >= 25 ? [{ k: 'talk', label: 'Nói chuyện', sub: 'Kể cho người đó nghe bạn từng là ai.' }] : []), { k: 'flee', label: 'Bỏ đi nơi khác', sub: '' }] };
    },
    apply(S, X, k, c, a, p) {
      if (k === 'fight') {
        if (X.rnd() < G.clamp(logit(X.power(S) - npcPow(p, -.1)), .15, .85)) { p.alive = false; p.died = S.world.year; S.fame = Math.min(100, S.fame + 5); return { t: `Bạn đặt thanh kiếm gãy của ${first(p)} lên ngực người đó rồi lấp đất.`, o: 'slain' }; }
        if (X.chance(.2)) { X.die({ id: 'purge', text: `bị Thánh Kỵ Sĩ ${first(p)} thanh tẩy` }); return null; }
        X.cond('crack'); return { t: 'Bạn vỡ nửa xương sườn, lăn xuống vực mới thoát.', o: 'beaten' };
      }
      if (k === 'talk') {
        if (X.rnd() < .3 + S.sm / 150 + .3 * S.traits.social) { p.bond = 20; p.role = 'ban'; return { t: `${first(p)} nghe hết, rồi tra kiếm vào vỏ.`, o: 'truce' }; }
        X.cond('crack'); return { t: `${first(p)} không nghe. Bạn chỉ kịp chạy.`, o: 'beaten' };
      }
      S.flags.migrateQ = 'Thánh Kỵ Sĩ biết chỗ của bạn.'; return { t: 'Bạn rời hầm trong đêm.', o: 'fled' };
    },
    auto(S, X, d, a, p) { if (d.choices.some(c => c.k === 'talk') && S.traits.social > .25) return 'talk'; return p && X.power(S) >= npcPow(p, -.3) ? 'fight' : 'flee'; } });
  node({ id: 'hn_after', st: ['adult', 'elder'], undead: true, tree: { body: 'undead' }, story: { arc: 'hunter', at: 'after', wait: [1, 8], dead: true }, w: 3,
    run(S, X, a, p) {
      if (a.o === 'truce') { X.add('h', 8); return { t: `${first(p)} để ở cửa hầm một bình dầu thánh đã cạn phép, và không bao giờ quay lại với kiếm.`, k: 'good', o: 'truce' }; }
      if (a.o === 'slain') { X.cond('hunted'); return { t: `Giáo hội Quang Minh treo giải cho cái đầu lâu đã giết ${first(p)}.`, k: 'bad', o: 'slain' }; }
      if (a.o === 'fled') return { t: 'Bạn ở một nghĩa địa khác. Đêm nào cũng nghe ngóng tiếng vó ngựa.', k: 'info', o: 'fled' };
      return { t: `${first(p)} kể khắp vùng đã thanh tẩy được bạn. Người ta tin, nên mấy năm liền không ai tới đào nữa.`, k: 'info', o: 'beaten' };
    } });

  // ── Bộ Xương: đứa bé tặng hoa lớn lên (sk_child, events.js) ──
  patch('sk_child', (S, X, r) => {
    if ((S.arcs || []).some(a => a.k === 'flower')) return;
    const p = G.castAdd(S, X, { race: X.chance(.8) ? 'human' : X.wkey(X.reg(S).races), role: 'ban', how: 'đứa bé từng đặt hoa vào hốc mắt bạn', yrs: X.int(5, 8), bond: 30, drive: X.rnd() });
    r.t = r.t.replace('Một đứa bé không sợ bạn.', `Một đứa bé không sợ bạn. Người ta gọi nó là ${first(p)}.`);
    G.arcOpen(S, X, 'flower', p, {});
  });
  node({ id: 'fl_grown', st: ['adult', 'elder'], undead: true, tree: { body: 'undead' }, story: { arc: 'flower', at: 'open', wait: [3, 10], to: 'after' }, w: 3,
    c: (S, X, a, p) => G.castYrs(S, p) >= G.RACES[p.race].adult,
    run(S, X, a, p) { X.add('h', 10); X.add('hl', 4); return { t: `${first(p)}, đứa bé năm nào, giờ đã lớn, lên đồi tìm bạn. Nó mang theo dầu thắp, vải, và cả một bó hoa dại như hồi bé.`, k: 'good', o: 'grown', bond: 20 }; } });
  node({ id: 'fl_end', st: ['adult', 'elder'], undead: true, tree: { body: 'undead' }, story: { arc: 'flower', at: 'after', wait: [2, 10] }, w: 3,
    run(S, X, a, p) {
      if (G.standing(S, X).soc < 1 && (S.flags.revealed || X.chance(.5))) {
        const c = S.conds.find(c => c.id === 'hunted'); if (c) S.conds.splice(S.conds.indexOf(c), 1);
        return { t: `Khi dân làng kéo đuốc lên đồi, ${first(p)} đứng chắn trước cửa hầm: "Muốn vào thì bước qua tôi." Đám đuốc tản dần.`, k: 'big', o: 'guard', bond: 20 };
      }
      X.add('h', 8); return { t: `${first(p)} dắt con lên đồi, chỉ vào bạn: "Ông ấy là bạn của mẹ." Đứa nhỏ không sợ, y như mẹ nó ngày trước.`, k: 'good', o: 'kin', bond: 10 };
    } });
  // ── Bộ Xương: đoàn lữ khách hay bỏ chạy (sk_flee) dần quen mặt bạn; lần thứ ba thì thành mối buôn ──
  patch('sk_flee', (S, X, r) => {
    let p = (S.cast || []).find(x => x.caravan);
    if (!p) { if (!X.chance(.5)) return; p = G.castAdd(S, X, { race: 'human', role: 'on', how: 'chủ đoàn lữ khách hay đi qua nghĩa địa', yrs: X.int(30, 45), work: 'merchant', bond: 0, drive: .5 }); p.caravan = 1;
      r.t = `Một đoàn lữ khách thấy bạn và bỏ chạy, để lại cả nồi cháo đang sôi. Người chạy sau cùng là chủ đoàn, ${first(p)}.`; lk(S, X, p, 5); return; }
    p.caravan++; lk(S, X, p, 10);
    if (p.caravan === 2) { r.t = `Lại là đoàn của ${first(p)}. Lần này họ chỉ dạt sang bên đường, đi chậm qua, không ai bỏ chạy.`; r.k = 'info'; X.add('h', 6); return; }
    r.t = `${first(p)} dừng xe ở chân đồi, đặt xuống một thùng dầu và hai tấm vải, rồi chờ. Bạn để lại mấy món đồ cổ nhặt trong mộ. Từ đó mỗi mùa đoàn ${first(p)} đều ghé.`;
    r.k = 'good'; X.add('h', 10); X.money(X.int(5, 15)); if (p.caravan > 3) r.t = `Đoàn của ${first(p)} ghé như mọi mùa. Hai bên đổi hàng, ${first(p)} kể chuyện dưới xuôi.`;
  });

  // ── Lời bà đồng ──
  node({ id: 'pr_year', st: ['adult', 'elder'], tree: { body: 'living' }, story: { arc: 'prophecy', at: 'open', wait: [0, 999], to: 'after' }, w: 10,
    c: (S, X, a) => X.years(S) >= a.d.y && X.years(S) < a.d.y + X.R(S).ypt * 2,
    run(S, X, a) { X.add('h', -3); return { t: `Năm nay bạn ${X.years(S)} tuổi, đúng năm bà đồng mù nói. Bạn đi đâu cũng nhìn trước ngó sau.`, k: 'info', o: 'year' }; } });
  node({ id: 'pr_after', st: ['adult', 'elder'], tree: { body: 'living' }, story: { arc: 'prophecy', at: 'after', wait: [1, 3] }, w: 6,
    run(S, X) { X.add('h', 8); return { t: 'Bạn sống qua năm bà đồng nói. Bạn mua một vò rượu ngon, uống một mình, cười một mình.', k: 'good', o: 'survived' }; } });

  // ═════════ 6. Gặp lại người quen (sự kiện ngẫu nhiên đọc dàn nhân vật) ═════════
  const knows = (S, p) => Math.abs(p.bond) >= 10 || (S.arcs || []).some(a => a.who === p.id);
  const withNews = S => (S.cast || []).filter(p => p.news.length && !p.missing && knows(S, p) && S.age - p.seen >= 1 && p.role !== 'phoi');
  const visitors = S => (S.cast || []).filter(p => p.alive && !p.missing && p.bond >= 25 && p.loc === S.loc && S.age - p.seen >= 2 && p.role !== 'phoi');
  const foes = S => (S.cast || []).filter(p => p.alive && !p.missing && p.bond <= -30 && p.loc === S.loc && S.age - p.seen >= 2);
  opener({ id: 'cm_news', st: ['teen', 'adult', 'elder'], w: S => (withNews(S).length ? 3 : 0), rep: true, gap: 1, tree: { body: 'living' },
    run(S, X) {
      const p = X.pick(withNews(S)), dead = !p.alive, nw = newsOf(p);
      p.heard = S.age; X._lk = true; X._tag = 'Người quen · ' + first(p);
      if (dead) X.add('h', p.bond > 0 ? -4 : 1); else X.add('h', p.bond > 0 ? 2 : -1);
      return { t: `Có tin về ${refE(S, p)}: ${nw}.`, k: dead ? 'bad' : 'info' };
    } });
  opener({ id: 'cm_visit', st: ['adult', 'elder'], w: S => (visitors(S).length ? 2.5 : 0), rep: true, gap: 2, tree: { body: 'living' },
    run(S, X) {
      const p = X.pick(visitors(S)), nw = newsOf(p); touch(S, X, p, 5); X._tag = 'Người quen · ' + first(p); X.add('so', 4); X.add('h', 4);
      return { t: `${ref(S, p)} ghé chơi, mang theo ${X.pick(['một vò rượu', 'con cá vừa câu', 'một bọc bánh', 'tin tức dưới xuôi'])}.${nw ? ` ${first(p)} ${nw}.` : ''} Hai người ngồi tới khuya.`, k: 'good' };
    } });
  opener({ id: 'cm_glare', st: ['adult', 'elder'], w: S => (foes(S).length ? 1.5 : 0), rep: true, gap: 2, tree: { body: 'living' },
    run(S, X) {
      const p = X.pick(foes(S)); touch(S, X, p, -3); X._tag = 'Người quen · ' + first(p); X.add('h', -2);
      if (p.tier >= 1 && X.chance(.5)) { const g = Math.round(Math.min(Math.max(0, S.gold) * .1, med(S, X) * .4)); X.money(-g); return { t: `${ref(S, p)} tung tin bạn ăn gian cân. Khách bỏ đi một nửa; bạn mất ${G.coin(g)} cả mùa.`, k: 'bad' }; }
      return { t: `Bạn chạm mặt ${ref(S, p)} ở chợ. Không ai nhường đường ai.`, k: 'info' };
    } });
  // Người quen tốt tới giúp lúc bạn khốn khó (ốm nặng, hết tiền).
  const helpers = S => (S.cast || []).filter(p => p.alive && !p.missing && p.bond >= 30 && p.role !== 'phoi' && S.age - p.seen >= 1);
  opener({ id: 'cm_help', st: ['teen', 'adult', 'elder'], w: (S, X) => (helpers(S).length && (S.hl < 45 || S.gold < 0 || S.h < 30) ? 4 : 0), rep: true, gap: 3, tree: { body: 'living' },
    run(S, X) {
      const p = X.pick(helpers(S)); touch(S, X, p, 8); X._tag = 'Người quen · ' + first(p);
      if (S.gold < 0) { const g = Math.round(med(S, X) * .5); X.money(g); return { t: `${ref(S, p)} nghe tin bạn túng, gửi tới ${G.coin(g)}, dặn khi nào có hẵng trả.`, k: 'good' }; }
      if (S.hl < 45) { X.add('hl', 8); return { t: `${ref(S, p)} nghe tin bạn ốm, vượt mấy ngày đường mang thuốc tới.`, k: 'good' }; }
      X.add('h', 8); return { t: `${ref(S, p)} ở lại với bạn mấy hôm, không hỏi gì, chỉ ngồi cùng.`, k: 'good' };
    } });

  // Sự kiện thường gặp có người quen xuất hiện (khi trong dàn có người hợp): đời liền mạch hơn, sự kiện vẫn bốc như cũ.
  const pal = (S, X, f) => { const L = (S.cast || []).filter(p => p.alive && !p.missing && p.role !== 'phoi' && f(p)); return L.length ? X.pick(L) : null; };
  const lk = (S, X, p, d) => { touch(S, X, p, d); X._tag = 'Người quen · ' + first(p); };
  patch('ch_festival', (S, X, r) => {
    const p = X.chance(.6) && pal(S, X, p => (p.role === 'ban' || p.role === 'tinh') && p.bond >= 20 && p.loc === S.loc); if (!p) return;
    r.t = r.t.replace('Bạn nhảy tới khi', `Bạn nhảy với ${first(p)} tới khi`); lk(S, X, p, 5);
  });
  patch('ch_hunger', (S, X, r) => {
    const p = X.chance(.6) && pal(S, X, p => p.bond >= 20 && p.loc === S.loc); if (!p) return;
    r.t += ` Nhà ${first(p)} chia cho nhà bạn nửa bao lúa.`; X.add('hl', 4); lk(S, X, p, 8);
  });
  patch('el_aches', (S, X, r) => {
    const p = X.chance(.5) && pal(S, X, p => p.bond >= 20); if (!p) return;
    r.t += ` ${first(p)} ghé thăm, mang theo một chai rượu thuốc và chuyện ngày xưa.`; X.add('h', 4); lk(S, X, p, 4);
  });
  patch('ad_restless', (S, X, r) => {
    const p = X.chance(.6) && pal(S, X, p => p.bond >= 20 && p.loc !== S.loc); if (!p) return;
    r.t += ` Thư của ${first(p)} từ ${regName(p.loc)} nằm trên bàn đã mấy tháng.`; lk(S, X, p, 2);
  });
  patch('ad_bounty_post', (S, X, r) => {
    const p = X.chance(.5) && pal(S, X, p => p.bond >= 20 && FIGHTER[p.work] && p.loc === S.loc); if (!p) return;
    r.t += ` ${first(p)} gõ ngón tay lên tờ lệnh, nhìn bạn.`; lk(S, X, p, 3);
  });
  patch('ch_raid', (S, X, r) => {
    if (r.t.includes('không chạy kịp')) return;
    const p = X.chance(.5) && pal(S, X, p => p.bond >= 20 && p.loc === S.loc); if (!p) return;
    r.t = r.t.replace('Cả nhà trốn trong hầm rượu tới sáng.', `${first(p)} kéo cả nhà bạn xuống hầm rượu nhà mình, ở tới sáng.`); lk(S, X, p, 6);
  });
  patch('ad_tax', (S, X, r) => {
    const p = pal(S, X, p => p.work === 'steward' && p.tier >= 1 && Math.abs(p.bond) >= 20 && p.loc === S.loc); if (!p) return;
    const g = Math.round(med(S, X) * .2);
    if (p.bond > 0) { X.money(g); r.t += ` Người thu năm nay là ${first(p)}; phần nhà bạn được gạch bớt một dòng.`; }
    else { X.money(-g); r.t += ` Người thu năm nay là ${first(p)}; phần nhà bạn nặng hơn nhà bên cạnh ${G.coin(g)}.`; }
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
    { id: 'close', ph: ['elder', 'skE'], q: () => 'Khép lại chuyện cũ', w: S => ((S.arcs || []).filter(isActive).length ? 3 : 0), ok: (S, X, c) => !(S.arcs || []).some(a => c.open0.includes(a.k + ':' + a.who)) },
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
    X._tag = null;
    X.log(`Khép chương ${G.PHASE_VI[c.ph].toLowerCase()} (${span}). ${c.q}: ${res}.${ends.length ? ` Chuyện đã khép: ${ends.join('; ')}.` : ''}`, 'chapter');
  }
  function chapOpen(S, X, ph) {
    const cand = G.CHAPTERS.filter(c => c.ph.includes(ph)).map(c => ({ c, w: Math.max(0, c.w(S, X)) })).filter(x => x.w > 0);
    if (!cand.length) return;
    const C = X.wpick(cand, 'w').c, a = mainArc(S);
    const c = { id: C.id, ph, t0: S.age, y0: X.years(S), q0: S.q, tier0: X.ctier(S), soc0: G.standing(S, X).soc, sm0: S.sm, edu0: G.eduLv(S),
      trips0: (S.flags.trips || 0) + (S.flags.voyages || 0), loc0: S.loc, open0: (S.arcs || []).filter(isActive).map(a => a.k + ':' + a.who),
      arc: C.arc && a ? { k: a.k, who: a.who, d: a.d } : null };
    c.q = C.q(S, X, c);
    S.chap = c;
    X.log(`Chương ${G.PHASE_VI[ph].toLowerCase()}: ${c.q}.`, 'chapter');
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
  for (const e of G.EVENTS) {
    if (e._story) continue; e._story = true;
    const w0 = e.w, r0 = e.run, m = G.treeMeta(e.id), child = !!(m && m.from);
    e.w = keep((S, X) => { const w = typeof w0 === 'function' ? w0(S, X) : w0; return w * (1 + G.STORY.chapBoost * fitChap(S, m)); }, w0);
    e.run = keep(function (S, X) {
      X._tag = null; X._lk = false;
      const r = r0.call(this, S, X);
      if (r && !S.dead) {
        const lk = X._lk || child; cnt(S, 'stEv'); if (lk) cnt(S, 'stLink');
        const Z = G.STORY.stats && G.STORY_STATS; if (Z) { Z.ev++; if (lk) Z.link++; }
      }
      return r;
    }, r0);
  }
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
      if (L.length) this.log(`Người ta nhớ về ${S.name.split(' ')[0]} qua mấy chuyện: ${L.slice(0, 5).join('; ')}.`, 'chapter');
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
