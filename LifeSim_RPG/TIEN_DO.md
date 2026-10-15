# Vạn Kiếp: tiến độ và việc tiếp theo

**Cập nhật:** 15/10/2026 · **Commit mới nhất của bản đồ V2:** `49666d9` (bước 5) · **Đọc file này trước** khi được bảo "làm tiếp Vạn Kiếp".

Đang làm **bản đồ V2** theo `research/03_Thiet_ke_ban_do_Varen_V2.md` (thứ tự làm ở mục 12). Đã xong bước 1–5; **việc tiếp theo là bước 6: biển**.

## 1. Đã xong

| Bước | Nội dung | Commit | Kết quả đo ghi ở |
|---|---|---|---|
| Thiết kế | research/02 (phương án đã chọn), 03 (thiết kế), 04 (50 mẫu quốc gia), 05 (thành phố, làng mạc), `data/names.js` | `58263c6` | |
| 1 | Khung 1200 × 900; độ cao, ẩm, nhiệt; sông, hồ; 7 đặc trưng ô; chế độ xem Địa hình | `c20548c` | 03 mục 2.2–2.4 |
| 2 | Quốc gia từ mẫu, kinh đô, lãnh thổ, mạng khu dân cư phân cấp, tỉnh, dân, tên; chế độ xem Chính trị; nút Thế giới mới | `c20548c` | 05 mục 14 |
| 3 | 4 tầng nguy hiểm (thêm vùng chết) theo độ hoang; trận theo ô + địa hình; chế độ xem Nguy hiểm | `7f5ec62` | 03 mục 3.6 |
| 4 | Công trình → nghề, sức khỏe, học; thuế, thái độ chủng tộc; 21/22 luật | `470d291` | 03 mục 5.6 |
| 5 | Đường, cầu, đèo; hành trình A*, trạm biên giới, hộ tống | `49666d9` | 03 mục 6.5 |

Trang duyệt (claude.ai, lưu quyết định trong db, collection `reviews`):

- Duyệt Mẫu Quốc Gia: https://claude.ai/artifact/1FQFmmAroJsyVzVkgwp8W2; doc id `<kind>__<id>` (kind `tpl` / `quirk` / `law` / `gov`). **Đọc trước khi sửa `data/nations.js`.** Lúc ghi file này chưa có đánh dấu nào. Dựng lại: `tools/nation-data.html` (Edge headless `--dump-dom`) → thay `/*DATA*/null` trong `tools/nation-review.src.html`.
- Duyệt Cây Nghề (thư viện nghề): https://claude.ai/artifact/K36G3cQRbzHMALuN7q3SaK

## 2. Bản đồ mã nguồn

