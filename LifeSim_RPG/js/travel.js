/* Vạn Kiếp — HÀNH TRÌNH (bước 5 của research/03, mục 6).
 *   Tìm đường: A* 8 hướng trên lưới chi phí đi bộ. Đường cái 0,5 / đường mòn 0,8 / lối nhỏ 1 mỗi ô, ngoài đường theo địa hình
 *   (G.FEATURES.cost); vượt sông không có cầu +6. Ô thuộc tầng bị khóa với nhân vật (Tier thấp nhất của khu > Tier + 1,
 *   Liều mạng: + 2) KHÔNG đi được, trừ khi thuê hộ tống: luật Tier giữ cả trên đường.
 *   Đi: 1 đơn vị chi phí = 0,25 ngày. Mỗi 10 ô xét gặp quái theo khu và địa hình của ô (trên đường × 0,3), tối đa 4 trận.
 *   Qua biên giới trên đường thì có trạm: phí qua trạm, kẻ bị truy nã có thể bị bắt, Bộ Xương bị chặn ở nước săn Bộ Xương.
 *   Hộ tống: đoàn hộ tống gánh các khúc qua tầng bị khóa (nhân vật không đánh); mỗi khúc 6% đoàn bỏ chạy và chuyến đi hỏng.
 *   Đảo không có đường bộ: đi thuyền theo tuyến biển (G.SEA_ROUTES), 6 ngày, chưa có gặp quái biển (bước đi biển).
 */
