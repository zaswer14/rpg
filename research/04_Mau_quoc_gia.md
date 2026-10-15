# Mẫu quốc gia: 10 chủng tộc × 5 mẫu

**Ngày:** 15/10/2026 · **Trạng thái:** nháp thiết kế, chưa code. · **Thuộc:** `research/03_Thiet_ke_ban_do_Varen_V2.md` mục 5. · **Tên:** mọi tên riêng lấy ngẫu nhiên từ `LifeSim_RPG/data/names.js`.

Bản đồ V2 không có sẵn quốc gia. Mỗi lần tạo thế giới, máy bốc vài **mẫu quốc gia**, đặt thủ đô ở chỗ hợp với mẫu, cho lan ra thành lãnh thổ, rồi gắn thêm 1–2 **đặc trưng riêng** bốc ngẫu nhiên. Hai thế giới cùng có "Vương quốc Hiệp Sĩ" của Nhân Loại vẫn khác nhau: một nước có vua trẻ và mỏ vàng, nước kia đang suy tàn và mang lời nguyền hoàng tộc.

## 1. Lược đồ một mẫu

| Trường | Ý nghĩa |
|---|---|
| `id`, `race` | chủng tộc chủ thể (một trong 10 chủng tộc của thư viện) |
| `label` | tên kiểu, chỉ để người thiết kế đọc ("Vương quốc Hiệp Sĩ") |
| `gov` | chính thể (mục 2) |
| `faith` | trọng số quốc giáo, ví dụ `{ light:80, none:20 }`; bốc một lần khi tạo |
| `biomes` | biome ưa thích, dùng để chấm điểm chỗ đặt thủ đô |
| `needs` | điều kiện bắt buộc: `coast` (thủ đô ven biển), `mountain`, `river` |
| `size` | S (2–3 tỉnh), M (4–5), L (6–8): cỡ lãnh thổ mục tiêu khi lan |
| `stats` | `tax · army · patrol · stability · ambition`, mỗi số được cộng nhiễu ±10% khi tạo |
| `laws` | luật cố định của mẫu (mục 3) |
| `lawPool` | luật có thể có, bốc 0–1 cái |
| `races` | `fav` (ưu ái) / `wary` (dè chừng); chủng tộc khác là bình thường |
| `mix` | tỉ lệ dân: chủng tộc chủ 50–85%, phần còn lại chia cho chủng tộc bản địa của biome và chủng tộc `fav` |
| `trait` | **đặc tính của mẫu**: một luật chơi riêng, mẫu nào cũng có, không bốc |
| `tags` | dùng để lọc đặc trưng riêng (mục 5) và tính quan hệ ban đầu |

## 2. Chính thể

| `gov` | Tên | Ai cai trị, ai kế vị | Đường thăng tiến của người chơi | Tiền tố tên nước (`names.nation.prefix`) |
|---|---|---|---|---|
| `monarchy` | Quân chủ | vua, con trưởng kế vị | Hiệp sĩ → Nam tước → Bá tước | Vương quốc, Công quốc |
| `empire` | Đế chế | hoàng đế, hay tranh ngôi | như quân chủ, thêm Tổng đốc tỉnh chiếm được | Đế chế, Đế quốc |
| `theocracy` | Thần quyền | giáo chủ do giáo hội bầu | theo bậc giáo phái (Tín Đồ → Thánh) | Thánh quốc, Giáo quốc |
| `council` | Hội đồng | hội đồng trưởng lão / thị tộc | ghế hội đồng (theo tuổi hoặc mastery, tùy mẫu) | Liên bang, Hội quốc, Rừng quốc |
| `merchant` | Cộng hòa thương nhân | hội đồng nhà buôn | ghế hội đồng theo tài sản | Thị quốc, Cộng hòa |
| `tribal` | Bộ lạc | tù trưởng, thách đấu | thắng thách đấu hoặc đua | Bộ lạc, Thị tộc |
| `horde` | Hãn quốc du mục | khả hãn, thủ đô dời được | như bộ lạc, thêm chỉ huy kỵ binh | Hãn quốc |
| `magocracy` | Pháp quyền | hội pháp sư | bậc tháp theo mastery Arcane | Tháp quốc, Pháp quốc |
| `military` | Quân quản | thống soái | cấp bậc quân đội theo công trận | Quân quốc, Đô hộ phủ |
| `court` | Triều đình Yêu Tinh | nữ hoàng / vua mùa | được ban tước bằng khế ước | Đình |
| `collective` | Tập thể | không ai; giao thức chung | không có (Cơ Nhân không cần người cai trị) | Xưởng quốc, Mạng |
| `necrocracy` | Tử quyền | vua chết / hội đồng xương | theo tuổi kiếp (số lần trỗi dậy) | Vương triều, Tử quốc |
| `confederacy` | Liên minh lỏng | thủ lĩnh từng nhóm, họp khi có chiến tranh | được bầu làm thủ lĩnh nhóm | Liên minh, Hội |
| `order` | Hội dòng | đại sư | theo bậc trong dòng (thử thách) | Hội Dòng, Thủ Hộ Đoàn |

