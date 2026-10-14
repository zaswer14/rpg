/* Chủng tộc: CONSTRUCT (golem / automaton) — chế tác, chiến đấu, võ thuật-thân; cấm Death, Beast, Shadow. */
window.JobLibrary = window.JobLibrary || {}; window.JobLibrary.races = window.JobLibrary.races || {};
window.JobLibrary.races.construct = {
  id:'construct', nameEn:'Construct', nameVi:'Cơ Nhân',
  lore:'Được chế tạo để phục vụ, thức tỉnh khi chủ chết; mỗi nghề là một bản nâng cấp tự lắp.',
  origin:{ id:'unit', tier:0, nameEn:'Unit', nameVi:'Đơn Vị', summary:'Khung đồng thau trần, một tay thiếu. Marker: lõi sáng ở ngực (thân).' },
  body:{ rig:'humanoid64', notes:'Thân kim loại, khớp lộ; gần skeleton nhất về cấu trúc (xương = khung). Overlay của skeleton dùng lại tốt. Không thở, không máu: Monk/Mystic cấm, Alchemist cấm.',
    evolutions:[
      { id:'brass',   nameEn:'Brass Frame',   nameVi:'Khung Đồng',   visual:'đồng thau bóng, bánh răng lộ' },
      { id:'crystal', nameEn:'Crystal Core',  nameVi:'Lõi Pha Lê',   visual:'lõi lớn phát sáng, khớp pha lê' }
    ] },
  schools:{ native:['craft','combat','martial'], foreign:['arcane','ranged'], forbidden:['death','beast','shadow'] },
  blockedJobs:['monk','mystic','alchemist','plague_doctor'],
  prefix:{ en:'Brass', viSuffix:'Cơ' },
  accent:{ core:'#5FD3FF', brass:'#B8862B', oil:'#2B2724' },
  silhouetteHook:'Khớp tròn, vai hình trụ; không vải, không lông.',
  crowns:[
    { id:'war_frame',      tier:4, from:['phalanx'],      school:'combat',  nameEn:'War Frame',      nameVi:'Chiến Khung',  role:'Formation', gate:null, req:{Shield:65,Engineering:40}, trial:'Hold protocol', marker:'khiên gắn liền cẳng tay + bánh xích chân', summary:'' },
    { id:'siege_engine',   tier:4, from:['siege_gunner'], school:'craft',   nameEn:'Siege Engine',   nameVi:'Cỗ Máy Công Thành', role:'Artillery', gate:null, req:{Engineering:70}, trial:'Bombardment', marker:'pháo gắn thẳng vào vai, không cầm', summary:'' },
    { id:'overseer',       tier:4, from:['artificer'],    school:'craft',   nameEn:'Overseer',       nameVi:'Giám Sát Viên', role:'Engineer', gate:null, req:{Engineering:85}, trial:'Assembly line', marker:'3 drone nhỏ bay quanh + mắt đơn to', summary:'' },
    { id:'core_sovereign', tier:5, from:['overseer'],     school:'craft',   nameEn:'Core Sovereign', nameVi:'Lõi Chúa',     role:'Mythic',    gate:null, req:{Engineering:95}, trial:'Awakening', marker:'lõi mở ra chiếm cả ngực + thân bay', summary:'' },
    { id:'juggernaut',     tier:4, from:['colossus'],     school:'martial', nameEn:'Juggernaut',     nameVi:'Cự Cơ',        role:'Bruiser',   gate:null, req:{Body:70,Engineering:30}, trial:'Wrecking', marker:'nắm đấm piston to gấp đôi', summary:'' },
    { id:'rune_frame',     tier:4, from:['warlock'],      school:'arcane',  nameEn:'Rune Frame',     nameVi:'Khung Rune',   role:'Mage',      gate:null, req:{Arcane:65,Engineering:40}, trial:'Inscription', marker:'rune khắc kín thân + không gậy, bắn từ lòng bàn tay', summary:'Arcane foreign, ngọn vì lai Craft.' }
  ]
};
