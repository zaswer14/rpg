/* Job Library — compose(): ghép thân chung + các chủng tộc một game chọn thành danh sách nghề + cạnh, kèm kiểm tra.
 * Không phụ thuộc DOM hay game. Dùng: const g = JobLibrary.compose({ races:['skeleton','human'] });
 * Kết quả: { jobs, byId, edges, access[race][jobId], summary[], warnings[], errors[], displayName(race, jobId) }
 *  - access: 'native' | 'foreign' | 'hidden' | 'blocked' | 'other' (ngọn riêng của chủng tộc khác)
 *  - errors: vi phạm cấu trúc (id trùng, tiền nhiệm thiếu, sai Tier, ngọn mọc từ chủng tộc khác). Có errors thì không dùng kết quả.
 *  - warnings: chỗ chưa thiết kế xong (gate null) hoặc ngọn mọc từ nghề chủng tộc không vào được.
 */
window.JobLibrary = window.JobLibrary || {};
window.JobLibrary.compose = function compose(config) {
  const L = window.JobLibrary, OK = ['native', 'foreign', 'hidden'];
  const errors = [], warnings = [];
  const races = (config.races || []).map(id => { const r = L.races[id]; if (!r) errors.push('Chủng tộc không có trong thư viện: ' + id); return r; }).filter(Boolean);

  const jobs = L.trunk.map(t => ({ ...t, from: [...t.from], to: [], shared: true, race: null, hidden: false }));
  const byId = Object.fromEntries(jobs.map(j => [j.id, j]));
  const add = j => { if (byId[j.id]) { errors.push('Trùng id nghề: ' + j.id); return null; } jobs.push(j); byId[j.id] = j; return j; };
  const originOf = {};
  for (const r of races) {
    const o = add({ ...r.origin, tier: 0, school: 'origin', from: [], to: [], shared: false, race: r.id, hidden: false });
    if (o) originOf[r.id] = o.id;
    for (const c of r.crowns || []) add({ ...c, from: [...c.from], to: [], shared: false, race: r.id, hidden: !!c.hidden });
  }

  // Quyền vào nghề theo chủng tộc.
  const access = {};
  for (const r of races) {
    const a = access[r.id] = {};
    for (const j of jobs) {
      if (j.race && j.race !== r.id) { a[j.id] = 'other'; continue; }
      if (j.race === r.id) { a[j.id] = j.hidden ? 'hidden' : 'native'; continue; }
      const schools = [j.school, ...(j.schoolAlt || [])];
      a[j.id] = (r.blockedJobs || []).includes(j.id) ? 'blocked'
        : schools.some(s => r.schools.native.includes(s)) ? 'native'
        : schools.some(s => r.schools.foreign.includes(s)) ? 'foreign'
        : (r.allowDespiteForbidden || []).includes(j.id) ? 'foreign' : 'blocked';
    }
  }

  // Cạnh. '@origin' nối tới origin của từng chủng tộc được vào nghề đó.
  const edges = [];
  for (const j of jobs) for (const f of j.from) {
    if (f === '@origin') {
      for (const r of races) { const o = byId[originOf[r.id]]; if (o && OK.includes(access[r.id][j.id])) { o.to.push(j.id); edges.push({ from: o.id, to: j.id, race: r.id }); } }
      continue;
    }
    const p = byId[f];
    if (!p) { errors.push(`${j.id}: tiền nhiệm "${f}" không tồn tại`); continue; }
    if (p.tier !== j.tier - 1) errors.push(`${j.id}: Tier ${j.tier} nhưng tiền nhiệm ${f} ở Tier ${p.tier}`);
    if (j.race && p.race && p.race !== j.race) errors.push(`${j.id}: ngọn riêng của ${j.race} mọc từ nghề của ${p.race}`);
    if (j.race && !p.race && !OK.includes(access[j.race][f])) warnings.push(`${j.id} (${j.race}) mọc từ ${f} nhưng chủng tộc không vào được ${f}`);
    p.to.push(j.id); edges.push({ from: f, to: j.id, race: j.race });
  }
  for (const j of jobs) if (j.tier > 0 && !j.gate) warnings.push(`${j.id}${j.race ? ' (' + j.race + ')' : ''}: chưa có cặp skill gate`);

  const reachable = (rid, id) => OK.includes(access[rid][id]);
  const summary = races.map(r => {
    const avail = jobs.filter(j => reachable(r.id, j.id));
    const e = edges.filter(x => (!x.race || x.race === r.id) && reachable(r.id, x.from) && reachable(r.id, x.to));
    const terminals = avail.filter(j => j.tier > 0 && !j.to.some(t => reachable(r.id, t)));
    return { race: r.id, nameVi: r.nameVi, jobs: avail.length, shared: avail.filter(j => j.shared).length, crowns: avail.filter(j => !j.shared && j.tier > 0 && !j.hidden).length,
      hidden: avail.filter(j => j.hidden).length, edges: e.length, terminals: terminals.length, todo: avail.filter(j => j.tier > 0 && !j.gate).length,
      maxTier: Math.max(...avail.map(j => j.tier)) };
  });

  const displayName = (raceId, jobId) => {
    const r = L.races[raceId], j = byId[jobId]; if (!r || !j) return { en: jobId, vi: jobId };
    if (j.race === raceId || j.tier === 0) return { en: j.nameEn, vi: j.nameVi };
    if (r.displayNames && r.displayNames[jobId]) return r.displayNames[jobId];
    return { en: (r.prefix.en ? r.prefix.en + ' ' : '') + j.nameEn, vi: j.nameVi + (r.prefix.viSuffix ? ' ' + r.prefix.viSuffix : '') };
  };
  return { jobs, byId, edges, access, summary, warnings, errors, displayName };
};
