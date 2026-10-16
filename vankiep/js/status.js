/* Vạn Kiếp — ĐỊA VỊ THEO TIER (bước B của docs/07 mục 7; bảng docs/09 mục 6.4; số chốt và kết quả ở docs/07 mục 4.10).
 * Tier nghề (js/cult.js G.tierOf) là thân phận: từ Chức Nghiệp Giả trở lên là người được ghi tên vào sổ.
 *   Thân phận (G.STATUS): sàn phân vị thu nhập (life.js workYear), hệ số thuế (js/state.js G.taxRate), tầng lớp tối thiểu;
 *     miễn thuế đầu người và nghĩa vụ của dân thường (js/state.js); nước quản chặt (G.strictNation) bắt đăng ký (cv_license),
 *     chưa đăng ký thì không được giảm thuế và có thể bị bắt; khi chiến tranh thì triệu tập (cv_levy). Huyền Thoại Giả đứng ngoài luật.
 *   Chức (js/org.js, js/noble.js): trưởng thị trấn Tier 1, thành phố và Quan tỉnh Tier 2, Đại thần Tier 3; quản sự Tier 1,
 *     hội trưởng và trưởng chi nhánh Hiệp Hội Tier 2; kế tước Nam, Tử Tier 1, Bá Tier 2, Hầu, Công Tier 3 (G.TITLE_TIER: chưa đủ
 *     thì có hạn rồi giáng tước); thang thăng tiến G.PROMO nhân giá trị xét theo Tier, trọng số theo chính thể (G.PROMO_TW).
 *   Cung phụng (cv_retainer): từ Siêu Phàm Giả, nhà quý tộc / hội / triều đình mời về nuôi; bổng theo Tier, đôi khi phải ra tay.
 *   Dược tề (cv_elixir): mua mỗi năm, điểm rèn năm sau × G.ELIXIR[mức].mult (js/cult.js skTrain); nhà khá giả mua cho con tuổi thiếu niên.
 *   Căn cốt theo cha mẹ (G.bloodRoot, gọi lúc sinh): cha mẹ có căn cốt; nhà quý tộc, hoàng tộc nghiêng lên.
 *   Sự kiện, quyết định: cv_test (lễ thử thiên phú), cv_scorn (bị coi thường trong nhà quý tộc), cv_license, cv_levy,
 *     cv_bully (người có cấp ức hiếp phàm nhân), cv_kin (bạn đời phàm nhân già đi), cv_lifespan (tuổi già, liều đột phá lần cuối).
 * Trạng thái: S.roles.retainer, S.elixir (mức người chơi chọn; null là tự động), S.flags.elixirM (hệ số đang dùng),
 *   S.flags.reg = { nước: 1 đăng ký | 2 có chứng chỉ }, S.flags.vow (hẹn ước ba năm), S.roles.noble.due (hạn đạt Tier của tước),
 *   cha mẹ: p.root (bậc căn cốt).
 */
