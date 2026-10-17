# Vạn Kiếp: sự kiện giống loài, môi trường sống

Người dùng yêu cầu ngày 17/10/2026: nghiên cứu các câu truyện, bổ sung vào cây sự kiện; sự kiện của các chủng tộc khác nghe giống loài người, mỗi chủng tộc phải có sự kiện riêng, gắn với môi trường sống. Mã: `js/racev.js` (nạp sau `story.js`). Bảng đo "Sự kiện giống loài" và "Sự kiện giống loài: lựa chọn" trong `sim.html`. Tab "Sự kiện giống loài" trên trang Duyệt Nội Dung.

## 1. Chuyện cũ

Trước bước này, sự kiện đời người viết cho loài người. Giống loài khác chỉ có lễ trưởng thành (`tn_rite`, một câu mỗi loài), quyết định giữ tập tục (`cv_custom`, `docs/11`), hai sự kiện của Cơ Nhân (`con_oil`, `con_dream`) và vài sự kiện quốc gia theo mẫu nước (`tpl_E*`, `tpl_D*`…: chỉ khi sống ở nước của tộc đó). Đo 48 đời ép giống loài (6 đời mỗi loài, 16/10/2026): sự kiện riêng của tộc chiếm 0–7%, còn lại là "Lễ hội mùa gặt", "Được mùa", "Lưng bạn không thẳng được nữa", "Một tu sĩ già dạy bạn đọc chữ bằng cách vạch lên cát" như người. Một Tiên Tộc 400 tuổi gặp lại "người bạn thơ ấu" rồi uống tới sáng; một Cơ Nhân ăn mừng mùa gặt.

## 2. Tra cứu

Mỗi giống loài lấy vài mô típ từ truyện, game, văn học dân gian, rồi đặt vào biome quê của tộc (`G.RACE_SETTLE`).

| Giống loài | Nguồn | Mô típ dùng |
|---|---|---|
| Tiên Tộc | Tolkien (Eldar); D&D (elf không ngủ mà thiền, tên người lớn đặt khi đã lớn); Elder Scrolls (Bosmer, Giao ước Xanh: không chặt cây sống); Dragon Age (Dalish) | sống quá lâu nên bạn loài người già đi trước mắt; chết vì sầu; tiếng mòng biển gọi về phía tây; tiều phu loài người chặt cây có tên |
| Người Lùn | Warhammer (Dammaz Kron, Sổ Thù; Kẻ Diệt cạo đầu đi tìm cái chết để gột nhục); Tolkien (Durin, đào quá sâu, đàn bà cũng có râu); Dwarf Fortress (cơn nhập thần: làm ra kiệt tác hoặc phát điên; đào trúng nước, dung nham) | món nợ phải ghi; lời thề Kẻ Diệt; kiệt tác; tầng mỏ bị niêm phong; sợ trời rộng |
| Orc | Warcraft (tổ tiên nói qua bà đồng, thách đấu); Elder Scrolls (Orsimer, giá máu, Luật Malacath); Warhammer (cả thảo nguyên họp lại thành một cơn gầm); Shadow of Mordor (hệ Nemesis: kẻ thua quay lại mang vết sẹo bạn để lại) | tên đổi theo việc làm; kẻ thù cũ quay lại; giá máu giữa hai trại; ít ai sống tới già nên người già thành một chức danh |
| Người Thú | Elder Scrolls (Khajiit: hình dáng theo tuần trăng lúc sinh); D&D (shifter, tabaxi); bầy sói (con đầu đàn, tiếng hú); truyện về loài có nanh bị coi là nguy hiểm trong thành người | sinh dưới trăng nào; mũi thính; thách con đầu đàn; rọ mõm ở chợ; kẻ săn da |
| Yêu Tinh | Văn học dân gian Ireland, Scotland, Anh: tên thật, sắt lạnh, lời cảm ơn là nhận nợ, vòng nấm làm lệch thời gian, đình Seelie / Unseelie; ballad *Tam Lin* (bảy năm một lần đình nộp một linh hồn, người yêu ôm chặt qua các lần biến hình); thơ *La Belle Dame sans Merci* (người phàm héo mòn vì yêu Yêu Tinh) | tên thật; Đình Hạ hay Đình Đông; giao kèo không ai quỵt được; người tình loài người héo mòn |
| Hải Tộc | Andersen, *Nàng tiên cá*; selkie (áo da bị giấu thì phải ở lại trên cạn, tìm lại áo thì về biển); siren của *Odyssey*; truyện người đi biển về tiếng hát cá voi | áo vảy bị giấu; hát gọi tàu vào đá; khô vảy khi xa biển; kéo người chết đuối |
| Long Nhân | D&D (dragonborn: danh dự thị tộc trên hết); Skyrim (tiếng gầm có máu rồng); Smaug, Fafnir (lòng tham kho báu, kẻ trộm lấy một chiếc cốc); bò sát máu lạnh | trứng ấp trong đá nóng; sét đánh trúng; lòng tham rồng; nợ của một người là nợ của thị tộc; mọc cánh (nhánh Elder Wyrm của thư viện) |
| Cơ Nhân | Golem thành Praha (chữ khắc làm đất sét sống); Warforged của Eberron (đúc cho chiến tranh, đi tìm mục đích, có linh hồn không); *Frankenstein*; con tàu của Theseus | người đúc; tấm biển số hiệu; thay lõi thì còn là mình không; bị đuổi khỏi đền; kẻ trộm phụ tùng |

