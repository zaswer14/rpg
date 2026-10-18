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
    gone: (S, p) => `Tin ${refE(S, p)} chết tới tai bạn vào một buổi chiều chẳng có gì khác thường. Bạn đứng lặng một lúc, tay vẫn cầm việc đang làm dở. Không còn ai để bạn phải hơn nữa. Lạ là chuyện ấy không làm bạn nhẹ người chút nào.`,
    beat: { any: ['Bạn tập thêm một canh giờ sau khi mọi người đã về, tới lúc sương xuống ướt vai. Ở đâu đó, {p} chắc cũng đang tập.', 'Có người nhắc tên {p} ở chợ, giọng đầy nể phục. Bạn bước nhanh hơn, tay nắm chặt quai giỏ.', 'Bạn khắc thêm một vạch lên cột nhà, cạnh những vạch cũ đã mờ: lần sau sẽ hơn {p}.'] },
    acts: acts({ open: { st: CTA }, climax: { st: ADE, when: (S, X) => ADE.includes(X.stage(S)) } }),
    open(S, X, a, p) {
      const what = X.stage(S) === 'child' ? X.pick(['cuộc thi chạy của lũ trẻ trong làng', 'buổi đọc chữ ở đền', 'trò đánh trận giả bên bờ sông'])
        : X.pick(['kỳ tuyển học trò của trường trong vùng', 'kỳ tuyển lính tuần của phủ', 'cuộc thi tay nghề ở chợ phiên']);
      if (X.rnd() < .3 + .4 * S.traits.bold) { a.d.lead = 1; X.add('h', 5); return { t: `Ở ${what}, bạn hơn ${ref(S, p)} một chút, chỉ chừng một bước chân. Người xem vỗ tay, riêng ${nm(p)} thì không. Người ấy đá tung đống cát dưới chân rồi bỏ về, không ngoái lại. Từ hôm ấy, mỗi lần bạn đi ngang nhà ${nm(p)}, cánh cửa lại đóng sầm.`, k: 'good', o: 'ahead', bond: -5 }; }
      a.d.lead = -1; X.add('h', -4); return { t: `Ở ${what}, ${ref(S, p)} lại hơn bạn, lần này cũng như mọi lần. Cả đám cười rộ lên, có đứa còn nhại dáng bạn lúc thua. Bạn cúi xuống buộc lại dây giày cho khỏi phải nhìn ai. Tối ấy bạn ngồi ngoài hiên rất lâu, nghĩ xem lần sau phải làm sao.`, k: 'bad', o: 'behind', bond: -5 };
    },
    knot: { title: 'Kẻ luôn hơn một bậc', body: (S, X, a, p) => `${ref(S, p)} ${a.d.lead > 0 ? 'vẫn chưa nuốt trôi lần thua bạn năm nào' : 'vẫn đứng trên bạn ở mọi bảng tên'}. Mấy năm nay người làng đã quen nói tên hai người liền nhau, có người này thì có người kia. Kỳ thi nào, cuộc đua nào, người ta cũng hỏi năm nay ai hơn ai. Câu hỏi ấy theo bạn vào cả giấc ngủ.`,
      choices: (S, X, a, p) => [ch('train', 'Tập tới khi hơn hẳn', 'Mất nhiều năm. Không ai giúp.'), ch('bond', `Đua mà không ghét ${nm(p)}`, 'Mời rượu sau mỗi lần thi. Người kia có thể coi là chế giễu.'),
        ch('trick', 'Chơi xấu một lần', 'Thắng chắc hơn. Lộ ra thì cả làng biết.'), ch('away', `Thôi đua với ${nm(p)}`, 'Đường ai nấy đi.')],
      apply(S, X, ch, a, p) {
        if (ch === 'train') { G.trajBump(S, { vo: .4 }); skill(S, X, 4); return 'Bạn dậy trước gà gáy, tập tới khi tay rớm máu, quấn vải vào rồi tập tiếp. Mùa mưa cũng như mùa nắng, mấy năm liền như thế. Cái cọc gỗ sau nhà mòn vẹt hẳn một bên. Không ai thấy, chỉ có sương sớm và tiếng thở của chính bạn.'; }
        if (ch === 'bond') { bond(p, 15); X.add('so', 2); return `Thi xong, bạn xách vò rượu sang mời ${nm(p)} một chén. ${nm(p)} nhìn bạn như nhìn kẻ lạ, tay mãi không chịu cầm. Rồi cũng uống. Hai người ngồi chẳng nói gì cho tới lúc vò cạn, và lần sau gặp nhau, ${nm(p)} là người gật đầu chào trước.`; }
        if (ch === 'trick') { G.trajBump(S, { am: .3 }); return `Bạn để ý ${nm(p)} đủ lâu để thấy chỗ yếu: một thói quen nhỏ mà chính người ấy cũng không biết mình có. Bạn chưa làm gì cả. Bạn chỉ cất nó vào một góc trong đầu, như cất con dao dưới đáy rương, đợi ngày dùng tới.`; }
        bond(p, 5); return `Bạn thôi đếm xem mình hơn hay kém ${nm(p)} bao nhiêu. Bảng tên dán ở cổng đền, bạn đi ngang mà không dừng lại đọc. Lạ là từ hôm ấy bạn ngủ ngon hơn. Chỉ có điều, nghe ai nhắc tới ${nm(p)}, tai bạn vẫn vểnh lên.`;
      },
      auto: (S, X, a, p) => (S.traits.bold > .6 ? 'train' : S.traits.social > .6 ? 'bond' : sh(S, 'am') > .2 ? 'trick' : S.traits.bold < .3 ? 'away' : 'train') },
    trial: { base: (S, X, a, p) => (a.d.bg ? .3 + .5 * (p ? p.drive : .5) : .4 + .1 * (a.d.lead || 0) + (a.d.path === 'train' ? .15 : a.d.path === 'trick' ? .2 : .05)),
      run(S, X, a, ok, p) {
        if (a.d.bg) return ok ? { t: `Năm ấy bạn không dự kỳ sát hạch. ${nm(p)} đứng đầu bảng, tên được đọc to ở ba làng, có cả trống rước về tận ngõ. Bạn nghe tiếng trống vọng lại từ xa, dừng tay một lúc. Rồi bạn cúi xuống làm tiếp việc của mình.`, k: 'info' } : { t: `Nghe nói năm ấy ${nm(p)} trượt kỳ sát hạch. Tối đó ${nm(p)} say rượu, đánh nhau ở chợ, phải có người dìu về. Người kể chuyện cho bạn tưởng bạn sẽ hả dạ. Bạn chỉ hỏi người ta có bị thương nặng không.`, k: 'info' };
        if (a.d.path === 'trick') { if (!ok) { a.d.caught = true; X.add('so', -6); return { t: `Mánh của bạn bị lộ giữa kỳ thi, ngay trước mặt hội đồng. Người ta nhìn bạn, rồi nhìn ${nm(p)}, rồi lại nhìn bạn. Không ai nói to, nhưng tiếng xì xào theo bạn ra tận cổng. Mấy tháng sau đó, bạn đi chợ toàn phải đi đường vòng.`, k: 'bad' }; } return { t: `Kỳ thi năm ấy ${nm(p)} trượt chân đúng lúc quan trọng nhất, ngã sóng soài trước mặt mọi người. Cả hội đồng lắc đầu tiếc cho ${nm(p)}. Chỉ bạn biết vì sao người ấy ngã. Bạn đứng nghe lời khen, hai tay giấu sau lưng cho khỏi run.`, k: 'good' }; }
        return ok ? { t: `Kỳ sát hạch năm ấy, tên bạn đứng trên tên ${nm(p)}. ${a.d.path === 'train' ? 'Những buổi dậy trước gà gáy, những lần quấn vải lên bàn tay rớm máu, giờ mới thấy đáng.' : 'Bao nhiêu năm, đây là lần đầu người ta đọc tên bạn trước.'} ${a.d.path === 'bond' ? `${nm(p)} là người đầu tiên tới chúc, tay xách theo vò rượu, y như lần bạn sang mời năm nào.` : `${nm(p)} xé tờ bảng ngay trước mặt mọi người rồi bỏ đi, vai cứng đơ.`}`, k: 'good', bond: a.d.path === 'bond' ? 10 : -10 }
          : { t: `Kỳ sát hạch năm ấy ${nm(p)} đứng đầu bảng, trên tên bạn ba bậc. Bạn đứng đọc đi đọc lại tờ bảng tới khi người ta về hết. Đêm đó bạn không ngủ, nằm nghe mõ canh điểm từng hồi. Sáng ra, bạn vẫn dậy tập như mọi ngày.`, k: 'bad' };
      } },
    climax: { title: 'Trận phân định',
      body: (S, X, a, p) => `${ref(S, p)} chặn đường bạn ${X.pick([`giữa chợ ${homeName(S)}`, 'trước sân đấu của hội võ', 'ở cổng làng'])}. Bao nhiêu năm rồi, cả hai đều đã khác, mà cái nhìn ấy vẫn y như hồi bé. "Từ bé tới giờ, ta với ngươi chưa lần nào phân định cho ra lẽ." Quanh đó, người ta đã bắt đầu dừng chân đứng xem.`,
      choices: (S, X, a, p) => [ch('fight', 'Nhận lời đấu', `Đấu tay đôi, không tới chết. Khả năng thắng chừng ${pct(vs(S, X, p, .4 * p.drive - (a.d.ok ? .15 : 0)))}.`),
        ch('peace', 'Mời rượu, bỏ qua chuyện cũ', 'Phải ăn nói khéo; người kia có thể không nhận.'), ch('no', 'Bỏ đi', 'Không mất gì ngoài thể diện.')],
      apply(S, X, ch, a, p) {
        if (ch === 'fight') {
          if (X.rnd() < vs(S, X, p, .4 * p.drive - (a.d.ok ? .15 : 0))) { fame(S, 3); X.add('h', 10); bond(p, 10); cnt(S, 'rvWin'); return { t: `Hai người vờn nhau hai hiệp, không ai chịu lùi nửa bước. Tới hiệp thứ ba bạn mới quật được ${nm(p)} ngã. ${nm(p)} nằm đó một lúc, rồi đứng dậy, phủi đất, gật đầu với bạn một cái rồi đi. Cái gật đầu ấy bạn nhớ lâu hơn cả tiếng reo của đám đông.`, o: 'win' }; }
          X.add('hl', -10); X.add('h', -8); if (X.chance(.25)) X.cond('wound'); return { t: `${nm(p)} thắng. Bạn nằm ngửa trên đất, miệng đầy vị máu, nghe người ta hò reo cho kẻ khác. Trời hôm ấy xanh lắm. Nằm thêm một lúc bạn mới gượng dậy được, không ai đỡ.`, o: 'lose' };
        }
        if (ch === 'peace') {
          if (X.rnd() < .35 + .5 * S.traits.social + (p.bond + 100) / 400 + (a.d.path === 'bond' ? .2 : 0)) { p.bond = Math.max(p.bond, 20); p.role = 'ban'; X.add('h', 6); return { t: `${nm(p)} nhìn chén rượu bạn đưa lâu lắm, lâu tới mức người xem bắt đầu xì xào. Rồi ${nm(p)} đỡ lấy, uống cạn một hơi. "Rượu dở," ${nm(p)} nói, "nhưng thôi." Đám đông tản dần, hơi tiếc vì không được xem đánh nhau.`, o: 'peace' }; }
          X.add('so', -3); return { t: `${nm(p)} hất chén rượu xuống đất, rượu bắn lên cả gấu áo bạn. "Ngươi tưởng một chén rượu là xong à?" Người xem cười ồ. Bạn đứng nhìn vệt rượu thấm dần vào đất, rồi quay về.`, o: 'no' };
        }
        X.add('so', -4); X.add('h', -3); return { t: `Bạn lách qua ${nm(p)} mà đi, không nói một lời. Sau lưng có tiếng cười, rồi tiếng ai đó huýt sáo. Bạn không quay lại. Đường về nhà hôm ấy dài hơn mọi ngày.`, o: 'no' };
      },
      auto: (S, X, a, p) => (X.power(S) >= npcPow(p, .4 * p.drive) || S.traits.bold > .6 ? 'fight' : S.traits.social > .55 || a.d.path === 'bond' ? 'peace' : 'no'),
      bg: (S, X, a, p) => (a.d.ok ? { t: `Từ kỳ sát hạch năm nào, ${nm(p)} cứ thế đi lên. ${ref(S, p)} giờ đã là ${G.tierName(Math.max(1, p.tier))}, đi đâu cũng có người theo sau xách đồ. Mỗi lần ${nm(p)} về làng, trẻ con chạy ra tận đầu ngõ. Không ai còn nhớ hai người từng đua nhau, có lẽ trừ bạn.`, k: 'info', o: 'rise' }
        : { t: `Từ năm trượt kỳ sát hạch, ${nm(p)} không đứng dậy được nữa. ${ref(S, p)} sa cơ: mất việc, nợ nần, chiều nào cũng ngồi một góc quán uống rượu một mình. Người làng từng nói tên hai người liền nhau, giờ chỉ nhắc tới ${nm(p)} khi kể chuyện đáng tiếc.`, k: 'info', o: 'fall' }) },
    end(S, X, a, p, o) {
      if (a.d.bg) return o === 'rise' ? 'shadow' : 'outlast';
      if (o === 'win') return a.d.path === 'trick' ? 'hollow' : a.d.ok ? 'win' : 'comeback';
      if (o === 'peace') return a.d.path === 'bond' && a.d.ok ? 'sworn' : 'peace';
      return o;
    },
    after: {
      win: (S, X, a, p) => { p.loc = X.pick(G.REGIONS).id; return { t: `Sau trận ấy ${nm(p)} rời ${homeName(S)}, đi từ lúc trời chưa sáng. Nhiều năm sau, một người buôn ghé qua kể rằng ở ${regName(p.loc)} có người tên ${nm(p)} hay kể chuyện thua bạn như kể một chuyện vui. Bạn cười, rồi ngồi im khá lâu. Hóa ra người ấy cũng nhớ.`, bond: 15 }; },
      comeback: (S, X, a, p) => { X.addXp(60); return { t: `Cả làng nhớ trận ấy rất lâu: kẻ thua suốt thời trẻ lại thắng ở trận cuối. Ông già đầu ngõ kể đi kể lại, mỗi lần thêm thắt một chút. Bọn trẻ con tập theo thế bạn dùng hôm đó. Đứa nào bị quật ngã cũng đứng dậy cười, bảo người ta thua cả chục năm còn thắng được kia mà.`, bond: 10 }; },
      hollow: (S, X, a, p) => { X.add('h', -4); return { t: `Bạn thắng, nhưng ai cũng nhớ kỳ thi năm nào, và nhắc trận này là người ta nhắc luôn chuyện ấy. ${nm(p)} không ghét bạn nữa. ${nm(p)} chỉ thôi nhìn bạn, gặp ở chợ thì nhìn sang chỗ khác. Trận thắng ấy bạn cất đi, chưa bao giờ mang ra kể.`, k: 'bad' }; },
      lose: (S, X) => { G.trajBump(S, { vo: .3 }); X.addXp(60); return { t: 'Người ta kể khắp nơi chuyện bạn thua, càng kể càng thêm thắt. Bạn không cãi lại ai. Mấy năm liền bạn dậy sớm hơn cả làng, tập tới khi mặt trời lên cao, như thể trận ấy vẫn chưa xong.', k: 'bad' }; },
      sworn: (S, X, a, p) => { X.add('h', 8); X.add('so', 5); p.role = 'ban'; return { t: `Hai người cắt máu ăn thề dưới gốc đa đầu làng, trước mặt những người từng xem hai đứa đánh nhau từ thuở bé. ${nm(p)} nói to cho cả làng nghe: "Từ giờ ai đụng tới một đứa là đụng tới cả hai." Mấy ông già ngồi xem cười khà, bảo rốt cuộc chén rượu năm ấy cũng không phí.`, bond: 30 }; },
      peace: (S, X, a, p) => { X.add('h', 8); X.add('so', 5); return p.wed ? { t: `${nm(p)} dắt đứa con trai tới nhờ bạn chỉ cho nó vài đường. "Nó giống ta hồi bé," ${nm(p)} nói, "cần có người trị." Thằng bé hếch cằm lên nhìn bạn, y hệt ${nm(p)} ngày nào. Bạn bật cười, đi lấy cây gậy tập.`, bond: 20 }
        : { t: `Mùa gặt nào ${nm(p)} cũng ghé nhà bạn, khi thì xách bầu rượu, khi thì con gà. Hai người ngồi cãi nhau về chuyện hồi bé như hai ông già: lần ấy ai hơn, ai ăn gian. Cãi tới khuya chẳng ai chịu ai, rồi hẹn mùa sau cãi tiếp.`, bond: 20 }; },
      no: (S, X, a, p) => { X.add('so', -2); return `Hôm ấy rốt cuộc chẳng có trận nào. Người ta vẫn nhắc chuyện đó mỗi khi tên bạn và tên ${nm(p)} được nói liền nhau, giọng nửa đùa nửa tiếc. Bạn để họ nhắc. Có những đêm nằm một mình, bạn tự hỏi nếu hôm ấy khác đi thì giờ ra sao.`; },
      shadow: (S, X, a, p) => { X.add('h', -3); return { t: `Lần cuối bạn thấy ${nm(p)} là ở lễ hội, ngồi trên hàng ghế dành cho người có tiếng, có người đứng sau quạt. Bạn đứng dưới, lẫn trong đám đông. Không ai biết hai người từng là đối thủ, từng được người làng gọi tên liền nhau. Bạn đứng xem hết buổi rồi mới về.`, k: 'bad' }; },
      outlast: (S, X, a, p) => { X.money(-Math.round(med(S, X) * .2)); X.add('h', 5); return { t: `Bạn gửi cho ${nm(p)} một bao gạo, không ghi tên người gửi. Năm sau ${nm(p)} tìm tới tận nhà, đứng ở cửa, hai tay buông thõng, không nói được câu nào. Bạn kéo ghế mời ngồi, như mời một người bạn cũ. Chuyện ngày xưa, không ai nhắc.`, bond: 25 }; }
    } });

  // ── Ơn cứu mạng (bạn mang ơn người khác; a.d.need: money / son / escort) ──
  full('grace', { nameVi: 'Ơn cứu mạng', good: ['paid', 'kin', 'late'],
    quest: (a, p) => `Trả ơn ${nm(p)}`,
    marks: { paid: 'giu_loi', kin: 'tinh_than', late: 'duoc_tin', tried: 'tiec_nuoi', unpaid: 'tieng_xau', others: 'cay_dang' },
    sum: { paid: (d, p) => `trả được ơn cứu mạng của ${nm(p)}`, kin: (d, p) => `thành người một nhà với ${nm(p)}, người từng cứu mạng mình`, late: (d, p) => `trả ơn ${nm(p)} muộn, nhưng trả đủ`,
      tried: (d, p) => `cố trả ơn ${nm(p)} mà không giữ được mảnh đất của nhà người ấy`, unpaid: (d, p) => `từ chối ${nm(p)}, người từng cứu mạng mình`, others: (d, p) => `để người khác trả thay món ơn của ${nm(p)}` },
    gone: (S, p) => `Tin ${refE(S, p)} mất tới vào một sáng mưa. Bạn nhớ dòng nước năm ấy, nhớ bàn tay túm lấy cổ áo mình mà kéo lên. Món nợ cứu mạng, bạn chưa kịp trả. Giờ thì không còn ai để trả nữa.`,
    beat: { any: ['Bạn ghé nhà {p}, leo lên sửa giúp cái mái dột, không đợi ai nhờ. {p} đứng dưới sân càu nhàu, mà mắt thì cười.', 'Tết nào bạn cũng gửi sang nhà {p} một gói quà nhỏ, khi thì gói chè, khi thì tấm vải.', 'Bạn kể cho bọn trẻ nghe chuyện {p} kéo bạn khỏi dòng nước năm ấy. Kể tới đâu, tay bạn lại tự nắm lại tới đó.'] },
    acts: acts({ open: { st: TA, wait: [2, 15] }, knot: { st: ADE, when: (S, X) => ADE.includes(X.stage(S)) } }),
    open: (S, X, a, p) => ({ t: `Bạn lớn rồi mới hiểu hết chuyện năm ấy: ${nm(p)} đã lao xuống dòng nước xiết, mà người ấy có bơi giỏi gì đâu. Chậm một chút thôi là cả hai cùng chìm. Từ đó mùa nào bạn cũng ghé thăm, khi xách mớ cá, khi vác bó củi. Lần nào ${nm(p)} cũng xua tay bảo không cần, rồi vẫn giữ bạn lại ăn cơm.`, bond: 10 }),
    knot: { title: 'Món nợ cũ',
      body(S, X, a, p) { const amt = Math.round(med(S, X) * .6), z = X.reg(S).zones[0]; a.d.amt = amt;
        return { money: `${ref(S, p)} tìm tới, đứng ngoài cổng mãi mới dám gọi. Năm nay mất trắng, ${nm(p)} cần ${G.coin(amt)} để giữ mảnh đất cuối cùng của nhà. Cả đời người ấy chưa từng nhờ ai việc gì. Bạn nhìn đôi tay nứt nẻ đang xoắn vạt áo, và nhớ dòng nước năm nào.`, son: `${ref(S, p)} tìm tới, mắt đỏ hoe: con trai ${nm(p)} bị bắt đi phu, cần một người có tiếng nói đứng ra bảo lãnh. Người ấy nói nhỏ, như sợ làm phiền. "Ta không biết nhờ ai nữa." Bạn nhớ cái hôm chính người này kéo bạn lên khỏi dòng nước.`,
          escort: `${ref(S, p)} tìm tới, nhờ bạn đi cùng qua ${z.nameVi}, nơi dạo này quái hay ra chặn đường. Nhà có việc gấp bên kia, không đi không được. ${nm(p)} đã già, tay chống gậy còn run. Năm xưa người ấy không ngần ngừ một khắc khi nhảy xuống nước vì bạn.` }[a.d.need || 'money']; },
      choices: (S, X, a) => [ch('help', 'Giúp ngay', a.d.need === 'money' ? `Mất ${G.coin(a.d.amt)}.` : a.d.need === 'son' ? 'Phải lên phủ, nói chuyện với người có quyền.' : 'Một chuyến đi có đánh nhau.'),
        ch('later', 'Hứa sẽ giúp khi đủ sức', 'Bây giờ bạn chưa có gì trong tay.'), ch('away', 'Từ chối', 'Giữ được của, mất mặt với người trong vùng.')],
      apply(S, X, ch, a, p) {
        if (ch === 'away') { X.add('so', -6); X.add('h', -4); bond(p, -40); cnt(S, 'grNo'); return `${nm(p)} gật đầu, không nói gì, rồi đi. Bạn đứng ở cửa nhìn theo cái lưng còng giữa đường làng. Mấy hôm sau cả xóm đã biết chuyện, và người ta nhìn bạn khác hẳn.`; }
        if (ch === 'later') { bond(p, 5); return `${nm(p)} nghe bạn hứa, vỗ vai bạn một cái: "Ta không đòi. Ta chỉ hỏi thôi." Rồi người ấy về, bước chậm. Lời hứa ấy bạn mang theo, nặng hơn bạn tưởng.`; }
        X.add('h', 6); X.add('so', 4); bond(p, 30); cnt(S, 'grHelp');
        if (a.d.need === 'money' || !a.d.need) { X.money(-a.d.amt); return `Bạn đưa tiền, không lấy giấy nợ. ${nm(p)} cầm gói bạc mà tay run, mấy lần định nói rồi lại thôi. "Coi như ta trả được một phần," bạn bảo. Ra tới cổng, người ấy còn quay lại cúi đầu.`; }
        if (a.d.need === 'son') return G.standing(S, X).soc >= 1 || S.fame >= 10 ? `Phủ nể mặt bạn, tờ bảo lãnh chỉ phải viết một lần. Con trai ${nm(p)} về tới nhà trước mùa đông, gầy rộc nhưng lành lặn. Hôm ấy nhà ${nm(p)} mổ gà, nhất định kéo bạn sang ăn.` : `Bạn lên phủ ba lần mới được gặp quan, lần nào cũng đứng chờ ngoài sân từ sáng tới chiều. Người con được tha, muộn mất một năm. Ngày nó về, ${nm(p)} ôm nó khóc, rồi quay sang nắm tay bạn không buông.`;
        const z = X.reg(S).zones[0], enc = X.rollEncounter(z, { grade: 'normal' }), rec = enc ? X.fight(enc, false) : { win: true };
        if (S.dead) return null;
        return rec.win ? `Bạn đi trước mở đường, tay không rời chuôi vũ khí. Có lúc phải đánh, có lúc phải nấp sau tảng đá chờ đám quái đi qua. Cả đoàn ra khỏi ${z.nameVi} không mất một ai. Tối ấy ${nm(p)} rót cho bạn một chén rượu đầy tới miệng.` : `Giữa đường quái ập ra, bạn lao lên chắn cho cả đoàn. Bạn bị thương, máu thấm qua lớp áo, nhưng cả đoàn qua được ${z.nameVi}. ${nm(p)} tự tay băng vết thương cho bạn, vừa băng vừa lẩm bẩm mắng.`;
      },
      auto: S => (S.traits.social > .3 || S.traits.pious > .5 ? 'help' : S.traits.social > .15 ? 'later' : 'away') },
    trial: { base: (S, X, a) => (a.d.bg ? .45 : a.d.path === 'help' ? .65 : .4 + Math.min(.3, S.gold / (med(S, X) * 10))),
      run(S, X, a, ok, p) {
        if (a.d.bg) return ok ? { t: `Nghe nói nhà ${nm(p)} cũng qua được mùa đói, nhờ hàng xóm mỗi nhà góp một ít. Người kể không nhắc gì tới bạn. Bạn cũng không hỏi thêm.`, k: 'info' } : { t: `Nhà ${nm(p)} bán dần con trâu, rồi bán ruộng. Có hôm đi chợ, bạn thấy ${nm(p)} ngồi bán mấy rổ rau ở góc chợ, lưng còng hơn trước. Bạn rẽ sang lối khác.`, k: 'info' };
        if (a.d.path === 'later') { if (ok) { a.d.saved = Math.round(med(S, X) * .5); return { t: `Bạn để riêng một hũ tiền dưới gầm giường, ghi trên nắp: "Của ${nm(p)}". Đồng nào dư ra cũng bỏ vào đó, kể cả những tháng phải ăn cháo. Hũ đầy dần, chậm mà chắc.`, k: 'good' }; } return { t: `Năm ấy bạn cũng chẳng dư được đồng nào, có tháng còn phải đi vay. Lời hứa vẫn nằm đó. Mỗi lần đi ngang nhà ${nm(p)}, bạn lại bước nhanh hơn một chút.`, k: 'bad' }; }
        return ok ? { t: `Nhà ${nm(p)} đứng dậy được, mùa sau ruộng lại lên xanh. Con cháu ${nm(p)} gọi bạn là chú, là bác, chạy ra tận ngõ mỗi lần bạn ghé. Món ơn ngày nào giờ đã thành một mối thân.`, k: 'good', bond: 10 } : { t: `Nhà ${nm(p)} vẫn khó. Ơn bạn trả được một phần, mùa màng lại lấy đi phần khác: hạn đầu năm, sâu cuối năm. ${nm(p)} không than, chỉ gầy đi trông thấy.`, k: 'bad' };
      } },
    climax: { title: 'Mảnh đất của ân nhân',
      body: (S, X, a, p) => `Tay cường hào trong vùng muốn mảnh đất của nhà ${nm(p)}, cho người tới đòi một "món nợ cũ" chẳng ai biết có thật không. Bọn chúng đứng chật sân, giẫm nát cả luống rau. ${nm(p)} đã già, đứng không vững, cứ nhìn về phía bạn. ${a.d.path === 'later' ? 'Lời hứa năm nào bạn vẫn chưa trả xong.' : 'Năm xưa người ấy đã nhảy xuống nước vì bạn.'}`,
      choices: (S, X, a, p) => [ch('stand', 'Đứng ra đối mặt tay cường hào', `Chừng ${pct(odds(S, X, .45 + (G.standing(S, X).soc >= 1 ? .15 : 0)))} hắn lùi.`),
        ch('pay', 'Bỏ tiền chuộc đất', `Chừng ${G.coin(Math.round(med(S, X)))}.`), ch('law', 'Kiện lên phủ', 'Lâu, tốn, nhưng có giấy tờ.')],
      apply(S, X, ch, a, p) {
        const soc = G.standing(S, X).soc;
        if (ch === 'stand') { if (X.chance(odds(S, X, .45 + (soc >= 1 ? .15 : 0)))) { fame(S, 3); X.add('h', 8); return { t: `Bạn đứng chắn ở cổng nhà, tay không, chân không lùi. Người của tay cường hào đứng một lúc, nhìn nhau, rồi lục tục quay về. Sau lưng bạn, ${nm(p)} thở hắt ra một hơi dài như vừa đặt gánh xuống.`, o: 'kept' }; }
          X.add('hl', -12); X.cond('wound'); return { t: `Bạn bị đánh gục giữa sân, mặt úp xuống luống rau dập nát. Lúc tỉnh lại, tờ văn tự đã nằm trong tay người khác. Mảnh đất vẫn bị lấy. ${nm(p)} ngồi bên cạnh, lấy vạt áo lau máu cho bạn.`, o: 'lost' }; }
        if (ch === 'pay') { const c = Math.round(med(S, X)) - (a.d.saved || 0); if (S.gold >= c) { X.money(-Math.max(0, c)); return { t: `Bạn đếm đủ tiền lên bàn tay cường hào, từng đồng một. ${a.d.saved ? 'Hũ tiền dưới gầm giường cuối cùng đã có chỗ dùng. ' : ''}Lấy lại tờ văn tự, bạn đưa tận tay ${nm(p)}. Người ấy cầm tờ giấy lật đi lật lại, như không tin là thật.`, o: 'kept' }; }
          X.money(-Math.max(0, Math.min(S.gold, c))); return { t: 'Bạn gom hết những gì có, vét cả mấy đồng giắt dưới đáy rương, vẫn thiếu. Tay cường hào cười, nhận tiền, rồi vẫn sai người tới cắm cọc. Bạn đứng nhìn, tay không còn gì.', o: 'lost' }; }
        X.money(-Math.round(med(S, X) * .2)); if (X.chance(.35 + .15 * soc)) return { t: `Quan phủ cho đem văn tự ra xem lại, soi từng con dấu. "Món nợ cũ" hóa ra là giấy giả. Tay cường hào bị mắng giữa công đường, mặt đỏ như gấc. Suốt đường về, ${nm(p)} đi bên cạnh bạn, không nói gì, chỉ cười.`, o: 'kept' };
        return { t: 'Vụ kiện kéo dài ba năm, tới khi chẳng ai còn nhớ ai kiện ai. Giấy tờ dày lên thành chồng, tiền lót tay mỏng dần. Đất đã đổi chủ từ lâu, trên đó giờ là chuồng ngựa nhà cường hào.', o: 'lost' };
      },
      auto: (S, X) => (S.traits.bold > .55 ? 'stand' : S.gold > med(S, X) ? 'pay' : 'law'),
      bg: (S, X, a, p) => (a.d.ok ? { t: `Hàng xóm nhà ${nm(p)} góp tiền chuộc lại mảnh đất, mỗi nhà một ít, có nhà góp cả con gà. Tên người góp dán ở cổng đình. Không ai gọi bạn. Cũng phải, từ hôm ấy bạn đâu có ghé.`, o: 'others' } : { t: `Nhà ${nm(p)} mất đất về tay cường hào, dọn đi nơi khác. Hôm họ đi, chiếc xe chở đồ lọc cọc qua trước cửa nhà bạn. Bạn đóng cửa trước khi nó khuất.`, o: 'unpaid' }) },
    end(S, X, a, p, o) {
      if (a.d.bg) return o;
      if (o === 'lost') return 'tried';
      return a.d.path === 'later' ? 'late' : a.d.ok ? 'kin' : 'paid';
    },
    after: {
      paid: (S, X, a, p) => { X.add('h', 6); return `Con cháu ${nm(p)} gọi bạn là ân nhân của nhà họ, dù người cứu mạng trước là ${nm(p)}. ${nm(p)} nghe vậy chỉ cười, không cãi. Mâm cơm nào có bạn, người ấy cũng gắp cho bạn miếng ngon nhất. Hai bên coi như sòng phẳng, mà chẳng ai muốn thôi qua lại.`; },
      kin: (S, X, a, p) => { X.add('h', 8); X.add('so', 4); return { t: `Ngày ${nm(p)} mừng thọ, bạn ngồi mâm trên cùng với con cháu trong nhà. Có đứa nhỏ hỏi bạn là họ hàng bên nào, cả nhà cười ồ. Không ai còn nhớ ai mang ơn ai. Chỉ có ${nm(p)}, lúc tiễn bạn ra ngõ, nắm tay bạn chặt hơn thường lệ.`, bond: 20 }; },
      late: (S, X, a, p) => { X.add('h', 6); return `Muộn mất mấy năm, nhưng lời hứa năm ấy bạn giữ trọn. ${a.d.saved ? `${nm(p)} đem cái hũ ghi chữ "Của ${nm(p)}" ra khoe với cả xóm, khoe xong lại cất lên đầu giường. Hũ thì đã rỗng, người ấy giữ nó vì mấy chữ trên nắp.` : `${nm(p)} kể với cả xóm chuyện người hứa năm ấy đã giữ lời, kể tới mức ai cũng thuộc. Lần nào kể xong cũng chốt một câu: "Ta biết mà."`}`; },
      tried: (S, X, a, p) => { X.add('h', -4); return { t: `${nm(p)} dọn về ở với con. Hôm bạn tới thăm, ${nm(p)} cầm tay bạn: "Ngươi đã đứng ra. Thế là đủ." Bạn ngồi lại tới tối, nghe người ấy kể chuyện dòng nước năm xưa như kể chuyện của ai khác. Mảnh đất thì không ai nhắc.`, k: 'info', bond: 15 }; },
      unpaid: (S, X, a, p) => { X.add('so', -4); return { t: `Bạn nghe tin nhà ${nm(p)} phải bỏ làng đi nơi khác, chẳng ai biết đi đâu. Người trong vùng chào bạn nhạt đi, có người thôi chào hẳn. Thỉnh thoảng đi ngang khúc sông năm ấy, bạn lại thấy lạnh gáy, như nước vẫn còn ngập tới cổ.`, k: 'bad' }; },
      others: (S, X, a, p) => { X.add('h', -3); return { t: `Đám giỗ năm ấy nhà ${nm(p)} mời cả xóm, khói hương bay ra tận ngõ. Bạn đi ngang, nghe tiếng cười nói, đứng lại một lúc. Rồi không vào. Món ơn của bạn, người khác đã trả thay.`, k: 'bad' }; }
    } });

  // ── Người mang ơn bạn (bạn cứu người; a.d.type: merchant / noble / outlaw) ──
  // Đền đáp theo đúng cái bạn đang cần (giữ từ bản cũ fv_return).
  const repay = (S, X, a, p) => {
    const F = S.flags, wanted = F.wanted && S.nation != null && F.wanted[S.nation];
    if (wanted || F.crimes) { if (wanted) delete F.wanted[S.nation]; else F.crimes = Math.max(0, F.crimes - 1); return `${ref(S, p)} giờ có chỗ đứng trong phủ. Một tờ giấy của ${nm(p)} gửi xuống, và hồ sơ của bạn ở nha môn bỗng chẳng ai tìm thấy nữa. Viên lại già nhìn bạn, nhún vai, quay đi làm việc khác. Món ơn năm nào đã quay về theo lối riêng của nó.`; }
    if (a.d.type === 'outlaw') { X.add('h', 6); return `Toán cướp chặn bạn ở đèo, lưỡi dao kề sát cổ. Tên cầm đầu soi đuốc vào mặt bạn một lúc rồi phẩy tay: "${nm(p)} dặn rồi. Đi đi." Từ đó qua đèo ấy, bạn chẳng phải giấu tiền trong giày nữa.`; }
    if (a.d.type === 'noble' && single(S) && !S.undead && !F.suitor) {
      F.suitor = { name: X.name(S.race, X.chance(.5) ? 'm' : 'f'), race: S.race, work: 'người nhà ' + nm(p), age: X.years(S) + X.int(-4, 3) };
      return `${ref(S, p)} mời bạn dự tiệc, xếp bạn ngồi cạnh ${F.suitor.name}, người trong họ. Cả bữa, ${nm(p)} cứ cười một mình, thỉnh thoảng lại nghiêng bình rót rượu cho hai người. Tiệc tan, ${F.suitor.name} tiễn bạn ra tận cổng, đứng đó tới khi bạn khuất.`;
    }
    if (S.gold < med(S, X) * 2) { const g = Math.round(med(S, X) * .8); X.money(g); return `${ref(S, p)} giới thiệu bạn với một chủ hàng lớn, chỉ bằng một câu: "Người này cứu mạng ta." Từ đó cửa nhà buôn ấy mở cho bạn. Năm ấy bạn kiếm thêm ${G.coin(g)}.`; }
    S.gear = Math.min(10, S.gear + 1); return `${ref(S, p)} gửi tới một thanh kiếm rèn ở ${capName(S)}, lưỡi sáng soi được mặt, kèm mảnh giấy: "Một mạng đổi một thanh kiếm, vẫn còn rẻ." Bạn treo nó lên vách, tối nào cũng ngắm. Trang bị ${S.gear}/10.`;
  };
  const favorTrouble = { merchant: 'vỡ nợ, chủ nợ kéo tới tận nhà', noble: 'bị vu mưu phản, lính phủ đang lùng', outlaw: 'bị truy nã, đầu được treo giá' };
  full('favor', { nameVi: 'Người mang ơn', good: ['repaid', 'bound', 'square'],
    quest: (a, p) => `Giữ mối ơn với ${nm(p)}`,
    marks: { repaid: 'duoc_tin', bound: 'huynh_de', square: 'che_cho', burned: 'tieng_xau', sold: 'ke_thu', forgot: 'tiec_nuoi' },
    sum: { repaid: (d, p) => `được ${nm(p)} trả ơn`, bound: (d, p) => `cứu ${nm(p)} hai lần, thành anh em`, square: (d, p) => `được ${nm(p)} che chở, rồi che chở lại`,
      burned: (d, p) => `bị liên lụy vì che giấu ${nm(p)}`, drift: (d, p) => `để ${nm(p)} tự lo lúc gặp nạn`, sold: (d, p) => `bán đứng ${nm(p)}, người mình từng cứu`, forgot: (d, p) => `để mối ơn với ${nm(p)} nhạt dần` },
    beat: { any: ['Thư của {p} tới, chữ viết vội, mực còn lem: "Có dịp ghé, có dịp ghé."', 'Người đưa hàng mang tới một gói quà, không ghi tên người gửi. Bạn mở ra, ngửi mùi chè, và biết ngay là của {p}.'] },
    acts: acts({ open: { st: ADE, wait: [2, 12] } }),
    open: (S, X, a, p) => ({ t: `${ref(S, p)} gửi thư, kể giờ đã ổn, hỏi bạn có cần gì không. Chữ viết nắn nót, như người ta viết cho ai quan trọng. Cuối thư có một dòng gạch chân: "Ơn ấy ta còn nhớ." Bạn đọc xong, gấp lại, cất vào ngăn kéo.`, bond: 5 }),
    knot: { title: 'Lời mời của người mang ơn', body: (S, X, a, p) => `${nm(p)} mời bạn tới ${a.d.type === 'outlaw' ? 'một quán rượu không biển ở chân đèo' : capName(S)}. Thư mời viết trên giấy tốt, gửi kèm cả tiền lộ phí. Ai trong nhà cũng bảo: người ta đang muốn trả ơn. Có điều, nhận ơn rồi thì cũng là buộc thêm một mối dây.`,
      choices: (S, X, a, p) => [ch('visit', 'Ghé thăm, kết thân', 'Không xin gì.'), ch('ask', `Nhờ ${nm(p)} một việc`, 'Ơn trả xong thì thôi.'), ch('away', 'Không ghé', 'Cứu người không phải để đòi.')],
      apply(S, X, ch, a, p) {
        if (ch === 'visit') { bond(p, 15); X.add('so', 3); return `Bạn ở chơi ba ngày. ${nm(p)} đưa bạn đi khắp nơi, gặp ai cũng giới thiệu là "người cứu mạng ta", tới mức bạn đỏ cả mặt. Tối nào hai người cũng ngồi tới khuya. Lúc chia tay, ${nm(p)} đứng ở cổng vẫy mãi, như tiễn người nhà.`; }
        if (ch === 'ask') { a.d.repaid = true; return repay(S, X, a, p); }
        return `Bạn viết thư trả lời, cảm ơn, nói dạo này bận việc. Viết xong, bạn ngồi nhìn lá thư khá lâu rồi mới gửi. ${nm(p)} không mời lần nữa. Cứu người, bạn vốn đâu có định đòi.`;
      },
      auto: (S, X) => (S.traits.social > .5 ? 'visit' : S.gold < med(S, X) || (S.flags.crimes || 0) > 0 ? 'ask' : 'away') },
    trial: { base: (S, X, a, p) => .5 + (p ? p.drive * .2 : 0),
      run: (S, X, a, ok, p) => (ok ? { t: `Nghe tin ${nm(p)} làm ăn phát đạt${a.d.type === 'outlaw' ? ', toán người của ' + nm(p) + ' giờ giữ cả một khúc đường buôn' : ''}. Người kể còn bảo trong những bữa rượu, ${nm(p)} hay nhắc tới bạn. Bạn cười, không nói gì.`, k: 'info' }
        : { t: `Nghe tin ${nm(p)} gặp hạn: ${favorTrouble[a.d.type] || favorTrouble.merchant}. Tin tới qua một người lạ, kể vội rồi đi. Đêm ấy bạn nằm nghe gió đập cửa, cứ ngỡ có ai gõ.`, k: 'bad' }) },
    climax: { title: 'Người mang ơn gặp nạn',
      body: (S, X, a, p) => `${nm(p)} gõ cửa nhà bạn lúc nửa đêm, áo rách, mặt tái: ${favorTrouble[a.d.type] || favorTrouble.merchant}. ${a.d.path === 'visit' ? 'Người từng dắt bạn đi khắp nơi khoe "người cứu mạng ta" giờ đứng run trước cửa.' : 'Bạn đã cứu người này một lần, và giờ người ấy lại đứng đây.'} "Ta không biết đi đâu nữa." Ngoài ngõ, chó nhà ai sủa dồn.`,
      choices: (S, X, a, p) => [ch('shelter', `Giấu ${nm(p)} trong nhà`, 'Lộ ra thì bạn cũng bị liên lụy.'), ch('leave', 'Cho ít tiền rồi bảo đi', 'Chừng ấy là đủ tình.'),
        ch('sell', `Báo cho người đang tìm ${nm(p)}`, 'Có thưởng. Người ta sẽ biết bạn là ai.')],
      apply(S, X, ch, a, p) {
        if (ch === 'shelter') { if (X.chance(.6 + .1 * G.standing(S, X).soc)) { bond(p, 40); X.add('h', 6); return { t: `${nm(p)} ở dưới hầm nhà bạn hai tháng, tới khi chuyện yên. Ngày nào bạn cũng thả xuống một bát cơm, một bầu nước, tai nghe ngóng từng tiếng chân ngoài ngõ. Lúc đi, ${nm(p)} cúi đầu sát đất. "Hai lần rồi," người ấy nói, giọng nghẹn lại.`, o: 'hid' }; }
          X.add('so', -8); X.money(-Math.round(med(S, X) * .4)); return { t: `Bạn giấu ${nm(p)} dưới sàn bếp, đắp lên một lớp rơm. Nửa đêm lính tới, lật từng tấm ván. Lúc bị lôi đi, ${nm(p)} ngoái lại nhìn bạn, không trách một lời. Bạn nộp phạt vì tội chứa chấp. Mấy đêm sau đó, cứ nghe tiếng chân ngoài ngõ là bạn bật dậy.`, o: 'burned' }; }
        if (ch === 'leave') { X.money(-Math.round(med(S, X) * .2)); bond(p, -10); return { t: `Bạn dúi vào tay ${nm(p)} mấy đồng bạc, bảo đi ngay trước khi trời sáng. ${nm(p)} nhận tiền, nhìn bạn một lúc, rồi đi vào bóng tối. Bạn đóng cửa, cài then, ngồi tới sáng. Tiếng bước chân ấy, về sau bạn còn nghe lại trong mơ.`, o: 'drift' }; }
        X.money(Math.round(med(S, X) * .8)); G.trajBump(S, { am: .4 }); kill(S, p); return { t: `Người ta trả thưởng cho bạn ngay ở cổng, đếm tiền xong mới vào bắt người. Bạn đứng nhìn ${nm(p)} bị trói giật cánh khuỷu, không dám ngẩng lên. Tháng sau có tin ${nm(p)} chết trong ngục. Món tiền thưởng nằm trong rương, mấy tháng liền bạn không đụng tới.`, o: 'sold' };
      },
      auto: (S, X) => (S.traits.social > .45 || S.traits.pious > .55 ? 'shelter' : S.traits.pious < .2 && sh(S, 'am') > .2 ? 'sell' : 'leave'),
      bg: (S, X, a, p) => (a.d.ok ? { t: `${ref(S, p)} vẫn nhớ bạn, dù bạn chưa một lần ghé. ${repay(S, X, a, p)}`, o: 'repaid' } : { t: `${nm(p)} gặp hạn rồi biến mất, nhà cửa bỏ không, chẳng ai biết đi đâu. Bạn nghe tin khi đã muộn, lúc cỏ đã mọc kín sân nhà người ấy. Lá thư mời năm nào vẫn nằm trong ngăn kéo.`, o: 'forgot' }) },
    end: (S, X, a, p, o) => (o === 'hid' ? (a.d.repaid ? 'square' : 'bound') : o),
    after: {
      repaid: (S, X, a, p) => ({ t: `Có những món ơn tự tìm đường về, kể cả khi người cứu không đòi. Năm ấy bạn cứu ${nm(p)} chẳng vì mong gì. Giờ ơn quay lại, bạn nhận mà thấy ngượng tay. Tối ấy bạn viết cho ${nm(p)} một lá thư dài, lần đầu sau bao năm.`, k: 'good' }),
      bound: (S, X, a, p) => { X.add('h', 8); p.role = 'ban'; return { t: `Từ đó ${nm(p)} gọi bạn là anh em. Mỗi lần đứng dậy được sau một cơn hoạn nạn, việc đầu tiên ${nm(p)} làm là gửi người tới hỏi bạn cần gì. Bạn chưa xin gì bao giờ. Nhưng biết ngoài kia có một người như thế, đêm bạn ngủ yên hơn.`, bond: 20 }; },
      square: (S, X, a, p) => { X.add('h', 6); return { t: `${nm(p)} đứng dậy được, lần này nhờ bạn. "Năm trước ta trả ơn, năm nay ngươi lại cứu ta. Giờ thì ta nợ ngươi," ${nm(p)} cười, "nợ đến hết đời." Hai người cụng chén, chẳng ai buồn đếm xem ai nợ ai.`, bond: 20 }; },
      burned: (S, X, a, p) => ({ t: `Tên bạn nằm trong sổ của phủ một thời gian dài, đi đâu cũng có người dòm ngó. ${nm(p)} gửi thư từ trong ngục, chữ run run, xin lỗi bạn. Bạn đọc đi đọc lại, rồi đốt lá thư đi cho khỏi ai thấy. Tro bay ra cửa sổ.`, k: 'bad' }),
      drift: (S, X, a, p) => ({ t: `Bạn không nghe tin ${nm(p)} nữa. Có những đêm gió đập cửa, bạn giật mình tưởng có người gõ. Bạn tự hỏi đêm ấy người kia đã đi đâu, mấy đồng bạc ấy có đủ cho tới nơi không.`, k: 'info' }),
      sold: (S, X) => { X.add('so', -6); return { t: 'Chẳng biết ai nói ra, nhưng rồi người ta biết chuyện. Từ đó có người đi đường vòng để khỏi phải chào bạn. Trẻ con trong xóm nhìn bạn rồi thì thầm với nhau. Bạn thôi ra quán nước đầu ngõ.', k: 'bad' }; },
      forgot: (S, X, a, p) => ({ t: `Lá thư cuối cùng của ${nm(p)} vẫn nằm trong ngăn kéo, chưa trả lời. Giấy đã ố vàng, nét mực nhòe ở góc. Mỗi lần dọn nhà bạn lại cầm nó lên, rồi lại cất vào.`, k: 'bad' })
    } });

  // ── Mối thù (cướp chặn đường, bạn đồng hành ôm túi bỏ đi; a.d.gold) ──
  full('feud', { nameVi: 'Mối thù', good: ['win', 'law', 'forgive', 'others'],
    quest: (a, p) => `Đòi lại công bằng với ${nm(p)}`,
    marks: { win: 'vuot_doi_thu', win_blood: 'tay_mau', law: 'giu_loi', lawfail: 'cay_dang', forgive: 'buong_bo', lose: 'ke_thu', others: 'tiec_nuoi', free: 'thu_chua_tra' },
    sum: { win: (d, p) => `đòi lại được món nợ với ${nm(p)}`, win_blood: (d, p) => `đuổi theo ${nm(p)} nhiều năm, rồi giết ${nm(p)} trong cơn giận`, law: (d, p) => `đưa ${nm(p)} ra trước pháp luật`,
      lawfail: (d, p) => `kiện ${nm(p)} mà quan không xử`, forgive: (d, p) => `tha cho ${nm(p)}`, lose: (d, p) => `thua ${nm(p)} cả khi đã tìm ra hắn`,
      others: (d, p) => `để người khác xử ${nm(p)} thay mình`, free: (d, p) => `để ${nm(p)} sống phây phây với món nợ của mình` },
    gone: (S, p) => `Tin ${refE(S, p)} chết ở đâu đó, kể lại qua ba bốn miệng người. Bạn nghe xong, ngồi im rất lâu. Món nợ giữa hai người không còn ai để đòi, mà cũng chẳng còn ai để tha.`,
    beat: { any: ['Lữ khách nào qua làng bạn cũng hỏi có biết ai tên {p} không. Phần lớn lắc đầu.', 'Đêm ấy bạn lại mơ thấy {p} vừa đếm tiền vừa cười. Tỉnh dậy, tay bạn nắm chặt mép chăn.', 'Bạn sờ vết sẹo cũ, rồi lại đi làm như mọi ngày. Có những thứ không cần nhắc mới nhớ.'] },
    acts: acts({ open: { st: ADE } }),
    open: (S, X, a, p) => (p.drive > .55 ? { t: `Có người kể ${ref(S, p)} giờ mở quán trọ ở ${regName(p.loc)}, quán to, có cả chuồng ngựa. Vốn ở đâu ra thì ai cũng đoán được. Bạn nghe xong, đặt bát nước xuống mạnh tới mức nước sóng ra bàn. Món tiền năm ấy giờ đang sinh lời cho kẻ khác.`, k: 'bad', o: 'rich' }
      : { t: `Nghe nói ${ref(S, p)} vẫn lảng vảng ở ${regName(p.loc)}, làm ăn chẳng ra gì. Tiền lấy của bạn, hắn tiêu hết từ lâu. Bạn tưởng nghe vậy sẽ hả dạ, mà không. Cái tên ấy cứ nằm trong đầu bạn như một cái dằm.`, k: 'info', o: 'poor' }),
    knot: { title: 'Món nợ chưa đòi', body: (S, X, a, p) => `${nm(p)} lấy của bạn ${G.coin(a.d.gold || 0)} và một phần thể diện. Mấy năm rồi, bạn vẫn nhớ từng chi tiết của hôm ấy. Người ta hỏi bạn định làm gì. Ai cũng có một lời khuyên, chẳng lời nào giống lời nào.`,
      choices: (S, X, a, p) => [ch('hunt', `Lần theo ${nm(p)}`, `Đi ${regName(p.loc)}, có thể mất cả năm.`), ch('law', 'Báo quan, nhờ người có thế', 'Cần giấy tờ, cần người làm chứng.'),
        ch('wait', 'Đợi thời, luyện thêm', 'Lúc gặp lại, bạn sẽ không còn như năm ấy.'), ch('away', 'Cho qua', 'Của đi thay người.')],
      apply(S, X, ch, a, p) {
        if (ch === 'hunt') { G.trajBump(S, { vo: .3 }); return `Bạn gói ít lương khô, mài lại con dao, lên đường tới ${regName(p.loc)}. Người nhà đứng ở cổng nhìn theo, không ai cản. Đường thì xa, nhưng bạn đã đợi đủ lâu rồi.`; }
        if (ch === 'law') { X.money(-Math.round(med(S, X) * .1)); return 'Bạn viết đơn, nhờ thầy đồ trong làng chép lại cho đúng lối, rồi nộp lên phủ. Thầy đồ vừa chép vừa lắc đầu, bảo đơn thì hay nhưng cửa phủ thì xa. Bạn đứng nhìn người lính cầm lá đơn đi vào, rồi về nhà đợi.'; }
        if (ch === 'wait') { skill(S, X, 4); X.addXp(40); return 'Bạn treo tấm bản đồ vùng lên vách, đánh dấu chỗ người ta thấy hắn lần cuối, rồi ra bãi tập. Sáng nào cũng thế, chiều nào cũng thế. Mỗi lần mỏi tay, bạn lại nhìn lên cái chấm mực trên bản đồ.'; }
        X.add('h', 4); return 'Bạn bảo người nhà đừng nhắc chuyện đó nữa. Của đi thay người, ông bà vẫn dạy thế. Bữa cơm tối ấy cả nhà ăn trong im lặng, rồi dần dần chuyện cũ cũng chìm xuống.';
      },
      auto: (S, X, a, p) => (S.traits.social > .65 || S.traits.pious > .7 ? 'away' : S.traits.bold > .55 ? 'hunt' : G.standing(S, X).soc >= 1 ? 'law' : 'wait') },
    trial: { base: (S, X, a, p) => (a.d.bg ? .5 : a.d.path === 'hunt' ? .5 : a.d.path === 'law' ? .35 + .15 * G.standing(S, X).soc : .55),
      run(S, X, a, ok, p) {
        if (a.d.bg) return ok ? { t: `Lữ khách kể ${nm(p)} đã bị người khác tóm ở ${regName(p.loc)}, vì một vụ khác. Hắn lại giở trò cũ, và lần này chọn nhầm người. Bạn nghe xong, chỉ gật đầu.`, k: 'info' } : { t: `${nm(p)} vẫn sống yên ổn ở ${regName(p.loc)}, lại mở thêm một quán. Người kể còn khen hắn biết làm ăn. Bạn ngồi nghe, không chen một lời.`, k: 'info' };
        if (a.d.path === 'hunt') return ok ? { t: `Sau một mùa lần theo dấu, bạn biết ${nm(p)} ngủ ở đâu, ăn ở đâu, sáng nào ra chợ. Bạn thuê một gian trọ ở phía đối diện, ngồi sau khe cửa mà nhìn. Hắn béo ra, cười nhiều hơn. Hắn không biết có người đang đợi.`, k: 'good' } : (X.add('hl', -6), { t: `Bạn đi cả năm, mất dấu ${nm(p)} ở một bến đò, nơi người lái đò chỉ nhún vai. Bạn về, gầy rộc, đôi giày mòn thủng cả đế. Lòng thì sôi hơn trước.`, k: 'bad' });
        if (a.d.path === 'law') return ok ? { t: 'Phủ nhận đơn, cho người đi hỏi chuyện. Người lính về tận làng ghi lời bạn, ghi cả lời mấy người làm chứng. Lần đầu tiên sau bao năm, chuyện của bạn có người khác cũng coi là thật.', k: 'good' } : { t: 'Đơn nằm trên bàn quan suốt mùa mưa, mép giấy quăn lại vì ẩm. Người ta bảo phải có lễ mới xong. Bạn nhìn túi tiền mỏng của mình, rồi nhìn cánh cửa phủ đóng im ỉm.', k: 'bad' };
        if (ok) skill(S, X, 3); return ok ? { t: 'Mấy năm trôi qua. Tay bạn đã chai, bước chân đã chắc, soi xuống nước thấy một người khác hẳn. Bạn không còn là kẻ bị lấy trắng năm ấy.', k: 'good' } : { t: 'Bạn luyện mãi mà tay vẫn run mỗi lần nhớ lại hôm ấy. Có đêm bạn bật dậy, mồ hôi ướt lưng, tưởng hắn đang đứng ở cửa. Thanh vũ khí dựng ở góc nhà, bạn không dám nhìn lâu.', k: 'bad' };
      } },
    climax: { title: 'Chạm mặt',
      body: (S, X, a, p) => `Bạn tìm ra ${ref(S, p)} ở ${regName(p.loc)}. ${nm(p)} nhận ra bạn ngay, tay đặt lên chuôi dao. Bao năm rồi, mặt hắn vẫn vậy, chỉ có nụ cười là biến mất. Hai người đứng cách nhau chừng mười bước, không ai lên tiếng trước.`,
      choices(S, X, a, p) { const law = a.d.path === 'law' || G.standing(S, X).soc >= 1;
        return [ch('fight', 'Đòi lại bằng tay', `Khả năng thắng chừng ${pct(vs(S, X, p, .3 * p.drive - (a.d.ok && a.d.path !== 'law' ? .2 : 0)))}.`),
          ...(law ? [ch('law', 'Gọi lính, đưa ra phủ', 'Quan có thể chẳng làm gì.')] : []), ch('forgive', 'Bỏ qua', 'Không lấy lại được gì; lòng nhẹ hơn.')]; },
      apply(S, X, ch, a, p) {
        if (ch === 'fight') {
          if (X.rnd() < vs(S, X, p, .3 * p.drive - (a.d.ok && a.d.path !== 'law' ? .2 : 0))) { X.money(a.d.gold || 0); fame(S, 1); X.add('h', 8); return { t: `Cuộc vật lộn ngắn hơn bạn tưởng. ${nm(p)} nằm dưới đất, trả lại cho bạn ${G.coin(a.d.gold || 0)} và một lời xin tha, giọng run bần bật. Bạn đếm lại từng đồng, chậm rãi, ngay trước mặt hắn. Rồi bạn đứng dậy, phủi áo.`, o: 'win' }; }
          X.add('hl', -12); X.add('h', -6); if (X.chance(.3)) X.cond('wound'); return { t: `${nm(p)} nhanh tay hơn. Lưỡi dao rạch một đường trên cánh tay bạn, máu chảy xuống kẽ ngón. Bạn ôm vết thương đi về, lần này cũng tay trắng như lần trước. Sau lưng, hắn không đuổi theo, chỉ cười.`, o: 'lose' };
        }
        if (ch === 'law') {
          if (X.rnd() < .4 + .1 * G.standing(S, X).soc + (a.d.path === 'law' && a.d.ok ? .25 : 0)) { X.add('h', 5); return { t: `Quan cho bắt người. Lính trói ${nm(p)} giải đi giữa ban ngày, cả phố đứng xem. Hắn đi ngang qua bạn, cúi gằm mặt. Bạn đã tưởng mình sẽ cười, mà rốt cuộc chỉ đứng im.`, o: 'law' }; }
          const f = Math.round(med(S, X) * .2); X.money(-f); X.add('h', -4); return { t: `Quan nhận lễ của ${nm(p)}, rồi quay sang phạt bạn ${G.coin(f)} tội vu cáo. Ra khỏi công đường, bạn nghe sau lưng tiếng hắn cười với viên lại. Trời nắng chang chang mà bạn thấy lạnh.`, o: 'lawfail' };
        }
        X.add('h', 4); bond(p, 20); return { t: `Bạn nhìn ${nm(p)} một lúc lâu, rồi quay lưng đi trước. Mấy năm đeo theo món nợ ấy, tới lúc buông ra lại nhẹ như buông một hòn sỏi. ${nm(p)} đứng nhìn theo rất lâu. Bạn không ngoái lại.`, o: 'forgive' };
      },
      auto: (S, X, a, p) => (S.traits.social > .65 || S.traits.pious > .7 ? 'forgive' : a.d.path === 'law' ? 'law' : X.power(S) >= npcPow(p, 0) || S.traits.bold > .5 ? 'fight' : 'forgive'),
      bg: (S, X, a, p) => (a.d.ok ? { t: `${nm(p)} bị xử ở ${regName(p.loc)} vì một món nợ khác. Bạn nghe tin qua một người bán muối, lúc đang mặc cả mấy đấu muối. Món nợ của bạn chẳng ai nhắc tới. Bạn trả tiền muối, xách về.`, o: 'others' } : { t: `${nm(p)} giàu lên, ai cũng gọi bằng ông, đi đâu cũng có người cúi chào. Món tiền năm ấy giờ đã thành nhà cao cửa rộng. Bạn nghe tin, lặng lẽ ăn cho hết bát cơm.`, o: 'free' }) },
    end: (S, X, a, p, o) => (o === 'win' && a.d.path === 'hunt' && !a.d.ok ? (kill(S, p), 'win_blood') : o),
    after: {
      win: (S, X, a, p) => { p.loc = X.pick(G.REGIONS).id; X.add('h', 4); return `Từ hôm đó bạn ngủ ngon, giấc dài không mộng mị. ${nm(p)} rời vùng, không ai nghe tin nữa. Món tiền lấy lại, bạn chẳng tiêu vào việc gì to tát. Cái được về, hóa ra là được thôi nghĩ.`; },
      win_blood: (S, X) => { X.add('h', -4); return { t: 'Bạn đã định chỉ đòi lại tiền. Nhưng cả năm lần theo, cả năm ăn ngủ cùng cơn giận; lúc lưỡi dao dừng lại thì đã muộn. Bạn chôn hắn bên đường, đắp một nấm đất, không cắm gì lên. Về sau đi qua khúc đường ấy, bạn luôn bước nhanh, mắt nhìn thẳng.', k: 'bad' }; },
      law: (S, X, a, p) => ({ t: `${nm(p)} bị xử khổ sai ở mỏ đá. Bạn đứng xem người ta xích chân ${nm(p)}, tiếng xích kéo lê trên đá nghe rợn người. Bạn không thấy vui như mình tưởng. Trên đường về bạn mua một bầu rượu, mà uống không hết.`, k: 'info' }),
      lawfail: (S, X, a, p) => ({ t: `${nm(p)} đi ngang nhà bạn, cố ý dừng lại cười, cười to cho cả xóm nghe. Bạn đóng cửa. Món nợ cũ giờ thêm một món mới là tiền phạt. Đêm ấy bạn đếm lại mấy đồng còn trong rương, đếm hai lần.`, k: 'bad' }),
      forgive: (S, X, a, p) => { if (X.chance(.55)) { const g = Math.round((a.d.gold || 20) * .6); X.money(g); X.add('h', 6); return { t: `Một sáng có túi tiền đặt trước cửa nhà bạn, ${G.coin(g)}, kèm mảnh giấy chỉ có một chữ: tên ${nm(p)}. Tiền không đủ như năm ấy. Nhưng bạn cầm mảnh giấy lâu hơn cầm túi tiền.`, bond: 20 }; }
        return { t: `Bạn không nghe tin ${nm(p)} nữa. Lạ là bạn cũng thôi nghĩ tới. Có hôm ai đó nhắc tên hắn, bạn phải ngẫm một lúc mới nhớ ra là ai.`, k: 'info' }; },
      lose: (S, X, a, p) => ({ t: `${nm(p)} vẫn sống phây phây, kể cả sau ngày bạn tìm tới tận nơi. Mỗi lần đi ngang ${regName(p.loc)}, bạn lại sờ vết sẹo cũ trên tay. Món nợ ấy bạn mang theo, như mang vết sẹo.`, k: 'bad' }),
      others: () => ({ t: 'Món nợ được trả, nhưng không phải bởi bạn. Bạn thấy nhẹ, rồi thấy trống. Tối ấy bạn ngồi ngoài hiên tới khuya, chẳng nghĩ gì cụ thể.', k: 'info' }),
      free: (S, X, a, p) => ({ t: `Có năm ${nm(p)} còn đi ngang làng bạn trên một chiếc xe ngựa sơn đỏ, áo lụa, nhẫn vàng. Hắn không nhận ra bạn đứng bên đường. Bánh xe hất bùn lên vạt áo bạn, rồi xe đi mất.`, k: 'bad' })
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
    beat: { any: ['Bạn mài lại con dao khắc tên {kin}, đêm nào cũng mài, tới khi lưỡi dao sáng như nước.', 'Thợ săn nào đi ngang làng bạn cũng hỏi về dấu chân con quái. Có người kể, có người chỉ lắc đầu.', 'Bạn ra mộ {kin}, nhổ mấy ngọn cỏ dại, ngồi tới khi trời tối.'] },
    acts: acts({ open: { st: TA, wait: [1, 15], w: S => .5 + 3 * S.traits.bold + 4 * sh(S, 'vo') } }),
    open(S, X, a) { G.trajBump(S, { vo: .4 }); X.addXp(40); return { t: `Bạn khắc tên ${kinOf(a)} lên chuôi con dao đi rừng, từng nét một, khắc sâu tới mức tay rớm máu. Từ đó sáng nào bạn cũng tập trước khi gà gáy. Người nhà khuyên mấy lần rồi thôi. Ai cũng hiểu con dao ấy để làm gì.`, k: 'info', o: 'oath' }; },
    knot: { title: 'Lời thề', body: (S, X, a) => `Con ${spOf(a) ? spOf(a).nameVi : 'quái'} đã giết ${kinOf(a)} vẫn ở đâu đó trong ${zoneOf(S, X, a).nameVi}. Có đêm gió thổi từ phía ấy về, bạn tưởng ngửi thấy cả mùi của nó. Con dao khắc tên ${kinOf(a)} treo ở đầu giường. Đêm nào trước khi ngủ, bạn cũng nhìn nó một lúc.`,
      choices: (S, X, a) => [ch('train', 'Luyện võ tới khi đủ sức', 'Một mình, lâu.'), ch('hunters', 'Theo phường săn học nghề', 'Học cách quái nghĩ.'), ch('away', 'Buông', `Báo thù không làm ${kinOf(a)} sống lại.`)],
      apply(S, X, ch, a) {
        if (ch === 'train') { skill(S, X, 5); return 'Bạn dựng một bãi tập sau nhà: một cọc gỗ, một bao cát, một tảng đá để nâng. Ngày nào cũng ra đó trước khi gà gáy, tối mịt mới vào. Hàng xóm quen dần với tiếng thình thịch mỗi sớm.'; }
        if (ch === 'hunters') { X.gain('Bow', 4); X.add('so', 2); return 'Phường săn nhận bạn làm đứa xách nỏ, sai vặt đủ thứ. Bạn học đọc dấu chân trước khi học bắn, học nằm im cả buổi trong bụi mà không động đậy. Ông trưởng phường bảo: muốn giết con quái thì trước hết phải nghĩ như nó.'; }
        X.add('h', 6); return `Mộ ${kinOf(a)} cỏ đã xanh. Bạn thôi nhìn về phía ${zoneOf(S, X, a).nameVi} mỗi chiều. Con dao khắc tên, bạn bọc vào một tấm vải, cất xuống đáy rương. Lòng chưa nguôi hẳn, nhưng ít ra đêm đã ngủ được.`;
      },
      auto: S => (S.traits.bold > .35 || sh(S, 'vo') > .3 ? (S.traits.social > .5 ? 'hunters' : 'train') : 'away') },
    trial: { base: (S, X, a) => (a.d.bg ? .45 : .45 + (a.d.path === 'hunters' ? .2 : .1)),
      run(S, X, a, ok) {
        const sp = spOf(a), z = zoneOf(S, X, a);
        if (a.d.bg) return ok ? { t: `Phường săn trong vùng bàn chuyện đi diệt ổ ${sp ? sp.nameVi : 'quái'} ở ${z.nameVi}. Họ họp nhau ở quán đầu làng, nói to tới mức bạn đi ngang cũng nghe. Không ai hỏi bạn có muốn theo không. Bạn cũng không xin.`, k: 'info' } : { t: `${sp ? sp.nameVi : 'Quái'} lại xuống bìa ${z.nameVi}, cắp mất hai con dê. Người trong làng đóng cổng sớm hơn, trẻ con không được ra bờ rừng nữa. Bạn nghe chuyện, nghĩ tới con dao nằm dưới đáy rương.`, k: 'info' };
        return ok ? { t: `Bạn lần theo dấu ${sp ? sp.nameVi : 'con quái'} qua ${z.nameVi} suốt một mùa, ăn lương khô, ngủ trên cây. ${a.d.path === 'hunters' ? 'Những gì phường săn dạy giờ mới dùng tới: vết cào trên vỏ cây, nhúm lông mắc ở bụi gai.' : 'Không ai dạy bạn đọc dấu, bạn tự học bằng cách đi lạc mấy lần.'} Rồi một chiều, bạn tìm ra chỗ nó ngủ. Nằm im trong bụi, nghe tiếng nó thở, tim bạn đập như trống.`, k: 'good' }
          : (X.add('hl', -8), { t: `Bạn lần theo dấu tới ${z.nameVi} rồi mất dấu giữa một trận mưa rừng. Đêm ấy có thứ gì lao ra từ bóng tối. Bạn về với một vết cào dài trên lưng, sốt mấy ngày liền. Trong cơn sốt, bạn gọi tên ${kinOf(a)}.`, k: 'bad' });
      } },
    climax: { title: 'Món nợ máu',
      body: (S, X, a) => `Thợ săn báo: một con ${spOf(a).nameVi} đầu đàn vừa về ${zoneOf(S, X, a).nameVi}, đúng chỗ năm ấy. Người báo tin nói xong thì đứng nhìn bạn, chờ. Con dao khắc tên ${kinOf(a)} vẫn còn đó. Bao nhiêu năm, bạn đợi đúng tin này.`,
      choices: (S, X, a) => [ch('hunt', 'Đi săn nó', `Một trận với ${spOf(a).nameVi} tinh anh. Thua có thể chết.`),
        ...(a.d.path === 'hunters' || a.d.ok ? [ch('trap', 'Dụ nó vào bẫy', 'Cần cả phường săn và nhiều ngày rình.')] : []), ch('no', 'Để nó yên', `Báo thù không làm ${kinOf(a)} sống lại.`)],
      apply(S, X, ch, a) {
        if (ch === 'no') { X.add('h', 3); return { t: `Bạn treo con dao lên vách, không mang đi. Đêm ấy bạn ra mộ ${kinOf(a)}, ngồi kể hết mọi chuyện, như kể với người còn sống. Gió lùa qua mấy ngọn cỏ. Về nhà, bạn ngủ một giấc dài.`, o: 'letgo' }; }
        if (ch === 'trap') { if (X.chance(.55 + (a.d.path === 'hunters' ? .15 : 0) + SA.pb(a))) { fame(S, 2); X.add('h', 10); cnt(S, 'vgWin'); return { t: `Con ${spOf(a).nameVi} sập hầm chông vào đêm thứ chín. Chín đêm nằm rình trong sương, chín đêm không ai dám nhóm lửa. Lúc nó rống lên dưới hầm, cả phường săn reo vang tới tận làng. Bạn đứng trên miệng hầm, tay vẫn nắm con dao khắc tên ${kinOf(a)}.`, o: 'trap' }; }
          a.d.tries = (a.d.tries || 0) + 1; return { t: 'Nó ngửi thấy mùi người, dừng lại ở mép bẫy, rồi quay đầu bỏ đi. Cả phường săn nằm im nhìn nó khuất vào rừng. Ông trưởng phường nhổ nước bọt, bảo nó khôn hơn người ta tưởng.', o: 'lose', to: a.d.tries < 2 ? 'climax' : 'after' }; }
        const rec = X.fight(vgEnc(S, X, a), false); if (S.dead) return null;
        cnt(S, 'vgHunt');
        if (rec.win) { fame(S, 2); X.add('h', 12); cnt(S, 'vgWin'); return { t: `Trận ấy dài như cả một đời. Con ${spOf(a).nameVi} gục dưới chân bạn, hơi thở cuối phả ra mùi tanh nồng. Bạn đứng đó rất lâu, tay còn run, không biết làm gì tiếp. Rồi bạn quỳ xuống, cắt lấy một chiếc nanh.`, o: 'win' }; }
        a.d.tries = (a.d.tries || 0) + 1; return { t: 'Nó lại thoát, để lại trên người bạn một vết thương mới. Bạn lết về, máu khô cứng cả vạt áo. Nằm trên giường, bạn nghe tiếng nó rống từ xa vọng lại. Nó vẫn còn đó.', o: 'lose', to: a.d.tries < 2 ? 'climax' : 'after' };
      },
      auto: (S, X, a) => (S.traits.bold > .35 || sh(S, 'vo') > .3 ? (a.d.path === 'hunters' ? 'trap' : 'hunt') : 'no'),
      bg: (S, X, a) => (a.d.ok ? { t: `Phường săn hạ được con ${spOf(a) ? spOf(a).nameVi : 'quái'} đầu đàn. Họ treo đầu nó ở cổng làng, đốt pháo mừng ba ngày. Không ai gọi bạn. Đêm ấy bạn ngồi một mình nghe tiếng pháo, tay mân mê con dao khắc tên ${kinOf(a)}.`, o: 'others' } : { t: 'Con quái vẫn ở đó. Mỗi năm nó lại lấy đi của ai đó một thứ, khi thì con dê, khi thì con trâu. Người làng đặt cho nó một cái tên, rồi nhắc tới nó như nhắc tới mưa nắng.', o: 'still' }) },
    after: {
      win: (S, X, a) => ({ t: `Bạn mang chiếc nanh của con ${spOf(a).nameVi} ra mộ ${kinOf(a)}, đặt lên đó. Đó là lần đầu bạn khóc kể từ năm ấy. Khóc xong, người nhẹ hẳn, như vừa đặt xuống gánh nặng mang theo nửa đời. Con dao khắc tên, bạn chôn luôn bên mộ.`, k: 'big' }),
      trap: (S, X, a) => { X.add('so', 5); return { t: `Phường săn dựng lại hầm chông ở bìa ${zoneOf(S, X, a).nameVi}, gọi nó là "hầm của ${S.name.split(' ')[0]}". Lứa quái sau không dám xuống làng. Trẻ con lớn lên trong làng không còn biết sợ bìa rừng là gì. Năm nào tới ngày giỗ ${kinOf(a)}, phường săn cũng ra sửa hầm, rồi rủ bạn đi uống rượu.`, k: 'big' }; },
      lose: (S, X, a) => ({ t: `Vết thương lành, để lại mấy vệt sẹo ngoằn ngoèo. Bạn biết mình không đủ sức đi thêm lần nữa. Con dao khắc tên ${kinOf(a)} nằm trên vách tới cuối đời, lưỡi vẫn sáng, vì bạn vẫn mài.`, k: 'bad' }),
      letgo: (S, X, a) => { X.add('h', 4); return `Bạn trồng một cây đào bên mộ ${kinOf(a)}. Mùa xuân nào nó cũng ra hoa, hồng cả một góc đồi. Bạn ra đó ngồi, không còn nghĩ tới con quái, chỉ nghĩ tới người nằm dưới.`; },
      others: (S, X, a) => ({ t: `Bạn ra cổng làng nhìn cái đầu quái treo trên cọc, ruồi bâu đen. Món nợ đã trả, nhưng không bằng tay bạn. Bạn đứng nhìn tới khi người ta bắt đầu để ý. Rồi bạn về, chẳng biết nên thấy nhẹ hay thấy tiếc.`, k: 'info' }),
      still: () => ({ t: 'Bạn dạy con cháu đường nào trong rừng không được đi, gốc cây nào không được dừng chân. Chỉ vậy thôi. Có những đêm nghe tiếng rống từ xa, bạn ngồi dậy cài lại then cửa.', k: 'bad' })
    } });

  // ── Tình xưa (mối tình đầu, người từng ngỏ lời; a.d.refused) ──
  const free2 = (S, p) => single(S) && !p.wed;
  full('love', { nameVi: 'Tình xưa', good: ['wed', 'late_wed', 'let', 'friend'], body: 'flesh',
    quest: (a, p) => `Chuyện chưa xong với ${nm(p)}`,
    marks: { wed: 'tinh_mot_doi', late_wed: 'que_moi', let: 'buong_bo', friend: 'ban_cu', farewell: 'tiec_nuoi', p_wed: 'cay_dang', waited: 'no_on' },
    sum: { wed: (d, p) => `nối lại với ${nm(p)} sau ngần ấy năm`, late_wed: (d, p) => `lấy ${nm(p)} khi tóc cả hai đã điểm bạc`, let: (d, p) => `để chuyện với ${nm(p)} ngủ yên`,
      friend: (d, p) => `giữ ${nm(p)} làm bạn tới cuối đời`, farewell: (d, p) => `nói hết lòng với ${nm(p)} một lần rồi thôi`, p_wed: (d, p) => `nhìn ${nm(p)} lấy người khác`, waited: (d, p) => `để ${nm(p)} đợi mình cả đời` },
    gone: (S, p) => (p.bond >= 15 ? `Tin ${refE(S, p)} mất tới vào một chiều cuối thu. Bạn ngồi lâu bên cửa sổ, nhớ một mùa hè đã xa lắm. Có những câu bạn chưa kịp nói, giờ chẳng còn ai để nói.` : null),
    beat: { any: ['Bạn đi ngang con đường hai người hay đi năm ấy, bước chậm lại một chút. Hàng cây đã cao hơn nhiều.', 'Có người nhắc tên {p} giữa bữa rượu. Bạn giả như không nghe, tay xoay xoay cái chén.', 'Bạn giở lại lá thư cũ của {p}, đọc tới chỗ nét mực nhòe, rồi gấp lại cất đi.'] },
    acts: acts({ open: { st: ADE, wait: [3, 15] } }),
    open(S, X, a, p) {
      if (free2(S, p)) return { t: `Bạn gặp lại ${ref(S, p)} ở đám cưới một người quen. Giữa tiếng trống tiếng cười, hai người nhận ra nhau từ hai đầu sân. ${nm(p)} vẫn cười như hồi ấy, khóe mắt chỉ thêm vài nếp nhăn. Cả buổi tiệc, bạn chẳng nhớ mình đã ăn gì.`, k: 'good', o: 'free' };
      if (!single(S) && !p.wed) return { t: `${ref(S, p)} vẫn ở vậy. Hôm gặp lại ở chợ phiên, ${nm(p)} hỏi thăm nhà bạn trước khi hỏi thăm bạn, giọng nhẹ như không. Hai người đứng nói chuyện bên sạp vải khá lâu. Lúc chào nhau, ${nm(p)} là người quay đi trước.`, k: 'info', o: 'past' };
      return { t: `Bạn gặp lại ${ref(S, p)} ở chợ phiên${p.wed ? ', ' + nm(p) + ' dắt theo một đứa con' : ''}. Hai người chào nhau như người quen thường, hỏi mùa màng, hỏi sức khỏe. Chẳng ai nhắc chuyện cũ. Vậy mà tối ấy về, bạn lục tìm lá thư năm nào.`, k: 'info', o: 'past' };
    },
    knot: { title: 'Chuyện cũ', body: (S, X, a, p) => `Từ hôm gặp lại, bạn hay nghĩ tới ${nm(p)}${a.d.refused ? ' và lần bạn lắc đầu năm ấy' : ' và mùa hè năm ấy'}. Những chuyện tưởng đã quên lại hiện ra rõ mồn một: giọng nói, dáng đi, cái cách người ấy vén tóc. Đang làm, bạn hay dừng tay mà không biết vì sao. Chuyện năm ấy, hình như vẫn chưa xong.`,
      choices: (S, X, a, p) => [ch('write', 'Viết thư', 'Chậm mà chắc. Chữ nghĩa giữ được lâu.'), ...(free2(S, p) ? [ch('seek', `Tìm gặp ${nm(p)}`, 'Nói thẳng. Có thể bị từ chối.')] : []), ch('away', 'Để chuyện cũ ngủ yên', '')],
      apply(S, X, ch, a, p) {
        if (ch === 'write') { bond(p, 10); return `Bạn viết một lá thư dài, sửa đi sửa lại ba đêm, đèn dầu cạn hai lần. Gửi đi rồi, ngày nào bạn cũng ra ngõ ngóng người đưa thư. Thư trả lời tới sau hai tuần, dài gấp đôi. Bạn đọc ba lượt mới dám đặt xuống.`; }
        if (ch === 'seek') { bond(p, 15); X.add('h', 4); return `Bạn tới tận nhà ${nm(p)}, đứng ngoài cổng một lúc mới dám gọi. Hai người ngồi bên hiên tới khi trăng lên, nói đủ thứ chuyện trừ chuyện cũ. Ấm chè nguội từ lúc nào chẳng ai để ý. Lúc về, ${nm(p)} tiễn bạn ra tận đầu ngõ.`; }
        return 'Bạn cất lá thư cũ vào đáy rương, dưới mấy lớp áo. Có những chuyện để yên thì hơn, bạn tự nhủ thế. Đêm ấy bạn ngủ muộn hơn mọi hôm.';
      },
      auto: (S, X, a, p) => (free2(S, p) && (S.traits.social > .35 || sh(S, 'gia') > .12) ? 'seek' : S.traits.social > .5 ? 'write' : 'away') },
    trial: { base: (S, X, a, p) => (a.d.bg ? .5 : .5 + (a.d.path === 'seek' ? .15 : 0) + (p.bond > 40 ? .1 : 0)),
      run(S, X, a, ok, p) {
        if (a.d.bg) return ok ? { t: `Nghe nói ${nm(p)} đã nhận lời một người ở ${regName(p.loc)}. Người kể vô tình, kể xong mới thấy bạn im. Bạn hỏi lại một câu về thời tiết, rồi đi về.`, k: 'info' } : { t: `${nm(p)} vẫn ở vậy, ai hỏi cũng lắc đầu. Bà mối tới mấy lần rồi cũng thôi. Có người bảo ${nm(p)} đang đợi ai đó, nhưng chẳng ai biết là ai.`, k: 'info' };
        return ok ? { t: `${a.d.path === 'write' ? 'Thư qua thư lại đã dày một xấp, buộc bằng sợi lạt, cất dưới gối.' : 'Mùa ấy hai người gặp nhau nhiều hơn mọi năm: ở chợ, ở bến sông, ở lễ hội.'} Người trong xóm bắt đầu nói ra nói vào. Bạn nghe, không cãi, mà cũng chẳng tránh.`, k: 'good', bond: 10 } : { t: 'Một hiểu lầm nhỏ, một câu lỡ lời, rồi cả mùa không ai viết cho ai. Mấy lần bạn cầm bút lên lại đặt xuống. Mùa mưa năm ấy dài hơn mọi năm.', k: 'bad', bond: -10 };
      } },
    climax: { title: 'Câu hỏi năm ấy',
      body: (S, X, a, p) => (free2(S, p) ? `${nm(p)} hỏi bạn có còn nhớ ${a.d.refused ? 'lần bạn từ chối năm ấy' : 'mùa hè năm ấy'} không. Hai người đứng ở chỗ cũ, gốc cây cũ, chỉ có người là đã khác. Giọng ${nm(p)} cố làm ra bình thản, mà tay thì nắm chặt vạt áo. Rồi người ấy đứng chờ.` : `${nm(p)} hẹn gặp bạn lần cuối trước khi theo con về ${regName(p.loc)}. Lời nhắn gửi qua một đứa trẻ, chỉ có giờ và chỗ hẹn: bến đò cũ. Bạn đọc đi đọc lại mấy chữ ấy. Đi hay không, chỉ mình bạn biết.`),
      choices: (S, X, a, p) => (free2(S, p) ? [ch('wed', 'Nối lại', 'Thành vợ chồng.'), ch('friend', 'Làm bạn thôi', 'Có những chuyện giữ làm kỷ niệm thì hơn.'), ch('let', 'Để chuyện cũ ngủ yên', '')]
        : [ch('farewell', 'Nói hết những gì chưa nói', 'Một lần thôi.'), ch('friend', 'Hẹn làm bạn tới già', ''), ch('let', 'Không tới', '')]),
      apply(S, X, ch, a, p) {
        if (ch === 'wed') { S.family.spouse = { name: p.name, race: p.race, age: G.castYrs(S, p), alive: true }; p.role = 'phoi'; p.how = 'bạn đời của bạn'; p.wed = true;
          S.flags.suitor = null; X.add('h', 12); X.add('so', 6); cnt(S, 'lvWed'); return { t: 'Đám cưới nhỏ, chỉ mời những người biết chuyện cũ. Mấy bà hàng xóm vừa têm trầu vừa kể lại chuyện năm xưa, kể sai be bét. Hai người nhìn nhau cười, không ai buồn cải chính.', o: 'wed' }; }
        if (ch === 'friend') { X.add('h', 4); bond(p, 10); return { t: 'Hai người cụng chén, cười về chuyện năm xưa như chuyện của người khác. Có một lúc cả hai cùng im, rồi lại cười. Lúc chia tay, bạn thấy lòng nhẹ hơn mình tưởng.', o: 'friend' }; }
        if (ch === 'farewell') { X.add('h', -2); return { t: `Bạn nói hết, những điều đã giữ trong lòng ngần ấy năm. ${nm(p)} nghe hết, không ngắt lời. Rồi hai người chia tay ở bến đò, không ai ngoái lại. Nước sông hôm ấy đục, chảy rất chậm.`, o: 'farewell' }; }
        X.add('h', -2); return { t: free2(S, p) ? `Bạn lắc đầu, nhẹ thôi. ${nm(p)} hiểu, cười một cái rồi nhìn đi chỗ khác. Hai người chia tay ở đầu ngõ, lần này không ai hẹn gì.` : 'Hôm ấy bạn không ra bến đò. Bạn ngồi ở nhà, tay cầm chén trà đã nguội, nghe tiếng mái chèo xa dần ngoài sông. Từ đó không còn lời hẹn nào nữa.', o: 'let' };
      },
      auto: (S, X, a, p) => (free2(S, p) ? (S.traits.social > .35 || sh(S, 'gia') > .12 ? 'wed' : 'let') : S.traits.social > .5 ? 'friend' : 'farewell'),
      bg: (S, X, a, p) => (a.d.ok ? (p.wed = true, { t: `${nm(p)} lấy người ở ${regName(p.loc)}. Thiệp mời tới tay bạn sau ngày cưới, góc giấy đã sờn vì đi đường xa. Bạn đọc tên người kia hai lần. Tối ấy bạn rót một chén rượu, uống một mình.`, o: 'p_wed' }) : { t: `${nm(p)} vẫn ở vậy, cả đời. Tóc đã bạc, mà ai hỏi vẫn chỉ lắc đầu. Mỗi lần nghe tin ấy, bạn lại không dám nghĩ tiếp.`, o: 'waited' }) },
    end: (S, X, a, p, o) => (o === 'wed' && !a.d.ok ? 'late_wed' : o),
    after: {
      wed: (S, X, a, p) => ({ t: `Nhiều năm sau, đêm nào ${nm(p)} cũng kể cho con cháu nghe chuyện mùa hè năm ấy, mỗi lần một khác. Bạn ngồi bên, thỉnh thoảng chen vào sửa một chi tiết, rồi bị cả nhà gạt đi. Bếp lửa reo, ngoài trời mưa. Chuyện cũ kể mãi vẫn còn.`, k: 'big' }),
      late_wed: (S, X, a, p) => ({ t: `Đi một vòng xa, hai người vẫn quay về chỗ cũ. Người làng bảo đám cưới ấy muộn hai mươi năm, mà vui nhất làng. ${nm(p)} cài lên mái tóc đã điểm bạc một nhành hoa dại. Cái mùa mưa không ai viết cho ai năm nào, giờ nhắc lại cả hai chỉ lắc đầu cười.`, k: 'big' }),
      let: () => ({ t: 'Có những mùa hè chỉ nên sống một lần. Bạn giữ nó lại nguyên vẹn, như cánh hoa ép trong sách. Thỉnh thoảng giở ra nhìn một chút, rồi gấp lại.', k: 'info' }),
      friend: (S, X, a, p) => ({ t: `Tết nào ${nm(p)} cũng ghé, mang theo một hũ mứt gừng. Hai người ngồi cãi nhau về chuyện năm xưa, xem ai nhớ đúng hơn. Cãi xong lại cười. Con cháu hai nhà nhìn nhau, chẳng hiểu hai người già cười chuyện gì.`, k: 'good', bond: 10 }),
      farewell: () => ({ t: 'Bạn giữ lại một chiếc khăn tay. Đó là tất cả. Khăn đã ngả màu, nếp gấp cũ vẫn còn. Bạn chưa từng kể với ai nó là của ai.', k: 'info' }),
      p_wed: (S, X, a, p) => ({ t: `Bạn đi ngang nhà ${nm(p)} một lần, thấy khói bếp, nghe tiếng trẻ con. Bạn không dừng lại. Đi được một quãng xa, bạn mới nhận ra nãy giờ mình nín thở.`, k: 'bad' }),
      waited: (S, X, a, p) => ({ t: `Người ta kể ${nm(p)} chưa bao giờ lấy ai. Bạn không hỏi vì sao, sợ người ta nói ra đúng điều mình đoán. Đêm ấy bạn lấy lá thư cũ dưới đáy rương ra đọc, lần đầu sau ngần ấy năm.`, k: 'bad' })
    } });

  // ── Thầy trò (bạn là trò; a.d: kind, school, work) ──
  const msTask = a => (a.d.kind === 'craft' ? 'làm lại một món hàng cho tới khi không còn chỗ nào để chê' : 'đứng tấn dưới thác suốt mười ngày');
  const msSkill = a => (a.d.school && J.schools[a.d.school] ? J.schools[a.d.school].masteries[0] : (G.WORKS[a.d.work] && Object.keys(G.WORKS[a.d.work].trains || {})[0]) || 'Body');
  full('master', { nameVi: 'Thầy trò', good: ['heir', 'own_way', 'stood'],
    quest: (a, p) => `Theo ${nm(p)} tới cùng`,
    marks: { heir: 'chan_truyen', own_way: 'cao_thu', stood: 'duoc_tin', apart: 'tiec_nuoi', other_heir: 'cay_dang', alone: 'ke_di_xa' },
    sum: { heir: (d, p) => `nhận chân truyền của thầy ${nm(p)}`, own_way: (d, p) => `học hết của thầy ${nm(p)} rồi mở lối riêng`, stood: (d, p) => `đứng ra thay thầy ${nm(p)} lúc thầy già yếu`,
      apart: (d, p) => `xa thầy ${nm(p)} lúc thầy mất`, other_heir: (d, p) => `bỏ thầy ${nm(p)} giữa chừng, nhìn người khác nhận chân truyền`, alone: (d, p) => `rời thầy ${nm(p)} sớm, tự học trên đường` },
    gone: (S, p) => `Thầy ${nm(p)} mất khi bạn chưa học hết. Bài cuối thầy giảng, bạn còn chép dở trong cuốn sổ nhỏ. Những trang sau để trắng, và sẽ trắng mãi.`,
    beat: { any: ['{p} bắt bạn làm lại từ đầu một bài đã thuộc. Bạn làm, không cãi, tới lần thứ ba mới thấy chỗ mình sai.', 'Bạn chép lại lời {p} giảng vào một cuốn sổ nhỏ, đêm nào cũng chép tới khi đèn cạn dầu.', '{p} kể chuyện thời trẻ, lần đầu tiên. Bạn ngồi im, sợ động một cái là thầy thôi kể.'] },
    acts: acts({ open: { st: TA, wait: [1, 6] }, after: { dead: true } }),
    open(S, X, a, p) {
      if (X.rnd() < .4 + .4 * S.traits.studious + .2 * S.traits.bold) { X.addXp(80); return { t: `${nm(p)} bắt bạn ${msTask(a)}. Mấy ngày đầu bạn tưởng mình không qua nổi, đêm về tay chân rã rời. Tới ngày thứ chín thì làm được. Thầy không khen, chỉ gật đầu, nhưng tối ấy mâm cơm có thêm một quả trứng.`, k: 'good', o: 'pass', bond: 10 }; }
      X.add('h', -3); return { t: `${nm(p)} bắt bạn ${msTask(a)}. Giữa chừng bạn bỏ cuộc, ngồi bệt xuống thở. Thầy không mắng, chỉ bảo làm lại từ đầu, giọng đều đều như bảo đi gánh nước. Bạn đứng dậy, làm lại.`, k: 'info', o: 'fail' };
    },
    knot: { title: 'Đạo của thầy', body: (S, X, a, p) => `${nm(p)} dạy theo lối cũ: chưa thuộc bài này thì không học bài sau. Ngày nào cũng bắt đầu bằng cùng một bài, cùng một câu dặn. Bạn đã thấy những chỗ thầy dạy chậm, những chỗ có thể làm khác đi. Thầy thì chưa bao giờ hỏi bạn nghĩ gì.`,
      choices: () => [ch('devote', 'Theo thầy hết lòng', 'Học chậm mà trọn.'), ch('own', 'Học mà giữ lối riêng', 'Thầy có thể không vui.'), ch('away', 'Rời thầy sớm', 'Đường còn dài, thầy không phải người duy nhất.')],
      apply(S, X, ch, a, p) {
        if (ch === 'devote') { bond(p, 15); X.gain(msSkill(a), 3); return `Bạn dọn tới ở cạnh nhà ${nm(p)}, sáng quét sân, tối học bài. Những bài thầy bắt làm lại, bạn làm lại không đếm. Dần dần, thầy để bạn đứng gần hơn mỗi khi thầy làm việc.`; }
        if (ch === 'own') { skill(S, X, 3); G.trajBump(S, { nghe: .3 }); return `Bạn học hết bài thầy dạy, rồi tự mày mò thêm lúc thầy đã ngủ. ${nm(p)} thấy, không nói gì. Chỉ có một sáng, cuốn sổ ghi chép của bạn bị lật mở đặt trên bàn, như có ai vừa đọc.`; }
        bond(p, -15); return `Bạn cúi chào ${nm(p)} ba lần rồi đi. Thầy đứng ở cổng tới khi bạn khuất. Đi được một quãng, bạn ngoái lại, vẫn thấy cái bóng ấy đứng đó. Bạn quay mặt, bước nhanh hơn.`;
      },
      auto: S => (S.traits.studious > .55 ? 'devote' : S.traits.bold > .65 ? 'own' : S.traits.social < .25 ? 'away' : 'devote') },
    trial: { base: (S, X, a) => (a.d.bg ? .5 : .45 + (a.d.path === 'devote' ? .15 : .05) + .2 * S.traits.studious),
      run(S, X, a, ok, p) {
        if (a.d.bg) return ok ? { t: `Nghe nói ${nm(p)} đã nhận một đứa học trò mới, sáng dạ hơn bạn năm ấy. Đứa ấy ở luôn trong nhà thầy, sáng quét sân, tối học bài. Bạn nghe xong, không hỏi thêm.`, k: 'info' } : { t: `Nghe nói ${nm(p)} đóng cửa, không nhận ai nữa. Cái sân tập năm xưa giờ cỏ mọc lút gót. Người qua đường bảo đêm đêm đèn trong nhà thầy vẫn sáng muộn.`, k: 'info' };
        if (ok) { X.gain(msSkill(a), 4); X.addXp(100); return { t: `${nm(p)} giao cho bạn một việc thầy chưa từng giao cho ai. Bạn làm suốt mấy đêm, xong trước hạn. Thầy xem đi xem lại, rồi đặt xuống, không nói gì. Hôm sau thầy bắt đầu dạy bạn những bài chưa từng dạy ai.`, k: 'good', bond: 15 }; }
        return { t: `${nm(p)} giao cho bạn một việc lớn. Bạn làm hỏng ở bước cuối, chỉ vì vội. Thầy phải ngồi làm lại suốt ba ngày, không trách một câu. Thầy càng im, bạn càng nóng mặt.`, k: 'bad', bond: -5 };
      } },
    climax: { title: 'Thầy già rồi',
      body: (S, X, a, p) => (a.d.kind !== 'craft' ? `Một kẻ thù cũ của ${nm(p)} tới thách đấu, đứng giữa sân gọi tên thầy. Thầy đã già, tay cầm kiếm run. Đứng sau lưng thầy, bạn thấy rõ đôi vai gồng lên mà không thẳng được nữa. Kẻ kia nhìn qua vai thầy, nhìn thẳng vào bạn.` : `${nm(p)} lâm bệnh nặng giữa mùa đông, đúng lúc xưởng nhận một mối hàng lớn. Thầy nằm ho trong buồng, lò ngoài xưởng đã tắt hai hôm. Người đặt hàng ngày nào cũng cho người tới hỏi. Hạn giao hàng thì không chờ ai.`),
      choices: (S, X, a, p) => (a.d.kind !== 'craft' ? [ch('stand', 'Thay thầy ra đấu', `Đối thủ ngang tầm thầy thời trẻ. Khả năng thắng chừng ${pct(vs(S, X, p, -.2, .15, .85))}.`), ch('watch', 'Để thầy tự đấu', 'Đó là chuyện của thầy.')]
        : [ch('stay', 'Ở lại chăm thầy, gánh cả xưởng', 'Mất một năm làm ăn của riêng mình.'), ch('left', 'Đi tiếp đường mình', 'Thầy có người nhà.')]),
      apply(S, X, ch, a, p) {
        if (ch === 'stand') { if (X.rnd() < vs(S, X, p, -.2, .15, .85)) { fame(S, 2); bond(p, 30); return { t: 'Bạn bước ra đứng trước thầy. Trận đấu dài, mồ hôi chảy cay cả mắt, có lúc bạn tưởng mình đã thua. Rồi bạn thắng. Kẻ kia nhìn bạn, nhìn thầy, rồi bỏ đi, không quay lại.', o: 'stood' }; }
          X.add('hl', -10); bond(p, 25); return { t: 'Bạn bước ra đứng trước thầy. Kẻ kia mạnh hơn bạn tưởng, ba hiệp sau bạn đã nằm dưới đất. Bạn thua, nhưng kẻ kia cũng đuối sức, đứng thở dốc một lúc rồi bỏ đi, không còn sức thách thầy nữa. Đêm ấy thầy tự tay bôi thuốc cho bạn.', o: 'fell' }; }
        if (ch === 'stay') { X.money(-Math.round(med(S, X) * .3)); bond(p, 30); X.add('h', 2); return { t: 'Bạn sắc thuốc cho thầy, đêm về nhóm lại lò, làm nốt mối hàng. Mấy tuần liền bạn chỉ ngủ chừng hai canh giờ mỗi đêm. Hàng giao đúng hẹn, có dấu của thầy. Nằm trong buồng nghe tiếng búa ngoài xưởng, thầy khẽ cười.', o: 'stayed' }; }
        bond(p, -20); return { t: `Bạn đi. ${ch === 'watch' ? 'Thầy thắng, nhưng lúc bước ra khỏi sân, thầy không nhìn bạn. Mồ hôi còn đọng trên trán, tay cầm kiếm vẫn run.' : 'Thầy không giữ, chỉ bảo người nhà gói cho bạn ít lương khô. Lúc bạn đi, cửa buồng thầy vẫn đóng.'}`, o: 'apart' };
      },
      auto: (S, X, a) => (a.d.kind !== 'craft' ? (S.traits.bold > .5 || S.traits.social > .45 ? 'stand' : 'watch') : S.traits.social > .45 ? 'stay' : 'left'),
      bg: (S, X, a, p) => (a.d.ok ? { t: `${nm(p)} truyền hết sở học cho người học trò mới. Người ta kể lễ truyền nghề làm ngay ở cái sân năm xưa bạn từng tập. Bạn không được mời. Cũng phải thôi.`, o: 'other_heir' } : { t: `${nm(p)} già yếu, không còn ai theo học. Thầy ngồi trước hiên cả ngày, nhìn ra đường. Có người bảo thầy hay hỏi thăm một đứa học trò cũ đã đi xa.`, o: 'alone' }) },
    end(S, X, a, p, o) {
      if (a.d.bg || o === 'apart') return o;
      if (a.d.path === 'own' && a.d.ok) return 'own_way';
      return o === 'stood' && !a.d.ok ? 'stood' : 'heir';
    },
    after: {
      heir: (S, X, a, p) => { kill(S, p); X.gain(msSkill(a), 6); X.addXp(100);
        return { t: `Thầy ${nm(p)} mất, để lại cho bạn bộ bút ký ghi chú tới trang cuối.${a.d.kind !== 'craft' ? ' Trang đầu chỉ có một dòng: "Cho đứa dám đứng ra thay ta."' : ''} Những trang về sau chữ thầy run dần, nhưng không bỏ trang nào. Bạn đọc hết trong một đêm, rồi lật lại đọc từ đầu.`, k: 'big' }; },
      own_way: (S, X, a, p) => { kill(S, p); skill(S, X, 6); fame(S, 3); return { t: `Thầy ${nm(p)} mất. Trong thư để lại có câu: "Ngươi học ta để rồi đi khác ta. Thế là đúng." Thì ra những đêm bạn lén mày mò, thầy biết cả. Bạn mở lớp, dạy theo lối của mình, nhưng bài đầu tiên vẫn là bài của thầy.`, k: 'big' }; },
      stood: (S, X, a, p) => { kill(S, p); X.addXp(80); return { t: `Thầy ${nm(p)} mất trong giấc ngủ, mặt nhẹ nhõm. Ở đám tang, đệ tử các nhà khác cúi chào bạn trước khi chào linh cữu. Ai cũng còn nhớ hôm bạn bước ra đứng trước thầy. Bạn đứng ở hàng đầu, lưng thẳng như thầy từng dạy.`, k: 'good' }; },
      apart: (S, X, a, p) => { kill(S, p); X.add('h', -6); return { t: `Bạn nghe tin thầy ${nm(p)} mất khi đang ở xa, tin tới chậm cả tháng. Bộ bút ký của thầy về tay người khác. Đêm ấy bạn thắp một nén hương hướng về phía quê thầy. Khói bay ngang, không lên thẳng được.`, k: 'bad' }; },
      other_heir: (S, X, a, p) => { kill(S, p); return { t: 'Có lần bạn gặp người học trò ấy ở chợ. Người đó dùng đúng thế thầy dạy bạn năm xưa, thuần hơn bạn, tròn hơn bạn. Bạn đứng xem hết, rồi lặng lẽ bỏ đi trước khi người ấy kịp quay lại.', k: 'bad' }; },
      alone: (S, X, a, p) => { kill(S, p); return { t: 'Thầy mất, sở học thất truyền. Những gì thầy dạy, bạn nhớ được một nửa; nửa còn lại bạn tự tìm, trên đường. Có những đêm ở quán trọ xa, bạn ngồi tập lại bài đầu tiên thầy dạy. Đầu đã quên nhiều, tay thì vẫn nhớ.', k: 'info' }; }
    } });

  // ── Nợ cờ bạc (a.d: amt, loc) ──
  full('debt', { nameVi: 'Nợ cờ bạc', good: ['clean', 'broke_free', 'lucky'],
    quest: (a, p) => `Thoát khỏi món nợ với ${nm(p)}`,
    marks: { clean: 'giu_loi', broke_free: 'duoc_tin', lucky: 'cua_phi_nghia', tied: 'ke_tiem_quyen', beaten: 'ke_thu', fled: 'nguoi_la', ruined: 'tay_trang' },
    sum: { clean: () => 'trả sạch một món nợ cờ bạc và không bao giờ đụng lại', broke_free: (d, p) => `tố giác sòng bạc của ${nm(p)}, thoát nợ`, lucky: (d, p) => `gỡ được một ván lớn ở sòng ${nm(p)}`,
      tied: (d, p) => `dính vào ${nm(p)} cả đời vì một món nợ cờ bạc`, beaten: () => 'bị đánh vì một món nợ cờ bạc', fled: () => 'bỏ xứ mà đi vì một món nợ cờ bạc', ruined: () => 'nướng sạch cơ nghiệp vào chiếu bạc' },
    gone: (S, p) => `Tin ${nm(p)}, chủ nợ của bạn, chết trong một vụ ẩu đả. Sổ nợ cháy theo. Bạn nghe tin, thấy nhẹ cả người, rồi lại thấy ngượng vì mình đã nhẹ người.`,
    beat: { any: ['Bạn đi đường vòng để khỏi ngang qua sòng của {p}, xa thêm cả nửa canh giờ.', 'Đêm ấy bạn lại mơ thấy tiếng xúc xắc lăn trong bát. Tỉnh dậy, tay còn nắm chặt.', 'Bạn đếm lại số tiền còn nợ {p}. Lãi mẹ đẻ lãi con, đếm mãi không thấy hết.'] },
    acts: acts({ open: { wait: [0, 4] }, knot: { prio: 8, wait: [1, 6] } }),
    open: (S, X, a, p) => { a.d.due = Math.round(a.d.amt * 1.5); return { t: `Người của ${nm(p)} ghé nhà, ngồi chễm chệ trên ghế như khách quen. Món nợ giờ đã là ${G.coin(a.d.due)}, cả gốc lẫn lãi. Hắn uống cạn bát nước bạn rót, rồi đứng dậy, không quên liếc quanh nhà như đang định giá từng món.`, k: 'bad' }; },
    knot: { title: 'Chủ nợ', body: (S, X, a, p) => `Người của ${nm(p)} tới đòi ${G.coin(a.d.due)}. Hạn cuối là trăng tròn. Đêm nào bạn cũng nhìn lên trời, thấy vầng trăng đầy thêm một chút. Ván bạc năm ấy, giờ nghĩ lại chỉ thấy đắng miệng.`,
      choices: (S, X, a, p) => [...(S.gold >= a.d.due ? [ch('pay', 'Trả', `Mất ${G.coin(a.d.due)}.`)] : []), ch('job', `Làm một việc cho ${nm(p)}`, 'Chở một kiện hàng, không được hỏi bên trong là gì.'),
        ch('gamble', 'Gỡ một ván lớn', 'Thắng thì sạch nợ.'), ch('flee', 'Trốn', 'Bỏ đi nơi khác.')],
      apply(S, X, ch, a, p) {
        if (ch === 'pay') { X.money(-a.d.due); X.add('h', -4); return `Bạn trả đủ, không thiếu một đồng, đếm từng đồng ngay trước mặt người của ${nm(p)}. Túi tiền dành dụm bấy lâu giờ lép kẹp. Hắn cầm tiền, cười nhạt: "Lần sau lại tới nhé." Bạn đóng cửa sau lưng hắn.`; }
        if (ch === 'job') { G.trajBump(S, { am: .4 }); return 'Bạn chở kiện hàng qua cổng thành, tim đập như trống. Kiện hàng nặng hơn bạn tưởng, có lúc như có gì cựa bên trong. Bạn nhìn thẳng phía trước, không dám ngoái lại.'; }
        if (ch === 'gamble') { G.trajBump(S, { am: .2 }); return 'Bạn quay lại sòng, ngồi đúng chỗ cũ. Mùi rượu, mùi mồ hôi, tiếng xúc xắc, vẫn y như đêm ấy. Người cầm cái nhìn bạn, cười như đón người quen.'; }
        S.flags.migrateQ = 'Chủ nợ đang tìm bạn.'; a.d.loc = S.loc; return 'Bạn gói ghém đồ đạc trong đêm, chỉ mang những gì vác được. Cửa nhà khép lại, không khóa. Gà gáy thì bạn đã ở bên kia đồi, đi trong tối, không dám đốt đuốc.';
      },
      auto: (S, X, a) => (S.gold >= a.d.due ? 'pay' : S.traits.bold > .7 ? 'gamble' : S.traits.bold > .55 ? 'flee' : 'job') },
    trial: { base: (S, X, a) => ({ pay: .75 - .3 * S.traits.bold, job: .7, gamble: .35, flee: .5 }[a.d.path] ?? .5),
      run(S, X, a, ok, p) {
        if (a.d.path === 'pay') return ok ? { t: 'Một năm trôi qua, bạn không bước vào sòng lần nào. Có những tối tay ngứa ngáy, bạn ra sân bổ củi tới khi mỏi rã. Đống củi sau nhà cao dần.', k: 'good' } : { t: 'Một đêm buồn, bạn lại ngồi xuống chiếu bạc. Chỉ một ván, bạn tự nhủ. Rồi thêm một ván nữa. Về tới nhà thì trời đã rạng, bạn không dám nhìn mặt ai.', k: 'bad' };
        if (a.d.path === 'job') { if (ok) return { t: 'Không ai mở kiện hàng ra xem. Người lính gác chỉ phẩy tay cho qua, mắt còn díp lại vì buồn ngủ. Nợ giảm một nửa. Bên trong kiện hàng có gì, bạn không bao giờ biết, mà cũng chẳng muốn biết.', k: 'info' }; cnt(S, 'crimes'); X.add('so', -6); return { t: 'Lính tuần mở kiện hàng ngay cổng thành. Bạn khai không biết gì, mà đúng là bạn không biết gì; họ vẫn ghi tên bạn vào sổ. Người đứng xem xì xào. Ra khỏi cổng, bạn mới thấy hai đầu gối run.', k: 'bad' }; }
        if (a.d.path === 'gamble') { if (ok) { X.money(a.d.due); return { t: `Ván ấy bạn thắng. Cả sòng im phăng phắc nhìn ${nm(p)} đếm tiền trả bạn, từng đồng một, mặt không đổi sắc. Bạn nhét tiền vào áo, đi ra cửa. Sau lưng có tiếng ai đó huýt sáo.`, k: 'good' }; }
          X.money(-Math.round(Math.max(0, S.gold) * .3)); a.d.due = Math.round(a.d.due * 1.5); return { t: 'Ván ấy bạn thua. Bát xúc xắc mở ra, cả sòng ồ lên một tiếng. Nợ cũ chưa trả, nợ mới đã chồng lên. Bạn đi về trong đêm, chân nặng như đeo chì.', k: 'bad' }; }
        return ok ? { t: `Ở ${regName(S.loc)} không ai biết tên ${nm(p)}. Bạn thuê một gian nhà nhỏ, làm thuê kiếm sống. Lần đầu sau bao lâu, bạn ngủ một mạch tới sáng.`, k: 'info' } : { t: `Một người lạ hỏi thăm bạn ở chợ, hỏi tên, hỏi quê. Bạn nhận ra ánh mắt ấy: người của ${nm(p)}. Đêm ấy bạn không chợp mắt, ngồi nghe từng tiếng động ngoài cửa.`, k: 'bad' };
      } },
    climax: { title: 'Gặp lại chủ nợ',
      body: (S, X, a, p) => `${nm(p)} tự tìm tới, lần này mỉm cười: "${a.d.path === 'pay' && a.d.ok ? 'Lâu không thấy ngươi ở sòng. Ngồi một ván cho vui?' : 'Ta có việc cuối cùng cho ngươi. Xong thì sổ nợ xóa.'}" Nụ cười ấy bạn từng thấy ở sòng, ngay trước khi có người mất trắng. Ngoài cửa, hai gã to con đứng chờ.`,
      choices: (S, X, a, p) => [ch('end', `Tố giác sòng của ${nm(p)}`, `Chừng ${pct(G.clamp(.3 + .15 * G.standing(S, X).soc + S.fame / 200, .1, .8))} quan làm thật.`),
        ch('deal', a.d.path === 'pay' && a.d.ok ? 'Từ chối, đóng cửa' : 'Làm việc cuối cùng', a.d.path === 'pay' && a.d.ok ? '' : 'Việc gì thì không ai nói.'), ch('play', 'Ngồi xuống chiếu bạc', 'Một ván lớn.')],
      apply(S, X, ch, a, p) {
        if (ch === 'end') { if (X.rnd() < G.clamp(.3 + .15 * G.standing(S, X).soc + S.fame / 200, .1, .8)) { X.add('so', 5); return { t: `Lính phủ ập vào sòng giữa đêm, đuốc sáng rực cả con phố. ${nm(p)} bị giải đi; sổ nợ bị đốt trước cổng phủ. Bạn đứng trong đám đông xem lửa bén từng trang. Trang nào mang tên mình, bạn không biết, chỉ thấy tro bay.`, o: 'broke_free' }; }
          X.add('hl', -15); X.cond('wound'); return { t: `Quan đã ăn tiền của ${nm(p)} từ lâu, lá đơn của bạn đi thẳng tới tay hắn. Đêm ấy người của ${nm(p)} tìm được bạn trong một con hẻm. Bạn nằm đó tới sáng, mới có người qua đường đỡ dậy.`, o: 'beaten' }; }
        if (ch === 'deal') { if (a.d.path === 'pay' && a.d.ok) { X.add('h', 4); return { t: `Bạn đóng cửa. ${nm(p)} cười, đứng ngoài một lúc, rồi đi. Không quay lại. Bạn tựa lưng vào cánh cửa, nghe tim mình đập chậm dần.`, o: 'clean' }; }
          G.trajBump(S, { am: .3 }); X.money(Math.round(med(S, X) * .3)); return { t: `Bạn làm, không hỏi. Sổ nợ xóa, nhưng từ đó tên bạn nằm trong một cuốn sổ khác của ${nm(p)}. Cuốn sổ ấy không ghi tiền. Nó ghi những việc bạn đã làm.`, o: 'tied' }; }
        if (X.chance(.4)) { X.money(Math.round(med(S, X) * 1.5)); return { t: 'Ván ấy bạn thắng lớn, tiền đổ ra tràn chiếu. Cả sòng nín thở. Bạn gom tiền, đứng dậy, không ngoái lại. Ra tới đường, gió đêm thổi lạnh mà lưng áo bạn ướt sũng.', o: 'lucky' }; }
        X.money(-Math.round(Math.max(0, S.gold) * .7)); return { t: 'Ván ấy bạn thua sạch: tiền, đất, cả cái nhẫn cưới. Bạn ngồi nhìn bát xúc xắc rất lâu, như chờ nó tự lật lại. Người ta phải dìu bạn ra khỏi sòng.', o: 'ruined' };
      },
      auto: (S, X, a) => (a.d.path === 'pay' && a.d.ok ? 'deal' : S.traits.bold > .65 ? 'play' : S.traits.pious > .5 ? 'end' : 'deal') },
    end(S, X, a, p, o) { if (a.d.path === 'flee' && o === 'tied') return a.d.ok ? 'fled' : 'beaten'; return o; },
    after: {
      clean: () => ({ t: 'Bạn thề không đụng tới xúc xắc nữa. Lời thề giữ được tới cuối đời. Có lần đứa cháu nhỏ mang bộ xúc xắc vào nhà chơi, bạn lặng lẽ cầm lấy, ra vườn chôn đi. Cả nhà không hiểu, bạn cũng không giải thích.', k: 'good' }),
      broke_free: () => ({ t: 'Mấy nhà trong xóm cũng thoát nợ nhờ vụ ấy. Họ mang gà, mang rượu tới cảm ơn, chất đầy cả hiên. Có bà cụ nắm tay bạn khóc, bảo con trai bà nhờ thế mà được về nhà. Tối ấy cả xóm uống rượu tới khuya.', k: 'big' }),
      lucky: () => ({ t: 'Bạn chuộc lại đồ đã cầm, rồi không bao giờ quay lại sòng. Người ta bảo bạn may. Bạn biết là may. Mỗi lần nghĩ tới ván ấy, gáy bạn vẫn lạnh toát.', k: 'good' }),
      tied: (S, X, a, p) => { G.trajBump(S, { am: .2 }); return { t: `${nm(p)} lại ghé, lần này với một "việc nhỏ" khác. Rồi một việc nữa, lại một việc nữa. Bạn hiểu mình sẽ chẳng bao giờ trả xong. Tiếng gõ cửa lúc khuya, từ đó bạn nghe là biết ngay của ai.`, k: 'bad' }; },
      beaten: (S, X, a) => { X.money(-Math.min(Math.max(0, S.gold), a.d.due || 0)); return { t: 'Vết thương lành, nhưng mỗi lần trở trời, bạn lại nhớ cái giá của một ván bạc. Món nợ cũ rốt cuộc vẫn phải trả. Bạn đếm đi đếm lại chỗ tiền còn lại, rồi cất vào nơi không ai biết.', k: 'bad' }; },
      fled: () => ({ t: 'Bạn từ chối việc cuối cùng, gói đồ đi tiếp. Ở đất mới, bạn vẫn giật mình mỗi lần có người lạ hỏi tên. Bạn tập trả lời bằng một cái tên khác, tập mãi tới khi quen miệng.', k: 'info' }),
      ruined: () => ({ t: 'Bạn bắt đầu lại từ hai bàn tay trắng. Người làng thôi gọi bạn là ông chủ. Sáng sáng bạn vác cuốc đi làm thuê, qua cái sòng cũ mà không ngẩng lên.', k: 'bad' })
    } });

  // ── Bí mật (a.d.type: tax / dark / gate) ──
  const secVi = { tax: 'Chuyện tiền thuế', dark: 'Chuyện bọc vải đen', gate: 'Chuyện đoàn xe không đèn' };
  full('secret', { nameVi: 'Bí mật', good: ['exposed', 'hero', 'favor', 'win'],
    quest: () => 'Giữ hay nói điều đã thấy',
    marks: { hero: 'duoc_tin', exposed: 'ke_thu', backfire: 'tieng_xau', deal: 'che_cho', win: 'cua_phi_nghia', lose: 'cay_dang', favor: 'no_on', caught: 'tiec_nuoi', buried: 'buong_bo' },
    sum: { hero: (d, p) => `đưa đủ chứng cứ, vạch mặt ${nm(p)} trước cả vùng`, exposed: (d, p) => `vạch mặt ${nm(p)}`, backfire: (d, p) => `tố giác ${nm(p)} mà không ai tin`,
      deal: (d, p) => `đổi bí mật của ${nm(p)} lấy một chỗ dựa`, win: (d, p) => `sống sót sau khi tống tiền ${nm(p)}`, lose: (d, p) => `trả giá vì tống tiền ${nm(p)}`,
      favor: (d, p) => `giữ kín chuyện của ${nm(p)} và được đền đáp`, caught: (d, p) => `im lặng, để người khác vạch mặt ${nm(p)}`, buried: (d, p) => `đốt chứng cứ về ${nm(p)}, chôn chuyện ấy theo mình` },
    beat: { any: ['Bạn chép lại những gì đã thấy vào một tờ giấy, gấp nhỏ, giấu dưới viên gạch lỏng cạnh bếp.', '{p} nhìn bạn ở chợ lâu hơn nhìn mọi người. Bạn cúi xuống chọn rau, tay hơi run.', 'Bạn để ý ai ra vào nhà {p} lúc nửa đêm. Đèn bên ấy bao giờ cũng tắt muộn hơn mọi nhà.'] },
    acts: acts({ open: { st: ADE, wait: [0, 4] } }),
    open: (S, X, a, p) => ({ t: `${ref(S, p)} hình như biết bạn đã thấy. Mấy hôm liền, ${nm(p)} cho người đứng ở đầu ngõ nhà bạn, giả vờ sửa cái quang gánh mãi không xong. Bạn đi chợ, có tiếng chân theo sau. Bạn về, cái bóng ấy vẫn còn đứng đó.`, k: 'info', bond: -5 }),
    knot: { title: 'Điều đã thấy', body: (S, X, a, p) => `${secVi[a.d.type] || 'Chuyện đêm ấy'} vẫn nằm trong bụng bạn. Mỗi lần ${nm(p)} đi ngang, cổ họng bạn lại nghẹn. Nói ra thì cần chứng cứ; giữ lại thì cũng là một món hàng. Mà món hàng này, người muốn mua cũng chính là người muốn bạn câm.`,
      choices: () => [ch('dig', 'Tìm thêm chứng cứ', 'Lâu và nguy hiểm.'), ch('black', 'Đòi tiền để im lặng', 'Có tiền ngay; kẻ bị tống tiền không bao giờ quên.'), ch('away', 'Quên chuyện đó đi', 'Không phải việc của mình.')],
      apply(S, X, ch, a, p) {
        if (ch === 'dig') { G.trajBump(S, { vo: .1 }); return `Bạn bắt đầu để ý giờ giấc của ${nm(p)}, ghi lại từng chuyến đi, từng người ghé nhà. Tờ giấy dưới viên gạch dày lên thành một xấp. Đêm nào bạn cũng giở ra đọc lại, rồi cất về chỗ cũ.`; }
        if (ch === 'black') { const g = Math.round(med(S, X) * 1.2); X.money(g); G.trajBump(S, { am: .3 }); return `${nm(p)} trả ${G.coin(g)}, không nhìn vào mắt bạn. Túi tiền đặt xuống bàn kêu một tiếng nặng trịch. Lúc quay đi, ${nm(p)} nói khẽ, như nói với chính mình: "Nhớ đấy." Bạn đếm tiền tới ba lần mà vẫn không thấy vui.`; }
        X.add('h', 2); return 'Bạn không nói với ai, kể cả người trong nhà. Chuyện ấy bạn cất đi như cất một hòn than còn đỏ. Ban ngày thì quên được. Đêm thì không hẳn.';
      },
      auto: S => (S.traits.pious > .6 || S.traits.bold > .7 ? 'dig' : sh(S, 'am') + sh(S, 'thuong') > .2 ? 'black' : 'away') },
    trial: { base: (S, X, a, p) => (a.d.bg ? .5 : a.d.path === 'dig' ? .45 + .2 * S.traits.studious : vs(S, X, p, .2, .2, .9)),
      run(S, X, a, ok, p) {
        if (a.d.bg) return ok ? { t: `${nm(p)} lên chức. Từ đó gặp bạn ở đâu cũng gật đầu chào trước, chào lâu hơn chào người khác. Bạn đáp lễ rồi đi tiếp. Hai người hiểu nhau mà không cần nói.`, k: 'info', bond: 10 } : { t: 'Có người khác cũng thấy những gì bạn thấy, và người đó không im lặng. Bạn nghe phong thanh cả vùng đang xì xào. Mấy đêm liền, bạn nằm nghe ngóng xem có ai gõ cửa.', k: 'info' };
        if (a.d.path === 'dig') return ok ? { t: 'Bạn có trong tay một cuốn sổ ghi chép, đủ để treo cổ một người: từng ngày, từng chuyến hàng, từng cái tên. Bạn khâu nó vào lớp lót áo, đi đâu cũng mang theo. Nặng chẳng bao nhiêu, mà vai lúc nào cũng thấy trĩu.', k: 'good' } : (X.add('hl', -8), { t: `Người của ${nm(p)} bắt gặp bạn rình quanh nhà kho. Bạn chạy được, mất một chiếc giày và nửa tháng nằm nhà. Chiếc giày ấy, bạn đoán, giờ đang nằm trên bàn của ${nm(p)}.`, k: 'bad' });
        if (ok) { X.money(Math.round(med(S, X) * .5)); return { t: `${nm(p)} gửi người tới giữa đêm. Bạn tỉnh giấc với lưỡi dao kề cổ, vặn được tay hắn, đạp hắn văng ra cửa. Sáng ra ${nm(p)} gửi thêm một bao tiền, không kèm lời nào. Bạn hiểu đó là lời xin hòa, mà cũng là lời cảnh cáo.`, k: 'good', bond: -10 }; }
        X.add('hl', -18); X.cond('wound'); X.money(-Math.round(Math.max(0, S.gold) * .5)); return { t: `${nm(p)} gửi người tới giữa đêm. Họ lấy lại số tiền cũ, cả lãi, và để lại một vết sẹo chạy dọc cánh tay. Trước khi đi, một gã cúi xuống thì thầm: "Lần sau là cổ." Bạn nằm trong bóng tối tới sáng, không dám thắp đèn.`, k: 'bad', bond: -10 };
      } },
    climax: { title: 'Lật bài',
      body: (S, X, a, p) => `${nm(p)} sắp lên một chức cao hơn. Sau ngày ấy, không ai đụng tới ${nm(p)} được nữa. ${a.d.path === 'dig' && a.d.ok ? 'Cuốn sổ khâu trong lót áo hôm nay nặng hơn mọi ngày.' : a.d.path === 'black' ? (a.d.ok ? 'Bao tiền thứ hai vẫn nằm dưới gầm giường, chưa tiêu một đồng.' : 'Vết sẹo trên tay bạn ngứa ran mỗi lần nghe tên người ấy.') : 'Những gì bạn biết chỉ còn ít ngày nữa là hết giá.'} Cả vùng đang sửa soạn lễ mừng.`,
      choices: (S, X, a, p) => [ch('expose', 'Tố giác', `Chừng ${pct(G.clamp(.3 + .15 * G.standing(S, X).soc + S.fame / 200 + (a.d.path === 'dig' && a.d.ok ? .3 : 0), .1, .9))} người ta tin.`),
        ch('deal', 'Đổi bí mật lấy một chỗ dựa', `${nm(p)} lên chức thì bạn cũng có người che chở.`), ch('bury', 'Đốt hết, im lặng', 'Chuyện ấy theo bạn xuống mồ.')],
      apply(S, X, ch, a, p) {
        if (ch === 'expose') { if (X.rnd() < G.clamp(.3 + .15 * G.standing(S, X).soc + S.fame / 200 + (a.d.path === 'dig' && a.d.ok ? .3 : 0), .1, .9)) { fame(S, 4); X.add('so', 5); p.tier = 0; return { t: 'Phủ cho người xuống tra. Lời bạn khớp với sổ sách, từng ngày, từng chuyến. Người ta mở kho, khiêng ra những thứ mà cả vùng xưa nay chỉ dám đoán. Bạn đứng ở cổng phủ tới chiều, chân mỏi nhừ mà không muốn về.', o: 'exposed' }; }
          X.add('so', -5); X.add('h', -5); return { t: `Không ai tin bạn. Quan nhìn bạn như nhìn kẻ ghen ăn tức ở, còn ${nm(p)} đứng bên cạnh, mỉm cười độ lượng. Bạn ra về giữa những tiếng cười khẩy.`, o: 'backfire' }; }
        if (ch === 'deal') { bond(p, 20); G.trajBump(S, { am: .2 }); return { t: `${nm(p)} nghe xong, im lặng rất lâu, rồi gật đầu: "Ngươi khôn hơn ta tưởng." Hai người không bắt tay. Từ hôm ấy, hai nhà như buộc chung một sợi thừng, ai kéo mạnh thì người kia cũng ngã.`, o: 'deal' }; }
        X.add('h', 2); return { t: `Bạn đốt tờ giấy dưới viên gạch, nhìn tro bay. ${a.d.path === 'dig' ? 'Cả xấp ghi chép bao lâu nay cháy chưa hết một chén trà.' : 'Mấy dòng chữ cong queo cháy rất nhanh.'} Rồi bạn đặt viên gạch về chỗ cũ, phủi tay. Chuyện ấy từ giờ chỉ còn trong đầu bạn.`, o: 'buried' };
      },
      auto: (S, X, a) => (S.traits.pious > .6 || (a.d.path === 'dig' && a.d.ok) ? 'expose' : sh(S, 'am') > .2 ? 'deal' : 'bury'),
      bg: (S, X, a, p) => (a.d.ok ? { t: `${nm(p)} lên chức như dự tính, lễ mừng kéo dài ba ngày. Có người mang tới nhà bạn một vò rượu ngon, nói là quà của quan. Bạn đặt vò rượu lên gác, không mở.`, o: 'favor' } : { t: `${nm(p)} bị bắt ngay trước ngày lên chức. Người tố giác là một kẻ bạn chưa từng gặp. Bạn đứng trong đám đông nhìn xe tù đi qua. ${nm(p)} lướt mắt qua bạn, không dừng lại.`, o: 'caught' }) },
    end(S, X, a, p, o) {
      if (a.d.bg) return o;
      if (a.d.path === 'black' && o === 'buried') return a.d.ok ? 'win' : 'lose';
      if (o === 'exposed' && a.d.path === 'dig' && a.d.ok) return 'hero';
      return o;
    },
    after: {
      hero: () => ({ t: 'Người ta kể chuyện cuốn sổ của bạn ở mọi quán rượu trong vùng, mỗi nơi thêm thắt một kiểu. Lần sau có chuyện mờ ám, người ta tìm bạn trước khi tìm quan. Cửa nhà bạn chẳng mấy khi đóng. Có đêm khuya vẫn có người rón rén gõ, tay cầm một tờ giấy gấp nhỏ.', k: 'big' }),
      exposed: (S, X, a, p) => ({ t: `${nm(p)} bị cách chức. Dân làng mời bạn rượu, ra chợ có người vỗ vai. Nhưng từ đó cũng có người đi đường vòng để khỏi phải chào bạn. Nhà nào cũng có một hai chuyện không muốn người ngoài thấy.`, k: 'good' }),
      backfire: (S, X, a, p) => { const f = Math.round(med(S, X) * .3); X.money(-f); return { t: `${nm(p)} vẫn ngồi ghế cũ, mà ghế còn cao hơn trước. Bạn bị gọi lên phủ hỏi chuyện ba lần, mất tiền trà nước cộng lại ${G.coin(f)}. Lần cuối bước ra khỏi phủ, bạn thôi không ngoái lại nhìn cái cổng ấy nữa.`, k: 'bad' }; },
      deal: () => ({ t: 'Năm có lệnh bắt phu, tên bạn không có trong danh sách. Năm thuế nặng, nhà bạn được hoãn. Bạn biết vì sao, và không hỏi. Chỉ có điều, mỗi lần quan về làng, bạn là người đứng hàng đầu cúi chào.', k: 'info', bond: 10 }),
      win: () => ({ t: 'Số tiền ấy bạn tiêu không hết, mà cũng không vui khi tiêu. Mua gì, bạn cũng nhớ tới lưỡi dao kề cổ đêm nào. Rốt cuộc phần lớn nằm yên dưới đáy rương.', k: 'info' }),
      lose: () => ({ t: 'Mỗi lần thấy người lạ đứng đầu ngõ, bạn lại sờ vết sẹo. Tiền tống được, rốt cuộc mất cả gốc lẫn lãi. Bạn cài then cửa sớm hơn mọi nhà trong xóm.', k: 'bad' }),
      favor: (S, X, a, p) => { X.money(Math.round(med(S, X) * .3)); return { t: `${nm(p)} lên chức, gặp bạn ở đâu cũng gật đầu chào. Năm có lệnh bắt phu, tên bạn không có trong danh sách. Năm ấy còn có người mang tiền tới, bảo là tiền công một việc bạn chẳng nhớ đã làm. Sự im lặng của bạn, thì ra cũng có giá.`, k: 'good', bond: 15 }; },
      caught: () => ({ t: 'Bạn đã biết trước cả năm. Bạn tự hỏi nếu mình nói, mọi chuyện có khác không. Người tố giác giờ được cả vùng nhắc tên. Bạn nghe, rồi lặng lẽ đi về.', k: 'bad' }),
      buried: () => ({ t: 'Có những điều bạn mang theo tới cuối đời. Chuyện ấy là một. Viên gạch lỏng cạnh bếp, bạn đã trát vữa lại từ lâu, vậy mà đôi lúc vẫn liếc nhìn.', k: 'info' })
    } });

  // ── Mộng ước (người đi đường bạn theo suốt ba ngày hồi nhỏ; a.d.school) ──
  const idSkill = a => (a.d.school && J.schools[a.d.school] ? J.schools[a.d.school].masteries[0] : 'Body');
  full('idol', { nameVi: 'Mộng ước', good: ['surpass', 'taught', 'kind', 'legend'],
    quest: (a, p) => `Đi tới chỗ ${nm(p)} từng đứng`,
    marks: { surpass: 'cao_thu', taught: 'chan_truyen', kind: 'ban_cu', thanked: 'buong_bo', bested: 'cay_dang', legend: 'ke_di_xa', faded: 'tiec_nuoi' },
    sum: { surpass: (d, p) => `đứng ngang hàng ${nm(p)}, người mình theo suốt ba ngày hồi nhỏ`, taught: (d, p) => `được ${nm(p)} chỉ cho một thế`, kind: (d, p) => `cưu mang ${nm(p)}, người trong mộng ước, lúc người ấy sa cơ`,
      thanked: (d, p) => `nói được lời cảm ơn với ${nm(p)}`, bested: (d, p) => `đấu thử với ${nm(p)} và hiểu đường mình còn xa`, legend: (d, p) => `nghe kể về ${nm(p)} cả đời như nghe kể chuyện cổ tích`, faded: (d, p) => `để giấc mơ về ${nm(p)} lụi đi` },
    gone: (S, p) => `Lữ khách kể ${refE(S, p)} đã ngã xuống ở một chiến trường xa. Bạn nhớ ba ngày lẽo đẽo theo sau năm ấy, bụi đường bám đầy chân mà lòng nhẹ tênh. Đêm ấy bạn tập lại cái thế người ấy từng dùng, chậm rãi, từ đầu tới cuối.`,
    beat: { any: ['Bạn tập lại thế {p} dùng năm ấy, lần thứ một nghìn. Tay đã quen, chân vẫn chưa đúng hẳn.', 'Có người kể chuyện {p} ở quán. Bạn ngồi nghe hết, không chen một câu, bát rượu nguội lúc nào không hay.', 'Bạn vẽ lại hình {p} cưỡi ngựa qua làng, treo ở đầu giường. Nét vẽ vụng, nhưng con ngựa thì rất giống.'] },
    acts: acts({ open: { st: TA, wait: [2, 15] }, climax: { st: ADE, when: (S, X) => ADE.includes(X.stage(S)) } }),
    open: (S, X, a, p) => ({ t: `Tin về ${ref(S, p)} bay về tới làng: ${X.pick(['một trận thắng ở biên giới', 'một con quái lớn bị hạ', 'một chức mới ở kinh đô'])}. Bạn kể lại cho lũ bạn ba lần trong một ngày, lần sau hào hứng hơn lần trước. Tới đứa kiên nhẫn nhất cũng bỏ đi. Bạn nằm trên đống rơm, kể tiếp cho chính mình nghe.`, k: 'info' }),
    knot: { title: 'Theo dấu người trong mộng', body: (S, X, a, p) => `Bạn đã đủ lớn để đi xa. Nghe nói ${nm(p)} đang ở ${regName(p.loc)}. Hình người cưỡi ngựa qua làng năm ấy vẫn rõ như in, cả bụi đường lẫn tiếng vó. Bao nhiêu năm, giấc mơ ấy chưa chịu nhỏ đi.`,
      choices: (S, X, a, p) => [ch('follow', `Lên đường tìm ${nm(p)}`, 'Xin học, hoặc chỉ để được thấy một lần.'), ch('same', 'Theo cùng nghề, tự học', 'Đi đúng con đường người ấy đã đi.'), ch('away', 'Đó chỉ là giấc mơ trẻ con', 'Đời mình là đời mình.')],
      apply(S, X, ch, a, p) {
        if (ch === 'follow') { G.trajBump(S, { vo: .2 }); return `Bạn gói hành lý, lên đường tới ${regName(p.loc)}. Người nhà dúi vào tay bạn nắm cơm, dặn đi dặn lại. Ra khỏi cổng làng, bạn bước nhanh như sợ mình đổi ý.`; }
        if (ch === 'same') { X.gain(idSkill(a), 4); return `Bạn xin vào học đúng nghề ${nm(p)} đã học, ở chính ngôi trường ${nm(p)} từng học. Người gác cổng bảo trên vách phòng tập còn khắc tên người ấy. Ngay hôm đầu bạn đã tìm ra nó, đứng nhìn rất lâu.`; }
        return 'Bạn gỡ bức vẽ ở đầu giường xuống, cất vào rương. Giấc mơ trẻ con, bạn tự nhủ, ai mà chẳng có. Chỗ vách treo tranh để lại một mảng sáng màu hơn xung quanh.';
      },
      auto: S => (S.traits.bold > .6 ? 'follow' : S.traits.studious > .5 ? 'same' : S.traits.bold < .3 ? 'away' : 'same') },
    trial: { base: (S, X, a, p) => (a.d.bg ? .5 : .45 + (a.d.path === 'same' ? .15 : 0)),
      run(S, X, a, ok, p) {
        if (a.d.bg) return ok ? { t: `Tên ${nm(p)} giờ đã có trong bài hát của người hát rong. Bạn nghe họ hát ở chợ, khẽ nhẩm theo lúc nào không biết. Người đứng cạnh hỏi bạn có quen người ấy không. Bạn lắc đầu.`, k: 'info' } : { t: `Lâu lắm rồi không ai nhắc tới ${nm(p)}. Người hát rong đổi sang bài khác, về những người khác. Bạn cũng ít nghĩ tới hơn, chỉ thỉnh thoảng nhớ ra như nhớ một giấc mơ cũ.`, k: 'info' };
        if (a.d.path === 'follow') return ok ? { t: `Bạn tìm thấy đoàn của ${nm(p)}, xin theo làm chân sai vặt một mùa: gánh nước, cho ngựa ăn, mài vũ khí. Người ấy ít nói, ngủ ít, dậy sớm hơn tất cả. Bạn đứng nhìn, và học được nhiều hơn mấy năm tự tập.`, k: 'good', bond: 10 } : (X.add('hl', -5), { t: `Bạn tới ${regName(p.loc)} thì ${nm(p)} đã đi. Bạn lần theo hai tháng, qua mấy quán trọ, mấy bến đò, nơi nào cũng nghe "vừa đi hôm qua". Rồi mất dấu hẳn. Bạn về, gầy đi, mà vẫn chưa chịu thôi.`, k: 'bad' });
        if (ok) { X.gain(idSkill(a), 3); X.addXp(60); } return ok ? { t: `Bạn qua kỳ sát hạch đầu tiên, đúng kỳ ${nm(p)} từng qua. Tên bạn được khắc lên vách, cách tên người ấy mấy hàng. Đêm ấy bạn lén vào phòng tập, đặt tay lên hai cái tên, cười một mình.`, k: 'good' } : { t: 'Bạn trượt kỳ sát hạch. Người chấm bảo bạn bắt chước người khác quá nhiều, chưa thấy chính bạn ở đâu trong đó. Câu ấy bạn nghĩ mãi mấy tháng liền.', k: 'bad' };
      } },
    climax: { title: 'Gặp lại người trong mộng',
      body(S, X, a, p) { const T = X.ctier(S), old = p.drive < .7 || G.castYrs(S, p) > G.RACES[p.race].le * .7;
        a.d.old = old; return old ? `Bạn gặp lại ${refE(S, p)} ở một quán nhỏ ven đường: tóc bạc, một bên là chân gỗ. ${nm(p)} không nhận ra bạn. Người từng cưỡi ngựa qua làng giờ ngồi một mình với bát rượu nhạt. Bạn đứng ở cửa quán, chưa biết nên bước vào hay quay đi.`
          : `Bạn gặp lại ${refE(S, p)} ở ${capName(S)}. ${T >= p.tier && T >= 1 ? 'Giờ bạn đã ngang hàng với người từng là giấc mơ của mình.' : `${nm(p)} vẫn như năm ấy, dáng đứng thẳng, mắt nhìn xa.`} Tim bạn đập y như hồi còn lẽo đẽo theo sau. Lần này, bạn có thể bước tới mà nói chuyện.`; },
      choices: (S, X, a, p) => (a.d.old ? [ch('care', 'Ngồi xuống, kể chuyện năm xưa', 'Trả tiền rượu, hỏi han.'), ch('thank', 'Chỉ nói lời cảm ơn rồi đi', '')]
        : [ch('spar', 'Xin đấu thử một trận', `Khả năng thắng chừng ${pct(vs(S, X, p, 0, .05, .9))}.`), ch('ask', 'Xin chỉ cho một thế', ''), ch('thank', 'Chỉ nói lời cảm ơn', '')]),
      apply(S, X, ch, a, p) {
        if (ch === 'care') { X.money(-Math.round(med(S, X) * .2)); bond(p, 20); return { t: `Bạn ngồi xuống, gọi thêm rượu, kể chuyện ba ngày lẽo đẽo năm xưa. ${nm(p)} nghe tới đâu cười tới đó, cười tới chảy nước mắt. "Đứa nhóc lấm lem bụi đường ấy là ngươi à?" Hai người ngồi tới khi quán đóng cửa.`, o: 'kind' }; }
        if (ch === 'spar') { if (X.rnd() < vs(S, X, p, 0, .05, .9)) { fame(S, 3); X.add('h', 10); return { t: `Hai người đấu trên bãi đất trống, người xem vây kín. Bạn thắng. ${nm(p)} đứng dậy, phủi áo, cúi chào bạn như chào một người ngang hàng. Cái cúi chào ấy, bạn đã mơ từ hồi còn bé tí.`, o: 'surpass' }; }
          X.addXp(80); return { t: `${nm(p)} hạ bạn trong ba chiêu, gọn như gió lướt. Rồi người ấy chìa tay kéo bạn dậy, chỉ cho bạn chỗ sai ở chiêu thứ hai. Bạn ghi nhớ từng lời, như đứa trẻ năm nào ngồi nghe kể chuyện.`, o: 'bested' }; }
        if (ch === 'ask') { X.gain(idSkill(a), 4); X.addXp(120); bond(p, 20); return { t: `Nghe chuyện ba ngày lẽo đẽo năm xưa, ${nm(p)} cười to rồi chỉ cho bạn một thế ${G.mv(idSkill(a)).toLowerCase()}. Người ấy làm chậm ba lần, sửa tay bạn từng chút. "Đứa nào theo ta ba ngày thì xứng được một thế," ${nm(p)} nói.`, o: 'taught' }; }
        X.add('h', 4); return { t: `Bạn nói lời cảm ơn, kể vắn tắt về ba ngày năm ấy. ${nm(p)} nghe, gật đầu, không nhớ gì cả. Bạn thì nhớ. Ra khỏi cửa, lòng bạn nhẹ như vừa trả xong một món nợ.`, o: 'thanked' };
      },
      auto: (S, X, a, p) => (a.d.old ? (S.traits.social > .4 ? 'care' : 'thank') : X.power(S) >= npcPow(p, 0) ? 'spar' : S.traits.studious > .4 ? 'ask' : 'thank'),
      bg: (S, X, a, p) => (a.d.ok ? { t: `${nm(p)} thành người của huyền thoại: có cả một bài vè kể chuyện ${nm(p)}, trẻ con hát khắp các ngõ. Trong bài vè có đoạn người ấy cưỡi ngựa qua một ngôi làng. Không ai biết đó là làng bạn.`, o: 'legend' } : { t: `Không ai còn nhớ ${nm(p)}. Bạn cũng gần như quên. Có hôm nghe tiếng vó ngựa ngoài đường, bạn ngẩng lên, rồi lại cúi xuống làm tiếp.`, o: 'faded' }) },
    end: (S, X, a, p, o) => (o === 'bested' && X.ctier(S) >= p.tier && X.ctier(S) >= 1 ? 'surpass' : o),
    after: {
      surpass: (S, X, a, p) => ({ t: `Bạn kể cho bọn trẻ trong làng chuyện ${nm(p)} năm xưa, kể cả trận đấu về sau. Một đứa nghe xong cứ lẽo đẽo theo bạn suốt ba ngày. Bạn giả vờ không thấy, mà bước chân thì chậm lại cho nó theo kịp.`, k: 'big' }),
      taught: (S, X, a, p) => ({ t: `Thế ấy bạn dùng cả đời, lần nào cũng nhớ tới ${nm(p)}. Về sau bạn dạy lại cho người khác, làm chậm ba lần, sửa tay từng chút, y như người ấy đã làm. Câu nói kèm theo, bạn cũng giữ nguyên.`, k: 'good' }),
      kind: (S, X, a, p) => ({ t: `Mùa nào bạn cũng ghé quán ấy, trả tiền rượu cho ${nm(p)}. Hai người kể đi kể lại chuyện cũ, mỗi lần khác đi một chút. Có lần ${nm(p)} gọi bạn bằng tên. Bạn ngồi im, sợ nói gì đó làm vỡ mất.`, k: 'good', bond: 10 }),
      thanked: () => ({ t: 'Giấc mơ năm ấy đã đưa bạn tới đây. Thế là đủ. Người kia không nhớ bạn, nhưng con đường bạn đi có dấu chân của người ấy.', k: 'info' }),
      bested: () => ({ t: 'Bạn biết đường mình còn xa. Bạn đi tiếp. Chỗ sai ở chiêu thứ hai, bạn sửa mất ba năm. Sửa xong, bạn chỉ muốn tìm người ấy đấu lại một lần.', k: 'info' }),
      legend: (S, X, a, p) => ({ t: `Bạn kể với con cháu rằng mình từng theo ${nm(p)} suốt ba ngày. Không ai tin. Đứa nhỏ nhất còn hát luôn bài vè cho bạn nghe, như để nói người ấy chỉ có trong bài hát. Bạn cười, không cãi.`, k: 'info' }),
      faded: () => ({ t: 'Có hôm bạn tìm lại bức vẽ cũ trong rương. Màu đã phai, con ngựa chỉ còn mấy nét mờ. Bạn ngồi nhìn một lúc, rồi cất vào, không treo lên nữa.', k: 'bad' })
    } });

  // ── Ruột thịt (anh chị gặp nạn; a.d.type: debt / sick / levy) ──
  full('kin', { nameVi: 'Ruột thịt', good: ['close', 'yield', 'fair', 'stood'],
    quest: (a, p) => `Giữ tình ruột thịt với ${nm(p)}`,
    marks: { close: 'tinh_than', yield: 'giu_loi', fair: 'duoc_tin', rift: 'cat_dut', stood: 'tiec_nuoi', cold: 'cay_dang' },
    sum: { close: (d, p) => `cưu mang ${nm(p)} lúc hoạn nạn`, yield: (d, p) => `nhường đất hương hỏa cho ${nm(p)}`, fair: (d, p) => `chia đất hương hỏa với ${nm(p)} cho sòng phẳng`,
      rift: (d, p) => `cắt đứt với ${nm(p)} vì đất hương hỏa`, stood: (d, p) => `đứng ngoài lúc ${nm(p)} hoạn nạn`, cold: (d, p) => `để ${nm(p)} bán nhà bỏ làng` },
    beat: { any: ['Bạn gửi về nhà một gói thuốc, kèm lá thư ngắn hỏi thăm {p}. Có mấy dòng mà bạn ngồi viết cả buổi tối.', 'Đêm ấy bạn mơ thấy hai anh em còn bé, đuổi nhau quanh cây rơm sau nhà. Tỉnh dậy, gối hơi ướt.'] },
    acts: acts({ open: { st: ADE, wait: [0, 3] }, knot: { prio: 8, wait: [0, 4] } }),
    open: (S, X, a, p) => ({ t: { debt: `Thư nhà thứ hai tới, nét chữ vội hơn lá trước: chủ nợ đã dán giấy lên cửa nhà ${nm(p)}. Bạn đọc xong, gấp lại, rồi lại mở ra đọc. Cái cửa ấy bạn nhớ rõ, hồi bé hai anh em vẫn ngồi đó ăn khoai.`, sick: `Thư nhà thứ hai tới, ngắn hơn lá trước: ${nm(p)} không ngồi dậy được nữa. Người viết hộ chỉ ghi thêm một dòng, xin bạn liệu mà về. Bạn ngồi bên bàn tới khi ngọn đèn tắt.`, levy: `Thư nhà thứ hai tới: con trai ${nm(p)} đã bị giải đi biên giới. Bạn nhớ đứa cháu hồi bé hay đòi bạn cõng đi chợ. Góc thư nhòe một vệt nước.` }[a.d.type] || `Thư nhà tới: ${nm(p)} cần người giúp. Mấy chữ ngắn ngủi mà bạn đọc mãi không xong.`, k: 'bad' }),
    knot: { title: 'Thư nhà', body: (S, X, a, p) => { const cost = Math.round(med(S, X) * .8); a.d.cost = cost; return `${nm(p)} cần người giúp. Chuyện này cần chừng ${G.coin(cost)}. Bạn mở rương đếm lại số tiền dành dụm, đếm hai lần. Ở quê, người ta đang đợi xem bạn làm gì.`; },
      choices: (S, X, a) => [ch('help', 'Gửi tiền, về tận nơi', `Mất ${G.coin(a.d.cost)} và một chuyến đi.`), ch('send', 'Chỉ gửi tiền', `Mất ${G.coin(Math.round(a.d.cost * .6))}.`), ch('away', 'Chỉ gửi lời thăm', 'Nhà mình cũng chẳng dư.')],
      apply(S, X, ch, a, p) {
        if (ch === 'help') { X.money(-a.d.cost); X.add('h', 4); bond(p, 30); return `Bạn về tới nơi, ${nm(p)} ôm bạn khóc như hồi hai đứa còn bé. Căn nhà cũ xập xệ hơn bạn nhớ, mà mùi bếp thì vẫn y nguyên. Tối ấy hai anh em ngồi bên bếp tới khuya, nói chuyện cha mẹ.`; }
        if (ch === 'send') { X.money(-Math.round(a.d.cost * .6)); bond(p, 10); return 'Bạn gửi tiền theo người đưa thư, kèm mấy dòng dặn dò. Thư cảm ơn về sau một tháng, nét chữ run. Cuối thư có một câu gạch đi viết lại: "Bao giờ về thăm nhà?"'; }
        bond(p, -40); return 'Bạn chỉ gửi lời thăm, kèm mấy câu khuyên nhủ. Thư trả lời của nhà ngắn hơn mọi lần, cuối thư không còn câu hỏi han nào. Bạn đọc xong, đặt xuống, không viết lại.';
      },
      auto: (S, X) => (S.traits.social > .3 || sh(S, 'gia') > .12 ? (S.gold > med(S, X) ? 'help' : 'send') : 'away') },
    trial: { base: (S, X, a) => (a.d.bg ? .4 : a.d.path === 'help' ? .7 : .5),
      run(S, X, a, ok, p) {
        if (a.d.bg) return ok ? { t: `${nm(p)} tự xoay xở được, bán bớt ruộng, vay họ hàng bên ngoại. Người làng kể lại, giọng có chút trách. Không ai nhắc tới tên bạn, mà ai cũng hiểu.`, k: 'info' } : { t: `${nm(p)} bán nhà, dọn vào ở nhờ nhà kho của người ta. Tin tới tay bạn qua một người buôn chuyến, kể như kể chuyện thời tiết. Bạn ngồi lặng cả buổi chiều.`, k: 'bad' };
        return ok ? { t: { debt: `${nm(p)} trả xong nợ. Tờ giấy dán trên cửa được bóc xuống, đốt ngay giữa sân. Thư nhà gửi lên lần này dày hơn mọi lần, toàn chuyện vặt.`, sick: `${nm(p)} khỏi bệnh, đi lại được. Thư báo tin kèm một gói chè tự hái, đắng mà thơm. Bạn pha một ấm, ngồi uống tới khuya.`, levy: `Con trai ${nm(p)} được chuộc về, đen nhẻm, gầy rộc. Đứa cháu đứng ngoài cổng nhìn bạn lâu lắm rồi mới chạy tới. Cả nhà khóc rồi cười, lẫn lộn.` }[a.d.type] || `${nm(p)} qua được cơn hoạn nạn. Thư nhà lại đều đặn như xưa.`, k: 'good', bond: 10 }
          : { t: { debt: 'Tiền gửi về chỉ đủ trả lãi. Gốc vẫn còn nguyên, lãi lại sinh tiếp. Thư nhà thưa dần, lá sau buồn hơn lá trước.', sick: `${nm(p)} đỡ, nhưng không còn khỏe như trước. Đi vài bước đã phải ngồi nghỉ, tay chống lên gối. Người nhà bảo trận ốm ấy lấy đi mất mười năm.`, levy: 'Tiền chuộc tới muộn; đứa cháu đã bị đưa đi xa hơn, về một đồn biên giới không ai biết tên. Thư nhà từ đó chỉ còn những dòng dò hỏi.' }[a.d.type] || 'Không đủ. Bạn biết vậy, mà không làm gì hơn được.', k: 'bad' };
      } },
    climax: { title: 'Đất hương hỏa',
      body: (S, X, a, p) => `Cha mẹ đã khuất, để lại mảnh đất hương hỏa. Họ hàng họp lại dưới mái nhà cũ, khói hương còn vương trên bàn thờ. ${nm(p)} ngồi đối diện bạn, không nói gì. ${a.d.path === 'help' ? 'Năm nhà hoạn nạn bạn đã về tận nơi, ai cũng còn nhớ.' : 'Năm nhà hoạn nạn bạn chỉ gửi tiền về, ai cũng còn nhớ.'}`,
      choices: () => [ch('yield', 'Nhường cả cho anh chị', 'Mình đã có chỗ của mình.'), ch('split', 'Chia đôi cho sòng phẳng', ''), ch('claim', 'Giành lấy phần lớn', 'Mình đã bỏ tiền ra lúc nhà hoạn nạn.')],
      apply(S, X, ch, a, p) {
        if (ch === 'yield') { bond(p, 30); X.add('so', 4); return { t: `Bạn ký giấy nhường. ${nm(p)} nắm tay bạn rất lâu, bàn tay giờ chai sạn y như tay cha ngày trước. Họ hàng thở ra nhẹ nhõm. Ra khỏi nhà, bạn đứng nhìn mảnh vườn cũ một lúc rồi mới đi.`, o: 'yield' }; }
        if (ch === 'split') { X.money(Math.round(med(S, X) * .5)); return { t: 'Đất chia đôi, cắm cọc rõ ràng. Không ai thiệt. Cũng chẳng ai thấy ấm lòng, nhưng ai cũng gật đầu. Cây mít già đứng đúng giữa đường ranh, hai nhà bàn nhau chia quả.', o: 'fair' }; }
        X.money(Math.round(med(S, X))); bond(p, -50); return { t: `Bạn lấy phần lớn. ${nm(p)} đứng dậy bỏ về giữa buổi, ghế đổ cũng không dựng lại. Họ hàng nhìn bạn, rồi nhìn nhau. Không ai nói gì, nhưng bữa cơm hôm ấy chẳng ai ăn hết bát.`, o: 'rift' };
      },
      auto: (S, X, a) => (a.d.path === 'help' || S.traits.social > .5 ? 'yield' : sh(S, 'thuong') > .2 && S.traits.social < .3 ? 'claim' : 'split'),
      bg: (S, X, a) => (a.d.ok ? { t: 'Họ hàng chia đất hương hỏa. Bạn không về; phần của bạn để lại cho anh chị. Tin tới qua một lá thư ngắn, bạn đọc xong thì gấp làm tư, cất đi.', o: 'stood' } : { t: 'Đất hương hỏa bị bán để trả nợ. Bạn nghe tin sau cùng, khi người mua đã chặt cây mít già đầu ngõ. Bạn ngồi im rất lâu, nhớ mùi mít chín những mùa hè năm nào.', o: 'cold' }) },
    end(S, X, a, p, o) { if (a.d.bg) return o; if (o === 'yield' && a.d.path === 'help' && a.d.ok) return 'close'; return o; },
    after: {
      close: (S, X, a, p) => { const g = Math.round((a.d.cost || 20) * .8); X.money(g); X.add('h', 5); return { t: a.d.type === 'debt' ? `${nm(p)} trả lại bạn số tiền năm ấy, gói trong chiếc khăn tay của mẹ. Bạn cầm chiếc khăn lâu hơn cầm tiền. Mùi của mẹ, tưởng đã hết, vẫn còn vương ở nếp gấp.` : `Mùa gặt nào ${nm(p)} cũng gửi lên một xe lúa, không đợi bạn hỏi. Năm nay nó đáng ${G.coin(g)}. Trên bao lúa nào cũng có một nét than vẽ vụng, cái dấu riêng hai anh em hay dùng hồi bé.`, k: 'good', bond: 10 }; },
      yield: (S, X, a, p) => ({ t: `${nm(p)} dựng lại từ đường trên mảnh đất ấy, khắc tên cả hai anh em trên bàn thờ. Năm nào giỗ cha mẹ, chỗ đầu mâm cũng để phần bạn. Bạn về, ngồi xuống, thấy mình như chưa từng đi xa.`, k: 'good' }),
      fair: () => ({ t: 'Hai nhà ở hai đầu mảnh đất, giỗ thì cùng ngồi một mâm. Cây mít giữa đường ranh năm nào cũng sai quả. Con cháu hai nhà trèo lên hái chung, chẳng đứa nào biết cái cọc ranh để làm gì.', k: 'info' }),
      rift: (S, X, a, p) => { X.add('so', -4); return { t: `Đám giỗ trong nhà, ${nm(p)} không ngồi cùng mâm với bạn. Từ đó hai nhà thôi qua lại. Bọn trẻ hai bên lớn lên chẳng biết mặt nhau. Mảnh đất bạn giành được là đất tốt, mà trồng gì ăn cũng không thấy ngon.`, k: 'bad' }; },
      stood: (S, X, a, p) => ({ t: `${nm(p)} viết thư cảm ơn phần đất bạn để lại. Bạn đọc, thấy lạ: lẽ ra phải là bạn cảm ơn. Năm nhà hoạn nạn, bạn chỉ gửi về lời thăm. Bạn ngồi viết thư trả lời, viết mãi không xong câu đầu.`, k: 'info' }),
      cold: (S, X, a, p) => ({ t: `Không ai biết ${nm(p)} đã đi đâu. Bạn hỏi thăm, muộn mất mấy năm, mỗi người chỉ một hướng. Có đêm bạn mơ thấy cây rơm sau nhà cũ, đứng gọi tên mà không ai thưa.`, k: 'bad' })
    } });

  // ── Bạn thân (bạn hồi nhỏ, bạn sau trận ẩu đả, bạn đồng hành chia tay) ──
  full('friend', { nameVi: 'Bạn thân', good: ['reunion', 'partners', 'saved', 'letters'],
    quest: (a, p) => `Gặp lại ${nm(p)}`,
    marks: { reunion: 'ban_cu', partners: 'duoc_tin', saved: 'huynh_de', letters: 'giu_loi', drift: 'tiec_nuoi', stranger: 'cay_dang', alone_ok: 'ke_di_xa' },
    sum: { reunion: (d, p) => `gặp lại ${nm(p)} sau bao năm xa cách`, partners: (d, p) => `cùng ${nm(p)} gây dựng một cơ nghiệp`, saved: (d, p) => `vượt đường xa cứu ${nm(p)} lúc hoạn nạn`,
      letters: (d, p) => `viết thư cho ${nm(p)} suốt bốn mươi năm`, drift: (d, p) => `không tới lúc ${nm(p)} cần`, stranger: (d, p) => `gặp lại ${nm(p)} như người lạ`, alone_ok: (d, p) => `nghe tin ${nm(p)} thành đạt ở phương xa` },
    gone: (S, p) => `Tin ${refE(S, p)} mất. Bạn tìm lại mấy lá thư cũ, đọc tới sáng. Lá nào cũng kết bằng một lời hẹn gặp. Có hẹn bạn đã giữ, có hẹn thì không kịp nữa.`,
    beat: { any: ['Thư của {p} tới, kể chuyện ở phương xa, kèm một nắm hạt giống lạ. Bạn gieo ở góc vườn, chờ xem nó mọc ra cây gì.', 'Bạn kể cho người mới quen chuyện bạn và {p} trốn học đi câu cá. Kể tới đoạn bị bắt, bạn vẫn còn cười.', 'Bạn viết thư cho {p}, viết xong lại để đó, quên gửi. Mấy hôm sau tìm thấy dưới chồng sổ, mực đã khô.'] },
    acts: acts({ open: { st: CTA, wait: [3, 15] } }),
    open(S, X, a, p) { const r = X.pick(G.REGIONS.filter(r => r.id !== S.loc)); p.loc = r.id;
      return { t: `${ref(S, p)} theo một đoàn buôn đi ${r.nameVi}. Hôm tiễn trời sương, hai người đứng ở đầu làng tới khi đoàn xe giục. Hai người hứa sẽ viết thư cho nhau. ${nm(p)} đi rồi còn ngoái lại vẫy, vẫy tới khi khuất hẳn.`, k: 'info', o: 'part' }; },
    knot: { title: 'Thư của bạn cũ', body: (S, X, a, p) => `Thư của ${nm(p)} từ ${regName(p.loc)} tới đều đặn mỗi mùa, giấy mỏng, chữ chi chít. Bạn thì bận: việc nhà, việc làng, việc của chính mình. Mấy lá chưa trả lời nằm chồng lên nhau trên bàn. Lá trên cùng có một câu hỏi bạn chưa biết đáp sao.`,
      choices: (S, X, a, p) => [ch('write', 'Viết đều, mùa nào cũng viết', ''), ch('visit', `Đi thăm ${nm(p)} một chuyến`, `Đường tới ${regName(p.loc)} mất cả tháng.`), ch('away', 'Để thư thưa dần', 'Mỗi người một cuộc đời.')],
      apply(S, X, ch, a, p) {
        if (ch === 'write') { bond(p, 10); return `Bạn mua một xấp giấy, mùa nào cũng viết, kể cả khi chẳng có gì để kể: con trâu ốm, mưa tới sớm, cây trước ngõ ra hoa. Viết xong, bạn thấy như vừa ngồi nói chuyện với ${nm(p)}. Thư trả lời bao giờ cũng tới trước khi bạn kịp đợi.`; }
        if (ch === 'visit') { X.money(-Math.round(med(S, X) * .2)); bond(p, 20); X.add('h', 6); return `Bạn tới ${regName(p.loc)} đúng ngày ${nm(p)} đang dựng nhà. Hai người nhìn nhau, cười, không ai nói được câu nào. Rồi bạn xắn tay áo, ở lại giúp lợp mái. Tối ấy ngồi trên mái nhà mới, hai người uống rượu nhìn sao, như hồi còn bé.`; }
        return 'Thư tới, bạn đọc, để đó. Định mai trả lời, rồi mai lại mai. Rồi thư cũng thưa. Lá cuối cùng bạn cất trong ngăn bàn, chưa bóc.';
      },
      auto: S => (S.traits.social > .55 ? 'visit' : S.traits.social > .3 ? 'write' : 'away') },
    trial: { base: (S, X, a, p) => .45 + (p ? p.drive * .3 : 0),
      run: (S, X, a, ok, p) => (ok ? { t: `${nm(p)} khấm khá ở ${regName(p.loc)}, mở một cửa hàng${p.wed ? ', đã có vợ có chồng' : ''}. Thư kể chuyện buôn bán, chuyện nhà cửa, giọng vui hẳn lên. Cuối thư bao giờ cũng có một câu: "Bao giờ ngươi tới?"`, k: 'info' }
        : { t: `Thư cuối của ${nm(p)} viết vội: làm ăn thua lỗ, ốm một trận dài. Chữ xiêu vẹo, mấy chỗ mực nhòe. Bạn đọc xong, ngồi nhìn ra đường cái rất lâu.`, k: 'bad' }) },
    climax: { title: 'Bạn cũ cần bạn',
      body: (S, X, a, p) => (a.d.ok ? `${nm(p)} viết: "Ở đây có mối làm ăn lớn, một mình ta làm không xuể. Tới đây với ta." Kèm theo là một tấm bản đồ vẽ tay, đánh dấu cả chỗ dừng chân dọc đường. Bạn nhìn mảnh giấy, rồi nhìn quanh căn nhà của mình.` : `${nm(p)} viết, nét chữ run: "Nếu được, tới đây một chuyến. Ta không biết nhờ ai." Đây là lá thư ngắn nhất trong bao nhiêu năm. Bạn biết ${nm(p)} không phải người dễ mở lời.`),
      choices: (S, X, a, p) => [ch('go', `Lên đường tới chỗ ${nm(p)}`, 'Bỏ lại việc ở nhà một thời gian.'), ch('send', 'Gửi tiền, gửi thư', ''), ch('no', 'Không đi', 'Bây giờ không phải lúc.')],
      apply(S, X, ch, a, p) {
        if (ch === 'go') { X.money(-Math.round(med(S, X) * .3)); bond(p, 30); X.add('h', 6);
          return a.d.ok ? { t: `Bạn tới, xắn tay áo làm cùng ${nm(p)}. Hai người làm từ tờ mờ sáng tới khuya, cãi nhau như hồi bé rồi lại cười. Năm ấy hai người kiếm được nhiều hơn mười năm trước cộng lại. ${nm(p)} bảo: "Biết thế gọi ngươi sớm hơn."`, o: 'partners' } : { t: `Bạn tới, thấy ${nm(p)} nằm co trong căn buồng lạnh. Bạn ở lại ba tháng, sắc thuốc, nấu cháo, chăm ${nm(p)} khỏi bệnh, trả hộ món nợ gấp nhất. Ngày bạn về, ${nm(p)} tiễn ra tận đầu đường, như ngày xưa bạn tiễn người ấy.`, o: 'saved' }; }
        if (ch === 'send') { X.money(-Math.round(med(S, X) * .2)); bond(p, 10); return { t: `Bạn gửi tiền kèm một lá thư dài, kể đủ thứ chuyện ở quê. ${nm(p)} trả lời bằng một lá dài hơn. Từ đó thư đi thư lại, chưa mùa nào ngắt quãng.`, o: 'letters' }; }
        bond(p, -15); return { t: 'Bạn viết thư từ chối, sửa ba lần mới gửi. Lời lẽ đâu vào đấy, mà đọc lại thấy lạnh như viết cho người dưng. Gửi đi rồi, bạn ngồi bên bàn khá lâu, không làm gì.', o: 'drift' };
      },
      auto: (S, X, a, p) => (S.traits.social > .5 || p.bond > 50 ? 'go' : S.traits.social > .25 ? 'send' : 'no'),
      bg: (S, X, a, p) => (a.d.ok ? { t: `Nghe nói ${nm(p)} giờ là người có tiếng ở ${regName(p.loc)}, nhà to, người làm đông. Người kể bảo ${nm(p)} có hỏi thăm bạn. Bạn gật đầu, không nói gì thêm.`, o: 'alone_ok' } : { t: `${nm(p)} có ghé làng một lần. Hai người đứng nói chuyện ở chợ như người quen sơ, hỏi sức khỏe, hỏi mùa màng. Chẳng ai nhắc chuyện câu cá năm nào. Lúc chia tay, cả hai đều thở ra nhẹ nhõm, rồi lại thấy buồn.`, o: 'stranger' }) },
    end: (S, X, a, p, o) => (o === 'letters' && a.d.path === 'visit' ? 'reunion' : o),
    after: {
      reunion: (S, X, a, p) => { X.add('so', 6); X.add('h', 6); return { t: `Bạn gặp lại ${refE(S, p)}${workVi(p) ? ', giờ làm ' + workVi(p) : ''}. Hai người nhìn nhau một lúc mới nhận ra, rồi cùng phá lên cười. Đêm ấy uống tới sáng, kể lại những trận đòn hồi bé như kể chiến công. Gà gáy rồi mà chuyện vẫn chưa hết.`, k: 'good', bond: 20 }; },
      partners: (S, X, a, p) => { X.money(Math.round(med(S, X) * 1.2)); return { t: `Cửa hàng mang tên cả hai người, tấm biển khắc tay treo ngay cửa. Khách tới hỏi ai là chủ, hai người chỉ vào nhau. Tối tối đóng cửa, hai người ngồi tính sổ, cãi nhau từng đồng rồi lại rót rượu cho nhau.`, k: 'big', bond: 10 }; },
      saved: (S, X, a, p) => ({ t: `${nm(p)} đặt tên đứa con út theo tên bạn. Lần đầu bế nó, bạn lóng ngóng như người chưa bế trẻ bao giờ. ${nm(p)} đứng bên cười: "Gọi tên nó đi, nó là của ngươi một nửa."`, k: 'big', bond: 20 }),
      letters: (S, X, a, p) => ({ t: `Rương thư của bạn đầy hai ngăn, buộc từng xấp theo năm. Lúc già, bạn giở ra đọc lại từ lá đầu tiên, nét chữ của ${nm(p)} hồi còn non nớt. Đọc tới lá nào, bạn cũng nhớ mình đã trả lời ra sao.`, k: 'good' }),
      drift: (S, X, a, p) => ({ t: `Thư của ${nm(p)} thôi tới. Bạn không biết là vì giận hay vì không còn ai viết. Lá thư từ chối năm ấy, bạn vẫn nhớ từng chữ. Giá mà hôm đó bạn sửa thêm một lần nữa.`, k: 'bad' }),
      stranger: (S, X, a, p) => ({ t: `Có những người bạn chỉ còn trong trí nhớ thì đẹp hơn. Bạn giữ ${nm(p)} của ngày xưa: đứa trẻ trốn học, vai vác cần câu. Còn người đứng ở chợ hôm ấy, bạn để người ấy đi.`, k: 'bad' }),
      alone_ok: (S, X, a, p) => ({ t: `Bạn kể với hàng xóm: người có tiếng ở ${regName(p.loc)} ấy, hồi bé từng trốn học đi câu với mình. Người ta gật gù, nửa tin nửa ngờ. Tối ấy bạn lấy lá thư cuối cùng trong ngăn bàn ra, ngồi nhìn mãi mà vẫn chưa bóc.`, k: 'info' })
    } });

  // ── Người mất tích (bạn đồng hành không về; p.missing) ──
  full('lost', { nameVi: 'Người mất tích', good: ['back', 'rescued', 'ransomed', 'grave'],
    quest: (a, p) => `Tìm ${nm(p)}`,
    marks: { back: 'ban_cu', rescued: 'huynh_de', ransomed: 'duoc_tin', grave: 'buong_bo', never: 'tiec_nuoi', failed: 'no_mau' },
    sum: { back: (d, p) => `đón ${nm(p)} trở về sau bao năm mất tích`, rescued: (d, p) => `đi tìm và cứu được ${nm(p)}`, ransomed: (d, p) => `chuộc ${nm(p)} về bằng tiền`,
      grave: (d, p) => `tìm thấy mộ ${nm(p)}, đưa về quê`, never: (d, p) => `không bao giờ biết ${nm(p)} đã đi đâu`, failed: (d, p) => `tìm ra ${nm(p)} mà không cứu được` },
    fade: (S, X, p) => { if (p) { p.alive = false; p.died = S.world.year; } },
    beat: { any: ['Đoàn buôn nào qua làng, bạn cũng hỏi có ai gặp người giống {p} không. Câu trả lời lần nào cũng như nhau.', 'Bạn để một bát cơm trên bàn, như {p} vẫn ngồi đó. Cơm nguội, bạn lại đem đổ cho gà.'] },
    acts: acts({ open: { st: ADE, wait: [2, 10] } }),
    open: (S, X, a, p) => ({ t: `Một lữ khách kể đã thấy người giống ${nm(p)} ${X.pick(['trong một trại thợ mỏ ở biên giới', 'trên một chiếc thuyền buôn đi về phương nam', 'trong đám tù binh của bọn cướp núi'])}. Ông ta không dám chắc, chỉ bảo trông quen lắm. Bạn hỏi đi hỏi lại tới khi người ta phát ngại. Đêm ấy, lần đầu sau nhiều năm, bạn mất ngủ vì một tin vui.`, k: 'info' }),
    knot: { title: 'Tin đồn', body: (S, X, a, p) => `Người ta bảo ${nm(p)} đã chết. Lữ khách kia thì bảo chưa. Chiếc áo cũ của ${nm(p)} vẫn treo trên vách, bạc màu vì nắng. Bạn nhìn nó mỗi sáng, và mỗi sáng lại nghĩ một khác.`,
      choices: () => [ch('search', 'Tự đi tìm', 'Đường xa, không biết bao lâu.'), ch('post', 'Treo thưởng hỏi tin', 'Tốn tiền; tin giả nhiều hơn tin thật.'), ch('away', 'Làm lễ, để tang', 'Người đi rồi thì để người yên.')],
      apply(S, X, ch, a, p) {
        if (ch === 'search') { G.trajBump(S, { vo: .2 }); return `Bạn gửi nhà cho hàng xóm, đeo túi lên đường. Trong túi có ít lương khô, một tấm áo ấm, và chiếc khăn của ${nm(p)} để hỏi người ta có nhận ra không. Ra tới đầu làng, bạn không ngoái lại.`; }
        if (ch === 'post') { X.money(-Math.round(med(S, X) * .3)); return `Bạn treo bảng ở năm cái chợ: ai biết tin ${nm(p)} thì có thưởng. Mấy tuần sau, người tìm tới nhà nườm nượp, mỗi người một chuyện. Bạn nghe hết, ghi hết, không bỏ sót ai.`; }
        X.add('h', -2); return `Bạn lập một bát hương cho ${nm(p)} cạnh bàn thờ nhà mình, mời thầy cúng tới làm lễ. Khói hương bay khắp nhà. Lúc cắm nén hương đầu, tay bạn run, chẳng biết mình đang khấn người sống hay người chết.`;
      },
      auto: (S, X) => (S.traits.bold > .55 ? 'search' : S.gold > med(S, X) ? 'post' : 'away') },
    trial: { base: (S, X, a) => (a.d.bg ? .25 : a.d.path === 'search' ? .5 : .4),
      run(S, X, a, ok, p) {
        if (a.d.bg) return ok ? { t: `Có người thấy ${nm(p)} ở một bến đò, gầy rộc, đi về hướng làng. Bạn nghe xong, đứng sững một lúc. Bát hương trên bàn thờ, tối ấy bạn không thắp.`, k: 'info' } : { t: 'Không ai còn nhắc tới chuyện ấy. Tên người mất tích thưa dần trong câu chuyện của làng, rồi thôi hẳn. Chỉ có bát hương là bạn vẫn thắp, mỗi rằm một nén.', k: 'info' };
        return ok ? { t: `Bạn lần ra dấu vết: ${nm(p)} còn sống, đang bị giữ ở một nơi xa. ${a.d.path === 'post' ? 'Trong cả trăm tin giả, có một tin khớp tới từng chi tiết.' : 'Mấy tháng đường dài, cuối cùng một người chăn ngựa chỉ đúng hướng.'} Bạn cầm mẩu tin trong tay, nghe tim mình đập thình thịch.`, k: 'good' } : (a.d.path === 'search' && X.add('hl', -8), { t: `${a.d.path === 'search' ? 'Bạn đi hết một mùa' : 'Tiền thưởng hết dần'}, chỉ đổi về những tin đồn trái ngược nhau. Người bảo đi hướng đông, người bảo đã chết ở hướng tây. Bạn ngồi bên bậc cửa nhìn ra đường cái tới khi trời tối.`, k: 'bad' });
      } },
    climax: { title: 'Dấu vết cuối',
      body: (S, X, a, p) => (a.d.ok ? `${nm(p)} bị giữ trong một trại của bọn buôn người, trên sườn núi đá. Chúng đòi tiền chuộc, hoặc phải vào mà lấy. Từ chỗ bạn nấp, có thể thấy khói bếp của trại bốc lên. Đâu đó trong ấy là người bạn đã đợi bao nhiêu năm.` : `Manh mối cuối cùng dẫn tới một nghĩa địa không bia, ở bìa một khu rừng lạ. Cỏ mọc lút gối, mấy nấm đất lồi lõm không ai chăm. Một người tiều phu chỉ vào nấm đất ở góc, bảo chôn ở đó là một người lạ, từ nhiều năm trước.`),
      choices: (S, X, a, p) => (a.d.ok ? [ch('rescue', 'Đột nhập cứu người', `Chừng ${pct(odds(S, X, .45))} thoát cả hai.`), ch('ransom', 'Trả tiền chuộc', `Chừng ${G.coin(Math.round(med(S, X) * 1.2))}.`), ch('leave', 'Quay về', '')]
        : [ch('dig', 'Đào tìm', 'Có thể không phải.'), ch('leave', 'Quay về', '')]),
      apply(S, X, ch, a, p) {
        if (ch === 'rescue') { if (X.chance(odds(S, X, .45))) { fame(S, 2); p.missing = false; return { t: `Bạn cắt dây trói lúc nửa đêm, cõng ${nm(p)} chạy qua hai ngọn đồi. Người trên lưng nhẹ bẫng, như một bó củi khô. Tới lúc trời rạng mới dám dừng lại. ${nm(p)} nhìn bạn, nói được một câu: "Ta biết thế nào cũng có người tới."`, o: 'rescued' }; }
          X.add('hl', -15); X.cond('wound'); kill(S, p); return { t: `Bọn canh trại phát hiện, tiếng tù và rúc lên giữa đêm. Bạn thoát được; ${nm(p)} thì không. Suốt đường về, tai bạn vẫn còn tiếng gọi vọng ra từ trong trại.`, o: 'failed' }; }
        if (ch === 'ransom') { const c = Math.round(med(S, X) * 1.2); if (S.gold >= c) { X.money(-c); p.missing = false; return { t: `Bạn đếm tiền cho bọn buôn người, từng đồng một dưới ánh đuốc. Chúng đẩy ${nm(p)} ra, gầy tới mức bạn suýt không nhận ra. Hai người dìu nhau đi suốt đêm, không ai nói gì. Gần sáng, ${nm(p)} khóc như một đứa trẻ.`, o: 'ransomed' }; }
          X.money(-Math.max(0, S.gold)); kill(S, p); return { t: 'Bạn không đủ tiền. Bọn chúng nhận hết, rồi nuốt lời, đuổi bạn ra khỏi trại bằng roi ngựa. Bạn đứng dưới chân núi tới khi trời tối, không còn gì để đổi.', o: 'failed' }; }
        if (ch === 'dig') { kill(S, p); X.add('h', -4); return { t: `Bạn đào suốt một buổi chiều, tay rớm máu. Dưới lớp đất là chiếc vòng tay ${nm(p)} chưa bao giờ tháo. Bạn ngồi xuống bên miệng hố, cầm chiếc vòng, rất lâu không đứng dậy được.`, o: 'grave' }; }
        return { t: 'Bạn quay về, không ngoái lại. Đường về dài gấp đôi đường đi, mà chân thì cứ muốn dừng.', o: 'never' };
      },
      auto: (S, X, a) => (a.d.ok ? (S.gold > med(S, X) * 1.2 ? 'ransom' : S.traits.bold > .4 ? 'rescue' : 'leave') : S.traits.social > .3 ? 'dig' : 'leave'),
      bg: (S, X, a, p) => (a.d.ok ? (p.missing = false, { t: `${nm(p)}, người ai cũng tưởng đã chết, gõ cửa nhà bạn. Một bên mắt đã mất; câu chuyện thì dài lắm. Bạn đứng ở cửa, không nói nên lời, mắt nhìn sang bát hương trên bàn thờ. Rồi cả hai cùng bật cười.`, k: 'big', o: 'back', bond: 20 }) : (kill(S, p), { t: 'Bát hương của người mất tích đã nguội từ lâu. Bạn thôi thắp, nhưng không nỡ dẹp đi. Bụi phủ lên một lớp mỏng, như trên mọi thứ khác trong nhà.', o: 'never' })) },
    after: {
      back: (S, X, a, p) => { X.add('h', 10); return { t: `${nm(p)} ở lại nhà bạn cả mùa đông, kể chuyện những năm mất tích. Có đêm kể tới sáng, có đêm ngồi im cả buổi. Bạn nghe hết, không hỏi vì sao người ta không về sớm hơn. Bát hương năm nào, hai người mang ra sau vườn chôn.`, k: 'big' }; },
      rescued: (S, X, a, p) => { X.add('h', 10); return { t: `${nm(p)} khỏe lại, da dẻ hồng hào dần. Từ đó đi đâu ${nm(p)} cũng kể: "Người này vào tận trại cướp lôi ta ra." Kể mãi tới mức bạn phát ngượng. Mỗi lần nghe, bạn lại nhớ cái lưng nhẹ bẫng đêm ấy.`, k: 'big', bond: 30 }; },
      ransomed: (S, X, a, p) => { X.add('h', 8); return { t: `${nm(p)} trả lại bạn từng đồng tiền chuộc, mất năm năm. Lần trả cuối, ${nm(p)} đặt thêm lên bàn một đồng, bảo là tiền lãi. Bạn đẩy lại. Hai người đẩy qua đẩy lại tới khi cùng bật cười.`, k: 'good', bond: 20 }; },
      grave: () => ({ t: 'Bạn đưa hài cốt về quê, chôn cạnh cây đa đầu làng. Giờ thì có chỗ để thắp hương. Chiếc vòng tay, bạn đeo vào cổ tay mình, đeo tới cuối đời.', k: 'info' }),
      never: () => ({ t: 'Có những người đi rồi không có tin. Bạn sống tiếp, mang theo một câu hỏi. Mỗi lần có người lạ gõ cửa lúc khuya, bạn vẫn là người ra mở nhanh nhất nhà.', k: 'bad' }),
      failed: () => ({ t: 'Bạn về tay trắng. Đêm nào trời trở, người bạn lại nhức như có vết thương cũ, dù chẳng biết chỗ đau nằm ở đâu. Chuyện ấy bạn thôi kể với ai.', k: 'bad' })
    } });

  // ── Kẻ săn (Bộ Xương; Thánh Kỵ Sĩ trẻ từng được tha) ──
  full('hunter', { nameVi: 'Kẻ săn', good: ['truce', 'slain', 'fled', 'called'], body: 'undead', undead: true,
    quest: (a, p) => `Thoát khỏi ${nm(p)}`,
    marks: { truce: 'buong_bo', slain: 'tay_mau', beaten: 'cay_dang', fled: 'nguoi_la', called: 'tiec_nuoi', hidden: 'biet_bi_mat' },
    sum: { truce: (d, p) => `khiến ${nm(p)}, Thánh Kỵ Sĩ săn mình, hạ kiếm`, slain: (d, p) => `hạ ${nm(p)}, Thánh Kỵ Sĩ săn mình`, beaten: (d, p) => `bị ${nm(p)} thanh tẩy dở dang`,
      fled: (d, p) => `trốn khỏi ${nm(p)}`, called: (d, p) => `thoát ${nm(p)} vì giáo hội điều người ấy đi nơi khác`, hidden: (d, p) => `giấu mình kỹ tới mức ${nm(p)} bỏ cuộc` },
    gone: (S, p) => `Nghe lỏm lữ khách kể ${nm(p)}, Thánh Kỵ Sĩ từng săn bạn, đã chết. Bạn đứng ở cửa hầm cả đêm, gió lùa qua hốc mắt rỗng. Không còn ai đuổi theo nữa. Vậy mà nghe tiếng vó ngựa xa xa, bạn vẫn nằm im như cũ.`,
    beat: { any: ['Bạn nghe tiếng vó ngựa xa xa, nằm im trong hầm tới sáng. Lửa hồn thu nhỏ lại như một đốm than.', 'Bạn đào thêm một lối thoát sau hầm, đầu ngón xương mòn đi một đốt.', 'Mùi nước thánh còn vương ở cửa hầm từ lần trước, chua và cay. Bạn đi vòng qua chỗ ấy.'] },
    acts: acts({ open: { st: ADE, wait: [2, 6] } }),
    open(S, X, a, p) {
      p.tier = Math.max(p.tier, X.ctier(S));
      if (X.rnd() < vs(S, X, p, 0, .2, .85)) { fame(S, 2); return { t: `${ref(S, p)} quay lại, lần này mang theo ba người và một lọ nước thánh. Đêm ấy nghĩa địa sáng rực ánh đuốc, đất cháy xèo xèo chỗ nước thánh rơi xuống. Bạn đánh lui cả bốn; ${nm(p)} là người rút cuối cùng. Trước khi đi, người ấy quay lại nhìn cửa hầm rất lâu.`, k: 'good', o: 'held' }; }
      X.cond('crack'); X.add('hl', -10); return { t: `${ref(S, p)} quay lại, lần này mang theo ba người và một lọ nước thánh. Nước thánh hắt trúng vai, xương bạn kêu răng rắc như củi gặp lửa. Bạn mất một cánh tay xương, phải lội qua đầm mới thoát. Nằm dưới bùn tới sáng, bạn nghe tiếng họ gọi nhau đi tìm.`, k: 'bad', o: 'hurt' };
    },
    knot: { title: 'Thánh Kỵ Sĩ', body: (S, X, a, p) => `${nm(p)} sẽ quay lại. Người đó đã thề trước bàn thờ giáo hội, mà người như thế không bỏ lời thề giữa chừng. Năm xưa bạn đã tha cho người ấy một lần. Giờ thì lưỡi kiếm ấy quay về phía bạn.`,
      choices: () => [ch('arm', 'Chuẩn bị đánh', 'Bẫy, hầm, lối thoát.'), ch('talk', 'Để lại thư ở cửa hầm', 'Kể cho người đó nghe bạn từng là ai.'), ch('away', 'Rời vùng', 'Tìm một nghĩa địa khác.')],
      apply(S, X, ch, a, p) {
        if (ch === 'arm') { X.gain('Shield', 3); return 'Bạn đào hào quanh hầm, cắm cọc nhọn dưới lớp lá mục. Đêm nào cũng đào, ngày thì nằm yên dưới đất. Bộ xương không biết mỏi, chỉ có đầu ngón tay là mòn dần.'; }
        if (ch === 'talk') { return 'Bạn khắc lên phiến đá trước cửa hầm tên thật của mình lúc còn sống, và một câu: "Ta chưa giết ai." Khắc bằng móng xương, mất trọn ba đêm. Xong, bạn lùi lại nhìn, tự hỏi người đọc có tin không.'; }
        S.flags.migrateQ = 'Thánh Kỵ Sĩ biết chỗ của bạn.'; return 'Bạn rời hầm trong đêm, mang theo những gì mang được: thanh kiếm cũ, mảnh áo rách, chút đất quê còn bám trong khe xương. Nghĩa địa cũ khuất dần sau lưng. Phía trước là những ngôi mộ lạ, chưa biết có chỗ nào cho mình.';
      },
      auto: S => (S.sm >= 25 && S.traits.social > .25 ? 'talk' : S.traits.bold > .5 ? 'arm' : 'away') },
    trial: { base: (S, X, a, p) => (a.d.bg ? .5 : a.d.path === 'arm' ? vs(S, X, p, -.2, .2, .85) : .35 + S.sm / 200),
      run(S, X, a, ok, p) {
        if (a.d.bg) return ok ? { t: `Nghe nói giáo hội điều ${nm(p)} đi trấn giữ một cửa ải phương bắc. Tin tới qua mấy kẻ đào trộm mộ bàn tán với nhau. Bạn nằm dưới đất nghe, không nhúc nhích.`, k: 'info' } : { t: `${nm(p)} tìm tới nghĩa địa cũ, thấy hầm trống, lần theo dấu. Vết chân xương trên bùn chưa kịp xóa. Người ấy quỳ xuống xem rất lâu, rồi đứng dậy đi đúng hướng bạn đã đi.`, k: 'bad' };
        if (a.d.path === 'talk') return ok ? { t: 'Phiến đá có người đọc. Có ai đó để lại bên cạnh một bông cúc trắng, cánh còn đọng sương. Bạn nhìn bông hoa từ trong bóng tối cửa hầm. Từ ngày chết đi, chưa ai tặng bạn thứ gì.', k: 'good', bond: 20 } : { t: 'Phiến đá bị đập vỡ làm đôi, nửa có tên bạn nằm úp xuống bùn. Bạn nhặt nó lên, lau sạch, rồi đặt lại chỗ cũ. Không ai đọc nữa.', k: 'bad', bond: -10 };
        return ok ? { t: `${nm(p)} sa xuống hào, ngựa gãy chân, phải rút lui giữa đêm. Tiếng ngựa hí vọng lại rất lâu. Bạn đứng trên miệng hầm nhìn ánh đuốc xa dần. Lần này giữ được, nhưng người ấy sẽ còn quay lại.`, k: 'good' } : (X.cond('crack'), { t: `${nm(p)} biết trước mọi cái bẫy, bước qua từng cọc nhọn như đi trên đường nhà. Bạn mất thêm một đốt sống mới chui được xuống lối thoát. Bao đêm đào hào, rốt cuộc chỉ để người ta cười.`, k: 'bad' });
      } },
    climax: { title: 'Lần này không ai cản',
      body: (S, X, a, p) => { p.tier = Math.max(p.tier, X.ctier(S)); return `${nm(p)} giờ là ${G.tierName(p.tier)}, đứng một mình trước cửa hầm. Không đuốc, không người theo, chỉ có thanh kiếm sáng mờ trong sương. "Lần này không ai cản." Giọng người ấy vẫn trẻ như cái đêm bạn tha cho nó.`; },
      choices: (S, X, a, p) => [ch('fight', 'Đấu tới cùng', `Thua thì có thể bị thanh tẩy. Khả năng thắng chừng ${pct(vs(S, X, p, -.1 - (a.d.path === 'arm' && a.d.ok ? .2 : 0), .15, .85))}.`),
        ...(S.sm >= 25 || a.d.path === 'talk' ? [ch('talk', 'Nói chuyện', 'Kể cho người đó nghe bạn từng là ai.')] : []), ch('flee', 'Bỏ đi nơi khác', '')],
      apply(S, X, ch, a, p) {
        if (ch === 'fight') {
          if (X.rnd() < vs(S, X, p, -.1 - (a.d.path === 'arm' && a.d.ok ? .2 : 0), .15, .85)) { kill(S, p); fame(S, 5); return { t: `Trận ấy kéo dài tới khi trăng lặn. Bạn đặt thanh kiếm gãy của ${nm(p)} lên ngực người đó rồi lấp đất. Ngôi mộ mới nằm ngay cạnh hầm bạn. Đêm sau, bạn ngồi bên nó rất lâu, như ngồi với một người quen.`, o: 'slain' }; }
          if (X.chance(.2)) { X.die({ id: 'purge', text: `bị Thánh Kỵ Sĩ ${nm(p)} thanh tẩy` }); return null; }
          X.cond('crack'); return { t: 'Lưỡi kiếm sáng lướt qua, bạn vỡ nửa xương sườn. Bạn lăn xuống vực mới thoát, xương va vào đá kêu lách cách suốt dọc đường. Dưới đáy vực, bạn nằm ghép lại từng mảnh, chậm rãi, một mình.', o: 'beaten' };
        }
        if (ch === 'talk') { if (X.rnd() < .3 + S.sm / 150 + .3 * S.traits.social + (a.d.path === 'talk' && a.d.ok ? .3 : 0)) { p.bond = 20; p.role = 'ban'; return { t: `${nm(p)} nghe hết${a.d.path === 'talk' ? ', từ cái tên khắc trên phiến đá tới cái đêm bạn tha cho người ấy năm nào' : ', từ cuộc đời bạn trước khi chết tới cái đêm bạn tha cho người ấy năm nào'}. Rồi tra kiếm vào vỏ. Hai bên đứng im một lúc trong sương. ${nm(p)} quay ngựa đi, không nói lời nào.`, o: 'truce' }; }
          X.cond('crack'); return { t: `${nm(p)} không nghe, kiếm đã tuốt khỏi vỏ trước khi bạn dứt câu. Bạn chỉ kịp chạy, một bên xương sườn vỡ vụn. Sau lưng, giọng người ấy vang lên: "Xác chết không có quyền kể chuyện."`, o: 'beaten' }; }
        S.flags.migrateQ = 'Thánh Kỵ Sĩ biết chỗ của bạn.'; return { t: 'Bạn rời hầm trong đêm, lần này không mang theo gì. Sương dày, tiếng vó ngựa ở đâu đó phía sau. Bạn đi mãi tới khi trời gần sáng, chui xuống một ngôi mộ hoang không bia.', o: 'fled' };
      },
      auto: (S, X, a, p) => ((S.sm >= 25 || a.d.path === 'talk') && S.traits.social > .25 ? 'talk' : X.power(S) >= npcPow(p, -.3) ? 'fight' : 'flee'),
      bg: (S, X, a, p) => (a.d.ok ? { t: `${nm(p)} không bao giờ quay lại vùng này nữa. Giáo hội cần người ở chỗ khác, và lời thề với một bộ xương thì có thể đợi. Nghĩa địa cũ lại yên, cỏ mọc kín lối mòn.`, o: 'called' } : { t: `${nm(p)} lần tới nghĩa địa mới, nhưng bạn đã chui sâu tới mức đất cũng quên bạn. Người ấy đi qua đi lại trên đầu bạn mấy ngày liền. Rồi tiếng bước chân thưa dần, và mất hẳn.`, o: 'hidden' }) },
    after: {
      truce: (S, X, a, p) => { X.add('h', 8); return { t: `${nm(p)} để ở cửa hầm một bình dầu thánh đã cạn phép, và không bao giờ quay lại với kiếm. Thỉnh thoảng có người lạ ghé nghĩa địa, đặt xuống một bó hương. Bạn đoán là người ấy gửi. Cái bình rỗng, bạn đặt ở đầu hầm như một món quà.`, k: 'good' }; },
      slain: (S, X, a, p) => { X.cond('hunted'); return { t: `Giáo hội Quang Minh treo giải cho cái đầu lâu đã giết ${nm(p)}. Cáo thị dán khắp các cổng làng, vẽ một cái sọ chẳng giống bạn chút nào. Từ đó đêm nào cũng có tiếng chân người lùng sục quanh nghĩa địa. Ngôi mộ cạnh hầm, bạn vẫn nhổ cỏ.`, k: 'bad' }; },
      fled: () => ({ t: 'Bạn ở một nghĩa địa khác, giữa những ngôi mộ lạ. Đêm nào cũng nghe ngóng tiếng vó ngựa. Có đêm gió đẩy cánh cổng sắt kêu cót két, bạn nằm im tới sáng.', k: 'info' }),
      beaten: (S, X, a, p) => ({ t: `${nm(p)} kể khắp vùng đã thanh tẩy được bạn. Người ta tin, nên mấy năm liền không ai tới đào nữa. Bạn nằm yên dưới đất, ghép lại từng đốt xương. Chết rồi mà còn được người ta quên, cũng là một kiểu may.`, k: 'info' }),
      called: () => ({ t: 'Có những mối thù tự tan, vì người giữ nó có việc khác phải làm. Bạn không thắng, cũng không thua. Chỉ là một đêm nào đó, bạn nhận ra mình đã thôi nghe ngóng tiếng vó ngựa.', k: 'info' }),
      hidden: () => ({ t: 'Bạn nằm yên dưới đất một thời gian dài. Lửa hồn lụi đi một chút, nhưng còn. Rễ cây mọc xuyên qua lồng ngực, bạn để mặc. Có lúc bạn quên mất mình đang trốn ai.', k: 'info' })
    } });

  // ── Đứa bé tặng hoa (Bộ Xương) ──
  full('flower', { nameVi: 'Đứa bé tặng hoa', good: ['guard', 'kin', 'accepted', 'grown_away'], body: 'undead', undead: true,
    quest: (a, p) => `Đợi ${nm(p)} lớn`,
    marks: { guard: 'che_cho', kin: 'ban_cu', accepted: 'duoc_tin', fled: 'nguoi_la', grown_away: 'buong_bo', burned: 'tiec_nuoi' },
    sum: { guard: (d, p) => `được ${nm(p)}, đứa bé tặng hoa năm nào, đứng ra che chở`, kin: (d, p) => `làm bạn với ${nm(p)} từ khi nó còn bé tới khi nó có con`, accepted: (d, p) => `nhờ ${nm(p)} mà được cả làng chấp nhận`,
      fled: (d, p) => `bỏ đồi mà đi khi làng kéo đuốc lên`, grown_away: (d, p) => `để ${nm(p)} lớn lên và quên mình`, burned: (d, p) => `mất hầm vì đứa bé năm nào lỡ miệng` },
    gone: (S, p) => `Lâu lắm không thấy ${nm(p)} lên đồi. Lữ khách kể người đó đã mất. Bạn hái một bông hoa dại, đặt trước cửa hầm, đúng chỗ ngày xưa nó vẫn đặt. Lần này, hoa là của bạn.`,
    beat: { any: ['{p} lại lên đồi, để một bông hoa dại trước cửa hầm, rồi ngồi xuống kể chuyện như mọi lần.', '{p} hỏi bạn: "Ông có lạnh không?" Bạn không biết trả lời sao, chỉ khẽ lắc cái sọ.', 'Bạn khắc cho {p} một con chim bằng xương thú. Nó cầm lên ngắm, cười tít mắt.'] },
    acts: acts({ open: { st: ADE, wait: [1, 8] }, knot: { wait: [1, 30], when: (S, X, a, p) => G.castYrs(S, p) >= G.RACES[p.race].adult * .8 } }),
    open: (S, X, a, p) => ({ t: `${nm(p)} lại lên đồi, lần này mang theo một chiếc bánh bọc lá, còn ấm. Nó đặt bánh trước cửa hầm, ngồi kể chuyện trong làng, không đợi bạn trả lời: con bò nhà ai mới đẻ, bà cụ đầu ngõ ốm, đứa nhỏ hàng xóm bị ngã. Bạn không ăn được. Nhưng bạn cứ để chiếc bánh ở đó tới khi nó nguội hẳn.`, k: 'good', bond: 10 }),
    knot: { title: 'Đứa bé đã lớn', body: (S, X, a, p) => `${nm(p)} giờ đã lớn, vẫn lên đồi mỗi tuần. Đôi chân ngày xưa chạy lon ton giờ bước dài, giọng cũng trầm đi. Người làng bắt đầu để ý, hỏi nó lên đồi làm gì. Nghe nó lảng sang chuyện khác, bạn biết chuyện này không giấu được mãi.`,
      choices: (S, X, a, p) => [ch('teach', `Dạy ${nm(p)} chữ cổ`, 'Những gì bạn còn nhớ từ đời trước.'), ch('trust', `Kể cho ${nm(p)} bạn từng là ai`, 'Người lớn giữ bí mật kém trẻ con.'), ch('away', 'Bảo nó đừng lên đồi nữa', 'Vì nó, cũng vì bạn.')],
      apply(S, X, ch, a, p) {
        if (ch === 'teach') { bond(p, 15); X.add('h', 6); return `${nm(p)} học nhanh, lấy que củi viết chữ lên đất. Có hôm nó đọc được cả dòng chữ trên bia mộ của chính bạn. Nó đọc to tên bạn, rồi ngẩng lên nhìn. Hai bên im lặng rất lâu.`; }
        if (ch === 'trust') { bond(p, 25); return `Bạn kể: ngôi làng cũ, cái nghề cũ, rồi cái chết. ${nm(p)} nghe hết, không chen một câu. Rồi nó nắm lấy bàn tay xương của bạn, nắm chặt, như sợ bạn tan mất.`; }
        bond(p, -10); return `Bạn bảo nó đừng lên đồi nữa. ${nm(p)} khóc, rồi đi xuống đồi, vừa đi vừa quẹt nước mắt. Lâu lắm nó không lên nữa. Bông hoa cuối cùng nó để lại, bạn giữ trong hầm tới khi khô quắt.`;
      },
      auto: S => (S.sm >= 25 ? 'teach' : S.traits.social > .4 ? 'trust' : 'away') },
    trial: { base: (S, X, a, p) => (a.d.bg ? .6 : .45 + (p.bond > 50 ? .2 : 0) - (a.d.path === 'trust' ? .1 : 0)),
      run(S, X, a, ok, p) {
        if (a.d.bg) return ok ? { t: `${nm(p)} lấy chồng lấy vợ dưới làng. Thỉnh thoảng từ trên đồi, bạn thấy nó dắt con đi chợ, dáng đi y như hồi bé. Nó không ngẩng lên nhìn đồi. Bạn cũng chẳng mong nó nhìn.`, k: 'info' } : { t: `Bọn trẻ trong làng thách nhau lên đồi ném đá vào hầm. ${nm(p)} đứng dưới chân đồi, không ngăn. Một viên đá trúng phiến bia, vỡ mất một góc. Bạn nằm trong bóng tối, đếm từng tiếng đá rơi.`, k: 'bad' };
        return ok ? { t: `Người làng hỏi ${nm(p)} lên đồi làm gì. Nó bảo: đi hái thuốc, rồi giơ ra một nắm lá thật. Người ta gật gù, không hỏi nữa. Tối ấy nó lên đồi kể lại, cười khúc khích.`, k: 'good' } : { t: `${nm(p)} lỡ miệng kể với một đứa bạn. Đứa bạn kể với mẹ nó. Mẹ nó kể với cả xóm, mỗi lần thêm thắt một chút. Mấy đêm sau, dưới làng có ánh đuốc đi lại muộn hơn thường lệ.`, k: 'bad' };
      } },
    climax: { title: 'Đuốc lên đồi',
      body: (S, X, a, p) => `Dân làng kéo đuốc lên đồi${a.d.ok ? ', vì một con bò bị quái cắn chết; có người đổ cho bạn' : ', vì ai cũng biết có thứ gì đó sống trong hầm'}. ${nm(p)} chạy trước họ, tóc rối, thở hổn hển. Ánh lửa nhảy múa trên những phiến bia. Bạn nghe tiếng chân đông dần ngoài cửa hầm.`,
      choices: (S, X, a, p) => [ch('stand', 'Ra đứng trước cửa hầm', 'Để họ thấy bạn.'), ch('hide', `Trốn vào hầm, để ${nm(p)} nói`, ''), ch('flee', 'Đi lối sau', 'Bỏ hầm.')],
      apply(S, X, ch, a, p) {
        if (ch === 'stand') { if (X.chance(.4 + (p.bond > 50 ? .25 : 0) + (a.d.path === 'teach' ? .1 : 0))) { S.flags.revealed = true; X.add('h', 10); return { t: `Bạn bước ra trước cửa hầm, để họ thấy. ${nm(p)} đứng cạnh bạn: "${a.d.path === 'teach' ? 'Ông ấy dạy con chữ.' : 'Ông ấy là bạn con.'} Ông ấy chưa đụng tới ai." Đám đuốc đứng lại, im phăng phắc. Rồi từng ngọn, từng ngọn tản dần xuống đồi.`, o: 'accepted' }; }
          X.cond('crack'); X.add('hl', -10); return { t: `Đá ném như mưa, có cả đuốc ném theo. Bạn rút vào hầm, mất một bên vai. Ngoài kia người ta hò nhau lấp cửa. Trong tiếng ồn, bạn nghe ra giọng ${nm(p)} đang khóc gọi.`, o: 'burned' }; }
        if (ch === 'hide') { if (X.chance(.5 + (p.bond > 40 ? .2 : 0))) { const c = S.conds.find(c => c.id === 'hunted'); if (c) S.conds.splice(S.conds.indexOf(c), 1); return { t: `${nm(p)} đứng chắn trước cửa hầm, dang hai tay: "Muốn vào thì bước qua tôi." Không ai bước. Đám đuốc đứng một lúc, rồi tản dần. Bạn ngồi trong bóng tối, nghe tiếng thở dồn dập của nó ngoài cửa tới tận sáng.`, o: 'guard' }; }
          return { t: 'Họ lấp cửa hầm bằng đá, từng tảng một, vừa lấp vừa đọc kinh. Bạn đào ba tháng mới ra được. Lúc chui lên, cỏ đã mọc kín những tảng đá lấp.', o: 'burned' }; }
        S.flags.migrateQ = 'Làng đã biết chỗ của bạn.'; return { t: 'Bạn đi lối sau, không ngoái lại. Sau lưng, ánh đuốc tràn vào hầm cũ. Bạn đi mãi qua mấy ngọn đồi, tới khi không còn thấy ánh lửa nào nữa.', o: 'fled' };
      },
      auto: (S, X, a, p) => (p.bond > 50 ? 'hide' : S.traits.bold > .5 ? 'stand' : 'flee'),
      bg: (S, X, a, p) => (a.d.ok ? { t: `${nm(p)} lớn lên, có nhà có cửa dưới làng, không lên đồi nữa. Chiều chiều, bạn nhìn khói bếp nhà nó từ trên đồi, nhận ra ngay giữa bao nhiêu mái nhà. Khói lên thẳng, trời hôm ấy không gió.`, o: 'grown_away' } : { t: 'Bọn trẻ ném đá vào hầm cả mùa. Bạn đào sâu thêm, sâu tới mức tiếng đá chỉ còn như tiếng mưa xa. Trên đồi, chẳng còn ai mang hoa lên.', o: 'burned' }) },
    end: (S, X, a, p, o) => (o === 'guard' && a.d.path === 'teach' && a.d.ok ? 'kin' : o),
    after: {
      guard: (S, X, a, p) => ({ t: `Từ đó không ai lên đồi với đuốc nữa. ${nm(p)} vẫn lên, mỗi tuần một lần, mang theo hoa. Có lúc nó dẫn theo người khác, để họ thấy bạn không đáng sợ. Bậc đá lên đồi mòn dần dưới chân người.`, k: 'big', bond: 20 }),
      kin: (S, X, a, p) => { X.add('h', 8); return { t: `${nm(p)} dắt con lên đồi, chỉ vào bạn: "Ông ấy là bạn của mẹ." Đứa nhỏ không sợ, y như mẹ nó ngày trước. Nó đặt lên phiến đá một bông hoa dại, rồi đòi bạn khắc cho một con chim. Bạn ngồi khắc, tay xương vẫn còn nhớ cách.`, k: 'big', bond: 10 }; },
      accepted: (S, X) => { X.add('so', 6); return { t: 'Người làng gọi bạn là "ông già trên đồi". Mùa gặt có người mang lên một bó lúa, đặt ở cửa hầm. Trẻ con lên đồi chơi, thấy bạn không còn bỏ chạy. Có đứa còn hỏi trời lạnh thì xương có đau không.', k: 'big' }; },
      fled: () => ({ t: 'Ở nghĩa địa mới, không có ai mang hoa tới. Bạn tự hái một bông, đặt trước cửa hầm, rồi ngồi nhìn nó héo. Ngọn đồi cũ ở xa lắm, sau mấy rặng núi.', k: 'bad' }),
      grown_away: () => ({ t: 'Bông hoa cuối cùng khô dần trên phiến đá. Bạn để nó ở đó. Gió thổi bay từng cánh, qua mấy mùa chỉ còn lại cái cuống. Bạn vẫn để nó ở đó.', k: 'info' }),
      burned: () => ({ t: 'Bạn sống tiếp dưới đất, sâu hơn trước. Ánh sáng không còn lọt xuống tới chỗ bạn nằm. Thỉnh thoảng bạn nhớ mùi bánh bọc lá, rồi lại thôi.', k: 'bad' })
    } });

  // ── Lời bà đồng (không chiếm chỗ; a.d.y = tuổi bà đồng nói sẽ chết) ──
  const yrIn = (S, X, a) => X.years(S) >= a.d.y && X.years(S) < a.d.y + X.R(S).ypt * 2;
  full('prophecy', { nameVi: 'Lời bà đồng', passive: true, good: ['survived', 'defied', 'warded', 'calm'],
    marks: { survived: 'buong_bo', defied: 'cao_thu', warded: 'nguoi_moc_dao', calm: 'giu_loi', lost_year: 'tiec_nuoi' },
    sum: { survived: () => 'sống qua năm bà đồng nói sẽ chết', defied: () => 'đi thẳng vào năm hạn, và đi ra', warded: () => 'giải được hạn bà đồng nói', calm: () => 'không tin lời bà đồng, và đúng', lost_year: () => 'trốn cả năm hạn trong nhà' },
    acts: acts({ open: { st: ADE, wait: [0, 999], c: (S, X, a) => X.years(S) >= a.d.y - X.R(S).ypt * 6 }, knot: { wait: [0, 999] }, trial: { wait: [0, 999], c: (S, X, a) => X.years(S) >= a.d.y - X.R(S).ypt },
      climax: { wait: [0, 999], when: (S, X, a) => yrIn(S, X, a), st: ADE }, after: { wait: [1, 6] } }),
    open: (S, X, a) => ({ t: `Còn vài năm nữa là tới năm ${a.d.y} tuổi, năm bà đồng mù nói. Bạn bắt đầu đếm, bằng những vạch khắc nhỏ lên khung cửa. Mỗi mùa thêm một vạch. Có đêm thức giấc, bạn ra sờ lên những vạch ấy trong bóng tối.`, k: 'info' }),
    knot: { title: 'Lời bà đồng', body: (S, X, a) => `Bà đồng nói bạn sẽ chết năm ${a.d.y} tuổi. Năm ấy sắp tới. Giọng bà khàn khàn, đôi mắt trắng đục nhìn vào khoảng không sau lưng bạn, tới giờ bạn vẫn nhớ như in. Tin hay không, cũng phải làm một cái gì đó.`,
      choices: () => [ch('ward', 'Làm lễ giải hạn ở đền', 'Tốn tiền, được yên tâm.'), ch('seek', 'Tìm lại bà đồng hỏi cho rõ', 'Bà ta có thể đã chết.'), ch('away', 'Không tin', 'Lời đồn chợ búa.')],
      apply(S, X, ch, a) {
        if (ch === 'ward') { X.money(-Math.round(med(S, X) * .3)); if (S.faith) S.devotion = Math.min(100, (S.devotion || 0) + 5); return 'Thầy cúng đốt cả nắm hương, đọc kinh tới khuya, khói đặc tới mức cả nhà phải ra sân ngồi. Lúc về, thầy dặn ba điều kiêng. Bạn chép vào tờ giấy, dán ở đầu giường.'; }
        if (ch === 'seek') return X.chance(.5) ? 'Bạn tìm được bà đồng, giờ đã lú lẫn, ngồi phơi nắng trước hiên. Bà nhìn bạn, cười móm mém: "Ta nói thế à?" Bạn đứng đó một lúc, chẳng biết nên cười hay nên giận.' : 'Bà đồng đã chết từ lâu. Người trông đền chỉ cho bạn ngôi mộ, cỏ mọc um tùm. Bạn đứng trước mộ, có câu muốn hỏi mà chẳng còn ai trả lời.';
        X.add('h', 2); return 'Bạn cười, bảo lời đồn chợ búa thì tin làm gì. Nhưng đêm ấy vẫn nằm đếm ngón tay. Đếm xong, bạn nằm im nhìn mái nhà tới gần sáng.';
      },
      auto: S => (S.traits.pious > .5 ? 'ward' : S.traits.bold > .6 ? 'away' : 'seek') },
    trial: { base: (S, X, a) => .55 + (a.d.path === 'ward' ? .15 : 0),
      run: (S, X, a, ok) => (ok ? { t: 'Năm trước năm hạn trôi qua êm, êm tới mức chán. Bạn thấy mình ngớ ngẩn vì đã lo. Mấy vạch khắc trên khung cửa, có hôm bạn định đục đi, rồi lại thôi.', k: 'good' } : (X.add('hl', -6), { t: 'Năm trước năm hạn, bạn ngã gãy tay, sốt một trận dài. Nằm mê man, bạn nghe như có tiếng bà đồng thì thầm bên tai. Tỉnh dậy, việc đầu tiên là nhìn lên khung cửa đếm lại những vạch khắc.', k: 'bad' })) },
    climax: { title: 'Năm hạn', body: (S, X) => `Năm nay bạn ${X.years(S)} tuổi, đúng năm bà đồng mù nói. Sáng nào thức dậy, bạn cũng nằm thêm một lúc, nghe xem tim mình còn đập không. Người nhà nói năng nhỏ nhẹ hơn thường ngày. Cả năm dài trước mặt, chẳng biết ngày nào là ngày ấy.`,
      choices: () => [ch('home', 'Ở yên trong nhà cả năm', 'Không đi đâu, không làm gì.'), ch('live', 'Sống như thường', ''), ch('face', 'Đi thẳng vào chỗ nguy', 'Xem số phận làm gì được mình.')],
      apply(S, X, ch) {
        if (ch === 'home') { X.money(-Math.round(med(S, X) * .3)); X.add('h', -3); return { t: 'Bạn đóng cửa, nhờ hàng xóm mua giùm gạo muối. Cả năm bạn không bước qua ngưỡng cửa. Ngày dài lê thê, bạn ngồi đếm vết nứt trên tường, nghe tiếng chợ phiên từ xa vọng lại.', o: 'lost_year' }; }
        if (ch === 'face') { if (X.chance(odds(S, X, .65))) { fame(S, 2); X.add('h', 8); return { t: 'Bạn nhận chuyến hộ tống qua đèo mà ai cũng từ chối. Gió đèo rít suốt đêm, có lúc đá lăn sát bên chân. Bạn về, không sứt một sợi tóc. Người làng nhìn bạn như nhìn kẻ vừa đánh cược với trời.', o: 'defied' }; }
          X.add('hl', -20); X.cond('wound'); return { t: 'Đá lở trên đèo, cả sườn núi đổ xuống trong một tiếng gầm. Bạn sống sót, nằm ba tháng. Bà đồng chỉ sai có một chút.', o: 'survived' }; }
        X.add('h', -1); return { t: 'Bạn vẫn đi chợ, vẫn làm lụng, ăn uống như thường. Chỉ có điều đi đâu cũng nhìn trước ngó sau, qua cầu thì bám chặt tay vịn. Năm ấy dài hơn mọi năm.', o: 'survived' };
      },
      auto: S => (S.traits.bold > .65 ? 'face' : S.traits.pious > .6 || S.traits.bold < .3 ? 'home' : 'live') },
    end: (S, X, a, p, o) => (o === 'survived' && a.d.path === 'ward' ? 'warded' : o === 'survived' && a.d.path === 'away' && a.d.ok ? 'calm' : o),
    after: {
      survived: (S, X) => { X.add('h', 8); return 'Bạn sống qua năm bà đồng nói. Bạn mua một vò rượu ngon, uống một mình, cười một mình. Rồi bạn đục hết những vạch khắc trên khung cửa. Gỗ bên dưới vẫn còn mới.'; },
      defied: (S, X) => { X.add('h', 8); return 'Người ta kể chuyện bạn đi qua năm hạn như đi qua một cái cổng. Bạn kể lại, mỗi lần thêm một chút: con đèo cao hơn, đá lở to hơn. Bọn trẻ nghe xong cứ đòi kể lại từ đầu.'; },
      warded: (S, X) => { X.add('h', 6); return 'Năm hạn qua. Bạn mang lễ lên đền tạ, nhiều gấp đôi lần giải hạn. Thầy cúng xoa tay cười. Tờ giấy ba điều kiêng ở đầu giường, bạn để nguyên thêm mấy năm nữa, cho chắc.'; },
      calm: (S, X) => { X.add('h', 6); return 'Năm hạn qua như mọi năm. Bạn kể chuyện bà đồng như kể chuyện cười. Ai nghe cũng cười. Chỉ mình bạn biết đêm đầu năm ấy mình đã thức trắng.'; },
      lost_year: (S, X) => ({ t: 'Năm hạn qua. Bạn bước ra cửa, thấy cây bàng trước nhà đã cao thêm một đầu người. Đứa trẻ hàng xóm ngày nào giờ đã biết chào. Một năm bạn trốn, đời ngoài kia vẫn chạy.', k: 'info' })
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
    beat: { any: ['{p} gửi tới một mối việc nhỏ, trả công sòng phẳng, kèm một câu dặn viết vội.', 'Bạn ghé cửa hàng của {p}, uống chén trà, nghe chuyện buôn bán. Ấm trà bao giờ cũng pha sẵn phần bạn.'] },
    open: (S, X, a, p) => ({ t: `${nm(p)}, người thuê bạn năm trước, quay lại tìm. Việc năm ấy bạn làm vừa ý, ${nm(p)} còn nhớ từng chi tiết. Lần này có việc lớn hơn, tiền cũng lớn hơn. ${nm(p)} ngồi xuống, rót trà, chưa vội nói giá.`, k: 'good', bond: 10 }),
    knot: { title: 'Việc lớn của người thuê', body: (S, X, a, p) => `${nm(p)} cần người áp tải một chuyến hàng qua ${X.reg(S).zones[0].nameVi}. Dạo này đường ấy không yên, nghe nói đã có đoàn bị chặn. ${nm(p)} trả giá như cũ, mắt nhìn bạn dò xét. Một mối làm ăn lâu dài hay một chuyến đi liều, tùy bạn nhìn nó thế nào.`,
      choices: () => [ch('take', 'Nhận, giá như cũ', 'Giữ mối lâu dài.'), ch('haggle', 'Đòi trả trước một nửa', 'Chắc tiền; người thuê có thể phật ý.'), ch('away', 'Từ chối', 'Việc này nguy hiểm.')],
      apply(S, X, ch, a, p) {
        if (ch === 'take') { bond(p, 10); return `Bạn bắt tay ${nm(p)}. Không cần giấy. ${nm(p)} cười, vỗ vai bạn: "Ta biết mà." Sáng hôm sau, đoàn xe chất hàng đã đợi sẵn ở cổng.`; }
        if (ch === 'haggle') { X.money(Math.round(med(S, X) * .4)); bond(p, -10); return `${nm(p)} nhíu mày, gõ ngón tay lên bàn một lúc lâu, rồi đếm tiền. Nửa số công nằm gọn trong túi bạn. Lúc tiễn bạn ra cửa, ${nm(p)} không còn cười như lúc mới tới.`; }
        return `${nm(p)} gật đầu, cảm ơn, rồi đi tìm người khác. Bạn đứng ở cửa nhìn theo. Việc nguy thì không nhận, mà sao vẫn thấy tiếc.`;
      },
      auto: (S, X) => (S.traits.social > .5 ? 'take' : S.traits.bold > .3 ? 'haggle' : 'away') },
    trial: { base: (S, X, a, p) => (a.d.bg ? .5 : odds(S, X, .55)),
      run(S, X, a, ok, p) {
        if (a.d.bg) return ok ? { t: `Người ${nm(p)} thuê thay bạn áp tải trót lọt, được trả gấp đôi. Tin ấy truyền khắp chợ. Bạn nghe, nhấp ngụm trà, không nói gì.`, k: 'info' } : { t: `Chuyến hàng của ${nm(p)} bị cướp giữa đường, người áp tải bỏ chạy. Cả chợ bàn tán mấy ngày. Bạn nghĩ tới con đường ấy, và cái lắc đầu của mình hôm nọ.`, k: 'info' };
        if (ok) { X.money(Math.round(med(S, X) * .6)); return { t: `Chuyến hàng tới nơi đủ, không mất một bao. Có một đêm bạn thức trắng canh lửa, nghe tiếng sói tru quanh trại. Tới nơi, ${nm(p)} đếm hàng xong là trả công ngay, thêm cả tiền thưởng.`, k: 'good', bond: 10 }; }
        X.add('hl', -8); return { t: `Cướp chặn đường ở khúc quanh hẹp nhất. Bạn giữ được nửa chuyến hàng, đổi bằng một vết chém dọc cánh tay. Về tới nơi, ${nm(p)} nhìn đống hàng còn lại, rồi nhìn vết thương của bạn, mãi không nói gì.`, k: 'bad', bond: -5 };
      } },
    climax: { title: 'Mối làm ăn lâu dài', body: (S, X, a, p) => `${nm(p)} mở thêm cửa hàng, mời bạn góp vốn: "Ngươi lo đường, ta lo chợ." Trên bàn đã bày sẵn tờ giấy, chỉ còn chừa chỗ ký. ${a.d.ok ? `Chuyến hàng năm nọ, ${nm(p)} vẫn nhắc mãi với mọi người.` : 'Nửa chuyến hàng mất năm nọ, cả hai đều tránh không nhắc.'}`,
      choices: (S, X) => [ch('partner', 'Góp vốn', `Chừng ${G.coin(Math.round(med(S, X)))}.`), ch('wage', 'Chỉ làm thuê như cũ', ''), ch('leave', 'Thôi, đi đường riêng', '')],
      apply(S, X, ch, a, p) {
        if (ch === 'partner') { X.money(-Math.round(med(S, X))); return { t: 'Bạn đặt túi tiền lên bàn, tiếng bạc va nhau lanh canh. Hai người ký giấy, có người làm chứng. Tối ấy bạn nằm mãi không ngủ, tính đi tính lại những con đường sẽ đi.', o: 'partner' }; }
        if (ch === 'wage') return { t: `Bạn lắc đầu, nhận việc theo chuyến như cũ. ${nm(p)} hơi tiếc, nhưng không nài. Công theo chuyến ít mà chắc, bạn quen rồi.`, o: 'steady' };
        bond(p, -5); return { t: `Bạn cảm ơn ${nm(p)}, nhận chuyến cuối rồi thôi. Chuyến ấy đi êm, như để tiễn bạn. Lúc chia tay ở cổng chợ, hai người bắt tay lâu hơn thường lệ.`, o: 'parted' };
      },
      auto: (S, X) => (S.gold > med(S, X) * 1.5 && S.traits.bold > .4 ? 'partner' : S.traits.bold > .65 ? 'leave' : 'wage'),
      bg: (S, X, a, p) => (a.d.ok ? { t: `${nm(p)} giàu lên nhờ người áp tải mới. Cửa hàng mở thêm gian, biển hiệu sơn lại đỏ chót. Bạn đi ngang, thấy người áp tải mới ngồi đúng cái ghế bạn hay ngồi uống trà.`, o: 'passed' } : { t: `${nm(p)} vỡ nợ sau chuyến hàng mất, bỏ đi nơi khác. Cửa hàng đóng im ỉm, tấm biển cũ xệ một bên. Bạn đứng nhìn một lúc, rồi đi tiếp.`, o: 'passed' }) },
    end(S, X, a, p, o) {
      if (o === 'partner') return a.d.ok && a.d.path !== 'haggle' ? 'more' : 'burned';
      if (o === 'steady' && a.d.path === 'haggle' && !a.d.ok) return 'stiff';
      return o;
    },
    after: {
      more: (S, X, a, p) => { X.money(Math.round(med(S, X) * 2)); return { t: `Cửa hàng của ${nm(p)} và bạn mở thêm chi nhánh thứ ba. Ở chợ người ta gọi hai người là "đôi đũa": đi đâu cũng có nhau, thiếu một chiếc thì chẳng gắp được gì. Tối cuối năm, hai người ngồi tính sổ, cười tới khuya.`, k: 'big', bond: 15 }; },
      steady: (S, X) => { X.money(Math.round(med(S, X) * .5)); return 'Năm nào cũng có việc, tiền công đều tay, không ai nợ ai. Đường áp tải bạn thuộc như lòng bàn tay, từng khúc quanh, từng quán nước. Không giàu, mà cũng chẳng thiếu.'; },
      stiff: (S, X, a, p) => { X.money(-Math.round(med(S, X) * .3)); return { t: `${nm(p)} thuê bạn lần nữa, rồi biến mất trước ngày trả công. Cửa hàng khóa trái, người làm bảo chủ đi vắng. Bạn ghi nhớ cái tên ấy. Lần đòi trả trước năm nào, thì ra người ta cũng ghi nhớ.`, k: 'bad', bond: -40 }; },
      parted: () => ({ t: 'Bạn đi làm riêng. Có những năm nhớ cái mối cũ, nhớ ấm trà pha sẵn, nhưng không hối hận. Đường riêng gập ghềnh hơn, mà bước nào cũng là của mình.', k: 'info' }),
      passed: (S, X, a) => ({ t: a.d.ok ? 'Có những mối việc mình nhường đi rồi mới biết là lớn. Bạn vẫn đi qua cửa hàng ấy mỗi phiên chợ, không vào. Buôn bán, may rủi cách nhau một cái gật đầu.' : 'Có những mối việc mình từ chối mà lại hóa may. Nghĩ tới chuyến hàng bị cướp, bạn vẫn rùng mình. Buôn bán, may rủi cách nhau một cái gật đầu.', k: 'info' }),
      burned: (S, X, a, p) => ({ t: `Cửa hàng sập sau hai mùa. ${nm(p)} trả lại bạn được một phần ba số vốn, xin lỗi mãi. Bạn cầm tiền, không trách. Tờ giấy góp vốn năm ấy, bạn giữ lại như một bài học.`, k: 'bad' })
    } });

  // ── Phe trong hội (vào một hội) ──
  grow('s_guild', { nameVi: 'Phe trong hội', from: 'org_join', p: .5, when: (S, X, k) => k !== 'no', good: ['leader', 'old', 'young_win', 'broker'],
    quest: () => 'Đứng về phía nào trong hội',
    marks: { leader: 'nguoi_dung_dau', old: 'duoc_tin', young_win: 'vuot_doi_thu', young_lose: 'ke_thu', lost_seat: 'cay_dang', broker: 'giu_loi', out: 'tiec_nuoi' },
    sum: { leader: () => 'lên làm hội trưởng sau một vụ chia phe', old: () => 'đứng về phía hội trưởng lúc hội chia phe', young_win: () => 'cùng phe trẻ đổi mới cả hội', young_lose: () => 'thua trong một vụ chia phe ở hội',
      lost_seat: () => 'ra tranh ghế hội trưởng và thua', broker: () => 'hòa giải hai phe trong hội', out: () => 'đứng ngoài lúc hội chia phe' },
    beat: { any: ['Bạn ngồi họp hội tới khuya, nghe hai phe cãi nhau về một điều luật. Đèn dầu cạn, người ta thắp thêm, cãi tiếp.', 'Người phe bên kia mời bạn đi uống. Bạn đi, nghe nhiều hơn nói, về nhà nhớ từng câu.'] },
    open: () => ({ t: 'Hội trưởng đã già, bước lên bục cũng phải có người đỡ. Phe trẻ muốn đổi luật chia phần, bàn bạc trong quán rượu tới khuya. Ai cũng đang xem người mới như bạn đứng bên nào. Ngay buổi họp đầu, bạn đã thấy những cái nhìn dò xét.', k: 'info' }),
    knot: { title: 'Hội chia phe', body: () => 'Hai phe đều mời bạn tới bàn, một bên bằng chén trà, một bên bằng vò rượu. Không chọn cũng là chọn. Đêm ấy bạn nằm nghĩ rất lâu về những gương mặt ở hai đầu bàn họp.',
      choices: () => [ch('old', 'Đứng về hội trưởng', 'Giữ nếp cũ.'), ch('young', 'Theo phe trẻ', 'Thắng thì lên, thua thì có thù.'), ch('away', 'Đứng ngoài', '')],
      apply(S, X, ch) { if (ch === 'old') { X.add('so', 3); return 'Bạn ngồi cạnh hội trưởng ở buổi họp. Hội trưởng không nói gì, chỉ đặt bàn tay khô gầy lên tay bạn một lúc. Phía bên kia bàn, có người bĩu môi.'; } if (ch === 'young') { G.trajBump(S, { vo: .1 }); return 'Bạn ký tên vào tờ thỉnh nguyện của phe trẻ, ngay dưới mấy cái tên nổi tiếng nóng tính. Tối ấy cả phe kéo nhau đi uống mừng. Sáng hôm sau ở hội, hội trưởng nhìn bạn rất lâu.'; } return 'Bạn không tới buổi họp. Cả hai phe đều hiểu. Từ đó ở hội, người ta chào bạn lịch sự hơn, mà cũng xa cách hơn.'; },
      auto: S => (S.traits.bold > .55 ? 'young' : S.traits.social > .5 ? 'old' : 'away') },
    trial: { base: S => .45 + (S.so - 50) / 200,
      run: (S, X, a, ok) => (a.d.bg ? { t: ok ? 'Phe trẻ mạnh lên, kéo được nửa hội. Buổi họp nào cũng ồn như chợ. Bạn ngồi ở hàng cuối, nghe, không giơ tay.' : 'Hội trưởng dẹp được phe trẻ, đuổi hai người cầm đầu. Hôm họ đi, cả hội đứng nhìn, không ai nói gì. Bạn đứng lẫn trong đám đông ấy.', k: 'info' }
        : ok ? { t: 'Phe bạn kéo thêm được mười người. Ở hội, người ta bắt đầu chào bạn trước. Có người còn tìm tới tận nhà, xin bạn nói đỡ một câu.', k: 'good' } : { t: 'Phe bạn mất người. Có kẻ bỏ sang bên kia, mang theo cả danh sách những người đã ký tên. Mấy hôm liền, đi ngang trụ sở hội, bạn thấy người ta thôi chào.', k: 'bad' }) },
    climax: { title: 'Bầu hội trưởng', body: () => 'Hội trưởng xin nghỉ. Ghế để trống, cả hội họp kín ba ngày. Chiếc ghế gỗ mòn bóng ở tay vịn, ba ngày không ai dám ngồi. Ngoài sân, người ta xì xào tên những ai sẽ ra tranh.',
      choices: S => [ch('run', 'Tự ra tranh ghế', `Chừng ${pct(G.clamp(.25 + (S.so - 50) / 150 + S.fame / 200, .05, .85))} thắng.`), ch('back', 'Đứng sau người phe mình', ''), ch('broker', 'Đứng ra hòa giải', 'Hai phe chia ghế phó.')],
      apply(S, X, ch, a) {
        if (ch === 'run') { if (X.rnd() < G.clamp(.25 + (S.so - 50) / 150 + S.fame / 200 + (a.d.ok ? .15 : 0), .05, .85)) { fame(S, 4); X.add('so', 6); return { t: 'Cả hội giơ tay. Bạn ngồi vào chiếc ghế đã mòn của người cũ, hai bàn tay đặt đúng chỗ gỗ bóng nhất. Tiếng vỗ tay vang ra tận ngoài đường. Đêm ấy bạn mới thấy cái ghế ấy nặng.', o: 'leader' }; } X.add('h', -4); return { t: 'Bạn thua bốn phiếu. Bốn người ấy, bạn biết mặt cả bốn. Bạn đứng dậy chúc mừng người thắng, giọng không run, rồi về nhà ngồi một mình tới khuya.', o: 'lost_seat' }; }
        if (ch === 'broker') { X.add('so', 5); return { t: 'Bạn thuyết phục được cả hai phe ngồi chung một bàn, cãi tới sáng mới xong. Ghế trưởng một bên, ghế phó một bên. Lúc ra về, người hai phe đi chung một đường, lần đầu sau mấy năm.', o: 'broker' }; }
        return { t: 'Bạn đứng sau người phe mình suốt buổi bầu, tay khoanh trước ngực. Kết quả đọc lên lúc trời đã tối. Bạn nghe xong, gật đầu, rồi về.', o: 'back' };
      },
      auto: S => (S.traits.bold > .6 && S.so > 55 ? 'run' : S.traits.social > .6 ? 'broker' : 'back'),
      bg: () => ({ t: 'Hội bầu xong hội trưởng mới. Bạn nghe kết quả ở chợ, từ miệng một bà bán cá. Người thắng là ai, bạn phải hỏi lại mới nhớ ra mặt.', o: 'out' }) },
    end(S, X, a, p, o) { if (o !== 'back') return o; if (a.d.path === 'old') return a.d.ok ? 'old' : 'young_lose'; return a.d.ok ? 'young_win' : 'young_lose'; },
    after: {
      leader: () => ({ t: 'Việc đầu tiên bạn làm là sửa lại luật chia phần, để không ai phải chia phe nữa. Có người phục, có người không. Nhưng mấy năm liền, chẳng còn ai họp kín trong quán rượu.', k: 'big' }),
      old: () => ({ t: 'Hội giữ nếp cũ. Người cũ nhớ ơn bạn; người trẻ thì không. Lúc hội trưởng cũ mất, gia đình mời bạn đứng đầu đoàn đưa tang.', k: 'good' }),
      young_win: () => ({ t: 'Luật chia phần mới mang tên bạn trong danh sách người đề xướng, khắc lên tấm bảng gỗ treo ở hội. Mỗi lần đi ngang, bạn liếc nhìn một cái, rồi làm như không.', k: 'good' }),
      young_lose: () => ({ t: 'Phe bạn thua. Người thắng nhớ tên từng người đứng phía bên kia. Mấy năm liền bạn chỉ được giao những việc không ai muốn làm. Bạn làm, không than, đợi ngày.', k: 'bad' }),
      lost_seat: () => ({ t: 'Bạn vẫn ở hội, ngồi hàng thứ hai. Có những buổi họp bạn không lên tiếng. Người ngồi ghế trưởng thỉnh thoảng liếc xuống chỗ bạn, như sợ bạn đứng dậy.', k: 'bad' }),
      broker: () => ({ t: 'Mười năm sau hội vẫn còn nguyên. Người ta bảo nhờ một buổi họp năm ấy. Ai mới vào hội cũng được nghe kể chuyện đêm hai phe cãi nhau tới sáng, và người đã khiến họ ngồi lại.', k: 'good' }),
      out: () => ({ t: 'Hội đổi chủ, bạn đổi chỗ ngồi. Không ai hỏi ý bạn nữa. Bạn vẫn đóng phần đều đặn, vẫn tới họp, ngồi ở góc gần cửa ra.', k: 'info' })
    } });

  // ── Lứa thú con (đi săn tiền thưởng) ──
  grow('s_cubs', { nameVi: 'Lứa thú con', from: 'bounty', p: .35, when: (S, X, k) => k === 'go', good: ['bonded', 'wild', 'kill'],
    quest: () => 'Lứa thú con của con quái đã hạ',
    marks: { bonded: 'ban_cua_thu', wild: 'buong_bo', kill: 'tay_mau', mauled: 'cay_dang', sell: 'cua_phi_nghia', grown_wild: 'tiec_nuoi' },
    sum: { bonded: () => 'nuôi lớn con thú của con quái mình đã hạ, thành bạn đồng hành', wild: () => 'nuôi lứa thú con rồi thả về rừng', kill: () => 'giết cả con mẹ tìm về báo thù cho lứa con',
      mauled: () => 'bị con thú mẹ tìm về cào nát vai', sell: () => 'bán lứa thú con cho kẻ săn da', grown_wild: () => 'để lứa thú con lớn lên hoang dã' },
    beat: { any: ['Con thú nhỏ ngủ dưới chân bạn, thở phì phò, thỉnh thoảng giật giật chân như đang mơ chạy.', 'Bạn đi ngang cái hang cũ, thấy dấu chân mới in trên bùn. Bạn rảo bước.'] },
    open: () => ({ t: 'Thợ săn trong vùng báo: trong hang của con quái bạn hạ năm ngoái, có một lứa con non đang đói. Người ấy nói xong thì nhìn bạn, như chờ bạn quyết. Đêm ấy bạn nghe tiếng rít khe khẽ vọng về từ phía rừng, chẳng biết thật hay mơ.', k: 'info' }),
    knot: { title: 'Lứa thú con', body: () => 'Lứa con non nằm co trong hang, mắt còn chưa mở hết. Hang tanh mùi con quái đã chết. Một con bò lại gần, dụi mõm vào chân bạn, kêu khe khẽ. Bàn tay cầm vũ khí của bạn bỗng nặng trĩu.',
      choices: () => [ch('kill', 'Giết hết cho xong', 'Lớn lên chúng sẽ xuống làng.'), ch('raise', 'Mang một con về nuôi', 'Có thể thành bạn, có thể thành họa.'), ch('sell', 'Bán cho kẻ săn da', 'Được giá.'), ch('away', 'Để mặc chúng', 'Rừng tự lo.')],
      apply(S, X, ch) {
        if (ch === 'kill') { X.add('h', -4); return 'Bạn làm việc cần làm rồi lấp cửa hang. Đêm ấy bạn không ăn được. Tiếng kêu khe khẽ trong hang, về sau bạn còn nghe lại nhiều lần.'; }
        if (ch === 'raise') { S.flags.pet = 'thú con của con quái năm nào'; X.gain('Taming', 6); X.add('h', 4); return 'Bạn bọc con nhỏ nhất trong áo mang về. Nó cắn bạn ba lần trước khi chịu ăn. Đêm đầu tiên nó rúc vào góc bếp, mắt sáng quắc. Tới sáng thì đã nằm cuộn tròn bên chân bạn.'; }
        if (ch === 'sell') { X.money(Math.round(med(S, X) * .6)); return 'Kẻ săn da trả tiền mặt, không hỏi gì. Hắn nhét lứa con non vào bao tải, buộc chặt miệng. Tiếng kêu bị bóp nghẹt trong bao. Bạn đếm tiền, không nhìn lên.'; }
        return 'Bạn quay lưng đi. Sau lưng có tiếng rít khe khẽ. Rừng tự lo, bạn tự nhủ, rồi bước nhanh hơn.';
      },
      auto: S => (S.traits.social > .6 ? 'raise' : S.traits.pious < .3 ? 'sell' : S.traits.bold > .5 ? 'kill' : 'away') },
    trial: { base: (S, X, a) => (a.d.path === 'raise' ? .5 + .3 * S.traits.social : .5),
      run(S, X, a, ok) {
        if (a.d.bg) return ok ? { t: 'Lứa thú con sống sót, kéo nhau vào sâu trong rừng. Người đi rừng kể thấy chúng ở khe suối, đã lớn bằng con chó. Bạn nghe, không nói gì.', k: 'info' } : { t: 'Mùa đông năm ấy lứa thú con chết đói gần hết. Tuyết phủ kín cửa hang. Bạn đi ngang, thấy mấy vết chân nhỏ dừng lại ở mép tuyết.', k: 'info' };
        if (a.d.path === 'raise') return ok ? { t: 'Con thú lớn nhanh, theo bạn như cái bóng. Lũ trẻ trong làng xin được sờ đầu nó, rồi chạy ù đi khi nó ngáp. Có lần bạn ốm, nó nằm trước cửa buồng suốt ba ngày, không chịu ăn.', k: 'good' } : { t: 'Con thú lớn lên, hung hơn bạn tưởng. Nó cắn chết hai con gà nhà hàng xóm, tha về thả trước cửa như khoe. Hàng xóm sang nói chuyện, mặt nặng như chì.', k: 'bad' };
        return ok ? { t: 'Chuyện lứa thú con qua đi. Bạn không nghĩ tới nữa. Chỉ có cái hang cũ, mỗi lần đi ngang, bạn vẫn tránh xa ra một chút.', k: 'info' } : { t: 'Người đi rừng thấy dấu chân rất lớn quanh cái hang cũ. Có thứ gì đó đang tìm. Mấy đêm liền chó trong làng sủa dồn về phía rừng.', k: 'bad' };
      } },
    climax: { title: 'Con thú đã lớn',
      body: (S, X, a) => (a.d.path === 'raise' ? 'Con thú đã lớn bằng con bê, đi tới đâu gà vịt chạy tán loạn tới đó. Người làng bắt đầu sợ; trưởng làng gọi bạn lên nói chuyện. Nó nằm chờ ngoài cổng, mắt không rời cánh cửa.' : 'Con mẹ của lứa thú ấy, to gấp đôi con bạn hạ năm nào, mò về tới bìa làng. Đêm qua nó gầm từ đầu hôm tới gần sáng. Người làng nhìn nhau, rồi nhìn về phía nhà bạn.'),
      choices: (S, X, a) => (a.d.path === 'raise' ? [ch('keep', 'Giữ nó bên mình', 'Bạn chịu trách nhiệm.'), ch('free', 'Thả về rừng', 'Nó sẽ không quên bạn.')]
        : [ch('fight', 'Ra đấu với nó', `Khả năng thắng chừng ${pct(odds(S, X, .45))}.`), ch('ward', 'Cùng làng dựng rào, đốt lửa đuổi', '')]),
      apply(S, X, ch, a) {
        if (ch === 'keep') { if (a.d.ok) { X.add('h', 6); return { t: 'Bạn dắt nó đi một vòng quanh làng, đeo cho nó một cái chuông. Nó đi tới đâu, chuông kêu leng keng báo trước tới đó. Người làng quen dần. Có bà cụ còn để dành cho nó khúc xương.', o: 'bonded' }; } X.add('so', -5); return { t: 'Nó cắn một đứa trẻ. Bạn phải tự tay làm việc mà năm ấy bạn đã không làm. Lúc ấy nó vẫn nhìn bạn, đuôi còn khẽ vẫy. Bạn chôn nó ở bìa rừng, rồi ngồi đó tới tối.', o: 'kill' }; }
        if (ch === 'free') { X.add('h', -2); return { t: 'Bạn dắt nó vào sâu trong rừng, tháo dây. Nó đứng nhìn bạn rất lâu rồi mới đi. Được mấy bước lại ngoái lại. Bạn đứng yên tới khi nó khuất hẳn sau những thân cây.', o: 'wild' }; }
        if (ch === 'fight') { if (X.chance(odds(S, X, .45))) { fame(S, 2); return { t: 'Bạn hạ con thú mẹ ở bìa rừng, sau một trận vờn nhau từ chập tối tới nửa đêm. Làng treo da nó ở đình. Trẻ con kéo nhau ra xem, sờ vào bộ lông dày cộm. Bạn thì chưa ra xem lần nào.', o: 'kill' }; } X.add('hl', -15); X.cond('wound'); return { t: 'Con thú mẹ cào nát vai bạn rồi bỏ đi, không quay lại. Bạn nằm trên đất, nghe tiếng nó lùi dần vào rừng. Người làng khiêng bạn về, cả đêm không ai dám tắt đuốc.', o: 'mauled' }; }
        X.add('so', 3); return { t: 'Cả làng đốt lửa canh ba đêm, gõ mõ, gõ chiêng. Con thú lượn quanh rào, gầm gừ, rồi bỏ đi. Sáng thứ tư, người ta thấy dấu chân nó dẫn thẳng vào núi sâu.', o: a.d.path === 'sell' ? 'sell' : 'kill' };
      },
      auto: (S, X, a) => (a.d.path === 'raise' ? (S.traits.social > .5 ? 'keep' : 'free') : S.traits.bold > .5 ? 'fight' : 'ward'),
      bg: () => ({ t: 'Có năm người ta thấy một bầy thú lạ ở rìa rừng. Không ai biết chúng từ đâu ra; bạn thì biết. Bạn đứng trên đồi nhìn chúng chạy qua bãi cỏ, con đầu đàn ngẩng lên nhìn về phía làng.', o: 'grown_wild' }) },
    end: (S, X, a, p, o) => (o === 'kill' && a.d.path === 'sell' ? 'sell' : o),
    after: {
      bonded: () => ({ t: 'Con thú theo bạn tới cuối đời. Về già nó nằm sưởi nắng trước hiên cả ngày, chuông trên cổ đã gỉ. Lúc nó chết, bạn chôn nó cạnh nhà, cắm cái chuông lên mộ. Gió thổi qua, chuông vẫn kêu.', k: 'big' }),
      wild: () => ({ t: 'Có năm bạn vào rừng, thấy một con thú lớn đứng trên đỉnh dốc nhìn xuống. Nó không lại gần, cũng không bỏ đi. Hai bên nhìn nhau một lúc lâu. Rồi nó quay đầu, thong thả đi vào rừng.', k: 'good' }),
      kill: () => ({ t: 'Chuyện lứa thú con khép lại bằng máu, như nó đã bắt đầu. Cái hang cũ giờ cỏ mọc kín lối vào. Bạn không đi qua đó nữa.', k: 'info' }),
      mauled: () => ({ t: 'Mỗi lần trời trở, vai bạn nhức như có ai bóp. Bạn không vào rừng một mình nữa. Nghe tiếng gầm xa xa, tay bạn tự đưa lên ôm vai.', k: 'bad' }),
      sell: () => ({ t: 'Có lần bạn thấy một tấm da thú lạ treo ở cửa hàng kẻ săn da, lông còn mềm. Bạn đi nhanh qua. Món tiền năm ấy, bạn tiêu đã hết từ lâu.', k: 'bad' }),
      grown_wild: () => ({ t: 'Rừng tự lo, như bạn nói. Rừng lo theo cách của rừng. Mấy năm sau, mùa nào làng cũng mất vài con dê, và người ta lại nhìn về phía cái hang cũ.', k: 'info' })
    } });

  // ── Đồng đội trong đoàn (vào đoàn lính đánh thuê) ──
  grow('s_comrade', { nameVi: 'Đồng đội trong đoàn', from: 'merc', p: .5, when: (S, X, k) => k !== 'no', good: ['saved_p', 'rank', 'drift'],
    who: () => ({ role: 'ban', how: 'đồng đội trong đoàn lính đánh thuê', work: 'guard', bond: 30 }),
    quest: (a, p) => `Giữ lưng cho ${nm(p)}`,
    marks: { saved_p: 'huynh_de', saved: 'no_mau', rank: 'duoc_tin', thief: 'ke_thu', fled: 'tieng_xau', drift: 'ban_cu', fell: 'tiec_nuoi' },
    sum: { saved_p: (d, p) => `đỡ đòn thay ${nm(p)}, đồng đội trong đoàn`, saved: (d, p) => `được ${nm(p)} đỡ đòn thay`, rank: () => 'được giao chỉ huy một toán trong đoàn', thief: (d, p) => `bị ${nm(p)} cuỗm phần chia của cả toán`,
      fled: () => 'bỏ chạy giữa một trận phục kích', drift: (d, p) => `mỗi người một ngả với ${nm(p)} khi đoàn giải tán`, fell: (d, p) => `không ở đó khi ${nm(p)} ngã xuống` },
    beat: { any: ['Bạn và {p} chia nhau nửa cái bánh khô bên đống lửa, bẻ đôi không cần nhìn.', '{p} vá lại giáp cho bạn, càu nhàu suốt về cái tật đỡ đòn bằng vai.'] },
    acts: acts({ open: { st: ADE, wait: [0, 6] } }),
    open: (S, X, a, p) => ({ t: `Trận đầu tiên trong đoàn, ${nm(p)} đứng bên trái bạn. Tên rít qua tai, khiên vỡ, có lúc bạn không còn biết mình đang đánh ai. Tan trận, hai người còn sống, ngồi bệt xuống bùn mà cười như điên. Từ đêm ấy, bên đống lửa luôn có chỗ cho nhau.`, k: 'good', bond: 15 }),
    knot: { title: 'Đồng đội', body: (S, X, a, p) => `Đoàn trưởng xếp lại các toán. ${nm(p)} hỏi bạn có muốn chung toán không, giọng như hỏi chuyện thời tiết mà mắt thì nhìn thẳng. Chỗ tiểu đội trưởng cũng đang trống. Trong đoàn đánh thuê, chọn ai đứng sau lưng là chọn luôn cách mình sẽ chết.`,
      choices: (S, X, a, p) => [ch('trust', `Chung toán, giao lưng cho ${nm(p)}`, ''), ch('lead', 'Xin làm tiểu đội trưởng', `${nm(p)} cũng muốn chỗ ấy.`), ch('away', 'Giữ khoảng cách', 'Trong đoàn đánh thuê, thân ai nấy lo.')],
      apply(S, X, ch, a, p) { if (ch === 'trust') { bond(p, 20); return `Hai người khắc dấu toán lên chuôi kiếm, cùng một dấu, cùng một đêm. ${nm(p)} khắc vụng, dấu lệch hẳn sang một bên. Bạn không cười, chỉ lặng lẽ khắc lệch theo cho giống.`; } if (ch === 'lead') { bond(p, -10); return `Bạn nhận chỗ. ${nm(p)} chúc mừng, giọng hơi khàn. Tối ấy bên đống lửa, chỗ ngồi cạnh bạn bỏ trống. Sáng hôm sau ${nm(p)} vẫn ra hàng đúng giờ, nhưng đứng xa hơn một bước.`; } return `Bạn xin sang toán khác. Trong đoàn đánh thuê, thân ai nấy lo, bạn tự nhủ. Đi ngang đống lửa của toán cũ, bạn nghe tiếng ${nm(p)} cười, không ngoái lại.`; },
      auto: S => (S.traits.social > .5 ? 'trust' : S.traits.bold > .6 ? 'lead' : 'away') },
    trial: { base: (S, X) => odds(S, X, .55),
      run(S, X, a, ok, p) {
        if (a.d.bg) return ok ? { t: `Nghe nói ${nm(p)} được thăng làm tiểu đội trưởng. Đêm ấy toán bên kia uống mừng, tiếng hát vọng sang tận chỗ bạn. Bạn nằm quay mặt vào vách lều.`, k: 'info' } : { t: `Toán của ${nm(p)} mất hai người trong một trận ở biên giới. ${nm(p)} về trại, áo đẫm máu người khác, ngồi một mình bên đống lửa tàn. Bạn định bước tới, rồi lại thôi.`, k: 'info' };
        if (ok) { X.money(Math.round(med(S, X) * .5)); return { t: `Trận lớn năm ấy đoàn thắng. Phần chia của toán bạn nặng tay, bạc đổ ra đầy mũ sắt. ${a.d.path === 'lead' ? 'Toán do bạn dẫn không mất một người.' : `${nm(p)} cụng mũ sắt với bạn kêu choang một tiếng.`} Đêm ấy cả trại say tới sáng.`, k: 'good' }; }
        X.add('hl', -10); return { t: 'Trận lớn năm ấy đoàn thua, rút chạy ba ngày. Ăn rễ cây, ngủ dưới mưa, nghe tiếng truy binh sau lưng. Tới ngày thứ ba, bạn không còn nhớ mình đã chạy qua bao nhiêu ngọn đồi.', k: 'bad' };
      } },
    climax: { title: 'Trận phục kích', body: (S, X, a, p) => `Đoàn bị phục kích ở khe núi. Đá lăn xuống chặn cả hai đầu, tên bắn ra từ hai vách. Giữa hỗn loạn, bạn thấy một nhát rìu nhắm vào ${nm(p)} từ phía sau. ${nm(p)} không thấy.`,
      choices: () => [ch('cover', 'Lao ra đỡ', 'Có thể không về được.'), ch('hold', 'Giữ đội hình', 'Đoàn trước, người sau.'), ch('run', 'Rút chạy', 'Sống trước đã.')],
      apply(S, X, ch, a, p) {
        if (ch === 'cover') { X.add('hl', -18); X.cond('wound'); bond(p, 40); return { t: `Bạn lao ra, không kịp nghĩ. Lưỡi rìu cắm vào vai bạn thay vì gáy ${nm(p)}. Bạn ngã xuống, nghe ${nm(p)} gầm lên một tiếng rồi lao vào kẻ cầm rìu. Sau đó thì tối sầm.`, o: 'saved_p' }; }
        if (ch === 'hold') { if (a.d.path === 'lead' || a.d.ok) { fame(S, 2); return { t: `Bạn hô giữ hàng. Cả toán đứng vững, khiên kề khiên, đánh ngược lên dốc. ${nm(p)} cũng kịp quay lại gạt nhát rìu. Tan trận, đoàn trưởng tìm tới tận chỗ bạn, nhìn một lúc rồi gật đầu.`, o: 'rank' }; } kill(S, p); X.add('h', -10); return { t: `Bạn giữ hàng, mắt không rời đội hình. ${nm(p)} quay lại đỡ đòn cho bạn, như bạn lẽ ra phải làm cho ${nm(p)}. Lúc trận tan, bạn quỳ trong bùn, ôm lấy ${nm(p)} mà không gọi được thành tiếng.`, o: 'saved' }; }
        X.add('so', -6); return { t: 'Bạn chạy. Sau lưng có tiếng gọi tên bạn. Bạn chạy tới khi không còn nghe thấy gì ngoài tiếng thở của chính mình. Tối ấy về trại, không ai hỏi bạn đã ở đâu.', o: 'fled' };
      },
      auto: (S, X, a, p) => (p.bond > 50 ? 'cover' : S.traits.bold > .3 ? 'hold' : 'run'),
      bg: (S, X, a, p) => (a.d.ok ? { t: `Đoàn giải tán. Mỗi người một ngả. Hôm chia tay, ${nm(p)} đứng ở đầu kia bãi tập, giơ tay chào bạn từ xa. Bạn chào lại. Hai người không đi về phía nhau.`, o: 'drift' } : (kill(S, p), { t: `${nm(p)} ngã xuống trong một trận phục kích. Bạn ở toán khác, tới nơi khi mọi chuyện đã xong. ${nm(p)} nằm ngửa trên đá, mắt còn mở. Bạn vuốt mắt cho người ấy, tay run.`, o: 'fell' })) },
    end: (S, X, a, p, o) => (o === 'rank' && a.d.path === 'trust' && !a.d.ok && X.chance(.3) ? 'thief' : o),
    after: {
      saved_p: (S, X, a, p) => { X.add('h', 8); return { t: `${nm(p)} cõng bạn ra khỏi khe núi, đi suốt một đêm không nghỉ. Từ đó ${nm(p)} gọi bạn là anh em, đi đâu cũng thế. Vết sẹo trên vai bạn, ${nm(p)} gọi là "cái của ta". Bên đống lửa nào, chỗ ngồi cạnh bạn cũng là của người ấy.`, k: 'big', bond: 20 }; },
      saved: (S, X, a, p) => ({ t: `Bạn chôn ${nm(p)} bên đường, cắm thanh kiếm làm bia. ${a.d.path === 'trust' ? 'Trên chuôi kiếm vẫn còn cái dấu toán khắc lệch.' : 'Chuôi kiếm mòn bóng chỗ tay người ấy hay cầm.'} Đoàn đi tiếp từ sáng sớm. Bạn đi cuối cùng, ngoái lại mấy lần.`, k: 'bad' }),
      rank: () => { return { t: 'Đoàn trưởng giao cho bạn chỉ huy ba toán. Lính mới nhìn bạn như nhìn người đã đứng vững ở khe núi năm ấy. Bạn dạy họ đúng một điều: không ai được bỏ hàng. Câu ấy về sau thành lệ của đoàn.', k: 'good' }; },
      thief: (S, X, a, p) => { X.money(-Math.round(Math.max(0, S.gold) * .2)); p.role = 'thu'; p.bond = -50; return { t: `Sáng ra ${nm(p)} biến mất cùng phần chia của cả toán, cả túi bạc của bạn. Thanh kiếm khắc dấu toán, người ấy để lại trên chỗ nằm. Bạn cầm nó lên, rồi ném xuống sông.`, k: 'bad' }; },
      fled: () => ({ t: 'Đoàn không đuổi bạn, nhưng không ai ngồi cạnh bạn bên đống lửa nữa. Có đứa lính mới hỏi chuyện khe núi, bị người khác kéo đi. Bạn ăn một mình, ngủ ở rìa trại.', k: 'bad' }),
      drift: (S, X, a, p) => ({ t: `Mỗi lần nghe tiếng rìu chẻ củi, bạn lại nhớ ${nm(p)}. Không biết giờ người ấy ở đâu, còn đi đánh thuê hay đã về quê. Tối ấy bạn rót một chén rượu, để phần ở đầu bàn.`, k: 'info' }),
      fell: () => ({ t: 'Bạn thắp nhang cho người đồng đội cũ mỗi năm, đúng ngày ấy. Năm nào cũng định viết vài dòng gửi về quê người ấy, rồi lại không biết viết gì. Khói nhang bay thẳng, không gió.', k: 'bad' })
    } });

  // ── Lời hứa lúc tranh cử (ra tranh ghế trưởng làng) ──
  grow('s_promise', { nameVi: 'Lời hứa lúc tranh cử', from: 'head_elect', p: .6, when: (S, X, k) => k === 'yes', good: ['well', 'keep'],
    quest: () => 'Giữ lời hứa đào giếng',
    marks: { well: 'nguoi_dung_dau', keep: 'giu_loi', charge: 'cua_phi_nghia', guard: 'ke_thu', dry: 'cay_dang', break: 'tieng_xau' },
    sum: { well: () => 'đào giếng cho xóm cuối rồi mở cho cả vùng dùng chung', keep: () => 'giữ lời hứa đào giếng lúc tranh ghế trưởng', charge: () => 'thu tiền nước ở cái giếng mình hứa đào',
      guard: () => 'giữ giếng cho riêng xóm mình mùa hạn', dry: () => 'đào giếng mà không gặp mạch', break: () => 'quên lời hứa lúc tranh ghế trưởng' },
    beat: { any: ['Người xóm cuối hỏi bạn chuyện cái giếng, lần thứ ba trong tháng. Lần này giọng đã bớt kiên nhẫn.'] },
    open: () => ({ t: 'Lúc tranh ghế, bạn hứa đào một cái giếng mới cho xóm cuối, nơi người ta phải gánh nước từ sông lên. Giờ người ta bắt đầu nhắc. Mỗi sáng đi ngang xóm ấy, bạn lại thấy mấy đứa trẻ còng lưng gánh nước trên con dốc trơn.', k: 'info' }),
    knot: { title: 'Lời hứa', body: (S, X) => `Đào giếng cần chừng ${G.coin(Math.round(med(S, X) * .8))}. Bạn đứng ở xóm cuối, nhìn con dốc đất đỏ dẫn xuống sông. Lời hứa nói ra thì dễ. Giờ là lúc nó đòi tiền, đòi công.`,
      choices: () => [ch('keep', 'Bỏ tiền nhà mình', ''), ch('levy', 'Bắt cả làng góp công', 'Nhanh; có người kêu.'), ch('away', 'Để sau', 'Người ta sẽ nhớ.')],
      apply(S, X, ch) { if (ch === 'keep') { X.money(-Math.round(med(S, X) * .8)); X.add('so', 4); return 'Bạn thuê thợ đào giếng ngay sau mùa gặt. Hôm khởi công, cả xóm cuối kéo ra xem, có người mang cả chè tới mời. Tiếng cuốc bổ xuống đất nghe chắc nịch.'; } if (ch === 'levy') { X.add('so', -2); return 'Mỗi nhà góp ba ngày công. Có nhà góp, có nhà trốn. Mấy nhà trốn bị cả xóm nhìn bằng nửa con mắt, rồi cũng lục tục vác cuốc ra.'; } X.add('so', -4); return 'Bạn bảo: sang năm. Người xóm cuối gật đầu, không nói gì. Sáng hôm sau, mấy đứa trẻ gánh nước đi qua cổng nhà bạn, cố ý đi thật chậm.'; },
      auto: (S, X) => (S.gold > med(S, X) ? 'keep' : S.traits.social > .5 ? 'levy' : 'away') },
    trial: { base: (S, X, a) => (a.d.bg ? .3 : .6),
      run: (S, X, a, ok) => (a.d.bg ? (ok ? { t: 'Người xóm cuối tự góp tiền đào giếng. Hôm giếng có nước, họ làm một bữa nhỏ ăn mừng, không mời bạn. Tiếng cười vọng tới tận nhà bạn.', k: 'info' } : { t: 'Xóm cuối vẫn gánh nước từ sông. Con dốc đất đỏ mòn thêm một lớp. Có người nhắc tên bạn mỗi lần trượt chân.', k: 'info' }) : ok ? { t: 'Thợ đào xuống mười hai thước thì gặp mạch. Nước trong, ngọt, mát lạnh cả tay. Người xóm cuối múc gáo đầu tiên mời bạn uống. Bạn uống, thấy ngọt thật.', k: 'good' } : { t: 'Thợ đào xuống hai mươi thước, chỉ gặp đá. Tiếng cuốc chạm đá khô khốc vang lên từ đáy giếng. Người xóm cuối đứng quanh miệng giếng, không ai nói gì.', k: 'bad' }) },
    climax: { title: 'Mùa khô', body: (S, X, a) => (a.d.ok ? 'Hạn hán. Ruộng nứt nẻ, sông cạn trơ đáy. Giếng xóm cuối là giếng duy nhất trong vùng còn nước, mực nước tụt dần từng ngày. Người làng bên kéo tới xin, tay xách thùng, mắt nhìn bạn.' : 'Hạn hán. Ruộng nứt nẻ, sông cạn trơ đáy. Cái giếng khô của bạn nằm giữa xóm như một lời nhắc. Người xóm cuối nhìn nó, rồi nhìn bạn.'),
      choices: (S, X, a) => (a.d.ok ? [ch('share', 'Mở giếng cho cả vùng', 'Xóm mình có thể thiếu.'), ch('charge', 'Thu tiền nước', 'Giếng là của làng mình.'), ch('guard', 'Chỉ cho xóm mình', '')]
        : [ch('share', 'Bỏ tiền chở nước từ sông về cho xóm', ''), ch('guard', 'Bảo mọi người tự lo', '')]),
      apply(S, X, ch, a) {
        if (ch === 'share') { X.add('so', 6); if (!a.d.ok) X.money(-Math.round(med(S, X) * .4)); return { t: a.d.ok ? 'Người ba làng xếp hàng bên giếng xóm cuối, từ sáng sớm tới tối mịt. Không ai chen. Mỗi nhà một gánh, chia đều như chia cơm.' : 'Bạn thuê ba xe trâu chở nước từ khúc sông xa còn nước, suốt mùa khô. Bánh xe lăn kẽo kẹt mỗi sáng. Người xóm cuối ra đón như đón người nhà.', o: 'share' }; }
        if (ch === 'charge') { X.money(Math.round(med(S, X) * .8)); X.add('so', -6); return { t: 'Mỗi gánh nước một đồng. Người làng bên trả, không nhìn mặt bạn. Tiền rơi vào hộp gỗ lách cách cả ngày. Tối về, bạn đếm vội rồi cất đi.', o: 'charge' }; }
        X.add('so', -3); return { t: a.d.ok ? 'Bạn cho người canh giếng, ngày đêm thay nhau. Người làng bên đứng ngoài rào nhìn vào, tay xách thùng rỗng. Có đứa trẻ khóc đòi nước. Người canh giếng quay mặt đi.' : 'Bạn bảo mọi người tự lo. Người xóm cuối lại xuống dốc gánh nước từ khúc sông xa, mỗi chuyến mất nửa buổi. Không ai trách to, nhưng ai cũng nhớ.', o: 'guard' };
      },
      auto: (S, X, a) => (S.traits.social > .45 ? 'share' : sh(S, 'thuong') > .2 ? 'charge' : 'guard'),
      bg: () => ({ t: 'Người xóm cuối nhắc lời hứa của bạn mỗi mùa khô. Câu nhắc thành câu đùa, rồi thành câu ví. Trẻ con xóm ấy lớn lên, ai hứa mà không làm thì bị bảo là "hứa như đào giếng".', o: 'break' }) },
    end(S, X, a, p, o) { if (o === 'share') return a.d.ok ? (a.d.path === 'keep' ? 'well' : 'keep') : 'keep'; if (o === 'guard' && !a.d.ok) return 'dry'; return o; },
    after: {
      well: () => ({ t: 'Người ba làng gọi giếng ấy theo tên bạn. Năm sau bạn tái cử, không ai ra tranh. Miệng giếng có ai đó khắc một dòng chữ nhỏ. Mưa nắng bao năm, chữ vẫn còn đọc được.', k: 'big' }),
      keep: () => ({ t: 'Lời hứa giữ được. Người xóm cuối gọi bạn là người nói được làm được. Từ đó trong làng, ai hứa suông là người ta lại lôi bạn ra so.', k: 'good' }),
      charge: () => ({ t: 'Cái giếng làm bạn giàu thêm một chút, và nghèo đi một chút ở chỗ khác. Người làng bên đi qua cổng nhà bạn không còn chào. Hộp gỗ đựng tiền nước, bạn cất trên gác, ít khi mở.', k: 'bad' }),
      guard: () => ({ t: 'Làng bên không quên mùa khô năm ấy. Mấy năm sau, làng bạn cần người làng bên góp tay đắp đê, không một ai tới. Bạn hiểu vì sao, và không trách.', k: 'bad' }),
      dry: () => ({ t: 'Cái giếng khô được lấp lại. Người ta nhắc lời hứa của bạn như nhắc một chuyện cười. Chỗ đất lấp lún xuống thành một vũng nhỏ, mưa xuống lại đọng nước. Trẻ con ra đó nghịch, gọi là "giếng của trưởng làng".', k: 'bad' }),
      break: () => ({ t: 'Mùa khô nào xóm cuối cũng gánh nước từ sông, và nhắc tên bạn. Lời hứa năm ấy chẳng ai đòi nữa. Người ta chỉ nhớ, mà nhớ thì còn nặng hơn đòi.', k: 'bad' })
    } });

  // ── Đất mới (dời nhà đi nơi khác) ──
  grow('s_newland', { nameVi: 'Đất mới', from: 'migrate', p: .5, when: (S, X, k) => k !== 'stay', good: ['home', 'bridge', 'onward'],
    quest: () => 'Bén rễ ở đất mới',
    marks: { home: 'que_moi', bridge: 'duoc_tin', apart: 'nguoi_la', onward: 'ke_di_xa', cold: 'tiec_nuoi' },
    sum: { home: () => 'biến đất mới thành quê', bridge: () => 'làm cầu nối giữa người cũ và người mới ở đất mới', apart: () => 'sống ở đất mới cả đời như khách', onward: () => 'rời đất mới, đi tiếp', cold: () => 'sống khép kín ở đất mới' },
    beat: { any: ['Bạn học thêm vài câu tiếng địa phương, nói sai, người ta cười. Bạn cười theo, rồi về nhà tập lại.', 'Bạn trồng ở góc vườn một cây mang từ quê cũ. Mùa đầu nó héo, mùa sau mới chịu nhú lá.'] },
    acts: acts({ open: { st: TAE, wait: [0, 4] } }),
    open(S, X, a) {
      if (X.chance(.4 + S.traits.social * .4)) { const p = G.castAdd(S, X, { role: 'ban', how: 'người hàng xóm đầu tiên ở đất mới', bond: 40 }); a.who = p.id; X.add('so', 3);
        return { t: `${nm(p)}, nhà bên cạnh, mang sang một nồi canh vào tối đầu tiên bạn tới. Canh nấu theo lối ở đây, chua và cay hơn bạn quen. Bạn ăn hết, không chừa một giọt. Lúc mang nồi sang trả, hai nhà đứng nói chuyện ở hàng rào tới tối mịt.`, k: 'good' }; }
      X.add('so', -3); return { t: 'Ở đất mới chưa ai chào bạn. Người ta nhìn bạn đi chợ như nhìn khách qua đường, mua gì cũng bị nói thách. Đêm đầu tiên, căn nhà lạ kêu cọt kẹt cả đêm. Bạn nằm nghe, nhớ tiếng gà gáy ở quê.', k: 'bad' };
    },
    knot: { title: 'Bén rễ', body: () => 'Đất mới có nếp riêng: lễ khác, chợ khác, cách chào khác. Ở đây người ta ăn cơm muộn hơn, cúng vào ngày khác. Bạn làm gì cũng thấy lóng ngóng. Gói đất quê mang theo vẫn để trên bàn thờ.',
      choices: () => [ch('mix', 'Học theo nếp đất mới', ''), ch('own', 'Giữ nếp quê cũ, mời người mới tới xem', ''), ch('away', 'Sống khép kín', 'Làm ăn thôi.')],
      apply(S, X, ch) { if (ch === 'mix') { X.add('so', 4); return 'Bạn đi lễ đền làng, góp gạo nấu cỗ, ngồi mâm cuối với mấy người cũng mới tới. Có bà cụ chỉ cho bạn cách vái cho đúng lối. Về nhà, tay vẫn còn thơm mùi hương lạ.'; } if (ch === 'own') { X.add('h', 3); return 'Tết quê cũ, bạn bày mâm cỗ theo lối nhà mình, mời cả xóm sang. Người ta ngồi ngập ngừng, gắp thử từng món. Tới khuya mâm cỗ sạch trơn, có người còn xin cách làm.'; } return 'Bạn đóng cổng, chỉ mở khi đi chợ. Làm ăn thôi, bạn tự nhủ. Tiếng cười nói ngoài xóm vọng vào, bạn quen dần như quen tiếng gió.'; },
      auto: S => (S.traits.social > .55 ? 'mix' : S.traits.social > .3 ? 'own' : 'away') },
    trial: { base: S => .5 + S.traits.social * .2,
      run: (S, X, a, ok) => (ok ? { t: 'Vụ đầu ở đất mới được mùa. Hàng xóm sang mượn giống, hỏi bạn trồng kiểu gì. Lần đầu tiên ở đây, có người tới nhà bạn để học chứ không phải để nhìn.', k: 'good' } : { t: 'Vụ đầu ở đất mới mất trắng. Bạn không biết đất này mưa vào tháng nào, gieo hạt đúng lúc trời hạn. Người ta không cười, chỉ bảo: đất này phải ở lâu mới hiểu.', k: 'bad' }) },
    climax: { title: 'Người làng mới', body: () => 'Làng mở hội lớn, cần mỗi nhà góp một tay. Có người bảo: dân mới thì đứng ngoài. Câu ấy nói không to, mà ai cũng nghe. Trống hội đã bắt đầu tập ở sân đình.',
      choices: () => [ch('join', 'Góp, xin đứng một chân trong hội', ''), ch('stand', 'Đứng ngoài', ''), ch('leave', 'Bán nhà, đi tiếp', 'Đất này không hợp.')],
      apply(S, X, ch) { if (ch === 'join') { X.add('so', 6); return { t: 'Bạn góp gạo, góp công, rồi xin một chân khiêng kiệu. Bạn khiêng kiệu cùng trai làng, vai sưng tấy mà không kêu một tiếng. Từ đó người ta gọi bạn bằng tên. Không còn ai nói "nhà người mới" nữa.', o: 'join' }; } if (ch === 'stand') return { t: 'Bạn đứng xem hội từ hiên nhà. Kiệu đi ngang, trống dồn, người ta reo hò. Có đứa trẻ vẫy tay với bạn, bạn vẫy lại. Hội tan, sân đình vắng, bạn vẫn đứng đó.', o: 'apart' }; S.flags.migrateQ = 'Đất này không hợp.'; return { t: 'Bạn bán nhà sau mùa hội. Người mua trả rẻ, bạn không mặc cả. Cái cây trồng ở góc vườn đã cao ngang vai, bạn để nó lại cho người sau.', o: 'onward' }; },
      auto: S => (S.traits.social > .4 ? 'join' : S.traits.bold > .65 ? 'leave' : 'stand'),
      bg: (S, X, a) => ({ t: a.d.ok ? 'Làng mở hội, không ai gọi nhà bạn. Tiếng trống vọng qua hàng rào. Bạn ngồi trong nhà, cánh cổng vẫn đóng như mọi ngày.' : 'Mấy năm liền nhà bạn vẫn là "nhà người mới". Người ta chỉ đường cho khách cũng bảo "qua nhà người mới thì rẽ trái". Bạn nghe, không cãi.', o: 'cold' }) },
    end: (S, X, a, p, o) => (o === 'join' ? (a.d.path === 'own' ? 'bridge' : 'home') : o),
    after: {
      home: () => ({ t: 'Đất mới đã thành quê. Con cháu bạn nói giọng ở đây, còn cười cái giọng quê cũ của bạn. Gói đất mang theo năm nào, bạn đã rắc xuống gốc cây góc vườn từ lâu. Giờ cây tỏa bóng mát cả sân.', k: 'good' }),
      bridge: () => ({ t: 'Lễ hội làng có thêm một món của quê bạn, bày ngay giữa mâm. Người mới tới sau tìm bạn trước tiên, hỏi chỗ ở, hỏi cách sống. Bạn chỉ cho họ, kể cả những chỗ năm xưa chính bạn từng vấp.', k: 'good' }),
      apart: () => ({ t: 'Bạn sống ở đây hai mươi năm, vẫn là người nơi khác tới. Không ai ghét bạn. Chỉ là trong những câu chuyện của làng, chưa bao giờ có tên bạn.', k: 'bad' }),
      onward: () => ({ t: 'Bạn đi tiếp, mang theo một gói đất của nơi cũ, giờ thêm một gói nữa. Hai gói đất nằm cạnh nhau trong tay nải. Nơi sau sẽ là đâu, bạn chưa biết.', k: 'info' }),
      cold: () => ({ t: 'Bạn sống yên, không ai làm phiền. Cũng không ai hỏi thăm. Có lần ốm cả tháng, hàng xóm chỉ biết khi thấy cổng nhà bạn mấy hôm liền không mở.', k: 'bad' })
    } });

  // ── Lai lịch món đồ (mua trang bị) ──
  grow('s_loot', { nameVi: 'Lai lịch món đồ', from: 'gear', p: .25, when: (S, X, k) => k === 'buy', good: ['return', 'rewarded', 'caught'],
    quest: () => 'Món đồ ăn cắp',
    marks: { return: 'giu_loi', rewarded: 'duoc_tin', caught: 'nguoi_giu_lang', pay: 'buong_bo', keep: 'tieng_xau', sued: 'cay_dang' },
    sum: { return: () => 'trả lại món đồ ăn cắp cho chủ cũ', rewarded: () => 'trả lại món đồ ăn cắp, được chủ cũ coi như người nhà', caught: () => 'lần ra và bắt được kẻ trộm món đồ mình mua',
      pay: () => 'trả thêm tiền để giữ món đồ có lai lịch xấu', keep: () => 'giữ món đồ ăn cắp, mặc chủ cũ khóc', sued: () => 'bị kiện vì giữ món đồ ăn cắp' },
    beat: { any: ['Bạn lau món đồ, nhìn kỹ vết khắc nhỏ dưới chuôi. Nét khắc đã mòn, mà vẫn đọc ra được.'] },
    open: () => ({ t: 'Một người lạ chặn bạn ở chợ, tay run run chỉ vào món đồ bạn đang mang. Món đồ bạn mua năm ngoái là của nhà ông ta, bị trộm từ mấy năm trước. Ông ta nói to tới mức người quanh đó dừng lại nghe. Mặt bạn nóng bừng.', k: 'info' }),
    knot: { title: 'Chủ cũ của món đồ', body: () => 'Ông ta chỉ vào vết khắc dưới chuôi: tên ông nội ông ta. Đọc tới cái tên ấy, giọng ông nghẹn lại. Bạn nhìn vết khắc, nhớ gã bán hàng năm nào nói thao thao về lai lịch "sạch sẽ" của món đồ.',
      choices: () => [ch('return', 'Trả lại', 'Mất món đồ.'), ch('pay', 'Trả thêm tiền để giữ', ''), ch('keep', 'Bảo ông ta đi chỗ khác', 'Đồ bạn mua bằng tiền.')],
      apply(S, X, ch) { if (ch === 'return') { S.gear = Math.max(0, S.gear - 1); X.add('so', 4); return 'Bạn tháo món đồ đưa lại. Ông ta khóc, cúi đầu ba lần. Người trong chợ đứng xem, có người gật gù. Bạn về tay không, mà bước chân nhẹ hơn lúc tới.'; } if (ch === 'pay') { X.money(-Math.round(med(S, X) * .5)); return 'Bạn trả thêm cho ông ta một khoản. Hai bên bắt tay. Ông ta nhìn món đồ lần cuối, như nhìn người thân đi xa, rồi quay đi.'; } X.add('so', -4); return 'Bạn gạt ông ta ra. Cả chợ nhìn theo. Đồ mua bằng tiền thì là của mình, bạn tự nhủ. Nhưng từ hôm ấy, mỗi lần cầm món đồ lên, ngón tay bạn lại chạm đúng vết khắc.'; },
      auto: (S, X) => (S.traits.pious > .55 ? 'return' : S.gold > med(S, X) ? 'pay' : 'keep') },
    trial: { base: () => .5,
      run: (S, X, a, ok) => (a.d.path === 'keep' ? (ok ? { t: 'Ông ta không quay lại nữa. Có người bảo ông ta đã về quê, có người bảo ông ta ốm. Món đồ vẫn nằm trong tay bạn, vết khắc vẫn còn đó.', k: 'info' } : { t: 'Ông ta quay lại, lần này với một lá đơn kiện, có cả người làm chứng. Lính phủ tới tận nhà đọc giấy. Hàng xóm đứng ngoài ngõ nhìn vào.', k: 'bad' })
        : ok ? { t: 'Ông chủ cũ hóa ra là người có máu mặt ở phủ. Ông nhớ tên bạn, đi đâu cũng kể chuyện người mua đồ biết điều. Có lần ra phủ làm giấy tờ, bạn được mời vào trước.', k: 'good' } : { t: 'Chuyện món đồ qua đi. Ông chủ cũ không tìm lại. Thỉnh thoảng nghĩ tới, bạn tự hỏi giờ ông ta ra sao.', k: 'info' }) },
    climax: { title: 'Kẻ trộm', body: () => 'Ở một quán rượu bên kia sông, bạn nhận ra gã bán món đồ cho bạn năm nào, đang chào hàng một thanh kiếm khác. Vẫn cái giọng ấy, vẫn câu chuyện lai lịch "sạch sẽ" ấy. Người mua ngồi nghe, gật gù. Gã chưa thấy bạn.',
      choices: () => [ch('catch', 'Tóm gã, giải lên phủ', `Gã có hai người đi cùng.`), ch('warn', 'Báo cho chủ quán', ''), ch('let', 'Làm như không thấy', '')],
      apply(S, X, ch) {
        if (ch === 'catch') { if (X.chance(odds(S, X, .55))) { fame(S, 2); X.add('so', 4); return { t: 'Bạn quật gã xuống bàn, chén rượu văng tung tóe. Hai đồng bọn chưa kịp rút dao đã bị khách trong quán giữ lại. Phủ tìm thấy trong nhà gã cả một kho đồ ăn cắp. Có món còn dính bùn nhà người ta.', o: 'caught' }; } X.add('hl', -10); return { t: 'Bạn lao tới, nhưng gã nhanh hơn. Gã và hai đồng bọn chạy thoát, để lại cái bàn đổ và một vết dao trên tay bạn. Bạn đứng giữa quán, ôm tay, nghe tiếng chân chúng xa dần ngoài bến sông.', o: 'let' }; }
        if (ch === 'warn') return { t: 'Chủ quán đuổi gã ra, thanh kiếm cũng bị ném theo ra đường. Gã nhặt kiếm, đi, ngoái lại nhìn bạn một cái. Cái nhìn ấy bạn nhớ khá lâu.', o: 'let' };
        return { t: 'Bạn uống hết chén rượu, đi. Ra tới bến sông, bạn đứng nhìn nước một lúc. Món đồ đeo bên hông bỗng nặng hơn mọi ngày.', o: 'let' };
      },
      auto: S => (S.traits.bold > .5 ? 'catch' : S.traits.social > .5 ? 'warn' : 'let') },
    end(S, X, a, p, o) { if (o === 'caught') return 'caught'; if (a.d.path === 'return') return a.d.ok ? 'rewarded' : 'return'; if (a.d.path === 'keep') return a.d.ok ? 'keep' : 'sued'; return 'pay'; },
    after: {
      return: () => ({ t: 'Bạn mua món khác, rẻ hơn, không khắc tên ai. Không ai biết chuyện, trừ bạn và ông lão ấy. Có những đêm bạn nằm nghĩ: món đồ ấy giờ treo ở chỗ nào trong nhà ông lão.', k: 'good' }),
      rewarded: S => { S.gear = Math.min(10, S.gear + 1); return { t: 'Ông lão gửi tới một món đồ của nhà ông, không ăn cắp, tốt hơn món cũ. Kèm theo là mảnh giấy viết run run: "Người ngay thì nên có đồ tốt." Bạn treo mảnh giấy ở chỗ treo món đồ cũ.', k: 'good' }; },
      caught: () => ({ t: 'Người mất đồ trong vùng kéo nhau tới phủ nhận lại đồ, ai cũng hỏi tên bạn. Có bà cụ tìm lại được chiếc vòng cưới, ôm lấy bạn mà khóc. Mấy năm sau, người ta vẫn chỉ bạn cho khách lạ: "Người bắt được tên trộm đấy."', k: 'big' }),
      pay: () => ({ t: 'Món đồ giờ là của bạn, sạch sẽ, có cả lời của chủ cũ. Bạn vẫn để vết khắc cũ. Mỗi lần lau, ngón tay bạn dừng lại ở cái tên ấy một chút.', k: 'info' }),
      keep: () => ({ t: 'Món đồ vẫn dùng tốt. Người chợ thì nhớ chuyện hôm ấy. Có lần bạn mặc cả một món hàng, người bán cười khẩy: "Đồ của người khác mà còn giữ được, mặc cả làm gì."', k: 'bad' }),
      sued: (S, X) => { S.gear = Math.max(0, S.gear - 1); X.money(-Math.round(med(S, X) * .3)); return { t: 'Phủ xử bạn trả lại món đồ, nộp thêm tiền phạt. Bạn đứng nghe đọc án giữa công đường, cả chợ kéo tới xem. Món đồ năm ấy mua bằng tiền thật, giờ mất cả đồ lẫn tiền.', k: 'bad' }; }
    } });

  // ── Những người đầu tiên (lập làng) ──
  grow('s_founder', { nameVi: 'Những người đầu tiên', from: 'found_settle', p: 1, when: (S, X, k) => k !== 'no', good: ['root', 'walled', 'temple', 'market'],
    quest: () => 'Dựng làng từ đất trống',
    marks: { root: 'nguoi_lap_lang', walled: 'nguoi_giu_lang', temple: 'nguoi_moc_dao', market: 'nha_kha', lord: 'ba_chu', drifted: 'tiec_nuoi' },
    sum: { root: () => 'dựng một ngôi làng từ đất trống', walled: () => 'dựng làng và tường làng từ đất trống', temple: () => 'dựng làng và ngôi đền đầu tiên của làng', market: () => 'dựng làng và mở phiên chợ đầu tiên',
      lord: () => 'lập làng rồi giữ phần đất tốt nhất cho mình', drifted: () => 'lập làng rồi để người khác cai quản' },
    beat: { any: ['Bạn đi một vòng quanh làng lúc sáng sớm, đếm số mái nhà. Khói bếp mỗi năm một nhiều.', 'Thêm một nhà nữa xin tới ở làng bạn lập. Bạn ra tận đầu làng đón.'] },
    acts: acts({ open: { st: ADE, wait: [0, 4] } }),
    open(S, X, a) { const p = G.castAdd(S, X, { role: 'ban', how: 'người đầu tiên tới ở làng bạn lập', bond: 45, work: 'farmer' }); a.who = p.id;
      return { t: `Nhà ${nm(p)} là nhà đầu tiên tới ở làng bạn lập. Hai nhà cùng đốn cây, cùng đào cái giếng chung, khắc tên cả hai lên thành giếng. Đêm đầu tiên ngủ trên đất trống, gió thổi lạnh mà không ai than. Sáng ra, bạn nhìn khói bếp hai nhà bay lên cạnh nhau.`, k: 'good' }; },
    knot: { title: 'Luật làng', body: () => 'Làng đã có mười nhà. Phải chia đất, đặt luật. Mười nhà ngồi quanh đống lửa giữa bãi đất trống, đợi bạn lên tiếng trước. Đất ven suối tốt nhất, ai cũng biết, và ai cũng nhìn về phía ấy.',
      choices: () => [ch('common', 'Chia đất đều, họp cả làng mà quyết', ''), ch('lord', 'Giữ phần đất tốt cho nhà mình', 'Bạn lập làng mà.'), ch('away', 'Để mọi người tự lo', 'Bạn chỉ dựng nhà, không làm trưởng.')],
      apply(S, X, ch) { if (ch === 'common') { X.add('so', 5); return 'Bạn cắm cọc chia đất trước mặt cả làng, phần mình cũng bốc thăm như mọi người. Rút trúng mảnh đất sỏi, bạn cười, nhận luôn. Từ đó người ta nghe bạn nói hơn nghe ai.'; } if (ch === 'lord') { X.money(Math.round(med(S, X) * .5)); X.add('so', -4); return 'Bạn giữ khúc đất ven suối cho nhà mình. Bạn lập làng mà, bạn bảo. Không ai cãi, nhưng đêm ấy đống lửa tàn sớm hơn mọi hôm.'; } return 'Bạn bảo: ai khai hoang được bao nhiêu thì giữ bấy nhiêu. Sáng hôm sau, cả bãi đất trống rộn tiếng rìu. Bạn chỉ lo dựng nhà mình, không làm trưởng.'; },
      auto: S => (S.traits.social > .45 ? 'common' : sh(S, 'am') > .2 ? 'lord' : 'away') },
    trial: { base: (S, X, a) => .55 + (a.d.path === 'common' ? .1 : 0),
      run: (S, X, a, ok) => (ok ? { t: 'Mùa đông đầu tiên qua êm. Mười nhà thành mười lăm. Đứa trẻ đầu tiên sinh ra trên đất làng, cả làng góp mỗi nhà một quả trứng.', k: 'good' } : { t: 'Mùa đông đầu tiên, quái xuống phá chuồng. Hai nhà bỏ đi, chất đồ lên xe trong đêm. Bạn đứng nhìn hai mái nhà trống, gió lùa qua cánh cửa không khép.', k: 'bad' }) },
    climax: { title: 'Làng lớn', body: () => 'Làng đã đủ đông. Phải dựng thứ gì đó để người ta nhớ làng này là làng. Người làng bàn mãi không xong, rồi kéo nhau tới nhà bạn. Ai cũng muốn nghe người dựng làng nói.',
      choices: () => [ch('wall', 'Dựng tường làng', 'Che chở trước đã.'), ch('temple', 'Dựng đền', 'Có chỗ cho thần, có chỗ cho người họp.'), ch('market', 'Mở phiên chợ', 'Có chợ thì có người tới.')],
      apply(S, X, ch) { X.money(-Math.round(med(S, X) * .5)); if (ch === 'wall') return { t: 'Tường làng dựng xong trước mùa quái, đá xếp cao quá đầu người. Cả làng khiêng đá suốt ba tháng, tay ai cũng chai. Đêm đầu tiên sau bức tường, người ta ngủ ngon hơn hẳn.', o: 'walled' }; if (ch === 'temple') { if (S.faith) S.devotion = Math.min(100, (S.devotion || 0) + 5); return { t: 'Đền làng dựng xong, mái lợp ngói đỏ. Ngày khánh thành, khói hương bay tới tận cánh đồng. Người làng xếp hàng vào lễ, ai cũng mặc bộ áo tươm tất nhất.', o: 'temple' }; } return { t: 'Phiên chợ đầu tiên, người ba làng kéo tới. Gánh hàng bày kín bãi đất trước cổng làng, tiếng mặc cả ồn từ sáng tới trưa. Bạn đi một vòng, hàng nào cũng mua một chút cho người ta mát tay.', o: 'market' }; },
      auto: S => (S.traits.bold > .55 ? 'wall' : S.traits.pious > .55 ? 'temple' : 'market'),
      bg: () => ({ t: 'Làng tự bầu trưởng làng. Người ta mời bạn ngồi mâm trên, rồi quên hỏi ý. Bạn ngồi đó, nghe người ta bàn chuyện làng mình như nghe chuyện làng khác.', o: 'drifted' }) },
    end(S, X, a, p, o) { if (a.d.bg) return o; if (a.d.path === 'lord') return 'lord'; return a.d.ok ? o : 'root'; },
    after: {
      root: () => ({ t: 'Làng sống được, nghèo mà bền. Tên bạn khắc ở thành giếng chung, cạnh tên người hàng xóm đầu tiên. Rêu đã phủ lên mấy nét chữ. Trẻ con ra giếng vẫn đọc to hai cái tên ấy.', k: 'big' }),
      walled: () => ({ t: 'Năm quái tràn, làng bạn là làng duy nhất trong vùng không mất ai. Người làng bên chạy tới xin trú, nằm kín cả sân đình. Đứng trên tường nhìn xuống, bạn nhớ những ngày khiêng đá.', k: 'big' }),
      temple: () => ({ t: 'Lễ đền nào người ta cũng mời bạn thắp nén nhang đầu tiên. Ngói đỏ giờ đã ngả màu rêu. Bạn thắp nhang, khấn cho làng trước, rồi mới khấn cho mình.', k: 'big' }),
      market: (S, X) => { X.money(Math.round(med(S, X))); return { t: 'Phiên chợ làng bạn thành chợ lớn nhất vùng. Người buôn từ xa tới, mang theo những thứ bạn chưa từng thấy. Bãi đất trống năm nào, giờ không còn chỗ đặt chân.', k: 'big' }; },
      lord: () => ({ t: 'Làng lớn lên. Người ta nộp tô cho nhà bạn, và gọi bạn bằng ông chủ, không bằng tên. Khúc đất ven suối năm nào giờ thành ruộng tốt nhất vùng. Đi qua giếng chung, bạn không dừng lại đọc tên mình nữa.', k: 'bad' }),
      drifted: () => ({ t: 'Làng của bạn giờ là làng của người khác. Trẻ con sinh sau không biết ai lập làng. Bạn vẫn sống ở đó, trong căn nhà đầu tiên, giữa những mái nhà mới.', k: 'info' })
    } });

  // ── Ơn thầy thuốc (được chữa bệnh) ──
  grow('s_healer', { nameVi: 'Ơn thầy thuốc', from: 'healer', p: .5, when: (S, X, k) => k === 'pay' || k === 'pray', good: ['repaid', 'apprentice', 'fetched'],
    who: () => ({ role: 'an', how: 'thầy thuốc chữa cho bạn năm ấy', work: 'healer', bond: 30 }),
    quest: (a, p) => `Trả ơn ${nm(p)}`,
    marks: { repaid: 'duoc_tin', apprentice: 'nghe_thuoc', fetched: 'cao_thu', fled: 'tieng_xau', refused: 'cay_dang', p_died: 'tiec_nuoi' },
    sum: { repaid: (d, p) => `trả ơn ${nm(p)}, thầy thuốc từng chữa cho mình`, apprentice: (d, p) => `học nghề thuốc của ${nm(p)}, cứu người trong trận dịch`, fetched: (d, p) => `vượt núi lấy thuốc cho ${nm(p)} chặn dịch`,
      fled: () => 'bỏ làng chạy dịch', refused: (d, p) => `từ chối ${nm(p)} lúc người ấy nhờ việc`, p_died: (d, p) => `không ở đó khi ${nm(p)} chết vì dịch` },
    gone: (S, p) => `Tin ${refE(S, p)} mất. Bạn còn giữ toa thuốc năm ấy, giấy đã ngả vàng, nét chữ vẫn nắn nót. Đêm ấy bạn đem nó ra đọc lại, từng vị một. Có vị bạn đã biết mặt, có vị cả đời chưa gặp.`,
    beat: { any: ['Bạn ghé nhà {p}, phụ phơi thuốc một buổi. Mùi lá khô bám vào áo tới mấy hôm sau.', 'Bạn nhớ được thêm tên một vị thuốc {p} chỉ. {p} gật đầu, bảo nhớ tên thì phải nhớ cả cách dùng.'] },
    open: (S, X, a, p) => ({ t: `${nm(p)}, thầy thuốc chữa cho bạn năm ấy, nhờ người hỏi thăm bạn đã khỏe hẳn chưa. Lời hỏi thăm gửi kèm một gói thuốc bổ, gói cẩn thận bằng lá chuối. Bạn nhớ những đêm sốt mê man, bàn tay mát lạnh đặt lên trán mình. Món ơn ấy, bạn chưa trả được gì.`, k: 'info', bond: 5 }),
    knot: { title: 'Thầy thuốc nhờ việc', body: (S, X, a, p) => `${nm(p)} cần người vào khu săn hái một loại rễ thuốc cho đứa trẻ đang sốt. Người làng đều ngại, khu ấy dạo này có quái. ${nm(p)} đứng ở cửa nhà bạn, không nói nhiều, chỉ chìa ra một mẩu rễ mẫu. Mẩu rễ nhỏ xíu, mà nặng tay.`,
      choices: () => [ch('go', 'Đi hái thuốc', 'Khu săn có quái.'), ch('learn', 'Đi, rồi xin theo học nghề', 'Học thuốc lâu lắm.'), ch('away', 'Từ chối', '')],
      apply(S, X, ch, a, p) { if (ch === 'away') { bond(p, -20); return `${nm(p)} gật đầu, không nói gì, rồi đi tìm người khác. Bạn đứng nhìn theo, gói thuốc bổ năm nào vẫn còn trên gác bếp. Đêm ấy bạn trằn trọc, nghĩ tới đứa trẻ đang sốt.`; } bond(p, 15); return ch === 'learn' ? `Bạn đi hái thuốc, và hỏi được tên từng loại cây dọc đường: lá nào đắng, rễ nào ngọt, cây nào chạm vào thì ngứa. Lúc về, bạn xin ${nm(p)} cho theo học. Người ấy nhìn bạn một lúc lâu, rồi gật đầu.` : 'Bạn đeo gùi lên đường trước khi trời sáng, trong tay cầm mẩu rễ mẫu. Sương còn đọng trên lá, rừng im phăng phắc. Bạn đi nhanh, nghĩ tới đứa trẻ đang sốt.'; },
      auto: S => (S.traits.studious > .6 ? 'learn' : S.traits.bold > .35 || S.traits.social > .5 ? 'go' : 'away') },
    trial: { base: (S, X, a) => (a.d.bg ? .5 : odds(S, X, .6)),
      run(S, X, a, ok, p) {
        if (a.d.bg) return ok ? { t: 'Đứa trẻ khỏi bệnh; người khác đã đi hái thuốc thay bạn. Cả xóm kể chuyện người ấy như kể chuyện anh hùng. Bạn nghe, cúi mặt ăn cho xong bát cơm.', k: 'info' } : { t: 'Đứa trẻ không qua khỏi. Tiếng khóc từ nhà ấy vọng sang tới tận đêm. Bạn nằm nghe, nhớ mẩu rễ nhỏ xíu trong tay thầy thuốc hôm nào.', k: 'bad' };
        if (ok) { X.add('so', 4); if (a.d.path === 'learn') X.gain('Alchemy', 4); return { t: `Bạn mang rễ thuốc về trước khi trời tối. ${nm(p)} sắc thuốc ngay trong đêm, mùi đắng ngai ngái khắp nhà. Đứa trẻ hạ sốt vào sáng hôm sau. Mẹ nó chạy sang, đứng ở cửa nhà bạn khóc mãi không thôi.`, k: 'good', bond: 10 }; }
        X.add('hl', -10); X.cond('wound'); return { t: `Bạn mang được rễ thuốc về, kèm một vết cắn ở bắp chân. Đứa trẻ khỏi; bạn nằm một tháng. ${nm(p)} ngày nào cũng sang thay thuốc cho bạn, vừa thay vừa mắng. Ơn cũ chưa trả, giờ lại thêm ơn mới.`, k: 'bad', bond: 15 };
      } },
    climax: { title: 'Dịch', body: (S, X, a, p) => `Dịch sốt lan tới làng. ${nm(p)} chạy từ nhà này sang nhà khác, thiếu người, thiếu thuốc. Ngày nào cũng có thêm nhà đóng cửa, treo nhành lá trước ngõ. ${nm(p)} gầy rộc, mắt trũng sâu, mà chưa ngồi nghỉ lấy một buổi.`,
      choices: (S, X) => [ch('nurse', 'Ở lại phụ thầy thuốc', 'Có thể lây.'), ch('fetch', 'Vượt núi lấy thuốc', `Chừng ${pct(odds(S, X, .5))} về kịp.`), ch('flee', 'Đưa nhà đi lánh', '')],
      apply(S, X, ch, a, p) {
        if (ch === 'nurse') { if (X.chance(.75)) { X.add('so', 6); return { t: `Bạn sắc thuốc, lau người bệnh suốt hai tháng bên ${nm(p)}, đêm nào cũng chỉ chợp mắt vài canh giờ cạnh bếp thuốc. ${a.d.path === 'learn' ? 'Những gì học được, giờ mới dùng tới hết.' : 'Bạn học được cách bắt mạch, cách đắp khăn, cách ngồi im bên người sắp mất.'} Khi dịch lui, cả hai đều gầy như que củi.`, o: 'nurse' }; } X.add('hl', -20); X.cond('fever'); return { t: 'Bạn lây bệnh, nằm liệt ba tuần, sốt mê man như năm nào. Tỉnh dậy, việc đầu tiên là hỏi còn bao nhiêu người ốm. Rồi bạn dậy làm tiếp, chân còn run.', o: 'nurse' }; }
        if (ch === 'fetch') { if (X.chance(odds(S, X, .5))) { fame(S, 3); return { t: `Bạn về sau chín ngày, gùi đầy thuốc, giày rách cả hai đế. Dịch chững lại từ hôm ấy. ${nm(p)} cầm nắm thuốc đầu tiên, tay run run, không nói được lời nào.`, o: 'fetched' }; } X.add('hl', -10); return { t: 'Bạn về muộn. Dịch đã qua đỉnh; nhiều người không đợi được. Gùi thuốc đặt xuống giữa sân, nặng mà muộn. Bạn ngồi bệt cạnh nó, không đứng dậy nổi.', o: 'nurse' }; }
        X.add('so', -6); return { t: 'Bạn đưa cả nhà lên núi tránh dịch, đi lúc trời chưa sáng. Ngoảnh lại, làng chìm trong khói đốt quần áo người bệnh. Trên núi, đêm nào bạn cũng nhìn về phía ấy.', o: 'fled' };
      },
      auto: (S, X, a) => (a.d.path === 'learn' || S.traits.social > .5 ? 'nurse' : S.traits.bold > .55 ? 'fetch' : 'flee'),
      bg: (S, X, a, p) => (a.d.ok ? { t: `${nm(p)} chống dịch một mình, cứu được nửa làng. Người ta kể suốt cả tháng thầy thuốc không ngủ. Bạn nghe, nhớ mẩu rễ nhỏ xíu năm nào, và cái gật đầu không một lời trách.`, o: 'refused' } : (kill(S, p), { t: `${nm(p)} chết vì dịch, sau khi cứu được nửa làng. Người ta tìm thấy thầy thuốc ngồi gục bên bếp thuốc, tay còn cầm cái quạt lửa. Bạn nghe tin, ngồi lặng tới khi bếp nhà mình tắt.`, o: 'p_died' })) },
    end: (S, X, a, p, o) => (o === 'nurse' ? (a.d.path === 'learn' ? 'apprentice' : 'repaid') : o),
    after: {
      repaid: (S, X, a, p) => ({ t: `${nm(p)} bảo: "Món nợ năm ấy, giờ ta nợ lại ngươi." Bạn xua tay. Hai người ngồi bên bếp thuốc đã nguội, uống chén trà đầu tiên sau mấy tháng. Ngoài sân, nắng đã lên.`, k: 'good', bond: 20 }),
      apprentice: (S, X, a, p) => ({ t: `Sau trận dịch, ${nm(p)} trao cho bạn hộp kim châm của thầy: "Giờ ngươi đi được một mình rồi." Hộp gỗ đã bóng vì tay người cầm nhiều năm. Từ đó có ai ốm trong vùng, người ta gõ cửa nhà bạn.`, k: 'big', bond: 20 }),
      fetched: () => ({ t: 'Người làng kể chuyện chín ngày vượt núi của bạn cho trẻ con nghe, mỗi năm một dài thêm. Tới đời cháu, chín ngày đã thành chín tháng. Bạn nghe, không cải chính.', k: 'big' }),
      fled: () => ({ t: 'Lúc bạn về, nửa làng đã đội khăn tang. Không ai nói gì với bạn. Nhà thầy thuốc vẫn sáng đèn, cửa mở, mùi thuốc đắng bay ra tận đường.', k: 'bad' }),
      refused: () => ({ t: 'Trận dịch qua. Người làng góp tiền dựng cho thầy thuốc một gian nhà thuốc mới, ngày khánh thành ai cũng tới. Bạn không tới. Đi ngang, bạn chỉ dám liếc vào.', k: 'bad' }),
      p_died: () => ({ t: 'Bạn đứng cuối đám tang, giữ trong túi toa thuốc năm nào. Người đưa tang đông kín đường làng. Bạn không chen lên được, mà cũng không dám chen.', k: 'bad' })
    } });

  // ── Bạn cùng lớp (đi học) ──
  grow('s_classmate', { nameVi: 'Bạn cùng lớp', from: 'school', p: .6, when: (S, X, k) => k !== 'no', good: ['lifelong', 'top', 'favor'],
    who: (S, X) => ({ role: 'ban', how: 'bạn cùng lớp của bạn', bond: 30, drive: X.rnd() }),
    quest: (a, p) => `Học cùng ${nm(p)}`,
    marks: { lifelong: 'ban_cu', top: 'vuot_doi_thu', favor: 'che_cho', apart: 'tiec_nuoi', used: 'tieng_xau', forgot: 'buong_bo' },
    sum: { lifelong: (d, p) => `làm bạn với ${nm(p)} từ thuở đi học tới lúc tóc bạc`, top: (d, p) => `đứng trên ${nm(p)} ở kỳ thi lớn`, favor: (d, p) => `được ${nm(p)}, bạn học cũ, nâng đỡ`,
      apart: (d, p) => `để mất người bạn học ${nm(p)}`, used: (d, p) => `lợi dụng tình bạn học với ${nm(p)}`, forgot: (d, p) => `quên dần ${nm(p)}, người ngồi cạnh mình ở lớp` },
    beat: { any: ['Bạn và {p} chép bài của nhau, bị phạt cùng nhau, quỳ cạnh nhau ngoài hiên mà vẫn thì thầm.', '{p} giảng lại cho bạn bài toán khó, tới khuya, giọng khản đặc mà không chịu thôi.'] },
    acts: acts({ open: { st: ['child', 'teen'], wait: [0, 4] }, knot: { wait: [1, 15], when: () => true }, trial: { st: TA }, climax: { st: ADE, when: (S, X) => ADE.includes(X.stage(S)) } }),
    open: (S, X, a, p) => ({ t: `Ở trường, bạn ngồi cạnh ${nm(p)}. ${p.drive > .6 ? `${nm(p)} học giỏi nhất lớp, và biết điều đó: lưng lúc nào cũng thẳng, thầy chưa hỏi xong đã giơ tay.` : 'Hai đứa hay trốn giờ ra bờ sông, nằm trên bãi cỏ đếm mây.'} Chiếc bàn gỗ chung đầy vết khắc của hai đứa. Thầy đồ nhìn hai cái đầu chụm vào nhau, lắc đầu.`, k: 'good' }),
    knot: { title: 'Kỳ thi', body: (S, X, a, p) => `Kỳ thi cuối khóa tới gần. ${nm(p)} rủ bạn ôn cùng, tay ôm chồng sách cao tới cằm. Cả lớp chỉ vài người được đỗ, ai cũng biết. Bạn nhìn chồng sách, rồi nhìn ${nm(p)}.`,
      choices: (S, X, a, p) => [ch('study', `Ôn cùng ${nm(p)}`, ''), ch('compete', 'Ôn một mình, thi cho hơn', ''), ch('away', 'Thôi học', 'Ở nhà có việc.')],
      apply(S, X, ch, a, p) { if (ch === 'study') { bond(p, 15); X.add('sm', 2); return 'Hai đứa ôn bài dưới ngọn đèn dầu tới khi gà gáy. Đứa này hỏi, đứa kia đáp, sai thì búng tai nhau. Sáng ra, mắt cả hai thâm quầng mà vẫn cười.'; } if (ch === 'compete') { X.add('sm', 3); bond(p, -5); return `Bạn ôn một mình, giấu sổ ghi chép dưới gối. ${nm(p)} có hỏi mượn một lần, bạn bảo để quên ở nhà. Đêm nào bạn cũng thức, nghe mõ canh, nghĩ tới cái tên trên bảng.`; } return `Bạn nghỉ học, về giúp nhà. Hôm thu dọn sách vở, ${nm(p)} đứng ở cổng trường nhìn theo. Chiếc bàn gỗ chung từ đó chỉ còn một người ngồi.`; },
      auto: S => (S.traits.social > .5 ? 'study' : S.traits.studious > .5 ? 'compete' : 'away') },
    trial: { base: S => .4 + .3 * S.traits.studious,
      run: (S, X, a, ok, p) => (a.d.bg ? { t: ok ? `${nm(p)} đỗ đầu kỳ thi, lên kinh học tiếp. Hôm ${nm(p)} đi, cả làng ra tiễn. Bạn đứng ở cuối đám đông, tay còn dính bùn.` : `${nm(p)} trượt, về làng làm ruộng. Gặp bạn ngoài đồng, ${nm(p)} cười: "Thế là lại cùng nhau." Bạn không biết nên vui hay buồn thay.`, k: 'info' }
        : ok ? { t: `Kỳ thi năm ấy bạn đỗ${a.d.path === 'compete' ? ', tên đứng trên ' + nm(p) : ' cùng ' + nm(p)}. ${a.d.path === 'compete' ? `${nm(p)} đứng đọc bảng rất lâu, rồi quay sang chúc bạn, nụ cười hơi gượng.` : 'Hai đứa ôm nhau nhảy giữa sân trường, mặc kệ thầy đồ quát.'} Tối ấy về nhà, bạn được ăn một bữa có thịt.`, k: 'good' } : { t: `Kỳ thi năm ấy bạn trượt. Bạn đứng tìm tên mình trên bảng ba lần, không thấy. ${a.d.path === 'study' ? `${nm(p)} đứng bên cạnh, không nói gì, chỉ đặt tay lên vai bạn.` : 'Xấp sổ ghi chép dưới gối, đêm ấy bạn đem đốt.'}`, k: 'bad' }) },
    climax: { title: 'Bạn học cũ', body: (S, X, a, p) => `Nhiều năm sau, ${nm(p)} ${p.drive > .5 ? 'giờ có chức ở phủ' : 'giờ là thầy đồ trong vùng'}, tìm tới nhà bạn. Tóc đã lốm đốm bạc, mà nụ cười vẫn y như hồi ngồi cạnh nhau ở lớp. Trên tay ${nm(p)} là một gói quà nhỏ. Bạn mời vào, chưa biết người ấy tới vì chuyện gì.`,
      choices: (S, X, a, p) => [ch('help', `Hỏi ${nm(p)} cần gì`, ''), ch('use', `Nhờ ${nm(p)} chạy giúp một việc`, 'Bạn học cũ, nể nhau.'), ch('cold', 'Tiếp như khách', '')],
      apply(S, X, ch, a, p) { if (ch === 'help') { bond(p, 20); X.add('h', 4); return { t: `${nm(p)} chỉ muốn ngồi uống chén trà, nói chuyện ngày xưa: chuyện trốn học, chuyện bị phạt, chuyện chiếc bàn gỗ đầy vết khắc. Hai người cười tới chảy nước mắt. Ấm trà pha lại ba lần.`, o: 'help' }; } if (ch === 'use') { bond(p, -5); return { t: `Bạn nhờ ${nm(p)} chạy giúp một việc. ${nm(p)} nhận lời, giọng hơi khác. Chén trà uống dở, người ấy đứng dậy về sớm hơn bạn tưởng.`, o: 'use' }; } bond(p, -10); return { t: `Bạn tiếp ${nm(p)} như khách, mời trà, hỏi han lấy lệ. ${nm(p)} ngồi một lúc, rồi về. Gói quà để lại trên bàn, bạn mở ra thì thấy cuốn sổ chép bài cũ của hai đứa.`, o: 'apart' }; },
      auto: S => (S.traits.social > .45 ? 'help' : sh(S, 'am') > .15 ? 'use' : 'cold'),
      bg: () => ({ t: 'Có lần bạn nghe tên người bạn học cũ ở chợ, nhớ mãi không ra mặt. Chỉ nhớ một chiếc bàn gỗ, hai cái đầu chụm vào nhau. Rồi người gọi cái tên ấy đi mất trong đám đông.', o: 'forgot' }) },
    end(S, X, a, p, o) { if (o === 'help') return a.d.path === 'compete' && a.d.ok ? 'top' : 'lifelong'; if (o === 'use') return p.drive > .5 ? 'favor' : 'used'; return o; },
    after: {
      lifelong: (S, X, a, p) => ({ t: `Tóc bạc cả rồi, ${nm(p)} và bạn vẫn cãi nhau về một bài toán năm xưa. Chẳng ai còn nhớ đề bài, chỉ nhớ ai đã giải sai. Cãi xong, hai người lại hẹn nhau phiên chợ sau.`, k: 'good', bond: 10 }),
      top: (S, X, a, p) => ({ t: `${nm(p)} nhắc lại kỳ thi năm ấy, cười: "Ta chưa bao giờ thua ai, trừ ngươi." Giọng không còn chút gượng nào. Bạn rót thêm trà, thấy món nợ năm xưa coi như đã xóa.`, k: 'good' }),
      favor: () => ({ t: 'Việc xong, gọn gàng như chưa từng khó. Từ đó có chuyện gì ở phủ, bạn biết gõ cửa nhà ai. Mỗi lần gõ, bạn lại mang theo một gói trà, như trả dần một món nợ không ai ghi.', k: 'good' }),
      apart: () => ({ t: 'Lần sau gặp nhau ở chợ, hai người chào nhau như người quen sơ. Chiếc bàn gỗ năm xưa chắc đã bị đốt làm củi từ lâu. Cuốn sổ chép bài, bạn vẫn để trên gác.', k: 'bad' }),
      used: (S, X, a, p) => ({ t: `Việc không thành, mà tình bạn cũ cũng sứt. Gặp nhau ở đâu, ${nm(p)} cũng chào trước, lịch sự như với người ngoài. Cái lịch sự ấy làm bạn khó chịu hơn cả một lời trách.`, k: 'bad' }),
      forgot: () => ({ t: 'Có những người ngồi cạnh mình mấy năm, rồi đi qua đời mình như gió. Bạn chỉ còn nhớ cảm giác vai chạm vai trên chiếc ghế dài. Tên thì quên, mặt cũng quên.', k: 'info' })
    } });

  // ── Kẻ trốn giấy phép (giấu chuyện luyện phép) ──
  grow('s_license', { nameVi: 'Kẻ trốn giấy phép', from: 'cv_license', p: .6, when: (S, X, k) => k === 'hide', good: ['clean', 'slip', 'shield'],
    quest: () => 'Luyện phép không giấy',
    marks: { clean: 'giu_loi', slip: 'biet_bi_mat', shield: 'duoc_tin', bribe: 'cua_phi_nghia', caught: 'tieng_xau', informer: 'ke_thu' },
    sum: { clean: () => 'đi đăng ký giấy phép luyện phép, dù muộn', slip: () => 'luyện phép không giấy cả đời mà không bị bắt', shield: () => 'che giấu người hàng xóm luyện phép không giấy',
      bribe: () => 'đút lót để luyện phép không giấy', caught: () => 'bị bắt quả tang luyện phép không giấy', informer: () => 'chỉ điểm người luyện phép không giấy để lấy thưởng' },
    beat: { any: ['Bạn kéo rèm, luyện phép dưới ánh nến. Ngọn lửa trên tay run run, hắt bóng lên vách như một con thú nhỏ.', 'Có tiếng gõ cửa. Bạn giật mình dập tắt phép, tim đập thình thịch, hóa ra người bán dầu.'] },
    open: () => ({ t: 'Lính tuần tra hỏi han cả xóm về người luyện phép không giấy. Họ đứng ở đầu ngõ ghi chép, hỏi cả trẻ con. Đêm ấy bạn không dám thắp nến, ngồi trong bóng tối nghe tiếng giày đi qua.', k: 'info' }),
    knot: { title: 'Giấy phép', body: (S, X) => `Phạt nộp muộn chừng ${G.coin(Math.round(med(S, X) * .4))}. Bị bắt thì nặng hơn nhiều. Cuốn sách phép giấu dưới đáy rương bỗng như nóng lên. Bạn biết không thể giấu mãi theo cách cũ.`,
      choices: (S, X) => [ch('register', 'Đi đăng ký, nộp phạt', `Mất ${G.coin(Math.round(med(S, X) * .4))}.`), ch('bribe', 'Đút lót đội trưởng tuần', 'Rẻ hơn, nếu hắn giữ lời.'), ch('hide', 'Giấu kỹ hơn', '')],
      apply(S, X, ch) { if (ch === 'register') { X.money(-Math.round(med(S, X) * .4)); return 'Bạn nộp phạt, tên bạn vào sổ của hội pháp sư. Viên thư lại ghi chậm rãi, hỏi đi hỏi lại năm sinh. Bước ra cửa, bạn thấy lưng mình thẳng hơn lúc bước vào.'; } if (ch === 'bribe') { X.money(-Math.round(med(S, X) * .2)); G.trajBump(S, { am: .2 }); return 'Bạn nhét túi bạc vào tay đội trưởng tuần, ngay sau quán rượu. Hắn cân cân túi bạc trong tay, cười, không nói gì. Về nhà, bạn vẫn kéo rèm như mọi đêm.'; } return 'Bạn đào một căn hầm dưới bếp để luyện, mỗi đêm một ít, đất đổ ra sau vườn. Mất hai tháng mới xong. Dưới đó tối và ẩm, nhưng không ai thấy ánh phép.'; },
      auto: (S, X) => (S.traits.pious > .5 || S.gold > med(S, X) ? 'register' : sh(S, 'am') > .15 ? 'bribe' : 'hide') },
    trial: { base: (S, X, a) => (a.d.path === 'register' ? .9 : a.d.path === 'bribe' ? .65 : .5),
      run(S, X, a, ok) {
        if (a.d.path === 'register') return { t: 'Lính tuần đi ngang nhà bạn, gật đầu chào. Lần đầu tiên bạn chào lại mà không phải giấu tay sau lưng. Ánh nến đêm ấy thắp sáng cả gian nhà.', k: 'info' };
        if (ok) return { t: 'Đợt lùng năm ấy đi qua nhà bạn mà không dừng lại. Bạn nghe tiếng giày xa dần, rồi mới dám thở ra. Cả xóm có hai nhà bị gõ cửa, nhà bạn không nằm trong số đó.', k: 'info' };
        X.money(-Math.round(med(S, X) * .6)); cnt(S, 'crimes'); return { t: 'Lính tuần gõ cửa đúng lúc bạn đang luyện, ánh phép còn sáng trên tay. Bạn nộp phạt, tên bạn vào sổ. Hàng xóm đứng xem qua hàng rào, thì thầm với nhau.', k: 'bad' };
      } },
    climax: { title: 'Đợt lùng bắt', body: () => 'Phủ mở đợt lùng bắt lớn, lính chia nhau gõ từng nhà. Bà hàng xóm cũng luyện lén, chạy sang nhà bạn, mặt cắt không còn giọt máu. Bà nắm chặt cổ tay bạn, tay lạnh ngắt. Tiếng giày đã tới đầu ngõ.',
      choices: () => [ch('shield', 'Giấu bà ấy', 'Bị phát hiện thì cả hai cùng tội.'), ch('report', 'Chỉ điểm lấy thưởng', ''), ch('low', 'Đóng cửa, không dính vào', '')],
      apply(S, X, ch, a) {
        if (ch === 'shield') { if (X.chance(.55 + (a.d.path === 'register' ? .2 : 0))) { X.add('so', 5); return { t: `Bạn giấu bà ấy ${a.d.path === 'hide' ? 'xuống căn hầm dưới bếp' : 'sau tấm vách buồng trong'}. Lính lục nhà bạn, không tìm thấy gì. Lúc họ đi khuất, bà ấy chui ra, run lẩy bẩy, nắm tay bạn mãi không buông.`, o: 'shield' }; } cnt(S, 'crimes'); return { t: 'Lính lục từng góc nhà, gõ từng tấm vách. Họ tìm thấy cả hai. Bà hàng xóm khóc nấc, còn bạn đứng im nghe họ đọc tội danh.', o: 'caught' }; }
        if (ch === 'report') { X.money(Math.round(med(S, X) * .5)); X.add('so', -6); return { t: 'Bạn chỉ cho lính chỗ bà ấy đang nấp. Lính trả thưởng ngay tại chỗ, đếm tiền vào tay bạn. Lúc bị lôi ra cửa, bà hàng xóm nhìn bạn không chớp mắt.', o: 'informer' }; }
        return { t: 'Bạn đóng cửa, không dính vào. Bà hàng xóm đứng ngoài một lúc, rồi chạy đi. Đêm ấy có tiếng khóc ở nhà bên, mãi tới gần sáng mới tắt.', o: 'low' };
      },
      auto: S => (S.traits.social > .5 || S.traits.pious > .6 ? 'shield' : sh(S, 'am') > .25 ? 'report' : 'low') },
    end(S, X, a, p, o) { if (o !== 'low') return o; if (a.d.path === 'register') return 'clean'; if (!a.d.ok) return 'caught'; return a.d.path === 'bribe' ? 'bribe' : 'slip'; },
    after: {
      clean: () => ({ t: 'Giấy phép treo trên vách. Bạn luyện phép giữa ban ngày, cửa mở. Trẻ con trong xóm bu ở cửa xem, có đứa xin học. Bạn dạy nó cách thắp một ngọn lửa nhỏ, và cách đi đăng ký.', k: 'good' }),
      slip: () => ({ t: 'Căn hầm dưới bếp vẫn còn đó. Không ai biết, trừ bạn. Đêm nào bạn cũng xuống, ánh phép le lói giữa bốn bức tường đất. Cả đời, chưa một lần bạn luyện phép dưới ánh mặt trời.', k: 'info' }),
      shield: () => ({ t: 'Bà hàng xóm đi đăng ký vào tuần sau. Tết nào bà cũng mang sang một mâm xôi, còn nóng hổi. Có lần bà bảo: "Đêm ấy, ta tưởng mình hết đời." Rồi bà lại cười, đẩy mâm xôi về phía bạn.', k: 'good' }),
      bribe: () => ({ t: 'Mỗi năm đội trưởng tuần ghé một lần, đúng ngày, không cần nói gì. Túi bạc mỗi năm một nặng thêm. Bạn trả, rồi kéo rèm, luyện tiếp.', k: 'bad' }),
      caught: () => ({ t: 'Tên bạn nằm trong sổ của phủ. Có việc gì ở xóm, người ta nhìn bạn trước. Mất con gà, vỡ cái chum, người ta cũng bảo tại phép của nhà kia.', k: 'bad' }),
      informer: () => ({ t: 'Nhà bên dọn đi. Người xóm không hỏi vì sao; họ biết. Món tiền thưởng ấy, bạn tiêu dần vào những thứ không ai thấy. Ngày tết, cổng nhà bạn vắng hơn mọi năm.', k: 'bad' })
    } });

  SA.wrap();
})(window.LifeSim);
