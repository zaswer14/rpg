/* Job Library — catalog(): đọc mọi KHUÔN NGHỀ (archetypes/*.js) và các DẠNG của chúng, kiểm tra, trả về bảng tra.
 *
 * Khuôn nghề (archetype) = một vai trò/giấc mơ chung mọi chủng tộc hiểu (Kỵ Sĩ, Sát Thủ, Triệu Hồi Sư…).
 *   Dùng chung: rig + bộ anim, nhóm vũ khí, 3 cơ chế lõi (core.kit), mastery.
 *   { id, school, schoolAlt?, nameEn, nameVi, tiers:[min,max], trunk:[id nghề thân chung gần nhất], fantasy,
 *     core:{ kit[], weapons[], masteries[], rig, shared }, generic:{ nameEn, nameVi, marker }, variants:[] }
 *
 * Dạng (variant) = cách một chủng tộc và/hoặc một giáo phái sống trong khuôn đó. Khác nhau ở: khí chất (aspect),
 *   luật riêng (twist), ngoại hình nhận diện (marker), thú cưỡi/bạn đồng hành, tên.
 *   { id, race, faith?, aspect, nameEn, nameVi, tier, from:[gợi ý tiền nhiệm], twist, marker,
 *     mount?, companion?, crown?: id ngọn đã có (races/<race>.js hoặc faiths.js), skinOf?: id nghề thân chung mà dạng này chỉ là tên/ngoại hình,
 *     hidden?, unlock?, exception?: lý do được vào trường phái bị cấm, excludes?: [id dạng loại trừ nhau], note? }
 *   race:'*' = mọi chủng tộc, bắt buộc có faith (dạng theo tín ngưỡng).
 *   Thứ tự chọn dạng khi nhân vật vào khuôn: race+faith > faith (race '*') > race > generic. Xem resolve().
 *
 * Dùng: const c = JobLibrary.catalog();
 *   c.archetypes, c.variants (phẳng, mỗi dạng có .archetype), c.byRace[race] ('*' = theo tín ngưỡng), c.matrix[archId][race|'*'],
 *   c.access(race, archId) → 'native'|'foreign'|'forbidden', c.resolve(archId, race, faith) → variant|null (null = dạng chung),
 *   c.stats, c.errors, c.warnings, c.info · JobLibrary.catalogMarkdown() → bảng Markdown toàn thư viện.
 */
