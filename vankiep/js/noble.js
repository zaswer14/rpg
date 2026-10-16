/* Vạn Kiếp — QUÝ TỘC (docs/03 mục 5.9).
 * Năm bậc tước: Nam (1) → Tử (2) → Bá (3) → Hầu (4) → Công (5). Chỉ nước có chính thể ban tước (quân chủ, đế chế, triều đình Yêu Tinh,
 * tử quyền) mới phong. Có tước bằng ba đường, đều tự chọn:
 *   sinh ra trong nhà quý tộc (tầng lớp Quý tộc ở nước ban tước) và là người thừa kế: cha (hoặc mẹ) mất thì kế tước;
 *   công trạng với nước (đi lính, làm quan, làm trưởng khu, dọn hang, xuống di tích, lập làng, nâng khu, đánh thuê cho nước,
 *   hạ chúa vùng) đủ ngưỡng và đủ danh vọng thì được phong, mỗi lần lên một bậc;
 *   quyên góp vào quốc khố mua tước Nam, Tử.
 * Tước cho bổng lộc mỗi năm; từ Bá tước có thái ấp (một làng hoặc thị trấn trong nước, thu thuế ở đó); tầng lớp lên Quý tộc;
 * dễ ra làm quan. Mất tước khi nước mất, khi làm phản nước đó, hoặc tự từ bỏ. Sống ở nước khác thì không nhận bổng lộc.
 * Trạng thái: S.roles.noble = { k, rank, since, fief }, S.merit = { nước: điểm }, S.flags.house (nhà quý tộc lúc sinh);
 * W.dyn.nobles[k] = danh sách nhà quý tộc của nước (NPC + người chơi) để hiện ở bảng quốc gia; thái ấp ghi s.fief qua setField.
 */
