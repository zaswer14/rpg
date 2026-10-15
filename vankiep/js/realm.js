/* Vạn Kiếp — TẠO THẾ GIỚI: quốc gia, lãnh thổ, mạng khu dân cư, tỉnh, dân, tên.
 * Thiết kế: docs/04_Mau_quoc_gia.md (mục 6), docs/05_Thanh_pho_lang_mac.md (mục 2–10).
 * Chạy sau bản đồ (map.js); cùng seed thế giới thì ra cùng kết quả, nên save chỉ lưu seed.
 *
 *   1. Chấm điểm phù hợp từng ô (sông, biển, hồ, địa hình, biome, độ nguy hiểm) + ưa thích theo chủng tộc.
 *   2. Bốc 5–7 mẫu quốc gia (ràng buộc chủng tộc), đặt kinh đô cách nhau ≥ 220px.
 *   3. Lan lãnh thổ từ kinh đô theo chi phí đi tới khi đủ diện tích theo cỡ nước; phần còn lại vô chủ.
 *   4. Trong mỗi nước đặt thành phố → thị trấn → làng → thôn (khoảng cách tối thiểu theo bậc); đất vô chủ: làng, thôn, đồn, phế tích.
 *   5. Vai trò (cảng, đồn, mỏ, trại gỗ, làng chài, làng ruộng, đền, chợ biên), tên, công trình.
 *   6. Tỉnh = thủ phủ (kinh đô / thành phố / thị trấn; làng ở đất vô chủ) + vùng quanh nó theo chi phí đi.
 *   7. Dân đô thị theo bậc; dân nông thôn theo sức chứa ô, gom về làng / thôn gần nhất, co giãn để khớp tỉ lệ đô thị của chủng tộc.
 *   8. Chủng tộc, đạo của từng khu; người cai trị, đặc trưng riêng, quan hệ giữa các nước.
 *   9. Đường: đường cái nối kinh đô / thành phố / thị trấn (cây khung nhỏ nhất), đường mòn cho làng, lối nhỏ cho thôn; cầu, đèo.
 *  10. Độ hoang từng ô (khoảng cách đi bộ tới khu dân cư hoặc đường + biome + địa hình) → tầng ven / sâu / lõi / vùng chết (docs/03 mục 3.3).
 *  11. Biển: khối đất (đại lục, đảo), bến và loại tàu, độ hoang biển → tầng ven bờ / khơi / sâu / vực biển, tên vùng biển (docs/03 mục 7).
 */
