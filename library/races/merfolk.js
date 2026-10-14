/* Chủng tộc: MERFOLK (hải tộc) — nước, lao móc, thú biển. RỦI RO PIPELINE: thân không chuẩn humanoid64 khi ở dưới nước. */
window.JobLibrary = window.JobLibrary || {}; window.JobLibrary.races = window.JobLibrary.races || {};
window.JobLibrary.races.merfolk = {
  id:'merfolk', nameEn:'Merfolk', nameVi:'Hải Tộc',
  lore:'Lên bờ bằng đôi chân mượn; càng xa biển càng yếu, càng gần vực càng lạ.',
  leaning:{ school:'arcane', note:'Sở trường Arcane-Water và Beast biển. Không có Martial/Death (trừ Vực Giáo). Nhánh sở trường riêng: tiếng hát biển — Nhân Ngư Ca → Hải Mẫu → Bão Nhân Ngư: mê hoặc và sóng, phép đi qua giọng.' },
  origin:{ id:'drifter', tier:0, nameEn:'Drifter', nameVi:'Kẻ Trôi Dạt', summary:'Lao gãy, lưới rách. Marker: mang ở cổ + vây tay (thân).' },
  body:{ rig:'humanoid64', notes:'Trên cạn dùng chân (humanoid64, mang + vây là phần thân). Biến thể dưới nước có đuôi = rig riêng "mer-tail", thay idle/run bằng bơi; quyết định sớm có làm biến thể nước hay không, vì nó nhân đôi anim nền.',
    evolutions:[
      { id:'coral', nameEn:'Coral',    nameVi:'San Hô',   visual:'san hô mọc trên vai/giáp' },
      { id:'deep',  nameEn:'Deep One', nameVi:'Thâm Hải', visual:'da tối, mắt phát quang, răng' }
    ] },
  schools:{ native:['arcane','ranged','beast'], foreign:['combat','craft','shadow'], forbidden:['death','martial'] },
  schoolNotes:{ arcane:'Water native, Fire cấm (không có lửa dưới nước): elementalist của merfolk khóa skill fire.', ranged:'Lao/móc (Throwing) thay cung: Archer dùng lao, cùng skill id, khác overlay.', death:'Chỉ Soul qua nghề ẩn Abyss Priest.' },
  hiddenAccess:{ death:{ via:'abyss_priest', note:'Death chỉ mở qua Vực Giáo (ngọn tín ngưỡng Abyss Priest, mọc từ Warlock) hoặc Hắc Giáo.' } },
  prefix:{ en:'Tide', viSuffix:'Hải' },
  accent:{ tide:'#3FB5C9', pearl:'#E9F2F4', abyss:'#2A1F4F' },
  silhouetteHook:'Vây và mang là đường răng cưa duy nhất trong set; vũ khí là lao/móc/lưới.',
  crowns:[
    { id:'coral_sentinel',  tier:3, from:['guard'],       school:'combat', nameEn:'Coral Sentinel',  nameVi:'San Hô Vệ',      role:'Tank',    gate:null, req:{Shield:50,Water:25},   trial:'Reef wall',    marker:'khiên vỏ sò khổng lồ + san hô trên vai', summary:'Combat foreign; terminal T3.' },
    { id:'harpoon_master',  tier:4, from:['sniper'],      school:'ranged', nameEn:'Harpoon Master',  nameVi:'Lao Sư',         role:'Sniper',  gate:null, req:{Throwing:70},          trial:'Whale',        marker:'lao có dây tời + cuộn dây hông', summary:'' },
    { id:'tidecaller',      tier:4, from:['warlock'],     school:'arcane', nameEn:'Tidecaller',      nameVi:'Triệu Triều',    role:'Mage',    gate:null, req:{Water:75},             trial:'Spring tide',  marker:'nước xoáy quanh chân + gậy san hô', summary:'' },
    // Nhánh sở trường: tiếng hát biển.
    { id:'siren',           tier:3, from:['elementalist'],school:'arcane', nameEn:'Siren',           nameVi:'Nhân Ngư Ca',    role:'Bard',    gate:null, req:{Water:35,Arcane:25},   trial:'First song',   marker:'tù và ốc xoắn lớn + vây tai xòe khi hát', summary:'Hát kéo địch lại gần (lure) rồi sóng âm hất lên; địch trúng hai câu liên tiếp bị Mê.' },
    { id:'tide_matriarch',  tier:4, from:['siren'],       school:'arcane', nameEn:'Tide Matriarch',  nameVi:'Hải Mẫu',        role:'Bard',    gate:null, req:{Water:60,Arcane:45},   trial:'Chorus',       marker:'vương miện ngọc trai + đàn bằng xương cá voi', summary:'Hợp xướng: đồng minh đứng trong vũng nước hát theo, mỗi người thêm một tầng buff; bài ru làm boss chậm.' },
    { id:'storm_siren',     tier:5, from:['tidecaller','tide_matriarch'], school:'arcane', nameEn:'Storm Siren', nameVi:'Bão Nhân Ngư', role:'Mythic', gate:null, req:{Water:90,Lightning:60}, trial:'Maelstrom', marker:'tóc thành sóng + sét trong nước', summary:'Hội tụ hai lối: phép nước (Triệu Triều) hoặc tiếng hát (Hải Mẫu).' },
    { id:'leviathan_rider', tier:4, from:['beast_rider'], school:'beast',  nameEn:'Leviathan Rider', nameVi:'Kỵ Hải Thú',     role:'Rider',   gate:null, req:{Riding:60,Water:40},   trial:'Deep dive',    marker:'cưỡi cá mập/hải mã + yên san hô', summary:'' },
    { id:'whale_lord',      tier:5, from:['leviathan_rider'], school:'beast', nameEn:'Whale Lord', nameVi:'Kình Vương',      role:'Mythic',  gate:null, req:{Riding:90,Water:70},   trial:'Song of the deep', marker:'cưỡi cá voi nhỏ (rig riêng, rộng gấp đôi) + lao xương cá voi', summary:'Thú cưỡi to nhất game; thổi nước tạo vùng ngập di động.' },
    { id:'drowned_god',     tier:5, from:['abyss_priest'], school:'death', faith:'deep', hidden:true, unlock:'event:deep_voice', nameEn:'Drowned God', nameVi:'Chúa Chìm', role:'Mythic', gate:null, req:{Water:85,Soul:70}, trial:'Surfacing', marker:'thân khổng lồ mờ dưới nước phía sau + vương miện san hô chết', summary:'Lối riêng merfolk từ Tư Tế Vực Sâu (ngọn Vực Giáo): thứ đang ngủ dưới đáy thức dậy làm thuộc hạ.' }
  ]
};
