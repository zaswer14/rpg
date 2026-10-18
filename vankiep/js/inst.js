/* Vạn Kiếp — HỌC VIỆN, GIA TỘC, ĐẤU GIÁ, MỎ MA TINH theo kiểu Bàn Long (bước D của docs/07 mục 4.7, 7; số chốt và kết quả ở docs/07 mục 4.12).
 *   Học viện danh tiếng (cv_academy): thiếu niên căn cốt tốt được học viện ở kinh đô mời vào lớp tài năng: miễn thi, học bổng trung cấp và cao cấp,
 *     học thẳng trung cấp; đang học thì luyện thêm.
 *   Đại hội tỉ thí (cv_tourney): mỗi nước 4 năm một lần, cho người trẻ có cấp hoặc đang học trung cấp trở lên; ba vòng đấu theo sức;
 *     vô địch được ban dược tề thượng hạng, danh vọng, công trạng.
 *   Đấu giá hội (cv_auction): thành phố, kinh đô; mua dược tề thượng hạng, vũ khí ma pháp, ma tinh hạch, tác phẩm danh gia; danh gia bán tác phẩm.
 *   Huyết mạch (G.BLOODLINE): nhà quý tộc, hoàng tộc có thể mang huyết mạch chiến sĩ của một trường phái (dân thường hiếm khi có huyết mạch ẩn);
 *     tuổi thiếu niên có thể thức tỉnh: căn cốt nhảy bậc, rèn trường phái đó nhanh hơn, trưởng lão dòng họ dạy tới Tier 3.
 *   Liên hôn (cv_match): người nhà quý tộc, hoàng tộc, có tước tới tuổi lấy vợ lấy chồng: nhà bên kia gửi lời; cưới thì có của hồi môn,
 *     dược tề, người dạy của nhà vợ / chồng; căn cốt bạn đời theo bậc nhà đó.
 *   Mỏ ma tinh (cv_mine): thế giới động mọc mỏ ở tỉnh ma lực cao (js/dynamic.js mineYear); ở gần thì đi đào, hoặc theo quân giành mỏ.
 * Trạng thái: S.flags.academy, S.flags.blood = { school, awake }, S.flags.inlaw = { rank, k }, S.flags.mineSeen, S.flags.giftElixirL (mức dược tề được ban),
 *   S.family.spouse.root, .house.
 */
