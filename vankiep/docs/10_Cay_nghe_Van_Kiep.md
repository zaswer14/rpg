# Vạn Kiếp: cây nghề riêng, Tier 1 rộng hơn

**Ngày:** 16/10/2026 · **Trạng thái:** đã làm vào mã (`data/jobtree.js`, `js/cult.js` `G.skDir`), kết quả mục 6. · **Đọc kèm:** `09` (danh xưng, độ hiếm), `08` mục 3 (kỹ năng theo nghề), thư viện nghề `../../shared/README.md`.

Người dùng nói (16/10/2026): lên Tier giờ khó hơn nhiều nên Tier 1 cần rộng hơn; đánh lại nghề cho đúng định nghĩa Tier; có thể tra cứu thêm nghề (ví dụ Tier 1 giờ đã có nghề kỵ sĩ).

## 1. Chỗ lệch của cây cũ

Cây cũ là cây của thư viện nghề chung, thiết kế cho Skeleton Codex (platformer: ít nghề nhập môn, nhiều ngọn). Với tháp của `09` thì:

- **Tier 1 quá hẹp.** Mỗi chủng tộc chỉ 5–6 nghề Tier 1 (một nghề mỗi trường phái, Dã thú và Tử thuật không có), trong khi 27% đời người chơi dừng ở Tier 1 và Chức Nghiệp Giả là 3% dân. Một nước ~13 000 Chức Nghiệp Giả mà chỉ có sáu nghề.
- **Nghề thường nằm ở tầng tinh anh.** Vệ Binh, Thợ Săn, Sơn Tặc ở Tier 2 (Siêu Phàm Giả, 0,3% dân); Lính Đánh Thuê của Nhân Loại ở Tier 3 (Siêu Việt Giả, ~20 người mỗi tỉnh). Tu Sĩ (võ tăng) trùng tên với sinh kế Tu sĩ.
- **Tên không theo bậc.** Thiện Xạ (Tier 2) nghe cao hơn Xạ Thủ (Tier 3); Thuật Sĩ, Nghệ Nhân, Kẻ Rình Rập là tên Tier 3 nhưng nghe như nghề thường.
- **Không có đường kỵ sĩ thường.** Mọi nghề kỵ sĩ là ngọn Tier 3–4 (Thánh Kỵ Sĩ, Kỵ Sĩ Kinh Hoàng, Long Kỵ Sĩ…).

## 2. Tra cứu

| Nguồn | Nghề nhập môn | Lấy được gì |
|---|---|---|
| Ragnarok Online | Tập sự → 6 nghề một (Kiếm sĩ, Pháp sư, Cung thủ, Tu sĩ, Thương nhân, Đạo tặc); mỗi nghề một tách hai thành 12 nghề hai (Kỵ sĩ, Thập tự quân, Thợ săn, Thi sĩ, Phù thủy, Hiền giả, Mục sư, Võ tăng, Thợ rèn, Nhà giả kim, Sát thủ, Kẻ cướp) | Kỵ sĩ ở bậc hai. Mỗi nghề trên một tầng có hai lối ra. |
| Tree of Savior (sau 2019) | 5 nghề gốc (Kiếm sĩ, Pháp sư, Cung thủ, Tu sĩ, Trinh sát); từ nghề gốc chọn gần như mọi nghề cùng nhánh ở lần chuyển đầu | Nhiều nghề cùng tầng, chọn rộng; nghề súng, dao găm gom về Trinh sát. |
| Tây huyễn Trung Quốc; Crossgate (魔力宝贝) | Kỵ sĩ có thang: kiến tập, chính thức, cung đình, sư phạm, đại sư; thánh kỵ sĩ là kỵ sĩ của giáo hội | Một nghề có thể đi qua nhiều bậc với tên nâng dần: Kỵ Sĩ → Trọng Kỵ Sĩ → Kỵ Sĩ Đoàn Trưởng. |
| Xã hội trung cổ | lính giáo, lính nỏ, kỵ sĩ, thợ săn, trinh sát, thầy lang, người giữ mộ, thầy đồng, đô vật, khổ tu, thuần thú, phù thủy làng | Nghề có danh phận trong làng, thành: hợp với "Chức Nghiệp Giả là người có nghề được xã hội công nhận". |

