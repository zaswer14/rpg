# rpg

Kho chung của các dự án game nhập vai (tài liệu tiếng Việt).

- `library/`: thư viện nghề, chủng tộc, giáo phái, bestiary dùng chung. Game khác chỉ đọc, không sửa.
- `LifeSim_RPG/`: **Vạn Kiếp**, game mô phỏng một đời kiểu 1in8b trên đại lục Varen (HTML/JS tĩnh).
- `Skeleton_Codex_V12_Balance/`: tài liệu cân bằng Skeleton Codex.
- `research/`: ghi chép nghiên cứu và thiết kế (01 1in8b; 02–05 bản đồ V2, quốc gia, thành phố của Vạn Kiếp).

## Khi người dùng nói "làm tiếp Vạn Kiếp"

Đọc `LifeSim_RPG/TIEN_DO.md` trước: trạng thái các bước bản đồ V2, việc tiếp theo, bản đồ mã nguồn, việc đang treo và cách làm việc (kiểm bằng `sim.html`, hỏi trước khi commit, push lên remote `github`). Thiết kế chi tiết ở `research/03_Thiet_ke_ban_do_Varen_V2.md`. Xong một bước thì cập nhật `TIEN_DO.md`.

## Đồng bộ máy tính / điện thoại

Người dùng làm việc trên máy tính (Claude Code) và trên điện thoại (Claude cloud) qua GitHub (`github` = github.com/zaswer14/rpg, `main` theo dõi `github/main`). Đầu phiên: `git fetch github` và kéo về nếu có commit mới. Cuối phiên: nhắc commit và push. `origin` là máy chủ công ty, chỉ push khi được bảo.