Loài người là mặc định của mọi sự kiện chung; thêm ba nút nói về cái ngắn ngủi, đông đúc của loài người (`hum_*`). Bộ Xương đã có cả nhánh riêng từ `docs/12`, `docs/13` nên không thêm.

## 3. Thiết kế

### 3.1 Môi trường sống

| Hàm | Nghĩa |
|---|---|
| `G.raceHome(S)` | biome của vùng đang ở nằm trong biome quê của tộc (`G.RACE_SETTLE[race].biomes`) |
| `G.amongKin(S)` | sống giữa người cùng tộc: khu của tộc mình, hoặc tộc mình chiếm ≥ 30% dân khu; không có khu thì xét tộc của nước |
| `G.hostRace(S)` | tộc chủ nhà: tộc của khu, không có khu thì tộc của nước |
| `seaSide` (trong file) | vùng ven biển, hoặc khu có bến, nghề cá, ô biển |

Mỗi tộc có ba loại nút: nút ở quê tộc (rừng của Tiên Tộc, mỏ của Người Lùn, thảo nguyên của Orc…), nút xa tộc (theme `stranger`: khói thành phố, sắt lạnh, rọ mõm, trời quá rộng, kẻ trộm phụ tùng; nặng hơn ở nước "dè chừng" tộc đó) và nút theo thân thể, tuổi đời của tộc (đặt tên, mọc cánh, lột vảy, thay lõi, tuổi già).

### 3.2 Giọng theo giống loài (`G.RACE_VOICE`)

Tám sự kiện chung hay rơi nhất giữ nguyên tác dụng, đổi câu chữ theo tộc:

| Sự kiện | Đổi thế nào |
|---|---|
| `ch_festival` | lễ của tộc mình (Đêm Lá Rụng, Ngày Mở Lò, Hội Lửa Sói, Đêm Trăng Tròn, hội đình mùa, Lễ Triều Cường, Đêm Đài Lửa, Ngày Lò Đúc Mẹ); ở khu của tộc khác thì là lễ của tộc chủ nhà, bạn đứng ở rìa đám đông. Người sống ở khu Người Lùn cũng dự Ngày Mở Lò |
| `ad_harvest` | ở quê tộc: vườn quả trong rừng, ruộng nấm dưới hầm, mật hoa, vườn tảo và bãi nuôi trai, ruộng bậc thang bên núi lửa, đàn bò rừng; Cơ Nhân: máy cày tự lắp |
| `inf_word`, `ch_letters` | từ đầu đời, cách học chữ của tộc (vân lá, rune trên vách, dấu móng, chữ bằng sương…) |
| `ch_hunger`, `inf_fever` | mất mùa theo nơi sống (biển cạn cá, ruộng nấm thối, đàn thú không về); Long Nhân sốt nóng như than, Hải Tộc khô vảy |
| `el_aches` | tuổi già của tộc (tay run khi giương cung, khớp gối kêu như bản lề cửa hầm, cánh bạc màu, lửa trong bụng nguội dần) |
| `ad_old_friend` | loài sống lâu, quá 90 tuổi, ở giữa tộc khác: người bạn loài người đã mất, gặp chắt của họ |

### 3.3 Nút mới

Mỗi tộc một sự kiện "đời thường" lặp lại được (`<tộc>_days`, trọng số 4,5, khoảng lặp 2): câu chữ theo tuổi (nhỏ, lớn, già) và nơi ở (quê tộc hay giữa người cùng tộc / xa tộc; Hải Tộc xa biển có nhóm riêng). Đây là nguồn giọng tộc đều đặn nhất.

