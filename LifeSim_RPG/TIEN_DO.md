# Vạn Kiếp: tiến độ và việc tiếp theo

**Cập nhật:** 15/10/2026 · **Commit mới nhất của bản đồ V2:** `6f113ff` (bước 6) · **Đọc file này trước** khi được bảo "làm tiếp Vạn Kiếp".

Đang làm **bản đồ V2** theo `research/03_Thiet_ke_ban_do_Varen_V2.md` (thứ tự làm ở mục 12). Đã xong bước 1–6; **việc tiếp theo là bước 7: quốc gia động**.

## 1. Đã xong

| Bước | Nội dung | Commit | Kết quả đo ghi ở |
|---|---|---|---|
| Thiết kế | research/02 (phương án đã chọn), 03 (thiết kế), 04 (50 mẫu quốc gia), 05 (thành phố, làng mạc), `data/names.js` | `58263c6` | |
| 1 | Khung 1200 × 900; độ cao, ẩm, nhiệt; sông, hồ; 7 đặc trưng ô; chế độ xem Địa hình | `c20548c` | 03 mục 2.2–2.4 |
| 2 | Quốc gia từ mẫu, kinh đô, lãnh thổ, mạng khu dân cư phân cấp, tỉnh, dân, tên; chế độ xem Chính trị; nút Thế giới mới | `c20548c` | 05 mục 14 |
| 3 | 4 tầng nguy hiểm (thêm vùng chết) theo độ hoang; trận theo ô + địa hình; chế độ xem Nguy hiểm | `7f5ec62` | 03 mục 3.6 |
| 4 | Công trình → nghề, sức khỏe, học; thuế, thái độ chủng tộc; 21/22 luật | `470d291` | 03 mục 5.6 |
| 5 | Đường, cầu, đèo; hành trình A*, trạm biên giới, hộ tống | `49666d9` | 03 mục 6.5 |
| 6 | 7 vùng biển × 4 tầng, 8 loài biển, bến và 3 loại tàu, hải trình A*, đi tàu (bão, đắm tàu, cướp biển, cách ly, thuế cảng), nghề biển theo tầng, đảo Hải Xà tách hẳn; chế độ xem Biển | `6f113ff` | 03 mục 7.4 |

Bước 6 đổi nhẹ bản đồ đất (eo biển quanh đảo) nên thế giới `can-bang` giờ ra 7 nước, 163 khu dân cư; số đo bước 1–5 trong research là của bản đồ cũ.

Trang duyệt (claude.ai, lưu quyết định trong db, collection `reviews`):

- Duyệt Mẫu Quốc Gia: https://claude.ai/artifact/1FQFmmAroJsyVzVkgwp8W2; doc id `<kind>__<id>` (kind `tpl` / `quirk` / `law` / `gov`). **Đọc trước khi sửa `data/nations.js`.** Lúc ghi file này chưa có đánh dấu nào. Dựng lại: `tools/nation-data.html` (Edge headless `--dump-dom`) → thay `/*DATA*/null` trong `tools/nation-review.src.html`.
- Duyệt Cây Nghề (thư viện nghề): https://claude.ai/artifact/K36G3cQRbzHMALuN7q3SaK

## 2. Bản đồ mã nguồn

