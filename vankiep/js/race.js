/* Vạn Kiếp — TUỔI THỌ, TẬP TỤC GIỐNG LOÀI, NHẬN THỨC (docs/11; người dùng yêu cầu 16/10/2026).
 *   Tuổi thọ, tuổi trưởng thành chuẩn theo các dòng RPG, truyện: data/world.js G.RACES (le, adult, ypt).
 *   Rèn theo năm: một lượt là ypt năm, nên điểm rèn mỗi lượt nhân ypt (trước đây tính theo lượt, tiên tộc một lượt 5 năm mà rèn như người một năm).
 *   Tập tục (G.CUSTOMS): giống loài trường thọ phải giữ tập tục chiếm phần lớn thời gian (Mộng Rừng, phục dịch thị tộc, ngủ đông…),
 *     và sống chậm hơn (pace) nên mỗi năm rèn ít hơn người. Giữ tập tục: cả đời rèn chừng 1,1–1,2 lần người. Bỏ tập tục (cv_custom): rèn
 *     nhanh gấp đôi, nhưng tuổi thọ tụt (tập tục nuôi tuổi thọ của tộc), mỗi lượt mất Tâm trạng, Quan hệ, có lúc bị tộc ruồng bỏ.
 *   Nhận thức (G.mindF): trẻ con rèn chậm. Độ chín theo tuổi so với tuổi trưởng thành của giống loài (ấu niên loài trường thọ dài hơn),
 *     nhân thêm Hiểu biết.
 * Trạng thái: S.flags.custom = 'keep' | 'lax' (chưa hỏi thì coi là giữ), S.flags.customY (năm đổi lần cuối), S.flags.outcast.
 */
