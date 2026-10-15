# Vạn Kiếp: định hướng mới, xã hội tu luyện

**Ngày:** 15/10/2026 · **Trạng thái:** người dùng đã chốt (mục 8); bước A xong (`js/cult.js`, kết quả mục 4.9), tiếp theo bước B (mục 7). · **Đọc kèm:** `06_Thien_phu_chi_huong.md` (căn cốt, thiên phú, chí hướng), `03` mục 5.8–5.10 (tổ chức, học viện, quý tộc, thăng tiến), luật cấp và kỹ năng của thư viện nghề: `../../platform/docs/06_Skill_Ranks_Level_And_Tier_Gates.md`.

Người dùng đổi định hướng game (15/10/2026):

1. Tu luyện khai mở tiềm năng, nên người tu luyện cao phần lớn có địa vị cao và nắm chức quyền.
2. Vì thế tu luyện lên cao là mục tiêu của đại đa số dân.
3. Ngành nghề xoay quanh hai thứ: phục vụ tu luyện, và sinh kế cơ bản.
4. Ngoại lệ là giới quý tộc: họ thích hưởng thụ xa hoa, nên cần thêm các ngành phục vụ họ.

Phong cách đã chọn: **phương Tây, kiểu Bàn Long, không có tông môn**. Mục 2–3 là tra cứu các bộ truyện khai thác xã hội ma pháp, tu luyện; mục 4–5 là thiết kế cho Varen.

## 1. Hiện trạng trong mã, chỗ lệch với định hướng mới

| Đang có | Lệch ở đâu |
|---|---|
| Cấp 1–60 theo kinh nghiệm (`G.xpNeed`, `addXp`), Tier = cấp / 10 (`G.tierOf`); căn cốt nhân tốc độ (`G.cultRate`) | **Lệch luật chung của thư viện nghề**: ở đó cấp = số kỹ năng đạt bậc 5 (`platform/docs/06` mục 1, `08`, `09`), và chuyển nghề cần max 2 kỹ năng gate của Tier trước. Vạn Kiếp không có kỹ năng từng chiêu, chỉ có 26 mastery 0–100; chuyển nghề xét mastery và một ngưỡng cấp (`G.LEVEL_FOR_TIER`). |
| Tầng lớp `q` 1–5 bốc lúc sinh; phân vị thu nhập `pct` theo nghề | Cảnh giới không đổi địa vị, không đổi thu nhập. Một Tier 4 làm nông vẫn là nông dân nghèo. |
| 15 sinh kế (`G.WORKS`) | Chỉ thầy thuốc, thợ rèn dính tới sức mạnh, và chỉ gián tiếp. Không có nghề bán tài nguyên tu luyện, không có nghề phục vụ quý tộc. |
| Quan tỉnh, Đại thần, thang thăng tiến `G.PROMO`, tước Nam → Công | Chỉ pháp quyền xét Huyền thuật, bộ lạc và hãn quốc xét cấp. Quân chủ phong tước theo công trạng, không hỏi tu vi. |
| Ma lực vùng `magic` 0,3–0,9 | Chỉ nhân trọng số vài sự kiện, bệnh. Không ảnh hưởng tốc độ tu. |
| Tuổi thọ theo chủng tộc (`G.RACES.le`) | Không tăng theo cảnh giới. |
| Một đồng tiền: bạc | Người dùng muốn đồng, bạc, vàng. |
| Đo 1000 đời (docs/06 mục 5): Tier ≥ 3 cuối đời 15,8%, Tier 5 là 8,3% | Nếu cảnh giới quyết định địa vị thì đỉnh tháp quá đông. |

Focus "Tu hành" (`faith`) là tu đạo theo giáo phái, khác tu luyện; giữ nguyên. Focus "Luyện tập" (`train`) là chỗ rèn kỹ năng.

## 2. Tra cứu: truyện khai thác xã hội tu luyện, ma pháp

Chọn những bộ mà xã hội trong truyện vận hành quanh sức mạnh siêu phàm, không chỉ có hệ thống cấp bậc cho nhân vật chính leo. Cột cuối là thứ lấy được cho Vạn Kiếp.

### 2.1. Bàn Long (kiểu đã chọn)

**Bàn Long** (Ngã Cật Tây Hồng Thị) là truyện mạng Trung Quốc nhưng thế giới mang dáng phương Tây: đại lục, đế quốc, vương quốc, quý tộc, học viện ma pháp, giáo hội, không có tông môn.

- **Cấp bậc:** chiến sĩ và ma pháp sư cùng thang cấp 1 → 9, trên đó là Thánh Vực, rồi tới Thần (đã rời thế giới phàm). Ma thú cũng xếp cấp 1–9 và Thánh Vực, nên nhìn cấp là biết ai đánh nổi ai.
- **Lên Thánh Vực** không chỉ nhờ tích lũy mà phải cảm ngộ quy tắc (huyền ảo) của một nguyên tố hay một đạo.
- **Đo thiên phú lúc nhỏ:** trẻ ở trấn được thử tinh thần lực và độ thân hòa nguyên tố; đứa có tư chất được học viện ma pháp danh tiếng nhận.
- **Gia tộc chiến sĩ huyết mạch:** nhân vật chính sinh trong một gia tộc chiến sĩ huyết mạch đã sa sút tới mức phải bán vật gia truyền. Huyết mạch có thể thức tỉnh ở đời sau.
- **Lão sư trong nhẫn:** linh hồn một ma pháp sư cổ đại trú trong chiếc nhẫn, dạy nhân vật chính.
- **Kinh tế:** tiền vàng; ma tinh hạch lấy từ ma thú là hàng quý; sơn mạch ma thú là nơi đoàn lính đánh thuê, mạo hiểm giả kiếm sống.
- **Nghệ thuật cho giới giàu:** tượng điêu khắc của danh gia bán qua phòng trưng bày, đấu giá với giá rất cao. Đây là kiểu nghề vòng 4 (mục 4.6) mà người dùng muốn.
- **Quyền lực:** đế quốc, vương quốc phàm tục cai trị; hai thế lực tôn giáo đối đầu chi phối chính trị đại lục; cường giả Thánh Vực hiếm, đứng ngoài thường lệ, vua cũng phải nể.

