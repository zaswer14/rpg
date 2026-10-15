/* Vạn Kiếp — bản đồ đại lục raster (khung 1200 × 900, mỗi ô 4px → 300 × 225 ô).
 * Lớp 1–2 của research/03:
 *   VÙNG   ô thuộc vùng có khoảng cách (đã bẻ cong bằng noise) chia bán kính nhỏ nhất (Voronoi có trọng số); quá ngưỡng bờ thì là biển.
 *   KHU    xếp ô theo khoảng cách tới khu dân cư chính; 45% gần nhất = khu ven, 35% kế = khu sâu, 20% xa nhất = lõi.
 *   TRƯỜNG độ cao, độ ẩm (noise + độ lệch biome trong G.TERRAIN, chuẩn hóa thành phân vị 0–1 trên đất), nhiệt (vĩ độ − độ cao).
 *   SÔNG   priority-flood từ bờ biển → mỗi ô có ô hạ lưu (recv); dồn nước mưa theo độ ẩm; ô đủ lưu lượng là sông.
 *   HỒ     chỗ trũng bị lấp khi flood mà có sông chảy qua.
 *   ĐẶC TRƯNG mỗi ô một trong G.FEATURES (đồng trống, đồi, rừng, rừng rậm, đầm, núi, hồ).
 *   BIỂN   ô biển chia 7 vùng biển theo điểm neo (G.SEAS); tầng biển theo độ hoang biển tính ở realm.js.
 * Bản đồ hoàn toàn suy ra từ G.REGIONS + G.TERRAIN + seed cố định, nên không cần lưu.
 */
