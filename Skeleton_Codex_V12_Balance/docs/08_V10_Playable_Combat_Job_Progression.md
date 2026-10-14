# Skeleton Codex V10 — Playable Combat, AI, Skill Runtime & Job Progression

**Ngày:** 13/10/2026  
**Phạm vi:** Website HTML/CSS/JavaScript offline, kế thừa nguyên trạng dữ liệu nghề, rarity, Rank, các skill và tài liệu V9. **Chưa sản xuất art.**  
**Mục đích:** Khép kín vòng chơi trước khi cân bằng cảm giác chiến đấu. Các hệ số được xác định tạm để game chạy được; **không coi là mức cân bằng cuối.**

## A. Những gì đã chuyển từ mô phỏng sang chạy được

| Hệ thống | V10 | Chi tiết hiện thực |
|---|---|---|
| Đi cảnh 2D | Playable | Canvas 1000×470, camera theo nhân vật, 3 đoạn nền có hố, các bệ cao, đồ hồi phục, cổng đích |
| Điều khiển | Playable | Bàn phím A/D, Space/W, J, K/1, 2, 3, Q, Shift/L, P và nút cảm ứng |
| Combat | Playable | Đòn thường theo 8 bộ vũ khí, combo đòn thường, startup/active/recovery mô phỏng, phạm vi đánh, projectile, cooldown, chi phí Stamina/Mana, né có iframe, guard, shield, stun/knockback, hit confirm Rank cao |
| AI | Playable | Grunt, scout, caster, brute, boss; nhận diện, đuổi đánh, giữ khoảng cách, báo đòn, tung đòn, pha boss 2 |
| Khiêu chiến | Playable | 1v1, nhóm, tinh anh, boss; thắng phải hạ toàn bộ địch và tới cổng; thất bại/thoát không cấp chiến tích |
| Kinh tế | Hoạt động | Chiến tích nhận sau thắng; gacha theo pool/rarity/pity V9; skill trùng → điểm; nâng Rank tiêu điểm |
| Skill combat | Runtime theo dữ liệu | Toàn bộ 104 skill có thể đi qua bộ xử lý dựa trên role/method/element/tags. 70 Active, 17 Passive, 17 Signature; các skill chưa lắp không thể dùng |
| Skill Rank 1–5 | Hoạt động theo nhóm cơ chế | Thay đổi startup, hiệu lực/passive, khống chế, phạm vi/biến thể, finisher; Rank 5 thưởng chỉ số vĩnh viễn và +1 Level |
| Mastery | Hoạt động | Nhận khi thắng và khi dùng vũ khí/skill phù hợp: Sword, Shield, Throwing, Bow, Dagger, Stealth, Soul, Necromancy, Engineering, Axe, Spear |
| Element Affinity | Hoạt động bước đầu | Tăng theo hệ skill đã dùng trong trận thắng; khóa điều kiện trang bị `attunement`; các hệ giữ map độc lập |
| Chuyển nghề | Hoạt động | 35 nghề, 36 cạnh; nghề hiện tại thật; phải đúng cạnh, max hai skill, đủ Mastery và thắng Trial; không quay lại; terminal dừng chuyển |
| Huấn luyện skill đảm bảo | Playable | Với mỗi nghề tiếp theo, thắng trận huấn luyện để nhận cặp skill gate ở Rank 1; chỉ cấp một lần |
| Trial | Playable | Trial từng nghề đích; khởi chạy sau gate; thắng mới đánh dấu; sau đó nút chuyển nghề vĩnh viễn |
| Lưu trữ | Hoạt động | Tự lưu V10, đọc save V9 lần đầu; xuất và nhập JSON qua web |
| Art | Chưa làm | Nhân vật/quái/vũ khí/hiệu ứng đều hình học debug, giữ các ảnh art reference cũ chỉ để tham khảo |

## B. Chơi bản V10

1. Mở `index.html` trong Chrome/Edge (giữ nguyên thư mục sau giải nén).
2. Tại mục **Playable Combat V10**, chọn 1v1 / nhóm / tinh anh / boss rồi ấn **Bắt đầu màn**.
3. Đi sang phải, nhảy qua hố, đánh bại AI; tới cổng sáng cuối màn để hoàn thành.
4. Nhận Chiến tích, dùng mục **Khiêu chiến & Gacha** để quay skill. Skill đã có nhận điểm thay thế.
5. Vào **Skill Library**: nâng Rank 1→5 bằng điểm, lắp Active/Passive. Đổi vũ khí ở mục Playable Combat, khi hết trận.
6. Tại phần **Chuyển nghề hiện tại**, thắng huấn luyện cho nghề muốn lên, nâng hai skill bắt buộc Rank 5, tích lũy Mastery, thắng Trial, nhấn **Chuyển nghề**. Không thể đổi lại.
7. Muốn giữ tiến độ ngoài localStorage, nhấn **Xuất save JSON** và cất file. Có **Nhập save JSON** để khôi phục.

