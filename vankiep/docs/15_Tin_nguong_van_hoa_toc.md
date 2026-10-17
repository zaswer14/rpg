# Vạn Kiếp: tín ngưỡng gốc của tộc, sự kiện văn hóa tộc

Người dùng yêu cầu ngày 17/10/2026, sau khi đọc bản tìm hiểu về môi trường, tập tính các chủng tộc: Người Lùn có tín ngưỡng Ánh Sáng là không đúng; quen với thiết lập Người Lùn đào hầm, rèn đúc, còn Orc hoang dã, sống bầy đàn, bộ lạc, thị tộc. Mỗi tộc phải có tín ngưỡng khác nhau. Thêm sự kiện đặc trưng hơn: chơi Người Lùn mà chưa thấy sự kiện mang nét văn hóa Người Lùn.

Mã: `shared/faiths.js` (trường `folk`, bốn đạo mới), `data/nations.js` (`G.raceFaith`, đạo của 50 mẫu nước, hai mẫu Orc), `data/world.js` (đạo của 16 vùng), `js/realm.js` (đạo của khu dân cư), `js/life.js` (đạo của gia đình lúc sinh), `js/culture.js` (sự kiện, nạp sau `racev.js`). Tab "Tín ngưỡng gốc của tộc" trên trang Duyệt Nội Dung; nút văn hóa tộc hiện ở tab "Sự kiện giống loài".

## 1. Chuyện cũ

- Thư viện có 6 giáo phái cho 10 tộc. Quang Minh ưu ái người, Người Lùn, Long Nhân; Tổ Linh ưu ái Người Lùn, Orc, Người Thú; Lò Rèn ưu ái Cơ Nhân, Người Lùn. Người Lùn được ba đạo ưu ái mà không có đạo nào là của riêng mình; Người Thú, Yêu Tinh, Long Nhân không có đạo riêng.
- Đạo của gia đình lúc sinh bốc theo đạo của khu dân cư (`st.faiths`), không xét tộc. Đo 40 đời Người Lùn (thế giới `can-bang`, 17/10/2026): Lò Rèn 21, Tổ Linh 5, Quang Minh 4, Cổ Thần Hoang Dã 4, Hắc Giáo 2, không đạo 4.
- Mẫu Orc O3 "Thị Tộc Rèn Sắt" (lò chiến, đạo Lò Rèn 40%, ưu ái Người Lùn) và O5 "Thần Quốc Xương Tổ" (thần quyền) không hợp hình ảnh Orc bộ lạc.
- 40 đời Người Lùn: 16% sự kiện là của tộc, một nửa trong đó là câu "đời thường" (`dwf_days`); sự kiện văn hóa tộc thật sự còn chừng 8%. Ở thế giới thử, phần lớn Người Lùn sống ở khu của tộc mình trên đồi, núi lẻ nằm trong vùng không phải biome núi, nên các nút cần "ở núi quê tộc" (`dwf_flood`, `dwf_deep`) gần như không xảy ra.

## 2. Tín ngưỡng gốc

Mỗi tộc có đúng một tín ngưỡng gốc (`folk` trong `shared/faiths.js`); đạo đó chỉ ưu ái tộc gốc (Devotion × 1,5). Tộc khác vẫn theo được (cải đạo), chỉ không được ưu ái.

