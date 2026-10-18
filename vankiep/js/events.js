/* Vạn Kiếp — SỰ KIỆN và QUYẾT ĐỊNH.
 * Sự kiện = dữ liệu + điều kiện + trọng số + hàm run (mẫu 1in8b):
 *   { id, st:[giai đoạn], c?(S,X), w: số|hàm, rep?, gap?, undead?: true (chỉ Bộ Xương) | 'any' (cả hai), run(S,X) → {t, k, f}|null }
 *   k: 'good' | 'bad' | 'big' | 'info'.  f: dòng "sổ tay" (lore, luật họ quái từ thư viện).
 *   Chọn: lọc giai đoạn/điều kiện/khoảng lặp, bốc theo trọng số; sự kiện lặp được mà đã xảy ra thì ×0,5.
 * Quyết định = build + apply, KHÔNG bốc ngẫu nhiên: scheduledDecisions() sinh từ trạng thái (when) và cờ hàng đợi.
 *   { prio, gap, when(S,X), build(S,X) → {title, body, fact?, choices:[{k,label,sub}]}, apply(S,X,k) → text, auto(S,X,d) → k }
 */
window.LifeSim = window.LifeSim || {};
(function (G) {
  const J = window.JobLibrary;
  // Khu dân cư đang ở (js/realm.js). Thị trấn trở lên mà sống trong khu (không phải vùng quê) thì có nghề phố.
  const homeS = (S) => (G.SET && S.home.settlement && G.SET[S.home.settlement]) || null;
  const home = (S, X) => { const s = homeS(S); return s ? s.name : X.reg(S).nameVi; };
  const town = (S) => { const s = homeS(S); return !!s && G.TIER_RANK[s.tier] <= 2 && S.urban !== false; };
  const kind = (S) => { const s = homeS(S); return s ? s.tier : null; };
  const flesh = (S) => !S.undead && !G.RACES[S.race].construct;
  const bestCombat = S => Math.max(...['Sword', 'Axe', 'Spear', 'Shield', 'Unarmed', 'Dagger', 'Bow', 'Body'].map(m => S.mastery[m] || 0));

  // ═════════════════════════ QUYẾT ĐỊNH ═════════════════════════
  G.DECISIONS = {
    path: {
      prio: 9, gap: 99,
      when: (S, X) => !S.undead && !S.path && ['child', 'teen'].includes(X.stage(S)) && X.years(S) >= G.RACES[S.race].adult * .45,
      build(S, X) {
        const rs = J.races[S.race].schools, opts = [...rs.native];
        if (rs.foreign.length) opts.push(rs.foreign[Math.floor(X.rnd() * rs.foreign.length)]);
        return { title: 'Đứa trẻ mê điều gì?', body: `Bạn ${X.years(S)} tuổi, đã đủ lớn để người lớn hỏi một câu nửa đùa nửa thật: lớn lên định theo con đường nào? Bạn chưa đáp. Nhưng mắt bạn đã có một chỗ hay dừng lại lâu hơn mọi chỗ khác.`,
          fact: J.races[S.race].leaning ? `${J.races[S.race].nameVi}: ${J.races[S.race].leaning.note}` : null,
          choices: opts.map(sc => ({ k: sc, label: J.schools[sc].nameVi, sub: J.schools[sc].masteries.map(G.mv).join(' · ') + (rs.foreign.includes(sc) ? ' — ngoại lai: học chậm, gate +15' : '') })) };
      },
      apply(S, X, k) { S.path = k; X.gain(J.schools[k].masteries[0], 6); return `Từ hôm ấy bạn bắt đầu tập ${G.mv(J.schools[k].masteries[0]).toLowerCase()}. Mấy tháng đầu chẳng ra đâu vào đâu, người lớn đi ngang chỉ cười. Bạn vẫn tập, sáng sớm khi sương chưa tan và chiều muộn khi lũ bạn đã về ăn cơm. Đêm nằm, bạn còn nhẩm lại từng điều đã học cho tới khi ngủ thiếp đi.`; },
      auto(S, X, d) {
        // Thiên phú rèn mạnh một trường phái, hoặc chí hướng đã chọn (js/talent.js), thì theo trường phái đó.
        const ts = G.aimSchool(S, d.choices.map(c => c.k)); if (ts) return ts;
        const T = S.traits, pref = T.studious > T.bold ? ['arcane', 'craft', 'death', 'shadow'] : ['combat', 'martial', 'ranged', 'beast', 'shadow'];
        return (d.choices.find(c => pref.includes(c.k)) || d.choices[0]).k;
      }
    },
    work: {
      prio: 8, gap: 1,
      when: (S, X) => !S.undead && !S.work && S.flags.workQ && ['adult', 'elder'].includes(X.stage(S)),
      build(S, X) {
        // Nghề làm được tùy công trình, vai trò của khu đang ở và luật của nước (js/state.js G.workOK); phường hội thu phí vào nghề.
        const reg = X.reg(S), ok = Object.entries(G.WORKS).filter(([id]) => G.workOK(S, id) && (!G.workFee(S, id) || S.gold >= G.workFee(S, id)));
        // Ba nghề ngẫu nhiên; người ở vùng quê, làng, thôn luôn có ít nhất một nghề đất (nghề của nhà mình).
        const LAND = ['farmer', 'herder', 'fisher', 'woodcutter', 'miner'], rural = !S.urban || ['village', 'hamlet'].includes((G.here(S).s || {}).tier);
        const shuffled = ok.filter(([id]) => id !== 'adventurer').sort(() => X.rnd() - .5);
        const land = rural ? shuffled.find(([id]) => LAND.includes(id)) : null;
        // Nghề hợp chí hướng, nghề đã định khi rời nhà (js/talent.js G.aimWorks) luôn có mặt nếu làm được ở đây.
        const want = G.aimWorks(S).filter(id => id !== 'adventurer' && (!land || id !== land[0])).map(id => shuffled.find(e => e[0] === id)).filter(Boolean).slice(0, 2);
        // Ở kinh đô, thành phố của nước ban tước, thái ấp: nhà quyền quý luôn cần người (nghề vòng 4, js/econ.js).
        const lux = !rural && G.demandOf && G.demandOf(S, 'noble') >= .8 ? shuffled.find(([id]) => G.WORKS[id].ring === 4 && !want.some(e => e[0] === id)) : null;
        const pick = [...(land ? [land] : []), ...(lux ? [lux] : []), ...want, ...shuffled.filter(e => e !== land && e !== lux && !want.includes(e))].slice(0, 3);
        pick.push(['adventurer', G.WORKS.adventurer]);
        return { title: 'Kiếm sống bằng gì?', body: `Bạn đã trưởng thành ở ${home(S, X)}, tới lúc phải tự lo lấy miếng ăn. Mấy đêm liền bạn nằm nghĩ, mỗi đêm nghiêng về một nghề. Thu nhập tính theo phân vị trong vùng (${reg.nameVi}, trung vị ${G.coin(Math.round(G.median(reg)))}/năm).`,
          choices: pick.map(([id, w]) => { const m = G.incomeMult({ ...S, work: id }), fee = G.workFee(S, id);
            return { k: id, label: w.nameVi, sub: w.adventurer ? 'Sống bằng săn quái; thu nhập theo danh vọng; nguy hiểm.' : `Thu nhập ${Math.round(G.incomeAt(reg, w.pct[0]) * m)}–${G.coin(Math.round(G.incomeAt(reg, w.pct[1]) * m))}/năm sau thuế` + (w.risk > 1.4 ? ' · nguy hiểm' : '') + (fee ? ` · phí phường hội ${G.coin(fee)}` : '') }; }) };
      },
      apply(S, X, k) { const fee = G.workFee(S, k); if (fee) X.money(-fee); S.work = k; S.flags.workQ = false; const w = G.WORKS[k]; if (!w.adventurer) S.pct = Math.max(S.pct * .6, w.pct[0]); return w.adventurer ? 'Bạn ghi tên vào Hội Mạo Hiểm. Gian sảnh nồng mùi da thuộc và rượu cũ, trên tường dán kín những tờ lệnh săn đã ngả vàng. Ra tới cửa, bạn mới thấy tim mình đập nhanh từ lúc nào.'
        : `Năm đầu học việc ${w.nameVi.toLowerCase()}, người ta chỉ giao việc nặng, công rẻ như cho. Tối về lưng rã rời, tay phồng rộp, đặt lưng xuống là ngủ. Nhưng dần dà bạn biết việc nào làm trước, việc nào để sau, và người cũ trong nghề bắt đầu gọi bạn bằng tên.`; },
      auto(S, X, d) {
        const T = S.traits, has = k => d.choices.find(c => c.k === k);
        // Chí hướng / nghề đã định (js/talent.js): phần lớn theo.
        const aw = G.aimWorks(S).find(id => has(id)); if (aw && X.chance(.85)) return aw;
        if (T.bold > .62) return 'adventurer';
        if (T.studious > .6 && (has('scholar') || has('healer'))) return (has('scholar') || has('healer')).k;
        if (T.pious > .65 && has('priest')) return 'priest';
        // Không có thiên hướng rõ: người ở vùng quê, làng, thôn nghiêng về nghề đất (ngoài đời phần lớn dân là nông dân).
        const LAND = ['farmer', 'herder', 'fisher', 'woodcutter', 'miner'], rural = !S.urban || ['village', 'hamlet'].includes((G.here(S).s || {}).tier);
        const rest = d.choices.filter(c => c.k !== 'adventurer');
        return rest.length ? X.wpick(rest, c => rural && LAND.includes(c.k) ? 4 : G.WORKS[c.k].ring === 4 ? 1 + T.social * 2 : 1).k : 'adventurer';
      }
    },
    promote: {
      prio: 10, gap: 1,
      when: (S, X) => ['teen', 'adult', 'elder'].includes(X.stage(S)) && G.nextJobs(X).length > 0,
      build(S, X) {
        const dir = G.skDir(S), list = G.nextJobs(X).sort((a, b) => ((dir && b.job.id === dir.id) - (dir && a.job.id === dir.id))).slice(0, 3);   // hướng đi đã nâng kỹ năng lên đầu
        return { title: 'Thử thách chuyển nghề', body: `Nghề hiện tại: ${X.jobName(S)} (${G.tierName(X.job(S).tier)}), level ${S.level}. Bạn đủ điều kiện dự thử thách. Qua thì lên bậc, hỏng thì mang thương về, và người ta sẽ nhớ cả hai.`,
          fact: list[0].job.summary || null,
          choices: [...list.map(e => ({ k: e.job.id, label: `${X.jobName(S, e.job.id)} · ${G.tierName(e.job.tier)}`, sub: `${e.job.trial || 'Thử thách'} · ${Math.round(G.promoteP(S, X, e.job) * 100)}%${e.access === 'foreign' ? ' · ngoại lai' : ''}${e.job.faith ? ' · ' + J.faiths[e.job.faith].nameVi : ''}${e.job.summary ? ' — ' + e.job.summary : ''}` })),
            { k: 'wait', label: 'Chưa phải lúc', sub: 'Luyện thêm một năm.' }] };
      },
      apply(S, X, k) {
        if (k === 'wait') return 'Bạn chờ thêm, tập thêm một năm cho chắc tay.';
        const j = G.jobs.byId[k], p = G.promoteP(S, X, j);
        if (X.rnd() < p) {
          const over = G.statOver(S);
          (S.flags.teachAt = S.flags.teachAt || {})[j.tier] = (G.teachBest(S, j.school, j) || {}).id;   // nguồn dạy lúc lên Tier (sim.html)
          S.jobHist.push(S.job); S.job = k; G.skSync(X); G.equipFill(S); S.fame = Math.min(100, S.fame + j.tier * (j.tier >= 4 ? 8 : 2)); X.add('h', 6);
          // Thăng hoa (docs/09 mục 5): cả sáu chỉ số cộng thêm, trần chỉ số nâng nên phần dư của Tier trước được cộng vào.
          const after = G.statOver(S), freed = Object.entries(over).map(([s, n]) => [s, n - (after[s] || 0)]).filter(x => x[1] > 0);
          const rel = freed.length ? ` Phần chỉ số dồn nén ở Tier trước được cộng: ${freed.map(([s, n]) => G.STAT_VI[s] + ' +' + n).join(', ')}.` : '';
          return `Vượt qua. Lúc người chấm thử gật đầu, bạn đứng lặng một lúc mới hiểu ra. Bạn trở thành ${X.jobName(S)}, một ${G.tierName(j.tier)}. Thăng hoa: cả sáu chỉ số +${G.ASCEND[j.tier]}.${rel}` + (j.marker ? ` Dấu hiệu nghề: ${j.marker}.` : '');
        }
        X.add('hl', -6); X.add('h', -4);
        return 'Thất bại. Người chấm thử lắc đầu, không nói thêm câu nào. Vết bầm sẽ lành; năm sau thử lại.';
      },
      // Ưu tiên nghề cùng trường phái với hướng đi (Bộ Xương: trường phái của kỹ năng kiếp trước).
      // Nghề đúng hướng chưa đủ điều kiện thì chờ tối đa 3 năm (luyện tập sẽ nhắm vào mastery còn thiếu).
      auto(S, X, d) {
        if (S.hl < 30) return 'wait';
        const dir = G.skDir(S), cd = dir && d.choices.find(c => c.k === dir.id);
        if (cd) return cd.k;
        const c = d.choices.find(c => c.k !== 'wait' && G.jobs.byId[c.k].school === S.path);
        if (c) return c.k;
        const soon = G.nextJobs(X, true).some(e => e.job.school === S.path);
        if (soon && (S.flags.pathWait || 0) < 3) { S.flags.pathWait = (S.flags.pathWait || 0) + 1; return 'wait'; }
        return d.choices[0].k;
      }
    },
    marriage: {
      prio: 6, gap: 1,
      when: (S, X) => flesh(S) && S.flags.suitor && !(S.family.spouse && S.family.spouse.alive) && X.stage(S) === 'adult',
      build(S, X) {
        const s = S.flags.suitor;
        return { title: 'Lời cầu hôn', body: `${s.name} (${J.races[s.race].nameVi}, ${s.work}) ngỏ lời muốn chung sống với bạn. Lời nói ra vụng về, tay cứ mân mê vạt áo, mắt nhìn xuống đất. Nói xong, người ấy đứng im chờ.`,
          choices: [{ k: 'yes', label: 'Đồng ý', sub: 'Quan hệ và hạnh phúc tăng; có thể có con.' }, { k: 'no', label: 'Từ chối', sub: 'Giữ tự do.' }] };
      },
      apply(S, X, k) {
        const s = S.flags.suitor; S.flags.suitor = null;
        if (k === 'yes') { S.family.spouse = { name: s.name, race: s.race, age: s.age, alive: true }; X.add('h', 12); X.add('so', 10); return 'Đám cưới tổ chức vào mùa gặt, khi rơm mới còn thơm ngoài sân. Họ hàng hai bên kéo tới chật nhà, rượu hết vò này sang vò khác mà khách vẫn chưa về. Đêm ấy, tiếng cười nói còn vọng ngoài ngõ, bạn nắm tay người bên cạnh, thấy căn nhà bỗng chật mà ấm.'; }
        X.add('so', -3); return 'Hai người chia tay ở đầu ngõ, không ai nói thêm câu nào. Mấy hôm sau, ra giếng bạn đi đường vòng, tránh những chỗ hay gặp nhau.';
      },
      auto: (S) => S.traits.social > .25 ? 'yes' : 'no'
    },
    migrate: {
      prio: 4, gap: 4,
      when: (S, X) => S.flags.migrateQ && ['adult', 'elder'].includes(X.stage(S)),
      build(S, X) {
        const adj = G.map.adj[G.map.idx[S.loc]].map(id => G.REGION[id]).sort(() => X.rnd() - .5).slice(0, 3);
        const why = S.flags.migrateQ === true ? 'Bạn nghĩ tới chuyện đi nơi khác. Nghĩ mãi, tới khi tiếng gà gáy đầu tiên vọng lại.' : S.flags.migrateQ;
        return { title: 'Rời quê?', body: why,
          choices: [...adj.map(r => ({ k: r.id, label: r.nameVi, sub: `${J.biomes[r.biome].nameVi} · giàu ${Math.round(r.wealth * 100)} · khu: ${r.zones.map(z => `T${z.tier[0]}–${z.tier[1]}`).join(' / ')}` })),
            { k: 'stay', label: 'Ở lại', sub: home(S, X) }] };
      },
      apply(S, X, k) { S.flags.migrateQ = null; if (k === 'stay') return 'Bạn ở lại. Đường cái vẫn ở đó, chẳng chạy đi đâu, còn đây là nơi bạn thuộc từng ngõ ngách.'; return G.moveTo(X, k); },
      auto(S, X, d) {
        const opts = d.choices.filter(c => c.k !== 'stay');
        // Bị lệnh trục xuất thì phần lớn sẽ đi, và tránh vùng vẫn thuộc nước ra lệnh.
        const forced = S.flags.expelled && G.lawHere(S, 'no_outsiders') && !G.here(S).n.fav.includes(S.race);
        if (!opts.length || X.rnd() < (forced ? .15 : .45)) return 'stay';
        const ct = X.ctier(S);
        const score = c => { const r = G.REGION[c.k], m = G.mainSettlement(c.k); return r.wealth * 2 - Math.max(0, r.zones[0].tier[0] - ct) * 1.5 + (S.traits.bold > .6 ? r.danger : 0) - (forced && m && m.nation === S.nation ? 3 : 0); };
        return opts.sort((a, b) => score(b) - score(a))[0].k;
      }
    },
    gear: {
      prio: 3, gap: 2,
      when: (S, X) => S.gear < 10 && S.gold >= G.gearCost(S.gear + 1) && ['adult', 'elder', 'teen'].includes(X.stage(S)) && (S.work === 'adventurer' || S.undead || S.work === 'hunter' || S.work === 'guard'),
      build(S, X) {
        const c = G.gearCost(S.gear + 1);
        return { title: 'Tiệm rèn', body: `Thợ rèn bày ra bộ trang bị cấp ${S.gear + 1}, gõ ngón tay lên lưỡi thép cho bạn nghe tiếng ngân. Giá ${G.coin(c)}. Bạn có ${S.gold}.`,
          choices: [{ k: 'buy', label: 'Mua', sub: 'Sức mạnh +0,05 Tier.' }, { k: 'skip', label: 'Để dành', sub: '' }] };
      },
      apply(S, X, k) { if (k !== 'buy') return null; S.gold -= G.gearCost(S.gear + 1); S.gear++; return `Bạn đếm tiền đặt lên quầy, khoác thử bộ mới, nặng tay mà chắc. Trang bị ${S.gear}/10.`; },
      auto: (S) => S.gold > G.gearCost(S.gear + 1) * 1.3 ? 'buy' : 'skip'
    },
    bounty: {
      prio: 7, gap: 1,
      when: (S, X) => S.flags.bounty && ['adult', 'elder', 'teen'].includes(X.stage(S)),
      build(S, X) {
        const b = S.flags.bounty, sp = G.B.byId[b.species], z = G.ZONE[b.zone].zone;
        const thr = X.threat({ s: sp, grade: 'alpha', affixes: ['frenzied', 'armored'], count: 1 });
        return { title: 'Lệnh treo thưởng', body: `Hội Mạo Hiểm treo ${G.coin(b.reward)} cho đầu ${sp.nameVi} thủ lĩnh ở ${z.nameVi}. Đe dọa ước tính ${thr.toFixed(1)} Tier; sức bạn ${X.power(S).toFixed(1)}.`,
          fact: `${sp.nameVi}: ${sp.attack}. ${X.factOf(sp)}`,
          choices: [{ k: 'go', label: 'Nhận lệnh', sub: 'Đánh một trận với thủ lĩnh.' }, { k: 'no', label: 'Bỏ qua', sub: '' }] };
      },
      apply(S, X, k) {
        const b = S.flags.bounty; S.flags.bounty = null;
        if (k !== 'go') return null;
        const sp = G.B.byId[b.species], zone = G.ZONE[b.zone].zone;
        const rec = X.fight({ s: sp, grade: 'alpha', affixes: ['frenzied', 'armored'], count: 1, zone });
        if (S.dead) return null;
        if (rec && rec.win) { X.money(b.reward); S.fame = Math.min(100, S.fame + 6); return `Bạn mang đầu nó về, bọc trong tấm vải đã thấm đen. Viên thư ký Hội nhăn mũi, đếm tiền thưởng ra bàn. +${G.coin(b.reward)}.`; }
        return 'Thủ lĩnh còn sống. Bạn lết được về tới Hội, ngồi phịch xuống ghế, còn tờ lệnh thì người ta đã gỡ xuống, chờ một kẻ khác.';
      },
      auto(S, X) { const b = S.flags.bounty, sp = G.B.byId[b.species]; return X.power(S) >= X.threat({ s: sp, grade: 'alpha', affixes: ['a', 'b'], count: 1 }) - .1 ? 'go' : 'no'; }
    },
    // Hang ổ trong vùng (js/dynamic.js, docs/03 mục 4.1): ổ 3 trận, hang 5, sào huyệt 7 (trận cuối là thủ lĩnh). Thua thì rút.
    lair: {
      prio: 6, gap: 1,
      when: (S, X) => (S.focus === 'hunt' || S.focus === 'adventure') && ['teen', 'adult', 'elder'].includes(X.stage(S)) && G.lairChoices(S, X).length > 0,
      build(S, X) {
        const ls = G.lairChoices(S, X).slice(0, 2);
        return { title: 'Hang ổ', body: `Quanh ${G.REGION[S.loc].nameVi} có ${ls.length > 1 ? 'mấy' : 'một'} hang quái mà người trong vùng nhắc tới là hạ giọng. Sức bạn ${X.power(S).toFixed(1)}.`,
          choices: [...ls.map(l => { const z = G.lairZone(l); return { k: l.id, label: `Dọn ${l.name}`, sub: `${G.LAIR_VI[l.lv]} ở ${z.nameVi}, ${G.tierTxt(z)}, đe dọa ~${G.tableThreat(X, z, l.fam).toFixed(1)}; ${G.LAIR_FIGHTS[l.lv]} trận liền${l.lv === 3 ? ', trận cuối là thủ lĩnh' : ''}.` }; }),
            { k: 'no', label: 'Để sau', sub: '' }] };
      },
      apply(S, X, k) { if (k === 'no') return null; const l = (S.world.dyn.lairs || []).find(x => x.id === k && x.empty == null); return l ? G.raidLair(X, l) : null; },
      auto(S, X, d) {
        if (S.hl < 55) return 'no';
        const l = G.lairChoices(S, X).slice(0, 2).find(l => X.power(S) >= G.tableThreat(X, G.lairZone(l), l.fam) + .1 * l.lv);
        return l ? l.id : 'no';
      }
    },
    // Di tích (docs/03 mục 4.2): xuống tầng sâu nhất chưa dọn mà Tier cho phép; 4 trận, trận cuối là thủ lĩnh.
    dungeon: {
      prio: 5, gap: 3,
      when: (S, X) => (S.focus === 'hunt' || S.focus === 'adventure') && ['adult', 'elder'].includes(X.stage(S)) && !!G.dungeonChoice(S, X),
      build(S, X) {
        const c = G.dungeonChoice(S, X), fl = G.dungeonFloors(c.d);
        return { title: c.d.name, body: `Di tích cổ ở ${G.REGION[c.d.region].nameVi}${c.d.nation != null ? `, kho báu thất lạc của ${G.realm.nations[c.d.nation].name}` : ''}. Ba tầng: ${fl.map(z => `${z.nameVi.toLowerCase()} ${G.tierTxt(z)}`).join(', ')}. Sức bạn ${X.power(S).toFixed(1)}.`,
          choices: [{ k: 'go', label: `Xuống ${c.zone.nameVi.toLowerCase()}`, sub: `4 trận, đe dọa ~${G.tableThreat(X, c.zone).toFixed(1)}; trận cuối là thủ lĩnh. Rương báu theo độ sâu.` }, { k: 'no', label: 'Không vào', sub: '' }] };
      },
      apply(S, X, k) { if (k !== 'go') return null; const c = G.dungeonChoice(S, X); return c ? G.raidDungeon(X, c) : null; },
      auto(S, X) { const c = G.dungeonChoice(S, X); return S.hl >= 60 && c && X.power(S) >= G.tableThreat(X, c.zone) + .3 ? 'go' : 'no'; }
    },
    faith_join: {
      prio: 5, gap: 1,
      when: (S, X) => !S.faith && S.flags.preacher && X.stage(S) !== 'infant',
      build(S, X) {
        const reg = X.reg(S), fs = Object.keys(reg.faiths).filter(f => f !== 'none' && !(J.faiths[f].races.shunned || []).includes(S.race));
        return { title: 'Người truyền giáo', body: 'Một người khách lạ nói về thần của họ suốt bữa tối, giọng chậm và chắc, như kể chuyện nhà mình. Đèn cạn dầu mà người ấy vẫn chưa dừng. Trước khi đi ngủ, người ấy nhìn bạn, hỏi: còn bạn thì tin vào điều gì?',
          choices: [...fs.slice(0, 3).map(f => ({ k: f, label: J.faiths[f].nameVi, sub: J.faiths[f].tenet })), { k: 'no', label: 'Không theo', sub: '' }] };
      },
      apply(S, X, k) { S.flags.preacher = false; if (k === 'no') return null; S.faith = k; S.devotion = 5; return `Bạn theo ${J.faiths[k].nameVi}. Sáng hôm sau, lần đầu tiên bạn đọc lời kinh cùng người khách lạ, vấp ở mấy chữ khó, mà đọc xong lòng lặng hẳn.` + ((J.faiths[k].races.favored || []).includes(S.race) ? ' Chủng tộc bạn được ưu ái: tích Devotion nhanh gấp rưỡi.' : ''); },
      auto: (S, X, d) => S.traits.pious > .5 ? d.choices[0].k : 'no'
    },
    healer: {
      prio: 8, gap: 1,
      when: (S, X) => !S.undead && S.conds.some(c => G.CONDS[c.id].mult >= 1.5 && G.CONDS[c.id].heal > 0) && S.gold >= 10,
      build(S, X) {
        const c = S.conds.find(c => G.CONDS[c.id].mult >= 1.5 && G.CONDS[c.id].heal > 0), cost = Math.round(G.median(X.reg(S)) * .6);
        return { title: 'Bệnh không dứt', body: `${G.CONDS[c.id].nameVi} hành bạn ${c.years + 1} năm nay. Đêm nằm trằn trọc, ngày làm được nửa buổi đã phải nghỉ, thuốc thang uống mãi không thấy đỡ.`,
          choices: [{ k: 'pay', label: `Mời thầy thuốc (${G.coin(cost)})`, sub: '70% khỏi' }, ...(S.faith ? [{ k: 'pray', label: 'Cầu nguyện', sub: `${Math.round((.3 + S.devotion / 200) * 100)}% khỏi` }] : []), { k: 'wait', label: 'Chịu đựng', sub: '' }],
          cond: c.id, cost };
      },
      apply(S, X, k) {
        const P = { cond: S.conds.find(c => G.CONDS[c.id].mult >= 1.5 && G.CONDS[c.id].heal > 0) };
        if (!P.cond || k === 'wait') return null;
        let p = .7;
        if (k === 'pay') X.money(-Math.round(G.median(X.reg(S)) * .6)); else p = .3 + S.devotion / 200;
        if (X.rnd() < p) { S.conds.splice(S.conds.indexOf(P.cond), 1); return 'Bệnh lui. Một sáng bạn dậy, thấy người nhẹ hẳn, ăn hết bát cơm mà không phải gắng.'; }
        return 'Không đỡ. Bạn lại nằm nhìn mái nhà, đếm từng vệt nắng lọt qua khe ngói.';
      },
      auto: (S, X, d) => d.choices.find(c => c.k === 'pay') && S.gold > G.median(X.reg(S)) ? 'pay' : d.choices[1].k
    },
    retire: {
      prio: 5, gap: 3,
      when: (S, X) => X.stage(S) === 'elder' && S.work === 'adventurer' && !S.flags.retired,
      build: () => ({ title: 'Treo kiếm?', body: 'Gối bạn kêu mỗi sáng, leo một con dốc đã phải dừng lại thở. Hội Mạo Hiểm gửi lời mời: sân tập của Hội đang thiếu người dạy lũ tân binh.',
        choices: [{ k: 'retire', label: 'Nghỉ hưu', sub: 'Làm thầy dạy; thôi săn.' }, { k: 'go', label: 'Còn đi được', sub: '' }] }),
      apply(S, X, k) { if (k === 'retire') { S.flags.retired = true; S.work = 'scholar'; S.pct = Math.max(S.pct, .4); return 'Bạn treo vũ khí lên vách, nhận dạy ở sân tập của Hội. Lũ tân binh cầm kiếm như cầm cán chổi, mà bạn kiên nhẫn hơn mình tưởng. Có hôm đứng xem chúng tập, bạn thấy lại mình ngày mới ghi tên.'; } return null; },
      auto: (S) => S.traits.bold > .8 ? 'go' : 'retire'
    },
    tournament: {
      prio: 4, gap: 3,
      when: (S, X) => S.flags.tourney && ['adult', 'teen'].includes(X.stage(S)),
      build: (S, X) => ({ title: 'Đại hội võ thuật', body: `${(() => { const n = G.here(S).n, c = n && G.SET[n.capital]; return c ? `Kinh đô ${c.name}` : 'Thành lớn gần nhất'; })()} mở giải đấu. Ba vòng; người thắng nhận 2 vàng. Ngoài cổng thành, hàng người ghi danh đã dài tới tận chân cầu.`,
        choices: [{ k: 'go', label: 'Ghi danh', sub: `Sức bạn ${X.power(S).toFixed(1)} Tier` }, { k: 'no', label: 'Đứng xem', sub: '' }] }),
      apply(S, X, k) {
        S.flags.tourney = false; if (k !== 'go') return null;
        const ct = X.ctier(S);
        for (let r = 0; r < 3; r++) {
          const p = 1 / (1 + Math.exp(-3 * (X.power(S) - (ct + .4 + r * .3))));
          if (X.rnd() > p) { X.add('hl', -X.int(5, 15)); return `Thua ở vòng ${r + 1}. Bạn lau máu mũi, ngồi lại trên khán đài xem người khác đấu tiếp, tới khi nhớ kỹ từng đường của kẻ vừa hạ mình.`; }
          X.gain(X.pick(['Sword', 'Spear', 'Unarmed', 'Axe']), 2);
        }
        X.money(200); S.fame = Math.min(100, S.fame + 10); X.add('h', 10);
        return 'Vô địch. Cả quảng trường gào tên bạn, cái tên mà sáng hôm ấy chưa ai biết. Thợ đá khắc nó lên cột đá giữa quảng trường, bên dưới những cái tên đã mờ vì mưa nắng. Đêm ấy bạn không ngủ, ra đứng sờ từng nét chữ.';
      },
      auto: (S) => S.traits.bold > .5 ? 'go' : 'no'
    },
    reveal: {
      prio: 6, gap: 1,
      when: (S) => S.undead && S.flags.townQ,
      build: (S, X) => ({ title: 'Cổng làng', body: `Bạn đứng trước cổng ${(G.mainSettlement(S.loc) || { name: X.reg(S).nameVi }).name}, mũ trùm kéo sụp xuống tận cằm. Người qua lại tấp nập, chẳng ai để ý tới ai. Chỉ có tên lính canh cứ nhìn mãi chiếc áo choàng của bạn, nhìn xuống cả đôi chân lộ ra dưới vạt áo.`,
        choices: [{ k: 'hide', label: 'Trùm kín, giả người hành hương', sub: `Ẩn thân ${Math.round(S.mastery.Stealth)}` }, { k: 'show', label: 'Bỏ mũ trùm', sub: 'Người ta sẽ biết bạn là gì.' }, { k: 'leave', label: 'Quay đi', sub: '' }] }),
      apply(S, X, k) {
        S.flags.townQ = false;
        if (k === 'leave') return 'Bạn quay lưng, đi ngược về phía đồi. Đêm ấy bạn ngủ ngoài nghĩa địa như mọi khi, giữa những tấm bia quen, nghe tiếng chó sủa vọng lên từ trong làng.';
        if (k === 'hide') { if (X.rnd() < .45 + S.mastery.Stealth / 150) { X.add('so', 5); X.money(5); return 'Không ai nhận ra. Bạn cúi đầu đi qua cổng, giọng khàn khàn hỏi mua ít dầu bôi khớp, người bán còn chúc bạn thượng lộ bình an. Ra khỏi làng rồi bạn mới dám thở ra, dù chẳng còn phổi mà thở.'; } S.flags.revealed = true; X.add('hl', -10); return 'Đi được nửa chợ thì một con chó sủa dữ dội rồi lao tới, ngoạm vạt áo mà kéo tuột áo choàng xuống. Có người thét lên, rồi cả chợ thét theo. Bạn chạy, xương va vào nhau lách cách, chạy mãi tới khi tiếng la ó lùi lại sau lưng.'; }
        S.flags.revealed = true; X.add('so', -5); S.fame += 3; return 'Bạn kéo mũ trùm xuống ngay giữa cổng. Đám đông im lặng, lâu tới mức nghe rõ tiếng con lừa nhai cỏ ở góc chợ. Rồi có người ném đá. Hòn đầu tiên trượt qua vai bạn, hòn thứ hai thì không.';
      },
      auto: (S) => S.mastery.Stealth > 20 ? 'hide' : 'leave'
    },
    dark_offer: {
      prio: 6, gap: 3,
      when: (S) => S.undead && !S.faith && S.flags.darkOffer,
      build: () => ({ title: 'Sứ giả Hắc Giáo', body: 'Đêm sau, người để lại ngọn nến tới thật. Một người áo đen quỳ trước bạn giữa đám cỏ ướt sương, giọng run mà không phải vì sợ. "Ngài không phải quái vật. Ngài là bằng chứng."',
        fact: J.faiths.dark.tenet,
        choices: [{ k: 'join', label: 'Theo Hắc Giáo', sub: 'Chủng tộc được ưu ái; mở ngọn tín ngưỡng Hắc Giáo.' }, { k: 'no', label: 'Đuổi đi', sub: '' }] }),
      apply(S, X, k) { S.flags.darkOffer = false; if (k !== 'join') return null; S.faith = 'dark'; S.devotion = 20; X.add('so', 8); return 'Người áo đen dẫn bạn xuống hầm tế, nơi nến đen cháy thành hàng dọc theo vách đá. Bạn có chỗ ngồi trong hầm tế, một chỗ để trống mà người ta bảo đã chờ bạn từ lâu. Lần đầu tiên từ khi trỗi dậy, có người cúi đầu chào bạn.'; },
      auto: (S) => S.traits.pious > .3 ? 'join' : 'no'
    },
    lord: {
      prio: 9, gap: 1,
      when: (S) => !!S.flags.lordQ,
      build(S, X) {
        const L = S.flags.lordQ, sp = G.B.byId[L.species];
        return { title: `${sp.nameVi} thức giấc`, body: `${sp.attack}. Đe dọa ${X.threat({ s: sp, grade: 'lord', affixes: [], count: 1 }).toFixed(1)} Tier; sức bạn ${X.power(S).toFixed(1)}.`,
          fact: sp.note || null,
          choices: [{ k: 'fight', label: 'Đối mặt', sub: 'Thắng: huyền thoại. Thua: gần như chắc chết.' }, { k: 'flee', label: 'Rút lui', sub: '' }] };
      },
      apply(S, X, k) {
        const L = S.flags.lordQ; S.flags.lordQ = null; S.world.lordSeen[L.species] = S.world.year;
        if (k !== 'fight') return 'Bạn nằm rạp sau mỏm đá, nhìn nó đi qua từ xa. Mặt đất rung dưới ngực, gió từ phía nó thổi tới mang theo mùi tanh nồng. Mãi tới khi nó khuất sau núi, bạn mới nhận ra mình đã nín thở từ lúc nào.';
        const sp = G.B.byId[L.species];
        const rec = X.fight({ s: sp, grade: 'lord', affixes: [], count: 1, zone: G.ZONE[L.zone].zone });
        if (S.dead) return null;
        if (rec.win) { S.flags.lordSlayer = sp.nameVi; return `Bạn hạ ${sp.nameVi}. Khi nó đổ xuống, cả thung lũng rung lên một lần cuối rồi lặng hẳn, lặng tới mức nghe được tiếng máu mình chảy trong tai. Người trong vùng kéo ra xem, đứng xa xa, không ai dám tới gần cái xác. Các thi sĩ sẽ hát về bạn trăm năm.`; }
        return 'Bạn tỉnh dậy giữa đống đá vụn, người không còn chỗ nào lành, còn nó đã đi từ lâu. Bạn sống sót, không hiểu vì sao.';
      },
      auto: (S, X) => { const sp = G.B.byId[S.flags.lordQ.species]; return X.power(S) > X.threat({ s: sp, grade: 'lord', affixes: [], count: 1 }) ? 'fight' : 'flee'; }
    },
    apprentice: {
      prio: 3, gap: 99,
      when: (S, X) => X.stage(S) === 'elder' && !S.flags.apprentice && (X.dominant(S) || {}).value >= 45,
      build: (S, X) => { const d = X.dominant(S); return { title: 'Học trò', body: `Một đứa trẻ xin theo học ${G.mv(d.skill).toLowerCase()} của bạn.`,
        choices: [{ k: 'yes', label: 'Nhận', sub: 'Truyền nghề.' }, { k: 'no', label: 'Từ chối', sub: '' }] }; },
      apply(S, X, k) { S.flags.apprentice = k === 'yes' ? X.name(S.race, X.chance(.5) ? 'm' : 'f') : 'none'; if (k === 'yes') { X.add('h', 8); X.add('so', 8); return `Học trò tên ${S.flags.apprentice}.`; } return null; },
      auto: (S) => S.traits.social > .35 ? 'yes' : 'no'
    }
  };

  G.gearCost = n => Math.round(40 * Math.pow(n, 1.7));
  // Tỉ lệ qua thử thách chuyển nghề (docs/08 mục 7.2): sức so với Tier đích, mastery chính vượt req bao nhiêu, Sinh lực.
  G.PROMOTE_CAP = [.95, .95, .9, .8, .6, .4];   // trần tỉ lệ qua theo Tier đích (docs/09 mục 4)
  G.promoteP = (S, X, j) => {
    const [m, v] = Object.entries(j.req || {})[0] || [null, 0], bonus = X.access(S, j.school) === 'foreign' ? 15 : 0;
    const over = m ? (S.mastery[m] || 0) - v - bonus : 0;
    return G.clamp(.45 + .25 * (X.power(S) - j.tier + 1) + over / 100 + S.hl / 400, .15, G.PROMOTE_CAP[j.tier]);
  };

  // Di chuyển sang vùng khác: G.moveTo ở js/travel.js (hành trình có đường đi, gặp quái dọc đường, trạm biên giới).

  G.scheduledDecisions = function (X) {
    const S = X.S;
    return Object.entries(G.DECISIONS)
      .filter(([id, D]) => (S.recentDec[id] == null || S.age - S.recentDec[id] >= (D.gap || 1)) && D.when(S, X))
      .sort((a, b) => b[1].prio - a[1].prio).map(([id]) => id);
  };

  // ═════════════════════════ SỰ KIỆN ═════════════════════════
  const RITES = {
    human: ['Lễ trưởng thành: bạn thề trung thành với lãnh chúa trước tượng đá ở đầu làng. Bạn quỳ một gối trên nền đá lạnh, đọc lời thề đã nhẩm thuộc từ cả tuần trước. Đọc tới giữa chừng thì giọng lạc đi, người lớn đứng sau vẫn gật đầu như không nghe thấy. Lúc đứng dậy, đầu gối còn hằn vết sỏi, mà lưng thì thẳng hơn hẳn.', 'Shield'],
    elf: ['Lễ trưởng thành: bạn trồng một cây con ở bìa rừng, tự tay vun đất, tưới bằng nước suối đầu nguồn. Người chủ lễ dặn: cây này sẽ còn đứng đó khi tên bạn đã thành chuyện kể. Bạn ngồi bên nó tới khi trăng lên, nghe lá non xào xạc. Từ hôm ấy, đi đâu xa về, việc đầu tiên bạn làm là ra thăm cây.', 'Bow'],
    dwarf: ['Lễ trưởng thành: bạn đứng bên lò của thị tộc từ sáng tới tối, rèn chiếc rìu đầu tiên của đời mình. Lưỡi rìu hơi lệch, cán còn thô, mà không ai chê một lời. Lúc bạn nhúng nó vào nước, cả họ cùng gõ búa lên đe chúc mừng, tiếng chát chúa vang khắp đại sảnh. Đêm ấy bạn ngủ với chiếc rìu đặt ngay cạnh gối.', 'Engineering'],
    orc: ['Lễ trưởng thành: bạn vào rừng một mình, mang về chiếc tai của một con thú do chính tay mình hạ. Máu trên đó đã khô đen, tay áo bạn rách bươm. Cả trại reo lên khi bạn bước qua cổng. Đêm ấy, lần đầu tiên, bạn được ngồi bên đống lửa của người lớn.', 'Axe'],
    beastfolk: ['Lễ trưởng thành: bạn chạy cùng bầy suốt một đêm trăng tròn, từ lúc trăng mọc tới khi trăng lặn. Cỏ ướt sương quất vào chân, phổi bỏng rát, mà không ai được dừng. Gần sáng, con đầu đàn quay lại nhìn bạn một lần. Thế là đủ.', 'Riding'],
    fae: ['Lễ trưởng thành: bạn phải đặt tên cho một loài hoa chưa ai đặt tên. Bạn tìm suốt mùa xuân, lật từng bụi cỏ ven suối, mới gặp một bông nhỏ màu khói mọc giữa kẽ đá. Bạn ghé sát, nói tên nó thật khẽ, như sợ nó nghe thấy rồi đổi ý. Từ đó cả trảng gọi loài hoa ấy bằng cái tên bạn đặt.', 'Arcane'],
    merfolk: ['Lễ trưởng thành: bạn lặn xuống rạn san hô sâu nhất, nơi ánh sáng chỉ còn là một vệt xanh mờ trên đầu. Tai ù đi, ngực thắt lại, tay mò mãi giữa đám san hô sắc như dao. Lúc trồi lên, trong lòng bàn tay bạn có một viên ngọc còn dính cát. Các bà mẹ đàn hát mừng tới tận khuya.', 'Spear'],
    dragonkin: ['Lễ trưởng thành: lần đầu tiên bạn thở ra lửa. Ngọn lửa phụt ra mạnh hơn ai ngờ, cháy sém cả lông mày ông nội đang đứng sát bên. Cả thị tộc lặng đi một nhịp rồi cười vang. Ông nội sờ lên trán, lắc đầu, mà mắt thì sáng rỡ.', 'Fire'],
    construct: ['Hiệu chỉnh lần cuối: thợ đúc tháo tấm nhãn "thử nghiệm" khỏi vỏ bạn. Chỗ tấm nhãn để lại một khoảng kim loại sáng hơn hẳn phần còn lại. Thợ đúc lau nó bằng ống tay áo, gật đầu một cái rồi quay về bàn. Suốt mấy hôm sau, bạn cứ đưa tay lên sờ vào chỗ ấy.', 'Construct']
  };
  const FIRST_WORDS = ['"mẹ"', '"bánh"', '"không"', '"sói"', '"sáng"', 'một từ không ai hiểu'];

  G.EVENTS = [
    // ── Sơ sinh ──
    { id: 'inf_fever', st: ['infant'], w: S => 6 - S.q, run(S, X) { X.add('hl', -10); if (X.chance(.2)) X.cond('fever'); return { t: 'Ba ngày liền bạn sốt hầm hập, khóc tới khản cả tiếng. Mẹ thức trắng bên nôi, cứ một lúc lại vắt chiếc khăn ướt đặt lên trán bạn. Gà gáy sáng ngày thứ tư, mẹ ngủ gục bên mép nôi, tay vẫn còn nắm chiếc khăn.', k: 'bad' }; } },
    { id: 'inf_bless', st: ['infant'], c: S => !!S.faith, w: 3, run(S, X) { X.add('hl', 6); return { t: `Một tu sĩ ${J.faiths[S.faith].nameVi} đi ngang qua làng, ghé vào xin bát nước. Thấy đứa trẻ trong nôi, vị tu sĩ đặt hai ngón tay lên trán bạn, lầm rầm mấy câu kinh không ai trong nhà hiểu. Cả nhà đứng im tới khi bóng áo khuất sau rặng cây đầu ngõ. Cái bát người ấy vừa uống, mẹ cất riêng lên gác, không cho ai dùng.`, k: 'good', f: J.faiths[S.faith].tenet }; } },
    { id: 'inf_night', st: ['infant'], w: S => 2 + G.local(S).raid * 6, run(S, X) { const sp = X.monsterIn(X.reg(S).zones[0]); return { t: `Đêm đông ấy, ${sp.nameVi} lảng vảng quanh nhà, tiếng động sột soạt cứ vòng đi vòng lại dưới chân vách. Cha cầm đuốc đứng ở cửa tới sáng, không dám ngồi xuống lấy một lần. Bạn nằm trong lòng mẹ, được ủ kín trong chăn cho khỏi khóc thành tiếng. Sáng ra, quanh nhà chỉ còn mấy vệt dấu lạ in trên nền đất.`, k: 'info', f: X.factOf(sp) }; } },
    { id: 'inf_word', st: ['infant'], w: 4, run(S, X) { X.add('h', 4); X.add('sm', 2); return { t: `Một buổi tối, giữa lúc cả nhà đang ăn, bạn cất tiếng. Từ đầu tiên bạn nói là ${X.pick(FIRST_WORDS)}. Cả nhà buông đũa nhìn nhau rồi cùng phá lên cười. Mấy hôm sau bạn nói lại từ ấy cả trăm lần, tới khi không ai còn thấy buồn cười nữa.`, k: 'good' }; } },
    // ── Thơ ấu ──
    { id: 'ch_river', st: ['child'], c: flesh, w: S => G.REGION[S.loc].coastal ? 4 : 2, run(S, X) {
        if (X.chance(.04)) { X.die({ id: 'drown', text: 'đuối nước khi chơi gần sông' }); return null; }
        X.add('hl', -12); return { t: 'Bờ sông trơn rêu, bạn trượt chân rơi tõm xuống dòng nước xiết. Nước lạnh tràn vào mũi, vào miệng, chân quờ mãi không chạm được đáy. Một người chăn dê đang lùa đàn qua bến nhảy xuống, kéo bạn lên kịp. Bạn nằm trên bờ nôn ra nước sông, còn người ấy ngồi bên vắt áo, thở dốc, chẳng nói câu nào.', k: 'bad' }; } },
    { id: 'ch_pup', st: ['child', 'teen'], w: 3, run(S, X) { S.flags.pet = X.pick(['sói con', 'cáo con', 'quạ', 'mèo hoang', 'dê núi']); X.add('h', 8); X.gain('Taming', 5); return { t: `Dưới một bụi gai, bạn tìm thấy một con ${S.flags.pet} bị thương, nằm thu mình run rẩy. Bạn ôm nó về giấu trong góc nhà, chia cho nó nửa phần ăn của mình. Mấy hôm đầu nó cắn bạn chảy cả máu tay. Tới khi vết thương lành hẳn, nó không chịu đi nữa, cứ lẽo đẽo theo sau bạn.`, k: 'good' }; } },
    { id: 'ch_bully', st: ['child'], w: 3, run(S, X) {
        if (S.traits.bold > .55) { X.gain('Unarmed', 4); X.add('so', -2); return { t: 'Lũ trẻ lớn hơn chặn bạn ở đầu ngõ, giật đồ, xô bạn ngã xuống bùn. Tới lần thứ ba thì bạn không chạy nữa mà lao vào đánh lại. Bạn về nhà mũi chảy máu, áo rách một bên vai. Từ hôm ấy chúng không quay lại, nhưng mỗi lần đi ngang vẫn nhìn bạn rất lâu.', k: 'info' }; }
        X.add('h', -6); return { t: 'Lũ trẻ lớn hơn bắt nạt bạn suốt mùa hè năm ấy. Chúng giấu dép, ném đất vào lưng, đặt cho bạn một cái tên mà tới giờ bạn vẫn không muốn nhắc lại. Bạn học cách đi đường vòng ra giếng. Đêm nào cũng vậy, bạn nằm quay mặt vào vách, đợi cả nhà ngủ hết mới khóc.', k: 'bad' }; } },
    { id: 'ch_coin', st: ['child', 'teen'], w: 2, run(S, X) { X.money(X.int(2, 8)); X.add('h', 4); return { t: 'Dưới chân cầu, lẫn trong đám rêu xanh, có mấy đồng bạc cũ xỉn màu. Bạn nhìn quanh, không thấy ai. Cả buổi chiều bạn nắm chặt chúng trong tay đến rịn mồ hôi, không dám kể với ai, sợ người ta đòi lại.', k: 'good' }; } },
    { id: 'ch_knight', st: ['child'], w: 3, run(S, X) {
        const j = X.pick(G.jobs.jobs.filter(j => j.tier >= 2 && j.tier <= 4 && !j.race && !j.faith));
        S.flags.inspired = j.school; S.flags.idol = { job: j.nameVi, tier: j.tier, school: j.school };   // js/story.js: mạch Mộng ước
        X.gain(J.schools[j.school].masteries[0], 3);
        return { t: `Một ${j.nameVi} ghé quán trọ trong làng, áo choàng bạc phếch bụi đường. Người ấy ở lại ba ngày, và bạn theo sau suốt ba ngày: đứng nép ngoài cửa quán, ngồi xổm xem người ấy sửa soạn đồ nghề, chạy theo tận ra bờ giếng. Sáng thứ tư người ấy lên đường. Bạn đứng ở cổng làng tới khi bóng người khuất hẳn sau khúc quanh.`, k: 'info', f: j.summary || null }; } },
    { id: 'ch_letters', st: ['child', 'teen'], w: S => 1 + S.q * .6, run(S, X) { X.add('sm', 8); return { t: 'Một tu sĩ già ở đền chịu dạy bạn đọc chữ. Không có giấy, vị tu sĩ lấy que vạch lên cát, bắt bạn đọc to từng chữ rồi xóa đi viết lại. Tối về, bạn còn lấy ngón tay vẽ chữ lên chiếu. Chữ đầu tiên bạn viết đúng là tên của chính mình.', k: 'good' }; } },
    { id: 'ch_raid', st: ['child', 'teen', 'adult'], c: S => !S.undead, w: S => 1 + G.local(S).raid * 12, rep: true, gap: 3, run(S, X) {
        const z = X.reg(S).zones[0], sp = X.monsterIn(z);
        X.add('hl', -X.int(4, 12)); X.add('h', -5);
        const sib = S.family.sibs.find(s => s.alive);
        if (sib && X.chance(.08)) { sib.alive = false; X.add('h', -15); S.flags.kinKilled = { sp: sp.id, kin: sib.name, zone: z.id };   // js/story.js mở mạch Báo thù
        return { t: `Đêm ấy ${sp.nameVi} từ ${z.nameVi} tràn vào làng. Tiếng chó sủa trước, rồi tiếng người la, rồi tiếng cửa phên vỡ ở đầu ngõ. Cả nhà chạy ra lối sau, ${sib.name} không chạy kịp. Sáng ra người ta tìm thấy ${sib.name} nằm cạnh bờ rào, tay còn nắm chặt một nắm rơm.`, k: 'bad', f: X.factOf(sp) }; }
        // Lặp được: thơ ấu một giọng, lớn lên hai giọng xen theo năm tuổi (không rút thêm xúc xắc).
        return { t: X.stage(S) === 'child'
          ? `Giữa đêm, ${sp.nameVi} từ ${z.nameVi} tràn vào làng. Cả nhà trốn trong hầm rượu tới sáng. Trong bóng tối bạn nghe rõ tiếng cào trên ván sàn ngay trên đầu, dừng một lúc rồi lại tiếp. Có ai đó nắm tay bạn suốt đêm, chặt tới mức sáng ra cổ tay còn hằn vết.`
          : S.age % 2
            ? `${sp.nameVi} từ ${z.nameVi} lại tràn vào làng, đông hơn mọi lần người già từng kể. Cả nhà trốn trong hầm rượu tới sáng. Bạn ngồi sát nắp hầm, tay cầm khúc đòn gánh, nghe ngóng từng tiếng động bên trên. Lúc trời hửng, ngoài kia lặng ngắt, chỉ còn những dấu chân lạ in khắp sân.`
            : `Tiếng mõ báo động vang lên lúc nửa đêm: ${sp.nameVi} từ ${z.nameVi} đã tràn vào làng. Cả nhà trốn trong hầm rượu tới sáng. Không ai ngủ. Mỗi lần có tiếng gì đổ ngoài sân, mọi người lại nín thở, nhìn nhau trong bóng tối mà đếm xem đã đủ người chưa.`, k: 'bad', f: X.factOf(sp) }; } },
    { id: 'ch_festival', st: ['child', 'teen', 'adult'], c: S => !S.undead, w: 3, rep: true, gap: 4, run(S, X) { X.add('h', 6); X.add('so', 4);
        // Lặp được: mỗi tuổi một giọng, người lớn hai giọng xen theo năm tuổi. Câu "Bạn nhảy tới khi" là chỗ js/story.js chèn người quen.
        const h = home(S, X), st = X.stage(S);
        return { t: st === 'child' ? `${h} mở hội mùa gặt, trống đánh từ lúc mặt trời còn trên ngọn tre. Người lớn uống rượu nếp, trẻ con chạy lẫn giữa những chân người, đứa nào tay cũng cầm một nắm xôi. Bạn nhảy tới khi chiếc đèn lồng cuối cùng tắt. Về nhà chân rát, áo đẫm mùi khói, mà miệng vẫn còn cười.`
          : st === 'teen' ? `Hội mùa gặt ở ${h} năm nay đông hơn mọi năm, người các làng bên cũng kéo sang. Trai gái đứng thành hai vòng quanh đống lửa, ai cũng giả vờ không nhìn sang vòng bên kia. Bạn nhảy tới khi đèn lồng tắt, giày lấm bụi, tóc ám khói. Về tới nhà rồi mà tiếng trống vẫn còn đập trong ngực, nằm mãi không ngủ được.`
          : S.age % 2 ? `Lại một mùa gặt, ${h} lại mở hội. Bạn đứng xem lũ trẻ chạy quanh đống lửa một lúc lâu, nhớ hồi mình cũng từng chạy như thế. Rồi có người dúi vào tay bạn một chén rượu, kéo vào vòng. Bạn nhảy tới khi đèn lồng tắt. Sáng hôm sau dậy muộn, lưng mỏi rã mà miệng vẫn ngân nga khúc hát đêm qua.`
          : `Hội mùa gặt ở ${h}. Mùi xôi mới, mùi rơm khô, mùi khói đuốc vẫn y như mọi năm, chỉ những gương mặt quanh đống lửa là đổi khác. Bạn nhảy tới khi đèn lồng tắt. Trên đường về, bạn lẩm nhẩm đếm xem năm nay ai không còn tới nữa.`, k: 'good' }; } },
    { id: 'ch_lost', st: ['child'], w: 2, run(S, X) { const z = X.reg(S).zones[0]; X.gain('Stealth', 3); X.add('h', -3); return { t: `Mải chơi xa, bạn đi lạc vào ${z.nameVi}. Trời tối nhanh hơn bạn tưởng. Cả đêm bạn ngồi co ro sau một tảng đá, nín thở mỗi khi có tiếng động lạ. Sáng ra, lần theo tiếng gà gáy vọng lại từ xa, bạn tự tìm được đường về. Người nhà đánh cho một trận, đánh xong lại ôm chặt không buông.`, k: 'info' }; } },
    { id: 'ch_spark', st: ['child', 'teen'], w: S => (S.flags.omen ? 6 : 0) + X0(S).magic * 2, run(S, X) {
        const asp = S.flags.omen || X.pick(['fire', 'frost', 'storm', 'arcane']), m = { fire: 'Fire', frost: 'Frost', storm: 'Lightning', moon: 'Arcane', light: 'Spirit', dark: 'Curse', arcane: 'Arcane' }[asp];
        X.gain(m, 6); return { t: `Tối ấy, bạn vừa chồm tới gần thì ngọn nến trên bàn tự đổi màu, ngả sang một sắc không ai gọi được tên. Một lúc lâu sau lửa mới vàng trở lại. Không ai nói gì. Người lớn nhìn nhau, rồi nhìn bạn, và bữa cơm hôm ấy tàn sớm hơn mọi hôm.`, k: 'big', f: `${J.aspects[asp].nameVi}: ${J.aspects[asp].hook}` }; } },
    { id: 'ch_hunger', st: ['child', 'teen', 'adult'], c: S => S.q <= 2 && flesh(S), w: S => (1 - X0(S).wealth) * 4, rep: true, gap: 4, run(S, X) { X.add('hl', -8); X.add('h', -6);
        // Lặp được: thơ ấu một giọng, lớn lên hai giọng xen theo năm tuổi.
        return { t: X.stage(S) === 'child' ? 'Năm ấy mất mùa. Cả nhà ăn cháo loãng tới mùa xuân, loãng tới mức soi được mặt mình trong bát. Người lớn vớt phần cái cho bạn, còn mình húp nước rồi đi ngủ sớm cho đỡ đói.'
          : S.age % 2 ? 'Lại một năm mất mùa. Cả nhà ăn cháo loãng tới mùa xuân, bữa nào cũng chia đều từng muôi. Đêm đói không ngủ được, bạn nằm nghe bụng mình réo, nghe cả tiếng người nhà trở mình bên kia vách.'
          : 'Năm ấy trời làm khó, giá gạo ngoài chợ lên từng ngày. Cả nhà ăn cháo loãng tới mùa xuân. Bạn thắt lưng chặt thêm một nấc, sáng nào cũng ra cửa nhìn trời, như nhìn lâu thì mưa sẽ tới đúng mùa.', k: 'bad' }; } },
    // ── Thiếu niên ──
    { id: 'tn_love', st: ['teen'], c: flesh, w: 4, run(S, X) { X.add('h', 7); X.add('so', 5); return { t: `Mối tình đầu với ${X.name(S.race, X.chance(.5) ? 'm' : 'f').split(' ')[0]} kéo dài đúng một mùa hè. Hai người hẹn nhau ở bờ rào sau nhà, nói toàn chuyện không đâu, đỏ mặt mỗi khi có người đi ngang. Có hôm chỉ đứng cạnh nhau nhìn ra cánh đồng, chẳng ai nói câu nào. Sang thu thì mỗi người một ngả, mà mùi cỏ khô đầu mùa năm ấy bạn nhớ mãi.`, k: 'good' }; } },
    { id: 'tn_apprentice', st: ['teen'], c: S => !S.undead, w: 3, run(S, X) {
        const id = X.pick(['smith', 'healer', 'hunter', 'guard', 'herder']), w = G.WORKS[id];
        for (const [m, v] of Object.entries(w.trains)) X.gain(m, v * 2);
        return { t: `Một năm ấy bạn theo học việc ${w.nameVi.toLowerCase()}. Việc đầu tiên người ta giao là việc chẳng ai muốn làm: quét dọn, khuân vác, đứng nhìn người khác làm. Tới giữa năm mới được cầm vào đồ nghề, lóng ngóng tới mức bị mắng cả buổi. Cuối năm, bàn tay bạn đã chai ở đúng những chỗ của người làm nghề.`, k: 'info' }; } },
    { id: 'tn_brawl', st: ['teen', 'adult'], c: S => !S.undead, w: S => S.traits.bold * 3, rep: true, gap: 3, run(S, X) { X.gain('Unarmed', 4); X.add('hl', -5);
        // Lặp được: thiếu niên một giọng, người lớn hai giọng xen theo năm tuổi. Câu "được một người bạn" là chỗ js/story.js chèn tên.
        return { t: X.stage(S) === 'teen' ? 'Ẩu đả ở quán rượu, đầu đuôi chỉ vì một câu nói đùa quá trớn. Ghế đổ, bát vỡ, chủ quán vác chổi đuổi cả đám ra đường. Có một người lạ đứng về phía bạn từ đầu tới cuối, chẳng hỏi ai đúng ai sai. Đêm ấy bạn mất một chiếc răng và được một người bạn.'
          : S.age % 2 ? 'Ẩu đả ở quán rượu cuối phố, tới giờ bạn vẫn không nhớ ai ra tay trước. Rượu đổ lênh láng, có người bị ném qua cửa sổ, tiếng chửi vang tới tận đầu chợ. Bạn tựa lưng vào quầy mà đánh, tới khi lính tuần thổi còi. Kết cục bạn mất một chiếc răng và được một người bạn.'
          : 'Ở quán rượu, một gã say hất đổ chén của bạn rồi cười. Chỉ một cái đẩy vai, cả quán đã thành bãi ẩu đả. Lúc bụi lắng xuống, bạn ngồi dưới gầm bàn ôm hàm, bên cạnh một người lạ cũng đang ôm hàm y như mình. Bạn mất một chiếc răng và được một người bạn.', k: 'info' }; } },
    { id: 'tn_runaway', st: ['teen'], c: S => S.h < 40 && flesh(S), w: 3, run(S, X) { X.gain('Stealth', 4); X.add('so', -6); return { t: 'Bạn bỏ nhà đi ba tháng rồi quay về, gầy rộc. Hôm đi, trời còn chưa sáng hẳn, bạn gói vài bộ áo, lẻn ra cửa sau, không để lại một lời. Ba tháng ấy bạn làm thuê đổi bữa, ngủ nhờ chuồng trâu, có đêm co ro dưới gầm cầu nghe mưa. Hôm về, bạn đứng mãi ở đầu ngõ không dám vào. Người trong nhà trông thấy, không ai hỏi gì, chỉ lặng lẽ dọn thêm một cái bát.', k: 'bad' }; } },
    { id: 'tn_first_hunt', st: ['teen'], c: S => !S.undead, w: 4, run(S, X) { const sp = X.monsterIn(X.reg(S).zones[0]); X.gain('Throwing', 3); X.gain('Bow', 2); X.addXp(40); return { t: `Lần đầu đi săn, bạn hạ một ${sp.nameVi} ở ${X.reg(S).zones[0].nameVi}. Rình từ sáng tới trưa, tim đập to tới mức bạn tưởng con mồi cũng nghe thấy. Tay run, mà phát đầu tiên đã trúng. Tối ấy bạn ngồi bên đống lửa nhìn chiến lợi phẩm của mình, không ngủ được, ai chịu nghe là kể lại từ đầu.`, k: 'good', f: X.factOf(sp) }; } },
    { id: 'tn_rite', st: ['teen'], c: S => !!RITES[S.race], w: 6, run(S, X) { const [t, m] = RITES[S.race]; X.gain(m, 6); X.add('so', 5); return { t, k: 'big', f: J.races[S.race].lore }; } },
    { id: 'tn_tourney_watch', st: ['teen', 'child'], c: S => kind(S) === 'capital', w: 3, run(S, X) { X.add('h', 5); S.flags.inspired = 'combat'; return { t: 'Bạn len qua cả rừng người để chen lên hàng đầu xem giải đấu ở Kinh Đô. Cát trong sân đấu bay lên mỗi lần hai người lao vào nhau, rơi lả tả cả lên tóc bạn. Có một đấu sĩ ngã xuống rồi lại đứng dậy, ba lần như thế, và cả khán đài gào tên người ấy. Đêm đó tiếng kiếm chạm nhau theo bạn vào tận giấc ngủ.', k: 'good' }; } },
    // ── Trưởng thành ──
    { id: 'ad_harvest', st: ['adult', 'elder'], c: S => ['farmer', 'herder'].includes(S.work), w: 5, rep: true, gap: 2, run(S, X) {
        const g = Math.round(G.median(X.reg(S)) * (X.chance(.5) ? .4 : -.3)); X.money(g);
        // Lặp được (hai năm một lần): mỗi kết quả hai giọng xen theo năm tuổi.
        return g > 0 ? { t: S.age % 2 ? `Năm ấy được mùa. Kho chật, sân phơi không còn chỗ đặt chân, tối nào cũng có nhà bên sang hỏi mượn bao tải. Bạn chở hàng ra chợ mấy chuyến liền, bán thêm được ${G.coin(g)}.`
            : `Trời thuận cả năm: mưa đúng lúc, nắng đúng mùa, sâu bệnh cũng chừa ra. Tối kiểm lại túi tiền, bạn đếm tới lần thứ hai vẫn chưa tin. Năm ấy được mùa, bạn bán thêm được ${G.coin(g)}.`, k: 'good' }
          : { t: S.age % 2 ? `Mất mùa. Mưa dầm cả tháng đúng lúc thu hoạch, cái gì đem về được cũng ẩm mốc. Bạn ngồi cộng lại sổ, mãi mới dám viết dòng cuối: lỗ ${G.coin(-g)}.`
            : `Hạn kéo dài từ đầu hè, đất nứt chân chim, cỏ cháy vàng tới tận bờ suối. Sáng nào bạn cũng ra đứng nhìn trời, chiều về thì lặng lẽ. Cuối năm tính sổ, mất mùa, lỗ ${G.coin(-g)}.`, k: 'bad' }; } },
    { id: 'ad_bandits', st: ['adult', 'elder'], w: S => 1 + X0(S).danger * 3 + X0(S).gini * 2, rep: true, gap: 3, run(S, X) {
        // Lặp được: mỗi kết quả hai giọng xen theo năm tuổi. Thua thì js/story.js có thể nối thêm câu về tên cầm đầu.
        if (X.power(S) > 1.1 + X.rnd()) { X.money(X.int(10, 40)); S.fame += 1; return { t: S.age % 2 ? 'Cướp chặn đường ở khúc vắng qua rừng, một toán nhảy ra chặn trước chặn sau. Bạn không đợi chúng mở miệng. Mấy đứa chạy trước, tên cầm đầu chạy sau cùng, đánh rơi cả túi tiền bên vệ cỏ. Bạn nhặt lên, phủi bụi, đeo vào thắt lưng mà đi tiếp.'
          : 'Cướp chặn đường giữa quãng đồi trọc: ba bốn gã bịt mặt bước ra từ sau mỏm đá, dao lăm lăm. Chúng chọn nhầm người. Một lúc sau cả bọn bỏ chạy tán loạn, tên cầm đầu để lại túi tiền của chính hắn. Tối ấy ở quán trọ, bạn gọi thêm một đĩa thịt.', k: 'good' }; }
        const loss = Math.min(Math.max(0, S.gold), X.int(10, 60)); X.money(-loss); X.add('hl', -X.int(3, 12));
        if (X.chance(.01)) { X.die({ id: 'bandit', text: 'bị cướp đường giết' }); return null; }
        return { t: S.age % 2 ? `Cướp chặn đường ở khúc vắng, một toán bịt mặt nhảy ra, mũi dao kề sát sườn bạn. Chúng lục từng túi áo, giũ cả tay nải xuống đất. Bạn mất ${G.coin(loss)}, người thêm mấy vết bầm.`
          : `Gần tối, ngay trên con đường quen, cướp chặn đường. Bạn vừa định chống lại thì ăn một cú báng vào bụng, ngã quỵ xuống đất. Chúng lấy của bạn ${G.coin(loss)}.`, k: 'bad' }; } },
    { id: 'ad_inherit', st: ['adult'], c: S => !S.undead, w: .6, run(S, X) { const g = X.int(30, 200); X.money(g); return { t: `Một người họ xa bạn chưa gặp bao giờ qua đời, để lại cho bạn ${G.coin(g)}. Tin tới bằng một lá thư đóng dấu, nét chữ của người viết thuê ở tận đâu xa. Bạn cố nhớ xem trong nhà đã ai từng nhắc tới cái tên ấy, mà nhớ không ra. Tối ấy bạn thắp một nén hương cho người lạ ấy, thấy vậy mới phải phép.`, k: 'good' }; } },
    { id: 'ad_trinket', st: ['adult', 'elder'], w: S => .5 + X0(S).magic * 2, run(S, X) {
        if (X.chance(.4 + X0(S).magic * .2)) { X.cond('curse'); return { t: 'Ở chợ đêm, một bà lão trùm khăn bán cho bạn chiếc nhẫn bạc với giá rẻ tới khó tin. Bạn đeo thử, thấy vừa khít như đo tay. Từ đêm ấy bạn mơ đi mơ lại cùng một giấc mơ: một cánh cửa đá, và ai đó gõ từ phía bên kia. Sáng ra, ngón tay đeo nhẫn lạnh buốt.', k: 'bad' }; }
        S.gear = Math.min(10, S.gear + 1); return { t: 'Món đồ cũ mua rẻ ở chợ đêm hóa ra là đồ tốt. Lúc mua nó còn lấm bụi, chủ sạp chẳng buồn mặc cả. Về nhà lau sạch mới thấy đường gia công khéo lạ, kim loại không gỉ một vết. Bạn ngồi ngắm nó dưới đèn tới khuya, mỉm cười như vừa lừa được cả chợ.', k: 'good' }; } },
    { id: 'ad_dragon_sky', st: ['child', 'teen', 'adult', 'elder'], undead: 'any', c: S => ['storm_spire', 'ash_peak', 'serpent_bay', 'abyss_rift'].includes(X0(S).biome), w: 2, rep: true, gap: 6, run(S, X) {
        const R = X.reg(S), sp = R.lord ? G.B.byId[R.lord.species] : G.B.byId['sky_wyvern'];
        // Lặp được: thơ ấu một giọng, lớn lên hai giọng xen theo năm tuổi.
        X.add('h', -2); return { t: X.stage(S) === 'child' ? `Đang chơi ngoài bãi, bạn thấy bầu trời ${R.nameVi} tối sầm lại một khoảnh. Bóng ${sp.nameVi} lướt qua trên đầu, to tới mức che cả mặt trời. Người lớn chạy ra lùa trẻ con vào nhà, đóng sập cửa. Cả buổi chiều ấy chim ngừng hót, không con nào cất tiếng.`
          : S.age % 2 ? `Giữa trưa, bóng ${sp.nameVi} lướt qua bầu trời ${R.nameVi}, gió từ đôi cánh thổi rạp cả một sườn cỏ. Người ngoài đồng nằm áp xuống luống, không ai dám ngẩng lên. Nó bay qua, không dừng lại. Chim ngừng hót cả buổi, tới chiều mới có một con sẻ lên tiếng trước.`
          : `Bóng ${sp.nameVi} lướt qua bầu trời ${R.nameVi}, cao tít giữa mây, chỉ còn là một vệt đen dài. Người ngoài chợ ngừng tay, ngước nhìn theo tới khi nó khuất sau núi. Không ai nói gì. Tối ấy nhà nào cũng cài then sớm, và chim thì im cả buổi.`, k: 'info', f: `${sp.nameVi}: ${sp.attack}.` }; } },
    { id: 'ad_guild', st: ['adult', 'elder'], undead: 'any', c: S => !!(S.roles && S.roles.adv) && S.fame >= 15 && !S.flags['rank' + G.advRank(S)], w: 6, run(S, X) {
        const r = G.advRank(S); S.flags['rank' + r] = true;   // Hiệp Hội Mạo Hiểm (js/org.js): hạng theo danh vọng
        X.add('so', 5); X.money(r * 20); return { t: `Hiệp Hội Mạo Hiểm nâng bạn lên hạng ${G.ADV_RANKS[r]}. Viên thư ký đọc tên bạn giữa sảnh đông người, giọng to hơn mọi khi. Tấm thẻ mới cầm trong tay còn thơm mùi gỗ khắc, mấy tay mạo hiểm ngồi quanh đó gõ cốc xuống bàn chúc mừng. Đêm ấy bạn đặt tấm thẻ cạnh gối, nửa đêm còn trở dậy sờ thử.`, k: 'big' }; } },
    { id: 'ad_companion', st: ['adult'], c: S => !S.flags.companion && ['adventurer', 'hunter'].includes(S.work), w: 3, run(S, X) {
        const race = X.pick(Object.keys(G.RACES).filter(r => r !== 'skeleton')); S.flags.companion = { name: X.name(race, X.chance(.5) ? 'm' : 'f'), race };
        X.add('so', 8); return { t: `Bạn lập đội với ${S.flags.companion.name}, một ${J.races[race].nameVi} cũng quen đi săn một mình như bạn. Hai người chạm mặt nhau ở quán trọ đầu đường, ngồi chung bàn một bữa, rồi thêm bữa nữa, tới khi chẳng ai nhớ ai rủ ai trước. Chuyến đầu đi chung, lần đầu có người canh lưng cho mình, bạn ngủ một mạch tới sáng.`, k: 'good' }; } },
    { id: 'ad_companion_lost', st: ['adult', 'elder'], undead: 'any', c: S => !!S.flags.companion, w: 1.5, run(S, X) {
        const c = S.flags.companion; S.flags.companion = null; X.add('h', -15); X.add('so', -8);
        return { t: `${c.name} không trở về sau một chuyến đi một mình. Hôm đi, ${c.name} bảo việc nhỏ thôi, vài hôm là về, không cần bạn theo. Vài hôm thành một tuần, rồi một tháng. Bạn đi hỏi khắp các trạm, các quán, chẳng ai thấy. Chỗ nằm của ${c.name} bạn vẫn để nguyên, gấp gọn, không cho ai đụng vào.`, k: 'bad' }; } },
    { id: 'ad_suitor', st: ['adult'], c: S => flesh(S) && !(S.family.spouse && S.family.spouse.alive) && !S.flags.suitor, w: S => 2 + S.so / 20 + S.traits.social * 3, rep: true, gap: 2, run(S, X) {
        const race = X.chance(.8) ? S.race : X.wkey(X.reg(S).races); const rr = G.RACES[race];
        if (rr.construct) return null;
        S.flags.suitor = { name: X.name(race, X.chance(.5) ? 'm' : 'f'), race, work: G.WORKS[X.pick(Object.keys(G.WORKS))].nameVi.toLowerCase(), age: X.years(S) + X.int(-4, 4) };
        // Lặp được: hai giọng xen theo năm tuổi.
        return { t: S.age % 2 ? `Dạo ấy chiều nào ra giếng làng bạn cũng gặp ${S.flags.suitor.name}. Lúc đầu chỉ gật đầu chào, sau thì đứng lại hỏi nhau vài câu, rồi đứng lâu tới mức nước trong thùng tràn cả ra chân. Người trong xóm bắt đầu nhìn hai người mà cười cười. Bạn chẳng nói gì, chỉ thấy mình ra giếng sớm hơn trước.`
          : `${S.flags.suitor.name} làm ${S.flags.suitor.work}, nhà ở cuối xóm. Hai người quen nhau ở giếng làng, từ hôm ${S.flags.suitor.name} giúp bạn kéo cái gàu bị kẹt. Từ đó lần nào ra giếng cũng tình cờ gặp, tình cờ nhiều tới mức chẳng ai tin là tình cờ nữa. Bạn bắt đầu để ý xem mình mặc gì mỗi khi ra ngõ.`, k: 'info' }; } },
    { id: 'ad_tax', st: ['adult', 'elder'], c: S => !S.undead && S.gold > 20, w: 2, rep: true, gap: 3, run(S, X) { const t = Math.round(S.gold * .15); X.money(-t); X.add('h', -3);
        // Lặp được: hai giọng xen theo năm tuổi; câu cuối là lúc nộp tiền (js/story.js nối thêm người cầm sổ).
        return { t: S.age % 2 ? `Lính của lãnh chúa đánh trống khắp các ngõ: thuế chiến tranh năm nay lại tăng. Người ta xếp hàng dài trước sân đình từ lúc sương còn chưa tan, ai cũng ôm chặt túi tiền trước ngực. Tới lượt mình, bạn nộp ${G.coin(t)}.`
          : `Lãnh chúa tăng thuế chiến tranh, cáo thị dán kín cổng chợ, mực còn chưa khô. Người đi chợ đứng đọc rồi lắc đầu, có người chửi thề khe khẽ. Tới hạn, bạn mang tiền ra sân đình, đứng chờ giữa hàng người im lặng. Bạn nộp ${G.coin(t)}.`, k: 'bad' }; } },
    { id: 'ad_dice', st: ['adult', 'teen'], c: S => S.gold > 10, w: S => 1 + S.traits.bold, rep: true, gap: 2, run(S, X) { const g = Math.round(Math.min(S.gold, 30) * (X.chance(.45) ? 1 : -1)); X.money(g);
        // Lặp được: mỗi kết quả hai giọng xen theo năm tuổi; thua thì js/story.js có thể nối thêm chuyện vay nợ.
        return { t: g > 0 ? (S.age % 2 ? `Đêm ấy ở sòng xúc xắc sau quán rượu, bạn gặp vận đỏ. Khói đèn dầu cay xè mắt, mà gieo ván nào trúng ván ấy, mấy tay chơi lâu năm nhìn nhau ngờ vực. Bạn đứng dậy đúng lúc, đánh xúc xắc thắng ${G.coin(g)}.`
            : `Chỉ định ngồi xem một ván cho vui, ai ngờ có người nhường chỗ. Bát xúc xắc lắc trong tay bạn kêu lách cách, mở ra ván nào cũng trúng. Tan sòng, bạn thắng ${G.coin(g)}, vừa đi vừa ngoái lại như sợ ai đuổi theo.`)
          : (S.age % 2 ? `Đêm ấy ở sòng xúc xắc sau quán rượu, vận đen bám lấy bạn từ ván thứ ba. Khói đèn dầu cay xè mắt, bát xúc xắc mở ra lần nào cũng lệch một nút. Bạn ngồi tới khi gà gáy, thua ${G.coin(-g)}.`
            : `Bạn tự hứa chỉ đánh xúc xắc ba ván. Ba ván thành mười, mười thành không đếm nữa, tới khi túi rỗng mới thôi. Đêm ấy bạn thua ${G.coin(-g)}.`), k: g > 0 ? 'good' : 'bad' }; } },
    { id: 'ad_map', st: ['adult'], c: S => !S.flags.map, w: 1.2, run(S, X) { S.flags.map = true; return { t: 'Một lão say rượu bán cho bạn tấm bản đồ kho báu với giá một vại bia. Lão kéo tay áo bạn vào góc quán, thì thầm rằng món hàng này không bán cho ai. Tấm bản đồ vẽ trên da, mép cháy xém, chữ nhòe gần hết. Bạn mua, phần vì tò mò, phần vì thương lão, rồi gấp nó cất kỹ dưới đáy túi.', k: 'info' }; } },
    { id: 'ad_map_found', st: ['adult', 'elder'], undead: 'any', c: S => S.flags.map === true && (S.focusTime.adventure || 0) > 0, w: 5, run(S, X) { S.flags.map = 'used'; const g = X.int(80, 300); X.money(g); S.gear = Math.min(10, S.gear + 1); return { t: `Tấm bản đồ của lão say năm nào là thật. Bạn tìm ra đúng cái cây khô vẽ trên đó, đào sâu chừng hai sải tay thì lưỡi xẻng chạm vào gỗ. Trong rương có ${G.coin(g)} và một thanh kiếm cũ bọc vải dầu, lưỡi vẫn còn sáng. Bạn ngồi trên miệng hố tới chiều, nghĩ xem lão say ấy giờ còn sống không.`, k: 'big' }; } },
    { id: 'ad_prophet', st: ['adult'], w: 1, run(S, X) { const lt = X.lt(S); const y = Math.round((lt.leT + X.gauss() * 6) * X.R(S).ypt); return { t: `Ở chợ phiên, bà đồng mù nắm lấy tay bạn, những ngón tay lạnh và khô như rễ cây. "Ngươi sẽ chết năm ${y} tuổi," bà nói, giọng đều đều như người đọc giá rau. Bạn rụt tay lại, ngực đập thình thịch. Người bán hàng bên cạnh bật cười: bà ấy nói câu đó với mọi người.`, k: 'info' }; } },
    { id: 'ad_mine', st: ['adult'], c: S => S.work === 'miner' || X0(S).id === 'thach_lam', w: S => S.work === 'miner' ? 3 : .6, rep: true, gap: 4, run(S, X) {
        if (X.chance(S.work === 'miner' ? .04 : .015)) { X.die({ id: 'mine', text: 'sập hầm mỏ' }); return null; }
        // Lặp được: hai giọng xen theo năm tuổi.
        X.add('hl', -10); return { t: S.age % 2 ? 'Một đoạn hầm sập sau lưng bạn. Trước đó chỉ có một tiếng rắc khô khốc, rồi đá đổ ầm ầm, ngọn đèn dầu tắt phụt. Ba ngày liền bạn đào đường ra trong bóng tối, tay rướm máu, đếm từng hơi thở cho đỡ sợ. Lúc thấy được ánh sáng, bạn nằm sấp xuống đất mà thở, như chưa bao giờ được thở.'
          : 'Hầm mỏ rung lên, đá vụn lả tả rơi trước, rồi cả đoạn hầm sau lưng bạn sập xuống. Bạn mất ba ngày đào đường ra, sống nhờ mấy ngụm nước trong bầu và một mẩu bánh khô. Lên tới miệng hầm, mấy người thợ khác đã đứng chờ sẵn, có người còn cầm theo khăn tang.', k: 'bad' }; } },
    { id: 'ad_sea_storm', st: ['adult', 'elder'], c: S => ['fisher', 'sailor'].includes(S.work), w: 3, rep: true, gap: 3, run(S, X) {
        if (X.chance(.05)) { X.die({ id: 'drown', text: 'đắm thuyền trong bão' }); return null; }
        // Lặp được: hai giọng xen theo năm tuổi.
        X.add('hl', -8); return { t: S.age % 2 ? 'Bão lật thuyền. Trời đang xanh mà chỉ một lúc đã đen kịt, con sóng thứ ba úp sấp cả mạn thuyền. Bạn bám vào một mảnh ván suốt một đêm, nước muối xót cả mắt, tai chỉ còn nghe tiếng gió. Sáng ra sóng đánh bạn dạt vào một bãi đá, tay vẫn không chịu buông mảnh ván.'
          : 'Giữa khơi gió trở hướng, cánh buồm rách toạc, thuyền nghiêng một bên rồi lật. Cả đêm bạn bám mảnh ván, lúc chìm lúc nổi, cố không nghĩ tới đáy biển ngay dưới chân. Gần sáng một thuyền đánh cá vớt được bạn, người tím tái, răng va vào nhau lập cập.', k: 'bad' }; } },
    { id: 'ad_sandstorm', st: ['child', 'teen', 'adult', 'elder'], undead: 'any', c: S => X0(S).biome === 'red_desert', w: 3, rep: true, gap: 3, run(S, X) { X.add('hl', -6);
        // Lặp nhiều lần một đời ở sa mạc: Bộ Xương một giọng, người sống ba giọng xoay theo năm tuổi.
        return { t: S.undead ? 'Bão cát đỏ thổi ba ngày ba đêm. Cát lọt vào từng khớp xương, mỗi bước đi kêu lạo xạo như nhai sỏi. Bạn ngồi nép sau một cồn đá chờ gió lặng. Lúc tạnh, cách đó không xa, một ngôi đền cổ đã lộ nửa mái ra khỏi cát, tới chiều lại bị vùi.'
          : ['Bão cát đỏ ba ngày liền. Trời đỏ quạch như lòng lò gạch, cát lọt qua cả khe cửa, bám vào chăn, vào chén nước. Cả nhà chít khăn kín mặt ngồi chờ. Khi gió tạnh, ngoài bãi lộ ra một ngôi đền cổ, cột đá khắc thứ chữ không ai đọc được. Mấy hôm sau gió lại vùi nó xuống.',
            'Bão cát đỏ nổi lên, gió rít suốt ba ngày như có ai thổi tù và mãi không thôi. Sáng ngày thứ tư, người trong vùng kéo nhau ra xem: chỗ đồi cát cũ giờ là một mái đền cổ, cửa tối om. Chưa ai kịp bước vào thì gió chiều đã lấp lại.',
            'Ba ngày bão cát đỏ. Bạn chỉ nhớ màu đỏ, tiếng rít, và vị cát lạo xạo trong miệng mỗi lần nhai cơm. Khi tạnh, một người chăn lạc đà kể có thấy một ngôi đền cổ lộ ra ở phía tây, rồi lại bị vùi ngay đêm ấy. Người già bảo năm nào cũng có người kể thế, mà chẳng ai tìm lại được.'][S.age % 3], k: 'info', f: X0(S).lore }; } },
    { id: 'ad_volcano', st: ['child', 'teen', 'adult', 'elder'], undead: 'any', c: S => X0(S).biome === 'ash_peak', w: 1.5, rep: true, gap: 8, run(S, X) { X.add('hl', -8); { const k = G.zoneKey(X0(S).zones[0], G.provOfS(S)); S.world.zonePop[k] = Math.min(2.2, (S.world.zonePop[k] ?? 1) + .4); }
        // Lặp được: hai giọng xen theo năm tuổi.
        return { t: S.age % 2 ? 'Núi phun tro. Tiếng nổ đầu tiên làm rung cả bát đĩa trên chạn, rồi tro xám rơi suốt mấy ngày như tuyết bẩn. Đêm đêm từ miệng núi vọng xuống những tiếng gầm, và quái kéo nhau chạy xuống sườn, tràn ra các bãi chăn. Ai có việc phải ra ngoài cũng đi thành từng nhóm, tay cầm đuốc.'
          : 'Núi lại thức, phun tro suốt một mùa. Ban ngày trời tối như chạng vạng, tro phủ dày trên mái, phải trèo lên quét kẻo sập. Từ miệng núi, quái chạy xuống sườn từng đàn, mắt đỏ như than. Người ta bảo núi giận thì quái cũng không ở yên được.', k: 'bad', f: X0(S).lore }; } },
    { id: 'ad_fae_sleep', st: ['teen', 'adult'], c: S => X0(S).biome === 'fae_glade' && !S.undead, w: 1.2, run(S, X) { S.age += 1; S.world.year += X.R(S).ypt; return { t: `Bạn chợp mắt dưới gốc nấm. Chiều ấy trời ấm, gốc nấm to như cái lọng, đâu đó có tiếng sáo rất khẽ, bạn chỉ định nghỉ một lát. Khi tỉnh dậy, ${X.R(S).ypt * 2} năm đã trôi qua: cây non bên lối đã cao quá đầu, người quen gặp lại cứ nhìn bạn như nhìn ma. Tiếng sáo thì không còn nữa.`, k: 'big', f: X0(S).lore }; } },
    { id: 'ad_frost', st: ['child', 'adult', 'elder'], c: S => X0(S).cold && !S.undead, w: 3, rep: true, gap: 3, run(S, X) { X.add('hl', -7);
        // Lặp được: thơ ấu một giọng, lớn lên hai giọng xen theo năm tuổi.
        return { t: X.stage(S) === 'child' ? 'Mùa đông năm ấy dài nhất trong trí nhớ người già. Tuyết lấp tới bậu cửa, sáng nào người lớn cũng phải xúc mới mở được cửa. Củi cạn từ tháng thứ năm, cả nhà nằm sát vào nhau quanh bếp than cho đỡ rét. Bạn nhớ mãi cái lạnh luồn qua kẽ vách, và hơi ấm của người nằm bên cạnh.'
          : S.age % 2 ? 'Mùa đông dài nhất trong trí nhớ người già. Củi cạn từ tháng thứ năm, người ta dỡ cả hàng rào, cả chiếc ghế gãy đem đốt. Bạn ngủ mặc nguyên áo bông, sáng dậy tóc mai đọng một lớp sương giá. Xuân tới muộn, mà khi tới, cả làng ra đứng giữa nắng như chưa từng thấy nắng.'
          : 'Gió bấc thổi từ cuối thu, tới giữa đông thì sông đóng băng tận đáy. Củi cạn từ tháng thứ năm. Bạn đi bộ nửa ngày lên rừng nhặt từng cành khô, về tới nhà hai bàn tay tê dại không cầm nổi bát. Người già bảo cả đời chưa thấy mùa đông nào dài như thế. Năm nào họ cũng nói vậy, nhưng năm nay thì bạn tin.', k: 'bad' }; } },
    { id: 'ad_tide', st: ['adult', 'elder'], undead: 'any', c: S => G.local(S).raid > .15, w: S => G.local(S).raid * 15, rep: true, gap: 2, run(S, X) {
        const z = X.reg(S).zones[0], p = G.provOfS(S), nest = ((S.world.dyn || {}).lairs || []).find(l => l.lv === 3 && l.empty == null && G.realm.provOf[l.cell] === p), from = nest ? nest.name : z.nameVi, enc = X.rollEncounter(z, { grade: 'normal' });
        if (!enc) return null;
        const rec = X.fight({ ...enc, count: Math.min(5, enc.count + 2) }, false);
        if (S.dead) return null;
        { const k = G.zoneKey(z, G.provOfS(S)); S.world.zonePop[k] = Math.max(.6, (S.world.zonePop[k] ?? 1) - .3); }
        // Lặp được: mỗi kết quả hai giọng xen theo năm tuổi.
        if (rec.win) { S.fame += 2; X.add('so', 4); return { t: S.age % 2 ? `Thú triều từ ${from} tràn xuống lúc chập tối, tiếng chân rầm rập như mưa đá trên mái. Bạn đứng ở cổng làng cùng mấy người cầm giáo, đánh tới khi đợt cuối rút. Sáng ra tay bạn không duỗi thẳng được, mà trẻ con trong làng cứ đứng từ xa nhìn bạn, mắt tròn xoe.`
          : `Mõ báo động gõ dồn: thú triều từ ${from} đang tới. Bạn chạy ra cổng làng, đứng vào chỗ hở nhất trong hàng rào cọc. Đợt này qua đợt khác, tới khi đợt cuối rút về phía rừng thì trời đã hửng sáng. Người trong làng đứng sau rào nhìn ra, lặng im. Rồi có ai đó bắt đầu vỗ tay.`, k: 'big', f: X.factOf(enc.s) }; }
        return { t: S.age % 2 ? `Thú triều từ ${from} tràn xuống giữa đêm. Bạn cố giữ cổng, nhưng chúng đông quá, hàng rào cọc gãy như que củi. Tới sáng, nửa làng đã thành bãi đổ nát, khói bốc lên từ những mái nhà sập. Bạn ngồi giữa đống gỗ vụn, nhìn người ta bới tìm đồ đạc.`
          : `Thú triều từ ${from} phá nửa làng. Lũ quái tràn qua như nước vỡ bờ, bạn bị xô ngã ngay từ đợt đầu, chỉ kịp lăn vào gầm một chiếc xe bò. Khi tiếng gầm xa dần, chuồng trại đã trống trơn, sân giếng ngổn ngang xác thú. Mấy ngày liền cả làng xúm vào dọn, không ai nói nhiều.`, k: 'bad', f: X.factOf(enc.s) }; } },
    { id: 'ad_bounty_post', st: ['adult', 'teen', 'elder'], undead: 'any', c: S => !S.flags.bounty && !!S.zoneSel && (S.work === 'adventurer' || S.undead || S.work === 'hunter'), w: S => G.lawHere(S, 'bounties') ? 6 : 3, rep: true, gap: 2, run(S, X) {
        const z = G.ZONE[S.zoneSel].zone, t = X.encounterTable(z, X.ctier(S), false); if (!t.length) return null;
        const sp = X.wpick(t, 'w').s; S.flags.bounty = { species: sp.id, zone: z.id, reward: Math.round(30 * Math.pow(1 + sp.tier, 2)) };
        // Lặp được: hai giọng xen theo năm tuổi.
        return { t: S.age % 2 ? `Bảng tin Hội có lệnh mới, giấy còn thơm mùi hồ dán: thủ lĩnh ${sp.nameVi} ở ${z.nameVi}. Đám mạo hiểm xúm lại đọc, rồi tản ra dần, chẳng ai vội bóc tờ lệnh xuống. Bạn đứng lại lâu hơn người khác.`
          : `Sáng sớm, bảng tin Hội có thêm một tờ lệnh mới đóng dấu đỏ: thủ lĩnh ${sp.nameVi} ở ${z.nameVi}, tiền thưởng ghi bằng chữ to. Bên dưới có ai đó viết thêm bằng than một chữ nguệch ngoạc: "cẩn thận". Bạn đọc đi đọc lại chữ ấy.`, k: 'info' }; } },
    { id: 'ad_lord', st: ['adult', 'elder'], undead: 'any', c: S => { const R = X0(S); return R.lord && !S.world.lordSeen[R.lord.species] && S.level >= 40; }, w: 4, run(S, X) {
        S.flags.lordQ = { ...X0(S).lord }; return { t: `Mặt đất ở ${X0(S).nameVi} rung lên từng đợt, mấy đêm liền, nước trong chum gợn sóng dù không ai đụng tới. Thú rừng bỏ hang chạy về phía đồng bằng, chim bay thành đàn mà không đậu lại. Người già nhìn về phía núi, nói nhỏ: chúa vùng đang thức. Rồi tất cả quay sang nhìn bạn.`, k: 'big' }; } },
    { id: 'ad_lord_far', st: ['child', 'teen', 'adult', 'elder'], c: S => { const R = X0(S); return R.lord && S.level < 40; }, w: .8, rep: true, gap: 15, run(S, X) {
        // Lặp được (mười lăm năm một lần): hai giọng xen theo năm tuổi.
        const sp = G.B.byId[X0(S).lord.species]; X.add('h', -4); return { t: S.age % 2 ? `${sp.nameVi} nổi lên ở rìa ${X0(S).nameVi}. Tin tới bằng những đoàn người chạy nạn, mặt mũi lem luốc, trên vai gánh những gì còn vớt vát được. Ba làng bị xóa khỏi bản đồ. Người ta đếm xác cả tháng, và suốt tháng ấy ở đây không ai dám nói to.`
          : `Khói đen bốc lên ở rìa ${X0(S).nameVi} ba ngày không tắt: ${sp.nameVi} đã nổi lên. Ba làng bị xóa khỏi bản đồ. Người ta đếm xác cả tháng. Ngoài chợ, người bán người mua chốc chốc lại ngước về phía ấy, như sợ nó quay lại.`, k: 'bad', f: sp.note }; } },
    { id: 'ad_war', st: ['adult'], c: S => G.local(S).war > 0 && !S.undead, w: 6, rep: true, gap: 1, run(S, X) {
        // Lặp được (năm nào còn chiến tranh cũng có thể xảy ra): mỗi kết quả hai giọng xen theo năm tuổi.
        if (['guard', 'adventurer'].includes(S.work) || S.traits.bold > .7) {
          if (X.rnd() > G.clamp(.82 + (X.power(S) - 1) * .1, .6, .97)) { X.die({ id: 'war', text: 'tử trận trong chiến tranh' }); return null; }
          X.gain('Spear', 4); X.gain('Shield', 3); S.fame += 3; X.add('h', -6); X.money(30);
          return { t: S.age % 2 ? 'Bạn bị gọi nhập ngũ, lệnh tới vào một sáng mưa, giấy thấm nước nhòe cả tên. Một mùa hành quân, chân phồng rộp, ăn cơm nguội dưới gầm xe lương. Hai trận đánh mà bạn chỉ nhớ được tiếng tù và và mùi bùn. Bạn về với một vết sẹo, và mấy đồng lương lính.'
            : 'Tên bạn có trong danh sách gọi nhập ngũ dán ở cổng chợ. Một mùa hành quân qua những cánh đồng cháy, đêm nằm trong lều nghe người bên cạnh nói mê gọi tên vợ. Hai trận đánh, một mũi tên lạc sượt qua để lại một vết sẹo. Lúc giải ngũ, bạn nhận mấy đồng lương lính, đứng đếm một lúc rồi mới cất đi.', k: 'big' }; }
        const g = Math.min(Math.max(S.gold, 0), 40); X.money(-g); return { t: S.age % 2 ? `Lính mộ phu về làng, đi từng nhà đọc tên những người còn khỏe. Nhà nào có tiền thì nộp tiền thay người. Bạn nộp ${G.coin(g)} để khỏi đi, đứng nhìn đoàn phu khuất sau đồi, lòng nhẹ đi mà không thấy dễ chịu.`
          : `Lính mộ phu về làng, lần này đông hơn, mặt mày cau có hơn. Có nhà giấu con trong đống rơm, bị lôi ra giữa sân. Bạn nộp ${G.coin(g)} để khỏi đi. Tối ấy cả xóm im phăng phắc, chỉ nghe tiếng khóc từ mấy nhà có người phải lên đường.`, k: 'bad' }; } },
    { id: 'ad_preacher', st: ['teen', 'adult'], c: S => !S.faith && !S.undead && !S.flags.preacher, w: 2, run(S, X) { S.flags.preacher = true; return { t: 'Có người truyền giáo ghé làng, áo vải sờn vai, đôi dép rơm đã mòn vẹt. Người ấy xin ngủ nhờ ở hiên nhà bạn, đổi lại kể chuyện về vị thần của mình. Lũ trẻ ngồi quanh nghe, người lớn đứng xa xa, vờ như không để ý.', k: 'info' }; } },
    { id: 'ad_tourney', st: ['adult', 'teen'], c: S => !S.undead && bestCombat(S) >= 25 && !S.flags.tourney, w: 1.5, rep: true, gap: 4, run(S, X) { S.flags.tourney = true;
        // Lặp được: hai giọng xen theo năm tuổi.
        return { t: S.age % 2 ? 'Sứ giả loan tin: Kinh Đô mở đại hội võ thuật. Người ấy cưỡi ngựa qua chợ, vừa gõ chiêng vừa hô, cả chợ nhốn nháo theo. Đám thanh niên bàn tán tới tận tối, ai cũng tự cho mình có cửa. Bạn không nói gì, chỉ về nhà lôi đồ nghề ra lau lại.'
          : 'Tin theo đoàn xe muối về tới đây: Kinh Đô mở đại hội võ thuật. Ở quán, người ta kể vanh vách tên những nhà vô địch các năm trước, kể cả chuyện ai gãy tay, ai mất mắt. Bạn ngồi nghe, tay bất giác siết lại.', k: 'info' }; } },
    { id: 'ad_restless', st: ['adult'], c: S => !S.flags.migrateQ, w: S => .8 + S.traits.bold + (S.q <= 2 ? 1 : 0) + G.local(S).war * 3 + G.local(S).plague * 3, rep: true, gap: 5, run(S, X) {
        const rs = G.local(S);
        S.flags.migrateQ = rs.war > 0 ? 'Chiến tranh tràn qua quê bạn. Ruộng bỏ hoang, nhà nào còn người thì đêm cũng không dám thắp đèn.' : rs.plague > 0 ? 'Dịch bệnh chưa dứt. Nhiều nhà đã khóa cửa đi, cỏ mọc lên tới bậc thềm.' : true;
        // Lý do theo tình hình quê nhà; không có gì thì hai giọng xen theo năm tuổi. js/story.js có thể nối thêm lá thư của người quen.
        return { t: rs.war > 0 ? 'Chiến tranh tới gần quê bạn: đêm đêm nghe ngựa phi qua ngõ, sáng ra lại thấy thêm một nhà khóa cửa. Chiều chiều bạn hay đứng ở cổng, nhìn về phía đường cái. Ngoài kia có chỗ nào yên hơn không, bạn tự hỏi, và câu hỏi ấy cứ lớn dần.'
          : rs.plague > 0 ? 'Dịch bệnh chưa dứt, tuần nào cũng có thêm một nhà đóng cửa im ỉm. Chiều chiều bạn đứng ở cổng, nhìn về phía đường cái, nơi từng đoàn người gồng gánh lặng lẽ đi qua. Có người ngoái lại nhìn làng, có người không.'
          : S.age % 2 ? 'Ngày nào cũng như ngày nào: cùng con đường ra chợ, cùng những gương mặt ấy, cùng một câu chào. Chiều chiều bạn hay đứng ở cổng, nhìn về phía đường cái. Ngoài kia người ta sống thế nào, bạn tự hỏi, và câu hỏi ấy cứ lớn dần.'
          : 'Một đoàn lái buôn dừng chân trong làng, kể chuyện những vùng đất bên kia núi: chợ đông, đất rộng, ai chịu làm thì không lo đói. Họ đi rồi, câu chuyện vẫn ở lại. Bạn bắt đầu nhìn về phía đường cái lâu hơn trước.', k: 'info' }; } },
    { id: 'ad_kid', st: ['adult', 'elder'], c: S => S.family.kids.some(k => k.alive && k.age >= 8), w: 2, rep: true, gap: 4, run(S, X) {
        const k = X.pick(S.family.kids.filter(k => k.alive && k.age >= 8)), j = X.pick(G.jobs.jobs.filter(j => j.tier === 1));
        // Lặp được: hai giọng xen theo năm tuổi. Câu phải mở bằng "<tên> nói muốn": js/culture.js cắt tên con ở đó.
        X.add('h', 5); return { t: S.age % 2 ? `${k.name} nói muốn làm ${j.nameVi}, nói ngay giữa bữa cơm, mặt nghiêm như người lớn. Cả nhà ngừng đũa. Bạn nhớ hồi mình bằng tuổi ấy cũng từng nói một câu y như thế, chỉ khác cái nghề. Bạn gắp thêm cho nó một miếng, không cười.`
          : `${k.name} nói muốn làm ${j.nameVi}. Cả buổi chiều nó lẽo đẽo theo sau bạn, hỏi đủ thứ: làm nghề ấy có giàu không, có được đi xa không, có nguy hiểm không. Bạn trả lời được câu nào thì trả lời. Tối nằm nghĩ lại, bạn thấy con mình đã lớn hơn mình tưởng.`, k: 'good' }; } },
    { id: 'ad_old_friend', st: ['adult', 'elder'], c: S => !S.undead, w: 2, rep: true, gap: 5, run(S, X) { X.add('so', 6); X.add('h', 4);
        // Lặp được: hai giọng xen theo năm tuổi (js/story.js thay cả câu khi trong dàn có bạn cũ).
        return { t: S.age % 2 ? 'Bạn gặp lại người bạn thơ ấu ở một phiên chợ xa nhà. Có ai đó gọi bạn bằng cái tên mà chỉ lũ bạn hồi nhỏ mới dùng, quay lại thì là người ấy, đã khác đi nhiều mà cười vẫn hở cái răng khểnh. Hai người kéo nhau vào quán, uống tới sáng, kể chuyện trèo cây, chuyện ăn trộm ổi, chuyện ngày xưa ai từng thích ai.'
          : 'Người bạn thơ ấu ghé qua, đứng ngoài cổng gọi to như hồi hai đứa còn rủ nhau đi tắm sông. Bạn chạy ra, nhận không ra, rồi nhận ra. Hai người uống tới sáng. Lúc chia tay mới để ý cả đêm toàn chuyện cũ, chẳng ai hỏi người kia giờ sống ra sao.', k: 'good' }; } },
    // ── Tuổi già ──
    { id: 'el_aches', st: ['elder'], c: S => !S.undead, w: 4, rep: true, gap: 3, run(S, X) { X.add('hl', -6); if (X.chance(.3)) X.cond('frail');
        // Lặp được: ba giọng xoay theo năm tuổi; js/story.js có thể nối thêm người quen ghé thăm.
        return { t: ['Lưng bạn không thẳng được nữa. Sáng nào cũng phải vịn vào thành giường mới ngồi dậy được, đi ra tới giếng đã phải dừng lại thở hai lần. Ai hỏi, bạn bảo là tại trời trở gió.',
          'Lưng bạn không thẳng được nữa. Cây gậy trước kia chỉ dựng ở góc nhà giờ đi đâu cũng phải mang theo, gõ cộc cộc trên đường làng. Lũ trẻ nghe tiếng gậy là biết bạn đang tới.',
          'Đêm trở gió, các khớp xương nhức như có ai lấy dùi mà đục. Bạn nằm nghiêng, nằm ngửa, tư thế nào cũng đau. Sáng ra lưng không thẳng được nữa, phải chống tay lên gối mà đứng dậy.'][S.age % 3], k: 'bad' }; } },
    { id: 'el_memoir', st: ['elder'], c: S => S.sm > 40, w: 2, run(S, X) { X.add('sm', 3); S.fame += 3; return { t: 'Bạn viết hồi ký, ngồi bên bếp lửa suốt một mùa đông, viết chậm, có trang xóa đi viết lại tới năm lần. Xong, bạn đóng thành tập, trao tay mấy người quen. Ba người đọc hết. Một người trả lại tập giấy, mắt đỏ hoe, không nói được câu nào.', k: 'good' }; } },
    { id: 'el_grandkid', st: ['elder'], c: S => S.family.kids.some(k => k.alive && k.age > G.RACES[S.race].adult + 2), w: 3, run(S, X) { X.add('h', 8); X.add('so', 5); return { t: 'Bạn được bế cháu. Đứa bé nhỏ xíu, đỏ hỏn, nặng hơn bạn tưởng, nắm lấy ngón tay bạn chặt tới bất ngờ. Bạn đứng im rất lâu, không dám nhúc nhích, sợ nó tỉnh. Cả nhà bảo nó giống bạn, mà bạn nhìn mãi vẫn chưa thấy giống chỗ nào.', k: 'good' }; } },
    // ── Cơ Nhân ──
    { id: 'con_oil', st: ['child', 'teen', 'adult', 'elder'], c: S => G.RACES[S.race].construct, w: 3, rep: true, gap: 3, run(S, X) { X.add('hl', 5); X.money(-5);
        // Lặp được: hai giọng xen theo năm tuổi.
        return { t: S.age % 2 ? 'Tới kỳ thay dầu khớp gối. Bạn ngồi trên chiếc ghế quen trong xưởng, thợ già tháo nắp khớp, lau sạch lớp dầu cũ đã đen quánh, mùi dầu mới thơm hăng hắc. Tiếng kêu cót két biến mất được một tuần, rồi lại về, như một người bạn khó tính.'
          : 'Khớp gối kêu cót két từ cuối mùa mưa, ai đi ngang cũng ngoái lại nhìn. Bạn dành mấy đồng, ghé xưởng thay dầu. Một tuần sau đó bạn đi lại nhẹ tênh, nhẹ tới mức tự thấy lạ, rồi tiếng cót két lại trở về.', k: 'info' }; } },
    { id: 'con_dream', st: ['adult'], c: S => G.RACES[S.race].construct, w: 1.5, run(S, X) { X.add('sm', 5); return { t: 'Lõi bạn chạy một đoạn mã không ai viết, vào một đêm xưởng đã tắt đèn. Trong đó có tiếng mưa trên mái tôn, một mùi hương bạn chưa từng ngửi, và một gương mặt không quen. Sáng ra thợ đúc kiểm tra, không thấy lỗi gì. Bạn không kể với ai, chỉ lặng lẽ gọi nó là giấc mơ.', k: 'big', f: J.races.construct.lore }; } },
    // ── Bộ Xương ──
    { id: 'sk_flee', st: ['adult', 'elder'], undead: true, w: 4, rep: true, gap: 2, run(S, X) { X.add('h', -4);
        // Lặp được: hai giọng xen theo năm tuổi (js/story.js thay cả câu khi đã quen chủ đoàn).
        return { t: S.age % 2 ? 'Một đoàn lữ khách đang nấu ăn bên vệ đường, thấy bạn bước ra từ bóng cây là bỏ chạy tán loạn, để lại cả nồi cháo đang sôi. Bạn đứng nhìn nồi cháo sủi tăm một lúc lâu. Rồi bạn nhấc nó xuống khỏi bếp, cho khỏi cháy.'
          : 'Có tiếng thét, rồi tiếng chân chạy, rồi chỉ còn tiếng lửa tí tách: đoàn lữ khách ấy bỏ đi nhanh tới mức nồi cháo còn sôi trên bếp. Bạn ngồi xuống bên đống lửa của họ, hơ hai bàn tay xương, dù chẳng còn biết ấm là thế nào.', k: 'bad' }; } },
    { id: 'sk_paladin', st: ['adult', 'elder'], undead: true, w: S => (1 + (S.flags.revealed ? 4 : 0) + (X0(S).faiths.light || 0) / 15) * (G.lawHere(S, 'hunt_undead') ? 3 : G.lawHere(S, 'undead_citizen') ? .2 : 1), rep: true, gap: 2, run(S, X) {
        const p = 1 / (1 + Math.exp(-3 * (X.power(S) - (X.ctier(S) + .6))));
        // Lặp được: thắng hai giọng xen theo năm tuổi. Giữ "Một Thánh Kỵ Sĩ trẻ" và "đánh gãy kiếm": js/story.js tìm hai cụm này.
        if (X.rnd() < p) { S.fame += 3; X.gain('Shield', 2); return { t: S.age % 2 ? 'Một Thánh Kỵ Sĩ trẻ tìm tới, giáp sáng loáng, miệng đọc kinh run run. Đánh thì hăng mà vụng, đường kiếm nào cũng đúng như sách dạy. Bạn đánh gãy kiếm của người ấy, kề nửa lưỡi gãy vào cổ, rồi buông tay cho đi.'
          : 'Một Thánh Kỵ Sĩ trẻ chặn bạn ở ngã ba, một tay cầm thánh huy, một tay cầm kiếm, hô tên vị thần của mình to tới mức chim trên cây bay hết. Ba hiệp. Bạn đánh gãy kiếm của người ấy rồi để người ấy đi.', k: 'big', f: J.faiths.light.blessing }; }
        if (X.chance(.15)) { X.die({ id: 'purge', text: 'bị Thánh Kỵ Sĩ thanh tẩy' }); return null; }
        X.cond('crack'); return { t: 'Thánh Kỵ Sĩ đánh nứt xương sườn bạn. Người này không trẻ, cũng không vụng, thanh kiếm sáng rực chém xuống nghe một tiếng rắc giữa trưa. Bạn lăn xuống vực mới thoát, nằm giữa đám đá vụn nghe tiếng kinh cầu xa dần trên đỉnh dốc.', k: 'bad', f: J.faiths.light.blessing }; } },
    { id: 'sk_call', st: ['adult'], undead: true, w: 3, run(S, X) { X.gain('Necromancy', 6); X.gain('Soul', 3); return { t: 'Đêm trăng non, bạn nghe tiếng gọi từ dưới các nấm mồ. Nghĩa địa lặng tới mức nghe được cả tiếng sương rơi, rồi tiếng gọi ấy vọng lên, không thành lời, như hơi thở của đất. Người sống nghe thấy sẽ bịt tai bỏ chạy. Còn bạn đứng lại, và bạn hiểu nó.', k: 'big', f: J.races.skeleton.lore }; } },
    { id: 'sk_memory', st: ['adult', 'elder'], undead: true, c: S => !!S.flags.pastName, w: 3, rep: true, gap: 4, run(S, X) {
        const last = S.lineage[S.lineage.length - 1]; X.add('h', 4); X.add('sm', 3);
        const frag = X.pick([`một cái tên: ${S.flags.pastName}`, `mùi bánh mì ở ${last ? last.region : 'đâu đó'}`, `tiếng ai đó gọi "${S.flags.pastName.split(' ')[0]}"`, `cách cầm ${last && last.dominant ? G.mv(last.dominant.skill).toLowerCase() : 'vũ khí'} của một người tên ${S.flags.pastName.split(' ')[0]}`]);
        // Lặp được: hai giọng xen theo năm tuổi.
        return { t: S.age % 2 ? `Một mảnh ký ức trồi lên giữa lúc bạn đang đi, không báo trước: ${frag}. Bạn đứng sững lại, cố níu lấy nó. Nó tan đi như khói, chỉ để lại một chỗ ấm ấm trong lồng ngực rỗng.`
          : `Đêm ấy, giữa lúc nhìn ánh lửa của ai đó dưới thung, một mảnh ký ức trồi lên: ${frag}. Chỉ một thoáng thôi, rồi mất. Bạn ngồi yên tới sáng, lặp đi lặp lại nó trong đầu cho khỏi quên.`, k: 'big' }; } },
    { id: 'sk_grave', st: ['adult'], undead: true, c: S => S.lineage.length > 0 && !S.flags.sawGrave, w: 2, run(S, X) {
        const last = S.lineage[S.lineage.length - 1]; S.flags.sawGrave = true; X.add('h', -6);
        return { t: `Bạn tìm thấy một tấm bia ở góc một nghĩa trang bỏ hoang, rêu đã phủ kín một nửa. Bạn cạo lớp rêu bằng đầu ngón xương, từng chữ hiện ra: "${last.name}, ${last.years} tuổi, ${last.cause}". Cái tên ấy bạn không nhớ, mà đọc lên lại thấy quen như tên mình. Bạn đứng đó tới sáng.`, k: 'big' }; } },
    { id: 'sk_fade', st: ['adult', 'elder'], undead: true, w: S => 1 + S.age / 10, rep: true, gap: 3, run(S, X) { X.add('hl', -8); X.add('sm', -3);
        // Lặp được: hai giọng xen theo năm tuổi.
        return { t: S.age % 2 ? 'Lửa hồn trong hốc mắt bạn mờ đi một chút. Cúi nhìn xuống vũng nước, bạn thấy nó chỉ còn leo lét như ngọn đèn sắp cạn dầu. Có những thứ bạn từng nhớ, giờ cố mấy cũng không nhớ ra.'
          : 'Sáng ấy mọi thứ nhòe hơn, màu sắc nhạt đi như vải phơi lâu ngày: lửa hồn trong hốc mắt bạn mờ đi một chút. Bạn ngồi yên, đợi nó sáng lại. Nó không sáng lại.', k: 'bad' }; } },
    { id: 'sk_kin', st: ['adult'], undead: true, w: 2, run(S, X) { X.add('so', 8); return { t: 'Bạn gặp một bộ xương khác đang tìm đầu của mình, cổ trống trơn, lom khom lật từng tảng đá dưới chân đồi. Bạn chẳng có việc gì gấp. Hai người tìm cùng nhau, từ sáng tới chiều, qua ba con suối. Tìm thấy rồi, nó lắp vào, xoay qua xoay lại, rồi gật đầu cảm ơn bạn hơi lâu.', k: 'good' }; } },
    { id: 'sk_child', st: ['adult', 'elder'], undead: true, w: 1.5, run(S, X) { X.add('h', 10); X.add('so', 3);
        // Giữ nguyên câu "Một đứa bé không sợ bạn.": js/story.js chèn tên đứa bé ngay sau câu ấy.
        return { t: 'Bạn đang ngồi nghỉ bên bờ rào cuối làng thì nghe tiếng chân sột soạt. Một đứa bé không sợ bạn. Nó ngồi xổm trước mặt bạn, nghiêng đầu nhìn một lúc lâu, rồi đặt một bông hoa dại vào hốc mắt bạn và chạy đi, vừa chạy vừa cười khanh khách.', k: 'good' }; } },
    { id: 'sk_dark', st: ['adult'], undead: true, c: S => !S.faith && !S.flags.darkOffer, w: 2.5, run(S, X) { S.flags.darkOffer = true; return { t: 'Có ai đó để lại một ngọn nến đen trước chỗ bạn ngủ. Nến đã cháy được nửa, sáp chảy thành vũng trên đá, quanh đó không có lấy một dấu chân. Bạn nhìn ngọn nến rất lâu. Ai đó biết bạn ở đây, và muốn bạn biết rằng họ biết.', k: 'info' }; } },
    { id: 'sk_town', st: ['adult'], undead: true, c: S => !S.flags.townQ && !S.flags.revealed, w: 2, rep: true, gap: 3, run(S, X) { S.flags.townQ = true;
        // Lặp được: hai giọng xen theo năm tuổi.
        return { t: S.age % 2 ? 'Bạn cần dầu, vải và tin tức. Khớp xương khô khốc, kêu ken két mỗi bước, chiếc áo choàng rách thêm một vạt, còn chuyện thế gian thì bạn đã mù tịt từ lâu. Mấy thứ đó chỉ có trong làng.'
          : 'Từ trên đồi nhìn xuống, khói bếp trong làng bốc lên từng sợi mảnh. Dầu bôi khớp đã cạn, áo choàng mỏng tới mức gió lùa qua. Bạn cần dầu, vải và tin tức, mà mấy thứ đó chỉ có dưới kia, giữa người sống.', k: 'info' }; } }
  ];
  const X0 = S => G.REGION[S.loc];

  G.pickEvent = function (X) {
    const S = X.S, st = X.stage(S);
    const list = G.EVENTS.filter(e => {
      if (!e.st.includes(st)) return false;
      if (S.undead ? !e.undead : e.undead === true) return false;
      const last = S.recent[e.id];
      if (last != null && (!e.rep || S.age - last < (e.gap || 1))) return false;
      return !e.c || e.c(S, X);
    });
    const ws = list.map(e => Math.max(0, (typeof e.w === 'function' ? e.w(S, X) : e.w) || 0) * (S.recent[e.id] != null ? .5 : 1)), tot = ws.reduce((a, b) => a + b, 0);
    // Năm yên ả (bước F, docs/07 mục 4.14): sự kiện không lặp dùng hết dần nên về già nhóm đủ điều kiện nhỏ lại; không có ngưỡng này thì
    // sự kiện trọng số nhỏ bị chọn gần như chắc. Tổng dưới G.EVENT_FLOOR thì phần thiếu là không có sự kiện.
    if (tot < G.EVENT_FLOOR && X.rnd() >= tot / G.EVENT_FLOOR) return null;
    let r = X.rnd() * tot;
    for (let i = 0; i < list.length; i++) { r -= ws[i]; if (r <= 0) return list[i]; }
    return list[list.length - 1] || null;
  };
  G.EVENT_FLOOR = 12;
  G.runEvent = function (X, ev) {
    const S = X.S; S.recent[ev.id] = S.age; X._ev = ev.id;
    const r = ev.run(S, X);
    if (r && !S.dead) X.log(r.t, r.k || 'info', r.f || null);
    X._ev = null;
  };
})(window.LifeSim);
