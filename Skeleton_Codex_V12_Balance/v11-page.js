/* V11 Codex: searchable transition list grounded in the V10 runtime API. */
(()=>{'use strict';
const $=id=>document.getElementById(id), D=window.SkeletonV11Data;
const api=window.SkeletonSkillProgress;
if(!api||!D)throw Error('V11 missing V10 progress or bilingual design data');
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const catalog=api.getJobCatalog(),byId=Object.fromEntries(catalog.map(j=>[j.id,j]));
const edges=catalog.flatMap(j=>j.to.map(target=>({source:j,target:byId[target]})));
function render(){const tier=$('v11Tier').value,q=$('v11Search').value.trim().toLowerCase();
 const found=edges.filter(e=>tier==='all'||e.target.tier===Number(tier)).filter(e=>{
  const t=e.target;const skills=t.requiredSkills.map(id=>api.getSkill(id));
  const hay=[e.source.id,e.source.nameVi,t.id,t.nameVi,t.trial,...Object.keys(t.req),...skills.flatMap(s=>[s.name,s.nameVi,s.id])].join(' ').toLowerCase();return hay.includes(q);
 });
 $('v11Transitions').innerHTML=found.map(({source,target})=>{
 const skills=target.requiredSkills.map(id=>api.getSkill(id));
 return `<tr><td><div class="v11-route">${esc(source.nameVi)} <span class="v11-en">/ ${esc(source.id)}</span></div>↓<div class="v11-route">${esc(target.nameVi)} <span class="v11-en">/ ${esc(target.id)}</span></div>${target.terminal?'<span class="v11-terminal">◆ Nghề kết thúc</span>':''}</td><td><b>Tier ${target.tier}</b><div>Power ${esc(target.grade)}</div></td><td class="v11-skill-list">${skills.map(s=>`<div>✓ ${esc(s.nameVi)} <span class="v11-en">/ ${esc(s.name)}</span> <b>R5</b></div>`).join('')}</td><td>${Object.entries(target.req).map(([k,v])=>`<div>${esc(k)} ≥ ${v}</div>`).join('')||'Không yêu cầu'}</td><td><b>${esc(target.trial)}</b><div>${esc(D.trialObjectives[target.id]||'')}</div><div class="small">Mục tiêu riêng là đặc tả V11; bản chạy hiện dùng trận Trial chung và yêu cầu thắng, qua cổng.</div></td></tr>`;
 }).join('')||'<tr><td colspan="5">Không có đường chuyển nghề khớp bộ lọc.</td></tr>';
 $('v11JobTotals').textContent=`Hiển thị ${found.length}/${edges.length} đường chuyển nghề · ${catalog.length} nghề · ${catalog.filter(j=>j.terminal).length} nghề kết thúc · ${api.getSkills().length} skill đã dịch song ngữ.`;
}
$('v11Tier').addEventListener('change',render);$('v11Search').addEventListener('input',render);render();
})();
