# Faiths — Giáo phái của thế giới

**Ngày:** 14/10/2026 · **Dữ liệu:** `../faiths.js` · **Trạng thái:** thiết kế, chưa nối runtime. Tín ngưỡng là trục thứ hai (sau chủng tộc) làm một khuôn nghề trở thành nhiều nghề: cùng là Kỵ Sĩ, theo Quang Minh thành Kỵ Sĩ Ánh Sáng, theo Hắc Giáo thành Hắc Kỵ Sĩ, không theo gì thì là Kỵ Sĩ thường.

## 1. Mô hình

- Thế giới có **2 giáo phái lớn** loại trừ nhau và **4 giáo phái nhỏ**. Mọi giáo phái mở cho mọi chủng tộc, nhưng mỗi giáo phái **ưu ái** vài chủng tộc (Devotion ×1,5), **dè dặt** vài chủng tộc (gate +15, như foreign) và có thể **xa lánh** (không vào được; hiện chưa dùng).
- Nhân vật theo **một** giáo phái tại một thời điểm. **Devotion 0–100** tích qua hành vi hợp giáo lý, mất qua hành vi trái giáo lý. Mốc Devotion mở nghề tín ngưỡng theo Tier: T3 ≥ 30, T4 ≥ 60, T5 ≥ 90.
- **Bỏ đạo (apostasy)**: mất hết Devotion; giáo phái cũ nhớ. Bỏ Quang Minh sang Hắc Giáo mở nghề ẩn **Kẻ Phá Thề** (Oathbreaker) nếu đang là Thánh Kỵ Sĩ.
- Mỗi giáo phái có một **blessing**: luật thụ động mọi tín đồ nhận ở Devotion ≥ 30, bất kể nghề. Đây là cách tín ngưỡng ảnh hưởng tới nghề không có dạng tín ngưỡng riêng.
- Mỗi giáo phái có một **cách cấp sức mạnh** khác nhau; đây là thứ phân biệt chúng về gameplay, không phải màu:

| Giáo phái | Quy mô | Khí chất | Cấp sức mạnh bằng | Ưu ái | Dè dặt |
|---|---|---|---|---|---|
| ☀ **Thánh Giáo Quang Minh** / Church of the Dawn | lớn | Ánh Sáng | **Lời thề**: có sức mạnh chừng nào còn giữ giới; phá giới mất ngay | human, dwarf, dragonkin | skeleton (kẻ sám hối), fae |
| ☾ **Hắc Giáo** / Covenant of Dusk | lớn | Hắc Ám | **Giao kèo**: trả giá (máu, Devotion, thuộc hạ) để lấy; không có giới, chỉ có nợ | skeleton, orc, merfolk | dragonkin, construct (trả bằng Nhiệt) |
| ❦ Cổ Thần Hoang Dã / Old Gods of the Wild | nhỏ | Tự Nhiên | **Hiệp thông**: mạnh theo địa hình sống, yếu ở nơi không sự sống | elf, beastfolk, fae | construct, dwarf |
| ⌂ Tổ Linh Đạo / Way of the Ancestors | nhỏ | Tổ Linh | **Nghi lễ**: hồn tổ tiên hiện ở mốc máu/thời điểm cố định | dwarf, orc, beastfolk | fae, construct |
| ◉ Vực Giáo / Cult of the Deep | nhỏ | Vực Sâu | **Giao kèo** trả bằng lý trí (Sanity) thay vì máu | merfolk, skeleton | dragonkin, human |
| ⚙ Giáo Hội Lò Rèn / Church of the Eternal Forge | nhỏ | Cơ Khí | **Nghi lễ cải tạo**: thay dần bộ phận bằng máy; Nhiệt thay mana | construct, dwarf | elf, beastfolk, fae |

Đối địch: Quang Minh ↔ Hắc Giáo; Vực Giáo ↔ Quang Minh; Lò Rèn ↔ Cổ Thần.

**Hắc Giáo không phải bản sao âm của Quang Minh.** Quang Minh có tư tế chữa lành (Mục Sư, Hồng Y); Hắc Giáo không có kẻ chữa, chỉ có kẻ **chuyển** vết thương (Tư Tế Thống Khổ, Tiên Tri Hắc Ám). Quang Minh mất sức mạnh khi phá giới; Hắc Giáo không bao giờ mất, chỉ nợ thêm.

## 2. Tín ngưỡng tác động lên nghề bằng ba cách

