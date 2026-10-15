/* Vạn Kiếp — DỮ LIỆU ĐẠI LỤC VAREN.
 * Theo cách của 1in8b: mỗi vùng chỉ khai vài chỉ số (giàu, Gini, nguy hiểm, dân số, chủng tộc, giáo phái);
 * bảng sống, thu nhập, nguyên nhân chết, tỉ lệ bị quái tấn công đều suy ra từ đó bằng công thức trong life.js.
 *
 * KHU (zone): mỗi vùng có 4 khu = 4 tầng nguy hiểm: ven → sâu → lõi → vùng chết. Mỗi khu có dải Tier [lo, hi] và danh sách loài.
 *   Ô nào thuộc tầng nào do ĐỘ HOANG quyết định (js/realm.js): khoảng cách đi bộ tới khu dân cư (chia bán kính theo bậc × tuần tra
 *   của nước) + độ hoang biome (G.TERRAIN.wild) + độ hoang địa hình (G.FEATURES.wild). Ngưỡng tầng: G.BAND_W.
 *   Luật phân cấp (kiểm ở validateWorld và trong encounter của life.js):
 *     - mọi loài trong khu có tier trong [lo, hi]; hi − lo ≤ 2;
 *     - nhân vật Tier t chỉ gặp loài tier ≤ t + 1 (liều mạng: ≤ t + 2);
 *     - khu có lo > t + 1 bị khóa với nhân vật Tier t (trừ khi bật Liều mạng).
 * Tọa độ trên khung 1200 × 900 (đại lục ở giữa, quanh là biển). Bản đồ raster dựng từ seed + bán kính vùng + G.TERRAIN (map.js).
 */