| File | Vai trò |
|---|---|
| `data/world.js` | chủng tộc, tầng lớp, sinh kế (`G.WORKS`: bld / role / town / land / guild / banLaw), 16 vùng × 4 khu, `G.TERRAIN` (lệch độ cao / ẩm / nhiệt, `no`, `wild`), `G.FEATURES`, `G.FEATURE_SPAWN`, `G.BAND_W`, nguyên nhân chết, `validateWorld` |
| `data/ecology.js` | 10 biome + 36 loài thêm vào bestiary thư viện (lược đồ: id, family, nameEn, nameVi, tier, size, behavior, aspect, hp, group, attack, marker không trùng, loot, habitat) |
| `data/nations.js` | `G.GOVS`, `G.LAWS`, `G.RACE_SETTLE`, `G.BUILDINGS`, `G.NATION_TEMPLATES` (50), `G.QUIRKS` |
| `data/names.js` | kho tên `G.NAMES` |
| `js/map.js` | `G.buildMap` (raster 300 × 225, ô 4px), `G.minHeap`, `G.renderMapBase(map, mode, realm, opt)` (region / terrain / political / danger), `G.renderRoads`, `G.drawMap` |
| `js/realm.js` | `G.buildRealm(map, seed)` → nước, khu dân cư (`s.bld`, `s.roles`), tỉnh, đường (`road`, `roads`, `bridges`, `passes`), độ hoang (`wild`, `band`, `bandCells`); `G.useWorld(seed)`, `G.SET`, `G.settlementsIn`, `G.mainSettlement`, `G.zoneCells`, `G.firstZone`, `G.homePos`, `G.nationAtPos`, `G.personName` |
| `js/life.js` | `Sim`: newLife (sinh ở khu dân cư, thành thị / nông thôn), endYear, deathProb, pickCause, zonesFor, encounterTable (Tier ≤ t + 1, nhân `FEATURE_SPAWN`), rollEncounter (theo ô), hunt, fight |
| `js/systems.js` | hệ con cuối năm: world (mật độ quái 4 tầng, dịch, chiến tranh vùng), family, health, undead, career, **law** (thêm từ state.js), place, peers |
| `js/events.js` | sự kiện, quyết định (work, migrate…) |
| `js/state.js` | `G.here`, `G.lawHere`, `G.attitude`, hệ số công trình, `G.incomeMult`, `G.workOK`, `G.workFee`, `G.caught`, `G.deport`, `G.lawYear`, quyết định nghĩa vụ, 8 sự kiện luật |
| `js/travel.js` | `G.findRoute` (A*, bảng chi phí tính sẵn `realm._tc`), `G.planTrip`, `G.moveTo` (hành trình, trạm, hộ tống, đi thuyền theo `G.SEA_ROUTES`) |
| `js/ui.js` | giao diện; bản lưu `vankiep.save.v3`, mộ `vankiep.graves.v3`, thế giới `vankiep.world.v1` |
| `sim.html` | 1000 đời headless + kiểm dữ liệu + tóm tắt thế giới; nút Thử nhiều thế giới |

## 3. Bước 6: biển (việc tiếp theo)

Thiết kế: `research/03` mục 7 (vùng biển 7.1, loài 7.2, tàu và hải trình 7.3) và tầng 4 ở 3.4. Kế hoạch đề xuất:

1. **Loài biển mới** trong `data/ecology.js`, đủ lược đồ bestiary (attack, marker không trùng, loot, habitat): Sứa Đèn T0, Cá Chình Điện T1, Hải Cẩu Nanh T1, Rùa Lưng Đá T2, Mực Khổng Lồ T3, Hải Long Băng T4, Cá Voi Xương T5 (nháp ở 03 mục 7.2). Cá Voi Xương lấp chỗ thiếu T5 của `hai_xa_3`; nên thêm một họ nữa cho `hac_uyen_3` (đang chỉ 1 họ). Có thể cần biome biển mới trong `ecology.js` cho bestiary.
2. **Vùng biển**: 7 điểm neo trên biển (Voronoi chỉ trên ô biển, `map.region === 255`); tên từ `G.NAMES.geo.sea`; mỗi vùng biển 4 tầng theo độ hoang biển `w = map.shore / 5 − (gần cảng ? .6 : 0)` (03 mục 7.1; `map.shore` đã có, trần 40). Bảng loài theo kiểu vùng biển, kiểm như khu đất trong `validateWorld` (`hi − lo ≤ 2`, có loài cho mọi Tier vào được).
3. **Cảng và tàu**: cảng = khu dân cư có vai trò `port`; ba loại tàu (thuyền chài ven bờ; tàu buôn ven bờ + khơi ở thị trấn trở lên; tàu viễn dương tới tầng sâu ở thủ đô ven biển, nước có đặc tính Tàu lá E4 hoặc đặc trưng Cảng lớn). Hải trình A* trên ô biển, tránh tầng tàu không vào được và tầng bị khóa với nhân vật.
4. **Hành trình qua biển** trong `js/travel.js`: thay tuyến biển cố định `G.SEA_ROUTES` bằng hải trình tự sinh; chuyến đi = đất → cảng → biển → cảng → đất khi rẻ hơn hoặc khi đích là đảo; gặp quái theo tầng biển; sự kiện bão (theo mùa, vùng biển), cướp biển (nhiều hơn gần nước có `raid_law`, M4 Liên Minh Cướp Biển), đắm tàu dạt vào bờ.
5. **Đời người**: ngư dân rủi ro theo tầng biển ven bờ gần nhất, thủy thủ theo tầng khơi; luật `sea_toll` (phí cập cảng, cảng giàu hơn); nguyên nhân chết đắm tàu.
6. **Giao diện**: chế độ xem Biển (vùng biển, tầng, hải trình từ cảng gần nhất), hoặc gộp vào Nguy hiểm; tooltip ô biển.
7. **Kiểm tra**: `sim.html` 1000 đời (0 trận vượt Tier + 1, chết trên biển), 100 thế giới (0 lỗi), ghi kết quả vào `research/03` mục 7.4 và đánh ✓ bước 6 ở mục 12; cập nhật `README.md` và file này.