window.JobLibrary = window.JobLibrary || {};
window.JobLibrary.catalog = function catalog() {
  const L = window.JobLibrary, A = L.archetypes || {}, R = L.races || {}, S = L.schools || {}, X = L.aspects || {}, F = L.faiths || {};
  const errors = [], warnings = [], info = [];
  const trunkIds = new Set((L.trunk || []).map(t => t.id));
  const raceIds = Object.keys(R), faithIds = Object.keys(F);

  const raceJobIds = {};
  for (const r of raceIds) raceJobIds[r] = new Set([R[r].origin.id, ...(R[r].crowns || []).map(c => c.id)]);
  const faithJobIds = new Set(faithIds.flatMap(f => (F[f].crowns || []).map(c => c.id)));
  const crownOf = v => v.race !== '*' && R[v.race] ? (R[v.race].crowns || []).find(x => x.id === v.crown) : (F[v.faith] && (F[v.faith].crowns || []).find(x => x.id === v.crown));

  const accessOf = (raceId, school) => {
    const s = R[raceId] && R[raceId].schools; if (!s) return 'forbidden';
    return s.native.includes(school) ? 'native' : s.foreign.includes(school) ? 'foreign' : 'forbidden';
  };
  const rank = { native: 2, foreign: 1, forbidden: 0 };
  const access = (raceId, archId) => {
    const a = A[archId]; if (!a) return 'forbidden';
    if ((a.trunk || []).some(t => ((R[raceId] || {}).allowDespiteForbidden || []).includes(t)) && R[raceId] && accessOf(raceId, a.school) === 'forbidden') return 'foreign';
    return [a.school, ...(a.schoolAlt || [])].map(s => accessOf(raceId, s)).sort((x, y) => rank[y] - rank[x])[0];
  };
  const faithOpen = (raceId, faithId) => F[faithId] && !(F[faithId].races.shunned || []).includes(raceId);

  const archetypes = Object.values(A);
  const variantIds = Object.fromEntries([...raceIds, '*'].map(r => [r, new Set()]));
  for (const a of archetypes) for (const v of a.variants || []) if (variantIds[v.race]) variantIds[v.race].add(v.id);
  const variants = [], seen = {}, names = {}, markers = {};
  for (const a of archetypes) {
    if (!S[a.school]) errors.push(`${a.id}: trường phái "${a.school}" không có trong schools.js`);
    for (const s of a.schoolAlt || []) if (!S[s]) errors.push(`${a.id}: schoolAlt "${s}" không có`);
    for (const t of a.trunk || []) if (!trunkIds.has(t)) errors.push(`${a.id}: trunk "${t}" không có trong trunk.js`);
    if (!a.variants || !a.variants.length) warnings.push(`${a.id}: chưa có dạng nào`);
    const racesIn = new Set((a.variants || []).map(v => v.race));
    if (racesIn.size < 3) warnings.push(`${a.id}: chỉ ${racesIn.size} chủng tộc/tín ngưỡng có dạng (nên ≥ 3 để đáng gọi là khuôn chung)`);
    for (const v of a.variants || []) {
      const at = `${a.id} › ${v.id}`;
      variants.push({ ...v, archetype: a.id, school: a.school });
      if (seen[v.id]) errors.push(`${at}: trùng id dạng với ${seen[v.id]}`); else seen[v.id] = a.id;
      if (trunkIds.has(v.id)) errors.push(`${at}: id trùng nghề thân chung (dùng skinOf thay vì trùng id)`);
      if (v.race !== '*' && !R[v.race]) { errors.push(`${at}: chủng tộc "${v.race}" không có`); continue; }
      if (v.race === '*' && !v.faith) errors.push(`${at}: race '*' bắt buộc có faith`);
      if (v.faith && !F[v.faith]) errors.push(`${at}: giáo phái "${v.faith}" không có trong faiths.js`);
      if (!X[v.aspect]) errors.push(`${at}: khí chất "${v.aspect}" không có trong aspects.js`);
      for (const k of ['nameEn', 'nameVi', 'twist', 'marker']) if (!v[k]) errors.push(`${at}: thiếu ${k}`);
      if (typeof v.tier !== 'number') errors.push(`${at}: thiếu tier`);
      else if (a.tiers && (v.tier < a.tiers[0] || v.tier > a.tiers[1])) warnings.push(`${at}: tier ${v.tier} ngoài dải ${a.tiers.join('–')} của khuôn`);
      if (v.crown) {
        const c = crownOf(v);
        if (!c) errors.push(`${at}: crown "${v.crown}" không có trong ${v.race === '*' ? 'faiths.js › ' + v.faith : 'races/' + v.race + '.js'}`);
        else {
          if (c.tier !== v.tier) warnings.push(`${at}: tier ${v.tier} khác ngọn đang có (T${c.tier})`);
          if (v.race !== '*' && (c.faith || null) !== (v.faith || null)) warnings.push(`${at}: faith "${v.faith || '—'}" khác ngọn đang có ("${c.faith || '—'}")`);
        }
      }
      if (v.skinOf && !trunkIds.has(v.skinOf)) errors.push(`${at}: skinOf "${v.skinOf}" không phải nghề thân chung`);
      if (v.race !== '*') {
        const acc = access(v.race, a.id);
        if (acc === 'forbidden' && !v.hidden && !v.exception && !v.faith) warnings.push(`${at}: ${v.race} bị cấm trường phái ${a.school}${(a.schoolAlt || []).length ? '/' + a.schoolAlt.join('/') : ''} mà dạng không có hidden/exception/faith`);
        if (v.faith && !faithOpen(v.race, v.faith)) errors.push(`${at}: giáo phái ${v.faith} xa lánh chủng tộc ${v.race}`);
      }
      const fromOk = f => trunkIds.has(f) || faithJobIds.has(f) || (v.race !== '*' && (raceJobIds[v.race].has(f) || variantIds[v.race].has(f))) || variantIds['*'].has(f);
      for (const f of v.from || []) if (!fromOk(f)) warnings.push(`${at}: gợi ý tiền nhiệm "${f}" không phải nghề chung, ngọn, ngọn tín ngưỡng hay dạng cùng chủng tộc`);
      for (const e of v.excludes || []) if (!(a.variants || []).some(x => x.id === e)) warnings.push(`${at}: excludes "${e}" không phải dạng cùng khuôn`);
      const nk = v.nameEn.toLowerCase(); (names[nk] = names[nk] || []).push(at);
      const mk = v.marker.toLowerCase(); (markers[mk] = markers[mk] || []).push(at);
    }
  }
  for (const [n, list] of Object.entries(names)) if (list.length > 1) warnings.push(`Trùng tên tiếng Anh "${n}": ${list.join(', ')}`);
  for (const [m, list] of Object.entries(markers)) if (list.length > 1) warnings.push(`Trùng marker "${m}": ${list.join(', ')}`);

  // Ngọn đã có (races/*.js, faiths.js) mà chưa thuộc khuôn nào.
  const linked = new Set(variants.filter(v => v.crown).map(v => (v.race === '*' ? 'faith:' + v.faith : v.race) + ':' + v.crown));
  for (const r of raceIds) for (const c of R[r].crowns || []) if (!linked.has(r + ':' + c.id)) info.push(`Ngọn ${r}:${c.id} chưa gắn vào khuôn nào`);
  for (const f of faithIds) for (const c of F[f].crowns || []) if (!linked.has('faith:' + f + ':' + c.id)) info.push(`Ngọn tín ngưỡng ${f}:${c.id} chưa gắn vào khuôn nào`);
  for (const f of faithIds) for (const c of F[f].crowns || []) { if (!S[c.school]) errors.push(`faiths › ${f} › ${c.id}: trường phái "${c.school}" không có`); if (!X[F[f].aspect]) errors.push(`faiths › ${f}: khí chất "${F[f].aspect}" không có`); }

  const byRace = Object.fromEntries([...raceIds, '*'].map(r => [r, variants.filter(v => v.race === r)]));
  const matrix = {};
  for (const a of archetypes) { matrix[a.id] = {}; for (const r of [...raceIds, '*']) matrix[a.id][r] = variants.filter(v => v.archetype === a.id && v.race === r); }

  // Dạng nào áp dụng cho (khuôn, chủng tộc, tín ngưỡng)? null = dạng chung của khuôn. Dạng ẩn chỉ trả về khi includeHidden.
  const resolve = (archId, raceId, faithId, includeHidden) => {
    const vs = (A[archId] && A[archId].variants || []).filter(v => includeHidden || !v.hidden);
    const f = faithId || null;
    return vs.find(v => v.race === raceId && (v.faith || null) === f && f)
      || vs.find(v => v.race === '*' && v.faith === f && f)
      || vs.find(v => v.race === raceId && !v.faith)
      || null;
  };

  const count = (arr, key) => arr.reduce((m, x) => (m[x[key] || '—'] = (m[x[key] || '—'] || 0) + 1, m), {});
  const stats = {
    archetypes: archetypes.length, variants: variants.length,
    newVariants: variants.filter(v => !v.crown && !v.skinOf).length, linkedCrowns: linked.size,
    crownsTotal: raceIds.reduce((n, r) => n + (R[r].crowns || []).length, 0) + faithIds.reduce((n, f) => n + (F[f].crowns || []).length, 0),
    faithCrowns: faithIds.reduce((n, f) => n + (F[f].crowns || []).length, 0), faiths: faithIds.length,
    bySchool: count(archetypes, 'school'), variantsBySchool: count(variants, 'school'),
    byRace: count(variants, 'race'), byAspect: count(variants, 'aspect'), byFaith: count(variants.filter(v => v.faith), 'faith'),
    hidden: variants.filter(v => v.hidden).length, exceptions: variants.filter(v => v.exception).length
  };
  return { archetypes, variants, byRace, matrix, access, accessOf, faithOpen, resolve, stats, errors, warnings, info };
};

