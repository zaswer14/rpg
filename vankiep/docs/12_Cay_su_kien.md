# Vạn Kiếp: cây sự kiện, quỹ đạo, danh phận

Người dùng yêu cầu ngày 16/10/2026: cấu trúc lại sự kiện thành cây có nhiều nhánh, tránh sự kiện trùng lặp vô lý (ví dụ vừa thành Bộ Xương đã có đệ tử); sự kiện xảy ra phải xét chủng tộc, hoàn cảnh, phương hướng phát triển; phương hướng dựa trên quỹ đạo của nhân vật chứ không do người chơi chọn. Mã: `js/tree.js` (nạp cuối cùng). Bảng đo ở `sim.html` (năm bảng "Cây sự kiện", "Quỹ đạo", "Danh phận", "Bộ Xương: 3 lượt đầu"). Tab "Cây sự kiện" trên trang Duyệt Nội Dung.

## 1. Chuyện cũ

Trước bước này có 81 sự kiện đời người (`G.EVENTS`, sáu file), 90 sự kiện quốc gia (`G.NATION_EVENTS`) và 70 quyết định (`G.DECISIONS`, mười một file). Mỗi cái tự viết điều kiện của mình, nên:

- **Thiếu điều kiện hoàn cảnh.** Bộ Xương bắt đầu ở giai đoạn "trưởng thành" từ lượt đầu nên gặp mọi quyết định của người lớn mà không kiểm thân thể. Đo 120 đời đầu (22 kiếp Bộ Xương) trên bản trước, trong 4 lượt đầu sau khi trỗi dậy: 9 lần có người quỳ xin làm đệ tử, 5 lần vào hội, 17 lần đọc bảng tin Hội Mạo Hiểm, 15 lần nghe "ông bà kể chuyện". 44 trên 70 quyết định không kiểm `undead`. Hải Tộc còn đuối nước khi chơi gần sông.
- **Trùng chủ đề giữa các file.** Ba sự kiện giải đấu (`ad_tourney` → `tournament`, `cv_tourney`), ba sự kiện ra trận (`ad_war`, `cv_levy`, `conscript`), hai sự kiện thuế (`ad_tax`, `law_tax_up`), ba sự kiện bắt nạt, hai sự kiện nhẫn lạ (`ad_trinket`, `cv_ring`), hai đường cưới (`ad_suitor` → `marriage`, `cv_match`), quái tràn vào làng (`ch_raid`, `ad_tide`, `law_raid`) có thể rơi cùng một năm.
- **Không có mạch.** Chỉ vài cặp nối nhau bằng cờ (`ad_suitor` đặt `flags.suitor` thì `marriage` mới mở); không có nhánh, không có chuyện "sau đó thì sao".

## 2. Thiết kế

Năm lớp, cùng một cổng chung bọc quanh mọi sự kiện và quyết định (`js/tree.js` nạp cuối, bọc `c`, `w`, `run` của sự kiện và `when`, `apply` của quyết định). Nút có sẵn ở file khác ghi nhãn vào `G.TREE_META`; nút mới ghi nhãn ngay trên nó (trường `tree`).

### 2.1 Quỹ đạo (`S.traj`)

Mười hướng: Võ, Pháp, Ám, Trí, Nghề, Thương, Đạo, Quyền, Gia, Du. Cuối mỗi năm (hệ con `traj`, chạy sau cùng) cộng vào từ những việc nhân vật thật sự đã làm:

| Nguồn | Vào hướng |
|---|---|
| Thời gian focus trong năm | Luyện tập theo trường phái đang theo (võ, tầm xa, quyền cước → Võ; nguyên tố → Pháp; tử thuật, bóng tối → Ám; chế tác → Nghề; thú → nửa Võ nửa Du); Săn quái → Võ; Phiêu lưu → Võ, Du; Học chữ → Trí; Tu hành → Đạo; Gia đình → Gia; Quản lý → Quyền; Làm ăn theo nghề (`G.WORK_AX`: thương nhân → Thương, trộm → Ám, học giả, thầy thuốc → Trí, thợ, ruộng → Nghề…) |
| Kỹ năng tăng trong năm | theo trường phái của kỹ năng, 10 điểm ≈ 0,3 |
| Hoàn cảnh | giữ chức, có tước → Quyền; vợ chồng, con còn sống → Gia; đạo ≥ 30 → Đạo; Bộ Xương, cấm thuật → Ám; của cải > 4 lần trung vị → Thương; mỗi chuyến đi xa → Du |