| Tộc | Đạo | Mới hay cũ | Ý |
|---|---|---|---|
| Người | ☀ Thánh Giáo Quang Minh | cũ | giáo hội có tổ chức, lời thề |
| Bộ Xương | ☾ Hắc Giáo | cũ | giao kèo, trả giá |
| Tiên Tộc | ❦ Cổ Thần Hoang Dã | cũ | rừng có trước thần; Cây Mẹ |
| Orc | ⌂ Tổ Linh Đạo | cũ | tổ tiên nói trong gió, bà đồng, xương treo trên cờ |
| Hải Tộc | ◉ Vực Giáo | cũ | giọng dưới đáy, lễ vật cho vực |
| Cơ Nhân | ⚙ Giáo Hội Lò Rèn | cũ | thay dần bộ phận, bài kinh của búa |
| Người Lùn | ▲ **Đạo Đá Tổ** | mới | không có thần, chỉ có tổ tiên ngủ trong lòng núi; tên khắc trên vách, lửa lò chung là hơi thở; lời thề trên Đá Thề; giữ lò, giữ lời, đòi đủ nợ |
| Người Thú | ✶ **Thú Linh Đạo** | mới | mỗi bầy có một thú tổ; trăng chọn hình cho đứa trẻ; ăn một mình là phụ bầy |
| Yêu Tinh | ❀ **Khế Ước Bốn Mùa** | mới | đất cho mượn, mùa đòi lại; mỗi mùa cho một thứ phép, đòi lại một thứ (ký ức, giọng hát, năm tuổi) |
| Long Nhân | ✺ **Long Hỏa Đạo** | mới | lửa trong máu là tổ tiên còn thở; mỗi thị tộc giữ một đài lửa không tắt |

Đạo mới có đủ trường như đạo cũ (giáo lý, cách cấp sức mạnh, tích / mất Devotion, ưu ái / dè chừng, bậc, phước lành, màu, dấu hiệu) nhưng **chưa có ngọn tín ngưỡng** (nghề riêng của đạo): tín đồ vào nghề qua cây của chủng tộc. Thạch Vu (Kẻ Nói Với Đá) của Người Lùn được ghi là người hành lễ của Đạo Đá Tổ. Lối Người Lùn chạm tới Death-Spirit qua Tổ Linh Đạo (Kẻ Nói Với Tổ Tiên) vẫn mở.

Ưu ái, dè chừng sau khi đổi: Quang Minh ưu ái người (dè Bộ Xương, Yêu Tinh); Hắc Giáo Bộ Xương (dè Long Nhân, Cơ Nhân); Cổ Thần Tiên Tộc (dè Cơ Nhân, Người Lùn); Tổ Linh Orc (dè Yêu Tinh, Cơ Nhân); Vực Giáo Hải Tộc (dè Long Nhân, người); Lò Rèn Cơ Nhân (dè Tiên Tộc, Người Thú, Yêu Tinh); Đá Tổ Người Lùn (dè Tiên Tộc, Yêu Tinh); Thú Linh Người Thú (dè Cơ Nhân); Khế Ước Yêu Tinh (dè Người Lùn, Cơ Nhân); Long Hỏa Long Nhân (dè Hải Tộc).

### 2.1 Đạo ở đâu

- **Gia đình lúc sinh** (`js/life.js`): trước hết bốc gia đình không theo đạo nào theo tỉ lệ "không đạo" của khu; còn lại thì theo đạo gốc của tộc với xác suất 88% nếu sống giữa người cùng tộc (khu của tộc mình hoặc tộc mình ≥ 30% dân), 65% nếu sống xa tộc; phần còn lại bốc theo đạo của khu.
- **Khu dân cư** (`js/realm.js`): 45% quốc giáo của mẫu nước + 40% đạo gốc của các tộc trong khu (mỗi tộc 80% đạo gốc, 20% không đạo, theo phần dân) + 15% đạo của vùng. Khu vô chủ: 65% theo tộc, 35% theo vùng.
- **Mẫu nước** (`data/nations.js`): đạo của mẫu theo tộc chủ. Người Lùn: Đá Tổ ở cả năm mẫu (D1 cộng Lò Rèn 20%, D3 nửa không đạo, D5 cộng Lò Rèn 25% vì ưu ái Cơ Nhân); Orc: Tổ Linh (O2 Huyết Nộ còn 40% Hắc Giáo, O4 nửa không đạo); Người Thú: Thú Linh; Yêu Tinh: Khế Ước (Đông Đình còn 30% Hắc Giáo); Long Nhân: Long Hỏa (Đế Chế Sừng Đen nửa Hắc Giáo). Giữ ngoại lệ có lý do trong truyện: Tiên Sa Ngã (E5) theo Hắc Giáo, Hội Kẻ Sám Hối (S2) theo Quang Minh, Hạm Đội Trăng (E4) nửa Vực Giáo.
- **Vùng** (`data/world.js`): đạo của 16 vùng viết lại theo dân bản địa (Núi Thạch Lâm: Đá Tổ 55; Thảo Nguyên Gió Hú: Tổ Linh 32, Thú Linh 28; Trảng Mộng Ảo: Khế Ước 45; Đỉnh Lôi Vân, Núi Hỏa Diệm: Long Hỏa 32–35…).
- **Orc bộ lạc**: O3 đổi thành **Bầy Sói Rừng Thẳm** (bộ lạc ở rừng rêu, thảo nguyên; luật Kết thú; đặc tính "Bầy lớn dần": giữ cơ chế cũ, mỗi năm hòa bình quân mạnh thêm, tối đa 30%); O5 đổi thành **Liên Bộ Lạc Xương Tổ** (chính thể bộ lạc thay cho thần quyền, giữ đặc tính Đồng cốt). Năm mẫu Orc giờ là hãn quốc du mục, ba bộ lạc, một liên minh lỏng.