1. **Ngọn tín ngưỡng** (`faiths[id].crowns`): nghề mọi tín đồ đủ Devotion đều tới được, bất kể chủng tộc, bỏ qua cấm trường phái (tín ngưỡng là cánh cửa: human vào Death qua Hắc Giáo, dwarf vào Death qua Tổ Linh Đạo, merfolk qua Vực Giáo, elf vào Artificer-line qua Lò Rèn). `compose()` ghép chúng vào cây của mọi chủng tộc không bị xa lánh; trên sơ đồ là ô viền kép. Hiện có 23 ngọn tín ngưỡng, trong đó 7 nghề T5.
2. **Dạng theo tín ngưỡng** trong khuôn nghề (`archetypes/*.js`, `race:'*'` + `faith`): khi một tín đồ vào khuôn đó mà chủng tộc không có dạng chủng tộc + tín ngưỡng riêng, họ nhận dạng này. Thứ tự chọn: **chủng tộc + tín ngưỡng › tín ngưỡng › chủng tộc › dạng chung** (`catalog().resolve()`). Ví dụ khuôn Kỵ Sĩ: skeleton + Hắc Giáo → Kỵ Sĩ Tử Vong; skeleton + Quang Minh → Kỵ Sĩ Sám Hối; human + Quang Minh → Kỵ Sĩ Ánh Sáng; human + Hắc Giáo → Hắc Kỵ Sĩ; human không đạo → Kỵ Sĩ (dạng chung); beastfolk không đạo → Kỵ Sĩ Nanh Ngà; beastfolk + Hắc Giáo → Hắc Kỵ Sĩ.
3. **Blessing** cho mọi nghề còn lại.

Ngọn riêng của chủng tộc cũng có thể **yêu cầu tín ngưỡng** (`faith` trên crown): Dread Knight → Death Knight của skeleton cần Hắc Giáo; Abyss Sovereign cần Vực Giáo; Penitent Knight → Ossuary Saint cần Quang Minh.

## 3. Nghề tín ngưỡng hiện có

| Giáo phái | T3 | T4 | T5 |
|---|---|---|---|
| ☀ Quang Minh | Thánh Kỵ Sĩ (từ Vệ Binh), Trừ Tà Sư (từ Linh Môi) | Kỵ Sĩ Ánh Sáng, Thập Tự Chúa (từ Thánh Kỵ Sĩ), Phán Quan (từ Kẻ Rình Rập), Hồng Y (từ Tiên Tri) | Thánh Sống (từ Thập Tự Chúa / Hồng Y) |
| ☾ Hắc Giáo | Hắc Vệ (từ Vệ Binh) | Hắc Kỵ Sĩ (từ Hắc Vệ), Kẻ Phá Thề ◆ (từ Thánh Kỵ Sĩ, bỏ đạo), Thập Tự Bóng (từ Kẻ Rình Rập), Tiên Tri Hắc Ám (từ Tiên Tri) | Hắc Chúa (từ Hắc Kỵ Sĩ / Kẻ Phá Thề), Giáo Chủ Dị Giáo (từ Tiên Tri Hắc Ám) |
| ❦ Cổ Thần | — | Tu Sĩ Rừng (từ Tiên Tri / Kỵ Thú) | Đại Tu Sĩ Rừng |
| ⌂ Tổ Linh | — | Kẻ Nói Với Tổ Tiên (từ Tiên Tri) | Hóa Thân Tổ Linh |
| ◉ Vực Giáo | — | Tư Tế Vực Sâu ◆ (từ Thuật Sĩ / Tiên Tri) | Tiên Tri Chết Chìm; merfolk có lối riêng Chúa Chìm ◆ |
| ⚙ Lò Rèn | Tư Tế Lò Rèn (từ Kỹ Sư / Vệ Binh) | Thiết Tiên Tri | Cỗ Máy Đức Tin |

Dạng tín ngưỡng không phải ngọn (chỉ là cách vào một khuôn): Mục Sư (☀, Tư Tế T3), Tư Tế Thống Khổ (☾, Tư Tế T4).

## 4. Tham khảo đã dùng

- Cặp giáo hội Ánh Sáng / giáo phái Bóng Tối đối địch (Church of Solumen – Antumbra Order, Crimson Desert) và nguyên tắc "giáo phái ác không có cấu trúc, kỳ vọng hay sức mạnh giống giáo phái thiện" → Hắc Giáo cấp sức mạnh bằng giao kèo, không có tư tế chữa lành.
- Holy Knight / Dark Knight / Fell Knight / Temple Knight (Final Fantasy Tactics) → Kỵ Sĩ Ánh Sáng, Hắc Kỵ Sĩ, Kẻ Phá Thề, Thánh Kỵ Sĩ.
- Nghề bậc 4 Ragnarok Online (Imperial Guard, Cardinal, Inquisitor, Shadow Cross, Abyss Chaser, Arch Mage, Meister…) → Hồng Y, Phán Quan, Thập Tự Bóng, Tư Tế Vực Sâu.
- Mythic path (Pathfinder: Living Saint, Hierophant, Lich, Trickster…) → Thánh Sống, Hóa Thân Tổ Linh, các T5 chủng tộc.

## 5. Chưa làm

- Runtime: Devotion, blessing, giá giao kèo, Sanity của Vực Giáo, cải tạo thân của Lò Rèn.
- Gate (2 skill Tier n−1) cho toàn bộ 23 ngọn tín ngưỡng.
- Luật khi game chỉ chọn một số giáo phái: `compose({ faiths:[...] })` đã hỗ trợ, chưa có game nào dùng.