| Giống loài | Sự kiện | Quyết định, nhánh |
|---|---|---|
| Tiên Tộc | `elf_name` tên thật đặt khi đã lớn, `elf_mortal` bạn loài người già đi (vào dàn nhân vật), `elf_trance` thiền thay ngủ, `elf_sea` tiếng mòng biển (muốn đi), `elf_grief` Sầu héo, `elf_smoke` khói thành phố, `elf_deadwood` không chặt cây sống, `elf_century` tròn mỗi trăm tuổi từ 200, `elf_dream` Mộng Rừng báo quái, `elf_stars` hát tên sao | `elf_loggers` → `elf_axe` (cảnh cáo / thương lượng / để mặc) → `elf_axe_feud`, `elf_axe_pact`, `elf_axe_lost` |
| Người Lùn | `dwf_dark` nhìn trong tối, `dwf_cup` món đồ đầu tay, `dwf_beard` bím râu đầu, `dwf_mood` cơn nhập thần (kiệt tác: trang bị +2, danh vọng; hoặc phát điên: Suy nhược), `dwf_flood` mạch nước, dung nham, `dwf_deep` đào quá sâu, `dwf_sky` trời quá rộng, `dwf_ale` rượu đầu mùa, `dwf_hall` tên trên vách | `dwf_cheat` → `dwf_grudge` Sổ Thù (ghi / bỏ qua) → `dwf_grudge_paid`, `dwf_grudge_blood`, `dwf_grudge_heir`; `dwf_shame` → `dwf_slayer` lời thề Kẻ Diệt (gột ruồng bỏ; chết vì quái thì tên được khắc lại) |
| Orc | `orc_scar`, `orc_runt`, `orc_name` tên theo việc làm, `orc_wind` tổ tiên nói trong gió, `orc_gather` Cơn Gầm Lớn (chủ đề chiến tranh), `orc_scorn` ánh mắt ở chợ, `orc_drought` đàn bò không về, giếng cạn, `orc_elder` "Người Già" | `orc_rival` (vào dàn: đối thủ) → `orc_rival_back`, `orc_rival_brother`, `orc_rival_dead`; `orc_blood` → `orc_price` giá máu (trả / ra vòng / không trả) → `orc_feud` |
| Người Thú | `bst_moon` sinh dưới trăng nào, `bst_nose`, `bst_howl`, `bst_totem`, `bst_molt` thay lông, `bst_muzzle` rọ mõm, `bst_poacher` kẻ săn da, `bst_herd` theo đàn, mùa nấm, `bst_teeth` | `bst_alpha_old` → `bst_alpha` (thách / đứng sau) → `bst_alpha_rule`, `bst_alpha_pass` |
| Yêu Tinh | `fae_truename`, `fae_glamour`, `fae_wings`, `fae_iron` sắt lạnh, `fae_thanks`, `fae_ring` dẫn điệu vòng nấm, `fae_lover`, `fae_seasons` | `fae_court_call` → `fae_court` (Đình Hạ / Đình Đông) → `fae_midsummer`, `fae_tithe` (Tam Lin); `fae_plea` → `fae_deal` (ký ức / vàng / không công) → `fae_deal_kept`, `fae_deal_cheat` |
| Hải Tộc | `mer_gills`, `mer_reef`, `mer_whale`, `mer_dry` Khô vảy (muốn về biển), `mer_drowned`, `mer_pearl`, `mer_storm`, `mer_deep` | `mer_rock` → `mer_cloak` áo vảy (ở lại: thành vợ chồng / hát cho ngủ / bỏ áo) → `mer_cloak_found` (ở lại hay về biển, bỏ bạn đời); `mer_song` → `mer_siren` (cùng hát / báo tàu / lặn đi) → `mer_siren_seen`, `mer_siren_gift` |
| Long Nhân | `drg_egg`, `drg_spring` suối nóng, `drg_struck` sét đánh, `drg_roar`, `drg_shed` lột vảy, `drg_cold` Máu lạnh (xứ lạnh), `drg_wings` mọc cánh, `drg_slayer` hiệp sĩ săn rồng, `drg_dream` | `drg_greed` → `drg_hoard` (dựng kho / chia) → `drg_thief`; `drg_debt` → `drg_clan` (trả / đi bắt / gạch tên) → `drg_hunt_kin` |
| Cơ Nhân | `cst_light` lần đầu mở mắt (người đúc), `cst_plate` tấm biển số hiệu (mục đích, đẩy quỹ đạo), `cst_maker` người đúc già, `cst_humid` gỉ ở xứ ẩm, `cst_scrap`, `cst_mother` Lò Đúc Mẹ, `cst_soul`, `cst_twin`, `cst_count` | `cst_worn` → `cst_core` (lõi mới: khỏe, mất ký ức / thay dần / giữ) → `cst_core_after` |
| Người | `hum_hurry` "loài người làm gì cũng vội", `hum_flood` lũ đồng bằng, `hum_crowd` chợ phiên thành lớn | |

