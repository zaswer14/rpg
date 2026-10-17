/* Vạn Kiếp — DANH VỌNG, THÀNH TỰU, LỊCH SỬ LỰA CHỌN, BIÊN BẢN CUỘC ĐỜI (docs/17; người dùng yêu cầu 17/10/2026).
 * Nạp sau saga.js (cuối cùng trước ui.js): bọc mọi sự kiện, quyết định, trận săn, hệ con đã có.
 *   1. Danh vọng S.fame (0–100, có sẵn, hơn trăm chỗ cộng trừ) giờ có
 *      - nguồn: mỗi lần đổi được quy cho việc đang chạy (trận săn, sự kiện, quyết định, hệ con cuối năm) → S.fameS.src, .top;
 *      - phai: phần trên danh vọng bền (S.fameS.base = thành tựu + 30% đỉnh) phai G.FAME.fade mỗi năm (người già quên nhanh hơn);
 *      - tầm (G.FAME_SCOPE): vô danh, trong làng, cả tỉnh, cả nước, khắp đại lục; lên tầm có dòng nhật ký;
 *      - thanh danh S.rep (−100…100, G.REP_VI): tiếng tốt hay xấu, từ dấu hệ quả, việc làm (G.REP_DEEDS), mất danh vọng vì việc xấu,
 *        danh phận bóng tối; phai dần về 0; đổi Quan hệ mỗi năm và trọng số vài sự kiện (G.REP_W);
 *      - danh hiệu: thành tựu cao nhất có `title`, hoặc hiệu do người đời đặt (S.flags.epithet).
 *   2. Thành tựu G.ACH (11 nhóm, 4 bậc G.ACH_RANK): kiểm sau mỗi quyết định, cuối năm, lúc chết; mỗi cái cộng danh vọng bền.
 *      Lưu S.ach [{ id, y, wy, t }]; bộ sưu tập qua mọi kiếp do ui.js giữ (vankiep.ach.v1).
 *   3. Lịch sử lựa chọn: bọc Sim.prototype.choose ngoài cùng; chụp trạng thái trước / sau → S.choices [{ id, title, label, alts, y, fx… }]
 *      và một dòng nhật ký kind 'fx' ("→ Tác động: …", phần lựa chọn không chọn ở dòng phụ).
 *   4. G.lifeStats(S, X): các mục thống kê lúc chết (ui.js bảng chết, sim.html); G.storyTree(S, X): dữ liệu cây cốt truyện một đời.
 * Đếm cho sim.html: G.FAME.stats → G.FAME_STATS. Trạng thái: S.fameS { src, top, f0, peak, peakY, base, scope, hist, cnt, title }, S.rep,
 * S.ach, S.choices, S.peak { gold, goldY, q, lv }.
 */
