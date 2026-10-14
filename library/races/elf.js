/* Chủng tộc: ELF — tầm xa, huyền thuật, bóng tối; cấm cơ khí. */
window.JobLibrary = window.JobLibrary || {}; window.JobLibrary.races = window.JobLibrary.races || {};
window.JobLibrary.races.elf = {
  id:'elf', nameEn:'Elf', nameVi:'Tiên Tộc',
  lore:'Sống lâu, nhớ dai, ghét máy móc; mọi kỹ năng là một bài hát học trong ba trăm năm.',
  leaning:{ school:'arcane', note:'Sở trường Arcane (Archmage → Starweaver) và Ranged. Nhánh sở trường riêng: bài hát — Kẻ Dệt Khúc → Người Giữ Khúc Cổ → Ca Giả Thế Giới; phép của elf đi qua âm nhạc và trí nhớ, không qua sách.' },
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
    { id:'thorn_warden', tier:3, from:['hunter'],       school:'ranged', nameEn:'Thorn Warden', nameVi:'Gai Vệ',           role:'Hunter',      gate:null, req:{Bow:40,Nature:30}, trial:'Briar',        marker:'gai mọc từ cánh tay + bẫy rễ', summary:'Terminal T3.' },
    { id:'forest_elder',  tier:5, from:['ranger_lord'],  school:'beast',  nameEn:'Forest Elder',  nameVi:'Trưởng Lão Rừng Già', role:'Mythic',   gate:null, req:{Taming:85,Bow:70},   trial:'Thousand rings', marker:'cưỡi nai cổ thụ có cây mọc trên lưng + tóc bạc dài chấm đất', summary:'Evolution Ancient. Thú cưỡi là một cây di động: dừng lại thì bén rễ thành vật cản và điểm hồi máu.' },
    // Nhánh sở trường: bài hát.
    { id:'songweaver',    tier:3, from:['elementalist'], school:'arcane', schoolAlt:['martial'], nameEn:'Songweaver', nameVi:'Kẻ Dệt Khúc', role:'Bard', gate:null, req:{Arcane:35,Spirit:25}, trial:'First verse', marker:'đàn hạc nhỏ + nốt nhạc bạc bay quanh', summary:'Mỗi câu hát để lại một nốt lơ lửng; đồng minh chạm nốt nhận buff, địch chạm nốt bị Mê ngắn.' },
    { id:'lorekeeper',    tier:4, from:['songweaver'],   school:'arcane', nameEn:'Lorekeeper',     nameVi:'Người Giữ Khúc Cổ', role:'Bard',    gate:null, req:{Arcane:60,Spirit:45}, trial:'Three hundred years', marker:'cuộn khúc cổ bay quanh như dải lụa + mắt bạc', summary:'Hát lại một skill vừa thấy (của đồng minh hoặc địch) một lần; khúc cổ: buff theo đúng khuôn nghề của từng đồng minh.' },
    { id:'worldsinger',   tier:5, from:['lorekeeper'],   school:'arcane', nameEn:'Worldsinger',    nameVi:'Ca Giả Thế Giới',  role:'Mythic',  gate:null, req:{Arcane:90,Spirit:70}, trial:'Song of making', marker:'không nhạc cụ, miệng phát sáng, cây cối nghiêng theo nhịp', summary:'Hát đổi màn chơi: một đoạn nhạc trọn vẹn mọc platform/cầu, một đoạn khác làm địa hình địch sụp.' },
    { id:'eclipse_blade', tier:5, from:['spellblade'],   school:'combat', nameEn:'Eclipse Blade', nameVi:'Nhật Thực Kiếm',   role:'Mythic',      gate:null, req:{Sword:85,Arcane:80}, trial:'Eclipse duel',   marker:'hai kiếm: một sáng một tối, xoay quanh người khi không cầm', summary:'Đổi giữa kiếm Sáng (sát thương lớn, chậm) và kiếm Tối (nhanh, hút máu) không ngắt combo; nhật thực = cầm cả hai 5s.' }
  ]
};