Rút ra: Tier 1 là **nghề có danh phận**, đủ rộng để mỗi trường phái có 2–3 lối vào; Tier 2 trở lên là bậc tinh anh của từng nghề, tên nâng theo bậc.

## 3. Cách làm: lớp riêng của Vạn Kiếp

Thư viện nghề (`shared/trunk.js`, `races/`, `faiths.js`) không đổi, vì Skeleton Codex đọc nó và cân theo nó. Vạn Kiếp thêm **lớp đè** `data/jobtree.js` (`G.JOB_TREE`), truyền vào `JobLibrary.compose({ overlay })` (tùy chọn mới của `shared/compose.js`; không truyền thì kết quả như cũ). Lớp đè có ba phần:

- `add`: nghề mới, cùng dạng mục trong `trunk.js`.
- `set`: đổi trường của nghề có sẵn (tên) và `addFrom` (thêm tiền nhiệm).
- `displayNames`: tên hiển thị riêng theo chủng tộc (Bộ Xương có tên kế thừa cho vài nghề).

Kỹ năng gate của nghề mới là kỹ năng tạm `<id>#g1`, `#g2`, có tên ở `data/skills.js`. Mastery yêu cầu chỉ dùng mastery của trường phái nghề đó, để chủng tộc bị cấm trường phái khác vẫn vào được (Kỵ Sĩ không đòi Cưỡi thú vì Người Lùn, Cơ Nhân bị cấm Dã thú).

## 4. Nghề thêm

### 4.1. Tier 1 (13 nghề, vào thẳng từ xuất thân)

| Trường phái | Có sẵn | Thêm | Lên Tier 2 |
|---|---|---|---|
| Chiến đấu | Chiến Binh | **Lính Giáo** (Thương 10), **Kỵ Sĩ** (Kiếm 10) | Lính Giáo → Cận Vệ; Kỵ Sĩ → Kiếm Sĩ, Trọng Kỵ Sĩ |
| Tầm xa | Cung Thủ | **Lính Nỏ** (Nỏ 10), **Thợ Săn** (Cung 10) | Lính Nỏ → Xạ Thủ; Thợ Săn → Thợ Săn Quái, Thú Sư |
| Bóng tối | Đạo Tặc | **Trinh Sát** (Ẩn thân 10), **Sơn Tặc** (Dao găm 6, Rìu 6) | Trinh Sát → Sát Thủ; Sơn Tặc → Cường Đạo |
| Huyền thuật | Tập Sự Pháp Thuật | **Phù Thủy Làng** (Huyền thuật 10) | → Pháp Sư Nguyên Tố |
| Tử thuật | (không có) | **Người Giữ Mộ** (Tử linh 8), **Thầy Đồng** (Linh hồn 8) | → Pháp Sư Tử Linh; → Linh Môi |
| Chế tác | Thợ Chế Tác | **Thầy Lang** (Luyện kim 10) | → Luyện Kim Sư |
| Võ thuật | Võ Sĩ | **Đô Vật** (Thân thể 10), **Khổ Tu** (Tâm linh 10) | → Luyện Thể Sư; → Võ Tăng |
| Dã thú | (không có) | **Thuần Thú Sư** (Thuần thú 10) | → Thợ Săn Quái, Thú Sư |

Tử thuật có Tier 1 riêng nên đi tử thuật không còn phải qua Tập Sự Pháp Thuật (Huyền thuật), vốn bị nhiều chủng tộc cấm. Nhân Loại bị cấm Tử thuật nên không thấy hai nghề đó.

### 4.2. Tier 2, Tier 3: đường kỵ sĩ, đường thú

