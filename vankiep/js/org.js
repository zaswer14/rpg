/* Vạn Kiếp — TỔ CHỨC VÀ LẬP NGHIỆP (bước 9 của docs/03: mục 5.5 lập làng, lập nước; 5.8 kết quả).
 * Ba hướng, hướng nào cũng tự chọn: không tham gia, làm thành viên, hoặc làm người quản lý.
 *   Khu dân cư  cư dân (mặc định) · trưởng thôn / trưởng làng / thị trưởng / thành chủ (được bầu) · lập làng, lập thẳng thị trấn,
 *               nâng làng → thị trấn → thành phố
 *   Quốc gia    dân · quan tỉnh → đại thần (ra làm quan) · lập nước (tỉnh vô chủ) hoặc dấy binh → người cai trị (focus Quản lý, triều chính)
 *   Hội         không vào · thành viên · quản sự → hội trưởng (được bầu) · lập hội
 *               phường nghề (theo sinh kế), Hiệp Hội Mạo Hiểm (mọi nghề; bảng nhiệm vụ, hạng theo danh vọng; quản lý = trưởng chi nhánh),
 *               đoàn lính đánh thuê / dong binh (hợp đồng chiến tranh, hộ tống)
 * Trạng thái của thế giới (lưu trong W.dyn): orgs (hội, đoàn), s.head / s.founder của khu (qua setField), D.nat[k].ruler.player, D.nat[k].tax.
 * Trạng thái của nhân vật: S.roles = { head, office, ruler, orgs: { id: { rank, since } }, adv: { since, branch } }.
 * Hệ con "org" chạy sau "nations"; quyết định thêm vào G.DECISIONS; G.onDeath (life.js die) lo kế vị.
 */
