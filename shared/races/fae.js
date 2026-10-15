/* Chủng tộc: FAE (tiên linh / yêu tinh) — huyền thuật, bóng tối, thuần hóa; cấm giáp nặng và cơ khí. */
window.JobLibrary = window.JobLibrary || {}; window.JobLibrary.races = window.JobLibrary.races || {};
window.JobLibrary.races.fae = {
  id:'fae', nameEn:'Fae', nameVi:'Yêu Tinh',
  lore:'Không nói dối nhưng không bao giờ nói thật; mọi hợp đồng là một kỹ năng.',
  leaning:{ school:'shadow', note:'Sở trường Glamour (Arcane + Shadow). Không có Combat nặng/Craft. Nhánh sở trường riêng: trò đùa — Tiểu Quỷ Trêu → Kẻ Lừa Phỉnh → Vương Tử Dối Trá: thắng bằng việc địch không biết đâu là thật.' },
  origin:{ id:'sprite', tier:0, nameEn:'Sprite', nameVi:'Tiểu Yêu', summary:'Cánh chuồn mờ, không gear. Marker: cánh (thân).' },
  body:{ rig:'humanoid64', notes:'Thân nhỏ hơn human 4 px, cánh chuồn là lớp cape bán trong suốt. Giáp nặng không bao giờ xuất hiện trên thân này.',
    evolutions:[
      { id:'summer', nameEn:'Summer Court', nameVi:'Hạ Đình', visual:'hoa/lá, màu ấm' },
      { id:'winter', nameEn:'Winter Court', nameVi:'Đông Đình', visual:'băng/gai, màu lạnh' }
    ] },
  schools:{ native:['arcane','shadow','beast'], foreign:['ranged','death','martial'], forbidden:['combat','craft'] },
  schoolNotes:{ combat:'Cấm guard/phalanx/marshal; duelist/blademaster mở như foreign (kiếm mỏng).', death:'Chỉ Soul (Medium → Oracle).' },
  blockedJobs:['guard','phalanx','marshal','necromancer','grand_necromancer'],
  allowDespiteForbidden:['fighter','duelist','blademaster'],
  prefix:{ en:'Glamour', viSuffix:'Yêu' },
  accent:{ glamour:'#D98BE0', dusk:'#5B4A8A', bloom:'#F2C94C' },
  silhouetteHook:'Cánh mờ + mọi vật đều nhỏ và cong; không có đường thẳng dài.',
  crowns:[
    // Nhánh sở trường: trò đùa.
    { id:'puck',          tier:3, from:['bandit','assassin'], school:'shadow', schoolAlt:['arcane'], nameEn:'Puck', nameVi:'Tiểu Quỷ Trêu', role:'Trickster', gate:null, req:{Stealth:40,Arcane:25}, trial:'First prank', marker:'mũ chuông + đuôi áo hai màu + luôn cười', summary:'Đánh tráo: đổi vị trí hai địch, đổi vũ khí địch thành đồ chơi 3s, đổi chỗ với đồng minh đang nguy.' },
    { id:'trickster',     tier:4, from:['stalker','puck'],school:'shadow', nameEn:'Trickster',     nameVi:'Kẻ Lừa Phỉnh', role:'Scout',   gate:null, req:{Stealth:65,Arcane:40}, trial:'Three wishes',  marker:'mặt nạ cười + 2 ảo ảnh của chính mình', summary:'Hai lối vào: Kẻ Rình Rập (chung) hoặc Tiểu Quỷ Trêu (riêng).' },
    { id:'prince_of_lies',tier:5, from:['trickster'],    school:'shadow', nameEn:'Prince of Lies',nameVi:'Vương Tử Dối Trá', role:'Mythic', gate:null, req:{Stealth:85,Arcane:70}, trial:'The true name', marker:'mặt nạ không có mặt sau, vương miện là bóng đổ + 4 ảo ảnh', summary:'Đảo thật giả: ảo ảnh của mình gây sát thương thật, bản thân thì không bị đánh trúng cho tới khi ảo ảnh cuối vỡ.' },
    { id:'dreamweaver',   tier:4, from:['oracle'],       school:'death',  nameEn:'Dreamweaver',   nameVi:'Kẻ Dệt Mộng',  role:'Support', gate:null, req:{Soul:60},              trial:'Sleepless',     marker:'bụi mộng bay quanh + mắt nhắm', summary:'Death foreign, chỉ Soul.' },
    { id:'glamour_blade', tier:4, from:['blademaster'],  school:'combat', nameEn:'Glamour Blade', nameVi:'Ảo Kiếm',      role:'Duelist', gate:null, req:{Sword:60,Arcane:50},   trial:'Mirror dance',  marker:'kiếm vô hình (chỉ thấy vệt) + găng ren', summary:'Combat foreign nhưng có ngọn vì lai Arcane.' },
    { id:'briar_warden',  tier:4, from:['beast_rider'],  school:'beast',  nameEn:'Briar Warden',  nameVi:'Gai Vệ Yêu',   role:'Beastmaster', gate:null, req:{Taming:60,Nature:40}, trial:'Thorn pact',  marker:'cưỡi hươu gai + rễ bò dưới chân', summary:'' },
    { id:'court_mage',    tier:4, from:['warlock'],      school:'arcane', nameEn:'Court Mage',    nameVi:'Đình Pháp Sư', role:'Mage',    gate:null, req:{Arcane:70},            trial:'Oath of court', marker:'áo bào màu đình (hạ/đông) + gậy hoa/băng', summary:'' },
    { id:'archfae',       tier:5, from:['court_mage'],   school:'arcane', nameEn:'Archfae',       nameVi:'Đại Yêu',      role:'Mythic',  gate:null, req:{Arcane:90},            trial:'Court trial',   marker:'vương miện hoa/băng theo đình + cánh lớn hơn', summary:'' },
    { id:'dream_king',    tier:5, from:['dreamweaver'],  school:'death',  nameEn:'Dream King',    nameVi:'Mộng Vương',   role:'Mythic',  gate:null, req:{Soul:90,Arcane:60},    trial:'Endless night',  marker:'mắt nhắm vĩnh viễn + vương miện sao + áo bào bằng sương', summary:'Kéo cả màn vào giấc mơ 8s: địch ngủ, đồng minh hồi, mọi thứ chạy chậm nửa tốc.' },
    { id:'thorn_king',    tier:5, from:['briar_warden'], school:'beast',  nameEn:'Thorn King',    nameVi:'Gai Vương',    role:'Mythic',  gate:null, req:{Taming:85,Nature:70},  trial:'Crown of briars', marker:'cưỡi hươu gai khổng lồ có vương miện gai + rễ phủ kín chân', summary:'Rễ gai mọc theo mỗi bước thú cưỡi thành mê cung tạm; địch bị giữ trong rễ mất máu.' }
  ]
};
