# Skeleton Codex V12 — Balance Patch trên nền V11

**Mở `index.html` trên Chrome/Edge sau khi giải nén.** V12 là bản vá cân bằng: 147 skill (thêm 43: 30 Restricted, 6 exclusive cấp qua Trial, 3 signature martial, 4 triệu hồi tử thuật); thuộc hạ có 4 kiểu hành vi, máu riêng, cap theo nghề, gate chuyển nghề đặt lại cho 16 nghề (mỗi cạnh đúng 2 skill mới), pool gacha lọc theo nhánh, giá quay theo Tier, thưởng stat theo nguồn sức mạnh, scale STR/DEX/INT, mastery suy từ dữ liệu skill, vũ khí giới hạn theo domain. Save V10/V11 vẫn đọc được. Chi tiết và số liệu: **`docs/10_V12_Balance_Patch.md`**; dữ liệu xuất: `docs/10_V12_EXPORT_CANONICAL.json`.

**V12.3 (14/10/2026):** 36 nghề · 38 cạnh · 151 skill. Thêm nghề **Siege Gunner** (T3 craft, terminal, từ Bone Engineer), cạnh **Grave Bandit → Shade Stalker** (Bandit lên B, gate Stalker đổi sang `shadow_climb` + `veil_sense`), đổi tên hiển thị Bone Tinkerer Prime → Bone Artificer, Lich King → Lich, summon Bone Archer → Skeletal Archer (ID giữ nguyên). Chi tiết: `docs/10` mục 6.

**Art (14/10/2026):** `docs/12_Job_Visual_Identity_Design.md` — thiết kế ngoại hình 35 nghề (silhouette, marker duy nhất, màu theo nhánh, prompt từng nghề); `docs/13_Job_Tree_Review.md` — đánh giá cây nghề, các đề xuất sửa trước khi vẽ art và backlog 19 nghề; `docs/14_Job_Tree_Roadmap_Multi_Race.md` — mô hình thân chung / ngọn riêng cho nhiều chủng tộc và thứ tự sản xuất theo đợt.

**Thư viện dùng chung (14/10/2026):** `../library/` — 8 trường phái, 34 nghề thân chung, 10 chủng tộc (skeleton, human, elf, dwarf, beastfolk, merfolk, orc, dragonkin, fae, construct), hàm `compose()` để mỗi game chọn chủng tộc. Trang `index.html` có mục **14 · Thư viện chủng tộc** xem cây theo từng chủng tộc. Runtime chiến đấu chưa đọc từ thư viện; xem `../library/README.md` mục 5.

**Khuôn nghề + giáo phái (14/10/2026):** `../library/catalog.html` + `../library/docs/02_Archetype_Catalog.md` — 34 khuôn nghề chung × 278 dạng theo chủng tộc và giáo phái (ví dụ Kỵ Sĩ: skeleton + Hắc Giáo = Kỵ Sĩ Tử Vong ngựa xương, mọi chủng tộc + Quang Minh = Kỵ Sĩ Ánh Sáng, + Hắc Giáo = Hắc Kỵ Sĩ, người thú không đạo = Kỵ Sĩ Nanh Ngà). `../library/docs/03_Faiths.md` — 6 giáo phái (Quang Minh / Hắc Giáo lớn, 4 nhỏ), 23 ngọn tín ngưỡng mở cho mọi chủng tộc. Mỗi chủng tộc nay có 10 nghề T5 (skeleton 17). Kho ý tưởng, chưa chọn dạng nào vào game.

**V13 · Quái phụ trên map (14/10/2026):** ngoài đối thủ chính, mỗi màn có 2–3 ổ quái phụ lấy từ `../library/bestiary/`: 43 loài thuộc 12 họ (Quái Thú, Ma Thú, Long Tộc, Trùng Tộc, Nhầy, Thảo Yêu, Bất Tử, Nguyên Tố Linh, Cơ Giới, Yêu Ma, U Linh, Phi Cầm), 8 kiểu di chuyển, cấp Tinh anh/Thủ lĩnh với 8 biến tố, 6 vùng săn chọn ở thanh chọn màn. Quái phụ không chặn cổng; hạ được thì cộng Chiến tích khi thắng (tối đa +50% thưởng màn) và ghi vào sổ săn trong save. Trang có mục **15 · Sổ tay quái phụ**. Thiết kế, nguồn tham khảo và giới hạn: `../library/docs/04_Bestiary_Side_Monsters.md`.

---

## (Lịch sử) V11 — Bilingual Jobs, Job Gates & 5-Rank Skill Design

**Mở `index.html` trên Chrome/Edge sau khi giải nén.** Đây là bản cập nhật thiết kế và UI của web V10 playable, giữ nguyên 35 nghề, 36 đường nghề, 104 skill, tài nguyên, save V10 và gameplay debug (không có art mới).

## Điểm mới V11

