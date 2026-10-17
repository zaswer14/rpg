/* Vạn Kiếp — QUỐC GIA và KHU DÂN CƯ (dữ liệu). Thiết kế: docs/04_Mau_quoc_gia.md, docs/05_Thanh_pho_lang_mac.md.
 * Thế giới không có nước khai tay: js/realm.js bốc 5–7 mẫu trong 50 mẫu dưới đây (10 chủng tộc × 5), đặt kinh đô,
 * lan lãnh thổ, dựng mạng khu dân cư phân cấp, rồi gắn 1–2 đặc trưng riêng.
 * Bước 2 mới dùng: chỉ số, luật (tên), thái độ chủng tộc, đặc tính và đặc trưng (để hiện), phong cách khu dân cư.
 * Tác dụng của luật / đặc tính / đặc trưng lên đời người vào ở các bước sau.
 */
window.LifeSim = window.LifeSim || {};
(function (G) {
  // ── Chính thể ──
  // ruled: có người cai trị NPC. promo: đường thăng tiến (để hiện). Chỉnh mạng khu dân cư: docs/05 mục 4.
  G.GOVS = {
    monarchy:    { nameVi:'Quân chủ',            ruled:true,  promo:'Hiệp sĩ → Nam tước → Bá tước' },
    empire:      { nameVi:'Đế chế',              ruled:true,  promo:'Hiệp sĩ → Tổng đốc tỉnh chiếm được' },
    theocracy:   { nameVi:'Thần quyền',          ruled:true,  promo:'Theo bậc giáo phái', settle:{ templeVillages:2 } },
    council:     { nameVi:'Hội đồng',            ruled:true,  promo:'Ghế hội đồng' },
    merchant:    { nameVi:'Cộng hòa thương nhân', ruled:true, promo:'Ghế hội đồng theo tài sản', settle:{ town:1 }, urban:.05 },
    tribal:      { nameVi:'Bộ lạc',              ruled:true,  promo:'Thắng thách đấu', settle:{ noCity:true, hamlet:3 }, urban:-.03 },
    horde:       { nameVi:'Hãn quốc du mục',     ruled:true,  promo:'Thắng thách đấu, chỉ huy kỵ binh', settle:{ noCity:true, hamlet:3 }, urban:-.03 },
    magocracy:   { nameVi:'Pháp quyền',          ruled:true,  promo:'Bậc tháp theo Huyền thuật', settle:{ signature:'Tháp Pháp Sư' } },
    military:    { nameVi:'Quân quản',           ruled:true,  promo:'Cấp bậc quân đội', settle:{ forts:1 } },
    court:       { nameVi:'Triều đình Yêu Tinh', ruled:true,  promo:'Tước ban bằng khế ước' },
    collective:  { nameVi:'Tập thể',             ruled:false, promo:'Không có' },
    necrocracy:  { nameVi:'Tử quyền',            ruled:true,  promo:'Theo số lần trỗi dậy' },
    confederacy: { nameVi:'Liên minh lỏng',      ruled:true,  promo:'Được bầu làm thủ lĩnh nhóm', settle:{ smallCapital:true, village:2 } },
    order:       { nameVi:'Hội dòng',            ruled:true,  promo:'Bậc trong dòng', settle:{ templeVillages:1 } }
  };

  // ── Luật (docs/04 mục 3). Tác dụng lên đời: bước 4 trở đi. ──
  G.LAWS = {
    hunt_undead:       { nameVi:'Săn Bộ Xương',           desc:'Bộ Xương bị thanh tẩy, bị chặn ở biên giới.' },
    undead_citizen:    { nameVi:'Bộ Xương là công dân',    desc:'Bộ Xương sống như dân thường.' },
    ban_death:         { nameVi:'Cấm tử thuật',            desc:'Luyện tử thuật hoặc theo Hắc Giáo có thể bị bắt.' },
    ban_arcane:        { nameVi:'Cấm phép',                desc:'Luyện huyền thuật có thể bị bắt.' },
    mage_license:      { nameVi:'Giấy phép pháp sư',       desc:'Luyện huyền thuật phải nộp phí hằng năm.' },
    conscript:         { nameVi:'Nghĩa vụ',                desc:'Tuổi trưởng thành phải nhập ngũ hoặc trốn.' },
    no_outsiders:      { nameVi:'Cấm ngoại tộc ở lâu',     desc:'Chủng tộc không được ưu ái chỉ ở được một năm.' },
    no_logging:        { nameVi:'Cấm đốn cây',             desc:'Không có tiều phu.' },
    free_trade:        { nameVi:'Tự do buôn',              desc:'Thương nhân thu nhập cao, thuế thấp.' },
    sea_toll:          { nameVi:'Thuế cảng',               desc:'Tàu ghé cảng mất phí; cảng giàu thêm.' },
    bounties:          { nameVi:'Treo thưởng',             desc:'Nhiều lệnh săn quái; mạo hiểm giả thu nhập cao.' },
    construct_citizen: { nameVi:'Cơ Nhân là công dân',     desc:'Cơ Nhân không bị coi là tài sản.' },
    caste:             { nameVi:'Đẳng cấp',                desc:'Tầng lớp không đổi được, trừ khi được phong tước.' },
    guild_monopoly:    { nameVi:'Độc quyền phường hội',    desc:'Thợ rèn, thợ mỏ, thương nhân phải vào hội.' },
    duel_law:          { nameVi:'Luật quyết đấu',          desc:'Tranh chấp xử bằng đấu tay đôi.' },
    raid_law:          { nameVi:'Cướp phá hợp lệ',         desc:'Cướp làng nước láng giềng mà không cần tuyên chiến.' },
    contract_law:      { nameVi:'Luật khế ước',            desc:'Thất hứa thì bị nguyền.' },
    ancestor_tithe:    { nameVi:'Lễ vật tổ tiên',          desc:'Nộp 5% thu nhập cho tổ đường; nước ổn định hơn.' },
    beast_bond:        { nameVi:'Kết thú',                 desc:'Cưỡi thú, thuần thú học nhanh hơn.' },
    open_borders:      { nameVi:'Mở biên',                 desc:'Không có trạm biên giới; kẻ bị truy nã được ở.' },
    penal_labor:       { nameVi:'Khổ sai',                 desc:'Phạm luật thì đi khổ sai; tỉnh chiếm được bị khổ sai.' },
    liberation:        { nameVi:'Giải phóng',              desc:'Đánh nước coi Cơ Nhân là tài sản; Cơ Nhân nơi khác bỏ trốn sang.' }
  };

  // ── Phong cách khu dân cư theo chủng tộc (docs/05 mục 4) ──
  // biomes / feats: chỗ ưa đặt; urban: tỉ lệ dân đô thị; mountain: đặt được trên ô núi; coastOnly: mọi khu phải ven biển;
  // noFarm: không ăn (không có làng ruộng, ít dân nông thôn); noHamlet: không có thôn; signature: công trình riêng ở kinh đô.
  G.RACE_SETTLE = {
    human:     { biomes:['golden_plains','mist_coast'], feats:['open'], river:1, coast:1, urban:.15, signature:'Đấu trường' },
    elf:       { biomes:['elder_wood','moss_forest','fae_glade'], feats:['forest'], urban:.25, signature:'Cây Mẹ' },
    dwarf:     { biomes:['crystal_cave','ash_peak','frost_tundra'], feats:['hills','mountain'], mountain:true, urban:.35, signature:'Sảnh Rune' },
    orc:       { biomes:['wind_steppe','red_desert'], feats:['open','hills'], urban:.10, palisade:true, signature:'Hố đấu' },
    beastfolk: { biomes:['moss_forest','wind_steppe'], feats:['forest','open'], urban:.10, signature:'Cột totem lớn' },
    fae:       { biomes:['fae_glade','moss_forest'], feats:['forest'], urban:.20, noWalls:true, signature:'Vòng Nấm Lớn' },
    merfolk:   { biomes:['serpent_bay','mist_coast'], feats:[], coast:3, coastOnly:true, urban:.30, signature:'Bến tàu lớn' },
    dragonkin: { biomes:['storm_spire','ash_peak'], feats:['hills'], high:true, urban:.30, noHamlet:true, signature:'Đài lửa' },
    construct: { biomes:['forge_ruins','golden_plains'], feats:['open','hills'], urban:.85, noFarm:true, signature:'Lò Đúc Mẹ' },
    skeleton:  { biomes:['grave_hills','abyss_rift','red_desert'], feats:[], urban:.70, noFarm:true, signature:'Lăng chính' }
  };

  // ── Tín ngưỡng gốc của từng chủng tộc (shared/faiths.js, trường folk; docs/15): đạo mà gia đình của tộc đó thường theo ──
  G.raceFaith = race => {
    const F = (window.JobLibrary || {}).faiths || {};
    if (!G._raceFaith) { G._raceFaith = {}; for (const [id, f] of Object.entries(F)) if (f.folk) G._raceFaith[f.folk] = id; }
    return G._raceFaith[race] || null;
  };

  // ── Công trình theo bậc (docs/05 mục 6): tên theo bậc và xác suất có ──
  G.BUILDINGS = [
    { id:'temple',   name:{ village:'Miếu', town:'Đền', city:'Đền lớn', capital:'Thánh đường' },               p:{ village:.6, town:1, city:1, capital:1 } },
    { id:'healer',   name:{ village:'Thầy lang', town:'Thầy thuốc', city:'Nhà thương', capital:'Nhà thương lớn' }, p:{ village:.4, town:1, city:1, capital:1 } },
    { id:'school',   name:{ town:'Trường làng', city:'Trường', capital:'Học viện' },                         p:{ town:.5, city:1, capital:1 } },
    { id:'smith',    name:{ village:'Lò rèn', town:'Lò rèn', city:'Lò rèn', capital:'Lò rèn' },               p:{ village:.5, town:1, city:1, capital:1 } },
    { id:'market',   name:{ village:'Chợ phiên', town:'Chợ', city:'Chợ lớn', capital:'Chợ lớn' },              p:{ village:.4, town:1, city:1, capital:1 } },
    { id:'barracks', name:{ town:'Đồn lính', city:'Doanh trại', capital:'Doanh trại' },                      p:{ town:.5, city:1, capital:1 } },
    { id:'guild',    name:{ town:'Hội Mạo Hiểm', city:'Hội Mạo Hiểm', capital:'Hội Mạo Hiểm' },              p:{ town:.5, city:1, capital:1 } },
    { id:'walls',    name:{ town:'Rào cọc', city:'Tường đá', capital:'Tường đá đôi' },                        p:{ town:1, city:1, capital:1 } }
  ];

  // ── Năm mươi mẫu (docs/04 mục 4) ──
  // stats: [thuế, quân, tuần tra, ổn định, tham vọng]. fav / wary: chủng tộc ưu ái / dè chừng.
  // tolerant: ưu ái mọi chủng tộc; xeno: dè chừng mọi chủng tộc khác chủng tộc chủ.
  // needs: coast (thủ đô ven biển), mountain (núi trong 4 ô), coastOrRiver.
  const T = (id, race, label, gov, faith, biomes, feats, needs, size, stats, laws, lawPool, fav, wary, trait, traitDesc, extra = {}) =>
    ({ id, race, label, gov, faith, biomes, feats, needs, size, stats, laws, lawPool, fav, wary, trait: { nameVi: trait, desc: traitDesc }, ...extra });
  G.NATION_TEMPLATES = [
    // Nhân Loại
    T('H1','human','Vương Quốc Hiệp Sĩ','monarchy',{ light:80, none:20 },['golden_plains','moss_forest'],[],[],'L',[.18,1.2,1.25,.70,.50],['hunt_undead','bounties'],['caste'],['human'],['orc'],'Thập tự chinh','Ổn định cao thì hay tuyên chiến với nước Hắc Giáo hoặc nước Bộ Xương.'),
    T('H2','human','Cộng Hòa Thương Cảng','merchant',{ light:40, none:60 },['mist_coast','golden_plains'],[],['coast'],'M',[.12,.8,1.0,.60,.30],['free_trade','sea_toll'],['open_borders'],['human','merfolk'],[],'Lính đánh thuê','Trong chiến tranh mua thêm sức quân bằng tiền.'),
    T('H3','human','Thánh Quốc Bình Minh','theocracy',{ light:100 },['golden_plains','grave_hills'],[],[],'M',[.20,1.0,1.1,.75,.40],['hunt_undead','ban_death'],['mage_license'],['human','dragonkin'],['fae','skeleton'],'Tòa dị giáo','Người khác đạo bị phạt; Devotion Quang Minh tăng nhanh hơn.'),
    T('H4','human','Đế Chế Kỷ Luật','empire',{ none:60, light:40 },['golden_plains','wind_steppe'],[],[],'L',[.25,1.4,1.3,.55,.90],['conscript','caste'],[],['human'],[],'Quân đoàn','Chiếm tỉnh nhanh gấp đôi, nhưng tỉnh mới làm nước bất ổn.'),
    T('H5','human','Liên Minh Biên Viễn','confederacy',{ none:70, wild:30 },['moss_forest','venom_marsh','red_desert'],[],[],'M',[.08,.9,.8,.50,.30],['bounties','open_borders'],[],[],[],'Đất lành','Kẻ bị truy nã nơi khác được ân xá; lập làng rẻ hơn.',{ tolerant:true }),
    // Tiên Tộc
    T('E1','elf','Rừng Quốc Cây Mẹ','council',{ wild:85, none:15 },['elder_wood','fae_glade'],['forest'],[],'M',[.10,.8,1.1,.85,.15],['no_outsiders','no_logging'],[],['elf','fae'],['orc','construct','dwarf'],'Ký ức dài','Gần như không nổi loạn; sử của nước không bao giờ bị cắt.'),
    T('E2','elf','Tháp Quốc Ngân Nguyệt','magocracy',{ none:60, wild:40 },['elder_wood','crystal_cave'],[],[],'S',[.20,1.0,1.0,.70,.40],['mage_license','caste'],[],['elf'],['human'],'Tháp pháp sư','Huyền thuật học nhanh hơn; chiến tranh cộng sức phép.'),
    T('E3','elf','Thị Tộc Hoang Tiên','tribal',{ wild:100 },['moss_forest'],['jungle','forest'],[],'M',[.05,1.1,.9,.60,.30],['no_logging','beast_bond'],[],['elf','beastfolk'],['human'],'Rừng là tường','Tỉnh rừng phòng thủ mạnh; người lạ đi rừng bị phục kích.'),
    T('E4','elf','Hạm Đội Trăng','merchant',{ wild:50, deep:50 },['mist_coast','serpent_bay'],[],['coast'],'S',[.12,.9,1.0,.65,.35],['free_trade','sea_toll'],[],['elf','merfolk'],[],'Tàu lá','Mọi cảng của nước có tàu viễn dương.'),
    T('E5','elf','Giáo Quốc Tiên Sa Ngã','theocracy',{ dark:100 },['crystal_cave','grave_hills','abyss_rift'],[],[],'M',[.22,1.1,1.0,.55,.60],['penal_labor'],['undead_citizen'],['elf'],[],'Ẩn trong bóng','Ẩn thân học nhanh hơn; chiến tranh bằng ám sát.',{ xeno:true }),
    // Người Lùn
    T('D1','dwarf','Liên Bang Thị Tộc Lò','council',{ stone:80, forge:20 },['crystal_cave'],['mountain','hills'],['mountain'],'M',[.20,1.1,1.15,.75,.30],['ban_arcane','guild_monopoly'],[],['dwarf'],['elf'],'Đường hầm','Các tỉnh núi nối nhau dưới đất, qua núi không cần đèo.'),
    T('D2','dwarf','Vương Quốc Núi Sâu','monarchy',{ stone:100 },['ash_peak','frost_tundra'],['mountain'],['mountain'],'M',[.18,1.2,1.2,.80,.20],['ancestor_tithe','no_outsiders'],[],['dwarf'],[],'Sổ thù','Không tuyên chiến trước, nhưng mất tỉnh thì đánh tới khi lấy lại.'),
    T('D3','dwarf','Hội Buôn Mạch Bạc','merchant',{ stone:50, none:50 },['crystal_cave'],['hills'],[],'S',[.14,.8,1.0,.65,.35],['free_trade','guild_monopoly'],[],['dwarf','human'],[],'Ngân hàng','Cho vay tiền; nước khác vay để đánh nhau.'),
    T('D4','dwarf','Thệ Ước Giữ Cổng','military',{ stone:100 },['storm_spire','ash_peak','abyss_rift','frost_tundra'],[],[],'S',[.15,1.35,1.4,.70,.10],['conscript','bounties'],[],['dwarf'],[],'Giữ cổng','Tỉnh giáp vùng nguy hiểm tuần tra mạnh, dọn quái nhiều.',{ forts:2 }),
    T('D5','dwarf','Giáo Hội Đe Rune','theocracy',{ stone:75, forge:25 },['forge_ruins','ash_peak'],[],[],'S',[.22,1.0,1.1,.70,.30],['ban_death','construct_citizen'],[],['dwarf','construct'],['elf','fae'],'Rune','Trang bị mua trong nước tốt hơn một bậc.'),
    // Orc
    T('O1','orc','Hãn Quốc Thảo Nguyên','horde',{ ancestor:80, none:20 },['wind_steppe','red_desert'],['open'],[],'L',[.08,1.3,.8,.45,.80],['conscript','duel_law'],[],['orc','beastfolk'],['elf'],'Kỵ binh','Năm đầu chiến tranh đánh mạnh; kinh đô dời được.'),
    T('O2','orc','Bộ Lạc Huyết Nộ','tribal',{ ancestor:60, dark:40 },['ash_peak','grave_hills'],[],[],'M',[.05,1.4,.7,.35,.95],['duel_law','raid_law'],[],['orc'],[],'Kẻ mạnh nhất','Tù trưởng chết thì nội chiến một năm.',{ xeno:true }),
    T('O3','orc','Bầy Sói Rừng Thẳm','tribal',{ ancestor:100 },['moss_forest','wind_steppe'],['forest','hills'],[],'M',[.12,1.2,1.0,.55,.50],['beast_bond'],['raid_law'],['orc','beastfolk'],['construct'],'Bầy lớn dần','Mỗi năm hòa bình bầy đông thêm, quân mạnh thêm.'),
    T('O4','orc','Liên Minh Nanh Gãy','confederacy',{ ancestor:50, none:50 },[],[],[],'S',[.10,1.1,.9,.50,.40],['open_borders'],[],[],[],'Bán kiếm','Nước khác thuê họ khi có chiến tranh.',{ tolerant:true }),
    T('O5','orc','Liên Bộ Lạc Xương Tổ','tribal',{ ancestor:100 },['frost_tundra','grave_hills'],[],[],'M',[.10,1.0,1.0,.60,.40],['hunt_undead','ancestor_tithe'],[],['orc','beastfolk'],['skeleton'],'Đồng cốt','Tổ tiên báo mộng trước dịch và chiến tranh.'),
    // Người Thú
    T('B1','beastfolk','Liên Minh Bầy','confederacy',{ totem:80, wild:20 },['moss_forest','wind_steppe'],['forest'],[],'M',[.06,1.1,1.0,.60,.40],['beast_bond','no_logging'],[],['beastfolk'],['construct'],'Bầy','Tỉnh bị đánh thì tỉnh kề tiếp viện.'),
    T('B2','beastfolk','Hội Săn Mặt Trăng','order',{ totem:100 },['elder_wood','moss_forest'],['jungle','forest'],[],'S',[.08,1.0,1.2,.65,.30],['bounties'],[],['beastfolk','elf'],[],'Thợ săn','Dọn quái nhiều, vòng an toàn rộng hơn.'),
    T('B3','beastfolk','Hãn Quốc Vằn','horde',{ totem:90, none:10 },['wind_steppe','red_desert'],['open'],[],'M',[.07,1.25,.8,.45,.70],['raid_law','beast_bond'],[],['beastfolk','orc'],[],'Cưỡi thú','Đi ngoài đường không bị địa hình làm chậm.'),
    T('B4','beastfolk','Cộng Đồng Đồng Cỏ','council',{ totem:70, none:30 },['golden_plains','wind_steppe'],['open'],[],'M',[.10,.8,1.0,.70,.10],['beast_bond'],[],['beastfolk','human'],[],'Đàn gia súc','Chăn nuôi thu nhập cao; nạn đói hiếm hơn.'),
    T('B5','beastfolk','Vương Quốc Sư Tử','monarchy',{ totem:80, none:20 },['red_desert','wind_steppe'],['jungle'],[],'M',[.15,1.2,1.0,.60,.60],['duel_law','caste'],[],['beastfolk'],[],'Ngai thách đấu','Ai thắng vua trong quyết đấu thì làm vua.'),
    // Yêu Tinh
    T('F1','fae','Hạ Đình','court',{ season:100 },['fae_glade','moss_forest'],['forest'],[],'M',[.10,.8,1.0,.70,.30],['contract_law'],[],['fae','elf'],['construct','dwarf'],'Thời gian lệch','Người ngoài ở lâu có thể ngủ quên bảy năm.'),
    T('F2','fae','Đông Đình','court',{ season:70, dark:30 },['frost_tundra','grave_hills'],[],[],'M',[.15,1.1,1.0,.60,.55],['contract_law','no_outsiders'],[],['fae'],['human'],'Mùa đông dài','Tỉnh của nước lạnh quanh năm; quái băng thuần.'),
    T('F3','fae','Chợ Nấm Ma','merchant',{ none:60, season:40 },['fae_glade','venom_marsh'],[],[],'S',[.05,.6,.8,.50,.20],['free_trade','contract_law'],[],[],[],'Mặc cả','Đổi ký ức, năm tuổi, tên thật lấy đồ vật.',{ tolerant:true }),
    T('F4','fae','Bầy Tiểu Yêu Lang Thang','confederacy',{ season:50, none:50 },['moss_forest','fae_glade'],['forest'],[],'S',[0,.7,.7,.30,.20],['open_borders'],[],['fae'],[],'Đường đổi hướng','Đi trong lãnh thổ dễ lạc; biên giới tự dịch.'),
    T('F5','fae','Vương Quốc Giấc Mơ','theocracy',{ season:100 },['fae_glade'],[],[],'S',[.12,.7,1.0,.75,.20],[],['mage_license'],['fae'],[],'Tiên tri','Mỗi kiếp sinh trong nước nhận một lời tiên tri.'),
    // Hải Tộc
    T('M1','merfolk','Thị Quốc San Hô','merchant',{ deep:60, none:40 },['serpent_bay','mist_coast'],[],['coast'],'M',[.12,.9,1.0,.60,.35],['free_trade','sea_toll'],[],['merfolk','human'],[],'Hải lộ','Mỗi cảng giàu thêm.'),
    T('M2','merfolk','Vương Triều Triều Dâng','monarchy',{ deep:80, none:20 },['serpent_bay'],[],['coast'],'M',[.18,1.1,1.0,.65,.55],['sea_toll'],['conscript'],['merfolk'],[],'Hải quân','Đánh nước ven biển thì thắng thế.'),
    T('M3','merfolk','Giáo Đoàn Vực Thẳm','theocracy',{ deep:100 },['serpent_bay','abyss_rift'],[],['coast'],'S',[.20,1.0,.9,.55,.50],['undead_citizen'],[],['merfolk','skeleton'],['human','dragonkin'],'Tiếng gọi','Chúa biển không đánh tàu của nước này.'),
    T('M4','merfolk','Liên Minh Cướp Biển','confederacy',{ none:60, dark:40 },['serpent_bay'],[],['coast'],'S',[.05,1.0,.6,.40,.70],['raid_law','open_borders'],[],[],[],'Cướp biển','Hải trình gần lãnh thổ hay gặp cướp.',{ tolerant:true }),
    T('M5','merfolk','Bộ Tộc Rạn Ngầm','tribal',{ deep:100 },['serpent_bay'],[],['coast'],'S',[.05,.9,1.0,.70,.10],['no_outsiders'],[],['merfolk'],[],'Dưới nước','Làng dưới nước; nước không có cảng không chiếm được.'),
    // Long Nhân
    T('R1','dragonkin','Long Vương Quốc','monarchy',{ flame:100 },['storm_spire','ash_peak'],['hills'],[],'M',[.20,1.3,1.1,.65,.70],['caste'],[],['dragonkin'],['orc'],'Huyết thống rồng','Chỉ Long Nhân được phong tước.'),
    T('R2','dragonkin','Thị Tộc Tro','tribal',{ flame:90, none:10 },['ash_peak'],['hills'],[],'S',[.12,1.2,1.0,.60,.40],['ancestor_tithe'],[],['dragonkin','dwarf'],[],'Ấp trứng','Dân tăng sau mỗi lần núi lửa phun.'),
    T('R3','dragonkin','Giáo Hội Ngọn Lửa','theocracy',{ flame:100 },['ash_peak','storm_spire'],[],[],'M',[.22,1.1,1.1,.70,.55],['hunt_undead','ban_death'],[],['dragonkin','human'],['skeleton'],'Thánh hỏa','Bộ Xương trong nước bị thiêu nhiều hơn.'),
    T('R4','dragonkin','Đế Chế Sừng Đen','empire',{ flame:50, dark:50 },['ash_peak','abyss_rift'],[],[],'L',[.28,1.4,1.0,.45,.90],['conscript','penal_labor'],[],['dragonkin'],[],'Bạo chúa','Tỉnh mới chiếm bị khổ sai; nổi loạn nhiều.',{ xeno:true }),
    T('R5','dragonkin','Thủ Hộ Đoàn Cổ Long','order',{ flame:70, none:30 },['storm_spire'],['hills'],['mountain'],'S',[.08,1.0,1.2,.80,.05],['bounties'],[],['dragonkin'],[],'Canh giấc rồng','Cổ Long hiếm thức dậy; ai đánh thức nó thì bị truy nã.'),
    // Cơ Nhân
    T('C1','construct','Xưởng Quốc Tự Trị','collective',{ forge:100 },['forge_ruins'],[],[],'S',[.25,1.0,1.0,.90,.10],['construct_citizen','ban_death'],[],['construct'],[],'Dây chuyền','Dân tăng bằng đúc, theo độ giàu.'),
    T('C2','construct','Hội Đồng Bánh Răng','council',{ forge:70, none:30 },['crystal_cave'],['hills'],[],'M',[.18,1.0,1.1,.75,.30],['construct_citizen','guild_monopoly'],[],['construct','dwarf','human'],[],'Kỹ nghệ','Cơ khí học nhanh hơn.'),
    T('C3','construct','Quân Đoàn Sắt','military',{ forge:50, none:50 },['golden_plains','forge_ruins'],[],[],'M',[.20,1.4,1.2,.80,.75],['conscript','construct_citizen'],[],['construct'],[],'Giao thức chiến','Không cầu hòa; chiến tranh kéo dài.'),
    T('C4','construct','Thành Phố Đồng Hồ','merchant',{ none:80, forge:20 },['golden_plains','mist_coast'],[],['coastOrRiver'],'S',[.15,.8,1.1,.85,.20],['free_trade','construct_citizen'],[],['construct','human'],[],'Giờ chính xác','Đường và hải trình qua nước nhanh hơn.'),
    T('C5','construct','Phong Trào Thức Tỉnh','confederacy',{ none:70, dark:30 },['forge_ruins'],[],[],'S',[.10,1.1,.9,.40,.60],['construct_citizen','liberation'],[],['construct'],['human'],'Phá xích','Tỉnh chiếm được thả Cơ Nhân thành công dân.'),
    // Bộ Xương
    T('S1','skeleton','Vương Triều Xương','necrocracy',{ dark:90, none:10 },['grave_hills','abyss_rift'],[],[],'M',[.20,1.3,1.0,.60,.60],['undead_citizen','penal_labor'],[],['skeleton'],['human'],'Đội quân không chết','Sau chiến tranh quân hồi lại rất nhanh.'),
    T('S2','skeleton','Hội Kẻ Sám Hối','order',{ light:100 },['grave_hills','golden_plains'],[],[],'S',[.10,.8,1.0,.70,.10],['undead_citizen','ban_death'],[],['skeleton','human'],[],'Sám hối','Bộ Xương theo Quang Minh dễ hơn; nước Quang Minh khác không đánh.'),
    T('S3','skeleton','Hầm Mộ Tự Trị','council',{ dark:60, deep:40 },['crystal_cave','grave_hills'],[],[],'S',[.15,1.0,1.0,.65,.30],['undead_citizen'],[],['skeleton'],[],'Thư viện người chết','Tử linh thuật, linh hồn học nhanh hơn.'),
    T('S4','skeleton','Đạo Quân Lang Thang','horde',{ none:70, dark:30 },['red_desert','abyss_rift'],[],[],'M',[0,1.2,.6,.30,.80],['raid_law','undead_citizen'],[],['skeleton'],[],'Đất chết','Tỉnh nước này chiếm được hoang thêm.',{ xeno:true }),
    T('S5','skeleton','Thị Quốc Mộ Đá','merchant',{ none:60, deep:40 },['grave_hills','red_desert'],[],[],'S',[.14,.8,1.0,.70,.20],['undead_citizen','free_trade'],[],[],[],'Nghĩa trang thuê','Người sống thuê chỗ chôn; Bộ Xương trỗi dậy ở đây thành công dân.',{ tolerant:true })
  ];

  // ── Đặc trưng riêng (docs/04 mục 5). when: điều kiện; mods: cộng vào chỉ số khi tạo. ──
  // Đặc trưng có `target` gắn với một nước khác (thù, hôn nhân, chư hầu) và đổi quan hệ ban đầu.
  G.QUIRKS = [
    { id:'young_ruler',  group:'throne',  nameVi:'Vua trẻ',              when:{ ruled:true }, mods:{ stability:-.1, ambition:.2 } },
    { id:'old_ruler',    group:'throne',  nameVi:'Vua già sắp băng',     when:{ ruled:true } },
    { id:'two_lines',    group:'throne',  nameVi:'Hai dòng tranh ngôi',  when:{ gov:['monarchy','empire'] }, mods:{ stability:-.1 } },
    { id:'gold_mine',    group:'economy', nameVi:'Mỏ vàng',              when:{ near:'mountain' } },
    { id:'famine',       group:'economy', nameVi:'Nạn đói',              when:{ notGov:['collective','necrocracy'] }, mods:{ stability:-.1 } },
    { id:'great_port',   group:'economy', nameVi:'Cảng lớn',             when:{ coastCapital:true } },
    { id:'master_craft', group:'economy', nameVi:'Thợ bậc thầy' },
    { id:'corruption',   group:'economy', nameVi:'Tham nhũng',           mods:{ tax:.05, stability:-.05 } },
    { id:'elite_army',   group:'army',    nameVi:'Quân tinh nhuệ',       mods:{ army:.15 } },
    { id:'weak_army',    group:'army',    nameVi:'Quân ốm yếu',          mods:{ army:-.15 } },
    { id:'strong_navy',  group:'army',    nameVi:'Thủy quân mạnh',       when:{ coastCapital:true } },
    { id:'monster_march',group:'army',    nameVi:'Biên giới quái',       mods:{ patrol:.1 } },
    { id:'relic',        group:'faith',   nameVi:'Thánh tích',           when:{ hasFaith:true } },
    { id:'heresy',       group:'faith',   nameVi:'Dị giáo ngầm',         when:{ hasFaith:true }, mods:{ stability:-.05 } },
    { id:'tolerance',    group:'faith',   nameVi:'Khoan dung' },
    { id:'lord_shrine',  group:'faith',   nameVi:'Đền chúa vùng',        when:{ lordNear:true } },
    { id:'old_feud',     group:'diplo',   nameVi:'Thù truyền kiếp',      target:'feud' },
    { id:'royal_match',  group:'diplo',   nameVi:'Liên minh hôn nhân',   when:{ gov:['monarchy','empire','court'] }, target:'marriage' },
    { id:'vassal',       group:'diplo',   nameVi:'Chư hầu',              when:{ size:['S'] }, target:'vassal', mods:{ ambition:-.2 } },
    { id:'xenophobia',   group:'diplo',   nameVi:'Bài ngoại',            when:{ notTolerant:true } },
    { id:'fading_empire',group:'history', nameVi:'Đế chế suy tàn',       when:{ size:['L'] }, mods:{ stability:-.2 } },
    { id:'new_realm',    group:'history', nameVi:'Nước mới lập',         mods:{ stability:-.1, ambition:.2 } },
    { id:'royal_curse',  group:'history', nameVi:'Lời nguyền hoàng tộc', when:{ ruled:true } },
    { id:'lost_treasure',group:'history', nameVi:'Kho báu thất lạc' },
    { id:'academy',      group:'culture', nameVi:'Học viện danh tiếng' },
    { id:'arena',        group:'culture', nameVi:'Đấu trường' },
    { id:'assassins',    group:'culture', nameVi:'Hội ám sát' },
    { id:'festival',     group:'culture', nameVi:'Lễ hội lớn' },
    { id:'horses',       group:'culture', nameVi:'Ngựa giống tốt',       when:{ biomeAny:['golden_plains','wind_steppe'] } },
    { id:'sacred_grove', group:'culture', nameVi:'Rừng thiêng',          when:{ near:'forest' } },
    { id:'court_mage',   group:'culture', nameVi:'Pháp sư cung đình',    when:{ notLaw:'ban_arcane' } }
  ];
})(window.LifeSim);