window.LifeSim = window.LifeSim || {};
(function (G) {
  const DEC = G.DECISIONS;
  const cnt = (S, k, v = 1) => { S.flags[k] = (S.flags[k] || 0) + v; };
  const roles = S => S.roles || (S.roles = { head: null, office: null, ruler: null, orgs: {}, adv: null });
  const nationOf = S => S.nation != null && S.nation >= 0 && G.realm ? G.realm.nations[S.nation] : null;
  const aliveN = (S, k) => { const d = S.world && S.world.dyn.nat[k]; return !!d && d.alive; };
  const num = v => String(+v.toFixed(2)).replace('.', ',');

  // ═════════ Thân phận theo Tier (docs/09 mục 6.4) ═════════
  // floor: sàn phân vị thu nhập; tax: × thuế (đã đăng ký, hoặc ở nước không bắt đăng ký); q: tầng lớp tối thiểu (nước có luật Đẳng cấp thì không đổi).
  G.STATUS = [
    { floor: 0,   tax: 1,   q: 0, d: 'Dân thường: nộp thuế đầu người, đi nghĩa vụ khi nước gọi.' },
    { floor: .35, tax: .85, q: 0, d: 'Được ghi tên vào sổ: miễn thuế đầu người, miễn lao dịch và nghĩa vụ của dân thường. Nước quản chặt bắt đăng ký và triệu tập khi chiến tranh. Đủ để làm trưởng thị trấn, quản sự trong hội, giữ tước Nam, Tử.' },
    { floor: .6,  tax: .75, q: 3, d: 'Được mời làm cung phụng, hộ vệ cho nhà quý tộc, hội, triều đình. Đủ để làm Quan tỉnh, trưởng thành phố, hội trưởng, giữ tước Bá.' },
    { floor: .8,  tax: .6,  q: 4, d: 'Tướng lĩnh, Đại thần, viện trưởng. Giữ được tước Hầu, Công. Triều đình mời làm cung phụng.' },
    { floor: .93, tax: .4,  q: 4, d: 'Nước nào cũng muốn giữ: phong tước, cấp đất. Nước khác coi một Thủ Hộ Giả như một đạo quân.' },
    { floor: .97, tax: 0,   q: 4, d: 'Đứng ngoài luật của một nước: không nộp thuế, không bị bắt vì luật cấm phép, vua chúa đối đãi ngang hàng.' }
  ];
  G.TITLE_TIER = [0, 1, 1, 2, 3, 3];                  // Tier tối thiểu để giữ tước Nam … Công (js/noble.js)
  G.TITLE_GRACE = 12;                                  // số năm được giữ tước tạm khi kế tước mà chưa đủ Tier
  G.HEAD_TIER = { hamlet: 0, village: 0, town: 1, city: 2 };   // trưởng khu (js/org.js head_elect)
  G.OFFICE_TIER = [0, 2, 3];                           // Quan tỉnh, Đại thần
  G.ORG_TIER = [0, 1, 2];                              // thành viên, quản sự, hội trưởng (trưởng chi nhánh Hiệp Hội như hội trưởng)
  // Trọng số Tier khi xét thăng tiến theo chính thể (js/noble.js G.PROMO): giá trị xét × (1 + tw × Tier).
  G.PROMO_TW = { magocracy: .5, military: .4, tribal: .35, horde: .35, order: .25, confederacy: .25, theocracy: .2, council: .15, merchant: .1 };
  G.RET_PAY = [0, 0, 1.2, 2.5, 5, 9];                  // bổng cung phụng mỗi năm × thu nhập trung vị vùng
  G.ELIXIR = [
    { nameVi: 'Không dùng',          mult: 1,    cost: 0 },
    { nameVi: 'Dược tề thường',      mult: 1.2,  cost: .6 },
    { nameVi: 'Dược tề tốt',         mult: 1.35, cost: 1.8 },
    { nameVi: 'Dược tề thượng hạng', mult: 1.5,  cost: 5 }
  ];
  G.BLOOD = { inherit: .4, house: .35, royal: .6 };   // căn cốt: xác suất con theo cha mẹ; độ nghiêng lên khi bốc căn cốt cha mẹ nhà quý tộc, hoàng tộc

  G.sTier = S => S.undead ? 0 : G.tierOf(S);   // Bộ Xương đứng ngoài xã hội
  // Nước quản chặt: chính thể hoặc luật quản dân; nước quản lỏng: không quản chặt và có chính thể hoặc luật thả lỏng.
  G.STRICT = { gov: ['military', 'magocracy', 'empire', 'theocracy'], law: ['mage_license', 'conscript', 'caste', 'penal_labor'] };
  G.LAX = { gov: ['tribal', 'horde', 'confederacy'], law: ['raid_law', 'open_borders'] };
  G.strictNation = n => !!n && (G.STRICT.gov.includes(n.gov) || n.laws.some(l => G.STRICT.law.includes(l)));
  G.laxNation = n => !!n && !G.strictNation(n) && (G.LAX.gov.includes(n.gov) || n.laws.some(l => G.LAX.law.includes(l)));
  // Thân phận được nước đang ở công nhận: nước quản chặt cần đăng ký; Huyền Thoại Giả thì nước nào cũng nể.
  G.regOf = S => { const n = nationOf(S); return n && S.flags.reg ? S.flags.reg[n.idx] || 0 : 0; };
  G.recognized = S => { const t = G.sTier(S); if (!t) return false; const n = nationOf(S); return !n || t >= 5 || !G.strictNation(n) || G.regOf(S) > 0; };
  G.pctFloor = S => G.STATUS[G.sTier(S)].floor;
  G.statusTax = S => G.recognized(S) ? G.STATUS[G.sTier(S)].tax : 1;
  G.statusIncome = S => G.regOf(S) === 2 ? 1.08 : 1;   // có chứng chỉ (cv_license): được trả cao hơn
  G.elixirCost = (S, X, l) => G.ELIXIR[l].cost * G.median(X.reg(S)) * (1 + .6 * G.sTier(S));

  // ═════════ Căn cốt theo cha mẹ (life.js newLife gọi sau G.birthOrigin) ═════════
  // Cha mẹ bốc căn cốt cùng phân bố với lúc sinh (nhà quý tộc, hoàng tộc nghiêng lên); con có BLOOD.inherit cơ hội lấy bậc trung bình của cha mẹ
  // (làm tròn), còn lại giữ bậc tự bốc. Dân thường nhờ vậy trung bình gần như không đổi. Trả true nếu căn cốt con đổi.
  G.bloodRoot = function (X) {
    const S = X.S, P = S.family.parents; if (!S.tal || !P.length || G.RACES[S.race].construct) return false;
    const up = S.flags.royal ? G.BLOOD.royal : S.flags.house ? G.BLOOD.house : 0;
    for (const p of P) p.root = X.wpick([0, 1, 2, 3, 4, 5], k => G.RARITY[k].w * Math.exp(up * k));
    if (!X.chance(G.BLOOD.inherit)) return false;
    const a = P.reduce((s, p) => s + p.root, 0) / P.length, k = Math.floor(a) + (X.chance(a - Math.floor(a)) ? 1 : 0), old = G.RANK[S.tal.root];
    if (k === old) return false;
    S.tal.root = G.RARITY[k].id; S.flags.root0 = S.tal.root; S.flags.rootBlood = k - old;
    G.talRecalc(S);
    return true;
  };

  // ═════════ Hệ con "status" (sau "noble"): tầng lớp, dược tề, cung phụng, hẹn ước, hạn tước ═════════
  G.statusYear = function (S, X) {
    const F = S.flags, st = X.stage(S), T = G.sTier(S), n = nationOf(S), med = G.median(X.reg(S)), r = roles(S), ypt = X.R(S).ypt;
    if (S.undead) { F.elixirM = 1; return; }
    if (T && !(n && n.laws.includes('caste'))) S.q = Math.max(S.q, G.STATUS[T].q);
    if (T) S.pct = Math.max(S.pct, G.STATUS[T].floor);   // sàn thu nhập: người có cấp được trả theo thân phận ngay
    F.tierMax = Math.max(F.tierMax || 0, T);
    // Dược tề: thiếu niên do nhà mua (nhà khá giả trở lên, nhà quý tộc, hoàng tộc); người lớn tự mua theo mức đã chọn, thiếu tiền thì hạ mức.
    let l = 0, payer = null;
    if (st === 'teen' && S.family.parents.some(p => p.alive)) { l = F.royal ? 3 : F.house ? 2 : S.q >= 5 ? 1 : 0; payer = 'family'; }
    else if (st === 'adult' || st === 'elder') { l = S.elixir != null ? S.elixir : S.auto ? autoElixir(S, X) : 0; payer = 'self'; while (l > 0 && S.gold < G.elixirCost(S, X, l)) l--; }
    if (F.giftElixir > 0 && payer === 'self') { l = Math.max(l, 2); payer = 'gift'; F.giftElixir -= ypt; }   // chủ nhà ban dược tề (js/econ.js cv_patron)
    if (l > 0 && payer === 'self') X.money(-G.elixirCost(S, X, l));
    F.elixirM = G.ELIXIR[l].mult;
    if (l > 0) { cnt(S, 'elixirY', ypt); F.elixirMax = Math.max(F.elixirMax || 0, l); }
    // Cung phụng: bổng khi còn ở nước đó; mất chỗ khi rời nước, nước mất; thỉnh thoảng phải ra tay.
    const R = r.retainer;
    if (R) {
      if (R.k !== S.nation || !aliveN(S, R.k)) { X.log(`Bạn thôi làm cung phụng cho ${R.name}: ${R.k !== S.nation ? 'bạn đã rời nước' : 'nước đã mất'}.`, 'info'); r.retainer = null; }
      else {
        X.money(Math.round(med * G.RET_PAY[Math.max(2, T)] * ypt));
        if (st !== 'elder' && X.chance(.1 * ypt)) duty(S, X, R, T);
      }
    } else if (T >= 2 && st === 'adult' && n && !F.retOffer && !r.ruler && X.chance(.08 * (T - 1) * ypt)) F.retOffer = patron(S, X, T);
    // Hẹn ước ba năm (cv_scorn): tới hạn thì xét.
    if (F.vow && S.age >= F.vow.by) {
      const ok = F.vow.lv != null ? S.level >= F.vow.lv : T >= F.vow.t; cnt(S, ok ? 'vowOk' : 'vowFail');
      if (ok) { S.fame = Math.min(100, S.fame + 8); X.add('h', 10); X.add('so', 8); X.log(`Ba năm hẹn ước đã tới. Bạn đứng trước cả họ, level ${S.level}, ${G.tierName(T)}. Không ai còn nhắc chuyện cũ.`, 'big'); }
      else { S.fame = Math.max(0, S.fame - 5); X.add('h', -10); X.log('Ba năm hẹn ước đã tới mà bạn vẫn chưa lên được. Người ta không nói gì, chỉ nhìn.', 'bad'); if (F.vow.heir) dropHeir(S, X); }
      F.vow = null;
    }
    // Tước giữ tạm (kế tước khi chưa đủ Tier, js/noble.js): đủ Tier thì triều đình xác nhận, quá hạn thì giáng.
    const nb = r.noble;
    if (nb && nb.due) {
      if (T >= nb.due.t) { X.log(`Bạn đã là ${G.tierName(T)}. Triều đình xác nhận tước ${G.NOBLE_VI[nb.rank]} của bạn.`, 'good'); nb.due = null; cnt(S, 'titleOk'); }
      else if (S.age >= nb.due.by) G.demoteTitle(S, X, T);
    }
  };
  { const k = G.SYSTEMS.findIndex(s => s.id === 'noble'); G.SYSTEMS.splice(k + 1, 0, { id: 'status', when: S => !S.dead, run: (S, X) => G.statusYear(S, X) }); }

  // Chế độ tự động / chưa chọn: chí hướng tu luyện mua mạnh tay hơn; giữ lại ít nhất vài năm tiền.
  function autoElixir(S, X) {
    const keen = ['martial', 'adventure', 'power'].includes(S.aim) ? 6 : S.aim === 'free' || S.aim === 'family' ? 25 : 12;
    for (let l = 3; l > 0; l--) if (S.gold >= G.elixirCost(S, X, l) * keen) return l;
    return 0;
  }
  // Người mời làm cung phụng: triều đình (Tier ≥ 3), nhà quý tộc của nước ban tước, hội có trụ sở ở khu nhà.
  function patron(S, X, T) {
    const n = nationOf(S), out = [];
    if (T >= 3) out.push({ kind: 'court', k: n.idx, name: `triều đình ${n.name}` });
    if (G.grantsTitles && G.grantsTitles(n.idx)) {
      const L = G.noblesOf(S.world, n.idx).filter(x => !x.player && x.rank >= (T >= 3 ? 3 : 1));
      if (L.length) { const x = X.pick(L); out.push({ kind: 'noble', k: n.idx, name: `${G.NOBLE_VI[x.rank]} ${x.name}` }); }
    }
    const os = S.home.settlement && G.orgsAt ? G.orgsAt(S.world, S.home.settlement) : [];
    if (os.length) { const o = X.pick(os); out.push({ kind: 'org', k: n.idx, name: o.name }); }
    return out.length ? X.pick(out) : null;
  }
  // Việc của cung phụng: hộ tống, giữ nhà khi có kẻ tới, đấu thay chủ.
  function duty(S, X, R, T) {
    const th = T - .6 + X.rnd() * .9, p = 1 / (1 + Math.exp(-3.2 * (X.power(S) - th)));
    if (X.rnd() < p) { S.fame = Math.min(100, S.fame + 1); G.addMerit && G.addMerit(S, R.k, 2); X.money(Math.round(G.median(X.reg(S)) * .5 * T)); X.log(`Bạn ra tay cho ${R.name}: ${X.pick(['đẩy lui toán thích khách đột nhập', 'hộ tống chuyến hàng qua đèo', 'đấu thay chủ trong một cuộc thách đấu danh dự'])}. Được thưởng thêm.`, 'good'); cnt(S, 'dutyWin'); }
    else { X.add('hl', -X.int(8, 20)); X.cond('wound'); X.log(`Bạn ra tay cho ${R.name} và bị thương nặng. Chủ nhà cho người chữa.`, 'bad'); cnt(S, 'dutyLoss'); }
  }
  // Mất quyền kế tước: tước về em kế (em không có trong danh sách anh chị; lost chặn js/noble.js trao lại khi anh chị đều mất).
  function dropHeir(S, X) {
    const H = S.flags.house; if (!H || !H.heir || H.done) return;
    H.heir = false; H.lost = true; cnt(S, 'heirLost'); X.log(`Gia tộc chọn người khác kế tước ${G.NOBLE_VI[H.rank]}.`, 'bad');
  }
  // Giáng tước khi quá hạn: xuống bậc cao nhất mà Tier hiện tại giữ được; Phàm Nhân thì mất tước.
  G.demoteTitle = function (S, X, T) {
    const nb = roles(S).noble; if (!nb) return;
    let r = nb.rank - 1; while (r > 0 && G.TITLE_TIER[r] > T) r--;
    const old = G.NOBLE_VI[nb.rank], need = G.TITLE_TIER[nb.rank], k = nb.k;
    cnt(S, 'titleDemote');
    if (r <= 0) { G.stripTitle(S, k, `không người kế tước nào đạt nổi ${G.tierName(G.TITLE_TIER[1])}`); X.log(`Hết hạn mà bạn vẫn là ${G.tierName(T)}. Triều đình thu lại tước ${old}.`, 'bad'); return; }
    nb.rank = r; nb.due = null;
    if (r < 3 && nb.fief && G.dropFief) G.dropFief(S);
    const L = (S.world.dyn.nobles || {})[k], me = L && L.find(x => x.player && x.name === S.name); if (me) me.rank = r;
    G.histAdd(S.world, 'noble', `${S.name} bị giáng từ ${old} xuống ${G.NOBLE_VI[r]} của ${G.realm.nations[k].name}: chưa đạt ${G.tierName(need)}.`);
    X.log(`Hết hạn mà bạn chưa đủ sức giữ tước ${old}. Triều đình giáng bạn xuống ${G.NOBLE_VI[r]}.`, 'bad');
  };

  // ═════════ Quyết định: cung phụng, dược tề ═════════
  DEC.cv_retainer = {
    prio: 5, gap: 1,
    when: S => !S.dead && !!S.flags.retOffer && !roles(S).retainer,
    build(S, X) {
      const o = S.flags.retOffer, T = G.sTier(S), pay = Math.round(G.median(X.reg(S)) * G.RET_PAY[T]);
      return { title: 'Lời mời cung phụng', body: `${o.name[0].toUpperCase() + o.name.slice(1)} muốn mời một ${G.tierName(T)} về làm cung phụng: ăn ở trong phủ, bổng ${G.coin(pay)} mỗi năm, khi có việc thì ra tay.`,
        choices: [{ k: 'yes', label: 'Nhận lời', sub: `Bổng ${G.coin(pay)}/năm khi còn ở ${G.realm.nations[o.k].name}; đôi khi phải đánh thay chủ.` }, { k: 'no', label: 'Từ chối', sub: 'Giữ tự do.' }] };
    },
    apply(S, X, k) {
      const o = S.flags.retOffer; S.flags.retOffer = null;
      if (k !== 'yes') { cnt(S, 'retNo'); return null; }
      roles(S).retainer = { k: o.k, kind: o.kind, name: o.name, since: S.world.year }; cnt(S, 'retainer');
      return `Bạn làm cung phụng cho ${o.name}.`;
    },
    auto: S => S.traits.social > .35 || S.traits.bold < .5 || S.gold < 50 ? 'yes' : 'no'
  };
  DEC.cv_elixir = {
    prio: 3, gap: 2,
    when: (S, X) => !S.dead && !S.undead && ['adult', 'elder'].includes(X.stage(S)) && S.flags.elixirAsk !== G.sTier(S) && S.gold >= G.elixirCost(S, X, 1) * 3,
    build(S, X) {
      const T = G.sTier(S);
      return { title: 'Dược tề', body: `Tiệm dược ở chợ bày dược tề cho ${G.tierName(T)}: uống đều thì luyện nhanh hơn. Giá theo bậc của người dùng. Bạn có ${G.coin(S.gold)}.`,
        choices: G.ELIXIR.map((e, l) => ({ k: String(l), label: e.nameVi, sub: l ? `${G.coin(Math.round(G.elixirCost(S, X, l)))}/năm · điểm rèn ×${num(e.mult)}${S.gold < G.elixirCost(S, X, l) * 3 ? ' · tiền chỉ đủ vài năm' : ''}` : 'Giữ tiền.' })) };
    },
    apply(S, X, k) { S.flags.elixirAsk = G.sTier(S); S.elixir = +k; return +k ? `Mỗi năm bạn mua ${G.ELIXIR[+k].nameVi.toLowerCase()}. Thiếu tiền năm nào thì hạ xuống loại rẻ hơn.` : null; },
    auto: (S, X) => String(autoElixir(S, X))
  };

  // ═════════ Đăng ký, chứng chỉ ở nước quản chặt ═════════
  DEC.cv_license = {
    prio: 5, gap: 3,
    when(S, X) {
      const n = nationOf(S), T = G.sTier(S);
      return !S.dead && T >= 1 && T < 5 && G.strictNation(n) && ['adult', 'elder'].includes(X.stage(S)) && !G.regOf(S) && !(S.flags.wanted && S.flags.wanted[n.idx]);
    },
    build(S, X) {
      const n = nationOf(S), T = G.sTier(S), fee = Math.round(G.median(X.reg(S)) * .5 * T), p = examP(S, X);
      return { title: 'Sổ người có cấp', body: `${n.name} ghi tên mọi ${G.tierName(1)} trở lên vào sổ: được miễn thuế đầu người, giảm thuế (×${num(G.STATUS[T].tax)}), đổi lại phải ra trận khi có lệnh. Lệ phí ${G.coin(fee)}.`,
        choices: [{ k: 'reg', label: 'Đăng ký', sub: `Nộp ${G.coin(fee)}; thuộc diện triệu tập khi chiến tranh.`, fee },
          { k: 'exam', label: 'Thi chứng chỉ', sub: `Nộp ${G.coin(fee * 2)}; đậu (~${Math.round(p * 100)}%) thì có chứng chỉ: thu nhập ×1,08, có tiếng. Trượt vẫn được ghi tên.`, fee: fee * 2 },
          { k: 'hide', label: 'Không đăng ký', sub: 'Không được giảm thuế; lính bắt được thì bị phạt như phạm luật.' }] };
    },
    apply(S, X, k, c) {
      const n = nationOf(S), F = S.flags, R = F.reg || (F.reg = {});
      if (k === 'hide') { F.regHide = (F.regHide || 0) + 1; R[n.idx] = 0; return null; }
      X.money(-Math.min(Math.max(0, S.gold), c.fee));
      if (k === 'exam') {
        if (X.chance(examP(S, X))) { R[n.idx] = 2; cnt(S, 'regCert'); S.fame = Math.min(100, S.fame + 2 * G.sTier(S)); return `Bạn đậu. Chứng chỉ ${G.tierName(G.sTier(S))} của ${n.name} mang dấu ấn triện đỏ.`; }
        R[n.idx] = 1; cnt(S, 'regYes'); return 'Bạn trượt kỳ thi, nhưng tên vẫn được ghi vào sổ.';
      }
      R[n.idx] = 1; cnt(S, 'regYes'); return `Tên bạn nằm trong sổ người có cấp của ${n.name}.`;
    },
    auto: S => S.traits.bold > .8 && S.traits.social < .3 ? 'hide' : S.traits.studious > .55 ? 'exam' : 'reg'
  };
  const examP = (S, X) => G.clamp(.35 + .2 * (X.power(S) - G.sTier(S) - .5) + S.sm / 300, .1, .9);
  // Không đăng ký ở nước quản chặt: mỗi năm có lúc bị bắt (js/state.js G.caught).
  G.EVENTS.push({ id: 'cv_unreg', st: ['adult', 'elder'], c: S => G.sTier(S) >= 1 && G.sTier(S) < 5 && G.strictNation(nationOf(S)) && S.flags.reg && S.flags.reg[S.nation] === 0, w: 1, rep: true, gap: 3,
    run(S, X) { const n = nationOf(S); if (X.chance(.5)) { G.caught(X, n, 'hành nghề có cấp mà không đăng ký'); return null; } return { t: `Lính ${n.name} hỏi giấy của người có cấp ở cổng chợ. Bạn vòng đường khác.`, k: 'info' }; } });

  // ═════════ Lệnh triệu tập khi chiến tranh ═════════
  const warOf = S => { const k = S.nation; if (k == null || k < 0) return null; return (S.world.dyn.wars || []).find(w => w.a === k || w.b === k) || null; };
  DEC.cv_levy = {
    prio: 8, gap: 2,
    when(S, X) {
      const T = G.sTier(S), n = nationOf(S), w = warOf(S);
      if (S.dead || !T || !w || X.stage(S) !== 'adult' || S.flags.soldier > 0 || roles(S).ruler != null || S.flags.levyWar === w.start) return false;
      return G.strictNation(n) ? G.regOf(S) > 0 : T >= 2;   // nước quản chặt gọi người trong sổ; nước khác chỉ gọi từ Siêu Phàm Giả
    },
    build(S, X) {
      const n = nationOf(S), w = warOf(S), foe = G.realm.nations[w.a === n.idx ? w.b : w.a], T = G.sTier(S), cost = Math.round(G.median(X.reg(S)) * 2 * T);
      const ch = [{ k: 'go', label: 'Ra trận', sub: `Một năm trong quân ngũ${T >= 3 ? ', dẫn một cánh quân' : ''}; công trạng, danh vọng; có thể chết.` }];
      if (S.gold >= cost) ch.push({ k: 'pay', label: `Nộp ${G.coin(cost)} miễn`, sub: 'Theo lệ, người có cấp được nộp tiền thay.', cost });
      ch.push({ k: 'flee', label: 'Trốn lệnh', sub: `Bị truy nã ở ${n.name}.` });
      return { title: 'Lệnh triệu tập', body: `${n.name} đang đánh ${foe.name}. Sổ ghi bạn là ${G.tierName(T)}: lệnh gọi tới tận nhà.`, choices: ch };
    },
    apply(S, X, k, c) {
      const n = nationOf(S), w = warOf(S), T = G.sTier(S); S.flags.levyWar = w.start;
      if (k === 'pay') { X.money(-c.cost); cnt(S, 'levyPay'); return 'Bạn nộp tiền, ở lại hậu phương.'; }
      if (k === 'flee') { cnt(S, 'levyFlee'); (S.flags.wanted = S.flags.wanted || {})[n.idx] = true; S.fame = Math.max(0, S.fame - 3); S.flags.migrateQ = `Bạn trốn lệnh triệu tập. Ở lại ${n.name} là có ngày bị bắt.`; return 'Bạn trốn khỏi lệnh triệu tập.'; }
      // Ra trận: một năm tại ngũ (js/state.js, dynamic.js tính sức chiến tranh của người Tier ≥ 3), thêm một trận mở màn.
      cnt(S, 'levyGo'); S.flags.soldier = Math.max(S.flags.soldier || 0, 1); S.flags.served = true;
      const th = T - .3 + X.rnd() * .8, p = 1 / (1 + Math.exp(-3.2 * (X.power(S) - th)));
      if (X.rnd() < p) { G.addMerit && G.addMerit(S, n.idx, 5 * T); S.fame = Math.min(100, S.fame + 2 * T); X.money(Math.round(G.median(X.reg(S)) * T)); return `Trận mở màn: bạn ${T >= 3 ? 'dẫn cánh quân phá vỡ phòng tuyến' : 'đứng vững ở tiền tuyến'}. Tên bạn được đọc trước hàng quân.`; }
      X.add('hl', -X.int(12, 30));
      if (X.chance(.12 / T)) { cnt(S, 'levyDie'); X.die({ id: 'war', text: `tử trận khi ra trận theo lệnh triệu tập của ${n.name}` }); return null; }
      return 'Trận mở màn thua. Bạn được khiêng về doanh trại.';
    },
    auto: (S, X, d) => S.traits.bold > .4 || ['martial', 'adventure', 'power'].includes(S.aim) ? 'go' : d.choices.some(c => c.k === 'pay') && S.traits.bold < .25 ? 'pay' : S.traits.bold < .15 ? 'flee' : 'go'
  };

  // ═════════ Lễ thử thiên phú (6–10 tuổi người) ═════════
  G.EVENTS.push({ id: 'cv_test', st: ['child'], w: 30, c: (S, X) => { const R = X.R(S), y = X.years(S); return !R.construct && !!S.tal && y >= R.adult * .33 && y <= R.adult * .55; },
    run(S, X) {
      const k = G.RANK[S.tal.root], F = S.flags, s = G.SET && G.SET[S.home.settlement];
      const where = F.royal ? 'trong điện thờ hoàng tộc' : F.house ? 'trước bàn thờ dòng họ' : s && (s.bld || []).includes('temple') ? 'ở đền' : s && (s.bld || []).includes('school') ? 'ở trường' : 'ở nhà thầy cúng đầu làng';
      cnt(S, 'tested');
      let t = `Lễ thử thiên phú ${where}: bạn đặt tay lên viên đá thử. Nó sáng màu ${G.RARITY[k].nameVi.toLowerCase()}. ${G.ROOT_VI[k]}.`;
      if (k >= 3) { F.gifted = true; F.grantTry2 = 1; if (k >= 4) F.grantTry3 = 1; S.fame = Math.min(100, S.fame + 3); t += ' Người của học viện ghi tên bạn vào sổ, hứa sẽ có học bổng.'; return { t, k: 'big' }; }
      if (k === 0) { X.add('h', -3); t += ' Người lớn thở dài.'; }
      if ((F.house || F.royal) && k <= 1) F.scornQ = true;
      return { t, k: k ? 'info' : 'bad' };
    } });

  // ═════════ Bị coi thường trong nhà quý tộc (căn cốt kém lúc thử, hoặc trưởng thành mấy năm mà vẫn là Phàm Nhân) ═════════
  DEC.cv_scorn = {
    prio: 6, gap: 3,
    when(S, X) {
      const F = S.flags, st = X.stage(S); if (S.dead || F.scornDone || !(F.house || F.royal) || !['teen', 'adult'].includes(st)) return false;
      if (F.scornQ && st === 'teen') return true;
      return st === 'adult' && G.sTier(S) === 0 && X.years(S) >= X.R(S).adult + 3;
    },
    build(S, X) {
      const H = S.flags.house, heir = H && H.heir && !H.done;
      return { title: heir ? 'Bàn chuyện kế tước' : 'Thư từ hôn', body: heir ? `Họ hàng nói ra nói vào: con trưởng mà ${G.sTier(S) ? 'căn cốt tầm thường' : `chưa vào nổi ${G.tierName(1)}`}, giữ sao nổi tước ${G.NOBLE_VI[H.rank]}? Có người đề nghị để em bạn kế tước.`
        : `Nhà bên kia gửi thư từ hôn: không ai gả con cho người ${G.sTier(S) ? 'căn cốt tầm thường' : `chưa vào nổi ${G.tierName(1)}`}.`,
        choices: [{ k: 'bear', label: 'Nhẫn nhịn', sub: heir ? 'Có thể mất quyền kế tước.' : 'Nuốt cục tức.' },
          { k: 'vow', label: 'Hẹn ước ba năm', sub: `Ba năm nữa phải lên level ${vowLv(S)} (giờ ${S.level}): luyện ngày đêm, có dược tề thì tốt. Được thì rửa nhục; không được thì mất mặt${heir ? ', mất cả quyền kế tước' : ''}.` },
          { k: 'leave', label: 'Bỏ nhà đi', sub: 'Tự lập thân; mất người dạy của gia tộc.' }] };
    },
    apply(S, X, k) {
      const F = S.flags, H = F.house; F.scornDone = true; F.scornQ = false; cnt(S, 'scorn_' + k);
      if (k === 'bear') { X.add('h', -8); X.add('so', -4); if (H && H.heir && !H.done) dropHeir(S, X); return null; }
      if (k === 'vow') { F.vow = { by: S.age + 3 / X.R(S).ypt, lv: vowLv(S), heir: !!(H && H.heir && !H.done) }; if (S.auto) G.setAim(S, 'martial'); return 'Bạn nói trước cả họ: ba năm nữa hẵng nói chuyện.'; }
      if (H) { F.houseLeft = H; F.house = null; }
      X.add('h', 4); S.flags.migrateQ = 'Bạn rời nhà, không mang theo cái họ.';
      return 'Bạn xếp vài bộ quần áo và ra đi trước khi trời sáng.';
    },
    auto: S => S.traits.bold > .55 ? 'vow' : S.traits.social > .6 || S.traits.bold < .25 ? 'bear' : 'leave'
  };

  // Hẹn ước: ba năm phải hơn hiện tại 3 level (một Tier là 10 level; người thường mất khoảng 1,5 năm mỗi level ở Tier 0).
  const vowLv = S => Math.min(G.maxLvOf(S), S.level + 3);

  // ═════════ Người có cấp ức hiếp phàm nhân (nước quản lỏng) ═════════
  G.EVENTS.push({ id: 'cv_bully_ev', st: ['teen', 'adult', 'elder'], c: S => !S.undead && G.laxNation(nationOf(S)) && !S.flags.bullyQ, w: 1.2, rep: true, gap: 6,
    run(S, X) { S.flags.bullyQ = { t: G.sTier(S) ? G.clamp(G.sTier(S) - (X.chance(.5) ? 1 : 0), 1, 4) : X.chance(.85) ? 1 : 2 }; return null; } });
  DEC.cv_bully = {
    prio: 6, gap: 1,
    when: S => !S.dead && !!S.flags.bullyQ,
    build(S, X) {
      const b = S.flags.bullyQ, T = G.sTier(S), pw = X.power(S).toFixed(1);
      if (!T) return { title: 'Kẻ có cấp', body: `Một ${G.tierName(b.t)} say rượu đạp đổ hàng của bạn ở chợ rồi đòi bồi thường. Quan ở đây không can. Sức bạn ${pw}, hắn cỡ ${b.t + .3}.`,
        choices: [{ k: 'bear', label: 'Nhịn', sub: 'Mất ít tiền và chút tự trọng.' }, { k: 'resist', label: 'Chống lại', sub: 'Thắng thì nổi tiếng cả vùng; thua thì gãy xương, có khi mất mạng.' }] };
      return { title: 'Chuyện ở chợ', body: `Một ${G.tierName(b.t)} đang đánh một ông lão bán rau vì va phải áo hắn. Dân chợ đứng nhìn. Sức bạn ${pw}, hắn cỡ ${b.t + .3}.`,
        choices: [{ k: 'stop', label: 'Ra tay can', sub: 'Có tiếng tốt; thua thì bị thương.' }, { k: 'ignore', label: 'Đi qua', sub: '' }] };
    },
    apply(S, X, k) {
      const b = S.flags.bullyQ; S.flags.bullyQ = null; cnt(S, 'bully_' + k);
      if (k === 'bear') { X.money(-Math.min(Math.max(0, S.gold), X.int(3, 15))); X.add('h', -6); return null; }
      if (k === 'ignore') { if (S.traits.pious > .5 || S.traits.social > .6) X.add('h', -3); return null; }
      const p = 1 / (1 + Math.exp(-3.2 * (X.power(S) - b.t - .3)));
      if (X.rnd() < p) { cnt(S, 'bullyWin'); S.fame = Math.min(100, S.fame + 3 + G.sTier(S)); X.add('so', 6); X.add('h', 5); return k === 'resist' ? `Bạn hạ được một ${G.tierName(b.t)}. Từ hôm đó cả chợ gọi bạn bằng anh.` : 'Bạn bẻ quặt tay hắn. Ông lão cúi đầu cảm ơn mãi.'; }
      X.add('hl', -X.int(10, 28)); X.cond('wound');
      if (k === 'resist' && X.chance(.04)) { X.die({ id: 'bandit', text: `bị một ${G.tierName(b.t)} đánh chết giữa chợ` }); return null; }
      return 'Bạn thua. Mấy người quen dìu bạn về.';
    },
    auto: (S, X) => { const b = S.flags.bullyQ, T = G.sTier(S); if (!T) return S.traits.bold > .75 && X.power(S) > b.t + .1 ? 'resist' : 'bear'; return S.traits.bold + S.traits.social > .9 && X.power(S) > b.t + .6 ? 'stop' : 'ignore'; }
  };

  // ═════════ Bạn đời phàm nhân già đi trước mình ═════════
  const oldSpouse = (S, X) => {
    const sp = S.family.spouse; if (!sp || !sp.alive || S.flags.kinFor === sp.name) return false;
    const R = G.RACES[sp.race || S.race]; return sp.age >= R.le * .8 && X.stage(S) === 'adult';
  };
  DEC.cv_kin = {
    prio: 5, gap: 2,
    when: (S, X) => !S.dead && !S.undead && G.sTier(S) >= 2 && oldSpouse(S, X),
    build(S, X) {
      const sp = S.family.spouse, cost = Math.round(G.median(X.reg(S)) * 3 * G.sTier(S));
      const ch = [{ k: 'stay', label: 'Ở bên', sub: 'Gác việc tu luyện, ở bên người ấy những năm cuối.' }];
      if (S.gold >= cost) ch.push({ k: 'elixir', label: 'Tìm thuốc trường thọ', sub: `${G.coin(cost)}: kéo dài thêm vài năm.`, cost });
      ch.push({ k: 'cult', label: 'Bế quan', sub: 'Tu luyện để quên; người ấy sẽ hiểu.' });
      return { title: 'Tóc bạc', body: `${sp.name} đã ${sp.age} tuổi, tóc bạc trắng. Bạn là ${G.tierName(G.sTier(S))}, vẫn như ngày cưới.`, choices: ch };
    },
    apply(S, X, k, c) {
      const sp = S.family.spouse; S.flags.kinFor = sp.name; cnt(S, 'kin_' + k);
      if (k === 'stay') { X.add('so', 8); X.add('h', 4); return 'Những buổi chiều dài, hai người ngồi trước hiên.'; }
      if (k === 'elixir') { X.money(-c.cost); sp.age -= Math.round(G.RACES[sp.race || S.race].le * .1); X.add('h', 4); return `${sp.name} uống thuốc, sáng hôm sau đi lại nhanh nhẹn hơn.`; }
      X.add('h', -10); X.add('so', -6); X.addXp(80); return 'Bạn đóng cửa luyện công. Tiếng ho ở phòng bên vọng sang mỗi đêm.';
    },
    auto: (S, X, d) => S.traits.social > .5 ? 'stay' : d.choices.some(c => c.k === 'elixir') ? 'elixir' : 'cult'
  };

  // ═════════ Tuổi già, kẹt bậc: liều đột phá lần cuối ═════════
  // Liều thành công thì tự ngộ ra cửa lên Tier kế tiếp (nguồn dạy "push" trong G.teachList), không cần thầy.
  G.TEACHERS.push({ id: 'push', nameVi: 'Đột phá lúc tuổi già', tier: 'Tier đang có + 1', schools: null, cond: 'liều đột phá thành công (cv_lifespan); không mở Tier 5' });
  { const base = G.teachList; G.teachList = (S, school, job) => { const out = base(S, school, job); const t = S.flags && S.flags.pushT; if (t) out.push({ t, id: 'push', nameVi: 'Đột phá lúc tuổi già' }); return out; }; }
  DEC.cv_lifespan = {
    prio: 6, gap: 3,
    when: (S, X) => !S.dead && !S.undead && X.stage(S) === 'elder' && !S.flags.lastPush && G.sTier(S) < 4 && G.lvFull(S),
    build(S, X) {
      const T = G.sTier(S), p = pushP(S), kids = S.family.kids.some(k => k.alive) || (S.disciples && S.disciples.length);
      const ch = [{ k: 'push', label: 'Liều đột phá', sub: `~${Math.round(p * 100)}% ngộ ra cửa lên ${G.tierName(T + 1)}; hỏng thì tổn thương nặng, có thể chết.` }];
      if (kids) ch.push({ k: 'pass', label: 'Truyền nghề', sub: 'Dạy con cháu, đệ tử những gì mình biết.' });
      ch.push({ k: 'rest', label: 'An phận', sub: 'Sống nốt những năm còn lại.' });
      return { title: 'Thọ nguyên sắp cạn', body: `Bạn đã ở đỉnh ${G.tierName(T)} mà cánh cửa phía trên vẫn đóng. Tóc bạc, khí huyết suy, thời gian không còn nhiều.`, choices: ch };
    },
    apply(S, X, k) {
      const T = G.sTier(S); S.flags.lastPush = k; cnt(S, 'life_' + k);
      if (k === 'rest') { X.add('h', 10); return null; }
      if (k === 'pass') { X.add('h', 8); X.add('so', 6); S.fame = Math.min(100, S.fame + 5); return 'Bạn mở lớp ở sân sau. Lũ trẻ học nhanh hơn bạn hồi ấy.'; }
      if (X.chance(pushP(S))) { S.flags.pushT = T + 1; cnt(S, 'pushOk'); return `Ba ngày ba đêm ngồi bất động, bạn thấy cánh cửa lên ${G.tierName(T + 1)} hé mở.`; }
      X.add('hl', -X.int(20, 40));
      if (X.chance(.1)) { cnt(S, 'pushDie'); X.die({ id: 'heart', text: 'kiệt sức khi liều đột phá lúc tuổi già' }); return null; }
      return 'Khí huyết đảo lộn, bạn nôn ra máu. Cánh cửa vẫn đóng.';
    },
    auto: (S, X, d) => S.traits.bold > .75 ? 'push' : d.choices.some(c => c.k === 'pass') && S.traits.social > .4 ? 'pass' : 'rest'
  };
  const pushP = S => G.clamp(.03 + .02 * G.RANK[S.tal ? S.tal.root : 'white'] + S.sm / 1000, .02, .15);

  // ═════════ Vai trò: cung phụng (bảng nhân vật, nút rời) ═════════
  { const base = G.roleList; G.roleList = S => { const out = base(S), R = S.roles && S.roles.retainer; if (R) out.push({ what: 'retainer', text: `Cung phụng của ${R.name}`, mgr: false }); return out; }; }
  { const base = G.leaveRole; G.leaveRole = (S, X, what, id) => { if (what === 'retainer') { const R = roles(S).retainer; roles(S).retainer = null; return R ? `Bạn từ biệt ${R.name}.` : null; } return base(S, X, what, id); }; }

  // ═════════ Chữ cho giao diện ═════════
  G.statusText = S => {
    const T = G.sTier(S); if (S.undead) return 'ngoài vòng xã hội';
    const n = nationOf(S), out = [G.tierName(T)];
    if (T) {
      if (n && G.strictNation(n) && T < 5) out.push(G.regOf(S) === 2 ? 'có chứng chỉ' : G.regOf(S) ? 'đã đăng ký' : 'chưa đăng ký');
      out.push(G.recognized(S) ? `thuế ×${num(G.STATUS[T].tax)}` : 'chưa được giảm thuế');
      out.push(`sàn thu nhập phân vị ${Math.round(G.STATUS[T].floor * 100)}`);
    }
    if (S.flags.elixirM > 1) out.push(`dược tề ×${num(S.flags.elixirM)}`);
    return out.join(' · ');
  };
  G.statusTip = S => G.STATUS[G.sTier(S)].d;
})(window.LifeSim);
