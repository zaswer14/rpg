/* Chủng tộc: FAE (tiên linh / yêu tinh) — huyền thuật, bóng tối, thuần hóa; cấm giáp nặng và cơ khí. */
window.JobLibrary = window.JobLibrary || {}; window.JobLibrary.races = window.JobLibrary.races || {};
window.JobLibrary.races.fae = {
  id:'fae', nameEn:'Fae', nameVi:'Yêu Tinh',
  lore:'Không nói dối nhưng không bao giờ nói thật; mọi hợp đồng là một kỹ năng.',
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
    { id:'trickster',     tier:4, from:['stalker'],      school:'shadow', nameEn:'Trickster',     nameVi:'Kẻ Lừa Phỉnh', role:'Scout',   gate:null, req:{Stealth:65,Arcane:40}, trial:'Three wishes',  marker:'mặt nạ cười + 2 ảo ảnh của chính mình', summary:'' },
    { id:'dreamweaver',   tier:4, from:['oracle'],       school:'death',  nameEn:'Dreamweaver',   nameVi:'Kẻ Dệt Mộng',  role:'Support', gate:null, req:{Soul:60},              trial:'Sleepless',     marker:'bụi mộng bay quanh + mắt nhắm', summary:'Death foreign, chỉ Soul.' },
    { id:'glamour_blade', tier:4, from:['blademaster'],  school:'combat', nameEn:'Glamour Blade', nameVi:'Ảo Kiếm',      role:'Duelist', gate:null, req:{Sword:60,Arcane:50},   trial:'Mirror dance',  marker:'kiếm vô hình (chỉ thấy vệt) + găng ren', summary:'Combat foreign nhưng có ngọn vì lai Arcane.' },
    { id:'briar_warden',  tier:4, from:['beast_rider'],  school:'beast',  nameEn:'Briar Warden',  nameVi:'Gai Vệ Yêu',   role:'Beastmaster', gate:null, req:{Taming:60,Nature:40}, trial:'Thorn pact',  marker:'cưỡi hươu gai + rễ bò dưới chân', summary:'' },
    { id:'court_mage',    tier:4, from:['warlock'],      school:'arcane', nameEn:'Court Mage',    nameVi:'Đình Pháp Sư', role:'Mage',    gate:null, req:{Arcane:70},            trial:'Oath of court', marker:'áo bào màu đình (hạ/đông) + gậy hoa/băng', summary:'' },
    { id:'archfae',       tier:5, from:['court_mage'],   school:'arcane', nameEn:'Archfae',       nameVi:'Đại Yêu',      role:'Mythic',  gate:null, req:{Arcane:90},            trial:'Court trial',   marker:'vương miện hoa/băng theo đình + cánh lớn hơn', summary:'' }
  ]
};