## 3. Luật

| Cờ | Tên | Tác dụng |
|---|---|---|
| `hunt_undead` | Săn Bộ Xương | Bộ Xương: `purge` × 3, sự kiện Thánh Kỵ Sĩ × 3, bị chặn ở trạm biên giới |
| `undead_citizen` | Bộ Xương là công dân | Bộ Xương sống như dân thường: có tầng lớp, sinh kế, không bị truy |
| `ban_death` | Cấm tử thuật | Luyện Necromancy / Soul / Curse hoặc theo `dark`: 4% / năm bị phát giác → phạt, tù, treo cổ nếu tái phạm |
| `ban_arcane` | Cấm phép | như trên, áp cho trường phái Huyền thuật |
| `mage_license` | Giấy phép pháp sư | luyện Arcane phải nộp phí hằng năm; không nộp thì như `ban_arcane` |
| `conscript` | Nghĩa vụ | tuổi trưởng thành tới +10 năm: nhập ngũ hoặc trốn (truy nã); lính thời chiến `war` × 2 |
| `no_outsiders` | Cấm ngoại tộc ở lâu | chủng tộc không `fav` ở quá 1 năm bị trục xuất |
| `no_logging` | Cấm đốn cây | không có tiều phu; trộm đốn tính như phạm luật |
| `free_trade` | Tự do buôn | thương nhân: phân vị +.05, thuế giảm một nửa |
| `sea_toll` | Thuế cảng | tàu ghé cảng mất phí; nước giàu thêm +.05 mỗi cảng |
| `bounties` | Treo thưởng | sự kiện treo thưởng × 2; mạo hiểm giả +15% thu nhập |
| `construct_citizen` | Cơ Nhân là công dân | ở nước **không** có luật này Cơ Nhân thu nhập × .8, có sự kiện "bị kiểm kê" |
| `caste` | Đẳng cấp | tầng lớp `q` không đổi được trong đời, trừ phong tước |
| `guild_monopoly` | Độc quyền phường hội | thợ rèn, thợ mỏ, thương nhân phải vào hội (phí, cần danh tiếng) |
| `duel_law` | Luật quyết đấu | tranh chấp xử bằng đấu tay đôi: sự kiện quyết đấu thay cho phạt bạc |
| `raid_law` | Cướp phá hợp lệ | nước này cướp làng nước giáp nhau mỗi vài năm (`war` nhẹ không cần tuyên chiến) |
| `contract_law` | Luật khế ước | mọi lời hứa trong sự kiện bị ràng buộc: thất hứa thì bị nguyền (`curse`) |
| `ancestor_tithe` | Lễ vật tổ tiên | 5% thu nhập cho tổ đường; đổi lại ổn định +.05 |
| `beast_bond` | Kết thú | Taming / Riding học nhanh ×1,3; săn thú không phải quái bị phạt |
| `open_borders` | Mở biên | không có trạm biên giới, không thu phí; kẻ bị truy nã nơi khác được ở |
| `penal_labor` | Khổ sai | phạm luật thì đi khổ sai (mất 2–5 năm focus) thay vì tù; tỉnh chiếm được bị khổ sai (ổn định −) |
| `liberation` | Giải phóng | tuyên chiến × 2 với nước không có `construct_citizen`; Cơ Nhân nơi khác có sự kiện bỏ trốn sang |

## 4. Năm mươi mẫu

Cột chỉ số: **Thuế · Quân · Tuần tra · Ổn định · Tham vọng**.

### Nhân Loại