Nhớ dần quên: mỗi năm giữ 0,89 phần cũ (nửa đời ~6 năm; loài sống chậm một lượt nhiều năm thì quên theo số năm). Người chơi không chọn quỹ đạo; chí hướng chỉ tác động gián tiếp vì nó đổi focus và nghề. Bộ Xương mang theo một nửa quỹ đạo của hồn, cộng thêm Ám.

Nhãn dùng quỹ đạo:

- `dir: { vo: 2, du: 1 }`: độ hợp = trung bình có trọng số của phần từng hướng; trọng số sự kiện × (0,3 + 2,5 × độ hợp), kẹp 0,3–2,5. Quỹ đạo chưa định hình (trẻ con, tổng nhỏ) thì hệ số tiến dần về 1.
- `dirMin: { am: .3 }`: ngưỡng cứng, dùng cho nhánh chỉ mở với người đi đúng đường.

### 2.2 Danh phận (`G.standing`)

Xã hội người sống biết và nhận bạn tới đâu, 0–4:

| Bậc | Tên | Có được khi |
|---|---|---|
| 0 | Kẻ vô danh | trẻ con; Bộ Xương chưa lộ mặt; Bộ Xương đã lộ ở nước không coi Bộ Xương là công dân |
| 1 | Người có chốn | người lớn (thiếu niên tối đa 1) |
| +1 mỗi mục | Có tiếng trong vùng, trong nước, Danh chấn thiên hạ | danh vọng ≥ 20, ≥ 60, Tier ≥ 2: ba mục này cộng tối đa 2 (danh vọng không phai, về già hơn một phần tư người lớn chạm 100); Tier ≥ 3; có tước, chức, ngai, làm trưởng khu |
| −1 mỗi mục | | bị tộc ruồng bỏ; đang bị truy nã ở nước mình sống |

Bộ Xương đã lộ mặt ở nước có luật "Bộ Xương là công dân" tính như người sống trừ 1. Giới hắc ám (`dark`, 0–3) tính riêng: Bộ Xương từ lượt 1 có 1, cộng khi đủ 3 lượt, theo Hắc Giáo, tử thuật ≥ 30, có tiếng; người sống có `dark` khi theo Hắc Giáo, luyện cấm thuật, làm trộm, tử thuật ≥ 40.

Nhãn `soc: n`: cần danh phận ≥ n. `dark: n`: cần giới hắc ám ≥ n. Có cả hai thì một trong hai là đủ.

| Danh phận | Nút |
|---|---|
| 1 | cưới hỏi (`ad_suitor`, `marriage`, `cv_match`), tiệm rèn `gear`, bảng tin và lệnh treo thưởng, Hiệp Hội nâng hạng, bạn đồng hành, thuế đầu người `ad_tax`, giải đấu (`ad_tourney`, `tournament`, `cv_tourney`), triệu tập (`conscript`, `cv_levy`), dược tề, đăng ký người có cấp, đấu giá, lập làng, vào hội, nhận nhiệm vụ, đoàn đánh thuê, mua tước, thang thăng tiến, theo thầy `mentor` |
| 2 | nhận đệ tử `disciple`, cung phụng, chủ nhà quý tộc để mắt `cv_patron`, trưởng khu, nâng khu, làm quan, dấy binh, quản sự, lập hội, phong tước, đòi ngôi |
| 3 | lập nước, thách đấu giành ngôi |

Quyết định chạy bằng cờ hàng đợi (`retOffer`, `patronQ`, `bounty`, `tourney`, `conscriptQ`) mà bị chặn vì thân thể, giống loài, danh phận thì xóa cờ luôn, để lời mời cũ không bật ra nhiều năm sau.

### 2.3 Thân thể, giống loài, lượt đầu của Bộ Xương

- `body`: `flesh` (thân xác: không Bộ Xương, không Cơ Nhân), `living` (người sống, gồm Cơ Nhân), `undead`. Ví dụ: đau lưng tuổi già, bế cháu cần thân xác; "ông bà kể chuyện" cần người sống.
- `race`, `notRace`: Hải Tộc không đuối nước khi chơi gần sông, không chết đuối vì lật thuyền trong bão (`ch_river`, `ad_sea_storm`).
- Bộ Xương **lượt đầu** chỉ gặp nút có nhãn `fresh` (nhánh trỗi dậy, lữ khách bỏ chạy). `minAge` tính theo lượt kể từ khi sinh hay trỗi dậy: Thánh Kỵ Sĩ, bộ xương khác, đứa bé tặng hoa từ lượt 1; ký ức kiếp trước từ lượt 1; vào làng từ lượt 2; mộ kiếp trước cần đã có ký ức (`need: ['sk_memory']`).

