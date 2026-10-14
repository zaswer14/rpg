/* Bestiary — LUẬT CHUNG cho quái phụ (quái trên map, ngoài đối thủ chính của màn).
 * Dùng chung mọi game như races/archetypes. Một loài quái = HỌ (family) + KIỂU DI CHUYỂN (behavior) + CỠ (size)
 * + KHÍ CHẤT (aspect, lấy từ ../aspects.js) + Tier đe dọa 0–5. Khi sinh ra trên map, loài nhận thêm CẤP (grade)
 * và, nếu là tinh anh/thủ lĩnh, một vài BIẾN TỐ (affix).
 *
 *  - families[id].rule  : luật gameplay MỌI loài trong họ đều có (runtime đọc trường này, không đọc tên).
 *  - behaviors[id]      : khuôn di chuyển/tấn công (pacer, chaser, charger…), mỗi khuôn một telegraph đọc được.
 *  - sizes[id]          : chỉ số nền theo cỡ; species nhân hệ số lên đây.
 *  - grades[id]         : thường / tinh anh / thủ lĩnh / chúa. Chúa không sinh ngẫu nhiên.
 *  - affixes[id]        : biến tố cho tinh anh/thủ lĩnh (mẫu Dead Cells: tinh anh = to hơn, có hào quang, có luật thêm).
 * Tài liệu và nguồn tham khảo: docs/04_Bestiary_Side_Monsters.md.
 */