window.LifeSim = window.LifeSim || {};
(function (G) {
  const NONE = -1, J = window.JobLibrary;
  const Dn = () => G._dyn;

  // ═════════ Dữ liệu ═════════
  // works: sinh kế được vào (null: mọi nghề); inc: hệ số thu nhập thêm theo hạng (thành viên, quản sự, hội trưởng).
  G.ORG_KINDS = {
    craft:  { nameVi: 'Phường Thợ',   works: ['miner', 'woodcutter', 'smith'],   inc: [.08, .14, .2], ranks: ['thợ hội', 'quản sự', 'phường trưởng'], seat: { town: .4, city: .8, capital: 1 } },
    trade:  { nameVi: 'Phường Buôn',  works: ['merchant', 'sailor', 'fisher'],   inc: [.08, .14, .2], ranks: ['hội viên', 'quản sự', 'hội trưởng'], seat: { town: .3, city: .8, capital: 1 } },
    farm:   { nameVi: 'Hội Nông Tang', works: ['farmer', 'herder'],              inc: [.06, .1, .15], ranks: ['hội viên', 'quản sự', 'hội trưởng'], seat: { town: .3, city: .3 } },
    lore:   { nameVi: 'Hội Học Giả',  works: ['scholar', 'healer', 'priest'],    inc: [.06, .12, .18], ranks: ['hội viên', 'giảng sư', 'viện trưởng'], seat: { city: .5, capital: .9 } },
    shadow: { nameVi: 'Hội Bóng Đêm', works: ['thief'],                          inc: [.1, .18, .25], ranks: ['tay chân', 'đầu mục', 'thủ lĩnh'], seat: { city: .3, capital: .5 } },
    merc:   { nameVi: 'Đoàn lính đánh thuê', works: null,                        inc: [0, 0, 0], ranks: ['dong binh', 'phó đoàn', 'đoàn trưởng'], seat: { town: .15, city: .5, capital: .6 } }
  };
  G.ADV_RANKS = ['Đồng', 'Sắt', 'Bạc', 'Vàng', 'Bạch Kim', 'Huyền Thoại'];
  G.advRank = S => Math.min(5, Math.floor((S.fame || 0) / 15));
  G.HEAD_VI = { hamlet: 'trưởng thôn', village: 'trưởng làng', town: 'thị trưởng', city: 'thành chủ' };
  G.OFFICE_VI = ['', 'Quan tỉnh', 'Đại thần'];
  // Hệ số cân bằng (đo bằng sim.html, docs/03 mục 5.8).
  G.ORG = {
    villageCost: 200, townCost: 2500, townMen: 300, nationCost: 1000, rebelCost: 500,
    upTown: { urban: 900, cost: 800 }, upCity: { urban: 5000, cost: 3000, fame: 50 },
    cap: { hamlet: 400, village: 2000, town: 8000, city: 20000 }
  };

  const roles = S => S.roles || (S.roles = { head: null, office: null, ruler: null, orgs: {}, adv: null, noble: null });
  const adultish = (S, X) => ['adult', 'elder'].includes(X.stage(S));
  const share = (S, f) => (S.focusTime[f] || 0) / (Object.values(S.focusTime).reduce((a, b) => a + b, 0) || 1);
  const flag = (S, k, v = 1) => { S.flags[k] = (S.flags[k] || 0) + v; };
  const W_ = S => S.world;
  const homeS = S => (S.home && S.home.settlement && G.SET) ? G.SET[S.home.settlement] : null;
  const live = s => s && s.tier !== 'ruin';
  const orgs = W => W.dyn.orgs || (W.dyn.orgs = []);
  G.orgById = (W, id) => orgs(W).find(o => o.id === id) || null;
  // Gốc tên khu dân cư: bỏ chữ chỉ bậc / vai trò ở đầu ("Làng Cối Đá" → "Cối Đá").
  let KINDS = null;
  G.rootName = name => {
    if (!KINDS) { const set = new Set(); for (const K of Object.values(G.NAMES.settlement.kind)) for (const a of Object.values(K)) for (const w of a) set.add(w); KINDS = [...set].sort((a, b) => b.length - a.length); }
    for (const k of KINDS) if (name.startsWith(k + ' ')) return name.slice(k.length + 1);
    return name;
  };
  // Người chơi đang giữ chức gì (để mở focus Quản lý).
  G.hasCharge = S => { const r = S.roles; return !!r && (r.head != null || r.office != null || r.ruler != null || (r.adv && r.adv.branch) || Object.values(r.orgs || {}).some(m => m.rank >= 1)); };
  // Nhân lực để lập thẳng thị trấn: thành viên các hội mình làm hội trưởng + một phần tư dân khu mình làm trưởng.
  G.manpower = S => {
    const r = roles(S), W = W_(S); let m = 0;
    for (const [id, x] of Object.entries(r.orgs)) if (x.rank >= 2) { const o = G.orgById(W, id); if (o && !o.gone) m += o.members; }
    const h = r.head != null ? G.SET[r.head] : null; if (live(h)) m += Math.round(h.urban * .25);
    return m;
  };

  // ═════════ Hội: dựng sẵn, sống mỗi năm ═════════
  function orgName(R, W, kind, seat, X) {
    if (kind === 'merc') {
      const used = new Set(orgs(W).map(o => o.name)), free = G.NAMES.mercenary.filter(n => !used.has(n));
      return free.length ? X.pick(free) : 'Đoàn Dong Binh ' + G.rootName(seat.name);
    }
    return G.ORG_KINDS[kind].nameVi + ' ' + G.rootName(seat.name);
  }
  const memTarget = (kind, s) => kind === 'merc' ? 60 : Math.max(8, Math.round(s.urban * ({ craft: .02, trade: .015, farm: .01, lore: .006, shadow: .004 }[kind])));
  function newOrg(R, W, kind, seat, year, X, leader) {
    const D = W.dyn, id = 'g' + (D.norg = (D.norg || 0) + 1);
    const o = { id, kind, name: orgName(R, W, kind, seat, X), seat: seat.id, founded: year, leader: leader || { name: G.personName(seat.race || 'human', X.chance(.5) ? 'm' : 'f', X.rnd), player: false },
      members: leader ? X.int(6, 15) : Math.round(memTarget(kind, seat) * (.6 + X.rnd() * .6)), rep: +(leader ? .3 : .3 + X.rnd() * .4).toFixed(2), gone: false };
    orgs(W).push(o);
    return o;
  }
  function seedOrgs(R, W, X, year) {
    for (const s of R.settlements) {
      if (!live(s)) continue;
      for (const [kind, K] of Object.entries(G.ORG_KINDS)) {
        let p = K.seat[s.tier] || 0;
        if (kind === 'trade' && s.roles.includes('port')) p += .3;
        if (kind === 'merc' && (s.bld || []).includes('barracks')) p += .15;
        if (p && X.chance(p)) newOrg(R, W, kind, s, year - X.int(5, 150), X);
      }
    }
  }
  // Mỗi năm: hội đi theo khu (khu sụp thì dời về khu cùng nước gần nhất, không có thì giải tán), số người trôi về mức của khu,
  // hội trưởng NPC thay người. Hội người chơi lãnh đạo lớn theo focus Quản lý.
  function orgsYear(R, W, X, S, year) {
    const D = W.dyn, mine = S ? roles(S).orgs : {};
    for (const o of orgs(W)) {
      if (o.gone) continue;
      let s = R.byId[o.seat];
      if (!live(s)) {
        const to = R.settlements.filter(x => live(x) && x.nation === (s ? s.nation : NONE) && G.TIER_RANK[x.tier] <= 2).sort((a, b) => Math.hypot(a.x - s.x, a.y - s.y) - Math.hypot(b.x - s.x, b.y - s.y))[0];
        if (to && X.chance(.6)) { o.seat = to.id; s = to; }
        else { o.gone = true; Dn().hist(D, year, 'org', `${o.name} giải tán sau khi ${s ? s.name : 'trụ sở'} bị bỏ hoang.`); if (mine[o.id] && S) { delete mine[o.id]; X.log(`${o.name} giải tán.`, 'bad'); } continue; }
      }
      const lead = o.leader.player && S && mine[o.id] && mine[o.id].rank >= 2 ? share(S, 'govern') : 0;
      const tgt = memTarget(o.kind, s) * (1 + lead * 1.5 + (o.leader.player ? .3 : 0));
      o.members = Math.max(3, Math.round(o.members + (tgt - o.members) * .08 + X.int(-2, 2) + lead * 4));
      o.rep = +G.clamp(o.rep + (lead ? .03 * lead : 0) + (X.rnd() - .5) * .04, .05, 1).toFixed(2);
      if (!o.leader.player && X.chance(.03)) o.leader = { name: G.personName(s.race || 'human', X.chance(.5) ? 'm' : 'f', X.rnd), player: false };
    }
  }

  // ═════════ Hệ con "org" (sau "nations") ═════════
  G.orgYear = function (S, X) {
    const W = S.world, R = G.bindWorld(W), D = W.dyn, r = roles(S), year = W.year, ypt = X.R(S).ypt;
    if (!D.orgInit) { D.orgInit = true; seedOrgs(R, W, X, year); }
    orgsYear(R, W, X, S, year);
    if (S.dead) return;
    const gov = share(S, 'govern'), reg = X.reg(S), med = G.median(reg);
    // Hiệp Hội Mạo Hiểm: mạo hiểm giả tự ghi tên.
    if (!r.adv && S.work === 'adventurer') { r.adv = { since: year, branch: null }; flag(S, 'advJoin'); X.log('Bạn ghi tên vào Hiệp Hội Mạo Hiểm, nhận thẻ hạng Đồng.', 'info'); }
    if (r.adv && r.adv.branch && !live(G.SET[r.adv.branch])) r.adv.branch = null;
    if (r.adv && r.adv.branch) X.money(Math.round(med * (.4 + gov)));
    // Trưởng khu: khu lớn dần theo focus Quản lý (và một phần Làm ăn, Gia đình); lương lấy từ thuế khu.
    const h = r.head != null ? G.SET[r.head] : null;
    if (r.head != null && (!live(h) || !h.head || !h.head.player || S.home.settlement !== h.id)) {
      if (live(h) && h.head && h.head.player) Dn().setField(D, h, 'head', { name: G.personName(h.race || 'human', 'm', X.rnd), player: false, since: year });
      X.log(live(h) ? `Bạn không còn ở ${h.name}; dân bầu người khác làm ${G.HEAD_VI[h.tier] || 'trưởng'}.` : 'Khu bạn làm trưởng đã thành phế tích.', 'bad');
      r.head = null;
    } else if (h) {
      const s2 = gov + .3 * (share(S, 'work') + share(S, 'family')), cap = G.ORG.cap[h.tier] || 1e9;
      const grow = Math.round(h.urban * (.01 + .045 * s2) * ypt) + (s2 > 0 ? X.int(0, 6) : 0);
      if (h.urban < cap && grow > 0) Dn().setField(D, h, 'urban', Math.min(cap, h.urban + grow));
      if (s2 > 0) D.hp[h.id] = Math.min(1, (D.hp[h.id] ?? 1) + .04 * s2 * ypt);
      X.money(Math.round(med * (h.urban / 500) * (.5 + gov) * ({ town: 1.5, city: 2.5 }[h.tier] || 1)));
      headEvents(R, W, X, S, h);
    }
    // Quan: mất chức khi tỉnh đổi chủ, nước mất, vua mới thanh trừng; thăng Đại thần; lương theo hạng.
    const of = r.office;
    if (of) {
      const k = of.k, n = R.nations[k], ruler = D.nat[k] && D.nat[k].ruler;
      let lost = !D.nat[k] || !D.nat[k].alive ? 'nước không còn' : D.prov[of.p] !== k ? `tỉnh ${R.provinces[of.p].name} về tay nước khác` : S.nation !== k ? 'bạn không còn là dân nước này' : null;
      if (!lost && ruler && of.ruler !== ruler.name) { if (X.chance(.25)) lost = `${ruler.title} ${ruler.name} mới lên thay người cũ trong triều`; of.ruler = ruler.name; }
      if (!lost && X.chance(.02 * ypt)) {
        const take = X.chance(.4 + .3 * (1 - S.traits.pious));
        if (take) { X.money(Math.round(med * 2)); if (X.chance(.25)) { lost = 'nhận hối lộ bị phát giác'; flag(S, 'crimes'); } else X.log('Một thương nhân để lại túi bạc trên bàn. Bạn không trả lại.', 'info'); }
      }
      if (lost) { X.log(`Bạn mất chức ${G.OFFICE_VI[of.rank].toLowerCase()} của ${n.name}: ${lost}.`, 'bad'); r.office = null; }
      else {
        if (of.rank === 1 && year - of.since >= (G.eduLv && G.eduLv(S) >= 3 ? 4 : 6) && (S.fame >= 40 || S.sm >= 70 || (r.noble && r.noble.rank >= 3)) && X.chance(.12 * (.5 + gov) * ypt)) {
          of.rank = 2; flag(S, 'office2'); X.log(`Bạn được triệu về kinh làm Đại thần của ${n.name}.`, 'big');
          Dn().hist(D, year, 'office', `${S.name} được phong Đại thần của ${n.name}.`);
        }
        X.money(Math.round(med * (of.rank === 2 ? 2.5 : 1.2)));
        if (gov) D.nat[k].stab = G.clamp(D.nat[k].stab + .012 * of.rank * gov * ypt, 0, 1);
      }
    }
    // Người cai trị: ổn định theo focus Quản lý, hạnh phúc giảm; thu thuế; tuổi theo nhân vật.
    if (r.ruler != null) {
      const k = r.ruler, d = D.nat[k];
      if (!d || !d.alive || !d.ruler || !d.ruler.player) { X.log(d && !d.alive ? `${R.nations[k].name} đã mất. Bạn không còn ngai để ngồi.` : 'Bạn không còn là người cai trị.', 'bad'); r.ruler = null; }
      else {
        d.ruler.age = X.years(S);
        d.stab = G.clamp(d.stab + (.035 * gov - .01) * ypt, 0, 1);
        if (gov > .3) X.add('h', -3 * gov);
        const pop = R.provinces.reduce((a, p, q) => a + (D.prov[q] === k ? p.pop : 0), 0);
        X.money(Math.round(med * (2 + pop / 25000) * (R.nations[k].tax / .15)));
      }
    }
    // Hội: thu nhập quản lý, thăng quản sự (hội trưởng do quyết định bầu).
    for (const [id, m] of Object.entries(r.orgs)) {
      const o = G.orgById(W, id);
      if (!o || o.gone) { delete r.orgs[id]; continue; }
      if (m.rank >= 1) X.money(Math.round(med * (m.rank === 2 ? o.members * o.rep * .03 + .5 : .4) * (.6 + gov)));
      // Đủ năm và có tiếng thì hội đề cử làm quản sự (quyết định org_lead: nhận hay chỉ làm thành viên).
      if (m.rank === 0 && !m.offer && year - m.since >= 4 && X.chance((.06 + S.fame / 500) * ypt)) m.offer = true;
      if (o.kind !== 'merc' && m.rank === 0 && year - m.since > 1) X.money(-Math.round(med * .04));   // hội phí
    }
  };
  { const k = G.SYSTEMS.findIndex(s => s.id === 'nations'); G.SYSTEMS.splice(k + 1, 0, { id: 'org', when: S => !S.dead, run: (S, X) => G.orgYear(S, X) }); }

  // Sự kiện của trưởng khu: người tới xin ở, quái đánh khu (hang ổ gần hoặc thú triều), tường rào giảm thiệt hại.
  function headEvents(R, W, X, S, h) {
    const D = W.dyn;
    if (X.chance(.15)) { const n = X.int(10, 40) + Math.round(h.urban * .02); Dn().setField(D, h, 'urban', h.urban + n); X.log(`${n} người từ nơi khác tới xin ở ${h.name}. Bạn chia đất cho họ.`, 'good'); }
    const near = ((D.lairs || []).filter(l => l.empty == null && Math.hypot(G.lairPos(l)[0] - h.x, G.lairPos(l)[1] - h.y) < 70).sort((a, b) => b.lv - a.lv))[0];
    const raid = h.province >= 0 ? D.raid[h.province] || 0 : 0;
    if (X.chance(.04 + raid * .15 + (near ? .04 * near.lv : 0))) {
      const z = near ? G.lairZone(near) : X.reg(S).zones[Math.min(1, G.REGION[h.region].zones.length - 1)];
      const enc = X.rollEncounter(z, { cell: h.cell, fam: near ? near.fam : undefined });
      if (!enc) return;
      flag(S, 'headFights');
      const rec = X.fight({ ...enc, count: Math.min(6, enc.count + 1) }, false);
      if (S.dead) return;
      const walls = (h.bld || []).includes('walls');
      if (rec.win) { X.add('so', 4); S.fame = Math.min(100, S.fame + 1.5); X.log(`Quái${near ? ' từ ' + near.name : ''} đánh ${h.name}. Bạn dẫn trai tráng giữ được cổng.`, 'good'); }
      else { D.hp[h.id] = Math.max(.1, (D.hp[h.id] ?? 1) - (walls ? .05 : .12)); X.log(`Quái${near ? ' từ ' + near.name : ''} phá ${walls ? 'một đoạn rào' : 'mấy nóc nhà'} ở ${h.name}.`, 'bad'); }
    }
  }

  // ═════════ Chỗ lập khu mới ═════════
  // Ô trong tỉnh (có chủ hay vô chủ), đồng / đồi / rừng, độ hoang trong [wlo, whi], cách khu còn sống ≥ 60px, phế tích ≥ 30px,
  // hang ổ ≥ 25px, trong 160px quanh chỗ đang ở. Ưu tiên ven sông, ít hoang, gần. Trả về tối đa n chỗ cách nhau ≥ 40px.
  G.siteChoices = function (S, X, wlo, whi, n) {
    const R = G.realm, M = G.map, W = M.W, CS = M.CS, [px, py] = S.pos || [0, 0];
    const ok = new Set(['open', 'hills', 'forest']), lairs = ((S.world.dyn && S.world.dyn.lairs) || []).map(l => G.lairPos(l));
    const c0 = Math.floor(px / CS), r0 = Math.floor(py / CS), k = Math.ceil(160 / CS), out = [];
    for (let y = Math.max(0, r0 - k); y <= Math.min(M.H - 1, r0 + k); y += 2) for (let x = Math.max(0, c0 - k); x <= Math.min(W - 1, c0 + k); x += 2) {
      const c = y * W + x, cx = (x + .5) * CS, cy = (y + .5) * CS, d = Math.hypot(cx - px, cy - py);
      if (d > 160 || R.provOf[c] < 0 || M.region[c] === 255 || !ok.has(G.FEATURES[M.feat[c]].id)) continue;
      const w = R.wild[c]; if (w < wlo || w > whi) continue;
      if (R.settlements.some(s => Math.hypot(s.x - cx, s.y - cy) < (s.tier === 'ruin' ? 30 : 60))) continue;
      if (lairs.some(([lx, ly]) => Math.hypot(lx - cx, ly - cy) < 25)) continue;
      out.push({ c, x: cx, y: cy, w, score: (M.river[c] ? 1.2 : 0) - w * .6 - d / 200 });
    }
    out.sort((a, b) => b.score - a.score);
    const pick = [];
    for (const o of out) { if (pick.every(p => Math.hypot(p.x - o.x, p.y - o.y) >= 40)) pick.push(o); if (pick.length >= n) break; }
    return pick.map(o => {
      const p = R.provOf[o.c], k = S.world.dyn.prov[p], nat = k >= 0 ? R.nations[k] : null;
      const banned = nat && nat.laws.includes('no_outsiders') && !nat.fav.includes(S.race);
      const fee = nat ? Math.round(G.incomeAt(G.REGION[G.REGIONS[M.region[o.c]].id], S.pct) * nat.tax) : 0;
      return { cell: o.c, w: o.w, river: !!M.river[o.c], prov: p, nation: k, banned, fee, region: G.REGIONS[M.region[o.c]].id };
    }).filter(o => !o.banned);
  };
  const where = st => `${G.REGION[st.region].nameVi}, tỉnh ${G.realm.provinces[st.prov].name}${st.nation >= 0 ? ' (' + G.realm.nations[st.nation].name + ')' : ' (vô chủ)'}${st.river ? ', ven sông' : ''}`;
  // Khu người chơi lập: dân theo chủng tộc người chơi; nhà dời về đó; người chơi là trưởng.
  function settle(S, X, st, tier, name, urban, rural, bld) {
    const W = S.world, R = G.bindWorld(W), D = W.dyn, year = W.year;
    const races = { [S.race]: 70 }, base = R.byId[R.provinces[st.prov].seat];
    if (base) for (const [k, v] of Object.entries(base.races)) races[k] = (races[k] || 0) + v * .3;
    const B = G.BUILDINGS.filter(b => (b.p[tier] || 0) >= 1 || (bld || []).includes(b.id));
    const s = Dn().newSettlement(R, D, st.cell, { name, tier, race: S.race, races, faiths: S.faith ? { [S.faith]: 60, none: 40 } : { none: 100 }, urban, rural,
      founder: S.name, head: { name: S.name, player: true, since: year }, hp: tier === 'town' ? .6 : .5, bld: B.map(b => b.id), buildings: B.map(b => b.name[tier]).filter(Boolean) }, year);
    D.n.pfound = (D.n.pfound || 0) + 1;
    const r = roles(S); r.head = s.id;
    S.home = { region: s.region, settlement: s.id }; S.loc = s.region; S.urban = true; S.pos = G.homePos(s, true, X.rnd); S.path2.push(S.pos);
    if (R._dirty.length) G.wildCommit(R);
    return s;
  }
  // Đổi bậc khu: tên đổi chữ chỉ bậc, thêm công trình của bậc mới, bán kính văn minh theo bậc mới.
  function promote(S, X, s, tier) {
    const W = S.world, R = G.bindWorld(W), D = W.dyn;
    const K = (G.NAMES.settlement.kind[s.race] || G.NAMES.settlement.kind.human)[tier] || ['Thị Trấn'];
    Dn().setField(D, s, 'name', X.pick(K) + ' ' + G.rootName(s.name));
    Dn().setField(D, s, 'tier', tier);
    const bld = [...(s.bld || [])], names = [...(s.buildings || [])];
    for (const b of G.BUILDINGS) if ((b.p[tier] || 0) >= 1 && !bld.includes(b.id)) { bld.push(b.id); if (b.name[tier]) names.push(b.name[tier]); }
    Dn().setField(D, s, 'bld', bld); Dn().setField(D, s, 'buildings', names);
    Dn().setField(D, s, 'dwindling', false);
    G.wildSet(R, 'S' + s.id, G.wildOfSettlement(R, s)); G.wildCommit(R);
    G.indexRealm(R); Dn().touch(R, D);
  }

  // ═════════ Quyết định ═════════
  const DEC = G.DECISIONS;
  const tierOK = (S, X) => adultish(S, X) && !S.undead;
  // ── Lập làng / lập thẳng thị trấn
  DEC.found_settle = {
    prio: 4, gap: 4,
    when(S, X) {
      if (!tierOK(S, X) || roles(S).ruler != null) return false;
      const cost = G.ORG.villageCost * 2;
      return (S.fame >= 20 && S.gold >= cost) || (G.manpower(S) >= G.ORG.townMen && S.fame >= 45 && S.gold >= G.ORG.townCost);
    },
    build(S, X) {
      const ch = [], race = S.race === 'skeleton' ? 'human' : S.race;
      if (S.fame >= 20) for (const st of G.siteChoices(S, X, 1, 2.5, 2)) {
        const cost = Math.round(G.ORG.villageCost * (1 + st.w)) + st.fee;
        if (S.gold < cost) continue;
        const name = Dn().settlementName(G.realm, race, 'village', X);
        ch.push({ k: 'v' + st.cell, label: `Lập ${name}`, sub: `${where(st)}; độ hoang ${st.w.toFixed(1)}; ${cost} bạc${st.fee ? ` (gồm ${st.fee} phí xin phép)` : ''}.`, st, name, cost, tier: 'village' });
      }
      const men = G.manpower(S);
      if (men >= G.ORG.townMen && S.fame >= 45) for (const st of G.siteChoices(S, X, 0, 1.6, 1)) {
        const cost = G.ORG.townCost + st.fee * 3;
        if (S.gold < cost) continue;
        const name = Dn().settlementName(G.realm, race, 'town', X);
        ch.push({ k: 't' + st.cell, label: `Lập thị trấn ${name}`, sub: `${where(st)}; ${cost} bạc; đưa theo ${men} người.`, st, name, cost, tier: 'town', men });
      }
      if (!ch.length) { S.recentDec.found_settle = S.age; return null; }
      return { title: 'Lập nghiệp', body: `Bạn có ${S.gold} bạc, danh vọng ${Math.round(S.fame)}${men ? `, nhân lực ${men} người` : ''}. Có chỗ đất dựng được ${ch.some(c => c.tier === 'town') ? 'cả một thị trấn' : 'một làng'}. Bạn sẽ là ${ch[0].tier === 'town' ? 'thị trưởng' : 'trưởng làng'}.`,
        choices: [...ch, { k: 'no', label: 'Thôi', sub: 'Không phải ai cũng muốn làm trưởng.' }] };
    },
    apply(S, X, k, c) {
      if (k === 'no' || !c.st) return null;
      S.gold -= c.cost;
      if (c.tier === 'town') {
        const r = roles(S), h = r.head != null ? G.SET[r.head] : null;
        if (live(h)) Dn().setField(S.world.dyn, h, 'urban', Math.max(40, h.urban - Math.round(h.urban * .25)));
        if (live(h) && h.head && h.head.player) Dn().setField(S.world.dyn, h, 'head', { name: G.personName(h.race || 'human', 'm', X.rnd), player: false, since: S.world.year });
        const s = settle(S, X, c.st, 'town', c.name, Math.min(c.men, 800) + X.int(300, 700), X.int(200, 500));
        flag(S, 'foundTown');
        Dn().hist(S.world.dyn, S.world.year, 'found', `${S.name} đưa ${c.men} người tới dựng thị trấn ${s.name} ở ${G.REGION[s.region].nameVi}.`);
        return `Thị trấn ${s.name} có tường rào và chợ ngay năm đầu. Bạn là thị trưởng.`;
      }
      const s = settle(S, X, c.st, 'village', c.name, X.int(40, 90) + Math.round(S.fame), X.int(100, 300));
      flag(S, 'foundVillage');
      Dn().hist(S.world.dyn, S.world.year, 'found', `${S.name} lập ${s.name} ở ${G.REGION[s.region].nameVi}.`);
      return `Bạn dựng nhà đầu tiên của ${s.name}. Vài gia đình theo bạn tới.`;
    },
    auto(S, X, d) {
      const T = S.traits, t = d.choices.find(c => c.tier === 'town');
      if (t && T.bold + T.social > 1.3) return t.k;
      return T.social + T.bold > 1.4 ? d.choices[0].k : 'no';
    }
  };
  // ── Bầu trưởng khu (khu đang ở chưa có người chơi làm trưởng; kinh đô không có)
  const headFame = { hamlet: 15, village: 22, town: 38, city: 55 };
  DEC.head_elect = {
    prio: 5, gap: 4,
    when(S, X) {
      const h = homeS(S), r = roles(S);
      return tierOK(S, X) && live(h) && r.head == null && r.ruler == null && headFame[h.tier] != null && S.fame >= headFame[h.tier] && !(h.head && h.head.player) && (h.tier !== 'city' || S.q >= 3);
    },
    build(S, X) {
      const h = homeS(S), t = G.HEAD_VI[h.tier];
      return { title: `Bầu ${t}`, body: `${h.head ? `${G.HEAD_VI[h.tier][0].toUpperCase() + t.slice(1)} ${h.head.name} xin thôi.` : `${h.name} cần người đứng ra lo việc chung.`} Các bô lão nhắc tên bạn.`,
        choices: [{ k: 'yes', label: 'Nhận', sub: 'Thu thuế khu, lo đường sá, đứng ra khi quái tới. Mở focus Quản lý.' }, { k: 'no', label: 'Từ chối', sub: 'Làm dân thường cho nhẹ đầu.' }] };
    },
    apply(S, X, k) {
      if (k !== 'yes') return null;
      const h = homeS(S), D = S.world.dyn;
      Dn().setField(D, h, 'head', { name: S.name, player: true, since: S.world.year }); roles(S).head = h.id; flag(S, 'headElect');
      Dn().hist(D, S.world.year, 'head', `${S.name} được bầu làm ${G.HEAD_VI[h.tier]} ${h.name}.`);
      return `Bạn là ${G.HEAD_VI[h.tier]} ${h.name}.`;
    },
    auto: (S) => S.traits.social > .75 && S.traits.bold > .3 ? 'yes' : 'no'
  };
  // ── Nâng bậc khu mình làm trưởng; dựng rào cho làng
  DEC.upgrade = {
    prio: 5, gap: 2,
    when(S, X) {
      const h = roles(S).head != null ? G.SET[roles(S).head] : null, U = G.ORG;
      if (!live(h)) return false;
      if (h.tier === 'village' || h.tier === 'hamlet') return h.urban >= U.upTown.urban && S.gold >= U.upTown.cost || (h.tier === 'village' && !(h.bld || []).includes('walls') && S.gold >= G.median(X.reg(S)) * 4 && h.urban >= 200);
      return h.tier === 'town' && h.urban >= U.upCity.urban && S.gold >= U.upCity.cost && S.fame >= U.upCity.fame;
    },
    build(S, X) {
      const h = G.SET[roles(S).head], U = G.ORG, ch = [], wc = Math.round(G.median(X.reg(S)) * 4);
      if ((h.tier === 'village' || h.tier === 'hamlet') && h.urban >= U.upTown.urban && S.gold >= U.upTown.cost) ch.push({ k: 'town', label: 'Lên thị trấn', sub: `${U.upTown.cost} bạc: mở chợ, dựng rào cọc, lập đồn lính. Bạn thành thị trưởng.` });
      if (h.tier === 'town' && h.urban >= U.upCity.urban && S.gold >= U.upCity.cost && S.fame >= U.upCity.fame) ch.push({ k: 'city', label: 'Lên thành phố', sub: `${U.upCity.cost} bạc: tường đá, trường, doanh trại. Bạn thành thành chủ.` });
      if (h.tier === 'village' && !(h.bld || []).includes('walls') && S.gold >= wc) ch.push({ k: 'walls', label: 'Dựng rào gỗ', sub: `${wc} bạc: quái và thú triều phá ít hơn một nửa.` });
      if (!ch.length) return null;
      return { title: h.name, body: `${h.name} có ${h.urban.toLocaleString('vi')} người trong khu. Bạn có ${S.gold} bạc.`, choices: [...ch, { k: 'no', label: 'Để sau', sub: '' }] };
    },
    apply(S, X, k) {
      const h = G.SET[roles(S).head], D = S.world.dyn, U = G.ORG, old = h.name;
      if (k === 'walls') { S.gold -= Math.round(G.median(X.reg(S)) * 4); Dn().setField(D, h, 'bld', [...(h.bld || []), 'walls']); Dn().setField(D, h, 'buildings', [...(h.buildings || []), 'Rào gỗ']); return `${h.name} có rào gỗ.`; }
      if (k === 'town') { S.gold -= U.upTown.cost; promote(S, X, h, 'town'); flag(S, 'upTown'); Dn().hist(D, S.world.year, 'found', `${old} lên thị trấn, đổi tên thành ${h.name}.`); Dn().setField(D, h, 'head', { name: S.name, player: true, since: S.world.year }); return `${old} thành thị trấn ${h.name}. Bạn là thị trưởng.`; }
      if (k === 'city') { S.gold -= U.upCity.cost; promote(S, X, h, 'city'); flag(S, 'upCity'); Dn().hist(D, S.world.year, 'found', `${old} lên thành phố, đổi tên thành ${h.name}.`); return `${old} thành ${h.name}. Bạn là thành chủ.`; }
      return null;
    },
    auto: (S, X, d) => d.choices[0].k
  };
  // ── Ra làm quan (nước đang sống, ở khu có chủ)
  DEC.office = {
    prio: 4, gap: 5,
    when(S, X) {
      const r = roles(S), h = homeS(S);
      return tierOK(S, X) && !r.office && r.ruler == null && S.nation != null && live(h) && h.nation === S.nation && h.province >= 0 && ((S.sm >= 55 && S.q >= 3) || S.sm >= 70 || S.fame >= 40 || (G.eduLv && (G.eduLv(S) >= 3 || (G.eduLv(S) >= 2 && S.sm >= 45))) || (r.noble && r.noble.k === S.nation && r.noble.rank >= 2)) && !(S.flags.wanted && S.flags.wanted[S.nation]);
    },
    build(S, X) {
      const n = G.realm.nations[S.nation], p = homeS(S).province;
      return { title: 'Ra làm quan', body: `${n.name} cần người coi tỉnh ${G.realm.provinces[p].name}. ${S.sm >= 50 ? 'Bạn đọc thông viết thạo.' : 'Tiếng tăm của bạn đã tới tai quan trên.'}`,
        choices: [{ k: 'yes', label: 'Nhận chức Quan tỉnh', sub: 'Lương bổng, giữ yên tỉnh; mất chức khi tỉnh đổi chủ hoặc triều đổi người.' }, { k: 'no', label: 'Không ra làm quan', sub: '' }] };
    },
    apply(S, X, k) {
      if (k !== 'yes') return null;
      const W = S.world, p = homeS(S).province, ru = W.dyn.nat[S.nation].ruler;
      roles(S).office = { k: S.nation, p, rank: 1, since: W.year, ruler: ru ? ru.name : null }; flag(S, 'office');
      return `Bạn nhận ấn Quan tỉnh ${G.realm.provinces[p].name}.`;
    },
    auto: (S) => S.traits.studious > .8 && S.traits.pious < .8 ? 'yes' : 'no'
  };
  // ── Lập nước: làm trưởng thị trấn trở lên ở tỉnh vô chủ có ≥ 2 khu dân cư
  const templatesFor = S => { const race = S.race; const t = G.NATION_TEMPLATES.filter(x => x.race === race); return t.length ? t : G.NATION_TEMPLATES.filter(x => x.race === 'human'); };
  DEC.found_nation = {
    prio: 8, gap: 3,
    when(S, X) {
      const r = roles(S), h = r.head != null ? G.SET[r.head] : null, D = S.world.dyn;
      return tierOK(S, X) && live(h) && r.ruler == null && G.TIER_RANK[h.tier] <= 2 && h.province >= 0 && D.prov[h.province] === NONE
        && Dn().liveIn(G.realm, h.province).length >= 2 && S.fame >= 60 && S.gold >= G.ORG.nationCost;
    },
    build(S, X) {
      const h = G.SET[roles(S).head], ts = templatesFor(S).slice().sort((a, b) => (a.size === 'L') - (b.size === 'L') || X.rnd() - .5).slice(0, 3);
      return { title: 'Lập nước', body: `Tỉnh ${G.realm.provinces[h.province].name} không thuộc nước nào. Các trưởng làng muốn ${h.name} đứng đầu. Chọn thể chế (${G.ORG.nationCost} bạc).`,
        choices: [...ts.map(t => ({ k: t.id, label: `${t.label} (${G.GOVS[t.gov].nameVi.toLowerCase()})`, sub: `${t.trait.nameVi}: ${t.trait.desc}`, tpl: t.id })), { k: 'no', label: 'Chưa', sub: '' }] };
    },
    apply(S, X, k) {
      if (k === 'no') return null;
      const W = S.world, R = G.bindWorld(W), D = W.dyn, h = G.SET[roles(S).head], p = h.province, t = G.NATION_TEMPLATES.find(x => x.id === k);
      const title = (G.NAMES.nation.ruler[t.gov] || ['Thủ Lĩnh']), ruler = { title: title.length > 1 && S.sex === 'f' ? title[1] : title[0], name: S.name, sex: S.sex, age: X.years(S), player: true };
      S.gold -= G.ORG.nationCost;
      const nn = Dn().newNation(R, D, p, NONE, W.year, X, { template: t, ruler });
      Dn().setOwner(R, D, p, nn.idx);
      D.nat[nn.idx].cap = h.id; nn.capital = h.id; nn.capitalCell = h.cell;
      roles(S).ruler = nn.idx; S.nation = nn.idx; flag(S, 'foundNation'); D.n.pnation = (D.n.pnation || 0) + 1;
      Dn().hist(D, W.year, 'rebel', `${S.name} lập ${nn.name} (${G.GOVS[nn.gov].nameVi.toLowerCase()}), kinh đô ${h.name}.`);
      if (R._dirty.length) G.wildCommit(R);
      return `${nn.name} ra đời. Bạn là ${ruler.title} ${S.name}.`;
    },
    auto: (S, X, d) => S.traits.bold > .5 ? d.choices[0].k : 'no'
  };
  // ── Dấy binh: quan tỉnh hoặc trưởng thị trấn trở lên, ở tỉnh không phải tỉnh kinh đô của một nước bất ổn
  const rebelProv = S => { const r = roles(S); if (r.office) return r.office.p; const h = r.head != null ? G.SET[r.head] : null; return live(h) && G.TIER_RANK[h.tier] <= 2 ? h.province : NONE; };
  DEC.rebel = {
    prio: 8, gap: 5,
    when(S, X) {
      const p = rebelProv(S), D = S.world.dyn; if (!tierOK(S, X) || p < 0 || roles(S).ruler != null) return false;
      const k = D.prov[p]; if (k < 0) return false;
      const cap = G.SET[D.nat[k].cap];
      return D.nat[k].stab < .45 && !(cap && cap.province === p) && S.fame >= 50 && S.gold >= G.ORG.rebelCost;
    },
    build(S, X) {
      const D = S.world.dyn, p = rebelProv(S), k = D.prov[p], n = G.realm.nations[k], ch = G.rebelChance(S);
      return { title: 'Dấy binh', body: `${n.name} đang rối ren (ổn định ${Math.round(D.nat[k].stab * 100)}). Người tỉnh ${G.realm.provinces[p].name} hỏi bạn có dám đứng lên không. Ước chừng ${Math.round(ch * 100)}% thành công.`,
        choices: [{ k: 'go', label: 'Dấy binh', sub: `${G.ORG.rebelCost} bạc mua giáo mác. Thua thì mất hết, có khi mất đầu.` }, { k: 'no', label: 'Giữ phận', sub: '' }] };
    },
    apply(S, X, k) {
      if (k !== 'go') return null;
      const W = S.world, R = G.bindWorld(W), D = W.dyn, p = rebelProv(S), from = D.prov[p], old = R.nations[from];
      S.gold -= G.ORG.rebelCost;
      if (G.stripTitle) G.stripTitle(S, from, `làm phản ${old.name}`);
      if (!X.chance(G.rebelChance(S))) {
        flag(S, 'rebelFail'); D.nat[from].stab = Math.min(1, D.nat[from].stab + .05);
        Dn().hist(D, W.year, 'riot', `${S.name} dấy binh ở tỉnh ${R.provinces[p].name} chống ${old.name}, thất bại.`);
        roles(S).office = null;
        if (X.chance(.35)) { X.die({ id: 'hanged', text: `bị ${old.name} xử tử vì tội làm phản` }); return null; }
        (S.flags.wanted = S.flags.wanted || {})[from] = true;
        return `Quân ${old.name} dẹp tan. Bạn trốn được, nhưng đầu bạn giờ có giá.`;
      }
      const tpls = templatesFor(S), t = X.wpick(tpls, t => t.size === 'S' ? 3 : t.size === 'M' ? 1.5 : .3);
      const title = (G.NAMES.nation.ruler[t.gov] || ['Thủ Lĩnh']), ruler = { title: title.length > 1 && S.sex === 'f' ? title[1] : title[0], name: S.name, sex: S.sex, age: X.years(S), player: true };
      const nn = Dn().newNation(R, D, p, from, W.year, X, { template: t, ruler });
      Dn().setOwner(R, D, p, nn.idx); D.n.rebel++;
      const r = roles(S), h = r.head != null ? G.SET[r.head] : null;
      if (live(h) && h.province === p) { D.nat[nn.idx].cap = h.id; nn.capital = h.id; nn.capitalCell = h.cell; }
      r.office = null; r.ruler = nn.idx; S.nation = nn.idx; flag(S, 'rebelOK'); D.n.pnation = (D.n.pnation || 0) + 1;
      Dn().hist(D, W.year, 'rebel', `${S.name} dấy binh ở tỉnh ${R.provinces[p].name}, tách khỏi ${old.name} lập ${nn.name}.`);
      if (!Dn().provsOf(D, from).length) { D.nat[from].alive = false; old.alive = false; }
      if (R._dirty.length) G.wildCommit(R);
      return `Cờ ${nn.name} kéo lên. ${old.name} sẽ không để yên.`;
    },
    auto: (S, X) => S.traits.bold > .8 && G.rebelChance(S) > .55 ? 'go' : 'no'
  };
  G.rebelChance = S => { const D = S.world.dyn, p = rebelProv(S), k = p >= 0 ? D.prov[p] : NONE; if (k < 0) return 0; return G.clamp(.1 + S.fame / 300 + (.45 - D.nat[k].stab) * 1.2 + (roles(S).office ? .08 : 0), .05, .8); };
  // ── Triều chính (người cai trị, mỗi năm)
  DEC.court = {
    prio: 8, gap: 1,
    when: (S, X) => roles(S).ruler != null && !S.dead && adultish(S, X),
    build(S, X) {
      const W = S.world, R = G.bindWorld(W), D = W.dyn, k = roles(S).ruler, n = R.nations[k], d = D.nat[k], ch = [];
      const war = D.wars.find(w => w.a === k || w.b === k), yr = W.year;
      ch.push({ k: 'keep', label: 'Giữ nguyên', sub: '' });
      if (n.tax > .05) ch.push({ k: 'down', label: 'Giảm thuế', sub: `Thuế ${Math.round(n.tax * 100)}% → ${Math.round((n.tax - .03) * 100)}%: lòng dân yên, kho hụt.` });
      if (n.tax < .35) ch.push({ k: 'up', label: 'Tăng thuế', sub: `Thuế ${Math.round(n.tax * 100)}% → ${Math.round((n.tax + .03) * 100)}%: kho đầy, dân oán.` });
      if (war) ch.push({ k: 'peace', label: `Cầu hòa với ${R.nations[war.a === k ? war.b : war.a].name}`, sub: 'Hưu chiến 15 năm; bên đang thắng giữ đất đã chiếm.', w: war });
      else {
        const foes = new Set(); D.prov.forEach((o, p) => { if (o !== k) return; for (const q of Dn().neighbors(R, p)) { const b = D.prov[q]; if (b >= 0 && b !== k && D.nat[b].alive && !((D.truce[Math.min(k, b) + ':' + Math.max(k, b)] || 0) > yr)) foes.add(b); } });
        const b = [...foes].sort((x, y) => (n.relations[x] || 0) - (n.relations[y] || 0))[0];
        if (b != null && d.stab > .35) ch.push({ k: 'war', label: `Tuyên chiến với ${R.nations[b].name}`, sub: `Quan hệ ${n.relations[b] || 0}. Chiến tranh làm ổn định giảm.`, b });
      }
      return { title: `Triều chính ${n.name}`, body: `Ổn định ${Math.round(d.stab * 100)}, thuế ${Math.round(n.tax * 100)}%, ${Dn().provsOf(D, k).length} tỉnh.${war ? ' Đang có chiến tranh.' : ''}`, choices: ch };
    },
    apply(S, X, k, c) {
      const W = S.world, R = G.bindWorld(W), D = W.dyn, K = roles(S).ruler, n = R.nations[K], d = D.nat[K];
      if (k === 'down' || k === 'up') { d.tax = +G.clamp(n.tax + (k === 'up' ? .03 : -.03), .03, .4).toFixed(3); n.tax = d.tax; d.stab = G.clamp(d.stab + (k === 'up' ? -.05 : .05), 0, 1); flag(S, 'court'); return `Thuế ${n.name} giờ là ${Math.round(n.tax * 100)}%.`; }
      if (k === 'war') {
        D.wars.push({ a: K, b: c.b, score: 0, years: 0, start: W.year, occ: [] }); D.n.wars++; flag(S, 'court');
        Dn().hist(D, W.year, 'war', `${n.name} tuyên chiến với ${R.nations[c.b].name}.`);
        return `Lệnh mộ lính ban xuống mọi tỉnh của ${n.name}.`;
      }
      if (k === 'peace') {
        const w = D.wars.find(x => (x.a === K || x.b === K)); if (!w) return null;
        D.wars = D.wars.filter(x => x !== w); Dn().endWar(R, D, w, W.year, X, S); flag(S, 'court');
        return 'Sứ giả hai bên ký hòa ước.';
      }
      return null;
    },
    auto(S, X, d) {
      const D = S.world.dyn, K = roles(S).ruler, st = D.nat[K].stab, has = id => d.choices.find(c => c.k === id);
      if (has('peace') && st < .4) return 'peace';
      if (st < .45 && has('down')) return 'down';
      if (st > .7 && has('war') && S.traits.bold > .7 && X.chance(.15)) return 'war';
      if (st > .65 && has('up') && X.chance(.3)) return 'up';
      return 'keep';
    }
  };
  // ── Vào hội (phường nghề theo sinh kế, đoàn lính đánh thuê theo sức) — hội có trụ sở trong tỉnh nhà
  const orgsHere = (S, f) => { const h = homeS(S), W = S.world; if (!live(h)) return []; return orgs(W).filter(o => !o.gone && G.SET[o.seat] && G.SET[o.seat].province === h.province && f(o)); };
  const canJoin = (S, X, o) => !roles(S).orgs[o.id] && (o.kind === 'merc' ? S.level >= 10 && X.stage(S) === 'adult' : (G.ORG_KINDS[o.kind].works || []).includes(S.work));
  DEC.org_join = {
    prio: 4, gap: 3,
    when(S, X) {
      if (!adultish(S, X)) return false;
      const r = roles(S);
      return (!r.adv && S.level >= 3) || orgsHere(S, o => canJoin(S, X, o) && !Object.keys(r.orgs).some(id => { const m = G.orgById(S.world, id); return m && m.kind === o.kind; })).length > 0;
    },
    build(S, X) {
      const r = roles(S), ch = [], fee = Math.round(G.median(X.reg(S)) * .3);
      if (!r.adv && S.level >= 3) ch.push({ k: 'adv', label: 'Ghi tên Hiệp Hội Mạo Hiểm', sub: 'Mọi nghề đều nhận. Bảng nhiệm vụ, tiền thưởng, hạng theo danh vọng.' });
      for (const o of orgsHere(S, o => canJoin(S, X, o)).slice(0, 2)) ch.push({ k: o.id, label: `Vào ${o.name}`, sub: `${o.members} người, ${o.kind === 'merc' ? 'nhận hợp đồng đánh thuê và hộ tống' : `thu nhập +${Math.round(G.ORG_KINDS[o.kind].inc[0] * 100)}%`}; lệ phí ${fee} bạc. ${G.ORG_KINDS[o.kind].ranks[2][0].toUpperCase() + G.ORG_KINDS[o.kind].ranks[2].slice(1)}: ${o.leader.name}.`, fee });
      if (!ch.length) return null;
      return { title: 'Hội, đoàn', body: 'Người trong nghề rủ bạn vào hội. Vào thì có chỗ dựa; không vào thì không ai đòi hội phí.', choices: [...ch, { k: 'no', label: 'Không vào', sub: '' }] };
    },
    apply(S, X, k, c) {
      if (k === 'no') return null;
      const r = roles(S), W = S.world;
      if (k === 'adv') { r.adv = { since: W.year, branch: null }; flag(S, 'advJoin'); return 'Bạn nhận thẻ hạng ' + G.ADV_RANKS[G.advRank(S)] + '.'; }
      const o = G.orgById(W, k); if (!o) return null;
      S.gold -= c.fee || 0; r.orgs[o.id] = { rank: 0, since: W.year }; o.members++; flag(S, o.kind === 'merc' ? 'mercJoin' : 'orgJoin');
      return `Bạn là ${G.ORG_KINDS[o.kind].ranks[0]} của ${o.name}.`;
    },
    auto(S, X, d) {
      const T = S.traits, merc = d.choices.find(c => c.k !== 'adv' && c.k !== 'no' && G.orgById(S.world, c.k).kind === 'merc');
      if (merc && T.bold > .7 && (['adventurer', 'guard', 'hunter'].includes(S.work) || S.undead)) return merc.k;
      const prof = d.choices.find(c => c.k !== 'adv' && c.k !== 'no' && G.orgById(S.world, c.k).kind !== 'merc');
      if (prof && (T.social > .4 || G.lawHere(S, 'guild_monopoly'))) return prof.k;
      if (d.choices.some(c => c.k === 'adv') && T.bold > .55 && ['hunter', 'guard'].includes(S.work)) return 'adv';
      return 'no';
    }
  };
  // ── Được bầu quản lý: quản sự → hội trưởng (hội trưởng NPC), trưởng chi nhánh Hiệp Hội (hạng Vàng, khu có Hội Mạo Hiểm)
  DEC.org_lead = {
    prio: 5, gap: 4,
    when(S, X) {
      if (!adultish(S, X)) return false;
      const r = roles(S), h = homeS(S);
      if (r.adv && !r.adv.branch && G.advRank(S) >= 3 && live(h) && (h.bld || []).includes('guild')) return true;
      return Object.entries(r.orgs).some(([id, m]) => { const o = G.orgById(S.world, id); return o && ((m.rank === 0 && m.offer) || (m.rank === 1 && !o.leader.player && S.world.year - m.since >= 3)); });
    },
    build(S, X) {
      const r = roles(S), h = homeS(S), ch = [];
      if (r.adv && !r.adv.branch && G.advRank(S) >= 3 && live(h) && (h.bld || []).includes('guild')) ch.push({ k: 'adv', label: `Làm trưởng chi nhánh ${h.name}`, sub: 'Chia việc, giữ bảng nhiệm vụ, nhận một phần tiền thưởng.' });
      for (const [id, m] of Object.entries(r.orgs)) { const o = G.orgById(S.world, id); if (o && m.rank === 0 && m.offer) ch.push({ k: 'o' + id, label: `Làm ${G.ORG_KINDS[o.kind].ranks[1]} ${o.name}`, sub: 'Lo sổ sách, chia việc; có phụ cấp. Mở focus Quản lý.' }); }
      for (const [id, m] of Object.entries(r.orgs)) { const o = G.orgById(S.world, id); if (o && m.rank === 1 && !o.leader.player && S.world.year - m.since >= 3) ch.push({ k: id, label: `Làm ${G.ORG_KINDS[o.kind].ranks[2]} ${o.name}`, sub: `${o.leader.name} già yếu muốn nhường. ${o.members} người.` }); }
      if (!ch.length) return null;
      return { title: 'Đề cử', body: 'Người ta muốn bạn đứng đầu.', choices: [...ch, { k: 'no', label: 'Chỉ làm thành viên', sub: '' }] };
    },
    apply(S, X, k) {
      if (k === 'no') { for (const m of Object.values(roles(S).orgs)) delete m.offer; return null; }
      const r = roles(S), W = S.world;
      if (k === 'adv') { r.adv.branch = S.home.settlement; flag(S, 'advBranch'); Dn().hist(W.dyn, W.year, 'org', `${S.name} làm trưởng chi nhánh Hiệp Hội Mạo Hiểm ở ${G.SET[S.home.settlement].name}.`); return 'Bạn nhận chìa khóa két tiền thưởng.'; }
      if (k[0] === 'o') { const id = k.slice(1), o = G.orgById(W, id); r.orgs[id].rank = 1; r.orgs[id].since = W.year; delete r.orgs[id].offer; flag(S, 'orgOfficer'); return `Bạn làm ${G.ORG_KINDS[o.kind].ranks[1]} ${o.name}.`; }
      const o = G.orgById(W, k); r.orgs[k].rank = 2; o.leader = { name: S.name, player: true }; flag(S, 'orgLead');
      Dn().hist(W.dyn, W.year, 'org', `${S.name} làm ${G.ORG_KINDS[o.kind].ranks[2]} ${o.name}.`);
      return `Bạn là ${G.ORG_KINDS[o.kind].ranks[2]} ${o.name}.`;
    },
    auto: (S, X, d) => S.traits.social > .7 ? d.choices[0].k : 'no'
  };
  // ── Lập hội (không có hội cùng loại ở khu nhà)
  const foundable = (S, X) => {
    const h = homeS(S); if (!live(h) || !adultish(S, X)) return [];
    const has = kind => orgs(S.world).some(o => !o.gone && o.kind === kind && o.seat === h.id);
    const out = [];
    for (const [kind, K] of Object.entries(G.ORG_KINDS)) {
      if (has(kind)) continue;
      if (kind === 'merc') { if (S.level >= 15 && S.fame >= 30 && S.gold >= 500 && G.TIER_RANK[h.tier] <= 3) out.push(kind); continue; }
      if (K.works.includes(S.work) && S.fame >= 20 && S.gold >= 300 && (G.TIER_RANK[h.tier] <= 2 || kind === 'craft' || kind === 'farm')) out.push(kind);
    }
    return out;
  };
  DEC.org_found = {
    prio: 3, gap: 5,
    when: (S, X) => foundable(S, X).length > 0,
    build(S, X) {
      const h = homeS(S);
      return { title: 'Lập hội', body: `${h.name} chưa có hội cho người như bạn.`,
        choices: [...foundable(S, X).map(kind => ({ k: kind, label: kind === 'merc' ? 'Lập đoàn lính đánh thuê' : `Lập ${G.ORG_KINDS[kind].nameVi} ${G.rootName(h.name)}`, sub: `${kind === 'merc' ? 500 : 300} bạc; bạn là ${G.ORG_KINDS[kind].ranks[2]}.` })), { k: 'no', label: 'Thôi', sub: '' }] };
    },
    apply(S, X, k) {
      if (k === 'no') return null;
      const W = S.world, R = G.bindWorld(W), h = homeS(S);
      S.gold -= k === 'merc' ? 500 : 300;
      const o = newOrg(R, W, k, h, W.year, X, { name: S.name, player: true });
      roles(S).orgs[o.id] = { rank: 2, since: W.year }; flag(S, 'orgFound');
      Dn().hist(W.dyn, W.year, 'org', `${S.name} lập ${o.name} ở ${h.name}.`);
      return `${o.name} có ${o.members} người theo bạn.`;
    },
    auto: (S, X, d) => S.traits.bold + S.traits.social > 1.55 ? d.choices[0].k : 'no'
  };
  // ── Bảng nhiệm vụ Hiệp Hội Mạo Hiểm: dọn hang, hộ tống, săn thủ lĩnh, tìm đồ
  DEC.quest = {
    prio: 6, gap: 1,
    when: (S, X) => !!roles(S).adv && ['teen', 'adult', 'elder'].includes(X.stage(S)) && (S.focus === 'hunt' || S.focus === 'adventure' || (S.focus === 'work' && S.work === 'adventurer')),
    build(S, X) {
      const ct = X.ctier(S), ch = [], pay = n => Math.round(n * Math.pow(1 + ct, 2));
      const l = G.lairChoices(S, X)[0];
      if (l) ch.push({ k: 'lair', label: `Dọn ${l.name}`, sub: `${G.LAIR_VI[l.lv]}, ${G.LAIR_FIGHTS[l.lv]} trận; Hiệp Hội thưởng thêm ${pay(40) * l.lv} bạc.`, lair: l.id, bonus: pay(40) * l.lv });
      const z = X.recommendedZone(S); if (z) ch.push({ k: 'escort', label: 'Hộ tống đoàn buôn', sub: `Qua ${z.zone.nameVi}, 1–3 trận; ${pay(18)} bạc mỗi trận.`, zone: z.zone.id, per: pay(18) });
      if (!S.flags.bounty && z) ch.push({ k: 'bounty', label: 'Nhận lệnh săn thủ lĩnh', sub: 'Lệnh treo thưởng ghi tên bạn.' });
      ch.push({ k: 'gather', label: 'Tìm đồ thất lạc, hái thuốc', sub: `Không phải đánh; ${pay(8)} bạc nếu tìm được.`, pay: pay(8) });
      return { title: 'Bảng nhiệm vụ', body: `Hạng ${G.ADV_RANKS[G.advRank(S)]}. Sức bạn ${X.power(S).toFixed(1)}.`, choices: [...ch, { k: 'no', label: 'Không nhận', sub: '' }] };
    },
    apply(S, X, k, c) {
      if (k === 'no') return null;
      flag(S, 'quests');
      const W = S.world;
      if (k === 'lair') { const l = (W.dyn.lairs || []).find(x => x.id === c.lair && x.empty == null); if (!l) return null; const out = G.raidLair(X, l); if (S.dead) return null; if (l.empty != null) { X.money(c.bonus); S.fame = Math.min(100, S.fame + 1); return out + ` Hiệp Hội thưởng ${c.bonus} bạc.`; } return out; }
      if (k === 'escort') {
        const z = G.ZONE[c.zone].zone, n = X.int(1, 3); let won = 0;
        for (let i = 0; i < n; i++) { const enc = X.rollEncounter(z); if (!enc) break; const rec = X.fight(enc, false); if (S.dead) return null; if (!rec.win) break; won++; }
        X.money(won * c.per); S.fame = Math.min(100, S.fame + won * .5);
        return won === n ? `Đoàn buôn tới nơi an toàn. +${won * c.per} bạc.` : `Đoàn buôn mất mấy xe hàng. +${won * c.per} bạc.`;
      }
      if (k === 'bounty') { const z = G.ZONE[X.recommendedZone(S).zone.id].zone, t = X.encounterTable(z, X.ctier(S), false); if (!t.length) return null; const sp = X.wpick(t, 'w').s; S.flags.bounty = { species: sp.id, zone: z.id, reward: Math.round(40 * Math.pow(1 + sp.tier, 2)) }; return `Lệnh săn ${sp.nameVi} thủ lĩnh ở ${z.nameVi}.`; }
      if (k === 'gather') {
        const sk = Math.max(S.mastery.Stealth || 0, S.mastery.Alchemy || 0, S.mastery.Nature || 0);
        if (X.chance(.45 + sk / 200)) { X.money(c.pay); S.fame = Math.min(100, S.fame + .3); return `Tìm được. +${c.pay} bạc.`; }
        X.add('hl', -X.int(2, 6)); return 'Lội cả tuần không thấy gì.';
      }
      return null;
    },
    auto(S, X, d) {
      const pw = X.power(S), has = id => d.choices.find(c => c.k === id);
      const l = has('lair') && (S.world.dyn.lairs || []).find(x => x.id === has('lair').lair);
      if (l && S.hl > 55 && pw >= G.tableThreat(X, G.lairZone(l), l.fam) + .1 * l.lv) return 'lair';
      if (has('escort') && S.hl > 45) return 'escort';
      if (has('bounty') && S.traits.bold > .6) return 'bounty';
      return 'gather';
    }
  };
  // ── Hợp đồng đánh thuê: nước kề tỉnh nhà đang có chiến tranh thì đánh cho một bên; không có thì hộ tống
  DEC.merc = {
    prio: 7, gap: 1,
    when: (S, X) => X.stage(S) === 'adult' && Object.keys(roles(S).orgs).some(id => { const o = G.orgById(S.world, id); return o && o.kind === 'merc'; }),
    build(S, X) {
      const W = S.world, R = G.bindWorld(W), D = W.dyn, p = G.provOfS(S), near = new Set(p >= 0 ? [D.prov[p], ...Dn().neighbors(R, p).map(q => D.prov[q])] : []);
      const m = Object.entries(roles(S).orgs).find(([id]) => { const o = G.orgById(W, id); return o && o.kind === 'merc'; }), o = G.orgById(W, m[0]), rank = m[1].rank;
      const med = G.median(X.reg(S)), ch = [];
      for (const w of D.wars) if (near.has(w.a) || near.has(w.b)) for (const side of [w.a, w.b]) {
        if (S.flags.wanted && S.flags.wanted[side]) continue;
        ch.push({ k: 'w' + side + ':' + (side === w.a ? w.b : w.a), label: `Đánh thuê cho ${R.nations[side].name}`, sub: `chống ${R.nations[side === w.a ? w.b : w.a].name}; ${Math.round(med * (1.5 + rank))} bạc.`, side, w: D.wars.indexOf(w) });
        if (ch.length >= 2) break;
      }
      if (!ch.length) ch.push({ k: 'escort', label: 'Nhận việc hộ tống', sub: `Đi cùng đoàn buôn, 1–2 trận; ${Math.round(med * .8)} bạc.` });
      return { title: o.name, body: `Đoàn có ${o.members} người. Bạn là ${G.ORG_KINDS.merc.ranks[rank]}.`, choices: [...ch, { k: 'no', label: 'Nghỉ năm nay', sub: '' }], org: o.id, rank };
    },
    apply(S, X, k, c) {
      if (k === 'no') return null;
      const W = S.world, R = G.bindWorld(W), D = W.dyn, rank = Math.max(0, ...Object.entries(roles(S).orgs).map(([id, m]) => G.orgById(W, id) && G.orgById(W, id).kind === 'merc' ? m.rank : 0));
      const o = Object.keys(roles(S).orgs).map(id => G.orgById(W, id)).find(x => x && x.kind === 'merc'), med = G.median(X.reg(S));
      if (k === 'escort') {
        const z = X.recommendedZone(S); let won = 0; const n = X.int(1, 2);
        if (z) for (let i = 0; i < n; i++) { const enc = X.rollEncounter(z.zone); if (!enc) break; const rec = X.fight(enc, false); if (S.dead) return null; if (!rec.win) break; won++; }
        X.money(Math.round(med * .8 * (won ? 1 : .5))); flag(S, 'mercJobs');
        return won ? 'Hàng tới nơi.' : 'Mất hàng giữa đường; chủ hàng chỉ trả nửa.';
      }
      const w = D.wars.find(x => (x.a === c.side || x.b === c.side)); if (!w) return 'Hai bên đã ngừng đánh trước khi bạn tới.';
      flag(S, 'mercC');
      const pw = X.power(S), size = G.clamp(o.members / 60, .5, 2), pDie = G.clamp(.07 - .012 * pw - .01 * rank, .008, .07);
      if (X.chance(pDie)) { X.die({ id: 'war', text: `tử trận khi đánh thuê cho ${R.nations[c.side].name}` }); return null; }
      w.score += (c.side === w.a ? 1 : -1) * .05 * (1 + rank) * size;
      if (G.addMerit) G.addMerit(S, c.side, 3);   // công trạng với nước thuê mình (js/noble.js)
      const pay = Math.round(med * (1.5 + rank)); X.money(pay); S.fame = Math.min(100, S.fame + 1 + rank);
      X.add('hl', -X.int(3, 12)); X.addXp(40 * (1 + X.ctier(S)));
      o.rep = Math.min(1, o.rep + .02);
      return `Bạn theo ${o.name} đánh một mùa cho ${R.nations[c.side].name}. +${pay} bạc.`;
    },
    auto(S, X, d) { const w = d.choices.find(c => c.k[0] === 'w'); if (w && S.hl > 55) return w.k; return d.choices[0].k === 'escort' && S.hl > 45 ? 'escort' : 'no'; }
  };

  // ═════════ Thu nhập: hội viên phường nghề ═════════
  G.orgIncome = S => {
    const r = S.roles; if (!r) return 1;
    let m = 1;
    for (const [id, x] of Object.entries(r.orgs || {})) { const o = G.orgById(S.world, id); if (!o || o.gone) continue; const K = G.ORG_KINDS[o.kind]; if (K.works && K.works.includes(S.work)) m += K.inc[x.rank] * (.5 + o.rep); }
    return m;
  };
  G.inGuildOf = (S, work) => { const r = S.roles; if (!r) return false; return Object.keys(r.orgs || {}).some(id => { const o = G.orgById(S.world, id); return o && !o.gone && (G.ORG_KINDS[o.kind].works || []).includes(work); }); };

  // ═════════ Rời hội, từ chức (nút ở giao diện) ═════════
  G.leaveRole = function (S, X, what, id) {
    const r = roles(S), W = S.world, D = W.dyn;
    if (what === 'org') { const o = G.orgById(W, id); if (o && o.leader.player && r.orgs[id] && r.orgs[id].rank === 2) o.leader = { name: G.personName(S.race === 'skeleton' ? 'human' : S.race, 'm', X.rnd), player: false }; delete r.orgs[id]; if (o) o.members = Math.max(3, o.members - 1); return o ? `Bạn rời ${o.name}.` : null; }
    if (what === 'adv') { if (r.adv && r.adv.branch) { r.adv.branch = null; return 'Bạn giao lại chi nhánh, vẫn giữ thẻ hội.'; } r.adv = null; return 'Bạn trả thẻ Hiệp Hội.'; }
    if (what === 'head') { const h = G.SET[r.head]; if (live(h)) Dn().setField(D, h, 'head', { name: G.personName(h.race || 'human', 'm', X.rnd), player: false, since: W.year }); r.head = null; return 'Bạn giao lại việc chung cho người khác.'; }
    if (what === 'office') { r.office = null; return 'Bạn treo ấn từ quan.'; }
    if (what === 'noble') return G.renounceTitle ? G.renounceTitle(S) : null;
    if (what === 'rank') { const t = G.rankText(S); r.rank = null; return t ? `Bạn từ bỏ bậc ${t.split(' của ')[0]}.` : null; }
    if (what === 'ruler') {
      const k = r.ruler, n = G.realm.nations[k], nr = Dn().makeRuler(n, X);
      if (nr) { D.nat[k].ruler = nr; n.ruler = nr; } D.nat[k].stab = Math.max(0, D.nat[k].stab - .08);
      Dn().hist(D, W.year, 'king', `${S.name} thoái vị; ${nr ? nr.name : 'hội đồng'} nắm ${n.name}.`); r.ruler = null; return 'Bạn trao ngai và lui về.';
    }
    return null;
  };

  // ═════════ Kế vị khi người chơi chết (life.js die) ═════════
  G.onDeath = function (S, X) {
    const r = S.roles; if (!r) return;
    const W = S.world, R = G.bindWorld(W), D = W.dyn, year = W.year;
    const heir = (S.family.kids || []).find(k => k.alive && k.age >= X.R(S).adult);
    const epithet = () => { const E = G.NAMES.epithet; return S.fame >= 70 ? X.pick(['Đại Đế', 'Hiền', 'Người Giữ Lời', 'Người Mở Đường']) : X.pick(E); };
    if (r.head != null) {
      const h = G.SET[r.head];
      if (live(h) && h.head && h.head.player) {
        const nm = heir ? heir.name + ' ' + (S.name.split(' ').slice(1).join(' ') || '') : G.personName(h.race || 'human', X.chance(.5) ? 'm' : 'f', X.rnd);
        Dn().setField(D, h, 'head', { name: nm.trim(), player: false, since: year });
        Dn().hist(D, year, 'head', `${S.name}, ${G.HEAD_VI[h.tier] || 'trưởng'} ${h.name}${h.founder === S.name ? ' và là người lập ra nó' : ''}, qua đời; ${nm.trim()} ${heir ? '(con)' : '(dân bầu)'} thay.`);
      }
    }
    if (r.ruler != null) {
      const k = r.ruler, n = R.nations[k], d = D.nat[k];
      if (d && d.alive && d.ruler && d.ruler.player) {
        const nr = Dn().makeRuler(n, X);
        if (nr && heir) nr.name = heir.name;
        d.ruler = nr; n.ruler = nr; d.stab = Math.max(0, d.stab - .1);
        const ep = epithet();
        Dn().hist(D, year, 'king', `${S.name} "${ep}"${n.founded ? ', người lập ' + n.name : ''}, băng hà.${nr ? ` ${nr.name}${heir ? ' (con)' : ''} lên ngôi.` : ''}`);
        S.flags.epithet = ep;
      }
    }
    for (const [id, m] of Object.entries(r.orgs || {})) {
      const o = G.orgById(W, id); if (!o || !o.leader.player || m.rank < 2) continue;
      o.leader = { name: G.personName(S.race === 'skeleton' ? 'human' : S.race, X.chance(.5) ? 'm' : 'f', X.rnd), player: false };
      Dn().hist(D, year, 'org', `${o.name} mất ${G.ORG_KINDS[o.kind].ranks[2]} ${S.name}; ${o.leader.name} lên thay.`);
    }
    if (G.nobleDeath) G.nobleDeath(S, X);
    S.rolesAtDeath = JSON.parse(JSON.stringify(r));
    S.roles = { head: null, office: null, ruler: null, orgs: {}, adv: null, noble: null };
  };

  // ═════════ Mô tả vai trò (giao diện, nhật ký đời) ═════════
  const cap = t => t[0].toUpperCase() + t.slice(1);
  G.roleList = S => {
    const r = S.roles, W = S.world, out = [];
    if (!r) return out;
    if (r.ruler != null) { const n = G.realm.nations[r.ruler], d = W.dyn.nat[r.ruler]; out.push({ what: 'ruler', text: `${d && d.ruler ? d.ruler.title : 'Người cai trị'} ${n.name}`, mgr: true }); }
    if (r.noble && G.nobleText) out.push({ what: 'noble', text: G.nobleText(S), mgr: false });
    if (r.rank && G.rankText) out.push({ what: 'rank', text: G.rankText(S), mgr: r.rank.r >= 2 });
    if (r.office) out.push({ what: 'office', text: `${G.OFFICE_VI[r.office.rank]} ${G.realm.nations[r.office.k].name}${r.office.rank === 1 ? ' · tỉnh ' + G.realm.provinces[r.office.p].name : ''}`, mgr: true });
    if (r.head != null && G.SET[r.head]) { const h = G.SET[r.head]; out.push({ what: 'head', text: `${cap(G.HEAD_VI[h.tier] || 'trưởng')} ${h.name}${h.founder === S.name ? ' (bạn lập)' : ''}`, mgr: true }); }
    if (r.adv) out.push({ what: 'adv', text: `Hiệp Hội Mạo Hiểm · hạng ${G.ADV_RANKS[G.advRank(S)]}${r.adv.branch && G.SET[r.adv.branch] ? ' · trưởng chi nhánh ' + G.SET[r.adv.branch].name : ''}`, mgr: !!r.adv.branch });
    for (const [id, m] of Object.entries(r.orgs || {})) { const o = G.orgById(W, id); if (o) out.push({ what: 'org', id, text: `${o.name} · ${G.ORG_KINDS[o.kind].ranks[m.rank]}`, mgr: m.rank >= 1 }); }
    return out;
  };
  // Hội có trụ sở ở một khu (tooltip bản đồ).
  G.orgsAt = (W, sid) => orgs(W).filter(o => !o.gone && o.seat === sid);
})(window.LifeSim);
