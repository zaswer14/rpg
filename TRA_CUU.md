# Tra cứu nhanh kho rpg

Đọc file này thay vì lần mò thư mục. Mục tiêu: mỗi phiên tốn ít lệnh và ít token nhất.

## 1. Đồng bộ (máy tính và cloud)

| Lúc | Lệnh | Ghi chú |
|---|---|---|
| Đầu phiên | `bash tools/sync.sh` | fetch + tóm tắt ~10 dòng: thiếu / dư commit, file đổi, nhánh `claude/*` chưa gộp, trạng thái Vạn Kiếp |
| Có commit mới | `bash tools/sync.sh pull` | chỉ fast-forward; lệch hai phía thì dừng và hỏi |
| Cuối phiên | `bash tools/sync.sh push` | chỉ sau khi người dùng đồng ý commit / push |

Không chạy thêm `git status`, `git log`, `git branch -a` sau `sync.sh` trừ khi cần chi tiết. Không đọc diff của commit mới kéo về; chỉ mở file liên quan tới việc đang làm. `origin` là máy chủ công ty: chỉ push khi được bảo.

## 2. Đọc tiết kiệm

- **File lớn thì đọc theo mục.** `bash tools/muc_luc.sh FILE [mẫu]` in `L<đầu>-<cuối> (<số dòng>) <mục>` (tiêu đề với `.md`, hàm `G.x` / `function` với `.js`), rồi Read với `offset` / `limit`. Ví dụ `bash tools/muc_luc.sh research/03_Thiet_ke_ban_do_Varen_V2.md "hang ổ"`.
- `bash tools/muc_luc.sh` (không đối số): danh sách file ≥ 15 KB. Đừng đọc cả những file này.
- Tìm một tên hàm / khóa: Grep trước, đọc vùng quanh dòng khớp sau.
- Trạng thái Vạn Kiếp đã có trong kết quả `sync.sh` (đoạn mở đầu TIEN_DO.md). Chỉ đọc tiếp TIEN_DO.md khi bắt tay làm, và chỉ mục cần (`muc_luc.sh LifeSim_RPG/TIEN_DO.md`).
- Không tạo commit riêng chỉ để ghi hash vào tài liệu; tra hash bằng `git log --oneline --grep "bước 8"`.

## 3. Bản đồ kho

| Đường dẫn | Nội dung | Đọc khi |
|---|---|---|
| `CLAUDE.md` | quy ước chung (tự nạp mỗi phiên) | luôn có sẵn |
| `TRA_CUU.md` | file này | đầu phiên, khi chưa biết file nào |
| `tools/` | `sync.sh`, `muc_luc.sh` | |
| **Vạn Kiếp** `LifeSim_RPG/` | game mô phỏng một đời (HTML/JS tĩnh) | |
| `LifeSim_RPG/TIEN_DO.md` | 1 đã xong · 2 bản đồ mã nguồn · 3 việc tiếp theo · 4 việc treo · 5 cách làm việc | "làm tiếp Vạn Kiếp" |
| `LifeSim_RPG/README.md` (26K) | mô tả game cho người đọc | khi cập nhật sau mỗi bước |
| `LifeSim_RPG/js/*.js`, `data/*.js` | mã (bảng vai trò từng file: TIEN_DO mục 2) | theo hàm, qua `muc_luc.sh` |
| `LifeSim_RPG/sim.html` | 1000 đời headless + kiểm dữ liệu | kiểm sau mỗi bước |
| `LifeSim_RPG/tools/` | `serve.ps1` (server tĩnh), trang duyệt quốc gia | |
| **Nghiên cứu** `research/` | 01 ý tưởng 1in8b · 02 phương án bản đồ · **03 thiết kế bản đồ V2 (62K, mục 12 = thứ tự bước)** · 04 50 mẫu quốc gia · 05 thành phố, làng | theo mục, qua `muc_luc.sh` |
| **Thư viện** `library/` | nghề, chủng tộc, giáo phái, bestiary dùng chung; game khác **chỉ đọc** | `library/README.md` mục 1 là sơ đồ |
| `library/docs/02_Archetype_Catalog.md` (114K) | 34 khuôn nghề × 278 dạng | chỉ đọc theo mục |
| **Skeleton Codex** `Skeleton_Codex_V12_Balance/` | tài liệu + bản chơi thử cân bằng V12 | `README.md` đầu file |
| `Skeleton_Codex_V12_Balance/docs/*_EXPORT_CANONICAL.json` (224–275K) | dữ liệu xuất | không đọc cả; Grep theo id |
| `11_Art_Pipeline_ChatGPT_PixelLab.md` | quy trình vẽ art | khi làm art |
| `README.md` gốc | mẫu GitLab, không có nội dung | bỏ qua |

## 4. Trang duyệt trên claude.ai

| Trang | URL | Dữ liệu |
|---|---|---|
| Duyệt Mẫu Quốc Gia | https://claude.ai/artifact/1FQFmmAroJsyVzVkgwp8W2 | db `reviews`, id `<kind>__<id>`; đọc trước khi sửa `data/nations.js` |
| Duyệt Cây Nghề | https://claude.ai/artifact/K36G3cQRbzHMALuN7q3SaK | db `reviews`, id `<race>__<jobId>` |

Cách dựng lại hai trang: TIEN_DO.md mục 1 (quốc gia), `library/tools/tree-data.html` (cây nghề).