| Nghề | Tier | Từ | Lên tiếp |
|---|---|---|---|
| **Trọng Kỵ Sĩ** (Thương 25, Kiếm 15) | 2 | Kỵ Sĩ | Kỵ Sĩ Đoàn Trưởng; Thánh Kỵ Sĩ (Quang Minh) |
| **Thú Sư** (Thuần thú 30, Cưỡi thú 15) | 2 | Thuần Thú Sư, Thợ Săn | Kỵ Thú |
| **Kỵ Sĩ Đoàn Trưởng** (Thương 50, Kiếm 35) | 3 | Trọng Kỵ Sĩ | Thống Soái; Long Kỵ Sĩ (Long Nhân) |

Đường kỵ sĩ đủ năm bậc: Kỵ Sĩ (Chức Nghiệp Giả) → Trọng Kỵ Sĩ (Siêu Phàm Giả) → Kỵ Sĩ Đoàn Trưởng (Siêu Việt Giả) → Thống Soái hoặc ngọn chủng tộc (Thủ Hộ Giả) → ngọn Tier 5.

## 5. Đổi tên, thêm lối lên

| Nghề (id) | Tier | Tên cũ | Tên mới | Thêm lối lên từ |
|---|---|---|---|---|
| guard | 2 | Vệ Binh | **Cận Vệ** | Lính Giáo |
| duelist | 2 | Kiếm Sĩ | | Kỵ Sĩ |
| marksman | 2 | Thiện Xạ | **Xạ Thủ** | Lính Nỏ |
| hunter | 2 | Thợ Săn | **Thợ Săn Quái** | Thợ Săn, Thuần Thú Sư |
| assassin | 2 | Sát Thủ | | Trinh Sát |
| bandit | 2 | Sơn Tặc | **Cường Đạo** | Sơn Tặc |
| elementalist | 2 | Pháp Sư Nguyên Tố | | Phù Thủy Làng |
| medium | 2 | Linh Môi | | Thầy Đồng |
| necromancer | 2 | Pháp Sư Tử Linh | | Người Giữ Mộ |
| alchemist | 2 | Luyện Kim Sư | | Thầy Lang |
| shaper | 2 | Kẻ Nắn Thân | **Luyện Thể Sư** | Đô Vật |
| monk | 2 | Tu Sĩ | **Võ Tăng** | Khổ Tu |
| sniper | 3 | Xạ Thủ | **Thiện Xạ** | |
| stalker | 3 | Kẻ Rình Rập | **Ảnh Hành Giả** | |
| warlock | 3 | Thuật Sĩ | **Ma Đạo Sư** | |
| artificer | 3 | Nghệ Nhân | **Đại Kỹ Sư** | |
| sellsword (Nhân Loại) | 3 | Lính Đánh Thuê | **Đoàn Trưởng Dong Binh** | |
| beast_rider | 3 | Kỵ Thú | | Thú Sư |
| paladin (Quang Minh) | 3 | Thánh Kỵ Sĩ | | Trọng Kỵ Sĩ |
| marshal | 4 | Thống Soái | | Kỵ Sĩ Đoàn Trưởng |
| dragon_knight (Long Nhân) | 4 | Long Kỵ Sĩ | | Kỵ Sĩ Đoàn Trưởng |

Tên cũ Thợ Săn, Sơn Tặc nhường cho nghề Tier 1 mới. Bộ Xương có tên kế thừa riêng nên đổi theo: Cường Đạo Hầm Mộ, Ảnh Hành Giả Bóng Tối, Thiện Xạ Xương, Đại Kỹ Sư Xương, Thợ Săn Quái Hầm Mộ.

Số nghề mỗi chủng tộc (Tier 0 / 1 / 2 / 3 / 4 / 5, không tính nghề tín ngưỡng, nghề ẩn):