### 2.2. Tu tiên, huyền huyễn (Trung Quốc)

| Truyện | Xã hội trong truyện | Lấy cho Vạn Kiếp |
|---|---|---|
| **Phàm Nhân Tu Tiên** (Vong Ngữ) | Nhân vật chính linh căn kém, vào tu tiên qua một môn phái giang hồ phàm tục. Nước phàm nhân là sân sau của tu sĩ; tán tu sống chật vật ở phường thị, giết người đoạt bảo là chuyện thường. Bí cảnh chỉ mở cho người cảnh giới thấp. | Đời "phàm nhân lưu": căn cốt kém vẫn lên được nhờ cẩn trọng và kỳ ngộ. Chợ đen, bí cảnh giới hạn cảnh giới, giết người đoạt bảo. |
| **Đấu Phá Thương Khung** (Thiên Tằm Thổ Đậu) | Thiếu gia thiên tài bỗng thành phế vật, bị từ hôn trước cả gia tộc. Đấu khí đo công khai bằng bia đá. Luyện dược sư hiếm và được trọng hơn cả chiến sĩ cùng cấp, có hội riêng với phẩm cấp. | Lễ đo thiên phú công khai, trope phế vật bị từ hôn, lão sư trong nhẫn. Nghề pha dược là nghề cao quý nhất của vòng phục vụ tu luyện. Đấu giá hội. |
| **Đấu La Đại Lục** (Đường Gia Tam Thiếu) | Trẻ 6 tuổi thức tỉnh võ hồn ở làng; phần lớn võ hồn là công cụ (cuốc, liềm), về làm ruộng. Hồn sư đăng ký với một tổ chức xuyên quốc gia thì được trợ cấp hằng tháng theo cấp. Muốn lên cấp phải săn hồn thú. | Cảnh giới ăn lương; kinh tế săn quái lấy tài nguyên. |
| **Cổ Chân Nhân** (Cổ Chân Nhân) | Sơn trại gia tộc mở khiếu cho thiếu niên 15 tuổi, xếp tư chất Giáp Ất Bính Đinh. Nguyên thạch vừa là tiền vừa là tài nguyên tu luyện. Ai không mở được khiếu thì làm phàm nhân, nô bộc. | Gia tộc chia tài nguyên theo tư chất. Mặt tàn nhẫn của xã hội trọng tu vi. |
| **Nhất Niệm Vĩnh Hằng** (Nhĩ Căn) | Nhân vật chính tu tiên chỉ vì sợ chết, muốn sống lâu. | Động cơ của số đông: cảnh giới cao sống lâu hơn. |
| **Huyền Giám Tiên Tộc** (Quý Việt Nhân) | Một nhà nông dưới chân núi nhặt được bảo vật, truyện đi theo nhiều đời dựng nên một họ tu tiên. | Hợp với Vạn Kiếp: đời sau sống tiếp trong thế giới của đời trước. Gia tộc là thứ người chơi gây dựng qua nhiều kiếp. |
| **Kiếm Lai** (Phong Hỏa Hí Chư Hầu) | Thiếu niên ở trấn nhỏ, tư chất bị hủy từ bé. Thế giới đặt nặng quy củ: tu sĩ mạnh vẫn bị luật và vương triều phàm tục ràng buộc. | Nước quản người tu bằng luật. |

### 2.3. Ma pháp (Nhật, Hàn, Âu Mỹ)