Đo 60 đời mỗi tộc lúc sinh (thế giới `can-bang`): Người Lùn Đá Tổ 53, không đạo 3, Lò Rèn 2; Orc Tổ Linh 53; Người Thú Thú Linh 52; Yêu Tinh Khế Ước 54; Long Nhân Long Hỏa 41, Quang Minh 11; Tiên Tộc Cổ Thần 42, Quang Minh 9; Hải Tộc Vực Giáo 39, không đạo 9; Cơ Nhân Lò Rèn 49. 200 đời người: 57 gia đình không đạo (kỳ vọng theo tỉ lệ của khu: 57).

## 3. Sự kiện văn hóa tộc (`js/culture.js`)

Nguồn mới tra cho bước này: Dwarf Fortress (quen hầm, ra nắng chóng mặt), Elder Scrolls (Orsimer: thử thách trưởng thành, tù trưởng lên bằng thách đấu, lò rèn là chỗ thiêng), Dragon Age (Dalish: lễ khắc mặt phải im lặng), văn học dân gian Anh, Ireland (trẻ đánh tráo, kéo sắt trên nôi, đồ ăn của tiên, nước chảy chặn Yêu Tinh), truyện German (nix: vạt áo luôn ướt), D&D (dragonborn: tên lúc nhỏ do anh chị em cùng lứa trứng đặt, hai thị tộc chia trứng; warforged: nghỉ mà vẫn nghe).

**Người Lùn: hầm, lò, thị tộc** (20 sự kiện, 3 quyết định). "Ở dưới hầm" giờ gồm cả khi sống trong khu của Người Lùn (khu Người Lùn luôn đục vào đồi, núi), không chỉ khi ở biome núi; sửa luôn điều kiện của `dwf_flood`, `dwf_deep` ở `racev.js`.

| Nút | Ý |
|---|---|
| `dwf_pick` | ông nội trao cuốc chim ba đời: "Đá kêu trước khi sập" |
| `dwf_sun` | lần đầu lên mặt đất, nôn vì nắng |
| `dwf_trade_call` → **`dwf_trade`** | hội đồng gọi tới đại sảnh: chọn việc cho thị tộc: vào lò, xuống mỏ, khắc rune, đứng cổng → `dwf_forge_first` (lưỡi rìu đầu tay, trang bị +1), `dwf_rune_first` (rune Giữ khóa luôn cửa của thầy), `dwf_gate_first` (thứ gì cào cửa đá tới sáng); chọn xuống mỏ thì các nút dưới hầm mở |
| `dwf_vein` → **`dwf_claim`** | mạch quặng (lặp); 12% là mạch bạc sao: báo hội đồng / giấu, đào đêm / bán vị trí cho thương nhân người → `dwf_claim_caught` (bị lộ thì bị ruồng bỏ) |
| `dwf_collapse`, `dwf_beast` | sập hầm (đào cứu người, 1% chết vì đá vùi), đào thủng vào hang quái |
| `dwf_master` | thử tay nghề lên Thợ Cả, được đóng dấu riêng; trượt thì về lò làm lại (lặp tới khi qua) |
| `dwf_hold_call` → **`dwf_hold`** | bản đồ thành cổ dưới núi bị bỏ từ đời kỵ: đi cùng đoàn chiếm lại / ở lại giữ lò → `dwf_hold_win` (lò thành cổ nhóm lại), `dwf_hold_lose` (thứ ở dưới sâu thức dậy), `dwf_hold_tomb` (sảnh mộ tổ tiên còn nguyên), `dwf_hold_back` |
| `dwf_gold`, `dwf_caravan`, `dwf_beard_pull`, `dwf_hammer` | vàng biết gọi; đoàn xe sắt xuống chợ người; gã say giật râu (xa tộc); tuổi già trao búa, búa đổi chủ thì đổi tên |

