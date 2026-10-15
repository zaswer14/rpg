/* Vạn Kiếp — KHO TÊN RIÊNG. Mọi thứ cần đặt tên (người, quốc gia, khu dân cư, sông núi, biển đảo, hang ổ,
 * di tích, chiến tranh, tàu, đoàn lính đánh thuê…) đều bốc ngẫu nhiên từ file này. Muốn thêm tên: thêm vào mảng.
 *
 * Cách ghép (đặt ở đây để người sửa tên biết tên sẽ hiện ra thế nào):
 *   người            given[sex] + ' ' + family            ("Aldric Hollin", "Lirwen Ngân Diệp")
 *   Cơ Nhân          code + '-' + số 1–99 + ' ' + family  ("KT-17 Bánh Răng")
 *   quốc gia         nation.prefix[gov] (hoặc prefixRace[race][gov]) + ' ' + nation.root[race]   ("Vương Quốc Aurel")
 *   người cai trị    ruler[gov] + ' ' + tên người + ' ' + epithet (biệt hiệu, ghép sau khi có chuyện để kể)
 *   triều đại        'Nhà ' + family
 *   khu dân cư       settlement.kind[race][bậc hoặc vai trò] + " " + settlement.root[race]; hết gốc thì part.a + " " + part.b
 *                    ("Làng Cối Xay", "Pháo Đài Lò Đồng", "Mỏ Đá Lửa"); bậc, vai trò: research/05
 *   địa danh         geo[x].prefix + ' ' + geo[x].root    ("Sông Lục", "Đèo Một Người", "Vịnh Hải Xà")
 *   hang ổ           lair.prefix[họ quái] + ' ' + (địa danh gần nhất hoặc settlement.root)   ("Tổ Nhện Rễ Trắng")
 *   di tích          ruin.prefix + ' ' + ruin.root        ("Lăng Vua Chôn Vùi")
 *   chiến tranh      'Chiến Tranh ' + war                 ("Chiến Tranh Ba Vua")
 *   trận đánh        'Trận ' + địa danh nơi đánh          (không cần danh sách)
 * Khi bốc: bỏ tên đã dùng trong cùng thế giới; hết tên thì cho phép trùng gốc và thêm "Tân" / "Hạ" / "Thượng".
 * Chưa nối vào game: file chưa được index.html nạp.
 */
