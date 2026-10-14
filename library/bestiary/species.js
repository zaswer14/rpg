/* Bestiary — LOÀI QUÁI PHỤ. Mỗi loài: họ (rules.families) + kiểu (rules.behaviors) + cỡ (rules.sizes) + khí chất (../aspects.js).
 *  { id, family, nameEn, nameVi, tier:0–5, size:'S'|'M'|'L'|'XL', behavior, aspect|null,
 *    hp?, dmg?, speed? (hệ số nhân lên chỉ số cỡ, mặc định 1), group?:[min,max] (số con một ổ, mặc định [1,1]),
 *    attack: mô tả đòn (một câu), marker: chi tiết nhận diện cho art (không trùng), loot:[], habitat:[biome],
 *    spawn?: false = không sinh ngẫu nhiên (chúa vùng/sự kiện), note? }
 * Tier là mức đe dọa, cùng thang với Tier nghề: biome chỉ sinh loài Tier ≤ Tier nhân vật + 1.
 */
window.JobLibrary = window.JobLibrary || {};
window.JobLibrary.species = [
  // ── QUÁI THÚ (beast) ─────────────────────────────────────────────
  { id:'grave_rat',     family:'beast', nameEn:'Grave Rat',       nameVi:'Chuột Mộ',        tier:0, size:'S', behavior:'chaser',  aspect:null,    hp:.8, speed:1.25, group:[2,4],
    attack:'cắn liên tiếp, lùi lại rồi lao vào', marker:'đuôi trụi + tai rách, mắt đỏ chấm', loot:['da','nanh'], habitat:['grave_hills','moss_forest'] },
  { id:'dire_wolf',     family:'beast', nameEn:'Dire Wolf',       nameVi:'Sói Xám',         tier:1, size:'M', behavior:'chaser',  aspect:'feral', speed:1.3, group:[2,3],
    attack:'vồ ngắn + cắn gây Chảy máu', marker:'bờm xám dựng + sẹo ngang mõm', loot:['da','nanh'], habitat:['grave_hills','moss_forest','storm_spire'] },
  { id:'tusk_boar',     family:'beast', nameEn:'Tusk Boar',       nameVi:'Heo Rừng Nanh Kiếm', tier:1, size:'M', behavior:'charger', aspect:null, hp:1.3, dmg:1.2, group:[1,2],
    attack:'cào chân rồi húc lao một đoạn dài', marker:'hai nanh cong như lưỡi kiếm, lưng gai lông', loot:['da','nanh'], habitat:['moss_forest','grave_hills'] },
  { id:'cave_bat',      family:'beast', nameEn:'Cave Bat',        nameVi:'Dơi Hang',        tier:0, size:'S', behavior:'flyer',   aspect:null,    hp:.7, group:[2,4],
    attack:'bổ nhào cắn rồi bay vọt lên', marker:'tai to hơn đầu, cánh rách lỗ', loot:['nanh'], habitat:['crystal_cave','grave_hills'] },
  { id:'iron_bear',     family:'beast', nameEn:'Ironhide Bear',   nameVi:'Gấu Da Sắt',      tier:2, size:'L', behavior:'chaser',  aspect:'stone', hp:1.2, dmg:1.15, speed:.9,
    attack:'đứng dậy tát hai tay, đòn thứ hai đập đất', marker:'mảng da hóa sắt trên vai + vết xích gãy ở cổ', loot:['da','vuốt'], habitat:['moss_forest','ash_peak'] },

  // ── MA THÚ (magical_beast) ───────────────────────────────────────
  { id:'ember_fox',     family:'magical_beast', nameEn:'Ember Fox',     nameVi:'Hỏa Hồ',        tier:1, size:'M', behavior:'leaper',  aspect:'fire',  speed:1.2,
    attack:'vồ để lại vệt lửa trên sàn', marker:'đuôi là ngọn lửa, vân cam chạy dọc sống lưng', loot:['ma hạch','da nguyên tố'], habitat:['ash_peak','moss_forest'] },
  { id:'frost_lynx',    family:'magical_beast', nameEn:'Frost Lynx',    nameVi:'Linh Miêu Sương', tier:2, size:'M', behavior:'leaper', aspect:'frost', speed:1.15,
    attack:'vồ hai lần liền, cú hai gây Lạnh', marker:'túm lông tai là tinh thể băng, hơi thở trắng', loot:['ma hạch','da nguyên tố'], habitat:['crystal_cave','storm_spire'] },
  { id:'thunder_ram',   family:'magical_beast', nameEn:'Thunder Ram',   nameVi:'Lôi Dương',     tier:2, size:'M', behavior:'charger', aspect:'storm', hp:1.2, dmg:1.1,
    attack:'húc lao, sừng phóng tia Giật khi trúng', marker:'sừng xoắn tóe tia điện, móng đen', loot:['ma hạch','sừng'], habitat:['storm_spire'] },
  { id:'shadow_panther',family:'magical_beast', nameEn:'Shadow Panther', nameVi:'Ảnh Báo',      tier:3, size:'M', behavior:'ambusher',aspect:'dark',  dmg:1.3, speed:1.3,
    attack:'trồi lên từ bóng sau lưng, cào gây Nguyền', marker:'chỉ thấy hai mắt tím khi ẩn; thân đen viền tím', loot:['ma hạch'], habitat:['grave_hills','venom_marsh'] },
  { id:'moon_wolf',     family:'magical_beast', nameEn:'Moon Wolf',     nameVi:'Nguyệt Lang',   tier:3, size:'M', behavior:'chaser',  aspect:'moon',  speed:1.35, group:[2,3],
    attack:'hú làm cả bầy tăng tốc rồi vây cắn', marker:'vầng trăng khuyết sáng trên trán, lông bạc', loot:['ma hạch','nanh'], habitat:['grave_hills','storm_spire'] },
  { id:'gloom_basilisk',family:'magical_beast', nameEn:'Gloom Basilisk',nameVi:'Xà Quái Hóa Đá', tier:4, size:'L', behavior:'spitter', aspect:'venom', hp:1.2,
    attack:'phun độc theo đường thẳng; nhìn thẳng mặt 2s thì bị khựng', marker:'mào sáu gai + mắt vàng khép hờ', loot:['ma hạch','túi độc','vảy'], habitat:['venom_marsh'] },
  { id:'manticore',     family:'magical_beast', nameEn:'Manticore',     nameVi:'Bọ Cạp Sư',     tier:4, size:'L', behavior:'leaper',  aspect:'venom', dmg:1.25,
    attack:'vồ rồi quất đuôi bọ cạp bắn gai độc', marker:'bờm sư tử + đuôi bọ cạp chĩa lên đầu', loot:['ma hạch','gai độc'], habitat:['ash_peak','venom_marsh'] },

  // ── LONG TỘC (dragon) ───────────────────────────────────────────
  { id:'ash_drake',     family:'dragon', nameEn:'Ash Drake',      nameVi:'Hỏa Tích Long',    tier:2, size:'M', behavior:'chaser',  aspect:'fire',  hp:1.3,
    attack:'cắn + phun lửa tầm ngắn (hít hơi 0,7s)', marker:'thằn lằn bốn chân, gai lưng cháy đỏ, không cánh', loot:['vảy','máu rồng'], habitat:['ash_peak'] },
  { id:'mire_drake',    family:'dragon', nameEn:'Mire Drake',     nameVi:'Độc Tích Long',    tier:3, size:'L', behavior:'spitter', aspect:'venom', hp:1.1,
    attack:'phun vũng độc thành vệt trên sàn', marker:'cổ dài, mang rủ như cá, vảy rêu', loot:['vảy','túi độc'], habitat:['venom_marsh'] },
  { id:'sky_wyvern',    family:'dragon', nameEn:'Sky Wyvern',     nameVi:'Phi Long',         tier:3, size:'L', behavior:'flyer',   aspect:'wind',  hp:1.1, dmg:1.1,
    attack:'bổ nhào cào bằng chân sau, đập cánh đẩy lùi', marker:'cánh là tay (hai chân + hai cánh), đuôi móc', loot:['vảy','sừng'], habitat:['storm_spire','ash_peak'] },
  { id:'rime_wyvern',   family:'dragon', nameEn:'Rime Wyvern',    nameVi:'Băng Phi Long',    tier:4, size:'L', behavior:'flyer',   aspect:'frost', hp:1.25, dmg:1.15,
    attack:'phun hơi băng chéo xuống sàn tạo mặt trượt', marker:'màng cánh đóng băng nứt, sừng như nhũ đá', loot:['vảy','máu rồng'], habitat:['crystal_cave','storm_spire'] },
  { id:'bone_dragon',   family:'dragon', nameEn:'Bone Dragon',    nameVi:'Cốt Long',         tier:5, size:'XL', behavior:'chaser', aspect:'death', hp:1.1, speed:.85,
    attack:'phun lửa hồn xanh; vẫy đuôi quét sau lưng', marker:'bộ xương rồng còn sót màng cánh, lửa xanh trong lồng ngực', loot:['vảy','máu rồng','xương cũ'], habitat:['grave_hills'],
    note:'Họ hàng xa của người chơi skeleton: không nhận đồng loại, chỉ nhận long tộc.' },
  { id:'elder_dragon',  family:'dragon', nameEn:'Elder Dragon',   nameVi:'Cổ Long',          tier:5, size:'XL', behavior:'flyer',  aspect:'storm', hp:1.6, dmg:1.3, spawn:false,
    attack:'đổi thời tiết cả map; mỗi pha một hơi thở khác', marker:'sừng gạc như cây cổ thụ, vảy khắc phù văn', loot:['vảy cổ long'], habitat:['storm_spire'],
    note:'Chúa vùng (grade lord). Như Elder Dragon của Monster Hunter: đứng ngoài hệ sinh thái, không thuộc bảng sinh ngẫu nhiên.' },

  // ── TRÙNG TỘC (insect) ──────────────────────────────────────────
  { id:'bone_beetle',   family:'insect', nameEn:'Bone Beetle',    nameVi:'Bọ Hung Xương',    tier:0, size:'S', behavior:'pacer',   aspect:null,    hp:1.2, group:[2,3],
    attack:'cuộn tròn lăn húc', marker:'vỏ là mảnh sọ ghép, chân đốt ngà', loot:['vỏ giáp'], habitat:['grave_hills','crystal_cave'] },
  { id:'cave_spider',   family:'insect', nameEn:'Cave Spider',    nameVi:'Nhện Hang',        tier:1, size:'S', behavior:'ambusher',aspect:'venom', group:[1,3],
    attack:'thả tơ từ trên xuống cắn gây Độc', marker:'tám mắt xanh lục + bụng sọc vàng', loot:['túi độc','tơ'], habitat:['crystal_cave','moss_forest'] },
  { id:'dune_scorpion', family:'insect', nameEn:'Dune Scorpion',  nameVi:'Bọ Cạp Cát',       tier:2, size:'M', behavior:'charger', aspect:'venom', hp:1.1, group:[1,2],
    attack:'lao càng kẹp rồi chích đuôi', marker:'càng to bất cân xứng (trái lớn), vỏ màu cát', loot:['vỏ giáp','túi độc'], habitat:['ash_peak','venom_marsh'] },
  { id:'brood_mother',  family:'insect', nameEn:'Brood Mother',   nameVi:'Nhện Chúa',        tier:3, size:'L', behavior:'spitter', aspect:'venom', hp:1.3,
    attack:'phun tơ trói chân (Root) + đẻ nhện con', marker:'túi trứng phát sáng trên lưng', loot:['túi độc','tơ'], habitat:['crystal_cave','venom_marsh'] },

  // ── NHẦY (ooze) ─────────────────────────────────────────────────
  { id:'moss_slime',    family:'ooze', nameEn:'Moss Slime',       nameVi:'Slime Rêu',        tier:0, size:'M', behavior:'leaper',  aspect:null,    hp:.9, dmg:.8, group:[1,3],
    attack:'nảy đè', marker:'giọt xanh rêu có lá dính trên đỉnh', loot:['dịch nhầy'], habitat:['moss_forest','grave_hills'] },
  { id:'magma_slime',   family:'ooze', nameEn:'Magma Slime',      nameVi:'Nhầy Dung Nham',   tier:2, size:'L', behavior:'leaper',  aspect:'fire',  hp:1,
    attack:'nảy đè để lại vũng lửa', marker:'lõi đá đen nổi bên trong, mặt sủi bọt', loot:['dịch nhầy','lõi đá'], habitat:['ash_peak'] },
  { id:'abyss_ooze',    family:'ooze', nameEn:'Abyss Ooze',       nameVi:'Nhầy Vực Sâu',     tier:4, size:'L', behavior:'pacer',   aspect:'abyss', hp:1.4,
    attack:'xúc tu kéo người chơi lại gần', marker:'mặt nhầy đen phản chiếu sao, xúc tu tím', loot:['dịch nhầy','hồn tinh'], habitat:['venom_marsh','crystal_cave'] },

  // ── THẢO YÊU (plant) ────────────────────────────────────────────
  { id:'snap_vine',     family:'plant', nameEn:'Snap Vine',       nameVi:'Dây Leo Bẫy',      tier:0, size:'S', behavior:'rooted',  aspect:'nature',
    attack:'quất trói chân (Root) khi đi qua', marker:'nụ hoa đỏ miệng răng trên dây gai', loot:['nhựa'], habitat:['moss_forest','venom_marsh'] },
  { id:'spore_cap',     family:'plant', nameEn:'Spore Cap',       nameVi:'Nấm Bào Tử',       tier:1, size:'M', behavior:'rooted',  aspect:'venom', hp:1.1,
    attack:'phun bào tử thành đạn cong gây Độc', marker:'mũ nấm tím đốm trắng, phồng xẹp như thở', loot:['hạt giống','túi độc'], habitat:['venom_marsh','crystal_cave','moss_forest'] },
  { id:'rot_treant',    family:'plant', nameEn:'Rot Treant',      nameVi:'Thụ Nhân Mục',     tier:3, size:'XL', behavior:'pacer',  aspect:'nature', hp:.9, speed:.6,
    attack:'đập cành, rễ trồi lên dưới chân', marker:'thân cây rỗng có hốc mắt, nấm mọc trên vai', loot:['nhựa','hạt giống'], habitat:['moss_forest'],
    note:'Ngoại lệ của họ: đi được (chậm), nhưng vẫn không bị đẩy và vẫn hồi máu khi không trúng đòn.' },

  // ── BẤT TỬ (undead) ─────────────────────────────────────────────
  { id:'feral_ghoul',   family:'undead', nameEn:'Feral Ghoul',    nameVi:'Ngạ Quỷ Hoang',    tier:1, size:'M', behavior:'chaser',  aspect:'death', speed:1.1, group:[1,3],
    attack:'cào hai tay gây Nguyền', marker:'da xám bó xương, hàm trễ, bò bốn chân khi chạy', loot:['xương cũ','tro mộ'], habitat:['grave_hills','venom_marsh'] },
  { id:'barrow_wight',  family:'undead', nameEn:'Barrow Wight',   nameVi:'Thi Vương Gò',     tier:3, size:'M', behavior:'spitter', aspect:'death', hp:1.2,
    attack:'bắn quả cầu hồn xanh; gọi lại Ngạ Quỷ đã chết', marker:'vương miện đồng gỉ + áo liệm, mắt lửa xanh', loot:['tro mộ','hồn tinh'], habitat:['grave_hills'] },

  // ── NGUYÊN TỐ LINH (elemental) ───────────────────────────────────
  { id:'ember_wisp',    family:'elemental', nameEn:'Ember Wisp',  nameVi:'Đốm Lửa Ma',       tier:1, size:'S', behavior:'flyer',   aspect:'fire',  hp:.8, group:[2,3],
    attack:'lao vào nổ nhỏ gây Đốt', marker:'ngọn lửa có hai chấm mắt, đuôi khói', loot:['tinh thể nguyên tố'], habitat:['ash_peak','grave_hills'] },
  { id:'crystal_golem', family:'elemental', nameEn:'Shardling',   nameVi:'Thạch Tinh Linh',  tier:2, size:'M', behavior:'pacer',   aspect:'stone', hp:1.3,
    attack:'bắn mảnh tinh thể khi bị đánh', marker:'cụm tinh thể tím lơ lửng ghép thành người', loot:['tinh thể nguyên tố'], habitat:['crystal_cave'] },
  { id:'storm_elemental',family:'elemental',nameEn:'Storm Elemental',nameVi:'Lôi Linh',      tier:4, size:'L', behavior:'flyer',   aspect:'storm', hp:1.1,
    attack:'phóng sét nảy giữa người chơi và thuộc hạ', marker:'mây đen xoáy có lõi sét vàng', loot:['tinh thể nguyên tố'], habitat:['storm_spire'] },

  // ── CƠ GIỚI (construct) ─────────────────────────────────────────
  { id:'rust_golem',    family:'construct', nameEn:'Rust Golem',  nameVi:'Golem Gỉ',         tier:2, size:'L', behavior:'pacer',   aspect:'steel', hp:1.3, speed:.8,
    attack:'đấm thẳng nặng, chậm', marker:'thân sắt gỉ có ống khói trên vai, mắt đèn vàng', loot:['bánh răng','lõi đá'], habitat:['ash_peak','crystal_cave'] },
  { id:'clock_mantis',  family:'construct', nameEn:'Clockwork Mantis', nameVi:'Bọ Ngựa Cơ Khí', tier:3, size:'M', behavior:'leaper', aspect:'machine', dmg:1.2,
    attack:'vồ hai lưỡi liềm, quá nhiệt thì đứng máy 1s', marker:'lưỡi liềm đồng + bánh răng lộ ở bụng', loot:['bánh răng'], habitat:['crystal_cave'] },

  // ── YÊU MA (fiend) ──────────────────────────────────────────────
  { id:'imp',           family:'fiend', nameEn:'Imp',             nameVi:'Tiểu Yêu',         tier:1, size:'S', behavior:'spitter', aspect:'fire',  group:[1,2],
    attack:'ném cầu lửa nhỏ rồi cười chạy', marker:'cánh dơi tí hon + đuôi mũi tên', loot:['sừng quỷ'], habitat:['ash_peak','grave_hills'] },
  { id:'hellhound',     family:'fiend', nameEn:'Hellhound',       nameVi:'Ma Khuyển',        tier:3, size:'M', behavior:'chaser',  aspect:'fire',  speed:1.3, group:[1,2],
    attack:'cắn hút máu, chạy để lại vệt lửa', marker:'chó đen hai đầu (một đầu ngủ), mắt than hồng', loot:['sừng quỷ','huyết ấn'], habitat:['ash_peak'] },
  { id:'blood_succubus',family:'fiend', nameEn:'Blood Siren',     nameVi:'Huyết Yêu',        tier:4, size:'M', behavior:'flyer',   aspect:'blood', hp:1.1,
    attack:'bổ nhào cào gây Chảy máu, hút máu', marker:'cánh màng đỏ rách + vương miện gai', loot:['huyết ấn'], habitat:['venom_marsh','grave_hills'] },

  // ── U LINH (spirit) ─────────────────────────────────────────────
  { id:'lantern_wisp',  family:'spirit', nameEn:'Lantern Ghost',  nameVi:'Hồn Đèn',          tier:1, size:'S', behavior:'flyer',   aspect:'soul',  hp:.9,
    attack:'xuyên qua người gây Nguyền', marker:'hồn mờ cầm đèn lồng giấy', loot:['hồn tinh'], habitat:['grave_hills','moss_forest'] },
  { id:'wailing_shade', family:'spirit', nameEn:'Wailing Shade',  nameVi:'Hồn Than',         tier:3, size:'M', behavior:'spitter', aspect:'soul',  hp:1.1,
    attack:'tiếng than thành sóng âm bắn thẳng', marker:'tóc dài bay ngược, miệng mở dọc', loot:['hồn tinh'], habitat:['grave_hills','venom_marsh'] },

  // ── PHI CẦM (avian) ─────────────────────────────────────────────
  { id:'carrion_crow',  family:'avian', nameEn:'Carrion Crow',    nameVi:'Quạ Xác',          tier:0, size:'S', behavior:'flyer',   aspect:null,    hp:.8, group:[2,3],
    attack:'bổ nhào mổ', marker:'quạ một mắt trắng, lông xơ', loot:['lông vũ'], habitat:['grave_hills','storm_spire'] },
  { id:'gale_griffin',  family:'avian', nameEn:'Gale Griffin',    nameVi:'Sư Thứu Gió',      tier:3, size:'L', behavior:'flyer',   aspect:'wind',  hp:1.1,
    attack:'bổ nhào cào rồi đập cánh hất tung', marker:'đầu đại bàng mào xanh lục, thân sư tử', loot:['lông vũ','vuốt'], habitat:['storm_spire'] },
  { id:'thunderbird',   family:'avian', nameEn:'Thunderbird',     nameVi:'Lôi Điểu',         tier:5, size:'L', behavior:'flyer',   aspect:'storm', hp:1.4, dmg:1.2,
    attack:'bổ nhào kéo theo cột sét', marker:'cánh rộng gấp ba thân, lông đuôi là tia sét', loot:['lông vũ','tinh thể nguyên tố'], habitat:['storm_spire'] }
];
