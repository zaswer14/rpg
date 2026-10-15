/* Vạn Kiếp — NHÀ NƯỚC VÀ NƠI Ở TÁC ĐỘNG LÊN ĐỜI (bước 4 của research/03; luật ở research/04 mục 3, công trình ở research/05 mục 6–7).
 *   Nơi ở: khu dân cư (S.home.settlement), trong khu hay vùng quê (S.urban), nước đang sống (S.nation).
 *   Công trình của khu → nghề làm được, tử vong trẻ em, dịch, việc học.
 *   Thuế, thái độ chủng tộc, vài luật → thu nhập.
 *   Hệ con "law" (mỗi năm): bắt giữ vì tử thuật / phép / trốn lính, giấy phép pháp sư, lệnh nghĩa vụ, trục xuất ngoại tộc, khổ sai.
 *   Sự kiện và quyết định riêng của luật được thêm vào G.EVENTS / G.DECISIONS ở cuối file.
 * Đặc tính mẫu và đặc trưng riêng của nước chưa tác động (bước 10).
 */
window.LifeSim = window.LifeSim || {};
(function (G) {
  const J = window.JobLibrary;

  // ── Tra cứu ──
  G.here = S => ({
    s: (S.home && S.home.settlement && G.SET && G.SET[S.home.settlement]) || null,
    n: S.nation != null && G.realm ? G.realm.nations[S.nation] : null
  });
  G.lawHere = (S, law) => { const n = G.here(S).n; return !!n && n.laws.includes(law); };
  G.attitude = S => { const n = G.here(S).n; return !n ? 'neutral' : n.fav.includes(S.race) ? 'fav' : n.wary.includes(S.race) ? 'wary' : 'neutral'; };
  const bldOf = S => { const s = G.here(S).s; return s ? s.bld : []; };
  const tierOf = S => { const s = G.here(S).s; return s ? s.tier : null; };

  // ── Công trình → hệ số (research/05 mục 6) ──
  // Học: không có trường .6, trường làng .8, trường 1, học viện 1,2.
  G.schoolMult = S => !bldOf(S).includes('school') ? .6 : ({ town: .8, city: 1, capital: 1.2 }[tierOf(S)] || .8);
  // Tử vong trẻ em: không có thầy .. nhà thương lớn = 1,15 / 1 / .9 / .85 / .8.
  G.healerMult = S => !bldOf(S).includes('healer') ? 1.15 : ({ village: 1, town: .9, city: .85, capital: .8 }[tierOf(S)] || 1);
  // Dịch: kinh đô, thành phố × 1,4 (trong khu); thị trấn 1,1; làng 1; vùng quê .8; thôn .7.
  G.plagueMult = S => { const t = tierOf(S); if (!t) return 1; if (t === 'hamlet') return .7; if (!S.urban) return .8; return { capital: 1.4, city: 1.4, town: 1.1 }[t] || 1; };

  // ── Thu nhập: thuế, thái độ chủng tộc, luật ──
  G.taxRate = S => {
    const n = G.here(S).n; if (!n) return 0;
    let t = n.tax;
    if (S.work === 'merchant' && n.laws.includes('free_trade')) t /= 2;
    if (n.laws.includes('ancestor_tithe')) t += .05;
    return t;
  };
  G.incomeMult = S => {
    const n = G.here(S).n, a = G.attitude(S);
    let m = (1 - G.taxRate(S)) * (a === 'fav' ? 1.1 : a === 'wary' ? .85 : 1);
    if (G.RACES[S.race].construct && n && !n.laws.includes('construct_citizen')) m *= .8;
    if (S.work === 'adventurer') m *= (bldOf(S).includes('guild') ? 1 : .6) * (n && n.laws.includes('bounties') ? 1.15 : 1);
    // Thuế cảng: tàu ghé cảng nộp phí, dân cảng giàu thêm.
    if (n && n.laws.includes('sea_toll') && G.here(S).s && G.here(S).s.roles.includes('port') && S.urban) m *= 1.1;
    // Hội viên phường nghề đúng nghề mình (js/org.js).
    if (G.orgIncome) m *= G.orgIncome(S);
    return m;
  };

  // ── Nghề làm được ở nơi đang ở ──
  G.workOK = function (S, id) {
    const w = G.WORKS[id]; if (!w) return false;
    if (w.adventurer) return true;
    const { s, n } = G.here(S), reg = G.REGION[S.loc];
    if (!s) return !w.bld && !w.role && !w.town;   // sống ngoài khu dân cư: chỉ nghề không cần khu
    const rank = G.TIER_RANK[s.tier];
    if (w.town && !(S.urban && rank <= 2)) return false;
    if (w.land && S.urban && rank <= 2) return false;
    if (w.bld && !w.bld.some(b => s.bld.includes(b))) return false;
    if (w.role && !w.role.some(r => s.roles.includes(r))) return false;
    if (w.biomes && !w.biomes.includes(reg.biome)) return false;
    if (w.needSm && S.sm < w.needSm) return false;
    if (w.needFaith && !S.faith) return false;
    if (w.banLaw && n && n.laws.includes(w.banLaw)) return false;
    // Đẳng cấp: không vào được nghề mà mức thu nhập thấp nhất đã cao hơn tầng lớp của mình.
    if (n && n.laws.includes('caste') && w.pct[0] > G.CLASSES[S.q].pctRange[1]) return false;
    return true;
  };
  G.workFee = (S, id) => G.WORKS[id] && G.WORKS[id].guild && G.lawHere(S, 'guild_monopoly') && !(G.inGuildOf && G.inGuildOf(S, id)) ? 25 : 0;   // đã vào phường hội thì miễn

  // ── Nghề biển (research/03 mục 7.3): ngư dân ở tầng ven bờ, thủy thủ ở tầng khơi của vùng biển trước bến nhà.
  // Không sống ở bến (làng chài ven sông, ven hồ) thì không làm trên biển. Trả về { sea, zone, cell } hoặc null.
  G.seaWork = S => {
    const W = G.WORKS[S.work], s = G.here(S).s;
    if (!W || W.seaBand == null || !s || !s.seaCells) return null;
    const sea = G.seaOf(s), zone = sea.zones[W.seaBand];
    const cell = s.seaCells.find(i => G.realm.seaBand[i] === W.seaBand) ?? null;
    return { sea, zone, cell };
  };

  // ── Bị bắt: lần đầu phạt bạc; tái phạm: giam (hoặc khổ sai nếu nước có luật khổ sai); lần thứ ba: treo cổ (nước không có khổ sai) ──
  G.caught = function (X, n, what) {
    const S = X.S;
    S.flags.crimes = (S.flags.crimes || 0) + 1;
    const c = S.flags.crimes;
    if (c === 1) {
      const f = Math.max(10, Math.round(Math.max(0, S.gold) * .3)); X.money(-f); X.add('so', -4);
      X.log(`Lính ${n.name} bắt được bạn vì ${what}. Nộp phạt ${f} bạc.`, 'bad'); return;
    }
    if (n.laws.includes('penal_labor')) {
      X.money(-Math.round(Math.max(0, S.gold) * .5)); X.add('h', -12); S.flags.labor = 2;
      X.log(`Tái phạm vì ${what}: ${n.name} đưa bạn đi khổ sai hai năm.`, 'bad'); return;
    }
    if (c >= 3) { X.die({ id: 'hanged', text: `bị ${n.name} treo cổ vì ${what}` }); return; }
    X.money(-Math.round(Math.max(0, S.gold) * .5)); X.add('h', -15); X.add('so', -8);
    X.log(`Tái phạm vì ${what}: bạn bị giam một năm. Lần sau là giá treo cổ.`, 'bad');
  };

  // Áp giải ra khỏi biên giới: phạt 20% bạc, chuyển sang vùng kề có khu dân cư lớn nhất không thuộc nước này (không có thì vùng kề bất kỳ).
  G.deport = function (X, n) {
    const S = X.S, adj = G.map.adj[G.map.idx[S.loc]];
    const out = adj.filter(r => { const m = G.mainSettlement(r); return !m || m.nation !== n.idx; });
    const to = X.pick(out.length ? out : adj);
    const f = Math.round(Math.max(0, S.gold) * .2); X.money(-f); X.add('h', -8);
    S.flags.migrateQ = null; S.flags.outsider = 0;
    X.log(`Lính ${n.name} áp giải bạn ra khỏi biên giới vì ở quá hạn. Phạt ${f} bạc.`, 'bad');
    const t = G.moveTo(X, to, { force: true, escort: false }); if (t) X.log(t, 'info');
  };

  // ── Hệ con "law": chạy cuối mỗi năm, sau career ──
  const best = (S, ms) => Math.max(...ms.map(m => S.mastery[m] || 0));
  G.lawYear = function (S, X) {
    const { n } = G.here(S), st = X.stage(S), R = G.RACES[S.race];
    // Khổ sai, nghĩa vụ đang chạy dù đã rời nước.
    if (S.flags.labor > 0) { S.flags.labor--; X.add('hl', -6); X.add('h', -5); X.gain('Body', 2); if (!S.flags.labor) X.log('Mãn hạn khổ sai.', 'info'); }
    if (S.flags.soldier > 0) {
      S.flags.soldier--; X.gain('Spear', 2.5); X.gain('Shield', 2); X.addXp(30);
      if (!S.flags.soldier) { X.log('Hết hạn nghĩa vụ. Bạn về nhà với một vết sẹo và vài người bạn.', 'info'); X.add('so', 5); }
    }
    if (!n || S.undead) return;
    if (n.laws.includes('ancestor_tithe')) X.add('h', 1);
    // Lệnh nghĩa vụ: một lần trong 10 năm đầu tuổi trưởng thành.
    if (n.laws.includes('conscript') && st === 'adult' && !S.flags.conscript && S.age * R.ypt - R.adult < 10) S.flags.conscriptQ = n.idx;
    if (st === 'teen' || st === 'adult' || st === 'elder') {
      if (n.laws.includes('ban_death') && (best(S, ['Necromancy', 'Soul', 'Curse']) >= 15 || S.faith === 'dark') && X.chance(.04)) G.caught(X, n, 'tử thuật');
      if (S.dead) return;
      if (best(S, ['Arcane', 'Fire', 'Frost', 'Lightning']) >= 15) {
        if (n.laws.includes('ban_arcane')) { if (X.chance(.04)) G.caught(X, n, 'luyện phép'); }
        else if (n.laws.includes('mage_license') && !(n.template === 'E2' && S.race === n.race)) {
          const fee = 8 * (1 + X.ctier(S));
          if (S.gold >= fee) { X.money(-fee); if (S.flags.license == null || S.age - S.flags.license >= 5) { S.flags.license = S.age; X.log(`Nộp ${fee} bạc gia hạn giấy phép pháp sư của ${n.name}.`, 'info'); } }
          else if (X.chance(.04)) G.caught(X, n, 'hành nghề phép không giấy phép');
        }
      }
      if (S.dead) return;
    }
    // Truy nã (trốn lính): nước mở biên không bắt.
    if (S.flags.wanted && S.flags.wanted[n.idx] && !n.laws.includes('open_borders') && X.chance(.06)) G.caught(X, n, 'trốn nghĩa vụ');
    if (S.dead) return;
    // Cấm ngoại tộc ở lâu: sang năm thứ hai thì có lệnh trục xuất; cố ở thì bị bắt.
    if (n.laws.includes('no_outsiders') && ['adult', 'elder'].includes(st) && !n.fav.includes(S.race)) {
      S.flags.outsider = (S.flags.outsider || 0) + 1;
      if (S.flags.outsider === 2) { S.flags.migrateQ = `Lệnh của ${n.name}: ${J.races[S.race].nameVi} không được ở quá một năm. Lính đã đến gõ cửa.`; S.flags.expelled = true; }
      // Cố ở lại: lính áp giải ra vùng kề ngoài lãnh thổ nước này (không tính tiền án).
      if (S.flags.outsider >= 3 && X.chance(.35)) G.deport(X, n);
    } else S.flags.outsider = 0;
  };
  // Chạy ngay sau "career".
  { const k = G.SYSTEMS.findIndex(s => s.id === 'career'); G.SYSTEMS.splice(k + 1, 0, { id: 'law', run: (S, X) => G.lawYear(S, X) }); }

  // ── Quyết định: lệnh nghĩa vụ ──
  G.DECISIONS.conscript = {
    prio: 7, gap: 1,
    when: S => S.flags.conscriptQ != null && !S.undead,
    build(S, X) {
      const n = G.realm.nations[S.flags.conscriptQ];
      return { title: 'Lệnh nghĩa vụ', body: `${n.name} gọi người tuổi bạn nhập ngũ ba năm.`, fact: G.LAWS.conscript.desc,
        choices: [{ k: 'join', label: 'Nhập ngũ', sub: 'Luyện thương và khiên; nếu có chiến tranh thì dễ chết trận hơn.' }, { k: 'flee', label: 'Trốn', sub: `Bị truy nã ở ${n.name}.` }] };
    },
    apply(S, X, k) {
      const n = G.realm.nations[S.flags.conscriptQ];
      S.flags.conscriptQ = null; S.flags.conscript = true;
      if (k === 'join') { S.flags.soldier = 3; S.flags.served = true; X.add('so', 3); S.fame += 1; return 'Bạn nhận giáo và khiên.'; }
      (S.flags.wanted = S.flags.wanted || {})[n.idx] = true;
      S.flags.migrateQ = `Bạn trốn lính. Ở lại ${n.name} là có ngày bị bắt.`;
      return 'Bạn trốn khỏi đợt mộ lính.';
    },
    auto: S => S.traits.bold > .35 || S.traits.social > .6 ? 'join' : 'flee'
  };

  // ── Sự kiện của luật và thái độ chủng tộc ──
  const flesh = S => !S.undead && !G.RACES[S.race].construct;
  const raidNeighbor = S => {
    // Nước khác có luật cướp phá hợp lệ đang có khu dân cư ở vùng này hoặc vùng kề.
    const regs = [S.loc, ...G.map.adj[G.map.idx[S.loc]]];
    for (const r of regs) for (const s of G.settlementsIn(r)) { const o = G.nationOf(s); if (o && o.idx !== S.nation && o.laws.includes('raid_law')) return o; }
    return null;
  };
  const libNation = () => G.realm.nations.find(n => n.laws.includes('liberation'));
  G.EVENTS.push(
    { id: 'law_wary', st: ['child', 'teen', 'adult', 'elder'], c: S => !S.undead && G.attitude(S) === 'wary', w: 1.5, rep: true, gap: 3, run(S, X) {
        const n = G.here(S).n; X.add('so', -6); X.add('h', -4);
        return { t: `Ở ${n.name}, người ta nhìn ${J.races[S.race].nameVi} như kẻ lạ. Chủ quán nói hết hàng khi thấy bạn bước vào.`, k: 'bad' }; } },
    { id: 'law_fav', st: ['adult'], c: S => !S.undead && G.attitude(S) === 'fav' && G.here(S).n.fav.length <= 3, w: .8, rep: true, gap: 5, run(S, X) {
        X.add('so', 4); X.money(X.int(5, 20)); return { t: `Ở ${G.here(S).n.name}, người cùng tộc được tin trước. Một mối làm ăn đến tay bạn dễ dàng.`, k: 'good' }; } },
    { id: 'law_inventory', st: ['adult', 'elder'], c: S => G.RACES[S.race].construct && !!G.here(S).n && !G.lawHere(S, 'construct_citizen'), w: 2, rep: true, gap: 4, run(S, X) {
        X.add('h', -8); X.add('so', -3);
        return { t: `Quan thuế ${G.here(S).n.name} ghi bạn vào sổ tài sản của chủ xưởng cũ, cạnh hai cái đe và một con la.`, k: 'bad', f: G.LAWS.construct_citizen.desc }; } },
    { id: 'law_liberation', st: ['adult', 'elder'], c: S => G.RACES[S.race].construct && !G.lawHere(S, 'construct_citizen') && !!libNation() && !S.flags.libCall, w: 1.5, run(S, X) {
        const L = libNation(); S.flags.libCall = true; S.flags.migrateQ = `Có tin từ ${L.name}: ở đó Cơ Nhân là công dân. Người đưa tin chỉ đường qua biên giới.`;
        return { t: `Một Cơ Nhân lạ để lại tờ truyền đơn của ${L.name} dưới cửa xưởng.`, k: 'info', f: G.LAWS.liberation.desc }; } },
    { id: 'law_duel', st: ['adult', 'elder'], c: S => !S.undead && G.lawHere(S, 'duel_law'), w: 1.5, rep: true, gap: 4, run(S, X) {
        const p = G.clamp(.45 + (X.power(S) - 1) * .2 + Math.max(S.mastery.Sword, S.mastery.Axe, S.mastery.Unarmed) / 250, .1, .92);
        if (X.rnd() < p) { const g = X.int(10, 40); X.money(g); S.fame += 2; return { t: `Tranh chấp ranh đất được xử bằng quyết đấu theo luật ${G.here(S).n.name}. Bạn thắng và giữ được đất, thêm ${g} bạc tiền cược.`, k: 'good', f: G.LAWS.duel_law.desc }; }
        X.add('hl', -X.int(8, 18)); X.money(-Math.min(Math.max(0, S.gold), 30));
        return { t: 'Bạn thua trận quyết đấu xử tranh chấp. Mất phần đất tranh chấp và một chiếc răng.', k: 'bad', f: G.LAWS.duel_law.desc }; } },
    { id: 'law_raid', st: ['child', 'teen', 'adult', 'elder'], c: S => !S.undead && !!raidNeighbor(S), w: 2, rep: true, gap: 2, run(S, X) {
        const o = raidNeighbor(S);
        if (['adult', 'elder'].includes(X.stage(S)) && X.power(S) > 1 + X.rnd()) { S.fame += 1; return { t: `Toán cướp của ${o.name} tràn qua biên. Bạn cùng dân làng đánh lui chúng.`, k: 'good', f: G.LAWS.raid_law.desc }; }
        const loss = Math.min(Math.max(0, S.gold), X.int(10, 50)); X.money(-loss); X.add('hl', -X.int(2, 8)); X.add('h', -5);
        return { t: `Toán cướp của ${o.name} đốt kho thóc làng bên và lấy ${loss} bạc của nhà bạn. Bên kia biên giới gọi đó là luật.`, k: 'bad', f: G.LAWS.raid_law.desc }; } },
    { id: 'law_contract', st: ['adult', 'elder'], c: S => !S.undead && G.lawHere(S, 'contract_law'), w: 1, rep: true, gap: 6, run(S, X) {
        if (X.chance(.6)) { X.add('so', 5); return { t: 'Bạn giữ đúng lời hứa trả nợ trước tiết đông chí. Khế ước tự cháy thành tro.', k: 'good', f: G.LAWS.contract_law.desc }; }
        X.cond('curse'); X.add('h', -6);
        return { t: 'Bạn lỡ hẹn trả một món nợ nhỏ. Sáng hôm sau, khế ước đã khắc vào da tay bạn.', k: 'bad', f: G.LAWS.contract_law.desc }; } },
    { id: 'law_tax_up', st: ['adult', 'elder'], c: S => flesh(S) && !!G.here(S).n && G.here(S).n.tax >= .2, w: 1, rep: true, gap: 4, run(S, X) {
        const n = G.here(S).n, t = Math.round(Math.max(0, S.gold) * .1); X.money(-t); X.add('h', -3);
        return { t: `${n.name} thu thêm một khoản thuế đầu người. Bạn nộp ${t} bạc.`, k: 'bad' }; } }
  );
})(window.LifeSim);