| # | Mẫu | Gov | Đạo | Biome · cần | Cỡ | Chỉ số | Luật (+ có thể) | Ưa / Dè | Đặc tính |
|---|---|---|---|---|---|---|---|---|---|
| H1 | Vương quốc Hiệp Sĩ | monarchy | light 80 | đồng, rừng rêu | L | .18 · 1,2 · 1,25 · .70 · .50 | hunt_undead, bounties (+caste) | human / orc | **Thập tự chinh**: ổn định > .7 thì tuyên chiến với nước `dark` hoặc Bộ Xương × 3 |
| H2 | Cộng hòa Thương Cảng | merchant | light 40, none 60 | bờ sương · coast | M | .12 · .8 · 1,0 · .60 · .30 | free_trade, sea_toll (+open_borders) | human, merfolk / | **Lính đánh thuê**: trong chiến tranh mua thêm sức quân bằng tiền (P × 1,3, giàu −.05 / năm) |
| H3 | Thánh Quốc Bình Minh | theocracy | light 100 | đồng, đồi mộ | M | .20 · 1,0 · 1,1 · .75 · .40 | hunt_undead, ban_death (+mage_license) | human, dragonkin / fae, skeleton | **Tòa dị giáo**: người khác đạo bị phạt mỗi vài năm; Devotion Quang Minh × 1,5 trong nước |
| H4 | Đế Chế Kỷ Luật | empire | none 60, ancestor 40 | đồng, thảo nguyên | L | .25 · 1,4 · 1,3 · .55 · .90 | conscript, caste | human / | **Quân đoàn**: chiếm tỉnh nhanh gấp đôi; ổn định −.05 mỗi tỉnh mới trong 20 năm |
| H5 | Liên Minh Biên Viễn | confederacy | none 70, wild 30 | rừng, đầm, sa mạc | M | .08 · .9 · .8 · .50 · .30 | bounties, open_borders | mọi chủng tộc / | **Đất lành**: kẻ bị truy nã nơi khác được ân xá khi tới; lập làng rẻ hơn 50% |

### Tiên Tộc

| # | Mẫu | Gov | Đạo | Biome · cần | Cỡ | Chỉ số | Luật | Ưa / Dè | Đặc tính |
|---|---|---|---|---|---|---|---|---|---|
| E1 | Rừng Quốc Cây Mẹ | council | wild 85 | rừng cổ thụ, trảng mộng | M | .10 · .8 · 1,1 · .85 · .15 | no_outsiders, no_logging | elf, fae / orc, construct, dwarf | **Ký ức dài**: gần như không nổi loạn; sử biên niên của nước này không bao giờ bị cắt |
| E2 | Tháp Quốc Ngân Nguyệt | magocracy | none 60, light 40 | rừng cổ thụ, hang tinh thể | S | .20 · 1,0 · 1,0 · .70 · .40 | mage_license (Tiên Tộc miễn phí), caste | elf / human | **Tháp pháp sư**: Arcane học nhanh × 1,3; chiến tranh cộng sức phép (P + 15% nếu đối thủ không có pháp quyền) |
| E3 | Thị Tộc Hoang Tiên | tribal | wild 100 | rừng rêu, rừng rậm | M | .05 · 1,1 · .9 · .60 · .30 | no_logging, beast_bond | elf, beastfolk / human | **Rừng là tường**: tỉnh rừng / rừng rậm phòng thủ × 1,5; người lạ đi rừng của họ bị phục kích |
| E4 | Hạm Đội Trăng | merchant | wild 50, deep 50 | bờ sương, vịnh · coast | S | .12 · .9 · 1,0 · .65 · .35 | free_trade, sea_toll | elf, merfolk / | **Tàu lá**: mọi cảng của nước này có tàu viễn dương |
| E5 | Giáo Quốc Tiên Sa Ngã | theocracy | dark 100 | hang tinh thể, đồi mộ, vực | M | .22 · 1,1 · 1,0 · .55 · .60 | penal_labor (+undead_citizen) | elf / mọi chủng tộc khác | **Ẩn trong bóng**: Stealth học nhanh × 1,3; chiến tranh bằng ám sát (đối thủ ổn định −.05 / năm chiến) |

### Người Lùn

