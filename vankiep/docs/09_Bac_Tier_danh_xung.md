# Vạn Kiếp: bậc Tier, danh xưng, độ hiếm

**Ngày:** 16/10/2026 · **Trạng thái:** người dùng đã chốt (mục 8, 16/10/2026); đã làm vào mã, kết quả mục 9. Danh xưng chốt: **Phàm Nhân, Chức Nghiệp Giả, Siêu Phàm Giả, Siêu Việt Giả, Thủ Hộ Giả, Huyền Thoại Giả** (bộ B, mục 2.2). · **Sửa:** `08` mục 7.3 (Tier), mục 9 (tháp mục tiêu); `07` mục 4.3 (địa vị) đọc theo bảng mục 6.4 ở đây. Phần còn lại của `08` (kỹ năng, level, người dạy, sức) giữ nguyên trừ chỗ mục 6 ghi.

Người dùng nói (16/10/2026):

- Tier 0 là **chưa vào nghề**. Tier 1 gọi là **Chức Nghiệp Giả**, Tier 2 là **Siêu Phàm Giả**. Tier 3 trở lên: Claude tra cứu, gợi ý tên.
- Vào được Tier 1 đã khó (max 10 kỹ năng không dễ).
- Tier 2 mạnh áp đảo Tier 1, là tầng tinh anh.
- Tier 4 là chiến lực hàng đầu của một quốc gia.
- Tier 5 là huyền thoại, chỉ số ít: thường mỗi chủng tộc chỉ 1–2 người.

Bản hiện tại (`08` mục 12.1) cho tháp đời người chơi 36,7 / 28,0 / 17,6 / 11,4 / 4,7 / 1,6% (Tier 0 → 5): 63% đời vào được nghề, cứ 60 đời có một Tier 5. Hai Tier liền nhau chênh sức khoảng 1,3, nhưng người max level Tier 1 (sức 2,28) chỉ kém người vừa vào Tier 2 (2,72) có 0,44, tức thắng 80%. Cả hai chỗ đều xa ý người dùng.

## 1. Tier 0 là chưa vào nghề

Nghề Tier 0 của thư viện (Nông Dân, Thợ Rèn, Ngư Dân…) không còn là "nghề" theo nghĩa chức nghiệp. Chúng là **xuất thân**: quyết định 12 kỹ năng Tier 0 người đó luyện được và cặp gate vào Tier 1 nào gần tay. Mã giữ nguyên (nghề gốc vẫn là một mục trong `S.job`), chỉ đổi cách gọi:

- Thẻ nhân vật: "Chưa vào nghề · xuất thân Nông Dân · Level 6 / 10" thay cho "Nông Dân · Tier 0 · Level 6".
- 10 kỹ năng Tier 0 là con đường vào nghề. Max đủ 10 và qua thử thách thì thành Chức Nghiệp Giả.
- Đề xuất gọi chung người Tier 0 là **Phàm Nhân** (dân thường dùng chữ này để chỉ người chưa có nghề). Bàn Long dùng chữ này cho bậc thấp nhất nên người đọc quen. Người dùng chưa đặt tên Tier 0, đây chỉ là gợi ý (mục 8).

## 2. Danh xưng Tier 3–5

### 2.1. Tra cứu

