# rpg

Kho chung của các dự án game nhập vai (tài liệu tiếng Việt). Bản đồ kho, file nào đọc khi nào: **`TRA_CUU.md`**.

- `library/`: thư viện nghề, chủng tộc, giáo phái, bestiary dùng chung. Game khác chỉ đọc, không sửa.
- `LifeSim_RPG/`: **Vạn Kiếp**, game mô phỏng một đời kiểu 1in8b trên đại lục Varen (HTML/JS tĩnh).
- `Skeleton_Codex_V12_Balance/`: tài liệu cân bằng Skeleton Codex.
- `research/`: ghi chép nghiên cứu và thiết kế (01 1in8b; 02–05 bản đồ V2, quốc gia, thành phố của Vạn Kiếp).

## Đồng bộ máy tính / điện thoại (một lệnh)

Người dùng làm trên máy tính (Claude Code) và điện thoại (Claude cloud) qua GitHub (`github` = github.com/zaswer14/rpg, `main` theo dõi `github/main`).

- Đầu phiên: hook `SessionStart` (`.claude/settings.json`) tự chạy `bash tools/sync.sh`; kết quả nằm sẵn trong ngữ cảnh (dòng `== main ↔ github/main ...`), gồm cả trạng thái Vạn Kiếp. Đừng chạy lại nó hay thêm lệnh git để xem lại. Báo thiếu commit thì `bash tools/sync.sh pull`. Không thấy kết quả (hook không chạy) thì tự chạy `bash tools/sync.sh` một lần.
- Cuối phiên: nhắc commit, người dùng đồng ý thì `bash tools/sync.sh push`.
- `origin` là máy chủ công ty, chỉ push khi được bảo.

## Đọc tiết kiệm

File lớn (`bash tools/muc_luc.sh` liệt kê) thì không đọc cả: `bash tools/muc_luc.sh FILE [mẫu]` ra số dòng từng mục / hàm, rồi Read đúng đoạn bằng `offset` / `limit`.

## Khi người dùng nói "làm tiếp Vạn Kiếp"

Đọc `LifeSim_RPG/TIEN_DO.md` (mục 3 việc tiếp theo, mục 2 bản đồ mã nguồn, mục 5 cách làm việc; mục khác khi cần). Thiết kế ở `research/03_Thiet_ke_ban_do_Varen_V2.md`, đọc theo mục. Xong một bước thì cập nhật `TIEN_DO.md` (đoạn mở đầu là dòng trạng thái mà `sync.sh` in ra, giữ nó ngắn và đúng).
