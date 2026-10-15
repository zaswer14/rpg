/* Vạn Kiếp — mở rộng bestiary của thư viện cho đại lục của game.
 * Thư viện có 6 vùng săn và 43 loài; đại lục cần thêm 10 loại địa hình và 7 vùng biển (loài biển cuối danh sách). File này THÊM vùng và loài vào
 * window.JobLibrary (cùng lược đồ species.js/biomes.js) trước khi gọi JobLibrary.bestiary(), nên mọi loài mới
 * đi qua đúng bộ kiểm tra của thư viện (họ, kiểu, cỡ, khí chất, marker không trùng).
 * Không sửa file trong library/: Skeleton Codex không thấy các loài này.
 */
window.JobLibrary = window.JobLibrary || {};
(function (L) {
  const biomes = {
    golden_plains: { nameEn:'Golden Plains', nameVi:'Đồng Lúa', tiers:[0,2], palette:{ sky:'#1c2a18', far:'#3b5a2a', ground:'#8a9a4a', edge:'#e3d27a' }, eliteChance:.06, alphaChance:.02, mood:'Đồng ruộng quanh kinh đô; thú nhỏ và bù nhìn tỉnh giấc.' },
    elder_wood:    { nameEn:'Elder Wood',    nameVi:'Rừng Cổ Thụ', tiers:[0,3], palette:{ sky:'#0e1d18', far:'#1f3d30', ground:'#3f6a4a', edge:'#b8e0c8' }, eliteChance:.08, alphaChance:.03, mood:'Rừng của Tiên Tộc; cây già hơn vương triều.' },
    fae_glade:     { nameEn:'Dream Glade',   nameVi:'Trảng Mộng', tiers:[0,3], palette:{ sky:'#1b1426', far:'#38285a', ground:'#5f7a5a', edge:'#f0a8e8' }, eliteChance:.08, alphaChance:.03, mood:'Ranh giới giấc mơ mỏng; đường đi tự đổi.' },
    mist_coast:    { nameEn:'Mist Coast',    nameVi:'Bờ Sương', tiers:[0,3], palette:{ sky:'#142028', far:'#2a4048', ground:'#7a8a80', edge:'#c8e0e8' }, eliteChance:.08, alphaChance:.03, mood:'Vách đá, xác tàu và sương không tan.' },
    serpent_bay:   { nameEn:'Serpent Bay',   nameVi:'Vịnh Rắn Biển', tiers:[1,4], palette:{ sky:'#0c1a26', far:'#16344a', ground:'#4a7a78', edge:'#5fe0d0' }, eliteChance:.1, alphaChance:.04, lord:'leviathan', mood:'Quần đảo san hô; dưới nước là thứ to hơn thuyền.' },
    frost_tundra:  { nameEn:'Frost Tundra',  nameVi:'Băng Nguyên', tiers:[1,4], palette:{ sky:'#162030', far:'#33465e', ground:'#c8d4dc', edge:'#ffffff' }, eliteChance:.1, alphaChance:.04, mood:'Tuyết quanh năm; thú lớn, đêm dài.' },
    wind_steppe:   { nameEn:'Wind Steppe',   nameVi:'Thảo Nguyên Gió', tiers:[0,3], palette:{ sky:'#202418', far:'#4a5030', ground:'#a8a060', edge:'#f0e0a0' }, eliteChance:.07, alphaChance:.03, mood:'Cỏ ngang hông, gió không ngừng; bộ lạc Orc và Người Thú.' },
    red_desert:    { nameEn:'Red Desert',    nameVi:'Hồng Sa', tiers:[0,4], palette:{ sky:'#2a1a12', far:'#5a3020', ground:'#c87a4a', edge:'#ffd090' }, eliteChance:.1, alphaChance:.04, mood:'Cát đỏ chôn các vương triều cũ.' },
    forge_ruins:   { nameEn:'Forge Ruins',   nameVi:'Phế Xưởng', tiers:[1,4], palette:{ sky:'#1a1816', far:'#3a342c', ground:'#7a6a58', edge:'#ffb060' }, eliteChance:.1, alphaChance:.04, mood:'Xưởng đúc cổ vẫn chạy, không còn ai ra lệnh.' },
    abyss_rift:    { nameEn:'Abyss Rift',    nameVi:'Vực Hắc Uyên', tiers:[3,5], palette:{ sky:'#120810', far:'#2a1020', ground:'#3a2030', edge:'#ff4060' }, eliteChance:.14, alphaChance:.06, lord:'abyss_lord', mood:'Khe nứt mở xuống tầng dưới thế giới.' }
  };
  Object.assign(L.biomes = L.biomes || {}, biomes);

  const S = (o) => o;
  const extra = [
    // Đồng Lúa
    S({ id:'horned_hare',  family:'beast', nameEn:'Horned Hare', nameVi:'Thỏ Sừng', tier:0, size:'S', behavior:'chaser', aspect:null, hp:.7, speed:1.3, group:[2,3],
        attack:'nhảy húc bằng sừng rồi chạy vòng', marker:'một sừng xoắn giữa trán + tai cụp', loot:['da','sừng'], habitat:['golden_plains','elder_wood','wind_steppe'] }),
    S({ id:'field_scarecrow', family:'construct', nameEn:'Wakened Scarecrow', nameVi:'Bù Nhìn Thức Tỉnh', tier:1, size:'M', behavior:'pacer', aspect:null, hp:1.1,
        attack:'quét liềm gỉ ngang người', marker:'đầu bao tải khâu chỉ đỏ + liềm gỉ', loot:['vải bùa','lõi rơm'], habitat:['golden_plains'] }),
    S({ id:'wheat_wurm',   family:'insect', nameEn:'Wheat Wurm', nameVi:'Sâu Lúa Khổng Lồ', tier:1, size:'M', behavior:'ambusher', aspect:null, hp:1.1,
        attack:'trồi khỏi luống lúa cắn chân', marker:'đốt thân vàng óng như bông lúa', loot:['vỏ giáp'], habitat:['golden_plains'] }),
    S({ id:'stone_bison',  family:'beast', nameEn:'Stonehorn Bison', nameVi:'Bò Rừng Sừng Đá', tier:2, size:'L', behavior:'charger', aspect:'stone', hp:1.2, group:[1,3],
        attack:'cả đàn húc lao theo hàng ngang', marker:'đôi sừng đá bọc rêu + bướu vai', loot:['da','sừng'], habitat:['golden_plains','wind_steppe'] }),
    // Rừng Cổ Thụ
    S({ id:'silver_spider', family:'insect', nameEn:'Silverweb Spider', nameVi:'Nhện Tơ Bạc', tier:1, size:'S', behavior:'ambusher', aspect:'moon', group:[2,3],
        attack:'thả tơ trói từ trên cành rồi cắn', marker:'lưng có vân trăng bạc', loot:['tơ bạc','túi độc'], habitat:['elder_wood'] }),
    S({ id:'fallen_dryad', family:'spirit', nameEn:'Fallen Dryad', nameVi:'Tiên Rừng Sa Ngã', tier:2, size:'M', behavior:'flyer', aspect:'nature',
        attack:'gọi rễ trói chân rồi quất cành', marker:'tóc là cành khô + mặt nạ vỏ cây', loot:['hồn tinh','nhựa'], habitat:['elder_wood','fae_glade'] }),
    S({ id:'nightmare_stag', family:'magical_beast', nameEn:'Nightmare Stag', nameVi:'Hươu Ác Mộng', tier:3, size:'L', behavior:'charger', aspect:'dark', hp:1.1,
        attack:'húc gạc để lại vệt bóng gây Nguyền', marker:'gạc đen nhỏ giọt bóng tối', loot:['ma hạch','gạc'], habitat:['elder_wood'] }),
    // Trảng Mộng
    S({ id:'pixie_swarm',  family:'spirit', nameEn:'Prank Pixies', nameVi:'Bầy Tiểu Tiên Quậy', tier:0, size:'S', behavior:'flyer', aspect:'glamour', hp:.6, group:[3,5],
        attack:'rắc bụi làm hoa mắt rồi giật đồ', marker:'đốm sáng có cánh chuồn chuồn', loot:['bụi tiên'], habitat:['fae_glade','elder_wood'] }),
    S({ id:'mimic_mushroom', family:'plant', nameEn:'Mimic Mushroom', nameVi:'Nấm Giả Dạng', tier:1, size:'S', behavior:'rooted', aspect:'venom', group:[2,4],
        attack:'đớp chân khi bị giẫm, phun bào tử', marker:'mũ nấm chấm trắng có răng', loot:['hạt giống','túi độc'], habitat:['fae_glade'] }),
    S({ id:'thorn_unicorn', family:'magical_beast', nameEn:'Thorn Unicorn', nameVi:'Kỳ Lân Gai', tier:3, size:'L', behavior:'charger', aspect:'nature', speed:1.2,
        attack:'lao sừng, đường chạy mọc gai', marker:'sừng gai hồng + bờm hoa', loot:['ma hạch','sừng'], habitat:['fae_glade'] }),
    // Bờ Sương
    S({ id:'rock_crab',    family:'insect', nameEn:'Rock Crab', nameVi:'Cua Đá', tier:0, size:'S', behavior:'pacer', aspect:null, hp:1.1, group:[2,3],
        attack:'kẹp càng to rồi lùi ngang', marker:'mai phủ hà, một càng to gấp đôi', loot:['vỏ giáp'], habitat:['mist_coast','serpent_bay'] }),
    S({ id:'drowned_sailor', family:'undead', nameEn:'Drowned Sailor', nameVi:'Thủy Thi', tier:1, size:'M', behavior:'chaser', aspect:'tide', group:[1,3],
        attack:'vung mỏ neo xích quét vòng', marker:'áo thủy thủ rách quấn rong + mỏ neo xích', loot:['xương cũ','đồng xu muối'], habitat:['mist_coast','serpent_bay'] }),
    S({ id:'tide_elemental', family:'elemental', nameEn:'Tide Spirit', nameVi:'Thủy Linh Triều', tier:2, size:'M', behavior:'spitter', aspect:'tide',
        attack:'phun cột nước đẩy lùi gây Lạnh', marker:'thân sóng cuộn có vỏ ốc làm mắt', loot:['tinh thể nguyên tố'], habitat:['mist_coast'] }),
    S({ id:'siren',        family:'fiend', nameEn:'Siren', nameVi:'Nữ Yêu Biển', tier:3, size:'M', behavior:'spitter', aspect:'abyss',
        attack:'hát kéo người về phía mình rồi cắn', marker:'đuôi cá vảy đen + đàn hạc xương', loot:['huyết ấn','vảy'], habitat:['mist_coast','serpent_bay'] }),
    // Vịnh Rắn Biển
    S({ id:'reef_shark',   family:'beast', nameEn:'Reef Shark', nameVi:'Cá Mập Rạn', tier:2, size:'M', behavior:'chaser', aspect:'feral', speed:1.25, group:[2,3],
        attack:'vây quanh rồi đớp gây Chảy máu', marker:'vây lưng sứt mẻ + răng ba hàng', loot:['răng','da'], habitat:['serpent_bay'] }),
    S({ id:'sea_serpent',  family:'dragon', nameEn:'Sea Serpent', nameVi:'Hải Xà', tier:3, size:'L', behavior:'spitter', aspect:'tide', hp:1.2,
        attack:'quấn thuyền, phun nước áp lực', marker:'mào vây xanh dọc gáy + thân khoanh', loot:['vảy','máu rồng'], habitat:['serpent_bay'] }),
    S({ id:'kraken_spawn', family:'magical_beast', nameEn:'Kraken Spawn', nameVi:'Kraken Non', tier:4, size:'XL', behavior:'rooted', aspect:'abyss', hp:1.1,
        attack:'tám xúc tu quật xuống boong theo nhịp', marker:'tám xúc tu giác hút phát lân quang', loot:['ma hạch','mực đen'], habitat:['serpent_bay'] }),
    S({ id:'leviathan',    family:'dragon', nameEn:'Leviathan', nameVi:'Thủy Quái Leviathan', tier:5, size:'XL', behavior:'charger', aspect:'tide', hp:2, dmg:1.5, spawn:false,
        attack:'nuốt cả sóng, đánh chìm đảo nhỏ', marker:'hàm dưới như vách đá + mắt to bằng thuyền', loot:['vảy','máu rồng'], habitat:['serpent_bay'], note:'Chúa vùng; chỉ xuất hiện qua sự kiện.' }),
    // Biển (research/03 mục 7.2). Habitat là biome đất giáp bờ của vùng biển (G.SEAS[].biome).
    S({ id:'lantern_jelly', family:'ooze', nameEn:'Lantern Jelly', nameVi:'Sứa Đèn', tier:0, size:'M', behavior:'flyer', aspect:'tide', hp:.7, group:[2,4],
        attack:'trôi sát mạn rồi quấn tua gây tê', marker:'chuông trong suốt có đốm sáng xanh bên trong', loot:['dịch nhầy','túi độc'], habitat:['mist_coast','red_desert'] }),
    S({ id:'thunder_eel',  family:'beast', nameEn:'Thunder Eel', nameVi:'Cá Chình Điện', tier:1, size:'M', behavior:'ambusher', aspect:'storm', group:[1,2],
        attack:'trồi khỏi hốc đá quấn chân rồi phóng điện', marker:'thân đen có vạch vàng phát sáng dọc sườn', loot:['da','tinh thể nguyên tố'], habitat:['mist_coast','storm_spire'] }),
    S({ id:'fang_seal',    family:'beast', nameEn:'Fanged Seal', nameVi:'Hải Cẩu Nanh', tier:1, size:'M', behavior:'chaser', aspect:'frost', group:[2,4],
        attack:'trườn lên tảng băng rồi cắn kéo xuống nước', marker:'hai nanh dài như hải mã + lông xám đốm trắng', loot:['da','nanh'], habitat:['frost_tundra'] }),
    S({ id:'stoneback_turtle', family:'beast', nameEn:'Stoneback Turtle', nameVi:'Rùa Lưng Đá', tier:2, size:'L', behavior:'pacer', aspect:'stone', hp:1.4, speed:.7,
        attack:'húc mai đá vào mạn thuyền cho tới khi nứt', marker:'mai là tảng đá phủ hà và san hô đỏ', loot:['vỏ giáp','da'], habitat:['red_desert','ash_peak'] }),
    S({ id:'giant_squid',  family:'magical_beast', nameEn:'Colossal Squid', nameVi:'Mực Khổng Lồ', tier:3, size:'XL', behavior:'rooted', aspect:'tide', hp:1.1,
        attack:'phun mực đen rồi kéo người khỏi boong bằng tua dài', marker:'hai tua dài gấp ba thân + mắt vàng to như khiên', loot:['ma hạch','mực đen'], habitat:['mist_coast','serpent_bay','frost_tundra'] }),
    S({ id:'frost_sea_dragon', family:'dragon', nameEn:'Frost Sea Dragon', nameVi:'Hải Long Băng', tier:4, size:'XL', behavior:'spitter', aspect:'frost', hp:1.2,
        attack:'phun hơi băng đóng cứng mặt biển quanh thuyền', marker:'mào băng trong suốt + vảy trắng ánh lam', loot:['vảy','máu rồng'], habitat:['frost_tundra'] }),
    S({ id:'ghost_ship',   family:'spirit', nameEn:'Ghost Ship', nameVi:'Tàu Ma', tier:4, size:'XL', behavior:'flyer', aspect:'death',
        attack:'áp mạn trong sương rồi thả thủy thủ hồn sang boong', marker:'buồm rách phát lân quang + đèn lồng xanh ở mũi', loot:['hồn tinh','đồng xu muối'], habitat:['mist_coast','ash_peak','red_desert','abyss_rift'] }),
    S({ id:'bone_whale',   family:'undead', nameEn:'Bone Whale', nameVi:'Cá Voi Xương', tier:5, size:'XL', behavior:'charger', aspect:'death', hp:1.5, dmg:1.2,
        attack:'lao từ dưới lên đập gãy đôi thân tàu', marker:'bộ xương cá voi còn dính thịt + ánh xanh trong hốc mắt', loot:['xương cũ','tro mộ'], habitat:['serpent_bay','abyss_rift','storm_spire'] }),
    // Băng Nguyên
    S({ id:'frost_wolf',   family:'beast', nameEn:'Frost Wolf', nameVi:'Sói Băng', tier:1, size:'M', behavior:'chaser', aspect:'frost', speed:1.2, group:[2,4],
        attack:'cắn kéo chân gây Lạnh', marker:'lông trắng đóng băng ở mõm + mắt xanh băng', loot:['da','nanh'], habitat:['frost_tundra'] }),
    S({ id:'woolly_mammoth', family:'beast', nameEn:'Woolly Mammoth', nameVi:'Ma Mút Lông', tier:2, size:'XL', behavior:'charger', aspect:null, hp:1.1, speed:.8,
        attack:'húc ngà rồi giẫm', marker:'ngà xoắn ốc dài + lông nâu xù kéo đất', loot:['ngà','da'], habitat:['frost_tundra'] }),
    S({ id:'ice_wraith',   family:'spirit', nameEn:'Ice Wraith', nameVi:'Băng Hồn', tier:2, size:'M', behavior:'flyer', aspect:'frost',
        attack:'lướt xuyên người để lại giá buốt', marker:'áo choàng băng rách, không có chân', loot:['hồn tinh'], habitat:['frost_tundra'] }),
    S({ id:'yeti',         family:'beast', nameEn:'Yeti', nameVi:'Người Tuyết', tier:3, size:'L', behavior:'chaser', aspect:'frost', hp:1.2, dmg:1.1,
        attack:'ném tảng băng rồi đấm hai tay', marker:'lông trắng dài che mắt + nắm đấm to bằng đầu', loot:['da','vuốt'], habitat:['frost_tundra'] }),
    // Thảo Nguyên Gió
    S({ id:'steppe_hyena', family:'beast', nameEn:'Steppe Hyena', nameVi:'Linh Cẩu Thảo Nguyên', tier:0, size:'M', behavior:'chaser', aspect:null, hp:.75, group:[2,4],
        attack:'cắn đuôi rồi rút, chờ con mồi kiệt sức', marker:'lưng đốm + tiếng cười khanh khách', loot:['da','nanh'], habitat:['wind_steppe','red_desert'] }),
    S({ id:'dust_devil',   family:'elemental', nameEn:'Dust Devil', nameVi:'Quỷ Lốc Bụi', tier:1, size:'M', behavior:'flyer', aspect:'wind',
        attack:'cuốn người vào lốc rồi quăng', marker:'cột lốc nâu có hai đốm mắt vàng', loot:['tinh thể nguyên tố'], habitat:['wind_steppe','red_desert'] }),
    S({ id:'great_eagle',  family:'avian', nameEn:'Steppe Eagle', nameVi:'Đại Bàng Thảo Nguyên', tier:2, size:'M', behavior:'flyer', aspect:null, dmg:1.15,
        attack:'bổ nhào quắp rồi thả từ trên cao', marker:'sải cánh nâu viền trắng + móng vàng', loot:['lông vũ','mỏ'], habitat:['wind_steppe'] }),
    S({ id:'armored_rhino', family:'beast', nameEn:'Ironclad Rhino', nameVi:'Tê Giác Thiết Giáp', tier:3, size:'L', behavior:'charger', aspect:'stone', hp:1.3, dmg:1.2,
        attack:'húc lao xuyên hàng khiên', marker:'sừng kép bọc sắt + giáp xương lưng', loot:['sừng','da'], habitat:['wind_steppe'] }),
    // Hồng Sa
    S({ id:'sand_vulture', family:'avian', nameEn:'Sand Vulture', nameVi:'Kền Kền Cát', tier:0, size:'S', behavior:'flyer', aspect:null, group:[2,3],
        attack:'mổ người đang bị thương', marker:'cổ trụi đỏ + cánh rách mép', loot:['lông vũ'], habitat:['red_desert'] }),
    S({ id:'sand_mummy',   family:'undead', nameEn:'Sand Mummy', nameVi:'Xác Ướp Cát', tier:2, size:'M', behavior:'pacer', aspect:'death', group:[1,3],
        attack:'quấn băng vải siết cổ gây Nguyền', marker:'băng vải vàng bong + bọ hung trong hốc mắt', loot:['tro mộ','bùa vàng'], habitat:['red_desert'] }),
    S({ id:'sandworm',     family:'insect', nameEn:'Great Sandworm', nameVi:'Giun Cát Khổng Lồ', tier:3, size:'XL', behavior:'ambusher', aspect:null, hp:1.3,
        attack:'nuốt từ dưới cát lên, chỉ báo bằng gợn cát', marker:'miệng tròn bốn hàm răng xoay', loot:['vỏ giáp','răng'], habitat:['red_desert'] }),
    S({ id:'sand_djinn',   family:'elemental', nameEn:'Sand Djinn', nameVi:'Thần Đèn Cát', tier:4, size:'L', behavior:'spitter', aspect:'fire',
        attack:'phun lửa cát theo hình quạt', marker:'nửa dưới là lốc cát + vòng vàng ở cổ tay', loot:['tinh thể nguyên tố','vàng cổ'], habitat:['red_desert'] }),
    // Phế Xưởng
    S({ id:'brass_spider', family:'construct', nameEn:'Brass Spider', nameVi:'Nhện Đồng Thau', tier:1, size:'S', behavior:'chaser', aspect:'machine', group:[2,3],
        attack:'bám lên người rồi phóng điện nhỏ', marker:'tám chân ống đồng + mắt kính đỏ', loot:['bánh răng'], habitat:['forge_ruins'] }),
    S({ id:'ancient_sentinel', family:'construct', nameEn:'Ancient Sentinel', nameVi:'Hộ Vệ Cổ Đại', tier:4, size:'L', behavior:'pacer', aspect:'storm', hp:1.3,
        attack:'nện khiên tháp rồi phóng sét từ ngực', marker:'lõi sét xanh ở ngực + khiên tháp hợp vào tay', loot:['lõi đá','bánh răng'], habitat:['forge_ruins'] }),
    // Đồng nội phía nam, đầm
    S({ id:'giant_toad',   family:'beast', nameEn:'Bog Toad', nameVi:'Cóc Độc Khổng Lồ', tier:2, size:'M', behavior:'leaper', aspect:'venom', hp:1.2,
        attack:'phóng lưỡi kéo lại rồi nuốt', marker:'lưng sần nốt cam + bọng cổ phồng', loot:['túi độc','da'], habitat:['venom_marsh'] }),
    // Núi Tro
    S({ id:'magma_titan',  family:'elemental', nameEn:'Magma Titan', nameVi:'Người Khổng Lồ Dung Nham', tier:5, size:'XL', behavior:'rooted', aspect:'fire', hp:1.3,
        attack:'đập tay xuống tạo sóng dung nham', marker:'vết nứt cam chạy khắp thân đá đen', loot:['tinh thể nguyên tố','lõi đá'], habitat:['ash_peak'] }),
    // Vực Hắc Uyên
    S({ id:'horned_fiend', family:'fiend', nameEn:'Horned Fiend', nameVi:'Ma Tướng Hỏa Giác', tier:5, size:'L', behavior:'leaper', aspect:'fire', dmg:1.25,
        attack:'vồ rồi quất roi lửa hút máu', marker:'sừng cong cháy + roi lửa quấn tay', loot:['sừng quỷ','huyết ấn'], habitat:['abyss_rift'] }),
    S({ id:'abyss_lord',   family:'fiend', nameEn:'Lord of the Rift', nameVi:'Chúa Quỷ Hắc Uyên', tier:5, size:'XL', behavior:'charger', aspect:'abyss', hp:2, dmg:1.5, spawn:false,
        attack:'mở khe nứt dưới chân cả đội', marker:'vương miện là khe nứt + bốn cánh rách', loot:['sừng quỷ'], habitat:['abyss_rift'], note:'Chúa vùng; chỉ xuất hiện qua sự kiện.' })
  ];
  (L.species = L.species || []).push(...extra);
})(window.JobLibrary);
