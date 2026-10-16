/* Vạn Kiếp — SỰ KIỆN QUỐC GIA (bước 10 của docs/03: mục 8, 5.10; docs/04 mục 4, 5).
 * Mỗi đặc tính mẫu (50) và mỗi đặc trưng riêng (31) có một sự kiện, chỉ xảy ra khi nhân vật sống ở nước mang nó.
 * Thêm các sự kiện mục 8 còn thiếu: ân xá, lễ quốc giáo, nhắc lại sử, xóm bên xin nhập (trưởng khu), sứ thần, con đòi kế vị,
 * quan tham, tỉnh đòi tách (người cai trị), quê cũ đổi chủ (Bộ Xương).
 * Chạy ở kênh riêng (hệ con "realmev", mỗi lượt 35% một sự kiện), không lẫn vào G.EVENTS.
 * Tác dụng thế giới của đặc tính, đặc trưng (chiến tranh, nổi loạn, kế vị) nằm ở js/dynamic.js polityYear.
 */
window.LifeSim = window.LifeSim || {};
(function (G) {
  const J = window.JobLibrary;
  const nat = S => (G.here ? G.here(S).n : null);
  const tpl = (S, id) => { const n = nat(S); return !!n && n.template === id; };
  const qk = (S, id) => { const n = nat(S); return !!n && n.quirks.some(q => q.id === id); };
  const law = (S, id) => { const n = nat(S); return !!n && n.laws.includes(id); };
  const flesh = S => !S.undead && !G.RACES[S.race].construct;
  const med = (X, S) => G.median(X.reg(S));
  const atCap = S => { const n = nat(S), h = S.home && G.SET[S.home.settlement]; return !!n && !!h && h.id === n.capital; };
  const AD = ['adult', 'elder'], TA = ['teen', 'adult'], ALL = ['child', 'teen', 'adult', 'elder'];
  // Nhắc lại sử: một dòng biên niên của thế giới từ trước khi nhân vật sinh ra.
  const pastLine = S => { const H = (S.world.dyn && S.world.dyn.hist) || [], old = H.filter(h => h.y < S.birthYear); return old.length ? old[(S.age * 7919 + S.birthYear) % old.length] : null; };
  const E = [];
  const ev = (id, cond, st, w, run, o = {}) => E.push({ id, st, c: S => cond(S) && (!o.c || o.c(S)), w, run, rep: o.rep, gap: o.gap, undead: o.undead });
  const T = (id, st, run, o) => ev('tpl_' + id, S => tpl(S, id), st, o && o.w || 1.2, run, o || {});
  const Q = (id, st, run, o) => ev('qk_' + id, S => qk(S, id), st, o && o.w || 1, run, o || {});

  // ═════════ Đặc tính mẫu ═════════
  T('H1', AD, (S, X) => { if (S.faith === 'light') { S.devotion = Math.min(100, S.devotion + 8); S.fame += 1; return { t: 'Đạo quân thập tự đi qua, hát thánh ca suốt đêm. Bạn theo họ một quãng đường.', k: 'good' }; } X.add('h', -6); return { t: 'Đạo quân thập tự đi qua, hỏi từng nhà theo đạo nào. Bạn trả lời cẩn thận.', k: 'bad' }; });
  T('H2', AD, (S, X) => { const g = Math.round(med(X, S) * (.4 + X.power(S) * .15)); X.money(g); return { t: `Thương hội thuê thêm người giữ kho khi có tin chiến tranh. +${G.coin(g)}.`, k: 'good' }; });
  T('H3', TA.concat('elder'), (S, X) => { const n = nat(S); if (S.faith && n.faith && S.faith !== n.faith) { const f = Math.round(Math.max(10, S.gold * .2)); X.money(-f); X.add('h', -10); return { t: `Tòa dị giáo gọi bạn lên hỏi tội theo ${J.faiths[S.faith].nameVi}. Nộp phạt ${G.coin(f)} mới được về.`, k: 'bad' }; } if (S.faith === n.faith) { S.devotion = Math.min(100, S.devotion + 6); return { t: 'Bạn đứng xem tòa dị giáo xử một người lạ. Lòng tin của bạn chắc hơn, hay sợ hơn, khó nói.', k: 'info' }; } X.add('h', -3); return { t: 'Tòa dị giáo dán cáo thị khắp chợ.', k: 'info' }; });
  T('H4', TA, (S, X) => { X.gain('Sword', 3); X.gain('Shield', 3); X.add('so', 2); return { t: 'Quân đoàn duyệt binh qua quảng trường. Bạn tập theo những thế kiếm của họ.', k: 'info' }; });
  T('H5', AD, (S, X) => { if (S.flags.wanted && Object.keys(S.flags.wanted).length) { S.flags.wanted = {}; return { t: 'Liên minh Đất Lành ân xá mọi kẻ bị truy nã nơi khác. Tên bạn không còn trên tờ cáo thị nào.', k: 'good' }; } X.add('so', 4); return { t: 'Người tứ xứ đổ về Đất Lành. Bạn có thêm láng giềng mới.', k: 'good' }; });
  T('E1', ALL, (S, X) => { const h = pastLine(S); X.add('sm', 2); return { t: h ? `Bô lão kể chuyện năm ${h.y}: ${h.t}` : 'Bô lão kể chuyện từ thời chưa ai nhớ, đúng từng chi tiết.', k: 'info' }; });
  T('E2', TA, (S, X) => { if (law(S, 'ban_arcane')) return null; X.gain('Arcane', 4); return { t: 'Tháp pháp sư mở cửa cho người ngoài nghe giảng một tuần.', k: 'good' }; });
  T('E3', AD, (S, X) => { const n = nat(S); if (S.race !== n.race) { X.add('hl', -6); return { t: 'Đi rừng của Tiên Tộc mà không có người dẫn. Tên bay ra từ chỗ không thấy ai.', k: 'bad' }; } X.gain('Stealth', 3); X.gain('Bow', 2); return { t: 'Bạn theo đội tuần rừng học cách đứng im như một thân cây.', k: 'good' }; });
  T('E4', AD, (S, X) => { const g = Math.round(med(X, S) * .3); X.money(g); return { t: `Tàu lá ghé cảng, đổi hàng không lấy thuế. +${G.coin(g)}.`, k: 'good' }; });
  T('E5', TA, (S, X) => { X.gain('Stealth', 4); X.gain('Dagger', 2); return { t: 'Ở xứ này trẻ con chơi trò đi không ra tiếng. Bạn chơi giỏi hơn người ta tưởng.', k: 'info' }; });
  T('D1', AD, (S, X) => { const g = Math.round(med(X, S) * .25); X.money(g); return { t: `Đi đường hầm dưới núi, hàng tới sớm ba ngày. +${G.coin(g)}.`, k: 'good' }; });
  T('D2', AD, (S, X) => { X.add('so', 3); X.add('h', -2); return { t: 'Sổ Thù được đọc to ở đại sảnh. Mỗi cái tên là một mối nợ chưa đòi.', k: 'info' }; });
  T('D3', AD, (S, X) => { if (S.gold > med(X, S) * 15) { const g = Math.round(S.gold * .05); X.money(g); return { t: `Ngân hàng Mạch Bạc trả lãi tiền gửi. +${G.coin(g)}.`, k: 'good' }; } const g = Math.round(med(X, S) * 2); X.money(g); S.flags.debt = (S.flags.debt || 0) + g; return { t: `Bạn vay ngân hàng ${G.coin(g)}, lãi thấp.`, k: 'info' }; });
  T('D4', AD, (S, X) => { const z = X.recommendedZone(S); if (!z || S.hl < 45) return null; const enc = X.rollEncounter(z.zone); if (!enc) return null; const rec = X.fight(enc, false); if (S.dead) return null; const g = Math.round(med(X, S) * .4); if (rec.win) X.money(g); return { t: rec.win ? `Đội giữ cổng mời đi tuần một đêm. +${G.coin(g)}.` : 'Đi tuần với đội giữ cổng, bạn là người bị khiêng về.', k: rec.win ? 'good' : 'bad' }; });
  T('D5', AD, (S, X) => { const c = Math.round(med(X, S) * .8); if (S.gear >= 10 || S.gold < c) return null; X.money(-c); S.gear++; return { t: `Thợ rune khắc dấu lên giáp của bạn (${G.coin(c)}). Trang bị ${S.gear}/10.`, k: 'good' }; });
  T('O1', TA, (S, X) => { X.gain('Riding', 4); return { t: 'Bạn được cho một con ngựa thảo nguyên chưa thuần.', k: 'good' }; });
  T('O2', AD, (S, X) => { const win = X.chance(.3 + X.power(S) * .12); if (win) { S.fame += 2; return { t: 'Bạn thắng trận vật ở hội tộc. Tù trưởng nhớ mặt bạn.', k: 'good' }; } X.add('hl', -6); return { t: 'Bạn thua trận vật ở hội tộc, gãy hai cái răng.', k: 'bad' }; });
  T('O3', TA, (S, X) => { X.gain('Axe', 3); X.gain('Body', 2); return { t: 'Lò chiến đỏ lửa cả năm. Bạn kéo bễ và học cách vung rìu.', k: 'info' }; });
  T('O4', AD, (S, X) => { if (!S.world.dyn.wars.length) { X.add('so', 2); return { t: 'Năm nay không ai thuê kiếm. Cả trại ngồi mài lưỡi chờ.', k: 'info' }; } const g = Math.round(med(X, S) * 1.2); X.money(g); X.add('hl', -5); return { t: `Một nước xa thuê cả trại đi đánh trận. Bạn về với ${G.coin(g)} và một vết sẹo.`, k: 'good' }; });
  T('O5', ALL, (S, X) => { const L = G.local(S); X.add('sm', 1); return { t: L.plague || L.war ? 'Tổ tiên báo mộng: lửa và bệnh đang tới. Sáng ra cả làng đóng cửa.' : 'Đồng cốt nhập tổ tiên, nhắc bạn sửa lại mộ ông.', k: 'info' }; });
  T('B1', AD, (S, X) => { X.add('so', 6); return { t: 'Bầy họp dưới trăng. Ai cũng có tiếng nói.', k: 'good' }; });
  T('B2', AD, (S, X) => { X.gain('Bow', 3); X.money(Math.round(med(X, S) * .2)); return { t: 'Hội Thợ Săn chia phần thịt sau mùa săn lớn.', k: 'good' }; });
  T('B3', TA, (S, X) => { X.gain('Riding', 2); X.gain('Taming', 3); return { t: 'Bạn thuần được một con thú cưỡi của tộc.', k: 'good' }; });
  T('B4', AD, (S, X) => { if (!['herder', 'farmer'].includes(S.work)) return null; const g = Math.round(med(X, S) * .5); X.money(g); return { t: `Đàn gia súc sinh sôi. +${G.coin(g)}.`, k: 'good' }; });
  T('B5', ALL, (S, X) => { X.add('h', 3); return { t: 'Cả thành đổ ra xem một người thách đấu nhà vua. Vua vẫn là vua.', k: 'info' }; });
  T('F1', AD, (S, X) => { if (S.race === 'fae') return null; X.add('h', -6); S.gold = Math.round(S.gold * .9); return { t: 'Bạn ngồi nghe nhạc ở hội Tiên một đêm. Khi về, mùa đã đổi và nhà đã có người khác thuê.', k: 'bad' }; });
  T('F2', ALL, (S, X) => { if (!flesh(S)) return null; X.add('hl', -3); return { t: 'Tuyết không tan dù đã sang hè.', k: 'bad' }; });
  T('F3', AD, (S, X) => { if (S.gear >= 10) return null; S.gear++; X.add('sm', -4); return { t: `Bạn đổi một ký ức tuổi thơ lấy món giáp tốt. Không nhớ nổi mình đã quên gì. Trang bị ${S.gear}/10.`, k: 'info' }; });
  T('F4', AD, (S, X) => { X.add('hl', -1); X.money(-Math.round(med(X, S) * .2)); return { t: 'Con đường quen tự đổi hướng. Bạn lạc ba ngày trong chính xứ mình.', k: 'bad' }; });
  T('F5', ['child'], (S, X) => { if (S.flags.prophecy) return null; S.flags.prophecy = X.pick(['sẽ cứu một nước', 'sẽ chết dưới móng rồng', 'sẽ lập một làng bên sông', 'sẽ không bao giờ già', 'sẽ đội vương miện của người khác', 'sẽ phản bội người thầy']); return { t: `Nhà tiên tri nói: đứa trẻ này ${S.flags.prophecy}.`, k: 'big' }; }, { w: 4 });
  T('M1', AD, (S, X) => { const g = Math.round(med(X, S) * .35); X.money(g); return { t: `Hải lộ đông tàu. Ai sống ở cảng cũng kiếm thêm. +${G.coin(g)}.`, k: 'good' }; });
  T('M2', TA, (S, X) => { X.gain('Spear', 3); X.gain('Throwing', 2); return { t: 'Bạn làm thủy thủ học việc một mùa trên tàu chiến.', k: 'info' }; });
  T('M3', AD, (S, X) => { if (S.faith === 'deep') S.devotion = Math.min(100, S.devotion + 6); X.add('h', 3); return { t: 'Đêm rằm có tiếng hát dưới biển. Tàu của nước này ra khơi không sợ gì.', k: 'good' }; });
  T('M4', AD, (S, X) => { if (['sailor', 'merchant', 'fisher'].includes(S.work)) { const f = Math.round(med(X, S) * .4); X.money(-f); return { t: `Băng cướp biển chặn thuyền, lấy ${G.coin(f)} tiền mãi lộ.`, k: 'bad' }; } X.add('so', 2); return { t: 'Băng cướp biển ghé quán uống rượu, trả tiền sòng phẳng.', k: 'info' }; });
  T('M5', ALL, (S, X) => { if (S.race === 'merfolk') { X.add('hl', 3); return { t: 'Bạn ngủ dưới làng nước, nghe san hô lớn.', k: 'good' }; } X.add('h', -2); return { t: 'Làng của nước này ở dưới biển. Bạn đứng trên bờ đợi người ta nổi lên.', k: 'info' }; });
  T('R1', AD, (S, X) => { if (S.race === 'dragonkin') { S.fame += 2; return { t: 'Huyết thống rồng trong bạn được tộc trưởng công nhận.', k: 'good' }; } X.add('so', -3); return { t: 'Ở xứ này chỉ Long Nhân được phong tước. Người ta nhìn bạn như khách.', k: 'info' }; });
  T('R2', ALL, (S, X) => { X.add('so', 4); return { t: 'Mùa ấp trứng: cả tộc thay nhau canh hang ấm dưới núi lửa.', k: 'good' }; });
  T('R3', AD, (S, X) => { if (S.undead) { X.add('hl', -8); if (X.chance(.3) && !X.hasCond('hunted')) X.cond('hunted'); return { t: 'Thánh hỏa thắp khắp các ngả đường. Xương bạn kêu răng rắc khi đi ngang.', k: 'bad' }; } S.devotion = Math.min(100, S.devotion + 3); return { t: 'Lễ thánh hỏa cháy suốt ba đêm.', k: 'info' }; }, { undead: 'any' });
  T('R4', AD, (S, X) => { const f = Math.round(Math.max(5, S.gold * .15)); X.money(-f); X.add('h', -5); return { t: `Lính của bạo chúa thu thuế lần thứ hai trong năm: ${G.coin(f)}.`, k: 'bad' }; });
  T('R5', AD, (S, X) => { X.gain('Spirit', 3); return { t: 'Bạn được cử canh giấc rồng một đêm. Không ai được ngủ, không ai được hát.', k: 'info' }; });
  T('C1', ALL, (S, X) => { if (G.RACES[S.race].construct) { X.add('so', 5); return { t: 'Dây chuyền đúc thêm một lứa Cơ Nhân. Bạn dạy chúng những bước đầu.', k: 'good' }; } X.add('sm', 2); return { t: 'Bạn đứng xem dây chuyền đúc người.', k: 'info' }; });
  T('C2', TA, (S, X) => { X.gain('Engineering', 4); return { t: 'Xưởng của Hội Đồng Bánh Răng nhận người học việc.', k: 'good' }; });
  T('C3', AD, (S, X) => { if (S.world.dyn.wars.some(w => w.a === nat(S).idx || w.b === nat(S).idx)) { X.add('h', -4); return { t: 'Giao thức chiến: không cầu hòa. Lệnh tổng động viên dán ở mọi cổng.', k: 'bad' }; } X.gain('Shield', 2); return { t: 'Diễn tập theo giao thức, đúng tới từng giây.', k: 'info' }; });
  T('C4', AD, (S, X) => { const g = Math.round(med(X, S) * .3); X.money(g); return { t: `Hàng tới đúng giờ, thương nhân thưởng. +${G.coin(g)}.`, k: 'good' }; });
  T('C5', AD, (S, X) => { if (G.RACES[S.race].construct) { X.add('h', 8); return { t: 'Lễ Phá Xích: Cơ Nhân được đọc tên như công dân.', k: 'good' }; } X.add('so', 2); return { t: 'Lễ Phá Xích, cả phố tháo xiềng treo lên cột.', k: 'info' }; });
  T('S1', AD, (S, X) => { if (S.undead) { X.add('so', 5); return { t: 'Đội quân không chết diễu qua. Bạn đi cùng hàng.', k: 'good' }; } X.add('h', -4); return { t: 'Đội quân không chết diễu qua đêm. Không con chó nào sủa.', k: 'bad' }; }, { undead: 'any' });
  T('S2', AD, (S, X) => { S.devotion = Math.min(100, S.devotion + 5); return { t: 'Đêm sám hối: người sống và người chết quỳ chung một sảnh.', k: 'info' }; }, { undead: 'any' });
  T('S3', TA.concat('elder'), (S, X) => { if (law(S, 'ban_death')) return null; X.gain('Necromancy', 3); X.gain('Soul', 2); return { t: 'Thư viện người chết cho mượn sách. Thủ thư không thở.', k: 'info' }; }, { undead: 'any' });
  T('S4', AD, (S, X) => { X.add('hl', -1); return { t: 'Đất chết lan thêm một dặm. Cây không mọc lại.', k: 'bad' }; }, { undead: 'any' });
  T('S5', AD, (S, X) => { if (S.undead) { X.add('so', 4); return { t: 'Ở đây Bộ Xương trỗi dậy được làm giấy công dân.', k: 'good' }; } const c = Math.round(med(X, S) * .3); X.money(-c); return { t: `Bạn thuê chỗ chôn cho tổ tiên ở nghĩa trang Mộ Đá (${G.coin(c)}).`, k: 'info' }; }, { undead: 'any' });

  // ═════════ Đặc trưng riêng ═════════
  Q('young_ruler', AD, (S, X) => { X.add('h', -2); return { t: `${nat(S).ruler ? nat(S).ruler.title + ' ' + nat(S).ruler.name : 'Người cai trị'} còn trẻ, ra lệnh nhiều hơn nghe.`, k: 'info' }; });
  Q('old_ruler', AD, (S, X) => ({ t: `Người ta thì thầm ${nat(S).ruler ? nat(S).ruler.name : 'nhà vua'} không qua nổi mùa đông.`, k: 'info' }));
  Q('two_lines', AD, (S, X) => { X.add('so', -3); return { t: 'Hai dòng họ tranh ngôi chia cả phố làm đôi. Chào sai người là mất khách.', k: 'bad' }; });
  Q('gold_mine', AD, (S, X) => { if (S.work !== 'miner') return null; const g = Math.round(med(X, S) * .8); X.money(g); return { t: `Mạch vàng mới trong mỏ. +${G.coin(g)}.`, k: 'good' }; });
  Q('famine', ALL, (S, X) => { if (!flesh(S)) return null; X.add('hl', -3); X.add('h', -4); return { t: 'Nạn đói kéo dài. Bánh mì đắt bằng thịt.', k: 'bad' }; }, { rep: true, gap: 4 });
  Q('great_port', AD, (S, X) => { const g = Math.round(med(X, S) * .3); X.money(g); return { t: `Cảng lớn có tàu từ khắp nơi. +${G.coin(g)}.`, k: 'good' }; });
  Q('master_craft', AD, (S, X) => { const c = Math.round(med(X, S) * 1.2); if (S.gear >= 10 || S.gold < c) return null; X.money(-c); S.gear++; return { t: `Thợ bậc thầy rèn cho bạn (${G.coin(c)}). Trang bị ${S.gear}/10.`, k: 'good' }; });
  Q('corruption', AD, (S, X) => { const f = Math.round(med(X, S) * .3); X.money(-f); return { t: `Quan thu thuế đòi thêm "phí giấy tờ" ${G.coin(f)}.`, k: 'bad' }; }, { rep: true, gap: 5 });
  Q('elite_army', TA, (S, X) => { X.gain('Sword', 2); X.gain('Spear', 2); return { t: 'Bạn xem quân tinh nhuệ tập trận, về tập theo.', k: 'info' }; });
  Q('weak_army', AD, (S, X) => { X.add('h', -3); return { t: 'Lính canh cổng ngủ gật. Ai cũng biết, không ai nói.', k: 'info' }; });
  Q('strong_navy', TA, (S, X) => { X.gain('Spear', 2); X.add('so', 2); return { t: 'Thủy quân về cảng sau chuyến tuần.', k: 'info' }; });
  Q('monster_march', AD, (S, X) => { const zz = X.recommendedZone(S); if (!zz || S.hl < 45) return null; const enc = X.rollEncounter(zz.zone); if (!enc) return null; const rec = X.fight(enc, false); if (S.dead) return null; if (rec.win) S.fame += 1; return { t: rec.win ? 'Quái từ biên giới tràn qua. Bạn đứng cùng dân quân đẩy lui.' : 'Quái từ biên giới tràn qua. Bạn phải chạy.', k: rec.win ? 'good' : 'bad' }; });
  Q('relic', AD, (S, X) => { S.devotion = Math.min(100, S.devotion + 8); X.add('h', 3); return { t: 'Thánh tích được rước qua phố. Bạn chạm tay vào hòm kính.', k: 'good' }; });
  Q('heresy', AD, (S, X) => { const n = nat(S); if (S.faith && n.faith && S.faith !== n.faith) { X.add('h', -6); return { t: 'Thanh trừng dị giáo. Bạn trốn ba ngày trong hầm rượu.', k: 'bad' }; } return { t: 'Người ta đốt một nhà nguyện ngầm ở ngoại ô.', k: 'info' }; });
  Q('tolerance', AD, (S, X) => { X.add('h', 3); return { t: 'Ở đây đền thờ của ba đạo nằm chung một phố.', k: 'good' }; });
  Q('lord_shrine', AD, (S, X) => { X.add('so', 3); return { t: 'Dân dâng lễ ở đền chúa vùng. Năm nay chúa vùng không đánh làng.', k: 'info' }; });
  Q('old_feud', AD, (S, X) => { X.add('so', 2); X.add('h', -2); return { t: 'Lễ nhớ mối thù truyền kiếp: trẻ con học tên kẻ thù trước tên mình.', k: 'info' }; });
  Q('royal_match', AD, (S, X) => { X.add('h', 4); return { t: 'Đám cưới hoàng gia với nước đồng minh. Cả nước nghỉ ba ngày.', k: 'good' }; });
  Q('vassal', AD, (S, X) => { const f = Math.round(med(X, S) * .15); X.money(-f); return { t: `Nộp cống cho nước bảo hộ: mỗi nhà ${G.coin(f)}.`, k: 'bad' }; });
  Q('xenophobia', AD, (S, X) => { const n = nat(S); if (S.race === n.race) return { t: 'Cáo thị mới cấm ngoại tộc mua đất.', k: 'info' }; X.add('so', -5); X.add('h', -4); return { t: 'Người ta khạc nhổ khi bạn đi qua chợ.', k: 'bad' }; });
  Q('fading_empire', AD, (S, X) => { X.add('h', -3); const h = pastLine(S); return { t: h ? `Đế chế từng lớn hơn bây giờ nhiều. Người già nhắc: ${h.t}` : 'Tượng các vua cũ bị rêu phủ. Không ai lau.', k: 'info' }; });
  Q('new_realm', AD, (S, X) => { X.add('so', 3); return { t: 'Nước mới lập, cái gì cũng đang làm dở: luật, đường, cờ.', k: 'info' }; });
  Q('royal_curse', AD, (S, X) => ({ t: 'Ở kinh đô không ai nói to tên nhà vua: lời nguyền hoàng tộc chưa bao giờ ngủ.', k: 'info' }));
  Q('lost_treasure', AD, (S, X) => { const d = (G.realm.dungeons || []).find(x => x.nation === nat(S).idx); return d ? { t: `Người ta kể kho báu thất lạc của nước nằm dưới ${d.name}.`, k: 'info' } : null; });
  Q('academy', TA, (S, X) => { X.add('sm', 4); return { t: 'Học viện danh tiếng mở buổi giảng cho dân thường.', k: 'good' }; });
  Q('arena', AD, (S, X) => {
    const z = X.recommendedZone(S); if (!z || S.hl < 55 || S.level < 5) return null; const enc = X.rollEncounter(z.zone, { grade: 'elite' }); if (!enc) return null;
    const rec = X.fight(enc, false); if (S.dead) return null;
    if (rec.win) { const g = Math.round(med(X, S) * (.5 + X.ctier(S) * .4)); X.money(g); S.fame += 3; return { t: `Bạn thắng một trận ở đấu trường. Đám đông hô tên bạn. +${G.coin(g)}.`, k: 'big' }; }
    return { t: 'Bạn thua ở đấu trường, được khiêng ra qua cổng phụ.', k: 'bad' };
  }, { w: 1 });
  Q('assassins', TA, (S, X) => { X.gain('Stealth', 3); X.gain('Dagger', 2); return { t: 'Một người lạ dạy bạn cách đi trên mái nhà, rồi biến mất.', k: 'info' }; });
  Q('festival', ALL, (S, X) => { X.add('h', atCap(S) ? 6 : 3); return { t: 'Lễ hội lớn ở kinh đô: đèn lồng, rượu, đấu bò.', k: 'good' }; }, { rep: true, gap: 3 });
  Q('horses', TA, (S, X) => { X.gain('Riding', 3); return { t: 'Bạn cưỡi thử một con ngựa giống nổi tiếng của xứ.', k: 'good' }; });
  Q('sacred_grove', AD, (S, X) => { X.gain('Spirit', 2); X.add('h', 2); return { t: 'Bạn ngồi một đêm trong rừng thiêng. Không ai được mang rìu vào.', k: 'info' }; });
  Q('court_mage', TA, (S, X) => { if (law(S, 'ban_arcane')) return null; X.gain('Arcane', 3); return { t: 'Pháp sư cung đình thử phép trên tháp. Bạn học lỏm được một câu thần chú.', k: 'info' }; });

  // ═════════ Mục 8: sự kiện quốc gia, làng của mình, nước của mình, Bộ Xương ═════════
  ev('nt_amnesty', S => { const n = nat(S); return !!n && !!S.flags.wanted && !!S.flags.wanted[n.idx]; }, AD, 1.5, (S, X) => { delete S.flags.wanted[nat(S).idx]; return { t: `Vua mới của ${nat(S).name} ân xá. Tên bạn được gạch khỏi sổ truy nã.`, k: 'good' }; }, { undead: 'any' });
  ev('nt_faith_feast', S => { const n = nat(S); return !!n && !!n.faith && S.faith === n.faith; }, ALL, 2, (S, X) => { S.devotion = Math.min(100, S.devotion + 6); X.add('h', 3); return { t: `Lễ quốc giáo ${J.faiths[nat(S).faith].nameVi}: cả nước ăn chay ba ngày rồi mở tiệc.`, k: 'good' }; }, { rep: true, gap: 4 });
  ev('nt_history', S => ((S.world.dyn && S.world.dyn.hist) || []).some(h => h.y < S.birthYear), ['child', 'teen', 'adult', 'elder'], 1.5, (S, X) => { const h = pastLine(S); if (!h) return null; X.add('sm', 1); return { t: `Ông bà kể chuyện năm ${h.y}: ${h.t}`, k: 'info' }; }, { rep: true, gap: 8, undead: 'any' });
  ev('vl_join', S => { const r = S.roles; return !!r && r.head != null && !!G.SET[r.head]; }, AD, 2, (S, X) => { const h = G.SET[S.roles.head], n = X.int(30, 120); G._dyn.setField(S.world.dyn, h, 'urban', h.urban + n); X.add('so', 3); return { t: `Xóm bên xin nhập vào ${h.name}: thêm ${n} người, thêm một cánh đồng.`, k: 'good' }; }, { rep: true, gap: 6 });
  const myRealm = S => S.roles && S.roles.ruler != null && S.world.dyn.nat[S.roles.ruler] && S.world.dyn.nat[S.roles.ruler].alive;
  ev('rl_envoy', myRealm, AD, 2.5, (S, X) => {
    const k = S.roles.ruler, n = G.realm.nations[k], o = X.pick(G.realm.nations.filter(x => x.idx !== k && x.alive !== false)); if (!o) return null;
    n.relations[o.idx] = (n.relations[o.idx] || 0) + 1; o.relations[k] = (o.relations[k] || 0) + 1; X.money(Math.round(med(X, S) * 2));
    return { t: `Sứ thần ${o.name} tới dâng lễ. Quan hệ hai nước ấm lên.`, k: 'good' };
  }, { rep: true, gap: 3 });
  ev('rl_heir', S => myRealm(S) && (S.family.kids || []).some(k => k.alive && k.age >= G.RACES[S.race].adult), AD, 1.5, (S, X) => { const kid = S.family.kids.find(k => k.alive && k.age >= G.RACES[S.race].adult); X.add('h', -4); return { t: `${kid.name} hỏi khi nào thì tới lượt mình ngồi lên ngai.`, k: 'info' }; }, { rep: true, gap: 6 });
  ev('rl_corrupt', myRealm, AD, 2, (S, X) => { const d = S.world.dyn.nat[S.roles.ruler]; d.stab = Math.max(0, d.stab - .03); return { t: 'Quan coi kho ăn bớt lương thực. Dân kêu tới tận cổng thành.', k: 'bad' }; }, { rep: true, gap: 4 });
  ev('rl_secede', S => myRealm(S) && S.world.dyn.nat[S.roles.ruler].stab < .45, AD, 2, (S, X) => { const d = S.world.dyn.nat[S.roles.ruler]; d.stab = Math.max(0, d.stab - .05); return { t: 'Một tỉnh đòi tách ra. Bạn cử người đi dẹp, nhưng lời đồn còn đi nhanh hơn ngựa.', k: 'bad' }; }, { rep: true, gap: 3 });
  ev('nt_skhome', S => S.undead && S.flags.homeFlip > 0, AD, 2, (S, X) => ({ t: 'Bạn quay về quê cũ. Cờ trên cổng đã khác; không ai nhớ cái tên bạn mang lúc còn thịt.', k: 'info' }), { undead: true });

  // Kênh riêng: mỗi lượt 35% có một sự kiện quốc gia (không chiếm chỗ của sự kiện thường, để giữ nhịp đời như trước bước 10).
  G.NATION_EVENTS = E;
  G.nationEventYear = function (S, X) {
    if (!X.chance(.35)) return;
    const st = X.stage(S);
    const list = E.filter(e => e.st.includes(st) && !(S.undead ? !e.undead : e.undead === true) && !(S.recent[e.id] != null && (!e.rep || S.age - S.recent[e.id] < (e.gap || 1))) && (!e.c || e.c(S, X)));
    const ev = X.wpick(list, e => typeof e.w === 'function' ? e.w(S, X) : e.w);
    if (ev) G.runEvent(X, ev);
  };
  { const k = G.SYSTEMS.findIndex(s => s.id === 'noble'); G.SYSTEMS.splice(k + 1, 0, { id: 'realmev', when: S => !S.dead, run: (S, X) => G.nationEventYear(S, X) }); }
})(window.LifeSim);
