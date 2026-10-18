/* Vạn Kiếp — VĂN HÓA TỘC, TÍN NGƯỠNG GỐC (docs/15; người dùng yêu cầu 17/10/2026).
 * Người dùng: "người lùn có tín ngưỡng là ánh sáng, cái này không đúng lắm; người lùn đào hầm, rèn đúc; orc hoang dã, sống bầy đàn,
 * bộ lạc, thị tộc. Mỗi tộc có tín ngưỡng khác nhau. Chơi người lùn chưa thấy sự kiện mang nét văn hóa người lùn."
 * Ba lớp, nạp sau racev.js:
 *   1. Sự kiện, quyết định văn hóa của tộc (thêm vào G.RACE_EV, trang duyệt hiện ở tab Sự kiện giống loài): Người Lùn chọn việc cho
 *      thị tộc (lò, mỏ, rune, cổng), mạch quặng, sập hầm, thử tay nghề Thợ Cả, chiếm lại thành cổ; Orc nuôi sói từ nhỏ, thử thách
 *      bảy ngày, săn lớn, thách tù trưởng, đi cướp, treo xương người thân lên cột cờ, bà đồng chọn người học việc; vài nút cho tộc khác.
 *   2. Sự kiện của mười tín ngưỡng gốc (G.FAITH_EV, mỗi tộc một đạo, shared/faiths.js trường folk): gắn với đạo đang theo, không gắn
 *      với tộc (người cải đạo cũng gặp).
 *   3. Giọng theo giống loài cho thêm chín sự kiện chung hay gặp (con cái, ẩu đả, người để ý, thừa kế, nhặt tiền, cờ bạc, thuế,
 *      ban phước lúc sơ sinh, lễ quốc giáo).
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
  const first = n => String(n).split(' ')[0];
  const kin = S => G.amongKin(S), stranger = S => !G.amongKin(S);
  const odds = (S, X, base = .4) => G.clamp(base + (X.power(S) - 1.2) * .25, .1, .9);
  const seaSide = S => { const s = G.here(S).s; return !!X0(S).coastal || !!(s && (s.seaCells || (s.roles || []).some(r => r === 'port' || r === 'fishing'))); };
  const parentDead = S => S.family.parents.find(p => !p.alive);
  const dev = (S, v) => { if (S.faith) S.devotion = G.clamp((S.devotion || 0) + v, 0, 100); };
  const AD = ['adult', 'elder'];
  const MOUNT = ['crystal_cave', 'ash_peak', 'frost_tundra', 'storm_spire'];
  const dwfMount = S => MOUNT.includes(bio(S));
  // Khu của Người Lùn luôn đục vào đồi, núi (G.RACE_SETTLE.dwarf), kể cả khi biome của vùng không phải núi.
  const dwfHold = S => { const s = G.here(S).s; return !!s && s.race === 'dwarf'; };
  const underground = S => S.work === 'miner' || S.flags.dwfTrade === 'mine' || dwfHold(S) || (G.raceHome(S) && dwfMount(S));

  // Nút của tộc: như add() của racev.js (nhãn race, thân thể bằng thịt trừ Cơ Nhân); ghi vào G.RACE_EV cho trang duyệt.
  const EV = [], OWN = new Set(), decs = {};
  const add = (race, list) => { for (const e of list) { e.tree = Object.assign({ race: [race] }, race === 'construct' ? {} : { body: 'flesh' }, e.tree || {}); e.race = race; EV.push(e); OWN.add(e.id); (G.RACE_EV[race] = G.RACE_EV[race] || []).push(e.id); } };
  const dec = (race, id, D) => { D.tree = Object.assign({ race: [race] }, race === 'construct' ? {} : { body: 'flesh' }, D.tree || {}); D.race = race; DEC[id] = D; decs[id] = race; (G.RACE_EV[race] = G.RACE_EV[race] || []).push(id); };

  // ═════════ 1. Văn hóa tộc ═════════

  // ─────────── Người Lùn: hầm, lò, thị tộc ───────────
  // Nguồn: Dwarf Fortress (quen hầm: ra nắng thì chóng mặt; đào trúng hang quái), Warhammer (thành cổ bị bỏ, đoàn đi chiếm lại;
  // thợ cả của phường; búa đổi chủ thì đổi tên), Tolkien (Moria, Erebor: thành dưới núi, vàng gọi người).
  const TRADE_VI = { forge: 'vào lò', mine: 'xuống mỏ', rune: 'khắc rune', gate: 'đứng cổng' };
  add('dwarf', [
    { id: 'dwf_pick', st: ['child'], w: 3, run(S, X) { X.gain('Engineering', 2); X.gain('Body', 2); X.add('so', 2);
        return { t: 'Ông nội trao cho bạn một cây cuốc chim nhỏ, cán gỗ bóng lên vì tay ba đời người cầm. Ông ngồi xổm xuống cho ngang tầm mắt bạn, gõ khẽ cán cuốc vào vách hầm. "Đá kêu trước khi sập. Học nghe nó." Đêm ấy bạn ôm cây cuốc đi ngủ, tai áp vào vách, cố nghe xem đá đang nói gì.', k: 'good' }; } },
    { id: 'dwf_sun', st: ['teen'], c: S => dwfHold(S) || G.raceHome(S) || dwfMount(S), w: 2.5, run(S, X) { X.add('h', -2); X.add('sm', 2);
        return { t: 'Lần đầu bạn theo đoàn xe lên mặt đất. Cửa hầm vừa mở, ánh sáng đổ vào trắng xóa, bạn nhắm tịt mắt mà vẫn thấy chói. Bạn nôn hai lần bên vệ đường, rồi ngồi thu mình trong bóng xe suốt buổi. Người lớn đi ngang xoa đầu bạn mà cười: lần đầu ai cũng thế. Chiều về tới cửa hầm, bạn hít một hơi thật sâu, chưa bao giờ thấy mùi đá mát thơm đến vậy.', k: 'info', f: 'Người Lùn sống dưới hầm lâu thì ra nắng chóng mặt; chịu qua một lần là quen.' }; } },
    { id: 'dwf_trade_call', st: ['teen'], c: S => !S.flags.dwfTrade && !S.flags.dwfTradeQ, w: S => kin(S) || G.raceHome(S) ? 5 : 2, run(S, X) {
        S.flags.dwfTradeQ = true;
        return { t: kin(S) ? 'Hội đồng thị tộc gọi những đứa sắp lớn tới đại sảnh. Lửa lò chung hắt đỏ lên vách đá khắc kín tên tổ tiên, bọn trẻ đứng thành hàng, đứa nào cũng nín thở. Theo lệ, mỗi đứa phải chọn một việc làm cho tộc trước khi được tết bím râu thứ hai. Bạn ngước lên vách, tìm tên ông nội giữa hàng trăm cái tên.' : 'Thư của thị tộc từ dưới núi lặn lội tới tay bạn, giấy dày, dấu sáp in hình búa. Lời trong thư ngắn và cứng như đá: theo lệ, bạn phải chọn một việc làm cho tộc, dù đang sống xa hầm. Bạn đọc đi đọc lại dòng cuối, chỗ người viết ký cả tên họ lẫn tên lò.', k: 'info' }; } },
    { id: 'dwf_forge_first', st: ['teen', 'adult'], w: 4, tree: { from: ['dwf_trade:forge'], wait: [1, 4], dir: { nghe: 1 } }, run(S, X) {
        X.gain('Engineering', 3); if (S.gear < 10) S.gear++;
        return { t: `Thầy rèn bắt bạn tự tay làm một lưỡi rìu, từ cục quặng thô tới lúc mài bén. Ba tuần liền bạn ăn ngủ cạnh lò, tóc mái cháy xém, hai bàn tay phồng rộp. Lưỡi rìu ra lò hơi cong. Thầy cầm lên ngắm rất lâu, rồi vẫn khắc tên bạn lên cán. Trang bị ${S.gear}/10.`, k: 'good' }; } },
    { id: 'dwf_rune_first', st: ['teen', 'adult'], w: 4, tree: { from: ['dwf_trade:rune'], wait: [1, 4], dir: { nghe: 1, tri: 1 } }, run(S, X) {
        X.gain('Spirit', 3); X.add('sm', 3);
        return { t: 'Rune đầu tiên bạn khắc là rune Giữ, lên cái then cửa kho. Ba ngày sau cánh cửa không chịu mở nữa, ai đẩy cũng không được, kể cả thầy. Cả xưởng kéo nhau ra xem thầy loay hoay với cái then. Rồi ông ngồi bệt xuống đất, cười chảy nước mắt, gọi bạn lại chỉ cách gỡ. "Mày khắc chắc tay quá," ông nói, "đá nó nhớ hơi lâu."', k: 'good' }; } },
    { id: 'dwf_gate_first', st: ['teen', 'adult'], w: 4, tree: { from: ['dwf_trade:gate'], wait: [1, 4], dir: { vo: 1 } }, run(S, X) {
        X.gain('Shield', 3); X.add('so', 3);
        return { t: 'Đêm đầu đứng cổng, có thứ gì đó cào vào cánh cửa đá từ phía ngoài. Tiếng móng kéo dài, dừng, rồi lại kéo, cứ thế tới gần sáng. Bạn đứng nguyên chỗ, tay siết cán rìu tới tê dại, không lùi một bước. Sáng ra người đổi gác nhìn những vết cào trên đá, rồi vỗ vai bạn mà không nói gì.', k: 'good' }; } },
    { id: 'dwf_vein', st: AD, rep: true, gap: 4, c: S => underground(S) && !S.flags.veinQ, w: 1.8, tree: { dir: { nghe: 1, thuong: 1 } }, run(S, X) {
        if (X.chance(.12)) { S.flags.veinQ = { amt: Math.round(med(S, X) * X.int(4, 8)) };
          return { t: 'Cuốc của bạn bổ vào một vỉa đá lạ, tiếng kêu trong hơn mọi lần. Bạn đưa đèn lại gần: trong lòng đá là những sợi bạc trắng sáng như sao, chạy sâu vào vách. Cả tổ đã ngủ say ở lán ngoài. Bạn ngồi đó rất lâu, ngọn đèn run trong tay, chưa biết nên gọi ai dậy.', k: 'big' }; }
        const g = Math.round(med(S, X) * (.25 + .4 * X.rnd())); X.money(g); X.gain('Engineering', 2);
        return { t: `Bạn gõ đá, nghe tiếng mà lần ra một mạch quặng sắt chạy chéo xuống dưới. Tổ đào cả mùa chưa hết, tối nào về lán cũng đen nhẻm bụi mà miệng vẫn cười. Phần của bạn: ${G.coin(g)}.`, k: 'good' }; } },
    { id: 'dwf_claim_caught', st: AD, w: 4, tree: { from: ['dwf_claim:secret'], wait: [1, 5] }, run(S, X) {
        if (X.chance(.5)) { X.add('so', -14); S.flags.outcast = true; X.add('h', -10);
          return { t: 'Một đứa trong tổ thấy bạn xuống hầm lúc nửa đêm và lặng lẽ đi theo. Mấy hôm sau hội đồng thị tộc gọi bạn lên, đọc tên bạn trước cả đại sảnh, giọng đều đều như đọc sổ nợ. Không ai lên tiếng bênh bạn. Từ hôm ấy, ở bàn tiệc, vại của bạn để trống, không ai rót.', k: 'bad', o: 'caught' }; }
        X.add('h', -3); return { t: 'Mạch bạc cạn sau hai mùa đào lén. Không ai biết, không ai hỏi. Vậy mà mỗi lần đi qua vách tổ tiên ở đại sảnh, bạn vẫn rảo bước nhanh hơn, mắt nhìn xuống sàn.', k: 'info', o: 'kept' }; } },
    { id: 'dwf_collapse', st: AD, rep: true, gap: 6, c: underground, w: 1, tree: { theme: 'hardship' }, run(S, X) {
        if (X.chance(.01)) { X.die({ id: 'mine', text: 'bị đá vùi khi sập hầm' }); return null; }
        if (X.chance(odds(S, X, .55))) { X.add('so', 6); S.fame += 2; X.add('hl', -4);
          return { t: 'Vòm hầm sập sau lưng tổ bạn, bụi đá phủ kín ngọn đèn. Khi tiếng đá lăn đã lặng, từ bên kia đống đổ có tiếng gõ đáp lại: ba tiếng, nghỉ, ba tiếng. Bạn đào bằng tay suốt hai ngày, móng tay bật máu. Ba người trong tổ ra được, còn thở. Người cuối cùng bò ra nắm lấy cổ tay bạn, rất lâu mới chịu buông.', k: 'good', o: 'saved' }; }
        X.add('hl', -10); X.cond('wound'); X.add('h', -6);
        return { t: 'Vòm hầm sập sau lưng tổ bạn. Một tảng đá đè lên chân, ghim bạn xuống nền hầm suốt một đêm. Trong bóng tối, bạn nghe tiếng gõ bên kia đống đá, lúc đầu dồn dập, rồi thưa dần, rồi tắt. Về sau, cứ nghe ai gõ búa ba tiếng liền là bạn giật mình quay đầu.', k: 'bad', o: 'lost' }; } },
    { id: 'dwf_beast', st: AD, rep: true, gap: 5, c: underground, w: 1.1, tree: { dir: { vo: 1 } }, run(S, X) {
        const b = X.pick(['một con giun đá to bằng thân cây', 'một ổ nhện hang', 'một con bò sát mù dài hai sải']);
        if (X.chance(odds(S, X, .5))) { X.gain('Axe', 3); S.fame += 1; X.add('so', 2);
          return { t: `Tổ bạn đào thủng vách, gió lạnh từ một hang tối phả ra, mang theo mùi tanh. Trong hang là ${b}. Bạn đứng chặn ở miệng lỗ, vung rìu cho tới khi cả tổ lui ra hết và lấp đá lại. Tối ấy ở lán không ai nói nhiều, nhưng ai cũng nhường bạn chỗ gần bếp.`, k: 'good', o: 'win' }; }
        X.add('hl', -10); X.cond('wound');
        return { t: `Tổ bạn đào thủng vách, gió lạnh từ một hang tối phả ra, mang theo mùi tanh. Trong hang là ${b}. Bạn lùi ra được, nhưng mang theo một vết cắn sâu tới xương. Đêm ấy bạn nằm nghe tiếng thợ lấp đá, từng tảng một, và đếm cho đỡ đau.`, k: 'bad', o: 'lose' }; } },
    { id: 'dwf_master', st: AD, rep: true, gap: 4, c: S => !S.flags.dwfMaster && ((S.mastery.Engineering || 0) >= 25 || ['smith', 'runesmith', 'jeweler', 'sculptor'].includes(S.work) || S.flags.dwfTrade === 'forge'), w: 1.6, tree: { dir: { nghe: 2 } }, run(S, X) {
        const p = .25 + (S.mastery.Engineering || 0) / 150 + (S.flags.dwfArt ? .2 : 0);
        if (X.chance(p)) { S.flags.dwfMaster = true; S.fame += 4; X.add('so', 6); X.money(Math.round(med(S, X) * .6)); cnt(S, 'dwfMasterN');
          return { t: 'Bạn mang món đồ đẹp nhất của mình tới hội đồng thợ cả. Bảy người chuyền tay nhau xem suốt một buổi chiều, lật đi lật lại dưới ánh lò, không ai nói một lời. Rồi người già nhất đặt nó xuống bàn đá, đẩy về phía bạn một con dấu bằng đồng còn mới. Từ nay đồ bạn làm ra được đóng dấu riêng.', k: 'big', o: 'pass', f: 'Thợ Cả của Người Lùn có dấu riêng. Đồ không có dấu thì thị tộc không bán ra ngoài.' }; }
        X.add('h', -4);
        return { t: 'Bạn mang món đồ đẹp nhất của mình tới hội đồng thợ cả. Một người gõ móng tay lên chỗ mối hàn, nghiêng tai nghe, rồi lắc đầu. Chỉ thế thôi. Bạn ôm món đồ về lò, nhóm lửa, làm lại từ đầu.', k: 'info', o: 'fail' }; } },
    { id: 'dwf_beard_pull', st: AD, rep: true, gap: 6, c: S => stranger(S) && isTown(S), w: 1.3, tree: { theme: 'stranger' }, run(S, X) {
        if (S.traits.bold > .5) { X.gain('Unarmed', 3); X.add('hl', -4); X.add('so', -2);
          return { t: `Ở ${homeName(S, X)}, một gã say giật râu bạn cho vui, cả quán cười ồ. Tiếng cười chưa dứt thì gã đã bay qua hai cái bàn. Chủ quán bắt bạn đền bàn; bạn đếm tiền đặt xuống, không cãi một câu. Từ đó gã không dám bén mảng tới chỗ bạn ngồi.`, k: 'info', o: 'fight' }; }
        X.add('h', -4); X.add('sm', 1);
        return { t: `Ở ${homeName(S, X)}, một gã say giật râu bạn cho vui, cả quán cười ồ. Bạn không làm gì. Bạn chỉ nhìn thật kỹ mặt gã: vết sẹo trên mày, chiếc răng cửa sứt. Người Lùn không quên một bộ mặt, và cũng không quên một món nợ.`, k: 'bad', o: 'remember' }; } },
    { id: 'dwf_hold_call', st: ['adult'], c: S => !S.flags.holdQ && !S.flags.holdDone && (kin(S) || G.raceHome(S)), w: 1.2, run(S, X) {
        S.flags.holdQ = { name: X.pick(['Karak Đá Xám', 'Hầm Chín Cổng', 'Thành Đe Lạnh', 'Sảnh Mạch Bạc']) };
        return { t: `Ở đại sảnh có người treo lại tấm bản đồ cũ của ${S.flags.holdQ.name}, da thuộc đã ngả màu, nét mực chỗ đậm chỗ mờ. Đó là thành dưới núi tộc bạn bỏ từ đời kỵ, khi quái tràn lên từ tầng sâu. Mấy đêm liền, người già đứng trước tấm bản đồ chỉ cho bọn trẻ đâu là lò chung, đâu là sảnh mộ. Rồi có ai đó bắt đầu nói tới chuyện quay về.`, k: 'info' }; } },
    { id: 'dwf_hold_win', st: AD, w: S => 2 + 3 * S.traits.bold, tree: { from: ['dwf_hold:go'], wait: [1, 4], dir: { vo: 2 } }, run(S, X) {
        const n = S.flags.holdDone; S.fame += 6; X.add('so', 8); X.money(Math.round(med(S, X) * 1.2)); if (S.gear < 10) S.gear++; cnt(S, 'holdWin'); dev(S, 6);
        return { t: `Đoàn dọn từng tầng của ${n} trong ba mùa, tầng nào cũng phải đánh mới qua. Ngày lò chung của thành cổ được nhóm lại, lửa bén vào lớp than cũ, cả đoàn đứng khóc mà không ai thấy ngượng. Khói lại bay qua những ống thông hơi đã nghẹt mấy trăm năm. Tên bạn được khắc ở cổng mới, ngang hàng với những cái tên đi trước.`, k: 'big', o: 'win' }; } },
    { id: 'dwf_hold_lose', st: AD, w: 2, tree: { from: ['dwf_hold:go'], wait: [1, 4] }, run(S, X) {
        X.add('hl', -14); X.cond('wound'); X.add('h', -6); X.add('so', 3); cnt(S, 'holdLose');
        return { t: `Đoàn mới xuống tới tầng thứ ba của ${S.flags.holdDone} thì thứ ở dưới sâu thức dậy. Bạn chỉ nhớ tiếng đá vỡ, tiếng người gọi tên nhau trong bóng tối, và một mùi hôi đặc quánh. Một nửa đoàn không về. Lúc được khiêng ra tới cửa hầm, bạn níu lấy vạt áo người khiêng, thề sẽ quay lại.`, k: 'bad', o: 'lose' }; } },
    { id: 'dwf_hold_tomb', st: AD, w: 1.5, tree: { from: ['dwf_hold:go'], wait: [1, 4], dir: { dao: 1 } }, run(S, X) {
        X.add('sm', 4); X.add('so', 4); dev(S, 10);
        return { t: `Ở tầng sâu của ${S.flags.holdDone}, đoàn tìm thấy sảnh mộ tổ tiên còn nguyên: tên khắc trên vách, rìu đặt trên ngực từng người. Bụi phủ dày như tuyết, không một dấu chân. Không ai lấy gì. Cả đoàn đứng đọc tên từng người, giọng nhỏ như sợ đánh thức, rồi chặn cửa lại cho họ ngủ tiếp.`, k: 'big', o: 'tomb' }; } },
    { id: 'dwf_hold_back', st: AD, w: 3, tree: { from: ['dwf_hold:stay'], wait: [2, 6] }, run(S, X) {
        X.add('h', -3);
        return { t: `Đoàn đi ${S.flags.holdDone} trở về, ít người hơn lúc đi. Ba đêm liền họ kể chuyện ở đại sảnh, lửa lò chung cháy tới sáng. Bạn ngồi nghe ở hàng ghế sau, tay ôm vại rượu đã nguội. Người kể không nhìn về phía bạn lần nào.`, k: 'info' }; } },
    { id: 'dwf_gold', st: AD, c: (S, X) => S.gold > med(S, X) * 5 && !S.flags.dwfGold, w: 1.2, run(S, X) {
        S.flags.dwfGold = true; X.add('h', 2); X.add('so', -3); G.trajBump(S, { thuong: .3 });
        return { t: 'Bạn bắt đầu xuống kho đếm vàng mỗi tối. Cửa kho khóa hai lớp, không cho ai vào, kể cả người nhà. Tiếng đồng vàng chạm nhau trong bóng tối nghe êm như tiếng nước. Đếm xong một lượt, bạn lại muốn đếm thêm lượt nữa.', k: 'info', f: 'Người Lùn có câu: vàng không biết nói nhưng biết gọi.' }; } },
    { id: 'dwf_caravan', st: ['adult'], rep: true, gap: 5, c: S => dwfHold(S), w: 1.2, tree: { dir: { thuong: 1, du: 1 } }, run(S, X) {
        const g = Math.round(med(S, X) * .35); X.money(g); X.add('sm', 1);
        return { t: `Thị tộc cử bạn dẫn đoàn xe sắt xuống chợ của loài người dưới chân núi. Lúc đi xe chở rìu, đinh, bản lề; lúc về chở lúa mì, len và những vò mật ong còn thơm mùi hoa. Bạn mặc cả bằng ba thứ tiếng, và ở thứ tiếng nào cũng không chịu bớt. Phần của bạn: ${G.coin(g)}.`, k: 'good' }; } },
    { id: 'dwf_hammer', st: ['elder'], w: 3, run(S, X) {
        const k = S.family.kids.find(x => x.alive), to = k ? `${k.name}, con bạn` : (S.disciples || []).length ? `${first(S.disciples[S.disciples.length - 1].name)}, đệ tử của bạn` : 'đứa cháu họ khéo tay nhất';
        X.add('so', 4); X.add('h', 3);
        return { t: `Bạn trao cây búa của mình cho ${to}. Cán búa đã mòn theo tay bạn, chỗ ngón cái tì vào lõm hẳn xuống. Theo lệ, búa đổi chủ thì đổi tên. Hai người ngồi bên lò cả đêm, gạt đi hết tên này tới tên khác, tới lúc than tàn mới chọn được.`, k: 'good' }; } }
  ]);
  dec('dwarf', 'dwf_trade', {
    prio: 4, gap: 1, tree: { q: 'dwfTradeQ' },
    when: S => !S.dead && S.flags.dwfTradeQ === true,
    build(S, X) {
      return { title: 'Việc cho thị tộc', body: 'Người Lùn trả nợ cho thị tộc bằng tay nghề, không bằng lời. Việc bạn chọn hôm nay sẽ theo bạn suốt đời, tới tận lúc tên bạn được khắc lên vách đại sảnh.',
        choices: [{ k: 'forge', label: 'Vào lò', sub: 'Học rèn với thợ của thị tộc.' }, { k: 'mine', label: 'Xuống mỏ', sub: 'Đi theo tổ đào, học nghe đá.' },
          { k: 'rune', label: 'Học khắc rune', sub: 'Rune không phải phép: là chữ khắc cho đá và sắt nhớ.' }, { k: 'gate', label: 'Đứng cổng', sub: 'Giữ cổng hầm, đánh thứ trèo lên từ dưới sâu.' }] };
    },
    apply(S, X, k) { S.flags.dwfTradeQ = null; S.flags.dwfTrade = k; cnt(S, 'trade_' + k);
      if (k === 'forge') { X.gain('Engineering', 6); X.gain('Axe', 2); G.trajBump(S, { nghe: .4 }); return 'Bạn nhận chiếc tạp dề da của lò chung, còn hằn vết cháy của người mặc trước. Từ nay bạn dậy trước mọi người để nhóm lửa. Buổi sáng đầu tiên, than mãi không bén, khói xộc vào mắt cay xè. Tới khi ngọn lửa đỏ lên thì cả lò đã thức, đứng sau lưng bạn mà chờ.'; }
      if (k === 'mine') { X.gain('Body', 5); X.gain('Engineering', 3); return 'Bạn nhận một chiếc đèn đồng và một cái cuốc khắc số. Mất đèn thì phải đền, mất cuốc thì phải đền gấp đôi. Ngày đầu xuống mỏ, bạn đếm từng bậc thang cho tới khi trên đầu không còn một chút ánh sáng nào. Hơn ba trăm bậc.'; }
      if (k === 'rune') { X.gain('Spirit', 4); X.gain('Engineering', 3); G.trajBump(S, { tri: .3 }); return 'Thợ rune già đưa bạn một tấm đá phiến và một bảng rune cũ, bắt chép lại từng nét, chép tới khi không còn nét nào run. Tháng đầu bạn ngồi tới khuya, ngón tay tê cứng quanh cây dùi. Ông không khen lần nào. Chỉ có một hôm, ông lặng lẽ treo tấm đá phiến của bạn lên vách xưởng.'; }
      X.gain('Shield', 5); X.gain('Axe', 3); G.trajBump(S, { vo: .4 }); return 'Bạn nhận một cái khiên đã móp ba chỗ, quai da sờn bóng. Người giữ cổng trước bạn đã chết sau cái khiên ấy. Không ai đổi khiên mới cho bạn, và bạn cũng không xin. Đêm đầu, bạn ngồi miết ngón tay lên từng vết móp, đoán xem thứ gì đã để lại chúng.'; },
    auto: S => { const m = S.mastery; return (m.Shield || 0) + (m.Axe || 0) > (m.Engineering || 0) + 4 && S.traits.bold > .5 ? 'gate' : S.traits.studious > .65 ? 'rune' : S.traits.bold > .6 ? 'mine' : 'forge'; }
  });
  dec('dwarf', 'dwf_claim', {
    prio: 5, gap: 1, tree: { q: 'veinQ' },
    when: S => !S.dead && !!S.flags.veinQ,
    build(S, X) { const a = S.flags.veinQ.amt;
      return { title: 'Mạch bạc sao', body: `Mạch bạc này đáng chừng ${G.coin(a)}, có khi hơn. Luật thị tộc thì rõ: ai tìm được mạch phải báo hội đồng; mạch thuộc về cả tộc, người tìm được chia phần lớn nhất. Ngọn đèn trong tay bạn đã gần cạn dầu.`,
        choices: [{ k: 'report', label: 'Báo hội đồng', sub: `Nhận phần của người tìm mạch (chừng ${G.coin(Math.round(a * .25))}); tên bạn được ghi vào sổ mỏ.` },
          { k: 'secret', label: 'Giấu, đào đêm một mình', sub: 'Giàu nhanh. Bị phát hiện thì bị ruồng bỏ.' }, { k: 'sell', label: 'Bán vị trí cho thương nhân loài người', sub: 'Tiền ngay, không ai trong tộc biết là bạn.' }] }; },
    apply(S, X, k) { const a = S.flags.veinQ.amt; S.flags.veinQ = null; cnt(S, 'claim_' + k);
      if (k === 'report') { X.money(Math.round(a * .25)); S.fame += 4; X.add('so', 8); dev(S, 5); return 'Hội đồng đặt tên mạch theo tên bạn, người giữ sổ mỏ viết cái tên ấy bằng nét to nhất trang. Ở đại sảnh, người ta bắt đầu nhường bạn chỗ ngồi gần lò. Mấy ông già vốn ít lời cũng ghé qua bàn bạn, rót cho bạn một vại rồi mới đi.'; }
      if (k === 'secret') { X.money(Math.round(a * .7)); X.add('h', 3); G.trajBump(S, { am: .3, thuong: .3 }); return 'Bạn lấy đá lấp miệng vỉa, xếp cho giống vách cũ. Đêm nào bạn cũng chờ cả tổ ngủ say rồi mới xuống, một mình, với chiếc đèn che kín ba mặt. Tiếng cuốc lúc ấy bạn gõ thật khẽ. Ban ngày, ai nhắc tới mạch quặng là bạn lái sang chuyện khác.'; }
      X.money(Math.round(a * .4)); X.add('so', -4); return 'Thương nhân loài người trả tiền mặt, đếm từng đồng trên mặt bàn, rồi thề không nói ra. Bạn nhét túi tiền vào áo, về bằng lối sau chợ. Mùa sau, ở sườn núi mọc lên một dãy lán lạ, sáng nào khói bếp của thợ mỏ người cũng bay lên. Bạn đứng trên cổng hầm nhìn xuống, không kể với ai.'; },
    auto: S => S.traits.social > .45 || S.traits.pious > .5 ? 'report' : S.traits.bold > .6 ? 'secret' : 'sell'
  });
  dec('dwarf', 'dwf_hold', {
    prio: 4, gap: 1, tree: { q: 'holdQ' },
    when: S => !S.dead && !!S.flags.holdQ,
    build(S, X) { const n = S.flags.holdQ.name;
      return { title: 'Chiếm lại thành cổ', body: `Một đoàn Người Lùn đang tập hợp ở cổng để đi chiếm lại ${n}. Ai đi thì để lại tên ở cổng; ai không về thì tên được khắc lên vách đại sảnh. Tiếng mài rìu vang suốt mấy đêm liền.`,
        choices: [{ k: 'go', label: 'Đi cùng đoàn', sub: 'Ba mùa dưới lòng đất, đánh thứ đã đuổi tổ tiên đi.' }, { k: 'stay', label: 'Ở lại giữ lò', sub: 'Lò chung cũng cần người.' }] }; },
    apply(S, X, k) { const n = S.flags.holdQ.name; S.flags.holdQ = null; S.flags.holdDone = n; cnt(S, 'hold_' + k);
      if (k === 'go') { X.gain('Axe', 4); X.gain('Shield', 3); G.trajBump(S, { vo: .5 }); return `Bạn khắc tên mình lên cổng, nét cuối hơi run. Rồi bạn vác rìu theo đoàn xuống con đường hầm dẫn tới ${n}. Ánh lò chung sau lưng nhỏ dần thành một đốm đỏ, rồi khuất hẳn.`; }
      X.add('so', -2); return 'Bạn tiễn đoàn ở cổng, đứng tới khi tiếng bước chân cuối cùng tắt hẳn trong lòng núi. Rồi bạn quay về lò chung, cời than, thêm củi. Lò chung cũng cần người, bạn tự nhủ thế, mà cả buổi chiều tay cứ đặt nhầm chỗ.'; },
    auto: S => S.traits.bold > .45 ? 'go' : 'stay'
  });

  // ─────────── Orc: bầy, trại, bộ lạc ───────────
  // Nguồn: Warcraft (kỵ sói, thách đấu tù trưởng, bà đồng), Elder Scrolls (Orsimer: thử thách trưởng thành, tù trưởng do thắng trận
  // mà lên), thiết lập của thư viện ("kẻ chết được nhớ bằng xương treo trên cờ"), dân du mục thảo nguyên (săn vây, đi cướp mùa đông).
  const HUNT = { wind_steppe: 'một đàn bò rừng', red_desert: 'một bầy lạc đà hoang', frost_tundra: 'một con voi ma mút lông xám', moss_forest: 'một con gấu hang' };
  add('orc', [
    { id: 'orc_pup', st: ['child'], c: S => !S.flags.orcWolf, w: 3.5, run(S, X) {
        S.flags.orcWolf = { y: S.world.year, name: X.pick(['Răng Xám', 'Gió Đen', 'Sẹo Mõm', 'Tro', 'Hú Dài']) }; X.gain('Taming', 4); X.add('h', 5);
        return { t: `Mẹ đặt vào lòng bạn một con sói con mới mở mắt, lông còn ướt, người còn run. "Từ nay nó ăn từ tay mày," mẹ nói, "mày đói thì nó cũng đói." Bạn nhai nát miếng thịt khô rồi mớm cho nó, đêm ấy hai đứa ngủ cuộn vào nhau trên tấm da. Bạn gọi nó là ${S.flags.orcWolf.name}.`, k: 'good', f: 'Ở trại Orc, đứa trẻ và con sói của nó lớn lên cùng nhau; sói chết thì chủ giữ lại nanh.' }; } },
    { id: 'orc_wolf_ride', st: ['teen', 'adult'], c: S => !!S.flags.orcWolf && !S.flags.orcRode, w: 4, run(S, X) {
        S.flags.orcRode = true; X.gain('Riding', 5); X.add('so', 3);
        return { t: `${S.flags.orcWolf.name} giờ đã cao tới ngực bạn, lưng rộng, mõm dài. Lần đầu bạn cưỡi nó qua thảo nguyên, bạn ngã bảy lần, lần nào cũng nằm ngửa giữa cỏ nghe nó thở phì phò bên cạnh. Lần thứ tám nó chạy đúng hướng và không hất bạn xuống nữa. Gió quất vào mặt rát như roi, mà bạn cứ thế cười to.`, k: 'good' }; } },
    { id: 'orc_wolf_old', st: AD, c: S => !!S.flags.orcWolf && S.world.year - S.flags.orcWolf.y >= 13, w: 4, run(S, X) {
        const n = S.flags.orcWolf.name; S.flags.orcWolf = null; X.add('h', -6); X.add('so', 2);
        return { t: `${n} già rồi. Mấy hôm nay nó không đứng dậy nổi, chỉ nằm ở cửa lều, đuôi đập khẽ mỗi khi bạn đi qua. Đêm cuối, bạn ngồi với nó tới sáng, tay đặt lên tấm lưng đã gầy trơ xương. Khi trời hửng, bạn lấy một chiếc nanh của nó buộc vào cán rìu. Từ đó mỗi lần vung rìu, bạn lại nghe như có tiếng nó thở bên tai.`, k: 'bad' }; } },
    { id: 'orc_trial', st: ['teen'], w: 4, run(S, X) {
        if (X.chance(odds(S, X, .55))) { X.add('so', 6); S.fame += 1; X.gain('Body', 3); X.gain('Stealth', 2);
          return { t: 'Trại đẩy bạn ra thảo nguyên với một con dao và một túi nước, dặn bảy ngày sau mới được về. Đêm thứ ba bạn uống nước đọng trong hốc đá; ngày thứ năm bạn nằm úp mặt trong cỏ cả buổi, rình một con báo cỏ. Ngày thứ bảy bạn về, vác trên vai bộ da của nó, máu đã khô thành vệt đen. Bà đồng nhúng ngón tay vào bát đất son, vạch một đường đỏ lên mặt bạn: từ nay bạn là người lớn.', k: 'big', o: 'win' }; }
        X.add('hl', -8); X.add('so', -2);
        return { t: 'Trại đẩy bạn ra thảo nguyên với một con dao và một túi nước, dặn bảy ngày sau mới được về. Bảy ngày ấy bạn chỉ bẫy được vài con chuột đồng, đêm nào cũng nghe sói tru mà không dám chợp mắt. Bạn về tay trắng, gầy rộc, môi nứt nẻ. Trại vẫn mở cổng cho vào, nhưng không ai vạch son lên mặt bạn. Mùa sau bạn phải đi lại.', k: 'bad', o: 'lose' }; } },
    { id: 'orc_hunt', st: AD, rep: true, gap: 3, c: S => G.raceHome(S) || kin(S), w: 2, tree: { dir: { vo: 1, gia: .5 } }, run(S, X) {
        const prey = HUNT[bio(S)] || 'một đàn hươu'; const g = Math.round(med(S, X) * .25); X.money(g); X.gain(X.chance(.5) ? 'Spear' : 'Axe', 2); X.add('so', 2); X.add('hl', -2);
        return { t: `Cả trại đi săn vây ${prey}. Đàn ông, đàn bà, sói chiến, ai cũng có chỗ của mình: kẻ hò hét, kẻ khua giáo, dồn con mồi vào hẻm đá từ hai phía. Bụi cuộn lên mù mịt, tiếng chân rung cả đất. Tối ấy lửa trại cháy cao, mỡ nhỏ xèo xèo xuống than, ai cũng được ăn tới no. Phần của bạn bán được ${G.coin(g)}.`, k: 'good' }; } },
    { id: 'orc_chief_old', st: ['adult'], c: S => kin(S) && !S.flags.chiefQ && !S.flags.orcChief, w: 1.3, run(S, X) {
        S.flags.chiefQ = true;
        return { t: 'Tù trưởng bị một con bò rừng húc gãy chân. Giờ ông đi phải chống giáo, mỗi bước lại nghiến răng, ở buổi họp trại thì ngồi nhiều hơn đứng. Đám trai trẻ bắt đầu nhìn nhau qua đống lửa. Không ai nói ra, nhưng tiếng mài rìu đêm sau dài hơn đêm trước.', k: 'info' }; } },
    { id: 'orc_chief_trust', st: AD, w: 3, tree: { from: ['orc_chief:serve'], wait: [2, 6], dir: { quyen: 1, gia: 1 } }, run(S, X) {
        S.fame += 2; X.add('so', 5);
        return { t: 'Tù trưởng giao cho bạn dẫn đội tuần ở biên bãi cỏ. Trước cả trại, ông đặt bàn tay to bè lên vai bạn và gọi bạn là "cánh tay trái của ta". Đám trai trẻ cúi đầu khi bạn đi qua. Đêm ấy bạn đi tuần một vòng dài hơn thường lệ, nghe gió, nhìn những đốm lửa trại sau lưng.', k: 'good' }; } },
    { id: 'orc_camp_new', st: AD, w: 3, tree: { from: ['orc_chief:leave'], wait: [1, 4], dir: { quyen: 1, du: 1 } }, run(S, X) {
        S.flags.orcChief = 'camp'; S.fame += 3; X.add('so', 4);
        return { t: 'Mười hai lều nhổ cọc theo bạn đi về phía bãi cỏ mới. Đoàn đi chín ngày, trẻ con ngồi trên lưng sói, người già chống gậy đi sau cùng. Bạn cắm cọc cờ đầu tiên của trại mình trên một gò cao, nơi gió thổi từ bốn phía. Tối ấy, lần đầu tiên, cả trại chờ bạn ăn miếng đầu rồi mới ăn.', k: 'big' }; } },
    { id: 'orc_bones', st: AD, c: S => !!parentDead(S) && !S.flags.orcBones && (kin(S) || G.raceHome(S)), w: 3, run(S, X) {
        const p = parentDead(S); S.flags.orcBones = true; X.add('so', 3); X.add('h', -2); if (S.faith === 'ancestor') dev(S, 6);
        return { t: `Theo lệ trại, xương của ${p.role} bạn được rửa sạch bằng nước suối và tro, buộc lên cột cờ trước lều. Mỗi lần gió thổi, xương gõ vào nhau lách cách. Bà đồng bảo đó là ${p.role} bạn đang nói. Đêm nào gió to, bạn lại ra ngồi dưới chân cột cờ, nghe cho hết.`, k: 'info', f: 'Kẻ mạnh dẫn, kẻ yếu theo, kẻ chết được nhớ bằng xương treo trên cờ.' }; } },
    { id: 'orc_raid_call', st: ['adult'], rep: true, gap: 5, c: S => (G.raceHome(S) || kin(S)) && !S.flags.raidQ, w: S => .7 + (G.lawHere(S, 'raid_law') ? 2 : 0) + G.local(S).war * 2, tree: { theme: 'raid' }, run(S, X) {
        S.flags.raidQ = true;
        return { t: 'Mùa đông tới sớm. Cỏ chưa kịp vàng thì sương muối đã phủ trắng, đàn gia súc gầy trơ sườn. Đêm nay đám trai trẻ ngồi mài rìu bên lửa, nói nhỏ về những kho lúa của làng nông dưới thung lũng. Có đứa liếc sang chỗ bạn ngồi, chờ xem bạn nói gì.', k: 'info' }; } },
    { id: 'orc_rage', st: AD, c: S => !S.flags.orcRage && ((S.mastery.Axe || 0) >= 20 || (S.mastery.Body || 0) >= 20), w: 1.4, tree: { dir: { vo: 2 } }, run(S, X) {
        S.flags.orcRage = true; X.gain('Axe', 5); X.gain('Body', 3); X.add('hl', -6);
        return { t: 'Giữa trận, máu chảy xuống mắt, và mọi thứ chuyển sang màu đỏ. Bạn không còn nghe tiếng ai, chỉ nghe tim mình đập như trống trận. Lúc tỉnh lại, ba con sói đồng nằm quanh chân bạn, cán rìu gãy làm đôi trong tay. Bạn không nhớ mình đã vung rìu lần nào.', k: 'big', f: 'Orc gọi đó là lúc tổ tiên mượn tay.' }; } },
    { id: 'orc_shaman_pick', st: ['teen'], c: S => kin(S) && !S.flags.orcShaman && (S.traits.pious > .55 || (S.mastery.Spirit || 0) >= 8), w: 2.5, run(S, X) {
        S.flags.orcShaman = true; X.gain('Spirit', 4); dev(S, 5); X.add('so', 3);
        return { t: 'Bà đồng của trại chọn bạn mang túi xương cho bà. Túi nặng, mùi khói và mỡ cừu thấm vào vai áo bạn mấy ngày không bay. Bạn theo bà lên gò, học đặt xương vai cừu lên lửa rồi đọc những vết nứt hiện ra. Bà ít nói, nhưng mỗi lần bạn đọc đúng, bà gõ nhẹ ngón tay lên mu bàn tay bạn.', k: 'big' }; } },
    { id: 'orc_shaman_heir', st: AD, w: 3, tree: { from: ['orc_shaman_pick'], wait: [3, 10], dir: { dao: 2 } }, run(S, X) {
        X.gain('Spirit', 4); S.fame += 3; X.add('so', 6); dev(S, 8);
        return { t: 'Bà đồng mất vào một đêm gió lớn, túi xương còn đặt bên gối. Sáng ra cả trại đứng trước lều bạn, im lặng, không ai đi săn, không ai nhóm bếp. Họ chờ bạn nói tổ tiên muốn gì. Bạn đặt chiếc xương vai cừu đầu tiên lên lửa, và tay bạn không run.', k: 'big' }; } },
    { id: 'orc_storm', st: AD, rep: true, gap: 6, c: S => ['wind_steppe', 'red_desert', 'frost_tundra'].includes(bio(S)) && !isTown(S), w: 1.1, tree: { theme: 'hardship' }, run(S, X) {
        X.add('hl', -4); X.money(-Math.round(med(S, X) * .15)); X.gain('Riding', 2);
        return bio(S) === 'frost_tundra' ? { t: 'Bão tuyết kéo dài ba ngày. Bạn cùng đám thanh niên quây đàn ngựa vào hẻm núi, đêm ngủ ngồi giữa lũ ngựa cho đỡ lạnh, hơi thở đóng băng trên mép. Gió rít qua khe đá như có ai đang khóc. Sáng ra đếm lại, thiếu bảy con.', k: 'bad' }
          : { t: 'Bão cát kéo tới như một bức tường đỏ, nuốt mất mặt trời giữa trưa. Cả trại buộc lều vào nhau, nằm úp mặt xuống đất, vải trùm kín đầu mà cát vẫn lọt vào kẽ răng. Lúc gió qua, hai cái lều đã bay mất. Mấy ngày sau người ta vẫn còn giũ cát ra từ tóc.', k: 'bad' }; } },
    { id: 'orc_lone', st: AD, c: S => !!S.flags.outcast && !S.flags.orcLone, w: 3, tree: { dir: { du: 1 } }, run(S, X) {
        S.flags.orcLone = true; X.add('h', -6); X.gain('Stealth', 3); G.trajBump(S, { du: .3 });
        return { t: 'Bị đuổi khỏi trại, bạn đi một mình như con sói lạc bầy. Đêm nào bạn cũng nhóm một đống lửa nhỏ, nhỏ tới mức đứng xa không ai thấy. Từ đâu đó vọng lại tiếng trống của một trại nào đó, trầm và đều. Không trại nào gọi bạn.', k: 'bad' }; } }
  ]);
  dec('orc', 'orc_chief', {
    prio: 4, gap: 1, tree: { q: 'chiefQ' },
    when: S => !S.dead && S.flags.chiefQ === true,
    build(S, X) {
      return { title: 'Ghế tù trưởng', body: 'Ở trại Orc, tù trưởng là kẻ còn đứng được sau trận đấu ở vòng đá. Chân ông đã gãy, nhưng tay vẫn còn, rìu vẫn còn, và những người đứng sau ông cũng vẫn còn. Đêm nay cả trại chờ xem ai lên tiếng trước.',
        choices: [{ k: 'challenge', label: 'Thách đấu ở vòng đá', sub: 'Thắng thì làm tù trưởng. Thua thì mang sẹo cả đời.' }, { k: 'serve', label: 'Đứng sau tù trưởng', sub: 'Giữ cho trại khỏi chia đôi.' },
          { k: 'leave', label: 'Dắt người đi dựng trại riêng', sub: 'Ai muốn theo thì theo.' }] }; },
    apply(S, X, k) { S.flags.chiefQ = null; cnt(S, 'chief_' + k);
      if (k === 'challenge') {
        if (X.chance(odds(S, X, .42))) { S.flags.orcChief = true; S.fame += 6; X.add('so', 8); G.trajBump(S, { quyen: .6, vo: .3 }); return 'Bạn bước vào vòng đá trước mặt cả trại. Ba lần bạn quật tù trưởng già xuống đất, ba lần bạn dừng tay, không lấy mạng ông. Lần thứ ba ông nằm im một lúc, mắt nhìn trời, rồi tự tay trao cho bạn cây rìu đầu sói. Ông chống giáo đi về hàng ghế của các bô lão, và cả trại gõ cán giáo xuống đất cho tới khi ông ngồi xuống.'; }
        X.add('hl', -15); X.cond('wound'); X.add('so', -4); return 'Tù trưởng già vẫn còn biết đánh: chân gãy, tay thì không. Bạn nằm trong vòng đá với ba cái xương sườn gãy, mỗi hơi thở là một lần đau. Ông bước qua người bạn mà không nhìn xuống. Cả trại lặng im, chỉ có tiếng xương trên cột cờ gõ vào nhau.'; }
      if (k === 'serve') { X.add('so', 5); return 'Ở buổi họp trại, bạn đứng sau lưng tù trưởng, tay đặt lên cán rìu. Bạn không nói gì, cũng không cần nói. Đám trai trẻ nhìn bạn một lúc, rồi thôi không nhìn nhau nữa. Tối ấy tù trưởng sai người mang sang lều bạn một bầu rượu sữa ngựa.'; }
      G.trajBump(S, { du: .4 }); X.add('so', -2); return 'Bạn đứng lên giữa buổi họp trại, nói rằng mình sẽ đi về phía bãi cỏ mới, ai muốn theo thì theo. Đống lửa nổ lách tách trong im lặng. Rồi một người đứng lên, thêm một người nữa. Tù trưởng nhìn từng người một, như để nhớ mặt.'; },
    auto: (S, X) => S.traits.bold > .6 ? 'challenge' : S.traits.social > .5 ? 'serve' : S.traits.bold > .4 ? 'leave' : 'serve'
  });
  dec('orc', 'orc_raid', {
    prio: 4, gap: 1, tree: { q: 'raidQ' },
    when: S => !S.dead && S.flags.raidQ === true,
    build(S, X) {
      return { title: 'Đi cướp mùa đông', body: 'Đám trai trẻ sẽ xuống làng nông trước khi tuyết chặn đèo. Mang về được lúa và gia súc thì cả trại qua mùa đông; về tay không thì trẻ con sẽ đói trước. Lũ sói chiến đã được thắng yên.',
        choices: [{ k: 'ride', label: 'Cưỡi sói theo đoàn', sub: 'Của cải, danh tiếng; có thể không về.' }, { k: 'stay', label: 'Ở lại trại', sub: 'Trại nghĩ bạn sợ.' },
          { k: 'warn', label: 'Lẻn xuống báo cho làng', sub: 'Phản trại. Biết thì bị đuổi.' }] }; },
    apply(S, X, k) { S.flags.raidQ = null; cnt(S, 'raid_' + k);
      if (k === 'ride') {
        if (X.chance(odds(S, X, .55))) { X.money(Math.round(med(S, X) * .6)); X.gain('Riding', 2); S.fame += 1; G.trajBump(S, { vo: .3, am: .2 }); return 'Đoàn về lúc tảng sáng, lưng sói chở nặng bao lúa và cừu non kêu be be. Cả trại ùa ra đón, đàn bà reo, trẻ con chạy theo đếm cừu. Tiệc mở ngay từ sáng, mỡ chảy xuống lửa xèo xèo. Bạn được chia phần của người đi đầu, và ai nâng sừng rượu cũng nhắc tên bạn.'; }
        X.add('hl', -10); X.cond('wound'); return 'Làng nông đã dựng rào cọc nhọn, lính tỉnh đóng sẵn bên trong. Tên trút xuống ngay khi đoàn ra khỏi bìa rừng. Đoàn quay sói chạy về tay không, bạn mang theo một mũi tên cắm trong vai. Suốt đường về bạn nằm rạp trên lưng sói, nghe máu mình nhỏ xuống bờm nó.'; }
      if (k === 'stay') { X.add('so', -3); return 'Bạn ở lại canh lửa. Đêm dài, trại vắng, chỉ có tiếng gió và tiếng lũ sói già trở mình. Sáng ra đoàn về, không ai nói gì với bạn, cũng không ai ngồi xuống cạnh bạn.'; }
      X.add('h', 3); G.trajBump(S, { dao: .3 }); if (X.chance(.5)) { S.flags.outcast = true; X.add('so', -12); return 'Bạn lẻn xuống thung lũng trong đêm, gõ cửa nhà đầu làng rồi chạy. Làng nông kịp dựng rào. Nhưng có người trong trại đã thấy dấu chân bạn in trên lớp sương muối, một hàng đi xuống, một hàng đi lên. Bạn bị đuổi khỏi trại, không ai nhìn theo.'; }
      X.add('so', -2); return 'Bạn lẻn xuống thung lũng trong đêm, gõ cửa nhà đầu làng rồi chạy. Làng nông kịp dựng rào; đoàn quay về tay trắng, không ai hiểu vì sao. Bên đống lửa, người ta chửi lũ nông dân gặp may. Bạn ngồi nghe, cúi đầu mài rìu.'; },
    auto: S => S.traits.bold > .45 ? 'ride' : S.traits.pious > .7 && S.traits.social < .4 ? 'warn' : 'stay'
  });

  // ─────────── Vài nút cho tộc khác ───────────
  add('elf', [
    // Dalish của Dragon Age: lễ trưởng thành khắc mặt, phải im lặng suốt buổi, kêu đau thì chưa đủ lớn.
    { id: 'elf_inked', st: ['teen', 'adult'], rep: true, gap: 2, c: S => S.flags.elfInk !== true && (kin(S) || G.raceHome(S)) && G.RACES.elf.adult * .7 <= S.age * G.RACES.elf.ypt, w: 4, run(S, X) {
        if (X.chance(.35 + S.traits.bold * .5)) { S.flags.elfInk = true; X.add('so', 6); X.add('h', 4);
          return { t: 'Người giữ lễ vẽ lên mặt bạn những đường gân lá bằng nhựa cây và mũi kim gai, từ trưa cho tới khi trăng lên. Máu rịn ra lẫn với nhựa, chảy xuống cằm. Bạn không kêu một tiếng. Sáng ra, lúc bạn bước khỏi lều lễ, cả tộc cúi đầu chào bạn như chào một người lớn.', k: 'big', o: 'ok', f: 'Tiên Tộc không định tuổi cho lễ này: kêu đau là chưa đủ lớn.' }; }
        S.flags.elfInk = 'wait'; X.add('h', -4);
        return { t: 'Tới đường gân thứ bảy thì bạn bật kêu. Người giữ lễ đặt kim xuống, lau tay, bảo năm sau quay lại. Không ai trách bạn một lời, và chính vì thế mà bạn xấu hổ. Suốt năm ấy, bạn hay đưa tay sờ lên mấy đường gân dang dở trên má.', k: 'bad', o: 'cry' }; } },
    { id: 'elf_hart', st: AD, rep: true, gap: 5, c: S => G.raceHome(S), w: 1.2, run(S, X) { X.gain('Taming', 3); X.add('h', 3);
        return { t: 'Một con hươu trắng đi theo đoàn dời trại suốt ba ngày, lúc gần lúc xa, chưa bao giờ để ai tới gần quá mười bước. Ngày thứ tư nó dừng bên một dòng suối, cúi đầu uống nước, rồi đứng đó không đi nữa. Năm ấy cả tộc dựng lều đúng chỗ đó. Bô lão bảo rừng đã chọn chỗ thay mình.', k: 'good' }; } },
    { id: 'elf_song', st: AD, c: S => !S.flags.elfSong && (S.mastery.Arcane || 0) >= 10, w: 1.5, tree: { dir: { phap: 1, tri: 1 } }, run(S, X) {
        S.flags.elfSong = true; X.gain('Arcane', 4); X.add('sm', 3);
        return { t: 'Người giữ khúc cổ dạy bạn một khúc hát dài chín đêm. Hát đúng thì sương đọng lại thành chữ trên lá; hát sai một nốt thì phải bắt đầu lại từ đêm đầu. Bạn hỏng ở đêm thứ sáu, rồi ở đêm thứ tám. Tới lượt thứ ba, khi trời hửng, lá quanh chỗ bạn ngồi đã kín chữ.', k: 'good' }; } }
  ]);
  add('beastfolk', [
    { id: 'bst_mark', st: ['teen'], c: S => kin(S) || G.raceHome(S), w: 3, run(S, X) { X.add('so', 4);
        return { t: 'Lần đầu bạn được đi tuần ranh đất săn của bầy một mình. Ở từng góc ranh, bạn đứng thẳng người, cào dấu thật sâu lên vỏ cây, cao hơn dấu cũ một chút. Nhựa cây rịn ra, thơm hăng. Kẻ lạ ngửi thấy là biết đất này đã có chủ, và giờ trong đám chủ ấy có thêm bạn.', k: 'good' }; } },
    { id: 'bst_pack_hunt', st: AD, rep: true, gap: 3, c: S => kin(S) || G.raceHome(S), w: 1.8, tree: { dir: { vo: 1, gia: .5 } }, run(S, X) {
        const g = Math.round(med(S, X) * .2); X.money(g); X.gain('Unarmed', 2); X.add('so', 2);
        return { t: `Bầy đi săn vào đêm không trăng. Mỗi người một hướng, không ai nói một tiếng, chỉ có tiếng gầm gừ khẽ trong cổ họng báo chỗ cho nhau. Bạn nằm rạp trong cỏ ướt, nghe tiếng chân con mồi tới gần, gần nữa. Nó chạy đúng vào chỗ bạn nằm chờ. Phần chia của bạn: ${G.coin(g)}.`, k: 'good' }; } },
    { id: 'bst_intruder', st: AD, rep: true, gap: 6, c: S => kin(S) || G.raceHome(S), w: 1, run(S, X) {
        if (X.chance(odds(S, X, .5))) { X.add('so', 4); S.fame += 1; return { t: 'Mùi lạ trên ranh đất săn: một con đực của bầy khác, mùi hăng và còn mới. Bạn lần theo tới bờ suối thì gặp nó. Hai bên đứng nhìn nhau, lông gáy dựng đứng. Bạn nhe nanh, gầm trong cổ cho tới khi nó cúi đầu, quay lưng bỏ đi.', k: 'good', o: 'win' }; }
        X.add('hl', -8); X.cond('wound');
        return { t: 'Mùi lạ trên ranh đất săn: một con đực của bầy khác, mùi hăng và còn mới. Bạn lần theo tới bờ suối, chưa kịp gầm thì nó đã lao vào. Hai bên ôm nhau lăn xuống nước, bọt tung trắng xóa. Bạn về với một bên tai rách, máu chảy dọc cổ, còn mùi của nó thì vương trên ranh đất mấy ngày chưa tan.', k: 'bad', o: 'lose' }; } },
    { id: 'bst_cubs', st: ['adult'], c: S => kin(S) && S.family.kids.some(k => k.alive && k.age < 10), w: 2, run(S, X) { X.add('so', 4); X.add('h', 4);
        return { t: 'Ở bầy, con non là con của cả bầy. Mùa này con bạn ngủ ở hang nhà hàng xóm nhiều hơn ở nhà, sáng ra mới lon ton chạy về, người dính đầy lông lạ. Còn bạn thì tối nào cũng nhai mềm thịt cho ba đứa không phải con mình. Chúng ngủ chồng lên nhau trong góc hang, thở đều như một.', k: 'good' }; } }
  ]);
  add('fae', [
    // Văn học dân gian: trẻ đánh tráo (changeling) và kéo sắt trên nôi; đồ ăn của tiên giữ người phàm lại; nước chảy chặn Yêu Tinh.
    { id: 'fae_changeling', st: ['child'], c: S => stranger(S), w: 3, run(S, X) { X.add('h', -2); X.add('sm', 2);
        return { t: 'Nhà bạn ở giữa xóm loài người. Bà hàng xóm cứ thấy bạn chạy ngang là vội treo cây kéo sắt lên đầu nôi con bà, sợ bạn tráo mất đứa bé. Có hôm bạn đứng ở hàng rào nhìn vào, chỉ để xem đứa bé trông thế nào. Bà kéo rèm lại, không nói một câu.', k: 'info', f: 'Người phàm tin Yêu Tinh hay đổi con mình lấy con người. Kéo sắt mở hình chữ thập treo trên nôi là để giữ con.' }; } },
    { id: 'fae_food', st: AD, c: S => G.raceHome(S), w: 1.5, run(S, X) { X.add('so', 3); X.add('h', 2);
        return { t: 'Một cậu chăn dê loài người lạc vào trảng, đói lả, môi khô nứt. Bạn đã chìa chiếc bánh mật ra thì sực nhớ: người phàm ăn đồ của tiên thì không về được nữa. Bạn rụt tay lại, dắt cậu đi mãi ra tận bìa trảng, tới chỗ nghe được tiếng chuông dê của cậu, rồi mới đưa bánh. Cậu ăn ngấu nghiến, vừa ăn vừa ngoái lại nhìn khu rừng như không tin mình vừa ở trong ấy.', k: 'good' }; } },
    { id: 'fae_water', st: AD, rep: true, gap: 6, c: stranger, w: 1.2, run(S, X) { X.money(-Math.round(med(S, X) * .15)); X.add('h', -3);
        return { t: 'Tên trộm giật túi tiền của bạn giữa chợ rồi chạy. Bạn đuổi theo tới bờ suối thì phải đứng khựng lại: Yêu Tinh không bước qua được nước chảy. Hắn lội sang bờ bên kia, quay lại giơ túi tiền của bạn lên mà cười. Bạn đứng nhìn dòng nước, nghe tiếng cười của hắn xa dần.', k: 'bad' }; } }
  ]);
  add('merfolk', [
    // Nix của truyện German: lên bờ đi lẫn với người, chỉ có vạt áo lúc nào cũng ướt.
    { id: 'mer_wethem', st: AD, rep: true, gap: 6, c: S => stranger(S) && isTown(S), w: 1.3, tree: { theme: 'stranger' }, run(S, X) { X.add('h', -3); X.add('so', -2);
        return { t: `Người ở ${homeName(S, X)} bắt đầu để ý vạt áo bạn lúc nào cũng ướt, kể cả giữa trưa nắng gắt, đi tới đâu cũng để lại một vệt nước trên đá. Lũ trẻ chạy theo sau chỉ trỏ. Một bà cụ đứng ở cửa làm dấu khi bạn đi qua, rồi đóng cửa lại. Bạn rảo bước, vắt vạt áo, mà nó vẫn ướt.`, k: 'bad' }; } },
    { id: 'mer_tidesong', st: AD, rep: true, gap: 4, c: S => seaSide(S) && kin(S), w: 1.5, run(S, X) { X.gain('Arcane', 2); X.add('so', 3);
        return { t: 'Đêm nước lớn, cả đàn nổi lên ngoài rạn, hát cho con nước dâng. Trăng in trên mặt biển, sóng vỗ vào đá như giữ nhịp. Đêm ấy giọng bạn hòa trọn vào giọng các bà mẹ đàn, không lạc một nốt. Bà mẹ già nhất quay sang nhìn bạn, gật đầu một cái, rồi lại hát tiếp.', k: 'good' }; } }
  ]);
  add('dragonkin', [
    // Dragonborn của D&D: anh chị em cùng lứa trứng đặt cho nhau tên lúc nhỏ; khi kết đôi, hai thị tộc thương lượng chia trứng.
    { id: 'drg_clutch', st: ['child'], w: 3.5, run(S, X) {
        const n = X.pick(['Đuôi Cháy', 'Hắt Hơi Lửa', 'Vảy Ngược', 'Cắn Đá', 'Ngủ Muộn']); S.flags.clutchName = n; X.add('so', 3);
        return { t: `Lũ cùng lứa trứng gọi bạn là "${n}", gọi xong lại lăn ra cười. Bạn giận, cắn đứa to nhất một cái, nhưng cái tên thì đã dính. Người ngoài không được gọi cái tên ấy. Người cùng lứa thì gọi tới già.`, k: 'info', f: 'Tên Long Nhân có ba phần: tên riêng, tên thị tộc, và tên lúc nhỏ do anh chị em cùng lứa đặt.' }; } },
    { id: 'drg_clutch_split', st: ['adult'], c: S => !!S.family.spouse && S.family.spouse.alive && S.family.spouse.race === 'dragonkin' && !S.flags.clutchSplit, w: 3, run(S, X) {
        S.flags.clutchSplit = true; X.add('so', 4); X.add('h', 3);
        return { t: `Lứa trứng đầu của bạn và ${first(S.family.spouse.name)} nằm trong hang ấm, vỏ hồng lên dưới ánh lửa. Hai thị tộc ngồi ở đài lửa ba ngày liền để chia: quả nào mang tên bên nào, quả nào làm của hồi môn. Hai người làm cha mẹ thì ngồi ngoài cửa hang, không được vào bàn. Đêm thứ ba, bạn với ${first(S.family.spouse.name)} lén vào xoay trứng cho đều hơi ấm, khẽ khàng như sợ chúng nghe thấy người lớn cãi nhau.`, k: 'info' }; } }
  ]);
  add('construct', [
    // Warforged của Eberron: không ngủ, nghỉ trong trạng thái bất động mà vẫn nghe, vẫn thấy.
    { id: 'cst_sentry', st: AD, rep: true, gap: 5, w: 1.4, run(S, X) { X.add('sm', 3);
        if (X.chance(.4)) { const g = Math.round(med(S, X) * .2); X.money(g); return { t: `Bạn nghỉ đêm ở góc kho, bất động, không một tiếng động. Hai tay buôn tưởng bạn đã tắt nên bàn chuyện giấu hàng ngay bên cạnh, tiếng thì thầm rõ từng chữ. Sáng ra bạn đem chuyện ấy bán lại cho chủ kho, được ${G.coin(g)}.`, k: 'good' }; }
        return { t: 'Bạn nghỉ đêm ở góc phòng, bất động. Cả nhà tưởng bạn đã tắt, kéo ghế lại gần lò sưởi, kể chuyện của nhau tới khuya: món nợ giấu vợ, mối tình hồi trẻ, đứa con không chịu về. Bạn nghe hết. Bạn giữ hết, chưa từng nhắc lại với ai.', k: 'info' }; } },
    { id: 'cst_ledger', st: AD, c: S => stranger(S) && !G.lawHere(S, 'construct_citizen') && isTown(S), w: 1.5, tree: { theme: 'stranger' }, run(S, X) { X.add('h', -6); X.add('so', -2);
        return { t: `Viên thư lại ở ${homeName(S, X)} ghi bạn vào sổ tài sản của xưởng, không vào sổ dân. Bạn hỏi lại. Ông ta nhắc lại, chậm hơn, rõ từng chữ, như nói với một cái máy. Ngòi bút cứ thế chạy sang dòng dưới, dòng ghi một cái đe và hai cái bễ.`, k: 'bad' }; } }
  ]);
  add('human', [
    { id: 'hum_parents_age', st: ['adult'], c: S => S.family.parents.some(p => p.alive && p.age >= 55), w: 1.5, run(S, X) { X.add('h', -2); X.add('so', 2);
        const p = S.family.parents.find(q => q.alive && q.age >= 55), who = p ? p.role : 'mẹ';
        return { t: `Về thăm nhà, bạn thấy tóc ${who} đã bạc trắng từ lúc nào không hay. Mâm cơm vẫn dọn đúng chỗ cũ, nồi canh vẫn mặn như hồi bạn còn nhỏ, chỉ có cái lưng ngồi bên mâm là còng xuống một chút. Ở loài người, mười năm đủ để một người đổi khác. Lúc về, bạn đứng ở đầu ngõ ngoái lại hai lần.`, k: 'info' }; } },
    { id: 'hum_guild', st: ['teen', 'adult'], c: S => isTown(S) && !S.flags.humGuild, w: 1.2, run(S, X) { S.flags.humGuild = true; X.add('so', 3);
        return { t: `Phường thợ ở ${homeName(S, X)} họp đầu năm. Ông trùm phường đứng trên bục gỗ đọc tên từng người học việc mới, mỗi tên một tiếng chuông. Tới tên bạn, bạn bước lên nhận dải vải màu của phường, tay hơi run. Loài người không sống đủ lâu để giữ nghề một mình, nên giữ bằng phường.`, k: 'info' }; } }
  ]);

  // ═════════ 2. Tín ngưỡng gốc ═════════
  // Gắn với đạo đang theo (S.faith), không gắn với tộc: người cải đạo cũng gặp. Trang duyệt xếp theo tộc gốc của đạo.
  const FAITH_EV = G.FAITH_EV = {};
  const addF = (faith, list) => { for (const e of list) { const c0 = e.c; e.c = c0 ? (S, X) => S.faith === faith && c0(S, X) : S => S.faith === faith; e.c.toString = () => (c0 || (() => true)).toString();
      e.tree = Object.assign({ body: 'living', theme: 'faith' }, e.tree || {}); e.faith = faith; EV.push(e); OWN.add(e.id); (FAITH_EV[faith] = FAITH_EV[faith] || []).push(e.id); } };
  addF('stone', [
    { id: 'fs_stone_oath', st: ['teen'], w: 4, tree: { theme: null }, run(S, X) { dev(S, 6); X.add('so', 3); S.flags.stoneOath = true;
        return { t: 'Bạn đặt tay lên Đá Thề ở đại sảnh, mặt đá lạnh và nhẵn bóng vì bao đời bàn tay. Giọng bạn vang lên trong vòm đá, nhỏ hơn bạn tưởng: không bỏ lò, không bỏ nợ, không bỏ người cùng hầm. Đá không nói gì. Tổ tiên ngủ trong đá thì nghe, và từ nay họ sẽ nhớ.', k: 'big', f: 'Lời thề trên Đá Thề không rút lại được. Ai phá thề thì tên bị đục khỏi vách.' }; } },
    { id: 'fs_stone_names', st: AD, rep: true, gap: 5, w: 1.8, run(S, X) { dev(S, 6); X.add('so', 2); X.add('h', 2);
        return { t: 'Ngày Đọc Vách, cả thị tộc đứng trước vách đại sảnh, đèn dầu đặt dọc chân tường. Người già nhất đọc to từng cái tên khắc trên đá, từ đời tổ tới năm ngoái, giọng khàn dần theo từng hàng. Có những cái tên cả sảnh cùng đọc theo. Đọc tới sáng mới hết, và năm nào bạn cũng thức tới cái tên cuối cùng.', k: 'good' }; } },
    { id: 'fs_stone_tomb', st: AD, c: S => !!parentDead(S) && !S.flags.stoneTomb, w: 3, run(S, X) { const p = parentDead(S); S.flags.stoneTomb = true; dev(S, 8); X.add('h', -2);
        return { t: `Bạn cùng thợ khắc của thị tộc đục một hốc trong vách đá cho ${p.role} bạn. Ba ngày liền, bụi đá bám trắng tóc hai người. Bạn đặt cây búa lên ngực ${p.role}, rồi tự tay xây kín lại từng viên. Tên ${p.role} được khắc ngay ngắn dưới tên ông bà, nét còn mới, sáng hơn mọi nét quanh nó.`, k: 'info' }; } }
  ]);
  addF('ancestor', [
    { id: 'fs_anc_bones', st: AD, rep: true, gap: 4, w: 1.6, run(S, X) { dev(S, 5); X.gain('Spirit', 2);
        return { t: 'Trước mùa săn, bạn đặt một chiếc xương vai cừu lên lửa, chờ nó nứt. Xương kêu lách tách, khói khét lẹt. Bạn cầm lên đọc vết nứt, hỏi tổ tiên nên đi về hướng nào. Vết nứt chỉ về phía gò đá, và bạn đi về phía gò đá, không hỏi lại.', k: 'info' }; } },
    { id: 'fs_anc_wind', st: AD, rep: true, gap: 6, w: 1.2, run(S, X) { dev(S, 6); X.add('sm', 2);
        return { t: 'Đêm gió lớn, cả trại tắt lửa, ngồi im trong bóng tối nghe tổ tiên đi qua thảo nguyên. Gió lùa qua cột cờ, xương treo trên đó gõ vào nhau. Có ai đó gọi tên bạn trong gió, giọng giống ông nội. Bạn không đáp, chỉ ngồi yên tới khi gió lặng.', k: 'info' }; } }
  ]);
  addF('totem', [
    { id: 'fs_totem_dream', st: ['teen'], w: 4, tree: { theme: null }, run(S, X) { const a = X.pick(['sói xám', 'báo đốm', 'gấu nâu', 'cáo đỏ', 'linh miêu']); S.flags.totemBeast = a; dev(S, 6); X.add('so', 3);
        return { t: `Đêm thứ ba ngủ dưới cột totem, bạn mơ thấy một con ${a} đi trước mình qua rừng. Nó không quay đầu lại, nhưng mỗi lần bạn chậm chân, nó dừng chờ. Sáng ra nghe bạn kể, người giữ totem lặng đi một lúc rồi bảo đó là thú tổ của bạn. Từ nay bạn không được săn loài ấy, gặp nó trong rừng thì phải tránh đường.`, k: 'big' }; } },
    { id: 'fs_totem_share', st: AD, rep: true, gap: 4, w: 1.8, run(S, X) { dev(S, 5); X.add('so', 3);
        return { t: 'Lễ chia mồi dưới trăng. Miếng đầu tiên của mỗi con mồi đặt dưới chân cột totem cho thú tổ, miếng thứ hai cho con non, rồi người săn mới được ăn. Bạn ngồi chờ tới lượt, bụng sôi, mùi thịt nướng quyện trong khói. Không ai ăn trước lượt mình: ăn một mình là phụ bầy.', k: 'good' }; } }
  ]);
  addF('season', [
    { id: 'fs_season_turn', st: ['child'], w: 4, tree: { theme: null }, run(S, X) { dev(S, 5); X.add('h', 4);
        return { t: 'Lễ đổi mùa đầu đời của bạn. Một Yêu Tinh già buộc sợi chỉ bạc lên cổ tay bạn, ngón tay bà lạnh như sương sớm. Khế ước đầu tiên: mùa xuân cho bạn đôi cánh, đổi lại tiếng khóc lúc mới sinh của bạn. Bạn nhìn sợi chỉ, rồi nhìn bà, không biết mình vừa được lời hay bị lỗ.', k: 'big' }; } },
    { id: 'fs_season_due', st: AD, rep: true, gap: 6, w: 1.6, run(S, X) { const w = X.pick(['một ký ức về mẹ', 'giọng hát của bạn trong một mùa', 'một năm tuổi']); dev(S, 6); X.gain('Arcane', 3); X.add('sm', -2);
        return { t: `Cuối mùa, mùa tới đòi lại phần của nó. Lần này là ${w}. Bạn trả đủ, không mặc cả, vì khế ước với đất không có chỗ cho mặc cả. Mùa sau, hoa trong trảng nở dày hơn ở chỗ bạn từng đứng.`, k: 'info' }; } }
  ]);
  addF('flame', [
    { id: 'fs_flame_watch', st: ['teen', 'adult'], rep: true, gap: 5, w: 1.8, run(S, X) { dev(S, 6); X.gain('Fire', 2);
        return { t: 'Đến lượt bạn giữ lửa trên đài của thị tộc. Cả đêm ngồi bên ngọn lửa, mặt nóng rát mà lưng lạnh buốt vì gió núi. Mỗi khi gió lên, bạn cúi xuống thở vào lửa cho nó đứng lại. Tổ tiên thở cùng bạn, chậm và sâu, tới khi trời rạng.', k: 'good' }; } },
    { id: 'fs_flame_out', st: AD, c: S => !S.flags.flameOut, w: 1.2, run(S, X) { S.flags.flameOut = true; dev(S, 10); X.add('hl', -5); S.fame += 2;
        return { t: 'Bão đá ập xuống, và lửa đài tắt lần đầu sau hai trăm năm. Cả thị tộc đứng quanh đống tro còn bốc khói, không ai dám nói. Bạn cùng các bô lão leo lên miệng núi lửa, ôm một hòn than từ dưới lòng núi về, bỏng tới khuỷu tay. Đài lửa sáng lại trước bình minh. Về sau, người trong thị tộc thấy vết bỏng trên tay bạn là cúi đầu.', k: 'big' }; } }
  ]);
  addF('wild', [
    { id: 'fs_wild_grave', st: AD, c: S => !!parentDead(S) && !S.flags.wildGrave, w: 3, run(S, X) { const p = parentDead(S); S.flags.wildGrave = true; dev(S, 8); X.add('h', -2);
        return { t: `Bạn chôn ${p.role} dưới gốc rừng, đất còn ẩm mùi lá mục, rồi trồng lên đó một cây sồi non. Theo đạo, người chết về với rễ. Ai muốn nói chuyện với ${p.role} bạn thì ra ngồi dưới cây. Mùa đầu cây ra được ba chiếc lá, chiều nào bạn cũng ra đếm lại.`, k: 'info' }; } },
    { id: 'fs_wild_wake', st: AD, rep: true, gap: 5, w: 1.5, run(S, X) { dev(S, 5); X.gain('Taming', 2); X.add('h', 2);
        return { t: 'Lễ đánh thức rừng đầu xuân. Cả làng đi chân trần trên đất còn lạnh, gõ gậy vào thân từng cây già, gọi tên nó, gọi nó dậy. Tiếng gậy vang khắp rừng như tiếng gõ cửa. Tới chiều, trên cành sồi già nhất nhú lên chồi đầu tiên, nhỏ bằng móng tay.', k: 'good' }; } }
  ]);
  addF('deep', [
    { id: 'fs_deep_voice', st: AD, rep: true, gap: 6, w: 1.4, run(S, X) { dev(S, 7); X.gain('Soul', 2); X.add('sm', -2);
        return { t: 'Bạn lặn quá tầng nước tối, xuống tới chỗ không còn cá, không còn ánh sáng. Từ dưới sâu có giọng gọi bạn bằng tên thật, cái tên chưa ai từng nói ra. Giọng ấy không vội, kiên nhẫn như con nước. Bạn trồi lên, nằm ngửa trên mặt sóng thở dốc, và mấy đêm liền không ngủ được.', k: 'info' }; } },
    { id: 'fs_deep_gift', st: AD, rep: true, gap: 5, c: seaSide, w: 1.4, run(S, X) { dev(S, 5); X.money(-Math.round(med(S, X) * .1));
        return { t: 'Đêm không trăng, bạn chèo thuyền ra chỗ biển đổi màu, nơi nước đen đặc như mực. Bạn thả xuống một chiếc vòng ngọc trai, nhìn nó chìm, lóe sáng một chút rồi tắt. Không có gì nổi lên. Theo đạo, như thế là vực đã nhận.', k: 'info' }; } }
  ]);
  addF('forge', [
    { id: 'fs_forge_part', st: AD, rep: true, gap: 8, c: S => (S.devotion || 0) >= 25, w: 1.4, run(S, X) { dev(S, 8); X.add('hl', 5); X.gain('Engineering', 3); X.add('sm', -2);
        return { t: G.RACES[S.race].construct ? 'Tư tế lò rèn thay cho bạn một khớp vai bằng thép rèn trong lễ, tiếng búa gõ đều từ sáng tới chiều. Khớp mới xoay êm, không kêu một tiếng. Vậy mà mấy đêm đầu bạn cứ xoay vai, chờ nghe tiếng rít quen của khớp cũ. Bạn nhớ nó hơn bạn tưởng.' : 'Tư tế lò rèn thay ngón tay bạn mất ở xưởng bằng một ngón đồng có khớp. Lúc đầu nó lạnh ngắt, cầm bát nước nóng cũng không biết nóng. Tới mùa sau thì nó ấm như ngón thật. Có hôm bạn quên mất, đưa tay gãi đầu, nghe tiếng đồng sột soạt trong tóc.', k: 'info' }; } },
    { id: 'fs_forge_hymn', st: AD, rep: true, gap: 5, w: 1.4, run(S, X) { dev(S, 5); X.add('so', 2);
        return { t: 'Ngày lễ của Lò Rèn, cả xưởng gõ búa cùng một nhịp từ sáng tới tối. Không ai nói, chỉ có tiếng búa đều như tim đập; đó là bài kinh của đạo. Tới chiều, bạn không còn nghe ra tiếng búa của mình giữa tiếng búa chung. Tối về, tai vẫn còn ù như đang ở xưởng.', k: 'good' }; } }
  ]);
  addF('light', [
    { id: 'fs_light_vigil', st: ['teen'], w: 2.5, tree: { theme: null }, run(S, X) { dev(S, 6); X.add('h', 3);
        return { t: 'Đêm trước lễ thêm sức, bạn quỳ trong đền tới sáng, hai tay ôm một ngọn nến không được để tắt. Gió lùa qua khe cửa, ngọn lửa chao nghiêng; bạn khum tay che, sáp nóng chảy xuống ngón tay. Đầu gối tê dần rồi mất cảm giác. Lúc mặt trời lên, vị tu sĩ cúi xuống thổi tắt nến giúp bạn, rồi nhẹ nhàng gỡ tay bạn ra.', k: 'good' }; } },
    { id: 'fs_light_alms', st: AD, rep: true, gap: 5, w: 1.3, run(S, X) { dev(S, 6); X.add('so', 3); X.money(-Math.round(med(S, X) * .08));
        return { t: 'Ngày lễ Quang Minh, bạn cùng người trong đền phát bánh cho người nghèo ở cổng thành từ sáng tới trưa. Hàng người dài tới tận chân tường, có đứa trẻ quay lại xếp hàng lần thứ hai. Bạn vẫn đưa bánh cho nó. Trưa về, hai bàn tay còn thơm mùi bột.', k: 'good' }; } }
  ]);
  addF('dark', [
    { id: 'fs_dark_debt', st: AD, rep: true, gap: 6, w: 1.3, run(S, X) { dev(S, 6); X.add('hl', -5);
        return { t: 'Một món nợ của giao kèo tới hạn. Bạn xuống hầm tế tối om, rạch tay, trả bằng máu, đúng một chén, không hơn không kém. Không ai ghi gì vào sổ. Hắc Giáo không cần sổ: nó nhớ, và rồi nó sẽ còn quay lại.', k: 'info' }; } }
  ]);

  // ═════════ 3. Giọng theo giống loài: thêm chín sự kiện chung ═════════
  const KID = {
    dwarf: n => `${n} lẻn vào lò chung, đòi được kéo bễ như người lớn. Hai tay nó nắm chặt quai bễ, mặt đỏ gay, kéo được vài nhát đã thở hồng hộc. Bạn để mặc nó, không bảo về. Tối ấy nó ngủ gục bên đe, mặt lem nhem muội than, tay vẫn chưa chịu buông quai bễ.`,
    orc: n => `${n} vật ngã con trai tù trưởng ở hội tộc, ngay trước mặt cả trại. Thằng bé kia lồm cồm bò dậy, mặt dính đầy bùn, còn ${n} thì đứng chống nạnh. Cả trại cười ồ, tù trưởng cũng cười. Về lều, bạn lén gắp cho nó miếng thịt to nhất nồi.`,
    elf: n => `${n} ngồi cả buổi dưới gốc sồi, im như một hòn đá. Tới chiều nó chạy về, mắt sáng rỡ, bảo bạn là cây vừa nói chuyện với nó. Bạn hỏi cây nói gì. Nó nghĩ một lúc rồi lắc đầu: cây dặn không được kể.`,
    beastfolk: n => `${n} săn được con thỏ đầu tiên. Nó tha về, đặt ngay ngắn trước cửa hang cho bạn, rồi lùi lại ngồi chờ, đuôi quét qua quét lại trên đất. Bạn cúi xuống ngửi con thỏ thật lâu, như người ta ngắm một món quà quý. Cả tối hôm ấy nó không chịu ngồi yên.`,
    fae: n => `${n} đổi cái tên ở nhà của nó lấy một con đom đóm. Bạn mất nửa tháng lần khắp các trảng mới tìm ra kẻ đã nhận cái tên, rồi mặc cả đòi lại. Trong nửa tháng ấy, gọi thế nào nó cũng không quay đầu. Con đom đóm thì nó vẫn giữ trong một vỏ ốc, đêm nào cũng mang ra ngắm.`,
    merfolk: n => `${n} lặn ra rạn ngoài một mình, chỗ người lớn còn ngại. Bạn đứng trên đá chờ, đếm từng con sóng. Lúc nó nổi lên, tay ôm một con sao biển to bằng cái mâm, miệng cười toe toét. Bạn mắng nó một trận, rồi đem con sao biển treo lên vách nhà.`,
    dragonkin: n => `${n} thổi được đốm lửa đầu tiên, làm sém râu ông nội. Mùi khét lan khắp hang. Ông vuốt chòm râu cháy xém, im lặng một lúc lâu, rồi phá lên cười tới ho sặc sụa. Cả thị tộc nhắc chuyện ấy suốt mùa đông.`
  };
  const BRAWL = {
    dwarf: ['Một gã ở bàn bên chê râu bạn thưa như râu dê, cả quán rượu cười. Bạn đặt vại xuống, chậm rãi, rồi lật bàn. Đêm ấy bạn mất một chiếc răng. Đổi lại, bạn được một người bạn: kẻ duy nhất trong quán đã nhảy vào đứng cùng phía với bạn.', 'Ở đại sảnh, hai họ cãi nhau xem lò nhà ai giữ lửa lâu hơn. Lời qua tiếng lại một hồi thì bàn bị lật, vại bay khắp sảnh, rượu chảy lênh láng trên nền đá. Bạn về với một bên mắt tím bầm. Sáng hôm sau, chính người đánh bạn mang sang một vại rượu, bảo là mời.'],
    orc: ['Bạn vật nhau với một gã trại bên tới khi cả hai cùng nằm vật xuống bùn, thở không ra hơi. Không ai thắng, cũng không ai chịu thua. Sáng ra hai người ngồi chung bên đống lửa, chuyền tay nhau một sừng rượu sữa ngựa. Gã bảo lần sau sẽ vật cho bạn nằm luôn; bạn bảo cứ thử.', 'Một gã trại bên chê con sói của bạn còi, nói thật to cho cả hội tộc nghe. Hai người vật nhau giữa vòng người, bụi bay mù mịt, sói hai bên tru lên. Tới khi bị đè úp mặt xuống đất, gã mới chịu nhận con sói của bạn to hơn. Lũ trẻ trong trại còn nhại câu ấy suốt mấy ngày.'],
    beastfolk: 'Hai bầy tranh nhau một vũng nước giữa mùa khô. Bạn lao vào vật con đầu của bầy bên, hai thân hình lăn tròn trên lớp bùn nứt nẻ. Bạn mất một miếng tai. Lúc quay về, cả bầy mình xúm lại vỗ lưng bạn, có đứa còn liếm vết thương cho bạn.',
    dragonkin: 'Ẩu đả ở quán rượu: một gã say gọi bạn là "thằn lằn". Bạn không đáp, chỉ khịt mũi một cái. Tới khi người ta kéo được hai bên ra, bạn mất một chiếc vảy, còn quán mất một cái bàn cháy đen. Chủ quán vừa dập lửa vừa chửi cả hai.'
  };
  // Người bạn mà story.js (tn_brawl) vừa thêm: giữ lại tên trong bản theo tộc. n = tên.
  const FRIEND = {
    dwarf: n => ` Người ấy tên ${n}. Hai người ngồi dựa lưng vào vách, chia nhau vại rượu, cười tới đau cả quai hàm. Lúc chia tay, ${n} dặn lần sau có đánh nhau thì nhớ gọi.`,
    orc: n => ` Gã ấy tên ${n}. Từ hôm đó, hội tộc nào ${n} cũng tìm tới lều bạn trước tiên, mang theo một sừng rượu và một lời thách mới.`,
    beastfolk: n => ` Đứa liếm vết thương cho bạn đêm ấy tên ${n}. Từ đó, đêm săn nào ${n} cũng chạy sát bên vai bạn.`,
    dragonkin: n => ` Kẻ đứng cùng phía với bạn hôm ấy tên ${n}. Hai người ngồi lại uống tới khuya, vảy còn khét mùi khói. Lúc chia tay, ${n} dặn lần sau có đánh nhau thì nhớ gọi.`
  };
  const SUITOR = {
    dwarf: n => `Bạn hay gặp ${n} bên lò chung, mỗi người một đầu bễ. ${n} kéo bễ đều tay, chưa bao giờ để lửa xuống. Mấy lần bạn định mở lời rồi lại thôi. Theo lệ, muốn ngỏ lời thì phải tự rèn một chiếc trâm cài râu, và bạn bắt đầu để dành những mẩu bạc vụn.`,
    orc: n => `${n} vật ngã bạn ở hội tộc, rồi chìa tay kéo bạn dậy, bàn tay chai sạn mà ấm. Cả trại hò reo. Mùa ấy, bạn hay kiếm cớ ghé lều nhà ${n}: khi thì trả cái giáo mượn, khi thì mang sang một xâu thịt khô. Ai trong trại cũng biết, chỉ có hai người là làm như không.`,
    elf: n => `Bạn hay gặp ${n} dưới tán Cây Mẹ vào những chiều có nắng. Hai người có thể ngồi cả buổi mà không ai cần nói gì, chỉ nghe lá reo. Có hôm ${n} cài lên tóc bạn một chiếc lá vàng rồi đi mất. Bạn ép chiếc lá ấy trong sách, giữ tới khi nó khô giòn.`,
    beastfolk: n => `Bạn hay chạy cùng ${n} trong những đêm săn, vai kề vai, nhịp thở khớp vào nhau. Săn xong, hai người nằm ngửa trên đồi cỏ nhìn trăng, không ai muốn về hang trước. Mùi của ${n} vương trên áo bạn tới tận sáng hôm sau. Cả bầy bắt đầu nhìn hai người mà nhe răng cười.`,
    fae: n => `Sáng nào trước cửa nhà bạn cũng có một bông hoa lạ, sương còn đọng trên cánh, không ký tên. Bạn đem từng bông đi hỏi khắp trảng, không ai nhận. Cho tới một hôm bạn nhận ra mùi hoa giống mùi tóc ${n}. Sáng hôm sau, bạn để lại trước cửa nhà ${n} một bông hoa khác.`,
    merfolk: n => `Bạn hay bơi cùng ${n} ra rạn ngoài lúc con nước ròng, khi đá ngầm nhô lên khỏi mặt biển. Hai người ngồi trên đá phơi vảy, nhìn những đàn cá nhỏ lướt qua dưới chân. ${n} chỉ cho bạn một hang san hô không ai biết. Từ đó, cứ nước ròng là bạn lại nhìn ra phía rạn.`,
    dragonkin: n => `Bạn hay gặp ${n} trên đài lửa trong những đêm giữ lửa. Hai người ngồi hai bên ngọn lửa, lâu lâu mới nói với nhau một câu. Có đêm gió lớn, ${n} vòng tay che lửa giúp bạn, vai chạm vai, vảy ấm như đá phơi nắng. Từ đó tới phiên giữ lửa, bạn hay đến sớm hơn giờ.`
  };
  const INHERIT = {
    dwarf: c => `Một ông chú họ xa ở hầm khác mất, để lại cho bạn ${c} và cây búa của ông. Thị tộc cử người mang tới tận cửa, gói trong tấm da dầu, kèm một mảnh đá phiến khắc tên ông. Bạn chưa từng gặp ông lần nào. Cầm cây búa lên, bạn thấy cán đã mòn đúng chỗ tay mình đặt vào.`,
    orc: c => `Một người cùng máu chết trong trận săn. Theo lệ trại, của cải của người chết chia cho người cùng máu, ngay bên giàn thiêu, trước mặt bà đồng. Bạn đưa cả hai tay ra nhận phần mình: ${c}. Đêm ấy bạn buộc thêm một sợi dây đỏ lên cán rìu.`,
    dragonkin: c => `Một cụ cố trong thị tộc mất, để lại cho bạn ${c} từ kho riêng. Cả thị tộc kéo tới đứng xem bạn nhận, người già gật gù, người trẻ thì thầm. Bạn mới gặp cụ đôi ba lần, lần nào cụ cũng ngủ gật bên đài lửa. Không ai hiểu vì sao cụ lại nhớ tới bạn.`,
    construct: c => `Một Cơ Nhân cùng xưởng ngừng quay, để lại cho bạn ${c} và hộp phụ tùng của nó. Trong hộp, từng con ốc được xếp theo cỡ, lau sạch dầu. Dưới đáy có một tấm thẻ đồng khắc số hiệu của bạn. Bạn không biết nó đã chọn bạn từ bao giờ.`,
    elf: c => `Một người bà con xa của bạn đã đi về phía tây, để lại ${c} và một cây cung không ai kéo nổi. Dây cung bện bằng tóc, gỗ đã ngả màu mật. Người mang tới chỉ nói: người ấy dặn đưa cho bạn. Bạn treo cây cung lên vách, thỉnh thoảng lại thử kéo, dây vẫn không nhúc nhích.`
  };
  const COIN = {
    dwarf: 'Trong đường hầm bỏ hoang, ánh đèn của bạn quét qua một khe đá và lóe lên. Mấy đồng bạc cũ kẹt ở đó, phủ một lớp bụi đá dày. Bạn cạy chúng ra bằng móng tay, lau vào vạt áo, rồi giấu dưới gối suốt mấy tháng liền không nói với ai.',
    orc: 'Bên đường cái có một xác lính nằm úp mặt, quạ đã tới trước bạn. Bạn lục túi hắn, thấy mấy đồng bạc dính máu khô. Bạn chà chúng xuống cát cho sạch rồi mới dám nhét vào thắt lưng.',
    elf: 'Trong hốc một cây sồi rỗng có mấy đồng bạc cũ, không biết của ai giấu từ đời nào. Mặt đồng tiền đã mòn nhẵn, hình khắc chỉ còn là một vệt mờ. Bạn ngồi dưới gốc cây cả buổi, đoán xem người giấu nó là ai và vì sao không quay lại lấy.',
    beastfolk: 'Bạn đánh hơi thấy chỗ con cáo hay chôn đồ dưới gốc cây, bới thử thì đất lạo xạo tiếng kim loại. Mấy đồng bạc nằm lẫn giữa xương gà và vỏ trứng. Bạn mang về, mùi cáo còn ám trên tay suốt hai ngày.',
    fae: 'Một gã say ngồi bên bờ suối, đòi đánh đố với bất cứ ai đi ngang. Bạn đưa ra một câu đố, hắn vò đầu bứt tai tới khi trăng lên mà vẫn không giải nổi. Mấy đồng bạc của hắn về tay bạn. Tới giờ bạn vẫn chưa nói cho hắn biết lời giải.',
    merfolk: 'Dưới đáy vịnh có xác một con tàu đắm, lũ trẻ trong đàn vẫn dọa nhau là có ma. Bạn lặn xuống một mình, luồn qua khoang tàu tối om, nhặt được mấy đồng bạc nằm lẫn trong cát. Lên tới mặt nước bạn mới thấy tim mình đập thình thịch.',
    dragonkin: 'Trong ổ đá cạnh hang ấp, bạn bới được mấy đồng bạc, chắc ai đó giấu từ lâu. Đá quanh đấy còn ấm hơi lửa. Bạn đếm đi đếm lại, rồi giấu chúng vào một hốc đá khác mà chỉ mình bạn biết.',
    construct: 'Ở phế xưởng có một cỗ máy hỏng nằm nghiêng, vỏ đã han gỉ. Bạn tháo nắp bụng nó ra, thấy mấy đồng bạc kẹt giữa các bánh răng. Không ai biết chúng vào đó bằng cách nào, kể cả bạn.'
  };
  const DICE = {
    dwarf: ['Ở đại sảnh, hai người cược xem ai uống cạn vại trước. Bạn ngửa cổ dốc một hơi, bọt bia chảy ròng xuống râu, đặt vại xuống trước đối thủ nửa nhịp. Cả bàn đập tay xuống mặt gỗ mà reo. Bạn thắng', 'Ở đại sảnh, hai người cược xem ai uống cạn vại trước. Tới ngụm thứ ba thì bạn sặc, bia trào cả ra đằng mũi, cả bàn cười nghiêng ngả. Đối thủ đặt vại rỗng xuống, lau râu, chìa tay ra. Bạn thua'],
    orc: ['Hội tộc mở vòng vật, người ta cược bằng tiền, bằng da, bằng cả răng thú. Bạn dồn hết vào gã to con nhất trại bên, và gã quật đối thủ xuống bùn ngay hiệp đầu. Bạn thắng', 'Hội tộc mở vòng vật, người ta cược bằng tiền, bằng da, bằng cả răng thú. Bạn dồn hết vào gã to con nhất trại bên, nhưng gã trượt chân ngay hiệp đầu, nằm sóng soài trong bùn. Bạn thua'],
    beastfolk: ['Cả bầy đặt cược vào cuộc đua quanh bãi săn. Bạn chọn đứa gầy nhất, chân dài nhất, ai cũng cười bạn. Nó về trước cả một thân người, lưỡi thè ra, mắt sáng rực. Bạn thắng', 'Cả bầy đặt cược vào cuộc đua quanh bãi săn. Bạn chọn đứa to khỏe nhất, ai nhìn cũng tưởng chắc ăn. Tới khúc quanh cuối, nó vấp rễ cây, ngã lăn ra cỏ. Bạn thua'],
    dragonkin: ['Trên đài lửa, đám thanh niên cược xem ai thổi lửa xa hơn. Bạn hít một hơi căng lồng ngực, thổi một luồng lửa vượt qua hòn đá đánh dấu của mọi người. Khói còn vương trên mép, bạn chìa tay đòi tiền. Bạn thắng', 'Trên đài lửa, đám thanh niên cược xem ai thổi lửa xa hơn. Bạn hít một hơi căng lồng ngực, nhưng đúng lúc ấy lại nấc, chỉ phụt ra một cụm khói đen. Cả đài lửa cười rộ. Bạn thua']
  };
  const TAX = {
    dwarf: c => `Hội đồng thị tộc thu phần cho lò chung và tường cổng. Người thu đặt cái cân đồng lên bàn đá, cân từng đồng, không thiếu không thừa. Bạn nộp ${c}. Mùa đông năm ấy, lửa lò chung không tắt đêm nào.`,
    orc: c => `Tù trưởng thu phần của trại cho mùa chiến. Người của ông đi từng lều, gõ cán giáo vào cột, không cần nói một câu. Bạn nộp ${c}, nhìn túi da của họ nặng dần qua mỗi lều.`,
    beastfolk: c => `Bầy thu phần cho con đầu đàn và cho những nhà có con non. Bạn đặt phần mình lên tảng đá giữa bãi: ${c}. Lũ con non ngồi xếp hàng bên cạnh, mắt tròn xoe nhìn theo từng đồng.`,
    dragonkin: c => `Thị tộc thu phần cho đài lửa và kho chung. Người giữ kho lấy than ghi tên bạn lên vách, ngay dưới tên cha ông bạn. Bạn nộp ${c}.`,
    fae: c => `Người của Đình tới thu phần cho hội mùa sau, đi chân trần, tay bưng một chiếc lá sen làm khay. Bạn đặt lên lá ${c}. Không trả thì mùa sau không có hoa, mà chẳng ai muốn nhà mình là nhà duy nhất trong trảng không có hoa.`
  };
  const BLESS = {
    stone: 'Bô lão thị tộc chấm tro lò chung lên trán bạn, tro còn ấm. Rồi ông đọc tên bảy đời tổ cho bạn nghe lần đầu, giọng trầm và chậm, dội vào vách đá. Bạn nằm im suốt từ tên đầu tới tên cuối. Cả họ bảo đứa này biết nghe.',
    totem: 'Người giữ totem nhỏ một giọt máu thú lên trán bạn, mùi tanh nồng lẫn mùi khói. Rồi người ấy bế bạn đi vòng quanh cột totem ba lần, cả bầy đứng quanh gầm gừ khe khẽ trong cổ họng. Tới vòng thứ ba thì bạn thôi khóc.',
    season: 'Một Yêu Tinh già buộc sợi chỉ bạc lên cổ tay bạn: lời chúc đầu đời, đổi lấy tiếng khóc đầu tiên. Bạn khóc thật to, và bà gật gù như vừa được trả đủ giá. Sợi chỉ ấy về sau mẹ cất trong một vỏ hạt dẻ, treo đầu giường.',
    flame: 'Ông nội nhấc bạn lên, hơ qua lửa đài ba lần. Lửa liếm quanh người bạn mà không sém một chiếc vảy. Cả thị tộc reo lên, tiếng reo vang khắp sườn núi. Ông cười tới mức khói phì ra đằng mũi.',
    ancestor: 'Bà đồng của trại thổi khói xương vào mặt bạn để tổ tiên nhận mặt đứa cháu mới. Khói cay xè, bạn hắt hơi liền ba cái. Bà đồng bảo vậy là tổ tiên đã chào lại. Cả trại cười ầm, mẹ bạn thì thở phào.',
    wild: 'Tu sĩ rừng đặt bạn nằm trên rễ cây già một đêm, cho rừng biết có thêm một đứa trẻ. Mẹ ngồi cách đó mười bước, không được chạm vào, chỉ được nhìn. Gần sáng, có tiếng gì đó đi ngang qua rồi lặng lẽ bỏ đi. Bạn vẫn ngủ ngon.',
    deep: 'Mẹ ôm bạn lặn xuống chỗ nước tối, sâu tới mức ánh sáng trên mặt biển chỉ còn là một chấm mờ. Hai mẹ con ở dưới đó tới khi bạn mở mắt ra mà không khóc. Lúc ngoi lên, mẹ hôn lên trán bạn, nước mắt lẫn vào nước biển.',
    forge: 'Tư tế lò rèn gõ búa ba lần lên đe cạnh nôi bạn, cho lò biết có thêm một người. Tiếng búa chát chúa, ai đứng gần cũng nhăn mặt. Riêng bạn mở mắt nhìn quanh như tìm xem tiếng ấy từ đâu ra.'
  };
  const FEAST = {
    stone: 'Ngày Mở Lò Tổ. Từ lò tổ sâu nhất trong núi, người ta chuyền tay nhau một hòn than đỏ, nhóm lại lửa cho từng lò chung trong cả nước. Than tới lò nào, lò ấy đọc tên tổ tiên của mình. Rồi tiệc mở, bia chảy tới sáng, tiếng hát dội khắp các đường hầm.',
    totem: 'Đêm Thú Tổ. Các bầy từ khắp nơi kéo về quanh cột totem lớn, bầy nào cũng mang theo con mồi tốt nhất của mình. Mồi chia dưới trăng, miếng đầu cho thú tổ, miếng sau cho con non. Rồi cả rừng cùng hú, tiếng hú nối nhau tới sáng, vọng sang tận mấy quả đồi.',
    season: 'Hội đổi mùa: cả nước ký lại khế ước với đất. Người ta mang tới trảng những gì mình đã hứa: một bài hát, một lọn tóc, một lời xin lỗi còn nợ. Ai có lời hứa chưa giữ thì phải giữ cho xong trước khi trăng lặn. Đêm ấy bạn nằm nhẩm lại những lời mình đã hứa, sợ sót mất một lời.',
    flame: 'Đêm Long Hỏa. Mọi đài lửa trong nước cùng cháy cao một lúc, đứng trên đỉnh núi này nhìn sang thấy đỉnh núi kia đỏ rực. Các thị tộc đọc tên tổ tiên từ thời còn có cánh, đọc tới khản cổ. Hơi nóng phả vào mặt bạn suốt đêm, sáng ra da mặt vẫn còn ấm.',
    ancestor: 'Lễ Gió Tổ. Các trại tắt hết lửa, ngồi trong bóng tối nghe gió ba đêm liền, không ai được nói to. Người ta bảo tổ tiên đang đi qua, ai nghe kỹ sẽ thấy tên mình trong gió. Sang đêm thứ tư, bò được mổ, lửa nhóm lại, cả trại mở tiệc mừng tổ tiên đã ghé.',
    wild: 'Lễ Rừng Già. Cả nước đi chân trần vào rừng thiêng, không ai được bẻ một cành, không ai được nói lớn. Rêu ẩm dưới chân, lá mục êm như thảm. Đi tới đâu người ta chạm tay vào thân cây tới đó, như chào một người già. Ra khỏi rừng, chân bạn lạnh cóng, mà bạn chưa muốn xỏ giày vào ngay.',
    deep: 'Lễ Vực. Đêm không trăng, cả nước ra biển, thả những ngọn đèn giấy xuống mặt nước đen. Đèn trôi xa dần thành một dải sáng lập lòe. Người ta đứng trên bờ, nín thở đợi xem đèn nào bị kéo xuống. Ngọn đèn của bạn trôi mãi, rồi khuất ở chỗ không ai còn nhìn thấy.',
    forge: 'Ngày Lò Đúc Mẹ. Các xưởng trong nước gõ búa cùng một nhịp, tiếng búa nối từ xưởng này sang xưởng khác như nhịp đập của một trái tim lớn. Giữa hai nhịp, người ta đọc số hiệu những người đã ngừng quay. Bạn gõ theo tới khi cánh tay mỏi nhừ, tối nằm xuống vẫn nghe nhịp búa trong đầu.'
  };
  // Lễ thử thiên phú (js/status.js cv_test) ở làng không có đền, trường: làm ở chỗ thiêng của tộc thay cho "nhà thầy cúng đầu làng".
  const TEST_AT = {
    dwarf: 'trước Đá Thề ở đại sảnh thị tộc', orc: 'trong lều bà đồng', elf: 'dưới gốc Cây Mẹ', beastfolk: 'dưới chân cột totem',
    fae: 'giữa vòng nấm trong trảng', merfolk: 'trong hang san hô của các bà mẹ đàn', dragonkin: 'trên đài lửa của thị tộc'
  };
  // Tên đứa con trong chữ gốc của ad_kid: tìm tên con có trong chữ (không phụ thuộc câu chữ gốc), không có thì cắt trước " nói muốn".
  const nameOfKid = (S, r) => { const t = String(r.t), k = S.family.kids.filter(c => c.name && t.includes(c.name)).sort((a, b) => t.indexOf(a.name) - t.indexOf(b.name))[0]; return k ? k.name : t.split(' nói muốn')[0]; };
  // Phần story.js nối vào sau chữ gốc (người cho vay ở ad_dice, người cầm sổ ở ad_tax): giữ lại khi thay giọng theo tộc.
  const tail = (t, mark) => { const i = String(t).indexOf(mark); return i < 0 ? '' : String(t).slice(i); };
  const VOICE2 = G.RACE_VOICE2 = {
    ad_kid: (S, X, r) => KID[S.race] ? KID[S.race](nameOfKid(S, r)) : null,
    tn_brawl: (S, X, r) => { const b = BRAWL[S.race]; if (!b) return null; const t = Array.isArray(b) ? X.pick(b) : b;
      const m = /được một người bạn: ([^.]+)\.|đêm ấy tên ([^.]+)\./.exec(r.t); return m && FRIEND[S.race] ? t + FRIEND[S.race](m[1] || m[2]) : t; },
    cv_test: (S, X, r) => TEST_AT[S.race] && G.amongKin(S) && r.t.includes(' ở nhà thầy cúng đầu làng') ? r.t.replace(' ở nhà thầy cúng đầu làng', ' ' + TEST_AT[S.race]) : null,
    ad_suitor: S => SUITOR[S.race] && S.flags.suitor ? SUITOR[S.race](S.flags.suitor.name) : null,
    ad_inherit: (S, X, r, dg) => INHERIT[S.race] ? INHERIT[S.race](G.coin(dg)) : null,
    ch_coin: S => COIN[S.race] || null,
    ad_dice: (S, X, r, dg) => DICE[S.race] ? `${DICE[S.race][dg > 0 ? 0 : 1]} ${G.coin(Math.abs(dg))}.` + tail(r.t, ' Không cam lòng, bạn vay ') : null,
    ad_tax: (S, X, r, dg) => TAX[S.race] && G.amongKin(S) ? TAX[S.race](G.coin(-dg)) + tail(r.t, ' Người cầm sổ năm nay là ') : null,
    inf_bless: S => BLESS[S.faith] || null,
    nt_faith_feast: S => { const n = G.here(S).n; return n && FEAST[n.faith] ? FEAST[n.faith] : null; }
  };

  // ═════════ 4. Bọc, đếm ═════════
  for (const e of EV) { G.EVENTS.push(e); G.treeWrap.event(e); }
  for (const id of Object.keys(decs)) { G.treeWrap.decision(id, DEC[id]); G.RACEV_DECS[id] = decs[id]; }
  for (const [id, fn] of Object.entries(VOICE2)) {
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
  // Đếm cho sim.html: nút của file này tính vào phần "của riêng tộc" (racev.js đếm mẫu số).
  { const r0 = G.runEvent;
    G.runEvent = function (X, ev) {
      if (G.RACEV.stats && !X.S.undead && OWN.has(ev.id)) { const R = G.RACEV, r = X.S.race; R.own[r] = (R.own[r] || 0) + 1; R.byId[ev.id] = (R.byId[ev.id] || 0) + 1; }
      return r0(X, ev);
    }; }
  Object.assign(G.RACE_VOICE_TEXT, {
    KID: Object.fromEntries(Object.entries(KID).map(([r, f]) => [r, f('‹tên con›')])), BRAWL, SUITOR: Object.fromEntries(Object.entries(SUITOR).map(([r, f]) => [r, f('‹tên›')])),
    INHERIT: Object.fromEntries(Object.entries(INHERIT).map(([r, f]) => [r, f('‹tiền›')])), COIN, TEST_AT: Object.fromEntries(Object.entries(TEST_AT).map(([r, p]) => [r, `Lễ thử thiên phú ${p}: …`])), DICE: Object.fromEntries(Object.entries(DICE).map(([r, v]) => [r, v.map(x => x + ' ‹tiền›.')])),
    TAX: Object.fromEntries(Object.entries(TAX).map(([r, f]) => [r, f('‹tiền›')])), BLESS, FEAST
  });

  // Tên và điều kiện của từng nút cho trang duyệt: id → [tên, khi nào].
  const KIN = 'ở quê tộc hoặc giữa người cùng tộc', AWAY = 'ở khu của tộc khác, thị trấn trở lên', UNDER = 'thợ mỏ, đã chọn xuống mỏ, hoặc ở núi quê tộc';
  Object.assign(G.RACEV_TITLE, {
    dwf_pick: ['Cuốc chim của ông', 'trẻ con'], dwf_sun: ['Lần đầu thấy mặt trời', 'thiếu niên ở núi hoặc quê tộc'], dwf_trade_call: ['Hội đồng gọi tới đại sảnh', 'thiếu niên; giữa tộc nặng hơn'],
    dwf_trade: ['Việc cho thị tộc', 'sau "Hội đồng gọi tới đại sảnh"'], dwf_forge_first: ['Lưỡi rìu đầu tay', 'sau khi chọn vào lò, 1–4 lượt'], dwf_rune_first: ['Rune Giữ đầu tiên', 'sau khi chọn khắc rune, 1–4 lượt'],
    dwf_gate_first: ['Đêm đầu đứng cổng', 'sau khi chọn đứng cổng, 1–4 lượt'], dwf_vein: ['Mạch quặng', UNDER + '; lặp'], dwf_claim: ['Mạch bạc sao', 'sau "Mạch quặng" (12% là mạch bạc sao)'],
    dwf_claim_caught: ['Đào lén bị lộ', 'sau khi giấu mạch, 1–5 lượt'], dwf_collapse: ['Sập hầm', UNDER + '; lặp'], dwf_beast: ['Đào thủng vào hang quái', UNDER + '; lặp'],
    dwf_master: ['Thử tay nghề Thợ Cả', 'Chế tác ≥ 25, thợ rèn, khắc văn, kim hoàn, điêu khắc, hoặc đã chọn vào lò; lặp tới khi qua'], dwf_beard_pull: ['Gã say giật râu', AWAY],
    dwf_hold_call: ['Bản đồ thành cổ', 'người lớn, ' + KIN], dwf_hold: ['Chiếm lại thành cổ', 'sau "Bản đồ thành cổ"'], dwf_hold_win: ['Lò thành cổ nhóm lại', 'sau khi đi, 1–4 lượt'],
    dwf_hold_lose: ['Thứ ở dưới sâu thức dậy', 'sau khi đi, 1–4 lượt'], dwf_hold_tomb: ['Sảnh mộ tổ tiên', 'sau khi đi, 1–4 lượt'], dwf_hold_back: ['Đoàn trở về', 'sau khi ở lại, 2–6 lượt'],
    dwf_gold: ['Vàng biết gọi', 'tiền > 5 lần trung vị'], dwf_caravan: ['Đoàn xe xuống chợ người', 'người lớn giữa tộc ở núi; lặp'], dwf_hammer: ['Trao búa', 'tuổi già'],
    orc_pup: ['Sói con', 'trẻ con'], orc_wolf_ride: ['Cưỡi sói lần đầu', 'thiếu niên, người lớn có sói'], orc_wolf_old: ['Sói già', 'nuôi sói từ 13 năm'], orc_trial: ['Bảy ngày trên thảo nguyên', 'thiếu niên'],
    orc_hunt: ['Săn vây', KIN + '; lặp'], orc_chief_old: ['Tù trưởng gãy chân', 'người lớn giữa tộc'], orc_chief: ['Ghế tù trưởng', 'sau "Tù trưởng gãy chân"'],
    orc_chief_trust: ['Cánh tay trái của tù trưởng', 'sau khi đứng sau, 2–6 lượt'], orc_camp_new: ['Trại mới', 'sau khi dắt người đi, 1–4 lượt'], orc_bones: ['Xương trên cột cờ', 'cha hoặc mẹ đã mất, ' + KIN],
    orc_raid_call: ['Mài rìu bên lửa', KIN + '; luật cướp phá, chiến tranh nặng hơn; lặp'], orc_raid: ['Đi cướp mùa đông', 'sau "Mài rìu bên lửa"'], orc_rage: ['Cơn cuồng nộ', 'Rìu hoặc Thân thể ≥ 20'],
    orc_shaman_pick: ['Bà đồng chọn người', 'thiếu niên giữa tộc, mộ đạo hoặc Tinh thần ≥ 8'], orc_shaman_heir: ['Bà đồng mất', 'sau "Bà đồng chọn người", 3–10 lượt'],
    orc_storm: ['Bão cát, bão tuyết', 'thảo nguyên, sa mạc, băng nguyên, ngoài thị trấn; lặp'], orc_lone: ['Sói lạc bầy', 'bị đuổi khỏi trại'],
    elf_inked: ['Lễ khắc mặt', 'từ 70% tuổi trưởng thành, ' + KIN + '; kêu đau thì năm sau làm lại'], elf_hart: ['Hươu trắng chọn chỗ', 'ở quê tộc; lặp'], elf_song: ['Khúc hát chín đêm', 'Huyền thuật ≥ 10'],
    bst_mark: ['Cào dấu ranh đất', 'thiếu niên, ' + KIN], bst_pack_hunt: ['Săn bầy đêm không trăng', KIN + '; lặp'], bst_intruder: ['Mùi lạ trên ranh đất', KIN + '; lặp'], bst_cubs: ['Con non của cả bầy', 'người lớn giữa bầy, có con nhỏ'],
    fae_changeling: ['Kéo sắt trên nôi', 'trẻ con sống giữa tộc khác'], fae_food: ['Đồ ăn của tiên', 'ở quê tộc'], fae_water: ['Nước chảy', 'ở khu của tộc khác; lặp'],
    mer_wethem: ['Vạt áo luôn ướt', AWAY + '; lặp'], mer_tidesong: ['Hát cho con nước dâng', 'ven biển, giữa tộc; lặp'],
    drg_clutch: ['Tên lúc nhỏ', 'trẻ con'], drg_clutch_split: ['Chia lứa trứng', 'bạn đời là Long Nhân'], cst_sentry: ['Nghỉ mà vẫn nghe', 'người lớn; lặp'], cst_ledger: ['Sổ tài sản', AWAY + ', nước không có luật Cơ Nhân là công dân'],
    hum_parents_age: ['Tóc mẹ bạc', 'cha hoặc mẹ từ 55 tuổi'], hum_guild: ['Phường thợ đọc tên', 'thiếu niên, người lớn ở thị trấn trở lên'],
    fs_stone_oath: ['Đá Thề', 'thiếu niên theo Đạo Đá Tổ'], fs_stone_names: ['Ngày Đọc Vách', 'theo Đạo Đá Tổ; lặp'], fs_stone_tomb: ['Hốc trong vách', 'theo Đạo Đá Tổ, cha hoặc mẹ đã mất'],
    fs_anc_bones: ['Đọc xương vai cừu', 'theo Tổ Linh Đạo; lặp'], fs_anc_wind: ['Nghe gió tổ', 'theo Tổ Linh Đạo; lặp'],
    fs_totem_dream: ['Mơ thấy thú tổ', 'thiếu niên theo Thú Linh Đạo'], fs_totem_share: ['Lễ chia mồi dưới trăng', 'theo Thú Linh Đạo; lặp'],
    fs_season_turn: ['Lễ đổi mùa đầu đời', 'trẻ con theo Khế Ước Bốn Mùa'], fs_season_due: ['Mùa đòi phần', 'theo Khế Ước Bốn Mùa; lặp'],
    fs_flame_watch: ['Đêm giữ lửa đài', 'theo Long Hỏa Đạo; lặp'], fs_flame_out: ['Lửa đài tắt', 'theo Long Hỏa Đạo'],
    fs_wild_grave: ['Cây trên mộ', 'theo Cổ Thần Hoang Dã, cha hoặc mẹ đã mất'], fs_wild_wake: ['Lễ đánh thức rừng', 'theo Cổ Thần Hoang Dã; lặp'],
    fs_deep_voice: ['Giọng dưới đáy', 'theo Vực Giáo; lặp'], fs_deep_gift: ['Lễ vật cho vực', 'theo Vực Giáo, ven biển; lặp'],
    fs_forge_part: ['Thay một bộ phận', 'theo Giáo Hội Lò Rèn, Devotion ≥ 25; lặp'], fs_forge_hymn: ['Bài kinh của búa', 'theo Giáo Hội Lò Rèn; lặp'],
    fs_light_vigil: ['Đêm canh thức', 'thiếu niên theo Quang Minh'], fs_light_alms: ['Phát bánh ngày lễ', 'theo Quang Minh; lặp'], fs_dark_debt: ['Món nợ tới hạn', 'theo Hắc Giáo; lặp']
  });
})(window.LifeSim);
