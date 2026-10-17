/* Vạn Kiếp — SỰ KIỆN GIỐNG LOÀI (docs/14; người dùng yêu cầu 17/10/2026).
 * Trước đây sự kiện đời người viết cho loài người; giống loài khác chỉ có lễ trưởng thành (tn_rite), tập tục (cv_custom)
 * và hai sự kiện của Cơ Nhân, nên Tiên Tộc 400 tuổi vẫn "đau lưng", Hải Tộc vẫn "được mùa lúa". File này thêm hai lớp:
 *   1. Sự kiện, quyết định riêng của tám giống loài (G.RACE_EV), rút từ truyện, game, văn học dân gian (docs/14 mục 1),
 *      gắn với môi trường sống: ở đất quê tộc (G.raceHome: biome trong G.RACE_SETTLE) hay xa quê; sống giữa người cùng tộc
 *      (G.amongKin) hay ở khu của tộc khác (G.hostRace: tộc chủ của khu, của nước). Nút có nhãn `tree.race`, chủ đề mới
 *      `stranger` (xa tộc, bị nhìn khác) và `clan` (nợ, thù của tộc); quyết định mở bằng cờ hàng đợi `q` như các mạch cũ.
 *   2. Giọng theo giống loài (G.RACE_VOICE): tám sự kiện chung hay rơi nhất (lễ hội, được mùa, chữ đầu đời, đau lưng tuổi già…)
 *      giữ tác dụng, đổi câu chữ theo giống loài; ở khu của tộc khác thì lễ hội là lễ của tộc chủ nhà, bạn đứng xem.
 * Ba tình trạng mới: Sầu héo (Tiên Tộc, chết vì sầu như Eldar của Tolkien), Khô vảy (Hải Tộc xa biển), Máu lạnh (Long Nhân ở xứ lạnh).
 * Nạp sau story.js: bọc nút mới bằng G.treeWrap, đặt chủ đề vào G.THEMES. Đếm cho sim.html: G.RACEV.stats = true.
 */