window.LifeSim = window.LifeSim || {};
window.LifeSim.NAMES = {
  // ── NGƯỜI ──
  person: {
    human: {
      m: ['Aldric','Bertran','Corwin','Darian','Edmund','Garrick','Halden','Leoric','Marcus','Osric','Rowan','Tobias','Wilmar','Brandt','Cedric','Alaric','Gideon','Roland','Severin','Tristan','Anselm','Benedikt'],
      f: ['Adela','Brienne','Catrin','Delia','Elsbeth','Gwen','Helena','Isolde','Katrin','Lianne','Maren','Odile','Rosalind','Sabine','Tilda','Wenna','Yvaine','Mirabel','Ottilie','Beatrix'],
      family: ['Hollin','Ashford','Brenn','Calder','Dunmore','Fenwick','Graves','Marlow','Rook','Thorne','Vale','Wick','Harrow','Pembry','Corvane','Stroud','Langley','Merrow']
    },
    elf: {
      m: ['Aeronil','Velathir','Orinthal','Selvaren','Calithor','Ithelion','Lumiar','Taerin','Elvanor','Caelnor','Ilvaren','Sylvenor','Thaliorn','Ylovan','Nimeor','Erivane','Faelith','Lirathel','Saerion','Quelinor'],
      f: ['Aelira','Celenwe','Elarie','Ilyssa','Lirwen','Sylthiel','Thalanore','Ylvaria','Nimlie','Eriselle','Faewen','Mirathiel','Ivelle','Seraphel','Lothiel','Caerwen','Aelora','Vaelith','Tiriel','Naeris'],
      family: ['Ngân Diệp','Sương Lá','Nguyệt Chi','Tinh Mộc','Lam Thảo','Bạch Hoa','Thanh Tùng','Lá Bạc','Vân Mộc','Cổ Thụ','Sao Rơi','Liễu Rủ','Hương Trầm','Tuyết Mai','Phong Lan']
    },
    dwarf: {
      m: ['Durgrim','Thorvald','Borek','Kazrim','Dwalric','Brunmar','Hedrik','Morgrin','Gundar','Torvik','Baldrek','Durnak','Grimbor','Haldur','Rurik','Skarn','Ulfgar','Brokk','Dunstan','Kelgrim'],
      f: ['Disa','Brunhild','Gudrid','Hedda','Ragna','Sigrun','Thyra','Ingrid','Helga','Astrid','Bera','Dagny','Eydis','Freydis','Gerda','Hilde','Jorunn','Kolla','Solvi','Yrsa'],
      family: ['Búa Đá','Râu Đồng','Lò Sâu','Khiên Sắt','Mạch Bạc','Đe Đen','Cuốc Vàng','Rìu Cổ','Than Hồng','Đá Xám','Mũ Sắt','Hầm Trăm Tầng','Búa Sấm','Xích Đồng','Bia Đen']
    },
    orc: {
      m: ['Gorash','Ugnak','Thrarok','Mokzul','Zuggul','Gashdak','Krulnak','Urzag','Bograk','Ragash','Durz','Grommok','Snagrul','Varg','Zagrak','Brug','Hruk','Morzag','Uthrak','Gharn'],
      f: ['Gorga','Ugsha','Thraka','Mokra','Zugha','Gashna','Krulsha','Urza','Bogra','Razha','Shaka','Vorna','Dushka','Grisha','Hogra','Yazga','Murza','Ozka','Tazha','Brakka'],
      family: ['Nanh Gãy','Huyết Thủ','Sọ Đỏ','Rìu Đen','Lửa Sói','Xương Treo','Mắt Một','Hàm Sắt','Cờ Máu','Răng Đá','Gót Sắt','Bụi Đỏ','Sẹo Dài','Tro Đen','Thét Gió']
    },
    beastfolk: {
      m: ['Rakka','Fenru','Shiash','Tavon','Korek','Mirar','Sabek','Ashkar','Lunon','Renru','Kavik','Torun','Haskar','Jaro','Nakar','Oruk','Pelu','Sefu','Tamu','Vesk'],
      f: ['Rakira','Fenya','Shiani','Tavri','Korsha','Mirli','Sabira','Ashya','Luri','Renya','Kaia','Teshi','Hania','Jirri','Naeli','Orya','Pirri','Seshi','Tamira','Vesha'],
      family: ['Móng Bạc','Tai Gió','Đuôi Lửa','Bờm Xám','Vằn Đen','Mũi Ướt','Lông Tuyết','Răng Trăng','Chân Nhanh','Đốm Vàng','Sừng Cong','Tiếng Hú','Vuốt Đá','Mắt Hổ','Bầy Đêm']
    },
    fae: {
      m: ['Pipkin','Lumle','Twiwyn','Mosbo','Faerin','Wisket','Brikin','Tinle','Peawyn','Thistlebo','Bramblin','Dewkin','Glimmet','Hollen','Mothlin','Nettlewick','Quill','Sorrel','Fernby','Acornel'],
      f: ['Pipbelle','Lumwyn','Twili','Mosra','Faesy','Wistle','Bribelle','Tinwyn','Peali','Thistra','Briony','Dewsy','Glimma','Honeysel','Juna','Mothwyn','Nettie','Posy','Quinna','Sorrelle'],
      family: ['Sương Sớm','Cánh Mỏng','Gai Hồng','Nấm Tròn','Đốm Sáng','Giọt Mật','Vòng Nấm','Lá Ngược','Tiếng Chuông','Bụi Phấn','Trăng Khuyết','Mạng Nhện','Cỏ Ba Lá','Hạt Sương','Lời Hứa']
    },
    merfolk: {
      m: ['Marios','Corus','Naian','Thaleon','Ondar','Pelios','Aquan','Nereon','Lorian','Calyon','Doriel','Kaius','Maron','Thalor','Tyros','Zephon','Ilyas','Rhodan','Galen','Siriel'],
      f: ['Marina','Corene','Naiys','Thalea','Ondira','Pelola','Sirene','Aquina','Nerea','Lorys','Calyssa','Delphine','Ione','Kaimana','Maressa','Oriel','Perla','Thessa','Undine','Zarya'],
      family: ['Sóng Bạc','Vảy Lam','San Hô','Triều Đêm','Ngọc Trai','Rạn Đỏ','Vỏ Ốc','Bọt Trắng','Hải Lưu','Mắt Vực','Tảo Xanh','Vây Gió','Nước Lặng','Sao Biển','Muối Đen']
    },
    dragonkin: {
      m: ['Vyrthax','Draion','Kaelgor','Syxrak','Rhaan','Ixadros','Zorthax','Tharion','Velgor','Ashrak','Vorrak','Dravion','Kethrax','Sorvyn','Ignar','Pyrrhos','Rathgar','Tyrax','Ulgrath','Zaedros'],
      f: ['Vyryss','Drara','Kaelith','Syxa','Rhava','Ixys','Zorith','Tharys','Velenne','Ashira','Vyssa','Draxis','Kethra','Sorya','Ignis','Pyrra','Ravyn','Tyrssa','Ulva','Zaeryth'],
      family: ['Hỏa Lân','Vảy Đồng','Sừng Đen','Long Huyết','Cánh Tro','Lửa Cổ','Vảy Bạc','Nanh Sấm','Trứng Đá','Khói Tím','Móng Vàng','Đuôi Gai','Mắt Hổ Phách','Lò Tim','Tro Thiêng']
    },
    construct: {
      code: ['AX','BR','KT','VO','ZR','MK','TS','QN','LR','DX','PH','GN'],
      family: ['Bu-lông','Bánh Răng','Lò Xo','Đinh Tán','Ống Đồng','Van Hơi','Trục Cam','Kim Giờ','Bản Lề','Ốc Vít','Lõi Xanh','Xích Tải','Búa Hơi','Đèn Cảnh','Nồi Hơi']
    },
    // Bộ Xương giữ tên kiếp trước; danh sách này cho Bộ Xương sinh ra trong nước Bộ Xương hoặc NPC không rõ gốc.
    skeleton: {
      n: ['Morvath','Seluun','Kharos','Vethis','Orrun','Duskar','Malgor','Ysmir','Corvex','Thanok','Aldrun','Nekros','Vaelun','Grimmar','Sorrow','Hollow','Mirek','Ossian','Varnis','Quietus'],
      family: ['Không Tên','Sọ Nứt','Xương Bạc','Mộ Cũ','Tro Lạnh','Đèn Xanh','Kẻ Thức','Ngón Thiếu','Áo Liệm','Bia Mòn','Hố Sâu','Tro Mộ','Gió Hầm','Mắt Lửa Xanh','Sương Mộ']
    }
  },

  // Biệt hiệu cho người cai trị, anh hùng, người trong sử biên niên.
  epithet: ['Người Xây Cầu','Kẻ Mất Tay','Đại Đế','Hiền','Bạo Chúa','Câm','Trẻ Mãi','Ba Lần Chết','Kẻ Phản Bội','Người Giữ Cổng','Mắt Ưng','Lưỡi Bạc','Tay Sắt','Kẻ Đói','Người Mùa Đông','Kẻ Đốt Sách','Người Trồng Rừng','Ngốc','Không Ngủ','Đầu Bạc','Vua Muối','Kẻ Cười','Đến Muộn','Kẻ Cuối Cùng','Một Mắt','Người Giữ Lời','Kẻ Trốn Chạy','Chân Đất','Người Mở Đường','Kẻ Bán Nước'],

  // ── QUỐC GIA ──
  nation: {
    prefix: {
      monarchy: ['Vương Quốc','Công Quốc'], empire: ['Đế Chế','Đế Quốc'], theocracy: ['Thánh Quốc','Giáo Quốc'],
      council: ['Liên Bang','Hội Quốc'], merchant: ['Thị Quốc','Cộng Hòa'], tribal: ['Bộ Lạc','Thị Tộc'], horde: ['Hãn Quốc'],
      magocracy: ['Tháp Quốc','Pháp Quốc'], military: ['Quân Quốc','Đô Hộ Phủ'], court: ['Đình'], collective: ['Xưởng Quốc','Mạng'],
      necrocracy: ['Vương Triều','Tử Quốc'], confederacy: ['Liên Minh','Hội'], order: ['Hội Dòng','Thủ Hộ Đoàn']
    },
    // Ghi đè tiền tố theo chủng tộc (nếu có thì dùng thay cho prefix[gov]).
    prefixRace: {
      elf: { council: ['Rừng Quốc'] },
      merfolk: { merchant: ['Hải Quốc','Thị Quốc'], monarchy: ['Vương Triều'] },
      dragonkin: { monarchy: ['Long Quốc','Vương Quốc'] }
    },
    root: {
      human: ['Aurel','Valdris','Carhaven','Esmarch','Lothmere','Brandor','Westmark','Solmere','Arvenna','Dunholt','Kestria','Morrowen'],
      elf: ['Ngân Nguyệt','Lá Bạc','Cây Mẹ','Thanh Vân','Sương Lam','Ilvaren','Caelthas','Tinh Lâm','Vĩnh Diệp','Nguyệt Hồ','Ánh Rễ','Cổ Mộc'],
      dwarf: ['Lò Đồng','Núi Sâu','Mạch Bạc','Đe Rune','Đá Mẹ','Cổng Sắt','Thạch Bảo','Hầm Vàng','Durnholm','Grimhald','Tháp Đe','Kim Thạch'],
      orc: ['Gió Hú','Huyết Nộ','Nanh Gãy','Cờ Xương','Sọ Đỏ','Rìu Đen','Bụi Đỏ','Ugrash','Gorzhak','Thảo Máu','Lửa Thảo Nguyên','Mrog'],
      beastfolk: ['Bầy Trăng','Vằn Đen','Đồng Cỏ','Sư Vương','Tiếng Hú','Móng Bạc','Rừng Vằn','Totem Đỏ','Gió Lông','Vó Đất','Mắt Hổ','Nanh Trăng'],
      fae: ['Hoa Gai','Trăng Khuyết','Vòng Nấm','Giấc Mơ','Chợ Nấm','Đèn Đom Đóm','Mộng Ảo','Cánh Chuồn','Sương Bạc','Ngàn Lời Hứa','Mùa Hạ','Mùa Đông'],
      merfolk: ['San Hô','Triều Dâng','Vực Thẳm','Rạn Ngầm','Ngọc Trai','Sóng Bạc','Hải Lưu','Thalor','Hải Đăng','Mắt Biển','Vỏ Ốc Lớn','Nhà Muối'],
      dragonkin: ['Long Huyết','Sừng Đen','Ngọn Lửa','Tro Thiêng','Vảy Đồng','Hỏa Sơn','Lôi Long','Vyrnath','Draxholm','Ngai Rồng','Cánh Tro','Tim Núi'],
      construct: ['Số 7','Lõi Chung','Bánh Răng Lớn','Đồng Hồ','Mạng Sắt','Giao Thức Một','Lò Đúc Mẹ','Xích Đứt','Trục Chính','Van Tổng','Nam Châm','Số Không'],
      skeleton: ['Xương Trắng','Mộ Đá','Đêm Dài','Hầm Mộ','Tro Lạnh','Bia Mòn','Không Tên','Morvath','Thức Dậy','Đèn Xanh','Áo Liệm','Hố Vạn Người']
    },
    // Tước của người cai trị theo chính thể.
    ruler: {
      monarchy: ['Vua','Nữ Vương'], empire: ['Hoàng Đế','Nữ Hoàng'], theocracy: ['Giáo Chủ'], council: ['Trưởng Lão'], merchant: ['Thủ Hiến'],
      tribal: ['Tù Trưởng'], horde: ['Khả Hãn'], magocracy: ['Đại Pháp Sư'], military: ['Thống Soái'], court: ['Vua Mùa','Nữ Hoàng Mùa'],
      collective: ['Giao Thức'], necrocracy: ['Vua Xương'], confederacy: ['Thủ Lĩnh'], order: ['Đại Sư']
    }
  },

  // ── KHU DÂN CƯ ──
  settlement: {
    // Chữ đứng trước gốc tên, theo bậc (capital, city, town, village, hamlet) hoặc vai trò (fort, port, mine, lumber, fishing, temple, market).
    // Vai trò rõ nét thì dùng chữ của vai trò thay cho chữ của bậc (research/05 mục 10). Thiếu vai trò thì dùng chữ của bậc.
    kind: {
      human:     { capital:['Kinh Đô'], city:['Thành','Thành Phố'], town:['Thị Trấn','Bến','Chợ'], village:['Làng'], hamlet:['Xóm','Ấp','Thôn'],
                   fort:['Đồn','Pháo Đài'], port:['Cảng','Bến Cảng'], mine:['Mỏ'], lumber:['Trại Gỗ'], fishing:['Xóm Chài','Bến Cá'], temple:['Tu Viện','Đền'], market:['Chợ'] },
      elf:       { capital:['Ngai','Thành'], city:['Thành'], town:['Vòng','Tán'], village:['Lối','Trảng'], hamlet:['Chòi','Tổ Lá'],
                   fort:['Chòi Canh'], port:['Bến Lá'], lumber:['Trảng Gỗ Rụng'], fishing:['Bến'], temple:['Cội','Đền Rễ'], market:['Chợ Trăng'] },
      dwarf:     { capital:['Pháo Đài','Sảnh Lớn'], city:['Sảnh','Pháo Đài'], town:['Lò','Hầm Lớn'], village:['Hầm','Xóm Mỏ'], hamlet:['Ngách','Hang'],
                   fort:['Cổng','Đồn'], port:['Bến Đá'], mine:['Mỏ','Giếng Mỏ'], lumber:['Trại Than'], fishing:['Bến'], temple:['Sảnh Tổ'], market:['Chợ Đá'] },
      orc:       { capital:['Trại Lớn','Thành Cọc'], city:['Trại Lớn'], town:['Trại'], village:['Lều','Bãi'], hamlet:['Lều','Ổ'],
                   fort:['Đồn','Cọc'], port:['Bến Bè'], mine:['Hầm Sắt'], lumber:['Bãi Gỗ'], fishing:['Bãi Cá'], temple:['Gò Tổ'], market:['Chợ Cướp'] },
      beastfolk: { capital:['Hang Lớn'], city:['Hang Lớn'], town:['Trại'], village:['Ổ','Xóm'], hamlet:['Ổ','Hang'],
                   fort:['Chòi'], port:['Bến'], mine:['Hang Đá'], lumber:['Bãi Cây'], fishing:['Bãi Cá'], temple:['Cột Totem'], market:['Chợ Đổi'] },
      fae:       { capital:['Đình'], city:['Đình Nhỏ'], town:['Vòng'], village:['Ổ','Bụi'], hamlet:['Tổ','Nụ'],
                   fort:['Gác'], port:['Bến Lá Sen'], lumber:['Bụi Cành'], fishing:['Bến Sương'], temple:['Vòng Thiêng'], market:['Chợ Nấm'] },
      merfolk:   { capital:['Cảng','Thành'], city:['Cảng Lớn'], town:['Bến','Cảng'], village:['Xóm','Bãi'], hamlet:['Bãi','Vũng'],
                   fort:['Tháp Canh'], port:['Cảng','Bến'], mine:['Rạn San Hô'], lumber:['Bãi Gỗ Trôi'], fishing:['Xóm Chài','Bãi Lưới'], temple:['Đền Triều'], market:['Chợ Nổi'] },
      dragonkin: { capital:['Ngai'], city:['Thành'], town:['Thành','Đài'], village:['Ổ','Bản'], hamlet:['Ổ'],
                   fort:['Đài'], port:['Bến Tro'], mine:['Mỏ Lửa'], lumber:['Bãi Than'], fishing:['Bến'], temple:['Đài Lửa'], market:['Chợ Vảy'] },
      construct: { capital:['Lõi'], city:['Xưởng Lớn'], town:['Xưởng','Trạm'], village:['Kho','Trạm'], hamlet:['Trạm Phụ'],
                   fort:['Tháp'], port:['Bến Ray'], mine:['Mỏ Quặng'], lumber:['Trạm Than'], fishing:['Bến'], temple:['Lò Thiêng'], market:['Kho Trao Đổi'] },
      skeleton:  { capital:['Lăng'], city:['Thành Mộ'], town:['Thành Mộ','Hầm'], village:['Nghĩa Trang','Hầm'], hamlet:['Mộ','Hố'],
                   fort:['Tháp'], port:['Bến Đò Đêm'], mine:['Hầm Xương'], lumber:['Rừng Treo'], fishing:['Bến Đò'], temple:['Điện'], market:['Chợ Âm'] }
    },
    // Hết gốc tên thì ghép a + b (mỗi chủng tộc 12 × 12 = 144 tổ hợp).
    part: {
      human:     { a:['Cầu','Đồi','Giếng','Bờ','Gò','Cối','Lúa','Đá','Sồi','Liễu','Chuông','Muối'], b:['Đỏ','Xanh','Cũ','Mới','Ngọt','Gió','Bắc','Nam','Bạc','Vàng','Ba Nhánh','Hai Cây'] },
      elf:       { a:['Lá','Rễ','Suối','Sương','Trăng','Sao','Cành','Hoa','Tán','Mầm','Gió','Hồ'], b:['Bạc','Trắng','Ngàn','Ngọc','Mai','Đêm','Xanh','Cổ','Hát','Lam','Rơi','Vĩnh'] },
      dwarf:     { a:['Lò','Đe','Búa','Mạch','Cổng','Giếng','Xích','Đá','Than','Rìu','Bậc','Vách'], b:['Đồng','Sắt','Bạc','Vàng','Đen','Sâu','Lửa','Sấm','Rune','Xám','Cổ','Gãy'] },
      orc:       { a:['Cờ','Răng','Gò','Trống','Cọc','Suối','Đồi','Lều','Hố','Cột','Vó','Giếng'], b:['Xương','Máu','Đen','Đỏ','Sọ','Lửa','Rìu','Tro','Đắng','Thét','Gió','Nanh'] },
      beastfolk: { a:['Gốc','Suối','Đồi','Cỏ','Vết','Hồ','Ổ','Mỏm','Lối','Gò','Bờ','Cây'], b:['Đa','Hú','Cao','Cào','Trăng','Lá','Săn','Mối','Sậy','Mật','Bùn','Gió'] },
      fae:       { a:['Vòng','Giọt','Chuông','Cây','Gương','Bụi','Mạng','Cánh','Tổ','Hang','Đá','Cầu'], b:['Nấm','Mật','Hoa','Rỗng','Nước','Gai','Sương','Mỏng','Chim','Thỏ','Thì Thầm','Vồng'] },
      merfolk:   { a:['San','Vách','Rạn','Vỏ','Bến','Hang','Mắt','Ngọc','Đá','Sao','Cột','Bãi'], b:['Hô','Đá','Đỏ','Ốc','Muối','Bọt','Bão','Trai','Ngầm','Biển','Buồm','Rùa'] },
      dragonkin: { a:['Ổ','Lò','Sừng','Khói','Vảy','Đài','Hang','Cột','Đá','Mắt','Suối','Tháp'], b:['Trứng','Tim','Đá','Tím','Rụng','Lửa','Ấp','Sét','Nóng','Núi','Lưu Huỳnh','Cánh'] },
      construct: { a:['Số','Dây','Bánh','Ống','Ray','Lõi','Xích','Cổng','Trục','Bàn','Van','Kho'], b:['Ba','Bảy','Chín','Chuyền','Đà','Khói','Sắt','Phụ','Tải','Van','Quay','Lắp'] },
      skeleton:  { a:['Mộ','Bia','Hầm','Đèn','Áo','Tro','Hố','Gò','Cổng','Tháp','Giếng','Lăng'], b:['Đá','Mòn','Xương','Xanh','Liệm','Lạnh','Sâu','Quạ','Đêm','Sọ','Câm','Gió'] }
    },
    root: {
      human: ['Cối Xay','Lau Mộc','Gỗ Bắc','Canh Mộ','Ngã Ba','Cầu Đá','Giếng Ngọt','Đồi Táo','Lúa Vàng','Chuông Đồng','Ba Cây Sồi','Cột Cờ','Đá Mài','Muối Trắng','Bờ Lau','Gió Nam','Tháp Canh','Hạt Dẻ','Cánh Buồm','Aurel','Benno','Valden','Corhal','Marrow'],
      elf: ['Lá Bạc','Rễ Trắng','Vòng Trăng','Suối Ngọc','Sương Mai','Cành Bạc','Hồ Sao','Tán Cổ','Đèn Lá','Tiếng Hát','Mầm Xanh','Gió Ngàn','Tinh Lộ','Bóng Liễu','Ngân Khê','Cầu Rễ','Hoa Đêm','Sao Hôm','Lục Diệp','Vân Thụ'],
      dwarf: ['Lò Đồng','Đe Đen','Mạch Bạc','Than Hồng','Cổng Đá','Giếng Sâu','Búa Sấm','Rìu Gãy','Mỏ Thiếc','Đá Lửa','Hầm Muối','Bậc Đá','Xích Sắt','Đèn Mỏ','Tảng Lớn','Vách Rune','Lò Tuyết','Mũi Khoan','Thùng Bia','Đá Vọng'],
      orc: ['Ưng','Đá Hội','Cờ Xương','Lửa Sói','Răng Đá','Gò Máu','Trống Da','Cọc Sọ','Suối Đen','Bãi Chiến','Hố Nướng','Đồi Rìu','Lều Đỏ','Vó Ngựa','Tiếng Thét','Cột Tro','Giếng Đắng','Vũng Máu','Nanh Lớn','Gió Cát'],
      beastfolk: ['Totem','Bầy Đêm','Gốc Đa','Suối Liếm','Đồi Hú','Cỏ Cao','Vó Đất','Lông Tuyết','Vết Cào','Đá Mài Vuốt','Bãi Bùn','Cây Cào','Hồ Trăng','Ổ Lá','Mỏm Hú','Lối Săn','Gò Mối','Bờ Sậy','Cây Mật','Hang Gió'],
      fae: ['Vòng Nấm','Đom Đóm','Chuông Hoa','Giọt Mật','Ngủ Quên','Lối Ngược','Cây Rỗng','Gương Nước','Hoa Đêm','Bụi Gai','Mạng Sương','Cánh Mỏng','Tiếng Cười','Tổ Chim','Hang Thỏ','Đá Thì Thầm','Cầu Vồng Gãy','Hồ Bảy Năm','Nấm Đỏ','Sương Tím'],
      merfolk: ['San Hô','Hải Đăng','Vách Đá','Rạn Đỏ','Vỏ Ốc','Lưới Rách','Bến Muối','Hang Bọt','Mắt Bão','Ngọc Trai','Nước Lặng','Đá Ngầm','Sao Biển','Cột Buồm','Xác Tàu','Bãi Rùa','Triều Lên','Đèn Chài','Cửa Sông','Vũng Sâu'],
      dragonkin: ['Tro','Ổ Trứng','Lò Tim','Sừng Đá','Khói Tím','Vảy Rụng','Đài Lửa','Hang Ấp','Cột Sét','Đá Nóng','Mắt Núi','Suối Lưu Huỳnh','Tháp Cánh','Ngai Tro','Vực Đỏ','Đỉnh Lửa','Bậc Than','Lửa Không Tắt','Long Môn','Vết Cháy'],
      construct: ['Số 3','Số 7','Số 9','Dây Chuyền','Phụ Tùng','Nạp Lõi','Đồng Hồ','Bánh Đà','Câm','Ống Khói Đôi','Ray Sắt','Lõi Phụ','Xích Tải','Hơi Nước','Cổng Van','Đúc Mẹ','Bàn Lắp','Trục Quay','Than Đá','Lò Hơi Cổ'],
      skeleton: ['Mộ Đá','Bia Mòn','Xương','Đèn Xanh','Áo Liệm','Tro Lạnh','Hố Sâu','Gò Quạ','Cổng Đêm','Tháp Sọ','Giếng Câm','Lăng Gió','Đồi Thập Tự','Chuông Ngược','Nhà Xác','Sân Xương','Lối Liệm','Ngõ Không Về','Vườn Đá','Bậc Hầm']
    }
  },

  // ── ĐỊA DANH ──
  geo: {
    river:    { prefix: ['Sông'], root: ['Lục','Bạc','Hồng','Ngọc','Đá','Mù','Trăng','Liễu','Sậy','Muối','Gió','Hai Nhánh','Câm','Bùn','Khói','Kim','Ba Thác','Rắn','Lạnh','Ngủ'] },
    mountain: { prefix: ['Dãy','Núi','Đỉnh'], root: ['Lôi Vân','Răng Sói','Mây Trắng','Vai Gãy','Bảy Đỉnh','Sừng Đôi','Gió Hú','Đá Đen','Tro','Ngai Đá','Lưng Rồng','Mũ Tuyết','Thạch Lâm','Câm Lặng','Sao Rơi'] },
    pass:     { prefix: ['Đèo'], root: ['Gió','Xương','Quạ','Mây','Hẹp','Một Người','Đá Lăn','Tuyết','Lửa','Vua'] },
    forest:   { prefix: ['Rừng'], root: ['Rêu Thầm','Ngân Diệp','Thông Đen','Liễu','Sồi Già','Gai','Đom Đóm','Im Lặng','Bóng','Cổ Thụ','Lá Đỏ','Mưa'] },
    jungle:   { prefix: ['Rừng Rậm'], root: ['Lục Chướng','Dây Leo','Muỗi Đỏ','Hoa Ăn Thịt','Mưa Mãi','Rắn Lục','Khỉ Hét','Nấm Phát Sáng','Trăm Năm Tối','Lá Khổng Lồ'] },
    marsh:    { prefix: ['Đầm'], root: ['Lục Chướng','Sậy','Đèn Ma','Cóc','Nước Đen','Sương Độc','Lau','Rắn Đá','Bùn Sôi','Quên'] },
    lake:     { prefix: ['Hồ'], root: ['Gương','Trăng','Ngọc','Không Đáy','Bạc','Lặng','Thiên Nga','Mắt Rồng','Muối','Bảy Năm'] },
    hills:    { prefix: ['Đồi','Gò'], root: ['Cỏ Hoang','Mộ','Lốc','Mây','Đá Lăn','Hoa Tím','Cừu','Gió','Ba Gò','Bò Rừng'] },
    desert:   { prefix: ['Sa Mạc','Biển Cát'], root: ['Hồng Sa','Gương','Xương Trắng','Cát Hát','Lặng','Đỏ','Vua Chôn Vùi'] },
    sea:      { prefix: ['Biển','Vịnh','Eo'], root: ['Sương','Hải Xà','Băng','Sấm','Tro','Đỏ','Hắc Uyên','Ngọc','Gió Tây','Bão','Lặng','Sao','Cá Voi','Xác Tàu','Muối'] },
    island:   { prefix: ['Đảo','Quần Đảo','Hòn'], root: ['Hải Xà','Rùa','San Hô','Mây','Quạ','Bão','Đơn Độc','Đá Đen','Sừng','Ngọc'] }
  },

  // ── HANG Ổ, DI TÍCH ──
  lair: {
    prefix: {
      beast: ['Hang','Ổ'], insect: ['Tổ'], undead: ['Hầm Mộ'], fiend: ['Cổng Quỷ'], construct: ['Xưởng Hoang'], dragon: ['Tổ Rồng'],
      spirit: ['Miếu Hoang'], plant: ['Vườn Độc'], ooze: ['Vũng'], elemental: ['Mắt'], avian: ['Tổ Đá'], magical_beast: ['Hang']
    }
  },
  ruin: {
    prefix: ['Phế Tích','Lăng','Hầm','Thành Cổ','Tháp Đổ','Đền Hoang'],
    root: ['Vương Lăng','Vua Chôn Vùi','Lõi Xưởng','Lòng Núi','Hang Hát','Bảy Cửa','Ngai Gãy','Chuông Câm','Gương Vỡ','Ngàn Bậc','Mặt Trời Tắt','Vua Không Đầu','Lửa Xanh','Mắt Đá','Trăng Đỏ']
  },

  // ── LỊCH SỬ, ĐI LẠI ──
  war: ['Trăm Ngày','Ba Vua','Hoa Tro','Muối','Cây Cầu','Ngai Trống','Lời Thề Gãy','Mùa Đông Đỏ','Hai Dòng','Cờ Đen','Con Ngựa Trắng','Giếng Độc','Quả Táo Vàng','Tiếng Chuông','Ngọn Hải Đăng'],
  ship: ['Cánh Hải Âu','Lời Hứa','Bà Góa Đen','Muối Mặn','Ngôi Sao Lạc','Hải Đăng Nhỏ','Răng Cá Mập','Gió Nồm','Thùng Rượu','Mắt Bão','Sóng Bạc','Kẻ Trôi Dạt','Con Rùa Già','Mũi Tên Lam','Không Chìm'],
  mercenary: ['Đoàn Nanh Gãy','Đội Khiên Xám','Hội Kiếm Thuê','Đoàn Cờ Đen','Đội Quạ Đêm','Hội Rìu Bạc','Đoàn Lửa Sói','Đội Ba Mươi','Hội Hải Âu','Đoàn Vô Danh'],
  pirate: ['Băng Mắt Đỏ','Băng Thuyền Ma','Băng Răng Muối','Băng Cờ Xương','Băng Gió Nồm','Băng Bà Góa']
};