window.LifeSim = window.LifeSim || {};
(function (G) {
  const DEC = G.DECISIONS, J = window.JobLibrary;
  const cnt = (S, k, v = 1) => { S.flags[k] = (S.flags[k] || 0) + v; };
  const roles = S => S.roles || (S.roles = { head: null, office: null, ruler: null, orgs: {}, adv: null });
  const med = (S, X) => G.median(X.reg(S));
  const sig = (d, k = 3.2) => 1 / (1 + Math.exp(-k * d));

  G.INST = {
    academyBoost: 15,          // điểm rèn thêm mỗi năm khi học ở lớp tài năng
    tourneyEvery: 4,           // năm giữa hai kỳ đại hội tỉ thí của một nước
    tourneyOpp: [1.7, 2.2, 2.7],   // sức đối thủ ba vòng (cộng nhiễu ±0,3)
    bloodP: { royal: .6, house: .3, common: .01 },   // xác suất mang huyết mạch lúc sinh
    bloodWake: .12,            // mỗi năm tuổi thiếu niên
    bloodGain: 1.25,           // rèn trường phái huyết mạch × này khi đã thức tỉnh
    mineDie: .02
  };
  G.BLOOD_SCHOOLS = ['combat', 'martial', 'ranged', 'beast', 'arcane', 'shadow'];

  // ═════════ Dược tề được ban có mức (js/status.js đọc giftElixirL) ═════════
  const gift = (S, years, l) => { const F = S.flags; F.giftElixir = Math.max(F.giftElixir || 0, years); F.giftElixirL = Math.max(F.giftElixirL || 2, l); };

  // ═════════ Học viện danh tiếng ═════════
  { const base = G.examChance; G.examChance = (S, lv) => S.flags && S.flags.academy && lv === 2 ? .97 : base(S, lv); }
  const capitalSchool = S => { const n = S.nation != null && S.nation >= 0 ? G.realm.nations[S.nation] : null, c = n && G.SET[n.capital]; return c && c.tier !== 'ruin' && (c.bld || []).includes('school') ? c : null; };
  DEC.cv_academy = {
    prio: 7, gap: 2,
    when(S, X) {
      const F = S.flags; if (S.dead || S.undead || G.RACES[S.race].construct || F.academy || F.academyNo || X.stage(S) !== 'teen' || !S.tal) return false;
      const rk = G.RANK[S.tal.root]; return (rk >= 4 || (rk === 3 && S.sm >= 55 && S.traits.studious > .6)) && !!capitalSchool(S) && !(S.edu && S.edu.lv >= 2);
    },
    build(S, X) {
      const c = capitalSchool(S);
      return { title: 'Thư mời của học viện', body: `Học viện ở ${c.name} nghe tin về căn cốt của bạn (${G.rootText(S)}). Thư mời tới bằng ngựa trạm, giấy dày, dấu son đỏ chói, cả nhà chuyền tay nhau đọc. Họ mời bạn vào lớp tài năng: không phải thi, học bổng toàn phần ở trung cấp; lên cao cấp thì thi như mọi người.`,
        choices: [{ k: 'go', label: 'Nhận lời', sub: 'Học thẳng trung cấp; đang học thì luyện nhiều hơn lớp thường.' }, { k: 'no', label: 'Ở lại', sub: 'Gia đình cần bạn.' }] };
    },
    apply(S, X, k) {
      const F = S.flags; if (k !== 'go') { F.academyNo = true; cnt(S, 'academyNo'); return null; }
      F.academy = capitalSchool(S).id; F.grantTry2 = 1; cnt(S, 'academyIn');
      const E = S.edu || (S.edu = { lv: 0, cur: null, track: null }); if (!E.cur && E.lv < 1) E.lv = 1;
      X.add('sm', 3); S.fame = Math.min(100, S.fame + 2);
      return 'Bạn khăn gói lên kinh đô. Trên cổng học viện khắc tên những người đã thành Thủ Hộ Giả, nét chữ mạ vàng đã mòn vì mưa gió. Bạn đứng dưới cổng đọc từng cái tên, tới khi người gác giục vào.';
    },
    auto: S => S.traits.studious > .3 || S.traits.bold > .5 || ['scholar', 'martial', 'power'].includes(S.aim) ? 'go' : 'no'
  };

  // ═════════ Đại hội tỉ thí ═════════
  const tourneyNation = S => { const k = S.nation; if (k == null || k < 0) return null; const n = G.realm.nations[k], d = S.world.dyn.nat[k]; return n && d && d.alive && (S.world.year + k) % G.INST.tourneyEvery === 0 ? n : null; };
  const young = (S, X) => { const st = X.stage(S); return st === 'teen' || (st === 'adult' && X.years(S) <= X.R(S).adult * 1.6); };
  DEC.cv_tourney = {
    prio: 6, gap: 3,
    when: (S, X) => !S.dead && !S.undead && young(S, X) && !!tourneyNation(S) && (G.tierOf(S) >= 1 || (S.edu && ((S.edu.cur && S.edu.cur.lv >= 2) || S.edu.lv >= 2)) || !!S.flags.academy),
    build(S, X) {
      const n = tourneyNation(S);
      return { title: 'Đại hội tỉ thí', body: `${n.name} mở đại hội tỉ thí cho người trẻ ở kinh đô: ba vòng, người thắng được triều đình ban dược tề thượng hạng. Cờ treo kín các phố, quán trọ nào cũng hết chỗ, đâu đâu cũng nghe người ta đánh cược. Sức bạn ${X.power(S).toFixed(2)}.`,
        choices: [{ k: 'join', label: 'Ghi tên', sub: 'Thua thì bị thương, thắng thì nổi danh.' }, { k: 'no', label: 'Đứng xem', sub: '' }] };
    },
    apply(S, X, k) {
      if (k !== 'join') return null;
      const n = tourneyNation(S) || G.realm.nations[S.nation], I = G.INST, pw = X.power(S); let r = 0;
      cnt(S, 'tourney');
      for (; r < 3; r++) if (X.rnd() > sig(pw - I.tourneyOpp[r] + (X.rnd() - .5) * .6)) break;
      if (r === 3) {
        gift(S, 4, 3); S.fame = Math.min(100, S.fame + 10); X.money(Math.round(med(S, X) * 5)); G.addMerit && G.addMerit(S, n.idx, 10); cnt(S, 'tourneyWin');
        G.histAdd && G.histAdd(S.world, 'tourney', `${S.name} vô địch đại hội tỉ thí của ${n.name}.`);
        return `Trận cuối kéo dài tới lúc đèn đuốc thắp quanh đài. Khi đối thủ ngã xuống, cả khán đài đứng bật dậy hô tên bạn. Bạn vô địch. ${n.ruler ? n.ruler.title + ' ' + n.ruler.name : 'Triều đình'} ban bốn năm dược tề thượng hạng.`;
      }
      if (r === 2) { gift(S, 2, 2); S.fame = Math.min(100, S.fame + 4); cnt(S, 'tourneyTop'); return 'Bạn vào tới trận cuối rồi thua sát nút, chỉ chậm hơn đối thủ nửa nhịp. Đêm ấy bạn nằm nghĩ lại đòn cuối, nghĩ mãi không thôi. Dù sao vẫn được ban hai năm dược tề.'; }
      X.add('hl', -X.int(5, 15)); if (r === 1) S.fame = Math.min(100, S.fame + 1);
      return r ? 'Bạn thắng trận đầu, tiếng reo còn chưa dứt thì sang trận sau đã bị loại. Về quán trọ, bạn ngồi xoa mấy chỗ bầm, nhớ mặt từng người đã thắng mình.' : 'Bạn bị loại ngay vòng đầu, chưa kịp hiểu chuyện gì. Ba ngày sau mới dậy nổi khỏi giường. Ngoài kia đại hội vẫn tiếp tục, tiếng trống vọng tới tận phòng.';
    },
    auto: S => S.traits.bold > .4 || ['martial', 'adventure', 'power'].includes(S.aim) ? 'join' : 'no'
  };

  // ═════════ Đấu giá hội ═════════
  const bigTown = S => { const s = G.here(S).s; return s && (s.tier === 'city' || s.tier === 'capital') ? s : null; };
  function lots(S, X) {
    const m = med(S, X), out = [];
    out.push({ k: 'elixir', label: 'Lô dược tề thượng hạng', price: Math.round(G.elixirCost(S, X, 3) * 3 * .9), sub: 'Ba năm dược tề thượng hạng (điểm rèn × 1,5).' });
    if (S.gear < 10) out.push({ k: 'gear', label: 'Vũ khí ma pháp', price: Math.round(m * (3 + S.gear) * 1.2), sub: `Trang bị ${S.gear} → ${Math.min(10, S.gear + 2)}.` });
    out.push({ k: 'core', label: 'Ma tinh hạch của một chúa vùng', price: Math.round(m * 4), sub: 'Luyện hóa một lần: điểm rèn lớn.' });
    out.push({ k: 'art', label: 'Tác phẩm của một danh gia', price: Math.round(m * 5), sub: 'Treo trong nhà; khách tới ai cũng trầm trồ.' });
    return out.filter(o => S.gold >= o.price);
  }
  DEC.cv_auction = {
    prio: 3, gap: 5,
    when: (S, X) => !S.dead && !S.undead && ['adult', 'elder'].includes(X.stage(S)) && !!bigTown(S) && (lots(S, X).length > 0 || !!S.flags.artMaster),
    build(S, X) {
      const s = bigTown(S), L = lots(S, X).map(o => ({ ...o, sub: `${G.coin(o.price)} · ${o.sub}` }));
      if (S.flags.artMaster) L.push({ k: 'sell', label: 'Gửi bán một tác phẩm của mình', sub: 'Danh gia gửi bán thì giá lên cao.' });
      return { title: 'Đấu giá hội', body: `Phòng đấu giá ở ${s.name} mở phiên lớn, xe ngựa đỗ kín hai đầu phố. Trong sảnh, người hầu đi rót trà, các quý nhân ngồi phe phẩy quạt chờ lô đầu tiên. Bạn có ${G.coin(S.gold)}.`, choices: [...L, { k: 'no', label: 'Chỉ xem', sub: '' }] };
    },
    apply(S, X, k, c) {
      if (k === 'no') return null;
      cnt(S, 'auction_' + k);
      if (k === 'sell') { const g = Math.round(med(S, X) * X.int(5, 15)); X.money(g); S.fame = Math.min(100, S.fame + 3); return `Tác phẩm của bạn được đem ra cuối phiên. Giá cứ thế lên, tới khi chỉ còn hai người giơ thẻ. Cuối cùng nó về tay một quý nhân, với giá ${G.coin(g)}.`; }
      X.money(-c.price);
      if (k === 'elixir') { gift(S, 3, 3); return 'Bạn mang về ba hộp dược tề niêm sáp đỏ, ôm trong lòng suốt đường như ôm trứng. Mở nắp ra, mùi thuốc thơm cả gian nhà.'; }
      if (k === 'gear') { S.gear = Math.min(10, S.gear + 2); return `Hai người cuối cùng đẩy giá lên mãi, rồi người kia lắc đầu bỏ cuộc. Món vũ khí ma pháp về tay bạn, cầm lên thấy tê tê trong lòng bàn tay. Trang bị ${S.gear}/10.`; }
      if (k === 'core') { X.addXp(220); return 'Bạn mang ma tinh hạch về, đóng cửa bế quan. Ba ngày liền kinh mạch nóng rực, như có than hồng chạy trong người. Mở cửa bước ra, bạn thấy mình nhẹ hẳn đi.'; }
      X.add('h', 10); X.add('so', 4); return 'Bức tượng của danh gia giờ đứng giữa sảnh nhà bạn. Khách tới ai cũng dừng lại ngắm, có người còn đưa tay sờ thử nếp áo bằng đá. Hỏi giá bao nhiêu, bạn chỉ cười.';
    },
    auto(S, X, d) {
      const has = k => d.choices.find(c => c.k === k), keen = ['martial', 'adventure', 'power'].includes(S.aim);
      if (has('sell')) return 'sell';
      const e = has('elixir'); if (e && keen && S.gold > e.price * 2.5) return 'elixir';
      const g = has('gear'); if (g && S.gear < 6 && S.gold > g.price * 2.5 && S.traits.bold > .4) return 'gear';
      const c = has('core'); if (c && keen && S.gold > c.price * 4) return 'core';
      const a = has('art'); if (a && S.traits.social > .7 && S.gold > a.price * 6) return 'art';
      return 'no';
    }
  };

  // ═════════ Huyết mạch ═════════
  { const base = G.bloodRoot; G.bloodRoot = X => {
      const r = base(X), S = X.S, P = G.INST.bloodP, R = G.RACES[S.race];
      if (!R.construct && !R.undead) {
        const p = S.flags.royal ? P.royal : S.flags.house ? P.house : P.common;
        if (X.chance(p)) { const own = J.races[S.race].schools.native.filter(s => G.BLOOD_SCHOOLS.includes(s)); S.flags.blood = { school: X.pick(own.length ? own : ['combat']), awake: null, clan: !!(S.flags.royal || S.flags.house) }; cnt(S, 'bloodBorn'); }
      }
      return r;
    }; }
  { const base = G.gainMult; G.gainMult = (S, m) => { const b = S.flags && S.flags.blood; return base(S, m) * (b && b.awake != null && G.MASTERY[m] === b.school ? G.INST.bloodGain : 1); }; }
  G.TEACHERS.push({ id: 'blood', nameVi: 'Trưởng lão dòng họ', tier: 3, schools: 'trường phái của huyết mạch', cond: 'thức tỉnh huyết mạch của nhà quý tộc, hoàng tộc (cv_bloodline)' });
  G.TEACHERS.push({ id: 'inlaw', nameVi: 'Nhà vợ, nhà chồng', tier: '3 (nhà từ Hầu tước: 4)', schools: null, cond: 'liên hôn với một nhà quý tộc (cv_match)' });
  { const base = G.teachList; G.teachList = (S, school, job) => {
      const out = base(S, school, job), F = S.flags || {}, b = F.blood;
      if (b && b.awake != null && b.clan && b.school === school) out.push({ t: 3, id: 'blood', nameVi: 'Trưởng lão dòng họ' });
      if (F.inlaw) out.push({ t: F.inlaw.rank >= 4 ? 4 : 3, id: 'inlaw', nameVi: 'Nhà vợ, nhà chồng' });
      return out;
    }; }
  function wakeBlood(S, X) {
    const b = S.flags.blood, k0 = G.RANK[S.tal.root], k = Math.min(5, k0 + (X.chance(.3) ? 2 : 1));
    b.awake = S.age; cnt(S, 'bloodWake');
    if (k > k0) { S.tal.root = G.RARITY[k].id; G.talRecalc(S); }
    X.log(`Một đêm bạn lên cơn sốt, máu trong người nóng như nước sôi. Trong mơ, những người lạ có gương mặt giống bạn đứng thành hàng, lặng lẽ nhìn. Sáng ra cơn sốt lui: huyết mạch ${J.schools[b.school].nameVi.toLowerCase()} trong người bạn đã thức tỉnh. Căn cốt lên ${G.RARITY[k].nameVi}${b.clan ? '; trưởng lão dòng họ nhận dạy bạn kỹ năng của dòng' : ''}.`, 'big');
  }

  // ═════════ Liên hôn ═════════
  const highBorn = S => { const F = S.flags, r = S.roles; return !!(F.house || F.royal || (r && r.noble)); };
  const matchNation = S => { const k = (S.roles && S.roles.noble && S.roles.noble.k) ?? (S.flags.house && S.flags.house.k) ?? (S.flags.royal && S.flags.royal.k) ?? S.nation; return k != null && k >= 0 && G.grantsTitles && G.grantsTitles(k) ? k : null; };
  DEC.cv_match = {
    prio: 5, gap: 3,
    when(S, X) {
      if (S.dead || S.undead || !highBorn(S) || S.flags.matchDone || (S.family.spouse && S.family.spouse.alive) || X.stage(S) !== 'adult') return false;
      return X.years(S) <= X.R(S).adult + 15 && matchNation(S) != null && (S.flags.matchNo || 0) < 2;
    },
    build(S, X) {
      const k = matchNation(S), n = G.realm.nations[k];
      if (!S.flags.matchQ) {
        const L = G.noblesOf(S.world, k).filter(x => !x.player), h = L.length ? X.pick(L) : { rank: 2, name: G.personName(n.race === 'construct' ? 'dwarf' : n.race, 'm', X.rnd) };
        const race = S.race, sex = S.sex === 'm' ? 'f' : S.sex === 'f' ? 'm' : X.pick(['m', 'f']);
        S.flags.matchQ = { rank: h.rank, house: h.name.split(' ').slice(1).join(' ') || h.name, name: G.personName(race, sex, X.rnd), race, k };
      }
      const q = S.flags.matchQ, dow = Math.round(med(S, X) * (1 + q.rank));
      return { title: 'Liên hôn', body: `Người của nhà ${G.NOBLE_VI[q.rank]} ${q.house} ở ${n.name} tới thăm, mang theo bức họa ${q.name} cuộn trong ống gấm. Họ ngỏ ý gả ${q.name} cho bạn. Hai nhà kết thông gia thì của cải, thầy dạy, dược tề đều dùng chung.`,
        choices: [{ k: 'yes', label: `Cưới ${q.name}`, sub: `Hồi môn ${G.coin(dow)}; ba năm dược tề; thầy của nhà bên kia dạy tới Tier ${q.rank >= 4 ? 4 : 3}.`, dow }, { k: 'no', label: 'Từ chối', sub: 'Muốn tự chọn người mình thương.' }] };
    },
    apply(S, X, k, c) {
      const q = S.flags.matchQ; S.flags.matchQ = null;
      if (k !== 'yes') { cnt(S, 'matchNo'); X.add('so', -3); return null; }
      S.flags.matchDone = true; cnt(S, 'matchYes');
      const root = X.wpick([0, 1, 2, 3, 4, 5], i => G.RARITY[i].w * Math.exp(.35 * i));
      S.family.spouse = { name: q.name, race: q.race, age: X.years(S) + X.int(-4, 3), alive: true, root, house: q.rank };
      S.flags.inlaw = { rank: q.rank, k: q.k }; gift(S, 3, 2); X.money(c.dow); X.add('h', 6); X.add('so', 8);
      return `Đám cưới hai nhà kéo dài ba ngày, khách đông tới mức phải dựng thêm rạp ngoài sân. Đêm cuối, khi khách đã về hết, hai người mới nói với nhau được câu đầu tiên. ${q.name} mang theo ${G.RARITY[root].nameVi.toLowerCase() === 'trắng' ? 'của hồi môn' : 'căn cốt ' + G.RARITY[root].nameVi + ' và của hồi môn'}.`;
    },
    auto: S => S.traits.social > .35 || ['power', 'family'].includes(S.aim) ? 'yes' : 'no'
  };

  // ═════════ Mỏ ma tinh (js/dynamic.js mineYear) ═════════
  const freshMine = S => (G.minesNear ? G.minesNear(S) : []).find(m => !(S.flags.mineSeen || {})[m.id]);
  DEC.cv_mine = {
    prio: 5, gap: 2,
    when: (S, X) => !S.dead && !S.undead && ['adult', 'elder'].includes(X.stage(S)) && !!freshMine(S),
    build(S, X) {
      const m = freshMine(S), R = G.realm, D = S.world.dyn, k = D.prov[m.p], war = (D.war[m.p] || 0) > 0 && S.nation != null && D.wars.some(w => w.a === S.nation || w.b === S.nation);
      const ch = [{ k: 'dig', label: 'Đi đào ma tinh một mùa', sub: 'Sơn mạch quanh mỏ nhiều ma thú; ma tinh bán được giá, luyện hóa thì mạnh lên.' }];
      if (war) ch.push({ k: 'army', label: 'Theo quân giành mỏ', sub: 'Một năm tại ngũ; công trạng.' });
      ch.push({ k: 'no', label: 'Mặc kệ', sub: '' });
      const own = k >= 0 ? ' (' + R.nations[k].name + ')' : '';
      return { title: 'Mỏ ma tinh', body: `Mỏ ma tinh ở tỉnh ${R.provinces[m.p].name}${own} đang hút người tứ xứ. Trên đường cái, xe chở cuốc xẻng đi thành đoàn, đêm đêm sườn núi lập lòe đèn đuốc.${war ? ' Quân các nước đang tranh nhau tỉnh này.' : ''}`, choices: ch };
    },
    apply(S, X, k) {
      const m = freshMine(S); (S.flags.mineSeen = S.flags.mineSeen || {})[m.id] = true;
      if (k === 'no') return null;
      cnt(S, 'mine_' + k);
      if (k === 'army') { S.flags.soldier = Math.max(S.flags.soldier || 0, 1); S.flags.served = true; if (S.nation != null) G.addMerit && G.addMerit(S, S.nation, 4); return 'Bạn nhập đoàn quân đi giữ mỏ, nhận một bộ áo lính còn mùi người mặc trước. Đêm đầu nằm trong doanh trại, bạn nghe tiếng cuốc của phu mỏ vọng xuống từ sườn núi, đều như tiếng tim.'; }
      const T = G.tierOf(S), p = sig(X.power(S) - 1.6 - X.rnd() * .8);
      if (X.rnd() < p) { const g = Math.round(med(S, X) * X.int(2, 6) * (1 + .5 * T)); X.money(g); X.addXp(120); cnt(S, 'mineGood'); return `Một mùa ở mỏ, tay chai thêm một lớp, ho ra toàn bụi đá. Bạn mang về ${G.coin(g)} và giữ lại vài viên ma tinh để luyện hóa, viên nào cũng sáng mờ như mắt mèo trong tối.`; }
      X.add('hl', -X.int(10, 25));
      if (X.chance(G.INST.mineDie)) { X.die({ id: 'mine', text: `chết ở mỏ ma tinh ${G.realm.provinces[m.p].name}` }); return null; }
      return 'Một đêm, ma thú quanh mỏ tràn vào lán. Người la, đèn đổ, cả đoàn đào chạy tán loạn trong bóng tối. Bạn về tay trắng, người đầy vết cào, mấy tháng sau còn giật mình vì tiếng gió rít.';
    },
    auto: (S, X, d) => d.choices.some(c => c.k === 'army') && S.traits.bold > .6 ? 'army' : S.traits.bold > .45 || ['miner', 'porter', 'adventurer'].includes(S.work) ? 'dig' : 'no'
  };

  // ═════════ Hệ con "inst" (sau "econ"): lớp tài năng luyện thêm, thức tỉnh huyết mạch ═════════
  G.instYear = function (S, X) {
    const F = S.flags, ypt = X.R(S).ypt;
    if (S.undead) return;
    if (F.academy && S.edu && S.edu.cur && S.edu.cur.lv >= 2) X.addXp(G.INST.academyBoost);
    if (F.blood && F.blood.awake == null && X.stage(S) === 'teen' && S.tal && X.chance(G.INST.bloodWake * ypt)) wakeBlood(S, X);
  };
  { const k = G.SYSTEMS.findIndex(s => s.id === 'econ'); G.SYSTEMS.splice(k + 1, 0, { id: 'inst', when: S => !S.dead, run: (S, X) => G.instYear(S, X) }); }

  G.bloodText = S => { const b = S.flags && S.flags.blood; return b ? `Huyết mạch ${J.schools[b.school].nameVi.toLowerCase()}${b.awake != null ? ' (đã thức tỉnh)' : ' (chưa thức tỉnh)'}` : null; };
})(window.LifeSim);
// Chip huyết mạch cạnh căn cốt, thiên phú (bảng nhân vật).
(function (G) {
  const base = G.talChips;
  G.talChips = S => { const out = base(S), t = G.bloodText(S); if (t) out.push({ text: t, col: '#d0643c', title: `${t}. Thức tỉnh ở tuổi thiếu niên: căn cốt nhảy bậc, rèn trường phái này × ${String(G.INST.bloodGain).replace('.', ',')}${S.flags.blood.clan ? ', trưởng lão dòng họ dạy tới Tier 3' : ''}.` }); return out; };
})(window.LifeSim);
