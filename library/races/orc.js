/* Chủng tộc: ORC — chiến đấu, dã thú, võ thuật thô; cấm huyền thuật thuần, Death chỉ qua Shaman. */
window.JobLibrary = window.JobLibrary || {}; window.JobLibrary.races = window.JobLibrary.races || {};
window.JobLibrary.races.orc = {
  id:'orc', nameEn:'Orc', nameVi:'Orc',
  lore:'Kẻ mạnh dẫn, kẻ yếu theo, kẻ chết được nhớ bằng xương treo trên cờ.',
  leaning:{ school:'combat', note:'Sở trường Combat thô và Beast. Không có Arcane. Nhánh sở trường riêng: Cuồng Chiến → Huyết Chiến Tướng → Chiến Thần Nhập Thế: càng gần chết càng mạnh, lên đỉnh bằng rage chứ không bằng kỹ thuật.' },
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
    { id:'berserker',     tier:3, from:['duelist'],      school:'combat',  nameEn:'Berserker',     nameVi:'Cuồng Chiến',   role:'Bruiser',   gate:null, req:{Axe:55},                trial:'Blood rite',   marker:'không giáp + hai rìu + sơn chiến', summary:'Đầu nhánh sở trường rage.' },
    { id:'blood_champion',tier:4, from:['berserker'],    school:'combat',  nameEn:'Blood Champion',nameVi:'Huyết Chiến Tướng', role:'Bruiser', gate:null, req:{Axe:70,Body:40},        trial:'Hundred duels', marker:'xương địch đóng vào giáp vai + rìu có dây xích', summary:'Rage không giảm khi hết Điên; mỗi kết liễu trong lúc Điên treo một xương lên giáp (+giáp tích lũy tới hết trận).' },
    { id:'war_incarnate', tier:5, from:['blood_champion'],school:'combat', nameEn:'War Incarnate', nameVi:'Chiến Thần Nhập Thế', role:'Mythic', gate:null, req:{Axe:90,Body:70},        trial:'Last stand',   marker:'thân đỏ rực như than + hai rìu to bằng cửa + không bao giờ đứng thẳng', summary:'Dưới 1 máu không chết trong lúc Điên; Điên kéo dài vô hạn chừng nào còn kết liễu mỗi 4s.' },
    { id:'iron_hide',     tier:4, from:['colossus'],     school:'martial', nameEn:'Iron Hide',     nameVi:'Thiết Bì',      role:'Bruiser',   gate:null, req:{Body:70},               trial:'Hundred blows',marker:'da đóng đinh sắt + xích quấn thân', summary:'' },
    { id:'wolf_rider',    tier:4, from:['beast_rider'],  school:'beast',   nameEn:'Wolf Rider',    nameVi:'Kỵ Sói',        role:'Rider',     gate:null, req:{Riding:60},             trial:'Night raid',   marker:'cưỡi sói chiến + lao ngắn', summary:'' },
    { id:'siege_breaker', tier:4, from:['siege_gunner'], school:'craft',   nameEn:'Siege Breaker', nameVi:'Phá Thành',     role:'Artillery', gate:null, req:{Engineering:55,Axe:40}, trial:'Gate down',    marker:'phá thành chùy khổng lồ + thuốc nổ', summary:'Craft foreign nhưng có ngọn vì lai Combat.' },
    { id:'blood_shaman',  tier:4, from:['oracle'],       school:'death',   nameEn:'Blood Shaman',  nameVi:'Huyết Vu',      role:'Support',   gate:null, req:{Curse:60},              trial:'Spirit walk',  marker:'mặt nạ sọ thú + trượng xương + máu bò trên tay', summary:'' },
    { id:'warchief',      tier:5, from:['marshal'],      school:'combat',  nameEn:'Warchief',      nameVi:'Chiến Tù Trưởng', role:'Mythic',  gate:null, req:{Shield:85,Axe:85},      trial:'Horde',        marker:'cờ xương lớn sau lưng + mũ sừng thú', summary:'' },
    { id:'blood_avatar',  tier:5, from:['blood_shaman'], school:'death',   nameEn:'Blood Avatar',  nameVi:'Hóa Thân Huyết Thần', role:'Mythic', gate:null, req:{Curse:90,Body:60},    trial:'Red moon',     marker:'toàn thân đỏ như lột da + sừng máu đông', summary:'Máu càng thấp totem càng mạnh; dưới 10% máu thì mọi totem nổ thành mưa máu hồi đồng minh, hại địch.' },
    { id:'world_breaker', tier:5, from:['siege_breaker'],school:'craft',   nameEn:'World Breaker', nameVi:'Kẻ Phá Thế Giới', role:'Mythic',  gate:null, req:{Engineering:80,Axe:80}, trial:'Tear down the sky', marker:'chùy khổng lồ có máy nổ gắn trong + lưng cõng thùng thuốc nổ', summary:'Đòn nặng phá cả nền màn chơi (tạo hố tạm); tự chịu một phần sát thương nổ.' }
  ]
};