| Truyện | Xã hội trong truyện | Lấy cho Vạn Kiếp |
|---|---|---|
| **Black Clover** (Tabata Yūki) | Vương quốc chia hoàng tộc, quý tộc, thường dân, dân vùng biên; tầng càng cao ma lực càng mạnh. Thiếu niên 15 tuổi nhận ma đạo thư. Nhân vật chính không có ma lực nên bị coi rẻ. | Ma lực và giai cấp tự củng cố nhau qua dòng máu và tài nguyên. |
| **Mahouka Koukou no Rettousei** (Satō Tsutomu) | Trường phép chia học sinh thành "Hoa" và "Cỏ" theo điểm thi đầu vào. Các gia tộc pháp sư lớn có quyền chính trị; pháp sư là tài sản quốc gia, bị nhà nước quản. | Học viện phân hạng theo thiên phú; nước đăng ký và quản người tu. |
| **Mushoku Tensei** (Rifujin na Magonote) | Phép xếp bậc Sơ, Trung, Thượng, Thánh, Vương, Đế, Thần cho từng hệ. Hội Mạo Hiểm hạng F–S. Quý tộc nước Asura xa hoa, đấu đá; có nô lệ. | Quý tộc hưởng thụ sinh ra nghề phục vụ. |
| **The Beginning After the End** (TurtleMe) | Pháp sư xếp theo màu lõi mana, từ đen tới trắng. Sáu pháp sư mạnh nhất là vũ khí của vương quốc. | Đỉnh tháp là vũ khí quốc gia, được triệu khi chiến tranh. |
| **Solo Leveling** (Chugong) | Người thức tỉnh xếp hạng E đến S; xã hội xoay quanh họ: hội săn, đội khai thác ma thạch, người khuân vác, nhà thẩm định. Hạng S là tài sản quốc gia. Người yếu nhất thức tỉnh lại. | Vòng nghề phàm nhân ăn theo người tu. Thức tỉnh lại. |
| **Quỷ Bí Chi Chủ / Lord of the Mysteries** (Ái Tiềm Thủy Đích Ô Tặc) | Phi phàm giả uống ma dược theo Danh sách 9 → 0; công thức nằm trong tay giáo hội, hoàng gia và vài tổ chức; nguyên liệu buôn ở chợ ngầm; dùng sai thì mất kiểm soát. | Ai giữ phương pháp người đó giữ quyền. Đường tắt có giá. |
| **Thả Khai Na Nữ Vu / Release That Witch** (Nhị Mục) | Giáo hội săn phù thủy; một hoàng tử thu nhận họ để làm công nghiệp. | Nước bài xích phép: game đã có luật bắt giữ vì phép. |
| **Cradle** (Will Wight) | Cảnh giới đặt tên theo kim loại, ngọc. Người không có linh hồn tu luyện bị cấm học kỹ thuật của gia tộc, sống như người thừa. | Người không lên nổi cảnh giới đầu bị gạt khỏi gia tộc. |
| **Sousou no Frieren** (Yamada Kanehito) | Kỳ thi pháp sư hạng nhất do hiệp hội tổ chức, đậu thì có đặc quyền. | Chứng chỉ: thi để được công nhận thân phận. |

## 3. Mẫu hình rút ra

| Mẫu hình | Gặp ở | Đưa vào game |
|---|---|---|
| **Đo thiên phú công khai lúc nhỏ** quyết định đời người từ sớm | Bàn Long, Đấu La, Đấu Phá, Cổ Chân Nhân, Black Clover, Mahouka | Lễ thử thiên phú 6–10 tuổi; gốc của trope phế vật. |
| **Cảnh giới là thân phận**: lương, giai cấp, quyền | Bàn Long, Đấu La, Black Clover, Cradle, Solo Leveling | Sàn thu nhập theo cảnh giới, thân phận có luật riêng, chức quan cần cảnh giới (mục 4.3). |
| **Người dạy, tài nguyên nằm trong tay tổ chức** | Bàn Long (học viện, gia tộc), Quỷ Bí, Cổ Chân Nhân | Kỹ năng từ Tier 2 cần người dạy: học viện, sư phụ, gia tộc, giáo hội, hội (mục 4.2). |
| **Nghề phụ trợ có địa vị riêng** | Đấu Phá (luyện dược sư), Solo Leveling (khai thác, thẩm định, khuân vác) | Vòng nghề phục vụ tu luyện (mục 4.6). |
| **Trường thọ là động cơ** | Nhất Niệm Vĩnh Hằng, hầu hết truyện tu tiên | Thọ nguyên theo cảnh giới; tiễn người thân phàm nhân. |
| **Đỉnh tháp là vũ khí quốc gia** | Bàn Long (Thánh Vực), TBATE, Solo Leveling, Mahouka | Nước triệu tập người cấp cao khi chiến tranh. |
| **Gia tộc tự duy trì qua dòng máu, rồi sa đọa vì hưởng thụ** | Bàn Long, Black Clover, Mushoku, Huyền Giám Tiên Tộc | Thiên phú con nghiêng theo cha mẹ; huyết mạch thức tỉnh; quý tộc tiêu tiền vào xa hoa; nhà nhiều đời không ai lên cấp thì mất tước. |
| **Mặt trái**: cấm thuật, giết người đoạt bảo, nước bài xích phép, mất kiểm soát | Phàm Nhân, Quỷ Bí, Release That Witch | Hắc ma pháp (đường tắt bị truy nã), cướp đồ quý, luật cấm phép đã có. |
| **Lối thoát cho người thiên phú kém**: cẩn trọng, nghề phụ, kỳ ngộ, thức tỉnh lại, lão sư | Bàn Long, Phàm Nhân, Solo Leveling, Đấu Phá | Thức tỉnh (`tal_awaken`), tẩy tủy (`tal_break`), kỳ ngộ, linh hồn trong nhẫn. |

## 4. Định hướng mới cho Varen

### 4.1. Kỹ năng, cấp, cảnh giới (người dùng chốt 15/10/2026)

Theo luật chung của thư viện nghề, sửa cho Vạn Kiếp:

- **Kỹ năng.** Mỗi nghề có nhiều kỹ năng. Kỹ năng thuộc một Tier (Tier của nghề dạy nó) và có 5 bậc; đạt bậc 5 là max.
- **Cấp = số kỹ năng đã max, nhưng chỉ tới hạn mức của nghề đang làm.** Kỹ năng max vượt hạn mức không tính vào cấp, chỉ cộng chỉ số (ở Vạn Kiếp là cộng sức mạnh). Hạn mức theo Tier nghề: **2 + 4 × Tier** (nghề gốc 2, Tier 1 là 6, Tier 2 là 10, Tier 3 là 14, Tier 4 là 18, Tier 5 là 22). Muốn cấp tiếp tục tăng thì phải chuyển lên nghề Tier cao hơn.
- **Chuyển nghề** như luật của thư viện: max 2 kỹ năng Tier n − 1, đạt mastery `req` của nghề đích, qua thử thách; thêm điều kiện có người dạy tới Tier n (mục 4.2). Bỏ ngưỡng cấp `G.LEVEL_FOR_TIER`.
- **Cảnh giới kiểu Bàn Long** suy từ cấp: cấp 0–2 chưa nhập cấp; từ đó cứ 2 cấp lên một bậc. Bậc 10 là Thánh Vực, phải đột phá (cảm ngộ huyền ảo), không tự lên.