window.LifeSim = window.LifeSim || {};
(function (G) {
  const SEA = 255, NO = -1;
  const FW = 1200, FH = 900;
  const FE = { open: 0, hills: 1, forest: 2, jungle: 3, marsh: 4, mountain: 5, lake: 6 };
  // Ngưỡng đặc trưng trên trường đã chuẩn hóa (phân vị trên đất). Chỉnh ở đây rồi xem map.stats.
  // Với Varen (seed 'varen'): núi ~10%, đồi ~11%, rừng ~29%, rừng rậm ~5%, đầm ~8%, hồ ~2%, ~19 hệ sông.
  const TH = G.MAP_TH = { mountain: .90, hills: .72, marsh: { moist: .86, elev: .32 }, jungle: { moist: .62, temp: .64 }, forest: .52, forestBiome: .30,
    riverFlow: 28, riverMin: 25, lakeDepth: .02, lakeMax: 160, meander: .1 };
  const N8 = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, 1], [1, -1], [-1, -1]];

  // Hàng đợi ưu tiên (min-heap) cho priority-flood và các phép loang theo chi phí (realm.js). Tự nới khi đầy.
  const heap = G.minHeap = function (n) {
    let key = new Float32Array(Math.max(16, n)), val = new Int32Array(Math.max(16, n)), size = 0, lastKey = 0;
    return {
      get size() { return size; },
      get lastKey() { return lastKey; },   // khóa của phần tử vừa pop
      push(k, v) {
        if (size === key.length) { const k2 = new Float32Array(size * 2), v2 = new Int32Array(size * 2); k2.set(key); v2.set(val); key = k2; val = v2; }
        let i = size++;
        while (i > 0) { const p = (i - 1) >> 1; if (key[p] <= k) break; key[i] = key[p]; val[i] = val[p]; i = p; }
        key[i] = k; val[i] = v;
      },
      pop() {
        lastKey = key[0];
        const top = val[0], k = key[--size], v = val[size]; let i = 0;
        for (;;) {
          let c = 2 * i + 1; if (c >= size) break;
          if (c + 1 < size && key[c + 1] < key[c]) c++;
          if (key[c] >= k) break;
          key[i] = key[c]; val[i] = val[c]; i = c;
        }
        key[i] = k; val[i] = v; return top;
      }
    };
  };

  G.buildMap = function (seed = 'varen') {
    const CS = 4, W = FW / CS, H = FH / CS, N = W * H;
    const warp = G.noise2(seed + ':warp'), coastN = G.noise2(seed + ':coast'), hN = G.noise2(seed + ':h'), zN = G.noise2(seed + ':zone'), mN = G.noise2(seed + ':moist');
    const R = G.REGIONS, region = new Uint8Array(N).fill(SEA), zone = new Uint8Array(N).fill(SEA);
    const hraw = new Float32Array(N), inland = new Float32Array(N);
    const inb = (x, y) => x >= 0 && y >= 0 && x < W && y < H;

    // ── Vùng ──
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const i = y * W + x, px = (x + .5) * CS, py = (y + .5) * CS;
      // Bẻ cong hai tầng: tầng lớn làm biên vùng uốn lượn, tầng nhỏ làm răng cưa.
      const wx = px + (warp(px / 150, py / 150) - .5) * 190 + (warp(px / 45 + 5.1, py / 45 + 9.3) - .5) * 46;
      const wy = py + (warp(px / 150 + 31.7, py / 150 + 17.3) - .5) * 190 + (warp(px / 45 + 13.7, py / 45 + 2.9) - .5) * 46;
      let best = Infinity, bi = -1, isl = Infinity;
      for (let k = 0; k < R.length; k++) { const d = Math.hypot(wx - R[k].x, wy - R[k].y) / R[k].r; if (d < best) { best = d; bi = k; } if (R[k].island && d < isl) isl = d; }
      // Ngưỡng bờ > 1 để lấp eo biển giữa các vùng; sát mép khung thì chìm xuống biển.
      const edge = Math.min(px, py, W * CS - px, H * CS - py);
      const coast = 1.22 + (coastN(px / 70 + 7, py / 70 + 3, 4) - .5) * .8 - Math.max(0, (36 - edge) / 36) * .9;
      hraw[i] = hN(px / 70, py / 70, 4);
      // Đảo: chỉ phần trong bán kính của vùng đảo; đất vùng khác lùi ra ngoài 1,32 bán kính đảo, để lại eo biển (chỉ đi tàu).
      if (best < coast && !(R[bi].island && best > 1.0) && !(!R[bi].island && isl < 1.32)) { region[i] = bi; inland[i] = G.clamp(1 - best / coast, 0, 1); }
    }
    const land = []; for (let i = 0; i < N; i++) if (region[i] !== SEA) land.push(i);

    // ── Khu ──
    // Xếp ô theo khoảng cách tới điểm neo của vùng (anchor) dịch về phía lòng đại lục, cộng noise.
    const cellsOf = R.map(() => []);
    for (const i of land) cellsOf[region[i]].push(i);
    const CX = 600 / CS, CY = 470 / CS;
    R.forEach((reg, k) => {
      let ax = reg.anchor[0] / CS, ay = reg.anchor[1] / CS;
      const dx = CX - ax, dy = CY - ay, dl = Math.hypot(dx, dy);
      if (dl > 1) { const push = Math.min(dl, reg.r / CS * .5); ax += dx / dl * push; ay += dy / dl * push; }
      const list = cellsOf[k].map(i => { const x = i % W, y = (i - x) / W; return [i, Math.hypot(x - ax, y - ay) + (zN(x / 14, y / 14, 3) - .5) * 26 + hraw[i] * 4]; }).sort((a, b) => a[1] - b[1]);
      list.forEach(([i], n) => { const q = n / list.length; zone[i] = q < .45 ? 0 : q < .8 ? 1 : 2; });
    });

    // ── Khoảng cách tới bờ: trên biển (cho màu biển, tầng biển sau này) và trên đất (cho độ ẩm) ──
    const shore = new Uint8Array(N).fill(99), dCoast = new Uint8Array(N).fill(99);
    const bfs = (dist, seeds, inside, cap) => {
      const q = seeds.slice(); for (const i of q) dist[i] = 0;
      for (let h = 0; h < q.length; h++) {
        const i = q[h], x = i % W, y = (i - x) / W, d = dist[i] + 1; if (d > cap) continue;
        for (const [ox, oy] of N8.slice(0, 4)) { const nx = x + ox, ny = y + oy; if (!inb(nx, ny)) continue; const j = ny * W + nx; if (inside(j) && dist[j] > d) { dist[j] = d; q.push(j); } }
      }
    };
    bfs(shore, land, j => region[j] === SEA, 40);
    const coastLand = land.filter(i => { const x = i % W, y = (i - x) / W; return N8.slice(0, 4).some(([ox, oy]) => !inb(x + ox, y + oy) || region[(y + oy) * W + x + ox] === SEA); });
    bfs(dCoast, coastLand, j => region[j] !== SEA, 60);

    // ── Độ lệch biome, làm mượt qua biên vùng (2 lượt box blur bán kính 6 ô, chỉ tính ô đất) ──
    const T = R.map(r => G.TERRAIN[r.biome] || { elev: 0, moist: 0, temp: 0, no: [] });
    const blur = (src, r) => {
      const tmp = new Float32Array(N), out = new Float32Array(N);
      for (let y = 0; y < H; y++) { let s = 0, c = 0; for (let x = -r; x < W + r; x++) {
        const a = x + r, b = x - r - 1;
        if (a < W && region[y * W + a] !== SEA) { s += src[y * W + a]; c++; }
        if (b >= 0 && region[y * W + b] !== SEA) { s -= src[y * W + b]; c--; }
        if (x >= 0 && x < W) tmp[y * W + x] = c ? s / c : 0; } }
      for (let x = 0; x < W; x++) { let s = 0, c = 0; for (let y = -r; y < H + r; y++) {
        const a = y + r, b = y - r - 1;
        if (a < H && region[a * W + x] !== SEA) { s += tmp[a * W + x]; c++; }
        if (b >= 0 && region[b * W + x] !== SEA) { s -= tmp[b * W + x]; c--; }
        if (y >= 0 && y < H) out[y * W + x] = c ? s / c : 0; } }
      return out;
    };
    const field = key => { let f = new Float32Array(N); for (const i of land) f[i] = T[region[i]][key] || 0; f = blur(f, 6); return blur(f, 6); };
    const bE = field('elev'), bM = field('moist'), bT = field('temp');

    // Chuẩn hóa thành phân vị trên đất: ngưỡng đặc trưng = tỉ lệ diện tích, không phụ thuộc phân bố của noise.
    const equalize = raw => { const out = new Float32Array(N), order = land.slice().sort((a, b) => raw[a] - raw[b]); order.forEach((i, n) => { out[i] = n / (order.length - 1); }); return out; };

    // ── Độ cao ──
    const eraw = new Float32Array(N);
    for (const i of land) { const s = inland[i]; eraw[i] = .55 * hraw[i] + .3 * s * s * (3 - 2 * s) + bE[i]; }
    const elev = equalize(eraw);

    // ── Độ ẩm (trước sông) ──
    const mraw = new Float32Array(N);
    for (const i of land) { const x = i % W, y = (i - x) / W; mraw[i] = mN(x / 22, y / 22, 3) + .3 * Math.max(0, 1 - dCoast[i] / 14) + bM[i] - .12 * elev[i]; }
    let moist = equalize(mraw);

    // ── Sông: priority-flood từ bờ ──
    // Khóa ưu tiên = độ cao đã lấp + chút noise mượt: trên chỗ bằng (lòng chảo đã lấp) sông uốn theo noise thay vì chạy thẳng.
    const rN = G.noise2(seed + ':river'), jit = new Float32Array(N);
    for (const i of land) { const x = i % W, y = (i - x) / W; jit[i] = rN(x / 9, y / 9, 2) * TH.meander; }
    const filled = new Float32Array(N), recv = new Int32Array(N).fill(NO), seen = new Uint8Array(N), order = [];
    const pq = heap(land.length);
    for (const i of coastLand) { filled[i] = elev[i]; seen[i] = 1; pq.push(elev[i] + jit[i], i); }
    while (pq.size) {
      const c = pq.pop(); order.push(c);
      const x = c % W, y = (c - x) / W;
      for (const [ox, oy] of N8) {
        const nx = x + ox, ny = y + oy; if (!inb(nx, ny)) continue;
        const j = ny * W + nx; if (seen[j] || region[j] === SEA) continue;
        seen[j] = 1; filled[j] = Math.max(elev[j], filled[c] + 1e-5); recv[j] = c; pq.push(filled[j] + jit[j], j);
      }
    }
    // Dồn nước: mưa theo độ ẩm, chảy từ cao xuống ô hạ lưu.
    const flow = new Float32Array(N);
    for (const i of land) flow[i] = .15 + moist[i] * moist[i];
    for (let k = order.length - 1; k >= 0; k--) { const i = order[k]; if (recv[i] !== NO) flow[recv[i]] += flow[i]; }
    const river = new Uint8Array(N);
    for (const i of land) if (flow[i] >= TH.riverFlow) river[i] = 1;
    // Bỏ hệ sông quá ngắn: tính theo cửa sông (ô sông không có hạ lưu là sông) — đếm số ô sông thuộc hệ.
    const mouth = new Int32Array(N).fill(NO), sysSize = new Map();
    for (const i of order) if (river[i]) { const r = recv[i]; mouth[i] = r !== NO && river[r] ? mouth[r] : i; sysSize.set(mouth[i], (sysSize.get(mouth[i]) || 0) + 1); }
    for (const i of land) if (river[i] && sysSize.get(mouth[i]) < TH.riverMin) river[i] = 0;

    // ── Hồ: chỗ trũng bị lấp (filled > elev) mà có sông chảy qua ──
    const feat = new Uint8Array(N).fill(FE.open), lake = new Uint8Array(N), comp = new Int32Array(N).fill(NO);
    const lakes = [];
    for (const i0 of land) {
      if (comp[i0] !== NO || filled[i0] - elev[i0] < TH.lakeDepth) continue;
      const cells = [i0]; comp[i0] = i0;
      for (let h = 0; h < cells.length; h++) {
        const c = cells[h], x = c % W, y = (c - x) / W;
        for (const [ox, oy] of N8.slice(0, 4)) { const nx = x + ox, ny = y + oy; if (!inb(nx, ny)) continue; const j = ny * W + nx; if (comp[j] === NO && region[j] !== SEA && filled[j] - elev[j] >= TH.lakeDepth) { comp[j] = i0; cells.push(j); } }
      }
      const ok = cells.length >= 4 && cells.length <= TH.lakeMax && cells.some(c => river[c])
        && cells.filter(c => (T[region[c]].no || []).includes('lake')).length < cells.length / 2;
      if (ok) { for (const c of cells) lake[c] = 1; lakes.push(cells.length); }
    }

    // ── Nhiệt: nam nóng, bắc lạnh, lên cao thì lạnh ──
    const temp = new Float32Array(N);
    for (const i of land) { const y = Math.floor(i / W), lat = G.clamp(((y + .5) * CS - 100) / 700, 0, 1); temp[i] = G.clamp(.12 + lat * .85 - .35 * elev[i] + bT[i], 0, 1); }

    // Ven sông ẩm hơn (đầm, rừng mọc dọc sông).
    const wet = new Float32Array(N);
    for (const i of land) if (river[i] || lake[i]) { const x = i % W, y = (i - x) / W; for (let oy = -2; oy <= 2; oy++) for (let ox = -2; ox <= 2; ox++) if (inb(x + ox, y + oy)) wet[(y + oy) * W + x + ox] = Math.max(wet[(y + oy) * W + x + ox], Math.abs(ox) + Math.abs(oy) <= 2 ? .12 : .06); }
    moist = moist.map((m, i) => region[i] === SEA ? 0 : Math.min(1, m + wet[i]));

    // ── Đặc trưng ──
    for (const i of land) {
      const t = T[region[i]], no = t.no || [], ok = f => !no.includes(f), e = elev[i], m = moist[i];
      let f = FE.open;
      if (lake[i]) f = FE.lake;
      else if (e > TH.mountain && ok('mountain')) f = FE.mountain;
      else if (m > TH.marsh.moist && e < TH.marsh.elev && ok('marsh')) f = FE.marsh;
      else if (m > TH.jungle.moist && temp[i] > TH.jungle.temp && ok('jungle')) f = FE.jungle;
      else if ((m > TH.forest || (t.forest && m > TH.forestBiome)) && ok('forest')) f = FE.forest;
      else if (e > TH.hills) f = FE.hills;
      feat[i] = f;
    }
    // Sông không chảy trong lòng hồ.
    for (const i of land) if (lake[i]) river[i] = 0;

    // ── Vùng biển (research/03 mục 7.1): ô biển thuộc điểm neo gần nhất (chia trọng số r), bẻ cong bằng noise như biên vùng đất ──
    const SE = G.SEAS || [], sea = new Uint8Array(N).fill(SEA), seaCells = SE.map(() => []);
    for (let i = 0; i < N; i++) {
      if (region[i] !== SEA) continue;
      const x = i % W, y = (i - x) / W, px = (x + .5) * CS, py = (y + .5) * CS;
      const wx = px + (warp(px / 160 + 51.3, py / 160 + 7.7) - .5) * 170, wy = py + (warp(px / 160 + 3.1, py / 160 + 63.9) - .5) * 170;
      let best = Infinity, bk = 0;
      for (let k = 0; k < SE.length; k++) { const d = Math.hypot(wx - SE[k].anchor[0], wy - SE[k].anchor[1]) / SE[k].r; if (d < best) { best = d; bk = k; } }
      sea[i] = bk; seaCells[bk].push(i);
    }
    // Vùng đất giáp mỗi vùng biển; chỗ đặt tên vùng biển: tâm các ô cách bờ 3–12 ô, kéo về ô gần nhất.
    const seaShore = SE.map(() => new Set());
    for (const i of coastLand) { const x = i % W, y = (i - x) / W; for (const [ox, oy] of N8) { const nx = x + ox, ny = y + oy; if (inb(nx, ny) && sea[ny * W + nx] !== SEA) seaShore[sea[ny * W + nx]].add(region[i]); } }
    const seaLabel = seaCells.map(cs => {
      const mid = cs.filter(i => shore[i] >= 3 && shore[i] <= 12), use = mid.length ? mid : cs;
      if (!use.length) return null;
      let sx = 0, sy = 0; for (const i of use) { sx += i % W; sy += Math.floor(i / W); }
      const cx = sx / use.length, cy = sy / use.length;
      let bi = use[0], bd = Infinity; for (const i of use) { const d = Math.hypot(i % W - cx, Math.floor(i / W) - cy); if (d < bd) { bd = d; bi = i; } }
      return [(bi % W + .5) * CS, (Math.floor(bi / W) + .5) * CS];
    });

    // ── Kề nhau: hai ô đất cạnh nhau khác vùng. Đảo (không kề vùng đất nào) kề các vùng có bờ cách bờ đảo ≤ 30 ô ──
    const adj = R.map(() => new Set());
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const a = region[y * W + x]; if (a === SEA) continue;
      for (const [dx, dy] of [[1, 0], [0, 1]]) {
        if (x + dx >= W || y + dy >= H) continue;
        const b = region[(y + dy) * W + x + dx];
        if (b !== SEA && b !== a) { adj[a].add(b); adj[b].add(a); }
      }
    }
    const idx = Object.fromEntries(R.map((r, k) => [r.id, k]));
    R.forEach((r, k) => {
      if (!r.island || adj[k].size) return;
      const mine = coastLand.filter(i => region[i] === k), xy = i => [i % W, Math.floor(i / W)];
      for (const j of coastLand) {
        const o = region[j]; if (o === k || adj[k].has(o)) continue;
        const [x1, y1] = xy(j);
        if (mine.some(i => { const [x0, y0] = xy(i); return Math.hypot(x1 - x0, y1 - y0) <= 30; })) { adj[k].add(o); adj[o].add(k); }
      }
    });

    const stats = { land: land.length, rivers: sysSize.size, riverCells: 0, lakes: lakes.length, lakeCells: 0 };
    for (const f of G.FEATURES) stats[f.id] = 0;
    for (const i of land) { stats[G.FEATURES[feat[i]].id]++; if (river[i]) stats.riverCells++; }
    stats.lakeCells = stats.lake; stats.rivers = new Set(land.filter(i => river[i]).map(i => mouth[i])).size;

    const map = {
      CS, W, H, region, zone, elev, moist, temp, feat, river, flow, recv, shore, dCoast, cellsOf, idx, stats, sea, seaCells, seaLabel,
      seaShore: seaShore.map(s => [...s].map(k => R[k].id)),
      adj: adj.map(s => [...s].map(k => R[k].id)),
      // Ô biển: kiểu vùng biển, tầng (theo độ hoang biển của thế giới đang dùng, realm.js), tên vùng biển của thế giới.
      seaAt(px, py) {
        const x = Math.floor(px / CS), y = Math.floor(py / CS);
        if (x < 0 || y < 0 || x >= W || y >= H) return null;
        const i = y * W + x; if (region[i] !== SEA) return null;
        const S = SE[sea[i]], b = G.realm && G.realm.seaBand ? G.realm.seaBand[i] : Math.min(3, Math.floor(shore[i] / 6));
        return { sea: S, seaIndex: sea[i], name: G.realm && G.realm.seas ? G.realm.seas[sea[i]].name : S.nameVi, zone: S.zones[b], zoneIndex: b, cell: i };
      },
      at(px, py) {
        const x = Math.floor(px / CS), y = Math.floor(py / CS);
        if (x < 0 || y < 0 || x >= W || y >= H) return null;
        const i = y * W + x; if (region[i] === SEA) return null;
        // Khu (tầng) của ô: theo độ hoang của thế giới đang dùng (realm.js); chưa có thế giới thì theo cách chia cũ.
        const reg = R[region[i]], b = G.realm && G.realm.band ? G.realm.band[i] : zone[i];
        return { region: reg, zone: reg.zones[b], zoneIndex: b, feature: G.FEATURES[feat[i]], river: !!river[i], elev: elev[i], cell: i };
      },
      // Một điểm ngẫu nhiên trong khu (để đặt mộ, điểm săn); không rơi xuống hồ. Khu không có ô thì lấy khu gần làng nhất có ô.
      pointIn(regionId, zi, rnd) {
        const k = idx[regionId], bc = G.realm && G.realm.bandCells ? G.realm.bandCells[k] : null;
        let cs = bc ? bc[zi] : cellsOf[k].filter(i => zone[i] === zi && feat[i] !== FE.lake);
        if (!cs || !cs.length) cs = (bc && bc.find(a => a.length)) || cellsOf[k];
        const i = cs[Math.floor(rnd() * cs.length)] ?? cellsOf[k][0];
        return [(i % W + .5) * CS, (Math.floor(i / W) + .5) * CS];
      }
    };
    map.warnings = [];   // khu dân cư kiểm ở realm.js
    return map;
  };

  // ── Vẽ ──
  const hex = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
  const mix = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
  const WATER = [44, 92, 128], RIVER = '#5d97c4';
  // Màu đặc trưng ở chế độ Địa hình: [màu pha, tỉ lệ pha].
  const FCOL = [null, [[176, 160, 112], .18], [[34, 70, 38], .5], [[18, 62, 30], .66], [[66, 84, 56], .55], [[118, 110, 102], .72], null];

  // Ảnh nền vẽ một lần vào canvas phụ. mode: 'region' (vùng + khu), 'terrain' (biome + đặc trưng + bóng núi)
  // hoặc 'political' (màu quốc gia trên nền địa hình, biên tỉnh mảnh, biên nước đậm; cần realm).
  // 'danger': tô theo tầng so với sức nhân vật (opt.ct = Tier nhân vật, opt.cap = Tier tối đa được gặp): an toàn / vừa sức / nguy hiểm / khóa; cả đất và biển.
  // 'sea': vùng biển (màu theo kiểu), tầng biển tối dần, đất xám mờ.
  G.renderMapBase = function (map, mode = 'region', realm = null, opt = {}) {
    const { W, H, CS, region, zone, elev, temp, feat, shore } = map, R = G.REGIONS, BI = window.JobLibrary.biomes;
    const cv = document.createElement('canvas'); cv.width = W * CS; cv.height = H * CS;
    const ctx = cv.getContext('2d'), img = ctx.createImageData(W * CS, H * CS), d = img.data;
    const pal = R.map(r => { const p = BI[r.biome].palette; return { g: hex(p.ground), e: hex(p.edge), f: hex(p.far) }; });
    const deep = hex('#0a1622'), shallow = hex('#1e4560'), foam = hex('#5d8aa0'), border = [24, 18, 14];
    const terrain = mode === 'terrain', political = mode === 'political' && realm;
    const ncol = political ? realm.nations.map(n => hex(n.color)) : [], owner = political && realm.owner, prov = political && realm.provOf;
    const zb = realm && realm.band ? realm.band : zone, danger = mode === 'danger' && realm;
    const seaMode = mode === 'sea' && realm, sb = realm && realm.seaBand, SE = G.SEAS, scol = SE.map(s => hex(s.color));
    const DCOL = { safe: [84, 168, 96], fair: [214, 176, 64], risky: [210, 96, 62], locked: [66, 58, 64] };
    const lvlT = t => t[1] <= opt.ct ? 'safe' : t[0] <= opt.ct ? 'fair' : t[0] <= opt.cap ? 'risky' : 'locked';
    const lvlOf = (r, b) => lvlT(R[r].zones[b].tier);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const i = y * W + x, r = region[i];
      let c;
      if (r === SEA) {
        const s = shore[i]; c = s <= 1 ? foam : mix(shallow, deep, Math.min(1, (s - 1) / 7));
        if ((x * 7 + y * 3) % 23 === 0 && s > 2) c = mix(c, foam, .25);
        // Biển: màu kiểu vùng biển, tối dần theo tầng; biên vùng biển đậm, ranh tầng chấm. Nguy hiểm: tầng biển so với sức nhân vật.
        if ((seaMode || danger) && sb) {
          const k = map.sea[i], b = sb[i];
          const nb = [[1, 0], [0, 1], [-1, 0], [0, -1]].map(([dx, dy]) => { const nx = x + dx, ny = y + dy; return nx < 0 || ny < 0 || nx >= W || ny >= H ? i : ny * W + nx; });
          if (seaMode) {
            c = mix(mix(scol[k], [16, 28, 40], .25), deep, b * .2);
            if (nb.some(j => region[j] === SEA && map.sea[j] !== k)) c = mix(c, [10, 14, 20], .7);
            else if (nb.some(j => region[j] === SEA && sb[j] !== b) && (x + y) % 2) c = mix(c, [235, 240, 245], .3);
          } else {
            c = mix(c, DCOL[lvlT(SE[map.sea[i]].zones[b].tier)], .38);
            if (nb.some(j => region[j] === SEA && sb[j] !== b) && (x + y) % 2) c = mix(c, [10, 14, 20], .3);
          }
        }
      } else if (seaMode) {
        // Đất ở chế độ Biển: xám mờ theo địa hình để vùng biển nổi lên.
        let t = pal[r].g; const fc = FCOL[feat[i]]; if (fc) t = mix(t, fc[0], fc[1] * .25);
        const lum = (t[0] * .3 + t[1] * .55 + t[2] * .15) * (.8 + elev[i] * .3);
        c = feat[i] === FE.lake ? [70, 90, 104] : mix([lum, lum, lum], [176, 164, 140], .35);
      } else if (feat[i] === FE.lake) {
        c = mix(WATER, shallow, .3);
      } else {
        const p = pal[r], z = zb[i];
        const nb = [[1, 0], [0, 1], [-1, 0], [0, -1]].map(([dx, dy]) => { const nx = x + dx, ny = y + dy; return nx < 0 || ny < 0 || nx >= W || ny >= H ? i : ny * W + nx; });
        if (danger) {
          let t = p.g; const fc = FCOL[feat[i]]; if (fc) t = mix(t, fc[0], fc[1] * .5);
          const lum = (t[0] * .3 + t[1] * .55 + t[2] * .15) * (.8 + elev[i] * .35);
          c = mix([lum, lum, lum], DCOL[lvlOf(r, z)], .62);
          if (nb.some(j => region[j] !== SEA && region[j] !== r)) c = mix(c, border, .55);
          else if (nb.some(j => region[j] === r && zb[j] !== z)) c = mix(c, border, .35);
        } else         if (political) {
          let t = p.g; const fc = FCOL[feat[i]]; if (fc) t = mix(t, fc[0], fc[1] * .6);
          const k = owner[i];
          c = k >= 0 ? mix(t, ncol[k], .58) : mix(t, [84, 80, 74], .62);
          c = c.map(v => v * G.clamp(.86 + elev[i] * .22, .7, 1.15));
          if (k < 0 && (x + y) % 6 === 0) c = mix(c, [40, 36, 32], .35);
          // Biên nước đậm, biên tỉnh chấm mảnh.
          if (nb.some(j => region[j] !== SEA && owner[j] !== k)) c = mix(c, [18, 12, 8], .8);
          else if (nb.some(j => region[j] !== SEA && prov[j] !== prov[i]) && (x + y) % 2) c = mix(c, [30, 22, 16], .45);
        } else         if (terrain) {
          c = p.g;
          const fc = FCOL[feat[i]]; if (fc) c = mix(c, fc[0], fc[1]);
          if (feat[i] === FE.mountain && temp[i] < .42) c = mix(c, [236, 240, 244], .55);
          // Bóng đổ: ánh sáng từ tây bắc.
          const up = y > 0 && x > 0 ? elev[i - W - 1] : elev[i];
          c = c.map(v => v * G.clamp(.82 + elev[i] * .3 + (elev[i] - up) * 7, .6, 1.3));
          if (nb.some(j => region[j] !== SEA && region[j] !== r)) c = mix(c, border, .4);
        } else {
          c = z === 0 ? mix(p.g, p.e, .2) : z === 1 ? mix(p.g, p.f, .12) : z === 2 ? mix(mix(p.g, p.f, .45), [40, 10, 20], .18) : mix(mix(p.g, p.f, .6), [50, 0, 18], .4);
          c = c.map(v => v * (.78 + elev[i] * .4));
          // Biên giới vùng và ranh khu.
          if (nb.some(j => region[j] !== SEA && region[j] !== r)) c = mix(c, border, .75);
          else if (nb.some(j => region[j] === r && zb[j] !== z) && (x + y) % 2) c = mix(c, border, .3);
        }
        if (nb.some(j => region[j] === SEA)) c = mix(c, [230, 220, 190], .25);
        else if (nb.some(j => feat[j] === FE.lake)) c = mix(c, [210, 220, 200], .2);
      }
      for (let py = 0; py < CS; py++) for (let px = 0; px < CS; px++) {
        const o = ((y * CS + py) * W * CS + x * CS + px) * 4;
        const dither = ((px + py) & 1) ? 1.04 : .97;
        d[o] = c[0] * dither; d[o + 1] = c[1] * dither; d[o + 2] = c[2] * dither; d[o + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
    if (terrain) drawGlyphs(ctx, map);
    drawRivers(ctx, map);
    return cv;
  };

  // Ký hiệu đặc trưng (chỉ ở chế độ Địa hình): cây, núi, đồi, lau sậy. Lấy mẫu theo lưới có xô lệch cố định.
  function drawGlyphs(ctx, map) {
    const { W, H, CS, feat, temp, river } = map;
    const jit = (x, y, k) => ((Math.sin(x * 12.9898 + y * 78.233 + k * 37.719) * 43758.5453) % 1 + 1) % 1;
    const step = { [FE.forest]: 3, [FE.jungle]: 2, [FE.mountain]: 5, [FE.hills]: 5, [FE.marsh]: 4 };
    const glyphs = [];
    for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
      const i = y * W + x, f = feat[i], s = step[f]; if (!s || river[i]) continue;
      if ((x + (y % 2) * Math.floor(s / 2)) % s || y % s) continue;
      if (jit(x, y, 1) < .18) continue;
      glyphs.push([f, (x + .5 + (jit(x, y, 2) - .5) * 1.4) * CS, (y + .5 + (jit(x, y, 3) - .5) * 1.4) * CS, temp[i], jit(x, y, 4)]);
    }
    glyphs.sort((a, b) => a[2] - b[2]);   // vẽ từ trên xuống để ký hiệu dưới đè ký hiệu trên
    for (const [f, x, y, t, r] of glyphs) {
      if (f === FE.forest || f === FE.jungle) {
        const big = f === FE.jungle ? 4.2 : 3.4;
        ctx.fillStyle = 'rgba(20,14,8,.55)'; ctx.fillRect(x - .5, y, 1.4, 3);
        ctx.fillStyle = f === FE.jungle ? '#1d4a24' : t < .35 ? '#2f4a3a' : '#2f5a30';
        ctx.beginPath(); ctx.arc(x, y - 1, big * (.85 + r * .3), 0, 7); ctx.fill();
        ctx.fillStyle = f === FE.jungle ? 'rgba(120,190,90,.35)' : 'rgba(160,200,120,.3)';
        ctx.beginPath(); ctx.arc(x - 1, y - 2, big * .45, 0, 7); ctx.fill();
      } else if (f === FE.mountain) {
        const h = 9 + r * 5, w = 8 + r * 3;
        ctx.fillStyle = '#7a7068'; ctx.beginPath(); ctx.moveTo(x - w, y + 3); ctx.lineTo(x, y - h); ctx.lineTo(x + w, y + 3); ctx.fill();
        ctx.fillStyle = '#4c443e'; ctx.beginPath(); ctx.moveTo(x, y - h); ctx.lineTo(x + w, y + 3); ctx.lineTo(x + 1, y + 3); ctx.fill();
        if (t < .5) { ctx.fillStyle = '#eef2f5'; ctx.beginPath(); ctx.moveTo(x - w * .32, y - h * .55); ctx.lineTo(x, y - h); ctx.lineTo(x + w * .32, y - h * .55); ctx.fill(); }
        ctx.strokeStyle = 'rgba(20,14,10,.6)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x - w, y + 3); ctx.lineTo(x, y - h); ctx.lineTo(x + w, y + 3); ctx.stroke();
      } else if (f === FE.hills) {
        ctx.strokeStyle = 'rgba(40,30,20,.55)'; ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.arc(x, y + 3, 5 + r * 2, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke();
      } else if (f === FE.marsh) {
        ctx.strokeStyle = 'rgba(120,170,190,.55)'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(x - 4, y + 2); ctx.lineTo(x + 4, y + 2); ctx.stroke();
        ctx.strokeStyle = 'rgba(40,60,30,.7)';
        ctx.beginPath(); ctx.moveTo(x - 2, y + 1); ctx.lineTo(x - 3, y - 3); ctx.moveTo(x, y + 1); ctx.lineTo(x, y - 4); ctx.moveTo(x + 2, y + 1); ctx.lineTo(x + 3, y - 3); ctx.stroke();
      }
    }
  }

  // Sông: đoạn thẳng từ tâm ô tới tâm ô hạ lưu; to dần theo lưu lượng. Cửa sông nối ra ô biển kề.
  function drawRivers(ctx, map) {
    const { W, CS, region, river, flow, recv } = map;
    ctx.strokeStyle = RIVER; ctx.lineCap = 'round';
    const cx = i => (i % W + .5) * CS, cy = i => (Math.floor(i / W) + .5) * CS;
    for (let i = 0; i < river.length; i++) {
      if (!river[i]) continue;
      let j = recv[i];
      if (j === NO) {
        const x = i % W, y = (i - x) / W;
        for (const [ox, oy] of N8) { const k = (y + oy) * W + x + ox; if (region[k] === SEA) { j = k; break; } }
        if (j === NO) continue;
      }
      ctx.lineWidth = G.clamp(.8 + Math.log2(flow[i] / TH.riverFlow) * .7, .8, 3.6);
      ctx.beginPath(); ctx.moveTo(cx(i), cy(i)); ctx.lineTo(cx(j), cy(j)); ctx.stroke();
    }
  }

  // Lớp đường (vẽ một lần mỗi thế giới): đường cái, đường mòn, lối nhỏ theo đường đi đã lưu; cầu trên sông, dấu đèo trên núi.
  G.renderRoads = function (map, realm) {
    const { W, H, CS } = map, cv = document.createElement('canvas'); cv.width = W * CS; cv.height = H * CS;
    const ctx = cv.getContext('2d'), cx = i => (i % W + .5) * CS, cy = i => (Math.floor(i / W) + .5) * CS;
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    const STYLE = { 1: { under: 0, w: 1, c: 'rgba(196,170,120,.55)', dash: [2, 3] }, 2: { under: 2.6, w: 1.3, c: '#c9aa72' }, 3: { under: 3.6, w: 2, c: '#e2c588' } };
    const line = (cells, w, c, dash) => { ctx.setLineDash(dash || []); ctx.strokeStyle = c; ctx.lineWidth = w; ctx.beginPath(); cells.forEach((i, k) => k ? ctx.lineTo(cx(i), cy(i)) : ctx.moveTo(cx(i), cy(i))); ctx.stroke(); };
    for (const cls of [1, 2, 3]) {
      const list = realm.roads.filter(r => r.cls === cls), st = STYLE[cls];
      if (st.under) for (const r of list) line(r.cells, st.under, 'rgba(30,20,10,.65)');
      for (const r of list) line(r.cells, st.w, st.c, st.dash);
    }
    ctx.setLineDash([]);
    for (const i of realm.bridges) { if (realm.road[i] < 2) continue; ctx.fillStyle = 'rgba(30,20,10,.85)'; ctx.fillRect(cx(i) - 3, cy(i) - 3, 6, 6); ctx.fillStyle = '#d9c9a6'; ctx.fillRect(cx(i) - 2, cy(i) - 2, 4, 4); }
    for (const i of realm.passes) { if (realm.road[i] < 2 || (i % 3)) continue; ctx.strokeStyle = 'rgba(245,235,215,.85)'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(cx(i) - 4, cy(i) + 2); ctx.lineTo(cx(i), cy(i) - 3); ctx.lineTo(cx(i) + 4, cy(i) + 2); ctx.stroke(); }
    return cv;
  };

  // Lớp sọc đỏ chéo trên tỉnh tiền tuyến (war[p] ≥ 1, js/dynamic.js), chế độ Chính trị.
  G.renderWarLayer = function (map, realm, war) {
    const { W, H, CS } = map, cv = document.createElement('canvas'); cv.width = W * CS; cv.height = H * CS;
    const ctx = cv.getContext('2d'); ctx.fillStyle = 'rgba(200,40,30,.5)';
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const p = realm.provOf[y * W + x];
      if (p >= 0 && war[p] >= 1 && (x + y) % 4 === 0) ctx.fillRect(x * CS, y * CS, CS, CS);
    }
    return cv;
  };

  // Lớp phủ: khu dân cư, tên vùng, mộ các kiếp trước, đường đời, nhân vật, vùng đang chọn.
  G.drawMap = function (ctx, map, base, o = {}) {
    const R = G.REGIONS;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(base, 0, 0);
    if (o.roads) ctx.drawImage(o.roads, 0, 0);
    if (o.war) ctx.drawImage(o.war, 0, 0);
    if (o.selected) {
      const k = map.idx[o.selected], { W, CS, zone } = map;
      ctx.fillStyle = 'rgba(255,240,180,.10)';
      for (const i of map.cellsOf[k]) ctx.fillRect((i % W) * CS, Math.floor(i / W) * CS, CS, CS);
      // Tô khu đang được nhắm săn.
      if (o.zoneSel != null) {
        ctx.fillStyle = 'rgba(255,90,60,.16)';
        for (const i of map.cellsOf[k]) if (zone[i] === o.zoneSel) ctx.fillRect((i % W) * CS, Math.floor(i / W) * CS, CS, CS);
      }
    }
    // Hải trình từ bến gần nhân vật nhất (chế độ Biển; js/travel.js G.seaLinesFrom).
    if (o.seaLines) {
      const { W, CS } = map, px = i => (i % W + .5) * CS, py = i => (Math.floor(i / W) + .5) * CS;
      const path = r => { ctx.beginPath(); r.cells.forEach((c, k) => k ? ctx.lineTo(px(c), py(c)) : ctx.moveTo(px(c), py(c))); ctx.stroke(); };
      ctx.lineJoin = 'round'; ctx.strokeStyle = 'rgba(8,12,18,.55)'; ctx.lineWidth = 3.4;
      for (const r of o.seaLines.routes) path(r);
      ctx.setLineDash([6, 4]); ctx.lineWidth = 1.8;
      for (const r of o.seaLines.routes) { ctx.strokeStyle = ['#d8ecf6', '#8fd2ff', '#ffd27a'][r.ship]; path(r); }
      ctx.setLineDash([]);
    }
    // Đường đời.
    if (o.path && o.path.length > 1) {
      ctx.strokeStyle = 'rgba(255,214,120,.75)'; ctx.lineWidth = 2; ctx.beginPath();
      o.path.forEach(([x, y], n) => n ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.stroke();
    }
    // Khu dân cư (js/realm.js): ô vuông theo bậc; viền màu nước ở chế độ Chính trị; đồn đỏ, cảng có chấm xanh.
    const political = o.view === 'political', realm = o.realm;
    if (realm) {
      const SZ = { capital: 5, city: 4, town: 3, village: 2, hamlet: 1 };
      const FILL = { capital: '#ffd27a', city: '#f6e7c4', town: '#e8dcc0', village: '#d6c9aa', hamlet: '#c9bc9c' };
      for (const s of realm.settlements) {
        const { x, y } = s;
        ctx.globalAlpha = 1;
        if (s.tier === 'ruin') {
          ctx.strokeStyle = 'rgba(200,190,175,.75)'; ctx.lineWidth = 1.5;
          ctx.beginPath(); ctx.moveTo(x - 3, y - 3); ctx.lineTo(x + 3, y + 3); ctx.moveTo(x + 3, y - 3); ctx.lineTo(x - 3, y + 3); ctx.stroke();
          continue;
        }
        const r = SZ[s.tier], n = s.nation >= 0 ? realm.nations[s.nation] : null;
        ctx.globalAlpha = s.dwindling ? .55 : 1;   // khu sa sút (js/dynamic.js) nhạt đi
        if (s.tier === 'hamlet') { ctx.fillStyle = 'rgba(26,18,12,.8)'; ctx.fillRect(x - 2, y - 2, 4, 4); ctx.fillStyle = FILL.hamlet; ctx.fillRect(x - 1, y - 1, 2, 2); continue; }
        ctx.fillStyle = political && n ? n.color : '#1a120c'; ctx.fillRect(x - r - 1, y - r - 1, r * 2 + 2, r * 2 + 2);
        ctx.fillStyle = s.roles.includes('fort') ? '#d08070' : FILL[s.tier]; ctx.fillRect(x - r, y - r, r * 2, r * 2);
        // Cờ kinh đô: khu là kinh đô hiện tại của nước (dời đô thì cờ theo).
        if (n ? n.capital === s.id : s.tier === 'capital') { ctx.fillStyle = '#1a120c'; ctx.fillRect(x - 1, y - r - 5, 2, 5); ctx.fillStyle = n ? n.color : '#ffd27a'; ctx.fillRect(x + 1, y - r - 5, 4, 3); }
        if (s.roles.includes('port') && r >= 3) { ctx.fillStyle = '#7fc4ee'; ctx.fillRect(x + r - 2, y + r - 2, 3, 3); }
        ctx.globalAlpha = 1;
      }
      ctx.globalAlpha = 1;
      // Chế độ Biển: bến theo loại tàu (vòng nhạt: thuyền chài; xanh: tàu buôn; vàng: tàu viễn dương), tên vùng biển.
      if (o.view === 'sea' && realm.harbors) {
        for (const h of realm.harbors) {
          const rr = [2.5, 4, 5.5][h.ship];
          ctx.strokeStyle = 'rgba(10,8,6,.85)'; ctx.lineWidth = 3.2; ctx.beginPath(); ctx.arc(h.x, h.y, rr, 0, 7); ctx.stroke();
          ctx.strokeStyle = ['#cfe2ea', '#7fc4ee', '#ffd27a'][h.ship]; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.arc(h.x, h.y, rr, 0, 7); ctx.stroke();
        }
        if (o.labels !== false) realm.seas.forEach((s, k) => { const p = map.seaLabel[k]; if (p) label(ctx, s.name.toUpperCase(), p[0], p[1], 11.5, 'rgba(225,240,250,.9)', true); });
      }
      if (o.labels !== false) for (const s of realm.settlements) {
        if (s.tier === 'capital' || s.tier === 'city' || (o.allLabels && s.tier === 'town')) label(ctx, s.name, s.x, s.y + SZ[s.tier] + 11, s.tier === 'capital' ? 10.5 : 9.5, s.tier === 'capital' ? '#ffe6a8' : '#f3e6c8');
      }
    }
    // Tên vùng (chế độ Vùng, Địa hình) hoặc tên nước (chế độ Chính trị).
    if (o.labels !== false) {
      if (political && realm) {
        if (G.relabelNations) G.relabelNations(realm);
        for (const n of realm.nations) if (n.alive !== false && n.labelPos) label(ctx, n.name.toUpperCase(), n.labelPos[0], n.labelPos[1] - 16, 12.5, `rgb(${mix(hex(n.color), [255, 248, 230], .55).map(Math.round).join(',')})`, true);
      } else for (const reg of R) label(ctx, reg.nameVi.toUpperCase(), reg.x, reg.y - 26, 11, 'rgba(255,248,230,.82)', true);
    }
    // Mộ.
    for (const g of o.graves || []) {
      ctx.fillStyle = g.rose ? '#7dffb0' : '#cfc6b8';
      ctx.fillRect(g.x - 1, g.y - 5, 3, 10); ctx.fillRect(g.x - 4, g.y - 2, 9, 3);
    }
    // Đồng niên (headless) đang sống ở đâu.
    for (const p of o.peers || []) { ctx.fillStyle = p.dead ? 'rgba(160,150,140,.5)' : 'rgba(160,210,255,.9)'; ctx.beginPath(); ctx.arc(p.x, p.y, 3, 0, 7); ctx.fill(); }
    // Nhân vật.
    if (o.me) {
      const [x, y] = o.me, t = (o.time || 0) % 1.4;
      ctx.strokeStyle = `rgba(255,220,120,${1 - t / 1.4})`; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y, 6 + t * 12, 0, 7); ctx.stroke();
      ctx.fillStyle = o.undead ? '#7dffb0' : '#ffd27a'; ctx.strokeStyle = '#1a120c'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(x, y, 5, 0, 7); ctx.fill(); ctx.stroke();
    }
    // Điểm săn gần nhất.
    if (o.hunt) { const [x, y] = o.hunt; ctx.strokeStyle = '#ff6a50'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x - 5, y - 5); ctx.lineTo(x + 5, y + 5); ctx.moveTo(x + 5, y - 5); ctx.lineTo(x - 5, y + 5); ctx.stroke(); }
  };
  function label(ctx, text, x, y, size, color, bold) {
    ctx.font = `${bold ? 700 : 500} ${size}px "Be Vietnam Pro", system-ui, sans-serif`; ctx.textAlign = 'center';
    ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(10,8,6,.85)'; ctx.strokeText(text, x, y);
    ctx.fillStyle = color; ctx.fillText(text, x, y);
  }
})(window.LifeSim);