| # | Mẫu | Gov | Đạo | Biome · cần | Cỡ | Chỉ số | Luật | Ưa / Dè | Đặc tính |
|---|---|---|---|---|---|---|---|---|---|
| D1 | Liên Bang Thị Tộc Lò | council | forge 50, ancestor 50 | hang tinh thể, núi · mountain | M | .20 · 1,1 · 1,15 · .75 · .30 | ban_arcane, guild_monopoly | dwarf / elf | **Đường hầm**: các tỉnh núi của nước nối nhau dưới đất, đi qua núi không cần đèo |
| D2 | Vương Quốc Núi Sâu | monarchy | ancestor 90 | núi tro, băng nguyên · mountain | M | .18 · 1,2 · 1,2 · .80 · .20 | ancestor_tithe, no_outsiders | dwarf / | **Sổ thù**: không bao giờ tuyên chiến trước, nhưng tỉnh bị mất thì đánh lại tới khi lấy về |
| D3 | Hội Buôn Mạch Bạc | merchant | forge 40, none 60 | đồi, hang tinh thể | S | .14 · .8 · 1,0 · .65 · .35 | free_trade, guild_monopoly | dwarf, human / | **Ngân hàng**: người chơi vay được tiền; nước khác vay để đánh nhau, nước này giàu lên |
| D4 | Thệ Ước Giữ Cổng | military | ancestor 70, light 30 | biên vùng nguy hiểm | S | .15 · 1,35 · 1,4 · .70 · .10 | conscript, bounties | dwarf / | **Giữ cổng**: tỉnh giáp tầng lõi / chết có tuần tra × 1,4; NPC tỉa quái × 1,5 |
| D5 | Giáo Hội Đe Rune | theocracy | forge 100 | phế xưởng, núi tro | S | .22 · 1,0 · 1,1 · .70 · .30 | ban_death, construct_citizen | dwarf, construct / elf, fae | **Rune**: mua trang bị trong nước được +1 bậc |

### Orc

| # | Mẫu | Gov | Đạo | Biome · cần | Cỡ | Chỉ số | Luật | Ưa / Dè | Đặc tính |
|---|---|---|---|---|---|---|---|---|---|
| O1 | Hãn Quốc Thảo Nguyên | horde | ancestor 80 | thảo nguyên, sa mạc | L | .08 · 1,3 · .8 · .45 · .80 | conscript, duel_law | orc, beastfolk / elf | **Kỵ binh**: năm đầu chiến tranh điểm × 1,3; thủ đô dời mỗi 15–25 năm |
| O2 | Bộ Lạc Huyết Nộ | tribal | dark 70, ancestor 30 | núi tro, đồi mộ | M | .05 · 1,4 · .7 · .35 · .95 | duel_law, raid_law | orc / mọi chủng tộc khác | **Kẻ mạnh nhất**: tù trưởng chết thì một năm nội chiến (nổi loạn × 3) |
| O3 | Thị Tộc Rèn Sắt | tribal | ancestor 60, forge 40 | đồi, núi · mountain | M | .12 · 1,2 · 1,0 · .55 · .50 | conscript (+guild_monopoly) | orc, dwarf / | **Lò chiến**: mỗi năm hòa bình sức quân +.02 (tối đa +.3) |
| O4 | Liên Minh Nanh Gãy | confederacy | none 70, dark 30 | bất kỳ | S | .10 · 1,1 · .9 · .50 · .40 | open_borders | mọi chủng tộc / | **Bán kiếm**: nước khác thuê họ khi có chiến tranh (bên thuê P + 10%, nước này giàu lên); người chơi gia nhập được đoàn đánh thuê |
| O5 | Thần Quốc Xương Tổ | theocracy | ancestor 100 | băng nguyên, đồi mộ | M | .10 · 1,0 · 1,0 · .60 · .40 | hunt_undead, ancestor_tithe | orc, beastfolk / skeleton | **Đồng cốt**: sự kiện tổ tiên báo mộng (cảnh báo dịch, chiến tranh trước 1 năm) |

### Người Thú

