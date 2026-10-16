/* Vạn Kiếp — CÂY SỰ KIỆN (docs/12; người dùng yêu cầu 16/10/2026).
 * Sự kiện, quyết định không còn là một túi bốc ngẫu nhiên mà mỗi cái tự kiểm điều kiện của mình. File này nạp cuối, bọc mọi
 * sự kiện (G.EVENTS, G.NATION_EVENTS) và quyết định (G.DECISIONS) bằng một lớp cổng chung, đọc từ nhãn (G.TREE_META hoặc trường
 * `tree` ngay trên sự kiện):
 *   1. Quỹ đạo (S.traj): 10 hướng (Võ, Pháp, Ám, Trí, Nghề, Thương, Đạo, Quyền, Gia, Du) tích từ việc nhân vật đã làm mỗi năm
 *      (focus, nghề, kỹ năng tăng, vai trò, gia đình, đi xa), nhớ dần quên (nửa đời ~6 năm). Người chơi không chọn quỹ đạo;
 *      chí hướng chỉ tác động gián tiếp qua focus. Nhãn `dir` nhân trọng số theo độ hợp, `dirMin` là ngưỡng cứng của một nhánh.
 *   2. Danh phận (G.standing): xã hội người sống biết và nhận bạn tới đâu (soc 0–4), giới hắc ám biết bạn tới đâu (dark 0–3).
 *      Bộ Xương chưa lộ mặt có soc 0; đã lộ thì chỉ nước có luật "Bộ Xương là công dân" mới tính. Nhãn `soc`, `dark`.
 *   3. Thân thể, giống loài: `body` ('flesh' thân xác, 'living' người sống gồm Cơ Nhân, 'undead'), `race`, `notRace`.
 *      Bộ Xương lượt đầu (vừa trỗi dậy) chỉ gặp nút `fresh`; `minAge` tính theo lượt kể từ khi sinh / trỗi dậy.
 *   4. Chủ đề (G.THEMES): sự kiện cùng chủ đề ở nhiều file (giải đấu, tình duyên, chiến tranh, thuế…) dùng chung khoảng lặp,
 *      một chủ đề một lần trong `gap` lượt. Nút con trong cây được miễn khoảng lặp của chủ đề cha.
 *   5. Cây: nút có `from` (cha, có thể kèm kết quả 'cha:kq' hoặc 'cha:!kq'), `wait` [min, max] lượt sau khi cha xảy ra.
 *      Con của cùng một cha loại trừ nhau (một nhánh); `soft` là nối mềm cho các cặp có sẵn chạy bằng cờ (không chặn, không
 *      loại trừ, chỉ ghi nhánh và miễn khoảng lặp). Nút con đang mở được kéo trọng số × G.TREE.pull. `need`: nút phải xảy ra trước.
 *   Kết quả của nút: sự kiện trả { o } (không có thì lấy k), quyết định lấy lựa chọn. Ghi ở S.tree[id] = { t, o, next }.
 *   Nút mới viết nhãn ngay trên sự kiện / quyết định (trường `tree`); nút có sẵn ở file khác thì ghi nhãn vào G.TREE_META.
 * Trạng thái: S.traj, S.trajM (mastery năm trước), S.trajB (cộng một lần từ nút), S.tree, S.themes. Hệ con "traj" chạy cuối.
 * Đếm cho sim.html: G.TREE_STATS (chặn theo lý do, cạnh cây, chủ đề) khi G.TREE.stats = true.
 */
