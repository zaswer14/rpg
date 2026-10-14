/* Vạn Kiếp — lõi toán và RNG có seed.
 * Mọi chỗ ngẫu nhiên đi qua rng của một Sim (sim.rnd()), không gọi Math.random() trực tiếp:
 * cùng seed thì ra cùng cuộc đời (chia sẻ, replay, test cân bằng).
 */
window.LifeSim = window.LifeSim || {};
(function (G) {
  // Băm chuỗi thành 32 bit (cyrb53 rút gọn) rồi đưa vào mulberry32.
  G.hash = function (str) {
    let h1 = 0xdeadbeef ^ str.length, h2 = 0x41c6ce57 ^ str.length;
    for (let i = 0; i < str.length; i++) {
      const c = str.charCodeAt(i);
      h1 = Math.imul(h1 ^ c, 2654435761); h2 = Math.imul(h2 ^ c, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    return h1 >>> 0;
  };
  G.mulberry32 = function (a) {
    return function () {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      let t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  };
  G.makeRng = seed => G.mulberry32(G.hash(String(seed)));
  G.newSeed = () => Math.random().toString(36).slice(2, 8);

  G.clamp = (x, a, b) => x < a ? a : x > b ? b : x;
  G.lerp = (a, b, t) => a + (b - a) * t;

  // Bộ công cụ ngẫu nhiên gắn vào một nguồn rnd().
  G.tools = function (rnd) {
    const T = {
      rnd,
      chance: p => rnd() < p,
      int: (a, b) => a + Math.floor(rnd() * (b - a + 1)),
      pick: arr => arr[Math.floor(rnd() * arr.length)],
      // Bốc theo trọng số: items là mảng, w là hàm trọng số hoặc tên trường.
      wpick(items, w) {
        const f = typeof w === 'function' ? w : (x => x[w] ?? 1);
        let total = 0; const ws = items.map(x => { const v = Math.max(0, f(x) || 0); total += v; return v; });
        if (total <= 0) return null;
        let r = rnd() * total;
        for (let i = 0; i < items.length; i++) { r -= ws[i]; if (r <= 0) return items[i]; }
        return items[items.length - 1];
      },
      // Bốc key của object {key: weight}.
      wkey(obj) { const ks = Object.keys(obj); return T.wpick(ks, k => obj[k]); },
      gauss() { let u = 0, v = 0; while (!u) u = rnd(); while (!v) v = rnd(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); },
      poisson(l) { const L = Math.exp(-l); let k = 0, p = 1; do { k++; p *= rnd(); } while (p > L); return k - 1; }
    };
    return T;
  };

  // Odds ratio: chỉnh xác suất nền p theo hệ số hoàn cảnh mà không vượt 0..1 (mẹo của 1in8b).
  G.odds = (p, or) => { p = G.clamp(p, 1e-6, 1 - 1e-6); return p * or / (1 - p + p * or); };

  // Φ (Abramowitz–Stegun 26.2.17) và Φ⁻¹ (Acklam) cho phân phối thu nhập log-normal.
  G.ncdf = function (x) {
    const t = 1 / (1 + .2316419 * Math.abs(x));
    const d = .3989423 * Math.exp(-x * x / 2);
    const p = d * t * (.3193815 + t * (-.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
    return x > 0 ? 1 - p : p;
  };
  G.ninv = function (p) {
    p = G.clamp(p, 1e-9, 1 - 1e-9);
    const a = [-39.6968302866538, 220.946098424521, -275.928510446969, 138.357751867269, -30.6647980661472, 2.50662827745924];
    const b = [-54.4760987982241, 161.585836858041, -155.698979859887, 66.8013118877197, -13.2806815528857];
    const c = [-.00778489400243029, -.322396458041136, -2.40075827716184, -2.54973253934373, 4.37466414146497, 2.93816398269878];
    const d = [.00778469570904146, .32246712907004, 2.445134137143, 3.75440866190742];
    const pl = .02425;
    if (p < pl) { const q = Math.sqrt(-2 * Math.log(p)); return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1); }
    if (p > 1 - pl) { const q = Math.sqrt(-2 * Math.log(1 - p)); return -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1); }
    const q = p - .5, r = q * q;
    return (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q / (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
  };
  // σ log-normal từ hệ số Gini: σ = √2 · Φ⁻¹((G+1)/2).
  G.sigmaFromGini = gini => Math.SQRT2 * G.ninv((gini + 1) / 2);

  // Value noise 2D có seed (dựng bản đồ).
  G.noise2 = function (seed) {
    const perm = new Uint8Array(512), r = G.makeRng(seed);
    const p = [...Array(256).keys()];
    for (let i = 255; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [p[i], p[j]] = [p[j], p[i]]; }
    for (let i = 0; i < 512; i++) perm[i] = p[i & 255];
    const val = (x, y) => perm[(perm[x & 255] + y) & 255] / 255;
    const sm = t => t * t * (3 - 2 * t);
    function n(x, y) {
      const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
      const a = val(xi, yi), b = val(xi + 1, yi), c = val(xi, yi + 1), d = val(xi + 1, yi + 1);
      const u = sm(xf), v = sm(yf);
      return G.lerp(G.lerp(a, b, u), G.lerp(c, d, u), v);
    }
    return (x, y, oct = 3) => { let s = 0, amp = 1, f = 1, tot = 0; for (let o = 0; o < oct; o++) { s += n(x * f, y * f) * amp; tot += amp; amp *= .5; f *= 2; } return s / tot; };
  };
})(window.LifeSim);
