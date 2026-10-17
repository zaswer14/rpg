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
        return { t: 'Ông nội trao cho bạn cây cuốc chim nhỏ, cán đã bóng tay ba đời. "Đá kêu trước khi sập. Học nghe nó."', k: 'good' }; } },
    { id: 'dwf_sun', st: ['teen'], c: S => dwfHold(S) || G.raceHome(S) || dwfMount(S), w: 2.5, run(S, X) { X.add('h', -2); X.add('sm', 2);
        return { t: 'Lần đầu bạn theo đoàn xe lên mặt đất. Trời sáng quá, bạn nôn hai lần rồi ngồi trong bóng xe cả buổi. Người lớn cười: ai cũng thế lần đầu.', k: 'info', f: 'Người Lùn sống dưới hầm lâu thì ra nắng chóng mặt; chịu qua một lần là quen.' }; } },
    { id: 'dwf_trade_call', st: ['teen'], c: S => !S.flags.dwfTrade && !S.flags.dwfTradeQ, w: S => kin(S) || G.raceHome(S) ? 5 : 2, run(S, X) {
        S.flags.dwfTradeQ = true;
        return { t: kin(S) ? 'Hội đồng thị tộc gọi những đứa sắp lớn tới đại sảnh. Theo lệ, mỗi đứa phải chọn một việc làm cho tộc trước khi được tết bím râu thứ hai.' : 'Thư của thị tộc từ dưới núi gửi tới: theo lệ, bạn phải chọn một việc làm cho tộc, dù đang sống xa hầm.', k: 'info' }; } },
    { id: 'dwf_forge_first', st: ['teen', 'adult'], w: 4, tree: { from: ['dwf_trade:forge'], wait: [1, 4], dir: { nghe: 1 } }, run(S, X) {
        X.gain('Engineering', 3); if (S.gear < 10) S.gear++;
        return { t: `Thầy rèn bắt bạn tự làm một lưỡi rìu, từ quặng thô tới lúc mài. Lưỡi rìu hơi cong; thầy vẫn khắc tên bạn lên cán. Trang bị ${S.gear}/10.`, k: 'good' }; } },
    { id: 'dwf_rune_first', st: ['teen', 'adult'], w: 4, tree: { from: ['dwf_trade:rune'], wait: [1, 4], dir: { nghe: 1, tri: 1 } }, run(S, X) {
        X.gain('Spirit', 3); X.add('sm', 3);
        return { t: 'Bạn khắc rune đầu tiên lên một cái then cửa: rune Giữ. Ba ngày sau cửa không mở được nữa, kể cả với thầy. Thầy cười chảy nước mắt rồi chỉ cho bạn cách gỡ.', k: 'good' }; } },
    { id: 'dwf_gate_first', st: ['teen', 'adult'], w: 4, tree: { from: ['dwf_trade:gate'], wait: [1, 4], dir: { vo: 1 } }, run(S, X) {
        X.gain('Shield', 3); X.add('so', 3);
        return { t: 'Đêm đầu đứng cổng, có thứ gì cào vào cánh cửa đá từ phía ngoài tới gần sáng. Bạn không lùi một bước. Sáng ra người đổi gác vỗ vai bạn mà không nói gì.', k: 'good' }; } },
    { id: 'dwf_vein', st: AD, rep: true, gap: 4, c: S => underground(S) && !S.flags.veinQ, w: 1.8, tree: { dir: { nghe: 1, thuong: 1 } }, run(S, X) {
        if (X.chance(.12)) { S.flags.veinQ = { amt: Math.round(med(S, X) * X.int(4, 8)) };
          return { t: 'Cuốc của bạn bổ vào một vỉa đá lạ: trong lòng đá là những sợi bạc trắng sáng như sao. Không ai trong tổ còn thức.', k: 'big' }; }
        const g = Math.round(med(S, X) * (.25 + .4 * X.rnd())); X.money(g); X.gain('Engineering', 2);
        return { t: `Bạn gõ đá nghe tiếng mà lần ra một mạch quặng sắt chạy chéo xuống dưới. Tổ đào cả mùa không hết. Phần của bạn: ${G.coin(g)}.`, k: 'good' }; } },
    { id: 'dwf_claim_caught', st: AD, w: 4, tree: { from: ['dwf_claim:secret'], wait: [1, 5] }, run(S, X) {
        if (X.chance(.5)) { X.add('so', -14); S.flags.outcast = true; X.add('h', -10);
          return { t: 'Một đứa trong tổ thấy bạn xuống hầm lúc nửa đêm và đi theo. Hội đồng thị tộc gọi bạn lên, đọc tên bạn trước cả đại sảnh. Từ hôm ấy không ai rót rượu cho bạn.', k: 'bad', o: 'caught' }; }
        X.add('h', -3); return { t: 'Mạch bạc cạn sau hai mùa đào lén. Không ai biết. Mỗi lần đi qua vách tổ tiên ở đại sảnh, bạn vẫn đi nhanh hơn.', k: 'info', o: 'kept' }; } },
    { id: 'dwf_collapse', st: AD, rep: true, gap: 6, c: underground, w: 1, tree: { theme: 'hardship' }, run(S, X) {
        if (X.chance(.01)) { X.die({ id: 'mine', text: 'bị đá vùi khi sập hầm' }); return null; }
        if (X.chance(odds(S, X, .55))) { X.add('so', 6); S.fame += 2; X.add('hl', -4);
          return { t: 'Vòm hầm sập sau lưng tổ bạn. Từ bên kia đống đá có tiếng gõ đáp lại. Bạn đào bằng tay suốt hai ngày; ba người trong tổ ra được, còn thở.', k: 'good', o: 'saved' }; }
        X.add('hl', -10); X.cond('wound'); X.add('h', -6);
        return { t: 'Vòm hầm sập sau lưng tổ bạn. Bạn bị kẹt chân dưới một tảng đá suốt một đêm, nghe tiếng gõ bên kia đống đá thưa dần rồi tắt.', k: 'bad', o: 'lost' }; } },
    { id: 'dwf_beast', st: AD, rep: true, gap: 5, c: underground, w: 1.1, tree: { dir: { vo: 1 } }, run(S, X) {
        const b = X.pick(['một con giun đá to bằng thân cây', 'một ổ nhện hang', 'một con bò sát mù dài hai sải']);
        if (X.chance(odds(S, X, .5))) { X.gain('Axe', 3); S.fame += 1; X.add('so', 2);
          return { t: `Tổ bạn đào thủng vách vào một hang tối, và trong hang là ${b}. Bạn chặn ở miệng lỗ cho tới khi cả tổ lui ra và lấp đá lại.`, k: 'good', o: 'win' }; }
        X.add('hl', -10); X.cond('wound');
        return { t: `Tổ bạn đào thủng vách vào một hang tối, và trong hang là ${b}. Bạn ra được, mang theo một vết cắn sâu tới xương.`, k: 'bad', o: 'lose' }; } },
    { id: 'dwf_master', st: AD, rep: true, gap: 4, c: S => !S.flags.dwfMaster && ((S.mastery.Engineering || 0) >= 25 || ['smith', 'runesmith', 'jeweler', 'sculptor'].includes(S.work) || S.flags.dwfTrade === 'forge'), w: 1.6, tree: { dir: { nghe: 2 } }, run(S, X) {
        const p = .25 + (S.mastery.Engineering || 0) / 150 + (S.flags.dwfArt ? .2 : 0);
        if (X.chance(p)) { S.flags.dwfMaster = true; S.fame += 4; X.add('so', 6); X.money(Math.round(med(S, X) * .6)); cnt(S, 'dwfMasterN');
          return { t: 'Bạn mang món đồ đẹp nhất của mình tới hội đồng thợ cả. Bảy người chuyền tay nhau xem suốt một buổi chiều, không ai nói gì. Rồi người già nhất đặt nó lên bàn đá: từ nay bạn được đóng dấu riêng lên đồ mình làm.', k: 'big', o: 'pass', f: 'Thợ Cả của Người Lùn có dấu riêng. Đồ không có dấu thì thị tộc không bán ra ngoài.' }; }
        X.add('h', -4);
        return { t: 'Bạn mang món đồ đẹp nhất của mình tới hội đồng thợ cả. Một người gõ móng tay lên chỗ mối hàn, lắc đầu. Bạn về lò làm lại từ đầu.', k: 'info', o: 'fail' }; } },
    { id: 'dwf_beard_pull', st: AD, rep: true, gap: 6, c: S => stranger(S) && isTown(S), w: 1.3, tree: { theme: 'stranger' }, run(S, X) {
        if (S.traits.bold > .5) { X.gain('Unarmed', 3); X.add('hl', -4); X.add('so', -2);
          return { t: `Một gã say ở ${homeName(S, X)} giật râu bạn cho vui. Bạn đấm gã ngã qua hai cái bàn. Chủ quán bắt bạn đền bàn, còn gã thì không dám bén mảng tới nữa.`, k: 'info', o: 'fight' }; }
        X.add('h', -4); X.add('sm', 1);
        return { t: `Một gã say ở ${homeName(S, X)} giật râu bạn cho vui. Bạn không làm gì, chỉ nhìn kỹ mặt gã. Người Lùn không quên một bộ mặt.`, k: 'bad', o: 'remember' }; } },
    { id: 'dwf_hold_call', st: ['adult'], c: S => !S.flags.holdQ && !S.flags.holdDone && (kin(S) || G.raceHome(S)), w: 1.2, run(S, X) {
        S.flags.holdQ = { name: X.pick(['Karak Đá Xám', 'Hầm Chín Cổng', 'Thành Đe Lạnh', 'Sảnh Mạch Bạc']) };
        return { t: `Ở đại sảnh có người dựng lại tấm bản đồ cũ của ${S.flags.holdQ.name}, thành dưới núi tộc bạn bỏ từ đời kỵ vì quái tràn lên từ tầng sâu.`, k: 'info' }; } },
    { id: 'dwf_hold_win', st: AD, w: S => 2 + 3 * S.traits.bold, tree: { from: ['dwf_hold:go'], wait: [1, 4], dir: { vo: 2 } }, run(S, X) {
        const n = S.flags.holdDone; S.fame += 6; X.add('so', 8); X.money(Math.round(med(S, X) * 1.2)); if (S.gear < 10) S.gear++; cnt(S, 'holdWin'); dev(S, 6);
        return { t: `Đoàn dọn từng tầng của ${n} trong ba mùa. Ngày lò chung của thành cổ được nhóm lại, cả đoàn đứng khóc mà không ai thấy ngượng. Tên bạn được khắc ở cổng mới.`, k: 'big', o: 'win' }; } },
    { id: 'dwf_hold_lose', st: AD, w: 2, tree: { from: ['dwf_hold:go'], wait: [1, 4] }, run(S, X) {
        X.add('hl', -14); X.cond('wound'); X.add('h', -6); X.add('so', 3); cnt(S, 'holdLose');
        return { t: `Đoàn mới xuống tới tầng thứ ba của ${S.flags.holdDone} thì thứ ở dưới sâu thức dậy. Một nửa đoàn không về. Bạn được khiêng ra, và thề sẽ quay lại.`, k: 'bad', o: 'lose' }; } },
    { id: 'dwf_hold_tomb', st: AD, w: 1.5, tree: { from: ['dwf_hold:go'], wait: [1, 4], dir: { dao: 1 } }, run(S, X) {
        X.add('sm', 4); X.add('so', 4); dev(S, 10);
        return { t: `Trong ${S.flags.holdDone}, đoàn tìm thấy sảnh mộ của tổ tiên còn nguyên: tên khắc trên vách, rìu đặt trên ngực. Không ai lấy gì. Cả đoàn đứng đọc tên từng người, rồi chặn cửa lại cho họ ngủ tiếp.`, k: 'big', o: 'tomb' }; } },
    { id: 'dwf_hold_back', st: AD, w: 3, tree: { from: ['dwf_hold:stay'], wait: [2, 6] }, run(S, X) {
        X.add('h', -3);
        return { t: `Đoàn đi ${S.flags.holdDone} trở về, ít hơn lúc đi. Họ kể ở đại sảnh suốt ba đêm. Bạn ngồi nghe ở hàng ghế sau.`, k: 'info' }; } },
    { id: 'dwf_gold', st: AD, c: (S, X) => S.gold > med(S, X) * 5 && !S.flags.dwfGold, w: 1.2, run(S, X) {
        S.flags.dwfGold = true; X.add('h', 2); X.add('so', -3); G.trajBump(S, { thuong: .3 });
        return { t: 'Bạn bắt đầu xuống kho đếm vàng mỗi tối, khóa cửa không cho ai vào, kể cả người nhà. Đếm xong lại muốn đếm lần nữa.', k: 'info', f: 'Người Lùn có câu: vàng không biết nói nhưng biết gọi.' }; } },
    { id: 'dwf_caravan', st: ['adult'], rep: true, gap: 5, c: S => dwfHold(S), w: 1.2, tree: { dir: { thuong: 1, du: 1 } }, run(S, X) {
        const g = Math.round(med(S, X) * .35); X.money(g); X.add('sm', 1);
        return { t: `Thị tộc cử bạn dẫn đoàn xe sắt xuống chợ của loài người dưới chân núi, đổi rìu, đinh, bản lề lấy lúa mì, len và mật ong. Bạn mặc cả bằng ba thứ tiếng. Phần của bạn: ${G.coin(g)}.`, k: 'good' }; } },
    { id: 'dwf_hammer', st: ['elder'], w: 3, run(S, X) {
        const k = S.family.kids.find(x => x.alive), to = k ? `${k.name}, con bạn` : (S.disciples || []).length ? `${first(S.disciples[S.disciples.length - 1].name)}, đệ tử của bạn` : 'đứa cháu họ khéo tay nhất';
        X.add('so', 4); X.add('h', 3);
        return { t: `Bạn trao cây búa của mình cho ${to}. Theo lệ, búa đổi chủ thì đổi tên; hai người ngồi bên lò cả đêm để chọn tên mới cho nó.`, k: 'good' }; } }
  ]);
  dec('dwarf', 'dwf_trade', {
    prio: 4, gap: 1, tree: { q: 'dwfTradeQ' },
    when: S => !S.dead && S.flags.dwfTradeQ === true,
    build(S, X) {
      return { title: 'Việc cho thị tộc', body: 'Người Lùn trả nợ cho thị tộc bằng tay nghề. Việc chọn hôm nay sẽ theo bạn tới lúc tên được khắc lên vách.',
        choices: [{ k: 'forge', label: 'Vào lò', sub: 'Học rèn với thợ của thị tộc.' }, { k: 'mine', label: 'Xuống mỏ', sub: 'Đi theo tổ đào, học nghe đá.' },
          { k: 'rune', label: 'Học khắc rune', sub: 'Rune không phải phép: là chữ khắc cho đá và sắt nhớ.' }, { k: 'gate', label: 'Đứng cổng', sub: 'Giữ cổng hầm, đánh thứ trèo lên từ dưới sâu.' }] };
    },
    apply(S, X, k) { S.flags.dwfTradeQ = null; S.flags.dwfTrade = k; cnt(S, 'trade_' + k);
      if (k === 'forge') { X.gain('Engineering', 6); X.gain('Axe', 2); G.trajBump(S, { nghe: .4 }); return 'Bạn nhận tạp dề da của lò chung. Từ nay bạn dậy trước mọi người để nhóm lửa.'; }
      if (k === 'mine') { X.gain('Body', 5); X.gain('Engineering', 3); return 'Bạn nhận một chiếc đèn đồng và một cái cuốc có số. Mất đèn thì phải đền, mất cuốc thì phải đền gấp đôi.'; }
      if (k === 'rune') { X.gain('Spirit', 4); X.gain('Engineering', 3); G.trajBump(S, { tri: .3 }); return 'Thợ rune già cho bạn chép lại một bảng rune lên đá phiến, chép tới khi không còn nét nào run.'; }
      X.gain('Shield', 5); X.gain('Axe', 3); G.trajBump(S, { vo: .4 }); return 'Bạn nhận một cái khiên đã móp ba chỗ. Người giữ cổng trước bạn đã chết sau cái khiên ấy.'; },
    auto: S => { const m = S.mastery; return (m.Shield || 0) + (m.Axe || 0) > (m.Engineering || 0) + 4 && S.traits.bold > .5 ? 'gate' : S.traits.studious > .65 ? 'rune' : S.traits.bold > .6 ? 'mine' : 'forge'; }
  });
  dec('dwarf', 'dwf_claim', {
    prio: 5, gap: 1, tree: { q: 'veinQ' },
    when: S => !S.dead && !!S.flags.veinQ,
    build(S, X) { const a = S.flags.veinQ.amt;
      return { title: 'Mạch bạc sao', body: `Mạch bạc này đáng chừng ${G.coin(a)}. Theo luật thị tộc, ai tìm được mạch phải báo hội đồng; mạch thuộc về cả tộc, người tìm được chia phần lớn nhất.`,
        choices: [{ k: 'report', label: 'Báo hội đồng', sub: `Nhận phần của người tìm mạch (chừng ${G.coin(Math.round(a * .25))}); tên bạn được ghi vào sổ mỏ.` },
          { k: 'secret', label: 'Giấu, đào đêm một mình', sub: 'Giàu nhanh. Bị phát hiện thì bị ruồng bỏ.' }, { k: 'sell', label: 'Bán vị trí cho thương nhân loài người', sub: 'Tiền ngay, không ai trong tộc biết là bạn.' }] }; },
    apply(S, X, k) { const a = S.flags.veinQ.amt; S.flags.veinQ = null; cnt(S, 'claim_' + k);
      if (k === 'report') { X.money(Math.round(a * .25)); S.fame += 4; X.add('so', 8); dev(S, 5); return 'Hội đồng đặt tên mạch theo tên bạn. Ở đại sảnh, người ta nhường bạn chỗ gần lò.'; }
      if (k === 'secret') { X.money(Math.round(a * .7)); X.add('h', 3); G.trajBump(S, { am: .3, thuong: .3 }); return 'Bạn lấy đá lấp miệng vỉa, đêm nào cũng xuống một mình với chiếc đèn che kín.'; }
      X.money(Math.round(a * .4)); X.add('so', -4); return 'Thương nhân trả tiền mặt và hứa không nói ra. Mùa sau có một toán thợ mỏ lạ dựng lán ở sườn núi.'; },
    auto: S => S.traits.social > .45 || S.traits.pious > .5 ? 'report' : S.traits.bold > .6 ? 'secret' : 'sell'
  });
  dec('dwarf', 'dwf_hold', {
    prio: 4, gap: 1, tree: { q: 'holdQ' },
    when: S => !S.dead && !!S.flags.holdQ,
    build(S, X) { const n = S.flags.holdQ.name;
      return { title: 'Chiếm lại thành cổ', body: `Một đoàn Người Lùn đang tập hợp để đi chiếm lại ${n}. Ai đi thì để lại tên ở cổng; ai không về thì tên được khắc lên vách.`,
        choices: [{ k: 'go', label: 'Đi cùng đoàn', sub: 'Ba mùa dưới lòng đất, đánh thứ đã đuổi tổ tiên đi.' }, { k: 'stay', label: 'Ở lại giữ lò', sub: 'Lò chung cũng cần người.' }] }; },
    apply(S, X, k) { const n = S.flags.holdQ.name; S.flags.holdQ = null; S.flags.holdDone = n; cnt(S, 'hold_' + k);
      if (k === 'go') { X.gain('Axe', 4); X.gain('Shield', 3); G.trajBump(S, { vo: .5 }); return `Bạn khắc tên mình lên cổng, vác rìu theo đoàn xuống con đường hầm dẫn tới ${n}.`; }
      X.add('so', -2); return 'Bạn tiễn đoàn ở cổng, rồi quay về lò chung.'; },
    auto: S => S.traits.bold > .45 ? 'go' : 'stay'
  });

  // ─────────── Orc: bầy, trại, bộ lạc ───────────
  // Nguồn: Warcraft (kỵ sói, thách đấu tù trưởng, bà đồng), Elder Scrolls (Orsimer: thử thách trưởng thành, tù trưởng do thắng trận
  // mà lên), thiết lập của thư viện ("kẻ chết được nhớ bằng xương treo trên cờ"), dân du mục thảo nguyên (săn vây, đi cướp mùa đông).
  const HUNT = { wind_steppe: 'một đàn bò rừng', red_desert: 'một bầy lạc đà hoang', frost_tundra: 'một con voi ma mút lông xám', moss_forest: 'một con gấu hang' };
  add('orc', [
    { id: 'orc_pup', st: ['child'], c: S => !S.flags.orcWolf, w: 3.5, run(S, X) {
        S.flags.orcWolf = { y: S.world.year, name: X.pick(['Răng Xám', 'Gió Đen', 'Sẹo Mõm', 'Tro', 'Hú Dài']) }; X.gain('Taming', 4); X.add('h', 5);
        return { t: `Mẹ đặt vào lòng bạn một con sói con mới mở mắt và bảo: từ nay nó ăn từ tay mày. Bạn gọi nó là ${S.flags.orcWolf.name}.`, k: 'good', f: 'Ở trại Orc, đứa trẻ và con sói của nó lớn lên cùng nhau; sói chết thì chủ giữ lại nanh.' }; } },
    { id: 'orc_wolf_ride', st: ['teen', 'adult'], c: S => !!S.flags.orcWolf && !S.flags.orcRode, w: 4, run(S, X) {
        S.flags.orcRode = true; X.gain('Riding', 5); X.add('so', 3);
        return { t: `${S.flags.orcWolf.name} giờ cao tới ngực bạn. Lần đầu bạn cưỡi nó qua thảo nguyên, ngã bảy lần; lần thứ tám nó chạy đúng hướng và không hất bạn xuống nữa.`, k: 'good' }; } },
    { id: 'orc_wolf_old', st: AD, c: S => !!S.flags.orcWolf && S.world.year - S.flags.orcWolf.y >= 13, w: 4, run(S, X) {
        const n = S.flags.orcWolf.name; S.flags.orcWolf = null; X.add('h', -6); X.add('so', 2);
        return { t: `${n} già rồi, không đứng dậy nổi nữa. Bạn ngồi với nó tới sáng, rồi lấy một chiếc nanh của nó buộc vào cán rìu.`, k: 'bad' }; } },
    { id: 'orc_trial', st: ['teen'], w: 4, run(S, X) {
        if (X.chance(odds(S, X, .55))) { X.add('so', 6); S.fame += 1; X.gain('Body', 3); X.gain('Stealth', 2);
          return { t: 'Trại đẩy bạn ra thảo nguyên với một con dao và một túi nước, bảy ngày sau mới được về. Ngày thứ bảy bạn về, vác trên vai bộ da một con báo cỏ. Bà đồng vạch một đường đỏ lên mặt bạn: từ nay bạn là người lớn.', k: 'big', o: 'win' }; }
        X.add('hl', -8); X.add('so', -2);
        return { t: 'Trại đẩy bạn ra thảo nguyên với một con dao và một túi nước, bảy ngày sau mới được về. Bạn về tay trắng, gầy rộc. Trại vẫn cho vào, nhưng mùa sau bạn phải đi lại.', k: 'bad', o: 'lose' }; } },
    { id: 'orc_hunt', st: AD, rep: true, gap: 3, c: S => G.raceHome(S) || kin(S), w: 2, tree: { dir: { vo: 1, gia: .5 } }, run(S, X) {
        const prey = HUNT[bio(S)] || 'một đàn hươu'; const g = Math.round(med(S, X) * .25); X.money(g); X.gain(X.chance(.5) ? 'Spear' : 'Axe', 2); X.add('so', 2); X.add('hl', -2);
        return { t: `Cả trại đi săn vây ${prey}. Đàn ông, đàn bà, sói chiến dồn con mồi vào hẻm đá từ hai phía. Tối ấy ai cũng được ăn tới no; phần của bạn bán được ${G.coin(g)}.`, k: 'good' }; } },
    { id: 'orc_chief_old', st: ['adult'], c: S => kin(S) && !S.flags.chiefQ && !S.flags.orcChief, w: 1.3, run(S, X) {
        S.flags.chiefQ = true;
        return { t: 'Tù trưởng bị một con bò rừng húc gãy chân, giờ đi phải chống giáo. Đám trai trẻ trong trại bắt đầu nhìn nhau.', k: 'info' }; } },
    { id: 'orc_chief_trust', st: AD, w: 3, tree: { from: ['orc_chief:serve'], wait: [2, 6], dir: { quyen: 1, gia: 1 } }, run(S, X) {
        S.fame += 2; X.add('so', 5);
        return { t: 'Tù trưởng giao cho bạn dẫn đội tuần ở biên bãi cỏ. Trước cả trại, ông gọi bạn là "cánh tay trái của ta".', k: 'good' }; } },
    { id: 'orc_camp_new', st: AD, w: 3, tree: { from: ['orc_chief:leave'], wait: [1, 4], dir: { quyen: 1, du: 1 } }, run(S, X) {
        S.flags.orcChief = 'camp'; S.fame += 3; X.add('so', 4);
        return { t: 'Mười hai lều nhổ cọc theo bạn đi về phía bãi cỏ mới. Bạn cắm cọc cờ đầu tiên của trại mình trên một gò cao, nơi gió thổi từ bốn phía.', k: 'big' }; } },
    { id: 'orc_bones', st: AD, c: S => !!parentDead(S) && !S.flags.orcBones && (kin(S) || G.raceHome(S)), w: 3, run(S, X) {
        const p = parentDead(S); S.flags.orcBones = true; X.add('so', 3); X.add('h', -2); if (S.faith === 'ancestor') dev(S, 6);
        return { t: `Theo lệ trại, xương của ${p.role} bạn được rửa sạch, buộc lên cột cờ trước lều. Mỗi lần gió thổi, xương gõ vào nhau. Bà đồng bảo đó là ${p.role} bạn đang nói.`, k: 'info', f: 'Kẻ mạnh dẫn, kẻ yếu theo, kẻ chết được nhớ bằng xương treo trên cờ.' }; } },
    { id: 'orc_raid_call', st: ['adult'], rep: true, gap: 5, c: S => (G.raceHome(S) || kin(S)) && !S.flags.raidQ, w: S => .7 + (G.lawHere(S, 'raid_law') ? 2 : 0) + G.local(S).war * 2, tree: { theme: 'raid' }, run(S, X) {
        S.flags.raidQ = true;
        return { t: 'Mùa đông tới sớm, đàn gia súc gầy. Đêm nay đám trai trẻ mài rìu bên lửa và bàn chuyện xuống làng nông dưới thung lũng.', k: 'info' }; } },
    { id: 'orc_rage', st: AD, c: S => !S.flags.orcRage && ((S.mastery.Axe || 0) >= 20 || (S.mastery.Body || 0) >= 20), w: 1.4, tree: { dir: { vo: 2 } }, run(S, X) {
        S.flags.orcRage = true; X.gain('Axe', 5); X.gain('Body', 3); X.add('hl', -6);
        return { t: 'Giữa trận, máu chảy xuống mắt và mọi thứ chuyển sang màu đỏ. Lúc tỉnh lại, ba con sói đồng nằm quanh chân bạn, cán rìu gãy làm đôi trong tay.', k: 'big', f: 'Orc gọi đó là lúc tổ tiên mượn tay.' }; } },
    { id: 'orc_shaman_pick', st: ['teen'], c: S => kin(S) && !S.flags.orcShaman && (S.traits.pious > .55 || (S.mastery.Spirit || 0) >= 8), w: 2.5, run(S, X) {
        S.flags.orcShaman = true; X.gain('Spirit', 4); dev(S, 5); X.add('so', 3);
        return { t: 'Bà đồng của trại chọn bạn mang túi xương cho bà. Bạn đi theo bà lên gò, học đọc vết nứt trên xương vai cừu khi nướng trên lửa.', k: 'big' }; } },
    { id: 'orc_shaman_heir', st: AD, w: 3, tree: { from: ['orc_shaman_pick'], wait: [3, 10], dir: { dao: 2 } }, run(S, X) {
        X.gain('Spirit', 4); S.fame += 3; X.add('so', 6); dev(S, 8);
        return { t: 'Bà đồng mất vào một đêm gió lớn. Sáng ra cả trại đứng trước lều bạn, chờ bạn nói tổ tiên muốn gì.', k: 'big' }; } },
    { id: 'orc_storm', st: AD, rep: true, gap: 6, c: S => ['wind_steppe', 'red_desert', 'frost_tundra'].includes(bio(S)) && !isTown(S), w: 1.1, tree: { theme: 'hardship' }, run(S, X) {
        X.add('hl', -4); X.money(-Math.round(med(S, X) * .15)); X.gain('Riding', 2);
        return bio(S) === 'frost_tundra' ? { t: 'Bão tuyết ba ngày. Bạn cùng đám thanh niên quây đàn ngựa vào hẻm núi, ngủ ngồi giữa lũ ngựa cho đỡ lạnh. Sáng ra đếm thiếu bảy con.', k: 'bad' }
          : { t: 'Bão cát kéo tới như một bức tường đỏ. Cả trại buộc lều vào nhau, nằm úp mặt xuống đất tới khi gió qua. Hai cái lều bay mất.', k: 'bad' }; } },
    { id: 'orc_lone', st: AD, c: S => !!S.flags.outcast && !S.flags.orcLone, w: 3, tree: { dir: { du: 1 } }, run(S, X) {
        S.flags.orcLone = true; X.add('h', -6); X.gain('Stealth', 3); G.trajBump(S, { du: .3 });
        return { t: 'Bị đuổi khỏi trại, bạn đi một mình như con sói lạc bầy. Đêm nào bạn cũng nghe tiếng trống của một trại nào đó ở xa, mà không trại nào gọi bạn.', k: 'bad' }; } }
  ]);
  dec('orc', 'orc_chief', {
    prio: 4, gap: 1, tree: { q: 'chiefQ' },
    when: S => !S.dead && S.flags.chiefQ === true,
    build(S, X) {
      return { title: 'Ghế tù trưởng', body: 'Ở trại Orc, tù trưởng là kẻ còn đứng được sau trận đấu ở vòng đá. Tù trưởng già vẫn còn tay, còn rìu, và còn những người đứng sau ông.',
        choices: [{ k: 'challenge', label: 'Thách đấu ở vòng đá', sub: 'Thắng thì làm tù trưởng. Thua thì mang sẹo cả đời.' }, { k: 'serve', label: 'Đứng sau tù trưởng', sub: 'Giữ cho trại khỏi chia đôi.' },
          { k: 'leave', label: 'Dắt người đi dựng trại riêng', sub: 'Ai muốn theo thì theo.' }] }; },
    apply(S, X, k) { S.flags.chiefQ = null; cnt(S, 'chief_' + k);
      if (k === 'challenge') {
        if (X.chance(odds(S, X, .42))) { S.flags.orcChief = true; S.fame += 6; X.add('so', 8); G.trajBump(S, { quyen: .6, vo: .3 }); return 'Bạn quật tù trưởng già xuống ba lần mà không lấy mạng ông. Ông tự tay trao cho bạn cây rìu đầu sói, rồi ngồi xuống hàng ghế của các bô lão.'; }
        X.add('hl', -15); X.cond('wound'); X.add('so', -4); return 'Tù trưởng già vẫn còn biết đánh. Bạn nằm trong vòng đá với ba cái xương sườn gãy; ông bước qua bạn mà không nhìn xuống.'; }
      if (k === 'serve') { X.add('so', 5); return 'Bạn đứng sau lưng tù trưởng ở buổi họp trại. Đám trai trẻ nhìn bạn rồi thôi không nhìn nhau nữa.'; }
      G.trajBump(S, { du: .4 }); X.add('so', -2); return 'Bạn đứng lên giữa buổi họp trại, nói rằng mình sẽ đi về phía bãi cỏ mới. Vài người đứng lên theo.'; },
    auto: (S, X) => S.traits.bold > .6 ? 'challenge' : S.traits.social > .5 ? 'serve' : S.traits.bold > .4 ? 'leave' : 'serve'
  });
  dec('orc', 'orc_raid', {
    prio: 4, gap: 1, tree: { q: 'raidQ' },
    when: S => !S.dead && S.flags.raidQ === true,
    build(S, X) {
      return { title: 'Đi cướp mùa đông', body: 'Đám trai trẻ sẽ xuống làng nông trước khi tuyết chặn đèo. Mang về lúa và gia súc thì cả trại qua được mùa đông.',
        choices: [{ k: 'ride', label: 'Cưỡi sói theo đoàn', sub: 'Của cải, danh tiếng; có thể không về.' }, { k: 'stay', label: 'Ở lại trại', sub: 'Trại nghĩ bạn sợ.' },
          { k: 'warn', label: 'Lẻn xuống báo cho làng', sub: 'Phản trại. Biết thì bị đuổi.' }] }; },
    apply(S, X, k) { S.flags.raidQ = null; cnt(S, 'raid_' + k);
      if (k === 'ride') {
        if (X.chance(odds(S, X, .55))) { X.money(Math.round(med(S, X) * .6)); X.gain('Riding', 2); S.fame += 1; G.trajBump(S, { vo: .3, am: .2 }); return 'Đoàn về lúc tảng sáng, sói chở nặng lúa và cừu. Cả trại mở tiệc; bạn được chia phần của người đi đầu.'; }
        X.add('hl', -10); X.cond('wound'); return 'Làng nông đã dựng rào và có lính tỉnh. Đoàn chạy về tay không, bạn mang theo một mũi tên trong vai.'; }
      if (k === 'stay') { X.add('so', -3); return 'Bạn ở lại canh lửa. Sáng ra không ai nói gì với bạn.'; }
      X.add('h', 3); G.trajBump(S, { dao: .3 }); if (X.chance(.5)) { S.flags.outcast = true; X.add('so', -12); return 'Làng nông kịp dựng rào. Có người trong trại thấy dấu chân bạn đi xuống thung lũng đêm ấy. Bạn bị đuổi khỏi trại.'; }
      X.add('so', -2); return 'Làng nông kịp dựng rào; đoàn quay về tay trắng, không ai biết vì sao.'; },
    auto: S => S.traits.bold > .45 ? 'ride' : S.traits.pious > .7 && S.traits.social < .4 ? 'warn' : 'stay'
  });

  // ─────────── Vài nút cho tộc khác ───────────
  add('elf', [
    // Dalish của Dragon Age: lễ trưởng thành khắc mặt, phải im lặng suốt buổi, kêu đau thì chưa đủ lớn.
    { id: 'elf_inked', st: ['teen', 'adult'], rep: true, gap: 2, c: S => S.flags.elfInk !== true && (kin(S) || G.raceHome(S)) && G.RACES.elf.adult * .7 <= S.age * G.RACES.elf.ypt, w: 4, run(S, X) {
        if (X.chance(.35 + S.traits.bold * .5)) { S.flags.elfInk = true; X.add('so', 6); X.add('h', 4);
          return { t: 'Người giữ lễ vẽ lên mặt bạn những đường gân lá bằng nhựa cây và mũi kim gai, từ trưa tới khi trăng lên. Bạn không kêu một tiếng. Sáng ra cả tộc gọi bạn là người lớn.', k: 'big', o: 'ok', f: 'Tiên Tộc không định tuổi cho lễ này: kêu đau là chưa đủ lớn.' }; }
        S.flags.elfInk = 'wait'; X.add('h', -4);
        return { t: 'Tới đường gân thứ bảy thì bạn bật kêu. Người giữ lễ đặt kim xuống, bảo năm sau quay lại. Không ai trách bạn, và chính vì thế bạn thấy xấu hổ.', k: 'bad', o: 'cry' }; } },
    { id: 'elf_hart', st: AD, rep: true, gap: 5, c: S => G.raceHome(S), w: 1.2, run(S, X) { X.gain('Taming', 3); X.add('h', 3);
        return { t: 'Một con hươu trắng đi theo đoàn dời trại suốt ba ngày, rồi đứng lại ở chỗ cả tộc dựng lều năm ấy. Bô lão bảo rừng đã chọn chỗ thay mình.', k: 'good' }; } },
    { id: 'elf_song', st: AD, c: S => !S.flags.elfSong && (S.mastery.Arcane || 0) >= 10, w: 1.5, tree: { dir: { phap: 1, tri: 1 } }, run(S, X) {
        S.flags.elfSong = true; X.gain('Arcane', 4); X.add('sm', 3);
        return { t: 'Người giữ khúc cổ dạy bạn một khúc hát dài chín đêm. Hát đúng thì sương đọng lại thành chữ trên lá; hát sai một nốt thì phải bắt đầu lại.', k: 'good' }; } }
  ]);
  add('beastfolk', [
    { id: 'bst_mark', st: ['teen'], c: S => kin(S) || G.raceHome(S), w: 3, run(S, X) { X.add('so', 4);
        return { t: 'Lần đầu bạn được đi tuần ranh đất săn của bầy một mình, cào dấu lên vỏ cây ở từng góc. Kẻ lạ ngửi thấy là biết đất này đã có chủ.', k: 'good' }; } },
    { id: 'bst_pack_hunt', st: AD, rep: true, gap: 3, c: S => kin(S) || G.raceHome(S), w: 1.8, tree: { dir: { vo: 1, gia: .5 } }, run(S, X) {
        const g = Math.round(med(S, X) * .2); X.money(g); X.gain('Unarmed', 2); X.add('so', 2);
        return { t: `Bầy săn đêm không trăng. Mỗi người một hướng, không ai nói một tiếng, chỉ có tiếng gầm gừ khẽ báo chỗ. Con mồi chạy đúng vào chỗ bạn nằm chờ. Phần chia của bạn: ${G.coin(g)}.`, k: 'good' }; } },
    { id: 'bst_intruder', st: AD, rep: true, gap: 6, c: S => kin(S) || G.raceHome(S), w: 1, run(S, X) {
        if (X.chance(odds(S, X, .5))) { X.add('so', 4); S.fame += 1; return { t: 'Mùi lạ trên ranh đất săn: một con đực của bầy khác. Bạn đối mặt với nó ở bờ suối, nhe nanh cho tới khi nó cúi đầu bỏ đi.', k: 'good', o: 'win' }; }
        X.add('hl', -8); X.cond('wound');
        return { t: 'Mùi lạ trên ranh đất săn: một con đực của bầy khác. Hai bên lăn xuống bờ suối; bạn về với một bên tai rách.', k: 'bad', o: 'lose' }; } },
    { id: 'bst_cubs', st: ['adult'], c: S => kin(S) && S.family.kids.some(k => k.alive && k.age < 10), w: 2, run(S, X) { X.add('so', 4); X.add('h', 4);
        return { t: 'Ở bầy, con non là con của cả bầy. Mùa này con bạn ngủ ở hang nhà hàng xóm nhiều hơn ở nhà, và bạn thì nuôi ba đứa không phải con mình.', k: 'good' }; } }
  ]);
  add('fae', [
    // Văn học dân gian: trẻ đánh tráo (changeling) và kéo sắt trên nôi; đồ ăn của tiên giữ người phàm lại; nước chảy chặn Yêu Tinh.
    { id: 'fae_changeling', st: ['child'], c: S => stranger(S), w: 3, run(S, X) { X.add('h', -2); X.add('sm', 2);
        return { t: 'Nhà bạn ở giữa xóm loài người. Bà hàng xóm cứ thấy bạn là treo kéo sắt lên đầu nôi con bà, sợ bạn tráo mất đứa bé.', k: 'info', f: 'Người phàm tin Yêu Tinh hay đổi con mình lấy con người. Kéo sắt mở hình chữ thập treo trên nôi là để giữ con.' }; } },
    { id: 'fae_food', st: AD, c: S => G.raceHome(S), w: 1.5, run(S, X) { X.add('so', 3); X.add('h', 2);
        return { t: 'Một cậu chăn dê loài người lạc vào trảng, đói lả. Bạn suýt đưa cho cậu chiếc bánh mật thì nhớ ra: người phàm ăn đồ của tiên thì không về được nữa. Bạn dắt cậu ra tận bìa trảng rồi mới đưa bánh.', k: 'good' }; } },
    { id: 'fae_water', st: AD, rep: true, gap: 6, c: stranger, w: 1.2, run(S, X) { X.money(-Math.round(med(S, X) * .15)); X.add('h', -3);
        return { t: 'Bạn đuổi tên trộm túi tới bờ suối thì phải đứng lại. Yêu Tinh không bước qua được nước chảy. Hắn đứng bên kia, giơ túi tiền của bạn lên cười.', k: 'bad' }; } }
  ]);
  add('merfolk', [
    // Nix của truyện German: lên bờ đi lẫn với người, chỉ có vạt áo lúc nào cũng ướt.
    { id: 'mer_wethem', st: AD, rep: true, gap: 6, c: S => stranger(S) && isTown(S), w: 1.3, tree: { theme: 'stranger' }, run(S, X) { X.add('h', -3); X.add('so', -2);
        return { t: `Người ở ${homeName(S, X)} để ý vạt áo bạn lúc nào cũng ướt, kể cả giữa trưa nắng. Một bà cụ làm dấu khi bạn đi qua.`, k: 'bad' }; } },
    { id: 'mer_tidesong', st: AD, rep: true, gap: 4, c: S => seaSide(S) && kin(S), w: 1.5, run(S, X) { X.gain('Arcane', 2); X.add('so', 3);
        return { t: 'Đêm nước lớn, cả đàn nổi lên ngoài rạn, hát cho con nước dâng. Giọng bạn lần đầu hòa được vào giọng các bà mẹ đàn.', k: 'good' }; } }
  ]);
  add('dragonkin', [
    // Dragonborn của D&D: anh chị em cùng lứa trứng đặt cho nhau tên lúc nhỏ; khi kết đôi, hai thị tộc thương lượng chia trứng.
    { id: 'drg_clutch', st: ['child'], w: 3.5, run(S, X) {
        const n = X.pick(['Đuôi Cháy', 'Hắt Hơi Lửa', 'Vảy Ngược', 'Cắn Đá', 'Ngủ Muộn']); S.flags.clutchName = n; X.add('so', 3);
        return { t: `Lũ cùng lứa trứng gọi bạn là "${n}". Người ngoài không được gọi cái tên ấy; người cùng lứa thì gọi tới già.`, k: 'info', f: 'Tên Long Nhân có ba phần: tên riêng, tên thị tộc, và tên lúc nhỏ do anh chị em cùng lứa đặt.' }; } },
    { id: 'drg_clutch_split', st: ['adult'], c: S => !!S.family.spouse && S.family.spouse.alive && S.family.spouse.race === 'dragonkin' && !S.flags.clutchSplit, w: 3, run(S, X) {
        S.flags.clutchSplit = true; X.add('so', 4); X.add('h', 3);
        return { t: `Lứa trứng đầu của bạn và ${first(S.family.spouse.name)} nằm trong hang ấm. Hai thị tộc ngồi ở đài lửa ba ngày để chia: quả nào mang tên bên nào, quả nào làm của hồi môn.`, k: 'info' }; } }
  ]);
  add('construct', [
    // Warforged của Eberron: không ngủ, nghỉ trong trạng thái bất động mà vẫn nghe, vẫn thấy.
    { id: 'cst_sentry', st: AD, rep: true, gap: 5, w: 1.4, run(S, X) { X.add('sm', 3);
        if (X.chance(.4)) { const g = Math.round(med(S, X) * .2); X.money(g); return { t: `Bạn nghỉ đêm ở góc kho, bất động. Hai tay buôn tưởng bạn đã tắt nên bàn chuyện giấu hàng ngay cạnh. Sáng ra bạn bán lại chuyện ấy cho chủ kho, được ${G.coin(g)}.`, k: 'good' }; }
        return { t: 'Bạn nghỉ đêm ở góc phòng, bất động. Cả nhà tưởng bạn đã tắt, ngồi kể chuyện của nhau tới khuya. Bạn nghe hết, và giữ hết.', k: 'info' }; } },
    { id: 'cst_ledger', st: AD, c: S => stranger(S) && !G.lawHere(S, 'construct_citizen') && isTown(S), w: 1.5, tree: { theme: 'stranger' }, run(S, X) { X.add('h', -6); X.add('so', -2);
        return { t: `Viên thư lại ở ${homeName(S, X)} ghi bạn vào sổ tài sản của xưởng, không vào sổ dân. Bạn hỏi lại; ông ta nhắc lại, chậm hơn, như nói với một cái máy.`, k: 'bad' }; } }
  ]);
  add('human', [
    { id: 'hum_parents_age', st: ['adult'], c: S => S.family.parents.some(p => p.alive && p.age >= 55), w: 1.5, run(S, X) { X.add('h', -2); X.add('so', 2);
        return { t: 'Về thăm nhà, bạn thấy tóc mẹ đã bạc trắng từ lúc nào. Ở loài người, mười năm đủ để một người đổi khác.', k: 'info' }; } },
    { id: 'hum_guild', st: ['teen', 'adult'], c: S => isTown(S) && !S.flags.humGuild, w: 1.2, run(S, X) { S.flags.humGuild = true; X.add('so', 3);
        return { t: `Phường thợ ở ${homeName(S, X)} họp đầu năm, đọc tên từng người học việc mới. Loài người không sống lâu để giữ nghề một mình, nên giữ bằng phường.`, k: 'info' }; } }
  ]);

  // ═════════ 2. Tín ngưỡng gốc ═════════
  // Gắn với đạo đang theo (S.faith), không gắn với tộc: người cải đạo cũng gặp. Trang duyệt xếp theo tộc gốc của đạo.
  const FAITH_EV = G.FAITH_EV = {};
  const addF = (faith, list) => { for (const e of list) { const c0 = e.c; e.c = c0 ? (S, X) => S.faith === faith && c0(S, X) : S => S.faith === faith; e.c.toString = () => (c0 || (() => true)).toString();
      e.tree = Object.assign({ body: 'living', theme: 'faith' }, e.tree || {}); e.faith = faith; EV.push(e); OWN.add(e.id); (FAITH_EV[faith] = FAITH_EV[faith] || []).push(e.id); } };
  addF('stone', [
    { id: 'fs_stone_oath', st: ['teen'], w: 4, tree: { theme: null }, run(S, X) { dev(S, 6); X.add('so', 3); S.flags.stoneOath = true;
        return { t: 'Bạn đặt tay lên Đá Thề ở đại sảnh và nói lời thề đầu đời: không bỏ lò, không bỏ nợ, không bỏ người cùng hầm. Đá không nói gì; tổ tiên trong đá thì nghe.', k: 'big', f: 'Lời thề trên Đá Thề không rút lại được. Ai phá thề thì tên bị đục khỏi vách.' }; } },
    { id: 'fs_stone_names', st: AD, rep: true, gap: 5, w: 1.8, run(S, X) { dev(S, 6); X.add('so', 2); X.add('h', 2);
        return { t: 'Ngày Đọc Vách: cả thị tộc đứng trước vách đại sảnh, người già nhất đọc to từng cái tên từ đời tổ tới năm ngoái. Đọc tới sáng mới hết.', k: 'good' }; } },
    { id: 'fs_stone_tomb', st: AD, c: S => !!parentDead(S) && !S.flags.stoneTomb, w: 3, run(S, X) { const p = parentDead(S); S.flags.stoneTomb = true; dev(S, 8); X.add('h', -2);
        return { t: `Bạn cùng thợ khắc của thị tộc đục một hốc trong vách đá cho ${p.role} bạn, đặt cây búa lên ngực, rồi xây kín lại. Tên ${p.role} được khắc ngay ngắn dưới tên ông bà.`, k: 'info' }; } }
  ]);
  addF('ancestor', [
    { id: 'fs_anc_bones', st: AD, rep: true, gap: 4, w: 1.6, run(S, X) { dev(S, 5); X.gain('Spirit', 2);
        return { t: 'Trước mùa săn, bạn nướng một xương vai cừu trên lửa rồi đọc vết nứt, hỏi tổ tiên nên đi về hướng nào. Vết nứt chỉ về phía gò đá; bạn đi về phía gò đá.', k: 'info' }; } },
    { id: 'fs_anc_wind', st: AD, rep: true, gap: 6, w: 1.2, run(S, X) { dev(S, 6); X.add('sm', 2);
        return { t: 'Đêm gió lớn, cả trại tắt lửa, ngồi im nghe tổ tiên đi qua thảo nguyên. Có ai đó gọi tên bạn trong gió, giọng giống ông nội.', k: 'info' }; } }
  ]);
  addF('totem', [
    { id: 'fs_totem_dream', st: ['teen'], w: 4, tree: { theme: null }, run(S, X) { const a = X.pick(['sói xám', 'báo đốm', 'gấu nâu', 'cáo đỏ', 'linh miêu']); S.flags.totemBeast = a; dev(S, 6); X.add('so', 3);
        return { t: `Đêm thứ ba ngủ dưới cột totem, bạn mơ thấy một con ${a} đi trước mình qua rừng, không quay đầu lại. Người giữ totem bảo đó là thú tổ của bạn; từ nay bạn không được săn loài ấy.`, k: 'big' }; } },
    { id: 'fs_totem_share', st: AD, rep: true, gap: 4, w: 1.8, run(S, X) { dev(S, 5); X.add('so', 3);
        return { t: 'Lễ chia mồi dưới trăng: miếng đầu tiên của mỗi con mồi đặt dưới chân cột totem cho thú tổ, miếng thứ hai cho con non, rồi người săn mới được ăn.', k: 'good' }; } }
  ]);
  addF('season', [
    { id: 'fs_season_turn', st: ['child'], w: 4, tree: { theme: null }, run(S, X) { dev(S, 5); X.add('h', 4);
        return { t: 'Lễ đổi mùa đầu đời của bạn: một Yêu Tinh già buộc sợi chỉ bạc lên cổ tay bạn. Khế ước đầu tiên: mùa xuân cho bạn đôi cánh, đổi lại tiếng khóc lúc mới sinh của bạn.', k: 'big' }; } },
    { id: 'fs_season_due', st: AD, rep: true, gap: 6, w: 1.6, run(S, X) { const w = X.pick(['một ký ức về mẹ', 'giọng hát của bạn trong một mùa', 'một năm tuổi']); dev(S, 6); X.gain('Arcane', 3); X.add('sm', -2);
        return { t: `Cuối mùa, mùa đòi lại phần của nó: lần này là ${w}. Bạn trả đủ. Mùa sau hoa trong trảng nở dày hơn chỗ bạn đứng.`, k: 'info' }; } }
  ]);
  addF('flame', [
    { id: 'fs_flame_watch', st: ['teen', 'adult'], rep: true, gap: 5, w: 1.8, run(S, X) { dev(S, 6); X.gain('Fire', 2);
        return { t: 'Đến lượt bạn giữ lửa trên đài của thị tộc: cả đêm ngồi bên ngọn lửa, thở vào nó mỗi khi gió lên. Tổ tiên thở cùng bạn.', k: 'good' }; } },
    { id: 'fs_flame_out', st: AD, c: S => !S.flags.flameOut, w: 1.2, run(S, X) { S.flags.flameOut = true; dev(S, 10); X.add('hl', -5); S.fame += 2;
        return { t: 'Bão đá làm tắt lửa đài lần đầu sau hai trăm năm. Bạn cùng các bô lão leo lên miệng núi lửa, ôm một hòn than từ dưới lòng núi về, bỏng tới khuỷu tay. Đài lửa sáng lại trước bình minh.', k: 'big' }; } }
  ]);
  addF('wild', [
    { id: 'fs_wild_grave', st: AD, c: S => !!parentDead(S) && !S.flags.wildGrave, w: 3, run(S, X) { const p = parentDead(S); S.flags.wildGrave = true; dev(S, 8); X.add('h', -2);
        return { t: `Bạn chôn ${p.role} dưới gốc rừng và trồng lên đó một cây sồi non. Theo đạo, người chết về với rễ; ai muốn nói chuyện với ${p.role} bạn thì ra ngồi dưới cây.`, k: 'info' }; } },
    { id: 'fs_wild_wake', st: AD, rep: true, gap: 5, w: 1.5, run(S, X) { dev(S, 5); X.gain('Taming', 2); X.add('h', 2);
        return { t: 'Lễ đánh thức rừng đầu xuân: cả làng đi chân trần, gõ gậy vào thân từng cây già, gọi nó dậy. Tới chiều thì chồi đầu tiên nhú.', k: 'good' }; } }
  ]);
  addF('deep', [
    { id: 'fs_deep_voice', st: AD, rep: true, gap: 6, w: 1.4, run(S, X) { dev(S, 7); X.gain('Soul', 2); X.add('sm', -2);
        return { t: 'Bạn lặn quá tầng nước tối, tới chỗ không còn cá. Từ dưới sâu có giọng gọi bạn bằng tên thật, giọng ấy kiên nhẫn như con nước. Bạn trồi lên, và mấy đêm liền không ngủ được.', k: 'info' }; } },
    { id: 'fs_deep_gift', st: AD, rep: true, gap: 5, c: seaSide, w: 1.4, run(S, X) { dev(S, 5); X.money(-Math.round(med(S, X) * .1));
        return { t: 'Đêm không trăng, bạn chèo ra chỗ biển đổi màu, thả xuống một chiếc vòng ngọc trai. Không có gì nổi lên. Theo đạo, như thế là đã nhận.', k: 'info' }; } }
  ]);
  addF('forge', [
    { id: 'fs_forge_part', st: AD, rep: true, gap: 8, c: S => (S.devotion || 0) >= 25, w: 1.4, run(S, X) { dev(S, 8); X.add('hl', 5); X.gain('Engineering', 3); X.add('sm', -2);
        return { t: G.RACES[S.race].construct ? 'Tư tế lò rèn thay cho bạn một khớp vai bằng thép rèn trong lễ. Khớp mới không kêu, và bạn nhớ khớp cũ hơn bạn tưởng.' : 'Tư tế lò rèn thay ngón tay bạn mất ở xưởng bằng một ngón đồng có khớp. Lúc đầu nó lạnh; tới mùa sau thì ấm như ngón thật.', k: 'info' }; } },
    { id: 'fs_forge_hymn', st: AD, rep: true, gap: 5, w: 1.4, run(S, X) { dev(S, 5); X.add('so', 2);
        return { t: 'Ngày lễ của Lò Rèn, cả xưởng gõ búa cùng một nhịp từ sáng tới tối. Không ai nói, chỉ có tiếng búa; đó là bài kinh của đạo.', k: 'good' }; } }
  ]);
  addF('light', [
    { id: 'fs_light_vigil', st: ['teen'], w: 2.5, tree: { theme: null }, run(S, X) { dev(S, 6); X.add('h', 3);
        return { t: 'Đêm trước lễ thêm sức, bạn quỳ trong đền tới sáng, tay cầm một ngọn nến không được để tắt. Lúc mặt trời lên, tu sĩ thổi tắt nó giúp bạn.', k: 'good' }; } },
    { id: 'fs_light_alms', st: AD, rep: true, gap: 5, w: 1.3, run(S, X) { dev(S, 6); X.add('so', 3); X.money(-Math.round(med(S, X) * .08));
        return { t: 'Ngày lễ của Quang Minh, bạn cùng đền phát bánh cho người nghèo ở cổng thành từ sáng tới trưa.', k: 'good' }; } }
  ]);
  addF('dark', [
    { id: 'fs_dark_debt', st: AD, rep: true, gap: 6, w: 1.3, run(S, X) { dev(S, 6); X.add('hl', -5);
        return { t: 'Một món nợ của giao kèo tới hạn. Bạn trả bằng máu, đúng một chén, trong hầm tế tối om. Không ai ghi gì; Hắc Giáo không cần sổ, nó nhớ.', k: 'info' }; } }
  ]);

  // ═════════ 3. Giọng theo giống loài: thêm chín sự kiện chung ═════════
  const KID = {
    dwarf: n => `${n} lẻn vào lò chung, đòi được kéo bễ như người lớn. Bạn cho nó kéo tới khi nó ngủ gục bên đe.`,
    orc: n => `${n} vật ngã con trai tù trưởng ở hội tộc. Cả trại cười, tù trưởng cũng cười.`,
    elf: n => `${n} ngồi cả buổi dưới gốc sồi rồi chạy về bảo bạn là cây vừa nói chuyện với nó.`,
    beastfolk: n => `${n} săn được con thỏ đầu tiên, tha về đặt trước cửa hang cho bạn.`,
    fae: n => `${n} đổi cái tên ở nhà của nó lấy một con đom đóm. Bạn mất nửa tháng mới đòi lại được.`,
    merfolk: n => `${n} lặn ra rạn ngoài một mình, mang về một con sao biển to bằng cái mâm.`,
    dragonkin: n => `${n} thổi được đốm lửa đầu tiên, làm sém râu ông nội.`
  };
  const BRAWL = {
    dwarf: ['Ẩu đả ở quán rượu vì một gã chê râu bạn thưa. Bạn mất một chiếc răng và được một người bạn.', 'Ở đại sảnh, hai họ cãi nhau xem lò nhà ai giữ lửa lâu hơn, rồi lật bàn. Bạn về với một bên mắt tím và một vại rượu được mời.'],
    orc: ['Bạn vật nhau với một gã trại bên tới khi cả hai cùng nằm xuống bùn. Sáng ra hai người uống chung một sừng rượu sữa ngựa.', 'Một gã trại bên chê con sói của bạn còi. Hai người vật nhau trước cả hội tộc tới khi gã phải nhận con sói của bạn to hơn.'],
    beastfolk: 'Hai bầy tranh nhau một vũng nước. Bạn lao vào vật con đầu của bầy bên, mất một miếng tai mà được cả bầy mình vỗ lưng.',
    dragonkin: 'Ẩu đả ở quán rượu: một gã gọi bạn là "thằn lằn". Bạn mất một chiếc vảy, còn quán mất một cái bàn cháy.'
  };
  const SUITOR = {
    dwarf: n => `Bạn hay gặp ${n} bên lò chung. Theo lệ, muốn ngỏ lời thì phải tự rèn một chiếc trâm cài râu.`,
    orc: n => `${n} vật ngã bạn ở hội tộc rồi chìa tay kéo bạn dậy. Mùa ấy bạn hay ghé lều nhà ${n}.`,
    elf: n => `Bạn hay gặp ${n} dưới tán Cây Mẹ. Hai người có thể ngồi cả buổi chiều mà không ai cần nói gì.`,
    beastfolk: n => `Bạn hay chạy cùng ${n} trong những đêm săn, vai kề vai.`,
    fae: n => `Sáng nào trước cửa nhà bạn cũng có một bông hoa lạ, không ký tên. Mùi hoa giống mùi tóc ${n}.`,
    merfolk: n => `Bạn hay bơi cùng ${n} ra rạn ngoài lúc con nước ròng.`,
    dragonkin: n => `Bạn hay gặp ${n} trên đài lửa trong những đêm giữ lửa.`
  };
  const INHERIT = {
    dwarf: c => `Một ông chú họ xa ở hầm khác mất, để lại cho bạn ${c} và cây búa của ông. Thị tộc mang tới tận cửa.`,
    orc: c => `Một người cùng máu chết trong trận săn; theo lệ trại, của cải chia cho người cùng máu. Phần của bạn: ${c}.`,
    dragonkin: c => `Một cụ cố trong thị tộc mất, để lại cho bạn ${c} từ kho riêng. Cả thị tộc tới đứng xem bạn nhận.`,
    construct: c => `Một Cơ Nhân cùng xưởng ngừng quay, để lại cho bạn ${c} và hộp phụ tùng của nó.`,
    elf: c => `Một người bà con xa của bạn đi về phía tây, để lại ${c} và một cây cung không ai kéo nổi.`
  };
  const COIN = {
    dwarf: 'Bạn nhặt được mấy đồng bạc cũ kẹt trong khe đá ở đường hầm bỏ hoang.',
    orc: 'Bạn nhặt được mấy đồng bạc trong túi một xác lính bên đường cái.',
    elf: 'Bạn tìm thấy mấy đồng bạc cũ trong hốc một cây sồi rỗng, không biết của ai giấu từ đời nào.',
    beastfolk: 'Bạn đào được mấy đồng bạc ở gốc cây, chỗ con cáo hay chôn đồ.',
    fae: 'Bạn đổi được mấy đồng bạc của một gã say bằng một câu đố hắn không giải nổi.',
    merfolk: 'Bạn nhặt được mấy đồng bạc dưới đáy vịnh, trong xác một con tàu đắm.',
    dragonkin: 'Bạn bới được mấy đồng bạc trong ổ đá cạnh hang ấp, chắc ai đó giấu.',
    construct: 'Bạn tìm thấy mấy đồng bạc trong bụng một cỗ máy hỏng ở phế xưởng.'
  };
  const DICE = {
    dwarf: ['Cược xem ai uống cạn vại trước ở đại sảnh: bạn thắng', 'Cược xem ai uống cạn vại trước ở đại sảnh: bạn thua'],
    orc: ['Bạn cược vào trận vật ở hội tộc, thắng', 'Bạn cược vào trận vật ở hội tộc, thua'],
    beastfolk: ['Bạn cược vào cuộc đua quanh bãi săn, thắng', 'Bạn cược vào cuộc đua quanh bãi săn, thua'],
    dragonkin: ['Bạn cược xem ai thổi lửa xa hơn, thắng', 'Bạn cược xem ai thổi lửa xa hơn, thua']
  };
  const TAX = {
    dwarf: c => `Hội đồng thị tộc thu phần cho lò chung và tường cổng: ${c}.`,
    orc: c => `Tù trưởng thu phần của trại cho mùa chiến: ${c}.`,
    beastfolk: c => `Bầy thu phần cho con đầu đàn và cho những nhà có con non: ${c}.`,
    dragonkin: c => `Thị tộc thu phần cho đài lửa và kho chung: ${c}.`,
    fae: c => `Đình thu phần cho hội mùa sau: ${c}. Không trả thì mùa sau không có hoa.`
  };
  const BLESS = {
    stone: 'Bô lão thị tộc chấm tro lò chung lên trán bạn, đọc tên bảy đời tổ cho bạn nghe lần đầu.',
    totem: 'Người giữ totem nhỏ một giọt máu thú lên trán bạn rồi bế bạn đi vòng quanh cột totem ba lần.',
    season: 'Một Yêu Tinh già buộc sợi chỉ bạc lên cổ tay bạn: lời chúc đầu đời, đổi lấy tiếng khóc đầu tiên.',
    flame: 'Ông nội hơ bạn qua lửa đài ba lần, không sém một chiếc vảy. Cả thị tộc reo lên.',
    ancestor: 'Bà đồng của trại thổi khói xương vào mặt bạn để tổ tiên nhận mặt đứa cháu mới.',
    wild: 'Tu sĩ rừng đặt bạn nằm trên rễ cây già một đêm, cho rừng biết có thêm một đứa trẻ.',
    deep: 'Mẹ ôm bạn lặn xuống chỗ nước tối, tới khi bạn mở mắt dưới nước mà không khóc.',
    forge: 'Tư tế lò rèn gõ búa ba lần lên đe cạnh nôi bạn, cho lò biết có thêm một người.'
  };
  const FEAST = {
    stone: 'Ngày Mở Lò Tổ: cả nước nhóm lửa các lò chung từ một hòn than của lò tổ, đọc tên tổ tiên rồi mở tiệc.',
    totem: 'Đêm Thú Tổ: các bầy kéo về cột totem lớn, chia mồi dưới trăng rồi hú tới sáng.',
    season: 'Hội đình đổi mùa: cả nước ký lại khế ước với đất. Ai có lời hứa chưa giữ thì phải giữ trước khi trăng lặn.',
    flame: 'Đêm Long Hỏa: mọi đài lửa trong nước cùng cháy cao, các thị tộc đọc tên tổ tiên từ thời còn có cánh.',
    ancestor: 'Lễ Gió Tổ: các trại tắt lửa, ngồi nghe gió ba đêm, rồi mổ bò mở tiệc mừng tổ tiên đã ghé.',
    wild: 'Lễ Rừng Già: cả nước đi chân trần vào rừng thiêng, không ai được bẻ một cành.',
    deep: 'Lễ Vực: cả nước thả đèn xuống biển đêm không trăng, đợi xem đèn nào bị kéo xuống.',
    forge: 'Ngày Lò Đúc Mẹ: các xưởng gõ búa cùng một nhịp, đọc số hiệu những người đã ngừng quay.'
  };
  // Lễ thử thiên phú (js/status.js cv_test) ở làng không có đền, trường: làm ở chỗ thiêng của tộc thay cho "nhà thầy cúng đầu làng".
  const TEST_AT = {
    dwarf: 'trước Đá Thề ở đại sảnh thị tộc', orc: 'trong lều bà đồng', elf: 'dưới gốc Cây Mẹ', beastfolk: 'dưới chân cột totem',
    fae: 'giữa vòng nấm của đình', merfolk: 'trong hang san hô của các bà mẹ đàn', dragonkin: 'trên đài lửa của thị tộc'
  };
  const nameOfKid = r => String(r.t).split(' nói muốn')[0];
  const VOICE2 = G.RACE_VOICE2 = {
    ad_kid: (S, X, r) => KID[S.race] ? KID[S.race](nameOfKid(r)) : null,
    tn_brawl: (S, X) => { const b = BRAWL[S.race]; return !b ? null : Array.isArray(b) ? X.pick(b) : b; },
    cv_test: (S, X, r) => TEST_AT[S.race] && G.amongKin(S) && r.t.includes(' ở nhà thầy cúng đầu làng') ? r.t.replace(' ở nhà thầy cúng đầu làng', ' ' + TEST_AT[S.race]) : null,
    ad_suitor: S => SUITOR[S.race] && S.flags.suitor ? SUITOR[S.race](S.flags.suitor.name) : null,
    ad_inherit: (S, X, r, dg) => INHERIT[S.race] ? INHERIT[S.race](G.coin(dg)) : null,
    ch_coin: S => COIN[S.race] || null,
    ad_dice: (S, X, r, dg) => DICE[S.race] ? `${DICE[S.race][dg > 0 ? 0 : 1]} ${G.coin(Math.abs(dg))}.` : null,
    ad_tax: (S, X, r, dg) => TAX[S.race] && G.amongKin(S) ? TAX[S.race](G.coin(-dg)) : null,
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