window.LifeSim = window.LifeSim || {};
(function (G) {
  const J = window.JobLibrary, DEC = G.DECISIONS;
  const cnt = (S, k, v = 1) => { S.flags[k] = (S.flags[k] || 0) + v; };

  G.TREE = { decay: .89, minSum: .6, pull: 3, fresh: 1, fame: [20, 60], stats: false };

  // ═════════ 1. Quỹ đạo ═════════
  G.TRAJ = {
    vo:     { nameVi: 'Võ',     path: 'đường võ',        d: 'săn quái, luyện võ, ra trận' },
    phap:   { nameVi: 'Pháp',   path: 'đường pháp',      d: 'ma pháp, nguyên tố' },
    am:     { nameVi: 'Ám',     path: 'đường tối',       d: 'ẩn thân, tử thuật, trộm cướp, cấm thuật' },
    tri:    { nameVi: 'Trí',    path: 'đường chữ',       d: 'học chữ, làm thầy, chữa bệnh' },
    nghe:   { nameVi: 'Nghề',   path: 'đường nghề',      d: 'làm ruộng, làm thợ, chế tác' },
    thuong: { nameVi: 'Thương', path: 'đường buôn',      d: 'buôn bán, giữ của' },
    dao:    { nameVi: 'Đạo',    path: 'đường đạo',       d: 'tu hành, giữ đạo' },
    quyen:  { nameVi: 'Quyền',  path: 'đường quyền',     d: 'giữ chức, cai quản, tước vị' },
    gia:    { nameVi: 'Gia',    path: 'đường gia đình',  d: 'vợ chồng, con cái, nhà cửa' },
    du:     { nameVi: 'Du',     path: 'đường lãng du',   d: 'đi xa, phiêu lưu, đổi chỗ ở' }
  };
  const AX = Object.keys(G.TRAJ);
  G.SCHOOL_AX = { combat: { vo: 1 }, ranged: { vo: 1 }, martial: { vo: 1 }, beast: { vo: .5, du: .5 }, arcane: { phap: 1 }, death: { am: 1 }, shadow: { am: 1 }, craft: { nghe: 1 } };
  G.WORK_AX = {
    hunter: { vo: 1 }, guard: { vo: 1 }, bodyguard: { vo: 1 }, adventurer: { vo: .6, du: .4 }, tamer: { vo: .5, du: .5 },
    merchant: { thuong: 1 }, appraiser: { thuong: .7, phap: .3 }, steward: { thuong: .6, quyen: .4 },
    scholar: { tri: 1 }, healer: { tri: .8, dao: .2 }, tutor: { tri: 1 }, priest: { dao: 1 }, thief: { am: 1 },
    sailor: { du: .6, nghe: .4 }, arraymaster: { phap: 1 }, runesmith: { nghe: .5, phap: .5 }
  };   // còn lại (ruộng, thợ, nghề phục vụ quý tộc): Nghề
  const workAx = w => G.WORK_AX[w] || { nghe: 1 };
  const trainAx = S => G.SCHOOL_AX[S.path] || { vo: 1 };
  G.FOCUS_AX = { study: { tri: 1 }, faith: { dao: 1 }, family: { gia: 1 }, govern: { quyen: 1 }, hunt: { vo: 1 }, adventure: { vo: .5, du: .5 } };
  const zero = () => Object.fromEntries(AX.map(a => [a, 0]));
  const addv = (o, v, k = 1) => { for (const [a, x] of Object.entries(v || {})) if (a in o) o[a] += x * k; };

  G.trajYear = function (S, X) {
    const T = S.traj || (S.traj = zero()), inc = zero(), F = S.flags;
    // Focus: thời gian trong năm dồn vào hướng nào.
    const tot = Object.values(S.focusTime).reduce((a, b) => a + b, 0) || 1;
    for (const [f, t] of Object.entries(S.focusTime)) addv(inc, f === 'train' ? trainAx(S) : f === 'work' ? (S.work ? workAx(S.work) : null) : G.FOCUS_AX[f], t / tot);
    // Kỹ năng tăng trong năm theo trường phái (10 điểm ~ 0,3).
    const M0 = S.trajM || {};
    for (const [m, v] of Object.entries(S.mastery)) { const d = v - (M0[m] ?? v); if (d > 0) addv(inc, G.SCHOOL_AX[G.MASTERY[m]], d * .03); }
    S.trajM = { ...S.mastery };
    // Hoàn cảnh: chức, gia đình, đạo, của cải, đi xa, bóng tối.
    if ((G.hasCharge && G.hasCharge(S)) || (S.roles && S.roles.noble)) inc.quyen += .3;
    if (S.family.spouse && S.family.spouse.alive) inc.gia += .08;
    inc.gia += Math.min(.12, .04 * S.family.kids.filter(k => k.alive).length);
    if (S.faith && S.devotion >= 30) inc.dao += .15;
    if (S.undead) inc.am += .1;
    if (F.forb) inc.am += .3;
    if (S.gold > 4 * G.median(X.reg(S))) inc.thuong += .2;
    { const tr = (F.trips || 0) + (F.voyages || 0); if (tr > (S.trajTrips || 0)) inc.du += .3 * Math.min(2, tr - (S.trajTrips || 0)); S.trajTrips = tr; }
    if (S.trajB) { addv(inc, S.trajB); S.trajB = null; }
    const d = Math.pow(G.TREE.decay, X.R(S).ypt || 1);
    for (const a of AX) T[a] = T[a] * d + inc[a] * (1 - d);
    // Quỹ đạo giữa đời (sim.html): hướng mạnh nhất lúc vừa qua tuổi trưởng thành 12 năm.
    if (!S.undead && F.trajMid == null && X.years(S) >= X.R(S).adult + 12) F.trajMid = (G.trajTop(S)[0] || {}).a || null;
  };
  G.trajBump = (S, v) => { if (!v) return; S.trajB = S.trajB || {}; for (const [a, x] of Object.entries(v)) S.trajB[a] = (S.trajB[a] || 0) + x; };
  G.trajSum = S => S.traj ? AX.reduce((a, k) => a + S.traj[k], 0) : 0;
  G.trajShare = (S, a) => { const s = G.trajSum(S); return s > 1e-6 ? S.traj[a] / s : 0; };
  G.trajTop = S => { const s = G.trajSum(S); if (s < 1e-6) return []; return AX.map(a => ({ a, s: S.traj[a] / s })).sort((x, y) => y.s - x.s); };
  // Độ hợp của nhãn dir với quỹ đạo: 0–1. Quỹ đạo chưa định hình (tổng nhỏ, trẻ con) thì nhân tiến dần về 1.
  G.dirFit = (S, dir) => { let k = 0, f = 0; for (const [a, x] of Object.entries(dir)) { k += x; f += x * G.trajShare(S, a); } return k ? f / k : 0; };
  G.dirMult = (S, dir) => {
    if (!dir) return 1;
    const c = G.clamp(G.trajSum(S) / G.TREE.minSum, 0, 1);
    return 1 + c * (G.clamp(.3 + 2.5 * G.dirFit(S, dir), .3, 2.5) - 1);
  };
  G.trajText = S => {
    const t = G.trajTop(S);
    if (!t.length || G.trajSum(S) < G.TREE.minSum * .5) return 'Chưa định hình';
    return t.filter((x, i) => i < 2 || x.s >= .2).slice(0, 3).filter(x => x.s >= .08).map(x => `${G.TRAJ[x.a].nameVi} ${Math.round(x.s * 100)}%`).join(' · ');
  };
  G.trajTip = S => {
    const t = G.trajTop(S); if (!t.length) return 'Quỹ đạo tích từ việc bạn làm mỗi năm; chưa có gì.';
    return `Quỹ đạo: ${G.TRAJ[t[0].a].path} (${G.TRAJ[t[0].a].d}). Tích từ focus, nghề, kỹ năng tăng, chức vụ, gia đình, đi xa; năm cũ phai dần. Sự kiện, nhánh của cây sự kiện đọc quỹ đạo này, không đọc chí hướng.\n` +
      t.filter(x => x.s >= .02).map(x => `${G.TRAJ[x.a].nameVi} ${Math.round(x.s * 100)}%`).join(', ');
  };

  // ═════════ 2. Danh phận ═════════
  G.SOC_VI = ['Kẻ vô danh', 'Người có chốn', 'Có tiếng trong vùng', 'Có tiếng trong nước', 'Danh chấn thiên hạ'];
  G.DARK_VI = ['', 'Bóng tối biết tên', 'Có chỗ trong giới hắc ám', 'Giới hắc ám kính sợ'];
  const stCache = new WeakMap();
  const livingSoc = (S, st) => {
    if (st === 'infant' || st === 'child') return 0;
    const fm = G.TREE.fame, T = G.sTier ? G.sTier(S) : 0, R = S.roles || {};
    let s = 1 + Math.min(2, (S.fame >= fm[0]) + (S.fame >= fm[1]) + (T >= 2)) + (T >= 3);   // danh vọng bão hòa ở 100 khi về già: danh vọng, Siêu Phàm cộng tối đa 2; bậc 4 cần Tier 3 hoặc chức tước
    if (R.noble || R.office != null || R.ruler != null || R.head != null) s++;
    if (S.flags.outcast) s--;
    if (S.flags.wanted && S.nation != null && S.flags.wanted[S.nation]) s--;
    return G.clamp(st === 'teen' ? Math.min(1, s) : s, 0, 4);
  };
  G.standing = function (S, X) {
    const key = S.age * 1e4 + Math.round(S.t * 100), c = stCache.get(S);
    if (c && c.k === key && c.f === S.fame) return c.v;
    const st = X.stage(S), F = S.flags, v = { soc: 0, dark: 0, hidden: false };
    const deathM = Math.max(S.mastery.Necromancy || 0, S.mastery.Soul || 0, S.mastery.Curse || 0);
    if (S.undead) {
      v.hidden = !F.revealed;
      v.soc = v.hidden ? 0 : G.lawHere(S, 'undead_citizen') ? Math.max(0, livingSoc(S, st) - 1) : 0;
      v.dark = S.age < G.TREE.fresh ? 0 : G.clamp(1 + (S.age >= 3) + (S.faith === 'dark') + (deathM >= 30) + (S.fame >= G.TREE.fame[0]), 0, 3);
    } else {
      v.soc = livingSoc(S, st);
      v.dark = G.clamp((S.faith === 'dark') + (F.forb ? 1 : 0) + (S.work === 'thief') + (deathM >= 40), 0, 3);
    }
    stCache.set(S, { k: key, f: S.fame, v });
    return v;
  };
  G.standingText = (S, X) => { const v = G.standing(S, X); return S.undead && v.hidden ? 'Ẩn mặt (chưa ai biết bạn là gì)' : G.SOC_VI[v.soc] + (v.dark ? ` · ${G.DARK_VI[v.dark]}` : ''); };
  G.standingTip = (S, X) => {
    const v = G.standing(S, X);
    return 'Danh phận: xã hội người sống nhận bạn tới đâu (0 Kẻ vô danh … 4 Danh chấn thiên hạ). Tính từ tuổi, danh vọng, Tier, chức tước; bị ruồng bỏ, truy nã thì tụt. ' +
      'Nhận đệ tử, làm quan, vào hội, cầu hôn… cần danh phận. Bộ Xương chưa lộ mặt là kẻ vô danh; chỉ nước coi Bộ Xương là công dân mới tính danh phận cho Bộ Xương.' +
      (v.dark ? ` Giới hắc ám: ${v.dark}/3.` : '');
  };

  // ═════════ 3. Chủ đề ═════════
  G.THEMES = {
    tourney:     { nameVi: 'Giải đấu',            gap: 3 },
    romance:     { nameVi: 'Tình duyên',          gap: 2 },
    war:         { nameVi: 'Chiến tranh, lính',   gap: 1 },
    tax:         { nameVi: 'Thuế',                gap: 3 },
    bully:       { nameVi: 'Bắt nạt',             gap: 4 },
    teach:       { nameVi: 'Nhận đệ tử',          gap: 3 },
    learn:       { nameVi: 'Học nghề, theo thầy', gap: 2 },
    ring:        { nameVi: 'Nhẫn lạ',             gap: 6 },
    treasure:    { nameVi: 'Kho báu',             gap: 4 },
    companion:   { nameVi: 'Bạn đồng hành',       gap: 2 },
    faith:       { nameVi: 'Đạo',                 gap: 3 },
    raid:        { nameVi: 'Quái, cướp tràn vào làng', gap: 1 },
    robbery:     { nameVi: 'Cướp đường',          gap: 2 },
    hardship:    { nameVi: 'Thiên tai, mất mùa',  gap: 1 },
    gamble:      { nameVi: 'Cờ bạc',              gap: 2 },
    undead_town: { nameVi: 'Bộ Xương vào làng',   gap: 2 },
    dark:        { nameVi: 'Lời mời của bóng tối', gap: 3 },
    grave:       { nameVi: 'Mộ kiếp trước',       gap: 5 },
    memory:      { nameVi: 'Ký ức kiếp trước',    gap: 2 }
  };

  // ═════════ 4. Nhãn cho sự kiện, quyết định có sẵn ═════════
  // q: cờ hàng đợi của quyết định; bị chặn vì thân thể, giống loài, danh phận thì xóa luôn để lời mời cũ không bật ra nhiều năm sau.
  const sf = (...ids) => ({ from: ids, soft: true });
  G.TREE_META = {
    // ── quyết định ──
    marriage:     { theme: 'romance', soc: 1, ...sf('ad_suitor') },
    gear:         { soc: 1 },
    bounty:       { soc: 1, q: 'bounty', ...sf('ad_bounty_post') },
    faith_join:   { theme: 'faith', ...sf('ad_preacher') },
    tournament:   { theme: 'tourney', soc: 1, q: 'tourney', ...sf('ad_tourney') },
    reveal:       { theme: 'undead_town', ...sf('sk_town') },
    dark_offer:   { theme: 'dark', ...sf('sk_dark') },
    migrate:      { ...sf('ad_restless') },
    conscript:    { theme: 'war', soc: 1, q: 'conscriptQ' },
    cv_retainer:  { soc: 2, q: 'retOffer' },
    cv_elixir:    { soc: 1 },
    cv_license:   { soc: 1 },
    cv_levy:      { theme: 'war', soc: 1 },
    cv_bully:     { theme: 'bully', ...sf('cv_bully_ev') },
    cv_tourney:   { theme: 'tourney', soc: 1 },
    cv_auction:   { soc: 1 },
    cv_match:     { theme: 'romance', soc: 1, body: 'flesh' },
    cv_grave:     { theme: 'grave' },
    cv_ring:      { theme: 'ring' },
    cv_rob:       { theme: 'robbery' },
    cv_forbidden: { theme: 'dark' },
    cv_patron:    { soc: 2, q: 'patronQ' },
    found_settle: { soc: 1 }, head_elect: { soc: 2 }, upgrade: { soc: 2 }, office: { soc: 2 }, found_nation: { soc: 3 }, rebel: { soc: 2 },
    org_join: { soc: 1 }, org_lead: { soc: 2 }, org_found: { soc: 2 }, quest: { soc: 1 }, merc: { soc: 1 },
    ennoble: { soc: 2 }, buy_title: { soc: 1 }, claim_throne: { soc: 2 }, gov_rank: { soc: 1 }, duel_throne: { soc: 3 },
    mentor:       { theme: 'learn', soc: 1 },
    disciple:     { theme: 'teach', soc: 2 },
    // ── sự kiện ──
    ch_river:     { notRace: ['merfolk'] },
    ad_sea_storm: { notRace: ['merfolk'] },
    el_aches:     { body: 'flesh' },
    el_grandkid:  { body: 'flesh' },
    ch_bully:     { theme: 'bully' },
    cv_bully_ev:  { theme: 'bully' },
    ch_raid:      { theme: 'raid' }, ad_tide: { theme: 'raid' }, law_raid: { theme: 'raid' },
    ch_hunger:    { theme: 'hardship' }, ad_frost: { theme: 'hardship' }, ad_volcano: { theme: 'hardship' }, ad_sandstorm: { theme: 'hardship' },
    tn_love:      { theme: 'romance' },
    ad_suitor:    { theme: 'romance', soc: 1, dir: { gia: 2, thuong: .5, nghe: .5 } },
    tn_apprentice:{ theme: 'learn', dir: { nghe: 1, vo: .5 } },
    tn_brawl:     { dir: { vo: 1, am: 1 } },
    tn_runaway:   { dir: { du: 1, am: .5 } },
    tn_first_hunt:{ dir: { vo: 1, du: .5 } },
    ad_bandits:   { theme: 'robbery', dir: { du: 1, thuong: 1, vo: .5 } },
    ad_trinket:   { theme: 'ring', dir: { phap: 1, thuong: .5, du: .5 } },
    ad_guild:     { soc: 1 },
    ad_companion: { theme: 'companion', soc: 1, dir: { vo: 1, du: 1 } },
    ad_companion_lost: { theme: 'companion', ...sf('ad_companion') },
    ad_tax:       { theme: 'tax', soc: 1 }, law_tax_up: { theme: 'tax' },
    ad_dice:      { theme: 'gamble', dir: { am: 1, du: .5, thuong: .5 } },
    ad_map:       { theme: 'treasure', dir: { du: 1, vo: .5, thuong: .5 } },
    ad_map_found: { theme: 'treasure', ...sf('ad_map'), dir: { du: 1, vo: 1 } },   // mềm: bản lưu cũ có bản đồ mà chưa có S.tree vẫn đào được; cờ flags.map giữ ba nhánh loại trừ nhau
    ad_bounty_post: { soc: 1, dir: { vo: 1.5, du: .5 } },
    ad_war:       { theme: 'war' },
    ad_preacher:  { theme: 'faith' },
    ad_tourney:   { theme: 'tourney', soc: 1, dir: { vo: 2 } },
    ad_kid:       { dir: { gia: 1 } },
    el_memoir:    { dir: { tri: 2 } },
    ad_old_friend:{ dir: { gia: 1, du: .5 } },
    // Bộ Xương: thứ tự của những năm đầu (lượt đầu chỉ có nút `fresh`).
    sk_flee:      { fresh: true },
    sk_paladin:   { minAge: 1 },
    sk_call:      { ...sf('sk_wake_whisper') },
    sk_memory:    { theme: 'memory', minAge: 1 },
    sk_grave:     { theme: 'grave', need: ['sk_memory'] },
    sk_fade:      { minAge: 2 },
    sk_kin:       { minAge: 1 },
    sk_child:     { minAge: 1 },
    sk_dark:      { theme: 'dark', minAge: 1 },
    sk_town:      { theme: 'undead_town', minAge: 2 },
    nt_history:   { body: 'living' }
  };

  // ═════════ 5. Cổng chung ═════════
  G.TREE_STATS = null;
  G.treeStatsReset = () => { G.TREE_STATS = { block: {}, edge: {}, theme: {}, node: {}, absurd: 0 }; return G.TREE_STATS; };
  const parse = f => { const [id, o] = String(f).split(':'); return o == null ? { id } : o[0] === '!' ? { id, not: o.slice(1) } : { id, o }; };
  const metaOf = new Map();   // id → nhãn đã gộp (from đã phân tích)
  G.treeMeta = id => metaOf.get(id) || null;
  // Cha đang mở của một nút (hoặc null). Nối mềm: không xét khoảng chờ, không xét đã có nhánh.
  G.treeParent = function (S, m) {
    if (!m || !m.from) return null;
    const T = S.tree || {}, w = m.wait || [0, 99];
    for (const p of m.from) {
      const r = T[p.id]; if (!r) continue;
      if (p.o != null && r.o !== p.o) continue;
      if (p.not != null && r.o === p.not) continue;
      if (m.soft) return p;
      if (r.next) continue;
      const dt = S.age - r.t; if (dt < w[0] || dt > w[1]) continue;
      return p;
    }
    return null;
  };
  // Lý do chặn (chuỗi) hoặc null. Áp cho mọi nút, kể cả nút không có nhãn (luật lượt đầu của Bộ Xương).
  G.treeBlock = function (S, X, m) {
    m = m || {};
    if (S.undead && S.age < G.TREE.fresh && !m.fresh) return 'fresh';
    if (m.body) {
      const con = !!G.RACES[S.race].construct;
      if (m.body === 'flesh' ? (S.undead || con) : m.body === 'living' ? S.undead : m.body === 'undead' ? !S.undead : false) return 'body';
    }
    if (m.race && !m.race.includes(S.race)) return 'race';
    if (m.notRace && m.notRace.includes(S.race)) return 'race';
    if (m.minAge && S.age < m.minAge) return 'age';
    if (m.soc || m.dark) {
      const v = G.standing(S, X);
      const okSoc = !m.soc || v.soc >= m.soc, okDark = !m.dark || v.dark >= m.dark;
      if (m.soc && m.dark ? !(okSoc || okDark) : !(okSoc && okDark)) return 'soc';
    }
    if (m.need && !m.need.every(id => S.tree && S.tree[id])) return 'need';
    const par = m.from ? G.treeParent(S, m) : null;
    if (m.from && !m.soft && !par) return 'from';
    if (m.theme && !par) {
      const last = (S.themes || {})[m.theme];
      if (last != null && S.age - last < (G.THEMES[m.theme] ? G.THEMES[m.theme].gap : 1)) return 'theme';
    }
    if (m.dirMin) for (const [a, x] of Object.entries(m.dirMin)) if (G.trajShare(S, a) < x) return 'dir';
    return null;
  };
  const HARD = { body: 1, race: 1, soc: 1 };
  function gateOf(id, m, orig) {
    return function (S, X) {
      const why = G.treeBlock(S, X, m);
      if (why) {
        if (m.q && HARD[why] && S.flags[m.q] != null && S.flags[m.q] !== false) S.flags[m.q] = null;
        if (G.TREE.stats && orig && G.TREE_STATS && why !== 'from') {   // nhánh chưa mở là chuyện thường, không đếm
         let ok = false; try { ok = !!orig(S, X); } catch (e) { ok = false; } if (ok) { const B = G.TREE_STATS.block, k = why + (S.undead ? ' (xương)' : ''); (B[k] = B[k] || {})[id] = (B[k][id] || 0) + 1; } }
        return false;
      }
      return !orig || orig(S, X);
    };
  }
  // Ghi một nút vừa xảy ra: kết quả, nhánh của cha, chủ đề, quỹ đạo.
  G.treeFire = function (S, id, m, o) {
    m = m || {};
    const T = S.tree || (S.tree = {}), par = G.treeParent(S, m);
    if (par && !m.soft && T[par.id]) T[par.id].next = id;
    T[id] = { t: S.age, o: o == null ? null : String(o) };
    if (m.theme) (S.themes || (S.themes = {}))[m.theme] = S.age;
    const Z = G.TREE.stats && G.TREE_STATS;
    if (Z) {
      Z.node[id] = (Z.node[id] || 0) + 1;
      if (par) { const e = `${par.id} → ${id}`; Z.edge[e] = (Z.edge[e] || 0) + 1; }
      if (m.theme) Z.theme[m.theme] = (Z.theme[m.theme] || 0) + 1;
      if (S.undead && m.soc && !(S.flags.revealed && G.lawHere(S, 'undead_citizen'))) Z.absurd++;   // kiểm chéo: phải luôn 0
    }
  };

  // Bọc sự kiện: cổng vào c, quỹ đạo và kéo nhánh vào w, ghi nút trong run.
  // Hàm bọc giữ mã nguồn của hàm gốc (trang duyệt trích câu chữ bằng toString).
  const keep = (f, o) => { if (o) f.toString = () => o.toString(); return f; };
  function wrapEvent(e) {
    if (e._tree) return; e._tree = true;
    const m = Object.assign({}, G.TREE_META[e.id] || {}, e.tree || {});
    if (m.from) m.from = m.from.map(parse);
    metaOf.set(e.id, m);
    const c0 = e.c, w0 = e.w, r0 = e.run;
    e.wBase = w0;   // trọng số gốc (trang duyệt hiện số)
    e.c = keep(gateOf(e.id, m, c0 ? (S, X) => c0(S, X) : null), c0);
    e.w = keep((S, X) => {
      const w = Math.max(0, (typeof w0 === 'function' ? w0(S, X) : w0) || 0);
      return w * G.dirMult(S, m.dir) * (m.from && !m.soft && G.treeParent(S, m) ? G.TREE.pull : 1);
    }, typeof w0 === 'function' ? w0 : null);
    e.run = keep(function (S, X) {
      const r = r0.call(this, S, X);
      if (r && !S.dead) G.treeFire(S, e.id, m, r.o != null ? r.o : r.k);
      return r;
    }, r0);
  }
  function wrapDecision(id, D) {
    if (D._tree) return; D._tree = true;
    const m = Object.assign({}, G.TREE_META[id] || {}, D.tree || {});
    if (m.from) m.from = m.from.map(parse);
    metaOf.set(id, m);
    const w0 = D.when, a0 = D.apply;
    D.when = keep(gateOf(id, m, (S, X) => w0.call(D, S, X)), w0);
    D.apply = keep(function (S, X, k, c) { const out = a0.call(this, S, X, k, c); if (!S.dead) G.treeFire(S, id, m, k); return out; }, a0);
  }

  // ═════════ 6. Nhánh mới ═════════
  const name1 = s => String(s).split(' ')[0];
  const capOf = S => { const n = G.here && G.here(S).n; return n && G.SET[n.capital] ? G.SET[n.capital].name : 'kinh đô'; };
  const axisOfSkill = sk => { const v = G.SCHOOL_AX[G.MASTERY[sk]] || { vo: 1 }; return Object.entries(v).sort((a, b) => b[1] - a[1])[0][0]; };
  const deathBest = S => Math.max(S.mastery.Necromancy || 0, S.mastery.Soul || 0, S.mastery.Curse || 0);
  const lastDisciple = S => { const d = S.disciples || []; return d.length ? d[d.length - 1] : null; };

  // ── Hồn mới trỗi dậy: lượt đầu của Bộ Xương đi theo kỹ năng kiếp trước còn trong xương ──
  const WAKE = G.SK_WAKE = {
    vo:   'Bàn tay xương tự nắm lại như đang cầm chuôi vũ khí. Thân xác quên hết, chỉ đôi tay còn nhớ cách đánh.',
    phap: 'Không khí quanh huyệt lạnh đi. Những chữ phép bạn không nhớ đã học vẫn lấp lánh sau hốc mắt.',
    am:   'Bạn nghe tiếng thì thầm từ các nấm mồ bên cạnh. Chúng gọi bạn là anh em.',
    nghe: 'Bạn ngồi dậy, việc đầu tiên là nắn lại cái khớp gối lệch. Tay thợ vẫn là tay thợ.'
  };
  G.EVENTS.push(
    { id: 'sk_wake', st: ['adult', 'elder'], undead: true, w: 60, tree: { fresh: true },
      c: S => S.age < 1 && !(S.tree && S.tree.sk_wake),
      run(S, X) {
        const sk = S.inherited ? S.inherited.skill : 'Body', a = axisOfSkill(sk), o = a === 'du' || !WAKE[a] ? 'vo' : a;
        G.trajBump(S, { [o]: .6 });
        return { t: WAKE[o], k: 'big', o };
      } },
    { id: 'sk_wake_robber', st: ['adult', 'elder'], undead: true, w: 8, tree: { fresh: true, from: ['sk_wake:vo'], wait: [0, 1] },
      run(S, X) {
        const g = X.int(2, 6); X.money(g); if (S.inherited) X.gain(S.inherited.skill, 2);
        return { t: `Hai kẻ đào trộm mộ cạy tới huyệt bên cạnh thì thấy bạn đứng dậy. Bạn vung tay theo thói quen; chúng bỏ chạy, để lại xẻng, đèn và ${G.coin(g)}.`, k: 'good' };
      } },
    { id: 'sk_wake_whisper', st: ['adult', 'elder'], undead: true, w: 8, tree: { fresh: true, from: ['sk_wake:am', 'sk_wake:phap'], wait: [0, 1] },
      run(S, X) {
        X.gain('Necromancy', 3); X.gain('Soul', 2);
        return { t: 'Tiếng thì thầm dạy bạn tên thật của từng nấm mồ quanh đây. Gọi đúng tên thì đất động.', k: 'big', f: J.races.skeleton.lore };
      } },
    { id: 'sk_wake_tinker', st: ['adult', 'elder'], undead: true, w: 8, tree: { fresh: true, from: ['sk_wake:nghe'], wait: [0, 1] },
      run(S, X) {
        X.add('hl', 6); X.gain('Engineering', 2);
        return { t: 'Bạn lấy ván quan tài cũ ghép thành mái che trong hầm mộ, chèn đá cho khỏi dột. Chỗ ở đầu tiên của kiếp này.', k: 'good' };
      } },
    // Bộ Xương chưa ai biết mặt không vào được tiệm rèn; đồ đến từ chiến trường cũ, mộ lính.
    { id: 'sk_scavenge', st: ['adult', 'elder'], undead: true, w: 2.5, rep: true, gap: 3, tree: { minAge: 1 },
      c: (S, X) => S.gear < Math.min(10, 2 + 2 * X.ctier(S)) && G.standing(S, X).soc < 1,
      run(S, X) {
        S.gear++;
        return { t: X.pick(['Bạn lột được bộ giáp còn tốt trên xác một kỵ sĩ ở chiến trường cũ.', 'Mộ lính bị lở sau mưa. Thanh kiếm trong đó chưa gỉ hết.', 'Bạn nhặt lại vũ khí của một toán thợ săn quái không về.']) + ` Trang bị ${S.gear}/10.`, k: 'good' };
      } },
    // ── Ông bà kể chuyện: Bộ Xương không có ông bà, nghe lỏm lữ khách ──
    { id: 'sk_history', st: ['adult', 'elder'], undead: true, w: 1.5, rep: true, gap: 8, tree: { minAge: 2 },
      c: S => ((S.world.dyn && S.world.dyn.hist) || []).some(h => h.y < S.birthYear),
      run(S, X) {
        const H = S.world.dyn.hist.filter(h => h.y < S.birthYear), h = H[(S.age * 7919 + S.birthYear) % H.length]; X.add('sm', 1);
        return { t: `Nấp sau bụi cây, bạn nghe lữ khách bên đống lửa kể chuyện năm ${h.y}: ${h.t}`, k: 'info' };
      } }
  );

  // ── Hắc đồ: đệ tử của Bộ Xương đến từ giới hắc ám, không phải từ dân làng ──
  DEC.sk_acolyte = {
    prio: 3, gap: 4, tree: { theme: 'teach', body: 'undead', dark: 2, minAge: 3 },
    when: (S, X) => !S.dead && S.undead && !S.flags.acolyte && (deathBest(S) >= 30 || S.faith === 'dark'),
    build(S, X) {
      const nm = X.name('human', X.chance(.5) ? 'm' : 'f'), sk = deathBest(S) >= 30 ? ['Necromancy', 'Soul', 'Curse'].sort((a, b) => S.mastery[b] - S.mastery[a])[0] : 'Necromancy';
      return { title: 'Kẻ học hắc thuật', body: `${nm} bị đuổi khỏi học viện vì đào mộ thử phép. Hắn lần theo lời đồn tới hầm của bạn, quỳ xuống xin học ${G.mv(sk).toLowerCase()}.`,
        choices: [{ k: 'yes', label: 'Nhận làm hắc đồ', sub: 'Có người sống chạy việc, mang tin; giới hắc ám biết tên bạn. Hắn có thể trung thành, cũng có thể bán bạn.', name: nm, skill: sk }, { k: 'no', label: 'Đuổi đi', sub: '' }] };
    },
    apply(S, X, k, c) {
      if (k !== 'yes') return 'Hắn đi rồi, nhưng biết chỗ của bạn.';
      S.flags.acolyte = { name: c.name, skill: c.skill }; cnt(S, 'acolyteTake'); X.add('so', 6); X.add('h', 4); G.trajBump(S, { am: .4 });
      return `${c.name} dọn vào góc hầm, ngủ cạnh những bộ xương chưa đứng dậy.`;
    },
    auto: S => S.traits.social > .35 || S.faith === 'dark' ? 'yes' : 'no'
  };
  G.EVENTS.push(
    { id: 'sk_acolyte_loyal', st: ['adult', 'elder'], undead: true, tree: { from: ['sk_acolyte:yes'], wait: [2, 6] },
      c: S => !!S.flags.acolyte, w: S => 2 + 4 * S.traits.social + (S.faith === 'dark' ? 2 : 0),
      run(S, X) {
        const a = S.flags.acolyte; a.loyal = true; X.add('so', 8); X.add('h', 8); X.money(10); S.fame += 2; cnt(S, 'acolyteLoyal');
        return { t: `${name1(a.name)} dựng một am thờ nhỏ ở cửa hầm. Mỗi tuần hắn mang dầu, vải và tin tức về; dân quanh vùng thôi bén mảng tới.`, k: 'good' };
      } },
    { id: 'sk_acolyte_betray', st: ['adult', 'elder'], undead: true, tree: { from: ['sk_acolyte:yes'], wait: [2, 6] },
      c: S => !!S.flags.acolyte, w: S => 1 + 3 * (1 - S.traits.social) + (G.lawHere(S, 'hunt_undead') ? 3 : 0) + ((G.REGION[S.loc].faiths || {}).light || 0) / 25,
      run(S, X) {
        const a = S.flags.acolyte; S.flags.acolyte = null; S.flags.revealed = true; X.cond('hunted'); X.add('h', -10); X.add('so', -6); cnt(S, 'acolyteBetray');
        return { t: `${name1(a.name)} bán chỗ trú của bạn cho Giáo hội Quang Minh lấy một tờ ân xá. Đêm đó đuốc vây kín nghĩa địa.`, k: 'bad', f: J.faiths.light.tenet };
      } },
    { id: 'sk_acolyte_lich', st: ['adult', 'elder'], undead: true, w: 3, tree: { from: ['sk_acolyte:yes'], wait: [2, 6], dirMin: { am: .3 } },
      c: S => !!S.flags.acolyte && (S.mastery.Necromancy || 0) >= 45,
      run(S, X) {
        const a = S.flags.acolyte; a.undead = true; X.gain('Necromancy', 4); X.add('so', 5); cnt(S, 'acolyteLich');
        return { t: `${name1(a.name)} xin được chết để đứng dậy như bạn. Bạn làm phép. Từ đêm đó trong hầm có hai bộ xương.`, k: 'big' };
      } }
  );

  // ── Đệ tử người sống: nhánh sau khi nhận đệ tử (quyết định disciple, js/edu.js) ──
  G.EVENTS.push(
    { id: 'dt_proud', st: ['adult', 'elder'], tree: { body: 'living', from: ['disciple:yes'], wait: [3, 9] },
      c: S => !!lastDisciple(S), w: S => 3 + 2 * S.traits.social,
      run(S, X) {
        const d = lastDisciple(S); S.fame = Math.min(100, S.fame + 3); X.add('h', 8); cnt(S, 'dtProud');
        return { t: `${name1(d.name)} mở lớp dạy ${G.mv(d.skill).toLowerCase()}. Ai hỏi thầy là ai, ${name1(d.name)} cũng nói tên bạn trước.`, k: 'good' };
      } },
    { id: 'dt_rival', st: ['adult', 'elder'], tree: { body: 'living', from: ['disciple:yes'], wait: [3, 9] },
      c: S => !!lastDisciple(S), w: S => 1 + 6 * G.trajShare(S, 'am') + 1.5 * (1 - S.traits.social),
      run(S, X) {
        const d = lastDisciple(S); X.add('so', -5); X.add('h', -8); cnt(S, 'dtRival');
        return { t: `${name1(d.name)} mang bút ký của bạn sang nhà khác, sửa vài chữ rồi dựng môn hộ riêng. Người ta khen thế ${G.mv(d.skill).toLowerCase()} mới lạ.`, k: 'bad' };
      } },
    { id: 'dt_fallen', st: ['adult', 'elder'], tree: { body: 'living', from: ['disciple:yes'], wait: [3, 9], dirMin: { vo: .2 } },
      c: S => !!lastDisciple(S), w: S => 1 + 4 * G.trajShare(S, 'vo'),
      run(S, X) {
        const d = lastDisciple(S); X.add('h', -12); cnt(S, 'dtFallen');
        return { t: `${name1(d.name)} theo bạn vào khu săn sâu hơn sức mình và không trở ra. Bạn chôn thanh kiếm gỗ đầu tiên đã tặng nó.`, k: 'bad' };
      } }
  );

  // ── Bạn đồng hành: nhánh theo quỹ đạo của bạn ──
  G.EVENTS.push(
    { id: 'cp_save', st: ['adult', 'elder'], tree: { theme: 'companion', from: ['ad_companion'], wait: [1, 6] },
      c: S => !!S.flags.companion, w: S => 1 + 4 * G.trajShare(S, 'vo'),
      run(S, X) {
        const c = S.flags.companion; X.add('hl', 8); X.add('so', 6); cnt(S, 'cpSave');
        return { t: `${name1(c.name)} kéo bạn ra khỏi móng vuốt một con quái giữa trận. Bạn nợ người đó một mạng.`, k: 'good' };
      } },
    { id: 'cp_betray', st: ['adult', 'elder'], tree: { theme: 'companion', from: ['ad_companion'], wait: [1, 6] },
      c: S => !!S.flags.companion, w: S => .5 + 4 * G.trajShare(S, 'am') + 2 * G.trajShare(S, 'thuong') + (S.traits.social < .3 ? 1 : 0),
      run(S, X) {
        const c = S.flags.companion, g = Math.round(Math.max(0, S.gold) * .3); S.flags.companion = null; X.money(-g); X.add('h', -8); X.add('so', -6); cnt(S, 'cpBetray');
        return { t: `Sáng ra, chỗ ${name1(c.name)} nằm trống trơn, túi chung cũng nhẹ đi ${G.coin(g)}. Bạn không đuổi theo.`, k: 'bad' };
      } },
    { id: 'cp_wed', st: ['adult'], tree: { theme: 'companion', body: 'flesh', from: ['ad_companion'], wait: [1, 6] },
      c: S => !!S.flags.companion && !(S.family.spouse && S.family.spouse.alive) && !G.RACES[S.flags.companion.race].construct,
      w: S => .3 + 4 * G.trajShare(S, 'gia') + 1.5 * S.traits.social,
      run(S, X) {
        const c = S.flags.companion; S.flags.companion = null;
        S.family.spouse = { name: c.name, race: c.race, age: X.years(S) + X.int(-3, 3), alive: true }; X.add('h', 12); X.add('so', 8); cnt(S, 'cpWed');
        return { t: `Sau ngần ấy chuyến đi chung, ${name1(c.name)} hỏi bạn có muốn dừng lại ở một nơi nào đó không. Hai người làm đám cưới nhỏ ở quán trọ quen.`, k: 'big' };
      } },
    { id: 'cp_part', st: ['adult', 'elder'], tree: { theme: 'companion', from: ['ad_companion'], wait: [1, 6] },
      c: S => !!S.flags.companion,
      w: S => 3 * (G.trajShare(S, 'tri') + G.trajShare(S, 'nghe') + G.trajShare(S, 'quyen') + G.trajShare(S, 'thuong') + G.trajShare(S, 'gia') * .5),
      run(S, X) {
        const c = S.flags.companion; S.flags.companion = null; X.add('so', -2); cnt(S, 'cpPart');
        return { t: `Bạn ở lại với việc của mình, ${name1(c.name)} đi tiếp về phía biên giới. Hai người hẹn gặp lại, cả hai đều biết khó.`, k: 'info' };
      } }
  );

  // ── Tấm bản đồ: tìm, bán, hay nhận ra đồ giả ──
  G.EVENTS.push(
    { id: 'map_sell', st: ['adult', 'elder'], w: 2, tree: { theme: 'treasure', from: ['ad_map'], wait: [1, 8], dir: { thuong: 2 } },
      c: S => S.flags.map === true,
      run(S, X) { const g = X.int(20, 60); S.flags.map = 'sold'; X.money(g); return { t: `Một thương nhân đồ cổ trả ${G.coin(g)} cho tấm bản đồ. Bạn không hỏi ông ta định làm gì với nó.`, k: 'good' }; } },
    { id: 'map_fake', st: ['adult', 'elder'], w: 2, tree: { theme: 'treasure', from: ['ad_map'], wait: [1, 8], dir: { tri: 2 } },
      c: S => S.flags.map === true,
      run(S, X) { S.flags.map = 'used'; X.add('sm', 4); return { t: 'Bạn đối chiếu tấm bản đồ với sách địa chí: con sông trên đó chảy ngược. Đồ giả, vẽ chưa tới mười năm.', k: 'info' }; } }
  );

  // ── Sau khi theo đạo ──
  const faithVi = S => (S.faith && J.faiths[S.faith] ? J.faiths[S.faith].nameVi : 'đạo');
  G.EVENTS.push(
    { id: 'fa_pilgrim', st: ['teen', 'adult', 'elder'], w: 2, tree: { theme: 'faith', body: 'living', from: ['faith_join:!no'], wait: [2, 8], dir: { dao: 2 } },
      c: S => !!S.faith,
      run(S, X) { S.devotion = Math.min(100, S.devotion + 10); X.add('h', 5); return { t: `Bạn đi hành hương tới đền tổ của ${faithVi(S)}, ngủ ngoài hiên đền cùng trăm người lạ.`, k: 'good' }; } },
    { id: 'fa_doubt', st: ['teen', 'adult', 'elder'], tree: { theme: 'faith', body: 'living', from: ['faith_join:!no'], wait: [2, 8], dir: { tri: 1, am: 1 } },
      c: S => !!S.faith, w: S => 1 + 2 * (1 - S.traits.pious),
      run(S, X) { S.devotion = Math.max(0, S.devotion - 10); X.add('sm', 3); return { t: `Bạn đọc kinh của một đạo khác và mất ngủ cả tháng. Lời giảng của ${faithVi(S)} nghe không còn chắc như trước.`, k: 'info' }; } },
    { id: 'fa_mission', st: ['adult', 'elder'], w: 1.5, tree: { theme: 'faith', body: 'living', soc: 1, from: ['faith_join:!no'], wait: [2, 8], dir: { du: 1, dao: 1 } },
      c: S => !!S.faith,
      run(S, X) { S.fame = Math.min(100, S.fame + 2); X.add('h', 3); S.devotion = Math.min(100, S.devotion + 4); return { t: `Đền ${faithVi(S)} giao bạn mang thư tới giáo đoàn ở vùng bên. Đường xa, nhưng đi đâu cũng có người cùng đạo cho ngủ nhờ.`, k: 'good' }; } }
  );

  // ═════════ 7. Bọc, hệ con, kiếp sau ═════════
  for (const e of G.EVENTS) wrapEvent(e);
  for (const e of G.NATION_EVENTS || []) wrapEvent(e);
  for (const [id, D] of Object.entries(G.DECISIONS)) wrapDecision(id, D);

  G.SYSTEMS.push({ id: 'traj', when: S => !S.dead, run: (S, X) => G.trajYear(S, X) });

  // Bộ Xương mang theo quỹ đạo của hồn (một nửa), nghiêng về Ám.
  { const r0 = G.Sim.prototype.rise;
    G.Sim.prototype.rise = function () {
      const old = this.S, S = r0.call(this);
      if (S && old && old.traj) { S.traj = Object.fromEntries(AX.map(a => [a, old.traj[a] * .5])); S.traj.am += .15; }
      return S;
    }; }
})(window.LifeSim);
