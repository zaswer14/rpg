/* Chủng tộc: ELF — tầm xa, huyền thuật, bóng tối; cấm cơ khí. */
window.JobLibrary = window.JobLibrary || {}; window.JobLibrary.races = window.JobLibrary.races || {};
window.JobLibrary.races.elf = {
  id:'elf', nameEn:'Elf', nameVi:'Tiên Tộc',
  lore:'Sống lâu, nhớ dai, ghét máy móc; mọi kỹ năng là một bài hát học trong ba trăm năm.',
  origin:{ id:'wayfarer', tier:0, nameEn:'Wayfarer', nameVi:'Lữ Khách', summary:'Áo choàng lá, dao gọt gỗ. Marker: tai dài lộ (thân), không gear.' },
  body:{ rig:'humanoid64', notes:'Thân cao mảnh hơn human 2 px ở chân (vẫn trong ô 64), tai dài là phần thân. Tỷ lệ sọ nhỏ hơn: cần test đọc mặt.',
    evolutions:[
      { id:'ancient', nameEn:'Ancient', nameVi:'Cổ Tiên', visual:'da ngả bạc, mắt không con ngươi' },
      { id:'wild',    nameEn:'Wild',    nameVi:'Hoang Tiên', visual:'rễ/lá mọc trên vai, vằn gỗ trên da' }
    ] },
  schools:{ native:['ranged','arcane','shadow'], foreign:['combat','beast','death'], forbidden:['craft'] },
  schoolNotes:{ craft:'Cấm Engineering (engineer, artificer, siege_gunner, architect). Alchemist/Plague Doctor vẫn mở như foreign.' },
  blockedJobs:['engineer','artificer','siege_gunner','architect'],
  allowDespiteForbidden:['tinkerer','alchemist','plague_doctor'],
  prefix:{ en:'Sylvan', viSuffix:'Tiên' },
  accent:{ moon:'#C9D8FF', leaf:'#7FBF6A', silver:'#D7DEE3' },
  silhouetteHook:'Mọi đường cong (cung, áo, kiếm) đều cong theo một hướng; không có góc vuông.',
  crowns:[
    { id:'ranger_lord',  tier:4, from:['beast_rider'],  school:'beast',  nameEn:'Ranger Lord',  nameVi:'Chúa Tể Kiểm Lâm', role:'Beastmaster', gate:null, req:{Bow:60,Taming:50}, trial:'Old forest',   marker:'cưỡi hươu trắng + mũ lá', summary:'' },
    { id:'windrunner',   tier:4, from:['sniper'],       school:'ranged', nameEn:'Windrunner',   nameVi:'Phong Hành Giả',   role:'Sniper',      gate:null, req:{Bow:75,Wind:40},   trial:'Three peaks',  marker:'cung dài cong như lưỡi liềm + khăn bay ngang', summary:'' },
    { id:'spellblade',   tier:4, from:['blademaster'],  school:'combat', nameEn:'Spellblade',   nameVi:'Pháp Kiếm',        role:'Duelist',     gate:null, req:{Sword:60,Arcane:50}, trial:'Mirror duel', marker:'kiếm cong phát sáng ở sống kiếm + tay trái cầm orb', summary:'Combat foreign nhưng có ngọn vì lai Arcane.' },
    { id:'archmage',     tier:4, from:['warlock'],      school:'arcane', nameEn:'Archmage',     nameVi:'Đại Pháp Sư',      role:'Mage',        gate:null, req:{Arcane:75},        trial:'Four elements',marker:'mũ nhọn cao + gậy hai nhánh', summary:'' },
    { id:'starweaver',   tier:5, from:['archmage'],     school:'arcane', nameEn:'Starweaver',   nameVi:'Kẻ Dệt Sao',       role:'Mythic',      gate:null, req:{Arcane:95},        trial:'Eclipse',      marker:'chòm sao quay quanh người + không gậy', summary:'' },
    { id:'moon_oracle',  tier:4, from:['oracle'],       school:'death',  nameEn:'Moon Oracle',  nameVi:'Nguyệt Tiên Tri',  role:'Support',     gate:null, req:{Soul:60},          trial:'New moon',     marker:'trăng lưỡi liềm sau đầu + bịt mắt bạc', summary:'Death foreign, ngọn hợp lệ vì chỉ dùng Soul (Spirit).' },
    { id:'thorn_warden', tier:3, from:['hunter'],       school:'ranged', nameEn:'Thorn Warden', nameVi:'Gai Vệ',           role:'Hunter',      gate:null, req:{Bow:40,Nature:30}, trial:'Briar',        marker:'gai mọc từ cánh tay + bẫy rễ', summary:'Terminal T3.' }
  ]
};
