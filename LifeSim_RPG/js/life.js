/* Vạn Kiếp — BỘ MÁY MÔ PHỎNG MỘT ĐỜI.
 * Mô hình lấy từ 1in8b (research/01_Life_Sim_1in8b.md), viết lại cho bối cảnh RPG:
 *   newLife()  bốc vùng sinh, khu dân cư, chủng tộc, giới, tầng lớp, giáo phái, gia đình → S
 *   planYear() xếp 1–3 sự kiện, ≤ 2 quyết định và các lượt săn lên trục 0→1 của năm
 *   tick(dt)   thời gian trôi; tới mốc thì bắn; quyết định làm dừng tới khi chọn
 *   endYear()  hiệu ứng focus theo tỉ lệ thời gian → chỉ số trôi về mục tiêu → các hệ con (khai báo thứ tự) → tung xúc xắc tử vong
 *   die()      chết; 20% trỗi dậy thành Bộ Xương mang theo kỹ năng chủ đạo (mastery cao nhất) của kiếp đó.
 * Mọi trạng thái của một đời nằm trong S (JSON thuần, lưu được). Giao diện chỉ nghe qua hook.
 * Một Sim = một nguồn RNG riêng: chạy song song nhiều đời headless (đồng niên, trang cân bằng) không lẫn nhau.
 */
