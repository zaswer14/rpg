/* Vạn Kiếp — HỌC VIỆN VÀ SƯ ĐỒ (docs/03 mục 5.9).
 * Học viện 3 cấp, đều tự chọn và tốn học phí:
 *   Sơ cấp   tuổi thơ ấu, khu có trường (Trường làng, Trường, Học viện) trong tỉnh nhà; 4 lượt
 *   Trung cấp thiếu niên, đã xong sơ cấp, Hiểu biết ≥ 25, qua kỳ thi; thành phố hoặc kinh đô; 3 lượt
 *   Cao cấp   thiếu niên hoặc mới trưởng thành, đã xong trung cấp, Hiểu biết ≥ 45, qua kỳ thi; chỉ Học viện ở kinh đô; 3 lượt; chọn ngành
 * Ai trả học phí: gia đình (ngân sách theo tầng lớp, cha mẹ còn sống), không thì tự trả, không nữa thì học bổng (giỏi và chăm).
 * Sư đồ: được một thợ lành nghề (dạy một sinh kế) hoặc một cao thủ (dạy một trường phái, phải qua thử tay) nhận làm đệ tử vài lượt;
 * hoặc tự nhận đệ tử khi tinh thông một kỹ năng (≥ 50).
 * Trạng thái: S.edu = { lv, cur: { lv, school, y, need, payer, track }, track }, S.mentor = { … }, S.disciples = [ … ].
 */
