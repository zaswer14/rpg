/* Chủng tộc: DWARF — chiến đấu, chế tác, nỏ; cấm cưỡi thú. Thân thấp: phá luật rig (xem body). */
window.JobLibrary = window.JobLibrary || {}; window.JobLibrary.races = window.JobLibrary.races || {};
window.JobLibrary.races.dwarf = {
  id:'dwarf', nameEn:'Dwarf', nameVi:'Người Lùn',
  lore:'Đào sâu, rèn kỹ, uống nhiều; tin vào đá hơn tin vào thần.',
  origin:{ id:'delver', tier:0, nameEn:'Delver', nameVi:'Thợ Đào', summary:'Cuốc chim, đèn mũ. Marker: râu tết (thân).' },
  body:{ rig:'humanoid64-short', notes:'Thấp hơn 8 px, vai rộng hơn 4 px. Gear overlay KHÔNG dùng lại 1:1 từ humanoid64; phải vẽ lại theo tọa độ vai/tay riêng. Chủng tộc đắt thứ hai về art sau hải tộc.',
    evolutions:[
      { id:'runebound', nameEn:'Runebound', nameVi:'Khắc Rune', visual:'rune sáng trên da/râu' },
      { id:'stoneflesh', nameEn:'Stoneflesh', nameVi:'Thạch Thể', visual:'da hóa đá từng mảng' }
    ] },
  schools:{ native:['combat','craft','ranged'], foreign:['arcane','martial','shadow'], forbidden:['beast','death'] },
  schoolNotes:{ ranged:'Crossbow/Firearm, không Bow (Archer dùng nỏ: cùng skill, khác overlay).' },
  prefix:{ en:'Iron', viSuffix:'Lùn' },
  accent:{ ember:'#E07A2F', gold:'#D9A441', rune:'#5FA8FF' },
  silhouetteHook:'Hình khối vuông, thấp, nặng; râu là phần silhouette lớn nhất sau vũ khí.',
  crowns:[
    { id:'stone_sentinel', tier:3, from:['guard'],        school:'combat', nameEn:'Stone Sentinel', nameVi:'Thạch Vệ',        role:'Tank',      gate:null, req:{Shield:55},            trial:'Hold the gate', marker:'khiên tháp bằng đá nguyên khối + mũ đá', summary:'Terminal T3.' },
    { id:'ironbreaker',    tier:4, from:['phalanx'],      school:'combat', nameEn:'Ironbreaker',    nameVi:'Phá Thiết',       role:'Formation', gate:null, req:{Shield:70,Axe:50},     trial:'Shield line',   marker:'hai rìu ngắn + mũ có mặt nạ sắt', summary:'' },
    { id:'runesmith',      tier:4, from:['artificer'],    school:'craft',  nameEn:'Runesmith',      nameVi:'Thợ Rune',        role:'Support',   gate:null, req:{Engineering:60,Arcane:40}, trial:'First rune', marker:'búa rèn + rune sáng trên giáp đồng minh', summary:'Craft lai Arcane.' },
    { id:'forge_king',     tier:5, from:['architect'],    school:'craft',  nameEn:'Forge King',     nameVi:'Lò Rèn Vương',    role:'Mythic',    gate:null, req:{Engineering:95},       trial:'Mountain heart',marker:'vương miện đe + lò rèn di động sau lưng', summary:'' },
    { id:'gunner_captain', tier:4, from:['siege_gunner'], school:'craft',  nameEn:'Gunner Captain', nameVi:'Pháo Trưởng',     role:'Artillery', gate:null, req:{Engineering:65,Firearm:50}, trial:'Broadside', marker:'pháo hai nòng + mũ sĩ quan', summary:'' },
    { id:'ale_sage',       tier:4, from:['plague_doctor'],school:'craft',  nameEn:'Ale Sage',       nameVi:'Tửu Sư',          role:'Alchemist', gate:null, req:{Alchemy:65},           trial:'Last keg',      marker:'thùng bia trên lưng + cốc', summary:'Buff đồng minh bằng rượu; hài nhưng hợp chất dwarf.' }
  ]
};