### 2.4 Chủ đề (`G.THEMES`)

Mỗi nút có thể thuộc một chủ đề; một chủ đề chỉ xảy ra một lần trong `gap` lượt, bất kể nút nằm ở file nào. Nút con trong cây được miễn khoảng lặp của chủ đề (lời mời giải đấu rồi đại hội là một mạch, không phải trùng).

| Chủ đề | Lặp | Nút |
|---|---|---|
| Giải đấu | 3 | `ad_tourney`, `tournament`, `cv_tourney` |
| Tình duyên | 2 | `tn_love`, `ad_suitor`, `marriage`, `cv_match` |
| Chiến tranh, lính | 1 | `ad_war`, `cv_levy`, `conscript` |
| Thuế | 3 | `ad_tax`, `law_tax_up` |
| Bắt nạt | 4 | `ch_bully`, `cv_bully_ev`, `cv_bully` |
| Nhận đệ tử | 3 | `disciple`, `sk_acolyte` |
| Học nghề, theo thầy | 2 | `tn_apprentice`, `mentor` |
| Nhẫn lạ | 6 | `ad_trinket`, `cv_ring` |
| Kho báu | 4 | `ad_map`, `ad_map_found`, `map_sell`, `map_fake` |
| Bạn đồng hành | 2 | `ad_companion` và nhánh, `ad_companion_lost` |
| Đạo | 3 | `ad_preacher`, `faith_join`, nhánh sau khi theo đạo |
| Quái, cướp tràn vào làng | 1 | `ch_raid`, `ad_tide`, `law_raid` |
| Cướp đường | 2 | `ad_bandits`, `cv_rob` |
| Thiên tai, mất mùa | 1 | `ch_hunger`, `ad_frost`, `ad_volcano`, `ad_sandstorm` |
| Cờ bạc | 2 | `ad_dice` |
| Bộ Xương vào làng | 2 | `sk_town`, `reveal` |
| Lời mời của bóng tối | 3 | `sk_dark`, `dark_offer`, `cv_forbidden` |
| Mộ kiếp trước | 5 | `sk_grave`, `cv_grave` |
| Ký ức kiếp trước | 2 | `sk_memory` |

### 2.5 Cây

Nút có `from` là con: `'cha'`, `'cha:kết quả'` hoặc `'cha:!kết quả'`, kèm `wait: [min, max]` lượt sau khi cha xảy ra. Kết quả của sự kiện là `o` nó trả về (không có thì lấy `k`: good, bad…), của quyết định là lựa chọn. Ghi ở `S.tree[id] = { t, o, next }`.

- **Một nhánh:** con của cùng một cha loại trừ nhau; nhánh nào xảy ra trước thì cha đóng (`next`). Cha xảy ra lại thì mở lại.
- **Kéo mạch:** con đang mở có trọng số × 3 (`G.TREE.pull`), quá `wait[1]` mà không nhánh nào xảy ra thì mạch tự tắt.
- **Chọn nhánh:** trọng số của từng nhánh đọc quỹ đạo, tính cách, hoàn cảnh; `dirMin` khóa hẳn nhánh không hợp đường.
- **Nối mềm** (`soft`): các cặp có sẵn vẫn chạy bằng cờ như cũ (`ad_suitor` → `marriage`, `ad_tourney` → `tournament`, `ad_bounty_post` → `bounty`, `ad_preacher` → `faith_join`, `ad_restless` → `migrate`, `sk_town` → `reveal`, `sk_dark` → `dark_offer`, `cv_bully_ev` → `cv_bully`, `ad_companion` → `ad_companion_lost`, `ad_map` → `ad_map_found`, `sk_wake_whisper` → `sk_call`). Nối mềm không chặn, không loại trừ; chỉ ghi nhánh và miễn khoảng lặp chủ đề.

## 3. Nhánh mới