window.JobLibrary = window.JobLibrary || {};
window.JobLibrary.bestiaryRules = {
  families: {
    beast:     { nameEn:'Beast',         nameVi:'Quái Thú',   ref:'MH Fanged Beast · DQ Beast · D&D Beast',
                 rule:'pack',      ruleVi:'Bầy đàn: còn đồng loại cùng họ trong 220px thì nhanh và mạnh hơn 25%. Hạ con đầu đàn trước.',
                 loot:['da','nanh','vuốt'], tell:'Dáng thú thật, không phát sáng; nhìn là biết cắn/húc.' },
    magical_beast:{ nameEn:'Magical Beast', nameVi:'Ma Thú',  ref:'D&D Monstrosity · yêu thú huyền huyễn (ma hạch/nội đan)',
                 rule:'core',      ruleVi:'Ma hạch: dưới 40% máu thì hạch bùng một lần, bắn nguyên tố hai phía và tăng tốc. Chết rơi ma hạch (hồi mana).',
                 loot:['ma hạch','da nguyên tố'], tell:'Thú mang vân sáng màu khí chất; vân sáng rực lên là sắp bùng hạch.' },
    dragon:    { nameEn:'Dragon',        nameVi:'Long Tộc',   ref:'MH Wyvern/Elder Dragon · DQ Dragon · RO Dragon',
                 rule:'scale',     ruleVi:'Vảy rồng: mặt trước giáp dày, đánh từ phía sau hoặc lúc đang hít hơi phun ×1,35. Không bị hất/đẩy. Có đòn phun báo trước dài.',
                 loot:['vảy','máu rồng','sừng'], tell:'Ngực phồng sáng trước khi phun; đuôi là hướng an toàn.' },
    insect:    { nameEn:'Vermin',        nameVi:'Trùng Tộc',  ref:'RO Insect · Hollow Knight bọ',
                 rule:'swarm',     ruleVi:'Đàn đông: luôn sinh theo nhóm, từng con yếu; đòn trúng có thể gây Độc.',
                 loot:['vỏ giáp','túi độc'], tell:'Nhỏ, nhiều chân, thường đi thành hàng.' },
    ooze:      { nameEn:'Ooze',          nameVi:'Nhầy',       ref:'DQ Slime · D&D Ooze',
                 rule:'split',     ruleVi:'Phân tách: con cỡ M trở lên chết thì tách hai con nhỏ. Vật lý ×0,7, phép ×1,3.',
                 loot:['dịch nhầy'], tell:'Nảy tưng; to thì sẽ tách.' },
    plant:     { nameEn:'Plantkin',      nameVi:'Thảo Yêu',   ref:'DQ Plant/Nature · RO Plant · D&D Plant',
                 rule:'rooted',    ruleVi:'Bám rễ: không di chuyển, không bị đẩy; 3s không trúng đòn thì hồi 3%/s. Bị Đốt chịu gấp đôi.',
                 loot:['hạt giống','nhựa'], tell:'Đứng yên giữa đường hoặc treo trên mép bệ; lá rung trước khi đớp.' },
    undead:    { nameEn:'Undead',        nameVi:'Bất Tử',     ref:'RO Undead · DQ Undead · D&D Undead',
                 rule:'revive',    ruleVi:'Gượng dậy: lần chết đầu sống lại với 40% máu sau 1,5s, trừ khi đòn kết liễu là phép hoặc gây Đốt.',
                 loot:['xương cũ','tro mộ'], tell:'Hoang hồn không nhận ra người chơi là đồng loại; xác còn rung là sắp dậy.' },
    elemental: { nameEn:'Elemental',     nameVi:'Nguyên Tố Linh', ref:'D&D Elemental · DQ Material/Elemental',
                 rule:'element_body', ruleVi:'Thân nguyên tố: miễn trạng thái cùng khí chất, vật lý ×0,75; chạm vào thân bị dính trạng thái đó.',
                 loot:['tinh thể nguyên tố'], tell:'Không có mắt/miệng thật, thân là vật chất sáng.' },
    construct: { nameEn:'Construct',     nameVi:'Cơ Giới',    ref:'D&D Construct · DQ Machine · RO Formless',
                 rule:'plated',    ruleVi:'Giáp khối: không bị choáng cho tới khi bị Phá giáp; không đuổi quá 300px khỏi ổ.',
                 loot:['bánh răng','lõi đá'], tell:'Chuyển động giật, khe sáng lộ ra khi đã phá giáp.' },
    fiend:     { nameEn:'Fiend',         nameVi:'Yêu Ma',     ref:'D&D Fiend · RO Demon · DQ Demon',
                 rule:'pact',      ruleVi:'Khế ước máu: đòn trúng gây Nguyền và hút 30% sát thương thành máu.',
                 loot:['sừng quỷ','huyết ấn'], tell:'Cánh dơi nhỏ, nụ cười rộng; vệt đỏ khi hút máu.' },
    spirit:    { nameEn:'Spirit',        nameVi:'U Linh',     ref:'RO Ghost (thuộc tính) · Hollow Knight hồn',
                 rule:'ethereal',  ruleVi:'Hư thể: bay xuyên địa hình, đòn vật lý chỉ ăn 50%; phép và Ánh Sáng ăn đủ.',
                 loot:['hồn tinh'], tell:'Bán trong suốt, không chạm đất, không có bóng.' },
    avian:     { nameEn:'Avian',         nameVi:'Phi Cầm',    ref:'MH Bird Wyvern · DQ Bird',
                 rule:'dive',      ruleVi:'Bổ nhào: bay ngoài tầm cận chiến, lao xuống theo đường chéo rồi bay lên; trúng đòn lúc đang lao thì rơi choáng.',
                 loot:['lông vũ','mỏ'], tell:'Kêu và khựng trên không trước khi lao.' }
  },

  // Khuôn di chuyển. Lấy từ bộ mẫu kẻ địch platformer kinh điển (pacer/follower/roamer/floater) + thêm các khuôn hành động.
  behaviors: {
    pacer:    { nameVi:'Tuần tra',  note:'Đi qua lại trong ổ, quay đầu ở mép bệ; chỉ đánh khi người chơi vào tầm.', telegraph:'khựng 0,4s trước đòn' },
    chaser:   { nameVi:'Truy đuổi', note:'Phát hiện trong 360px thì đuổi, nhảy qua hố nhỏ; ra khỏi 600px thì về ổ.', telegraph:'hạ thấp người' },
    charger:  { nameVi:'Húc lao',   note:'Cào chân rồi lao thẳng một đoạn dài; đâm tường/mép thì choáng ngắn.', telegraph:'cào chân 0,6s, vệt bụi' },
    leaper:   { nameVi:'Vồ',        note:'Giữ cự ly trung bình rồi nhảy vồ theo vòng cung.', telegraph:'thu mình 0,45s' },
    flyer:    { nameVi:'Bay lượn',  note:'Bay sóng sin quanh ổ; tới gần thì bổ nhào chéo rồi bay lên.', telegraph:'khựng trên không 0,5s' },
    spitter:  { nameVi:'Phun xa',   note:'Giữ khoảng cách 200px, phun đạn theo khí chất; người chơi áp sát thì lùi.', telegraph:'phồng họng/sáng miệng' },
    ambusher: { nameVi:'Phục kích', note:'Ẩn (chỉ lộ một chi tiết) tới khi người chơi trong 110px rồi trồi lên đánh; sau đó thành truy đuổi.', telegraph:'chi tiết lộ ra rung lên' },
    rooted:   { nameVi:'Bám chỗ',   note:'Không di chuyển; đớp/quất trong tầm hoặc bắn nếu có khí chất.', telegraph:'lá/xúc tu co lại' }
  },

  // Chỉ số nền theo cỡ (RO chia Small/Medium/Large; thêm XL cho rồng/thủ lĩnh). w/h là hitbox runtime (px).
  sizes: {
    S:  { nameVi:'Nhỏ',     hp:26,  dmg:6,  speed:120, w:24, h:20, armor:0, knock:1   },
    M:  { nameVi:'Vừa',     hp:48,  dmg:9,  speed:100, w:34, h:30, armor:1, knock:.8  },
    L:  { nameVi:'Lớn',     hp:96,  dmg:14, speed:80,  w:52, h:44, armor:3, knock:.45 },
    XL: { nameVi:'Khổng lồ',hp:180, dmg:19, speed:70,  w:78, h:60, armor:5, knock:0   }
  },

  // Cấp quái khi sinh ra. bounty = Chiến tích thưởng thêm mỗi con (cộng khi THẮNG màn, có trần).
  grades: {
    normal: { nameVi:'Thường',    hp:1,   dmg:1,    scale:1,    affixes:0, bounty:3,  aura:null },
    elite:  { nameVi:'Tinh anh',  hp:1.8, dmg:1.2,  scale:1.15, affixes:1, bounty:10, aura:'#f2d27a' },
    alpha:  { nameVi:'Thủ lĩnh',  hp:2.6, dmg:1.3,  scale:1.3,  affixes:2, bounty:18, aura:'#ff8f70' },
    lord:   { nameVi:'Chúa',      hp:6,   dmg:1.6,  scale:1.6,  affixes:2, bounty:0,  aura:'#d68cff', note:'Không sinh ngẫu nhiên; dành cho boss vùng/sự kiện.' }
  },

  // Biến tố tinh anh. Mỗi cái là MỘT luật, đọc được bằng mắt (màu hào quang phụ).
  affixes: {
    frenzied: { nameVi:'Cuồng Nộ',   color:'#ff7a5c', rule:'Dưới 50% máu: tốc độ ×1,4, hồi đòn ×0,7.' },
    armored:  { nameVi:'Giáp Đá',    color:'#b9a88a', rule:'Giáp +4 tới khi bị Phá giáp.' },
    vampiric: { nameVi:'Hút Máu',    color:'#c23a4a', rule:'Hồi 40% sát thương gây ra.' },
    volatile: { nameVi:'Nổ Xác',     color:'#ffb347', rule:'Chết thì nổ sau 0,8s (vùng 90px).' },
    frostbound:{ nameVi:'Hàn Khí',   color:'#bfe9ff', rule:'Đòn trúng gây Lạnh (chậm 35%).' },
    regenerating:{ nameVi:'Tái Sinh', color:'#8fe08a', rule:'Hồi 2% máu/giây khi không trúng đòn 2s.' },
    summoner: { nameVi:'Gọi Bầy',    color:'#e6c3ff', rule:'Lần đầu dưới 60% máu gọi 2 con thường cùng loài cỡ nhỏ hơn.' },
    warded:   { nameVi:'Hộ Phép',    color:'#7fb8ff', rule:'Kháng phép +6.' }
  },

  // Trạng thái quái gây lên người chơi (runtime). Khí chất → trạng thái lấy từ aspects.js nếu có trong bảng này.
  playerStatuses: {
    burn:   { nameVi:'Đốt',    dot:3, note:'3 sát thương/giây' },
    poison: { nameVi:'Độc',    dot:2, note:'2 sát thương/giây, cộng dồn thời gian' },
    bleed:  { nameVi:'Chảy máu', dot:2, note:'2/giây; nặng hơn khi chạy' },
    chill:  { nameVi:'Lạnh',   slow:.35, note:'chậm 35%' },
    shock:  { nameVi:'Giật',   stun:.25, note:'khựng 0,25s' },
    curse:  { nameVi:'Nguyền', note:'hồi máu nhận được −50%' },
    root:   { nameVi:'Trói',   note:'không chạy/nhảy 1s' }
  },
  // Khí chất (../aspects.js) → trạng thái runtime ở trên. Khí chất không có trong bảng thì đòn không gây trạng thái.
  aspectStatus: { nature:'root', fire:'burn', venom:'poison', blood:'bleed', feral:'bleed', frost:'chill', storm:'shock', tide:'chill', dark:'curse', death:'curse', soul:'curse', abyss:'curse' }
};