| Cấp (số kỹ năng tính cấp) | Cảnh giới | Tier (so với quái, khu) | Nghề tối thiểu để đạt |
|---|---|---|---|
| 0–2 | Học đồ (pháp sư) / Phàm nhân (chiến sĩ) | 0 | nghề gốc |
| 3–4 | Cấp 1 | 1 | Tier 1 |
| 5–6 | Cấp 2 | 1 | Tier 1 |
| 7–8 | Cấp 3 | 2 | Tier 2 |
| 9–10 | Cấp 4 | 2 | Tier 2 |
| 11–12 | Cấp 5 | 3 | Tier 3 |
| 13–14 | Cấp 6 | 3 | Tier 3 |
| 15–16 | Cấp 7 | 4 | Tier 4 |
| 17–18 | Cấp 8 | 4 | Tier 4 |
| 19–20 | Cấp 9 | 5 | Tier 5 |
| 21–22 + đột phá | Thánh Vực | 5 | Tier 5 |

Tên gọi theo trường phái chính: Huyền thuật, Tử thuật là **ma pháp sư** ("Ma pháp sư cấp 4"), các trường phái khác là **chiến sĩ** ("Chiến sĩ cấp 4"). Thần chỉ có trong truyền thuyết, không phải bậc chơi được. Ma thú dùng cùng thang: quái Tier t là ma thú cấp 2t − 1 đến 2t.

Vào nghề Tier mới thì cảnh giới chưa nhảy ngay: phải max thêm kỹ năng của nghề mới mới lên bậc. Ngược lại, kẹt ở nghề Tier thấp thì có max bao nhiêu kỹ năng cũng chỉ mạnh thêm chút ít, không lên cảnh giới.

Vạn Kiếp không có danh sách kỹ năng có tên như Skeleton Codex (147 kỹ năng của Bộ Xương trong `platform/skill-system.js`). Bản đầu dùng kỹ năng không tên, tính theo Tier: mỗi Tier có số chỗ (Tier 0–3 mỗi Tier 6, Tier 4 là 5, Tier 5 là 4), kỹ năng Tier thấp học từ trước vẫn tính cấp ở nghề cao hơn. Đặt tên kỹ năng, chia kỹ năng theo nghề là việc sau (bước F).

Máy làm (`js/cult.js`): `S.sk` là 6 mảng bậc kỹ năng (0–5, số thực); `G.lvOf` = min(hạn mức nghề, số kỹ năng max có Tier ≤ Tier nghề); `S.level` giờ là cấp này (0–22), đồng bộ bằng `G.skSync` sau mỗi lần rèn và khi chuyển nghề; `G.tierOf(cấp)` = ⌊(cấp + 1) / 4⌋; sức từ cấp `G.lvPow` = (cấp + 1) / 4 + kỹ năng thừa × 0,04 (tối đa 0,4) + 0,5 nếu Thánh Vực, nên vào Tier t thì sức đúng bằng t như thang cũ (cấp / 10). Bản lưu cũ quy cấp 1–60 thành số kỹ năng max (`G.skMigrate`).

### 4.2. Rèn kỹ năng bằng gì

Mỗi năm, thời gian Luyện tập, săn quái, phiêu lưu, làm nghề, học (mọi chỗ đang gọi `addXp`) thành **điểm rèn**, dồn vào kỹ năng: dưới hạn mức thì kỹ năng Tier thấp nhất còn chỗ (rẻ nhất, tính cấp ngay); chạm hạn mức thì kỹ năng gate của nghề kế tiếp, rồi kỹ năng thừa. Điểm để max một kỹ năng: Tier 0 là 800, Tier 1 là 1 500, Tier 2 là 2 800, Tier 3 là 4 500, Tier 4 là 9 000, Tier 5 là 14 000 (`G.SK_COST`).

**Luyện ngoài giờ** (hệ con `cult`): ai cũng tu, nên mỗi năm từ tuổi thiếu niên có 35 điểm rèn nền và 2 mastery (nhắm vào chỗ nghề kế tiếp còn thiếu); chí hướng Thuận theo tự nhiên, Gia đình × 0,6; tuổi già một nửa; nhân thêm theo tính gan và tính chăm. Nhờ vậy dân thường cũng vào được nghề Tier 1, lên Chiến sĩ cấp 1–2 ở tuổi trung niên.

Điểm rèn = gốc × căn cốt × thiên phú × **ma lực nơi ở** × **tài nguyên**. Thêm một điều kiện về **người dạy**.

