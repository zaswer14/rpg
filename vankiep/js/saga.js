/* Vạn Kiếp — ĐƯỜNG ĐỜI: MẠCH CHÍNH, MẠCH NGẮN, DẤU HỆ QUẢ (docs/16; người dùng yêu cầu 17/10/2026).
 * Người dùng: sự kiện chỉ đổi chỉ số, lựa chọn chưa dẫn tới đâu; muốn mỗi sự kiện đổi mạch truyện của nhân vật hoặc đi theo mạch
 * đang chạy; có mạch chính, mạch phụ, mạch ngắn; mạch nào nhân vật đi qua cũng để lại ảnh hưởng. Người dùng chốt: ~80% sự kiện
 * thuộc mạch; mạch chính tự nổi lên rồi chốt bằng một quyết định; làm theo đợt (đây là đợt 1).
 * Nạp sau culture.js, dùng G.storyApi của story.js (node / dnode / patch / patchDec / wrapStory). Bốn lớp:
 *   1. Một khuôn full() cho mọi mạch (docs/16 mục 10): 5 hồi, kết theo cả đường đi, lối đứng ngoài = mạch chạy nền ("phụ" là vai trò).
 *      13 mạch chính của file này (G.SAGA, tier main, cùng lúc một); mạch người quen, mạch đời thường ở js/arcs.js (dùng G.sagaApi).
 *   2. Gieo mạch (S.saga.seed): sự kiện thơ ấu, thiếu thời, quyết định (chí hướng, bái sư, bầu trưởng làng…) cộng điểm cho mạch chính
 *      hợp với nó (bảng G.SAGA_SEED). Cuối thiếu thời quyết định sg_road chọn một trong ba mạch điểm cao nhất (hoặc chưa định).
 *   3. Đi theo mạch: sau khi chọn, sự kiện hợp mạch (bảng gieo, chủ đề, hướng quỹ đạo) được kéo trọng số, góp tiến độ a.d.prog
 *      (tiến độ đổi xác suất thành bại ở các hồi sau), có câu nối với mạch; sự kiện lặp không thuộc mạch nào bị hạ trọng số (loneK).
 *   4. Dấu hệ quả (S.marks, G.MARKS): kết của mọi mạch (G.ARCS[k].marks) và một số lựa chọn để lại dấu: đổi trọng số sự kiện về sau
 *      (kèm câu nhắc lại chuyện cũ), tác dụng theo năm, hiện trên thẻ nhân vật. Sự kiện xảy ra vì một dấu tính là thuộc mạch.
 *   5. Đổi đường đời (người dùng yêu cầu 17/10/2026): sau khi chọn, sự kiện vẫn gieo cho các mạch khác; chuyện lớn kéo sang mạch khác
 *      thì mở quyết định Ngã rẽ (sg_turn: đi tiếp hay rẽ, mạch cũ khép với kết 'turned'); mạch chính đã khép mà còn trẻ thì hỏi Đường đời
 *      mới; kết của mạch này gieo cho mạch sau (CHAIN). Một đời có thể đi qua nhiều mạch chính nối nhau (S.saga.past).
 * Trạng thái: S.saga { seed, why, k, asked, t, past, turn, turns, base, last }, S.marks [{ id, t, src }]; a.d.prog, path, ok, end của mạch chính.
 */
