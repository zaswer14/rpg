/* Vạn Kiếp — KỸ NĂNG, CẤP, CẢNH GIỚI (docs/07 mục 4.1–4.4, bước A của định hướng xã hội tu luyện).
 *
 * Luật cấp của thư viện nghề (platform/docs/06): cấp = số kỹ năng đạt bậc 5. Ở Vạn Kiếp (người dùng chốt 15/10/2026):
 *   - kỹ năng thuộc một Tier, 5 bậc; bản đầu không có tên, mỗi Tier có G.SK_SLOTS chỗ (nghề gốc 6 … Tier 5 là 4);
 *   - cấp = số kỹ năng đã max có Tier ≤ Tier nghề, nhưng chỉ tới hạn mức G.lvCap(Tier nghề) = 2 + 4 × Tier;
 *     kỹ năng max vượt hạn mức chỉ cộng sức (G.CULT.extraPow mỗi cái), không tính cấp;
 *   - chuyển nghề Tier t cần max 2 kỹ năng Tier t − 1 (thay cho ngưỡng cấp cũ), cùng mastery req và thử thách (events.js promote);
 *   - cảnh giới kiểu Bàn Long suy từ cấp: 0–2 chưa nhập cấp, rồi mỗi 2 cấp lên một bậc (cấp 1 … 9), bậc 10 = Thánh Vực
 *     (đủ 21 kỹ năng ở nghề Tier 5 rồi đột phá, quyết định cv_saint); Tier (so với quái, khu) = ⌊(cấp + 1) / 4⌋, tối đa 5.
 * Điểm rèn: mọi chỗ gọi X.addXp (luyện tập, săn, làm nghề, học, sự kiện) × căn cốt, thiên phú (G.cultRate) × ma lực nơi ở,
 * dồn vào kỹ năng theo thứ tự: dưới hạn mức thì kỹ năng Tier thấp nhất còn chỗ; chạm hạn mức thì kỹ năng gate của nghề kế tiếp, rồi kỹ năng thừa.
 * Kỹ năng Tier ≥ 2 cần người dạy (G.teachCap).
 * Thọ nguyên: G.lifeF(S) = 1 + 0,12 × Tier, life.js lt() dựng bảng sống với tuổi thọ × hệ số đó.
 * Trạng thái: S.sk = [[bậc,…] × 6 Tier], S.level (đồng bộ bằng G.skSync), S.flags.saint.
 */