| Nguồn | Thang | Lấy được gì |
|---|---|---|
| Truyện Tây huyễn mạng Trung Quốc (西幻, kiểu chương trên Khởi Điểm) | Sơ cấp chức nghiệp giả → Trung cấp → Cao cấp → **Đại sư cấp** (大师级) → **Truyền Kỳ** (传奇) → Cao giai Truyền Kỳ | "Chức Nghiệp Giả", "Siêu Phàm Giả" (超凡者) người dùng chọn đều từ dòng này. Truyền Kỳ là mốc tách hẳn: người thường gọi là huyền thoại. |
| Bàn Long (盘龙, kiểu đã chọn ở `07` mục 2.1) | Chiến sĩ cấp 1–9 → **Thánh Vực** (圣域) → Thần cấp | Thánh Vực sống gần như vô hạn, cả đại lục chỉ vài người, một đế quốc có một hai người là chống được nước khác. |
| Quỷ Bí Chi Chủ (诡秘之主) | Danh sách 9 → 0; Danh sách 4–3 là **Bán Thần**, 2–1 Thiên Sứ, 0 Chân Thần | Bậc cao được gọi bằng tầm vóc (thần, thiên sứ), không còn là tên nghề. |
| D&D 5e, bốn tầng chơi (Dungeon Master's Guide 2014) | Anh hùng một vùng (1–4) → Anh hùng của vương quốc (5–10) → **Chúa tể vương quốc** (11–16) → **Chúa tể thế giới** (17–20) | Đặt tên theo tầm ảnh hưởng: cấp 11–16 quyết được số phận một nước. Khớp với "Tier 4 là chiến lực hàng đầu quốc gia". |

Rút ra hai cách đặt: theo **bậc sức mạnh** (Đại Sư, Thánh Vực, Truyền Kỳ) hoặc theo **tầm vóc trong xã hội** (anh hùng một vùng, trụ cột một nước, huyền thoại của cả tộc). Tier 1–2 người dùng đã chọn theo dòng thứ nhất ("… Giả").

### 2.2. Ba bộ tên

| Tier | Bộ A: Tây huyễn, nối Bàn Long (đề xuất) | Bộ B: giữ đuôi "Giả" | Bộ C: theo tầm vóc |
|---|---|---|---|
| 0 | Phàm Nhân | Phàm Nhân | Phàm Nhân |
| 1 | Chức Nghiệp Giả | Chức Nghiệp Giả | Chức Nghiệp Giả |
| 2 | Siêu Phàm Giả | Siêu Phàm Giả | Siêu Phàm Giả |
| 3 | **Đại Sư** (大师): bậc thầy của một ngành, đủ sức mở trường, dẫn một đạo quân | **Siêu Việt Giả** (超越者): vượt qua giới hạn của người | **Anh Hùng**: danh tiếng cả một vùng, kể trong ca dao |
| 4 | **Thánh Vực** (圣域): như Bàn Long, mỗi nước vài người, là con bài cuối của quốc gia | **Thủ Hộ Giả** (守护者): người giữ nước, triều đình phong làm hộ quốc | **Quốc Trụ**: trụ cột của một nước |
| 5 | **Huyền Thoại** (传奇, Truyền Kỳ) | **Huyền Thoại Giả** | **Huyền Thoại** |

Lý do Claude đề xuất bộ A (người dùng chọn bộ B):

- Đọc liền một mạch, mỗi bậc một hình ảnh khác nhau. Bộ B có "Siêu Phàm" rồi "Siêu Việt", hai chữ đầu giống nhau dễ lẫn.
- **Thánh Vực** là chữ người đọc Bàn Long nhớ nhất, và nghĩa của nó trong truyện (mỗi đế quốc một hai người, chiến lực cuối của quốc gia) khớp đúng Tier 4.
- **Đại Sư** là bậc trên tinh anh trong thang Tây huyễn. Chữ này cũng dùng cho cao tăng, nên trong câu chữ có thể ghép theo trường phái để rõ nghĩa: "Đại Sư kiếm thuật", "Đại Sư tử thuật". Nếu không thích thì thay bằng **Tông Sư** (nhưng chữ này gợi tông môn, Varen không có tông môn) hoặc **Siêu Việt Giả** của bộ B.
- Bộ C hợp cách D&D chia tầng chơi, nhưng "Anh Hùng" là lời khen hơn là bậc: một Siêu Phàm Giả cứu làng cũng được gọi là anh hùng.

Ghép được giữa các bộ (ví dụ A cho Tier 3, B cho Tier 4: Đại Sư, Thủ Hộ Giả, Huyền Thoại).

Danh xưng dùng chung cho mọi trường phái. Câu chữ có thể thêm trường phái hoặc nghề phía sau ("Siêu Phàm Giả, Kiếm Sĩ"), không tách thang chiến sĩ / ma pháp sư như cảnh giới cũ. Quái dùng cùng thang nếu muốn ("ma thú cấp Thánh Vực"); tên bậc quái của bestiary (`normal`, `elite`, `alpha`, `lord`) không đổi.

## 3. Tháp dân số

Varen có 2–4 triệu người (`05` mục 5), 7 nước ở thế giới `can-bang`, 9 chủng tộc sống (Bộ Xương không tính). Lấy ~3 triệu để tính. Mỗi Tier hiếm hơn Tier dưới khoảng 10 lần, riêng Tier 5 chỉ hiếm hơn Tier 4 khoảng 6 lần vì người dùng đã cho con số (1–2 mỗi tộc):

| Tier | Danh xưng (đã chốt) | Trên 1 triệu dân | Cả Varen (~3 triệu) | Mỗi nước (~430 nghìn) | Hình dung |
|---|---|---|---|---|---|
| 0 | Phàm Nhân | ~967 000 (96,7%) | ~2,9 triệu | | dân thường, có người luyện cả đời mà không qua được |
| 1 | Chức Nghiệp Giả | ~30 000 (3%) | ~90 000 | ~13 000 | lính chính quy, mạo hiểm giả có hạng, thợ có phép; làng 500 dân có chừng 15 người |
| 2 | Siêu Phàm Giả | ~3 000 (0,3%) | ~9 000 | ~1 300 | tinh anh: đội trưởng cận vệ, pháp sư triều đình; thành phố 10 nghìn dân có chừng 30 người |
| 3 | Siêu Việt Giả | ~300 | ~900 | ~130 | tướng quân, hội trưởng, viện trưởng học viện; mỗi tỉnh chừng 20 người |
| 4 | Thủ Hộ Giả | ~25 | ~75 | ~10 | chiến lực hàng đầu quốc gia, ai cũng biết tên |
| 5 | Huyền Thoại Giả | ~4 | ~12 | 0–3 | 1–2 người mỗi chủng tộc, có tộc không có ai |

Tháp này là của **cả dân số**, kể cả người không bao giờ luyện nghiêm túc. Hiện chưa có NPC nào mang Tier thật (trừ sư phụ cao thủ bốc ngẫu nhiên, mục 6.2), nên bảng này dùng để: bốc Tier cho NPC (sư phụ, quan, quý tộc, đối thủ), dựng danh sách Thủ Hộ Giả và Huyền Thoại Giả có tên (mục 6.5), và đặt ngưỡng địa vị (mục 6.4).

## 4. Tháp đời người chơi

Người chơi sống một đời như một người trong số ~3 triệu. Có hai cách hiểu:

| | Cách 1: người chơi là người thường | Cách 2: người chơi là người có chí (đề xuất) |
|---|---|---|
| Ý | Đời người chơi theo đúng tháp dân số mục 3 | Người chơi luôn là người theo đuổi tu luyện (Luyện tập, đi săn, tìm thầy), nên dễ lên hơn dân trung bình; thế giới vẫn chỉ có số ít cường giả |
| Tier 5 | 1 trong 250 000 đời: coi như không bao giờ | khoảng 1 trong 2 000 đời |
| Mặt tốt | Đúng sổ sách nhất | Vẫn chơi được nội dung Tier 3–5 (khu, quái, địa vị), nhưng lên Thủ Hộ Giả đã là chuyện lớn của một đời |
| Mặt xấu | 97% đời không vào nổi nghề; khu và quái Tier 3–5 gần như không ai thấy | Tháp đời và tháp dân lệch nhau, phải ghi rõ trong mã (NPC bốc theo mục 3, người chơi đo bằng sim) |

Mục tiêu đề xuất cho cách 2 (cuối đời, người sống tới tuổi trưởng thành, 1000 đời chế độ tự động):

| Tier | Hiện nay (`08` mục 12.1) | Mục tiêu mới | Gấp tháp dân |
|---|---|---|---|
| 0 Phàm Nhân | 36,7% | ~60% | |
| 1 Chức Nghiệp Giả | 28,0% | ~27% | ×9 |
| 2 Siêu Phàm Giả | 17,6% | ~10% | ×33 |
| 3 Siêu Việt Giả | 11,4% | ~2,5% | ×80 |
| 4 Thủ Hộ Giả | 4,7% | ~0,5% | ×200 |
| 5 Huyền Thoại Giả | 1,6% | ~0,05% (1 / 2 000) | ×120 |

1000 đời thì Tier 5 thường ra 0–2 đời, số đo nhiễu. Đo Tier 4–5 bằng 5 000 đời, hoặc đo xác suất qua từng cửa (Tier 3 lên 4, 4 lên 5) thay cho đếm cuối đời.

Núm để đạt: giá kỹ năng Tier 0 cao hơn hoặc luyện ngoài giờ ít hơn (cửa vào Tier 1 khó), người dạy Tier 3–5 hiếm hơn (mục 6.1), thử thách chuyển nghề Tier 3 → 4 → 5 khó hơn (`08` mục 7.2: hạ trần 0,95 của tỉ lệ qua ở Tier cao).

## 5. Khoảng cách sức giữa hai Tier

Trận đánh: `pWin = 1 / (1 + e^(−3,2 × chênh sức))`. Chênh 0,7 thắng 90%, chênh 1 thắng 96%, chênh 1,5 thắng 99%.

"Tier 2 áp đảo Tier 1" đo bằng chênh sức giữa người **vừa vào Tier t + 1** và người **ở max level Tier t**: mục tiêu ≥ 0,7 (thắng ≥ 90%). Bản trước: 2,72 − 2,28 = 0,44 (thắng 80%).

Sức vẫn giữ thang Tier (vừa vào Tier t thì sức khoảng t + 0,4 đến t + 1), vì nhiều chỗ trong mã so sức với Tier: quái, thử thách chuyển nghề, hang ổ, di tích, thách đấu ngôi vua, câu chữ "Sức bạn 2,8 Tier". Muốn Tier sau áp đảo thì **phần lớn sức phải đến từ cú nhảy lúc lên Tier**, còn 10 level trong một Tier chỉ cộng ít.

### 5.1. Thăng hoa và trần chỉ số (người dùng chốt 16/10/2026)

Người dùng chọn thăng hoa, thêm trần chỉ số:

- **Thăng hoa:** vào Tier t thì cả sáu chỉ số cộng `G.ASCEND[t]` (chốt bằng sim, mục 9).
- **Trần chỉ số theo Tier** (`G.STAT_CAP`): trong một Tier, chỉ số không vượt trần của Tier đó. Max kỹ năng vẫn có thưởng, nhưng phần vượt trần **được giữ lại**, chưa dùng được: tới một mức thì không chuyển nghề là không lên chỉ số nữa.
- **Lên Tier thì trần nâng:** phần dư của Tier trước tự cộng vào. Trần mỗi Tier cao hơn Tier trước một khoảng bằng thăng hoa cộng 5, nên phần dư được cộng tối đa 5 mỗi chỉ số; dư nhiều hơn thì vẫn chờ Tier sau nữa.
- Máy làm: chỉ số thô (`G.statsRaw`) = nền chủng tộc + thưởng kỹ năng + thăng hoa các Tier đã vào; chỉ số dùng được (`G.statsOf`) = min(thô, trần); phần dư `G.statOver`. Không thêm trạng thái vào bản lưu: thăng hoa suy từ Tier nghề.
- Hiện: thẻ nhân vật ghi phần dư bằng số nhỏ cạnh chỉ số; chạm max level thì nhật ký báo "Chỉ số chạm trần 47 (Lực dư 3), lên Tier mới được cộng"; qua thử thách thì "Bạn trở thành Kiếm Sĩ, một Siêu Phàm Giả. Thăng hoa: cả sáu chỉ số +14. Phần chỉ số dồn nén ở Tier trước được cộng: Lực +3."
- Hệ số kỹ năng đang lắp giảm (`G.CULT.skillPow` 0,1 → 0,05, nhân `1 + 0,5 × Tier` thay cho `Tier + 1`) để thay kỹ năng Tier cũ bằng kỹ năng Tier mới không cộng nhiều trong một Tier.

### 5.2. Cộng hưởng chiêu thức (người dùng thêm 16/10/2026)

Người dùng: "thêm việc cộng hưởng chiêu thức (với cùng nghề thì dễ cộng hưởng, ví dụ thân pháp phối hợp đúng giúp tăng khả năng công né)".

Mỗi kỹ năng có một **loại** theo mastery: công (kiếm, rìu, tay không, dao, giáo, cung, nỏ, súng, ném), thân pháp (lẩn, cưỡi), thủ (khiên, thân thể), phép (lửa, băng, sét, bí thuật, tử linh, linh hồn, nguyền), trợ (giả kim, cơ giới, chế tạo, bẫy, thuần thú, linh thể). Id có chữ dash, step, roll, dodge… là thân pháp; guard, block, brace, parry, shield… là thủ.

Hai kỹ năng **đang lắp** hợp nhau thì thành một cặp cộng hưởng (`G.RESONANCE`):

| Cộng hưởng | Hai kỹ năng | Thêm gì ngoài sức |
|---|---|---|
| Công né | công + thân pháp | chạy thoát khi thua +6% |
| Công thủ | công + thủ | nguy cơ chết khi thua −12% |
| Pháp thủ | phép + thủ | nguy cơ chết khi thua −12% |
| Pháp né | phép + thân pháp | chạy thoát +6% |
| Liên chiêu | cùng mastery (× 0,8) | |
| Trợ chiến | trợ + loại khác (× 0,6) | |
| Đồng môn | hai kỹ năng của cùng một nghề, không thuộc cặp nào ở trên (× 0,5) | |

Sức của một cặp = `G.CULT.resPow` (0,01) × hệ số trên × độ hợp × (Tier thấp hơn của cặp + 1) × bậc thấp hơn / 5. **Độ hợp: cùng nghề 1, cùng trường phái 0,6, khác trường phái 0,3**: cùng nghề dễ cộng hưởng nhất, và cặp nào cùng nghề cũng ít nhất thành Đồng môn. Mỗi kỹ năng chỉ vào một cặp (ghép tham lam theo sức). Chạy thoát cộng tối đa 25%, giảm chết tối đa 40%.

Tự lắp giờ xét cả cộng hưởng: lấy kỹ năng hiệu quả nhất, rồi đổi từng chỗ nếu tổng sức (kỹ năng + cộng hưởng) cao hơn. Bảng kỹ năng trên thẻ nhân vật hiện các cặp đang có. Sức từ cộng hưởng nhỏ (Tier 5 lắp đủ 6 kỹ năng cùng nghề, ba cặp: khoảng +0,18); phần đáng kể là chạy thoát và ít chết.

Quái giữ thang cũ (`threat` = Tier quái + bậc, cỡ, số con, affix). Luật "không trận nào vượt Tier + 1" giữ nguyên. Quái Tier t + 1 giờ nguy hiểm hơn hẳn với người Tier t (chênh sức âm), đúng ý Tier sau áp đảo Tier trước.

## 6. Hệ quả cho phần đã làm

### 6.1. Người dạy (`08` mục 5)

Một nước chỉ ~10 Thủ Hộ Giả và 0–3 Huyền Thoại Giả thì không thể ai cũng có thầy Tier 4–5:

| Nguồn | Trước | Đã làm |
|---|---|---|
| Phường hội, đoàn lính đánh thuê, quân ngũ, Hiệp Hội | Tier 2 cho mọi thành viên, người từng đi lính, Hiệp Hội từ hạng Bạc | Tier 2 chỉ cho người **giữ chức** từ quản sự trong một hội và người **đang tại ngũ** (đo mục 9: 3 năm nghĩa vụ là có thầy Tier 2 cả đời; thợ săn chạm danh vọng 100 rất nhanh nên hạng Hiệp Hội không nói được ai giỏi; nên Siêu Phàm Giả quá đông) |
| Học viện cao cấp ngành Võ bị / Pháp thuật | Tier 4 | Tier 4 chỉ khi học ở kinh đô (`E.capital`); nơi khác Tier 3 như học viện cao cấp thường |
| Nhà quý tộc | Tier 3; từ Bá tước Tier 4 | Tier 3; từ Hầu tước Tier 4 (nhà lớn mướn một Thủ Hộ Giả về dạy) |
| Hoàng tộc | Tier 5 | Tier 4 (Thủ Hộ Giả của triều đình) |
| Sư phụ cao thủ | Tier 3–5 bốc đều | Tier 2–4 (mục 6.2); sau này gặp Huyền Thoại Giả có tên trong danh sách (mục 6.5) |
| **Ngộ đạo** (mới) | | Tier 5: Thủ Hộ Giả max level mỗi năm có `G.CULT.enlight` × tốc độ tu luyện × (0,5 + Hiểu biết / 100) cơ hội tự ngộ |
| Kỳ ngộ (`cv_ring`, bước E) | Tier 5 | giữ, khi làm bước E |

Không ai dạy được Huyền Thoại Giả: đường lên Tier 5 là tự ngộ (hoặc kỳ ngộ ở bước E). Thủ Hộ Giả sống gấp đôi người thường nên có nhiều năm để ngộ, vì thế tỉ lệ mỗi năm rất nhỏ.

### 6.2. Sư phụ cao thủ (`js/edu.js` quyết định `mentor`)

Trước bốc đều Tier 3–5 (`X.int(3, 5)`): một phần ba số cao thủ để ý tới người chơi là Huyền Thoại Giả. Giờ (`G.MENTOR_TIER`): Tier 2 75%, Tier 3 20%, Tier 4 5%, không có Tier 5. Cao thủ Tier 2 vẫn có ích cho người chưa vào nghề hay Chức Nghiệp Giả.

### 6.3. Thọ nguyên (`07` mục 4.4)

Giữ × (1 + 0,12 × Tier) như trước thì Huyền Thoại Giả người sống ~99 tuổi. Bàn Long cho Thánh Vực sống gần như vô hạn. Người dùng chọn tách bậc cao: Tier 4 × 2, Tier 5 × 3 (`G.LIFE_F` = 1 / 1,12 / 1,24 / 1,36 / 2 / 3; Huyền Thoại Giả người ~186 tuổi, tiên tộc khoảng 900 năm, đủ để cả tộc chỉ có một người qua nhiều đời).

### 6.4. Địa vị (bước B, `07` mục 4.3)

Tier 1 giờ đã hiếm (3% dân) nên thân phận chính danh nên bắt đầu từ Tier 1, không đợi Tier 2:

| Tier | Thân phận đề xuất |
|---|---|
| 1 Chức Nghiệp Giả | được ghi tên vào sổ: miễn thuế đầu người, miễn lao dịch; nước quản chặt bắt đăng ký và triệu tập khi chiến tranh; sàn thu nhập phân vị 0,35 |
| 2 Siêu Phàm Giả | được mời làm cung phụng, hộ vệ cho nhà quý tộc, hội, nước; đủ để làm quan tỉnh, trưởng thành phố; sàn 0,6 |
| 3 Siêu Việt Giả | tướng lĩnh, Đại thần, hội trưởng, viện trưởng; kế tước Bá tước trở lên; sàn 0,8 |
| 4 Thủ Hộ Giả | nước nào cũng muốn giữ: phong tước, đất; nước khác coi như một đạo quân; sàn 0,93 |
| 5 Huyền Thoại Giả | đứng ngoài luật của một nước; vua chúa phải đối đãi ngang hàng |

Bảng này thay cách đọc "cấp r thành Tier ⌈r / 2⌉" ở `08` mục 7.3. Số cụ thể chốt ở bước B.

### 6.5. Danh sách Thủ Hộ Giả, Huyền Thoại Giả (đề xuất, làm sau)

Để "mỗi tộc 1–2 Huyền Thoại Giả" là sự thật trong thế giới chứ không chỉ là con số: thế giới động (`W.dyn`) giữ danh sách NPC Tier 4–5 có tên, chủng tộc, trường phái, nước. Họ sinh ra, già đi, chết, có người thay; danh sách sống qua các kiếp như sử biên niên. Dùng cho: sư phụ Tier 4–5 thật (mục 6.1), sự kiện ("Thủ Hộ Giả của nước láng giềng tử trận ở biên giới", "một Huyền Thoại Giả xuất thế"), chiến tranh (nước có Thủ Hộ Giả mạnh hơn), người chơi lên Tier 4–5 thì vào danh sách và được cả Varen biết tên. Đây là một hệ con mới, cần tab duyệt riêng khi làm.

### 6.6. Cách hiện

- Thẻ nhân vật: dòng Nghề "Kiếm Sĩ · Siêu Phàm Giả"; Tier 0 là "Chưa vào nghề · xuất thân Nông Dân". Dòng Level "27 / 30 · Siêu Phàm Giả (Tier 2)". Sáu chỉ số: chạm trần thì gạch chấm dưới số, phần dư hiện bằng số nhỏ (di chuột xem trần). Bảng kỹ năng có dòng "Cộng hưởng: Công né (A + B) +0,03 · …".
- Nhật ký: qua thử thách "Vượt qua. Bạn trở thành Kiếm Sĩ, một Siêu Phàm Giả. Thăng hoa: cả sáu chỉ số +14. Phần chỉ số dồn nén ở Tier trước được cộng: Lực +3."; chạm max level "Level 30, đỉnh của Siêu Phàm Giả. Chỉ số chạm trần 47 (Lực dư 3), lên Tier mới được cộng. Có thể thử vào …"; ngộ đạo là một dòng `big`.
- Quyết định thử thách chuyển nghề, sư phụ cao thủ ghi danh xưng của Tier đích, của sư phụ.
- Chữ "Tier n" vẫn giữ ở khu săn, quái, `sim.html`, trang duyệt (có kèm danh xưng).

## 7. Việc đã làm trong mã (16/10/2026)

| File | Đổi |
|---|---|
| `js/cult.js` | `G.TIER_NAME`, `G.tierName`, `G.jobLine`; `G.ASCEND`, `G.STAT_CAP`, `G.statsRaw`, `G.statsOf` (chặn trần), `G.statOver`, `G.statCap`; `G.LIFE_F` (thọ nguyên); cộng hưởng `G.skKind`, `G.RESONANCE`, `G.resonance`, `G.resOf`, tự lắp xét cộng hưởng; `S.sk[k].j` (nghề dạy kỹ năng); kết quả chỉ số, tự lắp, sức nhớ theo dấu của S (`memo`, không ghi vào bản lưu); người dạy mới (`vo`, `phap` chỉ ở kinh đô, `noble3` từ Hầu tước, `royal` Tier 4, `enlight` Tier 5), `G.isCapital`; ngộ đạo trong `G.cultYear`; `G.SK_COST`, `G.SK_MCOST`, `G.CULT` (`statPow`, `skillPow`, `skTier`, `powBase`, `resPow`, `overW`, `enlight`) |
| `js/life.js` | `power` đọc `G.CULT.powBase`; trận đánh: cộng hưởng cộng chạy thoát, giảm nguy cơ chết; quái Tier + 1 trong bảng gặp quái × `G.CULT.overW` |
| `js/events.js` | `promote`: danh xưng, thăng hoa, phần dư được cộng; `G.PROMOTE_CAP` (trần tỉ lệ qua theo Tier đích); danh vọng khi vào Tier 4–5 lớn hơn |
| `js/edu.js` | `G.MENTOR_TIER`, `G.mentorTier` (cao thủ Tier 2–4); học viện cao cấp ghi `E.capital` lúc tốt nghiệp |
| `js/ui.js`, `style.css` | thẻ nhân vật theo mục 6.6 |
| `sim.html` | bảng Tier có danh xưng, mục tiêu mới, cột qua cửa và chênh với max Tier trước |
| `review/content-*.html` | tab Sức mạnh: danh xưng, tháp dân và tháp đời, thăng hoa, trần chỉ số, cộng hưởng, thọ nguyên, trần tỉ lệ qua |

Danh xưng là của Vạn Kiếp, không đưa vào `shared/` (Skeleton Codex có thang Tier riêng). Bản lưu không đổi phiên bản: thăng hoa suy từ Tier nghề, `j` của kỹ năng cũ tự tìm lại khi cần.

## 8. Người dùng đã chốt (16/10/2026)

1. **Danh xưng:** Phàm Nhân, Chức Nghiệp Giả, Siêu Phàm Giả, **Siêu Việt Giả, Thủ Hộ Giả, Huyền Thoại Giả** (bộ B).
2. **Tháp đời người chơi:** cách 2, người có chí (mục 4).
3. **Áp đảo:** thăng hoa, kèm trần chỉ số theo Tier (phần vượt giữ lại tới Tier sau) và **cộng hưởng chiêu thức** (cùng nghề dễ cộng hưởng; thân pháp phối hợp đúng thì công né tốt hơn) (mục 5).
4. **Thọ nguyên:** Tier 4 × 2, Tier 5 × 3.
5. Danh sách Thủ Hộ Giả, Huyền Thoại Giả có tên trong thế giới động (mục 6.5): chưa hỏi, để sau.

## 9. Kết quả làm vào mã (16/10/2026)

Số chốt bằng sim (1000 đời, thế giới `can-bang`, chế độ tự động; bảy lần chạy):

| Núm | Trước (`08` mục 12.1) | Chốt |
|---|---|---|
| `G.SK_COST` (điểm rèn mỗi kỹ năng, Tier 0–5) | 260 / 450 / 900 / 1 500 / 2 200 / 3 000 | 480 / 2 000 / 3 200 / 4 000 / 5 000 / 6 000 |
| Mastery theo điểm rèn | theo `G.SK_COST` | theo giá cũ (`G.SK_MCOST`), để tay nghề lúc max level không vọt theo giá mới |
| `G.ASCEND` (thăng hoa) | | +13 / +14 / +15 / +16 / +17 (Tier 1–5) |
| `G.STAT_CAP` (trần chỉ số) | | 10 / 28 / 47 / 67 / 88 / 110 |
| `statPow`, `skillPow`, `skTier`, `powBase` | 0,12; 0,1; 1; 1,05 | 0,05; 0,05; 0,5; 1,25 |
| `resPow` (cộng hưởng) | | 0,01 |
| `overW` (quái Tier + 1 trong bảng gặp quái) | 0,5 | 0,3 |
| `enlight` (ngộ đạo mỗi năm) | | 0,0015 |
| `G.PROMOTE_CAP` (trần tỉ lệ qua, Tier đích 1–5) | 0,95 | 0,95 / 0,9 / 0,8 / 0,6 / 0,4 |

Lần chạy cuối:

| Đo | Kết quả | Mục tiêu |
|---|---|---|
| Trận vượt Tier + 1 | 0 (58 556 trận) | 0 |
| Trỗi dậy | 19,0% | ~20% |
| Chết vì quái | 10,3% | ~10% |
| Kẹt vĩnh viễn | 0% | ≈ 0 |
| 1000 đời headless | 160 giây | (trước 117–166) |

| Tier | Đời | Mục tiêu | Qua cửa | Ở max level | Sức lúc vào | Sức ở max level | Chênh với max Tier trước |
|---|---|---|---|---|---|---|---|
| 0 Phàm Nhân | 57,7% | 60% | | 3% | 1,15 | 1,31 | |
| 1 Chức Nghiệp Giả | 29,6% | 27% | 42% | 26% | 2,03 | 2,40 | 0,72 |
| 2 Siêu Phàm Giả | 8,0% | 10% | 30% | 35% | 3,33 | 3,66 | 0,92 |
| 3 Siêu Việt Giả | 4,1% | 2,5% | 37% | 67% | 4,61 | 5,19 | 0,95 |
| 4 Thủ Hộ Giả | 0,5% | 0,5% | 12% | 75% | 5,97 | 6,42 | 0,78 |
| 5 Huyền Thoại Giả | 0,1% (1 đời) | 0,05% | 20% | | 7,53 | 7,99 | 1,11 |

"Qua cửa" là số đời tới Tier ≥ t chia số đời tới Tier ≥ t − 1. Chênh ≥ 0,7 ở mọi Tier: người vừa vào Tier sau thắng người max level Tier trước ≥ 90%. Trong một Tier sức chỉ tăng 0,15–0,6 (trần chỉ số chặn lại).

Nguồn dạy lúc lên Tier (đếm trên đời trưởng thành): Tier 2 nhờ sư phụ cao thủ 34, chức trong hội 23, quan chức 21, học viện kinh đô 11, học viện trung cấp 7, đang tại ngũ 6; Tier 3 nhờ chức trong hội 12, quan chức 8, học viện kinh đô 7, sư phụ 6; Tier 4 nhờ học viện kinh đô 4, nhà từ Hầu tước 1; Tier 5 nhờ ngộ đạo 1.

Đường đi tới số chốt:

- Hệ số cũ của chỉ số (0,12) cộng thăng hoa làm mỗi Tier mạnh hơn Tier trước ~2,9 sức, Huyền Thoại Giả 2,9% đời. Hạ hệ số về thang Tier (sức vẫn đọc được như "Tier", vì quái, thử thách, hang ổ, thách đấu ngôi đều so sức với Tier).
- Tăng giá kỹ năng gần như không hẹp được Tier 2: ai max Tier 1 là qua ngay. Đo nguồn dạy lúc lên Tier 2 thì 133 / 190 người nhờ nguồn "phường hội, quân ngũ, Hiệp Hội": 3 năm nghĩa vụ là có thầy Tier 2 cả đời, thợ săn chạm danh vọng 100 rất nhanh nên hạng Hiệp Hội không phân biệt ai giỏi. Siết nguồn này (mục 6.1) thì Tier 2 từ 15% xuống 8%.
- Phàm Nhân ở max level yếu hơn trước (1,07 so với 1,34) nên chết vì quái lên 13,5%; nâng `powBase` lên 1,25 và giảm quái Tier + 1 thì về 10%.

Chỗ lệch, để lại:

- **Siêu Việt Giả 4,1%**, trên mục tiêu 2,5%: nguồn dạy Tier 3 từ chức trong hội và quan chức (thêm ở `08` mục 12.1 khi Tier 3 còn thiếu) giờ hơi dư. Núm: bỏ quan chức khỏi nguồn dạy Tier 3, hoặc chỉ tính hội trưởng.
- **Huyền Thoại Giả** 0–3 đời mỗi 1000 đời qua các lần chạy: số nhỏ, muốn đo chắc cần 5 000 đời.
- **Mastery dư +25 đến +47** so với yêu cầu nghề kế tiếp lúc max level (trước +10 đến +23): giá mới làm mỗi Tier dài hơn, săn quái, sinh kế cũng cho mastery suốt thời gian đó. Thử thách chuyển nghề vì thế gần như chắc qua; chỗ nghẽn thật là người dạy.
- Chỉ số mới chỉ vào sức; thăng hoa chưa đổi gì khác (Thể giảm chết, Nhanh chạy thoát… vẫn là việc sau, `08` mục 6.1). Cộng hưởng chỉ có bảy kiểu theo loại kỹ năng; khi kỹ năng có hiệu quả riêng (bước F) thì thêm cộng hưởng theo tên.
- Danh sách Thủ Hộ Giả, Huyền Thoại Giả có tên trong thế giới (mục 6.5) chưa làm; NPC chưa mang Tier theo tháp dân mục 3.
- Hạng cao nhất của Hiệp Hội Mạo Hiểm cũng tên "Huyền Thoại" (`G.ADV_RANKS`), dễ lẫn với Huyền Thoại Giả.

## Nguồn tra cứu

- Thang chức nghiệp giả của một truyện Tây huyễn trên Khởi Điểm (sơ, trung, cao cấp, đại sư cấp, Truyền Kỳ): https://m.qidian.com/chapter/1014229865/465883702/
- Bàn Long, Thánh Vực và Thần cấp: https://mzh.moegirl.org.cn/%E7%9B%98%E9%BE%99
- Quỷ Bí Chi Chủ, con đường phi phàm và Danh sách: https://zh.moegirl.org.cn/%E9%9D%9E%E5%87%A1%E9%80%94%E5%BE%84
- D&D 5e, bốn tầng chơi: https://arcaneeye.com/dm-tools-5e/what-are-the-tiers-of-play-in-dd/