window.LifeSim = window.LifeSim || {};
(function (G) {
  const J = window.JobLibrary, DEC = G.DECISIONS;
  const cnt = (S, k, v = 1) => { S.flags[k] = (S.flags[k] || 0) + v; };
  const X0 = S => G.REGION[S.loc];
  const bio = S => X0(S).biome;
  const homeName = (S, X) => { const s = G.here(S).s; return s ? s.name : X.reg(S).nameVi; };
  const isTown = S => { const s = G.here(S).s; return !!s && G.TIER_RANK[s.tier] <= 2 && S.urban !== false; };
  const med = (S, X) => G.median(X.reg(S));
  const raceVi = r => r === 'human' ? 'loài người' : J.races[r].nameVi;
  const nameOf = (X, r) => { const R = G.RACES[r]; return X.name(r, R.sexes.length > 1 ? (X.chance(.5) ? 'm' : 'f') : R.sexes[0]); };
  const first = n => String(n).split(' ')[0];
  const he = sex => sex === 'f' ? 'bà' : 'ông';
  // Cơ hội thắng một trận tay đôi theo sức (sức người lớn trung vị ~1,3).
  const odds = (S, X, base = .4) => G.clamp(base + (X.power(S) - 1.2) * .25, .1, .9);

  // ═════════ Môi trường sống ═════════
  G.RACE_HOME = race => (G.RACE_SETTLE[race] || {}).biomes || [];
  G.raceHome = S => G.RACE_HOME(S.race).includes(bio(S));
  // Tộc chủ nhà của nơi đang ở: tộc của khu dân cư, không có khu thì tộc của nước.
  G.hostRace = S => { const h = G.here(S); return (h.s && h.s.race) || (h.n && h.n.race) || null; };
  // Sống giữa người cùng tộc: khu của tộc mình, hoặc tộc mình đông (≥ 30%) trong khu.
  G.amongKin = S => {
    const h = G.here(S), s = h.s;
    if (s) return s.race === S.race || (s.races && (s.races[S.race] || 0) >= 30);
    return !!h.n && h.n.race === S.race;
  };
  const kin = S => G.amongKin(S), stranger = S => !G.amongKin(S);
  const wary = S => G.attitude(S) === 'wary';
  const seaSide = S => { const s = G.here(S).s; return !!X0(S).coastal || !!(s && (s.seaCells || (s.roles || []).some(r => r === 'port' || r === 'fishing'))); };
  const FOREST = ['elder_wood', 'moss_forest', 'fae_glade'];
  const HUMID = ['mist_coast', 'serpent_bay', 'venom_marsh', 'moss_forest'];
  const host = S => { const r = G.hostRace(S); return r && r !== S.race && !G.RACES[r].undead ? r : 'human'; };

  // ═════════ Tình trạng, nguyên nhân chết mới ═════════
  G.CONDS.grief = { nameVi: 'Sầu héo', mult: 1.6, heal: .12 };
  G.CONDS.dry = { nameVi: 'Khô vảy', mult: 1.4, heal: .35 };
  G.CONDS.torpid = { nameVi: 'Máu lạnh', mult: 1.3, heal: .5 };
  G.CAUSES.grief = { nameVi: 'héo mòn vì sầu', stages: {} };   // stages rỗng: không rơi ngẫu nhiên, chỉ đến từ Sầu héo của Tiên Tộc
  { const p0 = G.Sim.prototype.pickCause;
    G.Sim.prototype.pickCause = function () {
      const S = this.S;
      if (S.race === 'elf' && !S.undead && this.hasCond('grief') && this.rnd() < .5) return { id: 'grief', text: G.CAUSES.grief.nameVi };
      return p0.call(this);
    }; }

  // ═════════ 1. Sự kiện riêng giống loài ═════════
  const EV = [], RACE_EV = G.RACE_EV = {};
  // Một nhóm sự kiện của một giống loài: gắn nhãn race (và body 'flesh' trừ Cơ Nhân) cho mọi nút.
  const add = (race, list) => { for (const e of list) { e.tree = Object.assign({ race: [race] }, race === 'construct' ? {} : { body: 'flesh' }, e.tree || {}); e.race = race; EV.push(e); (RACE_EV[race] = RACE_EV[race] || []).push(e.id); } };
  const decs = {};   // quyết định của file này (id → giống loài), cho trang duyệt
  const dec = (race, id, D) => { D.tree = Object.assign({ race: [race] }, race === 'construct' ? {} : { body: 'flesh' }, D.tree || {}); D.race = race; DEC[id] = D; decs[id] = race; (RACE_EV[race] = RACE_EV[race] || []).push(id); };
  const AD = ['adult', 'elder'], CT = ['child', 'teen'];

  // ─────────── Tiên Tộc ───────────
  // Nguồn: Eldar của Tolkien (không già, chết vì sầu, tiếng mòng biển gọi về phía tây), elf của D&D (không ngủ mà thiền;
  // tên thật đặt khi đã lớn), Dalish của Dragon Age và Bosmer của Elder Scrolls (giao ước không chặt cây sống).
  const ELF_NAME = { ranged: 'người bắn không cần nhìn', arcane: 'người nghe được lá nói', shadow: 'bước chân không vang', beast: 'bạn của hươu rừng' };
  add('elf', [
    { id: 'elf_name', st: ['teen'], w: 5, run(S, X) {
        const m = ELF_NAME[S.path] || 'người còn chưa chọn đường'; X.add('so', 5); X.add('sm', 2);
        return { t: `Bạn ${X.years(S)} tuổi mà vẫn bị gọi bằng tên ở nhà. Tiên Tộc chỉ đặt tên thật khi đã thấy đứa trẻ lớn lên thành người thế nào. Đêm nay các bô lão họp dưới Cây Mẹ và gọi bạn bằng một cái tên có nghĩa là "${m}".`, k: 'big', o: S.path || 'none' }; } },
    { id: 'elf_mortal', st: CT, w: 3, run(S, X) {
        const nm = X.name('human', X.chance(.5) ? 'm' : 'f'); X.add('h', -3); X.add('sm', 4); X.add('so', 3);
        if (G.castAdd) G.castAdd(S, X, { name: nm, race: 'human', role: 'ban', how: 'đứa trẻ loài người chơi với bạn hồi nhỏ', yrs: X.int(22, 34), bond: 40, drive: X.rnd() });
        return { t: `Bạn chơi với ${first(nm)}, đứa trẻ loài người ở làng bìa rừng. Vài mùa đông sau ${first(nm)} cao hơn bạn một cái đầu. Tới lúc bạn bắn được mũi tên đầu tiên trúng đích, ${first(nm)} đã bế con đi chợ.`, k: 'info' }; } },
    { id: 'elf_trance', st: ['teen'], w: 3, run(S, X) { X.gain('Spirit', 4); X.add('hl', 3);
        return { t: 'Bạn học cách nghỉ như người lớn trong tộc: không ngủ, chỉ ngồi lặng bốn tiếng, mắt mở, đầu óc đi lại trong ký ức cũ. Sáng ra bạn tỉnh hơn mọi đêm ngủ say.', k: 'good', f: 'Tiên Tộc không ngủ. Khi thiền họ sống lại ký ức của chính mình, rõ như lúc nó xảy ra.' }; } },
    { id: 'elf_loggers', st: AD, c: S => FOREST.includes(bio(S)) && !S.flags.elfAxeQ, w: 2.2, tree: { theme: 'clan', dir: { vo: 1, dao: 1, gia: .5 } }, run(S, X) {
        S.flags.elfAxeQ = true; return { t: 'Có tiếng rìu ở bìa rừng. Một toán tiều phu loài người đang hạ cây sồi già mà tộc bạn gọi bằng tên.', k: 'info' }; } },
    { id: 'elf_axe_feud', st: AD, w: 3, tree: { from: ['elf_axe:warn'], wait: [1, 4], dir: { vo: 2 } }, run(S, X) {
        if (X.chance(odds(S, X, .45))) { S.fame += 3; X.gain('Bow', 3); return { t: 'Toán tiều phu quay lại, lần này có lính tỉnh đi kèm, mang theo đuốc. Tên của bạn ghim từng ngọn đuốc xuống đất trước khi họ kịp châm. Họ rút về, và không quay lại nữa.', k: 'good', o: 'win' }; }
        X.add('hl', -14); X.money(-Math.round(med(S, X) * .3)); X.add('h', -8);
        return { t: 'Toán tiều phu quay lại với lính tỉnh. Họ đốt một góc rừng để dọn đường; bạn trúng một mũi nỏ khi kéo lũ trẻ ra khỏi khói.', k: 'bad', o: 'lose' }; } },
    { id: 'elf_axe_pact', st: AD, w: 3, tree: { from: ['elf_axe:talk'], wait: [1, 5], dir: { gia: 1, tri: 1, thuong: 1 } }, run(S, X) {
        X.add('so', 6); X.add('h', 6);
        return { t: 'Trưởng toán tiều phu giữ lời. Mỗi cây họ chặt ở rừng tạp, họ trồng lại hai cây. Bạn dạy cho con trai ông ta biết cây nào có tên, cây nào chưa.', k: 'good' }; } },
    { id: 'elf_axe_lost', st: AD, w: 3, tree: { from: ['elf_axe:leave'], wait: [1, 4] }, run(S, X) {
        X.add('h', -6);
        return { t: 'Bìa rừng lùi vào thêm một dặm. Mùa xuân năm nay chim không về làm tổ ở chỗ cây sồi cũ.', k: 'bad' }; } },
    { id: 'elf_sea', st: AD, w: S => seaSide(S) ? 2.5 : .5, tree: { dir: { du: 2, dao: 1 } }, run(S, X) {
        X.add('h', -4); G.trajBump(S, { du: .4 }); S.flags.seaLong = true;
        if (!S.flags.migrateQ && !seaSide(S)) S.flags.migrateQ = 'Tiếng mòng biển không để bạn yên.';
        return { t: 'Lần đầu tiên bạn nghe tiếng mòng biển. Từ đêm đó bạn mơ mãi một bờ biển ở phía tây mà mình chưa từng đặt chân tới.', k: 'big', f: 'Người già trong tộc nói ai đã nghe biển gọi thì không bao giờ hết nhớ biển.' }; } },
    { id: 'elf_grief', st: AD, rep: true, gap: 6, c: (S, X) => !X.hasCond('grief') && ((S.family.spouse && !S.family.spouse.alive) || S.family.kids.some(k => !k.alive)), w: 4, run(S, X) {
        const sp = S.family.spouse && !S.family.spouse.alive ? first(S.family.spouse.name) : null;
        X.cond('grief'); X.add('h', -10);
        return { t: sp ? `${sp} mất đã lâu mà bạn vẫn đặt hai chén trên bàn. Tiên Tộc không quên được gì, nên cũng khó nguôi được gì.` : 'Bạn vẫn nhớ từng ngón tay của đứa con đã mất, rõ như hôm qua. Tiên Tộc không quên được gì, nên cũng khó nguôi được gì.', k: 'bad', f: 'Tiên Tộc không chết vì già. Họ chết vì gươm giáo, hoặc vì sầu.' }; } },
    { id: 'elf_smoke', st: AD, rep: true, gap: 4, c: S => stranger(S) && isTown(S), w: S => wary(S) ? 4 : 2.2, tree: { theme: 'stranger' }, run(S, X) {
        X.add('h', -4); X.add('so', wary(S) ? -4 : -2);
        return { t: wary(S) ? `Lính gác cổng ${homeName(S, X)} bắt bạn kéo mũ trùm xuống cho xem tai, rồi ghi tên bạn vào sổ người lạ. Khói lò rèn bám vào tóc bạn cả tuần.` : `Khói lò rèn ở ${homeName(S, X)} bám vào tóc bạn cả tuần. Người ta hỏi tuổi bạn rồi cười, tưởng bạn đùa.`, k: 'bad' }; } },
    { id: 'elf_deadwood', st: AD, rep: true, gap: 5, c: S => FOREST.includes(bio(S)), w: 1.8, tree: { dir: { vo: 1, nghe: 1 } }, run(S, X) {
        X.gain('Bow', 4); X.add('so', 1);
        return { t: 'Tộc bạn không chặt cây sống. Bạn đi cả tháng nhặt cành gãy sau bão, mới chọn được một cành thủy tùng đủ thẳng để làm cây cung mới.', k: 'good' }; } },
    { id: 'elf_century', st: AD, rep: true, gap: 1, c: (S, X) => X.years(S) >= 200 && Math.floor(X.years(S) / 100) > (S.flags.elfCent || 1), w: 8, run(S, X) {
        const c = Math.floor(X.years(S) / 100); S.flags.elfCent = c; X.add('sm', 3);
        return { t: `Bạn tròn ${c} trăm tuổi. Ngôi làng nơi bạn từng đổi da thú lấy muối giờ đã có tường đá; chủ quán trọ là chắt của người bán muối năm xưa, và ông ta không tin bạn từng gặp cụ mình.`, k: 'info' }; } },
    { id: 'elf_dream', st: AD, rep: true, gap: 6, c: S => G.raceHome(S) && S.flags.custom !== 'lax', w: 1.5, run(S, X) {
        const z = X.reg(S).zones[1] || X.reg(S).zones[0], sp = X.monsterIn(z); X.gain('Arcane', 3); X.add('so', 3);
        return { t: `Trong Mộng Rừng năm nay cả tộc cùng thấy một ${sp.nameVi} đi qua ${z.nameVi}. Khi tỉnh, các thợ săn đã biết nên đặt bẫy ở đâu.`, k: 'good', f: X.factOf(sp) }; } },
    { id: 'elf_stars', st: ['elder'], w: 3, run(S, X) { X.add('sm', 4); X.add('so', 4);
        return { t: 'Các trưởng lão gọi bạn lên đồi để học hát tên sao. Mỗi ngôi sao là một người trong tộc đã đi về phía tây; tới mùa sau bạn sẽ dạy lại cho người khác.', k: 'good' }; } }
  ]);
  dec('elf', 'elf_axe', {
    prio: 5, gap: 1, tree: { q: 'elfAxeQ' },
    when: S => !S.dead && !!S.flags.elfAxeQ,
    build(S, X) {
      return { title: 'Tiếng rìu ở bìa rừng', body: 'Cây sồi ấy đã đứng đó từ trước khi có làng của loài người. Bọn tiều phu không biết nó có tên; với họ, đó là gỗ.',
        choices: [{ k: 'warn', label: 'Bắn tên cảnh cáo', sub: 'Đuổi được họ đi, nhưng họ sẽ quay lại; có thể đông hơn.' },
          { k: 'talk', label: 'Ra gặp trưởng toán', sub: 'Thương lượng: chỉ cho họ rừng tạp, đổi lấy lời hứa trồng lại.' },
          { k: 'leave', label: 'Để mặc', sub: 'Không dính vào chuyện của loài người.' }] };
    },
    apply(S, X, k) {
      S.flags.elfAxeQ = null; cnt(S, 'elfAxe_' + k);
      if (k === 'warn') { X.gain('Bow', 3); X.add('so', -2); G.trajBump(S, { vo: .3 }); return 'Mũi tên cắm vào cán rìu, cách tay người tiều phu một gang. Họ bỏ chạy, nhưng có người ngoái lại nhìn đường vào rừng.'; }
      if (k === 'talk') { X.add('so', 3); return 'Trưởng toán tiều phu nghe bạn nói hết, rồi bảo: "Chúng tôi cũng cần củi qua đông." Hai bên ngồi tới tối để vạch ranh giới.'; }
      X.add('h', -6); return 'Bạn quay lưng đi. Tiếng rìu theo bạn tới tận nhà.';
    },
    auto: S => S.traits.bold > .6 ? 'warn' : S.traits.social > .4 ? 'talk' : 'leave'
  });

  // ─────────── Người Lùn ───────────
  // Nguồn: Dawi của Warhammer (Sổ Thù, lời thề Kẻ Diệt, tổ tiên khắc trên vách), Durin của Tolkien (đào quá sâu, đàn bà cũng có râu),
  // Dwarf Fortress (cơn nhập thần làm ra kiệt tác hoặc phát điên; đào trúng mạch nước, dung nham).
  const dwfMount = S => ['crystal_cave', 'ash_peak', 'frost_tundra', 'storm_spire'].includes(bio(S));
  const dwfHold = S => { const s = G.here(S).s; return !!s && s.race === 'dwarf'; };   // khu Người Lùn: luôn đục vào đồi, núi
  add('dwarf', [
    { id: 'dwf_dark', st: ['child'], w: 4, run(S, X) { X.gain('Stealth', 3); X.add('h', 3);
        return { t: `Cha dẫn bạn xuống tầng sâu nhất của ${homeName(S, X)} rồi tắt đèn. Một lúc sau bạn thấy được vân đá trên vách: mắt Người Lùn sinh ra để nhìn trong tối.`, k: 'good' }; } },
    { id: 'dwf_cup', st: ['child'], w: 3, run(S, X) { X.gain('Engineering', 4); X.add('so', 3);
        return { t: 'Bạn đẽo xong cái cốc đá đầu tiên, méo một bên. Ông nội đặt nó lên kệ, cạnh cốc đầu tay của ông, của cụ, của kỵ.', k: 'good' }; } },
    { id: 'dwf_beard', st: ['teen'], w: 4, run(S, X) { X.add('so', 5);
        return { t: 'Mẹ tết cho bạn bím râu đầu tiên, buộc khoen đồng khắc dấu thị tộc. Từ nay ai giật râu bạn là chuốc thù với cả họ.', k: 'big', f: 'Người Lùn, đàn ông hay đàn bà, đều để râu. Người ngoài thường không phân biệt được.' }; } },
    { id: 'dwf_mood', st: AD, c: S => (S.mastery.Engineering || 0) >= 20 || ['smith', 'miner', 'jeweler', 'sculptor', 'runesmith'].includes(S.work), w: 1.5, tree: { dir: { nghe: 2 } }, run(S, X) {
        const mat = X.pick(['ngọc mắt mèo', 'xương của một con thú lớn', 'bạc trắng', 'đá lửa xanh']), item = X.pick(['một chiếc vương miện bằng đá', 'cái rìu khắc kín rune', 'cánh cửa đồng chạm tích tổ tiên', 'một chiếc cốc trong như nước']);
        const p = .45 + (S.mastery.Engineering || 0) / 200 + (S.gold > med(S, X) ? .2 : 0);
        if (X.chance(p)) { S.gear = Math.min(10, S.gear + 2); S.fame += 5; X.money(Math.round(med(S, X) * 1.5)); cnt(S, 'dwfArt');
          return { t: `Một sáng bạn khóa cửa xưởng, không nói với ai. Bạn đòi ${mat}, và cả thị tộc đi tìm cho bạn. Bốn mươi ngày sau bạn mở cửa, tay cầm ${item}. Thợ cả của thị tộc tự tay khắc tên nó lên vách.`, k: 'big', o: 'art' }; }
        X.add('h', -15); X.cond('frail'); cnt(S, 'dwfMad');
        return { t: `Một sáng bạn khóa cửa xưởng, đòi ${mat}. Không ai tìm được. Bạn đập nát mọi thứ trong xưởng rồi ngồi im suốt ba tháng.`, k: 'bad', o: 'mad', f: 'Người Lùn gọi đó là cơn nhập thần: tay thợ biết mình phải làm gì trước khi đầu biết.' }; } },
    { id: 'dwf_cheat', st: AD, c: S => !S.flags.grudgeQ && !S.flags.grudge, w: 1.6, tree: { theme: 'clan', dir: { thuong: 1, nghe: 1 } }, run(S, X) {
        const r = host(S) === 'dwarf' ? 'human' : host(S), nm = nameOf(X, r), amt = Math.round(med(S, X) * (.3 + .4 * X.rnd()));
        X.money(-Math.min(Math.max(0, S.gold), amt)); S.flags.grudgeQ = { name: nm, race: r, amt };
        return { t: `${nm}, một thương nhân ${raceVi(r)}, nhận hàng của bạn rồi biến mất, không trả ${G.coin(amt)}.`, k: 'bad' }; } },
    { id: 'dwf_grudge_paid', st: AD, w: S => 2 + 2 * S.traits.social, tree: { from: ['dwf_grudge:book'], wait: [2, 12], dir: { thuong: 1, quyen: 1 } }, c: S => !!S.flags.grudge, run(S, X) {
        const g = S.flags.grudge; S.flags.grudge = null; X.money(g.amt * 2); X.add('h', 10); cnt(S, 'grudgeOk');
        return { t: `Nhiều năm sau, ${first(g.name)} xuất hiện ở chợ. Bạn đứng chắn trước mặt; hắn nhận ra bạn và trả đủ cả gốc lẫn lãi, ${G.coin(g.amt * 2)}. Bạn gạch tên hắn khỏi Sổ Thù bằng mực đỏ.`, k: 'good', o: 'paid' }; } },
    { id: 'dwf_grudge_blood', st: AD, w: S => 2 + 3 * S.traits.bold, tree: { from: ['dwf_grudge:book'], wait: [2, 12], dir: { vo: 2 } }, c: S => !!S.flags.grudge, run(S, X) {
        const g = S.flags.grudge; S.flags.grudge = null;
        if (X.chance(odds(S, X, .5))) { X.money(g.amt); S.fame += 2; X.add('h', 6); return { t: `Bạn lần theo ${first(g.name)} qua ba thị trấn và tóm được hắn sau quán rượu. Hắn trả tiền bằng hai cái răng và một túi bạc. Tên hắn được gạch khỏi Sổ Thù.`, k: 'good', o: 'win' }; }
        X.add('hl', -12); X.cond('wound');
        return { t: `Bạn tìm ra ${first(g.name)}, nhưng hắn có đám hộ vệ thuê. Bạn về nhà với cái xương sườn gãy. Tên hắn được viết lại trong Sổ Thù, đậm hơn.`, k: 'bad', o: 'lose' }; } },
    { id: 'dwf_grudge_heir', st: AD, w: 1, tree: { from: ['dwf_grudge:book'], wait: [6, 16] }, c: S => !!S.flags.grudge, run(S, X) {
        const g = S.flags.grudge; S.flags.grudge = null; X.add('so', 2); X.add('h', -3);
        return { t: `Tin đến: ${first(g.name)} đã chết trước khi bạn đòi được nợ. Bạn ghi tiếp tên con hắn vào Sổ Thù. Nợ thì vẫn là nợ.`, k: 'info', o: 'heir' }; } },
    { id: 'dwf_shame', st: AD, c: S => !S.flags.slayer && !S.flags.slayerQ && (S.flags.outcast || S.h < 22 || S.flags.dwfMad), w: 3, run(S, X) {
        S.flags.slayerQ = true;
        return { t: 'Bạn không dám nhìn vào mắt những người tổ tiên khắc trên vách đại sảnh. Đi qua đó bạn cúi đầu.', k: 'bad' }; } },
    { id: 'dwf_flood', st: AD, rep: true, gap: 6, c: S => S.work === 'miner' || (G.raceHome(S) && dwfMount(S)) || dwfHold(S), w: S => S.work === 'miner' ? 2 : .8, tree: { theme: 'hardship' }, run(S, X) {
        const lava = bio(S) === 'ash_peak'; X.add('hl', -6); X.money(-Math.round(med(S, X) * .3));
        if (X.chance(.02)) { X.die({ id: lava ? 'mine' : 'drown', text: lava ? 'bị dung nham tràn vào hầm' : 'chết đuối dưới hầm khi đào trúng mạch nước' }); return null; }
        return lava ? { t: 'Vách hầm nóng lên rồi rỉ ra thứ đá chảy đỏ rực. Cả tổ chạy lên, bỏ lại đồ nghề; ba tầng hầm bị lấp trong một đêm.', k: 'bad' }
          : { t: 'Cuốc của tổ bạn bổ trúng một mạch nước ngầm. Nước dâng tới thắt lưng trong một khắc; cả tổ chạy lên, bỏ lại đồ nghề.', k: 'bad' }; } },
    { id: 'dwf_deep', st: AD, c: S => (S.work === 'miner' || dwfMount(S)) && G.raceHome(S) || dwfHold(S), w: 1, run(S, X) {
        X.add('sm', 3); X.add('h', -3); S.flags.deepSealed = true;
        return { t: 'Tầng dưới cùng của mỏ vọng lên tiếng gõ đều đều, như có ai đang đào ngược lên. Hội đồng thị tộc cho xây tường đá chặn lối, khắc rune cấm lên từng viên.', k: 'info', f: 'Sử Người Lùn chép không ít thành dưới núi bị bỏ hoang vì đào quá sâu.' }; } },
    { id: 'dwf_sky', st: AD, rep: true, gap: 6, c: S => !dwfMount(S) && stranger(S), w: 1.4, tree: { theme: 'stranger' }, run(S, X) {
        X.add('h', -4);
        return { t: `Ở ${homeName(S, X)}, trên đầu không có gì ngoài trời. Đêm đầu bạn ngủ dưới gầm bàn; mấy năm rồi bạn vẫn đi sát chân tường.`, k: 'bad' }; } },
    { id: 'dwf_ale', st: AD, rep: true, gap: 4, c: kin, w: 1.5, tree: { dir: { gia: 1, nghe: 1 } }, run(S, X) { X.add('so', 4); X.add('h', 4);
        return { t: 'Thùng rượu bạn ủ từ ba mùa trước được khui ở đại sảnh. Cả họ uống, rồi cãi nhau tới sáng xem ai ủ ngon nhất.', k: 'good' }; } },
    { id: 'dwf_hall', st: ['elder'], w: 3, run(S, X) {
        const deeds = [S.level >= 20 ? `đạt cấp ${S.level}` : null, S.work && G.WORKS[S.work] ? `làm ${G.WORKS[S.work].nameVi.toLowerCase()}` : null, S.family.kids.length ? `nuôi ${S.family.kids.length} đứa con` : null, S.flags.dwfArt ? 'làm ra một kiệt tác' : null].filter(Boolean);
        S.fame += 2; X.add('so', 4);
        return { t: `Thợ khắc của thị tộc khắc tên bạn lên vách đại sảnh, dưới tên cha mẹ, kèm những việc bạn đã làm: ${deeds.length ? deeds.join(', ') : 'giữ lò không để tắt'}.`, k: 'good' }; } }
  ]);
  dec('dwarf', 'dwf_grudge', {
    prio: 5, gap: 1, tree: { q: 'grudgeQ' },
    when: S => !S.dead && !!S.flags.grudgeQ,
    build(S, X) { const g = S.flags.grudgeQ;
      return { title: 'Sổ Thù', body: `${g.name} quỵt của bạn ${G.coin(g.amt)}. Ở đại sảnh có cuốn Sổ Thù, mỗi trang là một món nợ chưa đòi của thị tộc.`,
        choices: [{ k: 'book', label: 'Ghi tên vào Sổ Thù', sub: 'Nợ sẽ được đòi, có khi bằng tiền, có khi bằng máu, có khi tới đời con.' }, { k: 'forgive', label: 'Bỏ qua', sub: 'Người trong tộc sẽ nhìn bạn như nhìn một Người Lùn không râu.' }] }; },
    apply(S, X, k) { const g = S.flags.grudgeQ; S.flags.grudgeQ = null; cnt(S, 'grudge_' + k);
      if (k === 'book') { S.flags.grudge = g; X.add('so', 3); return `Bạn viết tên ${first(g.name)} vào Sổ Thù, ghi rõ ngày, rõ số bạc. Mực khô thì sổ được khóa lại.`; }
      X.add('so', -6); X.add('h', 3); return 'Bạn bảo thôi. Ông chú lắc đầu, bỏ ra khỏi phòng không nói gì.'; },
    auto: S => S.traits.social > .8 && S.traits.bold < .3 ? 'forgive' : 'book'
  });
  dec('dwarf', 'dwf_slayer', {
    prio: 4, gap: 1, tree: { q: 'slayerQ' },
    when: S => !S.dead && !!S.flags.slayerQ && !S.flags.slayer,
    build(S, X) {
      return { title: 'Lời thề Kẻ Diệt', body: 'Người Lùn mang nhục chỉ có một cách gột: cạo đầu, nhuộm chỏm tóc màu lửa, đi tìm một cái chết đáng được khắc tên. Kẻ Diệt chết dưới tay quái lớn thì tên được trả về cho thị tộc.',
        choices: [{ k: 'oath', label: 'Thề làm Kẻ Diệt', sub: 'Thị tộc nhận lại bạn như người đang đi chuộc lỗi; bạn đánh không lùi bước. Chết trận thì tên được khắc lại.' }, { k: 'no', label: 'Sống tiếp với nỗi nhục', sub: '' }] }; },
    apply(S, X, k) { S.flags.slayerQ = null; cnt(S, 'slayer_' + k);
      if (k !== 'oath') { X.add('h', -4); return 'Bạn giữ tóc. Đi qua đại sảnh bạn vẫn cúi đầu.'; }
      S.flags.slayer = true; S.flags.outcast = false; X.gain('Axe', 8); X.gain('Body', 6); X.add('h', 10); G.trajBump(S, { vo: .6 });
      return 'Bạn cạo đầu, nhuộm chỏm tóc còn lại bằng son đỏ, vác rìu lên vai. Lần đầu sau nhiều năm bạn ngủ được một mạch tới sáng.'; },
    auto: S => S.traits.bold > .45 ? 'oath' : 'no'
  });
  { const base = G.onDeath; G.onDeath = (S, X) => { if (base) base(S, X); if (S.flags && S.flags.slayer && S.causeId === 'monster') { cnt(S, 'slayerEnd'); X.log('Kẻ Diệt đã tìm được cái chết của mình. Thị tộc khắc lại tên bạn lên vách đại sảnh.', 'big'); } }; }

  // ─────────── Orc ───────────
  // Nguồn: Orc của Warcraft (tổ tiên nói trong gió, thách đấu tay đôi, trại bị đuổi khỏi thành người), Orsimer của Elder Scrolls
  // (giá máu, tên đổi theo việc làm), Warhammer (Cơn Gầm Lớn khi các trại họp lại), hệ Nemesis của Shadow of Mordor
  // (kẻ thua quay lại mang vết sẹo bạn để lại).
  const ORC_NAME = { Axe: 'Chẻ Sọ', Sword: 'Lưỡi Mẻ', Spear: 'Xiên Gió', Bow: 'Mắt Diều', Throwing: 'Ném Trúng', Riding: 'Cưỡi Sói', Taming: 'Gọi Thú', Stealth: 'Bóng Cỏ', Dagger: 'Nanh Thầm', Spirit: 'Nghe Gió', Unarmed: 'Nắm Đá', Body: 'Đá Lăn' };
  add('orc', [
    { id: 'orc_scar', st: ['child'], w: 3, run(S, X) { X.add('hl', -3); X.gain('Body', 3); X.add('so', 3);
        return { t: 'Con sói của trại cắn rách vai bạn. Mẹ khâu lại bằng gân, rồi đi khoe vết sẹo khắp trại như khoe chiến lợi phẩm.', k: 'info' }; } },
    { id: 'orc_runt', st: ['child'], w: 2, run(S, X) { X.gain('Stealth', 3); X.gain('Dagger', 2); X.add('h', -2);
        return { t: 'Bạn nhỏ nhất trong lứa nên được ăn sau cùng. Bạn học cách giành miếng thịt bằng mưu, vì nắm đấm chưa đủ to.', k: 'info' }; } },
    { id: 'orc_name', st: ['teen'], w: 4, run(S, X) {
        const d = X.dominant(S), n = ORC_NAME[d && d.skill] || 'Đá Lăn'; S.flags.orcName = n; X.add('so', 5);
        return { t: `Trại gọi bạn là ${X.given(S)} ${n}, theo việc bạn làm mùa ấy. Tên lúc sinh từ nay chỉ còn mẹ gọi.`, k: 'big', f: 'Orc không giữ tên từ lúc sinh tới lúc chết. Tên đi theo việc làm, và có thể đổi.' }; } },
    { id: 'orc_wind', st: ['teen'], c: S => G.raceHome(S) || kin(S), w: 3, run(S, X) { X.gain('Spirit', 4); X.add('sm', 2);
        return { t: 'Bà đồng của trại đưa bạn lên gò cao, bắt ngồi im cho tới khi nghe được tổ tiên nói trong gió. Tới đêm thứ ba bạn nghe thấy, hoặc tưởng là nghe thấy.', k: 'good' }; } },
    { id: 'orc_rival', st: ['adult'], c: S => !S.flags.orcRival, w: 2.5, tree: { dir: { vo: 2 } }, run(S, X) {
        const nm = X.name('orc', 'm'); S.flags.orcRival = { name: nm };
        if (G.castAdd) G.castAdd(S, X, { name: nm, race: 'orc', role: 'doi', how: 'kẻ bạn bẻ gãy nanh trong trận vật', yrs: X.years(S) + X.int(-2, 3), tier: Math.max(0, X.ctier(S)), work: 'adventurer', bond: -30, drive: .7 + .3 * X.rnd() });
        S.fame += 1; return { t: `Trong trận vật ở hội tộc, bạn quật ${first(nm)} gãy một chiếc nanh. Hắn bò dậy, nhổ máu, chỉ tay vào mặt bạn mà không nói gì.`, k: 'good' }; } },
    { id: 'orc_rival_back', st: AD, w: S => 2 + 3 * S.traits.bold, tree: { from: ['orc_rival'], wait: [2, 7], dir: { vo: 2 } }, run(S, X) {
        const nm = first(S.flags.orcRival.name);
        if (X.chance(odds(S, X, .42))) { S.fame += 4; X.add('so', 3); cnt(S, 'rivalWin');
          return { t: `${nm} quay lại, to hơn trước, chiếc nanh gãy bọc sắt. Hắn đã thắng ba trận ở vùng khác chỉ để được đánh bạn. Lần này bạn bẻ nốt chiếc nanh còn lại.`, k: 'good', o: 'win' }; }
        X.add('hl', -15); X.cond('wound'); X.add('h', -5); cnt(S, 'rivalLose');
        return { t: `${nm} quay lại, to hơn trước, chiếc nanh gãy bọc sắt. Hắn quật bạn xuống bùn trước cả trại, rồi bỏ đi mà không thèm lấy gì.`, k: 'bad', o: 'lose' }; } },
    { id: 'orc_rival_brother', st: AD, w: S => 1 + 3 * S.traits.social, tree: { from: ['orc_rival'], wait: [2, 7], dir: { gia: 1, du: 1 } }, run(S, X) {
        const nm = first(S.flags.orcRival.name), p = (S.cast || []).find(c => c.name === S.flags.orcRival.name); if (p) { p.bond = 60; p.role = 'ban'; p.how = 'anh em kết nghĩa, kẻ bạn từng bẻ gãy nanh'; }
        X.add('so', 6); X.add('h', 5);
        return { t: `${nm} mang tới một vò rượu sữa ngựa. Hai người uống chung một chiếc sừng. Ở tộc Orc, kẻ từng làm mình chảy máu có thể thành anh em.`, k: 'good', o: 'brother' }; } },
    { id: 'orc_rival_dead', st: AD, w: 1, tree: { from: ['orc_rival'], wait: [3, 9] }, run(S, X) {
        X.add('h', -2); const p = (S.cast || []).find(c => c.name === S.flags.orcRival.name); if (p) p.alive = false;
        return { t: `Tin về trại: ${first(S.flags.orcRival.name)} chết trong một trận săn ở vùng khác. Không còn ai đòi đánh bạn nữa, và bạn thấy thiếu thiếu.`, k: 'info', o: 'dead' }; } },
    { id: 'orc_gather', st: ['adult'], rep: true, gap: 8, c: S => G.raceHome(S) || kin(S), w: S => .8 + G.local(S).war * 4 + G.local(S).raid * 4, tree: { theme: 'war', dir: { vo: 2 } }, run(S, X) {
        X.gain('Axe', 4); X.gain('Body', 3); X.money(Math.round(med(S, X) * .3)); X.add('hl', -4); X.add('so', 3);
        return { t: 'Mười hai trại kéo về một thung lũng, giáo gõ vào khiên suốt ba ngày. Khi cả thảo nguyên cùng gầm, ai cũng thấy mình to ra một chút. Mùa ấy đám đông đi tới đâu, của cải theo về tới đó.', k: 'big' }; } },
    { id: 'orc_scorn', st: AD, rep: true, gap: 4, c: S => stranger(S) && isTown(S), w: S => wary(S) ? 4 : 2.2, tree: { theme: 'stranger' }, run(S, X) {
        X.add('h', -4); X.add('so', -3); X.money(-Math.round(med(S, X) * .05));
        return { t: `Người bán hàng ở ${homeName(S, X)} tính giá bạn gấp đôi, lính gác đi theo bạn qua hai con phố. Một bà mẹ kéo con vào nhà khi bạn đi qua.`, k: 'bad' }; } },
    { id: 'orc_drought', st: AD, rep: true, gap: 5, c: S => ['wind_steppe', 'red_desert'].includes(bio(S)) && (S.urban === false || !isTown(S)), w: 2, tree: { theme: 'hardship' }, run(S, X) {
        X.add('hl', -5); X.gain('Riding', 2); G.trajBump(S, { du: .2 });
        return bio(S) === 'red_desert' ? { t: 'Giếng của trại cạn. Cả trại nhổ lều, đi theo đàn lạc đà hoang tìm mạch nước mới, mất bảy ngày không có bóng râm.', k: 'bad' }
          : { t: 'Mùa khô kéo dài, đàn bò rừng không về bãi cỏ cũ. Cả trại nhổ lều đi theo dấu chân chúng hơn trăm dặm.', k: 'bad' }; } },
    { id: 'orc_blood', st: AD, c: S => !S.flags.priceQ, w: 1.4, tree: { theme: 'clan' }, run(S, X) {
        S.flags.priceQ = { cost: Math.round(med(S, X) * .8) };
        return { t: 'Em họ bạn say rượu, đánh chết một người của trại bên. Sáng ra trại bên cử người sang đòi giá máu.', k: 'bad' }; } },
    { id: 'orc_feud', st: AD, w: 4, tree: { from: ['orc_price:refuse'], wait: [1, 4] }, run(S, X) {
        X.add('hl', -8); X.money(-Math.round(med(S, X) * .4)); X.add('h', -6);
        return { t: 'Trại bên đốt lều của họ bạn trong một đêm không trăng và lùa mất nửa đàn ngựa. Giờ thì hai bên đều có người chết.', k: 'bad' }; } },
    { id: 'orc_elder', st: ['elder'], w: 4, run(S, X) { X.add('so', 6); S.fame += 2; X.add('sm', 2);
        return { t: `Ở tộc Orc ít ai sống tới ${X.years(S)} tuổi. Lũ trẻ gọi bạn là "Người Già" như gọi một chức danh, và đứng dậy khi bạn bước vào lều.`, k: 'good' }; } }
  ]);
  dec('orc', 'orc_price', {
    prio: 5, gap: 1, tree: { q: 'priceQ' },
    when: S => !S.dead && !!S.flags.priceQ,
    build(S, X) { const c = S.flags.priceQ.cost;
      return { title: 'Giá máu', body: `Trại bên đòi giá máu cho người đã chết: hoặc ${G.coin(c)}, hoặc một người trong họ bạn ra vòng đấu với anh trai của người chết.`,
        choices: [{ k: 'pay', label: `Trả ${G.coin(c)}`, sub: S.gold >= c ? 'Món nợ khép lại.' : 'Không đủ tiền: phải vay.' }, { k: 'fight', label: 'Ra vòng đấu thay em họ', sub: 'Thắng thì nợ xóa và cả hai trại nhớ mặt bạn.' }, { k: 'refuse', label: 'Không trả', sub: 'Hai trại thành thù.' }] }; },
    apply(S, X, k) { const c = S.flags.priceQ.cost; S.flags.priceQ = null; cnt(S, 'price_' + k);
      if (k === 'pay') { X.money(-c); X.add('so', 3); return 'Bạn đặt túi bạc trước lều trại bên. Họ đếm, rồi nhổ nước bọt xuống đất: ở tộc Orc, như thế là xong.'; }
      if (k === 'fight') { if (X.chance(odds(S, X, .45))) { X.add('so', 6); S.fame += 2; return 'Bạn quật anh trai người chết xuống ba lần, lần nào cũng để anh ta đứng dậy. Lần thứ tư anh ta không đứng dậy nữa và xin thôi. Nợ xóa.'; }
        X.add('hl', -15); X.cond('wound'); X.add('so', 2); return 'Bạn thua, gãy tay, nhưng đã ra vòng. Trại bên nhận như thế là đủ.'; }
      X.add('so', -8); return 'Bạn bảo người say giết người là việc của người say. Sứ giả trại bên quay ngựa, không chào.'; },
    auto: (S, X, d) => S.traits.bold > .6 ? 'fight' : S.gold >= S.flags.priceQ.cost ? 'pay' : S.traits.bold > .35 ? 'fight' : 'refuse'
  });

  // ─────────── Người Thú ───────────
  // Nguồn: Khajiit của Elder Scrolls (hình dáng theo tuần trăng lúc sinh), Tabaxi, Shifter của D&D (mũi thính, bản năng thú),
  // bầy sói (con đầu đàn, tiếng hú), Zootopia và nhiều truyện khác về loài có nanh bị coi là nguy hiểm trong thành người.
  const MOON = [['trăng tròn', 'móng sắc, đánh trước nghĩ sau', 'Unarmed'], ['trăng khuyết', 'bước êm, đi đâu cũng không ai nghe', 'Stealth'], ['đêm không trăng', 'nhìn trong tối như ban ngày', 'Bow'], ['trăng đôi', 'chạy cùng gió, cưỡi được mọi con thú', 'Riding']];
  add('beastfolk', [
    { id: 'bst_moon', st: ['infant'], w: 6, run(S, X) { const m = X.pick(MOON); S.flags.moon = m[0]; X.gain(m[2], 3);
        return { t: `Bạn sinh vào ${m[0]}. Bà đỡ của bầy ra xem trời rồi nói bạn sẽ ${m[1]}.`, k: 'big', f: 'Người Thú tin tuần trăng lúc sinh quyết định đứa trẻ giống con thú nào trong tổ tiên.' }; } },
    { id: 'bst_nose', st: ['child'], w: 3, run(S, X) { X.gain('Stealth', 2); X.add('so', 3);
        return { t: 'Bạn ngửi thấy mùi mưa trước khi mây kéo tới, mùi sói trước khi chó sủa. Người lớn bắt đầu hỏi ý bạn trước mỗi chuyến vào rừng.', k: 'good' }; } },
    { id: 'bst_howl', st: CT, c: S => kin(S) || G.raceHome(S), w: 3, run(S, X) { X.add('so', 5); X.add('h', 5);
        return { t: 'Đêm trăng tròn, bạn hú cùng bầy lần đầu. Giọng bạn vỡ giữa chừng; cả bầy hú theo cho tròn tiếng.', k: 'good' }; } },
    { id: 'bst_totem', st: ['teen'], c: kin, w: 3, run(S, X) { const a = X.pick(['sói', 'báo', 'gấu', 'cáo', 'linh dương']); S.flags.totem = a; X.gain('Spirit', 3); X.add('so', 4);
        return { t: `Bạn được khắc hình con ${a} lên cột totem lớn, ngay dưới hình của mẹ. Từ nay hồn con ${a} đi cùng bạn.`, k: 'big' }; } },
    { id: 'bst_molt', st: ['teen', 'adult'], rep: true, gap: 4, w: 1.6, run(S, X) {
        X.add('h', -2); if (stranger(S) && isTown(S)) { X.money(-Math.round(med(S, X) * .04)); return { t: `Mùa thay lông tới. Chủ nhà trọ ở ${homeName(S, X)} bắt bạn trả thêm tiền giặt chăn, và treo tấm biển "Không nhận khách rụng lông".`, k: 'bad' }; }
        return { t: 'Mùa thay lông tới. Lông rụng thành từng búi, ngứa tới mức bạn cọ lưng vào gốc cây như con gấu.', k: 'info' }; } },
    { id: 'bst_alpha_old', st: AD, c: S => kin(S) && !S.flags.alphaQ && !S.flags.alpha, w: 1.6, tree: { dir: { vo: 1, quyen: 2, gia: .5 } }, run(S, X) {
        S.flags.alphaQ = true; return { t: 'Con đầu đàn đã già, răng mòn, nhưng vẫn chia mồi như hai mươi năm trước. Lũ trẻ trong bầy bắt đầu nhìn sang bạn.', k: 'info' }; } },
    { id: 'bst_alpha_rule', st: AD, w: 3, tree: { from: ['bst_alpha:challenge'], wait: [2, 8], dir: { quyen: 2, gia: 1 } }, c: S => !!S.flags.alpha, run(S, X) { X.add('so', 5); G.trajBump(S, { quyen: .3 });
        return { t: 'Mùa đói, bạn chia mồi cho con yếu nhất trước, như con đầu đàn cũ từng làm. Cả bầy nhìn thấy, và không ai còn nghĩ tới chuyện thách bạn.', k: 'good' }; } },
    { id: 'bst_alpha_pass', st: AD, w: 3, tree: { from: ['bst_alpha:back'], wait: [2, 8] }, run(S, X) { X.add('so', 6); S.fame += 2;
        return { t: 'Con đầu đàn già chết trong giấc ngủ, đầu gối lên chân bạn. Trước khi chết nó gọi tên bạn hai lần, cho cả bầy nghe.', k: 'big' }; } },
    { id: 'bst_muzzle', st: AD, rep: true, gap: 4, c: S => stranger(S) && isTown(S), w: S => wary(S) ? 4 : 2.2, tree: { theme: 'stranger' }, run(S, X) {
        X.add('h', wary(S) ? -6 : -3); X.add('so', -2);
        return wary(S) ? { t: `Luật ở ${homeName(S, X)} bắt người có nanh đeo rọ mõm khi vào chợ. Bạn đeo, vì cần mua muối.`, k: 'bad' }
          : { t: `Chó trong phố ${homeName(S, X)} sủa theo bạn suốt hai con đường. Một đứa trẻ hỏi mẹ bạn có cắn không.`, k: 'bad' }; } },
    { id: 'bst_poacher', st: AD, rep: true, gap: 6, w: S => .8 + X0(S).danger * 1.5 + (stranger(S) ? .6 : 0), tree: { dir: { vo: 1, du: 1 } }, run(S, X) {
        if (X.chance(odds(S, X, .5))) { X.money(Math.round(med(S, X) * .4)); S.fame += 2; return { t: 'Một toán săn trộm theo dấu bạn ba ngày. Đêm thứ ba bạn vòng ra sau lưng chúng. Sáng hôm sau chúng bỏ lại bẫy, lưới, và cả túi tiền.', k: 'good' }; }
        X.add('hl', -14); X.cond('wound');
        return { t: 'Một toán săn trộm theo dấu bạn ba ngày. Ở chợ đen, da của Người Thú bán được giá cao. Bạn thoát được, với một mũi tên trong đùi.', k: 'bad' }; } },
    { id: 'bst_herd', st: AD, rep: true, gap: 5, c: S => G.raceHome(S), w: 1.8, tree: { dir: { du: 1, vo: .5, nghe: .5 } }, run(S, X) {
        if (bio(S) === 'wind_steppe') { X.gain('Riding', 3); G.trajBump(S, { du: .2 }); return { t: 'Bầy theo đàn linh dương di cư qua thảo nguyên suốt một mùa, ngủ dưới trời, săn khi đàn dừng uống nước.', k: 'good' }; }
        X.money(Math.round(med(S, X) * .2)); return { t: 'Mùa nấm cục. Cả bầy vào rừng sâu đánh hơi dưới gốc sồi; bạn đào được nhiều nhất, đổi được một bao muối.', k: 'good' }; } },
    { id: 'bst_teeth', st: ['elder'], w: 3, run(S, X) { X.add('hl', -3);
        if (kin(S)) { X.add('so', 4); return { t: 'Răng bạn mòn tới mức không xé nổi thịt sống. Bầy nhai mềm thịt rồi đưa cho bạn, như bạn từng làm cho cha mẹ.', k: 'info' }; }
        X.add('h', -4); return { t: 'Răng bạn mòn tới mức không xé nổi thịt sống. Bạn mua cháo ở quán và ăn một mình.', k: 'bad' }; } }
  ]);
  dec('beastfolk', 'bst_alpha', {
    prio: 5, gap: 1, tree: { q: 'alphaQ' },
    when: S => !S.dead && !!S.flags.alphaQ,
    build(S, X) {
      return { title: 'Con đầu đàn đã già', body: 'Ở bầy, ngôi đầu đàn không truyền cho con. Ai muốn thì thách, trước mặt cả bầy, dưới trăng.',
        choices: [{ k: 'challenge', label: 'Thách con đầu đàn', sub: 'Thắng thì dẫn bầy; thua thì mang thương và mất mặt.' }, { k: 'back', label: 'Đứng sau con đầu đàn', sub: 'Giữ bầy yên tới ngày nó tự lui.' }] }; },
    apply(S, X, k) { S.flags.alphaQ = null; cnt(S, 'alpha_' + k);
      if (k === 'back') { X.add('so', 4); return 'Bạn đứng sau con đầu đàn ở lần họp bầy kế tiếp. Lũ trẻ thôi nhìn sang.'; }
      if (X.chance(odds(S, X, .5))) { S.flags.alpha = true; X.add('so', 8); S.fame += 4; G.trajBump(S, { quyen: .5 });
        return 'Hai bên vờn nhau tới khi trăng lên đỉnh. Con đầu đàn già cúi đầu trước, rồi tự lùi về cuối bầy.'; }
      X.add('hl', -15); X.cond('wound'); X.add('so', -4); return 'Con đầu đàn già vẫn còn nanh. Bạn nằm liếm vết thương nửa mùa.'; },
    auto: S => S.traits.bold > .55 ? 'challenge' : 'back'
  });

  // ─────────── Yêu Tinh ───────────
  // Nguồn: văn học dân gian Ireland, Scotland, Anh (tên thật, sắt lạnh, lời cảm ơn là nhận nợ, vòng nấm làm lệch thời gian,
  // đình Seelie / Unseelie, Tam Lin: bảy năm một lần đình nộp một linh hồn), bài thơ "La Belle Dame sans Merci" (người phàm
  // yêu Yêu Tinh rồi héo mòn), truyện Holly Black (giao kèo không thể quỵt).
  add('fae', [
    { id: 'fae_truename', st: ['child'], w: 4, run(S, X) { X.add('sm', 3); S.flags.truename = true;
        return { t: 'Mẹ ghé tai nói tên thật của bạn, đúng một lần. Ai biết cái tên ấy có thể sai khiến bạn, nên từ nay bạn sẽ không nói nó ra, kể cả trong mơ.', k: 'big', f: 'Yêu Tinh nào cũng có hai tên: tên để gọi và tên thật. Biết tên thật của ai là nắm dây cương của người đó.' }; } },
    { id: 'fae_glamour', st: ['teen'], w: 3, run(S, X) { X.gain('Stealth', 4); X.gain('Arcane', 2);
        return { t: 'Bạn học cách làm cho mình trông như người khác: cao hơn, già hơn, có lúc như một đứa trẻ loài người. Lần đầu làm được, mẹ bạn đi ngang qua mà không nhận ra.', k: 'good' }; } },
    { id: 'fae_wings', st: ['teen'], w: 3, run(S, X) {
        if (['storm_spire', 'mist_coast', 'frost_tundra'].includes(bio(S))) { X.add('hl', -6); return { t: 'Cánh bạn mở hết vào một sáng sương. Bạn bay lên được ba sải thì gặp gió lớn; một bên cánh rách, phải đợi một mùa mới lành.', k: 'bad' }; }
        X.add('hl', -2); X.add('h', 6); return { t: 'Cánh bạn mở hết vào một sáng sương. Bạn bay được tới ngọn cây rồi rơi xuống bụi gai, cười tới đau bụng.', k: 'good' }; } },
    { id: 'fae_iron', st: ['child', 'teen', 'adult'], rep: true, gap: 4, c: S => stranger(S) && isTown(S), w: 2.2, tree: { theme: 'stranger' }, run(S, X) { X.add('hl', -5); X.add('h', -3);
        return { t: `Nhà nào ở ${homeName(S, X)} cũng đóng móng ngựa sắt trên cửa. Bạn lỡ tay chạm vào then sắt ở quán trọ; vết bỏng nhức suốt một mùa.`, k: 'bad', f: 'Sắt lạnh làm bỏng Yêu Tinh. Loài người biết điều đó từ lâu.' }; } },
    { id: 'fae_thanks', st: AD, c: stranger, w: 1.5, run(S, X) { X.add('h', 2); X.add('so', 2);
        return { t: `Một người ${raceVi(host(S))} cảm ơn bạn vì đã chỉ đường. Ở trảng, cảm ơn có nghĩa là nhận mình mắc nợ. Bạn suýt hỏi họ định trả bằng gì.`, k: 'info' }; } },
    { id: 'fae_ring', st: AD, rep: true, gap: 4, c: S => G.raceHome(S), w: 2, tree: { dir: { phap: 1, gia: .5, du: .5 } }, run(S, X) { X.gain('Spirit', 2); X.add('so', 3); X.add('h', 4);
        return { t: 'Bạn dẫn điệu nhảy trong vòng nấm suốt đêm hội. Ba người loài người lạc vào nhảy theo. Bạn nhớ thả họ ra trước khi trời sáng; lần nào bạn cũng nhớ.', k: 'good', f: 'Người phàm nhảy trong vòng nấm một đêm, ra ngoài có khi đã qua bảy năm.' }; } },
    { id: 'fae_court_call', st: ['adult'], c: S => !S.flags.court && !S.flags.courtQ && (kin(S) || G.raceHome(S)), w: 4, run(S, X) {
        S.flags.courtQ = true; return { t: 'Sứ giả của hai đình cùng tới trước cửa nhà bạn trong một đêm: một người mang hoa, một người mang băng.', k: 'info' }; } },
    { id: 'fae_midsummer', st: AD, w: 3, tree: { from: ['fae_court:summer'], wait: [2, 8], dir: { gia: 1, phap: 1 } }, run(S, X) { X.add('so', 6); X.add('h', 8); X.gain('Spirit', 2);
        return { t: 'Đêm ngắn nhất năm, đình Hạ mở hội tới sáng. Bạn được giao giữ lời thề của hai người loài người cưới nhau trong vòng nấm.', k: 'good' }; } },
    { id: 'fae_tithe', st: AD, w: 3, tree: { from: ['fae_court:winter'], wait: [3, 10], dir: { am: 1, vo: 1 } }, run(S, X) {
        const nm = X.name('human', 'm');
        if (S.traits.social > .45 || S.traits.pious > .6) { X.add('hl', -10); X.add('so', 8); S.fame += 3; cnt(S, 'titheSave');
          return { t: `Bảy năm một lần đình Đông nộp một linh hồn cho Vực Sâu. Năm nay họ rút tên ${first(nm)}, một chàng trai loài người bạn quen. Đêm ấy bạn ôm chặt anh ta khi đình biến anh thành rắn, thành sắt nung, thành lửa. Sáng ra anh vẫn là người.`, k: 'big', o: 'saved' }; }
        X.add('h', -10); G.trajBump(S, { am: .3 }); cnt(S, 'titheLet');
        return { t: `Bảy năm một lần đình Đông nộp một linh hồn cho Vực Sâu. Năm nay họ rút tên ${first(nm)}, một chàng trai loài người bạn quen. Bạn đứng nhìn đoàn rước đi qua, không nói gì.`, k: 'bad', o: 'let', f: 'Người ta kể có lần một cô gái giữ chặt người yêu suốt đêm rước, và đình phải trả anh ta lại.' }; } },
    { id: 'fae_plea', st: AD, c: S => !S.flags.dealQ && !S.flags.deal, w: 1.8, tree: { dir: { phap: 1, am: 1, thuong: 1 } }, run(S, X) {
        const r = host(S) === 'fae' ? 'human' : host(S), nm = nameOf(X, r); S.flags.dealQ = { name: nm, race: r };
        return { t: `${first(nm)}, một người ${raceVi(r)}, tìm vào trảng xin bạn giúp: con gái họ ốm, không thầy thuốc nào chữa được.`, k: 'info' }; } },
    { id: 'fae_deal_kept', st: AD, w: 3, tree: { from: ['fae_deal:memory'], wait: [1, 6] }, run(S, X) { X.add('so', 4); X.add('h', 3);
        return { t: `Mấy năm sau, con gái của ${first(S.flags.deal.name)} tìm vào trảng cảm ơn bạn. Mẹ cô không còn nhớ ngày cưới của mình, nhưng cô thì còn sống.`, k: 'good' }; } },
    { id: 'fae_deal_cheat', st: AD, w: 3, tree: { from: ['fae_deal:gold'], wait: [1, 4], dir: { am: 1 } }, run(S, X) {
        X.gain('Curse', 3); X.money(Math.round(med(S, X) * .5)); G.trajBump(S, { am: .3 });
        return { t: `${first(S.flags.deal.name)} không trả nốt phần còn lại. Bạn cho bò nhà họ cạn sữa ba năm, giếng nhà họ đắng nước, cho tới khi họ mang đủ vàng vào trảng. Giao kèo với Yêu Tinh không ai quỵt được.`, k: 'info' }; } },
    { id: 'fae_lover', st: ['adult'], w: 1.2, tree: { theme: 'romance' }, run(S, X) { X.add('h', -6); X.add('so', -2);
        const sx = X.chance(.5) ? 'm' : 'f', nm = X.name('human', sx);
        return { t: `${first(nm)}, một ${sx === 'm' ? 'chàng trai' : 'cô gái'} loài người, theo bạn vào trảng và ở lại một mùa. Về làng rồi, ${first(nm)} không ăn được món gì của người nữa, chiều nào cũng ra bìa rừng đứng đợi.`, k: 'bad' }; } },
    { id: 'fae_seasons', st: ['elder'], w: 3, run(S, X) { X.add('so', 5); X.add('sm', 3);
        return { t: 'Bạn không còn đếm được mình đã dự bao nhiêu mùa hội. Ở đình người ta gọi bạn là Gốc Già, và để bạn nói trước mọi người.', k: 'good' }; } }
  ]);
  dec('fae', 'fae_court', {
    prio: 5, gap: 1, tree: { q: 'courtQ' },
    when: S => !S.dead && !!S.flags.courtQ,
    build(S, X) {
      return { title: 'Đình Hạ hay Đình Đông', body: 'Tới tuổi này Yêu Tinh phải chọn đình. Đình Hạ ca hát, chữa lành, giữ lời hứa với hoa trái. Đình Đông giữ đêm dài, lời nguyền và những món nợ chưa đòi.',
        choices: [{ k: 'summer', label: 'Theo Đình Hạ', sub: 'Phép chữa lành, tiếng hát; được bạn bè.' }, { k: 'winter', label: 'Theo Đình Đông', sub: 'Lời nguyền, bóng tối; bảy năm một lần đình nộp một linh hồn.' }] }; },
    apply(S, X, k) { S.flags.courtQ = null; S.flags.court = k; cnt(S, 'court_' + k);
      if (k === 'summer') { X.gain('Arcane', 4); X.gain('Spirit', 3); X.add('so', 4); return 'Bạn nhận cành hoa. Sáng hôm sau cánh bạn ngả màu nắng.'; }
      X.gain('Curse', 4); X.gain('Stealth', 3); G.trajBump(S, { am: .4 }); return 'Bạn nhận mảnh băng. Nó không tan trong tay bạn, kể cả giữa hè.'; },
    auto: S => S.traits.social > .6 || S.traits.pious > .6 ? 'summer' : S.traits.bold > .45 || S.traits.social < .3 ? 'winter' : 'summer'
  });
  dec('fae', 'fae_deal', {
    prio: 5, gap: 1, tree: { q: 'dealQ' },
    when: S => !S.dead && !!S.flags.dealQ,
    build(S, X) { const d = S.flags.dealQ;
      return { title: 'Giao kèo', body: `${d.name} xin bạn cứu con gái. Yêu Tinh không giúp ai không công; giá phải nói trước, và đã nói là phải trả.`,
        choices: [{ k: 'memory', label: 'Lấy một ký ức', sub: 'Ngày đẹp nhất đời người mẹ. Phép của bạn mạnh thêm.' }, { k: 'gold', label: 'Lấy vàng', sub: `Một nửa trước, một nửa sau. Người ta hay quên nửa sau.` }, { k: 'free', label: 'Giúp không lấy gì', sub: 'Người phàm biết ơn; đình cười bạn.' }] }; },
    apply(S, X, k) { const d = S.flags.dealQ; S.flags.dealQ = null; S.flags.deal = d; cnt(S, 'deal_' + k);
      if (k === 'memory') { X.gain('Arcane', 3); X.add('sm', 3); X.add('so', -2); return `Bạn rút ký ức ra như rút một sợi chỉ. ${first(d.name)} đứng ngẩn ra một lúc, rồi chạy về với con.`; }
      if (k === 'gold') { X.money(Math.round(med(S, X) * .6)); return 'Bạn nhận nửa túi vàng và ghi lời hứa lên một chiếc lá.'; }
      X.add('so', 6); X.add('h', 4); return 'Bạn chữa cho đứa bé rồi đuổi người mẹ về trước khi bà kịp cảm ơn.'; },
    auto: S => S.traits.social > .6 ? 'free' : S.traits.studious > .5 ? 'memory' : 'gold'
  });

  // ─────────── Hải Tộc ───────────
  // Nguồn: "Nàng tiên cá" của Andersen, selkie trong văn học dân gian Scotland, Ireland (áo da bị giấu, phải ở lại trên cạn,
  // tìm lại áo thì về biển), siren của Odyssey (hát gọi tàu vào đá), merrow, truyện người đi biển về tiếng hát cá voi.
  add('merfolk', [
    { id: 'mer_gills', st: ['infant', 'child'], w: 5, run(S, X) { X.add('hl', 4); X.add('h', 4);
        return { t: 'Mẹ thả bạn xuống nước lần đầu. Hai khe sau tai bạn mở ra, và bạn thở được dưới biển trước cả khi biết đi.', k: 'big' }; } },
    { id: 'mer_reef', st: CT, rep: true, gap: 3, c: seaSide, w: 2.5, run(S, X) { X.gain('Arcane', 2); X.add('sm', 2);
        return { t: 'Bạn theo bà chăm vườn san hô trước nhà: gỡ sao biển ăn san hô, cắm lại từng cành gãy sau bão.', k: 'good' }; } },
    { id: 'mer_whale', st: ['teen'], c: seaSide, w: 3, run(S, X) { X.add('so', 4); X.gain('Taming', 3); X.add('h', 5);
        return { t: 'Đàn cá voi đi ngang vịnh. Bạn lặn xuống hát cùng chúng; một con đáp lại bằng một tiếng dài mà ông nội nói là tên bạn trong tiếng cá voi.', k: 'big' }; } },
    { id: 'mer_dry', st: AD, rep: true, gap: 3, c: (S, X) => !seaSide(S) && !X.hasCond('dry'), w: 2.5, run(S, X) { X.cond('dry'); X.add('hl', -6); X.add('h', -4); if (!S.flags.migrateQ) S.flags.migrateQ = 'Vảy bạn cần nước mặn.';
        return { t: `Xa biển đã lâu, vảy trên lưng bạn khô nứt. Ở ${homeName(S, X)}, sáng nào bạn cũng phải ngâm mình trong máng nước ngựa, và người ta nhìn bạn như nhìn con cá mắc cạn.`, k: 'bad' }; } },
    { id: 'mer_rock', st: ['adult'], c: S => seaSide(S) && !(S.family.spouse && S.family.spouse.alive) && !S.flags.cloakQ && !S.flags.cloak, w: 1, tree: { theme: 'romance' }, run(S, X) {
        const sx = S.sex === 'm' ? 'f' : 'm', nm = X.name('human', sx); S.flags.cloakQ = { name: nm, sex: sx };
        return { t: `Bạn lên bãi đá phơi nắng, cởi áo vảy để bên cạnh. Lúc tỉnh dậy, áo đã mất. ${first(nm)}, một ${sx === 'm' ? 'anh' : 'chị'} ngư dân, đứng gần đó, mắt không rời bạn.`, k: 'info' }; } },
    { id: 'mer_cloak_found', st: AD, w: 4, tree: { from: ['mer_cloak:stay'], wait: [3, 10], dir: { du: 1 } }, run(S, X) {
        const sp = S.family.spouse, nm = sp ? first(sp.name) : 'người kia';
        if (sp && sp.alive && (S.traits.social > .55 || S.family.kids.some(k => k.alive))) { X.add('h', 4); S.flags.cloak = 'kept';
          return { t: `Đứa con của bạn lôi từ gầm giường ra một tấm áo vảy cũ, hỏi đây là gì. Bạn cầm nó ra tận mép nước, đứng tới tối, rồi mang về cất lại vào rương. ${nm} không hỏi gì.`, k: 'info', o: 'stay' }; }
        if (sp && sp.alive) { S.family.spouse = null; S.flags.leftSpouse = true; }
        S.flags.cloak = 'back'; X.add('h', 10); X.add('so', -6); G.trajBump(S, { du: .3 });
        return { t: `Bạn tìm thấy tấm áo vảy trong rương cũ của ${nm}. Đêm ấy bạn khoác áo, xuống nước, và không quay đầu lại.`, k: 'big', o: 'sea' }; } },
    { id: 'mer_drowned', st: AD, rep: true, gap: 5, c: seaSide, w: 1.8, tree: { dir: { dao: 1, vo: .5, gia: .5 } }, run(S, X) {
        const n = X.int(2, 5); X.add('so', 5); S.fame += 2; if (S.faith === 'deep') S.devotion = Math.min(100, S.devotion + 5);
        return { t: `Sau bão, bạn lặn xuống xác tàu, kéo lên được ${n} người còn thở. Người cuối cùng bạn kéo lên đã lạnh; bạn hát cho người ấy đoạn đường xuống đáy biển.`, k: 'good' }; } },
    { id: 'mer_song', st: ['adult'], c: S => seaSide(S) && !S.flags.sirenQ && !S.flags.siren, w: 1.2, run(S, X) {
        S.flags.sirenQ = true; return { t: 'Đêm không trăng, có một tàu buôn lạc gần bãi đá ngầm. Các bà già trong đàn trồi lên khỏi mặt nước và bắt đầu hát.', k: 'info' }; } },
    { id: 'mer_siren_seen', st: AD, w: 3, tree: { from: ['mer_siren:sing'], wait: [1, 6], dir: { am: 1 } }, run(S, X) {
        X.add('so', -6); X.add('h', -4);
        return { t: `Một thủy thủ sống sót từ con tàu năm ấy nhận ra giọng bạn ở chợ ${homeName(S, X)}. Hắn không làm gì, chỉ đứng nhìn, nhưng từ đó không ai ở bến bán cá cho bạn nữa.`, k: 'bad' }; } },
    { id: 'mer_siren_gift', st: AD, w: 3, tree: { from: ['mer_siren:warn'], wait: [1, 6], dir: { gia: 1, thuong: 1 } }, run(S, X) {
        X.money(Math.round(med(S, X) * .8)); X.add('h', 5);
        return { t: 'Thuyền trưởng con tàu năm ấy quay lại vịnh, thả xuống nước một rương nhỏ buộc phao đỏ. Trong rương có bạc, và một lá thư không ký tên.', k: 'good' }; } },
    { id: 'mer_pearl', st: AD, rep: true, gap: 4, c: S => seaSide(S) && isTown(S), w: 1.5, tree: { dir: { thuong: 2 } }, run(S, X) { const g = Math.round(med(S, X) * .4); X.money(g);
        return { t: `Bạn mang một túi ngọc trai lên chợ ${homeName(S, X)}. Thương nhân loài người trả giá như thể chính họ lặn được. Bạn về với ${G.coin(g)}.`, k: 'good' }; } },
    { id: 'mer_storm', st: AD, rep: true, gap: 4, c: S => seaSide(S) && G.raceHome(S), w: 1.5, run(S, X) { X.add('hl', -2); X.add('h', 5);
        return { t: 'Bão tới, người trên bờ đóng cửa. Hải Tộc thì lặn xuống dưới lớp sóng, nằm chờ cơn bão chạy qua trên đầu như một đàn trâu.', k: 'info' }; } },
    { id: 'mer_deep', st: ['elder'], w: 3, run(S, X) { X.add('sm', 4); X.add('h', 3);
        return { t: 'Người già của Hải Tộc không nằm chờ chết trên cạn. Mỗi mùa bạn bơi xa hơn một chút, xuống những tầng nước lạnh mà người trẻ chưa dám.', k: 'info' }; } }
  ]);
  dec('merfolk', 'mer_cloak', {
    prio: 5, gap: 1, tree: { q: 'cloakQ', theme: 'romance' },
    when: S => !S.dead && !!S.flags.cloakQ,
    build(S, X) { const c = S.flags.cloakQ;
      return { title: 'Áo vảy bị giấu', body: `${c.name} giấu áo vảy của bạn. Không có áo, Hải Tộc không về được vùng nước sâu. ${c.sex === 'm' ? 'Anh' : 'Chị'} ta nói sẽ trả, nếu bạn ở lại.`,
        choices: [{ k: 'stay', label: 'Ở lại', sub: 'Thành vợ chồng; áo vẫn nằm đâu đó trong nhà.' }, { k: 'sing', label: 'Hát cho người đó ngủ rồi tìm áo', sub: 'Cần giọng hát có phép.' }, { k: 'leave', label: 'Bỏ áo, xuống nước', sub: 'Về được biển nông, nhưng mất áo thì yếu đi nhiều năm.' }] }; },
    apply(S, X, k) { const c = S.flags.cloakQ; S.flags.cloakQ = null; cnt(S, 'cloak_' + k);
      if (k === 'stay') { S.family.spouse = { name: c.name, race: 'human', age: X.years(S) + X.int(-3, 6), alive: true }; X.add('h', 4); X.add('so', 6); return `Bạn ở lại. ${first(c.name)} dựng cho bạn cái bể đá sau nhà để ngâm mình mỗi tối.`; }
      if (k === 'sing') { if ((S.mastery.Arcane || 0) + (S.mastery.Spirit || 0) >= 30 || X.chance(.4)) { X.gain('Arcane', 3); S.flags.cloak = 'took'; return `${first(c.name)} ngủ gục bên bàn trước khi bạn hát hết bài. Áo vảy nằm dưới đáy rương, gói trong vải dầu.`; }
        X.add('hl', -6); S.flags.cloak = 'lost'; return 'Giọng bạn run, người kia không ngủ. Bạn bỏ chạy ra biển, không có áo.'; }
      X.add('hl', -10); X.add('h', -10); S.flags.cloak = 'lost'; return 'Bạn lao xuống nước không có áo. Biển nông nhận bạn, biển sâu thì không.'; },
    auto: S => S.traits.social > .6 ? 'stay' : S.traits.bold > .5 ? 'sing' : 'leave'
  });
  dec('merfolk', 'mer_siren', {
    prio: 5, gap: 1, tree: { q: 'sirenQ' },
    when: S => !S.dead && !!S.flags.sirenQ,
    build(S, X) {
      return { title: 'Tiếng hát gọi tàu', body: 'Hàng trên tàu sẽ chia cho cả đàn. Các bà già gọi bạn cùng hát. Từ bãi đá ngầm tới tàu, bơi nhanh thì kịp.',
        choices: [{ k: 'sing', label: 'Cùng hát', sub: 'Được chia phần hàng; có thể có người sống sót nhớ giọng bạn.' }, { k: 'warn', label: 'Bơi ra báo cho tàu', sub: 'Đàn sẽ giận.' }, { k: 'away', label: 'Lặn đi chỗ khác', sub: '' }] }; },
    apply(S, X, k) { S.flags.sirenQ = null; S.flags.siren = k; cnt(S, 'siren_' + k);
      if (k === 'sing') { X.money(Math.round(med(S, X) * 1.2)); G.trajBump(S, { am: .3 }); X.add('h', -4); return 'Con tàu vỡ trên đá trước khi trời sáng. Đàn chia nhau hàng hóa; phần của bạn là một rương vải và mấy thỏi bạc.'; }
      if (k === 'warn') { S.fame += 3; X.add('so', -4); return 'Bạn bám lên mạn tàu, chỉ cho thủy thủ đường ra. Con tàu bẻ lái kịp. Sáng hôm sau trong đàn không ai nói chuyện với bạn.'; }
      return 'Bạn lặn xuống thật sâu cho tới khi không còn nghe tiếng hát.'; },
    auto: S => S.traits.social > .55 || S.traits.pious > .6 ? 'warn' : S.traits.bold > .55 ? 'sing' : 'away'
  });

  // ─────────── Long Nhân ───────────
  // Nguồn: Dragonborn của D&D (danh dự thị tộc trên hết, nợ của một người là nợ của cả thị tộc), Skyrim (tiếng gầm có máu rồng),
  // Smaug và Fafnir (lòng tham kho báu, kẻ trộm lấy một chiếc cốc), loài bò sát máu lạnh (lì đi khi trời rét), cánh của nhánh
  // Elder Wyrm trong thư viện nghề.
  add('dragonkin', [
    { id: 'drg_egg', st: ['infant'], w: 6, run(S, X) {
        const at = bio(S) === 'ash_peak' ? 'sát miệng núi lửa' : bio(S) === 'storm_spire' ? 'trên đỉnh núi, nơi đêm nào sét cũng đánh' : 'trong lò sưởi đắp bằng đá núi mang về';
        X.add('so', 3); X.add('hl', 3);
        return { t: `Bạn nở từ một quả trứng ấp ba mùa trong ổ đá nóng ${at}. Vỏ trứng được nghiền vào mực để viết tên bạn lên sổ thị tộc.`, k: 'big' }; } },
    { id: 'drg_spring', st: CT, rep: true, gap: 3, c: S => bio(S) === 'ash_peak' || X0(S).hot, w: 2.5, run(S, X) { X.add('hl', 4); X.gain('Fire', 2);
        return { t: 'Bạn tắm trong suối nước sôi ở sườn núi, nơi người loài khác chạm tay vào là phỏng. Ra khỏi suối, vảy bạn bóng như đồng mới đánh.', k: 'good' }; } },
    { id: 'drg_struck', st: ['teen'], c: S => bio(S) === 'storm_spire', w: 3, run(S, X) { X.gain('Lightning', 5); X.add('hl', -6); S.fame += 1;
        return { t: 'Bạn leo lên mỏm đá giữa cơn giông, như lũ trẻ trong thị tộc vẫn thách nhau. Sét đánh trúng. Bạn tỉnh dậy, vảy cháy đen, tai ù ba ngày, và từ đó thấy được sét trước khi nó đánh.', k: 'big' }; } },
    { id: 'drg_roar', st: ['teen'], w: 3, run(S, X) { X.gain('Fire', 3); X.add('so', 3);
        return { t: 'Bạn gầm lần đầu tiên. Đàn dê trên sườn núi chạy tán loạn, đá vụn lăn xuống thung. Ông nội gật đầu: giọng có máu rồng.', k: 'good' }; } },
    { id: 'drg_shed', st: AD, rep: true, gap: 6, w: 1.3, run(S, X) {
        if (isTown(S)) { const g = Math.round(med(S, X) * .3); X.money(g); return { t: `Mùa lột vảy, bạn ngứa ngáy cả tháng. Dược sư ở ${homeName(S, X)} mua hết chỗ vảy rụng để nghiền làm thuốc, trả ${G.coin(g)}.`, k: 'good' }; }
        X.add('so', 2); return { t: 'Mùa lột vảy, bạn ngứa ngáy cả tháng. Lũ trẻ trong thị tộc nhặt vảy rụng của bạn xâu làm bùa.', k: 'info' }; } },
    { id: 'drg_greed', st: AD, c: (S, X) => !S.flags.hoardQ && !S.flags.hoard && S.gold > 3 * med(S, X), w: 2, tree: { dir: { thuong: 2 } }, run(S, X) {
        S.flags.hoardQ = true; return { t: 'Đêm nào bạn cũng đếm lại tiền. Có hôm thiếu một đồng, bạn lục tung cả nhà tới sáng.', k: 'info' }; } },
    { id: 'drg_thief', st: AD, w: 4, tree: { from: ['drg_hoard:keep'], wait: [1, 6], dir: { vo: 1, thuong: 1 } }, run(S, X) {
        if (X.chance(odds(S, X, .5))) { S.fame += 3; X.add('h', 6); return { t: 'Có kẻ đào hầm vào kho của bạn và lấy đi đúng một chiếc cốc vàng. Bạn biết ngay, vì thiếu một tiếng leng keng quen thuộc. Bạn lần theo mùi hắn tới tận bìa rừng và lấy lại chiếc cốc.', k: 'good', o: 'got' }; }
        const g = Math.round(S.gold * .2); X.money(-g); X.add('h', -12);
        return { t: `Có kẻ đào hầm vào kho của bạn trong lúc bạn ngủ. Hắn lấy ${G.coin(g)} và một chiếc cốc vàng. Bạn lục cả vùng suốt một mùa không thấy hắn đâu.`, k: 'bad', o: 'lost' }; } },
    { id: 'drg_debt', st: AD, c: S => !S.flags.clanQ, w: 1.5, tree: { theme: 'clan' }, run(S, X) {
        const nm = X.name('dragonkin', X.chance(.5) ? 'm' : 'f'), c = Math.round(med(S, X) * .8); S.flags.clanQ = { name: nm, cost: c };
        return { t: `${nm}, người cùng thị tộc với bạn, thua bạc rồi bỏ trốn, để lại món nợ ${G.coin(c)} với một thị tộc khác.`, k: 'bad' }; } },
    { id: 'drg_hunt_kin', st: AD, w: 4, tree: { from: ['drg_clan:hunt'], wait: [1, 4], dir: { du: 1, vo: 1 } }, run(S, X) {
        const nm = first(S.flags.clanDebt.name); X.add('so', 5); S.fame += 3;
        return { t: `Bạn tìm thấy ${nm} ở một mỏ đá phía nam, đang làm phu trả nợ cho người khác. Bạn đưa ${nm} về quỳ trước đài lửa. Thị tộc kia nhận lời xin lỗi, và bạn được ghi tên lên sổ danh dự.`, k: 'good' }; } },
    { id: 'drg_cold', st: ['child', 'teen', 'adult', 'elder'], rep: true, gap: 3, c: (S, X) => (X0(S).cold || bio(S) === 'frost_tundra') && !X.hasCond('torpid'), w: 3, tree: { theme: 'hardship' }, run(S, X) {
        X.cond('torpid'); X.add('hl', -6);
        return { t: `Mùa đông ở ${homeName(S, X)}, máu bạn chậm lại như máu thằn lằn. Bạn ngủ mười bốn tiếng mỗi ngày, quấn ba lớp da mà vẫn run.`, k: 'bad' }; } },
    { id: 'drg_wings', st: AD, c: (S, X) => (S.mastery.Fire || 0) >= 40 || X.ctier(S) >= 2, w: .8, run(S, X) {
        S.fame += 5; X.add('so', 6); G.trajBump(S, { du: .3 }); S.flags.wings = true;
        return { t: 'Hai u xương trên bả vai bạn nứt ra thành mầm cánh. Thị tộc trăm năm mới có một người mọc cánh; họ dắt bạn lên đài lửa cho cả vùng tới xem.', k: 'big', f: 'Long Nhân mọc cánh là dấu máu rồng tỉnh lại. Có người bay được, có người mang cánh tới chết mà không cất mình khỏi đất.' }; } },
    { id: 'drg_slayer', st: AD, rep: true, gap: 8, c: stranger, w: 1, tree: { theme: 'stranger', dir: { vo: 1 } }, run(S, X) {
        if (X.chance(odds(S, X, .5))) { S.fame += 3; return { t: `Một hiệp sĩ trẻ ở ${homeName(S, X)} nghe đồn bạn là rồng đội lốt người, thách đấu bạn giữa chợ. Bạn quật hắn ngã ba lần rồi tha. Hôm sau cả phố biết tên bạn.`, k: 'good' }; }
        X.add('hl', -12); X.cond('wound');
        return { t: `Một hiệp sĩ trẻ ở ${homeName(S, X)} nghe đồn bạn là rồng đội lốt người. Hắn đâm bạn bằng ngọn giáo có khắc chữ thánh trước khi bạn kịp nói gì.`, k: 'bad' }; } },
    { id: 'drg_dream', st: ['elder'], w: 3, run(S, X) { X.add('sm', 5); X.add('h', 4);
        return { t: 'Về già bạn ngủ dài hơn, có khi nửa mùa. Trong mơ bạn bay trên một đại lục chưa có thành quách, cùng những con rồng đã chết từ trước khi có Long Nhân.', k: 'info' }; } }
  ]);
  dec('dragonkin', 'drg_hoard', {
    prio: 5, gap: 1, tree: { q: 'hoardQ' },
    when: S => !S.dead && !!S.flags.hoardQ,
    build(S, X) {
      return { title: 'Lòng tham rồng', body: `Bạn có ${G.coin(S.gold)}, mà vẫn thấy chưa đủ. Máu rồng trong người bạn đòi một kho báu, và đòi canh giữ nó.`,
        choices: [{ k: 'keep', label: 'Dựng kho, canh giữ', sub: 'Vui khi tiền đầy kho; ít người muốn tới gần; kẻ trộm sẽ tới.' }, { k: 'give', label: 'Chia bớt cho thị tộc', sub: `Mất 30% tiền; thị tộc nhớ ơn.` }] }; },
    apply(S, X, k) { S.flags.hoardQ = null; S.flags.hoard = k; cnt(S, 'hoard_' + k);
      if (k === 'keep') { X.add('h', 8); X.add('so', -6); G.trajBump(S, { thuong: .4 }); return 'Bạn đào một cái hầm dưới gầm giường, xếp tiền theo từng loại. Đêm nào cũng xuống đếm.'; }
      const g = Math.round(S.gold * .3); X.money(-g); X.add('so', 10); S.fame += 2; return `Bạn mang ${G.coin(g)} lên đài lửa chia cho các nhà trong thị tộc. Tay bạn run suốt buổi.`; },
    auto: S => S.traits.social > .5 || S.traits.pious > .6 ? 'give' : 'keep'
  });
  dec('dragonkin', 'drg_clan', {
    prio: 5, gap: 1, tree: { q: 'clanQ' },
    when: S => !S.dead && !!S.flags.clanQ,
    build(S, X) { const c = S.flags.clanQ;
      return { title: 'Danh dự thị tộc', body: `Với Long Nhân, nợ của một người là nợ của cả thị tộc. Thị tộc kia đòi ${G.coin(c.cost)}, hoặc đòi người.`,
        choices: [{ k: 'pay', label: `Trả nợ thay (${G.coin(c.cost)})`, sub: 'Giữ danh dự thị tộc.' }, { k: 'hunt', label: `Đi bắt ${first(c.name)} về`, sub: 'Đường xa; về được thì danh dự còn cao hơn.' }, { k: 'disown', label: 'Gạch tên khỏi sổ thị tộc', sub: 'Thị tộc kia không đòi nữa, nhưng thị tộc mình mất mặt.' }] }; },
    apply(S, X, k) { const c = S.flags.clanQ; S.flags.clanQ = null; S.flags.clanDebt = c; cnt(S, 'clan_' + k);
      if (k === 'pay') { X.money(-c.cost); X.add('so', 6); S.fame += 2; return 'Bạn mang bạc tới tận đài lửa của thị tộc kia, cúi đầu xin lỗi thay người đã trốn.'; }
      if (k === 'hunt') { G.trajBump(S, { du: .3 }); X.add('h', -2); return `Bạn khoác áo đi đường, hỏi thăm từng quán trọ về một Long Nhân có vết sẹo trên mõm.`; }
      X.add('so', -4); X.add('h', -4); return `Bạn tự tay gạch tên ${first(c.name)} khỏi sổ thị tộc. Mực đen loang cả sang tên cha mẹ người ấy.`; },
    auto: S => S.gold >= S.flags.clanQ.cost && S.traits.social > .35 ? 'pay' : S.traits.bold > .5 ? 'hunt' : 'disown'
  });

  // ─────────── Cơ Nhân ───────────
  // Nguồn: Golem thành Praha (chữ khắc làm đất sét sống dậy), Warforged của Eberron (đúc cho chiến tranh, đi tìm mục đích,
  // tranh cãi có linh hồn hay không), Frankenstein (người tạo ra và vật được tạo ra), con tàu của Theseus (thay hết các bộ phận
  // thì có còn là mình), "Lò Đúc Mẹ" của đặc trưng khu dân cư Cơ Nhân.
  const PURPOSE = [['LÍNH GÁC CỔNG SỐ 7', { vo: .4 }], ['MÁY KÉO QUẶNG, LÒ 3', { nghe: .4 }], ['HỘ VỆ CHO MỘT NHÀ QUÝ TỘC', { quyen: .3, vo: .2 }], ['MẪU THỬ. KHÔNG BÁN', { tri: .4 }], ['THỢ CHÉP SÁCH', { tri: .4 }]];
  add('construct', [
    { id: 'cst_light', st: CT, w: 15, run(S, X) {
        const sx = X.chance(.5) ? 'm' : 'f', r = X.chance(.6) ? 'dwarf' : 'human', nm = X.name(r, sx); S.flags.maker = { name: nm, sex: sx, race: r };
        X.add('h', 4);
        return { t: `Thứ đầu tiên bạn thấy là mặt của ${first(nm)}, thợ cả ${raceVi(r)}, mồ hôi nhỏ xuống vỏ bạn. ${he(sx) === 'bà' ? 'Bà' : 'Ông'} ấy nói: "Chạy rồi." Đó là câu đầu tiên bạn ghi nhớ.`, k: 'big' }; } },
    { id: 'cst_plate', st: ['teen', 'adult'], w: 3, run(S, X) { const p = X.pick(PURPOSE); S.flags.purpose = p[0]; G.trajBump(S, p[1]); X.add('sm', 3);
        return { t: `Bạn cạy được tấm biển đồng gắn trong ngực mình. Trên đó khắc: "${p[0]}". Chưa ai từng nói với bạn điều đó.`, k: 'big' }; } },
    { id: 'cst_maker', st: AD, c: S => !!S.flags.maker, w: 2, tree: { dir: { nghe: 1, gia: 1 } }, run(S, X) {
        const m = S.flags.maker, ho = m.sex === 'f' ? 'Bà' : 'Ông';
        if (S.traits.social > .3) { X.gain('Engineering', 5); X.gain('Construct', 3); X.add('h', 4);
          return { t: `${first(m.name)} đã già, tay run không cầm nổi búa. ${ho} gọi bạn về xưởng, trao cho bạn chùm chìa khóa và cuốn sổ ghi cách đúc bạn.`, k: 'good', o: 'home' }; }
        X.add('h', -6); return { t: `Ba năm sau bạn mới nghe tin ${first(m.name)} đã mất. Xưởng của ${ho.toLowerCase()} giờ bán bánh mì.`, k: 'bad', o: 'away' }; } },
    { id: 'cst_worn', st: AD, c: (S, X) => !S.flags.coreQ && !S.flags.core && (X.hasCond('rust') || S.hl < 50 || X.years(S) >= 60), w: 2, run(S, X) {
        S.flags.coreQ = true; return { t: 'Thợ đúc mở ngực bạn ra xem, rồi lắc đầu: lõi đã mòn tới mức không sửa được nữa.', k: 'bad' }; } },
    { id: 'cst_core_after', st: AD, w: 4, tree: { from: ['cst_core:new'], wait: [1, 4] }, run(S, X) { X.add('so', -4); X.add('h', -4);
        return { t: 'Một người lạ chặn bạn ở chợ, gọi đúng tên bạn, vui mừng như gặp lại bạn cũ. Bạn biết đó là tên mình, nhưng không nhớ người ấy là ai.', k: 'bad' }; } },
    { id: 'cst_humid', st: AD, rep: true, gap: 3, c: S => HUMID.includes(bio(S)), w: 2.2, tree: { theme: 'hardship' }, run(S, X) { X.add('hl', -4); if (X.chance(.3)) X.cond('rust');
        return { t: `Sương ở ${homeName(S, X)} không bao giờ tan hẳn. Sáng nào bạn cũng phải lau khớp; khe giáp vai đã lấm tấm gỉ.`, k: 'bad' }; } },
    { id: 'cst_scrap', st: AD, rep: true, gap: 5, c: S => stranger(S) && isTown(S), w: S => wary(S) ? 3 : 1.8, tree: { theme: 'stranger', dir: { vo: 1 } }, run(S, X) {
        if (X.chance(odds(S, X, .5))) { X.money(Math.round(med(S, X) * .2)); return { t: `Ba gã thợ rèn thất nghiệp ở ${homeName(S, X)} chặn bạn trong hẻm. Ở chợ đen, một bánh răng lõi Cơ Nhân bán được bằng nửa năm công. Bạn bẻ gãy xà beng của chúng.`, k: 'good' }; }
        X.add('hl', -10); X.money(-Math.round(med(S, X) * .2));
        return { t: `Ba gã thợ rèn thất nghiệp ở ${homeName(S, X)} chặn bạn trong hẻm, tháo mất hai bánh răng ở cổ tay trước khi lính tuần tới.`, k: 'bad' }; } },
    { id: 'cst_mother', st: AD, c: S => bio(S) === 'forge_ruins' || kin(S), w: 1.5, run(S, X) { X.gain('Construct', 4); X.add('sm', 3); X.add('h', 5);
        return { t: 'Bạn về Lò Đúc Mẹ, nơi những Cơ Nhân đầu tiên ra đời. Lò đã nguội từ lâu, nhưng áp tay lên thành lò bạn vẫn nghe một tiếng gõ nhịp rất khẽ.', k: 'big', f: J.races.construct.lore }; } },
    { id: 'cst_soul', st: AD, c: S => !!S.faith || (X0(S).faiths.light || 0) >= 25, w: 1.5, tree: { dir: { dao: 2 } }, run(S, X) {
        X.add('h', -5); if (S.traits.pious > .5) { X.gain('Spirit', 3); return { t: `Tu sĩ ở ${homeName(S, X)} không cho bạn vào đền: thứ do người làm ra thì không có linh hồn để cứu. Bạn đứng ngoài cửa nghe hết buổi lễ. Tuần sau bạn lại tới đứng đó.`, k: 'info', o: 'stay' }; }
        return { t: `Tu sĩ ở ${homeName(S, X)} không cho bạn vào đền: thứ do người làm ra thì không có linh hồn để cứu.`, k: 'bad', o: 'go' }; } },
    { id: 'cst_twin', st: AD, w: 1.5, run(S, X) { X.add('so', 5); X.add('h', 4);
        return { t: 'Bạn gặp một Cơ Nhân cùng khuôn đúc: cùng vết hàn trên má, cùng tiếng rít khi quay đầu. Hai người so số hiệu, chỉ khác nhau một chữ.', k: 'good' }; } },
    { id: 'cst_count', st: ['elder'], w: 3, run(S, X) { X.add('sm', 4);
        return { t: `Bánh răng chính của bạn đã quay hơn ${Math.round(X.years(S) * 31.5)} triệu vòng. Bạn bắt đầu ghi lại từng ngày vào sổ, phòng khi lõi ngừng quay mà chưa kịp kể cho ai.`, k: 'info' }; } }
  ]);
  dec('construct', 'cst_core', {
    prio: 5, gap: 1, tree: { q: 'coreQ' },
    when: S => !S.dead && !!S.flags.coreQ,
    build(S, X) { const c = Math.round(med(S, X) * 1.2);
      return { title: 'Thay lõi', body: 'Thợ đúc có thể thay lõi mới: chạy như mới xuất xưởng, nhưng ký ức trong lõi cũ không chắc theo sang được. Nếu thay dần từng bánh răng thì còn giữ được mình, mà tốn nhiều năm.',
        choices: [{ k: 'new', label: `Thay lõi mới (${G.coin(c)})`, sub: 'Khỏe như mới; quên nhiều thứ.', cost: c }, { k: 'slow', label: `Thay dần từng bánh răng (${G.coin(Math.round(c / 2))})`, sub: 'Khỏe hơn một chút; vẫn là mình.', cost: Math.round(c / 2) }, { k: 'keep', label: 'Giữ lõi cũ', sub: 'Chạy tới đâu hay tới đó.' }] }; },
    apply(S, X, k, c) { S.flags.coreQ = null; S.flags.core = k; cnt(S, 'core_' + k);
      if (k === 'new') { X.money(-c.cost); X.add('hl', 30); X.add('sm', -20); S.conds = S.conds.filter(x => x.id !== 'rust'); return 'Bạn tỉnh dậy trên bàn đúc. Mọi khớp đều êm. Bạn nhìn tay mình một lúc lâu, như nhìn tay người khác.'; }
      if (k === 'slow') { X.money(-c.cost); X.add('hl', 12); return 'Mỗi mùa thay một bánh răng. Tới khi thay xong cái cuối cùng, bạn không biết trong người còn mảnh nào của ngày đầu tiên.'; }
      X.add('h', 4); X.add('sm', 2); return 'Bạn giữ lõi cũ. Kêu cót két thì kêu, nhưng tiếng kêu ấy là của bạn.'; },
    auto: (S, X, d) => S.gold >= d.choices[0].cost && S.traits.bold > .5 ? 'new' : S.gold >= d.choices[1].cost ? 'slow' : 'keep'
  });

  // ─────────── Người ───────────
  // Loài người là mặc định của mọi sự kiện chung; thêm ba nút nói về chính cái ngắn ngủi, cái đông đúc của loài người.
  add('human', [
    { id: 'hum_hurry', st: AD, c: S => Object.entries((G.here(S).s || {}).races || {}).some(([r, v]) => r !== 'human' && G.RACES[r].le >= 200 && v >= 3), w: 1.2, run(S, X) { X.add('sm', 2);
        return { t: 'Một Tiên Tộc đi ngang chợ, nhìn bạn mặc cả rồi bảo: "Loài người làm gì cũng vội." Bạn đáp: "Vì chúng tôi không có bốn trăm năm." Ông ta nghĩ một lúc rồi gật đầu.', k: 'info' }; } },
    { id: 'hum_flood', st: ['child', 'teen', 'adult', 'elder'], rep: true, gap: 6, c: S => ['golden_plains', 'mist_coast'].includes(bio(S)) && (S.urban === false || ['farmer', 'herder'].includes(S.work)), w: 1.2, tree: { theme: 'hardship' }, run(S, X) {
        X.add('hl', -5); X.money(-Math.round(med(S, X) * .2));
        return { t: 'Mưa thượng nguồn nửa tháng không dứt. Sông tràn bờ, nước ngập tới bậu cửa; cả làng kéo nhau lên gò đất cao ngồi chờ nước rút.', k: 'bad' }; } },
    { id: 'hum_crowd', st: CT, c: S => { const s = G.here(S).s; return !!s && ['capital', 'city'].includes(s.tier); }, w: 2, run(S, X) { X.gain('Dagger', 2); X.add('sm', 2);
        return { t: `Chợ phiên ở ${homeName(S, X)} đông tới mức bạn đi lạc mất mẹ nửa ngày. Bạn học được mười tiếng chửi của mười vùng, và cách giữ túi tiền khỏi tay người lạ.`, k: 'info' }; } }
  ]);

  // ─────────── Đời thường của từng tộc ───────────
  // Một sự kiện lặp lại được mỗi tộc, câu chữ theo tuổi (nhỏ, lớn, già) và nơi ở: ở quê tộc hay giữa người cùng tộc (home),
  // hay ở khu của tộc khác (away). {h}: nơi đang ở; {z}: khu săn gần nhà. Hải Tộc xa biển dùng nhóm inland.
  const LIFE = G.RACE_LIFE = {
    elf: { skill: 'Bow',
      young: ['Bạn tập bắn tên xuyên qua những chiếc lá đang rơi. Tới cuối mùa thu thì trúng được một lá trong mười.', 'Bà cố dắt bạn đi khắp rừng, chỉ cho bạn cây nào đã có tên, cây nào chưa. Có những cây còn già hơn bà.', 'Bạn trèo lên tán Cây Mẹ, nằm trên cành cả buổi chiều nghe lá nói chuyện với gió.'],
      home: ['Bạn dành cả một mùa uốn cho cây sồi non mọc thẳng: buộc dây, nới dây, rồi buộc lại.', 'Cả tộc dời trại theo mùa quả sang phía bên kia rừng. Không ai chặt một cành nào để dựng lều.', 'Bạn đi tuần biên rừng cùng đội cung thủ, ba tháng không nói quá mười câu.', 'Bạn chép lại một bài ca cổ lên vỏ bạch dương, cho kịp trước khi người cuối cùng còn nhớ nó qua đời.'],
      away: ['Bạn trồng một cây sồi con ở góc sân nhà trọ. Chủ trọ bảo cây ấy lớn thì cháu ông mới được ngồi bóng mát.', 'Ở {h} không có cây nào đủ già để nói chuyện. Tối tối bạn ra bờ sông ngồi với cây liễu duy nhất.', 'Người ta trả tiền để nghe bạn kể về thời ông bà họ còn trẻ. Bạn kể đúng từng chi tiết, và họ nghĩ bạn bịa.'],
      old: ['Bạn ngồi dưới Cây Mẹ cả mùa, nhớ lại từng người mình đã quen. Danh sách dài hơn bạn tưởng.', 'Lá trên đầu bạn đã rụng rồi mọc lại mấy trăm lần. Bạn thấy mình nhẹ dần đi, như sắp được gọi về phía tây.'] },
    dwarf: { skill: 'Engineering',
      young: ['Bạn ngồi đếm vân đá trên vách hầm cho tới khi đọc được tuổi của từng lớp đá.', 'Ông nội cho bạn kéo bễ lò rèn cả buổi. Cánh tay mỏi rã, nhưng tối ấy bạn được ngồi bàn người lớn.', 'Bạn lạc trong đường hầm cũ một ngày, lần theo hơi gió mà ra. Cả họ khen bạn có mũi thợ mỏ.'],
      home: ['Mùa này bạn xuống mỏ cùng tổ, gõ đá nghe tiếng mà biết mạch quặng chạy về đâu.', 'Đại sảnh họp bàn chuyện mở nhánh hầm mới, cãi nhau ba ngày. Bạn chỉ nói một câu, và người ta nhớ câu đó.', 'Bạn cùng cả họ sửa lại cánh cổng đá của hầm, khắc thêm một hàng rune mới dưới hàng rune của tổ tiên.', 'Bạn giữ lò chung một mùa, đêm nào cũng dậy cho thêm than. Lò không tắt lần nào.'],
      away: ['Ở {h} không ai đọc được rune. Bạn khắc dấu thị tộc lên khung cửa phòng trọ cho đỡ nhớ nhà.', 'Thợ rèn ở {h} làm ẩu tới mức bạn không nhịn được, giật búa sửa giúp. Họ bực, nhưng từ đó hay gọi bạn sang.', 'Bạn gửi thư về thị tộc hỏi chuyện lò, chuyện mỏ. Thư đi nửa năm mới tới nơi.'],
      old: ['Bạn ngồi bên lò chung, kể cho lũ trẻ nghe tên từng ngách hầm và ai đã đào nó.', 'Râu bạn dài chạm đất, phải vắt qua vai mà đi. Lũ trẻ trong họ thay nhau tết lại cho bạn.'] },
    orc: { skill: 'Axe',
      young: ['Bạn vật nhau với lũ trẻ trong trại từ sáng tới tối. Thua nhiều hơn thắng, nhưng không khóc lần nào.', 'Bạn được giao trông ngựa cho trại, ngủ ngoài trời giữa đàn ngựa cả mùa hè.', 'Bố cho bạn cầm rìu thật lần đầu, chẻ củi cho cả trại. Tối đó tay bạn không nắm lại được.'],
      home: ['Trại dời đi theo mùa cỏ. Bạn đi đầu đoàn, dò đường qua những gò đá bố từng chỉ.', 'Cả trại đi săn bò rừng một mùa. Bạn kéo về một con, chia đều cho mấy lều không còn đàn ông.', 'Bạn ngồi canh lửa trại suốt đêm, nghe các bà kể lại những trận đánh cũ.', 'Hai trại tranh một bãi cỏ; tù trưởng cử bạn ra vật thay cả trại. Bạn thắng, bãi cỏ thuộc về trại bạn.'],
      away: ['Ở {h} bạn phải cúi đầu mới vào được cửa quán. Bạn vào nhiều tới mức chủ quán cho nâng khung cửa lên.', 'Bạn làm thuê cho một ông chủ ở {h}. Lão trả công đúng hạn, nhưng chưa bao giờ nhìn thẳng mặt bạn.', 'Lũ trẻ ở {h} trêu cái nanh của bạn. Bạn nhe nanh dọa, rồi chúng thành bạn của bạn.'],
      old: ['Bạn ngồi bên lửa dạy lũ trẻ những bài hát chiến trận mà không ai trong trại còn nhớ trọn.'] },
    beastfolk: { skill: 'Unarmed',
      young: ['Bạn chạy đua với lũ trẻ trong bầy tới tận bờ suối; về tới nơi thì lưỡi thè dài.', 'Bạn tập rình chuột đồng cả buổi chiều, nằm im trong cỏ tới khi kiến bò đầy lưng.', 'Mẹ dạy bạn đọc mùi: mùi người lạ, mùi máu cũ, mùi đất trước khi mưa.'],
      home: ['Bầy săn một mùa ở {z}. Bạn đánh hơi được dấu con mồi trước tất cả.', 'Bạn ngồi bắt ve cho mấy đứa nhỏ trong bầy cả buổi sáng, nghe chúng kể đủ chuyện ngớ ngẩn.', 'Nước suối cạn, bầy dời hang sang sườn đồi khác. Bạn đánh dấu đường bằng vết cào trên đá.', 'Đêm trăng tròn, bầy họp bên cột totem để phân xử một vụ tranh mồi. Mọi người để bạn nói hết.'],
      away: ['Ở {h} cái gì cũng có mùi khói và mùi người. Bạn ngủ mở cửa sổ cho đỡ ngộp.', 'Bạn mua thịt sống ở chợ, người bán hỏi có cần nấu giúp không. Bạn lắc đầu; họ nhìn theo mãi.', 'Đêm trăng tròn ở {h}, bạn ngồi trên mái nhà. Không có ai hú cùng.'],
      old: ['Bạn nằm phơi nắng trước cửa hang cả ngày, lũ trẻ trong bầy lăn lộn trên chân bạn.'] },
    fae: { skill: 'Arcane',
      young: ['Bạn đuổi theo đom đóm trong trảng tới nửa đêm rồi ngủ quên trên một tai nấm.', 'Bạn trêu một bà hái nấm loài người, giấu giỏ của bà lên ngọn cây. Mẹ bắt bạn mang trả, kèm một bó hoa.', 'Bạn học tiếng chim sẻ, nói được ba câu. Câu nào cũng là câu chửi.'],
      home: ['Bạn giữ cho bụi hồng gai trước cổng trảng nở đúng ngày hội, sáng nào cũng ra tưới sương.', 'Đình mở phiên xử hai Yêu Tinh tranh nhau một con suối. Bạn được giao ghi lời thề của cả hai bên.', 'Bạn đổi một câu chuyện lấy một bình mật của ong rừng. Câu chuyện ấy là bịa, nhưng ong không biết.', 'Bạn dệt áo bằng tơ nhện và cánh bướm rụng cho đứa trẻ mới sinh trong trảng.'],
      away: ['Ở {h} không ai để bát sữa trước cửa cho Yêu Tinh. Bạn tự rót sữa, tự uống, thấy buồn cười.', 'Bạn làm thuê trong vườn một nhà loài người. Hoa ở vườn ấy nở to gấp đôi; chủ nhà không hỏi vì sao.', 'Chuông đền ở {h} làm bạn nhức đầu mỗi sáng.'],
      old: ['Bạn ngồi trên một tai nấm già, kể cho lũ trẻ nghe chuyện hội đình từ thời cây sồi cổng trảng còn là hạt.'] },
    merfolk: { skill: 'Spear',
      young: ['Bạn thi nín thở với lũ trẻ trong đàn. Bạn thắng, vì bạn gian: bạn thở bằng mang.', 'Bạn nhặt vỏ ốc dưới đáy vịnh, xâu thành vòng tặng bà.', 'Bạn bơi theo một đàn cá chuồn ra tận ngoài khơi; mẹ phải bơi ra tìm về.'],
      home: ['Bạn theo đàn ra rạn ngoài đánh cá một mùa. Lưới đầy; tối về cả đàn hát.', 'Bạn sửa lại hàng rào đá quanh bãi nuôi trai sau bão, lặn xuống trồi lên cả trăm lần.', 'Bạn dẫn một con tàu buôn qua lạch đá ngầm, lấy công bằng muối và vải khô.', 'Bạn canh vườn san hô suốt mùa sao biển, gỡ từng con bằng tay.'],
      away: ['Bạn gánh nước biển từ bến về để ngâm mình. Người ở {h} hỏi sao không tắm nước giếng cho tiện.', 'Chiều nào bạn cũng ra cầu cảng ngồi nghe sóng, cho tới khi trời tối hẳn.', 'Cá ở chợ {h} đã chết từ hôm qua. Bạn ngửi một cái là biết; người bán thì không chịu nhận.'],
      inland: ['Bạn tìm được một cái ao sâu sau làng, đêm nào cũng lặn xuống. Nước ao ngọt và nhạt; bạn vẫn lặn.', 'Bạn đổi một tháng công lấy một hũ muối biển, tối nào cũng rắc một nhúm vào chậu nước tắm.'],
      old: ['Bạn nổi trên mặt nước cả ngày, mắt nhắm, để con nước lớn ròng đưa đi đưa lại.'] },
    dragonkin: { skill: 'Fire',
      young: ['Bạn thi thổi lửa với lũ trẻ trong thị tộc: ai đốt được cọc gỗ xa nhất thì thắng. Bạn đốt cháy cái lều.', 'Bạn leo lên đài lửa ngồi xem các bô lão đọc tên tổ tiên, ngủ gật giữa chừng.', 'Bạn giấu một đồng vàng dưới tảng đá cạnh ổ, ngày nào cũng ra xem nó còn không.'],
      home: ['Mùa này bạn giữ lửa trên đài cho thị tộc. Lửa không được tắt, kể cả khi mưa đá.', 'Bạn dắt đoàn lữ khách qua đèo đá nóng, nơi chỉ người có vảy mới đi chân trần được.', 'Thị tộc cử bạn sang thị tộc bên kia núi mang quà kết thân: một quả trứng đá chạm khắc.', 'Bạn đánh bóng vảy, mài sừng, rồi đứng gác ở cổng thị tộc suốt mùa hội.'],
      away: ['Ở {h} người ta nhìn sừng của bạn rồi nhìn ra cửa, như đo xem bạn có lọt qua không.', 'Bạn sưởi sát lò của quán trọ tới mức chủ quán sợ cháy vảy. Vảy không cháy; cái ghế thì cháy.', 'Trẻ con ở {h} chạy theo xin bạn thổi lửa. Bạn thổi một hơi nhỏ cho chúng xem; mẹ chúng kéo chúng về.'],
      old: ['Bạn ngồi trên đài lửa cả ngày, nhìn mây đi qua đỉnh núi, đếm những thị tộc đã tắt lửa trong đời mình.'] },
    construct: { skill: 'Construct',
      young: ['Bạn tập cầm một quả trứng mà không làm vỡ. Tới quả thứ mười hai thì được.', 'Thợ đúc dạy bạn nhận mặt người. Bạn nhớ được ba trăm khuôn mặt trong một tuần, nhưng chưa biết ai đang cười.', 'Bạn chạy thử quanh xưởng cả ngày; thợ đúc ngồi ghi lại tiếng kêu của từng khớp.'],
      home: ['Mùa này bạn làm ở dây chuyền đúc, ngày đêm không nghỉ, cũng không ai bắt bạn nghỉ.', 'Bạn ngồi cùng các Cơ Nhân khác so tiếng kêu của khớp, thay cho nhau những con ốc lệch.', 'Hội đồng xưởng bàn có nên đúc thêm Cơ Nhân mới không. Bạn bỏ phiếu thuận, rồi thức cả đêm nghĩ về lá phiếu của mình.', 'Bạn lau lại tượng người thợ đúc đầu tiên ở quảng trường, như mọi Cơ Nhân trong xưởng vẫn làm mỗi năm.'],
      away: ['Ở {h} trẻ con gõ vào vỏ bạn để nghe tiếng. Bạn đứng yên cho chúng gõ.', 'Bạn làm thuê khuân vác ở {h}. Chủ trả nửa công: "Máy thì cần gì ăn."', 'Không ai ở {h} bán đúng loại dầu cho khớp của bạn. Bạn tự pha bằng mỡ cừu và nhựa thông.'],
      old: ['Bạn đi chậm lại, mỗi bước kêu một tiếng. Lũ trẻ trong xưởng gọi bạn là Ông Đồng Hồ.'] }
  };
  G.lifeBucket = (S, X) => {
    const st = X.stage(S), L = LIFE[S.race]; if (!L) return null;
    if (st === 'child' || st === 'teen' || st === 'infant') return 'young';
    if (st === 'elder' && L.old && X.chance(.6)) return 'old';
    if (G.amongKin(S) || (G.raceHome(S) && S.urban === false)) return 'home';
    return S.race === 'merfolk' && !seaSide(S) ? 'inland' : 'away';
  };
  const PFX = { elf: 'elf', dwarf: 'dwf', orc: 'orc', beastfolk: 'bst', fae: 'fae', merfolk: 'mer', dragonkin: 'drg', construct: 'cst' };
  for (const race of Object.keys(LIFE)) add(race, [
    { id: PFX[race] + '_days', st: ['child', 'teen', 'adult', 'elder'], rep: true, gap: 2, w: 4.5, run(S, X) {
        const L = LIFE[S.race], b = G.lifeBucket(S, X), z = X.reg(S).zones[1] || X.reg(S).zones[0];
        const t = X.pick(L[b]).replace(/\{h\}/g, homeName(S, X)).replace(/\{z\}/g, z.nameVi);
        if (b === 'young') { X.gain(L.skill, 2); X.add('h', 2); } else if (b === 'home') { X.add('so', 2); X.add('h', 2); } else if (b === 'old') { X.add('sm', 2); X.add('h', 1); } else { X.add('sm', 1); X.add('h', -1); }
        return { t, k: b === 'home' || b === 'young' ? 'good' : 'info', o: b };
      } }
  ]);

  // ═════════ 2. Giọng theo giống loài ═════════
  // Lễ hội của từng tộc. Ở khu của tộc khác thì là lễ của tộc chủ nhà, bạn đứng xem.
  const FEST = {
    human:     h => `Lễ hội mùa gặt ở ${h}. Người ta nhảy tới khi đèn lồng tắt.`,
    elf:       h => `Đêm Lá Rụng ở ${h}: cả tộc treo đèn lên tán Cây Mẹ, hát tên những người đã đi xa.`,
    dwarf:     h => `Ngày Mở Lò ở ${h}: cả hầm nhóm lại lò chung, bánh nướng trên mặt đe, thùng rượu đầu mùa được khui.`,
    orc:       h => `Hội Lửa Sói ở ${h}: đấu vật quanh đống lửa, cả trại nướng nguyên một con bò rừng.`,
    beastfolk: h => `Đêm Trăng Tròn ở ${h}: cả bầy họp quanh cột totem lớn, hú tới sáng.`,
    fae:       h => `Hội đình mùa ở ${h}: hoa nở theo nhịp trống, không ai được về trước khi trăng lặn.`,
    merfolk:   h => `Lễ Triều Cường ở ${h}: cả đàn thả đèn xuống nước, hát cho con nước lớn.`,
    dragonkin: h => `Đêm Đài Lửa ở ${h}: các thị tộc thắp lửa trên đỉnh đài, đọc tên tổ tiên từ thời còn có cánh.`,
    construct: h => `Ngày Lò Đúc Mẹ ở ${h}: cả xưởng gõ búa cùng một nhịp, đọc số hiệu những người đã ngừng quay.`,
    skeleton:  h => `Lễ Lăng Chính ở ${h}: dân Bộ Xương rước tro tổ ra phố, thắp đèn xanh trong hốc mắt.`
  };
  const FIRST = {
    elf: ['"lá"', '"sao"', 'một câu hát ru, đủ cả lời', '"mẹ"'], dwarf: ['"đá"', '"lửa"', '"búa"', '"của tôi"'], orc: ['"thịt"', '"đánh"', '"không"', '"mẹ"'],
    beastfolk: ['một tiếng gầm gừ rất khẽ', '"chạy"', '"trăng"', '"mẹ"'], fae: ['một từ trong tiếng hoa', '"bay"', '"không"', 'tên một con bướm'],
    merfolk: ['"nước"', '"cá"', 'một nốt hát dài', '"mẹ"'], dragonkin: ['"lửa"', '"vàng"', '"của tôi"', '"ông"']
  };
  const LETTERS = {
    elf: 'Bà cố dạy bạn đọc vân trên lá: mỗi đường gân là một chữ của tiếng cổ.',
    dwarf: 'Ông nội dạy bạn đọc rune trên vách đại sảnh, từng dòng từ đời tổ.',
    orc: 'Bà đồng của trại dạy bạn vạch dấu tộc lên da thuộc: dấu đi săn, dấu có thù, dấu có nước.',
    beastfolk: 'Người già trong bầy dạy bạn đọc dấu móng, dấu cào trên vỏ cây; mỗi dấu là một lời nhắn.',
    fae: 'Một Yêu Tinh già dạy bạn viết bằng sương đọng trên mạng nhện. Chữ tan khi trời nắng, nên phải nhớ.',
    merfolk: 'Bà dạy bạn đọc chữ khắc trên vỏ ốc xà cừ, xoay vỏ ốc trong tay mà đọc.',
    dragonkin: 'Ông nội dạy bạn đọc chữ cháy trên vách đá, viết bằng lửa từ trong cổ họng.',
    construct: 'Thợ đúc nạp bảng chữ cái vào lõi bạn trong một đêm. Sáng ra bạn đọc được, nhưng chưa hiểu.'
  };
  const ACHES = {
    elf: 'Lần đầu sau mấy trăm năm, tay bạn run khi giương cung. Tóc bạn không bạc, nhưng mắt đã mờ.',
    dwarf: 'Đầu gối bạn kêu như bản lề cửa hầm. Bạn vẫn xuống mỏ, chỉ là chậm hơn.',
    orc: 'Mấy vết sẹo cũ nhức mỗi khi trời trở. Bạn không còn vật thắng nổi đứa trẻ nào trong trại.',
    beastfolk: 'Lông bạn bạc từng mảng, mũi không còn đánh hơi được xa như trước.',
    fae: 'Cánh bạn bạc màu như lá cuối thu, không nâng nổi bạn lên quá đầu gối người.',
    merfolk: 'Vảy bạn bong từng mảng, lặn sâu một chút là tai ù.',
    dragonkin: 'Lửa trong bụng bạn nguội dần. Mùa đông năm nay bạn không thở nổi một ngọn lửa để nhóm bếp.'
  };
  const HUNGER = {
    elf: 'Năm ấy cây rừng không ra quả. Cả tộc ăn rễ cây và vỏ thông cho tới mùa xuân.',
    dwarf: 'Ruộng nấm dưới hầm thối hết vì ẩm. Cả nhà ăn bánh rêu khô cho tới mùa sau.',
    orc: 'Đàn thú không về. Cả trại giết ngựa già để ăn qua đông.',
    beastfolk: 'Mùa săn trắng tay. Cả bầy chia nhau từng miếng xương.',
    fae: 'Mùa không có hoa. Mật cạn, cả đình ăn sương cho tới khi xuân về.',
    merfolk: 'Biển cạn cá, rạn san hô bạc trắng. Cả đàn ăn rong cho tới mùa nước ấm.',
    dragonkin: 'Dê núi bỏ đi hết. Thị tộc nấu súp xương rồng đá cho tới mùa sau.'
  };
  const HARVEST = {
    elf: ['Vườn quả trong rừng sai trĩu. Bạn đổi thêm được', 'Sâu ăn hết vườn quả trong rừng; bạn lỗ'],
    dwarf: ['Ruộng nấm dưới hầm mọc dày. Bạn bán thêm được', 'Ruộng nấm dưới hầm bị nấm mốc ăn mất; bạn lỗ'],
    fae: ['Hoa nở kín trảng, mật đầy bình. Bạn đổi thêm được', 'Sương muối đến sớm, hoa rụng hết; bạn lỗ'],
    merfolk: ['Vườn tảo và bãi nuôi trai được mùa. Bạn bán thêm được', 'Nước đỏ tràn qua bãi nuôi trai; bạn lỗ'],
    dragonkin: ['Ruộng bậc thang bên sườn núi lửa được mùa. Bạn bán thêm được', 'Tro núi rơi phủ kín ruộng bậc thang; bạn lỗ'],
    construct: ['Cỗ máy cày bạn tự lắp chạy suốt mùa không hỏng. Bạn bán thêm được', 'Máy cày gãy trục giữa mùa; bạn lỗ'],
    orc: ['Đàn bò rừng sinh sôi. Bạn bán thêm được', 'Dịch bò tràn qua trại; bạn lỗ'],
    beastfolk: ['Đàn dê trên đồi đẻ sai. Bạn bán thêm được', 'Sói lạ về ăn mất nửa đàn; bạn lỗ']
  };
  const OLDFRIEND_LONG = 'Bạn tìm lại người bạn loài người chơi cùng hồi nhỏ. Người ra mở cửa là chắt của họ, và cụ đã mất từ lâu. Cả nhà mời bạn ở lại ăn cơm, nghe bạn kể về ông cụ.';
  G.RACE_VOICE = {
    ch_festival: (S, X) => {
      const h = homeName(S, X), me = S.race;
      if (G.amongKin(S) || me === 'human' && !G.hostRace(S)) return me === 'human' ? null : FEST[me](h);
      const r = G.hostRace(S); if (!r || r === me || !FEST[r]) return null;
      return `${FEST[r](h)} Bạn đứng ở rìa đám đông: đây là lễ của ${raceVi(r)}, không phải của tộc bạn. Vẫn có người kéo bạn vào cùng.`;
    },
    ad_harvest: (S, X, r, dg) => { const V = HARVEST[S.race]; if (!V || !G.raceHome(S) && S.race !== 'construct') return null; return dg >= 0 ? `${V[0]} ${G.coin(dg)}.` : `${V[1]} ${G.coin(-dg)}.`; },
    inf_word: S => FIRST[S.race] ? `Từ đầu tiên bạn nói là ${FIRST[S.race][Math.floor(S.birthYear * 7 + S.age) % FIRST[S.race].length]}.` : null,
    ch_letters: S => LETTERS[S.race] || null,
    el_aches: S => ACHES[S.race] || null,
    ch_hunger: S => HUNGER[S.race] || null,
    inf_fever: S => S.race === 'dragonkin' ? 'Bạn nóng như than suốt ba ngày, nóng cả với Long Nhân. Mẹ ôm bạn ngồi trong suối lạnh.' : S.race === 'merfolk' ? 'Bạn sốt ba ngày liền, vảy khô và bạc. Mẹ ngâm bạn trong nước biển suốt đêm.' : null,
    ad_old_friend: S => ['elf', 'dwarf', 'dragonkin', 'fae', 'merfolk'].includes(S.race) && S.age * G.RACES[S.race].ypt > 90 && !G.amongKin(S) ? OLDFRIEND_LONG : null
  };
  G.RACEV = { stats: false, n: {}, own: {}, voice: {} };
  G.racevReset = () => { G.RACEV.n = {}; G.RACEV.own = {}; G.RACEV.voice = {}; G.RACEV.byId = {}; };
  G.racevReset();

  // ═════════ 3. Bọc, chủ đề ═════════
  G.THEMES.stranger = { nameVi: 'Xa tộc, bị nhìn khác', gap: 3 };
  G.THEMES.clan = { nameVi: 'Nợ, thù của tộc', gap: 4 };
  for (const e of EV) { G.EVENTS.push(e); G.treeWrap.event(e); }
  for (const id of Object.keys(decs)) G.treeWrap.decision(id, DEC[id]);
  // Yêu Tinh ngủ quên trong trảng là chuyện thường của họ (lore của vùng), không phải sự kiện.
  { const m = G.treeMeta('ad_fae_sleep'); if (m) m.notRace = ['fae']; }
  // Giọng: giữ tác dụng của sự kiện gốc, đổi câu chữ. Hàm bọc giữ mã nguồn hàm gốc (trang duyệt trích câu chữ bằng toString).
  for (const [id, fn] of Object.entries(G.RACE_VOICE)) {
    const e = G.EVENTS.find(x => x.id === id); if (!e) continue;
    const r0 = e.run;
    e.run = function (S, X) {
      const g0 = S.gold, r = r0.call(this, S, X);
      if (!r || S.dead || S.undead) return r;
      const t = fn(S, X, r, S.gold - g0);
      if (t) { r.t = t; if (G.RACEV.stats) G.RACEV.voice[S.race] = (G.RACEV.voice[S.race] || 0) + 1; }
      return r;
    };
    e.run.toString = () => r0.toString();
  }
  // Đếm cho sim.html: mỗi giống loài bao nhiêu sự kiện đời người, bao nhiêu là của riêng tộc mình.
  { const own = new Set(EV.map(e => e.id).concat(['tn_rite', 'con_oil', 'con_dream']));
    const r0 = G.runEvent;
    G.runEvent = function (X, ev) {
      if (G.RACEV.stats && !X.S.undead) { const R = G.RACEV, r = X.S.race; R.n[r] = (R.n[r] || 0) + 1; if (own.has(ev.id)) { R.own[r] = (R.own[r] || 0) + 1; R.byId[ev.id] = (R.byId[ev.id] || 0) + 1; } }
      return r0(X, ev);
    }; }
  G.RACEV_DECS = decs;
  G.RACE_VOICE_TEXT = { FEST: Object.fromEntries(Object.entries(FEST).map(([r, f]) => [r, f('‹nơi ở›')])), FIRST, LETTERS, ACHES, HUNGER, HARVEST, OLDFRIEND_LONG };
  // Tên và điều kiện của từng nút cho trang duyệt (review/content-data.html): id → [tên, khi nào].
  const HOME = 'ở quê tộc', AWAY = 'ở khu của tộc khác, thị trấn trở lên';
  G.RACEV_TITLE = {
    elf_name: ['Tên thật', 'thiếu niên'], elf_mortal: ['Người bạn loài người', 'trẻ con, thiếu niên'], elf_trance: ['Thiền thay ngủ', 'thiếu niên'],
    elf_loggers: ['Tiếng rìu ở bìa rừng', 'người lớn sống ở biome rừng'], elf_axe: ['Tiều phu chặt cây có tên', 'sau "Tiếng rìu ở bìa rừng"'],
    elf_axe_feud: ['Tiều phu quay lại với lính', 'sau khi bắn cảnh cáo, 1–4 lượt'], elf_axe_pact: ['Giao kèo trồng lại cây', 'sau khi thương lượng, 1–5 lượt'], elf_axe_lost: ['Bìa rừng lùi vào', 'sau khi để mặc, 1–4 lượt'],
    elf_sea: ['Tiếng mòng biển', 'người lớn; ven biển nặng gấp năm'], elf_grief: ['Sầu héo', 'bạn đời hoặc con đã mất'], elf_smoke: ['Khói thành phố', AWAY], elf_deadwood: ['Không chặt cây sống', 'biome rừng'],
    elf_century: ['Tròn trăm tuổi', 'mỗi trăm năm, từ 200 tuổi'], elf_dream: ['Mộng Rừng báo quái', HOME + ', giữ tập tục'], elf_stars: ['Hát tên sao', 'tuổi già'], elf_days: ['Đời thường của Tiên Tộc', 'mọi tuổi, lặp'],
    dwf_dark: ['Nhìn trong tối', 'trẻ con'], dwf_cup: ['Món đồ đầu tay', 'trẻ con'], dwf_beard: ['Bím râu đầu tiên', 'thiếu niên'],
    dwf_mood: ['Cơn nhập thần', 'Chế tác ≥ 20 hoặc làm thợ mỏ, thợ rèn, kim hoàn, điêu khắc, khắc văn'], dwf_cheat: ['Thương nhân quỵt nợ', 'người lớn'],
    dwf_grudge: ['Sổ Thù', 'sau "Thương nhân quỵt nợ"'], dwf_grudge_paid: ['Đòi được nợ', 'sau khi ghi Sổ Thù, 2–12 lượt'], dwf_grudge_blood: ['Đòi nợ bằng máu', 'sau khi ghi Sổ Thù, 2–12 lượt'], dwf_grudge_heir: ['Nợ sang đời con', 'sau khi ghi Sổ Thù, 6–16 lượt'],
    dwf_shame: ['Cúi đầu trước tổ tiên', 'bị tộc ruồng bỏ, Tâm trạng < 22 hoặc từng phát điên'], dwf_slayer: ['Lời thề Kẻ Diệt', 'sau "Cúi đầu trước tổ tiên"'],
    dwf_flood: ['Đào trúng nước, dung nham', 'thợ mỏ, hoặc ở núi quê tộc'], dwf_deep: ['Đào quá sâu', 'thợ mỏ hoặc ở núi, quê tộc'], dwf_sky: ['Trời quá rộng', 'ngoài núi, ở khu của tộc khác'], dwf_ale: ['Rượu đầu mùa', 'giữa người cùng tộc'], dwf_hall: ['Tên trên vách đại sảnh', 'tuổi già'], dwf_days: ['Đời thường của Người Lùn', 'mọi tuổi, lặp'],
    orc_scar: ['Vết sẹo đầu', 'trẻ con'], orc_runt: ['Đứa còi trong lứa', 'trẻ con'], orc_name: ['Tên theo việc làm', 'thiếu niên'], orc_wind: ['Tổ tiên nói trong gió', 'thiếu niên, ở quê hoặc giữa tộc'],
    orc_rival: ['Kẻ bị bẻ nanh', 'người lớn'], orc_rival_back: ['Kẻ thù cũ quay lại', 'sau "Kẻ bị bẻ nanh", 2–7 lượt'], orc_rival_brother: ['Kết nghĩa', 'sau "Kẻ bị bẻ nanh", 2–7 lượt'], orc_rival_dead: ['Kẻ thù chết ở xa', 'sau "Kẻ bị bẻ nanh", 3–9 lượt'],
    orc_gather: ['Cơn Gầm Lớn', 'ở quê hoặc giữa tộc; nặng hơn khi có chiến tranh, quái tràn'], orc_scorn: ['Ánh mắt ở chợ', AWAY], orc_drought: ['Đàn bò không về, giếng cạn', 'thảo nguyên, sa mạc, ngoài thị trấn'],
    orc_blood: ['Em họ giết người', 'người lớn'], orc_price: ['Giá máu', 'sau "Em họ giết người"'], orc_feud: ['Hai trại thành thù', 'sau khi không trả giá máu, 1–4 lượt'], orc_elder: ['Người Già', 'tuổi già'], orc_days: ['Đời thường của Orc', 'mọi tuổi, lặp'],
    bst_moon: ['Sinh dưới trăng nào', 'sơ sinh'], bst_nose: ['Mũi thính', 'trẻ con'], bst_howl: ['Tiếng hú đầu tiên', 'trẻ con, thiếu niên; ở quê hoặc giữa bầy'], bst_totem: ['Khắc lên cột totem', 'thiếu niên giữa bầy'],
    bst_molt: ['Mùa thay lông', 'thiếu niên, người lớn'], bst_alpha_old: ['Con đầu đàn đã già', 'người lớn giữa bầy'], bst_alpha: ['Thách con đầu đàn', 'sau "Con đầu đàn đã già"'],
    bst_alpha_rule: ['Làm đầu đàn', 'sau khi thách và thắng, 2–8 lượt'], bst_alpha_pass: ['Con đầu đàn già mất', 'sau khi đứng sau con đầu đàn, 2–8 lượt'],
    bst_muzzle: ['Rọ mõm', AWAY], bst_poacher: ['Kẻ săn da', 'người lớn; vùng nguy hiểm, xa tộc nặng hơn'], bst_herd: ['Theo đàn, mùa nấm', HOME], bst_teeth: ['Răng mòn', 'tuổi già'], bst_days: ['Đời thường của Người Thú', 'mọi tuổi, lặp'],
    fae_truename: ['Tên thật', 'trẻ con'], fae_glamour: ['Ảo dung', 'thiếu niên'], fae_wings: ['Cánh mở', 'thiếu niên'], fae_iron: ['Sắt lạnh', AWAY], fae_thanks: ['Lời cảm ơn', 'người lớn ở khu của tộc khác'],
    fae_ring: ['Dẫn điệu vòng nấm', HOME], fae_court_call: ['Sứ giả hai đình', 'người lớn, ở quê hoặc giữa tộc'], fae_court: ['Đình Hạ hay Đình Đông', 'sau "Sứ giả hai đình"'],
    fae_midsummer: ['Đêm hội giữa hè', 'theo Đình Hạ, 2–8 lượt'], fae_tithe: ['Bảy năm nộp một linh hồn', 'theo Đình Đông, 3–10 lượt'],
    fae_plea: ['Người phàm xin giúp', 'người lớn'], fae_deal: ['Giao kèo', 'sau "Người phàm xin giúp"'], fae_deal_kept: ['Đứa trẻ sống sót', 'sau khi lấy ký ức, 1–6 lượt'], fae_deal_cheat: ['Kẻ quỵt giao kèo', 'sau khi lấy vàng, 1–4 lượt'],
    fae_lover: ['Người tình héo mòn', 'người lớn'], fae_seasons: ['Gốc Già', 'tuổi già'], fae_days: ['Đời thường của Yêu Tinh', 'mọi tuổi, lặp'],
    mer_gills: ['Mang mở', 'sơ sinh, trẻ con'], mer_reef: ['Vườn san hô', 'trẻ con, thiếu niên ven biển'], mer_whale: ['Hát cùng cá voi', 'thiếu niên ven biển'], mer_dry: ['Khô vảy', 'người lớn xa biển'],
    mer_rock: ['Phơi nắng trên bãi đá', 'người lớn ven biển, chưa có bạn đời'], mer_cloak: ['Áo vảy bị giấu', 'sau "Phơi nắng trên bãi đá"'], mer_cloak_found: ['Tìm lại áo vảy', 'sau khi ở lại, 3–10 lượt'],
    mer_drowned: ['Kéo người chết đuối', 'ven biển'], mer_song: ['Tàu lạc gần bãi đá', 'người lớn ven biển'], mer_siren: ['Tiếng hát gọi tàu', 'sau "Tàu lạc gần bãi đá"'],
    mer_siren_seen: ['Người sống sót nhận ra giọng', 'sau khi cùng hát, 1–6 lượt'], mer_siren_gift: ['Rương phao đỏ', 'sau khi báo tàu, 1–6 lượt'],
    mer_pearl: ['Bán ngọc', 'thị trấn ven biển'], mer_storm: ['Lặn dưới bão', 'ven biển, quê tộc'], mer_deep: ['Về vùng sâu', 'tuổi già'], mer_days: ['Đời thường của Hải Tộc', 'mọi tuổi, lặp'],
    drg_egg: ['Trứng nở', 'sơ sinh'], drg_spring: ['Tắm suối nóng', 'trẻ con, thiếu niên ở núi lửa, xứ nóng'], drg_struck: ['Sét đánh trúng', 'thiếu niên ở Đỉnh Lôi Vân'], drg_roar: ['Tiếng gầm đầu', 'thiếu niên'],
    drg_shed: ['Lột vảy', 'người lớn'], drg_greed: ['Đếm tiền mỗi đêm', 'tiền > 3 lần trung vị'], drg_hoard: ['Lòng tham rồng', 'sau "Đếm tiền mỗi đêm"'], drg_thief: ['Kẻ trộm chiếc cốc', 'sau khi dựng kho, 1–6 lượt'],
    drg_debt: ['Người cùng thị tộc bỏ trốn', 'người lớn'], drg_clan: ['Danh dự thị tộc', 'sau "Người cùng thị tộc bỏ trốn"'], drg_hunt_kin: ['Bắt người trốn nợ về', 'sau khi đi bắt, 1–4 lượt'],
    drg_cold: ['Máu lạnh', 'xứ lạnh'], drg_wings: ['Mầm cánh', 'Lửa ≥ 40 hoặc Tier ≥ 2'], drg_slayer: ['Hiệp sĩ săn rồng', 'ở khu của tộc khác'], drg_dream: ['Giấc mơ rồng', 'tuổi già'], drg_days: ['Đời thường của Long Nhân', 'mọi tuổi, lặp'],
    cst_light: ['Lần đầu mở mắt', 'lượt đầu (trẻ con, thiếu niên)'], cst_plate: ['Tấm biển số hiệu', 'thiếu niên, người lớn'], cst_maker: ['Người đúc già', 'đã có người đúc'],
    cst_worn: ['Lõi đã mòn', 'Rỉ khớp, Sinh lực < 50 hoặc từ 60 tuổi'], cst_core: ['Thay lõi', 'sau "Lõi đã mòn"'], cst_core_after: ['Người quen không nhớ', 'sau khi thay lõi mới, 1–4 lượt'],
    cst_humid: ['Hơi ẩm', 'xứ ẩm (sương, đảo, đầm, rừng rêu)'], cst_scrap: ['Kẻ trộm phụ tùng', AWAY], cst_mother: ['Lò Đúc Mẹ', 'Phế Xưởng Đúc hoặc giữa tộc'], cst_soul: ['Có linh hồn không', 'có đạo hoặc vùng theo Quang Minh'],
    cst_twin: ['Cùng khuôn đúc', 'người lớn'], cst_count: ['Đếm nhịp', 'tuổi già'], cst_days: ['Đời thường của Cơ Nhân', 'mọi tuổi, lặp'],
    hum_hurry: ['"Loài người làm gì cũng vội"', 'khu có giống loài sống lâu'], hum_flood: ['Lũ đồng bằng', 'Đồng Kim Hà, Bờ Sương Mù; vùng quê hoặc làm ruộng, chăn nuôi'], hum_crowd: ['Chợ phiên thành lớn', 'trẻ con, thiếu niên ở thành phố, kinh đô']
  };
})(window.LifeSim);