// Bảng Markdown toàn thư viện (dùng để cập nhật docs/02 mục "Danh mục").
window.JobLibrary.catalogMarkdown = function catalogMarkdown() {
  const L = window.JobLibrary, c = L.catalog(), R = L.races, X = L.aspects, S = L.schools, F = L.faiths || {};
  const races = Object.keys(R), esc = s => String(s || '').replace(/\|/g, '/');
  const fsym = f => F[f] ? `${F[f].symbol} ${F[f].nameVi}` : f;
  const who = v => v.race === '*' ? `Mọi chủng tộc · ${fsym(v.faith)}` : R[v.race].nameVi + (v.faith ? ` · ${fsym(v.faith)}` : '');
  const out = [];
  out.push(`Số liệu: **${c.stats.archetypes} khuôn nghề · ${c.stats.variants} dạng** (${c.stats.newVariants} dạng mới, ${c.stats.linkedCrowns}/${c.stats.crownsTotal} ngọn đã gắn khuôn trong đó ${c.stats.faithCrowns} ngọn tín ngưỡng, ${c.stats.hidden} dạng ẩn, ${c.stats.exceptions} dạng ngoại lệ trường phái; ${c.stats.faiths} giáo phái, ${Object.values(c.stats.byFaith).reduce((a, b) => a + b, 0)} dạng gắn tín ngưỡng).`, '');
  out.push('### Ma trận khuôn × chủng tộc', '', `| Khuôn | ${races.map(r => R[r].nameVi).join(' | ')} | Theo tín ngưỡng (mọi chủng tộc) |`, `|---|${races.map(() => '---').join('|')}|---|`);
  const cell = vs => vs.map(v => v.nameVi + (v.faith ? ' ' + F[v.faith].symbol : '') + (v.hidden ? ' ◆' : '')).join('<br>');
  for (const a of c.archetypes) out.push(`| **${a.nameVi}** <br>${a.nameEn} | ${races.map(r => {
    const vs = c.matrix[a.id][r]; if (vs.length) return cell(vs);
    return c.access(r, a.id) === 'forbidden' ? '✕' : '·';
  }).join(' | ')} | ${cell(c.matrix[a.id]['*']) || '·'} |`);
  out.push('', `✕ = chủng tộc cấm trường phái của khuôn · · = vào được nhưng chưa có dạng riêng (dùng dạng chung) · ◆ = dạng ẩn · ${Object.keys(F).map(f => `${F[f].symbol} ${F[f].nameVi}`).join(' · ')}`, '');
  let school = null;
  for (const a of [...c.archetypes].sort((x, y) => Object.keys(S).indexOf(x.school) - Object.keys(S).indexOf(y.school))) {
    if (a.school !== school) { school = a.school; out.push(`### ${S[school].nameVi} (${S[school].nameEn})`, ''); }
    out.push(`#### ${a.nameVi} / ${a.nameEn} — \`${a.id}\` · T${a.tiers.join('–')}`, '', `${a.fantasy}`, '',
      `- **Lõi chung:** ${a.core.kit.join(' · ')}`, `- **Dùng chung:** ${a.core.shared} Vũ khí: ${a.core.weapons.join(', ')}. Rig: \`${a.core.rig}\`.`,
      `- **Dạng chung (không có dạng riêng):** ${a.generic.nameVi} / ${a.generic.nameEn} — ${a.generic.marker}.`, '',
      '| Ai | Dạng | T | Khí chất | Khác biệt | Ngoại hình | Ghi chú |', '|---|---|---|---|---|---|---|');
    for (const v of c.variants.filter(x => x.archetype === a.id)) {
      const notes = [v.crown ? `ngọn có sẵn \`${v.crown}\`` : '', v.skinOf ? `là nghề chung \`${v.skinOf}\`` : '', v.hidden ? `ẩn (${v.unlock || '?'})` : '',
        v.exception ? `ngoại lệ: ${v.exception}` : '', (v.excludes || []).length ? `loại trừ: ${v.excludes.join(', ')}` : '', v.mount ? `cưỡi: ${v.mount}` : '', v.companion ? `đồng hành: ${v.companion}` : '', v.note || ''].filter(Boolean).join('; ');
      out.push(`| ${esc(who(v))} | **${esc(v.nameVi)}** / ${esc(v.nameEn)} | ${v.tier} | ${X[v.aspect].nameVi} | ${esc(v.twist)} | ${esc(v.marker)} | ${esc(notes)} |`);
    }
    out.push('');
  }
  return out.join('\n');
};
