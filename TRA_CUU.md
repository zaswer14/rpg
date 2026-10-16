# Tra cứu nhanh kho rpg

Đọc file này thay vì lần mò thư mục. Mục tiêu: mỗi phiên tốn ít lệnh và ít token nhất.

## 1. Đồng bộ (máy tính và cloud)

| Lúc | Lệnh | Ghi chú |
|---|---|---|
| Đầu phiên | tự động (hook `SessionStart` chạy `bash tools/sync.sh`) | fetch + tóm tắt ~10 dòng: thiếu / dư commit, file đổi, nhánh `claude/*` chưa gộp, trạng thái Vạn Kiếp, trang duyệt cần dựng lại; chạy tay khi hook không chạy |
| Có commit mới | `bash tools/sync.sh pull` | chỉ fast-forward; lệch hai phía thì dừng và hỏi |
| Trước khi commit | `bash tools/duyet.sh` | trang duyệt nhanh có khớp dữ liệu không, nội dung mới nào chưa có trang (CLAUDE.md mục Trang duyệt nhanh) |
| Cuối phiên | `bash tools/sync.sh push` | chỉ sau khi người dùng đồng ý commit / push |

Không chạy thêm `git status`, `git log`, `git branch -a` sau `sync.sh` trừ khi cần chi tiết. Không đọc diff của commit mới kéo về; chỉ mở file liên quan tới việc đang làm. `origin` là máy chủ công ty: chỉ push khi được bảo.

## 2. Đọc tiết kiệm

- **File lớn thì đọc theo mục.** `bash tools/muc_luc.sh FILE [mẫu]` in `L<đầu>-<cuối> (<số dòng>) <mục>` (tiêu đề với `.md`, hàm `G.x` / `function` với `.js`), rồi Read với `offset` / `limit`. Ví dụ `bash tools/muc_luc.sh vankiep/docs/03_Thiet_ke_ban_do_Varen_V2.md "hang ổ"`.
- `bash tools/muc_luc.sh` (không đối số): danh sách file ≥ 15 KB. Đừng đọc cả những file này.
- Tìm một tên hàm / khóa: Grep trước, đọc vùng quanh dòng khớp sau.
- Trạng thái Vạn Kiếp đã có trong kết quả `sync.sh` (đoạn mở đầu TIEN_DO.md). Chỉ đọc tiếp TIEN_DO.md khi bắt tay làm, và chỉ mục cần (`muc_luc.sh vankiep/TIEN_DO.md`).
- Không tạo commit riêng chỉ để ghi hash vào tài liệu; tra hash bằng `git log --oneline --grep "bước 8"`. Lịch sử file trước khi tách kho (15/10/2026): `git log --follow vankiep/js/life.js`.

## 3. Bản đồ kho

| Đường dẫn | Nội dung | Đọc khi |
|---|---|---|
| `CLAUDE.md` | quy ước chung (tự nạp mỗi phiên) | luôn có sẵn |
| `TRA_CUU.md` | file này | đầu phiên, khi chưa biết file nào |
| `index.html` | trang chủ cho người dùng: link tới mọi trang, tài liệu | thêm trang / tài liệu mới thì thêm link |
| `README.md` gốc | giới thiệu kho, cách mở | |
| `tools/` | `sync.sh`, `muc_luc.sh`, `duyet.sh`, `serve.ps1` (server tĩnh cả kho, cổng 8765) | |
| **Phần chung** `shared/` | nghề, chủng tộc, giáo phái, khuôn nghề, quái, tên, địa hình; mọi game đọc | `shared/README.md` mục 1 là sơ đồ |
| `shared/docs/00_Luat_chung.md` | luật chung: Tier, chuyển nghề, quái, địa hình, tên, dữ liệu | trước khi thêm nội dung dùng chung |
| `shared/names/names.js` (24K) | kho tên riêng `JobLibrary.names` | theo khóa, qua Grep |
| `shared/terrain/` | `terrain.js` (địa hình theo biome, đặc trưng ô), `ecology.js` (10 biome + 44 loài Varen) | |
| `shared/docs/02_Archetype_Catalog.md` (114K) | 34 khuôn nghề × 278 dạng | chỉ đọc theo mục |
| **Vạn Kiếp** `vankiep/` | game mô phỏng một đời (HTML/JS tĩnh) | |
| `vankiep/TIEN_DO.md` | 1 đã xong · 2 bản đồ mã nguồn · 3 việc tiếp theo · 4 việc treo · 5 cách làm việc | "làm tiếp Vạn Kiếp" |
| `vankiep/README.md` (26K) | mô tả game cho người đọc | khi cập nhật sau mỗi bước |
| `vankiep/js/*.js`, `data/*.js` | mã (bảng vai trò từng file: TIEN_DO mục 2) | theo hàm, qua `muc_luc.sh` |
| `vankiep/sim.html` | 1000 đời headless + kiểm dữ liệu | kiểm sau mỗi bước |
| `vankiep/docs/` | 01 ý tưởng 1in8b · 02 phương án bản đồ · **03 thiết kế bản đồ V2 (62K, mục 12 = thứ tự bước)** · 04 50 mẫu quốc gia · 05 thành phố, làng · 06 thiên phú, chí hướng · **07 định hướng xã hội tu luyện (mục 7 = thứ tự bước, mục 8 = chờ chốt)** · **08 thiết kế lại hệ sức mạnh, lên cấp, chuyển nghề (mục 10 = việc trong mã, mục 11 = đã chốt)** · 09 Tier, danh xưng · 10 cây nghề riêng · 11 tuổi thọ giống loài · 12 cây sự kiện, quỹ đạo, danh phận | theo mục, qua `muc_luc.sh` |
| **Platform** `platform/` | Skeleton Codex: game platformer 2D, tài liệu + bản chơi thử cân bằng V12 | `README.md` đầu file |
| `platform/docs/*_EXPORT_CANONICAL.json` (224–275K) | dữ liệu xuất | không đọc cả; Grep theo id |
| `platform/docs/11_Art_Pipeline_ChatGPT_PixelLab.md` | quy trình vẽ art | khi làm art |
| **Duyệt** `review/` | mã nguồn trang duyệt nhanh, trang sinh dữ liệu, `published.txt` | `review/README.md` |

## 4. Trang duyệt trên claude.ai

| Trang | URL | Dữ liệu |
|---|---|---|
| Duyệt Mẫu Quốc Gia | https://claude.ai/artifact/1FQFmmAroJsyVzVkgwp8W2 | db `reviews`, id `<kind>__<id>`; đọc trước khi sửa `vankiep/data/nations.js` |
| Duyệt Cây Nghề | https://claude.ai/artifact/K36G3cQRbzHMALuN7q3SaK | db `reviews`, id `<race>__<jobId>` |
| Duyệt Nội Dung Vạn Kiếp | https://claude.ai/artifact/VuihS4NqSLx296iVLSwZTY | db `reviews`, id `<kind>__<id>`; đọc trước khi sửa `vankiep/js/realmev.js`, `org.js`, `edu.js`, `noble.js`, `G.WORKS`, `G.BUILDINGS` |
| Duyệt Quái và Địa hình | https://claude.ai/artifact/EAQXqvNeqpS36378wdaaFN | db `reviews`, id `<kind>__<id>`; đọc trước khi sửa `shared/bestiary/`, `shared/terrain/`, `shared/names/` |

Kiểm, dựng lại, đăng lại, thêm trang: `review/README.md` mục 2. Nội dung chưa có trang duyệt: mục 3 của file đó.
