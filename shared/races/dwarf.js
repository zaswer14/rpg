/* Chủng tộc: DWARF — chiến đấu, chế tác, nỏ; cấm cưỡi thú. Thân thấp: phá luật rig (xem body). */
window.JobLibrary = window.JobLibrary || {}; window.JobLibrary.races = window.JobLibrary.races || {};
window.JobLibrary.races.dwarf = {
  id:'dwarf', nameEn:'Dwarf', nameVi:'Người Lùn',
  lore:'Đào sâu, rèn kỹ, uống nhiều; tin vào đá hơn tin vào thần. Không dùng phép: thứ gì không rèn được, không khắc được thì không đáng tin. Nhưng đá biết nói, và người lùn biết nghe.',
  leaning:{ school:'craft', note:'Sở trường Craft (rune là khắc, không phải phép) và Combat giữ tuyến. Không có Arcane; bù bằng nhánh Thạch Vu (Spirit): vu sư nghe đá, nói với tổ tiên, thân với núi. Shaman là pháp sư duy nhất của người lùn.' },
  origin:{ id:'delver', tier:0, nameEn:'Delver', nameVi:'Thợ Đào', summary:'Cuốc chim, đèn mũ. Marker: râu tết (thân).' },
  body:{ rig:'humanoid64-short', notes:'Thấp hơn 8 px, vai rộng hơn 4 px. Gear overlay KHÔNG dùng lại 1:1 từ humanoid64; phải vẽ lại theo tọa độ vai/tay riêng. Chủng tộc đắt thứ hai về art sau hải tộc.',
    evolutions:[
      { id:'runebound', nameEn:'Runebound', nameVi:'Khắc Rune', visual:'rune sáng trên da/râu' },
      { id:'stoneflesh', nameEn:'Stoneflesh', nameVi:'Thạch Thể', visual:'da hóa đá từng mảng' }
    ] },
  schools:{ native:['combat','craft','ranged'], foreign:['martial','shadow','death'], forbidden:['arcane','beast'] },
  schoolNotes:{ ranged:'Crossbow/Firearm, không Bow (Archer dùng nỏ: cùng skill, khác overlay).', arcane:'Cấm hẳn: người lùn không dùng phép. Elementalist/Warlock/Archmage không mở; Runesmith là Craft (khắc), không cần Arcane.', death:'Chỉ Spirit: Adept → Medium → Oracle → Thạch Vu. Necromancer cấm.' },
  blockedJobs:['necromancer','grand_necromancer'],
  prefix:{ en:'Iron', viSuffix:'Lùn' },
  accent:{ ember:'#E07A2F', gold:'#D9A441', rune:'#5FA8FF' },
  silhouetteHook:'Hình khối vuông, thấp, nặng; râu là phần silhouette lớn nhất sau vũ khí.',
  crowns:[
    { id:'stone_sentinel', tier:3, from:['guard'],        school:'combat', nameEn:'Stone Sentinel', nameVi:'Thạch Vệ',        role:'Tank',      gate:null, req:{Shield:55},            trial:'Hold the gate', marker:'khiên tháp bằng đá nguyên khối + mũ đá', summary:'Terminal T3.' },
    { id:'ironbreaker',    tier:4, from:['phalanx'],      school:'combat', nameEn:'Ironbreaker',    nameVi:'Phá Thiết',       role:'Formation', gate:null, req:{Shield:70,Axe:50},     trial:'Shield line',   marker:'hai rìu ngắn + mũ có mặt nạ sắt', summary:'' },
    { id:'runesmith',      tier:4, from:['artificer'],    school:'craft',  nameEn:'Runesmith',      nameVi:'Thợ Rune',        role:'Support',   gate:null, req:{Engineering:60,Spirit:30}, trial:'First rune', marker:'búa rèn + rune sáng trên giáp đồng minh', summary:'Rune là khắc chứ không phải phép: sức mạnh đến từ đá và tổ tiên (Spirit), không từ Arcane.' },
    { id:'forge_king',     tier:5, from:['architect'],    school:'craft',  nameEn:'Forge King',     nameVi:'Lò Rèn Vương',    role:'Mythic',    gate:null, req:{Engineering:95},       trial:'Mountain heart',marker:'vương miện đe + lò rèn di động sau lưng', summary:'' },
    { id:'gunner_captain', tier:4, from:['siege_gunner'], school:'craft',  nameEn:'Gunner Captain', nameVi:'Pháo Trưởng',     role:'Artillery', gate:null, req:{Engineering:65,Firearm:50}, trial:'Broadside', marker:'pháo hai nòng + mũ sĩ quan', summary:'' },
    { id:'ale_sage',       tier:4, from:['plague_doctor'],school:'craft',  nameEn:'Ale Sage',       nameVi:'Tửu Sư',          role:'Alchemist', gate:null, req:{Alchemy:65},           trial:'Last keg',      marker:'thùng bia trên lưng + cốc', summary:'Buff đồng minh bằng rượu; hài nhưng hợp chất dwarf.' },
    { id:'mountain_king',  tier:5, from:['ironbreaker'],  school:'combat', nameEn:'Mountain King',  nameVi:'Sơn Vương',       role:'Mythic',    gate:null, req:{Shield:90,Axe:75},     trial:'Hold the mountain', marker:'vương miện đá + rìu hai lưỡi to bằng người + áo choàng da gấu', summary:'Đứng yên 2s thì hóa đá một phần: miễn khống chế, phản sát thương; thét làm sập trần.' },
    { id:'runelord',       tier:5, from:['runesmith'],    school:'craft',  nameEn:'Runelord',       nameVi:'Rune Chúa',       role:'Mythic',    gate:null, req:{Engineering:85,Spirit:60}, trial:'Master rune', marker:'rune sáng khắc kín râu và giáp + đe bay lơ lửng', summary:'Khắc rune lên chính màn chơi: nền có rune trở thành vùng buff vĩnh viễn trong trận.' },
    // Nhánh sở trường bù cho việc không có Arcane: Thạch Vu (Spirit) — pháp sư duy nhất của người lùn.
    { id:'stonespeaker',   tier:3, from:['medium'],       school:'death',  nameEn:'Stonespeaker',   nameVi:'Kẻ Nói Với Đá',   role:'Shaman',    gate:null, req:{Soul:45,Engineering:20}, trial:'First echo', marker:'tai áp vào đá, đá nhỏ lơ lửng quanh đầu + trượng là cuốc chim', summary:'Totem là mảnh đá nhặt từ chính màn chơi (mỗi loại nền một hiệu ứng); nghe đá: thấy địch đứng trên cùng mặt sàn qua tường.' },
    { id:'gem_oracle',     tier:4, from:['stonespeaker'], school:'death',  nameEn:'Gem Oracle',     nameVi:'Bảo Thạch Tiên Tri', role:'Shaman', gate:null, req:{Soul:65,Engineering:40}, trial:'Heart of the vein', marker:'tinh thể mọc trên râu và vai + một mắt là ngọc', summary:'Totem ngọc lớn dần theo thời gian (ba bậc); khi vỡ bắn mảnh ngọc thành đạn cho đồng minh.' },
    { id:'mountain_soul',  tier:5, from:['gem_oracle'],   school:'death',  nameEn:'Mountain Soul',  nameVi:'Hồn Núi',         role:'Mythic',    gate:null, req:{Soul:90,Engineering:60}, trial:'Speak with the mountain', marker:'nửa thân hóa đá núi, rêu và tinh thể mọc trên người + không trượng', summary:'Gọi hồn ngọn núi: cả màn rung, nền mọc cột đá làm vật cản/platform; đứng yên thì không thể bị đẩy, giết hay khống chế 6s.' }
  ]
};