**Orc: bầy, trại, bộ lạc** (15 sự kiện, 2 quyết định).

| Nút | Ý |
|---|---|
| `orc_pup` → `orc_wolf_ride` → `orc_wolf_old` | mẹ trao sói con lúc nhỏ; cưỡi sói lần đầu; sói già chết, nanh buộc vào cán rìu |
| `orc_trial` | bảy ngày một mình trên thảo nguyên với một con dao |
| `orc_hunt` | cả trại săn vây (bò rừng, lạc đà hoang, voi ma mút, gấu hang theo biome) |
| `orc_chief_old` → **`orc_chief`** | tù trưởng gãy chân: thách đấu ở vòng đá / đứng sau tù trưởng / dắt người đi dựng trại riêng → `orc_chief_trust`, `orc_camp_new` |
| `orc_raid_call` → **`orc_raid`** | mùa đông, đi cướp làng nông dưới thung lũng: cưỡi sói theo đoàn / ở lại / lẻn xuống báo cho làng (lộ thì bị đuổi) |
| `orc_bones` | xương cha hoặc mẹ treo lên cột cờ trước lều ("kẻ chết được nhớ bằng xương treo trên cờ") |
| `orc_rage`, `orc_shaman_pick` → `orc_shaman_heir`, `orc_storm`, `orc_lone` | cơn cuồng nộ đầu tiên; bà đồng chọn người mang túi xương, sau thành bà đồng của trại; bão cát, bão tuyết; bị đuổi khỏi trại đi một mình như sói lạc bầy |

**Tộc khác**: Tiên Tộc `elf_inked` (lễ khắc mặt bằng nhựa cây, kêu đau thì năm sau làm lại), `elf_hart` (hươu trắng chọn chỗ dựng trại), `elf_song` (khúc hát chín đêm); Người Thú `bst_mark`, `bst_pack_hunt`, `bst_intruder`, `bst_cubs` (con non của cả bầy); Yêu Tinh `fae_changeling` (kéo sắt trên nôi), `fae_food` (người phàm ăn đồ tiên thì không về được), `fae_water` (không qua được nước chảy); Hải Tộc `mer_wethem` (vạt áo luôn ướt), `mer_tidesong`; Long Nhân `drg_clutch` (tên lúc nhỏ), `drg_clutch_split` (hai thị tộc chia lứa trứng); Cơ Nhân `cst_sentry` (nghỉ mà vẫn nghe), `cst_ledger` (bị ghi vào sổ tài sản); người `hum_parents_age`, `hum_guild`.

### 3.1 Sự kiện của đạo (`G.FAITH_EV`)

