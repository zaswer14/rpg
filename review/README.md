# Trang duyệt nhanh

Trang trên claude.ai để người dùng lướt nội dung và đánh dấu từng mục: ✓ giữ, ✎ cần sửa (kèm ghi chú), ✕ bỏ. Quyết định lưu trong db của trang (collection `reviews`); Claude đọc bằng `ArtifactData` action `list` rồi sửa dữ liệu nguồn. Thư mục này chứa mã nguồn trang và trang sinh dữ liệu; bản đăng nằm trên claude.ai.

## 1. Các trang

| Trang | URL | Hiện gì | Dữ liệu nguồn | id trong db |
|---|---|---|---|---|
| Duyệt Cây Nghề | https://claude.ai/artifact/K36G3cQRbzHMALuN7q3SaK | cây T0–T5 của 10 chủng tộc: nghề thân chung, ngọn riêng, ngọn tín ngưỡng, nghề ẩn, dạng đề xuất từ kho khuôn nghề | `shared/` (schools, trunk, aspects, faiths, races, archetypes, compose, catalog) | `<race>__<jobId>`, đề xuất `<race>__cand:<variantId>` |
| Duyệt Mẫu Quốc Gia | https://claude.ai/artifact/1FQFmmAroJsyVzVkgwp8W2 | 50 mẫu quốc gia (10 chủng tộc × 5), 31 đặc trưng riêng, 22 luật, 14 chính thể; tên nước mẫu | `vankiep/data/nations.js`, tên nước trong `shared/names/names.js`, tên biome | `<kind>__<id>`, kind `tpl` / `quirk` / `law` / `gov` |
| Duyệt Nội Dung Vạn Kiếp | https://claude.ai/artifact/VuihS4NqSLx296iVLSwZTY | 90 sự kiện quốc gia (đặc tính mẫu, đặc trưng riêng, chung: câu chữ và tác dụng trích từ mã), 6 loại hội + Hiệp Hội Mạo Hiểm + lập nghiệp, 3 cấp học + 5 ngành, 5 tước + 3 xuất thân, 9 thang thăng tiến, 15 sinh kế, 8 công trình, căn cốt 6 bậc màu + 40 thiên phú, 8 chí hướng, 6 quyết định định hướng; tab Sức mạnh (docs/08): 6 Tier / level, 7 luật, 6 chỉ số, 11 nguồn người dạy, quyết định `cv_learn`, `promote`, kỹ năng theo nghề của chủng tộc Người (40 nghề); tab Địa vị (bước B, `docs/07` mục 4.10): 6 thân phận theo Tier, 7 luật, 11 sự kiện và quyết định `cv_*`; tab Kinh tế bốn vòng (bước C, mục 4.11): 4 vòng, 5 loại cầu, 4 sự kiện và quyết định; tab Sinh kế ghi vòng, Tier, cầu của 31 nghề; tab Học viện danh tiếng, gia tộc, đấu giá (bước D, mục 4.12): 6 luật, 5 quyết định; tab Kỳ ngộ, mặt trái (bước E, mục 4.13): 8 luật, 7 quyết định; tab Giống loài: tuổi thọ, tập tục (`docs/11`): 2 luật, 10 giống loài, 1 quyết định; tab Cây sự kiện (`docs/12`): 5 luật (quỹ đạo, danh phận, thân thể, chủ đề, cây), 10 hướng quỹ đạo, 19 chủ đề, 22 nút mới theo mạch (nhãn của nút có sẵn hiện trong thẻ luật); tab Mạch truyện (`docs/13`): 5 luật, 16 mạch, 47 nút (sự kiện và quyết định của mạch, sự kiện mở mạch, người quen), 33 chỗ móc vào sự kiện có sẵn, 18 câu hỏi chương đời; tab Sự kiện giống loài (`docs/14`): 4 luật (môi trường sống, giọng, tình trạng mới, chủ đề mới), 7 nhóm câu đổi giọng, 8 bộ câu đời thường, 120 nút riêng của 9 giống loài (sự kiện và quyết định) (17/10/2026 thêm nút văn hóa tộc của `culture.js`: Người Lùn, Orc và 2–4 nút mỗi tộc khác, 7 nhóm câu đổi giọng mới); tab Tín ngưỡng gốc của tộc (`docs/15`): 10 giáo phái (tộc gốc, giáo lý, cách cấp sức mạnh, ban phước sơ sinh, lễ quốc giáo), 22 sự kiện của đạo; tab Danh vọng, thành tựu (`docs/17`): 8 luật, 5 tầm danh vọng, 5 mức thanh danh, 66 thành tựu (kèm tỉ lệ đo 1000 đời) | `vankiep/js/realmev.js`, `org.js`, `edu.js`, `noble.js`, `talent.js`, `cult.js`, `status.js`, `econ.js`, `inst.js`, `fate.js`, `race.js`, `tree.js`, `story.js`, `racev.js`, `culture.js`, `fame.js`, `shared/faiths.js`, `state.js`, `shared/skills.js`, `vankiep/data/world.js`, `nations.js` | `<kind>__<id>`, kind `ev` / `org` / `edu` / `track` / `noble` / `origin` / `promo` / `work` / `bld` / `root` / `tal` / `aim` / `dec` / `tierlv` / `cultrule` / `stat` / `teacher` / `jobsk` / `stier` / `srule` (Địa vị) / `ring` / `demand` (Kinh tế bốn vòng) / `irule` (Học viện danh tiếng, gia tộc, đấu giá; sự kiện, quyết định của tab này dùng kind `dec`) / `frule` (Kỳ ngộ, mặt trái; quyết định dùng kind `dec`) / `rrule`, `race` (Giống loài: tuổi thọ, tập tục) / `trule`, `traj`, `theme`, `tnode` (Cây sự kiện; quyết định `sk_acolyte` dùng kind `dec`) / `stru`, `sarc`, `snode`, `shook`, `chap` (Mạch truyện; quyết định của mạch dùng kind `dec`) / `vrule`, `rvoice`, `rlife`, `rnode` (Sự kiện giống loài; quyết định dùng kind `dec`) / `faith`, `fnode` (Tín ngưỡng gốc của tộc) / `mrule`, `scope`, `rep`, `ach` (Danh vọng, thành tựu) (kind `realm` và `dec__cv_saint` của bản trước đã bỏ cùng cảnh giới) |
| Duyệt Quái và Địa hình | https://claude.ai/artifact/EAQXqvNeqpS36378wdaaFN | 12 họ quái (luật họ) với 87 loài, 16 biome (địa hình, bảng sinh quái theo Tier), 7 đặc trưng ô, kho tên theo 42 nhóm | `shared/bestiary/`, `shared/terrain/`, `shared/names/names.js` | `<kind>__<id>`, kind `fam` / `sp` / `biome` / `feat` / `names` (id nhóm tên dạng `person.elf`, `geo.river`) |
| Duyệt Mạch Truyện Vạn Kiếp | https://claude.ai/artifact/GDCQtaV7DY2rdrjhBwAR36 | mạch truyện (docs/16): luật (tầng mạch, đường đời, đi theo mạch, dấu, sự kiện ngoài mạch), 8 mạch chính (thẻ mạch: lời gọi, câu hỏi chương, hướng, câu nối, nguồn gieo, sơ đồ hồi, kết → tóm tắt → dấu; thẻ từng hồi), 11 mạch phụ, 16 mạch ngắn (thẻ mạch, thẻ nút), 32 dấu hệ quả, 59 sự kiện gieo | `vankiep/js/saga.js`, `vankiep/js/story.js` | `<kind>__<id>`, kind `rule` / `arc` / `node` / `mark` / `seed` |
| Cây Cốt Truyện Vạn Kiếp | https://claude.ai/artifact/MUyMaYGsmE22koNLReHC29 | trang chạy thật bộ mô phỏng trong trình duyệt (docs/17 mục 5): nút Nhân vật khác sinh một đời mới; chọn giống loài (cả Bộ Xương trỗi dậy ngay), vùng sinh, xuất thân, cách chọn quyết định (Tự sống hay ngẫu nhiên), seed, thế giới; xem tiếp kiếp Bộ Xương; cây: chương đời, danh vọng theo năm, thân đời (sự kiện ngoài mạch, quyết định, thành tựu), làn mạch chính, phụ, ngắn, người quen, hệ quả; danh sách nhánh, quyết định, biên bản lúc chết. Mở đầu là mẫu `mau:17` (Orc Mokzul Sẹo Dài) | `vankiep/caytruyen.html` (+ mã game làm file phụ, dựng bằng `bash tools/caytruyen.sh`) | `lt_<mã mẫu>_<mục>` (mã mẫu = `seed~giống loài~vùng~xuất thân~r~thế giới`, thêm `~k2` cho kiếp Bộ Xương), mục `arc:i` / `dec:i` / `chap:<chặng>` / `ev:i` / `ach:<id>` / `whole`; trường `sid`, `seed`, `who`, `race`, `kind`, `name` |

