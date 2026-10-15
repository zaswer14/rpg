# RPG

Kho chung của các dự án game nhập vai (tài liệu tiếng Việt). Mở **`index.html`** qua server tĩnh để đi tới mọi mục:

```bash
powershell -ExecutionPolicy Bypass -File tools/serve.ps1
```

rồi mở `http://localhost:8765/`.

| Thư mục | Nội dung |
|---|---|
| `shared/` | **Phần chung**: cơ chế nghề (trường phái, thân chung, chủng tộc, giáo phái, khuôn nghề), quái, kho tên, địa hình, luật chung (`shared/docs/00_Luat_chung.md`) |
| `vankiep/` | **Vạn Kiếp**: mô phỏng một đời kiểu 1in8b trên đại lục Varen; thiết kế ở `vankiep/docs/` |
| `platform/` | **Skeleton Codex**: game hành động platformer 2D, tài liệu cân bằng và bản chơi thử |
| `review/` | Trang duyệt nhanh nội dung trên claude.ai: mã nguồn trang, dữ liệu, dấu bản đã đăng |
| `tools/` | `sync.sh` (đồng bộ GitHub), `muc_luc.sh` (mục lục file lớn), `duyet.sh` (trang duyệt có theo kịp dữ liệu không), `serve.ps1` (server tĩnh) |

Bản đồ chi tiết, file nào đọc khi nào: `TRA_CUU.md`.