window.LifeSim = window.LifeSim || {};
(function (G) {
  const SEA = 255, NONE = -1;
  const TIERS = ['capital', 'city', 'town', 'village', 'hamlet'];
  const RANK = { capital: 0, city: 1, town: 2, village: 3, hamlet: 4, ruin: 5 };
  G.TIER_RANK = RANK;
  G.TIER_VI = { capital: 'Kinh đô', city: 'Thành phố', town: 'Thị trấn', village: 'Làng', hamlet: 'Thôn', ruin: 'Phế tích' };
  G.ROLE_VI = { port: 'cảng', fort: 'đồn', mine: 'mỏ', lumber: 'trại gỗ', fishing: 'làng chài', farm: 'làng ruộng', temple: 'đền', market: 'chợ biên' };
  const SPACING = { capital: 220, city: 120, town: 70, village: 35, hamlet: 18, ruin: 30 };
  const COUNTS = {
    S: { city: [0, 1], town: [1, 2], village: [4, 6], hamlet: [4, 8] },
    M: { city: [1, 2], town: [2, 3], village: [7, 10], hamlet: [8, 12] },
    L: { city: [2, 3], town: [3, 5], village: [11, 16], hamlet: [12, 18] }
  };
  const AREA = { S: 1, M: 1.7, L: 2.4 };               // tỉ trọng diện tích theo cỡ nước
  const HAB = { golden_plains: 1.3, wind_steppe: 1, moss_forest: 1, elder_wood: 1, fae_glade: 1, mist_coast: 1, serpent_bay: 1, grave_hills: .8, crystal_cave: .8,
    venom_marsh: .6, forge_ruins: .6, frost_tundra: .45, ash_peak: .5, storm_spire: .4, red_desert: .35, abyss_rift: .15 };
  const ORE = ['crystal_cave', 'ash_peak', 'forge_ruins', 'frost_tundra', 'storm_spire'];
  const CAP = { open: 100, hills: 50, forest: 30, jungle: 15, marsh: 15, mountain: 5, lake: 0 };   // sức chứa dân nông thôn / ô
  const RACE_W = { human: 1.4, orc: 1, dwarf: 1, elf: 1, beastfolk: 1, merfolk: .8, dragonkin: .7, fae: .6, construct: .5, skeleton: .35 };
  const COLORS = ['#d4a72c', '#3f86c9', '#c2493d', '#4fa35c', '#9460c0', '#d27a34', '#35aaa5', '#b04478', '#8b9a3a', '#6070c8'];
  const ROLE_NAME = ['port', 'fort', 'mine', 'temple', 'market', 'fishing', 'lumber'];   // thứ tự ưu tiên khi lấy chữ vai trò đặt tên

  // ── Tên người (dùng cả cho nhân vật trong life.js) ──
  G.personName = function (race, sex, rnd) {
    const P = G.NAMES.person[race] || G.NAMES.person.human, p = a => a[Math.floor(rnd() * a.length)];
    if (race === 'construct') return `${p(P.code)}-${10 + Math.floor(rnd() * 90)} «${p(P.family)}»`;
    if (race === 'skeleton') return `${p(P.n)} ${p(P.family)}`;
    return `${p(sex === 'f' ? P.f : P.m)} ${p(P.family)}`;
  };

  // ── Bộ đặt tên của một thế giới: không trùng tên trong cùng thế giới ──
  function namer(rnd) {
    const N = G.NAMES, used = new Set(), pools = {}, pick = a => a[Math.floor(rnd() * a.length)];
    const shuffled = a => { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
    const take = (key, src) => { const q = pools[key] || (pools[key] = shuffled(src)); return q.length ? q.pop() : null; };
    const uniq = gen => {
      for (let k = 0; k < 60; k++) { const s = gen(); if (s && !used.has(s)) { used.add(s); return s; } }
      let s = gen() || 'Vô Danh';
      for (const x of ['Tân', 'Thượng', 'Hạ', 'Đông', 'Tây', 'Nam', 'Bắc']) if (!used.has(s + ' ' + x)) { s += ' ' + x; break; }
      used.add(s); return s;
    };
    // Tiền tố và gốc không được lặp chữ ("Lò Lò Đồng").
    const clash = (kind, root) => { const b = root.split(' '); return kind.split(' ').some(w => b.includes(w)); };
    return {
      nation(race, gov) {
        const pr = ((N.nation.prefixRace[race] || {})[gov]) || N.nation.prefix[gov] || ['Xứ'];
        return uniq(() => pick(pr) + ' ' + (take('nation:' + race, N.nation.root[race]) || pick(N.nation.root[race])));
      },
      settlement(race, tier, role) {
        const K = N.settlement.kind[race] || N.settlement.kind.human, words = (role && K[role]) || K[tier] || K.village;
        return uniq(() => {
          const kind = pick(words), key = 'set:' + race;
          for (let k = 0; k < 8; k++) {
            let root = take(key, N.settlement.root[race]);
            if (!root) { const P = N.settlement.part[race]; root = pick(P.a) + ' ' + pick(P.b); }
            if (!clash(kind, root)) return kind + ' ' + root;
            pools[key].unshift(root);   // trả gốc về để khu khác dùng
          }
          return null;
        });
      },
      ruin() { return uniq(() => pick(N.ruin.prefix) + ' ' + pick(N.ruin.root)); },
      // Vùng biển: tiền tố và gốc gợi ý theo kiểu (G.SEAS), hết gốc gợi ý thì bốc gốc bất kỳ trong names.geo.sea.
      sea(type) {
        const S = N.geo.sea, pre = S.prefix.includes(type.prefix) ? type.prefix : S.prefix[0];
        const roots = (type.roots || []).filter(r => S.root.includes(r));
        return uniq(() => pre + ' ' + (take('sea:' + type.id, roots) || take('sea', S.root) || pick(S.root)));
      }
    };
  }

  G.buildRealm = function (map, seed) {
    const rnd = G.makeRng('realm:' + seed), X = G.tools(rnd), nm = namer(rnd);
    const { W, H, CS, region, feat, river, elev, dCoast } = map, N = W * H, R = G.REGIONS;
    const FE = Object.fromEntries(G.FEATURES.map((f, i) => [f.id, i]));
    const land = []; for (let i = 0; i < N; i++) if (region[i] !== SEA) land.push(i);
    const px = i => (i % W + .5) * CS, py = i => (Math.floor(i / W) + .5) * CS;
    const dist = (a, b) => Math.hypot(px(a) - px(b), py(a) - py(b));
    const regOf = i => R[region[i]], biomeOf = i => R[region[i]].biome;
    const nbrs = i => { const x = i % W, y = (i - x) / W, out = []; if (x > 0) out.push(i - 1); if (x < W - 1) out.push(i + 1); if (y > 0) out.push(i - W); if (y < H - 1) out.push(i + W); return out; };
    const coastal = i => dCoast[i] === 0;
    const errors = [], warnings = [];

    // Chi phí đi bộ mỗi ô (dùng cho lãnh thổ, tỉnh, vùng quê).
    const cost = new Float32Array(N).fill(Infinity);
    for (const i of land) { const c = G.FEATURES[feat[i]].cost; cost[i] = isFinite(c) ? c + (river[i] ? 1.5 : 0) : Infinity; }
    // Khoảng cách (ô) tới một loại địa hình, BFS có trần.
    const distTo = (pred, cap) => {
      const d = new Uint8Array(N).fill(255), q = [];
      for (const i of land) if (pred(i)) { d[i] = 0; q.push(i); }
      for (let h = 0; h < q.length; h++) { const i = q[h]; if (d[i] >= cap) continue; for (const j of nbrs(i)) if (region[j] !== SEA && d[j] > d[i] + 1) { d[j] = d[i] + 1; q.push(j); } }
      return d;
    };
    const dMtn = distTo(i => feat[i] === FE.mountain, 8), dForest = distTo(i => feat[i] === FE.forest || feat[i] === FE.jungle, 4);
    const dHill = distTo(i => feat[i] === FE.hills || feat[i] === FE.mountain, 4), dLake = distTo(i => feat[i] === FE.lake, 3), dRiver = distTo(i => river[i], 3);

    // ── 1. Điểm phù hợp ──
    const s0 = new Float32Array(N);
    for (const i of land) {
      const f = feat[i];
      if (f === FE.lake) { s0[i] = -1; continue; }
      if (f === FE.mountain) { s0[i] = 0; continue; }   // chỉ chủng tộc ở núi (Người Lùn) đặt được, qua raceScore
      const b = 2 + (river[i] ? 3 : dRiver[i] <= 1 ? 1.5 : 0) + (coastal(i) ? 2 : 0) + (dLake[i] === 1 ? 1 : 0)
        + (f === FE.open || f === FE.hills ? 1 : 0) - (f === FE.marsh ? 3 : 0) - (f === FE.jungle ? 2 : 0);
      s0[i] = Math.max(0, b) * HAB[biomeOf(i)] * (1 - regOf(i).danger * .4) * (.85 + rnd() * .3);
    }
    const raceScore = (i, rs, tpl) => {
      const f = feat[i];
      if (s0[i] < 0 || (f === FE.mountain && !rs.mountain) || (rs.coastOnly && !coastal(i))) return -1;
      const s = f === FE.mountain ? 2 * HAB[biomeOf(i)] : s0[i], bio = biomeOf(i), fid = G.FEATURES[f].id;
      let m = 1;
      if (tpl && tpl.biomes.includes(bio)) m += 1.2; else if (rs.biomes.includes(bio)) m += .5;
      if ((tpl && tpl.feats.includes(fid)) || rs.feats.includes(fid)) m += .6;
      if (rs.mountain && dMtn[i] <= 3) m += .8;
      if (rs.high && elev[i] > .7) m += .8;
      if (rs.coast && coastal(i)) m += .3 * rs.coast;
      if (rs.river && river[i]) m += .3;
      return s * m;
    };
    const meets = (i, needs) => needs.every(n => n === 'coast' ? coastal(i) : n === 'mountain' ? dMtn[i] <= 4 : n === 'coastOrRiver' ? coastal(i) || river[i] || dRiver[i] <= 1 : true);

    // ── 2. Bốc mẫu và đặt kinh đô ──
    const biomeCells = {}; for (const i of land) biomeCells[biomeOf(i)] = (biomeCells[biomeOf(i)] || 0) + 1;
    const fit = t => { const bs = t.biomes.length ? t.biomes : G.RACE_SETTLE[t.race].biomes; return Math.min(1, 5 * bs.reduce((a, b) => a + (biomeCells[b] || 0), 0) / land.length); };
    const nWant = X.chance(.2) ? 5 : X.chance(.75) ? 6 : 7;
    const chosen = [], tried = new Set();
    while (chosen.length < nWant) {
      const races = new Set(chosen.map(c => c.tpl.race)), mustNew = Math.max(0, 4 - races.size) >= nWant - chosen.length;
      const pool = G.NATION_TEMPLATES.filter(t => !tried.has(t.id) && (!mustNew || !races.has(t.race))
        && chosen.filter(c => c.tpl.race === t.race).length < (t.race === 'skeleton' || t.race === 'construct' ? 1 : 2)
        && !chosen.some(c => c.tpl.race === t.race && c.tpl.gov === t.gov));
      if (!pool.length) break;
      const t = X.wpick(pool, t => RACE_W[t.race] * (.15 + fit(t)));
      tried.add(t.id);
      const rs = G.RACE_SETTLE[t.race];
      let best = 0, bi = -1;
      for (const i of land) {
        if (!meets(i, t.needs) || chosen.some(c => dist(c.cap, i) < SPACING.capital)) continue;
        const s = raceScore(i, rs, t) * (.7 + rnd() * .6);
        if (s > best) { best = s; bi = i; }
      }
      if (bi >= 0) chosen.push({ tpl: t, cap: bi });
    }
    if (chosen.length < 5) warnings.push(`chỉ đặt được ${chosen.length} nước`);

    const nations = chosen.map((c, k) => {
      const t = c.tpl, noise = () => .9 + rnd() * .2, faith = X.wkey(t.faith);
      const [tax, army, patrol, stability, ambition] = t.stats;
      return {
        id: 'n' + k, idx: k, template: t.id, race: t.race, label: t.label, gov: t.gov, size: t.size, faith: faith === 'none' ? null : faith,
        tax: +(tax * noise()).toFixed(3), army: +(army * noise()).toFixed(2), patrol: +(patrol * noise()).toFixed(2),
        stability: +G.clamp(stability * noise(), 0, 1).toFixed(2), ambition: +G.clamp(ambition * noise(), 0, 1).toFixed(2),
        laws: [...t.laws, ...(t.lawPool.length && X.chance(.5) ? [X.pick(t.lawPool)] : [])],
        fav: t.tolerant ? Object.keys(G.RACES).filter(r => r !== 'skeleton') : t.fav.slice(),
        wary: t.xeno ? Object.keys(G.RACES).filter(r => r !== t.race) : t.wary.slice(),
        tolerant: !!t.tolerant, trait: t.trait, quirks: [], color: COLORS[k % COLORS.length],
        capitalCell: c.cap, capital: null, area: 0, cells: [], name: '', ruler: null, relations: {}, overlord: null
      };
    });

    // ── 3. Lãnh thổ ──
    const owner = new Int8Array(N).fill(NONE);
    // Diện tích mục tiêu: chia ~86% đất theo cỡ nước (S : M : L = 1 : 1,7 : 2,4) để đất vô chủ còn ~15–25% dù bốc ra mấy nước.
    const wsum = nations.reduce((a, n) => a + AREA[n.size], 0);
    const target = nations.map(n => Math.round(.86 * land.length * AREA[n.size] / wsum * (.85 + rnd() * .3)));
    const pq = G.minHeap(land.length * 2);
    nations.forEach((n, k) => pq.push(0, n.capitalCell * 16 + k));
    while (pq.size) {
      const v = pq.pop(), d = pq.lastKey, i = v >> 4, k = v & 15, n = nations[k];
      if (owner[i] !== NONE || n.area >= target[k]) continue;
      owner[i] = k; n.area++;
      const t = chosen[k].tpl, rs = G.RACE_SETTLE[t.race], pref = t.biomes.length ? t.biomes : rs.biomes;
      for (const j of nbrs(i)) {
        if (region[j] === SEA || owner[j] !== NONE || !isFinite(cost[j])) continue;
        let c = cost[j] * (pref.includes(biomeOf(j)) ? 1 : 1.5) * (regOf(j).danger >= .8 ? 3 : 1);
        if (feat[j] === FE.mountain && !rs.mountain) c *= 1.5;
        if (rs.coastOnly && dCoast[j] > 6) c *= 3;
        if (d + c <= 420) pq.push(d + c, j * 16 + k);
      }
    }
    for (const i of land) if (owner[i] !== NONE) nations[owner[i]].cells.push(i);

    // ── 4. Khu dân cư ──
    const settlements = [];
    const okSpace = (i, tier) => {
      const r = RANK[tier];
      for (const s of settlements) { const need = SPACING[RANK[s.tier] > r ? s.tier : tier]; if (dist(s.cell, i) < need) return false; }
      return true;
    };
    const addS = (cell, tier, k, race) => {
      const s = { id: 's' + settlements.length, name: '', tier, roles: [], cell, x: px(cell), y: py(cell), region: regOf(cell).id,
        nation: k, race, urban: 0, rural: 0, races: {}, faiths: {}, buildings: [], bld: [], province: -1 };   // buildings: tên hiện; bld: mã (G.BUILDINGS) cho luật chơi
      settlements.push(s); return s;
    };
    nations.forEach((n, k) => {
      const t = chosen[k].tpl, rs = G.RACE_SETTLE[t.race], gs = G.GOVS[t.gov].settle || {};
      const cnt = {};
      for (const tier of ['city', 'town', 'village', 'hamlet']) { const [a, b] = COUNTS[n.size][tier]; cnt[tier] = X.int(a, b); }
      if (gs.noCity) { cnt.town += cnt.city; cnt.city = 0; }
      cnt.town += gs.town || 0; cnt.village += gs.village || 0; cnt.hamlet += gs.hamlet || 0;
      if (rs.noHamlet) { cnt.village += Math.ceil(cnt.hamlet / 3); cnt.hamlet = 0; }
      n.capital = addS(n.capitalCell, 'capital', k, t.race).id;
      const cands = [];
      for (const i of n.cells) { const s = raceScore(i, rs, t); if (s > 0) cands.push([i, s * (.6 + rnd() * .8)]); }
      cands.sort((a, b) => b[1] - a[1]);
      const hasCoast = cands.some(([i]) => coastal(i));
      for (const tier of ['city', 'town', 'village', 'hamlet']) {
        let need = cnt[tier];
        // Nước có bờ biển mà kinh đô không ven biển: thị trấn đầu tiên đặt ven biển (thành cảng).
        if (tier === 'town' && need > 0 && hasCoast && !coastal(n.capitalCell)) {
          const c = cands.find(([i]) => coastal(i) && okSpace(i, 'town'));
          if (c) { addS(c[0], 'town', k, t.race); need--; }
        }
        for (const [i] of cands) { if (need <= 0) break; if (okSpace(i, tier)) { addS(i, tier, k, t.race); need--; } }
        if (need > 0) warnings.push(`${t.id}: thiếu ${need} ${G.TIER_VI[tier].toLowerCase()} (đất chật)`);
      }
    });
    // Đất vô chủ: làng, thôn của dân bản địa; đồn ở vùng nguy hiểm; phế tích.
    const free = land.filter(i => owner[i] === NONE && s0[i] > 0).map(i => [i, s0[i] * (.5 + rnd())]).sort((a, b) => b[1] - a[1]);
    const nFree = G.clamp(Math.round(free.length / 900), 4, 16);
    const nativeOf = i => X.wkey(regOf(i).races);
    let placed = 0;
    for (const [i] of free) { if (placed >= nFree) break; const tier = placed % 5 < 2 ? 'village' : 'hamlet'; if (okSpace(i, tier)) { addS(i, tier, NONE, nativeOf(i)); placed++; } }
    for (const r of R) if (r.danger >= .5 && X.chance(.6)) {
      const c = free.find(([i]) => regOf(i).id === r.id && okSpace(i, 'village'));
      if (c) { const s = addS(c[0], 'village', NONE, nativeOf(c[0])); s.roles.push('fort'); }
    }
    const ruinB = ['grave_hills', 'red_desert', 'forge_ruins', 'abyss_rift', 'venom_marsh'];
    const ruinCands = land.filter(i => owner[i] === NONE && feat[i] !== FE.lake && feat[i] !== FE.mountain).map(i => [i, (ruinB.includes(biomeOf(i)) ? 2 : 1) * rnd()]).sort((a, b) => b[1] - a[1]);
    let nRuin = X.int(3, 6);
    for (const [i] of ruinCands) { if (nRuin <= 0) break; if (okSpace(i, 'ruin')) { addS(i, 'ruin', NONE, null); nRuin--; } }

    // ── 5. Vai trò ──
    const lawOf = (s, law) => s.nation >= 0 && nations[s.nation].laws.includes(law);
    for (const s of settlements) {
      if (s.tier === 'ruin') continue;
      const i = s.cell, r = RANK[s.tier], rs = G.RACE_SETTLE[s.race] || {};
      const water = coastal(i) || river[i] || dLake[i] <= 1;
      if (coastal(i) && r <= 2) s.roles.push('port');
      if (r >= 3 || (r === 2 && X.chance(.3))) {
        if (dHill[i] <= 3 && ORE.includes(biomeOf(i))) s.roles.push('mine');
        else if (r >= 3 && water && X.chance(.6)) s.roles.push('fishing');
        else if (r >= 3 && dForest[i] <= 2 && !lawOf(s, 'no_logging') && X.chance(.5)) s.roles.push('lumber');
        else if (r >= 3 && !rs.noFarm && !s.roles.includes('fort')) s.roles.push('farm');
      }
      if (rs.coastOnly && r >= 3 && !s.roles.includes('fishing')) s.roles.push('fishing');
    }
    nations.forEach((n, k) => {
      const t = chosen[k].tpl, gs = G.GOVS[t.gov].settle || {}, own = settlements.filter(s => s.nation === k);
      // Đồn: thị trấn / làng nhìn ra đất ngoài nước hoặc vùng nguy hiểm.
      const frontier = s => { let sc = 0; const x0 = s.cell % W, y0 = Math.floor(s.cell / W);
        for (let dy = -10; dy <= 10; dy += 2) for (let dx = -10; dx <= 10; dx += 2) { const x = x0 + dx, y = y0 + dy; if (x < 0 || y < 0 || x >= W || y >= H) continue; const j = y * W + x; if (region[j] === SEA) continue; if (owner[j] !== k) sc += .5 + regOf(j).danger; }
        return sc; };
      const nf = 1 + (gs.forts || 0) + (t.forts || 0);
      own.filter(s => s.tier === 'town' || s.tier === 'village').map(s => [s, frontier(s)]).filter(([, f]) => f > 8).sort((a, b) => b[1] - a[1]).slice(0, nf)
        .forEach(([s]) => { if (!s.roles.includes('fort')) s.roles.unshift('fort'); });
      // Đền ở chỗ xa kinh đô (thần quyền, hội dòng).
      const cap = settlements.find(s => s.id === n.capital);
      own.filter(s => s.tier === 'village' || s.tier === 'hamlet').sort((a, b) => dist(b.cell, cap.cell) - dist(a.cell, cap.cell)).slice(0, gs.templeVillages || 0)
        .forEach(s => s.roles.unshift('temple'));
      // Chợ biên: thị trấn gần đất nước khác.
      for (const s of own.filter(s => s.tier === 'town')) {
        const near = settlements.some(o => o.nation >= 0 && o.nation !== k && dist(o.cell, s.cell) < 90);
        if (near && X.chance(.5)) s.roles.push('market');
      }
    });

    // ── 6. Tỉnh ──
    const seats = settlements.filter(s => s.tier !== 'ruin' && (RANK[s.tier] <= 2 || (s.nation === NONE && s.tier === 'village')));
    const provOf = new Int16Array(N).fill(NONE);
    const pq2 = G.minHeap(land.length * 2);
    seats.forEach((s, p) => pq2.push(0, s.cell * 512 + p));
    while (pq2.size) {
      const v = pq2.pop(), d = pq2.lastKey, i = Math.floor(v / 512), p = v % 512, own = seats[p].nation;
      if (provOf[i] !== NONE || owner[i] !== own) continue;
      provOf[i] = p;
      for (const j of nbrs(i)) if (region[j] !== SEA && provOf[j] === NONE && owner[j] === own && isFinite(cost[j])) { const nd = d + cost[j]; if (nd <= (own === NONE ? 45 : 90)) pq2.push(nd, j * 512 + p); }
    }
    const provinces = seats.map((s, p) => ({ id: 'p' + p, idx: p, seat: s.id, nation: s.nation, name: '', cells: 0, urban: 0, rural: 0 }));
    for (const i of land) if (provOf[i] !== NONE) provinces[provOf[i]].cells++;
    for (const s of settlements) {
      let p = provOf[s.cell];
      if (p === NONE) { let bd = Infinity; seats.forEach((o, q) => { if (o.nation === s.nation) { const d = dist(o.cell, s.cell); if (d < bd) { bd = d; p = q; } } }); }
      s.province = p === NONE || p === undefined ? NONE : p;
    }

    // ── 7. Dân ──
    const sizeMul = { S: .5, M: .75, L: 1 };
    nations.forEach((n, k) => {
      const gs = G.GOVS[n.gov].settle || {}, cap = settlements.find(s => s.id === n.capital);
      cap.urban = gs.smallCapital ? Math.round(2500 + rnd() * 3000) : Math.round(Math.max(8000, G.lerp(12000, 40000, Math.pow(rnd(), 1.3)) * sizeMul[n.size]));
      settlements.filter(s => s.nation === k && s.tier === 'city').forEach((s, r) => { s.urban = Math.round(G.clamp(cap.urban / (r + 2) * (.8 + rnd() * .4), 5000, 12000)); });
    });
    for (const s of settlements) {
      if (s.urban || s.tier === 'ruin') continue;
      if (s.tier === 'town') s.urban = Math.round(1000 + 4000 * Math.pow(rnd(), 1.6));
      else if (s.tier === 'village') s.urban = Math.round(s.nation === NONE && s.roles.includes('fort') ? 80 + 220 * rnd() : 150 + 850 * Math.pow(rnd(), 1.4));
      else if (s.tier === 'hamlet') s.urban = Math.round(20 + 130 * rnd());
    }
    // Dân nông thôn: sức chứa ô → gom về làng / thôn gần nhất (cùng chủ, trong chi phí 14) → co giãn theo tỉ lệ đô thị.
    const capOf = i => {
      const f = G.FEATURES[feat[i]].id, k = owner[i], race = k >= 0 ? nations[k].race : null, rs = race ? G.RACE_SETTLE[race] : {};
      let c = f === 'mountain' && rs.mountain ? 40 : CAP[f];
      if (f === 'open' && river[i]) c *= 1.5;
      c *= HAB[biomeOf(i)] * (coastal(i) ? 1.2 : 1);
      return rs.noFarm ? c * .15 : c;
    };
    const rural = settlements.filter(s => s.tier === 'village' || s.tier === 'hamlet');
    const catchOf = new Int16Array(N).fill(NONE), pq3 = G.minHeap(land.length);
    rural.forEach((s, q) => pq3.push(0, s.cell * 512 + q));
    while (pq3.size) {
      const v = pq3.pop(), d = pq3.lastKey, i = Math.floor(v / 512), q = v % 512, own = rural[q].nation;
      if (catchOf[i] !== NONE || owner[i] !== own) continue;
      catchOf[i] = q;
      for (const j of nbrs(i)) if (region[j] !== SEA && catchOf[j] === NONE && owner[j] === own && isFinite(cost[j])) { const nd = d + cost[j]; if (nd <= 14) pq3.push(nd, j * 512 + q); }
    }
    const groups = [...nations.map((n, k) => k), NONE];
    const looseOfProv = new Float64Array(provinces.length);
    for (const k of groups) {
      const urbanTot = settlements.filter(s => s.nation === k).reduce((a, s) => a + s.urban, 0);
      const u = k === NONE ? .2 : G.clamp(G.RACE_SETTLE[nations[k].race].urban + (G.GOVS[nations[k].gov].urban || 0), .05, .9);
      let rawTot = 0; const cells = k === NONE ? land.filter(i => owner[i] === NONE) : nations[k].cells;
      for (const i of cells) rawTot += capOf(i);
      const scale = rawTot ? urbanTot * (1 - u) / u / rawTot : 0;
      for (const i of cells) {
        const c = capOf(i) * scale;
        if (catchOf[i] !== NONE) rural[catchOf[i]].rural += c;
        else if (provOf[i] !== NONE) looseOfProv[provOf[i]] += c;
      }
    }
    // Dân rải rác ngoài vùng quê của làng: chia cho làng / thôn cùng tỉnh (theo dân quê sẵn có), không có thì cho thủ phủ,
    // để mọi người đều có một khu dân cư làm nơi sinh.
    provinces.forEach((p, q) => {
      if (!looseOfProv[q]) return;
      const rs = settlements.filter(s => s.province === q && (s.tier === 'village' || s.tier === 'hamlet')), tot = rs.reduce((a, s) => a + s.rural + 1, 0);
      if (rs.length) for (const s of rs) s.rural += looseOfProv[q] * (s.rural + 1) / tot;
      else settlements.find(s => s.id === p.seat).rural += looseOfProv[q];
    });
    for (const s of settlements) s.rural = Math.round(s.rural);
    for (const s of settlements) if (s.province !== NONE) { provinces[s.province].urban += s.urban; provinces[s.province].rural += s.rural; }
    provinces.forEach(p => { p.pop = p.urban + p.rural; });

    // ── 8. Chủng tộc, đạo, công trình, tên ──
    const norm = o => { const t = Object.values(o).reduce((a, b) => a + b, 0) || 1; for (const k of Object.keys(o)) o[k] = +(o[k] / t * 100).toFixed(1); return o; };
    for (const s of settlements) {
      if (s.tier === 'ruin') continue;
      const reg = G.REGION[s.region], natives = reg.races;
      if (s.nation === NONE) { s.races = norm({ ...natives }); s.faiths = norm({ ...reg.faiths }); }
      else {
        const n = nations[s.nation], t = chosen[s.nation].tpl, main = n.race;
        const mShare = n.tolerant ? .55 : G.clamp(.85 - .08 * (n.fav.length - 1), .5, .85);
        const r = { [main]: mShare };
        const nat = Object.entries(natives).filter(([k]) => k !== main), natTot = nat.reduce((a, [, w]) => a + w, 0) || 1;
        const favs = n.fav.filter(k => k !== main && k !== 'skeleton');
        for (const [k, w] of nat) r[k] = (r[k] || 0) + (1 - mShare) * (favs.length ? .7 : 1) * w / natTot;
        for (const k of favs) r[k] = (r[k] || 0) + (1 - mShare) * .3 / favs.length;
        for (const k of n.wary) if (r[k] && k !== main) r[k] *= .3;
        s.races = norm(r);
        const f = {};
        for (const [k, w] of Object.entries(t.faith)) f[k] = (f[k] || 0) + .7 * w;
        const rf = reg.faiths, rfTot = Object.values(rf).reduce((a, b) => a + b, 0) || 1;
        for (const [k, w] of Object.entries(rf)) f[k] = (f[k] || 0) + 30 * w / rfTot;
        s.faiths = norm(f);
      }
      // Công trình theo bậc.
      const rs = G.RACE_SETTLE[s.race] || {}, tierKey = s.tier === 'hamlet' ? null : s.tier;
      if (tierKey) for (const b of G.BUILDINGS) {
        const p = b.p[tierKey]; if (!p || rnd() >= p) continue;
        if (b.id === 'walls' && rs.noWalls) continue;
        s.buildings.push(b.id === 'walls' && rs.palisade ? 'Rào cọc' : b.name[tierKey]); s.bld.push(b.id);
      }
      if (s.roles.includes('fort') && !s.bld.includes('barracks')) { s.buildings.push('Đồn lính'); s.bld.push('barracks'); }
      if (s.tier === 'capital') { if (rs.signature) s.buildings.push(rs.signature); const sig = (G.GOVS[nations[s.nation].gov].settle || {}).signature; if (sig) s.buildings.push(sig); }
      // Tên: kinh đô / thành phố dùng chữ của bậc; khu nhỏ hơn có vai trò rõ thì dùng chữ của vai trò.
      const role = RANK[s.tier] >= 2 ? ROLE_NAME.find(r => s.roles.includes(r)) : null;
      s.name = nm.settlement(s.race, s.tier, role);
    }
    for (const s of settlements) if (s.tier === 'ruin') s.name = nm.ruin();
    provinces.forEach(p => { p.name = settlements.find(s => s.id === p.seat).name; });

    // ── 9. Quốc gia: tên, người cai trị, đặc trưng riêng, quan hệ ──
    const cellsIn = (n, pred) => n.cells.some(pred);
    nations.forEach((n, k) => {
      const t = chosen[k].tpl, gov = G.GOVS[n.gov];
      n.name = nm.nation(n.race, n.gov);
      if (gov.ruled) {
        const living = n.race === 'skeleton' ? 'skeleton' : n.race, sexes = G.RACES[living].sexes, sex = X.pick(sexes);
        const titles = G.NAMES.nation.ruler[n.gov] || ['Thủ Lĩnh'];
        n.ruler = { title: titles.length > 1 && sex === 'f' ? titles[1] : titles[0], name: G.personName(living, sex, rnd), sex, age: X.int(Math.round(G.RACES[living].adult) + 2, Math.round(G.RACES[living].le * .8)) };
      }
      // Đặc trưng riêng.
      const ok = q => {
        const w = q.when || {};
        if (w.ruled && !gov.ruled) return false;
        if (w.gov && !w.gov.includes(n.gov)) return false;
        if (w.notGov && w.notGov.includes(n.gov)) return false;
        if (w.size && !w.size.includes(n.size)) return false;
        if (w.coastCapital && !coastal(n.capitalCell)) return false;
        if (w.hasFaith && !n.faith) return false;
        if (w.near === 'mountain' && !cellsIn(n, i => feat[i] === FE.mountain)) return false;
        if (w.near === 'forest' && !cellsIn(n, i => feat[i] === FE.forest || feat[i] === FE.jungle)) return false;
        if (w.lordNear && !cellsIn(n, i => regOf(i).lord)) return false;
        if (w.notTolerant && n.tolerant) return false;
        if (w.biomeAny && !cellsIn(n, i => w.biomeAny.includes(biomeOf(i)))) return false;
        if (w.notLaw && n.laws.includes(w.notLaw)) return false;
        if (q.target && nations.length < 2) return false;
        return true;
      };
      const nq = X.chance(.35) ? 2 : 1;
      for (let a = 0; a < nq; a++) {
        const q = X.wpick(G.QUIRKS.filter(q => ok(q) && !n.quirks.some(x => G.QUIRKS.find(y => y.id === x.id).group === q.group)), () => 1);
        if (!q) break;
        const entry = { id: q.id };
        for (const [key, d] of Object.entries(q.mods || {})) {
          if (key === 'army' || key === 'patrol') n[key] = +(n[key] * (1 + d)).toFixed(2);
          else n[key] = +G.clamp(n[key] + d, 0, key === 'tax' ? .5 : 1).toFixed(3);
        }
        if (q.target) {
          const others = nations.filter(o => o !== n && (q.target !== 'vassal' || o.size !== 'S'));
          const o = others.length ? X.pick(others) : null;
          if (!o) continue;
          entry.target = o.idx;
          if (q.target === 'vassal') n.overlord = o.idx;
        }
        if (q.id === 'xenophobia') { const r = X.pick(Object.keys(G.RACES).filter(r => r !== n.race && !n.wary.includes(r) && !n.fav.includes(r))); if (r) { n.wary.push(r); entry.race = r; } }
        n.quirks.push(entry);
      }
    });
    // Quan hệ ban đầu: −3 … +3.
    for (const a of nations) for (const b of nations) {
      if (a === b) continue;
      let r = 0;
      if (a.faith && b.faith && a.faith === b.faith) r += 1;
      if ((a.faith === 'light' && b.faith === 'dark') || (a.faith === 'dark' && b.faith === 'light')) r -= 2;
      if (a.wary.includes(b.race)) r -= 1;
      if (b.wary.includes(a.race)) r -= 1;
      a.relations[b.idx] = r;
    }
    for (const n of nations) for (const q of n.quirks) if (q.target != null) {
      const o = nations[q.target], v = q.id === 'old_feud' ? -3 : q.id === 'royal_match' ? 3 : 2;
      n.relations[o.idx] = v; o.relations[n.idx] = v;
    }
    // Chỗ đặt tên nước trên bản đồ: tâm lãnh thổ, kéo về ô đất gần nhất của nước.
    for (const n of nations) {
      let sx = 0, sy = 0; for (const i of n.cells) { sx += px(i); sy += py(i); }
      const cx = sx / n.cells.length, cy = sy / n.cells.length;
      let bi = n.capitalCell, bd = Infinity;
      for (const i of n.cells) { const d = Math.hypot(px(i) - cx, py(i) - cy); if (d < bd) { bd = d; bi = i; } }
      n.labelPos = [px(bi), py(bi)];
    }

    // ── 9b. Đường xá (docs/03 mục 3.2) ──
    // Đường cái: nối kinh đô / thành phố / thị trấn thành cây khung nhỏ nhất (Prim, mỗi bước loang từ cả mạng tới khu chưa nối gần nhất).
    // Đường mòn: mỗi làng, đồn nối vào mạng gần nhất. Lối nhỏ: mỗi thôn nối vào mạng gần nhất.
    // Loang 8 hướng trên lưới chi phí; ô đã là đường × 0,3 nên các tuyến tự gộp thành trục. Đảo có mạng riêng.
    // Cầu = ô đường trên sông; đèo = ô đường trên núi.
    const D8 = [[1, 0, 1], [-1, 0, 1], [0, 1, 1], [0, -1, 1], [1, 1, 1.414], [-1, 1, 1.414], [1, -1, 1.414], [-1, -1, 1.414]];
    const road = new Uint8Array(N), roads = [], linked = new Uint8Array(N), netCells = [];
    const rdist = new Float32Array(N).fill(Infinity), rprev = new Int32Array(N).fill(-1);
    const grow = (sources, isGoal, maxCost) => {
      const touched = [], q = G.minHeap(1024);
      for (const i of sources) { rdist[i] = 0; rprev[i] = -1; touched.push(i); q.push(0, i); }
      let hit = -1;
      while (q.size) {
        const i = q.pop(), d = q.lastKey;
        if (d > rdist[i]) continue;
        if (isGoal(i)) { hit = i; break; }
        if (d > maxCost) break;
        const x = i % W, y = (i - x) / W;
        for (const [dx, dy, m] of D8) {
          const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
          const j = ny * W + nx; if (region[j] === SEA || !isFinite(cost[j])) continue;
          const nd = d + cost[j] * m * (road[j] ? .3 : 1);
          if (nd < rdist[j]) { if (rdist[j] === Infinity) touched.push(j); rdist[j] = nd; rprev[j] = i; q.push(nd, j); }
        }
      }
      let path = null;
      if (hit >= 0) { path = []; for (let c = hit; c >= 0; c = rprev[c]) path.push(c); }
      for (const i of touched) { rdist[i] = Infinity; rprev[i] = -1; }
      return path;
    };
    const addNet = i => { if (!linked[i]) { linked[i] = 1; netCells.push(i); } };
    // to: khu dân cư mà đoạn đường được làm ra để nối (khu đó bỏ hoang lâu thì đoạn này xuống cấp, js/dynamic.js).
    const lay = (path, cls, to) => { for (const c of path) { if (road[c] < cls) road[c] = cls; addNet(c); } roads.push({ cls, cells: path, to }); };
    const live = settlements.filter(s => s.tier !== 'ruin'), liveAt = new Map(live.map(s => [s.cell, s.id]));
    const left = new Set(live.filter(s => RANK[s.tier] <= 2).map(s => s.cell));
    while (left.size) {
      const path = netCells.length ? grow(netCells, i => left.has(i), Infinity) : null;
      if (!path) { const c0 = left.values().next().value; left.delete(c0); addNet(c0); continue; }   // mạng mới (đảo)
      left.delete(path[0]); lay(path, 3, liveAt.get(path[0]));
    }
    for (const s of live.filter(s => s.tier === 'village').sort((a, b) => b.urban - a.urban)) {
      if (linked[s.cell]) continue;
      const path = grow([s.cell], i => linked[i] === 1, 160);
      if (path) lay(path, 2, s.id); else addNet(s.cell);
    }
    for (const s of live.filter(s => s.tier === 'hamlet')) {
      if (linked[s.cell]) continue;
      const path = grow([s.cell], i => linked[i] === 1, 60);
      if (path) lay(path, 1, s.id); else addNet(s.cell);
    }
    const bridges = [], passes = [];
    for (const i of land) if (road[i]) { if (river[i]) bridges.push(i); if (feat[i] === FE.mountain) passes.push(i); }

    // ── 10. Độ hoang và tầng nguy hiểm: tính sau khi có bản ghi thế giới (G.wildFull, cuối hàm). ──

    // ── 11. Biển (docs/03 mục 7) ──
    // Gắn nhãn thành phần liên thông 8 hướng của các ô thỏa ok: [nhãn từng ô (−1 = không thuộc), cỡ từng thành phần].
    const DX = [1, -1, 0, 0, 1, -1, 1, -1], DY = [0, 0, 1, -1, 1, 1, -1, -1], fq = new Int32Array(N);
    const label = ok => {
      const id = new Int32Array(N).fill(NONE), size = [];
      for (let i0 = 0; i0 < N; i0++) {
        if (id[i0] >= 0 || !ok(i0)) continue;
        const k = size.length; let qh = 0, qt = 0; fq[qt++] = i0; id[i0] = k;
        while (qh < qt) { const i = fq[qh++], x = i % W, y = (i - x) / W;
          for (let d = 0; d < 8; d++) { const nx = x + DX[d], ny = y + DY[d]; if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue; const j = ny * W + nx; if (id[j] < 0 && ok(j)) { id[j] = k; fq[qt++] = j; } } }
        size.push(qt);
      }
      return [id, size];
    };
    // Khối đất: đất liền nối nhau 8 hướng; khối lớn nhất là đại lục, còn lại là đảo (chỉ tới được bằng tàu).
    const [mass, massSize] = label(i => region[i] !== SEA), mainMass = massSize.indexOf(Math.max(...massSize));
    const liveOn = new Map();   // khối đất (trừ đại lục) → khu dân cư trên đó
    for (const s of settlements) if (s.tier !== 'ruin' && mass[s.cell] !== mainMass) (liveOn.get(mass[s.cell]) || liveOn.set(mass[s.cell], []).get(mass[s.cell])).push(s);
    // Cảng: khu dân cư có ô biển trong bán kính 2 ô (seaCells: các ô biển đó, chỗ tàu cập). Tàu theo bậc (G.SHIPS):
    // thuyền chài ở mọi bến; tàu buôn ở khu có vai trò cảng (thị trấn trở lên); tàu viễn dương ở kinh đô ven biển và mọi cảng
    // của nước có đặc tính Tàu lá (E4) hoặc đặc trưng Cảng lớn. Đảo: bến lớn nhất có ít nhất tàu buôn để đảo không bị cô lập.
    const harbors = [];
    const seaNear = (cell, r) => { const x0 = cell % W, y0 = Math.floor(cell / W), sc = [];
      for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) { const x = x0 + dx, y = y0 + dy; if (x >= 0 && y >= 0 && x < W && y < H && region[y * W + x] === SEA) sc.push(y * W + x); }
      return sc; };
    const makeHarbor = (s, sc) => {
      const n = s.nation >= 0 ? nations[s.nation] : null, port = s.roles.includes('port');
      s.ship = s.tier === 'capital' || (port && n && (n.template === 'E4' || n.quirks.some(q => q.id === 'great_port'))) ? 2 : port ? 1 : 0;
      s.seaCells = sc; s.mass = mass[s.cell]; harbors.push(s);
    };
    for (const s of settlements) { if (s.tier === 'ruin') continue; const sc = seaNear(s.cell, 2); if (sc.length) makeHarbor(s, sc); }
    // Đảo: không có khu nào sát bờ thì khu gần biển nhất dựng cầu tàu ra tới biển. Bến lớn nhất của đảo có ít nhất tàu buôn.
    for (const [m, live2] of liveOn) {
      let hs = harbors.filter(h => h.mass === m);
      if (!hs.length) {
        const c = live2.slice().sort((a, b) => dCoast[a.cell] - dCoast[b.cell])[0];
        makeHarbor(c, seaNear(c.cell, Math.min(60, dCoast[c.cell] + 2))); hs = [c];
      }
      hs.sort((a, b) => b.urban - a.urban);
      if (hs.length && hs[0].ship < 1) hs[0].ship = 1;
    }
    // Độ hoang biển: w = khoảng cách tới bờ (ô) / 5 − .6 nếu trong 8 ô quanh một cảng (khu có vai trò cảng). Tầng: G.SEA_BAND_W.
    const SBW = G.SEA_BAND_W, seaWild = new Float32Array(N), seaBand = new Uint8Array(N).fill(SEA), nearPort = new Uint8Array(N);
    for (const s of settlements) if (s.roles.includes('port')) {
      const x0 = s.cell % W, y0 = Math.floor(s.cell / W);
      for (let dy = -8; dy <= 8; dy++) for (let dx = -8; dx <= 8; dx++) { const x = x0 + dx, y = y0 + dy; if (x >= 0 && y >= 0 && x < W && y < H && dx * dx + dy * dy <= 64) nearPort[y * W + x] = 1; }
    }
    const seaBandCells = (G.SEAS || []).map(() => [[], [], [], []]);
    for (let i = 0; i < N; i++) {
      if (region[i] !== SEA) continue;
      const w = Math.max(0, map.shore[i] / 5 - (nearPort[i] ? .6 : 0));
      seaWild[i] = w; seaBand[i] = w < SBW[0] ? 0 : w < SBW[1] ? 1 : w < SBW[2] ? 2 : 3;
      seaBandCells[map.sea[i]][seaBand[i]].push(i);
    }
    const seas = (G.SEAS || []).map((t, k) => ({ idx: k, type: t.id, name: nm.sea(t), cells: map.seaCells[k].length }));
    // Đảo có khu dân cư phải có bến, và bến phải nối được (theo tầng tàu của nó, chưa xét sức nhân vật) tới bến của khối đất khác.
    // Vùng nước mỗi bến đi được theo từng loại tàu (h.comp[c]: thành phần liên thông của ô biển tầng ≤ maxBand của tàu c).
    const comps = G.SHIPS.map(sh => label(i => seaBand[i] <= sh.maxBand)[0]);   // ô đất có seaBand 255 nên tự bị loại
    for (const h of harbors) h.comp = comps.map(id => [...new Set(h.seaCells.map(i => id[i]).filter(v => v >= 0))]);
    const linksOut = h => harbors.some(o => o.mass !== h.mass && o.comp[h.ship].some(v => h.comp[h.ship].includes(v)));
    for (const [m, live2] of liveOn) {
      const hs = harbors.filter(h => h.mass === m);
      if (!hs.length) errors.push(`đảo có ${live2[0].name} mà không có bến`);
      else if (!hs.some(linksOut)) errors.push(`bến ${hs[0].name} trên đảo không có hải trình tới khối đất khác`);
    }
    if (map.seaCells.some((cs, k) => !cs.length)) warnings.push('có vùng biển không có ô nào');

    // ── Kiểm tra (docs/05 mục 12) ──
    for (const s of settlements) {
      const f = feat[s.cell];
      if (region[s.cell] === SEA || f === FE.lake) errors.push(`${s.name} nằm trên nước`);
      if (f === FE.mountain && !(G.RACE_SETTLE[s.race] || {}).mountain) errors.push(`${s.name} nằm trên núi`);
      if (s.nation >= 0 && G.RACE_SETTLE[nations[s.nation].race].coastOnly && !s.roles.includes('port') && !s.roles.includes('fishing')) errors.push(`${s.name}: khu Hải Tộc không ven nước`);
    }
    const races = new Set(nations.map(n => n.race));
    if (races.size < 4) warnings.push(`chỉ có ${races.size} chủng tộc làm chủ quốc gia`);
    // ── 12. Kề nhau giữa các tỉnh (quốc gia động, js/dynamic.js) ──
    // provAdj[p]: tỉnh chung biên trên đất. provSea[p]: tỉnh có cảng nối được bằng tàu buôn tới cảng của tỉnh p, cách ≤ 420px.
    const provAdj = provinces.map(() => new Set()), provSea = provinces.map(() => new Set());
    for (const i of land) {
      const p = provOf[i]; if (p === NONE) continue;
      const x = i % W;
      for (const j of [x < W - 1 ? i + 1 : -1, i + W < N ? i + W : -1]) if (j >= 0 && provOf[j] !== NONE && provOf[j] !== p) { provAdj[p].add(provOf[j]); provAdj[provOf[j]].add(p); }
    }
    const ports = harbors.filter(h => h.ship >= 1 && h.province >= 0);
    for (const a of ports) for (const b of ports) if (a.province !== b.province && dist(a.cell, b.cell) <= 420 && b.comp[1].some(v => a.comp[1].includes(v))) provSea[a.province].add(b.province);

    const out = { seed, nations, settlements, provinces, owner, provOf, wild: new Float32Array(N), band: new Uint8Array(N).fill(SEA), bandCells: null, road, roads, bridges, passes,
      byId: Object.fromEntries(settlements.map(s => [s.id, s])), stats: null, check: { errors, warnings },
      mass, mainMass, harbors, seas, seaWild, seaBand, seaBandCells, provAdj: provAdj.map(s => [...s]), provSea: provSea.map(s => [...s]), _cost: cost };
    G.wildFull(out);
    const band = out.band;
    const urbanTot = settlements.reduce((a, s) => a + s.urban, 0), ruralTot = provinces.reduce((a, p) => a + p.rural, 0) + settlements.filter(s => s.province === NONE).reduce((a, s) => a + s.rural, 0);
    out.stats = {
      nations: nations.length, settlements: settlements.filter(s => s.tier !== 'ruin').length, ruins: settlements.filter(s => s.tier === 'ruin').length, provinces: provinces.length,
      byTier: Object.fromEntries([...TIERS, 'ruin'].map(t => [t, settlements.filter(s => s.tier === t).length])),
      pop: urbanTot + ruralTot, urban: urbanTot, urbanShare: urbanTot / Math.max(1, urbanTot + ruralTot),
      unclaimed: land.filter(i => owner[i] === NONE).length / land.length,
      bands: [0, 1, 2, 3].map(b => land.filter(i => feat[i] !== FE.lake && band[i] === b).length / land.length),
      roads: [1, 2, 3].map(c => land.filter(i => road[i] === c).length), bridges: bridges.length, passes: passes.length,
      harbors: [0, 1, 2].map(c => harbors.filter(h => h.ship === c).length), islands: liveOn.size,
      seaBands: [0, 1, 2, 3].map(b => seaBandCells.reduce((a, bc) => a + bc[b].length, 0) / Math.max(1, N - land.length))
    };
    placeSites(out, seed);
    out.stats.dungeons = out.dungeons.length;
    return out;
  };

  // ── 13. Di tích và ổ chúa (docs/03 mục 4.2, cuối 3.4). RNG riêng nên thêm vào không đổi phần còn lại của thế giới. ──
  // Di tích: 5–7 cái, mỗi cái ở ô lõi hoặc vùng chết của một vùng có biome trong G.DUNGEON_TIERS (mỗi vùng tối đa một), cách khu
  // dân cư ≥ 30px; nước có đặc trưng Kho báu thất lạc thêm một cái trong lãnh thổ (ô sâu trở lên). Tầng của di tích: G.DG[vùng].
  // Ổ chúa: một ô trong 5% ô hoang nhất của vùng có chúa vùng. Cả hai tĩnh; tầng đã dọn lưu trong W.dyn.dg (js/dynamic.js).
  function placeSites(R, seed) {
    const M = G.map, { W, CS, region, feat } = M, X = G.tools(G.makeRng('sites:' + seed));
    const FE_LAKE = G.FEATURES.findIndex(f => f.id === 'lake');
    const px = i => (i % W + .5) * CS, py = i => (Math.floor(i / W) + .5) * CS;
    const far = (i, d) => !R.settlements.some(s => Math.hypot(s.x - px(i), s.y - py(i)) < d) && !R.dungeons.some(o => Math.hypot(o.x - px(i), o.y - py(i)) < 60);
    const NR = G.NAMES.ruin, used = new Set();
    const name = () => {
      for (let t = 0; t < 40; t++) {
        const a = X.pick(NR.prefix), b = X.pick(NR.root), nm = a + ' ' + b;
        if (!a.split(' ').some(w => b.split(' ').includes(w)) && !used.has(nm)) { used.add(nm); return nm; }
      }
      return 'Phế Tích ' + X.pick(NR.root) + ' ' + (used.size + 1);
    };
    R.dungeons = [];
    const add = (cell, nation) => R.dungeons.push({ id: 'd' + R.dungeons.length, name: name(), cell, x: px(cell), y: py(cell), region: G.REGIONS[region[cell]].id, nation });
    const regs = G.REGIONS.map((r, k) => k).filter(k => G.DUNGEON_TIERS[G.REGIONS[k].biome]).map(k => [X.rnd(), k]).sort((a, b) => a[0] - b[0]).map(a => a[1]);
    const want = X.int(5, 7);
    for (const k of regs) {
      if (R.dungeons.length >= want) break;
      const cs = M.cellsOf[k].filter(i => feat[i] !== FE_LAKE && R.band[i] >= 2 && far(i, 30));
      if (cs.length) add(X.pick(cs), null);
    }
    for (const n of R.nations) if (n.quirks.some(q => q.id === 'lost_treasure')) {
      const cs = []; for (let i = 0; i < R.owner.length; i++) if (R.owner[i] === n.idx && R.band[i] >= 1 && R.band[i] < 4 && feat[i] !== FE_LAKE && far(i, 25)) cs.push(i);
      if (cs.length) add(X.pick(cs), n.idx);
    }
    R.nests = [];
    G.REGIONS.forEach((r, k) => {
      if (!r.lord) return;
      const cs = M.cellsOf[k].filter(i => feat[i] !== FE_LAKE).sort((a, b) => R.wild[b] - R.wild[a]);
      const c = X.pick(cs.slice(0, Math.max(1, Math.ceil(cs.length * .05))));
      R.nests.push({ region: r.id, cell: c, x: px(c), y: py(c), species: r.lord.species });
    });
    if (R.dungeons.length < 5) R.check.warnings.push(`chỉ đặt được ${R.dungeons.length} di tích`);
  }

  // ── 10. Độ hoang và tầng nguy hiểm (docs/03 mục 3.3–3.4) ──
  // w(ô) = min qua các nguồn văn minh (chi phí đi bộ / bán kính) + độ hoang biome + độ hoang địa hình; tầng theo G.BAND_W.
  // Nguồn: khu dân cư (bán kính theo bậc: kinh đô 120px … thôn 25px, đồn ít nhất 70px; × tuần tra của nước, vô chủ .6;
  // khu đang sa sút × .6) và ô đường cái, đường mòn (30px × tuần tra; mỗi tỉnh một nhóm, ô ngoài tỉnh nhóm theo nước).
  // Mỗi nguồn loang Dijkstra riêng tới w = 3,5 (đã là vùng chết); trộn các bán kính trong một hàng đợi làm nhãn bị sửa lại
  // gần như vô tận ở vài địa hình. Vết loang của khu dân cư cache theo (ô, bán kính).
  // Thế giới động (js/dynamic.js): bật / tắt / đổi một nguồn (khu sụp, tỉnh đổi chủ) bằng G.wildSet, rồi G.wildCommit
  // chỉ tính lại vùng mà các nguồn đổi phủ tới.
  const WR = { capital: 120, city: 100, town: 80, village: 50, hamlet: 25 };
  const patrolOf = (R, k) => k >= 0 && R.nations[k] ? R.nations[k].patrol : .6;
  function flood(R, src, rc) {
    const M = G.map, W = M.W, cost = R._cost, lim = 3.5 * rc, N = cost.length;
    const dd = R._dd || (R._dd = new Float32Array(N).fill(Infinity)), touched = [], q = G.minHeap(src.length > 1 ? 4096 : 512);
    for (const i of src) { dd[i] = 0; touched.push(i); q.push(0, i); }
    while (q.size) {
      const i = q.pop(), d = q.lastKey;
      if (d > dd[i]) continue;
      const x = i % W;
      // Bốn ô kề theo thứ tự trái, phải, trên, dưới (giữ đúng thứ tự cũ để kết quả không đổi), không cấp phát mảng.
      for (let k = 0; k < 4; k++) {
        const j = k === 0 ? (x > 0 ? i - 1 : -1) : k === 1 ? (x < W - 1 ? i + 1 : -1) : k === 2 ? i - W : i + W;
        if (j < 0 || j >= N) continue;
        const cj = cost[j]; if (cj === Infinity) continue;
        const nd = d + cj;
        if (nd < dd[j] && nd <= lim) { if (dd[j] === Infinity) touched.push(j); dd[j] = nd; q.push(nd, j); }
      }
    }
    const cells = Int32Array.from(touched), vals = new Float32Array(cells.length);
    let x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1;
    for (let k = 0; k < cells.length; k++) {
      const c = cells[k], x = c % W, y = (c - x) / W;
      vals[k] = dd[c] / rc; dd[c] = Infinity;
      if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
    }
    return { cells, vals, x0, y0, x1, y1, rc, sig: src.length === 1 ? src[0] : null };
  }
  // Vết loang của một khu dân cư (null nếu là phế tích).
  G.wildOfSettlement = function (R, s) {
    if (s.tier === 'ruin') return null;
    const rc = Math.max(WR[s.tier] || 25, s.roles.includes('fort') ? 70 : 0) / G.map.CS * patrolOf(R, s.nation) * (s.dwindling ? .6 : 1);
    const key = s.cell + ':' + rc, C = R._wc || (R._wc = new Map());
    if (C.size > 2500) C.clear();   // vết loang của các tổ hợp (khu, tuần tra) cũ; bản gốc vẫn giữ trong R.base.src
    if (!C.has(key)) C.set(key, flood(R, [s.cell], rc));
    return C.get(key);
  };
  // Nhóm ô đường (cái, mòn) theo tỉnh; ô đường ngoài tỉnh theo nước chủ ô. → Map khóa nguồn → { cells, nation }.
  G.roadGroups = function (R) {
    const groups = new Map(), { road, provOf, owner } = R;
    for (let i = 0; i < road.length; i++) if (road[i] >= 2) {
      const p = provOf[i], key = p >= 0 ? 'P' + p : 'O' + owner[i];
      if (!groups.has(key)) groups.set(key, { cells: [], nation: p >= 0 ? R.provinces[p].nation : owner[i] });
      groups.get(key).cells.push(i);
    }
    return groups;
  };
  // Vết loang của một nhóm đường, cache theo (tập ô, bán kính): nhóm chỉ đổi khi tỉnh đổi chủ hoặc đường xuống cấp.
  G.wildOfRoads = (R, g) => {
    const rc = 30 / G.map.CS * patrolOf(R, g.nation);
    let h = g.cells.length; for (const c of g.cells) h = (Math.imul(h, 31) + c) | 0;
    const key = 'r' + h + ':' + g.cells.length + ':' + rc, C = R._wc || (R._wc = new Map());
    if (C.size > 2500) C.clear();
    if (!C.has(key)) { const f = flood(R, g.cells, rc); f.sig = key.slice(0, key.lastIndexOf(':')); C.set(key, f); }
    return C.get(key);
  };
  // Bật / thay / tắt một nguồn (f = null). Ô mà nguồn cũ phủ được tính lại từ các nguồn còn lại có khung chồng lên.
  G.wildSet = function (R, key, f) {
    const old = R._src.get(key);
    if (old === f) return;
    if (f) R._src.set(key, f); else R._src.delete(key);
    const wmin = R._wmin, W = G.map.W;
    // Cùng nguồn, bán kính không nhỏ đi: vết mới phủ cả vết cũ với giá trị không lớn hơn, chỉ cần trộn min.
    const grow = old && f && old.sig != null && old.sig === f.sig && f.rc >= old.rc;
    if (old && !grow) {
      // Chỉ ô mà nguồn cũ đang là nguồn gần nhất mới phải tính lại; khung của các ô đó giới hạn nguồn cần xét.
      const st = R._stamp || (R._stamp = new Int32Array(wmin.length)), t = R._stampN = (R._stampN || 0) + 1;
      let x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1;
      const oc = old.cells, ov = old.vals;
      for (let k = 0; k < oc.length; k++) {
        const c = oc[k]; if (ov[k] > wmin[c]) continue;
        st[c] = t; wmin[c] = 3.5;
        const x = c % W, y = (c - x) / W; if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
      }
      for (const o of x1 < 0 ? [] : R._src.values()) {
        if (o.x1 < x0 || o.x0 > x1 || o.y1 < y0 || o.y0 > y1) continue;
        const cs = o.cells, vs = o.vals;
        for (let k = 0; k < cs.length; k++) { const c = cs[k]; if (st[c] === t && vs[k] < wmin[c]) wmin[c] = vs[k]; }
      }
      R._dirty.push(old.cells);
    }
    if (f) { const cs = f.cells, vs = f.vals; for (let k = 0; k < cs.length; k++) if (vs[k] < wmin[cs[k]]) wmin[cs[k]] = vs[k]; }
    if (f) R._dirty.push(f.cells);
  };
  // Từ wmin ra độ hoang, tầng của các ô vừa đổi; dựng lại danh sách ô theo vùng × tầng; xóa cache đường đi (js/travel.js).
  G.wildCommit = function (R, all) {
    const M = G.map, { feat, region } = M, W = M.W, N = feat.length, BW = G.BAND_W, wmin = R._wmin, wild = R.wild, band = R.band;
    const FE_LAKE = G.FEATURES.findIndex(f => f.id === 'lake');
    // Vùng có ô đổi tầng: chỉ dựng lại danh sách ô của các vùng đó.
    const touchedReg = new Set();
    const set = i => {
      if (region[i] === SEA || feat[i] === FE_LAKE) return;
      wild[i] = wmin[i] + ((G.TERRAIN[G.REGIONS[region[i]].biome] || {}).wild || 0) + G.FEATURES[feat[i]].wild;
      const b = wild[i] < BW[0] ? 0 : wild[i] < BW[1] ? 1 : wild[i] < BW[2] ? 2 : 3;
      if (b !== band[i]) { band[i] = b; touchedReg.add(region[i]); }
    };
    if (all) for (let i = 0; i < N; i++) set(i);
    else for (const cs of R._dirty) for (const c of cs) set(c);
    R._dirty = [];
    if (!all && !touchedReg.size) return;
    // Hồ lấy tầng thấp nhất của bờ (để rê chuột có tên khu); trên hồ không có chỗ săn.
    const lakes = R._lakes || (R._lakes = (() => { const a = []; for (let i = 0; i < N; i++) if (region[i] !== SEA && feat[i] === FE_LAKE) a.push(i); return a; })());
    for (const i of lakes) band[i] = SEA;   // như lúc dựng: hồ chỉ lấy tầng của bờ và của hồ kề đã tính trước nó
    for (const i of lakes) {
      const x = i % W; let b = 3;
      for (const j of [x > 0 ? i - 1 : -1, x < W - 1 ? i + 1 : -1, i - W, i + W]) if (j >= 0 && j < N && band[j] !== SEA && band[j] < b) b = band[j];
      band[i] = b; wild[i] = BW[0] * b;
    }
    // Ô săn được của mỗi vùng × tầng (không tính hồ). Mảng mới (bản gốc giữ mảng cũ trong R.base).
    const bc = R.bandCells = all || !R.bandCells ? G.REGIONS.map(() => [[], [], [], []]) : R.bandCells.slice();
    if (all || !R.bandCells) { for (let i = 0; i < N; i++) if (region[i] !== SEA && feat[i] !== FE_LAKE) bc[region[i]][band[i]].push(i); }
    else for (const k of touchedReg) { bc[k] = [[], [], [], []]; for (const i of M.cellsOf[k]) if (feat[i] !== FE_LAKE) bc[k][band[i]].push(i); }
    R._tc = null; R._seaLines = null;
  };
  // Tính lại toàn bộ: mọi khu dân cư còn sống + mọi nhóm đường.
  G.wildFull = function (R) {
    const N = G.map.feat.length;
    R._src = new Map(); R._dirty = [];
    const wmin = R._wmin || (R._wmin = new Float32Array(N));
    wmin.fill(3.5);
    for (const s of R.settlements) { const f = G.wildOfSettlement(R, s); if (f) R._src.set('S' + s.id, f); }
    for (const [k, g] of G.roadGroups(R)) R._src.set(k, G.wildOfRoads(R, g));
    for (const f of R._src.values()) { const cs = f.cells, vs = f.vals; for (let k = 0; k < cs.length; k++) if (vs[k] < wmin[cs[k]]) wmin[cs[k]] = vs[k]; }
    G.wildCommit(R, true);
  };

  // ── Thế giới đang dùng ──
  G.useWorld = function (seed) {
    G.init();
    if (G.realm && G.realm.seed === seed) return G.realm;
    G.realm = G.buildRealm(G.map, seed);
    G.SET = G.realm.byId;
    const R = G.realm;
    G.indexRealm(R);
    if (R.check.errors.length) console.error('[Vạn Kiếp] lỗi thế giới:\n' + R.check.errors.join('\n'));
    return R;
  };
  // Bảng tra khu dân cư còn sống theo vùng (khu lớn nhất = đông dân đô thị nhất); dựng lại khi khu sụp / mới lập (js/dynamic.js).
  G.indexRealm = function (R) {
    R.inRegion = {};
    for (const s of R.settlements) if (s.tier !== 'ruin') (R.inRegion[s.region] = R.inRegion[s.region] || []).push(s);
    for (const k of Object.keys(R.inRegion)) R.inRegion[k].sort((a, b) => b.urban - a.urban);
  };
  G.settlementsIn = regionId => (G.realm && G.realm.inRegion[regionId]) || [];
  G.mainSettlement = regionId => G.settlementsIn(regionId)[0] || null;
  G.nationOf = s => s && s.nation >= 0 ? G.realm.nations[s.nation] : null;
  G.nationAtCell = i => { const k = G.realm.owner[i]; return k >= 0 ? G.realm.nations[k] : null; };
  G.nationAtPos = (x, y) => { const c = G.map.at(x, y); return c ? G.nationAtCell(c.cell) : null; };
  G.provinceAtCell = i => { const p = G.realm.provOf[i]; return p >= 0 ? G.realm.provinces[p] : null; };
  // Ô săn được của một khu (vùng × tầng) trong thế giới đang dùng; khu đầu tiên có ô của một vùng.
  G.zoneCells = zid => { const Z = G.ZONE[zid]; return !Z || !G.realm ? [] : Z.sea ? G.realm.seaBandCells[G.SEAS.indexOf(Z.region)][Z.index] : G.realm.bandCells[G.map.idx[Z.region.id]][Z.index]; };
  // Tầng biển của một ô biển (thế giới đang dùng).
  G.seaZoneAt = i => G.SEAS[G.map.sea[i]].zones[G.realm.seaBand[i]];
  // Vùng biển gần một khu dân cư ven biển (ô biển đầu tiên của bến): ngư dân làm ở tầng ven bờ của nó, thủy thủ ở tầng khơi.
  G.seaOf = s => s && s.seaCells ? G.SEAS[G.map.sea[s.seaCells[0]]] : null;
  G.firstZone = regionId => { const bc = G.realm.bandCells[G.map.idx[regionId]], i = bc.findIndex(a => a.length); return G.REGION[regionId].zones[Math.max(0, i)]; };
  G.popOf = s => s.urban + s.rural;
  // Chỗ ở trên bản đồ: trong khu (đô thị) hoặc một điểm ở vùng quê quanh khu, không rơi xuống nước.
  G.homePos = function (s, urban, rnd) {
    if (urban) { const x = s.x + (rnd() - .5) * 6, y = s.y + (rnd() - .5) * 6, c = G.map.at(x, y); return c && c.feature.id !== 'lake' ? [x, y] : [s.x, s.y]; }
    for (let k = 0; k < 10; k++) {
      const a = rnd() * Math.PI * 2, r = 8 + rnd() * 16, x = s.x + Math.cos(a) * r, y = s.y + Math.sin(a) * r, c = G.map.at(x, y);
      if (c && c.feature.id !== 'lake') return [x, y];
    }
    return [s.x, s.y];
  };
})(window.LifeSim);