### Phím điều khiển

- **A / D** hoặc **← / →**: di chuyển; **Space/W**: nhảy; **Shift/L**: né.
- **J**: đòn thường theo vũ khí. **K / 1**: Active slot 1; **2 / 3**: Active slot tương ứng khi mở Tier; **Q**: Signature Tier 3+.
- **P**: pause/resume; ở mobile sử dụng cụm nút cảm ứng bên dưới canvas.
- **Tier 0 không thể trang bị cung**, kỹ năng tầm xa đầu tiên là **Stone Throw** và **Aimed Stone**.

## C. Gameplay runtime

**Màn chơi** có ba đoạn nền, hố, bệ cao, đồ hồi phục và cổng kết thúc. Mọi mode dùng chung bản đồ debug và thay đổi bố trí/quy mô đối thủ. **Không có thưởng do nhấn nút “thắng trận”.**

**Đối thủ** dùng state đơn giản: không hoạt động khi xa → tiếp cận/căn tầm → windup có telegraph → tấn công → hồi chiêu. Caster có đạn, brute nặng, scout nhanh, boss có phase 2 khi HP dưới 50%. Chưa có cây hành vi AI chuyên sâu, ngắt đòn bằng poise đầy đủ, boss nghề riêng hoặc nhiều cảnh khác nhau.

**Damage và status:** các đòn tách cơ bản vật lý/phép qua cờ magic để áp armor/magic resistance sơ bộ, hỗ trợ Burn/Chill/Wet/Shock/Root/Curse/Armor Break, giảm hiệu quả lên boss, tương tác Wet+Lightning và Wet+Chill. Có hồi phục, khiên, guard, né, projectile, trap, summon tự động bắn. **Chưa có bộ resolver DamagePart[] đa thành phần hoàn chỉnh** và chưa author riêng các phản ứng, tích lũy buildup, immunities cho từng kẻ địch.

## D. Runtime của 104 skill — mức triển khai thực tế

Không nhân bản 104 hàm C# hay animation riêng. Runtime đọc **SkillDefinition** V9, `roles`, `tags`, `method`, `element`, `statuses`, `kind`, `cost`, `cooldown`, `weapons`; phân loại và thực thi:

- **Mobility**: dash/lướt/nhảy chủ động, iframe theo nhóm.
- **Defense/Healing/Support**: guard, barrier, heal, xóa curse, hồi tài nguyên, mark/curse địch.
- **Projectile/Magic/Throwing/Bow**: tạo vật thể bay, nguyên tố, số lượng hoặc tốc độ điều chỉnh theo Rank.
- **Melee/Control**: vùng va chạm cận chiến, knockback, stagger, root/chill.
- **Tech/Trap**: đặt bẫy, chặn/chậm mục tiêu và một số sát thương.
- **Summon**: đơn vị hỗ trợ tạm thời tìm mục tiêu và bắn.
- **Passive**: cải thiện vận tốc, hồi tài nguyên, sát thương, giảm damage, nhảy hoặc thu thập theo role/tags/rank.

**Các thay đổi theo Rank hiện tại mang tính quy tắc chung**: Rank 1 dùng được, Rank 2 giảm thời gian thực thi / tăng hiệu quả passive, Rank 3 tăng hiệu ứng kiểm soát và chỉ số thưởng riêng theo skill V9, Rank 4 mở cancel hit-confirm + hiệu quả tầm bắn/đa đạn đối với nhóm thích hợp, Rank 5 tăng hiệu quả và hiệu ứng nối của một số signature; stat vĩnh viễn là dữ liệu V9. Đây là bản *behavioral prototype*. Các mô tả V9 chi tiết như cách summon riêng, phản đòn chuẩn xác, vùng trọng lực, tạo địa hình tùy skill vẫn cần **author animation/effect modules riêng** nếu muốn đúng fantasy từng skill; V10 không giả vờ đã hoàn thiện 104 bộ động tác đặc biệt.

## E. Progression & economy

