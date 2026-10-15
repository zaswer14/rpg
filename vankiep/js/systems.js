/* Vạn Kiếp — HỆ CON chạy cuối mỗi năm, khai báo thứ tự và điều kiện của mình (thay cho ~50 hàm xxxYear() gọi cứng của 1in8b).
 * Thứ tự: world → nations → family → health → undead → career → law → place → peers ("nations" ở js/dynamic.js, "law" ở js/state.js).
 * Hệ "world": dịch theo vùng; quái HOẠT ĐỘNG THEO TỈNH × TẦNG: mỗi tầng của tỉnh có mật độ quái (zonePop) sinh sôi, bị thợ săn NPC
 * và người chơi tỉa bớt; tầng sâu quá đông thì đẩy mật độ ra tầng ngoài (chỉ mật độ, không đẩy loài — loài vẫn nằm trong dải Tier
 * của tầng); tầng ven quá đông thì thành thú triều đánh vào khu dân cư của tỉnh (dyn.raid), làm tăng nguy cơ chết của dân trong tỉnh.
 */
window.LifeSim = window.LifeSim || {};
(function (G) {
  const J = window.JobLibrary;

  G.SYSTEMS = [
    { id: 'world', run: (S, X) => G.worldYear(S, X) },
    { id: 'family', when: S => !S.undead, run: (S, X) => G.familyYear(S, X) },
    { id: 'health', run: (S, X) => G.healthYear(S, X) },
    { id: 'undead', when: S => S.undead, run: (S, X) => G.undeadYear(S, X) },
    { id: 'career', run: (S, X) => G.careerYear(S, X) },
    { id: 'place', run: (S, X) => G.placeYear(S, X) },
    { id: 'peers', run: (S, X) => G.peersYear(S, X) }
  ];

  G.worldYear = function (S, X) {
    const W = S.world, adjOf = id => G.map.adj[G.map.idx[id]];
    G.bindWorld(W);
    // Dịch bệnh theo vùng.
    for (const r of G.REGIONS) {
      const rs = W.regions[r.id];
      if (rs.plague > 0) rs.plague = Math.max(0, rs.plague - .3 - X.rnd() * .25);
      else if (X.chance(.01 + (r.biome === 'venom_marsh' ? .02 : 0) + (1 - r.wealth) * .01)) {
        rs.plague = .6 + X.rnd() * .4; rs.plagueNew = true;
        for (const n of adjOf(r.id)) if (X.chance(.25)) { W.regions[n].plague = Math.max(W.regions[n].plague, .4); W.regions[n].plagueNew = true; }
      }
    }
    // Mật độ quái theo tỉnh × tầng, biển; thú triều (js/dynamic.js).
    G.monsterYear(W, X, S);
    const here = W.regions[S.loc];
    if (here.plagueNew && !S.undead && !G.RACES[S.race].construct) X.log(`Dịch hạch lan tới ${G.REGION[S.loc].nameVi}.`, 'bad');
    for (const r of G.REGIONS) W.regions[r.id].plagueNew = false;
  };

  G.familyYear = function (S, X) {
    const R = X.R(S), reg = G.REGION[S.home.region], fam = S.family;
    const lt = G.lifeTable(S.race, 'f', reg.wealth);
    const ageDie = (ageYears, mult = 1) => { const q = lt.q[Math.min(Math.floor(ageYears / R.ypt), lt.q.length - 1)]; return X.rnd() < 1 - Math.pow(1 - q, mult); };
    for (const p of fam.parents) if (p.alive) {
      p.age += R.ypt;
      if (ageDie(p.age, 1.1)) {
        p.alive = false;
        X.add('h', -12);
        let txt = `${p.role[0].toUpperCase() + p.role.slice(1)} bạn, ${p.name}, qua đời ở tuổi ${p.age}.`;
        if (S.q >= 3 && X.stage(S) !== 'child') { const inh = Math.round(G.median(reg) * (S.q - 2) * .8); X.money(inh); txt += ` Bạn được thừa kế ${inh} bạc.`; }
        X.log(txt, 'bad');
      }
    }
    for (const s of fam.sibs) if (s.alive) { s.age += R.ypt; if (ageDie(s.age, .8)) { s.alive = false; X.add('h', -8); X.log(`${s.sex === 'm' ? 'Anh' : 'Chị'} ${s.name} của bạn mất.`, 'bad'); } }
    const sp = fam.spouse;
    if (sp && sp.alive) {
      sp.age += R.ypt;
      if (ageDie(sp.age)) { sp.alive = false; X.add('h', -20); X.log(`${sp.name}, người bạn đời, qua đời.`, 'bad'); }
    }
    for (const k of fam.kids) if (k.alive) {
      k.age += R.ypt;
      if (k.age <= R.adult && X.rnd() < R.im * .25) { k.alive = false; X.add('h', -22); X.log(`Con bạn, ${k.name}, mất khi mới ${k.age} tuổi.`, 'bad'); }
    }
    // Con cái.
    const st = X.stage(S), lt2 = X.lt(S);
    if (sp && sp.alive && st === 'adult' && S.age < lt2.leT * .62 && !R.construct) {
      const share = (S.focusTime.family || 0) / (Object.values(S.focusTime).reduce((a, b) => a + b, 0) || 1);
      const alive = fam.kids.filter(k => k.alive).length;
      if (X.rnd() < (.16 + share * .25) * Math.pow(.8, alive)) {
        const sx = X.chance(.5) ? 'm' : 'f', nm = X.name(S.race, sx).split(' ')[0];
        fam.kids.push({ name: nm, sex: sx, age: 0, alive: true });
        X.add('h', 8); X.add('so', 4);
        X.log(`${sx === 'm' ? 'Con trai' : 'Con gái'} ${nm} chào đời.`, 'good');
      }
    }
  };

  G.healthYear = function (S, X) {
    const share = (S.focusTime.rest || 0) / (Object.values(S.focusTime).reduce((a, b) => a + b, 0) || 1);
    for (const c of [...S.conds]) {
      c.years++;
      const C = G.CONDS[c.id];
      if (C.heal && X.rnd() < C.heal * G.tfx(S).heal * (1 + share * 1.2) * (S.q >= 4 ? 1.3 : 1) * (G.healerMult(S) < 1 ? 1.2 : 1)) {
        S.conds.splice(S.conds.indexOf(c), 1);
        X.log(`Khỏi ${C.nameVi.toLowerCase()}.`, 'good');
      } else if (c.id === 'fever' && c.years >= 2) { S.conds.splice(S.conds.indexOf(c), 1); X.cond('frail'); }
    }
    const st = X.stage(S), R = X.R(S);
    if (st === 'elder') {
      if (R.construct) { if (X.chance(.08)) X.cond('rust'); }
      else if (!R.undead && X.chance(.05)) { X.cond('cough'); X.log('Cơn ho mùa đông không dứt.', 'bad'); }
    }
    if (S.work === 'miner' && !R.construct && X.chance(.04)) X.cond('cough');
    if (S.hl < 15 && !X.hasCond('frail')) X.cond('frail');
  };

  G.undeadYear = function (S, X) {
    // Hồn phai: chỉ số mài mòn chậm; ở gần đền Quang Minh lâu thì bị truy lùng.
    S.sm = Math.max(0, S.sm - .4);
    const reg = X.reg(S), light = reg.faiths.light || 0, tot = Object.values(reg.faiths).reduce((a, b) => a + b, 0);
    if (S.flags.revealed && X.rnd() < light / tot * .5 && !X.hasCond('hunted')) { X.cond('hunted'); X.log(`Tu sĩ Quang Minh ở ${reg.nameVi} treo thưởng cho đầu lâu của bạn.`, 'bad'); }
    if (S.faith === 'dark') S.devotion = Math.min(100, S.devotion + 2);
  };

  G.careerYear = function (S, X) {
    const st = X.stage(S);
    if (st === 'adult' && !S.work && !S.undead) S.flags.workQ = true;
    if (S.work === 'adventurer') S.pct = G.clamp(.1 + S.fame / 110, .05, .97);
  };

  G.placeYear = function (S, X) {
    const home = S.home.settlement && G.SET[S.home.settlement];
    let pos;
    if ((S.focus === 'hunt' || S.focus === 'adventure') && S.zoneSel && G.ZONE[S.zoneSel]) pos = G.map.pointIn(S.loc, G.ZONE[S.zoneSel].index, X.rnd);
    else if (home) pos = G.homePos(home, S.urban, X.rnd);
    else pos = G.map.pointIn(S.loc, 0, X.rnd);
    S.pos = pos;
    S.huntPos = S.zoneSel && G.ZONE[S.zoneSel] && G.ZONE[S.zoneSel].region.id === S.loc ? G.map.pointIn(S.loc, G.ZONE[S.zoneSel].index, X.rnd) : null;
  };

  G.peersYear = function (S, X) {
    (S.peers || []).forEach((p, i) => {
      if (S.peerSeen[i] || S.world.year < p.diedYear) return;
      S.peerSeen[i] = true;
      X.log(`Đồng niên: ${p.name} (${J.races[p.race].nameVi}, sinh cùng năm ở ${p.settlement || p.regionName}) đã mất ở tuổi ${p.years}: ${p.cause}.` + (p.rose ? ' Rồi xương cốt đứng dậy.' : ''), 'peer');
    });
  };

  // Tự chọn focus theo tính cách (autopilot và headless).
  G.autoFocus = function (X) {
    const S = X.S, st = X.stage(S), T = S.traits, R = X.R(S);
    const yrs = X.years(S);
    let w;
    if (st === 'infant') return 'play';
    if (st === 'child') {
      if (yrs < 6 && !R.construct) return 'play';
      w = { play: 3, study: 1 + T.studious * 4, train: T.bold * 4, chores: S.q <= 2 ? 3 : 1, faith: S.faith ? T.pious * 2 : 0 };
    } else if (st === 'teen') {
      w = { train: 1 + T.bold * 5, study: 1 + T.studious * 4, work: S.q <= 2 ? 3 : 1, hunt: T.bold > .55 && S.level >= 3 ? 3 : 0, faith: S.faith ? T.pious * 2 : 0, family: T.social * 1.5 };
    } else {
      if (S.hl < 35) return 'rest';
      const hunter = S.work === 'adventurer' || S.undead || S.work === 'hunter' && T.bold > .5;
      if (hunter) w = { hunt: 6, adventure: S.hl > 60 && T.bold > .5 ? T.bold * 4 : 0, train: 3, rest: S.hl < 55 ? 3 : .5, faith: S.faith ? T.pious * 1.5 : 0 };
      else w = { work: 7, train: T.bold * 2, family: T.social * 2 + (S.family.spouse ? 1 : 0), faith: S.faith ? T.pious * 2 : 0, hunt: T.bold * 1.2, study: T.studious, rest: .5 };
      if (st === 'elder') { w.rest = 3; w.family = (w.family || 0) + 2; w.adventure = 0; w.hunt = (w.hunt || 0) * .3; }
      // Đang giữ chức (js/org.js): dành thời gian quản lý theo tính hòa đồng; người cai trị nhiều hơn.
      if (G.hasCharge && G.hasCharge(S)) w.govern = 1.5 + T.social * 3 + (S.roles.ruler != null ? 3 : 0) + (S.roles.head != null ? 1 : 0);
    }
    // Chí hướng (js/talent.js): cộng trọng số focus của chí hướng; thơ ấu, tuổi già một nửa.
    const A = G.AIMS[S.aim];
    if (A) for (const [k, v] of Object.entries(A.focus)) w[k] = (w[k] || 0) + v * (st === 'adult' || st === 'teen' ? 1 : .5);
    if (!S.zoneSel) { w.hunt = 0; w.adventure = 0; }
    for (const k of Object.keys(w)) if (!G.focusOK(S, k, st)) delete w[k];
    return X.wkey(w) || 'rest';
  };

  // Rương báu khi phiêu lưu.
  G.treasure = function (X, zone) {
    const S = X.S, r = X.rnd();
    if (r < .4) { const g = X.int(20, 60) * (1 + zone.tier[0]); X.money(g); X.log(`Tìm được rương cũ ở ${zone.nameVi}: ${g} bạc.`, 'good'); }
    else if (r < .75) { S.gear = Math.min(10, S.gear + 1); X.log(`Nhặt được món trang bị tốt hơn ở ${zone.nameVi}. Trang bị ${S.gear}/10.`, 'good'); }
    else {
      const school = X.pick(Object.keys(J.schools)), m = X.pick(J.schools[school].masteries);
      X.gain(m, 8); X.log(`Một cuộn bí kíp trong hốc đá dạy bạn về ${G.mv(m).toLowerCase()}.`, 'good');
    }
  };
})(window.LifeSim);