| # | Mẫu | Gov | Đạo | Biome · cần | Cỡ | Chỉ số | Luật | Ưa / Dè | Đặc tính |
|---|---|---|---|---|---|---|---|---|---|
| B1 | Liên Minh Bầy | confederacy | wild 70, ancestor 30 | rừng rêu, thảo nguyên | M | .06 · 1,1 · 1,0 · .60 · .40 | beast_bond, no_logging | beastfolk / construct | **Bầy**: tỉnh bị đánh thì tỉnh kề tiếp viện (phòng thủ × 1,3) |
| B2 | Hội Săn Mặt Trăng | order | wild 100 | rừng cổ thụ, rừng rậm | S | .08 · 1,0 · 1,2 · .65 · .30 | bounties | beastfolk, elf / | **Thợ săn**: NPC tỉa quái × 1,5, vòng an toàn của nước rộng hơn |
| B3 | Hãn Quốc Vằn | horde | ancestor 90 | thảo nguyên, sa mạc | M | .07 · 1,25 · .8 · .45 · .70 | raid_law, beast_bond | beastfolk, orc / | **Cưỡi thú**: đi ngoài đường không bị phạt đặc trưng (rừng, đồi tính như đồng) |
| B4 | Cộng Đồng Đồng Cỏ | council | ancestor 60, wild 40 | đồng, thảo nguyên | M | .10 · .8 · 1,0 · .70 · .10 | beast_bond | beastfolk, human / | **Đàn gia súc**: sinh kế chăn nuôi +25% thu nhập; nạn đói hiếm hơn |
| B5 | Vương Quốc Sư Tử | monarchy | ancestor 60, light 40 | sa mạc, rừng rậm, thảo nguyên | M | .15 · 1,2 · 1,0 · .60 · .60 | duel_law, caste | beastfolk / | **Ngai thách đấu**: ai thắng vua trong quyết đấu thì làm vua, người chơi cũng vậy |

### Yêu Tinh

| # | Mẫu | Gov | Đạo | Biome · cần | Cỡ | Chỉ số | Luật | Ưa / Dè | Đặc tính |
|---|---|---|---|---|---|---|---|---|---|
| F1 | Hạ Đình | court | wild 90 | trảng mộng, rừng | M | .10 · .8 · 1,0 · .70 · .30 | contract_law | fae, elf / construct, dwarf | **Thời gian lệch**: người ngoài ở lâu có thể ngủ quên bảy năm |
| F2 | Đông Đình | court | wild 50, dark 50 | băng nguyên, đồi mộ | M | .15 · 1,1 · 1,0 · .60 · .55 | contract_law, no_outsiders | fae / human | **Mùa đông dài**: tỉnh của nước này tính như `cold`; quái họ băng thuần, không tấn công dân |
| F3 | Chợ Nấm Ma | merchant | none 70, wild 30 | trảng mộng, đầm | S | .05 · .6 · .8 · .50 · .20 | free_trade, contract_law | mọi chủng tộc / | **Mặc cả**: sự kiện đổi ký ức, năm tuổi, tên thật lấy đồ vật hoặc mastery |
| F4 | Bầy Tiểu Yêu Lang Thang | confederacy | none 100 | rừng, trảng mộng | S | .00 · .7 · .7 · .30 · .20 | open_borders | fae / | **Đường đổi hướng**: đi trong lãnh thổ có sự kiện lạc đường; biên giới tự dịch một tỉnh mỗi 20 năm |
| F5 | Vương Quốc Giấc Mơ | theocracy | wild 70, none 30 | trảng mộng | S | .12 · .7 · 1,0 · .75 · .20 | (mage_license) | fae / | **Tiên tri**: mỗi kiếp sinh trong nước nhận một lời tiên tri, đúng một nửa |

### Hải Tộc

| # | Mẫu | Gov | Đạo | Biome · cần | Cỡ | Chỉ số | Luật | Ưa / Dè | Đặc tính |
|---|---|---|---|---|---|---|---|---|---|
| M1 | Thị Quốc San Hô | merchant | deep 60, none 40 | vịnh, bờ sương · coast | M | .12 · .9 · 1,0 · .60 · .35 | free_trade, sea_toll | merfolk, human / | **Hải lộ**: mỗi cảng của nước +.15 giàu |
| M2 | Vương Triều Triều Dâng | monarchy | deep 80 | vịnh · coast | M | .18 · 1,1 · 1,0 · .65 · .55 | sea_toll (+conscript) | merfolk / | **Hải quân**: đánh nước ven biển thì điểm chiến +.2 / năm |
| M3 | Giáo Đoàn Vực Thẳm | theocracy | deep 100 | vịnh, vực · coast | S | .20 · 1,0 · .9 · .55 · .50 | undead_citizen | merfolk, skeleton / human, dragonkin | **Tiếng gọi**: chúa biển không đánh tàu của nước này; Devotion Vực Giáo × 1,5 |
| M4 | Liên Minh Cướp Biển | confederacy | none 60, dark 40 | đảo, vịnh · coast | S | .05 · 1,0 · .6 · .40 · .70 | raid_law, open_borders | mọi chủng tộc / | **Cướp biển**: hải trình gần lãnh thổ có cướp × 2; người chơi làm cướp biển được |
| M5 | Bộ Tộc Rạn Ngầm | tribal | wild 60, deep 40 | vịnh · coast | S | .05 · .9 · 1,0 · .70 · .10 | no_outsiders | merfolk / | **Dưới nước**: làng dưới nước; nước không có cảng không chiếm được tỉnh của họ |

