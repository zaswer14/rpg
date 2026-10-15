# Trang duyệt nhanh

Trang trên claude.ai để người dùng lướt nội dung và đánh dấu từng mục: ✓ giữ, ✎ cần sửa (kèm ghi chú), ✕ bỏ. Quyết định lưu trong db của trang (collection `reviews`); Claude đọc bằng `ArtifactData` action `list` rồi sửa dữ liệu nguồn. Thư mục này chứa mã nguồn trang và trang sinh dữ liệu; bản đăng nằm trên claude.ai.

## 1. Các trang

| Trang | URL | Hiện gì | Dữ liệu nguồn | id trong db |
|---|---|---|---|---|
| Duyệt Cây Nghề | https://claude.ai/artifact/K36G3cQRbzHMALuN7q3SaK | cây T0–T5 của 10 chủng tộc: nghề thân chung, ngọn riêng, ngọn tín ngưỡng, nghề ẩn, dạng đề xuất từ kho khuôn nghề | `shared/` (schools, trunk, aspects, faiths, races, archetypes, compose, catalog) | `<race>__<jobId>`, đề xuất `<race>__cand:<variantId>` |
| Duyệt Mẫu Quốc Gia | https://claude.ai/artifact/1FQFmmAroJsyVzVkgwp8W2 | 50 mẫu quốc gia (10 chủng tộc × 5), 31 đặc trưng riêng, 22 luật, 14 chính thể; tên nước mẫu | `vankiep/data/nations.js`, tên nước trong `shared/names/names.js`, tên biome | `<kind>__<id>`, kind `tpl` / `quirk` / `law` / `gov` |

Mỗi trang có hai file: `<trang>-data.html` (nạp dữ liệu, in JSON vào `pre#out`) và `<trang>-review.src.html` (giao diện, chỗ `/*DATA*/null` là nơi chèn JSON). Tên ngắn dùng trong lệnh: `tree`, `nation`.

`published.txt` ghi dấu dữ liệu (sha256 16 ký tự của JSON) của bản đang đăng. `tools/duyet.sh` so dấu này với dữ liệu hiện tại.

## 2. Quy trình

**Trước mỗi commit** (bắt buộc, `CLAUDE.md` mục Trang duyệt nhanh):

```bash
bash tools/duyet.sh
```

Kết quả có hai phần:

- Mỗi trang: **khớp** bản đã đăng, hoặc **LỆCH** (dữ liệu đổi mà chưa đăng lại).
- **Nội dung đổi mà chưa trang nào hiện**: file dữ liệu đã đổi kể từ lần `published.txt` được commit mà không trang nào hiện phần đổi. Gặp dòng này thì nói với người dùng và hỏi có thêm tab hay trang duyệt không; chưa thêm thì ghi vào mục 3.

**Đăng lại một trang** khi nó LỆCH (hỏi người dùng trước, vì trang đã chia sẻ thì người xem thấy ngay):

1. `bash tools/duyet.sh dung tree` → `review/out/tree.html` (thư mục `out/` không commit).
2. Đăng bằng công cụ Artifact, `url` = URL của trang ở bảng trên (đọc trang trước, giữ capability `db` để không mất quyết định đã đánh dấu).
3. `bash tools/duyet.sh ghi tree` → cập nhật `published.txt`; commit file này cùng thay đổi dữ liệu.

**Thêm trang mới**: tạo cặp `<ten>-data.html` / `<ten>-review.src.html` theo mẫu hai trang có sẵn (giao diện giống nhau, đổi màu nhấn), đăng, thêm một dòng vào `published.txt` (`ten`, dấu, ngày, tên, URL), thêm `ten` vào `PAGES` và hàm `cover` trong `tools/duyet.sh`, thêm dòng vào bảng mục 1 và vào `index.html` ở gốc.

**Đọc kết quả duyệt**: `ArtifactData` action `list`, collection `reviews`, `url` của trang. Sửa nguồn theo quyết định, rồi đăng lại trang để người dùng thấy bản mới.

## 3. Nội dung chưa có trang duyệt

Ghi ngày 15/10/2026, khi tách lại kho. Hai trang ở mục 1 khớp dữ liệu hiện tại từng byte, nhưng các nội dung sau chưa có chỗ duyệt nhanh:

| Nội dung | Ở đâu | Số lượng |
|---|---|---|
| Sự kiện quốc gia (đặc tính mẫu, đặc trưng riêng, sự kiện chung) | `vankiep/js/realmev.js` `G.NATION_EVENTS` | 90 |
| Sự kiện đời người, quyết định | `vankiep/js/events.js`, `state.js`, `org.js`, `edu.js`, `noble.js` (`G.EVENTS`, `G.DECISIONS`) | 75 sự kiện, 37 quyết định |
| Hội, tổ chức | `vankiep/js/org.js` `G.ORG_KINDS` | 6 loại |
| Học viện, ngành học | `vankiep/js/edu.js` `G.EDU`, `G.TRACKS` | 3 cấp, 5 ngành |
| Tước quý tộc, thang thăng tiến theo chính thể, xuất thân hoàng gia | `vankiep/js/noble.js` `G.NOBLE_VI`, `G.PROMO`, `G.DYNASTIC` | Nam → Công, 9 thang, 5 xuất thân |
| Sinh kế, công trình | `vankiep/data/world.js` `G.WORKS`, `vankiep/data/nations.js` `G.BUILDINGS` | 15, 8 |
| Vùng, vùng biển, tàu, nguyên nhân chết | `vankiep/data/world.js` | 16, 7, 3, 21 |
| Loài quái, biome | `shared/bestiary/species.js`, `shared/terrain/ecology.js` | 87 loài, 16 biome |
| Địa hình, đặc trưng ô | `shared/terrain/terrain.js` | 16 biome, 7 đặc trưng |
| Kho tên (người, khu dân cư, địa danh, hang ổ, di tích, chiến tranh, tàu, đoàn thuê, cướp biển, biệt hiệu) | `shared/names/names.js` | ~1.200 tên; trang quốc gia chỉ hiện tên nước |

Hướng đề xuất: một trang **Duyệt Nội Dung Vạn Kiếp** với tab Sự kiện quốc gia, Hội, Học viện, Quý tộc, Sinh kế và công trình; một trang **Duyệt Quái và Địa hình** (phần chung) với tab theo họ quái và theo biome; kho tên duyệt theo nhóm trong một trong hai trang.