Chủ đề mới: `stranger` (Xa tộc, bị nhìn khác, lặp 3) và `clan` (Nợ, thù của tộc, lặp 4). Nút dùng sẵn chủ đề cũ: lũ, mạch nước, đàn bò không về, máu lạnh, gỉ là `hardship`; Cơn Gầm Lớn là `war`; áo vảy, người tình Yêu Tinh là `romance`. `ad_fae_sleep` (ngủ quên bảy năm trong trảng) giờ không xảy ra với Yêu Tinh.

Tình trạng mới: **Sầu héo** (`grief`, Tiên Tộc mất bạn đời, mất con; × 1,6 tử suất, lành 12%/năm; một nửa số lần chết khi đang Sầu héo là "héo mòn vì sầu"), **Khô vảy** (`dry`, Hải Tộc xa biển; × 1,4, lành 35%), **Máu lạnh** (`torpid`, Long Nhân ở xứ lạnh; × 1,3, lành 50%). Khô vảy và tiếng mòng biển đặt cờ muốn đi (`migrateQ`).

## 4. Kết quả đo

`sim.html`, 1000 đời, thế giới `can-bang`, 17/10/2026; so với bản trước (HEAD `6aaa5c6`) cùng seed.

| | Trước | Sau |
|---|---|---|
| Trận quá Tier + 1 | 0 | 0 |
| Trỗi dậy | 19,6% | 18,2% |
| Chết vì quái (đời đầu) | 10,5% | 10,0% |
| Sự kiện đời người thuộc mạch | 47,0% | 47,1% |
| Bộ Xương chưa được nhận làm dân gặp nút cần danh phận | 0 | 0 |
| 60 đời, tắt đếm (cùng máy, đo một lần, nhiễu lớn) | 13,7 giây | 8,0 giây: không chậm hơn |

Trỗi dậy, chết vì quái lệch trong khoảng nhiễu của 1000 đời (chuỗi ngẫu nhiên đổi vì có thêm sự kiện); tuổi thọ từng giống loài cũng vậy (Tiên Tộc 33 đời, Hải Tộc 7 đời: mẫu quá nhỏ để so).

**Phần sự kiện của riêng tộc** (đời đầu, người sống; mẫu số gồm cả sự kiện của mạch truyện, người quen, chừng 30% mỗi đời):

| Giống loài | Đời | Của riêng tộc | Đổi giọng | Hay gặp nhất |
|---|---|---|---|---|
| Người | 427 | 3,0% | 1,1% | lũ đồng bằng, "loài người làm gì cũng vội" |
| Người Thú | 249 | 18,2% | 9,8% | đời thường, thay lông, kẻ săn da, theo đàn |
| Orc | 160 | 17,3% | 9,6% | đời thường, vết sẹo, kẻ bị bẻ nanh, giá máu |
| Người Lùn | 47 | 16,7% | 10,3% | đời thường, trời quá rộng, bím râu, quỵt nợ |
| Yêu Tinh | 36 | 15,5% | 11,1% | đời thường, người phàm xin giúp, sứ giả hai đình |
| Tiên Tộc | 33 | 22,1% | 12,0% | đời thường, tròn trăm tuổi, Mộng Rừng, Sầu héo |
| Cơ Nhân | 27 | 26,9% | 6,0% | đời thường, kẻ trộm phụ tùng, tấm biển số hiệu |
| Long Nhân | 14 | 15,1% | 11,2% | đời thường, lột vảy, hiệp sĩ săn rồng |
| Hải Tộc | 7 | 18,0% | 10,2% | đời thường, Khô vảy, kéo người chết đuối |

Trước bước này phần của riêng tộc là 0–7%. Thêm phần đổi giọng thì một phần tư tới một phần ba sự kiện của người không phải loài người mang chất của tộc; phần còn lại là chuyện chung (cướp đường, thuế, con cái, quái tràn làng) và mạch truyện. Đo 54 đời ép giống loài (6 đời mỗi loài) trước khi thêm sự kiện đời thường: 6–14%; đời thường kéo lên gần gấp đôi.