- **Level = đúng số skill Rank 5**; không cộng stat khi Level tăng. Stat đến từ skill rewards (`rankRewards`) V9, cộng một lần tính theo rank hiện có.
- **Gacha** giá 60 Chiến tích, màu Trắng/Lục/Lam/Tím/Vàng/Đỏ, lọc theo Tier của **nghề hiện tại thật**, không thể xem Tier 5 để gacha miễn phí. Pity 10 Lam+ và 30 Tím+ giữ luật V9; không có tiền thật.
- **Thưởng thắng**: solo 70 (+30 lần đầu), nhóm 120 (+60), tinh anh 190 (+90), boss 260 (+120); training +60 và đảm bảo skill, trial +220. Số liệu tạm.
- **Huấn luyện nghề**: chỉ nghề nối trực tiếp từ nghề hiện tại, chỉ nhận một lần mỗi đích (nhận skill lần đầu hoặc điểm nếu trùng); không thể dùng nếu đã chuyển sang nhánh khác.
- **Mastery**: một phần thưởng cơ bản theo nghề khi thắng và các điểm từ hành động phù hợp trong trận, cap theo trận. Tier cao có yêu cầu cao, có thể tích lũy nhiều trận; chưa cân bằng thời gian.
- **Trial**: chỉ mở khi max skill gate và đủ Mastery. Thắng Trial +220, sau đó chuyển nghề thật; không tự chuyển.
- **Một chiều**: lưu `currentJobId`, `jobHistory`; nghề terminal vẫn farm/max skill và đấu boss được.

## F. File kỹ thuật

- `index.html`: Job Graph có sẵn và section Playable mới; bỏ thao tác slider Mastery.
- `skill-system.js`: giữ nguyên 104 skill/rarity/gacha V9; thêm persistence nhân vật thật, chiến tích khi thắng, training, trial, API build và job-change; V10 API `window.SkeletonSkillProgress`.
- `game-v10.js`: Canvas, vòng cập nhật, physics, hitboxes, AI, hệ nhóm skill, hiệu ứng tạm, touch controls, bắt đầu/kết thúc màn, import/export UI; API `window.SkeletonGame`.
- `game-v10.css`: UI game, responsive/touch.
- `tier0-design.js`: giữ nội dung thống kê Tier 0 V9.
- `docs/01`–`07`: dữ liệu thiết kế trước đây; V10 bổ sung tầng runtime, không đổi các quyết định V9 về Tier/Rank/rarity.

## G. Ranh giới và những phần cần hoàn thiện ở vòng sau

**V10 là website chơi thử đầy vòng lặp, không phải game Unity hoàn chỉnh**. Các phần cố ý **chưa coi là final**: riêng biệt animation của từng skill/nhân vật, rig/equipment thật, nhiều map/biome, nhiều loại quái và boss nghề riêng, hiệu ứng nội tại 104 skill được author theo từng Rank, DamagePart resolver chi tiết, AI phức tạp, PvP AI được cân theo nghề, cân bằng xác suất gacha/chỉ số/độ khó/thời gian farm, âm thanh, tối ưu mobile cho bản production. Không có backend chống sửa save; dữ liệu lưu tại máy như một demo offline.

## H. Kiểm thử đã thực hiện

- Parser JavaScript: Node `--check` cho `skill-system.js`, `game-v10.js`.
- Chạy Chromium Playwright bằng nội dung nạp trực tiếp: không có runtime pageerror trên trang; có 104 skill và API runtime.
- Chạy đấu mẫu: normal attack giảm HP kẻ địch; chỉ khi đánh hết địch + vượt cổng mới tăng chiến tích; gacha trừ 60.
- Vượt huấn luyện Bone Fighter: nhận cặp skill Rank 1; khóa chuyển nghề khi rank chưa đủ; khi đủ rank/max mastery, thắng Trial, chuyển thật lên Tier 1, cập nhật Level/history.
- Coverage tự động: **35 job / 36 cạnh** có training và gate; chạy dispatcher trên **70 Active + 17 Signature** ở các Rank mẫu, 17 Passive được kiểm tra danh mục; không có lỗi JavaScript.

**Lưu ý về kiểm thử:** kiểm tra tự động xác minh logic và chạy không lỗi, chưa đồng nghĩa mọi lớp nội dung đã có playtest thủ công toàn diện. Khi chơi thực tế vẫn cần kiểm thử sự dễ chịu của điều khiển, AI và cảm giác đánh.
