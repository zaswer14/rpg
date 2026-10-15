/* Vạn Kiếp — HÀNH TRÌNH (bước 5–6 của docs/03, mục 6 và 7.3).
 *   Tìm đường bộ: A* 8 hướng trên lưới chi phí đi bộ. Đường cái 0,5 / đường mòn 0,8 / lối nhỏ 1 mỗi ô, ngoài đường theo địa hình
 *   (G.FEATURES.cost); vượt sông không có cầu +6. Ô thuộc tầng bị khóa với nhân vật (Tier thấp nhất của khu > Tier + 1,
 *   Liều mạng: + 2) KHÔNG đi được, trừ khi thuê hộ tống: luật Tier giữ cả trên đường.
 *   Hải trình: A* trên ô biển giữa hai bến, 0,6 mỗi ô (× chậm của vùng biển); tàu chỉ vào tầng biển của loại tàu (G.SHIPS),
 *   và như đường bộ, không vào tầng biển bị khóa với nhân vật trừ khi đi tàu có lính hộ tống. Đảo chỉ tới được bằng tàu.
 *   Chuyến đi: đường bộ, hoặc đất → bến → biển → bến → đất khi rẻ hơn (tính khi đường bộ ≥ 8 ngày) hoặc khi không có đường bộ.
 *   Đi: 1 đơn vị chi phí = 0,25 ngày; lên tàu thêm 1 ngày chờ. Mỗi 10 ô xét gặp quái theo khu / tầng biển và địa hình của ô
 *   (trên đường × 0,3), tối đa 4 trận trên bộ, 3 trên biển.
 *   Qua biên giới trên đường thì có trạm: phí qua trạm, kẻ bị truy nã có thể bị bắt, Bộ Xương bị chặn ở nước săn Bộ Xương.
 *   Hộ tống: đoàn hộ tống (lính trên tàu) gánh các khúc qua tầng bị khóa (nhân vật không đánh); mỗi khúc 6% đoàn bỏ chạy và chuyến đi hỏng.
 *   Trên biển: bão theo vùng biển (có thể đắm tàu, dạt vào bờ gần nhất), cướp biển (gần nước có luật cướp phá), cảng cấm cập vì dịch,
 *   thuế cảng (luật sea_toll của nước có bến đến).
 */