### Long Nhân

| # | Mẫu | Gov | Đạo | Biome · cần | Cỡ | Chỉ số | Luật | Ưa / Dè | Đặc tính |
|---|---|---|---|---|---|---|---|---|---|
| R1 | Long Vương Quốc | monarchy | light 70, ancestor 30 | đỉnh bão, núi tro | M | .20 · 1,3 · 1,1 · .65 · .70 | caste | dragonkin / orc | **Huyết thống rồng**: chỉ Long Nhân được phong tước; Long Nhân có biến thể Long Huyết dễ hơn |
| R2 | Thị Tộc Tro | tribal | ancestor 90 | núi tro | S | .12 · 1,2 · 1,0 · .60 · .40 | ancestor_tithe | dragonkin, dwarf / | **Ấp trứng**: dân tăng sau mỗi lần núi lửa phun; núi phun khi có rồng chết |
| R3 | Giáo Hội Ngọn Lửa | theocracy | light 100 | núi tro, đỉnh bão | M | .22 · 1,1 · 1,1 · .70 · .55 | hunt_undead, ban_death | dragonkin, human / skeleton | **Thánh hỏa**: Bộ Xương trong nước `purge` × 4 (thay cho × 3) |
| R4 | Đế Chế Sừng Đen | empire | dark 90 | núi tro, vực | L | .28 · 1,4 · 1,0 · .45 · .90 | conscript, penal_labor | dragonkin / mọi chủng tộc khác | **Bạo chúa**: tỉnh mới chiếm bị khổ sai; nổi loạn × 2 |
| R5 | Thủ Hộ Đoàn Cổ Long | order | none 70, ancestor 30 | đỉnh bão · mountain | S | .08 · 1,0 · 1,2 · .80 · .05 | bounties | dragonkin / | **Canh giấc rồng**: chúa vùng Cổ Long hiếm xuất hiện hơn; ai đánh thức nó thì nước này truy nã |

### Cơ Nhân

| # | Mẫu | Gov | Đạo | Biome · cần | Cỡ | Chỉ số | Luật | Ưa / Dè | Đặc tính |
|---|---|---|---|---|---|---|---|---|---|
| C1 | Xưởng Quốc Tự Trị | collective | forge 100 | phế xưởng | S | .25 · 1,0 · 1,0 · .90 · .10 | construct_citizen, ban_death | construct / | **Dây chuyền**: dân tăng bằng đúc, theo độ giàu, không qua sinh đẻ |
| C2 | Hội Đồng Bánh Răng | council | forge 70, none 30 | hang tinh thể, đồi | M | .18 · 1,0 · 1,1 · .75 · .30 | construct_citizen, guild_monopoly | construct, dwarf, human / | **Kỹ nghệ**: Engineering học nhanh × 1,3 |
| C3 | Quân Đoàn Sắt | military | none 100 | đồng, phế xưởng | M | .20 · 1,4 · 1,2 · .80 · .75 | conscript, construct_citizen | construct / | **Giao thức chiến**: không cầu hòa; chiến tranh tới 10 năm hoặc tới khi một bên mất thủ đô |
| C4 | Thành Phố Đồng Hồ | merchant | none 80, forge 20 | đồng, bờ sương · coast hoặc river | S | .15 · .8 · 1,1 · .85 · .20 | free_trade, construct_citizen | construct, human / | **Giờ chính xác**: đường và hải trình qua nước nhanh hơn 20% |
| C5 | Phong Trào Thức Tỉnh | confederacy | none 70, dark 30 | phế xưởng, phế tích | S | .10 · 1,1 · .9 · .40 · .60 | construct_citizen, liberation | construct / human | **Phá xích**: luật `liberation`; mỗi tỉnh chiếm được thả Cơ Nhân ở đó thành công dân |

