/* Vạn Kiếp — ĐƯỜNG ĐỜI: MẠCH CHÍNH, MẠCH NGẮN, DẤU HỆ QUẢ (docs/16; người dùng yêu cầu 17/10/2026).
 * Người dùng: sự kiện chỉ đổi chỉ số, lựa chọn chưa dẫn tới đâu; muốn mỗi sự kiện đổi mạch truyện của nhân vật hoặc đi theo mạch
 * đang chạy; có mạch chính, mạch phụ, mạch ngắn; mạch nào nhân vật đi qua cũng để lại ảnh hưởng. Người dùng chốt: ~80% sự kiện
 * thuộc mạch; mạch chính tự nổi lên rồi chốt bằng một quyết định; làm theo đợt (đây là đợt 1).
 * Nạp sau culture.js, dùng G.storyApi của story.js (node / dnode / patch / patchDec / wrapStory). Bốn lớp:
 *   1. Ba tầng mạch (G.ARCS[k].tier, story.js giới hạn số mạch theo tầng): main = 13 mạch chính của file này (G.SAGA; cùng lúc một),
 *      side = mạch người quen của story.js, short = mạch ngắn mọc từ quyết định thường (cuối file này).
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
      echo: { ad_bounty_post: 'Người treo bảng gọi đích danh bạn: nghe nói bạn làm ăn đàng hoàng.', cm_help: 'Người ta tới giúp vì năm ấy bạn đã không bỏ ai.' }, yr: (S, X) => X.add('so', .5) },
    giu_loi:      { nameVi: 'Người giữ lời', tone: 'good', fade: null, d: 'Bạn từng giữ một lời hứa khó giữ.', w: { cm_help: 1.3, ad_suitor: 1.2 }, yr: (S, X) => X.add('so', .3) },
    tieng_xau:    { nameVi: 'Tiếng xấu', tone: 'bad', fade: 15, d: 'Chuyện cũ của bạn đi trước bạn một bước.', w: { ad_suitor: .6, cm_glare: 1.6, cm_help: .6 },
      echo: { ad_suitor: 'Người ta đã nghe chuyện cũ của bạn; mối này chậm hơn mọi khi.', cm_glare: 'Ai cũng nhớ chuyện năm ấy.' }, yr: (S, X) => X.add('so', -.5) },
    ke_thu:       { nameVi: 'Có kẻ thù ngoài kia', tone: 'bad', fade: 20, d: 'Có người vẫn chờ dịp trả lại bạn.', w: { ad_bandits: 1.5, cm_glare: 1.8 },
      echo: { ad_bandits: 'Trong toán cướp có một gương mặt bạn nhận ra: người của kẻ thù cũ.' } },
    tay_mau:      { nameVi: 'Tay dính máu', tone: 'bad', fade: 30, d: 'Bạn từng lấy mạng người, hay thứ gì đó đáng được tha.', w: { tn_brawl: 1.3, ad_bandits: 1.2 },
      echo: { tn_brawl: 'Người ta lùi lại khi thấy ánh mắt bạn.' }, yr: (S, X) => X.add('h', -.3) },
    no_on:        { nameVi: 'Mang ơn', tone: 'info', fade: 20, d: 'Bạn còn nợ một người một món ơn.', w: { cm_visit: 1.5, cm_help: 1.3 } },
    no_mau:       { nameVi: 'Nợ máu đồng đội', tone: 'bad', fade: 15, d: 'Một người đã đỡ đòn thay bạn.', w: { ad_old_friend: 1.3 },
      echo: { ad_old_friend: 'Bạn rót thêm một chén cho người đồng đội đã đỡ đòn thay mình.' }, yr: (S, X) => X.add('h', -.5) },
    ban_cua_thu:  { nameVi: 'Bạn của loài thú', tone: 'good', fade: null, d: 'Bạn từng nuôi một con thú lẽ ra phải giết.', w: { ch_pup: 2, tn_first_hunt: .6 },
      echo: { ch_pup: 'Con vật không sợ bạn; nó tự tìm tới.' }, yr: (S, X) => X.add('h', .2) },
    cua_phi_nghia: { nameVi: 'Của phi nghĩa', tone: 'bad', fade: 15, d: 'Có một khoản tiền bạn không muốn ai hỏi tới.', w: { cm_glare: 1.3, ad_tax: 1.3 },
      echo: { ad_tax: 'Người thu thuế nhìn sổ của bạn lâu hơn mọi nhà.' },
      yr: (S, X) => { if (S.gold > 0 && X.chance(.04)) { const g = Math.round(S.gold * .15); X.money(-g); X.log(`Một khoản phi nghĩa năm nào bị đòi lại: mất ${G.coin(g)}.`, 'bad'); } } },
    nguoi_lap_lang: { nameVi: 'Người lập làng', tone: 'good', fade: null, d: 'Có một ngôi làng mang dấu tay bạn.', yr: (S, X) => X.add('so', .5) },
    que_moi:      { nameVi: 'Đã quen đất mới', tone: 'good', fade: 10, d: 'Đất mới đã thành quê.', w: { ad_restless: .6 }, echo: { ad_restless: 'Nhưng nơi này đã thành quê; bạn ở lại.' } },
    nguoi_la:     { nameVi: 'Người mới tới', tone: 'bad', fade: 4, d: 'Ở đây chưa ai biết bạn là ai.', w: { cm_visit: .6 }, yr: (S, X) => X.add('so', -.5) },
    da_bao_thu:   { nameVi: 'Đã trả nợ máu', tone: 'good', fade: null, d: 'Món nợ máu năm xưa đã trả.', yr: (S, X) => X.add('h', .3) },
    buong_bo:     { nameVi: 'Đã buông', tone: 'good', fade: 20, d: 'Bạn đã đặt xuống một chuyện từng đè nặng.', yr: (S, X) => X.add('h', .4) },
    thu_chua_tra: { nameVi: 'Mối thù chưa trả', tone: 'bad', fade: null, d: 'Món nợ máu vẫn còn đó.', w: { ch_raid: 1.2, ad_tide: 1.3 },
      echo: { ch_raid: 'Lại là bầy quái ấy. Bạn siết chặt cán vũ khí.', ad_tide: 'Bạn đứng đầu hàng, như chờ đúng ngày này.' }, yr: (S, X) => X.add('h', -.4) },
    cao_thu:      { nameVi: 'Cao thủ có tiếng', tone: 'good', fade: null, d: 'Tên bạn được nhắc ở các bãi tập.', w: { ad_tourney: 2, ad_bounty_post: 1.5 },
      echo: { ad_tourney: 'Đám đông nhận ra bạn từ xa; tên bạn đứng đầu bảng.', ad_bounty_post: 'Người ta để dành việc khó nhất cho bạn.' } },
    chan_truyen:  { nameVi: 'Chân truyền', tone: 'good', fade: null, d: 'Bạn giữ một sở học được truyền lại trọn vẹn.', on: (S, X) => { const d = X.dominant(S); if (d) X.gain(d.skill, 5); } },
    danh_tho:     { nameVi: 'Thợ có dấu riêng', tone: 'good', fade: null, d: 'Đồ bạn làm được đóng dấu riêng, có người đặt trước.', yr: (S, X) => X.money(Math.round(med(S, X) * .08)) },
    nha_kha:      { nameVi: 'Nhà đã khá', tone: 'good', fade: null, d: 'Nhà bạn đã thoát nghèo.', on: S => { S.q = Math.min(5, S.q + 1); S.pct = Math.min(.95, S.pct + .15); } },
    tay_trang:    { nameVi: 'Trắng tay làm lại', tone: 'bad', fade: 10, d: 'Bạn mất gần hết vốn liếng.', on: S => { S.gold = Math.round(Math.max(0, S.gold) * .3); }, yr: (S, X) => X.add('h', -.3) },
    nguoi_dung_dau: { nameVi: 'Người đứng đầu', tone: 'good', fade: null, d: 'Người ta tìm bạn khi có chuyện chung.', w: { cm_help: 1.3 }, yr: (S, X) => { X.add('so', .5); S.fame = Math.min(100, S.fame + .2); } },
    ke_tiem_quyen: { nameVi: 'Kẻ tiếm quyền', tone: 'bad', fade: null, d: 'Bạn ngồi vào ghế bằng cách người ta không quên.', w: { cm_glare: 1.5 }, yr: (S, X) => X.add('so', -.3) },
    nguoi_moc_dao: { nameVi: 'Người mộ đạo', tone: 'good', fade: null, d: 'Đức tin đã thành chỗ dựa.', yr: S => { if (S.faith) S.devotion = Math.min(100, S.devotion + 2); } },
    bo_dao:       { nameVi: 'Kẻ bỏ đạo', tone: 'bad', fade: 10, d: 'Bạn đã quay lưng với đạo cũ.', yr: (S, X) => X.add('h', -.2) },
    ke_di_xa:     { nameVi: 'Người từng đi xa', tone: 'good', fade: null, d: 'Bạn đã thấy những nơi người làng chỉ nghe kể.', w: { ad_restless: .5, ad_old_friend: 1.3 },
      echo: { ad_old_friend: 'Bạn kể chuyện những vùng đã qua tới khi đèn cạn dầu.' }, yr: (S, X) => X.add('sm', .3) },
    ten_nha:      { nameVi: 'Tên nhà được nhận', tone: 'good', fade: null, d: 'Họ tộc đã nhận lại bạn.', on: S => { S.fame = Math.min(100, S.fame + 5); }, yr: (S, X) => X.add('so', .3) },
    dong_moi:     { nameVi: 'Người mở dòng mới', tone: 'good', fade: null, d: 'Con cháu bạn sẽ đọc tên bạn đầu tiên.' },
    ban_cu:       { nameVi: 'Có bạn cũ', tone: 'good', fade: 25, d: 'Có người nhớ bạn từ hồi còn trẻ.', w: { cm_visit: 1.4, cm_help: 1.4 } },
    vuot_doi_thu: { nameVi: 'Đã vượt đối thủ', tone: 'good', fade: 15, d: 'Bạn đã hơn được kẻ luôn hơn mình.', yr: (S, X) => X.add('h', .2) },
    cay_dang:     { nameVi: 'Nỗi cay đắng', tone: 'bad', fade: 10, d: 'Một lần thua còn nhức.', yr: (S, X) => X.add('h', -.3) },
    tinh_than:    { nameVi: 'Tình ruột thịt', tone: 'good', fade: 25, d: 'Họ hàng biết có thể tìm tới bạn.', w: { cm_help: 1.3 } },
    nguoi_giu_lang: { nameVi: 'Người giữ làng', tone: 'good', fade: null, d: 'Làng nhớ bạn đã đứng ở cổng.', w: { ch_raid: 1.2 },
      echo: { ch_raid: 'Người làng chạy về phía bạn trước khi chạy về nhà.' } },
    tinh_mot_doi: { nameVi: 'Một mối tình trọn', tone: 'good', fade: null, d: 'Có một người ở bên bạn tới cuối.', yr: (S, X) => X.add('h', 1) },
    biet_bi_mat:  { nameVi: 'Người biết bí mật', tone: 'good', fade: null, d: 'Bạn biết một điều cổ xưa mà ít ai biết.', w: { ad_map: 1.3 },
      echo: { ad_map: 'Ký tự trên tấm bản đồ này bạn đọc được.' } },
    da_chuoc:     { nameVi: 'Đã chuộc lỗi', tone: 'good', fade: null, d: 'Món nợ cũ với đời bạn đã trả bằng việc làm.', yr: (S, X) => X.add('h', .5) },
    ba_chu:       { nameVi: 'Kẻ đứng trên đầu người', tone: 'bad', fade: null, d: 'Người ta sợ bạn hơn là nể.', w: { ad_bandits: .6 },
      echo: { ad_bandits: 'Bọn cướp nhận ra bạn và dạt sang hai bên đường.' } },
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

  // Kết của mạch có sẵn (story.js) cũng để lại dấu.
  const ARC_MARKS = {
    rival: { win: 'vuot_doi_thu', peace: 'ban_cu', lose: 'cay_dang' }, grace: { paid: 'giu_loi', unpaid: 'tieng_xau' }, favor: { repaid: 'duoc_tin' },
    feud: { win: 'tay_mau', law: 'giu_loi', forgive: 'buong_bo', lose: 'ke_thu' }, vengeance: { win: 'da_bao_thu', letgo: 'buong_bo', lose: 'thu_chua_tra' },
    love: { let: 'buong_bo' }, master: { heir: 'chan_truyen' }, debt: { paid: 'giu_loi', tied: 'cua_phi_nghia', beaten: 'ke_thu', fled: 'tieng_xau' },
    secret: { exposed: 'ke_thu', favor: 'no_on', win: 'cua_phi_nghia', lose: 'ke_thu', backfire: 'tieng_xau' }, idol: { surpass: 'cao_thu', taught: 'chan_truyen' },
    kin: { close: 'tinh_than', rift: 'cat_dut' }, friend: { reunion: 'ban_cu' }, hunter: { truce: 'buong_bo', slain: 'tay_mau' }, flower: { guard: 'duoc_tin', kin: 'ban_cu' }
  };
  for (const [k, m] of Object.entries(ARC_MARKS)) if (G.ARCS[k]) G.ARCS[k].marks = Object.assign({}, G.ARCS[k].marks || {}, m);
  for (const k of ['favor', 'debt', 'secret', 'lost', 'prophecy']) if (G.ARCS[k]) G.ARCS[k].tier = 'short';
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
  function saga(k, def) {
    SAGA[k] = def;
    G.ARCS[k] = { nameVi: def.nameVi, tier: 'main', quest: (p, a) => def.quest(a), good: def.good, marks: def.marks,
      sum: (o, p, rec) => (o === 'turned' ? turnedSum(rec.d || {}) : def.sum[o] ? def.sum[o](rec.d || {}) : null) };
    sNode({ id: k + '_open', st: TAE, story: { arc: k, at: 'open', wait: [0, 30], to: 'knot' }, w: 6,
      run(S, X, a) { return { t: def.open(S, X, a), k: 'big' }; } });
    sDec(k + '_knot', { prio: 6, story: { arc: k, at: 'knot', wait: [2, 40], to: 'trial' },
      when: (S, X) => X.stage(S) !== 'child',
      build: (S, X, a) => ({ title: def.knot.title, body: def.knot.body(S, X, a), choices: [...def.knot.choices(S, X, a), ...knotTurn(S, X)] }),
      apply(S, X, ch, c, a) {
        if (String(ch).startsWith('turn:')) return { t: switchMain(S, X, ch.slice(5)), o: 'turned', to: null };   // bỏ đường này ngay từ lúc chọn lối, rẽ sang mạch khác
        a.d.path = ch; const t = def.knot.apply(S, X, ch, a); cnt(S, 'sg_' + k + '_' + ch); return { t, o: ch, to: 'trial' }; },
      auto: (S, X, d, a) => def.knot.auto(S, X, a) });
    sNode({ id: k + '_trial', st: AD, story: { arc: k, at: 'trial', wait: [3, 40], to: 'climax' }, w: 5,
      run(S, X, a) { const ok = X.chance(G.clamp(def.trial.base(S, X, a) + pb(a), .1, .92)); a.d.ok = ok; return { t: def.trial.run(S, X, a, ok), k: ok ? 'good' : 'bad', o: ok ? 'ok' : 'fail' }; } });
    sDec(k + '_climax', { prio: 7, story: { arc: k, at: 'climax', wait: [3, 60], to: 'after' },
      when: (S, X) => late(S, X),
      build: (S, X, a) => ({ title: def.climax.title, body: def.climax.body(S, X, a), choices: def.climax.choices(S, X, a) }),
      apply(S, X, ch, c, a) { const r = def.climax.apply(S, X, ch, a); a.d.end = r.o; cnt(S, 'sg_' + k + '_' + r.o); return { t: r.t, o: r.o, to: 'after' }; },
      auto: (S, X, d, a) => def.climax.auto(S, X, a) });
    // Kết: tới tuổi già, hoặc chừng 12 lượt sau cao trào (mạch chính đi gần hết đời).
    sNode({ id: k + '_after', st: AD, story: { arc: k, at: 'after', wait: [4, 80], to: 'end' }, w: 6, c: (S, X, a) => X.stage(S) === 'elder' || S.age - a.t >= 12,
      run(S, X, a) { const o = a.d.end || def.good[0]; return { t: def.after[o](S, X, a), k: def.good.includes(o) ? 'big' : 'info', o, to: 'end' }; } });
    // Nhịp: trọng số gốc 0,45 (× kéo của mạch chính ≈ 2,7), cách nhau ít nhất 3 lượt.
    const beat = { id: k + '_beat', st: TAE, story: { arc: k, at: ['open', 'knot', 'trial', 'climax'], wait: [1, 99] }, w: .45,
      run(S, X, a) { a.d.prog = prog(a) + 1; const L = def.beat[a.at] || def.beat.any; return { t: X.pick(L).replace('{z}', zoneName(S, X, a)), k: 'info', to: null }; } };
    sNode(beat); beat.gap = 3;
  }
  // Mạch chính bỏ dở vì rẽ sang mạch khác (quyết định Ngã rẽ).
  const turnedSum = d => `bỏ dở giữa chừng${d.to && SAGA[d.to] ? ', rẽ sang ' + SAGA[d.to].nameVi : ''}`;
  const zoneName = (S, X, a) => { const z = (a && a.d.zone && G.ZONE[a.d.zone]) ? G.ZONE[a.d.zone].zone : X.reg(S).zones[1] || X.reg(S).zones[0]; return z.nameVi; };
  const spName = a => (a.d.sp && G.B.byId[a.d.sp] ? G.B.byId[a.d.sp].nameVi : 'bầy quái');
  const bestSk = S => { let b = null; for (const [m, v] of Object.entries(S.mastery)) if (!b || v > S.mastery[b]) b = m; return b || 'Body'; };
  const tierUp = (S, X, k) => G.tierName(Math.min(5, X.ctier(S) + k));

  // ── Món nợ máu ──
  saga('m_avenge', {
    nameVi: 'Món nợ máu', pitch: 'Đi đòi lại món nợ máu năm xưa.', axes: { vo: 1, am: .4 }, themes: ['raid', 'war'], aim: null,
    quest: a => `Trả món nợ máu cho ${a.d.kin || 'làng'}`, good: ['win', 'burn', 'spare'],
    marks: { win: 'da_bao_thu', burn: 'da_bao_thu', spare: 'buong_bo', fail: 'thu_chua_tra' },
    sum: { win: d => `trả được món nợ máu cho ${d.kin || 'làng'}`, burn: d => `đốt sạch tổ của bầy quái đã giết ${d.kin || 'người làng'}`, spare: d => `tha cho lứa quái con, buông được mối thù cho ${d.kin || 'làng'}`, fail: d => `không trả được món nợ máu cho ${d.kin || 'làng'}` },
    follow: ['Đêm ấy bạn lại mơ thấy ngày làng cháy.', 'Bạn ghi thêm một vạch lên chuôi vũ khí, như mọi lần.', 'Mỗi việc bạn làm đều như một bước tới gần cái tổ ấy.'],
    beat: { open: ['Bạn mài lại lưỡi vũ khí, đêm nào cũng mài.', 'Bạn hỏi mọi thợ săn đi ngang làng về {z}.'], knot: ['Bạn tập tới khi tay rớm máu, rồi tập tiếp.'],
      trial: ['Bạn vẽ lại bản đồ {z} lên vách nhà, đánh dấu từng chỗ có dấu chân.', 'Bạn nằm phục cả đêm ở bìa {z}, chỉ để nghe tiếng chúng đi qua.'], climax: ['Bạn biết cái tổ ở đâu rồi. Chỉ còn chờ một ngày.'] },
    open: (S, X, a) => `Bạn giữ lại một món đồ của ${a.d.kin || 'người làng đã mất'}, đặt ở đầu giường. Sáng nào trước khi đi tập bạn cũng nhìn nó một lúc. Bạn biết mình sẽ đi tìm ${spName(a)}.`,
    knot: { title: 'Cách đòi nợ máu', body: (S, X, a) => `${spName(a)} vẫn còn ở ${zoneName(S, X, a)}. Một mình bạn chưa đủ sức.`,
      choices: (S, X) => [{ k: 'train', label: 'Luyện tới khi đủ sức', sub: 'Một mình, lâu, nhưng chắc tay.' }, { k: 'band', label: 'Tụ một toán thợ săn', sub: 'Cần người tin bạn.' },
        { k: 'hire', label: 'Bỏ tiền thuê mạo hiểm giả', sub: `Tốn chừng ${G.coin(Math.round(med(S, X) * 1.5))}.` }],
      apply(S, X, ch, a) {
        if (ch === 'train') { X.gain(bestSk(S), 6); G.trajBump(S, { vo: .5 }); return 'Bạn dựng một bãi tập sau nhà, ngày nào cũng ra đó trước khi gà gáy.'; }
        if (ch === 'band') { const p = G.castAdd(S, X, { role: 'ban', how: 'người cùng bạn đi đòi nợ máu', work: 'hunter', bond: 35 }); a.d.mate = p.id; X.add('so', 4); return `${first(p.name)} là người đầu tiên đứng ra. Rồi thêm ba người nữa.`; }
        X.money(-Math.round(med(S, X) * 1.5)); a.d.hired = true; return 'Bạn đặt túi tiền lên bàn ở hội mạo hiểm. Người ta đếm, rồi gật đầu.';
      },
      auto: (S, X) => S.traits.social > .55 ? 'band' : S.gold > med(S, X) * 2 && S.traits.bold < .5 ? 'hire' : 'train' },
    trial: { base: (S, X, a) => .45 + (a.d.path === 'band' ? .1 : a.d.path === 'hire' ? .15 : 0),
      run: (S, X, a, ok) => ok ? (X.gain(bestSk(S), 3), `Bạn lần theo dấu ${spName(a)} qua ${zoneName(S, X, a)} suốt một mùa, và tìm ra cái tổ dưới một vách đá.`)
        : (X.add('hl', -10), X.cond('wound'), `Bạn lần theo dấu ${spName(a)} tới ${zoneName(S, X, a)} rồi mất dấu giữa trận mưa. Bạn về với một vết cào dài trên lưng.`) },
    climax: { title: 'Trước cửa tổ', body: (S, X, a) => `Tổ của ${spName(a)} nằm dưới vách đá. Từ trong tổ vọng ra tiếng con non.`,
      choices: (S, X, a) => [{ k: 'fight', label: 'Vào tổ, đánh tới cùng', sub: `Khả năng thắng chừng ${Math.round(odds(S, X, (a.d.ok ? .5 : .3) + pb(a)) * 100)}%.` },
        { k: 'burn', label: 'Đốt tổ từ bên ngoài', sub: 'Chắc ăn hơn; không biết con đầu đàn đã chết chưa.' }, { k: 'spare', label: 'Quay về', sub: 'Tha cho lứa con non.' }],
      apply(S, X, ch, a) {
        if (ch === 'fight') { if (X.chance(odds(S, X, (a.d.ok ? .5 : .3) + pb(a)))) { S.fame += 6; return { t: 'Bạn đi vào bóng tối với ngọn đuốc và vũ khí. Lúc trở ra, trên tay bạn là cái nanh của con đầu đàn.', o: 'win' }; }
          X.add('hl', -20); X.cond('wound'); return { t: 'Con đầu đàn to hơn mọi lời kể. Bạn bò ra khỏi tổ, máu chảy theo từng bước.', o: 'fail' }; }
        if (ch === 'burn') { S.fame += 2; return { t: 'Bạn chất củi khô kín cửa tổ rồi châm lửa. Khói đen bốc lên ba ngày.', o: 'burn' }; }
        X.add('h', 4); return { t: 'Bạn đứng lâu ở cửa tổ, rồi quay đi. Bọn con non không giết ai cả.', o: 'spare' };
      },
      auto: (S, X, a) => S.traits.bold > .55 ? 'fight' : S.traits.pious > .7 ? 'spare' : 'burn' },
    after: { win: (S, X, a) => `Bạn đặt cái nanh lên mộ ${a.d.kin || 'những người đã mất'}. Lần đầu sau bao năm bạn ngủ một giấc không mộng.`,
      burn: (S, X, a) => `Người làng thôi nói về ${spName(a)}. Bạn không đi ngang chỗ vách đá ấy nữa.`,
      spare: (S, X, a) => `Mấy năm sau người ta vẫn thấy quái ở ${zoneName(S, X, a)}, nhưng chúng không xuống làng. Bạn không hối hận.`,
      fail: (S, X, a) => `Cái tổ vẫn ở đó. Đêm nào trời trở, vết thương cũ nhắc bạn món nợ chưa trả.` }
  });

  // ── Thoát nghèo ──
  saga('m_rise', {
    nameVi: 'Thoát nghèo', pitch: 'Đưa cả nhà ra khỏi cảnh nghèo.', axes: { thuong: 1, nghe: .6 }, themes: ['tax', 'hardship', 'gamble'], aim: 'wealth',
    quest: () => 'Đưa cả nhà thoát nghèo', good: ['rich', 'steady'], marks: { rich: 'nha_kha', steady: 'giu_loi', ruined: 'tay_trang', crooked: 'cua_phi_nghia' },
    sum: { rich: () => 'đưa cả nhà thoát nghèo', steady: () => 'giữ cho nhà đủ ăn mà không nợ ai', ruined: () => 'mất trắng một cơ nghiệp gây dựng nửa đời', crooked: () => 'giàu lên bằng những mối làm ăn không ai muốn nhắc' },
    follow: ['Tối ấy bạn lại nghĩ tới cái hũ tiền dưới gầm giường.', 'Mẹ bạn đếm lại hũ tiền dưới gầm giường, lần này lâu hơn.', 'Bạn tính trong đầu: còn bao nhiêu mùa nữa.'],
    beat: { any: ['Bạn dậy trước gà gáy, đi ngủ sau chó sủa. Hũ tiền đầy thêm một đốt tay.', 'Bạn mặc cả từng đồng ở chợ; người bán nhớ mặt bạn.', 'Bạn từ chối một bữa rượu để giữ tiền cho mùa sau.'] },
    open: (S, X) => `Đêm ấy bạn ngồi đếm từng đồng trong nhà. Không đủ. Bạn tự hứa: tới lúc tóc bạc, nhà này sẽ không phải ăn cháo loãng nữa.`,
    knot: { title: 'Con đường làm ăn', body: () => 'Muốn thoát nghèo phải có một nghề kiếm ra tiền, hoặc một mảnh đất của riêng mình.',
      choices: () => [{ k: 'trade', label: 'Buôn chuyến', sub: 'Mua chỗ này, bán chỗ kia.' }, { k: 'land', label: 'Khai hoang đất mới', sub: 'Đất rẻ, việc nặng.' }, { k: 'skill', label: 'Học một nghề giỏi', sub: 'Lâu thấy tiền, nhưng bền.' }],
      apply(S, X, ch) { if (ch === 'trade') { G.trajBump(S, { thuong: .5 }); return 'Bạn vay một khoản nhỏ, mua một xe muối, rồi đẩy nó qua ba làng.'; }
        if (ch === 'land') { X.gain('Body', 4); G.trajBump(S, { gia: .3 }); return 'Bạn xin được một mảnh đất hoang ven rừng, dựng tạm cái lều, bắt đầu nhổ gốc cây.'; }
        X.gain('Engineering', 4); G.trajBump(S, { nghe: .5 }); return 'Bạn xin vào học việc ở một xưởng, làm không công ba năm đầu.'; },
      auto: S => S.traits.social > .55 ? 'trade' : S.traits.studious > .55 ? 'skill' : 'land' },
    trial: { base: S => .5 + (S.q >= 3 ? .1 : 0),
      run: (S, X, a, ok) => { const g = Math.round(med(S, X) * (ok ? 1.5 : -.6)); X.money(g);
        return ok ? `Mùa ấy được. ${a.d.path === 'trade' ? 'Chuyến hàng bán hết trước khi tới chợ thứ ba' : a.d.path === 'land' ? 'Mảnh đất khai hoang cho vụ lúa đầu tiên' : 'Ông chủ xưởng trả công đủ'}: ${G.coin(g)}.`
          : `Mùa ấy mất. ${a.d.path === 'trade' ? 'Hàng ướt mưa giữa đường' : a.d.path === 'land' ? 'Lũ cuốn hết vụ đầu' : 'Xưởng cháy, ông chủ bỏ đi'}; bạn lỗ ${G.coin(-g)}.`; } },
    climax: { title: 'Mối làm ăn lớn', body: (S, X) => `Có một mối hàng lớn: nếu được, cả nhà đổi đời; nếu mất, mất hết. Cần chừng ${G.coin(Math.round(med(S, X) * 3))}.`,
      choices: (S, X, a) => [{ k: 'risk', label: 'Dồn hết vốn vào', sub: `Chừng ${Math.round(G.clamp(.45 + (a.d.ok ? .1 : 0) + pb(a), .1, .9) * 100)}% được.` },
        { k: 'steady', label: 'Giữ nhịp, chia bớt cho họ hàng', sub: 'Không giàu nhanh, không mất gì.' }, { k: 'crooked', label: 'Làm với kẻ buôn lậu', sub: 'Chắc ăn. Người ta sẽ nhớ.' }],
      apply(S, X, ch, a) {
        if (ch === 'risk') { if (X.chance(G.clamp(.45 + (a.d.ok ? .1 : 0) + pb(a), .1, .9))) { X.money(Math.round(med(S, X) * 4)); return { t: 'Bạn dồn hết vốn. Ba tháng sau, chuyến hàng về đủ, lãi gấp bốn.', o: 'rich' }; }
          return { t: 'Bạn dồn hết vốn. Chuyến hàng không về.', o: 'ruined' }; }
        if (ch === 'steady') { X.money(Math.round(med(S, X) * 1.2)); X.add('so', 5); return { t: 'Bạn lắc đầu với mối lớn, đem phần dư chia cho mấy nhà họ hàng nghèo.', o: 'steady' }; }
        X.money(Math.round(med(S, X) * 4)); G.trajBump(S, { am: .4 }); return { t: 'Bạn bắt tay kẻ buôn lậu dưới gầm cầu. Tiền về đều như nước.', o: 'crooked' };
      },
      auto: (S, X) => S.traits.bold > .6 ? 'risk' : S.traits.pious < .25 && S.traits.bold > .4 ? 'crooked' : 'steady' },
    after: { rich: () => 'Nhà bạn lợp lại mái ngói. Bữa cơm có thịt mà không cần đợi Tết.', steady: () => 'Không ai trong họ phải đi vay nữa. Tết nào cũng có người tới nhà bạn trước tiên.',
      ruined: () => 'Bạn bán bớt đồ đạc, dọn về căn nhà cũ. Mẹ bạn bảo: còn người là còn của.', crooked: () => 'Nhà bạn giàu lên. Hàng xóm chào bạn, nhưng chào nhỏ hơn trước.' }
  });

  // ── Đỉnh cao võ đạo ──
  saga('m_power', {
    nameVi: 'Đỉnh cao võ đạo', pitch: 'Vươn tới bậc chưa ai trong làng đạt.', axes: { vo: .7, phap: .6 }, themes: ['tourney', 'learn', 'teach'], aim: 'martial',
    quest: a => `Vươn tới ${G.tierName(Math.min(5, (a.d.t0 || 0) + 2))}`, good: ['top', 'honor'], marks: { top: 'cao_thu', honor: 'duoc_tin', broken: 'cay_dang' },
    sum: { top: () => 'thắng cao thủ số một một vùng', honor: () => 'thua cao thủ số một mà vẫn được kính trọng', broken: () => 'gãy con đường võ đạo giữa chừng' },
    follow: ['Bạn tập thêm một canh giờ sau khi mọi người đã nghỉ.', 'Rồi bạn lại ra bãi tập như mọi chiều.', 'Bạn nghĩ: với người muốn mạnh, việc gì cũng là bài tập.'],
    beat: { any: ['Bạn tập ở bãi đất sau làng tới khi trời tối hẳn.', 'Bạn đứng tấn dưới mưa, đếm từng hơi thở.', 'Bạn xin đấu tập với mọi người cầm vũ khí đi ngang làng.'] },
    open: (S, X, a) => { a.d.t0 = X.ctier(S); return `Bạn khắc lên cột nhà một vạch ngang tầm mắt và tự hứa: một ngày sẽ đứng ở chỗ những ${tierUp(S, X, 2)} đứng.`; },
    knot: { title: 'Đường tu luyện', body: () => 'Muốn lên cao phải chọn một con đường; không ai đi được cả ba.',
      choices: (S, X) => [{ k: 'master', label: 'Tìm thầy cao tay', sub: `Tốn chừng ${G.coin(Math.round(med(S, X)))}; học chắc.` }, { k: 'roam', label: 'Đi khắp nơi tỉ thí', sub: 'Nổi tiếng nhanh, dễ bị thương.' }, { k: 'alone', label: 'Tự luyện một mình', sub: 'Chậm, nhưng là đường của riêng bạn.' }],
      apply(S, X, ch) { if (ch === 'master') { X.money(-Math.round(med(S, X))); X.gain(bestSk(S), 6); return 'Bạn đi ba ngày đường tới nhà một cao thủ về hưu, quỳ ngoài cổng tới khi ông cho vào.'; }
        if (ch === 'roam') { S.fame += 3; X.add('hl', -5); G.trajBump(S, { du: .4 }); return 'Bạn vác vũ khí lên vai, đi từ bãi tập làng này sang bãi tập làng khác.'; }
        X.add('sm', 4); X.gain(bestSk(S), 4); return 'Bạn dựng một túp lều trên núi, mỗi ngày chỉ xuống chợ một lần.'; },
      auto: (S, X) => S.gold > med(S, X) * 1.5 ? 'master' : S.traits.bold > .6 ? 'roam' : 'alone' },
    trial: { base: (S, X, a) => .4 + (X.ctier(S) > (a.d.t0 || 0) ? .3 : 0),
      run: (S, X, a, ok) => ok ? (S.fame += 3, `Ở đại hội võ của vùng, bạn vào tới trận cuối. Người ta bắt đầu nhắc tên bạn.`) : (X.add('hl', -8), `Ở đại hội võ của vùng, bạn bị loại từ vòng đầu bởi một đứa trẻ hơn bạn mười tuổi.`) },
    climax: { title: 'Cao thủ số một', body: () => 'Cao thủ số một của vùng nhận lời thách đấu. Thắng thì cả vùng biết tên bạn; thua thì cũng cả vùng biết.',
      choices: (S, X, a) => [{ k: 'duel', label: 'Ra đấu', sub: `Chừng ${Math.round(odds(S, X, .35 + (a.d.ok ? .15 : 0) + pb(a)) * 100)}% thắng.` },
        { k: 'teach', label: 'Thôi tranh, đem sở học dạy lại', sub: 'Không ai thua.' }, { k: 'secret', label: 'Luyện cấm pháp để thắng chắc', sub: 'Thắng, nhưng khí huyết có thể loạn.' }],
      apply(S, X, ch, a) {
        if (ch === 'duel') { if (X.chance(odds(S, X, .35 + (a.d.ok ? .15 : 0) + pb(a)))) { S.fame += 8; X.gain(bestSk(S), 8); return { t: 'Trận đấu kéo dài tới khi mặt trời lặn. Người ngã xuống không phải bạn.', o: 'top' }; }
          X.add('hl', -15); return prog(a) >= 6 ? { t: 'Bạn thua sau một trận dài. Cao thủ đỡ bạn dậy, cúi đầu trước bạn trước cả đám đông.', o: 'honor' } : { t: 'Bạn thua sau ba hiệp. Tay cầm vũ khí của bạn không bao giờ thẳng lại được nữa.', o: 'broken' }; }
        if (ch === 'teach') { X.add('so', 6); return { t: 'Bạn gác vũ khí, mở một bãi tập cho bọn trẻ trong làng.', o: 'honor' }; }
        X.cond('qi'); S.fame += 6; return { t: 'Bạn luyện cấm pháp ba tháng, rồi thắng trận đấu trong ba chiêu. Đêm nào khí huyết cũng sôi lên trong ngực.', o: 'top' };
      },
      auto: (S, X) => S.traits.bold > .5 ? 'duel' : S.traits.social > .55 ? 'teach' : 'duel' },
    after: { top: () => 'Tên bạn được khắc lên cột đá ở bãi tập lớn. Trẻ con trong vùng tập theo thế đánh của bạn.', honor: () => 'Người ta gọi bạn là thầy, dù bạn chưa nhận ai làm học trò.',
      broken: () => 'Bạn treo vũ khí lên vách. Có những đêm bạn vẫn lấy xuống, lau, rồi treo lại.' }
  });

  // ── Tác phẩm đời người ──
  saga('m_craft', {
    nameVi: 'Tác phẩm đời người', pitch: 'Làm ra một tác phẩm mang tên mình.', axes: { nghe: 1, tri: .5 }, themes: ['learn', 'teach'], aim: 'scholar',
    quest: () => 'Làm ra một tác phẩm mang tên mình', good: ['work', 'school'], marks: { work: 'danh_tho', school: 'chan_truyen', fail: 'cay_dang' },
    sum: { work: () => 'làm ra một tác phẩm người ta còn nhắc', school: () => 'truyền trọn tay nghề cho lớp sau', fail: () => 'dồn nửa đời vào một tác phẩm không thành' },
    follow: ['Đêm ấy bạn lại ngồi bên bàn thợ tới khuya.', 'Đôi tay bạn khéo thêm một chút.', 'Bạn nghĩ tới tác phẩm của mình cả lúc ăn.'],
    beat: { any: ['Bạn làm hỏng cái thứ mười, rồi làm cái thứ mười một.', 'Bạn ngồi cả buổi chỉ để nhìn thợ cả làm một mối nối.', 'Bạn thức tới khuya sửa một chi tiết không ai nhìn thấy.'] },
    open: () => 'Bạn nhìn món đồ đẹp nhất trong làng và nghĩ: mình làm được đẹp hơn. Từ hôm ấy bạn không để tay rảnh.',
    knot: { title: 'Lối làm nghề', body: () => 'Mỗi thợ lớn đều phải chọn: theo lối thầy, tìm lối mới, hay đi tìm thứ vật liệu chưa ai dùng.',
      choices: () => [{ k: 'old', label: 'Theo lối thầy', sub: 'Chắc tay, ít bất ngờ.' }, { k: 'new', label: 'Tìm lối mới', sub: 'Có thể hỏng nhiều.' }, { k: 'rare', label: 'Đi tìm vật liệu hiếm', sub: 'Đường xa, có quái.' }],
      apply(S, X, ch) { if (ch === 'old') { X.gain('Engineering', 5); return 'Bạn chép lại từng bản vẽ của thầy, làm theo không sai một nét.'; }
        if (ch === 'new') { X.add('sm', 5); return 'Bạn đốt hết bản vẽ cũ, bắt đầu từ một tờ giấy trắng.'; }
        X.add('hl', -6); G.trajBump(S, { du: .3 }); return 'Bạn vào núi tìm loại đá người ta chỉ còn nhắc trong chuyện kể.'; },
      auto: S => S.traits.studious > .6 ? 'new' : S.traits.bold > .6 ? 'rare' : 'old' },
    trial: { base: S => .45 + Math.min(.25, (S.mastery.Engineering || 0) / 200),
      run: (S, X, a, ok) => ok ? (X.gain('Engineering', 3), 'Mẻ thử đầu tiên ra lò. Thợ cả cầm lên xem, rồi lặng lẽ đặt nó vào chỗ trưng bày.') : 'Mẻ thử đầu tiên nứt làm đôi trước mặt cả xưởng.' },
    climax: { title: 'Tác phẩm', body: () => 'Bạn đã sẵn sàng làm tác phẩm của đời mình. Nhưng tiền, thời gian, và người học nghề đều đang chờ.',
      choices: (S, X, a) => [{ k: 'masterpiece', label: 'Dồn hết vào một tác phẩm', sub: `Chừng ${Math.round(G.clamp(.4 + (a.d.ok ? .15 : 0) + pb(a), .1, .9) * 100)}% thành.` },
        { k: 'patron', label: 'Làm theo đơn của nhà quyền thế', sub: 'Chắc tiền, tác phẩm mang tên người đặt.' }, { k: 'teach', label: 'Dạy lại cho lớp sau', sub: 'Tác phẩm là những người thợ bạn để lại.' }],
      apply(S, X, ch, a) {
        if (ch === 'masterpiece') { if (X.chance(G.clamp(.4 + (a.d.ok ? .15 : 0) + pb(a), .1, .9))) { S.fame += 8; S.gear = Math.min(10, S.gear + 2); return { t: 'Bạn khóa cửa xưởng một mùa. Ngày mở cửa, người ta xếp hàng tới đầu ngõ để xem.', o: 'work' }; }
          X.add('h', -10); return { t: 'Bạn khóa cửa xưởng một mùa. Ngày mở cửa, bạn đập vỡ nó trước khi ai kịp thấy.', o: 'fail' }; }
        if (ch === 'patron') { X.money(Math.round(med(S, X) * 3)); S.fame += 3; return { t: 'Tác phẩm được đặt ở sảnh chính nhà quyền thế. Dưới chân nó khắc tên người đặt, nhỏ hơn bên cạnh là tên bạn.', o: 'work' }; }
        X.add('so', 6); return { t: 'Bạn nhận ba người học việc, dạy họ mọi thứ bạn biết, không giấu một mẹo nào.', o: 'school' };
      },
      auto: S => S.traits.social > .6 ? 'teach' : S.traits.bold > .5 ? 'masterpiece' : 'patron' },
    after: { work: () => 'Mấy chục năm sau, người ta vẫn chỉ vào tác phẩm ấy và nói: của thợ này đấy.', school: () => 'Ba người học việc của bạn giờ đều có xưởng riêng. Đồ họ làm có một mối nối giống hệt của bạn.',
      fail: () => 'Bạn vẫn làm nghề, nhưng không bao giờ nhắc tới mùa khóa cửa ấy.' }
  });

  // ── Người đứng đầu ──
  saga('m_lead', {
    nameVi: 'Người đứng đầu', pitch: 'Đứng ra gánh việc chung cho làng, cho tộc.', axes: { quyen: 1, gia: .5 }, themes: ['tax', 'war'], aim: 'power',
    quest: () => 'Đứng ra gánh việc chung', good: ['chosen', 'step'], marks: { chosen: 'nguoi_dung_dau', rule: 'ke_tiem_quyen', step: 'duoc_tin' },
    sum: { chosen: () => 'được dân bầu làm người đứng đầu', rule: () => 'giành lấy ghế đứng đầu bằng sức', step: () => 'nhường ghế cho người trẻ khi đang được tin' },
    follow: ['Người ta bắt đầu hỏi ý bạn trước khi làm.', 'Bạn ghi nhớ ai đã giúp, ai đã đứng ngoài.', 'Chuyện chung của làng giờ cũng là chuyện của bạn.'],
    beat: { any: ['Bạn đứng ra phân xử một vụ tranh nước giữa hai nhà.', 'Bạn đi từng nhà hỏi chuyện mùa màng.', 'Bạn ngồi nghe các bô lão bàn việc tới khuya.'] },
    open: () => 'Năm ấy làng gặp chuyện mà không ai đứng ra. Bạn đứng ra. Từ đó người ta nhìn bạn khác.',
    knot: { title: 'Cách gây dựng', body: () => 'Muốn đứng đầu phải có người theo. Có ba cách để người ta theo mình.',
      choices: () => [{ k: 'serve', label: 'Lo việc nhỏ cho làng', sub: 'Chậm mà chắc.' }, { k: 'ally', label: 'Kết thân với nhà giàu', sub: 'Có tiền, mất lòng dân nghèo.' }, { k: 'fear', label: 'Dựa vào sức, dẹp kẻ cản', sub: 'Nhanh, để lại thù.' }],
      apply(S, X, ch) { if (ch === 'serve') { X.add('so', 5); return 'Bạn sửa đường, đắp đê, đi nhờ từng nhà góp một ngày công.'; }
        if (ch === 'ally') { X.money(Math.round(med(S, X) * .8)); X.add('so', -2); return 'Bạn ngồi chung mâm với các nhà giàu nhất vùng. Họ hứa sẽ đứng sau bạn.'; }
        G.trajBump(S, { am: .3, vo: .3 }); X.add('so', -3); return 'Bạn cho đám thanh niên khỏe nhất làng theo mình. Ai cản đường thì gặp họ.'; },
      auto: S => S.traits.social > .5 ? 'serve' : S.traits.bold > .65 ? 'fear' : 'ally' },
    trial: { base: (S, X, a) => .45 + (a.d.path === 'serve' ? .15 : 0) + G.clamp((S.so - 50) / 200, -.1, .15),
      run: (S, X, a, ok) => ok ? (X.add('so', 6), 'Năm đói, bạn mở kho chung, chia lúa theo đầu người. Không nhà nào chết đói.') : (X.add('so', -6), 'Năm đói, kho chung bị phá trong một đêm. Người ta hỏi bạn ở đâu lúc ấy.') },
    climax: { title: 'Ghế đứng đầu', body: () => 'Người đứng đầu cũ đã già. Cả làng đang chờ xem ai thay.',
      choices: (S, X, a) => [{ k: 'ballot', label: 'Để dân bầu', sub: `Chừng ${Math.round(G.clamp(.5 + (a.d.ok ? .2 : 0) + pb(a) + (S.so - 50) / 150, .1, .9) * 100)}% được chọn.` },
        { k: 'take', label: 'Giành lấy', sub: 'Chắc được ghế. Người ta sẽ nhớ cách bạn ngồi lên.' }, { k: 'step', label: 'Nhường cho người trẻ', sub: 'Ở lại làm người được hỏi ý.' }],
      apply(S, X, ch, a) {
        if (ch === 'ballot') { if (X.chance(G.clamp(.5 + (a.d.ok ? .2 : 0) + pb(a) + (S.so - 50) / 150, .1, .9))) { S.fame += 6; return { t: 'Người ta bỏ phiếu bằng hạt đậu. Hũ của bạn đầy tràn.', o: 'chosen' }; }
          X.add('h', -6); return { t: 'Hũ đậu của bạn vơi hơn hũ bên kia một nắm. Bạn bắt tay người thắng trước cả làng.', o: 'step' }; }
        if (ch === 'take') { S.fame += 4; return { t: 'Sáng hôm bầu, đám thanh niên của bạn đứng kín cửa đình. Không ai dám bỏ hạt đậu nào khác.', o: 'rule' }; }
        X.add('so', 6); return { t: 'Bạn đứng lên giữa đình, chỉ vào một người trẻ và nói: người này làm tốt hơn tôi.', o: 'step' };
      },
      auto: S => S.traits.bold > .7 && S.traits.social < .35 ? 'take' : S.traits.social > .7 ? 'step' : 'ballot' },
    after: { chosen: () => 'Bạn ngồi ghế đứng đầu nhiều năm. Có những việc làm sai, nhưng không ai nói bạn bỏ làng.', rule: () => 'Bạn giữ ghế tới khi già. Người ta nghe lời bạn, nhưng không ai mời bạn ăn cỗ.',
      step: () => 'Người trẻ làm tốt. Năm nào có chuyện lớn, họ vẫn tới hỏi bạn trước.' }
  });

  // ── Con đường đức tin ──
  saga('m_faith', {
    nameVi: 'Con đường đức tin', pitch: 'Đi tới cùng con đường của đạo mình theo.', axes: { dao: 1 }, themes: ['faith'], aim: 'faith', need: S => !!S.faith,
    quest: a => `Đi tới cùng ${a.d.fv || 'đạo của mình'}`, good: ['saint', 'teacher'], marks: { saint: 'nguoi_moc_dao', teacher: 'nguoi_moc_dao', left: 'bo_dao' },
    sum: { saint: d => `đứng ra che chở tín đồ ${d.fv || ''} giữa lúc nguy`.trim(), teacher: d => `đi giảng ${d.fv || 'đạo'} tới những nơi chưa ai nghe`, left: d => `bỏ ${d.fv || 'đạo cũ'} sau nửa đời tin theo` },
    follow: ['Bạn đọc thêm một đoạn kinh trước khi ngủ.', 'Bạn thấy đạo của mình trong cả chuyện nhỏ nhất.', 'Bạn cầu nguyện cho những người gặp hôm ấy.'],
    beat: { any: ['Bạn quỳ trong đền tới khi chân tê dại.', 'Bạn chép kinh dưới ánh đèn dầu.', 'Bạn đi thăm người ốm trong làng, mang theo nước thánh.'] },
    open: (S, X, a) => { a.d.fv = S.faith && J.faiths[S.faith] ? J.faiths[S.faith].nameVi : 'đạo của mình'; return `Một đêm bạn tỉnh dậy, lòng yên như mặt hồ. Bạn biết từ nay đời mình sẽ đi theo ${a.d.fv}.`; },
    knot: { title: 'Cách hành đạo', body: (S, X, a) => `${a.d.fv} có nhiều đường để đi. Bạn chọn đường nào?`,
      choices: () => [{ k: 'pilgrim', label: 'Đi hành hương', sub: 'Tới đền tổ, đường xa.' }, { k: 'temple', label: 'Vào đền phục dịch', sub: 'Đời giản đơn, gần người tu.' }, { k: 'seek', label: 'Tự tìm lời giải', sub: 'Đọc cả kinh của đạo khác.' }],
      apply(S, X, ch) { if (ch === 'pilgrim') { S.devotion = Math.min(100, S.devotion + 10); G.trajBump(S, { du: .3 }); return 'Bạn đi bộ ba tháng tới đền tổ, ngủ ngoài hiên cùng trăm người lạ.'; }
        if (ch === 'temple') { S.devotion = Math.min(100, S.devotion + 8); X.add('so', 3); return 'Bạn quét sân đền mỗi sáng, thắp đèn mỗi tối.'; }
        X.add('sm', 6); return 'Bạn đi khắp các đền trong vùng, nghe mọi đạo giảng.'; },
      auto: S => S.traits.bold > .6 ? 'pilgrim' : S.traits.studious > .6 ? 'seek' : 'temple' },
    trial: { base: S => .3 + S.devotion / 200,
      run: (S, X, a, ok) => ok ? (S.devotion = Math.min(100, S.devotion + 8), 'Năm dịch, bạn ở lại chăm người bệnh khi những người khác bỏ đi. Bạn không nhiễm bệnh; người ta bảo đó là phép của đạo.')
        : (S.devotion = Math.max(0, S.devotion - 10), 'Năm dịch, bạn cầu nguyện ngày đêm mà người bệnh vẫn chết. Lần đầu tiên bạn nghi ngờ.') },
    climax: { title: 'Thử thách của đức tin', body: (S, X, a) => `Kẻ có quyền trong vùng ra lệnh cấm ${a.d.fv}. Tín đồ đang chờ xem người như bạn làm gì.`,
      choices: () => [{ k: 'stand', label: 'Đứng ra che chở tín đồ', sub: 'Có thể bị đánh, bị giam.' }, { k: 'preach', label: 'Đi giảng ở nơi khác', sub: 'Mang đạo tới chỗ chưa ai nghe.' }, { k: 'leave', label: 'Bỏ đạo', sub: 'Giữ mạng, mất chỗ dựa.' }],
      apply(S, X, ch, a) {
        if (ch === 'stand') { X.add('hl', -12); S.devotion = Math.min(100, S.devotion + 15); S.fame += 5; return { t: 'Bạn đứng chắn trước cửa đền. Lính đánh bạn gãy hai xương sườn, rồi bỏ đi trước đám đông đang hát kinh.', o: 'saint' }; }
        if (ch === 'preach') { S.devotion = Math.min(100, S.devotion + 8); G.trajBump(S, { du: .3 }); return { t: 'Bạn khoác áo đi đường, mang theo cuốn kinh và một túi bánh khô.', o: 'teacher' }; }
        S.devotion = 0; X.add('h', -8); return { t: 'Bạn cởi bỏ biểu tượng của đạo, đặt nó lên bậc đền rồi đi.', o: 'left' };
      },
      auto: S => S.traits.pious > .6 && S.traits.bold > .4 ? 'stand' : S.traits.pious < .3 ? 'leave' : 'preach' },
    after: { saint: (S, X, a) => `Lệnh cấm được bỏ sau hai mùa. Ở đền bây giờ có một chỗ ngồi người ta để dành cho bạn.`, teacher: (S, X, a) => `Ở ba làng xa, giờ có người theo ${a.d.fv} vì đã nghe bạn giảng.`,
      left: () => 'Bạn sống tiếp như mọi người. Có những sáng bạn vẫn quay về phía đền, rồi sực nhớ ra.' }
  });

  // ── Chân trời ──
  saga('m_road', {
    nameVi: 'Chân trời', pitch: 'Đi tới nơi xa nhất từng nghe kể.', axes: { du: 1 }, themes: ['treasure', 'companion'], aim: 'adventure',
    quest: () => 'Đi tới nơi xa nhất từng nghe kể', good: ['beyond', 'settle', 'home'], marks: { beyond: 'ke_di_xa', settle: 'que_moi', home: 'ke_di_xa', lost: 'cay_dang' },
    sum: { beyond: () => 'đi tới tận bên kia vùng đất chết', settle: () => 'tìm được một vùng đất để gọi là quê', home: () => 'đi xa rồi về kể chuyện cho cả làng nghe', lost: () => 'lạc giữa đường đi tìm chân trời' },
    follow: ['Bạn đánh dấu thêm một chỗ trên tấm bản đồ tự vẽ.', 'Bạn hỏi người lạ về con đường phía trước.', 'Chuyện này bạn sẽ kể khi về.'],
    beat: { any: ['Bạn ngồi ở ngã ba đường nhìn đoàn buôn đi qua.', 'Bạn vẽ lại bản đồ từ lời một lữ khách.', 'Bạn gói sẵn một túi đồ để cạnh cửa.'] },
    open: () => 'Một lữ khách kể về một vùng đất ở cuối đường, nơi chưa ai trong làng tới. Từ đêm đó bạn ngủ không yên.',
    knot: { title: 'Lên đường', body: () => 'Có ba cách để đi xa.',
      choices: () => [{ k: 'map', label: 'Theo tấm bản đồ cũ', sub: 'Có thể là đồ giả.' }, { k: 'sea', label: 'Xin lên một con tàu', sub: 'Biển không thương ai.' }, { k: 'caravan', label: 'Theo đoàn buôn', sub: 'Chậm, an toàn hơn.' }],
      apply(S, X, ch) { cnt(S, 'trips'); if (ch === 'map') { X.add('sm', 3); return 'Bạn đổi một tháng công lấy tấm bản đồ vẽ trên da dê.'; }
        if (ch === 'sea') { X.gain('Spear', 2); return 'Bạn làm thủy thủ không công để đổi lấy chỗ nằm dưới khoang.'; }
        X.money(Math.round(med(S, X) * .3)); return 'Bạn theo đoàn buôn làm người khuân vác, ngủ dưới gầm xe.'; },
      auto: S => S.traits.bold > .65 ? 'sea' : S.traits.studious > .55 ? 'map' : 'caravan' },
    trial: { base: S => .45 + S.traits.bold * .2,
      run: (S, X, a, ok) => { cnt(S, 'trips'); return ok ? (X.add('sm', 5), 'Bạn qua ba vùng, mỗi vùng một thứ tiếng. Bạn học được cách chào hỏi bằng cả ba.') : (X.add('hl', -10), 'Giữa đường bạn ốm một trận nặng, nằm ba tuần ở một quán trọ không ai biết tên bạn.'); } },
    climax: { title: 'Cuối đường', body: () => 'Trước mặt bạn là vùng đất chết người ta đồn. Bên kia là chỗ lữ khách năm nào kể.',
      choices: (S, X, a) => [{ k: 'beyond', label: 'Vượt qua', sub: `Chừng ${Math.round(odds(S, X, .45 + (a.d.ok ? .1 : 0) + pb(a)) * 100)}% qua được.` },
        { k: 'settle', label: 'Dừng ở nơi đẹp nhất đã qua', sub: 'Dựng nhà ở đó.' }, { k: 'home', label: 'Quay về', sub: 'Mang chuyện về cho làng.' }],
      apply(S, X, ch, a) {
        if (ch === 'beyond') { if (X.chance(odds(S, X, .45 + (a.d.ok ? .1 : 0) + pb(a)))) { S.fame += 6; X.add('sm', 8); return { t: 'Bạn đi mười hai ngày qua đất chết. Ngày thứ mười ba, bạn thấy biển.', o: 'beyond' }; }
          X.add('hl', -18); return { t: 'Bạn đi bảy ngày qua đất chết rồi phải quay lại, mất nửa số đồ, mất cả đường về.', o: 'lost' }; }
        if (ch === 'settle') { X.add('h', 8); return { t: 'Bạn quay lại thung lũng có con suối trong nhất từng thấy, dựng một căn nhà gỗ.', o: 'settle' }; }
        X.add('so', 6); return { t: 'Bạn quay về. Đêm đầu tiên cả làng ngồi quanh bếp lửa nhà bạn tới sáng.', o: 'home' };
      },
      auto: S => S.traits.bold > .55 ? 'beyond' : S.traits.social > .55 ? 'home' : 'settle' },
    after: { beyond: () => 'Bạn vẽ lại con đường ấy trên da dê, để lại cho đứa trẻ nào trong làng hay ngồi nghe bạn kể.', settle: () => 'Thung lũng ấy giờ có ba nóc nhà. Người tới sau gọi nó theo tên bạn.',
      home: () => 'Chuyện bạn kể được người ta kể lại, mỗi lần một dài hơn.', lost: () => 'Bạn tìm được đường về sau một năm. Bạn không còn đi xa nữa.' }
  });

  // ── Tên nhà ──
  saga('m_house', {
    nameVi: 'Tên nhà', pitch: 'Gây dựng lại tên nhà.', axes: { gia: 1, quyen: .5 }, themes: ['romance', 'memory'], aim: 'family',
    quest: () => 'Gây dựng lại tên nhà', good: ['claimed', 'founded'], marks: { claimed: 'ten_nha', founded: 'dong_moi', let: 'buong_bo' },
    sum: { claimed: () => 'được họ tộc nhận lại tên nhà', founded: () => 'mở một dòng họ mới, con cháu đọc tên mình đầu tiên', let: () => 'buông chuyện tên nhà, sống yên với nhà mình' },
    follow: ['Bạn ghi thêm một dòng vào cuốn gia phả tự viết.', 'Bạn nghĩ tới tên nhà mình mỗi lần ký tên.', 'Bạn kể cho con nghe chuyện ông bà.'],
    beat: { any: ['Bạn hỏi các bô lão về ông bà mình.', 'Bạn sửa lại bàn thờ trong nhà.', 'Bạn ghi tên từng người trong họ lên một tấm gỗ.'] },
    open: () => 'Có người nhắc tới tên nhà bạn bằng giọng khinh khỉnh. Đêm ấy bạn tự hứa: một ngày tên ấy sẽ được nói bằng giọng khác.',
    knot: { title: 'Cách gây dựng tên nhà', body: () => 'Tên nhà không tự sáng lên. Bạn chọn cách nào?',
      choices: () => [{ k: 'proof', label: 'Tìm bằng chứng huyết thống', sub: 'Giấy tờ cũ, người làm chứng.' }, { k: 'earn', label: 'Tự làm nên tên tuổi', sub: 'Để người ta nhớ tên bạn trước.' }, { k: 'match', label: 'Liên hôn với nhà có tiếng', sub: 'Nhanh nhất, không phải ai cũng chịu.' }],
      apply(S, X, ch) { if (ch === 'proof') { X.add('sm', 4); return 'Bạn lục từng hòm giấy cũ trong đền làng, tìm tên ông bà.'; }
        if (ch === 'earn') { S.fame += 2; return 'Bạn nhận mọi việc khó mà người khác chê.'; }
        X.add('so', 3); return 'Bạn nhờ bà mối tìm một nhà có tiếng chịu kết thông gia.'; },
      auto: S => S.traits.studious > .55 ? 'proof' : S.traits.social > .55 ? 'match' : 'earn' },
    trial: { base: S => .45 + Math.min(.2, S.fame / 200),
      run: (S, X, a, ok) => ok ? (S.fame += 3, a.d.path === 'proof' ? 'Bạn tìm được tờ giấy ghi tên ông cố trong sổ đinh của một làng xa.' : 'Tên bạn bắt đầu được nhắc ở chợ, không kèm câu khinh khỉnh nào.')
        : (X.add('h', -6), a.d.path === 'proof' ? 'Tờ giấy duy nhất có tên ông cố đã mục nát, không đọc được chữ.' : 'Người ta vẫn nhắc tên bạn kèm chuyện cũ của nhà bạn.') },
    climax: { title: 'Trước họ tộc', body: () => 'Họ tộc họp ở nhà thờ họ. Đây là dịp nói chuyện tên nhà.',
      choices: (S, X, a) => [{ k: 'claim', label: 'Đứng lên đòi lại danh phận', sub: `Chừng ${Math.round(G.clamp(.4 + (a.d.ok ? .2 : 0) + pb(a), .1, .9) * 100)}% được nhận.` },
        { k: 'found', label: 'Lập dòng mới, mình làm tổ', sub: 'Không cần ai nhận.' }, { k: 'let', label: 'Thôi, sống yên với nhà mình', sub: '' }],
      apply(S, X, ch, a) {
        if (ch === 'claim') { if (X.chance(G.clamp(.4 + (a.d.ok ? .2 : 0) + pb(a), .1, .9))) return { t: 'Trưởng họ đọc tên bạn trước cả họ tộc, rồi ghi nó vào gia phả bằng mực đỏ.', o: 'claimed' };
          X.add('h', -8); return { t: 'Trưởng họ lắc đầu. Bạn ra về; trên đường bạn quyết định tự viết gia phả của mình.', o: 'founded' }; }
        if (ch === 'found') { X.add('h', 5); return { t: 'Bạn khắc tên mình lên đầu một tấm gỗ mới, chừa chỗ cho con cháu.', o: 'founded' }; }
        X.add('h', 6); return { t: 'Bạn không tới buổi họp. Tối ấy bạn ăn cơm với vợ con, không nghĩ gì tới tên nhà.', o: 'let' };
      },
      auto: S => S.traits.bold > .4 ? 'claim' : S.traits.social < .55 ? 'found' : 'let' },
    after: { claimed: () => 'Tết năm sau, nhà bạn được mời ngồi mâm trên ở nhà thờ họ.', founded: () => 'Tấm gỗ khắc tên bạn giờ có thêm ba dòng. Con cháu đọc tên bạn đầu tiên.',
      let: () => 'Nhà bạn không có tên to. Nhưng bữa cơm nào cũng đủ người.' }
  });

  // ── Giữ làng ──
  saga('m_guard', {
    nameVi: 'Giữ làng', pitch: 'Đứng chắn cho làng trước mọi thứ từ bên ngoài.', axes: { vo: .8, gia: .5, quyen: .3 }, themes: ['raid', 'war', 'robbery'], aim: null,
    quest: () => 'Giữ làng bình yên', good: ['held', 'wall', 'saved'], marks: { held: 'nguoi_giu_lang', wall: 'nguoi_giu_lang', saved: 'duoc_tin', fell: 'cay_dang' },
    sum: { held: () => 'đứng ở cổng làng tới khi bầy quái rút', wall: () => 'dựng được tường rào và một đội dân canh cho làng', saved: () => 'đưa cả làng đi lánh nạn, không mất một ai', fell: () => 'không giữ được cổng làng ngày quái tràn vào' },
    follow: ['Bạn đi một vòng quanh làng trước khi ngủ, như mọi đêm.', 'Bạn đếm lại số giáo trong kho của đội canh.', 'Tiếng chó sủa ngoài bìa rừng làm bạn ngồi dậy.'],
    beat: { any: ['Bạn dạy mấy đứa trai làng cầm giáo cho đúng.', 'Bạn đi tuần bìa {z}, đánh dấu lối quái hay qua.', 'Bạn vá lại hàng rào phía bắc làng.'] },
    open: (S, X, a) => `Đêm ấy bạn đứng trên mái nhà nhìn về phía ${zoneName(S, X, a)}. Ngoài đó có thứ gì đó đang đợi. Bạn tự hứa: chừng nào bạn còn đứng được, không gì vào được làng.`,
    knot: { title: 'Cách giữ làng', body: () => 'Một người không giữ nổi cả làng. Bạn bắt đầu từ đâu?',
      choices: (S, X) => [{ k: 'watch', label: 'Lập đội dân canh', sub: 'Cần người làng tin bạn.' }, { k: 'train', label: 'Tự luyện thành bức tường', sub: 'Một mình đứng ở cổng.' },
        { k: 'lord', label: 'Xin lãnh chúa gửi lính', sub: `Tốn chừng ${G.coin(Math.round(med(S, X)))} quà biếu.` }],
      apply(S, X, ch, a) {
        if (ch === 'watch') { const p = G.castAdd(S, X, { role: 'ban', how: 'người cùng bạn lập đội canh', work: 'guard', bond: 30 }); a.d.mate = p.id; X.add('so', 4); G.trajBump(S, { quyen: .3 }); return `${first(p.name)} vác giáo tới nhà bạn ngay tối hôm ấy. Tuần sau đội canh có mười người.`; }
        if (ch === 'train') { X.gain('Shield', 5); G.trajBump(S, { vo: .5 }); return 'Bạn tập đứng tấn ở cổng làng mỗi sáng, tới khi lũ trẻ quen coi bạn là cái cột cổng.'; }
        X.money(-Math.round(med(S, X))); a.d.lord = true; return 'Bạn mang quà lên phủ. Lãnh chúa hứa mỗi mùa gửi về năm tay lính.';
      },
      auto: (S, X) => S.traits.social > .55 ? 'watch' : S.gold > med(S, X) * 2 && S.traits.bold < .5 ? 'lord' : 'train' },
    trial: { base: (S, X, a) => .45 + (a.d.path === 'watch' ? .1 : a.d.path === 'lord' ? .05 : 0),
      run: (S, X, a, ok) => ok ? (X.gain('Shield', 2), S.fame += 2, `Một bầy ${spName(a)} mò tới bìa làng lúc nửa đêm. Trống đánh, đuốc đốt khắp hàng rào, bầy quái rút về ${zoneName(S, X, a)}.`)
        : (X.add('hl', -10), `Một bầy ${spName(a)} phá chuồng nhà cuối làng trước khi ai kịp tới. Sáng ra người làng nhìn bạn, không ai nói gì.`) },
    climax: { title: 'Đêm quái tràn xuống', body: (S, X, a) => `Bầy ${spName(a)} lớn nhất trong trí nhớ người già đang kéo xuống từ ${zoneName(S, X, a)}.`,
      choices: (S, X, a) => [{ k: 'stand', label: 'Đứng ở cổng, đánh tới sáng', sub: `Khả năng giữ được chừng ${Math.round(odds(S, X, (a.d.ok ? .55 : .35) + pb(a)) * 100)}%.` },
        { k: 'wall', label: 'Rút vào sau rào, giữ từng nhà', sub: a.d.path === 'watch' ? 'Đội canh đã quen việc.' : 'Chưa có đội canh, khó giữ.' }, { k: 'flee', label: 'Dẫn cả làng lên núi lánh nạn', sub: 'Mất nhà, giữ người.' }],
      apply(S, X, ch, a) {
        if (ch === 'stand') { if (X.chance(odds(S, X, (a.d.ok ? .55 : .35) + pb(a)))) { S.fame += 6; return { t: 'Bạn đứng ở cổng làng tới khi trời rạng. Xác quái chất thành đống trước rào; sau lưng bạn không một mái nhà nào cháy.', o: 'held' }; }
          X.add('hl', -20); X.cond('wound'); return { t: 'Cổng làng vỡ lúc gần sáng. Bạn bị kéo ra khỏi đống gỗ, tay vẫn nắm cán giáo gãy.', o: 'fell' }; }
        if (ch === 'wall') { if (a.d.path === 'watch' || a.d.ok || X.chance(.5)) { S.fame += 3; return { t: 'Mỗi nhà một ngọn đuốc, mỗi ngõ một tay giáo. Bầy quái đi vòng quanh làng tới sáng rồi bỏ đi.', o: 'wall' }; }
          X.add('hl', -12); return { t: 'Rào đổ ở phía bắc. Bạn chạy từ ngõ này sang ngõ khác, không kịp.', o: 'fell' }; }
        X.money(-Math.round(med(S, X) * .5)); X.add('h', -3); return { t: 'Cả làng trèo lên núi trong đêm, người già trên lưng người trẻ. Sáng ra nhìn xuống, mái nhà cháy, nhưng đếm đủ người.', o: 'saved' };
      },
      auto: (S, X, a) => S.traits.bold > .55 ? 'stand' : a.d.path === 'watch' ? 'wall' : 'flee' },
    after: { held: () => 'Người làng khắc tên bạn lên cột cổng. Bọn trẻ chơi trò giữ cổng, đứa nào cũng đòi làm bạn.',
      wall: () => 'Hàng rào vẫn đó, đội canh vẫn thay ca mỗi đêm. Giờ có người khác cầm đuốc thay bạn.',
      saved: () => 'Làng dựng lại ở chỗ cũ sau một mùa. Buổi lễ tạ ơn không thiếu một ai.',
      fell: () => 'Làng dựng lại, nhưng có những ngôi nhà không ai về ở nữa. Bạn vẫn đi tuần mỗi đêm.' }
  });

  // ── Một mối tình ──
  const lov = a => (a && a.d.name) || 'người ấy';
  saga('m_love', {
    nameVi: 'Một mối tình', pitch: 'Giữ lấy một người, dù đời có xô đi đâu.', axes: { gia: 1, du: .2 }, themes: ['romance'], aim: 'family', gate: true,
    quest: a => `Giữ lấy ${lov(a)}`, good: ['wed', 'wait', 'let'], marks: { wed: 'tinh_mot_doi', wait: 'tinh_mot_doi', lost: 'cay_dang', let: 'buong_bo' },
    sum: { wed: d => `ở bên ${d.name || 'người ấy'} tới cuối đời`, wait: d => `đi xa rồi trở về, ${d.name || 'người ấy'} vẫn đợi`, lost: d => `đi xa quá lâu, về thì ${d.name || 'người ấy'} đã không còn đợi`, let: d => `buông tay cho ${d.name || 'người ấy'} đi tìm đời mình` },
    follow: ['Bạn mang theo một món quà nhỏ, định bụng gặp người ấy sẽ đưa.', 'Đêm ấy bạn viết một lá thư dài, rồi chỉ gửi đi nửa trang.', 'Giữa lúc bận nhất bạn vẫn nghĩ tới nụ cười của người ấy.'],
    beat: { any: ['Hai người đi dọc bờ suối tới khi trời tối.', 'Bạn sửa lại cái cổng nhà người ấy mà không ai nhờ.', 'Hai người cãi nhau một trận vì chuyện không đâu, rồi làm lành trước bữa tối.'] },
    open: (S, X, a) => `Bạn gặp ${lov(a)} ở chợ phiên. Hai người nói chuyện tới khi người bán dọn hàng. Về nhà bạn biết đời mình từ nay có thêm một người.`,
    knot: { title: 'Đường tới với nhau', body: (S, X, a) => `Nhà ${lov(a)} không mặn mà với bạn.`,
      choices: () => [{ k: 'prove', label: 'Làm cho nhà người ấy nể', sub: 'Lâu, nhưng đường hoàng.' }, { k: 'elope', label: 'Rủ người ấy bỏ đi', sub: 'Nhanh, mang tiếng.' }, { k: 'wait', label: 'Kiên nhẫn chờ', sub: 'Thời gian sẽ trả lời.' }],
      apply(S, X, ch, a) { if (ch === 'prove') { S.fame += 2; X.gain(bestSk(S), 3); return 'Bạn nhận mọi việc khó trong làng, làm cho tới nơi, để nhà người ấy nghe tên bạn.'; }
        if (ch === 'elope') { X.add('so', -4); G.trajBump(S, { du: .4 }); return `Một đêm không trăng, bạn và ${lov(a)} khoác tay nải đi sang làng bên.`; }
        X.add('h', 2); return 'Bạn không nói gì thêm. Mỗi chiều bạn vẫn đi ngang cổng nhà người ấy.'; },
      auto: S => S.traits.bold > .65 ? 'elope' : S.traits.social > .5 ? 'prove' : 'wait' },
    trial: { base: (S, X, a) => .5 + (a.d.path === 'prove' ? .1 : 0),
      run: (S, X, a, ok) => ok ? (X.add('h', 6), a.d.path === 'elope' ? `Hai người dựng một căn nhà nhỏ ở làng bên. Người ta thôi xì xào sau một mùa.` : `Nhà ${lov(a)} cuối cùng cũng mở cửa đón bạn. Bà mẹ múc cho bạn bát canh đầy nhất.`)
        : (X.add('h', -8), `Một trận ốm của ${lov(a)}, rồi một trận cãi lớn. Có lúc bạn tưởng đã mất người ấy.`) },
    climax: { title: 'Giữa hai con đường', body: (S, X, a) => `Một cơ hội lớn mở ra ở nơi xa. Đi thì phải xa ${lov(a)} nhiều năm.`,
      choices: (S, X, a) => [{ k: 'stay', label: 'Ở lại', sub: 'Bỏ cơ hội ấy.' }, { k: 'go', label: 'Đi, hẹn ngày về', sub: `Chừng ${Math.round(G.clamp(.45 + (a.d.ok ? .2 : 0) + pb(a), .1, .9) * 100)}% người ấy còn đợi.` },
        { k: 'free', label: 'Buông tay', sub: 'Để người ấy đi tìm đời mình.' }],
      apply(S, X, ch, a) {
        if (ch === 'stay') { X.add('h', 8); return { t: `Bạn đốt lá thư mời. Tối ấy ${lov(a)} nấu một nồi cơm to hơn mọi ngày.`, o: 'wed' }; }
        if (ch === 'go') { S.fame += 3; X.money(Math.round(med(S, X) * 1.5)); if (X.chance(G.clamp(.45 + (a.d.ok ? .2 : 0) + pb(a), .1, .9))) return { t: `Bạn đi. Mỗi mùa một lá thư; ${lov(a)} lá nào cũng trả lời.`, o: 'wait' };
          X.add('h', -10); return { t: 'Bạn đi. Thư thưa dần, rồi thôi hẳn.', o: 'lost' }; }
        X.add('h', 2); return { t: `Bạn nói lời từ biệt trước. ${lov(a)} khóc, rồi gật đầu.`, o: 'let' };
      },
      auto: S => S.traits.social > .5 ? 'stay' : S.traits.bold > .6 ? 'go' : 'free' },
    after: { wed: (S, X, a) => `Tóc ${lov(a)} bạc trước tóc bạn. Chiều nào hai người cũng ngồi trước hiên nhà.`,
      wait: (S, X, a) => `Bạn về vào một sáng mưa. ${lov(a)} đứng ở cổng, như đã đứng ở đó suốt mấy năm.`,
      lost: (S, X, a) => `Cổng nhà ${lov(a)} đã có người khác mở. Bạn đứng ở đầu ngõ một lúc rồi đi.`,
      let: (S, X, a) => `Nghe nói ${lov(a)} sống yên ở một làng xa. Bạn thấy nhẹ lòng hơn bạn tưởng.` }
  });

  // ── Bí mật cổ xưa ──
  saga('m_lore', {
    nameVi: 'Bí mật cổ xưa', pitch: 'Tìm cho ra một bí mật mà thế giới đã quên.', axes: { tri: .8, phap: .6, du: .3 }, themes: ['treasure', 'ring', 'grave', 'learn'], aim: 'scholar',
    quest: () => 'Tìm ra bí mật cổ xưa', good: ['found', 'shared', 'sealed'], marks: { found: 'biet_bi_mat', shared: 'duoc_tin', sealed: 'buong_bo', curse: 'cay_dang' },
    sum: { found: () => 'mở được cánh cửa cổ, biết điều thế giới đã quên', shared: () => 'chép bí mật cổ xưa lại cho người đời sau', sealed: () => 'tìm ra bí mật rồi tự tay niêm phong nó lại', curse: () => 'chạm vào một bí mật không nên chạm, mang lời nguyền tới cuối đời' },
    follow: ['Bạn chép thêm một dòng ký tự lạ vào cuốn sổ.', 'Đêm ấy bạn mơ thấy một cánh cửa đá không có tay nắm.', 'Bạn hỏi mọi lữ khách về những phế tích họ từng đi qua.'],
    beat: { any: ['Bạn đọc tới khi nến tàn, rồi thắp cây khác.', 'Bạn đổi một tháng tiền công lấy một tấm da thuộc cũ có ký tự lạ.', 'Bạn so ký tự trên tấm bia ở {z} với cuốn sổ của mình.'] },
    open: () => 'Trong một tấm da thuộc cũ bạn thấy một ký tự không ai trong vùng đọc được. Bạn chép nó lên tay áo. Từ hôm ấy bạn biết đời mình sẽ đi tìm nghĩa của nó.',
    knot: { title: 'Lối đi tìm', body: () => 'Bí mật nằm đâu đó giữa sách cũ, phế tích và lời người chết.',
      choices: () => [{ k: 'books', label: 'Vùi đầu vào sách cũ', sub: 'Học viện, thư khố.' }, { k: 'ruins', label: 'Đi đào phế tích', sub: 'Nguy hiểm, nhiều manh mối.' }, { k: 'voices', label: 'Hỏi người chết', sub: 'Đường tối, nhanh.' }],
      apply(S, X, ch) { if (ch === 'books') { X.add('sm', 5); G.trajBump(S, { tri: .5 }); return 'Bạn xin được chép sách thuê cho thư khố, đổi lại được đọc những cuốn không ai mượn.'; }
        if (ch === 'ruins') { X.gain('Body', 3); G.trajBump(S, { du: .4 }); return 'Bạn mua một cái xẻng, một cuộn dây, rồi đi về phía những phế tích không ai dám tới.'; }
        X.gain('Soul', 3); G.trajBump(S, { am: .5 }); return 'Bạn thắp nến giữa nghĩa địa cũ và gọi tên những người chết đã lâu.'; },
      auto: S => S.traits.studious > .55 ? 'books' : S.traits.bold > .55 ? 'ruins' : G.trajShare(S, 'am') > .2 ? 'voices' : 'books' },
    trial: { base: (S, X, a) => .45 + (a.d.path === 'books' ? .1 : 0),
      run: (S, X, a, ok) => ok ? (X.add('sm', 3), 'Bạn ghép được ba mảnh ký tự thành một câu: "Cửa mở cho người nhớ tên nó." Cả đêm bạn không ngủ.')
        : (X.add('hl', -8), a.d.path === 'ruins' ? 'Hầm phế tích sập sau lưng bạn. Bạn bò ra được, cuốn sổ ghi chép nằm lại dưới đất đá.' : 'Mấy năm chép sách, đọc sách, bạn chỉ thêm được một dòng vào cuốn sổ, mà dòng ấy hóa ra đọc sai.') },
    climax: { title: 'Trước cánh cửa đá', body: () => 'Cánh cửa đá không tay nắm đứng giữa phế tích. Bạn đã biết tên của nó.',
      choices: (S, X, a) => [{ k: 'open', label: 'Gọi tên, mở cửa', sub: `Chừng ${Math.round(G.clamp(.45 + (a.d.ok ? .2 : 0) + pb(a), .1, .9) * 100)}% không có gì trả giá.` },
        { k: 'share', label: 'Chép lại, gửi về học viện', sub: 'Để người sau mở.' }, { k: 'seal', label: 'Niêm phong lại', sub: 'Có những cửa nên đóng.' }],
      apply(S, X, ch, a) {
        if (ch === 'open') { if (X.chance(G.clamp(.45 + (a.d.ok ? .2 : 0) + pb(a), .1, .9))) { X.gain('Arcane', 5); S.fame += 5; return { t: 'Bạn gọi tên cánh cửa. Đá dịch ra không một tiếng động.', o: 'found' }; }
          X.cond('curse'); X.add('hl', -10); return { t: 'Bạn gọi tên cánh cửa. Một luồng gió lạnh đi qua người bạn, rồi cánh cửa đóng lại.', o: 'curse' }; }
        if (ch === 'share') { S.fame += 3; X.add('so', 3); return { t: 'Bạn chép lại tất cả, đóng thành sách, gửi về học viện kinh đô.', o: 'shared' }; }
        X.add('h', 4); return { t: 'Bạn lấp đất lên lối vào, xóa hết dấu chân, rồi đốt trang sổ cuối.', o: 'sealed' };
      },
      auto: S => S.traits.bold > .55 ? 'open' : S.traits.social > .5 ? 'share' : 'seal' },
    after: { found: () => 'Bạn không kể với ai những gì thấy sau cánh cửa. Nhưng từ hôm ấy bạn nhìn sao trời khác đi.',
      shared: () => 'Ở học viện, học trò chép lại sổ của bạn; tên bạn đứng ở trang đầu.',
      sealed: () => 'Chỉ mình bạn biết chỗ cánh cửa. Bạn mang cái tên của nó theo xuống mồ.',
      curse: () => 'Đêm nào bạn cũng nghe tiếng gõ sau lưng. Lời nguyền đi theo bạn tới cuối đời.' }
  });

  // ── Chuộc lỗi ──
  saga('m_atone', {
    nameVi: 'Chuộc lỗi', pitch: 'Trả lại cho đời những gì mình đã lấy.', axes: { dao: .6, gia: .2 }, themes: ['faith'], aim: null, gate: true,
    quest: () => 'Chuộc lại lỗi xưa', good: ['redeemed', 'confessed', 'punished'], marks: { redeemed: 'da_chuoc', confessed: 'da_chuoc', punished: 'giu_loi', hidden: 'cay_dang' },
    sum: { redeemed: () => 'trả lại cho đời những gì mình đã lấy', confessed: () => 'đứng trước mọi người nhận lỗi và được tha', punished: () => 'nhận lỗi và chịu phạt tới nơi tới chốn', hidden: () => 'giấu kín lỗi xưa tới cuối đời' },
    follow: ['Bạn đi qua chỗ cũ, rồi rẽ sang đường khác.', 'Bạn bỏ thêm mấy đồng vào hòm công đức mà không ai thấy.', 'Đêm ấy bạn lại mơ thấy gương mặt ấy.'],
    beat: { any: ['Bạn giúp một nhà góa sửa lại mái mà không lấy công.', 'Bạn chia nửa bữa cơm cho một người ăn xin ở cổng làng.', 'Bạn thắp hương ở miếu làng, đứng lâu hơn mọi khi.'] },
    open: (S, X, a) => `${a.d.why ? 'Bạn vẫn nhớ: ' + a.d.why.charAt(0).toLowerCase() + a.d.why.slice(1) + ' ' : ''}Đêm ấy bạn không ngủ được. Có những thứ không thể để yên mãi.`,
    knot: { title: 'Cách chuộc lỗi', body: () => 'Lỗi cũ không tự mất đi. Bạn trả nó bằng cách nào?',
      choices: () => [{ k: 'help', label: 'Làm việc thiện', sub: 'Từng việc nhỏ một.' }, { k: 'seek', label: 'Tìm người mình đã làm hại', sub: 'Gặp lại họ, hoặc người nhà họ.' }, { k: 'temple', label: 'Vào đền sám hối', sub: 'Cần một nơi để quỳ.' }],
      apply(S, X, ch, a) { if (ch === 'help') { X.add('so', 4); X.money(-Math.round(med(S, X) * .3)); return 'Bạn bắt đầu bằng việc nhỏ: gánh nước cho bà cụ cuối xóm, mỗi sáng.'; }
        if (ch === 'seek') { const p = G.castAdd(S, X, { role: 'on', how: 'người bạn từng làm hại', bond: 5 }); a.d.mate = p.id; return `Bạn hỏi thăm khắp vùng, rồi tìm ra nhà ${first(p.name)}. Bạn đứng ở cổng ba lần mới dám gõ cửa.`; }
        X.gain('Spirit', 3); G.trajBump(S, { dao: .5 }); return 'Bạn quỳ trong đền từ tối tới sáng. Vị tư tế không hỏi gì, chỉ châm thêm dầu vào đèn.'; },
      auto: S => S.traits.pious > .6 ? 'temple' : S.traits.social > .5 ? 'seek' : 'help' },
    trial: { base: (S, X, a) => .5 + (a.d.path === 'seek' ? .05 : 0),
      run: (S, X, a, ok) => ok ? (X.add('h', 5), a.d.path === 'seek' ? 'Người ấy nghe bạn nói hết, rồi rót cho bạn một chén nước. Không ai nói chữ tha, nhưng bạn thấy nhẹ hơn.' : 'Người trong làng bắt đầu chào bạn trước.')
        : (X.add('h', -8), 'Có người nhắc lại chuyện cũ của bạn giữa chợ. Ai cũng nghe.') },
    climax: { title: 'Ngày nói ra', body: () => 'Có một người biết hết chuyện cũ, và người đó sắp nói.',
      choices: (S, X, a) => [{ k: 'confess', label: 'Tự đứng ra nhận', sub: `Chừng ${Math.round(G.clamp(.5 + (a.d.ok ? .2 : 0) + pb(a), .1, .9) * 100)}% được tha.` },
        { k: 'give', label: 'Đem của cải trả lại', sub: 'Mất chừng nửa gia sản.' }, { k: 'hide', label: 'Giấu tiếp', sub: 'Bịt miệng người đó.' }],
      apply(S, X, ch, a) {
        if (ch === 'confess') { if (X.chance(G.clamp(.5 + (a.d.ok ? .2 : 0) + pb(a), .1, .9))) { X.add('h', 8); return { t: 'Bạn đứng giữa sân đình kể hết. Im lặng rất lâu, rồi trưởng làng nói: đủ rồi.', o: 'confessed' }; }
          X.money(-Math.round(med(S, X))); S.fame -= 2; return { t: 'Bạn đứng giữa sân đình kể hết. Người ta bắt bạn đền, và bạn đền.', o: 'punished' }; }
        if (ch === 'give') { X.money(-Math.round(Math.max(0, S.gold) * .5)); X.add('h', 6); return { t: 'Bạn chia nửa gia sản thành từng túi nhỏ, gửi tới từng nhà, không kèm tên.', o: 'redeemed' }; }
        X.money(-Math.round(med(S, X))); X.add('h', -6); return { t: 'Bạn gửi một túi tiền. Người kia im lặng, và bạn biết mình sẽ phải gửi thêm.', o: 'hidden' };
      },
      auto: (S, X) => S.traits.pious > .55 ? 'confess' : S.gold > med(S, X) * 2 ? 'give' : S.traits.bold > .6 ? 'hide' : 'confess' },
    after: { redeemed: () => 'Bạn sống những năm cuối trong căn nhà nhỏ hơn. Ngủ ngon hơn.',
      confessed: () => 'Người ta vẫn nhớ chuyện cũ, nhưng giờ họ kể kèm chuyện bạn đã đứng ra nhận.',
      punished: () => 'Bạn đền đủ tới đồng cuối. Hôm trả xong, có người mời bạn một chén rượu.',
      hidden: () => 'Bí mật chết cùng người biết nó. Bạn thì vẫn còn sống với nó.' }
  });

  // ── Tham vọng ──
  saga('m_shadow', {
    nameVi: 'Tham vọng', pitch: 'Leo lên trên đầu mọi người, bằng mọi giá.', axes: { am: 1, quyen: .6 }, themes: ['dark'], aim: 'power', gate: true,
    quest: () => 'Leo lên trên đầu mọi người', good: ['throne', 'back'], marks: { throne: 'ba_chu', fall: 'tay_trang', back: 'buong_bo' },
    sum: { throne: () => 'đứng trên đầu cả vùng, người ta sợ hơn là nể', fall: () => 'leo cao rồi ngã, mất hết những gì giành được', back: () => 'dừng lại trước bước cuối, quay về làm người thường' },
    follow: ['Bạn ghi tên một người vào cuốn sổ nhỏ, cạnh mấy cái tên đã gạch.', 'Bạn mỉm cười với một kẻ bạn định hạ.', 'Đêm ấy bạn đếm lại những người còn đứng trên mình.'],
    beat: { any: ['Bạn mua chuộc thêm một tay chân trong phủ.', 'Bạn để lộ một tin giả, rồi ngồi xem ai cắn câu.', 'Có người biến mất khỏi làng. Bạn không hỏi.'] },
    open: () => 'Bạn nhìn kẻ đứng đầu vùng đi ngang qua, ngựa cao, áo đẹp. Bạn nghĩ: chỗ ấy không phải trời cho ai. Ai giành được thì ngồi.',
    knot: { title: 'Bậc thang đầu tiên', body: () => 'Muốn lên cao phải có thứ người khác cần, hoặc sợ.',
      choices: () => [{ k: 'gold', label: 'Gom tiền, mua người', sub: 'Cần vốn.' }, { k: 'fear', label: 'Gieo sợ hãi', sub: 'Tay chân, dao găm.' }, { k: 'patron', label: 'Bám vào một kẻ quyền thế', sub: 'Rồi thay chỗ hắn.' }],
      apply(S, X, ch) { if (ch === 'gold') { X.money(-Math.round(med(S, X) * .5)); G.trajBump(S, { thuong: .3, quyen: .3 }); return 'Bạn cho vay lãi nặng, rồi đòi nợ bằng chức, bằng lời hứa.'; }
        if (ch === 'fear') { X.gain('Stealth', 4); G.trajBump(S, { am: .5 }); return 'Bạn nuôi mấy tay chân không hỏi nhiều. Người trong vùng bắt đầu nói nhỏ khi bạn đi qua.'; }
        X.add('so', 4); G.trajBump(S, { quyen: .5 }); return 'Bạn vào làm việc cho một kẻ quyền thế, việc gì cũng nhận, chuyện gì cũng nhớ.'; },
      auto: (S, X) => S.traits.social > .55 ? 'patron' : S.gold > med(S, X) * 2 ? 'gold' : 'fear' },
    trial: { base: (S, X, a) => .45 + Math.min(.2, S.fame / 200) + (a.d.path === 'patron' ? .05 : 0),
      run: (S, X, a, ok) => ok ? (X.money(Math.round(med(S, X) * .8)), 'Kẻ đứng trên bạn ngã ngựa vì một lá thư không ai biết ai viết. Bạn ngồi vào chỗ của hắn.')
        : (X.add('hl', -8), 'Một tay chân của bạn khai ra hết. Bạn phải đốt nhà kho trong đêm để xóa dấu.') },
    climax: { title: 'Bước cuối', body: () => 'Chỉ còn một người đứng trên bạn trong vùng.',
      choices: (S, X, a) => [{ k: 'seize', label: 'Lật đổ hắn', sub: `Chừng ${Math.round(G.clamp(.4 + (a.d.ok ? .2 : 0) + pb(a), .1, .9) * 100)}% thành.` },
        { k: 'deal', label: 'Ép hắn nhường ghế', sub: 'Chậm hơn, ít máu hơn.' }, { k: 'back', label: 'Dừng lại', sub: 'Giữ những gì đã có.' }],
      apply(S, X, ch, a) {
        if (ch === 'seize') { if (X.chance(G.clamp(.4 + (a.d.ok ? .2 : 0) + pb(a), .1, .9))) { S.fame += 5; X.money(Math.round(med(S, X) * 3)); return { t: 'Một đêm, phủ đổi chủ. Sáng ra người ta thấy bạn ngồi ở chiếc ghế cao nhất.', o: 'throne' }; }
          X.money(-Math.round(Math.max(0, S.gold) * .6)); X.add('hl', -15); return { t: 'Hắn biết trước. Bạn chạy thoát trong đêm, bỏ lại tất cả.', o: 'fall' }; }
        if (ch === 'deal') { if (X.chance(G.clamp(.6 + pb(a), .1, .9))) { S.fame += 3; return { t: 'Bạn đặt lên bàn những lá thư hắn từng viết. Hắn đọc, rồi đứng dậy nhường ghế.', o: 'throne' }; }
          X.money(-Math.round(Math.max(0, S.gold) * .4)); return { t: 'Hắn cười, đốt mấy lá thư ngay trước mặt bạn, rồi gọi lính.', o: 'fall' }; }
        X.add('h', 3); return { t: 'Bạn đứng trước cửa phủ rất lâu, rồi quay về.', o: 'back' };
      },
      auto: S => S.traits.bold > .6 ? 'seize' : S.traits.social > .55 ? 'deal' : 'back' },
    after: { throne: () => 'Người ta cúi đầu khi bạn đi qua. Không ai dám nhìn bạn quá lâu, kể cả con cháu bạn.',
      fall: () => 'Bạn mất hết trong một mùa. Những kẻ từng cúi đầu giờ quay mặt đi.',
      back: () => 'Bạn đốt cuốn sổ ghi tên. Đêm ấy bạn ngủ một giấc dài như hồi còn nhỏ.' }
  });

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
  // Dấu mới gieo cho mạch chính: lỗi cũ gọi Chuộc lỗi, quyền giành bằng tay bẩn gọi Tham vọng, nợ máu gọi báo thù / giữ làng.
  const MARK_SEED = { tay_mau: { m_atone: 2.5, m_shadow: 1 }, cua_phi_nghia: { m_atone: 2.5, m_shadow: .5 }, ke_tiem_quyen: { m_atone: 1, m_shadow: 2.5 }, tieng_xau: { m_atone: 1 },
    thu_chua_tra: { m_avenge: 1.5 }, no_mau: { m_avenge: 1, m_guard: 1 }, cay_dang: { m_atone: .5, m_road: .5 } };
  // Kết của một mạch chính gieo cho mạch sau (đường đời mới, hoặc ngã rẽ).
  const CHAIN = G.SAGA_CHAIN = {
    m_avenge: { spare: { m_guard: 2, m_faith: 1 }, fail: { m_guard: 1, m_shadow: 1 }, win: { m_guard: 1.5 }, burn: { m_guard: 1.5 } },
    m_rise: { crooked: { m_atone: 3, m_shadow: 1.5 }, ruined: { m_road: 1 }, rich: { m_house: 1, m_lead: 1 }, steady: { m_love: 1 } },
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
    return Object.keys(out).length ? out : null;
  };
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
      if (v) { Object.assign(d, { kin: v.d.kin, sp: v.d.sp, zone: v.d.zone }); G.arcEnd(S, X, v, 'merged'); }
      else { const z = X.reg(S).zones[1] || X.reg(S).zones[0], sp = X.monsterIn(z); Object.assign(d, { kin: 'những người làng đã mất', sp: sp && sp.id, zone: z.id }); }
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
      return { title: 'Đường đời', body: 'Bạn sắp bước vào đời. Nhìn lại những năm đã qua, có mấy con đường đang gọi bạn. Đường bạn chọn sẽ theo bạn tới cuối đời.',
        choices: [...L.map(([k]) => ({ k, label: SAGA[k].nameVi, sub: (g.why[k] && g.why[k].length ? 'Vì: ' + g.why[k][g.why[k].length - 1] + ' ' : '') + SAGA[k].pitch })),
          { k: 'free', label: 'Chưa định, sống theo ngày', sub: g.asked ? 'Không hỏi lại nữa.' : 'Sẽ hỏi lại khi đã lớn hơn.' }] };
    },
    apply(S, X, k) {
      const g = sg(S); g.asked++; g.t = S.age; st('asked', null);
      if (k === 'free' || !SAGA[k]) { st('free', null); return g.asked > 1 ? 'Bạn sống theo ngày. Đời bạn sẽ là những chuyện nhỏ nối vào nhau.' : 'Bạn chưa muốn chọn. Còn nhiều thời gian.'; }
      openSaga(S, X, k);
      return `Từ hôm ấy, đời bạn có một hướng: ${SAGA[k].pitch.charAt(0).toLowerCase() + SAGA[k].pitch.slice(1)}`;
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
    return a ? `Bạn bỏ dở đường ${old.nameVi}. Từ nay đời bạn rẽ sang hướng khác: ${p}` : `Đời bạn có thêm một hướng: ${p}`;
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
        return { title: 'Ngã rẽ', body: `${g.turn.why ? g.turn.why + ' ' : ''}Bạn đang đi đường ${cur.nameVi} (${STEP_VI[a.at] || a.at}, tiến độ ${Math.round(prog(a))}). Đi tiếp, hay rẽ sang đường khác?`,
          choices: [{ k: 'keep', label: `Đi tiếp: ${cur.nameVi}`, sub: `Bỏ ngang thì những gì đã làm cho đường này dừng ở đó.` },
            ...[t, ...more].map(k => ({ k, label: `Rẽ sang: ${SAGA[k].nameVi}`, sub: whyOf(g, k) + SAGA[k].pitch }))] };
      }
      const d = lastDone(S, g.k), sum = d ? G.ARCS[d.k].sum(d.o, null, d) : null;
      return { title: 'Đường đời mới', body: `Đường ${cur.nameVi} đã khép${sum ? ': ' + sum : ''}. Đời bạn còn dài. Có con đường nào khác đang gọi bạn không?`,
        choices: [...alts(S, X, g, 3).map(([k]) => ({ k, label: SAGA[k].nameVi, sub: whyOf(g, k) + SAGA[k].pitch })), { k: 'free', label: 'Sống nốt đời theo ngày', sub: 'Không hỏi lại nữa.' }] };
    },
    apply(S, X, k) {
      const g = sg(S), a = curMain(S, g), old = SAGA[g.k]; g.last = S.age; g.turn = null;
      if (k === 'keep') { if (a) a.d.prog = prog(a) + 1; g.base = Object.assign({}, g.seed); cnt(S, 'sg_keep'); return `Bạn gạt chuyện ấy sang một bên. ${old.nameVi} vẫn là đường của bạn.`; }
      if (k === 'free' || !SAGA[k]) { g.settled = true; return 'Bạn không tìm thêm con đường nào nữa. Những năm còn lại là những ngày bình thường.'; }
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
  patchDec('aim_pick', (S, X, k) => { if (AIM_ARC[k] && !sg(S).k) { addSeed(S, AIM_ARC[k], 2, `Bạn quyết chí ${(G.AIMS[k] || {}).nameVi || ''}.`.replace(' .', '.')); linkDec(S, X); } });
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

  // ═════════ 4. Mạch ngắn (mọc từ quyết định thường) ═════════
  // Mở bằng patchDec trên lựa chọn; một hoặc hai hồi; kết để lại dấu (G.ARCS[k].marks).
  const SHORT = G.SAGA_SHORT = {};
  function short(k, def) {
    SHORT[k] = def;
    G.ARCS[k] = { nameVi: def.nameVi, tier: 'short', good: def.good, marks: def.marks, sum: (o, p, rec) => (def.sum && def.sum[o] ? def.sum[o](p, rec) : null) };
    patchDec(def.from, (S, X, ch, c) => { if (S.undead || !def.when(S, X, ch, c) || !X.chance(def.p)) return; const p = def.who ? G.castAdd(S, X, def.who(S, X)) : null; if (G.arcOpen(S, X, k, p, def.d ? def.d(S, X, ch) : {})) X._lk = true; });
    for (const n of def.nodes) (n.dec ? sDec(n.id, n) : sNode(n));
  }
  const pName = p => (p ? first(p.name) : 'người ấy');
  short('s_patron', { nameVi: 'Người thuê quay lại', from: 'quest', p: .45, when: (S, X, k) => k !== 'no', good: ['more', 'praise'], marks: { more: 'duoc_tin', praise: 'duoc_tin', stiff: 'ke_thu' },
    who: () => ({ role: 'on', how: 'người từng thuê bạn làm việc', work: 'merchant', bond: 10 }),
    sum: { more: p => `được ${pName(p)} giao việc lớn hơn sau lần thuê đầu`, stiff: p => `bị ${pName(p)} quỵt tiền công` },
    nodes: [{ id: 's_patron_back', st: AD, story: { arc: 's_patron', at: 'open', wait: [2, 8], to: 'end' }, w: 3,
      run(S, X, a, p) { const r = X.rnd() + S.so / 400;
        if (r > .6) { X.money(Math.round(med(S, X) * .8)); return { t: `${pName(p)}, người thuê bạn năm trước, quay lại với một việc lớn hơn, trả trước một nửa.`, k: 'good', o: 'more', bond: 15 }; }
        if (r > .3) { S.fame += 3; return { t: `${pName(p)} kể khắp chợ về việc bạn làm năm trước. Mấy người lạ tìm tới hỏi thuê bạn.`, k: 'good', o: 'praise', bond: 10 }; }
        X.money(-Math.round(med(S, X) * .3)); return { t: `${pName(p)} thuê bạn lần nữa, rồi biến mất trước ngày trả công. Bạn ghi nhớ cái tên ấy.`, k: 'bad', o: 'stiff', bond: -40 }; } }] });
  short('s_guild', { nameVi: 'Phe trong hội', from: 'org_join', p: .5, when: (S, X, k) => k !== 'no', good: ['old', 'young_win'], marks: { old: 'duoc_tin', young_win: 'duoc_tin', young_lose: 'ke_thu' },
    sum: { old: () => 'đứng về phía hội trưởng lúc hội chia phe', young_win: () => 'cùng phe trẻ đổi mới cả hội', young_lose: () => 'thua trong một vụ chia phe ở hội' },
    nodes: [{ id: 's_guild_split', dec: true, prio: 5, story: { arc: 's_guild', at: 'open', wait: [2, 8], to: 'end' },
      build: () => ({ title: 'Hội chia phe', body: 'Hội trưởng đã già, phe trẻ muốn đổi luật chia phần. Ai cũng đang xem bạn đứng bên nào.',
        choices: [{ k: 'old', label: 'Đứng về hội trưởng', sub: 'Giữ nếp cũ.' }, { k: 'young', label: 'Theo phe trẻ', sub: 'Thắng thì lên, thua thì có thù.' }, { k: 'out', label: 'Đứng ngoài', sub: '' }] }),
      apply(S, X, ch) { if (ch === 'old') { X.add('so', 4); return { t: 'Bạn ngồi cạnh hội trưởng ở buổi họp. Phe trẻ rút lui.', o: 'old' }; }
        if (ch === 'young') { if (X.chance(.5 + (S.so - 50) / 200)) { S.fame += 3; return { t: 'Phe trẻ thắng. Luật chia phần mới mang tên bạn trong danh sách người đề xướng.', o: 'young_win' }; } X.add('so', -5); return { t: 'Phe trẻ thua. Hội trưởng nhớ tên từng người đứng lên hôm ấy.', o: 'young_lose' }; }
        return { t: 'Bạn không tới buổi họp. Cả hai phe đều hiểu.', o: 'out' }; },
      auto: S => S.traits.bold > .55 ? 'young' : S.traits.social > .5 ? 'old' : 'out' }] });
  short('s_cubs', { nameVi: 'Lứa thú con', from: 'bounty', p: .35, when: (S, X, k) => k === 'go', good: ['raise'], marks: { kill: 'tay_mau', raise: 'ban_cua_thu', sell: 'cua_phi_nghia' },
    sum: { raise: () => 'nuôi lứa thú con của con quái mình đã hạ', sell: () => 'bán lứa thú con cho kẻ săn da' },
    nodes: [{ id: 's_cubs_den', dec: true, prio: 5, story: { arc: 's_cubs', at: 'open', wait: [1, 6], to: 'end' },
      build: () => ({ title: 'Lứa thú con', body: 'Trong hang của con quái bạn hạ năm ngoái, có một lứa con non đang đói.',
        choices: [{ k: 'kill', label: 'Giết hết cho xong', sub: 'Lớn lên chúng sẽ xuống làng.' }, { k: 'raise', label: 'Mang một con về nuôi', sub: 'Có thể thành bạn, có thể thành họa.' }, { k: 'sell', label: 'Bán cho kẻ săn da', sub: 'Được giá.' }] }),
      apply(S, X, ch) { if (ch === 'kill') { X.add('h', -4); return { t: 'Bạn làm việc cần làm rồi lấp cửa hang. Đêm ấy bạn không ăn được.', o: 'kill' }; }
        if (ch === 'raise') { S.flags.pet = 'thú con của con quái năm nào'; X.gain('Taming', 6); X.add('h', 4); return { t: 'Bạn bọc con nhỏ nhất trong áo mang về. Nó cắn bạn ba lần trước khi chịu ăn.', o: 'raise' }; }
        X.money(Math.round(med(S, X) * .6)); return { t: 'Kẻ săn da trả tiền mặt, không hỏi gì.', o: 'sell' }; },
      auto: S => S.traits.social > .6 ? 'raise' : S.traits.pious < .3 ? 'sell' : 'kill' }] });
  short('s_comrade', { nameVi: 'Đồng đội trong đoàn', from: 'merc', p: .5, when: (S, X, k) => k !== 'no', good: ['rank'], marks: { saved: 'no_mau', rank: 'duoc_tin', thief: 'ke_thu' },
    who: () => ({ role: 'ban', how: 'đồng đội trong đoàn lính đánh thuê', work: 'guard', bond: 30 }),
    sum: { saved: p => `được ${pName(p)} đỡ đòn thay`, rank: () => 'được giao chỉ huy một toán trong đoàn', thief: p => `bị ${pName(p)} cuỗm phần chia của cả toán` },
    nodes: [{ id: 's_comrade_fate', st: AD, story: { arc: 's_comrade', at: 'open', wait: [1, 6], to: 'end' }, w: 3,
      run(S, X, a, p) { const r = X.rnd();
        if (r < .35) { if (p) { p.alive = false; p.died = S.world.year; } X.add('h', -10); return { t: `Trong một trận phục kích, ${pName(p)} lao ra đỡ nhát rìu nhắm vào bạn. Bạn chôn ${pName(p)} bên đường, cắm thanh kiếm làm bia.`, k: 'bad', o: 'saved' }; }
        if (r < .7) { S.fame += 3; X.add('so', 4); return { t: `Đoàn trưởng giao cho bạn chỉ huy toán của ${pName(p)} và hai toán khác.`, k: 'good', o: 'rank', bond: 10 }; }
        X.money(-Math.round(Math.max(0, S.gold) * .2)); if (p) { p.role = 'thu'; p.bond = -50; } return { t: `Sáng ra ${pName(p)} biến mất cùng phần chia của cả toán.`, k: 'bad', o: 'thief' }; } }] });
  short('s_promise', { nameVi: 'Lời hứa lúc tranh cử', from: 'head_elect', p: .6, when: (S, X, k) => k === 'yes', good: ['keep'], marks: { keep: 'giu_loi', break: 'tieng_xau' },
    sum: { keep: () => 'giữ lời hứa đào giếng lúc tranh ghế trưởng', break: () => 'quên lời hứa lúc tranh ghế trưởng' },
    nodes: [{ id: 's_promise_well', dec: true, prio: 5, story: { arc: 's_promise', at: 'open', wait: [2, 8], to: 'end' },
      build: (S, X) => ({ title: 'Lời hứa', body: `Lúc tranh ghế, bạn hứa đào một cái giếng mới cho xóm cuối. Giờ cần chừng ${G.coin(Math.round(med(S, X) * .8))}.`,
        choices: [{ k: 'keep', label: 'Giữ lời', sub: 'Tốn tiền nhà mình.' }, { k: 'break', label: 'Để sau', sub: 'Người ta sẽ nhớ.' }] }),
      apply(S, X, ch) { if (ch === 'keep') { X.money(-Math.round(med(S, X) * .8)); X.add('so', 8); return { t: 'Giếng đào xong trước mùa khô. Người xóm cuối gọi nó theo tên bạn.', o: 'keep' }; } X.add('so', -6); return { t: 'Mùa khô tới, xóm cuối vẫn gánh nước từ sông.', o: 'break' }; },
      auto: (S, X) => S.gold > med(S, X) || S.traits.social > .5 ? 'keep' : 'break' }] });
  short('s_newland', { nameVi: 'Đất mới', from: 'migrate', p: .5, when: (S, X, k) => k !== 'stay', good: ['home'], marks: { home: 'que_moi', cold: 'nguoi_la' },
    sum: { home: p => `được ${pName(p)} đón ở vùng đất mới` },
    nodes: [{ id: 's_newland_first', st: TAE, story: { arc: 's_newland', at: 'open', wait: [0, 4], to: 'end' }, w: 4,
      run(S, X) { if (X.chance(.4 + S.traits.social * .4)) { const p = G.castAdd(S, X, { role: 'ban', how: 'người hàng xóm đầu tiên ở đất mới', bond: 40 }); X.add('so', 5); return { t: `${first(p.name)}, nhà bên cạnh, mang sang một nồi canh vào tối đầu tiên bạn tới. Bạn thấy đất này cũng có thể là quê.`, k: 'good', o: 'home' }; }
        X.add('so', -4); return { t: 'Ở đất mới chưa ai chào bạn. Người ta nhìn bạn đi chợ như nhìn khách qua đường.', k: 'bad', o: 'cold' }; } }] });
  short('s_loot', { nameVi: 'Lai lịch món đồ', from: 'gear', p: .25, when: (S, X, k) => k === 'buy', good: ['return'], marks: { return: 'giu_loi', keep: 'tieng_xau' },
    sum: { return: () => 'trả lại món đồ ăn cắp cho chủ cũ' },
    nodes: [{ id: 's_loot_owner', dec: true, prio: 5, story: { arc: 's_loot', at: 'open', wait: [1, 6], to: 'end' },
      build: () => ({ title: 'Chủ cũ của món đồ', body: 'Một người lạ chặn bạn ở chợ: món đồ bạn mua năm ngoái là của nhà ông ta, bị trộm.',
        choices: [{ k: 'return', label: 'Trả lại', sub: 'Mất món đồ.' }, { k: 'pay', label: 'Trả thêm tiền để giữ', sub: '' }, { k: 'keep', label: 'Bảo ông ta đi chỗ khác', sub: 'Đồ bạn mua bằng tiền.' }] }),
      apply(S, X, ch) { if (ch === 'return') { S.gear = Math.max(0, S.gear - 1); X.add('so', 6); return { t: 'Bạn tháo món đồ đưa lại. Ông ta khóc, cúi đầu ba lần.', o: 'return' }; }
        if (ch === 'pay') { X.money(-Math.round(med(S, X) * .5)); return { t: 'Bạn trả thêm cho ông ta một khoản. Hai bên bắt tay.', o: 'pay' }; }
        X.add('so', -4); return { t: 'Bạn gạt ông ta ra. Cả chợ nhìn theo.', o: 'keep' }; },
      auto: (S, X) => S.traits.pious > .55 ? 'return' : S.gold > med(S, X) ? 'pay' : 'keep' }] });
  short('s_founder', { nameVi: 'Những người đầu tiên', from: 'found_settle', p: 1, when: (S, X, k) => k !== 'no', good: ['root'], marks: { root: 'nguoi_lap_lang' },
    sum: { root: () => 'dựng một ngôi làng từ đất trống' },
    nodes: [{ id: 's_founder_first', st: AD, story: { arc: 's_founder', at: 'open', wait: [0, 4], to: 'end' }, w: 5,
      run(S, X) { const p = G.castAdd(S, X, { role: 'ban', how: 'người đầu tiên tới ở làng bạn lập', bond: 45, work: 'farmer' });
        return { t: `Nhà ${first(p.name)} là nhà đầu tiên tới ở làng bạn lập. Hai nhà cùng dựng cái giếng chung, khắc tên cả hai lên thành giếng.`, k: 'good', o: 'root' }; } }] });
  short('s_healer', { nameVi: 'Ơn thầy thuốc', from: 'healer', p: .5, when: (S, X, k) => k === 'pay' || k === 'pray', good: ['repaid'], marks: { repaid: 'duoc_tin', refused: 'tieng_xau' },
    who: () => ({ role: 'an', how: 'thầy thuốc chữa cho bạn năm ấy', work: 'healer', bond: 30 }),
    sum: { repaid: p => `trả ơn ${pName(p)}, thầy thuốc từng chữa cho mình` },
    nodes: [{ id: 's_healer_ask', dec: true, prio: 5, story: { arc: 's_healer', at: 'open', wait: [2, 8], to: 'end' },
      build: (S, X, a, p) => ({ title: 'Thầy thuốc nhờ việc', body: `${pName(p)}, thầy thuốc chữa cho bạn năm ấy, cần người vào khu săn hái một loại rễ thuốc cho đứa trẻ đang sốt.`,
        choices: [{ k: 'go', label: 'Đi hái thuốc', sub: 'Khu săn có quái.' }, { k: 'no', label: 'Từ chối', sub: '' }] }),
      apply(S, X, ch, c, a, p) { if (ch === 'go') { if (X.chance(odds(S, X, .6))) { X.add('so', 5); return { t: 'Bạn mang rễ thuốc về trước khi trời tối. Đứa trẻ hạ sốt vào sáng hôm sau.', o: 'repaid' }; } X.add('hl', -10); X.cond('wound'); return { t: 'Bạn mang được rễ thuốc về, kèm một vết cắn ở bắp chân. Đứa trẻ khỏi; bạn nằm một tháng.', o: 'repaid' }; }
        return { t: `${pName(p)} gật đầu, không nói gì, rồi đi tìm người khác.`, o: 'refused' }; },
      auto: S => S.traits.bold > .35 || S.traits.social > .5 ? 'go' : 'no' }] });
  short('s_classmate', { nameVi: 'Bạn cùng lớp', from: 'school', p: .6, when: (S, X, k) => k !== 'no', good: ['friend', 'rival'],
    sum: {},
    nodes: [{ id: 's_classmate_meet', st: ['child', 'teen'], story: { arc: 's_classmate', at: 'open', wait: [0, 4], to: 'end' }, w: 4,
      run(S, X) { if (X.chance(.6)) { const p = G.castAdd(S, X, { role: 'ban', how: 'bạn cùng lớp của bạn', bond: 40 }); G.arcOpen(S, X, 'friend', p, {}); return { t: `Ở trường, bạn ngồi cạnh ${first(p.name)}. Hai đứa chép bài của nhau, bị phạt cùng nhau.`, k: 'good', o: 'friend' }; }
        const p = G.castAdd(S, X, { role: 'doi', how: 'kẻ đứng đầu lớp năm ấy', bond: -15, drive: .7 }); G.arcOpen(S, X, 'rival', p, {}); return { t: `Ở trường, ${first(p.name)} luôn đứng đầu lớp, và luôn nhìn bạn như nhìn người thứ hai.`, k: 'info', o: 'rival' }; } }] });
  short('s_license', { nameVi: 'Kẻ trốn giấy phép', from: 'cv_license', p: .6, when: (S, X, k) => k === 'hide', good: ['slip'], marks: { caught: 'tieng_xau' },
    sum: { caught: () => 'bị bắt quả tang luyện phép không giấy' },
    nodes: [{ id: 's_license_check', st: AD, story: { arc: 's_license', at: 'open', wait: [1, 6], to: 'end' }, w: 3,
      run(S, X) { if (X.chance(.5)) { X.money(-Math.round(med(S, X) * .6)); cnt(S, 'crimes'); return { t: 'Lính tuần tra gõ cửa đúng lúc bạn đang luyện phép. Bạn nộp phạt, tên bạn vào sổ.', k: 'bad', o: 'caught' }; }
        return { t: 'Lính tuần tra hỏi han cả xóm về người luyện phép không giấy. Không ai chỉ nhà bạn.', k: 'info', o: 'slip' }; } }] });

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
  for (const e of G.EVENTS) {
    if (!e._story) API.wrapStory(e);   // sự kiện của racev.js, culture.js thêm sau story.js: đếm cùng thang
  }
  for (const e of NEW) { G.treeWrap.event(e); API.wrapStory(e); }
  for (const id of NEWD) G.treeWrap.decision(id, DEC[id]);
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
