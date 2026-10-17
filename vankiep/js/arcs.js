/* Vạn Kiếp — MẠCH NGƯỜI QUEN, MẠCH ĐỜI THƯỜNG theo khuôn đầy đủ (docs/16 mục 10; người dùng yêu cầu 17/10/2026):
 * "ko còn mạch nào là mạch phụ cả, mạch phụ là khi nó giao với 1 phần cuộc đời của nhân vật và nhân vật ko theo mạch đó,
 * còn lại mỗi mạch đều có hoàn chỉnh. Và 1 mạch truyện có thể có nhiều kết". Người dùng chốt: nâng hết (cả mạch ngắn cũ),
 * kết theo cả đường đi (lối chọn, thử thách, tiến độ, cao trào), Cây Cốt Truyện một làn chung theo năm.
 * Nạp sau saga.js, dùng G.sagaApi.full(k, def) (js/saga.js mục 2): 5 hồi mở → chọn lối [quyết định] → thử thách → cao trào
 * [quyết định] → kết; def.end chọn kết theo cả đường đi; lối 'away' ở hồi chọn lối = đứng ngoài, mạch chạy nền (vai phụ):
 * cao trào là chuyện của người trong mạch (def.climax.bg), kết riêng.
 *   1. Mạch người quen (16): mở từ sự kiện có sẵn (story.js mục 3, 4). 2. Mạch đời thường (11): mọc từ quyết định thường (patchDec).
 * Hàm của mạch nhận (S, X, a, p): a = mạch đang mở (a.d dữ liệu riêng), p = người trong mạch (có thể null).
 */