window.LifeSim = window.LifeSim || {};
(function (G) {
  const D8 = [[1, 0, 1], [-1, 0, 1], [0, 1, 1], [0, -1, 1], [1, 1, 1.414], [-1, 1, 1.414], [1, -1, 1.414], [-1, -1, 1.414]];
  const AMBUSH = { forest: 1.2, jungle: 1.5, marsh: 1.2, mountain: 1.2, hills: 1.1 };
  const ROAD_COST = [0, 1, .8, .5];
  G.ROAD_VI = ['', 'lối nhỏ', 'đường mòn', 'đường cái'];

  const cellOf = (x, y) => { const c = G.map.at(x, y); return c ? c.cell : null; };
  const zoneAt = i => { const r = G.REGIONS[G.map.region[i]]; return r.zones[G.realm.band[i]]; };

  // Bảng tính sẵn mỗi thế giới: chi phí đi từng ô (Infinity = biển, hồ) và Tier thấp nhất của khu chứa ô.
  function tables() {
    const R = G.realm;
    if (R._tc) return R._tc;
    const M = G.map, N = M.W * M.H, cost = new Float32Array(N).fill(Infinity), lo = new Uint8Array(N);
    for (let i = 0; i < N; i++) {
      if (M.region[i] === 255) continue;
      const f = G.FEATURES[M.feat[i]];
      lo[i] = zoneAt(i).tier[0];
      if (!isFinite(f.cost)) continue;
      cost[i] = R.road[i] ? ROAD_COST[R.road[i]] : f.cost + (M.river[i] ? 6 : 0);
    }
    return (R._tc = { cost, lo });
  }

  // A* từ ô a tới ô b. Trả về { cells, cost, days, locked (số ô tầng khóa), lockedTier, onRoad (tỉ lệ ô trên đường) } hoặc null.
  let buf = null;
  G.capOf = S => G.tierOf(S.level) + (S.reckless ? 2 : 1);
  G.findRoute = function (a, b, S, opt = {}) {
    if (a == null || b == null) return null;
    const M = G.map, W = M.W, H = M.H, N = W * H, cap = G.capOf(S);
    // Mảng dùng lại giữa các lần tìm (chỉ trả về Infinity những ô đã chạm).
    if (!buf || buf.g.length !== N) buf = { g: new Float32Array(N).fill(Infinity), prev: new Int32Array(N).fill(-1) };
    const g = buf.g, prev = buf.prev, touched = [a], q = G.minHeap(4096), T = tables(), TC = T.cost, LO = T.lo, esc = !!opt.escort;
    const bx = b % W, by = Math.floor(b / W), h = i => Math.hypot(i % W - bx, Math.floor(i / W) - by) * .5;
    g[a] = 0; q.push(h(a), a);
    while (q.size) {
      const i = q.pop();
      if (i === b) break;
      const gi = g[i], x = i % W, y = (i - x) / W;
      for (const [dx, dy, m] of D8) {
        const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
        const j = ny * W + nx, c = TC[j];
        if (c === Infinity || (!esc && LO[j] > cap)) continue;   // biển, hồ; tầng bị khóa (trừ khi có hộ tống)
        const nd = gi + c * m;
        if (nd < g[j]) { if (g[j] === Infinity) touched.push(j); g[j] = nd; prev[j] = i; q.push(nd + h(j), j); }
      }
    }
    const total = g[b], cells = [];
    if (isFinite(total)) { for (let c = b; c >= 0; c = prev[c]) cells.push(c); cells.reverse(); }
    for (const i of touched) { g[i] = Infinity; prev[i] = -1; }
    if (!isFinite(total)) return null;
    let locked = 0, lockedTier = 0, road = 0;
    for (const c of cells) { const z = zoneAt(c); if (z.tier[0] > cap) { locked++; lockedTier = Math.max(lockedTier, z.tier[1]); } if (G.realm.road[c]) road++; }
    return { cells, cost: total, days: Math.max(1, Math.round(total * .25)), locked, lockedTier, onRoad: road / cells.length, cap };
  };
  G.escortFee = route => Math.round(route.days * 2 * (1 + route.lockedTier));

  // Nơi đến khi chuyển sang một vùng: dân thành thị vào khu lớn nhất; dân quê về vùng quê của làng / thôn đông dân quê nhất.
  // Không bốc ngẫu nhiên, để bảng vùng xem trước được đúng chuyến đi.
  function destOf(S, regionId) {
    if (S.undead) return null;
    const villages = G.settlementsIn(regionId).filter(s => s.tier === 'village' || s.tier === 'hamlet');
    return S.urban === false && villages.length ? villages.reduce((a, b) => b.rural > a.rural ? b : a) : G.mainSettlement(regionId);
  }

  // Kế hoạch đi tới một vùng (dùng cho bảng vùng và quyết định): { st, route, escort, fee, boat } hoặc { fail: lý do }.
  G.planTrip = function (S, regionId) {
    const st = destOf(S, regionId), from = cellOf(S.pos[0], S.pos[1]);
    const bc = G.realm.bandCells[G.map.idx[regionId]], to = st ? st.cell : (bc.find(a => a.length) || [null])[0];
    let route = G.findRoute(from, to, S);
    if (route) return { st, route, escort: false, fee: 0 };
    const r2 = G.findRoute(from, to, S, { escort: true });
    if (r2) return { st, route: r2, escort: true, fee: G.escortFee(r2) };
    const sea = (G.SEA_ROUTES || []).some(([a, b]) => (a === S.loc && b === regionId) || (b === S.loc && a === regionId));
    if (sea) return { st, boat: true, days: 6, fee: 0 };
    return { fail: 'không có đường bộ hay tuyến thuyền' };
  };

  // Đi theo một kế hoạch. Trả về { ok, lines } — ok = false: chết dọc đường hoặc phải quay về.
  function walk(X, plan) {
    const S = X.S, lines = [], R = G.realm, M = G.map, cells = plan.route.cells, cap = plan.route.cap;
    const fights = ['teen', 'adult', 'elder'].includes(X.stage(S));
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
            lines.push(`Qua trạm ${n.name}: phí ${toll} bạc.`);
          }
        }
      }
      prevOwner = own;
      if (k % 10 !== 5 || !fights || nf >= 4) continue;
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

  // Di chuyển sang vùng khác (quyết định, nút trên bảng vùng, áp giải). opt.escort: cho thuê hộ tống nếu cần và đủ tiền;
  // opt.force: không có đường thì vẫn tới (áp giải). Trả về câu kể, hoặc null nếu chết dọc đường.
  G.moveTo = function (X, regionId, opt = {}) {
    const S = X.S, to = G.REGION[regionId];
    const plan = G.planTrip(S, regionId);
    let lines = [], days = 0, canWalk = !plan.fail && !plan.boat;
    if (plan.fail) { if (!opt.force) return `Không tới được ${to.nameVi}: ${plan.fail}.`; }
    else if (plan.boat) { days = plan.days; lines.push(`Bạn đi thuyền ${days} ngày.`); X.money(-Math.min(Math.max(S.gold, 0), 12)); }
    else if (plan.escort) {
      if (opt.escort !== false && S.gold >= plan.fee) { X.money(-plan.fee); S.flags.escorts = (S.flags.escorts || 0) + 1; lines.push(`Bạn thuê hộ tống ${plan.fee} bạc.`); }
      else if (opt.force) canWalk = false;   // bị áp giải: lính đưa đi, không tự đi qua vùng quá sức
      else return `Đường tới ${to.nameVi} phải qua vùng quá sức bạn; thuê hộ tống cần ${plan.fee} bạc.`;
    }
    if (canWalk) {
      S.flags.trips = (S.flags.trips || 0) + 1;
      const res = walk(X, plan);
      if (S.dead) return null;
      days = plan.route.days;
      // Vẽ đường đi: lấy mẫu mỗi 8 ô.
      const W = G.map.W, CS = G.map.CS;
      plan.route.cells.forEach((c, k) => { if (k % 8 === 0) S.path2.push([(c % W + .5) * CS, (Math.floor(c / W) + .5) * CS]); });
      if (!res.ok) return [...lines, ...res.lines].join(' ');
      lines.push(...res.lines);
      if (!S.undead) X.money(-Math.round(days * .3));   // ăn ở dọc đường
    }
    // Tới nơi.
    const st = plan.st;
    S.loc = regionId;
    S.home = { region: regionId, settlement: st ? st.id : null };
    S.urban = !!st && st.tier !== 'village' && st.tier !== 'hamlet' && G.TIER_RANK[st.tier] <= 2;
    S.pos = st ? G.homePos(st, S.urban, X.rnd) : G.map.pointIn(regionId, 0, X.rnd);
    const nat = G.nationAtPos(S.pos[0], S.pos[1]); S.nation = nat ? nat.idx : null;
    S.path2.push(S.pos);
    if (S.undead) S.flags.townQ = true;
    if (S.work && !S.undead && !G.workOK(S, S.work)) { S.work = null; S.flags.workQ = true; }   // nơi mới không có công trình / vai trò cho nghề cũ
    S.zoneManual = false;
    X.ensureZone();
    const where = st ? `${st.name}, ${to.nameVi}` : to.nameVi;
    return `Bạn tới ${where}${nat ? ` (${nat.name})` : ''}${days ? ` sau ${days} ngày` : ''}.` + (lines.length ? ' ' + lines.join(' ') : '');
  };
})(window.LifeSim);
