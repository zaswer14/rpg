# rpg

Kho chung của các dự án game nhập vai (tài liệu tiếng Việt). Bản đồ kho, file nào đọc khi nào: **`TRA_CUU.md`**. Trang chủ cho người dùng: `index.html`.

- `shared/`: **phần chung** mọi game đọc: nghề, chủng tộc, giáo phái, khuôn nghề, quái (`bestiary/`), kho tên (`names/`), địa hình (`terrain/`), luật chung (`docs/00_Luat_chung.md`). Sửa ở đây thì kiểm cả hai game.
- `vankiep/`: **Vạn Kiếp**, game mô phỏng một đời kiểu 1in8b trên đại lục Varen (HTML/JS tĩnh); thiết kế ở `vankiep/docs/` (01 1in8b; 02–05 bản đồ V2, quốc gia, thành phố; 06 thiên phú, chí hướng; 07 định hướng xã hội tu luyện; 08 hệ sức mạnh, level, chuyển nghề; 09 bậc Tier, danh xưng, độ hiếm; 10 cây nghề riêng; 11 tuổi thọ giống loài, tập tục; 12 cây sự kiện, quỹ đạo, danh phận; 13 mạch truyện, dàn nhân vật, chương đời; 14 sự kiện giống loài, môi trường sống; 15 tín ngưỡng gốc của tộc, văn hóa tộc; 16 đường đời: mạch chính, mạch ngắn, dấu hệ quả; 17 danh vọng, thành tựu, lịch sử lựa chọn, biên bản lúc chết).
- `platform/`: **Skeleton Codex**, game hành động platformer 2D (tài liệu cân bằng, bản chơi thử, quy trình art).
- `review/`: trang duyệt nhanh trên claude.ai (mã nguồn, dữ liệu, `published.txt`).
- `tools/`: `sync.sh`, `muc_luc.sh`, `duyet.sh`, `tim.sh` (tra mã Vạn Kiếp: tên ở đâu, ai bọc, ai dùng), `token.pl` (token theo việc, hook `Stop` ghi `logs/token/`), `caytruyen.sh` (dựng bản đăng trang Cây Cốt Truyện), `serve.ps1`.

## Đồng bộ máy tính / điện thoại (một lệnh)

Người dùng làm trên máy tính (Claude Code) và điện thoại (Claude cloud) qua GitHub (`github` = github.com/zaswer14/rpg, `main` theo dõi `github/main`).

- Đầu phiên: hook `SessionStart` (`.claude/settings.json`) tự chạy `bash tools/sync.sh`; kết quả nằm sẵn trong ngữ cảnh (dòng `== main ↔ github/main ...`), gồm cả trạng thái Vạn Kiếp và trang duyệt. Đừng chạy lại nó hay thêm lệnh git để xem lại. Báo thiếu commit thì `bash tools/sync.sh pull`. Không thấy kết quả (hook không chạy) thì tự chạy `bash tools/sync.sh` một lần.
- Cuối phiên: nhắc commit, người dùng đồng ý thì `bash tools/sync.sh push`.
- `origin` là máy chủ công ty, chỉ push khi được bảo.

## Trang duyệt nhanh: kiểm trước mỗi commit

Khi người dùng bảo commit (hoặc trước khi hỏi họ có commit không), chạy `bash tools/duyet.sh` và báo kết quả cùng lúc với đề nghị commit:

- Trang **LỆCH** bản đã đăng: hỏi người dùng có đăng lại không; đồng ý thì làm theo `review/README.md` mục 2 (`dung`, đăng lên đúng URL, `ghi`) và commit `review/published.txt` cùng thay đổi.
- **Nội dung đổi mà chưa trang nào hiện** (sự kiện, hội, loài, tên mới…): nói rõ là chưa có chỗ duyệt nhanh, hỏi có thêm tab / trang không; chưa thêm thì ghi vào `review/README.md` mục 3.
- **Sửa cốt truyện theo ghi chú** (người dùng bảo "sửa cốt truyện", "sửa theo ghi chú"): đọc ghi chú chờ sửa trên trang Cây Cốt Truyện, sửa, đánh dấu đã sửa; các bước ở `review/README.md` mục 2 ("Sửa cốt truyện theo ghi chú").
- **Thêm hệ thống mới** (sự kiện, quyết định, dữ liệu mới của Vạn Kiếp): luôn thêm tab vào trang **Duyệt Nội Dung Vạn Kiếp** trong cùng lần làm, không đợi hỏi (người dùng dặn 15/10/2026); cách làm ở `review/README.md` mục 2.
- Máy không có trình duyệt headless (cloud): script chỉ kiểm theo file; ghi chú việc dựng lại cho phiên trên máy tính.

## Đọc tiết kiệm, giữ context nhỏ