- **Ma lực nơi ở:** ma lực của vùng (`magic` 0,3 ở Đồng Kim Hà tới 0,9 ở Vực Hắc Uyên) → × (0,7 + 0,6 × magic), tức ×0,88 tới ×1,24.
- **Người dạy quyết định Tier kỹ năng học được và Tier nghề được nhận** (`G.teachCap`, người dạy Tier c mở tới nghề Tier c). Tự học: Tier 1, nên dừng ở Chiến sĩ cấp 2. Tier 2: học viện trung cấp, phường nghề, đoàn lính đánh thuê, từng đi lính, Hiệp Hội Mạo Hiểm từ hạng Bạc, đệ tử cao thủ Tier 3, tu sĩ Devotion từ 40. Tier 3: học viện cao cấp, đệ tử cao thủ Tier 4, nhà quý tộc (sinh ra hoặc có tước), tu sĩ Devotion từ 75. Tier 4: học viện cao cấp ngành Võ bị hoặc Pháp thuật, nhà từ Bá tước, tu sĩ Devotion từ 95. Tier 5: hoàng tộc, đệ tử cao thủ Tier 5, kỳ ngộ (bước E). Giáo hội chỉ dạy người trong hàng tu sĩ (sinh kế Tu sĩ hoặc nghề tín ngưỡng). Hiệp Hội chỉ dạy tới Tier 2 vì danh vọng của thợ săn, mạo hiểm giả thành công đều chạm 100, hạng Hiệp Hội không phân biệt được ai giỏi hơn.
- **Tài nguyên:** dược tề, ma tinh hạch, mua bằng tiền. Năm nào chi thì rèn nhanh hơn (×1,3–1,6 tùy mức). Nhà giàu cho con dùng từ nhỏ. (Bước B.)
- **Thánh Vực** (quyết định `cv_saint`): đủ 21 kỹ năng tính cấp ở nghề Tier 5 thì mỗi lượt được thử cảm ngộ huyền ảo, 0,05% + Hiểu biết / 25 000 + 0,1% mỗi bậc căn cốt + 0,2% × tính chăm, trong khoảng 0,03–0,5%. Hỏng thì mất 5–14 Sinh lực.
- **Bình cảnh căn cốt** (`tal_break`, docs/06): trước là các mốc cấp 10, 20, …, 50; giờ là lúc chạm mỗi Tier cảnh giới (1 → 5).

### 4.3. Địa vị theo cảnh giới (bước B)

- **Thân phận pháp lý.** Từ cấp 3 (Tier 2) là người có cấp chính danh: miễn thuế đầu người và lệnh nghĩa vụ phàm, nhưng phải đăng ký ở nước quản chặt và bị triệu tập khi chiến tranh. Luật "giấy phép pháp sư" mở rộng thành giấy phép cho mọi người có cấp. Nước có luật bắt giữ vì phép thì ma pháp sư phải giấu mình.
- **Thu nhập.** Sàn phân vị thu nhập theo Tier: Tier 1 ≥ 0,25, Tier 2 ≥ 0,45, Tier 3 ≥ 0,65, Tier 4 ≥ 0,82, Tier 5 ≥ 0,93. Thêm vị trí **cung phụng / hộ vệ riêng** cho nhà quý tộc, hội, nước, cần từ Tier 2.
- **Chức quyền.** Quan tỉnh cần cấp 3, Đại thần cấp 5, trưởng thành phố, kinh đô cần cấp 3. Thang thăng tiến `G.PROMO` cộng cảnh giới vào giá trị xét, trọng số theo chính thể: pháp quyền rất cao; quân quản, bộ lạc, hãn quốc cao; quân chủ, đế chế, triều đình Yêu Tinh, thần quyền, dòng tu vừa; hội đồng, thương nhân thấp.
- **Quý tộc.** Kế tước cần cảnh giới tối thiểu (Nam tước cấp 1, Bá tước cấp 3, Công tước cấp 5). Con trưởng thiên phú kém có thể bị em vượt mặt. Nhà quý tộc ba đời liền không ai lên cấp 3 thì bị giáng tước.
- **Dòng máu.** Căn cốt lúc sinh nghiêng theo cha mẹ; chỉnh để trung bình toàn dân vẫn quanh ×1. Nhà có huyết mạch chiến sĩ (kiểu Bàn Long) có thể thức tỉnh huyết mạch ở đời sau.

### 4.4. Thọ nguyên (đã duyệt)

Tuổi thọ × (1 + 0,12 × Tier cảnh giới). Chiến sĩ cấp 9, Thánh Vực sống gấp 1,6 lần người cùng tộc (người: 62 → khoảng 99). Tu sĩ cao nhìn cha mẹ, bạn đồng niên, vợ chồng phàm nhân già đi trước mình.

### 4.5. Tiền tệ (đã chốt)

Ba đồng tiền: **đồng, bạc, vàng**, 100 đồng = 1 bạc, 100 bạc = 1 vàng. Trong mã vẫn tính một con số theo bạc (`S.gold`, giữ tới 0,01 để có đồng), chỉ đổi cách hiện: `G.coin(n)` in "2 vàng 35 bạc", "40 bạc 50 đồng". Giá nhỏ (tiền ăn, phí qua cầu) giờ ghi được bằng đồng; giá lớn (mua tước, lập thị trấn) ghi bằng vàng.

### 4.6. Kinh tế và nghề: bốn vòng (bước C)