window.LifeSim = window.LifeSim || {};
(function (G) {
  const J = window.JobLibrary, SA = G.sagaApi, API = G.storyApi;
  const { full, odds, med, cnt, AD, TAE } = SA;
  const { patchDec } = API;
  const nm = p => (p ? String(p.name).split(' ')[0] : 'người ấy');
  const ref = (S, p) => (p ? API.ref(S, p) : 'người ấy');
  const refE = (S, p) => (p ? API.refE(S, p) : 'người ấy');
  const sh = (S, a) => G.trajShare(S, a);
  const single = S => !(S.family.spouse && S.family.spouse.alive);
  const logit = d => 1 / (1 + Math.exp(-3 * d));
  const npcPow = (p, k) => 1.1 + 1.1 * (p ? p.tier : 0) + k;
  const vs = (S, X, p, k = 0, lo = .1, hi = .9) => G.clamp(logit(X.power(S) - npcPow(p, k)), lo, hi);   // khả năng thắng người trong mạch
  const regName = id => (G.REGION[id] ? G.REGION[id].nameVi : 'phương xa');
  const homeName = S => { const s = S.home.settlement != null && G.SET[S.home.settlement]; return s ? s.name : G.REGION[S.loc].nameVi; };
  const capName = S => { const n = G.here && G.here(S).n; return n && G.SET[n.capital] ? G.SET[n.capital].name : 'kinh đô'; };
  const workVi = p => (p && p.work && G.WORKS[p.work] ? G.WORKS[p.work].nameVi.toLowerCase() : null);
  const bond = (p, d) => { if (p) p.bond = G.clamp(p.bond + d, -100, 100); };
  const fame = (S, v) => { S.fame = G.clamp(S.fame + v, 0, 100); };
  const skill = (S, X, n) => { const d = X.dominant(S); X.gain(d ? d.skill : 'Body', n); };
  const kill = (S, p) => { if (p && p.alive) { p.alive = false; p.died = S.world.year; } };
  const pct = v => Math.round(v * 100) + '%';
  const ch = (k, label, sub = '') => ({ k, label, sub });
  const ADE = ['adult', 'elder'], CTA = ['child', 'teen', 'adult'], TA = ['teen', 'adult'];
  // Khoảng chờ chung của mạch không phải mạch chính (lượt): mỗi mạch đi chừng 10–30 lượt.
  const W = { open: [1, 12], knot: [1, 20], trial: [1, 20], climax: [1, 25], after: [1, 20] };
  // Hồi kết chạy cả khi người trong mạch đã mất ở cao trào (đỡ đòn, cứu không kịp…).
  const acts = (o = {}) => { const r = {}; for (const at of Object.keys(W)) r[at] = Object.assign({ wait: W[at] }, at === 'after' ? { dead: true } : {}, o[at] || {}); return r; };

  // Dấu hệ quả thêm cho các kết mới (js/saga.js mục 1 có phần còn lại).
  Object.assign(G.MARKS, {
    tiec_nuoi: { nameVi: 'Điều còn tiếc', tone: 'bad', fade: 12, d: 'Có một chuyện bạn đã đứng ngoài, và giờ thì muộn.', yr: (S, X) => X.add('h', -.2) },
    huynh_de: { nameVi: 'Anh em kết nghĩa', tone: 'good', fade: null, d: 'Có một người không cùng máu mà như ruột thịt.', w: { cm_help: 1.5, cm_visit: 1.4 },
      echo: { cm_help: 'Người tới đầu tiên là người anh em kết nghĩa năm nào.' }, yr: (S, X) => X.add('so', .3) },
    che_cho: { nameVi: 'Có người che chở', tone: 'good', fade: 25, d: 'Có người đủ thế lực đứng ra cho bạn khi cần.', w: { ad_tax: .7 } },
    nghe_thuoc: { nameVi: 'Biết nghề thuốc', tone: 'good', fade: null, d: 'Bạn học được cách cứu người.', yr: (S, X) => X.add('hl', .4) }
  });

  // ═════════ 1. Mạch người quen ═════════

  // ── Đối thủ (bị bắt nạt, kẻ luôn hơn một bậc, bạn cùng lớp, đệ tử phản sư) ──
  full('rival', { nameVi: 'Đối thủ', good: ['win', 'comeback', 'sworn', 'peace', 'outlast'],
    quest: (a, p) => `Vượt qua ${nm(p)}`,
    marks: { win: 'vuot_doi_thu', comeback: 'cao_thu', hollow: 'tieng_xau', lose: 'cay_dang', sworn: 'huynh_de', peace: 'ban_cu', shadow: 'tiec_nuoi', outlast: 'buong_bo' },
    sum: { win: (d, p) => `thắng ${nm(p)} trong trận phân định`, comeback: (d, p) => `thua ${nm(p)} cả thời trẻ rồi thắng ở trận cuối`, hollow: (d, p) => `thắng ${nm(p)} bằng một mánh không ai quên`,
      lose: (d, p) => `chưa một lần thắng nổi ${nm(p)}`, sworn: (d, p) => `từ đối thủ thành anh em kết nghĩa với ${nm(p)}`, peace: (d, p) => `làm lành với ${nm(p)}, đối thủ từ thuở bé`,
      no: (d, p) => `không nhận lời thách của ${nm(p)}`, shadow: (d, p) => `đứng ngoài nhìn ${nm(p)} thành danh`, outlast: (d, p) => `đỡ ${nm(p)} dậy lúc người từng hơn mình sa cơ` },
    gone: (S, p) => `Tin ${refE(S, p)} chết đến tai bạn. Không còn ai để bạn phải hơn nữa.`,
    beat: { any: ['Bạn tập thêm một canh giờ sau khi mọi người đã về. Ở đâu đó, {p} chắc cũng đang tập.', 'Có người nhắc tên {p} ở chợ. Bạn bước nhanh hơn.', 'Bạn khắc một vạch lên cột nhà: lần sau sẽ hơn {p}.'] },
    acts: acts({ open: { st: CTA }, climax: { st: ADE, when: (S, X) => ADE.includes(X.stage(S)) } }),
    open(S, X, a, p) {
      const what = X.stage(S) === 'child' ? X.pick(['cuộc thi chạy của lũ trẻ trong làng', 'buổi đọc chữ ở đền', 'trò đánh trận giả bên bờ sông'])
        : X.pick(['kỳ tuyển học trò của trường trong vùng', 'kỳ tuyển lính tuần của phủ', 'cuộc thi tay nghề ở chợ phiên']);
      if (X.rnd() < .3 + .4 * S.traits.bold) { a.d.lead = 1; X.add('h', 5); return { t: `Ở ${what}, bạn hơn ${ref(S, p)} một chút. ${nm(p)} đá tung đống cát rồi bỏ về.`, k: 'good', o: 'ahead', bond: -5 }; }
      a.d.lead = -1; X.add('h', -4); return { t: `Ở ${what}, ${ref(S, p)} lại hơn bạn, và cả đám cười theo.`, k: 'bad', o: 'behind', bond: -5 };
    },
    knot: { title: 'Kẻ luôn hơn một bậc', body: (S, X, a, p) => `${ref(S, p)} ${a.d.lead > 0 ? 'chưa nuốt trôi lần thua bạn' : 'vẫn đứng trên bạn ở mọi bảng tên'}. Người làng đã quen nói tên hai người liền nhau.`,
      choices: (S, X, a, p) => [ch('train', 'Tập tới khi hơn hẳn', 'Mất nhiều năm. Không ai giúp.'), ch('bond', `Đua mà không ghét ${nm(p)}`, 'Mời rượu sau mỗi lần thi. Người kia có thể coi là chế giễu.'),
        ch('trick', 'Chơi xấu một lần', 'Thắng chắc hơn. Lộ ra thì cả làng biết.'), ch('away', `Thôi đua với ${nm(p)}`, 'Đường ai nấy đi.')],
      apply(S, X, ch, a, p) {
        if (ch === 'train') { G.trajBump(S, { vo: .4 }); skill(S, X, 4); return 'Bạn dậy trước gà gáy, tập tới khi tay rớm máu. Mấy năm liền như thế.'; }
        if (ch === 'bond') { bond(p, 15); X.add('so', 2); return `Thi xong bạn mời ${nm(p)} một chén. ${nm(p)} nhìn bạn như nhìn kẻ lạ, rồi uống.`; }
        if (ch === 'trick') { G.trajBump(S, { am: .3 }); return `Bạn biết chỗ yếu của ${nm(p)}. Bạn ghi nó vào một góc trong đầu.`; }
        bond(p, 5); return `Bạn thôi đếm xem mình hơn hay kém ${nm(p)} bao nhiêu. Lạ là bạn ngủ ngon hơn.`;
      },
      auto: (S, X, a, p) => (S.traits.bold > .6 ? 'train' : S.traits.social > .6 ? 'bond' : sh(S, 'am') > .2 ? 'trick' : S.traits.bold < .3 ? 'away' : 'train') },
    trial: { base: (S, X, a, p) => (a.d.bg ? .3 + .5 * (p ? p.drive : .5) : .4 + .1 * (a.d.lead || 0) + (a.d.path === 'train' ? .15 : a.d.path === 'trick' ? .2 : .05)),
      run(S, X, a, ok, p) {
        if (a.d.bg) return ok ? { t: `Bạn không dự kỳ sát hạch năm ấy. ${nm(p)} đứng đầu bảng; tên ${nm(p)} được đọc to ở ba làng.`, k: 'info' } : { t: `Nghe nói ${nm(p)} trượt kỳ sát hạch năm ấy, say rượu đánh nhau ở chợ.`, k: 'info' };
        if (a.d.path === 'trick') { if (!ok) { a.d.caught = true; X.add('so', -6); return { t: `Mánh của bạn bị lộ giữa kỳ thi. Người ta nhìn bạn, rồi nhìn ${nm(p)}.`, k: 'bad' }; } return { t: `Kỳ thi năm ấy ${nm(p)} trượt chân đúng lúc quan trọng. Chỉ bạn biết vì sao.`, k: 'good' }; }
        return ok ? { t: `Kỳ sát hạch năm ấy tên bạn đứng trên tên ${nm(p)}. ${a.d.path === 'bond' ? `${nm(p)} là người đầu tiên tới chúc.` : `${nm(p)} xé tờ bảng ngay trước mặt mọi người.`}`, k: 'good', bond: a.d.path === 'bond' ? 10 : -10 }
          : { t: `Kỳ sát hạch năm ấy ${nm(p)} đứng đầu bảng, trên tên bạn ba bậc. Đêm đó bạn không ngủ.`, k: 'bad' };
      } },
    climax: { title: 'Trận phân định',
      body: (S, X, a, p) => `${ref(S, p)} chặn đường bạn ${X.pick([`giữa chợ ${homeName(S)}`, 'trước sân đấu của hội võ', 'ở cổng làng'])}: "Từ bé tới giờ, ta với ngươi chưa lần nào phân định cho ra lẽ."`,
      choices: (S, X, a, p) => [ch('fight', 'Nhận lời đấu', `Đấu tay đôi, không tới chết. Khả năng thắng chừng ${pct(vs(S, X, p, .4 * p.drive - (a.d.ok ? .15 : 0)))}.`),
        ch('peace', 'Mời rượu, bỏ qua chuyện cũ', 'Phải ăn nói khéo; người kia có thể không nhận.'), ch('no', 'Bỏ đi', 'Không mất gì ngoài thể diện.')],
      apply(S, X, ch, a, p) {
        if (ch === 'fight') {
          if (X.rnd() < vs(S, X, p, .4 * p.drive - (a.d.ok ? .15 : 0))) { fame(S, 3); X.add('h', 10); bond(p, 10); cnt(S, 'rvWin'); return { t: `Bạn quật ${nm(p)} ngã ở hiệp thứ ba. ${nm(p)} đứng dậy, phủi đất, gật đầu một cái rồi đi.`, o: 'win' }; }
          X.add('hl', -10); X.add('h', -8); if (X.chance(.25)) X.cond('wound'); return { t: `${nm(p)} thắng. Bạn nằm trên đất nghe người ta hò reo cho kẻ khác.`, o: 'lose' };
        }
        if (ch === 'peace') {
          if (X.rnd() < .35 + .5 * S.traits.social + (p.bond + 100) / 400 + (a.d.path === 'bond' ? .2 : 0)) { p.bond = Math.max(p.bond, 20); p.role = 'ban'; X.add('h', 6); return { t: `${nm(p)} nhìn chén rượu lâu lắm rồi mới uống cạn.`, o: 'peace' }; }
          X.add('so', -3); return { t: `${nm(p)} hất chén rượu xuống đất.`, o: 'no' };
        }
        X.add('so', -4); X.add('h', -3); return { t: 'Sau lưng bạn có tiếng cười.', o: 'no' };
      },
      auto: (S, X, a, p) => (X.power(S) >= npcPow(p, .4 * p.drive) || S.traits.bold > .6 ? 'fight' : S.traits.social > .55 || a.d.path === 'bond' ? 'peace' : 'no'),
      bg: (S, X, a, p) => (a.d.ok ? { t: `${ref(S, p)} giờ đã là ${G.tierName(Math.max(1, p.tier))}, đi đâu cũng có người theo. Không ai còn nhớ hai người từng đua nhau.`, k: 'info', o: 'rise' }
        : { t: `${ref(S, p)} sa cơ: mất việc, nợ nần, ngồi một góc quán uống rượu một mình.`, k: 'info', o: 'fall' }) },
    end(S, X, a, p, o) {
      if (a.d.bg) return o === 'rise' ? 'shadow' : 'outlast';
      if (o === 'win') return a.d.path === 'trick' ? 'hollow' : a.d.ok ? 'win' : 'comeback';
      if (o === 'peace') return a.d.path === 'bond' && a.d.ok ? 'sworn' : 'peace';
      return o;
    },
    after: {
      win: (S, X, a, p) => { p.loc = X.pick(G.REGIONS).id; return { t: `Sau trận ấy ${nm(p)} rời ${homeName(S)}. Nhiều năm sau bạn nghe ${nm(p)} sống ở ${regName(p.loc)}, hay kể chuyện thua bạn như kể chuyện vui.`, bond: 15 }; },
      comeback: (S, X, a, p) => { X.addXp(60); return { t: `Cả làng nhớ trận ấy: kẻ thua suốt thời trẻ thắng ở trận cuối. Bọn trẻ trong làng tập theo thế bạn dùng hôm đó.`, bond: 10 }; },
      hollow: (S, X, a, p) => { X.add('h', -4); return { t: `Bạn thắng, nhưng ai cũng nhớ kỳ thi năm nào. ${nm(p)} không ghét bạn nữa; ${nm(p)} chỉ thôi nhìn bạn.`, k: 'bad' }; },
      lose: (S, X) => { G.trajBump(S, { vo: .3 }); X.addXp(60); return { t: 'Người ta kể khắp nơi chuyện bạn thua. Mấy năm liền bạn dậy sớm hơn cả làng, tập tới khi mặt trời lên.', k: 'bad' }; },
      sworn: (S, X, a, p) => { X.add('h', 8); X.add('so', 5); p.role = 'ban'; return { t: `Hai người cắt máu ăn thề dưới gốc đa đầu làng, trước mặt những người từng xem hai đứa đánh nhau. "Từ giờ ai đụng tới một đứa là đụng tới cả hai."`, bond: 30 }; },
      peace: (S, X, a, p) => { X.add('h', 8); X.add('so', 5); return p.wed ? { t: `${nm(p)} dắt đứa con trai tới nhờ bạn chỉ cho nó vài đường. "Nó giống ta hồi bé," ${nm(p)} nói, "cần có người trị."`, bond: 20 }
        : { t: `Mùa gặt nào ${nm(p)} cũng ghé nhà bạn. Hai người cãi nhau về chuyện hồi bé như hai ông già.`, bond: 20 }; },
      no: (S, X, a, p) => { X.add('so', -2); return `Người ta vẫn nhắc lần bạn bỏ đi trước mặt ${nm(p)}. Bạn để họ nhắc.`; },
      shadow: (S, X, a, p) => { X.add('h', -3); return { t: `Lần cuối bạn thấy ${nm(p)} là ở lễ hội, ngồi trên ghế dành cho người có tiếng. Bạn đứng dưới, lẫn trong đám đông, không ai biết hai người từng là đối thủ.`, k: 'bad' }; },
      outlast: (S, X, a, p) => { X.money(-Math.round(med(S, X) * .2)); X.add('h', 5); return { t: `Bạn gửi cho ${nm(p)} một bao gạo, không ghi tên. Năm sau ${nm(p)} tìm tới tận nhà, đứng ở cửa không nói được câu nào.`, bond: 25 }; }
    } });

  // ── Ơn cứu mạng (bạn mang ơn người khác; a.d.need: money / son / escort) ──
  full('grace', { nameVi: 'Ơn cứu mạng', good: ['paid', 'kin', 'late'],
    quest: (a, p) => `Trả ơn ${nm(p)}`,
    marks: { paid: 'giu_loi', kin: 'tinh_than', late: 'duoc_tin', tried: 'tiec_nuoi', unpaid: 'tieng_xau', others: 'cay_dang' },
    sum: { paid: (d, p) => `trả được ơn cứu mạng của ${nm(p)}`, kin: (d, p) => `thành người một nhà với ${nm(p)}, người từng cứu mạng mình`, late: (d, p) => `trả ơn ${nm(p)} muộn, nhưng trả đủ`,
      tried: (d, p) => `cố trả ơn ${nm(p)} mà không giữ được mảnh đất của nhà người ấy`, unpaid: (d, p) => `từ chối ${nm(p)}, người từng cứu mạng mình`, others: (d, p) => `để người khác trả thay món ơn của ${nm(p)}` },
    gone: (S, p) => `Tin ${refE(S, p)} mất. Món nợ cứu mạng, bạn chưa kịp trả.`,
    beat: { any: ['Bạn ghé nhà {p}, sửa giúp cái mái dột, không đợi ai nhờ.', 'Tết nào bạn cũng gửi sang nhà {p} một gói quà nhỏ.', 'Bạn kể cho con cháu nghe chuyện {p} kéo bạn khỏi dòng nước năm ấy.'] },
    acts: acts({ open: { st: TA, wait: [2, 15] }, knot: { st: ADE, when: (S, X) => ADE.includes(X.stage(S)) } }),
    open: (S, X, a, p) => ({ t: `Bạn lớn rồi mới hiểu hết chuyện năm ấy: ${nm(p)} đã lao xuống dòng nước xiết mà không biết bơi giỏi. Từ đó mùa nào bạn cũng ghé thăm.`, bond: 10 }),
    knot: { title: 'Món nợ cũ',
      body(S, X, a, p) { const amt = Math.round(med(S, X) * .6), z = X.reg(S).zones[0]; a.d.amt = amt;
        return { money: `${ref(S, p)} tìm tới. Năm nay mất trắng, ${nm(p)} cần ${G.coin(amt)} để giữ mảnh đất cuối cùng.`, son: `${ref(S, p)} tìm tới: con trai ${nm(p)} bị bắt đi phu, cần một người có tiếng nói đứng ra bảo lãnh.`,
          escort: `${ref(S, p)} tìm tới, nhờ bạn đi cùng qua ${z.nameVi}, nơi dạo này quái hay ra chặn đường.` }[a.d.need || 'money']; },
      choices: (S, X, a) => [ch('help', 'Giúp ngay', a.d.need === 'money' ? `Mất ${G.coin(a.d.amt)}.` : a.d.need === 'son' ? 'Phải lên phủ, nói chuyện với người có quyền.' : 'Một chuyến đi có đánh nhau.'),
        ch('later', 'Hứa sẽ giúp khi đủ sức', 'Bây giờ bạn chưa có gì trong tay.'), ch('away', 'Từ chối', 'Giữ được của, mất mặt với người trong vùng.')],
      apply(S, X, ch, a, p) {
        if (ch === 'away') { X.add('so', -6); X.add('h', -4); bond(p, -40); cnt(S, 'grNo'); return `${nm(p)} gật đầu, không nói gì, rồi đi.`; }
        if (ch === 'later') { bond(p, 5); return `${nm(p)} nghe bạn hứa, vỗ vai bạn một cái: "Ta không đòi. Ta chỉ hỏi thôi."`; }
        X.add('h', 6); X.add('so', 4); bond(p, 30); cnt(S, 'grHelp');
        if (a.d.need === 'money' || !a.d.need) { X.money(-a.d.amt); return 'Bạn đưa tiền, không lấy giấy nợ.'; }
        if (a.d.need === 'son') return G.standing(S, X).soc >= 1 || S.fame >= 10 ? 'Phủ nể mặt bạn. Con trai người đó về nhà trước mùa đông.' : 'Bạn lên phủ ba lần mới được gặp quan. Người con được tha, muộn mất một năm.';
        const z = X.reg(S).zones[0], enc = X.rollEncounter(z, { grade: 'normal' }), rec = enc ? X.fight(enc, false) : { win: true };
        if (S.dead) return null;
        return rec.win ? 'Bạn đi trước, mở đường. Cả đoàn qua được không mất một ai.' : 'Bạn bị thương, nhưng cả đoàn qua được.';
      },
      auto: S => (S.traits.social > .3 || S.traits.pious > .5 ? 'help' : S.traits.social > .15 ? 'later' : 'away') },
    trial: { base: (S, X, a) => (a.d.bg ? .45 : a.d.path === 'help' ? .65 : .4 + Math.min(.3, S.gold / (med(S, X) * 10))),
      run(S, X, a, ok, p) {
        if (a.d.bg) return ok ? { t: `Nghe nói nhà ${nm(p)} cũng qua được mùa đói, nhờ hàng xóm góp mỗi nhà một ít.`, k: 'info' } : { t: `Nhà ${nm(p)} bán dần trâu, rồi bán ruộng.`, k: 'info' };
        if (a.d.path === 'later') { if (ok) { a.d.saved = Math.round(med(S, X) * .5); return { t: `Bạn để riêng một hũ tiền dưới gầm giường, ghi trên nắp: "Của ${nm(p)}".`, k: 'good' }; } return { t: 'Năm ấy bạn cũng chẳng dư được đồng nào. Lời hứa nằm đó.', k: 'bad' }; }
        return ok ? { t: `Nhà ${nm(p)} đứng dậy được. Con cháu ${nm(p)} gọi bạn là chú, là bác.`, k: 'good', bond: 10 } : { t: `Nhà ${nm(p)} vẫn khó. Ơn bạn trả, mùa màng lại lấy đi.`, k: 'bad' };
      } },
    climax: { title: 'Mảnh đất của ân nhân',
      body: (S, X, a, p) => `Tay cường hào trong vùng muốn mảnh đất của nhà ${nm(p)}, cho người tới đòi "món nợ cũ" chẳng ai biết có thật không. ${nm(p)} đã già, đứng không vững.`,
      choices: (S, X, a, p) => [ch('stand', 'Đứng ra đối mặt tay cường hào', `Chừng ${pct(odds(S, X, .45 + (G.standing(S, X).soc >= 1 ? .15 : 0)))} hắn lùi.`),
        ch('pay', 'Bỏ tiền chuộc đất', `Chừng ${G.coin(Math.round(med(S, X)))}.`), ch('law', 'Kiện lên phủ', 'Lâu, tốn, nhưng có giấy tờ.')],
      apply(S, X, ch, a, p) {
        const soc = G.standing(S, X).soc;
        if (ch === 'stand') { if (X.chance(odds(S, X, .45 + (soc >= 1 ? .15 : 0)))) { fame(S, 3); X.add('h', 8); return { t: 'Bạn đứng ở cổng nhà, tay không. Người của tay cường hào đứng một lúc rồi quay về.', o: 'kept' }; }
          X.add('hl', -12); X.cond('wound'); return { t: 'Bạn bị đánh gục giữa sân. Mảnh đất vẫn bị lấy.', o: 'lost' }; }
        if (ch === 'pay') { const c = Math.round(med(S, X)) - (a.d.saved || 0); if (S.gold >= c) { X.money(-Math.max(0, c)); return { t: 'Bạn đếm đủ tiền lên bàn tay cường hào, lấy lại tờ văn tự, đưa tận tay ' + nm(p) + '.', o: 'kept' }; }
          X.money(-Math.max(0, Math.min(S.gold, c))); return { t: 'Bạn gom hết những gì có, vẫn thiếu. Tay cường hào cười, nhận tiền, rồi vẫn lấy đất.', o: 'lost' }; }
        X.money(-Math.round(med(S, X) * .2)); if (X.chance(.35 + .15 * soc)) return { t: 'Quan phủ cho xem lại văn tự. "Món nợ cũ" là giấy giả.', o: 'kept' };
        return { t: 'Vụ kiện kéo dài ba năm, tới khi chẳng ai còn nhớ ai kiện ai. Đất đã đổi chủ từ lâu.', o: 'lost' };
      },
      auto: (S, X) => (S.traits.bold > .55 ? 'stand' : S.gold > med(S, X) ? 'pay' : 'law'),
      bg: (S, X, a, p) => (a.d.ok ? { t: `Hàng xóm nhà ${nm(p)} góp tiền chuộc lại mảnh đất. Không ai gọi bạn.`, o: 'others' } : { t: `Nhà ${nm(p)} mất đất, dọn đi nơi khác.`, o: 'unpaid' }) },
    end(S, X, a, p, o) {
      if (a.d.bg) return o;
      if (o === 'lost') return 'tried';
      return a.d.path === 'later' ? 'late' : a.d.ok ? 'kin' : 'paid';
    },
    after: {
      paid: (S, X, a, p) => { X.add('h', 6); return `Con cháu ${nm(p)} gọi bạn là ân nhân của nhà họ, dù người cứu mạng trước là ${nm(p)}. Hai bên coi như sòng phẳng.`; },
      kin: (S, X, a, p) => { X.add('h', 8); X.add('so', 4); return { t: `Ngày ${nm(p)} mừng thọ, bạn ngồi mâm trên cùng với con cháu trong nhà. Không ai còn nhớ ai mang ơn ai.`, bond: 20 }; },
      late: (S, X, a, p) => { X.add('h', 6); return `Muộn mất mấy năm, nhưng lời hứa năm ấy bạn giữ trọn. ${nm(p)} đem hũ tiền bạn để dành ra khoe với cả xóm.`; },
      tried: (S, X, a, p) => { X.add('h', -4); return { t: `${nm(p)} dọn về ở với con. Hôm bạn tới thăm, ${nm(p)} cầm tay bạn: "Ngươi đã đứng ra. Thế là đủ."`, k: 'info', bond: 15 }; },
      unpaid: (S, X, a, p) => { X.add('so', -4); return { t: `Bạn nghe tin nhà ${nm(p)} phải bỏ làng đi nơi khác. Người trong vùng chào bạn nhạt đi.`, k: 'bad' }; },
      others: (S, X, a, p) => { X.add('h', -3); return { t: `Đám giỗ năm ấy nhà ${nm(p)} mời cả xóm. Bạn đi ngang, nghe tiếng cười, không vào.`, k: 'bad' }; }
    } });

  // ── Người mang ơn bạn (bạn cứu người; a.d.type: merchant / noble / outlaw) ──
  // Đền đáp theo đúng cái bạn đang cần (giữ từ bản cũ fv_return).
  const repay = (S, X, a, p) => {
    const F = S.flags, wanted = F.wanted && S.nation != null && F.wanted[S.nation];
    if (wanted || F.crimes) { if (wanted) delete F.wanted[S.nation]; else F.crimes = Math.max(0, F.crimes - 1); return `${ref(S, p)} giờ có chỗ đứng trong phủ. Một tờ giấy của ${nm(p)}, và hồ sơ của bạn ở nha môn biến mất.`; }
    if (a.d.type === 'outlaw') { X.add('h', 6); return `Toán cướp chặn bạn ở đèo. Tên cầm đầu nhìn mặt bạn rồi phẩy tay: "${nm(p)} dặn rồi. Đi đi."`; }
    if (a.d.type === 'noble' && single(S) && !S.undead && !F.suitor) {
      F.suitor = { name: X.name(S.race, X.chance(.5) ? 'm' : 'f'), race: S.race, work: 'người nhà ' + nm(p), age: X.years(S) + X.int(-4, 3) };
      return `${ref(S, p)} mời bạn dự tiệc, xếp bạn ngồi cạnh ${F.suitor.name}, người trong họ. Cả bữa, ${nm(p)} cứ cười một mình.`;
    }
    if (S.gold < med(S, X) * 2) { const g = Math.round(med(S, X) * .8); X.money(g); return `${ref(S, p)} giới thiệu bạn với một chủ hàng lớn. Năm đó bạn kiếm thêm ${G.coin(g)}.`; }
    S.gear = Math.min(10, S.gear + 1); return `${ref(S, p)} gửi tới một thanh kiếm rèn ở ${capName(S)}, kèm mảnh giấy: "Một mạng đổi một thanh kiếm, vẫn còn rẻ." Trang bị ${S.gear}/10.`;
  };
  const favorTrouble = { merchant: 'vỡ nợ, chủ nợ kéo tới tận nhà', noble: 'bị vu mưu phản, lính phủ đang lùng', outlaw: 'bị truy nã, đầu được treo giá' };
  full('favor', { nameVi: 'Người mang ơn', good: ['repaid', 'bound', 'square'],
    quest: (a, p) => `Giữ mối ơn với ${nm(p)}`,
    marks: { repaid: 'duoc_tin', bound: 'huynh_de', square: 'che_cho', burned: 'tieng_xau', sold: 'ke_thu', forgot: 'tiec_nuoi' },
    sum: { repaid: (d, p) => `được ${nm(p)} trả ơn`, bound: (d, p) => `cứu ${nm(p)} hai lần, thành anh em`, square: (d, p) => `được ${nm(p)} che chở, rồi che chở lại`,
      burned: (d, p) => `bị liên lụy vì che giấu ${nm(p)}`, drift: (d, p) => `để ${nm(p)} tự lo lúc gặp nạn`, sold: (d, p) => `bán đứng ${nm(p)}, người mình từng cứu`, forgot: (d, p) => `để mối ơn với ${nm(p)} nhạt dần` },
    beat: { any: ['Thư của {p} tới, chữ viết vội: "Có dịp ghé, có dịp ghé."', 'Người đưa hàng mang tới một gói quà, không ghi tên. Bạn biết là của {p}.'] },
    acts: acts({ open: { st: ADE, wait: [2, 12] } }),
    open: (S, X, a, p) => ({ t: `${ref(S, p)} gửi thư, kể giờ đã ổn, hỏi bạn có cần gì không. Cuối thư viết: "Ơn ấy ta còn nhớ."`, bond: 5 }),
    knot: { title: 'Lời mời của người mang ơn', body: (S, X, a, p) => `${nm(p)} mời bạn tới ${a.d.type === 'outlaw' ? 'một quán rượu không biển ở chân đèo' : capName(S)}. Ai cũng bảo: người ta đang muốn trả ơn.`,
      choices: (S, X, a, p) => [ch('visit', 'Ghé thăm, kết thân', 'Không xin gì.'), ch('ask', `Nhờ ${nm(p)} một việc`, 'Ơn trả xong thì thôi.'), ch('away', 'Không ghé', 'Cứu người không phải để đòi.')],
      apply(S, X, ch, a, p) {
        if (ch === 'visit') { bond(p, 15); X.add('so', 3); return `Bạn ở chơi ba ngày. ${nm(p)} đưa bạn đi khắp nơi, giới thiệu với ai cũng là "người cứu mạng ta".`; }
        if (ch === 'ask') { a.d.repaid = true; return repay(S, X, a, p); }
        return `Bạn viết thư trả lời, cảm ơn, nói dạo này bận. ${nm(p)} không mời lần nữa.`;
      },
      auto: (S, X) => (S.traits.social > .5 ? 'visit' : S.gold < med(S, X) || (S.flags.crimes || 0) > 0 ? 'ask' : 'away') },
    trial: { base: (S, X, a, p) => .5 + (p ? p.drive * .2 : 0),
      run: (S, X, a, ok, p) => (ok ? { t: `Nghe tin ${nm(p)} làm ăn phát đạt${a.d.type === 'outlaw' ? ', toán người của ' + nm(p) + ' giờ giữ cả một khúc đường buôn' : ''}.`, k: 'info' }
        : { t: `Nghe tin ${nm(p)} gặp hạn: ${favorTrouble[a.d.type] || favorTrouble.merchant}.`, k: 'bad' }) },
    climax: { title: 'Người mang ơn gặp nạn',
      body: (S, X, a, p) => `${nm(p)} gõ cửa nhà bạn lúc nửa đêm, áo rách, mặt tái: ${favorTrouble[a.d.type] || favorTrouble.merchant}. "Ta không biết đi đâu nữa."`,
      choices: (S, X, a, p) => [ch('shelter', `Giấu ${nm(p)} trong nhà`, 'Lộ ra thì bạn cũng bị liên lụy.'), ch('leave', 'Cho ít tiền rồi bảo đi', 'Chừng ấy là đủ tình.'),
        ch('sell', `Báo cho người đang tìm ${nm(p)}`, 'Có thưởng. Người ta sẽ biết bạn là ai.')],
      apply(S, X, ch, a, p) {
        if (ch === 'shelter') { if (X.chance(.6 + .1 * G.standing(S, X).soc)) { bond(p, 40); X.add('h', 6); return { t: `${nm(p)} ở dưới hầm nhà bạn hai tháng, tới khi chuyện yên. Lúc đi, ${nm(p)} cúi đầu sát đất.`, o: 'hid' }; }
          X.add('so', -8); X.money(-Math.round(med(S, X) * .4)); return { t: `Lính lục nhà bạn, lôi ${nm(p)} ra. Bạn bị phạt vì tội chứa chấp.`, o: 'burned' }; }
        if (ch === 'leave') { X.money(-Math.round(med(S, X) * .2)); bond(p, -10); return { t: `${nm(p)} nhận tiền, đi vào đêm tối. Bạn đóng cửa, ngồi tới sáng.`, o: 'drift' }; }
        X.money(Math.round(med(S, X) * .8)); G.trajBump(S, { am: .4 }); kill(S, p); return { t: `Người ta trả thưởng cho bạn ngay ở cổng. Tháng sau có tin ${nm(p)} chết trong ngục.`, o: 'sold' };
      },
      auto: (S, X) => (S.traits.social > .45 || S.traits.pious > .55 ? 'shelter' : S.traits.pious < .2 && sh(S, 'am') > .2 ? 'sell' : 'leave'),
      bg: (S, X, a, p) => (a.d.ok ? { t: `${ref(S, p)} vẫn nhớ bạn, dù bạn chưa một lần ghé. ${repay(S, X, a, p)}`, o: 'repaid' } : { t: `${nm(p)} gặp hạn rồi biến mất. Bạn nghe tin khi đã muộn.`, o: 'forgot' }) },
    end: (S, X, a, p, o) => (o === 'hid' ? (a.d.repaid ? 'square' : 'bound') : o),
    after: {
      repaid: () => ({ t: 'Có những món ơn tự tìm đường về, kể cả khi người cứu không đòi.', k: 'good' }),
      bound: (S, X, a, p) => { X.add('h', 8); p.role = 'ban'; return { t: `Từ đó ${nm(p)} gọi bạn là anh em. Mỗi lần ${nm(p)} đứng dậy được, việc đầu tiên là gửi người tới hỏi bạn cần gì.`, bond: 20 }; },
      square: (S, X, a, p) => { X.add('h', 6); return { t: `${nm(p)} đứng dậy được, lần này nhờ bạn. "Giờ thì ta nợ ngươi," ${nm(p)} cười, "nợ đến hết đời."`, bond: 20 }; },
      burned: (S, X, a, p) => ({ t: `Tên bạn nằm trong sổ của phủ một thời gian dài. ${nm(p)} gửi thư từ trong ngục, xin lỗi bạn.`, k: 'bad' }),
      drift: (S, X, a, p) => ({ t: `Bạn không nghe tin ${nm(p)} nữa. Có những đêm bạn tự hỏi người đó đã đi đâu.`, k: 'info' }),
      sold: (S, X) => { X.add('so', -6); return { t: 'Người ta biết chuyện. Từ đó có người đi đường vòng để khỏi phải chào bạn.', k: 'bad' }; },
      forgot: () => ({ t: 'Lá thư cuối cùng của người mang ơn vẫn nằm trong ngăn kéo, chưa trả lời.', k: 'bad' })
    } });

  // ── Mối thù (cướp chặn đường, bạn đồng hành ôm túi bỏ đi; a.d.gold) ──
  full('feud', { nameVi: 'Mối thù', good: ['win', 'law', 'forgive', 'others'],
    quest: (a, p) => `Đòi lại công bằng với ${nm(p)}`,
    marks: { win: 'vuot_doi_thu', win_blood: 'tay_mau', law: 'giu_loi', lawfail: 'cay_dang', forgive: 'buong_bo', lose: 'ke_thu', others: 'tiec_nuoi', free: 'thu_chua_tra' },
    sum: { win: (d, p) => `đòi lại được món nợ với ${nm(p)}`, win_blood: (d, p) => `đuổi theo ${nm(p)} nhiều năm, rồi giết ${nm(p)} trong cơn giận`, law: (d, p) => `đưa ${nm(p)} ra trước pháp luật`,
      lawfail: (d, p) => `kiện ${nm(p)} mà quan không xử`, forgive: (d, p) => `tha cho ${nm(p)}`, lose: (d, p) => `thua ${nm(p)} cả khi đã tìm ra hắn`,
      others: (d, p) => `để người khác xử ${nm(p)} thay mình`, free: (d, p) => `để ${nm(p)} sống phây phây với món nợ của mình` },
    gone: (S, p) => `Tin ${refE(S, p)} chết ở đâu đó. Món nợ giữa hai người không còn ai đòi.`,
    beat: { any: ['Bạn hỏi mọi lữ khách qua làng có biết ai tên {p} không.', 'Đêm ấy bạn lại mơ thấy {p} vừa đếm tiền vừa cười.', 'Bạn sờ vết sẹo cũ, rồi lại đi làm như mọi ngày.'] },
    acts: acts({ open: { st: ADE } }),
    open: (S, X, a, p) => (p.drive > .55 ? { t: `Có người kể ${ref(S, p)} giờ mở quán trọ ở ${regName(p.loc)}. Vốn ở đâu ra thì ai cũng đoán được.`, k: 'bad', o: 'rich' }
      : { t: `Nghe nói ${ref(S, p)} vẫn lảng vảng ở ${regName(p.loc)}, làm ăn chẳng ra gì.`, k: 'info', o: 'poor' }),
    knot: { title: 'Món nợ chưa đòi', body: (S, X, a, p) => `${nm(p)} lấy của bạn ${G.coin(a.d.gold || 0)} và một phần thể diện. Người ta hỏi bạn định làm gì.`,
      choices: (S, X, a, p) => [ch('hunt', `Lần theo ${nm(p)}`, `Đi ${regName(p.loc)}, có thể mất cả năm.`), ch('law', 'Báo quan, nhờ người có thế', 'Cần giấy tờ, cần người làm chứng.'),
        ch('wait', 'Đợi thời, luyện thêm', 'Lúc gặp lại, bạn sẽ không còn như năm ấy.'), ch('away', 'Cho qua', 'Của đi thay người.')],
      apply(S, X, ch, a, p) {
        if (ch === 'hunt') { G.trajBump(S, { vo: .3 }); return `Bạn gói ít lương khô, lên đường tới ${regName(p.loc)}.`; }
        if (ch === 'law') { X.money(-Math.round(med(S, X) * .1)); return 'Bạn viết đơn, nhờ thầy đồ trong làng chép lại cho đúng lối, rồi nộp lên phủ.'; }
        if (ch === 'wait') { skill(S, X, 4); X.addXp(40); return 'Bạn treo tấm bản đồ vùng lên vách, đánh dấu chỗ người ta thấy hắn lần cuối, rồi ra bãi tập.'; }
        X.add('h', 4); return 'Bạn bảo người nhà đừng nhắc chuyện đó nữa.';
      },
      auto: (S, X, a, p) => (S.traits.social > .65 || S.traits.pious > .7 ? 'away' : S.traits.bold > .55 ? 'hunt' : G.standing(S, X).soc >= 1 ? 'law' : 'wait') },
    trial: { base: (S, X, a, p) => (a.d.bg ? .5 : a.d.path === 'hunt' ? .5 : a.d.path === 'law' ? .35 + .15 * G.standing(S, X).soc : .55),
      run(S, X, a, ok, p) {
        if (a.d.bg) return ok ? { t: `Lữ khách kể ${nm(p)} đã bị người khác tóm ở ${regName(p.loc)}, vì một vụ khác.`, k: 'info' } : { t: `${nm(p)} vẫn sống yên ổn ở ${regName(p.loc)}, mở thêm một quán.`, k: 'info' };
        if (a.d.path === 'hunt') return ok ? { t: `Sau một mùa lần theo dấu, bạn biết ${nm(p)} ngủ ở đâu, ăn ở đâu.`, k: 'good' } : (X.add('hl', -6), { t: `Bạn đi cả năm, mất dấu ${nm(p)} ở một bến đò. Bạn về, gầy rộc, lòng sôi hơn trước.`, k: 'bad' });
        if (a.d.path === 'law') return ok ? { t: 'Phủ nhận đơn, cho người đi hỏi chuyện.', k: 'good' } : { t: 'Đơn nằm trên bàn quan suốt mùa mưa. Người ta bảo phải có lễ mới xong.', k: 'bad' };
        if (ok) skill(S, X, 3); return ok ? { t: 'Mấy năm trôi qua. Bạn không còn là người bị chặn đường năm ấy.', k: 'good' } : { t: 'Bạn luyện mãi mà tay vẫn run mỗi lần nhớ lại đêm ấy.', k: 'bad' };
      } },
    climax: { title: 'Chạm mặt',
      body: (S, X, a, p) => `Bạn tìm ra ${ref(S, p)} ở ${regName(p.loc)}. ${nm(p)} nhận ra bạn ngay, tay đặt lên chuôi dao.`,
      choices(S, X, a, p) { const law = a.d.path === 'law' || G.standing(S, X).soc >= 1;
        return [ch('fight', 'Đòi lại bằng tay', `Khả năng thắng chừng ${pct(vs(S, X, p, .3 * p.drive - (a.d.ok && a.d.path !== 'law' ? .2 : 0)))}.`),
          ...(law ? [ch('law', 'Gọi lính, đưa ra phủ', 'Quan có thể chẳng làm gì.')] : []), ch('forgive', 'Bỏ qua', 'Không lấy lại được gì; lòng nhẹ hơn.')]; },
      apply(S, X, ch, a, p) {
        if (ch === 'fight') {
          if (X.rnd() < vs(S, X, p, .3 * p.drive - (a.d.ok && a.d.path !== 'law' ? .2 : 0))) { X.money(a.d.gold || 0); fame(S, 1); X.add('h', 8); return { t: `${nm(p)} nằm dưới đất, trả lại cho bạn ${G.coin(a.d.gold || 0)} và một lời xin tha.`, o: 'win' }; }
          X.add('hl', -12); X.add('h', -6); if (X.chance(.3)) X.cond('wound'); return { t: `${nm(p)} nhanh tay hơn. Bạn ôm vết dao trên tay đi về.`, o: 'lose' };
        }
        if (ch === 'law') {
          if (X.rnd() < .4 + .1 * G.standing(S, X).soc + (a.d.path === 'law' && a.d.ok ? .25 : 0)) { X.add('h', 5); return { t: 'Quan cho bắt người.', o: 'law' }; }
          const f = Math.round(med(S, X) * .2); X.money(-f); X.add('h', -4); return { t: `Quan nhận lễ của ${nm(p)}, rồi phạt bạn ${G.coin(f)} tội vu cáo.`, o: 'lawfail' };
        }
        X.add('h', 4); bond(p, 20); return { t: `Bạn quay lưng đi trước. ${nm(p)} đứng nhìn theo rất lâu.`, o: 'forgive' };
      },
      auto: (S, X, a, p) => (S.traits.social > .65 || S.traits.pious > .7 ? 'forgive' : a.d.path === 'law' ? 'law' : X.power(S) >= npcPow(p, 0) || S.traits.bold > .5 ? 'fight' : 'forgive'),
      bg: (S, X, a, p) => (a.d.ok ? { t: `${nm(p)} bị xử ở ${regName(p.loc)} vì một món nợ khác. Bạn nghe tin qua một người bán muối.`, o: 'others' } : { t: `${nm(p)} giàu lên, ai cũng gọi bằng ông.`, o: 'free' }) },
    end: (S, X, a, p, o) => (o === 'win' && a.d.path === 'hunt' && !a.d.ok ? (kill(S, p), 'win_blood') : o),
    after: {
      win: (S, X, a, p) => { p.loc = X.pick(G.REGIONS).id; X.add('h', 4); return `Từ hôm đó bạn ngủ ngon. ${nm(p)} rời vùng, không ai nghe tin nữa.`; },
      win_blood: (S, X) => { X.add('h', -4); return { t: 'Bạn đã định chỉ đòi lại tiền. Nhưng cả năm lần theo, cả năm ăn ngủ với cơn giận; lúc lưỡi dao dừng lại thì đã muộn. Bạn chôn hắn bên đường.', k: 'bad' }; },
      law: (S, X, a, p) => ({ t: `${nm(p)} bị xử khổ sai ở mỏ đá. Bạn đứng xem người ta xích chân ${nm(p)}, không thấy vui như mình tưởng.`, k: 'info' }),
      lawfail: (S, X, a, p) => ({ t: `${nm(p)} đi ngang nhà bạn, cố ý dừng lại cười. Bạn đóng cửa.`, k: 'bad' }),
      forgive: (S, X, a, p) => { if (X.chance(.55)) { const g = Math.round((a.d.gold || 20) * .6); X.money(g); X.add('h', 6); return { t: `Một sáng có túi tiền đặt trước cửa nhà bạn, ${G.coin(g)}, kèm mảnh giấy chỉ có một chữ: tên ${nm(p)}.`, bond: 20 }; }
        return { t: `Bạn không nghe tin ${nm(p)} nữa. Lạ là bạn cũng thôi nghĩ tới.`, k: 'info' }; },
      lose: (S, X, a, p) => ({ t: `${nm(p)} vẫn sống phây phây. Mỗi lần đi ngang ${regName(p.loc)}, bạn lại sờ vết sẹo cũ.`, k: 'bad' }),
      others: () => ({ t: 'Món nợ được trả, nhưng không phải bởi bạn. Bạn thấy nhẹ, rồi thấy trống.', k: 'info' }),
      free: (S, X, a, p) => ({ t: `Có năm ${nm(p)} còn đi ngang làng bạn trên một chiếc xe ngựa sơn đỏ.`, k: 'bad' })
    } });

  // ── Báo thù cho người thân (không có người trong dàn; a.d: sp, kin, zone) ──
  const spOf = a => G.B.byId[a.d.sp];
  const zoneOf = (S, X, a) => (G.ZONE[a.d.zone] ? G.ZONE[a.d.zone].zone : X.reg(S).zones[0]);
  const kinOf = a => (a.d.kin === 'cha' ? 'cha' : a.d.kin || 'người thân');
  const vgEnc = (S, X, a) => ({ s: spOf(a), grade: 'elite', affixes: [], count: 1, zone: zoneOf(S, X, a), cell: null, feat: null });
  full('vengeance', { nameVi: 'Báo thù', good: ['win', 'trap', 'letgo', 'others'],
    quest: a => `Báo thù cho ${kinOf(a)}`,
    marks: { win: 'da_bao_thu', trap: 'nguoi_giu_lang', lose: 'thu_chua_tra', letgo: 'buong_bo', others: 'tiec_nuoi', still: 'cay_dang' },
    sum: { win: d => `báo được thù cho ${kinOf({ d })}`, trap: d => `dụ con quái đã giết ${kinOf({ d })} vào bẫy, giữ cho làng khỏi lứa sau`, lose: d => `không báo được thù cho ${kinOf({ d })}`,
      letgo: d => `buông được mối thù cho ${kinOf({ d })}`, others: d => `để thợ săn khác hạ con quái đã giết ${kinOf({ d })}`, still: d => `sống cả đời cạnh khu rừng có con quái đã giết ${kinOf({ d })}` },
    beat: { any: ['Bạn mài lại con dao khắc tên {kin}, đêm nào cũng mài.', 'Bạn hỏi mọi thợ săn đi ngang làng về dấu chân con quái.', 'Bạn ra mộ {kin}, ngồi tới khi trời tối.'] },
    acts: acts({ open: { st: TA, wait: [1, 15], w: S => .5 + 3 * S.traits.bold + 4 * sh(S, 'vo') } }),
    open(S, X, a) { G.trajBump(S, { vo: .4 }); X.addXp(40); return { t: `Bạn khắc tên ${kinOf(a)} lên chuôi con dao đi rừng. Từ đó sáng nào bạn cũng tập trước khi gà gáy.`, k: 'info', o: 'oath' }; },
    knot: { title: 'Lời thề', body: (S, X, a) => `Con ${spOf(a) ? spOf(a).nameVi : 'quái'} đã giết ${kinOf(a)} vẫn ở đâu đó trong ${zoneOf(S, X, a).nameVi}.`,
      choices: (S, X, a) => [ch('train', 'Luyện võ tới khi đủ sức', 'Một mình, lâu.'), ch('hunters', 'Theo phường săn học nghề', 'Học cách quái nghĩ.'), ch('away', 'Buông', `Báo thù không làm ${kinOf(a)} sống lại.`)],
      apply(S, X, ch, a) {
        if (ch === 'train') { skill(S, X, 5); return 'Bạn dựng một bãi tập sau nhà, ngày nào cũng ra đó trước khi gà gáy.'; }
        if (ch === 'hunters') { X.gain('Bow', 4); X.add('so', 2); return 'Phường săn nhận bạn làm đứa xách nỏ. Bạn học đọc dấu chân trước khi học bắn.'; }
        X.add('h', 6); return `Mộ ${kinOf(a)} cỏ đã xanh. Bạn thôi nhìn về phía ${zoneOf(S, X, a).nameVi} mỗi chiều.`;
      },
      auto: S => (S.traits.bold > .35 || sh(S, 'vo') > .3 ? (S.traits.social > .5 ? 'hunters' : 'train') : 'away') },
    trial: { base: (S, X, a) => (a.d.bg ? .45 : .45 + (a.d.path === 'hunters' ? .2 : .1)),
      run(S, X, a, ok) {
        const sp = spOf(a), z = zoneOf(S, X, a);
        if (a.d.bg) return ok ? { t: `Phường săn trong vùng bàn chuyện đi diệt ổ ${sp ? sp.nameVi : 'quái'} ở ${z.nameVi}.`, k: 'info' } : { t: `${sp ? sp.nameVi : 'Quái'} lại xuống bìa ${z.nameVi}, cắp mất hai con dê.`, k: 'info' };
        return ok ? { t: `Bạn lần theo dấu ${sp ? sp.nameVi : 'con quái'} qua ${z.nameVi} suốt một mùa, và tìm ra chỗ nó ngủ.`, k: 'good' }
          : (X.add('hl', -8), { t: `Bạn lần theo dấu tới ${z.nameVi} rồi mất dấu giữa trận mưa, về với một vết cào dài trên lưng.`, k: 'bad' });
      } },
    climax: { title: 'Món nợ máu',
      body: (S, X, a) => `Thợ săn báo: một con ${spOf(a).nameVi} đầu đàn vừa về ${zoneOf(S, X, a).nameVi}, đúng chỗ năm ấy.`,
      choices: (S, X, a) => [ch('hunt', 'Đi săn nó', `Một trận với ${spOf(a).nameVi} tinh anh. Thua có thể chết.`),
        ...(a.d.path === 'hunters' || a.d.ok ? [ch('trap', 'Dụ nó vào bẫy', 'Cần cả phường săn và nhiều ngày rình.')] : []), ch('no', 'Để nó yên', `Báo thù không làm ${kinOf(a)} sống lại.`)],
      apply(S, X, ch, a) {
        if (ch === 'no') { X.add('h', 3); return { t: 'Bạn treo con dao lên vách.', o: 'letgo' }; }
        if (ch === 'trap') { if (X.chance(.55 + (a.d.path === 'hunters' ? .15 : 0) + SA.pb(a))) { fame(S, 2); X.add('h', 10); cnt(S, 'vgWin'); return { t: `Con ${spOf(a).nameVi} sập hầm chông vào đêm thứ chín. Cả phường săn reo lên.`, o: 'trap' }; }
          a.d.tries = (a.d.tries || 0) + 1; return { t: 'Nó ngửi thấy mùi người, bỏ bẫy mà đi.', o: 'lose', to: a.d.tries < 2 ? 'climax' : 'after' }; }
        const rec = X.fight(vgEnc(S, X, a), false); if (S.dead) return null;
        cnt(S, 'vgHunt');
        if (rec.win) { fame(S, 2); X.add('h', 12); cnt(S, 'vgWin'); return { t: `Con ${spOf(a).nameVi} gục dưới chân bạn.`, o: 'win' }; }
        a.d.tries = (a.d.tries || 0) + 1; return { t: 'Nó lại thoát. Bạn lết về với một vết thương mới.', o: 'lose', to: a.d.tries < 2 ? 'climax' : 'after' };
      },
      auto: (S, X, a) => (S.traits.bold > .35 || sh(S, 'vo') > .3 ? (a.d.path === 'hunters' ? 'trap' : 'hunt') : 'no'),
      bg: (S, X, a) => (a.d.ok ? { t: `Phường săn hạ được con ${spOf(a) ? spOf(a).nameVi : 'quái'} đầu đàn. Họ treo đầu nó ở cổng làng; không ai gọi bạn.`, o: 'others' } : { t: 'Con quái vẫn ở đó. Mỗi năm nó lại lấy đi của ai đó một thứ.', o: 'still' }) },
    after: {
      win: (S, X, a) => ({ t: `Bạn mang chiếc nanh của con ${spOf(a).nameVi} ra mộ ${kinOf(a)}. Đó là lần đầu bạn khóc kể từ năm ấy.`, k: 'big' }),
      trap: (S, X, a) => { X.add('so', 5); return { t: `Phường săn dựng lại hầm chông ở bìa ${zoneOf(S, X, a).nameVi}, gọi nó là "hầm của ${S.name.split(' ')[0]}". Lứa quái sau không dám xuống làng.`, k: 'big' }; },
      lose: (S, X, a) => ({ t: `Vết thương lành, nhưng bạn biết mình không đủ sức đi thêm lần nữa. Con dao khắc tên ${kinOf(a)} nằm trên vách tới cuối đời.`, k: 'bad' }),
      letgo: (S, X, a) => { X.add('h', 4); return `Bạn trồng một cây đào bên mộ ${kinOf(a)}. Mùa xuân nào nó cũng ra hoa.`; },
      others: (S, X, a) => ({ t: `Bạn ra cổng làng nhìn cái đầu quái treo trên cọc. Món nợ đã trả, nhưng không bằng tay bạn.`, k: 'info' }),
      still: () => ({ t: 'Bạn dạy con cháu đường nào trong rừng không được đi. Chỉ vậy thôi.', k: 'bad' })
    } });

  // ── Tình xưa (mối tình đầu, người từng ngỏ lời; a.d.refused) ──
  const free2 = (S, p) => single(S) && !p.wed;
  full('love', { nameVi: 'Tình xưa', good: ['wed', 'late_wed', 'let', 'friend'], body: 'flesh',
    quest: (a, p) => `Chuyện chưa xong với ${nm(p)}`,
    marks: { wed: 'tinh_mot_doi', late_wed: 'que_moi', let: 'buong_bo', friend: 'ban_cu', farewell: 'tiec_nuoi', p_wed: 'cay_dang', waited: 'no_on' },
    sum: { wed: (d, p) => `nối lại với ${nm(p)} sau ngần ấy năm`, late_wed: (d, p) => `lấy ${nm(p)} khi tóc cả hai đã điểm bạc`, let: (d, p) => `để chuyện với ${nm(p)} ngủ yên`,
      friend: (d, p) => `giữ ${nm(p)} làm bạn tới cuối đời`, farewell: (d, p) => `nói hết lòng với ${nm(p)} một lần rồi thôi`, p_wed: (d, p) => `nhìn ${nm(p)} lấy người khác`, waited: (d, p) => `để ${nm(p)} đợi mình cả đời` },
    gone: (S, p) => (p.bond >= 15 ? `Tin ${refE(S, p)} mất. Bạn ngồi lâu bên cửa sổ, nhớ một mùa hè.` : null),
    beat: { any: ['Bạn đi ngang con đường hai người hay đi năm ấy, chậm lại một chút.', 'Có người nhắc tên {p}. Bạn giả như không nghe.', 'Bạn giở lại lá thư cũ của {p}, đọc rồi cất.'] },
    acts: acts({ open: { st: ADE, wait: [3, 15] } }),
    open(S, X, a, p) {
      if (free2(S, p)) return { t: `Bạn gặp lại ${ref(S, p)} ở đám cưới một người quen. ${nm(p)} vẫn cười như hồi ấy.`, k: 'good', o: 'free' };
      if (!single(S) && !p.wed) return { t: `${ref(S, p)} vẫn ở vậy. Hôm gặp lại ở chợ phiên, ${nm(p)} hỏi thăm nhà bạn trước khi hỏi thăm bạn.`, k: 'info', o: 'past' };
      return { t: `Bạn gặp lại ${ref(S, p)} ở chợ phiên${p.wed ? ', ' + nm(p) + ' dắt theo một đứa con' : ''}. Hai người chào nhau như người quen thường.`, k: 'info', o: 'past' };
    },
    knot: { title: 'Chuyện cũ', body: (S, X, a, p) => `Từ hôm gặp lại, bạn hay nghĩ tới ${nm(p)}${a.d.refused ? ' và lần bạn lắc đầu năm ấy' : ' và mùa hè năm ấy'}.`,
      choices: (S, X, a, p) => [ch('write', 'Viết thư', 'Chậm mà chắc. Chữ nghĩa giữ được lâu.'), ...(free2(S, p) ? [ch('seek', `Tìm gặp ${nm(p)}`, 'Nói thẳng. Có thể bị từ chối.')] : []), ch('away', 'Để chuyện cũ ngủ yên', '')],
      apply(S, X, ch, a, p) {
        if (ch === 'write') { bond(p, 10); return `Bạn viết một lá thư dài, sửa đi sửa lại ba đêm. Thư trả lời tới sau hai tuần, dài gấp đôi.`; }
        if (ch === 'seek') { bond(p, 15); X.add('h', 4); return `Bạn tới tận nhà ${nm(p)}. Hai người ngồi bên hiên tới khi trăng lên, nói đủ thứ chuyện trừ chuyện cũ.`; }
        return 'Bạn cất lá thư cũ vào đáy rương.';
      },
      auto: (S, X, a, p) => (free2(S, p) && (S.traits.social > .35 || sh(S, 'gia') > .12) ? 'seek' : S.traits.social > .5 ? 'write' : 'away') },
    trial: { base: (S, X, a, p) => (a.d.bg ? .5 : .5 + (a.d.path === 'seek' ? .15 : 0) + (p.bond > 40 ? .1 : 0)),
      run(S, X, a, ok, p) {
        if (a.d.bg) return ok ? { t: `Nghe nói ${nm(p)} đã nhận lời một người ở ${regName(p.loc)}.`, k: 'info' } : { t: `${nm(p)} vẫn ở vậy, ai hỏi cũng lắc đầu.`, k: 'info' };
        return ok ? { t: 'Mùa ấy hai người gặp nhau nhiều hơn mọi năm. Người trong xóm bắt đầu nói ra nói vào.', k: 'good', bond: 10 } : { t: 'Một hiểu lầm nhỏ, rồi cả mùa không ai viết cho ai.', k: 'bad', bond: -10 };
      } },
    climax: { title: 'Câu hỏi năm ấy',
      body: (S, X, a, p) => (free2(S, p) ? `${nm(p)} hỏi bạn có còn nhớ ${a.d.refused ? 'lần bạn từ chối năm ấy' : 'mùa hè năm ấy'} không.` : `${nm(p)} hẹn gặp bạn lần cuối trước khi theo con về ${regName(p.loc)}.`),
      choices: (S, X, a, p) => (free2(S, p) ? [ch('wed', 'Nối lại', 'Thành vợ chồng.'), ch('friend', 'Làm bạn thôi', 'Có những chuyện giữ làm kỷ niệm thì hơn.'), ch('let', 'Để chuyện cũ ngủ yên', '')]
        : [ch('farewell', 'Nói hết những gì chưa nói', 'Một lần thôi.'), ch('friend', 'Hẹn làm bạn tới già', ''), ch('let', 'Không tới', '')]),
      apply(S, X, ch, a, p) {
        if (ch === 'wed') { S.family.spouse = { name: p.name, race: p.race, age: G.castYrs(S, p), alive: true }; p.role = 'phoi'; p.how = 'bạn đời của bạn'; p.wed = true;
          S.flags.suitor = null; X.add('h', 12); X.add('so', 6); cnt(S, 'lvWed'); return { t: 'Đám cưới nhỏ, chỉ mời những người biết chuyện cũ.', o: 'wed' }; }
        if (ch === 'friend') { X.add('h', 4); bond(p, 10); return { t: 'Hai người cụng chén, cười về chuyện năm xưa như chuyện của người khác.', o: 'friend' }; }
        if (ch === 'farewell') { X.add('h', -2); return { t: `Bạn nói hết. ${nm(p)} nghe hết. Rồi hai người chia tay ở bến đò, không ai ngoái lại.`, o: 'farewell' }; }
        X.add('h', -2); return { t: 'Hai người chia tay ở đầu ngõ, lần này không ai hẹn gì.', o: 'let' };
      },
      auto: (S, X, a, p) => (free2(S, p) ? (S.traits.social > .35 || sh(S, 'gia') > .12 ? 'wed' : 'let') : S.traits.social > .5 ? 'friend' : 'farewell'),
      bg: (S, X, a, p) => (a.d.ok ? (p.wed = true, { t: `${nm(p)} lấy người ở ${regName(p.loc)}. Thiệp mời tới tay bạn sau ngày cưới.`, o: 'p_wed' }) : { t: `${nm(p)} vẫn ở vậy, cả đời.`, o: 'waited' }) },
    end: (S, X, a, p, o) => (o === 'wed' && !a.d.ok ? 'late_wed' : o),
    after: {
      wed: (S, X, a, p) => ({ t: `Nhiều năm sau, đêm nào ${nm(p)} cũng kể cho con cháu nghe chuyện mùa hè năm ấy, mỗi lần một khác.`, k: 'big' }),
      late_wed: () => ({ t: 'Đi một vòng xa, hai người vẫn quay về chỗ cũ. Người làng bảo đám cưới ấy muộn hai mươi năm, mà vui nhất làng.', k: 'big' }),
      let: () => ({ t: 'Có những mùa hè chỉ nên sống một lần.', k: 'info' }),
      friend: (S, X, a, p) => ({ t: `Tết nào ${nm(p)} cũng ghé, mang theo một hũ mứt. Hai người ngồi cãi nhau về chuyện năm xưa, ai nhớ đúng hơn.`, k: 'good', bond: 10 }),
      farewell: () => ({ t: 'Bạn giữ lại một chiếc khăn tay. Đó là tất cả.', k: 'info' }),
      p_wed: (S, X, a, p) => ({ t: `Bạn đi ngang nhà ${nm(p)} một lần, thấy khói bếp, nghe tiếng trẻ con. Bạn không dừng lại.`, k: 'bad' }),
      waited: (S, X, a, p) => ({ t: `Người ta kể ${nm(p)} chưa bao giờ lấy ai. Bạn không hỏi vì sao.`, k: 'bad' })
    } });

  // ── Thầy trò (bạn là trò; a.d: kind, school, work) ──
  const msTask = a => (a.d.kind === 'craft' ? 'làm lại một món hàng cho tới khi không còn chỗ nào để chê' : 'đứng tấn dưới thác suốt mười ngày');
  const msSkill = a => (a.d.school && J.schools[a.d.school] ? J.schools[a.d.school].masteries[0] : (G.WORKS[a.d.work] && Object.keys(G.WORKS[a.d.work].trains || {})[0]) || 'Body');
  full('master', { nameVi: 'Thầy trò', good: ['heir', 'own_way', 'stood'],
    quest: (a, p) => `Theo ${nm(p)} tới cùng`,
    marks: { heir: 'chan_truyen', own_way: 'cao_thu', stood: 'duoc_tin', apart: 'tiec_nuoi', other_heir: 'cay_dang', alone: 'ke_di_xa' },
    sum: { heir: (d, p) => `nhận chân truyền của thầy ${nm(p)}`, own_way: (d, p) => `học hết của thầy ${nm(p)} rồi mở lối riêng`, stood: (d, p) => `đứng ra thay thầy ${nm(p)} lúc thầy già yếu`,
      apart: (d, p) => `xa thầy ${nm(p)} lúc thầy mất`, other_heir: (d, p) => `bỏ thầy ${nm(p)} giữa chừng, nhìn người khác nhận chân truyền`, alone: (d, p) => `rời thầy ${nm(p)} sớm, tự học trên đường` },
    gone: (S, p) => `Thầy ${nm(p)} mất khi bạn chưa học hết.`,
    beat: { any: ['{p} bắt bạn làm lại từ đầu một bài đã thuộc. Bạn làm, không cãi.', 'Bạn chép lại lời {p} giảng vào một cuốn sổ nhỏ, đêm nào cũng chép.', '{p} kể chuyện thời trẻ, lần đầu tiên.'] },
    acts: acts({ open: { st: TA, wait: [1, 6] }, after: { dead: true } }),
    open(S, X, a, p) {
      if (X.rnd() < .4 + .4 * S.traits.studious + .2 * S.traits.bold) { X.addXp(80); return { t: `${nm(p)} bắt bạn ${msTask(a)}. Tới ngày thứ chín bạn làm được; thầy không khen, chỉ gật đầu.`, k: 'good', o: 'pass', bond: 10 }; }
      X.add('h', -3); return { t: `${nm(p)} bắt bạn ${msTask(a)}. Bạn bỏ cuộc giữa chừng; thầy không mắng, chỉ bắt làm lại từ đầu.`, k: 'info', o: 'fail' };
    },
    knot: { title: 'Đạo của thầy', body: (S, X, a, p) => `${nm(p)} dạy theo lối cũ: chưa thuộc bài này thì không học bài sau. Bạn đã thấy những chỗ thầy dạy chậm.`,
      choices: () => [ch('devote', 'Theo thầy hết lòng', 'Học chậm mà trọn.'), ch('own', 'Học mà giữ lối riêng', 'Thầy có thể không vui.'), ch('away', 'Rời thầy sớm', 'Đường còn dài, thầy không phải người duy nhất.')],
      apply(S, X, ch, a, p) {
        if (ch === 'devote') { bond(p, 15); X.gain(msSkill(a), 3); return `Bạn dọn tới ở cạnh nhà ${nm(p)}, sáng quét sân, tối học bài.`; }
        if (ch === 'own') { skill(S, X, 3); G.trajBump(S, { nghe: .3 }); return `Bạn học hết bài thầy dạy, rồi tự mày mò thêm. ${nm(p)} thấy, không nói gì.`; }
        bond(p, -15); return `Bạn cúi chào ${nm(p)} ba lần rồi đi. Thầy đứng ở cổng tới khi bạn khuất.`;
      },
      auto: S => (S.traits.studious > .55 ? 'devote' : S.traits.bold > .65 ? 'own' : S.traits.social < .25 ? 'away' : 'devote') },
    trial: { base: (S, X, a) => (a.d.bg ? .5 : .45 + (a.d.path === 'devote' ? .15 : .05) + .2 * S.traits.studious),
      run(S, X, a, ok, p) {
        if (a.d.bg) return ok ? { t: `Nghe nói ${nm(p)} đã nhận một đứa học trò mới, sáng dạ hơn bạn năm ấy.`, k: 'info' } : { t: `Nghe nói ${nm(p)} đóng cửa, không nhận ai nữa.`, k: 'info' };
        if (ok) { X.gain(msSkill(a), 4); X.addXp(100); return { t: `${nm(p)} giao cho bạn một việc thầy chưa từng giao cho ai. Bạn làm xong trước hạn.`, k: 'good', bond: 15 }; }
        return { t: `${nm(p)} giao cho bạn một việc lớn. Bạn làm hỏng; thầy phải làm lại suốt ba ngày.`, k: 'bad', bond: -5 };
      } },
    climax: { title: 'Thầy già rồi',
      body: (S, X, a, p) => (a.d.kind !== 'craft' ? `Một kẻ thù cũ của ${nm(p)} tới thách đấu. Thầy đã già, tay cầm kiếm run.` : `${nm(p)} lâm bệnh nặng giữa mùa đông, đúng lúc xưởng nhận một mối hàng lớn.`),
      choices: (S, X, a, p) => (a.d.kind !== 'craft' ? [ch('stand', 'Thay thầy ra đấu', `Đối thủ ngang tầm thầy thời trẻ. Khả năng thắng chừng ${pct(vs(S, X, p, -.2, .15, .85))}.`), ch('watch', 'Để thầy tự đấu', 'Đó là chuyện của thầy.')]
        : [ch('stay', 'Ở lại chăm thầy, gánh cả xưởng', 'Mất một năm làm ăn của riêng mình.'), ch('left', 'Đi tiếp đường mình', 'Thầy có người nhà.')]),
      apply(S, X, ch, a, p) {
        if (ch === 'stand') { if (X.rnd() < vs(S, X, p, -.2, .15, .85)) { fame(S, 2); bond(p, 30); return { t: 'Bạn thắng. Kẻ kia bỏ đi, không quay lại.', o: 'stood' }; }
          X.add('hl', -10); bond(p, 25); return { t: 'Bạn thua, nhưng kẻ kia cũng không còn sức thách thầy nữa.', o: 'fell' }; }
        if (ch === 'stay') { X.money(-Math.round(med(S, X) * .3)); bond(p, 30); X.add('h', 2); return { t: 'Bạn sắc thuốc cho thầy, đêm về làm nốt mối hàng. Hàng giao đúng hẹn, có dấu của thầy.', o: 'stayed' }; }
        bond(p, -20); return { t: `Bạn đi. ${ch === 'watch' ? 'Thầy thắng, nhưng không nhìn bạn khi bước ra.' : 'Thầy không giữ.'}`, o: 'apart' };
      },
      auto: (S, X, a) => (a.d.kind !== 'craft' ? (S.traits.bold > .5 || S.traits.social > .45 ? 'stand' : 'watch') : S.traits.social > .45 ? 'stay' : 'left'),
      bg: (S, X, a, p) => (a.d.ok ? { t: `${nm(p)} truyền hết sở học cho người học trò mới.`, o: 'other_heir' } : { t: `${nm(p)} già yếu, không còn ai theo học.`, o: 'alone' }) },
    end(S, X, a, p, o) {
      if (a.d.bg || o === 'apart') return o;
      if (a.d.path === 'own' && a.d.ok) return 'own_way';
      return o === 'stood' && !a.d.ok ? 'stood' : 'heir';
    },
    after: {
      heir: (S, X, a, p) => { kill(S, p); X.gain(msSkill(a), 6); X.addXp(100);
        return { t: `Thầy ${nm(p)} mất, để lại cho bạn bộ bút ký ghi chú tới trang cuối.${a.d.kind !== 'craft' ? ' Trang đầu chỉ có một dòng: "Cho đứa dám đứng ra thay ta."' : ''}`, k: 'big' }; },
      own_way: (S, X, a, p) => { kill(S, p); skill(S, X, 6); fame(S, 3); return { t: `Thầy ${nm(p)} mất. Trong thư để lại có câu: "Ngươi học ta để rồi đi khác ta. Thế là đúng." Bạn mở lớp, dạy theo lối của mình.`, k: 'big' }; },
      stood: (S, X, a, p) => { kill(S, p); X.addXp(80); return { t: `Thầy ${nm(p)} mất trong giấc ngủ. Ở đám tang, đệ tử các nhà khác cúi chào bạn trước khi chào linh cữu.`, k: 'good' }; },
      apart: (S, X, a, p) => { kill(S, p); X.add('h', -6); return { t: `Bạn nghe tin thầy ${nm(p)} mất khi đang ở xa. Bộ bút ký của thầy về tay người khác.`, k: 'bad' }; },
      other_heir: (S, X, a, p) => { kill(S, p); return { t: 'Có lần bạn gặp người học trò ấy ở chợ. Người đó dùng đúng thế thầy dạy bạn năm xưa, thuần hơn bạn.', k: 'bad' }; },
      alone: (S, X, a, p) => { kill(S, p); return { t: 'Thầy mất, sở học thất truyền. Những gì thầy dạy, bạn nhớ được một nửa; nửa còn lại bạn tự tìm, trên đường.', k: 'info' }; }
    } });

  // ── Nợ cờ bạc (a.d: amt, loc) ──
  full('debt', { nameVi: 'Nợ cờ bạc', good: ['clean', 'broke_free', 'lucky'],
    quest: (a, p) => `Thoát khỏi món nợ với ${nm(p)}`,
    marks: { clean: 'giu_loi', broke_free: 'duoc_tin', lucky: 'cua_phi_nghia', tied: 'ke_tiem_quyen', beaten: 'ke_thu', fled: 'nguoi_la', ruined: 'tay_trang' },
    sum: { clean: () => 'trả sạch một món nợ cờ bạc và không bao giờ đụng lại', broke_free: (d, p) => `tố giác sòng bạc của ${nm(p)}, thoát nợ`, lucky: (d, p) => `gỡ được một ván lớn ở sòng ${nm(p)}`,
      tied: (d, p) => `dính vào ${nm(p)} cả đời vì một món nợ cờ bạc`, beaten: () => 'bị đánh vì một món nợ cờ bạc', fled: () => 'bỏ xứ mà đi vì một món nợ cờ bạc', ruined: () => 'nướng sạch cơ nghiệp vào chiếu bạc' },
    gone: (S, p) => `Tin ${nm(p)}, chủ nợ của bạn, chết trong một vụ ẩu đả. Sổ nợ cháy theo.`,
    beat: { any: ['Bạn đi đường vòng để khỏi ngang qua sòng của {p}.', 'Đêm ấy bạn lại mơ thấy tiếng xúc xắc.', 'Bạn đếm lại số tiền còn nợ {p}. Lãi mẹ đẻ lãi con.'] },
    acts: acts({ open: { wait: [0, 4] }, knot: { prio: 8, wait: [1, 6] } }),
    open: (S, X, a, p) => { a.d.due = Math.round(a.d.amt * 1.5); return { t: `Người của ${nm(p)} ghé nhà nhắc: món nợ giờ đã là ${G.coin(a.d.due)}, cả gốc lẫn lãi.`, k: 'bad' }; },
    knot: { title: 'Chủ nợ', body: (S, X, a, p) => `Người của ${nm(p)} tới đòi ${G.coin(a.d.due)}. Hạn cuối là trăng tròn.`,
      choices: (S, X, a, p) => [...(S.gold >= a.d.due ? [ch('pay', 'Trả', `Mất ${G.coin(a.d.due)}.`)] : []), ch('job', `Làm một việc cho ${nm(p)}`, 'Chở một kiện hàng, không được hỏi bên trong là gì.'),
        ch('gamble', 'Gỡ một ván lớn', 'Thắng thì sạch nợ.'), ch('flee', 'Trốn', 'Bỏ đi nơi khác.')],
      apply(S, X, ch, a, p) {
        if (ch === 'pay') { X.money(-a.d.due); X.add('h', -4); return 'Bạn trả đủ, không thiếu một đồng.'; }
        if (ch === 'job') { G.trajBump(S, { am: .4 }); return 'Bạn chở kiện hàng qua cổng thành, tim đập như trống.'; }
        if (ch === 'gamble') { G.trajBump(S, { am: .2 }); return 'Bạn quay lại sòng, ngồi đúng chỗ cũ.'; }
        S.flags.migrateQ = 'Chủ nợ đang tìm bạn.'; a.d.loc = S.loc; return 'Bạn gói ghém đồ đạc trong đêm.';
      },
      auto: (S, X, a) => (S.gold >= a.d.due ? 'pay' : S.traits.bold > .7 ? 'gamble' : S.traits.bold > .55 ? 'flee' : 'job') },
    trial: { base: (S, X, a) => ({ pay: .75 - .3 * S.traits.bold, job: .7, gamble: .35, flee: .5 }[a.d.path] ?? .5),
      run(S, X, a, ok, p) {
        if (a.d.path === 'pay') return ok ? { t: 'Một năm trôi qua, bạn không bước vào sòng lần nào.', k: 'good' } : { t: 'Một đêm buồn, bạn lại ngồi xuống chiếu bạc. Chỉ một ván, bạn tự nhủ.', k: 'bad' };
        if (a.d.path === 'job') { if (ok) return { t: 'Không ai mở kiện hàng ra xem. Nợ giảm một nửa.', k: 'info' }; cnt(S, 'crimes'); X.add('so', -6); return { t: 'Lính tuần mở kiện hàng ngay cổng thành. Bạn khai không biết gì; họ ghi tên bạn vào sổ.', k: 'bad' }; }
        if (a.d.path === 'gamble') { if (ok) { X.money(a.d.due); return { t: `Ván ấy bạn thắng. Cả sòng im lặng nhìn ${nm(p)} đếm tiền trả bạn.`, k: 'good' }; }
          X.money(-Math.round(Math.max(0, S.gold) * .3)); a.d.due = Math.round(a.d.due * 1.5); return { t: 'Ván ấy bạn thua. Nợ cũ chưa trả, nợ mới đã chồng lên.', k: 'bad' }; }
        return ok ? { t: `Ở ${regName(S.loc)} không ai biết tên ${nm(p)}. Bạn ngủ được.`, k: 'info' } : { t: `Một người lạ hỏi thăm bạn ở chợ. Bạn nhận ra ánh mắt ấy: người của ${nm(p)}.`, k: 'bad' };
      } },
    climax: { title: 'Gặp lại chủ nợ',
      body: (S, X, a, p) => `${nm(p)} tự tìm tới, lần này mỉm cười: "${a.d.path === 'pay' && a.d.ok ? 'Lâu không thấy ngươi ở sòng. Ngồi một ván cho vui?' : 'Ta có việc cuối cùng cho ngươi. Xong thì sổ nợ xóa.'}"`,
      choices: (S, X, a, p) => [ch('end', `Tố giác sòng của ${nm(p)}`, `Chừng ${pct(G.clamp(.3 + .15 * G.standing(S, X).soc + S.fame / 200, .1, .8))} quan làm thật.`),
        ch('deal', a.d.path === 'pay' && a.d.ok ? 'Từ chối, đóng cửa' : 'Làm việc cuối cùng', a.d.path === 'pay' && a.d.ok ? '' : 'Việc gì thì không ai nói.'), ch('play', 'Ngồi xuống chiếu bạc', 'Một ván lớn.')],
      apply(S, X, ch, a, p) {
        if (ch === 'end') { if (X.rnd() < G.clamp(.3 + .15 * G.standing(S, X).soc + S.fame / 200, .1, .8)) { X.add('so', 5); return { t: `Lính phủ ập vào sòng giữa đêm. ${nm(p)} bị giải đi; sổ nợ bị đốt trước cổng phủ.`, o: 'broke_free' }; }
          X.add('hl', -15); X.cond('wound'); return { t: `Quan đã ăn tiền của ${nm(p)} từ lâu. Đêm ấy người của ${nm(p)} tìm được bạn trong một con hẻm.`, o: 'beaten' }; }
        if (ch === 'deal') { if (a.d.path === 'pay' && a.d.ok) { X.add('h', 4); return { t: `Bạn đóng cửa. ${nm(p)} cười, đi. Không quay lại.`, o: 'clean' }; }
          G.trajBump(S, { am: .3 }); X.money(Math.round(med(S, X) * .3)); return { t: `Bạn làm. Sổ nợ xóa, nhưng từ đó tên bạn nằm trong một cuốn sổ khác của ${nm(p)}.`, o: 'tied' }; }
        if (X.chance(.4)) { X.money(Math.round(med(S, X) * 1.5)); return { t: 'Ván ấy bạn thắng lớn. Bạn đứng dậy, không ngoái lại.', o: 'lucky' }; }
        X.money(-Math.round(Math.max(0, S.gold) * .7)); return { t: 'Ván ấy bạn thua sạch: tiền, đất, cả cái nhẫn cưới.', o: 'ruined' };
      },
      auto: (S, X, a) => (a.d.path === 'pay' && a.d.ok ? 'deal' : S.traits.bold > .65 ? 'play' : S.traits.pious > .5 ? 'end' : 'deal') },
    end(S, X, a, p, o) { if (a.d.path === 'flee' && o === 'tied') return a.d.ok ? 'fled' : 'beaten'; return o; },
    after: {
      clean: () => ({ t: 'Bạn thề không đụng tới xúc xắc nữa. Lời thề giữ được tới cuối đời.', k: 'good' }),
      broke_free: () => ({ t: 'Mấy nhà trong xóm cũng thoát nợ nhờ vụ ấy. Họ mang gà, mang rượu tới cảm ơn bạn.', k: 'big' }),
      lucky: () => ({ t: 'Bạn chuộc lại đồ đã cầm, rồi không bao giờ quay lại sòng. Người ta bảo bạn may. Bạn biết là may.', k: 'good' }),
      tied: (S, X, a, p) => { G.trajBump(S, { am: .2 }); return { t: `${nm(p)} lại ghé, lần này với một "việc nhỏ" khác. Bạn hiểu mình sẽ chẳng bao giờ trả xong.`, k: 'bad' }; },
      beaten: (S, X, a) => { X.money(-Math.min(Math.max(0, S.gold), a.d.due || 0)); return { t: 'Vết thương lành, nhưng mỗi lần trở trời, bạn lại nhớ cái giá của một ván bạc.', k: 'bad' }; },
      fled: () => ({ t: 'Bạn từ chối việc cuối cùng, gói đồ đi tiếp. Ở đất mới, bạn vẫn giật mình mỗi lần có người lạ hỏi tên.', k: 'info' }),
      ruined: () => ({ t: 'Bạn bắt đầu lại từ hai bàn tay trắng. Người làng thôi gọi bạn là ông chủ.', k: 'bad' })
    } });

  // ── Bí mật (a.d.type: tax / dark / gate) ──
  const secVi = { tax: 'Chuyện tiền thuế', dark: 'Chuyện bọc vải đen', gate: 'Chuyện đoàn xe không đèn' };
  full('secret', { nameVi: 'Bí mật', good: ['exposed', 'hero', 'favor', 'win'],
    quest: () => 'Giữ hay nói điều đã thấy',
    marks: { hero: 'duoc_tin', exposed: 'ke_thu', backfire: 'tieng_xau', deal: 'che_cho', win: 'cua_phi_nghia', lose: 'cay_dang', favor: 'no_on', caught: 'tiec_nuoi', buried: 'buong_bo' },
    sum: { hero: (d, p) => `đưa đủ chứng cứ, vạch mặt ${nm(p)} trước cả vùng`, exposed: (d, p) => `vạch mặt ${nm(p)}`, backfire: (d, p) => `tố giác ${nm(p)} mà không ai tin`,
      deal: (d, p) => `đổi bí mật của ${nm(p)} lấy một chỗ dựa`, win: (d, p) => `sống sót sau khi tống tiền ${nm(p)}`, lose: (d, p) => `trả giá vì tống tiền ${nm(p)}`,
      favor: (d, p) => `giữ kín chuyện của ${nm(p)} và được đền đáp`, caught: (d, p) => `im lặng, để người khác vạch mặt ${nm(p)}`, buried: (d, p) => `đốt chứng cứ về ${nm(p)}, chôn chuyện ấy theo mình` },
    beat: { any: ['Bạn chép lại những gì đã thấy vào một tờ giấy, giấu dưới viên gạch lỏng.', '{p} nhìn bạn ở chợ lâu hơn mọi người.', 'Bạn để ý ai ra vào nhà {p} lúc nửa đêm.'] },
    acts: acts({ open: { st: ADE, wait: [0, 4] } }),
    open: (S, X, a, p) => ({ t: `${ref(S, p)} hình như biết bạn đã thấy. Mấy hôm liền ${nm(p)} cho người đứng ở đầu ngõ nhà bạn.`, k: 'info', bond: -5 }),
    knot: { title: 'Điều đã thấy', body: (S, X, a) => `${secVi[a.d.type] || 'Chuyện đêm ấy'} vẫn nằm trong bụng bạn. Nói ra thì cần chứng cứ; giữ lại thì cũng là một món hàng.`,
      choices: () => [ch('dig', 'Tìm thêm chứng cứ', 'Lâu và nguy hiểm.'), ch('black', 'Đòi tiền để im lặng', 'Có tiền ngay; kẻ bị tống tiền không bao giờ quên.'), ch('away', 'Quên chuyện đó đi', 'Không phải việc của mình.')],
      apply(S, X, ch, a, p) {
        if (ch === 'dig') { G.trajBump(S, { vo: .1 }); return `Bạn bắt đầu để ý giờ giấc của ${nm(p)}, ghi lại từng chuyến đi.`; }
        if (ch === 'black') { const g = Math.round(med(S, X) * 1.2); X.money(g); G.trajBump(S, { am: .3 }); return `${nm(p)} trả ${G.coin(g)}, không nhìn vào mắt bạn.`; }
        X.add('h', 2); return 'Bạn không nói với ai.';
      },
      auto: S => (S.traits.pious > .6 || S.traits.bold > .7 ? 'dig' : sh(S, 'am') + sh(S, 'thuong') > .2 ? 'black' : 'away') },
    trial: { base: (S, X, a, p) => (a.d.bg ? .5 : a.d.path === 'dig' ? .45 + .2 * S.traits.studious : vs(S, X, p, .2, .2, .9)),
      run(S, X, a, ok, p) {
        if (a.d.bg) return ok ? { t: `${nm(p)} lên chức. Từ đó gặp bạn ở đâu cũng gật đầu chào trước.`, k: 'info', bond: 10 } : { t: 'Có người khác cũng thấy những gì bạn thấy, và người đó không im lặng.', k: 'info' };
        if (a.d.path === 'dig') return ok ? { t: 'Bạn có trong tay một cuốn sổ ghi chép, đủ để treo cổ một người.', k: 'good' } : (X.add('hl', -8), { t: `Người của ${nm(p)} bắt gặp bạn rình quanh nhà kho. Bạn chạy được, mất một chiếc giày và nửa tháng nằm nhà.`, k: 'bad' });
        if (ok) { X.money(Math.round(med(S, X) * .5)); return { t: `${nm(p)} gửi người tới. Bạn tỉnh giấc với lưỡi dao kề cổ, vặn được tay hắn. Sáng ra ${nm(p)} gửi thêm một bao tiền.`, k: 'good', bond: -10 }; }
        X.add('hl', -18); X.cond('wound'); X.money(-Math.round(Math.max(0, S.gold) * .5)); return { t: `${nm(p)} gửi người tới. Họ lấy lại số tiền cũ, cả lãi, và để lại một vết sẹo.`, k: 'bad', bond: -10 };
      } },
    climax: { title: 'Lật bài',
      body: (S, X, a, p) => `${nm(p)} sắp lên một chức cao hơn. Sau ngày ấy, không ai đụng tới ${nm(p)} được nữa.`,
      choices: (S, X, a, p) => [ch('expose', 'Tố giác', `Chừng ${pct(G.clamp(.3 + .15 * G.standing(S, X).soc + S.fame / 200 + (a.d.path === 'dig' && a.d.ok ? .3 : 0), .1, .9))} người ta tin.`),
        ch('deal', 'Đổi bí mật lấy một chỗ dựa', `${nm(p)} lên chức thì bạn cũng có người che chở.`), ch('bury', 'Đốt hết, im lặng', 'Chuyện ấy theo bạn xuống mồ.')],
      apply(S, X, ch, a, p) {
        if (ch === 'expose') { if (X.rnd() < G.clamp(.3 + .15 * G.standing(S, X).soc + S.fame / 200 + (a.d.path === 'dig' && a.d.ok ? .3 : 0), .1, .9)) { fame(S, 4); X.add('so', 5); p.tier = 0; return { t: 'Phủ cho người xuống tra. Lời bạn khớp với sổ sách.', o: 'exposed' }; }
          X.add('so', -5); X.add('h', -5); return { t: 'Không ai tin bạn.', o: 'backfire' }; }
        if (ch === 'deal') { bond(p, 20); G.trajBump(S, { am: .2 }); return { t: `${nm(p)} nghe xong, gật đầu: "Ngươi khôn hơn ta tưởng."`, o: 'deal' }; }
        X.add('h', 2); return { t: 'Bạn đốt tờ giấy dưới viên gạch, nhìn tro bay.', o: 'buried' };
      },
      auto: (S, X, a) => (S.traits.pious > .6 || (a.d.path === 'dig' && a.d.ok) ? 'expose' : sh(S, 'am') > .2 ? 'deal' : 'bury'),
      bg: (S, X, a, p) => (a.d.ok ? { t: `${nm(p)} lên chức như dự tính.`, o: 'favor' } : { t: `${nm(p)} bị bắt. Người tố giác là một kẻ bạn chưa từng gặp.`, o: 'caught' }) },
    end(S, X, a, p, o) {
      if (a.d.bg) return o;
      if (a.d.path === 'black' && o === 'buried') return a.d.ok ? 'win' : 'lose';
      if (o === 'exposed' && a.d.path === 'dig' && a.d.ok) return 'hero';
      return o;
    },
    after: {
      hero: () => ({ t: 'Người ta kể chuyện cuốn sổ của bạn ở mọi quán rượu trong vùng. Lần sau có chuyện mờ ám, người ta tìm bạn trước khi tìm quan.', k: 'big' }),
      exposed: (S, X, a, p) => ({ t: `${nm(p)} bị cách chức. Dân làng mời bạn rượu, nhưng từ đó cũng có người đi đường vòng để khỏi phải chào bạn.`, k: 'good' }),
      backfire: (S, X, a, p) => { const f = Math.round(med(S, X) * .3); X.money(-f); return { t: `${nm(p)} vẫn ngồi ghế cũ. Bạn bị gọi lên phủ hỏi chuyện ba lần, mất tiền trà nước cộng lại ${G.coin(f)}.`, k: 'bad' }; },
      deal: () => ({ t: 'Năm có lệnh bắt phu, tên bạn không có trong danh sách. Năm thuế nặng, nhà bạn được hoãn. Bạn biết vì sao, và không hỏi.', k: 'info', bond: 10 }),
      win: () => ({ t: 'Số tiền ấy bạn tiêu không hết, mà cũng không vui khi tiêu.', k: 'info' }),
      lose: () => ({ t: 'Mỗi lần thấy người lạ đứng đầu ngõ, bạn lại sờ vết sẹo.', k: 'bad' }),
      favor: (S, X, a, p) => { X.money(Math.round(med(S, X) * .3)); return { t: `${nm(p)} lên chức, gặp bạn ở đâu cũng gật đầu chào. Năm có lệnh bắt phu, tên bạn không có trong danh sách.`, k: 'good', bond: 15 }; },
      caught: () => ({ t: 'Bạn đã biết trước cả năm. Bạn tự hỏi nếu mình nói, mọi chuyện có khác không.', k: 'bad' }),
      buried: () => ({ t: 'Có những điều bạn mang theo mình tới cuối đời. Chuyện ấy là một.', k: 'info' })
    } });

  // ── Mộng ước (người đi đường bạn theo suốt ba ngày hồi nhỏ; a.d.school) ──
  const idSkill = a => (a.d.school && J.schools[a.d.school] ? J.schools[a.d.school].masteries[0] : 'Body');
  full('idol', { nameVi: 'Mộng ước', good: ['surpass', 'taught', 'kind', 'legend'],
    quest: (a, p) => `Đi tới chỗ ${nm(p)} từng đứng`,
    marks: { surpass: 'cao_thu', taught: 'chan_truyen', kind: 'ban_cu', thanked: 'buong_bo', bested: 'cay_dang', legend: 'ke_di_xa', faded: 'tiec_nuoi' },
    sum: { surpass: (d, p) => `đứng ngang hàng ${nm(p)}, người mình theo suốt ba ngày hồi nhỏ`, taught: (d, p) => `được ${nm(p)} chỉ cho một thế`, kind: (d, p) => `cưu mang ${nm(p)}, người trong mộng ước, lúc người ấy sa cơ`,
      thanked: (d, p) => `nói được lời cảm ơn với ${nm(p)}`, bested: (d, p) => `đấu thử với ${nm(p)} và hiểu đường mình còn xa`, legend: (d, p) => `nghe kể về ${nm(p)} cả đời như nghe kể chuyện cổ tích`, faded: (d, p) => `để giấc mơ về ${nm(p)} lụi đi` },
    gone: (S, p) => `Lữ khách kể ${refE(S, p)} đã ngã xuống ở một chiến trường xa. Bạn nhớ ba ngày lẽo đẽo theo sau năm ấy.`,
    beat: { any: ['Bạn tập lại thế {p} dùng năm ấy, lần thứ một nghìn.', 'Có người kể chuyện {p} ở quán. Bạn ngồi nghe hết, không chen một câu.', 'Bạn vẽ lại hình {p} cưỡi ngựa qua làng, treo ở đầu giường.'] },
    acts: acts({ open: { st: TA, wait: [2, 15] }, climax: { st: ADE, when: (S, X) => ADE.includes(X.stage(S)) } }),
    open: (S, X, a, p) => ({ t: `Tin về ${ref(S, p)} bay về tới làng: ${X.pick(['một trận thắng ở biên giới', 'một con quái lớn bị hạ', 'một chức mới ở kinh đô'])}. Bạn kể lại cho lũ bạn ba lần trong một ngày.`, k: 'info' }),
    knot: { title: 'Theo dấu người trong mộng', body: (S, X, a, p) => `Bạn đã đủ lớn để đi xa. Nghe nói ${nm(p)} đang ở ${regName(p.loc)}.`,
      choices: (S, X, a, p) => [ch('follow', `Lên đường tìm ${nm(p)}`, 'Xin học, hoặc chỉ để được thấy một lần.'), ch('same', 'Theo cùng nghề, tự học', 'Đi đúng con đường người ấy đã đi.'), ch('away', 'Đó chỉ là giấc mơ trẻ con', 'Đời mình là đời mình.')],
      apply(S, X, ch, a, p) {
        if (ch === 'follow') { G.trajBump(S, { vo: .2 }); return `Bạn gói hành lý, lên đường tới ${regName(p.loc)}.`; }
        if (ch === 'same') { X.gain(idSkill(a), 4); return `Bạn xin vào học đúng nghề ${nm(p)} đã học, ở chính ngôi trường ${nm(p)} từng học.`; }
        return 'Bạn gỡ bức vẽ ở đầu giường xuống, cất vào rương.';
      },
      auto: S => (S.traits.bold > .6 ? 'follow' : S.traits.studious > .5 ? 'same' : S.traits.bold < .3 ? 'away' : 'same') },
    trial: { base: (S, X, a, p) => (a.d.bg ? .5 : .45 + (a.d.path === 'same' ? .15 : 0)),
      run(S, X, a, ok, p) {
        if (a.d.bg) return ok ? { t: `Tên ${nm(p)} giờ đã có trong bài hát của người hát rong.`, k: 'info' } : { t: `Lâu lắm rồi không ai nhắc tới ${nm(p)}.`, k: 'info' };
        if (a.d.path === 'follow') return ok ? { t: `Bạn tìm thấy đoàn của ${nm(p)}, xin theo làm chân sai vặt một mùa.`, k: 'good', bond: 10 } : (X.add('hl', -5), { t: `Bạn tới ${regName(p.loc)} thì ${nm(p)} đã đi. Bạn lần theo hai tháng, mất dấu, về.`, k: 'bad' });
        if (ok) { X.gain(idSkill(a), 3); X.addXp(60); } return ok ? { t: 'Bạn qua kỳ sát hạch đầu tiên, đúng kỳ ' + nm(p) + ' từng qua.', k: 'good' } : { t: 'Bạn trượt kỳ sát hạch. Người chấm bảo bạn bắt chước người khác quá nhiều.', k: 'bad' };
      } },
    climax: { title: 'Gặp lại người trong mộng',
      body(S, X, a, p) { const T = X.ctier(S), old = p.drive < .7 || G.castYrs(S, p) > G.RACES[p.race].le * .7;
        a.d.old = old; return old ? `Bạn gặp lại ${refE(S, p)} ở một quán nhỏ ven đường: tóc bạc, một bên là chân gỗ. ${nm(p)} không nhận ra bạn.`
          : `Bạn gặp lại ${refE(S, p)} ở ${capName(S)}. ${T >= p.tier && T >= 1 ? 'Giờ bạn đã ngang hàng với người từng là giấc mơ của mình.' : nm(p) + ' vẫn như năm ấy.'}`; },
      choices: (S, X, a, p) => (a.d.old ? [ch('care', 'Ngồi xuống, kể chuyện năm xưa', 'Trả tiền rượu, hỏi han.'), ch('thank', 'Chỉ nói lời cảm ơn rồi đi', '')]
        : [ch('spar', 'Xin đấu thử một trận', `Khả năng thắng chừng ${pct(vs(S, X, p, 0, .05, .9))}.`), ch('ask', 'Xin chỉ cho một thế', ''), ch('thank', 'Chỉ nói lời cảm ơn', '')]),
      apply(S, X, ch, a, p) {
        if (ch === 'care') { X.money(-Math.round(med(S, X) * .2)); bond(p, 20); return { t: `Bạn kể chuyện ba ngày lẽo đẽo năm xưa. ${nm(p)} cười tới chảy nước mắt.`, o: 'kind' }; }
        if (ch === 'spar') { if (X.rnd() < vs(S, X, p, 0, .05, .9)) { fame(S, 3); X.add('h', 10); return { t: `Bạn thắng. ${nm(p)} đứng dậy, cúi chào bạn như chào một người ngang hàng.`, o: 'surpass' }; }
          X.addXp(80); return { t: `${nm(p)} hạ bạn trong ba chiêu, rồi chỉ cho bạn chỗ sai ở chiêu thứ hai.`, o: 'bested' }; }
        if (ch === 'ask') { X.gain(idSkill(a), 4); X.addXp(120); bond(p, 20); return { t: `Nghe chuyện ba ngày lẽo đẽo năm xưa, ${nm(p)} cười to rồi chỉ cho bạn một thế ${G.mv(idSkill(a)).toLowerCase()}.`, o: 'taught' }; }
        X.add('h', 4); return { t: `${nm(p)} nghe, gật đầu, không nhớ gì cả. Bạn thì nhớ.`, o: 'thanked' };
      },
      auto: (S, X, a, p) => (a.d.old ? (S.traits.social > .4 ? 'care' : 'thank') : X.power(S) >= npcPow(p, 0) ? 'spar' : S.traits.studious > .4 ? 'ask' : 'thank'),
      bg: (S, X, a, p) => (a.d.ok ? { t: `${nm(p)} thành người của huyền thoại: có cả một bài vè kể chuyện ${nm(p)}.`, o: 'legend' } : { t: `Không ai còn nhớ ${nm(p)}. Bạn cũng gần như quên.`, o: 'faded' }) },
    end: (S, X, a, p, o) => (o === 'bested' && X.ctier(S) >= p.tier && X.ctier(S) >= 1 ? 'surpass' : o),
    after: {
      surpass: (S, X, a, p) => ({ t: `Bạn kể cho bọn trẻ trong làng chuyện ${nm(p)} năm xưa. Một đứa lẽo đẽo theo bạn suốt ba ngày.`, k: 'big' }),
      taught: (S, X, a, p) => ({ t: `Thế ấy bạn dùng cả đời, lần nào cũng nhớ tới ${nm(p)}.`, k: 'good' }),
      kind: (S, X, a, p) => ({ t: `Mùa nào bạn cũng ghé quán ấy, trả tiền rượu cho ${nm(p)}. Có lần ${nm(p)} gọi bạn bằng tên.`, k: 'good', bond: 10 }),
      thanked: () => ({ t: 'Giấc mơ năm ấy đã đưa bạn tới đây. Thế là đủ.', k: 'info' }),
      bested: () => ({ t: 'Bạn biết đường mình còn xa. Bạn đi tiếp.', k: 'info' }),
      legend: (S, X, a, p) => ({ t: `Bạn kể với con cháu rằng mình từng theo ${nm(p)} suốt ba ngày. Không ai tin.`, k: 'info' }),
      faded: () => ({ t: 'Có hôm bạn tìm lại bức vẽ cũ trong rương. Màu đã phai.', k: 'bad' })
    } });

  // ── Ruột thịt (anh chị gặp nạn; a.d.type: debt / sick / levy) ──
  full('kin', { nameVi: 'Ruột thịt', good: ['close', 'yield', 'fair', 'stood'],
    quest: (a, p) => `Giữ tình ruột thịt với ${nm(p)}`,
    marks: { close: 'tinh_than', yield: 'giu_loi', fair: 'duoc_tin', rift: 'cat_dut', stood: 'tiec_nuoi', cold: 'cay_dang' },
    sum: { close: (d, p) => `cưu mang ${nm(p)} lúc hoạn nạn`, yield: (d, p) => `nhường đất hương hỏa cho ${nm(p)}`, fair: (d, p) => `chia đất hương hỏa với ${nm(p)} cho sòng phẳng`,
      rift: (d, p) => `cắt đứt với ${nm(p)} vì đất hương hỏa`, stood: (d, p) => `đứng ngoài lúc ${nm(p)} hoạn nạn`, cold: (d, p) => `để ${nm(p)} bán nhà bỏ làng` },
    beat: { any: ['Bạn gửi về nhà một gói thuốc, kèm lá thư ngắn hỏi thăm {p}.', 'Đêm ấy bạn mơ thấy hai anh em còn bé, đuổi nhau quanh cây rơm.'] },
    acts: acts({ open: { st: ADE, wait: [0, 3] }, knot: { prio: 8, wait: [0, 4] } }),
    open: (S, X, a, p) => ({ t: { debt: `Thư nhà thứ hai: chủ nợ đã dán giấy lên cửa nhà ${nm(p)}.`, sick: `Thư nhà thứ hai: ${nm(p)} không ngồi dậy được nữa.`, levy: `Thư nhà thứ hai: con trai ${nm(p)} đã bị giải đi biên giới.` }[a.d.type] || `Thư nhà: ${nm(p)} cần người giúp.`, k: 'bad' }),
    knot: { title: 'Thư nhà', body: (S, X, a, p) => { const cost = Math.round(med(S, X) * .8); a.d.cost = cost; return `${nm(p)} cần người giúp. Chuyện này cần chừng ${G.coin(cost)}.`; },
      choices: (S, X, a) => [ch('help', 'Gửi tiền, về tận nơi', `Mất ${G.coin(a.d.cost)} và một chuyến đi.`), ch('send', 'Chỉ gửi tiền', `Mất ${G.coin(Math.round(a.d.cost * .6))}.`), ch('away', 'Chỉ gửi lời thăm', 'Nhà mình cũng chẳng dư.')],
      apply(S, X, ch, a, p) {
        if (ch === 'help') { X.money(-a.d.cost); X.add('h', 4); bond(p, 30); return `Bạn về tới nơi, ${nm(p)} ôm bạn khóc như hồi hai đứa còn bé.`; }
        if (ch === 'send') { X.money(-Math.round(a.d.cost * .6)); bond(p, 10); return 'Bạn gửi tiền theo người đưa thư. Thư cảm ơn về sau một tháng, nét chữ run.'; }
        bond(p, -40); return 'Thư trả lời của nhà ngắn hơn mọi lần.';
      },
      auto: (S, X) => (S.traits.social > .3 || sh(S, 'gia') > .12 ? (S.gold > med(S, X) ? 'help' : 'send') : 'away') },
    trial: { base: (S, X, a) => (a.d.bg ? .4 : a.d.path === 'help' ? .7 : .5),
      run(S, X, a, ok, p) {
        if (a.d.bg) return ok ? { t: `${nm(p)} tự xoay xở được, bán bớt ruộng, vay họ hàng bên ngoại.`, k: 'info' } : { t: `${nm(p)} bán nhà, dọn vào ở nhờ nhà kho của người ta.`, k: 'bad' };
        return ok ? { t: { debt: `${nm(p)} trả xong nợ.`, sick: `${nm(p)} khỏi bệnh, đi lại được.`, levy: `Con trai ${nm(p)} được chuộc về.` }[a.d.type] || `${nm(p)} qua được cơn hoạn nạn.`, k: 'good', bond: 10 }
          : { t: { debt: 'Tiền gửi về chỉ đủ trả lãi.', sick: `${nm(p)} đỡ, nhưng không còn khỏe như trước.`, levy: 'Tiền chuộc tới muộn; đứa cháu đã bị đưa đi xa hơn.' }[a.d.type] || 'Không đủ.', k: 'bad' };
      } },
    climax: { title: 'Đất hương hỏa',
      body: (S, X, a, p) => `Cha mẹ đã khuất, để lại mảnh đất hương hỏa. Họ hàng họp lại; ${nm(p)} ngồi đối diện bạn, không nói gì.`,
      choices: () => [ch('yield', 'Nhường cả cho anh chị', 'Mình đã có chỗ của mình.'), ch('split', 'Chia đôi cho sòng phẳng', ''), ch('claim', 'Giành lấy phần lớn', 'Mình đã bỏ tiền ra lúc nhà hoạn nạn.')],
      apply(S, X, ch, a, p) {
        if (ch === 'yield') { bond(p, 30); X.add('so', 4); return { t: `Bạn ký giấy nhường. ${nm(p)} nắm tay bạn rất lâu.`, o: 'yield' }; }
        if (ch === 'split') { X.money(Math.round(med(S, X) * .5)); return { t: 'Đất chia đôi, cắm cọc rõ ràng. Không ai thiệt.', o: 'fair' }; }
        X.money(Math.round(med(S, X))); bond(p, -50); return { t: `Bạn lấy phần lớn. ${nm(p)} đứng dậy bỏ về giữa buổi.`, o: 'rift' };
      },
      auto: (S, X, a) => (a.d.path === 'help' || S.traits.social > .5 ? 'yield' : sh(S, 'thuong') > .2 && S.traits.social < .3 ? 'claim' : 'split'),
      bg: (S, X, a) => (a.d.ok ? { t: 'Họ hàng chia đất hương hỏa. Bạn không về; phần của bạn để lại cho anh chị.', o: 'stood' } : { t: 'Đất hương hỏa bị bán để trả nợ. Bạn nghe tin sau cùng.', o: 'cold' }) },
    end(S, X, a, p, o) { if (a.d.bg) return o; if (o === 'yield' && a.d.path === 'help' && a.d.ok) return 'close'; return o; },
    after: {
      close: (S, X, a, p) => { const g = Math.round((a.d.cost || 20) * .8); X.money(g); X.add('h', 5); return { t: a.d.type === 'debt' ? `${nm(p)} trả lại bạn số tiền năm ấy, gói trong chiếc khăn tay của mẹ.` : `Mùa gặt nào ${nm(p)} cũng gửi lên một xe lúa, không đợi bạn hỏi. Năm nay nó đáng ${G.coin(g)}.`, k: 'good', bond: 10 }; },
      yield: (S, X, a, p) => ({ t: `${nm(p)} dựng lại từ đường trên mảnh đất ấy, khắc tên cả hai anh em trên bàn thờ.`, k: 'good' }),
      fair: () => ({ t: 'Hai nhà ở hai đầu mảnh đất, giỗ thì cùng ngồi một mâm.', k: 'info' }),
      rift: (S, X, a, p) => { X.add('so', -4); return { t: `Đám giỗ trong nhà, ${nm(p)} không ngồi cùng mâm với bạn. Từ đó hai nhà thôi qua lại.`, k: 'bad' }; },
      stood: (S, X, a, p) => ({ t: `${nm(p)} viết thư cảm ơn phần đất bạn để lại. Bạn đọc, thấy lạ: lẽ ra phải là bạn cảm ơn.`, k: 'info' }),
      cold: (S, X, a, p) => ({ t: `Không ai biết ${nm(p)} đã đi đâu. Bạn hỏi thăm, muộn mất mấy năm.`, k: 'bad' })
    } });

  // ── Bạn thân (bạn hồi nhỏ, bạn sau trận ẩu đả, bạn đồng hành chia tay) ──
  full('friend', { nameVi: 'Bạn thân', good: ['reunion', 'partners', 'saved', 'letters'],
    quest: (a, p) => `Gặp lại ${nm(p)}`,
    marks: { reunion: 'ban_cu', partners: 'duoc_tin', saved: 'huynh_de', letters: 'giu_loi', drift: 'tiec_nuoi', stranger: 'cay_dang', alone_ok: 'ke_di_xa' },
    sum: { reunion: (d, p) => `gặp lại ${nm(p)} sau bao năm xa cách`, partners: (d, p) => `cùng ${nm(p)} gây dựng một cơ nghiệp`, saved: (d, p) => `vượt đường xa cứu ${nm(p)} lúc hoạn nạn`,
      letters: (d, p) => `viết thư cho ${nm(p)} suốt bốn mươi năm`, drift: (d, p) => `không tới lúc ${nm(p)} cần`, stranger: (d, p) => `gặp lại ${nm(p)} như người lạ`, alone_ok: (d, p) => `nghe tin ${nm(p)} thành đạt ở phương xa` },
    gone: (S, p) => `Tin ${refE(S, p)} mất. Bạn tìm lại mấy lá thư cũ, đọc tới sáng.`,
    beat: { any: ['Thư của {p} tới, kể chuyện ở phương xa, kèm một nắm hạt giống lạ.', 'Bạn kể cho người mới quen chuyện bạn và {p} trốn học đi câu cá.', 'Bạn viết thư cho {p}, viết xong lại để đó, quên gửi.'] },
    acts: acts({ open: { st: CTA, wait: [3, 15] } }),
    open(S, X, a, p) { const r = X.pick(G.REGIONS.filter(r => r.id !== S.loc)); p.loc = r.id;
      return { t: `${ref(S, p)} theo một đoàn buôn đi ${r.nameVi}. Hôm tiễn, hai người hứa sẽ viết thư.`, k: 'info', o: 'part' }; },
    knot: { title: 'Thư của bạn cũ', body: (S, X, a, p) => `Thư của ${nm(p)} từ ${regName(p.loc)} tới đều đặn mỗi mùa. Bạn thì bận.`,
      choices: (S, X, a, p) => [ch('write', 'Viết đều, mùa nào cũng viết', ''), ch('visit', `Đi thăm ${nm(p)} một chuyến`, `Đường tới ${regName(p.loc)} mất cả tháng.`), ch('away', 'Để thư thưa dần', 'Mỗi người một cuộc đời.')],
      apply(S, X, ch, a, p) {
        if (ch === 'write') { bond(p, 10); return 'Bạn mua một xấp giấy, mùa nào cũng viết, kể cả khi chẳng có gì để kể.'; }
        if (ch === 'visit') { X.money(-Math.round(med(S, X) * .2)); bond(p, 20); X.add('h', 6); return `Bạn tới ${regName(p.loc)} đúng ngày ${nm(p)} đang dựng nhà. Bạn ở lại giúp lợp mái.`; }
        return 'Thư tới, bạn đọc, để đó. Rồi thư cũng thưa.';
      },
      auto: S => (S.traits.social > .55 ? 'visit' : S.traits.social > .3 ? 'write' : 'away') },
    trial: { base: (S, X, a, p) => .45 + (p ? p.drive * .3 : 0),
      run: (S, X, a, ok, p) => (ok ? { t: `${nm(p)} khấm khá ở ${regName(p.loc)}, mở một cửa hàng${p.wed ? ', đã có vợ có chồng' : ''}.`, k: 'info' }
        : { t: `Thư cuối của ${nm(p)} viết vội: làm ăn thua lỗ, ốm một trận dài.`, k: 'bad' }) },
    climax: { title: 'Bạn cũ cần bạn',
      body: (S, X, a, p) => (a.d.ok ? `${nm(p)} viết: "Ở đây có mối làm ăn lớn, một mình ta làm không xuể. Tới đây với ta."` : `${nm(p)} viết, nét chữ run: "Nếu được, tới đây một chuyến. Ta không biết nhờ ai."`),
      choices: (S, X, a, p) => [ch('go', `Lên đường tới chỗ ${nm(p)}`, 'Bỏ lại việc ở nhà một thời gian.'), ch('send', 'Gửi tiền, gửi thư', ''), ch('no', 'Không đi', 'Bây giờ không phải lúc.')],
      apply(S, X, ch, a, p) {
        if (ch === 'go') { X.money(-Math.round(med(S, X) * .3)); bond(p, 30); X.add('h', 6);
          return a.d.ok ? { t: `Bạn tới, xắn tay áo làm cùng ${nm(p)}. Năm ấy hai người kiếm được nhiều hơn mười năm trước cộng lại.`, o: 'partners' } : { t: `Bạn tới, ở lại ba tháng, chăm ${nm(p)} khỏi bệnh, trả hộ món nợ gấp nhất.`, o: 'saved' }; }
        if (ch === 'send') { X.money(-Math.round(med(S, X) * .2)); bond(p, 10); return { t: `Bạn gửi tiền kèm một lá thư dài. ${nm(p)} trả lời bằng một lá dài hơn.`, o: 'letters' }; }
        bond(p, -15); return { t: 'Bạn viết thư từ chối, sửa ba lần mới gửi.', o: 'drift' };
      },
      auto: (S, X, a, p) => (S.traits.social > .5 || p.bond > 50 ? 'go' : S.traits.social > .25 ? 'send' : 'no'),
      bg: (S, X, a, p) => (a.d.ok ? { t: `Nghe nói ${nm(p)} giờ là người có tiếng ở ${regName(p.loc)}.`, o: 'alone_ok' } : { t: `${nm(p)} có ghé làng một lần. Hai người đứng nói chuyện ở chợ như người quen sơ.`, o: 'stranger' }) },
    end: (S, X, a, p, o) => (o === 'letters' && a.d.path === 'visit' ? 'reunion' : o),
    after: {
      reunion: (S, X, a, p) => { X.add('so', 6); X.add('h', 6); return { t: `Bạn gặp lại ${refE(S, p)}${workVi(p) ? ', giờ làm ' + workVi(p) : ''}. Hai người uống tới sáng, kể lại những trận đòn hồi bé như kể chiến công.`, k: 'good', bond: 20 }; },
      partners: (S, X, a, p) => { X.money(Math.round(med(S, X) * 1.2)); return { t: `Cửa hàng mang tên cả hai người. Khách tới hỏi ai là chủ, hai người chỉ vào nhau.`, k: 'big', bond: 10 }; },
      saved: (S, X, a, p) => ({ t: `${nm(p)} đặt tên đứa con út theo tên bạn.`, k: 'big', bond: 20 }),
      letters: () => ({ t: 'Rương thư của bạn đầy hai ngăn. Lúc già, bạn giở ra đọc lại từ lá đầu tiên.', k: 'good' }),
      drift: (S, X, a, p) => ({ t: `Thư của ${nm(p)} thôi tới. Bạn không biết là vì giận hay vì không còn ai viết.`, k: 'bad' }),
      stranger: () => ({ t: 'Có những người bạn chỉ còn trong trí nhớ thì đẹp hơn.', k: 'bad' }),
      alone_ok: (S, X, a, p) => ({ t: `Bạn kể với hàng xóm: người có tiếng ở ${regName(p.loc)} ấy, hồi bé từng trốn học đi câu với mình.`, k: 'info' })
    } });

  // ── Người mất tích (bạn đồng hành không về; p.missing) ──
  full('lost', { nameVi: 'Người mất tích', good: ['back', 'rescued', 'ransomed', 'grave'],
    quest: (a, p) => `Tìm ${nm(p)}`,
    marks: { back: 'ban_cu', rescued: 'huynh_de', ransomed: 'duoc_tin', grave: 'buong_bo', never: 'tiec_nuoi', failed: 'no_mau' },
    sum: { back: (d, p) => `đón ${nm(p)} trở về sau bao năm mất tích`, rescued: (d, p) => `đi tìm và cứu được ${nm(p)}`, ransomed: (d, p) => `chuộc ${nm(p)} về bằng tiền`,
      grave: (d, p) => `tìm thấy mộ ${nm(p)}, đưa về quê`, never: (d, p) => `không bao giờ biết ${nm(p)} đã đi đâu`, failed: (d, p) => `tìm ra ${nm(p)} mà không cứu được` },
    fade: (S, X, p) => { if (p) { p.alive = false; p.died = S.world.year; } },
    beat: { any: ['Bạn hỏi mọi đoàn buôn qua làng có ai gặp người giống {p} không.', 'Bạn để một bát cơm trên bàn, như {p} vẫn ngồi đó.'] },
    acts: acts({ open: { st: ADE, wait: [2, 10] } }),
    open: (S, X, a, p) => ({ t: `Một lữ khách kể đã thấy người giống ${nm(p)} ${X.pick(['trong một trại thợ mỏ ở biên giới', 'trên một chiếc thuyền buôn đi về phương nam', 'trong đám tù binh của bọn cướp núi'])}.`, k: 'info' }),
    knot: { title: 'Tin đồn', body: (S, X, a, p) => `Người ta bảo ${nm(p)} đã chết. Lữ khách kia thì bảo chưa.`,
      choices: () => [ch('search', 'Tự đi tìm', 'Đường xa, không biết bao lâu.'), ch('post', 'Treo thưởng hỏi tin', 'Tốn tiền; tin giả nhiều hơn tin thật.'), ch('away', 'Làm lễ, để tang', 'Người đi rồi thì để người yên.')],
      apply(S, X, ch, a, p) {
        if (ch === 'search') { G.trajBump(S, { vo: .2 }); return 'Bạn gửi nhà cho hàng xóm, đeo túi lên đường.'; }
        if (ch === 'post') { X.money(-Math.round(med(S, X) * .3)); return 'Bạn treo bảng ở năm cái chợ: ai biết tin ' + nm(p) + ' thì có thưởng.'; }
        X.add('h', -2); return `Bạn lập một bát hương cho ${nm(p)} cạnh bàn thờ nhà mình.`;
      },
      auto: (S, X) => (S.traits.bold > .55 ? 'search' : S.gold > med(S, X) ? 'post' : 'away') },
    trial: { base: (S, X, a) => (a.d.bg ? .25 : a.d.path === 'search' ? .5 : .4),
      run(S, X, a, ok, p) {
        if (a.d.bg) return ok ? { t: `Có người thấy ${nm(p)} ở một bến đò, gầy rộc, đi về hướng làng.`, k: 'info' } : { t: 'Không ai còn nhắc tới chuyện ấy.', k: 'info' };
        return ok ? { t: `Bạn lần ra dấu vết: ${nm(p)} còn sống, đang bị giữ ở một nơi xa.`, k: 'good' } : (a.d.path === 'search' && X.add('hl', -8), { t: 'Bạn đi hết mùa, chỉ tìm được những tin đồn trái ngược nhau.', k: 'bad' });
      } },
    climax: { title: 'Dấu vết cuối',
      body: (S, X, a, p) => (a.d.ok ? `${nm(p)} bị giữ trong một trại của bọn buôn người. Chúng đòi tiền chuộc, hoặc phải vào mà lấy.` : `Manh mối cuối cùng dẫn tới một nghĩa địa không bia, ở bìa một khu rừng lạ.`),
      choices: (S, X, a, p) => (a.d.ok ? [ch('rescue', 'Đột nhập cứu người', `Chừng ${pct(odds(S, X, .45))} thoát cả hai.`), ch('ransom', 'Trả tiền chuộc', `Chừng ${G.coin(Math.round(med(S, X) * 1.2))}.`), ch('leave', 'Quay về', '')]
        : [ch('dig', 'Đào tìm', 'Có thể không phải.'), ch('leave', 'Quay về', '')]),
      apply(S, X, ch, a, p) {
        if (ch === 'rescue') { if (X.chance(odds(S, X, .45))) { fame(S, 2); p.missing = false; return { t: `Bạn cắt dây trói lúc nửa đêm, cõng ${nm(p)} chạy qua hai ngọn đồi.`, o: 'rescued' }; }
          X.add('hl', -15); X.cond('wound'); kill(S, p); return { t: `Bọn canh trại phát hiện. Bạn thoát được; ${nm(p)} thì không.`, o: 'failed' }; }
        if (ch === 'ransom') { const c = Math.round(med(S, X) * 1.2); if (S.gold >= c) { X.money(-c); p.missing = false; return { t: `Bạn đếm tiền cho bọn buôn người. Chúng đẩy ${nm(p)} ra, gầy tới mức bạn suýt không nhận ra.`, o: 'ransomed' }; }
          X.money(-Math.max(0, S.gold)); kill(S, p); return { t: 'Bạn không đủ tiền. Bọn chúng nhận hết, rồi nuốt lời.', o: 'failed' }; }
        if (ch === 'dig') { kill(S, p); X.add('h', -4); return { t: `Dưới lớp đất là chiếc vòng tay ${nm(p)} chưa bao giờ tháo.`, o: 'grave' }; }
        return { t: 'Bạn quay về, không ngoái lại.', o: 'never' };
      },
      auto: (S, X, a) => (a.d.ok ? (S.gold > med(S, X) * 1.2 ? 'ransom' : S.traits.bold > .4 ? 'rescue' : 'leave') : S.traits.social > .3 ? 'dig' : 'leave'),
      bg: (S, X, a, p) => (a.d.ok ? (p.missing = false, { t: `${nm(p)}, người ai cũng tưởng đã chết, gõ cửa nhà bạn. Một bên mắt đã mất; câu chuyện thì dài lắm.`, k: 'big', o: 'back', bond: 20 }) : (kill(S, p), { t: 'Bát hương của người mất tích đã nguội từ lâu.', o: 'never' })) },
    after: {
      back: (S, X, a, p) => { X.add('h', 10); return { t: `${nm(p)} ở lại nhà bạn cả mùa đông, kể chuyện những năm mất tích. Bạn nghe hết, không hỏi vì sao người ta không về sớm hơn.`, k: 'big' }; },
      rescued: (S, X, a, p) => { X.add('h', 10); return { t: `${nm(p)} khỏe lại. Từ đó đi đâu ${nm(p)} cũng kể: "Người này vào tận trại cướp lôi ta ra."`, k: 'big', bond: 30 }; },
      ransomed: (S, X, a, p) => { X.add('h', 8); return { t: `${nm(p)} trả lại bạn từng đồng tiền chuộc, mất năm năm.`, k: 'good', bond: 20 }; },
      grave: () => ({ t: 'Bạn đưa hài cốt về quê, chôn cạnh cây đa đầu làng. Giờ thì có chỗ để thắp hương.', k: 'info' }),
      never: () => ({ t: 'Có những người đi rồi không có tin. Bạn sống tiếp, mang theo một câu hỏi.', k: 'bad' }),
      failed: () => ({ t: 'Bạn mang về được chiếc giày của người ấy. Đêm nào trời trở, vết thương cũ lại nhức.', k: 'bad' })
    } });

  // ── Kẻ săn (Bộ Xương; Thánh Kỵ Sĩ trẻ từng được tha) ──
  full('hunter', { nameVi: 'Kẻ săn', good: ['truce', 'slain', 'fled', 'called'], body: 'undead', undead: true,
    quest: (a, p) => `Thoát khỏi ${nm(p)}`,
    marks: { truce: 'buong_bo', slain: 'tay_mau', beaten: 'cay_dang', fled: 'nguoi_la', called: 'tiec_nuoi', hidden: 'biet_bi_mat' },
    sum: { truce: (d, p) => `khiến ${nm(p)}, Thánh Kỵ Sĩ săn mình, hạ kiếm`, slain: (d, p) => `hạ ${nm(p)}, Thánh Kỵ Sĩ săn mình`, beaten: (d, p) => `bị ${nm(p)} thanh tẩy dở dang`,
      fled: (d, p) => `trốn khỏi ${nm(p)}`, called: (d, p) => `thoát ${nm(p)} vì giáo hội điều người ấy đi nơi khác`, hidden: (d, p) => `giấu mình kỹ tới mức ${nm(p)} bỏ cuộc` },
    gone: (S, p) => `Nghe lỏm lữ khách kể ${nm(p)}, Thánh Kỵ Sĩ từng săn bạn, đã chết. Bạn đứng ở cửa hầm cả đêm.`,
    beat: { any: ['Bạn nghe tiếng vó ngựa xa xa, nằm im trong hầm tới sáng.', 'Bạn đào thêm một lối thoát sau hầm.', 'Mùi nước thánh còn vương ở cửa hầm từ lần trước.'] },
    acts: acts({ open: { st: ADE, wait: [2, 6] } }),
    open(S, X, a, p) {
      p.tier = Math.max(p.tier, X.ctier(S));
      if (X.rnd() < vs(S, X, p, 0, .2, .85)) { fame(S, 2); return { t: `${ref(S, p)} quay lại, lần này mang theo ba người và một lọ nước thánh. Bạn đánh lui cả bốn; ${nm(p)} là người rút cuối cùng.`, k: 'good', o: 'held' }; }
      X.cond('crack'); X.add('hl', -10); return { t: `${ref(S, p)} quay lại, lần này mang theo ba người và một lọ nước thánh. Bạn mất một cánh tay xương, phải lội qua đầm mới thoát.`, k: 'bad', o: 'hurt' };
    },
    knot: { title: 'Thánh Kỵ Sĩ', body: (S, X, a, p) => `${nm(p)} sẽ quay lại. Người đó đã thề trước bàn thờ giáo hội.`,
      choices: () => [ch('arm', 'Chuẩn bị đánh', 'Bẫy, hầm, lối thoát.'), ch('talk', 'Để lại thư ở cửa hầm', 'Kể cho người đó nghe bạn từng là ai.'), ch('away', 'Rời vùng', 'Tìm một nghĩa địa khác.')],
      apply(S, X, ch, a, p) {
        if (ch === 'arm') { X.gain('Shield', 3); return 'Bạn đào hào quanh hầm, cắm cọc nhọn dưới lớp lá.'; }
        if (ch === 'talk') { return 'Bạn khắc lên phiến đá trước cửa hầm tên thật của mình lúc còn sống, và một câu: "Ta chưa giết ai."'; }
        S.flags.migrateQ = 'Thánh Kỵ Sĩ biết chỗ của bạn.'; return 'Bạn rời hầm trong đêm, mang theo những gì mang được.';
      },
      auto: S => (S.sm >= 25 && S.traits.social > .25 ? 'talk' : S.traits.bold > .5 ? 'arm' : 'away') },
    trial: { base: (S, X, a, p) => (a.d.bg ? .5 : a.d.path === 'arm' ? vs(S, X, p, -.2, .2, .85) : .35 + S.sm / 200),
      run(S, X, a, ok, p) {
        if (a.d.bg) return ok ? { t: `Nghe nói giáo hội điều ${nm(p)} đi trấn giữ một cửa ải phương bắc.`, k: 'info' } : { t: `${nm(p)} tìm tới nghĩa địa cũ, thấy hầm trống, lần theo dấu.`, k: 'bad' };
        if (a.d.path === 'talk') return ok ? { t: `Phiến đá có người đọc. Có ai đó để lại bên cạnh một bông hoa cúc trắng.`, k: 'good', bond: 20 } : { t: `Phiến đá bị đập vỡ làm đôi.`, k: 'bad', bond: -10 };
        return ok ? { t: `${nm(p)} sa xuống hào, mất ngựa, rút lui.`, k: 'good' } : (X.cond('crack'), { t: `${nm(p)} biết trước mọi cái bẫy. Bạn mất thêm một đốt sống.`, k: 'bad' });
      } },
    climax: { title: 'Lần này không ai cản',
      body: (S, X, a, p) => { p.tier = Math.max(p.tier, X.ctier(S)); return `${nm(p)} giờ là ${G.tierName(p.tier)}, đứng một mình trước cửa hầm: "Lần này không ai cản."`; },
      choices: (S, X, a, p) => [ch('fight', 'Đấu tới cùng', `Thua thì có thể bị thanh tẩy. Khả năng thắng chừng ${pct(vs(S, X, p, -.1 - (a.d.path === 'arm' && a.d.ok ? .2 : 0), .15, .85))}.`),
        ...(S.sm >= 25 || a.d.path === 'talk' ? [ch('talk', 'Nói chuyện', 'Kể cho người đó nghe bạn từng là ai.')] : []), ch('flee', 'Bỏ đi nơi khác', '')],
      apply(S, X, ch, a, p) {
        if (ch === 'fight') {
          if (X.rnd() < vs(S, X, p, -.1 - (a.d.path === 'arm' && a.d.ok ? .2 : 0), .15, .85)) { kill(S, p); fame(S, 5); return { t: `Bạn đặt thanh kiếm gãy của ${nm(p)} lên ngực người đó rồi lấp đất.`, o: 'slain' }; }
          if (X.chance(.2)) { X.die({ id: 'purge', text: `bị Thánh Kỵ Sĩ ${nm(p)} thanh tẩy` }); return null; }
          X.cond('crack'); return { t: 'Bạn vỡ nửa xương sườn, lăn xuống vực mới thoát.', o: 'beaten' };
        }
        if (ch === 'talk') { if (X.rnd() < .3 + S.sm / 150 + .3 * S.traits.social + (a.d.path === 'talk' && a.d.ok ? .3 : 0)) { p.bond = 20; p.role = 'ban'; return { t: `${nm(p)} nghe hết, rồi tra kiếm vào vỏ.`, o: 'truce' }; }
          X.cond('crack'); return { t: `${nm(p)} không nghe. Bạn chỉ kịp chạy.`, o: 'beaten' }; }
        S.flags.migrateQ = 'Thánh Kỵ Sĩ biết chỗ của bạn.'; return { t: 'Bạn rời hầm trong đêm.', o: 'fled' };
      },
      auto: (S, X, a, p) => ((S.sm >= 25 || a.d.path === 'talk') && S.traits.social > .25 ? 'talk' : X.power(S) >= npcPow(p, -.3) ? 'fight' : 'flee'),
      bg: (S, X, a, p) => (a.d.ok ? { t: `${nm(p)} không bao giờ quay lại vùng này nữa.`, o: 'called' } : { t: `${nm(p)} lần tới nghĩa địa mới, nhưng bạn đã chui sâu tới mức đất cũng quên bạn.`, o: 'hidden' }) },
    after: {
      truce: (S, X, a, p) => { X.add('h', 8); return { t: `${nm(p)} để ở cửa hầm một bình dầu thánh đã cạn phép, và không bao giờ quay lại với kiếm.`, k: 'good' }; },
      slain: (S, X, a, p) => { X.cond('hunted'); return { t: `Giáo hội Quang Minh treo giải cho cái đầu lâu đã giết ${nm(p)}.`, k: 'bad' }; },
      fled: () => ({ t: 'Bạn ở một nghĩa địa khác. Đêm nào cũng nghe ngóng tiếng vó ngựa.', k: 'info' }),
      beaten: (S, X, a, p) => ({ t: `${nm(p)} kể khắp vùng đã thanh tẩy được bạn. Người ta tin, nên mấy năm liền không ai tới đào nữa.`, k: 'info' }),
      called: () => ({ t: 'Có những mối thù tự tan, vì người giữ nó có việc khác phải làm.', k: 'info' }),
      hidden: () => ({ t: 'Bạn nằm yên dưới đất một thời gian dài. Lửa hồn lụi đi một chút, nhưng còn.', k: 'info' })
    } });

  // ── Đứa bé tặng hoa (Bộ Xương) ──
  full('flower', { nameVi: 'Đứa bé tặng hoa', good: ['guard', 'kin', 'accepted', 'grown_away'], body: 'undead', undead: true,
    quest: (a, p) => `Đợi ${nm(p)} lớn`,
    marks: { guard: 'che_cho', kin: 'ban_cu', accepted: 'duoc_tin', fled: 'nguoi_la', grown_away: 'buong_bo', burned: 'tiec_nuoi' },
    sum: { guard: (d, p) => `được ${nm(p)}, đứa bé tặng hoa năm nào, đứng ra che chở`, kin: (d, p) => `làm bạn với ${nm(p)} từ khi nó còn bé tới khi nó có con`, accepted: (d, p) => `nhờ ${nm(p)} mà được cả làng chấp nhận`,
      fled: (d, p) => `bỏ đồi mà đi khi làng kéo đuốc lên`, grown_away: (d, p) => `để ${nm(p)} lớn lên và quên mình`, burned: (d, p) => `mất hầm vì đứa bé năm nào lỡ miệng` },
    gone: (S, p) => `Lâu lắm không thấy ${nm(p)} lên đồi. Lữ khách kể người đó đã mất. Bạn để một bông hoa dại trước cửa hầm.`,
    beat: { any: ['{p} lại lên đồi, để một bông hoa dại trước cửa hầm.', '{p} hỏi bạn: "Ông có lạnh không?" Bạn không biết trả lời sao.', 'Bạn khắc cho {p} một con chim bằng xương thú.'] },
    acts: acts({ open: { st: ADE, wait: [1, 8] }, knot: { wait: [1, 30], when: (S, X, a, p) => G.castYrs(S, p) >= G.RACES[p.race].adult * .8 } }),
    open: (S, X, a, p) => ({ t: `${nm(p)} lại lên đồi, lần này mang theo một chiếc bánh bọc lá. Nó ngồi kể chuyện trong làng, không đợi bạn trả lời.`, k: 'good', bond: 10 }),
    knot: { title: 'Đứa bé đã lớn', body: (S, X, a, p) => `${nm(p)} giờ đã lớn, vẫn lên đồi mỗi tuần. Người làng bắt đầu để ý.`,
      choices: (S, X, a, p) => [ch('teach', `Dạy ${nm(p)} chữ cổ`, 'Những gì bạn còn nhớ từ đời trước.'), ch('trust', `Kể cho ${nm(p)} bạn từng là ai`, 'Người lớn giữ bí mật kém trẻ con.'), ch('away', 'Bảo nó đừng lên đồi nữa', 'Vì nó, cũng vì bạn.')],
      apply(S, X, ch, a, p) {
        if (ch === 'teach') { bond(p, 15); X.add('h', 6); return `${nm(p)} học nhanh. Có hôm nó đọc được cả dòng chữ trên bia mộ của chính bạn.`; }
        if (ch === 'trust') { bond(p, 25); return `Bạn kể. ${nm(p)} nghe hết, rồi nắm lấy bàn tay xương của bạn.`; }
        bond(p, -10); return `${nm(p)} khóc, rồi đi xuống đồi. Lâu lắm nó không lên nữa.`;
      },
      auto: S => (S.sm >= 25 ? 'teach' : S.traits.social > .4 ? 'trust' : 'away') },
    trial: { base: (S, X, a, p) => (a.d.bg ? .6 : .45 + (p.bond > 50 ? .2 : 0) - (a.d.path === 'trust' ? .1 : 0)),
      run(S, X, a, ok, p) {
        if (a.d.bg) return ok ? { t: `${nm(p)} lấy chồng lấy vợ dưới làng. Thỉnh thoảng bạn thấy nó dắt con đi chợ.`, k: 'info' } : { t: `Bọn trẻ trong làng thách nhau lên đồi ném đá vào hầm. ${nm(p)} không ngăn.`, k: 'bad' };
        return ok ? { t: `Người làng hỏi ${nm(p)} lên đồi làm gì. Nó bảo: đi hái thuốc.`, k: 'good' } : { t: `${nm(p)} lỡ miệng kể với một đứa bạn. Đứa bạn kể với mẹ nó.`, k: 'bad' };
      } },
    climax: { title: 'Đuốc lên đồi',
      body: (S, X, a, p) => `Dân làng kéo đuốc lên đồi${a.d.ok ? ', vì một con bò bị quái cắn chết; có người đổ cho bạn' : ', vì ai cũng biết có thứ gì đó sống trong hầm'}. ${nm(p)} chạy trước họ.`,
      choices: (S, X, a, p) => [ch('stand', 'Ra đứng trước cửa hầm', 'Để họ thấy bạn.'), ch('hide', `Trốn vào hầm, để ${nm(p)} nói`, ''), ch('flee', 'Đi lối sau', 'Bỏ hầm.')],
      apply(S, X, ch, a, p) {
        if (ch === 'stand') { if (X.chance(.4 + (p.bond > 50 ? .25 : 0) + (a.d.path === 'teach' ? .1 : 0))) { S.flags.revealed = true; X.add('h', 10); return { t: `${nm(p)} đứng cạnh bạn: "Ông ấy dạy con chữ. Ông ấy chưa đụng tới ai." Đám đuốc đứng lại, rồi tản dần.`, o: 'accepted' }; }
          X.cond('crack'); X.add('hl', -10); return { t: 'Đá ném như mưa. Bạn rút vào hầm, mất một bên vai.', o: 'burned' }; }
        if (ch === 'hide') { if (X.chance(.5 + (p.bond > 40 ? .2 : 0))) { const c = S.conds.find(c => c.id === 'hunted'); if (c) S.conds.splice(S.conds.indexOf(c), 1); return { t: `${nm(p)} đứng chắn trước cửa hầm: "Muốn vào thì bước qua tôi." Đám đuốc tản dần.`, o: 'guard' }; }
          return { t: 'Họ lấp cửa hầm bằng đá. Bạn đào ba tháng mới ra được.', o: 'burned' }; }
        S.flags.migrateQ = 'Làng đã biết chỗ của bạn.'; return { t: 'Bạn đi lối sau, không ngoái lại.', o: 'fled' };
      },
      auto: (S, X, a, p) => (p.bond > 50 ? 'hide' : S.traits.bold > .5 ? 'stand' : 'flee'),
      bg: (S, X, a, p) => (a.d.ok ? { t: `${nm(p)} lớn lên, có nhà có cửa dưới làng, không lên đồi nữa.`, o: 'grown_away' } : { t: 'Bọn trẻ ném đá vào hầm cả mùa. Bạn đào sâu thêm.', o: 'burned' }) },
    end: (S, X, a, p, o) => (o === 'guard' && a.d.path === 'teach' && a.d.ok ? 'kin' : o),
    after: {
      guard: (S, X, a, p) => ({ t: `Từ đó không ai lên đồi với đuốc nữa. ${nm(p)} vẫn lên, mỗi tuần một lần, mang theo hoa.`, k: 'big', bond: 20 }),
      kin: (S, X, a, p) => { X.add('h', 8); return { t: `${nm(p)} dắt con lên đồi, chỉ vào bạn: "Ông ấy là bạn của mẹ." Đứa nhỏ không sợ, y như mẹ nó ngày trước.`, k: 'big', bond: 10 }; },
      accepted: (S, X) => { X.add('so', 6); return { t: 'Người làng gọi bạn là "ông già trên đồi". Mùa gặt có người mang lên một bó lúa, đặt ở cửa hầm.', k: 'big' }; },
      fled: () => ({ t: 'Ở nghĩa địa mới, không có ai mang hoa tới.', k: 'bad' }),
      grown_away: () => ({ t: 'Bông hoa cuối cùng khô dần trên phiến đá. Bạn để nó ở đó.', k: 'info' }),
      burned: () => ({ t: 'Bạn sống tiếp dưới đất, sâu hơn trước.', k: 'bad' })
    } });

  // ── Lời bà đồng (không chiếm chỗ; a.d.y = tuổi bà đồng nói sẽ chết) ──
  const yrIn = (S, X, a) => X.years(S) >= a.d.y && X.years(S) < a.d.y + X.R(S).ypt * 2;
  full('prophecy', { nameVi: 'Lời bà đồng', passive: true, good: ['survived', 'defied', 'warded', 'calm'],
    marks: { survived: 'buong_bo', defied: 'cao_thu', warded: 'nguoi_moc_dao', calm: 'giu_loi', lost_year: 'tiec_nuoi' },
    sum: { survived: () => 'sống qua năm bà đồng nói sẽ chết', defied: () => 'đi thẳng vào năm hạn, và đi ra', warded: () => 'giải được hạn bà đồng nói', calm: () => 'không tin lời bà đồng, và đúng', lost_year: () => 'trốn cả năm hạn trong nhà' },
    acts: acts({ open: { st: ADE, wait: [0, 999], c: (S, X, a) => X.years(S) >= a.d.y - X.R(S).ypt * 6 }, knot: { wait: [0, 999] }, trial: { wait: [0, 999], c: (S, X, a) => X.years(S) >= a.d.y - X.R(S).ypt },
      climax: { wait: [0, 999], when: (S, X, a) => yrIn(S, X, a), st: ADE }, after: { wait: [1, 6] } }),
    open: (S, X, a) => ({ t: `Còn vài năm nữa là tới năm ${a.d.y} tuổi, năm bà đồng mù nói. Bạn bắt đầu đếm.`, k: 'info' }),
    knot: { title: 'Lời bà đồng', body: (S, X, a) => `Bà đồng nói bạn sẽ chết năm ${a.d.y} tuổi. Năm ấy sắp tới.`,
      choices: () => [ch('ward', 'Làm lễ giải hạn ở đền', 'Tốn tiền, được yên tâm.'), ch('seek', 'Tìm lại bà đồng hỏi cho rõ', 'Bà ta có thể đã chết.'), ch('away', 'Không tin', 'Lời đồn chợ búa.')],
      apply(S, X, ch, a) {
        if (ch === 'ward') { X.money(-Math.round(med(S, X) * .3)); if (S.faith) S.devotion = Math.min(100, (S.devotion || 0) + 5); return 'Thầy cúng đốt cả nắm hương, đọc kinh tới khuya.'; }
        if (ch === 'seek') return X.chance(.5) ? 'Bạn tìm được bà đồng, giờ đã lú lẫn. Bà nhìn bạn, cười: "Ta nói thế à?"' : 'Bà đồng đã chết từ lâu. Người trông đền chỉ cho bạn ngôi mộ.';
        X.add('h', 2); return 'Bạn cười, nhưng đêm ấy vẫn đếm ngón tay.';
      },
      auto: S => (S.traits.pious > .5 ? 'ward' : S.traits.bold > .6 ? 'away' : 'seek') },
    trial: { base: (S, X, a) => .55 + (a.d.path === 'ward' ? .15 : 0),
      run: (S, X, a, ok) => (ok ? { t: 'Năm trước năm hạn trôi qua êm. Bạn thấy mình ngớ ngẩn vì đã lo.', k: 'good' } : (X.add('hl', -6), { t: 'Năm trước năm hạn, bạn ngã gãy tay, sốt một trận dài. Bạn nghĩ tới lời bà đồng.', k: 'bad' })) },
    climax: { title: 'Năm hạn', body: (S, X) => `Năm nay bạn ${X.years(S)} tuổi, đúng năm bà đồng mù nói.`,
      choices: () => [ch('home', 'Ở yên trong nhà cả năm', 'Không đi đâu, không làm gì.'), ch('live', 'Sống như thường', ''), ch('face', 'Đi thẳng vào chỗ nguy', 'Xem số phận làm gì được mình.')],
      apply(S, X, ch) {
        if (ch === 'home') { X.money(-Math.round(med(S, X) * .3)); X.add('h', -3); return { t: 'Bạn đóng cửa, nhờ hàng xóm mua giùm gạo muối. Cả năm bạn không bước qua ngưỡng cửa.', o: 'lost_year' }; }
        if (ch === 'face') { if (X.chance(odds(S, X, .65))) { fame(S, 2); X.add('h', 8); return { t: 'Bạn nhận chuyến hộ tống qua đèo mà ai cũng từ chối. Bạn về, không sứt một sợi tóc.', o: 'defied' }; }
          X.add('hl', -20); X.cond('wound'); return { t: 'Đá lở trên đèo. Bạn sống sót, nằm ba tháng. Bà đồng chỉ sai có một chút.', o: 'survived' }; }
        X.add('h', -1); return { t: 'Bạn đi đâu cũng nhìn trước ngó sau, nhưng vẫn đi.', o: 'survived' };
      },
      auto: S => (S.traits.bold > .65 ? 'face' : S.traits.pious > .6 || S.traits.bold < .3 ? 'home' : 'live') },
    end: (S, X, a, p, o) => (o === 'survived' && a.d.path === 'ward' ? 'warded' : o === 'survived' && a.d.path === 'away' && a.d.ok ? 'calm' : o),
    after: {
      survived: (S, X) => { X.add('h', 8); return 'Bạn sống qua năm bà đồng nói. Bạn mua một vò rượu ngon, uống một mình, cười một mình.'; },
      defied: (S, X) => { X.add('h', 8); return 'Người ta kể chuyện bạn đi qua năm hạn như đi qua một cái cổng. Bạn kể lại, mỗi lần thêm một chút.'; },
      warded: (S, X) => { X.add('h', 6); return 'Năm hạn qua. Bạn mang lễ lên đền tạ, nhiều gấp đôi lần giải hạn.'; },
      calm: (S, X) => { X.add('h', 6); return 'Năm hạn qua như mọi năm. Bạn kể chuyện bà đồng như kể chuyện cười.'; },
      lost_year: (S, X) => ({ t: 'Năm hạn qua. Bạn bước ra cửa, thấy cây bàng trước nhà đã cao thêm một đầu người.', k: 'info' })
    } });

  // ═════════ 2. Mạch đời thường (mọc từ quyết định thường) ═════════
  // Mở bằng patchDec trên lựa chọn (def.from, def.when, xác suất def.p); def.who tạo người trong mạch lúc mở.
  // Cùng khuôn đầy đủ: 5 hồi, nhiều kết, lối 'away' (nếu có) = đứng ngoài.
  function grow(k, def) {
    patchDec(def.from, (S, X, c, o) => {
      if (S.undead || !def.when(S, X, c, o) || !X.chance(def.p)) return;
      const p = def.who ? G.castAdd(S, X, def.who(S, X)) : null;
      if (G.arcOpen(S, X, k, p, def.d ? def.d(S, X, c) : {})) X._lk = true;
    });
    def.acts = def.acts || acts({ open: { wait: [1, 8] } });
    full(k, def);
  }

  // ── Người thuê quay lại (nhận việc thuê) ──
  grow('s_patron', { nameVi: 'Người thuê quay lại', from: 'quest', p: .45, when: (S, X, k) => k !== 'no', good: ['more', 'steady', 'passed'],
    who: () => ({ role: 'on', how: 'người từng thuê bạn làm việc', work: 'merchant', bond: 10 }),
    quest: (a, p) => `Làm ăn với ${nm(p)}`,
    marks: { more: 'duoc_tin', steady: 'giu_loi', stiff: 'ke_thu', parted: 'ke_di_xa', passed: 'tiec_nuoi', burned: 'tay_trang' },
    sum: { more: (d, p) => `thành người làm ăn lâu năm của ${nm(p)}`, steady: (d, p) => `làm thuê cho ${nm(p)} đều tay nhiều năm`, stiff: (d, p) => `bị ${nm(p)} quỵt tiền công`,
      parted: (d, p) => `thôi làm cho ${nm(p)}, đi đường riêng`, passed: (d, p) => `nhường mối của ${nm(p)} cho người khác`, burned: (d, p) => `góp vốn với ${nm(p)} rồi mất trắng` },
    beat: { any: ['{p} gửi tới một mối việc nhỏ, trả công sòng phẳng.', 'Bạn ghé cửa hàng của {p}, uống chén trà, nghe chuyện buôn bán.'] },
    open: (S, X, a, p) => ({ t: `${nm(p)}, người thuê bạn năm trước, quay lại: việc năm ấy làm vừa ý, giờ có việc lớn hơn.`, k: 'good', bond: 10 }),
    knot: { title: 'Việc lớn của người thuê', body: (S, X, a, p) => `${nm(p)} cần người áp tải một chuyến hàng qua ${X.reg(S).zones[0].nameVi}.`,
      choices: () => [ch('take', 'Nhận, giá như cũ', 'Giữ mối lâu dài.'), ch('haggle', 'Đòi trả trước một nửa', 'Chắc tiền; người thuê có thể phật ý.'), ch('away', 'Từ chối', 'Việc này nguy hiểm.')],
      apply(S, X, ch, a, p) {
        if (ch === 'take') { bond(p, 10); return `Bạn bắt tay ${nm(p)}. Không cần giấy.`; }
        if (ch === 'haggle') { X.money(Math.round(med(S, X) * .4)); bond(p, -10); return `${nm(p)} nhíu mày, rồi đếm tiền.`; }
        return `${nm(p)} gật đầu, đi tìm người khác.`;
      },
      auto: (S, X) => (S.traits.social > .5 ? 'take' : S.traits.bold > .3 ? 'haggle' : 'away') },
    trial: { base: (S, X, a, p) => (a.d.bg ? .5 : odds(S, X, .55)),
      run(S, X, a, ok, p) {
        if (a.d.bg) return ok ? { t: `Người ${nm(p)} thuê thay bạn áp tải trót lọt, được trả gấp đôi.`, k: 'info' } : { t: `Chuyến hàng của ${nm(p)} bị cướp giữa đường.`, k: 'info' };
        if (ok) { X.money(Math.round(med(S, X) * .6)); return { t: 'Chuyến hàng tới nơi đủ, không mất một bao.', k: 'good', bond: 10 }; }
        X.add('hl', -8); return { t: 'Cướp chặn đường. Bạn giữ được nửa chuyến hàng, mất một vết chém.', k: 'bad', bond: -5 };
      } },
    climax: { title: 'Mối làm ăn lâu dài', body: (S, X, a, p) => `${nm(p)} mở thêm cửa hàng, mời bạn góp vốn: "Ngươi lo đường, ta lo chợ."`,
      choices: (S, X) => [ch('partner', 'Góp vốn', `Chừng ${G.coin(Math.round(med(S, X)))}.`), ch('wage', 'Chỉ làm thuê như cũ', ''), ch('leave', 'Thôi, đi đường riêng', '')],
      apply(S, X, ch, a, p) {
        if (ch === 'partner') { X.money(-Math.round(med(S, X))); return { t: 'Bạn đặt túi tiền lên bàn. Hai người ký giấy, có người làm chứng.', o: 'partner' }; }
        if (ch === 'wage') return { t: 'Bạn lắc đầu, nhận việc theo chuyến như cũ.', o: 'steady' };
        bond(p, -5); return { t: `Bạn cảm ơn ${nm(p)}, nhận chuyến cuối rồi thôi.`, o: 'parted' };
      },
      auto: (S, X) => (S.gold > med(S, X) * 1.5 && S.traits.bold > .4 ? 'partner' : S.traits.bold > .65 ? 'leave' : 'wage'),
      bg: (S, X, a, p) => (a.d.ok ? { t: `${nm(p)} giàu lên nhờ người áp tải mới.`, o: 'passed' } : { t: `${nm(p)} vỡ nợ sau chuyến hàng mất, bỏ đi nơi khác.`, o: 'passed' }) },
    end(S, X, a, p, o) {
      if (o === 'partner') return a.d.ok && a.d.path !== 'haggle' ? 'more' : 'burned';
      if (o === 'steady' && a.d.path === 'haggle' && !a.d.ok) return 'stiff';
      return o;
    },
    after: {
      more: (S, X, a, p) => { X.money(Math.round(med(S, X) * 2)); return { t: `Cửa hàng của ${nm(p)} và bạn mở thêm chi nhánh thứ ba. Ở chợ người ta gọi hai người là "đôi đũa".`, k: 'big', bond: 15 }; },
      steady: (S, X) => { X.money(Math.round(med(S, X) * .5)); return 'Năm nào cũng có việc, tiền công đều tay, không ai nợ ai.'; },
      stiff: (S, X, a, p) => { X.money(-Math.round(med(S, X) * .3)); return { t: `${nm(p)} thuê bạn lần nữa, rồi biến mất trước ngày trả công. Bạn ghi nhớ cái tên ấy.`, k: 'bad', bond: -40 }; },
      parted: () => ({ t: 'Bạn đi làm riêng. Có những năm nhớ cái mối cũ, nhưng không hối hận.', k: 'info' }),
      passed: () => ({ t: 'Có những mối việc mình nhường đi rồi mới biết là lớn.', k: 'info' }),
      burned: (S, X, a, p) => ({ t: `Cửa hàng sập sau hai mùa. ${nm(p)} trả lại bạn được một phần ba số vốn, xin lỗi mãi.`, k: 'bad' })
    } });

  // ── Phe trong hội (vào một hội) ──
  grow('s_guild', { nameVi: 'Phe trong hội', from: 'org_join', p: .5, when: (S, X, k) => k !== 'no', good: ['leader', 'old', 'young_win', 'broker'],
    quest: () => 'Đứng về phía nào trong hội',
    marks: { leader: 'nguoi_dung_dau', old: 'duoc_tin', young_win: 'vuot_doi_thu', young_lose: 'ke_thu', lost_seat: 'cay_dang', broker: 'giu_loi', out: 'tiec_nuoi' },
    sum: { leader: () => 'lên làm hội trưởng sau một vụ chia phe', old: () => 'đứng về phía hội trưởng lúc hội chia phe', young_win: () => 'cùng phe trẻ đổi mới cả hội', young_lose: () => 'thua trong một vụ chia phe ở hội',
      lost_seat: () => 'ra tranh ghế hội trưởng và thua', broker: () => 'hòa giải hai phe trong hội', out: () => 'đứng ngoài lúc hội chia phe' },
    beat: { any: ['Bạn ngồi họp hội tới khuya, nghe hai phe cãi nhau về một điều luật.', 'Người phe bên kia mời bạn đi uống. Bạn đi, nghe nhiều hơn nói.'] },
    open: () => ({ t: 'Hội trưởng đã già, phe trẻ muốn đổi luật chia phần. Ai cũng đang xem người mới như bạn đứng bên nào.', k: 'info' }),
    knot: { title: 'Hội chia phe', body: () => 'Hai phe đều mời bạn tới bàn. Không chọn cũng là chọn.',
      choices: () => [ch('old', 'Đứng về hội trưởng', 'Giữ nếp cũ.'), ch('young', 'Theo phe trẻ', 'Thắng thì lên, thua thì có thù.'), ch('away', 'Đứng ngoài', '')],
      apply(S, X, ch) { if (ch === 'old') { X.add('so', 3); return 'Bạn ngồi cạnh hội trưởng ở buổi họp.'; } if (ch === 'young') { G.trajBump(S, { vo: .1 }); return 'Bạn ký tên vào tờ thỉnh nguyện của phe trẻ.'; } return 'Bạn không tới buổi họp. Cả hai phe đều hiểu.'; },
      auto: S => (S.traits.bold > .55 ? 'young' : S.traits.social > .5 ? 'old' : 'away') },
    trial: { base: S => .45 + (S.so - 50) / 200,
      run: (S, X, a, ok) => (a.d.bg ? { t: ok ? 'Phe trẻ mạnh lên, kéo được nửa hội.' : 'Hội trưởng dẹp được phe trẻ, đuổi hai người cầm đầu.', k: 'info' }
        : ok ? { t: 'Phe bạn kéo thêm được mười người. Ở hội, người ta bắt đầu chào bạn trước.', k: 'good' } : { t: 'Phe bạn mất người. Có kẻ bỏ sang bên kia, mang theo cả danh sách.', k: 'bad' }) },
    climax: { title: 'Bầu hội trưởng', body: () => 'Hội trưởng xin nghỉ. Ghế để trống, cả hội họp kín ba ngày.',
      choices: S => [ch('run', 'Tự ra tranh ghế', `Chừng ${pct(G.clamp(.25 + (S.so - 50) / 150 + S.fame / 200, .05, .85))} thắng.`), ch('back', 'Đứng sau người phe mình', ''), ch('broker', 'Đứng ra hòa giải', 'Hai phe chia ghế phó.')],
      apply(S, X, ch, a) {
        if (ch === 'run') { if (X.rnd() < G.clamp(.25 + (S.so - 50) / 150 + S.fame / 200 + (a.d.ok ? .15 : 0), .05, .85)) { fame(S, 4); X.add('so', 6); return { t: 'Cả hội giơ tay. Bạn ngồi vào chiếc ghế đã mòn của người cũ.', o: 'leader' }; } X.add('h', -4); return { t: 'Bạn thua bốn phiếu.', o: 'lost_seat' }; }
        if (ch === 'broker') { X.add('so', 5); return { t: 'Bạn thuyết phục được cả hai phe ngồi chung một bàn. Ghế trưởng một bên, ghế phó một bên.', o: 'broker' }; }
        return { t: 'Bạn đứng sau người phe mình suốt buổi bầu.', o: 'back' };
      },
      auto: S => (S.traits.bold > .6 && S.so > 55 ? 'run' : S.traits.social > .6 ? 'broker' : 'back'),
      bg: () => ({ t: 'Hội bầu xong hội trưởng mới. Bạn nghe kết quả ở chợ.', o: 'out' }) },
    end(S, X, a, p, o) { if (o !== 'back') return o; if (a.d.path === 'old') return a.d.ok ? 'old' : 'young_lose'; return a.d.ok ? 'young_win' : 'young_lose'; },
    after: {
      leader: () => ({ t: 'Việc đầu tiên bạn làm là sửa lại luật chia phần, để không ai phải chia phe nữa.', k: 'big' }),
      old: () => ({ t: 'Hội giữ nếp cũ. Người cũ nhớ ơn bạn; người trẻ thì không.', k: 'good' }),
      young_win: () => ({ t: 'Luật chia phần mới mang tên bạn trong danh sách người đề xướng.', k: 'good' }),
      young_lose: () => ({ t: 'Phe bạn thua. Người thắng nhớ tên từng người đứng phía bên kia.', k: 'bad' }),
      lost_seat: () => ({ t: 'Bạn vẫn ở hội, ngồi hàng thứ hai. Có những buổi họp bạn không lên tiếng.', k: 'bad' }),
      broker: () => ({ t: 'Mười năm sau hội vẫn còn nguyên. Người ta bảo nhờ một buổi họp năm ấy.', k: 'good' }),
      out: () => ({ t: 'Hội đổi chủ, bạn đổi chỗ ngồi. Không ai hỏi ý bạn nữa.', k: 'info' })
    } });

  // ── Lứa thú con (đi săn tiền thưởng) ──
  grow('s_cubs', { nameVi: 'Lứa thú con', from: 'bounty', p: .35, when: (S, X, k) => k === 'go', good: ['bonded', 'wild', 'kill'],
    quest: () => 'Lứa thú con của con quái đã hạ',
    marks: { bonded: 'ban_cua_thu', wild: 'buong_bo', kill: 'tay_mau', mauled: 'cay_dang', sell: 'cua_phi_nghia', grown_wild: 'tiec_nuoi' },
    sum: { bonded: () => 'nuôi lớn con thú của con quái mình đã hạ, thành bạn đồng hành', wild: () => 'nuôi lứa thú con rồi thả về rừng', kill: () => 'giết cả con mẹ tìm về báo thù cho lứa con',
      mauled: () => 'bị con thú mẹ tìm về cào nát vai', sell: () => 'bán lứa thú con cho kẻ săn da', grown_wild: () => 'để lứa thú con lớn lên hoang dã' },
    beat: { any: ['Con thú nhỏ ngủ dưới chân bạn, thở phì phò.', 'Bạn đi ngang cái hang cũ, thấy dấu chân mới.'] },
    open: () => ({ t: 'Thợ săn trong vùng báo: trong hang của con quái bạn hạ năm ngoái, có một lứa con non đang đói.', k: 'info' }),
    knot: { title: 'Lứa thú con', body: () => 'Lứa con non nằm co trong hang, mắt còn chưa mở hết.',
      choices: () => [ch('kill', 'Giết hết cho xong', 'Lớn lên chúng sẽ xuống làng.'), ch('raise', 'Mang một con về nuôi', 'Có thể thành bạn, có thể thành họa.'), ch('sell', 'Bán cho kẻ săn da', 'Được giá.'), ch('away', 'Để mặc chúng', 'Rừng tự lo.')],
      apply(S, X, ch) {
        if (ch === 'kill') { X.add('h', -4); return 'Bạn làm việc cần làm rồi lấp cửa hang. Đêm ấy bạn không ăn được.'; }
        if (ch === 'raise') { S.flags.pet = 'thú con của con quái năm nào'; X.gain('Taming', 6); X.add('h', 4); return 'Bạn bọc con nhỏ nhất trong áo mang về. Nó cắn bạn ba lần trước khi chịu ăn.'; }
        if (ch === 'sell') { X.money(Math.round(med(S, X) * .6)); return 'Kẻ săn da trả tiền mặt, không hỏi gì.'; }
        return 'Bạn quay lưng đi. Sau lưng có tiếng rít khe khẽ.';
      },
      auto: S => (S.traits.social > .6 ? 'raise' : S.traits.pious < .3 ? 'sell' : S.traits.bold > .5 ? 'kill' : 'away') },
    trial: { base: (S, X, a) => (a.d.path === 'raise' ? .5 + .3 * S.traits.social : .5),
      run(S, X, a, ok) {
        if (a.d.bg) return ok ? { t: 'Lứa thú con sống sót, kéo nhau vào sâu trong rừng.', k: 'info' } : { t: 'Mùa đông năm ấy lứa thú con chết đói gần hết.', k: 'info' };
        if (a.d.path === 'raise') return ok ? { t: 'Con thú lớn nhanh, theo bạn như cái bóng. Lũ trẻ trong làng xin được sờ đầu nó.', k: 'good' } : { t: 'Con thú lớn lên, hung hơn bạn tưởng. Nó cắn chết hai con gà nhà hàng xóm.', k: 'bad' };
        return ok ? { t: 'Chuyện lứa thú con qua đi. Bạn không nghĩ tới nữa.', k: 'info' } : { t: 'Người đi rừng thấy dấu chân rất lớn quanh cái hang cũ. Có thứ gì đó đang tìm.', k: 'bad' };
      } },
    climax: { title: 'Con thú đã lớn',
      body: (S, X, a) => (a.d.path === 'raise' ? 'Con thú đã lớn bằng con bê. Người làng bắt đầu sợ; trưởng làng gọi bạn lên nói chuyện.' : 'Con mẹ của lứa thú ấy, to gấp đôi con bạn hạ năm nào, mò về tới bìa làng.'),
      choices: (S, X, a) => (a.d.path === 'raise' ? [ch('keep', 'Giữ nó bên mình', 'Bạn chịu trách nhiệm.'), ch('free', 'Thả về rừng', 'Nó sẽ không quên bạn.')]
        : [ch('fight', 'Ra đấu với nó', `Khả năng thắng chừng ${pct(odds(S, X, .45))}.`), ch('ward', 'Cùng làng dựng rào, đốt lửa đuổi', '')]),
      apply(S, X, ch, a) {
        if (ch === 'keep') { if (a.d.ok) { X.add('h', 6); return { t: 'Bạn dắt nó đi một vòng quanh làng, đeo cho nó một cái chuông. Người làng quen dần.', o: 'bonded' }; } X.add('so', -5); return { t: 'Nó cắn một đứa trẻ. Bạn phải tự tay làm việc mà năm ấy bạn đã không làm.', o: 'kill' }; }
        if (ch === 'free') { X.add('h', -2); return { t: 'Bạn dắt nó vào sâu trong rừng, tháo dây. Nó đứng nhìn bạn rất lâu rồi mới đi.', o: 'wild' }; }
        if (ch === 'fight') { if (X.chance(odds(S, X, .45))) { fame(S, 2); return { t: 'Bạn hạ con thú mẹ ở bìa rừng. Làng treo da nó ở đình.', o: 'kill' }; } X.add('hl', -15); X.cond('wound'); return { t: 'Con thú mẹ cào nát vai bạn rồi bỏ đi.', o: 'mauled' }; }
        X.add('so', 3); return { t: 'Cả làng đốt lửa canh ba đêm. Con thú bỏ đi.', o: a.d.path === 'sell' ? 'sell' : 'kill' };
      },
      auto: (S, X, a) => (a.d.path === 'raise' ? (S.traits.social > .5 ? 'keep' : 'free') : S.traits.bold > .5 ? 'fight' : 'ward'),
      bg: () => ({ t: 'Có năm người ta thấy một bầy thú lạ ở rìa rừng. Không ai biết chúng từ đâu ra; bạn thì biết.', o: 'grown_wild' }) },
    end: (S, X, a, p, o) => (o === 'kill' && a.d.path === 'sell' ? 'sell' : o),
    after: {
      bonded: () => ({ t: 'Con thú theo bạn tới cuối đời. Lúc nó chết, bạn chôn nó cạnh nhà, cắm một cái chuông lên mộ.', k: 'big' }),
      wild: () => ({ t: 'Có năm bạn vào rừng, thấy một con thú lớn đứng trên đỉnh dốc nhìn xuống. Nó không lại gần, cũng không bỏ đi.', k: 'good' }),
      kill: () => ({ t: 'Chuyện lứa thú con khép lại bằng máu, như nó đã bắt đầu.', k: 'info' }),
      mauled: () => ({ t: 'Mỗi lần trời trở, vai bạn nhức. Bạn không vào rừng một mình nữa.', k: 'bad' }),
      sell: () => ({ t: 'Có lần bạn thấy một tấm da thú lạ treo ở cửa hàng kẻ săn da. Bạn đi nhanh qua.', k: 'bad' }),
      grown_wild: () => ({ t: 'Rừng tự lo, như bạn nói. Rừng lo theo cách của rừng.', k: 'info' })
    } });

  // ── Đồng đội trong đoàn (vào đoàn lính đánh thuê) ──
  grow('s_comrade', { nameVi: 'Đồng đội trong đoàn', from: 'merc', p: .5, when: (S, X, k) => k !== 'no', good: ['saved_p', 'rank', 'drift'],
    who: () => ({ role: 'ban', how: 'đồng đội trong đoàn lính đánh thuê', work: 'guard', bond: 30 }),
    quest: (a, p) => `Giữ lưng cho ${nm(p)}`,
    marks: { saved_p: 'huynh_de', saved: 'no_mau', rank: 'duoc_tin', thief: 'ke_thu', fled: 'tieng_xau', drift: 'ban_cu', fell: 'tiec_nuoi' },
    sum: { saved_p: (d, p) => `đỡ đòn thay ${nm(p)}, đồng đội trong đoàn`, saved: (d, p) => `được ${nm(p)} đỡ đòn thay`, rank: () => 'được giao chỉ huy một toán trong đoàn', thief: (d, p) => `bị ${nm(p)} cuỗm phần chia của cả toán`,
      fled: () => 'bỏ chạy giữa một trận phục kích', drift: (d, p) => `mỗi người một ngả với ${nm(p)} khi đoàn giải tán`, fell: (d, p) => `không ở đó khi ${nm(p)} ngã xuống` },
    beat: { any: ['Bạn và {p} chia nhau nửa cái bánh khô bên đống lửa.', '{p} vá lại giáp cho bạn, càu nhàu suốt.'] },
    acts: acts({ open: { st: ADE, wait: [0, 6] } }),
    open: (S, X, a, p) => ({ t: `Trận đầu tiên trong đoàn, ${nm(p)} đứng bên trái bạn. Hai người sống sót, cười như điên.`, k: 'good', bond: 15 }),
    knot: { title: 'Đồng đội', body: (S, X, a, p) => `Đoàn trưởng xếp lại các toán. ${nm(p)} hỏi bạn có muốn chung toán không.`,
      choices: (S, X, a, p) => [ch('trust', `Chung toán, giao lưng cho ${nm(p)}`, ''), ch('lead', 'Xin làm tiểu đội trưởng', `${nm(p)} cũng muốn chỗ ấy.`), ch('away', 'Giữ khoảng cách', 'Trong đoàn đánh thuê, thân ai nấy lo.')],
      apply(S, X, ch, a, p) { if (ch === 'trust') { bond(p, 20); return 'Hai người khắc dấu toán lên chuôi kiếm.'; } if (ch === 'lead') { bond(p, -10); return `Bạn nhận chỗ. ${nm(p)} chúc mừng, giọng hơi khàn.`; } return 'Bạn xin sang toán khác.'; },
      auto: S => (S.traits.social > .5 ? 'trust' : S.traits.bold > .6 ? 'lead' : 'away') },
    trial: { base: (S, X) => odds(S, X, .55),
      run(S, X, a, ok, p) {
        if (a.d.bg) return ok ? { t: `Nghe nói ${nm(p)} được thăng làm tiểu đội trưởng.`, k: 'info' } : { t: `Toán của ${nm(p)} mất hai người trong một trận ở biên giới.`, k: 'info' };
        if (ok) { X.money(Math.round(med(S, X) * .5)); return { t: 'Trận lớn năm ấy đoàn thắng. Phần chia của toán bạn nặng tay.', k: 'good' }; }
        X.add('hl', -10); return { t: 'Trận lớn năm ấy đoàn thua, rút chạy ba ngày.', k: 'bad' };
      } },
    climax: { title: 'Trận phục kích', body: (S, X, a, p) => `Đoàn bị phục kích ở khe núi. Một nhát rìu nhắm vào ${nm(p)} từ phía sau.`,
      choices: () => [ch('cover', 'Lao ra đỡ', 'Có thể không về được.'), ch('hold', 'Giữ đội hình', 'Đoàn trước, người sau.'), ch('run', 'Rút chạy', 'Sống trước đã.')],
      apply(S, X, ch, a, p) {
        if (ch === 'cover') { X.add('hl', -18); X.cond('wound'); bond(p, 40); return { t: `Lưỡi rìu cắm vào vai bạn thay vì gáy ${nm(p)}.`, o: 'saved_p' }; }
        if (ch === 'hold') { if (a.d.path === 'lead' || a.d.ok) { fame(S, 2); return { t: 'Bạn hô giữ hàng. Cả toán đứng vững, đánh ngược lên dốc.', o: 'rank' }; } kill(S, p); X.add('h', -10); return { t: `${nm(p)} quay lại đỡ đòn cho bạn, như bạn lẽ ra phải làm cho ${nm(p)}.`, o: 'saved' }; }
        X.add('so', -6); return { t: 'Bạn chạy. Sau lưng có tiếng gọi tên bạn.', o: 'fled' };
      },
      auto: (S, X, a, p) => (p.bond > 50 ? 'cover' : S.traits.bold > .3 ? 'hold' : 'run'),
      bg: (S, X, a, p) => (a.d.ok ? { t: 'Đoàn giải tán. Mỗi người một ngả.', o: 'drift' } : (kill(S, p), { t: `${nm(p)} ngã xuống trong một trận phục kích. Bạn ở toán khác, tới nơi khi mọi chuyện đã xong.`, o: 'fell' })) },
    end: (S, X, a, p, o) => (o === 'rank' && a.d.path === 'trust' && !a.d.ok && X.chance(.3) ? 'thief' : o),
    after: {
      saved_p: (S, X, a, p) => { X.add('h', 8); return { t: `${nm(p)} cõng bạn ra khỏi khe núi. Từ đó ${nm(p)} gọi bạn là anh em, đi đâu cũng thế.`, k: 'big', bond: 20 }; },
      saved: (S, X, a, p) => ({ t: `Bạn chôn ${nm(p)} bên đường, cắm thanh kiếm làm bia.`, k: 'bad' }),
      rank: () => { return { t: 'Đoàn trưởng giao cho bạn chỉ huy ba toán.', k: 'good' }; },
      thief: (S, X, a, p) => { X.money(-Math.round(Math.max(0, S.gold) * .2)); p.role = 'thu'; p.bond = -50; return { t: `Sáng ra ${nm(p)} biến mất cùng phần chia của cả toán.`, k: 'bad' }; },
      fled: () => ({ t: 'Đoàn không đuổi bạn, nhưng không ai ngồi cạnh bạn bên đống lửa nữa.', k: 'bad' }),
      drift: (S, X, a, p) => ({ t: `Mỗi lần nghe tiếng rìu chẻ củi, bạn lại nhớ ${nm(p)}.`, k: 'info' }),
      fell: () => ({ t: 'Bạn thắp nhang cho người đồng đội cũ mỗi năm, đúng ngày ấy.', k: 'bad' })
    } });

  // ── Lời hứa lúc tranh cử (ra tranh ghế trưởng làng) ──
  grow('s_promise', { nameVi: 'Lời hứa lúc tranh cử', from: 'head_elect', p: .6, when: (S, X, k) => k === 'yes', good: ['well', 'keep'],
    quest: () => 'Giữ lời hứa đào giếng',
    marks: { well: 'nguoi_dung_dau', keep: 'giu_loi', charge: 'cua_phi_nghia', guard: 'ke_thu', dry: 'cay_dang', break: 'tieng_xau' },
    sum: { well: () => 'đào giếng cho xóm cuối rồi mở cho cả vùng dùng chung', keep: () => 'giữ lời hứa đào giếng lúc tranh ghế trưởng', charge: () => 'thu tiền nước ở cái giếng mình hứa đào',
      guard: () => 'giữ giếng cho riêng xóm mình mùa hạn', dry: () => 'đào giếng mà không gặp mạch', break: () => 'quên lời hứa lúc tranh ghế trưởng' },
    beat: { any: ['Người xóm cuối hỏi bạn chuyện cái giếng, lần thứ ba trong tháng.'] },
    open: () => ({ t: 'Lúc tranh ghế, bạn hứa đào một cái giếng mới cho xóm cuối. Giờ người ta bắt đầu nhắc.', k: 'info' }),
    knot: { title: 'Lời hứa', body: (S, X) => `Đào giếng cần chừng ${G.coin(Math.round(med(S, X) * .8))}.`,
      choices: () => [ch('keep', 'Bỏ tiền nhà mình', ''), ch('levy', 'Bắt cả làng góp công', 'Nhanh; có người kêu.'), ch('away', 'Để sau', 'Người ta sẽ nhớ.')],
      apply(S, X, ch) { if (ch === 'keep') { X.money(-Math.round(med(S, X) * .8)); X.add('so', 4); return 'Bạn thuê thợ đào giếng ngay sau mùa gặt.'; } if (ch === 'levy') { X.add('so', -2); return 'Mỗi nhà góp ba ngày công. Có nhà góp, có nhà trốn.'; } X.add('so', -4); return 'Bạn bảo: sang năm.'; },
      auto: (S, X) => (S.gold > med(S, X) ? 'keep' : S.traits.social > .5 ? 'levy' : 'away') },
    trial: { base: (S, X, a) => (a.d.bg ? .3 : .6),
      run: (S, X, a, ok) => (a.d.bg ? (ok ? { t: 'Người xóm cuối tự góp tiền đào giếng.', k: 'info' } : { t: 'Xóm cuối vẫn gánh nước từ sông.', k: 'info' }) : ok ? { t: 'Thợ đào xuống mười hai thước thì gặp mạch. Nước trong, ngọt.', k: 'good' } : { t: 'Thợ đào xuống hai mươi thước, chỉ gặp đá.', k: 'bad' }) },
    climax: { title: 'Mùa khô', body: (S, X, a) => (a.d.ok ? 'Hạn hán. Giếng xóm cuối là giếng duy nhất trong vùng còn nước. Người làng bên kéo tới xin.' : 'Hạn hán. Cái giếng khô của bạn nằm giữa xóm như một lời nhắc.'),
      choices: (S, X, a) => (a.d.ok ? [ch('share', 'Mở giếng cho cả vùng', 'Xóm mình có thể thiếu.'), ch('charge', 'Thu tiền nước', 'Giếng là của làng mình.'), ch('guard', 'Chỉ cho xóm mình', '')]
        : [ch('share', 'Bỏ tiền chở nước từ sông về cho xóm', ''), ch('guard', 'Bảo mọi người tự lo', '')]),
      apply(S, X, ch, a) {
        if (ch === 'share') { X.add('so', 6); if (!a.d.ok) X.money(-Math.round(med(S, X) * .4)); return { t: a.d.ok ? 'Người ba làng xếp hàng bên giếng xóm cuối. Không ai chen.' : 'Bạn thuê ba xe trâu chở nước suốt mùa khô.', o: 'share' }; }
        if (ch === 'charge') { X.money(Math.round(med(S, X) * .8)); X.add('so', -6); return { t: 'Mỗi gánh nước một đồng. Người làng bên trả, không nhìn mặt bạn.', o: 'charge' }; }
        X.add('so', -3); return { t: 'Bạn cho người canh giếng.', o: 'guard' };
      },
      auto: (S, X, a) => (S.traits.social > .45 ? 'share' : sh(S, 'thuong') > .2 ? 'charge' : 'guard'),
      bg: () => ({ t: 'Người xóm cuối nhắc lời hứa của bạn mỗi mùa khô.', o: 'break' }) },
    end(S, X, a, p, o) { if (o === 'share') return a.d.ok ? (a.d.path === 'keep' ? 'well' : 'keep') : 'keep'; if (o === 'guard' && !a.d.ok) return 'dry'; return o; },
    after: {
      well: () => ({ t: 'Người ba làng gọi giếng ấy theo tên bạn. Năm sau bạn tái cử, không ai ra tranh.', k: 'big' }),
      keep: () => ({ t: 'Lời hứa giữ được. Người xóm cuối gọi bạn là người nói được làm được.', k: 'good' }),
      charge: () => ({ t: 'Cái giếng làm bạn giàu thêm một chút, và nghèo đi một chút ở chỗ khác.', k: 'bad' }),
      guard: () => ({ t: 'Làng bên không quên mùa khô năm ấy.', k: 'bad' }),
      dry: () => ({ t: 'Cái giếng khô được lấp lại. Người ta nhắc lời hứa của bạn như nhắc một chuyện cười.', k: 'bad' }),
      break: () => ({ t: 'Mùa khô nào xóm cuối cũng gánh nước từ sông, và nhắc tên bạn.', k: 'bad' })
    } });

  // ── Đất mới (dời nhà đi nơi khác) ──
  grow('s_newland', { nameVi: 'Đất mới', from: 'migrate', p: .5, when: (S, X, k) => k !== 'stay', good: ['home', 'bridge', 'onward'],
    quest: () => 'Bén rễ ở đất mới',
    marks: { home: 'que_moi', bridge: 'duoc_tin', apart: 'nguoi_la', onward: 'ke_di_xa', cold: 'tiec_nuoi' },
    sum: { home: () => 'biến đất mới thành quê', bridge: () => 'làm cầu nối giữa người cũ và người mới ở đất mới', apart: () => 'sống ở đất mới cả đời như khách', onward: () => 'rời đất mới, đi tiếp', cold: () => 'sống khép kín ở đất mới' },
    beat: { any: ['Bạn học thêm vài câu tiếng địa phương, nói sai, người ta cười.', 'Bạn trồng ở góc vườn một cây mang từ quê cũ.'] },
    acts: acts({ open: { st: TAE, wait: [0, 4] } }),
    open(S, X, a) {
      if (X.chance(.4 + S.traits.social * .4)) { const p = G.castAdd(S, X, { role: 'ban', how: 'người hàng xóm đầu tiên ở đất mới', bond: 40 }); a.who = p.id; X.add('so', 3);
        return { t: `${nm(p)}, nhà bên cạnh, mang sang một nồi canh vào tối đầu tiên bạn tới.`, k: 'good' }; }
      X.add('so', -3); return { t: 'Ở đất mới chưa ai chào bạn. Người ta nhìn bạn đi chợ như nhìn khách qua đường.', k: 'bad' };
    },
    knot: { title: 'Bén rễ', body: () => 'Đất mới có nếp riêng: lễ khác, chợ khác, cách chào khác.',
      choices: () => [ch('mix', 'Học theo nếp đất mới', ''), ch('own', 'Giữ nếp quê cũ, mời người mới tới xem', ''), ch('away', 'Sống khép kín', 'Làm ăn thôi.')],
      apply(S, X, ch) { if (ch === 'mix') { X.add('so', 4); return 'Bạn đi lễ đền làng, góp gạo nấu cỗ.'; } if (ch === 'own') { X.add('h', 3); return 'Tết quê cũ, bạn bày mâm cỗ theo lối nhà mình, mời cả xóm sang.'; } return 'Bạn đóng cổng, chỉ mở khi đi chợ.'; },
      auto: S => (S.traits.social > .55 ? 'mix' : S.traits.social > .3 ? 'own' : 'away') },
    trial: { base: S => .5 + S.traits.social * .2,
      run: (S, X, a, ok) => (ok ? { t: 'Vụ đầu ở đất mới được mùa. Hàng xóm sang mượn giống.', k: 'good' } : { t: 'Vụ đầu ở đất mới mất trắng. Bạn không biết đất này mưa vào tháng nào.', k: 'bad' }) },
    climax: { title: 'Người làng mới', body: () => 'Làng mở hội lớn, cần mỗi nhà góp một tay. Có người bảo: dân mới thì đứng ngoài.',
      choices: () => [ch('join', 'Góp, xin đứng một chân trong hội', ''), ch('stand', 'Đứng ngoài', ''), ch('leave', 'Bán nhà, đi tiếp', 'Đất này không hợp.')],
      apply(S, X, ch) { if (ch === 'join') { X.add('so', 6); return { t: 'Bạn khiêng kiệu cùng trai làng. Từ đó người ta gọi bạn bằng tên.', o: 'join' }; } if (ch === 'stand') return { t: 'Bạn đứng xem hội từ hiên nhà.', o: 'apart' }; S.flags.migrateQ = 'Đất này không hợp.'; return { t: 'Bạn bán nhà sau mùa hội.', o: 'onward' }; },
      auto: S => (S.traits.social > .4 ? 'join' : S.traits.bold > .65 ? 'leave' : 'stand'),
      bg: (S, X, a) => ({ t: a.d.ok ? 'Làng mở hội, không ai gọi nhà bạn.' : 'Mấy năm liền nhà bạn vẫn là "nhà người mới".', o: 'cold' }) },
    end: (S, X, a, p, o) => (o === 'join' ? (a.d.path === 'own' ? 'bridge' : 'home') : o),
    after: {
      home: () => ({ t: 'Đất mới đã thành quê. Con cháu bạn nói giọng ở đây.', k: 'good' }),
      bridge: () => ({ t: 'Lễ hội làng có thêm một món của quê bạn. Người mới tới sau tìm bạn trước tiên.', k: 'good' }),
      apart: () => ({ t: 'Bạn sống ở đây hai mươi năm, vẫn là người nơi khác tới.', k: 'bad' }),
      onward: () => ({ t: 'Bạn đi tiếp, mang theo một gói đất của nơi cũ.', k: 'info' }),
      cold: () => ({ t: 'Bạn sống yên, không ai làm phiền. Cũng không ai hỏi thăm.', k: 'bad' })
    } });

  // ── Lai lịch món đồ (mua trang bị) ──
  grow('s_loot', { nameVi: 'Lai lịch món đồ', from: 'gear', p: .25, when: (S, X, k) => k === 'buy', good: ['return', 'rewarded', 'caught'],
    quest: () => 'Món đồ ăn cắp',
    marks: { return: 'giu_loi', rewarded: 'duoc_tin', caught: 'nguoi_giu_lang', pay: 'buong_bo', keep: 'tieng_xau', sued: 'cay_dang' },
    sum: { return: () => 'trả lại món đồ ăn cắp cho chủ cũ', rewarded: () => 'trả lại món đồ ăn cắp, được chủ cũ coi như người nhà', caught: () => 'lần ra và bắt được kẻ trộm món đồ mình mua',
      pay: () => 'trả thêm tiền để giữ món đồ có lai lịch xấu', keep: () => 'giữ món đồ ăn cắp, mặc chủ cũ khóc', sued: () => 'bị kiện vì giữ món đồ ăn cắp' },
    beat: { any: ['Bạn lau món đồ, nhìn kỹ vết khắc nhỏ dưới chuôi.'] },
    open: () => ({ t: 'Một người lạ chặn bạn ở chợ: món đồ bạn mua năm ngoái là của nhà ông ta, bị trộm.', k: 'info' }),
    knot: { title: 'Chủ cũ của món đồ', body: () => 'Ông ta chỉ vào vết khắc dưới chuôi: tên ông nội ông ta.',
      choices: () => [ch('return', 'Trả lại', 'Mất món đồ.'), ch('pay', 'Trả thêm tiền để giữ', ''), ch('keep', 'Bảo ông ta đi chỗ khác', 'Đồ bạn mua bằng tiền.')],
      apply(S, X, ch) { if (ch === 'return') { S.gear = Math.max(0, S.gear - 1); X.add('so', 4); return 'Bạn tháo món đồ đưa lại. Ông ta khóc, cúi đầu ba lần.'; } if (ch === 'pay') { X.money(-Math.round(med(S, X) * .5)); return 'Bạn trả thêm cho ông ta một khoản. Hai bên bắt tay.'; } X.add('so', -4); return 'Bạn gạt ông ta ra. Cả chợ nhìn theo.'; },
      auto: (S, X) => (S.traits.pious > .55 ? 'return' : S.gold > med(S, X) ? 'pay' : 'keep') },
    trial: { base: () => .5,
      run: (S, X, a, ok) => (a.d.path === 'keep' ? (ok ? { t: 'Ông ta không quay lại nữa.', k: 'info' } : { t: 'Ông ta quay lại, lần này với một lá đơn kiện.', k: 'bad' })
        : ok ? { t: 'Ông chủ cũ hóa ra là người có máu mặt ở phủ. Ông nhớ tên bạn.', k: 'good' } : { t: 'Chuyện món đồ qua đi.', k: 'info' }) },
    climax: { title: 'Kẻ trộm', body: () => 'Ở một quán rượu bên kia sông, bạn nhận ra gã bán món đồ cho bạn năm nào, đang chào hàng một thanh kiếm khác.',
      choices: () => [ch('catch', 'Tóm gã, giải lên phủ', `Gã có hai người đi cùng.`), ch('warn', 'Báo cho chủ quán', ''), ch('let', 'Làm như không thấy', '')],
      apply(S, X, ch) {
        if (ch === 'catch') { if (X.chance(odds(S, X, .55))) { fame(S, 2); X.add('so', 4); return { t: 'Bạn quật gã xuống bàn. Phủ tìm thấy trong nhà gã cả một kho đồ ăn cắp.', o: 'caught' }; } X.add('hl', -10); return { t: 'Gã và hai đồng bọn chạy thoát. Bạn ôm vết dao.', o: 'let' }; }
        if (ch === 'warn') return { t: 'Chủ quán đuổi gã ra. Gã đi, nhìn bạn một cái.', o: 'let' };
        return { t: 'Bạn uống hết chén rượu, đi.', o: 'let' };
      },
      auto: S => (S.traits.bold > .5 ? 'catch' : S.traits.social > .5 ? 'warn' : 'let') },
    end(S, X, a, p, o) { if (o === 'caught') return 'caught'; if (a.d.path === 'return') return a.d.ok ? 'rewarded' : 'return'; if (a.d.path === 'keep') return a.d.ok ? 'keep' : 'sued'; return 'pay'; },
    after: {
      return: () => ({ t: 'Bạn mua món khác, rẻ hơn. Không ai biết chuyện, trừ bạn và ông lão ấy.', k: 'good' }),
      rewarded: S => { S.gear = Math.min(10, S.gear + 1); return { t: 'Ông lão gửi tới một món đồ của nhà ông, không ăn cắp, tốt hơn món cũ.', k: 'good' }; },
      caught: () => ({ t: 'Người mất đồ trong vùng kéo nhau tới phủ nhận lại đồ, ai cũng hỏi tên bạn.', k: 'big' }),
      pay: () => ({ t: 'Món đồ giờ là của bạn, sạch sẽ. Bạn vẫn để vết khắc cũ.', k: 'info' }),
      keep: () => ({ t: 'Món đồ vẫn dùng tốt. Người chợ thì nhớ chuyện hôm ấy.', k: 'bad' }),
      sued: (S, X) => { S.gear = Math.max(0, S.gear - 1); X.money(-Math.round(med(S, X) * .3)); return { t: 'Phủ xử bạn trả lại món đồ, nộp thêm tiền phạt.', k: 'bad' }; }
    } });

  // ── Những người đầu tiên (lập làng) ──
  grow('s_founder', { nameVi: 'Những người đầu tiên', from: 'found_settle', p: 1, when: (S, X, k) => k !== 'no', good: ['root', 'walled', 'temple', 'market'],
    quest: () => 'Dựng làng từ đất trống',
    marks: { root: 'nguoi_lap_lang', walled: 'nguoi_giu_lang', temple: 'nguoi_moc_dao', market: 'nha_kha', lord: 'ba_chu', drifted: 'tiec_nuoi' },
    sum: { root: () => 'dựng một ngôi làng từ đất trống', walled: () => 'dựng làng và tường làng từ đất trống', temple: () => 'dựng làng và ngôi đền đầu tiên của làng', market: () => 'dựng làng và mở phiên chợ đầu tiên',
      lord: () => 'lập làng rồi giữ phần đất tốt nhất cho mình', drifted: () => 'lập làng rồi để người khác cai quản' },
    beat: { any: ['Bạn đi một vòng quanh làng lúc sáng sớm, đếm số mái nhà.', 'Thêm một nhà nữa xin tới ở làng bạn lập.'] },
    acts: acts({ open: { st: ADE, wait: [0, 4] } }),
    open(S, X, a) { const p = G.castAdd(S, X, { role: 'ban', how: 'người đầu tiên tới ở làng bạn lập', bond: 45, work: 'farmer' }); a.who = p.id;
      return { t: `Nhà ${nm(p)} là nhà đầu tiên tới ở làng bạn lập. Hai nhà cùng dựng cái giếng chung, khắc tên cả hai lên thành giếng.`, k: 'good' }; },
    knot: { title: 'Luật làng', body: () => 'Làng đã có mười nhà. Phải chia đất, đặt luật.',
      choices: () => [ch('common', 'Chia đất đều, họp cả làng mà quyết', ''), ch('lord', 'Giữ phần đất tốt cho nhà mình', 'Bạn lập làng mà.'), ch('away', 'Để mọi người tự lo', 'Bạn chỉ dựng nhà, không làm trưởng.')],
      apply(S, X, ch) { if (ch === 'common') { X.add('so', 5); return 'Bạn cắm cọc chia đất trước mặt cả làng.'; } if (ch === 'lord') { X.money(Math.round(med(S, X) * .5)); X.add('so', -4); return 'Bạn giữ khúc đất ven suối cho nhà mình.'; } return 'Bạn bảo: ai khai hoang được bao nhiêu thì giữ bấy nhiêu.'; },
      auto: S => (S.traits.social > .45 ? 'common' : sh(S, 'am') > .2 ? 'lord' : 'away') },
    trial: { base: (S, X, a) => .55 + (a.d.path === 'common' ? .1 : 0),
      run: (S, X, a, ok) => (ok ? { t: 'Mùa đông đầu tiên qua êm. Mười nhà thành mười lăm.', k: 'good' } : { t: 'Mùa đông đầu tiên, quái xuống phá chuồng. Hai nhà bỏ đi.', k: 'bad' }) },
    climax: { title: 'Làng lớn', body: () => 'Làng đã đủ đông. Phải dựng thứ gì đó để người ta nhớ làng này là làng.',
      choices: () => [ch('wall', 'Dựng tường làng', 'Che chở trước đã.'), ch('temple', 'Dựng đền', 'Có chỗ cho thần, có chỗ cho người họp.'), ch('market', 'Mở phiên chợ', 'Có chợ thì có người tới.')],
      apply(S, X, ch) { X.money(-Math.round(med(S, X) * .5)); if (ch === 'wall') return { t: 'Tường làng dựng xong trước mùa quái.', o: 'walled' }; if (ch === 'temple') { if (S.faith) S.devotion = Math.min(100, (S.devotion || 0) + 5); return { t: 'Đền làng dựng xong, mái lợp ngói đỏ.', o: 'temple' }; } return { t: 'Phiên chợ đầu tiên, người ba làng kéo tới.', o: 'market' }; },
      auto: S => (S.traits.bold > .55 ? 'wall' : S.traits.pious > .55 ? 'temple' : 'market'),
      bg: () => ({ t: 'Làng tự bầu trưởng làng. Người ta mời bạn ngồi mâm trên, rồi quên hỏi ý.', o: 'drifted' }) },
    end(S, X, a, p, o) { if (a.d.bg) return o; if (a.d.path === 'lord') return 'lord'; return a.d.ok ? o : 'root'; },
    after: {
      root: () => ({ t: 'Làng sống được, nghèo mà bền. Tên bạn khắc ở thành giếng chung, cạnh tên người hàng xóm đầu tiên.', k: 'big' }),
      walled: () => ({ t: 'Năm quái tràn, làng bạn là làng duy nhất trong vùng không mất ai.', k: 'big' }),
      temple: () => ({ t: 'Lễ đền nào người ta cũng mời bạn thắp nén nhang đầu tiên.', k: 'big' }),
      market: (S, X) => { X.money(Math.round(med(S, X))); return { t: 'Phiên chợ làng bạn thành chợ lớn nhất vùng.', k: 'big' }; },
      lord: () => ({ t: 'Làng lớn lên. Người ta nộp tô cho nhà bạn, và gọi bạn bằng ông chủ, không bằng tên.', k: 'bad' }),
      drifted: () => ({ t: 'Làng của bạn giờ là làng của người khác.', k: 'info' })
    } });

  // ── Ơn thầy thuốc (được chữa bệnh) ──
  grow('s_healer', { nameVi: 'Ơn thầy thuốc', from: 'healer', p: .5, when: (S, X, k) => k === 'pay' || k === 'pray', good: ['repaid', 'apprentice', 'fetched'],
    who: () => ({ role: 'an', how: 'thầy thuốc chữa cho bạn năm ấy', work: 'healer', bond: 30 }),
    quest: (a, p) => `Trả ơn ${nm(p)}`,
    marks: { repaid: 'duoc_tin', apprentice: 'nghe_thuoc', fetched: 'cao_thu', fled: 'tieng_xau', refused: 'cay_dang', p_died: 'tiec_nuoi' },
    sum: { repaid: (d, p) => `trả ơn ${nm(p)}, thầy thuốc từng chữa cho mình`, apprentice: (d, p) => `học nghề thuốc của ${nm(p)}, cứu người trong trận dịch`, fetched: (d, p) => `vượt núi lấy thuốc cho ${nm(p)} chặn dịch`,
      fled: () => 'bỏ làng chạy dịch', refused: (d, p) => `từ chối ${nm(p)} lúc người ấy nhờ việc`, p_died: (d, p) => `không ở đó khi ${nm(p)} chết vì dịch` },
    gone: (S, p) => `Tin ${refE(S, p)} mất. Bạn còn giữ toa thuốc năm ấy.`,
    beat: { any: ['Bạn ghé nhà {p}, phụ phơi thuốc một buổi.', 'Bạn nhớ được thêm tên một vị thuốc {p} chỉ.'] },
    open: (S, X, a, p) => ({ t: `${nm(p)}, thầy thuốc chữa cho bạn năm ấy, nhờ người hỏi thăm bạn đã khỏe hẳn chưa.`, k: 'info', bond: 5 }),
    knot: { title: 'Thầy thuốc nhờ việc', body: (S, X, a, p) => `${nm(p)} cần người vào khu săn hái một loại rễ thuốc cho đứa trẻ đang sốt.`,
      choices: () => [ch('go', 'Đi hái thuốc', 'Khu săn có quái.'), ch('learn', 'Đi, rồi xin theo học nghề', 'Học thuốc lâu lắm.'), ch('away', 'Từ chối', '')],
      apply(S, X, ch, a, p) { if (ch === 'away') { bond(p, -20); return `${nm(p)} gật đầu, không nói gì, rồi đi tìm người khác.`; } bond(p, 15); return ch === 'learn' ? 'Bạn đi hái thuốc, và hỏi được tên từng loại cây dọc đường.' : 'Bạn đeo gùi lên đường trước khi trời sáng.'; },
      auto: S => (S.traits.studious > .6 ? 'learn' : S.traits.bold > .35 || S.traits.social > .5 ? 'go' : 'away') },
    trial: { base: (S, X, a) => (a.d.bg ? .5 : odds(S, X, .6)),
      run(S, X, a, ok, p) {
        if (a.d.bg) return ok ? { t: `Đứa trẻ khỏi bệnh; người khác đã đi hái thuốc thay bạn.`, k: 'info' } : { t: 'Đứa trẻ không qua khỏi.', k: 'bad' };
        if (ok) { X.add('so', 4); if (a.d.path === 'learn') X.gain('Alchemy', 4); return { t: 'Bạn mang rễ thuốc về trước khi trời tối. Đứa trẻ hạ sốt vào sáng hôm sau.', k: 'good', bond: 10 }; }
        X.add('hl', -10); X.cond('wound'); return { t: 'Bạn mang được rễ thuốc về, kèm một vết cắn ở bắp chân. Đứa trẻ khỏi; bạn nằm một tháng.', k: 'bad', bond: 15 };
      } },
    climax: { title: 'Dịch', body: (S, X, a, p) => `Dịch sốt lan tới làng. ${nm(p)} chạy từ nhà này sang nhà khác, thiếu người, thiếu thuốc.`,
      choices: (S, X) => [ch('nurse', 'Ở lại phụ thầy thuốc', 'Có thể lây.'), ch('fetch', 'Vượt núi lấy thuốc', `Chừng ${pct(odds(S, X, .5))} về kịp.`), ch('flee', 'Đưa nhà đi lánh', '')],
      apply(S, X, ch, a, p) {
        if (ch === 'nurse') { if (X.chance(.75)) { X.add('so', 6); return { t: `Bạn sắc thuốc, lau người bệnh suốt hai tháng bên ${nm(p)}.`, o: 'nurse' }; } X.add('hl', -20); X.cond('fever'); return { t: 'Bạn lây bệnh, nằm liệt ba tuần, rồi dậy làm tiếp.', o: 'nurse' }; }
        if (ch === 'fetch') { if (X.chance(odds(S, X, .5))) { fame(S, 3); return { t: 'Bạn về sau chín ngày, gùi đầy thuốc. Dịch chững lại.', o: 'fetched' }; } X.add('hl', -10); return { t: 'Bạn về muộn. Dịch đã qua đỉnh; nhiều người không đợi được.', o: 'nurse' }; }
        X.add('so', -6); return { t: 'Bạn đưa cả nhà lên núi tránh dịch.', o: 'fled' };
      },
      auto: (S, X, a) => (a.d.path === 'learn' || S.traits.social > .5 ? 'nurse' : S.traits.bold > .55 ? 'fetch' : 'flee'),
      bg: (S, X, a, p) => (a.d.ok ? { t: `${nm(p)} chống dịch một mình, cứu được nửa làng.`, o: 'refused' } : (kill(S, p), { t: `${nm(p)} chết vì dịch, sau khi cứu được nửa làng.`, o: 'p_died' })) },
    end: (S, X, a, p, o) => (o === 'nurse' ? (a.d.path === 'learn' ? 'apprentice' : 'repaid') : o),
    after: {
      repaid: (S, X, a, p) => ({ t: `${nm(p)} bảo: "Món nợ năm ấy, giờ ta nợ lại ngươi."`, k: 'good', bond: 20 }),
      apprentice: (S, X, a, p) => ({ t: `Sau trận dịch, ${nm(p)} trao cho bạn hộp kim châm của thầy: "Giờ ngươi đi được một mình rồi."`, k: 'big', bond: 20 }),
      fetched: () => ({ t: 'Người làng kể chuyện chín ngày vượt núi của bạn cho trẻ con nghe, mỗi năm một dài thêm.', k: 'big' }),
      fled: () => ({ t: 'Lúc bạn về, nửa làng đã đội khăn tang. Không ai nói gì với bạn.', k: 'bad' }),
      refused: () => ({ t: 'Trận dịch qua. Người ta lập miếu thờ thầy thuốc. Bạn không vào thắp hương.', k: 'bad' }),
      p_died: () => ({ t: 'Bạn đứng cuối đám tang, giữ trong túi toa thuốc năm nào.', k: 'bad' })
    } });

  // ── Bạn cùng lớp (đi học) ──
  grow('s_classmate', { nameVi: 'Bạn cùng lớp', from: 'school', p: .6, when: (S, X, k) => k !== 'no', good: ['lifelong', 'top', 'favor'],
    who: (S, X) => ({ role: 'ban', how: 'bạn cùng lớp của bạn', bond: 30, drive: X.rnd() }),
    quest: (a, p) => `Học cùng ${nm(p)}`,
    marks: { lifelong: 'ban_cu', top: 'vuot_doi_thu', favor: 'che_cho', apart: 'tiec_nuoi', used: 'tieng_xau', forgot: 'buong_bo' },
    sum: { lifelong: (d, p) => `làm bạn với ${nm(p)} từ thuở đi học tới lúc tóc bạc`, top: (d, p) => `đứng trên ${nm(p)} ở kỳ thi lớn`, favor: (d, p) => `được ${nm(p)}, bạn học cũ, nâng đỡ`,
      apart: (d, p) => `để mất người bạn học ${nm(p)}`, used: (d, p) => `lợi dụng tình bạn học với ${nm(p)}`, forgot: (d, p) => `quên dần ${nm(p)}, người ngồi cạnh mình ở lớp` },
    beat: { any: ['Bạn và {p} chép bài của nhau, bị phạt cùng nhau.', '{p} giảng lại cho bạn bài toán khó, tới khuya.'] },
    acts: acts({ open: { st: ['child', 'teen'], wait: [0, 4] }, knot: { wait: [1, 15], when: () => true }, trial: { st: TA }, climax: { st: ADE, when: (S, X) => ADE.includes(X.stage(S)) } }),
    open: (S, X, a, p) => ({ t: `Ở trường, bạn ngồi cạnh ${nm(p)}. ${p.drive > .6 ? nm(p) + ' học giỏi nhất lớp, và biết điều đó.' : 'Hai đứa hay trốn giờ ra bờ sông.'}`, k: 'good' }),
    knot: { title: 'Kỳ thi', body: (S, X, a, p) => `Kỳ thi cuối khóa tới gần. ${nm(p)} rủ bạn ôn cùng.`,
      choices: (S, X, a, p) => [ch('study', `Ôn cùng ${nm(p)}`, ''), ch('compete', 'Ôn một mình, thi cho hơn', ''), ch('away', 'Thôi học', 'Ở nhà có việc.')],
      apply(S, X, ch, a, p) { if (ch === 'study') { bond(p, 15); X.add('sm', 2); return 'Hai đứa ôn bài dưới ngọn đèn dầu tới khi gà gáy.'; } if (ch === 'compete') { X.add('sm', 3); bond(p, -5); return 'Bạn ôn một mình, giấu sổ ghi chép dưới gối.'; } return 'Bạn nghỉ học, về giúp nhà.'; },
      auto: S => (S.traits.social > .5 ? 'study' : S.traits.studious > .5 ? 'compete' : 'away') },
    trial: { base: S => .4 + .3 * S.traits.studious,
      run: (S, X, a, ok, p) => (a.d.bg ? { t: ok ? `${nm(p)} đỗ đầu kỳ thi, lên kinh học tiếp.` : `${nm(p)} trượt, về làng làm ruộng.`, k: 'info' }
        : ok ? { t: `Kỳ thi năm ấy bạn đỗ${a.d.path === 'compete' ? ', tên đứng trên ' + nm(p) : ' cùng ' + nm(p)}.`, k: 'good' } : { t: 'Kỳ thi năm ấy bạn trượt.', k: 'bad' }) },
    climax: { title: 'Bạn học cũ', body: (S, X, a, p) => `Nhiều năm sau, ${nm(p)} ${p.drive > .5 ? 'giờ có chức ở phủ' : 'giờ là thầy đồ trong vùng'}, tìm tới nhà bạn.`,
      choices: (S, X, a, p) => [ch('help', `Hỏi ${nm(p)} cần gì`, ''), ch('use', `Nhờ ${nm(p)} chạy giúp một việc`, 'Bạn học cũ, nể nhau.'), ch('cold', 'Tiếp như khách', '')],
      apply(S, X, ch, a, p) { if (ch === 'help') { bond(p, 20); X.add('h', 4); return { t: `${nm(p)} chỉ muốn ngồi uống chén trà, nói chuyện ngày xưa.`, o: 'help' }; } if (ch === 'use') { bond(p, -5); return { t: `${nm(p)} nhận lời, giọng hơi khác.`, o: 'use' }; } bond(p, -10); return { t: `${nm(p)} ngồi một lúc, rồi về.`, o: 'apart' }; },
      auto: S => (S.traits.social > .45 ? 'help' : sh(S, 'am') > .15 ? 'use' : 'cold'),
      bg: () => ({ t: 'Có lần bạn nghe tên người bạn học cũ ở chợ, nhớ mãi không ra mặt.', o: 'forgot' }) },
    end(S, X, a, p, o) { if (o === 'help') return a.d.path === 'compete' && a.d.ok ? 'top' : 'lifelong'; if (o === 'use') return p.drive > .5 ? 'favor' : 'used'; return o; },
    after: {
      lifelong: (S, X, a, p) => ({ t: `Tóc bạc cả rồi, ${nm(p)} và bạn vẫn cãi nhau về một bài toán năm xưa.`, k: 'good', bond: 10 }),
      top: (S, X, a, p) => ({ t: `${nm(p)} nhắc lại kỳ thi năm ấy, cười: "Ta chưa bao giờ thua ai, trừ ngươi."`, k: 'good' }),
      favor: () => ({ t: 'Việc xong. Từ đó có chuyện gì ở phủ, bạn biết gõ cửa nhà ai.', k: 'good' }),
      apart: () => ({ t: 'Lần sau gặp nhau ở chợ, hai người chào nhau như người quen sơ.', k: 'bad' }),
      used: () => ({ t: 'Việc không thành, mà tình bạn cũ cũng sứt.', k: 'bad' }),
      forgot: () => ({ t: 'Có những người ngồi cạnh mình mấy năm, rồi đi qua đời mình như gió.', k: 'info' })
    } });

  // ── Kẻ trốn giấy phép (giấu chuyện luyện phép) ──
  grow('s_license', { nameVi: 'Kẻ trốn giấy phép', from: 'cv_license', p: .6, when: (S, X, k) => k === 'hide', good: ['clean', 'slip', 'shield'],
    quest: () => 'Luyện phép không giấy',
    marks: { clean: 'giu_loi', slip: 'biet_bi_mat', shield: 'duoc_tin', bribe: 'cua_phi_nghia', caught: 'tieng_xau', informer: 'ke_thu' },
    sum: { clean: () => 'đi đăng ký giấy phép luyện phép, dù muộn', slip: () => 'luyện phép không giấy cả đời mà không bị bắt', shield: () => 'che giấu người hàng xóm luyện phép không giấy',
      bribe: () => 'đút lót để luyện phép không giấy', caught: () => 'bị bắt quả tang luyện phép không giấy', informer: () => 'chỉ điểm người luyện phép không giấy để lấy thưởng' },
    beat: { any: ['Bạn kéo rèm, luyện phép dưới ánh nến.', 'Có tiếng gõ cửa. Bạn giật mình, hóa ra người bán dầu.'] },
    open: () => ({ t: 'Lính tuần tra hỏi han cả xóm về người luyện phép không giấy.', k: 'info' }),
    knot: { title: 'Giấy phép', body: (S, X) => `Phạt nộp muộn chừng ${G.coin(Math.round(med(S, X) * .4))}. Bị bắt thì nặng hơn nhiều.`,
      choices: (S, X) => [ch('register', 'Đi đăng ký, nộp phạt', `Mất ${G.coin(Math.round(med(S, X) * .4))}.`), ch('bribe', 'Đút lót đội trưởng tuần', 'Rẻ hơn, nếu hắn giữ lời.'), ch('hide', 'Giấu kỹ hơn', '')],
      apply(S, X, ch) { if (ch === 'register') { X.money(-Math.round(med(S, X) * .4)); return 'Bạn nộp phạt, tên bạn vào sổ của hội pháp sư.'; } if (ch === 'bribe') { X.money(-Math.round(med(S, X) * .2)); G.trajBump(S, { am: .2 }); return 'Bạn nhét túi bạc vào tay đội trưởng tuần.'; } return 'Bạn đào một căn hầm dưới bếp để luyện.'; },
      auto: (S, X) => (S.traits.pious > .5 || S.gold > med(S, X) ? 'register' : sh(S, 'am') > .15 ? 'bribe' : 'hide') },
    trial: { base: (S, X, a) => (a.d.path === 'register' ? .9 : a.d.path === 'bribe' ? .65 : .5),
      run(S, X, a, ok) {
        if (a.d.path === 'register') return { t: 'Lính tuần đi ngang nhà bạn, gật đầu chào.', k: 'info' };
        if (ok) return { t: 'Đợt lùng năm ấy đi qua nhà bạn mà không dừng lại.', k: 'info' };
        X.money(-Math.round(med(S, X) * .6)); cnt(S, 'crimes'); return { t: 'Lính tuần gõ cửa đúng lúc bạn đang luyện. Bạn nộp phạt, tên bạn vào sổ.', k: 'bad' };
      } },
    climax: { title: 'Đợt lùng bắt', body: () => 'Phủ mở đợt lùng bắt lớn. Bà hàng xóm cũng luyện lén, chạy sang nhà bạn, mặt cắt không còn giọt máu.',
      choices: () => [ch('shield', 'Giấu bà ấy', 'Bị phát hiện thì cả hai cùng tội.'), ch('report', 'Chỉ điểm lấy thưởng', ''), ch('low', 'Đóng cửa, không dính vào', '')],
      apply(S, X, ch, a) {
        if (ch === 'shield') { if (X.chance(.55 + (a.d.path === 'register' ? .2 : 0))) { X.add('so', 5); return { t: 'Lính lục nhà bạn, không tìm thấy gì.', o: 'shield' }; } cnt(S, 'crimes'); return { t: 'Lính tìm thấy cả hai.', o: 'caught' }; }
        if (ch === 'report') { X.money(Math.round(med(S, X) * .5)); X.add('so', -6); return { t: 'Bạn chỉ tay về phía nhà bà ấy. Lính trả thưởng ngay tại chỗ.', o: 'informer' }; }
        return { t: 'Bạn đóng cửa. Đêm ấy có tiếng khóc ở nhà bên.', o: 'low' };
      },
      auto: S => (S.traits.social > .5 || S.traits.pious > .6 ? 'shield' : sh(S, 'am') > .25 ? 'report' : 'low') },
    end(S, X, a, p, o) { if (o !== 'low') return o; if (a.d.path === 'register') return 'clean'; if (!a.d.ok) return 'caught'; return a.d.path === 'bribe' ? 'bribe' : 'slip'; },
    after: {
      clean: () => ({ t: 'Giấy phép treo trên vách. Bạn luyện phép giữa ban ngày, cửa mở.', k: 'good' }),
      slip: () => ({ t: 'Căn hầm dưới bếp vẫn còn đó. Không ai biết, trừ bạn.', k: 'info' }),
      shield: () => ({ t: 'Bà hàng xóm đi đăng ký vào tuần sau. Tết nào bà cũng mang sang một mâm xôi.', k: 'good' }),
      bribe: () => ({ t: 'Mỗi năm đội trưởng tuần ghé một lần, đúng ngày, không cần nói gì.', k: 'bad' }),
      caught: () => ({ t: 'Tên bạn nằm trong sổ của phủ. Có việc gì ở xóm, người ta nhìn bạn trước.', k: 'bad' }),
      informer: () => ({ t: 'Nhà bên dọn đi. Người xóm không hỏi vì sao; họ biết.', k: 'bad' })
    } });

  SA.wrap();
})(window.LifeSim);