window.LifeSim = window.LifeSim || {};
(function (G) {
  // ── CHỦNG TỘC: tham số sinh học của game (thư viện lo nghề/thân, game lo tuổi thọ) ──
  // ypt = số năm mỗi lượt (năm game); le = tuổi thọ trung bình (năm). le/ypt ≈ 50–62 lượt cho mọi chủng tộc.
  G.RACES = {
    human:     { ypt:1, le:62,  adult:16, im:.07, sexes:['m','f'], pre:['Al','Ber','Cor','Dar','Ed','Gar','Hal','Ler','Mar','Os','Ren','Tor','Wil','Bri','Kat'], m:['ric','an','win','dor','mund','ard','en','os'], f:['a','ia','wen','ys','elle','ine','ra','eth'], fam:['Hollin','Ashford','Brenn','Calder','Dunmore','Fenwick','Graves','Marlow','Rook','Thorne','Vale','Wick'] },
    elf:       { ypt:5, le:300, adult:60, im:.03, sexes:['m','f'], pre:['Ae','Cael','Ela','Fin','Ith','Lir','Sil','Tha','Ylo','Nim','Eri'], m:['ndil','rion','las','dor','ion','thas'], f:['wen','thiel','riel','lia','nore','sel'], fam:['Ngân Diệp','Sương Lá','Nguyệt Chi','Tinh Mộc','Lam Thảo'] },
    dwarf:     { ypt:3, le:180, adult:30, im:.05, sexes:['m','f'], pre:['Bal','Dur','Gim','Thor','Bor','Kaz','Dwa','Brun','Hed','Mor'], m:['in','rek','grim','dun','ak','li'], f:['dis','na','rid','hild','ra','gun'], fam:['Búa Đá','Râu Đồng','Lò Sâu','Khiên Sắt','Mạch Bạc'] },
    orc:       { ypt:1, le:48,  adult:13, im:.09, sexes:['m','f'], pre:['Gor','Ug','Thra','Mok','Zug','Gash','Krul','Ur','Bog','Rag'], m:['ash','nak','rok','zul','gul','dak'], f:['ga','sha','ka','ra','zha','na'], fam:['Nanh Gãy','Huyết Thủ','Sọ Đỏ','Rìu Đen','Lửa Sói'] },
    beastfolk: { ypt:1, le:55,  adult:14, im:.08, sexes:['m','f'], pre:['Rak','Fen','Shi','Tav','Kor','Mir','Sab','Ash','Lu','Ren'], m:['ka','ru','ash','on','ar','ek'], f:['ira','ya','ani','ri','sha','li'], fam:['Móng Bạc','Tai Gió','Đuôi Lửa','Bờm Xám','Vằn Đen'] },
    fae:       { ypt:3, le:160, adult:24, im:.05, sexes:['m','f'], pre:['Pip','Lum','Twi','Mos','Fae','Wis','Bri','Tin','Pea','Thi'], m:['kin','le','wyn','bo','rin','ket'], f:['belle','wyn','li','ra','sy','tle'], fam:['Sương Sớm','Cánh Mỏng','Gai Hồng','Nấm Tròn','Đốm Sáng'] },
    merfolk:   { ypt:2, le:110, adult:20, im:.06, sexes:['m','f'], pre:['Mar','Cor','Nai','Thal','Ond','Pel','Sir','Aqu','Ner','Lor'], m:['ios','us','an','eon','ar','iel'], f:['ina','ene','ys','ea','ira','ola'], fam:['Sóng Bạc','Vảy Lam','San Hô','Triều Đêm','Ngọc Trai'] },
    dragonkin: { ypt:4, le:240, adult:40, im:.04, sexes:['m','f'], pre:['Vyr','Dra','Kael','Syx','Rha','Ixa','Zor','Thar','Vel','Ash'], m:['thax','ion','gor','rak','an','dros'], f:['yss','ra','ith','a','enne','ys'], fam:['Hỏa Lân','Vảy Đồng','Sừng Đen','Long Huyết','Cánh Tro'] },
    construct: { ypt:2, le:120, adult:4,  im:.04, sexes:['n'], pre:['AX','BR','KT','VO','ZR','MK','TS'], m:['-'], f:['-'], fam:['Bu-lông','Bánh Răng','Lò Xo','Đinh Tán','Ống Đồng','Van Hơi'], construct:true },
    skeleton:  { ypt:2, le:80,  adult:0,  im:0,   sexes:['n'], undead:true }
  };

  // ── TẦNG LỚP q (1–5) ──
  G.CLASSES = [null,
    { nameVi:'Cùng khổ',   pctRange:[.00,.18] },
    { nameVi:'Nông hộ',    pctRange:[.12,.45] },
    { nameVi:'Thợ thuyền', pctRange:[.35,.70] },
    { nameVi:'Thương gia', pctRange:[.60,.90] },
    { nameVi:'Quý tộc',    pctRange:[.85,.995] }
  ];

  // ── SINH KẾ (nghề sống, khác nghề chiến đấu của thư viện) ──
  // pct: khoảng phân vị thu nhập; risk: hệ số tai nạn; trains: mastery luyện được khi làm; need: điều kiện.
  G.WORKS = {
    farmer:     { nameVi:'Nông dân',       pct:[.05,.35], risk:1.0, trains:{ Body:2 } },
    herder:     { nameVi:'Chăn nuôi',      pct:[.08,.38], risk:1.1, trains:{ Taming:3, Riding:2 }, biomes:['wind_steppe','golden_plains','frost_tundra'] },
    fisher:     { nameVi:'Ngư dân',        pct:[.08,.40], risk:1.8, trains:{ Spear:2, Body:1 }, coastal:true, cause:'drown' },
    miner:      { nameVi:'Thợ mỏ',         pct:[.15,.48], risk:2.0, trains:{ Body:3, Engineering:1 }, biomes:['crystal_cave','ash_peak','forge_ruins','frost_tundra'], cause:'mine' },
    smith:      { nameVi:'Thợ rèn',        pct:[.30,.65], risk:1.0, trains:{ Engineering:3, Sword:1, Axe:1 }, town:true },
    hunter:     { nameVi:'Thợ săn',        pct:[.15,.50], risk:1.4, trains:{ Bow:3, Stealth:2, Throwing:1 } },
    guard:      { nameVi:'Lính canh',      pct:[.25,.55], risk:1.5, trains:{ Sword:2, Shield:3, Spear:1 }, town:true },
    merchant:   { nameVi:'Thương nhân',    pct:[.45,.92], risk:1.1, trains:{}, town:true, needSm:35 },
    scholar:    { nameVi:'Học giả',        pct:[.40,.85], risk:.7,  trains:{ Arcane:3, Alchemy:1 }, town:true, needSm:60 },
    healer:     { nameVi:'Thầy thuốc',     pct:[.35,.75], risk:.9,  trains:{ Alchemy:3, Spirit:1 }, needSm:45 },
    priest:     { nameVi:'Tu sĩ',          pct:[.30,.70], risk:.7,  trains:{ Spirit:3, Soul:1 }, needFaith:true },
    sailor:     { nameVi:'Thủy thủ',       pct:[.18,.55], risk:1.9, trains:{ Throwing:1, Body:2 }, coastal:true, cause:'drown' },
    thief:      { nameVi:'Kẻ trộm',        pct:[.05,.60], risk:2.2, trains:{ Dagger:3, Stealth:3, Trap:1 }, town:true, cause:'hanged' },
    adventurer: { nameVi:'Mạo hiểm giả',   pct:[.10,.95], risk:1.0, trains:{}, adventurer:true }
  };

  // ── VÙNG ──
  // wealth 0–1, gini, pop (trọng số nơi sinh), danger (áp lực quái nền), magic 0–1.
  // races / faiths: trọng số (dân bản địa: khu dân cư vô chủ, phần dân không thuộc chủng tộc chủ của nước). anchor: điểm neo của vùng (nhãn, tuyến biển; bản đồ cũ chia khu theo nó). zones: [ven, sâu, lõi, vùng chết]. Khu dân cư không khai ở đây: js/realm.js dựng theo quốc gia.
  const Z = (id, nameVi, lo, hi, spawns) => ({ id, nameVi, tier:[lo, hi], spawns });
  G.REGIONS = [
    { id:'kim_ha', nameVi:'Đồng Kim Hà', biome:'golden_plains', x:580, y:460, r:135, wealth:.72, gini:.38, pop:30, danger:.15, magic:.3,
      races:{ human:70, dwarf:5, beastfolk:6, elf:4, fae:2, orc:3, merfolk:2, dragonkin:3, construct:5 }, faiths:{ light:60, ancestor:10, forge:8, none:22 },
      anchor:[588,452],
      zones:[ Z('kim_ha_0','Ruộng Ven Đô',0,0,{ horned_hare:14, grave_rat:10, carrion_crow:8, moss_slime:8 }),
              Z('kim_ha_1','Đồi Cỏ Hoang',0,1,{ horned_hare:5, dire_wolf:10, tusk_boar:10, field_scarecrow:8, wheat_wurm:8 }),
              Z('kim_ha_2','Gò Bò Rừng',1,2,{ tusk_boar:6, wheat_wurm:5, stone_bison:12, dire_wolf:6 }),
              Z('kim_ha_3','Đồng Cháy',2,3,{ stone_bison:8, iron_bear:8, armored_rhino:10, moon_wolf:6 }) ],
      lore:'Vựa lúa của đại lục và nơi đặt ngai vua. Đội tuần tra dọn sạch quái quanh tường thành mỗi mùa.' },
    { id:'reu_tham', nameVi:'Rừng Rêu Thầm', biome:'moss_forest', x:425, y:390, r:112, wealth:.42, gini:.36, pop:9, danger:.3, magic:.45,
      races:{ human:40, elf:25, beastfolk:20, fae:10, orc:5 }, faiths:{ wild:45, light:25, none:30 },
      anchor:[450,418],
      zones:[ Z('reu_tham_0','Bìa Rừng',0,0,{ moss_slime:14, grave_rat:8, snap_vine:10, horned_hare:6 }),
              Z('reu_tham_1','Rừng Sâu',1,2,{ dire_wolf:12, tusk_boar:10, spore_cap:8, cave_spider:8, iron_bear:6, ember_fox:4 }),
              Z('reu_tham_2','Tim Rừng',2,3,{ iron_bear:10, rot_treant:10, moon_wolf:6 }),
              Z('reu_tham_3','Rừng Không Tiếng',3,4,{ rot_treant:8, shadow_panther:10, brood_mother:8, gloom_basilisk:5 }) ],
      lore:'Rêu ăn cả tiếng bước chân. Người tiều phu đi theo cặp, không bao giờ một mình.' },
    { id:'mong_ao', nameVi:'Trảng Mộng Ảo', biome:'fae_glade', x:285, y:520, r:100, wealth:.45, gini:.30, pop:5, danger:.28, magic:.85,
      races:{ fae:60, elf:15, human:15, beastfolk:10 }, faiths:{ wild:60, none:40 },
      anchor:[300,520],
      zones:[ Z('mong_ao_0','Trảng Hoa',0,0,{ pixie_swarm:14, snap_vine:8, moss_slime:8 }),
              Z('mong_ao_1','Lối Đổi Hướng',1,2,{ mimic_mushroom:10, spore_cap:8, lantern_wisp:10, fallen_dryad:6 }),
              Z('mong_ao_2','Giấc Mơ Sâu',2,3,{ fallen_dryad:8, thorn_unicorn:10, rot_treant:6 }),
              Z('mong_ao_3','Ác Mộng Không Tỉnh',3,4,{ thorn_unicorn:8, nightmare_stag:10, blood_succubus:6 }) ],
      lore:'Ai ngủ quên trong trảng có thể thức dậy sau bảy năm. Yêu Tinh coi đó là chuyện bình thường.' },
    { id:'suong_mu', nameVi:'Bờ Sương Mù', biome:'mist_coast', x:205, y:350, r:100, wealth:.5, gini:.40, pop:8, danger:.25, magic:.35, coastal:true,
      races:{ human:50, merfolk:30, dwarf:5, beastfolk:5, orc:10 }, faiths:{ deep:35, light:25, none:40 },
      anchor:[220,350],
      zones:[ Z('suong_mu_0','Bãi Đá Ngầm',0,0,{ rock_crab:14, carrion_crow:8, moss_slime:6 }),
              Z('suong_mu_1','Nghĩa Địa Tàu',1,2,{ drowned_sailor:12, tide_elemental:8 }),
              Z('suong_mu_2','Hang Hát',2,3,{ tide_elemental:8, siren:10, reef_shark:4 }),
              Z('suong_mu_3','Mũi Tàu Đắm',3,4,{ siren:10, sea_serpent:10, kraken_spawn:5 }) ],
      lore:'Ngọn hải đăng chưa từng tắt. Thủy thủ bảo người giữ đèn là Hải Tộc không bao giờ già.' },
    { id:'hai_xa', nameVi:'Quần Đảo Hải Xà', biome:'serpent_bay', x:195, y:680, r:92, wealth:.48, gini:.45, pop:5, danger:.45, magic:.5, coastal:true, island:true,
      races:{ merfolk:60, human:25, orc:15 }, faiths:{ deep:60, none:40 },
      anchor:[210,675],
      zones:[ Z('hai_xa_0','Rạn Cạn',1,2,{ drowned_sailor:10, reef_shark:10, tide_elemental:6 }),
              Z('hai_xa_1','Luồng Nước Xoáy',2,3,{ reef_shark:10, sea_serpent:8, siren:8 }),
              Z('hai_xa_2','Vực Xanh',3,4,{ sea_serpent:10, kraken_spawn:10 }),
              Z('hai_xa_3','Mắt Bão',4,5,{ kraken_spawn:12 }) ],
      lord:{ species:'leviathan', zone:'hai_xa_3' },
      lore:'Đảo nối với đất liền bằng tuyến thuyền từ Bờ Sương Mù. Mỗi đời người có một lần Leviathan nổi lên.' },
    { id:'ngan_diep', nameVi:'Rừng Ngân Diệp', biome:'elder_wood', x:350, y:240, r:115, wealth:.6, gini:.25, pop:8, danger:.25, magic:.7,
      races:{ elf:75, fae:10, human:10, beastfolk:5 }, faiths:{ wild:55, light:15, none:30 },
      anchor:[355,245],
      zones:[ Z('ngan_diep_0','Hành Lang Cây',0,0,{ horned_hare:8, moss_slime:8, pixie_swarm:8, snap_vine:6 }),
              Z('ngan_diep_1','Rễ Già',1,2,{ silver_spider:12, dire_wolf:8, fallen_dryad:8 }),
              Z('ngan_diep_2','Cây Mẹ',2,3,{ nightmare_stag:10, moon_wolf:10, fallen_dryad:4 }),
              Z('ngan_diep_3','Rễ Cội',3,4,{ nightmare_stag:8, moon_wolf:8, rot_treant:8, gloom_basilisk:5 }) ],
      lore:'Tiên Tộc đếm tuổi bằng vòng cây. Kẻ ngoại tộc được ở lại đúng một mùa.' },
    { id:'bac_cuc', nameVi:'Băng Nguyên Bắc', biome:'frost_tundra', x:600, y:172, r:125, wealth:.3, gini:.35, pop:4, danger:.5, magic:.4, cold:true,
      races:{ human:40, dwarf:25, beastfolk:20, orc:15 }, faiths:{ ancestor:55, none:45 },
      anchor:[605,195],
      zones:[ Z('bac_cuc_0','Rìa Tuyết',1,1,{ frost_wolf:14, feral_ghoul:6 }),
              Z('bac_cuc_1','Đồng Băng',2,3,{ woolly_mammoth:10, ice_wraith:10, frost_lynx:8, yeti:6 }),
              Z('bac_cuc_2','Đỉnh Gió Trắng',3,4,{ yeti:10, rime_wyvern:10 }),
              Z('bac_cuc_3','Bão Trắng Vĩnh Cửu',4,5,{ rime_wyvern:10, storm_elemental:8, thunderbird:4 }) ],
      lore:'Mùa đông ở đây dài tám tháng. Người chết được chôn trong băng cho tới mùa tan.' },
    { id:'thach_lam', nameVi:'Núi Thạch Lâm', biome:'crystal_cave', x:665, y:300, r:100, wealth:.66, gini:.33, pop:8, danger:.3, magic:.45,
      races:{ dwarf:70, human:15, construct:10, orc:5 }, faiths:{ forge:45, ancestor:35, none:20 },
      anchor:[670,315],
      zones:[ Z('thach_lam_0','Mỏ Nông',0,1,{ cave_bat:12, bone_beetle:10, cave_spider:8 }),
              Z('thach_lam_1','Hang Tinh Thể',1,2,{ cave_spider:8, crystal_golem:12, rust_golem:6 }),
              Z('thach_lam_2','Lòng Núi',3,4,{ brood_mother:8, clock_mantis:8, abyss_ooze:6 }),
              Z('thach_lam_3','Lõi Tinh Thể',4,5,{ abyss_ooze:8, ancient_sentinel:10, magma_titan:4 }) ],
      lore:'Người Lùn đào xuống vì trên mặt đất không còn gì đáng đào.' },
    { id:'loi_van', nameVi:'Đỉnh Lôi Vân', biome:'storm_spire', x:890, y:205, r:105, wealth:.35, gini:.4, pop:2, danger:.65, magic:.6,
      races:{ dragonkin:40, human:30, dwarf:15, beastfolk:15 }, faiths:{ ancestor:30, light:20, none:50 },
      anchor:[870,230],
      zones:[ Z('loi_van_0','Vách Gió',2,2,{ thunder_ram:12, frost_lynx:8, iron_bear:5 }),
              Z('loi_van_1','Tầng Mây',3,3,{ sky_wyvern:10, gale_griffin:10, moon_wolf:6 }),
              Z('loi_van_2','Đỉnh Sét',4,5,{ storm_elemental:10, rime_wyvern:6, thunderbird:4 }),
              Z('loi_van_3','Ngai Sét',4,5,{ storm_elemental:10, rime_wyvern:6, thunderbird:6 }) ],
      lord:{ species:'elder_dragon', zone:'loi_van_3' },
      lore:'Sét đánh vào cùng một tảng đá mỗi đêm. Cổ Long ngủ dưới tảng đá đó.' },
    { id:'hoa_diem', nameVi:'Núi Hỏa Diệm', biome:'ash_peak', x:965, y:365, r:100, wealth:.45, gini:.42, pop:4, danger:.55, magic:.55, hot:true,
      races:{ dragonkin:45, orc:25, dwarf:20, human:10 }, faiths:{ dark:30, ancestor:30, none:40 },
      anchor:[940,375],
      zones:[ Z('hoa_diem_0','Sườn Tro',1,1,{ ember_fox:10, imp:10, ember_wisp:10 }),
              Z('hoa_diem_1','Dòng Dung Nham',2,3,{ ash_drake:12, magma_slime:10, iron_bear:4, hellhound:6 }),
              Z('hoa_diem_2','Miệng Núi',3,5,{ manticore:8, hellhound:6, magma_titan:5 }),
              Z('hoa_diem_3','Lò Tim Núi',4,5,{ manticore:8, magma_titan:8, horned_fiend:5 }) ],
      lore:'Long Nhân ấp trứng trong tro nóng. Núi phun trào mỗi khi có rồng chết.' },
    { id:'gio_hu', nameVi:'Thảo Nguyên Gió Hú', biome:'wind_steppe', x:790, y:465, r:118, wealth:.4, gini:.32, pop:9, danger:.3, magic:.3,
      races:{ orc:40, beastfolk:35, human:20, dragonkin:5 }, faiths:{ ancestor:55, dark:15, none:30 },
      anchor:[780,450],
      zones:[ Z('gio_hu_0','Cỏ Ngang Hông',0,0,{ steppe_hyena:14, horned_hare:8, carrion_crow:5 }),
              Z('gio_hu_1','Đồi Lốc',1,2,{ dust_devil:10, great_eagle:8, tusk_boar:6, stone_bison:4 }),
              Z('gio_hu_2','Bãi Tê Giác',2,3,{ great_eagle:6, armored_rhino:10, stone_bison:6 }),
              Z('gio_hu_3','Bão Bụi',3,4,{ armored_rhino:10, gale_griffin:8, manticore:5 }) ],
      lore:'Bộ lạc chọn thủ lĩnh bằng cuộc đua ngựa ba ngày. Ai ngã ngựa phải đi bộ về.' },
    { id:'xuong_duc', nameVi:'Phế Xưởng Đúc', biome:'forge_ruins', x:1005, y:545, r:95, wealth:.38, gini:.5, pop:3, danger:.45, magic:.4,
      races:{ construct:65, dwarf:20, human:15 }, faiths:{ forge:60, none:40 },
      anchor:[990,540],
      zones:[ Z('xuong_duc_0','Bãi Phế Liệu',1,1,{ brass_spider:14, ember_wisp:6 }),
              Z('xuong_duc_1','Dây Chuyền Câm',2,3,{ rust_golem:12, clock_mantis:8, magma_slime:4 }),
              Z('xuong_duc_2','Lõi Xưởng',3,4,{ clock_mantis:6, ancient_sentinel:12, storm_elemental:4 }),
              Z('xuong_duc_3','Lò Chưa Tắt',4,5,{ ancient_sentinel:10, storm_elemental:6, magma_titan:5 }) ],
      lore:'Cơ Nhân được đúc ở đây khi xưởng còn chủ. Giờ xưởng tự đúc, không ai biết cho ai.' },
    { id:'hong_sa', nameVi:'Sa Mạc Hồng Sa', biome:'red_desert', x:860, y:665, r:120, wealth:.35, gini:.55, pop:5, danger:.42, magic:.45, hot:true,
      races:{ orc:30, beastfolk:30, human:25, dragonkin:10, construct:5 }, faiths:{ dark:25, ancestor:25, none:50 },
      anchor:[830,640],
      zones:[ Z('hong_sa_0','Rìa Cát',0,1,{ sand_vulture:12, steppe_hyena:6, dust_devil:6 }),
              Z('hong_sa_1','Biển Cồn',2,2,{ dune_scorpion:12, sand_mummy:12 }),
              Z('hong_sa_2','Lăng Vua Chôn Vùi',3,4,{ sandworm:10, sand_djinn:8, manticore:4 }),
              Z('hong_sa_3','Cát Nuốt Vua',4,5,{ sand_djinn:10, manticore:8 }) ],
      lore:'Cát đỏ vì máu của một cuộc chiến không ai còn nhớ tên.' },
    { id:'luc_chuong', nameVi:'Đầm Lục Chướng', biome:'venom_marsh', x:570, y:645, r:100, wealth:.28, gini:.42, pop:4, danger:.42, magic:.5,
      races:{ human:35, beastfolk:25, orc:20, fae:10, merfolk:10 }, faiths:{ dark:30, wild:25, none:45 },
      anchor:[568,648],
      zones:[ Z('luc_chuong_0','Lau Sậy',1,1,{ spore_cap:12, lantern_wisp:8, feral_ghoul:8 }),
              Z('luc_chuong_1','Nước Đen',2,3,{ giant_toad:10, mire_drake:8, shadow_panther:6, brood_mother:6 }),
              Z('luc_chuong_2','Tổ Rắn Đá',3,4,{ mire_drake:4, gloom_basilisk:10, abyss_ooze:8, blood_succubus:6 }),
              Z('luc_chuong_3','Mắt Độc',4,5,{ gloom_basilisk:10, abyss_ooze:8, blood_succubus:6 }) ],
      lore:'Sương độc lên vào lúc chiều tà. Người ở đây ngủ trên sàn cao ba mét.' },
    { id:'tro_tan', nameVi:'Đồi Mộ Tro Tàn', biome:'grave_hills', x:390, y:655, r:98, wealth:.3, gini:.45, pop:4, danger:.4, magic:.6,
      races:{ human:55, orc:15, beastfolk:10, elf:10, dwarf:10 }, faiths:{ dark:35, light:30, none:35 },
      anchor:[420,620],
      zones:[ Z('tro_tan_0','Nghĩa Trang Cũ',0,1,{ grave_rat:12, carrion_crow:10, feral_ghoul:10, bone_beetle:6 }),
              Z('tro_tan_1','Gò Vô Danh',1,3,{ feral_ghoul:6, lantern_wisp:8, wailing_shade:8, barrow_wight:6, shadow_panther:4 }),
              Z('tro_tan_2','Hầm Vương Lăng',3,5,{ barrow_wight:10, wailing_shade:6, bone_dragon:4 }),
              Z('tro_tan_3','Mộ Vạn Người',4,5,{ bone_dragon:6, abyss_ooze:8 }) ],
      lore:'Đất ở đây không giữ được người chết. Làng quanh đây sống bằng nghề đóng quan tài có khóa.' },
    { id:'hac_uyen', nameVi:'Vực Hắc Uyên', biome:'abyss_rift', x:700, y:755, r:82, wealth:.15, gini:.6, pop:.6, danger:.9, magic:.9,
      races:{ orc:40, human:30, dragonkin:15, beastfolk:15 }, faiths:{ dark:70, none:30 },
      anchor:[702,752],
      zones:[ Z('hac_uyen_0','Miệng Vực',3,3,{ hellhound:12, wailing_shade:8, shadow_panther:8 }),
              Z('hac_uyen_1','Bậc Thang Đỏ',4,4,{ blood_succubus:10, abyss_ooze:10 }),
              Z('hac_uyen_2','Đáy Vực',4,5,{ horned_fiend:8, blood_succubus:6, abyss_ooze:5 }),
              Z('hac_uyen_3','Đáy Thật',5,5,{ horned_fiend:10 }) ],
      lord:{ species:'abyss_lord', zone:'hac_uyen_3' },
      lore:'Đồn canh trên miệng vực có lệnh treo từ đời nào: không ai được xuống, trừ người đã tới cấp Huyền thoại.' }
  ];
  G.SEA_ROUTES = [['suong_mu', 'hai_xa'], ['hai_xa', 'tro_tan']];

  // ── ĐỊA HÌNH theo biome (research/03 mục 2): độ lệch cộng vào trường độ cao / độ ẩm / nhiệt trước khi chuẩn hóa,
  // đặc trưng biome không có (no), biome rừng (forest: ô ẩm vừa cũng thành rừng), độ hoang nền (wild, ≤ .8 để sát làng vẫn còn tầng ven).
  // Độ lệch được làm mượt qua biên vùng.
  G.TERRAIN = {
    golden_plains: { elev:-.10, moist:0,    temp:0,    no:['mountain','marsh'], wild:0 },
    moss_forest:   { elev:0,    moist:.25,  temp:0,    no:[], forest:true, wild:.2 },
    fae_glade:     { elev:-.05, moist:.25,  temp:.05,  no:[], forest:true, wild:.3 },
    mist_coast:    { elev:-.05, moist:.15,  temp:0,    no:[], wild:.2 },
    serpent_bay:   { elev:-.10, moist:.20,  temp:.15,  no:[], wild:.5 },
    elder_wood:    { elev:.05,  moist:.25,  temp:0,    no:[], forest:true, wild:.2 },
    frost_tundra:  { elev:0,    moist:0,    temp:-.30, no:['jungle','marsh'], wild:.5 },
    crystal_cave:  { elev:.20,  moist:0,    temp:0,    no:[], wild:.4 },
    storm_spire:   { elev:.30,  moist:.05,  temp:-.15, no:['jungle','marsh'], wild:.7 },
    ash_peak:      { elev:.20,  moist:-.20, temp:.30,  no:['forest','jungle'], wild:.5 },
    wind_steppe:   { elev:0,    moist:-.20, temp:0,    no:[], wild:.1 },
    forge_ruins:   { elev:.05,  moist:-.10, temp:.10,  no:['forest','jungle'], wild:.4 },
    red_desert:    { elev:0,    moist:-.45, temp:.30,  no:['forest','jungle','marsh','lake'], wild:.4 },
    venom_marsh:   { elev:-.20, moist:.35,  temp:.10,  no:['mountain'], wild:.4 },
    grave_hills:   { elev:.05,  moist:0,    temp:0,    no:['jungle'], wild:.3 },
    abyss_rift:    { elev:-.05, moist:-.10, temp:.10,  no:['forest','jungle','lake'], wild:.8 }
  };

  // ── ĐẶC TRƯNG Ô (research/03 mục 2.4). cost: chi phí đi bộ (lãnh thổ, tỉnh, độ hoang); wild: cộng vào độ hoang của ô.
  // Thứ tự = mã lưu trong map.feat.
  G.FEATURES = [
    { id:'open',     nameVi:'Đồng trống', cost:1,   wild:0 },
    { id:'hills',    nameVi:'Đồi',        cost:2,   wild:.10 },
    { id:'forest',   nameVi:'Rừng',       cost:2,   wild:.15 },
    { id:'jungle',   nameVi:'Rừng rậm',   cost:3.5, wild:.30 },
    { id:'marsh',    nameVi:'Đầm',        cost:4,   wild:.25 },
    { id:'mountain', nameVi:'Núi',        cost:8,   wild:.35 },
    { id:'lake',     nameVi:'Hồ',         cost:Infinity, wild:0 }
  ];

  // Quái theo địa hình: nhân trọng số loài ĐÃ có trong bảng của tầng (không thêm loài, nên không phá luật Tier).
  G.FEATURE_SPAWN = {
    hills:    { behavior:{ charger:1.3 } },
    forest:   { behavior:{ ambusher:1.4 }, family:{ beast:1.2, plant:1.2 } },
    jungle:   { behavior:{ ambusher:1.8, flyer:.7 }, family:{ insect:1.5, plant:1.5 } },
    marsh:    { behavior:{ rooted:1.3 }, family:{ ooze:1.5, plant:1.5 } },
    mountain: { behavior:{ flyer:1.5 }, family:{ dragon:1.3, avian:1.3 } }
  };

  // ── TẦNG NGUY HIỂM (research/03 mục 3.4): ngưỡng độ hoang giữa ven | sâu | lõi | vùng chết ──
  G.BAND_W = [1, 2, 3];
  G.BAND_VI = ['Ven', 'Sâu', 'Lõi', 'Vùng chết'];

  // ── NGUYÊN NHÂN CHẾT NỀN (ngoài trận đánh) theo giai đoạn đời; trọng số được nhân theo vùng/cá nhân trong life.js ──
  G.CAUSES = {
    newborn:  { nameVi:'sốt sơ sinh',            stages:{ infant:30 } },
    fever:    { nameVi:'sốt phát ban',           stages:{ infant:15, child:12, adult:3, elder:3 } },
    plague:   { nameVi:'dịch hạch',              stages:{ infant:6, child:6, adult:10, elder:12 }, plague:true },
    swamp:    { nameVi:'sốt đầm lầy',            stages:{ infant:8, child:6, adult:5, elder:4 }, biome:['venom_marsh','serpent_bay'] },
    cold:     { nameVi:'chết rét',               stages:{ infant:6, child:3, adult:3, elder:8 }, cold:true },
    heat:     { nameVi:'say nắng giữa cát',      stages:{ infant:4, child:2, adult:2, elder:6 }, hot:true },
    drown:    { nameVi:'đuối nước',              stages:{ child:8, adult:4, elder:2 } },
    accident: { nameVi:'tai nạn',                stages:{ child:6, adult:8, elder:5 } },
    mine:     { nameVi:'sập hầm mỏ',             stages:{ adult:2 } },
    bandit:   { nameVi:'bị cướp đường giết',     stages:{ adult:3, elder:1 } },
    war:      { nameVi:'tử trận trong chiến tranh', stages:{ adult:2 }, war:true },
    raid:     { nameVi:'quái tấn công làng',     stages:{ infant:4, child:6, adult:5, elder:5 }, raid:true },
    hanged:   { nameVi:'bị treo cổ',             stages:{ adult:0 } },
    curse:    { nameVi:'lời nguyền',             stages:{ adult:1, elder:1 }, magic:true },
    heart:    { nameVi:'đột quỵ',                stages:{ adult:2, elder:20 } },
    lung:     { nameVi:'ho lao',                 stages:{ adult:4, elder:14 } },
    old:      { nameVi:'tuổi già',               stages:{ elder:40 } },
    rust:     { nameVi:'lõi ngừng quay',         stages:{ adult:6, elder:30 }, constructOnly:true },
    fade:     { nameVi:'hồn phai',               stages:{ adult:10, elder:40 }, undeadOnly:true },
    purge:    { nameVi:'bị thánh hỏa thanh tẩy', stages:{ adult:8, elder:4 }, undeadOnly:true }
  };
  // Nguyên nhân không áp cho Cơ Nhân / Bộ Xương.
  G.NO_FLESH = ['newborn', 'fever', 'plague', 'swamp', 'heat', 'heart', 'lung', 'old', 'drown'];

  // ── Kiểm tra dữ liệu đại lục (chạy một lần lúc nạp; lỗi in ra console và trang sim) ──
  G.validateWorld = function (B) {
    const errors = [], warnings = [];
    const seen = new Set();
    for (const R of G.REGIONS) {
      if (seen.has(R.id)) errors.push(`vùng trùng id ${R.id}`); seen.add(R.id);
      if (!B.biomes[R.biome]) errors.push(`${R.id}: biome ${R.biome} không có`);
      if (R.zones.length !== 4) errors.push(`${R.id}: cần đúng 4 khu (ven, sâu, lõi, vùng chết)`);
      R.zones.forEach((z, i) => {
        const [lo, hi] = z.tier;
        if (hi - lo > 2) errors.push(`${z.id}: dải Tier rộng quá 2 (${lo}–${hi})`);
        if (i && z.tier[0] < R.zones[i - 1].tier[0]) errors.push(`${z.id}: khu sâu hơn mà Tier thấp hơn khu trước`);
        for (const [sid] of Object.entries(z.spawns)) {
          const s = B.byId[sid];
          if (!s) { errors.push(`${z.id}: loài ${sid} không có`); continue; }
          if (s.spawn === false) errors.push(`${z.id}: ${sid} là chúa vùng, không được nằm trong bảng sinh`);
          if (s.tier < lo || s.tier > hi) errors.push(`${z.id}: ${sid} Tier ${s.tier} ngoài dải ${lo}–${hi}`);
        }
        // Mọi Tier nhân vật vào được khu (≥ lo − 1) đều phải có loài để gặp.
        for (let t = Math.max(0, lo - 1); t <= hi; t++)
          if (!Object.keys(z.spawns).some(id => B.byId[id] && B.byId[id].tier <= t + 1)) errors.push(`${z.id}: nhân vật Tier ${t} không có loài nào để gặp`);
        const fams = new Set(Object.keys(z.spawns).map(id => B.byId[id] && B.byId[id].family));
        if (fams.size < 2) warnings.push(`${z.id}: chỉ ${fams.size} họ quái`);
      });
      if (R.lord) { const s = B.byId[R.lord.species]; if (!s || s.spawn !== false) errors.push(`${R.id}: chúa vùng ${R.lord.species} phải có spawn:false`); }
      const rsum = Object.values(R.races).reduce((a, b) => a + b, 0);
      if (!rsum) errors.push(`${R.id}: chưa có chủng tộc`);
      for (const r of Object.keys(R.races)) if (!G.RACES[r]) errors.push(`${R.id}: chủng tộc ${r} không có`);
      for (const f of Object.keys(R.faiths)) if (f !== 'none' && !(window.JobLibrary.faiths || {})[f]) errors.push(`${R.id}: giáo phái ${f} không có`);
    }
    return { errors, warnings };
  };
})(window.LifeSim);