| Vòng | Nghề hiện có | Nghề mới đề xuất | Cầu đến từ đâu |
|---|---|---|---|
| **1. Người có cấp sống bằng sức** | Mạo hiểm giả; Thợ săn đổi thành Thợ săn ma thú (bán ma tinh hạch); Lính canh | Hộ vệ, cung phụng (Tier 2+) | Hội Mạo Hiểm, nhà quý tộc, nước. Thu nhập theo cảnh giới. |
| **2. Phục vụ tu luyện** | Thợ rèn (người có cấp rèn vũ khí ma pháp); Thầy thuốc; Thợ mỏ (mỏ ở vùng ma lực cao thành mỏ ma tinh); Thương nhân | Dược sư (pha dược tề, Tier 1 + Giả kim), Khắc văn sư (khắc ma văn lên đồ, Tier 1 + Huyền thuật), Ma pháp trận sư (Tier 2), Thuần thú sư, Giám định sư, Phu khuân vác vào sơn mạch ma thú (phàm nhân, rủi ro cao), Thợ xẻ và thuộc da ma thú | Số người có cấp quanh đó: học viện, Hội Mạo Hiểm, đoàn lính đánh thuê, doanh trại. |
| **3. Sinh kế cơ bản** | Nông dân, Chăn nuôi, Ngư dân, Tiều phu, Thủy thủ, Tu sĩ (đền), Học giả, Kẻ trộm | | Như hiện nay. Vẫn là nghề của phần lớn dân. |
| **4. Phục vụ quý tộc xa hoa** | | Điêu khắc gia (kiểu Bàn Long), Họa sĩ, thi nhân, Đầu bếp, Thợ may thêu, Thợ kim hoàn, Nghệ nhân (nhạc, múa, kịch), Quản gia, thị tùng, Thợ vườn cảnh, Chủ tửu quán, Gia sư cho con nhà quyền quý | Số nhà quý tộc ở khu (`W.dyn.nobles`, thái ấp `s.fief`), kinh đô. Không có quý tộc thì không có chỗ. |

Vòng 4 nối về mục tiêu chung: người hầu, nghệ nhân lọt mắt xanh chủ nhà có thể được tiến cử vào học viện hoặc được ban dược tề. Tác phẩm của danh gia bán đấu giá được giá rất cao. Quý tộc giận thì đuổi việc, đánh đập, hiếm khi giết.

Trong mã: thêm khóa `ring`, `tier` (cảnh giới tối thiểu), `demand` cho từng nghề trong `G.WORKS`; `G.workOK` đọc thêm.

### 4.7. Tổ chức (không có tông môn)

- **Học viện** (đã có): đường chính để học kỹ năng Tier 2 trở lên; thi đầu vào theo thiên phú (kiểu học viện ma pháp của Bàn Long, phân hạng kiểu Mahouka).
- **Gia tộc quý tộc**: có người dạy và tàng thư riêng; nhà chiến sĩ huyết mạch dạy kỹ năng của dòng họ.
- **Giáo hội**: hai giáo phái lớn Quang Minh, Hắc Giáo (đã có trong `shared/faiths.js`) đóng vai thế lực tôn giáo đối đầu của Bàn Long; dạy kỹ năng theo Devotion.
- **Hiệp Hội Mạo Hiểm, đoàn lính đánh thuê** (đã có): chỗ đứng của người tự do; hạng cao thì có người dạy.
- **Phòng đấu giá, phòng trưng bày** ở thành phố, kinh đô: bán ma tinh hạch, dược tề, tác phẩm nghệ thuật.

### 4.8. Biến thể theo nước và mặt trái

- Nước có luật bắt giữ vì phép: ma pháp sư sống lẩn, bị tố giác. Chiến sĩ vẫn được trọng.
- **Hắc ma pháp, cấm thuật** (đường tắt): rèn nhanh gấp đôi nhờ huyết tế, Tử thuật; mỗi năm có nguy cơ bị phát hiện, truy nã, mất kiểm soát.
- Giết người đoạt bảo: người mang đồ quý hoặc vừa trúng đấu giá bị nhắm; nhân vật cũng có thể nổi lòng tham.
- Người có cấp ức hiếp phàm nhân: xảy ra ở nước quản lỏng.

### 4.9. Kết quả bước A (15/10/2026)

1000 đời, thế giới `can-bang`, chế độ tự động, so với commit `fa72b7f` (trước bước A):

| | Trước | Sau |
|---|---|---|
| Trận vượt Tier + 1 | 0 | 0 (71 870 trận) |
| Trỗi dậy | 20,4% | 21,3% |
| Tử trận trước quái (mọi cái chết) | 11,5% | 10,1% |
| Tuổi già (mọi cái chết) | | 16,8% |
| 1000 đời headless | khoảng 103 giây | 103 giây |

Tháp cảnh giới cuối đời, 877 đời sống tới tuổi trưởng thành (mục tiêu mục 6):

| Tier | Cảnh giới | Sau | Mục tiêu | Trước (300 đời cùng seed, theo Tier cũ) |
|---|---|---|---|---|
| 0 | Phàm nhân / Học đồ | 38,2% | 35% | 51,6% |
| 1 | cấp 1 (15,2%), cấp 2 (13,7%) | 28,8% | 30% | 16,1% |
| 2 | cấp 3 (0,9%), cấp 4 (18%) | 18,9% | 18% | 12,2% |
| 3 | cấp 5 (0,2%), cấp 6 (7,8%) | 8% | 10% | 4,3% |
| 4 | cấp 7 (0,1%), cấp 8 (4%) | 4,1% | 5% | 4,3% |
| 5 | cấp 9 (1,7%), Thánh Vực (0,2%) | 1,9% | 2% | 11,4% |

Người dạy lúc chết: tự học 44%, tới Tier 2 31%, tới Tier 3 11%, Tier 4–5 14% (gồm cả người có lúc sinh: nhà quý tộc, hoàng tộc). Cấp trung bình theo sinh kế: học giả 11, mạo hiểm giả 8,8, lính canh 8,2, thợ săn 7,9, nông dân 2,8.

Chỗ lệch và lý do:

