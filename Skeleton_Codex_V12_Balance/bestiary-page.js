/* Trang codex: Sổ tay quái phụ (../library/bestiary). Chỉ đọc dữ liệu + số đã hạ từ save. */
(() => {
  'use strict';
  const L = window.JobLibrary; if (!L || !L.bestiary) return;
  const $ = id => document.getElementById(id);
  const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const B = L.bestiary(), api = window.SkeletonSkillProgress;
  const famName = f => B.families[f] ? B.families[f].nameVi : f, biomeName = b => B.biomes[b] ? B.biomes[b].nameVi : b;
  $('bestFamily').innerHTML += Object.entries(B.families).map(([id, f]) => `<option value="${id}">${esc(f.nameVi)} / ${esc(f.nameEn)} (${B.byFamily[id].length})</option>`).join('');
  $('bestBiome').innerHTML += Object.entries(B.biomes).map(([id, b]) => `<option value="${id}">${esc(b.nameVi)} · Tier ${b.tiers[0]}–${b.tiers[1]}</option>`).join('');
  $('bestGrades').innerHTML = Object.values(B.grades).map(g => `<p><b style="color:${g.aura || 'inherit'}">${esc(g.nameVi)}</b>: máu ×${g.hp}, sát thương ×${g.dmg}, ${g.affixes} biến tố${g.bounty ? `, ${g.bounty} Chiến tích nền` : ''}${g.note ? ' — ' + esc(g.note) : ''}</p>`).join('') +
    '<p><b>Biến tố:</b> ' + Object.values(B.affixes).map(a => `<span style="color:${a.color}">${esc(a.nameVi)}</span> (${esc(a.rule)})`).join(' · ') + '</p>';
  $('bestBehaviors').innerHTML = Object.values(B.behaviors).map(b => `<p><b>${esc(b.nameVi)}</b>: ${esc(b.note)} <i>Báo đòn: ${esc(b.telegraph)}.</i></p>`).join('');
  function render() {
    const fam = $('bestFamily').value, biome = $('bestBiome').value, maxTier = Number($('bestTier').value);
    const kills = api && api.getBestiary ? api.getBestiary() : {};
    const list = B.species.filter(s => (fam === 'all' || s.family === fam) && (biome === 'all' || s.habitat.includes(biome)) && s.tier <= maxTier)
      .sort((a, b) => a.tier - b.tier || a.family.localeCompare(b.family) || a.id.localeCompare(b.id));
    const seen = Object.keys(kills).filter(id => B.byId[id] && kills[id].kills > 0).length;
    $('bestSummary').textContent = B.errors.length ? `LỖI DỮ LIỆU: ${B.errors.join(' · ')}` :
      `${B.stat.species} loài (${B.stat.spawnable} sinh ngẫu nhiên) · ${B.stat.families} họ · ${B.stat.behaviors} kiểu · ${B.stat.biomes} vùng · ${B.stat.affixes} biến tố. Đã hạ ${seen}/${B.stat.species} loài. Đang hiện ${list.length}.`;
    const fams = fam === 'all' ? Object.keys(B.families) : [fam];
    $('bestFamilies').innerHTML = fams.map(id => { const f = B.families[id];
      return `<div class="card"><h3>${esc(f.nameVi)} <span class="v11-en">/ ${esc(f.nameEn)}</span></h3><p>${esc(f.ruleVi)}</p><p class="small">Nhận diện: ${esc(f.tell)} · Rơi: ${esc(f.loot.join(', '))} · Tham khảo: ${esc(f.ref)}</p></div>`; }).join('');
    $('bestTable').innerHTML = list.map(s => {
      const k = kills[s.id], st = B.statusOf(s), asp = s.aspect && L.aspects[s.aspect];
      return `<tr><td><b>T${s.tier}</b></td><td><div class="v11-route">${esc(s.nameVi)} <span class="v11-en">/ ${esc(s.nameEn)}</span></div><code>${esc(s.id)}</code>${s.spawn === false ? ' <span class="v11-terminal">◆ chúa vùng</span>' : ''}${s.note ? `<div class="small">${esc(s.note)}</div>` : ''}</td>` +
        `<td>${esc(famName(s.family))}<div class="small">${esc(B.behaviors[s.behavior].nameVi)} · ${esc(B.sizes[s.size].nameVi)}${s.group ? ` · bầy ${s.group[0]}–${s.group[1]}` : ''}</div></td>` +
        `<td>${asp ? `<span style="color:${asp.color}">●</span> ${esc(asp.nameVi)}` : '—'}<div class="small">${st ? esc(B.rules.playerStatuses[st].nameVi) : 'không'}</div></td>` +
        `<td class="small">${esc(s.attack)}</td><td class="small">${esc(s.habitat.map(biomeName).join(', '))}</td><td class="small">${esc(s.marker)}</td>` +
        `<td>${k ? `${k.kills}${k.elite || k.alpha ? `<div class="small">★ ${k.elite} tinh anh · ${k.alpha} thủ lĩnh</div>` : ''}` : '<span class="small">chưa gặp</span>'}</td></tr>`;
    }).join('') || '<tr><td colspan="8">Không có loài khớp bộ lọc.</td></tr>';
    $('bestWarnings').innerHTML = B.warnings.length ? `<p><b>Cảnh báo dữ liệu (${B.warnings.length}):</b> ${B.warnings.map(esc).join(' · ')}</p>` : '';
  }
  ['bestFamily', 'bestBiome', 'bestTier'].forEach(id => $(id).addEventListener('change', render));
  window.addEventListener('skeleton-progress-changed', render);
  render();
})();