| File | Vai trò |
|---|---|
| `data/world.js` | chủng tộc, tầng lớp, sinh kế (`G.WORKS`: bld / role / town / land / guild / banLaw / seaBand), 16 vùng × 4 khu, **`G.SEAS` (7 vùng biển × 4 tầng, thời tiết), `G.SEA_BAND_W`, `G.SHIPS`**, `G.TERRAIN` (lệch độ cao / ẩm / nhiệt, `no`, `wild`), `G.FEATURES`, `G.FEATURE_SPAWN`, `G.BAND_W`, nguyên nhân chết (có `shipwreck`), `validateWorld` (kiểm cả vùng đất và vùng biển) |
| `data/ecology.js` | 10 biome + 44 loài thêm vào bestiary thư viện (8 loài biển cuối danh sách) |
| `data/nations.js` | `G.GOVS`, `G.LAWS`, `G.RACE_SETTLE`, `G.BUILDINGS`, `G.NATION_TEMPLATES` (50), `G.QUIRKS` |
| `data/names.js` | kho tên `G.NAMES` |
| `js/map.js` | `G.buildMap` (raster 300 × 225, ô 4px; eo biển quanh đảo; `map.sea` vùng biển từng ô, `map.seaLabel`, `map.seaAt`), `G.minHeap`, `G.renderMapBase(map, mode, realm, opt)` (region / terrain / political / danger / sea), `G.renderRoads`, `G.drawMap` (bến, tên vùng biển, hải trình ở chế độ Biển) |
| `js/realm.js` | `G.buildRealm(map, seed)` → nước, khu dân cư (`s.bld`, `s.roles`; bến: `s.ship`, `s.seaCells`, `s.mass`, `s.comp`), tỉnh, đường, độ hoang (`wild`, `band`, `bandCells`), **biển (`mass`, `mainMass`, `harbors`, `seas`, `seaWild`, `seaBand`, `seaBandCells`)**; `G.useWorld(seed)`, `G.SET`, `G.settlementsIn`, `G.mainSettlement`, `G.zoneCells` (cả tầng biển), `G.seaZoneAt`, `G.seaOf`, `G.firstZone`, `G.homePos`, `G.nationAtPos`, `G.personName` |
| `js/life.js` | `Sim`: newLife, endYear, deathProb, pickCause, zonesFor, encounterTable (Tier ≤ t + 1, nhân `FEATURE_SPAWN`), rollEncounter (theo ô, cả ô biển), hunt, fight, workYear (nghề biển); `G.ZONE` có cả tầng biển (`sea: true`), `G.SEA` |
| `js/systems.js` | hệ con cuối năm: world (mật độ quái 4 tầng, mật độ quái biển, dịch, chiến tranh vùng), family, health, undead, career, **law** (thêm từ state.js), place, peers |
| `js/events.js` | sự kiện, quyết định (work, migrate…) |
| `js/state.js` | `G.here`, `G.lawHere`, `G.attitude`, hệ số công trình, `G.incomeMult` (có thuế cảng), `G.workOK`, `G.workFee`, `G.seaWork`, `G.caught`, `G.deport`, `G.lawYear`, quyết định nghĩa vụ, 8 sự kiện luật |
| `js/travel.js` | A* chung (`g` phải là Float64), `G.findRoute` (đường bộ, bảng chi phí `realm._tc`), `G.findSeaRoute` (hải trình, cache `realm._sea`), `G.planTrip` (bộ hoặc đất → bến → biển → bến → đất), `G.tripText`, `G.moveTo` (đi bộ, đi tàu: quái biển, bão, đắm tàu, cướp biển, cách ly, thuế cảng), `G.seaLinesFrom` |
| `js/ui.js` | giao diện; bản lưu `vankiep.save.v3`, mộ `vankiep.graves.v3`, thế giới `vankiep.world.v1`; chú giải bản đồ theo chế độ (`LEGEND`) |
| `sim.html` | 1000 đời headless + kiểm dữ liệu + tóm tắt thế giới + bảng Đi biển; nút Thử nhiều thế giới; `?noauto` chỉ nạp, không tự chạy |

## 3. Bước 7: quốc gia động (việc tiếp theo)

Thiết kế: `research/03` mục 5.3 (sức mạnh, ổn định, tuyên chiến, diễn biến, nổi loạn, sáp nhập, diệt vong, sử biên niên), 3.5 (mật độ quái theo tỉnh × tầng), 3.3 cuối (văn minh lan, hoang dã lấn), mục 11 (save). Kế hoạch đề xuất:

1. **Trạng thái động trong `S.world`**: chủ từng tỉnh, ổn định, chiến tranh / hưu chiến giữa các nước, trạng thái khu dân cư (`hp`, `dwindling`, phế tích), sử biên niên (300 dòng cuối). Thế giới tĩnh vẫn dựng từ seed; đời chỉ lưu phần đổi.
2. **Hệ con `nations`** trong `js/systems.js` (sau `world`): sức mạnh, ổn định, tuyên chiến giữa nước giáp nhau (chung biên tỉnh, hoặc hai cảng có hải trình: dùng `harbors` + `comp` của bước 6), diễn biến, chiếm tỉnh, hưu chiến, nổi loạn, sáp nhập đất vô chủ, diệt vong, lan can 3–9 nước. Thay chiến tranh theo vùng hiện tại (`rs.war`) bằng chiến tranh theo tỉnh.
3. **Đổi chủ tỉnh → bản đồ**: `owner` theo tỉnh, vẽ lại Chính trị; luật, thuế, thái độ theo nước mới (`G.here`).
4. **Khu dân cư sụp / lập**: thú triều, chiến tranh làm giảm `hp`; sụp thành phế tích; làng mới mọc ven sông. **Độ hoang động**: tính lại nguồn văn minh của khu đổi trạng thái (cache theo nguồn, `research/03` mục 3.3), đường xuống cấp khi làng bỏ hoang trên 20 năm.
5. **Mật độ quái theo tỉnh × tầng** (khóa `tinh:ven`…), thú triều đánh khu dân cư của tỉnh.
6. **Đời người**: lính nghĩa vụ chết trận khi tỉnh là tiền tuyến, sự kiện quê đổi chủ, nổi loạn, vua băng hà; thẻ Biên niên sử trên giao diện.
7. **Kiểm tra**: `sim.html` thêm số đo của mục 10 (số nước sau 300 năm trung vị 5–7, tỉnh đổi chủ 3–8 / 100 năm, khu dân cư sụp / lập 1–3 / 100 năm); 1000 đời (0 trận vượt Tier + 1), 100 thế giới (0 lỗi); ghi vào `research/03` mục 5.7 mới, đánh ✓ bước 7; cập nhật `README.md` và file này.

