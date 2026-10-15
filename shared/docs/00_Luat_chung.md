# Luật chung của các game

**Ngày:** 15/10/2026 · Gom các luật mà mọi game trong kho cùng theo, để khỏi lục từng file. Chi tiết và lý do nằm ở file nguồn ghi cuối mỗi mục; luật ở đây đổi thì sửa file nguồn trước rồi sửa bảng này.

## 1. Tier

- Một thang **Tier 0–5** dùng chung cho nghề, quái và (ở Vạn Kiếp) sức mạnh nhân vật.
- Nghề: Tier đích = Tier tiền nhiệm + 1, không ngoại lệ; `compose()` báo lỗi nếu vi phạm.
- Quái: nhân vật Tier t chỉ gặp loài Tier ≤ t + 1 (liều mạng: ≤ t + 2); loài cao hơn Tier nhân vật hiếm hơn (trọng số × 0,4). Khu có Tier thấp nhất > t + 1 bị khóa với nhân vật Tier t.
- Nguồn: `README.md` mục 3, `docs/04_Bestiary_Side_Monsters.md`, `vankiep/data/world.js` (đầu file).

## 2. Chuyển nghề

- **Gate** = 2 skill Tier n − 1, mới so với mọi tiền nhiệm trên mọi tuyến (luật V12). `gate: null` là chưa thiết kế: `compose()` liệt kê trong `warnings`, không chặn.
- **Quyền trường phái**: `native` vào từ T1; `foreign` gate Mastery +15, không có ngọn T4–T5 trừ nghề lai ghi rõ; `forbidden` chỉ qua nghề `hidden` hoặc ngọn tín ngưỡng. `blockedJobs` cấm từng nghề, `allowDespiteForbidden` mở từng nghề.
- **Ngọn riêng** của chủng tộc mọc từ nghề chung T2–T4 hoặc nghề cùng chủng tộc, bắt đầu từ T3; mỗi chủng tộc 5–8 ngọn (chủng tộc chủ lực của game được nhiều hơn).
- **Giáo phái**: mọi chủng tộc vào được trừ `shunned`; `favored` Devotion × 1,5, `wary` gate +15. Ngọn tín ngưỡng bỏ qua cấm trường phái.
- Nguồn: `README.md` mục 3, `docs/03_Faiths.md`, `platform/docs/06_Skill_Ranks_Level_And_Tier_Gates.md`.

## 3. Quái

- Một loài = **họ** + **kiểu di chuyển** + **cỡ** + **khí chất** (từ `aspects.js`) + Tier. Họ mang luật gameplay mà mọi loài trong họ đều có; runtime đọc họ, không đọc tên loài, nên thêm loài không cần code. Thêm họ hoặc kiểu mới thì phải viết luật runtime trong game.
- Khi sinh, loài nhận cấp (thường / tinh anh / thủ lĩnh / chúa; chúa không sinh ngẫu nhiên) và tinh anh, thủ lĩnh có biến tố.
- Hệ số `hp`, `dmg`, `speed` của loài trong (0, 3]; `marker` không trùng.
- Nguồn: `bestiary/rules.js`, `docs/04_Bestiary_Side_Monsters.md`.

## 4. Địa hình

- Mỗi biome có độ lệch độ cao, độ ẩm, nhiệt cộng vào trường trước khi chuẩn hóa, danh sách đặc trưng không có (`no`), cờ rừng và **độ hoang nền** (≤ 0,8, để sát làng vẫn còn tầng ven).
- 7 đặc trưng ô (đồng trống, đồi, rừng, rừng rậm, đầm, núi, hồ), mỗi cái có chi phí đi bộ và độ hoang cộng thêm. Thứ tự trong mảng là mã lưu trong bản đồ: chỉ thêm vào cuối.
- Quái theo đặc trưng chỉ **nhân trọng số** loài đã có trong bảng của tầng, không thêm loài, nên không phá luật Tier.
- Biome mới phải có cả dòng trong `terrain/terrain.js` và vùng săn (`bestiary/biomes.js` hoặc `terrain/ecology.js`).
- Nguồn: `terrain/terrain.js`, `terrain/ecology.js`, `vankiep/docs/03_Thiet_ke_ban_do_Varen_V2.md` mục 2.

## 5. Tên

- Tên ghép theo công thức ghi ở đầu `names/names.js` (người, quốc gia, người cai trị, khu dân cư, địa danh, hang ổ, di tích, chiến tranh).
- Không trùng tên trong cùng một thế giới; hết tên thì cho trùng gốc và thêm "Tân" / "Hạ" / "Thượng".
- Thêm tên: thêm vào mảng, không cần sửa code.
- Nguồn: `names/names.js`.

## 6. Dữ liệu

- ID snake_case, tên trần, không tiền tố chủng tộc; tiền tố là chuyện hiển thị.
- Mọi file là JS thuần gán vào `window.JobLibrary` để mở offline bằng `<script>`; phần object bên trong là JSON hợp lệ.
- Game chỉ nạp file mình cần (chủng tộc không nạp thì không tồn tại với `compose()`, `terrain/ecology.js` không nạp thì không có loài Varen).
- Sửa bất cứ gì trong `shared/`: mở `tools/export.html` (không còn lỗi), rồi mở cả `vankiep/sim.html?noauto` lẫn `platform/index.html` để chắc hai game không hỏng; chạy `bash tools/duyet.sh` trước khi commit.