| Mạch | Cha | Nhánh | Chọn theo |
|---|---|---|---|
| Hồn mới trỗi dậy | `sk_wake` (lượt đầu, gần như chắc): câu chữ theo kỹ năng kiếp trước (võ, pháp, ám, nghề) | `sk_wake_robber` (kẻ trộm mộ bỏ chạy, để lại tiền), `sk_wake_whisper` (học tên các nấm mồ; nối mềm sang `sk_call`), `sk_wake_tinker` (dựng chỗ ở trong hầm) | kết quả của `sk_wake` |
| Hắc đồ | quyết định `sk_acolyte` (Bộ Xương, giới hắc ám ≥ 2, từ lượt 3, tử thuật ≥ 30 hoặc theo Hắc Giáo) | `sk_acolyte_loyal` (dựng am, mang dầu và tin), `sk_acolyte_betray` (bán chỗ trú cho Giáo hội Quang Minh: bị truy lùng, lộ mặt), `sk_acolyte_lich` (xin làm bất tử) | tính cách hòa đồng, Hắc Giáo, luật Săn Bộ Xương, đạo Quang Minh của vùng; nhánh bất tử cần Ám ≥ 30% và tử thuật ≥ 45 |
| Đệ tử người sống | `disciple` chọn nhận | `dt_proud` (đệ tử mở lớp, nhắc tên thầy), `dt_rival` (mang bút ký đi dựng môn hộ riêng), `dt_fallen` (theo thầy vào khu săn sâu, không về) | hòa đồng; Ám; Võ (`dt_fallen` cần Võ ≥ 20%) |
| Bạn đồng hành | `ad_companion` | `cp_save` (cứu bạn giữa trận), `cp_betray` (ôm túi chung đi), `cp_wed` (thành vợ chồng), `cp_part` (chia tay vì đường đời rẽ khác) | Võ; Ám, Thương; Gia, hòa đồng (thân xác, chưa vợ chồng); Trí, Nghề, Quyền, Thương |
| Tấm bản đồ | `ad_map` | `ad_map_found` (đào được; nối mềm để bản lưu cũ vẫn đào được, cờ `flags.map` giữ ba nhánh loại trừ nhau), `map_sell` (bán cho thương nhân đồ cổ), `map_fake` (nhận ra đồ giả) | Du, Võ và có đi phiêu lưu; Thương; Trí |
| Sau khi theo đạo | `faith_join` (không phải "không theo") | `fa_pilgrim` (hành hương), `fa_doubt` (đọc kinh đạo khác, lung lay), `fa_mission` (mang thư cho giáo đoàn) | Đạo; Trí, Ám, ít mộ đạo; Du, Đạo (cần danh phận 1) |

Nút lẻ mới:

- `sk_scavenge`: Bộ Xương chưa ai nhận (danh phận 0) không vào được tiệm rèn; đồ đến từ chiến trường cũ, mộ lính (trang bị tối đa 2 + 2 × Tier).
- `sk_history`: Bộ Xương nghe lỏm lữ khách kể sử, thay cho "ông bà kể chuyện".
- Quyết định `tournament` ghi tên kinh đô của nước đang sống thay cho "Kinh Đô Aurel" cứng.

## 4. Giao diện

Thẻ nhân vật thêm hai dòng: **Danh phận** (ví dụ "Có tiếng trong vùng · Bóng tối biết tên"; Bộ Xương chưa lộ: "Ẩn mặt") và **Quỹ đạo** (hai, ba hướng mạnh nhất với phần trăm). Di chuột xem giải thích.

## 5. Kết quả đo

`sim.html`, 1000 đời, thế giới `can-bang`, 16/10/2026; so với bản trước (HEAD `d291ed1`) cùng seed.

| | Trước | Sau |
|---|---|---|
| Trỗi dậy | 20,6% | 20,6% |
| Chết vì quái (đời đầu) | 10,4% | 10,4% |
| Trận quá Tier + 1 | 0 | 0 |
| Tier cuối đời 0 / 1 / 2 / 3 / 4 (đời trưởng thành) | 57,4 / 29,5 / 9,5 / 3,4 / 0,1% | 58,8 / 27,3 / 10,4 / 3,0 / 0,5% |
| Nhận đệ tử | 18,7% | 10,7% (cần danh phận 2) |
| Được bầu trưởng khu / ra làm quan / lập làng | 4,6 / 6,6 / 13,5% | 4,8 / 6,1 / 12,0% |
| Học việc thợ lành nghề | 35,4% | ~33% (chung chủ đề với `tn_apprentice`) |
| 1000 đời | | ~140 giây (lớp cổng tốn ~12% mỗi năm khi đo riêng) |