window.LifeSim = window.LifeSim || {};
(function (G) {
  const J = window.JobLibrary;
  G.SK_SLOTS = [6, 6, 6, 6, 5, 4];
  // Điểm rèn để max một kỹ năng (5 bậc) theo Tier. Ước theo kinh nghiệm cũ: vào Tier t mất chừng bằng cấp 10t của thang 1–60 cũ
  // (đi theo thứ tự rèn của G.skTarget: Tier 1 ≈ 2 700 điểm, Tier 2 ≈ 12 600, Tier 3 ≈ 32 000, Tier 4 ≈ 63 000, Tier 5 ≈ 103 000).
  G.SK_COST = [800, 1500, 2800, 4500, 9000, 14000];
  G.CULT = {
    rate: 1,            // nhân chung điểm rèn (núm cân tháp cảnh giới, docs/07 mục 6)
    extraPow: .04,      // sức cộng cho mỗi kỹ năng max không tính cấp
    extraPowMax: .4,
    saintPow: .5,       // Thánh Vực cộng sức
    saintBase: .0005,   // tỉ lệ đột phá Thánh Vực mỗi năm (cộng Hiểu biết, căn cốt, tính chăm; tối đa 0,5%)
    base: 35,           // điểm rèn mỗi năm ai cũng có (luyện ngoài giờ: tu luyện là mục tiêu của số đông, docs/07 mục 0)
    baseMastery: 2,     // mastery rèn kèm mỗi năm ở trường phái đang theo (đủ 10 để vào nghề Tier 1 ở tuổi đôi mươi)
    life: .12           // thọ nguyên × (1 + life × Tier)
  };
  G.lvCap = jt => 2 + 4 * jt;
  G.MAX_LV = G.lvCap(5);
  G.skInit = S => S.sk || (S.sk = G.SK_SLOTS.map(() => []));
  const jobTier = S => { const j = G.jobs && G.jobs.byId[S.job]; return j ? j.tier : 0; };
  G.skMaxed = (S, t) => (G.skInit(S)[t] || []).reduce((a, r) => a + (r >= 5 ? 1 : 0), 0);
  G.skMaxedUpTo = (S, T) => { let n = 0; for (let t = 0; t <= T; t++) n += G.skMaxed(S, t); return n; };
  G.lvOf = S => Math.min(G.lvCap(jobTier(S)), G.skMaxedUpTo(S, jobTier(S)));
  G.skExtra = S => G.skMaxedUpTo(S, 5) - G.lvOf(S);
  // Cảnh giới 0–10 từ cấp; Tier từ cấp (cấp 3–6 → Tier 1, 7–10 → 2 … 19+ → 5).
  G.rankOfLv = (L, saint) => saint ? 10 : L <= 2 ? 0 : Math.min(9, Math.ceil((L - 2) / 2));
  G.rankOf = S => G.rankOfLv(S.level, S.flags && S.flags.saint);
  G.tierOf = L => Math.min(5, Math.floor((L + 1) / 4));
  const CASTER = ['arcane', 'death'];
  G.isCaster = S => { const j = G.jobs && G.jobs.byId[S.job]; return CASTER.includes(j && j.tier > 0 ? j.school : S.path); };
  G.rankName = (r, caster) => r >= 10 ? 'Thánh Vực' : r <= 0 ? (caster ? 'Ma pháp học đồ' : 'Phàm nhân') : `${caster ? 'Ma pháp sư' : 'Chiến sĩ'} cấp ${r}`;
  G.realmName = S => G.rankName(G.rankOf(S), G.isCaster(S));
  // Sức từ cấp: vào Tier t (cấp 4t − 1) thì đúng bằng t, như thang cũ (cấp / 10).
  G.lvPow = S => (S.level + 1) / 4 + Math.min(G.CULT.extraPowMax, G.CULT.extraPow * G.skExtra(S)) + (S.flags && S.flags.saint ? G.CULT.saintPow : 0);
  G.lifeF = S => 1 + G.CULT.life * G.tierOf(S.level || 0);
  // Ma lực nơi ở (vùng đang ở): × (0,7 + 0,6 × magic).
  G.manaMult = S => { const R = G.REGION && G.REGION[S.loc]; return R ? .7 + .6 * R.magic : 1; };

  // ── Người dạy (docs/07 mục 4.2): Tier c cao nhất có người dạy. Học được kỹ năng tới Tier c và được nhận vào nghề tới Tier c
  // (life.js G.nextJobs), nên tự học thì dừng ở nghề Tier 1 (cấp 2). Không có tông môn: học viện, sư phụ, gia tộc, giáo hội, hội.
  // Giáo hội chỉ dạy người trong hàng tu sĩ (sinh kế Tu sĩ hoặc nghề tín ngưỡng), theo Devotion.
  G.teachCap = S => {
    const F = S.flags || {}, r = S.roles || {}, adv = r.adv && G.advRank ? G.advRank(S) : -1, j = G.jobs && G.jobs.byId[S.job];
    const dev = S.faith && (S.work === 'priest' || (j && j.faith)) ? S.devotion : 0;
    const E = S.edu, eLv = E ? Math.max(E.lv || 0, E.cur ? E.cur.lv : 0) : 0, M = S.mentor && S.mentor.kind === 'martial' ? S.mentor : null;
    const nb = r.noble ? r.noble.rank : 0, hs = F.house ? F.house.rank : 0;
    const mt = M ? (M.tier >= 5 ? 5 : Math.max(2, M.tier - 1)) : 0;   // cao thủ Tier t dạy chắc tới Tier t − 1; cao thủ Tier 5 dạy tới cùng
    const track = E && (E.track || (E.cur && E.cur.track));   // Học viện cao cấp ngành Võ bị, Pháp thuật: lò luyện cường giả (kiểu học viện ma pháp của Bàn Long)
    if (F.legacy || F.royal || mt >= 5) return 5;
    if (mt >= 4 || nb >= 3 || hs >= 3 || dev >= 95 || (eLv >= 3 && (track === 'vo' || track === 'phap'))) return 4;
    if (eLv >= 3 || mt >= 3 || nb || hs || dev >= 75) return 3;
    if (eLv >= 2 || mt || adv >= 2 || dev >= 40 || F.soldier > 0 || F.served || (r.orgs && Object.keys(r.orgs).length)) return 2;
    return 1;
  };
  G.TEACH_VI = ['tự học', 'tự học', 'phường hội, quân ngũ, học viện trung cấp, Hiệp Hội từ hạng Bạc', 'học viện cao cấp, sư phụ Tier 4, gia tộc', 'học viện cao cấp ngành Võ bị, Pháp thuật; nhà từ Bá tước', 'hoàng tộc, cao thủ Tier 5, kỳ ngộ'];

  // Kỹ năng đang rèn: { t, i } hoặc null (hết chỗ học được).
  G.skTarget = S => {
    const sk = G.skInit(S), jt = jobTier(S), cap = Math.min(jt, G.teachCap(S));
    const open = t => sk[t].findIndex(r => r < 5) >= 0 || sk[t].length < G.SK_SLOTS[t];
    // Dưới hạn mức cấp: kỹ năng Tier thấp nhất còn chỗ (rẻ nhất, tính cấp ngay).
    // Chạm hạn mức: kỹ năng gate của nghề Tier jt + 1, rồi kỹ năng thừa (chỉ cộng sức).
    if (G.lvOf(S) < G.lvCap(jt)) for (let t = 0; t <= cap; t++) if (open(t)) return t;
    if (jt < 5 && jt <= cap && G.skMaxed(S, jt) < 2 && open(jt)) return jt;
    for (let t = cap; t >= 0; t--) if (open(t)) return t;
    return null;
  };
  // Dồn điểm rèn (đã nhân căn cốt) vào kỹ năng.
  G.skTrain = (X, pts) => {
    const S = X.S, sk = G.skInit(S);
    let left = pts * G.manaMult(S) * G.CULT.rate;
    for (let n = 0; n < 40 && left > 1e-6; n++) {
      const t = G.skTarget(S); if (t == null) break;
      let i = sk[t].findIndex(r => r < 5); if (i < 0) { sk[t].push(0); i = sk[t].length - 1; }
      const per = G.SK_COST[t] / 5, take = Math.min(left / per, 5 - sk[t][i]);
      sk[t][i] = take >= 5 - sk[t][i] - 1e-9 ? 5 : sk[t][i] + take; left -= take * per;
    }
    G.skSync(X);
  };
  // Đồng bộ S.level với kỹ năng và nghề; ghi nhật ký khi lên cấp, lên cảnh giới, chạm Tier mới.
  G.skSync = X => {
    const S = X.S, L0 = S.level || 0, L1 = G.lvOf(S);
    if (L1 === L0) return;
    const r0 = G.rankOfLv(L0, S.flags.saint), t0 = G.tierOf(L0);
    S.level = L1;
    if (L1 < L0) return;
    const r1 = G.rankOf(S), t1 = G.tierOf(L1);
    if (r1 > r0) X.log(`Bạn trở thành ${G.realmName(S)}.` + (t1 > t0 ? ` Sức mạnh chạm Tier ${t1}: những khu nguy hiểm hơn đã mở.` : ''), 'big');
    else X.log(`Thêm một kỹ năng đạt bậc 5. Cấp ${L1}.`, 'good');
  };
  // Thanh tiến độ: bậc của kỹ năng đang rèn.
  G.skProgress = S => {
    const t = G.skTarget(S); if (t == null) return { t: null, r: 0 };
    const sk = G.skInit(S), i = sk[t].findIndex(r => r < 5);
    return { t, r: i < 0 ? 0 : sk[t][i] };
  };
  G.skText = S => {
    const sk = G.skInit(S), jt = jobTier(S);
    const per = sk.map((a, t) => a.length ? `T${t} ${a.filter(r => r >= 5).length}/${a.length}` : null).filter(Boolean).join(' · ') || 'chưa học kỹ năng nào';
    return `Kỹ năng đã max / đã học: ${per}. Hạn mức cấp của nghề Tier ${jt}: ${G.lvCap(jt)}. Kỹ năng thừa (chỉ cộng sức): ${G.skExtra(S)}. Học được tới Tier ${G.teachCap(S)} (${G.TEACH_VI[G.teachCap(S)]}).`;
  };
  // Bản lưu cũ (cấp 1–60 theo kinh nghiệm): quy đổi sang số kỹ năng max, xếp từ Tier thấp lên.
  G.skMigrate = S => {
    if (S.sk) return;
    G.skInit(S);
    const jt = jobTier(S);
    let want = Math.max(2 * jt, Math.min(G.lvCap(jt), Math.round((S.level || 1) / 2.5)));
    for (let t = 0; t < jt; t++) { S.sk[t].push(5, 5); want -= 2; }   // gate của các nghề đã qua
    for (let t = 0; t <= jt && want > 0; t++) while (want > 0 && S.sk[t].length < G.SK_SLOTS[t]) { S.sk[t].push(5); want--; }
    S.level = G.lvOf(S);
  };

  // ── Thánh Vực: đủ 21 kỹ năng tính cấp ở nghề Tier 5, mỗi năm thử cảm ngộ huyền ảo ──
  const DEC = G.DECISIONS;
  const pSaint = S => G.clamp(G.CULT.saintBase + S.sm / 25000 + (S.tal && G.RANK ? G.RANK[S.tal.root] * .001 : 0) + S.traits.studious * .002, .0003, .005);
  DEC.cv_saint = {
    prio: 8, gap: 1,
    when: (S, X) => !S.dead && !S.flags.saint && jobTier(S) >= 5 && S.level >= G.lvCap(5) - 1 && ['adult', 'elder'].includes(X.stage(S)),
    build(S, X) {
      return { title: 'Ngưỡng Thánh Vực', body: `${G.realmName(S)}, ${S.level} kỹ năng đạt bậc 5. Trên nữa không còn là kỹ năng mà là quy tắc: phải tự cảm ngộ một huyền ảo.`,
        choices: [{ k: 'try', label: 'Bế quan cảm ngộ', sub: `Khoảng ${Math.round(pSaint(S) * 100)}% mỗi lần; hỏng thì tổn thương.` }, { k: 'wait', label: 'Chưa phải lúc', sub: '' }] };
    },
    apply(S, X, k) {
      if (k !== 'try') return null;
      if (X.chance(pSaint(S))) {
        S.flags.saint = S.world.year; S.fame = Math.min(100, S.fame + 20);
        if (G.histAdd) G.histAdd(S.world, 'saint', `${S.name} bước vào Thánh Vực.`);
        return 'Bạn thấy được quy tắc. Từ hôm nay bạn là cường giả Thánh Vực.';
      }
      X.add('hl', -X.int(5, 14));
      return 'Huyền ảo vụt qua rồi tan. Bạn ra khỏi chỗ bế quan, gầy rộc.';
    },
    auto: () => 'try'
  };

  // ── Hệ con cuối năm: luyện ngoài giờ. Ai cũng tu (docs/07 mục 0): mỗi năm từ tuổi thiếu niên có điểm rèn nền và chút mastery
  // ở trường phái đang theo; chí hướng Thuận theo tự nhiên, Gia đình luyện ít hơn; người già một nửa.
  G.cultYear = (S, X) => {
    const st = X.stage(S); if (!['teen', 'adult', 'elder'].includes(st)) return;
    const f = (S.aim === 'free' || S.aim === 'family' ? .6 : 1) * (st === 'elder' ? .5 : 1) * (.7 + .3 * (S.traits.bold + S.traits.studious));
    X.addXp(G.CULT.base * f);
    // Mastery: ưu tiên chỗ nghề kế tiếp còn thiếu (như trainYear), không thì một mastery của trường phái đang theo.
    const want = []; for (const e of G.nextJobs(X, true)) for (const [m, v] of Object.entries(e.job.req || {})) if ((S.mastery[m] || 0) < v + 15) want.push(m);
    const j = X.job(S), sc = J.schools[j && j.tier > 0 ? j.school : (S.path || J.races[S.race].schools.native[0])];
    const m = want.length ? X.pick(want) : sc ? X.pick(sc.masteries) : null;
    if (m) X.gain(m, G.CULT.baseMastery * f);
  };
  { const k = G.SYSTEMS.findIndex(s => s.id === 'career'); G.SYSTEMS.splice(k + 1, 0, { id: 'cult', when: S => !S.dead, run: (S, X) => G.cultYear(S, X) }); }
})(window.LifeSim);