Mọi thứ đã đọc, đã viết, đã chạy đều nằm lại trong đoạn chat và bị đọc lại ở mỗi lượt sau. Đo 17/10/2026: phiên mở đầu ~64k, phình tới 500–850k, nguồn phình số 1 là Bash in file (`logs/token/`, `perl tools/token.pl`). Người dùng hỏi context / token dùng thế nào: skill `xem-context`.

- File lớn (`bash tools/muc_luc.sh` liệt kê) thì không đọc cả: `bash tools/muc_luc.sh FILE [mẫu]` ra số dòng từng phần / hàm (kèm chú thích tác dụng nếu mã có), rồi Read đúng đoạn bằng `offset` / `limit`.
- **Tra mã Vạn Kiếp trước khi đọc**: `bash tools/tim.sh -k "từ khóa"` (file nào lo việc đó, tên `G.*` khớp), `bash tools/tim.sh G.tên` (định nghĩa, mọi lớp bọc theo thứ tự nạp, chỗ dùng theo file; nhiều hàm bị bọc ở 3–4 file, như `G.teachList`, `G.runEvent`). Không đọc cả bảng Bản đồ mã nguồn (`TIEN_DO.md` mục 2) khi chỉ cần một file / một hàm. Viết hàm mới: một dòng chú thích `//` ngay trên nó để `muc_luc.sh` hiện tác dụng.
- **Tìm hiểu qua nhiều file mà chỉ cần kết luận** (lần đầu đọc một hệ thống, tìm chỗ dùng một hàm, đối chiếu tài liệu với mã, nghiên cứu): giao subagent `Explore` (hoặc `general-purpose` khi phải chạy lệnh), dặn trả lời gọn kèm số dòng; đừng tự `cat` / `sed` cả loạt vào đoạn chat chính. Tự đọc khi sắp sửa đúng đoạn đó (Edit cần Read ở luồng chính; đọc đúng khoảng dòng subagent chỉ).
- **Khi nào đáng gọi subagent** (đo 17/10/2026): một subagent mới tốn cố định ~37k context của riêng nó (~70k quy đổi lượt đầu), nên đọc 1 file nhỏ hay vài đoạn có số dòng thì tự đọc (`muc_luc.sh` + `offset` / `limit`) rẻ hơn. Đáng gọi khi phải đọc nhiều (≳ 30 KB mã / tài liệu) mà phiên còn dài: phần đó không nằm lại trong luồng chính.
- **Hỏi lại cùng file / cùng chủ đề thì gọi lại đúng subagent cũ** bằng `SendMessage` (tên hoặc id trong kết quả `Agent`), dặn "trả lời từ những gì đã đọc, chỉ đọc thêm khi thiếu": nó còn nguyên context, một lượt hỏi lại chỉ ~5k quy đổi, rẻ hơn ~15 lần so với gọi con mới và không đọc lại file. Gọi con mới khi: chủ đề khác hẳn, quá 1 giờ chưa dùng (cache hết, gọi lại tốn như con mới), hoặc context của nó đã lớn (> ~150k; `perl tools/token.pl` có dòng Subagent).
- Kết quả lệnh và chạy thử: cắt bớt (`head`, `grep -c`), cho `javascript_tool` trả tóm tắt / số đếm thay vì cả mảng, không in lại file vừa viết.
- Hook `UserPromptSubmit` (`perl tools/token.pl --ctx`) báo khi context vượt 400k, rồi mỗi 150k: nói ngắn với người dùng, đề nghị chuyển chat; đồng ý thì ghi bàn giao (mục dưới). Việc nhỏ sau một việc lớn (commit, push) cũng nên ở chat mới.

## Bàn giao giữa các chat

Chuyển chat giữa chừng một việc (context lớn, người dùng nói "bàn giao" / "chuyển chat"): skill `ban-giao` ghi `ban_giao/<việc>.md` (vị trí trong mã, hiểu biết về mã, quyết định đã chốt, bước tiếp), viết từ những gì đã có, không đọc lại file. Chat mới: `sync.sh` in "Bàn giao đang mở"; người dùng nói "làm tiếp" thì đọc file đó trước mọi thứ khác và chỉ đọc đúng đoạn sắp sửa. Xong việc thì xóa file bàn giao trong commit hoàn tất.

## Khi người dùng nói "làm tiếp Vạn Kiếp"

Có bàn giao đang mở cho việc đó thì làm theo nó (mục trên), chỉ đọc `TIEN_DO.md` khi cần. Không có thì đọc `vankiep/TIEN_DO.md` (mục 3 việc tiếp theo, mục 2 bản đồ mã nguồn, mục 5 cách làm việc; mục khác khi cần). Thiết kế ở `vankiep/docs/03_Thiet_ke_ban_do_Varen_V2.md`, đọc theo mục. Xong một bước thì cập nhật `TIEN_DO.md` (đoạn mở đầu là dòng trạng thái mà `sync.sh` in ra, giữ nó ngắn và đúng).