window.LifeSim = window.LifeSim || {};
(function (G) {
  const J = window.JobLibrary, API = G.storyApi || {};
  const keep = API.keep || ((f, o) => f);
  const P = G.Sim.prototype;
  const r1 = v => Math.round(v * 10) / 10;
  const sign = v => (v > 0 ? '+' : '−') + Math.abs(v);
  const first = n => String(n || '').split(' ')[0];

  G.FAME = { soft: 20, softK: 65, softMin: .1, fade: .03, fadeOld: 1.6, fadeBone: .7, baseK: .3, repFade: .02, repSo: .01, stats: false };
  G.FAME_STATS = null;
  G.fameStatsReset = () => { G.FAME_STATS = { ach: {}, scope: {}, rep: {}, peak: [], end: [], choices: 0, fxNone: 0, lives: 0, src: {} }; return G.FAME_STATS; };

  // ═════════ 1. Danh vọng: nguồn, phai, tầm ═════════
  G.FAME_SCOPE = [
    { min: 0, nameVi: 'Vô danh' }, { min: 10, nameVi: 'Có tiếng trong làng' }, { min: 25, nameVi: 'Nổi tiếng cả tỉnh' },
    { min: 50, nameVi: 'Lừng danh cả nước' }, { min: 70, nameVi: 'Vang danh khắp đại lục' }
  ];
  G.REP_VI = [[40, 'tiếng thơm'], [15, 'được quý'], [-15, 'tiếng tăm bình thường'], [-40, 'tai tiếng'], [-101, 'khét tiếng']];
  G.SRC_VI = { hunt: 'Săn quái', ev: 'Sự kiện', dec: 'Quyết định', yr: 'Chức tước, học vấn, việc trong năm', ach: 'Thành tựu', fade: 'Phai theo năm tháng', loss: 'Mất vì việc làm' };
  const SYS_VI = { noble: 'Tước vị', org: 'Chức vụ, hội', edu: 'Học vấn, thầy trò', status: 'Thân phận', inst: 'Học viện, tỉ thí', career: 'Nghề nghiệp', econ: 'Nghề, tác phẩm', fate: 'Kỳ ngộ', realmev: 'Việc của nước' };
  const scopeOf = f => { let k = 0; G.FAME_SCOPE.forEach((s, i) => { if (f >= s.min) k = i; }); return k; };
  G.fameScope = S => scopeOf(S.fame || 0);
  G.repText = S => { const v = S.rep || 0; return G.REP_VI.find(([t]) => v >= t)[1]; };
  const FS = S => S.fameS || (S.fameS = { src: { hunt: 0, ev: 0, dec: 0, yr: 0, ach: 0, fade: 0, loss: 0 }, top: [], f0: S.fame || 0, peak: S.fame || 0, peakY: 0, base: 0, scope: scopeOf(S.fame || 0), hist: [], cnt: {}, title: null });
  const repAdd = (S, v) => { S.rep = G.clamp((S.rep || 0) + v, -100, 100); };

  // Quy phần danh vọng đổi kể từ lần trước cho một nguồn; việc lớn (|d| ≥ 2) vào danh sách "làm nên tên tuổi".
  function flush(S, X, kind, what) {
    if (!S) return 0;
    const F = FS(S); S.fame = G.clamp(S.fame || 0, 0, 100);
    let d = S.fame - F.f0;
    // Càng nổi tiếng càng khó nổi thêm: phần tăng trên mốc G.FAME.soft bị nén (100 là tên tuổi của cả đại lục, không phải của mọi tay săn giỏi).
    if (d > 0 && kind !== "fade") { const mid = F.f0 + d / 2, k = Math.max(G.FAME.softMin, 1 - Math.max(0, mid - G.FAME.soft) / G.FAME.softK); d *= k; S.fame = F.f0 + d; }
    F.f0 = S.fame;
    if (Math.abs(d) < 1e-6) return 0;
    if (d > 0 || kind === 'fade') F.src[kind] = (F.src[kind] || 0) + d; else F.src.loss += d;
    if (what && Math.abs(d) >= 2) {
      F.top.push({ d: r1(d), what: String(what).slice(0, 140), y: X.years(S), wy: S.world.year });
      F.top.sort((a, b) => b.d - a.d); if (F.top.length > 12) F.top.length = 12;
    }
    if (d < 0 && kind !== 'fade' && kind !== 'yr') repAdd(S, d * 1.5);   // mất danh vọng vì việc mình làm: tiếng xấu đi theo
    if (S.fame > F.peak) { F.peak = S.fame; F.peakY = X.years(S); }
    return d;
  }
  G.fameFlush = flush;

  // Việc làm đổi thanh danh: đếm cờ có sẵn, mỗi lần tăng thì cộng (đọc cuối năm, sau mỗi quyết định).
  G.REP_DEEDS = {
    crimes: -6, killer: -10, greedSeen: -8, greed_rob: -6, forbCaught: -12, forb_learn: -4, levyFlee: -5, cpBetray: -10, acolyteTake: -4, orcRaid: -3, robLose: 0,
    rescueN: 5, grHelp: 4, greed_guard: 4, forb_report: 5, cpSave: 4, dutyWin: 3, headFights: 2, quests: 1, robWin: 1, levyGo: 2, tourneyWin: 4, discipleDone: 3
  };
  function deeds(S) {
    const F = FS(S), C = F.cnt, fl = S.flags; let v = 0;
    for (const [k, x] of Object.entries(G.REP_DEEDS)) {
      const n = typeof fl[k] === 'number' ? fl[k] : fl[k] ? 1 : 0, o = C[k] || 0;
      if (n > o) { v += (n - o) * x; C[k] = n; }
    }
    if (v) repAdd(S, v);
  }
  // Dấu hệ quả (js/saga.js) cũng là tiếng: dấu tốt +6, dấu xấu −8, lúc mới nhận.
  if (G.markAdd) { const m0 = G.markAdd;
    G.markAdd = function (S, X, id, src) {
      const had = (S.marks || []).some(m => m.id === id);
      m0(S, X, id, src);
      const M = G.MARKS[id]; if (!had && M && (S.marks || []).some(m => m.id === id)) repAdd(S, M.tone === 'good' ? 6 : M.tone === 'bad' ? -8 : 0);
    }; }
  // Thanh danh đổi trọng số: người tiếng thơm được mai mối, giúp đỡ nhiều hơn; tiếng xấu thì bị lườm, bị nhắm.
  G.REP_W = { ad_suitor: .5, cm_help: .6, cm_visit: .4, ad_bounty_post: .3, cm_glare: -.8, ad_bandits: -.3 };
  for (const e of G.EVENTS) {
    const k = G.REP_W[e.id]; if (k == null) continue;
    const w0 = e.w;
    e.w = keep((S, X) => { const w = typeof w0 === 'function' ? w0(S, X) : w0; return w * Math.max(.2, 1 + k * (S.rep || 0) / 100); }, w0);
  }

  // ═════════ 2. Thành tựu ═════════
  G.ACH_RANK = [null, { nameVi: 'Đồng', fame: 0, col: "#c08a5a" }, { nameVi: "Bạc", fame: 1, col: '#c9ced6' }, { nameVi: "Vàng", fame: 2, col: '#e8c26a' }, { nameVi: "Huyền thoại", fame: 4, col: '#d6b3ff' }];
  G.ACH_CAT = { live: 'Sinh tồn', war: 'Chiến đấu', cult: 'Tu luyện', learn: 'Học vấn', rank: 'Địa vị', rich: 'Của cải', kin: 'Gia đình', saga: 'Đường đời', road: 'Hành trình', fate: 'Kỳ ngộ', dark: 'Bóng tối', fame: 'Danh vọng', bone: 'Bộ Xương' };
  const fl = (S, k) => S.flags[k] || 0;
  const kills = S => Object.values(S.kills || {}).reduce((a, b) => a + b, 0);
  const med = (S, X) => G.median(X.reg(S));
  const lifeE = (S, X) => X.lt(S).leT * X.R(S).ypt;   // tuổi thọ kỳ vọng (năm)
  const regions = S => new Set((S.years || []).map(y => y.loc).concat([S.loc])).size;
  const sagaGood = S => (S.arcDone || []).some(d => G.SAGA && G.SAGA[d.k] && G.ARCS[d.k].good.includes(d.o));
  const arcsN = S => (S.arcDone || []).filter(d => d.o !== 'faded' && d.o !== 'gone').length;
  const tierAch = (t, rank, title) => ({ id: 'tier' + t, cat: 'cult', rank, nameVi: G.tierName(t), d: `Đạt Tier ${t}.`, title, ok: (S, X) => X.ctier(S) >= t });
  G.ACH = [
    // Sinh tồn
    { id: 'grown', cat: 'live', rank: 1, nameVi: 'Qua tuổi thơ', d: 'Sống tới tuổi trưởng thành của giống loài mình.', ok: (S, X) => !S.undead && X.years(S) >= X.R(S).adult },
    { id: 'long', cat: 'live', rank: 2, nameVi: 'Sống thọ', d: 'Sống quá tuổi thọ kỳ vọng của người cùng loài, cùng vùng.', ok: (S, X) => !S.undead && X.years(S) >= lifeE(S, X) * 1.15 },
    { id: 'ancient', cat: 'live', rank: 3, nameVi: 'Cây cổ thụ', d: 'Sống gấp rưỡi tuổi thọ kỳ vọng.', ok: (S, X) => !S.undead && X.years(S) >= lifeE(S, X) * 1.5 },
    { id: 'brink', cat: 'live', rank: 2, nameVi: 'Thập tử nhất sinh', d: 'Qua một năm với sinh lực dưới 8 mà vẫn sống.', ok: (S, X, w) => { const y = S.years[S.years.length - 1]; return w === 'year' && !!y && y.hl < 8; } },
    { id: 'rise_up', cat: 'live', rank: 2, nameVi: 'Đổi đời', d: 'Lên hai tầng lớp so với nhà mình lúc sinh.', ok: S => !S.undead && (S.peak ? S.peak.q : S.q) - (S.flags.q0 || S.q) >= 2 },
    { id: 'orphan_up', cat: 'live', rank: 3, nameVi: 'Từ nhà tế bần', d: 'Mồ côi từ lúc sinh mà lên tới nhà khá giả.', ok: S => !!S.flags.orphan && S.q >= 4 },
    // Chiến đấu
    { id: 'first_kill', cat: 'war', rank: 1, nameVi: 'Trận đầu', d: 'Thắng trận săn đầu tiên.', ok: S => S.hunts.won >= 1 },
    { id: 'kills100', cat: 'war', rank: 2, nameVi: 'Trăm con quái', d: 'Hạ 100 con quái.', ok: S => kills(S) >= 100 },
    { id: 'kills500', cat: 'war', rank: 3, nameVi: "Năm trăm con quái", d: "Hạ 500 con quái.", title: "Đồ Tể Của Quái", ok: S => kills(S) >= 500 },
    { id: "upset", cat: "war", rank: 1, nameVi: 'Lấy yếu thắng mạnh', d: 'Thắng quái cao hơn mình một Tier.', ok: S => fl(S, 'upWin') >= 1 },
    { id: "alpha", cat: "war", rank: 1, nameVi: 'Hạ đầu đàn', d: 'Thắng một con quái đầu đàn.', ok: S => fl(S, 'alphaWin') >= 1 },
    { id: 'lord', cat: 'war', rank: 3, nameVi: 'Hạ chúa vùng', d: 'Hạ một chúa vùng.', title: S => 'Kẻ Hạ ' + (S.flags.lordSlayer || 'Chúa Vùng'), ok: S => !!S.flags.lordSlayer || fl(S, 'lordWin') >= 1 },
    { id: 'lair', cat: 'war', rank: 2, nameVi: 'Dọn hang ổ', d: 'Dọn sạch một hang ổ quái.', ok: S => fl(S, 'lairs') >= 1 },
    { id: 'lair5', cat: 'war', rank: 3, nameVi: 'Người dọn hang', d: 'Dọn sạch năm hang ổ.', title: 'Người Dọn Hang', ok: S => fl(S, 'lairs') >= 5 },
    { id: 'deep', cat: 'war', rank: 3, nameVi: 'Xuống đáy di tích', d: 'Qua ba tầng di tích.', ok: S => fl(S, 'dgFloors') >= 3 },
    { id: 'champ', cat: 'war', rank: 3, nameVi: 'Vô địch tỉ thí', d: 'Vô địch đại hội tỉ thí.', title: 'Nhà Vô Địch', ok: S => fl(S, 'tourneyWin') >= 1 },
    // Tu luyện
    tierAch(1, 1), tierAch(2, 2), tierAch(3, 3), tierAch(4, 4, 'Thủ Hộ Giả'), tierAch(5, 4, 'Huyền Thoại Giả'),
        { id: "enlight", cat: "cult", rank: 4, nameVi: 'Ngộ đạo', d: 'Ngộ ra đạo của mình.', ok: S => !!S.flags.enlight || fl(S, 'ringEnlight') >= 1 },
    { id: "awaken", cat: "cult", rank: 1, nameVi: 'Thức tỉnh', d: 'Thức tỉnh thiên phú hay huyết mạch.', ok: S => fl(S, 'talAwaken') + fl(S, 'bloodWake') + fl(S, 'reawaken') >= 1 },
    // Học vấn
    { id: 'grad', cat: 'learn', rank: 2, nameVi: 'Tốt nghiệp học viện', d: 'Học xong học viện trung cấp trở lên.', ok: S => fl(S, 'grad2') + fl(S, 'grad3') >= 1 },
    { id: 'top', cat: 'learn', rank: 3, nameVi: 'Thủ khoa', d: 'Đỗ thủ khoa kỳ thi học viện.', ok: S => fl(S, 'eduTop') >= 1 },
    { id: "master_out", cat: "learn", rank: 1, nameVi: 'Xuất sư', d: 'Học trọn nghề của thầy.', ok: S => fl(S, 'mentorDone') >= 1 },
    { id: 'teacher', cat: 'learn', rank: 2, nameVi: 'Truyền nghề', d: 'Nhận đệ tử.', ok: S => fl(S, 'discipleTake') >= 1 },
    { id: "sage", cat: "learn", rank: 2, nameVi: "Bác học", d: "Hiểu biết đạt 98.", ok: S => S.sm >= 98 },
    // Địa vị
    { id: 'head', cat: 'rank', rank: 2, nameVi: 'Được dân bầu', d: 'Làm trưởng thôn, trưởng làng, thị trưởng hay thành chủ.', ok: S => fl(S, 'headElect') >= 1 },
    { id: 'founder', cat: 'rank', rank: 2, nameVi: 'Người lập làng', d: 'Lập một làng hay một thị trấn.', title: 'Người Mở Đất', ok: S => fl(S, 'foundVillage') + fl(S, 'foundTown') >= 1 },
    { id: 'office', cat: 'rank', rank: 2, nameVi: 'Ra làm quan', d: 'Được bổ làm quan tỉnh.', ok: S => fl(S, 'office') >= 1 },
    { id: 'minister', cat: 'rank', rank: 3, nameVi: 'Đại thần', d: 'Được triệu về kinh làm Đại thần.', ok: S => fl(S, 'office2') >= 1 },
    { id: 'noble', cat: 'rank', rank: 3, nameVi: 'Được phong tước', d: 'Có tước quý tộc.', ok: S => fl(S, 'nobleMax') >= 1 },
    { id: 'high_noble', cat: 'rank', rank: 4, nameVi: 'Đại quý tộc', d: 'Lên tới tước thứ tư trở lên.', ok: S => fl(S, 'nobleMax') >= 4 },
    { id: 'guild_lead', cat: 'rank', rank: 2, nameVi: 'Đứng đầu một hội', d: 'Làm hội trưởng, trưởng chi nhánh hay tự lập hội.', ok: S => fl(S, 'orgLead') + fl(S, 'orgFound') + fl(S, 'advBranch') >= 1 },
    { id: 'crown', cat: 'rank', rank: 4, nameVi: 'Lên ngôi', d: 'Ngồi lên ngai một nước.', title: S => S.flags.epithet || 'Người Đội Vương Miện', ok: S => fl(S, 'royalCrown') + fl(S, 'claimWin') + fl(S, 'duelWin') + fl(S, 'foundNation') + fl(S, 'rebelOK') >= 1 },
    // Của cải
    { id: 'rich', cat: 'rich', rank: 2, nameVi: 'Giàu có', d: 'Có trong tay gấp mười thu nhập trung vị của vùng.', ok: (S, X) => S.gold >= 10 * med(S, X) },
    { id: 'tycoon', cat: 'rich', rank: 3, nameVi: "Phú gia địch quốc", d: "Có trong tay gấp trăm lần thu nhập trung vị.", title: "Phú Gia", ok: (S, X) => S.gold >= 100 * med(S, X) },
    // Gia đình
    { id: 'wed', cat: 'kin', rank: 1, nameVi: 'Thành gia', d: 'Lấy vợ, lấy chồng.', ok: S => !!S.family.spouse },
    { id: 'brood', cat: 'kin', rank: 2, nameVi: 'Con đàn cháu đống', d: 'Có năm con trở lên.', ok: S => S.family.kids.length >= 5 },
    { id: 'bond', cat: 'kin', rank: 2, nameVi: 'Tri kỷ', d: 'Có một người quen thân tới mức 80.', ok: S => (S.cast || []).some(p => p.bond >= 80 && p.role !== 'phoi') },
    // Đường đời
    { id: 'road', cat: 'saga', rank: 1, nameVi: 'Chọn đường', d: 'Chọn một đường đời.', ok: S => !!(S.saga && S.saga.k) },
    { id: "road_done", cat: "saga", rank: 2, nameVi: 'Trọn một đường đời', d: 'Khép mạch chính với một kết được coi là làm được.', ok: S => sagaGood(S) },
    { id: "tales", cat: "saga", rank: 1, nameVi: 'Đời nhiều chuyện', d: 'Khép sáu mạch truyện.', ok: S => arcsN(S) >= 6 },
    { id: 'avenged', cat: 'saga', rank: 2, nameVi: 'Báo được thù', d: 'Khép mạch Báo thù hay Mối thù bằng chiến thắng.', ok: S => (S.arcDone || []).some(d => (d.k === 'vengeance' || d.k === 'feud') && d.o === 'win') },
    { id: 'whole', cat: 'saga', rank: 3, nameVi: 'Không phụ đời mình', d: 'Lúc chết, mọi chương đời (ít nhất ba) đều làm được.', ok: (S, X, w) => w === 'death' && (S.chapDone || []).length >= 3 && S.chapDone.every(c => c.ok) },
    // Hành trình
    { id: 'roam5', cat: 'road', rank: 2, nameVi: 'Đi khắp chốn', d: 'Sống ở năm vùng khác nhau.', ok: S => regions(S) >= 5 },
    { id: 'roam10', cat: 'road', rank: 3, nameVi: "Chân trời góc bể", d: "Sống ở tám vùng khác nhau.", title: "Lữ Khách", ok: S => regions(S) >= 8 },
    { id: 'sea', cat: 'road', rank: 1, nameVi: 'Vượt biển', d: 'Đi một chuyến tàu.', ok: S => fl(S, 'voyages') >= 1 },
    { id: 'sea5', cat: 'road', rank: 2, nameVi: "Người của biển", d: "Đi ba chuyến tàu.", ok: S => fl(S, "voyages") >= 3 },
    // Kỳ ngộ
    { id: 'ring', cat: 'fate', rank: 2, nameVi: 'Nhẫn cổ có hồn', d: 'Đeo chiếc nhẫn có linh hồn người xưa.', ok: S => !!S.flags.ring || fl(S, 'ring_wear') >= 1 },
    { id: 'ruin', cat: 'fate', rank: 2, nameVi: 'Qua bí cảnh', d: 'Vào bí cảnh và trở ra.', ok: S => fl(S, 'ruinWin') >= 1 },
    { id: 'ring_win', cat: 'fate', rank: 3, nameVi: 'Giữ được mình', d: 'Ma hồn trong nhẫn đòi đoạt xá mà không được.', ok: S => fl(S, 'ringResist') >= 1 },
    // Bóng tối
    { id: 'wanted', cat: 'dark', rank: 1, nameVi: 'Bị truy nã', d: 'Có tên trên bảng truy nã của một nước.', ok: S => !!(S.flags.wanted && Object.keys(S.flags.wanted).length) },
    { id: 'forbidden', cat: 'dark', rank: 2, nameVi: 'Chạm vào cấm thuật', d: 'Học cấm thuật của hắc ma pháp sư.', ok: S => !!S.flags.forb || fl(S, 'forb_learn') >= 1 },
    { id: 'blood', cat: 'dark', rank: 3, nameVi: 'Tay nhuốm máu', d: 'Lấy mạng ba người để đoạt của.', title: 'Kẻ Đoạt Bảo', ok: S => fl(S, 'killer') >= 3 },
    { id: 'infamous', cat: 'dark', rank: 3, nameVi: 'Khét tiếng', d: 'Lừng danh cả nước mà thanh danh dưới −40.', ok: S => S.fame >= 50 && (S.rep || 0) <= -40 },
    // Danh vọng
    { id: 'known', cat: 'fame', rank: 1, nameVi: 'Có tiếng trong làng', d: 'Danh vọng đạt 10.', ok: S => FS(S).peak >= 10 },
    { id: "known2", cat: "fame", rank: 1, nameVi: 'Nổi tiếng cả tỉnh', d: 'Danh vọng đạt 25.', ok: S => FS(S).peak >= 25 },
    { id: "known3", cat: "fame", rank: 2, nameVi: 'Lừng danh cả nước', d: 'Danh vọng đạt 50.', ok: S => FS(S).peak >= 50 },
    { id: "known4", cat: "fame", rank: 3, nameVi: 'Vang danh đại lục', d: 'Danh vọng đạt 70.', title: 'Danh Chấn Varen', ok: S => FS(S).peak >= 70 },
    { id: 'good_name', cat: 'fame', rank: 3, nameVi: 'Tiếng thơm', d: 'Thanh danh đạt 60.', title: 'Người Hiền', ok: S => (S.rep || 0) >= 60 },
    // Bộ Xương
    { id: "bone", cat: "bone", rank: 1, nameVi: 'Trỗi dậy', d: 'Đứng dậy từ mộ thành Bộ Xương.', ok: S => !!S.undead },
    { id: "bone_mem", cat: "bone", rank: 1, nameVi: 'Nhớ lại mình là ai', d: 'Bộ Xương nhớ ra tên kiếp trước hay tìm thấy mộ mình.', ok: S => !!S.undead && !!(S.tree && (S.tree.sk_memory || S.tree.sk_grave)) },
    { id: "bone_acolyte", cat: "bone", rank: 1, nameVi: 'Đệ tử dưới mồ', d: 'Bộ Xương nhận một người sống làm đệ tử.', ok: S => !!S.undead && fl(S, 'acolyteTake') >= 1 },
    { id: "bone50", cat: "bone", rank: 2, nameVi: 'Nửa thế kỷ trong xương', d: 'Sống năm mươi năm sau khi trỗi dậy.', ok: (S, X) => !!S.undead && X.years(S) >= 50 }
  ];
  G.ACH_BY = Object.fromEntries(G.ACH.map(a => [a.id, a]));
  const achFame = S => (S.ach || []).reduce((a, x) => a + ((G.ACH_RANK[(G.ACH_BY[x.id] || {}).rank] || {}).fame || 0), 0);
  // Kiểm thành tựu; trả về danh sách mới mở. w: 'dec' (sau quyết định), 'year' (cuối năm), 'death' (lúc chết).
  function achCheck(S, X, w) {
    const L = S.ach || (S.ach = []), have = new Set(L.map(a => a.id)), got = [];
    for (const A of G.ACH) {
      if (have.has(A.id)) continue;
      let ok = false; try { ok = !!A.ok(S, X, w); } catch (e) { ok = false; }
      if (!ok) continue;
      L.push({ id: A.id, y: X.years(S), wy: S.world.year, t: S.age }); got.push(A);
      flush(S, X, 'yr');
      S.fame = Math.min(100, S.fame + G.ACH_RANK[A.rank].fame); flush(S, X, 'ach');
      const tt = typeof A.title === 'function' ? A.title(S) : A.title;
      if (tt && A.rank >= (FS(S).titleR || 0)) { FS(S).title = tt; FS(S).titleR = A.rank; }
      X._tag = null;
      X.log(`Thành tựu ${G.ACH_RANK[A.rank].nameVi.toLowerCase()}: ${A.nameVi}. ${A.d}${tt ? ` Người ta bắt đầu gọi bạn là "${tt}".` : ''}`, 'ach');
    }
    return got;
  }
  G.achCheck = achCheck;
  G.achList = S => (S.ach || []).map(a => ({ ...a, A: G.ACH_BY[a.id] })).filter(a => a.A);
  G.fameTitle = S => S.flags.epithet || (S.fameS && S.fameS.title) || null;

  // ═════════ Hệ con cuối năm: phai, tầm, thanh danh, đỉnh, thành tựu ═════════
  function scopeLine(S, X, k) {
    const bad = (S.rep || 0) <= -40, homeS = S.home && S.home.settlement != null && G.SET[S.home.settlement];
    const pv = G.provOfS ? G.provOfS(S) : null, prov = pv != null && G.realm.provinces[pv] ? 'tỉnh ' + G.realm.provinces[pv].name : 'cả tỉnh';
    const nat = S.nation != null && G.realm.nations[S.nation] ? G.realm.nations[S.nation].name : 'cả nước';
    const where = ['', homeS ? homeS.name : 'quanh vùng', prov, nat, 'đại lục Varen'][k];
    return bad ? `Tiếng xấu của bạn đã lan khắp ${where}. Người lạ nghe tên là đổi sắc mặt.`
      : [null, `Người ở ${where} bắt đầu biết tên bạn.`, `Tên bạn truyền khắp ${where}.`, `Khắp ${where} đều nghe tên bạn.`, `Tên bạn vang khắp ${where}. Người hát rong ở những xứ bạn chưa từng tới cũng hát về bạn.`][k];
  }
  G.fameYear = function (S, X) {
    const F = FS(S), ypt = X.R(S).ypt;
    flush(S, X, 'yr');
    deeds(S);
    // Phai: phần trên danh vọng bền. Người già, ở ẩn quên nhanh hơn; Bộ Xương ít ai nhắc nên chậm hơn.
    F.base = Math.min(100, achFame(S) + F.peak * G.FAME.baseK);
    if (S.fame > F.base) {
      const r = G.FAME.fade * (X.stage(S) === 'elder' ? G.FAME.fadeOld : 1) * (S.undead ? G.FAME.fadeBone : 1);
      S.fame -= (S.fame - F.base) * (1 - Math.pow(1 - r, ypt));
      flush(S, X, 'fade');
    }
    // Thanh danh: danh phận bóng tối kéo xuống, phai dần về 0, đổi Quan hệ.
    const sd = G.standing ? G.standing(S, X) : { dark: 0 };
    if (sd.dark >= 2) S.rep = Math.min(S.rep || 0, -15 * (sd.dark - 1));
    S.rep = (S.rep || 0) * Math.pow(1 - G.FAME.repFade, ypt);
    if (!S.undead) X.add('so', (S.rep || 0) * G.FAME.repSo);
    // Tầm danh vọng: lên tầm mới (so với tầm cao nhất từng có) thì có dòng nhật ký.
    const k = scopeOf(S.fame);
    if (k > F.scope) { F.scope = k; if (k >= 1) { X._tag = null; X.log(scopeLine(S, X, k), k >= 3 ? 'big' : 'good'); } }
    // Đỉnh của đời, chuỗi danh vọng theo năm (cây cốt truyện, biểu đồ).
    const pk = S.peak || (S.peak = { gold: 0, goldY: 0, q: S.q, lv: 0 });
    if (S.gold > pk.gold) { pk.gold = S.gold; pk.goldY = X.years(S); }
    pk.q = Math.max(pk.q, S.q); pk.lv = Math.max(pk.lv, S.level);
    F.hist.push([X.years(S), Math.round(S.fame), Math.round(S.rep || 0)]);
    achCheck(S, X, 'year');
  };
  G.SYSTEMS.push({ id: 'fame', when: S => !S.dead, run: (S, X) => G.fameYear(S, X) });

  // Hệ con khác: danh vọng đổi trong đó quy cho tên hệ con (tước, chức, học…).
  for (const sys of G.SYSTEMS) {
    if (sys.id === 'fame' || sys._fame) continue; sys._fame = true;
    const run0 = sys.run;
    sys.run = function (S, X) { flush(S, X, 'yr'); const r = run0.call(this, S, X); flush(S, X, 'yr', SYS_VI[sys.id] || null); return r; };
  }

  // ═════════ Bọc trận săn, sự kiện, nhật ký ═════════
  { const log0 = P.log;
    P.log = function (text, kind, fact) { const e = log0.call(this, text, kind, fact); if (this._cap) this._cap.push(e); this._last = e; return e; }; }
  { const f0 = P.fight;
    P.fight = function (enc, adventure) {
      const S = this.S; flush(S, this, 'yr');
      const rec = f0.call(this, enc, adventure);
      if (rec && rec.win) {
        if (rec.gap >= 1) S.flags.upWin = (S.flags.upWin || 0) + 1;
        if (rec.grade === 'alpha') S.flags.alphaWin = (S.flags.alphaWin || 0) + 1;
        if (rec.grade === 'lord') S.flags.lordWin = (S.flags.lordWin || 0) + 1;
      }
      flush(S, this, 'hunt', rec && rec.win && rec.grade !== 'normal' ? `Hạ ${enc.s.nameVi} ${G.B.grades[rec.grade].nameVi.toLowerCase()}` : null);
      return rec;
    }; }
  { const re0 = G.runEvent;
    G.runEvent = function (X, ev) {
      const S = X.S; flush(S, X, 'yr'); X._last = null;
      re0(X, ev);
      flush(S, X, 'ev', X._last ? X._last.text : ev.id);
    }; }

  // ═════════ 3. Lịch sử lựa chọn ═════════
  const NUM = [['hl', 'Sinh lực'], ['h', 'Tâm trạng'], ['so', 'Quan hệ'], ['sm', 'Hiểu biết'], ['fame', 'Danh vọng'], ['rep', 'Thanh danh'], ['devotion', 'Tín tâm'], ['gear', 'Trang bị'], ['level', 'Level']];
  const GOOD_DOWN = new Set();   // chỉ số nào giảm là tốt (chưa có)
  function snap(S, X) {
    return {
      n: Object.fromEntries(NUM.map(([k]) => [k, +(S[k] || 0)])), gold: S.gold, tier: X.ctier(S), job: S.job, work: S.work, q: S.q, loc: S.loc, nation: S.nation, faith: S.faith, aim: S.aim,
      home: S.home && S.home.settlement, mastery: { ...S.mastery }, spouse: S.family.spouse && S.family.spouse.alive ? S.family.spouse.name : null, kids: S.family.kids.length,
      marks: (S.marks || []).map(m => m.id), arcs: (S.arcs || []).map(a => a.k + ':' + a.who), done: (S.arcDone || []).length, conds: S.conds.map(c => c.id),
      roles: S.dead ? [] : G.roleList(S).map(r => r.text), wanted: Object.keys(S.flags.wanted || {}).length, tal: S.tal ? S.tal.list.slice() : [], dead: S.dead, saga: S.saga && S.saga.k,
      elixir: S.elixir || 0, school: S.edu && S.edu.cur ? S.edu.cur.lv : 0, eduLv: S.edu ? S.edu.lv : 0, mentor: S.mentor ? S.mentor.name : null, dis: (S.disciples || []).length,
      retired: !!S.flags.retired, comp: S.flags.companion ? S.flags.companion.name : null, pet: S.flags.pet || null
    };
  }
  function diff(a, b, S, X) {
    const fx = [], add = (t, tone) => fx.push({ t, tone: tone || 'info' });
    for (const [k, nm] of NUM) {
      const d = b.n[k] - a.n[k], v = k === 'level' ? d : Math.round(d);
      if (Math.abs(d) >= .5 && v) add(`${nm} ${sign(v)}`, (v > 0) !== GOOD_DOWN.has(k) ? 'good' : 'bad');
    }
    const g = b.gold - a.gold; if (Math.abs(g) >= .01) add(`Tiền ${g > 0 ? '+' : ''}${G.coin(g)}`, g > 0 ? 'good' : 'bad');
    if (b.tier !== a.tier) add(`Tier ${a.tier} → ${b.tier}`, b.tier > a.tier ? 'good' : 'bad');
    if (b.job !== a.job) add(`Nghề: ${X.jobName(S, a.job)} → ${X.jobName(S, b.job)}`, 'good');
    if (b.work !== a.work) add(b.work ? `Sinh kế: ${G.WORKS[b.work] ? G.WORKS[b.work].nameVi : b.work}` : 'Bỏ sinh kế', 'info');
    if (b.q !== a.q) add(`Tầng lớp: ${G.CLASSES[a.q].nameVi} → ${G.CLASSES[b.q].nameVi}`, b.q > a.q ? 'good' : 'bad');
    if (b.loc !== a.loc) add(`Tới ${G.REGION[b.loc] ? G.REGION[b.loc].nameVi : b.loc}`, 'info');
    else if (b.home !== a.home && b.home != null && G.SET[b.home]) add(`Về ở ${G.SET[b.home].name}`, 'info');
    if (b.nation !== a.nation) add(b.nation != null && G.realm.nations[b.nation] ? `Sang ${G.realm.nations[b.nation].name}` : 'Ra đất vô chủ', 'info');
    if (b.faith !== a.faith) add(b.faith ? `Theo ${J.faiths[b.faith].nameVi}` : 'Bỏ đạo', 'info');
    if (b.aim !== a.aim && G.AIMS && G.AIMS[b.aim]) add(`Chí hướng: ${G.AIMS[b.aim].nameVi}`, 'info');
    if (b.saga !== a.saga && b.saga && G.SAGA && G.SAGA[b.saga]) add(`Đường đời: ${G.SAGA[b.saga].nameVi}`, 'good');
    const ms = Object.keys(b.mastery).map(m => [m, b.mastery[m] - (a.mastery[m] || 0)]).filter(([, d]) => Math.abs(d) >= .5).sort((x, y) => Math.abs(y[1]) - Math.abs(x[1]));
    for (const [m, d] of ms.slice(0, 3)) add(`${G.mv(m)} ${sign(Math.round(d) || (d > 0 ? 1 : -1))}`, d > 0 ? 'good' : 'bad');
    if (b.spouse && b.spouse !== a.spouse) add(`Thành gia với ${first(b.spouse)}`, 'good');
    else if (a.spouse && !b.spouse) add(`Không còn bạn đời ${first(a.spouse)}`, 'bad');
    if (b.kids > a.kids) add(`Thêm ${b.kids - a.kids} con`, 'good');
    for (const id of b.marks) if (!a.marks.includes(id) && G.MARKS[id]) add(`Dấu: ${G.MARKS[id].nameVi}`, G.MARKS[id].tone === 'bad' ? 'bad' : G.MARKS[id].tone === 'good' ? 'good' : 'info');
    for (const id of a.marks) if (!b.marks.includes(id) && G.MARKS[id]) add(`Hết dấu: ${G.MARKS[id].nameVi}`, 'info');
    for (const k of b.arcs) if (!a.arcs.includes(k)) { const [ak, who] = k.split(':'), p = G.castGet(S, who === 'null' ? null : +who); add(`Mở mạch: ${G.ARCS[ak].nameVi}${p ? ' · ' + first(p.name) : ''}`, 'info'); }
    for (const d of (S.arcDone || []).slice(a.done)) { const D = G.ARCS[d.k], s = D && D.sum ? D.sum(d.o, G.castGet(S, d.who) || { name: d.name || '?' }, d) : null; add(`Khép mạch ${D ? D.nameVi : d.k}${s ? ': ' + s : ''}`, D && D.good && D.good.includes(d.o) ? 'good' : 'info'); }
    for (const t of b.roles) if (!a.roles.includes(t)) add(`Nhận: ${t}`, 'good');
    for (const t of a.roles) if (!b.roles.includes(t) && !b.dead) add(`Rời: ${t}`, 'info');
    for (const c of b.conds) if (!a.conds.includes(c) && G.CONDS[c]) add(`Mắc: ${G.CONDS[c].nameVi}`, 'bad');
    for (const c of a.conds) if (!b.conds.includes(c) && G.CONDS[c]) add(`Khỏi: ${G.CONDS[c].nameVi}`, 'good');
    if (b.wanted > a.wanted) add('Bị truy nã', 'bad');
    for (const t of b.tal) if (!a.tal.includes(t) && G.TALENTS[t]) add(`Thiên phú: ${G.TALENTS[t].nameVi}`, 'good');
    if (b.elixir !== a.elixir && G.ELIXIR) add(b.elixir ? `Dược tề: ${G.ELIXIR[b.elixir].nameVi.toLowerCase()} mỗi năm` : "Thôi mua dược tề", "info");
    if (b.school && b.school !== a.school) add(`Vào học ${G.EDU[b.school].nameVi.toLowerCase()}`, "good");
    if (b.eduLv > a.eduLv) add("Học xong một cấp", "good");
    if (b.mentor && b.mentor !== a.mentor) add(`Bái sư: ${first(b.mentor)}`, "good");
    if (b.dis > a.dis) add(`Nhận ${b.dis - a.dis} đệ tử`, "good");
    if (b.retired && !a.retired) add("Về hưu", "info");
    if (b.comp && b.comp !== a.comp) add(`Đồng đội: ${first(b.comp)}`, "good"); else if (a.comp && !b.comp) add(`Chia tay ${first(a.comp)}`, "info");
    if (b.pet && b.pet !== a.pet) add(`Nuôi ${b.pet}`, "good");
    if (b.dead && !a.dead) add('Chết', 'bad');
    return fx;
  }
  const KEEP = new Set(["no", "stay", "keep", "skip", "silent", "free", "0", "refuse", "pass", "wait", "ignore", "leave_it"]);
  G.fxText = (fx, k) => (fx.length ? "→ Tác động: " + fx.map(f => f.t).join(" · ") + "." : KEEP.has(String(k)) ? "→ Giữ nguyên như cũ." : "→ Chưa thấy đổi gì ngay; hệ quả, nếu có, đến sau.");
  { const ch0 = P.choose;
    P.choose = function (k) {
      const S = this.S, P0 = S && S.pending; if (!P0) return ch0.call(this, k);
      const choice = P0.choices.find(c => c.k === k) || P0.choices[0];
      flush(S, this, "yr"); achCheck(S, this, "pre");   // thành tựu đã đủ điều kiện từ trước: mở trước, không tính cho lựa chọn này
      const a = snap(S, this), cap = this._cap = [];
      let out; try { out = ch0.call(this, k); } finally { this._cap = null; }
      flush(S, this, 'dec', `${P0.title}: ${choice.label}`);
      if (!S.dead) deeds(S);
      const got = S.dead ? [] : achCheck(S, this, 'dec');
      const fx = diff(a, snap(S, this), S, this);
      for (const A of got) fx.push({ t: `Thành tựu: ${A.nameVi}`, tone: 'good' });
      const main = cap.find(e => e.kind === 'choice'), arc = (cap.find(e => e.arc) || {}).arc || null;
      const rec = { id: P0.id, title: P0.title, k: choice.k, label: choice.label, sub: choice.sub || '', alts: P0.choices.filter(c => c !== choice).map(c => c.label),
        body: P0.body || '', y: this.years(S), t: S.age, wy: S.world.year, ph: G.phaseOf ? G.phaseOf(S, this) : null, arc, out: main ? main.text : '', fx, dead: S.dead };
      const L = S.choices || (S.choices = []); L.push(rec); if (L.length > 400) L.splice(0, L.length - 400);
      const Z = G.FAME.stats && G.FAME_STATS; if (Z) { Z.choices++; if (!fx.length) Z.fxNone++; }
      this._tag = null;
      this.log(G.fxText(fx, choice.k), "fx", rec.alts.length ? 'Không chọn: ' + rec.alts.join(' · ') : null);
      return out;
    }; }

  // ═════════ Lúc chết: thành tựu cuối đời, chốt nguồn ═════════
  { const d0 = P.die;
    P.die = function (cause) {
      const S = this.S, was = S && S.dead;
      if (S && !was) flush(S, this, 'yr');
      d0.call(this, cause);
      if (!S || was || !S.dead) return;
      const F = FS(S); F.end = r1(S.fame);
      achCheck(S, this, 'death');
      const Z = G.FAME.stats && G.FAME_STATS;
      if (Z) {
        Z.lives++; for (const a of S.ach || []) Z.ach[a.id] = (Z.ach[a.id] || 0) + 1;
        const sc = scopeOf(F.peak); Z.scope[sc] = (Z.scope[sc] || 0) + 1;
        const rv = G.repText(S); Z.rep[rv] = (Z.rep[rv] || 0) + 1;
        Z.peak.push(F.peak); Z.end.push(S.fame);
        for (const [k, v] of Object.entries(F.src)) Z.src[k] = (Z.src[k] || 0) + v;
      }
    }; }
  // Bộ Xương: kiếp mới, sổ mới; nhớ tầng lớp lúc sinh cho "Đổi đời".
  { const n0 = P.newLife; P.newLife = function (opt) { const S = n0.call(this, opt); S.flags.q0 = S.q; FS(S); return S; }; }
  { const r0 = P.rise; P.rise = function () { const S = r0.call(this); if (S) { FS(S); achCheck(S, this, 'year'); } return S; }; }

  // ═════════ 4. Biên bản cuộc đời (bảng chết, sim), thẻ nhân vật ═════════
  const yu = S => (S.undead ? 'năm sau khi trỗi dậy' : 'tuổi');
  G.fameLine = S => { const t = G.fameTitle(S); return `${Math.round(S.fame || 0)} · ${G.FAME_SCOPE[scopeOf(S.fame || 0)].nameVi.toLowerCase()} · ${G.repText(S)}${t ? ` · "${t}"` : ''}`; };
  G.fameTip = (S, X) => {
    const F = FS(S), src = Object.entries(F.src).filter(([, v]) => Math.abs(v) >= .5).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${G.SRC_VI[k]} ${v > 0 ? '+' : '−'}${Math.abs(Math.round(v))}`);
    return [`Danh vọng ${Math.round(S.fame)}, cao nhất ${Math.round(F.peak)}. Phần trên ${Math.round(F.base)} (danh vọng bền: thành tựu và 30% mức cao nhất) phai dần mỗi năm; càng nổi tiếng càng khó nổi thêm.`,
      `Thanh danh ${Math.round(S.rep || 0)} (${G.repText(S)}): việc tốt, việc xấu, dấu hệ quả; đổi Quan hệ mỗi năm và việc người ta tìm tới bạn.`,
      src.length ? 'Nguồn: ' + src.join(' · ') : '', F.top.length ? 'Làm nên tên tuổi: ' + F.top.filter(t => t.d > 0).slice(0, 3).map(t => t.what).join('; ') : ''].filter(Boolean).join('\n');
  };
  // Dòng kiếp trước (thẻ Các kiếp trước): thêm danh vọng cao nhất, số thành tựu, danh hiệu.
  { const s0 = G.summary; G.summary = function (S, X) { const r = s0(S, X); const F = FS(S); return Object.assign(r, { fame: Math.round(F.peak), ach: (S.ach || []).length, title: G.fameTitle(S) }); }; }
  G.lifeStats = function (S, X) {
    const F = FS(S), out = [], sec = (id, title, rows, list) => out.push({ id, title, rows: rows.filter(r => r && r[1] !== '' && r[1] != null), list: list || null });
    const kn = kills(S), byFam = {};
    for (const [id, n] of Object.entries(S.kills || {})) { const sp = G.B.byId[id]; if (!sp) continue; const f = G.B.families[sp.family]; const k = f ? f.nameVi : '?'; byFam[k] = (byFam[k] || 0) + n; }
    const famTop = Object.entries(byFam).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([k, n]) => `${k} ${n}`).join(', ');
    const tt = G.fameTitle(S);
    // Danh vọng.
    const src = Object.entries(F.src).filter(([, v]) => Math.abs(v) >= .5).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${G.SRC_VI[k]} ${v > 0 ? '+' : '−'}${Math.abs(Math.round(v))}`).join(' · ');
    sec('fame', 'Danh vọng', [
      ['Lúc chết', `${Math.round(S.fame)} · ${G.FAME_SCOPE[scopeOf(S.fame)].nameVi}`], ['Cao nhất', `${Math.round(F.peak)} (năm ${F.peakY} ${yu(S)}) · ${G.FAME_SCOPE[scopeOf(F.peak)].nameVi}`],
      ['Thanh danh', `${Math.round(S.rep || 0)} · ${G.repText(S)}`], ['Danh hiệu', tt ? `"${tt}"` : '—'], ['Nguồn', src || '—']
    ], F.top.filter(t => t.d > 0).slice(0, 6).map(t => `${t.y} ${yu(S)}: ${t.what} (+${t.d})`));
    // Thành tựu.
    const AL = G.achList(S).sort((a, b) => b.A.rank - a.A.rank || a.y - b.y);
    sec('ach', `Thành tựu (${AL.length})`, [['Theo bậc', [4, 3, 2, 1].map(r => [r, AL.filter(a => a.A.rank === r).length]).filter(([, n]) => n).map(([r, n]) => `${G.ACH_RANK[r].nameVi} ${n}`).join(' · ') || '—']],
      AL.map(a => `${G.ACH_RANK[a.A.rank].nameVi} · ${a.A.nameVi} (${a.y} ${yu(S)}): ${a.A.d}`));
    // Lựa chọn.
    const CH = S.choices || [];
    sec('choices', `Lựa chọn (${CH.length})`, [['Đã quyết', CH.length ? `${CH.length} lần · ${CH.filter(c => c.arc).length} lần thuộc mạch truyện` : 'chưa lần nào']],
      CH.map(c => `${c.y} ${yu(S)} · ${c.title}: ${c.label}. ${G.fxText(c.fx, c.k).replace('→ ', '')}`));
    // Đường đời, mạch truyện.
    const D = (S.arcDone || []).filter(d => d.o !== 'faded'), main = D.find(d => G.SAGA && G.SAGA[d.k]);
    const sumOf = d => { const A = G.ARCS[d.k]; return A && A.sum ? A.sum(d.o, G.castGet(S, d.who) || { name: d.name || '?' }, d) : null; };
    const ch = S.chapDone || [];
    sec('saga', 'Đường đời, mạch truyện', [
      ['Đường đời', G.sagaText ? G.sagaText(S) : '—'], ['Kết mạch chính', main ? (sumOf(main) || main.o) : '—'],
      ['Mạch đã khép', `${D.filter(d => d.o !== 'gone').length}` + ((S.arcs || []).length ? ` · còn dở ${(S.arcs || []).length}` : '')],
      ['Chương đời', ch.length ? `${ch.filter(c => c.ok).length}/${ch.length} làm được` : '—'],
      ['Dấu còn mang', (S.marks || []).map(m => G.MARKS[m.id] ? G.MARKS[m.id].nameVi : m.id).join(', ') || '—']
    ], [...ch.map(c => `Chương ${G.PHASE_VI[c.ph].toLowerCase()} (${c.y0}–${c.y1}): ${c.q}: ${c.ok ? 'làm được' : 'chưa'}`),
      ...D.filter(d => d.o !== 'gone').map(d => `${G.ARCS[d.k] ? G.ARCS[d.k].nameVi : d.k}${d.name ? ' · ' + first(d.name) : ''}: ${sumOf(d) || d.o}`)]);
    // Chiến đấu.
    sec('war', 'Chiến đấu', [
      ['Trận săn', `${S.hunts.n} · thắng ${S.hunts.won} · thua ${S.hunts.lost} · chạy ${S.hunts.fled}`], ['Quái đã hạ', kn ? `${kn}${famTop ? ' · ' + famTop : ''}` : '0'],
      ['Thắng vượt cấp', fl(S, 'upWin') || '—'], ['Đầu đàn, chúa vùng', `${fl(S, 'alphaWin')} · ${fl(S, 'lordWin')}${S.flags.lordSlayer ? ' (' + S.flags.lordSlayer + ')' : ''}`],
      ['Hang ổ, tầng di tích', `${fl(S, 'lairs')} · ${fl(S, 'dgFloors')}`], ['Tỉ thí', fl(S, 'tourney') ? `${fl(S, 'tourney')} lần · vô địch ${fl(S, 'tourneyWin')}` : '—']
    ]);
    // Tu luyện.
    const jobs = [...(S.jobHist || []), S.job].map(id => X.jobName(S, id));
    const ms = Object.entries(S.mastery).filter(([, v]) => v >= 1).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([m, v]) => `${G.mv(m)} ${Math.round(v)}`).join(', ');
    sec('cult', 'Tu luyện', [
      ['Level, Tier', `${S.level} / ${G.maxLvOf(S)} · ${G.tierName(X.ctier(S))}`], ['Các nghề đã qua', jobs.join(' → ')], ['Kỹ năng cao nhất', ms || '—'],
      ['Căn cốt', G.rootText ? G.rootText(S) : '—'], ['Thiên phú', S.tal && S.tal.list.length ? S.tal.list.map(id => G.TALENTS[id].nameVi).join(', ') : '—']
    ]);
    // Của cải, địa vị.
    const pk = S.peak || { gold: S.gold, goldY: X.years(S), q: S.q };
    const RA = S.rolesAtDeath ? G.roleList(Object.assign({}, S, { roles: S.rolesAtDeath, dead: false })).map(r => r.text) : [];
    const was = [fl(S, 'headElect') && 'được bầu làm trưởng', fl(S, 'office') && 'làm quan', fl(S, 'office2') && 'Đại thần', fl(S, 'nobleMax') && 'có tước', (fl(S, 'orgLead') || fl(S, 'orgFound')) && 'đứng đầu hội', (fl(S, 'foundVillage') || fl(S, 'foundTown')) && 'lập làng'].filter(Boolean);
    sec('rank', 'Của cải, địa vị', [
      ['Tiền lúc chết', G.coin(S.gold)], ['Giàu nhất', `${G.coin(pk.gold)} (${pk.goldY} ${yu(S)})`],
      ['Tầng lớp', S.undead ? 'ngoài vòng xã hội' : `${G.CLASSES[S.flags.q0 || S.q].nameVi} lúc sinh → ${G.CLASSES[S.q].nameVi} lúc chết`],
      ['Vai trò lúc chết', RA.join(', ') || '—'], ['Từng', was.join(', ') || '—']
    ]);
    // Gia đình, người quen.
    const Fm = S.family, cast = (S.cast || []).filter(p => p.role !== 'phoi');
    const close = cast.slice().sort((a, b) => b.bond - a.bond)[0], foe = cast.slice().sort((a, b) => a.bond - b.bond)[0];
    sec('kin', 'Gia đình, người quen', [
      ['Bạn đời', Fm.spouse ? `${Fm.spouse.name}${Fm.spouse.alive ? '' : ' (mất trước)'}` : '—'], ['Con', Fm.kids.length ? `${Fm.kids.length} (${Fm.kids.filter(k => k.alive).length} còn sống)` : '—'],
      ['Người quen', cast.length ? `${cast.length} người` : '—'], ['Thân nhất', close && close.bond > 0 ? `${close.name} (${Math.round(close.bond)})` : '—'], ['Ghét nhất', foe && foe.bond < 0 ? `${foe.name} (${Math.round(foe.bond)})` : '—']
    ]);
    // Hành trình.
    const seen = []; for (const y of S.years || []) if (!seen.includes(y.loc)) seen.push(y.loc);
    sec('road', 'Hành trình', [
      ['Vùng đã sống', seen.map(id => G.REGION[id] ? G.REGION[id].nameVi : id).join(' → ') || '—'], ['Chuyến đi, chuyến tàu', `${fl(S, 'trips')} · ${fl(S, 'voyages')}`],
      ['Nơi mất', G.REGION[S.loc] ? G.REGION[S.loc].nameVi : '—']
    ]);
    return out;
  };

  // ═════════ 5. Cây cốt truyện một đời (trang duyệt, docs/17 mục 5) ═════════
  // Gom nhật ký theo nhãn mạch (e.arc), quyết định, chương đời, kết mạch, thành tựu, danh vọng theo năm. Cần nhật ký đầy đủ (không headless).
  G.storyTree = function (S, X) {
    const ypt = X.R(S).ypt, yr = t => Math.round(t * ypt), F = FS(S);
    const arcs = [...(S.arcDone || []).map(d => ({ ...d, done: true })), ...(S.arcs || []).map(a => ({ k: a.k, who: a.who, name: (G.castGet(S, a.who) || {}).name || null, o: null, t0: a.t0, t: S.age, d: a.d, at: a.at, done: false }))];
    const sumOf = d => { const A = G.ARCS[d.k]; return d.o && A && A.sum ? A.sum(d.o, G.castGet(S, d.who) || { name: d.name || '?' }, d) : null; };
    const p = G.castGet ? (who => G.castGet(S, who)) : (() => null);
    return {
      name: S.name, race: J.races[S.race].nameVi, sex: S.sex, kiep: S.kiep, years: X.years(S), unit: yu(S), cause: S.cause, born: S.birthYear, died: S.world.year,
      title: G.fameTitle(S), fame: { end: Math.round(S.fame), peak: Math.round(F.peak), rep: Math.round(S.rep || 0), repVi: G.repText(S), scope: G.FAME_SCOPE[scopeOf(F.peak)].nameVi, hist: F.hist, src: F.src, top: F.top },
      saga: S.saga ? { k: S.saga.k || null, nameVi: S.saga.k && G.SAGA[S.saga.k] ? G.SAGA[S.saga.k].nameVi : null, text: G.sagaText ? G.sagaText(S) : '' } : null,
      chapters: (S.chapDone || []).map(c => ({ ph: c.ph, phVi: G.PHASE_VI[c.ph], q: c.q, ok: c.ok, y0: c.y0, y1: c.y1 })),
      arcs: arcs.map(d => { const A = G.ARCS[d.k] || {}, q = p(d.who), mk = A.marks && d.o ? A.marks[d.o] : null;
        return { k: d.k, nameVi: A.nameVi || d.k, tier: A.tier || 'side', who: d.name || (q ? q.name : null), role: q ? (G.ROLE_VI[q.role] || q.role) : null, o: d.o, good: !!(A.good && A.good.includes(d.o)),
          sum: sumOf(d), y0: yr(d.t0), y1: yr(d.t), done: d.done, at: d.at || null, mark: mk && G.MARKS[mk] ? G.MARKS[mk].nameVi : null, tag: (A.nameVi || d.k) + (d.name ? ' · ' + first(d.name) : d.d && d.d.kin ? ' · ' + d.d.kin : '') }; }),
      log: (S.log || []).filter(e => e.kiep === S.kiep && e.kind !== 'fx').map(e => ({ y: e.yrs, wy: e.wy, k: e.kind, arc: e.arc || null, ev: e.ev || null, t: e.text })),
      choices: (S.choices || []).map(c => ({ y: c.y, id: c.id, title: c.title, label: c.label, sub: c.sub, alts: c.alts, arc: c.arc, out: c.out, fx: c.fx, ph: c.ph, n: c.n })),   // n: số mốc lựa chọn do trang Cây Cốt Truyện gắn (trùng sinh)
      ach: G.achList(S).map(a => ({ id: a.id, y: a.y, nameVi: a.A.nameVi, rank: a.A.rank, rankVi: G.ACH_RANK[a.A.rank].nameVi, cat: G.ACH_CAT[a.A.cat], d: a.A.d })),
      marks: (S.marks || []).map(m => ({ id: m.id, nameVi: G.MARKS[m.id] ? G.MARKS[m.id].nameVi : m.id, tone: G.MARKS[m.id] ? G.MARKS[m.id].tone : 'info', y: yr(m.t), src: m.src })),
      stats: G.lifeStats(S, X)
    };
  };
})(window.LifeSim);
