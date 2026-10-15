# Trang duyệt nhanh

Trang trên claude.ai để người dùng lướt nội dung và đánh dấu từng mục: ✓ giữ, ✎ cần sửa (kèm ghi chú), ✕ bỏ. Quyết định lưu trong db của trang (collection `reviews`); Claude đọc bằng `ArtifactData` action `list` rồi sửa dữ liệu nguồn. Thư mục này chứa mã nguồn trang và trang sinh dữ liệu; bản đăng nằm trên claude.ai.

## 1. Các trang

| Trang | URL | Hiện gì | Dữ liệu nguồn | id trong db |
|---|---|---|---|---|
| Duyệt Cây Nghề | https://claude.ai/artifact/K36G3cQRbzHMALuN7q3SaK | cây T0–T5 của 10 chủng tộc: nghề thân chung, ngọn riêng, ngọn tín ngưỡng, nghề ẩn, dạng đề xuất từ kho khuôn nghề | `shared/` (schools, trunk, aspects, faiths, races, archetypes, compose, catalog) | `<race>__<jobId>`, đề xuất `<race>__cand:<variantId>` |
| Duyệt Mẫu Quốc Gia | https://claude.ai/artifact/1FQFmmAroJsyVzVkgwp8W2 | 50 mẫu quốc gia (10 chủng tộc × 5), 31 đặc trưng riêng, 22 luật, 14 chính thể; tên nước mẫu | `vankiep/data/nations.js`, tên nước trong `shared/names/names.js`, tên biome | `<kind>__<id>`, kind `tpl` / `quirk` / `law` / `gov` |
| Duyệt Nội Dung Vạn Kiếp | https://claude.ai/artifact/VuihS4NqSLx296iVLSwZTY | 90 sự kiện quốc gia (đặc tính mẫu, đặc trưng riêng, chung: câu chữ và tác dụng trích từ mã), 6 loại hội + Hiệp Hội Mạo Hiểm + lập nghiệp, 3 cấp học + 5 ngành, 5 tước + 3 xuất thân, 9 thang thăng tiến, 15 sinh kế, 8 công trình | `vankiep/js/realmev.js`, `org.js`, `edu.js`, `noble.js`, `vankiep/data/world.js`, `nations.js` | `<kind>__<id>`, kind `ev` / `org` / `edu` / `track` / `noble` / `origin` / `promo` / `work` / `bld` |
| Duyệt Quái và Địa hình | https://claude.ai/artifact/EAQXqvNeqpS36378wdaaFN | 12 họ quái (luật họ) với 87 loài, 16 biome (địa hình, bảng sinh quái theo Tier), 7 đặc trưng ô, kho tên theo 42 nhóm | `shared/bestiary/`, `shared/terrain/`, `shared/names/names.js` | `<kind>__<id>`, kind `fam` / `sp` / `biome` / `feat` / `names` (id nhóm tên dạng `person.elf`, `geo.river`) |

Mỗi trang có hai file: `<trang>-data.html` (nạp dữ liệu, in JSON vào `pre#out`) và `<trang>-review.src.html` (giao diện, chỗ `/*DATA*/null` là nơi chèn JSON). Tên ngắn dùng trong lệnh: `tree`, `nation`, `content`, `bestiary`.

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

Ghi ngày 15/10/2026. Hai trang Duyệt Nội Dung Vạn Kiếp và Duyệt Quái và Địa hình đã phủ sự kiện quốc gia, hội, học viện, quý tộc, thăng tiến, sinh kế, công trình, loài quái, biome, đặc trưng ô và kho tên. Còn thiếu:

| Nội dung | Ở đâu | Số lượng |
|---|---|---|
| Sự kiện đời người, quyết định | `vankiep/js/events.js`, `state.js`, `org.js`, `edu.js`, `noble.js`, `talent.js` (`G.EVENTS`, `G.DECISIONS`) | 76 sự kiện, 43 quyết định (có 6 quyết định, 1 sự kiện của `talent.js`) |
| Vùng, vùng biển, tàu, nguyên nhân chết | `vankiep/data/world.js` (`G.REGIONS`, `G.SEAS`, `G.SHIPS`, `G.CAUSES`) | 16, 7, 3, 21 |
| Cấp quái, biến tố tinh anh, trạng thái quái gây ra | `shared/bestiary/rules.js` (`grades`, `affixes`, `playerStatuses`) | 4, 8, 7 |
| Thiên phú (6 bậc màu), căn cốt, chí hướng | `vankiep/js/talent.js` (`G.TALENTS`, `G.RARITY`, `G.AIMS`) | 40 thiên phú, 6 bậc, 8 chí hướng |
| Cấu hình game Skeleton Codex | `shared/games/skeleton-codex.js` | 1 |

Các file `org.js`, `edu.js`, `noble.js`, `world.js`, `rules.js` đã nằm trong phạm vi một trang, nên `duyet.sh` chỉ báo "chưa trang nào hiện" khi file đổi mà dữ liệu trang không đổi (tức là phần đổi thuộc các dòng trên).
