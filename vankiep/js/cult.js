/* Vạn Kiếp — KỸ NĂNG, LEVEL, CHỈ SỐ, NGƯỜI DẠY (docs/08, thay bước A của docs/07 mục 4.1–4.2; bỏ cảnh giới).
 *
 * Người dùng chốt 16/10/2026 (docs/08 mục 11):
 *   - mỗi nghề có G.SK_LIST (12) kỹ năng cùng Tier với nghề: cặp gate của mọi nghề kế tiếp (trường `gate` của thư viện nghề,
 *     null thì id tạm `<nghề đích>#g1/#g2`) rồi bộ kỹ năng chung của trường phái ở Tier đó (`<trường phái>#k`, G.poolSkills) cho đủ;
 *   - học một kỹ năng là có bậc 1; mỗi Tier chỉ G.SK_UP (10) kỹ năng được nâng lên bậc 2–5, còn lại dừng ở bậc 1;
 *   - level = số kỹ năng được nâng đã đạt bậc 5; 10 level là 1 Tier (level 0–60);
 *   - chuyển nghề: đạt max level của Tier (10 × (Tier + 1)) và cặp gate của nghề đích nằm trong 10 kỹ năng được nâng,
 *     cùng mastery req, người dạy theo trường phái, thử thách (life.js G.nextJobs, events.js promote); không có thì kẹt ở Tier đó;
 *   - sức = chỉ số (nền chủng tộc + thưởng kỹ năng, shared/skills.js) + hiệu quả kỹ năng đang lắp + đồ + thiên phú + buff (life.js power);
 *   - lắp kỹ năng: mặc định tự lắp mạnh nhất (S.equip = null), người chơi sửa lúc nào cũng được (S.equip = danh sách);
 *   - Tier nhân vật = Tier nghề (G.tierOf), dùng cho khu, quái, thọ nguyên, địa vị.
 * Trạng thái: S.sk = { '<Tier>:<id>': { r: bậc 0–5 (số thực), m: mastery } }, S.up = { Tier: [khóa] }, S.equip, S.equipN,
 *   S.skBank (điểm rèn giữ lại khi chờ chọn kỹ năng), S.learnAuto = { Tier: true }, S.level (= G.lvOf, đồng bộ bằng G.skSync).
 * Khóa có Tier vì một kỹ năng có tên (vd aimed_shot) có thể là gate ở hai Tier khác nhau: mỗi Tier là một kỹ năng riêng.
 */