### Bộ Xương

| # | Mẫu | Gov | Đạo | Biome · cần | Cỡ | Chỉ số | Luật | Ưa / Dè | Đặc tính |
|---|---|---|---|---|---|---|---|---|---|
| S1 | Vương Triều Xương | necrocracy | dark 90 | đồi mộ, vực | M | .20 · 1,3 · 1,0 · .60 · .60 | undead_citizen, penal_labor | skeleton / human | **Đội quân không chết**: sau chiến tranh sức quân hồi lại nhanh gấp ba |
| S2 | Hội Kẻ Sám Hối | order | light 100 | đồi mộ, đồng | S | .10 · .8 · 1,0 · .70 · .10 | undead_citizen, ban_death | skeleton, human / | **Sám hối**: Bộ Xương theo Quang Minh dễ hơn (gate −15); nước `light` khác không tuyên chiến với nước này |
| S3 | Hầm Mộ Tự Trị | council | dark 60, deep 40 | hang tinh thể, đồi mộ | S | .15 · 1,0 · 1,0 · .65 · .30 | undead_citizen | skeleton / | **Thư viện người chết**: Necromancy, Soul học nhanh × 1,4; luật `ban_death` không có ở đây |
| S4 | Đạo Quân Lang Thang | horde | none 70, dark 30 | đất hoang, sa mạc | M | .00 · 1,2 · .6 · .30 · .80 | raid_law, undead_citizen | skeleton / mọi chủng tộc khác | **Đất chết**: tỉnh nước này chiếm được có độ hoang +.5 |
| S5 | Thị Quốc Mộ Đá | merchant | none 60, deep 40 | đồi mộ, sa mạc | S | .14 · .8 · 1,0 · .70 · .20 | undead_citizen, free_trade | mọi chủng tộc / | **Nghĩa trang thuê**: người sống thuê chỗ chôn; Bộ Xương trỗi dậy ở đây được nhận làm công dân ngay (cân nhắc: tỉ lệ trỗi dậy +5% nếu mộ nằm trong nước) |

## 5. Đặc trưng riêng

Khi tạo, mỗi nước bốc 1 đặc trưng (35% bốc 2). Đặc trưng có `when` lọc theo mẫu; không bốc hai cái mâu thuẫn (cùng nhóm).

| Nhóm | Đặc trưng | Điều kiện | Tác dụng |
|---|---|---|---|
| ngôi | Vua trẻ | gov có người cai trị | ổn định −.1, tham vọng +.2 |
| ngôi | Vua già sắp băng | như trên | trong 10 năm đầu có sự kiện băng hà, tranh ngôi |
| ngôi | Hai dòng tranh ngôi | monarchy, empire | nổi loạn × 1,5 tới khi một dòng bị diệt |
| kinh tế | Mỏ vàng | có đồi / núi | +.1 giàu ở tỉnh có mỏ |
| kinh tế | Nạn đói | không phải collective, necrocracy | dân −15%, ổn định −.1 trong 10 năm đầu |
| kinh tế | Cảng lớn | thủ đô ven biển | thủ đô +.15 giàu, tàu viễn dương |
| kinh tế | Thợ bậc thầy | | trang bị mua trong nước +1 bậc |
| kinh tế | Tham nhũng | | thuế thật cao hơn thuế công bố .05; ổn định −.05 |
| quân | Quân tinh nhuệ | | quân × 1,15 |
| quân | Quân ốm yếu | | quân × .85 |
| quân | Thủy quân mạnh | có cảng | như đặc tính Hải quân của M2 |
| quân | Biên giới quái | giáp tầng lõi / chết | tuần tra × 1,2 ở tỉnh biên, sinh kế lính canh nhiều hơn |
| đạo | Thánh tích | có quốc giáo | Devotion × 1,3; nước cùng đạo hay liên minh |
| đạo | Dị giáo ngầm | có quốc giáo | 20% dân theo đạo đối địch, sự kiện thanh trừng |
| đạo | Khoan dung | | khác đạo không bị phạt |
| đạo | Đền chúa vùng | giáp ổ chúa | dân thờ chúa vùng; chúa vùng không đánh làng của nước này |
| ngoại giao | Thù truyền kiếp | | bốc một nước khác: xác suất chiến tranh × 3 |
| ngoại giao | Liên minh hôn nhân | monarchy, empire, court | bốc một nước: không đánh nhau, giúp nhau khi bị đánh |
| ngoại giao | Chư hầu | cỡ S | nộp cống cho một nước lớn giáp nhau; được bảo vệ |
| ngoại giao | Bài ngoại | | thêm một chủng tộc vào `wary` |
| lịch sử | Đế chế suy tàn | cỡ L | ổn định −.2, nổi loạn × 1,5 |
| lịch sử | Nước mới lập | | ổn định −.1, tham vọng +.2, sử biên niên bắt đầu từ 0 |
| lịch sử | Lời nguyền hoàng tộc | gov có người cai trị | người cai trị chết sớm; sự kiện nguyền ở thủ đô |
| lịch sử | Kho báu thất lạc | | một di tích riêng của nước có rương lớn |
| văn hóa | Học viện danh tiếng | | focus Học chữ × 1,3 ở thủ đô |
| văn hóa | Đấu trường | | sự kiện đấu trường: danh tiếng, tiền, có thể chết |
| văn hóa | Hội ám sát | | Stealth, Dagger học nhanh hơn; nước khác ổn định −.03 / năm khi chiến tranh với nước này |
| văn hóa | Lễ hội lớn | | hạnh phúc +5 mỗi năm ở thủ đô |
| văn hóa | Ngựa giống tốt | có đồng / thảo nguyên | Riding × 1,3; sinh kế chăn nuôi + |
| văn hóa | Rừng thiêng | có rừng | luật `no_logging` ở tỉnh có rừng thiêng |
| văn hóa | Pháp sư cung đình | không có `ban_arcane` | Arcane học nhanh hơn ở thủ đô; chiến tranh P + 5% |