Sau bước 6: bước 7 quốc gia động, 8 hang ổ / di tích, 9 lập làng / lập nước, 10 sự kiện cho đặc tính và đặc trưng (bảng ở 03 mục 12).

## 4. Việc lẻ đang treo

- Người dùng từng nói muốn chỉnh bản đồ Địa hình nhưng chưa nói chỉnh gì (ngưỡng ở `G.MAP_TH` trong `js/map.js`, lệch biome ở `G.TERRAIN`).
- Trang Duyệt Mẫu Quốc Gia chưa có đánh dấu.
- Cảnh báo dữ liệu: `hai_xa_3`, `hac_uyen_3` chỉ một họ quái.
- ~40 cảnh báo "đất chật" trên 100 thế giới (nước bị kẹp không đặt đủ làng / thôn / thị trấn).
- Mật độ quái vẫn theo vùng × tầng (thiết kế muốn tỉnh × tầng, làm ở bước 7). Bảng loài khai theo vùng, chưa tách sang biome.
- Còn chốt ở 03 mục 13 (duyệt tên, biome cố định hay theo seed, lập nước chọn mẫu chủng tộc khác).
- Remote `origin` (máy chủ công ty) chưa push từ bước 1; chỉ push lên `github` khi người dùng bảo.

## 5. Cách làm việc đã dùng

- **Mỗi bước**: code → mở `sim.html` (1000 đời, thế giới `can-bang`) → luật Tier phải là "không trận nào quá Tier + 1"; xem tỉ lệ trỗi dậy (~20%), chết vì quái (~10%), sinh kế, bảng luật / hành trình → thử 100 thế giới (0 lỗi) → ghi kết quả + chỗ khác thiết kế vào `research/03` → cập nhật `README.md` → hỏi người dùng trước khi commit; commit message tiếng Việt, kết bằng dòng Co-Authored-By; push lên `github` (`main` theo dõi `github/main`).
- **Chạy**: cấu hình `vankiep` trong `.claude/launch.json` (server tĩnh PowerShell cổng 8765); game `http://localhost:8765/LifeSim_RPG/index.html?world=<seed>`, sim `.../sim.html`.
- **Trình duyệt trong app**: lệnh JS chạy lâu hơn ~10 giây báo lỗi hoặc treo tab; tab chạy ngầm bị hãm bộ đếm giờ. Thử nhiều thế giới thì gọi `G.buildRealm` theo đợt ~10 thế giới mỗi lệnh. Nhớ đặt lại kích thước khung (preset desktop) sau khi phóng to.
- **Sửa file**: file trong repo dùng CRLF (git `core.autocrlf=true`); khi chèn bằng perl/heredoc cẩn thận `$(`… bị shell thay; Python không có trên máy, `cscript` (JScript) kiểm được cú pháp file dữ liệu ES3.
- **Không sửa** `library/`. Văn bản tiếng Việt tự nhiên (skill viết tiếng Việt), không dùng gạch ngang dài trong văn xuôi.