window.LifeSim = window.LifeSim || {};
(function (G) {
  const J = window.JobLibrary, DEC = G.DECISIONS, API = G.storyApi;
  const { node, dnode, patch, patchDec, keep } = API;
  const cnt = (S, k, v = 1) => { S.flags[k] = (S.flags[k] || 0) + v; };
  const med = (S, X) => G.median(X.reg(S));
  const first = n => String(n).split(' ')[0];
  const AD = ['adult', 'elder'], TA = ['teen', 'adult'], TAE = ['teen', 'adult', 'elder'];
  const living = S => !S.undead;
  const phase = (S, X) => G.phaseOf(S, X);
  const late = (S, X) => ['adult2', 'elder'].includes(phase(S, X));
  const odds = (S, X, base) => G.clamp(base + (X.power(S) - 1.2) * .1, .08, .92);

  G.SAGA_CFG = { loneK: .45, daysK: .7, followK: .6, progK: .05, stats: false };
  G.SAGA_STATS = null;
  G.sagaStatsReset = () => { G.SAGA_STATS = { pick: {}, free: 0, asked: 0, mark: {}, follow: 0, seedEv: 0, markEv: 0, turn: {} }; return G.SAGA_STATS; };
  const st = (k, id, n = 1) => { const Z = G.SAGA_CFG.stats && G.SAGA_STATS; if (!Z) return; if (id == null) Z[k] += n; else Z[k][id] = (Z[k][id] || 0) + n; };

  const NEW = [], NEWD = [];
  const sNode = e => { e.tree = Object.assign({ body: 'living' }, e.tree || {}); node(e); NEW.push(e); };
  const sDec = (id, D) => { D.tree = Object.assign({ body: 'living' }, D.tree || {}); dnode(id, D); NEWD.push(id); };

  // ═════════ 1. Dấu hệ quả ═════════
  // w: hệ số trọng số theo id sự kiện (hoặc '#chủ đề'); echo: câu nhắc chuyện cũ nối vào sự kiện đó; yr: tác dụng mỗi năm;
  // on: tác dụng lúc nhận dấu; fade: số lượt dấu còn (null = cả đời); tone: good / bad / info.
  G.MARKS = {
    duoc_tin:     { nameVi: 'Được tin cậy', tone: 'good', fade: 20, d: 'Người ta biết bạn làm ăn đàng hoàng.', w: { ad_bounty_post: 1.4, cm_help: 1.6, cm_visit: 1.3 },
      echo: { ad_bounty_post: 'Người treo bảng gọi đích danh bạn, bảo nghe nói bạn làm ăn đàng hoàng. Việc này họ không giao cho người lạ.', cm_help: 'Không cần ai đi gọi, người ta tự tới. Năm ấy bạn đã không bỏ ai, giờ họ cũng không bỏ bạn.' }, yr: (S, X) => X.add('so', .5) },
    giu_loi:      { nameVi: 'Người giữ lời', tone: 'good', fade: null, d: 'Bạn từng giữ một lời hứa khó giữ.', w: { cm_help: 1.3, ad_suitor: 1.2 }, yr: (S, X) => X.add('so', .3) },
    tieng_xau:    { nameVi: 'Tiếng xấu', tone: 'bad', fade: 15, d: 'Chuyện cũ của bạn đi trước bạn một bước.', w: { ad_suitor: .6, cm_glare: 1.6, cm_help: .6 },
      echo: { ad_suitor: 'Bên ấy đã nghe chuyện cũ của bạn. Mối này đi chậm hơn mọi khi, bà mối nói năng cũng dè dặt hẳn.', cm_glare: 'Ai cũng nhớ chuyện năm ấy, chỉ là không ai nói ra.' }, yr: (S, X) => X.add('so', -.5) },
    ke_thu:       { nameVi: 'Có kẻ thù ngoài kia', tone: 'bad', fade: 20, d: 'Có người vẫn chờ dịp trả lại bạn.', w: { ad_bandits: 1.5, cm_glare: 1.8 },
      echo: { ad_bandits: 'Trong toán cướp có một gương mặt bạn nhận ra: người của kẻ thù cũ. Hắn cũng nhận ra bạn, và nhếch mép cười.' } },
    tay_mau:      { nameVi: 'Tay dính máu', tone: 'bad', fade: 30, d: 'Bạn từng lấy mạng người, hay thứ gì đó đáng được tha.', w: { tn_brawl: 1.3, ad_bandits: 1.2 },
      echo: { tn_brawl: 'Người ta lùi lại khi thấy ánh mắt bạn. Có người kéo tay bạn mình đi, thì thầm gì đó.' }, yr: (S, X) => X.add('h', -.3) },
    no_on:        { nameVi: 'Mang ơn', tone: 'info', fade: 20, d: 'Bạn còn nợ một người một món ơn.', w: { cm_visit: 1.5, cm_help: 1.3 } },
    no_mau:       { nameVi: 'Nợ máu đồng đội', tone: 'bad', fade: 15, d: 'Một người đã đỡ đòn thay bạn.', w: { ad_old_friend: 1.3 },
      echo: { ad_old_friend: 'Bạn rót thêm một chén, đặt ở chỗ trống bên cạnh, cho người đồng đội đã đỡ đòn thay mình năm ấy.' }, yr: (S, X) => X.add('h', -.5) },
    ban_cua_thu:  { nameVi: 'Bạn của loài thú', tone: 'good', fade: null, d: 'Bạn từng nuôi một con thú lẽ ra phải giết.', w: { ch_pup: 2, tn_first_hunt: .6 },
      echo: { ch_pup: 'Con vật không hề sợ bạn. Nó tự tìm tới, như đã quen bạn từ kiếp nào.' }, yr: (S, X) => X.add('h', .2) },
    cua_phi_nghia: { nameVi: 'Của phi nghĩa', tone: 'bad', fade: 15, d: 'Có một khoản tiền bạn không muốn ai hỏi tới.', w: { cm_glare: 1.3, ad_tax: 1.3 },
      echo: { ad_tax: 'Người thu thuế lật sổ của bạn lâu hơn mọi nhà, ngón tay dừng lại ở mấy dòng. Bạn đứng chờ, mồ hôi rịn sau gáy.' },
      yr: (S, X) => { if (S.gold > 0 && X.chance(.04)) { const g = Math.round(S.gold * .15); X.money(-g); X.log(`Một khoản phi nghĩa năm nào bị người ta lần ra, tới tận cửa đòi lại. Bạn trả mà không cãi được câu nào: mất ${G.coin(g)}.`, 'bad'); } } },
    nguoi_lap_lang: { nameVi: 'Người lập làng', tone: 'good', fade: null, d: 'Có một ngôi làng mang dấu tay bạn.', yr: (S, X) => X.add('so', .5) },
    que_moi:      { nameVi: 'Đã quen đất mới', tone: 'good', fade: 10, d: 'Đất mới đã thành quê.', w: { ad_restless: .6 }, echo: { ad_restless: 'Nhưng nơi này đã thành quê. Bạn nhìn con đường thêm một lúc, rồi quay vào nhà.' } },
    nguoi_la:     { nameVi: 'Người mới tới', tone: 'bad', fade: 4, d: 'Ở đây chưa ai biết bạn là ai.', w: { cm_visit: .6 }, yr: (S, X) => X.add('so', -.5) },
    da_bao_thu:   { nameVi: 'Đã trả nợ máu', tone: 'good', fade: null, d: 'Món nợ máu năm xưa đã trả.', yr: (S, X) => X.add('h', .3) },
    buong_bo:     { nameVi: 'Đã buông', tone: 'good', fade: 20, d: 'Bạn đã đặt xuống một chuyện từng đè nặng.', yr: (S, X) => X.add('h', .4) },
    thu_chua_tra: { nameVi: 'Mối thù chưa trả', tone: 'bad', fade: null, d: 'Món nợ máu vẫn còn đó.', w: { ch_raid: 1.2, ad_tide: 1.3 },
      echo: { ch_raid: 'Lại là bầy quái ấy, bạn nhận ra ngay từ tiếng kêu đầu tiên. Tay bạn siết lấy cán vũ khí, tới sáng vẫn chưa chịu buông.', ad_tide: 'Bạn đứng đầu hàng, như đã chờ đúng ngày này từ lâu. Tay bạn không run.' }, yr: (S, X) => X.add('h', -.4) },
    cao_thu:      { nameVi: 'Cao thủ có tiếng', tone: 'good', fade: null, d: 'Tên bạn được nhắc ở các bãi tập.', w: { ad_tourney: 2, ad_bounty_post: 1.5 },
      echo: { ad_tourney: 'Đám đông nhận ra bạn từ xa, xì xào gọi tên. Trên bảng đấu, tên bạn đứng đầu.', ad_bounty_post: 'Việc khó nhất người ta để dành cho bạn, không ai dám tranh.' } },
    chan_truyen:  { nameVi: 'Chân truyền', tone: 'good', fade: null, d: 'Bạn giữ một sở học được truyền lại trọn vẹn.', on: (S, X) => { const d = X.dominant(S); if (d) X.gain(d.skill, 5); } },
    danh_tho:     { nameVi: 'Thợ có dấu riêng', tone: 'good', fade: null, d: 'Đồ bạn làm được đóng dấu riêng, có người đặt trước.', yr: (S, X) => X.money(Math.round(med(S, X) * .08)) },
    nha_kha:      { nameVi: 'Nhà đã khá', tone: 'good', fade: null, d: 'Nhà bạn đã thoát nghèo.', on: S => { S.q = Math.min(5, S.q + 1); S.pct = Math.min(.95, S.pct + .15); } },
    tay_trang:    { nameVi: 'Trắng tay làm lại', tone: 'bad', fade: 10, d: 'Bạn mất gần hết vốn liếng.', on: S => { S.gold = Math.round(Math.max(0, S.gold) * .3); }, yr: (S, X) => X.add('h', -.3) },
    nguoi_dung_dau: { nameVi: 'Người đứng đầu', tone: 'good', fade: null, d: 'Người ta tìm bạn khi có chuyện chung.', w: { cm_help: 1.3 }, yr: (S, X) => { X.add('so', .5); S.fame = Math.min(100, S.fame + .2); } },
    ke_tiem_quyen: { nameVi: 'Kẻ tiếm quyền', tone: 'bad', fade: null, d: 'Bạn ngồi vào ghế bằng cách người ta không quên.', w: { cm_glare: 1.5 }, yr: (S, X) => X.add('so', -.3) },
    nguoi_moc_dao: { nameVi: 'Người mộ đạo', tone: 'good', fade: null, d: 'Đức tin đã thành chỗ dựa.', yr: S => { if (S.faith) S.devotion = Math.min(100, S.devotion + 2); } },
    bo_dao:       { nameVi: 'Kẻ bỏ đạo', tone: 'bad', fade: 10, d: 'Bạn đã quay lưng với đạo cũ.', yr: (S, X) => X.add('h', -.2) },
    ke_di_xa:     { nameVi: 'Người từng đi xa', tone: 'good', fade: null, d: 'Bạn đã thấy những nơi người làng chỉ nghe kể.', w: { ad_restless: .5, ad_old_friend: 1.3 },
      echo: { ad_old_friend: 'Bạn kể chuyện những vùng đã qua tới khi đèn cạn dầu, bạn cũ nghe mà quên cả rượu.' }, yr: (S, X) => X.add('sm', .3) },
    ten_nha:      { nameVi: 'Tên nhà được nhận', tone: 'good', fade: null, d: 'Họ tộc đã nhận lại bạn.', on: S => { S.fame = Math.min(100, S.fame + 5); }, yr: (S, X) => X.add('so', .3) },
    dong_moi:     { nameVi: 'Người mở dòng mới', tone: 'good', fade: null, d: 'Con cháu bạn sẽ đọc tên bạn đầu tiên.' },
    ban_cu:       { nameVi: 'Có bạn cũ', tone: 'good', fade: 25, d: 'Có người nhớ bạn từ hồi còn trẻ.', w: { cm_visit: 1.4, cm_help: 1.4 } },
    vuot_doi_thu: { nameVi: 'Đã vượt đối thủ', tone: 'good', fade: 15, d: 'Bạn đã hơn được kẻ luôn hơn mình.', yr: (S, X) => X.add('h', .2) },
    cay_dang:     { nameVi: 'Nỗi cay đắng', tone: 'bad', fade: 10, d: 'Một lần thua còn nhức.', yr: (S, X) => X.add('h', -.3) },
    tinh_than:    { nameVi: 'Tình ruột thịt', tone: 'good', fade: 25, d: 'Họ hàng biết có thể tìm tới bạn.', w: { cm_help: 1.3 } },
    nguoi_giu_lang: { nameVi: 'Người giữ làng', tone: 'good', fade: null, d: 'Làng nhớ bạn đã đứng ở cổng.', w: { ch_raid: 1.2 },
      echo: { ch_raid: 'Tiếng mõ vừa nổi, người làng đã chạy về phía bạn, trước cả khi chạy về nhà mình.' } },
    tinh_mot_doi: { nameVi: 'Một mối tình trọn', tone: 'good', fade: null, d: 'Có một người ở bên bạn tới cuối.', yr: (S, X) => X.add('h', 1) },
    biet_bi_mat:  { nameVi: 'Người biết bí mật', tone: 'good', fade: null, d: 'Bạn biết một điều cổ xưa mà ít ai biết.', w: { ad_map: 1.3 },
      echo: { ad_map: 'Ký tự trên tấm bản đồ này bạn đọc được. Bạn đọc thầm, và tim đập nhanh hơn.' } },
    da_chuoc:     { nameVi: 'Đã chuộc lỗi', tone: 'good', fade: null, d: 'Món nợ cũ với đời bạn đã trả bằng việc làm.', yr: (S, X) => X.add('h', .5) },
    ba_chu:       { nameVi: 'Kẻ đứng trên đầu người', tone: 'bad', fade: null, d: 'Người ta sợ bạn hơn là nể.', w: { ad_bandits: .6 },
      echo: { ad_bandits: 'Bọn cướp nhận ra bạn, dạt sang hai bên đường. Tên cầm đầu còn cúi đầu chào.' } },
    cat_dut:      { nameVi: 'Đã cắt đứt', tone: 'bad', fade: 15, d: 'Có một người cùng máu bạn không còn nhìn mặt.', yr: (S, X) => X.add('h', -.2) }
  };
  const markOf = (S, id) => (S.marks || []).find(m => m.id === id);
  G.markHas = (S, id) => !!markOf(S, id);
  G.markAdd = function (S, X, id, src) {
    const M = G.MARKS[id]; if (!M || S.dead) return;
    const L = S.marks || (S.marks = []), old = markOf(S, id);
    if (old) { old.t = S.age; old.src = src || old.src; return; }
    L.push({ id, t: S.age, src: src || null });
    if (M.on) M.on(S, X);
    for (const [k, v] of Object.entries(MARK_SEED[id] || {})) addSeed(S, k, v, M.d);   // dấu mới cũng gieo đường đời (Chuộc lỗi sau tay dính máu…)
    st('mark', id);
  };
  const markW = (S, id, meta) => {
    let m = 1, hit = null;
    for (const mk of S.marks || []) { const M = G.MARKS[mk.id], v = M.w && (M.w[id] ?? (meta && meta.theme ? M.w['#' + meta.theme] : undefined)); if (v) { m *= v; hit = hit || mk; } }
    return { m, hit };
  };
  // Hệ con cuối năm: tác dụng theo năm, dấu phai.
  G.sagaYear = function (S, X) {
    if (!S.marks || !S.marks.length) return;
    S.marks = S.marks.filter(mk => { const M = G.MARKS[mk.id]; if (M.fade != null && S.age - mk.t > M.fade) return false; if (M.yr) M.yr(S, X); return true; });
  };
  G.markChips = S => (S.marks || []).map(mk => { const M = G.MARKS[mk.id]; return { text: M.nameVi, tone: M.tone, title: M.d + (mk.src ? ` (từ: ${mk.src})` : '') + (M.fade != null ? ` Còn chừng ${Math.max(0, M.fade - (S.age - mk.t))} lượt.` : '') }; });

  // Kết của mọi mạch để lại dấu (G.ARCS[k].marks; mạch người quen, mạch đời thường ở js/arcs.js).
  { const e0 = G.arcEnd;
    G.arcEnd = function (S, X, a, o) {
      e0(S, X, a, o);
      const D = G.ARCS[a.k], mk = D && D.marks && D.marks[o];
      if (mk) { const p = G.castGet(S, a.who); G.markAdd(S, X, mk, D.nameVi + (p ? ' · ' + first(p.name) : '')); }
      const C = SAGA[a.k] && CHAIN[a.k] && CHAIN[a.k][o];   // kết mạch chính gieo cho mạch sau
      if (C && !S.dead) { const sm = D.sum ? D.sum(o, null, a) : null; for (const [k, v] of Object.entries(C)) addSeed(S, k, v, `Đường ${D.nameVi} đã khép${sm ? ': ' + sm : ''}.`); }
    }; }

  // ═════════ 2. Mạch chính ═════════
  // Mỗi mạch: 5 hồi (mở → thắt nút [quyết định] → thử thách → cao trào [quyết định, từ trung niên] → kết) và một nhịp lặp (beat)
  // góp tiến độ. Tiến độ (a.d.prog) cộng từ nhịp và từ sự kiện đi theo mạch; cộng vào xác suất thành ở thử thách, cao trào.
  const SAGA = G.SAGA = {};
  const mainA = S => (S.arcs || []).find(a => G.ARCS[a.k].tier === 'main');
  const prog = a => (a && a.d.prog) || 0;
  const pb = (a, k = G.SAGA_CFG.progK) => Math.min(.3, prog(a) * k);
  // Khuôn mạch đầy đủ (docs/16 mục 10, người dùng chốt 17/10/2026): mọi mạch, chính hay không, có đủ 5 hồi và nhiều kết.
  //   Kết theo cả đường đi: def.end(S, X, a, p, o) đổi kết o của cao trào theo lối đã chọn (a.d.path), thử thách (a.d.ok), tiến độ (a.d.prog).
  //   "Phụ" là vai trò, không phải loại mạch: chọn lối 'away' (đứng ngoài) thì mạch chạy nền (a.d.bg = tuổi lúc đứng ngoài): nút thưa
  //   hơn (× BG_K), không có nhịp, cao trào là chuyện của người trong mạch / thế giới (def.climax.bg, không hỏi), kết riêng.
  //   def.acts[hồi] = { st, wait, w, c, when, prio, dead } chỉnh từng hồi; hàm nào cũng nhận thêm p (người trong mạch) sau a.
  const FULL = G.ARC_FULL = {}, BG_K = .5;
  const asR = r => (r == null ? r : typeof r === 'string' ? { t: r } : r);
  function full(k, def) {
    const main = def.tier === 'main', A = def.acts || {}, tree = { body: def.body || 'living' }, ud = def.undead;
    const Ao = A.open || {}, Ak = A.knot || {}, At = A.trial || {}, Ac = A.climax || {}, Aa = A.after || {};
    FULL[k] = def; if (main) SAGA[k] = def;
    const D0 = G.ARCS[k] || {};
    G.ARCS[k] = Object.assign(D0, { nameVi: def.nameVi, tier: main ? 'main' : undefined, full: true, good: def.good, marks: def.marks || {}, passive: !!def.passive,
      quest: def.quest ? (p, a) => def.quest(a, p) : null, gone: def.gone || null, fade: def.fade || null,
      sum: (o, p, rec) => (o === 'turned' ? turnedSum((rec && rec.d) || {}) : def.sum[o] ? def.sum[o]((rec && rec.d) || {}, p) : null),
      endOf: (S, X, a, p) => (def.end ? def.end(S, X, a, p, a.d.end) : a.d.end) });
    const wOf = (o, d) => { const w = o.w ?? d; return (S, X, a, p) => (typeof w === 'function' ? w(S, X, a, p) : w) * (a.d.bg ? BG_K : 1); };
    sNode({ id: k + '_open', st: Ao.st || TAE, undead: ud, tree, story: { arc: k, at: 'open', wait: Ao.wait || [0, 30], to: 'knot' }, w: wOf(Ao, main ? 6 : 4), c: Ao.c,
      run(S, X, a, p) { return Object.assign({ k: main ? 'big' : 'info' }, asR(def.open(S, X, a, p))); } });
    sDec(k + '_knot', { prio: Ak.prio ?? 6, tree, story: { arc: k, at: 'knot', wait: Ak.wait || [2, 40], to: 'trial' },
      when: (S, X, a, p) => (Ak.when ? Ak.when(S, X, a, p) : X.stage(S) !== 'child'),
      build: (S, X, a, p) => ({ title: def.knot.title, body: def.knot.body(S, X, a, p), choices: [...def.knot.choices(S, X, a, p), ...(main ? knotTurn(S, X) : [])] }),
      apply(S, X, ch, c, a, p) {
        if (main && String(ch).startsWith('turn:')) return { t: switchMain(S, X, ch.slice(5)), o: 'turned', to: null };   // bỏ đường này ngay từ lúc chọn lối, rẽ sang mạch khác
        a.d.path = ch; if (ch === 'away') a.d.bg = S.age;
        const t = def.knot.apply(S, X, ch, a, p); if (S.dead) return null; cnt(S, 'sg_' + k + '_' + ch); return { t, o: ch, to: 'trial' }; },
      auto: (S, X, d, a, p) => def.knot.auto(S, X, a, p) });
    sNode({ id: k + '_trial', st: At.st || AD, undead: ud, tree, story: { arc: k, at: 'trial', wait: At.wait || [3, 40], to: 'climax' }, w: wOf(At, main ? 5 : 4), c: At.c,
      run(S, X, a, p) { const ok = X.chance(G.clamp(def.trial.base(S, X, a, p) + pb(a), .1, .92)); a.d.ok = ok;
        return Object.assign({ k: ok ? 'good' : 'bad', o: ok ? 'ok' : 'fail' }, asR(def.trial.run(S, X, a, ok, p))); } });
    sDec(k + '_climax', { prio: Ac.prio ?? 7, tree, story: { arc: k, at: 'climax', wait: Ac.wait || [3, 60], to: 'after' },
      when: (S, X, a, p) => !a.d.bg && (Ac.when ? Ac.when(S, X, a, p) : main ? late(S, X) : X.stage(S) !== 'child'),
      build: (S, X, a, p) => ({ title: def.climax.title, body: def.climax.body(S, X, a, p), choices: def.climax.choices(S, X, a, p) }),
      apply(S, X, ch, c, a, p) { const r = def.climax.apply(S, X, ch, a, p); if (!r || S.dead) return null; a.d.end = r.o; cnt(S, 'sg_' + k + '_' + r.o); return { t: r.t, o: r.o, to: r.to === undefined ? 'after' : r.to }; },
      auto: (S, X, d, a, p) => def.climax.auto(S, X, a, p) });
    // Mạch chạy nền: cao trào xảy ra mà không hỏi (chuyện của người trong mạch, của làng, của thế giới).
    if (def.climax.bg) sNode({ id: k + '_drift', st: Ac.st || AD, undead: ud, tree, story: { arc: k, at: 'climax', wait: Ac.wait || [3, 60], to: 'after' }, w: wOf({}, 4),
      c: (S, X, a) => !!a.d.bg,
      run(S, X, a, p) { const r = def.climax.bg(S, X, a, p); if (!r || S.dead) return r; a.d.end = r.o; return Object.assign({ k: 'info' }, r); } });
    // Kết: mạch chính tới tuổi già, hoặc chừng 12 lượt sau cao trào (đi gần hết đời); mạch khác theo def.acts.after.
    sNode({ id: k + '_after', st: Aa.st || AD, undead: ud, tree, story: { arc: k, at: 'after', wait: Aa.wait || [4, 80], to: 'end', dead: Aa.dead }, w: wOf(Aa, main ? 6 : 4),
      c: Aa.c || (main ? (S, X, a) => X.stage(S) === 'elder' || S.age - a.t >= 12 : null),
      run(S, X, a, p) { const o0 = a.d.end || def.good[0], o = def.end ? def.end(S, X, a, p, o0) : o0; a.d.end = o;
        return Object.assign({ k: def.good.includes(o) ? 'big' : 'info' }, asR(def.after[o](S, X, a, p)), { o, to: 'end' }); } });
    // Nhịp (chỉ khi nhân vật theo mạch): mạch chính trọng số gốc 0,45 (× kéo ≈ 2,7), cách 3 lượt; mạch khác 0,25, cách 4 lượt,
    // khoảng chờ ngắn để mạch kẹt vẫn phai được.
    if (def.beat) {
      const beat = { id: k + '_beat', st: TAE, undead: ud, tree, story: { arc: k, at: ['open', 'knot', 'trial', 'climax'], wait: main ? [1, 99] : [1, 12] }, w: main ? .45 : .25,
        c: (S, X, a) => !a.d.bg,
        run(S, X, a, p) { a.d.prog = prog(a) + 1; const L = (def.beatOf && def.beatOf(a)) || def.beat[a.at] || def.beat.any;   // beatOf: nhịp theo biến thể của mạch (kẻ thù của Món nợ máu)
          const t = X.pick(L).replace('{z}', zoneName(S, X, a)).replace(/{p}/g, p ? first(p.name) : 'người ấy').replace(/{kin}/g, a.d.kin === 'cha' ? 'cha' : a.d.kin || 'người thân');
          return { t: def.fill ? def.fill(S, X, a, t) : t, k: 'info', to: null }; } };
      sNode(beat); beat.gap = main ? 3 : 4;
    }
  }
  const saga = (k, def) => full(k, Object.assign(def, { tier: 'main' }));
  // Mạch chính bỏ dở vì rẽ sang mạch khác (quyết định Ngã rẽ).
  const turnedSum = d => `bỏ dở giữa chừng${d.to && SAGA[d.to] ? ', rẽ sang ' + SAGA[d.to].nameVi : ''}`;
  const zoneName = (S, X, a) => { const z = (a && a.d.zone && G.ZONE[a.d.zone]) ? G.ZONE[a.d.zone].zone : X.reg(S).zones[1] || X.reg(S).zones[0]; return z.nameVi; };
  const spName = a => (a.d.sp && G.B.byId[a.d.sp] ? G.B.byId[a.d.sp].nameVi : 'bầy quái');
  const bestSk = S => { let b = null; for (const [m, v] of Object.entries(S.mastery)) if (!b || v > S.mastery[b]) b = m; return b || 'Body'; };
  const tierUp = (S, X, k) => G.tierName(Math.min(5, X.ctier(S) + k));
  // Câu dẫn của hồi mở đầu mạch chính (chỉ là chữ, không rút ngẫu nhiên): nhắc đường vừa bỏ / vừa khép (S.saga.past) và chuyện đã gieo mạch (a.d.why).
  const lead = (S, a) => {
    const P = (S.saga && S.saga.past) || [], x = P[P.length - 1], w0 = a && a.d.why, w = w0 ? (/[.!?…]$/.test(w0) ? w0 : w0 + '…') : '';
    if (x && SAGA[x.k]) return x.o === 'turned' ? `Đường ${SAGA[x.k].nameVi} đã ở lại phía sau. ${w ? w + ' Chuyện ấy kéo bạn sang một ngả khác. ' : ''}`
      : `Đường ${SAGA[x.k].nameVi} đã đi tới cuối, mà đời thì còn dài. ${w ? w + ' Chuyện ấy cứ nằm trong lòng, không chịu yên. ' : ''}`;
    return w ? `${w} Từ hôm ấy, có một điều cứ lớn dần trong lòng bạn. ` : '';
  };
  const mateOf = (S, a) => { const m = a && a.d.mate != null ? G.castGet(S, a.d.mate) : null; return m && m.alive !== false ? first(m.name) : null; };   // người cùng đi (lối có thêm người quen), còn sống

  // ── Món nợ máu ──
  // Kẻ thù (người dùng ghi chú trên trang Duyệt Mạch Truyện 18/10/2026: thêm kẻ thù cho phong phú, thêm lối đòi nợ, thử thách theo kẻ thù).
  // a.d.foe: beast (bầy quái), bandit (toán cướp), lord (lãnh chúa), warlord (tướng giặc), cult (tà thuật sư), rival (kẻ phản bội); chọn lúc
  // mở mạch theo chuyện đã gieo (G.SAGA_FOE_SRC, foeSetup). a.d.foeN: tên kẻ cầm đầu; a.d.nick: biệt danh toán cướp; a.d.kin: người đã mất.
  // Mỗi loại: mở đầu, thân hồi chọn lối, một lối riêng (alt), thử thách thành / bại (nhiều kịch bản, tự lo tác dụng), cao trào, kết, tóm tắt, nhịp.
  const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
  const kn = a => a.d.kin || 'những người đã mất';
  const fN = a => (a.d.foeN ? first(a.d.foeN) : 'hắn');
  const hireAlt = { k: 'hire', label: 'Bỏ tiền thuê mạo hiểm giả', sub: (S, X) => `Tốn chừng ${G.coin(Math.round(med(S, X) * 1.5))}.`,
    apply: (S, X, a) => { X.money(-Math.round(med(S, X) * 1.5)); a.d.hired = true; return 'Bạn đặt túi tiền lên bàn ở hội mạo hiểm. Gã ngồi sau bàn đếm từng đồng, chậm rãi, rồi gật đầu. Số tiền ấy bạn dành dụm mấy năm. Lúc ra về tay nhẹ hẳn, mà lòng thì không.'; } };
  const AV_FOE = G.AVENGE_FOE = {
    beast: { nameVi: 'Bầy quái', who: a => spName(a), hate: 'bầy quái', band: 'Tụ một toán thợ săn', alt: hireAlt,
      open: (S, X, a) => `Bạn giữ lại một món đồ của ${a.d.kin || 'người làng đã mất'}, đặt ở đầu giường. Sáng nào trước khi ra bãi tập bạn cũng cầm nó lên, nhìn một lúc rồi mới đi. Món đồ không nói gì. Nhưng bạn biết, sớm muộn mình cũng sẽ đi tìm ${spName(a)}.`,
      knot: (S, X, a) => `Ở ${zoneName(S, X, a)}, ${spName(a)} vẫn còn đó, mỗi năm một đông thêm. Một mình bạn chưa đủ sức vào tận tổ. Phải có cách khác, hoặc phải chờ.`,
      ok: [(S, X, a, pc) => `Suốt một mùa bạn lần theo dấu ${spName(a)} qua ${zoneName(S, X, a)}, ăn lương khô, ngủ dưới gốc cây. ${pc} Rồi một chiều, dưới chân một vách đá, gió đưa tới mùi hôi của tổ. Bạn đã tìm ra nó.`,
        (S, X, a, pc) => `Một con ${spName(a)} lạc bầy lảng vảng gần làng. Bạn không giết nó ngay mà bôi tro lên người, bám theo nó ba ngày ba đêm. ${pc} Nó dẫn bạn về đúng chỗ bạn cần: một khe núi đầy xương trắng.`,
        (S, X, a, pc) => `Bạn tìm gặp một bà lão hái thuốc từng sống sót sau một lần chạm mặt ${spName(a)}. Bà vẽ đường cho bạn bằng que củi trên nền bếp, tay run mà nét không sai. ${pc} Bạn đi đúng theo nét vẽ ấy, và thấy cái tổ ở chỗ bà chỉ.`],
      fail: [(S, X, a) => { X.add('hl', -10); X.cond('wound'); return `Bạn lần theo dấu ${spName(a)} tới ${zoneName(S, X, a)} thì trời đổ mưa ba ngày liền, dấu chân trôi sạch. Đêm thứ ba có thứ gì đó lao ra từ bụi rậm. Bạn về làng với một vết cào dài trên lưng. Cái tổ vẫn chưa thấy đâu.`; },
        (S, X, a) => { X.add('hl', -6); X.add('h', -5); return 'Bạn đặt bẫy ở lối mòn, rải mồi suốt nửa tháng. Lũ quái không thèm đi qua. Chúng đi vòng, vào chuồng nhà người khác, cắn chết hai con bò. Sáng ra người làng nhìn bạn, không ai nói gì, mà bạn thấy như bị mắng.'; }],
      cb: (S, X, a) => `Tổ của ${spName(a)} nằm dưới vách đá, cửa tổ hôi mùi xương mục. Từ trong bóng tối vọng ra tiếng con non rúc rích. Bạn nghĩ tới ${kn(a)}, rồi nghĩ tới lũ con non ấy.`,
      ch: { fight: { label: 'Vào tổ, đánh tới cùng' }, burn: { label: 'Đốt tổ từ bên ngoài', sub: 'Chắc ăn hơn; không biết con đầu đàn đã chết chưa.' }, spare: { label: 'Quay về', sub: 'Tha cho lứa con non.' } },
      win: (S, X, a) => `Bạn đi vào bóng tối với ngọn đuốc và vũ khí. Trong đó sâu hơn bạn tưởng, và tối hơn. Lúc trở ra trời đã xế, áo bạn đẫm máu không phải của mình, trên tay là cái nanh của con đầu đàn.${a.d.path === 'band' ? ' Toán thợ săn đứng chờ ở cửa tổ, thấy bạn thì reo lên.' : ''}`,
      lose: () => 'Con đầu đàn to hơn mọi lời kể. Nó hất bạn vào vách đá như hất một bó rơm. Bạn bò ra khỏi tổ, máu chảy theo từng bước, sau lưng vẫn vang tiếng gầm.',
      burn: () => 'Bạn chất củi khô kín cửa tổ rồi châm lửa. Khói đen bốc lên ba ngày, cả vùng ngửi thấy. Bạn ngồi canh tới khi lửa tàn, mà vẫn không chắc con đầu đàn đã chết hay đã trốn qua một lối khác.',
      spare: () => 'Bạn đứng lâu ở cửa tổ, đuốc cháy gần tới tay. Lũ con non rúc vào nhau trong góc, mắt sáng lên trong bóng tối. Chúng chưa giết ai cả. Bạn quay đi, và bước chân về nhẹ hơn bước chân đi.',
      after: { win: (S, X, a) => { const m = mateOf(S, a); return `Bạn đặt cái nanh lên mộ ${kn(a)}, thắp ba nén hương.${m ? ` ${m} đứng sau bạn, cũng thắp một nén.` : ''} Đêm ấy, lần đầu sau bao năm, bạn ngủ một giấc không mộng. Sáng ra bạn cất vũ khí lên gác, lâu lắm mới lấy xuống.`; },
        burn: (S, X, a) => `Người làng thôi nhắc tới ${spName(a)}. Mấy mùa sau cỏ đã mọc lại trên vách đá cháy đen. Bạn không đi ngang chỗ ấy nữa, có việc phải qua thì vòng đường khác, xa hơn nửa buổi.`,
        spare: (S, X, a) => `Mấy năm sau người ta vẫn thấy quái ở ${zoneName(S, X, a)}, nhưng chúng không xuống làng nữa. Có lần đi rừng, bạn gặp một con lớn đứng trên mỏm đá nhìn xuống. Nó nhìn bạn rất lâu rồi bỏ đi. Bạn không hối hận.`,
        fail: (S, X, a) => `Cái tổ vẫn ở đó. Đêm nào trời trở gió, vết thương cũ trên lưng lại nhức, như có người gõ cửa nhắc nợ. Bạn ngồi dậy nhìn món đồ của ${a.d.kin || 'người đã mất'} ở đầu giường, rồi nằm xuống, không ngủ lại được.` },
      sum: { win: d => `trả được món nợ máu cho ${d.kin || 'làng'}`, burn: d => `đốt sạch tổ của bầy quái đã giết ${d.kin || 'người làng'}`, spare: d => `tha cho lứa quái con, buông được mối thù cho ${d.kin || 'làng'}`, fail: d => `không trả được món nợ máu cho ${d.kin || 'làng'}` },
      beat: { open: ['Đêm nào bạn cũng ngồi mài lưỡi vũ khí bên bếp, tiếng đá rít đều đều tới khuya. Người nhà đã quen, không ai hỏi nữa.', 'Thợ săn nào đi ngang làng cũng bị bạn giữ lại hỏi chuyện {z}: lối nào, mùa nào, bầy lớn hay nhỏ. Có người cười, bảo bạn hỏi như đi đòi nợ. Bạn không cười.'],
        knot: ['Bạn tập tới khi tay rớm máu, quấn vải lại rồi tập tiếp. Vết chai cũ chưa lành, vết chai mới đã lên. Ngày giỗ {kin} sắp tới, bạn muốn có thứ gì đó để nói trước mộ.'],
        trial: ['Bạn vẽ bản đồ {z} lên vách nhà bằng than, chỗ nào thấy dấu chân thì chấm một chấm. Vách giờ chi chít chấm đen, dày nhất ở một góc.', 'Bạn nằm phục cả đêm ở bìa {z}, sương ướt đẫm lưng áo. Gần sáng chúng đi qua, gần tới mức nghe được tiếng thở. Bạn nín thở đếm từng con, rồi lặng lẽ về.'],
        climax: ['Bạn biết cái tổ ở đâu rồi. Đêm nào cũng ra đầu làng nhìn trời, chờ một ngày khô ráo, gió thổi ngược về phía núi.'] } },
    bandit: { nameVi: 'Toán cướp', who: a => `toán cướp ${a.d.nick}`, hate: 'bọn cướp', race: ['human', 'human', 'orc', 'beastfolk'], kin: ['chú', 'bác', 'cậu'], alt: hireAlt,
      open: (S, X, a) => `Cái đòn gánh gãy của ${kn(a)} vẫn dựng ở góc nhà. Năm ấy toán cướp ${a.d.nick} chặn đường ngoài đèo, ${kn(a)} không chịu buông gánh hàng, và không về nữa. Người ta bảo tên cầm đầu là ${a.d.foeN}, cái tên ai nhắc tới cũng hạ giọng. Bạn thì nhắc nó mỗi tối, không hạ giọng.`,
      knot: (S, X, a) => `Toán cướp ${a.d.nick} giờ đã có hơn ba chục tay đao, đóng trại đâu đó ở ${zoneName(S, X, a)}. Quan trấn treo thưởng mấy năm mà chưa ai lĩnh được. Một mình bạn tới đó thì chỉ thêm một cái xác bên đường.`,
      ok: [(S, X, a, pc) => `Bạn giả làm phu khuân vác, theo một đoàn buôn qua đèo, cố ý để bị chặn. ${pc} Trong lúc bọn cướp lục hàng, bạn đếm người, nhớ mặt, nhớ cả lối chúng rút về. Đêm ấy bạn vẽ lại tất cả lên một mảnh da, tay không run.`,
        (S, X, a, pc) => `Một tên lâu la bị đuổi khỏi toán, say khướt trong quán rượu dưới chân đèo. Bạn trả tiền rượu cho hắn ba đêm liền. ${pc} Tới đêm thứ ba hắn khóc, kể hết: trại ở đâu, gác mấy người, ${fN(a)} ngủ ở lều nào.`,
        (S, X, a, pc) => `Bạn lần theo vết bánh xe hàng cướp tới một khe suối ở ${zoneName(S, X, a)}. ${pc} Sau bụi lau là hàng rào cọc nhọn, khói bếp bốc lên đều đặn. Bạn nằm im tới tối, đếm được mười hai đống lửa.`],
      fail: [(S, X, a) => { X.add('hl', -12); X.cond('wound'); return `Bạn mò tới gần trại ở ${zoneName(S, X, a)} thì vấp phải dây chuông giăng ngang lối. Cả trại thức dậy. Bạn chạy suốt đêm, một mũi tên cắm vào bắp chân, tới sáng mới dám dừng. Từ hôm ấy, toán cướp biết có người đang tìm chúng.`; },
        (S, X, a) => { X.money(-Math.round(med(S, X) * .5)); X.add('h', -5); return `Người dẫn đường bạn thuê hóa ra là tai mắt của ${fN(a)}. Hắn dẫn bạn đi vòng ba ngày trong rừng rồi biến mất cùng túi tiền. Bạn về tay trắng, lại nghe tin trại cướp đã dời đi chỗ khác.`; }],
      cb: (S, X, a) => `Đêm không trăng, trại cướp của ${a.d.nick} nằm ngay dưới chân bạn. Lửa trại đã tàn, chỉ còn tên gác ngồi gật gù bên cổng. ${fN(a)} ngủ trong căn lều lớn nhất, cạnh đống hàng cướp được. Qua khe vải, bạn thấy một đứa trẻ nằm cuộn tròn bên cạnh hắn.`,
      ch: { fight: { label: 'Lẻn vào lều, đối mặt với hắn' }, burn: { label: 'Về trấn, dẫn lính tới vây trại', sub: 'Bắt được đám lâu la; tên cầm đầu có thể thoát.' }, spare: { label: 'Quay về', sub: 'Đứa trẻ ấy chưa làm gì ai.' } },
      win: (S, X, a) => `Bạn rạch vách lều, bước vào trước khi hắn kịp với lấy thanh đao. ${fN(a)} già hơn bạn tưởng, nhưng tay vẫn nhanh. Trận đánh không dài. Sáng ra bạn trói hắn sau lưng ngựa, giao cho quan trấn, lĩnh luôn món thưởng đã treo mấy năm.`,
      lose: () => 'Hắn tỉnh ngủ hơn bạn tưởng. Lưỡi đao chém xuống, bạn chỉ đỡ được một nửa. Cả trại nhao lên, bạn phải lăn xuống dốc mà chạy, máu thấm ướt nửa người. Sau lưng, tiếng hắn cười vang cả khe núi.',
      burn: (S, X, a) => `Bạn về trấn, dẫn hai chục lính lên vây trại lúc gà gáy. Đám lâu la bị trói thành một chuỗi dài. Nhưng căn lều lớn trống trơn: ${fN(a)} đã trốn qua lối sau, chỉ để lại tấm áo khoác còn ấm.`,
      spare: (S, X, a) => `Bạn đứng lâu ngoài lều. Đứa trẻ trở mình, gọi cha trong giấc ngủ, và ${fN(a)} vỗ lưng nó, khẽ ru. Con dao trong tay bạn nặng dần. Bạn lùi vào bóng tối, bước xuống núi, không ngoái lại.`,
      after: { win: (S, X, a) => { const m = mateOf(S, a); return `Người ta xử ${fN(a)} ở chợ trấn, cả vùng đổ về xem. Bạn không xem. Bạn ra mộ ${kn(a)}, cắm cái đòn gánh gãy xuống làm bia, rồi ngồi đó tới tối.${m ? ` ${m} mang rượu tới, ngồi xuống cạnh bạn, không nói gì.` : ''} Từ ấy đường qua đèo có người đi lại, gánh hàng không phải đi thành đoàn nữa.`; },
        burn: (S, X, a) => `Đám lâu la bị đày xuống mỏ, đường đèo yên được mấy năm. Thỉnh thoảng có tin đồn ${fN(a)} lại tụ người ở một vùng xa. Mỗi lần nghe, bạn đặt bát xuống, ăn không hết bữa.`,
        spare: () => 'Năm sau trại cướp tan, người ta bảo tên cầm đầu dắt con sang xứ khác làm ruộng. Bạn không biết có thật không. Bạn chỉ biết đêm ấy về nhà, bạn ôm người thân còn sống lâu hơn mọi khi, và thấy thế là đủ.',
        fail: (S, X, a) => `Toán cướp ${a.d.nick} vẫn chặn đèo. Mỗi lần có gánh hàng mất tích, người ta lại nhìn sang nhà bạn, như hỏi bạn đã làm được gì. Cái đòn gánh gãy vẫn dựng ở góc nhà. Bạn nhìn nó mỗi tối mà không biết nói gì với nó.` },
      sum: { win: d => `bắt được tên cầm đầu toán cướp đã giết ${d.kin || 'người nhà'}`, burn: d => `dẹp được toán cướp đã giết ${d.kin || 'người nhà'}, mà tên cầm đầu trốn thoát`, spare: () => 'tha cho tên cầm đầu toán cướp vì đứa con của hắn', fail: d => `không đòi được nợ máu với toán cướp đã giết ${d.kin || 'người nhà'}` },
      beat: { any: ['Đi chợ trấn, bạn đứng lâu trước tấm bảng treo thưởng, đọc lại cái tên {foeN} tới thuộc lòng. Mép giấy đã ngả vàng.', 'Có đoàn buôn nào qua làng, bạn cũng hỏi: đi lối nào, có gặp ai chặn đường không. Người ta trả lời cho xong chuyện, bạn thì nhớ từng chữ.'] } },
    lord: { nameVi: 'Kẻ quyền thế', who: a => `lãnh chúa ${fN(a)}`, hate: 'nhà lãnh chúa', kin: ['chú', 'bác', 'ông'],
      alt: { k: 'law', label: 'Tìm chứng cứ, kiện lên trên', sub: () => 'Chậm, phải có người làm chứng; thắng thì đường đường chính chính.',
        apply: (S, X, a) => { X.add('sm', 3); G.trajBump(S, { tri: .4 }); return 'Bạn học chữ ở nhà thầy đồ đầu làng, học cả cách đọc văn tự, sổ điền. Đêm nào cũng mở ống tre, so tờ văn tự cũ với những gì đã học. Rồi bạn đi gõ cửa từng nhà từng mất đất như nhà mình, hỏi họ có còn giữ giấy tờ gì không.'; } },
      open: (S, X, a) => `Tờ văn tự đất của nhà đã nhàu, bạn cuộn lại cất trong một ống tre. ${cap(kn(a))} chết vì ba mươi roi trước cổng dinh lãnh chúa ${a.d.foeN}, chỉ vì đòi lại mảnh ruộng nhà cày đã ba đời. Bạn chưa biết làm gì với tờ giấy ấy. Nhưng đêm nào bạn cũng mở ra đọc một lần rồi mới ngủ.`,
      knot: (S, X, a) => `Lãnh chúa ${fN(a)} có lính, có ấn, có người nhà làm quan trên tỉnh. Trong mắt hắn, nhà bạn chỉ là một dòng trong sổ thuế. Đánh thẳng vào dinh thì chết trước khi tới cổng. Phải tìm cách khác, hoặc đợi tới khi mình cũng có thứ hắn có.`,
      ok: [(S, X, a, pc) => `Bạn tìm được ông thư lại già từng chép sổ điền cho dinh lãnh chúa, bị đuổi việc vì không chịu chép sai một dòng. ${pc} Ông mở rương, lấy ra cuốn sổ gốc ông lén giữ lại: mốc đất cũ còn nguyên, có cả dấu ấn.`,
        (S, X, a, pc) => `Lãnh chúa ${fN(a)} mở tiệc mừng thọ, cần thêm người hầu bàn. Bạn xin vào. ${pc} Suốt đêm bạn rót rượu, nghe hắn khoe với khách đã gom được bao nhiêu đất, bằng cách nào. Hắn không nhìn mặt người rót rượu. Bạn nhớ từng chữ.`,
        (S, X, a, pc) => `Bạn đi khắp các làng quanh vùng, tìm những nhà từng mất đất như nhà mình. Có nhà đóng cửa không tiếp, có nhà mời vào uống nước rồi khóc. ${pc} Cuối mùa, trên tờ đơn của bạn có mười bảy dấu điểm chỉ.`],
      fail: [(S, X, a) => { X.money(-Math.round(med(S, X) * .6)); X.add('h', -6); return 'Có kẻ mách lên dinh rằng bạn đang dò chuyện đất. Lính tới nhà lúc nửa đêm, lục tung mọi thứ. Bạn bị phạt một khoản tiền vì tội xúi dân. Lúc đóng tiền, viên thư lại cười, bảo lần sau nhớ lấy thân phận mình.'; },
        (S, X, a) => { X.add('hl', -12); X.cond('wound'); return 'Bạn chặn kiệu lãnh chúa ngoài chợ, quỳ xuống dâng đơn. Hắn không vén rèm. Lính gác lôi bạn ra sau chợ, đánh tới khi bạn không đứng dậy nổi. Tờ đơn bị xé đôi, rơi xuống rãnh nước.'; }],
      cb: (S, X, a) => `Lãnh chúa ${fN(a)} giờ đã già, nhưng vẫn ngồi trên ghế cao trong dinh. Trong tay bạn đã có đủ: người, chứng cứ, và một lối vào tận phòng hắn. ${cap(kn(a))} đã chết vì ba mươi roi. Bạn nghĩ xem mình muốn hắn trả bằng gì.`,
      ch: { fight: { label: 'Vào dinh, bắt hắn trả bằng mạng' }, burn: { label: 'Đưa hết ra công đường', sub: 'Hắn mất ghế, mất đất; mạng thì giữ được.' }, spare: { label: 'Chỉ đòi lại mảnh ruộng', sub: 'Hắn già rồi; để trời xử.' } },
      win: (S, X, a) => `Bạn vào dinh lúc canh ba, đi đúng lối đã dò từ trước. ${fN(a)} tỉnh dậy, thấy bạn đứng cuối giường, há miệng mà không kêu thành tiếng. Bạn đọc cho hắn nghe tên ${kn(a)}, chậm rãi, từng chữ. Sáng hôm sau cả vùng nghe tin lãnh chúa chết trong phòng ngủ.`,
      lose: (S, X, a) => `Lính gác đông hơn bạn đếm. Bạn chưa tới được cửa phòng hắn đã bị đè xuống nền đá. Họ đánh bạn một trận nhừ tử rồi ném ra ngoài cổng, đúng chỗ ${kn(a)} năm xưa bị đánh. Bạn bò về nhà, vừa bò vừa nghĩ: thế là mình cũng đã nằm đúng chỗ ấy.`,
      burn: (S, X, a) => `Bạn mang hết giấy tờ, người làm chứng lên tận quan tỉnh. Ngày xử, sân công đường đông như hội. ${fN(a)} bị lột ấn, đất trả về cho từng nhà. Hắn được giữ mạng, dọn về một căn nhà nhỏ ở ngoại ô, ngày ngày ngồi nhìn ra đường.`,
      spare: (S, X, a) => `Bạn đứng trước cổng dinh, nhìn ông già ${fN(a)} được người đỡ lên kiệu, tay run run, mắt đục. Hắn nhìn qua bạn mà không nhận ra. Bạn chỉ xin lại mảnh ruộng của nhà, hắn ký mà không cần đọc. Về tới bờ ruộng, bạn quỳ xuống, bốc một nắm đất lên ngửi.`,
      after: { win: () => 'Người lên thay ghế lãnh chúa sợ dân hơn người trước, ruộng đất trả về từng nhà. Không ai biết chắc ai đã vào dinh đêm ấy, mà cũng không ai hỏi. Bạn cày lại mảnh ruộng của nhà. Lưỡi cày đi qua chỗ hàng mốc cũ thì vấp một cái, bạn để mặc nó đó.',
        burn: (S, X, a) => `Mỗi mùa gặt, có người trong vùng mang tới nhà bạn một bó lúa đầu, đặt ở hiên rồi về, không nói gì. Tờ văn tự đất cũ bạn đóng khung treo lên vách, cạnh bàn thờ ${kn(a)}. Con cháu hỏi thì bạn kể. Kể tới đoạn công đường, giọng bạn chậm lại, như vẫn chưa tin.`,
        spare: (S, X, a) => `Mùa nào bạn cũng cày mảnh ruộng ấy, cày sâu hơn người ta. Mấy năm sau ${fN(a)} chết già, đám tang to, kèn trống ba ngày. Bạn nghe tiếng kèn từ ngoài đồng, dừng tay một lúc, rồi cày tiếp.`,
        fail: () => 'Hàng mốc đất vẫn đứng đó, mỗi năm lại nhích thêm một chút về phía làng. Bạn thôi không đi qua cổng dinh nữa. Có những đêm bạn mơ thấy ba mươi tiếng roi, đếm đủ từng tiếng rồi mới tỉnh.' },
      sum: { win: d => `tự tay đòi mạng lãnh chúa đã đánh chết ${d.kin || 'người nhà'}`, burn: d => `đưa lãnh chúa đã hại ${d.kin || 'người nhà'} ra công đường, đòi đất về cho cả vùng`, spare: () => 'buông mối thù với lãnh chúa già, chỉ đòi lại mảnh ruộng của nhà', fail: d => `không đòi được nợ máu với lãnh chúa đã hại ${d.kin || 'người nhà'}` },
      beat: { any: ['Mùa thu thuế, bạn đứng xếp hàng trước dinh {foe}, nộp đủ, cúi đầu đúng mực. Không ai thấy bàn tay bạn nắm chặt trong ống tay áo.', 'Đi ngang mảnh ruộng cũ của nhà, bạn dừng lại nhìn người lạ đang cày trên đó. Họ cũng là tá điền, cũng nghèo như bạn. Bạn không giận họ.'] } },
    warlord: { nameVi: 'Tướng giặc', who: a => `tướng giặc ${fN(a)}`, hate: 'quân giặc', race: ['human', 'orc', 'human'], alt: hireAlt,
      open: (S, X, a) => `Ngôi làng cũ giờ chỉ còn nền gạch cháy, cỏ mọc qua từng kẽ. Năm chiến tranh, quân bên kia đốt nó trong một đêm, theo lệnh một viên tướng tên ${a.d.foeN}. ${a.d.kin ? cap(a.d.kin) + ' không kịp chạy.' : 'Bao nhiêu người không kịp chạy.'} Hòa ước đã ký, người hai bên bắt tay nhau ở bến đò. Bạn thì không bắt tay ai.`,
      knot: (S, X, a) => `Hòa ước đã ký, ${fN(a)} giờ chỉ huy đồn biên giới bên kia sông, dưới tay hàng trăm lính. Không ai đòi tội cho một ngôi làng đã cháy. Muốn tới được hắn, bạn phải qua sông, qua đồn, qua cả một đạo quân.`,
      ok: [(S, X, a, pc) => `Bạn theo một đoàn buôn muối sang bên kia sông, giả làm người kéo xe. ${pc} Ba lần qua cổng đồn, bạn nhớ được giờ đổi gác, chỗ tường thấp, và cái cửa sổ phòng viên chỉ huy lúc nào cũng sáng tới khuya.`,
        (S, X, a, pc) => `Bạn tìm được một lính cũ của ${fN(a)}, giờ cụt một tay, sống bằng nghề đan rổ. Ông ta ghét viên tướng hơn cả bạn ghét. ${pc} Ông vẽ cho bạn sơ đồ đồn bằng cái tay còn lại, nét vẽ ngoằn ngoèo mà chỗ nào cũng đúng.`],
      fail: [(S, X) => { X.add('hl', -12); X.cond('wound'); return 'Bạn lội sông ban đêm, bị lính tuần phát hiện giữa dòng. Mũi tên xé nước quanh người. Bạn trôi theo dòng tới gần sáng mới bò lên được bờ bên này, một mũi tên còn cắm ở vai. Bên kia sông, đồn biên giới thắp thêm đuốc.'; },
        (S, X, a) => { X.money(-Math.round(med(S, X) * .5)); X.add('h', -6); return `Chuyện bạn dò hỏi về ${fN(a)} tới tai quan bên này. Người ta sợ bạn làm vỡ hòa ước, giữ bạn trong ngục huyện suốt một mùa. Ra tù thì vụ lúa đã hỏng, mái nhà dột mấy chỗ.`; }],
      cb: (S, X, a) => `Đồn biên giới bên kia sông, đêm sương xuống dày. ${fN(a)} giờ tóc đã muối tiêu, tối nào cũng ra bờ thành nhìn sang phía làng cũ của bạn, không ai biết vì sao. Bạn nằm trong tầm một mũi tên.`,
      ch: { fight: { label: 'Vượt tường, tìm hắn mà đòi' }, burn: { label: 'Đốt kho lương của đồn', sub: 'Đồn phải rút; hắn sống hay chết thì không biết.' }, spare: { label: 'Hạ cung xuống', sub: 'Bạn không muốn có thêm một làng cháy.' } },
      win: (S, X, a) => `Bạn vượt tường chỗ thấp, lên tới bờ thành khi hắn còn đứng đó. ${fN(a)} quay lại, nhìn bạn, rồi chậm rãi rút kiếm. Hắn già mà tay vẫn chắc. Trận đấu ngắn. Bạn về tới bờ bên này trước khi trời sáng, sau lưng chuông đồn đổ dồn.`,
      lose: () => 'Hắn nghe tiếng chân bạn từ xa. Mười tên lính đổ ra bờ thành, bạn chỉ kịp chém ngã một người trước khi bị đẩy rơi xuống hào. Bạn bơi về bên này, nước sông đỏ một vệt dài theo sau.',
      burn: (S, X, a) => `Bạn đổ dầu lên kho lương, châm một mồi lửa rồi lặn xuống sông. Lửa cháy suốt đêm, soi đỏ cả hai bờ. Một tháng sau đồn phải rút về sau núi. Có người bảo ${fN(a)} bị cách chức, có người bảo hắn chết trong đám cháy. Bạn không biết tin nào thật.`,
      spare: () => 'Bạn nhìn hắn qua đầu mũi tên rất lâu. Hắn đứng đó, nhìn sang bờ bên này, rồi cởi mũ, cúi đầu, như đang khấn ai. Bạn hạ cung xuống. Có lẽ hắn cũng có một ngôi làng của riêng mình để nhớ.',
      after: { win: () => 'Bạn về thắp hương ở nền làng cũ, cỏ giờ đã mọc kín. Không ai biết đêm ấy bạn đã qua sông. Hòa ước vẫn giữ, hai bên vẫn buôn bán qua bến đò. Bạn đi đò sang chợ bên kia như mọi người, mua muối, mặc cả, rồi về.',
        burn: () => 'Bên kia sông giờ là đồng không, đồn cũ chỉ còn mấy bức tường cháy đen. Trẻ con hai bờ lội ra giữa sông tắm chung. Bạn đứng nhìn chúng, nghĩ tới ngôi làng năm ấy, và không biết mình đang thấy nhẹ hay thấy trống.',
        spare: (S, X, a) => `Mấy năm sau có một người bên kia sông sang làng bạn, mang theo một bao gạo và một cái tên: ${a.d.foeN}. Người ấy bảo viên tướng già trước khi chết dặn mang sang, không nói vì sao. Bạn nhận bao gạo, nấu một nồi cơm, đặt lên bàn thờ ${kn(a)}.`,
        fail: () => 'Đồn biên giới vẫn sáng đèn bên kia sông. Đêm nào trời lặng, bạn nghe cả tiếng trống đổi gác vọng sang. Vết thương cũ trở trời là buốt. Bạn ra bến đò ngồi, nhìn sang, tới khi người lái đò hỏi có qua không.' },
      sum: { win: () => 'vượt sông đòi nợ máu với viên tướng giặc đã đốt làng', burn: () => 'đốt đồn giặc, đuổi được quân của viên tướng đã đốt làng', spare: () => 'hạ cung trước viên tướng già, buông mối thù chiến tranh', fail: () => 'không đòi được nợ máu với viên tướng giặc đã đốt làng' },
      beat: { any: ['Bạn ra bến đò ngồi tới tối, đếm thuyền lính bên kia sông qua lại. Người lái đò đã quen mặt, không hỏi nữa.', 'Bạn tập bắn cung vào một tấm ván vẽ hình mũ trụ của quân bên kia. Tấm ván thủng lỗ chỗ, bạn thay tấm mới.'] } },
    cult: { nameVi: 'Tà thuật sư', who: a => `tà thuật sư ${fN(a)}`, hate: 'kẻ luyện tà thuật', race: ['human', 'elf', 'human'], kin: ['chú', 'cô', 'người em họ'],
      alt: { k: 'faith', label: 'Tìm tới đền, xin cách trừ tà', sub: () => 'Có người của đền đi cùng; phải theo luật của đền.',
        apply: (S, X, a) => { if (S.faith) S.devotion = Math.min(100, S.devotion + 6); G.trajBump(S, { dao: .5 }); return `Bạn đi bộ nửa tháng tới ngôi đền lớn nhất vùng, quỳ giữa sân kể chuyện của ${kn(a)}. Vị tư tế già nghe xong không nói gì, chỉ đưa cho bạn một cái chổi, rồi một cuốn kinh. Ba năm, bạn quét sân, chép kinh, học cách đọc những vòng tròn vẽ bằng máu.`; } },
      open: (S, X, a) => `${cap(kn(a))} ra giếng lấy nước một đêm trăng tròn và không về. Người ta chỉ tìm thấy một vòng tròn vẽ bằng máu khô trên tảng đá ở ${zoneName(S, X, a)}. Rồi có người kể đã thấy ${kn(a)} đi giữa một hàng xác sống, theo sau một kẻ áo đen tên ${a.d.foeN}. Bạn đã không tin. Giờ thì bạn tin, và bạn đã thôi khóc.`,
      knot: (S, X, a) => `Tà thuật sư ${fN(a)} ẩn trong một hầm mộ cổ ở ${zoneName(S, X, a)}, quanh hắn là những người đã chết mà không được nằm yên. Gươm thường chém xác sống không chết hẳn. Muốn tới được hắn, bạn cần nhiều hơn một lưỡi gươm.`,
      ok: [(S, X, a, pc) => `Bạn tìm lại tảng đá có vòng tròn máu, chép từng ký hiệu lên một mảnh vải. ${pc} Những ký hiệu chỉ về một hướng: ngọn đồi có hàng thông chết ở ${zoneName(S, X, a)}. Dưới chân đồi có một cửa hầm, cỏ quanh đó không mọc nổi.`,
        (S, X, a, pc) => `Một đêm, hàng xác sống đi ngang bìa làng. Bạn nằm úp trong mương, để chúng đi qua cách mặt mình một sải tay. ${pc} Rồi bạn đứng dậy, bám theo, giữ đúng khoảng cách, tới tận cửa hầm mộ.`],
      fail: [(S, X, a) => { X.add('hl', -10); X.cond('wound'); return `Bạn vào ${zoneName(S, X, a)} lúc trời chưa tối hẳn, vẫn là chậm. Đất dưới chân bỗng lở ra, những bàn tay xương thò lên níu lấy cổ chân. Bạn chém, chạy, ngã, lại chạy. Về tới làng, chân bạn tím bầm từng vệt như dấu ngón tay.`; },
        (S, X, a) => { X.add('h', -10); return `Bạn gặp lại ${kn(a)} giữa đường rừng. Bạn gọi, ${kn(a)} quay lại nhìn bạn bằng đôi mắt trắng dã, rồi đi tiếp. Bạn đứng chết lặng tới khi hàng xác sống khuất hẳn, quên cả mình vào rừng để làm gì.`; }],
      cb: (S, X, a) => `Hầm mộ lạnh như đáy giếng. Ở cuối hầm, ${fN(a)} ngồi giữa vòng tròn máu, quanh hắn là những xác sống đứng im như tượng. Trong số đó có ${kn(a)}. Hắn ngẩng lên nhìn bạn, mỉm cười, như đã chờ từ lâu.`,
      ch: { fight: { label: 'Bước qua vòng máu, đánh hắn' }, burn: { label: 'Phong cửa hầm, đốt bùa trấn', sub: 'Hắn bị nhốt dưới đất; chết hay chưa thì không biết.' }, spare: { label: 'Chỉ đưa người thân về chôn', sub: 'Không đánh hắn; đưa người mình thương về nằm yên.' } },
      win: (S, X, a) => `Bạn bước qua vạch máu. Hàng xác sống quay lại, chậm chạp, và ${kn(a)} là người đứng chắn trước tiên. Bạn nhắm mắt, đẩy ${kn(a)} sang một bên, lao tới. Khi ${fN(a)} ngã xuống, mọi xác sống trong hầm cùng đổ theo, như dây giật đứt. Bạn bế ${kn(a)} ra khỏi hầm, nhẹ hơn bạn tưởng.`,
      lose: () => 'Hắn chỉ giơ một ngón tay. Hàng xác sống ùa tới, lạnh và nặng như đá. Bạn chém được mấy đứa rồi bị đè xuống. Không hiểu sao chúng buông bạn ra, có lẽ hắn muốn bạn sống để còn quay lại. Bạn bò ra khỏi hầm, sau lưng vẳng tiếng cười.',
      burn: () => 'Bạn lùi ra cửa hầm, dán bùa lên từng phiến đá, rồi đốt. Lửa xanh liếm quanh cửa hầm suốt đêm, bên dưới có tiếng cào cấu, rồi im. Bạn lấp đất lên, trồng một hàng gai. Bên dưới hắn còn sống hay đã chết, bạn không biết, và cũng không định đào lên xem.',
      spare: (S, X, a) => `Bạn không nhìn ${fN(a)} nữa. Bạn chỉ bước tới, nắm tay ${kn(a)}, dắt ra khỏi hàng. Lạ thay, hắn không ngăn. Ra tới ánh nắng, thân xác ${kn(a)} rã xuống trong tay bạn, như đã chờ được về. Bạn chôn ${kn(a)} ở đầu làng, dưới gốc cây ngày nhỏ hai người hay ngồi.`,
      after: { win: (S, X, a) => `Bạn chôn ${kn(a)} lần thứ hai, lần này đủ hương, đủ lễ. Người làng không còn sợ ra giếng đêm trăng. Bạn giữ lại mảnh vải chép những ký hiệu máu, cất thật kỹ, không cho ai xem, phòng có ngày cần đến.`,
        burn: () => 'Hàng gai trên cửa hầm năm nào cũng tốt lạ thường. Trẻ con trong làng được dặn đừng tới gần ngọn đồi có hàng thông chết. Đêm trăng tròn, bạn vẫn ra đó ngồi một lúc, áp tai xuống nghe đất. Đất im.',
        spare: (S, X, a) => `Mộ ${kn(a)} ở đầu làng năm nào cũng có hoa, bạn trồng. Người ta vẫn đồn có kẻ áo đen ở vùng khác, vẫn có người mất tích đêm trăng. Bạn nghe rồi để đó. Có những món nợ không phải mình đòi.`,
        fail: () => 'Đêm trăng tròn, bạn đóng chặt cửa, ngồi canh tới sáng. Có lần nghe tiếng bước chân ngoài ngõ, đều đều, quen quen. Bạn không dám mở cửa, mà cũng không dám thôi nghe.' },
      sum: { win: d => `giết tà thuật sư, đưa ${d.kin || 'người thân'} về nằm yên`, burn: () => 'phong tà thuật sư dưới hầm mộ, không biết hắn chết hay chưa', spare: d => `không đánh tà thuật sư, chỉ đưa ${d.kin || 'người thân'} về chôn cất`, fail: d => `không đòi được ${d.kin || 'người thân'} từ tay tà thuật sư` },
      beat: { any: ['Đêm trăng tròn nào bạn cũng thức, ngồi bên cửa sổ, tay cầm cây đuốc chưa châm. Có tiếng chân ngoài ngõ là bạn đứng dậy.', 'Bạn hỏi khắp các thầy cúng trong vùng về những vòng tròn vẽ bằng máu. Phần nhiều đuổi bạn đi. Có một người không đuổi, chỉ thắp thêm một ngọn đèn.'] } },
    rival: { nameVi: 'Kẻ phản bội', who: a => fN(a), hate: 'hắn', kin: ['chú', 'bác', 'cậu'],
      alt: { k: 'spy', label: 'Vào làm thuê dưới mái nhà hắn', sub: () => 'Gần hắn, nghe được hết; phải nhịn được mới làm được.',
        apply: (S, X, a) => { G.trajBump(S, { am: .4 }); X.add('h', -4); return `Bạn đổi tên, lên thành, xin vào làm khuân vác ở cửa hiệu của ${fN(a)}. Hắn đi qua bạn mỗi ngày, có hôm còn vỗ vai khen chăm. Bạn cúi đầu cảm ơn. Đêm về căn buồng thuê, bạn siết hai bàn tay vào nhau tới khi hết run.`; } },
      open: (S, X, a) => `${a.d.foeN} từng là bạn chí cốt của ${kn(a)}, ăn cùng mâm, gọi nhau bằng anh em. Một chuyến buôn xa, hắn về một mình, bảo ${kn(a)} trượt chân ở đèo. Mấy năm sau, một người phu cũ say rượu kể khác: hắn đẩy. Giờ ${fN(a)} có cửa hiệu ba gian trong thành, dựng bằng hàng của chuyến ấy.`,
      knot: (S, X, a) => `${fN(a)} giờ là người có máu mặt trong thành: có tiền, có người quen, có cả lính nhà. Lời một người phu say rượu không đủ để kiện ai. Hắn còn nhớ mặt bạn hay không, bạn không biết.`,
      ok: [(S, X, a, pc) => `Bạn lần ra người phu năm ấy, giờ đã già, sống nhờ con gái ở một làng ven sông. ${pc} Ông không muốn nhắc chuyện cũ. Nhưng khi bạn đặt lên bàn đôi giày rách của ${kn(a)}, ông khóc, và chịu đi làm chứng.`,
        (S, X, a, pc) => `Bạn tìm được sổ hàng chuyến buôn năm ấy, nằm lẫn trong đống giấy cũ ở một hiệu cầm đồ. ${pc} Trong sổ có con dấu của ${fN(a)}, ngày tháng, và cả tên ${kn(a)}, bị gạch đi bằng một nét mực khác màu.`],
      fail: [(S, X, a) => { X.add('hl', -10); X.cond('wound'); X.money(-Math.round(med(S, X) * .3)); return `${fN(a)} nhận ra bạn trước khi bạn kịp làm gì. Hắn mời bạn vào uống trà, hỏi thăm nhà cửa, giọng ngọt như mật. Tối ấy trên đường về, ba gã lạ mặt chặn bạn trong hẻm. Bạn lết được về nhà trọ, mất hai cái răng và sạch túi.`; },
        (S, X) => { X.add('h', -8); return 'Người phu duy nhất biết chuyện chết trước khi bạn tìm tới, người ta bảo vì bệnh. Con gái ông đóng cửa, không cho ai vào. Bạn đứng ngoài cổng tới tối, nghe trong nhà có tiếng đếm tiền.'; }],
      cb: (S, X, a) => `${fN(a)} giờ đã già, ngồi sau quầy cửa hiệu ba gian, tay lần chuỗi hạt. Trong tay bạn có đủ chứng cứ, hoặc đủ một con dao. Hắn ngẩng lên, lần này nhìn bạn rất lâu, rồi nói khẽ: "Mày giống ${kn(a)} quá."`,
      ch: { fight: { label: 'Rút dao, đòi mạng trả mạng' }, burn: { label: 'Vạch mặt hắn giữa chợ', sub: 'Hắn mất danh tiếng, mất cửa hiệu; mạng thì giữ.' }, spare: { label: 'Để hắn sống với những gì đã làm', sub: 'Hắn già rồi; bạn quay đi.' } },
      win: () => 'Hắn không chạy. Có lẽ hắn cũng đã chờ ngày này lâu như bạn. Bạn bước qua quầy, và mọi chuyện xong nhanh hơn bao năm bạn hình dung. Lúc bạn ra khỏi cửa hiệu, ngoài phố người ta vẫn mua bán như thường, không ai ngoái lại.',
      lose: (S, X, a) => `Hắn già mà không yếu. Một tiếng huýt, ba gã lính nhà từ gian trong xông ra. Bạn bị đánh ngã giữa đống hàng rồi bị ném ra đường, con dao bẻ gãy quăng theo. ${fN(a)} đứng ở cửa nhìn bạn, lắc đầu, như nhìn một con chó dại.`,
      burn: (S, X, a) => `Phiên chợ đông nhất năm, bạn đứng lên bậc đá giữa chợ, đọc to từng chứng cứ về ${fN(a)}, người làm chứng đứng ngay bên cạnh. Chợ lặng đi. Mùa sau cửa hiệu ba gian đóng cửa, không ai còn buôn với hắn. Hắn bán nhà, bỏ thành đi đâu không ai biết.`,
      spare: () => 'Bạn nhìn hắn rất lâu. Ông già sau quầy rót cho bạn một chén trà, tay run làm nước sóng cả ra ngoài. "Đêm nào tao cũng nghe tiếng nó rơi," hắn nói. Bạn không uống, cũng không rút dao. Bạn đặt chén xuống, đi ra, để hắn ngồi lại với tiếng rơi ấy.',
      after: { win: (S, X, a) => `Bạn về quê, đặt lên mộ ${kn(a)} chuỗi hạt của hắn, rồi lại cầm về, ném xuống sông. Thứ ấy không đáng nằm cạnh ${kn(a)}. Đêm đầu tiên sau bao năm, bạn ngủ mà không mơ thấy con đèo.`,
        burn: (S, X, a) => `Người trong thành nhắc chuyện ấy rất lâu, mỗi người kể một khác. Có người bảo bạn ác, có người bảo bạn đúng. Bạn chỉ biết từ hôm ấy, người ta nhắc tới ${kn(a)} như một người bị hại, không còn là kẻ trượt chân.`,
        spare: (S, X, a) => `Mấy năm sau ${fN(a)} chết. Con cháu hắn tìm tới nhà bạn, đưa một cái hộp gỗ, bảo ông dặn trước khi mất. Trong hộp là phần chia hàng của chuyến buôn năm ấy, gói kỹ, chưa tiêu một đồng. Bạn cầm cái hộp, không biết nên giận hay nên thương.`,
        fail: (S, X, a) => `${fN(a)} vẫn ngồi sau quầy cửa hiệu ba gian, mỗi năm một giàu. Bạn thôi lên thành. Có những đêm bạn mơ thấy con đèo, thấy ${kn(a)} quay lại nhìn mình trước khi rơi, miệng mấp máy một câu bạn không nghe được.` },
      sum: { win: d => `tự tay đòi mạng kẻ phản bội đã đẩy ${d.kin || 'người nhà'} xuống đèo`, burn: d => `vạch mặt kẻ phản bội đã hại ${d.kin || 'người nhà'} giữa chợ`, spare: () => 'để kẻ phản bội già sống với tội của hắn', fail: d => `không đòi được nợ máu với kẻ phản bội đã hại ${d.kin || 'người nhà'}` },
      beat: { any: ['Bạn lên thành một chuyến, đứng bên kia đường nhìn cửa hiệu ba gian của {foeN}. Khách ra vào tấp nập. Bạn đứng tới khi người ta đóng cửa.', 'Ngày giỗ {kin}, bạn đặt lên bàn thờ một chén rượu và một con dao. Rượu thì rót, dao thì để nguyên.'] } }
  };
  const foeOf = a => AV_FOE[a.d.foe] || AV_FOE.beast;
  // Câu chen vào thử thách thành công theo lối đã chọn ở hồi chọn đường.
  const AV_PATH = { train: 'Bao năm tự luyện không phí: bạn đi một mình mà không thấy thiếu ai.', band: 'Cả nhóm thay nhau canh đêm, không ai than một lời.',
    hire: 'Đám mạo hiểm giả đi trước, bạn bám sát sau lưng, không để họ bỏ cuộc giữa chừng.', guild: 'Mấy năm trong hội đã dạy bạn cách dò tin, cách nghe ngóng mà không để ai biết mình đang hỏi.',
    rank: 'Cái chức bạn leo lên được mở cho bạn những cánh cửa mà trước kia bạn chỉ đứng ngoài nhìn.', law: 'Bạn chép lại từng điều nghe được vào cuốn sổ giấu dưới đáy rương.',
    faith: 'Lá bùa vị tư tế buộc vào cổ tay bạn ấm lên mỗi khi tới gần chỗ có tà khí.', spy: 'Bao tháng bưng nước, cúi đầu dưới mái nhà hắn, bạn đã nghe được những điều người ngoài không ai biết.' };
  const AV_BAND = 'Tụ những người cùng chung mối hận';
  const AV_BASE = { band: .1, hire: .15, guild: .12, rank: .1, law: .08, faith: .12, spy: .1 };
  const avOdds = (S, X, a) => odds(S, X, (a.d.ok ? .5 : .3) + pb(a) + (a.d.path === 'guild' || a.d.path === 'rank' ? .05 : 0));
  const avBy = (o, f) => (S, X, a) => f(foeOf(a))[o](S, X, a);
  saga('m_avenge', {
    nameVi: 'Món nợ máu', pitch: 'Đi đòi lại món nợ máu năm xưa.', axes: { vo: 1, am: .4 }, themes: ['raid', 'war'], aim: null,
    quest: a => `Trả món nợ máu cho ${a.d.kin || 'làng'}`, good: ['win', 'burn', 'spare'],
    marks: { win: 'da_bao_thu', burn: 'da_bao_thu', spare: 'buong_bo', fail: 'thu_chua_tra' },
    sum: { win: d => foeOf({ d }).sum.win(d), burn: d => foeOf({ d }).sum.burn(d), spare: d => foeOf({ d }).sum.spare(d), fail: d => foeOf({ d }).sum.fail(d) },
    follow: ['Đêm ấy bạn lại mơ thấy ngày ấy, tỉnh dậy gối ướt mồ hôi.', 'Về nhà, bạn khắc thêm một vạch lên chuôi vũ khí. Chuôi đã gần kín vạch.', 'Việc gì bạn làm cũng như đưa mình tới gần ngày đòi nợ thêm một bước.'],
    beat: AV_FOE.beast.beat, beatOf: a => (a.d.foe && a.d.foe !== 'beast' ? AV_FOE[a.d.foe].beat.any : null),
    fill: (S, X, a, t) => t.replace(/{foeN}/g, fN(a)).replace(/{foe}/g, foeOf(a).who(a)),
    // Trang duyệt: câu chữ của mọi loại kẻ thù (review/story-data.html đọc def.texts, def.variants).
    variants: Object.values(AV_FOE).map(F => F.nameVi),
    texts: { open: Object.values(AV_FOE).map(F => F.open), knot: [AV_PATH, { label: AV_BAND }, ...Object.values(AV_FOE).map(F => [F.knot, F.alt, F.band ? { label: F.band } : null])], trial: Object.values(AV_FOE).map(F => [F.ok, F.fail]),
      climax: Object.values(AV_FOE).map(F => [F.cb, F.ch, F.win, F.lose, F.burn, F.spare]), after: Object.values(AV_FOE).map(F => Object.values(F.after)), beat: Object.values(AV_FOE).map(F => F.beat.any || []) },
    open: (S, X, a) => `${lead(S, a)}${foeOf(a).open(S, X, a)}`,
    knot: { title: 'Cách đòi nợ máu', body: (S, X, a) => foeOf(a).knot(S, X, a),
      choices: (S, X, a) => { const F = foeOf(a); return [{ k: 'train', label: 'Luyện tới khi đủ sức', sub: 'Một mình, lâu, nhưng chắc tay.' }, { k: 'band', label: F.band || AV_BAND, sub: 'Cần người tin bạn.' },
        { k: 'guild', label: 'Vào hội mạo hiểm, đi đánh thuê', sub: 'Vừa luyện tay, vừa có bạn đồng hành, vừa nghe được tin.' },
        { k: 'rank', label: 'Leo lên chức cao để có người, có quyền', sub: 'Lâu, phải nhẫn nhịn; tới lúc có thì có cả một đội.' },
        { k: F.alt.k, label: F.alt.label, sub: F.alt.sub(S, X) }]; },
      apply(S, X, ch, a) {
        const F = foeOf(a);
        if (ch === 'train') { X.gain(bestSk(S), 6); G.trajBump(S, { vo: .5 }); return 'Bạn dựng một bãi tập sau nhà, cắm cọc, treo bao cát. Ngày nào cũng ra đó trước khi gà gáy, về khi trời đã tối mịt. Bát cơm để phần trên bếp lần nào cũng nguội.'; }
        if (ch === 'band') { const p = G.castAdd(S, X, { role: 'ban', how: 'người cùng bạn đi đòi nợ máu', work: 'hunter', bond: 35 }); a.d.mate = p.id; X.add('so', 4); return `${first(p.name)} là người đầu tiên đứng ra, không hỏi công xá bao nhiêu. Rồi thêm ba người nữa, ai cũng có lý do riêng để căm ${F.hate}. Tối ấy năm người ngồi quanh bếp nhà bạn, uống chung một vò rượu, không ai nói nhiều.`; }
        if (ch === 'guild') { const p = G.castAdd(S, X, { role: 'ban', how: 'đồng đội trong hội mạo hiểm', work: 'hunter', bond: 25 }); a.d.mate = p.id; X.gain(bestSk(S), 4); X.money(Math.round(med(S, X) * .6)); S.fame += 2; G.trajBump(S, { vo: .3, du: .3 });
          return `Bạn ký tên vào sổ của hội mạo hiểm, nhận tấm thẻ đồng còn sáng bóng. Mấy năm liền bạn theo các toán thuê đi khắp nơi: hộ tống đoàn buôn, dọn hang quái, đòi nợ thay người. ${first(p.name)} đỡ cho bạn một nhát dao ở chuyến đầu, từ đó hai người đi đâu cũng có nhau. Tới quán trọ nào, bạn cũng hỏi về ${F.who(a)}.`; }
        if (ch === 'rank') { G.trajBump(S, { quyen: .6 }); X.add('so', 3); X.add('h', -3); return 'Bạn xin vào làm lính canh ở đồn trấn, rồi làm người giữ sổ cho viên đội trưởng. Bạn cúi đầu với những kẻ mình khinh, cười với những câu mình ghét. Mỗi lần được lên một bậc, bạn lại đếm xem dưới tay mình đã có bao nhiêu người. Chưa đủ. Bạn chờ.'; }
        return F.alt.apply(S, X, a);
      },
      auto: (S, X, a) => S.traits.social > .65 && S.traits.studious > .5 ? 'rank' : S.traits.social > .55 ? 'band' : S.traits.bold > .65 ? 'guild' : (S.gold > med(S, X) * 2 && S.traits.bold < .5) || S.traits.pious > .7 ? foeOf(a).alt.k : 'train' },
    trial: { base: (S, X, a) => .45 + (AV_BASE[a.d.path] || 0),
      run: (S, X, a, ok) => { const F = foeOf(a); if (ok) { X.gain(bestSk(S), 3); return X.pick(F.ok)(S, X, a, AV_PATH[a.d.path] || ''); } return X.pick(F.fail)(S, X, a); } },
    climax: { title: 'Ngày đòi nợ', body: (S, X, a) => foeOf(a).cb(S, X, a),
      choices: (S, X, a) => { const C = foeOf(a).ch; return [{ k: 'fight', label: C.fight.label, sub: `Khả năng thắng chừng ${Math.round(avOdds(S, X, a) * 100)}%.` }, { k: 'burn', label: C.burn.label, sub: C.burn.sub }, { k: 'spare', label: C.spare.label, sub: C.spare.sub }]; },
      apply(S, X, ch, a) {
        const F = foeOf(a);
        if (ch === 'fight') { if (X.chance(avOdds(S, X, a))) { S.fame += 6; return { t: F.win(S, X, a), o: 'win' }; }
          X.add('hl', -20); X.cond('wound'); return { t: F.lose(S, X, a), o: 'fail' }; }
        if (ch === 'burn') { S.fame += 2; return { t: F.burn(S, X, a), o: 'burn' }; }
        X.add('h', 4); return { t: F.spare(S, X, a), o: 'spare' };
      },
      auto: (S, X, a) => S.traits.bold > .55 ? 'fight' : S.traits.pious > .7 ? 'spare' : 'burn' },
    after: { win: avBy('win', F => F.after), burn: avBy('burn', F => F.after), spare: avBy('spare', F => F.after), fail: avBy('fail', F => F.after) }
  });

  // ── Thoát nghèo ──
  // Người dùng ghi chú 18/10/2026 (trang Duyệt Mạch Truyện): mở đầu cần lý do sâu hơn (sự kiện tuổi nhỏ ri_* ở mục 3: chịu nhục vì nghèo,
  // gắn bó với người nhà; mở đầu nhắc lại ký ức S.flags.riMem; nút m_rise_kin: cảnh người nhà trong lúc đi đường); thêm lối liều mạng
  // mạo hiểm (venture); thử thách nhiều kịch bản theo lối (RISE_TRIAL).
  const kinHome = S => (S.family.parents || []).find(p => p.alive && (p.role === 'mẹ' || p.role === 'cha'));
  const ppOf = S => { const p = kinHome(S); return p ? p.role : 'bà'; };
  const RISE_TRIAL = {
    trade: { ok: ['Chuyến hàng bán hết trước khi tới chợ thứ ba, người ta còn hỏi bao giờ bạn ghé lại',
        'Năm ấy miền ngược mất mùa, bạn chở gạo dưới xuôi lên bán. Bạn không bán cắt cổ, chỉ lấy lời gấp đôi, người ta nhớ mà mua của bạn cả mùa sau',
        'Một lão thương lái già ốm nặng, giao lại cho bạn mối hàng vải, chỉ dặn mỗi năm mang cho vợ lão một tấm. Bạn giữ lời, mối hàng cũng giữ bạn'],
      fail: ['Hàng ướt mưa giữa đường, muối chảy thành nước', 'Bọn cướp chặn xe ở khúc đèo, lấy cả hàng lẫn con lừa, chừa lại cho bạn cái áo mặc trên người',
        'Bạn mua phải một xe vải mục, bên ngoài phủ một lớp vải tốt. Kẻ bán đã biến khỏi chợ trước khi bạn kịp gỡ tới lớp thứ hai'] },
    land: { ok: ['Mảnh đất khai hoang cho vụ lúa đầu tiên, hạt nào cũng chắc mẩy', 'Cả nhà ra đồng gặt, đứa nhỏ nhất cũng ôm được một bó. Tối ấy ăn cơm mới ngay trên bờ ruộng, thơm tới mức không ai nói câu nào',
        'Bạn đào được con mương dẫn nước từ suối về, làng bên cũng xin chia nước, trả bằng thóc, đều đặn mỗi mùa'],
      fail: ['Lũ về giữa đêm, cuốn sạch vụ đầu', 'Châu chấu kéo tới như một đám mây, ba ngày sau ruộng chỉ còn trơ gốc rạ',
        'Viên quản đất tới đo lại, bảo mảnh đất khai hoang nằm trong đất của lãnh chúa. Muốn cày tiếp thì nộp tô nửa phần'] },
    skill: { ok: ['Ông chủ xưởng gọi bạn vào, trả đủ công cả những tháng trước', 'Một khách sộp trên tỉnh đặt hàng đúng tên bạn, không qua tay thợ cả. Thợ cả biết, chỉ gật đầu, rồi giao cho bạn việc khó hơn',
        'Bạn làm xong món đồ khó nhất xưởng nhận năm ấy, thức trắng mười đêm. Thợ cả cầm lên xem rất lâu, rồi trả lại, bảo từ nay không cần ông xem nữa'],
      fail: ['Xưởng cháy, ông chủ ôm tiền bỏ đi', 'Bạn làm hỏng món hàng của một nhà quyền thế, phải bồi gấp đôi tiền công cả năm',
        'Xưởng mới mở ở đầu chợ bán rẻ hơn một nửa, khách bỏ đi hết. Thợ cả cho bớt người, bạn là người mới nhất'] },
    venture: { ok: ['Toán của bạn hạ được một con quái già ở {z}, tinh hạch to bằng nắm tay. Chia phần xong, bạn ôm túi tiền ngủ ngồi suốt đường về',
        'Bạn chui vào một khe mỏ bỏ hoang không ai dám vào, mò được một mạch ma tinh nhỏ. Hai tuần đào trong bóng tối, ra tới ánh sáng mắt cay xè, tay phồng rộp, mà túi thì nặng',
        'Bạn nhận hộ tống một đoàn hàng qua vùng có quái, cả đoàn ai cũng nghĩ sẽ không qua nổi. Đoàn qua được, chủ hàng trả gấp ba như đã hứa'],
      fail: ['Con quái không chết như người ta bảo. Nó hất bạn văng vào gốc cây, cả toán bỏ chạy, để lại hết đồ nghề',
        'Hầm mỏ sập sau lưng bạn. Hai ngày sau bạn mới đào được lối ra, mất cả đèn, cả cuốc, lẫn số ma tinh đã đào',
        'Toán người liều bạn theo cãi nhau chia phần ngay giữa rừng, rút dao với nhau. Bạn chạy về một mình, cánh tay một vết chém, túi trống trơn'] }
  };
  const RISE_TAIL = { ok: ['Đêm ấy bạn bỏ tiền vào hũ, nghe tiếng đồng chạm nhau mà không ngủ được.', 'Bạn mua cho {pp} một tấm vải mới, phần còn lại bỏ cả vào hũ.'],
    fail: ['Bạn ngồi trước cửa nhà cả buổi, không nói với ai câu nào.', 'Tối ấy cả nhà ăn cháo. Không ai trách bạn, mà bạn thấy còn nặng hơn bị trách.'] };
  saga('m_rise', {
    nameVi: 'Thoát nghèo', pitch: 'Đưa cả nhà ra khỏi cảnh nghèo.', axes: { thuong: 1, nghe: .6 }, themes: ['tax', 'hardship', 'gamble'], aim: 'wealth',
    quest: () => 'Đưa cả nhà thoát nghèo', good: ['rich', 'steady'], marks: { rich: 'nha_kha', steady: 'giu_loi', ruined: 'tay_trang', crooked: 'cua_phi_nghia' },
    sum: { rich: () => 'đưa cả nhà thoát nghèo', steady: () => 'giữ cho nhà đủ ăn mà không nợ ai', ruined: () => 'mất trắng một cơ nghiệp gây dựng nửa đời', crooked: () => 'giàu lên bằng những mối làm ăn không ai muốn nhắc' },
    follow: ['Tối ấy bạn lại nghĩ tới cái hũ tiền dưới gầm giường, nhẩm xem còn thiếu bao nhiêu.', 'Về nhà bạn lôi hũ tiền ra đếm lại, lần này đếm chậm hơn.', 'Bạn nhẩm trong đầu: còn bao nhiêu mùa nữa thì đủ.'],
    beat: { any: ['Bạn dậy trước gà gáy, đi ngủ sau chó sủa, quanh năm không nghỉ một ngày rằm. Hũ tiền dưới gầm giường đầy thêm một đốt tay.', 'Ở chợ bạn mặc cả từng đồng, kẻ bán người mua đều ngán. Bà bán cá nhớ mặt bạn, thấy từ xa đã cười, bảo thôi thì bớt cho.', 'Bạn bè rủ đi uống rượu, bạn lắc đầu. Ngồi nhà nhai cơm nguội với muối vừng, nghĩ tới mùa sau, bạn thấy cũng đáng.'] },
    texts: { trial: [RISE_TRIAL, RISE_TAIL] },
    open: (S, X, a) => { const M = S.flags.riMem, mem = M && !(a.d.why && a.d.why.slice(0, 30) === M.w) ? M.m : null;
      return `${lead(S, a)}Đêm ấy bạn ngồi bên ngọn đèn dầu, đếm từng đồng trong nhà. Đếm hai lần, vẫn không đủ cho một mùa. ${mem ? `Bạn nhớ tới ${mem}, nhớ rõ như mới hôm qua. ` : ''}Ngoài vách có tiếng ai ho khan. Bạn tự hứa: tới lúc tóc bạc, nhà này sẽ không phải ăn cháo loãng nữa.`; },
    knot: { title: 'Con đường làm ăn', body: () => 'Muốn thoát nghèo phải có một nghề ra tiền, một mảnh đất của riêng mình, hoặc dám đem cả mạng ra đánh cược. Ai trong làng cũng có lời khuyên, mà không ai cho vay. Đường nào thì cũng phải tự mình đi.',
      choices: () => [{ k: 'trade', label: 'Buôn chuyến', sub: 'Mua chỗ này, bán chỗ kia.' }, { k: 'land', label: 'Khai hoang đất mới', sub: 'Đất rẻ, việc nặng.' }, { k: 'skill', label: 'Học một nghề giỏi', sub: 'Lâu thấy tiền, nhưng bền.' },
        { k: 'venture', label: 'Liều mạng đi mạo hiểm', sub: 'Vào nơi nguy hiểm kiếm của: giàu nhanh, dễ mất mạng.' }],
      apply(S, X, ch, a) { if (ch === 'trade') { G.trajBump(S, { thuong: .5 }); return 'Bạn vay một khoản nhỏ, mua một xe muối rồi đẩy nó qua ba làng. Bánh xe sa lầy hai lần, vai bạn tróc da. Lời chẳng được bao nhiêu. Nhưng từ chuyến ấy bạn biết chợ nào cần gì, đường nào ít cướp.'; }
        if (ch === 'land') { X.gain('Body', 4); G.trajBump(S, { gia: .3 }); return 'Bạn xin được một mảnh đất hoang ven rừng, dựng tạm cái lều tranh. Ngày nào cũng nhổ gốc cây, đào đá, tối về hai bàn tay không nắm lại được. Mảnh đất bé tí, cỏ tranh cao quá đầu. Nhưng là đất của bạn.'; }
        if (ch === 'venture') { X.gain(bestSk(S), 3); G.trajBump(S, { vo: .4, du: .3 }); return `Bạn bán con dao phay, mua một ngọn giáo cũ, theo một toán người liều vào ${zoneName(S, X, a)} săn quái lấy tinh hạch. Đêm đầu nằm trong rừng, bạn không ngủ được, nghe tiếng gì cũng tưởng mình sắp chết. Sáng ra bạn vẫn sống, trong túi có một viên tinh hạch bé bằng đốt tay. Đủ mua gạo cho cả nhà ba tháng, và đủ để bạn quay lại.`; }
        X.gain('Engineering', 4); G.trajBump(S, { nghe: .5 }); return 'Bạn xin vào học việc ở một xưởng, chịu làm không công ba năm đầu. Thợ cả ít lời, chỉ gõ thước vào tay mỗi khi bạn làm sai. Tay sưng mãi rồi cũng quen. Đêm về, bạn tập lại một mình từng đường ông làm ban ngày.'; },
      auto: S => S.traits.bold > .7 && S.traits.social < .5 ? 'venture' : S.traits.social > .55 ? 'trade' : S.traits.studious > .55 ? 'skill' : 'land' },
    trial: { base: (S, X, a) => .5 + (S.q >= 3 ? .1 : 0) - (a.d.path === 'venture' ? .1 : 0),
      run: (S, X, a, ok) => { const v = a.d.path === 'venture', T = RISE_TRIAL[a.d.path] || RISE_TRIAL.skill, g = Math.round(med(S, X) * (ok ? (v ? 2.5 : 1.5) : (v ? -.3 : -.6))); X.money(g);
        if (v && !ok) { X.add('hl', -15); X.cond('wound'); }
        const s = X.pick(ok ? T.ok : T.fail).replace('{z}', zoneName(S, X, a)), tail = X.pick(RISE_TAIL[ok ? 'ok' : 'fail']).replace('{pp}', ppOf(S));
        return ok ? `Mùa ấy được. ${s}. ${tail} Thu về ${G.coin(g)}.` : `Mùa ấy mất. ${s}. ${tail} Lỗ ${G.coin(-g)}.`; } },
    climax: { title: 'Mối làm ăn lớn', body: (S, X, a) => `Có một mối hàng lớn tìm tới. Được thì cả nhà đổi đời, mất thì mất sạch. ${a.d.ok ? 'Mùa trước làm ăn được, trong tay bạn có chút vốn.' : 'Mùa trước vừa lỗ, vốn trong tay chẳng còn bao nhiêu.'} Cần chừng ${G.coin(Math.round(med(S, X) * 3))}.`,
      choices: (S, X, a) => [{ k: 'risk', label: 'Dồn hết vốn vào', sub: `Chừng ${Math.round(G.clamp(.45 + (a.d.ok ? .1 : 0) + pb(a), .1, .9) * 100)}% được.` },
        { k: 'steady', label: 'Giữ nhịp, chia bớt cho họ hàng', sub: 'Không giàu nhanh, không mất gì.' }, { k: 'crooked', label: 'Làm với kẻ buôn lậu', sub: 'Chắc ăn. Người ta sẽ nhớ.' }],
      apply(S, X, ch, a) {
        if (ch === 'risk') { if (X.chance(G.clamp(.45 + (a.d.ok ? .1 : 0) + pb(a), .1, .9))) { X.money(Math.round(med(S, X) * 4)); return { t: 'Bạn dồn hết vốn, điểm chỉ bằng ngón tay còn run. Ba tháng sau, chuyến hàng về đủ, lãi gấp bốn. Bạn đếm tiền tới nửa đêm, đếm xong lại đếm. Rồi ngồi một mình ngoài hiên, mắt cay cay, không hiểu vì sao.', o: 'rich' }; }
          return { t: 'Bạn dồn hết vốn. Ngày nào cũng ra đầu đường ngóng, một tháng, hai tháng. Chuyến hàng không về. Người bảo thuyền đắm ở khúc sông dữ, người bảo bị cướp, mà biết thế thì cũng chẳng để làm gì.', o: 'ruined' }; }
        if (ch === 'steady') { X.money(Math.round(med(S, X) * 1.2)); X.add('so', 5); return { t: 'Bạn lắc đầu với mối lớn. Phần dư năm ấy bạn chia ra từng gói, đem tới mấy nhà họ hàng nghèo. Có bà cụ trong họ nắm tay bạn mãi không buông. Không giàu nhanh được, nhưng tối ấy bạn ăn cơm thấy ngon.', o: 'steady' }; }
        X.money(Math.round(med(S, X) * 4)); G.trajBump(S, { am: .4 }); return { t: 'Bạn bắt tay kẻ buôn lậu dưới gầm cầu, chỗ không có đèn. Tiền về đều như nước, không cần hỏi từ đâu. Lần đầu tiên nhà bạn có của để dành. Chỉ có điều, đi qua gầm cầu ấy bạn hay ngoái lại.', o: 'crooked' };
      },
      auto: (S, X) => S.traits.bold > .6 ? 'risk' : S.traits.pious < .25 && S.traits.bold > .4 ? 'crooked' : 'steady' },
    after: { rich: (S, X, a) => `Nhà bạn lợp lại mái ngói đỏ, cả xóm ra xem. ${a.d.path === 'land' ? 'Mảnh đất hoang năm nào giờ là thửa ruộng tốt nhất xóm.' : a.d.path === 'trade' ? 'Cái xe muối cũ bạn vẫn giữ, dựng ở góc sân.' : a.d.path === 'venture' ? 'Vết sẹo trên cánh tay từ những chuyến đi liều giờ chỉ còn một vệt trắng.' : 'Mấy vết thước gõ trên mu bàn tay năm nào giờ chỉ còn mờ mờ.'} Bữa cơm có thịt mà không cần đợi Tết. Có những đêm bạn vẫn giật mình dậy đếm tiền, rồi nhớ ra là không cần nữa.`,
      steady: () => 'Trong họ không ai phải đi vay nữa. Tết nào cũng có người tới nhà bạn trước tiên, mang theo con gà, nải chuối. Nhà bạn không giàu. Nhưng gặp chuyện, người ta biết gõ cửa nào.',
      ruined: () => 'Bạn bán bớt đồ đạc, dọn về căn nhà cũ, lại ngồi đếm từng đồng bên ngọn đèn dầu như năm nào. Lần này đếm nhanh hơn, vì chẳng còn bao nhiêu. Bạn tự nhủ: còn người là còn của. Câu ấy nói thì dễ, tin thì khó hơn.',
      crooked: () => 'Nhà bạn giàu lên trông thấy. Hàng xóm vẫn chào, nhưng chào nhỏ hơn trước, và không ai hỏi bạn làm gì. Đêm Tết, bạn ngồi một mình trong căn nhà rộng, nghe tiếng cười từ nhà bên vọng sang.' }
  });
  // Cảnh người nhà trong lúc đi đường thoát nghèo (mở đầu tới thử thách; không sang hồi, góp tiến độ): người ta thoát nghèo là vì ai.
  { const e = { id: 'm_rise_kin', st: TAE, tree: { body: 'living' }, story: { arc: 'm_rise', at: ['open', 'knot', 'trial'], wait: [1, 40] }, w: 1.2,
    run(S, X, a) {
      a.d.prog = prog(a) + 1; const F = S.family, p = kinHome(S), sib = (F.sibs || []).find(s => s.alive), kid = (F.kids || []).length, L = [];
      if (p) L.push(() => { X.money(-Math.round(med(S, X) * .15)); return `${cap(p.role)} dạo này ho nhiều, đêm nào bạn cũng nghe qua vách. Bạn bán con gà mái đẻ, mua mấy thang thuốc, sắc bên bếp tới khuya. Uống xong, ${p.role} cầm tay bạn, dặn đừng vì ${p.role} mà tiêu hết. Bạn gật đầu, rồi sáng mai lại ra chợ bán thêm thứ khác.`; });
      if (sib) L.push(() => { X.money(-Math.round(med(S, X) * .1)); X.add('so', 2); return `${sib.name} tìm tới, ngập ngừng xin vài đồng đóng tiền thầy cho con. Bạn mở hũ, đếm, rồi đưa gấp đôi số được xin. Hai người ngồi uống chén nước chè, nhắc lại mấy năm đói, cười mà mắt cay.`; });
      if (kid) L.push(() => `Đứa con nhỏ hỏi bao giờ nhà mình có mái ngói như nhà bên. Bạn bảo sắp rồi, rồi ra hiên ngồi một mình, nhẩm lại hũ tiền.${F.spouse ? ' Người bạn đời mang ra bát nước, ngồi xuống cạnh, không hỏi gì.' : ''} Đêm ấy bạn thức tới khuya, tính lại từng khoản cho mùa tới.`);
      L.push(() => 'Bạn về thăm nhà cũ, thấy mái tranh lại dột đúng chỗ năm ngoái mới vá. Bạn trèo lên vá lại, ngồi trên mái nhìn xuống cả xóm, thấy nhà nào cũng thấp, cũng cũ như nhà mình. Bạn nghĩ: thoát được thì phải kéo cả xóm theo.');
      return { t: X.pick(L)(), k: 'info', to: null };
    } }; sNode(e); e.gap = 4; }

  // ── Đỉnh cao võ đạo ──
  saga('m_power', {
    nameVi: 'Đỉnh cao võ đạo', pitch: 'Vươn tới bậc chưa ai trong làng đạt.', axes: { vo: .7, phap: .6 }, themes: ['tourney', 'learn', 'teach'], aim: 'martial',
    quest: a => `Vươn tới ${G.tierName(Math.min(5, (a.d.t0 || 0) + 2))}`, good: ['top', 'honor'], marks: { top: 'cao_thu', honor: 'duoc_tin', broken: 'cay_dang' },
    sum: { top: () => 'thắng cao thủ số một một vùng', honor: () => 'thua cao thủ số một mà vẫn được kính trọng', broken: () => 'gãy con đường võ đạo giữa chừng' },
    follow: ['Mọi người nghỉ cả rồi, bạn còn tập thêm một canh giờ.', 'Chiều ấy bạn lại ra bãi tập, như mọi chiều.', 'Bạn nghĩ: với người muốn mạnh, việc gì cũng là bài tập, kể cả việc này.'],
    beat: { any: ['Bạn tập ở bãi đất sau làng tới khi trời tối hẳn, chỉ còn nghe tiếng mình thở. Cái cọc gỗ trước mặt đã mòn một khoảng bằng nắm tay.', 'Mưa như trút, bạn vẫn đứng tấn giữa sân, đếm từng hơi thở. Nước chảy vào mắt, bạn không chớp. Tới hơi thở thứ một nghìn, bạn mới cho mình hạ tay.', 'Ai cầm vũ khí đi ngang làng cũng bị bạn xin đấu tập một trận. Phần nhiều bạn thua. Mỗi trận thua, bạn nhớ thêm được một thế.'] },
    open: (S, X, a) => { a.d.t0 = X.ctier(S); return `${lead(S, a)}Bạn khắc lên cột nhà một vạch ngang tầm mắt. Bạn tự hứa: một ngày mình sẽ đứng ở chỗ những ${tierUp(S, X, 2)} đứng. Sáng nào ra khỏi nhà, bạn cũng chạm tay vào vạch ấy một cái.`; },
    knot: { title: 'Đường tu luyện', body: () => 'Muốn lên cao phải chọn một con đường; không ai đi được cả ba. Thầy giỏi thì tốn tiền. Đường tỉ thí thì tốn máu. Tự luyện thì tốn cả đời.',
      choices: (S, X) => [{ k: 'master', label: 'Tìm thầy cao tay', sub: `Tốn chừng ${G.coin(Math.round(med(S, X)))}; học chắc.` }, { k: 'roam', label: 'Đi khắp nơi tỉ thí', sub: 'Nổi tiếng nhanh, dễ bị thương.' }, { k: 'alone', label: 'Tự luyện một mình', sub: 'Chậm, nhưng là đường của riêng bạn.' }],
      apply(S, X, ch) { if (ch === 'master') { X.money(-Math.round(med(S, X))); X.gain(bestSk(S), 6); return 'Bạn đi ba ngày đường tới nhà một cao thủ về hưu, quỳ ngoài cổng từ sáng tới tối. Hôm thứ hai trời mưa, bạn vẫn quỳ. Tối ấy cổng mở, ông lão ném ra một cái chổi, bảo quét sân trước đã.'; }
        if (ch === 'roam') { S.fame += 3; X.add('hl', -5); G.trajBump(S, { du: .4 }); return 'Bạn vác vũ khí lên vai, đi từ bãi tập làng này sang bãi tập làng khác. Thắng thì được bữa cơm, thua thì được vài vết bầm. Tới đâu người ta cũng bắt đầu hỏi tên bạn.'; }
        X.add('sm', 4); X.gain(bestSk(S), 4); return 'Bạn dựng một túp lều trên núi, mỗi ngày chỉ xuống chợ một lần mua muối gạo. Không ai sửa thế đánh cho bạn, bạn nhìn bóng mình trên vách đá mà tự sửa. Đêm trên núi lạnh và dài. Bạn quen dần với chuyện chỉ có mình mình.'; },
      auto: (S, X) => S.gold > med(S, X) * 1.5 ? 'master' : S.traits.bold > .6 ? 'roam' : 'alone' },
    trial: { base: (S, X, a) => .4 + (X.ctier(S) > (a.d.t0 || 0) ? .3 : 0),
      run: (S, X, a, ok) => ok ? (S.fame += 3, `Ở đại hội võ của vùng, bạn vào tới trận cuối. ${a.d.path === 'master' ? 'Thầy bạn ngồi hàng ghế đầu, không nói gì, chỉ gật đầu một cái.' : a.d.path === 'roam' ? 'Mấy người từng đấu với bạn ở các làng kéo nhau tới cổ vũ, hò hét khản cả cổ.' : 'Không ai biết bạn từ đâu tới; bạn xuống núi chỉ cho mấy trận này.'} Trận cuối thắng thua ra sao, về sau ít ai nhớ. Người ta chỉ nhớ cái tên, và bắt đầu nhắc nó.`)
        : (X.add('hl', -8), `Ở đại hội võ của vùng, bạn bị loại ngay vòng đầu bởi một đứa trẻ hơn bạn mười tuổi. Nó cúi chào lễ phép, rồi đánh bạn ngã trong ba chiêu. Đám đông cười ồ. Đêm ấy bạn ngồi một mình ở bãi tập, tới sáng vẫn chưa về.`) },
    climax: { title: 'Cao thủ số một', body: (S, X, a) => `Cao thủ số một của vùng nhận lời thách đấu. Thắng thì cả vùng biết tên bạn; thua thì cả vùng cũng biết. ${a.d.ok ? 'Năm đại hội ấy ông ta có mặt, đã thấy bạn đánh.' : 'Ông ta chưa từng nghe tên bạn, và nói thẳng như thế.'}`,
      choices: (S, X, a) => [{ k: 'duel', label: 'Ra đấu', sub: `Chừng ${Math.round(odds(S, X, .35 + (a.d.ok ? .15 : 0) + pb(a)) * 100)}% thắng.` },
        { k: 'teach', label: 'Thôi tranh, đem sở học dạy lại', sub: 'Không ai thua.' }, { k: 'secret', label: 'Luyện cấm pháp để thắng chắc', sub: 'Thắng, nhưng khí huyết có thể loạn.' }],
      apply(S, X, ch, a) {
        if (ch === 'duel') { if (X.chance(odds(S, X, .35 + (a.d.ok ? .15 : 0) + pb(a)))) { S.fame += 8; X.gain(bestSk(S), 8); return { t: 'Trận đấu kéo dài từ trưa tới khi mặt trời lặn, quanh sân không ai chịu bỏ về. Tới hiệp cuối, hai người đều thở như kéo bễ. Người ngã xuống không phải bạn. Bạn đứng đó, vũ khí trĩu xuống, mãi mới nghe ra tiếng hò reo.', o: 'top' }; }
          X.add('hl', -15); return prog(a) >= 6 ? { t: 'Bạn thua sau một trận dài, thua từng chút một, không chịu lùi. Cao thủ đỡ bạn dậy. Rồi trước cả đám đông, ông cúi đầu chào bạn, thật thấp.', o: 'honor' } : { t: 'Bạn thua sau ba hiệp. Đòn cuối đánh trúng cổ tay, nghe một tiếng rắc khô. Thầy thuốc nắn mấy tuần, mà tay cầm vũ khí của bạn không bao giờ thẳng lại được nữa.', o: 'broken' }; }
        if (ch === 'teach') { X.add('so', 6); return { t: 'Bạn gác vũ khí, mở một bãi tập cho bọn trẻ trong làng. Sáng sáng chúng xếp hàng, đứa cao đứa thấp, hét theo từng thế bạn hô. Trận đấu với cao thủ số một không bao giờ diễn ra. Bạn thấy không cần nữa.', o: 'honor' }; }
        X.cond('qi'); S.fame += 6; return { t: 'Bạn luyện cấm pháp ba tháng trong hang, không cho ai lại gần. Hôm đấu, bạn thắng trong ba chiêu, nhanh tới mức đám đông chưa kịp hò. Nhưng từ đó đêm nào khí huyết cũng sôi lên trong ngực, như có con thú bị nhốt trong ấy.', o: 'top' };
      },
      auto: (S, X) => S.traits.bold > .5 ? 'duel' : S.traits.social > .55 ? 'teach' : 'duel' },
    after: { top: () => 'Tên bạn được khắc lên cột đá ở bãi tập lớn, ngay dưới tên những người đời trước. Trẻ con trong vùng tập theo thế đánh của bạn, sai cả những chỗ bạn hay đánh sai. Về nhà, bạn đứng trước cột, nhìn vạch khắc năm xưa. Nó thấp hơn bạn tưởng.',
      honor: () => 'Người ta gọi bạn là thầy, dù bạn chưa nhận ai làm học trò. Đi đâu cũng có người xin chỉ cho một thế. Bạn chỉ, rồi dặn: tập đi, tập tới khi tay rớm máu thì tập tiếp.',
      broken: () => 'Bạn treo vũ khí lên vách. Có những đêm bạn vẫn lấy xuống, lau thật kỹ, rồi treo lại chỗ cũ. Ngoài bãi tập bọn trẻ vẫn hò hét. Bạn đóng cửa sổ.' }
  });

  // ── Tác phẩm đời người ──
  saga('m_craft', {
    nameVi: 'Tác phẩm đời người', pitch: 'Làm ra một tác phẩm mang tên mình.', axes: { nghe: 1, tri: .5 }, themes: ['learn', 'teach'], aim: 'scholar',
    quest: () => 'Làm ra một tác phẩm mang tên mình', good: ['work', 'school'], marks: { work: 'danh_tho', school: 'chan_truyen', fail: 'cay_dang' },
    sum: { work: () => 'làm ra một tác phẩm người ta còn nhắc', school: () => 'truyền trọn tay nghề cho lớp sau', fail: () => 'dồn nửa đời vào một tác phẩm không thành' },
    follow: ['Đêm ấy bạn lại ngồi bên bàn thợ tới khuya, đèn tắt lúc nào không hay.', 'Đôi tay bạn khéo thêm một chút, chỉ mình bạn biết.', 'Cả lúc ăn bạn cũng nghĩ tới tác phẩm của mình, đũa dừng giữa chừng.'],
    beat: { any: ['Bạn làm hỏng cái thứ mười, ném vào góc, rồi ngồi làm cái thứ mười một. Góc xưởng chất đống đồ hỏng, mỗi năm cao thêm một chút.', 'Bạn ngồi cả buổi chỉ để nhìn thợ cả làm một mối nối. Ông làm nhanh như không cần nghĩ. Bạn biết mình còn xa.', 'Bạn thức tới khuya sửa một chi tiết ở mặt trong, chỗ không ai nhìn thấy. Bạn biết nó ở đó. Thế là đủ.'] },
    open: (S, X, a) => `${lead(S, a)}Bạn đứng rất lâu trước món đồ đẹp nhất làng, ngắm từng đường nét. Rồi bạn nghĩ: mình làm được đẹp hơn. Ý nghĩ ấy làm bạn sợ, mà cũng làm bạn vui. Từ hôm ấy tay bạn không chịu để rảnh.`,
    knot: { title: 'Lối làm nghề', body: () => 'Thợ lớn nào cũng tới lúc phải chọn: theo lối thầy, tìm lối mới, hay đi tìm thứ vật liệu chưa ai dùng. Lối nào cũng có người đi rồi bỏ dở. Bạn cầm cái đục trong tay, nghĩ suốt một đêm.',
      choices: () => [{ k: 'old', label: 'Theo lối thầy', sub: 'Chắc tay, ít bất ngờ.' }, { k: 'new', label: 'Tìm lối mới', sub: 'Có thể hỏng nhiều.' }, { k: 'rare', label: 'Đi tìm vật liệu hiếm', sub: 'Đường xa, có quái.' }],
      apply(S, X, ch) { if (ch === 'old') { X.gain('Engineering', 5); return 'Bạn chép lại từng bản vẽ của thầy, làm theo không sai một nét. Có hôm thầy đứng sau lưng xem, lâu thật lâu, rồi đi mà không nói gì. Với thầy, thế đã là khen.'; }
        if (ch === 'new') { X.add('sm', 5); return 'Bạn đốt hết bản vẽ cũ, ngồi trước một tờ giấy trắng. Tờ giấy để trắng cả tuần. Rồi một đêm bạn vẽ một nét, xóa đi, vẽ lại, tới sáng đã kín cả mặt giấy.'; }
        X.add('hl', -6); G.trajBump(S, { du: .3 }); return 'Bạn vào núi tìm loại đá người ta chỉ còn nhắc trong chuyện kể. Dốc đá trơn, đêm có tiếng thú gầm. Lần đầu về tay trắng, lần thứ hai cũng thế, nhưng lần nào bạn cũng biết thêm một khe núi.'; },
      auto: S => S.traits.studious > .6 ? 'new' : S.traits.bold > .6 ? 'rare' : 'old' },
    trial: { base: S => .45 + Math.min(.25, (S.mastery.Engineering || 0) / 200),
      run: (S, X, a, ok) => ok ? (X.gain('Engineering', 3), `Mẻ thử đầu tiên ra lò còn nóng hổi. ${a.d.path === 'new' ? 'Chưa ai trong xưởng thấy kiểu này bao giờ. ' : a.d.path === 'rare' ? 'Thứ đá mang từ núi về ánh lên như có nước bên trong. ' : ''}Thợ cả cầm lên xem, xoay đi xoay lại dưới nắng. Rồi ông lặng lẽ đặt nó vào chỗ trưng bày, cạnh đồ của chính ông. Cả buổi chiều bạn không dám đi ngang chỗ ấy, sợ nhìn lại sẽ thấy nó xấu đi.`)
        : 'Mẻ thử đầu tiên vừa ra lò đã nứt làm đôi, ngay trước mặt cả xưởng. Tiếng nứt nhỏ thôi mà ai cũng nghe. Không ai cười, thế còn khó chịu hơn. Bạn nhặt hai mảnh vỡ, cất vào hộc bàn.' },
    climax: { title: 'Tác phẩm', body: () => 'Bạn đã sẵn sàng làm tác phẩm của đời mình. Nhưng tiền thì không đủ, thời gian không chờ ai, mấy đứa học nghề vẫn đứng ngoài cửa xưởng chờ được dạy. Một đời người có lẽ chỉ đủ cho một trong ba thứ.',
      choices: (S, X, a) => [{ k: 'masterpiece', label: 'Dồn hết vào một tác phẩm', sub: `Chừng ${Math.round(G.clamp(.4 + (a.d.ok ? .15 : 0) + pb(a), .1, .9) * 100)}% thành.` },
        { k: 'patron', label: 'Làm theo đơn của nhà quyền thế', sub: 'Chắc tiền, tác phẩm mang tên người đặt.' }, { k: 'teach', label: 'Dạy lại cho lớp sau', sub: 'Tác phẩm là những người thợ bạn để lại.' }],
      apply(S, X, ch, a) {
        if (ch === 'masterpiece') { if (X.chance(G.clamp(.4 + (a.d.ok ? .15 : 0) + pb(a), .1, .9))) { S.fame += 8; S.gear = Math.min(10, S.gear + 2); return { t: 'Bạn khóa cửa xưởng một mùa, ăn ngủ cạnh bàn thợ. Ngày mở cửa, người ta xếp hàng tới đầu ngõ để xem. Có ông lão đứng trước tác phẩm rất lâu, rồi đưa tay áo lên lau mắt. Bạn đứng trong góc, tay vẫn còn vết chai mới.', o: 'work' }; }
          X.add('h', -10); return { t: `Bạn khóa cửa xưởng một mùa, ăn ngủ cạnh bàn thợ. Ngày mở cửa, bạn nhìn nó lần cuối, rồi đập vỡ trước khi ai kịp thấy. Người ngoài chỉ nghe một tiếng choang. Bạn quét mảnh vỡ, cất vào hộc bàn${a.d.ok ? '' : ', cạnh hai mảnh vỡ năm nào'}.`, o: 'fail' }; }
        if (ch === 'patron') { X.money(Math.round(med(S, X) * 3)); S.fame += 3; return { t: 'Tác phẩm được đặt giữa sảnh chính nhà quyền thế. Dưới chân nó khắc tên người đặt, chữ to, mạ vàng. Tên bạn khắc nhỏ hơn, bên cạnh, phải cúi xuống mới đọc được. Tiền công thì đủ cho cả nhà sống mấy năm.', o: 'work' }; }
        X.add('so', 6); return { t: 'Bạn nhận ba người học việc. Mọi thứ bạn biết, bạn dạy hết, không giấu một mẹo nào. Tối tối xưởng sáng đèn, tiếng đục gõ đều. Tác phẩm của đời bạn, có lẽ, là ba người này.', o: 'school' };
      },
      auto: S => S.traits.social > .6 ? 'teach' : S.traits.bold > .5 ? 'masterpiece' : 'patron' },
    after: { work: () => 'Mấy chục năm sau, người ta vẫn chỉ vào tác phẩm ấy và nói: của thợ này đấy. Người nói chưa chắc đã biết mặt bạn. Bạn đi ngang, nghe, không nhận. Về nhà, bạn ngồi bên bàn thợ thêm một lúc rồi mới đi ngủ.',
      school: () => 'Ba người học việc năm nào giờ đều có xưởng riêng. Đồ họ làm có một mối nối giống hệt của bạn, nhìn là biết. Tết nào ba người cũng về, ngồi quanh bàn thợ cũ của bạn mà uống rượu.',
      fail: () => 'Bạn vẫn làm nghề, làm đều tay, đồ bán được. Nhưng không bao giờ bạn nhắc tới mùa khóa cửa ấy. Mấy mảnh vỡ trong hộc bàn, bạn chưa vứt.' }
  });

  // ── Người đứng đầu ──
  saga('m_lead', {
    nameVi: 'Người đứng đầu', pitch: 'Đứng ra gánh việc chung cho làng, cho tộc.', axes: { quyen: 1, gia: .5 }, themes: ['tax', 'war'], aim: 'power',
    quest: () => 'Đứng ra gánh việc chung', good: ['chosen', 'step'], marks: { chosen: 'nguoi_dung_dau', rule: 'ke_tiem_quyen', step: 'duoc_tin' },
    sum: { chosen: () => 'được dân bầu làm người đứng đầu', rule: () => 'giành lấy ghế đứng đầu bằng sức', step: () => 'nhường ghế cho người trẻ khi đang được tin' },
    follow: ['Người ta bắt đầu hỏi ý bạn trước khi làm. Bạn chưa quen, nhưng không từ chối.', 'Ai giúp, ai đứng ngoài, bạn đều nhớ cả.', 'Chuyện chung của làng giờ cũng thành chuyện của bạn, đêm nằm vẫn nghĩ.'],
    beat: { any: ['Hai nhà tranh nhau con mương, cãi tới mức vác cuốc ra đầu ngõ. Bạn đứng giữa, nghe cả hai nói hết, rồi chia nước theo ngày chẵn ngày lẻ. Không ai vui hẳn, nhưng cũng không ai về tay trắng.', 'Bạn đi từng nhà hỏi chuyện mùa màng, ngồi xuống chõng tre uống bát nước chè. Nhà thì kể chuyện con ốm, nhà kể chuyện nợ. Bạn nhớ hết.', 'Bạn ngồi nghe các bô lão bàn việc tới khuya, ít khi mở miệng. Lúc về, cụ già nhất làng vỗ vai bạn một cái.'] },
    open: (S, X, a) => `${lead(S, a)}Năm ấy làng gặp chuyện mà không ai đứng ra, người nọ nhìn người kia. Bạn đứng ra. Chính bạn cũng không biết mình lấy can đảm từ đâu. Từ hôm đó, người ta nhìn bạn khác đi.`,
    knot: { title: 'Cách gây dựng', body: () => 'Muốn đứng đầu phải có người theo. Có người theo vì thương, có người theo vì tiền, có người theo vì sợ. Bạn muốn người ta theo mình vì lẽ nào?',
      choices: () => [{ k: 'serve', label: 'Lo việc nhỏ cho làng', sub: 'Chậm mà chắc.' }, { k: 'ally', label: 'Kết thân với nhà giàu', sub: 'Có tiền, mất lòng dân nghèo.' }, { k: 'fear', label: 'Dựa vào sức, dẹp kẻ cản', sub: 'Nhanh, để lại thù.' }],
      apply(S, X, ch) { if (ch === 'serve') { X.add('so', 5); return 'Bạn sửa đường, đắp đê, đi nhờ từng nhà góp một ngày công. Nhà nào không có người thì bạn làm thay phần. Hết mùa, con đê mới chạy dài ra tới bãi sông, và người ta bắt đầu hỏi bạn việc tiếp theo là gì.'; }
        if (ch === 'ally') { X.money(Math.round(med(S, X) * .8)); X.add('so', -2); return 'Bạn ngồi chung mâm với các nhà giàu nhất vùng, rượu ngon, thịt béo. Họ vỗ vai bạn, hứa sẽ đứng sau. Lúc về đi ngang xóm nghèo, có người nhìn bạn rồi quay mặt đi.'; }
        G.trajBump(S, { am: .3, vo: .3 }); X.add('so', -3); return 'Bạn gom đám thanh niên khỏe nhất làng theo mình, cho ăn, cho tiền rượu. Ai cản đường thì gặp họ ở ngõ tối. Chuyện ấy chỉ cần xảy ra hai lần, cả làng đã hiểu.'; },
      auto: S => S.traits.social > .5 ? 'serve' : S.traits.bold > .65 ? 'fear' : 'ally' },
    trial: { base: (S, X, a) => .45 + (a.d.path === 'serve' ? .15 : 0) + G.clamp((S.so - 50) / 200, -.1, .15),
      run: (S, X, a, ok) => ok ? (X.add('so', 6), 'Năm ấy đói, cả vùng ăn cháo rau. Bạn mở kho chung, chia lúa theo đầu người, nhà nào cũng như nhà nào. Ngày nào bạn cũng đứng ở cửa kho tới tối. Qua mùa giáp hạt, không nhà nào chết đói.')
        : (X.add('so', -6), `Năm ấy đói. Kho chung bị phá trong một đêm, lúa mất gần sạch. Sáng ra người làng đứng kín sân đình, hỏi bạn ở đâu lúc ấy.${a.d.path === 'ally' ? ' Có người nói to: chắc đang ăn cỗ ở nhà giàu.' : ''} Bạn không trả lời được.`) },
    climax: { title: 'Ghế đứng đầu', body: () => 'Người đứng đầu cũ đã già, đi phải chống gậy. Cả làng đang chờ xem ai thay. Lúc bạn đi qua chợ, có người dừng tay nhìn theo.',
      choices: (S, X, a) => [{ k: 'ballot', label: 'Để dân bầu', sub: `Chừng ${Math.round(G.clamp(.5 + (a.d.ok ? .2 : 0) + pb(a) + (S.so - 50) / 150, .1, .9) * 100)}% được chọn.` },
        { k: 'take', label: 'Giành lấy', sub: 'Chắc được ghế. Người ta sẽ nhớ cách bạn ngồi lên.' }, { k: 'step', label: 'Nhường cho người trẻ', sub: 'Ở lại làm người được hỏi ý.' }],
      apply(S, X, ch, a) {
        if (ch === 'ballot') { if (X.chance(G.clamp(.5 + (a.d.ok ? .2 : 0) + pb(a) + (S.so - 50) / 150, .1, .9))) { S.fame += 6; return { t: 'Người ta bỏ phiếu bằng hạt đậu, mỗi người một hạt, thả vào hũ của người mình chọn. Hũ của bạn đầy tràn, hạt rơi cả ra chiếu. Bà cụ bán nước cuối chợ cũng chống gậy tới bỏ một hạt. Bạn nhặt hạt rơi ấy, giữ trong túi áo nhiều năm.', o: 'chosen' }; }
          X.add('h', -6); return { t: 'Hũ đậu của bạn vơi hơn hũ bên kia một nắm. Chỉ một nắm. Bạn đứng dậy bắt tay người thắng trước cả làng, giọng không run. Tối về, bạn ngồi nhớ lại những gương mặt đã không chọn mình, rồi thôi.', o: 'step' }; }
        if (ch === 'take') { S.fame += 4; return { t: 'Sáng hôm bầu, đám thanh niên của bạn đứng kín cửa đình, tay khoanh trước ngực. Người làng đi vào, cúi đầu, bỏ hạt đậu vào đúng một hũ. Không ai nói gì. Bạn ngồi lên ghế, nghe nó kêu cót két, như cũng không bằng lòng.', o: 'rule' }; }
        X.add('so', 6); return { t: 'Bạn đứng lên giữa đình, chỉ vào một người trẻ và nói: người này làm tốt hơn tôi. Cả đình im lặng một lúc, rồi có tiếng vỗ tay. Người trẻ đỏ mặt. Bạn ngồi xuống, thấy vai mình nhẹ hẳn.', o: 'step' };
      },
      auto: S => S.traits.bold > .7 && S.traits.social < .35 ? 'take' : S.traits.social > .7 ? 'step' : 'ballot' },
    after: { chosen: () => 'Bạn ngồi ghế đứng đầu nhiều năm. Có những việc làm sai, có những mùa người ta trách. Nhưng không ai nói bạn bỏ làng. Lúc tóc đã bạc, bạn vẫn đi từng nhà hỏi chuyện mùa màng như hồi còn trẻ.',
      rule: () => 'Bạn giữ ghế tới khi già. Người ta nghe lời bạn, làm đúng từng chữ. Nhưng không ai mời bạn ăn cỗ. Đám thanh niên năm nào giờ cũng chỉ còn một hai người lui tới.',
      step: () => 'Người trẻ làm tốt, có phần tốt hơn bạn nghĩ. Năm nào có chuyện lớn, họ vẫn tới hỏi bạn trước, ngồi ở hiên nhà, rót nước cho bạn. Bạn nói ít, nghe nhiều.' }
  });

  // ── Con đường đức tin ──
  saga('m_faith', {
    nameVi: 'Con đường đức tin', pitch: 'Đi tới cùng con đường của đạo mình theo.', axes: { dao: 1 }, themes: ['faith'], aim: 'faith', need: S => !!S.faith,
    quest: a => `Đi tới cùng ${a.d.fv || 'đạo của mình'}`, good: ['saint', 'teacher'], marks: { saint: 'nguoi_moc_dao', teacher: 'nguoi_moc_dao', left: 'bo_dao' },
    sum: { saint: d => `đứng ra che chở tín đồ ${d.fv || ''} giữa lúc nguy`.trim(), teacher: d => `đi giảng ${d.fv || 'đạo'} tới những nơi chưa ai nghe`, left: d => `bỏ ${d.fv || 'đạo cũ'} sau nửa đời tin theo` },
    follow: ['Tối ấy bạn đọc thêm một đoạn kinh rồi mới đi ngủ.', 'Bạn thấy đạo của mình cả trong chuyện nhỏ nhất.', 'Trước khi ngủ, bạn cầu cho những người đã gặp hôm ấy, từng người một.'],
    beat: { any: ['Bạn quỳ trong đền tới khi chân tê dại, đứng dậy phải vịn cột. Ngoài sân, chim sẻ nhặt mấy hạt gạo người ta cúng.', 'Bạn chép kinh dưới ánh đèn dầu, chữ nhỏ, đều, không sai một nét. Chép xong một quyển, bạn đem tặng nhà nghèo nhất xóm.', 'Bạn đi thăm người ốm trong làng, mang theo bình nước thánh và mấy củ gừng. Có người khỏi, có người không. Bạn cầu cho cả hai.'] },
    open: (S, X, a) => { a.d.fv = S.faith && J.faiths[S.faith] ? J.faiths[S.faith].nameVi : 'đạo của mình'; return `${lead(S, a)}Một đêm bạn tỉnh dậy giữa canh ba, lòng yên như mặt hồ không gió. Không có tiếng nói nào, cũng không có ánh sáng nào. Chỉ là bạn biết: từ nay đời mình sẽ đi theo ${a.d.fv}.`; },
    knot: { title: 'Cách hành đạo', body: (S, X, a) => `Theo ${a.d.fv}, có nhiều đường để đi. Người thì đi xa tìm đền tổ, người ở lại phục dịch, người đọc cả kinh của đạo khác. Bạn chọn đường nào?`,
      choices: () => [{ k: 'pilgrim', label: 'Đi hành hương', sub: 'Tới đền tổ, đường xa.' }, { k: 'temple', label: 'Vào đền phục dịch', sub: 'Đời giản đơn, gần người tu.' }, { k: 'seek', label: 'Tự tìm lời giải', sub: 'Đọc cả kinh của đạo khác.' }],
      apply(S, X, ch) { if (ch === 'pilgrim') { S.devotion = Math.min(100, S.devotion + 10); G.trajBump(S, { du: .3 }); return 'Bạn đi bộ ba tháng tới đền tổ, ngủ ngoài hiên cùng trăm người lạ. Đôi dép rách ở tháng thứ hai, bạn đi chân đất. Tới nơi, đứng trước bậc đá mòn vẹt vì bao nhiêu bàn chân, bạn quỳ xuống, không nói được câu nào.'; }
        if (ch === 'temple') { S.devotion = Math.min(100, S.devotion + 8); X.add('so', 3); return 'Bạn vào đền phục dịch. Sáng quét sân, tối thắp đèn, giữa trưa ngồi nghe các thầy giảng. Đời giản đơn tới mức có lúc bạn quên hôm nay là ngày gì. Bạn chưa bao giờ ngủ ngon như thế.'; }
        X.add('sm', 6); return 'Bạn đi khắp các đền trong vùng, nghe mọi đạo giảng, đọc cả những cuốn kinh người ta bảo đừng đọc. Có thầy đuổi bạn ra. Có thầy giữ bạn lại ăn cơm. Câu hỏi trong lòng bạn không nhỏ đi, chỉ rõ hơn.'; },
      auto: S => S.traits.bold > .6 ? 'pilgrim' : S.traits.studious > .6 ? 'seek' : 'temple' },
    trial: { base: S => .3 + S.devotion / 200,
      run: (S, X, a, ok) => ok ? (S.devotion = Math.min(100, S.devotion + 8), 'Năm ấy dịch về làng. Người khỏe bỏ đi, nhà nhà đóng cửa. Bạn ở lại chăm người bệnh, đút cháo, lau mình, đêm ngủ cạnh giường bệnh. Bạn không nhiễm bệnh. Người ta bảo đó là phép của đạo; bạn chỉ biết mình đã không bỏ đi.')
        : (S.devotion = Math.max(0, S.devotion - 10), 'Năm ấy dịch về làng. Bạn cầu nguyện ngày đêm, quỳ tới sờn cả gối quần, mà người bệnh vẫn chết, từng người một. Đêm chôn người cuối cùng, bạn ngồi trước bàn thờ rất lâu. Lần đầu tiên, bạn nghi ngờ.') },
    climax: { title: 'Thử thách của đức tin', body: (S, X, a) => `Kẻ có quyền trong vùng ra lệnh cấm ${a.d.fv}. Lính đi từng nhà, gỡ biểu tượng của đạo trên vách xuống. Tín đồ đang chờ xem người như bạn làm gì.`,
      choices: () => [{ k: 'stand', label: 'Đứng ra che chở tín đồ', sub: 'Có thể bị đánh, bị giam.' }, { k: 'preach', label: 'Đi giảng ở nơi khác', sub: 'Mang đạo tới chỗ chưa ai nghe.' }, { k: 'leave', label: 'Bỏ đạo', sub: 'Giữ mạng, mất chỗ dựa.' }],
      apply(S, X, ch, a) {
        if (ch === 'stand') { X.add('hl', -12); S.devotion = Math.min(100, S.devotion + 15); S.fame += 5; return { t: 'Bạn đứng chắn trước cửa đền, hai tay dang ra. Lính đánh bạn gãy hai xương sườn, bạn ngã xuống rồi lại đứng lên. Sau lưng bạn, đám đông bắt đầu hát kinh, mỗi lúc một to. Cuối cùng lính bỏ đi.', o: 'saint' }; }
        if (ch === 'preach') { S.devotion = Math.min(100, S.devotion + 8); G.trajBump(S, { du: .3 }); return { t: 'Bạn khoác áo đi đường, mang theo cuốn kinh và một túi bánh khô. Lúc ra khỏi làng trời còn tối. Mấy tín đồ ra tiễn, dúi vào tay bạn nắm gạo. Bạn đi về phía những nơi chưa ai nghe tới tên đạo mình.', o: 'teacher' }; }
        S.devotion = 0; X.add('h', -8); return { t: 'Bạn cởi bỏ biểu tượng của đạo, đặt nó lên bậc đền rồi đi, không ngoái lại. Đi được một quãng, bạn mới thấy tay mình run. Đêm ấy là đêm đầu tiên trong nhiều năm bạn không cầu nguyện trước khi ngủ.', o: 'left' };
      },
      auto: S => S.traits.pious > .6 && S.traits.bold > .4 ? 'stand' : S.traits.pious < .3 ? 'leave' : 'preach' },
    after: { saint: (S, X, a) => `Lệnh cấm được bỏ sau hai mùa. Ở đền bây giờ có một chỗ ngồi người ta để dành cho bạn, không ai ngồi vào. Mỗi lần trời trở, chỗ xương sườn gãy năm xưa lại nhói lên. Bạn coi đó như một lời nhắc.`,
      teacher: (S, X, a) => `Ở ba làng xa, giờ có người theo ${a.d.fv} vì đã nghe bạn giảng. Thỉnh thoảng có thư từ đó gửi về, chữ xiêu vẹo, kể chuyện mùa màng, chuyện con cái. Bạn đọc từng lá, rồi kẹp vào trong cuốn kinh.`,
      left: () => 'Bạn sống tiếp như mọi người, làm lụng, đi chợ, cười nói. Có những sáng bạn vẫn quay về phía đền, tay chực chắp lại, rồi sực nhớ ra. Bạn buông tay xuống, đi tiếp.' }
  });

  // ── Chân trời ──
  saga('m_road', {
    nameVi: 'Chân trời', pitch: 'Đi tới nơi xa nhất từng nghe kể.', axes: { du: 1 }, themes: ['treasure', 'companion'], aim: 'adventure',
    quest: () => 'Đi tới nơi xa nhất từng nghe kể', good: ['beyond', 'settle', 'home'], marks: { beyond: 'ke_di_xa', settle: 'que_moi', home: 'ke_di_xa', lost: 'cay_dang' },
    sum: { beyond: () => 'đi tới tận bên kia vùng đất chết', settle: () => 'tìm được một vùng đất để gọi là quê', home: () => 'đi xa rồi về kể chuyện cho cả làng nghe', lost: () => 'lạc giữa đường đi tìm chân trời' },
    follow: ['Tối ấy bạn đánh dấu thêm một chỗ lên tấm bản đồ tự vẽ.', 'Bạn hỏi người lạ về con đường phía trước, nghe xong thì gật gù.', 'Bạn nghĩ: chuyện này để dành, khi về sẽ kể.'],
    beat: { any: ['Bạn ngồi ở ngã ba đường nhìn đoàn buôn đi qua, đếm từng cỗ xe. Bụi đường bám đầy tóc. Đoàn khuất hẳn rồi bạn vẫn ngồi đó.', 'Một lữ khách ghé nghỉ chân, bạn mời bát nước rồi ngồi nghe kể. Đêm ấy bạn vẽ lại bản đồ theo lời ông, thêm một con sông, bớt một ngọn núi.', 'Cái túi đồ gói sẵn vẫn để cạnh cửa, lâu tới mức đã bám bụi. Mỗi lần đi qua bạn lại phủi nó một cái.'] },
    open: (S, X, a) => `${lead(S, a)}Một lữ khách ghé làng, kể về một vùng đất ở cuối đường, nơi chưa ai trong làng đặt chân tới. Ông kể chuyện biển, chuyện những thành phố có tường bằng đá trắng. Sáng hôm sau ông đi. Còn bạn thì từ đêm ấy ngủ không yên.`,
    knot: { title: 'Lên đường', body: () => 'Muốn đi xa thì có ba cách. Theo đoàn buôn thì chậm, đi biển thì nhanh mà dữ, còn tấm bản đồ cũ ở chợ phiên thì chưa biết thật hay giả. Cái túi đồ cạnh cửa đã sẵn.',
      choices: () => [{ k: 'map', label: 'Theo tấm bản đồ cũ', sub: 'Có thể là đồ giả.' }, { k: 'sea', label: 'Xin lên một con tàu', sub: 'Biển không thương ai.' }, { k: 'caravan', label: 'Theo đoàn buôn', sub: 'Chậm, an toàn hơn.' }],
      apply(S, X, ch) { cnt(S, 'trips'); if (ch === 'map') { X.add('sm', 3); return 'Bạn đổi một tháng công lấy tấm bản đồ vẽ trên da dê, mép đã sờn, mực đã phai. Người bán thề nó là thật. Bạn không tin hẳn, nhưng đêm nào cũng trải nó ra dưới đèn mà nhìn.'; }
        if (ch === 'sea') { X.gain('Spear', 2); return 'Bạn xin làm thủy thủ không công, đổi lấy một chỗ nằm dưới khoang. Ba ngày đầu bạn nôn tới mật xanh. Sang ngày thứ tư, đứng trên boong nhìn bờ khuất dần, bạn bỗng thấy người nhẹ hẫng.'; }
        X.money(Math.round(med(S, X) * .3)); return 'Bạn theo đoàn buôn làm người khuân vác, ngủ dưới gầm xe, ăn cơm sau cùng. Lão chủ đoàn khó tính nhưng trả công sòng phẳng. Tiếng lục lạc lừa đưa bạn qua hết làng này tới làng khác.'; },
      auto: S => S.traits.bold > .65 ? 'sea' : S.traits.studious > .55 ? 'map' : 'caravan' },
    trial: { base: S => .45 + S.traits.bold * .2,
      run: (S, X, a, ok) => { cnt(S, 'trips'); return ok ? (X.add('sm', 5), 'Bạn qua ba vùng, mỗi vùng một thứ tiếng, một kiểu nấu canh. Tới đâu bạn cũng học cách chào hỏi trước tiên. Sang vùng thứ ba, bạn chào được bằng cả ba thứ tiếng, và người ta cười với bạn như người quen.')
        : (X.add('hl', -10), 'Giữa đường bạn ốm một trận nặng, sốt li bì. Bạn nằm ba tuần ở một quán trọ không ai biết tên mình. Bà chủ quán ngày nào cũng đặt một bát cháo ở đầu giường, không hỏi han gì. Khỏi bệnh, bạn trả tiền rồi đi tiếp, chân còn lảo đảo.'); } },
    climax: { title: 'Cuối đường', body: () => 'Trước mặt bạn là vùng đất chết người ta đồn: đá xám, không một cái cây, gió rít suốt ngày đêm. Bên kia là chỗ lữ khách năm nào kể. Sau lưng là cả quãng đường bạn đã đi.',
      choices: (S, X, a) => [{ k: 'beyond', label: 'Vượt qua', sub: `Chừng ${Math.round(odds(S, X, .45 + (a.d.ok ? .1 : 0) + pb(a)) * 100)}% qua được.` },
        { k: 'settle', label: 'Dừng ở nơi đẹp nhất đã qua', sub: 'Dựng nhà ở đó.' }, { k: 'home', label: 'Quay về', sub: 'Mang chuyện về cho làng.' }],
      apply(S, X, ch, a) {
        if (ch === 'beyond') { if (X.chance(odds(S, X, .45 + (a.d.ok ? .1 : 0) + pb(a)))) { S.fame += 6; X.add('sm', 8); return { t: 'Bạn đi mười hai ngày qua đất chết, nước chia từng ngụm, đêm nằm nghe gió rít như ai khóc. Sáng ngày thứ mười ba, leo hết một con dốc, bạn thấy biển. Bạn ngồi xuống ngay trên đá, nhìn mãi, quên cả uống nước.', o: 'beyond' }; }
          X.add('hl', -18); return { t: 'Bạn đi bảy ngày qua đất chết thì nước cạn, phải quay lại. Một trận bão cát cuốn mất nửa số đồ. Lúc gió lặng, bạn nhìn quanh và không còn nhận ra đường về.', o: 'lost' }; }
        if (ch === 'settle') { X.add('h', 8); return { t: 'Bạn quay lại thung lũng có con suối trong nhất từng thấy trên đường đi. Bạn dựng một căn nhà gỗ ở đó, tự tay đẽo từng thanh. Đêm đầu tiên ngủ dưới mái nhà mới, nghe tiếng suối chảy, bạn nghĩ: có lẽ chân trời là chỗ này.', o: 'settle' }; }
        X.add('so', 6); return { t: 'Bạn quay về. Đêm đầu tiên cả làng ngồi quanh bếp lửa nhà bạn tới sáng, trẻ con ngủ gật mà vẫn cố mở mắt nghe. Bạn kể chuyện biển, chuyện thành đá trắng, chuyện những người nói thứ tiếng lạ. Cái túi đồ, bạn treo lên vách.', o: 'home' };
      },
      auto: S => S.traits.bold > .55 ? 'beyond' : S.traits.social > .55 ? 'home' : 'settle' },
    after: { beyond: (S, X, a) => `Bạn vẽ lại con đường ấy lên một tấm da dê mới, từng con dốc, từng chỗ có nước. ${a.d.path === 'map' ? 'Tấm bản đồ cũ năm nào hóa ra sai gần hết; tấm này thì đúng. ' : ''}Bạn để nó lại cho đứa trẻ nào trong làng hay ngồi nghe bạn kể. Bạn dặn nó: đường có thật, cứ đi.`,
      settle: () => 'Thung lũng ấy giờ có ba nóc nhà, khói bếp bay lên mỗi chiều. Người tới sau gọi nó theo tên bạn. Sáng nào bạn cũng ra suối rửa mặt, nhìn về phía con đường đã đưa mình tới.',
      home: () => 'Chuyện bạn kể được người ta kể lại, mỗi lần một dài hơn, có cả những thứ bạn chưa từng thấy. Bạn nghe, không cải chính. Đứa trẻ nào trong làng cũng mơ một ngày được đi như bạn.',
      lost: () => 'Một năm sau bạn mới tìm được đường về, người gầy rộc, tóc bạc đi nhiều. Bạn không còn đi xa nữa. Có đoàn buôn đi qua, bạn chỉ đứng ở cổng nhìn theo, tay nắm chặt cánh cổng.' }
  });

  // ── Tên nhà ──
  saga('m_house', {
    nameVi: 'Tên nhà', pitch: 'Gây dựng lại tên nhà.', axes: { gia: 1, quyen: .5 }, themes: ['romance', 'memory'], aim: 'family',
    quest: () => 'Gây dựng lại tên nhà', good: ['claimed', 'founded'], marks: { claimed: 'ten_nha', founded: 'dong_moi', let: 'buong_bo' },
    sum: { claimed: () => 'được họ tộc nhận lại tên nhà', founded: () => 'mở một dòng họ mới, con cháu đọc tên mình đầu tiên', let: () => 'buông chuyện tên nhà, sống yên với nhà mình' },
    follow: ['Tối ấy bạn ghi thêm một dòng vào cuốn gia phả tự viết.', 'Mỗi lần ký tên, bạn lại nghĩ tới tên nhà mình, nét chữ cẩn thận hơn.', 'Bạn kể cho người trong nhà nghe chuyện ông bà, những gì mình biết được.'],
    beat: { any: ['Bạn hỏi các bô lão về ông bà mình. Người nhớ một cái tên, người nhớ một câu chuyện, ghép lại vẫn còn nhiều khoảng trống.', 'Bạn sửa lại bàn thờ trong nhà, thay bát hương mới, lau từng tấm bài vị. Khói hương bay thẳng lên. Người già bảo đó là điềm tốt.', 'Bạn ghi tên từng người trong họ lên một tấm gỗ, tên nào chưa chắc thì viết bằng than. Tấm gỗ treo trên vách, mỗi năm thêm vài nét.'] },
    open: (S, X, a) => `${lead(S, a)}Ở đám giỗ nhà hàng xóm, có người nhắc tới tên nhà bạn bằng giọng khinh khỉnh. Cả mâm cười. Bạn cũng cười theo, tay nắm chén rượu chặt tới trắng cả đốt ngón. Đêm ấy bạn tự hứa: một ngày cái tên ấy sẽ được nói bằng giọng khác.`,
    knot: { title: 'Cách gây dựng tên nhà', body: () => 'Tên nhà không tự sáng lên. Có người lục giấy tờ cũ để chứng minh mình là ai, có người tự làm nên tên tuổi, có người nhờ một mối thông gia. Bạn chọn cách nào?',
      choices: () => [{ k: 'proof', label: 'Tìm bằng chứng huyết thống', sub: 'Giấy tờ cũ, người làm chứng.' }, { k: 'earn', label: 'Tự làm nên tên tuổi', sub: 'Để người ta nhớ tên bạn trước.' }, { k: 'match', label: 'Liên hôn với nhà có tiếng', sub: 'Nhanh nhất, không phải ai cũng chịu.' }],
      apply(S, X, ch) { if (ch === 'proof') { X.add('sm', 4); return 'Bạn lục từng hòm giấy cũ trong đền làng, giấy mục bở ra trong tay. Bụi bám đầy tóc, đầy mũi. Giữa hàng nghìn cái tên lạ, bạn dò tìm tên ông bà mình, từng dòng, từng dòng.'; }
        if (ch === 'earn') { S.fame += 2; return 'Bạn nhận mọi việc khó mà người khác chê, làm tới nơi tới chốn. Bạn không nhắc gì tới tên nhà nữa. Bạn để việc mình làm nói thay.'; }
        X.add('so', 3); return 'Bạn nhờ bà mối tìm một nhà có tiếng chịu kết thông gia. Bà mối nhìn bạn từ đầu tới chân, chép miệng một cái. Rồi bà nhận tiền, bảo: để bà thử.'; },
      auto: S => S.traits.studious > .55 ? 'proof' : S.traits.social > .55 ? 'match' : 'earn' },
    trial: { base: S => .45 + Math.min(.2, S.fame / 200),
      run: (S, X, a, ok) => ok ? (S.fame += 3, a.d.path === 'proof' ? 'Trong sổ đinh của một làng xa, ở trang thứ bốn mươi, bạn tìm được tên ông cố, mực đã nhạt mà nét chữ còn rõ. Bạn chép lại, tay run tới mức phải chép hai lần. Suốt mấy ngày đường về, bạn giữ tờ giấy trong ngực áo.'
          : a.d.path === 'match' ? 'Nhà có tiếng ấy nhận lời gặp mặt. Bữa cơm đầu, bạn ngồi thẳng lưng tới mỏi, gắp từng miếng nhỏ. Lúc tiễn ra cổng, ông chủ nhà vỗ vai bạn một cái.'
          : 'Ở chợ, người ta bắt đầu nhắc tên bạn, lần đầu tiên không kèm câu khinh khỉnh nào. Bạn nghe, đi tiếp, mà mãi mới tin là thật.')
        : (X.add('h', -6), a.d.path === 'proof' ? 'Tờ giấy duy nhất có tên ông cố đã mục nát, chữ nhòe thành những vết loang. Bạn soi dưới nắng, dưới đèn, vẫn không đọc được. Bạn gói nó lại cẩn thận, như gói một người đã mất.'
          : 'Người ta vẫn nhắc tên bạn kèm chuyện cũ của nhà bạn. Việc bạn làm tốt tới đâu, câu chuyện cũ vẫn đi trước một bước. Bạn bắt đầu hiểu một cái tiếng cũ nặng tới mức nào.') },
    climax: { title: 'Trước họ tộc', body: (S, X, a) => `Họ tộc họp ở nhà thờ họ, mâm cỗ bày kín hai gian. Đây là dịp nói chuyện tên nhà, có lẽ là dịp duy nhất trong đời bạn. Trưởng họ ngồi ở ghế trên, mắt nhắm hờ.${a.d.ok && a.d.path === 'proof' ? ' Tờ giấy chép tên ông cố nằm trong ngực áo bạn.' : ''}`,
      choices: (S, X, a) => [{ k: 'claim', label: 'Đứng lên đòi lại danh phận', sub: `Chừng ${Math.round(G.clamp(.4 + (a.d.ok ? .2 : 0) + pb(a), .1, .9) * 100)}% được nhận.` },
        { k: 'found', label: 'Lập dòng mới, mình làm tổ', sub: 'Không cần ai nhận.' }, { k: 'let', label: 'Thôi, sống yên với nhà mình', sub: '' }],
      apply(S, X, ch, a) {
        if (ch === 'claim') { if (X.chance(G.clamp(.4 + (a.d.ok ? .2 : 0) + pb(a), .1, .9))) return { t: 'Bạn đứng lên giữa nhà thờ họ, nói rõ từng chữ. Trưởng họ nghe xong, im lặng rất lâu. Rồi ông đọc tên bạn trước cả họ tộc, ghi nó vào gia phả bằng mực đỏ. Bạn cúi đầu, mắt cay xè, không biết vì khói hương hay vì gì khác.', o: 'claimed' };
          X.add('h', -8); return { t: 'Bạn đứng lên nói. Trưởng họ nghe hết, rồi lắc đầu, không cần giải thích. Bạn ra về giữa những tiếng xì xào. Đi được nửa đường, bạn dừng lại dưới gốc đa và quyết định: gia phả của mình, mình tự viết.', o: 'founded' }; }
        if (ch === 'found') { X.add('h', 5); return { t: 'Bạn không đứng lên. Về nhà, bạn khắc tên mình lên đầu một tấm gỗ mới, bên dưới chừa chỗ trống cho con cháu. Gỗ mít thơm, đường dao chắc. Bạn treo nó lên vách, ngồi ngắm tới khuya.', o: 'founded' }; }
        X.add('h', 6); return { t: 'Bạn không tới buổi họp. Tối ấy bạn ăn cơm ở nhà, nồi canh chua, đĩa cá kho. Bạn không nghĩ gì tới tên nhà nữa, và lạ là thấy nhẹ cả người.', o: 'let' };
      },
      auto: S => S.traits.bold > .4 ? 'claim' : S.traits.social < .55 ? 'found' : 'let' },
    after: { claimed: () => 'Tết năm sau, nhà bạn được mời ngồi mâm trên ở nhà thờ họ. Mấy người năm xưa cười khinh khỉnh giờ rót rượu cho bạn trước. Bạn uống, cảm ơn, không nhắc chuyện cũ. Chuyện cũ tự họ nhớ.',
      founded: () => 'Tấm gỗ khắc tên bạn giờ có thêm ba dòng. Con cháu đọc tên bạn đầu tiên, đọc to, rõ, không ai phải ngập ngừng. Cái giọng khinh khỉnh năm nào, bạn thấy nó nhỏ dần rồi tắt hẳn.',
      let: () => 'Nhà bạn không có tên to, không được ngồi mâm trên ở đâu cả. Nhưng bữa cơm nào cũng đủ người, có tiếng cười. Bạn nghĩ, thế cũng là một cái tên.' }
  });

  // ── Giữ làng ──
  saga('m_guard', {
    nameVi: 'Giữ làng', pitch: 'Đứng chắn cho làng trước mọi thứ từ bên ngoài.', axes: { vo: .8, gia: .5, quyen: .3 }, themes: ['raid', 'war', 'robbery'], aim: null,
    quest: () => 'Giữ làng bình yên', good: ['held', 'wall', 'saved'], marks: { held: 'nguoi_giu_lang', wall: 'nguoi_giu_lang', saved: 'duoc_tin', fell: 'cay_dang' },
    sum: { held: () => 'đứng ở cổng làng tới khi bầy quái rút', wall: () => 'dựng được tường rào và một đội dân canh cho làng', saved: () => 'đưa cả làng đi lánh nạn, không mất một ai', fell: () => 'không giữ được cổng làng ngày quái tràn vào' },
    follow: ['Trước khi ngủ bạn đi một vòng quanh làng, như mọi đêm.', 'Bạn đếm lại số giáo trong kho, thiếu một cây là đi tìm cho bằng được.', 'Tiếng chó sủa ngoài bìa rừng làm bạn ngồi bật dậy, tay đã chạm cán giáo.'],
    beat: { any: ['Bạn dạy mấy đứa trai làng cầm giáo cho đúng, đứng cho vững. Chúng cười đùa, đánh vào nhau chan chát. Bạn để chúng cười, miễn là tay không buông giáo.', 'Bạn đi tuần bìa {z}, đánh dấu những lối quái hay qua bằng mấy nút dây trên cành cây. Về tới làng thì trời đã tối mịt.', 'Hàng rào phía bắc làng lại mục một khúc. Bạn vác cọc ra vá, đóng tới trưa. Người đi ngang dừng lại phụ một tay.'] },
    open: (S, X, a) => `${lead(S, a)}Đêm ấy bạn đứng trên mái nhà nhìn về phía ${zoneName(S, X, a)}. Rừng tối đen, thỉnh thoảng có tiếng gì đó làm gãy cành. Ngoài đó có thứ đang đợi. Bạn tự hứa: chừng nào mình còn đứng được, không gì vào được làng.`,
    knot: { title: 'Cách giữ làng', body: () => 'Một người không giữ nổi cả làng, dù người đó khỏe tới đâu. Phải có người cùng canh, hoặc có lính của lãnh chúa, hoặc chính mình phải thành bức tường. Bạn bắt đầu từ đâu?',
      choices: (S, X) => [{ k: 'watch', label: 'Lập đội dân canh', sub: 'Cần người làng tin bạn.' }, { k: 'train', label: 'Tự luyện thành bức tường', sub: 'Một mình đứng ở cổng.' },
        { k: 'lord', label: 'Xin lãnh chúa gửi lính', sub: `Tốn chừng ${G.coin(Math.round(med(S, X)))} quà biếu.` }],
      apply(S, X, ch, a) {
        if (ch === 'watch') { const p = G.castAdd(S, X, { role: 'ban', how: 'người cùng bạn lập đội canh', work: 'guard', bond: 30 }); a.d.mate = p.id; X.add('so', 4); G.trajBump(S, { quyen: .3 }); return `${first(p.name)} vác giáo tới nhà bạn ngay tối hôm ấy, không đợi ai nhờ. Tuần sau đội canh có mười người, chia nhau thay ca, mỗi ca một bó đuốc. Đêm đầu tiên đứng gác cùng nhau, cả đội không ai buồn ngủ.`; }
        if (ch === 'train') { X.gain('Shield', 5); G.trajBump(S, { vo: .5 }); return 'Sáng nào bạn cũng ra cổng làng tập đứng tấn, tay cầm khiên, chân cắm xuống đất. Mưa cũng tập, rét cũng tập. Lâu dần lũ trẻ quen coi bạn như cái cột cổng, đi qua còn vỗ vào khiên một cái cho vui.'; }
        X.money(-Math.round(med(S, X))); a.d.lord = true; return 'Bạn mang quà lên phủ, đợi nửa ngày ngoài cổng mới được gặp. Lãnh chúa nhận quà, hứa mỗi mùa gửi về năm tay lính. Đường về, bạn nhẩm lại số tiền đã biếu, rồi tự nhủ: miễn là lính tới.';
      },
      auto: (S, X) => S.traits.social > .55 ? 'watch' : S.gold > med(S, X) * 2 && S.traits.bold < .5 ? 'lord' : 'train' },
    trial: { base: (S, X, a) => .45 + (a.d.path === 'watch' ? .1 : a.d.path === 'lord' ? .05 : 0),
      run: (S, X, a, ok) => ok ? (X.gain('Shield', 2), S.fame += 2, `Nửa đêm, một bầy ${spName(a)} mò tới bìa làng. ${a.d.path === 'watch' ? 'Đội canh đánh trống trước cả khi bạn kịp hô.' : a.d.path === 'lord' ? 'Mấy tay lính của lãnh chúa còn đang ngủ, bạn phải đá cửa gọi dậy.' : 'Bạn là người đầu tiên chạy ra cổng.'} Đuốc đốt khắp hàng rào, trống mõ inh ỏi. Bầy quái lùi dần, rồi rút về ${zoneName(S, X, a)}.`)
        : (X.add('hl', -10), `Một bầy ${spName(a)} phá chuồng nhà cuối làng trước khi ai kịp tới. Lúc bạn chạy tới, chỉ còn tiếng gia súc kêu và dấu móng vuốt trên đất. Bạn vật lộn với con cuối cùng, bị nó cắn một miếng vào vai. Sáng ra người làng nhìn bạn, không ai nói gì.`) },
    climax: { title: 'Đêm quái tràn xuống', body: (S, X, a) => `Bầy ${spName(a)} lớn nhất trong trí nhớ người già đang kéo xuống từ ${zoneName(S, X, a)}. Tiếng chúng vọng tới làng từ lúc chạng vạng. Người già trẻ nhỏ đã dồn cả vào đình, đàn ông cầm đuốc đứng chờ bạn lên tiếng.`,
      choices: (S, X, a) => [{ k: 'stand', label: 'Đứng ở cổng, đánh tới sáng', sub: `Khả năng giữ được chừng ${Math.round(odds(S, X, (a.d.ok ? .55 : .35) + pb(a)) * 100)}%.` },
        { k: 'wall', label: 'Rút vào sau rào, giữ từng nhà', sub: a.d.path === 'watch' ? 'Đội canh đã quen việc.' : 'Chưa có đội canh, khó giữ.' }, { k: 'flee', label: 'Dẫn cả làng lên núi lánh nạn', sub: 'Mất nhà, giữ người.' }],
      apply(S, X, ch, a) {
        if (ch === 'stand') { if (X.chance(odds(S, X, (a.d.ok ? .55 : .35) + pb(a)))) { S.fame += 6; return { t: 'Bạn đứng ở cổng làng suốt đêm, giáo gãy thì thay giáo. Tới khi trời rạng, xác quái chất thành đống trước rào. Bạn quay lại nhìn: sau lưng mình không một mái nhà nào cháy. Lúc ấy bạn mới ngồi xuống, và không đứng dậy nổi nữa.', o: 'held' }; }
          X.add('hl', -20); X.cond('wound'); return { t: 'Cổng làng vỡ lúc gần sáng, cánh cổng đổ sập đè lên người bạn. Bầy quái tràn qua. Người làng kéo bạn ra khỏi đống gỗ khi mọi chuyện đã xong, tay bạn vẫn nắm cán giáo gãy, không ai gỡ ra được.', o: 'fell' }; }
        if (ch === 'wall') { if (a.d.path === 'watch' || a.d.ok || X.chance(.5)) { S.fame += 3; return { t: 'Mỗi nhà một ngọn đuốc, mỗi ngõ một tay giáo. Bầy quái đi vòng quanh làng tới sáng, gầm gừ, cào vào rào, mà không tìm được chỗ hở. Gà gáy lần thứ ba, chúng bỏ đi. Bạn đi một vòng đếm lại người, đủ cả.', o: 'wall' }; }
          X.add('hl', -12); return { t: 'Rào đổ ở phía bắc. Bạn chạy từ ngõ này sang ngõ khác, hô hoán đến khản giọng, mà không kịp. Tiếng la hét đuổi theo bạn suốt đêm ấy.', o: 'fell' }; }
        X.money(-Math.round(med(S, X) * .5)); X.add('h', -3); return { t: 'Cả làng trèo lên núi trong đêm, người già trên lưng người trẻ, trẻ con ôm gà ôm chó. Bạn đi cuối cùng, ngoái lại mãi. Sáng ra nhìn xuống, mái nhà bốc khói. Nhưng đếm đi đếm lại, đủ người.', o: 'saved' };
      },
      auto: (S, X, a) => S.traits.bold > .55 ? 'stand' : a.d.path === 'watch' ? 'wall' : 'flee' },
    after: { held: () => 'Người làng khắc tên bạn lên cột cổng, nét chữ nghiêng nghiêng của thầy đồ. Bọn trẻ chơi trò giữ cổng, đứa nào cũng đòi làm bạn. Mỗi lần có tiếng mõ, người ta vẫn nhìn về phía nhà bạn trước tiên.',
      wall: (S, X, a) => { const m = mateOf(S, a); return `Hàng rào vẫn đó, đội canh vẫn thay ca mỗi đêm. Giờ có người khác cầm đuốc thay bạn.${m ? ` Thỉnh thoảng ${m} ghé qua, hai người ngồi nhắc lại đêm quái tràn xuống.` : ''} Đêm nào nghe tiếng trống đổi ca, bạn vẫn tỉnh giấc, nằm nghe cho hết rồi mới ngủ lại.`; },
      saved: () => 'Làng dựng lại ở chỗ cũ sau một mùa, nhà mới còn thơm mùi gỗ. Buổi lễ tạ ơn không thiếu một ai, cụ già nhất làng đứng lên điểm tên từng người. Tới tên bạn, cả sân đình vỗ tay.',
      fell: () => 'Làng dựng lại, nhưng có những ngôi nhà không ai về ở nữa, cửa đóng, cỏ mọc kín sân. Bạn vẫn đi tuần mỗi đêm. Đi ngang những ngôi nhà ấy, bạn bước chậm lại.' }
  });

  // ── Một mối tình ──
  const lov = a => (a && a.d.name) || 'người ấy';
  saga('m_love', {
    nameVi: 'Một mối tình', pitch: 'Giữ lấy một người, dù đời có xô đi đâu.', axes: { gia: 1, du: .2 }, themes: ['romance'], aim: 'family', gate: true,
    quest: a => `Giữ lấy ${lov(a)}`, good: ['wed', 'wait', 'let'], marks: { wed: 'tinh_mot_doi', wait: 'tinh_mot_doi', lost: 'cay_dang', let: 'buong_bo' },
    sum: { wed: d => `ở bên ${d.name || 'người ấy'} tới cuối đời`, wait: d => `đi xa rồi trở về, ${d.name || 'người ấy'} vẫn đợi`, lost: d => `đi xa quá lâu, về thì ${d.name || 'người ấy'} đã không còn đợi`, let: d => `buông tay cho ${d.name || 'người ấy'} đi tìm đời mình` },
    follow: ['Bạn mang theo một món quà nhỏ, định bụng gặp người ấy sẽ đưa. Rồi lại ngại, để trong túi áo cả tuần.', 'Đêm ấy bạn viết một lá thư dài, sáng ra đọc lại, chỉ dám gửi đi nửa trang.', 'Giữa lúc bận nhất, bạn vẫn chợt nghĩ tới nụ cười của người ấy, và tay chậm lại.'],
    beat: { any: ['Hai người đi dọc bờ suối tới khi trời tối, nói đủ thứ chuyện không đâu vào đâu. Về tới đầu ngõ vẫn còn chuyện chưa nói hết.', 'Cái cổng nhà người ấy xệ một bên bản lề. Bạn mang búa tới sửa, không ai nhờ. Người ấy đứng trong sân nhìn ra, giả vờ không thấy, mà miệng thì cười.', 'Hai người cãi nhau một trận vì chuyện không đâu, giận tới mức không nhìn mặt. Chiều xuống, người ấy mang sang một rổ khoai. Trước bữa tối thì đã làm lành.'] },
    open: (S, X, a) => `${lead(S, a)}Bạn gặp ${lov(a)} ở chợ phiên, giữa tiếng người mua kẻ bán. Hai người nói chuyện từ lúc nắng còn trên mái lều tới khi người bán dọn hàng. Đường về, bạn đi chậm hẳn. Bạn biết đời mình từ nay có thêm một người.`,
    knot: { title: 'Đường tới với nhau', body: (S, X, a) => `Nhà ${lov(a)} không mặn mà với bạn. Mỗi lần bạn ghé, người nhà chỉ chào cho có rồi lui vào trong. Lúc tiễn bạn ra cổng, ${lov(a)} không nói gì, chỉ nắm tay bạn một cái thật chặt.`,
      choices: () => [{ k: 'prove', label: 'Làm cho nhà người ấy nể', sub: 'Lâu, nhưng đường hoàng.' }, { k: 'elope', label: 'Rủ người ấy bỏ đi', sub: 'Nhanh, mang tiếng.' }, { k: 'wait', label: 'Kiên nhẫn chờ', sub: 'Thời gian sẽ trả lời.' }],
      apply(S, X, ch, a) { if (ch === 'prove') { S.fame += 2; X.gain(bestSk(S), 3); return `Bạn nhận mọi việc khó trong làng, làm cho tới nơi, để nhà ${lov(a)} nghe tên bạn. Đắp đê có bạn, đi rừng có bạn, nhà ai có việc cũng có bạn. Người ta bắt đầu kể chuyện bạn ở đầu ngõ, đủ to để vọng vào nhà người ấy.`; }
        if (ch === 'elope') { X.add('so', -4); G.trajBump(S, { du: .4 }); return `Một đêm không trăng, bạn và ${lov(a)} khoác tay nải đi sang làng bên. Hai người không đốt đuốc, nắm tay nhau dò từng bước. Tới đầu làng bên trời vừa sáng, sương còn đọng trên tóc. Ở làng cũ, chắc người ta đã bắt đầu xì xào.`; }
        X.add('h', 2); return `Bạn không nói gì thêm, cũng không ép. Chiều nào bạn cũng đi ngang cổng nhà ${lov(a)}, gật đầu chào người nhà, rồi đi tiếp. Mưa cũng đi, nắng cũng đi. Bạn nghĩ: thời gian sẽ trả lời.`; },
      auto: S => S.traits.bold > .65 ? 'elope' : S.traits.social > .5 ? 'prove' : 'wait' },
    trial: { base: (S, X, a) => .5 + (a.d.path === 'prove' ? .1 : 0),
      run: (S, X, a, ok) => ok ? (X.add('h', 6), a.d.path === 'elope' ? `Hai người dựng một căn nhà nhỏ ở làng bên, mái tranh, vách đất. Lúc đầu người ta xì xào, chỉ trỏ. Được một mùa thì thôi, có người còn mang sang biếu nắm rau. Tối tối, bếp nhà hai người đỏ lửa sớm nhất xóm.` : `Nhà ${lov(a)} cuối cùng cũng mở cửa đón bạn. Bữa cơm đầu tiên ngồi chung mâm, bà mẹ múc cho bạn bát canh đầy nhất, đầy tới sánh ra ngoài. ${lov(a)} nhìn bạn qua làn khói, cười.`)
        : (X.add('h', -8), `Một trận ốm của ${lov(a)}, rồi một trận cãi lớn, cái nọ kéo cái kia. Có mấy tuần hai người không nhìn mặt nhau. Có lúc bạn tưởng đã mất người ấy thật. Rồi một sáng, ${lov(a)} đứng chờ ở đầu ngõ, mắt còn sưng.`) },
    climax: { title: 'Giữa hai con đường', body: (S, X, a) => `Một cơ hội lớn mở ra ở nơi xa, thứ cả đời bạn chỉ dám nghĩ tới. Đi thì phải xa ${lov(a)} nhiều năm. Lá thư mời nằm trên bàn mấy hôm, chưa ai mở lời trước.`,
      choices: (S, X, a) => [{ k: 'stay', label: 'Ở lại', sub: 'Bỏ cơ hội ấy.' }, { k: 'go', label: 'Đi, hẹn ngày về', sub: `Chừng ${Math.round(G.clamp(.45 + (a.d.ok ? .2 : 0) + pb(a), .1, .9) * 100)}% người ấy còn đợi.` },
        { k: 'free', label: 'Buông tay', sub: 'Để người ấy đi tìm đời mình.' }],
      apply(S, X, ch, a) {
        if (ch === 'stay') { X.add('h', 8); return { t: `Bạn đốt lá thư mời trong bếp, nhìn nó cháy thành tro. Tối ấy ${lov(a)} nấu một nồi cơm to hơn mọi ngày, hai người ăn mãi không hết. Không ai nhắc tới lá thư, kể cả về sau.`, o: 'wed' }; }
        if (ch === 'go') { S.fame += 3; X.money(Math.round(med(S, X) * 1.5)); if (X.chance(G.clamp(.45 + (a.d.ok ? .2 : 0) + pb(a), .1, .9))) return { t: `Bạn đi. Mỗi mùa một lá thư gửi về, lá nào ${lov(a)} cũng trả lời, chữ nắn nót. Thư kể chuyện mưa nắng, chuyện cây hồng trước sân ra quả, chuyện con mèo hàng xóm đẻ một lứa năm con. Bạn giữ cả, buộc thành một bó để dưới gối.`, o: 'wait' };
          X.add('h', -10); return { t: 'Bạn đi. Năm đầu thư về đều, năm thứ hai thưa dần, sang năm thứ ba thì thôi hẳn. Bạn vẫn viết thêm mấy lá, không biết gửi đi đâu. Mấy lá ấy bạn cất đi, không bao giờ đọc lại.', o: 'lost' }; }
        X.add('h', 2); return { t: `Bạn nói lời từ biệt trước, khi người ấy chưa kịp nói gì. ${lov(a)} khóc, rồi gật đầu. Hai người đứng ở cổng rất lâu, không ai buông tay trước. Rồi bạn buông.`, o: 'let' };
      },
      auto: S => S.traits.social > .5 ? 'stay' : S.traits.bold > .6 ? 'go' : 'free' },
    after: { wed: (S, X, a) => `Tóc ${lov(a)} bạc trước tóc bạn. Chiều nào hai người cũng ngồi trước hiên nhà, người tước lạt, người nhặt rau, chẳng cần nói gì nhiều. Thỉnh thoảng vẫn cãi nhau vì chuyện vặt, như hồi còn trẻ. Tới bữa tối thì lại làm lành.`,
      wait: (S, X, a) => `Bạn về vào một sáng mưa, áo ướt sũng, tay ôm bó thư. ${lov(a)} đứng ở cổng, như đã đứng ở đó suốt mấy năm. Hai người không nói gì. Bạn bước vào nhà, thấy chỗ ngồi của mình vẫn để nguyên đó.`,
      lost: (S, X, a) => `Cổng nhà ${lov(a)} đã có người khác mở. Bạn đứng ở đầu ngõ một lúc, nghe tiếng trẻ con cười vọng ra. Rồi bạn quay đi, không gõ cửa. Tối ấy bạn đốt mấy lá thư chưa gửi.`,
      let: (S, X, a) => `Nghe nói ${lov(a)} sống yên ở một làng xa, có nhà, có vườn. Bạn thấy nhẹ lòng hơn bạn tưởng. Thỉnh thoảng đi chợ phiên, bạn vẫn dừng lại ở chỗ hai người gặp nhau năm nào.` }
  });

  // ── Bí mật cổ xưa ──
  saga('m_lore', {
    nameVi: 'Bí mật cổ xưa', pitch: 'Tìm cho ra một bí mật mà thế giới đã quên.', axes: { tri: .8, phap: .6, du: .3 }, themes: ['treasure', 'ring', 'grave', 'learn'], aim: 'scholar',
    quest: () => 'Tìm ra bí mật cổ xưa', good: ['found', 'shared', 'sealed'], marks: { found: 'biet_bi_mat', shared: 'duoc_tin', sealed: 'buong_bo', curse: 'cay_dang' },
    sum: { found: () => 'mở được cánh cửa cổ, biết điều thế giới đã quên', shared: () => 'chép bí mật cổ xưa lại cho người đời sau', sealed: () => 'tìm ra bí mật rồi tự tay niêm phong nó lại', curse: () => 'chạm vào một bí mật không nên chạm, mang lời nguyền tới cuối đời' },
    follow: ['Tối ấy bạn chép thêm một dòng ký tự lạ vào cuốn sổ.', 'Đêm ấy bạn mơ thấy một cánh cửa đá không có tay nắm, tỉnh dậy vẫn nhớ từng đường vân.', 'Gặp lữ khách nào bạn cũng hỏi về những phế tích họ từng đi qua.'],
    beat: { any: ['Bạn đọc tới khi nến tàn, thắp cây khác, đọc tiếp. Sáp chảy thành từng vũng trên bàn. Gà gáy, bạn mới gấp sách.', 'Bạn đổi một tháng tiền công lấy một tấm da thuộc cũ có ký tự lạ. Người bán bảo nó chẳng đáng một bữa rượu. Bạn ôm nó về như ôm vàng.', 'Bạn tới {z}, so ký tự trên tấm bia đổ với cuốn sổ của mình, từng nét một. Hai ký tự khớp nhau. Cả buổi chiều bạn ngồi trên bia đá, không muốn về.'] },
    open: (S, X, a) => `${lead(S, a)}Trong một tấm da thuộc cũ, bạn thấy một ký tự không ai trong vùng đọc được. Hỏi thầy đồ, hỏi thầy cúng, ai cũng lắc đầu. Bạn chép nó lên tay áo, đêm nằm cứ đưa ngón tay vẽ lại trong bóng tối. Từ hôm ấy bạn biết đời mình sẽ đi tìm nghĩa của nó.`,
    knot: { title: 'Lối đi tìm', body: () => 'Bí mật nằm đâu đó giữa sách cũ, phế tích và lời người chết. Sách thì chậm, phế tích thì hay sập, còn người chết thì không nói không công. Bạn chọn lối nào?',
      choices: () => [{ k: 'books', label: 'Vùi đầu vào sách cũ', sub: 'Học viện, thư khố.' }, { k: 'ruins', label: 'Đi đào phế tích', sub: 'Nguy hiểm, nhiều manh mối.' }, { k: 'voices', label: 'Hỏi người chết', sub: 'Đường tối, nhanh.' }],
      apply(S, X, ch) { if (ch === 'books') { X.add('sm', 5); G.trajBump(S, { tri: .5 }); return 'Bạn xin được chép sách thuê cho thư khố, đổi lại được đọc những cuốn không ai mượn. Thư khố lạnh, mùi giấy mốc, ông giữ kho điếc một tai. Bạn ngồi ở góc trong cùng, ngày chép, đêm đọc.'; }
        if (ch === 'ruins') { X.gain('Body', 3); G.trajBump(S, { du: .4 }); return 'Bạn mua một cái xẻng, một cuộn dây, một bó đuốc, rồi đi về phía những phế tích không ai dám tới. Người làng tiễn bạn bằng ánh mắt như tiễn người sắp chết. Bạn thì háo hức như đi hội.'; }
        X.gain('Soul', 3); G.trajBump(S, { am: .5 }); return 'Bạn thắp nến giữa nghĩa địa cũ và gọi tên những người chết đã lâu. Gió tắt nến hai lần. Lần thứ ba nến cháy, và có một tiếng gì đó đáp lại, rất khẽ. Bạn về nhà, tay lạnh ngắt tới sáng.'; },
      auto: S => S.traits.studious > .55 ? 'books' : S.traits.bold > .55 ? 'ruins' : G.trajShare(S, 'am') > .2 ? 'voices' : 'books' },
    trial: { base: (S, X, a) => .45 + (a.d.path === 'books' ? .1 : 0),
      run: (S, X, a, ok) => ok ? (X.add('sm', 3), 'Bạn ghép được ba mảnh ký tự thành một câu: "Cửa mở cho người nhớ tên nó." Bạn đọc đi đọc lại, môi mấp máy. Cả đêm ấy bạn không ngủ, ngồi nhìn ra trời sao.')
        : (X.add('hl', -8), a.d.path === 'ruins' ? 'Hầm phế tích sập sau lưng bạn, đất đá đổ ầm ầm. Bạn bò ra được bằng hai khuỷu tay, ho ra cả bụi. Cuốn sổ ghi chép mấy năm trời nằm lại dưới đó. Bạn ngồi trên đống đá rất lâu.'
          : a.d.path === 'voices' ? 'Đêm nào bạn cũng ra nghĩa địa, mà người chết không đáp nữa. Có một đêm bạn nghe tiếng cười sau lưng, quay lại không thấy ai. Bạn chạy một mạch về nhà, đánh rơi cuốn sổ giữa đường.'
          : 'Mấy năm chép sách, đọc sách, bạn chỉ thêm được một dòng vào cuốn sổ. Một đêm đọc lại, bạn nhận ra dòng ấy đọc sai ngay từ chữ đầu. Bạn gạch nó đi, rồi ngồi im rất lâu.') },
    climax: { title: 'Trước cánh cửa đá', body: (S, X, a) => `Cánh cửa đá không tay nắm đứng giữa phế tích, rêu phủ kín chân. ${a.d.ok ? 'Bạn đã biết tên của nó, cái tên ghép từ ba mảnh ký tự năm nào.' : 'Bạn đã biết tên của nó, dù phải trả bằng mấy năm trời mò mẫm.'} Gió lùa qua khe cửa nghe như có ai thở bên trong.`,
      choices: (S, X, a) => [{ k: 'open', label: 'Gọi tên, mở cửa', sub: `Chừng ${Math.round(G.clamp(.45 + (a.d.ok ? .2 : 0) + pb(a), .1, .9) * 100)}% không có gì trả giá.` },
        { k: 'share', label: 'Chép lại, gửi về học viện', sub: 'Để người sau mở.' }, { k: 'seal', label: 'Niêm phong lại', sub: 'Có những cửa nên đóng.' }],
      apply(S, X, ch, a) {
        if (ch === 'open') { if (X.chance(G.clamp(.45 + (a.d.ok ? .2 : 0) + pb(a), .1, .9))) { X.gain('Arcane', 5); S.fame += 5; return { t: 'Bạn gọi tên cánh cửa, giọng run run. Đá dịch ra không một tiếng động, như đã chờ bạn từ lâu. Bên trong có ánh sáng, không phải ánh đuốc. Bạn bước vào.', o: 'found' }; }
          X.cond('curse'); X.add('hl', -10); return { t: 'Bạn gọi tên cánh cửa. Một luồng gió lạnh đi xuyên qua người bạn, lạnh tới tận xương. Rồi cánh cửa đóng sập, chưa kịp hé quá một gang tay. Từ lúc ấy, bạn thấy có thứ gì đó đi theo mình.', o: 'curse' }; }
        if (ch === 'share') { S.fame += 3; X.add('so', 3); return { t: 'Bạn chép lại tất cả, từng ký tự, từng hình vẽ, đóng thành sách. Bạn gửi về học viện kinh đô theo chuyến ngựa thư nhanh nhất. Cánh cửa đá bạn không mở. Để người sau.', o: 'shared' }; }
        X.add('h', 4); return { t: 'Bạn lấp đất lên lối vào, xóa hết dấu chân, trồng lên đó một bụi gai. Đêm ấy bạn đốt trang sổ cuối, nhìn ngọn lửa liếm qua cái tên. Có những cửa nên đóng. Bạn tin thế, dù trong lòng vẫn tiếc.', o: 'sealed' };
      },
      auto: S => S.traits.bold > .55 ? 'open' : S.traits.social > .5 ? 'share' : 'seal' },
    after: { found: () => 'Bạn không kể với ai những gì thấy sau cánh cửa, kể cả người thân nhất. Nhưng từ hôm ấy bạn nhìn sao trời khác đi, hay ngồi ngoài hiên tới khuya. Có người hỏi bạn nhìn gì. Bạn chỉ cười.',
      shared: () => 'Ở học viện, học trò chép lại sổ của bạn, lớp này sang lớp khác; tên bạn đứng ở trang đầu. Có cậu học trò lặn lội về tận làng tìm bạn, mang theo một câu hỏi mà chính bạn cũng chưa trả lời được. Hai người ngồi bàn tới sáng.',
      sealed: () => 'Chỉ mình bạn biết chỗ cánh cửa. Bụi gai giờ đã mọc kín lối vào. Cái tên của nó, bạn sẽ mang theo xuống mồ, không viết ra, không nói với ai.',
      curse: () => 'Đêm nào bạn cũng nghe tiếng gõ sau lưng, ba tiếng một, đều đặn. Quay lại thì không có ai. Lời nguyền đi theo bạn tới cuối đời, như cái bóng không chịu rời chân.' }
  });

  // ── Chuộc lỗi ──
  saga('m_atone', {
    nameVi: 'Chuộc lỗi', pitch: 'Trả lại cho đời những gì mình đã lấy.', axes: { dao: .6, gia: .2 }, themes: ['faith'], aim: null, gate: true,
    quest: () => 'Chuộc lại lỗi xưa', good: ['redeemed', 'confessed', 'punished'], marks: { redeemed: 'da_chuoc', confessed: 'da_chuoc', punished: 'giu_loi', hidden: 'cay_dang' },
    sum: { redeemed: () => 'trả lại cho đời những gì mình đã lấy', confessed: () => 'đứng trước mọi người nhận lỗi và được tha', punished: () => 'nhận lỗi và chịu phạt tới nơi tới chốn', hidden: () => 'giấu kín lỗi xưa tới cuối đời' },
    follow: ['Bạn đi qua chỗ cũ, rồi rẽ sang đường khác, dù đường ấy xa hơn.', 'Bạn bỏ thêm mấy đồng vào hòm công đức, lúc không có ai nhìn.', 'Đêm ấy bạn lại mơ thấy gương mặt ấy, tỉnh dậy ngồi tới sáng.'],
    beat: { any: ['Bạn giúp một nhà góa sửa lại mái, trèo lên trèo xuống cả ngày, không lấy công. Bà chủ nhà mời ở lại ăn cơm, bạn từ chối, đi vội như sợ bị cảm ơn.', 'Ở cổng làng có người ăn xin, bạn chia cho ông nửa bữa cơm mang theo. Ông nhìn bạn, hỏi có phải bạn nợ ông gì không. Bạn lắc đầu, mà lòng thì giật thót.', 'Bạn thắp hương ở miếu làng, đứng lâu hơn mọi khi. Khói hương cay mắt. Bạn không khấn gì, chỉ đứng đó.'] },
    open: (S, X, a) => `${lead(S, a)}Đêm ấy bạn không ngủ được, nằm nghe tiếng mưa trên mái. Gương mặt cũ cứ hiện lên mỗi lần nhắm mắt. Có những thứ không thể để yên mãi. Sáng ra, bạn biết mình phải làm gì đó.`,
    knot: { title: 'Cách chuộc lỗi', body: () => 'Lỗi cũ không tự mất đi, chỉ nằm im mà chờ. Có người trả bằng việc thiện, có người tìm tới tận nhà người mình đã làm hại, có người vào đền quỳ cho tới khi lòng yên. Bạn trả bằng cách nào?',
      choices: () => [{ k: 'help', label: 'Làm việc thiện', sub: 'Từng việc nhỏ một.' }, { k: 'seek', label: 'Tìm người mình đã làm hại', sub: 'Gặp lại họ, hoặc người nhà họ.' }, { k: 'temple', label: 'Vào đền sám hối', sub: 'Cần một nơi để quỳ.' }],
      apply(S, X, ch, a) { if (ch === 'help') { X.add('so', 4); X.money(-Math.round(med(S, X) * .3)); return 'Bạn bắt đầu bằng việc nhỏ: mỗi sáng gánh nước cho bà cụ cuối xóm. Đôi thùng nặng, vai bạn hằn hai vệt đỏ. Bà cụ không biết chuyện cũ của bạn. Có lẽ vì thế mà bạn chọn bà.'; }
        if (ch === 'seek') { const p = G.castAdd(S, X, { role: 'on', how: 'người bạn từng làm hại', bond: 5 }); a.d.mate = p.id; return `Bạn hỏi thăm khắp vùng, đi mất mấy tháng, rồi tìm ra nhà ${first(p.name)}. Bạn đứng ở cổng ba lần mới dám gõ cửa. Lần đầu quay về. Lần thứ hai đứng tới tối. Lần thứ ba, cửa mở.`; }
        X.gain('Spirit', 3); G.trajBump(S, { dao: .5 }); return 'Bạn quỳ trong đền từ tối tới sáng, gối tê dại, lưng mỏi rã. Vị tư tế không hỏi gì, chỉ châm thêm dầu mỗi khi lửa đèn nhỏ lại. Gần sáng ông đặt một bát nước bên cạnh bạn rồi đi.'; },
      auto: S => S.traits.pious > .6 ? 'temple' : S.traits.social > .5 ? 'seek' : 'help' },
    trial: { base: (S, X, a) => .5 + (a.d.path === 'seek' ? .05 : 0),
      run: (S, X, a, ok) => ok ? (X.add('h', 5), a.d.path === 'seek' ? 'Người ấy nghe bạn nói hết, không ngắt lời. Rồi đứng dậy rót cho bạn một chén nước. Không ai nói chữ tha. Nhưng lúc ra về, bạn thấy bước chân mình nhẹ hơn lúc tới.' : 'Người trong làng bắt đầu chào bạn trước, có người còn gọi bạn vào uống nước. Bạn chưa quen được với chuyện ấy. Lần nào bạn cũng cúi đầu chào lại thật thấp.')
        : (X.add('h', -8), 'Giữa phiên chợ đông, có người nhắc lại chuyện cũ của bạn, nói to, rõ từng chữ. Ai cũng nghe. Bạn đứng đó, tay cầm mớ rau, không biết nên đặt xuống hay mang đi. Hôm ấy bạn về sớm.') },
    climax: { title: 'Ngày nói ra', body: () => 'Có một người biết hết chuyện cũ, và người đó sắp nói ra. Tin ấy tới tai bạn qua bà hàng nước đầu làng. Đêm ấy bạn ngồi trước cửa nhà, nghĩ tới tất cả những việc mình đã làm suốt mấy năm qua.',
      choices: (S, X, a) => [{ k: 'confess', label: 'Tự đứng ra nhận', sub: `Chừng ${Math.round(G.clamp(.5 + (a.d.ok ? .2 : 0) + pb(a), .1, .9) * 100)}% được tha.` },
        { k: 'give', label: 'Đem của cải trả lại', sub: 'Mất chừng nửa gia sản.' }, { k: 'hide', label: 'Giấu tiếp', sub: 'Bịt miệng người đó.' }],
      apply(S, X, ch, a) {
        if (ch === 'confess') { if (X.chance(G.clamp(.5 + (a.d.ok ? .2 : 0) + pb(a), .1, .9))) { X.add('h', 8); return { t: 'Bạn đứng giữa sân đình kể hết, không giấu một chi tiết nào. Im lặng rất lâu, chỉ nghe tiếng quạ trên cây đa. Rồi trưởng làng nói: đủ rồi. Người ta lần lượt đứng dậy ra về, có người đi ngang còn đặt tay lên vai bạn.', o: 'confessed' }; }
          X.money(-Math.round(med(S, X))); S.fame -= 2; return { t: 'Bạn đứng giữa sân đình kể hết. Người ta bắt bạn đền, từng đồng một, và bạn đền. Không ai tha, nhưng cũng không ai đuổi. Đêm ấy, lần đầu sau nhiều năm, bạn ngủ được.', o: 'punished' }; }
        if (ch === 'give') { X.money(-Math.round(Math.max(0, S.gold) * .5)); X.add('h', 6); return { t: 'Bạn chia nửa gia sản thành từng túi nhỏ, buộc dây gai. Đêm đêm bạn đi gửi tới từng nhà, đặt trước cửa, không kèm tên. Sáng ra cả làng xôn xao. Bạn ngồi nhà nghe, không nói gì.', o: 'redeemed' }; }
        X.money(-Math.round(med(S, X))); X.add('h', -6); return { t: 'Bạn gửi một túi tiền tới người kia, kèm một lời nhắn ngắn. Người ấy im lặng. Và bạn biết, từ hôm nay, mình sẽ còn phải gửi thêm nhiều lần nữa.', o: 'hidden' };
      },
      auto: (S, X) => S.traits.pious > .55 ? 'confess' : S.gold > med(S, X) * 2 ? 'give' : S.traits.bold > .6 ? 'hide' : 'confess' },
    after: { redeemed: () => 'Bạn sống những năm cuối trong căn nhà nhỏ hơn, ăn uống đạm bạc. Đêm nào cũng ngủ ngon. Gương mặt cũ thôi hiện về trong mơ.',
      confessed: () => 'Người ta vẫn nhớ chuyện cũ. Nhưng giờ họ kể kèm thêm một đoạn: ngày bạn đứng giữa sân đình nhận hết. Nghe nói đoạn ấy mỗi lần kể lại một dài hơn.',
      punished: () => 'Bạn đền đủ tới đồng cuối. Hôm trả xong, có người mời bạn một chén rượu ở quán đầu làng. Chén rượu cay mà ấm. Lâu lắm rồi mới có người ngồi chung bàn với bạn.',
      hidden: () => 'Bí mật chết cùng người biết nó, vào một mùa đông nọ. Bạn đi đưa tang, đứng ở hàng cuối. Người ấy không còn đòi gì nữa. Còn bạn thì vẫn sống với nó, mỗi ngày.' }
  });

  // ── Tham vọng ──
  saga('m_shadow', {
    nameVi: 'Tham vọng', pitch: 'Leo lên trên đầu mọi người, bằng mọi giá.', axes: { am: 1, quyen: .6 }, themes: ['dark'], aim: 'power', gate: true,
    quest: () => 'Leo lên trên đầu mọi người', good: ['throne', 'back'], marks: { throne: 'ba_chu', fall: 'tay_trang', back: 'buong_bo' },
    sum: { throne: () => 'đứng trên đầu cả vùng, người ta sợ hơn là nể', fall: () => 'leo cao rồi ngã, mất hết những gì giành được', back: () => 'dừng lại trước bước cuối, quay về làm người thường' },
    follow: ['Tối ấy bạn ghi thêm một cái tên vào cuốn sổ nhỏ, ngay dưới mấy cái tên đã gạch.', 'Bạn mỉm cười với một kẻ bạn định hạ, rót rượu cho hắn đầy chén.', 'Đêm ấy bạn đếm lại những người còn đứng trên mình. Mỗi năm một ít đi.'],
    beat: { any: ['Bạn mua chuộc thêm một tay chân trong phủ, chỉ tốn một bữa rượu và một lời hứa. Người ta rẻ hơn bạn tưởng.', 'Bạn để lộ một tin giả qua miệng bà hàng nước, rồi ngồi xem ai cắn câu. Tới tối đã biết. Bạn ghi tên kẻ ấy vào sổ.', 'Có người biến mất khỏi làng, nhà để trống, cửa không cài. Người ta xì xào. Bạn không hỏi.'] },
    open: (S, X, a) => `${lead(S, a)}Bạn đứng bên đường nhìn kẻ đứng đầu vùng đi qua, ngựa cao, áo gấm, lính đi hai bên. Người ta cúi rạp xuống, bạn cũng cúi. Nhưng lúc ngẩng lên bạn đã nghĩ: chỗ ấy không phải trời cho ai. Ai giành được thì ngồi.`,
    knot: { title: 'Bậc thang đầu tiên', body: () => 'Muốn lên cao phải có thứ người khác cần, hoặc thứ người khác sợ. Tiền mua được người, nỗi sợ giữ được người, còn một kẻ quyền thế thì cho bạn cái thang. Bậc đầu tiên bao giờ cũng khó bước nhất.',
      choices: () => [{ k: 'gold', label: 'Gom tiền, mua người', sub: 'Cần vốn.' }, { k: 'fear', label: 'Gieo sợ hãi', sub: 'Tay chân, dao găm.' }, { k: 'patron', label: 'Bám vào một kẻ quyền thế', sub: 'Rồi thay chỗ hắn.' }],
      apply(S, X, ch) { if (ch === 'gold') { X.money(-Math.round(med(S, X) * .5)); G.trajBump(S, { thuong: .3, quyen: .3 }); return 'Bạn cho vay lãi nặng, ai cần gấp cũng cho, không hỏi nhiều. Tới hạn, bạn không đòi tiền. Bạn đòi bằng chức, bằng lời hứa, bằng một chữ ký.'; }
        if (ch === 'fear') { X.gain('Stealth', 4); G.trajBump(S, { am: .5 }); return 'Bạn nuôi mấy tay chân không hỏi nhiều, cho ăn no, cho dao tốt. Chẳng bao lâu, người trong vùng bắt đầu nói nhỏ khi bạn đi qua. Bạn thích cái im lặng ấy hơn bạn tưởng.'; }
        X.add('so', 4); G.trajBump(S, { quyen: .5 }); return 'Bạn vào làm việc cho một kẻ quyền thế, việc gì cũng nhận, chuyện gì cũng nhớ. Hắn sai bạn như sai một con chó trung thành. Bạn cúi đầu vâng dạ, và ghi chép tất cả.'; },
      auto: (S, X) => S.traits.social > .55 ? 'patron' : S.gold > med(S, X) * 2 ? 'gold' : 'fear' },
    trial: { base: (S, X, a) => .45 + Math.min(.2, S.fame / 200) + (a.d.path === 'patron' ? .05 : 0),
      run: (S, X, a, ok) => ok ? (X.money(Math.round(med(S, X) * .8)), 'Kẻ đứng trên bạn ngã ngựa vì một lá thư không ai biết ai viết. Hắn bị giải đi giữa buổi chợ, mặt cắt không còn giọt máu. Ngay tuần sau, bạn ngồi vào chỗ của hắn. Nét chữ trong lá thư ấy, tất nhiên, không phải của bạn.')
        : (X.add('hl', -8), 'Một tay chân của bạn bị bắt, khai ra hết. Bạn phải đốt nhà kho trong đêm để xóa dấu, nhìn sổ sách cháy thành tro. Lửa táp vào mặt nóng rát. Từ đêm ấy bạn ngủ với con dao dưới gối.') },
    climax: { title: 'Bước cuối', body: () => 'Chỉ còn một người đứng trên bạn trong vùng. Hắn già rồi, nhưng chưa lẩm cẩm. Bạn biết hắn cũng đang nhìn bạn, như bạn đang nhìn hắn.',
      choices: (S, X, a) => [{ k: 'seize', label: 'Lật đổ hắn', sub: `Chừng ${Math.round(G.clamp(.4 + (a.d.ok ? .2 : 0) + pb(a), .1, .9) * 100)}% thành.` },
        { k: 'deal', label: 'Ép hắn nhường ghế', sub: 'Chậm hơn, ít máu hơn.' }, { k: 'back', label: 'Dừng lại', sub: 'Giữ những gì đã có.' }],
      apply(S, X, ch, a) {
        if (ch === 'seize') { if (X.chance(G.clamp(.4 + (a.d.ok ? .2 : 0) + pb(a), .1, .9))) { S.fame += 5; X.money(Math.round(med(S, X) * 3)); return { t: 'Một đêm không trăng, phủ đổi chủ. Không có tiếng la, chỉ có tiếng cửa đóng. Sáng ra người ta thấy bạn ngồi ở chiếc ghế cao nhất, áo còn mùi khói đuốc.', o: 'throne' }; }
          X.money(-Math.round(Math.max(0, S.gold) * .6)); X.add('hl', -15); return { t: 'Hắn biết trước. Lính phục sẵn trong phủ, cửa vừa mở đã có tên bay ra. Bạn chạy thoát trong đêm, bỏ lại tất cả: nhà, tiền, cuốn sổ ghi tên.', o: 'fall' }; }
        if (ch === 'deal') { if (X.chance(G.clamp(.6 + pb(a), .1, .9))) { S.fame += 3; return { t: 'Bạn đặt lên bàn những lá thư hắn từng viết, từng lá một, chậm rãi. Hắn đọc, mặt không đổi sắc. Rồi hắn đứng dậy nhường ghế, đi ra cửa mà không ngoái lại.', o: 'throne' }; }
          X.money(-Math.round(Math.max(0, S.gold) * .4)); return { t: 'Hắn đọc mấy lá thư, rồi cười. Hắn đốt chúng ngay trước mặt bạn, từng lá một, chậm rãi y như bạn vừa làm. Rồi hắn gọi lính.', o: 'fall' }; }
        X.add('h', 3); return { t: 'Bạn đứng trước cửa phủ rất lâu, tay đặt lên chuôi dao. Đèn trong phủ tắt dần từng ngọn. Rồi bạn quay về, đi bộ suốt quãng đường, không gọi xe.', o: 'back' };
      },
      auto: S => S.traits.bold > .6 ? 'seize' : S.traits.social > .55 ? 'deal' : 'back' },
    after: { throne: () => 'Người ta cúi đầu khi bạn đi qua. Không ai dám nhìn bạn quá lâu, kể cả con cháu bạn. Bữa cơm nào cũng đầy thức ăn mà không có tiếng nói. Có những đêm bạn giật mình, tưởng nghe tiếng cửa đóng.',
      fall: () => 'Bạn mất hết trong một mùa, nhanh hơn lúc giành được. Những kẻ từng cúi đầu giờ quay mặt đi, có kẻ còn nhổ nước bọt theo. Đêm đêm, bạn vẫn nhẩm lại những cái tên ngày trước, như một thói quen không bỏ được.',
      back: () => 'Bạn đốt cuốn sổ ghi tên, từng trang một, ngồi xem lửa liếm qua những cái tên đã gạch. Đêm ấy bạn ngủ một giấc dài như hồi còn nhỏ. Sáng dậy, nắng đã lên cao, bạn ra chợ mua rau như mọi người.' }
  });

  // ── Kết theo cả đường đi (người dùng chốt 17/10/2026): ngoài kết của cao trào, mỗi mạch chính có kết chỉ mở ra khi đi đúng
  // lối (a.d.path), thử thách thành (a.d.ok) rồi chọn một kết ở cao trào (o). when(a, o) → kết mới; good: có tính là làm được không.
  const PATH_END = {
    m_avenge: [{ o: 'merc_win', when: (a, o) => o === 'win' && a.d.path === 'guild', good: true, mark: 'cao_thu',
      sum: d => `trả nợ máu cho ${d.kin || 'người đã mất'} bằng tay nghề luyện ở hội mạo hiểm, rồi thành mạo hiểm giả có tiếng`,
      after: (S, X, a) => { const m = mateOf(S, a); return `Bạn không trả tấm thẻ đồng cho hội. Tên bạn được khắc lên tấm bảng gỗ trong sảnh, chỗ dành cho những người đã làm xong việc không ai dám nhận.${m ? ` ${m} vẫn đi cùng bạn, tóc đã điểm bạc, tối nào cũng kể lại chuyện năm ấy cho đám mạo hiểm giả trẻ nghe.` : ''} Có người tới hội nhờ đòi một món nợ máu. Bạn nghe hết, rồi nhận, không lấy tiền.`; } },
      { o: 'rank_win', when: (a, o) => (o === 'win' || o === 'burn') && a.d.path === 'rank', good: true, mark: 'nguoi_dung_dau',
      sum: d => `leo lên chức cao, dùng quyền trong tay đòi nợ máu cho ${d.kin || 'người đã mất'}`,
      after: () => 'Bạn ngồi ghế chỉ huy đồn trấn thêm nhiều năm. Ai tới kêu oan, bạn đều cho vào, nghe tới cuối, không để ai phải tự đi đòi nợ máu như bạn năm xưa. Đêm khuya xem sổ, có lúc bạn dừng bút, nghĩ: mình leo lên đây vì một mối thù, mà ngồi lại vì những người này.' },
      { o: 'law_win', when: (a, o) => o === 'burn' && a.d.path === 'law', good: true, mark: 'duoc_tin',
      sum: d => `kiện được lãnh chúa đã hại ${d.kin || 'người nhà'}, đòi đất về cho cả vùng bằng giấy tờ và người làm chứng`,
      after: () => 'Người trong vùng gọi bạn là người đọc được văn tự. Nhà nào có chuyện đất, chuyện nợ, đều mang giấy tới nhờ bạn xem, bạn xem không lấy tiền. Cái ống tre năm xưa bạn vẫn giữ, giờ đựng cả trăm lá đơn của người khác.' },
      { o: 'cleansed', when: (a, o) => (o === 'win' || o === 'spare') && a.d.path === 'faith', good: true, mark: 'nguoi_moc_dao',
      sum: d => `cùng người của đền trừ tà, đưa ${d.kin || 'người thân'} về nằm yên`,
      after: () => 'Bạn ở lại đền thêm nhiều năm, theo vị tư tế già tới những làng có người mất tích đêm trăng. Ông mất, bạn đi một mình. Ở đâu có vòng tròn vẽ bằng máu, người ta lại cho người đi tìm bạn.' },
      { o: 'band_win', when: (a, o) => o === 'win' && a.d.path === 'band' && (!a.d.foe || a.d.foe === 'beast' || a.d.foe === 'bandit'), good: true, mark: 'nguoi_giu_lang',
      sum: d => `cùng một toán thợ săn trả nợ máu cho ${d.kin || 'làng'}, rồi giữ toán ấy lại làm phường săn giữ làng`,
      after: (S, X, a) => { const m = mateOf(S, a); return `Toán người năm ấy không giải tán. Họ thành phường săn của làng, đứa trai nào lớn lên cũng xin được theo.${m ? ` ${m} giữ cái tù và của phường, sáng nào cũng thổi một hồi.` : ''} Mỗi năm vào đúng ngày ấy, cả phường ra mộ ${a.d.kin || 'những người đã mất'} mài giáo, rồi ngồi uống với nhau tới khuya.`; } }],
    m_rise: [{ o: 'venture_rich', when: (a, o) => o === 'rich' && a.d.path === 'venture', good: true, mark: 'ke_di_xa',
      sum: () => 'thoát nghèo nhờ những chuyến liều mạng ở nơi nguy hiểm',
      after: () => 'Bạn treo ngọn giáo cũ lên vách, mũi đã mẻ, cán đã nứt. Con cháu muốn theo nghề ấy, bạn lắc đầu, rồi kể cho chúng nghe những đêm nằm trong rừng không dám thở. Kể xong, bạn lại lấy ngọn giáo xuống lau, như vẫn còn tiếc.' },
      { o: 'workshop', when: (a, o) => (o === 'rich' || o === 'steady') && a.d.path === 'skill' && a.d.ok, good: true, mark: 'danh_tho',
      sum: () => 'thoát nghèo nhờ một cái nghề, mở xưởng riêng', after: () => 'Cái xưởng nhỏ của bạn treo tấm biển gỗ, chữ do chính tay bạn khắc. Bạn nhận ba đứa học việc, đứa nào cũng con nhà nghèo, như bạn năm xưa. Bạn không gõ thước vào tay chúng. Có lẽ đó là chỗ duy nhất bạn làm khác thầy mình.' }],
    m_power: [{ o: 'self_made', when: (a, o) => o === 'top' && a.d.path === 'alone' && a.d.ok, good: true, mark: 'vuot_doi_thu',
      sum: () => 'tự luyện một mình, không thầy, mà vươn tới đỉnh', after: () => 'Người ta hỏi thầy bạn là ai. Bạn chỉ lên ngọn núi có túp lều cũ, giờ mái tranh đã sập. Họ tưởng bạn đùa. Bạn không giải thích thêm.' }],
    m_craft: [{ o: 'new_style', when: (a, o) => o === 'work' && a.d.path === 'new' && a.d.ok, good: true, mark: 'dong_moi',
      sum: () => 'mở ra một lối làm mới mà thợ đời sau gọi theo tên mình', after: () => 'Thợ trẻ khắp vùng làm theo lối của bạn, gọi nó bằng tên bạn. Lối ấy bắt đầu từ một tờ giấy trắng để cả tuần không vẽ nổi một nét. Có người làm hay hơn bạn. Bạn mừng, mừng thật, dù đêm ấy vẫn lôi đồ nghề ra làm lại một món cũ.' }],
    m_lead: [{ o: 'feared', when: (a, o) => o === 'chosen' && a.d.path === 'fear', good: false, mark: 'ba_chu',
      sum: () => 'được bầu làm người đứng đầu vì người ta sợ', after: () => 'Hũ đậu đầy, nhưng không ai nhìn vào mắt bạn lúc bỏ hạt. Bạn ngồi ghế trên nhiều năm. Lời bạn nói ra không ai cãi, mà cũng không ai đáp. Tối nào bạn cũng ăn cơm một mình.' },
      { o: 'elder', when: (a, o) => o === 'step' && a.d.path === 'serve' && a.d.ok, good: true, mark: 'nguoi_dung_dau',
      sum: () => 'không ngồi ghế trưởng mà làng vẫn tìm tới mình', after: () => 'Người khác ngồi ghế trưởng làng. Nhưng có chuyện khó, người ta vẫn gõ cửa nhà bạn trước, dù đêm hay ngày. Con đê bạn rủ cả làng đắp năm nào vẫn đứng đó. Bạn thấy thế là đủ.' }],
    m_faith: [{ o: 'own_way', when: (a, o) => o === 'left' && a.d.path === 'seek', good: true, mark: 'buong_bo',
      sum: () => 'bỏ đạo cũ, tự tìm ra lời giải của riêng mình', after: () => 'Bạn không vào đền nữa. Sáng nào bạn cũng ngồi trước hiên, nhìn mặt trời lên qua rặng tre. Mấy cuốn kinh của đủ các đạo vẫn xếp trên kệ, bạn không đọc lại. Bạn thấy đủ rồi.' }],
    m_road: [{ o: 'trader', when: (a, o) => o === 'settle' && a.d.path === 'caravan' && a.d.ok, good: true, mark: 'duoc_tin',
      sum: () => 'theo đoàn buôn đi xa rồi dừng ở một thành buôn, thành người nối hai miền', after: () => 'Bạn mở một quán trọ ở ngã ba đường buôn, ngay chỗ đoàn năm nào hay dừng nghỉ. Đoàn nào đi qua cũng ghé, mang tin từ cả hai đầu đất nước. Giá muối ở miền biển bạn biết trước cả quan thu thuế. Đêm đêm, tiếng lục lạc lừa lại vang ngoài sân.' }],
    m_house: [{ o: 'allied', when: (a, o) => o === 'claimed' && a.d.path === 'match', good: true, mark: 'che_cho',
      sum: () => 'được nhận lại tên nhà nhờ một cuộc liên hôn', after: () => 'Ngày cưới, hai họ ngồi chung một mâm, rượu rót tràn chén. Tên bạn được ghi vào gia phả của cả hai nhà. Bà mối năm nào cũng có mặt, ngồi cuối chiếu, cười suốt buổi.' }],
    m_guard: [{ o: 'militia', when: (a, o) => (o === 'held' || o === 'wall') && a.d.path === 'watch' && a.d.ok, good: true, mark: 'nguoi_dung_dau',
      sum: () => 'lập đội dân canh thành lệ của làng', after: (S, X, a) => { const m = mateOf(S, a); return `Đội dân canh của bạn thành lệ làng: trai mười sáu tuổi nào cũng phải canh một mùa. Ngày nhận giáo, chúng đứng xếp hàng trước cổng, nghe bạn dặn những câu đã dặn từ thuở đầu.${m ? ` ${m} đứng bên cạnh, thỉnh thoảng nhắc thêm một câu bạn quên.` : ''} Lệ ấy giữ tới đời cháu.`; } }],
    m_love: [{ o: 'eloped', when: (a, o) => o === 'wed' && a.d.path === 'elope', good: true, mark: 'que_moi',
      sum: () => 'bỏ đi cùng người thương, dựng nhà ở nơi không ai biết', after: (S, X, a) => `Ở chốn mới không ai hỏi hai người từ đâu tới. ${lov(a)} trồng một giàn hoa trước cửa, giống hệt giàn hoa ở nhà cũ. Mùa hoa nở, bạn ngồi dưới giàn, nhớ cái đêm không trăng năm ấy, hai bàn tay dò đường trong bóng tối. Bạn chưa bao giờ hối hận.` }],
    m_lore: [{ o: 'scholar', when: (a, o) => o === 'shared' && a.d.path === 'books' && a.d.ok, good: true, mark: 'biet_bi_mat',
      sum: () => 'thành học giả, sách mang tên mình nằm trong thư viện kinh đô', after: () => 'Học viện kinh đô mời bạn lên giảng một mùa. Bạn đi, mang theo cuốn sổ ghi chép đầu tiên, mép đã rách, chữ đã nhòe. Giữa giảng đường, bạn mở nó ra, đọc to cái ký tự năm xưa từng chép lên tay áo. Lần này, cả giảng đường cùng hiểu.' }],
    m_atone: [{ o: 'forgiven', when: (a, o) => o === 'redeemed' && a.d.path === 'seek' && a.d.ok, good: true, mark: 'buong_bo',
      sum: () => 'tìm được người mình từng làm hại và được chính người ấy tha', after: (S, X, a) => { const m = mateOf(S, a); return `Một chiều, ${m || 'người ấy'} tới tìm bạn, nắm lấy tay bạn, nói một câu bạn đợi nửa đời. Bạn không nhớ mình đã đáp lại thế nào. Chỉ biết từ hôm đó, bạn không còn mơ thấy chuyện cũ nữa.`; } }],
    m_shadow: [{ o: 'puppet', when: (a, o) => o === 'throne' && a.d.path === 'patron', good: false, mark: 'ke_tiem_quyen',
      sum: () => 'leo lên ghế nhờ kẻ quyền thế rồi làm con rối cho hắn', after: () => 'Bạn ngồi ghế trên, nhưng mọi tờ lệnh đều phải qua tay kẻ đã đưa bạn lên. Hắn vẫn sai bạn như xưa, chỉ là giọng lịch sự hơn. Bạn hiểu mình chỉ đổi một chủ này lấy một chủ khác. Trong cuốn sổ nhỏ, bạn bắt đầu viết tên hắn.' }]
  };
  for (const [k, L] of Object.entries(PATH_END)) {
    const d = SAGA[k], e0 = d.end;
    for (const x of L) { d.after[x.o] = x.after; d.sum[x.o] = x.sum; d.marks[x.o] = x.mark; if (x.good) d.good.push(x.o); }
    d.end = (S, X, a, p, o) => { const x = L.find(x => x.when(a, o)); return x ? x.o : e0 ? e0(S, X, a, p, o) : o; };
  }

  // ═════════ 3. Gieo mạch, chọn đường đời ═════════
  const sg = S => S.saga || (S.saga = { seed: {}, why: {}, k: null, asked: 0, t: null, init: false });
  // Ngã rẽ: sau khi chọn đường đời, một lần gieo ≥ turnHit cho mạch khác, hoặc mạch đó đã lớn thêm ≥ turnGrow kể từ lúc chọn, thì mở sg_turn.
  G.SAGA_TURN = { hit: 2.5, grow: 6, gap: 6, max: 3, keep: 1, hitK: 3, newMin: 1.5 };
  const addSeed = (S, k, v, why) => {
    if (!SAGA[k] || !v) return; const g = sg(S); g.seed[k] = (g.seed[k] || 0) + v;
    let w = null;
    if (why) { w = String(why).split(/(?<=[.!?])\s/)[0].slice(0, 110); (g.why[k] = g.why[k] || []).push(w); if (g.why[k].length > 3) g.why[k].shift(); }
    const TT = G.SAGA_TURN;
    if (g.k && k !== g.k && !g.turn && v > 0 && (g.turns || 0) < TT.max && (v >= TT.hit || g.seed[k] - ((g.base || {})[k] || 0) >= TT.grow)) g.turn = { k, why: w, t: S.age, v };
  };
  // Bảng gieo / đi theo: id sự kiện → điểm cho từng mạch chính. Trước khi chọn đường đời: cộng điểm gieo; sau khi chọn: sự kiện
  // có điểm ≥ 0,5 cho mạch đã chọn là "đi theo mạch".
  const SEED = G.SAGA_SEED = {
    ch_raid: { m_avenge: 1, m_lead: .5 }, ad_bandits: { m_avenge: .8, m_rise: .5 }, ad_tide: { m_avenge: .6, m_power: .5 }, ad_war: { m_avenge: .5, m_lead: .6, m_power: .5 },
    ad_tax: { m_rise: 1, m_lead: .5 }, ch_hunger: { m_rise: 1.5 }, ad_harvest: { m_rise: .6 }, ch_coin: { m_rise: .5 }, ad_dice: { m_rise: .5 }, ad_inherit: { m_house: 1.2, m_rise: .5 },
    cv_test: { m_power: .8 }, tn_first_hunt: { m_power: .8, m_avenge: .4 }, ad_tourney: { m_power: 1.5 }, tn_brawl: { m_power: .5 }, ad_bounty_post: { m_power: .8, m_avenge: .5, m_rise: .4 },
    tn_apprentice: { m_craft: 2 }, ch_letters: { m_craft: .5, m_faith: .5 }, ad_guild: { m_craft: 1, m_rise: .5 }, el_memoir: { m_craft: .5, m_house: .5 },
    inf_bless: { m_faith: 1 }, ad_preacher: { m_faith: 1 }, fa_pilgrim: { m_faith: 1.2 },
    ch_festival: { m_lead: .5, m_house: .3 }, tn_rite: { m_house: .5, m_lead: .3 }, ad_old_friend: { m_lead: .3, m_road: .3 },
    ch_pup: { m_road: .4 }, ch_lost: { m_road: .6 }, ad_restless: { m_road: 1.5 }, ad_map: { m_road: 1.5 }, ad_trinket: { m_road: .5, m_craft: .3 }, ad_companion: { m_road: 1 }, ad_sandstorm: { m_road: .5 },
    tn_love: { m_house: .5 }, ad_suitor: { m_house: .5 }, ad_kid: { m_house: .6, m_lead: .3 }, el_grandkid: { m_house: .6 },
    // Văn hóa tộc (js/racev.js, js/culture.js)
    dwf_pick: { m_craft: .6 }, dwf_cup: { m_craft: .6 }, dwf_mood: { m_craft: 1.5 }, dwf_master: { m_craft: 1.2 }, dwf_vein: { m_rise: .8 }, dwf_hold_call: { m_avenge: .6, m_lead: .5 },
    dwf_cheat: { m_rise: .5 }, dwf_shame: { m_house: .8 }, orc_trial: { m_power: .8 }, orc_hunt: { m_power: .5, m_lead: .3 }, orc_chief_old: { m_lead: 1.5 }, orc_raid_call: { m_lead: .5, m_power: .5 },
    orc_rival: { m_power: .8 }, orc_blood: { m_house: .5, m_avenge: .5 }, bst_alpha_old: { m_lead: 1.5 }, bst_pack_hunt: { m_power: .4, m_lead: .3 }, elf_sea: { m_road: 1.5 },
    elf_loggers: { m_avenge: .5, m_lead: .5 }, fae_court_call: { m_lead: .5, m_faith: .5 }, mer_dry: { m_road: .6 }, drg_debt: { m_house: .8 }, drg_greed: { m_rise: .8 }, cst_plate: { m_craft: .6 }
  };
  // Mạch chính mới (Giữ làng, Một mối tình, Bí mật cổ xưa): cộng vào bảng gieo của các sự kiện có sẵn.
  for (const [id, o] of Object.entries({ ch_raid: { m_guard: 1 }, ad_war: { m_guard: .8 }, ad_bandits: { m_guard: .6 }, ad_tide: { m_guard: .6 }, dwf_hold_call: { m_guard: .6 }, elf_loggers: { m_guard: .5 },
    tn_love: { m_love: 1.5 }, ad_suitor: { m_love: 1 }, ad_map: { m_lore: .8 }, ad_map_found: { m_lore: 1 }, ad_trinket: { m_lore: .5 }, ch_letters: { m_lore: .5 }, el_memoir: { m_lore: .3 } }))
    SEED[id] = Object.assign(SEED[id] || {}, o);
  // Sự kiện tuổi nhỏ gieo đường đời (người dùng ghi chú 18/10/2026): av_* mở các loại kẻ thù của Món nợ máu (mỗi đời nhiều nhất một),
  // ri_* làm sâu lý do Thoát nghèo (chịu nhục vì nghèo, gắn bó với người nhà; ghi S.flags.riMem để hồi mở đầu nhắc lại).
  Object.assign(SEED, { av_bandit: { m_avenge: 3, m_guard: .5 }, av_lord: { m_avenge: 3, m_rise: .5, m_lead: .3 }, av_cult: { m_avenge: 3, m_faith: .8, m_lore: .5 }, av_betray: { m_avenge: 3, m_rise: .5 },
    ri_patch: { m_rise: 1.2, m_power: .3 }, ri_creditor: { m_rise: 1.5 }, ri_meal: { m_rise: 1.2, m_house: .5 }, ri_market: { m_rise: 1.2, m_lead: .3 }, ri_sib: { m_rise: 1, m_house: .5 }, ri_feast: { m_rise: 1 } });
  {
    const free = S => !S.dead && !S.undead && !(S.saga && S.saga.k), avFree = S => free(S) && !S.flags.avSeed, sibOf = S => (S.family.sibs || []).find(s => s.alive);
    const mem = (S, m, t) => { S.flags.riMem = { m, w: t.slice(0, 30) }; return t; };
    const zoneOf = (S, X) => X.reg(S).zones[1] || X.reg(S).zones[0];
    const EV = [
      { id: 'av_bandit', st: ['child', 'teen'], w: .08, tree: { body: 'living', theme: 'robbery' }, c: avFree,
        run(S, X) { const kin = X.pick(['chú', 'bác', 'cậu']), nick = X.pick(NICK), n = foeName(X, foeRace(S, AV_FOE.bandit.race, X)); S.flags.avSeed = 1; foeQ(S, 'bandit', { foeN: n, kin, nick }); X.add('h', -10);
          return { t: `${cap(kin)} gánh hàng qua đèo đi chợ phiên, hứa mang về cho bạn một thỏi kẹo mạch nha. Ba ngày sau người ta khiêng ${kin} về trên một tấm cửa, gánh hàng thì không thấy đâu. Người ta bảo đó là toán cướp ${nick}, kẻ cầm đầu tên ${n}. Cái đòn gánh gãy dựng ở góc nhà từ hôm ấy, không ai nỡ đem đốt.`, k: 'bad' }; } },
      { id: 'av_lord', st: ['child', 'teen'], w: .06, tree: { body: 'living' }, c: S => avFree(S) && S.q <= 3 && !!kinHome(S),
        run(S, X) { const p = kinHome(S), n = foeName(X, foeRace(S, null, X)); p.alive = false; S.flags.avSeed = 1; foeQ(S, 'lord', { foeN: n, kin: p.role }); X.add('h', -15);
          return { t: `Lãnh chúa ${first(n)} cho người tới cắm mốc lại đất, mảnh ruộng nhà bạn nằm trọn bên kia hàng mốc. ${cap(p.role)} lên dinh kêu oan, bị đánh ba mươi roi ngay trước cổng. Người ta khiêng ${p.role} về trên tấm phản, nằm chưa hết mùa thì mất. Bạn cất tờ văn tự đất vào một ống tre, giấu dưới chân giường.`, k: 'bad' }; } },
      { id: 'av_cult', st: ['child', 'teen'], w: .06, tree: { body: 'living', theme: 'dark' }, c: S => avFree(S) && !!sibOf(S),
        run(S, X) { const s = sibOf(S), n = foeName(X, X.pick(AV_FOE.cult.race)), z = zoneOf(S, X); s.alive = false; S.flags.avSeed = 1; foeQ(S, 'cult', { foeN: n, kin: s.name }); X.add('h', -15);
          return { t: `Một đêm trăng tròn, ${s.name} ra giếng đầu làng lấy nước, và không về. Cả làng đốt đuốc tìm ba ngày, chỉ thấy một vòng tròn vẽ bằng máu khô trên tảng đá ở ${z.nameVi}. Người lớn thì thầm về một kẻ áo đen tên ${first(n)}, hay lảng vảng quanh các nghĩa địa cũ. Bạn đặt cái gáo của ${s.name} lên bậu cửa, đêm nào cũng nhìn ra giếng.`, k: 'bad' }; } },
      { id: 'av_betray', st: ['child', 'teen'], w: .06, tree: { body: 'living' }, c: S => avFree(S) && !!kinHome(S),
        run(S, X) { const p = kinHome(S), n = foeName(X, foeRace(S, null, X)), f = first(n); p.alive = false; S.flags.avSeed = 1; foeQ(S, 'rival', { foeN: n, kin: p.role }); X.add('h', -12);
          return { t: `${cap(p.role)} đi một chuyến buôn xa cùng ${f}, người bạn chí cốt từ thuở nhỏ. Hai tháng sau chỉ mình ${f} về, mắt đỏ hoe, kể rằng ${p.role} trượt chân ở đèo, cả chuyến hàng rơi xuống vực theo. Ở đám tang, hắn khóc to hơn ai hết. Chẳng bao lâu sau, ${f} lên thành mở một cửa hiệu, không ai hiểu vốn ở đâu ra.`, k: 'bad' }; } },
      { id: 'ri_patch', st: ['child'], w: .8, tree: { body: 'living', theme: 'hardship' }, c: S => free(S) && S.q <= 2,
        run(S, X) { const pp = ppOf(S); X.add('h', -5);
          return { t: mem(S, 'miếng vá trên vai áo và tiếng cả bọn cười', `Hôm hội làng, bạn mặc cái áo ${pp} vá lại từ áo cũ. Thằng con nhà trưởng thôn chỉ vào miếng vá trên vai, cả bọn cười ồ, có đứa còn gọi bạn là đồ giẻ rách. Bạn đứng im, tay đè lên miếng vá. Về nhà bạn không kể, chỉ hỏi ${pp} có cách nào vá cho khéo hơn không.`), k: 'bad' }; } },
      { id: 'ri_creditor', st: ['child', 'teen'], w: .8, tree: { body: 'living', theme: 'hardship' }, c: S => free(S) && S.q <= 2 && !!kinHome(S),
        run(S, X) { const pp = ppOf(S); X.add('h', -8);
          return { t: mem(S, 'buổi sáng chủ nợ dắt con bò ra khỏi chuồng', `Chủ nợ tới nhà lúc trời vừa sáng, dẫn theo hai gã lực điền. ${cap(pp)} quỳ xuống xin khất thêm một mùa, hắn không nghe, sai người dắt con bò duy nhất ra khỏi chuồng. Cả xóm đứng ngoài rào xem. Bạn nép sau cánh cửa, nhìn ${pp} vẫn quỳ đó mãi khi con bò đã đi khuất.`), k: 'bad' }; } },
      { id: 'ri_meal', st: ['child'], w: .8, tree: { body: 'living', theme: 'hardship' }, c: S => free(S) && S.q <= 2 && !!kinHome(S),
        run(S, X) { const pp = ppOf(S); X.add('h', -2); X.add('so', 2);
          return { t: mem(S, `cái đêm thấy ${pp} ngồi cạo cháy nồi`, `Bữa tối chỉ có một nồi cháo, ${pp} múc cho bạn bát đặc nhất, bảo mình đã ăn ngoài đồng rồi. Đêm ấy bạn dậy đi tiểu, thấy ${pp} ngồi một mình bên bếp, cạo cháy dưới đáy nồi bỏ vào miệng. Bạn lặng lẽ nằm lại, mắt mở tới sáng. Từ hôm ấy, bữa nào bạn cũng nói dối là mình no.`), k: 'info' }; } },
      { id: 'ri_market', st: ['child', 'teen'], w: .8, tree: { body: 'living', theme: 'hardship' }, c: S => free(S) && S.q <= 2 && !!kinHome(S),
        run(S, X) { const pp = ppOf(S); X.add('h', -6);
          return { t: mem(S, 'gánh rau bị hất xuống bùn giữa chợ', `Bạn theo ${pp} gánh rau ra chợ huyện, đi từ lúc gà gáy. Gã thương lái lật từng bó, chê héo, chê nhỏ, rồi trả nửa giá. ${cap(pp)} nài thêm mấy đồng, hắn hất đổ cả gánh xuống bùn. Hai người cúi xuống nhặt từng cọng rau giữa chợ, không ai giúp. Trên đường về ${pp} cứ xin lỗi bạn, mà bạn không hiểu ${pp} có lỗi gì.`), k: 'bad' }; } },
      { id: 'ri_sib', st: ['child', 'teen'], w: .8, tree: { body: 'living', theme: 'hardship' }, c: S => free(S) && S.q <= 2 && !!sibOf(S),
        run(S, X) { const nm = sibOf(S).name; X.add('so', 3);
          return { t: mem(S, `mấy đồng ${nm} bọc trong lá chuối`, `${nm} xin đi ở cho một nhà giàu trên trấn, để cả nhà qua được mùa giáp hạt. Hôm đi, ${nm} dúi vào tay bạn mấy đồng bọc trong lá chuối, dặn cất đi, đừng cho ai biết. Tết ấy ${nm} không được về. Bạn giữ mấy đồng ấy không tiêu, tới khi lá chuối khô giòn.`), k: 'info' }; } },
      { id: 'ri_feast', st: ['child'], w: .8, tree: { body: 'living', theme: 'hardship' }, c: S => free(S) && S.q <= 2,
        run(S, X) { const pp = ppOf(S), s = sibOf(S); X.add('h', -4);
          return { t: mem(S, 'cái Tết nhà bên mổ lợn, nhà mình không có thịt', `Tết năm ấy nhà hàng xóm mổ lợn, mùi thịt luộc bay sang tận bếp nhà bạn. Nhà bạn chỉ có nồi bánh nhỏ, ${pp} phải đi vay mới đủ gạo. ${s ? `${s.name} hỏi sao nhà mình không có thịt, ${pp} quay mặt đi. Bạn kéo ${s.name} ra sân, chỉ lên trời bảo đếm sao, đếm tới khi ngủ gục.` : `Bạn hỏi sao nhà mình không có thịt, ${pp} quay mặt đi, vai run run. Bạn không hỏi nữa, tới tận bây giờ.`}`), k: 'bad' }; } }
    ];
    for (const e of EV) { G.EVENTS.push(e); G.treeWrap.event(e); }
  }
  // Dấu mới gieo cho mạch chính: lỗi cũ gọi Chuộc lỗi, quyền giành bằng tay bẩn gọi Tham vọng, nợ máu gọi báo thù / giữ làng.
  const MARK_SEED = { tay_mau: { m_atone: 2.5, m_shadow: 1 }, cua_phi_nghia: { m_atone: 2.5, m_shadow: .5 }, ke_tiem_quyen: { m_atone: 1, m_shadow: 2.5 }, tieng_xau: { m_atone: 1 },
    thu_chua_tra: { m_avenge: 1.5 }, no_mau: { m_avenge: 1, m_guard: 1 }, cay_dang: { m_atone: .5, m_road: .5 } };
  // Kết của một mạch chính gieo cho mạch sau (đường đời mới, hoặc ngã rẽ).
  const CHAIN = G.SAGA_CHAIN = {
    m_avenge: { spare: { m_guard: 2, m_faith: 1 }, fail: { m_guard: 1, m_shadow: 1 }, win: { m_guard: 1.5 }, burn: { m_guard: 1.5 },
      merc_win: { m_road: 1.5, m_power: 1 }, rank_win: { m_lead: 1.5 }, law_win: { m_lead: 1, m_guard: .5 }, cleansed: { m_faith: 2 } },
    m_rise: { crooked: { m_atone: 3, m_shadow: 1.5 }, ruined: { m_road: 1 }, rich: { m_house: 1, m_lead: 1 }, steady: { m_love: 1 }, venture_rich: { m_road: 1, m_power: 1 } },
    m_power: { broken: { m_atone: 1, m_lore: 1.5 }, top: { m_lead: 1, m_guard: 1 }, honor: { m_guard: 1 } },
    m_craft: { fail: { m_lore: 1 }, work: { m_rise: 1 } },
    m_lead: { rule: { m_shadow: 3, m_atone: 1 }, chosen: { m_guard: 1.5 }, step: { m_love: 1, m_lore: 1 } },
    m_faith: { left: { m_lore: 1.5, m_road: 1 }, saint: { m_guard: 1 }, teacher: { m_guard: .5 } },
    m_road: { settle: { m_love: 1.5, m_house: 1 }, lost: { m_lore: 1 }, beyond: { m_lore: 1 }, home: { m_love: 1 } },
    m_house: { let: { m_love: 1.5 }, founded: { m_lead: 1 }, claimed: { m_lead: 1 } },
    m_guard: { fell: { m_avenge: 1.5 }, held: { m_lead: 1 } }, m_love: { lost: { m_road: 1.5 }, let: { m_faith: 1 } },
    m_lore: { curse: { m_shadow: 1.5, m_atone: 1 }, found: { m_road: 1 } }, m_atone: { redeemed: { m_faith: 1, m_guard: 1 }, hidden: { m_shadow: 1 } },
    m_shadow: { throne: { m_atone: 1 }, fall: { m_atone: 2, m_rise: 1 }, back: { m_atone: 2.5 } }
  };
  // Sự kiện đời thường hay gặp: đi theo bất kỳ mạch chính nào (góp tiến độ, câu nối của mạch đó).
  const UNIVERSAL = G.SAGA_UNIVERSAL = new Set(['ad_harvest', 'ch_festival', 'ad_tax', 'ad_bandits', 'el_aches', 'ad_kid', 'ad_old_friend', 'ch_raid', 'ad_tourney', 'ad_dice',
    'ad_inherit', 'ad_trinket', 'ad_map', 'ad_restless', 'ad_sandstorm', 'ad_guild', 'el_memoir', 'el_grandkid', 'tn_brawl', 'ad_suitor', 'ad_war', 'ad_tide', 'ch_hunger',
    'law_duel', 'law_tax_up', 'law_fav', 'law_inventory', 'aim_sign', 'ad_preacher', 'ch_spark', 'ch_knight', 'tn_rite']);
  const AIM_ARC = { adventure: 'm_road', martial: 'm_power', scholar: 'm_craft', wealth: 'm_rise', faith: 'm_faith', power: 'm_lead', family: 'm_house' };
  // Gieo lúc mới có trạng thái (lượt đầu): nhà nghèo, con ngoài giá thú, mồ côi, nhà có đạo.
  function sagaInit(S) {
    const g = sg(S); if (g.init) return; g.init = true;
    if (S.q <= 2) addSeed(S, 'm_rise', 1.5, 'Bạn sinh ra trong một nhà nghèo.');
    if (S.flags.bastard) addSeed(S, 'm_house', 3, 'Bạn là con ngoài giá thú.');
    if (S.flags.orphan) addSeed(S, 'm_house', 2, 'Bạn không biết cha mẹ mình là ai.');
    if (S.faith && S.traits.pious > .6) addSeed(S, 'm_faith', 1.2, 'Nhà bạn sùng đạo.');
  }
  const seedOf = (S, X, e, r) => {
    const out = Object.assign({}, SEED[e.id] || {});
    if (e.id === 'ch_raid' && (S.arcs || []).some(a => a.k === 'vengeance' && a.t0 === S.age)) out.m_avenge = 3;
    if (e.id === 'cv_test' && S.tal && G.RANK[S.tal.root] >= 3) out.m_power = 3;
    if (e.id === 'aim_sign' && AIM_ARC[S.aim]) out[AIM_ARC[S.aim]] = 1;
    if (e.id === 'st_parent_lost') out.m_avenge = 3;
    if (out.m_avenge && FOE_SRC[e.id]) { const T = sg(S).foe || (sg(S).foe = {}), f = FOE_SRC[e.id]; T[f] = (T[f] || 0) + out.m_avenge; if (r && r.t) (sg(S).foeWhy || (sg(S).foeWhy = {}))[f] = String(r.t).split(/(?<=[.!?])\s/)[0].slice(0, 110); }   // kẻ thù của Món nợ máu theo chuyện đã gieo
    return Object.keys(out).length ? out : null;
  };
  // Món nợ máu: id sự kiện gieo → loại kẻ thù (AV_FOE); sự kiện av_* ghi sẵn tên kẻ thù, người đã mất vào S.saga.foeQ[loại].
  const FOE_SRC = G.SAGA_FOE_SRC = { ch_raid: 'beast', ad_tide: 'beast', tn_first_hunt: 'beast', dwf_hold_call: 'beast', st_parent_lost: 'beast',
    ad_bandits: 'bandit', ad_bounty_post: 'bandit', av_bandit: 'bandit', ad_war: 'warlord', elf_loggers: 'lord', av_lord: 'lord', av_cult: 'cult', orc_blood: 'rival', av_betray: 'rival' };
  const NICK = ['Râu Đỏ', 'Một Mắt', 'Rắn Lửa', 'Quạ Đen', 'Dao Cùn', 'Chó Điên'];
  const foeRace = (S, L, X) => { if (L) return X.pick(L); const r = S.undead || G.RACES[S.race].construct ? 'human' : S.race; return G.RACES[r].undead ? 'human' : r; };
  const foeName = (X, race) => { const R = G.RACES[race]; return X.name(race, R.sexes.includes('m') ? 'm' : R.sexes[0]); };
  // Loại kẻ thù lúc mở mạch: loại được gieo nhiều nhất (mặc định bầy quái); tên, người đã mất lấy từ sự kiện av_* nếu có.
  function foeSetup(S, X, g) {
    const T = g.foe || {}, k = Object.keys(T).sort((x, y) => T[y] - T[x])[0] || 'beast', F = AV_FOE[k], q = (g.foeQ || {})[k] || {};
    const z = X.reg(S).zones[1] || X.reg(S).zones[0], d = { foe: k, zone: z.id };
    if (k === 'beast') { const sp = X.monsterIn(z); return Object.assign(d, { kin: 'những người làng đã mất', sp: sp && sp.id }); }
    return Object.assign(d, { foeN: q.foeN || foeName(X, foeRace(S, F.race, X)), kin: q.kin || (F.kin ? X.pick(F.kin) : null), nick: k === 'bandit' ? q.nick || X.pick(NICK) : undefined });
  }
  const foeQ = (S, k, o) => { const g = sg(S); (g.foeQ || (g.foeQ = {}))[k] = o; };
  // Điểm của từng mạch lúc chọn: điểm gieo + hướng quỹ đạo + chí hướng.
  G.sagaScore = (S, X) => {
    const g = sg(S), out = {};
    for (const [k, D] of Object.entries(SAGA)) {
      if (D.need && !D.need(S)) continue;
      if ((D.gate || k === 'm_avenge' || k === 'm_house') && !(g.seed[k] > 0)) continue;
      let v = g.seed[k] || 0;
      for (const [ax, x] of Object.entries(D.axes)) v += 3 * x * G.trajShare(S, ax);
      if (D.aim && S.aim === D.aim) v += 2;
      v += (TRAIT[k] || (() => 0))(S);
      out[k] = +v.toFixed(2);
    }
    return out;
  };
  // Tính cách cũng kéo đường đời (để các mạch không lệch về một phía).
  const TRAIT = { m_lead: S => 2 * S.traits.social, m_power: S => 1.1 * S.traits.bold, m_road: S => 1.4 * S.traits.bold, m_faith: S => 1.5 * S.traits.pious, m_craft: S => .6 * S.traits.studious, m_rise: S => (S.q <= 2 ? 1 : 0), m_house: S => S.traits.social * .5,
    m_guard: S => 1.2 * S.traits.bold * (.5 + S.traits.social), m_love: S => 1.2 * S.traits.social, m_lore: S => 1.4 * S.traits.studious, m_atone: S => .8 * S.traits.pious, m_shadow: S => 1.2 * S.traits.bold * (1 - S.traits.pious) };
  const top3 = (S, X) => Object.entries(G.sagaScore(S, X)).sort((a, b) => b[1] - a[1]).slice(0, 3);
  // Mở mạch chính đã chọn; Món nợ máu mang theo người thân, loài quái của mạch Báo thù (mạch phụ đó khép lại, nhập vào mạch chính).
  function openSaga(S, X, k) {
    const g = sg(S), d = { prog: Math.min(3, (g.seed[k] || 0) / 2), why: (g.why[k] || []).slice(-1)[0] || null, t0: X.ctier(S), fv: S.faith && J.faiths[S.faith] ? J.faiths[S.faith].nameVi : null };
    if (k === 'm_avenge') {
      const v = (S.arcs || []).find(a => a.k === 'vengeance');
      if (v) { Object.assign(d, { foe: 'beast', kin: v.d.kin, sp: v.d.sp, zone: v.d.zone }); G.arcEnd(S, X, v, 'merged'); }
      else { Object.assign(d, foeSetup(S, X, g)); if (g.foeWhy && g.foeWhy[d.foe]) d.why = g.foeWhy[d.foe]; }   // câu dẫn kể đúng chuyện đã gieo ra kẻ thù này
    }
    if (k === 'm_guard') { const z = X.reg(S).zones[1] || X.reg(S).zones[0], sp = X.monsterIn(z); Object.assign(d, { sp: sp && sp.id, zone: z.id }); }
    if (k === 'm_love') { const p = (S.cast || []).find(c => c.role === 'tinh' && c.alive !== false) || G.castAdd(S, X, { role: 'tinh', how: 'người bạn thương', bond: 50 }); Object.assign(d, { love: p.id, name: first(p.name) }); }
    const a = G.arcOpen(S, X, k, null, d); if (!a) return false;
    g.k = k; g.t = S.age; g.base = Object.assign({}, g.seed); st('pick', k);
    return true;
  }
  G.SAGA_PICK = 'sg_road';
  DEC.sg_road = {
    prio: 6, gap: 1, tree: { body: 'living' },
    when(S, X) {
      if (S.dead || S.undead) return false; const g = sg(S); if (g.k) return false;
      const R = X.R(S), y = X.years(S), stg = X.stage(S);
      if (g.asked === 0) return (stg === 'teen' && y >= R.adult * .75) || stg === 'adult';
      return g.asked === 1 && stg === 'adult' && S.age - g.t >= 8;
    },
    build(S, X) {
      const L = top3(S, X), g = sg(S);
      return { title: 'Đường đời', body: 'Bạn sắp bước vào đời. Ngồi nhìn lại những năm đã qua, có mấy chuyện cứ trở đi trở lại trong đầu, chuyện nào cũng như một con đường đang gọi. Đường bạn chọn hôm nay sẽ theo bạn tới cuối đời.',
        choices: [...L.map(([k]) => ({ k, label: SAGA[k].nameVi, sub: (g.why[k] && g.why[k].length ? 'Vì: ' + g.why[k][g.why[k].length - 1] + ' ' : '') + SAGA[k].pitch })),
          { k: 'free', label: 'Chưa định, sống theo ngày', sub: g.asked ? 'Không hỏi lại nữa.' : 'Sẽ hỏi lại khi đã lớn hơn.' }] };
    },
    apply(S, X, k) {
      const g = sg(S); g.asked++; g.t = S.age; st('asked', null);
      if (k === 'free' || !SAGA[k]) { st('free', null); return g.asked > 1 ? 'Bạn sống theo ngày, được bữa nào hay bữa ấy. Đời bạn sẽ là những chuyện nhỏ nối vào nhau, chẳng ai chép lại, mà cũng chẳng thiếu gì.' : 'Bạn chưa muốn chọn. Còn trẻ, còn nhiều thời gian, cứ để mọi thứ tự tới.'; }
      openSaga(S, X, k);
      return `Từ hôm ấy, đời bạn có một hướng: ${SAGA[k].pitch.charAt(0).toLowerCase() + SAGA[k].pitch.slice(1)} Bạn chưa biết đường ấy dài bao nhiêu. Chỉ biết là mình đã đặt chân lên.`;
    },
    auto(S, X, d) { const L = top3(S, X); return L.length && L[0][1] >= 1 ? L[0][0] : 'free'; }
  };
  NEWD.push('sg_road');
  // ── Ngã rẽ, đường đời mới (sg_turn) ──
  // Mạch đang đi còn mở: chuyện lớn kéo sang mạch khác (g.turn) → đi tiếp hay rẽ; rẽ thì mạch cũ khép với kết 'turned'.
  // Mạch đã khép (hay phai) mà còn ở tuổi trưởng thành → đường đời mới trong các mạch chưa đi, hoặc sống nốt đời theo ngày.
  const curMain = (S, g) => g.k && (S.arcs || []).find(x => x.k === g.k);
  const lastDone = (S, k) => (S.arcDone || []).filter(d => d.k === k).pop();
  const walked = g => new Set([g.k, ...(g.past || []).map(x => x.k)]);
  // Mạch thay thế: điểm hiện tại, trừ nửa điểm gieo đã có từ lúc chọn đường trước (chuyện gần đây nặng hơn chuyện thơ ấu).
  const alts = (S, X, g, n) => { const W = walked(g), b = g.base || {}; return Object.entries(G.sagaScore(S, X)).map(([k, v]) => [k, +(v - .5 * (b[k] || 0)).toFixed(2)])
    .filter(([k, v]) => !W.has(k) && v >= G.SAGA_TURN.newMin).sort((a, b) => b[1] - a[1]).slice(0, n); };
  // Tự sống trước một chuyện lớn: rẽ theo tính cách (gan thì báo thù, mộ đạo thì chuộc lỗi…).
  const AFF = { m_avenge: S => S.traits.bold > .5, m_atone: S => S.traits.pious > .45 || S.traits.social > .6, m_shadow: S => S.traits.bold > .55 && S.traits.pious < .45,
    m_love: S => S.traits.social > .45, m_guard: S => S.traits.bold > .45, m_lore: S => S.traits.studious > .5, m_faith: S => S.traits.pious > .55, m_road: S => S.traits.bold > .6 };
  const whyOf = (g, k) => (g.why[k] && g.why[k].length ? 'Vì: ' + g.why[k][g.why[k].length - 1] + ' ' : '');
  const keepScore = (S, X, g, a) => (G.sagaScore(S, X)[g.k] || 0) + G.SAGA_TURN.keep + Math.min(3, prog(a) * .3) + ['open', 'knot', 'trial', 'climax', 'after'].indexOf(a.at) * .5;
  // Rẽ sang mạch chính k: mạch đang mở khép với kết 'turned' (ghi mạch rẽ sang), mạch đã khép ghi vào S.saga.past; mở mạch mới.
  function switchMain(S, X, k) {
    const g = sg(S), a = curMain(S, g), old = SAGA[g.k], past = g.past || (g.past = []);
    g.last = S.age; g.turn = null;
    if (a) { a.d.to = k; G.arcEnd(S, X, a, 'turned'); past.push({ k: g.k, o: 'turned', t: S.age }); }
    else { const d = lastDone(S, g.k); past.push({ k: g.k, o: d ? d.o : 'done', t: S.age }); }
    g.turns = (g.turns || 0) + 1; g.k = null; cnt(S, 'sg_turn'); st('turn', k);
    openSaga(S, X, k);
    const p = SAGA[k].pitch.charAt(0).toLowerCase() + SAGA[k].pitch.slice(1);
    return a ? `Bạn bỏ dở đường ${old.nameVi}, những gì đã làm cho nó dừng lại ở đó. Từ nay đời bạn rẽ sang hướng khác: ${p} Không dễ, nhưng bạn đã quyết.` : `Đời bạn có thêm một hướng: ${p} Tay chân còn khỏe, bạn thấy mình như trẻ lại mấy tuổi.`;
  }
  // Hồi chọn lối của mọi mạch chính có thêm lựa chọn rẽ sang mạch khác đang gọi mạnh (điểm ≥ 3).
  const knotTurn = (S, X) => { const g = sg(S); if (!g.k || (g.turns || 0) >= G.SAGA_TURN.max) return [];
    const [x] = alts(S, X, g, 1); return x && x[1] >= 3 ? [{ k: 'turn:' + x[0], label: `Thôi, rẽ sang: ${SAGA[x[0]].nameVi}`, sub: whyOf(g, x[0]) + SAGA[x[0]].pitch }] : []; };
  DEC.sg_turn = {
    prio: 6, gap: 1, tree: { body: 'living' },
    when(S, X) {
      if (S.dead || S.undead) return false; const g = sg(S); if (!g.k || g.settled || (g.turns || 0) >= G.SAGA_TURN.max) return false;
      if (S.age - (g.last ?? -99) < G.SAGA_TURN.gap) return false;
      const a = curMain(S, g);
      if (a) return a.at !== 'after' && !!(g.turn && SAGA[g.turn.k] && !walked(g).has(g.turn.k) && S.age - g.turn.t <= 6 && X.stage(S) !== 'child');
      const d = lastDone(S, g.k);
      return X.stage(S) === 'adult' && (!d || S.age - d.t >= 2) && alts(S, X, g, 1).length > 0;
    },
    build(S, X) {
      const g = sg(S), a = curMain(S, g), cur = SAGA[g.k];
      if (a) {
        const t = g.turn.k, more = alts(S, X, g, 2).map(x => x[0]).filter(k => k !== t).slice(0, 1);
        return { title: 'Ngã rẽ', body: `${g.turn.why ? g.turn.why + (/[.!?…]$/.test(g.turn.why) ? '' : '…') + ' Chuyện ấy' : 'Có một chuyện'} làm bạn chùn chân giữa đường ${cur.nameVi} (${STEP_VI[a.at] || a.at}, tiến độ ${Math.round(prog(a))}). Bao nhiêu công sức đã bỏ vào con đường này, mà con đường kia thì cứ gọi. Đi tiếp, hay rẽ sang đường khác?`,
          choices: [{ k: 'keep', label: `Đi tiếp: ${cur.nameVi}`, sub: `Bỏ ngang thì những gì đã làm cho đường này dừng ở đó.` },
            ...[t, ...more].map(k => ({ k, label: `Rẽ sang: ${SAGA[k].nameVi}`, sub: whyOf(g, k) + SAGA[k].pitch }))] };
      }
      const d = lastDone(S, g.k), sum = d ? G.ARCS[d.k].sum(d.o, null, d) : null;
      return { title: 'Đường đời mới', body: `Đường ${cur.nameVi} đã khép${sum ? ': ' + sum : ''}. Bạn ngồi lại một buổi, thấy tay chân còn khỏe, đời còn dài. Có con đường nào khác đang gọi bạn không?`,
        choices: [...alts(S, X, g, 3).map(([k]) => ({ k, label: SAGA[k].nameVi, sub: whyOf(g, k) + SAGA[k].pitch })), { k: 'free', label: 'Sống nốt đời theo ngày', sub: 'Không hỏi lại nữa.' }] };
    },
    apply(S, X, k) {
      const g = sg(S), a = curMain(S, g), old = SAGA[g.k]; g.last = S.age; g.turn = null;
      if (k === 'keep') { if (a) a.d.prog = prog(a) + 1; g.base = Object.assign({}, g.seed); cnt(S, 'sg_keep'); return `Bạn gạt chuyện ấy sang một bên, như gạt một cành cây chắn lối. Đường ${old.nameVi} vẫn là đường của bạn. Bạn bước tiếp, chân chắc hơn trước.`; }
      if (k === 'free' || !SAGA[k]) { g.settled = true; return 'Bạn không tìm thêm con đường nào nữa. Những năm còn lại là những ngày bình thường: sáng dậy làm việc, chiều về ngồi hiên nhìn người qua lại. Bạn thấy thế cũng là một cách sống.'; }
      return switchMain(S, X, k);
    },
    auto(S, X, d) {
      const g = sg(S), a = curMain(S, g), sc = a ? G.sagaScore(S, X) : Object.fromEntries(alts(S, X, g, 13)), ks = d.choices.map(c => c.k).filter(k => SAGA[k]);
      const best = ks.sort((x, y) => (sc[y] || 0) - (sc[x] || 0))[0];
      if (a) { const t = g.turn || {};
        if (t.v >= G.SAGA_TURN.hit && SAGA[t.k]) return (AFF[t.k] ? AFF[t.k](S) : (sc[t.k] || 0) > (sc[g.k] || 0)) ? t.k : 'keep';   // chuyện lớn: theo tính cách
        return best && (sc[best] || 0) > keepScore(S, X, g, a) ? best : 'keep'; }
      return best && (sc[best] || 0) >= 2 ? best : 'free';
    }
  };
  NEWD.push('sg_turn');
  // Quyết định gieo mạch: chí hướng, bái sư, bầu trưởng làng, vào hội, chọn nghề, đi học.
  const linkDec = (S, X) => { X._lk = true; };
  patchDec('aim_pick', (S, X, k) => { if (AIM_ARC[k] && !sg(S).k) { addSeed(S, AIM_ARC[k], 2, `Bạn quyết chí theo con đường ${((G.AIMS[k] || {}).nameVi || '').toLowerCase()}.`.replace(' .', '.')); linkDec(S, X); } });
  patchDec('mentor', (S, X, k) => { if (k !== 'no' && !sg(S).k) { addSeed(S, 'm_power', 1.5, 'Bạn được một người thầy nhận dạy.'); linkDec(S, X); } });
  patchDec('head_elect', (S, X, k) => { if (k === 'yes') { addSeed(S, 'm_lead', 1.5, 'Bạn ra tranh ghế trưởng.'); linkDec(S, X); } });
  patchDec('school', (S, X, k) => { if (k !== 'no' && !sg(S).k) { addSeed(S, 'm_craft', .8, 'Bạn được đi học.'); linkDec(S, X); } });
  // Lựa chọn tối / lạ cũng gieo đường đời (cả sau khi đã chọn: thành lý do cho Ngã rẽ).
  const DEC_SEED = { dark_offer: { join: [{ m_shadow: 3 }, 'Bạn nhận lời Hắc Giáo.'], fight: [{ m_guard: .8 }, 'Bạn đuổi kẻ truyền đạo bóng tối khỏi làng.'] },
    cv_forbidden: { learn: [{ m_shadow: 2, m_lore: 1.5 }, 'Bạn học một môn cấm thuật.'], report: [{ m_guard: .5 }, 'Bạn báo quan về kẻ dạy cấm thuật.'] },
    cv_rob: { rob: [{ m_shadow: 2, m_atone: 2 }, 'Bạn đã ra tay cướp của người khác.'], guard: [{ m_guard: .6 }, 'Bạn đi cùng người lạ một quãng cho người ta yên tâm.'] },
    cv_ruin: { go: [{ m_lore: 1.2 }, 'Bạn đã bước vào một bí cảnh.'] }, cv_ring: { wear: [{ m_lore: 1.5 }, 'Bạn đeo chiếc nhẫn cổ có linh hồn.'] },
    cv_grave: { dig: [{ m_lore: 1.2 }, 'Bạn đào lên ngôi mộ của kiếp trước.'], pray: [{ m_faith: .5 }, 'Bạn thắp hương trước ngôi mộ kiếp trước.'] },
    marriage: { yes: [{ m_love: 2 }, 'Bạn nhận lời một người.'] } };
  for (const [id, M] of Object.entries(DEC_SEED)) if (DEC[id]) patchDec(id, (S, X, k) => { const r = M[k]; if (!r || S.undead) return; for (const [m, v] of Object.entries(r[0])) addSeed(S, m, v, r[1]); linkDec(S, X); });
  patchDec('work', (S, X, k) => {
    const w = S.work; if (!w || sg(S).k) return;
    const m = ['smith', 'runesmith', 'jeweler', 'sculptor', 'tailor', 'cook', 'painter', 'alchemist'].includes(w) ? 'm_craft' : ['merchant', 'steward', 'appraiser'].includes(w) ? 'm_rise' : ['priest', 'healer'].includes(w) ? 'm_faith' : ['adventurer', 'guard', 'bodyguard', 'hunter'].includes(w) ? 'm_power' : ['sailor', 'porter'].includes(w) ? 'm_road' : null;
    if (m) { addSeed(S, m, 1, `Bạn làm ${G.WORKS[w].nameVi.toLowerCase()}.`); linkDec(S, X); }
  });

  // ═════════ 4. Mạch đời thường (mọc từ quyết định thường): ở js/arcs.js, cùng khuôn full() ═════════

  // ═════════ 5. Bọc chung: trọng số, đi theo mạch, dấu hệ quả ═════════
  const hooked = new Set((G.STORY_HOOKS || []).map(h => h.id));
  const isLone = e => e.rep && !e.story && !hooked.has(e.id) && !(G.treeMeta(e.id) || {}).from && !e.race && !e.faith && !SEED[e.id] && !/^(st|cm|fr|sg|s|m)_/.test(e.id);
  const fitAx = (meta, ax) => { if (!meta || !meta.dir) return 0; let k = 0, f = 0; for (const [a, x] of Object.entries(meta.dir)) { k += x; f += x * Math.min(1, ax[a] || 0); } return k ? f / k : 0; };
  // Sự kiện đi theo mạch chính k: theo bảng gieo, chủ đề, hướng quỹ đạo, dấu hiệu chí hướng.
  const followOf = (S, e, meta, k) => {
    const D = SAGA[k], s = (SEED[e.id] || {})[k] || 0;
    if (s >= .5) return s;
    if (e.faith && k === 'm_faith') return 1;
    if (UNIVERSAL.has(e.id)) return .5;
    if (meta && meta.theme && D.themes.includes(meta.theme)) return .6;
    if (fitAx(meta, D.axes) >= .5) return .6;
    if (e.id === 'aim_sign' && AIM_ARC[S.aim] === k) return 1;
    return 0;
  };
  const LONE = new Set();
  // Bọc sự kiện, nút mới (gọi lại được: js/arcs.js nạp sau thêm nút rồi gọi G.sagaApi.wrap()).
  function wrapAll() {
    for (const e of G.EVENTS) {
      if (!e._story) API.wrapStory(e);   // sự kiện của racev.js, culture.js thêm sau story.js: đếm cùng thang
    }
    for (const e of NEW.splice(0)) { G.treeWrap.event(e); API.wrapStory(e); }
    for (const id of NEWD.splice(0)) G.treeWrap.decision(id, DEC[id]);
    for (const e of G.EVENTS) {
      if (e._saga) continue; e._saga = true;
      if (isLone(e)) LONE.add(e.id);
      const w0 = e.w;
      e.w = keep((S, X) => {
        const w = typeof w0 === 'function' ? w0(S, X) : w0; if (!w || S.undead) return w;
        const meta = G.treeMeta(e.id), mk = markW(S, e.id, meta);
        let m = mk.m; const k = S.saga && S.saga.k;
        if (k) { const f = followOf(S, e, meta, k); if (f) m *= 1 + G.SAGA_CFG.followK * f; else if (LONE.has(e.id)) m *= G.SAGA_CFG.loneK; else if (/_days$/.test(e.id)) m *= G.SAGA_CFG.daysK; }
        return w * m;
      }, typeof w0 === 'function' ? w0 : null);
    }
  }
  wrapAll();
  // Cho js/arcs.js: khuôn mạch đầy đủ và tiện ích chung.
  G.sagaApi = { full, sNode, sDec, wrap: wrapAll, odds, med, late, prog, pb, cnt, AD, TA, TAE };
  // Sau khi sự kiện chạy (story.js gọi): dấu hệ quả → đi theo mạch chính → gieo mạch.
  G.storyLinkHook = function (S, X, e, r) {
    if (S.undead) return false;
    sagaInit(S);
    const meta = G.treeMeta(e.id), mk = markW(S, e.id, meta);
    if (mk.hit) { const M = G.MARKS[mk.hit.id], ec = M.echo && M.echo[e.id]; X._tag = 'Hệ quả · ' + M.nameVi; if (ec) r.t += ' ' + ec; st('markEv', null); return true; }
    // Mạch chính đã khép vẫn còn dư âm: sự kiện hợp mạch vẫn là chuyện của con đường ấy.
    const g = sg(S), a = g.k && (S.arcs || []).find(x => x.k === g.k);
    if (g.k) {
      // Đã có đường đời: sự kiện vẫn gieo cho các mạch khác (lý do cho Ngã rẽ, đường đời mới), kể cả khi nó đi theo mạch đang đi.
      const sd = seedOf(S, X, e, r); let seeded = false;
      if (sd) for (const [k, v] of Object.entries(sd)) if (k !== g.k) { addSeed(S, k, v, r.t); seeded = true; }
      const f = followOf(S, e, meta, g.k); if (!f) { if (seeded) st('seedEv', null); return seeded; }
      if (a) a.d.prog = prog(a) + .5 * f; X._tag = SAGA[g.k].nameVi + (a ? ' · đường đời' : ' · dư âm');
      if (a && X.chance(.45)) r.t += ' ' + X.pick(SAGA[g.k].follow);
      st('follow', null); return true;
    }
    const sd = seedOf(S, X, e, r); if (!sd) return false;
    for (const [k, v] of Object.entries(sd)) addSeed(S, k, v, r.t);
    st('seedEv', null); return true;
  };
  G.SYSTEMS.push({ id: 'saga', when: S => !S.dead, run: (S, X) => G.sagaYear(S, X) });

  // ═════════ 6. Giao diện, trang duyệt ═════════
  const STEP_VI = { open: 'mở đầu', knot: 'chọn đường', trial: 'thử thách', climax: 'cao trào', after: 'kết' };
  G.sagaText = S => {
    if (S.undead) return '—';
    const g = S.saga, a = g && g.k && (S.arcs || []).find(x => x.k === g.k);
    const was = g && g.past && g.past.length ? ` (trước: ${g.past.map(x => SAGA[x.k].nameVi).join(', ')})` : '';
    if (a) return `${SAGA[g.k].nameVi} · ${STEP_VI[a.at] || a.at} · tiến độ ${Math.round(prog(a))}${was}`;
    if (g && g.k && SAGA[g.k]) return `${SAGA[g.k].nameVi} · đã khép${was}`;
    const done = (S.arcDone || []).find(d => SAGA[d.k]);
    if (done) return `${SAGA[done.k].nameVi} · đã khép`;
    if (g && Object.keys(g.seed).length) { const [k] = Object.entries(g.seed).sort((x, y) => y[1] - x[1])[0]; return `Chưa định · đang nghiêng về ${SAGA[k].nameVi}`; }
    return 'Chưa định';
  };
  G.SAGA_TITLE = { sg_road: ['Đường đời', 'cuối thiếu thời (75% tuổi trưởng thành) hoặc đầu tuổi trưởng thành; chưa định thì hỏi lại một lần sau 8 lượt'],
    sg_turn: ['Ngã rẽ / Đường đời mới', 'đang đi một mạch chính mà một chuyện lớn kéo sang mạch khác (một lần gieo ≥ 2, hoặc mạch đó lớn thêm ≥ 3,5 từ lúc chọn): đi tiếp hay rẽ; mạch đã khép mà còn ở tuổi trưởng thành: chọn đường mới; tối đa 3 lần một đời, cách nhau ≥ 6 lượt'] };
  G.SAGA_STEP_VI = STEP_VI;
})(window.LifeSim);
