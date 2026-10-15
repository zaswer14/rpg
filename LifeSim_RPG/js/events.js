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
        return { title: 'Đứa trẻ mê điều gì?', body: `Bạn ${X.years(S)} tuổi. Người lớn bắt đầu hỏi bạn muốn theo con đường nào.`,
          fact: J.races[S.race].leaning ? `${J.races[S.race].nameVi}: ${J.races[S.race].leaning.note}` : null,
          choices: opts.map(sc => ({ k: sc, label: J.schools[sc].nameVi, sub: J.schools[sc].masteries.map(G.mv).join(' · ') + (rs.foreign.includes(sc) ? ' — ngoại lai: học chậm, gate +15' : '') })) };
      },
      apply(S, X, k) { S.path = k; X.gain(J.schools[k].masteries[0], 6); return `Bạn bắt đầu tập ${G.mv(J.schools[k].masteries[0]).toLowerCase()}.`; },
      auto(S, X, d) {
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
        const pick = land ? [land, ...shuffled.filter(e => e !== land).slice(0, 2)] : shuffled.slice(0, 3);
        pick.push(['adventurer', G.WORKS.adventurer]);
        return { title: 'Kiếm sống bằng gì?', body: `Bạn đã trưởng thành ở ${home(S, X)}. Thu nhập tính theo phân vị trong vùng (${reg.nameVi}, trung vị ${Math.round(G.median(reg))} bạc/năm).`,
          choices: pick.map(([id, w]) => { const m = G.incomeMult({ ...S, work: id }), fee = G.workFee(S, id);
            return { k: id, label: w.nameVi, sub: w.adventurer ? 'Sống bằng săn quái; thu nhập theo danh vọng; nguy hiểm.' : `Thu nhập ${Math.round(G.incomeAt(reg, w.pct[0]) * m)}–${Math.round(G.incomeAt(reg, w.pct[1]) * m)} bạc/năm sau thuế` + (w.risk > 1.4 ? ' · nguy hiểm' : '') + (fee ? ` · phí phường hội ${fee} bạc` : '') }; }) };
      },
      apply(S, X, k) { const fee = G.workFee(S, k); if (fee) X.money(-fee); S.work = k; S.flags.workQ = false; const w = G.WORKS[k]; if (!w.adventurer) S.pct = Math.max(S.pct * .6, w.pct[0]); return w.adventurer ? 'Bạn ghi tên vào Hội Mạo Hiểm.' : 'Năm đầu học việc, lương thấp.'; },
      auto(S, X, d) {
        const T = S.traits, has = k => d.choices.find(c => c.k === k);
        if (T.bold > .62) return 'adventurer';
        if (T.studious > .6 && (has('scholar') || has('healer'))) return (has('scholar') || has('healer')).k;
        if (T.pious > .65 && has('priest')) return 'priest';
        // Không có thiên hướng rõ: người ở vùng quê, làng, thôn nghiêng về nghề đất (ngoài đời phần lớn dân là nông dân).
        const LAND = ['farmer', 'herder', 'fisher', 'woodcutter', 'miner'], rural = !S.urban || ['village', 'hamlet'].includes((G.here(S).s || {}).tier);
        const rest = d.choices.filter(c => c.k !== 'adventurer');
        return rest.length ? X.wpick(rest, c => rural && LAND.includes(c.k) ? 4 : 1).k : 'adventurer';
      }
    },
    promote: {
      prio: 10, gap: 1,
      when: (S, X) => ['teen', 'adult', 'elder'].includes(X.stage(S)) && G.nextJobs(X).length > 0,
      build(S, X) {
        const list = G.nextJobs(X).slice(0, 3);
        return { title: 'Thử thách chuyển nghề', body: `Nghề hiện tại: ${X.jobName(S)} (Tier ${X.job(S).tier}). Bạn đủ điều kiện dự thử thách.`,
          fact: list[0].job.summary || null,
          choices: [...list.map(e => ({ k: e.job.id, label: `${X.jobName(S, e.job.id)} · T${e.job.tier}`, sub: `${e.job.trial || 'Thử thách'}${e.access === 'foreign' ? ' · ngoại lai' : ''}${e.job.faith ? ' · ' + J.faiths[e.job.faith].nameVi : ''}${e.job.summary ? ' — ' + e.job.summary : ''}` })),
            { k: 'wait', label: 'Chưa phải lúc', sub: 'Luyện thêm một năm.' }] };
      },
      apply(S, X, k) {
        if (k === 'wait') return 'Bạn chờ thêm.';
        const j = G.jobs.byId[k], p = G.clamp(.5 + (X.power(S) - j.tier) * .25 + S.hl / 400, .2, .95);
        if (X.rnd() < p) {
          S.jobHist.push(S.job); S.job = k; S.fame = Math.min(100, S.fame + j.tier * 2); X.add('h', 6);
          return `Vượt qua. Bạn trở thành ${X.jobName(S)}.` + (j.marker ? ` Dấu hiệu nghề: ${j.marker}.` : '');
        }
        X.add('hl', -6); X.add('h', -4);
        return 'Thất bại. Vết bầm sẽ lành; năm sau thử lại.';
      },
      // Ưu tiên nghề cùng trường phái với hướng đi (Bộ Xương: trường phái của kỹ năng kiếp trước).
      // Nghề đúng hướng chưa đủ điều kiện thì chờ tối đa 3 năm (luyện tập sẽ nhắm vào mastery còn thiếu).
      auto(S, X, d) {
        if (S.hl < 30) return 'wait';
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
        return { title: 'Lời cầu hôn', body: `${s.name} (${J.races[s.race].nameVi}, ${s.work}) ngỏ lời muốn chung sống với bạn.`,
          choices: [{ k: 'yes', label: 'Đồng ý', sub: 'Quan hệ và hạnh phúc tăng; có thể có con.' }, { k: 'no', label: 'Từ chối', sub: 'Giữ tự do.' }] };
      },
      apply(S, X, k) {
        const s = S.flags.suitor; S.flags.suitor = null;
        if (k === 'yes') { S.family.spouse = { name: s.name, race: s.race, age: s.age, alive: true }; X.add('h', 12); X.add('so', 10); return 'Đám cưới tổ chức vào mùa gặt.'; }
        X.add('so', -3); return 'Hai người chia tay.';
      },
      auto: (S) => S.traits.social > .25 ? 'yes' : 'no'
    },
    migrate: {
      prio: 4, gap: 4,
      when: (S, X) => S.flags.migrateQ && ['adult', 'elder'].includes(X.stage(S)),
      build(S, X) {
        const adj = G.map.adj[G.map.idx[S.loc]].map(id => G.REGION[id]).sort(() => X.rnd() - .5).slice(0, 3);
        const why = S.flags.migrateQ === true ? 'Bạn nghĩ tới chuyện đi nơi khác.' : S.flags.migrateQ;
        return { title: 'Rời quê?', body: why,
          choices: [...adj.map(r => ({ k: r.id, label: r.nameVi, sub: `${J.biomes[r.biome].nameVi} · giàu ${Math.round(r.wealth * 100)} · khu: ${r.zones.map(z => `T${z.tier[0]}–${z.tier[1]}`).join(' / ')}` })),
            { k: 'stay', label: 'Ở lại', sub: home(S, X) }] };
      },
      apply(S, X, k) { S.flags.migrateQ = null; if (k === 'stay') return 'Bạn ở lại.'; return G.moveTo(X, k); },
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
        return { title: 'Tiệm rèn', body: `Bộ trang bị cấp ${S.gear + 1} giá ${c} bạc. Bạn có ${S.gold}.`,
          choices: [{ k: 'buy', label: 'Mua', sub: 'Sức mạnh +0,05 Tier.' }, { k: 'skip', label: 'Để dành', sub: '' }] };
      },
      apply(S, X, k) { if (k !== 'buy') return null; S.gold -= G.gearCost(S.gear + 1); S.gear++; return `Trang bị ${S.gear}/10.`; },
      auto: (S) => S.gold > G.gearCost(S.gear + 1) * 1.3 ? 'buy' : 'skip'
    },
    bounty: {
      prio: 7, gap: 1,
      when: (S, X) => S.flags.bounty && ['adult', 'elder', 'teen'].includes(X.stage(S)),
      build(S, X) {
        const b = S.flags.bounty, sp = G.B.byId[b.species], z = G.ZONE[b.zone].zone;
        const thr = X.threat({ s: sp, grade: 'alpha', affixes: ['frenzied', 'armored'], count: 1 });
        return { title: 'Lệnh treo thưởng', body: `Hội Mạo Hiểm treo ${b.reward} bạc cho đầu ${sp.nameVi} thủ lĩnh ở ${z.nameVi}. Đe dọa ước tính ${thr.toFixed(1)} Tier; sức bạn ${X.power(S).toFixed(1)}.`,
          fact: `${sp.nameVi}: ${sp.attack}. ${X.factOf(sp)}`,
          choices: [{ k: 'go', label: 'Nhận lệnh', sub: 'Đánh một trận với thủ lĩnh.' }, { k: 'no', label: 'Bỏ qua', sub: '' }] };
      },
      apply(S, X, k) {
        const b = S.flags.bounty; S.flags.bounty = null;
        if (k !== 'go') return null;
        const sp = G.B.byId[b.species], zone = G.ZONE[b.zone].zone;
        const rec = X.fight({ s: sp, grade: 'alpha', affixes: ['frenzied', 'armored'], count: 1, zone });
        if (S.dead) return null;
        if (rec && rec.win) { X.money(b.reward); S.fame = Math.min(100, S.fame + 6); return `Bạn mang đầu nó về. +${b.reward} bạc.`; }
        return 'Thủ lĩnh còn sống.';
      },
      auto(S, X) { const b = S.flags.bounty, sp = G.B.byId[b.species]; return X.power(S) >= X.threat({ s: sp, grade: 'alpha', affixes: ['a', 'b'], count: 1 }) - .1 ? 'go' : 'no'; }
    },
    faith_join: {
      prio: 5, gap: 1,
      when: (S, X) => !S.faith && S.flags.preacher && X.stage(S) !== 'infant',
      build(S, X) {
        const reg = X.reg(S), fs = Object.keys(reg.faiths).filter(f => f !== 'none' && !(J.faiths[f].races.shunned || []).includes(S.race));
        return { title: 'Người truyền giáo', body: 'Một người khách lạ nói về thần của họ suốt bữa tối.',
          choices: [...fs.slice(0, 3).map(f => ({ k: f, label: J.faiths[f].nameVi, sub: J.faiths[f].tenet })), { k: 'no', label: 'Không theo', sub: '' }] };
      },
      apply(S, X, k) { S.flags.preacher = false; if (k === 'no') return null; S.faith = k; S.devotion = 5; return `Bạn theo ${J.faiths[k].nameVi}.` + ((J.faiths[k].races.favored || []).includes(S.race) ? ' Chủng tộc bạn được ưu ái: tích Devotion nhanh gấp rưỡi.' : ''); },
      auto: (S, X, d) => S.traits.pious > .5 ? d.choices[0].k : 'no'
    },
    healer: {
      prio: 8, gap: 1,
      when: (S, X) => !S.undead && S.conds.some(c => G.CONDS[c.id].mult >= 1.5 && G.CONDS[c.id].heal > 0) && S.gold >= 10,
      build(S, X) {
        const c = S.conds.find(c => G.CONDS[c.id].mult >= 1.5 && G.CONDS[c.id].heal > 0), cost = Math.round(G.median(X.reg(S)) * .6);
        return { title: 'Bệnh không dứt', body: `${G.CONDS[c.id].nameVi} hành bạn ${c.years + 1} năm nay.`,
          choices: [{ k: 'pay', label: `Mời thầy thuốc (${cost} bạc)`, sub: '70% khỏi' }, ...(S.faith ? [{ k: 'pray', label: 'Cầu nguyện', sub: `${Math.round((.3 + S.devotion / 200) * 100)}% khỏi` }] : []), { k: 'wait', label: 'Chịu đựng', sub: '' }],
          cond: c.id, cost };
      },
      apply(S, X, k) {
        const P = { cond: S.conds.find(c => G.CONDS[c.id].mult >= 1.5 && G.CONDS[c.id].heal > 0) };
        if (!P.cond || k === 'wait') return null;
        let p = .7;
        if (k === 'pay') X.money(-Math.round(G.median(X.reg(S)) * .6)); else p = .3 + S.devotion / 200;
        if (X.rnd() < p) { S.conds.splice(S.conds.indexOf(P.cond), 1); return 'Bệnh lui.'; }
        return 'Không đỡ.';
      },
      auto: (S, X, d) => d.choices.find(c => c.k === 'pay') && S.gold > G.median(X.reg(S)) ? 'pay' : d.choices[1].k
    },
    retire: {
      prio: 5, gap: 3,
      when: (S, X) => X.stage(S) === 'elder' && S.work === 'adventurer' && !S.flags.retired,
      build: () => ({ title: 'Treo kiếm?', body: 'Gối bạn kêu mỗi sáng. Hội Mạo Hiểm gợi ý vị trí huấn luyện viên.',
        choices: [{ k: 'retire', label: 'Nghỉ hưu', sub: 'Làm thầy dạy; thôi săn.' }, { k: 'go', label: 'Còn đi được', sub: '' }] }),
      apply(S, X, k) { if (k === 'retire') { S.flags.retired = true; S.work = 'scholar'; S.pct = Math.max(S.pct, .4); return 'Bạn dạy kiếm cho lũ trẻ.'; } return null; },
      auto: (S) => S.traits.bold > .8 ? 'go' : 'retire'
    },
    tournament: {
      prio: 4, gap: 3,
      when: (S, X) => S.flags.tourney && ['adult', 'teen'].includes(X.stage(S)),
      build: (S, X) => ({ title: 'Đại hội võ thuật', body: `Kinh Đô Aurel mở giải đấu. Ba vòng; người thắng nhận 200 bạc.`,
        choices: [{ k: 'go', label: 'Ghi danh', sub: `Sức bạn ${X.power(S).toFixed(1)} Tier` }, { k: 'no', label: 'Đứng xem', sub: '' }] }),
      apply(S, X, k) {
        S.flags.tourney = false; if (k !== 'go') return null;
        const ct = X.ctier(S);
        for (let r = 0; r < 3; r++) {
          const p = 1 / (1 + Math.exp(-3 * (X.power(S) - (ct + .4 + r * .3))));
          if (X.rnd() > p) { X.add('hl', -X.int(5, 15)); return `Thua ở vòng ${r + 1}.`; }
          X.gain(X.pick(['Sword', 'Spear', 'Unarmed', 'Axe']), 2);
        }
        X.money(200); S.fame = Math.min(100, S.fame + 10); X.add('h', 10);
        return 'Vô địch. Tên bạn được khắc lên cột đá quảng trường.';
      },
      auto: (S) => S.traits.bold > .5 ? 'go' : 'no'
    },
    reveal: {
      prio: 6, gap: 1,
      when: (S) => S.undead && S.flags.townQ,
      build: (S, X) => ({ title: 'Cổng làng', body: `Bạn đứng trước ${(G.mainSettlement(S.loc) || { name: X.reg(S).nameVi }).name}. Lính canh nhìn chiếc áo choàng của bạn.`,
        choices: [{ k: 'hide', label: 'Trùm kín, giả người hành hương', sub: `Ẩn thân ${Math.round(S.mastery.Stealth)}` }, { k: 'show', label: 'Bỏ mũ trùm', sub: 'Người ta sẽ biết bạn là gì.' }, { k: 'leave', label: 'Quay đi', sub: '' }] }),
      apply(S, X, k) {
        S.flags.townQ = false;
        if (k === 'leave') return 'Bạn ngủ ngoài nghĩa địa như mọi khi.';
        if (k === 'hide') { if (X.rnd() < .45 + S.mastery.Stealth / 150) { X.add('so', 5); X.money(5); return 'Không ai nhận ra. Bạn mua được ít dầu bôi khớp.'; } S.flags.revealed = true; X.add('hl', -10); return 'Một con chó sủa và kéo tuột áo choàng. Bạn chạy.'; }
        S.flags.revealed = true; X.add('so', -5); S.fame += 3; return 'Đám đông im lặng. Rồi có người ném đá.';
      },
      auto: (S) => S.mastery.Stealth > 20 ? 'hide' : 'leave'
    },
    dark_offer: {
      prio: 6, gap: 3,
      when: (S) => S.undead && !S.faith && S.flags.darkOffer,
      build: () => ({ title: 'Sứ giả Hắc Giáo', body: 'Một người áo đen quỳ trước bạn. "Ngài không phải quái vật. Ngài là bằng chứng."',
        fact: J.faiths.dark.tenet,
        choices: [{ k: 'join', label: 'Theo Hắc Giáo', sub: 'Chủng tộc được ưu ái; mở ngọn tín ngưỡng Hắc Giáo.' }, { k: 'no', label: 'Đuổi đi', sub: '' }] }),
      apply(S, X, k) { S.flags.darkOffer = false; if (k !== 'join') return null; S.faith = 'dark'; S.devotion = 20; X.add('so', 8); return 'Bạn có chỗ ngồi trong hầm tế.'; },
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
        if (k !== 'fight') return 'Bạn nhìn nó đi qua từ xa.';
        const sp = G.B.byId[L.species];
        const rec = X.fight({ s: sp, grade: 'lord', affixes: [], count: 1, zone: G.ZONE[L.zone].zone });
        if (S.dead) return null;
        if (rec.win) { S.flags.lordSlayer = sp.nameVi; return `Bạn hạ ${sp.nameVi}. Các thi sĩ sẽ hát về bạn trăm năm.`; }
        return 'Bạn sống sót, không hiểu vì sao.';
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

  // Di chuyển sang vùng khác (dùng cho quyết định và nút trên bản đồ).
  G.moveTo = function (X, regionId) {
    const S = X.S, to = G.REGION[regionId];
    S.loc = regionId;
    // Tới vùng mới: dân thành thị vào khu lớn nhất của vùng; dân quê về vùng quê của một làng / thôn (bốc theo dân quê);
    // vùng không có khu dân cư thì sống ngoài trời.
    const wasRural = S.urban === false, villages = G.settlementsIn(regionId).filter(s => s.tier === 'village' || s.tier === 'hamlet');
    const st = S.undead ? null : wasRural && villages.length ? X.wpick(villages, s => s.rural + 1) : G.mainSettlement(regionId);
    S.home = { region: regionId, settlement: st ? st.id : null };
    S.urban = !!st && !(wasRural && villages.includes(st)) && G.TIER_RANK[st.tier] <= 2;
    S.pos = st ? G.homePos(st, S.urban, X.rnd) : G.map.pointIn(regionId, 0, X.rnd);
    const nat = G.nationAtPos(S.pos[0], S.pos[1]); S.nation = nat ? nat.idx : null;
    S.path2.push(S.pos);
    X.money(-Math.min(Math.max(S.gold, 0), 10));
    if (S.undead) S.flags.townQ = true;
    if (S.work && !S.undead && !G.workOK(S, S.work)) { S.work = null; S.flags.workQ = true; }   // nơi mới không có công trình / vai trò cho nghề cũ
    let txt = `Bạn tới ${st ? st.name + ', ' + to.nameVi : to.nameVi}${nat ? ` (${nat.name})` : ''}.`;
    // Gặp quái dọc đường: khu ven của vùng mới, vẫn chịu luật Tier.
    if (['teen', 'adult', 'elder'].includes(X.stage(S)) && X.chance(.35)) {
      const enc = X.rollEncounter(G.firstZone(regionId));
      if (enc) { const rec = X.fight(enc, false); if (S.dead) return null; txt += rec.win ? ` Dọc đường hạ ${enc.s.nameVi}.` : ` Dọc đường bị ${enc.s.nameVi} tấn công.`; }
    }
    S.zoneManual = false;
    X.ensureZone();
    return txt;
  };

  G.scheduledDecisions = function (X) {
    const S = X.S;
    return Object.entries(G.DECISIONS)
      .filter(([id, D]) => (S.recentDec[id] == null || S.age - S.recentDec[id] >= (D.gap || 1)) && D.when(S, X))
      .sort((a, b) => b[1].prio - a[1].prio).map(([id]) => id);
  };

  // ═════════════════════════ SỰ KIỆN ═════════════════════════
  const RITES = {
    human: ['Lễ trưởng thành: bạn thề trung thành với lãnh chúa trước tượng đá.', 'Shield'],
    elf: ['Lễ trưởng thành: bạn trồng một cây con; nó sẽ sống lâu hơn bạn.', 'Bow'],
    dwarf: ['Lễ trưởng thành: bạn rèn chiếc rìu đầu tiên, cả họ gõ búa chúc mừng.', 'Engineering'],
    orc: ['Lễ trưởng thành: bạn mang về tai một con thú do chính tay mình hạ.', 'Axe'],
    beastfolk: ['Lễ trưởng thành: bạn chạy cùng bầy suốt một đêm trăng tròn.', 'Riding'],
    fae: ['Lễ trưởng thành: bạn đặt tên cho một loài hoa chưa ai đặt tên.', 'Arcane'],
    merfolk: ['Lễ trưởng thành: bạn lặn xuống rạn san hô sâu nhất và mang lên một viên ngọc.', 'Spear'],
    dragonkin: ['Lễ trưởng thành: lần đầu bạn thở ra lửa, cháy sém lông mày ông nội.', 'Fire'],
    construct: ['Hiệu chỉnh lần cuối: thợ đúc tháo nhãn "thử nghiệm" khỏi vỏ bạn.', 'Construct']
  };
  const FIRST_WORDS = ['"mẹ"', '"bánh"', '"không"', '"sói"', '"sáng"', 'một từ không ai hiểu'];

  G.EVENTS = [
    // ── Sơ sinh ──
    { id: 'inf_fever', st: ['infant'], w: S => 6 - S.q, run(S, X) { X.add('hl', -10); if (X.chance(.2)) X.cond('fever'); return { t: 'Bạn sốt ba ngày liền. Mẹ thức trắng bên nôi.', k: 'bad' }; } },
    { id: 'inf_bless', st: ['infant'], c: S => !!S.faith, w: 3, run(S, X) { X.add('hl', 6); return { t: `Một tu sĩ ${J.faiths[S.faith].nameVi} đi ngang qua làng và ban phước cho bạn.`, k: 'good', f: J.faiths[S.faith].tenet }; } },
    { id: 'inf_night', st: ['infant'], w: S => 2 + S.world.regions[S.loc].raid * 6, run(S, X) { const sp = X.monsterIn(X.reg(S).zones[0]); return { t: `Đêm đông, ${sp.nameVi} lảng vảng quanh nhà. Cha cầm đuốc đuổi đi tới sáng.`, k: 'info', f: X.factOf(sp) }; } },
    { id: 'inf_word', st: ['infant'], w: 4, run(S, X) { X.add('h', 4); X.add('sm', 2); return { t: `Từ đầu tiên bạn nói là ${X.pick(FIRST_WORDS)}.`, k: 'good' }; } },
    // ── Thơ ấu ──
    { id: 'ch_river', st: ['child'], c: flesh, w: S => G.REGION[S.loc].coastal ? 4 : 2, run(S, X) {
        if (X.chance(.04)) { X.die({ id: 'drown', text: 'đuối nước khi chơi gần sông' }); return null; }
        X.add('hl', -12); return { t: 'Bạn trượt chân xuống sông. Một người chăn dê kéo bạn lên kịp.', k: 'bad' }; } },
    { id: 'ch_pup', st: ['child', 'teen'], w: 3, run(S, X) { S.flags.pet = X.pick(['sói con', 'cáo con', 'quạ', 'mèo hoang', 'dê núi']); X.add('h', 8); X.gain('Taming', 5); return { t: `Bạn nhặt được một con ${S.flags.pet} bị thương và nuôi nó.`, k: 'good' }; } },
    { id: 'ch_bully', st: ['child'], w: 3, run(S, X) {
        if (S.traits.bold > .55) { X.gain('Unarmed', 4); X.add('so', -2); return { t: 'Lũ trẻ lớn hơn bắt nạt bạn. Bạn đánh lại, chảy máu mũi, nhưng chúng không quay lại.', k: 'info' }; }
        X.add('h', -6); return { t: 'Lũ trẻ lớn hơn bắt nạt bạn suốt mùa hè.', k: 'bad' }; } },
    { id: 'ch_coin', st: ['child', 'teen'], w: 2, run(S, X) { X.money(X.int(2, 8)); X.add('h', 4); return { t: 'Bạn nhặt được mấy đồng bạc cũ dưới chân cầu.', k: 'good' }; } },
    { id: 'ch_knight', st: ['child'], w: 3, run(S, X) {
        const j = X.pick(G.jobs.jobs.filter(j => j.tier >= 2 && j.tier <= 4 && !j.race && !j.faith));
        S.flags.inspired = j.school; X.gain(J.schools[j.school].masteries[0], 3);
        return { t: `Một ${j.nameVi} ghé quán trọ trong làng. Bạn theo sau suốt ba ngày.`, k: 'info', f: j.summary || null }; } },
    { id: 'ch_letters', st: ['child', 'teen'], w: S => 1 + S.q * .6, run(S, X) { X.add('sm', 8); return { t: 'Một tu sĩ già dạy bạn đọc chữ bằng cách vạch lên cát.', k: 'good' }; } },
    { id: 'ch_raid', st: ['child', 'teen', 'adult'], c: S => !S.undead, w: S => 1 + S.world.regions[S.loc].raid * 12, rep: true, gap: 3, run(S, X) {
        const z = X.reg(S).zones[0], sp = X.monsterIn(z);
        X.add('hl', -X.int(4, 12)); X.add('h', -5);
        const sib = S.family.sibs.find(s => s.alive);
        if (sib && X.chance(.08)) { sib.alive = false; X.add('h', -15); return { t: `${sp.nameVi} từ ${z.nameVi} tràn vào làng. ${sib.name} không chạy kịp.`, k: 'bad', f: X.factOf(sp) }; }
        return { t: `${sp.nameVi} từ ${z.nameVi} tràn vào làng. Cả nhà trốn trong hầm rượu tới sáng.`, k: 'bad', f: X.factOf(sp) }; } },
    { id: 'ch_festival', st: ['child', 'teen', 'adult'], c: S => !S.undead, w: 3, rep: true, gap: 4, run(S, X) { X.add('h', 6); X.add('so', 4); return { t: `Lễ hội mùa gặt ở ${home(S, X)}. Bạn nhảy tới khi đèn lồng tắt.`, k: 'good' }; } },
    { id: 'ch_lost', st: ['child'], w: 2, run(S, X) { const z = X.reg(S).zones[0]; X.gain('Stealth', 3); X.add('h', -3); return { t: `Bạn lạc trong ${z.nameVi} một đêm. Sáng ra bạn tự tìm được đường về.`, k: 'info' }; } },
    { id: 'ch_spark', st: ['child', 'teen'], w: S => (S.flags.omen ? 6 : 0) + X0(S).magic * 2, run(S, X) {
        const asp = S.flags.omen || X.pick(['fire', 'frost', 'storm', 'arcane']), m = { fire: 'Fire', frost: 'Frost', storm: 'Lightning', moon: 'Arcane', light: 'Spirit', dark: 'Curse', arcane: 'Arcane' }[asp];
        X.gain(m, 6); return { t: `Ngọn nến trước mặt bạn tự đổi màu. Người lớn im lặng nhìn nhau.`, k: 'big', f: `${J.aspects[asp].nameVi}: ${J.aspects[asp].hook}` }; } },
    { id: 'ch_hunger', st: ['child', 'teen', 'adult'], c: S => S.q <= 2 && flesh(S), w: S => (1 - X0(S).wealth) * 4, rep: true, gap: 4, run(S, X) { X.add('hl', -8); X.add('h', -6); return { t: 'Năm mất mùa. Cả nhà ăn cháo loãng tới mùa xuân.', k: 'bad' }; } },
    // ── Thiếu niên ──
    { id: 'tn_love', st: ['teen'], c: flesh, w: 4, run(S, X) { X.add('h', 7); X.add('so', 5); return { t: `Mối tình đầu với ${X.name(S.race, X.chance(.5) ? 'm' : 'f').split(' ')[0]} kéo dài đúng một mùa hè.`, k: 'good' }; } },
    { id: 'tn_apprentice', st: ['teen'], c: S => !S.undead, w: 3, run(S, X) {
        const id = X.pick(['smith', 'healer', 'hunter', 'guard', 'herder']), w = G.WORKS[id];
        for (const [m, v] of Object.entries(w.trains)) X.gain(m, v * 2);
        return { t: `Bạn học việc ${w.nameVi.toLowerCase()} một năm.`, k: 'info' }; } },
    { id: 'tn_brawl', st: ['teen', 'adult'], c: S => !S.undead, w: S => S.traits.bold * 3, rep: true, gap: 3, run(S, X) { X.gain('Unarmed', 4); X.add('hl', -5); return { t: 'Ẩu đả ở quán rượu. Bạn mất một chiếc răng và được một người bạn.', k: 'info' }; } },
    { id: 'tn_runaway', st: ['teen'], c: S => S.h < 40 && flesh(S), w: 3, run(S, X) { X.gain('Stealth', 4); X.add('so', -6); return { t: 'Bạn bỏ nhà đi ba tháng rồi quay về, gầy rộc.', k: 'bad' }; } },
    { id: 'tn_first_hunt', st: ['teen'], c: S => !S.undead, w: 4, run(S, X) { const sp = X.monsterIn(X.reg(S).zones[0]); X.gain('Throwing', 3); X.gain('Bow', 2); X.addXp(40); return { t: `Lần đầu đi săn: bạn hạ một ${sp.nameVi} ở ${X.reg(S).zones[0].nameVi}.`, k: 'good', f: X.factOf(sp) }; } },
    { id: 'tn_rite', st: ['teen'], c: S => !!RITES[S.race], w: 6, run(S, X) { const [t, m] = RITES[S.race]; X.gain(m, 6); X.add('so', 5); return { t, k: 'big', f: J.races[S.race].lore }; } },
    { id: 'tn_tourney_watch', st: ['teen', 'child'], c: S => kind(S) === 'capital', w: 3, run(S, X) { X.add('h', 5); S.flags.inspired = 'combat'; return { t: 'Bạn chen lên hàng đầu xem giải đấu ở Kinh Đô. Tiếng kiếm chạm nhau theo bạn vào giấc ngủ.', k: 'good' }; } },
    // ── Trưởng thành ──
    { id: 'ad_harvest', st: ['adult', 'elder'], c: S => ['farmer', 'herder'].includes(S.work), w: 5, rep: true, gap: 2, run(S, X) {
        const g = Math.round(G.median(X.reg(S)) * (X.chance(.5) ? .4 : -.3)); X.money(g);
        return g > 0 ? { t: `Được mùa. Bạn bán thêm ${g} bạc.`, k: 'good' } : { t: `Mất mùa; bạn lỗ ${-g} bạc.`, k: 'bad' }; } },
    { id: 'ad_bandits', st: ['adult', 'elder'], w: S => 1 + X0(S).danger * 3 + X0(S).gini * 2, rep: true, gap: 3, run(S, X) {
        if (X.power(S) > 1.1 + X.rnd()) { X.money(X.int(10, 40)); S.fame += 1; return { t: 'Cướp chặn đường. Bạn đánh đuổi chúng và lấy luôn túi tiền của tên cầm đầu.', k: 'good' }; }
        const loss = Math.min(Math.max(0, S.gold), X.int(10, 60)); X.money(-loss); X.add('hl', -X.int(3, 12));
        if (X.chance(.01)) { X.die({ id: 'bandit', text: 'bị cướp đường giết' }); return null; }
        return { t: `Cướp chặn đường lấy ${loss} bạc.`, k: 'bad' }; } },
    { id: 'ad_inherit', st: ['adult'], c: S => !S.undead, w: .6, run(S, X) { const g = X.int(30, 200); X.money(g); return { t: `Một người họ xa bạn chưa gặp bao giờ để lại ${g} bạc.`, k: 'good' }; } },
    { id: 'ad_trinket', st: ['adult', 'elder'], w: S => .5 + X0(S).magic * 2, run(S, X) {
        if (X.chance(.4 + X0(S).magic * .2)) { X.cond('curse'); return { t: 'Bạn mua chiếc nhẫn bạc ở chợ đêm. Từ hôm đó bạn mơ cùng một giấc mơ.', k: 'bad' }; }
        S.gear = Math.min(10, S.gear + 1); return { t: 'Món đồ cũ mua rẻ ở chợ đêm hóa ra là đồ tốt.', k: 'good' }; } },
    { id: 'ad_dragon_sky', st: ['child', 'teen', 'adult', 'elder'], undead: 'any', c: S => ['storm_spire', 'ash_peak', 'serpent_bay', 'abyss_rift'].includes(X0(S).biome), w: 2, rep: true, gap: 6, run(S, X) {
        const R = X.reg(S), sp = R.lord ? G.B.byId[R.lord.species] : G.B.byId['sky_wyvern'];
        X.add('h', -2); return { t: `Bóng ${sp.nameVi} lướt qua bầu trời ${R.nameVi}. Chim ngừng hót cả buổi.`, k: 'info', f: `${sp.nameVi}: ${sp.attack}.` }; } },
    { id: 'ad_guild', st: ['adult'], c: S => S.work === 'adventurer' && S.fame >= 15 && !S.flags['rank' + Math.floor(S.fame / 15)], w: 6, run(S, X) {
        const r = Math.floor(S.fame / 15); S.flags['rank' + r] = true; const names = ['Đồng', 'Sắt', 'Bạc', 'Vàng', 'Bạch Kim', 'Huyền Thoại', 'Huyền Thoại'];
        X.add('so', 5); X.money(r * 20); return { t: `Hội Mạo Hiểm nâng bạn lên hạng ${names[r - 1] || 'Huyền Thoại'}.`, k: 'big' }; } },
    { id: 'ad_companion', st: ['adult'], c: S => !S.flags.companion && ['adventurer', 'hunter'].includes(S.work), w: 3, run(S, X) {
        const race = X.pick(Object.keys(G.RACES).filter(r => r !== 'skeleton')); S.flags.companion = { name: X.name(race, X.chance(.5) ? 'm' : 'f'), race };
        X.add('so', 8); return { t: `Bạn lập đội với ${S.flags.companion.name} (${J.races[race].nameVi}).`, k: 'good' }; } },
    { id: 'ad_companion_lost', st: ['adult', 'elder'], undead: 'any', c: S => !!S.flags.companion, w: 1.5, run(S, X) {
        const c = S.flags.companion; S.flags.companion = null; X.add('h', -15); X.add('so', -8);
        return { t: `${c.name} không trở về sau một chuyến đi một mình.`, k: 'bad' }; } },
    { id: 'ad_suitor', st: ['adult'], c: S => flesh(S) && !(S.family.spouse && S.family.spouse.alive) && !S.flags.suitor, w: S => 2 + S.so / 20 + S.traits.social * 3, rep: true, gap: 2, run(S, X) {
        const race = X.chance(.8) ? S.race : X.wkey(X.reg(S).races); const rr = G.RACES[race];
        if (rr.construct) return null;
        S.flags.suitor = { name: X.name(race, X.chance(.5) ? 'm' : 'f'), race, work: G.WORKS[X.pick(Object.keys(G.WORKS))].nameVi.toLowerCase(), age: X.years(S) + X.int(-4, 4) };
        return { t: `Bạn hay gặp ${S.flags.suitor.name} ở giếng làng.`, k: 'info' }; } },
    { id: 'ad_tax', st: ['adult', 'elder'], c: S => !S.undead && S.gold > 20, w: 2, rep: true, gap: 3, run(S, X) { const t = Math.round(S.gold * .15); X.money(-t); X.add('h', -3); return { t: `Lãnh chúa tăng thuế chiến tranh. Bạn nộp ${t} bạc.`, k: 'bad' }; } },
    { id: 'ad_dice', st: ['adult', 'teen'], c: S => S.gold > 10, w: S => 1 + S.traits.bold, rep: true, gap: 2, run(S, X) { const g = Math.round(Math.min(S.gold, 30) * (X.chance(.45) ? 1 : -1)); X.money(g); return { t: g > 0 ? `Đánh xúc xắc thắng ${g} bạc.` : `Đánh xúc xắc thua ${-g} bạc.`, k: g > 0 ? 'good' : 'bad' }; } },
    { id: 'ad_map', st: ['adult'], c: S => !S.flags.map, w: 1.2, run(S, X) { S.flags.map = true; return { t: 'Một lão say rượu bán cho bạn tấm bản đồ kho báu với giá một vại bia.', k: 'info' }; } },
    { id: 'ad_map_found', st: ['adult', 'elder'], undead: 'any', c: S => S.flags.map === true && (S.focusTime.adventure || 0) > 0, w: 5, run(S, X) { S.flags.map = 'used'; const g = X.int(80, 300); X.money(g); S.gear = Math.min(10, S.gear + 1); return { t: `Tấm bản đồ là thật. Bạn đào được ${g} bạc và một thanh kiếm cũ.`, k: 'big' }; } },
    { id: 'ad_prophet', st: ['adult'], w: 1, run(S, X) { const lt = X.lt(S); const y = Math.round((lt.leT + X.gauss() * 6) * X.R(S).ypt); return { t: `Bà đồng mù nắm tay bạn: "Ngươi sẽ chết năm ${y} tuổi." Bà ấy nói câu đó với mọi người.`, k: 'info' }; } },
    { id: 'ad_mine', st: ['adult'], c: S => S.work === 'miner' || X0(S).id === 'thach_lam', w: S => S.work === 'miner' ? 3 : .6, rep: true, gap: 4, run(S, X) {
        if (X.chance(S.work === 'miner' ? .04 : .015)) { X.die({ id: 'mine', text: 'sập hầm mỏ' }); return null; }
        X.add('hl', -10); return { t: 'Một đoạn hầm sập sau lưng bạn. Bạn mất ba ngày đào đường ra.', k: 'bad' }; } },
    { id: 'ad_sea_storm', st: ['adult', 'elder'], c: S => ['fisher', 'sailor'].includes(S.work), w: 3, rep: true, gap: 3, run(S, X) {
        if (X.chance(.05)) { X.die({ id: 'drown', text: 'đắm thuyền trong bão' }); return null; }
        X.add('hl', -8); return { t: 'Bão lật thuyền. Bạn bám mảnh ván suốt một đêm.', k: 'bad' }; } },
    { id: 'ad_sandstorm', st: ['child', 'teen', 'adult', 'elder'], undead: 'any', c: S => X0(S).biome === 'red_desert', w: 3, rep: true, gap: 3, run(S, X) { X.add('hl', -6); return { t: 'Bão cát đỏ ba ngày. Khi tạnh, một ngôi đền cổ lộ ra rồi lại bị vùi.', k: 'info', f: X0(S).lore }; } },
    { id: 'ad_volcano', st: ['child', 'teen', 'adult', 'elder'], undead: 'any', c: S => X0(S).biome === 'ash_peak', w: 1.5, rep: true, gap: 8, run(S, X) { X.add('hl', -8); S.world.regions[S.loc].raid += .4; return { t: 'Núi phun tro. Quái từ miệng núi chạy xuống sườn.', k: 'bad', f: X0(S).lore }; } },
    { id: 'ad_fae_sleep', st: ['teen', 'adult'], c: S => X0(S).biome === 'fae_glade' && !S.undead, w: 1.2, run(S, X) { S.age += 1; S.world.year += X.R(S).ypt; return { t: `Bạn chợp mắt dưới gốc nấm. Khi tỉnh dậy, ${X.R(S).ypt * 2} năm đã trôi qua.`, k: 'big', f: X0(S).lore }; } },
    { id: 'ad_frost', st: ['child', 'adult', 'elder'], c: S => X0(S).cold && !S.undead, w: 3, rep: true, gap: 3, run(S, X) { X.add('hl', -7); return { t: 'Mùa đông dài nhất trong trí nhớ người già. Củi cạn từ tháng thứ năm.', k: 'bad' }; } },
    { id: 'ad_tide', st: ['adult', 'elder'], undead: 'any', c: S => S.world.regions[S.loc].raid > .15, w: S => S.world.regions[S.loc].raid * 15, rep: true, gap: 2, run(S, X) {
        const z = X.reg(S).zones[0], enc = X.rollEncounter(z, { grade: 'normal' });
        if (!enc) return null;
        const rec = X.fight({ ...enc, count: Math.min(5, enc.count + 2) }, false);
        if (S.dead) return null;
        S.world.zonePop[z.id] = Math.max(.6, S.world.zonePop[z.id] - .3);
        if (rec.win) { S.fame += 2; X.add('so', 4); return { t: `Thú triều từ ${z.nameVi}. Bạn đứng ở cổng làng tới khi đợt cuối rút.`, k: 'big', f: X.factOf(enc.s) }; }
        return { t: `Thú triều từ ${z.nameVi} phá nửa làng.`, k: 'bad', f: X.factOf(enc.s) }; } },
    { id: 'ad_bounty_post', st: ['adult', 'teen', 'elder'], undead: 'any', c: S => !S.flags.bounty && !!S.zoneSel && (S.work === 'adventurer' || S.undead || S.work === 'hunter'), w: S => G.lawHere(S, 'bounties') ? 6 : 3, rep: true, gap: 2, run(S, X) {
        const z = G.ZONE[S.zoneSel].zone, t = X.encounterTable(z, X.ctier(S), false); if (!t.length) return null;
        const sp = X.wpick(t, 'w').s; S.flags.bounty = { species: sp.id, zone: z.id, reward: Math.round(30 * Math.pow(1 + sp.tier, 2)) };
        return { t: `Bảng tin Hội có lệnh mới: thủ lĩnh ${sp.nameVi} ở ${z.nameVi}.`, k: 'info' }; } },
    { id: 'ad_lord', st: ['adult', 'elder'], undead: 'any', c: S => { const R = X0(S); return R.lord && !S.world.lordSeen[R.lord.species] && S.level >= 40; }, w: 4, run(S, X) {
        S.flags.lordQ = { ...X0(S).lord }; return { t: `Mặt đất ở ${X0(S).nameVi} rung. Chúa vùng đang thức.`, k: 'big' }; } },
    { id: 'ad_lord_far', st: ['child', 'teen', 'adult', 'elder'], c: S => { const R = X0(S); return R.lord && S.level < 40; }, w: .8, rep: true, gap: 15, run(S, X) {
        const sp = G.B.byId[X0(S).lord.species]; X.add('h', -4); return { t: `${sp.nameVi} nổi lên ở rìa ${X0(S).nameVi}. Ba làng bị xóa khỏi bản đồ. Người ta đếm xác cả tháng.`, k: 'bad', f: sp.note }; } },
    { id: 'ad_war', st: ['adult'], c: S => S.world.regions[S.loc].war > 0 && !S.undead, w: 6, rep: true, gap: 1, run(S, X) {
        if (['guard', 'adventurer'].includes(S.work) || S.traits.bold > .7) {
          if (X.rnd() > G.clamp(.82 + (X.power(S) - 1) * .1, .6, .97)) { X.die({ id: 'war', text: 'tử trận trong chiến tranh' }); return null; }
          X.gain('Spear', 4); X.gain('Shield', 3); S.fame += 3; X.add('h', -6); X.money(30);
          return { t: 'Bạn bị gọi nhập ngũ. Một mùa hành quân, hai trận đánh, một vết sẹo.', k: 'big' }; }
        const g = Math.min(Math.max(S.gold, 0), 40); X.money(-g); return { t: `Lính mộ phu về làng. Bạn nộp ${g} bạc để khỏi đi.`, k: 'bad' }; } },
    { id: 'ad_preacher', st: ['teen', 'adult'], c: S => !S.faith && !S.undead && !S.flags.preacher, w: 2, run(S, X) { S.flags.preacher = true; return { t: 'Có người truyền giáo ghé làng.', k: 'info' }; } },
    { id: 'ad_tourney', st: ['adult', 'teen'], c: S => !S.undead && bestCombat(S) >= 25 && !S.flags.tourney, w: 1.5, rep: true, gap: 4, run(S, X) { S.flags.tourney = true; return { t: 'Sứ giả loan tin: Kinh Đô mở đại hội võ thuật.', k: 'info' }; } },
    { id: 'ad_restless', st: ['adult'], c: S => !S.flags.migrateQ, w: S => .8 + S.traits.bold + (S.q <= 2 ? 1 : 0) + S.world.regions[S.loc].war * 3 + S.world.regions[S.loc].plague * 3, rep: true, gap: 5, run(S, X) {
        const rs = S.world.regions[S.loc];
        S.flags.migrateQ = rs.war > 0 ? 'Chiến tranh tràn qua quê bạn.' : rs.plague > 0 ? 'Dịch bệnh chưa dứt. Nhiều nhà đã khóa cửa đi.' : true;
        return { t: 'Bạn bắt đầu nhìn về phía đường cái.', k: 'info' }; } },
    { id: 'ad_kid', st: ['adult', 'elder'], c: S => S.family.kids.some(k => k.alive && k.age >= 8), w: 2, rep: true, gap: 4, run(S, X) {
        const k = X.pick(S.family.kids.filter(k => k.alive && k.age >= 8)), j = X.pick(G.jobs.jobs.filter(j => j.tier === 1));
        X.add('h', 5); return { t: `${k.name} nói muốn làm ${j.nameVi}.`, k: 'good' }; } },
    { id: 'ad_old_friend', st: ['adult', 'elder'], c: S => !S.undead, w: 2, rep: true, gap: 5, run(S, X) { X.add('so', 6); X.add('h', 4); return { t: 'Bạn gặp lại người bạn thơ ấu. Hai người uống tới sáng.', k: 'good' }; } },
    // ── Tuổi già ──
    { id: 'el_aches', st: ['elder'], c: S => !S.undead, w: 4, rep: true, gap: 3, run(S, X) { X.add('hl', -6); if (X.chance(.3)) X.cond('frail'); return { t: 'Lưng bạn không thẳng được nữa.', k: 'bad' }; } },
    { id: 'el_memoir', st: ['elder'], c: S => S.sm > 40, w: 2, run(S, X) { X.add('sm', 3); S.fame += 3; return { t: 'Bạn viết hồi ký. Ba người đọc; một người khóc.', k: 'good' }; } },
    { id: 'el_grandkid', st: ['elder'], c: S => S.family.kids.some(k => k.alive && k.age > G.RACES[S.race].adult + 2), w: 3, run(S, X) { X.add('h', 8); X.add('so', 5); return { t: 'Bạn được bế cháu.', k: 'good' }; } },
    // ── Cơ Nhân ──
    { id: 'con_oil', st: ['child', 'teen', 'adult', 'elder'], c: S => G.RACES[S.race].construct, w: 3, rep: true, gap: 3, run(S, X) { X.add('hl', 5); X.money(-5); return { t: 'Thay dầu khớp gối. Tiếng kêu cót két biến mất một tuần.', k: 'info' }; } },
    { id: 'con_dream', st: ['adult'], c: S => G.RACES[S.race].construct, w: 1.5, run(S, X) { X.add('sm', 5); return { t: 'Lõi bạn chạy một đoạn mã không ai viết. Bạn gọi nó là giấc mơ.', k: 'big', f: J.races.construct.lore }; } },
    // ── Bộ Xương ──
    { id: 'sk_flee', st: ['adult', 'elder'], undead: true, w: 4, rep: true, gap: 2, run(S, X) { X.add('h', -4); return { t: 'Một đoàn lữ khách thấy bạn và bỏ chạy, để lại cả nồi cháo đang sôi.', k: 'bad' }; } },
    { id: 'sk_paladin', st: ['adult', 'elder'], undead: true, w: S => (1 + (S.flags.revealed ? 4 : 0) + (X0(S).faiths.light || 0) / 15) * (G.lawHere(S, 'hunt_undead') ? 3 : G.lawHere(S, 'undead_citizen') ? .2 : 1), rep: true, gap: 2, run(S, X) {
        const p = 1 / (1 + Math.exp(-3 * (X.power(S) - (X.ctier(S) + .6))));
        if (X.rnd() < p) { S.fame += 3; X.gain('Shield', 2); return { t: 'Một Thánh Kỵ Sĩ trẻ tìm tới. Bạn đánh gãy kiếm của anh ta rồi để anh ta đi.', k: 'big', f: J.faiths.light.blessing }; }
        if (X.chance(.15)) { X.die({ id: 'purge', text: 'bị Thánh Kỵ Sĩ thanh tẩy' }); return null; }
        X.cond('crack'); return { t: 'Thánh Kỵ Sĩ đánh nứt xương sườn bạn. Bạn lăn xuống vực mới thoát.', k: 'bad', f: J.faiths.light.blessing }; } },
    { id: 'sk_call', st: ['adult'], undead: true, w: 3, run(S, X) { X.gain('Necromancy', 6); X.gain('Soul', 3); return { t: 'Đêm trăng non, bạn nghe tiếng gọi từ dưới các nấm mồ. Bạn hiểu nó.', k: 'big', f: J.races.skeleton.lore }; } },
    { id: 'sk_memory', st: ['adult', 'elder'], undead: true, c: S => !!S.flags.pastName, w: 3, rep: true, gap: 4, run(S, X) {
        const last = S.lineage[S.lineage.length - 1]; X.add('h', 4); X.add('sm', 3);
        const frag = X.pick([`một cái tên: ${S.flags.pastName}`, `mùi bánh mì ở ${last ? last.region : 'đâu đó'}`, `tiếng ai đó gọi "${S.flags.pastName.split(' ')[0]}"`, `cách cầm ${last && last.dominant ? G.mv(last.dominant.skill).toLowerCase() : 'vũ khí'} của một người tên ${S.flags.pastName.split(' ')[0]}`]);
        return { t: `Một mảnh ký ức trồi lên: ${frag}.`, k: 'big' }; } },
    { id: 'sk_grave', st: ['adult'], undead: true, c: S => S.lineage.length > 0 && !S.flags.sawGrave, w: 2, run(S, X) {
        const last = S.lineage[S.lineage.length - 1]; S.flags.sawGrave = true; X.add('h', -6);
        return { t: `Bạn tìm thấy một tấm bia: "${last.name}, ${last.years} tuổi, ${last.cause}". Bạn đứng đó tới sáng.`, k: 'big' }; } },
    { id: 'sk_fade', st: ['adult', 'elder'], undead: true, w: S => 1 + S.age / 10, rep: true, gap: 3, run(S, X) { X.add('hl', -8); X.add('sm', -3); return { t: 'Lửa hồn trong hốc mắt bạn mờ đi một chút.', k: 'bad' }; } },
    { id: 'sk_kin', st: ['adult'], undead: true, w: 2, run(S, X) { X.add('so', 8); return { t: 'Bạn gặp một bộ xương khác đang tìm đầu của mình. Hai người tìm cùng nhau.', k: 'good' }; } },
    { id: 'sk_child', st: ['adult', 'elder'], undead: true, w: 1.5, run(S, X) { X.add('h', 10); X.add('so', 3); return { t: 'Một đứa bé không sợ bạn. Nó đặt một bông hoa dại vào hốc mắt bạn rồi chạy đi.', k: 'good' }; } },
    { id: 'sk_dark', st: ['adult'], undead: true, c: S => !S.faith && !S.flags.darkOffer, w: 2.5, run(S, X) { S.flags.darkOffer = true; return { t: 'Có ai đó để lại một ngọn nến đen trước chỗ bạn ngủ.', k: 'info' }; } },
    { id: 'sk_town', st: ['adult'], undead: true, c: S => !S.flags.townQ && !S.flags.revealed, w: 2, rep: true, gap: 3, run(S, X) { S.flags.townQ = true; return { t: 'Bạn cần dầu, vải và tin tức. Mấy thứ đó chỉ có trong làng.', k: 'info' }; } }
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
    return X.wpick(list, e => (typeof e.w === 'function' ? e.w(S, X) : e.w) * (S.recent[e.id] != null ? .5 : 1));
  };
  G.runEvent = function (X, ev) {
    const S = X.S; S.recent[ev.id] = S.age;
    const r = ev.run(S, X);
    if (r && !S.dead) X.log(r.t, r.k || 'info', r.f || null);
  };
})(window.LifeSim);
