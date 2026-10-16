/* Vạn Kiếp — THIÊN PHÚ và CHÍ HƯỚNG (docs/06_Thien_phu_chi_huong.md).
 * Căn cốt: mỗi người một bậc (Trắng → Lục → Lam → Tím → Vàng → Đỏ), quyết định tốc độ tu luyện: G.gainMult nhân vào mọi lần rèn kỹ năng,
 *   G.cultRate nhân vào kinh nghiệm (life.js gain, addXp). Nâng được một bậc ở bình cảnh mỗi Tier cảnh giới (quyết định tal_break).
 * Thiên phú: 0–3 cái lúc sinh, mỗi cái một bậc màu, hiệu ứng khai trong fx; thức tỉnh thêm trong đời (quyết định tal_awaken, chọn 1 trong 3).
 * Chí hướng S.aim: người chơi đặt lúc nào cũng được (ô Chí hướng dưới focus) hoặc qua quyết định aim_pick tuổi thiếu niên.
 *   Chí hướng và thiên phú dịch tính cách: S.traits = S.traitsBase + thiên phú + chí hướng, nên mọi lựa chọn tự động theo tính cách
 *   (Tự sống, đời headless) nghiêng theo. Thêm: trọng số focus (G.autoFocus), nghề ưu tiên (quyết định work, aim_job),
 *   cãi lời gia đình (aim_defy), cơ hội theo chí hướng (sự kiện aim_sign → quyết định aim_chance).
 * Trạng thái: S.tal = { root, list:[id] }, S.talFx (hiệu ứng gộp, tính lại khi đổi), S.aim, S.traitsBase. Bản lưu cũ không có: coi như không thiên phú.
 */
