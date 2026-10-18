/* Vạn Kiếp — NHÀ NƯỚC VÀ NƠI Ở TÁC ĐỘNG LÊN ĐỜI (bước 4 của docs/03; luật ở docs/04 mục 3, công trình ở docs/05 mục 6–7).
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

  // ── Công trình → hệ số (docs/05 mục 6) ──
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
    if (G.statusTax) t *= G.statusTax(S);   // người có cấp: miễn thuế đầu người, Tier cao giảm nhiều hơn (js/status.js)
    return t;
  };
  G.incomeMult = S => {
    const n = G.here(S).n, a = G.attitude(S);
    let m = (1 - G.taxRate(S)) * (a === 'fav' ? 1.1 : a === 'wary' ? .85 : 1) * G.tfx(S).inc;   // thiên phú Đầu óc buôn bán… (js/talent.js)
    if (G.RACES[S.race].construct && n && !n.laws.includes('construct_citizen')) m *= .8;
    if (S.work === 'adventurer') m *= (bldOf(S).includes('guild') ? 1 : .6) * (n && n.laws.includes('bounties') ? 1.15 : 1);
    // Thuế cảng: tàu ghé cảng nộp phí, dân cảng giàu thêm.
    if (n && n.laws.includes('sea_toll') && G.here(S).s && G.here(S).s.roles.includes('port') && S.urban) m *= 1.1;
    // Hội viên phường nghề đúng nghề mình (js/org.js).
    if (G.orgIncome) m *= G.orgIncome(S);
    if (G.eduIncome) m *= G.eduIncome(S);   // học vấn (js/edu.js)
    if (G.statusIncome) m *= G.statusIncome(S);   // chứng chỉ người có cấp (js/status.js)
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
    if (w.tier && G.tierOf(S) < w.tier) return false;   // nghề của người có cấp (bước C, js/econ.js)
    if (w.demand && G.demandOf && G.demandOf(S, w.demand) < G.ECON.minDemand) return false;   // nơi ở không đủ cầu
    if (w.banLaw && n && n.laws.includes(w.banLaw)) return false;
    // Đẳng cấp: không vào được nghề mà mức thu nhập thấp nhất đã cao hơn tầng lớp của mình.
    if (n && n.laws.includes('caste') && w.pct[0] > G.CLASSES[S.q].pctRange[1]) return false;
    return true;
  };
  G.workFee = (S, id) => G.WORKS[id] && G.WORKS[id].guild && G.lawHere(S, 'guild_monopoly') && !(G.inGuildOf && G.inGuildOf(S, id)) ? 25 : 0;   // đã vào phường hội thì miễn

  // ── Nghề biển (docs/03 mục 7.3): ngư dân ở tầng ven bờ, thủy thủ ở tầng khơi của vùng biển trước bến nhà.
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
      X.log(`Lính ${n.name} bắt được bạn vì ${what}. Họ trói tay dẫn bạn đi một quãng dài, người hai bên đứng nhìn, có người quen cũng quay mặt đi. Nộp phạt ${G.coin(f)}.`, 'bad'); return;
    }
    if (n.laws.includes('penal_labor')) {
      X.money(-Math.round(Math.max(0, S.gold) * .5)); X.add('h', -12); S.flags.labor = 2;
      X.log(`Tái phạm vì ${what}: ${n.name} đưa bạn đi khổ sai hai năm. Xích sắt cọ vào cổ chân suốt đường đi, tới nơi đã rớm máu. Bạn đếm ngày bằng những vạch khắc trên vách lán.`, 'bad'); return;
    }
    if (c >= 3) { X.die({ id: 'hanged', text: `bị ${n.name} treo cổ vì ${what}` }); return; }
    X.money(-Math.round(Math.max(0, S.gold) * .5)); X.add('h', -15); X.add('so', -8);
    X.log(`Tái phạm vì ${what}: bạn bị giam một năm. Từ ô cửa ngục nhìn ra được một góc pháp trường, giá treo cổ đứng đó, nắng mưa gì cũng thấy. Lần sau là tới lượt bạn.`, 'bad');
  };

  // Áp giải ra khỏi biên giới: phạt 20% bạc, chuyển sang vùng kề có khu dân cư lớn nhất không thuộc nước này (không có thì vùng kề bất kỳ).
  G.deport = function (X, n) {
    const S = X.S, adj = G.map.adj[G.map.idx[S.loc]];
    const out = adj.filter(r => { const m = G.mainSettlement(r); return !m || m.nation !== n.idx; });
    const to = X.pick(out.length ? out : adj);
    const f = Math.round(Math.max(0, S.gold) * .2); X.money(-f); X.add('h', -8);
    S.flags.migrateQ = null; S.flags.outsider = 0;
    X.log(`Lính ${n.name} gõ cửa lúc trời chưa sáng, cho bạn gom đồ trong lúc một ngọn đuốc cháy hết. Bạn bị áp giải ra khỏi biên giới vì ở quá hạn, ngoái lại chỉ thấy cột mốc đứng trơ. Phạt ${G.coin(f)}.`, 'bad');
    const t = G.moveTo(X, to, { force: true, escort: false }); if (t) X.log(t, 'info');
  };

  // ── Hệ con "law": chạy cuối mỗi năm, sau career ──
  const best = (S, ms) => Math.max(...ms.map(m => S.mastery[m] || 0));
  G.lawYear = function (S, X) {
    const { n } = G.here(S), st = X.stage(S), R = G.RACES[S.race];
    // Khổ sai, nghĩa vụ đang chạy dù đã rời nước.
    if (S.flags.labor > 0) { S.flags.labor--; X.add('hl', -6); X.add('h', -5); X.gain('Body', 2); if (!S.flags.labor) X.log('Mãn hạn khổ sai. Người ta tháo xích, chỉ đường về rồi thôi không ngó tới. Cổ chân nhẹ hẳn, vậy mà mấy tháng sau bạn vẫn quen bước kéo lê.', 'info'); }
    if (S.flags.soldier > 0) {
      S.flags.soldier--; X.gain('Spear', 2.5); X.gain('Shield', 2); X.addXp(30);
      if (!S.flags.soldier) { X.log('Hết hạn nghĩa vụ. Bạn trả lại giáo và khiên, mang về một vết sẹo và vài người bạn từng ăn chung một nồi suốt ba năm. Đêm đầu ở nhà, giường êm quá mà lại không ngủ được.', 'info'); X.add('so', 5); }
    }
    if (!n || S.undead) return;
    if (n.laws.includes('ancestor_tithe')) X.add('h', 1);
    // Lệnh nghĩa vụ: một lần trong 10 năm đầu tuổi trưởng thành.
    if (n.laws.includes('conscript') && st === 'adult' && !S.flags.conscript && !(G.sTier && G.sTier(S)) && S.age * R.ypt - R.adult < 10) S.flags.conscriptQ = n.idx;
    // Huyền Thoại Giả đứng ngoài luật của một nước (js/status.js); người có cấp đã đăng ký thì giấy phép nằm trong sổ, không nộp phí riêng.
    const above = G.sTier && G.sTier(S) >= 5, inReg = G.regOf && G.regOf(S) > 0;
    if ((st === 'teen' || st === 'adult' || st === 'elder') && !above) {
      if (n.laws.includes('ban_death') && (best(S, ['Necromancy', 'Soul', 'Curse']) >= 15 || S.faith === 'dark') && X.chance(.04)) G.caught(X, n, 'tử thuật');
      if (S.dead) return;
      if (best(S, ['Arcane', 'Fire', 'Frost', 'Lightning']) >= 15) {
        if (n.laws.includes('ban_arcane')) { if (X.chance(.04)) G.caught(X, n, 'luyện phép'); }
        else if (n.laws.includes('mage_license') && !(n.template === 'E2' && S.race === n.race) && !inReg) {
          const fee = 8 * (1 + X.ctier(S));
          if (S.gold >= fee) { X.money(-fee); if (S.flags.license == null || S.age - S.flags.license >= 5) { S.flags.license = S.age; X.log(`Lại tới kỳ gia hạn giấy phép pháp sư của ${n.name}. Viên thư lại không ngẩng đầu, đóng dấu đánh cộp một cái. Nộp ${G.coin(fee)}.`, 'info'); } }
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
      if (S.flags.outsider === 2) { S.flags.migrateQ = `Lệnh của ${n.name}: ${J.races[S.race].nameVi} không được ở quá một năm. Lính đã tới gõ cửa, đứng chờ ngoài hiên, tay đặt sẵn trên chuôi gươm.`; S.flags.expelled = true; }
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
      return { title: 'Lệnh nghĩa vụ', body: `Tiếng trống mộ lính vang từ sáng sớm: ${n.name} gọi người tuổi bạn nhập ngũ ba năm. Viên quan cầm sổ đọc tên từng người, tới tên bạn thì dừng lại, ngước lên nhìn. Mấy đứa cùng lứa đứng túm tụm ngoài sân, không ai nói gì.`, fact: G.LAWS.conscript.desc,
        choices: [{ k: 'join', label: 'Nhập ngũ', sub: 'Luyện thương và khiên; nếu có chiến tranh thì dễ chết trận hơn.' }, { k: 'flee', label: 'Trốn', sub: `Bị truy nã ở ${n.name}.` }] };
    },
    apply(S, X, k) {
      const n = G.realm.nations[S.flags.conscriptQ];
      S.flags.conscriptQ = null; S.flags.conscript = true;
      if (k === 'join') { S.flags.soldier = 3; S.flags.served = true; X.add('so', 3); S.fame += 1; return 'Bạn nhận giáo và khiên. Cán giáo còn mới, nhẵn tay, khiên thì nặng hơn bạn tưởng. Ba năm thôi, bạn tự nhủ, rồi sẽ về.'; }
      (S.flags.wanted = S.flags.wanted || {})[n.idx] = true;
      S.flags.migrateQ = `Bạn đã trốn lính. Ở lại ${n.name} thì sớm muộn cũng có ngày lính gõ cửa.`;
      return 'Bạn trốn khỏi đợt mộ lính, nằm trong bụi rậm suốt hai đêm, nghe tiếng ngựa đi qua đi lại. Từ nay tên bạn nằm trong sổ truy nã.';
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
        return { t: S.age % 2 ? `Ở ${n.name}, người ta nhìn ${J.races[S.race].nameVi} như kẻ lạ. Bạn đi ngang, mấy bà mẹ kéo con vào nhà, cửa sổ đóng lại từng cánh một. Bạn bước tiếp, cố không đi nhanh hơn.` : `Ở ${n.name}, người ta nhìn ${J.races[S.race].nameVi} như kẻ lạ. Bạn vừa bước vào quán, chủ quán đã bảo hết hàng, trong khi nồi canh trên bếp còn bốc khói. Bạn đứng thêm một lúc rồi quay ra.`, k: 'bad' }; } },
    { id: 'law_fav', st: ['adult'], c: S => !S.undead && G.attitude(S) === 'fav' && G.here(S).n.fav.length <= 3, w: .8, rep: true, gap: 5, run(S, X) {
        X.add('so', 4); X.money(X.int(5, 20)); return { t: `Ở ${G.here(S).n.name}, người cùng tộc được tin trước. Một mối làm ăn đến tay bạn chỉ sau một chén trà, không giấy tờ, không người bảo lãnh. Lúc ra về, bạn còn nghe người ta dặn với theo: có gì cứ tìm tôi.`, k: 'good' }; } },
    { id: 'law_inventory', st: ['adult', 'elder'], c: S => G.RACES[S.race].construct && !!G.here(S).n && !G.lawHere(S, 'construct_citizen'), w: 2, rep: true, gap: 4, run(S, X) {
        X.add('h', -8); X.add('so', -3);
        return { t: `Quan thuế ${G.here(S).n.name} tới xưởng đếm đồ đạc, rồi ghi bạn vào sổ tài sản của chủ xưởng cũ, ngay dưới hai cái đe và trên một con la. Ông ta không hỏi tên bạn. Đêm ấy lõi trong ngực bạn quay chậm hẳn.`, k: 'bad', f: G.LAWS.construct_citizen.desc }; } },
    { id: 'law_liberation', st: ['adult', 'elder'], c: S => G.RACES[S.race].construct && !G.lawHere(S, 'construct_citizen') && !!libNation() && !S.flags.libCall, w: 1.5, run(S, X) {
        const L = libNation(); S.flags.libCall = true; S.flags.migrateQ = `Có tin từ ${L.name}: ở đó Cơ Nhân là công dân, có tên trong sổ hộ như mọi người. Người đưa tin vẽ đường qua biên giới lên mặt bàn bằng dầu máy, rồi lau đi.`;
        return { t: `Sáng ra, dưới cửa xưởng có một tờ truyền đơn của ${L.name}, mép giấy dính vết dầu. Đêm qua có một Cơ Nhân lạ đi ngang, bước chân nặng, không dừng lại. Bạn gấp tờ giấy làm tư, cất vào khe giữa hai tấm giáp.`, k: 'info', f: G.LAWS.liberation.desc }; } },
    { id: 'law_duel', st: ['adult', 'elder'], c: S => !S.undead && G.lawHere(S, 'duel_law'), w: 1.5, rep: true, gap: 4, run(S, X) {
        const p = G.clamp(.45 + (X.power(S) - 1) * .2 + Math.max(S.mastery.Sword, S.mastery.Axe, S.mastery.Unarmed) / 250, .1, .92);
        if (X.rnd() < p) { const g = X.int(10, 40); X.money(g); S.fame += 2; return { t: `Tranh chấp ranh đất được xử bằng quyết đấu theo luật ${G.here(S).n.name}. Cả xóm kéo ra xem, đứng thành vòng quanh bãi đất. Đối phương ngã xuống trước, bạn giữ được đất, thêm ${G.coin(g)} tiền cược.`, k: 'good', f: G.LAWS.duel_law.desc }; }
        X.add('hl', -X.int(8, 18)); X.money(-Math.min(Math.max(0, S.gold), 30));
        return { t: 'Trận quyết đấu xử tranh chấp kết thúc nhanh hơn bạn tưởng. Bạn nằm ngửa trên đất, miệng đầy vị máu, nghe người ta hô tên kẻ thắng. Mất phần đất tranh chấp và một chiếc răng. Mỗi lần lưỡi chạm vào chỗ trống ấy, bạn lại nhớ.', k: 'bad', f: G.LAWS.duel_law.desc }; } },
    { id: 'law_raid', st: ['child', 'teen', 'adult', 'elder'], c: S => !S.undead && !!raidNeighbor(S), w: 2, rep: true, gap: 2, run(S, X) {
        const o = raidNeighbor(S);
        if (['adult', 'elder'].includes(X.stage(S)) && X.power(S) > 1 + X.rnd()) { S.fame += 1; return { t: `Toán cướp của ${o.name} tràn qua biên lúc nửa đêm, đuốc sáng rực cả một khúc đồi. Bạn cùng dân làng cầm gậy gộc, giáo mác ra chặn, đánh lui chúng tới tận bờ suối. Sáng ra, người ta nhắc tên bạn khi kể lại trận ấy.`, k: 'good', f: G.LAWS.raid_law.desc }; }
        const loss = Math.min(Math.max(0, S.gold), X.int(10, 50)); X.money(-loss); X.add('hl', -X.int(2, 8)); X.add('h', -5);
        return { t: `Toán cướp của ${o.name} đốt kho thóc làng bên, khói đen bay sang tận đây. Chúng phá cửa nhà bạn, lấy đi ${G.coin(loss)}. Bên kia biên giới gọi đó là luật.`, k: 'bad', f: G.LAWS.raid_law.desc }; } },
    { id: 'law_contract', st: ['adult', 'elder'], c: S => !S.undead && G.lawHere(S, 'contract_law'), w: 1, rep: true, gap: 6, run(S, X) {
        if (X.chance(.6)) { X.add('so', 5); return { t: 'Trước tiết đông chí một ngày, bạn mang đủ tiền tới trả nợ, đúng như lời hứa. Tờ khế ước trên bàn tự bén lửa, cháy thành một nhúm tro mịn. Chủ nợ gật đầu, rót cho bạn một chén trà.', k: 'good', f: G.LAWS.contract_law.desc }; }
        X.cond('curse'); X.add('h', -6);
        return { t: 'Bạn lỡ hẹn trả một món nợ nhỏ, chỉ chậm vài hôm. Sáng hôm sau thức dậy, từng dòng khế ước đã hằn lên da tay bạn, đỏ như vết bỏng. Rửa thế nào cũng không đi.', k: 'bad', f: G.LAWS.contract_law.desc }; } },
    { id: 'law_tax_up', st: ['adult', 'elder'], c: S => flesh(S) && !!G.here(S).n && G.here(S).n.tax >= .2 && !(G.sTier && G.sTier(S)), w: 1, rep: true, gap: 4, run(S, X) {
        const n = G.here(S).n, t = Math.round(Math.max(0, S.gold) * .1); X.money(-t); X.add('h', -3);
        return { t: S.age % 2 ? `Lại thêm một khoản thuế đầu người của ${n.name}. Người ta xếp hàng từ sáng, chẳng ai dám than to. Bạn nộp ${G.coin(t)}.` : `${n.name} thu thêm một khoản thuế đầu người. Viên thu thuế đọc tên từng nhà, giọng đều đều như đọc kinh. Bạn nộp ${G.coin(t)}.`, k: 'bad' }; } }
  );
})(window.LifeSim);