window.LifeSim = window.LifeSim || {};
(function (G) {
  const Dn = () => G._dyn;
  G.NOBLE_VI = ['', 'Nam tước', 'Tử tước', 'Bá tước', 'Hầu tước', 'Công tước'];
  G.NOBLE_GOVS = ['monarchy', 'empire', 'court', 'necrocracy'];
  // Ngưỡng công trạng và danh vọng để được phong bậc r; bổng lộc mỗi lượt × trung vị.
  G.NOBLE = { merit: [0, 25, 45, 70, 100, 140], fame: [0, 20, 30, 40, 55, 75], stipend: [0, 1, 2, 3.5, 6, 10], buy: [0, 40, 100] };
  const roles = S => S.roles || (S.roles = { head: null, office: null, ruler: null, orgs: {}, adv: null });
  const flag = (S, k, v = 1) => { S.flags[k] = (S.flags[k] || 0) + v; };
  G.grantsTitles = k => { const n = k != null && k >= 0 ? G.realm.nations[k] : null; return !!n && n.alive !== false && G.NOBLE_GOVS.includes(n.gov); };
  G.addMerit = (S, k, v) => { if (k == null || k < 0) return; const M = S.merit || (S.merit = {}); M[k] = (M[k] || 0) + v; };
  // Nhà quý tộc NPC của một nước (dựng khi cần): 1 Công, 2 Hầu, 3 Bá, 4 Tử, 6 Nam.
  G.noblesOf = (W, k) => {
    const D = W.dyn, N = D.nobles || (D.nobles = {});
    if (!N[k] && G.grantsTitles(k)) {
      const n = G.realm.nations[k], X = G.tools(G.makeRng('nobles:' + W.seed + ':' + k)), race = n.race === 'construct' ? 'dwarf' : n.race;
      N[k] = [];
      [[5, 1], [4, 2], [3, 3], [2, 4], [1, 6]].forEach(([r, c]) => { for (let i = 0; i < c; i++) N[k].push({ rank: r, name: G.personName(race, X.chance(.5) ? 'm' : 'f', X.rnd), player: false }); });
    }
    return N[k] || [];
  };
  const reg = (W, k, S, rank) => { const L = G.noblesOf(W, k); const me = L.find(x => x.player && x.name === S.name); if (me) me.rank = rank; else L.push({ rank, name: S.name, player: true }); L.sort((a, b) => b.rank - a.rank); };
  const unreg = (W, k, S) => { const L = (W.dyn.nobles || {})[k]; if (L) { const i = L.findIndex(x => x.player && x.name === S.name); if (i >= 0) L.splice(i, 1); } };

  // ═════════ Hệ con "noble" (sau "org") ═════════
  G.nobleYear = function (S, X) {
    const W = S.world, R = G.bindWorld(W), D = W.dyn, r = roles(S), med = G.median(X.reg(S)), F = S.flags;
    // Xuất thân (G.birthOrigin lúc sinh); bản lưu cũ chưa có thì coi như thường dân.
    F.houseChecked = true;
    royalYear(S, X, W, R, D, r, med);
    if (S.dead) return;
    // Con thứ nhà quý tộc thành người thừa kế khi mọi anh chị đã mất.
    if (F.house && !F.house.heir && !F.house.done && !F.house.lost && S.family.sibs.length && S.family.sibs.every(s => !s.alive)) { F.house.heir = true; X.log(`Anh chị bạn đều đã mất. Tước ${G.NOBLE_VI[F.house.rank]} của nhà giờ sẽ về bạn.`, 'bad'); }
    // Kế tước khi người giữ tước (cha, không có cha thì mẹ) mất.
    if (F.house && F.house.heir && !r.noble && !F.house.done) {
      const holder = S.family.parents[1] || S.family.parents[0];
      if (holder && !holder.alive && X.stage(S) !== 'child' && X.stage(S) !== 'infant') {
        F.house.done = true;
        if (G.grantsTitles(F.house.k)) {
          r.noble = { k: F.house.k, rank: F.house.rank, since: W.year, fief: null }; flag(S, 'nobleInherit'); F.nobleMax = Math.max(F.nobleMax || 0, F.house.rank);
          reg(W, F.house.k, S, F.house.rank);
          X.log(`Bạn kế tước ${G.NOBLE_VI[F.house.rank]} của ${R.nations[F.house.k].name}.`, 'big');
          // Tước cần Tier tối thiểu (js/status.js G.TITLE_TIER): chưa đủ thì giữ tạm, có hạn G.TITLE_GRACE năm tính từ lúc trưởng thành.
          const need = G.TITLE_TIER ? G.TITLE_TIER[F.house.rank] : 0, T = G.tierOf(S);
          if (T < need) {
            const ypt = X.R(S).ypt, from = Math.max(S.age, X.R(S).adult / ypt);
            r.noble.due = { t: need, by: from + G.TITLE_GRACE / ypt }; flag(S, 'titleDue');
            X.log(`Theo lệ, ${G.NOBLE_VI[F.house.rank]} phải là ${G.tierName(need)}. Bạn còn ${G.TITLE_GRACE} năm${S.age < from ? ' kể từ lúc trưởng thành' : ''} để đạt tới, không thì bị giáng tước.`, 'bad');
          }
        } else X.log('Tước của nhà bạn không còn: nước ban tước đã mất hoặc đổi chính thể.', 'bad');
      }
    }
    // Công trạng với nước mình mỗi lượt (theo các bộ đếm và chức đang giữ).
    const k = S.nation;
    if (k != null && G.grantsTitles(k)) {
      const seen = S.meritSeen || (S.meritSeen = {}), d = key => { const v = F[key] || 0, o = seen[key] || 0; seen[key] = v; return v - o; };
      let m = 0;
      if (F.soldier > 0) m += 1;
      if (r.office && r.office.k === k) m += r.office.rank === 2 ? 3 : 1.5;
      if (r.head != null) { const h = G.SET[r.head]; m += h && G.TIER_RANK[h.tier] <= 2 ? 1 : .5; }
      m += d('lairs') * 2 + d('dgFloors') + d('foundVillage') * 4 + d('foundTown') * 8 + d('upTown') * 6 + d('upCity') * 12;
      if (F.lordSlayer && !seen.lord) { seen.lord = 1; m += 30; }
      if (m) G.addMerit(S, k, m);
    }
    // Bậc thăng tiến theo chính thể (G.PROMO): bổng lộc khi còn sống ở nước đó và nước chưa đổi chính thể.
    const rk = r.rank;
    if (rk && S.nation === rk.k && R.nations[rk.k] && R.nations[rk.k].gov === rk.gov && D.nat[rk.k].alive) { X.money(Math.round(med * .8 * rk.r)); if (rk.r >= 3) S.q = Math.max(S.q, 4); S.fame = Math.min(100, Math.max(S.fame, rk.r * 6)); }
    // Bổng lộc, thái ấp; mất tước khi nước mất hoặc đổi chính thể không ban tước.
    const nb = r.noble;
    if (nb) {
      const n = R.nations[nb.k];
      if (!D.nat[nb.k] || !D.nat[nb.k].alive || !G.grantsTitles(nb.k)) {
        X.log(`Tước ${G.NOBLE_VI[nb.rank]} của bạn mất nghĩa: ${n.name} ${D.nat[nb.k] && D.nat[nb.k].alive ? 'không còn ban tước' : 'đã mất'}.`, 'bad');
        dropFief(S, W); r.noble = null; flag(S, 'nobleLost'); return;
      }
      if (S.nation !== nb.k) { if (!F.nobleAbroad) { F.nobleAbroad = true; X.log(`Bạn sống ngoài ${n.name}; bổng lộc tước ${G.NOBLE_VI[nb.rank]} tạm dừng.`, 'info'); } return; }
      F.nobleAbroad = false;
      X.money(Math.round(med * G.NOBLE.stipend[nb.rank]));
      S.q = Math.max(S.q, nb.rank >= 3 ? 5 : 4);
      S.fame = Math.min(100, Math.max(S.fame, nb.rank * 8));
      if (nb.rank >= 3 && !nb.fief) giveFief(S, X, W);
      const f = nb.fief && G.SET[nb.fief];
      if (f && f.tier !== 'ruin' && f.nation === nb.k) X.money(Math.round(med * (f.urban / 600 + f.rural / 4000)));
      else if (nb.fief) { dropFief(S, W); if (nb.rank >= 3) giveFief(S, X, W); }
    }
  };
  { const k = G.SYSTEMS.findIndex(s => s.id === 'org'); G.SYSTEMS.splice(k + 1, 0, { id: 'noble', when: S => !S.dead, run: (S, X) => G.nobleYear(S, X) }); }
  // Thái ấp: làng hoặc thị trấn của nước chưa ai giữ, gần nhà; ghi s.fief (lưu qua setField).
  function giveFief(S, X, W) {
    const nb = roles(S).noble, D = W.dyn, h = G.SET[S.home.settlement];
    const cand = G.realm.settlements.filter(s => s.tier !== 'ruin' && s.nation === nb.k && (s.tier === 'village' || s.tier === 'town' || (nb.rank >= 4 && s.tier === 'city')) && !s.fief);
    if (!cand.length) return;
    const near = h ? cand.sort((a, b) => Math.hypot(a.x - h.x, a.y - h.y) - Math.hypot(b.x - h.x, b.y - h.y))[0] : X.pick(cand);
    Dn().setField(D, near, 'fief', { name: S.name, rank: nb.rank, player: true });
    nb.fief = near.id;
    X.log(`Bạn được ban thái ấp ${near.name}.`, 'good');
  }
  G.dropFief = S => dropFief(S, S.world);   // js/status.js giáng tước dưới Bá thì mất thái ấp
  function dropFief(S, W) {
    const nb = roles(S).noble; if (!nb || !nb.fief) return;
    const f = G.SET[nb.fief]; if (f && f.fief && f.fief.player) Dn().setField(W.dyn, f, 'fief', null);
    nb.fief = null;
  }

  // ═════════ Quyết định: phong tước, mua tước ═════════
  const DEC = G.DECISIONS;
  const nextRank = S => { const nb = roles(S).noble; return nb && nb.k === S.nation ? nb.rank + 1 : 1; };
  DEC.ennoble = {
    prio: 7, gap: 2,
    when(S, X) {
      const k = S.nation; if (!G.grantsTitles(k) || S.dead || !['adult', 'elder'].includes(X.stage(S))) return false;
      const nb = roles(S).noble; if (nb && nb.k !== k) return false;
      const r = nextRank(S); if (r > 5) return false;
      return ((S.merit || {})[k] || 0) >= G.NOBLE.merit[r] && S.fame >= G.NOBLE.fame[r] && G.tierOf(S) >= (G.TITLE_TIER ? G.TITLE_TIER[r] : 0) && !(S.flags.wanted && S.flags.wanted[k]);   // phong vì công trạng: đủ Tier của tước (js/status.js)
    },
    build(S, X) {
      const k = S.nation, n = G.realm.nations[k], r = nextRank(S), ru = S.world.dyn.nat[k].ruler;
      return { title: 'Sắc phong', body: `${ru ? ru.title + ' ' + ru.name : 'Triều đình'} ghi nhận công lao của bạn với ${n.name} (công trạng ${Math.round(S.merit[k])}).`,
        choices: [{ k: 'yes', label: `Nhận tước ${G.NOBLE_VI[r]}`, sub: `Bổng lộc ${G.NOBLE.stipend[r]} lần thu nhập trung bình mỗi năm${r >= 3 ? ', thái ấp' : ''}; tầng lớp Quý tộc.` }, { k: 'no', label: 'Từ chối', sub: 'Giữ mình là thường dân.' }] };
    },
    apply(S, X, k) {
      if (k !== 'yes') { S.flags.nobleRefused = (S.flags.nobleRefused || 0) + 1; S.merit[S.nation] -= 5; return null; }
      grant(S, X, S.nation, nextRank(S), 'merit');
      return `Bạn là ${G.NOBLE_VI[roles(S).noble.rank]} của ${G.realm.nations[S.nation].name}.`;
    },
    auto: (S) => S.flags.nobleRefused ? 'no' : (S.traits.social > .25 || S.traits.bold > .5 ? 'yes' : 'no')
  };
  DEC.buy_title = {
    prio: 3, gap: 4,
    when(S, X) {
      const k = S.nation; if (!G.grantsTitles(k) || !['adult', 'elder'].includes(X.stage(S))) return false;
      const nb = roles(S).noble; if (nb && nb.k !== k) return false;
      const r = nextRank(S); return r <= 2 && S.gold >= G.NOBLE.buy[r] * G.median(X.reg(S));
    },
    build(S, X) {
      const r = nextRank(S), cost = Math.round(G.NOBLE.buy[r] * G.median(X.reg(S))), n = G.realm.nations[S.nation];
      return { title: 'Quyên góp quốc khố', body: `Quan thu ngân của ${n.name} ngỏ ý: ai góp ${G.coin(cost)} vào quốc khố sẽ được phong ${G.NOBLE_VI[r]}.`,
        choices: [{ k: 'yes', label: `Góp ${G.coin(cost)}`, sub: `Thành ${G.NOBLE_VI[r]}. Quý tộc cũ sẽ gọi bạn là "tước mua".`, cost }, { k: 'no', label: 'Giữ tiền', sub: '' }] };
    },
    apply(S, X, k, c) {
      if (k !== 'yes') return null;
      X.money(-c.cost); grant(S, X, S.nation, nextRank(S), 'buy'); X.add('so', -3);
      return `Bạn là ${G.NOBLE_VI[roles(S).noble.rank]} của ${G.realm.nations[S.nation].name}.`;
    },
    auto: (S, X, d) => S.traits.social > .55 && S.gold > d.choices[0].cost * 1.6 ? 'yes' : 'no'
  };
  function grant(S, X, k, rank, how) {
    const r = roles(S), W = S.world;
    r.noble = { k, rank, since: W.year, fief: r.noble ? r.noble.fief : null };
    flag(S, how === 'buy' ? 'nobleBuy' : how === 'royal' ? 'nobleRoyal' : 'nobleMerit'); S.flags.nobleMax = Math.max(S.flags.nobleMax || 0, rank);
    reg(W, k, S, rank);
    S.q = Math.max(S.q, rank >= 3 ? 5 : 4);
    G.histAdd(W, 'noble', `${S.name} được phong ${G.NOBLE_VI[rank]} của ${G.realm.nations[k].name}${how === 'buy' ? ' (quyên góp quốc khố)' : ''}.`);
  }

  // ═════════ Làm phản nước ban tước thì mất tước (js/org.js rebel gọi) ═════════
  G.stripTitle = (S, k, why) => {
    const r = roles(S); if (!r.noble || r.noble.k !== k) return null;
    const t = G.NOBLE_VI[r.noble.rank]; dropFief(S, S.world); unreg(S.world, k, S); r.noble = null; flag(S, 'nobleLost');
    G.histAdd(S.world, 'noble', `${S.name} bị tước ${t} vì ${why}.`);
    return t;
  };
  // Tự từ bỏ tước (nút ở giao diện, qua G.leaveRole).
  G.renounceTitle = S => { const r = roles(S); if (!r.noble) return null; const t = G.NOBLE_VI[r.noble.rank], k = r.noble.k; dropFief(S, S.world); unreg(S.world, k, S); r.noble = null; return `Bạn trả lại tước ${t}.`; };
  // Kế tước khi chết: con trưởng thành nối tước, giữ thái ấp.
  G.nobleDeath = (S, X) => {
    const r = S.roles, nb = r && r.noble; if (!nb) return;
    const W = S.world, heir = (S.family.kids || []).find(k => k.alive && k.age >= X.R(S).adult);
    const L = (W.dyn.nobles || {})[nb.k], me = L && L.find(x => x.player && x.name === S.name);
    if (heir) {
      const nm = heir.name + ' ' + (S.name.split(' ').slice(1).join(' ') || '');
      if (me) { me.name = nm.trim(); me.player = false; }
      const f = nb.fief && G.SET[nb.fief]; if (f && f.fief) Dn().setField(W.dyn, f, 'fief', { name: nm.trim(), rank: nb.rank, player: false });
      G.histAdd(W, 'noble', `${G.NOBLE_VI[nb.rank]} ${S.name} qua đời; con là ${nm.trim()} kế tước.`);
    } else { if (me) L.splice(L.indexOf(me), 1); dropFief(S, W); G.histAdd(W, 'noble', `${G.NOBLE_VI[nb.rank]} ${S.name} qua đời không người nối dõi; tước về triều đình.`); }
  };
  G.nobleText = S => { const nb = S.roles && S.roles.noble; return nb ? `${G.NOBLE_VI[nb.rank]} của ${G.realm.nations[nb.k].name}${nb.fief && G.SET[nb.fief] ? ' · thái ấp ' + G.SET[nb.fief].name : ''}${S.nation !== nb.k ? ' (đang ở nước khác)' : ''}` : null; };

  // ═════════ Xuất thân: hoàng gia (dòng chính, dòng phụ), quý tộc (con trưởng thừa kế tước, con thứ thì không) ═════════
  // Trả về dòng nhật ký (life.js ghi sau lời mở đầu). Tự nhiên: sinh ở kinh đô nước cha truyền con nối (G.DYNASTIC), cùng chủng tộc với vua: 15% hoàng gia (45% dòng chính); thành phố 3% dòng phụ.
  // Ở nước ban tước: kinh đô 7%, thành phố 6%, thị trấn 4%, làng 1,2% là nhà quý tộc. Có thể chọn xuất thân ở nút Kiếp mới.
  G.ORIGIN_VI = { royal_main: 'Hoàng gia, dòng chính', royal_side: 'Hoàng gia, dòng phụ', noble: 'Quý tộc' };
  G.DYNASTIC = ['monarchy', 'empire', 'court', 'tribal', 'horde'];   // chính thể cha truyền con nối: có hoàng tộc
  const hasRuler = (D, k) => { const n = G.realm.nations[k], d = D.nat[k]; return n && d && d.alive && G.DYNASTIC.includes(n.gov) && d.ruler && !d.ruler.player && !G.RACES[n.race].undead && !G.RACES[n.race].construct; };
  // Nơi sinh khi người chơi chọn xuất thân: kinh đô của một nước có vua (hoàng gia), khu dân cư lớn của nước ban tước (quý tộc).
  G.originSpot = function (origin, X) {
    const R = G.realm, D = R._W && R._W.dyn; if (!D) return null;
    const ks = R.nations.map(n => n.idx).filter(k => origin === 'noble' ? G.grantsTitles(k) && !G.RACES[R.nations[k].race].undead : hasRuler(D, k));
    if (!ks.length) return null;
    const k = X.pick(ks), n = R.nations[k];
    if (origin !== 'noble') { const cap = R.byId[D.nat[k].cap]; return cap && cap.tier !== 'ruin' ? { settlement: cap.id, race: n.race } : null; }
    const s = X.wpick(R.settlements.filter(s => s.tier !== 'ruin' && s.nation === k && G.TIER_RANK[s.tier] <= 2), s => s.urban);
    return s ? { settlement: s.id, race: n.race } : null;
  };
  G.birthOrigin = function (X, st, want) {
    const S = X.S, D = S.world.dyn, R = G.realm, F = S.flags, k = st.nation;
    F.houseChecked = true;
    if (S.undead || G.RACES[S.race].construct || k == null || k < 0) return null;
    const n = R.nations[k], d = D.nat[k], ruler = hasRuler(D, k) ? d.ruler : null;
    let kind = want && G.ORIGIN_VI[want] ? want : null;
    if (kind && kind.startsWith('royal') && (!ruler || S.race !== n.race)) kind = null;
    if (kind === 'noble' && !G.grantsTitles(k)) kind = null;
    if (!want) {
      if (ruler && S.race === n.race) { const p = st.id === d.cap ? .15 : st.tier === 'city' ? .03 : 0; if (X.chance(p)) kind = st.id === d.cap && X.chance(.45) ? 'royal_main' : 'royal_side'; }
      if (!kind && G.grantsTitles(k)) { const p = { capital: .07, city: .06, town: .04, village: .012 }[st.tier] || 0; if (X.chance(p)) kind = 'noble'; }
    }
    if (kind && F.orphan) { if (!want) return null; F.orphan = false; S.family.parents.forEach(p => { p.alive = true; }); }   // trẻ mồ côi không có họ, trừ khi chọn xuất thân
    if (!kind) return null;
    S.q = 5; S.pct = Math.max(S.pct, .9 + X.rnd() * .08); S.hl = Math.min(98, S.hl + 4);
    const older = S.family.sibs.length;
    if (kind !== 'noble') {
      const main = kind === 'royal_main', P = S.family.parents;
      if (main) {   // vua là cha hoặc mẹ
        const i = ruler.sex === 'f' ? 0 : 1;
        if (!P[i]) P[i] = { role: i ? 'cha' : 'mẹ', name: ruler.name, age: ruler.age, alive: true };
        else Object.assign(P[i], { name: ruler.name, age: ruler.age, alive: true });
      }
      F.royal = { k, line: main ? 'main' : 'side', pos: main ? older + 1 : X.int(4, 9) + older, ruler: ruler.name, since: S.world.year };
      flag(S, main ? 'royalMain' : 'royalSide');
      return main ? `Bạn là con của ${ruler.title} ${ruler.name}, hoàng tộc ${n.name}. ${F.royal.pos === 1 ? 'Bạn là người kế vị.' : `Bạn đứng thứ ${F.royal.pos} trong hàng kế vị.`}`
        : `Bạn thuộc dòng phụ của hoàng tộc ${n.name}: cha mẹ bạn là họ hàng của ${ruler.title} ${ruler.name}. Ngai vàng còn xa (thứ ${F.royal.pos}), nhưng cái họ mở mọi cánh cửa.`;
    } else {
      const rank = +X.wkey({ 1: 4, 2: 3, 3: 2, 4: 1 }), heir = older === 0;
      F.house = { k, rank, heir };
      flag(S, 'nobleBorn'); if (heir) flag(S, 'nobleHeirBorn');
      return `Nhà bạn là một nhà ${G.NOBLE_VI[rank]} của ${n.name}. ${heir ? 'Bạn là con trưởng: tước sẽ về bạn.' : `Bạn là con thứ ${older + 1}; tước về anh chị cả. Bạn có họ, có tiền đi học, nhưng phải tự lập thân.`}`;
    }
  };
  // Mỗi lượt: hoàng tộc nhận trợ cấp, người trước mình trong hàng kế vị có thể mất, vua cha mất thì kế vị, nước mất thì lưu vong;
  // trưởng thành ở nước ban tước mà không lên ngôi thì được phong Công tước (dòng chính) hoặc Hầu tước (dòng phụ).
  function royalYear(S, X, W, R, D, r, med) {
    const RY = S.flags.royal; if (!RY) return;
    const d = D.nat[RY.k], n = R.nations[RY.k];
    if (!d || !d.alive) { if (!RY.exile) { RY.exile = true; flag(S, 'royalExile'); X.log(`${n.name} mất nước. Hoàng tộc lưu vong; cái họ của bạn giờ là gánh nặng.`, 'bad'); } return; }
    if (RY.exile) return;
    // Vua cha (dòng chính) mất trong nhà trước khi triều kịp báo: kế vị ngay.
    if (RY.line === 'main' && d.ruler && !d.ruler.player && d.ruler.name === RY.ruler) {
      const p = S.family.parents.find(x => x.name === RY.ruler);
      if (p && !p.alive) {
        const old = d.ruler, nr = G.royalSucceed(W, RY.k, X, S, false) || Dn().makeRuler(n, X);
        d.ruler = nr; n.ruler = nr; d.stab = Math.max(0, d.stab - .06);
        Dn().hist(D, W.year, 'king', `${old.title} ${old.name} của ${n.name} băng hà. ${nr ? nr.name + ' lên ngôi.' : ''}`);
      }
    }
    if (d.ruler && !d.ruler.player && d.ruler.name !== RY.ruler) RY.ruler = d.ruler.name;
    if (RY.line === 'main' && RY.pos > 1 && r.ruler !== RY.k && X.chance(.012 * (RY.pos - 1))) { RY.pos--; X.log(`Một người anh chị của bạn mất; bạn lên thứ ${RY.pos} trong hàng kế vị.`, 'bad'); }
    if (S.nation === RY.k && r.ruler !== RY.k) X.money(Math.round(med * (RY.line === 'main' ? 4 : 2)));
    if (!RY.titled && G.grantsTitles(RY.k) && X.stage(S) === 'adult' && r.ruler !== RY.k && !r.noble) { RY.titled = true; grant(S, X, RY.k, RY.line === 'main' ? 5 : 4, 'royal'); }
  }
  // Khi người cai trị NPC của nước k băng hà (dynamic.js polityYear, hoặc vua cha mất trong nhà): người kế vị số 1 dòng chính là người chơi
  // thì lên ngôi (còn nhỏ thì có nhiếp chính); không thì hàng kế vị dịch lên một bậc. Trả về bản ghi người cai trị hoặc null.
  G.royalSucceed = function (W, k, X, S, fight) {
    if (!S || S.dead || !S.flags || !S.flags.royal || !X.stage) return null;
    const RY = S.flags.royal; if (RY.k !== k || RY.exile) return null;
    if (fight) W.dyn.nat[k].crisis = W.year;
    if (RY.line !== 'main') return null;
    const P = S.family.parents.find(x => x.name === RY.ruler); if (P) P.alive = false;
    // Anh chị cả lên ngôi: mình thành em vua, con của vua mới đứng trước mình trong hàng kế vị.
    if (RY.pos > 1) { const kids = X.int(0, 3); RY.pos = RY.pos - 1 + kids; X.log(`${RY.ruler} băng hà. Anh chị cả của bạn lên ngôi${kids ? '; con của vua mới đứng trước bạn trong hàng kế vị' : ''} (bạn thứ ${RY.pos}).`, 'big'); return null; }
    const n = G.realm.nations[k], t = G.NAMES.nation.ruler[n.gov] || ['Thủ Lĩnh'], young = ['infant', 'child', 'teen'].includes(X.stage(S));
    if (roles(S).noble && roles(S).noble.k === k) G.renounceTitle(S);
    roles(S).ruler = k; RY.crowned = W.year; S.nation = k; flag(S, 'royalCrown');
    X.log(`${RY.ruler} băng hà. Bạn lên ngôi ${n.name}${young ? '; một hội đồng nhiếp chính cầm quyền tới khi bạn trưởng thành' : ''}.`, 'big');
    return { title: t.length > 1 && S.sex === 'f' ? t[1] : t[0], name: S.name, sex: S.sex, age: X.years(S), player: true };
  };
  // ── Tranh ngôi: hoàng tộc chưa phải người kế vị số 1, lúc triều rối (vừa tranh ngôi, hoặc ổn định < .35)
  G.claimChance = S => { const RY = S.flags.royal, d = S.world.dyn.nat[RY.k]; return G.clamp(.1 + S.fame / 300 + (RY.line === 'main' ? .15 : 0) + (.4 - d.stab) * .8 + (d.crisis != null && S.world.year - d.crisis <= 2 ? .1 : 0) - RY.pos * .01, .05, .7); };
  DEC.claim_throne = {
    prio: 8, gap: 4,
    when(S, X) {
      const RY = S.flags.royal; if (!RY || RY.exile || S.dead || X.stage(S) !== 'adult' || roles(S).ruler != null || S.nation !== RY.k) return false;
      const d = S.world.dyn.nat[RY.k];
      return d && d.alive && d.ruler && !d.ruler.player && S.fame >= 25 && ((d.crisis != null && S.world.year - d.crisis <= 2) || d.stab < .35) && !(S.flags.wanted && S.flags.wanted[RY.k]);
    },
    build(S, X) {
      const RY = S.flags.royal, d = S.world.dyn.nat[RY.k], n = G.realm.nations[RY.k];
      return { title: 'Tranh ngôi', body: `Triều ${n.name} đang rối (ổn định ${Math.round(d.stab * 100)}). Một phe quần thần muốn đưa bạn lên thay ${d.ruler.title} ${d.ruler.name}. Ước chừng ${Math.round(G.claimChance(S) * 100)}% thành công.`,
        choices: [{ k: 'go', label: 'Giành ngôi', sub: 'Thua thì mất đầu hoặc phải trốn chạy.' }, { k: 'no', label: 'Đứng ngoài', sub: '' }] };
    },
    apply(S, X, k) {
      if (k !== 'go') return null;
      const W = S.world, D = W.dyn, RY = S.flags.royal, d = D.nat[RY.k], n = G.realm.nations[RY.k], old = d.ruler;
      if (!X.chance(G.claimChance(S))) {
        flag(S, 'claimFail'); Dn().hist(D, W.year, 'riot', `${S.name} mưu giành ngôi ${n.name}, thất bại.`);
        if (X.chance(.5)) { X.die({ id: 'hanged', text: `bị ${old.title} ${old.name} xử tử vì mưu đoạt ngôi` }); return null; }
        RY.exile = true; (S.flags.wanted = S.flags.wanted || {})[RY.k] = true;
        return 'Phe bạn tan rã. Bạn trốn khỏi kinh thành, tên bị xóa khỏi gia phả.';
      }
      const t = G.NAMES.nation.ruler[n.gov] || ['Thủ Lĩnh'], nr = { title: t.length > 1 && S.sex === 'f' ? t[1] : t[0], name: S.name, sex: S.sex, age: X.years(S), player: true };
      d.ruler = nr; n.ruler = nr; d.stab = Math.max(0, d.stab - .12); roles(S).ruler = RY.k; flag(S, 'claimWin');
      if (roles(S).noble && roles(S).noble.k === RY.k) G.renounceTitle(S);
      Dn().hist(D, W.year, 'king', `${S.name} giành ngôi ${n.name} từ tay ${old.title} ${old.name}.`);
      return `Bạn ngồi lên ngai ${n.name}. ${old.name} bị giam ở tháp phía bắc.`;
    },
    auto: (S) => S.traits.bold > .75 && G.claimChance(S) > .4 ? 'go' : 'no'
  };

  // ═════════ Thăng tiến theo chính thể (G.GOVS[gov].promo) ═════════
  // Nước ban tước dùng tước quý tộc ở trên. Chính thể khác có thang bậc riêng; đủ chỉ số thì được mời lên một bậc (nhận hay không).
  // Bộ lạc, hãn quốc và Ngai thách đấu (mẫu B5): đủ danh vọng thì có thể thách đấu người cai trị giành ngôi.
  const sameFaith = (S, n) => S.faith && n.faith && S.faith === n.faith;
  G.PROMO = {
    theocracy:   { names: ['Tu sĩ', 'Linh mục', 'Giám mục', 'Hồng y'],                         val: (S, n) => sameFaith(S, n) ? S.devotion : -1,              thr: [30, 55, 75, 92], unit: 'Devotion' },
    order:       { names: ['Tập sinh', 'Hiệp sĩ dòng', 'Bề trên', 'Đại sư dòng'],              val: (S, n) => sameFaith(S, n) || !n.faith ? S.devotion * .5 + S.fame * .7 : -1, thr: [25, 40, 60, 80], unit: 'Devotion và danh vọng' },
    council:     { names: ['Thư ký hội đồng', 'Nghị viên', 'Trưởng ban', 'Chủ tịch hội đồng'],   val: S => S.sm + S.fame * .5,                                  thr: [60, 80, 100, 120], unit: 'Hiểu biết và danh vọng' },
    merchant:    { names: ['Hội viên thương hội', 'Nghị viên', 'Đại thương gia', 'Chủ tịch thương hội'], val: (S, n, X) => S.gold / G.median(X.reg(S)),     thr: [30, 80, 200, 500], unit: 'tài sản (× thu nhập trung bình)' },
    confederacy: { names: ['Trưởng nhóm', 'Thủ lĩnh nhóm', 'Thủ lĩnh liên minh'],               val: S => S.fame,                                              thr: [25, 45, 70], unit: 'danh vọng' },
    magocracy:   { names: ['Pháp sư tập sự', 'Pháp sư', 'Đại pháp sư', 'Tháp chủ'],             val: S => Math.max(...J.schools.arcane.masteries.map(m => S.mastery[m] || 0)), thr: [20, 40, 60, 80], unit: 'kỹ năng Huyền thuật' },
    military:    { names: ['Đội trưởng', 'Đô úy', 'Tướng quân', 'Nguyên soái'],                val: (S, n) => (S.merit || {})[n.idx] || 0,                     thr: [10, 30, 60, 100], unit: 'công trạng' },
    tribal:      { names: ['Chiến binh', 'Đầu lĩnh', 'Phó thủ lĩnh'],                           val: S => S.fame + S.level * .5,                                thr: [25, 45, 65], unit: 'danh vọng và cấp' },
    horde:       { names: ['Kỵ sĩ', 'Bách phu trưởng', 'Vạn phu trưởng'],                      val: S => S.fame + S.level * .5,                                thr: [25, 45, 65], unit: 'danh vọng và cấp' }
  };
  const J = window.JobLibrary;
  // Giá trị xét nhân theo Tier (js/status.js G.PROMO_TW: pháp quyền rất cao, quân quản, bộ lạc, hãn quốc cao; thương nhân thấp).
  G.promoVal = (S, o, X) => { const v = o.P.val(S, o.n, X); return v > 0 && G.PROMO_TW ? v * (1 + (G.PROMO_TW[o.n.gov] || 0) * G.tierOf(S)) : v; };
  const promoOf = S => { const k = S.nation; if (k == null || k < 0) return null; const n = G.realm.nations[k]; return n && n.alive !== false && G.PROMO[n.gov] ? { k, n, P: G.PROMO[n.gov] } : null; };
  DEC.gov_rank = {   // (không đặt tên "promote": tên đó là quyết định lên bậc nghề ở js/events.js)
    prio: 6, gap: 2,
    when(S, X) {
      if (S.dead || !['adult', 'elder'].includes(X.stage(S))) return false;
      const o = promoOf(S); if (!o) return false;
      const rk = roles(S).rank, cur = rk && rk.k === o.k && rk.gov === o.n.gov ? rk.r : 0;
      return cur < o.P.names.length && G.promoVal(S, o, X) >= o.P.thr[cur] && S.fame >= [0, 15, 30, 50][cur] && !(S.flags.wanted && S.flags.wanted[o.k]) && !(S.flags.promoNo >= 2);
    },
    build(S, X) {
      const o = promoOf(S), rk = roles(S).rank, cur = rk && rk.k === o.k && rk.gov === o.n.gov ? rk.r : 0, nm = o.P.names[cur];
      return { title: G.GOVS[o.n.gov].nameVi, body: `${o.n.name} mời bạn lên bậc ${nm} (${G.GOVS[o.n.gov].promo.toLowerCase()}; xét theo ${o.P.unit}${G.PROMO_TW && G.PROMO_TW[o.n.gov] && G.tierOf(S) ? `, nhân ${String(+(1 + G.PROMO_TW[o.n.gov] * G.tierOf(S)).toFixed(2)).replace('.', ',')} vì bạn là ${G.tierName(G.tierOf(S))}` : ''}).`,
        choices: [{ k: 'yes', label: `Nhận bậc ${nm}`, sub: `Bổng lộc, danh vọng; bậc ${cur + 1}/${o.P.names.length}.` }, { k: 'no', label: 'Không nhận', sub: '' }] };
    },
    apply(S, X, k) {
      if (k !== 'yes') { flag(S, 'promoNo'); return null; }
      const o = promoOf(S), rk = roles(S).rank, cur = rk && rk.k === o.k && rk.gov === o.n.gov ? rk.r : 0;
      roles(S).rank = { k: o.k, gov: o.n.gov, r: cur + 1, since: S.world.year };
      flag(S, 'promo'); S.flags.promoMax = Math.max(S.flags.promoMax || 0, cur + 1);
      if (cur + 1 === o.P.names.length) G.histAdd(S.world, 'office', `${S.name} lên ${o.P.names[cur]} của ${o.n.name}.`);
      return `Bạn là ${o.P.names[cur]} của ${o.n.name}.`;
    },
    auto: (S) => S.traits.social > .35 || S.traits.bold > .6 ? 'yes' : 'no'
  };
  G.rankText = S => { const rk = S.roles && S.roles.rank; if (!rk) return null; const P = G.PROMO[rk.gov], n = G.realm.nations[rk.k]; return P && n ? `${P.names[rk.r - 1]} của ${n.name}${S.nation !== rk.k || n.gov !== rk.gov ? ' (không còn hiệu lực)' : ''}` : null; };
  // Thách đấu giành ngôi: bộ lạc, hãn quốc, mẫu B5 (Ngai thách đấu). Đe dọa của nhà vua = 2,2 + quân × .6.
  const duelNation = S => { const k = S.nation; if (k == null || k < 0) return null; const n = G.realm.nations[k], d = S.world.dyn.nat[k]; return n && d && d.alive && d.ruler && !d.ruler.player && (['tribal', 'horde'].includes(n.gov) || n.template === 'B5') ? { k, n, d } : null; };
  G.duelThreat = n => 2.2 + n.army * .6;
  DEC.duel_throne = {
    prio: 7, gap: 5,
    when(S, X) { const o = duelNation(S); return !!o && X.stage(S) === 'adult' && roles(S).ruler == null && S.fame >= 45 && ((roles(S).rank && roles(S).rank.r >= 2) || S.fame >= 65); },
    build(S, X) {
      const o = duelNation(S), thr = G.duelThreat(o.n), pw = X.power(S);
      return { title: 'Thách đấu', body: `Luật của ${o.n.name}: ai thắng ${o.d.ruler.title} ${o.d.ruler.name} trong quyết đấu thì làm ${o.d.ruler.title.toLowerCase()}. Đe dọa ~${thr.toFixed(1)} Tier, sức bạn ${pw.toFixed(1)}.`,
        choices: [{ k: 'go', label: 'Thách đấu', sub: 'Thắng thì lên ngôi; thua thì có thể chết.' }, { k: 'no', label: 'Chưa phải lúc', sub: '' }] };
    },
    apply(S, X, k) {
      if (k !== 'go') return null;
      const o = duelNation(S), W = S.world, D = W.dyn, old = o.d.ruler, pWin = 1 / (1 + Math.exp(-3.2 * (X.power(S) - G.duelThreat(o.n))));
      flag(S, 'duel');
      if (!X.chance(pWin)) {
        X.add('hl', -X.int(15, 35));
        if (X.chance(.4)) { X.die({ id: 'war', text: `chết trong quyết đấu với ${old.title} ${old.name}` }); return null; }
        S.fame = Math.max(0, S.fame - 8); return `${old.name} hạ bạn trước toàn bộ tộc. Bạn sống, nhưng không ai còn nhắc tên bạn cho ngai.`;
      }
      const t = G.NAMES.nation.ruler[o.n.gov] || ['Thủ Lĩnh'], nr = { title: t.length > 1 && S.sex === 'f' ? t[1] : t[0], name: S.name, sex: S.sex, age: X.years(S), player: true };
      o.d.ruler = nr; o.n.ruler = nr; o.d.stab = Math.max(0, o.d.stab - .05); roles(S).ruler = o.k; flag(S, 'duelWin');
      S.fame = Math.min(100, S.fame + 10);
      Dn().hist(D, W.year, 'king', `${S.name} thắng ${old.title} ${old.name} trong quyết đấu, lên làm ${nr.title.toLowerCase()} ${o.n.name}.`);
      return `Bạn đứng trên xác ${old.name}. Cả tộc cúi đầu.`;
    },
    auto: (S, X) => { const o = duelNation(S); return S.traits.bold > .6 && X.power(S) >= G.duelThreat(o.n) + .2 ? 'go' : 'no'; }
  };
  G.royalText = S => { const RY = S.flags && S.flags.royal; if (!RY) return null; const n = G.realm.nations[RY.k]; return `Hoàng tộc ${n.name}, ${RY.line === 'main' ? 'dòng chính' : 'dòng phụ'}${RY.exile ? ' (lưu vong)' : S.roles && S.roles.ruler === RY.k ? '' : `, thứ ${RY.pos} trong hàng kế vị`}`; };
  G.houseText = S => { const H = S.flags && S.flags.house; if (!H || (S.roles && S.roles.noble)) return null; return `Con ${H.heir ? 'trưởng' : 'thứ'} nhà ${G.NOBLE_VI[H.rank]}${H.heir && !H.done ? ' (sẽ kế tước)' : ''}`; };
})(window.LifeSim);