- Cây nghề, Job Codex, trình chọn nghề, cặp skill gate và giao diện skill có **tên Việt / English**; tìm kiếm tên bằng cả hai ngôn ngữ. ID nghề/skill tiếng Anh giữ nguyên.
- Mục **★ 36 đường chuyển nghề** chứa 36 cạnh thật, 2 skill bắt buộc đạt R5, Mastery, Trial, Tier, Power và dấu nghề terminal. Lọc theo Tier / từ khóa.
- Mỗi thẻ skill có bảng mở rộng **R1–R5**: hệ số hiệu lực, hồi chiêu, startup, cơ chế độc lập từng bậc và **tổng chỉ số vĩnh viễn cộng dồn**.
- 34 Trial có thêm mô tả mục tiêu chiến đấu đề xuất. **Mục tiêu riêng V11 là dữ liệu thiết kế; Trial đang chạy vẫn là trận V10 chung.**
- Hệ số theo bậc đã được dùng trong runtime V10 cho **sát thương trực tiếp, hồi chiêu và startup**. Các cơ chế riêng ghi trong bảng từng skill chưa phải tất cả đã hiện thực độc lập; AI/map/art còn theo V10.
- Save vẫn là `skeleton-codex-skill-v10-playable`; không đổi cấp nghề, không reset skill của bản trước.

## Tài liệu

- **`docs/09_V11_Job_Path_Bilingual_Skill_Ranks.md`** — bản thiết kế V11 đầy đủ (35 tên nghề, 36 đường chuyển, 104 skill × 5 rank, stat và điều kiện).
- **`docs/09_V11_EXPORT_CANONICAL.json`** — bản xuất dữ liệu V11 từ trang kiểm thử, hữu ích cho QA; mã nguồn chuẩn vẫn là `skill-system.js` + `v11-design-data.js` + dữ liệu nghề trong `index.html`.
- **`docs/08_V10_Playable_Combat_Job_Progression.md`** — cấu trúc runtime/AI/chiến đấu và giới hạn V10.
- `docs/01`–`07` — lịch sử các quy tắc đã chốt và art reference; không sửa hoặc xóa.

## Cách chơi

## Chơi ngay

1. Tại **▶ Playable Combat V10** → chọn **Đơn đấu / Nhóm / Tinh anh / Boss** → **Bắt đầu màn**.
2. Di chuyển sang phải và tới cổng cuối màn **sau khi đã hạ hết AI** mới nhận Chiến tích.
3. Vào **12 · Khiêu chiến & Gacha** để quay skill (60 Chiến tích/lượt). Skill mới học Rank 1; trùng chuyển thành điểm thông thạo.
4. Vào **13 · Skill Library & Loadout** để nâng 1→5, lắp Active/Passive và xem stat/Level. Nhân vật thật dùng build từ nghề thật, không phải nghề đang xem trước.
5. Tại phần **▶ Playable Combat V10** hoặc **07 · Chuyển nghề**, chọn một nghề nối trực tiếp → thắng **Huấn luyện** để nhận hai skill bắt buộc → max cả hai Rank 5 → đạt Mastery → thắng **Trial** → chuyển nghề vĩnh viễn.
6. Có **Xuất save JSON / Nhập save JSON**, cùng localStorage tự lưu. Bản V10 cố đọc save V9 ở lần mở đầu.

## Điều khiển

- **A/D hoặc trái/phải**: chạy, **Space / W**: nhảy.
- **J**: đòn đánh thường theo loại vũ khí.
- **K / 1**: Active 1, **2/3**: Active 2/3 (khi mở theo Tier), **Q**: Signature.
- **Shift / L**: né, **P**: tạm dừng/tiếp tục.
- Các nút cảm ứng ở dưới màn chơi hỗ trợ chuột và điện thoại.

## Điểm mới so với V9

- Màn đi cảnh có camera, platform/hố, vật phẩm hồi phục, chiến đấu thật với AI, boss 2 phase, hitbox/projectile/guard/dodge.
- Giữ **104 skill** và 6 độ hiếm, 5 Rank. Skill đã trang bị đi vào runtime dựa trên roles/tags/elements; buff/passive/trap/summon/cast/melee/ranged có hiệu ứng gameplay.
- Mastery kiếm qua chơi; khóa pool gacha theo Tier nghề thật; thử thách khởi đầu và Trial cần thắng trận thật.
- Có **35 nghề, 36 đường nghề**, transition một chiều, profile nghề thật và lịch sử nghề, job terminal.
- Thêm xuất/nhập save và cơ chế thử nghiệm combat bằng placeholder hình học (không yêu cầu art).

## Tài liệu chuẩn

- **`docs/08_V10_Playable_Combat_Job_Progression.md`**: đầy đủ luật runtime hiện tại, QA và **giới hạn thực tế**.
- `docs/07_Challenge_Gacha_And_Skill_Rarity.md`: luật rarity, bảng chi phí, xác suất cơ sở V9 (V10 bổ sung boss, khóa Tier, chiến đấu thật).
- `docs/06_Skill_Ranks_Level_And_Tier_Gates.md`: luật Level/Rank/Gate nền.
- `docs/01`–`05`: Job Graph, Skill Library, Roles/Elements, Tier 0 và art reference.

## Phạm vi chưa làm

Đây là **website playable/debug**, không phải Unity build; bản đồ và AI hiện chỉ là môi trường kiểm thử chung. **Chưa làm art/rig/animation**, chưa cân bằng cảm giác đánh, thời gian farm, gacha, boss nghề riêng hoặc xử lý độc bản cho mọi skill. 104 skill có dispatcher gameplay chung, nhưng không được trình bày sai rằng mỗi skill đã có animation/behavior cá nhân hóa. Xem tài liệu `docs/08` để biết rõ phần nào mới ở mức công thức mẫu.
