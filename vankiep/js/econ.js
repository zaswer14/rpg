/* Vạn Kiếp — KINH TẾ BỐN VÒNG (bước C của docs/07 mục 4.6, 7; số chốt và kết quả ở docs/07 mục 4.11).
 * Sinh kế (data/world.js G.WORKS) chia bốn vòng: 1 người có cấp sống bằng sức, 2 phục vụ tu luyện, 3 sinh kế cơ bản, 4 phục vụ quý tộc xa hoa.
 *   Khóa của nghề: ring (vòng), tier (Tier tối thiểu), demand (loại cầu ở nơi ở: G.DEMAND).
 *   Cầu (G.demandOf): dưới G.ECON.minDemand thì không có chỗ làm (js/state.js G.workOK); trên dưới 1 thì đẩy thu nhập (life.js workYear, G.demandShift).
 *     cult: người có cấp quanh đó (bậc khu, Hội Mạo Hiểm, doanh trại, trường, ma lực vùng); noble: nhà quý tộc (kinh đô, thành phố của nước ban tước,
 *     khu là thái ấp); wild: sơn mạch ma thú (độ nguy hiểm của vùng, hang ổ trong vùng); trade: chợ, cảng; ore: ma lực vùng (mỏ ma tinh).
 *   Đổi nghề khi lên Tier (cv_rework): nghề của người có cấp mở ra.
 *   Vòng 4: chủ nhà để mắt (cv_patron: ban dược tề, cho học cùng con, thưởng), tác phẩm được nhận (cv_art, có khi thành danh gia), chủ nổi giận (cv_wrath).
 *   Vòng 2: dược sư tự pha dược tề (giá × G.ECON.alchemist, js/status.js), khắc văn sư thỉnh thoảng khắc ma văn lên đồ của mình.
 * Trạng thái: S.flags.workYrs (số năm làm nghề hiện tại), S.flags.patronQ, S.flags.patronT (nguồn dạy "patron"), S.flags.giftElixir (số năm được ban dược tề),
 *   S.flags.artMaster (danh gia), S.flags.reworkT (Tier lần cuối được hỏi đổi nghề).
 */
