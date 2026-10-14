/* Chủng tộc: CONSTRUCT (golem / automaton) — chế tác, chiến đấu, võ thuật-thân; cấm Death, Beast, Shadow. */
window.JobLibrary = window.JobLibrary || {}; window.JobLibrary.races = window.JobLibrary.races || {};
window.JobLibrary.races.construct = {
  id:'construct', nameEn:'Construct', nameVi:'Cơ Nhân',
  lore:'Được chế tạo để phục vụ, thức tỉnh khi chủ chết; mỗi nghề là một bản nâng cấp tự lắp.',
  leaning:{ school:'craft', note:'Sở trường Craft và Martial-Body. Không có Death/Beast/Shadow. Nhánh sở trường riêng: tự nhân bản — Kẻ Lắp Ráp → Tâm Trí Bầy → Siêu Trí: thuộc hạ là bản sao của chính mình, không cần hồn hay thú.' },
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
    { id:'rune_frame',     tier:4, from:['warlock'],      school:'arcane',  nameEn:'Rune Frame',     nameVi:'Khung Rune',   role:'Mage',      gate:null, req:{Arcane:65,Engineering:40}, trial:'Inscription', marker:'rune khắc kín thân + không gậy, bắn từ lòng bàn tay', summary:'Arcane foreign, ngọn vì lai Craft.' },
    // Nhánh sở trường: tự nhân bản.
    { id:'assembler',      tier:3, from:['shaper'],       school:'martial', schoolAlt:['craft'], nameEn:'Assembler', nameVi:'Kẻ Lắp Ráp', role:'Summoner', gate:null, req:{Body:40,Engineering:30}, trial:'Self-test', marker:'tay thứ ba gập sau lưng + hộp linh kiện ở ngực', summary:'Tháo bộ phận của mình lắp thành bản sao nhỏ (thuộc hạ melee, máu lấy từ máu chủ); thu hồi thì máu trả lại.' },
    { id:'hive_mind',      tier:4, from:['assembler'],    school:'martial', schoolAlt:['craft'], nameEn:'Hive Mind', nameVi:'Tâm Trí Bầy', role:'Summoner', gate:null, req:{Body:60,Engineering:50}, trial:'Synchronize', marker:'ba đầu nhỏ trên vai nhấp nháy cùng nhịp', summary:'Bản sao dùng chung lưới: một con thấy thì tất cả thấy; lệnh "đồng bộ" làm mọi bản sao ra đòn đúng lúc chủ ra đòn.' },
    { id:'overmind',       tier:5, from:['hive_mind'],    school:'martial', schoolAlt:['craft'], nameEn:'Overmind', nameVi:'Siêu Trí', role:'Mythic', gate:null, req:{Body:85,Engineering:75}, trial:'Awakening of the many', marker:'thân chính đứng yên bất động, vầng drone/bản sao xoay quanh như hào quang', summary:'Chủ bất động, điều khiển trực tiếp một bản sao (đổi thân); thân chính chết mới thua.' },
    { id:'titan_frame',    tier:5, from:['juggernaut'],   school:'martial', nameEn:'Titan Frame',    nameVi:'Khung Titan',  role:'Mythic',    gate:null, req:{Body:90,Engineering:60}, trial:'Load test',   marker:'thân to gấp đôi (rig riêng) + nắm đấm là cả cẳng tay', summary:'Rig riêng: chậm, không nhảy được, đi qua đâu phá vật cản ở đó; chế độ Neo hút đạn.' },
    { id:'singularity',    tier:5, from:['rune_frame'],   school:'arcane',  nameEn:'Singularity',    nameVi:'Kỳ Dị Điểm',   role:'Mythic',    gate:null, req:{Arcane:90,Engineering:70}, trial:'Collapse',  marker:'lõi là một điểm đen hút ánh sáng + thân nổi cách sàn', summary:'Mở điểm trọng lực kéo mọi đạn/địch; tự thân không di chuyển được khi đang mở.' }
  ]
};
