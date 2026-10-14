/* Chủng tộc: MERFOLK (hải tộc) — nước, lao móc, thú biển. RỦI RO PIPELINE: thân không chuẩn humanoid64 khi ở dưới nước. */
window.JobLibrary = window.JobLibrary || {}; window.JobLibrary.races = window.JobLibrary.races || {};
window.JobLibrary.races.merfolk = {
  id:'merfolk', nameEn:'Merfolk', nameVi:'Hải Tộc',
  lore:'Lên bờ bằng đôi chân mượn; càng xa biển càng yếu, càng gần vực càng lạ.',
  origin:{ id:'drifter', tier:0, nameEn:'Drifter', nameVi:'Kẻ Trôi Dạt', summary:'Lao gãy, lưới rách. Marker: mang ở cổ + vây tay (thân).' },
  body:{ rig:'humanoid64', notes:'Trên cạn dùng chân (humanoid64, mang + vây là phần thân). Biến thể dưới nước có đuôi = rig riêng "mer-tail", thay idle/run bằng bơi; quyết định sớm có làm biến thể nước hay không, vì nó nhân đôi anim nền.',
    evolutions:[
      { id:'coral', nameEn:'Coral',    nameVi:'San Hô',   visual:'san hô mọc trên vai/giáp' },
      { id:'deep',  nameEn:'Deep One', nameVi:'Thâm Hải', visual:'da tối, mắt phát quang, răng' }
    ] },
  schools:{ native:['arcane','ranged','beast'], foreign:['combat','craft','shadow'], forbidden:['death','martial'] },
  schoolNotes:{ arcane:'Water native, Fire cấm (không có lửa dưới nước): elementalist của merfolk khóa skill fire.', ranged:'Lao/móc (Throwing) thay cung: Archer dùng lao, cùng skill id, khác overlay.', death:'Chỉ Soul qua nghề ẩn Abyss Priest.' },
  hiddenAccess:{ death:{ via:'abyss_priest', note:'Death chỉ mở qua nghề ẩn Abyss Priest, mọc từ Warlock (vì Medium/Oracle thuộc Death đã bị cấm).' } },
  prefix:{ en:'Tide', viSuffix:'Hải' },
  accent:{ tide:'#3FB5C9', pearl:'#E9F2F4', abyss:'#2A1F4F' },
  silhouetteHook:'Vây và mang là đường răng cưa duy nhất trong set; vũ khí là lao/móc/lưới.',
  crowns:[
    { id:'coral_sentinel',  tier:3, from:['guard'],       school:'combat', nameEn:'Coral Sentinel',  nameVi:'San Hô Vệ',      role:'Tank',    gate:null, req:{Shield:50,Water:25},   trial:'Reef wall',    marker:'khiên vỏ sò khổng lồ + san hô trên vai', summary:'Combat foreign; terminal T3.' },
    { id:'harpoon_master',  tier:4, from:['sniper'],      school:'ranged', nameEn:'Harpoon Master',  nameVi:'Lao Sư',         role:'Sniper',  gate:null, req:{Throwing:70},          trial:'Whale',        marker:'lao có dây tời + cuộn dây hông', summary:'' },
    { id:'tidecaller',      tier:4, from:['warlock'],     school:'arcane', nameEn:'Tidecaller',      nameVi:'Triệu Triều',    role:'Mage',    gate:null, req:{Water:75},             trial:'Spring tide',  marker:'nước xoáy quanh chân + gậy san hô', summary:'' },
    { id:'storm_siren',     tier:5, from:['tidecaller'],  school:'arcane', nameEn:'Storm Siren',     nameVi:'Bão Nhân Ngư',   role:'Mythic',  gate:null, req:{Water:90,Lightning:60},trial:'Maelstrom',    marker:'tóc thành sóng + sét trong nước', summary:'' },
    { id:'leviathan_rider', tier:4, from:['beast_rider'], school:'beast',  nameEn:'Leviathan Rider', nameVi:'Kỵ Hải Thú',     role:'Rider',   gate:null, req:{Riding:60,Water:40},   trial:'Deep dive',    marker:'cưỡi cá mập/hải mã + yên san hô', summary:'' },
    { id:'abyss_priest',    tier:4, from:['warlock'],     school:'death',  hidden:true, unlock:'event:deep_voice', nameEn:'Abyss Priest', nameVi:'Tư Tế Vực Sâu', role:'Support', gate:null, req:{Water:60}, trial:'Descent', marker:'đèn cá vực sâu treo trước mặt + áo bào tối', summary:'Nghề ẩn mở Death. Trùng từ "Abyss" với Abyss Sovereign của skeleton: nếu game chọn cả hai chủng tộc, đổi tên một bên.' }
  ]
};
