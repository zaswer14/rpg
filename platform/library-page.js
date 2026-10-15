/* Trang codex: hiển thị thư viện chủng tộc (../shared). Chỉ đọc; không đụng runtime V12.3. */
(() => {
  'use strict';
  const L = window.JobLibrary; if (!L || !L.compose) return;
  const $ = id => document.getElementById(id);
  const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const allRaces = Object.keys(L.races);
  const game = L.games.skeleton_codex;
  $('libRace').innerHTML = allRaces.map(id => `<option value="${id}"${game.races.includes(id) ? ' selected' : ''}>${esc(L.races[id].nameVi)} / ${esc(L.races[id].nameEn)}${game.races.includes(id) ? ' (game này)' : ''}</option>`).join('');
  const ACC = { native: 'bản địa', foreign: 'ngoại lai (+15 Mastery)', hidden: 'ẩn', blocked: 'cấm', other: '—' };
  function render() {
    const race = $('libRace').value, filter = $('libFilter').value;
    const g = L.compose({ races: [race] });
    const s = g.summary[0];
    $('libSummary').textContent = g.errors.length ? `LỖI CẤU TRÚC: ${g.errors.join(' · ')}` :
      `${s.nameVi}: ${s.jobs} nghề vào được (${s.shared} thân chung · ${s.crowns} ngọn riêng · ${s.hidden} ẩn) · ${s.edges} cạnh · ${s.terminals} nghề kết thúc · Tier cao nhất ${s.maxTier} · ${s.todo} nghề chưa có gate. Toàn thư viện: ${L.trunk.length} nghề chung, ${allRaces.length} chủng tộc.`;
    const ok = id => ['native', 'foreign', 'hidden'].includes(g.access[race][id]);
    const rows = g.jobs.filter(j => ok(j.id)).filter(j => filter === 'all' || (filter === 'shared' && j.shared) || (filter === 'crown' && !j.shared && j.tier > 0) || (filter === 'todo' && j.tier > 0 && !j.gate))
      .sort((a, b) => a.tier - b.tier || (a.shared === b.shared ? 0 : a.shared ? -1 : 1) || a.id.localeCompare(b.id));
    $('libTable').innerHTML = rows.map(j => {
      const n = g.displayName(race, j.id);
      const from = j.from.map(f => f === '@origin' ? L.races[race].origin.id : f).filter(f => ok(f)), to = j.to.filter(ok);
      return `<tr><td><b>T${j.tier}</b></td><td><div class="v11-route">${esc(n.vi)} <span class="v11-en">/ ${esc(n.en)}</span></div>${j.shared ? '<span class="tag">thân chung</span>' : j.hidden ? '<span class="v11-terminal">◆ ẩn</span>' : '<span class="tag">ngọn riêng</span>'}</td><td><code>${esc(j.id)}</code>${j.legacy ? `<div class="small">${esc(j.legacy)}</div>` : ''}</td><td>${esc(j.school)}${(j.schoolAlt || []).length ? ' / ' + esc(j.schoolAlt.join('/')) : ''}<div class="small">${esc(ACC[g.access[race][j.id]])}</div></td><td>${esc(from.join(', ') || '—')} → ${to.length ? esc(to.join(', ')) : '<b>kết thúc</b>'}</td><td>${j.gate ? esc(j.gate.join(' + ')) : '<i>chưa có</i>'}${j.todo ? `<div class="small">${esc(j.todo)}</div>` : ''}</td><td class="small">${esc(j.marker || j.summary || '')}</td></tr>`;
    }).join('') || '<tr><td colspan="7">Không có nghề khớp bộ lọc.</td></tr>';
    $('libWarnings').innerHTML = (g.errors.length ? `<p><b>Lỗi:</b> ${g.errors.map(esc).join('<br>')}</p>` : '') + (g.warnings.length ? `<p><b>Chưa hoàn thiện (${g.warnings.length}):</b> ${g.warnings.map(esc).join(' · ')}</p>` : '<p>Không có cảnh báo.</p>');
  }
  $('libRace').addEventListener('change', render); $('libFilter').addEventListener('change', render); render();
})();