Gắn với đạo đang theo, không gắn với tộc (người cải đạo cũng gặp), chủ đề `faith`. Đá Tổ: `fs_stone_oath` (lời thề trên Đá Thề), `fs_stone_names` (Ngày Đọc Vách), `fs_stone_tomb` (đục hốc trong vách cho cha mẹ); Tổ Linh: `fs_anc_bones` (đọc xương vai cừu trước mùa săn), `fs_anc_wind`; Thú Linh: `fs_totem_dream` (mơ thấy thú tổ, từ nay không săn loài ấy), `fs_totem_share` (lễ chia mồi dưới trăng); Khế Ước: `fs_season_turn` (sợi chỉ bạc đầu đời), `fs_season_due` (mùa đòi lại phần của nó); Long Hỏa: `fs_flame_watch`, `fs_flame_out` (lửa đài tắt lần đầu sau hai trăm năm); Cổ Thần: `fs_wild_grave`, `fs_wild_wake`; Vực Giáo: `fs_deep_voice`, `fs_deep_gift`; Lò Rèn: `fs_forge_part`, `fs_forge_hymn`; Quang Minh: `fs_light_vigil`, `fs_light_alms`; Hắc Giáo: `fs_dark_debt`.

### 3.2 Giọng theo tộc: thêm mười sự kiện chung

`G.RACE_VOICE2`, bọc như `G.RACE_VOICE` của `racev.js` (giữ tác dụng, đổi câu chữ): `ad_kid` (con cái), `tn_brawl` (ẩu đả; Người Lùn, Orc hai biến thể), `ad_suitor` (người để ý: Người Lùn gặp ở lò chung, muốn ngỏ lời phải tự rèn trâm cài râu), `ad_inherit`, `ch_coin`, `ad_dice`, `ad_tax` (khi sống giữa tộc: thị tộc thu phần cho lò chung, tù trưởng thu phần cho mùa chiến…), `cv_test` (lễ thử thiên phú ở làng không có đền, trường: trước Đá Thề, trong lều bà đồng, dưới gốc Cây Mẹ… thay cho "nhà thầy cúng đầu làng"), `inf_bless` (ban phước sơ sinh theo đạo), `nt_faith_feast` (lễ quốc giáo theo đạo: Ngày Mở Lò Tổ, Đêm Thú Tổ, Đêm Long Hỏa…).

## 4. Kết quả đo

Ép giống loài, `sim.html` trong console (17/10/2026); "của riêng tộc" gồm nút của `racev.js`, `culture.js` và sự kiện của đạo đang theo; mẫu số gồm cả mạch truyện, người quen. Trước: bản đo ở `docs/14` mục 4 (1000 đời thường, không ép).

| Tộc | Đời | Của riêng tộc (trước → sau) | Đổi giọng (trước → sau) | Hay gặp nhất |
|---|---|---|---|---|
| Người Lùn | 30 | 16,7% → 25,2% | 10,3% → 15,4% | đời thường, Ngày Đọc Vách, trời quá rộng, mạch quặng, sập hầm, hang quái |
| Orc | 30 | 17,3% → 28,3% | 9,6% → 15,6% | đời thường, săn vây, đàn bò không về, sói con, giá máu, bão |
| Người Thú | 12 | 18,2% → 22,5% | 9,8% → 17,2% | đời thường, săn bầy, kẻ săn da, thay lông, chia mồi dưới trăng |
| Tiên Tộc | 12 | 22,1% → 22,6% | 12,0% → 15,7% | đời thường, tròn trăm tuổi, đánh thức rừng, lễ khắc mặt |
| Yêu Tinh | 12 | 15,5% → 19,7% | 11,1% → 17,2% | đời thường, mùa đòi phần, nước chảy |
| Hải Tộc | 12 | 18,0% → 20,4% | 10,2% → 16,0% | đời thường, Khô vảy, giọng dưới đáy |
| Long Nhân | 12 | 15,1% → 19,4% | 11,2% → 18,7% | đời thường, lột vảy, hiệp sĩ săn rồng, giữ lửa đài |
| Cơ Nhân | 12 | 26,9% → 27,1% | 6,0% → 5,6% | đời thường, lau dầu, nghỉ mà vẫn nghe |
| Người | 12 | 3,0% → 6,6% | 1,1% → 0,6% | phát bánh ngày lễ, lũ đồng bằng |

Không có lỗi ở 180 đời ép giống loài. Bảng cân bằng 1000 đời: ghi ở mục 4.1.