Sau bước 7: bước 8 hang ổ / di tích, 9 lập làng / lập nước, 10 sự kiện cho đặc tính và đặc trưng (bảng ở 03 mục 12).

## 4. Việc lẻ đang treo

- Người dùng từng nói muốn chỉnh bản đồ Địa hình nhưng chưa nói chỉnh gì (ngưỡng ở `G.MAP_TH` trong `js/map.js`, lệch biome ở `G.TERRAIN`).
- Trang Duyệt Mẫu Quốc Gia chưa có đánh dấu.
- **Vũng biển kín** trong lục địa (từ bước 1): bến ở đó không có hải trình. Giữ là biển hay đổi thành hồ (đổi thì sông, độ ẩm đổi theo).
- Ít người đi tàu (2,2% đời): đi biển 0,6 mỗi ô theo thiết kế, chỉ rẻ hơn đường bộ khi phải vòng xa. Nếu muốn biển quan trọng hơn thì hạ chi phí ô biển hoặc cho thương nhân, thủy thủ đi tàu khi di cư.
- Thiếu loài T5 cho vùng chết sa mạc và đầm (03 mục 13).
- ~40 cảnh báo "đất chật" trên 100 thế giới (nước bị kẹp không đặt đủ làng / thôn / thị trấn).
- Mật độ quái vẫn theo vùng × tầng (thiết kế muốn tỉnh × tầng, làm ở bước 7). Bảng loài khai theo vùng, chưa tách sang biome.
- Còn chốt ở 03 mục 13 (duyệt tên, biome cố định hay theo seed, lập nước chọn mẫu chủng tộc khác).
- Remote `origin` (máy chủ công ty) chưa push từ bước 1; chỉ push lên `github` khi người dùng bảo.

## 5. Cách làm việc đã dùng

- **Mỗi bước**: code → mở `sim.html` (1000 đời, thế giới `can-bang`) → luật Tier phải là "không trận nào quá Tier + 1"; xem tỉ lệ trỗi dậy (~20%), chết vì quái (~10%), sinh kế, bảng luật / hành trình / đi biển → thử 100 thế giới (0 lỗi) → ghi kết quả + chỗ khác thiết kế vào `research/03` → cập nhật `README.md` → hỏi người dùng trước khi commit; commit message tiếng Việt, kết bằng dòng Co-Authored-By; push lên `github` (`main` theo dõi `github/main`).
- **Chạy**: cấu hình `vankiep` trong `.claude/launch.json` (server tĩnh PowerShell cổng 8765); nếu phiên khác đang giữ cổng đó thì dùng `vankiep-2` (cổng 8766; công cụ có thể báo cổng khác, cứ mở thẳng `http://localhost:8766/...`). Game `http://localhost:8765/LifeSim_RPG/index.html?world=<seed>`, sim `.../sim.html`, `.../sim.html?noauto` để thử từng phần trong console.
- **Trình duyệt trong app**: lệnh JS chạy lâu hơn ~10 giây báo lỗi ("Internal error") hoặc treo tab; tab chạy ngầm bị hãm bộ đếm giờ. Thử nhiều thế giới thì gọi `G.buildRealm` theo đợt ~10–25 thế giới mỗi lệnh. Lệnh bị ngắt giữa chừng có thể để bộ đệm A* bẩn: nạp lại trang trước khi đo tiếp. Ảnh chụp nhỏ thì tạm cho canvas `#map` phủ toàn trang bằng `style.cssText`. Nhớ đặt lại kích thước khung (preset desktop) sau khi phóng to.
- **Sửa file**: file trong repo dùng CRLF trong thư mục làm việc (git `core.autocrlf=true`, index LF); perl với chữ tiếng Việt trong mẫu thì **không** dùng `-CSD` (khớp theo byte); khi chèn bằng perl/heredoc cẩn thận `$(`… bị shell thay; Python, Node không có trên máy, `cscript` (JScript) kiểm được cú pháp file dữ liệu ES3.
- **A\***: mảng chi phí đã đi phải là `Float64Array` (xem 03 mục 7.4).
- **Không sửa** `library/`. Văn bản tiếng Việt tự nhiên (skill viết tiếng Việt), không dùng gạch ngang dài trong văn xuôi.
