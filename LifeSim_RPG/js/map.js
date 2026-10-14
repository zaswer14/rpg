/* Vạn Kiếp — bản đồ đại lục raster.
 * Mỗi ô 4px. Ô thuộc vùng có khoảng cách (đã bẻ cong bằng noise) chia bán kính nhỏ nhất (Voronoi có trọng số);
 * khoảng đó vượt ngưỡng bờ biển (cũng có noise) thì là biển.
 * Khu trong vùng: xếp ô theo khoảng cách tới khu dân cư chính; 45% gần nhất = khu ven, 35% kế = khu sâu, 20% xa nhất = lõi.
 * Bản đồ hoàn toàn suy ra từ G.REGIONS + seed cố định, nên không cần lưu.
 */
window.LifeSim = window.LifeSim || {};
(function (G) {
  const SEA = 255;

  G.buildMap = function (seed = 'varen') {
    const CS = 4, W = 250, H = 175, N = W * H;
    const warp = G.noise2(seed + ':warp'), coastN = G.noise2(seed + ':coast'), hN = G.noise2(seed + ':h'), zN = G.noise2(seed + ':zone');
    const R = G.REGIONS, region = new Uint8Array(N).fill(SEA), zone = new Uint8Array(N).fill(SEA), elev = new Float32Array(N);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const i = y * W + x, px = (x + .5) * CS, py = (y + .5) * CS;
      // Bẻ cong hai tầng: tầng lớn làm biên vùng uốn lượn, tầng nhỏ làm răng cưa.
      const wx = px + (warp(px / 150, py / 150) - .5) * 190 + (warp(px / 45 + 5.1, py / 45 + 9.3) - .5) * 46;
      const wy = py + (warp(px / 150 + 31.7, py / 150 + 17.3) - .5) * 190 + (warp(px / 45 + 13.7, py / 45 + 2.9) - .5) * 46;
      let best = Infinity, bi = -1;
      for (let k = 0; k < R.length; k++) { const d = Math.hypot(wx - R[k].x, wy - R[k].y) / R[k].r; if (d < best) { best = d; bi = k; } }
      // Ngưỡng bờ > 1 để lấp eo biển giữa các vùng; sát mép khung thì chìm xuống biển.
      const edge = Math.min(px, py, W * CS - px, H * CS - py);
      const coast = 1.22 + (coastN(px / 70 + 7, py / 70 + 3, 4) - .5) * .8 - Math.max(0, (36 - edge) / 36) * .9;
      elev[i] = hN(px / 70, py / 70, 4);
      if (best < coast && !(R[bi].island && best > 1.0)) region[i] = bi;
    }
    // Khu: xếp ô theo khoảng cách tới một "mỏ neo" = khu dân cư chính dịch về phía lòng đại lục,
    // cộng noise. Kết quả: khu ven ôm lấy làng và phía trong; khu lõi nằm ở rìa ngoài, xa văn minh.
    const cellsOf = R.map(() => []);
    for (let i = 0; i < N; i++) if (region[i] !== SEA) cellsOf[region[i]].push(i);
    const CX = 500 / CS, CY = 370 / CS;
    R.forEach((reg, k) => {
      const s = reg.settlements[0];
      let ax = s[3] / CS, ay = s[4] / CS;
      const dx = CX - ax, dy = CY - ay, dl = Math.hypot(dx, dy);
      if (dl > 1) { const push = Math.min(dl, reg.r / CS * .5); ax += dx / dl * push; ay += dy / dl * push; }
      const list = cellsOf[k].map(i => { const x = i % W, y = (i - x) / W; return [i, Math.hypot(x - ax, y - ay) + (zN(x / 14, y / 14, 3) - .5) * 26 + elev[i] * 4]; }).sort((a, b) => a[1] - b[1]);
      list.forEach(([i], n) => { const q = n / list.length; zone[i] = q < .45 ? 0 : q < .8 ? 1 : 2; });
    });
    // Kề nhau: hai ô đất cạnh nhau khác vùng. Thêm tuyến biển.
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
    for (const [a, b] of G.SEA_ROUTES || []) { adj[idx[a]].add(idx[b]); adj[idx[b]].add(idx[a]); }
    // Khoảng cách tới bờ (cho màu biển nông).
    const shore = new Uint8Array(N).fill(99); const q = [];
    for (let i = 0; i < N; i++) if (region[i] !== SEA) { shore[i] = 0; q.push(i); }
    for (let h = 0; h < q.length; h++) {
      const i = q[h], x = i % W, y = (i - x) / W, d = shore[i] + 1; if (d > 8) continue;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
        const j = ny * W + nx; if (shore[j] > d) { shore[j] = d; q.push(j); }
      }
    }
    const map = {
      CS, W, H, region, zone, elev, shore, cellsOf, idx,
      adj: adj.map(s => [...s].map(k => R[k].id)),
      at(px, py) {
        const x = Math.floor(px / CS), y = Math.floor(py / CS);
        if (x < 0 || y < 0 || x >= W || y >= H) return null;
        const i = y * W + x; if (region[i] === SEA) return null;
        const reg = R[region[i]]; return { region: reg, zone: reg.zones[zone[i]], zoneIndex: zone[i] };
      },
      // Một điểm ngẫu nhiên trong khu (để đặt mộ, điểm săn).
      pointIn(regionId, zi, rnd) {
        const k = idx[regionId], cs = cellsOf[k].filter(i => zone[i] === zi);
        const i = cs[Math.floor(rnd() * cs.length)] ?? cellsOf[k][0];
        return [(i % W + .5) * CS, (Math.floor(i / W) + .5) * CS];
      }
    };
    // Kiểm tra: khu dân cư phải nằm trong đất của vùng mình.
    map.warnings = [];
    for (const reg of R) for (const s of reg.settlements) { const c = map.at(s[3], s[4]); if (!c || c.region.id !== reg.id) map.warnings.push(`${s[1]} (${reg.id}) nằm ngoài vùng: ${c ? c.region.id : 'biển'}`); }
    return map;
  };

  // ── Vẽ ──
  const hex = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
  const mix = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];

  // Ảnh nền (đất, biển, biên giới, khu) vẽ một lần vào canvas phụ.
  G.renderMapBase = function (map) {
    const { W, H, CS, region, zone, elev, shore } = map, R = G.REGIONS, BI = window.JobLibrary.biomes;
    const cv = document.createElement('canvas'); cv.width = W * CS; cv.height = H * CS;
    const ctx = cv.getContext('2d'), img = ctx.createImageData(W * CS, H * CS), d = img.data;
    const pal = R.map(r => { const p = BI[r.biome].palette; return { g: hex(p.ground), e: hex(p.edge), f: hex(p.far) }; });
    const deep = hex('#0a1622'), shallow = hex('#1e4560'), foam = hex('#5d8aa0'), border = [24, 18, 14];
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const i = y * W + x, r = region[i];
      let c;
      if (r === SEA) {
        const s = shore[i]; c = s <= 1 ? foam : mix(shallow, deep, Math.min(1, (s - 1) / 7));
        if ((x * 7 + y * 3) % 23 === 0 && s > 2) c = mix(c, foam, .25);
      } else {
        const p = pal[r], z = zone[i];
        c = z === 0 ? mix(p.g, p.e, .2) : z === 1 ? mix(p.g, p.f, .12) : mix(mix(p.g, p.f, .45), [40, 10, 20], .18);
        c = c.map(v => v * (.78 + elev[i] * .45));
        // Biên giới vùng và ranh khu.
        const nb = [[1, 0], [0, 1], [-1, 0], [0, -1]].map(([dx, dy]) => { const nx = x + dx, ny = y + dy; return nx < 0 || ny < 0 || nx >= W || ny >= H ? i : ny * W + nx; });
        if (nb.some(j => region[j] !== SEA && region[j] !== r)) c = mix(c, border, .75);
        else if (nb.some(j => region[j] === r && zone[j] !== z) && (x + y) % 2) c = mix(c, border, .3);
        if (nb.some(j => region[j] === SEA)) c = mix(c, [230, 220, 190], .25);
      }
      for (let py = 0; py < CS; py++) for (let px = 0; px < CS; px++) {
        const o = ((y * CS + py) * W * CS + x * CS + px) * 4;
        const dither = ((px + py) & 1) ? 1.04 : .97;
        d[o] = c[0] * dither; d[o + 1] = c[1] * dither; d[o + 2] = c[2] * dither; d[o + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
    return cv;
  };

  // Lớp phủ: khu dân cư, tên vùng, mộ các kiếp trước, đường đời, nhân vật, vùng đang chọn.
  G.drawMap = function (ctx, map, base, o = {}) {
    const R = G.REGIONS;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(base, 0, 0);
    if (o.selected) {
      const k = map.idx[o.selected], { W, CS, region, zone } = map;
      ctx.fillStyle = 'rgba(255,240,180,.10)';
      for (const i of map.cellsOf[k]) ctx.fillRect((i % W) * CS, Math.floor(i / W) * CS, CS, CS);
      // Tô khu đang được nhắm săn.
      if (o.zoneSel != null) {
        ctx.fillStyle = 'rgba(255,90,60,.16)';
        for (const i of map.cellsOf[k]) if (zone[i] === o.zoneSel) ctx.fillRect((i % W) * CS, Math.floor(i / W) * CS, CS, CS);
      }
    }
    // Tuyến biển.
    ctx.setLineDash([4, 5]); ctx.strokeStyle = 'rgba(200,230,255,.35)'; ctx.lineWidth = 1.5;
    for (const [a, b] of G.SEA_ROUTES || []) { const A = G.REGION[a].settlements[0], B = G.REGION[b].settlements[0]; ctx.beginPath(); ctx.moveTo(A[3], A[4]); ctx.lineTo(B[3], B[4]); ctx.stroke(); }
    ctx.setLineDash([]);
    // Đường đời.
    if (o.path && o.path.length > 1) {
      ctx.strokeStyle = 'rgba(255,214,120,.75)'; ctx.lineWidth = 2; ctx.beginPath();
      o.path.forEach(([x, y], n) => n ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.stroke();
    }
    // Khu dân cư.
    for (const reg of R) for (const [, name, kind, x, y] of reg.settlements) {
      const s = kind === 'capital' ? 5 : kind === 'town' ? 4 : 3;
      ctx.fillStyle = '#1a120c'; ctx.fillRect(x - s - 1, y - s - 1, s * 2 + 2, s * 2 + 2);
      ctx.fillStyle = kind === 'capital' ? '#ffd27a' : kind === 'fort' ? '#d08070' : '#e8dcc0'; ctx.fillRect(x - s, y - s, s * 2, s * 2);
      if (kind === 'capital') { ctx.fillStyle = '#1a120c'; ctx.fillRect(x - 1, y - s - 4, 2, 4); }
      if (o.labels !== false && (kind === 'capital' || o.allLabels)) label(ctx, name, x, y + s + 11, 10, '#f3e6c8');
    }
    // Tên vùng.
    if (o.labels !== false) for (const reg of R) label(ctx, reg.nameVi.toUpperCase(), reg.x, reg.y - 26, 11, 'rgba(255,248,230,.82)', true);
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
