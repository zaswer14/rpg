/* Chủng tộc: ORC — chiến đấu, dã thú, võ thuật thô; cấm huyền thuật thuần, Death chỉ qua Shaman. */
window.JobLibrary = window.JobLibrary || {}; window.JobLibrary.races = window.JobLibrary.races || {};
window.JobLibrary.races.orc = {
  id:'orc', nameEn:'Orc', nameVi:'Orc',
  lore:'Kẻ mạnh dẫn, kẻ yếu theo, kẻ chết được nhớ bằng xương treo trên cờ.',
  origin:{ id:'grunt', tier:0, nameEn:'Grunt', nameVi:'Lính Quèn', summary:'Chùy gỗ, khố da. Marker: răng nanh dưới (thân).' },
  body:{ rig:'humanoid64-broad', notes:'Cao bằng human, vai rộng hơn 6 px, cổ ngắn. Overlay head/torso cần vẽ lại; weapon dùng lại được.',
    evolutions:[
      { id:'warpaint',  nameEn:'Warpainted', nameVi:'Sơn Chiến', visual:'sơn trắng/đỏ toàn thân theo bộ tộc' },
      { id:'bloodfury', nameEn:'Bloodfury',  nameVi:'Huyết Nộ',  visual:'mạch máu nổi, mắt đỏ' }
    ] },
  schools:{ native:['combat','beast','martial'], foreign:['shadow','craft','death','ranged'], forbidden:['arcane'] },
  schoolNotes:{ death:'Chỉ Spirit/Curse qua Medium → Oracle → Blood Shaman.' },
  blockedJobs:['necromancer','grand_necromancer','monk','mystic'],
  prefix:{ en:'Warg', viSuffix:'Orc' },
  accent:{ warpaint:'#F0E6D2', blood:'#B0352F', iron:'#5A5F63' },
  silhouetteHook:'Vũ khí to bất hợp lý, giáp lệch một bên, cờ xương sau lưng từ T3.',
  crowns:[
    { id:'berserker',     tier:3, from:['duelist'],      school:'combat',  nameEn:'Berserker',     nameVi:'Cuồng Chiến',   role:'Bruiser',   gate:null, req:{Axe:55},                trial:'Blood rite',   marker:'không giáp + hai rìu + sơn chiến', summary:'Terminal T3.' },
    { id:'iron_hide',     tier:4, from:['colossus'],     school:'martial', nameEn:'Iron Hide',     nameVi:'Thiết Bì',      role:'Bruiser',   gate:null, req:{Body:70},               trial:'Hundred blows',marker:'da đóng đinh sắt + xích quấn thân', summary:'' },
    { id:'wolf_rider',    tier:4, from:['beast_rider'],  school:'beast',   nameEn:'Wolf Rider',    nameVi:'Kỵ Sói',        role:'Rider',     gate:null, req:{Riding:60},             trial:'Night raid',   marker:'cưỡi sói chiến + lao ngắn', summary:'' },
    { id:'siege_breaker', tier:4, from:['siege_gunner'], school:'craft',   nameEn:'Siege Breaker', nameVi:'Phá Thành',     role:'Artillery', gate:null, req:{Engineering:55,Axe:40}, trial:'Gate down',    marker:'phá thành chùy khổng lồ + thuốc nổ', summary:'Craft foreign nhưng có ngọn vì lai Combat.' },
    { id:'blood_shaman',  tier:4, from:['oracle'],       school:'death',   nameEn:'Blood Shaman',  nameVi:'Huyết Vu',      role:'Support',   gate:null, req:{Curse:60},              trial:'Spirit walk',  marker:'mặt nạ sọ thú + trượng xương + máu bò trên tay', summary:'' },
    { id:'warchief',      tier:5, from:['marshal'],      school:'combat',  nameEn:'Warchief',      nameVi:'Chiến Tù Trưởng', role:'Mythic',  gate:null, req:{Shield:85,Axe:85},      trial:'Horde',        marker:'cờ xương lớn sau lưng + mũ sừng thú', summary:'' }
  ]
};