window.LifeSim = window.LifeSim || {};
(function (G) {
  const DEC = G.DECISIONS;
  const cnt = (S, k, v = 1) => { S.flags[k] = (S.flags[k] || 0) + v; };
  const homeName = (S, X) => { const s = G.SET && S.home.settlement && G.SET[S.home.settlement]; return s ? s.name : X.reg(S).nameVi; };
  const cap = s => s[0].toUpperCase() + s.slice(1);
  const num = v => String(+v.toFixed(2)).replace('.', ',');

  // ═════════ Bậc màu ═════════
  // w: trọng số khi bốc (căn cốt lúc sinh và bậc của mỗi thiên phú); rate: tốc độ tu luyện của căn cốt bậc đó (trung bình lúc sinh ≈ 1).
  G.RARITY = [
    { id: 'white',  nameVi: 'Trắng', col: '#d9d4ca', w: 46,  rate: .85 },
    { id: 'green',  nameVi: 'Lục',   col: '#62c46e', w: 27,  rate: 1 },
    { id: 'blue',   nameVi: 'Lam',   col: '#5b9cf0', w: 15,  rate: 1.15 },
    { id: 'purple', nameVi: 'Tím',   col: '#b07cf0', w: 8,   rate: 1.35 },
    { id: 'gold',   nameVi: 'Vàng',  col: '#f0c45a', w: 3.4, rate: 1.6 },
    { id: 'red',    nameVi: 'Đỏ',    col: '#f05a4a', w: .6,  rate: 2 }
  ];
  G.RANK = Object.fromEntries(G.RARITY.map((r, i) => [r.id, i]));
  G.ROOT_VI = ['Căn cốt bình thường', 'Căn cốt khá', 'Căn cốt tốt', 'Căn cốt hiếm có', 'Căn cốt thiên tài', 'Căn cốt trăm năm có một'];
  // Bốc một bậc; up > 0 đẩy về phía bậc cao (thức tỉnh giữa đời hay ra thiên phú tốt hơn lúc sinh).
  const rollRank = (X, up = 0) => X.wpick([0, 1, 2, 3, 4, 5], k => G.RARITY[k].w * Math.exp(up * k));

  // ═════════ Thiên phú ═════════
  // r: bậc (0 Trắng … 5 Đỏ). fx: rate (× tu luyện), school {trường: ×}, m {kỹ năng: ×} (× tốc độ rèn), pow (+ sức mạnh, Tier),
  // life (× nguy cơ chết mỗi năm), inc (× thu nhập), loot (× chiến lợi phẩm), flee (+ cơ hội chạy thoát), dev (× tích Devotion),
  // heal (× cơ hội khỏi bệnh), learn (× Hiểu biết khi Học chữ), tgt {hl, h, so} (+ mục tiêu chỉ số), trait (+ tính cách),
  // rise (cơ hội trỗi dậy tối thiểu khi chết), start {hl, h, so, sm, fame, m:{kỹ năng}} cộng một lần khi có.
  G.TALENTS = {
    // Trắng
    an_khoe:     { r: 0, nameVi: 'Ăn khỏe ngủ say', d: 'Ốm vặt mau lành.', fx: { tgt: { hl: 3 }, heal: 1.15 } },
    chiu_kho:    { r: 0, nameVi: 'Chịu khó', d: 'Tập lâu không than.', fx: { rate: 1.05 } },
    mat_tinh:    { r: 0, nameVi: 'Mắt tinh', d: 'Thấy con chim trên ngọn cây bên kia sông.', fx: { m: { Bow: 1.25, Throwing: 1.25, Crossbow: 1.15 } } },
    kheo_tay:    { r: 0, nameVi: 'Khéo tay', d: 'Đồ gì qua tay cũng chạy.', fx: { school: { craft: 1.2 } } },
    de_gan:      { r: 0, nameVi: 'Dễ gần', d: 'Đi đâu cũng có người chào.', fx: { tgt: { so: 5 }, trait: { social: .1 } } },
    lac_quan:    { r: 0, nameVi: 'Lạc quan', d: 'Mất mùa vẫn hát.', fx: { tgt: { h: 5 } } },
    chan_nhanh:  { r: 0, nameVi: 'Chân nhanh', d: 'Chạy thoát được hầu hết mọi thứ.', fx: { flee: .1 } },
    tinh_toan:   { r: 0, nameVi: 'Biết tính toán', d: 'Đồng bạc nào cũng đếm hai lần.', fx: { inc: 1.06 } },
    // Lục
    the_chat:    { r: 1, nameVi: 'Thể chất tốt', d: 'Ít khi ốm, ngã đâu đứng dậy đó.', fx: { tgt: { hl: 5 }, life: .94, start: { hl: 6 } } },
    sang_da:     { r: 1, nameVi: 'Sáng dạ', d: 'Nghe một hiểu mười.', fx: { learn: 1.35, trait: { studious: .1 }, start: { sm: 6 } } },
    vo_cot:      { r: 1, nameVi: 'Võ cốt', d: 'Xương cứng, gân dẻo.', fx: { school: { combat: 1.25, martial: 1.15 } } },
    than_thu:    { r: 1, nameVi: 'Thân với thú', d: 'Chó dữ cũng vẫy đuôi.', fx: { school: { beast: 1.35 } } },
    buon_ban:    { r: 1, nameVi: 'Đầu óc buôn bán', d: 'Mua rẻ bán đắt như thở.', fx: { inc: 1.12, trait: { social: .05 } } },
    kien_tri:    { r: 1, nameVi: 'Kiên trì', d: 'Không bỏ dở việc gì.', fx: { rate: 1.1 } },
    tam_than:    { r: 1, nameVi: 'Tâm hướng thần', d: 'Lời cầu nguyện đầu tiên đã thấy ấm.', fx: { dev: 1.4, trait: { pious: .15 } } },
    gan_da:      { r: 1, nameVi: 'Gan dạ', d: 'Không biết sợ là gì.', fx: { pow: .05, trait: { bold: .2 } } },
    // Lam
    kiem_tam:    { r: 2, nameVi: 'Kiếm tâm', d: 'Cầm kiếm như cầm đũa.', fx: { m: { Sword: 1.6, Shield: 1.2 } } },
    hoa_can:     { r: 2, nameVi: 'Linh căn Hỏa', d: 'Lửa trong lò nghiêng về phía bạn.', fx: { m: { Fire: 1.6 }, start: { m: { Fire: 4 } } } },
    bang_can:    { r: 2, nameVi: 'Linh căn Băng', d: 'Nước trong chén bạn cầm hay đóng váng.', fx: { m: { Frost: 1.6 }, start: { m: { Frost: 4 } } } },
    loi_can:     { r: 2, nameVi: 'Linh căn Lôi', d: 'Tóc dựng đứng mỗi khi trời giông.', fx: { m: { Lightning: 1.6 }, start: { m: { Lightning: 4 } } } },
    bong_dem:    { r: 2, nameVi: 'Con của bóng đêm', d: 'Bước chân không có tiếng.', fx: { school: { shadow: 1.4 }, flee: .08 } },
    than_luc:    { r: 2, nameVi: 'Thần lực', d: 'Mười tuổi vác được bao thóc.', fx: { pow: .12, m: { Axe: 1.25, Body: 1.25, Unarmed: 1.2 } } },
    truong_tho:  { r: 2, nameVi: 'Tướng sống lâu', d: 'Bà đỡ bảo đứa này lâu chết.', fx: { life: .85 } },
    phuc_tinh:   { r: 2, nameVi: 'Phúc tinh', d: 'Hay nhặt được của rơi.', fx: { loot: 1.4, life: .95, tgt: { h: 3 } } },
    // Tím
    ngo_tinh:    { r: 3, nameVi: 'Ngộ tính cao', d: 'Thầy dạy một, tự hiểu ba.', fx: { rate: 1.2, learn: 1.3 } },
    bach_chien:  { r: 3, nameVi: 'Bách chiến', d: 'Sinh ra để đứng giữa trận.', fx: { pow: .18, flee: .08, trait: { bold: .1 } } },
    am_duong:    { r: 3, nameVi: 'Mắt âm dương', d: 'Thấy cả những thứ người khác không thấy.', fx: { school: { death: 1.5 }, m: { Spirit: 1.3 } } },
    thanh_quang: { r: 3, nameVi: 'Thánh quang hộ thể', d: 'Đứng gần bạn người ta thấy ấm.', fx: { m: { Spirit: 1.6 }, dev: 1.5, heal: 1.3 } },
    co_khi:      { r: 3, nameVi: 'Kỳ tài cơ khí', d: 'Tháo đồng hồ ra, lắp lại chạy nhanh hơn.', fx: { school: { craft: 1.5 }, inc: 1.08 } },
    bat_hoai:    { r: 3, nameVi: 'Thân bất hoại', d: 'Vết thương liền nhanh như chưa từng có.', fx: { tgt: { hl: 8 }, heal: 1.6, life: .88 } },
    vuong_khi:   { r: 3, nameVi: 'Vương khí', d: 'Nói một câu, cả làng im lặng nghe.', fx: { tgt: { so: 8 }, trait: { social: .2 }, start: { fame: 5 } } },
    // Vàng
    chien_than:  { r: 4, nameVi: 'Thiên sinh chiến thần', d: 'Vũ khí nào vào tay cũng thành của mình.', fx: { school: { combat: 1.7, martial: 1.3 }, pow: .1 } },
    van_phap:    { r: 4, nameVi: 'Vạn pháp quy tông', d: 'Phép nào đọc qua một lần là nhớ.', fx: { school: { arcane: 1.7 }, learn: 1.5 } },
    long_huyet:  { r: 4, nameVi: 'Huyết mạch rồng', d: 'Máu nóng hơn người thường.', fx: { pow: .25, m: { Fire: 1.4 }, life: .88 } },
    thien_menh:  { r: 4, nameVi: 'Thiên mệnh', d: 'Tai họa cứ đi vòng qua bạn.', fx: { life: .8, loot: 1.5, tgt: { h: 5 } } },
    bach_nghe:   { r: 4, nameVi: 'Bách nghệ tinh thông', d: 'Học gì cũng nhanh.', fx: { rate: 1.35 } },
    ngu_thu:     { r: 4, nameVi: 'Ngự thú vương', d: 'Thú dữ cúi đầu trước bạn.', fx: { school: { beast: 1.8 }, pow: .08 } },
    // Đỏ
    chi_ton:     { r: 5, nameVi: 'Chí tôn cốt', d: 'Xương phát sáng mờ trong đêm.', fx: { rate: 1.6, pow: .2 } },
    thien_dao:   { r: 5, nameVi: 'Con cưng của trời', d: 'Sấm sét tránh mái nhà bạn.', fx: { rate: 1.3, life: .7, loot: 1.5 } },
    ma_than:     { r: 5, nameVi: 'Ma thần chuyển thế', d: 'Mạnh tới đáng sợ; người thân ai cũng tránh.', fx: { pow: .4, rate: 1.4, tgt: { so: -15, h: -6 } } },
    bat_diet:    { r: 5, nameVi: 'Hồn bất diệt', d: 'Cái chết không giữ nổi bạn.', fx: { rise: .6, life: .9 } }
  };
  for (const [id, t] of Object.entries(G.TALENTS)) t.id = id;

  // Thiên phú chỉ rèn trường phái mà chủng tộc không học được thì bỏ (Linh căn Hỏa cho chủng tộc cấm Huyền thuật).
  const schoolsOf = t => { const f = t.fx, s = new Set(Object.keys(f.school || {})); for (const m of Object.keys(f.m || {})) s.add(G.MASTERY[m]); return [...s]; };
  const usable = (t, race) => { const sc = schoolsOf(t); if (!sc.length) return true; const rs = window.JobLibrary.races[race].schools; return sc.some(x => rs.native.includes(x) || rs.foreign.includes(x)); };
  // Một thiên phú bậc rk chưa có (không có thì lùi bậc); except: các id đang chào cùng lúc.
  function pickTalent(X, S, rk, except = []) {
    const own = new Set([...((S.tal && S.tal.list) || []), ...except]);
    for (let r = rk; r >= 0; r--) {
      const c = Object.values(G.TALENTS).filter(t => t.r === r && !own.has(t.id) && usable(t, S.race));
      if (c.length) return X.pick(c).id;
    }
    return null;
  }

  // ── Hiệu ứng gộp ──
  const NOFX = { rate: 1, school: {}, m: {}, pow: 0, life: 1, inc: 1, loot: 1, flee: 0, dev: 1, heal: 1, learn: 1, tgt: { hl: 0, h: 0, so: 0 }, rise: 0, trait: {} };
  G.tfx = S => S.talFx || NOFX;
  G.cultRate = S => G.tfx(S).rate;
  G.gainMult = (S, m) => { const F = G.tfx(S); return F.rate * (F.school[G.MASTERY[m]] || 1) * (F.m[m] || 1); };
  G.talRecalc = function (S) {
    const T = S.tal, F = JSON.parse(JSON.stringify(NOFX));
    if (T) {
      F.rate = G.RARITY[G.RANK[T.root]].rate;
      for (const id of T.list) {
        const f = G.TALENTS[id].fx;
        for (const k of ['rate', 'life', 'inc', 'loot', 'dev', 'heal', 'learn']) if (f[k]) F[k] *= f[k];
        for (const k of ['pow', 'flee']) if (f[k]) F[k] += f[k];
        if (f.rise) F.rise = Math.max(F.rise, f.rise);
        for (const g of ['school', 'm']) for (const [k, v] of Object.entries(f[g] || {})) F[g][k] = (F[g][k] || 1) * v;
        for (const [k, v] of Object.entries(f.tgt || {})) F.tgt[k] += v;
        for (const [k, v] of Object.entries(f.trait || {})) F.trait[k] = (F.trait[k] || 0) + v;
      }
    }
    S.talFx = F;
    G.syncTraits(S);
    return F;
  };
  // Tính cách hiện hành = tính cách gốc + thiên phú + chí hướng.
  G.syncTraits = function (S) {
    if (!S.traitsBase) S.traitsBase = { ...S.traits };
    const A = G.AIMS[S.aim] || G.AIMS.free, tr = G.tfx(S).trait;
    for (const k of Object.keys(S.traitsBase)) S.traits[k] = G.clamp(S.traitsBase[k] + (tr[k] || 0) + (A.trait[k] || 0), 0, 1);
  };
  function applyStart(S, X, id) {
    const st = G.TALENTS[id].fx.start; if (!st) return;
    for (const k of ['hl', 'h', 'so', 'sm']) if (st[k]) X.add(k, st[k]);
    if (st.fame) S.fame = Math.min(100, S.fame + st.fame);
    for (const [m, v] of Object.entries(st.m || {})) if (m in S.mastery) S.mastery[m] = Math.min(100, S.mastery[m] + v);
  }
  G.addTalent = function (S, X, id) {
    if (!S.tal || S.tal.list.includes(id)) return;
    S.tal.list.push(id); G.talRecalc(S); applyStart(S, X, id);
  };

  // ── Chữ cho giao diện, nhật ký ──
  G.rarityOf = id => G.RARITY[G.TALENTS[id].r];
  G.fxText = function (f) {
    const o = [];
    if (f.rate) o.push(`tu luyện ×${num(f.rate)}`);
    for (const [k, v] of Object.entries(f.school || {})) o.push(`${window.JobLibrary.schools[k].nameVi} ×${num(v)}`);
    for (const [k, v] of Object.entries(f.m || {})) o.push(`${G.mv(k)} ×${num(v)}`);
    if (f.pow) o.push(`sức mạnh +${num(f.pow)} Tier`);
    if (f.life) o.push(`nguy cơ chết ×${num(f.life)}`);
    if (f.inc) o.push(`thu nhập ×${num(f.inc)}`);
    if (f.loot) o.push(`chiến lợi phẩm ×${num(f.loot)}`);
    if (f.flee) o.push(`chạy thoát +${Math.round(f.flee * 100)}%`);
    if (f.dev) o.push(`Devotion ×${num(f.dev)}`);
    if (f.heal) o.push(`khỏi bệnh ×${num(f.heal)}`);
    if (f.learn) o.push(`Học chữ ×${num(f.learn)}`);
    const SV = { hl: 'Sinh lực', h: 'Tâm trạng', so: 'Quan hệ' }, TV = { bold: 'gan', studious: 'chăm học', pious: 'mộ đạo', social: 'hòa đồng' };
    for (const [k, v] of Object.entries(f.tgt || {})) o.push(`${SV[k]} ${v > 0 ? '+' : ''}${v}`);
    for (const [k, v] of Object.entries(f.trait || {})) o.push(`tính ${TV[k]} +${num(v)}`);
    if (f.rise) o.push(`trỗi dậy ít nhất ${Math.round(f.rise * 100)}%`);
    return o.join(' · ');
  };
  G.rootText = S => { if (!S.tal) return null; const k = G.RANK[S.tal.root]; return `${G.ROOT_VI[k]} (${G.RARITY[k].nameVi})`; };
  // Dòng nhật ký lúc sinh / thức tỉnh: "Căn cốt tốt (Lam), tu luyện ×1,15. Thiên phú: Kiếm tâm (Lam), Dễ gần (Trắng)."
  G.talText = S => {
    if (!S.tal) return '';
    const L = S.tal.list.map(id => `${G.TALENTS[id].nameVi} (${G.rarityOf(id).nameVi})`);
    return `${G.rootText(S)}, tu luyện ×${num(G.RARITY[G.RANK[S.tal.root]].rate)}.` + (L.length ? ` Thiên phú: ${L.join(', ')}.` : ' Không có thiên phú gì đặc biệt.');
  };
  // Chip cho bảng nhân vật: { text, col, title }.
  G.talChips = S => !S.tal ? [] : [
    { text: G.ROOT_VI[G.RANK[S.tal.root]], col: G.RARITY[G.RANK[S.tal.root]].col, title: `Căn cốt ${G.RARITY[G.RANK[S.tal.root]].nameVi}: tu luyện ×${num(G.RARITY[G.RANK[S.tal.root]].rate)} (kinh nghiệm và mọi kỹ năng). Nâng được ở bình cảnh cấp 10, 20, 30, 40, 50.` },
    ...S.tal.list.map(id => { const t = G.TALENTS[id], r = G.rarityOf(id); return { text: t.nameVi, col: r.col, title: `${r.nameVi} · ${t.d} ${cap(G.fxText(t.fx))}.` }; })
  ];

  // ── Lúc sinh, lúc trỗi dậy (life.js gọi) ──
  G.birthTalents = function (X) {
    const S = X.S, root = G.RARITY[rollRank(X)].id, n = X.wpick([0, 1, 2, 3], k => [30, 40, 22, 8][k]);
    S.tal = { root, list: [] }; S.flags.root0 = root;
    S.aim = S.aim || 'free';
    for (let i = 0; i < n; i++) { const id = pickTalent(X, S, rollRank(X)); if (id) S.tal.list.push(id); }
    G.talRecalc(S);
    for (const id of S.tal.list) applyStart(S, X, id);
    const top = Math.max(G.RANK[root], ...S.tal.list.map(id => G.TALENTS[id].r));
    return { text: (top >= 3 ? 'Bà đỡ sờ xương bạn rồi lặng đi một lúc. ' : '') + G.talText(S), big: top >= 3 };
  };
  // Bộ Xương giữ căn cốt (theo hồn); thiên phú của thân xác cũ mất hết, chí hướng về Thuận theo tự nhiên.
  G.riseTalents = function (old, S) {
    S.traitsBase = { ...(old.traitsBase || old.traits) }; S.traitsBase.social *= .4;
    S.tal = { root: old.tal ? old.tal.root : 'white', list: [] }; S.flags.root0 = S.tal.root;
    S.aim = 'free';
    G.talRecalc(S);
  };

  // ═════════ Chí hướng ═════════
  // trait: dịch tính cách; focus: + trọng số focus khi Tự sống; works: sinh kế ưu tiên (đầu danh sách là nghề khi bỏ nhà đi);
  // schools: trường phái ưu tiên khi chọn hướng lúc nhỏ; dream / side / sign: chữ cho aim_defy, luyện riêng, sự kiện aim_sign.
  G.AIMS = {
    free:      { nameVi: 'Thuận theo tự nhiên', icon: '🍃', d: 'Không ép; sống theo tính cách.', trait: {}, focus: {}, works: [], schools: [] },
    adventure: { nameVi: 'Phiêu lưu mạo hiểm', icon: '🗺', d: 'Săn quái, vào hang, đi xa. Nghề ưu tiên: mạo hiểm giả, thợ săn.', trait: { bold: .3 }, focus: { hunt: 3, adventure: 3, train: 2 }, works: ['adventurer', 'hunter'], schools: ['combat', 'ranged', 'shadow'],
      dream: 'những con đường chưa ai đi', side: 'tập phóng lao sau chuồng bò', sign: 'Ở quán rượu có người kể về một đoàn mạo hiểm đang tuyển thêm người.' },
    martial:   { nameVi: 'Tu luyện võ đạo', icon: '⚔', d: 'Luyện tập là chính, mạnh lên là mục đích. Nghề ưu tiên: lính canh, thợ săn.', trait: { bold: .2, studious: .1 }, focus: { train: 5, hunt: 1 }, works: ['guard', 'hunter', 'adventurer'], schools: ['martial', 'combat'],
      dream: 'trở thành người mạnh nhất vùng', side: 'đứng tấn dưới gốc cây', sign: 'Người ta đồn trên núi sau làng có một cao nhân ẩn cư.' },
    scholar:   { nameVi: 'Học vấn', icon: '📜', d: 'Đọc sách, vào học viện, làm học giả hay thầy thuốc.', trait: { studious: .3, bold: -.1 }, focus: { study: 5 }, works: ['scholar', 'healer'], schools: ['arcane', 'craft'],
      dream: 'những cuốn sách ở thành phố', side: 'đọc sách dưới đèn dầu', sign: 'Có tin một thư viện của dòng tu mở cửa cho người ngoài.' },
    wealth:    { nameVi: 'Làm giàu', icon: '💰', d: 'Buôn bán, làm thợ, góp vốn. Nghề ưu tiên: thương nhân, thợ rèn.', trait: { social: .15, studious: .1 }, focus: { work: 5 }, works: ['merchant', 'smith', 'miner'], schools: ['craft'],
      dream: 'một cửa hàng của riêng mình', side: 'buôn vặt ở chợ phiên', sign: 'Một thương nhân quen đang tìm người góp vốn.' },
    faith:     { nameVi: 'Tu hành', icon: '🕯', d: 'Cầu nguyện, hành hương, làm tu sĩ.', trait: { pious: .35 }, focus: { faith: 5 }, works: ['priest', 'healer'], schools: ['martial', 'death'],
      dream: 'tiếng chuông trong đền lớn', side: 'tụng kinh tới khuya', sign: 'Một đoàn hành hương dừng chân ở đầu làng.' },
    power:     { nameVi: 'Quyền thế', icon: '🏛', d: 'Kết giao, làm quan, giữ chức, lên tước.', trait: { social: .25, bold: .1 }, focus: { govern: 5, work: 1, family: 1 }, works: ['guard', 'merchant', 'scholar'], schools: ['combat'],
      dream: 'một chỗ ngồi trong phủ lãnh chúa', side: 'chạy việc cho trưởng làng', sign: 'Phủ lãnh chúa sắp mở tiệc, người có chút tiếng tăm đều được mời.' },
    family:    { nameVi: 'Gia đình êm ấm', icon: '🏠', d: 'Lấy vợ lấy chồng, nuôi con, sống yên ổn.', trait: { social: .25, bold: -.2 }, focus: { family: 4, work: 2, rest: 1 }, works: [], schools: [],
      sign: 'Bà mối trong làng ghé chơi lâu hơn thường lệ.' }
  };
  G.setAim = function (S, k) { S.aim = G.AIMS[k] ? k : 'free'; G.syncTraits(S); };
  // Sinh kế ưu tiên: nghề đã định khi rời nhà / nghe lời (flags.workPref) rồi nghề của chí hướng.
  G.aimWorks = S => [...new Set([...(S.flags.workPref ? [S.flags.workPref] : []), ...((G.AIMS[S.aim] || G.AIMS.free).works)])];
  // Trường phái ưu tiên khi chọn hướng lúc nhỏ (quyết định path): thiên phú rèn mạnh nhất (≥ ×1,3), rồi chí hướng; không có thì null.
  G.aimSchool = function (S, keys) {
    const F = G.tfx(S), w = {};
    for (const [k, v] of Object.entries(F.school)) w[k] = Math.max(w[k] || 1, v);
    for (const [m, v] of Object.entries(F.m)) { const k = G.MASTERY[m]; w[k] = Math.max(w[k] || 1, v); }
    const best = keys.filter(k => (w[k] || 1) >= 1.3).sort((a, b) => w[b] - w[a])[0];
    if (best) return best;
    return (G.AIMS[S.aim] || G.AIMS.free).schools.find(k => keys.includes(k)) || null;
  };
  // Điểm hợp chí hướng (tính cách gốc + thiên phú + xuất thân): gợi ý ở aim_pick, chế độ tự động bốc theo.
  function aimScores(S) {
    const B = S.traitsBase || S.traits, F = G.tfx(S), rk = S.tal ? G.RANK[S.tal.root] : 0;
    const sch = s => (F.school[s] || 1) - 1, mm = ms => ms.reduce((a, m) => a + ((F.m[m] || 1) - 1), 0);
    return {
      adventure: B.bold * 2.6 + sch('combat') + sch('ranged') + sch('shadow') + mm(['Sword', 'Bow', 'Axe']) + F.pow * 3,
      martial: B.bold * 1.2 + B.studious * .8 + rk * .4 + sch('martial') + (F.rate - 1) * 2,
      scholar: B.studious * 2.6 + (F.learn - 1) * 3 + sch('arcane') + (S.q >= 3 ? .4 : 0),
      wealth: B.social * .9 + B.studious * .5 + (S.q >= 3 ? .8 : 0) + (F.inc - 1) * 8 + sch('craft'),
      faith: (S.faith ? B.pious * 2.6 : B.pious * .6) + (F.dev - 1) * 2,
      power: B.social * 1.2 + (S.q >= 4 ? 1.2 : 0) + (S.flags.royal || S.flags.house ? 2 : 0) + F.tgt.so / 8,
      family: B.social * 1.4 + (1 - B.bold) * 1.1
    };
  }

  // ═════════ Quyết định ═════════
  // ── Chí hướng tuổi thiếu niên (người chơi đã tự đặt ở ô Chí hướng thì thôi)
  DEC.aim_pick = {
    prio: 8, gap: 99,
    when: (S, X) => !S.undead && !S.flags.aimSet && X.stage(S) === 'teen',
    build(S, X) {
      const sc = aimScores(S), keys = Object.keys(G.AIMS).filter(k => k !== 'free').sort((a, b) => sc[b] - sc[a]).slice(0, 4);
      return { title: 'Chí hướng', body: `Bạn ${X.years(S)} tuổi. ${G.talText(S)} Đêm nằm nhìn mái nhà, bạn nghĩ về đời mình.`,
        fact: 'Chí hướng đổi được lúc nào cũng được ở ô Chí hướng dưới phần focus. Khi bật Tự sống, nhân vật đi theo chí hướng.',
        choices: [...keys.map(k => ({ k, label: `${G.AIMS[k].icon} ${G.AIMS[k].nameVi}`, sub: G.AIMS[k].d })), { k: 'free', label: '🍃 Chưa biết', sub: 'Sống theo tính cách, để đời tự dẫn.' }] };
    },
    apply(S, X, k) { G.setAim(S, k); S.flags.aimSet = true; return k === 'free' ? 'Bạn chưa muốn nghĩ xa.' : `Bạn quyết chí: ${G.AIMS[k].nameVi.toLowerCase()}.`; },
    auto(S, X, d) { const sc = aimScores(S); return X.wpick(d.choices, c => c.k === 'free' ? 1.6 : Math.max(.05, sc[c.k])).k; }
  };

  // ── Nối nghiệp nhà: nhà nghèo ở quê muốn con ở lại làm đất; chí hướng khác thì phải chọn
  const LAND = ['farmer', 'herder', 'fisher', 'woodcutter', 'miner'];
  const DEFY = ['adventure', 'martial', 'scholar', 'faith', 'wealth', 'power'];
  const rural = S => !S.urban || ['village', 'hamlet'].includes((G.here(S).s || {}).tier);
  const familyTrade = S => LAND.find(id => G.workOK(S, id)) || 'farmer';
  DEC.aim_defy = {
    prio: 7, gap: 99,
    when: (S, X) => !S.undead && !S.flags.defied && !S.work && DEFY.includes(S.aim) && ['teen', 'adult'].includes(X.stage(S)) && S.q <= 2 && rural(S) && S.family.parents.some(p => p.alive),
    build(S, X) {
      const A = G.AIMS[S.aim], p = S.family.parents.find(p => p.alive), go = A.works.find(id => G.workOK(S, id)) || A.works[0];
      return { title: 'Nối nghiệp nhà', body: `${cap(p.role)} bạn muốn bạn ở lại làm ${G.WORKS[familyTrade(S)].nameVi.toLowerCase()} như cả nhà. Bạn thì chỉ nghĩ tới ${A.dream}.`,
        choices: [
          { k: 'stay', label: 'Nghe lời', sub: `Ở lại làm ${G.WORKS[familyTrade(S)].nameVi.toLowerCase()}. Gia đình vui; chí hướng để sau, lúc nào cũng có thể đổi nghề.` },
          { k: 'both', label: 'Vừa làm vừa tập', sub: `Ngày phụ nhà, tối ${A.side}. Năm nào cũng tiến một chút, hơi mệt.` },
          { k: 'leave', label: 'Khăn gói ra đi', sub: `Bỏ nghề nhà. Cha mẹ giận; nghề đầu tiên sẽ là ${G.WORKS[go].nameVi.toLowerCase()}.` }] };
    },
    apply(S, X, k) {
      S.flags.defied = k; cnt(S, 'defy_' + k);
      const p = S.family.parents.find(p => p.alive);
      if (k === 'stay') { X.add('so', 5); X.add('h', -6); S.flags.workPref = familyTrade(S); return 'Bạn treo ước mơ lên xà nhà.'; }
      if (k === 'both') { X.add('h', 3); return 'Đèn trong nhà kho sáng tới khuya.'; }
      X.add('so', -10); X.add('h', 6); X.money(X.int(3, 15));
      S.flags.workPref = G.AIMS[S.aim].works.find(id => G.workOK(S, id)) || G.AIMS[S.aim].works[0];   // ở đây chưa làm được thì chờ tới chỗ làm được
      return `${p ? cap(p.role) + ' bạn không ra tiễn' : 'Không ai ra tiễn'}. Bạn đi với mấy đồng bạc dắt lưng.`;
    },
    auto: S => { const T = S.traits; return T.bold > .78 ? 'leave' : T.studious > .55 || T.bold > .5 ? 'both' : 'stay'; }
  };

  // ── Đổi nghề: nghề đang làm lệch chí hướng (hoặc chán nghề, tâm trạng dưới 30) thì có lúc nghĩ lại
  const aimOnly = S => (G.AIMS[S.aim] || G.AIMS.free).works;
  function jobOpts(S) {
    const ok = id => id !== S.work && G.workOK(S, id) && (!G.workFee(S, id) || S.gold >= G.workFee(S, id));
    const aw = aimOnly(S);   // không tính nghề nhà đã nhận khi "Nghe lời": đổi nghề lúc nào cũng mở
    if (S.aim && S.aim !== 'free' && aw.length) return aw.includes(S.work) ? [] : aw.filter(ok);   // đang đúng nghề của chí hướng thì không nghĩ lại
    if (S.h < 30) return Object.keys(G.WORKS).filter(ok);
    return [];
  }
  DEC.aim_job = {
    prio: 5, gap: 3,
    when: (S, X) => !S.undead && !!S.work && X.stage(S) === 'adult' && !S.flags.retired && jobOpts(S).length > 0,
    build(S, X) {
      const aw = aimOnly(S), all = jobOpts(S), mine = all.filter(id => aw.includes(id)), rest = all.filter(id => !aw.includes(id)).sort(() => X.rnd() - .5);
      const opts = [...mine, ...rest].slice(0, 3), A = G.AIMS[S.aim], cur = G.WORKS[S.work].nameVi.toLowerCase(), reg = X.reg(S);
      return { title: 'Đổi nghề?', body: mine.length ? `Làm ${cur} đã lâu, mà bạn vẫn nghĩ tới ${A.dream || A.nameVi.toLowerCase()}.` : `Bạn chán nghề ${cur}. Ngày nào cũng như ngày nào.`,
        choices: [...opts.map(id => { const w = G.WORKS[id], fee = G.workFee(S, id), m = G.incomeMult({ ...S, work: id });
          return { k: id, label: w.nameVi, sub: w.adventurer ? 'Ghi tên Hội Mạo Hiểm; sống bằng săn quái và tiền thưởng, thu nhập theo danh vọng.' : `Thu nhập ${Math.round(G.incomeAt(reg, w.pct[0]) * m)}–${G.coin(Math.round(G.incomeAt(reg, w.pct[1]) * m))}/năm; năm đầu học việc, lương thấp` + (fee ? ` · phí phường hội ${G.coin(fee)}` : '') }; }),
          { k: 'keep', label: `Giữ nghề ${cur}`, sub: '' }] };
    },
    apply(S, X, k) {
      if (k === 'keep') { cnt(S, 'keptWork'); return null; }
      const old = G.WORKS[S.work].nameVi.toLowerCase(), w = G.WORKS[k], fee = G.workFee(S, k);
      if (fee) X.money(-fee);
      S.work = k; if (!w.adventurer) S.pct = Math.max(S.pct * .6, w.pct[0]);
      cnt(S, 'workSwitch'); if (w.adventurer) cnt(S, 'toAdv'); X.add('h', 6); S.flags.workPref = null;
      return w.adventurer ? `Bạn bỏ nghề ${old}, ghi tên vào Hội Mạo Hiểm.` : `Bạn bỏ nghề ${old}, bắt đầu học việc ${w.nameVi.toLowerCase()}.`;
    },
    auto(S, X, d) {
      const T = S.traits, aw = aimOnly(S), c = d.choices.find(c => aw.includes(c.k));
      if (c) return X.chance(.3 + T.bold * .35 + (S.h < 40 ? .2 : 0) - (S.flags.keptWork || 0) * .08) ? c.k : 'keep';
      return S.h < 30 && X.chance(.3) ? d.choices[0].k : 'keep';
    }
  };

  // ── Cơ hội theo chí hướng: sự kiện aim_sign gieo cờ, quyết định aim_chance mở năm sau
  const CHANCE = {
    adventure(S, X) {
      const z = S.zoneSel && G.ZONE[S.zoneSel] ? G.ZONE[S.zoneSel].zone : null;
      return { title: 'Đoàn mạo hiểm thiếu người', body: `Một đoàn bốn người ở ${homeName(S, X)} cần thêm một tay cho chuyến đi${z ? ' vào ' + z.nameVi : ''}. Sức bạn ${X.power(S).toFixed(1)} Tier.`,
        choices: [...(z && X.stage(S) !== 'child' ? [{ k: 'go', label: 'Đi cùng đoàn', sub: 'Hai trận phiêu lưu; có đồng đội gánh bớt (sức +0,3 Tier trong chuyến). Chia chiến lợi phẩm.' }] : []),
          { k: 'porter', label: 'Làm khuân vác cho đoàn', sub: 'An toàn; học lỏm được ít nhiều, có chút tiền công.' }, { k: 'no', label: 'Thôi', sub: '' }] };
    },
    // Cao nhân chỉ nhận một lần; đã được dạy thì về sau là lên thăm sư phụ, chỉ điểm thêm ít nhiều.
    martial: (S, X) => S.flags.hermit ? { title: 'Thư trên núi', body: 'Sư phụ trên núi nhắn bạn lên chơi.', choices: [{ k: 'visit', label: 'Lên thăm', sub: 'Được chỉ điểm thêm vài đường.' }, { k: 'no', label: 'Bận, hẹn dịp khác', sub: '' }] } : ({ title: 'Cao nhân ẩn cư', body: 'Trên núi sau làng có một người tập võ một mình. Người ta bảo ông không nhận ai.',
      choices: [{ k: 'kneel', label: 'Quỳ trước cửa ba ngày', sub: `Không tốn bạc; khoảng ${Math.round(kneelP(S) * 100)}% được nhận. Không được thì ốm một trận.` },
        ...(S.gold >= gift(S, X) ? [{ k: 'pay', label: `Mang lễ vật xin học (${G.coin(gift(S, X))})`, sub: '60% được nhận.' }] : []), { k: 'no', label: 'Thôi', sub: '' }] }),
    scholar: (S, X) => ({ title: 'Thư viện cũ', body: 'Thư viện của một dòng tu cho người ngoài vào đọc, mỗi mùa thu một ít bạc.',
      choices: [...(S.gold >= fee(S, X, .4) ? [{ k: 'read', label: `Mua thẻ đọc (${G.coin(fee(S, X, .4))})`, sub: 'Hiểu biết tăng mạnh, rèn Huyền thuật, Luyện kim.' }] : []),
        { k: 'copy', label: 'Chép sách thuê', sub: 'Có tiền công, đọc được ít nhiều.' }, { k: 'no', label: 'Thôi', sub: '' }] }),
    wealth(S, X) {
      const big = Math.round(Math.min(S.gold * .5, G.median(X.reg(S)) * 2)), small = Math.round(Math.min(S.gold * .2, G.median(X.reg(S)) * .6));
      return { title: 'Mối hàng', body: `Một thương nhân rủ bạn góp vốn chở một chuyến hàng. Ước chừng ${Math.round(tradeP(S) * 100)}% có lãi.`,
        choices: [...(big >= 10 ? [{ k: 'big', label: `Góp lớn (${G.coin(big)})`, sub: 'Lãi thì được 120%, lỗ thì mất trắng.', v: big }] : []), ...(small >= 5 ? [{ k: 'small', label: `Góp nhỏ (${G.coin(small)})`, sub: 'Lãi 80%, lỗ mất trắng.', v: small }] : []),
          { k: 'help', label: 'Đi theo làm phụ', sub: 'Không góp vốn; có tiền công và học cách buôn.' }, { k: 'no', label: 'Thôi', sub: '' }] };
    },
    faith: (S, X) => ({ title: 'Hành hương', body: `Đoàn hành hương${S.faith ? ' ' + window.JobLibrary.faiths[S.faith].nameVi : ''} rủ bạn đi cùng tới đền lớn.`,
      choices: [{ k: 'go', label: 'Đi cùng đoàn', sub: 'Devotion tăng mạnh, lòng nhẹ đi; đường xa có thể ốm.' }, ...(S.gold >= fee(S, X, .2) ? [{ k: 'give', label: `Gửi lễ (${G.coin(fee(S, X, .2))})`, sub: 'Devotion tăng ít, được người trong đạo quý.' }] : []), { k: 'no', label: 'Thôi', sub: '' }] }),
    power: (S, X) => ({ title: 'Yến tiệc quyền quý', body: `Một chức sắc ở ${homeName(S, X)} mở tiệc. Ai có chút tiếng tăm đều được mời.`,
      choices: [...(S.gold >= gift(S, X) ? [{ k: 'gift', label: `Mang lễ (${G.coin(gift(S, X))})`, sub: 'Quan hệ, danh vọng tăng; được ghi công với nước.' }] : []),
        { k: 'ask', label: 'Xin một chân việc', sub: `Khoảng ${Math.round(askP(S) * 100)}% được nhận; không thì bẽ mặt.` }, { k: 'no', label: 'Thôi', sub: '' }] }),
    family(S, X) {
      const single = X.stage(S) === 'adult' && !(S.family.spouse && S.family.spouse.alive) && !S.flags.suitor && !S.undead && !G.RACES[S.race].construct;
      return single ? { title: 'Bà mối', body: 'Bà mối trong làng nhắc tới một người hiền lành, chăm chỉ.', choices: [{ k: 'meet', label: 'Nhờ bà mối dắt mối', sub: 'Có người tìm hiểu; quyết định cưới hay không sau.' }, { k: 'no', label: 'Thôi', sub: '' }] }
        : { title: 'Sum họp', body: 'Cả nhà định tụ về một bữa cơm cuối năm.', choices: [{ k: 'home', label: 'Về sum họp', sub: 'Tâm trạng, quan hệ tăng; tốn chút tiền quà.' }, { k: 'no', label: 'Bận, không về', sub: '' }] };
    }
  };
  G.AIM_CHANCE = CHANCE;   // trang Duyệt Nội Dung trích câu chữ từ đây
  const fee = (S, X, k) => Math.max(3, Math.round(G.median(X.reg(S)) * k));
  const gift = (S, X) => fee(S, X, .7);
  const kneelP = S => G.clamp(.3 + S.traits.bold * .15 + S.traits.studious * .1 + (S.tal ? G.RANK[S.tal.root] : 0) * .06, .1, .8);
  const tradeP = S => G.clamp(.42 + S.sm / 400 + S.so / 500 + (G.tfx(S).inc - 1) * 1.5, .25, .8);
  const askP = S => G.clamp(.2 + S.traits.social * .25 + S.fame / 200 + S.q * .03, .1, .8);
  // Được cao nhân nhận: một mùa luyện tập ròng (trainYear như cả năm Luyện tập) cộng rèn trường phái đang đi.
  function hermit(S, X) {
    X.trainYear(.9);
    const j = X.job(S), sc = j && j.tier > 0 ? j.school : (S.path || 'martial');
    for (const m of window.JobLibrary.schools[sc].masteries) X.gain(m, 2.5);
    cnt(S, 'hermit');
    return 'Ông cho bạn ở lại một mùa. Bạn xuống núi khác hẳn lúc lên.';
  }
  DEC.aim_chance = {
    prio: 6, gap: 1,
    when: (S, X) => !!S.flags.aimQ && S.flags.aimQ === S.aim && !!CHANCE[S.aim] && X.stage(S) !== 'infant',
    build(S, X) { return CHANCE[S.aim](S, X); },
    apply(S, X, k, c) {
      S.flags.aimQ = null; if (k === 'no') return null;
      cnt(S, 'aimChance');
      const reg = X.reg(S), med = G.median(reg);
      switch (k) {
        case 'go': if (S.aim === 'faith') {
            S.devotion = Math.min(100, S.devotion + 12 * G.tfx(S).dev); X.add('h', 6); X.add('hl', -X.int(0, 8));
            if (X.chance(.06) && !S.undead) X.cond('fever');
            return 'Bạn đi bộ ba tuần, ngủ dưới mái hiên đền. Về tới nhà, lòng nhẹ hẳn.';
          } else {
            S.flags.boost = .3; let won = 0;
            for (let i = 0; i < 2 && !S.dead; i++) { const r = X.hunt(true); if (r && r.win) won++; }
            S.flags.boost = 0; if (S.dead) return null;
            S.fame = Math.min(100, S.fame + won); X.add('so', 3);
            return won === 2 ? 'Chuyến đi trót lọt. Đoàn mời bạn lần sau đi tiếp.' : won ? 'Một thắng một thua; cả đoàn về đủ người.' : 'Chuyến đi hỏng. Cả đoàn lếch thếch quay về.';
          }
        case 'porter': X.addXp(60); X.gain('Body', 2); X.money(X.int(5, 15)); return 'Bạn vác đồ cả tháng, nghe hết chuyện của dân mạo hiểm.';
        case 'kneel': if (X.chance(kneelP(S))) return hermit(S, X); X.add('hl', -8); X.add('h', -4); return 'Cửa không mở. Bạn xuống núi với hai đầu gối sưng.';
        case 'pay': X.money(-gift(S, X)); if (X.chance(.6)) return hermit(S, X); return 'Ông nhận lễ, uống một chén trà rồi tiễn bạn về.';
        case 'visit': X.trainYear(.35); X.add('h', 4); return 'Sư phụ xem bạn đánh một bài, sửa đúng hai chỗ.';
        case 'read': X.money(-fee(S, X, .4)); X.add('sm', 6 * G.tfx(S).learn); X.gain('Arcane', 3); X.gain('Alchemy', 2); X.addXp(30); return 'Bạn đọc hết một kệ sách trong một mùa.';
        case 'copy': X.money(Math.round(med * .12)); X.add('sm', 3 * G.tfx(S).learn); return 'Chép sách mỏi tay, nhưng chữ nào cũng đọng lại một ít.';
        case 'big': case 'small': {
          const v = c.v || 0; X.money(-v);
          if (X.chance(tradeP(S))) { const g = Math.round(v * (k === 'big' ? 2.2 : 1.8)); X.money(g); X.add('h', 5); cnt(S, 'tradeWin'); return `Chuyến hàng về đủ. Bạn nhận ${G.coin(g)}.`; }
          X.add('h', -6); return 'Hàng bị cướp giữa đường. Bạn mất trắng phần góp.'; }
        case 'help': X.money(Math.round(med * .1)); X.add('so', 3); X.add('sm', 1); return 'Bạn học được cách mặc cả và cách nhìn người.';
        case 'give': X.money(-fee(S, X, .2)); S.devotion = Math.min(100, S.devotion + 5 * G.tfx(S).dev); X.add('so', 3); return 'Tên bạn được đọc trong buổi lễ.';
        case 'gift': X.money(-gift(S, X)); X.add('so', 6); S.fame = Math.min(100, S.fame + 3); if (G.addMerit && S.nation != null) G.addMerit(S, S.nation, 3); return 'Chủ tiệc nhớ mặt bạn.';
        case 'ask': if (X.chance(askP(S))) { X.money(Math.round(med * .3)); S.fame = Math.min(100, S.fame + 3); X.add('so', 4); cnt(S, 'askWin'); return 'Bạn được giao chạy việc cho phủ. Việc nhỏ, nhưng là một bước.'; }
          X.add('h', -4); return 'Người ta cười. Bạn ra về sớm.';
        case 'meet': { const race = S.race; S.flags.suitor = { name: X.name(race, X.chance(.5) ? 'm' : 'f'), race, work: G.WORKS[X.pick(['farmer', 'smith', 'healer', 'merchant', 'herder'])].nameVi.toLowerCase(), age: X.years(S) + X.int(-3, 3) };
          return `Bà mối dắt ${S.flags.suitor.name} tới chơi.`; }
        case 'home': X.money(-Math.round(med * .08)); X.add('h', 8); X.add('so', 6); return 'Cả nhà ngồi tới khuya.';
      }
      return null;
    },
    auto(S, X, d) {
      const T = S.traits, has = k => d.choices.some(c => c.k === k);
      if (has('go')) return S.aim === 'faith' ? (S.hl > 50 ? 'go' : has('give') ? 'give' : 'no') : (S.hl > 55 && T.bold > .45 ? 'go' : 'porter');
      if (has('porter')) return 'porter';
      if (has('visit')) return 'visit';
      if (has('kneel')) return has('pay') && S.gold > gift(S, X) * 2 ? 'pay' : T.bold > .4 ? 'kneel' : 'no';
      if (has('copy')) return has('read') && S.gold > fee(S, X, .4) * 2 ? 'read' : 'copy';
      if (has('help')) return has('big') && T.bold > .55 && tradeP(S) > .5 ? 'big' : has('small') ? 'small' : 'help';
      if (has('ask')) return has('gift') && S.gold > gift(S, X) * 2 ? 'gift' : T.social > .45 ? 'ask' : 'no';
      if (has('meet')) return T.social > .2 ? 'meet' : 'no';
      return d.choices[0].k;
    }
  };
  G.EVENTS.push({ id: 'aim_sign', st: ['child', 'teen', 'adult', 'elder'], c: S => !S.undead && !!S.aim && S.aim !== 'free' && !S.flags.aimQ, w: 1.5, rep: true, gap: 5,
    run(S, X) { S.flags.aimQ = S.aim; return { t: G.AIMS[S.aim].sign, k: 'info' }; } });

  // ── Thiên phú thức tỉnh: chọn 1 trong 3 (bậc nghiêng lên so với lúc sinh)
  DEC.tal_awaken = {
    prio: 9, gap: 1,
    when: S => !!S.flags.awakenQ && !!S.tal,
    build(S, X) {
      const offers = [];
      for (let i = 0; i < 3; i++) { const id = pickTalent(X, S, rollRank(X, .45), offers); if (id) offers.push(id); }
      if (!offers.length) { S.flags.awakenQ = null; return null; }
      return { title: 'Thiên phú thức tỉnh', body: `${S.flags.awakenQ} Có thứ gì đó trong bạn đang mở ra. Chỉ giữ được một.`,
        choices: offers.map(id => { const t = G.TALENTS[id]; return { k: id, label: `${t.nameVi} · ${G.rarityOf(id).nameVi}`, sub: `${t.d} ${cap(G.fxText(t.fx))}.` }; }) };
    },
    apply(S, X, k) {
      S.flags.awakenQ = null; G.addTalent(S, X, k); cnt(S, 'talAwaken');
      return `Thiên phú ${G.TALENTS[k].nameVi} (${G.rarityOf(k).nameVi}) thức tỉnh.`;
    },
    auto(S, X, d) {
      const sc = id => { const t = G.TALENTS[id], A = G.AIMS[S.aim] || G.AIMS.free; return t.r * 10 + (schoolsOf(t).some(s => A.schools.includes(s)) ? 4 : 0) + (t.fx.rate ? 2 : 0); };
      return d.choices.slice().sort((a, b) => sc(b.k) - sc(a.k))[0].k;
    }
  };

  // ── Bình cảnh: vào mỗi Tier nghề (1 → 5, js/cult.js G.tierOf) thì có cơ hội tẩy tủy, nâng căn cốt một bậc. Khóa cờ giữ số cũ 10 × Tier để bản lưu cũ không bị hỏi lại.
  const BREAKS = [10, 20, 30, 40, 50];
  const nextBreak = S => BREAKS.find(L => G.tierOf(S) * 10 >= L && !(S.flags.brk || {})[L]);
  const elixir = (S, X) => Math.round(G.median(X.reg(S)) * 1.5 * (1 + G.RANK[S.tal.root]));
  const pElixir = S => .62 - G.RANK[S.tal.root] * .09;
  const pSeclude = S => G.clamp(.3 - G.RANK[S.tal.root] * .05 + S.traits.studious * .1, .05, .5);
  DEC.tal_break = {
    prio: 7, gap: 1,
    when: (S, X) => !!S.tal && G.RANK[S.tal.root] < 5 && ['teen', 'adult', 'elder'].includes(X.stage(S)) && nextBreak(S) != null,
    build(S, X) {
      const L = nextBreak(S), rk = G.RANK[S.tal.root], c = elixir(S, X);
      return { title: `Bình cảnh Tier ${L / 10}`, body: `Lên tới Tier ${G.tierOf(S)}, bạn thấy mình chững lại. ${G.rootText(S)}, tu luyện ×${num(G.RARITY[rk].rate)}. Người ta nói tẩy tủy được thì căn cốt lên ${G.RARITY[rk + 1].nameVi} (×${num(G.RARITY[rk + 1].rate)}).`,
        choices: [...(S.gold >= c ? [{ k: 'elixir', label: `Mua thuốc tẩy tủy (${G.coin(c)})`, sub: `${Math.round(pElixir(S) * 100)}% thành công.` }] : []),
          { k: 'seclude', label: 'Bế quan tự ngộ', sub: `${Math.round(pSeclude(S) * 100)}% thành công; hỏng thì tổn thương.` }, { k: 'no', label: 'Thuận theo tự nhiên', sub: 'Không thử lần này.' }] };
    },
    apply(S, X, k) {
      const L = nextBreak(S); (S.flags.brk = S.flags.brk || {})[L] = true;
      if (k === 'no') return null;
      let p;
      if (k === 'elixir') { X.money(-elixir(S, X)); p = pElixir(S); } else p = pSeclude(S);
      if (X.chance(p)) {
        S.tal.root = G.RARITY[G.RANK[S.tal.root] + 1].id; G.talRecalc(S); cnt(S, 'talBreak');
        return `Thành công. ${G.rootText(S)}, tu luyện ×${num(G.RARITY[G.RANK[S.tal.root]].rate)}.`;
      }
      if (k === 'seclude') { X.add('hl', -X.int(8, 18)); if (X.chance(.25)) X.cond(S.undead ? 'crack' : G.RACES[S.race].construct ? 'rust' : 'wound'); return 'Khí huyết đảo lộn. Bạn nôn ra máu rồi nằm liệt nửa tháng.'; }
      return 'Thuốc không ngấm. Tiền mất, người vẫn thế.';
    },
    auto(S, X, d) {
      const T = S.traits;
      if (d.choices.some(c => c.k === 'elixir') && S.gold > elixir(S, X) * 1.4) return 'elixir';
      return S.hl > 55 && (T.bold > .5 || T.studious > .6) ? 'seclude' : 'no';
    }
  };
  // ═════════ Hệ con "talent" (sau career): luyện riêng khi vừa làm vừa tập, gieo thức tỉnh ═════════
  const AWAKE_WHY = ['Một đêm bạn mơ thấy mình đứng trên đỉnh núi không tên.', 'Sét đánh trúng cây trước nhà; bạn đứng ngay dưới.', 'Bạn ngồi tĩnh tọa tới sáng mà không biết.', 'Một lão ăn mày nắm cổ tay bạn, cười rồi bỏ đi.'];
  G.talentYear = function (S, X) {
    if (!S.tal) return;
    const st = X.stage(S), tot = Object.values(S.focusTime).reduce((a, b) => a + b, 0) || 1, A = G.AIMS[S.aim] || G.AIMS.free;
    // Vừa làm vừa tập (aim_defy): mỗi năm tự rèn một ít theo chí hướng khi focus năm đó không dồn vào chí hướng.
    if (S.flags.defied === 'both' && !aimOnly(S).includes(S.work) && ['teen', 'adult'].includes(st)) {
      const aimShare = Object.keys(A.focus).reduce((a, k) => a + (S.focusTime[k] || 0), 0) / tot;
      if (aimShare < .3) {
        if (S.aim === 'adventure' || S.aim === 'martial' || S.aim === 'power') X.trainYear(.15);
        else if (S.aim === 'scholar') { X.add('sm', 1.5 * G.tfx(S).learn); X.gain('Arcane', .8); }
        else if (S.aim === 'faith') S.devotion = Math.min(100, S.devotion + 2 * G.tfx(S).dev);
        else if (S.aim === 'wealth') X.money(Math.round(G.median(X.reg(S)) * .05));
        X.add('hl', -1);
      }
    }
    // Thức tỉnh: nền 1%/lượt, sao chổi lúc sinh +1,5%, thập tử nhất sinh +8%, tu hành / luyện tập nhiều cộng thêm. Tối đa 5 thiên phú.
    if (!S.flags.awakenQ && S.tal.list.length < 5 && st !== 'infant') {
      const near = S.hl < 22, deep = ((S.focusTime.faith || 0) + (S.focusTime.train || 0)) / tot;
      const p = .006 + (S.flags.omen ? .015 : 0) + (near ? .06 : 0) + deep * .01;
      if (X.rnd() < p) {
        S.flags.awakenQ = near ? 'Bạn nằm giữa sống và chết suốt mấy ngày.' : X.pick(AWAKE_WHY);
        X.log(S.flags.awakenQ + ' Tỉnh dậy, bạn thấy người mình khác đi.', 'big');
      }
    }
  };
  { const k = G.SYSTEMS.findIndex(s => s.id === 'career'); G.SYSTEMS.splice(k + 1, 0, { id: 'talent', when: S => !S.dead, run: (S, X) => G.talentYear(S, X) }); }
})(window.LifeSim);