| Chủng tộc | Trước | Sau |
|---|---|---|
| Nhân Loại | 1 / 6 / 12 / 12 / 5 / 4 | 1 / 17 / 14 / 13 / 5 / 4 |
| Tiên Tộc | 1 / 5 / 10 / 11 / 7 / 4 | 1 / 15 / 12 / 12 / 7 / 4 |
| Người Lùn | 1 / 6 / 11 / 12 / 7 / 4 | 1 / 17 / 12 / 13 / 7 / 4 |
| Orc | 1 / 6 / 10 / 11 / 7 / 4 | 1 / 18 / 12 / 12 / 7 / 4 |
| Người Thú | 1 / 5 / 9 / 11 / 5 / 4 | 1 / 16 / 11 / 12 / 5 / 4 |
| Yêu Tinh | 1 / 5 / 9 / 9 / 5 / 4 | 1 / 15 / 10 / 9 / 5 / 4 |
| Hải Tộc | 1 / 5 / 9 / 11 / 6 / 2 | 1 / 14 / 11 / 12 / 6 / 2 |
| Long Nhân | 1 / 5 / 10 / 12 / 7 / 4 | 1 / 14 / 12 / 13 / 7 / 4 |
| Cơ Nhân | 1 / 5 / 8 / 8 / 8 / 4 | 1 / 13 / 9 / 9 / 8 / 4 |
| Bộ Xương | 1 / 6 / 12 / 13 / 10 / 5 | 1 / 19 / 14 / 14 / 10 / 5 |

Hình cây giờ là cái tháp như tháp dân số: rộng nhất ở Tier 1, hẹp dần lên trên.

Danh sách kỹ năng của xuất thân (Tier 0) dài ra vì chứa cặp gate của mọi nghề Tier 1 vào được: Nông Dân của Nhân Loại có 34 kỹ năng (trước 12). Người chơi vẫn chỉ nâng được 10, nên chọn được tối đa năm hướng đi ở Tier 0.

## 6. Kết quả (16/10/2026)

**Chế độ tự động phải chọn được nghề mới.** Lần chạy đầu với cây mới, máy luôn chọn nghề đứng đầu danh sách trong cùng trường phái: Chiến Binh 26% số người Tier 1–3, Lính Giáo, Kỵ Sĩ, Lính Nỏ, Thợ Săn, Thầy Lang, Đô Vật, Khổ Tu đều 0 người. Sửa `G.skDir` (`js/cult.js`): trong cùng trường phái với hướng đi, điểm = mastery yêu cầu đã gần đạt + **độ hợp với đời này** (`G.JOB_TREE.lean`: thợ săn đi Thợ Săn, người chăn nuôi đi Thuần Thú Sư, người từng đi lính đi Lính Giáo hoặc Lính Nỏ, quý tộc đi Kỵ Sĩ, thầy thuốc đi Thầy Lang, tu sĩ đi Khổ Tu hoặc Thầy Đồng, trộm đi Sơn Tặc…) + một độ lệch riêng của mỗi đời (băm tên và số kiếp). Chọn xong thì giữ suốt Tier đó (`S.flags.dir`), chỉ chọn lại khi đường đó không còn mở; trẻ chưa có sinh kế thì chưa giữ. Quyết định thử thách chuyển nghề đưa nghề theo hướng đi lên đầu, chế độ tự động chọn đúng nghề đó.

1000 đời, thế giới `can-bang`, chế độ tự động:

| Đo | Trước cây mới (`09` mục 9) | Sau | Mục tiêu |
|---|---|---|---|
| Trận vượt Tier + 1 | 0 | 0 (62 327 trận) | 0 |
| Chết vì quái | 10,3% | 9,5% | ~10% |
| Tháp Tier 0–5 | 57,7 / 29,6 / 8,0 / 4,1 / 0,5 / 0,1% | 57,1 / 28,6 / 10,1 / 3,8 / 0,3 / 0% | 60 / 27 / 10 / 2,5 / 0,5 / 0,05% |
| Chênh sức với max Tier trước | 0,72–0,95 | 0,67–1,03 | ≥ 0,7 |