- **Bậc lẻ gần như trống** (cấp 3, 5, 7 dưới 1%). Người ta dồn ở bậc chẵn vì đó là hạn mức của nghề (cấp 2, 4, 6, 8): chạm hạn mức thì phải rèn kỹ năng gate và chờ thử thách chuyển nghề, còn qua bậc lẻ thì nhanh vì sau khi chuyển nghề, kỹ năng thừa tính ngay vào cấp và kỹ năng Tier thấp còn chỗ rèn rất rẻ. Coi như "bình cảnh" của mỗi Tier. Muốn bậc lẻ đông hơn thì rèn kỹ năng của nghề đang làm trước (đã thử: tháp dồn lên cấp 6, khó cân hơn).
- **Đời dài hơn** vì thọ nguyên theo cảnh giới, nên mô phỏng thế giới động chạy nhiều năm hơn; đo 30 đời cùng seed: 1 779 năm thế giới so với 1 491. Tổng thời gian 1000 đời vẫn khoảng 103 giây.
- Các lần chỉnh trước khi ra số trên (đều trên 300 đời): người dạy tới Tier 5 quá dễ có (40%, Thánh Vực 5,4%); Devotion cao mở người dạy cho cả người không đi tu; hạng Hiệp Hội không phân biệt được ai vì danh vọng của thợ săn, mạo hiểm giả thành công đều chạm 100; dân thường thiếu mastery nên kẹt ở nghề gốc. Sửa lần lượt: giáo hội chỉ dạy tu sĩ, Hiệp Hội chỉ dạy tới Tier 2, có luyện ngoài giờ nhắm vào mastery còn thiếu, người dạy Tier c mở tới nghề Tier c.

## 5. Từ đầu truyện thành sự kiện, quyết định

Mã đề xuất có tiền tố `cv_` để khỏi trùng tên quyết định sẵn có (xem nhắc ở `TIEN_DO.md` mục 3).

| Id đề xuất | Lấy từ | Khi nào | Nội dung, lựa chọn |
|---|---|---|---|
| `cv_test` | Bàn Long, Đấu La | 6–10 tuổi, một lần | Lễ thử thiên phú ở đền / trường / gia tộc: tinh thần lực, thân hòa nguyên tố. Bậc căn cốt công khai; Tím trở lên được học viện để mắt. |
| `cv_scorn` | Đấu Phá, Cradle | con nhà quý tộc, căn cốt Trắng–Lục hoặc chưa nhập cấp lúc trưởng thành | Bị từ hôn hoặc gạt khỏi kế tước. Nhẫn nhịn; hẹn ước ba năm; bỏ nhà đi. |
| `cv_ring` | Bàn Long, Đấu Phá | rất hiếm (~1% đời) | Linh hồn lão ma pháp sư trong chiếc nhẫn cổ: dạy kỹ năng tới Tier 5. Có thể là chính người chơi ở một kiếp trước mạnh (đọc mộ cũ). |
| `cv_grave` | trùng sinh | gần mộ kiếp trước có cấp cao | Về mộ của mình: tìm lại di vật, kỹ năng đã giấu. |
| `cv_bloodline` | Bàn Long | nhà có huyết mạch chiến sĩ, thiếu niên, hiếm | Thức tỉnh huyết mạch: căn cốt nhảy bậc, kỹ năng dòng họ. |
| `cv_saint` | Bàn Long | đủ 21 kỹ năng tính cấp ở nghề Tier 5 | Cảm ngộ huyền ảo, thử lên Thánh Vực (bước A). |
| `cv_deviate` | nhiều truyện | luyện cấm thuật, đột phá hỏng | Mất kiểm soát: bệnh mới, giảm Tâm trạng. |
| `cv_academy` | Bàn Long, Mahouka | thiếu niên, thiên phú cao | Học viện danh tiếng ở kinh đô mời nhập học, có học bổng. |
| `cv_tourney` | Mahouka, Đấu La | học viện / đế quốc, vài năm một lần | Đại hội tỉ thí: hạng đầu được ban dược tề, danh vọng. |
| `cv_ruin` | Phàm Nhân | mỗi N năm ở một di tích | Bí cảnh mở chỉ cho người dưới một cấp; tranh bảo vật. |
| `cv_auction` | Bàn Long, Đấu Phá | thành phố, kinh đô | Đấu giá hội: dược tề, ma tinh hạch, vũ khí ma pháp, tác phẩm nghệ thuật. |
| `cv_art` | Bàn Long | nghệ nhân vòng 4 lâu năm | Tác phẩm được phòng trưng bày nhận, bán đấu giá, có khi thành danh gia. |
| `cv_rob` | Phàm Nhân | mang đồ quý, đi đường vắng | Bị phục kích; hoặc gặp người yếu mang bảo vật: cướp hay bỏ qua. |
| `cv_lifespan` | Nhất Niệm Vĩnh Hằng | già, kẹt cảnh giới | Liều đột phá lần cuối; truyền nghề cho con cháu; an phận. |
| `cv_kin` | nhiều truyện | người có cấp cao có người thân phàm nhân già | Tiễn cha mẹ, bạn đồng niên, vợ chồng phàm nhân. |
| `cv_bully` | Black Clover, Kiếm Lai | gặp người có cấp ức hiếp phàm nhân | Là phàm nhân: nhịn hay kháng. Là người có cấp: can hay bỏ qua. |
| `cv_match` | Bàn Long, Black Clover | đến tuổi kết hôn, nhà có tước | Liên hôn để lấy người dạy, tài nguyên; căn cốt con nghiêng theo bên kia. |
| `cv_patron` | Mushoku | làm nghề vòng 4 lâu năm | Chủ nhà để mắt: tiến cử vào học viện, ban dược tề. |
| `cv_mine` | Cổ Chân Nhân, Solo Leveling | thế giới động, tỉnh có ma lực cao | Mỏ ma tinh mới lộ hoặc cạn: các nước tranh nhau; người chơi chọn phe, đi khai thác. |
| `cv_forbidden` | Quỷ Bí | gặp hắc ma pháp sư / kẹt cấp lâu | Học cấm thuật (rèn nhanh, bị truy nã), báo quan, bỏ đi. |
| `cv_reawaken` | Solo Leveling | thập tử nhất sinh, chưa nhập cấp | Thức tỉnh lại: căn cốt nhảy bậc (biến thể của `tal_awaken`). |
| `cv_levy` | Bàn Long, TBATE | nước có chiến tranh, mình có cấp | Lệnh triệu tập: ra trận, nộp tiền miễn, trốn. |
| `cv_license` | Frieren, Mahouka | có cấp ở nước quản chặt | Thi chứng chỉ: đậu thì được đặc quyền. |