window.LifeSim = window.LifeSim || {};
(function (G) {
  const SEA = 255;
  const D8 = [[1, 0, 1], [-1, 0, 1], [0, 1, 1], [0, -1, 1], [1, 1, 1.414], [-1, 1, 1.414], [1, -1, 1.414], [-1, -1, 1.414]];
  const AMBUSH = { forest: 1.2, jungle: 1.5, marsh: 1.2, mountain: 1.2, hills: 1.1 };
  const ROAD_COST = [0, 1, .8, .5];
  const WRECK = [.25, .12, .06];   // tỉ lệ bão thành đắm tàu theo loại tàu
  G.ROAD_VI = ['', 'lối nhỏ', 'đường mòn', 'đường cái'];

  const cellOf = (x, y) => { const c = G.map.at(x, y); return c ? c.cell : null; };
  const zoneAt = i => G.map.region[i] === SEA ? G.seaZoneAt(i) : G.REGIONS[G.map.region[i]].zones[G.realm.band[i]];
  const cx = i => (i % G.map.W + .5) * G.map.CS, cy = i => (Math.floor(i / G.map.W) + .5) * G.map.CS;

  // Bảng tính sẵn mỗi thế giới: chi phí đi bộ từng ô (Infinity = biển, hồ), chi phí đi tàu (Infinity = đất) và Tier thấp nhất của khu / tầng biển chứa ô.
  function tables() {
    const R = G.realm;
    if (R._tc) return R._tc;
    const M = G.map, N = M.W * M.H, cost = new Float32Array(N).fill(Infinity), sail = new Float32Array(N).fill(Infinity), lo = new Uint8Array(N);
    for (let i = 0; i < N; i++) {
      lo[i] = zoneAt(i).tier[0];
      if (M.region[i] === SEA) { sail[i] = .6 * (G.SEAS[M.sea[i]].slow || 1); continue; }
      const f = G.FEATURES[M.feat[i]];
      if (!isFinite(f.cost)) continue;
      cost[i] = R.road[i] ? ROAD_COST[R.road[i]] : f.cost + (M.river[i] ? 6 : 0);
    }
    return (R._tc = { cost, sail, lo });
  }

  // A* chung. sources: ô xuất phát; isGoal: đích; costOf(j): chi phí vào ô j (Infinity = không vào); h: ước lượng còn lại.
  // g phải là Float64: với Float32, giá trị lưu bị làm tròn lên nên "nd < g[j]" đúng mãi và ô bị đẩy lại vào hàng đợi không dứt.
  let buf = null;
  function astar(sources, goal, costOf, h) {
    const N = G.map.W * G.map.H, W = G.map.W, H = G.map.H;
    if (!buf || buf.g.length !== N) buf = { g: new Float64Array(N).fill(Infinity), prev: new Int32Array(N).fill(-1) };
    const g = buf.g, prev = buf.prev, touched = [], q = G.minHeap(4096);
    for (const s of sources) { g[s] = 0; touched.push(s); q.push(h(s), s); }
    let hit = -1;
    while (q.size) {
      const i = q.pop();
      if (goal(i)) { hit = i; break; }
      const gi = g[i], x = i % W, y = (i - x) / W;
      for (const [dx, dy, m] of D8) {
        const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
        const j = ny * W + nx, c = costOf(j);
        if (c === Infinity) continue;
        const nd = gi + c * m;
        if (nd < g[j]) { if (g[j] === Infinity) touched.push(j); g[j] = nd; prev[j] = i; q.push(nd + h(j), j); }
      }
    }
    const total = hit >= 0 ? g[hit] : Infinity, cells = [];
    if (hit >= 0) { for (let c = hit; c >= 0; c = prev[c]) cells.push(c); cells.reverse(); }
    for (const i of touched) { g[i] = Infinity; prev[i] = -1; }
    return hit >= 0 ? { cells, total } : null;
  }
  const lockInfo = (cells, cap) => {
    let locked = 0, lockedTier = 0, road = 0;
    for (const c of cells) { const z = zoneAt(c); if (z.tier[0] > cap) { locked++; lockedTier = Math.max(lockedTier, z.tier[1]); } if (G.realm.road[c]) road++; }
    return { locked, lockedTier, onRoad: road / cells.length };
  };

  // Đường bộ từ ô a tới ô b. Trả về { cells, cost, days, locked (số ô tầng khóa), lockedTier, onRoad (tỉ lệ ô trên đường), cap } hoặc null.
  G.capOf = S => G.tierOf(S.level) + (S.reckless ? 2 : 1);
  G.findRoute = function (a, b, S, opt = {}) {
    if (a == null || b == null) return null;
    const W = G.map.W, cap = G.capOf(S), T = tables(), TC = T.cost, LO = T.lo, esc = !!opt.escort;
    if (a === b) return { cells: [a], cost: 0, days: 0, locked: 0, lockedTier: 0, onRoad: 1, cap };
    const bx = b % W, by = Math.floor(b / W);
    const r = astar([a], i => i === b, j => (!esc && LO[j] > cap) ? Infinity : TC[j], i => Math.hypot(i % W - bx, Math.floor(i / W) - by) * .5);
    if (!r) return null;
    return { cells: r.cells, cost: r.total, days: Math.max(1, Math.round(r.total * .25)), ...lockInfo(r.cells, cap), cap };
  };
  G.escortFee = route => Math.round(route.days * 2 * (1 + route.lockedTier));

  // Hải trình giữa hai bến bằng tàu của bến đi (G.SHIPS[a.ship]). cells: bến đi, các ô biển, bến đến. Cache theo thế giới.
  G.findSeaRoute = function (a, b, S, opt = {}) {
    if (!a || !b || a === b || !a.seaCells || !b.seaCells) return null;
    const R = G.realm, cap = G.capOf(S), esc = !!opt.escort, key = `${a.id}>${b.id}|${cap}|${esc ? 1 : 0}`;
    const cache = R._sea || (R._sea = new Map());
    if (cache.has(key)) return cache.get(key);
    const W = G.map.W, T = tables(), ship = G.SHIPS[a.ship], band = R.seaBand, LO = T.lo, SAIL = T.sail;
    const ok = j => band[j] !== SEA && band[j] <= ship.maxBand && (esc || LO[j] <= cap);
    const goal = new Set(b.seaCells.filter(ok)), src = a.seaCells.filter(ok);
    let res = null;
    if (goal.size && src.length) {
      const bx = b.cell % W, by = Math.floor(b.cell / W);
      const r = astar(src, i => goal.has(i), j => ok(j) ? SAIL[j] : Infinity, i => Math.hypot(i % W - bx, Math.floor(i / W) - by) * .55);
      if (r) {
        const cells = [a.cell, ...r.cells, b.cell], cost = r.total + 1.2;
        res = { cells, cost, days: Math.max(1, Math.round(cost * .25)) + 1, ...lockInfo(r.cells, cap), cap, ship: a.ship, from: a, to: b };
      }
    }
    cache.set(key, res);
    return res;
  };

  // Bến gần một ô trên cùng khối đất, theo đường chim bay.
  const nearHarbors = (cell, k) => {
    const R = G.realm, m = R.mass[cell];
    return R.harbors.filter(h => h.mass === m).map(h => [h, Math.hypot(h.x - cx(cell), h.y - cy(cell))]).sort((p, q) => p[1] - q[1]).slice(0, k).map(p => p[0]);
  };
  // Chuyến đi bằng tàu từ ô from tới ô to: đất → bến → biển → bến → đất. Chỉ ghép cặp bến mà tàu của bến đi tới được bến đến
  // (cùng vùng nước theo tầng tàu, h.comp của realm.js): 3 bến đi gần nhất × 3 bến đến gần đích nhất trong số đó.
  // Đường bộ hai đầu không được qua tầng khóa. Đường bộ tới bến đến tính một lần mỗi bến.
  const linked = (a, b) => a !== b && b.comp[a.ship].some(v => a.comp[a.ship].includes(v));
  function seaPlan(S, from, to, esc) {
    let best = null;
    const leg = (a, b) => G.findRoute(a, b, S), legB = new Map();
    const dAll = nearHarbors(to, 99);
    const origins = nearHarbors(from, 99).filter(a => dAll.some(b => linked(a, b))).slice(0, 3);
    for (const a of origins) {
      const legA = leg(from, a.cell); if (!legA) continue;
      for (const b of dAll.filter(b => linked(a, b)).slice(0, 3)) {
        const sea = G.findSeaRoute(a, b, S, { escort: esc }); if (!sea) continue;
        if (!legB.has(b)) legB.set(b, leg(b.cell, to));
        const lb = legB.get(b); if (!lb) continue;
        const days = legA.days + sea.days + lb.days;
        if (!best || days < best.days) best = { legA, sea, legB: lb, days };
      }
    }
    if (best) best.fee = G.SHIPS[best.sea.ship].fare * best.sea.days + (esc ? G.escortFee(best.sea) : 0);
    return best;
  }

  // Nơi đến khi chuyển sang một vùng: dân thành thị vào khu lớn nhất; dân quê về vùng quê của làng / thôn đông dân quê nhất.
  // Không bốc ngẫu nhiên, để bảng vùng xem trước được đúng chuyến đi.
  function destOf(S, regionId) {
    if (S.undead) return null;
    const villages = G.settlementsIn(regionId).filter(s => s.tier === 'village' || s.tier === 'hamlet');
    return S.urban === false && villages.length ? villages.reduce((a, b) => b.rural > a.rural ? b : a) : G.mainSettlement(regionId);
  }

  // Kế hoạch đi tới một vùng (dùng cho bảng vùng và quyết định):
  //   { st, route, escort, fee } đi bộ; { st, sea, escort, fee, days } đi tàu; hoặc { fail: lý do }.
  G.planTrip = function (S, regionId) {
    const st = destOf(S, regionId), from = cellOf(S.pos[0], S.pos[1]);
    const bc = G.realm.bandCells[G.map.idx[regionId]], to = st ? st.cell : (bc.find(a => a.length) || [null])[0];
    if (from == null || to == null) return { fail: 'không xác định được nơi đi' };
    const oneMass = G.realm.mass[from] === G.realm.mass[to];   // khác khối đất (đảo): chỉ đi tàu
    const land = oneMass ? G.findRoute(from, to, S) : null;
    if (land && land.days < 8) return { st, route: land, escort: false, fee: 0 };
    const sea = seaPlan(S, from, to, false);
    if (land && (!sea || land.days <= sea.days)) return { st, route: land, escort: false, fee: 0 };
    if (sea) return { st, sea, escort: false, fee: sea.fee, days: sea.days };
    const landE = oneMass ? G.findRoute(from, to, S, { escort: true }) : null, seaE = seaPlan(S, from, to, true);
    if (landE && (!seaE || landE.days <= seaE.days)) return { st, route: landE, escort: true, fee: G.escortFee(landE) };
    if (seaE) return { st, sea: seaE, escort: true, fee: seaE.fee, days: seaE.days };
    return { fail: G.realm.mass[from] !== G.realm.mass[to] ? 'không có bến nào có tàu đi tới đó' : 'không có đường bộ hay hải trình' };
  };
  // Một dòng tả chuyến đi cho bảng vùng.
  G.tripText = function (plan) {
    if (!plan) return '';
    if (plan.fail) return `Không tới được: ${plan.fail}.`;
    if (plan.sea) {
      const p = plan.sea, ship = G.SHIPS[p.sea.ship];
      return `${p.days} ngày: ${ship.nameVi} từ ${p.sea.from.name} tới ${p.sea.to.name} (${p.sea.days} ngày biển${p.legA.days + p.legB.days ? `, ${p.legA.days + p.legB.days} ngày bộ` : ''}), vé ${G.coin(plan.fee)}`
        + (plan.escort ? '; hải trình qua tầng quá sức, giá đã gồm lính hộ tống' : '') + '.';
    }
    return `${plan.route.days} ngày đường, ${Math.round(plan.route.onRoad * 100)}% trên đường` + (plan.escort ? `; phải qua vùng quá sức, thuê hộ tống ${G.coin(plan.fee)}` : '') + '.';
  };

  const fights = X => ['teen', 'adult', 'elder'].includes(X.stage(X.S));

  // Đi bộ theo một dãy ô. Trả về { ok, lines } — ok = false: chết dọc đường hoặc phải quay về.
  function walk(X, cells, cap) {
    const S = X.S, lines = [], R = G.realm, M = G.map, canFight = fights(X);
    let nf = 0, prevOwner = R.owner[cells[0]];
    S.flags.onRoad = true;
    for (let k = 1; k < cells.length; k++) {
      const c = cells[k], own = R.owner[c];
      // Trạm biên giới: chỉ khi vào nước khác trên đường.
      if (own !== prevOwner && own >= 0 && R.road[c]) {
        const n = R.nations[own], stealth = S.mastery.Stealth || 0;
        if (!n.laws.includes('open_borders')) {
          if (S.undead && n.laws.includes('hunt_undead')) {
            if (X.rnd() < .3 + stealth / 150) lines.push(`Bạn lẻn qua trạm biên giới ${n.name} ban đêm.`);
            else { S.flags.onRoad = false; return { ok: false, lines: [...lines, `Trạm biên giới ${n.name} không cho Bộ Xương qua. Bạn quay về.`] }; }
          } else if (S.flags.wanted && S.flags.wanted[n.idx]) {
            if (X.rnd() < .4 + stealth / 150) lines.push(`Bạn lẻn qua trạm ${n.name}, nơi đang truy nã bạn.`);
            else { S.flags.onRoad = false; G.caught(X, n, 'trốn nghĩa vụ'); return { ok: false, lines: [...lines, `Bị nhận mặt ở trạm ${n.name}.`] }; }
          } else if (!S.undead) {
            const toll = Math.max(1, Math.round(n.tax * 40)); X.money(-toll);
            lines.push(`Qua trạm ${n.name}: phí ${G.coin(toll)}.`);
          }
        }
      }
      prevOwner = own;
      if (k % 10 !== 5 || !canFight || nf >= 4) continue;
      const z = zoneAt(c), locked = z.tier[0] > cap;
      if (locked) {
        if (X.chance(.06)) { S.flags.onRoad = false; X.add('hl', -X.int(5, 15)); return { ok: false, lines: [...lines, 'Đoàn hộ tống bỏ chạy khi thấy thứ trong bóng tối. Bạn lần đường về.'] }; }
        continue;
      }
      const feat = G.FEATURES[M.feat[c]].id;
      const p = .08 * (S.world.zonePop[z.id] ?? 1) * (R.road[c] ? .3 : 1) * (AMBUSH[feat] || 1);
      if (!X.chance(p)) continue;
      const enc = X.rollEncounter(z, { cell: c });
      if (!enc) continue;
      nf++;
      const rec = X.fight(enc, false);
      if (S.dead) return { ok: false, lines };   // onRoad giữ nguyên: đánh dấu chết dọc đường (sim.html đếm)
      lines.push(rec.win ? `Dọc đường hạ ${enc.s.nameVi}.` : `Dọc đường bị ${enc.s.nameVi} tấn công.`);
    }
    S.flags.onRoad = false;
    return { ok: true, lines };
  }

  // Ô đất gần nhất (không phải hồ) tính từ một ô biển: chỗ người đắm tàu dạt vào.
  function shoreFrom(c0) {
    const M = G.map, W = M.W, H = M.H, seen = new Set([c0]), q = [c0];
    for (let h = 0; h < q.length && h < 40000; h++) {
      const i = q[h], x = i % W, y = (i - x) / W;
      for (const [dx, dy] of D8.slice(0, 4)) {
        const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
        const j = ny * W + nx; if (seen.has(j)) continue; seen.add(j);
        if (M.region[j] !== SEA) { if (G.FEATURES[M.feat[j]].id !== 'lake') return j; continue; }
        q.push(j);
      }
    }
    return null;
  }
  // Nước có luật cướp phá hợp lệ và có bến trên vùng biển này (Liên Minh Cướp Biển M4 tính gấp đôi).
  const pirateNations = seaIdx => G.realm.nations.filter(n => n.laws.includes('raid_law') && G.realm.harbors.some(h => h.nation === n.idx && G.map.sea[h.seaCells[0]] === seaIdx));

  // Đi tàu theo một hải trình. Trả về { ok, lines, days, wreck? } — wreck: { at, cell, st } ô đắm và chỗ dạt vào bờ.
  // Quái: mỗi 10 ô xét .025 × mật độ × phục kích của vùng biển (tàu đông người, ít bị đánh hơn đi bộ ngoài đường), tối đa 3 trận.
  // Bão, cướp biển: một lần mỗi chuyến, tại một ô ngẫu nhiên của hải trình (vùng biển của ô đó), xác suất theo số ngày (tối đa × 2).
  function sail(X, route) {
    const S = X.S, R = G.realm, M = G.map, cells = route.cells, cap = route.cap, ship = G.SHIPS[route.ship], canFight = fights(X);
    const nameAt = c => R.seas[M.sea[c]].name, len = Math.min(2, route.days / 6);
    const lines = [`Bạn lên ${ship.nameVi} ở ${route.from.name}, ra ${nameAt(cells[1])}.`];
    let days = route.days, nf = 0;
    S.flags.atSea = true; S.flags.voyages = (S.flags.voyages || 0) + 1;
    for (let k = 1; k < cells.length - 1; k++) {
      if (k % 10 !== 5 || !canFight || nf >= 3) continue;
      const c = cells[k], z = G.seaZoneAt(c);
      if (z.tier[0] > cap) {
        if (X.chance(.06)) { S.flags.atSea = false; X.add('hl', -X.int(5, 15)); return { ok: false, days: Math.round(days / 2), lines: [...lines, `Thứ gì đó dưới ${z.nameVi} quấn lấy mũi tàu. Lính hộ tống không giữ nổi; thuyền trưởng quay về bến.`] }; }
        continue;
      }
      const p = .025 * (S.world.zonePop[z.id] ?? 1) * (G.SEAS[M.sea[c]].ambush || 1);
      if (!X.chance(p)) continue;
      const enc = X.rollEncounter(z, { cell: c });
      if (!enc) continue;
      nf++; S.flags.seaFights = (S.flags.seaFights || 0) + 1;
      const rec = X.fight(enc, false);
      if (S.dead) return { ok: false, lines, days };   // atSea giữ nguyên: chết trên biển
      lines.push(rec.win ? `Trên ${nameAt(c)}, bạn cùng thủy thủ hạ ${enc.s.nameVi}.` : `Trên ${nameAt(c)}, ${enc.s.nameVi} leo lên boong; bạn bị thương.`);
    }
    const at = cells[1 + Math.floor(X.rnd() * Math.max(1, cells.length - 2))], seaIdx = M.sea[at], SEAT = G.SEAS[seaIdx], seaName = R.seas[seaIdx].name;
    // Bão: theo vùng biển và độ dài chuyến; tàu nhỏ dễ đắm.
    if (X.chance(SEAT.storm * len)) {
      S.flags.storms = (S.flags.storms || 0) + 1;
      if (X.chance(WRECK[route.ship])) {
        const land = shoreFrom(at);
        S.flags.wrecks = (S.flags.wrecks || 0) + 1;
        const R0 = G.RACES[S.race], pDie = S.undead ? 0 : R0.construct ? .5 : G.clamp(.3 - (S.mastery.Body || 0) / 400, .1, .3);
        if (land == null || X.chance(pDie)) { X.die({ id: 'shipwreck', text: `đắm tàu trong bão ở ${seaName}` }); return { ok: false, lines, days }; }
        S.flags.atSea = false;
        X.add('hl', -X.int(10, 25)); X.money(-Math.round(Math.max(0, S.gold) * .5));
        const st = R.settlements.filter(s => s.tier !== 'ruin' && R.mass[s.cell] === R.mass[land]).sort((a, b) => Math.hypot(a.x - cx(land), a.y - cy(land)) - Math.hypot(b.x - cx(land), b.y - cy(land)))[0] || null;
        lines.push(S.undead ? `Bão đánh chìm tàu giữa ${seaName}. Bộ Xương không chết đuối: bạn đi bộ dưới đáy biển vào bờ.` : `Bão đánh chìm tàu giữa ${seaName}. Bạn bám mảnh ván, dạt vào bờ, mất nửa túi bạc.`);
        return { ok: true, lines, days: Math.round(days * .6), wreck: { at, cell: land, st } };
      }
      const d = X.int(2, 5); days += d; X.add('hl', -X.int(2, 6));
      lines.push(`Bão trên ${seaName} giữ tàu thêm ${d} ngày.`);
    }
    // Cướp biển: gần bến của nước có luật cướp phá; tàu viễn dương có súng nên ít bị đánh.
    const pir = pirateNations(seaIdx);
    const pPir = (.03 + pir.reduce((a, n) => a + (n.template === 'M4' ? .2 : .1), 0)) * (route.ship === 2 ? .5 : 1) * len;
    if (!S.undead && X.chance(pPir)) {
      S.flags.pirates = (S.flags.pirates || 0) + 1;
      const who = pir.length ? `Cướp biển của ${X.pick(pir).name}` : 'Một tàu cướp biển';
      if (canFight && X.power(S) > 1 + X.rnd()) { S.fame += 1; lines.push(`${who} áp mạn. Bạn cùng thủy thủ đẩy lui chúng.`); }
      else { const loss = Math.min(Math.max(0, S.gold), X.int(15, 60)); X.money(-loss); X.add('hl', -X.int(3, 10)); lines.push(`${who} áp mạn, lấy ${G.coin(loss)} của bạn.`); }
    }
    S.flags.atSea = false;
    // Bến đến: cấm cập vì dịch (cách ly trên tàu), thuế cảng.
    const to = route.to, rsTo = S.world.regions[to.region];
    if (rsTo && rsTo.plague > 0) { days += 3; lines.push(`${to.name} đang có dịch, cấm cập bến. Tàu neo ngoài khơi ba ngày mới cho lên.`); }
    const nTo = to.nation >= 0 ? R.nations[to.nation] : null;
    if (nTo && nTo.laws.includes('sea_toll') && !S.undead) { const toll = Math.max(2, Math.round(nTo.tax * 30)); X.money(-toll); lines.push(`Thuế cảng ${to.name}: ${G.coin(toll)}.`); }
    lines.push(`Tàu cập ${to.name}.`);
    return { ok: true, lines, days };
  }

  // Đi tàu theo kế hoạch: đường bộ tới bến, hải trình, đường bộ từ bến tới nơi đến.
  function voyage(X, p) {
    const S = X.S, lines = [], cap = p.sea.cap;
    let days = 0;
    if (p.legA.cells.length > 1) { const r = walk(X, p.legA.cells, cap); lines.push(...r.lines); days += p.legA.days; if (!r.ok) return { ok: false, lines, days }; }
    const r = sail(X, p.sea); lines.push(...r.lines); days += r.days;
    if (!r.ok || r.wreck) return { ...r, lines, days };
    if (p.legB.cells.length > 1) { const r2 = walk(X, p.legB.cells, cap); lines.push(...r2.lines); days += p.legB.days; if (!r2.ok) return { ok: false, lines, days }; }
    return { ok: true, lines, days };
  }

  // Di chuyển sang vùng khác (quyết định, nút trên bảng vùng, áp giải). opt.escort: cho thuê hộ tống nếu cần và đủ tiền;
  // opt.force: không có đường thì vẫn tới (áp giải). Trả về câu kể, hoặc null nếu chết dọc đường.
  G.moveTo = function (X, regionId, opt = {}) {
    const S = X.S, plan = G.planTrip(S, regionId);
    let to = G.REGION[regionId], lines = [], days = 0, go = !plan.fail, st = plan.st, pos = null;
    if (plan.fail) { if (!opt.force) return `Không tới được ${to.nameVi}: ${plan.fail}.`; go = false; }
    else if (plan.escort) {
      if (opt.escort !== false && S.gold >= plan.fee) { X.money(-plan.fee); S.flags.escorts = (S.flags.escorts || 0) + 1; lines.push(plan.sea ? `Bạn trả ${G.coin(plan.fee)} đi tàu có lính hộ tống.` : `Bạn thuê hộ tống ${G.coin(plan.fee)}.`); }
      else if (opt.force) go = false;   // bị áp giải: lính đưa đi, không tự đi qua vùng quá sức
      else return `Đường tới ${to.nameVi} phải qua vùng quá sức bạn; thuê hộ tống cần ${G.coin(plan.fee)}.`;
    } else if (plan.sea && !S.undead) {
      // Vé tàu; không đủ bạc thì làm công trên tàu trả phần còn thiếu.
      const pay = Math.min(Math.max(0, S.gold), plan.fee); X.money(-pay);
      if (pay < plan.fee) lines.push('Thiếu tiền vé, bạn làm công dưới khoang trả phần còn lại.');
    }
    if (go) {
      S.flags.trips = (S.flags.trips || 0) + 1;
      const res = plan.sea ? voyage(X, plan.sea) : walk(X, plan.route.cells, plan.route.cap);
      if (S.dead) return null;
      days = plan.sea ? res.days : plan.route.days;
      // Vẽ đường đi: lấy mẫu mỗi 8 ô (đi tàu: mọi chặng; đắm tàu: tới chỗ dạt vào bờ).
      let all = plan.sea ? [...plan.sea.legA.cells, ...plan.sea.sea.cells, ...plan.sea.legB.cells] : plan.route.cells;
      if (res.wreck) all = all.slice(0, all.indexOf(res.wreck.at) + 1);
      for (let k = 0; k < all.length; k += 8) S.path2.push([cx(all[k]), cy(all[k])]);
      if (!res.ok) return [...lines, ...res.lines].join(' ');
      lines.push(...res.lines);
      if (res.wreck) { st = res.wreck.st; pos = [cx(res.wreck.cell), cy(res.wreck.cell)]; to = G.REGIONS[G.map.region[res.wreck.cell]]; regionId = to.id; }
      if (!S.undead && !plan.sea) X.money(-Math.round(days * .3));   // ăn ở dọc đường (đi tàu: đã gồm trong vé)
    }
    // Tới nơi.
    S.loc = regionId;
    S.home = { region: regionId, settlement: st ? st.id : null };
    S.urban = !pos && !!st && st.tier !== 'village' && st.tier !== 'hamlet' && G.TIER_RANK[st.tier] <= 2;
    S.pos = pos || (st ? G.homePos(st, S.urban, X.rnd) : G.map.pointIn(regionId, 0, X.rnd));
    const nat = G.nationAtPos(S.pos[0], S.pos[1]); S.nation = nat ? nat.idx : null;
    S.path2.push(S.pos);
    if (S.undead) S.flags.townQ = true;
    if (S.work && !S.undead && !G.workOK(S, S.work)) { S.work = null; S.flags.workQ = true; }   // nơi mới không có công trình / vai trò cho nghề cũ
    S.zoneManual = false;
    X.ensureZone();
    const where = st && !pos ? `${st.name}, ${to.nameVi}` : to.nameVi;
    return `Bạn tới ${where}${nat ? ` (${nat.name})` : ''}${days ? ` sau ${days} ngày` : ''}.` + (lines.length ? ' ' + lines.join(' ') : '');
  };

  // Hải trình từ cảng gần nhân vật nhất (ưu tiên cảng có tàu buôn trở lên và có tuyến; bến bên vũng biển kín không đi đâu được)
  // tới các bến khác (chế độ xem Biển). Cache theo bến và sức nhân vật.
  G.seaLinesFrom = function (S) {
    const from = cellOf(S.pos[0], S.pos[1]); if (from == null || !G.realm.harbors.length) return null;
    const near = nearHarbors(from, 99), goes = h => G.realm.harbors.some(b => b.ship >= 1 && linked(h, b));
    const a = near.find(h => h.ship >= 1 && goes(h)) || near.find(goes) || near[0]; if (!a) return null;
    const R = G.realm, key = `${a.id}|${G.capOf(S)}`;
    if (R._seaLines && R._seaLines.key === key) return R._seaLines;
    const routes = R.harbors.filter(b => (b.ship >= 1 || b.mass !== a.mass) && linked(a, b)).map(b => G.findSeaRoute(a, b, S)).filter(Boolean);
    return (R._seaLines = { key, from: a, routes });
  };
})(window.LifeSim);
