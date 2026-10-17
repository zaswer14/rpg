/* Job Library — GIÁO PHÁI (faith): tín ngưỡng của thế giới, mở cho mọi chủng tộc (trừ chủng tộc bị xa lánh).
 * Hai giáo phái lớn (Quang Minh / Hắc Giáo) loại trừ nhau; các giáo phái nhỏ gắn với một khí chất.
 * Mỗi chủng tộc có đúng một tín ngưỡng gốc (`folk`, 17/10/2026): người Quang Minh, Bộ Xương Hắc Giáo, Tiên Tộc Cổ Thần, Orc Tổ Linh,
 * Hải Tộc Vực Giáo, Cơ Nhân Lò Rèn, Người Lùn Đạo Đá Tổ, Người Thú Thú Linh, Yêu Tinh Khế Ước Bốn Mùa, Long Nhân Long Hỏa.
 * Tộc khác vẫn theo được (cải đạo), chỉ không được ưu ái.
 *
 * Tín ngưỡng là trục thứ hai bên cạnh chủng tộc để biến đổi nghề:
 *   - Một dạng nghề (archetypes/*.js) có thể yêu cầu `faith`; `race:'*'` = mọi chủng tộc theo tín ngưỡng đó.
 *   - Ngọn tín ngưỡng (`crowns` dưới đây) là nghề mọi tín đồ đủ Devotion đều tới được, bất kể chủng tộc; compose() ghép chúng vào cây.
 *   - Thứ tự chọn dạng khi vào một khuôn: chủng tộc + tín ngưỡng > chỉ tín ngưỡng > chỉ chủng tộc > dạng chung.
 *
 * Trường:
 *   scale: 'major' | 'minor' · aspect: khí chất chính (aspects.js) · symbol: ký hiệu hiển thị · folk: chủng tộc gốc của đạo
 *   power: cách giáo phái cấp sức mạnh (quyết định cảm giác chơi của mọi dạng thuộc giáo phái)
 *   devotion: Devotion 0–100 tích qua hành vi; gates = Devotion tối thiểu để vào ngọn/dạng theo Tier
 *   races: favored = tích Devotion ×1,5; wary = gate +15 (như foreign); shunned = không vào được
 *   rival: giáo phái loại trừ; bỏ đạo để sang phe đối địch là `apostasy` (mất hết Devotion, mở nghề ẩn nếu có)
 *   blessing: luật thụ động mọi tín đồ nhận ở Devotion ≥ 30, kể cả khi nghề không thuộc giáo phái
 *   crowns: như crowns của chủng tộc, thêm `faith` khi ghép; `from` là nghề thân chung hoặc ngọn cùng giáo phái
 */