**Bộ Xương.** Trước: 120 đời đầu, 22 kiếp Bộ Xương, trong 4 lượt đầu có 9 lời xin làm đệ tử, 5 lần vào hội, 17 lần đọc bảng tin Hội, "ông bà kể chuyện". Sau: 0 lần Bộ Xương chưa được nhận làm dân gặp nút cần danh phận (`sim.html` kiểm chéo, phải luôn 0). 3 lượt đầu của 206 kiếp: `sk_wake` 98,5%, kẻ trộm mộ 69%, ngọn nến đen 41%, tiếng gọi dưới mồ 38%, đứa bé tặng hoa 26%, đồ của người chết 4%. Cổng chặn nhiều nhất ở Bộ Xương: bảng tin Hội, đệ tử, vào hội, tiệm rèn; ở người sống: đệ tử (danh phận), thuế và giải đấu (chủ đề đang lặp), đau lưng tuổi già của Cơ Nhân (thân thể), lật thuyền của Hải Tộc (giống loài).

**Nhánh** (mỗi 1000 đời, tính cả kiếp Bộ Xương): đồng hành 167 cứu mạng, 60 ôm túi bỏ đi, 37 rẽ đôi, 14 thành vợ chồng (206 nối mềm sang "không trở về"); bản đồ 352 nhận ra đồ giả, 198 bán, 34 đào được; đệ tử 79 thành danh, 71 phản sư, 50 tử trận; theo đạo 40 hành hương, 27 lung lay, 16 mang thư; hắc đồ 114 trung thành, 69 phản bội; trỗi dậy 118 kẻ trộm mộ, 21 dựng chỗ ở, 17 học tên nấm mồ.

**Quỹ đạo giữa đời** (qua tuổi trưởng thành 12 năm, 760 đời): Võ 37%, Nghề 28%, Đạo 11%, Gia 10%, Trí 8%, Ám 2%, Thương 2%, Pháp 1%, Quyền và Du gần 0 (hai hướng này hay là hướng phụ). Chí hướng → hướng mạnh nhất: Phiêu lưu → Võ 89%, Tu hành → Đạo 85%, Tu luyện võ đạo → Võ 66%, Làm giàu → Nghề 53% (Thương 17–22%), Gia đình → Gia 49%, Học vấn → Trí 48%. Lúc chết thì Gia và Quyền lên (tuổi già ở nhà, giữ chức), Nghề xuống.

**Danh phận lúc chết** (đời trưởng thành): 0: 0,5%, 1: 50,5%, 2: 18,9%, 3: 25,8%, 4: 4,4%. Lần đo đầu dùng ngưỡng danh vọng 12 / 35 / 70 cộng thẳng thì 31% chết với "Danh chấn thiên hạ": danh vọng không phai, hơn một phần tư người lớn chạm 100 lúc về già. Đã đổi: danh vọng ≥ 20, ≥ 60 và Tier ≥ 2 cộng tối đa 2, bậc 4 cần Tier 3 hoặc chức tước.

## 6. Còn để lại

- Câu chữ của ~70 sự kiện, ~37 quyết định đời người ở `events.js`, `state.js`, `org.js`, `edu.js`, `noble.js` vẫn chưa có chỗ duyệt; tab Cây sự kiện chỉ hiện nhãn của chúng.
- Danh vọng không phai theo thời gian (`S.fame` chỉ tăng); danh phận dùng ngưỡng để bù. Có thể cho danh vọng phai khi không hoạt động.
- Hướng Du, Quyền, Pháp ít khi mạnh nhất; nút hợp Quyền chưa có (mới có nguồn cộng). Có thể thêm mạch cho người làm quan, người cai trị, pháp sư.
- Sự kiện quốc gia (`G.NATION_EVENTS`) mới qua cổng thân thể và lượt đầu; chưa gán chủ đề (ví dụ `qk_arena` với giải đấu, `tpl_*` về thuế).
- Các cặp có sẵn vẫn là nối mềm qua cờ; nhánh mới đều là nối cứng (`map_sell`, `map_fake`, `cp_*`…). Muốn cặp cũ có nhánh rẽ thì thêm con nối cứng bên cạnh như mạch bản đồ.
- Bản lưu cũ chưa có `S.traj`, `S.tree`: quỹ đạo bắt đầu từ năm tải lại, mạch đang dở (đồng hành, bản đồ) không có cha nên các nhánh mới (`cp_*`, `map_sell`, `map_fake`) không mở cho tới lần sau; nối mềm cũ vẫn chạy.
- Không đổi phần thế giới nên chưa chạy Thử thế giới động, Thử 100 thế giới.
