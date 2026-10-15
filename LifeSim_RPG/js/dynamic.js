/* Vạn Kiếp — THẾ GIỚI ĐỘNG (bước 7 của research/03: mục 5.3 quốc gia động, 3.1 khu dân cư sụp / lập, 3.3 độ hoang động,
 * 3.5 mật độ quái theo tỉnh × tầng, 11 save).
 * Thế giới tĩnh (js/realm.js) dựng lại từ seed; phần đổi nằm trong S.world.dyn (JSON thuần, lưu được):
 *   prov[p]          nước chủ tỉnh p (−1 = vô chủ)
 *   war[p], raid[p]  tỉnh là tiền tuyến (1) / thuộc nước đang đánh (.4); thú triều (ven quá đông)
 *   hp[sid]          sức sống khu dân cư còn sống, 0–1
 *   sx[sid]          phần đổi của khu so với lúc dựng (bậc, dân, sa sút, năm sụp / hồi sinh, chủng tộc, đạo)
 *   newSets, newNat  khu mới lập, nước mới lập (đủ bản ghi; chính bản ghi này được đẩy vào G.realm)
 *   nat[k]           chỉ số động của mọi nước: còn sống, ổn định, kinh đô, người cai trị, số năm hòa bình
 *   rd[i]            bậc hiện tại của đoạn đường i đã xuống cấp
 *   wars, truce      chiến tranh đang đánh (điểm, số năm, tỉnh đang chiếm), hưu chiến tới năm nào
 *   hist             sử biên niên (300 dòng cuối); n: bộ đếm cho sim.html
 * G.bindWorld(W): đưa G.realm về đúng trạng thái của W. Cùng W thì không làm gì; W khác (đời khác, đồng niên, thế giới
 * vừa nạp) thì trả G.realm về bản gốc rồi áp phần đổi. Trong năm, mọi thay đổi đi qua các hàm ở đây: sửa W.dyn và G.realm
 * cùng lúc, độ hoang chỉ tính lại vùng bị ảnh hưởng (G.wildSet / G.wildCommit ở realm.js).
 * Hệ con "nations" chạy sau "world", ypt bước năm mỗi lượt (chủng tộc sống lâu một lượt nhiều năm).
 */