window.JobLibrary = window.JobLibrary || {};
window.JobLibrary.faiths = {
  light: {
    id:'light', nameEn:'Church of the Dawn', nameVi:'Thánh Giáo Quang Minh', scale:'major', aspect:'light', symbol:'☀', folk:'human',
    tenet:'Ánh sáng là trật tự: giữ giới, che chở kẻ yếu, thiêu rụi thứ không thuộc về thế giới sống.',
    power:'vow', powerNote:'Lời thề: sức mạnh có mặt chừng nào còn giữ giới (không bỏ đồng minh, không giết kẻ đã hàng, không dùng tử thuật). Phá giới mất Devotion ngay.',
    devotion:{ gates:{ 3:30, 4:60, 5:90 }, gain:'chữa lành, chặn đòn thay đồng minh, tiêu diệt undead/curse', lose:'dùng skill Death, kết liễu địch đã bị khống chế, bỏ đồng minh gục' },
    races:{ favored:['human'], wary:['skeleton','fae'], shunned:[] },
    raceNotes:{ skeleton:'Undead theo Quang Minh là "kẻ sám hối": hào quang thiêu chính mình chậm, bù lại là dạng riêng (Kỵ Sĩ Sám Hối, Thánh Cốt).' },
    rival:'dark', ranks:['Tín Đồ','Tu Sĩ','Thánh Vệ','Giám Mục','Thánh'],
    blessing:'Hồi 2% máu khi chặn đòn hoặc chữa đồng minh; sát thương +20% lên undead và mục tiêu bị Curse.',
    accent:'#F6E7A8', marker:'biểu tượng mặt trời trên ngực/khiên + dải vải trắng',
    crowns:[
      { id:'paladin',        tier:3, from:['guard'],             school:'combat', nameEn:'Paladin',        nameVi:'Thánh Kỵ Sĩ',      role:'Tank',      gate:null, req:{Shield:50,Spirit:25}, trial:'Vigil',          marker:'khiên có mặt trời + áo choàng trắng vai', summary:'Guard + lời thề bảo hộ; hồi máu khi block.' },
      { id:'exorcist',       tier:3, from:['medium'],            school:'death',  nameEn:'Exorcist',       nameVi:'Trừ Tà Sư',        role:'Hunter',    gate:null, req:{Soul:40,Spirit:30},   trial:'First rite',     marker:'chuông bạc + sách kinh xích tay', summary:'Death nhìn từ phía Ánh Sáng: trục hồn, phá curse, giam undead.' },
      { id:'radiant_knight', tier:4, from:['paladin'],           school:'combat', nameEn:'Radiant Knight', nameVi:'Kỵ Sĩ Ánh Sáng',   role:'Knight',    gate:null, req:{Shield:60,Riding:40}, trial:'Dawn charge',    marker:'thương có cờ mặt trời + ngựa trắng giáp vàng', summary:'Khuôn Kỵ Sĩ, dạng Quang Minh; rig cưỡi.' },
      { id:'crusader_lord',  tier:4, from:['paladin'],           school:'combat', nameEn:'Crusader Lord',  nameVi:'Thập Tự Chúa',     role:'Commander', gate:null, req:{Shield:70,Spirit:50}, trial:'Crusade',        marker:'cờ thập tự cắm lưng + mũ vương miện hở mặt', summary:'' },
      { id:'inquisitor',     tier:4, from:['stalker'],           school:'shadow', nameEn:'Inquisitor',     nameVi:'Phán Quan',        role:'Hunter',    gate:null, req:{Stealth:60,Spirit:40},trial:'Interrogation',  marker:'mũ rộng vành + xích bạc + sách', summary:'Săn phép thuật; khống chế caster.' },
      { id:'cardinal',       tier:4, from:['oracle'],            school:'death',  nameEn:'Cardinal',       nameVi:'Hồng Y',           role:'Support',   gate:null, req:{Soul:60,Spirit:50},   trial:'Consecration',   marker:'mũ hồng y + trượng mặt trời', summary:'Tư tế cấp cao; hồi sinh, thánh hóa vùng.' },
      { id:'living_saint',   tier:5, from:['crusader_lord','cardinal'], school:'combat', nameEn:'Living Saint', nameVi:'Thánh Sống', role:'Mythic', gate:null, req:{Spirit:90}, trial:'Martyrdom', marker:'hào quang thật sau đầu + không mũ, không khiên', summary:'Đỉnh Quang Minh, mọi chủng tộc. Chết trong trận một lần thì hồi sinh với hào quang thiêu mọi thứ xung quanh.' }
    ]
  },

  dark: {
    id:'dark', nameEn:'Covenant of Dusk', nameVi:'Hắc Giáo', scale:'major', aspect:'dark', symbol:'☾', folk:'skeleton',
    tenet:'Không có trật tự, chỉ có giá. Mọi sức mạnh đều mua được bằng máu, ký ức hoặc người khác.',
    power:'pact', powerNote:'Giao kèo: không mượn sức mạnh của thần mà trả giá để lấy. Mỗi skill Hắc Giáo có giá (máu, Devotion, thuộc hạ). Không có giới để phá; chỉ có nợ để trả. Hắc Giáo không phải bản sao của Quang Minh: không có "tư tế hắc ám chữa lành", chỉ có kẻ chuyển vết thương sang người khác.',
    devotion:{ gates:{ 3:30, 4:60, 5:90 }, gain:'kết liễu, hút máu, hiến tế thuộc hạ, dùng skill có giá máu', lose:'không mất; Devotion chỉ giảm khi "trả nợ" (dùng Devotion làm tài nguyên)' },
    races:{ favored:['skeleton'], wary:['dragonkin','construct'], shunned:[] },
    raceNotes:{ human:'Hắc Giáo là cửa chính để human vào trường phái Death (ngoài nghề ẩn Heretic).', construct:'Cơ nhân không có máu để trả: dùng Nhiệt/lõi làm giá, gate +15.' },
    rival:'light', ranks:['Kẻ Ký Kết','Môn Đồ','Hắc Vệ','Tiên Tri','Hắc Chúa'],
    blessing:'Hút 5% sát thương gây ra thành máu; máu dưới 30% thì sát thương +15%.',
    accent:'#7A5BA8', marker:'mắt tối, ký hiệu trăng khuyết khắc trên da/giáp + sợi xích hoặc dây trói',
    crowns:[
      { id:'blackguard',     tier:3, from:['guard'],             school:'combat', nameEn:'Blackguard',     nameVi:'Hắc Vệ',           role:'Tank',      gate:null, req:{Shield:50},           trial:'Signing',        marker:'khiên đen có mặt trăng khuyết + xích quấn tay', summary:'Thủ Vệ của Hắc Giáo: chặn đòn thì hút máu kẻ đánh.' },
      { id:'dark_knight',    tier:4, from:['blackguard'],        school:'combat', nameEn:'Dark Knight',    nameVi:'Hắc Kỵ Sĩ',        role:'Knight',    gate:null, req:{Shield:60,Riding:40}, trial:'Night ride',     marker:'mũ sừng gãy + áo choàng rách đỏ sẫm + ngựa đen mắt đỏ', summary:'Khuôn Kỵ Sĩ, dạng Hắc Giáo; rig cưỡi.' },
      { id:'oathbreaker',    tier:4, from:['paladin'],           school:'combat', hidden:true, unlock:'apostasy:light→dark', nameEn:'Oathbreaker', nameVi:'Kẻ Phá Thề', role:'Knight', gate:null, req:{Shield:60}, trial:'Burning the vow', marker:'khiên mặt trời bị cào nát + ánh sáng tím', summary:'Chỉ Thánh Kỵ Sĩ bỏ đạo sang Hắc Giáo mới mở. Lời thề âm: mạnh lên khi đồng minh gục.' },
      { id:'shadow_cross',   tier:4, from:['stalker'],           school:'shadow', nameEn:'Shadow Cross',  nameVi:'Thập Tự Bóng',     role:'Assassin',  gate:null, req:{Dagger:60,Stealth:50},trial:'Blood contract', marker:'hai dao chéo khắc trăng + mặt nạ nửa', summary:'Sát thủ có hợp đồng: mục tiêu đã ký (đánh dấu) nhận sát thương gấp đôi, mục tiêu khác gấp rưỡi ít hơn.' },
      { id:'dread_prophet',  tier:4, from:['oracle'],            school:'death',  nameEn:'Dread Prophet',  nameVi:'Tiên Tri Hắc Ám',  role:'Hexer',     gate:null, req:{Curse:60,Soul:40},    trial:'Whispering',     marker:'mắt bịt vải đen + nhiều tay bùa đen bay quanh', summary:'Nguyền rủa diện rộng; chuyển vết thương đồng minh sang địch (không chữa, chỉ chuyển).' },
      { id:'fell_sovereign', tier:5, from:['dark_knight','oathbreaker'], school:'combat', nameEn:'Fell Sovereign', nameVi:'Hắc Chúa', role:'Mythic', gate:null, req:{Shield:85,Spirit:60}, trial:'Last price', marker:'vương miện gai đen mọc từ da + áo choàng bằng bóng', summary:'Đỉnh Hắc Giáo nhánh chiến. Trả toàn bộ Devotion để bất tử 8s.' },
      { id:'heresiarch',     tier:5, from:['dread_prophet'],     school:'death',  nameEn:'Heresiarch',     nameVi:'Giáo Chủ Dị Giáo', role:'Mythic',    gate:null, req:{Curse:90,Soul:70},    trial:'Black mass',     marker:'mũ mitre đen ngược + đám tín đồ bóng đi theo', summary:'Đỉnh Hắc Giáo nhánh phép. Biến địch bị Curse thành tín đồ tạm (thuộc hạ) khi kết liễu.' }
    ]
  },

  wild: {
    id:'wild', nameEn:'Old Gods of the Wild', nameVi:'Cổ Thần Hoang Dã', scale:'minor', aspect:'nature', symbol:'❦', folk:'elf',
    tenet:'Rừng có trước thần; thứ gì chết đi phải mọc lại.',
    power:'communion', powerNote:'Hiệp thông: sức mạnh đến từ địa hình (cây, rễ, nước, đá); ở nơi không có sự sống (hầm, thành phố máy) tín đồ yếu đi.',
    devotion:{ gates:{ 3:30, 4:60, 5:90 }, gain:'trồng/khôi phục địa hình, hạ construct, không giết thú', lose:'đốt rừng, hạ thú hoang' },
    races:{ favored:['elf'], wary:['construct','dwarf'], shunned:[] },
    rival:null, ranks:['Hạt','Chồi','Thân','Tán','Rừng Già'],
    blessing:'Đứng trên cỏ/đất/rễ hồi 1% máu mỗi 2s; miễn Root.',
    accent:'#7FBF6A', marker:'lá/gạc/rêu mọc trên gear',
    crowns:[
      { id:'druid',     tier:4, from:['oracle','beast_rider'], school:'beast', nameEn:'Druid',     nameVi:'Tu Sĩ Rừng', role:'Shapeshifter', gate:null, req:{Taming:50,Soul:40}, trial:'First shape', marker:'áo choàng lông + gạc trên mũ trùm', summary:'Hai dạng gấu/cú; cho mọi chủng tộc theo Cổ Thần.' },
      { id:'archdruid', tier:5, from:['druid'],           school:'beast', nameEn:'Archdruid', nameVi:'Đại Tu Sĩ Rừng', role:'Mythic',   gate:null, req:{Taming:85,Soul:70}, trial:'Oldest tree', marker:'thân nửa cây, tóc rễ + không mặt', summary:'Đổi hẳn một phần màn thành rừng (địa hình); dạng thứ ba: cây cổ thụ đứng yên bất tử.' }
    ]
  },

  ancestor: {
    id:'ancestor', nameEn:'Way of the Ancestors', nameVi:'Tổ Linh Đạo', scale:'minor', aspect:'ancestor', symbol:'⌂', folk:'orc',
    tenet:'Người chết không đi đâu cả; họ đứng sau lưng và nhìn.',
    power:'rite', powerNote:'Nghi lễ: sức mạnh đến từ hồn tổ tiên hiện ra ở mốc máu/thời điểm cố định, không gọi tùy ý. Khác Death: không điều khiển xác, chỉ mời hồn.',
    devotion:{ gates:{ 3:30, 4:60, 5:90 }, gain:'chiến thắng danh dự (không chạy), bảo vệ đồng minh, thờ cúng tại đền', lose:'bỏ chạy khỏi trận, hạ đồng tộc' },
    races:{ favored:['orc'], wary:['fae','construct'], shunned:[] },
    raceNotes:{ dwarf:'Đây là lối duy nhất dwarf chạm tới trường phái Death (chỉ nhánh Spirit).' },
    rival:null, ranks:['Con Cháu','Người Giữ Lửa','Trưởng Tộc','Tộc Trưởng','Tổ'],
    blessing:'Lần đầu xuống dưới 15% máu mỗi trận: hồn tổ tiên chặn một đòn và đẩy lùi địch quanh.',
    accent:'#E3B868', marker:'tượng/bia nhỏ đeo người + chỉ vàng trên tóc/râu',
    crowns:[
      { id:'ancestor_speaker', tier:4, from:['oracle'],          school:'death', nameEn:'Ancestor Speaker', nameVi:'Kẻ Nói Với Tổ Tiên', role:'Shaman', gate:null, req:{Soul:60}, trial:'Ancestral hall', marker:'bia đá nhỏ đeo lưng + tóc/râu tết chỉ vàng', summary:'Totem là bia đá; mỗi bia gọi một hồn tổ tiên (thợ rèn / chiến binh / thợ mỏ).' },
      { id:'ancestor_avatar',  tier:5, from:['ancestor_speaker'], school:'death', nameEn:'Ancestor Avatar', nameVi:'Hóa Thân Tổ Linh', role:'Mythic', gate:null, req:{Soul:90}, trial:'Hundred names', marker:'thân mờ nửa trên là một tổ tiên khổng lồ chồng lên', summary:'Nhập thân tổ tiên lớn: thân to gấp đôi trong 10s, mọi đòn là đòn của tổ tiên.' }
    ]
  },

  deep: {
    id:'deep', nameEn:'Cult of the Deep', nameVi:'Vực Giáo', scale:'minor', aspect:'abyss', symbol:'◉', folk:'merfolk',
    tenet:'Dưới đáy có thứ đang ngủ; mọi giọng nói là một tiếng gọi xuống.',
    power:'pact', powerNote:'Giao kèo với thứ không tên: giống Hắc Giáo về giá, nhưng trả bằng lý trí (Sanity) thay vì máu; Sanity thấp mở sức mạnh và mất kiểm soát một số lệnh.',
    devotion:{ gates:{ 3:30, 4:60, 5:90 }, gain:'ở lâu trong nước/bóng tối, kéo địch xuống hố, nghe "giọng"', lose:'phơi nắng lâu, phá tế đàn' },
    races:{ favored:['merfolk'], wary:['dragonkin','human'], shunned:[] },
    raceNotes:{ merfolk:'Lối duy nhất merfolk chạm tới Death (Abyss Priest).', skeleton:'Abyss Sovereign của skeleton thuộc Vực Giáo, không thuộc Hắc Giáo.' },
    rival:'light', ranks:['Kẻ Nghe','Kẻ Lặn','Tư Tế','Tiên Tri','Kẻ Thức Tỉnh'],
    blessing:'Địch gần tín đồ bị kéo nhẹ về phía tín đồ mỗi 3s; tín đồ không bị đẩy lùi khi đứng trong nước/bóng.',
    accent:'#4A3B8F', marker:'mắt phát quang + xúc tu/vảy mọc ở một chỗ không nên có',
    crowns:[
      { id:'abyss_priest',    tier:4, from:['warlock','oracle'], school:'death', hidden:true, unlock:'event:deep_voice', nameEn:'Abyss Priest', nameVi:'Tư Tế Vực Sâu', role:'Support', gate:null, req:{Soul:50}, trial:'Descent', marker:'đèn cá vực sâu treo trước mặt + áo bào tối', summary:'Nghề ẩn: nghe được "giọng". Kéo địch về ánh đèn; đồng minh trong vùng thấy mọi thứ tàng hình.' },
      { id:'drowned_prophet', tier:5, from:['abyss_priest'],     school:'death', nameEn:'Drowned Prophet', nameVi:'Tiên Tri Chết Chìm', role:'Mythic', gate:null, req:{Soul:85}, trial:'Awakening', marker:'nửa thân dưới tan thành nước đen + nhiều mắt', summary:'Mở "miệng vực" trên sàn: hố tạm nuốt địch, đồng minh nhảy qua được.' }
    ]
  },

  forge: {
    id:'forge', nameEn:'Church of the Eternal Forge', nameVi:'Giáo Hội Lò Rèn', scale:'minor', aspect:'machine', symbol:'⚙', folk:'construct',
    tenet:'Thịt mục, thép thì không. Hoàn hảo là thay thế.',
    power:'rite', powerNote:'Nghi lễ cải tạo: tín đồ thay dần bộ phận bằng máy (mỗi bậc Devotion đổi một bộ phận: tay → chân → mắt → tim). Sức mạnh ổn định, không bùng nổ, dùng Nhiệt thay mana.',
    devotion:{ gates:{ 3:30, 4:60, 5:90 }, gain:'sửa trụ/construct, chế tạo, không dùng phép', lose:'dùng skill Arcane/Death, phá máy' },
    races:{ favored:['construct'], wary:['elf','beastfolk','fae'], shunned:[] },
    raceNotes:{ elf:'Elf cấm Engineering; theo Giáo Hội Lò Rèn là cách duy nhất elf tới Artificer-line (gate +15).' },
    rival:'wild', ranks:['Phôi','Bánh Răng','Pít-tông','Lõi','Động Cơ'],
    blessing:'Giáp +10%; không bị Bleed; mất 20% hiệu quả hồi máu từ nguồn sống (thuốc, phép).',
    accent:'#B8862B', marker:'một bộ phận cơ khí lộ (tay/chân/mắt) ngày càng nhiều theo rank',
    crowns:[
      { id:'forge_priest',    tier:3, from:['engineer','guard'], school:'craft', nameEn:'Forge Priest',    nameVi:'Tư Tế Lò Rèn',   role:'Support', gate:null, req:{Engineering:40,Spirit:25}, trial:'First replacement', marker:'tay máy + búa nghi lễ + áo choàng da thuộc', summary:'Sửa đồng minh như sửa máy; buff giáp bằng bu-lông.' },
      { id:'iron_oracle',     tier:4, from:['forge_priest'],     school:'craft', nameEn:'Iron Oracle',     nameVi:'Thiết Tiên Tri', role:'Support', gate:null, req:{Engineering:65,Spirit:45}, trial:'Second heart',      marker:'mắt ống kính + ngực mở thấy bánh răng', summary:'Dự đoán đòn địch (hiện hitbox trước 0,5s cho cả đội).' },
      { id:'engine_of_faith', tier:5, from:['iron_oracle'],      school:'craft', nameEn:'Engine of Faith', nameVi:'Cỗ Máy Đức Tin', role:'Mythic',  gate:null, req:{Engineering:90,Spirit:70}, trial:'Final replacement', marker:'thân gần như toàn máy, chỉ còn mặt là thịt/xương', summary:'Hoàn tất cải tạo: biến đổi thân vĩnh viễn (Body Evolution Mechanical cho mọi chủng tộc).' }
    ]
  },

  // ── Tín ngưỡng gốc của bốn tộc chưa có đạo riêng (17/10/2026). Chưa có ngọn tín ngưỡng: tín đồ vào nghề qua cây của chủng tộc. ──
  stone: {
    id:'stone', nameEn:'Faith of the Stone Fathers', nameVi:'Đạo Đá Tổ', scale:'minor', aspect:'stone', symbol:'▲', folk:'dwarf',
    tenet:'Tổ tiên không đi đâu cả: họ ngủ trong lòng núi, tên khắc trên vách, hơi thở là lửa lò chung. Giữ lò, giữ lời, đòi đủ nợ.',
    power:'rite', powerNote:'Nghi lễ của lò và vách: sức mạnh đến từ lửa lò chung và tên tổ tiên khắc trên đá; mạnh dưới lòng đất, xa núi thì yếu dần. Lời thề trên Đá Thề không rút lại được.',
    devotion:{ gates:{ 3:30, 4:60, 5:90 }, gain:'rèn, đào, khắc tên tổ tiên, giữ lời thề, đòi nợ đúng hạn', lose:'bỏ qua món nợ, để lò chung tắt, bỏ hầm mà chạy' },
    races:{ favored:['dwarf'], wary:['elf','fae'], shunned:[] },
    raceNotes:{ dwarf:'Đạo của Người Lùn: không có thần, chỉ có tổ tiên trong đá. Thạch Vu (Kẻ Nói Với Đá) là người hành lễ của đạo này.' },
    rival:null, ranks:['Phôi Đá','Thợ Phụ','Thợ Cả','Người Giữ Vách','Tổ Đá'],
    blessing:'Đứng trên đá hoặc dưới hầm: giáp +10%, không bị hất ngã.',
    accent:'#B08D57', marker:'búa nhỏ đeo cổ + chỉ đồng tết trong râu',
    crowns:[]
  },

  totem: {
    id:'totem', nameEn:'Way of the Beast Spirits', nameVi:'Thú Linh Đạo', scale:'minor', aspect:'feral', symbol:'✶', folk:'beastfolk',
    tenet:'Mỗi bầy có một thú tổ đi trước. Trăng chọn hình cho đứa trẻ, bầy chọn chỗ cho nó; ăn một mình là phụ bầy.',
    power:'communion', powerNote:'Hiệp thông với thú tổ: mạnh khi đi cùng bầy, yếu khi một mình. Thú tổ hiện trong giấc mơ đầu đời và ở cột totem của bầy.',
    devotion:{ gates:{ 3:30, 4:60, 5:90 }, gain:'săn cùng bầy, chia mồi, che chở con non, khắc chuyện lên cột totem', lose:'ăn mồi một mình, bỏ bầy, giết con thú cùng loài với thú tổ' },
    races:{ favored:['beastfolk'], wary:['construct'], shunned:[] },
    rival:null, ranks:['Con Non','Kẻ Săn','Người Giữ Totem','Kẻ Nghe Trăng','Thú Tổ'],
    blessing:'Có đồng minh trong 6 ô: tốc độ +10%; đòn đầu tiên mỗi trận +20%.',
    accent:'#C9884A', marker:'nanh thú tổ đeo cổ + vạch màu đất trên mặt',
    crowns:[]
  },

  season: {
    id:'season', nameEn:'Compact of Seasons', nameVi:'Khế Ước Bốn Mùa', scale:'minor', aspect:'glamour', symbol:'❀', folk:'fae',
    tenet:'Đất cho mượn, mùa đòi lại. Lời đã hứa thì không ai rút được, kể cả người hứa.',
    power:'pact', powerNote:'Khế ước với mùa: mỗi mùa cho một thứ phép và đòi lại một thứ (một ký ức, một giọng hát, một năm tuổi). Ai quỵt khế ước thì mùa sau không cho gì.',
    devotion:{ gates:{ 3:30, 4:60, 5:90 }, gain:'giữ lời, đổi đúng giá, dự đủ hội đình bốn mùa', lose:'thất hứa, nói dối thẳng, cầm sắt lạnh khi hành lễ' },
    races:{ favored:['fae'], wary:['dwarf','construct'], shunned:[] },
    rival:null, ranks:['Hạt Sương','Nụ','Hoa','Quả','Gốc Già'],
    blessing:'Mỗi trận, đòn đầu tiên trúng tín đồ chia đôi: nửa rơi vào bóng ảo.',
    accent:'#E3A6D6', marker:'vòng hoa của mùa đang hành lễ + một sợi chỉ bạc buộc cổ tay (khế ước)',
    crowns:[]
  },

  flame: {
    id:'flame', nameEn:'Way of the Dragonfire', nameVi:'Long Hỏa Đạo', scale:'minor', aspect:'fire', symbol:'✺', folk:'dragonkin',
    tenet:'Lửa trong máu là tổ tiên còn thở. Giữ lửa trên đài, giữ tên thị tộc; để lửa tắt là phụ tổ.',
    power:'rite', powerNote:'Nghi lễ đài lửa: mỗi thị tộc giữ một ngọn lửa không tắt; sức mạnh theo độ gần đài lửa và danh dự của thị tộc. Càng dùng lửa càng gần tổ tiên, càng xa người.',
    devotion:{ gates:{ 3:30, 4:60, 5:90 }, gain:'giữ lửa đài, trả nợ thị tộc, thắng trận danh dự', lose:'để lửa đài tắt, quỵt nợ thị tộc, chịu nhục mà không đòi' },
    races:{ favored:['dragonkin'], wary:['merfolk'], shunned:[] },
    rival:null, ranks:['Than','Đốm Lửa','Người Giữ Đài','Ngọn Đài','Long Tổ'],
    blessing:'Miễn Burn; sát thương Fire +10%.',
    accent:'#E0663A', marker:'than hồng đeo trong lồng đồng trước ngực + sừng sơn đỏ',
    crowns:[]
  }
};