window.LifeSim = window.LifeSim || {};
(function (G) {
  const J = window.JobLibrary;
  G.REINCARNATE_P = 0.20;
  G.LEVEL_FOR_TIER = { 1: 3, 2: 12, 3: 24, 4: 36, 5: 48 };
  G.MAX_LEVEL = 60;
  G.tierOf = level => Math.min(5, Math.floor(level / 10));
  // Tên Việt của mastery (id trong thư viện là tiếng Anh).
  G.MASTERY_VI = { Sword:"Kiếm", Axe:"Rìu", Spear:"Thương", Shield:"Khiên", Throwing:"Ném", Bow:"Cung", Crossbow:"Nỏ", Firearm:"Hỏa khí", Stealth:"Ẩn thân", Dagger:"Dao găm", Trap:"Bẫy", Fire:"Hỏa thuật", Frost:"Băng thuật", Lightning:"Lôi thuật", Arcane:"Huyền thuật", Necromancy:"Tử linh thuật", Soul:"Linh hồn", Curse:"Nguyền rủa", Engineering:"Cơ khí", Alchemy:"Luyện kim", Construct:"Chế tạo", Riding:"Cưỡi thú", Taming:"Thuần thú", Unarmed:"Tay không", Body:"Thân thể", Spirit:"Tâm linh" };
  G.mv = m => G.MASTERY_VI[m] || m;

  // ── Khởi tạo dữ liệu dùng chung (một lần) ──
  G.init = function () {
    if (G.ready) return G;
    // Bảng khu của game là nguồn sự thật về nơi ở: ghi biome của vùng vào habitat (trong bộ nhớ) cho loài thư viện
    // được thả vào vùng mới, để bộ kiểm tra bestiary thấy đúng sinh thái. Không sửa file thư viện.
    const sp = Object.fromEntries(J.species.map(s => [s.id, s]));
    for (const r of [...G.REGIONS, ...G.SEAS]) for (const z of r.zones) for (const id of Object.keys(z.spawns))
      if (sp[id] && !sp[id].habitat.includes(r.biome)) sp[id].habitat = [...sp[id].habitat, r.biome];
    G.B = J.bestiary();
    G.REGION = Object.fromEntries(G.REGIONS.map(r => [r.id, r]));
    G.SEA = Object.fromEntries(G.SEAS.map(r => [r.id, r]));
    // Khu (tầng) đất và biển chung một bảng tra; tầng biển có sea: true, region là kiểu vùng biển.
    G.ZONE = {};
    for (const r of G.REGIONS) r.zones.forEach((z, i) => { G.ZONE[z.id] = { zone: z, region: r, index: i }; });
    for (const r of G.SEAS) r.zones.forEach((z, i) => { G.ZONE[z.id] = { zone: z, region: r, index: i, sea: true }; });
    G.jobs = J.compose({ races: Object.keys(J.races) });
    G.MASTERY = {};
    for (const [sid, sc] of Object.entries(J.schools)) for (const m of sc.masteries) G.MASTERY[m] = sid;
    G.check = G.validateWorld(G.B);
    G.check.errors.push(...G.B.errors.map(e => 'bestiary: ' + e), ...G.jobs.errors.map(e => 'compose: ' + e));
    G.map = G.buildMap();
    G.check.warnings.push(...G.map.warnings);
    if (G.check.errors.length) console.error('[Vạn Kiếp] lỗi dữ liệu:\n' + G.check.errors.join('\n'));
    G.ready = true;
    return G;
  };

  // ── Bảng sống: Gompertz theo lượt, tìm nhị phân B để tuổi thọ kỳ vọng khớp le (cache theo chủng tộc/giới/độ giàu) ──
  const LT = {};
  G.lifeTable = function (race, sex, wealth) {
    const key = race + sex + Math.round(wealth * 10);
    if (LT[key]) return LT[key];
    const R = G.RACES[race], w = Math.round(wealth * 10) / 10;
    const leT = R.le / R.ypt * (R.undead || R.construct ? 1 : (.86 + .26 * w) * (sex === 'f' ? 1.03 : .97));
    const adultT = Math.max(1, Math.round(R.adult / R.ypt));
    const maxT = Math.ceil(leT * 1.9), g = .088 * 60 / leT, A = .002;
    const im = R.im * (1.5 - w);
    const build = B => {
      const q = [];
      for (let x = 0; x <= maxT; x++) {
        let v;
        if (R.undead || R.construct) v = 1 - Math.exp(-(A + B * Math.exp(g * x)));
        else if (x === 0) v = im;
        else if (x < 5 && x < adultT) v = im * [0, .28, .14, .09, .06][x];
        else if (x < adultT) v = im * .04 + .001;
        else v = 1 - Math.exp(-(A + B * Math.exp(g * x)));
        q.push(Math.min(1, v));
      }
      q[maxT] = 1;
      return q;
    };
    const e0 = q => { let l = 1, e = 0; for (const v of q) { const d = l * v; e += l - d / 2; l -= d; } return e; };
    let lo = Math.log(1e-12), hi = Math.log(1), q = null;
    for (let k = 0; k < 50; k++) { const mid = (lo + hi) / 2; q = build(Math.exp(mid)); if (e0(q) > leT) lo = mid; else hi = mid; }
    return LT[key] = { q, leT, adultT };
  };

  // ── Thu nhập: phân vị pct trong vùng → bạc/năm, log-normal với σ suy từ Gini ──
  G.median = reg => 20 + 90 * reg.wealth;
  G.incomeAt = (reg, pct) => { const s = G.sigmaFromGini(reg.gini); return G.median(reg) * Math.exp(s * G.ninv(pct) - s * s / 2); };

  // ── Focus ──
  G.FOCUS = {
    play:      { nameVi:'Chơi đùa',    icon:'🪁', stages:['child'],                         eff:{ h:8, so:6, hl:2 } },
    study:     { nameVi:'Học chữ',     icon:'📜', stages:['child','teen','adult','elder'],  eff:{ sm:9, h:-2 }, train:{ Arcane:2, Alchemy:1 } },
    chores:    { nameVi:'Phụ việc nhà',icon:'🧺', stages:['child','teen'],                  eff:{ hl:2, so:3 } },
    train:     { nameVi:'Luyện tập',   icon:'⚔', stages:['child','teen','adult','elder'],  eff:{ hl:2, h:-1 } },
    work:      { nameVi:'Làm ăn',      icon:'⚒', stages:['teen','adult','elder'],          eff:{ so:-1 } },
    hunt:      { nameVi:'Săn quái',    icon:'🏹', stages:['teen','adult','elder'],          eff:{ h:1 } },
    adventure: { nameVi:'Phiêu lưu',   icon:'🗺', stages:['adult','elder'],                 eff:{ h:3, so:-2 } },
    family:    { nameVi:'Gia đình',    icon:'🏠', stages:['teen','adult','elder'],          eff:{ so:10, h:5 } },
    faith:     { nameVi:'Tu hành',     icon:'🕯', stages:['child','teen','adult','elder'],  eff:{ h:3, sm:2 }, train:{ Spirit:3 } },
    rest:      { nameVi:'Nghỉ ngơi',   icon:'🌙', stages:['adult','elder'],                 eff:{ hl:9, h:4 } }
  };
  G.STAGES = { infant:'Sơ sinh', child:'Thơ ấu', teen:'Thiếu niên', adult:'Trưởng thành', elder:'Tuổi già' };

  // Bệnh/thương tật: mult nhân vào nguy cơ chết, cause gợi ý nguyên nhân.
  G.CONDS = {
    wound:   { nameVi:'Vết thương cũ', mult:1.35, heal:.35 },
    maimed:  { nameVi:'Tàn tật',       mult:1.25, heal:0, power:-.25 },
    fever:   { nameVi:'Sốt kéo dài',   mult:1.8,  heal:.5, cause:'fever' },
    cough:   { nameVi:'Ho dai dẳng',   mult:1.5,  heal:.2, cause:'lung' },
    curse:   { nameVi:'Lời nguyền',    mult:1.6,  heal:.15, cause:'curse' },
    poison:  { nameVi:'Nhiễm độc',     mult:1.5,  heal:.4 },
    frail:   { nameVi:'Suy nhược',     mult:1.4,  heal:.25 },
    crack:   { nameVi:'Xương nứt',     mult:1.4,  heal:.3 },
    rust:    { nameVi:'Rỉ khớp',       mult:1.4,  heal:.3, cause:'rust' },
    hunted:  { nameVi:'Bị truy lùng',  mult:1.7,  heal:.3, cause:'purge' }
  };

  class Sim {
    constructor(opt = {}) {
      this.seed = String(opt.seed ?? G.newSeed());
      this.rs = G.hash(this.seed);
      const rnd = () => {
        let a = this.rs = (this.rs + 0x6D2B79F5) | 0;
        let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
      };
      Object.assign(this, G.tools(rnd));
      this.headless = !!opt.headless;
      this.hook = Object.assign({ log() {}, decision() {}, year() {}, death() {}, hunt() {} }, opt.hook || {});
      this.S = null;
    }

    // ═════════ Tiện ích đọc trạng thái ═════════
    R(S = this.S) { return G.RACES[S.race]; }
    reg(S = this.S) { return G.REGION[S.loc]; }
    years(S = this.S) { return Math.round(S.age * this.R(S).ypt); }
    lt(S = this.S) { return G.lifeTable(S.race, S.sex, G.REGION[S.home.region].wealth); }
    stage(S = this.S) {
      const R = this.R(S), y = S.age * R.ypt, t = this.lt(S);
      if (R.undead) return S.age >= t.leT * .8 ? 'elder' : 'adult';
      if (!R.construct && S.age === 0) return 'infant';
      if (y < R.adult * .6) return 'child';
      if (y < R.adult) return 'teen';
      return S.age >= t.leT * .78 ? 'elder' : 'adult';
    }
    ctier(S = this.S) { return G.tierOf(S.level); }
    job(S = this.S) { return G.jobs.byId[S.job]; }
    jobName(S = this.S, id = S.job) { return G.jobs.displayName(S.race, id).vi; }
    dominant(S = this.S) {
      let best = null;
      for (const [m, v] of Object.entries(S.mastery)) if (v > 0 && (!best || v > best.value)) best = { skill: m, value: Math.round(v) };
      return best;
    }
    access(S, school) {
      const sc = J.races[S.race].schools;
      return sc.native.includes(school) ? 'native' : sc.foreign.includes(school) ? 'foreign' : 'forbidden';
    }
    // Sức mạnh quy đổi theo Tier (so trực tiếp với Tier quái).
    power(S = this.S) {
      const j = this.job(S), st = this.stage(S);
      const schools = j && j.tier > 0 ? [j.school, ...(j.schoolAlt || [])] : [S.path || 'combat'];
      let m = 0;
      for (const [k, v] of Object.entries(S.mastery)) if (schools.includes(G.MASTERY[k]) || (S.inherited && S.inherited.skill === k)) m = Math.max(m, v);
      let p = .35 + S.level / 10 + (j ? j.tier : 0) * .12 + m / 220 + S.gear * .05 - (100 - S.hl) / 220;
      for (const c of S.conds) p += (G.CONDS[c.id].power || 0);
      if (st === 'elder') p -= .25 + (S.age - this.lt(S).leT * .78) * .02;
      if (st === 'teen') p -= .15;
      return p;
    }

    // ═════════ Ghi sổ ═════════
    log(text, kind = 'info', fact = null) {
      const S = this.S, e = { age: S.age, yrs: this.years(S), wy: S.world.year, kiep: S.kiep, text, kind, fact };
      if (!this.headless) { S.log.push(e); if (S.log.length > 500) S.log.splice(0, S.log.length - 500); }
      this.hook.log(e);
      return e;
    }
    add(stat, n) { const S = this.S; S[stat] = G.clamp(S[stat] + n, 0, 100); }
    money(n) { this.S.gold = Math.round(this.S.gold + n); }
    gain(m, amount) {
      const S = this.S; if (!(m in S.mastery)) return 0;
      const acc = this.access(S, G.MASTERY[m]);
      let mult = acc === 'native' ? 1.15 : acc === 'foreign' ? .8 : 0;
      if (S.inherited && S.inherited.skill === m) mult = Math.max(mult, .6);
      if ((m === 'Taming' || m === 'Riding') && G.lawHere(S, 'beast_bond')) mult *= 1.3;
      const cur = S.mastery[m], d = amount * mult * Math.max(0, 1 - cur / 115);
      S.mastery[m] = Math.min(100, cur + d);
      return d;
    }
    addXp(n) {
      const S = this.S; S.xp += Math.round(n);
      let up = 0;
      while (S.level < G.MAX_LEVEL && S.xp >= G.xpNeed(S.level)) { S.xp -= G.xpNeed(S.level); S.level++; up++; }
      if (up) {
        const t0 = G.tierOf(S.level - up), t1 = G.tierOf(S.level);
        this.log(`Lên cấp ${S.level}.` + (t1 > t0 ? ` Sức mạnh chạm Tier ${t1}: những khu nguy hiểm hơn đã mở.` : ''), t1 > t0 ? 'big' : 'good');
      }
    }
    cond(id) { const S = this.S; let c = S.conds.find(c => c.id === id); if (!c) { c = { id, years: 0 }; S.conds.push(c); } return c; }
    hasCond(id) { return this.S.conds.some(c => c.id === id); }
    // Tên lấy từ kho tên (data/names.js); Bộ Xương mới trỗi dậy không có tên.
    name(race, sex) {
      if (G.RACES[race].undead) return 'Vô Danh';
      return G.personName(race, sex, this.rnd);
    }
    given(S = this.S) { return S.name.split(' ')[0]; }
    // Câu "sổ tay" đi kèm sự kiện (tương đương dòng dữ kiện thật của 1in8b): rút từ luật họ quái của thư viện.
    factOf(sp) { const f = G.B.families[sp.family]; return `Sổ tay lữ khách · ${f.nameVi}: ${f.ruleVi}`; }
    // Chọn một loài trong khu (không giới hạn Tier — chỉ dùng cho chuyện kể, không phải trận đánh).
    monsterIn(zone) { const id = this.wkey(zone.spawns); return G.B.byId[id]; }

    // ═════════ Sinh ra ═════════
    newLife(opt = {}) {
      G.init();
      const T = this;
      if (!G.realm) G.useWorld('varen');
      // Thế giới phải gắn trước khi bốc nơi sinh: khu dân cư đã sụp / mới lập, tỉnh đã đổi chủ (js/dynamic.js).
      const world = opt.world || this.newWorld();
      if (world.lastDeath === world.year) world.year++;   // năm kiếp trước mất đã chạy hệ con; kiếp này bắt đầu từ năm sau
      G.bindWorld(world);
      // Nơi sinh (research/05 mục 7): bốc khu dân cư theo số người sống (đô thị + vùng quê quanh nó; Bộ Xương không sinh con),
      // rồi bốc sinh trong khu (đô thị) hay ở vùng quê quanh khu theo tỉ lệ dân.
      const living = s => 1 - (s.races.skeleton || 0) / 100;
      const raceW = s => opt.race ? (s.races[opt.race] || 0) / 100 : 1;
      const cands = G.realm.settlements.filter(s => s.tier !== 'ruin' && (!opt.region || s.region === opt.region));
      const st = T.wpick(cands, s => G.popOf(s) * living(s) * raceW(s)) || cands[0];
      const reg = G.REGION[st.region];
      const urban = st.tier !== 'hamlet' && T.chance(st.urban / Math.max(1, G.popOf(st)));
      const races = Object.fromEntries(Object.entries(st.races).filter(([k]) => !G.RACES[k].undead));
      const race = opt.race || T.wkey(races);
      const R = G.RACES[race];
      const sex = R.sexes.length > 1 ? (T.chance(.5) ? 'm' : 'f') : R.sexes[0];
      // Tầng lớp: phân phối nền dịch theo độ giàu vùng; kinh đô, thành phố thêm khá giả; vùng quê lệch về nông hộ.
      const rich = { capital: 1.5, city: 1.3, town: 1.1 }[st.tier] || 1;
      const qw = [0, .14, .38, .28, .15, .05].map((w, k) => k ? w * Math.exp((k - 3) * (reg.wealth - .5) * 1.8) * (urban && k >= 3 ? rich : 1) * (!urban && k === 2 ? 1.4 : 1) * (!urban && k >= 4 ? .5 : 1) : 0);
      const q = +T.wpick([1, 2, 3, 4, 5], k => qw[k]);
      const cr = G.CLASSES[q].pctRange;
      const faith = T.wkey(st.faiths);
      const lt = G.lifeTable(race, sex, reg.wealth);
      const mastery = Object.fromEntries(Object.keys(G.MASTERY).map(m => [m, 0]));
      const S = this.S = {
        v: 2, seed: this.seed, kiep: 1, name: '', sex, race, undead: false,
        age: 0, t: 0, home: { region: reg.id, settlement: st.id }, loc: reg.id, born: { region: reg.id, settlement: st.id, urban },
        urban, nation: st.nation >= 0 ? st.nation : null, worldSeed: G.realm.seed,
        q, pct: G.lerp(cr[0], cr[1], T.rnd()), gold: 0, work: null, path: null,
        hl: G.clamp(68 + reg.wealth * 18 + q * 2 + T.gauss() * 8, 25, 98), h: 62, so: 55, sm: 8 + q * 3,
        level: 1, xp: 0, mastery, job: J.races[race].origin.id, jobHist: [], faith: faith === 'none' ? null : faith, devotion: 0, gear: 0,
        focus: 'play', auto: true, focusTime: {}, zoneSel: null, reckless: false,
        traits: { bold: T.rnd(), studious: T.rnd(), pious: T.rnd(), social: T.rnd() },
        family: { parents: [], sibs: [], spouse: null, kids: [] },
        conds: [], flags: {}, recent: {}, recentDec: {}, queue: [], pending: null,
        years: [], kills: {}, hunts: { n: 0, won: 0, lost: 0, fled: 0, maxGap: -9, byGap: {} }, fame: 0,
        log: [], path2: [], dead: false, cause: null, rose: null, lineage: opt.lineage || [], inherited: null,
        world, peers: [], peerSeen: {}
      };
      S.birthYear = S.world.year;
      S.name = this.name(race, sex);
      // Năng khiếu bẩm sinh: vài điểm ở trường phái bản địa (đảm bảo luôn có kỹ năng chủ đạo dù chết sớm).
      const nat = J.races[race].schools.native;
      for (let k = 0; k < 2; k++) { const sc = J.schools[T.pick(nat)]; S.mastery[T.pick(sc.masteries)] += T.int(1, 4); }
      // Gia đình.
      if (!R.construct) {
        const adultY = R.adult;
        const mAge = Math.round(adultY + 4 + Math.abs(T.gauss()) * adultY * .35), fAge = mAge + T.int(0, Math.max(2, Math.round(adultY * .3)));
        S.family.parents.push({ role: 'mẹ', name: this.name(race, 'f'), age: mAge, alive: true });
        if (!T.chance(.1)) S.family.parents.push({ role: 'cha', name: this.name(race, 'm'), age: fAge, alive: true });
        const nSib = T.poisson(1.6);
        for (let k = 0; k < nSib; k++) { const sx = T.chance(.5) ? 'm' : 'f'; S.family.sibs.push({ name: this.name(race, sx).split(' ')[0], sex: sx, age: T.int(1, Math.max(1, Math.round(adultY * .5))), alive: true }); }
        if (T.chance(.03)) { S.family.parents.forEach(p => p.alive = false); S.flags.orphan = true; S.q = Math.min(S.q, 2); S.pct = Math.min(S.pct, .3); }
      } else {
        S.family.parents.push({ role: 'thợ đúc', name: this.name('dwarf', 'm'), age: 120, alive: true });
      }
      if (T.chance(.04)) S.flags.omen = T.pick(['fire', 'frost', 'storm', 'moon', 'light', 'dark']);
      if (T.chance(.012) && q <= 3) S.flags.bastard = true;
      // Định vị trên bản đồ.
      S.pos = G.homePos(st, urban, T.rnd); S.path2.push(S.pos);
      // Lời mở đầu.
      const where = urban ? st.name : `vùng quê quanh ${st.name}`, realmN = G.nationOf(st);
      const parentsTxt = S.flags.orphan ? 'Không ai nhận là cha mẹ bạn; bà mụ gửi bạn vào nhà tế bần.' :
        R.construct ? `Bạn được đúc ở ${st.name}. Thợ đúc ${S.family.parents[0].name} gõ ba lần lên vỏ bạn, lõi bắt đầu quay.` :
        `Mẹ bạn ${S.family.parents[0].name}, ${S.family.parents[0].age} tuổi.` + (S.family.parents[1] ? ` Cha ${S.family.parents[1].name}, ${S.family.parents[1].age} tuổi.` : ' Cha bạn không có mặt.');
      this.log(`Năm ${S.world.year} lịch Varen. Bạn chào đời ở ${where} (${G.TIER_VI[st.tier].toLowerCase()}, ${reg.nameVi}${realmN ? ', ' + realmN.name : ', đất vô chủ'}): ${J.races[race].nameVi}${sex === 'n' ? '' : sex === 'm' ? ', con trai' : ', con gái'}, nhà ${G.CLASSES[S.q].nameVi.toLowerCase()}. Tên bạn là ${S.name}.`, 'big', reg.lore);
      this.log(parentsTxt + (S.family.sibs.length ? ` Bạn có ${S.family.sibs.length} anh chị.` : ''), 'info');
      if (S.faith) this.log(`Gia đình theo ${J.faiths[S.faith].nameVi}.`, 'info');
      if (S.flags.omen) this.log(`Đêm bạn sinh có sao chổi. Bà đỡ bảo đứa trẻ mang khí chất ${J.aspects[S.flags.omen].nameVi}.`, 'big');
      // Tuổi thọ kỳ vọng — như "trong số trẻ sinh cùng năm, X% sống tới…" của 1in8b.
      const surv = a => { let l = 1; for (let x = 0; x < Math.min(a, lt.q.length); x++) l *= 1 - lt.q[x]; return l; };
      const aT = Math.round(lt.adultT);
      this.log(`Trong số ${J.races[race].nameVi} sinh cùng năm ở ${reg.nameVi}, khoảng ${Math.round(surv(aT) * 100)}% sống tới tuổi trưởng thành (${R.adult}) và ${Math.round(surv(Math.round(lt.leT)) * 100)}% sống tới ${Math.round(lt.leT * R.ypt)}.`, 'info');
      if (!opt.noPeers && !this.headless) { this.makePeers(); G.bindWorld(S.world); }   // đồng niên sống trên bản sao thế giới; gắn lại thế giới của đời này
      this.planYear();
      return S;
    }

    // Trỗi dậy: chủng tộc Bộ Xương, nơi chết, mang một kỹ năng chủ đạo của kiếp trước.
    rise() {
      const old = this.S; if (!old || !old.dead || !old.rose) return null;
      const dom = old.rose;
      const lineage = [...old.lineage, G.summary(old, this)];
      const mastery = Object.fromEntries(Object.keys(G.MASTERY).map(m => [m, 0]));
      if (dom) mastery[dom.skill] = dom.value;
      const reg = G.REGION[old.loc];
      const grave = reg.zones[0];
      const S = this.S = {
        v: 2, seed: this.seed, kiep: old.kiep + 1, name: `Bộ Xương của ${old.name.split(' ')[0]}`, sex: 'n', race: 'skeleton', undead: true,
        age: 0, t: 0, home: { region: reg.id, settlement: null }, loc: reg.id, born: { region: reg.id, settlement: null },
        urban: false, nation: null, worldSeed: old.worldSeed,
        q: 1, pct: .02, gold: 0, work: null, path: dom ? G.MASTERY[dom.skill] : 'death',
        hl: 78, h: 30, so: 8, sm: Math.round(old.sm * .3),
        level: 1, xp: 0, mastery, job: J.races.skeleton.origin.id, jobHist: [], faith: null, devotion: 0, gear: 0,
        focus: 'train', auto: old.auto, focusTime: {}, zoneSel: null, reckless: false,
        traits: { ...old.traits, social: old.traits.social * .4 },
        family: { parents: [], sibs: [], spouse: null, kids: [] },
        conds: [], flags: { undead: true, pastName: old.name, pastRace: old.race }, recent: {}, recentDec: {}, queue: [], pending: null,
        years: [], kills: {}, hunts: { n: 0, won: 0, lost: 0, fled: 0, maxGap: -9, byGap: {} }, fame: 0,
        log: [], path2: [], dead: false, cause: null, rose: null, lineage, inherited: dom ? { ...dom } : null,
        world: old.world, peers: old.peers, peerSeen: old.peerSeen
      };
      if (S.world.lastDeath === S.world.year) S.world.year++;
      S.birthYear = S.world.year;
      S.pos = G.map.pointIn(reg.id, 0, this.rnd); S.path2.push(S.pos);
      const here = G.nationAtPos(S.pos[0], S.pos[1]); S.nation = here ? here.idx : null;
      this.log(`Năm ${S.world.year}. Đất ở ${grave.nameVi} (${reg.nameVi}) nứt ra. Một bộ xương đứng dậy, không nhớ tên mình, chỉ nhớ một điều.`, 'big');
      if (dom) this.log(`Kỹ năng chủ đạo của kiếp trước còn trong xương: ${G.mv(dom.skill)} ${dom.value}. Mọi thứ khác đã mục.`, 'big', 'Bộ Xương: không đói, không bệnh, không có con; tuổi tính bằng năm kể từ khi trỗi dậy. Hồn phai dần theo thời gian.');
      this.log('Người sống sẽ sợ bạn. Tu sĩ Quang Minh sẽ săn bạn. Hắc Giáo sẽ mời bạn.', 'info');
      this.planYear();
      return S;
    }

    // Thế giới động của đời này (js/dynamic.js): mật độ quái, dịch, quốc gia, khu dân cư, sử biên niên.
    newWorld() { return G.makeWorld(this); }

    // Đồng niên: 4 đời khác sinh cùng năm, chạy headless tới chết ngay lúc bắt đầu.
    makePeers() {
      const S = this.S;
      S.peers = [];
      for (let k = 0; k < 4; k++) {
        const sub = new Sim({ seed: this.seed + ':peer' + k, headless: true });
        sub.newLife({ noPeers: true, world: JSON.parse(JSON.stringify(S.world)) });
        sub.runToDeath();
        const P = sub.S, reg = G.REGION[P.born.region], bs = G.SET[P.born.settlement];
        S.peers.push({ name: P.name, race: P.race, region: P.born.region, regionName: reg.nameVi, settlement: bs ? bs.name : null,
          years: sub.years(P), diedYear: P.world.year, cause: P.cause, rose: !!P.rose, level: P.level, job: sub.jobName(P), pos: P.pos, kiep: P.kiep,
          bornPos: P.path2[0] || P.pos });
      }
    }

    // ═════════ Năm ═════════
    planYear() {
      const S = this.S, st = this.stage(S);
      S.t = 0; S.queue = []; S.focusTime = {};
      if (S.auto || !G.FOCUS[S.focus] || !G.FOCUS[S.focus].stages.includes(st)) S.focus = G.autoFocus(this);
      this.ensureZone();
      const items = [];
      const nEv = 1 + (this.chance(.6) ? 1 : 0) + (this.chance(.25) ? 1 : 0);
      for (let k = 0; k < nEv; k++) items.push({ at: .08 + this.rnd() * .84, kind: 'event' });
      const decs = G.scheduledDecisions(this).slice(0, 2);
      decs.forEach((id, k) => items.push({ at: .2 + k * .35 + this.rnd() * .1, kind: 'decision', id }));
      // 7 nhịp săn đều nhau; nhịp nào trùng focus săn/phiêu lưu thì đánh (đổi focus giữa năm có tác dụng ngay).
      for (let k = 0; k < 7; k++) items.push({ at: (k + .5) / 7, kind: 'slot', k });
      S.queue = items.sort((a, b) => a.at - b.at);
    }

    tick(dt) {
      const S = this.S;
      if (!S || S.dead || S.pending) return;
      G.bindWorld(S.world);
      S.focusTime[S.focus] = (S.focusTime[S.focus] || 0) + dt;
      S.t += dt;
      while (S.queue.length && S.queue[0].at <= S.t && !S.pending && !S.dead) this.fire(S.queue.shift());
      if (S.t >= 1 && !S.pending && !S.dead) this.endYear();
    }

    fire(it) {
      const S = this.S;
      if (it.kind === 'event') { const ev = G.pickEvent(this); if (ev) G.runEvent(this, ev); }
      else if (it.kind === 'decision') this.openDecision(it.id);
      else if (it.kind === 'slot') {
        if (S.focus === 'hunt') this.hunt(false);
        else if (S.focus === 'adventure' && it.k % 2 === 0) this.hunt(true);
      }
    }

    openDecision(id) {
      const S = this.S, D = G.DECISIONS[id]; if (!D) return;
      if (!D.when(S, this)) return;
      const d = D.build(S, this); if (!d || !d.choices.length) return;
      S.recentDec[id] = S.age;
      S.pending = { id, ...d };
      if (this.headless || (S.auto && this.autoDecide)) { this.choose(D.auto ? D.auto(S, this, d) : d.choices[0].k); return; }
      this.hook.decision(S.pending);
    }
    choose(k) {
      const S = this.S, P = S.pending; if (!P) return;
      S.pending = null;
      const D = G.DECISIONS[P.id];
      const choice = P.choices.find(c => c.k === k) || P.choices[0];
      const out = D.apply(S, this, choice.k, choice);
      if (out) this.log(`${P.title}: ${choice.label}. ${out}`, 'choice');
    }

    endYear() {
      const S = this.S, R = this.R(S), reg = this.reg(S), st = this.stage(S);
      // 1. Focus theo tỉ lệ thời gian.
      const tot = Object.values(S.focusTime).reduce((a, b) => a + b, 0) || 1;
      for (const [f, t] of Object.entries(S.focusTime)) {
        const F = G.FOCUS[f], share = t / tot; if (!F) continue;
        // Học chữ hiệu quả theo trường của khu đang ở (research/05 mục 6).
        const fm = f === 'study' ? G.schoolMult(S) : 1;
        for (const [k, v] of Object.entries(F.eff || {})) this.add(k, v * share * (k === 'sm' ? fm : 1));
        for (const [m, v] of Object.entries(F.train || {})) this.gain(m, v * share * 2 * fm);
        if (f === 'train') this.trainYear(share);
        if (f === 'work') this.workYear(share);
        if (f === 'chores') this.gain('Body', 1.5 * share);
        if (f === 'faith' && S.faith) {
          const fav = (J.faiths[S.faith].races.favored || []).includes(S.race) ? 1.5 : 1;
          S.devotion = Math.min(100, S.devotion + 9 * share * fav);
        }
        if (f === 'study') this.addXp(15 * share * fm);
      }
      // 2. Tiền: chi phí sống của người lớn.
      if (['adult', 'elder', 'teen'].includes(st) && !(st === 'teen' && S.family.parents.some(p => p.alive))) {
        const cost = S.undead ? 0 : G.median(reg) * .5 * (.55 + .15 * S.q);
        this.money(-cost);
        if (S.gold < 0) { this.add('h', -6); this.add('hl', -3); if (S.gold < -G.median(reg)) { S.gold = 0; if (G.lawHere(S, 'caste')) { this.add('h', -8); this.log('Nợ chồng nợ. Bạn bán hết đồ đạc; luật đẳng cấp vẫn giữ bạn ở tầng lớp cũ, nhưng ai cũng biết.', 'bad'); } else { S.q = Math.max(1, S.q - 1); this.log('Nợ chồng nợ. Bạn bán hết đồ đạc và rơi xuống tầng lớp thấp hơn.', 'bad'); } } }
      }
      // 3. Chỉ số trôi về mục tiêu (quán tính 25%/năm).
      G.driftStats(this);
      // 4. Các hệ con theo thứ tự khai báo.
      for (const sys of G.SYSTEMS) { if (S.dead) return; if (!sys.when || sys.when(S, this)) sys.run(S, this); }
      if (S.dead) return;
      // 5. Lịch sử.
      S.years.push({ age: S.age, yrs: this.years(S), hl: Math.round(S.hl), h: Math.round(S.h), so: Math.round(S.so), sm: Math.round(S.sm), gold: S.gold, level: S.level, loc: S.loc });
      // Kiểm tra NaN (mẹo 1in8b: phát hiện sớm thay vì để lan).
      for (const k of ['hl', 'h', 'so', 'sm', 'gold', 'pct', 'level', 'xp']) if (!Number.isFinite(S[k])) { console.error('NaN ở', k, S); S[k] = 50; }
      // 6. Xúc xắc tử vong.
      const p = this.deathProb();
      if (this.rnd() < p) { this.die(this.pickCause()); return; }
      // 7. Sang năm.
      S.age++;
      S.world.year += R.ypt;
      const st2 = this.stage(S);
      if (st2 !== st) this.log(`Bạn bước vào tuổi ${G.STAGES[st2].toLowerCase()}.`, 'info');
      this.hook.year(S);
      this.planYear();
    }

    deathProb() {
      const S = this.S, t = this.lt(S), reg = this.reg(S), rs = G.local(S), st = this.stage(S);
      const q = t.q[Math.min(S.age, t.q.length - 1)];
      let m = Math.exp((60 - S.hl) / 28);
      m *= [0, 1.45, 1.15, 1, .86, .74][S.q];
      for (const c of S.conds) m *= G.CONDS[c.id].mult;
      // Nơi ở (js/state.js): dịch nặng hơn ở thành lớn; trẻ nhỏ theo thầy thuốc của khu; lính nghĩa vụ chết trận nhiều hơn.
      if (!this.R(S).undead && !this.R(S).construct) m *= 1 + rs.plague * 1.6 * G.plagueMult(S);
      if (st === 'infant' || st === 'child') m *= G.healerMult(S);
      if (st !== 'infant') m *= 1 + rs.war * (st === 'adult' ? .5 : .2) * (S.flags.soldier ? 2 : 1) + rs.raid * .5;
      if (S.age >= t.leT * .85) m = Math.pow(m, .6);
      m = G.clamp(m, .25, 9);
      return 1 - Math.pow(1 - q, m);
    }
    pickCause() {
      const S = this.S, reg = this.reg(S), rs = G.local(S), R = this.R(S);
      let st = this.stage(S); if (st === 'teen') st = 'child';
      const W = G.WORKS[S.work] || {};
      const ws = {};
      for (const [id, c] of Object.entries(G.CAUSES)) {
        let w = c.stages[st] || 0; if (!w && !(id === 'hanged' && S.work === 'thief')) continue;
        if (c.constructOnly && !R.construct) continue;
        if (c.undeadOnly && !R.undead) continue;
        if ((R.construct || R.undead) && G.NO_FLESH.includes(id)) continue;
        if (c.plague) w *= .3 + rs.plague * 6;
        if (c.cold) w *= reg.cold ? 4 : .3;
        if (c.hot) w *= reg.hot ? 4 : .15;
        if (c.biome) w *= c.biome.includes(reg.biome) ? 4 : .15;
        if (c.war) w *= .2 + rs.war * 10;
        if (c.raid) w *= .3 + rs.raid * 5 + reg.danger;
        if (c.magic) w *= .5 + reg.magic * 2;
        if (id === 'bandit') w *= (.3 + reg.danger + reg.gini * .5) * (G.attitude(S) === 'wary' ? 1.5 : 1);
        if (id === 'drown') w *= reg.coastal ? 2 : .7;
        if (c.sea) { const hs = G.here(S).s; w *= S.work === 'sailor' ? 1 : S.work === 'fisher' ? .5 : hs && hs.seaCells ? .15 : 0; if (!w) continue; }
        if ((id === 'drown' || id === 'shipwreck') && W.seaBand != null) { const sw = G.seaWork(S); if (sw) w *= 1 + .3 * sw.zone.tier[0]; }
        if (W.cause === id) w = w * 3 + 6;
        if (id === 'hanged' && S.work === 'thief') w = 12;
        if (id === 'purge' && S.flags.revealed) w *= 2;
        if (id === 'purge') w *= G.lawHere(S, 'hunt_undead') ? 3 : G.lawHere(S, 'undead_citizen') ? .2 : 1;
        ws[id] = w;
      }
      for (const c of S.conds) { const cc = G.CONDS[c.id].cause; if (cc && cc in ws) ws[cc] += 25; }
      const id = this.wkey(ws) || 'old';
      let text = G.CAUSES[id].nameVi;
      if (id === 'raid') { const sp = this.monsterIn(reg.zones[0]); text = `${sp.nameVi} tràn vào làng`; }
      return { id, text };
    }

    die(cause) {
      const S = this.S; if (S.dead) return;
      S.dead = true; S.cause = cause.text; S.causeId = cause.id; S.causeSpecies = cause.species || null;
      S.world.lastDeath = S.world.year;
      S.dominant = this.dominant(S);
      // Kết quả trỗi dậy được tung ngay lúc chết (cùng seed thì cùng kết quả).
      S.rose = this.rnd() < G.REINCARNATE_P ? (S.dominant || { skill: 'Body', value: 5 }) : null;
      S.years.push({ age: S.age, yrs: this.years(S), hl: 0, h: Math.round(S.h), so: Math.round(S.so), sm: Math.round(S.sm), gold: S.gold, level: S.level, loc: S.loc });
      this.log(`${S.name} qua đời ở tuổi ${this.years(S)}: ${S.cause}.`, 'death');
      this.hook.death(S);
    }

    // ═════════ Săn quái theo khu, có phân cấp ═════════
    // Khu săn của một vùng = các tầng (ven, sâu, lõi, vùng chết) có ô trong vùng ở thế giới này (độ hoang: js/realm.js).
    zonesFor(S = this.S, regionId = S.loc) {
      const ct = this.ctier(S), cap = ct + (S.reckless ? 2 : 1), bc = G.realm ? G.realm.bandCells[G.map.idx[regionId]] : null;
      return G.REGION[regionId].zones.map((z, i) => {
        const open = z.tier[0] <= cap;
        const level = z.tier[1] <= ct ? 'safe' : z.tier[0] <= ct ? 'fair' : open ? 'risky' : 'locked';
        return { zone: z, index: i, open, level, cells: bc ? bc[i].length : 1 };
      }).filter(z => z.cells > 0);
    }
    // Khu gợi ý: khu sâu nhất mà đe dọa trung bình của bảng gặp quái vẫn thấp hơn sức mình ~0,3 Tier.
    recommendedZone(S = this.S, regionId = S.loc) {
      const zs = this.zonesFor(S, regionId).filter(z => z.open && z.level !== 'risky');
      const ct = this.ctier(S), pw = this.power(S);
      const avgThreat = z => { const t = this.encounterTable(z.zone, ct, false), tot = t.reduce((a, x) => a + x.w, 0) || 1; return t.reduce((a, x) => a + x.w * (x.s.tier + ({ S: -.15, M: 0, L: .2, XL: .35 }[x.s.size]) + .08 * (((x.s.group || [1, 1])[0] + (x.s.group || [1, 1])[1]) / 2 - 1)), 0) / tot; };
      const ok = zs.filter(z => avgThreat(z) <= pw - .3);
      return (ok.length ? ok[ok.length - 1] : zs[0]) || null;
    }
    ensureZone() {
      const S = this.S, zs = this.zonesFor(S);
      const cur = zs.find(z => z.zone.id === S.zoneSel);
      if (!cur || !cur.open || (!S.zoneManual && !S.reckless)) { const r = this.recommendedZone(S); S.zoneSel = r ? r.zone.id : null; }
    }
    // Bảng gặp quái: loài trong khu, Tier ≤ Tier nhân vật + 1 (liều mạng + 2). Đây là luật chống "cấp thấp gặp cấp cao".
    // feat: địa hình của ô gặp quái, nhân trọng số loài đã có (G.FEATURE_SPAWN); không thêm loài nên không phá luật trên.
    encounterTable(zone, ct, reckless, feat) {
      const cap = ct + (reckless ? 2 : 1), F = (feat && G.FEATURE_SPAWN[feat]) || {};
      return Object.entries(zone.spawns).map(([id, w]) => ({ s: G.B.byId[id], w })).filter(x => x.s && x.s.tier <= cap)
        .map(x => ({ ...x, w: x.w * (x.s.tier > ct ? .5 : 1) * (x.s.tier < ct - 1 ? .4 : 1) * ((F.behavior || {})[x.s.behavior] || 1) * ((F.family || {})[x.s.family] || 1) }));
    }
    // Gặp quái ở một ô ngẫu nhiên của khu (opt.cell để chỉ định); địa hình ô đó đổi trọng số loài.
    rollEncounter(zone, opt = {}) {
      const S = this.S, ct = this.ctier(S), bi = G.B.biomes[G.ZONE[zone.id].region.biome];
      const cells = opt.cell != null ? [opt.cell] : G.zoneCells(zone.id), cell = cells.length ? cells[Math.floor(this.rnd() * cells.length)] : null;
      const feat = cell != null ? G.FEATURES[G.map.feat[cell]].id : null;
      const table = this.encounterTable(zone, ct, S.reckless, feat);
      if (!table.length) return null;
      const s = this.wpick(table, 'w').s;
      let grade = opt.grade;
      if (!grade) { const r = this.rnd(), a = bi.alphaChance + (opt.bonus || 0) * .5, e = bi.eliteChance + .02 * ct + (opt.bonus || 0); grade = r < a ? 'alpha' : r < a + e ? 'elite' : 'normal'; }
      const pool = Object.keys(G.B.affixes), affixes = [];
      while (affixes.length < G.B.grades[grade].affixes && pool.length) affixes.push(pool.splice(Math.floor(this.rnd() * pool.length), 1)[0]);
      const g = s.group || [1, 1];
      const count = grade === 'normal' ? this.int(g[0], g[1]) : Math.max(1, Math.floor(g[0] / 2));
      return { s, grade, affixes, count, zone, cell, feat };
    }
    threat(enc) {
      const { s, grade, affixes, count } = enc;
      return s.tier + { normal: 0, elite: .45, alpha: .9, lord: 1.6 }[grade] + { S: -.15, M: 0, L: .2, XL: .35 }[s.size] + .08 * (count - 1) + .12 * affixes.length;
    }
    hunt(adventure, forced) {
      const S = this.S, st = this.stage(S);
      if (!['teen', 'adult', 'elder'].includes(st)) return;
      let zid = S.zoneSel;
      if (!zid) { if (!S.flags.noZoneMsg) { this.log(`Không có khu nào ở ${this.reg(S).nameVi} hợp sức bạn. Phải rời vùng hoặc bật Liều mạng.`, 'bad'); S.flags.noZoneMsg = S.age; } return; }
      let zone = G.ZONE[zid].zone;
      // Phiêu lưu: đi sâu thêm một khu nếu khu đó vẫn mở.
      if (adventure) { const zs = this.zonesFor(S), nx = zs.find(z => z.index > G.ZONE[zid].index); if (nx && nx.open) zone = nx.zone; }
      const enc = forced || this.rollEncounter(zone, { bonus: adventure ? .06 : 0 });
      if (!enc) return;
      return this.fight(enc, adventure);
    }
    fight(enc, adventure) {
      const S = this.S, { s, grade, count } = enc, ct = this.ctier(S);
      const mET = this.threat(enc), pET = this.power(S), diff = pET - mET;
      const pWin = 1 / (1 + Math.exp(-3.2 * diff));
      const gap = s.tier - ct;
      S.hunts.n++; S.hunts.maxGap = Math.max(S.hunts.maxGap, gap); S.hunts.byGap[gap] = (S.hunts.byGap[gap] || 0) + 1;
      const pop = S.world.zonePop;
      const gname = grade === 'normal' ? '' : ` ${G.B.grades[grade].nameVi.toLowerCase()}`;
      const what = (count > 1 ? `${count} ${s.nameVi}` : s.nameVi) + gname;
      const where = `${enc.zone.nameVi}${enc.feat && enc.feat !== 'open' && enc.feat !== 'lake' ? ' (' + G.FEATURES.find(f => f.id === enc.feat).nameVi.toLowerCase() + ')' : ''}`;
      if (enc.cell != null) S.huntPos = [(enc.cell % G.map.W + .5) * G.map.CS, (Math.floor(enc.cell / G.map.W) + .5) * G.map.CS];
      const rec = { species: s.id, grade, count, win: false, gap, zone: enc.zone.id };
      // Rèn mastery theo trường phái đang đi.
      const j = this.job(S), school = j && j.tier > 0 ? j.school : (S.path || 'combat');
      const ms = J.schools[school].masteries;
      if (this.rnd() < pWin) {
        rec.win = true; S.hunts.won++;
        S.kills[s.id] = (S.kills[s.id] || 0) + count;
        { const key = enc.cell != null ? G.areaKey(enc.cell) : G.zoneKey(enc.zone, G.provOfS(S)); pop[key] = Math.max(.3, (pop[key] ?? 1) - .015 * count); }
        const xp = 60 * Math.pow(1 + Math.max(0, mET), 2) * (.6 + .4 * count) * (adventure ? 1.3 : 1);
        const loot = Math.round(3 * Math.pow(1 + s.tier, 2) * { normal: 1, elite: 2.5, alpha: 4, lord: 20 }[grade] * (.5 + this.rnd()) * (adventure ? 1.4 : 1));
        this.money(loot); this.addXp(xp);
        for (const m of ms) this.gain(m, 1.2);
        if (S.inherited) this.gain(S.inherited.skill, .6);
        if (pWin < .85) this.add('hl', -this.int(1, 6));
        S.fame = Math.min(100, S.fame + { normal: .3, elite: 1.5, alpha: 3, lord: 20 }[grade] * (1 + s.tier * .3));
        if (grade !== 'normal' || pWin < .5 || s.tier > ct || adventure && this.chance(.4))
          this.log(`${adventure ? 'Phiêu lưu' : 'Săn'} ở ${where}: hạ ${what}. +${loot} bạc.`, grade !== 'normal' ? 'big' : 'good', grade !== 'normal' || this.chance(.3) ? this.factOf(s) : null);
        if (adventure && this.chance(.12)) G.treasure(this, enc.zone);
      } else {
        S.hunts.lost++;
        this.add('hl', -(8 + 22 * (1 - pWin) * this.rnd()));
        const fled = this.rnd() < .45 + S.mastery.Stealth / 250;
        const pDie = G.clamp(.006 + .12 * Math.max(0, -diff) + (grade === 'normal' ? 0 : .02), 0, .5) * (S.hl < 25 ? 1.6 : 1) * (fled ? .3 : 1);
        if (this.rnd() < pDie) {
          this.hook.hunt(rec);
          this.die({ id: 'monster', text: `tử trận trước ${what} ở ${where}`, species: s.id });
          return rec;
        }
        if (fled) S.hunts.fled++;
        const st2 = G.B.statusOf(s);
        if (st2 === 'curse' && this.chance(.25)) { this.cond('curse'); }
        else if (st2 === 'poison' && this.chance(.3)) this.cond('poison');
        else if (this.chance(.18)) this.cond(this.R(S).undead ? 'crack' : this.R(S).construct ? 'rust' : 'wound');
        if (this.chance(.03) && !this.hasCond('maimed') && !S.undead) { this.cond('maimed'); this.log(`Trận thua trước ${what} để lại tật vĩnh viễn.`, 'bad'); }
        this.log(`${adventure ? 'Phiêu lưu' : 'Săn'} ở ${where}: thua ${what}${fled ? ', bỏ chạy được' : ', được kéo về'}.`, 'bad', this.factOf(s));
      }
      this.hook.hunt(rec);
      return rec;
    }

    trainYear(share) {
      const S = this.S, j = this.job(S);
      const school = j && j.tier > 0 ? j.school : (S.path || J.races[S.race].schools.native[0]);
      const ms = J.schools[school].masteries;
      // Ưu tiên mastery mà nghề kế tiếp đòi.
      const want = {};
      for (const e of G.nextJobs(this, true)) for (const [m, v] of Object.entries(e.job.req || {})) if (S.mastery[m] < v + 15) want[m] = (want[m] || 0) + 1;
      const pool = [...new Set([...ms, ...Object.keys(want)])];
      for (let k = 0; k < 4; k++) { const m = this.wpick(pool, m => 1 + (want[m] || 0) * 2); this.gain(m, 3.2 * share * (.8 + S.traits.bold * .4)); }
      if (S.inherited) this.gain(S.inherited.skill, 1.5 * share);
      this.addXp(70 * share * (1 + S.level * .04));
    }
    workYear(share) {
      const S = this.S, reg = this.reg(S), W = G.WORKS[S.work];
      // Thu nhập sau thuế, theo thái độ chủng tộc và luật (js/state.js G.incomeMult).
      if (!W || W.adventurer) { // làm thuê vặt; mạo hiểm giả sống bằng săn quái và lệnh treo thưởng
        this.money(G.incomeAt(reg, Math.min(.3, S.pct)) * share * .7 * G.incomeMult(S));
        return;
      }
      const skill = Object.keys(W.trains).reduce((a, m) => Math.max(a, S.mastery[m]), 0);
      const target = G.lerp(W.pct[0], W.pct[1], G.clamp(S.sm / 100 * .35 + skill / 100 * .45 + S.so / 100 * .2, 0, 1)) + (S.work === 'merchant' && G.lawHere(S, 'free_trade') ? .05 : 0);
      S.pct = G.clamp(S.pct + (target - S.pct) * .12 * share, .005, .995);
      this.money(G.incomeAt(reg, S.pct) * share * G.incomeMult(S));
      for (const [m, v] of Object.entries(W.trains)) this.gain(m, v * share);
      this.addXp(20 * share);
      // Nghề biển: rủi ro theo Tier thấp nhất của tầng biển nơi làm; thỉnh thoảng gặp quái biển (vẫn qua luật Tier của encounterTable).
      const sw = G.seaWork(S), risk = W.risk * (sw ? 1 + .25 * sw.zone.tier[0] : 1);
      if (this.rnd() < .05 * risk * share) { this.add('hl', -this.int(5, 18)); this.log(`Tai nạn khi làm ${W.nameVi.toLowerCase()}${sw ? ' trên ' + G.realm.seas[G.SEAS.indexOf(sw.sea)].name : ''}.`, 'bad'); }
      if (sw && this.rnd() < .1 * share * (S.world.zonePop[sw.zone.id] ?? 1)) {
        const enc = this.rollEncounter(sw.zone, sw.cell != null ? { cell: sw.cell } : {});
        if (enc) this.fight(enc, false);
      }
    }
  }
  G.Sim = Sim;

  G.xpNeed = lv => Math.round(40 * Math.pow(lv, 1.25));

  // Chỉ số trôi về mục tiêu.
  G.driftStats = function (X) {
    const S = X.S, t = X.lt(S), st = X.stage(S), fam = S.family;
    const aliveFam = fam.parents.filter(p => p.alive).length + fam.sibs.filter(p => p.alive).length;
    let hlT = 84 - (S.q === 1 ? 8 : 0) - S.conds.reduce((a, c) => a + (G.CONDS[c.id].mult - 1) * 30, 0);
    if (st === 'elder') hlT -= (S.age - t.leT * .78) * 3;
    let hT = 48 + (S.pct - .5) * 30 + S.so * .2 + (S.gold < 0 ? -15 : 0) + (S.faith ? S.devotion * .08 : 0) - (S.undead ? 15 : 0);
    let soT = S.undead ? 10 + S.fame * .2 : 22 + aliveFam * 5 + (fam.spouse && fam.spouse.alive ? 16 : 0) + fam.kids.filter(k => k.alive).length * 4 + S.fame * .2 + S.traits.social * 12;
    const k = .25;
    S.hl += (G.clamp(hlT, 5, 95) - S.hl) * k;
    S.h += (G.clamp(hT, 5, 95) - S.h) * k;
    S.so += (G.clamp(soT, 3, 95) - S.so) * k;
    if (st === 'elder') S.sm -= .5;
    for (const s of ['hl', 'h', 'so', 'sm']) S[s] = G.clamp(S[s], 0, 100);
  };

  // Các nghề có thể chuyển tới từ nghề hiện tại (cạnh của compose), lọc quyền chủng tộc + giáo phái.
  G.nextJobs = function (X, ignoreReq) {
    const S = X.S, acc = G.jobs.access[S.race], out = [];
    for (const e of G.jobs.edges) {
      if (e.from !== S.job || (e.race && e.race !== S.race)) continue;
      const j = G.jobs.byId[e.to], a = acc[e.to];
      if (!['native', 'foreign', 'faith'].includes(a) || j.hidden) continue;
      if (S.jobHist.includes(j.id)) continue;
      if (j.faith && !j.shared && j.faith !== S.faith) continue;
      if (j.faith && J.faiths[j.faith]) { const g = J.faiths[j.faith].devotion.gates[j.tier] || 0; if (!ignoreReq && S.devotion < g + ((J.faiths[j.faith].races.wary || []).includes(S.race) ? 15 : 0)) continue; }
      const bonus = a === 'foreign' ? 15 : 0;
      const missing = Object.entries(j.req || {}).filter(([m, v]) => (S.mastery[m] || 0) < v + bonus);
      const lvOk = S.level >= (G.LEVEL_FOR_TIER[j.tier] || 0);
      if (!ignoreReq && (missing.length || !lvOk)) continue;
      out.push({ job: j, access: a, missing, lvOk });
    }
    return out;
  };

  G.summary = function (S, X) {
    const reg = G.REGION[S.loc];
    return { kiep: S.kiep, name: S.name, race: S.race, raceVi: J.races[S.race].nameVi, years: X.years(S), cause: S.cause, level: S.level,
      job: X.jobName(S), dominant: S.dominant, rose: !!S.rose, region: reg.nameVi, diedYear: S.world.year, pos: S.pos, kills: Object.values(S.kills).reduce((a, b) => a + b, 0) };
  };

  // Chạy headless tới chết: tự chọn mọi quyết định (autoChoice), tua tick liên tục.
  Sim.prototype.runToDeath = function (maxYears = 400) {
    const S = this.S; this.headless = true;
    let n = 0;
    while (!S.dead && n < maxYears * 30) {
      if (S.pending) this.choose(G.DECISIONS[S.pending.id].auto ? G.DECISIONS[S.pending.id].auto(S, this, S.pending) : S.pending.choices[0].k);
      this.tick(.05); n++;
    }
    return S;
  };
})(window.LifeSim);