Mỗi trang có hai file: `<trang>-data.html` (nạp dữ liệu, in JSON vào `pre#out`) và `<trang>-review.src.html` (giao diện, chỗ `/*DATA*/null` là nơi chèn JSON). Tên ngắn dùng trong lệnh: `tree`, `nation`, `content`, `bestiary`, `story`.

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

**Thêm hệ thống mới vào Vạn Kiếp** (quy tắc của người dùng, `CLAUDE.md`): mỗi hệ thống mới có tab trên trang Duyệt Nội Dung ngay trong lần làm đó. Thêm dữ liệu vào `content-data.html` (nạp file mới, đưa bảng nội dung vào `data`; câu chữ trong hàm thì trích bằng `parseRun`), thêm tab vào `TABS`, danh sách mục vào `items`, một hàm view, nhóm tiến độ; thêm file vào `cover content` của `tools/duyet.sh`; dựng, đăng, ghi. File mới trong `vankiep/js/` mà chưa có trên trang thì `duyet.sh` tự báo "chưa trang nào hiện".

**Thêm trang mới**: tạo cặp `<ten>-data.html` / `<ten>-review.src.html` theo mẫu hai trang có sẵn (giao diện giống nhau, đổi màu nhấn), đăng, thêm một dòng vào `published.txt` (`ten`, dấu, ngày, tên, URL), thêm `ten` vào `PAGES` và hàm `cover` trong `tools/duyet.sh`, thêm dòng vào bảng mục 1 và vào `index.html` ở gốc.