## 6. Cách tạo thế giới

1. **Số nước:** 5–7 (thường 6) trên ~30 khu dân cư. 15–25% tỉnh để vô chủ.
2. **Bốc mẫu.** Trọng số theo chủng tộc: Nhân Loại 1,4; Orc, Người Lùn, Tiên Tộc, Người Thú 1,0; Hải Tộc .8; Long Nhân .7; Yêu Tinh .6; Cơ Nhân .5; Bộ Xương .35. Mỗi mẫu nhân thêm điểm hợp bản đồ (có đủ biome ưa thích và `needs` không). Ràng buộc: ít nhất 4 chủng tộc khác nhau; tối đa 2 nước cùng chủng tộc (hai nước Nhân Loại thì phải khác `gov`); tối đa 1 nước Bộ Xương và 1 nước Cơ Nhân.
3. **Đặt thủ đô.** Với mỗi mẫu đã bốc, chọn điểm khu dân cư có điểm cao nhất theo `biomes` và `needs`, cách thủ đô khác ≥ 220px.
4. **Lan lãnh thổ.** Các nước lần lượt nhận tỉnh giáp mình rẻ nhất (chi phí theo địa hình, biome ngoài danh sách ưa thích × 1,5) tới khi đủ cỡ `size`. Tỉnh không ai lấy là vô chủ.
5. **Dân.** Mỗi tỉnh: chủng tộc chủ của nước 50–85% (nước `fav` nhiều chủng tộc thì thấp), phần còn lại chia cho chủng tộc bản địa của biome và chủng tộc `fav`. Tỉnh vô chủ dùng bảng bản địa của biome.
6. **Chỉ số.** Lấy `stats` của mẫu, nhân nhiễu ±10%, rồi áp đặc trưng riêng.
7. **Bốc đặc trưng riêng** (mục 5).
8. **Đặt tên** (từ `names.js`): tên nước = tiền tố theo `gov` + gốc theo chủng tộc; thủ đô và khu dân cư theo chủng tộc chủ; người cai trị và triều đại theo chủng tộc; nếu trùng tên đã dùng thì bốc lại.
9. **Quan hệ ban đầu:** khác quốc giáo kiểu đối địch (`light` / `dark`) −2, chủng tộc trong `wary` của nhau −1, cùng đạo +1, đặc trưng Thù truyền kiếp / Liên minh hôn nhân ghi đè. Quan hệ nhân vào xác suất tuyên chiến (mục 5.3 của file 03).

Nước mới sinh ra giữa chừng (nổi loạn, người chơi lập) cũng chọn từ 50 mẫu: mẫu cùng chủng tộc đa số của tỉnh, chính thể hợp với cỡ (nước 1–2 tỉnh không thành `empire`).