window.LifeSim = window.LifeSim || {};
(function (G) {
  const DEC = G.DECISIONS;
  const cnt = (S, k, v = 1) => { S.flags[k] = (S.flags[k] || 0) + v; };
  const W = id => G.WORKS[id];
  const ringOf = S => (W(S.work) || {}).ring || 0;

  G.ECON = {
    minDemand: .35,   // cầu dưới mức này: nghề không có chỗ làm ở đây
    shift: .15,       // cầu × hệ số này đẩy phân vị thu nhập mục tiêu (chặn ±0,1)
    patronYrs: 4, patronP: .07,   // vòng 4: làm đủ năm thì mỗi năm có cơ hội chủ nhà để mắt
    artYrs: 5, artP: .06,         // nghề nghệ thuật: tác phẩm được nhận
    wrathP: .006,                 // vòng 4: chủ nổi giận
    alchemist: .4,                // dược sư mua (tự pha) dược tề với giá × này
    runeGear: .08                 // khắc văn sư: mỗi năm có cơ hội đồ +1
  };
  G.RING_VI = ['', 'Người có cấp sống bằng sức', 'Phục vụ tu luyện', 'Sinh kế cơ bản', 'Phục vụ quý tộc xa hoa'];

  // ═════════ Cầu theo nơi ở ═════════
  const here = S => G.here(S).s, live = s => s && s.tier !== 'ruin';
  const magicOf = S => (G.REGION[S.loc] || {}).magic || .5;
  G.DEMAND = {
    cult: S => {
      const s = here(S); if (!live(s)) return .2;
      const b = s.bld || [], base = { capital: 1.3, city: 1.1, town: .8, village: .45, hamlet: .25 }[s.tier] || .2;
      return (base + (b.includes('guild') ? .2 : 0) + (b.includes('barracks') ? .1 : 0) + (b.includes('school') ? .1 : 0)) * (.7 + .6 * magicOf(S));
    },
    noble: S => {
      const s = here(S); if (!live(s)) return 0;
      const n = s.nation >= 0 ? G.realm.nations[s.nation] : null, titled = !!n && G.grantsTitles && G.grantsTitles(n.idx);
      const rich = n && n.gov === 'merchant', ruled = n && G.GOVS[n.gov] && G.GOVS[n.gov].ruled;
      if (s.tier === 'capital') return titled ? 1.4 : rich ? 1.1 : ruled ? .9 : .5;
      if (s.tier === 'city') return titled ? 1 : rich ? .8 : .45;
      if (s.tier === 'town') return s.fief ? .8 : titled ? .4 : rich ? .4 : .25;
      return s.fief ? .5 : .1;
    },
    wild: S => .35 + ((G.REGION[S.loc] || {}).danger || .3) * 1.3 + Math.min(.3, (G.lairsNear ? G.lairsNear(S).length : 0) * .1),
    trade: S => {
      const s = here(S); if (!live(s)) return .1;
      return ({ capital: 1.2, city: 1, town: .75, village: .3, hamlet: .15 }[s.tier] || .1) + ((s.bld || []).includes('market') ? .15 : 0) + ((s.roles || []).includes('port') ? .1 : 0);
    },
    ore: S => .7 + .8 * magicOf(S) + (G.mineHere && G.mineHere(S) ? .6 : 0)   // mỏ ma tinh trong tỉnh (js/dynamic.js, bước D)
  };
  G.DEMAND_VI = { cult: 'người có cấp quanh đó', noble: 'nhà quý tộc', wild: 'sơn mạch ma thú', trade: 'chợ, cảng, thương đoàn', ore: 'ma lực của mỏ' };
  G.demandOf = (S, k) => (G.DEMAND[k] ? G.DEMAND[k](S) : 1);
  G.demandShift = (S, w) => G.clamp((G.demandOf(S, w.demand) - 1) * G.ECON.shift, -.1, .1);

  // Dược sư tự pha dược tề (js/status.js G.elixirCost).
  { const base = G.elixirCost; G.elixirCost = (S, X, l) => base(S, X, l) * (S.work === 'alchemist' ? G.ECON.alchemist : 1); }
  // Chủ nhà cho học cùng con mình: nguồn dạy "patron" (js/cult.js G.teachList).
  G.TEACHERS.push({ id: 'patron', nameVi: 'Chủ nhà quyền quý', tier: '2 (chủ nhà từ Bá tước hoặc kinh đô: 3)', schools: null, cond: 'làm nghề phục vụ quý tộc, được chủ nhà cho học cùng con (cv_patron)' });
  { const base = G.teachList; G.teachList = (S, school, job) => { const out = base(S, school, job), t = S.flags && S.flags.patronT; if (t) out.push({ t, id: 'patron', nameVi: 'Chủ nhà quyền quý' }); return out; }; }

  // ═════════ Hệ con "econ" (sau "status"): năm làm nghề, khắc văn, chủ nhà để mắt ═════════
  G.econYear = function (S, X) {
    const F = S.flags, ypt = X.R(S).ypt;
    if (S.undead || !S.work) { F.workYrs = 0; F.workAt = null; return; }
    if (F.workAt !== S.work) { F.workAt = S.work; F.workYrs = 0; }
    F.workYrs += ypt;
    if (S.work === 'runesmith' && S.gear < 10 && X.chance(G.ECON.runeGear * ypt)) { S.gear++; X.log(`Bạn khắc ma văn lên đồ của mình. Trang bị ${S.gear}/10.`, 'good'); cnt(S, 'runeGear'); }
    if (ringOf(S) === 4 && F.workYrs >= G.ECON.patronYrs && !F.patronDone && !F.patronQ && X.chance(G.ECON.patronP * ypt)) F.patronQ = true;
  };
  { const k = G.SYSTEMS.findIndex(s => s.id === 'status'); G.SYSTEMS.splice(k + 1, 0, { id: 'econ', when: S => !S.dead, run: (S, X) => G.econYear(S, X) }); }

  // ═════════ Chủ nhà để mắt (vòng 4) ═════════
  const patronName = (S, X) => {
    const s = here(S), n = s && s.nation >= 0 ? G.realm.nations[s.nation] : null;
    if (s && s.fief) return { name: `${G.NOBLE_VI[s.fief.rank] || 'Lãnh chúa'} ${s.fief.name}`, high: (s.fief.rank || 0) >= 3 };
    const L = n && G.noblesOf ? G.noblesOf(S.world, n.idx).filter(x => !x.player) : [];
    if (L.length) { const x = L[Math.floor(X.rnd() * L.length)]; return { name: `${G.NOBLE_VI[x.rank]} ${x.name}`, high: x.rank >= 3 || (s && s.tier === 'capital') }; }
    return { name: 'chủ nhà', high: !!(s && s.tier === 'capital') };
  };
  DEC.cv_patron = {
    prio: 5, gap: 1,
    when: S => !S.dead && !!S.flags.patronQ && ringOf(S) === 4,
    build(S, X) {
      const p = S.flags.patronQ === true ? (S.flags.patronQ = patronName(S, X)) : S.flags.patronQ, w = W(S.work).nameVi.toLowerCase(), t = p.high ? 3 : 2;
      return { title: 'Chủ nhà để mắt', body: `${p.name[0].toUpperCase() + p.name.slice(1)} khen bạn trước khách: ${S.flags.workYrs >= 8 ? 'nhiều năm' : 'mấy năm'} làm ${w} chưa lần nào làm phật lòng. Chủ nhà hỏi bạn muốn gì.`,
        choices: [{ k: 'learn', label: 'Xin học cùng con chủ', sub: `Thầy của nhà dạy bạn tới Tier ${t}.` }, { k: 'elixir', label: 'Xin dược tề', sub: 'Năm năm được ban dược tề tốt, không mất tiền.' }, { k: 'gold', label: 'Nhận thưởng', sub: `Khoảng ${G.coin(Math.round(G.median(X.reg(S)) * 3))}.` }] };
    },
    apply(S, X, k) {
      const p = S.flags.patronQ, F = S.flags; F.patronQ = null; F.patronDone = true; cnt(S, 'patron_' + k);
      if (k === 'learn') { F.patronT = p && p.high ? 3 : 2; return 'Mỗi sáng bạn đứng cuối sân tập, sau lưng mấy cậu chủ.'; }
      if (k === 'elixir') { F.giftElixir = 5; return 'Quản gia đưa bạn một hộp gỗ, trong có mười lọ dược tề.'; }
      X.money(Math.round(G.median(X.reg(S)) * 3)); X.add('so', 4); return 'Chủ nhà thưởng một túi bạc nặng tay.';
    },
    auto: S => ['martial', 'adventure', 'power'].includes(S.aim) || S.traits.bold > .6 ? 'learn' : S.traits.studious > .5 ? 'elixir' : 'gold'
  };

  // ═════════ Tác phẩm được nhận, chủ nổi giận ═════════
  G.EVENTS.push(
    { id: 'cv_art', st: ['adult', 'elder'], c: S => !S.undead && !!(W(S.work) || {}).art && (S.flags.workYrs || 0) >= G.ECON.artYrs, w: () => G.ECON.artP * 30, rep: true, gap: 4,
      run(S, X) {
        const F = S.flags, med = G.median(X.reg(S)), g = Math.round(med * X.int(2, 8)), w = W(S.work).nameVi.toLowerCase();
        X.money(g); S.fame = Math.min(100, S.fame + 4); cnt(S, 'artSold');
        if (!F.artMaster && X.chance(.2 + S.fame / 300)) {
          F.artMaster = true; S.pct = Math.min(.99, S.pct + .12); S.fame = Math.min(100, S.fame + 10); cnt(S, 'artMasterN');
          return { t: `Phòng trưng bày ở kinh đô treo tác phẩm của bạn ngay sảnh chính. Đấu giá được ${G.coin(g)}. Từ nay người ta gọi bạn là danh gia.`, k: 'big' };
        }
        return { t: `Một tác phẩm của bạn (${w}) được phòng trưng bày nhận, bán đấu giá được ${G.coin(g)}.`, k: 'good' };
      } },
    { id: 'cv_wrath', st: ['adult', 'elder'], c: S => !S.undead && ringOf(S) === 4 && (S.flags.workYrs || 0) >= 2, w: () => G.ECON.wrathP * 30, rep: true, gap: 10,
      run(S, X) {
        cnt(S, 'wrath');
        if (X.chance(.4)) { X.add('h', -3); return { t: 'Chủ nhà nổi giận vì một chuyện nhỏ. Quản gia đứng ra nhận lỗi thay, bạn chỉ bị mắng.', k: 'bad' }; }
        if (X.chance(.5)) { S.work = null; S.flags.workQ = true; S.pct = Math.max(.05, S.pct * .7); X.add('h', -8); cnt(S, 'wrathFired'); return { t: 'Chủ nhà nổi giận vì một chuyện nhỏ, đuổi bạn ra khỏi phủ ngay trong đêm.', k: 'bad' }; }
        X.add('hl', -X.int(6, 16)); X.add('h', -6);
        return { t: 'Chủ nhà say rượu, đổ lỗi cho bạn trước mặt khách rồi sai người đánh hai mươi roi.', k: 'bad' };
      } }
  );

  // ═════════ Đổi nghề khi lên Tier: nghề của người có cấp mở ra ═════════
  const reworkOpts = S => { const T = G.tierOf(S); return Object.entries(G.WORKS).filter(([id, w]) => w.tier && w.tier <= T && id !== S.work && G.workOK(S, id) && (!G.workFee(S, id) || S.gold >= G.workFee(S, id))).map(([id]) => id); };
  DEC.cv_rework = {
    prio: 4, gap: 2,
    when: (S, X) => !S.dead && !S.undead && !!S.work && X.stage(S) === 'adult' && !S.flags.retired && G.tierOf(S) >= 1 && S.flags.reworkT !== G.tierOf(S) && reworkOpts(S).length > 0,
    build(S, X) {
      const T = G.tierOf(S), reg = X.reg(S), cur = W(S.work).nameVi.toLowerCase();
      const opts = reworkOpts(S).sort((a, b) => W(b).pct[1] - W(a).pct[1]).slice(0, 3);
      return { title: 'Nghề của người có cấp', body: `Giờ bạn là ${G.tierName(T)}. Có những nghề chỉ nhận người có cấp, trả cao hơn làm ${cur}.`,
        choices: [...opts.map(id => { const w = W(id), m = G.incomeMult({ ...S, work: id }); return { k: id, label: w.nameVi, sub: `${G.RING_VI[w.ring]} · thu nhập ${Math.round(G.incomeAt(reg, w.pct[0]) * m)}–${G.coin(Math.round(G.incomeAt(reg, w.pct[1]) * m))}/năm` + (w.risk > 1.4 ? ' · nguy hiểm' : '') }; }),
          { k: 'keep', label: `Giữ nghề ${cur}`, sub: '' }] };
    },
    apply(S, X, k) {
      S.flags.reworkT = G.tierOf(S);
      if (k === 'keep') return null;
      const old = W(S.work).nameVi.toLowerCase(), fee = G.workFee(S, k); if (fee) X.money(-fee);
      S.work = k; S.pct = Math.max(S.pct * .8, W(k).pct[0]); cnt(S, 'rework');
      return `Bạn thôi làm ${old}, nhận việc ${W(k).nameVi.toLowerCase()}.`;
    },
    auto(S, X, d) {
      const c = d.choices.find(c => c.k !== 'keep'), cur = W(S.work);
      return c && W(c.k).pct[1] > cur.pct[1] + .05 && X.chance(.45 + S.traits.bold * .3) ? c.k : 'keep';
    }
  };

  G.workText = id => { const w = W(id); if (!w) return ''; return `${G.RING_VI[w.ring]}${w.tier ? ' · cần ' + G.tierName(w.tier) : ''}${w.demand ? ' · cầu: ' + G.DEMAND_VI[w.demand] : ''}`; };
})(window.LifeSim);