**Thử nội dung trong game**: mở `vankiep/index.html?kd=1` (chế độ kiểm duyệt, `vankiep/README.md`): chọn giống loài, gọi thẳng một sự kiện hay quyết định theo mã trên trang duyệt, chơi lại, quay về trước quyết định để xem nhánh khác; tích "Hiện mã sự kiện trong nhật ký" để biết dòng nào do mục nào sinh ra.

**Đăng lại Cây Cốt Truyện** (khi mã game đổi; trang không nằm trong `duyet.sh` vì không có dữ liệu riêng): `bash tools/caytruyen.sh` → `review/out/caytruyen.html` và danh sách `review/out/caytruyen.files`; đăng bằng công cụ Artifact với `url` ở mục 1, `files` ánh xạ mỗi dòng của danh sách vào chính nó (giữ capability `db`). Ở máy mở thẳng `http://localhost:8765/vankiep/caytruyen.html` (liên kết `#seed~giống loài~vùng~xuất thân~r` mở lại đúng một mẫu).

**Đọc kết quả duyệt**: `ArtifactData` action `list`, collection `reviews`, `url` của trang. Sửa nguồn theo quyết định, rồi đăng lại trang để người dùng thấy bản mới.

## 3. Nội dung chưa có trang duyệt

Ghi ngày 15/10/2026. Hai trang Duyệt Nội Dung Vạn Kiếp và Duyệt Quái và Địa hình đã phủ sự kiện quốc gia, hội, học viện, quý tộc, thăng tiến, sinh kế, công trình, loài quái, biome, đặc trưng ô và kho tên. Còn thiếu:

| Nội dung | Ở đâu | Số lượng |
|---|---|---|
| Sự kiện đời người, quyết định | `vankiep/js/events.js`, `state.js`, `org.js`, `edu.js`, `noble.js` (`G.EVENTS`, `G.DECISIONS`) | ~70 sự kiện, ~37 quyết định (ghi 16/10/2026: tab Cây sự kiện chỉ hiện nhãn của chúng: chủ đề, danh phận, nối nhánh; câu chữ chưa có chỗ duyệt) |
| Vùng, vùng biển, tàu, nguyên nhân chết | `vankiep/data/world.js` (`G.REGIONS`, `G.SEAS`, `G.SHIPS`, `G.CAUSES`) | 16, 7, 3, 21 |
| Cấp quái, biến tố tinh anh, trạng thái quái gây ra | `shared/bestiary/rules.js` (`grades`, `affixes`, `playerStatuses`) | 4, 8, 7 |
| Cấu hình game Skeleton Codex | `shared/games/skeleton-codex.js` | 1 |

Các file `org.js`, `edu.js`, `noble.js`, `world.js`, `rules.js` đã nằm trong phạm vi một trang, nên `duyet.sh` chỉ báo "chưa trang nào hiện" khi file đổi mà dữ liệu trang không đổi (tức là phần đổi thuộc các dòng trên).