## 6. Cân bằng: tháp cảnh giới mục tiêu (chia lại theo mục 4.1)

Người sống tới tuổi trưởng thành, đo cuối đời trên 1000 đời:

| Cảnh giới | Tier | Mục tiêu |
|---|---|---|
| Học đồ / Phàm nhân | 0 | ~35% |
| Cấp 1–2 | 1 | ~30% |
| Cấp 3–4 | 2 | ~18% |
| Cấp 5–6 | 3 | ~10% |
| Cấp 7–8 | 4 | ~5% |
| Cấp 9 | 5 | ~1,7% |
| Thánh Vực | 5 | ~0,3% |

Hiện nay Tier 5 cuối đời là 8,3%. Núm chỉnh: điểm rèn mỗi bậc kỹ năng theo Tier, người dạy cho Tier 2–5, tỉ lệ đột phá Thánh Vực. Giữ các mục tiêu cũ: không trận nào vượt Tier + 1, trỗi dậy ~20%, chết vì quái ~10%.

## 7. Thứ tự làm

Mỗi bước theo cách làm ở `TIEN_DO.md` mục 5 (sim 1000 đời, thử thế giới động, thử 100 thế giới, ghi kết quả) và thêm tab vào trang Duyệt Nội Dung Vạn Kiếp trong cùng lần làm.

| Bước | Nội dung | File chính |
|---|---|---|
| A (xong 15/10/2026) | Kỹ năng 5 bậc, cấp = số kỹ năng max tới hạn mức nghề, cảnh giới cấp 1–9 và Thánh Vực, chuyển nghề theo gate 2 kỹ năng, ma lực nơi ở, người dạy, thọ nguyên, tiền đồng / bạc / vàng; sự kiện `cv_saint`; bảng Cảnh giới trong `sim.html` | `js/cult.js` mới, `life.js`, `events.js`, `talent.js`, `ui.js`, `sim.html` |
| B | Địa vị: sàn thu nhập, thân phận và luật, cảnh giới cho chức quan, `G.PROMO`, kế tước, căn cốt theo cha mẹ, tài nguyên (dược tề); `cv_test`, `cv_scorn`, `cv_license`, `cv_levy`, `cv_bully`, `cv_kin`, `cv_lifespan` | `state.js`, `org.js`, `noble.js`, `talent.js`, `data/nations.js` |
| C | Nghề bốn vòng: khoảng 16 nghề mới, khóa `ring`, `tier`, `demand`; cầu xa hoa theo nhà quý tộc; `cv_patron`, `cv_art` | `data/world.js`, `state.js`, `events.js` |
| D | Học viện, gia tộc, giáo hội, đấu giá theo kiểu Bàn Long; mỏ ma tinh trong thế giới động; `cv_academy`, `cv_tourney`, `cv_auction`, `cv_mine`, `cv_bloodline`, `cv_match` | `edu.js`, `noble.js`, `org.js`, `dynamic.js` |
| E | Kỳ ngộ, mặt trái: `cv_ring`, `cv_grave`, `cv_ruin`, `cv_rob`, `cv_forbidden`, `cv_deviate`, `cv_reawaken` | `cult.js`, `events.js` |
| F | Đặt tên kỹ năng (bản đầu không tên), cân lại tháp | `cult.js`, `sim.html` |

## 8. Người dùng đã chốt (15/10/2026)

1. **Cấp, cảnh giới:** theo hệ cấp của thư viện nghề (cấp = số kỹ năng max). Mỗi nghề có nhiều kỹ năng nhưng chỉ một số lượng tính vào cấp, số còn lại chỉ cộng chỉ số. Cách chia ở mục 4.1.
2. **Ai cũng tu được.**
3. **Tháp cảnh giới** chia lại theo điểm 1: mục 6.
4. **Phong cách phương Tây, kiểu Bàn Long, không có tông môn.**
5. **Thọ nguyên** × (1 + 0,12 × Tier): duyệt.
6. **Tiền tệ:** đồng, bạc, vàng, tỉ lệ 100 : 1.
7. Làm lại điểm 1 xong thì làm tiếp (bước A), ghi vào tiến độ.

## Nguồn tra cứu thêm

Phần lớn nội dung mục 2 là kiến thức chung về các bộ truyện. Tra cứu web ngày 15/10/2026 dùng để đối chiếu:

- TV Tropes, Magocracy: https://tvtropes.org/pmwiki/pmwiki.php/Main/Magocracy (hai dạng xã hội pháp sư cai trị; tông màu đổi theo chuyện dân thường có dùng phép được không).
- Black Clover, tầng lớp theo ma lực: https://leisurebyte.com/black-clover-season-2-releases-on-oct-3/
- Lord of the Mysteries, hệ Danh sách: https://lordofthemysteries.fandom.com/wiki/Sequence