window.LifeSim = window.LifeSim || {};
(function (G) {
  const NONE = -1, SEA = 255;
  const COLORS = ['#d4a72c', '#3f86c9', '#c2493d', '#4fa35c', '#9460c0', '#d27a34', '#35aaa5', '#b04478', '#8b9a3a', '#6070c8',
    '#a0623a', '#5f9ea0', '#c05890', '#7a8a98', '#b8a650', '#4a7ab0'];
  const HIST_MAX = 300;
  // Hệ số cân bằng (research/03 mục 5.7): chỉnh ở đây, đo bằng sim.html (300 năm × nhiều thế giới).
  G.DYN = {
    // hp khu dân cư mỗi năm: bị thú triều đánh (xác suất = cường độ thú triều × raidHit), bị cướp phá ở tiền tuyến (warHit), dịch nặng; yên thì hồi.
    raidHit: .05, raidLoss: .25, warHit: .3, warLoss: .2, plagueLoss: .08, heal: .05,
    frail: { capital: .2, city: .35, town: .5, village: .8, hamlet: 1 },   // hp mất nhân hệ số theo bậc
    warP: .002, claim: 15, rebelP: .01, annexP: .02, foundP: .04   // tuyên chiến (× claim khi đòi lại tỉnh đã nổi loạn), nổi loạn, sáp nhập, lập khu mới
  };

  // ═════════ Trạng thái động mới cho một thế giới ═════════
  // Luôn dựng từ bản gốc của realm (realm có thể đang mang trạng thái của một thế giới khác).
  G.newDyn = R => { if (!R.base) { snapshot(R); R._clean = true; } const B = R.base; return {
    v: 1, rev: 0, nsid: 0,
    prov: B.prov.slice(), war: B.prov.map(() => 0), raid: B.prov.map(() => 0),
    hp: Object.fromEntries(B.s.flatMap((s, i) => s.tier === 'ruin' ? [] : [[B.ids[i], 1]])), sx: {}, newSets: [], newNat: [], rd: {},
    nat: B.n.map(n => ({ alive: true, stab: n.stability, cap: n.capital, ruler: n.ruler ? { ...n.ruler } : null, peace: 10 })),
    wars: [], truce: {}, hist: [],
    n: { kept: 0, occ: 0, rebel: 0, join: 0, annex: 0, wars: 0, newNat: 0, fell: 0, ruins: 0, founded: 0, revived: 0, kings: 0, moved: 0, roads: 0 }
  }; };
  // Thế giới cho một đời (Sim.newWorld) hoặc chạy headless (G.runWorld): mật độ quái theo tỉnh × tầng và vùng hoang × tầng, tầng biển.
  G.makeWorld = function (X) {
    const R = G.realm, zonePop = {}, v = () => +(0.85 + X.rnd() * .35).toFixed(3);
    for (let p = 0; p < R.provinces.length; p++) for (let b = 0; b < 4; b++) zonePop['p' + p + ':' + b] = v();
    G.REGIONS.forEach((r, k) => { for (let b = 0; b < 4; b++) zonePop['r' + k + ':' + b] = v(); });
    for (const r of G.SEAS) for (const z of r.zones) zonePop[z.id] = v();
    const regions = Object.fromEntries(G.REGIONS.map(r => [r.id, { plague: 0 }]));
    return { year: 1000 + X.int(120, 380), seed: R.seed, zonePop, regions, lordSeen: {}, dyn: G.newDyn(R) };
  };

  // ═════════ Gắn thế giới vào G.realm ═════════
  function snapshot(R) {
    R.base = {
      nations: R.nations.length, sets: R.settlements.length, ids: R.settlements.map(s => s.id), owner: Int8Array.from(R.owner), road: Uint8Array.from(R.road),
      harbors: R.harbors.slice(), roads: R.roads.map(r => r.cls), prov: R.provinces.map(p => p.nation),
      s: R.settlements.map(s => ({ tier: s.tier, urban: s.urban, rural: s.rural, nation: s.nation, race: s.race, races: s.races, faiths: s.faiths,
        bld: s.bld, buildings: s.buildings, roles: s.roles, name: s.name, was: null, dwindling: false, ruined: null, revived: null, founded: null })),
      n: R.nations.map(n => ({ stability: n.stability, capital: n.capital, capitalCell: n.capitalCell, ruler: n.ruler, labelPos: n.labelPos, relations: { ...n.relations }, alive: true }))
    };
    // Độ hoang lúc dựng: thế giới chưa đổi gì (đời mới) thì chép lại thay vì tính lại.
    Object.assign(R.base, { wild: Float32Array.from(R.wild), band: Uint8Array.from(R.band), wmin: Float32Array.from(R._wmin), src: new Map(R._src), bandCells: R.bandCells });
    // Ô của từng tỉnh; ô của từng nước nằm ngoài mọi tỉnh (đổi chủ theo nước, mất khi nước mất).
    const { provOf, owner } = R, pc = R.provinces.map(() => []), extra = R.nations.map(() => []);
    for (let i = 0; i < provOf.length; i++) { if (provOf[i] >= 0) pc[provOf[i]].push(i); else if (owner[i] >= 0) extra[owner[i]].push(i); }
    R._provCells = pc.map(a => Int32Array.from(a)); R._natExtra = extra;
    R._provSets = R.provinces.map((p, q) => R.settlements.filter(s => s.province === q));
    R.rev = R.rev || 0;
  }
  function reset(R) {
    const B = R.base;
    R.nations.length = B.nations; R.nations.forEach((n, k) => Object.assign(n, B.n[k], { relations: { ...B.n[k].relations } }));
    R.settlements.length = B.sets; R.settlements.forEach((s, i) => Object.assign(s, B.s[i]));
    R.provinces.forEach((p, q) => { p.nation = B.prov[q]; });
    R._provSets = R.provinces.map((p, q) => R.settlements.filter(s => s.province === q));
    R.owner.set(B.owner); R.road.set(B.road); R.roads.forEach((r, k) => { r.cls = B.roads[k]; });
  }
  const syncNat = (R, D) => R.nations.forEach((n, k) => {
    const d = D.nat[k]; n.alive = d.alive; n.stability = +d.stab.toFixed(3); n.ruler = d.ruler;
    if (n.capital !== d.cap && R.byId[d.cap]) { n.capital = d.cap; n.capitalCell = R.byId[d.cap].cell; }
  });
  G.bindWorld = function (W) {
    const R = G.realm;
    if (!R || !W) return R;
    if (!W.dyn) W.dyn = G.newDyn(R);
    if (R._W === W) return R;
    if (!R.base) { snapshot(R); R._clean = true; }
    const D = W.dyn;
    R._W = W;
    if (R._clean && D.rev === 0) { syncNat(R, D); return R; }
    reset(R);
    if (D.rev === 0) {
      const B = R.base;
      R.byId = G.SET = Object.fromEntries(R.settlements.map(s => [s.id, s]));
      R.harbors = B.harbors.slice(); G.indexRealm(R); provPop(R);
      R.wild.set(B.wild); R.band.set(B.band); R._wmin.set(B.wmin); R._src = new Map(B.src); R._dirty = []; R.bandCells = B.bandCells; R._tc = null; R._seaLines = null;
      R._relabel = false;
      syncNat(R, D); R._clean = true; R.rev++;
      return R;
    }
    for (const n of D.newNat) R.nations.push(n);
    for (const s of D.newSets) { R.settlements.push(s); if (s.province >= 0) R._provSets[s.province].push(s); }
    R.byId = G.SET = Object.fromEntries(R.settlements.map(s => [s.id, s]));
    for (const [sid, x] of Object.entries(D.sx)) Object.assign(R.byId[sid], x);
    syncNat(R, D);
    // Chủ tỉnh → chủ ô, chủ khu dân cư.
    R.provinces.forEach((p, q) => { p.nation = D.prov[q]; });
    for (const s of R.settlements) if (s.province >= 0) s.nation = D.prov[s.province];
    const B = R.base, owner = R.owner;
    R._provCells.forEach((cs, q) => { for (const c of cs) owner[c] = D.prov[q]; });
    R._natExtra.forEach((cs, k) => { if (!D.nat[k].alive) for (const c of cs) owner[c] = NONE; });
    for (const [k, cls] of Object.entries(D.rd)) R.roads[k].cls = cls;
    if (Object.keys(D.rd).length) rebuildRoad(R);
    R.harbors = B.harbors.filter(h => h.tier !== 'ruin');
    G.indexRealm(R); provPop(R);
    R._relabel = true;
    G.wildFull(R);
    R._clean = false; R.rev++;
    return R;
  };
  // Mọi thay đổi cấu trúc gọi touch: đánh dấu realm không còn là bản gốc, báo giao diện vẽ lại.
  const touch = (R, D) => { D.rev++; R._clean = false; R.rev++; };

  // ═════════ Tra cứu ═════════
  const provPop = R => {
    for (const p of R.provinces) { p.urban = 0; p.rural = 0; }
    for (const s of R.settlements) if (s.province >= 0 && s.tier !== 'ruin') { R.provinces[s.province].urban += s.urban; R.provinces[s.province].rural += s.rural; }
    for (const p of R.provinces) p.pop = p.urban + p.rural;
  };
  const liveIn = (R, p) => R._provSets[p].filter(s => s.tier !== 'ruin');
  const provsOf = (D, k) => { const a = []; D.prov.forEach((o, p) => { if (o === k) a.push(p); }); return a; };
  const neighbors = (R, p) => (R._nb || (R._nb = R.provAdj.map((a, q) => [...a, ...R.provSea[q]])))[p];
  const top = o => { let b = null, v = -1; for (const [k, w] of Object.entries(o || {})) if (k !== 'none' && w > v) { v = w; b = k; } return b; };
  const pname = (R, p) => R.provinces[p].name;
  // Chỗ đặt tên nước: tâm lãnh thổ, kéo về ô gần nhất của nước. Mọi nước trong hai lượt quét.
  // Chỉ giao diện cần: thay đổi chỉ đánh dấu R._relabel, bản đồ gọi G.relabelNations trước khi vẽ.
  G.relabelNations = R => { if (R._relabel) { R._relabel = false; relabel(R); } };
  function relabel(R) {
    const M = G.map, W = M.W, CS = M.CS, K = R.nations.length, sx = new Float64Array(K), sy = new Float64Array(K), n = new Float64Array(K), bd = new Float64Array(K).fill(Infinity), bi = new Int32Array(K).fill(-1);
    for (let i = 0; i < R.owner.length; i++) { const k = R.owner[i]; if (k >= 0) { sx[k] += i % W; sy[k] += (i - i % W) / W; n[k]++; } }
    for (let k = 0; k < K; k++) if (n[k]) { sx[k] /= n[k]; sy[k] /= n[k]; }
    for (let i = 0; i < R.owner.length; i++) { const k = R.owner[i]; if (k < 0) continue; const x = i % W, y = (i - x) / W, d = (x - sx[k]) ** 2 + (y - sy[k]) ** 2; if (d < bd[k]) { bd[k] = d; bi[k] = i; } }
    R.nations.forEach((nat, k) => { if (bi[k] >= 0) nat.labelPos = [(bi[k] % W + .5) * CS, (Math.floor(bi[k] / W) + .5) * CS]; });
  }
  // Tỉnh nơi nhân vật sống: tỉnh của khu dân cư nhà mình, không có thì tỉnh của ô đang đứng.
  G.provOfS = S => {
    const s = S.home && S.home.settlement && G.SET ? G.SET[S.home.settlement] : null;
    if (s && s.tier !== 'ruin' && s.province >= 0) return s.province;
    const c = S.pos && G.map.at(S.pos[0], S.pos[1]);
    return c ? G.realm.provOf[c.cell] : NONE;
  };
  // Tình hình nơi ở: dịch (theo vùng), chiến tranh và thú triều (theo tỉnh).
  G.local = S => {
    const W = S.world, D = W.dyn, p = G.provOfS(S), rs = W.regions[S.loc] || { plague: 0 };
    return { p, plague: rs.plague || 0, war: p >= 0 && D ? D.war[p] || 0 : 0, raid: p >= 0 && D ? D.raid[p] || 0 : 0 };
  };
  // Khóa mật độ quái: ô biển theo tầng biển; ô đất theo tỉnh × tầng, ô ngoài mọi tỉnh theo vùng × tầng (đất hoang).
  G.areaKey = cell => {
    const R = G.realm, M = G.map;
    if (M.region[cell] === SEA) return G.seaZoneAt(cell).id;
    const p = R.provOf[cell], b = R.band[cell];
    return p >= 0 ? 'p' + p + ':' + b : 'r' + M.region[cell] + ':' + b;
  };
  // Mật độ của một tầng (khu) ở tỉnh p (p < 0: đất hoang của vùng chứa khu).
  G.zoneKey = (zone, p) => {
    const Z = G.ZONE[zone.id];
    if (!Z || Z.sea) return zone.id;
    return p >= 0 ? 'p' + p + ':' + Z.index : 'r' + G.map.idx[Z.region.id] + ':' + Z.index;
  };
  G.densityOf = (W, key) => W.zonePop[key] ?? 1;

  // ═════════ Thay đổi (sửa W.dyn và G.realm cùng lúc) ═════════
  function rebuildRoad(R) {
    R._tc = null;   // bảng chi phí đi bộ (js/travel.js) theo đường
    R.road.fill(0);
    for (const r of R.roads) if (r.cls > 0) for (const c of r.cells) if (R.road[c] < r.cls) R.road[c] = r.cls;
  }
  // Nguồn văn minh của các khu và nhóm đường trong tỉnh p (sau khi tỉnh đổi chủ: tuần tra theo nước mới).
  function rewildProv(R, p) {
    for (const s of R._provSets[p]) G.wildSet(R, 'S' + s.id, G.wildOfSettlement(R, s));
    const cells = []; for (const c of R._provCells[p]) if (R.road[c] >= 2) cells.push(c);
    G.wildSet(R, 'P' + p, cells.length ? G.wildOfRoads(R, { cells, nation: R.provinces[p].nation }) : null);
  }
  function setOwner(R, D, p, k) {
    D.prov[p] = k; R.provinces[p].nation = k;
    for (const c of R._provCells[p]) R.owner[c] = k;
    for (const s of R._provSets[p]) s.nation = k;
    rewildProv(R, p);
    R._relabel = true;
    touch(R, D);
  }
  const sx = (D, s) => D.sx[s.id] || (D.sx[s.id] = {});
  const setField = (D, s, f, v) => { s[f] = v; sx(D, s)[f] = v; };
  function setDwindling(R, D, s, on) {
    setField(D, s, 'dwindling', on);
    G.wildSet(R, 'S' + s.id, G.wildOfSettlement(R, s));
    touch(R, D);
  }
  // Khu dân cư nhận dân khi một khu sụp: khu còn sống gần nhất cùng tỉnh, không có thì cùng nước, không có nữa thì bất kỳ.
  function receiverOf(R, s) {
    const live = R.settlements.filter(o => o !== s && o.tier !== 'ruin');
    const by = f => live.filter(f).sort((a, b) => Math.hypot(a.x - s.x, a.y - s.y) - Math.hypot(b.x - s.x, b.y - s.y))[0];
    return (s.province >= 0 && by(o => o.province === s.province)) || (s.nation >= 0 && by(o => o.nation === s.nation)) || by(() => true) || null;
  }
  function ruin(R, D, s, year, why, X, S) {
    const to = receiverOf(R, s), was = s.tier;
    if (to) { setField(D, to, 'urban', to.urban + s.urban); setField(D, to, 'rural', to.rural + s.rural); }
    setField(D, s, 'tier', 'ruin'); setField(D, s, 'was', was); setField(D, s, 'urban', 0); setField(D, s, 'rural', 0);
    setField(D, s, 'dwindling', false); setField(D, s, 'ruined', year); setField(D, s, 'revived', null);
    delete D.hp[s.id];
    G.wildSet(R, 'S' + s.id, null);
    R.harbors = R.harbors.filter(h => h !== s);
    G.indexRealm(R); provPop(R);
    D.n.ruins++;
    hist(D, year, 'ruin', `${s.name} (${G.TIER_VI[was].toLowerCase()}${s.nation >= 0 ? ', ' + R.nations[s.nation].name : ''}) bị bỏ hoang vì ${why}, thành phế tích.` + (to ? ` Dân dạt về ${to.name}.` : ''));
    // Nhà nhân vật ở đó: dọn theo dân về khu nhận.
    if (S && S.home && S.home.settlement === s.id && !S.dead) {
      if (to) { S.home = { region: to.region, settlement: to.id }; S.loc = to.region; S.pos = G.homePos(to, S.urban, X.rnd); S.path2.push(S.pos); }
      else S.home.settlement = null;
      X.log(`${s.name} không còn ai ở. ${to ? `Nhà bạn dọn về ${to.name}.` : 'Bạn thành kẻ không nhà.'}`, 'bad');
    }
    // Kinh đô sụp: dời đô.
    const k = s.nation;
    if (k >= 0 && D.nat[k].cap === s.id) moveCapital(R, D, k, year, `kinh đô ${s.name} sụp`);
    touch(R, D);
  }
  function moveCapital(R, D, k, year, why) {
    const own = R.settlements.filter(o => o.nation === k && o.tier !== 'ruin').sort((a, b) => G.popOf(b) - G.popOf(a));
    if (!own.length) return;
    const n = R.nations[k], c = own[0];
    D.nat[k].cap = c.id; n.capital = c.id; n.capitalCell = c.cell;
    D.nat[k].stab = Math.max(0, D.nat[k].stab - .3);
    D.n.moved++;
    hist(D, year, 'capital', `${n.name} dời đô về ${c.name} (${why}).`);
  }
  // Khu mới: hồi sinh một phế tích hoặc lập làng mới ven sông trong một tỉnh của nước k.
  function found(R, D, k, year, X) {
    const M = G.map, W = M.W, CS = M.CS, n = R.nations[k], provs = provsOf(D, k);
    if (!provs.length) return null;
    const ruins = R.settlements.filter(s => s.tier === 'ruin' && s.province >= 0 && D.prov[s.province] === k && (s.ruined == null || year - s.ruined >= 15));
    let s = null;
    if (ruins.length && X.chance(.5)) {
      s = X.pick(ruins);
      const seat = R.byId[R.provinces[s.province].seat], src = seat && seat.tier !== 'ruin' ? seat : liveIn(R, s.province)[0];
      const race = s.race || (src ? src.race : n.race);
      if (s.was == null) setField(D, s, 'name', settlementName(R, race, 'village', X));   // phế tích cổ có tên mới khi có người về ở
      setField(D, s, 'tier', s.was === 'hamlet' ? 'hamlet' : 'village'); setField(D, s, 'race', race);
      setField(D, s, 'races', src ? { ...src.races } : { [race]: 100 }); setField(D, s, 'faiths', src ? { ...src.faiths } : {});
      setField(D, s, 'urban', X.int(60, 160)); setField(D, s, 'rural', X.int(80, 220)); setField(D, s, 'revived', year); setField(D, s, 'dwindling', true);
      if (!s.bld) setField(D, s, 'bld', []); if (!s.buildings) setField(D, s, 'buildings', []);
      s.nation = k;
      R.harbors = R.base.harbors.filter(h => h.tier !== 'ruin');
      D.n.revived++;
      hist(D, year, 'found', `Dân ${n.name} trở về dựng lại ${s.name}.`);
    } else {
      // Ô hợp lệ: thuộc tỉnh của nước, ven sông (hoặc sát sông), đồng / đồi / rừng, tầng ven hoặc sâu, cách mọi khu ≥ 35px.
      const okFeat = new Set(['open', 'hills', 'forest']);
      const cands = [];
      for (const p of provs) for (const c of R._provCells[p]) {
        if (!M.river[c] || !okFeat.has(G.FEATURES[M.feat[c]].id) || R.band[c] > 1) continue;
        const x = (c % W + .5) * CS, y = (Math.floor(c / W) + .5) * CS;
        if (!R.settlements.some(o => Math.hypot(o.x - x, o.y - y) < (o.tier === 'ruin' ? 30 : 35))) cands.push(c);
      }
      if (!cands.length) return null;
      const cell = X.pick(cands);
      const p = R.provOf[cell], seat = R.byId[R.provinces[p].seat], src = seat && seat.tier !== 'ruin' ? seat : liveIn(R, p)[0];
      const race = src ? src.race : n.race;
      s = { id: 'x' + (D.nsid++), name: settlementName(R, race, 'village', X), tier: 'village', roles: ['farm'], cell, x: (cell % W + .5) * CS, y: (Math.floor(cell / W) + .5) * CS,
        region: G.REGIONS[M.region[cell]].id, nation: k, race, urban: X.int(60, 160), rural: X.int(80, 220), races: src ? { ...src.races } : { [race]: 100 },
        faiths: src ? { ...src.faiths } : {}, buildings: [], bld: [], province: p, founded: year, dwindling: true };
      D.newSets.push(s); R.settlements.push(s); R.byId[s.id] = s; R._provSets[p].push(s);
      D.n.founded++;
      hist(D, year, 'found', `Làng mới ${s.name} mọc lên ven sông ở tỉnh ${pname(R, p)} (${n.name}).`);
    }
    D.hp[s.id] = .4;
    G.wildSet(R, 'S' + s.id, G.wildOfSettlement(R, s));
    G.indexRealm(R); provPop(R);
    touch(R, D);
    return s;
  }
  // Dựng lại mọi nhóm nguồn đường (đường xuống cấp, nước mất: ô đường ngoài tỉnh về nhóm vô chủ). Vết loang có cache.
  function regroupRoads(R) {
    const groups = G.roadGroups(R);
    for (const k of [...R._src.keys()]) if ((k[0] === 'P' || k[0] === 'O') && !groups.has(k)) G.wildSet(R, k, null);
    for (const [k, g] of groups) G.wildSet(R, k, G.wildOfRoads(R, g));
  }
  // Đường xuống cấp: đoạn đường làm ra để nối một khu đã bỏ hoang trên 20 năm thì mỗi 20 năm tụt một bậc (cái → mòn → lối nhỏ → mất).
  function roadDecay(R, D, year) {
    let changed = false;
    R.roads.forEach((r, k) => {
      const s = r.to && R.byId[r.to]; if (!s) return;
      const base = R.base.roads[k], want = s.tier === 'ruin' && s.ruined != null ? Math.max(0, base - Math.floor((year - s.ruined) / 20)) : base;
      if (want !== r.cls) { r.cls = want; if (want === base) delete D.rd[k]; else D.rd[k] = want; changed = true; if (want < base) D.n.roads++; }
    });
    if (!changed) return;
    rebuildRoad(R);
    regroupRoads(R);
    touch(R, D);
  }

  // ═════════ Tên, người cai trị, nước mới ═════════
  function settlementName(R, race, tier, X) {
    const N = G.NAMES, K = N.settlement.kind[race] || N.settlement.kind.human, words = K[tier] || K.village;
    const used = new Set(R.settlements.map(s => s.name));
    for (let t = 0; t < 40; t++) {
      const kind = X.pick(words), roots = N.settlement.root[race] || N.settlement.root.human, P = N.settlement.part[race];
      const root = X.chance(.6) || !P ? X.pick(roots) : X.pick(P.a) + ' ' + X.pick(P.b);
      if (kind.split(' ').some(w => root.split(' ').includes(w))) continue;
      const nm = kind + ' ' + root; if (!used.has(nm)) return nm;
    }
    return X.pick(words) + ' ' + X.pick(N.settlement.root[race] || N.settlement.root.human) + ' Tân';
  }
  function nationName(R, race, gov, X) {
    const N = G.NAMES.nation, pr = ((N.prefixRace[race] || {})[gov]) || N.prefix[gov] || ['Xứ'], used = new Set(R.nations.map(n => n.name));
    for (let t = 0; t < 40; t++) { const nm = X.pick(pr) + ' ' + X.pick(N.root[race] || N.root.human); if (!used.has(nm)) return nm; }
    return X.pick(pr) + ' ' + X.pick(N.root[race] || N.root.human) + ' Tân';
  }
  function makeRuler(n, X) {
    if (!G.GOVS[n.gov].ruled) return null;
    const R0 = G.RACES[n.race], sex = X.pick(R0.sexes), titles = G.NAMES.nation.ruler[n.gov] || ['Thủ Lĩnh'];
    return { title: titles.length > 1 && sex === 'f' ? titles[1] : titles[0], name: G.personName(n.race, sex, X.rnd), sex, age: X.int(Math.round(R0.adult) + 2, Math.round(R0.adult + R0.le * .3)) };
  }
  // Nước mới từ một tỉnh nổi loạn: mẫu theo chủng tộc đa số của tỉnh (ưu tiên mẫu nước nhỏ), quốc giáo theo đạo đa số của tỉnh nếu mẫu có.
  function newNation(R, D, p, from, year, X) {
    const seat = R.byId[R.provinces[p].seat], src = seat && seat.tier !== 'ruin' ? seat : liveIn(R, p)[0];
    const race = (src && top(src.races)) || R.nations[from].race;
    const pool = G.NATION_TEMPLATES.filter(t => t.race === race);
    const t = X.wpick(pool, t => (t.size === 'S' ? 3 : t.size === 'M' ? 1.5 : .5) * (t.gov === 'empire' ? .2 : 1));
    if (!t) return null;
    const k = R.nations.length, noise = () => .9 + X.rnd() * .2, [tax, army, patrol, , ambition] = t.stats;
    const lf = src && top(src.faiths), faith = lf && t.faith[lf] ? lf : X.wkey(t.faith);
    const used = new Set(R.nations.filter(n => n.alive !== false).map(n => n.color));
    const n = {
      id: 'n' + k, idx: k, template: t.id, race: t.race, label: t.label, gov: t.gov, size: 'S', faith: faith === 'none' ? null : faith,
      tax: +(tax * noise()).toFixed(3), army: +(army * noise()).toFixed(2), patrol: Math.round(patrol * noise() * 20) / 20, stability: .5,   // tuần tra làm tròn .05: ít tổ hợp vết loang (realm.js)
      ambition: +G.clamp(ambition * noise() + .2, 0, 1).toFixed(2),
      laws: [...t.laws, ...(t.lawPool.length && X.chance(.5) ? [X.pick(t.lawPool)] : [])],
      fav: t.tolerant ? Object.keys(G.RACES).filter(r => r !== 'skeleton') : t.fav.slice(),
      wary: t.xeno ? Object.keys(G.RACES).filter(r => r !== t.race) : t.wary.slice(),
      tolerant: !!t.tolerant, trait: t.trait, quirks: [{ id: 'new_realm' }], color: COLORS.find(c => !used.has(c)) || COLORS[k % COLORS.length],
      capitalCell: src ? src.cell : R.byId[R.provinces[p].seat].cell, capital: src ? src.id : R.provinces[p].seat, area: 0, cells: [], name: '', ruler: null,
      relations: {}, overlord: null, labelPos: null, founded: year, from, alive: true
    };
    n.name = nationName(R, n.race, n.gov, X);
    for (const o of R.nations) {
      let r = 0;
      if (o.faith && n.faith && o.faith === n.faith) r += 1;
      if ((o.faith === 'light' && n.faith === 'dark') || (o.faith === 'dark' && n.faith === 'light')) r -= 2;
      if (o.wary.includes(n.race)) r -= 1; if (n.wary.includes(o.race)) r -= 1;
      if (o.idx === from) r = -3;
      n.relations[o.idx] = r; o.relations[k] = r;
    }
    D.newNat.push(n); R.nations.push(n);
    D.nat.push({ alive: true, stab: .5, cap: n.capital, ruler: makeRuler(n, X), peace: 0 });
    n.ruler = D.nat[k].ruler;
    D.n.newNat++;
    return n;
  }
  function killNation(R, D, k, year, by) {
    D.nat[k].alive = false; R.nations[k].alive = false;
    for (const c of R._natExtra[k] || []) R.owner[c] = NONE;
    if (R._natExtra[k] && R._natExtra[k].length) regroupRoads(R);
    D.wars = D.wars.filter(w => w.a !== k && w.b !== k);
    D.n.fell++;
    hist(D, year, 'fall', `${R.nations[k].name} diệt vong${by ? `, đất về tay ${by}` : ''}.`);
    touch(R, D);
  }
  function hist(D, year, kind, text) {
    D.hist.push({ y: year, k: kind, t: text });
    if (D.hist.length > HIST_MAX) D.hist.splice(0, D.hist.length - HIST_MAX);
  }
  G.histAdd = (W, kind, text) => hist(W.dyn, W.year, kind, text);

  // ═════════ Mật độ quái theo tỉnh × tầng (research/03 mục 3.5) ═════════
  // Sinh sôi logistic; NPC tỉa theo tuần tra của nước chủ tỉnh (vô chủ .6, đất hoang ngoài tỉnh .35; không ai vào vùng chết);
  // tầng sâu quá đông thì tràn ra tầng ngoài; tầng ven của tỉnh quá 1,25 thì thú triều (raid) đánh khu dân cư của tỉnh.
  G.monsterYear = function (W, X, S) {
    const R = G.realm, D = W.dyn, zp = W.zonePop, CULL = [1.4, 1, 1, 0];
    const lp = S ? G.provOfS(S) : NONE;
    const areas = R._areas || (R._areas = [
      ...R.provinces.map((p, q) => ({ key: 'p' + q, prov: q, danger: G.REGION[R.byId[p.seat].region].danger })),
      ...G.REGIONS.map((r, k) => ({ key: 'r' + k, prov: NONE, danger: r.danger }))
    ]);
    for (const a of areas) {
      const own = a.prov >= 0 ? D.prov[a.prov] : NONE, patrol = a.prov < 0 ? .35 : own >= 0 ? R.nations[own].patrol : .6;
      for (let b = 0; b < 4; b++) {
        const key = a.key + ':' + b;
        let p = zp[key] ?? 1;
        p += .1 * (1 - p / 1.5) * (1 + a.danger * .6) - .045 * patrol * CULL[b] + (X.rnd() - .5) * .08;
        if (X.chance(.025)) { p += .35; if (S && a.prov === lp && b <= 1) X.log(`Mùa sinh sản ở ${G.REGION[S.loc].zones[b].nameVi}: quái đông bất thường.`, 'info'); }
        zp[key] = G.clamp(p, .3, 2.2);
      }
      for (let b = 3; b > 0; b--) if (zp[a.key + ':' + b] > 1.6) zp[a.key + ':' + (b - 1)] = Math.min(2.2, zp[a.key + ':' + (b - 1)] + .1);
      if (a.prov >= 0) D.raid[a.prov] = +(Math.max(0, zp[a.key + ':0'] - 1.25) * 1.5).toFixed(3);
    }
    // Biển: chỉ thuyền chài và tàu tuần tỉa tầng ven bờ, khơi; không có thú triều.
    for (const r of G.SEAS) r.zones.forEach((z, i) => {
      let p = zp[z.id] ?? 1;
      p += .1 * (1 - p / 1.5) - .04 * [1.2, .8, 0, 0][i] + (X.rnd() - .5) * .08;
      zp[z.id] = G.clamp(p, .3, 2.2);
    });
  };

  // ═════════ Một năm chính trị (research/03 mục 5.3) ═════════
  G.polityYear = function (W, X, S, year) {
    const R = G.bindWorld(W), D = W.dyn, NN = R.nations, P = R.provinces;
    const alive = NN.filter(n => D.nat[n.idx].alive), nAlive = alive.length;
    // Tiền tuyến: tỉnh của bên này kề tỉnh của bên kia (đất hoặc hải trình).
    const front = (a, b) => provsOf(D, b).filter(p => neighbors(R, p).some(q => D.prov[q] === a));
    for (let p = 0; p < P.length; p++) D.war[p] = 0;
    for (const w of D.wars) {
      for (const p of [...provsOf(D, w.a), ...provsOf(D, w.b)]) D.war[p] = Math.max(D.war[p], .4);
      for (const p of [...front(w.a, w.b), ...front(w.b, w.a)]) D.war[p] = 1;
    }
    // Sức mạnh: Σ tỉnh dân × (.5 + giàu) × quân × (.5 + ổn định).
    const wealth = p => { const s = R.byId[P[p].seat]; return (G.REGION[s.region].wealth + (s.ship >= 1 && s.tier !== 'ruin' ? .1 : 0)) * (1 - .5 * D.war[p]); };
    const power = k => { let t = 0; for (const p of provsOf(D, k)) t += P[p].pop * (.5 + wealth(p)); return Math.max(1, t) * NN[k].army * (.5 + D.nat[k].stab); };
    const wars = k => D.wars.filter(w => w.a === k || w.b === k).length;
    const plagued = k => provsOf(D, k).some(p => (W.regions[R.byId[P[p].seat].region] || {}).plague > 0);
    const mine = k => S && S.nation === k;
    const news = (k, txt, kind = 'info') => { if (S && !S.dead && (k == null || k === true || mine(k))) X.log(txt, kind); };

    // ── Khu dân cư: thú triều, chiến tranh, dịch làm mất sức sống; yên thì hồi. Sa sút < .5 (hồi lại > .8), sụp < .15.
    for (const s of R.settlements.slice()) {
      if (s.tier === 'ruin') continue;
      const p = s.province, reg = W.regions[s.region] || {}, raid = p >= 0 ? D.raid[p] : 0, war = p >= 0 ? D.war[p] : 0;
      const K = G.DYN, hitR = raid > 0 && X.chance(Math.min(.6, raid * K.raidHit)), hitW = war >= 1 && X.chance(K.warHit);
      const loss = (hitR ? K.raidLoss : 0) + (hitW ? K.warLoss : 0) + (reg.plague > .3 ? K.plagueLoss : 0);
      let hp = D.hp[s.id] ?? 1;
      hp = loss ? hp - loss * (K.frail[s.tier] || 1) * (.7 + X.rnd() * .6) : Math.min(1, hp + G.DYN.heal);
      D.hp[s.id] = +hp.toFixed(3);
      if (hp < .15) { ruin(R, D, s, year, hitR ? 'thú triều' : hitW ? 'chiến tranh' : 'dịch bệnh', X, S); continue; }
      if (!s.dwindling && hp < .5) { setDwindling(R, D, s, true); if (S && S.home.settlement === s.id) X.log(`${s.name} sa sút: nhà trống nhiều hơn nhà có khói bếp.`, 'bad'); }
      else if (s.dwindling && hp > .8) setDwindling(R, D, s, false);
    }

    // ── Ổn định: trôi về .6 (+ hòa bình, − thuế cao), trừ chiến tranh, dịch, khu sa sút.
    for (const n of alive) {
      const d = D.nat[n.idx], nw = wars(n.idx);
      d.peace = nw ? 0 : d.peace + 1;
      const dw = R.settlements.filter(s => s.nation === n.idx && s.dwindling).length;
      const target = .6 + Math.min(.1, .02 * d.peace) - .1 * (n.tax - .15) / .1 + (n.laws.includes('ancestor_tithe') ? .05 : 0);
      d.stab = G.clamp(d.stab + .15 * (target - d.stab) - .08 * nw - (plagued(n.idx) ? .05 : 0) - .04 * Math.min(3, dw) + X.gauss() * .015, 0, 1);
      // Người cai trị già đi; băng hà thì kế vị, ổn định giảm (tranh ngôi: giảm thêm).
      const ru = d.ruler;
      if (ru) {
        ru.age++;
        const le = G.RACES[n.race].le, x = (ru.age - le * .6) / (le * .4);
        if (X.chance(x > 0 ? Math.min(.6, .004 + .25 * x * x) : .004)) {
          const fight = X.chance(.2), nr = makeRuler(n, X);
          d.ruler = nr; n.ruler = nr; d.stab = Math.max(0, d.stab - (fight ? .18 : .06)); D.n.kings++;
          hist(D, year, 'king', `${ru.title} ${ru.name} của ${n.name} băng hà ở tuổi ${ru.age}.` + (fight ? ` Hai phe tranh ngôi; ${nr.name} thắng.` : ` ${nr.name} lên ngôi.`));
          news(n.idx, `${ru.title} ${ru.name} băng hà.` + (fight ? ` Triều đình chia hai phe; ${nr.name} giành được ngai.` : ` ${nr.name} lên ngôi.`), fight ? 'bad' : 'info');
        }
      }
    }

    // ── Diễn biến chiến tranh.
    for (const w of D.wars.slice()) {
      const a = w.a, b = w.b, Pa = power(a), Pb = power(b);
      let bonus = 0;
      if (S && S.flags && S.flags.soldier > 0 && (S.nation === a || S.nation === b)) { const t = G.tierOf(S.level); if (t >= 3) bonus = (S.nation === a ? 1 : -1) * .05 * (t - 2); }
      w.score += .35 * (Pa - Pb) / (Pa + Pb) + X.gauss() * .25 + bonus; w.years++;
      // Thắng thế thì chiếm một tỉnh tiền tuyến của bên kia (kinh đô chỉ khi hết tỉnh khác).
      const take = (by, from) => {
        const fr = front(by, from); if (!fr.length) return;
        const capP = R.byId[D.nat[from].cap] ? R.byId[D.nat[from].cap].province : NONE;
        const cand = fr.filter(p => p !== capP), p = X.pick(cand.length ? cand : fr);
        const back = w.occ.findIndex(o => o.p === p && o.by === from);
        if (back >= 0) w.occ.splice(back, 1); else w.occ.push({ p, by, from });
        setOwner(R, D, p, by); D.n.occ++;
        hist(D, year, 'occ', `${NN[by].name} chiếm tỉnh ${pname(R, p)} của ${NN[from].name}.`);
        if (S && G.provOfS(S) === p) X.log(`Quân ${NN[by].name} vào ${pname(R, p)}. Cờ trên cổng thành đổi màu.`, 'big');
        else if (mine(by) || mine(from)) X.log(`${NN[by].name} chiếm tỉnh ${pname(R, p)}.`, mine(by) ? 'good' : 'bad');
        if (p === capP) moveCapital(R, D, from, year, `mất ${pname(R, p)}`);
        w.score += by === a ? -.2 : .2;
        if (!provsOf(D, from).length) killNation(R, D, from, year, NN[by].name);
      };
      if (w.score > .3 && X.chance(.5)) take(a, b);
      else if (w.score < -.3 && X.chance(.5)) take(b, a);
      if (!D.nat[a].alive || !D.nat[b].alive) { D.wars = D.wars.filter(x => x !== w); endWar(R, D, w, year, X, S, true); continue; }
      if (Math.abs(w.score) >= 1 || w.years >= 6 || (D.nat[a].stab < .2 && D.nat[b].stab < .2)) { D.wars = D.wars.filter(x => x !== w); endWar(R, D, w, year, X, S); }
    }

    // ── Tuyên chiến: cặp nước kề nhau, không hưu chiến; mỗi nước tối đa 2 cuộc. Dưới 3 nước thì không.
    if (nAlive >= 3) {
      const pairs = new Set();
      for (let p = 0; p < P.length; p++) { const a = D.prov[p]; if (a < 0) continue; for (const q of neighbors(R, p)) { const b = D.prov[q]; if (b >= 0 && b !== a) pairs.add(a + ':' + b); } }
      for (const key of pairs) {
        const [a, b] = key.split(':').map(Number), na = NN[a], nb = NN[b];
        if (!D.nat[a].alive || !D.nat[b].alive || wars(a) >= 2 || wars(b) >= 2) continue;
        if (D.wars.some(w => (w.a === a && w.b === b) || (w.a === b && w.b === a))) continue;
        const tk = Math.min(a, b) + ':' + Math.max(a, b); if ((D.truce[tk] || 0) > year) continue;
        // Đòi lại đất: nước bị tỉnh nổi loạn tách ra (nb.from === a) muốn đánh lại nhiều hơn hẳn.
        const rel = na.relations[b] || 0, vas = na.overlord === b || nb.overlord === a ? .2 : 1, claim = nb.from === a ? G.DYN.claim : 1;
        const p = G.DYN.warP * na.ambition * G.clamp(power(a) / power(b), .5, 2) * (na.faith !== nb.faith ? 1.5 : 1) * (1 - .15 * rel) * vas * claim;
        if (!X.chance(p)) continue;
        D.wars.push({ a, b, score: 0, years: 0, start: year, occ: [] }); D.n.wars++;
        hist(D, year, 'war', `${na.name} tuyên chiến với ${nb.name}.`);
        if (mine(a) || mine(b)) X.log(`${na.name} tuyên chiến với ${nb.name}. Lính mộ đi khắp các làng.`, 'big');
        else if (S && X.chance(.4)) X.log(`Tin từ xa: ${na.name} tuyên chiến với ${nb.name}.`, 'info');
      }
    }

    // ── Nổi loạn: tỉnh của nước có ổn định < .4 (không phải tỉnh kinh đô). Trên 9 nước thì không.
    if (nAlive <= 9) for (let p = 0; p < P.length; p++) {
      const k = D.prov[p]; if (k < 0) continue;
      const d = D.nat[k], n = NN[k]; if (d.stab >= .4) continue;
      const capS = R.byId[d.cap]; if (capS && capS.province === p) continue;
      const live = liveIn(R, p); if (!live.length) continue;
      const seat = R.byId[P[p].seat], src = seat && seat.tier !== 'ruin' ? seat : live[0];
      const race = top(src.races), faith = top(src.faiths), alien = (race !== n.race && n.wary.includes(race)) || (faith && n.faith && faith !== n.faith);
      if (!X.chance(G.DYN.rebelP * (1 - d.stab) * (alien ? 2 : .5))) continue;
      if (X.chance(.5)) {
        d.stab = Math.max(0, d.stab - .03);
        hist(D, year, 'riot', `Tỉnh ${pname(R, p)} nổi loạn chống ${n.name}, bị dẹp.`);
        if (S && G.provOfS(S) === p) X.log(`${pname(R, p)} nổi loạn. Quân ${n.name} dẹp yên sau một mùa; nhà nào cũng có người bị bắt.`, 'bad');
        continue;
      }
      const joinTo = neighbors(R, p).map(q => D.prov[q]).filter(o => o >= 0 && o !== k && D.nat[o].alive && NN[o].faith && NN[o].faith === faith);
      let txt;
      if ((joinTo.length && X.chance(.3)) || (joinTo.length && nAlive >= 9)) {
        const o = X.pick(joinTo); setOwner(R, D, p, o); D.n.join++;
        txt = `Tỉnh ${pname(R, p)} nổi loạn, rời ${n.name} theo ${NN[o].name} cùng đạo.`;
      } else if (nAlive < 9) {
        const nn = newNation(R, D, p, k, year, X); if (!nn) continue;
        setOwner(R, D, p, nn.idx);
        txt = `Tỉnh ${pname(R, p)} nổi loạn, tách khỏi ${n.name} lập ${nn.name} (${G.GOVS[nn.gov].nameVi.toLowerCase()}, ${window.JobLibrary.races[nn.race].nameVi}).`;
      } else continue;
      D.n.rebel++;
      hist(D, year, 'rebel', txt);
      if (S && G.provOfS(S) === p) X.log(txt, 'big'); else news(k, txt, 'bad');
      if (!provsOf(D, k).length) killNation(R, D, k, year, null);
    }

    // ── Sáp nhập hòa bình: tỉnh vô chủ kề một nước ổn định > .6, 2% / năm.
    for (let p = 0; p < P.length; p++) {
      if (D.prov[p] !== NONE || !liveIn(R, p).length) continue;
      const cand = [...R.provAdj[p]].map(q => D.prov[q]).filter(o => o >= 0 && D.nat[o].alive && D.nat[o].stab > .6);
      if (!cand.length || !X.chance(G.DYN.annexP)) continue;
      const o = X.pick(cand); setOwner(R, D, p, o); D.n.annex++;
      hist(D, year, 'annex', `${pname(R, p)} xin nhập vào ${NN[o].name}.`);
      if (S && G.provOfS(S) === p) X.log(`Các bô lão ${pname(R, p)} xin nhập vào ${NN[o].name}. Từ nay có lính tuần, có thuế.`, 'big');
    }

    // ── Khu mới: hồi sinh phế tích hoặc làng mới ven sông, ở nước đang yên.
    if (X.chance(G.DYN.foundP)) {
      const calm = alive.filter(n => D.nat[n.idx].alive && D.nat[n.idx].stab > .45 && !wars(n.idx));
      const n = X.wpick(calm, n => provsOf(D, n.idx).length);
      if (n) { const s = found(R, D, n.idx, year, X); if (s && S && G.provOfS(S) === s.province) X.log(`Có người dựng nhà ở ${s.name}, cách đây không xa.`, 'info'); }
    }
    roadDecay(R, D, year);
    if (R._dirty.length) G.wildCommit(R);
    // Nước đổi tên nhãn: tâm lãnh thổ mới.
    for (const n of NN) n.stability = +D.nat[n.idx].stab.toFixed(3);
  };
  function endWar(R, D, w, year, X, S, gone) {
    const NN = R.nations, win = w.score > .3 ? w.a : w.score < -.3 ? w.b : null;
    let kept = [];
    for (const o of w.occ) {
      if (D.prov[o.p] !== o.by) continue;
      if (o.by === win && kept.length < 2) kept.push(o.p);
      else if (D.nat[o.from].alive) setOwner(R, D, o.p, o.from);
    }
    D.n.kept += kept.length;
    D.truce[Math.min(w.a, w.b) + ':' + Math.max(w.a, w.b)] = year + 15;
    R._relabel = true;
    if (gone) return;
    const txt = win == null ? `Chiến tranh ${NN[w.a].name} – ${NN[w.b].name} kết thúc sau ${w.years} năm, không bên nào được gì.`
      : `${NN[win].name} thắng ${NN[win === w.a ? w.b : w.a].name} sau ${w.years} năm` + (kept.length ? `, giữ ${kept.map(p => 'tỉnh ' + pname(R, p)).join(' và ')}.` : '.');
    hist(D, year, 'peace', txt + ' Hưu chiến 15 năm.');
    if (S && (S.nation === w.a || S.nation === w.b)) X.log(txt, win === S.nation ? 'good' : 'info');
  }

  // ═════════ Hệ con "nations" (sau "world") ═════════
  G.nationsYear = function (S, X) {
    const W = S.world, R = G.bindWorld(W), ypt = G.RACES[S.race].ypt;
    for (let t = 0; t < ypt; t++) { G.polityYear(W, X, S, W.year + t); if (S.dead) return; }
    // Nước của nhân vật theo khu dân cư nhà mình (hoặc ô đang đứng); quê đổi chủ thì báo.
    const s = S.home && S.home.settlement ? R.byId[S.home.settlement] : null;
    const k = s && s.tier !== 'ruin' ? s.nation : (G.nationAtPos(S.pos[0], S.pos[1]) || { idx: NONE }).idx;
    const now = k >= 0 ? k : null;
    if (now !== S.nation) {
      const p = G.provOfS(S), name = p >= 0 ? 'tỉnh ' + R.provinces[p].name : 'nơi bạn ở';
      if (now != null) X.log(S.undead ? `Năm ${W.year}, ${name} về tay ${R.nations[now].name}. Quê cũ của bộ xương này giờ treo cờ khác.` : `Năm ${W.year}, ${name} về tay ${R.nations[now].name}. Từ nay bạn là dân ${R.nations[now].name}.`, 'big');
      else X.log(`Năm ${W.year}, ${name} không còn thuộc nước nào.`, 'big');
      S.nation = now; S.flags.homeFlip = (S.flags.homeFlip || 0) + 1;
    }
  };
  { const k = G.SYSTEMS.findIndex(s => s.id === 'world'); G.SYSTEMS.splice(k + 1, 0, { id: 'nations', run: (S, X) => G.nationsYear(S, X) }); }

  // ═════════ Chạy thế giới không có đời người (sim.html: số đo 300 năm) ═════════
  G.runWorld = function (seed, years, W) {
    const X = { ...G.tools(G.makeRng('world-run:' + seed)), log() {} };
    W = W || G.makeWorld(X);
    G.bindWorld(W);
    for (let y = 0; y < years; y++) {
      // Dịch theo vùng như hệ "world" (không có nhân vật).
      for (const r of G.REGIONS) {
        const rs = W.regions[r.id];
        if (rs.plague > 0) rs.plague = Math.max(0, rs.plague - .3 - X.rnd() * .25);
        else if (X.chance(.01 + (r.biome === 'venom_marsh' ? .02 : 0) + (1 - r.wealth) * .01)) {
          rs.plague = .6 + X.rnd() * .4;
          for (const n of G.map.adj[G.map.idx[r.id]]) if (X.chance(.25)) W.regions[n].plague = Math.max(W.regions[n].plague, .4);
        }
      }
      G.monsterYear(W, X, null);
      G.polityYear(W, X, null, W.year);
      W.year++;
    }
    return W;
  };
})(window.LifeSim);
