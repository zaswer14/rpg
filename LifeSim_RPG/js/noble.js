/* Vạn Kiếp — QUÝ TỘC (research/03 mục 5.9).
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
    // Lúc sinh: con nhà quý tộc ở nước ban tước (tầng lớp Quý tộc), một nửa là người thừa kế.
    if (!F.houseChecked) {
      F.houseChecked = true;
      const k = S.nation;
      if (S.q === 5 && !S.undead && G.grantsTitles(k) && S.family.parents.length && X.chance(.6)) {
        F.house = { k, rank: +X.wkey({ 1: 4, 2: 3, 3: 2, 4: 1 }), heir: X.chance(.5) };
        flag(S, 'nobleBorn');
        X.log(`Nhà bạn là một nhà ${G.NOBLE_VI[F.house.rank]} của ${R.nations[k].name}${F.house.heir ? '. Bạn là người thừa kế' : ''}.`, 'big');
      }
    }
    // Kế tước khi người giữ tước (cha, không có cha thì mẹ) mất.
    if (F.house && F.house.heir && !r.noble && !F.house.done) {
      const holder = S.family.parents[1] || S.family.parents[0];
      if (holder && !holder.alive && X.stage(S) !== 'child' && X.stage(S) !== 'infant') {
        F.house.done = true;
        if (G.grantsTitles(F.house.k)) {
          r.noble = { k: F.house.k, rank: F.house.rank, since: W.year, fief: null }; flag(S, 'nobleInherit'); F.nobleMax = Math.max(F.nobleMax || 0, F.house.rank);
          reg(W, F.house.k, S, F.house.rank);
          X.log(`Bạn kế tước ${G.NOBLE_VI[F.house.rank]} của ${R.nations[F.house.k].name}.`, 'big');
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
      return ((S.merit || {})[k] || 0) >= G.NOBLE.merit[r] && S.fame >= G.NOBLE.fame[r] && !(S.flags.wanted && S.flags.wanted[k]);
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
      return { title: 'Quyên góp quốc khố', body: `Quan thu ngân của ${n.name} ngỏ ý: ai góp ${cost} bạc vào quốc khố sẽ được phong ${G.NOBLE_VI[r]}.`,
        choices: [{ k: 'yes', label: `Góp ${cost} bạc`, sub: `Thành ${G.NOBLE_VI[r]}. Quý tộc cũ sẽ gọi bạn là "tước mua".`, cost }, { k: 'no', label: 'Giữ tiền', sub: '' }] };
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
    flag(S, how === 'buy' ? 'nobleBuy' : 'nobleMerit'); S.flags.nobleMax = Math.max(S.flags.nobleMax || 0, rank);
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
})(window.LifeSim);