### 4.1 Cân bằng 1000 đời

`sim.html`, 1000 đời, thế giới `can-bang`, 17/10/2026 (150 giây, khung trình duyệt bị ẩn nên chậm hơn thường lệ).

| | Bản trước (`docs/14` mục 4) | Bản này | Mục tiêu |
|---|---|---|---|
| Trận quá Tier + 1 | 0 | 0 (61 287 trận) | 0 |
| Trỗi dậy | 18,2% | 19,8% | ~20% |
| Tử trận trước quái | 10,0% | 10,1% | ~10% |
| Tháp Tier 0–5 | | 57,9 / 28,1 / 10,1 / 3,2 / 0,6 / 0,1 | 60 / 27 / 10 / 2,5 / 0,5 / 0,05 |
| Sự kiện thuộc mạch | 47,1% | 46,6% (đời trưởng thành 47,0%) | ~50% |

Phần sự kiện của riêng tộc / đổi giọng trong 1000 đời này: người 6,5% / 1,2%; Người Thú 23,7 / 16,3; Orc 27,0 / 14,9; Yêu Tinh 19,9 / 16,5; Người Lùn 25,4 / 16,8; Cơ Nhân 30,2 / 6,6; Tiên Tộc 24,1 / 15,8; Long Nhân 21,3 / 17,8; Hải Tộc 21,1 / 14,5. Số đời mỗi tộc khác bản trước (người 356, Người Thú 354, Orc 104, Người Lùn 32…) vì mẫu O3 đổi biome nên thế giới `can-bang` dựng ra khác.

Thử 100 thế giới: 0 lỗi, 44 cảnh báo (trước chừng 40, phần lớn "đất chật"), 875 ms mỗi thế giới. Không đổi luật thế giới động ngoài đạo của khu, của nước và mẫu O3, O5; chưa chạy Thử thế giới động.

## 5. Còn để lại

- Bốn đạo mới chưa có ngọn tín ngưỡng (nghề riêng của đạo) và chưa có gate; Devotion, phước lành vẫn chỉ là dữ liệu như sáu đạo cũ (`shared/docs/03_Faiths.md` mục 5).
- Thư viện chung đổi: Skeleton Codex chưa dùng giáo phái (`shared/games/skeleton-codex.js` không chọn `faiths`); trang Duyệt Cây Nghề tự hiện bốn đạo mới.
- Quyết định mới (việc cho thị tộc, mạch bạc sao, chiếm lại thành cổ, ghế tù trưởng, đi cướp) chưa có hệ quả dài ngoài cờ (`S.flags.dwfTrade`, `dwfMaster`, `orcChief`…): làm tù trưởng chưa thành chức trong `org.js`, Thợ Cả chưa tăng thu nhập.
- Người Thú vẫn một tộc trộn sói và mèo (bản tìm hiểu 17/10/2026, mục 2.3); con lai, người thân khác tộc già theo bảng tuổi của người chơi (mục 2.1, 2.2) chưa sửa.
- Sự kiện mạch truyện, người quen (~30% sự kiện) vẫn chưa đổi giọng theo tộc.

## Nguồn

- Dwarf Fortress, quen hầm: https://dwarffortresswiki.org/index.php/Cave_adaptation
- Orsimer: https://elderscrolls.fandom.com/wiki/Orsimer, https://www.imperial-library.info/content/code-malacath
- Dalish: https://dragonage.fandom.com/wiki/Dalish_Camp, https://dragonage.fandom.com/wiki/Aravel
- Khajiit: https://en.uesp.net/wiki/Lore:Khajiit
- Trẻ đánh tráo: https://en.wikipedia.org/wiki/Changeling; nước chảy: https://britishfairies.wordpress.com/tag/running-water/
- Nix: https://en.wikipedia.org/wiki/Nixie_(folklore)
- Dragonborn: https://dragonbornnames.com/dragonborn-names/lore/
- Warforged: https://www.wargamer.com/dnd/warforged-5e