window.LifeSim = window.LifeSim || {};
(function (G) {
  const J = window.JobLibrary;
  G.EDU_VI = ['chưa đi học', 'sơ cấp', 'trung cấp', 'cao cấp'];
  // need: số lượt; fee: học phí mỗi lượt × trung vị thu nhập vùng; sm: Hiểu biết tối thiểu; tiers: bậc khu có trường đủ dạy cấp này.
  G.EDU = [null,
    { nameVi: 'Sơ cấp',    need: 4, fee: .25, sm: 0,  exam: false, tiers: ['town', 'city', 'capital'], gain: 2.5 },
    { nameVi: 'Trung cấp', need: 3, fee: .8,  sm: 25, exam: true,  tiers: ['city', 'capital'],         gain: 3.5 },
    { nameVi: 'Cao cấp',   need: 3, fee: 2, sm: 45, exam: true,  tiers: ['capital'],                 gain: 4.5 }
  ];
  // Ngành ở cao cấp: mỗi lượt rèn các kỹ năng của ngành; Văn chính, Thương mại thêm thu nhập nghề trí óc.
  G.TRACKS = {
    vo:    { nameVi: 'Võ bị',     schools: ['combat', 'ranged'] },
    phap:  { nameVi: 'Pháp thuật', schools: ['arcane'] },
    y:     { nameVi: 'Y dược',    masteries: ['Alchemy', 'Spirit'] },
    van:   { nameVi: 'Văn chính', masteries: [] },
    co:    { nameVi: 'Cơ khí',    schools: ['craft'] }
  };
  // Trường phái học viện cao cấp dạy tới Tier 3 theo ngành (js/cult.js teachList); ngành chỉ ghi mastery thì lấy trường phái của mastery.
  G.trackSchools = id => { const T = G.TRACKS[id]; return !T ? [] : T.schools || [...new Set((T.masteries || []).map(m => G.MASTERY[m]))]; };
  // Ngân sách học của gia đình mỗi lượt, theo tầng lớp (× trung vị): nhà giàu cho con học tới cao cấp dễ dàng.
  const FAMILY = [0, .05, .3, 1, 3, 9];
  const edu = S => S.edu || (S.edu = { lv: 0, cur: null, track: null });
  const flag = (S, k, v = 1) => { S.flags[k] = (S.flags[k] || 0) + v; };
  const share = (S, f) => (S.focusTime[f] || 0) / (Object.values(S.focusTime).reduce((a, b) => a + b, 0) || 1);
  const parentsAlive = S => S.family.parents.some(p => p.alive);
  G.familyBudget = (S, X) => (parentsAlive(S) && !S.undead ? FAMILY[S.q] * G.median(X.reg(S)) : 0);
  // Trường dạy được cấp lv gần nhà nhất: khu nhà, không có thì khu trong tỉnh, không nữa thì kinh đô của nước (đi học xa: học phí × 1,5).
  G.schoolFor = (S, lv) => {
    const R = G.realm, L = G.EDU[lv], home = S.home && G.SET[S.home.settlement];
    const ok = s => s && s.tier !== 'ruin' && L.tiers.includes(s.tier) && (s.bld || []).includes('school');
    if (ok(home)) return { s: home, far: false };
    const prov = home ? home.province : -1;
    const near = R.settlements.filter(s => ok(s) && prov >= 0 && s.province === prov).sort((a, b) => b.urban - a.urban)[0];
    if (near) return { s: near, far: true };
    const n = S.nation != null ? R.nations[S.nation] : null, cap = n && G.SET[n.capital];
    if (ok(cap)) return { s: cap, far: true };
    return null;
  };
  // Học bổng: ít suất, chỉ cho người rất giỏi và rất chăm; bốc một lần cho mỗi cấp (không xin lại mỗi năm).
  G.grantOK = (S, X, lv) => { const F = S.flags, k = 'grantTry' + lv; if (F[k] == null) F[k] = S.sm >= G.EDU[lv].sm + [0, 10, 20, 25][lv] && S.traits.studious > [0, .5, .6, .75][lv] && X.chance([0, .6, .45, .4][lv]) ? 1 : 0; return F[k] === 1; };
  G.eduFee = (S, X, lv, far) => Math.round(G.EDU[lv].fee * G.median(X.reg(S)) * (far ? 1.5 : 1));
  // Kỳ thi: Hiểu biết vượt ngưỡng, chăm học, nhà giàu có thầy kèm.
  G.examChance = (S, lv) => { const L = G.EDU[lv]; return L.exam ? G.clamp(.3 + (S.sm - L.sm) / 50 + S.traits.studious * .3 + (S.q >= 4 ? .1 : 0), .05, .95) : 1; };
  const stageFor = (S, X, lv) => { const st = X.stage(S); return lv === 1 ? st === 'child' && X.years(S) >= X.R(S).adult * .35 : lv === 2 ? st === 'teen' : (st === 'teen' || (st === 'adult' && X.years(S) <= X.R(S).adult * 1.4)); };

  // ═════════ Quyết định: nhập học ═════════
  const DEC = G.DECISIONS;
  DEC.school = {
    prio: 6, gap: 1,
    when(S, X) {
      if (S.undead || G.RACES[S.race].construct) return false;
      const E = edu(S), lv = E.lv + 1;
      return !E.cur && lv <= 3 && stageFor(S, X, lv) && S.sm >= G.EDU[lv].sm && !!G.schoolFor(S, lv) && !(S.flags['eduNo' + lv] >= 2);
    },
    build(S, X) {
      const E = edu(S), lv = E.lv + 1, L = G.EDU[lv], sc = G.schoolFor(S, lv), fee = G.eduFee(S, X, lv, sc.far), fam = G.familyBudget(S, X);
      const payer = fam >= fee ? 'family' : S.gold >= fee * L.need ? 'self' : G.grantOK(S, X, lv) ? 'grant' : null;
      const where = `${sc.s.name}${sc.far ? ' (ở trọ xa nhà)' : ''}`, ex = G.examChance(S, lv);
      const ch = [];
      const how = { family: `gia đình trả ${G.coin(fee)} mỗi năm`, self: `tự trả ${G.coin(fee)} mỗi năm (bạn có ${S.gold})`, grant: 'học bổng: bạn học giỏi nên trường miễn học phí' }[payer];
      if (payer && lv < 3) ch.push({ k: 'go', label: `Vào ${L.nameVi.toLowerCase()} ở ${where}`, sub: `${L.need} năm; ${how}.${L.exam ? ` Phải thi đầu vào, khả năng đỗ ~${Math.round(ex * 100)}%.` : ''}`, payer, fee, school: sc.s.id });
      if (payer && lv === 3) for (const [t, T] of Object.entries(G.TRACKS).slice(0, 5)) ch.push({ k: 'go:' + t, label: `Học viện ${where}, ngành ${T.nameVi}`, sub: `${L.need} năm; ${how}. Thi đầu vào ~${Math.round(ex * 100)}%.`, payer, fee, school: sc.s.id, track: t });
      if (!ch.length) { flag(S, 'eduPoor'); S.recentDec.school = S.age + 1; return null; }
      return { title: lv === 1 ? 'Đi học' : `Lên ${L.nameVi.toLowerCase()}`, body: lv === 1 ? `Trường ở ${sc.s.name} treo bảng nhận học trò mới. Sáng nào đi ngang cổng cũng nghe tiếng đọc bài vọng ra qua khung cửa, đều đều như tiếng mưa.` : `Bạn đã xong ${G.EDU_VI[E.lv]}, mà chữ nghĩa trong đầu cứ thấy còn thiếu. Ở ${sc.s.name} có ${lv === 3 ? 'Học viện' : 'trường'} dạy ${L.nameVi.toLowerCase()}, nghe đồn sách ở đó chất cao tới xà nhà.`,
        choices: [...ch, { k: 'no', label: lv === 1 ? 'Ở nhà phụ việc' : 'Thôi học', sub: lv === 1 ? 'Nhiều đứa trẻ không bao giờ tới trường.' : '' }] };
    },
    apply(S, X, k, c) {
      const E = edu(S), lv = E.lv + 1, L = G.EDU[lv];
      if (k === 'no') { flag(S, 'eduNo' + lv); return lv === 1 ? 'Lũ trẻ trong xóm ôm vở tới trường, còn bạn ở nhà nhóm bếp, gánh nước. Có hôm tiếng đọc bài vẳng tới tận ngõ, bạn đứng nghe một lúc rồi mới đi tiếp.' : 'Bạn gấp sách lại, cất xuống đáy rương. Chữ đã học thì vẫn còn đó. Phần đời còn lại nằm ở ngoài cổng trường.'; }
      if (L.exam && !X.chance(G.examChance(S, lv))) { flag(S, 'eduFail' + lv); flag(S, 'eduNo' + lv); X.add('h', -6); return `Ngày yết bảng, bạn dò tên mình từ đầu tới cuối, rồi dò lại lần nữa. Không có. Bạn trượt kỳ thi ${L.nameVi.toLowerCase()}, và con đường về nhà hôm ấy dài hơn mọi khi.`; }
      E.cur = { lv, school: c.school, y: 0, need: L.need, payer: c.payer, fee: c.fee, track: c.track || null };
      flag(S, 'edu' + lv); if (c.payer === 'grant') flag(S, 'eduGrant');
      return `Buổi đầu tiên, bạn ngồi bàn cuối, ôm khư khư cuốn vở mới còn thơm mùi giấy. Từ nay bạn là học trò ${L.nameVi.toLowerCase()} ở ${G.SET[c.school].name}${c.track ? ', ngành ' + G.TRACKS[c.track].nameVi : ''}. Thầy gọi tên, bạn đứng bật dậy, xô cả ghế.`;
    },
    auto(S, X, d) {
      const T = S.traits, c = d.choices.find(x => x.k !== 'no');
      if (!c) return 'no';
      const lv = edu(S).lv + 1;
      if (c.payer === 'family') { if (lv === 1 ? T.studious > .2 || S.q >= 3 : T.studious > .4 || S.q >= 4) return lv === 3 ? pickTrack(S, d) : c.k; return 'no'; }
      if (c.payer === 'grant') return lv === 3 ? pickTrack(S, d) : c.k;
      return T.studious > .7 && S.gold > c.fee * 6 ? (lv === 3 ? pickTrack(S, d) : c.k) : 'no';
    }
  };
  // Ngành hợp tính: liều thì Võ bị, chăm thì Pháp thuật / Văn chính, mộ đạo thì Y dược.
  function pickTrack(S, d) {
    const T = S.traits, w = { vo: T.bold * 2, phap: T.studious * 1.5, y: T.pious * 1.5, van: T.social + T.studious, co: .8 };
    const best = Object.entries(w).sort((a, b) => b[1] - a[1])[0][0];
    return (d.choices.find(c => c.track === best) || d.choices[0]).k;
  }

  // ═════════ Hệ con "edu": một lượt đi học, sư đồ ═════════
  G.eduYear = function (S, X) {
    const E = edu(S), cur = E.cur, med = G.median(X.reg(S));
    if (cur) {
      const sc = G.SET[cur.school];
      // Trường mất (khu sụp) hoặc không trả nổi học phí: bỏ dở.
      let stop = !sc || sc.tier === 'ruin' ? `trường ở ${sc ? sc.name : '?'} không còn` : null;
      if (!stop && cur.payer !== 'grant') {
        if (cur.payer === 'family' && G.familyBudget(S, X) >= cur.fee) { /* gia đình trả */ }
        else if (S.gold >= cur.fee) { X.money(-cur.fee); cur.payer = 'self'; }
        else stop = 'không còn tiền đóng học phí';
      }
      if (stop) { E.cur = null; flag(S, 'eduDrop'); X.log(`Bạn bỏ dở ${G.EDU[cur.lv].nameVi.toLowerCase()}: ${stop}. Cuốn vở viết dở còn nằm trong tay nải, mấy trang cuối bỏ trắng.`, 'bad'); }
      else {
        const sh = share(S, 'study'), L = G.EDU[cur.lv];
        cur.y += sh >= .25 ? 1 : .5;
        X.add('sm', L.gain * (.5 + sh));
        X.addXp(10 * cur.lv * (.5 + sh));
        if (cur.track) trainTrack(S, X, cur.track, 1 + sh);
        if (cur.y >= cur.need) {
          E.lv = cur.lv; E.cur = null; if (cur.track) E.track = cur.track;
          if (cur.lv >= 3) E.capital = !!(G.isCapital && G.isCapital(cur.school));   // học viện kinh đô dạy tới Tier 4 (js/cult.js)
          // Thủ khoa ngành Võ bị, Pháp thuật ở kinh đô: thầy Thủ Hộ Giả nhận dạy tiếp (Tier 4, js/cult.js); người khác chỉ có học viện cao cấp (Tier 3). Bước F, docs/07 mục 4.14.
          if (cur.lv >= 3 && E.capital && (cur.track === 'vo' || cur.track === 'phap')) { E.top = X.rnd() < G.topP(S); if (E.top) flag(S, 'eduTop'); }
          flag(S, 'grad' + E.lv);
          S.fame = Math.min(100, S.fame + [0, 0, 1, 3][E.lv]);
          X.log(`Ngày ra trường, bạn đứng giữa đám bạn học mà thấy sân trường bỗng nhỏ lại. Bạn tốt nghiệp ${G.EDU[E.lv].nameVi.toLowerCase()} ở ${sc.name}${cur.track ? ', ngành ' + G.TRACKS[cur.track].nameVi : ''}. Tờ giấy chứng nhận được gấp làm tư, cất kỹ dưới đáy rương.`, E.lv >= 2 ? 'big' : 'good');
        }
      }
    }
    // Sư đồ: làm đệ tử.
    const M = S.mentor;
    if (M && !M.done) {
      const sh = share(S, M.kind === 'craft' ? 'work' : 'train') + share(S, 'study') * .3;
      M.y += 1;
      if (M.kind === 'craft') { const W = G.WORKS[M.work]; for (const [m, v] of Object.entries(W.trains)) X.gain(m, v * (1.5 + sh * 2)); if (S.work === M.work) S.pct = Math.min(.99, S.pct + .02 * (1 + sh)); X.add('sm', .5); }
      else { for (const m of J.schools[M.school].masteries) X.gain(m, 2.2 * (1 + sh)); X.addXp(30 * (1 + M.tier) * (.5 + sh)); }
      if (X.chance(.025)) { M.done = true; M.dead = true; X.add('h', -10); X.log(`Sư phụ ${M.name} mất vào một đêm trở gió, khi bạn còn chưa xuất sư. ${M.kind === 'craft' ? 'Đồ nghề của thầy vẫn treo nguyên trên vách' : 'Cây gậy tập của thầy vẫn dựng ở góc sân'}, chẳng ai nỡ động tới. Những điều thầy định dạy nốt, giờ không còn ai để hỏi.`, 'bad'); }
      else if (M.y >= M.need) {
        M.done = true; flag(S, 'mentorDone');
        if (M.kind === 'craft') { S.pct = Math.min(.99, S.pct + .05); X.log(`Hôm bạn xuất sư, ${M.name} lấy bộ đồ nghề trên vách xuống, lau sạch rồi đặt vào tay bạn. Cán gỗ đã mòn nhẵn theo nắm tay thầy. Thầy không nói gì nhiều, chỉ dặn một câu: đừng làm ẩu.`, 'big'); }
        else { const m = X.pick(J.schools[M.school].masteries); X.gain(m, 8); S.fame = Math.min(100, S.fame + 2 + M.tier); X.log(`Đêm cuối, ${M.name} gọi bạn ra sân sau, chỗ không ai nhìn thấy. Thầy diễn thật chậm tuyệt kỹ ${G.mv(m).toLowerCase()}, một lần duy nhất, rồi bắt bạn làm lại tới khi gà gáy. Sáng ra, bạn xuất sư.`, 'big'); }
      }
    }
    // Sư đồ: làm sư phụ. Đệ tử học vài lượt rồi xuất sư; đôi khi thành danh, hiếm khi phản sư môn.
    for (const d of S.disciples || []) {
      if (d.done) continue;
      d.y++;
      X.money(Math.round(med * .15)); S.fame = Math.min(100, S.fame + .3); X.add('so', 1);
      if (d.y >= 5) {
        d.done = true; flag(S, 'discipleDone');
        if (X.chance(.15)) { S.fame = Math.min(100, S.fame + 4); G.histAdd(S.world, 'master', `${d.name}, đệ tử của ${S.name}, thành danh với ${G.mv(d.skill).toLowerCase()}.`); X.log(`Tin về ${d.name} truyền tới tận chợ: người đệ tử ngày nào quỳ trước cửa nhà bạn nay đã thành danh. Người ta kể chuyện trò, rồi hỏi nhau thầy nó là ai. Bạn nghe, làm như không biết, mà khóe miệng cứ nhếch lên.`, 'big'); }
        else if (X.chance(.05)) { X.add('h', -10); S.fame = Math.max(0, S.fame - 2); X.log(`Một sáng, chỗ nằm của ${d.name} lạnh tanh, cuốn bí kíp trong rương cũng mất theo. Bạn đứng ở cửa nhìn con đường mòn còn ướt sương. Giận thì có, mà thương cũng có.`, 'bad'); }
        else X.log(`${d.name} lạy bạn ba lạy rồi khoác tay nải ra đi. Đệ tử xuất sư, sân tập bỗng rộng ra một khoảng.`, 'good');
      }
    }
  };
  function trainTrack(S, X, t, k) {
    const T = G.TRACKS[t], ms = [...(T.masteries || []), ...(T.schools || []).flatMap(s => J.schools[s].masteries)];
    for (const m of ms.length ? [X.pick(ms), X.pick(ms)] : []) X.gain(m, 2.5 * k);
    if (t === 'van') X.add('sm', 1.5 * k);
  }
  { const k = G.SYSTEMS.findIndex(s => s.id === 'career'); G.SYSTEMS.splice(k, 0, { id: 'edu', when: S => !S.dead, run: (S, X) => G.eduYear(S, X) }); }

  // Tỉ lệ đứng đầu khóa cao cấp (ngành Võ bị, Pháp thuật ở kinh đô) theo Hiểu biết, căn cốt.
  G.topP = S => G.clamp(.2 + S.sm / 400 + .05 * (S.tal ? G.RANK[S.tal.root] : 0), .1, .7);

  // ═════════ Sư đồ: được nhận làm đệ tử ═════════
  // Mỗi lượt có thể có người để ý: thợ lành nghề (dạy sinh kế của mình) hoặc cao thủ (Tier 2–4, dạy một trường phái, phải thắng một trận thử tay).
  // Tier cao thủ để ý tới mình: Tier 2 88%, Tier 3 9%, Tier 4 3%; Huyền Thoại Giả không bao giờ tình cờ gặp (docs/09 mục 6.2).
  G.MENTOR_TIER = [[2, .88], [3, .09], [4, .03]];   // bước F (docs/07 mục 4.14): trước là 75 / 20 / 5
  G.mentorTier = X => { let r = X.rnd(); for (const [t, w] of G.MENTOR_TIER) { if ((r -= w) < 0) return t; } return 2; };
  DEC.mentor = {
    prio: 5, gap: 3,
    when(S, X) {
      const st = X.stage(S);
      return !S.undead && (st === 'teen' || (st === 'adult' && X.years(S) <= X.R(S).adult * 1.8)) && (!S.mentor || S.mentor.done) && !S.flags.mentorTaken;
    },
    build(S, X) {
      if (!X.chance(.35)) { S.recentDec.mentor = S.age; return null; }   // không năm nào cũng có người để ý
      const ch = [], race = S.race === 'construct' ? 'dwarf' : S.race, med = G.median(X.reg(S));
      // Thợ lành nghề: sinh kế đang làm, hoặc một nghề làm được ở nơi mình ở.
      const works = [S.work, ...Object.keys(G.WORKS)].filter((w, i, a) => w && a.indexOf(w) === i && !G.WORKS[w].adventurer && G.workOK(S, w));
      if (works.length) {
        const w = S.work && works.includes(S.work) ? S.work : X.pick(works), fee = Math.round(med * .3), nm = X.name(race, X.chance(.5) ? 'm' : 'f');
        ch.push({ k: 'craft', name: nm, label: `Theo ${G.WORKS[w].nameVi.toLowerCase()} ${nm}`, sub: `Thợ lành nghề nhất vùng nhận bạn học việc 4 năm; ${S.gold >= fee ? G.coin(fee) + ' lễ nhập môn' : 'làm không công thay học phí'}.`, kind: 'craft', work: w, fee: S.gold >= fee ? fee : 0, need: 4 });
      }
      // Cao thủ: chỉ để ý người có năng khiếu (một mastery ≥ 15, hoặc level ≥ 10).
      const top = Object.entries(S.mastery).sort((a, b) => b[1] - a[1])[0];
      if (top && (top[1] >= 15 || S.level >= 10)) {
        const school = G.MASTERY[top[0]], tier = G.mentorTier(X), nm = X.name(X.pick(Object.keys(G.RACES).filter(r => !G.RACES[r].undead && !G.RACES[r].construct)), X.chance(.5) ? 'm' : 'f');
        ch.push({ k: 'martial', label: `Bái ${nm} làm thầy`, sub: `Cao thủ ${J.schools[school].nameVi.toLowerCase()}, một ${G.tierName(tier)} (Tier ${tier}), để ý tới bạn. Phải qua một trận thử tay; theo thầy 5 năm.`, kind: 'martial', school, tier, name: nm, need: 5 });
      }
      if (!ch.length) { S.recentDec.mentor = S.age; return null; }
      return { title: 'Sư phụ', body: 'Có người để mắt tới bạn đã lâu. Hôm nay họ tìm tới tận nhà, nói muốn nhận bạn làm đệ tử.', choices: [...ch, { k: 'no', label: 'Tự học', sub: '' }] };
    },
    apply(S, X, k, c) {
      if (k === 'no') return 'Bạn cảm ơn rồi từ chối. Người ấy đi khuất đầu ngõ mà bạn còn đứng lại một lúc. Có những thứ bạn muốn tự mình mò ra.';
      if (c.kind === 'craft') {
        if (c.fee) X.money(-c.fee); else X.add('h', -4);
        S.mentor = { kind: 'craft', work: c.work, name: c.name, y: 0, need: c.need, done: false };
        S.flags.mentorTaken = true; flag(S, 'mentorCraft');
        return `Bạn dọn tới ở nhờ nhà thầy. Sáng quét xưởng, khuân vác, tối mới được đứng bên xem thầy làm. Tuần đầu tay phồng rộp, sang tuần thứ hai thì đã chai.`;
      }
      // Thử tay: một trận ở khu gợi ý (vẫn qua luật Tier).
      const z = X.recommendedZone(S), enc = z ? X.rollEncounter(z.zone, { grade: 'elite' }) : null;
      const rec = enc ? X.fight(enc, false) : { win: true };
      if (S.dead) return null;
      if (!rec.win) { S.flags.mentorTaken = true; return `Trận thử tay chưa được bao lâu thì bạn đã nằm dưới đất. ${c.name} phủi tay, lắc đầu: "Chưa đủ." Rồi quay đi, không ngoái lại.`; }
      S.mentor = { kind: 'martial', school: c.school, tier: c.tier, name: c.name, y: 0, need: c.need, done: false };
      S.flags.mentorTaken = true; flag(S, 'mentorMartial');
      G.histAdd(S.world, 'master', `${c.name} nhận ${S.name} làm đệ tử.`);
      return `Trận thử tay xong, ${c.name} nhìn bạn một lúc lâu rồi gật đầu. Bạn quỳ xuống dâng chén trà. Từ mai, sáng nào bạn cũng phải dậy trước thầy.`;
    },
    auto(S, X, d) {
      const T = S.traits, m = d.choices.find(c => c.k === 'martial'), cr = d.choices.find(c => c.k === 'craft');
      if (m && T.bold > .55) return 'martial';
      if (cr && ((S.q <= 2 && T.social > .55) || T.studious > .75)) return 'craft';
      return 'no';
    }
  };
  // ═════════ Sư đồ: nhận đệ tử (thay quyết định "Học trò" cũ chỉ dành cho tuổi già) ═════════
  delete DEC.apprentice;
  DEC.disciple = {
    prio: 3, gap: 4,
    when(S, X) {
      const st = X.stage(S), d = X.dominant(S), open = (S.disciples || []).filter(x => !x.done).length;
      return (st === 'adult' || st === 'elder') && d && d.value >= 60 && open < 2;
    },
    build(S, X) {
      const d = X.dominant(S), nm = X.name(S.race === 'skeleton' ? 'human' : S.race, X.chance(.5) ? 'm' : 'f');
      return { title: 'Đệ tử', body: `Sáng sớm, một người trẻ tên ${nm} quỳ trước cửa nhà bạn, sương còn đọng trên tóc. Người ấy xin học ${G.mv(d.skill).toLowerCase()} của bạn (${Math.round(d.value)}), nói đã quỳ ở đó từ lúc trời chưa sáng.`,
        choices: [{ k: 'yes', label: 'Nhận làm đệ tử', sub: 'Có lễ nhập môn hằng năm, danh tiếng tăng; mất thời gian dạy.', name: nm, skill: d.skill }, { k: 'no', label: 'Từ chối', sub: '' }] };
    },
    apply(S, X, k, c) {
      if (k !== 'yes') return 'Bạn bảo người ấy về đi. Tới trưa ngó ra, trước cửa đã trống, chỉ còn hai vết đầu gối hằn trên đất.';
      (S.disciples = S.disciples || []).push({ name: c.name, skill: c.skill, y: 0, done: false });
      X.add('h', 6); X.add('so', 6); flag(S, 'discipleTake');
      if (!S.flags.apprentice) S.flags.apprentice = c.name;   // giữ tương thích bản lưu cũ, tóm tắt đời
      return `Bạn đỡ ${c.name} dậy, dắt vào nhà, rót cho bát nước nóng. Thế là bạn có đệ tử. Mâm cơm từ hôm ấy thêm một đôi đũa, sân tập thêm một tiếng hô.`;
    },
    auto: (S) => S.traits.social > .55 ? 'yes' : 'no'
  };

  // ═════════ Hiệu quả của học vấn ═════════
  // Nghề trí óc kiếm thêm theo cấp học; học sĩ cao cấp được mời làm quan dễ hơn (js/org.js đọc G.eduLv).
  G.eduLv = S => (S.edu ? S.edu.lv : 0);
  G.eduIncome = S => { const lv = G.eduLv(S); return lv && ['scholar', 'healer', 'priest', 'merchant'].includes(S.work) ? 1 + .08 * lv : 1 + .02 * lv; };
  G.eduText = S => {
    const E = S.edu; if (!E) return null;
    if (E.cur) return `Đang học ${G.EDU[E.cur.lv].nameVi.toLowerCase()} ở ${G.SET[E.cur.school] ? G.SET[E.cur.school].name : '?'} (năm ${Math.min(E.cur.need, Math.floor(E.cur.y) + 1)}/${E.cur.need}${E.cur.track ? ', ' + G.TRACKS[E.cur.track].nameVi : ''})`;
    return E.lv ? `Tốt nghiệp ${G.EDU_VI[E.lv]}${E.track ? ', ngành ' + G.TRACKS[E.track].nameVi : ''}` : null;
  };
  G.mentorText = S => {
    const out = [], M = S.mentor;
    if (M) out.push(M.done ? `${M.dead ? 'Từng theo' : 'Xuất sư từ'} ${M.kind === 'craft' ? 'thợ' : 'cao thủ'} ${M.name}` : `Đệ tử của ${M.name} (${M.kind === 'craft' ? G.WORKS[M.work].nameVi.toLowerCase() : J.schools[M.school].nameVi.toLowerCase()}, năm ${M.y + 1}/${M.need})`);
    const open = (S.disciples || []).filter(d => !d.done);
    if ((S.disciples || []).length) out.push(`Sư phụ của ${S.disciples.length} đệ tử${open.length ? ` (${open.length} đang học)` : ''}`);
    return out;
  };
})(window.LifeSim);
