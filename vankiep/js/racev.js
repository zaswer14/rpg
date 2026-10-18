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
        return { t: `Bạn đã ${X.years(S)} tuổi mà cả tộc vẫn gọi bằng cái tên ở nhà, cái tên mẹ đặt cho một đứa bé chưa biết sẽ thành ai. Tiên Tộc không vội: tên thật chỉ đặt khi đã thấy đứa trẻ lớn lên thành người thế nào. Đêm ấy các bô lão ngồi vòng tròn dưới Cây Mẹ, bàn tới khi sương xuống ướt vai. Rồi người già nhất đứng dậy, gọi bạn bằng một cái tên có nghĩa là "${m}". Suốt đường về bạn lẩm nhẩm nó, như sợ đánh rơi.`, k: 'big', o: S.path || 'none' }; } },
    { id: 'elf_mortal', st: CT, w: 3, run(S, X) {
        const nm = X.name('human', X.chance(.5) ? 'm' : 'f'); X.add('h', -3); X.add('sm', 4); X.add('so', 3);
        if (G.castAdd) G.castAdd(S, X, { name: nm, race: 'human', role: 'ban', how: 'đứa trẻ loài người chơi với bạn hồi nhỏ', yrs: X.int(22, 34), bond: 40, drive: X.rnd() });
        return { t: `${first(nm)} là đứa trẻ loài người ở làng bìa rừng, hay trốn mẹ vào trảng chơi với bạn, hai đứa trèo cây hái quả tới tối mịt. Vài mùa đông sau, ${first(nm)} đã cao hơn bạn một cái đầu, giọng ồm như người lớn. Bạn thì vẫn chưa bắn trúng nổi một mũi tên. Tới hôm mũi tên đầu tiên của bạn cắm giữa đích, ${first(nm)} đã bế con đi chợ. Bạn chạy ra bìa rừng định khoe, rồi đứng lại, không biết nói gì.`, k: 'info' }; } },
    { id: 'elf_trance', st: ['teen'], w: 3, run(S, X) { X.gain('Spirit', 4); X.add('hl', 3);
        return { t: 'Người lớn trong tộc dạy bạn cách nghỉ của Tiên Tộc: không nằm, không nhắm mắt, chỉ ngồi lặng bốn tiếng giữa đêm. Mấy đêm đầu bạn cứ chực ngủ gật. Tới đêm thứ mười, đầu óc bạn tự đi lại trong ký ức cũ, rõ tới mức ngửi thấy cả mùi sữa của mẹ hồi còn ẵm ngửa. Sáng ra bạn tỉnh táo hơn mọi đêm ngủ say.', k: 'good', f: 'Tiên Tộc không ngủ. Khi thiền họ sống lại ký ức của chính mình, rõ như lúc nó xảy ra.' }; } },
    { id: 'elf_loggers', st: AD, c: S => FOREST.includes(bio(S)) && !S.flags.elfAxeQ, w: 2.2, tree: { theme: 'clan', dir: { vo: 1, dao: 1, gia: .5 } }, run(S, X) {
        S.flags.elfAxeQ = true; return { t: 'Một sáng có tiếng rìu vọng vào từ bìa rừng, đều đều, chát chúa. Bạn lần theo tiếng ấy và thấy một toán tiều phu loài người đang hạ cây sồi già mà tộc bạn vẫn gọi bằng tên. Vết rìu đã ăn sâu vào thân, nhựa cây ứa ra thành dòng. Họ còn chưa thấy bạn.', k: 'info' }; } },
    { id: 'elf_axe_feud', st: AD, w: 3, tree: { from: ['elf_axe:warn'], wait: [1, 4], dir: { vo: 2 } }, run(S, X) {
        if (X.chance(odds(S, X, .45))) { S.fame += 3; X.gain('Bow', 3); return { t: 'Toán tiều phu quay lại, lần này có lính tỉnh đi kèm, đuốc cháy rừng rực trong tay. Bạn nấp trên tán cây, bắn từng mũi một, ghim từng ngọn đuốc xuống đất trước khi họ kịp châm. Lính tỉnh ngửa cổ nhìn lên mà không thấy ai. Họ rút về lúc trời chưa tối, và không quay lại nữa.', k: 'good', o: 'win' }; }
        X.add('hl', -14); X.money(-Math.round(med(S, X) * .3)); X.add('h', -8);
        return { t: 'Toán tiều phu quay lại với lính tỉnh. Họ đốt một góc rừng để dọn đường, khói cuộn đen cả buổi chiều. Bạn lao vào kéo lũ trẻ ra khỏi khói thì trúng một mũi nỏ vào vai. Đêm ấy cả tộc ngồi nhìn ánh lửa ở bìa rừng, không ai nói một lời.', k: 'bad', o: 'lose' }; } },
    { id: 'elf_axe_pact', st: AD, w: 3, tree: { from: ['elf_axe:talk'], wait: [1, 5], dir: { gia: 1, tri: 1, thuong: 1 } }, run(S, X) {
        X.add('so', 6); X.add('h', 6);
        return { t: 'Trưởng toán tiều phu giữ lời. Mỗi cây họ chặt ở rừng tạp, họ trồng lại hai cây, mùa nào cũng thế. Thằng con trai ông ta hay theo bố vào rừng, rồi lẽo đẽo theo bạn hỏi đủ thứ. Bạn dạy nó cây nào đã có tên, cây nào chưa. Nó học nhanh hơn bạn tưởng.', k: 'good' }; } },
    { id: 'elf_axe_lost', st: AD, w: 3, tree: { from: ['elf_axe:leave'], wait: [1, 4] }, run(S, X) {
        X.add('h', -6);
        return { t: 'Bìa rừng lùi vào thêm một dặm, chỗ cây sồi cũ giờ chỉ còn một gốc cụt nham nhở. Mùa xuân năm ấy chim không về làm tổ ở đó. Bạn đi ngang qua mấy lần, lần nào cũng bước nhanh hơn. Cái tên của cây sồi, người trong tộc dần thôi nhắc.', k: 'bad' }; } },
    { id: 'elf_sea', st: AD, w: S => seaSide(S) ? 2.5 : .5, tree: { dir: { du: 2, dao: 1 } }, run(S, X) {
        X.add('h', -4); G.trajBump(S, { du: .4 }); S.flags.seaLong = true;
        if (!S.flags.migrateQ && !seaSide(S)) S.flags.migrateQ = 'Tiếng mòng biển không để bạn yên.';
        return { t: 'Lần đầu tiên bạn nghe tiếng mòng biển, kêu xa xa trên đầu, gió mang theo một mùi muối lạ. Bạn đứng sững giữa đường, quên cả mình đang đi đâu. Từ đêm ấy bạn mơ mãi một bờ biển ở phía tây, cát trắng, nước xám, nơi bạn chưa từng đặt chân tới. Sáng nào thức dậy, bạn cũng thấy mình đang quay mặt về phía tây.', k: 'big', f: 'Người già trong tộc nói ai đã nghe biển gọi thì không bao giờ hết nhớ biển.' }; } },
    { id: 'elf_grief', st: AD, rep: true, gap: 6, c: (S, X) => !X.hasCond('grief') && ((S.family.spouse && !S.family.spouse.alive) || S.family.kids.some(k => !k.alive)), w: 4, run(S, X) {
        const sp = S.family.spouse && !S.family.spouse.alive ? first(S.family.spouse.name) : null;
        X.cond('grief'); X.add('h', -10);
        return { t: sp ? (S.age % 2 ? `Có những đêm bạn vẫn nghe tiếng ${sp} gọi ngoài hiên, rõ từng chữ, như ngày còn sống. Bạn ra mở cửa, chỉ có gió. Tiên Tộc không quên được gì, nên cũng khó nguôi được gì. Lá ngoài sân rụng kín lối mà bạn không buồn quét.` : `${sp} mất đã lâu mà bạn vẫn đặt hai cái chén trên bàn, sáng nào cũng rót đủ cả hai. Chén kia nguội dần, tối bạn đổ đi, mai lại rót. Tiên Tộc không quên được gì, nên cũng khó nguôi được gì. Người trong nhà thấy bạn gầy đi, đi đâu cũng chậm như đang nghe ngóng điều gì.`)
          : S.age % 2 ? 'Tiếng trẻ con chơi ở bìa rừng làm bạn ngoái lại, lần nào cũng tưởng là con mình. Cái đêm đứa bé mất, bạn vẫn nhớ từng ngọn nến, từng tiếng gió. Tiên Tộc không quên được gì, nên cũng khó nguôi được gì. Bạn thôi đi qua lối ấy.' : 'Bạn vẫn nhớ từng ngón tay của đứa con đã mất, nhớ cả hơi ấm lúc nó ngủ gục trên vai mình, rõ như hôm qua. Tiên Tộc không quên được gì, nên cũng khó nguôi được gì. Có những chiều bạn ngồi bên chiếc nôi cũ, tay đặt lên thành gỗ, tới khi trời tối.', k: 'bad', f: 'Tiên Tộc không chết vì già. Họ chết vì gươm giáo, hoặc vì sầu.' }; } },
    { id: 'elf_smoke', st: AD, rep: true, gap: 4, c: S => stranger(S) && isTown(S), w: S => wary(S) ? 4 : 2.2, tree: { theme: 'stranger' }, run(S, X) {
        X.add('h', -4); X.add('so', wary(S) ? -4 : -2);
        return { t: wary(S) ? (S.age % 2 ? `Ở ${homeName(S, X)} có lệnh mới: người tai nhọn phải trình giấy mỗi lần qua cổng. Bạn đứng xếp hàng sau một đoàn xe chở than, khói táp vào mặt, đợi tới quá trưa. Viên lính đóng dấu xong còn dặn bạn đừng đi lại ban đêm. Bạn gật đầu, không cãi, mà tay nắm chặt dây cung.` : `Lính gác cổng ${homeName(S, X)} bắt bạn kéo mũ trùm xuống cho xem tai, lật đi lật lại như xem hàng ở chợ. Rồi họ ghi tên bạn vào sổ người lạ, viết sai cả tên. Khói lò rèn trong phố bám vào tóc bạn cả tuần không gội ra. Đêm nằm, bạn nhớ mùi lá mục ở quê tới cồn cào.`)
          : S.age % 2 ? `Phố ở ${homeName(S, X)} không có lấy một gốc cây cho ra hồn, chỉ có đá, khói và tiếng xe ngựa từ sáng tới khuya. Người ta xô vai bạn mà đi, chẳng ai ngoái lại. Bạn mua được một chậu cây con ở chợ, đặt trên bậu cửa sổ. Sáng nào bạn cũng nói với nó vài câu.` : `Khói lò rèn ở ${homeName(S, X)} bám vào tóc bạn cả tuần không gội ra. Người ta hỏi tuổi bạn, nghe xong thì phá lên cười, tưởng bạn đùa. Bạn cười theo cho qua chuyện. Tối về, bạn mở cửa sổ ngồi mãi, tìm một ngôi sao mà khói không che mất.`, k: 'bad' }; } },
    { id: 'elf_deadwood', st: AD, rep: true, gap: 5, c: S => FOREST.includes(bio(S)), w: 1.8, tree: { dir: { vo: 1, nghe: 1 } }, run(S, X) {
        X.gain('Bow', 4); X.add('so', 1);
        return { t: S.age % 2 ? 'Cây cung cũ đã nứt dọc thân. Tộc bạn không chặt cây sống, nên bạn đi theo những cơn gió lớn, chờ rừng tự rụng cho mình một cành. Lần này rừng đãi bạn một cành thủy tùng già, vân gỗ mịn như tơ. Cả mùa đông bạn ngồi gọt nó bên bếp lửa.' : 'Tộc bạn không chặt cây sống. Bạn đi cả tháng trời nhặt cành gãy sau bão, cành nào cũng cầm lên ngắm, uốn thử, rồi lại đặt xuống. Mãi tới một buổi chiều mưa mới chọn được một cành thủy tùng đủ thẳng. Cây cung làm xong, bạn bắn thử một mũi, nghe dây rung mà ưng cả bụng.', k: 'good' }; } },
    { id: 'elf_century', st: AD, rep: true, gap: 1, c: (S, X) => X.years(S) >= 200 && Math.floor(X.years(S) / 100) > (S.flags.elfCent || 1), w: 8, run(S, X) {
        const c = Math.floor(X.years(S) / 100); S.flags.elfCent = c; X.add('sm', 3);
        return { t: S.age % 2 ? `Bạn tròn ${c} trăm tuổi. Cây sồi bạn trồng hồi mới lớn giờ đã che bóng cả một khoảnh rừng. Những người loài người bạn từng quen đều đã nằm dưới đất, con cháu họ cũng đã bạc đầu. Một đêm bạn ngồi dưới gốc sồi ấy đếm lại từng gương mặt, và đếm mãi không hết.` : `Bạn tròn ${c} trăm tuổi. Ngôi làng nơi ngày trước bạn hay đổi da thú lấy muối giờ đã có tường đá, có cả tháp chuông. Chủ quán trọ là chắt của người bán muối năm xưa. Bạn kể ông ta nghe cụ ông hồi trẻ hay hát sai lời thế nào, và ông ta cười, không tin một chữ.`, k: 'info' }; } },
    { id: 'elf_dream', st: AD, rep: true, gap: 6, c: S => G.raceHome(S) && S.flags.custom !== 'lax', w: 1.5, run(S, X) {
        const z = X.reg(S).zones[1] || X.reg(S).zones[0], sp = X.monsterIn(z); X.gain('Arcane', 3); X.add('so', 3);
        return { t: S.age % 2 ? `Đêm Mộng Rừng, bạn ngồi cùng cả tộc dưới Cây Mẹ, mắt mở mà hồn đi xa. Lần này rừng cho thấy một ${sp.nameVi} đang làm ổ ở ${z.nameVi}. Tỉnh dậy, người nào cũng kể đúng một cảnh như nhau. Các thợ săn chuẩn bị bẫy ngay trong đêm.` : `Trong Mộng Rừng năm nay, cả tộc cùng thấy một ${sp.nameVi} đi qua ${z.nameVi}, chậm rãi, in dấu chân lên lớp lá ướt. Sáng ra không ai bảo ai, các thợ săn đã ngồi vạch đường trên đất. Họ biết nên đặt bẫy ở đâu. Bạn thì nhớ mãi đôi mắt con thú trong mơ, như nó cũng đang nhìn lại.`, k: 'good', f: X.factOf(sp) }; } },
    { id: 'elf_stars', st: ['elder'], w: 3, run(S, X) { X.add('sm', 4); X.add('so', 4);
        return { t: 'Các trưởng lão gọi bạn lên đồi, nơi cỏ thấp và trời rộng nhất, để học hát tên sao. Mỗi ngôi sao là một người trong tộc đã đi về phía tây. Bạn hát theo, giọng còn vấp, và nhận ra vài cái tên mình từng quen. Mùa sau, tới lượt bạn dạy lại cho người khác.', k: 'good' }; } }
  ]);
  dec('elf', 'elf_axe', {
    prio: 5, gap: 1, tree: { q: 'elfAxeQ' },
    when: S => !S.dead && !!S.flags.elfAxeQ,
    build(S, X) {
      return { title: 'Tiếng rìu ở bìa rừng', body: 'Cây sồi ấy đã đứng đó từ trước khi có làng của loài người, rễ nó lan tới tận bờ suối. Tộc bạn gọi nó bằng tên, mùa lá rụng nào cũng hát cho nó nghe. Bọn tiều phu thì không biết gì. Với họ, đó là gỗ.',
        choices: [{ k: 'warn', label: 'Bắn tên cảnh cáo', sub: 'Đuổi được họ đi, nhưng họ sẽ quay lại; có thể đông hơn.' },
          { k: 'talk', label: 'Ra gặp trưởng toán', sub: 'Thương lượng: chỉ cho họ rừng tạp, đổi lấy lời hứa trồng lại.' },
          { k: 'leave', label: 'Để mặc', sub: 'Không dính vào chuyện của loài người.' }] };
    },
    apply(S, X, k) {
      S.flags.elfAxeQ = null; cnt(S, 'elfAxe_' + k);
      if (k === 'warn') { X.gain('Bow', 3); X.add('so', -2); G.trajBump(S, { vo: .3 }); return 'Mũi tên cắm phập vào cán rìu, cách tay người tiều phu một gang. Cả toán buông đồ chạy tán loạn ra khỏi rừng. Người đi sau cùng ngoái lại, nhìn đường vào rừng rất lâu. Bạn biết họ sẽ quay lại.'; }
      if (k === 'talk') { X.add('so', 3); return 'Bạn bước ra khỏi tán cây, tay không cầm cung. Trưởng toán tiều phu nghe bạn nói hết, rồi bảo: "Chúng tôi cũng cần củi qua đông." Hai bên ngồi trên một gốc cây đổ tới tối, lấy que vạch ranh giới lên đất. Lúc chia tay, ông ta bắt tay bạn, bàn tay chai sần mà ấm.'; }
      X.add('h', -6); return 'Bạn quay lưng đi, không nhìn lại. Tiếng rìu theo bạn tới tận nhà, chát, chát, đều như nhịp tim. Tối ấy bạn bịt tai mà vẫn nghe. Gần sáng thì có tiếng cây đổ.';
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
        return { t: `Cha dẫn bạn xuống tầng sâu nhất của ${homeName(S, X)}, nơi hơi đá lạnh phả vào gáy, rồi thổi tắt đèn. Bạn nắm chặt vạt áo cha, tim đập thình thịch. Một lúc sau, vân đá trên vách hiện ra, từng đường, từng lớp. Cha cười khẽ trong bóng tối: mắt Người Lùn sinh ra để nhìn dưới lòng núi.`, k: 'good' }; } },
    { id: 'dwf_cup', st: ['child'], w: 3, run(S, X) { X.gain('Engineering', 4); X.add('so', 3);
        return { t: 'Bạn đẽo xong cái cốc đá đầu tiên, méo một bên, quai to quai nhỏ. Bạn giấu nó sau lưng, không dám đưa ra. Ông nội cầm lấy, xoay đi xoay lại dưới ánh đèn, rồi đặt lên kệ, cạnh cốc đầu tay của ông, của cụ, của kỵ. Cái cốc của kỵ cũng méo.', k: 'good' }; } },
    { id: 'dwf_beard', st: ['teen'], w: 4, run(S, X) { X.add('so', 5);
        return { t: 'Mẹ tết cho bạn bím râu đầu tiên, buộc khoen đồng khắc dấu thị tộc. Tay mẹ thô mà tết khéo, kéo đau tới chảy nước mắt. Cả nhà đứng xem, ông nội gật gù như ngắm một món đồ mới đúc. Từ nay ai giật râu bạn là chuốc thù với cả họ.', k: 'big', f: 'Người Lùn, đàn ông hay đàn bà, đều để râu. Người ngoài thường không phân biệt được.' }; } },
    { id: 'dwf_mood', st: AD, c: S => (S.mastery.Engineering || 0) >= 20 || ['smith', 'miner', 'jeweler', 'sculptor', 'runesmith'].includes(S.work), w: 1.5, tree: { dir: { nghe: 2 } }, run(S, X) {
        const mat = X.pick(['ngọc mắt mèo', 'xương của một con thú lớn', 'bạc trắng', 'đá lửa xanh']), item = X.pick(['một chiếc vương miện bằng đá', 'cái rìu khắc kín rune', 'cánh cửa đồng chạm tích tổ tiên', 'một chiếc cốc trong như nước']);
        const p = .45 + (S.mastery.Engineering || 0) / 200 + (S.gold > med(S, X) ? .2 : 0);
        if (X.chance(p)) { S.gear = Math.min(10, S.gear + 2); S.fame += 5; X.money(Math.round(med(S, X) * 1.5)); cnt(S, 'dwfArt');
          return { t: `Một sáng bạn khóa cửa xưởng, không nói với ai một lời. Bạn chỉ thò tay qua khe cửa đòi ${mat}, và cả thị tộc đổ đi tìm cho bạn. Bốn mươi ngày, tiếng búa trong xưởng không ngớt. Ngày thứ bốn mươi mốt bạn mở cửa, râu tóc rối bù, tay cầm ${item}. Thợ cả của thị tộc lặng đi một lúc, rồi tự tay khắc tên nó lên vách.`, k: 'big', o: 'art' }; }
        X.add('h', -15); X.cond('frail'); cnt(S, 'dwfMad');
        return { t: `Một sáng bạn khóa cửa xưởng, đòi ${mat}. Cả thị tộc đi tìm, lục tung mọi kho, mà không ai tìm được. Đêm ấy tiếng đập phá trong xưởng vọng khắp hầm. Rồi bạn ngồi im giữa đống vụn suốt ba tháng, ai gọi cũng không thưa.`, k: 'bad', o: 'mad', f: 'Người Lùn gọi đó là cơn nhập thần: tay thợ biết mình phải làm gì trước khi đầu biết.' }; } },
    { id: 'dwf_cheat', st: AD, c: S => !S.flags.grudgeQ && !S.flags.grudge, w: 1.6, tree: { theme: 'clan', dir: { thuong: 1, nghe: 1 } }, run(S, X) {
        const r = host(S) === 'dwarf' ? 'human' : host(S), nm = nameOf(X, r), amt = Math.round(med(S, X) * (.3 + .4 * X.rnd()));
        X.money(-Math.min(Math.max(0, S.gold), amt)); S.flags.grudgeQ = { name: nm, race: r, amt };
        return { t: `${nm}, một thương nhân ${raceVi(r)}, nhận hàng của bạn với nụ cười rộng tới mang tai, hẹn mùa sau trả. Mùa sau không thấy hắn. Mùa sau nữa cũng không. Món nợ ${G.coin(amt)} nằm đó, mỗi lần nhớ tới là bạn nghiến răng.`, k: 'bad' }; } },
    { id: 'dwf_grudge_paid', st: AD, w: S => 2 + 2 * S.traits.social, tree: { from: ['dwf_grudge:book'], wait: [2, 12], dir: { thuong: 1, quyen: 1 } }, c: S => !!S.flags.grudge, run(S, X) {
        const g = S.flags.grudge; S.flags.grudge = null; X.money(g.amt * 2); X.add('h', 10); cnt(S, 'grudgeOk');
        return { t: `Nhiều năm sau, ${first(g.name)} xuất hiện giữa chợ, béo hơn, sang hơn. Bạn bước ra đứng chắn trước mặt hắn, không nói gì. Hắn nhận ra bạn, mặt tái đi, rồi đếm trả đủ cả gốc lẫn lãi, ${G.coin(g.amt * 2)}. Tối ấy bạn mở Sổ Thù, gạch tên hắn bằng mực đỏ, nét gạch chậm rãi.`, k: 'good', o: 'paid' }; } },
    { id: 'dwf_grudge_blood', st: AD, w: S => 2 + 3 * S.traits.bold, tree: { from: ['dwf_grudge:book'], wait: [2, 12], dir: { vo: 2 } }, c: S => !!S.flags.grudge, run(S, X) {
        const g = S.flags.grudge; S.flags.grudge = null;
        if (X.chance(odds(S, X, .5))) { X.money(g.amt); S.fame += 2; X.add('h', 6); return { t: `Bạn lần theo ${first(g.name)} qua ba thị trấn, hỏi từng quán rượu, từng bến xe. Tới thị trấn thứ ba thì tóm được hắn trong con hẻm sau quán. Hắn trả nợ bằng hai cái răng và một túi bạc. Về tới đại sảnh, bạn gạch tên hắn khỏi Sổ Thù.`, k: 'good', o: 'win' }; }
        X.add('hl', -12); X.cond('wound');
        return { t: `Bạn tìm ra ${first(g.name)}, nhưng giờ hắn có cả đám hộ vệ thuê. Bạn về nhà ôm cái xương sườn gãy, mỗi hơi thở đau như bị khoan. Nằm trên giường, bạn bảo người nhà mang Sổ Thù tới. Tên hắn được viết lại, đậm hơn lần trước.`, k: 'bad', o: 'lose' }; } },
    { id: 'dwf_grudge_heir', st: AD, w: 1, tree: { from: ['dwf_grudge:book'], wait: [6, 16] }, c: S => !!S.flags.grudge, run(S, X) {
        const g = S.flags.grudge; S.flags.grudge = null; X.add('so', 2); X.add('h', -3);
        return { t: `Tin tới: ${first(g.name)} đã chết, trước khi bạn kịp đòi một đồng. Bạn mở Sổ Thù, ngồi nhìn cái tên ấy rất lâu. Rồi bạn chấm mực, ghi thêm tên con hắn ngay bên dưới. Nợ thì vẫn là nợ.`, k: 'info', o: 'heir' }; } },
    { id: 'dwf_shame', st: AD, c: S => !S.flags.slayer && !S.flags.slayerQ && (S.flags.outcast || S.h < 22 || S.flags.dwfMad), w: 3, run(S, X) {
        S.flags.slayerQ = true;
        return { t: 'Đại sảnh có những gương mặt tổ tiên tạc trên vách, mắt đá nhìn xuống người qua lại. Dạo này bạn không dám nhìn lên. Đi qua đó bạn cúi đầu, bước thật nhanh, như kẻ trộm đi qua nhà mình. Người trong họ thấy cả, mà không ai nói ra.', k: 'bad' }; } },
    { id: 'dwf_flood', st: AD, rep: true, gap: 6, c: S => S.work === 'miner' || (G.raceHome(S) && dwfMount(S)) || dwfHold(S), w: S => S.work === 'miner' ? 2 : .8, tree: { theme: 'hardship' }, run(S, X) {
        const lava = bio(S) === 'ash_peak'; X.add('hl', -6); X.money(-Math.round(med(S, X) * .3));
        if (X.chance(.02)) { X.die({ id: lava ? 'mine' : 'drown', text: lava ? 'bị dung nham tràn vào hầm' : 'chết đuối dưới hầm khi đào trúng mạch nước' }); return null; }
        return lava ? { t: 'Vách hầm nóng dần lên, đá rịn mồ hôi, rồi một dòng đá chảy đỏ rực tuôn ra từ khe nứt. Cả tổ vứt đồ nghề chạy ngược lên, hơi nóng đuổi sát gót. Chỉ một đêm, ba tầng hầm đã bị lấp. Sáng ra ngồi kể lại số đồ nghề bỏ dưới ấy, bạn mới thấy tay mình còn run.', k: 'bad' }
          : { t: 'Cuốc của tổ bạn bổ trúng một mạch nước ngầm. Nước phun ra như ai tháo cống, lạnh buốt, dâng tới thắt lưng chỉ trong một khắc. Cả tổ bỏ lại đồ nghề, bám vào nhau mà leo lên. Đêm ấy bạn mơ thấy nước, tỉnh dậy ướt đẫm mồ hôi.', k: 'bad' }; } },
    { id: 'dwf_deep', st: AD, c: S => (S.work === 'miner' || dwfMount(S)) && G.raceHome(S) || dwfHold(S), w: 1, run(S, X) {
        X.add('sm', 3); X.add('h', -3); S.flags.deepSealed = true;
        return { t: 'Tầng dưới cùng của mỏ vọng lên tiếng gõ, đều đều, chậm rãi, như có ai đang đào ngược lên. Người thợ già nhất trong tổ áp tai vào vách, rồi tái mặt. Hội đồng thị tộc họp ngay trong đêm, cho xây tường đá chặn lối, khắc rune cấm lên từng viên. Mấy tháng sau, đi qua bức tường ấy bạn vẫn rảo bước.', k: 'info', f: 'Sử Người Lùn chép không ít thành dưới núi bị bỏ hoang vì đào quá sâu.' }; } },
    { id: 'dwf_sky', st: AD, rep: true, gap: 6, c: S => !dwfMount(S) && stranger(S), w: 1.4, tree: { theme: 'stranger' }, run(S, X) {
        X.add('h', -4);
        return { t: S.age % 2 ? `Một cơn giông kéo qua ${homeName(S, X)}, sấm rền khắp bầu trời không có lấy một mái đá che. Người trong phố chỉ đóng cửa sổ, ngồi uống trà. Bạn thì co mình trong góc nhà, hai tay bịt tai, tới khi mưa tạnh. Sáng ra bạn khắc thêm một hàng rune lên khung cửa, cho đỡ trống.` : `Ở ${homeName(S, X)}, trên đầu không có gì ngoài trời, cao và trống tới chóng mặt. Đêm đầu tiên bạn phải chui xuống gầm bàn mới chợp mắt được. Mấy năm rồi, bạn vẫn quen đi sát chân tường. Người ta tưởng bạn nhút nhát, và bạn để họ tưởng.`, k: 'bad' }; } },
    { id: 'dwf_ale', st: AD, rep: true, gap: 4, c: kin, w: 1.5, tree: { dir: { gia: 1, nghe: 1 } }, run(S, X) { X.add('so', 4); X.add('h', 4);
        return { t: S.age % 2 ? 'Mùa này tới lượt bạn mở thùng rượu ở đại sảnh. Ông chú khó tính nhất họ nhấp một ngụm, chép miệng, rồi lặng lẽ chìa cốc ra xin thêm. Cả họ vỗ bàn rầm rầm. Đó là lời khen to nhất bạn từng nghe từ ông.' : 'Thùng rượu bạn ủ từ ba mùa trước được khui ở đại sảnh, bọt trào ra thơm lừng mùi lúa mạch. Cả họ nâng cốc đá, uống cạn, rồi cãi nhau tới sáng xem ai ủ ngon nhất. Không ai chịu nhận thua. Năm sau bạn định ủ lâu hơn một tuần.', k: 'good' }; } },
    { id: 'dwf_hall', st: ['elder'], w: 3, run(S, X) {
        const deeds = [S.level >= 20 ? `đạt cấp ${S.level}` : null, S.work && G.WORKS[S.work] ? `làm ${G.WORKS[S.work].nameVi.toLowerCase()}` : null, S.family.kids.length ? `nuôi ${S.family.kids.length} đứa con` : null, S.flags.dwfArt ? 'làm ra một kiệt tác' : null].filter(Boolean);
        S.fame += 2; X.add('so', 4);
        return { t: `Thợ khắc của thị tộc khắc tên bạn lên vách đại sảnh, ngay dưới tên cha mẹ. Tiếng đục gõ suốt một buổi chiều, bụi đá bay trắng cả râu người thợ. Bên dưới tên là những việc bạn đã làm: ${deeds.length ? deeds.join(', ') : 'giữ lò không để tắt'}. Bạn đứng nhìn tới khi đèn được thắp, rồi đưa tay sờ lên từng nét.`, k: 'good' }; } }
  ]);
  dec('dwarf', 'dwf_grudge', {
    prio: 5, gap: 1, tree: { q: 'grudgeQ' },
    when: S => !S.dead && !!S.flags.grudgeQ,
    build(S, X) { const g = S.flags.grudgeQ;
      return { title: 'Sổ Thù', body: `${g.name} quỵt của bạn ${G.coin(g.amt)}. Ở đại sảnh có cuốn Sổ Thù bìa da dày cộm, mỗi trang là một món nợ chưa đòi của thị tộc, có trang mực đã ngả nâu từ đời kỵ. Ông chú đặt cuốn sổ lên bàn, mở sẵn tới trang trắng.`,
        choices: [{ k: 'book', label: 'Ghi tên vào Sổ Thù', sub: 'Nợ sẽ được đòi, có khi bằng tiền, có khi bằng máu, có khi tới đời con.' }, { k: 'forgive', label: 'Bỏ qua', sub: 'Người trong tộc sẽ nhìn bạn như nhìn một Người Lùn không râu.' }] }; },
    apply(S, X, k) { const g = S.flags.grudgeQ; S.flags.grudgeQ = null; cnt(S, 'grudge_' + k);
      if (k === 'book') { S.flags.grudge = g; X.add('so', 3); return `Bạn viết tên ${first(g.name)} vào Sổ Thù, ghi rõ ngày, rõ số bạc, nét chữ nắn nót như khắc đá. Ông chú đứng sau lưng, gật đầu. Mực khô thì sổ được khóa lại, cất vào hốc vách. Từ nay món nợ ấy không còn là của riêng bạn.`; }
      X.add('so', -6); X.add('h', 3); return 'Bạn gấp cuốn sổ lại, bảo thôi. Ông chú lắc đầu, đứng dậy bỏ ra khỏi phòng không nói một lời. Mấy hôm sau, ở bàn ăn, người trong họ ngồi xích ra một chút. Bạn ăn hết bát, không ngẩng lên.'; },
    auto: S => S.traits.social > .8 && S.traits.bold < .3 ? 'forgive' : 'book'
  });
  dec('dwarf', 'dwf_slayer', {
    prio: 4, gap: 1, tree: { q: 'slayerQ' },
    when: S => !S.dead && !!S.flags.slayerQ && !S.flags.slayer,
    build(S, X) {
      return { title: 'Lời thề Kẻ Diệt', body: 'Người Lùn mang nhục chỉ có một cách gột: cạo đầu, nhuộm chỏm tóc màu lửa, rồi đi tìm một cái chết đáng được khắc tên. Kẻ Diệt chết dưới tay quái lớn thì tên được trả về cho thị tộc. Còn sống ngày nào thì đi ngày ấy, không quay đầu.',
        choices: [{ k: 'oath', label: 'Thề làm Kẻ Diệt', sub: 'Thị tộc nhận lại bạn như người đang đi chuộc lỗi; bạn đánh không lùi bước. Chết trận thì tên được khắc lại.' }, { k: 'no', label: 'Sống tiếp với nỗi nhục', sub: '' }] }; },
    apply(S, X, k) { S.flags.slayerQ = null; cnt(S, 'slayer_' + k);
      if (k !== 'oath') { X.add('h', -4); return 'Bạn giữ tóc, cất con dao cạo vào hộp. Đi qua đại sảnh bạn vẫn cúi đầu như trước. Có những đêm bạn mở hộp ra nhìn con dao, rồi lại đóng vào.'; }
      S.flags.slayer = true; S.flags.outcast = false; X.gain('Axe', 8); X.gain('Body', 6); X.add('h', 10); G.trajBump(S, { vo: .6 });
      return 'Bạn cạo đầu, nhuộm chỏm tóc còn lại bằng son đỏ, vác rìu lên vai. Thị tộc đứng hai bên lối ra cổng, không ai nói gì, nhưng có người cúi đầu chào. Đêm ấy, lần đầu sau nhiều năm, bạn ngủ được một mạch tới sáng.'; },
    auto: S => S.traits.bold > .45 ? 'oath' : 'no'
  });
  { const base = G.onDeath; G.onDeath = (S, X) => { if (base) base(S, X); if (S.flags && S.flags.slayer && S.causeId === 'monster') { cnt(S, 'slayerEnd'); X.log('Kẻ Diệt đã tìm được cái chết của mình. Tin về tới núi, thị tộc khắc lại tên bạn lên vách đại sảnh, nét đục sâu hơn mọi tên khác. Lũ trẻ trong họ được dẫn tới đó, nghe kể chuyện bạn từ đầu.', 'big'); } }; }

  // ─────────── Orc ───────────
  // Nguồn: Orc của Warcraft (tổ tiên nói trong gió, thách đấu tay đôi, trại bị đuổi khỏi thành người), Orsimer của Elder Scrolls
  // (giá máu, tên đổi theo việc làm), Warhammer (Cơn Gầm Lớn khi các trại họp lại), hệ Nemesis của Shadow of Mordor
  // (kẻ thua quay lại mang vết sẹo bạn để lại).
  const ORC_NAME = { Axe: 'Chẻ Sọ', Sword: 'Lưỡi Mẻ', Spear: 'Xiên Gió', Bow: 'Mắt Diều', Throwing: 'Ném Trúng', Riding: 'Cưỡi Sói', Taming: 'Gọi Thú', Stealth: 'Bóng Cỏ', Dagger: 'Nanh Thầm', Spirit: 'Nghe Gió', Unarmed: 'Nắm Đá', Body: 'Đá Lăn' };
  add('orc', [
    { id: 'orc_scar', st: ['child'], w: 3, run(S, X) { X.add('hl', -3); X.gain('Body', 3); X.add('so', 3);
        return { t: 'Con sói của trại ngoạm rách vai bạn trong một lần tranh miếng thịt. Bạn không khóc, chỉ nghiến răng tới bật máu lợi. Mẹ khâu vết thương bằng gân thú, mũi kim to như cái đinh. Khâu xong, mẹ dắt bạn đi khắp trại, khoe vết sẹo như khoe chiến lợi phẩm.', k: 'info' }; } },
    { id: 'orc_runt', st: ['child'], w: 2, run(S, X) { X.gain('Stealth', 3); X.gain('Dagger', 2); X.add('h', -2);
        return { t: 'Bạn nhỏ nhất trong lứa nên được ăn sau cùng, lúc nồi chỉ còn xương với nước. Nắm đấm của bạn chưa đủ to để giành. Nên bạn học cách khác: rình lúc anh chị mải cãi nhau, thò tay nhanh hơn, chạy nhanh hơn. Tới cuối mùa, miếng thịt ngon nhất hay nằm trong tay bạn.', k: 'info' }; } },
    { id: 'orc_name', st: ['teen'], w: 4, run(S, X) {
        const d = X.dominant(S), n = ORC_NAME[d && d.skill] || 'Đá Lăn'; S.flags.orcName = n; X.add('so', 5);
        return { t: `Mùa ấy trại bắt đầu gọi bạn là ${X.given(S)} ${n}, theo việc bạn đã làm, cái tên truyền từ miệng này sang miệng kia quanh đống lửa. Tên lúc sinh từ nay chỉ còn mẹ gọi, mà cũng chỉ khi không có ai nghe. Mấy hôm đầu bạn chưa quen, người ta phải gọi hai lần mới quay lại. Rồi một hôm bạn tự xưng tên mới với người lạ, giọng chắc nịch.`, k: 'big', f: 'Orc không giữ tên từ lúc sinh tới lúc chết. Tên đi theo việc làm, và có thể đổi.' }; } },
    { id: 'orc_wind', st: ['teen'], c: S => G.raceHome(S) || kin(S), w: 3, run(S, X) { X.gain('Spirit', 4); X.add('sm', 2);
        return { t: 'Bà đồng của trại đưa bạn lên gò cao, nơi gió thổi không lúc nào ngớt, bắt ngồi im cho tới khi nghe được tổ tiên nói. Ngày đầu bạn chỉ nghe tiếng cỏ rạp và tiếng bụng mình réo. Đêm thứ hai, gió lạnh tới mức răng va vào nhau lập cập. Tới đêm thứ ba bạn nghe thấy, hoặc tưởng là nghe thấy, một giọng trầm gọi tên mình.', k: 'good' }; } },
    { id: 'orc_rival', st: ['adult'], c: S => !S.flags.orcRival, w: 2.5, tree: { dir: { vo: 2 } }, run(S, X) {
        const nm = X.name('orc', 'm'); S.flags.orcRival = { name: nm };
        if (G.castAdd) G.castAdd(S, X, { name: nm, race: 'orc', role: 'doi', how: 'kẻ bạn bẻ gãy nanh trong trận vật', yrs: X.years(S) + X.int(-2, 3), tier: Math.max(0, X.ctier(S)), work: 'adventurer', bond: -30, drive: .7 + .3 * X.rnd() });
        S.fame += 1; return { t: `Trong trận vật ở hội tộc, bạn quật ${first(nm)} xuống, mặt hắn đập vào đá, gãy một chiếc nanh. Cả trại hò reo. ${first(nm)} bò dậy, nhổ máu ra bãi cỏ, rồi chỉ thẳng tay vào mặt bạn. Hắn không nói gì, mà cả trại đều hiểu hắn muốn nói gì.`, k: 'good' }; } },
    { id: 'orc_rival_back', st: AD, w: S => 2 + 3 * S.traits.bold, tree: { from: ['orc_rival'], wait: [2, 7], dir: { vo: 2 } }, run(S, X) {
        const nm = first(S.flags.orcRival.name);
        if (X.chance(odds(S, X, .42))) { S.fame += 4; X.add('so', 3); cnt(S, 'rivalWin');
          return { t: `${nm} quay lại, to hơn trước, chiếc nanh gãy bọc sắt sáng loáng. Hắn đã thắng ba trận ở vùng khác chỉ để giành được quyền đánh bạn. Cả trại vây thành vòng, đập giáo vào khiên. Lần này bạn bẻ nốt chiếc nanh còn lại của hắn.`, k: 'good', o: 'win' }; }
        X.add('hl', -15); X.cond('wound'); X.add('h', -5); cnt(S, 'rivalLose');
        return { t: `${nm} quay lại, to hơn trước, chiếc nanh gãy bọc sắt sáng loáng. Cả trại vây thành vòng xem. Hắn quật bạn xuống bùn ba lần, lần cuối bạn không đứng dậy nổi. Hắn phủi tay bỏ đi, không thèm lấy gì, và như thế còn nhục hơn.`, k: 'bad', o: 'lose' }; } },
    { id: 'orc_rival_brother', st: AD, w: S => 1 + 3 * S.traits.social, tree: { from: ['orc_rival'], wait: [2, 7], dir: { gia: 1, du: 1 } }, run(S, X) {
        const nm = first(S.flags.orcRival.name), p = (S.cast || []).find(c => c.name === S.flags.orcRival.name); if (p) { p.bond = 60; p.role = 'ban'; p.how = 'anh em kết nghĩa, kẻ bạn từng bẻ gãy nanh'; }
        X.add('so', 6); X.add('h', 5);
        return { t: `${nm} tới trại vào một chiều gió, vác theo một vò rượu sữa ngựa. Hai người ngồi bên lửa, uống chung một chiếc sừng, chẳng ai nhắc chuyện cũ. Tới khi vò cạn, ${nm} chìa tay ra, cười nhe cả chỗ nanh gãy. Ở tộc Orc, kẻ từng làm mình chảy máu có thể thành anh em.`, k: 'good', o: 'brother' }; } },
    { id: 'orc_rival_dead', st: AD, w: 1, tree: { from: ['orc_rival'], wait: [3, 9] }, run(S, X) {
        X.add('h', -2); const p = (S.cast || []).find(c => c.name === S.flags.orcRival.name); if (p) p.alive = false;
        return { t: `Tin về trại: ${first(S.flags.orcRival.name)} chết trong một trận săn ở vùng khác. Bạn nghe xong, lại cúi xuống mài rìu. Tối ấy không ai thách bạn, không ai chỉ tay vào mặt bạn. Lạ thay, bạn thấy thiếu thiếu.`, k: 'info', o: 'dead' }; } },
    { id: 'orc_gather', st: ['adult'], rep: true, gap: 8, c: S => G.raceHome(S) || kin(S), w: S => .8 + G.local(S).war * 4 + G.local(S).raid * 4, tree: { theme: 'war', dir: { vo: 2 } }, run(S, X) {
        X.gain('Axe', 4); X.gain('Body', 3); X.money(Math.round(med(S, X) * .3)); X.add('hl', -4); X.add('so', 3);
        return { t: S.age % 2 ? 'Tin truyền qua từng trại: Cơn Gầm Lớn lại tới. Bạn mài rìu, buộc lại dây khiên, theo đoàn đi về nơi tụ hội. Dọc đường, trại này nhập vào trại kia, tiếng hò đông dần như nước lũ. Mùa ấy bạn về trại với vết sẹo mới và bao tải nặng trĩu trên lưng ngựa.' : 'Mười hai trại kéo về một thung lũng, lều dựng kín hai sườn đồi, khói bếp che cả mặt trời. Giáo gõ vào khiên suốt ba ngày ba đêm. Khi cả thảo nguyên cùng gầm lên một tiếng, ai cũng thấy mình to ra một chút. Mùa ấy đám đông đi tới đâu, của cải theo về tới đó.', k: 'big' }; } },
    { id: 'orc_scorn', st: AD, rep: true, gap: 4, c: S => stranger(S) && isTown(S), w: S => wary(S) ? 4 : 2.2, tree: { theme: 'stranger' }, run(S, X) {
        X.add('h', -4); X.add('so', -3); X.money(-Math.round(med(S, X) * .05));
        return { t: S.age % 2 ? `Ở quán ăn đông nhất ${homeName(S, X)}, chỗ nào cũng "có người ngồi rồi". Bạn đứng ăn ngoài hiên, mưa hắt vào bát. Cậu bé chạy bàn lén mang ra cho bạn thêm miếng bánh, rồi chạy biến trước khi chủ thấy. Lúc trả tiền, bạn vẫn bị tính gấp đôi như mọi lần.` : `Người bán hàng ở ${homeName(S, X)} nhìn cái nanh của bạn, rồi đọc giá gấp đôi. Lính gác đi theo bạn qua hai con phố, tay đặt sẵn trên chuôi kiếm. Một bà mẹ vội kéo con vào nhà, đóng sập cửa. Bạn mua xong túi muối, đi một mạch ra khỏi chợ, hai nắm tay siết chặt.`, k: 'bad' }; } },
    { id: 'orc_drought', st: AD, rep: true, gap: 5, c: S => ['wind_steppe', 'red_desert'].includes(bio(S)) && (S.urban === false || !isTown(S)), w: 2, tree: { theme: 'hardship' }, run(S, X) {
        X.add('hl', -5); X.gain('Riding', 2); G.trajBump(S, { du: .2 });
        return bio(S) === 'red_desert' ? { t: 'Giếng của trại cạn tới đáy, thả gàu xuống chỉ kéo lên cát. Cả trại nhổ lều, đi theo đàn lạc đà hoang tìm mạch nước mới. Bảy ngày không có bóng râm, môi ai cũng nứt toác. Ngày thứ tám, lũ lạc đà quỳ xuống bên một vũng nước đục, và cả trại quỳ theo.', k: 'bad' }
          : { t: 'Mùa khô kéo dài, cỏ cháy vàng tới tận chân trời, đàn bò rừng không về bãi cũ. Cả trại nhổ lều đi theo dấu chân chúng, hơn trăm dặm. Tối nào lũ trẻ cũng hỏi bao giờ tới. Người lớn chỉ đáp: tới khi thấy cỏ.', k: 'bad' }; } },
    { id: 'orc_blood', st: AD, c: S => !S.flags.priceQ, w: 1.4, tree: { theme: 'clan' }, run(S, X) {
        S.flags.priceQ = { cost: Math.round(med(S, X) * .8) };
        return { t: 'Em họ bạn say rượu ở hội chợ, cãi nhau vì một con ngựa, rồi đánh chết một người của trại bên. Sáng ra nó tỉnh, ôm đầu ngồi trước lều, không nhớ nổi mình đã làm gì. Tới trưa, trại bên cử người cưỡi ngựa sang, mặt lạnh như đá. Họ tới đòi giá máu.', k: 'bad' }; } },
    { id: 'orc_feud', st: AD, w: 4, tree: { from: ['orc_price:refuse'], wait: [1, 4] }, run(S, X) {
        X.add('hl', -8); X.money(-Math.round(med(S, X) * .4)); X.add('h', -6);
        return { t: 'Một đêm không trăng, trại bên kéo tới, đốt lều của họ bạn và lùa mất nửa đàn ngựa. Lửa bén sang cả lều bạn, khói khét lẹt tới sáng. Giờ thì hai bên đều có người chết. Không ai còn nhớ ai bắt đầu trước.', k: 'bad' }; } },
    { id: 'orc_elder', st: ['elder'], w: 4, run(S, X) { X.add('so', 6); S.fame += 2; X.add('sm', 2);
        return { t: `Ở tộc Orc ít ai sống tới ${X.years(S)} tuổi. Phần lớn bạn cùng lứa đã nằm lại ở các bãi chiến, các mùa săn. Giờ lũ trẻ gọi bạn là "Người Già" như gọi một chức danh, và đứng dậy khi bạn bước vào lều. Có đứa còn lén sờ vào vết sẹo trên tay bạn, như sờ vào một món bùa.`, k: 'good' }; } }
  ]);
  dec('orc', 'orc_price', {
    prio: 5, gap: 1, tree: { q: 'priceQ' },
    when: S => !S.dead && !!S.flags.priceQ,
    build(S, X) { const c = S.flags.priceQ.cost;
      return { title: 'Giá máu', body: `Trại bên đòi giá máu cho người đã chết: hoặc ${G.coin(c)}, hoặc một người trong họ bạn ra vòng đấu với anh trai của người chết. Sứ giả đứng chờ trước lều, không xuống ngựa. Em họ bạn ngồi thu lu trong góc, mặt xám như tro.`,
        choices: [{ k: 'pay', label: `Trả ${G.coin(c)}`, sub: S.gold >= c ? 'Món nợ khép lại.' : 'Không đủ tiền: phải vay.' }, { k: 'fight', label: 'Ra vòng đấu thay em họ', sub: 'Thắng thì nợ xóa và cả hai trại nhớ mặt bạn.' }, { k: 'refuse', label: 'Không trả', sub: 'Hai trại thành thù.' }] }; },
    apply(S, X, k) { const c = S.flags.priceQ.cost; S.flags.priceQ = null; cnt(S, 'price_' + k);
      if (k === 'pay') { X.money(-c); X.add('so', 3); return 'Bạn đặt túi bạc trước lều trại bên. Họ đổ ra đếm từng đồng, chậm rãi, trước mặt cả trại. Rồi người đứng đầu nhổ nước bọt xuống đất. Ở tộc Orc, như thế là xong.'; }
      if (k === 'fight') { if (X.chance(odds(S, X, .45))) { X.add('so', 6); S.fame += 2; return 'Bạn quật anh trai người chết xuống ba lần, lần nào cũng lùi lại cho anh ta đứng dậy. Lần thứ tư anh ta nằm yên, ngửa mặt nhìn trời, rồi giơ tay xin thôi. Cả hai trại im phắc. Nợ xóa.'; }
        X.add('hl', -15); X.cond('wound'); X.add('so', 2); return 'Anh trai người chết đánh như con thú bị thương. Bạn thua, cánh tay gãy gập. Nhưng bạn đã ra vòng, và trại bên nhận như thế là đủ. Đêm ấy em họ bạn ngồi bên giường bạn tới sáng.'; }
      X.add('so', -8); return 'Bạn bảo người say giết người là việc của người say, không phải việc của cả họ. Sứ giả trại bên nhìn bạn một lúc lâu, rồi quay ngựa, không chào. Bụi đường chưa kịp lắng, người trong trại đã bắt đầu mài giáo.'; },
    auto: (S, X, d) => S.traits.bold > .6 ? 'fight' : S.gold >= S.flags.priceQ.cost ? 'pay' : S.traits.bold > .35 ? 'fight' : 'refuse'
  });

  // ─────────── Người Thú ───────────
  // Nguồn: Khajiit của Elder Scrolls (hình dáng theo tuần trăng lúc sinh), Tabaxi, Shifter của D&D (mũi thính, bản năng thú),
  // bầy sói (con đầu đàn, tiếng hú), Zootopia và nhiều truyện khác về loài có nanh bị coi là nguy hiểm trong thành người.
  const MOON = [['trăng tròn', 'móng sắc, đánh trước nghĩ sau', 'Unarmed'], ['trăng khuyết', 'bước êm, đi đâu cũng không ai nghe', 'Stealth'], ['đêm không trăng', 'nhìn trong tối như ban ngày', 'Bow'], ['trăng đôi', 'chạy cùng gió, cưỡi được mọi con thú', 'Riding']];
  add('beastfolk', [
    { id: 'bst_moon', st: ['infant'], w: 6, run(S, X) { const m = X.pick(MOON); S.flags.moon = m[0]; X.gain(m[2], 3);
        return { t: `Bạn chào đời vào ${m[0]}. Bà đỡ của bầy bế bạn ra cửa hang, ngửa mặt nhìn trời một hồi lâu, rồi cúi xuống hít hà mùi tóc bạn. Bà nói đứa bé này rồi sẽ ${m[1]}. Cả bầy truyền nhau câu ấy suốt mấy ngày liền.`, k: 'big', f: 'Người Thú tin tuần trăng lúc sinh quyết định đứa trẻ giống con thú nào trong tổ tiên.' }; } },
    { id: 'bst_nose', st: ['child'], w: 3, run(S, X) { X.gain('Stealth', 2); X.add('so', 3);
        return { t: 'Bạn ngửi thấy mùi mưa trước khi mây kéo tới, mùi sói trước khi chó trong bầy kịp sủa. Lần đầu người lớn cười, tưởng trẻ con nói bừa. Tới lần thứ ba, khi mưa đổ đúng lúc bạn bảo, không ai cười nữa. Giờ trước mỗi chuyến vào rừng, người ta hỏi ý bạn.', k: 'good' }; } },
    { id: 'bst_howl', st: CT, c: S => kin(S) || G.raceHome(S), w: 3, run(S, X) { X.add('so', 5); X.add('h', 5);
        return { t: 'Đêm trăng tròn, bạn đứng giữa bầy, ngửa cổ hú lần đầu tiên. Giọng bạn vỡ giữa chừng, khàn khàn như tiếng chó con. Chẳng ai cười. Cả bầy hú theo, kéo tiếng hú của bạn lên cho tròn, tới khi nó vang sang tận đồi bên kia.', k: 'good' }; } },
    { id: 'bst_totem', st: ['teen'], c: kin, w: 3, run(S, X) { const a = X.pick(['sói', 'báo', 'gấu', 'cáo', 'linh dương']); S.flags.totem = a; X.gain('Spirit', 3); X.add('so', 4);
        return { t: `Người khắc của bầy khắc hình con ${a} lên cột totem lớn, ngay dưới hình của mẹ bạn. Vụn gỗ thơm rơi đầy quanh chân cột. Đêm ấy bạn ngủ dưới chân cột, mơ thấy một con ${a} nằm canh bên cạnh. Từ nay hồn con ${a} đi cùng bạn.`, k: 'big' }; } },
    { id: 'bst_molt', st: ['teen', 'adult'], rep: true, gap: 4, w: 1.6, run(S, X) {
        X.add('h', -2); if (stranger(S) && isTown(S)) { X.money(-Math.round(med(S, X) * .04)); return { t: `Mùa thay lông tới. Chủ nhà trọ ở ${homeName(S, X)} nhặt từng búi lông trên chăn, mặt nhăn như bị, rồi bắt bạn trả thêm tiền giặt. Hôm sau trước cửa có tấm biển mới: "Không nhận khách rụng lông". Bạn đọc nó hai lần, rồi lẳng lặng về gom hết lông trong phòng bỏ vào túi.`, k: 'bad' }; }
        return { t: S.age % 2 ? 'Lại tới mùa thay lông. Bạn ra suối ngâm mình, chải lông bằng chiếc lược xương, từng búi trôi theo dòng nước. Nắng chiều hong khô bộ lông mới, mỏng và bóng hơn. Bạn thấy người nhẹ hẳn đi.' : 'Mùa thay lông tới. Lông rụng thành từng búi, bay lả tả theo mỗi bước chân, ngứa tới mức đêm không ngủ được. Bạn cọ lưng vào gốc cây như con gấu, cọ tới khi vỏ cây bong ra. Lũ chim trong vùng tha lông bạn về lót tổ.', k: 'info' }; } },
    { id: 'bst_alpha_old', st: AD, c: S => kin(S) && !S.flags.alphaQ && !S.flags.alpha, w: 1.6, tree: { dir: { vo: 1, quyen: 2, gia: .5 } }, run(S, X) {
        S.flags.alphaQ = true; return { t: 'Con đầu đàn đã già, răng mòn, đi đâu cũng hơi khập khiễng. Nhưng nó vẫn chia mồi như hai mươi năm trước, đứa yếu trước, đứa mạnh sau. Lũ trẻ trong bầy bắt đầu nhìn sang bạn mỗi khi có chuyện. Con đầu đàn cũng thấy thế.', k: 'info' }; } },
    { id: 'bst_alpha_rule', st: AD, w: 3, tree: { from: ['bst_alpha:challenge'], wait: [2, 8], dir: { quyen: 2, gia: 1 } }, c: S => !!S.flags.alpha, run(S, X) { X.add('so', 5); G.trajBump(S, { quyen: .3 });
        return { t: 'Mùa đói tới, cả bầy gầy rộc. Bạn chia mồi cho con yếu nhất trước, như con đầu đàn cũ từng làm, phần mình để sau cùng. Cả bầy nhìn thấy. Từ đó không ai còn nghĩ tới chuyện thách bạn.', k: 'good' }; } },
    { id: 'bst_alpha_pass', st: AD, w: 3, tree: { from: ['bst_alpha:back'], wait: [2, 8] }, run(S, X) { X.add('so', 6); S.fame += 2;
        return { t: 'Con đầu đàn già chết trong giấc ngủ, đầu gối lên chân bạn, hơi thở cứ nhẹ dần rồi tắt. Trước đó nó đã kịp gọi tên bạn hai lần, đủ to cho cả bầy nghe. Đêm ấy cả bầy hú tiễn nó tới sáng. Sáng ra, lũ trẻ đứng sau lưng bạn.', k: 'big' }; } },
    { id: 'bst_muzzle', st: AD, rep: true, gap: 4, c: S => stranger(S) && isTown(S), w: S => wary(S) ? 4 : 2.2, tree: { theme: 'stranger' }, run(S, X) {
        X.add('h', wary(S) ? -6 : -3); X.add('so', -2);
        return wary(S) ? { t: S.age % 2 ? `Lính tuần ở ${homeName(S, X)} chặn bạn ở cổng chợ, kiểm xem rọ mõm đã khóa chưa. Một tên còn gõ gõ vào rọ như gõ cửa, quay sang cười với đồng bọn. Bạn đứng im, móng tay bấm vào lòng bàn tay. Mua xong đồ, bạn đi một mạch ra khỏi cổng mới dám thở mạnh.` : `Luật ở ${homeName(S, X)} bắt người có nanh đeo rọ mõm khi vào chợ. Bạn đeo, vì cần mua muối. Cái rọ sắt lạnh ngắt, cọ vào mép tới rớm máu. Người bán muối không dám nhìn mặt bạn, chỉ đẩy gói muối qua quầy.`, k: 'bad' }
          : { t: S.age % 2 ? `Ở ${homeName(S, X)}, người ta tránh ngồi cạnh bạn trên xe ngựa, chừa ra một khoảng ghế trống. Bà cụ ngồi đối diện ôm khư khư cái giỏ gà. Suốt quãng đường, bạn nhìn ra cửa sổ. Lũ gà trong giỏ thì không rời mắt khỏi bạn.` : `Chó trong phố ${homeName(S, X)} sủa theo bạn suốt hai con đường. Một đứa trẻ níu áo mẹ, hỏi to: "Người ấy có cắn không?" Người mẹ vội bế con đi. Bạn cúi đầu, giấu nanh sau môi, đi tiếp.`, k: 'bad' }; } },
    { id: 'bst_poacher', st: AD, rep: true, gap: 6, w: S => .8 + X0(S).danger * 1.5 + (stranger(S) ? .6 : 0), tree: { dir: { vo: 1, du: 1 } }, run(S, X) {
        if (X.chance(odds(S, X, .5))) { X.money(Math.round(med(S, X) * .4)); S.fame += 2; return { t: 'Một toán săn trộm theo dấu bạn ba ngày, giẫm gãy cành, nói chuyện to như đi chợ. Đêm thứ ba bạn vòng ra sau lưng chúng, nằm im trong bụi tới khi lửa trại tàn. Sáng hôm sau chúng bỏ chạy, để lại bẫy, lưới, và cả túi tiền. Bạn mang bẫy của chúng đi chôn.', k: 'good' }; }
        X.add('hl', -14); X.cond('wound');
        return { t: 'Một toán săn trộm theo dấu bạn ba ngày. Ở chợ đen, một tấm da Người Thú bán được giá cao. Đêm thứ ba chúng giăng lưới ngay lối bạn hay đi. Bạn thoát được, mang theo một mũi tên cắm trong đùi, máu nhỏ suốt quãng đường về.', k: 'bad' }; } },
    { id: 'bst_herd', st: AD, rep: true, gap: 5, c: S => G.raceHome(S), w: 1.8, tree: { dir: { du: 1, vo: .5, nghe: .5 } }, run(S, X) {
        if (bio(S) === 'wind_steppe') { X.gain('Riding', 3); G.trajBump(S, { du: .2 }); return { t: 'Bầy theo đàn linh dương di cư qua thảo nguyên suốt một mùa, ngủ dưới trời, săn khi đàn dừng uống nước. Ngày chạy tới khi mặt trời lặn sau lưng. Đêm nào bạn cũng nằm ngửa đếm sao, mùi cỏ dập dưới lưng. Hết mùa, gan bàn chân bạn chai cứng như da trống.', k: 'good' }; }
        X.money(Math.round(med(S, X) * .2)); return { t: 'Tới mùa nấm cục, cả bầy vào rừng sâu, mũi dí sát đất dưới từng gốc sồi. Đánh hơi được là cào, cào được là reo. Bạn đào được nhiều nhất, móng tay đen sì đất. Cả túi nấm đổi được một bao muối.', k: 'good' }; } },
    { id: 'bst_teeth', st: ['elder'], w: 3, run(S, X) { X.add('hl', -3);
        if (kin(S)) { X.add('so', 4); return { t: 'Răng bạn mòn tới mức không xé nổi thịt sống nữa. Một đứa trẻ trong bầy lẳng lặng nhai mềm miếng thịt rồi đưa cho bạn, như bạn từng làm cho cha mẹ mình. Bạn nhận lấy, không nói gì. Hồi ấy cha mẹ bạn cũng không nói gì.', k: 'info' }; }
        X.add('h', -4); return { t: 'Răng bạn mòn tới mức không xé nổi thịt sống nữa. Bạn mua bát cháo ở quán đầu phố, ngồi ăn một mình trong góc. Cháo nhạt, nguội. Bạn nhớ những bữa cả bầy ngồi chia nhau một con mồi, ồn ào, tranh giành, mà ấm.', k: 'bad' }; } }
  ]);
  dec('beastfolk', 'bst_alpha', {
    prio: 5, gap: 1, tree: { q: 'alphaQ' },
    when: S => !S.dead && !!S.flags.alphaQ,
    build(S, X) {
      return { title: 'Con đầu đàn đã già', body: 'Ở bầy, ngôi đầu đàn không truyền cho con. Ai muốn thì thách, trước mặt cả bầy, dưới trăng. Con đầu đàn già vẫn nằm ở chỗ cao nhất cạnh cột totem, mắt lim dim, mà tai thì không lúc nào thôi nghe.',
        choices: [{ k: 'challenge', label: 'Thách con đầu đàn', sub: 'Thắng thì dẫn bầy; thua thì mang thương và mất mặt.' }, { k: 'back', label: 'Đứng sau con đầu đàn', sub: 'Giữ bầy yên tới ngày nó tự lui.' }] }; },
    apply(S, X, k) { S.flags.alphaQ = null; cnt(S, 'alpha_' + k);
      if (k === 'back') { X.add('so', 4); return 'Ở lần họp bầy kế tiếp, bạn bước tới đứng ngay sau con đầu đàn, cho cả bầy cùng thấy. Con đầu đàn không quay lại, chỉ khẽ gật đầu. Lũ trẻ thôi nhìn sang bạn.'; }
      if (X.chance(odds(S, X, .5))) { S.flags.alpha = true; X.add('so', 8); S.fame += 4; G.trajBump(S, { quyen: .5 });
        return 'Hai bên vờn nhau trong vòng tròn của bầy từ lúc trăng mới nhú tới khi trăng lên đỉnh. Không ai cắn trúng ai. Rồi con đầu đàn già cúi đầu trước, lặng lẽ tự lùi về cuối bầy. Đêm ấy lần đầu tiên bạn là người hú trước, và cả bầy hú theo.'; }
      X.add('hl', -15); X.cond('wound'); X.add('so', -4); return 'Con đầu đàn già vẫn còn nanh, sắc hơn bạn tưởng. Nó hạ bạn chỉ sau ba lần vờn, cắn một phát vào vai rồi buông. Bạn nằm liếm vết thương nửa mùa, nghe tiếng cả bầy đi săn mà không có mình.'; },
    auto: S => S.traits.bold > .55 ? 'challenge' : 'back'
  });

  // ─────────── Yêu Tinh ───────────
  // Nguồn: văn học dân gian Ireland, Scotland, Anh (tên thật, sắt lạnh, lời cảm ơn là nhận nợ, vòng nấm làm lệch thời gian,
  // đình Seelie / Unseelie, Tam Lin: bảy năm một lần đình nộp một linh hồn), bài thơ "La Belle Dame sans Merci" (người phàm
  // yêu Yêu Tinh rồi héo mòn), truyện Holly Black (giao kèo không thể quỵt).
  add('fae', [
    { id: 'fae_truename', st: ['child'], w: 4, run(S, X) { X.add('sm', 3); S.flags.truename = true;
        return { t: 'Một đêm, mẹ ghé sát tai bạn, nói tên thật của bạn, đúng một lần, khẽ như tiếng lá. Rồi mẹ đặt ngón tay lên môi bạn. Ai biết cái tên ấy có thể sai khiến bạn, nên từ nay bạn sẽ không nói nó ra, kể cả trong mơ. Có những đêm bạn giật mình tỉnh giấc, sợ mình vừa lỡ lời.', k: 'big', f: 'Yêu Tinh nào cũng có hai tên: tên để gọi và tên thật. Biết tên thật của ai là nắm dây cương của người đó.' }; } },
    { id: 'fae_glamour', st: ['teen'], w: 3, run(S, X) { X.gain('Stealth', 4); X.gain('Arcane', 2);
        return { t: 'Bạn học cách làm cho mình trông như người khác: cao hơn, già hơn, có lúc như một đứa trẻ loài người mặt lấm lem. Lần đầu làm được, bạn đứng ngay giữa lối đi trong trảng. Mẹ bạn đi ngang qua, gật đầu chào như chào người lạ. Bạn cười khúc khích tới khi lớp ảo dung tuột mất.', k: 'good' }; } },
    { id: 'fae_wings', st: ['teen'], w: 3, run(S, X) {
        if (['storm_spire', 'mist_coast', 'frost_tundra'].includes(bio(S))) { X.add('hl', -6); return { t: 'Cánh bạn mở hết vào một sáng sương, ướt và mỏng như giấy bản. Bạn bay lên được ba sải thì gặp gió lớn từ núi thổi xuống. Một bên cánh rách toạc, bạn rơi xuống bãi cỏ ướt. Cả mùa sau đó bạn phải gấp cánh mà đi, ngước nhìn người khác bay.', k: 'bad' }; }
        X.add('hl', -2); X.add('h', 6); return { t: 'Cánh bạn mở hết vào một sáng sương, ánh lên như vỏ ốc. Bạn vỗ thử, rồi vỗ mạnh, và bay được tới tận ngọn cây. Tới đó bạn mới nhớ ra mình chưa học cách hạ xuống, rơi tõm vào bụi gai. Bạn nằm đó, gai đâm khắp người, cười tới đau bụng.', k: 'good' }; } },
    { id: 'fae_iron', st: ['child', 'teen', 'adult'], rep: true, gap: 4, c: S => stranger(S) && isTown(S), w: 2.2, tree: { theme: 'stranger' }, run(S, X) { X.add('hl', -5); X.add('h', -3);
        return { t: S.age % 2 ? `Chợ ở ${homeName(S, X)} toàn đinh sắt, khóa sắt, chuông sắt, đi một vòng là đầu nhức như búa bổ. Ông thợ rèn đầu phố thấy bạn đi vòng tránh lò, nheo mắt nhìn theo. Bạn vội quá, quệt tay vào một cái móc sắt, da phồng lên ngay. Hôm sau trước cửa nhà trọ có ai treo một chiếc móng ngựa mới.` : `Nhà nào ở ${homeName(S, X)} cũng đóng móng ngựa sắt trên cửa. Bạn lỡ tay chạm vào then sắt ở quán trọ, nghe xèo một tiếng như thịt chạm chảo nóng. Vết bỏng nhức suốt một mùa. Từ đó bạn mở cửa bằng khuỷu tay quấn vải.`, k: 'bad', f: 'Sắt lạnh làm bỏng Yêu Tinh. Loài người biết điều đó từ lâu.' }; } },
    { id: 'fae_thanks', st: AD, c: stranger, w: 1.5, run(S, X) { X.add('h', 2); X.add('so', 2);
        return { t: `Một người ${raceVi(host(S))} cảm ơn bạn rối rít vì đã chỉ đường. Bạn đứng khựng lại. Ở trảng, nói cảm ơn là nhận mình mắc nợ, và nợ thì phải trả. Bạn suýt hỏi họ định trả bằng gì, may mà kịp nhớ ra đây không phải trảng.`, k: 'info' }; } },
    { id: 'fae_ring', st: AD, rep: true, gap: 4, c: S => G.raceHome(S), w: 2, tree: { dir: { phap: 1, gia: .5, du: .5 } }, run(S, X) { X.gain('Spirit', 2); X.add('so', 3); X.add('h', 4);
        return { t: S.age % 2 ? 'Vòng nấm năm nay mọc to gấp đôi, trắng như vòng muối dưới trăng. Bạn dẫn điệu tới khi gà gáy, các Yêu Tinh nhỏ xoay quanh như lá trong gió lốc. Có một bác thợ săn loài người lạc vào, bạn đẩy bác ra ngoài ngay từ khúc nhạc đầu. Bác sẽ về nhà kịp bữa tối, chứ không phải bảy năm sau.' : 'Đêm hội, bạn dẫn điệu nhảy trong vòng nấm, chân không chạm cỏ. Ba người loài người lạc vào, mắt đờ ra, nhảy theo không biết mỏi. Bạn nhớ thả họ ra trước khi trời sáng. Lần nào bạn cũng nhớ.', k: 'good', f: 'Người phàm nhảy trong vòng nấm một đêm, ra ngoài có khi đã qua bảy năm.' }; } },
    { id: 'fae_court_call', st: ['adult'], c: S => !S.flags.court && !S.flags.courtQ && (kin(S) || G.raceHome(S)), w: 4, run(S, X) {
        S.flags.courtQ = true; return { t: 'Đêm ấy, sứ giả của hai đình cùng tới trước cửa nhà bạn. Một người mang hoa, cánh hoa còn đọng sương. Một người mang băng, giữa mùa hè mà băng không tan. Cả hai đứng chờ, không ai nhìn ai.', k: 'info' }; } },
    { id: 'fae_midsummer', st: AD, w: 3, tree: { from: ['fae_court:summer'], wait: [2, 8], dir: { gia: 1, phap: 1 } }, run(S, X) { X.add('so', 6); X.add('h', 8); X.gain('Spirit', 2);
        return { t: 'Đêm ngắn nhất năm, đình Hạ mở hội tới sáng, đom đóm treo kín các tán cây như đèn lồng. Bạn được giao giữ lời thề của hai người loài người cưới nhau trong vòng nấm. Bạn nghe từng chữ, buộc lời thề vào một sợi tóc của mỗi người. Từ nay tới khi họ chết, lời thề ấy do bạn giữ.', k: 'good' }; } },
    { id: 'fae_tithe', st: AD, w: 3, tree: { from: ['fae_court:winter'], wait: [3, 10], dir: { am: 1, vo: 1 } }, run(S, X) {
        const nm = X.name('human', 'm');
        if (S.traits.social > .45 || S.traits.pious > .6) { X.add('hl', -10); X.add('so', 8); S.fame += 3; cnt(S, 'titheSave');
          return { t: `Bảy năm một lần, đình Đông nộp một linh hồn cho Vực Sâu. Năm nay họ rút trúng tên ${first(nm)}, một chàng trai loài người bạn quen. Đêm rước, bạn kéo anh xuống ngựa, ôm chặt, mặc cho đình biến anh thành rắn, thành sắt nung, thành lửa. Da tay bạn phồng rộp mà không buông. Sáng ra, trong vòng tay bạn vẫn là một con người.`, k: 'big', o: 'saved' }; }
        X.add('h', -10); G.trajBump(S, { am: .3 }); cnt(S, 'titheLet');
        return { t: `Bảy năm một lần, đình Đông nộp một linh hồn cho Vực Sâu. Năm nay họ rút trúng tên ${first(nm)}, một chàng trai loài người bạn quen. Bạn đứng bên đường nhìn đoàn rước đi qua, ngựa trắng, đèn xanh, không một tiếng nhạc. ${first(nm)} nhìn thấy bạn. Bạn không nói gì, và anh cũng thôi nhìn.`, k: 'bad', o: 'let', f: 'Người ta kể có lần một cô gái giữ chặt người yêu suốt đêm rước, và đình phải trả anh ta lại.' }; } },
    { id: 'fae_plea', st: AD, c: S => !S.flags.dealQ && !S.flags.deal, w: 1.8, tree: { dir: { phap: 1, am: 1, thuong: 1 } }, run(S, X) {
        const r = host(S) === 'fae' ? 'human' : host(S), nm = nameOf(X, r); S.flags.dealQ = { name: nm, race: r };
        return { t: `${first(nm)}, một người ${raceVi(r)}, dò dẫm vào trảng lúc chạng vạng, quần áo rách tơi vì gai. Người ấy quỳ trước cửa nhà bạn, xin bạn giúp: con gái họ ốm, không thầy thuốc nào chữa được. Có lẽ họ không biết vào trảng xin Yêu Tinh thì phải trả giá thế nào. Hoặc biết, mà vẫn tới.`, k: 'info' }; } },
    { id: 'fae_deal_kept', st: AD, w: 3, tree: { from: ['fae_deal:memory'], wait: [1, 6] }, run(S, X) { X.add('so', 4); X.add('h', 3);
        return { t: `Mấy năm sau, con gái của ${first(S.flags.deal.name)} tìm vào trảng, mang theo một giỏ bánh để cảm ơn bạn. Cô bé giờ đã cao lớn, má hồng hào. Mẹ cô không còn nhớ ngày cưới của mình, lần nào kể cũng ngập ngừng ở đoạn ấy. Nhưng cô thì còn sống.`, k: 'good' }; } },
    { id: 'fae_deal_cheat', st: AD, w: 3, tree: { from: ['fae_deal:gold'], wait: [1, 4], dir: { am: 1 } }, run(S, X) {
        X.gain('Curse', 3); X.money(Math.round(med(S, X) * .5)); G.trajBump(S, { am: .3 });
        return { t: `${first(S.flags.deal.name)} không mang nốt phần vàng còn lại tới. Bạn chờ đúng một mùa. Rồi bò nhà họ cạn sữa, giếng nhà họ đắng nước, ba năm liền, cho tới khi họ mang đủ vàng vào trảng, quỳ xin. Giao kèo với Yêu Tinh, không ai quỵt được.`, k: 'info' }; } },
    { id: 'fae_lover', st: ['adult'], w: 1.2, tree: { theme: 'romance' }, run(S, X) { X.add('h', -6); X.add('so', -2);
        const sx = X.chance(.5) ? 'm' : 'f', nm = X.name('human', sx);
        return { t: `${first(nm)}, một ${sx === 'm' ? 'chàng trai' : 'cô gái'} loài người, theo bạn vào trảng và ở lại một mùa, ngày nhảy, đêm hát. Về làng rồi, ${first(nm)} không ăn được món gì của người nữa, gầy rộc đi từng tháng. Chiều nào cũng ra bìa rừng đứng đợi, tới khi tối hẳn. Gió kể lại cho bạn nghe, và bạn không biết phải làm gì.`, k: 'bad' }; } },
    { id: 'fae_seasons', st: ['elder'], w: 3, run(S, X) { X.add('so', 5); X.add('sm', 3);
        return { t: 'Bạn không còn đếm được mình đã dự bao nhiêu mùa hội, cây sồi cổng trảng đã thay vỏ mấy lần. Ở đình người ta gọi bạn là Gốc Già. Phiên họp nào mọi người cũng chờ bạn nói trước, dù bạn nói chậm và hay lạc đề. Lũ Yêu Tinh nhỏ tranh nhau ngồi trên vai bạn.', k: 'good' }; } }
  ]);
  dec('fae', 'fae_court', {
    prio: 5, gap: 1, tree: { q: 'courtQ' },
    when: S => !S.dead && !!S.flags.courtQ,
    build(S, X) {
      return { title: 'Đình Hạ hay Đình Đông', body: 'Tới tuổi này, Yêu Tinh nào cũng phải chọn đình. Đình Hạ ca hát, chữa lành, giữ lời hứa với hoa trái. Đình Đông giữ đêm dài, giữ lời nguyền và những món nợ chưa đòi. Hai sứ giả vẫn đứng chờ ngoài cửa.',
        choices: [{ k: 'summer', label: 'Theo Đình Hạ', sub: 'Phép chữa lành, tiếng hát; được bạn bè.' }, { k: 'winter', label: 'Theo Đình Đông', sub: 'Lời nguyền, bóng tối; bảy năm một lần đình nộp một linh hồn.' }] }; },
    apply(S, X, k) { S.flags.courtQ = null; S.flags.court = k; cnt(S, 'court_' + k);
      if (k === 'summer') { X.gain('Arcane', 4); X.gain('Spirit', 3); X.add('so', 4); return 'Bạn nhận cành hoa, còn ướt sương. Sứ giả đình Đông cúi đầu, quay đi, để lại một vệt giá trên bậc cửa. Sáng hôm sau, cánh bạn ngả màu nắng.'; }
      X.gain('Curse', 4); X.gain('Stealth', 3); G.trajBump(S, { am: .4 }); return 'Bạn nhận mảnh băng. Nó lạnh buốt tới tận khuỷu tay, mà bạn không buông. Giữa hè, nó vẫn không tan trong tay bạn. Cành hoa của sứ giả đình Hạ để lại trên bậc cửa, tới trưa thì héo.'; },
    auto: S => S.traits.social > .6 || S.traits.pious > .6 ? 'summer' : S.traits.bold > .45 || S.traits.social < .3 ? 'winter' : 'summer'
  });
  dec('fae', 'fae_deal', {
    prio: 5, gap: 1, tree: { q: 'dealQ' },
    when: S => !S.dead && !!S.flags.dealQ,
    build(S, X) { const d = S.flags.dealQ;
      return { title: 'Giao kèo', body: `${d.name} xin bạn cứu con gái, nước mắt chảy không buồn lau. Yêu Tinh không giúp ai không công: giá phải nói trước, và đã nói là phải trả. Người ấy ngẩng lên, chờ bạn ra giá.`,
        choices: [{ k: 'memory', label: 'Lấy một ký ức', sub: 'Ngày đẹp nhất đời người mẹ. Phép của bạn mạnh thêm.' }, { k: 'gold', label: 'Lấy vàng', sub: `Một nửa trước, một nửa sau. Người ta hay quên nửa sau.` }, { k: 'free', label: 'Giúp không lấy gì', sub: 'Người phàm biết ơn; đình cười bạn.' }] }; },
    apply(S, X, k) { const d = S.flags.dealQ; S.flags.dealQ = null; S.flags.deal = d; cnt(S, 'deal_' + k);
      if (k === 'memory') { X.gain('Arcane', 3); X.add('sm', 3); X.add('so', -2); return `Bạn đặt hai ngón tay lên trán người mẹ, rút ký ức ra như rút một sợi chỉ vàng, mảnh và ấm. ${first(d.name)} đứng ngẩn ra một lúc, như vừa quên mình định nói gì. Rồi người ấy quay lưng, chạy về với con. Sợi chỉ ấy bạn cuộn lại, cất vào hộp.`; }
      if (k === 'gold') { X.money(Math.round(med(S, X) * .6)); return 'Bạn nhận nửa túi vàng, nặng trĩu tay, rồi ghi lời hứa lên một chiếc lá sồi. Chiếc lá ấy sẽ không bao giờ úa. Nửa còn lại, người kia hứa mùa sau mang tới.'; }
      X.add('so', 6); X.add('h', 4); return 'Bạn ngồi chữa cho đứa bé suốt một đêm, tới khi má nó hồng trở lại. Rồi bạn đuổi người mẹ về trước khi bà kịp nói lời cảm ơn. Đình biết chuyện, cười bạn cả mùa. Bạn kệ.'; },
    auto: S => S.traits.social > .6 ? 'free' : S.traits.studious > .5 ? 'memory' : 'gold'
  });

  // ─────────── Hải Tộc ───────────
  // Nguồn: "Nàng tiên cá" của Andersen, selkie trong văn học dân gian Scotland, Ireland (áo da bị giấu, phải ở lại trên cạn,
  // tìm lại áo thì về biển), siren của Odyssey (hát gọi tàu vào đá), merrow, truyện người đi biển về tiếng hát cá voi.
  add('merfolk', [
    { id: 'mer_gills', st: ['infant', 'child'], w: 5, run(S, X) { X.add('hl', 4); X.add('h', 4);
        return { t: 'Mẹ bế bạn xuống nước lần đầu, nước vịnh ấm và trong xanh. Bạn sặc, giãy đạp, rồi hai khe sau tai bỗng mở ra. Nước mặn tràn qua mà bạn vẫn thở. Bạn thở được dưới biển trước cả khi biết đi, và mẹ cười tới mức sủi cả bọt.', k: 'big' }; } },
    { id: 'mer_reef', st: CT, rep: true, gap: 3, c: seaSide, w: 2.5, run(S, X) { X.gain('Arcane', 2); X.add('sm', 2);
        return { t: S.age % 2 ? 'Mùa này bạn tự trông lấy một góc vườn san hô của nhà. Sáng nào cũng lặn xuống đếm từng cành, gỡ từng con ốc bám. Có một cành san hô đỏ mới nhú, nhỏ bằng đầu ngón tay. Bạn đặt cho nó một cái tên, và không kể với ai.' : 'Bạn theo bà chăm vườn san hô trước nhà. Bà gỡ sao biển ăn san hô bằng hai ngón tay, nhanh như mổ cá. Sau mỗi cơn bão, hai bà cháu cắm lại từng cành gãy, buộc bằng sợi rong. Bà bảo san hô lớn chậm lắm, một đời người chỉ được một gang.', k: 'good' }; } },
    { id: 'mer_whale', st: ['teen'], c: seaSide, w: 3, run(S, X) { X.add('so', 4); X.gain('Taming', 3); X.add('h', 5);
        return { t: 'Đàn cá voi đi ngang vịnh vào một buổi sáng nhiều sương. Bạn lặn xuống thật sâu, cất giọng hát cùng chúng, tiếng hát rung cả lồng ngực. Con lớn nhất quay đầu lại, đáp bằng một tiếng ngân dài. Ông nội bảo đó là tên bạn trong tiếng cá voi. Bạn tập mãi mà không ngân được cho giống.', k: 'big' }; } },
    { id: 'mer_dry', st: AD, rep: true, gap: 3, c: (S, X) => !seaSide(S) && !X.hasCond('dry'), w: 2.5, run(S, X) { X.cond('dry'); X.add('hl', -6); X.add('h', -4); if (!S.flags.migrateQ) S.flags.migrateQ = 'Vảy bạn cần nước mặn.';
        return { t: S.age % 2 ? `Mùa khô ở ${homeName(S, X)}, nước giếng cạn dần, mà vảy bạn thì không chờ được. Từng mảng bong ra, để lại da non đỏ rát. Bạn đổi cả tuần công lấy vài gáo nước để ngâm tay. Những lúc ấy, bạn nhớ biển tới mức buồn nôn.` : `Xa biển đã lâu, vảy trên lưng bạn khô nứt, áo cọ vào là rát. Ở ${homeName(S, X)}, sáng nào bạn cũng phải ngâm mình trong máng nước ngựa. Người qua đường nhìn bạn như nhìn con cá mắc cạn. Đêm nằm, bạn nghe mãi một tiếng sóng không có thật.`, k: 'bad' }; } },
    { id: 'mer_rock', st: ['adult'], c: S => seaSide(S) && !(S.family.spouse && S.family.spouse.alive) && !S.flags.cloakQ && !S.flags.cloak, w: 1, tree: { theme: 'romance' }, run(S, X) {
        const sx = S.sex === 'm' ? 'f' : 'm', nm = X.name('human', sx); S.flags.cloakQ = { name: nm, sex: sx };
        return { t: `Bạn lên bãi đá phơi nắng, cởi áo vảy để bên cạnh như mọi lần. Nắng ấm, sóng ru, bạn ngủ quên lúc nào không biết. Tỉnh dậy, áo đã mất. ${first(nm)}, một ${sx === 'm' ? 'anh' : 'chị'} ngư dân, đứng gần đó, hai tay giấu sau lưng, mắt không rời bạn.`, k: 'info' }; } },
    { id: 'mer_cloak_found', st: AD, w: 4, tree: { from: ['mer_cloak:stay'], wait: [3, 10], dir: { du: 1 } }, run(S, X) {
        const sp = S.family.spouse, nm = sp ? first(sp.name) : 'người kia';
        if (sp && sp.alive && (S.traits.social > .55 || S.family.kids.some(k => k.alive))) { X.add('h', 4); S.flags.cloak = 'kept';
          return { t: `Đứa con của bạn lôi từ gầm giường ra một tấm áo vảy cũ, xanh ánh bạc, hỏi đây là gì. Bạn cầm nó ra tận mép nước, đứng tới khi trời tối, sóng liếm lên tận cổ chân. Rồi bạn mang về, gấp lại, cất vào rương. ${nm} nhìn thấy hết, mà không hỏi một câu.`, k: 'info', o: 'stay' }; }
        if (sp && sp.alive) { S.family.spouse = null; S.flags.leftSpouse = true; }
        S.flags.cloak = 'back'; X.add('h', 10); X.add('so', -6); G.trajBump(S, { du: .3 });
        return { t: `Bạn tìm thấy tấm áo vảy trong rương cũ của ${nm}, gói kỹ trong vải dầu, nằm dưới đáy cùng. Bạn ngồi ôm nó tới nửa đêm. Rồi bạn khoác áo, ra bãi, xuống nước. Bạn không quay đầu lại.`, k: 'big', o: 'sea' }; } },
    { id: 'mer_drowned', st: AD, rep: true, gap: 5, c: seaSide, w: 1.8, tree: { dir: { dao: 1, vo: .5, gia: .5 } }, run(S, X) {
        const n = X.int(2, 5); X.add('so', 5); S.fame += 2; if (S.faith === 'deep') S.devotion = Math.min(100, S.devotion + 5);
        return { t: S.age % 2 ? `Một con thuyền đánh cá lật ngoài rạn lúc chạng vạng. Bạn lặn đi lặn lại, mắt cay xè vì nước đục, kéo lên được ${n} người. Ngư dân trên bờ quỳ xuống bãi cát, có người khóc thành tiếng. Đêm ấy bạn ra rạn ngồi một mình, hát cho những ai biển đã giữ lại.` : `Sau bão, bạn lặn xuống xác tàu, luồn qua những khoang ngập tối om, mảnh gỗ gãy nhọn như răng cá. Bạn kéo lên được ${n} người còn thở, từng người một. Người cuối cùng bạn kéo lên đã lạnh ngắt. Bạn ôm người ấy nổi trên mặt nước, hát cho họ nghe đoạn đường xuống đáy biển.`, k: 'good' }; } },
    { id: 'mer_song', st: ['adult'], c: S => seaSide(S) && !S.flags.sirenQ && !S.flags.siren, w: 1.2, run(S, X) {
        S.flags.sirenQ = true; return { t: 'Đêm không trăng, có một tàu buôn lạc gần bãi đá ngầm, ngọn đèn treo mũi tàu chao đảo. Các bà già trong đàn trồi lên khỏi mặt nước, tóc rũ xuống như rong. Rồi họ bắt đầu hát, giọng ngọt và chậm. Con tàu khẽ đổi hướng, về phía bãi đá.', k: 'info' }; } },
    { id: 'mer_siren_seen', st: AD, w: 3, tree: { from: ['mer_siren:sing'], wait: [1, 6], dir: { am: 1 } }, run(S, X) {
        X.add('so', -6); X.add('h', -4);
        return { t: `Một thủy thủ sống sót từ con tàu năm ấy nhận ra giọng bạn giữa chợ ${homeName(S, X)}, lúc bạn đang trả giá mớ cá. Hắn không làm gì, chỉ đứng sững, mặt trắng bệch, nhìn bạn. Rồi hắn quay đi. Từ hôm đó, không ai ở bến bán cá cho bạn nữa.`, k: 'bad' }; } },
    { id: 'mer_siren_gift', st: AD, w: 3, tree: { from: ['mer_siren:warn'], wait: [1, 6], dir: { gia: 1, thuong: 1 } }, run(S, X) {
        X.money(Math.round(med(S, X) * .8)); X.add('h', 5);
        return { t: 'Thuyền trưởng con tàu năm ấy quay lại vịnh, đứng ở mũi tàu nhìn xuống nước rất lâu. Rồi ông thả xuống một chiếc rương nhỏ buộc phao đỏ. Trong rương có bạc, và một lá thư không ký tên, mực đã nhòe vì nước. Bạn giữ lá thư ấy, dù không đọc được hết.', k: 'good' }; } },
    { id: 'mer_pearl', st: AD, rep: true, gap: 4, c: S => seaSide(S) && isTown(S), w: 1.5, tree: { dir: { thuong: 2 } }, run(S, X) { const g = Math.round(med(S, X) * .4); X.money(g);
        return { t: S.age % 2 ? `Mùa này ngọc trai ở bãi nuôi ra đều và tròn. Bạn mang lên chợ ${homeName(S, X)}, bày trên mảnh vải xanh, chẳng mấy chốc đã có người vây quanh. Một bà quý tộc mua liền ba viên, không thèm mặc cả. Hết buổi, túi bạn nặng thêm ${G.coin(g)}.` : `Bạn mang một túi ngọc trai lên chợ ${homeName(S, X)}, viên nào cũng tự tay mình lặn lấy. Thương nhân loài người soi từng viên dưới nắng, chê lên chê xuống như thể chính họ lặn được. Mặc cả tới xế chiều, bạn về với ${G.coin(g)}.`, k: 'good' }; } },
    { id: 'mer_storm', st: AD, rep: true, gap: 4, c: S => seaSide(S) && G.raceHome(S), w: 1.5, run(S, X) { X.add('hl', -2); X.add('h', 5);
        return { t: S.age % 2 ? 'Cơn bão năm nay dữ hơn mọi năm, sóng đánh vỡ cả cầu cảng của người trên bờ. Bạn cùng đàn lặn sâu, bám vào rạn, nghe tiếng sấm vọng xuống như tiếng trống xa. Ba ngày sau trồi lên, bờ biển đã khác hẳn. Bạn bơi một vòng, đếm lại những tảng đá quen.' : 'Bão tới, người trên bờ đóng chặt cửa, chằng dây mái nhà. Hải Tộc thì lặn xuống dưới lớp sóng, nơi nước vẫn lặng. Bạn nằm trên cát đáy biển, nhìn cơn bão chạy qua trên đầu như một đàn trâu. Lũ trẻ trong đàn ngủ ngon lành bên cạnh.', k: 'info' }; } },
    { id: 'mer_deep', st: ['elder'], w: 3, run(S, X) { X.add('sm', 4); X.add('h', 3);
        return { t: 'Người già của Hải Tộc không nằm chờ chết trên cạn. Mỗi mùa bạn bơi xa hơn một chút, xuống những tầng nước lạnh và tối mà người trẻ chưa dám. Ở dưới đó, mọi tiếng ồn trên mặt nước tắt hẳn. Bạn nghe thấy cá voi già hát, và hình như chúng đang gọi.', k: 'info' }; } }
  ]);
  dec('merfolk', 'mer_cloak', {
    prio: 5, gap: 1, tree: { q: 'cloakQ', theme: 'romance' },
    when: S => !S.dead && !!S.flags.cloakQ,
    build(S, X) { const c = S.flags.cloakQ;
      return { title: 'Áo vảy bị giấu', body: `${c.name} giấu áo vảy của bạn. Không có áo, Hải Tộc không về được vùng nước sâu, chỉ quanh quẩn ở bãi nông như cá con. ${c.sex === 'm' ? 'Anh' : 'Chị'} ta nói sẽ trả, nếu bạn ở lại. Giọng run run, mắt nhìn xuống cát.`,
        choices: [{ k: 'stay', label: 'Ở lại', sub: 'Thành vợ chồng; áo vẫn nằm đâu đó trong nhà.' }, { k: 'sing', label: 'Hát cho người đó ngủ rồi tìm áo', sub: 'Cần giọng hát có phép.' }, { k: 'leave', label: 'Bỏ áo, xuống nước', sub: 'Về được biển nông, nhưng mất áo thì yếu đi nhiều năm.' }] }; },
    apply(S, X, k) { const c = S.flags.cloakQ; S.flags.cloakQ = null; cnt(S, 'cloak_' + k);
      if (k === 'stay') { S.family.spouse = { name: c.name, race: 'human', age: X.years(S) + X.int(-3, 6), alive: true }; X.add('h', 4); X.add('so', 6); return `Bạn ở lại. ${first(c.name)} dựng cho bạn cái bể đá sau nhà, dẫn nước biển về bằng ống tre, để bạn ngâm mình mỗi tối. Đêm đầu, bạn nằm trong bể nghe sóng vọng từ xa. Chuyện áo vảy, không ai nhắc tới.`; }
      if (k === 'sing') { if ((S.mastery.Arcane || 0) + (S.mastery.Spirit || 0) >= 30 || X.chance(.4)) { X.gain('Arcane', 3); S.flags.cloak = 'took'; return `${first(c.name)} ngủ gục bên bàn trước khi bạn hát hết bài, tay vẫn còn nắm chén trà. Bạn lục từng góc nhà. Áo vảy nằm dưới đáy rương, gói kỹ trong vải dầu. Bạn ôm nó chạy ra biển, không dám nhìn lại.`; }
        X.add('hl', -6); S.flags.cloak = 'lost'; return 'Giọng bạn run, lạc nhịp. Người kia không ngủ, chỉ nhìn bạn, và hiểu ra bạn đang làm gì. Bạn bỏ chạy ra biển, không có áo.'; }
      X.add('hl', -10); X.add('h', -10); S.flags.cloak = 'lost'; return 'Bạn lao xuống nước không có áo, da trần rát buốt vì muối. Biển nông nhận bạn. Biển sâu thì không: mỗi lần lặn quá chục sải, ngực bạn thắt lại như bị bóp. Trên bờ, có người đứng gọi tên bạn tới tối.'; },
    auto: S => S.traits.social > .6 ? 'stay' : S.traits.bold > .5 ? 'sing' : 'leave'
  });
  dec('merfolk', 'mer_siren', {
    prio: 5, gap: 1, tree: { q: 'sirenQ' },
    when: S => !S.dead && !!S.flags.sirenQ,
    build(S, X) {
      return { title: 'Tiếng hát gọi tàu', body: 'Hàng trên tàu sẽ chia cho cả đàn: vải, rượu, bạc. Các bà già quay lại gọi bạn cùng hát. Từ bãi đá ngầm bơi ra tới tàu, nhanh thì vẫn kịp.',
        choices: [{ k: 'sing', label: 'Cùng hát', sub: 'Được chia phần hàng; có thể có người sống sót nhớ giọng bạn.' }, { k: 'warn', label: 'Bơi ra báo cho tàu', sub: 'Đàn sẽ giận.' }, { k: 'away', label: 'Lặn đi chỗ khác', sub: '' }] }; },
    apply(S, X, k) { S.flags.sirenQ = null; S.flags.siren = k; cnt(S, 'siren_' + k);
      if (k === 'sing') { X.money(Math.round(med(S, X) * 1.2)); G.trajBump(S, { am: .3 }); X.add('h', -4); return 'Bạn cất giọng hát cùng các bà. Con tàu vỡ trên đá trước khi trời sáng, tiếng gỗ gãy lẫn tiếng người kêu. Đàn chia nhau hàng hóa, phần của bạn là một rương vải và mấy thỏi bạc. Tiếng kêu đêm ấy, bạn còn nghe lại trong nhiều giấc mơ.'; }
      if (k === 'warn') { S.fame += 3; X.add('so', -4); return 'Bạn bơi nhanh hơn tiếng hát, bám lên mạn tàu, chỉ cho thủy thủ đường ra. Con tàu bẻ lái kịp, sượt qua mép đá. Sáng hôm sau, trong đàn không ai nói chuyện với bạn. Các bà già quay lưng mỗi khi bạn bơi ngang.'; }
      return 'Bạn lặn xuống thật sâu, sâu tới khi tai ù đi, cho tới khi không còn nghe tiếng hát. Ở dưới ấy chỉ có bóng tối và tiếng tim mình đập. Sáng ra bạn mới trồi lên. Con tàu ra sao, bạn không hỏi.'; },
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
        return { t: `Bạn nở từ một quả trứng ấp ba mùa trong ổ đá nóng ${at}. Đêm vỏ trứng nứt, cả thị tộc thức chờ, người nào cũng đặt tay lên ổ đá cho thêm hơi ấm. Vỏ trứng được nghiền vào mực để viết tên bạn lên sổ thị tộc. Dòng chữ đầu tiên về bạn, vì thế, có mùi lưu huỳnh.`, k: 'big' }; } },
    { id: 'drg_spring', st: CT, rep: true, gap: 3, c: S => bio(S) === 'ash_peak' || X0(S).hot, w: 2.5, run(S, X) { X.add('hl', 4); X.gain('Fire', 2);
        return { t: S.age % 2 ? 'Lũ trẻ trong thị tộc thi nhau xem ai ngâm được lâu nhất ở miệng suối sôi. Bạn ngồi lì tới khi đứa cuối cùng bỏ cuộc, ra khỏi suối thì chân đứng không vững. Mấy đứa kia phải dìu bạn về. Cả tuần sau vảy bạn sáng lên như than hồng.' : 'Bạn tắm trong suối nước sôi ở sườn núi, nơi người loài khác chạm tay vào là phỏng. Hơi nước bốc lên trắng xóa, mùi lưu huỳnh xộc vào mũi. Bạn ngâm tới khi người đỏ lựng. Ra khỏi suối, vảy bạn bóng như đồng mới đánh.', k: 'good' }; } },
    { id: 'drg_struck', st: ['teen'], c: S => bio(S) === 'storm_spire', w: 3, run(S, X) { X.gain('Lightning', 5); X.add('hl', -6); S.fame += 1;
        return { t: 'Giữa cơn giông, bạn leo lên mỏm đá cao nhất, như lũ trẻ trong thị tộc vẫn thách nhau. Gió quật suýt hất bạn xuống. Rồi sét đánh trúng. Bạn tỉnh dậy, vảy cháy đen, tai ù ba ngày. Từ đó bạn thấy được sét trước khi nó đánh, như thấy một sợi chỉ sáng giăng sẵn trên trời.', k: 'big' }; } },
    { id: 'drg_roar', st: ['teen'], w: 3, run(S, X) { X.gain('Fire', 3); X.add('so', 3);
        return { t: 'Bạn gầm lần đầu tiên, tiếng gầm bật ra từ đâu đó sâu trong bụng. Đàn dê trên sườn núi chạy tán loạn, đá vụn lăn rào rào xuống thung. Chính bạn cũng giật mình. Ông nội gật đầu, chậm rãi: giọng có máu rồng.', k: 'good' }; } },
    { id: 'drg_shed', st: AD, rep: true, gap: 6, w: 1.3, run(S, X) {
        if (isTown(S)) { const g = Math.round(med(S, X) * .3); X.money(g); return { t: `Mùa lột vảy, bạn ngứa ngáy cả tháng, đêm nằm cọ lưng vào vách tới tróc cả vôi. Dược sư ở ${homeName(S, X)} biết chuyện, tới tận nơi xin mua hết chỗ vảy rụng để nghiền làm thuốc. Ông ta trả ${G.coin(g)}, còn hẹn mùa sau quay lại.`, k: 'good' }; }
        X.add('so', 2); return { t: 'Mùa lột vảy, bạn ngứa ngáy cả tháng, đi đâu cũng rơi lả tả những mảnh vảy cũ. Lũ trẻ trong thị tộc chạy theo nhặt, xâu thành chuỗi đeo làm bùa. Đứa nào nhặt được mảnh to nhất thì vênh mặt cả mùa.', k: 'info' }; } },
    { id: 'drg_greed', st: AD, c: (S, X) => !S.flags.hoardQ && !S.flags.hoard && S.gold > 3 * med(S, X), w: 2, tree: { dir: { thuong: 2 } }, run(S, X) {
        S.flags.hoardQ = true; return { t: 'Đêm nào bạn cũng đếm lại tiền, xếp từng chồng cho thẳng, đếm xong lại đếm. Có hôm thiếu một đồng, bạn lục tung cả nhà tới sáng, mắt đỏ ngầu. Rồi bạn tìm thấy nó dưới gầm giường. Bạn nắm chặt đồng tiền trong tay, tim còn đập thình thịch.', k: 'info' }; } },
    { id: 'drg_thief', st: AD, w: 4, tree: { from: ['drg_hoard:keep'], wait: [1, 6], dir: { vo: 1, thuong: 1 } }, run(S, X) {
        if (X.chance(odds(S, X, .5))) { S.fame += 3; X.add('h', 6); return { t: 'Có kẻ đào hầm vào kho của bạn, lấy đi đúng một chiếc cốc vàng. Bạn biết ngay, vì sáng ấy đi qua kho thiếu mất một tiếng leng keng quen thuộc. Bạn lần theo mùi hắn qua hai ngọn đồi, tới tận bìa rừng. Chiếc cốc trở về chỗ cũ trước khi trời tối.', k: 'good', o: 'got' }; }
        const g = Math.round(S.gold * .2); X.money(-g); X.add('h', -12);
        return { t: `Có kẻ đào hầm vào kho của bạn trong lúc bạn ngủ. Hắn lấy đi ${G.coin(g)} và một chiếc cốc vàng. Bạn lục cả vùng suốt một mùa, lật từng hòn đá, không thấy hắn đâu. Đêm đêm bạn ngồi trước chỗ trống trên kệ, không ngủ.`, k: 'bad', o: 'lost' }; } },
    { id: 'drg_debt', st: AD, c: S => !S.flags.clanQ, w: 1.5, tree: { theme: 'clan' }, run(S, X) {
        const nm = X.name('dragonkin', X.chance(.5) ? 'm' : 'f'), c = Math.round(med(S, X) * .8); S.flags.clanQ = { name: nm, cost: c };
        return { t: `${nm}, người cùng thị tộc với bạn, thua bạc trắng tay rồi bỏ trốn trong đêm. Món nợ ${G.coin(c)} với một thị tộc khác ở lại, kèm theo cái tên của cả thị tộc bạn. Sáng ra, trước đài lửa đã có khách lạ đứng chờ.`, k: 'bad' }; } },
    { id: 'drg_hunt_kin', st: AD, w: 4, tree: { from: ['drg_clan:hunt'], wait: [1, 4], dir: { du: 1, vo: 1 } }, run(S, X) {
        const nm = first(S.flags.clanDebt.name); X.add('so', 5); S.fame += 3;
        return { t: `Bạn tìm thấy ${nm} ở một mỏ đá phía nam, đang làm phu trả nợ cho người khác, vảy xám xịt bụi đá. Thấy bạn, ${nm} buông cuốc, không chạy. Bạn đưa ${nm} về quỳ trước đài lửa của thị tộc kia. Họ nhận lời xin lỗi, và tên bạn được ghi lên sổ danh dự.`, k: 'good' }; } },
    { id: 'drg_cold', st: ['child', 'teen', 'adult', 'elder'], rep: true, gap: 3, c: (S, X) => (X0(S).cold || bio(S) === 'frost_tundra') && !X.hasCond('torpid'), w: 3, tree: { theme: 'hardship' }, run(S, X) {
        X.cond('torpid'); X.add('hl', -6);
        return { t: S.age % 2 ? `Tuyết phủ trắng ${homeName(S, X)}, và người bạn lì dần đi như hòn đá. Có sáng bạn không đứng dậy nổi, phải nằm chờ nắng lên mới cử động được. Người trong phố vẫn đi lại, cười nói, phả hơi trắng. Bạn thì chỉ muốn chui vào lò bánh mà nằm.` : `Mùa đông ở ${homeName(S, X)}, máu bạn chậm lại như máu thằn lằn. Bạn ngủ mười bốn tiếng mỗi ngày, quấn ba lớp da mà vẫn run cầm cập. Dậy được thì tay chân cứng đờ, cầm cái thìa cũng rơi. Bạn ngồi sát bếp lửa, đếm từng ngày tới xuân.`, k: 'bad' }; } },
    { id: 'drg_wings', st: AD, c: (S, X) => (S.mastery.Fire || 0) >= 40 || X.ctier(S) >= 2, w: .8, run(S, X) {
        S.fame += 5; X.add('so', 6); G.trajBump(S, { du: .3 }); S.flags.wings = true;
        return { t: 'Hai u xương trên bả vai bạn nhức nhối suốt một mùa, rồi một đêm nứt ra thành mầm cánh, ướt và mềm như lá non. Cả thị tộc kéo tới xem. Trăm năm mới có một người mọc cánh. Họ dắt bạn lên đài lửa cho cả vùng tới xem, và bạn đứng đó, run run, không biết nên giấu cánh đi hay dang ra.', k: 'big', f: 'Long Nhân mọc cánh là dấu máu rồng tỉnh lại. Có người bay được, có người mang cánh tới chết mà không cất mình khỏi đất.' }; } },
    { id: 'drg_slayer', st: AD, rep: true, gap: 8, c: stranger, w: 1, tree: { theme: 'stranger', dir: { vo: 1 } }, run(S, X) {
        if (X.chance(odds(S, X, .5))) { S.fame += 3; return { t: `Một hiệp sĩ trẻ ở ${homeName(S, X)} nghe đồn bạn là rồng đội lốt người, chặn bạn giữa chợ, rút kiếm thách đấu. Người ta vây kín thành vòng. Bạn quật hắn ngã ba lần, lần thứ ba thì đặt chân lên lưỡi kiếm của hắn, rồi tha. Hôm sau cả phố biết tên bạn.`, k: 'good' }; }
        X.add('hl', -12); X.cond('wound');
        return { t: `Một hiệp sĩ trẻ ở ${homeName(S, X)} nghe đồn bạn là rồng đội lốt người. Hắn đâm bạn bằng ngọn giáo có khắc chữ thánh, ngay giữa chợ, trước khi bạn kịp nói một lời. Mũi giáo lách qua kẽ vảy. Người ta khiêng bạn đi, còn hắn thì được tung hô.`, k: 'bad' }; } },
    { id: 'drg_dream', st: ['elder'], w: 3, run(S, X) { X.add('sm', 5); X.add('h', 4);
        return { t: 'Về già bạn ngủ dài hơn, có khi nửa mùa mới tỉnh. Trong mơ, bạn bay trên một đại lục chưa có thành quách, gió nóng thổi dưới cánh, cùng những con rồng đã chết từ trước khi có Long Nhân. Chúng gọi bạn bằng một cái tên lạ. Tỉnh dậy, bạn cố nhớ cái tên ấy mà không nhớ nổi.', k: 'info' }; } }
  ]);
  dec('dragonkin', 'drg_hoard', {
    prio: 5, gap: 1, tree: { q: 'hoardQ' },
    when: S => !S.dead && !!S.flags.hoardQ,
    build(S, X) {
      return { title: 'Lòng tham rồng', body: `Bạn có ${G.coin(S.gold)}, mà vẫn thấy chưa đủ. Đêm nằm, tai bạn nghe được cả tiếng bạc khẽ chạm nhau trong rương. Máu rồng trong người đòi một kho báu, và đòi canh giữ nó.`,
        choices: [{ k: 'keep', label: 'Dựng kho, canh giữ', sub: 'Vui khi tiền đầy kho; ít người muốn tới gần; kẻ trộm sẽ tới.' }, { k: 'give', label: 'Chia bớt cho thị tộc', sub: `Mất 30% tiền; thị tộc nhớ ơn.` }] }; },
    apply(S, X, k) { S.flags.hoardQ = null; S.flags.hoard = k; cnt(S, 'hoard_' + k);
      if (k === 'keep') { X.add('h', 8); X.add('so', -6); G.trajBump(S, { thuong: .4 }); return 'Bạn đào một cái hầm dưới gầm giường, lót đá, xếp tiền theo từng loại, từng năm đúc. Đêm nào cũng xuống đếm, đếm xong mới ngủ được. Người trong thị tộc thôi ghé nhà bạn. Bạn không để ý.'; }
      const g = Math.round(S.gold * .3); X.money(-g); X.add('so', 10); S.fame += 2; return `Bạn mang ${G.coin(g)} lên đài lửa chia cho các nhà trong thị tộc. Tay bạn run suốt buổi, mỗi túi bạc trao đi như rứt một mảnh vảy. Người ta cúi đầu cảm ơn. Đêm ấy bạn nằm mãi không ngủ, mà lòng lại nhẹ.`; },
    auto: S => S.traits.social > .5 || S.traits.pious > .6 ? 'give' : 'keep'
  });
  dec('dragonkin', 'drg_clan', {
    prio: 5, gap: 1, tree: { q: 'clanQ' },
    when: S => !S.dead && !!S.flags.clanQ,
    build(S, X) { const c = S.flags.clanQ;
      return { title: 'Danh dự thị tộc', body: `Với Long Nhân, nợ của một người là nợ của cả thị tộc. Thị tộc kia đòi ${G.coin(c.cost)}, hoặc đòi người. Sứ giả của họ đứng trước đài lửa, đuôi quất xuống đá từng nhịp, chờ câu trả lời.`,
        choices: [{ k: 'pay', label: `Trả nợ thay (${G.coin(c.cost)})`, sub: 'Giữ danh dự thị tộc.' }, { k: 'hunt', label: `Đi bắt ${first(c.name)} về`, sub: 'Đường xa; về được thì danh dự còn cao hơn.' }, { k: 'disown', label: 'Gạch tên khỏi sổ thị tộc', sub: 'Thị tộc kia không đòi nữa, nhưng thị tộc mình mất mặt.' }] }; },
    apply(S, X, k) { const c = S.flags.clanQ; S.flags.clanQ = null; S.flags.clanDebt = c; cnt(S, 'clan_' + k);
      if (k === 'pay') { X.money(-c.cost); X.add('so', 6); S.fame += 2; return 'Bạn mang bạc tới tận đài lửa của thị tộc kia, quỳ xuống, cúi đầu xin lỗi thay người đã trốn. Đầu gối bạn chạm đá nóng. Tộc trưởng bên ấy nhận bạc, gật đầu. Món nợ khép lại, còn cái tên kẻ trốn thì bạn vẫn nhớ.'; }
      if (k === 'hunt') { G.trajBump(S, { du: .3 }); X.add('h', -2); return `Bạn khoác áo đi đường, buộc chặt dao bên hông. Từ quán trọ này sang quán trọ khác, bạn hỏi thăm về một Long Nhân có vết sẹo trên mõm. Có người lắc đầu. Có người chỉ tay về phía nam.`; }
      X.add('so', -4); X.add('h', -4); return `Bạn tự tay gạch tên ${first(c.name)} khỏi sổ thị tộc. Ngòi bút run, mực đen loang cả sang tên cha mẹ người ấy. Thị tộc kia thôi đòi. Còn ở thị tộc mình, người ta nhìn trang sổ ấy, rồi nhìn bạn.`; },
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
        return { t: `Thứ đầu tiên bạn thấy là mặt của ${first(nm)}, thợ cả ${raceVi(r)}, mồ hôi nhỏ từng giọt xuống vỏ bạn. Ánh lò hắt đỏ một bên má. ${he(sx) === 'bà' ? 'Bà' : 'Ông'} ấy thở hắt ra, nói: "Chạy rồi." Đó là câu đầu tiên bạn ghi nhớ, và bạn cất nó vào một ngăn riêng trong lõi.`, k: 'big' }; } },
    { id: 'cst_plate', st: ['teen', 'adult'], w: 3, run(S, X) { const p = X.pick(PURPOSE); S.flags.purpose = p[0]; G.trajBump(S, p[1]); X.add('sm', 3);
        return { t: `Bạn cạy được tấm biển đồng gắn trong ngực mình, ốc đã gỉ, phải nạy mất nửa đêm. Trên đó khắc: "${p[0]}". Chưa ai từng nói với bạn điều đó. Bạn đọc đi đọc lại dòng chữ, rồi gắn tấm biển trở lại, vặn từng con ốc thật chặt.`, k: 'big' }; } },
    { id: 'cst_maker', st: AD, c: S => !!S.flags.maker, w: 2, tree: { dir: { nghe: 1, gia: 1 } }, run(S, X) {
        const m = S.flags.maker, ho = m.sex === 'f' ? 'Bà' : 'Ông';
        if (S.traits.social > .3) { X.gain('Engineering', 5); X.gain('Construct', 3); X.add('h', 4);
          return { t: `${first(m.name)} đã già, tay run không cầm nổi búa. ${ho} gọi bạn về xưởng, ngồi bên lò nguội, trao cho bạn chùm chìa khóa và cuốn sổ ghi cách đúc bạn. Trang đầu có một bức vẽ, nét vẽ còn rất trẻ. Bạn ngồi đọc tới sáng.`, k: 'good', o: 'home' }; }
        X.add('h', -6); return { t: `Ba năm sau bạn mới nghe tin ${first(m.name)} đã mất. Bạn về tìm xưởng cũ. Xưởng của ${ho.toLowerCase()} giờ bán bánh mì, mùi bơ thơm thay cho mùi than. Bạn đứng ở cửa một lúc, mua một ổ bánh, rồi đi.`, k: 'bad', o: 'away' }; } },
    { id: 'cst_worn', st: AD, c: (S, X) => !S.flags.coreQ && !S.flags.core && (X.hasCond('rust') || S.hl < 50 || X.years(S) >= 60), w: 2, run(S, X) {
        S.flags.coreQ = true; return { t: 'Thợ đúc mở ngực bạn ra, soi đèn vào thật lâu, gõ thử từng bánh răng. Rồi người ấy lắc đầu. Lõi đã mòn tới mức không sửa được nữa. Giờ bạn mới để ý tiếng mình kêu cót két to tới thế.', k: 'bad' }; } },
    { id: 'cst_core_after', st: AD, w: 4, tree: { from: ['cst_core:new'], wait: [1, 4] }, run(S, X) { X.add('so', -4); X.add('h', -4);
        return { t: 'Một người lạ chặn bạn ở chợ, gọi đúng tên bạn, mừng rỡ như gặp lại bạn cũ. Người ấy kể một chuyện hai người từng làm, kể tới đâu cười tới đó. Bạn biết đó là tên mình. Nhưng người ấy là ai, lõi bạn không còn giữ.', k: 'bad' }; } },
    { id: 'cst_humid', st: AD, rep: true, gap: 3, c: S => HUMID.includes(bio(S)), w: 2.2, tree: { theme: 'hardship' }, run(S, X) { X.add('hl', -4); if (X.chance(.3)) X.cond('rust');
        return { t: S.age % 2 ? `Mùa mưa ở ${homeName(S, X)} kéo dài cả tháng, sắt trong người bạn không lúc nào ráo. Đêm bạn đứng ngủ cạnh bếp lửa cho hơi ẩm bay đi. Sáng ra, vết gỉ đã lan thêm một đốt ngón tay. Bạn cạo nó đi bằng con dao nhỏ, cẩn thận như cạo râu.` : `Sương ở ${homeName(S, X)} không bao giờ tan hẳn, bám lên vỏ bạn thành từng hạt li ti. Sáng nào bạn cũng phải lau khớp, tra dầu, từng ngón một. Vậy mà khe giáp vai vẫn lấm tấm gỉ. Tiếng khớp kêu mỗi sáng một khác.`, k: 'bad' }; } },
    { id: 'cst_scrap', st: AD, rep: true, gap: 5, c: S => stranger(S) && isTown(S), w: S => wary(S) ? 3 : 1.8, tree: { theme: 'stranger', dir: { vo: 1 } }, run(S, X) {
        if (X.chance(odds(S, X, .5))) { X.money(Math.round(med(S, X) * .2)); return { t: `Ba gã thợ rèn thất nghiệp ở ${homeName(S, X)} chặn bạn trong hẻm, tay lăm lăm xà beng. Ở chợ đen, một bánh răng lõi Cơ Nhân bán được bằng nửa năm công. Bạn bẻ gãy cây xà beng đầu tiên bằng một tay. Hai gã kia bỏ chạy, đánh rơi cả túi tiền.`, k: 'good' }; }
        X.add('hl', -10); X.money(-Math.round(med(S, X) * .2));
        return { t: `Ba gã thợ rèn thất nghiệp ở ${homeName(S, X)} chặn bạn trong hẻm, tay lăm lăm xà beng. Chúng ghì bạn xuống, tháo mất hai bánh răng ở cổ tay trước khi lính tuần tới. Bàn tay bạn buông thõng, lủng lẳng. Hai bánh răng mới tốn một khoản, mà lắp vào không bao giờ khớp như cũ.`, k: 'bad' }; } },
    { id: 'cst_mother', st: AD, c: S => bio(S) === 'forge_ruins' || kin(S), w: 1.5, run(S, X) { X.gain('Construct', 4); X.add('sm', 3); X.add('h', 5);
        return { t: 'Bạn về Lò Đúc Mẹ, nơi những Cơ Nhân đầu tiên ra đời. Lò đã nguội từ lâu, mái tôn thủng lỗ chỗ, nắng rọi xuống thành từng cột bụi. Bạn áp tay lên thành lò. Bên trong vẫn có một tiếng gõ nhịp rất khẽ, đều như mạch đập.', k: 'big', f: J.races.construct.lore }; } },
    { id: 'cst_soul', st: AD, c: S => !!S.faith || (X0(S).faiths.light || 0) >= 25, w: 1.5, tree: { dir: { dao: 2 } }, run(S, X) {
        X.add('h', -5); if (S.traits.pious > .5) { X.gain('Spirit', 3); return { t: `Tu sĩ ở ${homeName(S, X)} chặn bạn ở bậc đền: thứ do người làm ra thì không có linh hồn để cứu. Cánh cửa khép lại trước mặt bạn. Bạn đứng ngoài nghe hết buổi lễ, tiếng hát vọng qua khe cửa. Tuần sau, bạn lại tới đứng đó.`, k: 'info', o: 'stay' }; }
        return { t: `Tu sĩ ở ${homeName(S, X)} chặn bạn ở bậc đền: thứ do người làm ra thì không có linh hồn để cứu. Người đi lễ lách qua bạn mà vào. Bạn quay về, đi chậm, tự hỏi cái gì trong lõi mình đang thấy đau.`, k: 'bad', o: 'go' }; } },
    { id: 'cst_twin', st: AD, w: 1.5, run(S, X) { X.add('so', 5); X.add('h', 4);
        return { t: 'Ở một ngã tư đông người, bạn gặp một Cơ Nhân cùng khuôn đúc với mình: cùng vết hàn trên má, cùng tiếng rít khi quay đầu. Hai người đứng nhìn nhau, quên cả đường. Rồi cả hai cùng mở nắp ngực so số hiệu, chỉ khác nhau một chữ. Tối ấy hai người ngồi kể cho nhau nghe mỗi người đã đi những đâu.', k: 'good' }; } },
    { id: 'cst_count', st: ['elder'], w: 3, run(S, X) { X.add('sm', 4);
        return { t: `Bánh răng chính của bạn đã quay hơn ${Math.round(X.years(S) * 31.5)} triệu vòng. Đêm nào bạn cũng nghe nó quay, chậm hơn ngày trước một chút. Bạn bắt đầu ghi lại từng ngày vào sổ, nét chữ đều tăm tắp, phòng khi lõi ngừng quay mà chưa kịp kể cho ai.`, k: 'info' }; } }
  ]);
  dec('construct', 'cst_core', {
    prio: 5, gap: 1, tree: { q: 'coreQ' },
    when: S => !S.dead && !!S.flags.coreQ,
    build(S, X) { const c = Math.round(med(S, X) * 1.2);
      return { title: 'Thay lõi', body: 'Thợ đúc có thể thay lõi mới: bạn sẽ chạy như mới xuất xưởng, nhưng ký ức trong lõi cũ không chắc theo sang được. Thay dần từng bánh răng thì còn giữ được mình, mà tốn nhiều năm. Trong ngực, lõi cũ vẫn quay, chậm và lệch nhịp.',
        choices: [{ k: 'new', label: `Thay lõi mới (${G.coin(c)})`, sub: 'Khỏe như mới; quên nhiều thứ.', cost: c }, { k: 'slow', label: `Thay dần từng bánh răng (${G.coin(Math.round(c / 2))})`, sub: 'Khỏe hơn một chút; vẫn là mình.', cost: Math.round(c / 2) }, { k: 'keep', label: 'Giữ lõi cũ', sub: 'Chạy tới đâu hay tới đó.' }] }; },
    apply(S, X, k, c) { S.flags.coreQ = null; S.flags.core = k; cnt(S, 'core_' + k);
      if (k === 'new') { X.money(-c.cost); X.add('hl', 30); X.add('sm', -20); S.conds = S.conds.filter(x => x.id !== 'rust'); return 'Bạn tỉnh dậy trên bàn đúc. Mọi khớp đều êm, không một tiếng kêu. Bạn nhìn tay mình một lúc lâu, như nhìn tay người khác. Có điều gì đó bạn định nhớ ra, mà không nhớ được.'; }
      if (k === 'slow') { X.money(-c.cost); X.add('hl', 12); return 'Mỗi mùa thay một bánh răng, cái cũ tháo ra bạn cất vào một chiếc hộp. Tới khi thay xong cái cuối cùng, hộp đã đầy. Bạn không biết trong người còn mảnh nào của ngày đầu tiên. Nhưng câu đầu tiên mình nghe được, bạn vẫn nhớ.'; }
      X.add('h', 4); X.add('sm', 2); return 'Bạn giữ lõi cũ. Đi đâu cũng kêu cót két, bước lên bậc thềm phải nghỉ hai lần. Kêu thì kêu, nhưng tiếng kêu ấy là của bạn.'; },
    auto: (S, X, d) => S.gold >= d.choices[0].cost && S.traits.bold > .5 ? 'new' : S.gold >= d.choices[1].cost ? 'slow' : 'keep'
  });

  // ─────────── Người ───────────
  // Loài người là mặc định của mọi sự kiện chung; thêm ba nút nói về chính cái ngắn ngủi, cái đông đúc của loài người.
  add('human', [
    { id: 'hum_hurry', st: AD, c: S => Object.entries((G.here(S).s || {}).races || {}).some(([r, v]) => r !== 'human' && G.RACES[r].le >= 200 && v >= 3), w: 1.2, run(S, X) { X.add('sm', 2);
        return { t: 'Một Tiên Tộc đi ngang chợ, dừng lại xem bạn mặc cả từng đồng cho bó rau. Ông ta mỉm cười: "Loài người làm gì cũng vội." Bạn đáp: "Vì chúng tôi không có bốn trăm năm." Ông ta nghĩ một lúc, rồi gật đầu, như vừa học được điều gì.', k: 'info' }; } },
    { id: 'hum_flood', st: ['child', 'teen', 'adult', 'elder'], rep: true, gap: 6, c: S => ['golden_plains', 'mist_coast'].includes(bio(S)) && (S.urban === false || ['farmer', 'herder'].includes(S.work)), w: 1.2, tree: { theme: 'hardship' }, run(S, X) {
        X.add('hl', -5); X.money(-Math.round(med(S, X) * .2));
        return { t: S.age % 2 ? 'Lũ năm nay về nhanh, chỉ một đêm mà ruộng đã thành sông. Bạn kịp khuân được ít đồ lên gác, phần còn lại trôi mất theo dòng nước đục. Nước rút, bùn ngập tới đầu gối. Cả làng cúi xuống dọn, không ai nói nhiều.' : 'Mưa thượng nguồn nửa tháng không dứt. Sông tràn bờ, nước đục ngầu ngập tới bậu cửa, cuốn theo cả rơm rạ lẫn chuồng gà. Cả làng kéo nhau lên gò đất cao, ngồi co ro chờ nước rút. Đêm ấy không ai ngủ, chỉ nghe tiếng nước vỗ vào chân gò.', k: 'bad' }; } },
    { id: 'hum_crowd', st: CT, c: S => { const s = G.here(S).s; return !!s && ['capital', 'city'].includes(s.tier); }, w: 2, run(S, X) { X.gain('Dagger', 2); X.add('sm', 2);
        return { t: `Chợ phiên ở ${homeName(S, X)} đông tới mức bạn tuột tay mẹ, lạc mất nửa ngày giữa rừng người. Bạn khóc một lúc, rồi thôi, đứng nghe người ta chửi nhau đủ mọi giọng. Tới khi mẹ tìm được, bạn đã thuộc mười câu chửi của mười vùng. Bạn còn học được cách giữ chặt túi tiền khỏi tay người lạ.`, k: 'info' }; } }
  ]);

  // ─────────── Đời thường của từng tộc ───────────
  // Một sự kiện lặp lại được mỗi tộc, câu chữ theo tuổi (nhỏ, lớn, già) và nơi ở: ở quê tộc hay giữa người cùng tộc (home),
  // hay ở khu của tộc khác (away). {h}: nơi đang ở; {z}: khu săn gần nhà. Hải Tộc xa biển dùng nhóm inland.
  const LIFE = G.RACE_LIFE = {
    elf: { skill: 'Bow',
      young: ['Bạn tập bắn tên xuyên qua những chiếc lá đang rơi, từ sáng tới khi tay mỏi nhừ. Lá rơi chẳng theo ý ai, gió đổi một chút là lệch. Tới cuối mùa thu, mười chiếc bạn trúng được một.', 'Bà cố dắt bạn đi khắp rừng, chỉ cho bạn cây nào đã có tên, cây nào chưa. Bà gõ nhẹ lên vỏ từng cây như gõ cửa nhà quen. Có những cây còn già hơn cả bà.', 'Bạn trèo lên tán Cây Mẹ, nằm vắt vẻo trên một cành to cả buổi chiều. Lá xào xạc như đang nói chuyện với gió. Bạn nghe mãi, tới khi ngỡ mình hiểu được vài câu.'],
      home: ['Bạn dành cả một mùa uốn cho cây sồi non mọc thẳng: buộc dây, nới dây, rồi buộc lại. Sáng nào cũng ra xem nó nhích được bao nhiêu. Người ngoài nhìn vào chẳng thấy gì khác, nhưng bạn thì thấy.', 'Cả tộc dời trại theo mùa quả sang phía bên kia rừng, đi chậm như một dòng suối. Lều dựng bằng cành rụng và dây leo. Không ai chặt một cành nào còn sống.', 'Bạn đi tuần biên rừng cùng đội cung thủ, ba tháng không nói quá mười câu. Cả đội trò chuyện bằng tiếng chim và cái gật đầu. Về tới trại, bạn mở miệng mà giọng khàn đặc.', 'Bạn chép lại một bài ca cổ lên vỏ bạch dương, từng chữ một, theo lời một bà lão rất già. Bà hát chậm, có đoạn phải dừng lại nhớ. Bạn chép kịp trước mùa đông. Mùa xuân năm sau, bà không còn nữa.'],
      away: ['Bạn trồng một cây sồi con ở góc sân nhà trọ, sáng nào cũng tưới. Chủ trọ đứng xem, cười bảo cây ấy lớn thì cháu ông mới được ngồi bóng mát. Bạn nghĩ bụng: cháu của cháu ông thì đúng hơn.', 'Ở {h} không có cây nào đủ già để nói chuyện. Tối tối bạn ra bờ sông, ngồi với cây liễu duy nhất ở đó. Nó cũng chẳng nói gì nhiều. Nhưng có nó vẫn hơn.', 'Người ở {h} trả tiền để nghe bạn kể về thời ông bà họ còn trẻ. Bạn kể đúng từng chi tiết, cả màu áo, cả tên con ngựa. Họ vỗ tay khen bạn bịa giỏi.'],
      old: ['Bạn ngồi dưới Cây Mẹ cả mùa, nhớ lại từng người mình đã quen, gọi tên từng người một. Danh sách dài hơn bạn tưởng. Có những cái tên phải nhớ ra rồi bạn mới biết mình đã nhớ họ suốt bao năm.', 'Lá trên đầu bạn đã rụng rồi mọc lại mấy trăm lần. Dạo này bạn thấy mình nhẹ dần đi, bước trên lá khô không còn nghe tiếng. Đêm đêm, gió từ phía tây thổi về mang theo mùi muối. Bạn biết ai đang gọi.'] },
    dwarf: { skill: 'Engineering',
      young: ['Bạn ngồi đếm vân đá trên vách hầm, ngón tay lần theo từng lớp. Ông nội đi qua, hỏi lớp này bao nhiêu tuổi, và bạn đáp sai. Tới cuối mùa thì bạn đáp đúng, được ông xoa đầu bằng bàn tay đầy bụi than.', 'Ông nội cho bạn kéo bễ lò rèn cả buổi, phì phò, phì phò, lửa đỏ rực lên theo từng nhịp. Cánh tay mỏi rã. Nhưng tối ấy bạn được ngồi bàn người lớn, cầm cốc đá như ai.', 'Bạn lạc trong đường hầm cũ cả một ngày, đèn tắt, chỉ còn bóng tối và tiếng nước nhỏ giọt. Bạn đứng yên, liếm ngón tay giơ lên, lần theo hơi gió mà ra. Cả họ khen bạn có mũi thợ mỏ. Mẹ thì ôm bạn chặt tới đau.'],
      home: ['Mùa này bạn xuống mỏ cùng tổ, gõ búa lên đá rồi áp tai nghe. Tiếng đục là đá chết, tiếng trong là có mạch. Tới cuối mùa, bạn đoán ra mạch quặng chạy về đâu trước cả thợ cả.', 'Đại sảnh họp bàn chuyện mở nhánh hầm mới, cãi nhau ba ngày, đập bàn tới mẻ cả góc. Bạn ngồi nghe, tới ngày thứ ba mới nói một câu. Cả sảnh im lặng. Về sau người ta còn nhắc câu đó.', 'Bạn cùng cả họ sửa lại cánh cổng đá của hầm, mài nhẵn những chỗ đã mòn. Rồi khắc thêm một hàng rune mới, ngay dưới hàng rune của tổ tiên. Đục xong nét cuối, ông chú già đưa tay sờ lên, gật đầu.', 'Bạn giữ lò chung một mùa, đêm nào cũng dậy cho thêm than, mắt díp lại vẫn không dám ngủ sâu. Lò không tắt lần nào. Hết mùa, người ta gọi bạn là người giữ lửa, nửa đùa nửa thật.'],
      away: ['Ở {h} không ai đọc được rune. Bạn khắc dấu thị tộc lên khung cửa phòng trọ cho đỡ nhớ nhà. Chủ trọ phát hiện, mắng một trận. Nhưng ông ta không bắt bạn bào đi.', 'Thợ rèn ở {h} làm ẩu tới mức bạn không nhịn được, giật búa sửa giúp ngay bên lò. Họ bực, đứng khoanh tay nhìn. Từ hôm đó, hễ gặp việc khó là họ sang gọi bạn.', 'Bạn gửi thư về thị tộc, hỏi chuyện lò, chuyện mỏ, chuyện ông chú có còn hay cãi. Thư đi nửa năm mới tới nơi. Thư trả lời về tới thì chuyện trong thư đã cũ, mà bạn vẫn đọc tới thuộc lòng.'],
      old: ['Bạn ngồi bên lò chung, kể cho lũ trẻ nghe tên từng ngách hầm và ai đã đào nó. Đứa nào cũng há miệng nghe. Có một ngách mang tên chính bạn, đào từ hồi râu còn chưa tết được.', 'Râu bạn dài chạm đất, phải vắt qua vai mà đi. Lũ trẻ trong họ thay nhau tết lại cho bạn, đứa tết chặt, đứa tết lỏng. Bạn để yên cho chúng tết, mắt lim dim bên lò.'] },
    orc: { skill: 'Axe',
      young: ['Bạn vật nhau với lũ trẻ trong trại từ sáng tới tối, người lấm bùn như con heo rừng. Thua nhiều hơn thắng. Nhưng không khóc lần nào, kể cả lần bị quật ngã ngay trước mặt mẹ.', 'Bạn được giao trông ngựa cho trại, ngủ ngoài trời giữa đàn ngựa cả mùa hè. Đêm nào cũng nghe tiếng ngựa thở, tiếng cỏ bị gặm sột soạt. Hết mùa, con ngựa nào bạn cũng gọi được tên.', 'Bố cho bạn cầm rìu thật lần đầu, chẻ củi cho cả trại. Bạn chẻ tới khi đống củi cao bằng đầu mình. Tối đó tay bạn không nắm lại được, mà miệng thì cứ cười.'],
      home: ['Trại dời đi theo mùa cỏ. Bạn đi đầu đoàn, dò đường qua những gò đá bố từng chỉ, nhớ từng tảng đá, từng khúc suối. Tới nơi, cả trại dựng xong lều trước khi trời tối.', 'Cả trại đi săn bò rừng một mùa, bụi tung mù mịt cả thảo nguyên. Bạn kéo về một con to nhất. Thịt chia đều cho mấy lều không còn đàn ông, phần mình để sau cùng.', 'Bạn ngồi canh lửa trại suốt đêm, nghe các bà kể lại những trận đánh cũ. Mỗi lần kể, trận đánh lại to hơn một chút. Bạn không cãi, chỉ thêm củi.', 'Hai trại tranh một bãi cỏ, tù trưởng cử bạn ra vật thay cả trại. Hai bên đứng vây kín, gõ giáo vào khiên. Bạn thắng. Bãi cỏ thuộc về trại bạn.'],
      away: ['Ở {h} bạn phải cúi đầu mới vào được cửa quán. Vào nhiều lần quá, trán u lên một cục. Rồi một hôm chủ quán cho nâng khung cửa, không nói lý do.', 'Bạn làm thuê cho một ông chủ ở {h}, khuân vác từ sáng tới tối. Lão trả công đúng hạn, không thiếu một đồng. Nhưng chưa bao giờ lão nhìn thẳng mặt bạn.', 'Lũ trẻ ở {h} trêu cái nanh của bạn, đứng xa ném sỏi. Bạn nhe nanh gầm một tiếng, chúng chạy tán loạn. Hôm sau chúng quay lại, xin sờ thử. Từ đó chúng thành bạn của bạn.'],
      old: ['Bạn ngồi bên lửa dạy lũ trẻ những bài hát chiến trận, giọng khàn mà vẫn vang. Không ai trong trại còn nhớ trọn những bài ấy. Bạn hát chậm, bắt chúng nhắc lại từng câu, như sợ mang chúng theo xuống đất.'] },
    beastfolk: { skill: 'Unarmed',
      young: ['Bạn chạy đua với lũ trẻ trong bầy tới tận bờ suối, băng qua cỏ cao, nhảy qua đá. Về tới nơi thì lưỡi thè dài, ngã lăn ra cát. Đứa thắng cũng thè lưỡi y như bạn.', 'Bạn tập rình chuột đồng cả buổi chiều, nằm im trong cỏ tới khi kiến bò đầy lưng. Con chuột thò đầu ra rồi thụt vào, ba lần. Lần thứ tư bạn vồ trượt, nhưng mẹ bảo thế là khá.', 'Mẹ dạy bạn đọc mùi: mùi người lạ, mùi máu cũ, mùi đất trước khi mưa. Hai mẹ con nằm sấp trên đồi, mũi chun lại, mẹ hỏi gì bạn đáp nấy. Có mùi bạn ngửi mãi mà mẹ bảo vẫn chưa phải.'],
      home: ['Bầy săn một mùa ở {z}. Bạn đánh hơi được dấu con mồi trước tất cả, dẫn cả bầy vòng qua hướng gió. Tới khi vây được con mồi, chẳng ai cần hỏi ai đi trước.', 'Bạn ngồi bắt ve cho mấy đứa nhỏ trong bầy cả buổi sáng, nắng ấm trên lưng. Chúng kể đủ chuyện ngớ ngẩn, chuyện con ếch biết nói, chuyện con quạ ăn trộm. Bạn ừ hữ, tay vẫn bắt.', 'Nước suối cạn, bầy dời hang sang sườn đồi khác. Dọc đường, bạn đánh dấu bằng vết cào trên đá cho những người đi sau. Mùa sau quay lại, dấu cào vẫn còn đó.', 'Đêm trăng tròn, bầy họp bên cột totem để phân xử một vụ tranh mồi. Hai bên gầm gừ, ai cũng có lý. Tới lượt bạn nói, mọi người im lặng nghe hết. Vụ tranh mồi khép lại trước khi trăng lặn.'],
      away: ['Ở {h} cái gì cũng có mùi khói và mùi người, đậm tới mức mũi bạn tê đi. Đêm nào bạn cũng ngủ mở cửa sổ cho đỡ ngộp. Gió lạnh lùa vào, mang theo một chút mùi cỏ từ ngoài thành.', 'Bạn mua thịt sống ở chợ, người bán hỏi có cần nấu giúp không. Bạn lắc đầu. Bà ta nhìn theo bạn mãi, tới khi bạn khuất sau góc phố.', 'Đêm trăng tròn ở {h}, bạn trèo lên ngồi trên mái nhà, ngửa mặt nhìn trăng. Cổ họng ngứa ran muốn hú. Bạn hú một tiếng thật khẽ. Không có ai hú cùng.'],
      old: ['Bạn nằm phơi nắng trước cửa hang cả ngày, mắt lim dim, đuôi thỉnh thoảng phẩy một cái. Lũ trẻ trong bầy lăn lộn trên chân bạn, giật cả tai bạn. Bạn gầm gừ cho có, rồi để yên.'] },
    fae: { skill: 'Arcane',
      young: ['Bạn đuổi theo đom đóm trong trảng tới nửa đêm, tay chụp hụt mãi. Mệt quá, bạn ngủ quên trên một tai nấm. Sáng ra tóc ướt đẫm sương, có con ốc sên bò ngang trán.', 'Bạn trêu một bà hái nấm loài người, giấu giỏ của bà lên ngọn cây rồi nấp xem bà tìm. Mẹ biết chuyện, bắt bạn mang trả, kèm một bó hoa xin lỗi. Bà hái nấm cầm bó hoa, mặt ngơ ngác, không biết ai tặng.', 'Bạn học tiếng chim sẻ, ngồi trên hàng rào nghe chúng líu lo cả tuần. Tới cuối tuần, bạn nói được ba câu. Câu nào cũng là câu chửi.'],
      home: ['Bạn giữ cho bụi hồng gai trước cổng trảng nở đúng ngày hội. Sáng nào cũng ra tưới sương, hát cho nụ nghe. Đúng đêm hội, cả bụi nở bung một lượt, thơm lừng cả lối vào.', 'Đình mở phiên xử hai Yêu Tinh tranh nhau một con suối. Bạn được giao ghi lời thề của cả hai bên, từng chữ một, không được sai. Phiên xử kéo dài ba đêm, con suối thì vẫn chảy như không có chuyện gì.', 'Bạn đổi một câu chuyện lấy một bình mật của ong rừng. Câu chuyện ấy là bịa từ đầu tới cuối. Ong không biết, mà bạn cũng không định kể.', 'Bạn dệt áo bằng tơ nhện và cánh bướm rụng cho đứa trẻ mới sinh trong trảng. Áo nhẹ tới mức gió thổi là bay. Mẹ đứa bé phải buộc một viên sỏi vào gấu áo.'],
      away: ['Ở {h} không ai để bát sữa trước cửa cho Yêu Tinh. Bạn tự rót sữa, tự đặt trước cửa, rồi tự ngồi xuống uống. Uống xong bạn thấy buồn cười, rồi lại thấy hơi buồn.', 'Bạn làm thuê trong vườn một nhà loài người. Hoa ở vườn ấy nở to gấp đôi, quả ngọt hơn hẳn nhà hàng xóm. Chủ nhà để ý cả, mà không hỏi vì sao.', 'Chuông đền ở {h} làm bạn nhức đầu mỗi sáng, như có ai gõ vào trong sọ. Bạn nhét rêu vào tai mà vẫn nghe. Tới giờ chuông, bạn ra bờ sông ngồi đợi cho qua.'],
      old: ['Bạn ngồi trên một tai nấm già, kể cho lũ trẻ nghe chuyện hội đình từ thời cây sồi cổng trảng còn là một hạt dẻ. Lũ trẻ nghe tới đâu mắt tròn tới đó. Có chuyện bạn kể khác lần trước. Không đứa nào dám cãi.'] },
    merfolk: { skill: 'Spear',
      young: ['Bạn thi nín thở với lũ trẻ trong đàn, đứa nào trồi lên trước thì thua. Bạn thắng. Bạn gian: bạn thở bằng mang.', 'Bạn nhặt vỏ ốc dưới đáy vịnh, chọn những cái có vân xoắn đẹp nhất. Xâu thành vòng, bạn đem tặng bà. Bà đeo nó suốt cả mùa, gặp ai cũng khoe.', 'Bạn bơi theo một đàn cá chuồn ra tận ngoài khơi, nước đổi từ xanh sang thẫm lúc nào không biết. Ngoảnh lại thì bờ đã xa tít. Mẹ phải bơi ra tìm về, mắng suốt đường.'],
      home: ['Bạn theo đàn ra rạn ngoài đánh cá một mùa, lặn từ sáng tới chiều. Lưới kéo lên đầy ắp, cá quẫy bạc trắng. Tối về cả đàn ngồi trên bãi đá hát, đuôi vỗ nước theo nhịp.', 'Sau bão, bạn sửa lại hàng rào đá quanh bãi nuôi trai, lặn xuống trồi lên cả trăm lần. Tay rớm máu vì vỏ hà. Tới chiều thì hàng rào đứng lại như cũ.', 'Bạn dẫn một con tàu buôn qua lạch đá ngầm, bơi trước mũi tàu chỉ đường. Thủy thủ đứng dọc mạn nhìn xuống, nửa sợ nửa phục. Công bạn nhận là muối và vải khô.', 'Mùa sao biển, bạn canh vườn san hô từ đầu tới cuối, gỡ từng con bằng tay. Gỡ xong con này lại thấy con khác. Cuối mùa vườn vẫn còn, và bạn ngủ ba ngày liền.'],
      away: ['Bạn gánh nước biển từ bến về để ngâm mình, hai thùng nặng trĩu vai. Người ở {h} hỏi sao không tắm nước giếng cho tiện. Bạn chỉ cười, không biết giải thích sao cho họ hiểu.', 'Chiều nào bạn cũng ra cầu cảng ngồi, chân thả xuống nước, nghe sóng vỗ vào cột gỗ. Ngồi cho tới khi trời tối hẳn. Có hôm người gác cảng phải ra nhắc bạn về.', 'Cá ở chợ {h} đã chết từ hôm qua, mắt đục, mang thâm. Bạn ngửi một cái là biết. Người bán thì cãi tới cùng, bảo cá mới vớt sáng nay.'],
      inland: ['Bạn tìm được một cái ao sâu sau làng, đêm nào cũng lén lặn xuống. Nước ao ngọt và nhạt, chẳng có vị gì. Bạn vẫn lặn, nằm dưới đáy nhìn trăng méo đi qua mặt nước.', 'Bạn đổi một tháng công lấy một hũ muối biển nhỏ xíu. Tối nào cũng rắc một nhúm vào chậu nước tắm, rồi ngồi ngâm, nhắm mắt. Mùi ấy không giống biển, nhưng cũng gần.'],
      old: ['Bạn nổi trên mặt nước cả ngày, mắt nhắm, để con nước lớn ròng đưa đi đưa lại. Một con mòng biển đậu lên ngực bạn, tưởng là khúc gỗ trôi. Bạn để yên cho nó đậu.'] },
    dragonkin: { skill: 'Fire',
      young: ['Bạn thi thổi lửa với lũ trẻ trong thị tộc: ai đốt được cọc gỗ xa nhất thì thắng. Bạn hít một hơi thật sâu, thổi. Cọc gỗ không cháy. Cái lều phía sau thì cháy.', 'Bạn leo lên đài lửa ngồi xem các bô lão đọc tên tổ tiên, đọc mãi không hết. Hơi đá ấm, giọng đọc đều đều. Tới cái tên thứ hai trăm thì bạn ngủ gật, gối đầu lên đuôi ông nội.', 'Bạn giấu một đồng vàng dưới tảng đá cạnh ổ, ngày nào cũng ra lật lên xem nó còn không. Nó vẫn còn. Bạn vẫn lật.'],
      home: ['Mùa này bạn giữ lửa trên đài cho thị tộc. Lửa không được tắt, kể cả khi mưa đá. Có đêm mưa đá to như trứng chim, bạn khom người che lấy ngọn lửa, vảy lưng rát buốt.', 'Bạn dắt đoàn lữ khách qua đèo đá nóng, nơi chỉ người có vảy mới đi chân trần được. Đá dưới chân bốc hơi, khách quấn giày ba lớp vẫn kêu. Tới đỉnh đèo, họ nhìn chân bạn mà lắc đầu.', 'Thị tộc cử bạn sang thị tộc bên kia núi mang quà kết thân: một quả trứng đá chạm khắc. Bạn ôm nó suốt ba ngày đường, ngủ cũng ôm. Trao xong, hai tay bạn vẫn còn giữ nguyên dáng ôm.', 'Bạn đánh bóng vảy, mài sừng, rồi đứng gác ở cổng thị tộc suốt mùa hội. Khách tới ai cũng phải ngước lên nhìn. Bạn đứng thẳng hơn mọi ngày.'],
      away: ['Ở {h} người ta nhìn sừng của bạn, rồi nhìn ra cửa, như đo xem bạn có lọt qua không. Bạn lọt. Chỉ phải nghiêng đầu một chút.', 'Bạn sưởi sát lò của quán trọ tới mức chủ quán sợ cháy vảy. Vảy không cháy. Cái ghế bạn ngồi thì cháy.', 'Trẻ con ở {h} chạy theo bạn, xin thổi lửa. Bạn thổi một hơi nhỏ, ngọn lửa xanh lét bằng ngón tay. Lũ trẻ reo ầm, rồi mẹ chúng chạy ra kéo về.'],
      old: ['Bạn ngồi trên đài lửa cả ngày, nhìn mây trôi qua đỉnh núi. Bạn đếm những thị tộc đã tắt lửa trong đời mình, đếm trên đầu ngón tay. Hai bàn tay không còn đủ.'] },
    construct: { skill: 'Construct',
      young: ['Bạn tập cầm một quả trứng mà không làm vỡ. Quả thứ nhất vỡ. Quả thứ năm cũng vỡ. Tới quả thứ mười hai thì được, và bạn đứng cầm nó tới tối.', 'Thợ đúc dạy bạn nhận mặt người. Một tuần, bạn nhớ được ba trăm khuôn mặt. Nhưng ai đang cười, ai đang nhăn, bạn vẫn chưa phân biệt được.', 'Bạn chạy thử quanh xưởng cả ngày, vòng này qua vòng khác. Thợ đúc ngồi trên thùng gỗ, ghi tiếng kêu của từng khớp vào sổ. Tối đến, người ấy đọc lại cho bạn nghe, như đọc một bài hát.'],
      home: ['Mùa này bạn làm ở dây chuyền đúc, ngày đêm không nghỉ. Cũng không ai bắt bạn nghỉ. Tới cuối mùa bạn mới nhận ra mình chưa nhìn lên trời lần nào.', 'Bạn ngồi cùng các Cơ Nhân khác so tiếng kêu của khớp, thay cho nhau những con ốc lệch. Không ai nói nhiều. Tiếng cờ lê lách cách nghe như một kiểu trò chuyện.', 'Hội đồng xưởng bàn có nên đúc thêm Cơ Nhân mới không. Bạn bỏ phiếu thuận. Rồi bạn thức cả đêm, nghĩ về lá phiếu của mình, về những đứa sẽ mở mắt lần đầu.', 'Bạn lau lại tượng người thợ đúc đầu tiên ở quảng trường, như mọi Cơ Nhân trong xưởng vẫn làm mỗi năm. Bạn lau kỹ từng nếp áo đồng. Mặt tượng mòn tới mức không còn rõ nét, mà ai nhìn cũng nhận ra.'],
      away: ['Ở {h}, trẻ con gõ vào vỏ bạn để nghe tiếng, cốc cốc như gõ nồi. Bạn đứng yên cho chúng gõ. Có đứa áp tai vào ngực bạn, bảo nghe thấy tiếng mưa.', 'Bạn làm thuê khuân vác ở {h}. Hết tháng, chủ trả nửa công: "Máy thì cần gì ăn." Bạn cầm tiền, đứng một lúc, rồi đi mua dầu.', 'Không ai ở {h} bán đúng loại dầu cho khớp của bạn. Bạn tự pha bằng mỡ cừu và nhựa thông, thử mãi mới được. Từ đó đi đâu bạn cũng thoang thoảng mùi rừng thông.'],
      old: ['Bạn đi chậm lại, mỗi bước kêu một tiếng tích tắc. Lũ trẻ trong xưởng gọi bạn là Ông Đồng Hồ, rồi chạy theo đếm bước. Bạn không sửa tên, để chúng đếm.'] }
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
  // v: biến thể (S.age % 2) để lễ lặp lại không đọc y nguyên; trang duyệt gọi f(h) ra biến thể đầu.
  const FEST = {
    human:     (h, v) => v ? `Hội làng ở ${h} mở vào ngày rằm, cờ ngũ sắc cắm dọc đường làng từ sáng sớm. Có kéo co, có đánh đu, có ông đồ ngồi viết câu đối đỏ ở góc chợ. Tối đến, đám hát dựng rạp giữa sân, người đứng chen tới tận bờ ao. Tiếng trống chầu thùng thùng tới quá nửa đêm.` : `Lễ hội mùa gặt ở ${h}, trống đánh từ lúc mặt trời còn trên ngọn tre. Mùi xôi mới và rượu nếp bay khắp các ngõ. Người ta nhảy quanh đống lửa tới khi chiếc đèn lồng cuối cùng tắt.`,
    elf:       (h, v) => v ? `Lại tới Đêm Lá Rụng ở ${h}. Năm nay đến lượt lũ trẻ treo đèn, đứa nào cũng leo lên tận cành cao nhất, đèn chao đảo trong gió. Khi bài hát tới tên những người mới đi về phía tây trong năm, cả tộc đứng dậy. Lá rơi xuống vai, không ai phủi.` : `Đêm Lá Rụng ở ${h}: cả tộc treo đèn lên tán Cây Mẹ, ánh sáng lọt qua kẽ lá rơi lốm đốm xuống rễ cây. Người ta hát tên những người đã đi xa, từng cái tên một, chậm và không sót ai. Tới khi hát xong thì lá cũng đã phủ dày dưới chân.`,
    dwarf:     (h, v) => v ? `Lại tới Ngày Mở Lò ở ${h}. Thợ cả gõ ba nhát búa vào đe chung, tiếng ngân chạy dọc các ngách hầm tới tận cửa núi. Từng nhà mang tới một xẻng than của mình đổ vào lò, rồi đứng xem lửa bén. Đêm ấy người ta thi vật tay trên mặt bàn đá, gãy mất hai cái ghế.` : `Ngày Mở Lò ở ${h}: cả hầm nhóm lại lò chung, hơi nóng phả ra tận cửa đại sảnh. Bánh nướng ngay trên mặt đe, thùng rượu đầu mùa được khui bằng một nhát búa. Tiếng hát trầm của cả trăm cái giọng dội đi dội lại trong lòng đá tới khuya.`,
    orc:       (h, v) => v ? `Lại tới Hội Lửa Sói ở ${h}. Lần này các bà đồng nhảy trước, mặt vẽ tro, chuỗi chuông xương leng keng ở cổ tay. Đám trai trẻ thi nhau nhảy qua đống lửa, đứa nào cháy lông mày thì cả trại cười nghiêng ngả. Tới khuya, ai nấy ngồi gặm xương, nghe người già kể lại những trận đánh cũ.` : `Hội Lửa Sói ở ${h}: cả trại nướng nguyên một con bò rừng, mỡ chảy xèo xèo xuống than. Trai tráng cởi trần đấu vật quanh đống lửa, ai ngã thì bị cả trại cười, ai thắng thì được miếng thịt to nhất. Tiếng trống da thú đánh tới khi lửa chỉ còn là than đỏ.`,
    beastfolk: (h, v) => v ? `Lại tới Đêm Trăng Tròn ở ${h}. Lũ trẻ trong bầy chạy đua quanh cột totem, đứa nào ngã thì lăn luôn một vòng cho đỡ quê. Người lớn ngồi chải lông cho nhau, kể chuyện những mùa săn cũ. Khi trăng lên đỉnh, tiếng hú lại nổi lên, lần này giọng lũ trẻ cao vót ở trên cùng.` : `Đêm Trăng Tròn ở ${h}: cả bầy họp quanh cột totem lớn, gió mang mùi cỏ dại và mùi lông ấm. Khi trăng lên tới đỉnh cột, con đầu đàn cất tiếng hú trước, rồi cả bầy hú theo. Tiếng hú kéo dài tới sáng, vọng sang tận mấy quả đồi bên kia.`,
    fae:       (h, v) => v ? `Lại tới hội đình mùa ở ${h}. Đêm nay đình thi kể chuyện bịa: ai kể mà cả đình tin là thật thì được một bình mật. Đom đóm bay thành vòng trên đầu người kể. Có chuyện hay tới mức cây sồi cổng trảng cũng nghiêng cành xuống nghe.` : `Hội đình mùa ở ${h}: hoa trong trảng nở theo nhịp trống, đóa này bung ra thì đóa kia khép lại. Phấn hoa bay lấp lánh như bụi vàng trong ánh trăng. Theo lệ cũ, không ai được về trước khi trăng lặn.`,
    merfolk:   (h, v) => v ? `Lại tới Lễ Triều Cường ở ${h}. Con nước năm nay lên cao, tràn qua cả bãi đá nơi người ta vẫn ngồi phơi lưới. Cả đàn bơi thành vòng tròn quanh rạn, đuôi vỗ nước theo nhịp, mặt biển sủi bọt trắng xóa. Tới khi nước bắt đầu ròng, tiếng hát mới thôi.` : `Lễ Triều Cường ở ${h}: cả đàn thả đèn xuống nước, từng ngọn đèn nhỏ dập dềnh trôi ra phía rạn. Người già cất giọng trước, những giọng trẻ nối theo, hát cho con nước lớn. Đêm ấy sóng vỗ vào bờ đá cũng như theo nhịp hát.`,
    dragonkin: (h, v) => v ? `Lại tới Đêm Đài Lửa ở ${h}. Lần này lũ trẻ được thổi lửa trước, ngọn nào cũng phụt lên rồi tắt ngấm, cả đài cười ầm. Rồi tới lượt người lớn, từng hơi lửa nối nhau cho tới khi đỉnh đài sáng như ban ngày. Đá dưới chân nóng tới mức không ai ngồi được, ai cũng đứng tới sáng.` : `Đêm Đài Lửa ở ${h}: các thị tộc thắp lửa trên đỉnh đài, ngọn lửa cao tới mức soi đỏ cả sườn núi. Các bô lão đọc tên tổ tiên từ thời còn có cánh, mỗi cái tên kèm một hơi lửa phả lên trời. Mùi đá nóng còn vương tới sáng hôm sau.`,
    construct: (h, v) => v ? `Lại tới Ngày Lò Đúc Mẹ ở ${h}. Cả xưởng xếp hàng trước khuôn đúc đầu tiên, mỗi người đặt tay lên thành khuôn, đứng nghe một lúc rồi nhường chỗ. Không ai nói, chỉ có tiếng bánh răng quay khe khẽ. Tối đến, người ta thắp đèn dầu dọc dây chuyền, để nó cháy tới sáng.` : `Ngày Lò Đúc Mẹ ở ${h}: cả xưởng gõ búa cùng một nhịp, tiếng kim loại ngân dài dưới mái tôn. Giữa hai hồi búa, người ta đọc số hiệu những người đã ngừng quay. Không ai tra dầu cho mình hôm ấy, để tiếng khớp kêu thay lời nhớ.`,
    skeleton:  (h, v) => v ? `Lại tới Lễ Lăng Chính ở ${h}. Đoàn rước năm nay dài hơn, có cả những bộ xương mới trỗi dậy, bước còn lóng ngóng. Người ta khiêng hũ tro tổ đi qua từng ngõ, dừng lại trước mỗi cửa một nhịp. Gió lùa qua những hốc mắt, nghe như tiếng sáo không người thổi.` : `Lễ Lăng Chính ở ${h}: dân Bộ Xương rước tro tổ ra phố, bước chân lạch cạch đều đặn trên đá lát. Hốc mắt ai cũng thắp một ngọn đèn xanh, cả con phố sáng lên một màu lạnh lẽo. Không có tiếng nhạc nào, chỉ có tiếng xương chạm nhau.`
  };
  const FIRST = {
    elf: ['"lá"', '"sao"', 'một câu hát ru, đủ cả lời', '"mẹ"'], dwarf: ['"đá"', '"lửa"', '"búa"', '"của tôi"'], orc: ['"thịt"', '"đánh"', '"không"', '"mẹ"'],
    beastfolk: ['một tiếng gầm gừ rất khẽ', '"chạy"', '"trăng"', '"mẹ"'], fae: ['một từ trong tiếng hoa', '"bay"', '"không"', 'tên một con bướm'],
    merfolk: ['"nước"', '"cá"', 'một nốt hát dài', '"mẹ"'], dragonkin: ['"lửa"', '"vàng"', '"của tôi"', '"ông"']
  };
  const LETTERS = {
    elf: 'Bà cố dạy bạn đọc vân trên lá: mỗi đường gân là một chữ của tiếng cổ. Bà đưa lá lên trước nắng, bắt bạn lần theo từng đường bằng đầu ngón tay. Có những chiếc lá phải đọc ba mùa mới hết. Chiếc lá đầu tiên bạn đọc trọn, bạn ép vào giữa hai phiến gỗ, giữ mãi.',
    dwarf: 'Ông nội dạy bạn đọc rune trên vách đại sảnh, từng dòng từ đời tổ. Ông cầm đèn soi lên đá, bắt bạn đọc to cho tới khi tiếng vọng trong hầm trả lại đúng từng chữ. Dòng cuối cùng trên vách còn bỏ trống. Ông bảo chỗ ấy để dành cho một người trong nhà mình.',
    orc: 'Bà đồng của trại dạy bạn vạch dấu tộc lên da thuộc: dấu đi săn, dấu có thù, dấu có nước. Tay bạn vụng, vạch sai một nét là bà gõ cán xương lên đốt ngón tay. Mùi da thuộc và than vẽ ám vào tóc bạn mấy tuần liền. Dấu đầu tiên bạn vạch cho đúng là dấu có thù.',
    beastfolk: 'Người già trong bầy dạy bạn đọc dấu móng, dấu cào trên vỏ cây; mỗi dấu là một lời nhắn. Hai người đi khắp bìa rừng, mũi dí sát vào thân cây, đọc xem ai đã qua đây, đi về đâu, có đói không. Tới cuối mùa bạn đã đọc được dấu của cả bầy. Lần đầu tiên bạn tự để lại một dấu cào của mình, tay còn run.',
    fae: 'Một Yêu Tinh già dạy bạn viết bằng sương đọng trên mạng nhện. Chữ tan khi trời nắng, nên phải nhớ. Sáng nào bạn cũng dậy trước bình minh, ngồi đọc cho kịp trước khi tia nắng đầu tiên chạm tới. Có những chữ bạn chỉ kịp đọc một lần, rồi nhớ suốt đời.',
    merfolk: 'Bà dạy bạn đọc chữ khắc trên vỏ ốc xà cừ, xoay vỏ ốc trong tay mà đọc. Chữ chạy vòng theo đường xoắn, càng vào sâu càng nhỏ, tới tận lõi ốc. Bạn đọc tới hoa cả mắt, áp vỏ ốc lên tai thì lại nghe tiếng biển. Bà bảo chữ và tiếng biển vốn là một.',
    dragonkin: 'Ông nội dạy bạn đọc chữ cháy trên vách đá, viết bằng lửa từ trong cổ họng. Mỗi lần ông thở ra một chữ mới, vách đá đen thêm một vệt, mùi khét xộc lên mũi. Bạn đọc theo, cổ họng ngứa ran, chỉ mong tới ngày tự viết được. Ông bảo chữ viết bằng lửa thì trăm năm không phai.',
    construct: 'Thợ đúc nạp bảng chữ cái vào lõi bạn trong một đêm. Sáng ra bạn đọc được, nhưng chưa hiểu. Bạn đọc hết những tấm biển trong xưởng, đọc cả số hiệu khắc trên vỏ mình. Còn nghĩa của chúng, bạn phải tự đi tìm từng chữ một.'
  };
  // ACHES, HUNGER: [biến thể 0, biến thể 1] theo S.age % 2. HARVEST: [được, mất] rồi [được, mất] của biến thể 1.
  const ACHES = {
    elf: ['Lần đầu sau mấy trăm năm, tay bạn run khi giương cung, mũi tên lệch hẳn khỏi đích. Tóc bạn không bạc, da không nhăn, nhưng mắt đã mờ. Bạn hạ cung xuống, nhìn những chiếc lá rơi mà không còn đếm kịp.', 'Bạn ngồi thiền mà ký ức cứ trượt khỏi tay, như cá trong nước. Có những gương mặt phải cố mãi bạn mới nhớ ra tên. Tiên Tộc không già như loài người, nhưng cũng biết mỏi. Bạn ngồi lâu hơn, và đứng dậy chậm hơn.'],
    dwarf: ['Đầu gối bạn kêu như bản lề cửa hầm, mỗi bậc thang đá là một lần nghiến răng. Bạn vẫn xuống mỏ, chỉ là chậm hơn. Lũ thợ trẻ đi trước, ngoái lại chờ. Bạn xua tay bảo cứ đi, rồi đứng lại thở.', 'Tay bạn không còn giữ búa được lâu như trước, đập một hồi là các ngón cứng lại. Bạn ngồi xoa tay bên lò, nghe tiếng búa của người khác vọng trong hầm. Tiếng búa của bạn ngày xưa to hơn thế. Bạn tự nhủ vậy, mà cũng không chắc.'],
    orc: ['Mấy vết sẹo cũ nhức mỗi khi trời trở, vết nào cũng nhắc lại một trận đánh. Bạn không còn vật thắng nổi đứa trẻ nào trong trại. Chúng thắng xong thì nhìn bạn ngượng nghịu, như vừa làm vỡ thứ gì. Bạn cười, phủi đất đứng dậy.', 'Lưng bạn còng xuống, vác rìu đi một đoạn đã phải dừng. Lũ trẻ tranh nhau vác hộ. Bạn mắng chúng, rồi để chúng vác. Ở tộc Orc, sống tới lúc phải nhờ người khác vác rìu là chuyện hiếm.'],
    beastfolk: ['Lông bạn bạc từng mảng, mũi không còn đánh hơi được xa như trước. Có lần mưa đổ xuống tận đầu mà bạn chẳng ngửi thấy gì. Giờ lũ trẻ trong bầy đi trước dẫn đường. Bạn đi sau, theo mùi của chúng.', 'Chân sau của bạn cứng dần, chạy một quãng là đau buốt. Đêm trăng tròn, bạn vẫn hú cùng bầy, nhưng ngồi chứ không đứng. Giọng bạn khàn đi nhiều. Cả bầy vẫn chờ bạn cất tiếng trước.'],
    fae: ['Cánh bạn bạc màu như lá cuối thu, mỏng tới mức soi thấy nắng. Vỗ mấy lần mới nâng nổi mình lên quá đầu gối người. Lũ Yêu Tinh nhỏ bay vòng quanh chờ bạn. Bạn thôi bay, đi bộ trên rễ cây cho đỡ mỏi.', 'Phép của bạn chậm lại, ảo dung giữ được một lúc là tuột. Có hôm đang trò chuyện với một người loài người thì bạn hiện nguyên hình, làm họ hét lên bỏ chạy. Bạn ngồi cười một mình. Rồi thấy mệt.'],
    merfolk: ['Vảy bạn bong từng mảng, lặn sâu một chút là tai ù, ngực tức. Bạn bơi chậm lại, để lũ trẻ trong đàn vượt lên trước. Có lúc bạn chỉ nổi trên mặt nước, nhìn chúng lặn xuống. Biển vẫn thế, chỉ bạn là đã khác.', 'Mang của bạn khép mở khó nhọc, ở dưới nước lâu là thấy hụt hơi. Bạn ngồi trên bãi đá nhiều hơn, chân ngâm trong nước. Lũ trẻ mang tới cho bạn những con cá nhỏ, như bạn từng mang cho bà. Bạn ăn chậm, mắt nhìn ra khơi.'],
    dragonkin: ['Lửa trong bụng bạn nguội dần. Mùa đông năm nay bạn không thở nổi một ngọn lửa để nhóm bếp, phải nhờ một đứa trẻ trong thị tộc thổi hộ. Nó thổi xong, quay sang nhìn bạn, không nói gì. Bạn ngồi sát bếp hơn mọi năm.', 'Vảy bạn xỉn màu như đồng lâu năm không đánh. Trên sừng có thêm một vết nứt mới. Trời trở lạnh một chút là các khớp cứng lại như đá. Bạn ngồi phơi nắng cả ngày trên đài lửa, như một con thằn lằn già.']
  };
  const HUNGER = {
    elf: ['Năm ấy cây rừng không ra quả. Cả tộc ăn rễ cây và vỏ thông cho tới mùa xuân, đắng chát tới tê lưỡi. Người lớn vẫn hát mỗi tối, chỉ là hát khẽ hơn, như sợ làm rừng mệt thêm.', 'Mùa đông ấy dài hơn mọi năm, tuyết phủ kín cả những bụi quả cuối cùng. Cả tộc chia nhau từng nắm hạt dẻ dự trữ, đếm từng hạt. Thợ săn đi cả tuần mới về, tay không. Đêm nào bạn cũng đi ngủ với cái bụng réo, nghe gió lùa qua tán cây trụi lá.'],
    dwarf: ['Ruộng nấm dưới hầm thối hết vì ẩm, mùi chua bốc lên tận đại sảnh. Cả nhà ăn bánh rêu khô cho tới mùa sau, nhai mỏi cả hàm. Lò chung vẫn đỏ lửa, nhưng chẳng còn ai ngồi quanh nó kể chuyện.', 'Đoàn xe đổi lương thực không về kịp, tuyết đã chặn đèo. Trong hầm, kho lúa mạch vơi dần tới đáy. Người ta chia khẩu phần bằng cân, ai cũng gầy rộc, râu xơ xác. Chỉ có tiếng búa là không lúc nào ngớt, vì có việc làm thì đỡ nghĩ tới cái đói.'],
    orc: ['Đàn thú không về. Cả trại đành giết ngựa già để ăn qua đông. Con ngựa ấy từng chở bạn đi khắp bãi săn, nên bữa đó bạn ăn mà không nhìn vào bát.', 'Mùa săn trắng tay, cả trại uống sữa ngựa pha nước, loãng như nước vo gạo. Lũ trẻ khóc đòi thịt, người lớn quát cho nín rồi bỏ ra ngoài ngồi. Bạn đi săn một mình ba ngày, về với hai con chuột đồng. Cả lều vẫn ăn, chia nhau từng miếng.'],
    beastfolk: ['Mùa săn trắng tay. Cả bầy chia nhau từng miếng xương, gặm tới khi chỉ còn lại mùi. Đêm nào bạn cũng nằm sát vào người bên cạnh cho đỡ đói, đỡ lạnh.', 'Đàn thú bỏ vùng đi hết, rừng im như chết. Bầy đào rễ, ăn vỏ cây, có đêm gặm cả da thuộc cũ. Bạn đi săn từ sáng tới tối, mũi đánh hơi mãi chỉ thấy mùi đói của chính mình. Lũ trẻ nằm im trong hang, không còn sức mà chơi.'],
    fae: ['Mùa không có hoa. Mật cạn, cả đình ăn sương cho tới khi xuân về. Cánh ai cũng mỏng đi trông thấy, bay một quãng ngắn đã phải đậu xuống nghỉ.', 'Mùa ấy ong rừng bỏ đi, hoa nở mà không kết trái. Cả đình ăn sương và nhựa cây, uống ánh trăng cho đỡ lạnh bụng. Phép của ai cũng yếu hẳn, ảo dung giữ không nổi một buổi. Bạn ngồi trên tai nấm khô, nhìn trảng xám đi từng ngày.'],
    merfolk: ['Biển cạn cá, rạn san hô bạc trắng như xương. Cả đàn ăn rong cho tới mùa nước ấm, rong mặn chát, nhai mãi không trôi. Lũ trẻ thôi đùa ở rạn, ngồi im nhìn ra khơi.', 'Một dòng nước lạnh từ phương bắc tràn vào vịnh, đàn cá bỏ đi hết. Cả đàn lặn sâu hơn, bơi xa hơn, về vẫn tay không. Bạn ăn rong và ốc vụn suốt một mùa. Có hôm nổi lên mặt nước, bạn thấy thuyền người trên bờ cũng nằm im.'],
    dragonkin: ['Dê núi bỏ đi hết. Thị tộc nấu súp xương rồng đá cho tới mùa sau, nồi súp sôi sùng sục suốt ngày mà nhạt như nước lã. Đài lửa đêm ấy cháy thấp hẳn đi.', 'Năm ấy núi phun tro, cỏ chết, ruộng bậc thang vùi dưới lớp tro xám. Thị tộc chia nhau những bao hạt cuối cùng, nấu cháo loãng trên đá nóng. Đài lửa vẫn được giữ, nhưng chỉ còn một ngọn nhỏ. Bạn ngồi canh nó, bụng rỗng, mắt cay vì tro.']
  };
  const HARVEST = {
    elf: ['Vườn quả trong rừng năm ấy sai trĩu, cành nào cũng phải chống nạng. Bạn đổi thêm được', 'Sâu kéo về từng đàn, ăn trụi vườn quả trong rừng chỉ trong mười ngày. Bạn lỗ', 'Mùa quả chín sớm, cả tộc hái không kịp, chim rừng ăn cũng không hết. Bạn đổi thêm được', 'Một trận mưa đá giữa mùa quả, vườn rụng trắng gốc. Bạn lỗ'],
    dwarf: ['Ruộng nấm dưới hầm mọc dày như thảm, mùi đất ẩm thơm cả ngách. Bạn bán thêm được', 'Nấm mốc trắng lan khắp ruộng nấm dưới hầm, hái lên là nát. Bạn lỗ', 'Có mạch nước ấm chảy qua hầm, ruộng nấm năm nay mũ to bằng bàn tay. Bạn bán thêm được', 'Gió lùa vào ngách, hầm khô, ruộng nấm còi cọc cả mùa. Bạn lỗ'],
    fae: ['Hoa nở kín trảng, ong rừng bay về ù ù, mật đầy tới miệng bình. Bạn đổi thêm được', 'Sương muối đến sớm, chỉ một đêm mà hoa rụng sạch. Bạn lỗ', 'Bướm về đông chưa từng thấy, hoa trái trong trảng kết dày. Bạn đổi thêm được', 'Một đàn sâu đêm ăn hết nụ hoa, trảng trơ cành cả mùa. Bạn lỗ'],
    merfolk: ['Vườn tảo và bãi nuôi trai được mùa, lặn xuống lần nào cũng đầy giỏ. Bạn bán thêm được', 'Nước đỏ tràn qua bãi nuôi trai, trai há miệng chết hàng loạt. Bạn lỗ', 'Con nước ấm về sớm, tảo mọc dày như rừng dưới vịnh. Bạn bán thêm được', 'Bão cuốn phăng hàng rào đá, nửa bãi trai trôi ra khơi. Bạn lỗ'],
    dragonkin: ['Ruộng bậc thang bên sườn núi lửa được mùa, đất tro nóng làm hạt nào cũng chắc. Bạn bán thêm được', 'Tro núi rơi phủ kín ruộng bậc thang, lúa ngạt chết từng khoảnh. Bạn lỗ', 'Núi ngủ yên cả năm, ruộng bậc thang xanh tới tận miệng núi. Bạn bán thêm được', 'Suối nóng đổi dòng, nước sôi tràn qua ba bậc ruộng. Bạn lỗ'],
    construct: ['Cỗ máy cày bạn tự lắp chạy suốt mùa không lỏng một con ốc. Bạn bán thêm được', 'Máy cày gãy trục giữa mùa, ruộng bỏ dở một nửa. Bạn lỗ', 'Bạn thay bộ lưỡi cày mới, cày một ngày bằng người ta cày ba. Bạn bán thêm được', 'Trời ẩm cả mùa, khớp máy cày gỉ kẹt, sáng nào cũng phải tháo ra lau. Bạn lỗ'],
    orc: ['Đàn bò rừng sinh sôi, bê con chạy kín bãi cỏ. Bạn bán thêm được', 'Dịch bò tràn qua trại, sáng nào cũng có con nằm xuống không dậy nữa. Bạn lỗ', 'Mưa xuống đúng lúc, cỏ ngập tới bụng ngựa, đàn bò béo tròn. Bạn bán thêm được', 'Một đêm bão bụi, nửa đàn bò chạy tán loạn vào hoang mạc. Bạn lỗ'],
    beastfolk: ['Đàn dê trên đồi đẻ sai, con nào cũng khỏe. Bạn bán thêm được', 'Sói lạ về ăn mất nửa đàn, sáng ra chỉ còn vết máu trên cỏ. Bạn lỗ', 'Cỏ đồi năm nay non và ngọt, dê cho sữa đầy xô. Bạn bán thêm được', 'Một mùa rét đậm, dê con chết cóng trong chuồng. Bạn lỗ']
  };
  const OLDFRIEND_LONG = 'Bạn tìm về căn nhà của người bạn loài người chơi cùng hồi nhỏ. Người ra mở cửa là chắt của họ, tóc đã điểm bạc. Cụ đã mất từ lâu, nằm sau vườn, cỏ mọc kín mộ. Cả nhà mời bạn ở lại ăn cơm, ngồi nghe bạn kể về ông cụ hồi còn để chỏm. Có những chuyện chính họ cũng chưa nghe bao giờ.';
  const OLDFRIEND_LONG_B = 'Đi ngang con phố cũ, bạn nhận ra ô cửa sổ nơi người bạn loài người năm xưa hay ngồi gọi bạn ra chơi. Giờ trong nhà là một gia đình lạ, chẳng ai biết cái tên bạn hỏi. Phải tới bà cụ hàng xóm mới nhớ ra: người ấy mất từ hồi bà còn con gái. Bà mời bạn vào uống chén trà, kể những chuyện về người ấy mà bạn chưa biết. Bạn ngồi tới tối mới về.';
  // pal: tên người quen mà story.js vừa chèn vào sự kiện gốc (đọc từ nhãn X._tag), để bản đổi giọng không làm mất người ấy.
  G.RACE_VOICE = {
    ch_festival: (S, X, r0, dg, pal) => {
      const h = homeName(S, X), me = S.race, v = S.age % 2, with_ = pal ? ` ${pal} cũng có mặt, len qua đám đông tìm tới chỗ bạn. Hai người đứng cạnh nhau tới khi hội tan.` : '';
      if (G.amongKin(S) || me === 'human' && !G.hostRace(S)) return me === 'human' ? null : FEST[me](h, v) + with_;
      const r = G.hostRace(S); if (!r || r === me || !FEST[r]) return null;
      return `${FEST[r](h, v)} ${v ? 'Bạn đứng xem từ xa, nhìn người ta cười nói theo một tục lệ mình không thuộc. Ai mời gì bạn cũng nhận, làm theo người bên cạnh cho khỏi lạc. Lúc về, bạn chợt nhớ lễ của tộc mình, nhớ tới mức bước chân chậm hẳn lại.' : `Bạn đứng ở rìa đám đông, hai tay không biết để đâu: đây là lễ của ${raceVi(r)}, không phải của tộc bạn. Vậy mà vẫn có người quay lại, nắm tay bạn kéo vào cùng.`}${with_}`;
    },
    ad_harvest: (S, X, r, dg) => { const V = HARVEST[S.race]; if (!V || !G.raceHome(S) && S.race !== 'construct') return null; const i = S.age % 2 && V.length > 2 ? 2 : 0; return dg >= 0 ? `${V[i]} ${G.coin(dg)}.` : `${V[i + 1]} ${G.coin(-dg)}.`; },
    inf_word: S => FIRST[S.race] ? `Một buổi tối, bạn bỗng cất tiếng, rõ ràng như đã nhẩm sẵn từ lâu. Từ đầu tiên bạn nói là ${FIRST[S.race][Math.floor(S.birthYear * 7 + S.age) % FIRST[S.race].length]}. Cả nhà sững lại một nhịp rồi cùng cười ồ. Suốt mấy hôm sau bạn nhắc đi nhắc lại, ai nghe cũng phải đáp lại một câu.` : null,
    ch_letters: S => LETTERS[S.race] || null,
    el_aches: (S, X, r, dg, pal) => ACHES[S.race] ? ACHES[S.race][S.age % 2] + (pal ? ` ${pal} ghé thăm, ngồi với bạn tới khi trời sập tối. Hai người kể lại chuyện ngày xưa, có chuyện bạn tưởng mình đã quên từ lâu.` : '') : null,
    ch_hunger: (S, X, r, dg, pal) => HUNGER[S.race] ? HUNGER[S.race][S.age % 2] + (pal ? ` Một tối, ${pal} sang gõ cửa, để lại một ít đồ ăn rồi đi ngay, không đợi ai kịp cảm ơn.` : '') : null,
    inf_fever: S => S.race === 'dragonkin' ? 'Ba ngày liền người bạn nóng như than hồng, nóng tới mức Long Nhân chạm vào cũng phải rụt tay. Mẹ ôm bạn ngồi dưới suối lạnh từ chiều tới sáng, nước quanh hai mẹ con bốc hơi nghi ngút. Môi mẹ tím tái mà tay vẫn không buông. Tới đêm thứ ba bạn mới chịu ngủ yên.' : S.race === 'merfolk' ? 'Ba ngày liền bạn sốt, vảy khô lại và bạc đi như vỏ ốc phơi nắng. Mẹ bế bạn ra bãi đá, ngâm bạn trong nước biển suốt đêm, miệng hát khe khẽ cho bạn khỏi quấy. Sáng ra vảy bạn đã ướt lại. Tóc mẹ thì khô cứng vì muối, đôi mắt đỏ hoe.' : null,
    // Có người bạn trong dàn (story.js đã viết lại câu bằng người ấy) thì giữ câu đó, không kể người bạn đã mất.
    ad_old_friend: (S, X, r, dg, pal) => !pal && ['elf', 'dwarf', 'dragonkin', 'fae', 'merfolk'].includes(S.race) && S.age * G.RACES[S.race].ypt > 90 && !G.amongKin(S) ? (S.age % 2 ? OLDFRIEND_LONG_B : OLDFRIEND_LONG) : null
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
  const PAL_TAG = 'Người quen · ';   // nhãn story.js đặt khi chèn người quen (lk, ad_old_friend)
  for (const [id, fn] of Object.entries(G.RACE_VOICE)) {
    const e = G.EVENTS.find(x => x.id === id); if (!e) continue;
    const r0 = e.run;
    e.run = function (S, X) {
      const g0 = S.gold, tg0 = X._tag, r = r0.call(this, S, X);
      if (!r || S.dead || S.undead) return r;
      const tg = X._tag, pal = tg !== tg0 && typeof tg === 'string' && tg.startsWith(PAL_TAG) ? tg.slice(PAL_TAG.length) : null;
      const t = fn(S, X, r, S.gold - g0, pal);
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
  G.RACE_VOICE_TEXT = { FEST: Object.fromEntries(Object.entries(FEST).map(([r, f]) => [r, [f('‹nơi ở›', 0), f('‹nơi ở›', 1)]])), FIRST, LETTERS, ACHES, HUNGER, HARVEST, OLDFRIEND_LONG: OLDFRIEND_LONG + ' / ' + OLDFRIEND_LONG_B };
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
