/* Vạn Kiếp — KỲ NGỘ VÀ MẶT TRÁI (bước E của docs/07 mục 4.8, 5, 7; số chốt và kết quả ở docs/07 mục 4.13).
 *   Linh hồn trong nhẫn (cv_ring, Bàn Long, Đấu Phá): hiếm, tìm được nhẫn cổ có linh hồn một cao thủ đã chết; đeo thì có thầy dạy trường phái
 *     của linh hồn tới Tier 4, chỉ đường khi kẹt gate, giảng đạo cho Thủ Hộ Giả (ngộ đạo dễ hơn). Linh hồn có thể là chính một kiếp trước
 *     của người chơi (mộ trong W.graves); một phần là ma hồn muốn đoạt xá.
 *   Về mộ kiếp trước (cv_grave, trùng sinh): mỗi kiếp chết để lại mộ trong thế giới (W.graves); kiếp sau đi ngang vùng có mộ kiếp trước từng
 *     có cấp thì mở mộ lấy di vật, bút ký (nguồn dạy), hoặc thắp hương.
 *   Bí cảnh (cv_ruin, Phàm Nhân): mỗi di tích G.FATE.ruinEvery năm mở một bí cảnh chỉ cho người Tier ≤ 1 lọt qua kết giới; vào thì đánh tầng
 *     trên của di tích rồi bốc bảo vật (bí kíp, linh dược, bảo khí, kỳ quả nâng căn cốt); kẻ vào cùng có thể chặn đường.
 *   Giết người đoạt bảo (cv_rob, Phàm Nhân): vừa có đồ quý (trúng đấu giá, ra khỏi bí cảnh, vô địch tỉ thí, mỏ, mộ) thì bị nhắm: đánh, nộp của,
 *     chạy (theo Nhanh). Người có cấp cũng có lúc gặp kẻ yếu mang bảo vật: cướp (bị truy nã nếu có người thấy), bỏ qua, hộ tống.
 *   Cấm thuật (cv_forbidden, Quỷ Bí): gặp hắc ma pháp sư, nhất là khi max level lâu mà không lên được: học thì rèn × 2 và có thầy Tử thuật, Bóng tối tới Tier 3,
 *     mỗi năm hao Sinh lực, có lúc bị phát hiện (bắt, truy nã), có lúc tẩu hỏa. Báo quan thì được thưởng.
 *   Tẩu hỏa nhập ma (cv_deviate): do cấm thuật, thử thách chuyển nghề hỏng, liều đột phá lúc già hỏng: áp chế (theo Tinh thần), tán công
 *     (mất bậc kỹ năng, bỏ cấm thuật), mặc kệ (bệnh mới "Tẩu hỏa").
 *   Thức tỉnh lại (cv_reawaken, Solo Leveling): Phàm Nhân trưởng thành thập tử nhất sinh có lúc thức tỉnh lại: căn cốt nhảy hai bậc.
 * Trạng thái: S.flags.ring = { name, school, t, evil, past }, ringQ, ringSeen; graveSeen; notes = { t, school } (bút ký kiếp trước);
 *   ruinSeen (năm-di tích đã hỏi); loot = { y, what, v } (đồ quý đang mang), robQ; forb = { y }, forbQ, forbN; devQ; reawoken, reawakenQ;
 *   lvFullY (năm thế giới bắt đầu max level ở Tier hiện tại). Thế giới: W.graves (mộ các kiếp, mới nhất cuối).
 */
