/* Bestiary — bestiary(): kiểm tra dữ liệu quái phụ, lập bảng tra và cung cấp hàm sinh quái dùng chung.
 * Cần nạp trước: ../aspects.js, rules.js, species.js, biomes.js.
 *
 * const B = JobLibrary.bestiary();
 *   B.errors / B.warnings          kiểm tra cấu trúc (errors rỗng mới dùng)
 *   B.byId[id], B.byFamily[fam], B.byBiome[biome]
 *   B.table(biome, tier)           → [{species, weight}] loài được sinh ở vùng với Tier nhân vật
 *   B.roll(biome, tier, opt)       → {species, grade, affixes, count}; opt: {rng, eliteBonus, forceGrade}
 *   B.stats(species, grade, tier, affixes) → chỉ số runtime (hp, dmg, speed, w, h, armor, magicResist, status, color…)
 *   B.statusOf(species)            → trạng thái runtime đòn của loài gây ra (hoặc null)
 * Không phụ thuộc game: runtime nào cũng đọc được kết quả stats()/roll().
 */
window.JobLibrary = window.JobLibrary || {};
window.JobLibrary.bestiary = function bestiary() {
  const L = window.JobLibrary, R = L.bestiaryRules || {}, S = L.species || [], BI = L.biomes || {}, X = L.aspects || {};
  const F = R.families || {}, BH = R.behaviors || {}, SZ = R.sizes || {}, GR = R.grades || {}, AF = R.affixes || {};
  const errors = [], warnings = [];
  const byId = {}, byFamily = {}, byBiome = {}, markers = {};
  for (const f of Object.keys(F)) byFamily[f] = [];
  for (const b of Object.keys(BI)) byBiome[b] = [];

  for (const s of S) {
    const at = s.id || '(thiếu id)';
    if (!/^[a-z][a-z0-9_]*$/.test(s.id || '')) errors.push(`${at}: id phải là snake_case`);
    if (byId[s.id]) errors.push(`${at}: trùng id`); byId[s.id] = s;
    if (!F[s.family]) errors.push(`${at}: họ "${s.family}" không có trong rules.families`); else byFamily[s.family].push(s);
    if (!BH[s.behavior]) errors.push(`${at}: kiểu "${s.behavior}" không có trong rules.behaviors`);
    if (!SZ[s.size]) errors.push(`${at}: cỡ "${s.size}" không có`);
    if (!(Number.isInteger(s.tier) && s.tier >= 0 && s.tier <= 5)) errors.push(`${at}: tier phải là số nguyên 0–5`);
    if (s.aspect != null && !X[s.aspect]) errors.push(`${at}: khí chất "${s.aspect}" không có trong aspects.js`);
    if (!s.nameVi || !s.nameEn) errors.push(`${at}: thiếu tên Việt/Anh`);
    if (!s.marker) errors.push(`${at}: thiếu marker`);
    else if (markers[s.marker]) errors.push(`${at}: marker trùng với ${markers[s.marker]}`); else markers[s.marker] = s.id;
    for (const k of ['hp', 'dmg', 'speed']) if (s[k] != null && !(s[k] > 0 && s[k] <= 3)) errors.push(`${at}: hệ số ${k} ngoài (0, 3]`);
    if (s.group && !(s.group.length === 2 && s.group[0] >= 1 && s.group[1] >= s.group[0] && s.group[1] <= 5)) errors.push(`${at}: group phải là [min,max] trong 1–5`);
    if (!(s.habitat || []).length) errors.push(`${at}: chưa có habitat`);
    for (const b of s.habitat || []) if (!BI[b]) errors.push(`${at}: vùng "${b}" không có trong biomes.js`); else if (s.spawn !== false) byBiome[b].push(s);
    if (s.family === 'plant' && s.behavior !== 'rooted' && !s.note) warnings.push(`${at}: thảo yêu không bám chỗ cần ghi note giải thích ngoại lệ`);
    if (s.family === 'ooze' && s.size === 'S') warnings.push(`${at}: nhầy cỡ S không phân tách được — cân nhắc cỡ M`);
  }
  for (const [id, b] of Object.entries(BI)) {
    for (const w of Object.keys(b.weights || {})) {
      if (!byId[w]) errors.push(`biome ${id}: trọng số cho loài không tồn tại "${w}"`);
      else if (!(byId[w].habitat || []).includes(id)) errors.push(`biome ${id}: có trọng số cho "${w}" nhưng loài không sống ở vùng này`);
    }
    if (b.lord && (!byId[b.lord] || byId[b.lord].spawn !== false)) errors.push(`biome ${id}: lord "${b.lord}" phải là loài có spawn:false`);
    const t0 = byBiome[id].filter(s => s.tier <= b.tiers[0] + 1);
    if (!t0.length) errors.push(`biome ${id}: không có loài nào cho Tier ${b.tiers[0]} (Tier gợi ý thấp nhất)`);
    const fams = new Set(byBiome[id].map(s => s.family));
    if (fams.size < 3) warnings.push(`biome ${id}: chỉ ${fams.size} họ quái (nên ≥ 3 để vùng không đơn điệu)`);
  }
  for (const [f, list] of Object.entries(byFamily)) if (list.length < 2) warnings.push(`họ ${f}: chỉ ${list.length} loài`);

  const statusOf = s => (s.aspect && (R.aspectStatus || {})[s.aspect]) || null;
  const flying = s => s.behavior === 'flyer' || s.family === 'spirit';

  function table(biome, tier) {
    const b = BI[biome]; if (!b) return [];
    let list = byBiome[biome].filter(s => s.tier <= tier + 1);
    if (!list.length) list = [...byBiome[biome]].sort((a, z) => a.tier - z.tier).slice(0, 1);
    return list.map(s => ({ species: s, weight: ((b.weights || {})[s.id] ?? 10) * (s.tier > tier ? .4 : 1) * (s.tier < tier - 2 ? .5 : 1) }));
  }
  function pick(list, rng) {
    const total = list.reduce((a, x) => a + x.weight, 0); let r = rng() * total;
    for (const x of list) { r -= x.weight; if (r <= 0) return x.species; }
    return list[list.length - 1] && list[list.length - 1].species;
  }
  function roll(biome, tier, opt = {}) {
    const rng = opt.rng || Math.random, b = BI[biome]; if (!b) return null;
    const s = pick(table(biome, tier), rng); if (!s) return null;
    let grade = opt.forceGrade;
    if (!grade) {
      const r = rng(), alpha = b.alphaChance + (opt.eliteBonus || 0) * .5, elite = b.eliteChance + .02 * tier + (opt.eliteBonus || 0);
      grade = r < alpha ? 'alpha' : r < alpha + elite ? 'elite' : 'normal';
    }
    const pool = Object.keys(AF).filter(a => !(a === 'frostbound' && statusOf(s) === 'chill'));
    const affixes = [];
    while (affixes.length < (GR[grade] || GR.normal).affixes && pool.length) affixes.push(pool.splice(Math.floor(rng() * pool.length), 1)[0]);
    const g = s.group || [1, 1];
    // Tinh anh/thủ lĩnh đi một mình hoặc dẫn một nửa bầy: ổ không vừa đông vừa mạnh.
    const count = grade === 'normal' ? g[0] + Math.floor(rng() * (g[1] - g[0] + 1)) : Math.max(1, Math.floor(g[0] / 2));
    return { species: s, grade, affixes, count };
  }
  function stats(s, grade = 'normal', tier = 0, affixes = []) {
    const z = SZ[s.size], g = GR[grade] || GR.normal, eff = Math.max(s.tier, tier - 1);
    const hp = Math.round(z.hp * (s.hp || 1) * g.hp * (1 + Math.min(5, eff) * .22));
    const dmg = Math.round(z.dmg * (s.dmg || 1) * g.dmg * (1 + .12 * eff));
    const armor = z.armor + (s.family === 'construct' ? 3 : s.family === 'dragon' ? 2 : 0) + (affixes.includes('armored') ? 4 : 0);
    const magicResist = 1 + (s.family === 'elemental' || s.family === 'fiend' ? 3 : 0) + (affixes.includes('warded') ? 6 : 0);
    const scale = g.scale;
    return {
      hp, dmg, armor, magicResist,
      speed: z.speed * (s.speed || 1) * (1 + .04 * eff),
      w: Math.round(z.w * scale), h: Math.round(z.h * scale),
      knock: z.knock * (s.family === 'dragon' || s.family === 'plant' ? 0 : 1),
      flying: flying(s), status: statusOf(s),
      color: s.aspect && X[s.aspect] ? X[s.aspect].color : null,
      bounty: Math.round(g.bounty * (1 + .25 * s.tier)), effTier: eff
    };
  }
  const stat = {
    species: S.length, spawnable: S.filter(s => s.spawn !== false).length, families: Object.keys(F).length,
    biomes: Object.keys(BI).length, behaviors: Object.keys(BH).length, affixes: Object.keys(AF).length,
    byTier: [0, 1, 2, 3, 4, 5].map(t => S.filter(s => s.tier === t).length)
  };
  return { rules: R, families: F, behaviors: BH, sizes: SZ, grades: GR, affixes: AF, biomes: BI, species: S,
    byId, byFamily, byBiome, table, roll, stats, statusOf, flying, errors, warnings, stat };
};