**Lựa chọn** (mỗi 1000 đời, chế độ tự động): giá máu 31 trả, 69 ra vòng, 22 không trả; con đầu đàn 54 thách, 60 đứng sau; Sổ Thù 31 ghi, 1 bỏ qua (11 đòi được); kẻ thù cũ quay lại 29 thắng, 39 thua; cơn nhập thần 14 kiệt tác, 7 phát điên; Đình Hạ 24, Đình Đông 4; giao kèo 6 ký ức, 9 vàng, 10 không công; thay lõi 6 lõi mới, 6 thay dần, 11 giữ; Kẻ Diệt 2 lời thề. Sầu héo xảy ra 37 lần ở 33 đời Tiên Tộc nhưng không ai chết "héo mòn vì sầu" trong lần đo này (chạy riêng 30 đời Tiên Tộc: 1).

Cổng chặn: nút riêng của một tộc bị chặn với tộc khác là chuyện thường nên không đếm (`js/tree.js`); cổng giống loài giờ xét trước cổng thân thể. Còn đếm: `ad_fae_sleep` không xảy ra với Yêu Tinh (620 lần lọc), `ch_river` với Hải Tộc.

## 5. Còn để lại

- Hải Tộc, Long Nhân, Tiên Tộc, Cơ Nhân, Yêu Tinh ít dân ở thế giới thử (7–36 đời mỗi 1000 đời): quyết định của các tộc này (áo vảy, tiếng hát gọi tàu, lòng tham rồng, danh dự thị tộc) mỗi 1000 đời chỉ vài lần; muốn đo chắc phải chạy ép giống loài.
- Sự kiện của mạch truyện, người quen (`cm_*`, `st_*`, `fr_*`…, chừng 30% sự kiện) chưa đổi giọng theo tộc.
- Mới đổi giọng tám sự kiện chung; còn nhiều câu "như người" ở `events.js`, `edu.js` (thử thiên phú ở nhà thầy cúng đầu làng, đồng bạc dưới chân cầu…). Thêm vào `G.RACE_VOICE` khi gặp.
- Lời thề Kẻ Diệt chưa đổi cách đánh (không bật Liều mạng vì luật "không trận nào quá Tier + 1"); Sầu héo, Khô vảy, Máu lạnh chỉ đổi tử suất, chưa đổi sức.
- Hải Tộc bỏ áo vảy, Người Lùn đi chuộc lỗi, Long Nhân mọc cánh chưa có hệ quả lâu dài ngoài cờ (`flags.cloak`, `flags.slayer`, `flags.wings`).
- Không đổi phần thế giới nên chưa chạy Thử thế giới động, Thử 100 thế giới.

## Nguồn

- Dwarf Fortress, cơn nhập thần: https://dwarffortresswiki.org/index.php/Strange_mood, phát điên: https://dwarffortresswiki.org/index.php/Insanity
- Warhammer, Sổ Thù và Kẻ Diệt: https://1d6chan.miraheze.org/wiki/Book_of_Grudges, https://1d6chan.miraheze.org/wiki/Dwarfs_(Warhammer_Fantasy)
- Khajiit, hình dáng theo tuần trăng: https://en.uesp.net/wiki/Lore:Khajiit
- *Tam Lin*: https://tam-lin.org/versions/39A.html
- Selkie: https://en.wikipedia.org/wiki/Selkie; *Nàng tiên cá*: https://en.wikipedia.org/wiki/The_Little_Mermaid; siren: https://en.wikipedia.org/wiki/Siren_(mythology)
- *La Belle Dame sans Merci*: https://en.wikipedia.org/wiki/La_Belle_Dame_sans_Merci; vòng nấm: https://en.wikipedia.org/wiki/Fairy_ring
- Golem: https://en.wikipedia.org/wiki/Golem; con tàu của Theseus: https://en.wikipedia.org/wiki/Ship_of_Theseus; Smaug: https://en.wikipedia.org/wiki/Smaug

Bốn nguồn đầu tra trong phiên này; các trang Wikipedia và các mô típ của Tolkien, D&D, Elder Scrolls (Orsimer, Bosmer), Warcraft, Shadow of Mordor, Eberron, Dragon Age, Skyrim ghi theo hiểu biết chung, chưa mở lại.