window.LifeSim = window.LifeSim || {};
(function (G) {
  const DEC = G.DECISIONS, J = window.JobLibrary;
  const cnt = (S, k, v = 1) => { S.flags[k] = (S.flags[k] || 0) + v; };
  const med = (S, X) => G.median(X.reg(S));
  const sig = (d, k = 3.2) => 1 / (1 + Math.exp(-k * d));
  const flesh = S => !S.undead && !G.RACES[S.race].construct;
  const grown = (S, X) => ['adult', 'elder'].includes(X.stage(S));
  const gift = (S, years, l) => { const F = S.flags; F.giftElixir = Math.max(F.giftElixir || 0, years); F.giftElixirL = Math.max(F.giftElixirL || 2, l); };
  const schoolVi = s => (J.schools[s] || {}).nameVi || s;

  G.FATE = {
    ringP: .0005,        // mỗi năm (thiếu niên, trưởng thành dưới 1,6 lần tuổi trưởng thành): tìm được nhẫn cổ
    ringEvil: .2,        // phần nhẫn có ma hồn
    possessP: .12,       // mỗi năm ma hồn thử đoạt xá
    ringT: 4,            // linh hồn dạy trường phái của nó tới Tier này
    ringEnlight: 3,      // Thủ Hộ Giả max level có linh hồn giảng đạo: tỉ lệ ngộ đạo × này
    graveT: 2,           // mộ kiếp trước từ Tier này mới có di vật, bút ký
    ruinEvery: 15,       // năm giữa hai lần bí cảnh của một di tích mở
    ruinMaxT: 1,         // kết giới chỉ cho người tới Tier này
    ruinFights: 2,
    ruinRival: .15,      // ra khỏi bí cảnh bị kẻ vào cùng chặn đường
    lootYrs: 3,          // năm đồ quý còn bị nhắm
    robP: .08,           // mỗi năm (khi mang đồ quý) bị phục kích
    robDie: .1,          // thua khi bị phục kích: chết
    greedP: .006,        // mỗi năm (người có cấp trưởng thành): gặp kẻ yếu mang bảo vật
    witness: .3,         // cướp xong có người thấy: bị truy nã
    forbP: .002,         // mỗi năm (trưởng thành, dưới Tier 4): gặp hắc ma pháp sư; tối đa hai lần một đời
    forbStuck: 4,        // max level từ chừng này năm: × forbStuckX
    forbStuckX: 3,
    forbMult: 2,         // rèn × này khi luyện cấm thuật
    forbT: 3,            // hắc ma pháp sư dạy tới Tier này, chỉ trường phái forbSchools
    forbSchools: ['death', 'shadow'],
    forbSeen: .07,       // mỗi năm bị phát hiện
    forbDev: .06,        // mỗi năm tẩu hỏa
    forbHl: 2,           // mỗi năm mất Sinh lực
    devPromote: .04,     // thử thách chuyển nghề hỏng: tẩu hỏa
    devPush: .3,         // liều đột phá lúc già hỏng: tẩu hỏa
    devDie: .05,         // áp chế hỏng: chết
    reawakenP: .2        // mỗi năm Phàm Nhân trưởng thành Sinh lực < 15: thức tỉnh lại
  };

  // Tẩu hỏa: bệnh mới; nguyên nhân chết không tự bốc (trọng số 0), chỉ do bệnh, quyết định.
  G.CONDS.qi = { nameVi: 'Tẩu hỏa nhập ma', mult: 1.6, heal: .2, cause: 'deviate' };
  G.CAUSES.deviate = { nameVi: 'tẩu hỏa nhập ma', stages: { adult: 0, elder: 0 } };
  G.CAUSES.possessed = { nameVi: 'bị ma hồn đoạt xá', stages: { adult: 0 } };
  G.CAUSES.robbed = { nameVi: 'bị giết đoạt bảo', stages: { adult: 0 } };

  // ═════════ Lối thoát khi kẹt gate (docs/08 mục 12: kẹt vĩnh viễn chưa có lối thoát) ═════════
  // Max level mà cặp gate của mọi nghề kế tiếp không nằm trong mười kỹ năng được nâng: bỏ kỹ năng không thuộc gate nào ra khỏi chỗ nâng,
  // đưa cặp gate của hướng đi vào (bậc 0). Kỹ năng bỏ ra vẫn giữ bậc, vẫn lắp được; level giảm, rèn lại cặp gate là lên.
  G.unstick = (S, X) => {
    if (!G.stuck(S)) return null;
    const jt = G.tierOf(S), up = S.up[jt] || [], nx = G.succOf(S.race, S.job, S.faith), mine = G.mySkills(S);
    const d = G.skDir(S) || nx[0]; if (!d) return null;
    const need = G.gatePair(d).map(id => jt + ':' + id).filter(k => !up.includes(k));
    if (!need.every(k => mine.some(s => s.key === k))) return null;
    const gates = new Set(nx.flatMap(x => G.gatePair(x).map(id => jt + ':' + id)));
    const drop = up.filter(k => !gates.has(k)).slice(-need.length); if (drop.length < need.length) return null;
    S.up[jt] = up.filter(k => !drop.includes(k)).concat(need);
    for (const k of need) if (!S.sk[k]) { const s = mine.find(x => x.key === k); S.sk[k] = { r: 0, m: s.m, j: s.job }; }
    S.flags.dir = { t: jt, job: S.job, id: d.id }; S.flags.lvFullY = null;
    G.skSync(X); S.level = G.lvOf(S); cnt(S, 'unstuck');
    return d;
  };

  // ═════════ Nguồn dạy mới ═════════
  G.TEACHERS.push({ id: 'ring', nameVi: 'Linh hồn trong nhẫn', tier: G.FATE.ringT, schools: 'trường phái của linh hồn', cond: 'đeo nhẫn cổ có linh hồn cao thủ (cv_ring)' });
  G.TEACHERS.push({ id: 'notes', nameVi: 'Bút ký kiếp trước', tier: 'Tier của kiếp đó (tối đa 4)', schools: 'trường phái của kiếp đó', cond: 'mở mộ kiếp trước (cv_grave)' });
  G.TEACHERS.push({ id: 'dark', nameVi: 'Hắc ma pháp sư', tier: G.FATE.forbT, schools: 'Tử thuật, Bóng tối', cond: 'đang luyện cấm thuật (cv_forbidden)' });
  { const base = G.teachList; G.teachList = (S, school, job) => {
      const out = base(S, school, job), F = S.flags || {};
      if (F.ring && !F.ring.lost && F.ring.school === school) out.push({ t: F.ring.t, id: 'ring', nameVi: `Linh hồn ${F.ring.name} trong nhẫn` });
      if (F.notes && F.notes.school === school) out.push({ t: F.notes.t, id: 'notes', nameVi: 'Bút ký kiếp trước' });
      if (F.forb && !F.forb.end && G.FATE.forbSchools.includes(school)) out.push({ t: G.FATE.forbT, id: 'dark', nameVi: 'Hắc ma pháp sư' });
      return out;
    }; }
  // Cấm thuật: rèn nhanh gấp đôi (life.js addXp nhân G.cultRate).
  { const base = G.cultRate; G.cultRate = S => base(S) * (S.flags && S.flags.forb && !S.flags.forb.end ? G.FATE.forbMult : 1); }

  // ═════════ Mộ các kiếp (W.graves) ═════════
  // Ghi lúc chết; kiếp sau sinh vào cùng thế giới (ui.js start) thì thấy. Đồng niên chạy trên bản sao thế giới nên không ghi vào thế giới thật.
  { const base = G.onDeath; G.onDeath = (S, X) => {
      if (base) base(S, X);
      const W = S.world; if (!W) return;
      const L = W.graves || (W.graves = []);
      L.push({ id: W.year + ':' + S.name, name: S.name, kiep: S.kiep, race: S.race, tier: G.tierOf(S), level: S.level, job: S.job, jobVi: X.jobName(S),
        school: G.schoolOf(S), loc: S.loc, pos: S.pos, year: W.year, gear: S.gear, undead: !!S.undead });
      if (L.length > 40) L.splice(0, L.length - 40);
    }; }
  // Mộ ở vùng đang ở, của kiếp trước từ Tier graveT, chưa bị kiếp nào đào, kiếp này chưa đi ngang.
  const pastGrave = S => { const W = S.world; return ((W && W.graves) || []).find(g => g.tier >= G.FATE.graveT && g.name !== S.name && !g.undead && !g.dug && g.loc === S.loc && !(S.flags.graveSeen || {})[g.id]); };
  DEC.cv_grave = {
    prio: 6, gap: 2,
    when: (S, X) => !S.dead && flesh(S) && grown(S, X) && !!pastGrave(S),
    build(S, X) {
      const g = pastGrave(S), R = G.REGION[g.loc];
      return { title: 'Ngôi mộ quen', body: `Ở ${R.nameVi} có một ngôi mộ cỏ mọc kín: "${g.name}, ${g.jobVi}, mất năm ${g.year}". Bạn chưa từng tới đây mà vẫn biết đường. Đêm qua bạn mơ thấy mình chôn một chiếc rương dưới gốc cây sau mộ.`,
        choices: [{ k: 'dig', label: 'Đào chỗ trong mơ', sub: `Di vật, bút ký của ${G.tierName(g.tier)}; đào mộ là điều cấm kỵ.` }, { k: 'pray', label: 'Thắp hương', sub: 'Đứng lại một lúc, nhớ ra vài điều.' }, { k: 'no', label: 'Đi tiếp', sub: '' }] };
    },
    apply(S, X, k) {
      const g = pastGrave(S); (S.flags.graveSeen = S.flags.graveSeen || {})[g.id] = true;
      if (k === 'no') return null;
      cnt(S, 'grave_' + k);
      if (k === 'pray') { X.add('h', 6); X.add('sm', 4); X.addXp(60 * g.tier); return `Bạn thắp nén hương cho ${g.name}. Vài thế võ, vài câu chú hiện lên rõ như vừa học hôm qua.`; }
      const t = Math.min(4, g.tier), had = S.flags.notes; g.dug = S.world.year;
      if (!had || had.t < t) S.flags.notes = { t, school: g.school, from: g.name };
      const gear = g.gear > S.gear ? Math.min(10, g.gear) : S.gear, up = gear - S.gear; S.gear = gear;
      X.addXp(120 * g.tier);
      if (X.chance(.15)) { X.cond('curse'); X.add('h', -6); }
      if (up) S.flags.loot = { y: S.world.year, what: 'di vật trong mộ', v: up };
      const gearTxt = up ? 'bộ trang bị cũ (trang bị ' + S.gear + '/10) và ' : '';
      return `Dưới gốc cây có chiếc rương bọc da. Trong đó là ${gearTxt}cuốn bút ký ${schoolVi(g.school).toLowerCase()} viết bằng nét chữ của chính bạn.`;
    },
    auto: S => S.traits.bold > .4 || S.aim === 'power' ? 'dig' : 'pray'
  };

  // ═════════ Linh hồn trong nhẫn ═════════
  const RING_FROM = ['một sạp đồ cũ ngoài chợ', 'đáy một cái giếng cạn', 'hộp gỗ ông nội để lại', 'xác một lữ khách bên đường', 'khe đá trong hang'];
  function ringSpirit(S, X) {
    const g = ((S.world && S.world.graves) || []).filter(g => g.tier >= 3 && g.name !== S.name && !g.undead).sort((a, b) => b.tier - a.tier)[0];
    if (g && X.chance(.5)) return { name: g.name, school: g.school, t: Math.min(G.FATE.ringT, g.tier), evil: false, past: true };
    const mine = G.schoolOf(S), pool = ['arcane', 'death', 'combat', 'martial', 'shadow', 'ranged', 'craft', 'beast'];
    const race = X.pick(['human', 'elf', 'dwarf', 'dragonkin']);
    return { name: G.personName(race, 'm', X.rnd), school: X.chance(.5) ? mine : X.pick(pool), t: G.FATE.ringT, evil: X.chance(G.FATE.ringEvil), past: false };
  }
  DEC.cv_ring = {
    prio: 8, gap: 1,
    when: S => !S.dead && !!S.flags.ringQ,
    build(S, X) {
      const q = S.flags.ringQ;
      const who = q.past ? `Nó tự xưng là ${q.name}, và gọi bạn bằng một cái tên bạn chưa từng nghe mà thấy quen.` : `Nó tự xưng là ${q.name}, một ${schoolVi(q.school).toLowerCase()} sư đã chết mấy trăm năm.`;
      return { title: 'Chiếc nhẫn cổ', body: `Bạn nhặt được một chiếc nhẫn đen sì ở ${q.from}. Đêm đó có giọng nói vang trong đầu bạn. ${who} Nó muốn có người mang nó đi, đổi lại nó dạy những gì nó biết.`,
        choices: [{ k: 'wear', label: 'Đeo nhẫn, nhận làm thầy', sub: `Thầy ${schoolVi(q.school)} tới Tier ${q.t}; không biết nó thật lòng tới đâu.` }, { k: 'sell', label: 'Bán cho tiệm cầm đồ', sub: 'Nhẫn cổ bán được giá.' }, { k: 'no', label: 'Ném xuống sông', sub: '' }] };
    },
    apply(S, X, k) {
      const q = S.flags.ringQ; S.flags.ringQ = null; S.flags.ringSeen = true;
      cnt(S, 'ring_' + k);
      if (k === 'sell') { const g = Math.round(med(S, X) * X.int(2, 4)); X.money(g); return `Tiệm cầm đồ trả ${G.coin(g)}. Giọng nói im bặt khi chiếc nhẫn rời tay bạn.`; }
      if (k !== 'wear') return null;
      S.flags.ring = { name: q.name, school: q.school, t: q.t, evil: q.evil, past: q.past, y: S.world.year };
      if (q.past) cnt(S, 'ringPast');
      const d = G.unstick(S, X);
      return `Chiếc nhẫn ấm lên trên ngón tay. ${q.name} bắt đầu giảng cho bạn từ những điều cơ bản nhất.` + (d ? ` Lão chỉ ra bạn đã nâng nhầm kỹ năng; giờ cặp kỹ năng vào ${X.jobName(S, d.id)} đã nằm trong chỗ nâng.` : '');
    },
    auto: S => S.traits.bold > .3 || ['power', 'scholar', 'adventure', 'martial'].includes(S.aim) ? 'wear' : S.traits.social > .6 ? 'sell' : 'wear'
  };
  function ringYear(S, X) {
    const F = S.flags, r = F.ring, C = G.FATE; if (!r || r.lost) return;
    if (r.evil && X.chance(C.possessP * X.R(S).ypt)) {
      cnt(S, 'ringEvil');
      const resist = G.clamp(.4 + S.sm / 200 + .05 * G.tierOf(S) + (G.statsOf(S).WIL / Math.max(1, G.statCap(S))) * .15, .3, .92);
      if (X.rnd() < resist) { r.lost = true; X.add('sm', 5); cnt(S, 'ringResist'); X.log(`Đêm trăng non, ${r.name} lộ mặt thật: nó muốn chiếm thân xác bạn. Bạn giữ được mình; chiếc nhẫn vỡ đôi.`, 'big'); return; }
      if (X.chance(.25)) { cnt(S, 'ringPossessed'); X.die({ id: 'possessed', text: `bị ma hồn ${r.name} trong nhẫn đoạt xá` }); return; }
      r.lost = true; X.cond('curse'); X.add('h', -15); X.add('sm', -10); cnt(S, 'ringHurt');
      X.log(`${r.name} trong nhẫn định đoạt xá bạn. Bạn tỉnh dậy sau ba ngày, chiếc nhẫn đã nứt và câm lặng, đầu óc như bị cào.`, 'bad');
      return;
    }
    const d = G.unstick(S, X);
    if (d) X.log(`${r.name} chỉ cho bạn thấy đường lên ${X.jobName(S, d.id)}: cặp kỹ năng ấy giờ nằm trong chỗ nâng.`, 'big');
    // Giảng đạo: Thủ Hộ Giả max level ngộ đạo dễ hơn (js/cult.js cultYear có tỉ lệ gốc).
    if (G.tierOf(S) === 4 && G.lvFull(S) && !F.enlight && r.school === G.schoolOf(S) && X.chance(G.CULT.enlight * (C.ringEnlight - 1) * G.cultRate(S) * (.5 + S.sm / 100))) {
      F.enlight = S.age; cnt(S, 'ringEnlight');
      X.log(`${r.name} kể về ngày lão bước vào ${G.tierName(5)}. Bạn ngộ ra điều mà lão không nói thành lời.`, 'big');
    }
  }

  // ═════════ Bí cảnh ═════════
  const hashOf = s => { let h = 2166136261; for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619); return h >>> 0; };
  // Kỳ mở thứ mấy của di tích d (lệch theo id để các di tích không mở cùng năm); mở trong lượt này nếu năm mở rơi vào ypt năm của lượt.
  const ruinCycle = (S, d) => Math.floor((S.world.year + hashOf(d.id) % G.FATE.ruinEvery) / G.FATE.ruinEvery);
  const ruinOpen = (S, X, d) => (S.world.year + hashOf(d.id) % G.FATE.ruinEvery) % G.FATE.ruinEvery < X.R(S).ypt;
  const ruinOf = (S, X) => {
    if (G.tierOf(S) > G.FATE.ruinMaxT) return null;
    const seen = S.flags.ruinSeen || {};
    for (const d of G.realm.dungeons || []) {
      if (d.region !== S.loc || !ruinOpen(S, X, d) || seen[d.id + ':' + ruinCycle(S, d)]) continue;
      const z = G.DG[d.region][0]; if (z && z.tier[0] <= G.tierOf(S) + 1) return { d, zone: z };
    }
    return null;
  };
  const youngish = (S, X) => { const st = X.stage(S); return st === 'teen' || (st === 'adult' && X.years(S) <= X.R(S).adult * 1.8); };
  DEC.cv_ruin = {
    prio: 6, gap: 1,
    when: (S, X) => !S.dead && flesh(S) && youngish(S, X) && !!ruinOf(S, X),
    build(S, X) {
      const { d } = ruinOf(S, X);
      return { title: 'Bí cảnh mở cửa', body: `Kết giới quanh ${d.name} mỏng đi như mười lăm năm trước: chỉ ${G.tierName(0)} và ${G.tierName(1)} lọt qua được. Người trẻ tứ xứ kéo tới, ai cũng mong mang ra một món bảo vật. Sức bạn ${X.power(S).toFixed(2)}.`,
        choices: [{ k: 'go', label: 'Vào bí cảnh', sub: `${G.FATE.ruinFights} trận ở tầng trên; bảo vật không chia cho ai.` }, { k: 'no', label: 'Đứng ngoài', sub: '' }] };
    },
    apply(S, X, k) {
      const { d, zone } = ruinOf(S, X); (S.flags.ruinSeen = S.flags.ruinSeen || {})[d.id + ':' + ruinCycle(S, d)] = true;
      if (k !== 'go') return null;
      cnt(S, 'ruinIn');
      const r = G.assault(X, { ...zone, nameVi: `bí cảnh ${d.name}` }, G.FATE.ruinFights, { cell: d.cell });
      if (r.dead) { cnt(S, 'ruinDie'); return null; }
      if (!r.done) return `Thắng ${r.won}/${G.FATE.ruinFights} trận rồi phải lết ra trước khi kết giới đóng.`;
      cnt(S, 'ruinWin');
      const roll = X.rnd(), m = med(S, X); let out;
      if (roll < .35) { X.addXp(300); cnt(S, 'ruin_book'); out = 'Trong hốc tường có cuộn bí kíp còn nguyên. Bạn luyện suốt mùa đông.'; S.flags.loot = { y: S.world.year, what: 'bí kíp', v: 2 }; }
      else if (roll < .6) { gift(S, 2, 3); cnt(S, 'ruin_pill'); out = 'Bạn hái được một bụi linh thảo, đủ chế hai năm dược tề thượng hạng.'; S.flags.loot = { y: S.world.year, what: 'linh thảo', v: 2 }; }
      else if (roll < .82) { S.gear = Math.min(10, S.gear + 2); cnt(S, 'ruin_gear'); out = `Bạn rút được một món bảo khí cắm trong xác một kẻ đến trước. Trang bị ${S.gear}/10.`; S.flags.loot = { y: S.world.year, what: 'bảo khí', v: 3 }; }
      else if (roll < .92 && S.tal && G.RANK[S.tal.root] < 5) { S.tal.root = G.RARITY[G.RANK[S.tal.root] + 1].id; G.talRecalc(S); cnt(S, 'ruin_fruit'); out = `Bạn ăn một quả lạ mọc giữa đống xương. Căn cốt lên ${G.RARITY[G.RANK[S.tal.root]].nameVi}.`; }
      else { const g = Math.round(m * X.int(2, 5)); X.money(g); cnt(S, 'ruin_gold'); out = `Bạn mang ra một túi đồ cổ, bán được ${G.coin(g)}.`; S.flags.loot = { y: S.world.year, what: 'đồ cổ', v: 1 }; }
      if (S.flags.loot && X.chance(G.FATE.ruinRival)) S.flags.robQ = { kind: 'prey', from: 'ruin' };
      return out;
    },
    auto: (S, X) => S.traits.bold > .6 || (['adventure', 'power', 'martial'].includes(S.aim) && S.traits.bold > .3) ? 'go' : 'no'
  };

  // ═════════ Giết người đoạt bảo ═════════
  const lootOn = S => { const L = S.flags.loot; return L && S.world.year - L.y <= G.FATE.lootYrs ? L : null; };
  // Đồ quý từ các quyết định của bước D (js/inst.js): đấu giá, tỉ thí, mỏ.
  const tagLoot = (id, f) => { const D = DEC[id]; if (!D) return; const base = D.apply; D.apply = function (S, X, k, c) { const before = { ...S.flags }; const r = base.call(this, S, X, k, c); if (!S.dead) f(S, X, k, before); return r; }; };
  tagLoot('cv_auction', (S, X, k) => { if (['elixir', 'gear', 'core'].includes(k)) S.flags.loot = { y: S.world.year, what: { elixir: 'dược tề thượng hạng', gear: 'vũ khí ma pháp', core: 'ma tinh hạch' }[k], v: 3 }; });
  tagLoot('cv_tourney', (S, X, k, b) => { if ((S.flags.tourneyWin || 0) > (b.tourneyWin || 0)) S.flags.loot = { y: S.world.year, what: 'phần thưởng vô địch', v: 2 }; });
  tagLoot('cv_mine', (S, X, k, b) => { if ((S.flags.mineGood || 0) > (b.mineGood || 0)) S.flags.loot = { y: S.world.year, what: 'ma tinh', v: 2 }; });

  const greedVictim = (S, X) => { const q = S.flags.robQ; return q && q.kind === 'greed' ? q : null; };
  DEC.cv_rob = {
    prio: 8, gap: 1,
    when: S => !S.dead && !!S.flags.robQ,
    build(S, X) {
      const q = S.flags.robQ, pw = X.power(S);
      if (q.kind === 'greed') {
        return { title: 'Kẻ yếu mang ngọc', body: `Trên đường vắng bạn gặp ${q.name}, một ${G.tierName(q.t)} đi một mình, bên hông đeo ${q.what}. Hắn chưa thấy bạn. Sức bạn ${pw.toFixed(2)}, hắn chừng ${q.pw.toFixed(2)}.`,
          choices: [{ k: 'rob', label: 'Ra tay', sub: 'Không ai thấy thì không ai biết.' }, { k: 'guard', label: 'Đi cùng một quãng', sub: 'Đường này nhiều kẻ xấu.' }, { k: 'no', label: 'Bỏ qua', sub: '' }] };
      }
      const L = lootOn(S) || { what: 'đồ quý' };
      return { title: 'Phục kích', body: `${q.from === 'ruin' ? 'Vừa ra khỏi bí cảnh, mấy kẻ vào cùng chặn đường bạn' : 'Tin bạn có ' + L.what + ' lan nhanh hơn bạn tưởng. Trên đường vắng, mấy kẻ bịt mặt chặn đầu'}. Sức bạn ${pw.toFixed(2)}.`,
        choices: [{ k: 'fight', label: 'Đánh', sub: `Thua thì mất của, có khi mất mạng.` }, { k: 'pay', label: 'Nộp của', sub: 'Mất bốn phần tiền hoặc món đồ quý.' }, { k: 'flee', label: 'Chạy', sub: `Theo Nhanh (${G.statsOf(S).AGI}); không thoát thì phải đánh.` }] };
    },
    apply(S, X, k) {
      const q = S.flags.robQ; S.flags.robQ = null;
      const pw = X.power(S), m = med(S, X);
      if (q.kind === 'greed') {
        cnt(S, 'greed_' + k);
        if (k === 'no') return null;
        if (k === 'guard') { X.add('so', 4); S.fame = Math.min(100, S.fame + 1); return `Bạn đi cùng ${q.name} tới cổng thành. Hắn cảm ơn rối rít.`; }
        if (X.rnd() < sig(pw - q.pw)) {
          cnt(S, 'greedWin');
          const g = Math.round(m * X.int(2, 5)); X.money(g); if (q.gear && S.gear < 10) S.gear = Math.min(10, S.gear + 1);
          X.add('h', -(S.traits.social > .5 ? 8 : 3)); S.flags.killer = (S.flags.killer || 0) + 1;
          if (X.chance(G.FATE.witness) && S.nation != null && S.nation >= 0) {
            (S.flags.wanted = S.flags.wanted || {})[S.nation] = true; S.fame = Math.max(0, S.fame - 6); cnt(S, 'greedSeen');
            S.flags.migrateQ = `Có người thấy bạn giết ${q.name}. Cáo thị truy nã dán khắp ${G.realm.nations[S.nation].name}.`;
            return `Bạn lấy ${q.what} và ${G.coin(g)}. Lúc quay đi thì thấy một đứa bé chăn dê đứng trên đồi.`;
          }
          return `Bạn lấy ${q.what} và ${G.coin(g)}, vùi xác dưới bụi gai.`;
        }
        cnt(S, 'greedLose'); X.add('hl', -X.int(10, 25)); S.fame = Math.max(0, S.fame - 2);
        return `${q.name} không yếu như vẻ ngoài. Bạn ôm vết thương bỏ chạy.`;
      }
      cnt(S, 'rob_' + k);
      const L = lootOn(S), opp = pw * (.8 + X.rnd() * .5) + .1;
      const lose = () => { if (L && ['bảo khí', 'vũ khí ma pháp'].includes(L.what)) S.gear = Math.max(0, S.gear - 2); else X.money(-Math.round(Math.max(0, S.gold) * .4)); S.flags.loot = null; };
      const fight = (o) => {
        if (X.rnd() < sig(pw - o)) { cnt(S, 'robWin'); X.money(Math.round(m * X.int(1, 2))); S.fame = Math.min(100, S.fame + 3); S.flags.loot = null; return 'Bạn hạ hai tên, số còn lại bỏ chạy. Trên xác chúng có ít bạc.'; }
        cnt(S, 'robLose'); X.add('hl', -X.int(15, 35)); lose();
        if (X.chance(G.FATE.robDie)) { cnt(S, 'robDie'); X.die({ id: 'robbed', text: 'bị giết đoạt bảo' }); return null; }
        return 'Bạn gục xuống. Tỉnh dậy thì đồ quý đã mất, người đầy máu.';
      };
      if (k === 'pay') { lose(); X.add('h', -4); return 'Bạn ném đồ xuống đất. Chúng nhặt rồi biến vào rừng.'; }
      if (k === 'flee') {
        const p = G.clamp(.3 + .5 * G.statsOf(S).AGI / Math.max(1, G.statCap(S)), .2, .85);
        if (X.rnd() < p) { cnt(S, 'robFled'); S.flags.loot = null; return 'Bạn cắt rừng chạy suốt đêm, cắt đuôi được chúng.'; }
        return 'Không thoát được. ' + (fight(opp * 1.15) || '');
      }
      return fight(opp);
    },
    auto(S, X, d) {
      const q = S.flags.robQ;
      if (q.kind === 'greed') return (S.traits.social < .3 && S.traits.bold > .5) || (S.aim === 'power' && S.traits.social < .5) ? 'rob' : S.traits.social > .6 ? 'guard' : 'no';
      const pw = X.power(S);
      return S.traits.bold > .55 && pw > 1.6 ? 'fight' : G.statsOf(S).AGI / Math.max(1, G.statCap(S)) > .6 ? 'flee' : S.traits.bold > .35 ? 'fight' : 'pay';
    }
  };
  // Gặp kẻ yếu mang bảo vật: người có cấp, trưởng thành; hắn yếu hơn mình (hệ con fate bốc mỗi năm).
  function greedMeet(S, X) {
    const t = Math.max(0, G.tierOf(S) - X.int(0, 1)), sex = X.pick(['m', 'f']);
    S.flags.robQ = { kind: 'greed', name: G.personName(X.pick(['human', 'elf', 'dwarf', 'beastfolk']), sex, X.rnd), t, pw: X.power(S) * (.55 + X.rnd() * .35), gear: X.chance(.5),
      what: X.pick(['một thanh kiếm phát sáng mờ', 'một túi ma tinh', 'hộp dược tề niêm sáp đỏ', 'cuốn bí kíp bọc da rồng']) };
    cnt(S, 'greedN');
  }

  // ═════════ Cấm thuật ═════════
  const stuckLong = S => S.flags.lvFullY != null && S.world.year - S.flags.lvFullY >= G.FATE.forbStuck;
  const darkP = S => G.FATE.forbP * (stuckLong(S) ? G.FATE.forbStuckX : 1) * (S.faith === 'dark' ? 2 : 1) * (S.aim === 'power' ? 1.5 : 1);
  DEC.cv_forbidden = {
    prio: 7, gap: 1,
    when: S => !S.dead && !!S.flags.forbQ,
    build(S, X) {
      const q = S.flags.forbQ;
      return { title: 'Hắc ma pháp sư', body: `${q.name} tìm tới lúc bạn ngồi một mình.${q.stuck ? ' "Ngươi đứng ở đỉnh bao năm rồi mà cửa vẫn đóng. Thầy của ngươi không dạy được nữa đâu."' : ''} Hắn mở cuốn sách da người: huyết tế, tử thuật, những thứ học nhanh gấp đôi và lấy lại gấp đôi.`,
        choices: [{ k: 'learn', label: 'Học cấm thuật', sub: `Rèn × ${G.FATE.forbMult}, có thầy Tử thuật, Bóng tối tới Tier ${G.FATE.forbT}; mỗi năm hao Sinh lực, có lúc bị phát hiện, có lúc tẩu hỏa.` }, { k: 'report', label: 'Báo quan', sub: 'Quan thưởng cho người tố giác.' }, { k: 'no', label: 'Bỏ đi', sub: '' }] };
    },
    apply(S, X, k) {
      S.flags.forbQ = null; cnt(S, 'forb_' + k);
      if (k === 'report') {
        const n = S.nation != null && S.nation >= 0 ? G.realm.nations[S.nation] : null;
        X.money(Math.round(med(S, X) * 2)); S.fame = Math.min(100, S.fame + 3); if (n && G.addMerit) G.addMerit(S, n.idx, 3);
        return `Lính ${n ? n.name : 'tuần tra'} vây căn nhà hắn trọ. Bạn được thưởng ${G.coin(Math.round(med(S, X) * 2))}.`;
      }
      if (k !== 'learn') return null;
      S.flags.forb = { y: S.world.year };
      const d = G.unstick(S, X);
      return 'Bạn cắt tay nhỏ máu lên trang sách. Chữ trên trang tự động bò vào đầu bạn.' + (d ? ` Huyết tế mở lại kinh mạch: cặp kỹ năng vào ${X.jobName(S, d.id)} đã vào chỗ nâng.` : '');
    },
    auto: (S, X) => (S.aim === 'power' && S.traits.bold > .4) || (S.flags.lvFullY != null && S.traits.bold > .7 && S.traits.pious < .4) ? 'learn' : S.traits.pious > .6 || S.traits.social > .7 ? 'report' : 'no'
  };
  function forbYear(S, X) {
    const F = S.flags, C = G.FATE, ypt = X.R(S).ypt; if (!F.forb || F.forb.end) return;
    X.add('hl', -C.forbHl * ypt);
    const n = G.here(S).n;
    if (n && X.chance(C.forbSeen * ypt)) {
      cnt(S, 'forbCaught'); (F.wanted = F.wanted || {})[n.idx] = true;
      G.caught(X, n, 'luyện cấm thuật'); if (S.dead) return;
      F.migrateQ = `${n.name} treo thưởng bắt kẻ luyện cấm thuật. Mặt bạn có trên cáo thị.`;
    }
    if (!F.devQ && X.chance(C.forbDev * ypt)) F.devQ = 'forb';
  }

  // ═════════ Tẩu hỏa nhập ma ═════════
  { const D = DEC.promote, base = D.apply; D.apply = function (S, X, k, c) {
      const j0 = S.job, r = base.call(this, S, X, k, c);
      if (k !== 'wait' && S.job === j0 && !S.dead && !S.undead && !S.flags.devQ && X.chance(G.FATE.devPromote)) S.flags.devQ = 'promote';
      return r;
    }; }
  if (DEC.cv_lifespan) { const D = DEC.cv_lifespan, base = D.apply; D.apply = function (S, X, k, c) {
      const ok0 = S.flags.pushOk, r = base.call(this, S, X, k, c);
      if (k === 'push' && !S.dead && S.flags.pushOk === ok0 && !S.flags.devQ && X.chance(G.FATE.devPush)) S.flags.devQ = 'push';
      return r;
    }; }
  const DEV_WHY = { forb: 'Cấm thuật trong người bạn trào ngược.', promote: 'Thử thách hỏng, khí trong người bạn chạy loạn.', push: 'Lần đột phá hỏng để lại một luồng khí không chịu nằm yên.' };
  DEC.cv_deviate = {
    prio: 9, gap: 1,
    when: S => !S.dead && !!S.flags.devQ,
    build(S, X) {
      const p = devP(S), forb = S.flags.forb && !S.flags.forb.end;
      return { title: 'Tẩu hỏa nhập ma', body: `${DEV_WHY[S.flags.devQ] || DEV_WHY.promote} Mắt bạn đỏ ngầu, tay run không cầm nổi chén nước.`,
        choices: [{ k: 'hold', label: 'Cố áp chế', sub: `~${Math.round(p * 100)}% qua được (theo Tinh thần, tâm trí); hỏng thì thành bệnh, có thể chết.` },
          { k: 'drop', label: 'Tán công', sub: `Hai kỹ năng cao nhất tụt một bậc${forb ? ', bỏ cấm thuật' : ''}; an toàn.` }, { k: 'no', label: 'Mặc kệ', sub: 'Bệnh "Tẩu hỏa nhập ma" (nguy cơ chết × 1,6).' }] };
    },
    apply(S, X, k) {
      const why = S.flags.devQ; S.flags.devQ = null; cnt(S, 'dev_' + k); cnt(S, 'devN');
      if (k === 'hold') {
        if (X.rnd() < devP(S)) { X.add('sm', 3); return 'Bạn ngồi bất động ba ngày, ép luồng khí về chỗ cũ.'; }
        X.cond('qi'); X.add('h', -12); X.add('hl', -15);
        if (X.chance(G.FATE.devDie)) { cnt(S, 'devDie'); X.die({ id: 'deviate', text: 'tẩu hỏa nhập ma' }); return null; }
        return 'Luồng khí xé toạc kinh mạch. Bạn sống, nhưng không còn như trước.';
      }
      if (k === 'drop') {
        const jt = G.tierOf(S), up = (S.up[jt] || []).filter(key => G.rankOf(S, key) >= 1).sort((a, b) => G.rankOf(S, b) - G.rankOf(S, a)).slice(0, 2);
        for (const key of up) S.sk[key].r = Math.max(0, Math.floor(S.sk[key].r + 1e-9) - 1);
        G.skSync(X); S.level = G.lvOf(S); S.flags.lvFullY = null;
        if (S.flags.forb && !S.flags.forb.end) { S.flags.forb.end = S.world.year; cnt(S, 'forbQuit'); }
        X.add('h', -4);
        return `Bạn tự phế một phần tu vi. Level còn ${S.level}.${why === 'forb' ? ' Cuốn sách da người bị đốt trong lò.' : ''}`;
      }
      X.cond('qi'); X.add('h', -8);
      return 'Bạn nghiến răng chịu đựng. Những cơn khí loạn cứ thế đến rồi đi.';
    },
    auto: (S, X) => devP(S) > .6 || S.traits.bold > .6 ? 'hold' : S.flags.forb && !S.flags.forb.end && S.traits.pious > .5 ? 'drop' : S.traits.bold > .3 ? 'hold' : 'drop'
  };
  const devP = S => G.clamp(.3 + S.sm / 250 + .2 * G.statsOf(S).WIL / Math.max(1, G.statCap(S)), .2, .85);

  // ═════════ Thức tỉnh lại ═════════
  DEC.cv_reawaken = {
    prio: 9, gap: 1,
    when: S => !S.dead && !!S.flags.reawakenQ && !!S.tal,
    build(S, X) {
      return { title: 'Thức tỉnh lại', body: `Bạn nằm giữa sống và chết. Trong cơn mê có một cánh cửa bằng ánh sáng lam, sau cửa là căn phòng đầy những cái bóng đang quỳ. Lễ thử thiên phú năm nào nói bạn chỉ có ${G.rootText(S)}. Cánh cửa hỏi bạn có muốn đi qua không.`,
        choices: [{ k: 'go', label: 'Bước qua cửa', sub: 'Căn cốt nhảy bậc; không ai biết cánh cửa muốn gì.' }, { k: 'no', label: 'Quay về', sub: '' }] };
    },
    apply(S, X, k) {
      S.flags.reawakenQ = null; S.flags.reawoken = S.age;
      if (k !== 'go') return null;
      const k0 = G.RANK[S.tal.root], k1 = Math.min(5, k0 + 2 + (X.chance(.3) ? 1 : 0));
      S.tal.root = G.RARITY[k1].id; G.talRecalc(S); X.add('hl', 25); X.addXp(150); cnt(S, 'reawaken');
      return `Bạn tỉnh dậy, vết thương đã liền. Căn cốt ${G.RARITY[k0].nameVi} → ${G.RARITY[k1].nameVi}.`;
    },
    auto: () => 'go'
  };

  // ═════════ Hệ con "fate" (sau "inst"): nhẫn, phục kích, cấm thuật, thức tỉnh lại, đếm năm max level ═════════
  G.fateYear = function (S, X) {
    const F = S.flags, C = G.FATE, ypt = X.R(S).ypt, st = X.stage(S);
    if (S.undead) return;
    // Năm bắt đầu max level ở Tier hiện tại (cấm thuật nhắm người đứng ở đỉnh lâu).
    if (G.lvFull(S)) { if (F.lvFullY == null || F.lvFullT !== G.tierOf(S)) { F.lvFullY = S.world.year; F.lvFullT = G.tierOf(S); } } else F.lvFullY = null;
    if (!F.ringSeen && !F.ringQ && flesh(S) && (st === 'teen' || (st === 'adult' && X.years(S) <= X.R(S).adult * 1.6)) && X.chance(C.ringP * ypt))
      F.ringQ = { ...ringSpirit(S, X), from: X.pick(RING_FROM) };
    ringYear(S, X); if (S.dead) return;
    forbYear(S, X); if (S.dead) return;
    if (flesh(S) && (st === 'adult' || st === 'elder')) {
      if (!F.robQ && G.tierOf(S) >= 1 && X.chance(C.greedP * ypt)) greedMeet(S, X);
      if (!F.forb && !F.forbQ && (F.forbN || 0) < 2 && G.tierOf(S) < 4 && X.chance(darkP(S) * ypt)) { F.forbQ = { name: G.personName(X.pick(['human', 'elf', 'orc']), X.pick(['m', 'f']), X.rnd), stuck: stuckLong(S) }; cnt(S, 'forbN'); }
    }
    const L = lootOn(S);
    if (L && !F.robQ && X.chance(C.robP * ypt * (S.focus === 'adventure' || S.focus === 'hunt' ? 1.4 : 1))) F.robQ = { kind: 'prey', from: 'road' };
    if (!F.reawoken && !F.reawakenQ && flesh(S) && st === 'adult' && G.tierOf(S) === 0 && S.hl < 15 && X.chance(C.reawakenP)) F.reawakenQ = true;
  };
  { const k = G.SYSTEMS.findIndex(s => s.id === 'inst'); G.SYSTEMS.splice(k + 1, 0, { id: 'fate', when: S => !S.dead, run: (S, X) => G.fateYear(S, X) }); }

  G.ringText = S => { const r = S.flags && S.flags.ring; return r && !r.lost ? `Nhẫn cổ: ${r.name} (${schoolVi(r.school)}, Tier ${r.t})` : null; };
})(window.LifeSim);
// Chip nhẫn cổ, cấm thuật cạnh căn cốt, thiên phú (bảng nhân vật).
(function (G) {
  const base = G.talChips;
  G.talChips = S => {
    const out = base(S), t = G.ringText(S), F = S.flags || {};
    if (t) out.push({ text: t, col: '#8a7cf0', title: `${t}. Linh hồn trong nhẫn dạy trường phái của nó, chỉ đường khi kẹt cặp kỹ năng gate${F.ring.past ? '; đây là một kiếp trước của bạn' : ''}.` });
    if (F.forb && !F.forb.end) out.push({ text: 'Cấm thuật', col: '#a03a3a', title: `Rèn × ${G.FATE.forbMult}, có thầy Tử thuật, Bóng tối tới Tier ${G.FATE.forbT}; mỗi năm hao Sinh lực, có lúc bị phát hiện, có lúc tẩu hỏa.` });
    if (F.notes) out.push({ text: `Bút ký kiếp trước (Tier ${F.notes.t})`, col: '#7a9a6a', title: `Bút ký ${F.notes.from || ''}: nguồn dạy trường phái này tới Tier ${F.notes.t}.` });
    return out;
  };
})(window.LifeSim);
