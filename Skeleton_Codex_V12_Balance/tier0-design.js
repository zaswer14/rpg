/* Skeleton Codex V8: Tier-0 statistics come ONLY from permanent ranked-skill rewards. */
(()=>{'use strict';
const KEYS=['STR','DEX','VIT','INT','WIL','AGI'];
const META={STR:['Sức mạnh','Đòn nặng / phá giáp'],DEX:['Khéo léo','Độ chính xác / kỹ thuật'],VIT:['Thể chất','HP / Poise'],INT:['Trí tuệ','Phép / kỹ thuật'],WIL:['Ý chí','Mana / chống khống chế'],AGI:['Nhanh nhẹn','Không chiến / né tránh']};
const elementSeeds=[['🔥','Lửa','Flicker Ember','Burn nhẹ'],['💧','Nước','Water Drop / Water Veil','Wet / Barrier'],['❄️','Băng','Frost Fleck','Chill nhẹ'],['⚡','Sét','Static Snap','Shock tích lũy'],['🌪️','Gió','Wind Puff','Đẩy lùi ngắn'],['🪨','Đất','Pebble Knock','Đạn đá phép'],['✨','Ánh sáng','Pale Glimmer','Barrier / Cleanse'],['🌑','Bóng tối','Shade Mote','Đạn bóng tối'],['🌿','Tự nhiên','Sprout Grasp','Root ngắn']];
const paths=[
  ['⚔','Bone Fighter','Kiếm / đỡ đòn','Normal → Cracked Slash','STR · VIT'],
  ['🪨','Skeleton Archer','Ném đá → học cung','Normal Throw → Stone Throw','DEX'],
  ['🗡','Bone Rogue','Dao găm / né','Normal → Needle Stab → Dodge','DEX · AGI'],
  ['✦','Bone Acolyte','Phép / tử thuật','Normal Cast → Shade Mote','INT · WIL'],
  ['⚙','Bone Tinkerer','Bẫy / cơ khí','Junk Snare → dụ quái','INT · DEX']
];
const el=id=>document.getElementById(id);
const api=()=>window.SkeletonSkillProgress;
const round=v=>Math.round(v*10)/10;
function render(){
  if(!api())return;
  const {level,stats,fromSkills,ranks}=api().getSnapshot('Wanderer');
  el('tier0Points').innerHTML=`<b>Level ${level} = ${level} skill đạt bậc 5</b><small>Không nhận điểm tăng chỉ số khi lên Level</small>`;
  el('tier0Stats').innerHTML=KEYS.map(k=>`<div class="tier0-stat"><div><b>${k}</b><span>${META[k][0]}</span><small>${META[k][1]}</small></div><div class="tier0-step"><strong>${stats[k]}</strong><small>5 gốc + ${fromSkills[k]} từ skill</small></div></div>`).join('');
  const derived=[['HP',60+8*stats.VIT],['Stamina',60+4*stats.VIT+3*stats.AGI],['Mana',25+5*stats.WIL+2*stats.INT],['Physical Power*',round(10+1.5*stats.STR)],['Magic Power*',round(8+1.6*stats.INT)],['Poise*',5+2*stats.VIT]];
  el('tier0Derived').innerHTML=derived.map(([name,value])=>`<div><small>${name}</small><strong>${value}</strong></div>`).join('')+'<p class="small">* Công thức demo, không phải cân bằng cuối. Chỉ số cập nhật ngay khi skill đạt bậc thưởng (ví dụ 3 hoặc 5). Không thể phân bổ bằng nút +/−.</p>';
  el('tier0Paths').innerHTML=paths.map(([ico,job,desc,combo,statsHint])=>{
    const gate=api().getGate('Wanderer',job);
    const complete=gate.required.filter(x=>x.passed).length;
    const req=gate.required.map(x=>`<span class="tier0-req ${x.passed?'ready':''}">${x.passed?'✓':'○'} ${x.name} · ${x.rank}/5</span>`).join('');
    return `<div class="tier0-path"><strong>${ico} ${job}</strong><p>${desc}</p><div class="tier0-reqs">${req}</div><small><b>Tiến độ:</b> ${complete}/${gate.required.length} skill max · <b>Hướng chỉ số:</b> ${statsHint}<br><b>Combo:</b> ${combo}<br>Đạt đủ skill còn cần Mastery và Trial của nghề.</small></div>`;
  }).join('');
}
el('tier0Elements').innerHTML=elementSeeds.map(([icon,name,skill,status])=>`<div><span>${icon} <b>${name}</b><small>Affinity mặc định: 0</small></span><span><strong>${skill}</strong><small>${status}</small></span></div>`).join('');
el('tier0OpenSkills').onclick=()=>{
  const ids=[['skillJob','Wanderer'],['skillTier','0'],['skillKind','all'],['skillAccess','all'],['skillRole','all'],['skillElement','all'],['skillMethod','all']];
  for(const [id,value] of ids){let control=el(id);control.value=value;control.dispatchEvent(new Event('change'));}
  el('skillSearch').value='';el('skillSearch').dispatchEvent(new Event('input'));
  el('skill-library').scrollIntoView({behavior:'smooth'});
};
window.addEventListener('skeleton-progress-changed',render);
render();
})();