window.LifeSim = window.LifeSim || {};
(function (G) {
  const J = window.JobLibrary;
  G.SK_LIST = 12;
  G.SK_UP = 10;
  G.LV_TIER = 10;
  G.MAX_LV = 60;
  G.LOADOUT = [2, 3, 5, 6, 6, 6];   // chỗ lắp theo Tier nghề, như Skeleton Codex (platform/docs/06 luật 9)
  // Điểm rèn để max một kỹ năng (5 bậc) theo Tier; mỗi bậc 1/5 (docs/08 mục 4.3, chốt bằng sim).
  G.SK_COST = [260, 450, 900, 1500, 2200, 3000];
  G.CULT = {
    rate: 1,           // nhân chung điểm rèn (núm cân tháp Tier)
    base: 35,          // điểm rèn mỗi năm ai cũng có (luyện ngoài giờ)
    selfTaught: .4,    // rèn kỹ năng Tier cao hơn người dạy đang có: tự mò
    mPt: .004,         // mastery mỗi điểm rèn dồn vào kỹ năng (theo giá gốc, chưa tính tự mò)
    statPow: .12,      // sức mỗi điểm chỉ số trên nền
    skillPow: .1,      // sức mỗi kỹ năng lắp: × (Tier + 1) × bậc / 5
    life: .12          // thọ nguyên × (1 + life × Tier)
  };

  // ── Chỉ số nhân vật (docs/08 mục 6.1) ──
  G.STATS = ['STR', 'DEX', 'AGI', 'VIT', 'INT', 'WIL'];
  G.STAT_VI = { STR: 'Lực', DEX: 'Khéo', AGI: 'Nhanh', VIT: 'Thể', INT: 'Pháp lực', WIL: 'Tinh thần' };
  G.MASTERY_STAT = {
    Sword: 'STR', Axe: 'STR', Unarmed: 'STR',
    Bow: 'DEX', Crossbow: 'DEX', Firearm: 'DEX', Throwing: 'DEX', Dagger: 'DEX', Trap: 'DEX', Engineering: 'DEX',
    Stealth: 'AGI', Riding: 'AGI',
    Shield: 'VIT', Spear: 'VIT', Body: 'VIT',
    Fire: 'INT', Frost: 'INT', Lightning: 'INT', Arcane: 'INT', Alchemy: 'INT', Construct: 'INT',
    Necromancy: 'WIL', Soul: 'WIL', Curse: 'WIL', Spirit: 'WIL', Taming: 'WIL'
  };
  G.SCHOOL_STAT = { combat: ['STR', 'VIT'], ranged: ['DEX', 'AGI'], shadow: ['AGI', 'DEX'], arcane: ['INT', 'WIL'], death: ['WIL', 'INT'], craft: ['INT', 'DEX'], beast: ['DEX', 'VIT'], martial: ['STR', 'AGI'] };

  const jobOf = id => G.jobs && G.jobs.byId[id];
  const jobTier = S => { const j = jobOf(S.job); return j ? j.tier : 0; };
  const schoolMs = sc => (J.schools[sc] || {}).masteries || [];
  const tierOfKey = k => +k.slice(0, k.indexOf(':'));
  const idOfKey = k => k.slice(k.indexOf(':') + 1);
  // Trường phái đang theo: của nghề (Tier ≥ 1), không thì hướng đi, không thì trường phái bản địa đầu tiên.
  G.schoolOf = S => { const j = jobOf(S.job); return j && j.tier > 0 ? j.school : (S.path || J.races[S.race].schools.native[0]); };
  G.tierOf = S => jobTier(S);
  G.lifeF = S => 1 + G.CULT.life * jobTier(S);
  G.manaMult = S => { const R = G.REGION && G.REGION[S.loc]; return R ? .7 + .6 * R.magic : 1; };

  // ── Danh sách kỹ năng của nghề (docs/08 mục 3.1) ──
  // Nghề kế tiếp vào được (cùng bộ lọc với life.js G.nextJobs, trừ điều kiện).
  G.succOf = (race, jobId, faith) => {
    const acc = G.jobs.access[race], out = [];
    for (const e of G.jobs.edges) {
      if (e.from !== jobId || (e.race && e.race !== race)) continue;
      const j = jobOf(e.to), a = acc[e.to];
      if (!j || j.hidden || !['native', 'foreign', 'faith'].includes(a)) continue;
      if (j.faith && !j.shared && j.faith !== faith) continue;
      if (!out.includes(j)) out.push(j);
    }
    return out;
  };
  G.gatePair = d => d.gate && d.gate.length >= 2 ? d.gate.slice(0, 2) : [d.id + '#g1', d.id + '#g2'];
  const LIST = {};
  G.jobSkills = (race, jobId, faith) => {
    const key = race + '|' + jobId + '|' + (faith || '');
    if (LIST[key]) return LIST[key];
    const j = jobOf(jobId), tier = j ? j.tier : 0, list = [], by = {};
    const add = (id, m, gateFor) => {
      let s = by[id];
      if (!s) { s = by[id] = { key: tier + ':' + id, id, tier, m, job: jobId, gateFor: [] }; list.push(s); }
      if (gateFor) s.gateFor.push(gateFor);
    };
    for (const d of G.succOf(race, jobId, faith)) {
      // Mastery của cặp gate: mục trong req của nghề đích; kỹ năng có tên chứa tên mastery (shield_tap → Shield) thì lấy đúng mục đó.
      const ks = Object.keys(d.req || {}), ms = ks.length ? ks : schoolMs(d.school), [a, b] = G.gatePair(d);
      const fit = id => ms.find(m => id.toLowerCase().includes(m.toLowerCase()));
      let ma = fit(a), mb = fit(b);
      if (!ma) ma = ms.find(m => m !== mb) || ms[0];
      if (!mb) mb = ms.find(m => m !== ma) || ms[0];
      add(a, ma, d.id); add(b, mb, d.id);
    }
    // Chỗ còn lại lấy từ bộ kỹ năng chung của trường phái ở Tier đó (G.poolSkills), ưu tiên kỹ năng gắn mastery nghề này đòi.
    // Mọi nghề cùng trường phái, cùng Tier dùng chung một bộ, nên số kỹ năng cần đặt tên (bước F) ít đi nhiều (docs/08 mục 3.1).
    const sc = j && j.tier > 0 ? j.school : J.races[race].schools.native[0], want = Object.keys((j && j.req) || {});
    const pool = G.poolSkills(sc, tier).slice().sort((a, b) => (want.includes(b.m) - want.includes(a.m)) || a.k - b.k);
    for (const p of pool) { if (list.length >= G.SK_LIST) break; add(p.id, p.m); }
    return LIST[key] = list;
  };
  // Bộ kỹ năng chung của một trường phái ở một Tier: G.SK_LIST kỹ năng `<trường phái>#k`, mastery xoay vòng theo trường phái.
  G.poolSkills = (school, tier) => {
    const ms = schoolMs(school).length ? schoolMs(school) : ['Body'];
    return Array.from({ length: G.SK_LIST }, (_, i) => ({ id: `${school}#${i + 1}`, k: i + 1, m: ms[i % ms.length], tier }));
  };
  G.mySkills = S => G.jobSkills(S.race, S.job, S.faith);
  G.skRewards = (key, m) => (J.skillRewards || {})[idOfKey(key)] || { 5: { [G.MASTERY_STAT[m] || 'VIT']: 1 } };
  // Tên, mô tả (data/skills.js G.SKILL_NAMES, bước F): tra theo khóa đủ (bộ chung `2:combat#3`), rồi theo id (kỹ năng có tên,
  // gate tạm `paladin#g1`). Không có thì tên tạm như trước.
  const nameRec = key => { const N = G.SKILL_NAMES || {}; return N[key] || N[idOfKey(key)] || null; };
  G.skDesc = key => { const r = nameRec(key); return r ? r[1] : ''; };
  G.skName = key => {
    const r = nameRec(key); if (r) return r[0];
    const id = idOfKey(key), h = id.indexOf('#');
    if (h < 0) { const s = id.replace(/_/g, ' '); return s[0].toUpperCase() + s.slice(1); }
    const head = id.slice(0, h), tail = id.slice(h + 1), sc = J.schools[head];
    if (sc) return `${sc.nameVi} T${tierOfKey(key)} · ${tail}`;   // bộ chung của trường phái
    const j = jobOf(head), n = j ? j.nameVi : head;   // gate tạm của nghề đích; bản lưu cũ còn kỹ năng tạm theo nghề
    return tail[0] === 'g' ? `Gate ${tail.slice(1)} vào ${n}` : `Kỹ năng ${tail} của ${n}`;
  };

  // ── Trạng thái ──
  const init = S => { if (!S.sk || Array.isArray(S.sk)) S.sk = {}; if (!S.up) S.up = {}; if (S.equip === undefined) S.equip = null; return S; };
  G.skInit = init;
  const upOf = (S, t) => S.up[t] || (S.up[t] = []);
  G.rankOf = (S, key) => (S.sk[key] ? S.sk[key].r : 0);
  G.lvOf = S => { init(S); let n = 0; for (const t in S.up) for (const k of S.up[t]) if (G.rankOf(S, k) >= 5) n++; return n; };
  G.maxLvOf = S => G.LV_TIER * (jobTier(S) + 1);
  G.lvFull = S => G.lvOf(S) >= G.maxLvOf(S);

  // ── Người dạy (docs/08 mục 5) ──
  const WAR = ['combat', 'ranged', 'martial', 'beast', 'shadow'], MAGE = ['arcane', 'death', 'craft'];
  const OFFICER = { merc: ['combat', 'ranged', 'martial', 'beast'], craft: ['craft'], lore: ['arcane', 'death'], shadow: ['shadow'] };
  G.TEACHERS = [
    { id: 'self', nameVi: 'Tự học', tier: 1, schools: null, cond: 'ai cũng có' },
    { id: 'guild', nameVi: 'Phường hội, đoàn lính đánh thuê, quân ngũ, Hiệp Hội từ hạng Bạc', tier: 2, schools: null, cond: 'là thành viên một hội, từng đi lính' },
    { id: 'edu2', nameVi: 'Học viện trung cấp', tier: 2, schools: null, cond: 'đang học hoặc đã tốt nghiệp' },
    { id: 'edu3', nameVi: 'Học viện cao cấp', tier: 3, schools: null, cond: 'đang học hoặc đã tốt nghiệp' },
    { id: 'vo', nameVi: 'Học viện cao cấp ngành Võ bị', tier: 4, schools: WAR, cond: 'ngành Võ bị' },
    { id: 'phap', nameVi: 'Học viện cao cấp ngành Pháp thuật', tier: 4, schools: MAGE, cond: 'ngành Pháp thuật' },
    { id: 'officer', nameVi: 'Chức trong hội (quản sự, phó đoàn, hội trưởng)', tier: 3, schools: 'theo loại hội: đoàn lính đánh thuê dạy trường phái chiến sĩ; Phường Thợ dạy Chế tác; Hội Học Giả dạy Huyền thuật, Tử thuật; Hội Bóng Đêm dạy Bóng tối', cond: 'giữ chức từ quản sự trở lên' },
    { id: 'office', nameVi: 'Quan chức nhà nước', tier: 3, schools: null, cond: 'làm Quan tỉnh hoặc Đại thần (nhà nước mướn thầy cho người của mình)' },
    { id: 'master', nameVi: 'Sư phụ cao thủ Tier s', tier: 's', schools: 'của sư phụ', cond: 'là đệ tử (cả sau khi xuất sư)' },
    { id: 'noble', nameVi: 'Nhà quý tộc', tier: 3, schools: null, cond: 'sinh ra trong nhà quý tộc hoặc có tước' },
    { id: 'noble3', nameVi: 'Nhà từ Bá tước', tier: 4, schools: null, cond: 'tước hoặc nhà từ Bá tước' },
    { id: 'royal', nameVi: 'Hoàng tộc', tier: 5, schools: null, cond: 'hoàng tộc, dòng chính hoặc dòng phụ' },
    { id: 'faith', nameVi: 'Giáo hội', tier: 'Devotion 40 / 75 / 95 → 2 / 3 / 4', schools: 'nghề tín ngưỡng của giáo phái mình', cond: 'làm Tu sĩ hoặc đang ở nghề tín ngưỡng' }
  ];
  // Các nguồn dạy đang có cho một trường phái (job: nghề muốn vào / đang làm, để xét giáo hội). Trả [{ t, id, nameVi }].
  G.teachList = (S, school, job) => {
    const F = S.flags || {}, r = S.roles || {}, adv = r.adv && G.advRank ? G.advRank(S) : -1, cur = jobOf(S.job);
    const E = S.edu, eLv = E ? Math.max(E.lv || 0, E.cur ? E.cur.lv : 0) : 0, track = E && (E.track || (E.cur && E.cur.track));
    const M = S.mentor && S.mentor.kind === 'martial' ? S.mentor : null, nb = r.noble ? r.noble.rank : 0, hs = F.house ? F.house.rank : 0;
    const T = id => G.TEACHERS.find(x => x.id === id), out = [];
    const push = (t, id, nameVi) => out.push({ t, id, nameVi: nameVi || T(id).nameVi });
    push(1, 'self');
    if (adv >= 2 || F.soldier > 0 || F.served || (r.orgs && Object.keys(r.orgs).length)) push(2, 'guild');
    if (eLv >= 2) push(2, 'edu2');
    if (eLv >= 3) push(3, 'edu3');
    for (const [id, m] of Object.entries(r.orgs || {})) {   // chức từ quản sự trở lên: hội có người dạy giỏi cho người của mình
      const o = m.rank >= 1 && G.orgById ? G.orgById(S.world, id) : null;
      if (o && (OFFICER[o.kind] || []).includes(school)) { push(3, 'officer'); break; }
    }
    if (r.office) push(3, 'office');
    if (eLv >= 3 && track === 'vo' && WAR.includes(school)) push(4, 'vo');
    if (eLv >= 3 && track === 'phap' && MAGE.includes(school)) push(4, 'phap');
    if (M && (!M.school || M.school === school)) push(M.tier, 'master', `Sư phụ ${M.name || ''} (Tier ${M.tier})`.replace('  ', ' '));
    if (nb || hs) push(nb >= 3 || hs >= 3 ? 4 : 3, nb >= 3 || hs >= 3 ? 'noble3' : 'noble');
    if (F.legacy || F.royal) push(5, 'royal');
    const fj = job && job.faith ? job : null, priest = S.work === 'priest' || (cur && cur.faith);
    if (fj && S.faith === fj.faith && priest) { const d = S.devotion || 0; if (d >= 40) push(d >= 95 ? 4 : d >= 75 ? 3 : 2, 'faith'); }
    return out;
  };
  G.teachOf = (S, school, job) => Math.max(...G.teachList(S, school, job).map(x => x.t));
  G.teachBest = (S, school, job) => G.teachList(S, school, job).sort((a, b) => b.t - a.t)[0];
  const teachF = (S, tier) => tier <= 1 || G.teachOf(S, G.schoolOf(S), jobOf(S.job)) >= tier ? 1 : G.CULT.selfTaught;

  // ── Chọn kỹ năng để nâng (docs/08 mục 3.2, 4.1) ──
  // Hướng đi: nghề kế tiếp cùng trường phái với S.path; không có thì nghề có mastery req mình gần đạt nhất.
  G.skDir = S => {
    const nx = G.succOf(S.race, S.job, S.faith); if (!nx.length) return null;
    const near = d => Object.entries(d.req || {}).reduce((a, [m, v]) => a + Math.min(1, (S.mastery[m] || 0) / Math.max(1, v)), 0) / Math.max(1, Object.keys(d.req || {}).length);
    return nx.slice().sort((a, b) => ((b.school === S.path) - (a.school === S.path)) || near(b) - near(a))[0];
  };
  // Nghề kế tiếp còn mở được: số kỹ năng gate chưa nằm trong chỗ nâng ≤ số chỗ còn lại.
  G.skOpenDirs = (S, extra) => {
    const jt = jobTier(S), up = [...upOf(S, jt), ...(extra ? [extra] : [])], left = G.SK_UP - up.length;
    return G.succOf(S.race, S.job, S.faith).filter(d => G.gatePair(d).filter(id => !up.includes(jt + ':' + id)).length <= left);
  };
  G.skCands = S => { const up = upOf(S, jobTier(S)); return G.mySkills(S).filter(s => !up.includes(s.key)); };
  G.skAutoPick = S => {
    const c = G.skCands(S); if (!c.length) return null;
    const dir = G.skDir(S), open = G.skOpenDirs(S).map(d => d.id), [a, b] = G.SCHOOL_STAT[G.schoolOf(S)] || [];
    const score = s => (dir && s.gateFor.includes(dir.id) ? 1000 : 0) + (s.gateFor.some(id => open.includes(id)) ? 100 : 0)
      + Object.values(G.skRewards(s.key, s.m)).reduce((x, m) => x + (m[a] || 0) * 2 + (m[b] || 0) + (m.VIT || 0), 0);
    return c.slice().sort((x, y) => score(y) - score(x))[0];
  };
  const pick = (S, s) => {
    upOf(S, s.tier).push(s.key);
    if (!S.sk[s.key]) S.sk[s.key] = { r: 0, m: s.m };
    S.flags.learnPick = false;
  };
  G.skPick = (S, key) => { const s = G.skCands(S).find(x => x.key === key); if (s) pick(S, s); return !!s; };

  // Kỹ năng đang rèn: { key, cap, s } | { pick: true } | null (hết chỗ, chỉ còn mastery).
  G.skTarget = S => {
    init(S);
    const jt = jobTier(S), up = upOf(S, jt);
    const k = up.find(k => G.rankOf(S, k) < 5); if (k) return { key: k, cap: 5 };
    if (up.length < G.SK_UP && G.skCands(S).length) return { pick: true };
    const s = G.mySkills(S).find(s => !up.includes(s.key) && G.rankOf(S, s.key) < 1);
    return s ? { key: s.key, cap: 1, s } : null;
  };

  // ── Rèn: dồn điểm rèn (đã nhân căn cốt) vào kỹ năng; rèn kỹ năng thì mastery của nó tăng theo ──
  const autoLearn = X => X.headless || (X.S.auto && X.autoDecide) || (X.S.learnAuto || {})[jobTier(X.S)];
  G.skTrain = (X, pts) => {
    const S = init(X.S), C = G.CULT;
    let left = pts * G.manaMult(S) * C.rate + (S.skBank || 0); S.skBank = 0;
    for (let n = 0; n < 60 && left > 1e-6; n++) {
      const t = G.skTarget(S);
      if (t && t.pick) {
        if (autoLearn(X)) { pick(S, G.skAutoPick(S)); continue; }
        S.flags.learnPick = true; S.skBank = Math.min(left, G.SK_COST[jobTier(S)]); break;   // giữ điểm tới khi người chơi chọn (cv_learn)
      }
      if (!t) {   // hết chỗ học: điểm rèn chỉ còn tăng tay nghề theo hướng đi
        const d = G.skDir(S), m = d ? Object.keys(d.req || {})[0] : null, jt = jobTier(S);
        if (m) X.gain(m, left * C.mPt * .5);
        break;
      }
      if (!S.sk[t.key]) S.sk[t.key] = { r: 0, m: t.s.m };
      const sk = S.sk[t.key], tier = tierOfKey(t.key), per = G.SK_COST[tier] / 5 / teachF(S, tier);
      const take = Math.min(left / per, t.cap - sk.r), r0 = sk.r;
      sk.r = take >= t.cap - sk.r - 1e-9 ? t.cap : sk.r + take; left -= take * per;
      X.gain(sk.m, take * G.SK_COST[tier] / 5 * C.mPt);
      if (Math.floor(sk.r) > Math.floor(r0)) onRank(X, t.key, Math.floor(r0), Math.floor(sk.r));
    }
    G.skSync(X);
  };
  const statTxt = m => Object.entries(m).map(([s, n]) => `${G.STAT_VI[s]} +${n}`).join(', ');
  const onRank = (X, key, r0, r1) => {
    const S = X.S, rw = G.skRewards(key, S.sk[key].m), got = {};
    for (let r = r0 + 1; r <= r1; r++) for (const [s, n] of Object.entries(rw[r] || {})) got[s] = (got[s] || 0) + n;
    const up = (S.up[tierOfKey(key)] || []).includes(key);
    if (r1 >= 5 && up) X.log(`${G.skName(key)} đạt bậc 5.${Object.keys(got).length ? ' ' + statTxt(got) + '.' : ''} Level ${G.lvOf(S)}.`, 'good');
    else if (Object.keys(got).length) X.log(`${G.skName(key)} lên bậc ${r1}. ${statTxt(got)}.`, 'good');
  };
  // Đồng bộ S.level; báo một lần khi chạm max level của Tier.
  G.skSync = X => {
    const S = X.S, L = G.lvOf(S), F = S.flags; S.level = L;
    const jt = jobTier(S);
    // Số đo cho sim.html (docs/08 mục 9): sức lúc vào Tier, ở max level; mastery chính của hướng đi so với req lúc max.
    if (F.tierSeen !== jt) { F.tierSeen = jt; (F.powIn = F.powIn || {})[jt] = +X.power(S).toFixed(2); }
    if (L >= G.maxLvOf(S) && F.maxLog !== jt) {
      F.maxLog = jt; (F.powMax = F.powMax || {})[jt] = +X.power(S).toFixed(2);
      { const d = G.skDir(S), e = d && Object.entries(d.req || {})[0]; if (e) (F.mOver = F.mOver || {})[jt] = Math.round((S.mastery[e[0]] || 0) - e[1]); }
      if (jt >= 5) { X.log(`Level ${L}: đỉnh của Tier 5, không còn gì trên nữa.`, 'big'); return; }
      const open = G.succOf(S.race, S.job, S.faith).filter(d => G.gateOk(S, d));
      X.log(open.length ? `Level ${L}, đỉnh của Tier ${jt}. Có thể thử vào ${open.map(d => X.jobName(S, d.id)).join(', ')}.`
        : `Level ${L}, đỉnh của Tier ${jt}. Trong mười kỹ năng đã nâng không có trọn cặp kỹ năng của nghề Tier ${jt + 1} nào: không còn đường lên.`, open.length ? 'big' : 'bad');
    }
  };
  // Cặp gate của nghề đích nằm trong chỗ nâng của Tier hiện tại và đã max.
  G.gateOk = (S, d) => { init(S); const jt = jobTier(S), up = upOf(S, jt); return G.gatePair(d).every(id => up.includes(jt + ':' + id) && G.rankOf(S, jt + ':' + id) >= 5); };
  // Kẹt: max level, có nghề kế tiếp nhưng không có trọn cặp gate nào trong 10 kỹ năng được nâng (nghề cuối đường không tính là kẹt).
  G.stuck = S => { const nx = jobTier(S) < 5 && G.lvFull(S) ? G.succOf(S.race, S.job, S.faith) : []; return nx.length > 0 && !nx.some(d => G.gateOk(S, d)); };

  // ── Chỉ số, lắp kỹ năng, sức (docs/08 mục 6) ──
  G.statsOf = S => {
    init(S);
    const st = {}, tilt = (G.RACES[S.race] || {}).stat || {};
    for (const k of G.STATS) st[k] = 5 + (tilt[k] || 0);
    for (const [key, v] of Object.entries(S.sk)) for (const [r, m] of Object.entries(G.skRewards(key, v.m))) if (v.r >= +r) for (const [s, n] of Object.entries(m)) st[s] += n;
    return st;
  };
  G.statPow = S => { const st = G.statsOf(S), [a, b] = G.SCHOOL_STAT[G.schoolOf(S)] || ['STR', 'VIT']; return ((2 * st[a] + st[b] + st.VIT) / 4 - 5) * G.CULT.statPow; };
  G.slotsOf = S => G.LOADOUT[jobTier(S)];
  G.skEff = (key, r) => G.CULT.skillPow * (tierOfKey(key) + 1) * Math.min(5, Math.floor(r + 1e-9)) / 5;
  const learned = S => Object.keys(init(S).sk).filter(k => S.sk[k].r >= 1 - 1e-9);
  G.autoEquip = S => learned(S).sort((a, b) => G.skEff(b, S.sk[b].r) - G.skEff(a, S.sk[a].r)).slice(0, G.slotsOf(S));
  G.loadout = S => S.equip ? S.equip.filter(k => S.sk[k] && S.sk[k].r >= 1 - 1e-9).slice(0, G.slotsOf(S)) : G.autoEquip(S);
  G.skillPow = S => G.loadout(S).reduce((a, k) => a + G.skEff(k, S.sk[k].r), 0);
  // Người chơi lắp / tháo: chuyển sang tự chọn. Trả false khi hết chỗ.
  G.equipToggle = (S, key) => {
    if (!S.equip) S.equip = G.autoEquip(S);
    const i = S.equip.indexOf(key);
    if (i >= 0) S.equip.splice(i, 1); else if (S.equip.length < G.slotsOf(S)) S.equip.push(key); else return false;
    S.equipN = G.slotsOf(S); return true;
  };
  G.equipReset = S => { S.equip = null; S.equipN = 0; };
  // Tự chọn: chỉ lấp chỗ mới mở (lên Tier), không đổi lựa chọn cũ.
  G.equipFill = S => {
    if (!S.equip) return; const n = G.slotsOf(S); if (n <= (S.equipN || 0)) return;
    for (const k of G.autoEquip(S)) if (S.equip.length < n && !S.equip.includes(k)) S.equip.push(k);
    S.equipN = n;
  };

  // ── Hiện ──
  G.skProgress = S => { const t = G.skTarget(S); return !t || t.pick ? { t, r: 0 } : { t, r: G.rankOf(S, t.key) }; };
  G.skText = S => {
    const jt = jobTier(S), up = upOf(S, jt), tb = G.teachBest(S, G.schoolOf(S), jobOf(S.job));
    return `Level ${G.lvOf(S)} / ${G.maxLvOf(S)}. Nâng ${up.length} / ${G.SK_UP} kỹ năng của Tier ${jt}. Người dạy: ${tb.nameVi} (Tier ${tb.t}).`;
  };

  // ── Bản lưu cũ ──
  // S.v 3 trước bộ kỹ năng chung (16/10/2026): kỹ năng tạm theo nghề `<Tier>:<nghề>#k` đổi sang kỹ năng bộ chung
  // còn trống trong danh sách của chính nghề đó (giữ bậc, chỗ nâng, chỗ lắp).
  const poolMigrate = S => {
    const chain = [...(S.jobHist || []), S.job], ren = {};
    for (const job of chain) {
      const old = Object.keys(S.sk).filter(k => { const id = idOfKey(k), h = id.indexOf('#'); return h > 0 && id.slice(0, h) === job && /^\d+$/.test(id.slice(h + 1)); });
      if (!old.length) continue;
      const free = G.jobSkills(S.race, job, S.faith).filter(s => !S.sk[s.key] && !s.gateFor.length).map(s => s.key);
      old.forEach((k, i) => { if (free[i]) ren[k] = free[i]; });
    }
    if (!Object.keys(ren).length) return;
    for (const [a, b] of Object.entries(ren)) { S.sk[b] = S.sk[a]; delete S.sk[a]; }
    for (const t in S.up) S.up[t] = S.up[t].map(k => ren[k] || k);
    if (S.equip) S.equip = S.equip.map(k => ren[k] || k);
  };
  // S.v 2 trước bước A (S.sk chưa có, level 1–60 theo kinh nghiệm) hoặc bước A (S.sk là 6 mảng, level 0–22):
  // nghề đã qua max đủ 10 kỹ năng (giữ cặp gate của nghề kế trên đường đi), nghề đang làm max theo tỉ lệ tiến độ cũ.
  G.skMigrate = S => {
    if (S.v >= 3 && S.sk && !Array.isArray(S.sk)) { poolMigrate(S); return; }
    const old = S.sk, L = S.level || 0, jt = jobTier(S);
    S.sk = {}; S.up = {}; S.equip = null;
    const f = Array.isArray(old) ? G.clamp((L - (jt ? 2 + 4 * (jt - 1) : 0)) / (jt ? 4 : 2), 0, 1) : G.clamp((L - 10 * jt) / 10, 0, 1);
    const chain = [...S.jobHist, S.job];
    for (let i = 0; i < chain.length; i++) {
      const job = chain[i], j = jobOf(job), t = j ? j.tier : 0, nx = chain[i + 1] ? jobOf(chain[i + 1]) : null;
      const list = G.jobSkills(S.race, job, S.faith), want = nx ? G.gatePair(nx).map(id => t + ':' + id) : [];
      const order = [...list.filter(s => want.includes(s.key)), ...list.filter(s => !want.includes(s.key))];
      const n = nx ? G.SK_UP : Math.round(G.SK_UP * f);
      S.up[t] = order.slice(0, Math.max(n, nx ? G.SK_UP : 0)).map(s => s.key);
      for (const s of order.slice(0, n)) S.sk[s.key] = { r: 5, m: s.m };
    }
    S.level = G.lvOf(S); S.v = 3;
    if (S.flags) { delete S.flags.saint; S.flags.maxLog = null; }
  };

  // ── Quyết định: chọn kỹ năng để nâng ──
  const DEC = G.DECISIONS;
  DEC.cv_learn = {
    prio: 9, gap: 0,
    when: S => !S.dead && !!S.flags.learnPick && G.skTarget(S) && G.skTarget(S).pick,
    build(S, X) {
      const jt = jobTier(S), up = upOf(S, jt), left = G.SK_UP - up.length, open = G.skOpenDirs(S), auto = G.skAutoPick(S);
      const cands = G.skCands(S).sort((a, b) => (b === auto) - (a === auto));
      const choices = cands.slice(0, 4).map(s => {
        const lose = open.filter(d => !G.skOpenDirs(S, s.key).includes(d));
        const rw = G.skRewards(s.key, s.m), r5 = Object.entries(rw).map(([r, m]) => `bậc ${r}: ${statTxt(m)}`).join('; ');
        const gate = s.gateFor.length ? ` · gate vào ${s.gateFor.map(id => X.jobName(S, id)).join(', ')}` : '';
        return { k: s.key, label: G.skName(s.key), sub: `${G.skDesc(s.key) ? G.skDesc(s.key) + ' · ' : ''}${G.mv(s.m)}${gate} · ${r5}` + (lose.length ? ` · ⚠ không còn chỗ cho cặp gate vào ${lose.map(d => X.jobName(S, d.id)).join(', ')}` : '') };
      });
      return { title: 'Nâng kỹ năng mới', body: `${X.jobName(S)}: còn ${left} / ${G.SK_UP} chỗ nâng ở Tier ${jt}. Kỹ năng không được nâng chỉ học tới bậc 1. Muốn lên nghề Tier ${jt + 1} thì cặp kỹ năng của nghề đó phải nằm trong mười kỹ năng được nâng.`,
        choices: [...choices, { k: 'auto', label: 'Để tự chọn cả Tier này', sub: 'Ưu tiên cặp kỹ năng của nghề theo hướng đi.' }] };
    },
    apply(S, X, k) {
      if (k === 'auto') { (S.learnAuto = S.learnAuto || {})[jobTier(S)] = true; pick(S, G.skAutoPick(S)); }
      else if (!G.skPick(S, k)) pick(S, G.skAutoPick(S));
      X.addXp(0);   // dùng điểm đã giữ
      return null;
    },
    auto: S => { const s = G.skAutoPick(S); return s ? s.key : 'auto'; }
  };

  // ── Hệ con cuối năm: luyện ngoài giờ. Ai cũng tu: mỗi năm từ tuổi thiếu niên có điểm rèn nền (mastery đi theo kỹ năng).
  // Chí hướng Thuận theo tự nhiên, Gia đình luyện ít hơn; người già một nửa.
  G.cultYear = (S, X) => {
    const st = X.stage(S); if (!['teen', 'adult', 'elder'].includes(st)) return;
    const f = (S.aim === 'free' || S.aim === 'family' ? .6 : 1) * (st === 'elder' ? .5 : 1) * (.7 + .3 * (S.traits.bold + S.traits.studious));
    X.addXp(G.CULT.base * f);
  };
  { const k = G.SYSTEMS.findIndex(s => s.id === 'career'); G.SYSTEMS.splice(k + 1, 0, { id: 'cult', when: S => !S.dead, run: (S, X) => G.cultYear(S, X) }); }
})(window.LifeSim);