Nghề cuối đời (người trưởng thành ở Tier 1–3, 375 đời):

| Tier 1 | Đời | Tier 2 | Đời | Tier 3 | Đời |
|---|---|---|---|---|---|
| Chiến Binh | 63 | Cận Vệ | 24 | Kiếm Hào | 9 |
| **Thuần Thú Sư** | 39 | **Thú Sư** | 21 | Vệ Quân Khiên Thương | 8 |
| Thợ Chế Tác | 34 | Kiếm Sĩ | 14 | Bác Sĩ Dịch Hạch | 4 |
| **Trinh Sát** | 28 | Luyện Kim Sư | 12 | Ảnh Hành Giả | 4 |
| **Lính Giáo** | 28 | Kỹ Sư | 6 | **Kỵ Sĩ Đoàn Trưởng** | 3 |
| **Thầy Lang** | 18 | Pháp Sư Nguyên Tố | 4 | Cuồng Chiến (Orc) | 2 |
| **Kỵ Sĩ** | 14 | Xạ Thủ | 4 | Thạch Vệ, Đại Kỹ Sư, Kỵ Thú, Ma Đạo Sư | 1 mỗi nghề |
| **Người Giữ Mộ** | 6 | Sát Thủ | 2 | | |
| **Phù Thủy Làng** | 5 | Linh Môi | 1 | | |
| **Thầy Đồng** | 4 | **Trọng Kỵ Sĩ** | 1 | | |
| Cung Thủ | 4 | | | | |
| Võ Sĩ, **Thợ Săn**, **Khổ Tu** | 3 mỗi nghề | | | | |
| Đạo Tặc | 1 | | | | |

Nghề mới chiếm 148 / 253 người Tier 1 (58%). 15 / 19 nghề Tier 1 có người đi; Lính Nỏ, Sơn Tặc, Đô Vật chưa ai đi trong 1000 đời này vì hướng đi Tầm xa, Bóng tối, Võ thuật hiếm ở chế độ tự động (chí hướng ít khi chọn các trường phái đó), không phải do cây. Đường kỵ sĩ đi trọn tới Tier 3 (3 Kỵ Sĩ Đoàn Trưởng).

## 7. Để lại

- Nghề Tier 1 mới chưa gắn với sinh kế: Thầy Lang chưa tăng thu nhập của sinh kế thầy thuốc, Thợ Săn chưa gắn với sinh kế thợ săn, Kỵ Sĩ chưa gắn với tước Hiệp sĩ của thang thăng tiến. Bước B, C (`07` mục 7) nên nối.
- Trang Duyệt Cây Nghề (thư viện chung) không hiện lớp đè; lớp đè hiện ở tab Sức mạnh của trang Duyệt Nội Dung Vạn Kiếp.
- Nghề Tier 1 mới chưa có ngọn riêng theo chủng tộc (Kỵ Sĩ Sói của Orc, Thầy Đồng của Tổ Linh Đạo…); khi có thì thêm vào `add` với trường `race`.
- Lính Nỏ, Sơn Tặc, Đô Vật chưa có người đi ở chế độ tự động (mục 6). Nếu muốn thì cho chí hướng hoặc sinh kế đẩy mạnh hơn vào các trường phái đó.
- `G.skDir` giờ giữ hướng đã chọn (`S.flags.dir`); bản lưu cũ chưa có trường này thì chọn lại một lần.

## Nguồn tra cứu

- Ragnarok Online, nghề một, nghề hai, chuyển sinh: https://strategywiki.org/wiki/Ragnarok_Online/Jobs
- Tree of Savior, năm nghề gốc sau bản dựng lại 2019: https://www.gameskinny.com/tips/the-ins-and-outs-of-tree-of-saviors-class-system-for-new-players/
- Crossgate (魔力宝贝), thang kỵ sĩ kiến tập → đại sư: https://wiki.biligame.com/bluecg/%E9%AA%91%E5%A3%AB