window.LifeSim = window.LifeSim || {};
(function (G) {
  const DEC = G.DECISIONS;
  const cnt = (S, k, v = 1) => { S.flags[k] = (S.flags[k] || 0) + v; };

  // share: phần thời gian dành cho tập tục; pace: nhịp sống (một năm của loài này rèn được bao nhiêu so với một năm của người);
  // laxShare: phần còn giữ khi bỏ tập tục; laxLife: tuổi thọ × này khi bỏ.
  G.CUSTOMS = {
    elf:       { id: 'dream',   nameVi: 'Mộng Rừng',          share: .6,  pace: .38, laxShare: .15, laxLife: .6,  d: 'Mỗi năm Tiên Tộc ngồi thiền nhiều tháng dưới cây mẹ, chung một giấc mơ với cả tộc. Giấc mơ ấy nuôi tuổi thọ của họ.' },
    dwarf:     { id: 'clan',    nameVi: 'Phục dịch thị tộc',  share: .4,  pace: .5,  laxShare: .1,  laxLife: .75, d: 'Người Lùn trả nợ cho thị tộc bằng năm tháng: giữ lò chung, đứng cổng, khắc sử lên vách đá.' },
    dragonkin: { id: 'torpor',  nameVi: 'Ngủ đông',           share: .5,  pace: .48, laxShare: .12, laxLife: .65, d: 'Long Nhân ngủ dài trong hang ấm, có khi cả mùa đông, để máu rồng không đốt cạn thân xác.' },
    fae:       { id: 'court',   nameVi: 'Hội đình theo mùa',  share: .5,  pace: .6,  laxShare: .12, laxLife: .65, d: 'Yêu Tinh phải dự đủ các hội đình xuân hạ thu đông, giữ giao kèo với đất. Lỡ hội là lỡ phần phép của mùa đó.' },
    merfolk:   { id: 'tide',    nameVi: 'Hát triều',          share: .35, pace: .57, laxShare: .1,  laxLife: .8,  d: 'Hải Tộc theo đàn di cư, hát cho con nước lớn ròng. Ai bỏ đàn thì biển quên tên người đó.' },
    construct: { id: 'upkeep',  nameVi: 'Bảo dưỡng lõi',      share: .2,  pace: .7,  laxShare: .05, laxLife: .8,  d: 'Cơ Nhân phải tháo lõi lau dầu, thay bánh răng mòn. Bỏ bảo dưỡng thì máy chạy nhanh hơn, mòn cũng nhanh hơn.' }
  };
  G.CUSTOM_LAX = { h: -2, so: -2, outcast: .08 };   // mỗi lượt bỏ tập tục: Tâm trạng, Quan hệ; xác suất bị tộc ruồng bỏ
  const custom = S => !S.undead && G.CUSTOMS[S.race];
  const lax = S => S.flags && S.flags.custom === 'lax';

  // Điểm rèn mỗi lượt theo giống loài: ypt × nhịp sống × phần thời gian không dành cho tập tục. Người, Orc, Người Thú, Bộ Xương: 1.
  G.raceRate = S => {
    const C = custom(S); if (!C) return 1;
    return G.RACES[S.race].ypt * C.pace * (1 - (lax(S) ? C.laxShare : C.share));
  };
  // Nhận thức: độ chín theo tuổi (so với tuổi trưởng thành của giống loài) × Hiểu biết. Bộ Xương mang trí nhớ kiếp trước: chỉ xét Hiểu biết.
  G.MIND = { from: .25, floor: .05, sm: .3 };
  G.mindF = S => {
    const R = G.RACES[S.race], M = G.MIND, y = S.age * R.ypt;
    const ripe = R.undead || !R.adult ? 1 : G.clamp((y / R.adult - M.from) / (1 - M.from), M.floor, 1);
    return ripe * (1 - M.sm / 2 + M.sm * G.clamp(S.sm, 0, 100) / 100);
  };
  { const base = G.cultRate; G.cultRate = S => base(S) * G.raceRate(S) * G.mindF(S); }
  { const base = G.lifeF; G.lifeF = S => base(S) * (custom(S) && lax(S) ? G.CUSTOMS[S.race].laxLife : 1); }

  // ═════════ Quyết định: giữ hay bỏ tập tục ═════════
  DEC.cv_custom = {
    prio: 6, gap: 10,
    when(S, X) {
      if (S.dead || !custom(S) || X.stage(S) !== 'adult') return false;
      const F = S.flags; if (F.custom == null) return true;   // lần đầu: vừa trưởng thành
      return F.custom === 'lax' || S.aim === 'power' || (F.lvFullY != null && S.world.year - F.lvFullY >= 10 * X.R(S).ypt);
    },
    build(S, X) {
      const C = G.CUSTOMS[S.race], keep = !lax(S), r = n => String(+n.toFixed(2)).replace('.', ',');
      const kRate = G.RACES[S.race].ypt * C.pace * (1 - C.share), lRate = G.RACES[S.race].ypt * C.pace * (1 - C.laxShare);
      return { title: `Tập tục: ${C.nameVi}`, body: `${C.d} ${keep ? 'Bạn vẫn giữ tập tục. Có người trong tộc bỏ đi tu luyện như loài người, mạnh lên nhanh rồi già đi trước mắt mọi người.' : 'Bạn đã bỏ tập tục mấy năm nay. Tộc trưởng gửi lời gọi bạn về.'}`,
        choices: [{ k: 'keep', label: keep ? 'Giữ tập tục' : 'Quay về với tộc', sub: `Rèn × ${r(kRate)} mỗi lượt so với người; đủ tuổi thọ của tộc.` },
          { k: 'lax', label: keep ? 'Bỏ tập tục, dồn sức tu luyện' : 'Không về', sub: `Rèn × ${r(lRate)}; tuổi thọ × ${r(C.laxLife)}; mỗi lượt mất Tâm trạng, Quan hệ; có thể bị tộc ruồng bỏ.` }] };
    },
    apply(S, X, k) {
      const F = S.flags, was = F.custom, C = G.CUSTOMS[S.race]; F.custom = k; F.customY = S.world.year;
      if (k === was) return null;
      cnt(S, 'custom_' + k);
      if (k === 'lax') return `Bạn rời ${C.nameVi.toLowerCase()}. Thời gian bỗng nhiều ra, và cũng trôi nhanh hơn.`;
      if (was === 'lax') { F.outcast = false; X.add('so', 6); return 'Bạn quay về. Không ai nhắc chuyện cũ, nhưng ai cũng nhớ.'; }
      return null;
    },
    auto: S => (S.aim === 'power' && S.traits.bold > .55 && S.traits.pious < .5) || (S.traits.social < .2 && S.traits.bold > .7) ? 'lax' : 'keep'
  };

  // ═════════ Hệ con "custom" (sau "fate"): bỏ tập tục thì mất Tâm trạng, Quan hệ, có lúc bị tộc ruồng bỏ ═════════
  G.customYear = function (S, X) {
    if (!custom(S) || !lax(S)) return;
    const L = G.CUSTOM_LAX, C = G.CUSTOMS[S.race], J = window.JobLibrary;
    X.add('h', L.h); X.add('so', L.so);
    if (!S.flags.outcast && X.chance(L.outcast)) {
      S.flags.outcast = true; cnt(S, 'outcast'); X.add('so', -10);
      X.log(`Tộc ${J.races[S.race].nameVi} gạch tên bạn khỏi ${C.nameVi.toLowerCase()}. Về quê, không ai mở cửa cho bạn.`, 'bad');
    }
  };
  { const k = G.SYSTEMS.findIndex(s => s.id === 'fate'); G.SYSTEMS.splice(k + 1, 0, { id: 'custom', when: S => !S.dead, run: (S, X) => G.customYear(S, X) }); }

  G.customText = S => { const C = custom(S); return C ? `${C.nameVi}${lax(S) ? ' (đã bỏ)' : ''}` : null; };
})(window.LifeSim);
// Chip tập tục cạnh căn cốt, thiên phú (bảng nhân vật).
(function (G) {
  const base = G.talChips;
  G.talChips = S => {
    const out = base(S), t = G.customText(S); if (!t) return out;
    const C = G.CUSTOMS[S.race], lax = S.flags.custom === 'lax', r = n => String(+n.toFixed(2)).replace('.', ',');
    out.push({ text: `Tập tục: ${t}`, col: lax ? '#b0603a' : '#5f8f7a', title: `${C.d} Rèn × ${r(G.raceRate(S))} mỗi lượt so với người${lax ? `; tuổi thọ × ${r(C.laxLife)}` : ''}.` });
    return out;
  };
})(window.LifeSim);
